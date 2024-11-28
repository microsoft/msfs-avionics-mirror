import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'build/index.js',
    output: {
      file: 'dist/garminsdk.js',
      format: 'iife',
      name: 'garminsdk',
      globals: {
        '@microsoft/msfs-sdk': 'msfssdk'
      }
    },
    plugins: [resolve()],
    external: ['@microsoft/msfs-sdk']
  },
  {
    input: "build/index.d.ts",
    output: [{ file: "dist/garminsdk.d.ts", format: "es" }],
    plugins: [dts()],
  }
]