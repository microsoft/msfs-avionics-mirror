import css from 'rollup-plugin-import-css';
import image from '@rollup/plugin-image';
import resolve from '@rollup/plugin-node-resolve';

// TODO Add dts?

export default [
  {
    input: 'build/workingtitle-instruments-wt21/html_ui/Pages/VCockpit/Instruments/WT21/MFD/WT21_MFD.js',
    output: {
      file: 'dist/workingtitle-instruments-wt21/html_ui/Pages/VCockpit/Instruments/WT21/MFD/MFD.js',
      format: 'iife',
      sourcemap: false,
      name: 'mfd',
      globals: {
        '@microsoft/msfs-sdk': 'msfssdk',
        '@microsoft/msfs-wt21-shared': 'msfs-wt21-shared'
      }
    },
    external: ['@microsoft/msfs-sdk', '@microsoft/msfs-wt21-shared'],
    plugins: [image(), css({ output: 'MFD.css' }), resolve()]
  },
  {
    input: 'build/workingtitle-instruments-wt21/html_ui/Pages/VCockpit/Instruments/WT21/PFD/WT21_PFD.js',
    output: {
      file: 'dist/workingtitle-instruments-wt21/html_ui/Pages/VCockpit/Instruments/WT21/PFD/PFD.js',
      format: 'iife',
      sourcemap: false,
      name: 'pfd',
      globals: {
        '@microsoft/msfs-sdk': 'msfssdk',
        '@microsoft/msfs-wt21-shared': 'msfs-wt21-shared'
      }    },
    external: ['@microsoft/msfs-sdk', '@microsoft/msfs-wt21-shared'],
    plugins: [image(), css({ output: 'PFD.css' }), resolve()]
  },
  {
    input: 'build/workingtitle-instruments-wt21/html_ui/Pages/VCockpit/Instruments/WT21/FMC/WT21_FMC.js',
    output: {
      file: 'dist/workingtitle-instruments-wt21/html_ui/Pages/VCockpit/Instruments/WT21/FMC/FMC.js',
      format: 'iife',
      sourcemap: false,
      name: 'fmc',
      globals: {
        '@microsoft/msfs-sdk': 'msfssdk',
        '@microsoft/msfs-wt21-shared': 'msfs-wt21-shared'
      }    },
    external: ['@microsoft/msfs-sdk', '@microsoft/msfs-wt21-shared'],
    plugins: [image(), css({ output: 'FMC.css' }), resolve()]
  }
]
