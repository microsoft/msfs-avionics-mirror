import { NavAngleUnit, Subject, Subscribable, Unit, UnitFamily, UnitType } from 'msfssdk';

import { UnitsDistanceSettingMode, UnitsNavAngleSettingMode, UnitsUserSettingManager } from '../../../settings/UnitsUserSettings';

/**
 * A module which defines display units.
 */
export class MapUnitsModule {
  /** Distance units mode. */
  public readonly distanceMode: Subscribable<UnitsDistanceSettingMode> = this.unitsSettingManager?.getSetting('unitsDistance') ?? Subject.create(UnitsDistanceSettingMode.Nautical);

  /** Distance units mode. */
  public readonly navAngleMode: Subscribable<UnitsNavAngleSettingMode> = this.unitsSettingManager?.getSetting('unitsNavAngle') ?? Subject.create(UnitsNavAngleSettingMode.Magnetic);

  /** Distance units. */
  public readonly navAngle: Subscribable<NavAngleUnit> = this.unitsSettingManager?.navAngleUnits ?? Subject.create(NavAngleUnit.create(true));

  /** Large distance units. */
  public readonly distanceLarge: Subscribable<Unit<UnitFamily.Distance>> = this.unitsSettingManager?.distanceUnitsLarge ?? Subject.create(UnitType.NMILE);

  /** Small distance units. */
  public readonly distanceSmall: Subscribable<Unit<UnitFamily.Distance>> = this.unitsSettingManager?.distanceUnitsSmall ?? Subject.create(UnitType.FOOT);

  /**
   * Constructor.
   * @param unitsSettingManager A display units user setting manager.
   */
  constructor(private readonly unitsSettingManager?: UnitsUserSettingManager) {
  }
}