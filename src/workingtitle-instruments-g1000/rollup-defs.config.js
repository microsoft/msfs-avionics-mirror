import dts from 'rollup-plugin-dts'
import css from 'rollup-plugin-import-css';
import resolve from '@rollup/plugin-node-resolve';

const config = [
  {
    input: 'build/workingtitle-instruments-g1000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts(), resolve(), css({ output: 'ignoreme.css' })],
  }
]
export default config