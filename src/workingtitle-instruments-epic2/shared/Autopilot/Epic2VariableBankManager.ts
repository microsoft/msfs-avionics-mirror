/// <reference types="@microsoft/msfs-types/js/simvar" />

import {
  AdcEvents, APEvents, APLateralModes, APValues, ConsumerSubject, EventBus, FlightPathCalculatorControlEvents, FlightPathCalculatorOptions, Publisher
} from '@microsoft/msfs-sdk';
import { Epic2ApPanelEvents } from './Epic2ApPanelPublisher';

export enum Epic2MaxBankIndex {
  FULL_BANK,
  HALF_BANK
}

/**
 * Class to manage the Epic 2 Variable Bank Setting
 */
export class Epic2VariableBankManager {
  private static HALF_BANK_ALTITUDE_HYSTERESIS = 100;
  private readonly publisher: Publisher<FlightPathCalculatorControlEvents>;

  private readonly halfBankActivationAltitude = 25000;

  private readonly altitude: ConsumerSubject<number>;

  // Half Bank Button State
  private readonly maxBankMode: ConsumerSubject<Epic2MaxBankIndex>;
  // Half Bank Simvar State
  private readonly maxBankIndex: ConsumerSubject<Epic2MaxBankIndex>;

  private readonly maxBankValue: ConsumerSubject<number>;

  private halfBankSetAtActivationAltitude = false;
  private fullBankSetAtActivationAltitude = false;

  private readonly fullBankCalculatorValue = 30;
  private readonly halfBankCalculatorValue = 17;

  /**
   * Creates an instance of the Epic2 Variable Bank Manager.
   * @param bus The event bus to use with this instance.
   * @param apValues The autopilot ap values.
   */
  constructor(private readonly bus: EventBus, private readonly apValues: APValues) {

    this.publisher = this.bus.getPublisher<FlightPathCalculatorControlEvents>();
    const sub = this.bus.getSubscriber<APEvents & AdcEvents & Epic2ApPanelEvents>();

    this.altitude = ConsumerSubject.create(sub.on('indicated_alt').whenChangedBy(10), 0);
    this.maxBankMode = ConsumerSubject.create(sub.on('epic2_ap_half_bank_mode'), Epic2MaxBankIndex.FULL_BANK);
    this.maxBankIndex = ConsumerSubject.create(sub.on('ap_max_bank_id').whenChanged(), Epic2MaxBankIndex.FULL_BANK);
    this.maxBankValue = ConsumerSubject.create(sub.on('ap_max_bank_value').whenChanged(), 30);

    // Sets the correct variable bank rate for the altitude.
    this.altitude.sub(this.handleAltitudeUpdated, true);

    // Sets the correct variable bank rate when lateral mode changes.
    this.apValues.lateralActive.sub(this.updateMaxBank, true);
    // Sets the correct variable bank rate when half bank button pressed
    this.maxBankMode.sub(() => {
      this.updateMaxBank(this.apValues.lateralActive.get());
    }, true);

    // Sets the max bank angle to be used by FlightPathCalculator to calculate the flight path.
    this.maxBankIndex.sub(this.handleMaxBankIndexChanged, true);

    // Sets the max bank angle the AP may command.
    this.maxBankValue.sub(v => this.apValues.maxBankAngle.set(v), true);

    // Set the max bank velocity as it defaults to 3 when using the max bank angle override
    SimVar.SetSimVarValue('K:AP_MAX_BANK_VELOCITY_SET', 'number', 5);
  }

  /**
   * Handles when the max bank index changes from the sim autopilot values.
   * @param index The max_bank_id value.
   */
  private handleMaxBankIndexChanged = (index: Epic2MaxBankIndex): void => {
    const options: Partial<FlightPathCalculatorOptions> =
      { bankAngle: index === Epic2MaxBankIndex.FULL_BANK ? this.fullBankCalculatorValue : this.halfBankCalculatorValue };
    this.publisher.pub('flightpath_set_options', options, true, true);
  };

  /**
   * Handles when the aircraft indicated altitude changes (evaluated in 10' increments).
   * @param altitude The indicated altitude in feet AMSL.
   */
  private handleAltitudeUpdated = (altitude: number): void => {
    if (altitude > this.halfBankActivationAltitude + Epic2VariableBankManager.HALF_BANK_ALTITUDE_HYSTERESIS
      && this.maxBankIndex.get() === Epic2MaxBankIndex.FULL_BANK
      && !this.halfBankSetAtActivationAltitude
      && this.isHeadingMode(this.apValues.lateralActive.get())
    ) {
      this.halfBankSetAtActivationAltitude = true;
      SimVar.SetSimVarValue('K:AP_MAX_BANK_SET', 'number', Epic2MaxBankIndex.HALF_BANK);
      SimVar.SetSimVarValue('L:WT_Epic2_Half_Bank_Mode', 'number', Epic2MaxBankIndex.HALF_BANK);
    } else if (altitude < this.halfBankActivationAltitude - Epic2VariableBankManager.HALF_BANK_ALTITUDE_HYSTERESIS
      && this.maxBankIndex.get() === Epic2MaxBankIndex.HALF_BANK
      && !this.fullBankSetAtActivationAltitude) {
      this.fullBankSetAtActivationAltitude = true;
      SimVar.SetSimVarValue('K:AP_MAX_BANK_SET', 'number', Epic2MaxBankIndex.FULL_BANK);
      SimVar.SetSimVarValue('L:WT_Epic2_Half_Bank_Mode', 'number', Epic2MaxBankIndex.FULL_BANK);
    }

    if (altitude < this.halfBankActivationAltitude) {
      this.halfBankSetAtActivationAltitude = false;
    } else {
      this.fullBankSetAtActivationAltitude = false;
    }
  };

  /**
   * Check if the given lateral mode is a heading mode (subject to the max bank selection)
   * @param mode AP lateral mode
   * @returns true if the given mode is subject to the max bank selection
   */
  private isHeadingMode(mode: APLateralModes): boolean {
    switch (mode) {
      case APLateralModes.HEADING:
      case APLateralModes.HEADING_HOLD:
      case APLateralModes.TRACK:
      case APLateralModes.TRACK_HOLD:
        return true;
      default:
        return false;
    }
  }

  /**
   * Handles when the lateral active AP mode changes.
   * @param mode The Active Lateral AP Mode.
   */
  private updateMaxBank = (mode: APLateralModes): void => {
    if (this.maxBankIndex.get() === Epic2MaxBankIndex.FULL_BANK
      && this.maxBankMode.get() === Epic2MaxBankIndex.HALF_BANK
      && this.isHeadingMode(mode)) {
      SimVar.SetSimVarValue('K:AP_MAX_BANK_SET', 'number', Epic2MaxBankIndex.HALF_BANK);
    } else if (this.maxBankMode.get() === Epic2MaxBankIndex.FULL_BANK) {
      SimVar.SetSimVarValue('K:AP_MAX_BANK_SET', 'number', Epic2MaxBankIndex.FULL_BANK);
    } else if (!this.isHeadingMode(mode)) {
      SimVar.SetSimVarValue('K:AP_MAX_BANK_SET', 'number', Epic2MaxBankIndex.FULL_BANK);
    }
  };
}
