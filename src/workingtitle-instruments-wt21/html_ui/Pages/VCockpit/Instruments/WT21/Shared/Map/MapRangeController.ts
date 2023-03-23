import { GameStateProvider, MapSystemContext, MapSystemController, MapSystemKeys, UnitType, UserSettingManager } from '@microsoft/msfs-sdk';

import { MapSettingsMfdAliased, MapSettingsPfdAliased, MapUserSettings, PfdOrMfd } from './MapUserSettings';
import { WT21MapKeys } from './WT21MapKeys';

/**
 * A controller that handles map range settings.
 */
export class MapRangeController extends MapSystemController {
  private readonly settings: UserSettingManager<MapSettingsPfdAliased | MapSettingsMfdAliased>;

  /**
   * Creates an instance of the MapRangeController.
   * @param context The map system context to use with this controller.
   * @param pfdOrMfd Whether or not the map is on the PFD or MFD.
   */
  constructor(
    context: MapSystemContext,
    private readonly pfdOrMfd: PfdOrMfd
  ) {
    super(context);

    this.settings = MapUserSettings.getAliasedManager(this.context.bus, this.pfdOrMfd);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.wireSettings();
  }

  /**
   * Wires the controller to the settings manager.
   */
  private wireSettings(): void {
    this.settings.getSetting('mapRange').sub(this.handleRangeChanged.bind(this), true);
  }

  /**
   * Handles when the range changes.
   * @param range The range of the map, in nautical miles.
   */
  private handleRangeChanged(range: number): void {
    this.context.projection.setQueued({ range: UnitType.NMILE.convertTo(range, UnitType.GA_RADIAN) });
    // HINT: little hacky. avoids running this during the initialization phase of the map
    if (GameStateProvider.get().get() === GameState.ingame) {
      this.doBingLayerTimeout();

      this.doMiscLayerTimeout(`${MapSystemKeys.NearestWaypoints}`);
      this.doMiscLayerTimeout(`${MapSystemKeys.TextLayer}`);
      this.doMiscLayerTimeout(`${MapSystemKeys.FlightPlan}0`);
      this.doMiscLayerTimeout(`${MapSystemKeys.FlightPlan}1`);
      this.doMiscLayerTimeout(`${MapSystemKeys.Traffic}`);
      this.doMiscLayerTimeout(`${MapSystemKeys.AltitudeArc}`);
      this.doMiscLayerTimeout(`${WT21MapKeys.Tod}`);
    }
  }

  /**
   * Simulates the timeout of the bing map layer during.
   */
  private doBingLayerTimeout(): void {
    const bingLayer = this.context.getLayer(`${MapSystemKeys.Bing}`);
    if (bingLayer.isVisible() === true) {
      setTimeout(() => {
        bingLayer.setVisible(false);
        setTimeout(() => {
          bingLayer.setVisible(true);
        }, 950);
      }, 0);
    }
  }

  /**
   * Simulates the timeout of the map layers during.
   * @param key The key of the map layer.
   */
  private doMiscLayerTimeout(key: string): void {
    const layer = this.context.getLayer(key);
    if (layer.isVisible() === true) {
      setTimeout(() => {
        layer.setVisible(false);
        setTimeout(() => {
          layer.setVisible(true);
        }, (Math.random() * (0.80 - 0.40) + 0.40) * 1000);
      }, 0);
    }
  }
}