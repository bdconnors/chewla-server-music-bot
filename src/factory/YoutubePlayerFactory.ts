import { ChannelConnection, YoutubePlayer } from '../model';

export class YoutubePlayerFactory {
  public static make = (connection:ChannelConnection) => new YoutubePlayer(connection);
}
