import { EventBus, FSComponent, PerformancePlanRepository, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import {
  AirspeedCasInputFormat, AirspeedMachInputFormat, AltitudeInputFormat, Epic2PerformancePlan, FuelFlowInputFormat, InputField, MfdAliasedUserSettingTypes,
  RadioButton, TabContent, TabContentProps
} from '@microsoft/msfs-epic2-shared';

import { PreFlightData } from './GroundTab';

import './AltSpdTab.css';

/** The properties for the {@link AltSpdTab} component. */
interface AltSpdTabProps extends TabContentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
  /** The performance plan repository. */
  readonly perfPlanRepository: PerformancePlanRepository<Epic2PerformancePlan>;
  /** The settings manager. */
  readonly settings: UserSettingManager<MfdAliasedUserSettingTypes>;
  /** The preflight data. */
  readonly preFlightData: PreFlightData;
}

export enum PerfModeOptions {
  PilotPerfMode = 'Pilot SPD/FF',
  CurrentPerfMode = 'Current GS/FF',
}

/** The AltSpdTab component. */
export class AltSpdTab extends TabContent<AltSpdTabProps> {

  /** ref for hiding/showing Crz FF field */
  private crzFFRef = FSComponent.createRef<HTMLDivElement>();

  // FIXME: max cruise altitude might want to pull plane-specific value from AvionicsConfig/panel.xml
  private readonly altitudeFormat = new AltitudeInputFormat(this.props.perfPlanRepository.getActivePlan().transitionAltitude, '□□□□□', 1000, 45000);
  private readonly fuelFlowFormat = new FuelFlowInputFormat();
  private readonly casInputFormat = new AirspeedCasInputFormat();
  private readonly machInputFormat = new AirspeedMachInputFormat();

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    // Perf Mode selection
    this.props.preFlightData.perfMode.sub((selection) => {
      if (selection === PerfModeOptions.PilotPerfMode) {
        this.crzFFRef.instance.classList.remove('fpln-alt-spd-tab-hide-crzFF');
      } else {
        this.crzFFRef.instance.classList.add('fpln-alt-spd-tab-hide-crzFF');
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="fpln-alt-spd-tab">
        <div class="fpln-alt-spd-tab-padding">
          <p class="fpln-alt-spd-title">Crz Spd</p>
          <div class="fpln-alt-spd-grid-speeds">
            <InputField
              bus={this.props.bus}
              suffix="M"
              formatter={this.machInputFormat}
              bind={this.props.preFlightData.crzSpdMach}
              maxLength={4}
              textAlign={'right'}
              dragConfig={{
                increment: 1,
                min: 0.01,
                max: 0.99,
                bus: this.props.bus,
              }}
              tscConnected
              tscDisplayLabel={'Cruise Speed (M)'}
            />
            <InputField
              bus={this.props.bus}
              suffix="Kt"
              bind={this.props.preFlightData.crzSpdKts}
              formatter={this.casInputFormat}
              maxLength={3}
              textAlign={'right'}
              dragConfig={{
                increment: 1,
                min: 0,
                max: 900,
                bus: this.props.bus,
              }}
              tscConnected
              tscDisplayLabel={'Cruise Speed (Kt)'}
            />
          </div>
          <div class="fpln-init-crz-alt">
            <div ref={this.crzFFRef}>
              <InputField
                bus={this.props.bus}
                suffix="Lbs/Hr"
                topLabel="Crz FF"
                bind={this.props.preFlightData.crzFF}
                formatter={this.fuelFlowFormat}
                maxLength={5}
                textAlign={'right'}
                dragConfig={{
                  increment: 1,
                  min: 0,
                  max: 30000,
                  bus: this.props.bus,
                }}
                isEnabled={this.props.preFlightData.perfMode.map((selection) => selection === PerfModeOptions.PilotPerfMode)}
                tscConnected
              />
            </div>
            <InputField
              bus={this.props.bus}
              suffix="Ft"
              topLabel="Init Crz Alt"
              bind={this.props.preFlightData.initCrzAlt}
              formatter={this.altitudeFormat}
              maxLength={5}
              textAlign={'right'}
              dragConfig={{
                increment: 1,
                min: 0,
                max: 45000,
                bus: this.props.bus,
              }}
              tscConnected
            />
          </div>
        </div>
        <div class="fpln-perf-mode">
          <div class="fpln-alt-spd-tab-padding">
            <p class="fpln-perf-mode-title">Perf Mode:</p>
            <div class="fpln-alt-spd-tab-radios">
              <RadioButton
                label={PerfModeOptions.PilotPerfMode}
                value={PerfModeOptions.PilotPerfMode}
                selectedValue={this.props.preFlightData.perfMode}
              />
              <RadioButton
                label={PerfModeOptions.CurrentPerfMode}
                value={PerfModeOptions.CurrentPerfMode}
                selectedValue={this.props.preFlightData.perfMode}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
