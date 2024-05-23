import {
  MapSystemContext, MapSystemController, Subscription, UnitType, UserSettingManager
} from '@microsoft/msfs-sdk';

import { GarminMapKeys } from '@microsoft/msfs-garminsdk';

import { G3XMapTrackVectorSettingMode, G3XMapUserSettingTypes } from '../../../Settings/MapUserSettings';
import { G3XMapTrackVectorMode, G3XMapTrackVectorModule } from '../Modules/G3XMapTrackVectorModule';

/**
 * User settings controlling the map track vector.
 */
export type G3XMapTrackVectorUserSettings = Pick<
  G3XMapUserSettingTypes,
  'mapTrackVectorMode'
  | 'mapTrackVectorDistance'
  | 'mapTrackVectorLookahead'
>;

/**
 * Modules required for G3XMapTrackVectorController.
 */
export interface G3XMapTrackVectorControllerModules {
  /** Data integrity module. */
  [GarminMapKeys.TrackVector]: G3XMapTrackVectorModule;
}

/**
 * Controls the map's track vector based on user settings.
 */
export class G3XMapTrackVectorController extends MapSystemController<G3XMapTrackVectorControllerModules> {
  private static readonly MODE_MAP: Record<G3XMapTrackVectorSettingMode, G3XMapTrackVectorMode> = {
    [G3XMapTrackVectorSettingMode.Off]: G3XMapTrackVectorMode.Off,
    [G3XMapTrackVectorSettingMode.Distance]: G3XMapTrackVectorMode.Distance,
    [G3XMapTrackVectorSettingMode.Time]: G3XMapTrackVectorMode.Time
  };

  private readonly subscriptions: Subscription[] = [];

  /**
   * Creates a new instance of MapDataIntegrityController.
   * @param context This controller's map context.
   * @param settingManager A setting manager containing the user settings controlling waypoint label text.
   */
  public constructor(
    context: MapSystemContext<G3XMapTrackVectorControllerModules, any, any, any>,
    private readonly settingManager: UserSettingManager<Partial<G3XMapTrackVectorUserSettings>>
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    const module = this.context.model.getModule(GarminMapKeys.TrackVector);

    for (const sub of [
      this.settingManager.tryGetSetting('mapTrackVectorMode')?.pipe(module.mode, setting => {
        return G3XMapTrackVectorController.MODE_MAP[setting] ?? G3XMapTrackVectorMode.Off;
      }),

      this.settingManager.tryGetSetting('mapTrackVectorDistance')?.sub(distance => {
        module.lookaheadDistance.set(distance, UnitType.NMILE);
      }, true),

      this.settingManager.tryGetSetting('mapTrackVectorLookahead')?.sub(time => {
        module.lookaheadTime.set(time, UnitType.SECOND);
      }, true)
    ]) {
      if (sub) {
        this.subscriptions.push(sub);
      }
    }
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}