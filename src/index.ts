import { IntentsBitField } from 'discord.js';
import { ChewlaBot } from './bot';
import * as dotenv from 'dotenv';
dotenv.config();

try {
  const bot:ChewlaBot = new ChewlaBot({
    prefix: process.env.COMMAND_PREFIX,
    token: process.env.BOT_TOKEN,
    permissions: [
      IntentsBitField.Flags.MessageContent,
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.GuildVoiceStates,
    ],
  });

  bot.init();
} catch (e) {
  console.log(e);
}
