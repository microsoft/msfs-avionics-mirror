import css from 'rollup-plugin-import-css';
import resolve from '@rollup/plugin-node-resolve';

export default [
  {
  input: 'build/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/index.js',
  output: {
    file: 'dist/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/G3XTouch.js',
    format: 'iife',
    name: 'g3xtouch',
    globals: {
      '@microsoft/msfs-sdk': 'msfssdk',
      '@microsoft/msfs-garminsdk': 'garminsdk'
    }
  },
  external: ['@microsoft/msfs-sdk', '@microsoft/msfs-garminsdk'],
  plugins: [css({ output: 'G3XTouch.css' }), resolve()]
  }
]
