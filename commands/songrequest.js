const songs = require('../songs')

module.exports = {
  main: (bot, msg, settings) => {
    var content = msg.content.split(',')
    if (content.length === 2) {
      isAdded = songs.requested(msg.author.username, content[0].trim(), content[1].trim())
    }
    if (typeof isAdded !== 'undefined' && isAdded) {
      bot.sendNotification('Added', 'info', msg)
    } else {
      bot.sendNotification('Error', 'error', msg)
    }
  },
  args: `'<string>' '<string>'`,
  help: 'Send a song to the song request list',
  hide: false
}