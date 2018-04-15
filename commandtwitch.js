const fs = require('fs')

module.exports = {
  songrequest: function (user, msg, next) {
    fs.readFile('./songlist.json', (err, data) => {
      if (err) throw (err)
      if (msg.length() !== 2) next('@' + user + ' make sure the format is correct. You can also contact @Gysco.')
      var jsonf = JSON.parse(data)
      jsonf.songlist.push({
        username: user + '[TWITCH]',
        song: msg[0].trim(),
        author: msg[1].trim()
      })
      fs.writeFile('./songlist.json', JSON.stringify(jsonf), (err) => {
        if (err) {
          console.log(err)
          next('@' + user + ' make sure the format is correct. You can also contact @Gysco.')
        }
        next('@' + user + ' your song as been added to the list.')
      })
    })
  },
  nextsong: function (user, msg, next) {
    fs.readFile('./songlist.json', (err, data) => {
      if (err) throw (err)
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
    })
  }
}
