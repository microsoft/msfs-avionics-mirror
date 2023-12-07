import {
  APLateralModes, APModeType, APStateManager, APVerticalModes, ControlEvents, HEvent, KeyEventData, KeyEventManager, SimVarValueType
} from '@microsoft/msfs-sdk';

/**
 * A Garmin autopilot state manager.
 */
export class GarminAPStateManager extends APStateManager {
  private vsLastPressed = 0;
  private controlEventPub = this.bus.getPublisher<ControlEvents>();

  /** @inheritdoc */
  protected onAPListenerRegistered(): void {
    super.onAPListenerRegistered();

    const hEvent = this.bus.getSubscriber<HEvent>();
    hEvent.on('hEvent').handle((e: string) => {
      if (e === 'AS1000_VNAV_TOGGLE') {
        this.toggleVnav();
      }
    });
  }

  /** @inheritdoc */
  protected setupKeyIntercepts(manager: KeyEventManager): void {
    //alt modes
    manager.interceptKey('AP_ALT_HOLD', false);
    manager.interceptKey('AP_ALT_HOLD', false);
    manager.interceptKey('AP_ALT_HOLD_ON', false);
    manager.interceptKey('AP_ALT_HOLD_OFF', false);

    manager.interceptKey('AP_PANEL_ALTITUDE_HOLD', false);
    manager.interceptKey('AP_PANEL_ALTITUDE_ON', false);
    manager.interceptKey('AP_PANEL_ALTITUDE_OFF', false);
    manager.interceptKey('AP_PANEL_ALTITUDE_SET', false);

    //vs modes
    manager.interceptKey('AP_PANEL_VS_HOLD', false);
    manager.interceptKey('AP_PANEL_VS_ON', false);
    manager.interceptKey('AP_PANEL_VS_OFF', false);
    manager.interceptKey('AP_PANEL_VS_SET', false);

    manager.interceptKey('AP_VS_HOLD', false);
    manager.interceptKey('AP_VS_ON', false);
    manager.interceptKey('AP_VS_OFF', false);
    manager.interceptKey('AP_VS_SET', false);

    //pitch modes
    manager.interceptKey('AP_ATT_HOLD', false);
    manager.interceptKey('AP_ATT_HOLD_ON', false);
    manager.interceptKey('AP_ATT_HOLD_OFF', false);

    manager.interceptKey('AP_PITCH_LEVELER', false);
    manager.interceptKey('AP_PITCH_LEVELER_ON', false);
    manager.interceptKey('AP_PITCH_LEVELER_OFF', false);

    //roll modes
    manager.interceptKey('AP_BANK_HOLD', false);
    manager.interceptKey('AP_BANK_HOLD_ON', false);
    manager.interceptKey('AP_BANK_HOLD_OFF', false);

    manager.interceptKey('AP_WING_LEVELER', false);
    manager.interceptKey('AP_WING_LEVELER_ON', false);
    manager.interceptKey('AP_WING_LEVELER_OFF', false);

    //flc modes
    manager.interceptKey('FLIGHT_LEVEL_CHANGE', false);
    manager.interceptKey('FLIGHT_LEVEL_CHANGE_ON', false);
    manager.interceptKey('FLIGHT_LEVEL_CHANGE_OFF', false);

    //nav modes
    manager.interceptKey('AP_NAV1_HOLD', false);
    manager.interceptKey('AP_NAV1_HOLD_ON', false);
    manager.interceptKey('AP_NAV1_HOLD_OFF', false);

    //hdg modes
    manager.interceptKey('AP_HDG_HOLD', false);
    manager.interceptKey('AP_HDG_HOLD_ON', false);
    manager.interceptKey('AP_HDG_HOLD_OFF', false);

    manager.interceptKey('AP_PANEL_HEADING_HOLD', false);
    manager.interceptKey('AP_PANEL_HEADING_ON', false);
    manager.interceptKey('AP_PANEL_HEADING_OFF', false);
    manager.interceptKey('AP_PANEL_HEADING_SET', false);

    //bank modes
    manager.interceptKey('AP_BANK_HOLD', false);
    manager.interceptKey('AP_BANK_HOLD_ON', false);
    manager.interceptKey('AP_BANK_HOLD_OFF', false);

    //appr modes
    manager.interceptKey('AP_LOC_HOLD', false);
    manager.interceptKey('AP_LOC_HOLD_ON', false);
    manager.interceptKey('AP_LOC_HOLD_OFF', false);

    manager.interceptKey('AP_APR_HOLD', false);
    manager.interceptKey('AP_APR_HOLD_ON', false);
    manager.interceptKey('AP_APR_HOLD_OFF', false);

    manager.interceptKey('AP_BC_HOLD', false);
    manager.interceptKey('AP_BC_HOLD_ON', false);
    manager.interceptKey('AP_BC_HOLD_OFF', false);

    //TOGA intercept
    manager.interceptKey('AUTO_THROTTLE_TO_GA', false);
  }

  /** @inheritdoc */
  protected handleKeyIntercepted({ key, value0 }: KeyEventData): void {
    switch (key) {
      case 'AP_NAV1_HOLD':
        this.sendApModeEvent(APModeType.LATERAL, APLateralModes.NAV);
        break;
      case 'AP_NAV1_HOLD_ON':
        this.sendApModeEvent(APModeType.LATERAL, APLateralModes.NAV, true);
        break;
      case 'AP_NAV1_HOLD_OFF':
        this.sendApModeEvent(APModeType.LATERAL, APLateralModes.NAV, false);
        break;

      case 'AP_LOC_HOLD':
        this.sendApModeEvent(APModeType.LATERAL, APLateralModes.LOC);
        break;
      case 'AP_LOC_HOLD_ON':
        this.sendApModeEvent(APModeType.LATERAL, APLateralModes.LOC, true);
        break;
      case 'AP_LOC_HOLD_OFF':
        this.sendApModeEvent(APModeType.LATERAL, APLateralModes.LOC, false);
        break;

      case 'AP_APR_HOLD':
        this.sendApModeEvent(APModeType.APPROACH);
        break;
      case 'AP_APR_HOLD_ON':
        this.sendApModeEvent(APModeType.APPROACH, undefined, true);
        break;
      case 'AP_APR_HOLD_OFF':
        this.sendApModeEvent(APModeType.APPROACH, undefined, false);
        break;

      case 'AP_BC_HOLD':
        this.sendApModeEvent(APModeType.LATERAL, APLateralModes.BC);
        break;
      case 'AP_BC_HOLD_ON':
        this.sendApModeEvent(APModeType.LATERAL, APLateralModes.BC, true);
        break;
      case 'AP_BC_HOLD_OFF':
        this.sendApModeEvent(APModeType.LATERAL, APLateralModes.BC, false);
        break;

      case 'AP_HDG_HOLD':
      case 'AP_PANEL_HEADING_HOLD':
        this.sendApModeEvent(APModeType.LATERAL, APLateralModes.HEADING);
        break;
      case 'AP_PANEL_HEADING_ON':
      case 'AP_HDG_HOLD_ON':
        this.sendApModeEvent(APModeType.LATERAL, APLateralModes.HEADING, true);
        break;
      case 'AP_PANEL_HEADING_OFF':
      case 'AP_HDG_HOLD_OFF':
        this.sendApModeEvent(APModeType.LATERAL, APLateralModes.HEADING, false);
        break;
      case 'AP_PANEL_HEADING_SET':
        if (value0 !== undefined) {
          this.sendApModeEvent(APModeType.LATERAL, APLateralModes.HEADING, value0 === 1 ? true : false);
        }
        break;
      case 'AP_BANK_HOLD':
      case 'AP_BANK_HOLD_ON':
        this.sendApModeEvent(APModeType.LATERAL, APLateralModes.ROLL, true);
        break;
      case 'AP_WING_LEVELER':
        this.sendApModeEvent(APModeType.LATERAL, APLateralModes.LEVEL);
        break;
      case 'AP_WING_LEVELER_ON':
        this.sendApModeEvent(APModeType.LATERAL, APLateralModes.LEVEL, true);
        break;
      case 'AP_WING_LEVELER_OFF':
        this.sendApModeEvent(APModeType.LATERAL, APLateralModes.LEVEL, false);
        break;
      case 'AP_PITCH_LEVELER':
        this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.LEVEL);
        break;
      case 'AP_PITCH_LEVELER_ON':
        this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.LEVEL, true);
        break;
      case 'AP_PITCH_LEVELER_OFF':
        this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.LEVEL, false);
        break;
      case 'AP_PANEL_VS_HOLD':
      case 'AP_VS_HOLD':
        this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.VS);
        break;
      case 'AP_PANEL_VS_ON':
      case 'AP_VS_ON':
        this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.VS, true);
        break;
      case 'AP_PANEL_VS_OFF':
      case 'AP_VS_OFF':
        this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.VS, false);
        break;
      case 'AP_PANEL_VS_SET':
      case 'AP_VS_SET':
        // TODO Remove this when the Bravo default mapping is fixed.
        if (value0 !== undefined && this.vsLastPressed < Date.now() - 100) {
          this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.VS, value0 === 1 ? true : false);
        }
        this.vsLastPressed = Date.now();
        break;

      case 'AP_ALT_HOLD':
      case 'AP_PANEL_ALTITUDE_HOLD':
        this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.ALT);
        break;
      case 'AP_ALT_HOLD_ON':
      case 'AP_PANEL_ALTITUDE_ON':
        this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.ALT, true);
        break;
      case 'AP_ALT_HOLD_OFF':
      case 'AP_PANEL_ALTITUDE_OFF':
        this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.ALT, false);
        break;
      case 'AP_PANEL_ALTITUDE_SET':
        if (value0 !== undefined) {
          this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.ALT, value0 === 1 ? true : false);
        }
        break;

      case 'FLIGHT_LEVEL_CHANGE':
        this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.FLC);
        break;
      case 'FLIGHT_LEVEL_CHANGE_ON':
        this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.FLC, true);
        break;
      case 'FLIGHT_LEVEL_CHANGE_OFF':
        this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.FLC, false);
        break;
      case 'AUTO_THROTTLE_TO_GA':
        this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.TO);
    }
  }

  /** @inheritdoc */
  protected onBeforeInitialize(): void {
    SimVar.SetSimVarValue('L:WT1000_AP_G1000_INSTALLED', SimVarValueType.Bool, true);
  }
}