import { APConfig, APLateralModes, APModeType, APVerticalModes, ControlEvents, EventBus, KeyEventData, KeyEventManager, NavSourceType, Publisher } from '@microsoft/msfs-sdk';

import { GarminAPStateManager } from '@microsoft/msfs-garminsdk';

import { GNSEvents } from '../GNSEvents';

/**
 * A GNS autopilot state manager.
 */
export class GNSAPStateManager extends GarminAPStateManager {
  private controlPub: Publisher<GNSEvents>;
  /**
   * Creates an instance of the APStateManager.
   * @param bus An instance of the event bus.
   * @param apConfig This autopilot's configuration.
   * @param supportFlightDirector Whether to support a flight director independent from the autopilot state.
   */
  constructor(protected readonly bus: EventBus, apConfig: APConfig, private supportFlightDirector: boolean) {
    super(bus, apConfig);
    this.controlPub = this.bus.getPublisher<GNSEvents>();
  }

  /** @inheritdoc */
  protected setupKeyIntercepts(manager: KeyEventManager): void {
    super.setupKeyIntercepts(manager);

    manager.interceptKey('AP_NAV_SELECT_SET', false);
    manager.interceptKey('TOGGLE_GPS_DRIVES_NAV1', false);
  }

  /**
   * Sends AP Mode Events from the Intercept to the Autopilot.
   * @param type is the AP Mode Type for this event
   * @param mode is the mode to set/unset.
   * @param set is whether to actively set or unset this mode.
   */
  protected sendApModeEvent(type: APModeType, mode?: APLateralModes | APVerticalModes, set?: boolean): void {

    if (this.supportFlightDirector || this.apMasterOn.get()) {
      super.sendApModeEvent(type, mode, set);
    }

  }

  /** @inheritdoc */
  protected handleApNavSelect(value: number | undefined): void {
    if (value !== undefined && value >= 1 && value <= 2) {
      this.controlPub.pub('set_ap_nav_source', value);
    }
  }

  /** @inheritdoc */
  protected handleKeyIntercepted(data: KeyEventData): void {
    const controlEventPub = this.bus.getPublisher<ControlEvents>();

    switch (data.key) {
      case 'AP_NAV_SELECT_SET':
        if (data.value0 !== undefined && data.value0 >= 1 && data.value0 <= 2) {
          controlEventPub.pub('cdi_src_set', { type: NavSourceType.Nav, index: data.value0 }, true);
        }
        break;
      case 'TOGGLE_GPS_DRIVES_NAV1':
        controlEventPub.pub('cdi_src_gps_toggle', true, true);
        break;
      case 'AP_ATT_HOLD_ON':
        this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.PITCH, true);
        break;
      case 'AP_ATT_HOLD_OFF':
        this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.PITCH, false);
        break;
      case 'AP_ATT_HOLD':
        this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.PITCH);
        break;
      default:
        super.handleKeyIntercepted(data);
    }
  }
}