const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');

const client = new Discord.Client({intents: config.intents});

client.on('ready', () => {
  console.log(`Connected as ${client.user.id} - ${client.user.tag}`);
  client.user.setActivity(`with threads | ${config.prefix}help`);
});

client.on('messageCreate', (msg) => {
  try {
    if((msg.channel.type === 'GUILD_TEXT' ||
        msg.channel.type === 'GUILD_NEWS' ||
        msg.channel.type === 'GUILD_NEWS_THREAD' ||
        msg.channel.type === 'GUILD_PUBLIC_THREAD' ||
        msg.channel.type === 'GUILD_PRIVATE_THREAD') &&
        !msg.author.bot) {
      if(msg.content.startsWith(config.prefix)) {
        var args = msg.content.split(' ');
        var cmd = args.slice().replaceAll(/[^a-z0-9-]/gi, '');

        fs.access(`./cmds/${cmd}.js`, constants.F_OK, (e) => {
          if(!e) {
            try {
              var vars = {
                msg: msg,
                client: client,
                config: config
              };

              require(`./cmds/${cmd}.js`).exec(args, vars);
            } catch(err) {
              console.log(err);
            }
          }
        });
      } else if(msg.channel.type === 'GUILD_NEWS_THREAD' ||
                msg.channel.type === 'GUILD_PUBLIC_THREAD' ||
                msg.channel.type === 'GUILD_PRIVATE_THREAD') {
        if(!msg.member.permissions.has('ADMINISTRATOR') &&
           !msg.member.permissions.has('MANAGE_GUILD') &&
           !msg.member.permissions.has('MANAGE_CHANNELS') &&
           !msg.member.permissions.has('MANAGE_THREADS') &&
           !msg.member.permissions.has('BAN_MEMBERS') &&
           !msg.member.permissions.has('KICK_MEMBERS') &&
           !msg.member.permissions.has('MANAGE_MESSAGES')) {
          for(var i=0; i<config.filter.length; i++) {
            if(msg.content.includes(config.filter[i])) {
              try {
                msg.delete();
              } catch(err) {
                console.log(err);
              }
            }
          }
        }
      }
    }
  } catch(err) {
    console.log(err);
  }
});

client.on('threadCreate', (thread) => {
  for(var i=0; i<config.filter.length; i++) {
    if(thread.name.includes(config.filter[i])) {
      try {
        thread.setName('filtered');
      } catch(err) {
        console.log(err);
      }
    }
  }
});

client.on('threadUpdate', (_, thread) => {
  for(var i=0; i<config.filter.length; i++) {
    if(thread.name.includes(config.filter[i])) {
      try {
        thread.setName('filtered');
      } catch(err) {
        console.log(err);
      }
    }
  }
});
