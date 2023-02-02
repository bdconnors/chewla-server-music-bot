import { Client, Message, TextChannel } from 'discord.js';
import { IChewlaBot } from '../interface/IChewlaBot';
import { IChewlaBotOptions } from '../interface/IChewlaBotOptions';
import { ServerQueue } from '../model/ServerQueue';
import { ServerQueueFactory, SongRequestFactory, ChannelConnectionFactory } from '../factory';
import playdl from 'play-dl';

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
      case '~select':
        return await this.handleSelect(message);
      default: 
      return message.channel.send(`Unknown command: **${ command }**`);

    }
  }
  handlePlay = async(message: Message) => {
    const args = message.content.split(' ');
    args.shift();
    const songName = args.join(' ');
    const serverID =  message.guildId;
    let serverQueue : ServerQueue = await this.getQueue(serverID);
    if(!serverQueue) { serverQueue = this.createServerQueue(message); }
    const searched = await playdl.search(songName, { source : { youtube : "video" } });
    serverQueue.display(searched);
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
    const serverID = message.guildId;
    let serverQueue: ServerQueue = await this.getQueue(serverID);
    if(!serverQueue) {
      serverQueue = this.createServerQueue(message);
    }
    return await serverQueue.clear();
  }
  handleSelect = async(message: Message) => {
    const selection: number = parseInt(message.content.split(" ")[1]);
    const serverID = message.guildId;
    const serverQueue: ServerQueue = await this.getQueue(serverID);
    serverQueue.init();
    await serverQueue.select(selection);
  }
  createServerQueue = (message: Message):ServerQueue => {
    const server = message.guild;
    const text = message.channel as TextChannel;
    const voice = message.member.voice.channel;
    
    const channelInfo = ChannelConnectionFactory.make(server, text, voice);
    const serverQueue = ServerQueueFactory.make(channelInfo)
    this.servers.set(server.id, serverQueue);
    return serverQueue;
  }
  search = async(title:string) => {
    const searched = await playdl.search(title, { source : { youtube : "video" } });
    const request = SongRequestFactory.make(searched[0].title, searched[0].url);
  }
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
}