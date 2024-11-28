import {
  MapSystemContext, MapSystemController, Subscription, UserSettingManager
} from '@microsoft/msfs-sdk';

import { G3XMapLabelTextSizeSettingMode, G3XMapUserSettingTypes } from '../../../Settings/MapUserSettings';
import { G3XMapKeys } from '../G3XMapKeys';
import { MapLabelTextModule, MapLabelTextSizeMode } from '../Modules/MapLabelTextModule';

/**
 * User settings controlling map waypoint label text.
 */
export type MapWaypointLabelTextUserSettings = Pick<
  G3XMapUserSettingTypes,
  'mapAirportLargeTextSize'
  | 'mapAirportMediumTextSize'
  | 'mapAirportSmallTextSize'
  | 'mapVorTextSize'
  | 'mapNdbTextSize'
  | 'mapIntersectionTextSize'
  | 'mapUserWaypointTextSize'
>;

/**
 * Modules required for MapWaypointLabelTextController.
 */
export interface MapWaypointLabelTextControllerModules {
  /** Data integrity module. */
  [G3XMapKeys.LabelText]: MapLabelTextModule;
}

/**
 * Controls the map's waypoint label text based on user settings.
 */
export class MapWaypointLabelTextController extends MapSystemController<MapWaypointLabelTextControllerModules> {
  private static readonly SIZE_MAP: Record<G3XMapLabelTextSizeSettingMode, MapLabelTextSizeMode> = {
    [G3XMapLabelTextSizeSettingMode.None]: MapLabelTextSizeMode.None,
    [G3XMapLabelTextSizeSettingMode.Small]: MapLabelTextSizeMode.Small,
    [G3XMapLabelTextSizeSettingMode.Medium]: MapLabelTextSizeMode.Medium,
    [G3XMapLabelTextSizeSettingMode.Large]: MapLabelTextSizeMode.Large
  };

  private static readonly SIZE_MAP_FUNC = (setting: G3XMapLabelTextSizeSettingMode): MapLabelTextSizeMode => {
    return MapWaypointLabelTextController.SIZE_MAP[setting] ?? MapLabelTextSizeMode.None;
  };

  private readonly subscriptions: Subscription[] = [];

  /**
   * Creates a new instance of MapDataIntegrityController.
   * @param context This controller's map context.
   * @param settingManager A setting manager containing the user settings controlling waypoint label text.
   */
  public constructor(
    context: MapSystemContext<MapWaypointLabelTextControllerModules, any, any, any>,
    private readonly settingManager: UserSettingManager<Partial<MapWaypointLabelTextUserSettings>>
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    const module = this.context.model.getModule(G3XMapKeys.LabelText);

    for (const sub of [
      this.settingManager.tryGetSetting('mapAirportLargeTextSize')?.pipe(module.airportLargeTextSize, MapWaypointLabelTextController.SIZE_MAP_FUNC),
      this.settingManager.tryGetSetting('mapAirportMediumTextSize')?.pipe(module.airportMediumTextSize, MapWaypointLabelTextController.SIZE_MAP_FUNC),
      this.settingManager.tryGetSetting('mapAirportSmallTextSize')?.pipe(module.airportSmallTextSize, MapWaypointLabelTextController.SIZE_MAP_FUNC),
      this.settingManager.tryGetSetting('mapVorTextSize')?.pipe(module.vorTextSize, MapWaypointLabelTextController.SIZE_MAP_FUNC),
      this.settingManager.tryGetSetting('mapNdbTextSize')?.pipe(module.ndbTextSize, MapWaypointLabelTextController.SIZE_MAP_FUNC),
      this.settingManager.tryGetSetting('mapIntersectionTextSize')?.pipe(module.intTextSize, MapWaypointLabelTextController.SIZE_MAP_FUNC),
      this.settingManager.tryGetSetting('mapUserWaypointTextSize')?.pipe(module.userTextSize, MapWaypointLabelTextController.SIZE_MAP_FUNC)
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