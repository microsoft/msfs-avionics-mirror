import { ComputedSubject, DisplayComponent, FSComponent, NumberFormatter, VNode } from '@microsoft/msfs-sdk';

import { NavigationSourceDataProvider, NAVSOURCE_TRACKING_STATE } from '@microsoft/msfs-epic2-shared';

import './SelectedNavSourceInfo.css';

/** The properties for the SelectedNavSourceInfo component. */
interface SelectedNavSourceInfoProps {
  /** The heading data provider to use. */
  navigationSourceDataProvider: NavigationSourceDataProvider;
}

/** The HSI SelectedNavSourceInfo component. */
export class SelectedNavSourceInfo extends DisplayComponent<SelectedNavSourceInfoProps> {

  protected static readonly COURSE_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '---' });
  protected static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, forceDecimalZeroes: true, nanString: '---' });

  private readonly sourceNameSubject = ComputedSubject.create<string | null, string>(
    null, cn => (cn === null) ? '---' : cn);

  private readonly courseSubject = this.props.navigationSourceDataProvider.courseNeedle.get().course.map((v) => SelectedNavSourceInfo.COURSE_FORMATTER(v ?? Number.NaN));

  private readonly identSubject = ComputedSubject.create<string | null, string>(
    null, i => (i === null) ? '---' : i);

  private readonly distanceSubject = this.props.navigationSourceDataProvider.courseNeedle.get().distance.map((v) => SelectedNavSourceInfo.DISTANCE_FORMATTER(v ?? Number.NaN));

  private readonly dmeHoldText = this.props.navigationSourceDataProvider.courseNeedle.get().isDmeHoldActive.map((v) => v ? 'H' : '');

  /** @inheritdoc */
  private isTrackingState(state: NAVSOURCE_TRACKING_STATE, desiredState: NAVSOURCE_TRACKING_STATE): boolean {
    return state === desiredState;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.navigationSourceDataProvider.courseNeedle.get().sourceLabel.sub((s) => {
      this.sourceNameSubject.set(s);
    }, true);

    this.props.navigationSourceDataProvider.courseNeedle.get().ident.sub((i) => {
      this.identSubject.set(i);
    }, true);
  }


  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="selected-nav-source-info-container">
        <div class="nav-source-c1">
          <div class={{
            'primary-nav-source': true,
            'invalid': this.props.navigationSourceDataProvider.courseNeedle.get().source.map(i => i === null),
            'is-magenta': this.props.navigationSourceDataProvider.navsourceTrackingState.map(i => this.isTrackingState(i, NAVSOURCE_TRACKING_STATE.Active)),
            'is-cyan': this.props.navigationSourceDataProvider.navsourceTrackingState.map(i => this.isTrackingState(i, NAVSOURCE_TRACKING_STATE.Armed)),
            'is-amber': this.props.navigationSourceDataProvider.areNavSourcesEqual
          }}>{this.sourceNameSubject}</div>
          <div class={{
            'course-select-and-desired-track-readout': true,
            'invalid': this.props.navigationSourceDataProvider.courseNeedle.get().course.map(i => i === null),
            'is-magenta': this.props.navigationSourceDataProvider.navsourceTrackingState.map(i => this.isTrackingState(i, NAVSOURCE_TRACKING_STATE.Active)),
            'is-cyan': this.props.navigationSourceDataProvider.navsourceTrackingState.map(i => this.isTrackingState(i, NAVSOURCE_TRACKING_STATE.Armed)),
          }}>{this.courseSubject}</div>
        </div>
        <div class="nav-source-c2">
          <div class={{
            'ident-readout': true,
            'invalid': this.props.navigationSourceDataProvider.courseNeedle.get().ident.map(i => i === null),
            'is-magenta': this.props.navigationSourceDataProvider.navsourceTrackingState.map(i => this.isTrackingState(i, NAVSOURCE_TRACKING_STATE.Active)),
            'is-cyan': this.props.navigationSourceDataProvider.navsourceTrackingState.map(i => this.isTrackingState(i, NAVSOURCE_TRACKING_STATE.Armed))
          }}>{this.identSubject}</div>
          <div class={{
            'distance-readout': true,
            'invalid': this.props.navigationSourceDataProvider.courseNeedle.get().distance.map(i => i === null),
            'is-magenta': this.props.navigationSourceDataProvider.navsourceTrackingState.map(i => this.isTrackingState(i, NAVSOURCE_TRACKING_STATE.Active)),
            'is-cyan': this.props.navigationSourceDataProvider.navsourceTrackingState.map(i => this.isTrackingState(i, NAVSOURCE_TRACKING_STATE.Armed))
          }}>{this.distanceSubject}</div>
        </div>
        <div class="nav-source-c3">
          <div class={{
            'unit-type-display': true,
            'is-magenta': this.props.navigationSourceDataProvider.navsourceTrackingState.map(i => this.isTrackingState(i, NAVSOURCE_TRACKING_STATE.Active)),
            'is-cyan': this.props.navigationSourceDataProvider.navsourceTrackingState.map(i => this.isTrackingState(i, NAVSOURCE_TRACKING_STATE.Armed))
          }}>NM<span class="dme-hold">{this.dmeHoldText}</span></div>
        </div>
      </div>
    );
  }
}
