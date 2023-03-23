import { ComponentProps, DisplayComponent, EventBus, FlightPlanner, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { PerformancePlan } from '../../../Shared/Performance/PerformancePlan';
import { AttitudeDirectorIndicator } from '../FlightGuidance/AttitudeDirectorIndicator';
import { AirspeedIndicator } from './AirspeedIndicator';
import { Altimeter } from './Altimeter';
import { AoaIndicator } from './AoaIndicator';
import { FlightModeAnnunciator } from './FlightModeAnnunciator';
import { LateralDeviationIndicator } from './LateralDeviationIndicator';
import { MarkerBeacon } from './MarkerBeacon';
import { RadioAltimeter } from './RadioAltimeter';
import { VerticalDeviationIndicator } from './VerticalDeviationIndicator';
import { VnavPreselectBox } from './VnavPreselectBox';
import { VSI } from './VSI';

import './UpperSectionContainer.css';

/**
 * The properties for the UpperSectionContainer component.
 */
interface UpperSectionContainerProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The flight planner */
  planner: FlightPlanner,

  /** The active performance plan */
  performancePlan: PerformancePlan
}

/**
 * The UpperSectionContainer component.
 */
export class UpperSectionContainer extends DisplayComponent<UpperSectionContainerProps> {

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div>
        <div class="adi-box">
          <AttitudeDirectorIndicator bus={this.props.bus} />
        </div>
        <div class="translucent-box fma-box">
          <FlightModeAnnunciator bus={this.props.bus} />
        </div>
        <AoaIndicator bus={this.props.bus} />
        <AirspeedIndicator bus={this.props.bus} />
        <div class="vnav-select-box">
          <VnavPreselectBox bus={this.props.bus} planner={this.props.planner} />
        </div>
        <Altimeter bus={this.props.bus} performancePlan={this.props.performancePlan} />
        <VSI bus={this.props.bus} />
        <LateralDeviationIndicator bus={this.props.bus} />
        <VerticalDeviationIndicator bus={this.props.bus} />
        <div class="radio-altimeter-box">
          <RadioAltimeter bus={this.props.bus} />
        </div>
        <div class="marker-beacon-box">
          <MarkerBeacon bus={this.props.bus} />
        </div>
      </div>
    );
  }
}