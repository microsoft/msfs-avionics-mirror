import resolve from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-import-css';

export default [
  {
    input: 'dist/workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/index.js',
    output: {
      file: 'build/workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/MFD/MFD.js',
      format: 'iife',
      name: 'g1000nximfd',
      globals: {
        'msfssdk': 'msfssdk',
        'garminsdk': 'garminsdk'
      }
    },
    external: ['msfssdk', 'garminsdk'],
    plugins: [css({ output: 'MFD.css' }), resolve()]
  },
  {
    input: 'dist/workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/PFD/index.js',
    output: {
      file: 'build/workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/PFD/PFD.js',
      format: 'iife',
      name: 'g1000nxipfd',
      globals: {
        'msfssdk': 'msfssdk',
        'garminsdk': 'garminsdk'
      }
    },
    external: ['msfssdk', 'garminsdk'],
    plugins: [css({ output: 'PFD.css' }), resolve()]
  }
]