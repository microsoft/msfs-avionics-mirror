import { ComponentProps, DisplayComponent, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { VSpeedDataProvider, VSpeedType } from '@microsoft/msfs-epic2-shared';

import './TakeoffVSpeedDisplay.css';

/** Props for the takeoff vspeed display. */
export interface TakeoffVSpeedDisplayProps extends ComponentProps {
  /** A vspeed data provider. */
  vSpeedDataProvider: VSpeedDataProvider;
}

/** Takeoff vspeed display. */
export class TakeoffVSpeedDisplay extends DisplayComponent<TakeoffVSpeedDisplayProps> {
  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div
        class={{
          'takeoff-vspeed-display': true,
          'hidden': this.props.vSpeedDataProvider.takeoffSpeedsParked.map(v => !v),
        }}
      >
        {this.props.vSpeedDataProvider.vSpeedDefinitions.filter((def) => def.type === VSpeedType.Takeoff).map((def) => {
          return <TakeoffVspeedRow speed={def.speed} label={def.label} />;
        })}
      </div>
    );
  }
}

/** Props for the takeoff vspeed row. */
interface TakeoffVSpeedRowProps extends ComponentProps {
  /** The speed top be displayed in knots, or null if none (speed will be hidden). */
  speed: Subscribable<number | null>,

  /** The label to be displayed. */
  label: string,
}

/** A single takeoff vspeed row. */
class TakeoffVspeedRow extends DisplayComponent<TakeoffVSpeedRowProps> {
  /** @inheritdoc */
  public render(): VNode | null {
    return <div
      class={{
        'row': true,
        'hidden': this.props.speed.map(v => v === null),
      }}
    >
      {this.props.speed}
      <svg
        class={{
          'vspeed-symbol': true
        }}
        viewBox="0 0 30 20"
        style={{
          'width': '30px',
          'height': '20px',
        }}
      >
        <path d="M 10 3 L 10 17 M 10 10 L 4 10" />
        <text
          x='14'
          y='17.5'
        >
          {this.props.label}
        </text>
      </svg>
    </div>;
  }
}
