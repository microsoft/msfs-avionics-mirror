import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { AltitudeDataProvider, AutopilotDataProvider } from '@microsoft/msfs-epic2-shared';

import { AltitudeBugComponent } from './AltitudeTape';
import { VnavTargetAltitudeController, VnavTargetAltitudeDisplayStyle } from './VnavTargetAltitudeController';

import './VnavTargetAltitudeBug.css';

/** Props for the selected altitude bug. */
export interface VnavTargetAltitudeProps extends ComponentProps {
  /** An autopilot data provider. */
  autopilotDataProvider: AutopilotDataProvider;

  /** A provider of altitude data. */
  altitudeDataProvider: AltitudeDataProvider;
}

/** Selected altitude bug. */
export class VnavTargetAltitudeBug extends DisplayComponent<VnavTargetAltitudeProps> implements AltitudeBugComponent<VnavTargetAltitudeProps> {
  public readonly bugAltitude = this.props.autopilotDataProvider.vnavDisplayedTargetAltitude;
  public readonly parksAtBottom = true;
  public readonly parksAtTop = true;
  private readonly displayController = new VnavTargetAltitudeController(this.props.autopilotDataProvider, this.props.altitudeDataProvider);

  /** @inheritdoc */
  public render(): VNode | null {
    return <svg
      class={{
        'vnav-target-altitude-bug': true,
        'magenta': this.displayController.displayStyle.map(v => v === VnavTargetAltitudeDisplayStyle.MAGENTA),
        'amber': this.displayController.displayStyle.map(v => v === VnavTargetAltitudeDisplayStyle.AMBER),
        'cyan': this.displayController.displayStyle.map(v => v === VnavTargetAltitudeDisplayStyle.CYAN),
        'hidden': this.displayController.displayStyle.map(v => v === VnavTargetAltitudeDisplayStyle.HIDDEN),
        'white': this.displayController.displayStyle.map(v => v === VnavTargetAltitudeDisplayStyle.WHITE)
      }}
      viewBox="-2 -18 24 36">
      <path class="shadow" d="M0-9.8l8.5 7c2.9 2.8 2.9 2.8 0 5.6l-8.5 6.5q5.7-9.3 0-19.2" />
      <path d="M0-9.8l8.5 7c2.9 2.8 2.9 2.8 0 5.6l-8.5 6.5q5.7-9.3 0-19.2" />
    </svg >;
  }
}
