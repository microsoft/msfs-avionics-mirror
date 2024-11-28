import { ComponentProps, DebounceTimer, DisplayComponent, FSComponent, MappedSubject, Subject, VNode } from '@microsoft/msfs-sdk';
import { SpeedBugComponent } from './SpeedTape';

import { AirspeedDataProvider, AirGroundDataProvider, StallWarningDataProvider } from '@microsoft/msfs-epic2-shared';
import './DynamicSpeedBug.css';

/** Props for the dynamic speed bug. */
export interface DynamicSpeedBugProps extends ComponentProps {
  /** An airspeed data provider. */
  airspeedDataProvider: AirspeedDataProvider;

  /** An air ground data provider. */
  airGroundDataProvider: AirGroundDataProvider;

  /** A stall warning data provider. */
  stallWarningDataProvider: StallWarningDataProvider;
}

/** Dynamic speed bug. */
export class DynamicSpeedBug extends DisplayComponent<DynamicSpeedBugProps> implements SpeedBugComponent<DynamicSpeedBugProps> {
  public readonly bugAirspeed = Subject.create<number | null>(null);

  private readonly isHidden = Subject.create(true);
  private readonly onGroundDebounce = new DebounceTimer();

  private readonly onGroundBelow45 = MappedSubject.create(
    ([cas, isOnGround]) => (cas ?? 0) < 45 && isOnGround,
    this.props.airspeedDataProvider.cas,
    this.props.airGroundDataProvider.isOnGround
  );

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.stallWarningDataProvider.dynamicSpeedCas.sub(v => v === null ? null : this.bugAirspeed.set(v));
    this.isHidden.sub(v => v ? this.bugAirspeed.set(null) : null);
    this.onGroundBelow45.sub(v => {
      if (v) {
        this.onGroundDebounce.schedule(() => this.isHidden.set(true), 5000);
      } else {
        this.onGroundDebounce.clear();
        this.isHidden.set(false);
      }
    });
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <svg
        class={{
          'dynamic-speed-bug': true,
          'hidden': this.isHidden
        }}
        viewBox="-2 -3 25 35"
        style={{
          'width': '25px',
          'height': '35px',
        }}
      >
        <path d="M 16 0 L 2 15 L 16 30 L 16 26 L 5.5 15 L 16 4 L 16 0" />
      </svg>
    );
  }
}
