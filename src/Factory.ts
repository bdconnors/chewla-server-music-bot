import { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import { TextChannel, VoiceBasedChannel, VoiceChannel } from "discord.js";
import { ChannelInfo } from "model/ChannelInfo";
import { ServerQueue } from "model/ServerQueue";
import { SongRequest } from "model/SongRequest";

export class Factory {
  public static makeServerQueue = (channel:ChannelInfo, volume?:number, active?:SongRequest, songs?:SongRequest[]) => new ServerQueue(channel, volume, active, songs);
  public static makeSongRequest = (title:string, url:string): SongRequest => new SongRequest(title, url);
  public static makeChannelInfo = (player:AudioPlayer, text:TextChannel, voice: VoiceBasedChannel, conn: VoiceConnection): ChannelInfo =>({
    player:player,
    text: text,
    voice: voice,
    conn: conn
  });
  
}