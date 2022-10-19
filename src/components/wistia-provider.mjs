import { createElement, useContext, useReducer, useRef, useState } from 'react';
import { HeadManager } from '../internals/head-manager.mjs';
import { WistiaContext } from '../react/wistia-context.mjs';

// Use a ref here to maintain the same functionality as the original
// class-based component.
function useHeadManager({ href, origin }) {
  const headManager = useRef(new HeadManager({ href, origin }));
  return headManager.current;
}

const initialState = {
  players: {},
};

export function WistiaProvider(props) {
  const { children, context = {}, href, origin } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const [wistiaContext, setWistiaContext] = useState(undefined);

  const headManager = useHeadManager({ href, origin });

  function reducer(state, action) {
    switch (action.type) {
      case 'prepare-for-channel': {
        headManager?.addChannelId(action.payload.hashedId);
        return state;
      }
      case 'prepare-for-player': {
        headManager?.addVideoId(action.payload.hashedId);
        return state;
      }
      case 'add-wistia-player': {
        state.players[action.payload.hashedId] = action.payload.player;
        return { ...state, players: { ...state.players } };
      }
      case 'remove-wistia-player': {
        delete state.players[action.payload.hashedId];
        return { players: { ...state.players } };
      }
      default: {
        throw new Error(`Unhandled action type: ${action.type}`);
      }
    }
  }

  if (props.context !== wistiaContext) {
    Object.defineProperties(context, {
      addChannelId: { value: headManager.addChannelId.bind(headManager), writable: true },
      addVideoId: { value: headManager.addVideoId.bind(headManager), writable: true },
      finalize: { value: headManager.finalize.bind(headManager), writable: true },
      [Symbol.toStringTag]: { value: 'WistiaContext' },
    });

    setWistiaContext(context);
  }

  const value = { state, dispatch, wistiaContext };
  return <WistiaContext.Provider value={value}>{children}</WistiaContext.Provider>;
}

/**
 * A way to access the player API from any component that is a child
 * of a WistiaProvider.
 *
 * @param {string} hashedId - the hashed id of the player you want to use
 */
export function usePlayer(hashedId) {
  const context = useContext(WistiaContext);

  if (context === undefined) {
    throw new Error('usePlayer must be used within a WistiaProvider');
  }

  return context.state.players[hashedId];
}
