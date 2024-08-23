import dts from 'rollup-plugin-dts';
import css from 'rollup-plugin-import-css';

export default [
  {
    input: 'build/index.d.ts',
    output: [
      {
        file: 'dist/wt21shared.d.ts', format: 'es'
      }
    ],
    plugins: [dts(), css()],
  }
];
