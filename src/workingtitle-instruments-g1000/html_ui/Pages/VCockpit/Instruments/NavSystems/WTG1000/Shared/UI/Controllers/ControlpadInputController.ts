import { ConsumerSubject, DebounceTimer, EventBus, Radio, RadioEvents, RadioType, SimVarValueType, Subject } from '@microsoft/msfs-sdk';

import { NavComRadio } from '../../NavCom';
import { FmsHEvent } from '../FmsHEvent';
import { XpdrInputController } from './XpdrInputController';

/**
 * Event published by the MFD view service to inhibit generic controlpad use.
 */
export interface MFDViewServiceEvents {
  /** True, if the the generic handling of controlpad input (frequency, xpdr) shall be inhibited.
   * The condition, which triggers true, is MFD's activeViewKey = 'NavMapPage', for all other active views th event is false.
   */
  inhibitGenericControlpadUse: boolean;
}

export enum ControlpadTargetInstrument {
  MFD = 0,
  PFD = 1
}

export enum GenericControlpadHandlingStates {
  comInputArmed,             // Default state, entering a '1' is directly considered as the first digit of a com frequency input
  navInputArmed,             // Enabled by the NAV key. After 10s without input -> fallback to default state
  xpdrInputArmed,            // Enabled by the XPDR key. After 10s without input -> fallback to default state
  comInputStarted,           // Entering a com frequency has been started. After 10s without input -> fallback to default state
  navInputStarted,           // Entering a nav frequency has been started. After 10s without input -> fallback to default state
  crsInputArmed,             // Not for digit entering, but after 10s without input -> fallback to default state
  genericHandlingInhibited,  // Whenever the view type on the MFD is not navmap.
}

/** Simvar which indicates the control pad target instrument. */
export enum ControlPadSimVars {
  ControlPadTargetView = 'L:WT1000_ControlPad_Targetview',  // 0: MFD, 1: PFD
}

/**
 * Controller that handles control pad input for the view service.
 */
export class ControlpadInputController {

  static readonly controlPadEventMap: Map<string, FmsHEvent> = new Map([
    // For the controlpad keyboard input:
    ['AS1000_CONTROL_PAD_A', FmsHEvent.A],
    ['AS1000_CONTROL_PAD_B', FmsHEvent.B],
    ['AS1000_CONTROL_PAD_C', FmsHEvent.C],
    ['AS1000_CONTROL_PAD_D', FmsHEvent.D],
    ['AS1000_CONTROL_PAD_E', FmsHEvent.E],
    ['AS1000_CONTROL_PAD_F', FmsHEvent.F],
    ['AS1000_CONTROL_PAD_G', FmsHEvent.G],
    ['AS1000_CONTROL_PAD_H', FmsHEvent.H],
    ['AS1000_CONTROL_PAD_I', FmsHEvent.I],
    ['AS1000_CONTROL_PAD_J', FmsHEvent.J],
    ['AS1000_CONTROL_PAD_K', FmsHEvent.K],
    ['AS1000_CONTROL_PAD_L', FmsHEvent.L],
    ['AS1000_CONTROL_PAD_M', FmsHEvent.M],
    ['AS1000_CONTROL_PAD_N', FmsHEvent.N],
    ['AS1000_CONTROL_PAD_O', FmsHEvent.O],
    ['AS1000_CONTROL_PAD_P', FmsHEvent.P],
    ['AS1000_CONTROL_PAD_Q', FmsHEvent.Q],
    ['AS1000_CONTROL_PAD_R', FmsHEvent.R],
    ['AS1000_CONTROL_PAD_S', FmsHEvent.S],
    ['AS1000_CONTROL_PAD_T', FmsHEvent.T],
    ['AS1000_CONTROL_PAD_U', FmsHEvent.U],
    ['AS1000_CONTROL_PAD_V', FmsHEvent.V],
    ['AS1000_CONTROL_PAD_W', FmsHEvent.W],
    ['AS1000_CONTROL_PAD_X', FmsHEvent.X],
    ['AS1000_CONTROL_PAD_Y', FmsHEvent.Y],
    ['AS1000_CONTROL_PAD_Z', FmsHEvent.Z],
    ['AS1000_CONTROL_PAD_SPC', FmsHEvent.SPC],
    ['AS1000_CONTROL_PAD_0', FmsHEvent.D0],
    ['AS1000_CONTROL_PAD_1', FmsHEvent.D1],
    ['AS1000_CONTROL_PAD_2', FmsHEvent.D2],
    ['AS1000_CONTROL_PAD_3', FmsHEvent.D3],
    ['AS1000_CONTROL_PAD_4', FmsHEvent.D4],
    ['AS1000_CONTROL_PAD_5', FmsHEvent.D5],
    ['AS1000_CONTROL_PAD_6', FmsHEvent.D6],
    ['AS1000_CONTROL_PAD_7', FmsHEvent.D7],
    ['AS1000_CONTROL_PAD_8', FmsHEvent.D8],
    ['AS1000_CONTROL_PAD_9', FmsHEvent.D9],
    ['AS1000_CONTROL_PAD_Dot', FmsHEvent.Dot],
    ['AS1000_CONTROL_PAD_BKSP', FmsHEvent.BKSP],
    ['AS1000_CONTROL_PAD_PlusMinus', FmsHEvent.PlusMinus],

    // These common events can also be received from the control pad:
    ['AS1000_CONTROL_PAD_FMS_Upper_INC', FmsHEvent.UPPER_INC],
    ['AS1000_CONTROL_PAD_FMS_Upper_DEC', FmsHEvent.UPPER_DEC],
    ['AS1000_CONTROL_PAD_FMS_Lower_INC', FmsHEvent.LOWER_INC],
    ['AS1000_CONTROL_PAD_FMS_Lower_DEC', FmsHEvent.LOWER_DEC],
    ['AS1000_CONTROL_PAD_MENU_Push', FmsHEvent.MENU],
    ['AS1000_CONTROL_PAD_CLR', FmsHEvent.CLR],
    ['AS1000_CONTROL_PAD_ENT_Push', FmsHEvent.ENT],
    ['AS1000_CONTROL_PAD_FMS_Upper_PUSH', FmsHEvent.UPPER_PUSH],
    ['AS1000_CONTROL_PAD_DIRECTTO', FmsHEvent.DIRECTTO],
    ['AS1000_CONTROL_PAD_FPL_Push', FmsHEvent.FPL],
    ['AS1000_CONTROL_PAD_PROC_Push', FmsHEvent.PROC],
    ['AS1000_CONTROL_PAD_RANGE_INC', FmsHEvent.RANGE_INC],
    ['AS1000_CONTROL_PAD_RANGE_DEC', FmsHEvent.RANGE_DEC],
    ['AS1000_CONTROL_PAD_COM', FmsHEvent.COM],
    ['AS1000_CONTROL_PAD_NAV', FmsHEvent.NAV],
    ['AS1000_CONTROL_PAD_XPDR', FmsHEvent.XPDR],
    ['AS1000_CONTROL_PAD_CRS', FmsHEvent.CRS],
    ['AS1000_CONTROL_PAD_Home', FmsHEvent.HOME],
    ['AS1000_CONTROL_KNOB_Outer_INC', FmsHEvent.CONTROL_OUTER_INC],
    ['AS1000_CONTROL_KNOB_Outer_DEC', FmsHEvent.CONTROL_OUTER_DEC],
    ['AS1000_CONTROL_KNOB_Inner_INC', FmsHEvent.CONTROL_INNER_INC],
    ['AS1000_CONTROL_KNOB_Inner_DEC', FmsHEvent.CONTROL_INNER_DEC],
    ['AS1000_CONTROL_KNOB_Push', FmsHEvent.CONTROL_INNER_PUSH],
  ]);

  protected readonly controlPadAcceptingEvents: string[] = ['AS1000_CONTROL_PAD_ENT_Push', 'AS1000_PFD_ENT_Push', 'AS1000_MFD_ENT_Push'];
  protected readonly controlKnobEvents: string[] = ['AS1000_CONTROL_KNOB_Outer_INC', 'AS1000_CONTROL_KNOB_Outer_DEC', 'AS1000_CONTROL_KNOB_Inner_INC',
    'AS1000_CONTROL_KNOB_Inner_DEC', 'AS1000_CONTROL_KNOB_Push'];

  private readonly sub = this.bus.getSubscriber<RadioEvents & MFDViewServiceEvents>();
  private readonly inhibitGenericControlpadUseConsumer = ConsumerSubject.create(this.sub.on('inhibitGenericControlpadUse'), false);
  private readonly stateFallbackTimer = new DebounceTimer();
  private controlpadState = Subject.create(GenericControlpadHandlingStates.comInputArmed);

  private readonly xpdrHandler = new XpdrInputController(this.bus, this.targetDisplay === ControlpadTargetInstrument.PFD);

  private radio1: Radio = ({
    index: 1,
    activeFrequency: 0,
    standbyFrequency: 0,
    ident: null,
    signal: 0,
    radioType: (this.targetDisplay === ControlpadTargetInstrument.PFD) ? RadioType.Com : RadioType.Nav,
    selected: true
  });
  private radio2: Radio = ({
    index: 2,
    activeFrequency: 0,
    standbyFrequency: 0,
    ident: null,
    signal: 0,
    radioType: (this.targetDisplay === ControlpadTargetInstrument.PFD) ? RadioType.Com : RadioType.Nav,
    selected: false
  });
  // private selectedRadio: Radio = this.radio1;

  private comRadio: NavComRadio | undefined;
  private navRadio: NavComRadio | undefined;

  /**
   * Constructs the controller. Each PFD and MFD have seperate instances of this controllers. The PFD controller maintains
   * the COM frequencies and the MFD controller the NAV frequencies.
   * @param bus The event bus.
   * @param targetDisplay Enum that indicates for which instrument (PFD or MFD) this handler is running.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly targetDisplay: ControlpadTargetInstrument) {
    this.sub.on('set_radio_state').handle((state) => {
      if ((targetDisplay === ControlpadTargetInstrument.PFD) && (state.radioType === RadioType.Com)) {
        if (state.index === 1) {
          this.radio1 = state;
        } else if (state.index === 2) {
          this.radio2 = state;
        }
      } else if ((targetDisplay === ControlpadTargetInstrument.MFD) && (state.radioType === RadioType.Nav)) {
        if (state.index === 1) {
          this.radio1 = state;
        } else if (state.index === 2) {
          this.radio2 = state;
        }
      }
    }, false);

    // Block controlpad use if the MFD is showing any other view than the nav map:
    this.inhibitGenericControlpadUseConsumer.sub((genericUseInhibited) => {
      if (genericUseInhibited) {
        // Clear any running fallback timer and set the inhibit state:
        this.stateFallbackTimer.clear();
        this.controlpadState.set(GenericControlpadHandlingStates.genericHandlingInhibited);
        SimVar.SetSimVarValue('L:WT1000_ControlPad_ModeInput_Inhibited', SimVarValueType.Bool, true);
      } else {
        // After an inhibit phase, we always return to default state:
        this.controlpadState.set(GenericControlpadHandlingStates.comInputArmed);
        SimVar.SetSimVarValue('L:WT1000_ControlPad_ModeInput_Inhibited', SimVarValueType.Bool, false);
        SimVar.SetSimVarValue('L:WT1000_ControlPad_Mode', SimVarValueType.Enum, 0);
      }
    }, true);

    this.controlpadState.sub((state) => {
      this.armRadio(state);
    }, true);
  }

  /**
   * Setter for the radio refs.
   * @param comRadio com radio ref
   * @param navRadio nav radio ref
   */
  public setFrequencyElementRefs(comRadio: NavComRadio, navRadio: NavComRadio): void {
    this.comRadio = comRadio;
    this.navRadio = navRadio;
  }

  /**
   * This abstract method returns true, if the current instrument shall handle control pad events:
   * @returns translated event as string
   */
  private isControlpadTargetInstrument(): boolean {
    const controlPadTarget = SimVar.GetSimVarValue(ControlPadSimVars.ControlPadTargetView, 'number');
    if (controlPadTarget !== undefined) {
      // If the simvar is telling the target instrument, use it as discriminator:
      return controlPadTarget === this.targetDisplay;
    } else {
      // we return true only for the MFD if the simvar does not exist:
      return this.targetDisplay === ControlpadTargetInstrument.MFD;
    }
  }

  /**
   * Handler for all control pad input.
   * @param hEvent received hEvent.
   * @returns true if the event is handled
   */
  public handleControlPadEventInput(hEvent: string): boolean {
    let isHandled = false;

    if (this.controlKnobEvents.includes(hEvent) && this.controlpadState.get() !== GenericControlpadHandlingStates.comInputArmed) {
      this.scheduleDefaultStateFallback();
      return true;
    }

    // We only continue, if the event is coming from controlpad:
    if (ControlpadInputController.controlPadEventMap.has(hEvent)) {
      // For the frequency and transponder input, we need a state event machine here:
      switch (this.controlpadState.get()) {
        case GenericControlpadHandlingStates.comInputArmed:
          isHandled = this.handleComInputArmedState(hEvent);
          break;

        case GenericControlpadHandlingStates.comInputStarted:
          isHandled = this.handleComInputStartedState(hEvent);
          this.scheduleDefaultStateFallback();
          break;

        case GenericControlpadHandlingStates.navInputArmed:
          isHandled = this.handleNavInputArmedState(hEvent);
          this.scheduleDefaultStateFallback();
          break;

        case GenericControlpadHandlingStates.navInputStarted:
          isHandled = this.handleNavInputStartedState(hEvent);
          this.scheduleDefaultStateFallback();
          break;

        case GenericControlpadHandlingStates.xpdrInputArmed:
          // The XPDR is handled entirely in armed mode:
          isHandled = this.xpdrHandler.handleXpdrEntry(hEvent);
          if (isHandled) {
            this.scheduleDefaultStateFallback();
          } else {
            // Any unexpected event that isn't changing to another mode causes the return to default mode com input armed:
            if (!['AS1000_CONTROL_PAD_NAV', 'AS1000_CONTROL_PAD_CRS'].includes(hEvent)) {
              this.controlpadState.set(GenericControlpadHandlingStates.comInputArmed);
              SimVar.SetSimVarValue('L:WT1000_ControlPad_Mode', SimVarValueType.Enum, 0);
            }
          }
          break;

        case GenericControlpadHandlingStates.crsInputArmed:
          break;
      }

      // If the event is not yet handled, we run the generic state determination:
      if (!isHandled) {
        isHandled = this.genericNewStateDetermination(hEvent);
      }

      // If the event is still not yet handled, we consider the event as handled, if the current instrument
      // is not target for control pad input. This will e.g. prevent the PFD to receive control pad events, if
      // the MFD is target instrument:
      if (!isHandled) {
        isHandled = this.isControlpadTargetInstrument() === false;
      }

    }
    return isHandled;
  }

  /**
   * Check for state changing events, which are state agnostic
   * @param hEvent H event as string
   * @returns if event was handled
   */
  private genericNewStateDetermination(hEvent: string): boolean {
    let isHandled = false;
    // Don't allow any other mode activation while generic handling is inhibited:
    if (this.controlpadState.get() !== GenericControlpadHandlingStates.genericHandlingInhibited) {
      switch (hEvent) {
        case 'AS1000_CONTROL_PAD_COM':
          this.controlpadState.set(GenericControlpadHandlingStates.comInputArmed);
          this.stateFallbackTimer.clear();
          isHandled = true;
          break;
        case 'AS1000_CONTROL_PAD_NAV':
          this.controlpadState.set(GenericControlpadHandlingStates.navInputArmed);
          this.scheduleDefaultStateFallback();
          isHandled = true;
          break;
        case 'AS1000_CONTROL_PAD_XPDR':
          this.controlpadState.set(GenericControlpadHandlingStates.xpdrInputArmed);
          this.scheduleDefaultStateFallback();
          this.xpdrHandler.startXpdrEntry();
          isHandled = true;
          break;
        case 'AS1000_CONTROL_PAD_CRS':
          this.controlpadState.set(GenericControlpadHandlingStates.crsInputArmed);
          if (this.targetDisplay === ControlpadTargetInstrument.PFD) {
            this.scheduleDefaultStateFallback();
            isHandled = true;
          }
          break;
      }
    }
    return isHandled;
  }

  /**
   * Handle comInputArmed state.
   *
   * @param hEvent H event as string
   * @returns if event was handled
   */
  private handleComInputArmedState(hEvent: string): boolean {
    let isHandled = false;
    // Check for the event(s) that trigger the comInputStarted state:
    if ((this.targetDisplay === ControlpadTargetInstrument.PFD) && (hEvent === 'AS1000_CONTROL_PAD_1')) {
      // As the first digit of a COM frequency always is a '1', checking for that is enough!
      if (this.comRadio?.onInteractionEvent(FmsHEvent.D1)) {
        isHandled = true;
      }
    }
    if (isHandled) { this.controlpadState.set(GenericControlpadHandlingStates.comInputStarted); }
    return isHandled;
  }

  /**
   * Handle comInputStarted state.
   *
   * @param hEvent H event as string
   * @returns if event was handled
   */
  private handleComInputStartedState(hEvent: string): boolean {
    let isHandled = false;
    const evt = ControlpadInputController.controlPadEventMap.get(hEvent);
    if (evt !== undefined) {
      isHandled = this.comRadio?.onInteractionEvent(evt) ?? false;
      if (isHandled === false) {
        // If event was not handled, fall back to default mode:
        this.controlpadState.set(GenericControlpadHandlingStates.comInputArmed);
      }
    }
    return isHandled;
  }

  /**
   * Handle navInputArmed state.
   *
   * @param hEvent H event as string
   * @returns if event was handled
   */
  private handleNavInputArmedState(hEvent: string): boolean {
    let isHandled = false;
    // Check for the event(s) that trigger the navInputStarted state:
    if ((this.targetDisplay === ControlpadTargetInstrument.MFD) && (hEvent === 'AS1000_CONTROL_PAD_1')) {
      // As the first digit of a NAV frequency always is a '1', checking for that is enough!
      if (this.navRadio !== undefined) {
        if (this.navRadio.onInteractionEvent(FmsHEvent.D1)) {
          isHandled = true;
        }
      }
    }
    if (isHandled) { this.controlpadState.set(GenericControlpadHandlingStates.navInputStarted); }
    return isHandled;
  }

  /**
   * Handle navInputStarted state.
   *
   * @param hEvent H event as string
   * @returns if event was handled
   */
  private handleNavInputStartedState(hEvent: string): boolean {
    let isHandled = false;
    const evt = ControlpadInputController.controlPadEventMap.get(hEvent);
    if (evt !== undefined) {
      isHandled = this.navRadio?.onInteractionEvent(evt) ?? false;
      if (isHandled === false) {
        // If event was not handled, fall back to default mode:
        this.controlpadState.set(GenericControlpadHandlingStates.navInputArmed);
      }
    }
    return isHandled;
  }

  /**
   * This method schedules a 10 second period, after which a fallback to the default generic handling state occurs (comInputArmed).
   */
  private scheduleDefaultStateFallback(): void {
    this.stateFallbackTimer.schedule(() => {
      // Clean up where ever we stand:
      switch (this.controlpadState.get()) {
        case GenericControlpadHandlingStates.comInputStarted:
          this.comRadio?.onInteractionEvent(FmsHEvent.CLR);
          break;
        case GenericControlpadHandlingStates.navInputStarted:
          this.navRadio?.onInteractionEvent(FmsHEvent.CLR);
          break;
        case GenericControlpadHandlingStates.xpdrInputArmed:
          this.xpdrHandler.handleXpdrEntry('AS1000_CONTROL_PAD_CLR');
          break;
      }
      this.controlpadState.set(GenericControlpadHandlingStates.comInputArmed);
      SimVar.SetSimVarValue('L:WT1000_ControlPad_Mode', SimVarValueType.Enum, 0);
    }, 10000);
  }

  /** Handle changes in control pad state and arm the appropriate radio box.
   * @param controlpadState the state of the control pad
   */
  private armRadio(controlpadState: GenericControlpadHandlingStates): void {
    switch (controlpadState) {
      case GenericControlpadHandlingStates.comInputArmed:
      case GenericControlpadHandlingStates.comInputStarted:
        if (this.targetDisplay === ControlpadTargetInstrument.PFD) { this.comRadio?.setArmed(true); }
        if (this.targetDisplay === ControlpadTargetInstrument.MFD) { this.navRadio?.setArmed(false); }
        break;
      case GenericControlpadHandlingStates.navInputArmed:
      case GenericControlpadHandlingStates.navInputStarted:
        if (this.targetDisplay === ControlpadTargetInstrument.PFD) { this.comRadio?.setArmed(false); }
        if (this.targetDisplay === ControlpadTargetInstrument.MFD) { this.navRadio?.setArmed(true); }
        break;
      default:
        if (this.targetDisplay === ControlpadTargetInstrument.PFD) { this.comRadio?.setArmed(false); }
        if (this.targetDisplay === ControlpadTargetInstrument.MFD) { this.navRadio?.setArmed(false); }
    }
  }
}
