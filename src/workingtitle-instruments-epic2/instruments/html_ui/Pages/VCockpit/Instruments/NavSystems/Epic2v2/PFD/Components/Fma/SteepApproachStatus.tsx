import { ComponentProps, DisplayComponent, FSComponent, MappedSubject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { AutopilotDataProvider, Epic2ApVerticalMode, TawsDataProvider } from '@microsoft/msfs-epic2-shared';

import './ApproachStatus.css';

/** The flight mode annunciator props. */
export interface ApproachStatusProps extends ComponentProps {
  /** An autopilot data provider. */
  autopilotDataProvider: AutopilotDataProvider,
  /** A TAWS data provider */
  tawsDataProvider: TawsDataProvider,
  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/** The steep approach status component. */
export class SteepApproachStatus extends DisplayComponent<ApproachStatusProps> {
  // FIXME plumb all of these

  private readonly isArmed = MappedSubject.create(([primary, secondary]) => primary === Epic2ApVerticalMode.GlideSlope || secondary === Epic2ApVerticalMode.GlideSlope,
    this.props.autopilotDataProvider.verticalArmedPrimary, this.props.autopilotDataProvider.verticalArmedSecondary);
  private readonly isActive = this.props.autopilotDataProvider.verticalActive.map((mode) => mode === Epic2ApVerticalMode.GlideSlope);

  private readonly isHidden = MappedSubject.create(
    ([active, armed, steepApprActive, declutter]) => !((active || armed) && steepApprActive) || declutter,
    this.isActive, this.isArmed, this.props.tawsDataProvider.steepApproachActive, this.props.declutter
  );

  /** @inheritdoc */
  public render(): VNode | null {
    return <div
      class={{
        'approach-status': true,
        'shaded-box': true,
        'active': this.isActive,
        'armed': this.isArmed,
        'hidden': this.isHidden,
      }}
    >
      STEEP
    </div>;
  }
}
