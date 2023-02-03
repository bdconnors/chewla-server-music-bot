import { Guild, InternalDiscordGatewayAdapterCreator, TextChannel, VoiceBasedChannel } from "discord.js";
import { ChannelConnection, ChannelConnectionOptions } from "../model";

export class ChannelConnectionFactory {
  public static make = (server:Guild, text:TextChannel, voice: VoiceBasedChannel): ChannelConnection => new ChannelConnection(server, text, voice);
  public static makeOptions = (channelId: string, serverId: string, adapter: InternalDiscordGatewayAdapterCreator): ChannelConnectionOptions => ({ 
    channelId: channelId, 
    guildId: serverId, 
    adapterCreator: adapter 
  })
}