import { APEvents, MapAutopilotPropsModule, MapSystemController, MapSystemKeys, Subscription, UnitType } from '@microsoft/msfs-sdk';

/**
 * Modules required for MapAutopilotPropsController.
 */
export interface MapAutopilotPropsControllerModules {
  /** Autopilot properties. */
  [MapSystemKeys.AutopilotProps]: MapAutopilotPropsModule;
}

/**
 * Updates the properties in a {@link MapAutopilotPropsModule}.
 */
export class MapAutopilotPropsController extends MapSystemController<MapAutopilotPropsControllerModules> {
  private readonly module = this.context.model.getModule(MapSystemKeys.AutopilotProps);

  private readonly subs = [] as Subscription[];

  /** @inheritdoc */
  public onAfterMapRender(): void {
    const sub = this.context.bus.getSubscriber<APEvents>();

    this.subs.push(
      sub.on('ap_altitude_selected_3').atFrequency(4).handle(alt => this.module.selectedAltitude.set(alt, UnitType.FOOT)),
    );
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.subs.forEach(sub => sub.destroy());
  }
}