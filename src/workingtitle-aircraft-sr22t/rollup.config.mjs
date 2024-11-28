import css from 'rollup-plugin-import-css';
import image from '@rollup/plugin-image';
import resolve from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'build/Plugins/PFD/index.js',
    output: {
      file: 'dist/workingtitle-aircraft-sr22t/SimObjects/Airplanes/Asobo_SR22/panel/Instruments/G1000/Plugins/SR22TPfdPlugins.js',
      format: 'iife',
      name: 'sr22tPfd',
      globals: {
        '@microsoft/msfs-sdk': 'msfssdk',
        '@microsoft/msfs-garminsdk': 'garminsdk',
        '@microsoft/msfs-wtg1000': 'g1000nxipfd'
      }
    },
    external: ['@microsoft/msfs-sdk', '@microsoft/msfs-garminsdk', '@microsoft/msfs-wtg1000'],
    plugins: [image(), css({ output: 'SR22TPfdPlugins.css' }), resolve()]
  },
  {
    input: 'build/Plugins/PFD/index.js',
    output: {
      file: 'dist/workingtitle-aircraft-sr22t/SimObjects/Airplanes/Asobo_SR22/panel/Instruments/G1000/Plugins/SR22TMfdPlugins.js',
      format: 'iife',
      name: 'sr22tMfd',
      globals: {
        '@microsoft/msfs-sdk': 'msfssdk',
        '@microsoft/msfs-garminsdk': 'garminsdk',
        '@microsoft/msfs-wtg1000': 'g1000nximfd'
      }
    },
    external: ['@microsoft/msfs-sdk', '@microsoft/msfs-garminsdk', '@microsoft/msfs-wtg1000'],
    plugins: [image(), css({ output: 'SR22TMfdPlugins.css' }), resolve()]
  },
];
