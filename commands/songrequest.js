const fs = require('fs')

module.exports = {
  main: (bot, msg, settings) => {
    fs.readFile('./songlist.json', (err, data) => {
      if (err) throw (err)
      var jsonf = JSON.parse(data)
      var content = msg.content.split(',')
      jsonf.songlist.push({
        username: msg.author.username,
        song: content[0].trim(),
        author: content[1].trim()
      })
      fs.writeFile('./songlist.json', JSON.stringify(jsonf), err => {
        if (err) throw err
        msg.reply('Song added.')
      })
    })
  },
  args: `'<string>' '<string>'`,
  help: 'Send a song to the song request list',
  hide: false
}
