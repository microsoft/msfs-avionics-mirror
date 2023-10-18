import { EventSubscriber } from '../../../data/EventSubscriber';
import { UnitType } from '../../../math/NumberUnit';
import { Subscribable } from '../../../sub/Subscribable';
import { SubscribableUtils } from '../../../sub/SubscribableUtils';
import { Subscription } from '../../../sub/Subscription';
import { MapAutopilotPropsModule } from '../../map/modules/MapAutopilotPropsModule';
import { MapSystemContext } from '../MapSystemContext';
import { MapSystemController } from '../MapSystemController';
import { MapSystemKeys } from '../MapSystemKeys';

/**
 * Modules required for MapAutopilotPropsController.
 */
export interface MapAutopilotPropsControllerModules {
  /** Autopilot properties. */
  [MapSystemKeys.AutopilotProps]: MapAutopilotPropsModule;
}

/**
 * A key for a property in {@link MapAutopilotPropsModule}.
 */
export type MapAutopilotPropsKey = Extract<keyof MapAutopilotPropsModule, string>;

/**
 * A definition of a binding between a property in {@link MapAutopilotPropsModule} and an event bus topic.
 */
export type MapAutopilotPropsBinding = {
  /** The key of the property to bind. */
  key: MapAutopilotPropsKey;

  /** The event bus topic to which to bind the property. */
  topic: string;
};

/**
 * Updates the properties in a {@link MapAutopilotPropsModule}.
 */
export class MapAutopilotPropsController extends MapSystemController<MapAutopilotPropsControllerModules> {
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
    context: MapSystemContext<MapAutopilotPropsControllerModules>,
    private readonly properties: Iterable<MapAutopilotPropsKey | MapAutopilotPropsBinding>,
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
  private bindProperty(sub: EventSubscriber<any>, property: MapAutopilotPropsKey | MapAutopilotPropsBinding, updateFreq?: number): Subscription {
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
      default:
        throw new Error(`MapAutopilotPropsController: invalid property key: ${key}`);
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