import { ChannelConnection, ServerQueue } from "../model";

export class ServerQueueFactory {
  public static make = (connection:ChannelConnection) => new ServerQueue(connection);
}