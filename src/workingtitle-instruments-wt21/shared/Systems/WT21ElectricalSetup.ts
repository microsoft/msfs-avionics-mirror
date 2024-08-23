import { BasicAvionicsSystem, ElectricalPublisher, EventBus } from '@microsoft/msfs-sdk';

import { ADCSystem } from './ADCSystem';
import { AhrsSystem } from './AHRSSystem';
import { AOASystem } from './AOASystem';
import { COMReceiverSystem } from './COMReceiverSystem';
import { MagnetometerSystem } from './MagnetometerSystem';
import { RASystem } from './RASystem';
import { TDRSystem } from './TDRSystem';
import { TSSSystem } from './TSSSystem';

/**
 * A class containing some helpers to set up the electricals on instruments.
 */
export class WT21ElectricalSetup {

  /**
   * Initializes the systems used on the instruments.
   * @param systemsArr The instrument's systems array.
   * @param bus The event bus.
   * @param xmlConfig The instrument panel XML config.
   */
  public static initializeSystems(systemsArr: BasicAvionicsSystem<any>[], bus: EventBus, xmlConfig: Document): void {
    systemsArr.push(new AhrsSystem(1, bus));
    systemsArr.push(new MagnetometerSystem(1, bus));
    systemsArr.push(new ADCSystem(1, bus));
    systemsArr.push(new AOASystem(1, xmlConfig, bus));
    systemsArr.push(new RASystem(1, bus));
    systemsArr.push(new TDRSystem(1, bus));
    systemsArr.push(new TSSSystem(1, bus));
    systemsArr.push(new COMReceiverSystem(1, bus));
  }

  /**
   * Initialize the avionics electrical bus XML logic.
   * @param elecPublisher The electrical publisher.
   * @param instrument The instrument.
   */
  public static initializeAvElectrical(elecPublisher: ElectricalPublisher, instrument: BaseInstrument): void {
    // HINT: In the future these IDs somehow need to come from the xml like in the Garmins
    const pfdId = 'WT21_PFD_1';
    const mfdId = 'WT21_MFD_1';

    const pfdBusLogic = this.getElectricalLogicForName(pfdId, instrument);
    const mfdBusLogic = this.getElectricalLogicForName(mfdId, instrument);

    if (pfdBusLogic !== undefined) {
      elecPublisher.setAv1Bus(pfdBusLogic);
    }

    if (mfdBusLogic !== undefined) {
      elecPublisher.setAv2Bus(mfdBusLogic);
    }
  }

  /**
   * Gets the electrical bus XML logic for a given panel name.
   * @param name The name of the panel.
   * @param instrument The instrument.
   * @returns The XML logic element, or undefined if none was found.
   */
  private static getElectricalLogicForName(name: string, instrument: BaseInstrument): CompositeLogicXMLElement | undefined {
    const instrumentConfigs = instrument.xmlConfig.getElementsByTagName('Instrument');
    for (let i = 0; i < instrumentConfigs.length; i++) {
      const el = instrumentConfigs.item(i);

      if (el !== null) {
        const nameEl = el.getElementsByTagName('Name');
        if (nameEl.length > 0 && nameEl[0].textContent === name) {
          const electrics = el.getElementsByTagName('Electric');
          if (electrics.length > 0) {
            return new CompositeLogicXMLElement(instrument, electrics[0]);
          }
        }
      }
    }
    return undefined;
  }
}
