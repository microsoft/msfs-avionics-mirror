import css from 'rollup-plugin-import-css';
import resolve from '@rollup/plugin-node-resolve';

const packageName = 'workingtitle-instruments-g3xtouch-v2';
const htmlUiPath = 'html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouchv2';

export default [
  {
  input: 'build/html_ui/index.js',
  output: {
    file: `dist/${packageName}/${htmlUiPath}/G3XTouch.js`,
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
