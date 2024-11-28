import css from 'rollup-plugin-import-css';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';

export default [{
  input: 'build/index.js',
  output: {
    file: 'dist/wte2shared.js',
    format: 'iife',
    name: 'wte2shared',
    globals: {
      '@microsoft/msfs-sdk': 'msfssdk'
    }
  },
  external: ['@microsoft/msfs-sdk'],
  plugins: [css({ output: 'wte2shared.css' }), resolve()]
}, {
  input: 'build/index.d.ts',
  output: [{ file: 'dist/wte2shared.d.ts', format: 'es' }],
  plugins: [dts(), resolve(), css()],
}];
