import { ChewlaBot } from 'ChewlaBot';
import { IntentsBitField } from 'discord.js';

const COMMAND_PREFIX="~";
const BOT_TOKEN="MTA3MDM0OTk2NzQzMDAwNDc1Ng.GZ4kbV.w1uWRbMqZ_DYQGVGDk_6yGTCF4FJYK0GaWgd64";

const bot:ChewlaBot = new ChewlaBot({ 
  prefix: COMMAND_PREFIX, 
  token: BOT_TOKEN, 
  permissions: [
    IntentsBitField.Flags.MessageContent, 
    IntentsBitField.Flags.Guilds, 
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildVoiceStates
  ] 
});

bot.init();


