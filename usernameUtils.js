const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const config = require('../../config');
const checkUrl = 'https://discord.com/api/v9/users/@me/pomelo-attempt';
const Delay = 10;
let tokens = [];
let activeTokenIndex = 0;
let tokenCooldowns = [];
const checkedUsernames = new Set();

// ================== Token Rotation ==================
function setTokens(tokenList) {
  tokens = tokenList;
  tokenCooldowns = new Array(tokens.length).fill(0);
}

function rotateToken(force = false) {
  const currentTime = Date.now() / 1000;
  const availableTokens = tokens.map((_, i) => i).filter(i => currentTime >= tokenCooldowns[i]);

  if (availableTokens.length > 0) {
    activeTokenIndex = availableTokens[Math.floor(Math.random() * availableTokens.length)];
  } else if (force) {
    activeTokenIndex = (activeTokenIndex + 1) % tokens.length;
  }
  console.log(`[Token] Switched to token ${activeTokenIndex + 1}/${tokens.length}`);
}

function headers() {
  return {
    Authorization: tokens[activeTokenIndex],
    'Content-Type': 'application/json',
    Origin: 'https://discord.com',
  };
}

// ================== Username Check ==================
async function checkUsername(username) {
  if (checkedUsernames.has(username)) return false;
  checkedUsernames.add(username);

  let retries = 0;
  while (retries < 5) {
    try {
      const response = await axios.post(checkUrl, { username }, { headers: headers(), timeout: 10000 });
      if (response.status === 429) {
        const retryAfter = Math.min(response.data.retry_after || Delay + 3, 10.5);
        console.log(`[RateLimit] Sleeping ${retryAfter.toFixed(2)}s...`);
        tokenCooldowns[activeTokenIndex] = Date.now() / 1000 + retryAfter;
        rotateToken(true);
        await new Promise(res => setTimeout(res, (retryAfter + Math.random() * 0.5 + 0.5) * 1000));
        continue;
      } else if (response.status === 401) {
        console.log(`[Invalid Token] Removing token ${activeTokenIndex + 1}`);
        tokenCooldowns[activeTokenIndex] = Infinity;
        rotateToken(true);
        return false;
      } else if (response.status === 200 || response.status === 400) {
        return !response.data.taken;
      } else {
        console.log(`[Error] Status ${response.status} on @${username}`);
        rotateToken();
        return false;
      }
    } catch (error) {
      console.log(`[Exception] ${username} -> ${error.message}`);
      tokenCooldowns[activeTokenIndex] = Date.now() / 1000 + Delay + retries + 2;
      rotateToken(true);
      await new Promise(res => setTimeout(res, (Delay + retries + Math.random() + 1) * 1000));
      retries++;
    }
  }
  return false;
}

// ================== Username Generator ==================
function generateUsername(type = 'random', prefix = '', lastCharType = 'any') {
  const digits = '0123456789';
  const rareDigits = '79';
  const rareLetters = 'qzjxkvw';
  const commonLetters = 'abcxyz';
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const symbols = ['.', '_'];
  const maxLength = 4;
  const remainingLength = maxLength - prefix.length;

  if (remainingLength < 1) return null;

  const patterns = {
    number: () => {
      let result = Array.from({ length: remainingLength }, () => digits[Math.floor(Math.random() * digits.length)]).join('');
      if (lastCharType === 'letter' && remainingLength >= 1) {
        result = result.slice(0, -1) + letters[Math.floor(Math.random() * letters.length)];
      }
      return result;
    },
    letter: () => {
      if (remainingLength === 1) {
        return lastCharType === 'number'
          ? digits[Math.floor(Math.random() * digits.length)]
          : letters[Math.floor(Math.random() * letters.length)];
      }
      let result = rareLetters[Math.floor(Math.random() * rareLetters.length)] +
                  Array.from({ length: remainingLength - 1 }, () => digits[Math.floor(Math.random() * digits.length)]).join('');
      if (lastCharType === 'letter') {
        result = result.slice(0, -1) + letters[Math.floor(Math.random() * letters.length)];
      }
      return result;
    },
    symbol: () => {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      if (remainingLength === 1) return symbol;
      let result = symbol + Array.from({ length: remainingLength - 1 }, () => digits[Math.floor(Math.random() * digits.length)]).join('');
      if (lastCharType === 'letter') {
        result = result.slice(0, -1) + letters[Math.floor(Math.random() * letters.length)];
      }
      return result;
    },
    random: () => {
      const types = [
        () => Array.from({ length: remainingLength }, () => digits[Math.floor(Math.random() * digits.length)]).join(''),
        () => letters[Math.floor(Math.random() * letters.length)] + (remainingLength > 1 ? Array.from({ length: remainingLength - 1 }, () => digits[Math.floor(Math.random() * digits.length)]).join('') : ''),
        () => rareDigits[Math.floor(Math.random() * rareDigits.length)] + (remainingLength > 1 ? Array.from({ length: remainingLength - 1 }, () => digits[Math.floor(Math.random() * digits.length)]).join('') : ''),
        () => commonLetters[Math.floor(Math.random() * commonLetters.length)] + (remainingLength > 1 ? Array.from({ length: remainingLength - 1 }, () => digits[Math.floor(Math.random() * digits.length)]).join('') : ''),
        () => digits[Math.floor(Math.random() * digits.length)] + (remainingLength > 1 ? commonLetters[Math.floor(Math.random() * commonLetters.length)] + (remainingLength > 2 ? Array.from({ length: remainingLength - 2 }, () => digits[Math.floor(Math.random() * digits.length)]).join('') : '') : ''),
        () => symbols[Math.floor(Math.random() * symbols.length)] + (remainingLength > 1 ? Array.from({ length: remainingLength - 1 }, () => digits[Math.floor(Math.random() * digits.length)]).join('') : ''),
        () => symbols[Math.floor(Math.random() * symbols.length)] + (remainingLength > 1 ? letters[Math.floor(Math.random() * letters.length)] + (remainingLength > 2 ? Array.from({ length: remainingLength - 2 }, () => digits[Math.floor(Math.random() * digits.length)]).join('') : '') : '')
      ];
      let result = types[Math.floor(Math.random() * types.length)]();
      if (lastCharType === 'letter' && remainingLength > 1) {
        result = result.slice(0, -1) + letters[Math.floor(Math.random() * letters.length)];
      } else if (lastCharType === 'number' && remainingLength > 1) {
        result = result.slice(0, -1) + digits[Math.floor(Math.random() * digits.length)];
      }
      return result;
    }
  };

  let username;
  do {
    username = prefix + patterns[type]();
  } while (!username || username.length !== maxLength || checkedUsernames.has(username));

  return username;
}

// ================== Embed Builder ==================
function createUserEmbed(usernames, checked = {}, interaction) {
  const description = usernames.map(username => {
    if (checked[username] === true) return config.MESSAGES[config.LANGUAGE].EMBED_AVAILABLE_MESSAGE.replace('{username}', username);
    if (checked[username] === false) return config.MESSAGES[config.LANGUAGE].EMBED_TAKEN_MESSAGE.replace('{username}', username);
    return `⏳ **${username}**`;
  }).join('\n');

  return new EmbedBuilder()
    .setTitle(config.MESSAGES[config.LANGUAGE].EMBED_TITLE_GENERATING)
    .setColor(config.EMBED_COLOR)
    .setDescription(description || config.MESSAGES[config.LANGUAGE].EMBED_NO_USERNAMES)
    .setTimestamp();
}

// ================== Exports ==================
module.exports = {
  setTokens,
  rotateToken,
  checkUsername,
  generateUsername,
  createUserEmbed
};