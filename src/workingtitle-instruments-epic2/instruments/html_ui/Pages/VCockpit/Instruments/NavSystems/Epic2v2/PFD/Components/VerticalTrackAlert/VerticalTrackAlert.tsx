import { DebounceTimer, DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { AutopilotDataProvider, VerticalDeviationDataProvider } from '@microsoft/msfs-epic2-shared';

import './VerticalTrackAlert.css';

/** The VNAV target altitude readout props. */
interface VerticalTrackAlertProps {
  /** The altitude data provider to use. */
  verticalDeviationDataProvider: VerticalDeviationDataProvider;
  /** The autopilot data provider. */
  autopilotDataProvider: AutopilotDataProvider;
}

/** The Vertical Track Alert component. */
export class VerticalTrackAlert extends DisplayComponent<VerticalTrackAlertProps> {
  private readonly isVTANotAlerting = Subject.create(true);
  private readonly isVTAFlashing = Subject.create(false);

  private vtaFlash = new DebounceTimer();

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.verticalDeviationDataProvider.verticalTrackAlerting.sub((v) => {
      this.isVTANotAlerting.set(!v);
      this.isVTAFlashing.set(v);

      this.vtaFlash.clear();
      if (v) {
        this.vtaFlash.schedule(() => this.isVTAFlashing.set(false), 5000);
      }
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return <div class={{
      'vertical-track-alert': true,
      'shaded-box': true,
      'vta-flashing': this.isVTAFlashing,
      'hidden': this.isVTANotAlerting
    }}>VTA</div>;
  }
}
