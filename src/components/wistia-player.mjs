import { Children, Component, createElement, createRef } from 'react';
import { WistiaContext } from '../react/wistia-context.mjs';
import isUndefined from '../check/is-undefined.mjs';
import propTypes from 'prop-types';
import serializeOptionEntry from '../react/serialize-option-entry.mjs';

const DEFAULT_ASPECT_RATIO = 640 / 360;

const PLAYER_OPTION_KEYS = new Set([
  'autoPlay',
  'chromeless',
  'controlsVisibleOnLoad',
  'doNotTrack',
  'email',
  'embedHost',
  'endVideoBehavior',
  'fullscreenButton',
  'googleAnalytics',
  'hashedId',
  'height',
  'hls',
  'id',
  'idType',
  'muted',
  'playbackRateControl',
  'playbar',
  'playButton',
  'playerColor',
  'playlistLinks',
  'playlistLoop',
  'playPauseNotifier',
  'popover',
  'popoverAnimateThumbnail',
  'popoverContent',
  'popoverOverlayOpacity',
  'preload',
  'qualityControl',
  'qualityMax',
  'qualityMin',
  'resumable',
  'seo',
  'settingsControl',
  'silentAutoPlay',
  'smallPlayButton',
  'stillUrl',
  'time',
  'videoFoam',
  'volume',
  'volumeControl',
  'width',
  'wmode',
]);

const PLAYER_EVENT_KEYS = new Set([
  'onAfterReplace',
  'onBeforeRemove',
  'onBeforeReplace',
  // 'onBetweenTimes',
  'onCancelFullscreen',
  'onCaptionsChange',
  'onConversion',
  // 'onCrosstime',
  'onEnd',
  'onEnterFullscreen',
  'onHeightChange',
  'onLookChange',
  'onMuteChange',
  'onPause',
  'onPercentWatchedChanged',
  'onPlay',
  'onPlaybackRateChange',
  'onSecondChange',
  'onSeek',
  'onSilentPlaybackModeChange',
  'onTimeChange',
  'onVolumeChange',
  'onWidthChange',
]);

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

export class WistiaPlayer extends Component {
  static contextType = WistiaContext;

  static defaultProps = {
    videoFoam: true,
  };

  static propTypes = {
    autoPlay: propTypes.bool,
    chromeless: propTypes.bool,
    controlsVisibleOnLoad: propTypes.bool,
    customEvents: propTypes.object,
    customOptions: propTypes.object,
    doNotTrack: propTypes.bool,
    email: propTypes.string,
    embedHost: propTypes.string,
    endVideoBehavior: propTypes.oneOf(['default', 'loop', 'reset']),
    fullscreenButton: propTypes.bool,
    googleAnalytics: propTypes.bool,
    hashedId: propTypes.string.isRequired,
    height: propTypes.number,
    hls: propTypes.bool,
    id: propTypes.string,
    idType: propTypes.string,
    muted: propTypes.bool,
    playButton: propTypes.bool,
    playbackRateControl: propTypes.bool,
    playbar: propTypes.bool,
    playerColor: propTypes.string,
    playlistLinks: propTypes.string,
    playlistLoop: propTypes.bool,
    playPauseNotifier: propTypes.bool,
    popover: propTypes.bool,
    popoverAnimateThumbnail: propTypes.bool,
    popoverContent: propTypes.oneOf(['link', 'html', 'thumbnail']),
    popoverOverlayOpacity: propTypes.number,
    preload: propTypes.oneOf(['auto', 'metadata', 'none', true, false]),
    qualityControl: propTypes.bool,
    qualityMax: propTypes.oneOfType([
      propTypes.number,
      propTypes.oneOf(['360p', '540p', '720p', '1080p', '4k']),
    ]),
    qualityMin: propTypes.oneOfType([
      propTypes.number,
      propTypes.oneOf(['360p', '540p', '720p', '1080p', '4k']),
    ]),
    resumable: propTypes.oneOf([true, false, 'auto']),
    seo: propTypes.bool,
    settingsControl: propTypes.bool,
    silentAutoPlay: propTypes.oneOf(['allow', true, false]),
    smallPlayButton: propTypes.bool,
    stillUrl: propTypes.string,
    time: propTypes.number,
    videoFoam: propTypes.oneOfType([
      propTypes.bool,
      propTypes.shape({
        maxHeight: propTypes.number,
        maxWidth: propTypes.number,
        minHeight: propTypes.number,
        minWidth: propTypes.number,
      }),
    ]),
    volume: propTypes.number,
    volumeControl: propTypes.bool,
    width: propTypes.number,
    wmode: propTypes.string,
  };

  player = null;
  state = { safeToRender: false };

  get classNames() {
    return `${this.embedClassNames} ${this.optionsAsCSSClassNames}`;
  }

  get responsivePaddingStyle() {
    return {
      paddingBottom: 0,
      paddingLeft: 0,
      paddingTop: this.inverseAspectPercent,
      paddingRight: 0,
      position: 'relative',
    };
  }

  get responsiveWrapperStyle() {
    return {
      height: '100%',
      left: 0,
      position: 'absolute',
      top: 0,
      width: '100%',
    };
  }

  get inverseAspectPercent() {
    return `${(1 / this.aspectRatio) * 100}%`;
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
    return isUndefined(this.props.popover)
      ? Children.count(this.props.children) !== 0
      : this.props.popover;
  }

  get isPopoverLink() {
    return this.props.popoverContent === 'link';
  }

  get optionsAsCSSClassNames() {
    return Object.entries(this.props)
      .filter(isWistiaPlayerOptionEntry)
      .map(serializeOptionEntry)
      .join(' ');
  }

  get style() {
    return {
      display: this.cssDisplayValue,
      height: this.cssHeightValue,
      width: this.cssWidthValue,
      ...this.props.style,
    };
  }

  //-- React Lifecycle Methods --//
  componentDidMount() {
    this.prepareForPlayerSetup(this.props.hashedId);
    this.context.dispatch({
      type: 'prepare-for-player',
      payload: { hashedId: this.props.hashedId },
    });
    this.setState({ safeToRender: true });
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
      payload: { hashedId: this.props.hashedId },
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
    }

    // if videoFoam, return a responsive embed, otherwise a fixed embed
    if (this.props.videoFoam) {
      console.log('rendering');
      return (
        <div className="wistia_responsive_padding" style={this.responsivePaddingStyle}>
          <div className="wistia_responsive_wrapper" style={this.responsiveWrapperStyle}>
            <div
              className={this.classNames}
              id={this.props.id}
              key={this.props.hashedId}
              style={this.style}
            >
              {this.isPopover && this.isPopoverLink ? <a href="#">{this.props.children}</a> : ' '}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div
          className={this.classNames}
          id={this.props.id}
          key={this.props.hashedId}
          style={this.style}
        >
          {this.isPopover && this.isPopoverLink ? <a href="#">{this.props.children}</a> : ' '}
        </div>
      );
    }
  }

  //-- Player events --//
  onBeforeReplace(hashedId) {
    this.removeEventBindings();
    this.prepareForPlayerSetup(hashedId);
  }

  //-- Helper Methods -- //
  removeEventBindings(player) {
    if (player) {
      PLAYER_EVENT_KEYS.forEach((event) => {
        player.unbind(normalizeEventForPlayer(event));
      });

      player.unbind('beforereplace');

      window._wq = window._wq || [];
      window._wq.push({ revoke: this.initConfigOptions });
    }
  }

  setupEventBindings(player) {
    const bindToEvent = (event, handler) => {
      const normalizedEventName = normalizeEventForPlayer(event);
      player.bind(normalizedEventName, (...args) => {
        // execute handler if it's an event we care about
        this[event]?.(...args);

        // execute handler for event if it was passed in as a prop
        handler?.(...args);
      });
    };

    // bind to all possible events that the player emits
    // and forward them off to any functions that may have
    // been passed in as props
    PLAYER_EVENT_KEYS.forEach((event) =>
      bindToEvent(event, (...args) => this.props[event]?.(...args)),
    );

    if (this.props.customEvents) {
      // bind to any custom events the user may have passed in
      Object.entries(this.props.customEvents).forEach(([key, value]) => {
        bindToEvent(key, value);
      });
    }
  }

  prepareForPlayerSetup(hashedId) {
    const handleEvent = (event, player) => {
      this.props[event]?.(player);
    };

    this.initConfigOptions = {
      id: hashedId,
      onEmbedded: (player) => handleEvent('onEmbedded', player),
      onHasData: (player) => {
        this.player = player;
        handleEvent('onHasData', player);
      },
      onReady: (player) => {
        handleEvent('onReady', player);
        this.setupPlayerAfterReady(player);
      },
      options: this.props.customOptions ? this.props.customOptions : {},
    };

    window._wq = window._wq || [];
    window._wq.push(this.initConfigOptions);
  }

  setupPlayerAfterReady = (player) => {
    this.context.dispatch?.({
      type: 'add-wistia-player',
      payload: { player, hashedId: this.props.hashedId },
    });
    this.setupEventBindings(player);
  };
}

////////////////////////////////////////////////////////////////////////////////

function isWistiaPlayerOptionEntry([key, value]) {
  return PLAYER_OPTION_KEYS.has(key) && !isUndefined(value);
}
