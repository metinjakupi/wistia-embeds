'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

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

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();

  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
        result;

    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var WistiaContext = /*#__PURE__*/react.createContext();

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
function serializeOptionEntry(_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      key = _ref2[0],
      value = _ref2[1];

  if (key === 'videoFoam' && Object(value) === value) {
    value = JSON.stringify(value);
  }

  return "".concat(key, "=").concat(encodeURIComponent(value));
}

var CHANNEL_OPTION_KEYS = new Set(['embedHost', 'hashedId', 'height', 'heroImageAspectRatio', 'heroImageUrl', 'id', 'mode', 'width']);
var WistiaChannel = /*#__PURE__*/function (_Component) {
  _inherits(WistiaChannel, _Component);

  var _super = _createSuper(WistiaChannel);

  function WistiaChannel() {
    var _this;

    _classCallCheck(this, WistiaChannel);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "state", {
      safeToRender: false
    });

    return _this;
  }

  _createClass(WistiaChannel, [{
    key: "classNames",
    get: function get() {
      return "".concat(this.embedClassNames, " ").concat(this.optionsAsCSSClassNames);
    }
  }, {
    key: "embedClassNames",
    get: function get() {
      return "wistia_channel wistia_async_".concat(this.props.hashedId);
    }
  }, {
    key: "optionsAsCSSClassNames",
    get: function get() {
      return Object.entries(this.props).filter(isWistiaChannelOptionEntry).map(serializeOptionEntry).join(' ');
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
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
  }, {
    key: "render",
    value: function render() {
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
  }]);

  return WistiaChannel;
}(react.Component); ////////////////////////////////////////////////////////////////////////////////

_defineProperty(WistiaChannel, "contextType", WistiaContext);

_defineProperty(WistiaChannel, "defaultProps", {
  mode: 'inline'
});

function isWistiaChannelOptionEntry(_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      key = _ref2[0],
      value = _ref2[1];

  return CHANNEL_OPTION_KEYS.has(key) && !isUndefined(value);
}

var DEFAULT_ASPECT_RATIO = 640 / 360;
var PLAYER_OPTION_KEYS = new Set(['autoPlay', 'chromeless', 'controlsVisibleOnLoad', 'doNotTrack', 'email', 'embedHost', 'endVideoBehavior', 'fullscreenButton', 'googleAnalytics', 'hashedId', 'height', 'hls', 'id', 'idType', 'muted', 'playbackRateControl', 'playbar', 'playButton', 'playerColor', 'playlistLinks', 'playlistLoop', 'playPauseNotifier', 'popover', 'popoverAnimateThumbnail', 'popoverContent', 'popoverOverlayOpacity', 'preload', 'qualityControl', 'qualityMax', 'qualityMin', 'resumable', 'seo', 'settingsControl', 'silentAutoPlay', 'smallPlayButton', 'stillUrl', 'time', 'videoFoam', 'volume', 'volumeControl', 'width', 'wmode']);
var PLAYER_EVENT_KEYS = new Set(['onAfterReplace', 'onBeforeRemove', 'onBeforeReplace', // 'onBetweenTimes',
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

function normalizeEventForPlayer() {
  var eventKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return eventKey.replace('on', '').toLowerCase();
}

var WistiaPlayer = /*#__PURE__*/function (_Component) {
  _inherits(WistiaPlayer, _Component);

  var _super = _createSuper(WistiaPlayer);

  function WistiaPlayer() {
    var _this;

    _classCallCheck(this, WistiaPlayer);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "player", null);

    _defineProperty(_assertThisInitialized(_this), "state", {
      safeToRender: false
    });

    _defineProperty(_assertThisInitialized(_this), "setupPlayerAfterReady", function (player) {
      var _this$context$dispatc, _this$context;

      (_this$context$dispatc = (_this$context = _this.context).dispatch) === null || _this$context$dispatc === void 0 ? void 0 : _this$context$dispatc.call(_this$context, {
        type: 'add-wistia-player',
        payload: {
          player: player,
          hashedId: _this.props.hashedId
        }
      });

      _this.setupEventBindings(player);
    });

    return _this;
  }

  _createClass(WistiaPlayer, [{
    key: "classNames",
    get: function get() {
      return "".concat(this.embedClassNames, " ").concat(this.optionsAsCSSClassNames);
    }
  }, {
    key: "responsivePaddingStyle",
    get: function get() {
      return {
        paddingBottom: 0,
        paddingLeft: 0,
        paddingTop: this.inverseAspectPercent,
        paddingRight: 0,
        position: 'relative'
      };
    }
  }, {
    key: "responsiveWrapperStyle",
    get: function get() {
      return {
        height: '100%',
        left: 0,
        position: 'absolute',
        top: 0,
        width: '100%'
      };
    }
  }, {
    key: "inverseAspectPercent",
    get: function get() {
      return "".concat(1 / this.aspectRatio * 100, "%");
    }
  }, {
    key: "aspectRatio",
    get: function get() {
      if (this.player && this.player.hasData()) {
        return this.player.aspect();
      } else {
        return DEFAULT_ASPECT_RATIO;
      }
    }
  }, {
    key: "cssDisplayValue",
    get: function get() {
      return this.isPopoverLink ? 'inline' : 'inline-block';
    }
  }, {
    key: "cssHeightValue",
    get: function get() {
      return isUndefined(this.props.height) ? '100%' : "".concat(this.props.height, "px");
    }
  }, {
    key: "cssWidthValue",
    get: function get() {
      return isUndefined(this.props.width) ? '100%' : "".concat(this.props.width, "px");
    }
  }, {
    key: "embedClassNames",
    get: function get() {
      return "wistia_embed wistia_async_".concat(this.props.hashedId);
    }
  }, {
    key: "isPopover",
    get: function get() {
      return isUndefined(this.props.popover) ? react.Children.count(this.props.children) !== 0 : this.props.popover;
    }
  }, {
    key: "isPopoverLink",
    get: function get() {
      return this.props.popoverContent === 'link';
    }
  }, {
    key: "optionsAsCSSClassNames",
    get: function get() {
      return Object.entries(this.props).filter(isWistiaPlayerOptionEntry).map(serializeOptionEntry).join(' ');
    }
  }, {
    key: "style",
    get: function get() {
      return _objectSpread2({
        display: this.cssDisplayValue,
        height: this.cssHeightValue,
        width: this.cssWidthValue
      }, this.props.style);
    } //-- React Lifecycle Methods --//

  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
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
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      if (this.props.hashedId !== prevProps.hashedId) {
        this.player.replaceWith(this.props.hashedId);
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.removeEventBindings(this.player);
      this.context.dispatch({
        type: 'remove-wistia-player',
        payload: {
          hashedId: this.props.hashedId
        }
      });
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps) {
      if (nextProps.hashedId !== this.props.hashedId) {
        return true;
      }

      return !this.state.safeToRender;
    }
  }, {
    key: "render",
    value: function render() {
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

  }, {
    key: "onBeforeReplace",
    value: function onBeforeReplace(hashedId) {
      this.removeEventBindings();
      this.prepareForPlayerSetup(hashedId);
    } //-- Helper Methods -- //

  }, {
    key: "removeEventBindings",
    value: function removeEventBindings(player) {
      if (player) {
        PLAYER_EVENT_KEYS.forEach(function (event) {
          player.unbind(normalizeEventForPlayer(event));
        });
        player.unbind('beforereplace');
        window._wq = window._wq || [];

        window._wq.push({
          revoke: this.initConfigOptions
        });
      }
    }
  }, {
    key: "setupEventBindings",
    value: function setupEventBindings(player) {
      var _this2 = this;

      var bindToEvent = function bindToEvent(event, handler) {
        var normalizedEventName = normalizeEventForPlayer(event);
        player.bind(normalizedEventName, function () {
          var _this2$event;

          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          // execute handler if it's an event we care about
          (_this2$event = _this2[event]) === null || _this2$event === void 0 ? void 0 : _this2$event.call.apply(_this2$event, [_this2].concat(args)); // execute handler for event if it was passed in as a prop

          handler === null || handler === void 0 ? void 0 : handler.apply(void 0, args);
        });
      }; // bind to all possible events that the player emits
      // and forward them off to any functions that may have
      // been passed in as props


      PLAYER_EVENT_KEYS.forEach(function (event) {
        return bindToEvent(event, function () {
          var _this2$props$event, _this2$props;

          for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
          }

          return (_this2$props$event = (_this2$props = _this2.props)[event]) === null || _this2$props$event === void 0 ? void 0 : _this2$props$event.call.apply(_this2$props$event, [_this2$props].concat(args));
        });
      });

      if (this.props.customEvents) {
        // bind to any custom events the user may have passed in
        Object.entries(this.props.customEvents).forEach(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              key = _ref2[0],
              value = _ref2[1];

          bindToEvent(key, value);
        });
      }
    }
  }, {
    key: "prepareForPlayerSetup",
    value: function prepareForPlayerSetup(hashedId) {
      var _this3 = this;

      var handleEvent = function handleEvent(event, player) {
        var _this3$props$event, _this3$props;

        (_this3$props$event = (_this3$props = _this3.props)[event]) === null || _this3$props$event === void 0 ? void 0 : _this3$props$event.call(_this3$props, player);
      };

      this.initConfigOptions = {
        id: hashedId,
        onEmbedded: function onEmbedded(player) {
          return handleEvent('onEmbedded', player);
        },
        onHasData: function onHasData(player) {
          _this3.player = player;
          handleEvent('onHasData', player);
        },
        onReady: function onReady(player) {
          handleEvent('onReady', player);

          _this3.setupPlayerAfterReady(player);
        },
        options: this.props.customOptions ? this.props.customOptions : {}
      };
      window._wq = window._wq || [];

      window._wq.push(this.initConfigOptions);
    }
  }]);

  return WistiaPlayer;
}(react.Component); ////////////////////////////////////////////////////////////////////////////////

_defineProperty(WistiaPlayer, "contextType", WistiaContext);

_defineProperty(WistiaPlayer, "defaultProps", {
  videoFoam: true
});

function isWistiaPlayerOptionEntry(_ref3) {
  var _ref4 = _slicedToArray(_ref3, 2),
      key = _ref4[0],
      value = _ref4[1];

  return PLAYER_OPTION_KEYS.has(key) && !isUndefined(value);
}

// This is the most primitive and generic ToString operation. It differs
// slightly from String(value) in that it refuses to coerce Symbols.
function toString(value) {
  return "".concat(value);
}

// The src comparison is made using HTMLScriptElement.prototype.src rather than
// baking it into the selector because HTMLScriptElement.prototype.src will be
// the canonicalized URL. The serialized HTML src attribute value may not be in
// canonical form.
function addScriptIfAbsent(src) {
  var scripts = Array.from(document.getElementsByTagName('script'));
  var script = Object.assign(document.createElement('script'), {
    src: src
  });

  if (scripts.every(function (existingScript) {
    return existingScript.src !== script.src;
  })) {
    document.head.appendChild(script);
  }
}

var defineProperties = Object.defineProperties;

var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors;

// canonicalization.

function toOrigin(origin) {
  origin = toString(origin);

  try {
    var url = new URL(origin);

    if (url.href === "".concat(url.origin, "/")) {
      return url.origin;
    }
  } catch (_unused) {}

  throw new URIError("".concat(JSON.stringify(origin), " is not a valid URL origin"));
}

function toURL(url) {
  return new URL(url);
}

var DEFAULT_HREF = location.href ,
    DEFAULT_ORIGIN = 'https://fast.wistia.net';
var CHANNEL_PARAM = 'wgalleryid',
    CHANNEL_VIDEO_PARAM = 'wvideoid',
    LOADER_PARAM = 'e-v1-loader';
var ORIGIN_K = Symbol(),
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

var HeadManager = /*#__PURE__*/function () {
  function HeadManager(_ref) {
    var _ref$href = _ref.href,
        href = _ref$href === void 0 ? DEFAULT_HREF : _ref$href,
        _ref$origin = _ref.origin,
        origin = _ref$origin === void 0 ? DEFAULT_ORIGIN : _ref$origin;

    _classCallCheck(this, HeadManager);

    _defineProperty(this, ORIGIN_K, DEFAULT_ORIGIN);

    _defineProperty(this, URL_K, undefined);

    _defineProperty(this, "channelIds", new Set());

    _defineProperty(this, "exposedResult", undefined);

    _defineProperty(this, "headResult", undefined);

    _defineProperty(this, "videoIds", new Set());

    this.origin = origin;
    this.url = href;
  }

  _createClass(HeadManager, [{
    key: "activeChannelProjectHashedId",
    get: function get() {
      return this.url && this.url.searchParams.get(CHANNEL_PARAM);
    }
  }, {
    key: "activeChannelVideoHashedId",
    get: function get() {
      return this.url && this.url.searchParams.get(CHANNEL_VIDEO_PARAM);
    }
  }, {
    key: "channelUrl",
    get: function get() {
      return "".concat(this.origin, "/assets/external/channel.js");
    }
  }, {
    key: "hasUrl",
    get: function get() {
      return !isUndefined(this.url);
    }
  }, {
    key: "origin",
    get: function get() {
      return this[ORIGIN_K];
    },
    set: function set(origin) {
      try {
        this[ORIGIN_K] = toOrigin(origin);
      } catch (err) {
        console.error(err);
      }
    }
  }, {
    key: "playerUrl",
    get: function get() {
      return this.shouldUseLoader ? "".concat(this.origin, "/assets/external/E-v1-loader.js") : "".concat(this.origin, "/assets/external/E-v1.js");
    }
  }, {
    key: "shouldUseLoader",
    get: function get() {
      return this.hasUrl && this.url.searchParams.get(LOADER_PARAM) === 'true';
    }
  }, {
    key: "url",
    get: function get() {
      return this[URL_K];
    },
    set: function set(url) {
      try {
        this[URL_K] = toURL(url);
      } catch (err) {
        console.error(err);
      }
    }
  }]);

  return HeadManager;
}(); // BROWSER /////////////////////////////////////////////////////////////////////
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

{
  var hasLoadedChannelScript;
  var hasLoadedPlayerScript;
  defineProperties(HeadManager.prototype, getOwnPropertyDescriptors( function () {
    function _class() {
      _classCallCheck(this, _class);
    }

    _createClass(_class, [{
      key: "addChannelId",
      value: function addChannelId() {
        if (!hasLoadedChannelScript) {
          hasLoadedChannelScript = true;
          addScriptIfAbsent(this.channelUrl);
        }
      }
    }, {
      key: "addVideoId",
      value: function addVideoId() {
        if (!hasLoadedPlayerScript) {
          hasLoadedPlayerScript = true;
          addScriptIfAbsent(this.playerUrl);
        }
      }
    }, {
      key: "finalize",
      value: function finalize() {
        return Promise.reject(new Error('WistiaContext.finalize is SSR-only'));
      }
    }]);

    return _class;
  }().prototype));
} // NODE ////////////////////////////////////////////////////////////////////////

// class-based component.

function useHeadManager(_ref) {
  var href = _ref.href,
      origin = _ref.origin;
  var headManager = react.useRef(new HeadManager({
    href: href,
    origin: origin
  }));
  return headManager.current;
}

var initialState = {
  players: {}
};
function WistiaProvider(props) {
  var children = props.children,
      _props$context = props.context,
      context = _props$context === void 0 ? {} : _props$context,
      href = props.href,
      origin = props.origin;

  var _useReducer = react.useReducer(reducer, initialState),
      _useReducer2 = _slicedToArray(_useReducer, 2),
      state = _useReducer2[0],
      dispatch = _useReducer2[1];

  var _useState = react.useState(undefined),
      _useState2 = _slicedToArray(_useState, 2),
      wistiaContext = _useState2[0],
      setWistiaContext = _useState2[1];

  var headManager = useHeadManager({
    href: href,
    origin: origin
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
          return _objectSpread2(_objectSpread2({}, state), {}, {
            players: _objectSpread2({}, state.players)
          });
        }

      case 'remove-wistia-player':
        {
          delete state.players[action.payload.hashedId];
          return {
            players: _objectSpread2({}, state.players)
          };
        }

      default:
        {
          throw new Error("Unhandled action type: ".concat(action.type));
        }
    }
  }

  if (props.context !== wistiaContext) {
    Object.defineProperties(context, _defineProperty({
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
      }
    }, Symbol.toStringTag, {
      value: 'WistiaContext'
    }));
    setWistiaContext(context);
  }

  var value = {
    state: state,
    dispatch: dispatch,
    wistiaContext: wistiaContext
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
  var context = react.useContext(WistiaContext);

  if (context === undefined) {
    throw new Error('usePlayer must be used within a WistiaProvider');
  }

  return context.state.players[hashedId];
}

exports.WistiaChannel = WistiaChannel;
exports.WistiaPlayer = WistiaPlayer;
exports.WistiaProvider = WistiaProvider;
exports.usePlayer = usePlayer;
