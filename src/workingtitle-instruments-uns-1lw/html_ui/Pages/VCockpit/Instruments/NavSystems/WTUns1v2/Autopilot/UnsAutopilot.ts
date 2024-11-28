import { APLateralModes, APVerticalModes, Autopilot } from '@microsoft/msfs-sdk';

/**
 * UNS-1 fake AP debug data events
 */
export interface UnsApDebugDataEvents {
  /** AP active lateral mode */
  lateralActive: APLateralModes,

  /** AP armed lateral mode */
  lateralArmed: APLateralModes,

  /** AP active vertical mode */
  verticalActive: APVerticalModes,

  /** AP armed vertical mode */
  verticalArmed: APVerticalModes,
}

/**
 * UNS-1 fake AP
 */
export class UnsAutopilot extends Autopilot {
  /** @inheritDoc */
  protected override onAfterUpdate(): void {
    this.bus.getPublisher<UnsApDebugDataEvents>().pub('lateralActive', this.apValues.lateralActive.get());
    this.bus.getPublisher<UnsApDebugDataEvents>().pub('lateralArmed', this.apValues.lateralArmed.get());
    this.bus.getPublisher<UnsApDebugDataEvents>().pub('verticalActive', this.apValues.verticalActive.get());
    this.bus.getPublisher<UnsApDebugDataEvents>().pub('verticalArmed', this.apValues.verticalArmed.get());
  }
}
