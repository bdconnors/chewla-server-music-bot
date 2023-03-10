import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  CreateVoiceConnectionOptions,
  joinVoiceChannel,
  JoinVoiceChannelOptions,
  VoiceConnection,
} from '@discordjs/voice';
import { Guild, TextChannel, VoiceBasedChannel } from 'discord.js';
import { ChannelConnectionFactory } from '../factory';

export type ChannelConnectionOptions = CreateVoiceConnectionOptions & JoinVoiceChannelOptions;

export class ChannelConnection {
  server:Guild;

  textChannel:TextChannel;

  voiceChannel: VoiceBasedChannel;

  conn?:VoiceConnection;

  player?: AudioPlayer;

  public constructor(
    server:Guild,
    text:TextChannel,
    voice: VoiceBasedChannel,
    player?:AudioPlayer,
    conn?:VoiceConnection,
  ) {
    this.server = server;
    this.textChannel = text;
    this.voiceChannel = voice;
    this.player = player || createAudioPlayer();
    this.conn = conn;
  }

  leave = () => {
    if (this.conn) {
      this.conn.destroy();
      this.conn = undefined;
    }
  };

  join = () => {
    if (!this.conn) {
      const channelId = this.voiceChannel.id;
      const serverId = this.server.id;
      const adapter = this.server.voiceAdapterCreator;
      const options = ChannelConnectionFactory.makeOptions(channelId, serverId, adapter);
      this.conn = joinVoiceChannel(options);
      this.conn.subscribe(this.player);
    } else {
      console.log('channel already joined');
    }
  };

  sendAudio = (audio:AudioResource<null>) => this.player.play(audio);

  sendMessage = (content:string) => this.textChannel.send(content);

  isActive = () => this.conn !== undefined;
}
