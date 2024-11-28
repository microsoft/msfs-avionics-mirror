import { DisplayComponent, FSComponent, MappedSubject, Subscribable, SubscribableMapFunctions, VNode } from '@microsoft/msfs-sdk';

import { AltitudeDataProvider, AutopilotDataProvider } from '@microsoft/msfs-epic2-shared';

import { VnavTargetAltitudeController, VnavTargetAltitudeDisplayStyle } from './VnavTargetAltitudeController';

import './VnavTargetAltitudeReadout.css';

/** The VNAV target altitude readout props. */
interface VnavTargetAltitudeProps {
  /** The altitude data provider to use. */
  altitudeDataProvider: AltitudeDataProvider;
  /** An autopilot data provider. */
  autopilotDataProvider: AutopilotDataProvider;
  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/** The VNAV Target Altitude Readout component. */
export class VnavTargetAltitudeReadout extends DisplayComponent<VnavTargetAltitudeProps> {
  private readonly vnavTargetAltitudeTens = this.props.autopilotDataProvider.vnavDisplayedTargetAltitude.map(feetAlt => {
    return feetAlt !== null ? `${feetAlt % 100}`.padEnd(2, '0') : '';
  });

  private readonly vnavTargetAltitudeHundreds = this.props.autopilotDataProvider.vnavDisplayedTargetAltitude.map(feetAlt =>
    feetAlt !== null ? `${Math.floor(feetAlt / 100)}` : ''
  );

  private readonly displayController = new VnavTargetAltitudeController(this.props.autopilotDataProvider, this.props.altitudeDataProvider);

  private readonly isHidden = MappedSubject.create(
    SubscribableMapFunctions.or(),
    this.props.declutter,
    this.displayController.displayStyle.map(v => v === VnavTargetAltitudeDisplayStyle.HIDDEN)
  );

  /** @inheritdoc */
  public render(): VNode {
    return <div
      class={{
        'vnav-altitude-readout': true,
        'border-box': true,
        'shaded-box': true,
        'magenta': this.displayController.displayStyle.map(v => v === VnavTargetAltitudeDisplayStyle.MAGENTA),
        'amber': this.displayController.displayStyle.map(v => v === VnavTargetAltitudeDisplayStyle.AMBER),
        'cyan': this.displayController.displayStyle.map(v => v === VnavTargetAltitudeDisplayStyle.CYAN),
        'hidden': this.isHidden,
        'white': this.displayController.displayStyle.map(v => v === VnavTargetAltitudeDisplayStyle.WHITE)
      }}
    >
      <span class='vnav-readout-hundreds'>{this.vnavTargetAltitudeHundreds}</span>
      <span class='vnav-readout-tens'>{this.vnavTargetAltitudeTens}</span>
    </div>;
  }
}
