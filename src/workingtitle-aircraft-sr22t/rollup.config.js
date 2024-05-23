import css from 'rollup-plugin-import-css';
import image from '@rollup/plugin-image';
import resolve from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'build/Plugins/PFD/index.js',
    output: {
      file: 'dist/workingtitle-aircraft-sr22t/SimObjects/Airplanes/Asobo_SR22/panel/Instruments/G3000/Plugins/TbmPfdPlugins.js',
      format: 'iife',
      name: 'sr22tPfd',
      globals: {
        '@microsoft/msfs-sdk': 'msfssdk',
        '@microsoft/msfs-garminsdk': 'garminsdk',
        '@microsoft/msfs-wtg3000-common': 'wtg3000common',
        '@microsoft/msfs-wtg3000-pfd': 'wtg3000pfd'
      }
    },
    external: ['@microsoft/msfs-sdk', '@microsoft/msfs-garminsdk', '@microsoft/msfs-wtg3000-common', '@microsoft/msfs-wtg3000-pfd'],
    plugins: [image(), css({ output: 'TbmPfdPlugins.css' }), resolve()]
  },
  {
    input: 'build/Plugins/MFD/index.js',
    output: {
      file: 'dist/workingtitle-aircraft-sr22t/SimObjects/Airplanes/Asobo_SR22/panel/Instruments/G3000/Plugins/TbmMfdPlugins.js',
      format: 'iife',
      name: 'sr22tMfd',
      globals: {
        '@microsoft/msfs-sdk': 'msfssdk',
        '@microsoft/msfs-garminsdk': 'garminsdk',
        '@microsoft/msfs-wtg3000-common': 'wtg3000common',
        '@microsoft/msfs-wtg3000-mfd': 'wtg3000mfd'
      }
    },
    external: ['@microsoft/msfs-sdk', '@microsoft/msfs-garminsdk', '@microsoft/msfs-wtg3000-common', '@microsoft/msfs-wtg3000-mfd'],
    plugins: [image(), css({ output: 'TbmMfdPlugins.css' }), resolve()]
  },
  {
    input: 'build/Plugins/GTC/index.js',
    output: {
      file: 'dist/workingtitle-aircraft-sr22t/SimObjects/Airplanes/Asobo_SR22/panel/Instruments/G3000/Plugins/TbmGtcPlugins.js',
      format: 'iife',
      name: 'sr22tGtc',
      globals: {
        '@microsoft/msfs-sdk': 'msfssdk',
        '@microsoft/msfs-garminsdk': 'garminsdk',
        '@microsoft/msfs-wtg3000-common': 'wtg3000common',
        '@microsoft/msfs-wtg3000-gtc': 'wtg3000gtc'
      }
    },
    external: ['@microsoft/msfs-sdk', '@microsoft/msfs-garminsdk', '@microsoft/msfs-wtg3000-common', '@microsoft/msfs-wtg3000-gtc'],
    plugins: [image(), css({ output: 'TbmGtcPlugins.css' }), resolve()]
  }
];
