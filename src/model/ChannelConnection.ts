import { AudioPlayer, AudioResource, createAudioPlayer, CreateVoiceConnectionOptions, joinVoiceChannel, JoinVoiceChannelOptions, VoiceConnection } from "@discordjs/voice";
import { Guild, TextChannel, VoiceBasedChannel } from "discord.js";

export class ChannelConnection {
  
  server:Guild;
  textChannel:TextChannel;
  voiceChannel: VoiceBasedChannel;
  conn?:VoiceConnection;
  player?: AudioPlayer;

  public constructor(server:Guild, text:TextChannel, voice: VoiceBasedChannel, player?:AudioPlayer, conn?:VoiceConnection) {
    this.server = server;
    this.textChannel = text;
    this.voiceChannel = voice;
    this.player = player;
    this.conn = conn;
  }

  leave = () => {
    if(this.conn) {
      this.conn.destroy();
      this.conn = undefined;
    }
  }

  join = () => {
    if(!this.conn) {
      const options = this.getConnectionOptions();
      this.conn = joinVoiceChannel(options);
      this.player = createAudioPlayer();   
      this.player.on('error',(e)=>console.log(e));
      this.conn.subscribe(this.player);
    }else {
      console.log('channel already joined');
    }
  }

  sendAudio = (audio:AudioResource<null>) => this.player.play(audio);

  sendMessage = (content:string) => this.textChannel.send(content);

  getConnectionOptions = (): CreateVoiceConnectionOptions & JoinVoiceChannelOptions => {
    const channelID = this.voiceChannel.id;
    const serverID = this.server.id;
    const voiceAdapter = this.server.voiceAdapterCreator;
    return { 
      channelId: channelID, 
      guildId: serverID, 
      adapterCreator: voiceAdapter 
    } as CreateVoiceConnectionOptions & JoinVoiceChannelOptions;
  }

  isActive =  () => this.conn !== undefined;
}