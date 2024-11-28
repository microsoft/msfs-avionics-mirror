import { EventBus, HEvent, Subject } from '@microsoft/msfs-sdk';
import { AdcDefinition } from '../Config';

/** Events published by the ADC selector */
export interface AdcSystemSelectorEvents {
  /** The index of the selected adc system */
  adc_selected_source_index: number
}

/**
 * A class responsible for selecting the Attitude and Heading Reference System in use.
 */
export class AdcSystemSelector {
  private static readonly TOGGLE_REVERSION_H_EVENT_REGEX = /(WT21_ADC_REVERSION_TOGGLE)_(\d)/;

  private readonly selectedIndex = Subject.create(-1);

  private readonly defaultIndex: number;

  /** @inheritdoc */
  constructor(private readonly bus: EventBus, private readonly instrumentIndex: number, adcDefinitions: AdcDefinition[]) {
    this.defaultIndex = adcDefinitions.findIndex((def) => def !== undefined && def.defaultPfdIndex === instrumentIndex);

    this.selectedIndex.set(this.defaultIndex);

    this.bus.getSubscriber<HEvent>().on('hEvent').handle((hEvent) => {
      const regexMatches = hEvent.match(AdcSystemSelector.TOGGLE_REVERSION_H_EVENT_REGEX);
      if (regexMatches && regexMatches[2] === this.instrumentIndex.toString()) {
        let newSourceIndex = this.selectedIndex.get() + 1;
        if (adcDefinitions[newSourceIndex] === undefined) {
          newSourceIndex = 1;
        }
        this.selectedIndex.set(newSourceIndex);
      }
    });

    this.selectedIndex.sub((index) => this.bus.getPublisher<AdcSystemSelectorEvents>().pub('adc_selected_source_index', index, false, true), true);
  }
}
