const fs = require('fs')
// const http = require('http')
const utils = require('./utils/songSimilarity')
var config = JSON.parse(fs.readFileSync('./config.json'))

function isAdmin(user, channel) {
  return (user.toLowerCase() === channel.replace('#', '') || config.twitch_config.mods.indexOf(user.toLowerCase()) >= 0)
}

function getCurrent(jsonf) {
  var index = 0
  if (jsonf.songlist.length === 0) return -1
  for (var i = 0; i < jsonf.songlist.length; i++) {
    if (jsonf.songlist[i].current) index = i
  }
  return index
}

function getMostRequested(jsonf, isPleb) {
  var index = 0
  if (jsonf.songlist.length === 0) return -1
  jsonf.songlist[getCurrent(jsonf)].current = isPleb
  for (var i = 0; i < jsonf.songlist.length; i++) {
    if (!jsonf.songlist[i].played && !jsonf.songlist[i].disable && jsonf.songlist[index].requests < jsonf.songlist[i].requests) index = i
  }
  jsonf.songlist[index].current = !isPleb
  jsonf.songlist[index].played = !isPleb
  jsonf.songlist[index].requests = isPleb ? jsonf.songlist[index].requests : -1
  return index
}

function updateJSON(user, author, music, jsonf, disable) {
  for (var i = 0; i < jsonf.songlist.length; i++) {
    if (jsonf.songlist[i].song === music && jsonf.songlist[i].author === author && jsonf.songlist[i].username.indexOf(user) >= 0) {
      return jsonf.songlist[i].disable ? ' the song is disable for the stream.' : ' you already requested this song.'
    }
    if (jsonf.songlist[i].song === music && jsonf.songlist[i].author === author && jsonf.songlist[i].disable) {
      return ' the song is disable for the stream.'
    }
    if (jsonf.songlist[i].song === music && jsonf.songlist[i].author === author && jsonf.songlist[i].username.indexOf(user) < 0) {
      jsonf.songlist[i].disable = disable
      jsonf.songlist[i].username.push(user)
      jsonf.songlist[i].requests = (!jsonf.songlist[i].played ? jsonf.songlist[i].requests + 1 : jsonf.songlist[i].requests)
      return (jsonf.songlist[i].played ? ' the song has already been played.' : (disable ? ' the song ' + music + ', ' + author + ' is disable.' : ' the song ' + music + ', ' + author + ' has now ' + jsonf.songlist[i].requests + ' requests'))
    }
  }
  jsonf.songlist.push({
    username: [user],
    song: music,
    author: author,
    played: disable,
    current: false,
    requests: disable ? -1 : 1,
    disable: disable
  })
  return disable ? ' the song has been disabled.' : ' your song as been added to the list.'
}

function songrequester(channel, user, msg, next) {
  fs.readFile('./songlist.json', (err, data) => {
    if (!err && msg.length === 2) {
      var jsonf = JSON.parse(data)
      utils.getSong(msg[0].trim(), msg[1].trim(), (author, music) => {
        if (author) {
          var updatedString = updateJSON(user, author, music, jsonf, false)
          fs.writeFile('./songlist.json', JSON.stringify(jsonf), (err) => {
            if (err) {
              console.log(err)
              next('@' + user + ' make sure the format is correct: !songrequest <song> - <author>. You can also contact @Gysco.')
            } else next('@' + user + updatedString)
          })
        } else next('@' + user + ' make sure the song is in the list (!musicstream).')
      })
    } else if (msg.length !== 2) {
      next('@' + user + ' make sure the format is correct: !songrequest <song> - <author>. You can also contact @Gysco.')
    } else console.log(err)
  })
}

function getrequest(user, data, isPleb, next) {
  var jsonf = JSON.parse(data)
  var song = getMostRequested(jsonf, isPleb)
  if (song === -1) return
  var songDisplay = jsonf.songlist[song]
  fs.writeFile('./songlist.json', JSON.stringify(jsonf), (err) => {
    if (err) {
      console.log(err)
      next('@' + user + ' Error.')
    } else next('@' + user + ' the song is: ' + songDisplay.song + ' by ' + songDisplay.author + '; requested by @' + songDisplay.username[0])
  })
}

function nextsong(channel, user, msg, next) {
  fs.readFile('./songlist.json', (err, data) => {
    if (!err) {
      // setInterval(() => {
      //   http.get('http://tmi.twitch.tv/group/user/' + channel.replace('#', '') + '/chatters', (res) => {
      //     var body = ''
      //     res.on('data', (chunk) => {
      //       body += chunk
      //     })
      //     res.on('end', () => {
      //       chatInfos = JSON.parse(body)
      //       if (!chatInfos.chatters['viewers'].includes(user.toLowerCase()) || user.toLowerCase() === 'gysco') {
      //
      //     })
      //   })
      // }, 1800000)
      if (isAdmin(user, channel)) {
        getrequest(user, data, false, next)
      } else {
        getrequest(user, data, true, next)
      }
    } else console.log(err)
  })
}

function clearlist(channel, user, msg, next) {
  fs.readFile('./songlist.json', (err, data) => {
    if (!err) {
      if (isAdmin(user, channel)) {
        var jsonf = JSON.parse(data)
        jsonf.songlist.length = 0
        fs.writeFile('./songlist.json', JSON.stringify(jsonf), (err) => {
          if (err) {
            console.log(err)
            next('@' + user + ' Error.')
          } else next('@' + user + ' song queue has been cleared.')
        })
      }
    } else console.log(err)
  })
}

function nem(channel, user, msg, next) {
  if (msg[0]) next('@' + msg[0].trim() + ' is a nem. minsteDerp')
  else next('@' + user + ' is a nem. minsteDerp')
}

function listsong(channel, user, msg, next) {
  if (msg[0]) next('@' + msg[0].trim() + ' You can find the list of song here: http://nemo.zbgn.fr')
  else next('@' + user + ' You can find the list of song here: http://nemo.zbgn.fr')
}

function currentsong(channel, user, msg, next) {
  fs.readFile('./songlist.json', (err, data) => {
    if (!err) {
      const jsonf = JSON.parse(data)
      var i = getCurrent(jsonf)
      if (i >= 0) {
        const music = jsonf.songlist[i]
        next('@' + user + ' the current song is: ' + music.song + ' by ' + music.author)
      } else {
        next('@' + user + ' there is no current song.')
      }
    } else console.log(err)
  })
}

function disable(channel, user, msg, next) {
  if (isAdmin(user, channel)) {
    fs.readFile('./songlist.json', (err, data) => {
      if (!err && msg.length === 2) {
        var jsonf = JSON.parse(data)
        utils.getSong(msg[0].trim(), msg[1].trim(), (author, music) => {
          if (author) {
            var updatedString = updateJSON(user, author, music, jsonf, true)
            fs.writeFile('./songlist.json', JSON.stringify(jsonf), (err) => {
              if (err) {
                console.log(err)
                next('@' + user + ' make sure the format is correct: !songrequest <song> - <author>. You can also contact @Gysco.')
              } else next('@' + user + updatedString)
            })
          } else next('@' + user + ' make sure the song is in the list (!musicstream).')
        })
      } else if (msg.length !== 2) {
        next('@' + user + ' make sure the format is correct: !songrequest <song> - <author>. You can also contact @Gysco.')
      } else console.log(err)
    })
  } else {
    next('@' + user + ' you are not permitted to disable a song.')
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
  ls: listsong
}
