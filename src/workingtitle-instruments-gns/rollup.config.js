import css from 'rollup-plugin-import-css';
import resolve from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'build/workingtitle-instruments-gns/html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/WT430/WT430.js',
    output: {
      file: 'dist/workingtitle-instruments-gns/html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/WT430/WT430B.js',
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
    input: 'build/workingtitle-instruments-gns/html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/WT530/WT530.js',
    output: {
      file: 'dist/workingtitle-instruments-gns/html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/WT530/WT530B.js',
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