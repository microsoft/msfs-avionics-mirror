import { BasePublisher, EventBus, PublishPacer } from '@microsoft/msfs-sdk';

/** A saved radio frequency. */
export interface SavedFrequenciesData {
  /** The frequency, in MHz. */
  frequency: number;
  /** The name of the radio station. */
  name: string;
}

/** Data for frequency array changed events. */
export type FrequencyArrayChangedEventData = {
  /** The type of radio to update. */
  radioType: 'com' | 'nav';
  /** The type of frequency array to update. */
  frequencyType: 'recent' | 'user';
  /** The new frequency array. */
  frequencyArray: readonly SavedFrequenciesData[];
}

/** Data for saved frequency events. */
export type SavedFrequencyEventData = {
  /** The type of radio to add or remove the frequency from. */
  radioType: 'com' | 'nav';
  /** The type of frequency to add or remove. */
  frequencyType: 'recent' | 'user';
  /** The frequency to add or remove. */
  frequency: number;
  /** The name of the frequency to add or remove. */
  name: string;
}

/** Events for the NavComControlPublisher. */
export interface G3XNavComControlEvents {
  /** Event for adding a saved com frequency. */
  add_saved_frequency: SavedFrequencyEventData;
  /** Event for removing a saved com frequency. */
  remove_saved_frequency: SavedFrequencyEventData;
  /** Event for updating the saved frequency data. */
  frequency_array_changed: FrequencyArrayChangedEventData;
}

/** A publisher for G3XNavComControlEvents. */
export class G3XNavComControlPublisher extends BasePublisher<G3XNavComControlEvents> {
  /**
   * Create a {@link G3XNavComControlPublisher}.
   * @param bus The EventBus to publish to.
   * @param pacer An optional pacer to use to control the rate of publishing.
   */
  public constructor(bus: EventBus, pacer: PublishPacer<G3XNavComControlEvents> | undefined = undefined) {
    super(bus, pacer);

    super.startPublish();
  }

  /**
   * Publish a G3X NavCom control event.
   * @param event The event from G3XNavComControlEvents.
   * @param value The value of the event.
   */
  public publishEvent<K extends keyof G3XNavComControlEvents>(event: K, value: G3XNavComControlEvents[K]): void {
    this.publish(event, value, true, false);
  }
}
