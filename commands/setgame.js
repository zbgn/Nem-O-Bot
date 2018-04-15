module.exports = {
  main: (bot, msg) => {
    if (msg.author.id === bot.OWNERID) {
      bot.user.setPresence({
        game: {
          name: msg
        },
        status: 'online'
      }).then(console.log).catch(console.error)
      bot.sendNotification('Game changed to \'' + msg + '\'.', 'success', msg)
    } else {
      bot.sendNotification('You do not have permission to use this command.', 'error', msg)
    }
  },
  hide: true
}
