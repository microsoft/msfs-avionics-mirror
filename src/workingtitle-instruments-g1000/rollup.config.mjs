import css from 'rollup-plugin-import-css';
import resolve from '@rollup/plugin-node-resolve';

const packageName = 'workingtitle-instruments-g1000-v2';
const htmlUiPath = 'html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000v2';

export default [
  {
    input: 'build/html_ui/MFD/index.js',
    output: {
      file: `dist/${packageName}/${htmlUiPath}/MFD/MFD.js`,
      format: 'iife',
      name: 'g1000nximfd',
      globals: {
        '@microsoft/msfs-sdk': 'msfssdk',
        '@microsoft/msfs-garminsdk': 'garminsdk'
      }
    },
    external: ['@microsoft/msfs-sdk', '@microsoft/msfs-garminsdk'],
    plugins: [css({ output: 'MFD.css' }), resolve()]
  },
  {
    input: 'build/html_ui/PFD/index.js',
    output: {
      file: `dist/${packageName}/${htmlUiPath}/PFD/PFD.js`,
      format: 'iife',
      name: 'g1000nxipfd',
      globals: {
        '@microsoft/msfs-sdk': 'msfssdk',
        '@microsoft/msfs-garminsdk': 'garminsdk'
      }
    },
    external: ['@microsoft/msfs-sdk', '@microsoft/msfs-garminsdk'],
    plugins: [css({ output: 'PFD.css' }), resolve()]
  }
]