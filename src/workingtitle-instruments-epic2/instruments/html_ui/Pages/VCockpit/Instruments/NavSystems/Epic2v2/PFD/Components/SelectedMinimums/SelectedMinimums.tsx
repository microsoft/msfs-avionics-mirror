import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, MappedSubject, MinimumsMode, Subscribable, SubscribableMapFunctions, VNode
} from '@microsoft/msfs-sdk';

import { CockpitUserSettings } from '@microsoft/msfs-epic2-shared';

import './SelectedMinimums.css';

/** The selected minimums props. */
export interface SelectedMinimumsProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/** The selected minimums component. */
export class SelectedMinimums extends DisplayComponent<SelectedMinimumsProps> {

  private readonly cockpitUserSettings = CockpitUserSettings.getManager(this.props.bus);

  private readonly modeSetting = this.cockpitUserSettings.getSetting('minimumsMode');
  private readonly baroMinimumsSetting = this.cockpitUserSettings.getSetting('decisionAltitudeFeet');
  private readonly radioMinimumsSetting = this.cockpitUserSettings.getSetting('decisionHeightFeet');

  private readonly minimumsLabel = this.modeSetting.map(mode => {
    switch (mode) {
      case MinimumsMode.BARO:
        return 'BARO';
      case MinimumsMode.RA:
        return 'RA';
    }
  });

  private readonly minimumsValue = MappedSubject.create(
    ([mode, baroMins, radioMins]) => {
      switch (mode) {
        case MinimumsMode.BARO:
          return baroMins.toFixed(0);
        case MinimumsMode.RA:
          return radioMins.toFixed(0);
      }
    },
    this.modeSetting,
    this.baroMinimumsSetting,
    this.radioMinimumsSetting
  );

  private readonly isHidden = MappedSubject.create(SubscribableMapFunctions.or(), this.props.declutter, this.minimumsValue.map((value) => +value < 20));


  /** @inheritdoc */
  public render(): VNode | null {
    return <div class={{ 'selected-minimums': true, 'border-box': true, 'hidden': this.isHidden }}>
      <div class="minimums-label">{this.minimumsLabel}</div>
      <div
        class={this.modeSetting.map((value) => value === MinimumsMode.BARO ? 'minimums-value-baro' : 'minimums-value-ra')}
        style={{ color: this.minimumsValue.map((value) => value === null || value === undefined ? '#ffbf00' : 'white') }}
      >{this.minimumsValue === null || this.minimumsValue === undefined ? '---' : this.minimumsValue}</div>
    </div>;
  }

}
