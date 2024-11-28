import css from 'rollup-plugin-import-css';
import image from '@rollup/plugin-image';
import resolve from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'build/Plugins/PFD/index.js',
    output: {
      file: 'dist/workingtitle-aircraft-cj4/SimObjects/Airplanes/Asobo_CJ4/panel/Instruments/WT21/Plugins/CJ4PfdPlugins.js',
      format: 'iife',
      name: 'cj4Pfd',
      globals: {
          '@microsoft/msfs-sdk': 'msfssdk',
          '@microsoft/msfs-wt21-pfd': 'wt21_pfd',
          '@microsoft/msfs-wt21-shared': 'wt21_shared'
      }
    },
    external: ['@microsoft/msfs-sdk', '@microsoft/msfs-wt21-pfd', '@microsoft/msfs-wt21-shared'],
    plugins: [image(), css({ output: 'CJ4PfdPlugins.css' }), resolve()]
  },
  {
    input: 'build/Plugins/MFD/index.js',
    output: {
      file: 'dist/workingtitle-aircraft-cj4/SimObjects/Airplanes/Asobo_CJ4/panel/Instruments/WT21/Plugins/CJ4MfdPlugins.js',
      format: 'iife',
      name: 'cj4Mfd',
      globals: {
          '@microsoft/msfs-sdk': 'msfssdk',
          '@microsoft/msfs-wt21-mfd': 'wt21_mfd',
          '@microsoft/msfs-wt21-shared': 'wt21_shared'
      }
    },
    external: ['@microsoft/msfs-sdk', '@microsoft/msfs-wt21-mfd', '@microsoft/msfs-wt21-shared'],
    plugins: [image(), css({ output: 'CJ4MfdPlugins.css' }), resolve()]
  },
  {
    input: 'build/Plugins/FMC/index.js',
    output: {
      file: 'dist/workingtitle-aircraft-cj4/SimObjects/Airplanes/Asobo_CJ4/panel/Instruments/WT21/Plugins/CJ4FmcPlugins.js',
      format: 'iife',
      name: 'cj4Fmc',
      globals: {
          '@microsoft/msfs-sdk': 'msfssdk',
          '@microsoft/msfs-wt21-fmc': 'wt21_fmc',
          '@microsoft/msfs-wt21-shared': 'wt21_shared'
      }
    },
    external: ['@microsoft/msfs-sdk', '@microsoft/msfs-wt21-fmc', '@microsoft/msfs-wt21-shared'],
    plugins: [image(), css({ output: 'CJ4FmcPlugins.css' }), resolve()]
  }
];
