'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');
var propTypes = require('prop-types');
var fetch = require('node-fetch');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var propTypes__default = /*#__PURE__*/_interopDefaultLegacy(propTypes);
var fetch__default = /*#__PURE__*/_interopDefaultLegacy(fetch);

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

const WistiaContext = /*#__PURE__*/react.createContext();

function isUndefined(value) {
  return value === undefined;
}

// Serializing React props to wistia class option syntax is generally similar to
// serializing query parameters except that the member delimiter is whitespace
// rather than ampersand. Keys are fixed, whitelisted values that we know do not
// need URI encoding.
//
// The videoFoam option is a unique case because its value can be JSON. To
// account for this, if the key is videoFoam and the value is an object, we
// assume it should be serialized to JSON rather than coerced to string as we do
// for all other values.
function serializeOptionEntry([key, value]) {
  if (key === 'videoFoam' && Object(value) === value) {
    value = JSON.stringify(value);
  }

  return `${key}=${encodeURIComponent(value)}`;
}

const CHANNEL_OPTION_KEYS = new Set(['embedHost', 'hashedId', 'height', 'heroImageAspectRatio', 'heroImageUrl', 'id', 'mode', 'width']);
class WistiaChannel extends react.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "state", {
      safeToRender: false
    });
  }

  get classNames() {
    return `${this.embedClassNames} ${this.optionsAsCSSClassNames}`;
  }

  get embedClassNames() {
    return `wistia_channel wistia_async_${this.props.hashedId}`;
  }

  get optionsAsCSSClassNames() {
    return Object.entries(this.props).filter(isWistiaChannelOptionEntry).map(serializeOptionEntry).join(' ');
  }

  componentDidMount() {
    this.setState({
      safeToRender: true
    });
    this.context.dispatch({
      type: 'prepare-for-channel',
      payload: {
        hashedId: this.props.hashedId
      }
    });
  }

  render() {
    // SSR doesn't call methods like componentDidMount, so it's crucial that we add the channel
    // to head manager here in render as well in componentDidMount.
    // It would also be incorrect to call dispatch inside the render method, so we avoid doing that and
    // instead use the bound head manager methods directly
    this.context.wistiaContext.addChannelId(this.props.hashedId);
    return this.state.safeToRender ? /*#__PURE__*/react.createElement("div", {
      className: this.classNames,
      id: this.props.id,
      key: this.props.hashedId
    }) : null;
  }

} ////////////////////////////////////////////////////////////////////////////////

_defineProperty(WistiaChannel, "contextType", WistiaContext);

_defineProperty(WistiaChannel, "defaultProps", {
  mode: 'inline'
});

_defineProperty(WistiaChannel, "propTypes", {
  embedHost: propTypes__default["default"].string,
  hashedId: propTypes__default["default"].string.isRequired,
  height: propTypes__default["default"].number,
  heroImageAspectRatio: propTypes__default["default"].number,
  heroImageUrl: propTypes__default["default"].string,
  id: propTypes__default["default"].string,
  mode: propTypes__default["default"].string,
  width: propTypes__default["default"].number
});

function isWistiaChannelOptionEntry([key, value]) {
  return CHANNEL_OPTION_KEYS.has(key) && !isUndefined(value);
}

const DEFAULT_ASPECT_RATIO = 640 / 360;
const PLAYER_OPTION_KEYS = new Set(['autoPlay', 'chromeless', 'controlsVisibleOnLoad', 'doNotTrack', 'email', 'embedHost', 'endVideoBehavior', 'fullscreenButton', 'googleAnalytics', 'hashedId', 'height', 'hls', 'id', 'idType', 'muted', 'playbackRateControl', 'playbar', 'playButton', 'playerColor', 'playlistLinks', 'playlistLoop', 'playPauseNotifier', 'popover', 'popoverAnimateThumbnail', 'popoverContent', 'popoverOverlayOpacity', 'preload', 'qualityControl', 'qualityMax', 'qualityMin', 'resumable', 'seo', 'settingsControl', 'silentAutoPlay', 'smallPlayButton', 'stillUrl', 'time', 'videoFoam', 'volume', 'volumeControl', 'width', 'wmode']);
const PLAYER_EVENT_KEYS = new Set(['onAfterReplace', 'onBeforeRemove', 'onBeforeReplace', // 'onBetweenTimes',
'onCancelFullscreen', 'onCaptionsChange', 'onConversion', // 'onCrosstime',
'onEnd', 'onEnterFullscreen', 'onHeightChange', 'onLookChange', 'onMuteChange', 'onPause', 'onPercentWatchedChanged', 'onPlay', 'onPlaybackRateChange', 'onSecondChange', 'onSeek', 'onSilentPlaybackModeChange', 'onTimeChange', 'onVolumeChange', 'onWidthChange']);
/**
 * Takes in an event name (one from the list of PLAYER_EVENT_KEYS)
 * and returns an event in the format that Player expects.
 *
 * That is, all lowercase without the "on" prefix.
 *
 * @param {string} event
 */

function normalizeEventForPlayer(eventKey = '') {
  return eventKey.replace('on', '').toLowerCase();
}

class WistiaPlayer extends react.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "player", null);

    _defineProperty(this, "state", {
      safeToRender: false
    });

    _defineProperty(this, "setupPlayerAfterReady", player => {
      var _this$context$dispatc, _this$context;

      (_this$context$dispatc = (_this$context = this.context).dispatch) === null || _this$context$dispatc === void 0 ? void 0 : _this$context$dispatc.call(_this$context, {
        type: 'add-wistia-player',
        payload: {
          player,
          hashedId: this.props.hashedId
        }
      });
      this.setupEventBindings(player);
    });
  }

  get classNames() {
    return `${this.embedClassNames} ${this.optionsAsCSSClassNames}`;
  }

  get responsivePaddingStyle() {
    return {
      paddingBottom: 0,
      paddingLeft: 0,
      paddingTop: this.inverseAspectPercent,
      paddingRight: 0,
      position: 'relative'
    };
  }

  get responsiveWrapperStyle() {
    return {
      height: '100%',
      left: 0,
      position: 'absolute',
      top: 0,
      width: '100%'
    };
  }

  get inverseAspectPercent() {
    return `${1 / this.aspectRatio * 100}%`;
  }

  get aspectRatio() {
    if (this.player && this.player.hasData()) {
      return this.player.aspect();
    } else {
      return DEFAULT_ASPECT_RATIO;
    }
  }

  get cssDisplayValue() {
    return this.isPopoverLink ? 'inline' : 'inline-block';
  }

  get cssHeightValue() {
    return isUndefined(this.props.height) ? '100%' : `${this.props.height}px`;
  }

  get cssWidthValue() {
    return isUndefined(this.props.width) ? '100%' : `${this.props.width}px`;
  }

  get embedClassNames() {
    return `wistia_embed wistia_async_${this.props.hashedId}`;
  }

  get isPopover() {
    return isUndefined(this.props.popover) ? react.Children.count(this.props.children) !== 0 : this.props.popover;
  }

  get isPopoverLink() {
    return this.props.popoverContent === 'link';
  }

  get optionsAsCSSClassNames() {
    return Object.entries(this.props).filter(isWistiaPlayerOptionEntry).map(serializeOptionEntry).join(' ');
  }

  get style() {
    return {
      display: this.cssDisplayValue,
      height: this.cssHeightValue,
      width: this.cssWidthValue,
      ...this.props.style
    };
  } //-- React Lifecycle Methods --//


  componentDidMount() {
    this.prepareForPlayerSetup(this.props.hashedId);
    this.context.dispatch({
      type: 'prepare-for-player',
      payload: {
        hashedId: this.props.hashedId
      }
    });
    this.setState({
      safeToRender: true
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.hashedId !== prevProps.hashedId) {
      this.player.replaceWith(this.props.hashedId);
    }
  }

  componentWillUnmount() {
    this.removeEventBindings(this.player);
    this.context.dispatch({
      type: 'remove-wistia-player',
      payload: {
        hashedId: this.props.hashedId
      }
    });
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.hashedId !== this.props.hashedId) {
      return true;
    }

    return !this.state.safeToRender;
  }

  render() {
    // SSR doesn't call methods like componentDidMount, so it's crucial that we add the video
    // to head manager here in render as well in componentDidMount.
    // It would also be incorrect to call dispatch inside the render method, so we avoid doing that and
    // instead use the bound head manager methods directly
    this.context.wistiaContext.addVideoId(this.props.hashedId);

    if (!this.state.safeToRender) {
      return null;
    } // if videoFoam, return a responsive embed, otherwise a fixed embed


    if (this.props.videoFoam) {
      console.log('rendering');
      return /*#__PURE__*/react.createElement("div", {
        className: "wistia_responsive_padding",
        style: this.responsivePaddingStyle
      }, /*#__PURE__*/react.createElement("div", {
        className: "wistia_responsive_wrapper",
        style: this.responsiveWrapperStyle
      }, /*#__PURE__*/react.createElement("div", {
        className: this.classNames,
        id: this.props.id,
        key: this.props.hashedId,
        style: this.style
      }, this.isPopover && this.isPopoverLink ? /*#__PURE__*/react.createElement("a", {
        href: "#"
      }, this.props.children) : ' ')));
    } else {
      return /*#__PURE__*/react.createElement("div", {
        className: this.classNames,
        id: this.props.id,
        key: this.props.hashedId,
        style: this.style
      }, this.isPopover && this.isPopoverLink ? /*#__PURE__*/react.createElement("a", {
        href: "#"
      }, this.props.children) : ' ');
    }
  } //-- Player events --//


  onBeforeReplace(hashedId) {
    this.removeEventBindings();
    this.prepareForPlayerSetup(hashedId);
  } //-- Helper Methods -- //


  removeEventBindings(player) {
    if (player) {
      PLAYER_EVENT_KEYS.forEach(event => {
        player.unbind(normalizeEventForPlayer(event));
      });
      player.unbind('beforereplace');
      window._wq = window._wq || [];

      window._wq.push({
        revoke: this.initConfigOptions
      });
    }
  }

  setupEventBindings(player) {
    const bindToEvent = (event, handler) => {
      const normalizedEventName = normalizeEventForPlayer(event);
      player.bind(normalizedEventName, (...args) => {
        var _this$event;

        // execute handler if it's an event we care about
        (_this$event = this[event]) === null || _this$event === void 0 ? void 0 : _this$event.call(this, ...args); // execute handler for event if it was passed in as a prop

        handler === null || handler === void 0 ? void 0 : handler(...args);
      });
    }; // bind to all possible events that the player emits
    // and forward them off to any functions that may have
    // been passed in as props


    PLAYER_EVENT_KEYS.forEach(event => bindToEvent(event, (...args) => {
      var _this$props$event, _this$props;

      return (_this$props$event = (_this$props = this.props)[event]) === null || _this$props$event === void 0 ? void 0 : _this$props$event.call(_this$props, ...args);
    }));

    if (this.props.customEvents) {
      // bind to any custom events the user may have passed in
      Object.entries(this.props.customEvents).forEach(([key, value]) => {
        bindToEvent(key, value);
      });
    }
  }

  prepareForPlayerSetup(hashedId) {
    const handleEvent = (event, player) => {
      var _this$props$event2, _this$props2;

      (_this$props$event2 = (_this$props2 = this.props)[event]) === null || _this$props$event2 === void 0 ? void 0 : _this$props$event2.call(_this$props2, player);
    };

    this.initConfigOptions = {
      id: hashedId,
      onEmbedded: player => handleEvent('onEmbedded', player),
      onHasData: player => {
        this.player = player;
        handleEvent('onHasData', player);
      },
      onReady: player => {
        handleEvent('onReady', player);
        this.setupPlayerAfterReady(player);
      },
      options: this.props.customOptions ? this.props.customOptions : {}
    };
    window._wq = window._wq || [];

    window._wq.push(this.initConfigOptions);
  }

} ////////////////////////////////////////////////////////////////////////////////

_defineProperty(WistiaPlayer, "contextType", WistiaContext);

_defineProperty(WistiaPlayer, "defaultProps", {
  videoFoam: true
});

_defineProperty(WistiaPlayer, "propTypes", {
  autoPlay: propTypes__default["default"].bool,
  chromeless: propTypes__default["default"].bool,
  controlsVisibleOnLoad: propTypes__default["default"].bool,
  customEvents: propTypes__default["default"].object,
  customOptions: propTypes__default["default"].object,
  doNotTrack: propTypes__default["default"].bool,
  email: propTypes__default["default"].string,
  embedHost: propTypes__default["default"].string,
  endVideoBehavior: propTypes__default["default"].oneOf(['default', 'loop', 'reset']),
  fullscreenButton: propTypes__default["default"].bool,
  googleAnalytics: propTypes__default["default"].bool,
  hashedId: propTypes__default["default"].string.isRequired,
  height: propTypes__default["default"].number,
  hls: propTypes__default["default"].bool,
  id: propTypes__default["default"].string,
  idType: propTypes__default["default"].string,
  muted: propTypes__default["default"].bool,
  playButton: propTypes__default["default"].bool,
  playbackRateControl: propTypes__default["default"].bool,
  playbar: propTypes__default["default"].bool,
  playerColor: propTypes__default["default"].string,
  playlistLinks: propTypes__default["default"].string,
  playlistLoop: propTypes__default["default"].bool,
  playPauseNotifier: propTypes__default["default"].bool,
  popover: propTypes__default["default"].bool,
  popoverAnimateThumbnail: propTypes__default["default"].bool,
  popoverContent: propTypes__default["default"].oneOf(['link', 'html', 'thumbnail']),
  popoverOverlayOpacity: propTypes__default["default"].number,
  preload: propTypes__default["default"].oneOf(['auto', 'metadata', 'none', true, false]),
  qualityControl: propTypes__default["default"].bool,
  qualityMax: propTypes__default["default"].oneOfType([propTypes__default["default"].number, propTypes__default["default"].oneOf(['360p', '540p', '720p', '1080p', '4k'])]),
  qualityMin: propTypes__default["default"].oneOfType([propTypes__default["default"].number, propTypes__default["default"].oneOf(['360p', '540p', '720p', '1080p', '4k'])]),
  resumable: propTypes__default["default"].oneOf([true, false, 'auto']),
  seo: propTypes__default["default"].bool,
  settingsControl: propTypes__default["default"].bool,
  silentAutoPlay: propTypes__default["default"].oneOf(['allow', true, false]),
  smallPlayButton: propTypes__default["default"].bool,
  stillUrl: propTypes__default["default"].string,
  time: propTypes__default["default"].number,
  videoFoam: propTypes__default["default"].oneOfType([propTypes__default["default"].bool, propTypes__default["default"].shape({
    maxHeight: propTypes__default["default"].number,
    maxWidth: propTypes__default["default"].number,
    minHeight: propTypes__default["default"].number,
    minWidth: propTypes__default["default"].number
  })]),
  volume: propTypes__default["default"].number,
  volumeControl: propTypes__default["default"].bool,
  width: propTypes__default["default"].number,
  wmode: propTypes__default["default"].string
});

function isWistiaPlayerOptionEntry([key, value]) {
  return PLAYER_OPTION_KEYS.has(key) && !isUndefined(value);
}

// Text within <script> is terminated only by </script* (and only then when not
// within a comment-like sequence, but that’s not important in context). For
// both JSON and JS this can be backslash-escaped anywhere it would be valid to
// prevent premature termination due to the JS/JSON source text.
//
// https://html.spec.whatwg.org/multipage/parsing.html#appropriate-end-tag-token
function escapeScriptTerminator(src) {
  return src.replace(/<\/script(?=[\f\t />]|$)/gi, '<\\/script');
}

// This is the most primitive and generic ToString operation. It differs
// slightly from String(value) in that it refuses to coerce Symbols.
function toString(value) {
  return `${value}`;
}

const MEDIA_TYPE_JS = 'text/javascript',
      MEDIA_TYPE_LD = 'application/ld+json';
const INIT_QUEUE =
/*syntax:js*/
`w=self._wq=self._wq||[];`;
const CACHE_MEDIA =
/*syntax:js*/
`function $(d){w.push(function(w){w.cacheMedia(d.hashedId,d)})}`; ////////////////////////////////////////////////////////////////////////////////
//
// Like the HeadManager, HeadResult is an internal API. The only deliberately
// exposed portion is the result of HeadResult.prototype.finalize, which is also
// the resolution value of HeadManager.prototype.finalize.
//
// Both HeadManager and HeadResult model state. The relationship is 1:1, so the
// distinction may not be obvious. The difference is that HeadManager models the
// data collected during an ordinary render (e.g. facts like “a wistia video
// with the ID 123 was embedded”) while the HeadResult models the vdom generated
// asynchronously from HeadManager’s collected metadata (e.g. objects like “a
// vdom node for a script that embeds JSON data for a wistia video with the ID
// 123”):
//
// 1. HeadManager collects metadata during render [sync or async]
// 2a. HeadManager.finalize() uses metadata to load API data [async]
// 2b. ...and records the results in its HeadResult as they become available.
// 3. HeadResult.finalize() returns final consumable head elements [sync]

class HeadResult {
  constructor({
    url
  }) {
    _defineProperty(this, "canonical", undefined);

    _defineProperty(this, "head", []);

    _defineProperty(this, "cacheStatements", []);

    _defineProperty(this, "seriesRelations", new Map());

    _defineProperty(this, "title", undefined);

    _defineProperty(this, "url", undefined);

    this.url = url;
  }

  addCachedMediaStatement(data) {
    this.cacheStatements.push(`$(${JSON.stringify(data)});`);
  }

  addExternalScript(src) {
    this.head.push( /*#__PURE__*/react.createElement("script", {
      async: true,
      key: src,
      src: src,
      type: MEDIA_TYPE_JS
    }));
  }

  addLinkedDataScript(data) {
    const key = data.hashedId;
    const html = {
      __html: escapeScriptTerminator(JSON.stringify(data))
    };
    this.head.push( /*#__PURE__*/react.createElement("script", {
      dangerouslySetInnerHTML: html,
      key: key,
      type: MEDIA_TYPE_LD
    }));
  }

  setCanonical(...preservedKeys) {
    if (isUndefined(this.url)) {
      return;
    }

    const url = new URL(this.url);
    url.search = '';

    for (const key of preservedKeys) {
      url.searchParams.set(key, this.url.searchParams.get(key));
    }

    this.canonical = /*#__PURE__*/react.createElement("link", {
      href: url.href,
      key: "canonical",
      rel: "canonical"
    });
  }

  setSeriesRelation(rel, usp) {
    if (isUndefined(this.url)) {
      return;
    }

    const url = new URL(this.url);
    url.search = usp;
    this.seriesRelations.set(rel, /*#__PURE__*/react.createElement("link", {
      href: url.href,
      key: rel,
      rel: rel
    }));
  }

  setTitle(...items) {
    const title = items.map(item => Object(item).title).filter(Boolean).map(item => toString(item).trim()).filter(Boolean).join(' - ');

    if (title) {
      this.title = /*#__PURE__*/react.createElement("title", {
        key: "wistia-title"
      }, title);
    }
  }

  finalize() {
    if (this.canonical) {
      this.head.push(this.canonical);
    }

    for (const link of this.seriesRelations.values()) {
      this.head.push(link);
    }

    if (this.cacheStatements.length !== 0) {
      const statements = [INIT_QUEUE, CACHE_MEDIA, ...this.cacheStatements];
      const js = `!function(w){${statements.join('')}}()`;
      const key = 'wistia-cache';
      const html = {
        __html: escapeScriptTerminator(js)
      };
      this.head.push( /*#__PURE__*/react.createElement("script", {
        dangerouslySetInnerHTML: html,
        key: key,
        type: MEDIA_TYPE_JS
      }));
    }

    return {
      head: this.head,
      title: this.title,
      updateNextJsTitle: updateNextJsTitle.bind(this),
      [Symbol.toStringTag]: 'WistiaHeadResult'
    };
  }

} ////////////////////////////////////////////////////////////////////////////////

function updateNextJsTitle(head) {
  if (this.title) {
    let index = head.findIndex(node => node.type === 'title');

    if (index === -1) {
      index = head.length;
    }

    head[index] = this.title;
  }
}

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
const ORIGIN$1 = Symbol(),
      RAW_DATA$1 = Symbol();
class MediaData {
  static async get(hashedId, origin) {
    const uriHashedId = encodeURIComponent(hashedId);
    const url = `${origin}/embed/medias/${uriHashedId}.json`;
    const response = await fetch__default["default"](url);

    if (response.ok) {
      const {
        media
      } = await response.json();
      return new this(media, origin);
    }

    throw new Error(`Fetch of Wistia media data ${JSON.stringify(hashedId)} failed ` + `(${response.status})`);
  }

  constructor(rawData, origin) {
    this[RAW_DATA$1] = rawData;
    this[ORIGIN$1] = origin;
  }

  get embedUrl() {
    return `${this[ORIGIN$1]}/embed/iframe/${this.uriHashedId}`;
  }

  get hashedId() {
    return this[RAW_DATA$1].hashedId;
  }

  get iframeUrl() {
    return `${this[ORIGIN$1]}/embed/iframe/${this.uriHashedId}`;
  }

  get description() {
    return this[RAW_DATA$1].seoDescription;
  }

  get duration() {
    // Flooring seconds for consistency with player-side implementation, though
    // I wonder if it should be rounded? (duration 112.53 -> PT1M53S vs PT1M52S)
    let seconds = Math.floor(this[RAW_DATA$1].duration);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    seconds -= minutes * 60;
    minutes -= hours * 60;
    return [`PT`, `${hours}H`, `${minutes}M`, `${seconds}S`].filter(str => str[0] !== '0').join('');
  }

  get thumbnailUrl() {
    var _this$RAW_DATA$assets;

    return (_this$RAW_DATA$assets = this[RAW_DATA$1].assets.filter(asset => asset.type === 'still_image')[0]) === null || _this$RAW_DATA$assets === void 0 ? void 0 : _this$RAW_DATA$assets.url.replace('.bin', '.jpg');
  }

  get title() {
    return this[RAW_DATA$1].name;
  }

  get transcript() {
    return Object(Object(this[RAW_DATA$1].captions)[0]).text;
  }

  get uploadDate() {
    const seconds = this[RAW_DATA$1].createdAt;

    if (isUndefined(seconds) === false) {
      const ms = this[RAW_DATA$1].createdAt * 1000;
      return new Date(ms).toISOString().split('T').shift();
    }
  }

  get uriHashedId() {
    return encodeURIComponent(this.hashedId);
  }

  toJSON() {
    return this[RAW_DATA$1];
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
      [LD_UPLOAD_DATE_K]: this.uploadDate
    };
  }

}

const ORIGIN = Symbol(),
      RAW_DATA = Symbol();
class ProjectData {
  static async get(hashedId, origin) {
    const uriHashedId = encodeURIComponent(hashedId);
    const url = `${origin}/embed/gallery/project/${uriHashedId}.json`;
    const response = await fetch__default["default"](url);

    if (response.ok) {
      const rawData = await response.json();
      return new this(rawData, origin);
    }

    throw new Error(`Fetch of Wistia project data ${JSON.stringify(hashedId)} failed ` + `(${response.status})`);
  }

  constructor(rawData, origin) {
    this[RAW_DATA] = rawData;
    this[ORIGIN] = origin;
    ({
      sections: this.sections = []
    } = Object(this.firstSeries));
    this.videos = this.sections.flatMap(section => section.videos);
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
    const index = this.videos.findIndex(video => video.hashedId === hashedId);
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

    return {
      next,
      prev
    };
  }

  getVideo(hashedId) {
    const video = this.videos.find(video => video.hashedId === hashedId);

    if (video) {
      return new MediaData(video.mediaData, this[ORIGIN]);
    }
  }

  toJSON() {
    return this[RAW_DATA];
  }

}

var defineProperties = Object.defineProperties;

var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors;

// canonicalization.

function toOrigin(origin) {
  origin = toString(origin);

  try {
    const url = new URL(origin);

    if (url.href === `${url.origin}/`) {
      return url.origin;
    }
  } catch {}

  throw new URIError(`${JSON.stringify(origin)} is not a valid URL origin`);
}

function toURL(url) {
  return new URL(url);
}

const DEFAULT_HREF = undefined,
      DEFAULT_ORIGIN = 'https://fast.wistia.net';
const CHANNEL_PARAM = 'wgalleryid',
      CHANNEL_VIDEO_PARAM = 'wvideoid',
      LOADER_PARAM = 'e-v1-loader';
const ORIGIN_K = Symbol(),
      URL_K = Symbol(); ////////////////////////////////////////////////////////////////////////////////
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

class HeadManager {
  constructor({
    href = DEFAULT_HREF,
    origin = DEFAULT_ORIGIN
  }) {
    _defineProperty(this, ORIGIN_K, DEFAULT_ORIGIN);

    _defineProperty(this, URL_K, undefined);

    _defineProperty(this, "channelIds", new Set());

    _defineProperty(this, "exposedResult", undefined);

    _defineProperty(this, "headResult", undefined);

    _defineProperty(this, "videoIds", new Set());

    this.origin = origin;
    this.url = href;

    {
      this.headResult = new HeadResult({
        url: this.url
      });
    }
  }

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
    return this.shouldUseLoader ? `${this.origin}/assets/external/E-v1-loader.js` : `${this.origin}/assets/external/E-v1.js`;
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

} // BROWSER /////////////////////////////////////////////////////////////////////
//
// On the Node side, adding channels and videos is about collecting metadata
// from the render operation to later convert into head elements for SSR. This
// is where most of the interesting stuff happens.


{
  defineProperties(HeadManager.prototype, getOwnPropertyDescriptors(class {
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
      } // If a channel ID param does exist but no matching channel appeared in
      // the rendered page, it’s illegitimate.


      if (!this.channelIds.has(this.activeChannelProjectHashedId)) {
        return;
      }

      const project = await this.getProject(this.activeChannelProjectHashedId); // If no project is found with the channel ID, there’s nothing we can do.

      if (isUndefined(project)) {
        return;
      } // The first and last relations can no be derived from the project.


      const {
        firstVideo,
        lastVideo
      } = project;

      if (firstVideo) {
        this.headResult.setSeriesRelation('first', new URLSearchParams([[CHANNEL_PARAM, project.hashedId], [CHANNEL_VIDEO_PARAM, firstVideo.hashedId]]));
      }

      if (lastVideo) {
        this.headResult.setSeriesRelation('last', new URLSearchParams([[CHANNEL_PARAM, project.hashedId], [CHANNEL_VIDEO_PARAM, lastVideo.hashedId]]));
      } // The next steps depend on whether a (valid) video ID param exists as
      // well. If it does, the title and links will be different from what they
      // would be if this were a channel link alone.


      if (this.activeChannelVideoHashedId) {
        const video = project.getVideo(this.activeChannelVideoHashedId); // If the video is found (and it must belong to this project), then we
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
          this.headResult.setTitle(video, project); // Prev and next relations are similar to first and last.

          const {
            prev,
            next
          } = project.getAdjacentVideos(video.hashedId);

          if (prev) {
            this.headResult.setSeriesRelation('prev', new URLSearchParams([[CHANNEL_PARAM, project.hashedId], [CHANNEL_VIDEO_PARAM, prev.hashedId]]));
          }

          if (next) {
            this.headResult.setSeriesRelation('next', new URLSearchParams([[CHANNEL_PARAM, project.hashedId], [CHANNEL_VIDEO_PARAM, next.hashedId]]));
          }

          return;
        }
      } // If there was no video ID or no matching video, we set the canonical
      // and title to match the project root.


      if (firstVideo) {
        this.headResult.setSeriesRelation('next', new URLSearchParams([[CHANNEL_PARAM, project.hashedId], [CHANNEL_VIDEO_PARAM, firstVideo.hashedId]]));
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

  }.prototype));
}

// class-based component.

function useHeadManager({
  href,
  origin
}) {
  const headManager = react.useRef(new HeadManager({
    href,
    origin
  }));
  return headManager.current;
}

const initialState = {
  players: {}
};
function WistiaProvider(props) {
  const {
    children,
    context = {},
    href,
    origin
  } = props;
  const [state, dispatch] = react.useReducer(reducer, initialState);
  const [wistiaContext, setWistiaContext] = react.useState(undefined);
  const headManager = useHeadManager({
    href,
    origin
  });

  function reducer(state, action) {
    switch (action.type) {
      case 'prepare-for-channel':
        {
          headManager === null || headManager === void 0 ? void 0 : headManager.addChannelId(action.payload.hashedId);
          return state;
        }

      case 'prepare-for-player':
        {
          headManager === null || headManager === void 0 ? void 0 : headManager.addVideoId(action.payload.hashedId);
          return state;
        }

      case 'add-wistia-player':
        {
          state.players[action.payload.hashedId] = action.payload.player;
          return { ...state,
            players: { ...state.players
            }
          };
        }

      case 'remove-wistia-player':
        {
          delete state.players[action.payload.hashedId];
          return {
            players: { ...state.players
            }
          };
        }

      default:
        {
          throw new Error(`Unhandled action type: ${action.type}`);
        }
    }
  }

  if (props.context !== wistiaContext) {
    Object.defineProperties(context, {
      addChannelId: {
        value: headManager.addChannelId.bind(headManager),
        writable: true
      },
      addVideoId: {
        value: headManager.addVideoId.bind(headManager),
        writable: true
      },
      finalize: {
        value: headManager.finalize.bind(headManager),
        writable: true
      },
      [Symbol.toStringTag]: {
        value: 'WistiaContext'
      }
    });
    setWistiaContext(context);
  }

  const value = {
    state,
    dispatch,
    wistiaContext
  };
  return /*#__PURE__*/react.createElement(WistiaContext.Provider, {
    value: value
  }, children);
}
/**
 * A way to access the player API from any component that is a child
 * of a WistiaProvider.
 *
 * @param {string} hashedId - the hashed id of the player you want to use
 */

function usePlayer(hashedId) {
  const context = react.useContext(WistiaContext);

  if (context === undefined) {
    throw new Error('usePlayer must be used within a WistiaProvider');
  }

  return context.state.players[hashedId];
}

exports.WistiaChannel = WistiaChannel;
exports.WistiaPlayer = WistiaPlayer;
exports.WistiaProvider = WistiaProvider;
exports.usePlayer = usePlayer;
