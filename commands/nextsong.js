const fs = require('fs')

module.exports = {
  main: (bot, msg, settings) => {
    fs.readFile('./songlist.json', (err, data) => {
      if (err) throw (err)
      var jsonf = JSON.parse(data)
      var song = jsonf.songlist.splice(0, 1)
      fs.writeFile('./songlist.json', JSON.stringify(jsonf), (err) => {
        if (err) {
          console.log(err)
          msg.reply(msg.author.username + ' Error.')
        }
        msg.reply(' the song is: ' + song[0].song + ' by ' +
          song[0].author + '; requested by @' + song[0].username)
      })
    })
  },
  args: '',
  help: 'Display the nex song (and remove it form the list).',
  hide: false
}
