import { Client, Message, PermissionsBitField, TextChannel } from 'discord.js';
import { IChewlaBot } from './interface/IChewlaBot';
import { IChewlaBotOptions } from './interface/IChewlaBotOptions';
import { ServerQueue } from './model/ServerQueue';
import { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnection } from '@discordjs/voice';
import playdl, { video_info } from 'play-dl';
import { Factory } from 'Factory';

export class ChewlaBot implements IChewlaBot {
  prefix: string;
  token: string;
  permissions: number;
  discord: Client;
  servers: Map<any, ServerQueue>;

  public constructor(options: IChewlaBotOptions) {
    this.prefix = options.prefix;
    this.token = options.token;
    this.permissions = options.permissions;
  }

  onReady = () => {
    console.log('Connected!')
  }

  onReconnecting = () => {
    console.log('Reconnecting...')
  }

  onDisconnected = () => {
    console.log('Disconnected!')
  }

  onMessage = async (message: Message) => {
    console.log(message);
    const isBotCommand = !message.author.bot && message.content.startsWith(this.prefix);
    if(isBotCommand) { 
     await this.handleCommand(message);
    }
  }

  handleCommand = async (message: Message) => {
    const args = message.content.split(" ");
    const command: string = args[0];
    switch(command) {
      case '~play':
        return await this.handlePlay(message);
      case '~pause':
        return await this.handlePause(message);
      case '~resume':
        return await this.handleResume(message);
      case '~stop':
        return await this.handleStop(message);
      case '~skip':
        return await this.handleSkip(message);
      case '~clear':
        return await this.handleClear(message);
      default: 
      return message.channel.send(`Unknown command: **${ command }**`);

    }
  }
  handlePlay = async(message: Message) => {
    const args = message.content.split(" ");
    const songName: string = args[1];
    const serverID =  message.guildId;
  
    let serverQueue : ServerQueue = await this.getQueue(serverID);
    if(!serverQueue) {
      serverQueue = this.createServerQueue(message);
    }
    const searched = await playdl.search(songName, { source : { youtube : "video" } });
    const request = Factory.makeSongRequest(searched[0].title, searched[0].url);
    return await serverQueue.add(request);
  }

  handlePause = async (message: Message) => {
    const serverID =  message.guildId;
    let serverQueue : ServerQueue = await this.getQueue(serverID);
    if(!serverQueue) {
      serverQueue = this.createServerQueue(message);
    }
    return await serverQueue.pause();
  }

  handleResume = async(message: Message) => {
    const serverID =  message.guildId;
    let serverQueue : ServerQueue = await this.getQueue(serverID);
    if(!serverQueue) {
      serverQueue = this.createServerQueue(message);
    }
    return await serverQueue.resume();
  }
  handleStop = async(message: Message) => {
    const serverID =  message.guildId;
    let serverQueue : ServerQueue = await this.getQueue(serverID);
    if(!serverQueue) {
      serverQueue = this.createServerQueue(message);
    }
    return await serverQueue.stop();
  }
  handleSkip = async(message: Message) => {
    const serverID =  message.guildId;
    let serverQueue : ServerQueue = await this.getQueue(serverID);
    if(!serverQueue) {
      serverQueue = this.createServerQueue(message);
    }
    return await serverQueue.next();
  }
  handleClear = async(message: Message) => {
    const serverID =  message.guildId;
    let serverQueue : ServerQueue = await this.getQueue(serverID);
    if(!serverQueue) {
      serverQueue = this.createServerQueue(message);
    }
    return await serverQueue.clear();
  }
  createServerQueue = (message: Message):ServerQueue => {
    let  serverQueue: ServerQueue;
    const serverID =  message.guildId;
    const player = createAudioPlayer();
    const text = message.channel as TextChannel;
    const voice = message.member.voice.channel;
    
    player.on('error',(e)=>console.log(e));
    player.on('stateChange',(e)=>console.log(e));

    const connection = joinVoiceChannel({ 
      channelId: message.member.voice.channelId, 
      guildId: serverID,  
      adapterCreator:  message.guild.voiceAdapterCreator
    });

    connection.subscribe(player);

    const channelInfo = Factory.makeChannelInfo(player, text, voice, connection );
    serverQueue = Factory.makeServerQueue(channelInfo)
    this.servers.set(serverID, serverQueue);
    return serverQueue;
  };
  
  getQueue = async (serverID): Promise<ServerQueue | undefined> => await this.servers.get(serverID);
  
  init = () => {
    if(!this.discord) {
      this.servers = new Map();
      this.discord = new Client({ intents: this.permissions });
      this.discord.login(this.token);
      this.discord.on('messageCreate', this.onMessage);
      this.discord.on('ready', this.onReady);
      this.discord.on('reconnecting', this.onReconnecting);
      this.discord.on('disconnect', this.onDisconnected);
    }
  }
  /**next = async (serverID) => {
    let serverQueue = await this.getQueue(serverID);
    const songIndex = serverQueue.active + 1;
    serverQueue.active = songIndex;
    const song = serverQueue.songs[songIndex];
    return await this.play(serverID, song);
  }
  
  stop = () => {}
  
  add = async (message:Message) => { 
    const args = message.content.split(" ");
    const command: string = args[0];
    const songName: string = args[1];
    const serverID =  message.guildId;
    const adapter = message.guild.voiceAdapterCreator;
    const textChannel = message.channel;
    const voiceChannel = message.member.voice.channelId;
  
    let serverQueue = await this.getQueue(serverID);
    if(!serverQueue) {
      serverQueue = await this.makeQueue(serverID, adapter, textChannel, voiceChannel)
      this.servers.set(serverID, serverQueue);
    }
    const searched = await playdl.search(songName, { source : { youtube : "video" } });
   
    const song: ISongRequest = { title:  searched[0].title, url:  searched[0].url };
    serverQueue.songs.push(song);
    if(!serverQueue.playing){ return await this.play(serverID, song); }
    return;
  }
  
  search = async () => {
    const searched = await playdl.search(songName, { source : { youtube : "video" } }); 
    const song: ISongRequest = { title:  searched[0].title, url:  searched[0].url };
  }
  play = async (serverID, song) => {
    let serverQueue = await this.getQueue(serverID);
    if(!song) {
      serverQueue.voiceChannel.leave();
      this.servers.delete(serverID);
      return undefined;
    } 
    if(!serverQueue.playing) { serverQueue.playing = true; }

    const connection:VoiceConnection = serverQueue.connection;
    const info = await video_info(song.url)
    const source = await playdl.stream_from_info(info)
    const resource = createAudioResource(source.stream, { inputType : source.type });
    const audioPlayer = createAudioPlayer();

    audioPlayer.on('error',(e)=>console.log(e));
    audioPlayer.on('stateChange',(e)=>console.log(e));

    connection.subscribe(audioPlayer);
    audioPlayer.play(resource);
  
    return serverQueue.textChannel.send(`Start playing: **${song.title}**`);
  }
  
  validate  = async (message:Message) => {
    const channel = message.channel;
    if(!channel.isVoiceBased()) {
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );    
    }
    const user = message.client.user;
    const permissions = channel.permissionsFor(user);
    if (!permissions.has(PermissionsBitField.Flags.Connect) || !permissions.has(PermissionsBitField.Flags.Speak)) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }
  }**/

}