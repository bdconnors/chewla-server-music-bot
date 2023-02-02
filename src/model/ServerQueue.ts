import { ChannelConnection } from "../model/ChannelConnection";
import { SongRequest } from "./SongRequest";
import playdl, { video_info, YouTubeVideo } from 'play-dl';
import { createAudioResource } from "@discordjs/voice";
import { SongRequestFactory } from "../factory";

export class ServerQueue {

  volume: number;
  active: SongRequest | null;
  songs: SongRequest[];
  state: 'PAUSED' | 'PLAYING' | 'READY';
  connection?: ChannelConnection;
  options:YouTubeVideo[];

  public constructor(connection:ChannelConnection, volume?:number, active?:SongRequest, songs?:SongRequest[]) {
    this.connection = connection;
    this.volume = volume ? volume : 5;
    this.active = active ? active : null;
    this.songs = songs ? songs : [];
    this.state = 'READY';
  }

  public init = () => {
    this.connection.join();
  }
  public add = async (song:SongRequest) => {
    this.songs.push(song);
    if(this.state === 'READY' && this.active === null) {
      return await this.next();
    }
    await this.connection.sendMessage(`Song added to queue: **${song.title}**`);
  }
  public remove = async(index:number) => {
    const song = this.songs[index];
    const result = this.songs.splice(index, 1);
    if(result.length === 0) { this.active = null }
    await this.connection.sendMessage(`Remove: **${song.title}** from queue`);
  }
  public pause = async() => {
    const active = this.active;
    this.connection.player.pause();
    this.state = 'PAUSED';
    await this.connection.sendMessage(`Pausing: **${active.title}**`);
  }
  public resume = async() => {
    const active = this.active;
    this.connection.player.unpause();
    this.state = 'PLAYING';
    await this.connection.sendMessage(`Resuming: **${active.title}**`);
  }
  public next = async() => {
    this.active = this.songs.shift();
    await this.play(this.active);
  }
  public stop = async() => {
    const active = this.active;
    this.connection.player.stop();
    this.active = null;
    this.songs.shift();
    this.state = 'READY';
    await this.connection.sendMessage(`Stopping: **${active.title}**`);
  }
  public clear = async() => {
    this.stop();
    this.songs = [];
    this.active = null;
    this.state = 'READY';
    await this.connection.sendMessage(`Song Queue Cleared`);
  }
  public play = async (song?:SongRequest) => {
    if(song) {
      const info = await video_info(song.url)
      const source = await playdl.stream_from_info(info)
      const resource = createAudioResource(source.stream, { inputType : source.type });
      this.connection.sendAudio(resource);
      this.state = 'PLAYING';
      await this.connection.sendMessage(`Start playing: **${song.title}**`);
    } else {
      if(this.state === 'PLAYING') { this.connection.player.stop(); }
      await this.connection.sendMessage(`Song Queue Empty`); 
    }
  }
  public select = async (selection:number) => {
    const selected = this.options[selection];
    const request = SongRequestFactory.make(selected.title, selected.url);
    await this.add(request);
  }
  public display = async(options:YouTubeVideo[]) => {
    if(options.length > 0) {
      this.options = options;

      let selections: string = ``;
      let option: YouTubeVideo;
      for(let i = 0; i < options.length; i++) {
        option = this.options[i];
        selections += `**${ i + 1}. ${ option.title }** \n`;
      }
      await this.connection.sendMessage(selections);
    } else{
      await this.connection.sendMessage(`**No Results**`);
    }
  }
}