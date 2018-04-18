const fs = require('fs')
// const http = require('http')
const utils = require('./utils/songSimilarity')

module.exports = {
  songrequest: function (channel, user, msg, next) {
    fs.readFile('./songlist.json', (err, data) => {
      if (!err && msg.length === 2) {
        var jsonf = JSON.parse(data)
        utils.getSong(msg[0].trim(), msg[1].trim(), (author, music) => {
          console.log(author, music, !author && !music)
          if (author) {
            jsonf.songlist.push({
              username: user + '[TWITCH]',
              song: music,
              author: author
            })
            fs.writeFile('./songlist.json', JSON.stringify(jsonf), (err) => {
              if (err) {
                console.log(err)
                next('@' + user + ' make sure the format is correct: !songrequest <song>, <author>. You can also contact @Gysco.')
              }
              next('@' + user + ' your song as been added to the list.')
            })
          } else if (!author && !music) next('@' + user + ' make sure the song is in the list (!musicstream).')
        })
      } else if (msg.length !== 2) {
        next('@' + user + ' make sure the format is correct: !songrequest <song>, <author>. You can also contact @Gysco.')
      } else console.log(err)
    })
  },
  nextsong: function (channel, user, msg, next) {
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
        if (user.toLowerCase() === channel.replace('#', '') || user.toLowerCase() === 'gysco' || user.toLowerCase() === '_stagma') {
          var jsonf = JSON.parse(data)
          var song = jsonf.songlist.splice(0, 1)
          if (song.length === 0) return
          fs.writeFile('./songlist.json', JSON.stringify(jsonf), (err) => {
            if (err) {
              console.log(err)
              next('@' + user + ' Error.')
            }
            next('@' + user + ' the song is: ' + song[0].song + ' by ' +
              song[0].author + '; requested by @' + song[0].username)
          })
        }
      } else console.log(err)
    })
  }
}
