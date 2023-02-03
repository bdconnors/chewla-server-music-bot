import { ChannelConnection } from "./ChannelConnection";
import { SongRequest } from "./SongRequest";
import playdl, { video_info, YouTubeVideo } from 'play-dl';
import { AudioPlayerStatus, createAudioResource } from "@discordjs/voice";
import { SongRequestFactory } from "../factory";
import { Message } from "discord.js";

export class YoutubePlayer {

  volume: number;
  active: SongRequest | null;
  songs: SongRequest[];
  state: 'PAUSED' | 'PLAYING' | 'READY';
  connection?: ChannelConnection;
  options:SongRequest[];

  public constructor(connection:ChannelConnection, volume?:number, active?:SongRequest, songs?:SongRequest[]) {
    connection.player.on(AudioPlayerStatus.Idle, this.onIdle);
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
  
  public pause = async(message?:Message) => {
    const active = this.active;
    this.connection.player.pause();
    this.state = 'PAUSED';
    await this.connection.sendMessage(`Pausing: **${active.title}**`);
  }

  public resume = async(message?:Message) => {
    const active = this.active;
    this.connection.player.unpause();
    this.state = 'PLAYING';
    await this.connection.sendMessage(`Resuming: **${active.title}**`);
  }

  public next = async(message?:Message) => {
    this.active = this.songs.shift();
    await this.start(this.active);
  }

  public stop = async(message?:Message) => {
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

  public play = async(message?:Message) => {
    const args = message.content.split(' ');
    args.shift();
    const songName = args.join(' ');
    const results = await this.search(songName);
    await this.display(results);
  }

  public start = async (song?:SongRequest) => {
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
  
  public search = async(title:string):Promise<SongRequest[]> => {
    const searched = await playdl.search(title, { source : { youtube : "video" } });
    return searched.map((result:YouTubeVideo)=>SongRequestFactory.make(result.title, result.url));
  }

  public select = async (message?:Message) => {
    const selection: number = parseInt(message.content.split(" ")[1]);
    const index = selection - 1;
    const selected = this.options[index];
    const request = SongRequestFactory.make(selected.title, selected.url);
    if(!this.connection.isActive()) { this.connection.join(); }
    await this.add(request);
  }

  public display = async(options:SongRequest[]) => {
    if(options.length > 0) {
      this.options = options;
      await this.connection.sendMessage(`Use \`~select <number>\` to pick a song`);
      let selections: string = ``;
      options.forEach((option:SongRequest, i:number)=>selections+=`**${ i + 1}. ${ option.title }** \n`);
      await this.connection.sendMessage(selections);
    } else{
      await this.connection.sendMessage(`**No Results**`);
    }
  }
  public onIdle = async() => {
    if(this.songs.length > 0) {
      await this.next();
    }else {
      await this.connection.sendMessage(`Queue empty, leaving channel`);
      await this.connection.leave();
    }
  }
  public getCommand = async (message:Message) => {
    console.log(message);
    const cmd = message.content.split(' ')[0].split('~')[1];
    console.log(cmd);
    let command: (message?:Message)=> Promise<void> | undefined = undefined;
    const self: any = this as any;
    command = self[cmd];
    if(!command) {
      await this.connection.sendMessage(`Unknown command **${ cmd }**`);
    }
    console.log(command);
    return command;
  } 
}