const songs = require('../songs')

module.exports = {
  main: (bot, msg, settings) => {
    var content = msg.content.split(',')
    songs.requested(msg.author.username, content[0].trim(), content[1].trim())
  },
  args: `'<string>' '<string>'`,
  help: 'Send a song to the song request list',
  hide: false
}
