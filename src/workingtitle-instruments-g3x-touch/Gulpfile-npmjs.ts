/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { PackageBuilder, PackageDef } from '../../Gulpfile.ts/Builders';
import { rollupPlugins } from '../../Gulpfile.ts/Utils';

const def: PackageDef = {
  sourcePath: '.',
  outputRoot: 'workingtitle-instruments-g3x-touch',
  rollups: [
    {
      input: 'build/workingtitle-instruments-g3x-touch/html_ui/Pages/VCockpit/Instruments/NavSystems/G3XTouch/index.d.ts',
      output: [{ file: 'npmdist/msfs-wtg3x.d.ts', format: 'es' }],
      plugins: [rollupPlugins.dts(), rollupPlugins.resolve(), rollupPlugins.css({})],
    }
  ],
};

new PackageBuilder(def, exports);
