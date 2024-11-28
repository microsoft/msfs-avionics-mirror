import {
  APEvents, APLateralModes, APModeType, APStateManager, APVerticalModes, ControlEvents, HEvent, KeyEventData, KeyEventManager, NavEvents, NavSourceId,
  NavSourceType, SimVarValueType, SubEvent, SubEventInterface
} from '@microsoft/msfs-sdk';

import { Epic2APNavSourceController } from './Epic2APNavSourceController';
import { Epic2ApPanelEvents } from './Epic2ApPanelPublisher';

export enum Epic2APVerticalEvent {
  /** The pitch wheel was turned while not in VS or PIT mode. */
  PitchWheelTurned,
}

export enum Epic2HeadingSyncEvent {
  /** The heading knob has been pushed to sync heading. */
  HeadingSyncPushed,
}

/**
 * A Epic 2 autopilot state manager.
 */
export class Epic2APStateManager extends APStateManager {
  private vsLastPressed = 0;

  protected readonly hEventPrefixes = ['AP_'];
  protected readonly hEventPattern = new RegExp(`^(?:${this.hEventPrefixes.join('|')})(.+)`);

  public epic2ApIntentionalDisengageEvent: SubEventInterface<this, unknown> = new SubEvent<this, unknown>();
  public epic2VerticalEvent: SubEventInterface<this, Epic2APVerticalEvent> = new SubEvent<this, Epic2APVerticalEvent>();
  public epic2HeadingSyncEvent: SubEventInterface<this, Epic2HeadingSyncEvent> = new SubEvent<this, Epic2HeadingSyncEvent>();
  private hdgOrTrkActive = false;

  private epic2NavSourceController = new Epic2APNavSourceController(this.bus);

  /** @inheritdoc */
  protected onAPListenerRegistered(): void {
    super.onAPListenerRegistered();
    const sub = this.bus.getSubscriber<APEvents & ControlEvents & HEvent & Epic2ApPanelEvents>();

    // We use H events where no K event exists in the sim.
    sub.on('hEvent').handle(event => {
      const match = event.match(this.hEventPattern);
      if (match !== null) {
        this.onHEvent(match[1]);
      }
    });

    this.epic2NavSourceController.activeApNavSource.sub(this.handleSourceChange.bind(this), true);
    sub.on('ap_heading_hold').handle((active) => this.hdgOrTrkActive = active);
    sub.on('epic2_ap_hdg_trk_selector').whenChanged().handle((active) => this.handleTrkModeChange(active));
  }

  /**
   * Checks if HDG/TRK mode is TRK
   * @returns true if TRK mode active
   */
  private trkModeActive(): boolean {
    return SimVar.GetSimVarValue('L:XMLVAR_HDG_TRK', SimVarValueType.Bool) > 0;
  }

  /**
   * Handle switch between hdg and trk
   * @param trkActive trk currently active?
   */
  protected handleTrkModeChange(trkActive: boolean): void {
    if (this.hdgOrTrkActive) {
      // switch mode
      this.sendApModeEvent(APModeType.LATERAL, trkActive ? APLateralModes.TRACK : APLateralModes.HEADING, true);
    }
  }

  /**
   * Handles the CDI source change events.
   * @param newSource The new CDI source.
   */
  private handleSourceChange(newSource: NavSourceId): void {
    SimVar.SetSimVarValue('GPS DRIVES NAV1', SimVarValueType.Bool, newSource.type === NavSourceType.Gps);
    if (newSource.type === NavSourceType.Nav) {
      SimVar.SetSimVarValue('AUTOPILOT NAV SELECTED', SimVarValueType.Number, newSource.index);
    }
    this.bus.getPublisher<NavEvents>().pub('cdi_select', newSource, true, true);
  }

  /**
   * Disengage the autopilot, either normally or abnormally.
   * @param abnormal Whether the disconnect is abnormal.
   */
  public disengageAutopilot(abnormal = true): void {
    if (abnormal) {
      this.keyEventManager?.triggerKey('AUTOPILOT_OFF', true);
    } else {
      this.setApMasterStatus(false);
    }
  }

  /**
   * Disengage the autothrottle.
   */
  private disengageAutothrottle(): void {
    this.keyEventManager?.triggerKey('AUTO_THROTTLE_DISCONNECT', false);
  }

  /**
   * Disengage the yaw damper.
   */
  private disengageYawDamper(): void {
    this.keyEventManager?.triggerKey('YAW_DAMPER_OFF', false);
  }

  /** @inheritdoc */
  protected setupKeyIntercepts(manager: KeyEventManager): void {
    //AP master status
    manager.interceptKey('AP_MASTER', false);
    manager.interceptKey('AUTOPILOT_ON', false);
    manager.interceptKey('AUTOPILOT_OFF', false);

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

    manager.interceptKey('AP_NAV_SELECT_SET', false);
    manager.interceptKey('TOGGLE_GPS_DRIVES_NAV1', false);

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

    //baro set intercept
    manager.interceptKey('BAROMETRIC', true);

    //TOGA intercept
    manager.interceptKey('AUTO_THROTTLE_TO_GA', false);
  }

  /** @inheritdoc */
  protected handleKeyIntercepted({ key, value0 }: KeyEventData): void {
    // const controlEventPub = this.bus.getPublisher<ControlEvents>();
    switch (key) {
      case 'AP_MASTER': {
        // We get the AP master state directly from the simvar instead of the apMasterOn subject because the subject
        // is only updated at the glass cockpit refresh rate, and we want the most up-to-date state possible.
        const isApMasterOn = SimVar.GetSimVarValue('AUTOPILOT MASTER', SimVarValueType.Bool);
        this.setApMasterStatus(!isApMasterOn);
        break;
      }
      case 'AUTOPILOT_ON':
        // We get the AP master state directly from the simvar instead of the apMasterOn subject because the subject
        // is only updated at the glass cockpit refresh rate, and we want the most up-to-date state possible.
        this.setApMasterStatus(true);
        break;
      case 'AUTOPILOT_OFF':
        // This event is treated as the "quick disconnect" button. It also disconnects AT and YD.
        // We get the AP master state directly from the simvar instead of the apMasterOn subject because the subject
        // is only updated at the glass cockpit refresh rate, and we want the most up-to-date state possible.
        this.setApMasterStatus(false);
        this.disengageAutothrottle();
        this.disengageYawDamper();
        break;
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
        this.sendApModeEvent(APModeType.LATERAL, this.trkModeActive() ? APLateralModes.TRACK : APLateralModes.HEADING);
        break;
      case 'AP_PANEL_HEADING_ON':
      case 'AP_HDG_HOLD_ON':
        this.sendApModeEvent(APModeType.LATERAL, this.trkModeActive() ? APLateralModes.TRACK : APLateralModes.HEADING, true);
        break;
      case 'AP_PANEL_HEADING_OFF':
      case 'AP_HDG_HOLD_OFF':
        this.sendApModeEvent(APModeType.LATERAL, APLateralModes.HEADING, false);
        this.sendApModeEvent(APModeType.LATERAL, APLateralModes.TRACK, false);
        break;
      case 'AP_PANEL_HEADING_SET':
        if (value0 !== undefined) {
          this.sendApModeEvent(APModeType.LATERAL, this.trkModeActive() ? APLateralModes.TRACK : APLateralModes.HEADING, value0 === 1 ? true : false);
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
      case 'AP_NAV_SELECT_SET':
        if (value0 !== undefined && value0 >= 1 && value0 <= 2) {
          this.epic2NavSourceController.handleApNavSelectSet(value0);
          // controlEventPub.pub('cdi_src_set', { type: NavSourceType.Nav, index: value0 }, true);
        }
        break;
      case 'TOGGLE_GPS_DRIVES_NAV1':
        this.epic2NavSourceController.handleToggleGpsDrivesNav1();
        // controlEventPub.pub('cdi_src_gps_toggle', true, true);
        break;
      case 'AUTO_THROTTLE_TO_GA':
        this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.TO);
    }
  }

  /**
   * Handles AP H Events (we only use this for events that do not have a corresponding K event we can trigger).
   * @param event The event string.
   */
  protected onHEvent(event: string): void {
    switch (event) {
      case 'PITCH_WHEEL_TURNED':
        // the pitch wheel was turned while not in VS or PIT mode
        this.epic2VerticalEvent.notify(this, Epic2APVerticalEvent.PitchWheelTurned);
        break;
      case 'HEADING_SYNC':
        // the heading knob has been pushed to sync heading
        this.epic2HeadingSyncEvent.notify(this, Epic2HeadingSyncEvent.HeadingSyncPushed);
        break;
    }
  }

  /**
   * Sets the master autopilot status in response to an intercepted key event.
   * @param commandedState The autopilot activation state commanded by the key event.
   */
  private setApMasterStatus(commandedState: boolean): void {
    this.keyEventManager!.triggerKey(commandedState ? 'AUTOPILOT_ON' : 'AUTOPILOT_OFF', true);
    // send an event to inhibit/reset the abnormal disconnect
    this.epic2ApIntentionalDisengageEvent.notify(this, undefined);
  }
}
