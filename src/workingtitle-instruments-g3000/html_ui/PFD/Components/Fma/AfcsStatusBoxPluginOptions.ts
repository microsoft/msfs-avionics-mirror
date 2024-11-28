/**
 * An entry defining AFCS status box label text for an additional autopilot mode.
 */
export type AfcsStatusBoxAdditionalModeLabelEntry = {
  /** The director mode. */
  mode: number;

  /** The label for the director mode when it is active. */
  activeLabel: string;

  /** The label for the director mode when it is armed. */
  armedLabel: string;
};

/**
 * AFCS status box options defined by plugins.
 */
export interface AfcsStatusBoxPluginOptions {
  /**
   * Gets label text for additional autopilot lateral modes. Labels for the following modes will be ignored:
   * * `APLateralModes.NONE`
   * * `APLateralModes.ROLL`
   * * `APLateralModes.LEVEL`
   * * `APLateralModes.HEADING`
   * * `APLateralModes.TRACK`
   * * `APLateralModes.GPSS`
   * * `APLateralModes.VOR`
   * * `APLateralModes.LOC`
   * * `APLateralModes.BC`
   * * `APLateralModes.TO`
   * * `APLateralModes.GA`
   * @returns An iterable of label text for additional autopilot lateral modes.
   */
  getAdditionalLateralModeLabels?(): Iterable<Readonly<AfcsStatusBoxAdditionalModeLabelEntry>>;

  /**
   * Gets label text for additional autopilot vertical modes. Labels for the following modes will be ignored:
   * * `APVerticalModes.NONE`
   * * `APVerticalModes.PITCH`
   * * `APVerticalModes.LEVEL`
   * * `APVerticalModes.VS`
   * * `APVerticalModes.FLC`
   * * `APVerticalModes.ALT`
   * * `APVerticalModes.CAP`
   * * `APVerticalModes.PATH`
   * * `APVerticalModes.GP`
   * * `APVerticalModes.GS`
   * * `APVerticalModes.TO`
   * * `APVerticalModes.GA`
   * @returns An iterable of label text for additional autopilot vertical modes.
   */
  getAdditionalVerticalModeLabels?(): Iterable<Readonly<AfcsStatusBoxAdditionalModeLabelEntry>>;
}
