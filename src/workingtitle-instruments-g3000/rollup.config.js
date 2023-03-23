import css from 'rollup-plugin-import-css';
import image from '@rollup/plugin-image';
import resolve from '@rollup/plugin-node-resolve';

export default [
    {
      input: 'build/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/MFD/index.js',
      output: {
        file: 'dist/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/MFD/MFD.js',
        format: 'iife',
        name: 'wtg3000mfd',
        globals: {
          '@microsoft/msfs-sdk': 'msfssdk',
          '@microsoft/msfs-garminsdk': 'garminsdk',
          '@microsoft/msfs-wtg3000-common': 'wtg3000common'
        }
      },
      external: ['@microsoft/msfs-sdk', '@microsoft/msfs-garminsdk', '@microsoft/msfs-wtg3000-common'],
      plugins: [image(), css({ output: 'MFD.css' }), resolve()]
    },
    {
      input: 'build/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/index.js',
      output: {
        file: 'dist/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/PFD/PFD.js',
        format: 'iife',
        name: 'wtg3000pfd',
        globals: {
          '@microsoft/msfs-sdk': 'msfssdk',
          '@microsoft/msfs-garminsdk': 'garminsdk',
          '@microsoft/msfs-wtg3000-common': 'wtg3000common'
        }
      },
      external: ['@microsoft/msfs-sdk', '@microsoft/msfs-garminsdk', '@microsoft/msfs-wtg3000-common'],
      plugins: [image(), css({ output: 'PFD.css' }), resolve()]
    },
    {
      input: 'build/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/index.js',
      output: {
        file: 'dist/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/GTC.js',
        format: 'iife',
        name: 'wtg3000gtc',
        globals: {
          '@microsoft/msfs-sdk': 'msfssdk',
          '@microsoft/msfs-garminsdk': 'garminsdk',
          '@microsoft/msfs-wtg3000-common': 'wtg3000common'
        }
      },
      external: ['@microsoft/msfs-sdk', '@microsoft/msfs-garminsdk', '@microsoft/msfs-wtg3000-common'],
      plugins: [image(), css({ output: 'GTC.css' }),resolve()]
    }
  ]