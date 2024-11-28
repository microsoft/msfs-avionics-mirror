import css from 'rollup-plugin-import-css';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';

export default [{
  input: 'build/index.js',
  output: {
    file: 'dist/wtg3000common.js',
    format: 'iife',
    name: 'wtg3000common',
    globals: {
      '@microsoft/msfs-sdk': 'msfssdk',
      '@microsoft/msfs-garminsdk': 'garminsdk'
    }
  },
  external: ['@microsoft/msfs-sdk', '@microsoft/msfs-garminsdk'],
  plugins: [css({ output: 'wtg3000common.css' }), resolve()]
}, {
  input: 'build/index.d.ts',
  output: [{ file: 'dist/wtg3000common.d.ts', format: 'es' }],
  plugins: [dts(), resolve(), css()],
}];