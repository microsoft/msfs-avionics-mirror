import { ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FlightPlanner, FSComponent, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { AdcSystemSelectorEvents, AhrsSystemSelectorEvents, MapSettingsPfdAliased, PerformancePlan } from '@microsoft/msfs-wt21-shared';

import { PfdInstrumentConfig } from '../../Config/PfdInstrumentConfig';
import { AttitudeDirectorIndicator } from '../FlightGuidance/AttitudeDirectorIndicator';
import { AirspeedIndicator } from './AirspeedIndicator';
import { Altimeter } from './Altimeter';
import { AoaIndicator } from './AoaIndicator';
import { FlightModeAnnunciator } from './FlightModeAnnunciator';
import { LateralDeviationIndicator } from './LateralDeviationIndicator';
import { MarkerBeacon } from './MarkerBeacon';
import { RadioAltimeter } from './RadioAltimeter';
import { ReversionFlag } from './ReversionFlag';
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

  /** PFD config object */
  pfdConfig: PfdInstrumentConfig;

  /** The map user settings */
  mapSettingsManager: UserSettingManager<MapSettingsPfdAliased>
}

/**
 * The UpperSectionContainer component.
 */
export class UpperSectionContainer extends DisplayComponent<UpperSectionContainerProps> {
  private readonly ahrsSourceIndex = ConsumerSubject.create(this.props.bus.getSubscriber<AhrsSystemSelectorEvents>().on('ahrs_selected_source_index'), 1);
  private readonly adcSourceIndex = ConsumerSubject.create(this.props.bus.getSubscriber<AdcSystemSelectorEvents>().on('adc_selected_source_index'), 1);
  private readonly isAhrsNotReverted = this.ahrsSourceIndex.map((sourceIndex) => sourceIndex === this.props.pfdConfig.instrumentIndex);
  private readonly isAdcNotReverted = this.adcSourceIndex.map((sourceIndex) => sourceIndex === this.props.pfdConfig.instrumentIndex);

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={`adi-style-${this.props.pfdConfig.artificialHorizonStyle.toLowerCase()}`}>
        <div class="adi-box">
          <AttitudeDirectorIndicator bus={this.props.bus} />
          {this.props.pfdConfig.artificialHorizonStyle === 'Cropped' && <svg class="adi-mask">
            <polygon points="0,0 772,0 772,461 586,461 586,60 186,60 186,461 0,461" />
          </svg>}
        </div>
        <div class="translucent-box fma-box">
          <FlightModeAnnunciator bus={this.props.bus} />
        </div>
        <AoaIndicator bus={this.props.bus} />
        <AirspeedIndicator
          bus={this.props.bus}
          pfdConfig={this.props.pfdConfig}
        />
        <div class="ahrs-reversion-box">
          <ReversionFlag label={this.ahrsSourceIndex.map((v) => `AHS${v}`)} hidden={this.isAhrsNotReverted} />
        </div>
        <div class="adc-reversion-box">
          <ReversionFlag label={this.adcSourceIndex.map((v) => `ADC${v}`)} hidden={this.isAdcNotReverted} />
        </div>
        <div class="vnav-select-box">
          <VnavPreselectBox bus={this.props.bus} planner={this.props.planner} />
        </div>
        <Altimeter
          bus={this.props.bus}
          performancePlan={this.props.performancePlan}
          pfdConfig={this.props.pfdConfig}
        />
        <VSI bus={this.props.bus} />
        <LateralDeviationIndicator bus={this.props.bus} mapSettingsManager={this.props.mapSettingsManager} />
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
