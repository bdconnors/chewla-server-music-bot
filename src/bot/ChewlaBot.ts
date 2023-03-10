import { Client, Message, TextChannel } from 'discord.js';
import { IChewlaBot } from './IChewlaBot';
import { ChewlaBotOptions } from './ChewlaBotOptions';
import { YoutubePlayer } from '../model/YoutubePlayer';
import { YoutubePlayerFactory, ChannelConnectionFactory } from '../factory';

export class ChewlaBot implements IChewlaBot {
  prefix: string;

  token: string;

  permissions: number;

  discord: Client;

  servers: Map<any, YoutubePlayer>;

  public constructor(options: ChewlaBotOptions) {
    this.prefix = options.prefix;
    this.token = options.token;
    this.permissions = options.permissions;
  }

  onReady = () => console.log('Connected!');

  onReconnecting = () => console.log('Reconnecting...');

  onDisconnected = () => console.log('Disconnected!');

  onMessage = async (message: Message) => {
    console.log(message);
    const isBotCommand = !message.author.bot && message.content.startsWith(this.prefix);
    if (isBotCommand) {
      const player = await this.connect(message);
      const command = await player.getCommand(message);
      await command(message);
    }
  };

  connect = async (message: Message):Promise<YoutubePlayer> => {
    const serverID = message.guild.id;
    let player: YoutubePlayer | undefined = await this.getPlayer(serverID);
    if (!player) {
      player = this.createPlayer(message);
    }
    return player;
  };

  createPlayer = (message: Message):YoutubePlayer => {
    const server = message.guild;
    const text = message.channel as TextChannel;
    const voice = message.member.voice.channel;

    const channelInfo = ChannelConnectionFactory.make(server, text, voice);
    const serverQueue = YoutubePlayerFactory.make(channelInfo);
    this.servers.set(server.id, serverQueue);
    return serverQueue;
  };

  getPlayer = async (serverID): Promise<YoutubePlayer | undefined> => this.servers.get(serverID);

  init = () => {
    if (!this.discord) {
      this.servers = new Map();
      this.discord = new Client({ intents: this.permissions });
      this.discord.login(this.token);
      this.discord.on('messageCreate', this.onMessage);
      this.discord.on('ready', this.onReady);
      this.discord.on('reconnecting', this.onReconnecting);
      this.discord.on('disconnect', this.onDisconnected);
    }
  };
}
