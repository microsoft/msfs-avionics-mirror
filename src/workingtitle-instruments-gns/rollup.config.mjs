import css from 'rollup-plugin-import-css';
import resolve from '@rollup/plugin-node-resolve';

const packageName = 'workingtitle-instruments-gns-v2';
const htmlUiPath = 'html_ui/Pages/VCockpit/Instruments/NavSystems/WTGNSv2';

export default [
  {
    input: 'build/html_ui/WT430/WT430.js',
    output: {
      file: `dist/${packageName}/${htmlUiPath}/WT430/WT430B.js`,
      format: 'iife',
      name: 'mfd',
      globals: {
        '@microsoft/msfs-sdk': 'msfssdk',
        '@microsoft/msfs-garminsdk': 'garminsdk'
      }
    },
    external: ['@microsoft/msfs-sdk', '@microsoft/msfs-garminsdk'],
    plugins: [css({ output: 'WT430.css' }), resolve()]
  },
  {
    input: 'build/html_ui/WT530/WT530.js',
    output: {
      file: `dist/${packageName}/${htmlUiPath}/WT530/WT530B.js`,
      format: 'iife',
      name: 'pfd',
      globals: {
        '@microsoft/msfs-sdk': 'msfssdk',
        '@microsoft/msfs-garminsdk': 'garminsdk'
      }
    },
    external: ['@microsoft/msfs-sdk', '@microsoft/msfs-garminsdk'],
    plugins: [css({ output: 'WT530.css' }), resolve()]
  }
]