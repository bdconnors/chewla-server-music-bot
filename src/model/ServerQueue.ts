import { AudioPlayer, createAudioResource, VoiceConnection } from "@discordjs/voice";
import { TextChannel, VoiceChannel } from "discord.js";
import { ChannelInfo } from "model/ChannelInfo";
import { SongRequest } from "./SongRequest";
import playdl, { video_info } from 'play-dl';

export class ServerQueue {

  channel: ChannelInfo;
  volume: number;
  active: SongRequest | null;
  songs: SongRequest[];
  state: 'PAUSED' | 'PLAYING' | 'READY';

  public constructor(channel:ChannelInfo, volume?:number, active?:SongRequest, songs?:SongRequest[]) {
    this.channel = channel;
    this.volume = volume ? volume : 5;
    this.active = active ? active : null;
    this.songs = songs ? songs : [];
    this.state = 'READY';
  }

  public add = async (song:SongRequest) => {
    this.songs.push(song);
    if(this.state === 'READY' && this.active === null) {
      return await this.next();
    }
    return this.messageTextChannel(`Song added to queue: **${song.title}**`);
  }
  public remove = (index:number) => {
    const textChannel = this.channel.text;
    const song = this.songs[index];
    const result = this.songs.splice(index, 1);
    if(result.length === 0) { this.active = null }
    return textChannel.send(`Remove: **${song.title}** from queue`);
  }
  public pause = () => {
    const player = this.channel.player;
    const active = this.active;
    player.pause();
    this.state = 'PAUSED';
    return this.messageTextChannel(`Pausing: **${active.title}**`);
  }
  public resume = () => {
    const player = this.channel.player;
    const active = this.active;
    player.unpause();
    this.state = 'PLAYING';
    return this.messageTextChannel(`Resuming: **${active.title}**`);
  }
  public next = async() => {
    this.active = this.songs.shift();
    return this.play(this.active);
  }
  public stop = () => {
    const player = this.channel.player;
    const active = this.active;
    player.stop();
    this.active = null;
    this.songs.shift();
    this.state = 'READY';
    return this.messageTextChannel(`Stopping: **${active.title}**`);
  }
  public clear = () => {
    this.stop();
    this.songs = [];
    this.active = null;
    this.state = 'READY';
    return this.messageTextChannel(`Song Queue Cleared`);
  }
  public play = async (song?:SongRequest) => {
    if(song) {
      const player: AudioPlayer = this.channel.player;
      const info = await video_info(song.url)
      const source = await playdl.stream_from_info(info)
      const resource = createAudioResource(source.stream, { inputType : source.type });
      player.play(resource);
      this.state = 'PLAYING';
      return this.messageTextChannel(`Start playing: **${song.title}**`);
    } else {
      return this.messageTextChannel(`Song Queue Empty`); 
    }
  }
  public messageTextChannel = (value:string) => {
    const textChannel = this.channel.text;
    return textChannel.send(value);
  }
}