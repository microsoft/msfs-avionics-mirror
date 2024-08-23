import css from 'rollup-plugin-import-css';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';


export default [{
  input: 'build/index.js',
  output: {
    file: 'dist/wt21shared.js',
    format: 'iife',
    name: 'msfswt21shared',
    globals: {
      '@microsoft/msfs-sdk': 'msfssdk',
    }
  },
  treeshake: false,
  external: ['@microsoft/msfs-sdk'],
  plugins: [css({ output: 'wt21shared.css' }), resolve()]
}, {
  input: 'build/index.d.ts',
  output: [{ file: 'dist/wt21shared.d.ts', format: 'es' }],
  plugins: [dts(), resolve(), css()],
}];
