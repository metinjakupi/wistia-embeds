import { Component, createElement } from 'react';
import { WistiaContext } from '../react/wistia-context.mjs';
import isUndefined from '../check/is-undefined.mjs';
import propTypes from 'prop-types';
import serializeOptionEntry from '../react/serialize-option-entry.mjs';

const CHANNEL_OPTION_KEYS = new Set([
  'embedHost',
  'hashedId',
  'height',
  'heroImageAspectRatio',
  'heroImageUrl',
  'id',
  'mode',
  'width',
]);

export class WistiaChannel extends Component {
  static contextType = WistiaContext;

  static defaultProps = {
    mode: 'inline',
  };

  static propTypes = {
    embedHost: propTypes.string,
    hashedId: propTypes.string.isRequired,
    height: propTypes.number,
    heroImageAspectRatio: propTypes.number,
    heroImageUrl: propTypes.string,
    id: propTypes.string,
    mode: propTypes.string,
    width: propTypes.number,
  };

  state = { safeToRender: false };

  get classNames() {
    return `${this.embedClassNames} ${this.optionsAsCSSClassNames}`;
  }

  get embedClassNames() {
    return `wistia_channel wistia_async_${this.props.hashedId}`;
  }

  get optionsAsCSSClassNames() {
    return Object.entries(this.props)
      .filter(isWistiaChannelOptionEntry)
      .map(serializeOptionEntry)
      .join(' ');
  }

  componentDidMount() {
    this.setState({ safeToRender: true });
    this.context.dispatch({
      type: 'prepare-for-channel',
      payload: { hashedId: this.props.hashedId },
    });
  }

  render() {
    // SSR doesn't call methods like componentDidMount, so it's crucial that we add the channel
    // to head manager here in render as well in componentDidMount.
    // It would also be incorrect to call dispatch inside the render method, so we avoid doing that and
    // instead use the bound head manager methods directly
    this.context.wistiaContext.addChannelId(this.props.hashedId);

    return this.state.safeToRender ? (
      <div className={this.classNames} id={this.props.id} key={this.props.hashedId} />
    ) : null;
  }
}

////////////////////////////////////////////////////////////////////////////////

function isWistiaChannelOptionEntry([key, value]) {
  return CHANNEL_OPTION_KEYS.has(key) && !isUndefined(value);
}
