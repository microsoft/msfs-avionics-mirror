import {
  ConsumerSubject, EngineEvents, EventBus, FlightPlannerEvents, FSComponent, MappedSubject, PerformancePlanRepository, SetSubject, Subject, UserSettingManager,
  VNode
} from '@microsoft/msfs-sdk';

import {
  Epic2PerformancePlan, FlightPlanStore, FuelTotalizerControlEvents, InputField, MfdAliasedUserSettingTypes, NumberInputFormat, TabContent, TabContentProps,
  TouchButton, WeightInputFormat
} from '@microsoft/msfs-epic2-shared';

import { PerfModeOptions } from './AltSpdTab';
import { PreFlightData } from './GroundTab';

import './FuelWeightTab.css';

/** The properties for the {@link FuelWeightTab} component. */
interface FuelWeightTabProps extends TabContentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
  /** The performance plan repository. */
  readonly perfPlanRepository: PerformancePlanRepository<Epic2PerformancePlan>;
  /** The settings manager. */
  readonly settings: UserSettingManager<MfdAliasedUserSettingTypes>;
  /** The active flight plan store.  */
  readonly activeFlightPlanStore: FlightPlanStore;
  /** The preflight data. */
  readonly preFlightData: PreFlightData;
}

/** The FuelWeightTab component. */
export class FuelWeightTab extends TabContent<FuelWeightTabProps> {

  // Source Data
  private readonly sub = this.props.bus.getSubscriber<FlightPlannerEvents & EngineEvents>();
  private fuelWeight = ConsumerSubject.create(this.sub.on('fuel_total_weight'), 0);

  private readonly grossWeightDisplay = Subject.create(''); // lbs
  private readonly destination = Subject.create('----');
  private readonly alternate = Subject.create('----');
  private readonly destinationETE = Subject.create('----');
  private computingDataRef = FSComponent.createRef<HTMLParagraphElement>();
  private computingData = Subject.create(false);  // true once Compute button has been pressed
  private computeButtonClass = SetSubject.create<string>(['fpln-fuel-weight-compute-button']);

  // Determines whether all required data from the 3 preflight tabs has been entered
  private readonly allFieldsEntered = MappedSubject.create(
    ([crzSpdMach, crzSpdKts, crzFF, initCrzAlt, perfMode, bow, fuel, paxWeight, pax, cargo]): boolean => {
      if (crzSpdMach === null) { return false; }
      if (crzSpdKts === null) { return false; }
      if (perfMode === PerfModeOptions.PilotPerfMode && crzFF === null) { return false; }
      if (initCrzAlt === null) { return false; }
      if (bow === null) { return false; }
      if (fuel === null) { return false; }
      if (paxWeight === null) { return false; }
      if (pax === null) { return false; }
      if (cargo === null) { return false; }

      const perfPlan = this.props.perfPlanRepository.getActivePlan();
      const fmsFuel = Math.abs((perfPlan.manualGw.get() ?? 0) - (perfPlan.manualZfw.get() ?? 0));
      if (
        (crzSpdMach !== perfPlan.cruiseTargetSpeedMach.get()) ||
        (crzSpdKts !== perfPlan.cruiseTargetSpeedIas.get()) ||
        (perfMode === PerfModeOptions.PilotPerfMode && crzFF !== perfPlan.pilotCruiseFuelflow.get()) ||
        (initCrzAlt !== perfPlan.cruiseAltitude.get()) ||
        (bow !== perfPlan.basicOperatingWeight.get()) ||
        (Math.abs(fuel - fmsFuel) > 5) ||
        (paxWeight !== perfPlan.averagePassengerWeight.get()) ||
        (pax !== perfPlan.paxNumber.get()) ||
        (cargo !== perfPlan.cargoWeight.get())
      ) {
        return true;
      } else {
        return false;
      }
    },
    this.props.preFlightData.crzSpdMach,
    this.props.preFlightData.crzSpdKts,
    this.props.preFlightData.crzFF,
    this.props.preFlightData.initCrzAlt,
    this.props.preFlightData.perfMode,
    this.props.preFlightData.bow,
    this.props.preFlightData.fuel,
    this.props.preFlightData.paxWeight,
    this.props.preFlightData.paxNum,
    this.props.preFlightData.cargo,
    this.computingData // Only used to ensure that after data is computed it will check whether the data has been updated
  );

  private readonly grossWeightValue = MappedSubject.create(
    ([bow, fuel, paxNum, paxWeight, cargo]): number => {
      if (bow !== null && fuel !== null && paxWeight !== null && paxNum !== null && cargo !== null) {
        return bow + fuel + ((paxNum ?? 0) * paxWeight) + (cargo ?? 0);
      } else {
        return NaN;
      }
    },
    this.props.preFlightData.bow,
    this.props.preFlightData.fuel,
    this.props.preFlightData.paxNum,
    this.props.preFlightData.paxWeight,
    this.props.preFlightData.cargo,
  );

  private readonly computeButtonEnabled = MappedSubject.create(
    ([allFieldsEntered, computingData]): boolean => {
      if (allFieldsEntered && !computingData) {
        return true;
      } else {
        return false;
      }
    },
    this.allFieldsEntered,
    this.computingData,
  );

  /**
   * handles the Compute button press
   */
  private computeButtonPress(): void {
    // Show "Computing Data..."
    this.computingDataRef.instance.classList.remove('hidden');
    this.computingData.set(true);
    setTimeout(() => {
      // Hide "Computing Data..."
      this.computingDataRef.instance.classList.add('hidden');
      // Modify performance plan
      const perfPlan = this.props.perfPlanRepository.getActivePlan();
      perfPlan.cruiseTargetSpeedMach.set(this.props.preFlightData.crzSpdMach.get());
      perfPlan.cruiseTargetSpeedIas.set(this.props.preFlightData.crzSpdKts.get());
      perfPlan.cruiseAltitude.set(this.props.preFlightData.initCrzAlt.get());
      perfPlan.basicOperatingWeight.set(this.props.preFlightData.bow.get() ?? 0);
      perfPlan.paxNumber.set(this.props.preFlightData.paxNum.get() ?? 0);
      perfPlan.averagePassengerWeight.set(this.props.preFlightData.paxWeight.get() ?? 0);
      perfPlan.cargoWeight.set(this.props.preFlightData.cargo.get() ?? 0);
      perfPlan.manualGw.set(this.grossWeightValue.get());
      perfPlan.manualZfw.set(this.grossWeightValue.get() - (this.props.preFlightData.fuel.get() ?? 0));
      perfPlan.pilotCruiseFuelflow.set(this.props.preFlightData.crzFF.get());
      this.computingData.set(false);
    }, 1000);
  }

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.grossWeightValue.sub((v) => this.grossWeightDisplay.set(!isNaN(v) ? v.toFixed(0) : ''), true);
    this.props.activeFlightPlanStore.destinationIdent.sub((destination) => this.destination.set(destination ?? '----'), true);

    // Set "ETE" field
    this.props.activeFlightPlanStore.destinationEstimatedTimeEnroute.sub((ete) => {
      const seconds = ete.number;
      let eteString;
      if (isNaN(seconds) || seconds < 0) {
        eteString = '----';
      } else {
        const minutes = Math.floor((seconds / 60) % 60);
        let minuteString = minutes.toString();
        if (minutes < 10) {
          minuteString = '0' + minuteString;
        }
        const hours = Math.floor(seconds / 60 / 60);
        let hourString = hours.toString();
        if (hours < 10) {
          hourString = '0' + hourString;
        }
        if (hours >= 100) {
          eteString = '----';
        } else {
          eteString = hourString + '+' + minuteString;
        }
      }
      this.destinationETE.set(eteString);
    }, true);

    this.props.preFlightData.fuel.sub((fuelWeight) => {
      this.props.bus.getPublisher<FuelTotalizerControlEvents>().pub('fuel_totalizer_set_remaining', fuelWeight ?? 0, true);
    });

    this.computeButtonEnabled.sub((v) => this.computeButtonClass.toggle('compute-button-blue', v), true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="fpln-fuel-weight">
        <div class="fpln-fuel-weight-grid">
          <div>
            <InputField
              bus={this.props.bus}
              topLabel="BOW"
              bind={this.props.preFlightData.bow}
              formatter={new WeightInputFormat('□□□□', 0)}
              suffix="Lb"
              class="fpln-fuel-weight-bow-lb"
              textAlign="right"
              maxLength={8}
              tscConnected
            />
            <p class="fpln-fuel-weight-passengers-title">Passengers</p>
            <div class="fpln-fuel-weight-passengers">
              <InputField
                bus={this.props.bus}
                suffix="At"
                bind={this.props.preFlightData.paxNum}
                formatter={new NumberInputFormat('□□□□', 0)}
                maxLength={1}
                textAlign="right"
                class="fpln-fuel-weight-passengers-num"
                tscConnected
                tscDisplayLabel={'Passenger Count'}
              />
              <InputField
                bus={this.props.bus}
                suffix="Lb"
                bind={this.props.preFlightData.paxWeight}
                formatter={new WeightInputFormat('□□□', 0, 500)}
                maxLength={3}
                textAlign="right"
                class="fpln-fuel-weight-passengers-lb"
                tscConnected
                tscDisplayLabel={'Average Passenger Weight'}
              />
            </div>
            <div class="fpln-fuel-weight-gross">
              <div>
                <p>Gross</p>
                <p class="fpln-fuel-weight-green-text fpln-fuel-weight-gross-num">
                  {this.grossWeightDisplay}
                </p>
              </div>
              <div>
                <p>Wt</p>
                <p>Lb</p>
              </div>
            </div>
            <p class="fpln-fuel-weight-ete">ETE</p>
            <p ref={this.computingDataRef} class="fpln-fuel-weight-computing-msg hidden">
              Computing
              <br />
              Data...
            </p>
            <TouchButton
              label="Compute"
              class={this.computeButtonClass}
              variant={'small'}
              isEnabled={this.computeButtonEnabled}
              onPressed={() => { this.computeButtonPress(); }}
            />
          </div>
          <div class="fpln-fuel-weight-right">
            <InputField
              bus={this.props.bus}
              topLabel="Fuel"
              suffix="Lb"
              bind={this.props.preFlightData.fuel}
              formatter={new WeightInputFormat('□□□□', 0)}
              color="green"
              textAlign="right"
              maxLength={8}
              tscConnected
            />
            <InputField
              bus={this.props.bus}
              topLabel="Cargo"
              suffix="Lb"
              bind={this.props.preFlightData.cargo}
              formatter={new WeightInputFormat('□□□□', 0)}
              textAlign="right"
              maxLength={8}
              tscConnected
            />
            <div class="fpln-dest-altn-grid">
              <div>
                <p>Dest</p>
                <p class="fpln-fuel-weight-green-text">{this.destination}</p>
              </div>
              <div>
                <p>Altn</p>
                <p class="fpln-fuel-weight-green-text">{this.alternate}</p>
              </div>
              <div class="fpln-fuel-weight-destination-time">
                <p class="fpln-fuel-weight-green-text fpln-fuel-weight-time">
                  {this.destinationETE}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
