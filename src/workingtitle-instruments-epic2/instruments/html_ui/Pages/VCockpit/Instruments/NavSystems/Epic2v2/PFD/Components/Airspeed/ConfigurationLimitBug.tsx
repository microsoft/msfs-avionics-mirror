import { ComponentProps, DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { AirspeedDataProvider } from '@microsoft/msfs-epic2-shared';

import { SpeedBugComponent } from './SpeedTape';

import './ConfigurationLimitBug.css';

/** Props for the flap 15 bug. */
export interface ConfigurationLimitBugProps extends ComponentProps {
  /** An airspeed data provider. */
  airspeedDataProvider: AirspeedDataProvider;
  /** Bug labels */
  labels: string[]
  /** Bug airspeed */
  airspeed: number
}

/** Flap 15 bug. */
export class ConfigurationLimitBug extends DisplayComponent<ConfigurationLimitBugProps> implements SpeedBugComponent<ConfigurationLimitBugProps> {
  private static readonly TEXT_SIZE = 25;

  public readonly bugAirspeed = Subject.create(this.props.airspeed);

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div>
        <svg
          class={{ 'config-limit-bug': true }}
          viewBox="50 104 40 25"
          style={{ 'width': '40px', 'height': `${ConfigurationLimitBug.TEXT_SIZE * this.props.labels.length}px`, 'bottom': `${-(ConfigurationLimitBug.TEXT_SIZE * this.props.labels.length) / 2}px` }}
        >
          <path d={this.props.labels.length > 1 ? 'M 60 95 L 60 111 L 54 117 L 60 123 L 60 138' : 'M 60 111 L 54 117 L 60 123'} />
        </svg>

        <div class='config-limit-text-container' style={{ 'height': `${ConfigurationLimitBug.TEXT_SIZE * this.props.labels.length}px`, 'bottom': `${-(ConfigurationLimitBug.TEXT_SIZE * this.props.labels.length) / 2}px` }}>
          {this.props.labels.map((label) => <p>{label}</p>)}
        </div>
      </div >
    );
  }
}
