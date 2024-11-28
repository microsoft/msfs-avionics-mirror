import css from 'rollup-plugin-import-css';
import resolve from '@rollup/plugin-node-resolve';

const inst_name = 'Epic2v2';
const inst_path = `html_ui/Pages/VCockpit/Instruments/NavSystems/${inst_name}`;
const build_path = `build/${inst_path}`;
const dist_path = `dist/${inst_path}`;

export default [
    {
      input: `${build_path}/PFD/index.js`,
      output: {
        file: `${dist_path}/PFD/Epic2Pfd.js`,
        format: 'iife',
        name: 'wt_epic2_pfd',
        globals: {
          '@microsoft/msfs-sdk': 'msfssdk',
          '@microsoft/msfs-epic2-shared': 'wt_epic2_shared'
        }
      },
      external: ['@microsoft/msfs-sdk', '@microsoft/msfs-epic2-shared'],
      plugins: [css({ output: 'Epic2Pfd.css' }), resolve()]
    },
    {
      input: `${build_path}/MFD/UpperMFD/index.js`,
      output: {
        file: `${dist_path}/MFD/UpperMFD/Epic2UpperMfd.js`,
        format: 'iife',
        name: 'wt_epic2_upper_mfd',
        globals: {
          '@microsoft/msfs-sdk': 'msfssdk',
          '@microsoft/msfs-epic2-shared': 'wt_epic2_shared'
        }
      },
      external: ['@microsoft/msfs-sdk', '@microsoft/msfs-epic2-shared'],
      plugins: [css({ output: 'Epic2UpperMfd.css' }), resolve()]
    },
    {
      input: `${build_path}/MFD/LowerMFD/index.js`,
      output: {
        file: `${dist_path}/MFD/LowerMFD/Epic2LowerMfd.js`,
        format: 'iife',
        name: 'wt_epic2_lower_mfd',
        globals: {
          '@microsoft/msfs-sdk': 'msfssdk',
          '@microsoft/msfs-epic2-shared': 'wt_epic2_shared'
        }
      },
      external: ['@microsoft/msfs-sdk', '@microsoft/msfs-epic2-shared'],
      plugins: [css({ output: 'Epic2LowerMfd.css' }), resolve()]
    },
    {
      input: `${build_path}/TSC/index.js`,
      output: {
        file: `${dist_path}/TSC/Epic2Tsc.js`,
        format: 'iife',
        name: 'wt_epic2_tsc',
        globals: {
          '@microsoft/msfs-sdk': 'msfssdk',
          '@microsoft/msfs-epic2-shared': 'wt_epic2_shared'
        }
      },
      external: ['@microsoft/msfs-sdk', '@microsoft/msfs-epic2-shared'],
      plugins: [css({ output: 'Epic2Tsc.css' }), resolve()]
    }
]
