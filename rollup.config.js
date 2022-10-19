import babel from '@rollup/plugin-babel';
import rollupReplace from 'rollup-plugin-replace';

// COMMON ROLLUP CONFIG ////////////////////////////////////////////////////////

const EXTERNALS = ['node-fetch', 'prop-types', 'react'];
const INPUT = 'src/index.mjs';
const TREESHAKE = { propertyReadSideEffects: false, moduleSideEffects: 'no-external' };

// BABEL PLUGINS ///////////////////////////////////////////////////////////////

const BABEL_PLUGIN_CLASS_PROPERTIES = ['@babel/plugin-proposal-class-properties'];

const BABEL_PLUGIN_DYNAMIC_IMPORT = ['@babel/plugin-syntax-dynamic-import'];

const BABEL_PLUGIN_REMOVE_PROP_TYPES = [
  'babel-plugin-transform-react-remove-prop-types',
  { removeImport: true },
];

const BABEL_PLUGINS_DEV = [BABEL_PLUGIN_CLASS_PROPERTIES, BABEL_PLUGIN_DYNAMIC_IMPORT];

const BABEL_PLUGINS_PROD = [BABEL_PLUGIN_REMOVE_PROP_TYPES, ...BABEL_PLUGINS_DEV];

// BABEL PRESETS ///////////////////////////////////////////////////////////////

const PRESET_REACT = ['@babel/preset-react', { pragma: 'createElement' }];

const BABEL_PRESETS_NODE = [PRESET_REACT, presetEnv({ node: '16.1' })];

const BABEL_PRESETS_BROWSER = [PRESET_REACT, presetEnv({ ie: '11' })];

function presetEnv(targets) {
  return ['@babel/preset-env', { targets }];
}

// ROLLUP CONFIG ///////////////////////////////////////////////////////////////

export default [
  {
    external: EXTERNALS,
    input: INPUT,
    output: [
      { file: `dist/index.node.js`, format: 'cjs' },
      { file: `dist/index.node.mjs`, format: 'esm' },
    ],
    plugins: [
      rollupReplace({ _TARGET_: '"node"' }),
      babel({ plugins: BABEL_PLUGINS_DEV, presets: BABEL_PRESETS_NODE }),
    ],
    treeshake: TREESHAKE,
  },
  {
    external: EXTERNALS,
    input: INPUT,
    output: { file: `dist/index.browser.dev.js`, format: 'cjs' },
    plugins: [
      rollupReplace({ _TARGET_: '"browser"' }),
      babel({ plugins: BABEL_PLUGINS_DEV, presets: BABEL_PRESETS_BROWSER }),
    ],
    treeshake: TREESHAKE,
  },
  {
    external: EXTERNALS,
    input: INPUT,
    output: { file: `dist/index.browser.prod.js`, format: 'cjs' },
    plugins: [
      rollupReplace({ _TARGET_: '"browser"' }),
      babel({ plugins: BABEL_PLUGINS_PROD, presets: BABEL_PRESETS_BROWSER }),
    ],
    treeshake: TREESHAKE,
  },
];
