import {
  BitFlags, MapIndexedRangeModule, MappedSubject, MappedSubscribable, MapSystemContext, MapSystemController, MapSystemKeys, MapTrafficAlertLevelVisibility,
  MapTrafficModule, NumberUnitInterface, Subscription, UnitFamily, UnitType
} from 'msfssdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapGarminTrafficModule, MapTrafficAlertLevelMode, MapTrafficAltitudeRestrictionMode } from '../modules/MapGarminTrafficModule';

/**
 * Modules required for MapTrafficController.
 */
export interface MapTrafficControllerModules {
  /** Range module. */
  [GarminMapKeys.Range]?: MapIndexedRangeModule;

  /** Traffic module. */
  [MapSystemKeys.Traffic]: MapTrafficModule;

  /** Garmin traffic module. */
  [GarminMapKeys.Traffic]: MapGarminTrafficModule;
}

/**
 * Controls the display of traffic based on the values in {@link MapGarminTrafficModule}.
 */
export class MapTrafficController extends MapSystemController<MapTrafficControllerModules> {
  private static readonly NAN_RANGE = UnitType.NMILE.createNumber(NaN);

  private static readonly ALERT_LEVEL_VIS_MAP = {
    [MapTrafficAlertLevelMode.All]: MapTrafficAlertLevelVisibility.All,
    [MapTrafficAlertLevelMode.Advisories]: BitFlags.not(MapTrafficAlertLevelVisibility.All, MapTrafficAlertLevelVisibility.Other),
    [MapTrafficAlertLevelMode.TA_RA]: MapTrafficAlertLevelVisibility.TrafficAdvisory | MapTrafficAlertLevelVisibility.ResolutionAdvisory,
    [MapTrafficAlertLevelMode.RA]: MapTrafficAlertLevelVisibility.ResolutionAdvisory
  };

  private static readonly ALTITUDE_RESTRICTION_UNRES = UnitType.FOOT.createNumber(9900);
  private static readonly ALTITUDE_RESTRICTION_NORMAL = UnitType.FOOT.createNumber(2700);

  private readonly rangeModule = this.context.model.getModule(GarminMapKeys.Range);
  private readonly trafficModule = this.context.model.getModule(MapSystemKeys.Traffic);
  private readonly garminTrafficModule = this.context.model.getModule(GarminMapKeys.Traffic);

  private showPipe?: Subscription;
  private alertLevelPipe?: Subscription;
  private isAltitudeRelativePipe?: Subscription;
  private altitudeModeSub?: Subscription;

  private offScaleRange?: MappedSubscribable<NumberUnitInterface<UnitFamily.Distance>>;

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param useOuterRangeAsOffScale Whether to use the map's outer traffic range as the traffic off-scale range.
   */
  constructor(
    context: MapSystemContext<MapTrafficControllerModules, any, any, any>,
    private readonly useOuterRangeAsOffScale: boolean
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.showPipe = this.garminTrafficModule.show.pipe(this.trafficModule.show);

    this.alertLevelPipe = this.garminTrafficModule.alertLevelMode.pipe(
      this.trafficModule.alertLevelVisibility,
      mode => MapTrafficController.ALERT_LEVEL_VIS_MAP[mode] ?? MapTrafficAlertLevelVisibility.All
    );

    this.isAltitudeRelativePipe = this.garminTrafficModule.isAltitudeRelative.pipe(this.trafficModule.isAltitudeRelative);

    this.altitudeModeSub = this.garminTrafficModule.altitudeRestrictionMode.sub(mode => {
      if (mode === MapTrafficAltitudeRestrictionMode.Unrestricted || mode === MapTrafficAltitudeRestrictionMode.Above) {
        this.trafficModule.altitudeRestrictionAbove.set(MapTrafficController.ALTITUDE_RESTRICTION_UNRES);
      } else {
        this.trafficModule.altitudeRestrictionAbove.set(MapTrafficController.ALTITUDE_RESTRICTION_NORMAL);
      }

      if (mode === MapTrafficAltitudeRestrictionMode.Unrestricted || mode === MapTrafficAltitudeRestrictionMode.Below) {
        this.trafficModule.altitudeRestrictionBelow.set(MapTrafficController.ALTITUDE_RESTRICTION_UNRES);
      } else {
        this.trafficModule.altitudeRestrictionBelow.set(MapTrafficController.ALTITUDE_RESTRICTION_NORMAL);
      }
    });

    if (this.useOuterRangeAsOffScale && this.rangeModule !== undefined) {
      this.offScaleRange = MappedSubject.create(
        ([rangeArray, outerRangeIndex]): NumberUnitInterface<UnitFamily.Distance> => {
          return rangeArray[outerRangeIndex] ?? MapTrafficController.NAN_RANGE;
        },
        this.rangeModule.nominalRanges,
        this.garminTrafficModule.outerRangeIndex
      );

      this.offScaleRange.pipe(this.trafficModule.offScaleRange);
    }
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.showPipe?.destroy();
    this.alertLevelPipe?.destroy();
    this.isAltitudeRelativePipe?.destroy();
    this.altitudeModeSub?.destroy();

    this.offScaleRange?.destroy();
  }
}