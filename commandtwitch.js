const fs = require('fs');
// const http = require('http')
const utils = require('./utils/songSimilarity');
const config = JSON.parse(fs.readFileSync('./config.json'));

/**
 * Determine if the user is a channel admin
 * @param {String} user
 * @param {String} channel
 *
 * @return {Boolean}
 */
function isAdmin(user, channel) {
  return (user.toLowerCase() === channel.replace('#', '') ||
          config.twitch_config.mods.indexOf(user.toLowerCase()) >= 0);
}

/**
 * Return the index of the current song
 * @param {Object} jsonf
 *
 * @return {Number}
 */
function getCurrent(jsonf) {
  let index = 0;
  if (jsonf[channel].length === 0) return -1;
  for (let i = 0; i < jsonf[channel].length; i++) {
    if (jsonf[channel][i].current) index = i;
  }
  return index;
}
/**
 * Return the idex of the most requested song
 * @param {String} channel
 * @param {Object} jsonf
 * @param {Boolean} isReg
 *
 * @return {Number}
 */
function getMostRequested(channel, jsonf, isReg) {
  let index = 0;
  if (jsonf[channel].length === 0) return -1;
  jsonf[channel][getCurrent(jsonf)].current = isReg;
  for (let i = 0; i < jsonf[channel].length; i++) {
    if (!jsonf[channel][i].played && !jsonf[channel][i].disable
      && jsonf[channel][index].requests < jsonf[channel][i].requests) index = i;
  }
  jsonf[channel][index].current = !isReg;
  jsonf[channel][index].played = !isReg;
  jsonf[channel][index].requests = isReg ? jsonf[channel][index].requests : -1;
  return index;
}
/**
 * Update the JSON and return a message to output in Twitch chat.
 * @param {String} channel
 * @param {String} user
 * @param {String} author
 * @param {String} music
 * @param {Object} jsonf
 * @param {Boolean} disable
 *
 * @return {String}
 */
function updateJSON(channel, user, author, music, jsonf, disable) {
  if (jsonf[channel] === undefined) jsonf[channel] = [];
  for (let i = 0; i < jsonf[channel].length; i++) {
    if (jsonf[channel][i].song === music
      && jsonf[channel][i].author === author
      && jsonf[channel][i].username.indexOf(user) >= 0) {
      return (jsonf[channel][i].disable ?
        ' the song is disable for the stream.' :
        ' you already requested this song.');
    }
    if (jsonf[channel][i].song === music
      && jsonf[channel][i].author === author
      && jsonf[channel][i].disable) {
      return ' the song is disable for the stream.';
    }
    if (jsonf[channel][i].song === music
      && jsonf[channel][i].author === author
      && jsonf[channel][i].username.indexOf(user) < 0) {
      jsonf[channel][i].disable = disable;
      jsonf[channel][i].username.push(user);
      jsonf[channel][i].requests = (!jsonf[channel][i].played ?
        jsonf[channel][i].requests + 1 :
        jsonf[channel][i].requests);
      return (jsonf[channel][i].played ?
        ' the song has already been played.' :
        (disable ?
          ' the song ' + music + ', ' + author + ' is disable.' :
          ' the song ' + music + ', ' + author + ' has now '
          + jsonf[channel][i].requests + ' requests'));
    }
  }
  jsonf[channel].push({
    username: [user],
    song: music,
    author: author,
    played: disable,
    current: false,
    requests: disable ? -1 : 1,
    disable: disable,
  });
  return (disable ?
    ' the song has been disabled.' :
    ' your song as been added to the list.');
}

/**
 * Transform the user message input into a song and artist. Checking if those
 * two exist, then updating the JSON.
 * @param {String} channel
 * @param {String} user
 * @param {String} msg
 * @param {CallableFunction} next
 */
function songrequester(channel, user, msg, next) {
  fs.readFile('./songlist.json', (err, data) => {
    if (!err) {
      const jsonf = JSON.parse(data);
      utils.getSong(msg[0].trim(), msg.slice(1).join('-').trim(),
          (author, music, errSong) => {
            if (author) {
              const updatedString = updateJSON(channel, user, author, music,
                  jsonf, false);
              fs.writeFile('./songlist.json', JSON.stringify(jsonf), (err) => {
                if (err) {
                  console.log(err);
                  next('@' + user + ' an error happened, contact @Gysco.');
                } else next('@' + user + updatedString);
              });
            } else next('@' + user + errSong);
          });
    } else if (msg.length !== 2) {
      next('@' + user + ' make sure the format is correct:'
      + ' !sr <song> - <author> or !sr <author> - <song>. '
      + 'You can also contact @Gysco.');
    } else console.log(err);
  });
}
/**
 * Get the most requested song.
 * @param {String} user
 * @param {String} data
 * @param {Boolean} isReg
 * @param {CallableFunction} next
 */
function getrequest(user, data, isReg, next) {
  const jsonf = JSON.parse(data);
  const song = getMostRequested(jsonf, isReg);
  if (song === -1) return;
  const songDisplay = jsonf[channel][song];
  fs.writeFile('./songlist.json', JSON.stringify(jsonf), (err) => {
    if (err) {
      console.log(err);
      next('@' + user + ' Error.');
    } else {
      next('@' + user + ' the song is: ' + songDisplay.song + ' by '
          + songDisplay.author + '; requested by @' + songDisplay.username[0]);
    }
  });
}
/**
 * Display next song and skip to it ifuser is a channel admin.
 * @param {String} channel
 * @param {String} user
 * @param {String} msg
 * @param {CallableFunction} next
 */
function nextsong(channel, user, msg, next) {
  fs.readFile('./songlist.json', (err, data) => {
    if (!err) {
      // setInterval(() => {http.get('http://tmi.twitch.tv/group/user/' +
      //   channel.replace('#', '') + '/chatters', (res) => {var body = ''
      //   res.on('data', (chunk) => {body += chunk
      //     })
      //     res.on('end', () => {
      //       chatInfos = JSON.parse(body)
      //       if (!chatInfos.chatters['viewers'].includes(user.toLowerCase())
      //             || user.toLowerCase() === 'gysco') {
      //
      //     })
      //   })
      // }, 1800000)
      if (isAdmin(user, channel)) {
        getrequest(user, data, false, next);
      } else {
        getrequest(user, data, true, next);
      }
    } else console.log(err);
  });
}
/**
 * Clear the channel song queue.
 * @param {String} channel
 * @param {String} user
 * @param {String} msg
 * @param {CallableFunction} next
 */
function clearlist(channel, user, msg, next) {
  fs.readFile('./songlist.json', (err, data) => {
    if (!err) {
      if (isAdmin(user, channel)) {
        const jsonf = JSON.parse(data);
        jsonf[channel].length = 0;
        fs.writeFile('./songlist.json', JSON.stringify(jsonf), (err) => {
          if (err) {
            console.log(err);
            next('@' + user + ' Error.');
          } else next('@' + user + ' song queue has been cleared.');
        });
      }
    } else console.log(err);
  });
}

/**
 * Display a message from the bot.
 * @param {String} channel
 * @param {String} user
 * @param {String} msg
 * @param {CallableFunction} next
 */
function nem(channel, user, msg, next) {
  if (msg[0]) next('@' + msg[0].trim() + ' is a nem. minsteDerp');
  else next('@' + user + ' is a nem. minsteDerp');
}

/**
 * Get the uri for the song list.
 * @param {String} channel
 * @param {String} user
 * @param {String} msg
 * @param {CallableFunction} next
 */
function listsong(channel, user, msg, next) {
  const reply = ' You can find the list of song here: http://nemo.zbgn.fr';
  if (msg[0]) next('@' + msg[0].trim() + reply);
  else next('@' + user + reply);
}

/**
 * Get the current song.
 * @param {String} channel
 * @param {String} user
 * @param {String} msg
 * @param {CallableFunction} next
 */
function currentsong(channel, user, msg, next) {
  fs.readFile('./songlist.json', (err, data) => {
    if (!err) {
      const jsonf = JSON.parse(data);
      const i = getCurrent(jsonf);
      if (i >= 0) {
        const music = jsonf[channel][i];
        next('@' + user + ' the current song is: ' + music.song
            + ' by ' + music.author);
      } else {
        next('@' + user + ' there is no current song.');
      }
    } else console.log(err);
  });
}
/**
 * Disable a specific song!
 * @param {String} channel
 * @param {String} user
 * @param {String} msg
 * @param {CallableFunction} next
 */
function disable(channel, user, msg, next) {
  if (isAdmin(user, channel)) {
    fs.readFile('./songlist.json', (err, data) => {
      if (!err && msg.length === 2) {
        const jsonf = JSON.parse(data);
        utils.getSong(msg[0].trim(), msg.slice(1).join('-').trim(),
            (author, music, errSong) => {
              if (author) {
                const updatedString = updateJSON(channel, user, author, music,
                    jsonf, false);
                fs.writeFile('./songlist.json', JSON.stringify(jsonf),
                    (err) => {
                      if (err) {
                        console.log(err);
                        next('@' + user + ' an error happened,'
                            + 'contact @Gysco.');
                      } else next('@' + user + updatedString);
                    });
              } else next('@' + user + errSong);
            });
      } else if (msg.length !== 2) {
        next('@' + user + ' make sure the format is correct:'
            + ' !sr <song> - <author> or !sr <author> - <song>. '
            + 'You can also contact @Gysco.');
      } else console.log(err);
    });
  } else {
    next('@' + user + ' you are not permitted to disable a song.');
  }
}

module.exports = {
  songrequest: songrequester,
  sr: songrequester,
  nextsong: nextsong,
  ns: nextsong,
  clearlist: clearlist,
  cl: clearlist,
  nem: nem,
  currentsong: currentsong,
  cs: currentsong,
  disable: disable,
  d: disable,
  listsong: listsong,
  ls: listsong,
};
