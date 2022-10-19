import { MediaData } from './media-data.mjs';
import fetch from 'node-fetch';

// SSR ONLY ////////////////////////////////////////////////////////////////////

const ORIGIN = Symbol(),
  RAW_DATA = Symbol();

export class ProjectData {
  static async get(hashedId, origin) {
    const uriHashedId = encodeURIComponent(hashedId);
    const url = `${origin}/embed/gallery/project/${uriHashedId}.json`;
    const response = await fetch(url);

    if (response.ok) {
      const rawData = await response.json();
      return new this(rawData, origin);
    }

    throw new Error(
      `Fetch of Wistia project data ${JSON.stringify(hashedId)} failed ` + `(${response.status})`,
    );
  }

  constructor(rawData, origin) {
    this[RAW_DATA] = rawData;
    this[ORIGIN] = origin;

    ({ sections: this.sections = [] } = Object(this.firstSeries));
    this.videos = this.sections.flatMap((section) => section.videos);
  }

  get description() {
    return Object(this.firstSeries).description;
  }

  get firstSeries() {
    return this[RAW_DATA].series[0];
  }

  get firstVideo() {
    return this.videos[0];
  }

  get hashedId() {
    return this[RAW_DATA].hashedId;
  }

  get lastVideo() {
    return this.videos[this.videos.length - 1];
  }

  get title() {
    return Object(this.firstSeries).title;
  }

  getAdjacentVideos(hashedId) {
    const index = this.videos.findIndex((video) => video.hashedId === hashedId);

    let next, prev;

    if (index !== -1) {
      const prevIndex = index - 1;
      const nextIndex = index + 1;

      if (prevIndex in this.videos) {
        prev = new MediaData(this.videos[prevIndex].mediaData, this[ORIGIN]);
      }

      if (nextIndex in this.videos) {
        next = new MediaData(this.videos[nextIndex].mediaData, this[ORIGIN]);
      }
    }

    return { next, prev };
  }

  getVideo(hashedId) {
    const video = this.videos.find((video) => video.hashedId === hashedId);

    if (video) {
      return new MediaData(video.mediaData, this[ORIGIN]);
    }
  }

  toJSON() {
    return this[RAW_DATA];
  }
}
