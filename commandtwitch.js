const fs = require('fs')
// const http = require('http')
const utils = require('./utils/songSimilarity')
var config = JSON.parse(fs.readFileSync('./config.json'))

function getMostRequested(jsonf, isPleb) {
  var index = 0
  if (jsonf.songlist.length === 0) return -1
  for (var i = 0; i < jsonf.songlist.length; i++) {
    if (!jsonf.songlist[i].played && jsonf.songlist[index].requests < jsonf.songlist[i].requests) index = i
  }
  jsonf.songlist[index].played = !isPleb
  jsonf.songlist[index].requests = isPleb ? jsonf.songlist[index].requests : -1
  return index
}

function updateJSON(user, author, music, jsonf) {
  for (var i = 0; i < jsonf.songlist.length; i++) {
    if (jsonf.songlist[i].song === music && jsonf.songlist[i].author === author && jsonf.songlist[i].username.indexOf(user) >= 0) {
      return (' you already requested this song.')
    }
    if (jsonf.songlist[i].song === music && jsonf.songlist[i].author === author && jsonf.songlist[i].username.indexOf(user) < 0) {
      jsonf.songlist[i].username.push(user)
      jsonf.songlist[i].requests = (!jsonf.songlist[i].played ? jsonf.songlist[i].requests + 1 : jsonf.songlist[i].requests)
      return (jsonf.songlist[i].played ? ' the song has already been played.' : ' the song ' + music + ', ' + author + ' has now ' + jsonf.songlist[i].requests + ' requests')
    }
  }
  jsonf.songlist.push({
    username: [user],
    song: music,
    author: author,
    played: false,
    requests: 1
  })
  return ' your song as been added to the list.'
}

function songrequester(channel, user, msg, next) {
  fs.readFile('./songlist.json', (err, data) => {
    if (!err && msg.length === 2) {
      var jsonf = JSON.parse(data)
      utils.getSong(msg[0].trim(), msg[1].trim(), (author, music) => {
        if (author) {
          var updatedString = updateJSON(user, author, music, jsonf)
          fs.writeFile('./songlist.json', JSON.stringify(jsonf), (err) => {
            if (err) {
              console.log(err)
              next('@' + user + ' make sure the format is correct: !songrequest <song>, <author>. You can also contact @Gysco.')
            } else next('@' + user + updatedString)
          })
        } else next('@' + user + ' make sure the song is in the list (!musicstream).')
      })
    } else if (msg.length !== 2) {
      next('@' + user + ' make sure the format is correct: !songrequest <song>, <author>. You can also contact @Gysco.')
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
      if (user.toLowerCase() === channel.replace('#', '') || config.twitch_config.mods.indexOf(user.toLowerCase()) >= 0) {
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
      if (user.toLowerCase() === channel.replace('#', '') || config.twitch_config.mods.indexOf(user.toLowerCase()) >= 0) {
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
  if (msg) next('@' + msg + ' is a nem. minsteDerp')
  else next('@' + user + ' is a nem. minsteDerp')
}

module.exports = {
  songrequest: songrequester,
  sr: songrequester,
  nextsong: nextsong,
  ns: nextsong,
  clearlist: clearlist,
  cl: clearlist,
  nem: nem
}
