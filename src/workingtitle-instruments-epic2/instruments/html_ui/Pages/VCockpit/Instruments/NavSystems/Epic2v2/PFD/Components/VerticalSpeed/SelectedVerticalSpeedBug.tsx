import { ComponentProps, DisplayComponent, FSComponent, MappedSubject, VNode } from '@microsoft/msfs-sdk';

import { AutopilotDataProvider, Epic2ApVerticalMode } from '@microsoft/msfs-epic2-shared';

import { VerticalSpeedUtils } from './VerticalSpeedUtils';

import './SelectedVerticalSpeedBug.css';

/** Props for the selected vertical speed bug. */
export interface SelectedVerticalSpeedBugProps extends ComponentProps {
  /** An autopilot data provider. */
  autopilotDataProvider: AutopilotDataProvider;
}

/** Selected speed bug. */
export class SelectedVerticalSpeedBug extends DisplayComponent<SelectedVerticalSpeedBugProps> {
  private readonly transform = this.props.autopilotDataProvider.selectedVerticalSpeed.map(
    (v) => `translate3d(0,${v !== null ? VerticalSpeedUtils.calculateY(VerticalSpeedUtils.RADIUS, -v, 4500) : 0}px,0)`
  );
  private readonly isHidden = MappedSubject.create(
    ([verticalActive, selectedVs]) => verticalActive !== Epic2ApVerticalMode.VerticalSpeed || selectedVs === null,
    this.props.autopilotDataProvider.verticalActive,
    this.props.autopilotDataProvider.selectedVerticalSpeed,
  );

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class="selected-vertical-speed-bug-container">
      <div
        class={{
          'selected-vertical-speed-bug': true,
          'hidden': this.isHidden,
        }}
      >
        <svg
          viewBox="2 -10 14 20"
          style={{
            'width': '14px',
            'height': '20px',
            'transform': this.transform,
          }}
        >
          <path class="shadow" d="M 10 0 l 4 -4 l 0 -4 l -11 0 l 0 16 l 11 0 l 0 -4 z" />
          <path d="M 10 0 l 4 -4 l 0 -4 l -11 0 l 0 16 l 11 0 l 0 -4 z" />
        </svg>
      </div>
    </div>;
  }
}
