import { ComponentProps, DisplayComponent, FSComponent, MappedSubject, Subscribable, SubscribableMapFunctions, VNode } from '@microsoft/msfs-sdk';

import { AutothrottleDataProvider, AutothrottleMode, AutothrottleState } from '@microsoft/msfs-epic2-shared';

import './AutothrottleStatus.css';

/** Autothrottle status props. */
export interface AutothrottleStatusProps extends ComponentProps {
  /** An autothrottle data provider. */
  readonly autothrottleDataProvider: AutothrottleDataProvider,
  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/** A component to display the autothrottle status. */
export class AutothrottleStatus extends DisplayComponent<AutothrottleStatusProps> {
  private static readonly AMBER_MODES = [AutothrottleMode.EmergencyDescent, AutothrottleMode.SpeedProtection];

  private readonly isHidden = MappedSubject.create(
    SubscribableMapFunctions.or(),
    this.props.declutter,
    this.props.autothrottleDataProvider.state.map((v) => v === AutothrottleState.Inactive)
  );


  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div
        class={{
          'autothrottle-status': true,
          'shaded-box': true,
          'armed': this.props.autothrottleDataProvider.state.map((v) => v === AutothrottleState.Armed),
          'disconnect-warn': this.props.autothrottleDataProvider.state.map((v) => v === AutothrottleState.Warning),
          'hidden': this.isHidden,
        }}
      >
        <span>AT</span>
        <span
          class={{
            'autothrottle-mode': true,
            'amber': this.props.autothrottleDataProvider.mode.map((v) => AutothrottleStatus.AMBER_MODES.includes(v ?? AutothrottleMode.None)),
            'hidden': this.props.autothrottleDataProvider.mode.map((v) => v === AutothrottleMode.None),
            'lim-mode': this.props.autothrottleDataProvider.mode.map((v) => v === AutothrottleMode.SpeedLimit),
          }}
        >{this.props.autothrottleDataProvider.mode}</span>
      </div>
    );
  }
}
