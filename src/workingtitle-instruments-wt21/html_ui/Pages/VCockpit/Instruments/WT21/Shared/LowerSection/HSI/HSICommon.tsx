import { FSComponent } from '@microsoft/msfs-sdk';

export const HSICommon = Object.freeze({
  hsiStickAircraftSymbolSVGPath: () => (
    <path
      d="m -33 -23 m 33 3 l 0 63 m 0 -11 l 17 6 m -17 -6 l -17 6 m 17 -38 l 32 13.47 m -32 -13.47 l -32 13.47"
      stroke="var(--wt21-colors-white)"
      stroke-linecap="round"
    />
  ),
  hsiPposAircraftSymbolSVGPath: () => (
    <path
      d="M 0.75 -19 L 2.5 -15 L 2.5 -4 L 19 5 L 19 10 L 2.5 4 L 2.5 16 L 10 20 L 10 24 L 1 20 L 0 25 L 0 25 L 0 25 L -1 20 L -10 24 L -10 20 L -2.5 16 L -2.5 4 L -19 10 L -19 5 L -2.5 -4 L -2.5 -15 L -0.75 -19 Z"
      stroke="var(--wt21-colors-white)"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
  ),
});

/** Direction that ticks should point on a compass rose. */
export type HSITickDirection = 'Inwards' | 'Outwards';
