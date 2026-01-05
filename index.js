const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const { checkUsername, generateUsername, createUserEmbed, setTokens } = require('./src/utils/usernameUtils');
const config = require('./config');
const client = new Client({
  intents: [
    'Guilds',
    'GuildMessages',
    'MessageContent',
    'GuildMembers',
  ],
});

const CooldownUtils = {
  checkCooldown: (key, duration, options) => {
    const cooldowns = new Map();
    const now = Date.now();
    const durationMs = parseDuration(duration) * 1000;

    if (cooldowns.has(key)) {
      const expiration = cooldowns.get(key);
      if (now < expiration) {
        const timeLeft = ((expiration - now) / 1000).toFixed(1);
        if (options.full) {
          return new EmbedBuilder()
            .setTitle(config.MESSAGES[config.LANGUAGE].EMBED_TITLE_COOLDOWN)
            .setDescription(`${config.MESSAGES[config.LANGUAGE].EMBED_COOLDOWN_MESSAGE} ${timeLeft} seconds.`)
            .setColor(config.EMBED_COLOR);
        }
        return true;
      }
    }

    cooldowns.set(key, now + durationMs);
    setTimeout(() => cooldowns.delete(key), durationMs);
    return null;
  },
};

function parseDuration(duration) {
  const unit = duration.slice(-1);
  const value = parseInt(duration.slice(0, -1));
  if (unit === 's') return value;
  if (unit === 'm') return value * 60;
  if (unit === 'h') return value * 3600;
  return value;
}

const availableUsernamesFile = path.join(__dirname, './config/available_usernames.txt');

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(config.PREFIX) || message.author.bot) return;
  const args = message.content.slice(config.PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  if (message.channel.id !== config.CHANNEL_ID) return;

  const userId = message.author.id;
  const hasBypassRole = message.member.roles.cache.has(config.BYPASS_ROLE_ID);

  if (command === config.COMMAND_CHECK) {
    if (args.length === 0) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(config.MESSAGES[config.LANGUAGE].EMBED_TITLE_ERROR)
            .setDescription(config.MESSAGES[config.LANGUAGE].EMBED_ERROR_NO_USERNAME)
            .setColor(config.EMBED_COLOR),
        ],
      });
    }

    const username = args[0];

    if (!hasBypassRole) {
      const cd = CooldownUtils.checkCooldown(`check_${userId}`, config.COOLDOWN_CHECK, { userId, full: true });
      if (cd) {
        return message.reply({ embeds: [cd] });
      }
    }

    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(config.MESSAGES[config.LANGUAGE].EMBED_TITLE_CHECKING)
          .setDescription(config.MESSAGES[config.LANGUAGE].EMBED_CHECKING_MESSAGE)
          .setColor(config.EMBED_COLOR),
      ],
    });

    const isAvailable = await checkUsername(username);
    const embed = new EmbedBuilder()
      .setTitle(config.MESSAGES[config.LANGUAGE].EMBED_TITLE_AVAILABILITY)
      .setDescription(
        isAvailable
          ? config.MESSAGES[config.LANGUAGE].EMBED_AVAILABLE_MESSAGE.replace('{username}', username)
          : config.MESSAGES[config.LANGUAGE].EMBED_TAKEN_MESSAGE.replace('{username}', username)
      )
      .setColor(config.EMBED_COLOR);

    if (isAvailable) {
      await fs.appendFile(availableUsernamesFile, username + '\n');
    }

    await message.channel.send({ embeds: [embed] });
  }

  if (command === config.COMMAND_CHECKUSERNAME) {
    if (!hasBypassRole) {
      const cd = CooldownUtils.checkCooldown(`checkusername_${userId}`, config.COOLDOWN_CHECKUSERNAME, { userId, full: true });
      if (cd) {
        return message.reply({ embeds: [cd] });
      }
    }

    let type = args[0] || 'random';
    let prefix = args[1] || '';
    let lastCharType = args[2] || 'any';

    if (!['letter', 'number', 'symbol', 'random'].includes(type)) {
      type = 'random';
    }

    if (prefix && (!/^[a-z0-9_.]{0,3}$/.test(prefix) || prefix.length > 3)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(config.MESSAGES[config.LANGUAGE].EMBED_TITLE_INVALID_PREFIX)
            .setDescription(config.MESSAGES[config.LANGUAGE].EMBED_INVALID_PREFIX_MESSAGE)
            .setColor(config.EMBED_COLOR),
        ],
      });
    }

    if (!['any', 'letter', 'number'].includes(lastCharType)) {
      lastCharType = 'any';
    }

    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(config.MESSAGES[config.LANGUAGE].EMBED_TITLE_GENERATING)
          .setDescription(config.MESSAGES[config.LANGUAGE].EMBED_GENERATING_MESSAGE)
          .setColor(config.EMBED_COLOR),
      ],
    });

    setTimeout(async () => {
      let usernames = [];
      let checked = {};

      while (usernames.length < 9) {
        const newUsername = generateUsername(type, prefix, lastCharType);
        if (!usernames.includes(newUsername)) {
          usernames.push(newUsername);
          checked[newUsername] = undefined;
        }
      }

      const embed = createUserEmbed(usernames, checked, message);
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('check_all')
          .setLabel(config.MESSAGES[config.LANGUAGE].BUTTON_CHECK_ALL_LABEL)
          .setStyle(ButtonStyle.Primary)
      );

      const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });
      const collector = sentMessage.createMessageComponentCollector({ time: config.BUTTON_COLLECTOR_TIMEOUT });

      collector.on('collect', async (i) => {
        if (i.user.id !== message.author.id) {
          return i.reply({ content: config.MESSAGES[config.LANGUAGE].EMBED_BUTTON_NOT_AUTHOR, ephemeral: true });
        }

        if (i.customId === 'check_all') {
          await i.deferUpdate();
          for (const username of usernames) {
            if (checked[username] !== undefined) continue;
            const isAvailable = await checkUsername(username);
            checked[username] = isAvailable;

            if (isAvailable) {
              await fs.appendFile(availableUsernamesFile, username + '\n');
            }
          }
          const updatedEmbed = createUserEmbed(usernames, checked, message);
          const disabledRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('check_all')
              .setLabel(config.MESSAGES[config.LANGUAGE].BUTTON_CHECK_ALL_LABEL)
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true)
          );

          await i.editReply({ embeds: [updatedEmbed], components: [disabledRow] });
          collector.stop();
        }
      });
    }, 1000);
  }
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

setTokens(config.TOKEN_LIST);
client.login(config.BOT_TOKEN);
client.on('error', (error) => {
  console.error('Client error:', error);
});