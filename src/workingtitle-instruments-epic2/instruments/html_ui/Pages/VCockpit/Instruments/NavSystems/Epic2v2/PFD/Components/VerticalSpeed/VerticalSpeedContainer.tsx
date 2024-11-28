import { ComponentProps, DisplayComponent, EventBus, FSComponent, MathUtils, VNode } from '@microsoft/msfs-sdk';

import { AltitudeDataProvider, AutopilotDataProvider } from '@microsoft/msfs-epic2-shared';

import { SelectedVerticalSpeedBug } from './SelectedVerticalSpeedBug';
import { VerticalSpeedPointer } from './VerticalSpeedPointer';
import { VerticalSpeedUtils } from './VerticalSpeedUtils';

import './VerticalSpeedContainer.css';

/** The vertical speed indicator props. */
export interface VerticalSpeedContainerProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus,
  /** The altitude data provider to use. */
  altitudeDataProvider: AltitudeDataProvider;
  /** An autopilot data provider. */
  autopilotDataProvider: AutopilotDataProvider;
}

/** The vertical speed indicator container. */
export class VerticalSpeedContainer extends DisplayComponent<VerticalSpeedContainerProps> {
  private static readonly TICK_TEXT_Y_OFFSET = 3;

  /** Vertical speed in feet/minute, null when invalid. */
  private readonly verticalSpeed = this.props.altitudeDataProvider.verticalSpeed.map((vs) => vs !== null ? MathUtils.clamp(vs, -9900, 9900) : null);

  private readonly digitalAboveText = this.verticalSpeed.map((v) => v !== null && v > 300 ? MathUtils.round(v, v < 1000 ? 50 : 100).toString() : '');
  private readonly digitalBelowText = this.verticalSpeed.map((v) => v !== null && v < -300 ? MathUtils.round(Math.abs(v), v > -1000 ? 50 : 100).toString() : '');

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class="vertical-speed-container">
      {this.renderScale()}
      <svg
        class="vertical-speed-failed-overlay"
        viewBox="0 0 50 230"
        style={{
          width: '50px',
          height: '230px',
          display: this.verticalSpeed.map((v) => v === null ? 'block' : 'none'),
        }}
      >
        <path d="M 1 0 l 48 230 m -48 0 l 48 -230" />
      </svg>
      <VerticalSpeedPointer verticalSpeed={this.verticalSpeed} />
      <SelectedVerticalSpeedBug autopilotDataProvider={this.props.autopilotDataProvider} />
      <div class="vertical-speed-digital vertical-speed-digital-above">{this.digitalAboveText}</div>
      <div class="vertical-speed-digital vertical-speed-digital-below">{this.digitalBelowText}</div>
    </div>;
  }

  /**
   * Renders the vertical speed scale.
   * @returns the scale.
   */
  private renderScale(): VNode {
    return <svg class="vertical-speed-scale" viewBox="0 -115 55 230" style="width: 55px; height: 230px">
      <line x1={13} x2={41} y1={0} y2={0} />
      {[-4000, -2000, -1000, 1000, 2000, 4000].map((vs) => <>
        <line class="shadow" x1={12.5} x2={26.5} y1={VerticalSpeedUtils.calculateY(VerticalSpeedUtils.RADIUS + 0.5, vs)} y2={VerticalSpeedUtils.calculateY(VerticalSpeedUtils.RADIUS - 12.5, vs)} />
        <line x1={13} x2={26} y1={VerticalSpeedUtils.calculateY(VerticalSpeedUtils.RADIUS, vs)} y2={VerticalSpeedUtils.calculateY(VerticalSpeedUtils.RADIUS - 12, vs)} />
        <text x={11} y={VerticalSpeedContainer.TICK_TEXT_Y_OFFSET + VerticalSpeedUtils.calculateY(VerticalSpeedUtils.RADIUS + 1, vs)} dominant-baseline="middle" text-anchor="end">{Math.abs(Math.trunc(vs / 1000)).toString()}</text>
      </>)}
      {[-3000, -1500, -500, 500, 1500, 3000].map((vs) => <>
        <line class="shadow" x1={12.5} x2={26.5} y1={VerticalSpeedUtils.calculateY(VerticalSpeedUtils.RADIUS + 0.5, vs)} y2={VerticalSpeedUtils.calculateY(VerticalSpeedUtils.RADIUS - 12.5, vs)} />
        <line x1={13} x2={26} y1={VerticalSpeedUtils.calculateY(VerticalSpeedUtils.RADIUS, vs)} y2={VerticalSpeedUtils.calculateY(VerticalSpeedUtils.RADIUS - 12, vs)} />
      </>)}
    </svg>;
  }
}
