import css from 'rollup-plugin-import-css';
import resolve from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'build/workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/index.js',
    output: {
      file: 'dist/workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/MFD.js',
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
    input: 'build/workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/PFD/index.js',
    output: {
      file: 'dist/workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/PFD/PFD.js',
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