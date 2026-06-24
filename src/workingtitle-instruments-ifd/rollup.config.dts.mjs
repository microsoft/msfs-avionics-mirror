import { dts } from "rollup-plugin-dts";

const src_path = `html_ui/Pages/VCockpit/Instruments/NavSystems/WTIFD`;

export default [
  {
    input: `${src_path}/index.ts`,
    output: {
      file: `dist-types/2024-IFD.d.ts`,
      format: "es",
    },
    external: [/@microsoft\/msfs-sdk/, /\.(css|svg|png|jpe?g|gif)$/],
    plugins: [dts()],
  },
];
