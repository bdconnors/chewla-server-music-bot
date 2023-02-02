import { ChewlaBot } from './bot';
import { IntentsBitField } from 'discord.js';
import { config }from './config';

const bot:ChewlaBot = new ChewlaBot({ 
  prefix: config.COMMAND_PREFIX, 
  token: config.BOT_TOKEN, 
  permissions: [
    IntentsBitField.Flags.MessageContent, 
    IntentsBitField.Flags.Guilds, 
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildVoiceStates
  ] 
});

bot.init();


