import fetch from 'node-fetch';
import isUndefined from '../check/is-undefined.mjs';

// SSR ONLY ////////////////////////////////////////////////////////////////////

const LD_CONTEXT_K = '@context',
  LD_DESCRIPTION_K = 'description',
  LD_DURATION_K = 'duration',
  LD_EMBED_URL_K = 'embedUrl',
  LD_ID_K = '@id',
  LD_NAME_K = 'name',
  LD_THUMBNAIL_URL_K = 'thumbnailUrl',
  LD_TRANSCRIPT_K = 'transcript',
  LD_TYPE_K = '@type',
  LD_UPLOAD_DATE_K = 'uploadDate';

const LD_CONTEXT = 'http://schema.org/',
  LD_TYPE_VIDEO_OBJECT = 'VideoObject';

const ORIGIN = Symbol(),
  RAW_DATA = Symbol();

export class MediaData {
  static async get(hashedId, origin) {
    const uriHashedId = encodeURIComponent(hashedId);
    const url = `${origin}/embed/medias/${uriHashedId}.json`;
    const response = await fetch(url);

    if (response.ok) {
      const { media } = await response.json();
      return new this(media, origin);
    }

    throw new Error(
      `Fetch of Wistia media data ${JSON.stringify(hashedId)} failed ` + `(${response.status})`,
    );
  }

  constructor(rawData, origin) {
    this[RAW_DATA] = rawData;
    this[ORIGIN] = origin;
  }

  get embedUrl() {
    return `${this[ORIGIN]}/embed/iframe/${this.uriHashedId}`;
  }

  get hashedId() {
    return this[RAW_DATA].hashedId;
  }

  get iframeUrl() {
    return `${this[ORIGIN]}/embed/iframe/${this.uriHashedId}`;
  }

  get description() {
    return this[RAW_DATA].seoDescription;
  }

  get duration() {
    // Flooring seconds for consistency with player-side implementation, though
    // I wonder if it should be rounded? (duration 112.53 -> PT1M53S vs PT1M52S)

    let seconds = Math.floor(this[RAW_DATA].duration);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds -= minutes * 60;
    minutes -= hours * 60;

    return [`PT`, `${hours}H`, `${minutes}M`, `${seconds}S`]
      .filter((str) => str[0] !== '0')
      .join('');
  }

  get thumbnailUrl() {
    return this[RAW_DATA].assets
      .filter((asset) => asset.type === 'still_image')[0]
      ?.url.replace('.bin', '.jpg');
  }

  get title() {
    return this[RAW_DATA].name;
  }

  get transcript() {
    return Object(Object(this[RAW_DATA].captions)[0]).text;
  }

  get uploadDate() {
    const seconds = this[RAW_DATA].createdAt;

    if (isUndefined(seconds) === false) {
      const ms = this[RAW_DATA].createdAt * 1000;
      return new Date(ms).toISOString().split('T').shift();
    }
  }

  get uriHashedId() {
    return encodeURIComponent(this.hashedId);
  }

  toJSON() {
    return this[RAW_DATA];
  }

  toLinkedData() {
    return {
      [LD_CONTEXT_K]: LD_CONTEXT,
      [LD_DESCRIPTION_K]: this.description,
      [LD_DURATION_K]: this.duration,
      [LD_EMBED_URL_K]: this.embedUrl,
      [LD_ID_K]: this.iframeUrl,
      [LD_NAME_K]: this.title,
      [LD_THUMBNAIL_URL_K]: this.thumbnailUrl,
      [LD_TRANSCRIPT_K]: this.transcript,
      [LD_TYPE_K]: LD_TYPE_VIDEO_OBJECT,
      [LD_UPLOAD_DATE_K]: this.uploadDate,
    };
  }
}
