const fs = require('fs')

module.exports = {
  main: (bot, msg, settings) => {
    var content = msg.content.split(',')
    bot.songlist.push({
      username: msg.author.username,
      song: content[0].trim(),
      author: content[1].trim(),
      played: false
    })
  },
  args: `'<string>' '<string>'`,
  help: 'Send a song to the song request list',
  hide: false
}