import { UnitType } from '../../../math/NumberUnit';
import { NumberUnitSubject } from '../../../math/NumberUnitSubject';
import { Subject } from '../../../sub/Subject';

/**
 * A module describing the state of the autopilot.
 */
export class MapAutopilotPropsModule {
  /** The altitude preselector setting. */
  public readonly selectedAltitude = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));

  /** The selected heading setting, in degrees. */
  public readonly selectedHeading = Subject.create(0);
}