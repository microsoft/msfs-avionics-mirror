import { APConfig, APLateralModes, APModeType, APVerticalModes, EventBus, KeyEventData, KeyEventManager } from '@microsoft/msfs-sdk';

import { GarminAPStateManager } from '@microsoft/msfs-garminsdk';

import { GNSAPCdiSourceManager } from './GNSAPCdiSourceManager';

/**
 * A GNS autopilot state manager.
 */
export class GNSAPStateManager extends GarminAPStateManager {
  /**
   * Creates an instance of the APStateManager.
   * @param bus An instance of the event bus.
   * @param apConfig This autopilot's configuration.
   * @param cdiSourceManager A manager of CDI source state for the autopilot.
   * @param supportFlightDirector Whether to support a flight director independent from the autopilot state.
   */
  constructor(
    bus: EventBus,
    apConfig: APConfig,
    private readonly cdiSourceManager: GNSAPCdiSourceManager,
    private supportFlightDirector: boolean
  ) {
    super(bus, apConfig);
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
  protected handleKeyIntercepted(data: KeyEventData): void {
    switch (data.key) {
      case 'AP_NAV_SELECT_SET':
        if (data.value0 === 1 || data.value0 === 2) {
          this.cdiSourceManager.setNavigatorIndex(data.value0);
        }
        break;
      case 'TOGGLE_GPS_DRIVES_NAV1':
        this.cdiSourceManager.toggleGpsNav();
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