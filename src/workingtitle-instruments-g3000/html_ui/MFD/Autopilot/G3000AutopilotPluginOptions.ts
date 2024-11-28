import { APValues, PlaneDirector } from '@microsoft/msfs-sdk';

/**
 * An entry describing an additional director to add to a G3000 autopilot.
 */
export type G3000AutopilotAdditionalDirectorEntry = {
  /** The director mode. */
  mode: number;

  /**
   * A function that creates the additional director.
   * @param apValues The autopilot's state values.
   * @returns The director.
   */
  directorFactory: (apValues: APValues) => PlaneDirector;
};

/**
 * G3000 autopilot options defined by plugins.
 */
export interface G3000AutopilotPluginOptions {
  /**
   * Creates additional lateral mode directors for the autopilot. Directors for the following modes will be ignored:
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
   * @returns An iterable of additional lateral mode directors to add to the autopilot.
   */
  createAdditionalLateralDirectors?(): Iterable<Readonly<G3000AutopilotAdditionalDirectorEntry>>;

  /**
   * Creates additional vertical mode directors for the autopilot. Directors for the following modes will be ignored:
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
   * @returns An iterable of additional vertical mode directors to add to the autopilot.
   */
  createAdditionalVerticalDirectors?(): Iterable<Readonly<G3000AutopilotAdditionalDirectorEntry>>;
}
