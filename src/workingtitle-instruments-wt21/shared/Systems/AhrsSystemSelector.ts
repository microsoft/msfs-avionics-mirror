import { EventBus, HEvent, Subject } from '@microsoft/msfs-sdk';
import { AhrsDefinition } from '../Config';

/** Events published by the AHRS selector */
export interface AhrsSystemSelectorEvents {
  /** The index of the selected ahrs system */
  ahrs_selected_source_index: number
}

/**
 * A class responsible for selecting the Attitude and Heading Reference System in use.
 */
export class AhrsSystemSelector {
  private static readonly TOGGLE_REVERSION_H_EVENT_REGEX = /(WT21_AHRS_REVERSION_TOGGLE)_(\d)/;

  private readonly selectedIndex = Subject.create(-1);

  private readonly defaultIndex: number;

  /** @inheritdoc */
  constructor(private readonly bus: EventBus, private readonly instrumentIndex: number, ahrsDefinitions: AhrsDefinition[]) {
    this.defaultIndex = ahrsDefinitions.findIndex((def) => def !== undefined && def.defaultPfdIndex === instrumentIndex);

    this.selectedIndex.set(this.defaultIndex);

    this.bus.getSubscriber<HEvent>().on('hEvent').handle((hEvent) => {
      const regexMatches = hEvent.match(AhrsSystemSelector.TOGGLE_REVERSION_H_EVENT_REGEX);
      if (regexMatches && regexMatches[2] === this.instrumentIndex.toString()) {
        let newSourceIndex = this.selectedIndex.get() + 1;
        if (ahrsDefinitions[newSourceIndex] === undefined) {
          newSourceIndex = 1;
        }
        this.selectedIndex.set(newSourceIndex);
      }
    });

    this.selectedIndex.sub((index) => this.bus.getPublisher<AhrsSystemSelectorEvents>().pub('ahrs_selected_source_index', index, false, true), true);
  }
}
