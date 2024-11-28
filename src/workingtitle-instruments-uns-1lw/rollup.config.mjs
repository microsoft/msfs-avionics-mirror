import css from 'rollup-plugin-import-css';
import resolve from '@rollup/plugin-node-resolve';

const packageName = 'workingtitle-instruments-uns-1lw';
const htmlUiPath = 'html_ui/Pages/VCockpit/Instruments/NavSystems/WTUns1v2';

export default [
  {
    input: `build/${htmlUiPath}/WTUns1.js`,
    output: {
      file: `dist/${packageName}/${htmlUiPath}/WTUns1.js`,
      format: 'iife',
      name: 'mfd',
      globals: {
        '@microsoft/msfs-sdk': 'msfssdk',
      }
    },
    external: ['@microsoft/msfs-sdk'],
    plugins: [css({ output: 'WTUns1.css' }), resolve()]
  }
]
