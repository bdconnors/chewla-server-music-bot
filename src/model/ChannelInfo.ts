import { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import { TextChannel, VoiceBasedChannel, VoiceChannel } from "discord.js";

export interface ChannelInfo {
  player: AudioPlayer,
  text:TextChannel, 
  voice: VoiceBasedChannel, 
  conn:VoiceConnection
}