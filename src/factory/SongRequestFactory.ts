import { SongRequest } from '../model';

export class SongRequestFactory {
  public static make = (title:string, url:string): SongRequest => new SongRequest(title, url);
}
