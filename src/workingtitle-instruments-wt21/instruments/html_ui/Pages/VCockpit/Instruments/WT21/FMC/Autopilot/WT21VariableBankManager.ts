/// <reference types="@microsoft/msfs-types/js/simvar" />

import {
  AdcEvents, APEvents, APLateralModes, APValues, ConsumerSubject, EventBus, FlightPathCalculatorControlEvents, FlightPathCalculatorOptions, Publisher
} from '@microsoft/msfs-sdk';

export enum WT21MaxBankIndex {
  FULL_BANK,
  HALF_BANK
}

/**
 * Class to manage the WT21 Half Bank Setting
 */
export class WT21VariableBankManager {

  private readonly publisher: Publisher<FlightPathCalculatorControlEvents>;

  private readonly halfBankActivationAltitude = 27884;

  private readonly altitude: ConsumerSubject<number>;

  private readonly maxBankIndex: ConsumerSubject<WT21MaxBankIndex>;

  private readonly maxBankValue: ConsumerSubject<number>;

  private halfBankSetAtActivationAltitide = false;
  private fullBankSetAtActivationAltitide = false;

  private readonly fullBankCalculatorValue = 25;
  private readonly halfBankCalculatorValue = 12;

  /**
   * Creates an instance of the WT21 Variable Bank Manager.
   * @param bus The event bus to use with this instance.
   * @param apValues The autopilot ap values.
   */
  constructor(private readonly bus: EventBus, private readonly apValues: APValues) {

    this.publisher = this.bus.getPublisher<FlightPathCalculatorControlEvents>();

    const adc = this.bus.getSubscriber<AdcEvents>();
    const ap = this.bus.getSubscriber<APEvents>();

    this.altitude = ConsumerSubject.create(adc.on('indicated_alt').whenChangedBy(10), 0);

    this.maxBankIndex = ConsumerSubject.create(ap.on('ap_max_bank_id').whenChanged(), WT21MaxBankIndex.FULL_BANK);
    this.maxBankValue = ConsumerSubject.create(ap.on('ap_max_bank_value').whenChanged(), 30);

    // Sets the correct variable bank rate for the altitude.
    this.altitude.sub(this.handleAltitudeUpdated, true);

    // Sets the correct variable bank rate for the altitude when LNAV is engaged.
    this.apValues.lateralActive.sub(this.handleLateralActiveChanged, true);

    // Sets the max bank angle to be used by FlightPathCalculator to calculate the flight path.
    this.maxBankIndex.sub(this.handleMaxBankIndexChanged, true);

    // Sets the max bank angle the AP may command.
    this.maxBankValue.sub(v => this.apValues.maxBankAngle.set(v), true);
  }

  /**
   * Handles when the max bank index changes from the sim autopilot values.
   * @param index The max_bank_id value.
   */
  private handleMaxBankIndexChanged = (index: WT21MaxBankIndex): void => {
    const options: Partial<FlightPathCalculatorOptions> =
      { bankAngle: index === WT21MaxBankIndex.FULL_BANK ? this.fullBankCalculatorValue : this.halfBankCalculatorValue };
    this.publisher.pub('flightpath_set_options', options, true, true);
  };

  /**
   * Handles when the aircraft indicated altitude changes (evaluated in 10' increments).
   * @param altitude The indicated altitude in feet AMSL.
   */
  private handleAltitudeUpdated = (altitude: number): void => {

    if (altitude > this.halfBankActivationAltitude && this.maxBankIndex.get() === WT21MaxBankIndex.FULL_BANK && !this.halfBankSetAtActivationAltitide) {
      this.halfBankSetAtActivationAltitide = true;
      SimVar.SetSimVarValue('K:AP_MAX_BANK_SET', 'number', WT21MaxBankIndex.HALF_BANK);
    } else if (altitude < this.halfBankActivationAltitude && this.maxBankIndex.get() === WT21MaxBankIndex.HALF_BANK && !this.fullBankSetAtActivationAltitide) {
      this.fullBankSetAtActivationAltitide = true;
      SimVar.SetSimVarValue('K:AP_MAX_BANK_SET', 'number', WT21MaxBankIndex.FULL_BANK);
    }

    if (altitude < this.halfBankActivationAltitude) {
      this.halfBankSetAtActivationAltitide = false;
    } else {
      this.fullBankSetAtActivationAltitide = false;
    }
  };

  /**
   * Handles when the lateral active AP mode changes.
   * @param mode The Active Lateral AP Mode.
   */
  private handleLateralActiveChanged = (mode: APLateralModes): void => {

    if (mode === APLateralModes.GPSS) {
      const altitude = this.altitude.get();
      if (altitude > this.halfBankActivationAltitude && this.maxBankIndex.get() === WT21MaxBankIndex.FULL_BANK) {
        SimVar.SetSimVarValue('K:AP_MAX_BANK_SET', 'number', WT21MaxBankIndex.HALF_BANK);
      } else if (altitude < this.halfBankActivationAltitude && this.maxBankIndex.get() === WT21MaxBankIndex.HALF_BANK) {
        SimVar.SetSimVarValue('K:AP_MAX_BANK_SET', 'number', WT21MaxBankIndex.FULL_BANK);
      }
    }

  };
}