import { AirportClassMask, BitFlags, NearestAirportSearchSession, NearestContext, UnitType } from '@microsoft/msfs-sdk';
import { SurfaceTypeOption } from '../Settings/GeneralSettingsProvider';

export const AirportClassMaskFromSurfaceTypeOption: { [k in SurfaceTypeOption]: number } = {
  [SurfaceTypeOption.Any]: BitFlags.union(
    AirportClassMask.HardSurface,
    AirportClassMask.SoftSurface,
    AirportClassMask.AllWater,
    AirportClassMask.HeliportOnly,
    AirportClassMask.Private,
  ),
  [SurfaceTypeOption.HardOnly]: AirportClassMask.HardSurface,
  [SurfaceTypeOption.HardOrSoft]: BitFlags.union(
    AirportClassMask.HardSurface,
    AirportClassMask.SoftSurface,
  ),
  [SurfaceTypeOption.Water]: AirportClassMask.AllWater,
};

/**
 * Controls the nearest search filter for the GNS unit
 */
export class NearestAirportFilter {
  private static classMask = AirportClassMaskFromSurfaceTypeOption[SurfaceTypeOption.Any];
  private static minimumRunwayLength = 0;

  /**
   * Sets the provided surface type option as the active surface type filter
   *
   * @param option the surface type option
   */
  public static setSurfaceTypeFilter(option: SurfaceTypeOption): void {
    this.classMask = AirportClassMaskFromSurfaceTypeOption[option];

    this.updateNearestContext();
  }

  /**
   * Sets the provided minimum runway length as the active minimum runway length filter
   *
   * @param length the minimum runway length, in feet
   */
  public static setMinimumRunwayLength(length: number): void {
    const lengthMetres = UnitType.FOOT.convertTo(length, UnitType.METER);

    this.minimumRunwayLength = Math.max(0, lengthMetres);

    this.updateNearestContext();
  }

  /**
   * Updates the nearest context with the active nearest filters
   */
  private static updateNearestContext(): void {
    NearestContext.getInstance().airports.setFilter(true, this.classMask);
    NearestContext.getInstance().airports.setExtendedFilters(
      NearestAirportSearchSession.Defaults.SurfaceTypeMask,
      NearestAirportSearchSession.Defaults.ApproachTypeMask,
      NearestAirportSearchSession.Defaults.ToweredMask,
      this.minimumRunwayLength,
    );
    NearestContext.getInstance().update();
  }
}