import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { AutopilotDataProvider, CockpitUserSettings } from '@microsoft/msfs-epic2-shared';

import { AltitudeBugComponent } from './AltitudeTape';

import './BaroMinimumBug.css';

/** Props for the selected altitude bug. */
export interface BaroMinimumBugProps extends ComponentProps {
  /** An autopilot data provider. */
  autopilotDataProvider: AutopilotDataProvider;
  /** The event bus. */
  bus: EventBus;
  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/** Selected altitude bug. */
export class BaroMinimumBug extends DisplayComponent<BaroMinimumBugProps> implements AltitudeBugComponent<BaroMinimumBugProps> {
  private readonly cockpitUserSettings = CockpitUserSettings.getManager(this.props.bus);
  public readonly bugAltitude = this.cockpitUserSettings.getSetting('decisionAltitudeFeet').map(ba => ba < 20 ? null : ba);
  public readonly parksAtBottom = true;
  public readonly parksAtTop = true;

  /** @inheritdoc */
  public render(): VNode | null {
    return <svg xmlns="http://www.w3.org/2000/svg"
      class={{ 'baro-minimum-bug': true, 'hidden': this.props.declutter }}
      viewBox="-3 -30 56 76"
      style="width: 56px; height: 56px; position: absolute; top: -17px; left: 3px">
      <path d="M -3 -20 L -3 6 C 1 12 12 7 11 -5 L 28 -5 L 28 -9 L 11 -9 C 11 -20 2 -25 -3 -20 Z" stroke="#000" stroke-width="2" fill="rgba(255, 255, 255, 0.7)" />
    </svg>;
  }
}
