const fs = require('fs')
const songs = require("../songs")

module.exports = {
  main: (bot, msg, settings) => {
    var wantedRole = msg.guild.roles.find("name", bot.OWNERROLE)
    var roles = msg.member.roles.sort((a, b) => a.position < b.position ? 1 : -1)
    if (roles.first().calculatedPosition >= wantedRole.calculatedPosition) {
      
      var next = songs.next();
      if (next != "") {
        bot.sendNotification(next.author + "  " +
          next.song + "  " +
          next.username, 'info', msg)
      } else {
        bot.sendNotification("No song", 'info', msg)
      }
    } else {
      bot.sendNotification("You do not have permission to use this command. User " + bot.OWNERROLE + " and above only !", 'error', msg)
    }
  },
  args: '',
  help: 'Display the nex song (and tag as played).',
  hide: false
}