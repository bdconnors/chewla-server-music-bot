import { Client } from 'discord.js';

export interface IChewlaBot {
  prefix: string,
  token: string
  permissions: number,
  discord: Client,
  init: () => void,
  onReady: () => void,
  onReconnecting: () => void,
  onDisconnected: () => void,
  onMessage: (message:any) => void,
}