import { EventBus, TrafficInstrument } from '@microsoft/msfs-sdk';

import { GarminAdsb, GarminTcasII, TrafficAdvisorySystem, TrafficAvionicsSystem, TrafficInfoService, TrafficSystem, TrafficSystemType } from '@microsoft/msfs-garminsdk';

import { ResolvableConfig } from '../Config/Config';

/**
 * Traffic system types supported by the G3000/G5000.
 */
export type G3000TrafficSystemType = TrafficSystemType.Tis | TrafficSystemType.Tas | TrafficSystemType.TcasII

/**
 * A configuration object which defines options related to the avionics' traffic system.
 */
export class TrafficConfig implements ResolvableConfig<(bus: EventBus, tfcInstrument: TrafficInstrument, initializationTime: number) => TrafficAvionicsSystem> {

  /** @inheritdoc */
  public readonly isResolvableConfig = true;

  /** The type of traffic system used. */
  public readonly type: G3000TrafficSystemType;

  /** Whether the traffic system should support ADS-B. */
  public readonly supportAdsb: boolean;

  /** The electrical logic for the traffic system. */
  public readonly electricity?: CompositeLogicXMLElement;

  /**
   * Creates a new TrafficConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   */
  constructor(baseInstrument: BaseInstrument, element: Element | undefined) {
    if (element === undefined) {
      this.type = TrafficSystemType.Tis;
      this.supportAdsb = false;
    } else {
      if (element.tagName !== 'Traffic') {
        throw new Error(`Invalid TrafficConfig definition: expected tag name 'Traffic' but was '${element.tagName}'`);
      }

      const type = element.getAttribute('type');
      switch (type) {
        case TrafficSystemType.Tis:
        case TrafficSystemType.Tas:
        case TrafficSystemType.TcasII:
          this.type = type;
          break;
        default:
          this.type = TrafficSystemType.Tis;
      }

      const supportAdsb = element.getAttribute('ads-b');
      switch ((supportAdsb ?? 'false').toLowerCase()) {
        case 'true':
          this.supportAdsb = true;
          break;
        case 'false':
          this.supportAdsb = false;
          break;
        default:
          console.warn('Invalid TrafficConfig definition: unrecognized ads-b value (must be \'true\' or \'false\' - case-insensitive)');
          this.supportAdsb = false;
      }

      const electricLogicElement = element.querySelector(':scope>Electric');

      this.electricity = electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement);
    }
  }

  /** @inheritdoc */
  public resolve(): (bus: EventBus, tfcInstrument: TrafficInstrument, initializationTime: number) => TrafficAvionicsSystem {
    return (bus, tfcInstrument, initializationTime) => {
      let system: TrafficSystem;
      switch (this.type) {
        case TrafficSystemType.Tis:
          system = new TrafficInfoService(bus, tfcInstrument, true);
          break;
        case TrafficSystemType.Tas:
          system = new TrafficAdvisorySystem(bus, tfcInstrument, this.supportAdsb ? new GarminAdsb(bus) : null, true);
          break;
        case TrafficSystemType.TcasII:
          system = new GarminTcasII(bus, tfcInstrument, this.supportAdsb ? new GarminAdsb(bus) : null);
          break;
      }

      return new TrafficAvionicsSystem(bus, system, this.electricity, initializationTime);
    };
  }
}