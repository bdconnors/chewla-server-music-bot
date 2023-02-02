import { Guild, TextChannel, VoiceBasedChannel } from "discord.js";
import { ChannelConnection } from "../model";

export class ChannelConnectionFactory {
  public static make = (server:Guild, text:TextChannel, voice: VoiceBasedChannel): ChannelConnection => new ChannelConnection(server, text, voice);
}