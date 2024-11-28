/**
 * Airspeed indicator V-speed bug colors.
 */
export enum VSpeedBugColor {
  Cyan = 'Cyan',
  White = 'White',
  Green = 'Green',
  Red = 'Red'
}

/**
 * A definition for an airspeed indicator reference V-speed bug.
 */
export type VSpeedBugDefinition = {
  /** The name of the bug's reference V-speed. */
  readonly name: string;

  /** The bug's label text. */
  readonly label: string;

  /** The color of the bug's label text. Defaults to `VSpeedBugColor.Cyan`. */
  readonly labelColor?: VSpeedBugColor;

  /**
   * Whether the bug's displayed label color should ignore whether the bug's reference V-speed has been set by FMS. If
   * `true`, then the bug's label text will not change color when the bug's reference V-speed has been set by FMS.
   * Defaults to `false`.
   */
  readonly labelColorIgnoreFms?: boolean;

  /** Whether to show an off-scale label for the bug when the airspeed is off-scale. */
  readonly showOffscale: boolean;

  /** Whether to show a legend for the bug at the bottom of the airspeed tape. */
  readonly showLegend: boolean;
};
