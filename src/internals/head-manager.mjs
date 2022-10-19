import { HeadResult } from './head-result';
import { MediaData } from '../api/media-data.mjs';
import { ProjectData } from '../api/project-data.mjs';

import addScriptIfAbsent from '../dom/add-script-if-absent.mjs';
import defineProperties from '../ecma/define-properties';
import getOwnPropertyDescriptors from '../ecma/get-own-property-descriptors.mjs';
import isUndefined from '../check/is-undefined.mjs';
import toOrigin from '../coerce/to-origin.mjs';
import toURL from '../coerce/to-url';

const DEFAULT_HREF = _TARGET_ === 'browser' ? location.href : undefined,
  DEFAULT_ORIGIN = 'https://fast.wistia.net';

const CHANNEL_PARAM = 'wgalleryid',
  CHANNEL_VIDEO_PARAM = 'wvideoid',
  LOADER_PARAM = 'e-v1-loader';

const ORIGIN_K = Symbol(),
  URL_K = Symbol();

////////////////////////////////////////////////////////////////////////////////
//
// The HeadManager implementation branches depending on whether we’re in the
// client or in node. The common facets of the API are defined here, and then we
// define the methods with branching implementations after.
//
// Most of this is internal. The addChannelId, addMediaId and finalize methods
// will be exposed indirectly on the WistiaContext object that gets shared from
// <WistiaProvider>.
//
// The user input setters here do not throw, instead logging errors. The guiding
// principle here is that we don’t want an error — whether our own or a user’s —
// to be fatal to rendering, and we’ll try to do as much as we can regardless of
// whether particular functionality cannot be used. On the other hand it’s still
// important to communicate actionable information to developers when something
// isn’t right. For the same reason we log and filter failed API requests but do
// not abort the overall operation.

export class HeadManager {
  constructor({ href = DEFAULT_HREF, origin = DEFAULT_ORIGIN }) {
    this.origin = origin;
    this.url = href;

    if (_TARGET_ === 'node') {
      this.headResult = new HeadResult({ url: this.url });
    }
  }

  [ORIGIN_K] = DEFAULT_ORIGIN;
  [URL_K] = undefined;

  channelIds = new Set();
  exposedResult = undefined;
  headResult = undefined;
  videoIds = new Set();

  get activeChannelProjectHashedId() {
    return this.url && this.url.searchParams.get(CHANNEL_PARAM);
  }

  get activeChannelVideoHashedId() {
    return this.url && this.url.searchParams.get(CHANNEL_VIDEO_PARAM);
  }

  get channelUrl() {
    return `${this.origin}/assets/external/channel.js`;
  }

  get hasUrl() {
    return !isUndefined(this.url);
  }

  get origin() {
    return this[ORIGIN_K];
  }

  set origin(origin) {
    try {
      this[ORIGIN_K] = toOrigin(origin);
    } catch (err) {
      console.error(err);
    }
  }

  get playerUrl() {
    return this.shouldUseLoader
      ? `${this.origin}/assets/external/E-v1-loader.js`
      : `${this.origin}/assets/external/E-v1.js`;
  }

  get shouldUseLoader() {
    return this.hasUrl && this.url.searchParams.get(LOADER_PARAM) === 'true';
  }

  get url() {
    return this[URL_K];
  }

  set url(url) {
    try {
      this[URL_K] = toURL(url);
    } catch (err) {
      console.error(err);
    }
  }
}

// BROWSER /////////////////////////////////////////////////////////////////////
//
// In the client, we’re not interested in the IDs themselves, only the fact that
// an embed of a particular type has appeared. The appearance of a channel or
// player necessitates loading the associated Wistia script. The script may have
// been included already during SSR, so we check for its existence before
// appending it. The state (“has already loaded”) is inherently global in the
// client due to the nature of scripts, which is why it is not modeled as part
// of the HeadManager instance.
//
// The finalize method is explicitly defined so that we can clearly communicate
// why it’s not available; if a user is calling it in clientside code, it is a
// signal that their wiring up of the provider is super borked and needs to be
// fixed.

if (_TARGET_ === 'browser') {
  let hasLoadedChannelScript;
  let hasLoadedPlayerScript;

  defineProperties(
    HeadManager.prototype,
    getOwnPropertyDescriptors(
      class {
        addChannelId() {
          if (!hasLoadedChannelScript) {
            hasLoadedChannelScript = true;
            addScriptIfAbsent(this.channelUrl);
          }
        }

        addVideoId() {
          if (!hasLoadedPlayerScript) {
            hasLoadedPlayerScript = true;
            addScriptIfAbsent(this.playerUrl);
          }
        }

        finalize() {
          return Promise.reject(new Error('WistiaContext.finalize is SSR-only'));
        }
      }.prototype,
    ),
  );
}

// NODE ////////////////////////////////////////////////////////////////////////
//
// On the Node side, adding channels and videos is about collecting metadata
// from the render operation to later convert into head elements for SSR. This
// is where most of the interesting stuff happens.

if (_TARGET_ === 'node') {
  defineProperties(
    HeadManager.prototype,
    getOwnPropertyDescriptors(
      class {
        get needsChannel() {
          return this.channelIds.size !== 0;
        }

        get needsPlayer() {
          return this.videoIds.size !== 0;
        }

        addChannelId(hashedId) {
          this.channelIds.add(hashedId);
        }

        addVideoId(hashedId) {
          this.videoIds.add(hashedId);
        }

        async finalize() {
          if (isUndefined(this.exposedResult)) {
            this.finalizeExternalScripts();

            await this.finalizeActiveChannel();
            await this.finalizeVideos();

            this.exposedResult = this.headResult.finalize();
          }

          return this.exposedResult;
        }

        async finalizeActiveChannel() {
          // If a channel ID param does not exist, regardless of whether channels
          // appear in the rendered page, there is no metadata to add.

          if (isUndefined(this.activeChannelProjectHashedId)) {
            return;
          }

          // If a channel ID param does exist but no matching channel appeared in
          // the rendered page, it’s illegitimate.

          if (!this.channelIds.has(this.activeChannelProjectHashedId)) {
            return;
          }

          const project = await this.getProject(this.activeChannelProjectHashedId);

          // If no project is found with the channel ID, there’s nothing we can do.

          if (isUndefined(project)) {
            return;
          }

          // The first and last relations can no be derived from the project.

          const { firstVideo, lastVideo } = project;

          if (firstVideo) {
            this.headResult.setSeriesRelation(
              'first',
              new URLSearchParams([
                [CHANNEL_PARAM, project.hashedId],
                [CHANNEL_VIDEO_PARAM, firstVideo.hashedId],
              ]),
            );
          }

          if (lastVideo) {
            this.headResult.setSeriesRelation(
              'last',
              new URLSearchParams([
                [CHANNEL_PARAM, project.hashedId],
                [CHANNEL_VIDEO_PARAM, lastVideo.hashedId],
              ]),
            );
          }

          // The next steps depend on whether a (valid) video ID param exists as
          // well. If it does, the title and links will be different from what they
          // would be if this were a channel link alone.

          if (this.activeChannelVideoHashedId) {
            const video = project.getVideo(this.activeChannelVideoHashedId);

            // If the video is found (and it must belong to this project), then we
            // should delete it from the general videoIds just to be safe; otherwise
            // it would be possible to include its LD+JSON data twice.
            //
            // Unlike with non-channel embeds, we do not include the cached media
            // data for active channel videos. This is because the channels script
            // will make an API call for the project at initialization regardless
            // and it will include this media data. Presently it does not seem that
            // we can pre-cache the project media data like we can do for videos.

            if (video) {
              this.videoIds.delete(this.activeChannelVideoHashedId);
              this.headResult.addLinkedDataScript(video.toLinkedData());
              this.headResult.setCanonical(CHANNEL_PARAM, CHANNEL_VIDEO_PARAM);
              this.headResult.setTitle(video, project);

              // Prev and next relations are similar to first and last.

              const { prev, next } = project.getAdjacentVideos(video.hashedId);

              if (prev) {
                this.headResult.setSeriesRelation(
                  'prev',
                  new URLSearchParams([
                    [CHANNEL_PARAM, project.hashedId],
                    [CHANNEL_VIDEO_PARAM, prev.hashedId],
                  ]),
                );
              }

              if (next) {
                this.headResult.setSeriesRelation(
                  'next',
                  new URLSearchParams([
                    [CHANNEL_PARAM, project.hashedId],
                    [CHANNEL_VIDEO_PARAM, next.hashedId],
                  ]),
                );
              }

              return;
            }
          }

          // If there was no video ID or no matching video, we set the canonical
          // and title to match the project root.

          if (firstVideo) {
            this.headResult.setSeriesRelation(
              'next',
              new URLSearchParams([
                [CHANNEL_PARAM, project.hashedId],
                [CHANNEL_VIDEO_PARAM, firstVideo.hashedId],
              ]),
            );
          }

          this.headResult.setCanonical(CHANNEL_PARAM);
          this.headResult.setTitle(project);
        }

        finalizeExternalScripts() {
          if (this.needsPlayer) {
            this.headResult.addExternalScript(this.playerUrl);
          }

          if (this.needsChannel) {
            this.headResult.addExternalScript(this.channelUrl);
          }
        }

        async finalizeVideos() {
          const promises = Array.from(this.videoIds, this.getVideo, this);
          const videos = (await Promise.all(promises)).filter(Boolean);

          for (const video of videos) {
            this.headResult.addLinkedDataScript(video.toLinkedData());
            this.headResult.addCachedMediaStatement(video.toJSON());
          }
        }

        async getProject(hashedId) {
          try {
            return await ProjectData.get(hashedId, this.origin);
          } catch (err) {
            console.log(err);
          }
        }

        async getVideo(hashedId) {
          try {
            return await MediaData.get(hashedId, this.origin);
          } catch (err) {
            console.log(err);
          }
        }
      }.prototype,
    ),
  );
}
