import { ComponentProps, DisplayComponent, FSComponent, MappedSubject, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { AutopilotDataProvider, Epic2ApVerticalMode, Epic2FlightArea, RnavMinima } from '@microsoft/msfs-epic2-shared';

import './ApproachStatus.css';

/** The flight mode annunciator props. */
export interface ApproachStatusProps extends ComponentProps {
  /** An autopilot data provider. */
  autopilotDataProvider: AutopilotDataProvider,
  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/** The SBAS approach status component. */
export class ApproachStatus extends DisplayComponent<ApproachStatusProps> {
  // FIXME plumb all of these
  private readonly approachType = this.props.autopilotDataProvider.rnavMinimaText;
  private readonly isArmed = this.props.autopilotDataProvider.flightArea.map((flightArea) => flightArea === Epic2FlightArea.Approach || flightArea === Epic2FlightArea.Arrival);
  private readonly isActive = MappedSubject.create(
    ([active, armed]) => active === Epic2ApVerticalMode.VnavGlidePath || armed === Epic2ApVerticalMode.VnavGlidePath,
    this.props.autopilotDataProvider.verticalActive, this.props.autopilotDataProvider.verticalArmedText
  );
  private readonly isUnavailable = Subject.create(false);

  private readonly text = MappedSubject.create(
    ([approachType, unavailable]) => `${approachType ? approachType : ''}${unavailable ? ' UNVL' : ''}`,
    this.approachType,
    this.isUnavailable,
  );
  private readonly isHidden = MappedSubject.create(
    ([active, armed, apprType, declutter]) => (!active && !armed) || (apprType !== RnavMinima.LPV && apprType !== RnavMinima.LP) || declutter,
    this.isActive, this.isArmed, this.approachType, this.props.declutter
  );

  /** @inheritdoc */
  public render(): VNode | null {
    return <div
      class={{
        'approach-status': true,
        'shaded-box': true,
        'active': this.isActive,
        'armed': this.isArmed,
        'unavailable': this.isUnavailable,
        'hidden': this.isHidden,
      }}
    >
      {this.text}
    </div>;
  }
}
