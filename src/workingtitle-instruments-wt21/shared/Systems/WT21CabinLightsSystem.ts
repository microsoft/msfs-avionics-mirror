import { EventBus, Instrument, KeyEventManager, SimVarValueType } from '@microsoft/msfs-sdk';

import { CabinLightsMode, WT21UserSettings } from '../Profiles/WT21UserSettings';

/**
 * The cabin lights system of the WT21.
 */
export class WT21CabinLightsSystem implements Instrument {

  private readonly cabinLightsModeSetting = WT21UserSettings.getManager(this.bus).getSetting('cabinLightsMode');


  /**
   * Ctor
   * @param bus The event bus
   */
  constructor(private readonly bus: EventBus) {
    // noop
  }

  /** @inheritdoc */
  init(): void {
    KeyEventManager.getManager(this.bus).then((manager) => {
      this.cabinLightsModeSetting.sub((value) => {
        this.toggleCircuit(51, value !== CabinLightsMode.OFF);

        switch (value) {
          case CabinLightsMode.OFF:
            this.setCabinLights(0, manager);
            break;
          case CabinLightsMode.ON:
            this.setCabinLights(100, manager);
            break;
          case CabinLightsMode.DIM:
            this.setCabinLights(15, manager);
            break;
        }
      }, true);
    });
  }

  /**
   * Sets the potentiometer value for the cabin lights.
   * @param value The value to set.
   * @param manager The key event manager.
   */
  private setCabinLights(value: number, manager: KeyEventManager): void {
    manager.triggerKey('LIGHT_POTENTIOMETER_SET', true, 28, value);
  }

  /**
   * Toggles a circuit.
   * @param circuit The circuit to toggle.
   * @param state The state to set.
   */
  private toggleCircuit(circuit: number, state: boolean): void {
    const isOn = SimVar.GetSimVarValue(`CIRCUIT SWITCH ON:${circuit}`, SimVarValueType.Number) === 1;
    if (isOn !== state) {
      SimVar.SetSimVarValue('K:ELECTRICAL_CIRCUIT_TOGGLE', SimVarValueType.Number, circuit);
    }
  }

  /** @inheritdoc */
  onUpdate(): void {
    //noop
  }

}
