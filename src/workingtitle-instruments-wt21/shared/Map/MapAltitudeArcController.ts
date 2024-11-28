import { MapAltitudeArcModule, MapSystemContext, MapSystemController, MapSystemKeys, UserSettingManager } from '@microsoft/msfs-sdk';

import { HSIFormat, MapSettingsMfdAliased, MapSettingsPfdAliased } from './MapUserSettings';

/**
 * Modules required by MapAltitudeArcController.
 */
export interface MapAltitudeArcControllerModules {
  /** Map altitude arc module. */
  [MapSystemKeys.AltitudeArc]: MapAltitudeArcModule;
}

/**
 * A map system controller that controls the display of the altitude arc.
 */
export class MapAltitudeArcController extends MapSystemController<MapAltitudeArcControllerModules> {
  private readonly altArcModule: MapAltitudeArcModule = this.context.model.getModule(MapSystemKeys.AltitudeArc);

  /**
   * Creates an instance of the MapAltitudeArcController.
   * @param context The map system context to use with this controller.
   * @param settings The map user settings
   */
  constructor(
    context: MapSystemContext<MapAltitudeArcControllerModules>,
    private readonly settings: UserSettingManager<MapSettingsPfdAliased | MapSettingsMfdAliased>
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.wireSettings();
  }

  /**
   * Wires the settings system to the altitude arc controller.
   */
  private wireSettings(): void {
    this.settings.whenSettingChanged('mapAltitudeArcShow').handle((v) => this.handleSettingChanged(v));
    this.settings.whenSettingChanged('hsiFormat').handle((v) => this.handleFormatChanged(v));
  }

  /**
   * Handles when the HSI format setting changed.
   * @param v The new HSI format.
   */
  private handleFormatChanged(v: HSIFormat): void {
    // arc banana should only be visible in PPOS format
    if (v === 'PPOS') {
      this.altArcModule.show.set(this.settings.getSetting('mapAltitudeArcShow').get());
    } else {
      this.altArcModule.show.set(false);
    }
  }

  /**
   * Handles when the RNG: ALT SEL setting has changed.
   * @param isEnabled Indicating if arc banana should be enabled.
   */
  private handleSettingChanged(isEnabled: boolean): void {
    this.altArcModule.show.set(isEnabled && this.settings.getSetting('hsiFormat').get() === 'PPOS');
  }
}
