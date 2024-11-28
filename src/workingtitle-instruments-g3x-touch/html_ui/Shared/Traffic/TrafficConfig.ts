import { EventBus, TrafficInstrument } from '@microsoft/msfs-sdk';

import { GarminAdsb, TrafficAdvisorySystem, TrafficAvionicsSystem, TrafficInfoService, TrafficSystem, TrafficSystemType } from '@microsoft/msfs-garminsdk';

import { G3XTrafficSystemSource } from '../Components/Map/Modules/G3XMapTrafficModule';
import { ResolvableConfig } from '../Config/Config';

/**
 * Traffic system types supported by the G3X Touch.
 */
export type G3XTrafficSystemType = TrafficSystemType.Tis | TrafficSystemType.Tas;

/**
 * A configuration object which defines options related to the avionics' traffic system.
 */
export class TrafficConfig implements ResolvableConfig<(bus: EventBus, tfcInstrument: TrafficInstrument, initializationTime: number) => TrafficAvionicsSystem | null> {

  /** @inheritdoc */
  public readonly isResolvableConfig = true;

  /** The source of traffic data. */
  public readonly source: G3XTrafficSystemSource;

  /** The type of traffic system used. */
  public readonly type: G3XTrafficSystemType | null;

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
      this.source = G3XTrafficSystemSource.None;
      this.type = null;
      this.supportAdsb = false;
    } else {
      if (element.tagName !== 'Traffic') {
        throw new Error(`Invalid TrafficConfig definition: expected tag name 'Traffic' but was '${element.tagName}'`);
      }

      const source = element.getAttribute('source');
      switch (source) {
        case G3XTrafficSystemSource.Gts:
          this.source = source;
          this.type = TrafficSystemType.Tas;
          break;
        case G3XTrafficSystemSource.Gtx:
        case G3XTrafficSystemSource.Gdl:
          this.source = source;
          this.type = TrafficSystemType.Tis;
          break;
        case G3XTrafficSystemSource.None:
        case null:
          this.source = G3XTrafficSystemSource.None;
          this.type = null;
          break;
        default:
          console.warn('Invalid TrafficConfig definition: unrecognized source value (must be "GTS", "GTX", "GDL", or "None"). Defaulting to "None".');
          this.source = G3XTrafficSystemSource.None;
          this.type = null;
      }

      if (this.source !== G3XTrafficSystemSource.None) {
        if (this.source !== G3XTrafficSystemSource.Gdl) {
          const supportAdsb = element.getAttribute('ads-b');
          switch ((supportAdsb ?? 'false').toLowerCase()) {
            case 'true':
              this.supportAdsb = true;
              break;
            case 'false':
              this.supportAdsb = false;
              break;
            default:
              console.warn('Invalid TrafficConfig definition: unrecognized ads-b value (must be "true" or "false"). Defaulting to false.');
              this.supportAdsb = false;
          }
        } else {
          this.supportAdsb = true;
        }

        const electricLogicElement = element.querySelector(':scope>Electric');

        this.electricity = electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement);
      } else {
        this.supportAdsb = false;
      }
    }
  }

  /** @inheritdoc */
  public resolve(): (bus: EventBus, tfcInstrument: TrafficInstrument, initializationTime: number) => TrafficAvionicsSystem | null {
    return (bus, tfcInstrument, initializationTime) => {
      let system: TrafficSystem | null;
      switch (this.type) {
        case TrafficSystemType.Tis:
          system = new TrafficInfoService(bus, tfcInstrument, { adsb: this.supportAdsb ? new GarminAdsb(bus) : null });
          break;
        case TrafficSystemType.Tas:
          system = new TrafficAdvisorySystem(bus, tfcInstrument, this.supportAdsb ? new GarminAdsb(bus) : null, false);
          break;
        default:
          system = null;
      }

      return system === null ? null : new TrafficAvionicsSystem(bus, system, this.electricity, initializationTime);
    };
  }
}