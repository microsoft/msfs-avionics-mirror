import dts from 'rollup-plugin-dts';
import css from 'rollup-plugin-import-css';

export default [
  {
    input: 'build/MFD/index.d.ts',
    output: [
      {
        file: 'dist/wt21mfd.d.ts', format: 'es'
      }
    ],
    plugins: [dts(), css()],
  }
];
