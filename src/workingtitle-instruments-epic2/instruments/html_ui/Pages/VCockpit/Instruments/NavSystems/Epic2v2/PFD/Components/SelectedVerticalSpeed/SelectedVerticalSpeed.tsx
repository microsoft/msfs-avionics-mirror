import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { AutopilotDataProvider, Epic2ApVerticalMode } from '@microsoft/msfs-epic2-shared';

import './SelectedVerticalSpeed.css';

/** The selected altitude props. */
export interface SelectedVerticalSpeedProps extends ComponentProps {
  /** A provider of auto pilot data. */
  autopilotDataProvider: AutopilotDataProvider;
}

/** The selected altitude component. */
export class SelectedVerticalSpeed extends DisplayComponent<SelectedVerticalSpeedProps> {
  private readonly selectedVsText = this.props.autopilotDataProvider.selectedVerticalSpeed.map((v) =>
    v !== null ? `${Math.abs(v).toFixed(0)}` : '----'
  ).pause();

  private readonly isVsHidden = this.props.autopilotDataProvider.verticalActive.map((v) => v !== Epic2ApVerticalMode.VerticalSpeed);

  private readonly isArrowHidden = this.props.autopilotDataProvider.selectedVerticalSpeed.map((v) => v === null || Math.abs(v) < 50);

  private readonly arrowTransform = this.props.autopilotDataProvider.selectedVerticalSpeed.map((v) => v !== null && v < 0 ? 'scaleY(-1)' : 'scaleY(1)');

  private readonly pausable = [
    this.selectedVsText,
    this.isArrowHidden,
    this.arrowTransform,
  ];

  /** @inheritdoc */
  public onAfterRender(): void {
    this.isVsHidden.sub((v) => this.pausable.forEach((sub) => v ? sub.pause() : sub.resume()));
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div
        class={{
          'selected-vertical-speed-container': true,
          'hidden': this.isVsHidden,
        }}
      >
        <svg
          class={{
            'arrow': true,
            'hidden': this.isArrowHidden
          }}
          style={{
            'transform': this.arrowTransform,
            'width': '18px',
            'height': '58px'
          }}
          viewBox="-9 -2 18 58"
        >
          <path d="M0,0 l-7,14 l14,0 z" />
        </svg>
        <div class="value shaded-box">{this.selectedVsText}</div>
      </div>
    );
  }
}
