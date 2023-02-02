export class SongRequest {
  title: string;
  url: string;
  public constructor(title:string, url:string) {
    this.title = title;
    this.url = url;
  }
}