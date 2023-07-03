import { NumberUnitSubject, UnitType } from '../../../math';

/**
 * A module describing the state of the autopilot.
 */
export class MapAutopilotPropsModule {
  /** The altitude preselector setting. */
  public readonly selectedAltitude = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));
}