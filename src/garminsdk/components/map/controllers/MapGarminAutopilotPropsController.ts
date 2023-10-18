import { EventSubscriber, MapSystemContext, MapSystemController, MapSystemKeys, Subscribable, SubscribableUtils, Subscription, UnitType } from '@microsoft/msfs-sdk';

import { MapGarminAutopilotPropsModule } from '../modules/MapGarminAutopilotPropsModule';

/**
 * Modules required for MapGarminAutopilotPropsController.
 */
export interface MapGarminAutopilotPropsControllerModules {
  /** Autopilot properties. */
  [MapSystemKeys.AutopilotProps]: MapGarminAutopilotPropsModule;
}

/**
 * A key for a property in {@link MapGarminAutopilotPropsModule}.
 */
export type MapGarminAutopilotPropsKey = Extract<keyof MapGarminAutopilotPropsModule, string>;

/**
 * A definition of a binding between a property in {@link MapGarminAutopilotPropsModule} and an event bus topic.
 */
export type MapGarminAutopilotPropsBinding = {
  /** The key of the property to bind. */
  key: MapGarminAutopilotPropsKey;

  /** The event bus topic to which to bind the property. */
  topic: string;
};

/**
 * Binds the properties in a {@link MapGarminAutopilotPropsModule} to event bus topics.
 */
export class MapGarminAutopilotPropsController extends MapSystemController<MapGarminAutopilotPropsControllerModules> {
  private readonly module = this.context.model.getModule(MapSystemKeys.AutopilotProps);

  private readonly updateFreq?: Subscribable<number>;

  private readonly subs: Subscription[] = [];

  private updateFreqSub?: Subscription;

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param properties The properties to update on the module.
   * @param updateFreq The update frequency, in hertz. If not defined, the properties will be updated every frame.
   */
  constructor(
    context: MapSystemContext<MapGarminAutopilotPropsControllerModules>,
    private readonly properties: Iterable<MapGarminAutopilotPropsKey | MapGarminAutopilotPropsBinding>,
    updateFreq?: number | Subscribable<number>
  ) {
    super(context);

    this.updateFreq = updateFreq === undefined ? undefined : SubscribableUtils.toSubscribable(updateFreq, true);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    const sub = this.context.bus.getSubscriber<any>();

    if (this.updateFreq) {
      this.updateFreqSub = this.updateFreq.sub(freq => {
        for (const subscription of this.subs) {
          subscription.destroy();
        }

        this.subs.length = 0;

        for (const property of this.properties) {
          this.subs.push(this.bindProperty(sub, property, freq));
        }
      }, true);
    } else {
      for (const property of this.properties) {
        this.subs.push(this.bindProperty(sub, property));
      }
    }
  }

  /**
   * Binds a module property to data received through the event bus.
   * @param sub The event bus subscriber.
   * @param property The property to bind.
   * @param updateFreq The data update frequency.
   * @returns The subscription created by the binding.
   * @throws Error if the property is invalid.
   */
  private bindProperty(sub: EventSubscriber<any>, property: MapGarminAutopilotPropsKey | MapGarminAutopilotPropsBinding, updateFreq?: number): Subscription {
    let key: string;
    let topic: string | undefined = undefined;

    if (typeof property === 'string') {
      key = property;
    } else {
      key = property.key;
      topic = property.topic;
    }

    switch (key) {
      case 'selectedAltitude':
        topic ??= 'ap_altitude_selected';
        return (updateFreq === undefined ? sub.on(topic) : sub.on(topic).atFrequency(updateFreq))
          .handle(alt => { this.module.selectedAltitude.set(alt, UnitType.FOOT); });
      case 'selectedHeading':
        topic ??= 'ap_heading_selected';
        return (updateFreq === undefined ? sub.on(topic) : sub.on(topic).atFrequency(updateFreq))
          .handle(hdg => { this.module.selectedHeading.set(hdg); });
      case 'isTurnHdgAdjustActive':
        topic ??= 'hdg_sync_turn_adjust_active';
        return (updateFreq === undefined ? sub.on(topic) : sub.on(topic).atFrequency(updateFreq))
          .handle(active => { this.module.isTurnHdgAdjustActive.set(active); });
      case 'isHdgSyncModeActive':
        topic ??= 'hdg_sync_mode_active';
        return (updateFreq === undefined ? sub.on(topic) : sub.on(topic).atFrequency(updateFreq))
          .handle(active => { this.module.isHdgSyncModeActive.set(active); });
      case 'manualHeadingSelect':
        topic ??= 'hdg_sync_manual_select';
        return sub.on(topic).handle(() => { this.module.manualHeadingSelect.notify(); });
      default:
        throw new Error(`MapGarminAutopilotPropsController: invalid property key: ${key}`);
    }
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.updateFreqSub?.destroy();
    for (const sub of this.subs) {
      sub.destroy();
    }

    super.destroy();
  }
}