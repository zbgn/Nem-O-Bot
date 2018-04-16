const fs = require('fs')

module.exports = {
  main: (bot, msg, settings) => {
    if (msg.member.roles.has(msg.guild.roles.find("name", bot.OWNERROLE).id)) {
      if (bot.songlist.length >= 1) {
        for (var i = 0, len = bot.songlist.length; i < len; i++) {
          if (!bot.songlist[i].played) {
            bot.sendNotification(bot.songlist[i].author, 'info', msg)
            bot.songlist[i].played = true;
            break
          }
          if (i + 1 == bot.songlist.length) {
            bot.sendNotification("No more song !", 'info', msg)
          }
        }
      } else {
        bot.sendNotification("No song", 'info', msg)
      }
    } else {
      bot.sendNotification("You do not have permission to use this command. User " + bot.OWNERROLE + "only !", 'error', msg)
    }
  },
  args: '',
  help: 'Display the nex song (and tag as played).',
  hide: false
}