import { DisplayComponent, FSComponent, MappedSubject, VNode } from '@microsoft/msfs-sdk';

import { AirspeedDataProvider } from '@microsoft/msfs-epic2-shared';

import './MachDigitalReadout.css';

/** Props for the mach digital readout. */
export interface MachDigitalReadoutProps {
  /** The airspeed data provider to use. */
  airspeedDataProvider: AirspeedDataProvider;
}

/** A mach digital readout display. */
export class MachDigitalReadout extends DisplayComponent<MachDigitalReadoutProps> {
  private readonly isHidden = MappedSubject.create<[number | null, number | null], boolean>(
    ([mach, cas], wasHidden) => cas === null || (mach !== null && mach < (wasHidden ? 0.35 : 0.3)),
    this.props.airspeedDataProvider.mach,
    this.props.airspeedDataProvider.cas,
  );
  private readonly machInvalid = this.props.airspeedDataProvider.mach.map((v) => v === null);
  private readonly machText = this.props.airspeedDataProvider.mach.map((v) => v === null ? '---' : `.${Math.round(v * 1000).toFixed(0).padStart(3, '0')}`).pause();

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onAfterRender(node: VNode): void {
    this.isHidden.sub((isHidden) => {
      if (isHidden) {
        this.machText.pause();
      } else {
        this.machText.resume();
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div
        class={{
          'mach-digital-readout': true,
          'border-box': true,
          'hidden': this.isHidden,
          'red': this.props.airspeedDataProvider.isSpeedAboveMax,
          'amber': this.props.airspeedDataProvider.isTrendAboveMax,
        }}
      >
        <div
          class={{
            'value': true,
            'invalid': this.machInvalid,
          }}
        >
          {this.machText}
        </div>
        <div class="suffix">M</div>
      </div>
    );
  }
}
