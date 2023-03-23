import { MapIndexedRangeModule, MapSystemContext, MapSystemController, Subject, Subscribable, Subscription, UnitType, UserSettingManager } from '@microsoft/msfs-sdk';

import { MapTrafficAlertLevelSettingMode, MapUserSettingTypes } from '../../../settings/MapUserSettings';
import { TrafficAltitudeModeSetting, TrafficMotionVectorModeSetting, TrafficUserSettingTypes } from '../../../settings/TrafficUserSettings';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapDeclutterMode } from '../modules/MapDeclutterModule';
import {
  MapGarminTrafficModule, MapTrafficAlertLevelMode, MapTrafficAltitudeRestrictionMode, MapTrafficMotionVectorMode
} from '../modules/MapGarminTrafficModule';
import { MapSymbolVisController } from './MapSymbolVisController';

/**
 * User settings controlling the visibility of map airspaces.
 */
export type MapTrafficUserSettings = Pick<
  MapUserSettingTypes,
  'mapTrafficShow'
  | 'mapTrafficRangeIndex'
  | 'mapTrafficAlertLevelMode'
  | 'mapTrafficLabelShow'
  | 'mapTrafficLabelRangeIndex'
>;

/**
 * Modules required for MapGarminTrafficController.
 */
export interface MapGarminTrafficControllerModules {
  /** Range module. */
  [GarminMapKeys.Range]?: MapIndexedRangeModule;

  /** Garmin traffic module. */
  [GarminMapKeys.Traffic]: MapGarminTrafficModule;
}

/**
 * Controls the display of traffic on a map based on user settings.
 */
export class MapGarminTrafficController extends MapSystemController<MapGarminTrafficControllerModules> {
  private static readonly ALT_MODE_MAP = {
    [TrafficAltitudeModeSetting.Above]: MapTrafficAltitudeRestrictionMode.Above,
    [TrafficAltitudeModeSetting.Below]: MapTrafficAltitudeRestrictionMode.Below,
    [TrafficAltitudeModeSetting.Normal]: MapTrafficAltitudeRestrictionMode.Normal,
    [TrafficAltitudeModeSetting.Unrestricted]: MapTrafficAltitudeRestrictionMode.Unrestricted
  };
  private static readonly MOTION_VECTOR_MODE_MAP = {
    [TrafficMotionVectorModeSetting.Off]: MapTrafficMotionVectorMode.Off,
    [TrafficMotionVectorModeSetting.Absolute]: MapTrafficMotionVectorMode.Absolute,
    [TrafficMotionVectorModeSetting.Relative]: MapTrafficMotionVectorMode.Relative
  };
  private static readonly ALERT_LEVEL_MODE_MAP = {
    [MapTrafficAlertLevelSettingMode.All]: MapTrafficAlertLevelMode.All,
    [MapTrafficAlertLevelSettingMode.Advisories]: MapTrafficAlertLevelMode.Advisories,
    [MapTrafficAlertLevelSettingMode.TA_RA]: MapTrafficAlertLevelMode.TA_RA,
    [MapTrafficAlertLevelSettingMode.RA]: MapTrafficAlertLevelMode.RA
  };

  private readonly garminTrafficModule = this.context.model.getModule(GarminMapKeys.Traffic);

  private readonly altitudeModeSetting: Subscribable<TrafficAltitudeModeSetting>;
  private readonly altitudeRelativeSetting: Subscribable<boolean>;
  private readonly motionVectorModeSetting: Subscribable<TrafficMotionVectorModeSetting>;
  private readonly motionVectorLookaheadSetting: Subscribable<number>;

  private readonly alertLevelModeSetting: Subscribable<MapTrafficAlertLevelSettingMode> | undefined;

  private altitudeModeSettingPipe?: Subscription;
  private altitudeRelativeSettingPipe?: Subscription;
  private motionVectorModeSettingPipe?: Subscription;
  private motionVectorLookaheadSettingSub?: Subscription;

  private iconVisController?: MapSymbolVisController;
  private labelVisController?: MapSymbolVisController;
  private alertLevelModePipe?: Subscription;

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param trafficSettingManager A user settings manager containing traffic settings.
   * @param mapSettingManager A user settings manager containing map traffic settings. If not defined, the display of
   * traffic will not be bound to map traffic user settings.
   */
  constructor(
    context: MapSystemContext<MapGarminTrafficControllerModules, any, any, any>,
    trafficSettingManager: UserSettingManager<Partial<TrafficUserSettingTypes>>,
    mapSettingManager?: UserSettingManager<Partial<MapTrafficUserSettings>>
  ) {
    super(context);

    this.altitudeModeSetting = trafficSettingManager.tryGetSetting('trafficAltitudeMode')
      ?? Subject.create(TrafficAltitudeModeSetting.Normal);

    this.altitudeRelativeSetting = trafficSettingManager.tryGetSetting('trafficAltitudeRelative')
      ?? Subject.create(true);

    this.motionVectorModeSetting = trafficSettingManager.tryGetSetting('trafficMotionVectorMode')
      ?? Subject.create(TrafficMotionVectorModeSetting.Off);

    this.motionVectorLookaheadSetting = trafficSettingManager.tryGetSetting('trafficMotionVectorLookahead')
      ?? Subject.create(60);

    if (mapSettingManager !== undefined) {
      const iconShowSetting = mapSettingManager.tryGetSetting('mapTrafficShow');
      const iconRangeIndexSetting = mapSettingManager.tryGetSetting('mapTrafficRangeIndex');
      if (iconShowSetting !== undefined) {
        this.iconVisController = new MapSymbolVisController(
          context as any,
          iconShowSetting,
          iconRangeIndexSetting ?? Subject.create(Number.MAX_SAFE_INTEGER),
          MapDeclutterMode.Level1,
          this.garminTrafficModule.show
        );
      }

      const labelShowSetting = mapSettingManager.tryGetSetting('mapTrafficLabelShow') as Subscribable<boolean> | undefined;
      const labelRangeIndexSetting = mapSettingManager.tryGetSetting('mapTrafficLabelRangeIndex') as Subscribable<number> | undefined;
      if (labelShowSetting !== undefined) {
        this.labelVisController = new MapSymbolVisController(
          context as any,
          labelShowSetting,
          labelRangeIndexSetting ?? Subject.create(Number.MAX_SAFE_INTEGER),
          MapDeclutterMode.Level1,
          this.garminTrafficModule.showIntruderLabel
        );
      }

      this.alertLevelModeSetting = mapSettingManager.tryGetSetting('mapTrafficAlertLevelMode') as Subscribable<MapTrafficAlertLevelSettingMode> | undefined;
    }
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.altitudeModeSettingPipe = this.altitudeModeSetting.pipe(
      this.garminTrafficModule.altitudeRestrictionMode,
      setting => MapGarminTrafficController.ALT_MODE_MAP[setting] ?? MapTrafficAltitudeRestrictionMode.Unrestricted
    );

    this.altitudeRelativeSettingPipe = this.altitudeRelativeSetting.pipe(this.garminTrafficModule.isAltitudeRelative);

    this.motionVectorModeSettingPipe = this.motionVectorModeSetting.pipe(
      this.garminTrafficModule.motionVectorMode,
      setting => MapGarminTrafficController.MOTION_VECTOR_MODE_MAP[setting] ?? MapTrafficMotionVectorMode.Off
    );

    this.motionVectorLookaheadSettingSub = this.motionVectorLookaheadSetting.sub(setting => {
      this.garminTrafficModule.motionVectorLookahead.set(setting, UnitType.SECOND);
    });

    this.iconVisController?.onAfterMapRender();
    this.labelVisController?.onAfterMapRender();

    this.alertLevelModePipe = this.alertLevelModeSetting?.pipe(
      this.garminTrafficModule.alertLevelMode,
      setting => MapGarminTrafficController.ALERT_LEVEL_MODE_MAP[setting] ?? MapTrafficAlertLevelMode.All
    );
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.altitudeModeSettingPipe?.destroy();
    this.altitudeRelativeSettingPipe?.destroy();
    this.motionVectorModeSettingPipe?.destroy();
    this.motionVectorLookaheadSettingSub?.destroy();

    this.iconVisController?.destroy();
    this.labelVisController?.destroy();

    this.alertLevelModePipe?.destroy();
  }
}