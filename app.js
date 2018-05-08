'use strict'

const request = require('request')
const Discord = require('discord.js')
const path = require('path')
const fs = require('fs')
var raven = require('raven')

raven.config('https://6b2c5a567e1b4c488d8ac5489d585268@sentry.io/1200092').install()

var config = JSON.parse(fs.readFileSync('./config.json'))

var bot = new Discord.Client({
  autoReconnect: true
})

bot.OWNERID = config.discord.OWNERID
bot.PREFIX = config.discord.PREFIX
bot.TOKEN = config.discord.TOKEN
bot.OWNERROLE = config.discord.OWNERROLE

bot.DETAILED_LOGGING = false
bot.DELETE_COMMANDS = false

bot.COLOR = 0x351C75
bot.SUCCESS_COLOR = 0x00ff00
bot.ERROR_COLOR = 0xff0000
bot.INFO_COLOR = 0x0000ff

String.prototype.padRight = function (l, c) {
  return this + Array(l - this.length + 1).join(c || ' ')
}

bot.sendNotification = function (info, type, msg) {
  var icolor

  if (type === 'success') icolor = bot.SUCCESS_COLOR
  else if (type === 'error') icolor = bot.ERROR_COLOR
  else if (type === 'info') icolor = bot.INFO_COLOR
  else icolor = bot.COLOR

  let embed = {
    color: icolor,
    description: info
  }
  msg.channel.send('', {
    embed
  })
}

var commands = {}

commands.help = {}
commands.help.args = ''
commands.help.help = 'Displays a list of usable commands.'
commands.help.main = function (bot, msg) {
  var cmds = []

  for (let command in commands) {
    if (!commands[command].hide) {
      cmds.push({
        name: bot.PREFIX + command,
        value: commands[command].help,
        inline: false
      })
    }
  }

  let embed = {
    color: bot.COLOR,
    description: 'Here are a list of commands you can use.',
    fields: cmds,
    footer: {
      icon_url: bot.user.avatarURL,
      text: bot.user.username
    }
  }

  msg.channel.send('', {
    embed
  })
}

commands.prefix = {}
commands.prefix.args = '<prefix>'
commands.prefix.help = ''
commands.prefix.hide = true
commands.prefix.main = function (bot, msg) {
  if (bot.OWNERID === msg.author.id) {
    try {
      config.discord.PREFIX = msg
      bot.PREFIX = msg
      // fs.writeFileSync('./config.json', JSON.stringify(config))
      bot.sendNotification('Prefix updated.', 'success', msg)
    } catch (err) {
      console.log(err)
      bot.sendNotification('Unable to update the prefix.', 'error', msg)
    }
  } else {
    bot.sendNotification('You do not have permission to use this command.', 'error', msg)
  }
}

commands.load = {}
commands.load.args = '<command>'
commands.load.help = ''
commands.load.hide = true
commands.load.main = function (bot, msg) {
  if (bot.OWNERID === msg.author.id) {
    try {
      delete commands[msg.content]
      delete require.cache[path.join(__dirname, '/commands/', msg.content, '.js')]
      commands[msg.content] = require(path.join(__dirname, '/commands/', msg.content, '.js'))
      bot.sendNotification('Loaded ' + msg.content + '.js succesfully.', 'success', msg)
    } catch (err) {
      bot.sendNotification('The command was not found, or there was an error loading it.', 'error', msg)
    }
  } else {
    bot.sendNotification('You do not have permission to use this command.', 'error', msg)
  }
}

commands.unload = {}
commands.unload.args = '<command>'
commands.unload.help = ''
commands.unload.hide = true
commands.unload.main = function (bot, msg) {
  if (bot.OWNERID === msg.author.id) {
    try {
      delete commands[msg.content]
      delete require.cache[path.join(__dirname, '/commands/', msg.content, '.js')]
      bot.sendNotification('Unloaded ' + msg.content + '.js succesfully.', 'success', msg)
    } catch (err) {
      bot.sendNotification('Command not found.', 'error', msg)
    }
  } else {
    bot.sendNotification('You do not have permission to use this command.', 'error', msg)
  }
}

commands.reload = {}
commands.reload.args = ''
commands.reload.help = ''
commands.reload.hide = true
commands.reload.main = function (bot, msg) {
  if (bot.OWNERID === msg.author.id) {
    try {
      delete commands[msg.content]
      delete require.cache[path.join(__dirname, '/commands/', msg.content, '.js')]
      commands[args] = require(path.join(__dirname, '/commands/', msg.content, '.js'))
      bot.sendNotification('Reloaded ' + msg.content + '.js successfully.', 'success', msg)
    } catch (err) {
      msg.channel.send('Command not found')
    }
  } else {
    bot.sendNotification('You do not have permission to use this command.', 'error', msg)
  }
}

var loadCommands = function () {
  var files = fs.readdirSync(path.join(__dirname, '/commands'))
  for (let file of files) {
    if (file.endsWith('.js')) {
      commands[file.slice(0, -3)] = require(path.join(__dirname, '/commands/', file))
      if (bot.DETAILED_LOGGING) console.log('Loaded ' + file)
    }
  }
  console.log('———— All Commands Loaded! ————')
}

var checkCommand = function (msg, isMention) {
  var command = ''
  console.log(msg.channel.name)
  if (msg.channel.name !== 'nem-o-bot') {
    bot.message.guild.channels.find('name', 'nem-o-bot').sendMessage('@' + msg.author.username + ' Please send your message here')
  }
  if (isMention) {
    command = msg.content.split(' ')[1]
    if (commands.hasOwnProperty(command)) {
      msg.content = msg.content.split(' ').splice(2, msg.content.split(' ').length).join(' ')
      if (command) commands[command].main(bot, msg)
    } else {
      msg.channel.send(command + ': unkown')
    }
  } else {
    command = msg.content.split(bot.PREFIX)[1].split(' ')[0]
    if (commands.hasOwnProperty(command)) {
      msg.content = msg.content.replace(bot.PREFIX + command + ' ', '')
      if (command) commands[command].main(bot, msg)
    } else {
      console.log(command + ': unkown')
    }
  }
}

bot.setInterval(() => {
  request({
    url: config.discord.live_notification,
    method: 'GET',
    headers: {
      'Client-ID': config.twitch.options.clientId,
      'User-Agent': `Nem'O Bot`
    }
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log('sucess!')
      var jsonres = JSON.parse(body)
      if (jsonres.data.length && !bot.liveDisplayed) {
        bot.liveDisplayed = true
        // bot.message.guild.channels.find('name', 'annonces-streams').sendMessage('@everyone, @Minstery just went live! <http://twitch.tv/minestry>')
      } else if (!jsonres.data.length) bot.liveDisplayed = false
    } else {
      console.log('error ' + response.statusCode)
    }
  })
}, 120000)

bot.on('ready', () => {
  console.log('Ready to begin! Serving in ' + bot.guilds.array().length + ' servers.')
  bot.user.setPresence({
    game: {
      name: bot.PREFIX + 'help - message @Gysco#1337'
    },
    status: 'online'
  }).then(console.log).catch(console.error)
  loadCommands()
})

bot.on('message', msg => {
  if (msg.content.startsWith('<@' + bot.user.id + '>') || msg.content.startsWith('<@!' + bot.user.id + '>')) {
    checkCommand(msg, true)
    if (bot.DELETE_COMMANDS) msg.delete()
  } else if (msg.content.startsWith(bot.PREFIX)) {
    checkCommand(msg, false)
    if (bot.DELETE_COMMANDS) msg.delete()
  }
})

bot.on('error', (err) => {
  console.log('————— BIG ERROR —————')
  console.log(err)
  console.log('——— END BIG ERROR ———')
})

bot.on('disconnected', () => {
  console.log('Disconnected!')
})

bot.login(bot.TOKEN)
// ------------Twitch--------------
const TwitchJS = require('twitch-js')
const cmdTV = require('./commandtwitch.js')

const optionsTV = config.twitch

const client = new TwitchJS.client(optionsTV)

client.on('chat', (channel, userstate, message, self) => {
  console.log(`#${channel}: ${userstate['display-name']} => '${message}'`)

  if (self) return
  if (optionsTV.identity && message.startsWith('!')) {
    var cmd = message.split(' ')[0].replace('!', '')
    if (cmd in cmdTV) {
      var msg = message.replace(message.split(' ')[0], '').split('-')
      cmdTV[cmd](channel, userstate['display-name'], msg, (ret) => {
        client.say(channel, ret)
      })
    } else console.log(cmd + ':unknow cmd.')
  }
})

client.connect()
