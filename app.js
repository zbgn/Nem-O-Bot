'use strict';

const request = require('request');
const Discord = require('discord.js');
const path = require('path');
const fs = require('fs');
const raven = require('raven');
const schedule = require('node-schedule');
const gsjson = require('google-spreadsheet-to-json');

raven.config('https://6b2c5a567e1b4c488d8ac5489d585268@sentry.io/1200092').install();

const config = JSON.parse(fs.readFileSync('./config.json'));

const bot = new Discord.Client({
  autoReconnect: true,
});

bot.OWNERID = config.discord.OWNERID;
bot.PREFIX = config.discord.PREFIX;
bot.TOKEN = config.discord.TOKEN;
bot.OWNERROLE = config.discord.OWNERROLE;

bot.DETAILED_LOGGING = false;
bot.DELETE_COMMANDS = false;

bot.COLOR = 0x351C75;
bot.SUCCESS_COLOR = 0x00ff00;
bot.ERROR_COLOR = 0xff0000;
bot.INFO_COLOR = 0x0000ff;

String.prototype.padRight = function(l, c) {
  return this + Array(l - this.length + 1).join(c || ' ');
};

bot.sendNotification = function(info, type, msg) {
  let icolor;

  if (type === 'success') icolor = bot.SUCCESS_COLOR;
  else if (type === 'error') icolor = bot.ERROR_COLOR;
  else if (type === 'info') icolor = bot.INFO_COLOR;
  else icolor = bot.COLOR;

  const embed = {
    color: icolor,
    description: info,
  };
  msg.channel.send('', {
    embed,
  });
};

const commands = {};

commands.help = {};
commands.help.args = '';
commands.help.help = 'Displays a list of usable commands.';
commands.help.main = function(bot, msg) {
  const cmds = [];

  for (const command in commands) {
    if (!commands[command].hide) {
      cmds.push({
        name: bot.PREFIX + command,
        value: commands[command].help,
        inline: false,
      });
    }
  }

  const embed = {
    color: bot.COLOR,
    description: 'Here are a list of commands you can use.',
    fields: cmds,
    footer: {
      icon_url: bot.user.avatarURL,
      text: bot.user.username,
    },
  };

  msg.channel.send('', {
    embed,
  });
};

commands.prefix = {};
commands.prefix.args = '<prefix>';
commands.prefix.help = '';
commands.prefix.hide = true;
commands.prefix.main = function(bot, msg) {
  if (bot.OWNERID === msg.author.id) {
    try {
      config.discord.PREFIX = msg;
      bot.PREFIX = msg;
      // fs.writeFileSync('./config.json', JSON.stringify(config))
      bot.sendNotification('Prefix updated.', 'success', msg);
    } catch (err) {
      console.log(err);
      bot.sendNotification('Unable to update the prefix.', 'error', msg);
    }
  } else {
    bot.sendNotification('You do not have permission to use this command.',
        'error', msg);
  }
};

commands.load = {};
commands.load.args = '<command>';
commands.load.help = '';
commands.load.hide = true;
commands.load.main = function(bot, msg) {
  if (bot.OWNERID === msg.author.id) {
    try {
      delete commands[msg.content];
      delete require.cache[path.join(__dirname, '/commands/',
          msg.content, '.js')];
      commands[msg.content] = require(path.join(__dirname, '/commands/',
          msg.content, '.js'));
      bot.sendNotification('Loaded ' + msg.content + '.js succesfully.',
          'success', msg);
    } catch (err) {
      bot.sendNotification(
          'The command was not found, or there was an error loading it.',
          'error', msg);
    }
  } else {
    bot.sendNotification('You do not have permission to use this command.',
        'error', msg);
  }
};

commands.unload = {};
commands.unload.args = '<command>';
commands.unload.help = '';
commands.unload.hide = true;
commands.unload.main = function(bot, msg) {
  if (bot.OWNERID === msg.author.id) {
    try {
      delete commands[msg.content];
      delete require.cache[path.join(__dirname, '/commands/',
          msg.content, '.js')];
      bot.sendNotification('Unloaded ' + msg.content + '.js succesfully.',
          'success', msg);
    } catch (err) {
      bot.sendNotification('Command not found.', 'error', msg);
    }
  } else {
    bot.sendNotification('You do not have permission to use this command.',
        'error', msg);
  }
};

commands.reload = {};
commands.reload.args = '';
commands.reload.help = '';
commands.reload.hide = true;
commands.reload.main = function(bot, msg) {
  if (bot.OWNERID === msg.author.id) {
    try {
      delete commands[msg.content];
      delete require.cache[path.join(__dirname, '/commands/',
          msg.content, '.js')];
      commands[args] = require(path.join(__dirname, '/commands/',
          msg.content, '.js'));
      bot.sendNotification('Reloaded ' + msg.content + '.js successfully.',
          'success', msg);
    } catch (err) {
      msg.channel.send('Command not found');
    }
  } else {
    bot.sendNotification('You do not have permission to use this command.',
        'error', msg);
  }
};

const updaterSonglist = function() {
  gsjson({
    spreadsheetId: '1rQaOF0xNWiL57OWbyp4vVX_kJAKD8DhghO7q7czBNOM',
    credentials: config.Google.path,
    listOnly: true,
    includeHeader: true,
  }).then((result) => {
    const ans = {};
    result.forEach(function(value) {
      if (!value[0]) {
        value[0] = 'Various Artist';
      }
      value = value.map(function(v) {
        return String(v).trim().toLowerCase();
      } );
      if (typeof ans[value[0]] === 'undefined') {
        ans[value[0]] = [];
      }
      if (value[1] === '43379') {
        value[1] = '6/10';
      }
      ans[value[0]].push(value[1]);
    });
    console.log(ans);
    fs.writeFile('./utils/musicstream.json', JSON.stringify(ans, null, 4),
        (err) => {
          if (err) console.log(err);
          console.log('Musics have been updated.');
        });
  }).catch((err) => {
    console.log(err.message);
    console.log(err.stack);
  });
};

const updateSonglist = schedule.scheduleJob('0 12 * * *', () => {
  updaterSonglist()
  ;
});

const loadCommands = function() {
  const files = fs.readdirSync(path.join(__dirname, '/commands'));
  for (const file of files) {
    if (file.endsWith('.js')) {
      commands[file.slice(0, -3)] = require(path.join(__dirname, '/commands/',
          file));
      if (bot.DETAILED_LOGGING) console.log('Loaded ' + file);
    }
  }
  console.log('———— All Commands Loaded! ————');
};

const checkCommand = function(msg, isMention) {
  let command = '';
  console.log(msg.channel.name);
  if (msg.channel.name !== 'nem-o-bot') {
    console.log('@' + msg.author.username + ' Please send your message here');
    // bot.channels.get('434050681582780436').sendMessage('@' +
    // msg.author.username + ' Please send your message here')
  }
  if (isMention) {
    command = msg.content.split(' ')[1];
    if (commands.hasOwnProperty(command)) {
      msg.content = msg.content.split(' ')
          .splice(2, msg.content.split(' ').length)
          .join(' ');
      if (command) commands[command].main(bot, msg);
    } else {
      msg.channel.send(command + ': unkown');
    }
  } else {
    command = msg.content.split(bot.PREFIX)[1].split(' ')[0];
    if (commands.hasOwnProperty(command)) {
      msg.content = msg.content.replace(bot.PREFIX + command + ' ', '');
      if (command) commands[command].main(bot, msg);
    } else {
      console.log(command + ': unkown');
    }
  }
};

bot.setInterval(() => {
  request({
    url: config.discord.live_notification,
    method: 'GET',
    headers: {
      'Client-ID': config.twitch.options.clientId,
      'User-Agent': `Nem'O Bot`,
    },
  }, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log('sucess!');
      const jsonres = JSON.parse(body);
      if (jsonres.data.length && !bot.liveDisplayed) {
        bot.liveDisplayed = true;
        // bot.channels.get('371755760037658625').sendMessage('@everyone, @Minstery just went live! <http://twitch.tv/minestry>')
      } else if (!jsonres.data.length) bot.liveDisplayed = false;
    } else {
      if (response != undefined) console.log('error ' + response.statusCode);
      else console.log('unknown error');
    }
  });
}, 120000);

bot.on('ready', () => {
  console.log('Ready to begin! Serving in ' +
  bot.guilds.array().length + ' servers.');
  bot.user.setPresence({
    game: {
      name: bot.PREFIX + 'help - message @Gysco#1337',
    },
    status: 'online',
  }).then(console.log).catch(console.error);
  loadCommands();
});

bot.on('message', (msg) => {
  if (msg.content.startsWith('<@' + bot.user.id + '>')
    || msg.content.startsWith('<@!' + bot.user.id + '>')) {
    checkCommand(msg, true);
    if (bot.DELETE_COMMANDS) msg.delete();
  } else if (msg.content.startsWith(bot.PREFIX)) {
    checkCommand(msg, false);
    if (bot.DELETE_COMMANDS) msg.delete();
  }
});

bot.on('error', (err) => {
  console.log('————— BIG ERROR —————');
  console.log(err);
  console.log('——— END BIG ERROR ———');
});

bot.on('disconnected', () => {
  console.log('Disconnected!');
});

bot.login(bot.TOKEN);
// ------------Twitch--------------
const TwitchJS = require('twitch-js');
const cmdTV = require('./commandtwitch.js');

const optionsTV = config.twitch;

const client = new TwitchJS.client(optionsTV);
let timer = Date.now();

client.on('chat', (channel, userstate, message, self) => {
  console.log(`${channel}: ${userstate['display-name']} => '${message}'`);

  if (self) return;
  if (optionsTV.identity && message.startsWith('!')) {
    const cmd = message.split(' ')[0].replace('!', '');
    if ((cmd.toLowerCase() === 'cs' || cmd.toLowerCase() === 'currentsong')
        && Date.now() - timer <= 10000) {
      console.log('TIMER');
    } else if (cmd.toLowerCase() === 'update') {
      updaterSonglist();
      client.say(channel, 'Updating songlist.');
    } else if (cmd.toLowerCase() in cmdTV) {
      if (cmd.toLowerCase() === 'cs' || cmd.toLowerCase() === 'currentsong') {
        timer = Date.now();
      }
      const msg = message.replace(message.split(' ')[0], '').split('-');
      cmdTV[cmd.toLowerCase()](channel, userstate['display-name'], msg,
          (ret) => {
            client.say(channel, ret);
          });
    } else console.log(cmd + ':unknow cmd.');
  }
});

client.connect();
