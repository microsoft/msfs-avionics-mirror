import {
  AntiIceEvents, ClockEvents, ConsumerSubject, DebounceTimer, EventBus, HEvent, KeyEventData,
  KeyEventManager, KeyEvents, MappedSubject, MathUtils, SimVarValueType, Subject, Subscribable, WeightBalanceEvents,
} from '@microsoft/msfs-sdk';
import { Sr22tSimvarEvents } from '../../MFD/Sr22tSimvarPublisher/Sr22tSimvarPublisher';

/** Simvars to publish. */
export enum Sr22tAntiIceCalculatorSimVars {
  TKSFluidQtyLeft = 'L:WT1000_TKS_QtyLeft',        // Gallons
  TKSFluidQtyRight = 'L:WT1000_TKS_QtyRight',      // Gallons
  CurrentMode = 'L:WT1000_TKS_CurrentMode',        // 0: off, 1: normal, 2: high, 3: max
  CurrentTKSFluidFlow = 'L:WT1000_TKS_CurrentFlow', // Gallons per hour
  SimTksWeight = 'PAYLOAD STATION WEIGHT:7'
}

export enum Sr22tAntiIceModes {
  Off,
  Normal,
  High,
  Max
}

export enum Sr22tAntiIceTankMode {
  Auto,
  Left,
  Right
}

/** Calculator, that runs the consumption simulation of the anti ice fluids in the SR22T */
export class Sr22tAntiIceCalculator {
  /** lbs per gallon, src: https://wikiwings.com/what-is-the-cost-for-tks-fluid-and-how-much-does-it-weigh/ */
  private static readonly TKS_FLUID_WEIGHT = 9.125;

  private readonly sub = this.bus.getSubscriber<ClockEvents & HEvent & AntiIceEvents & Sr22tSimvarEvents & WeightBalanceEvents>();
  private readonly simTime = ConsumerSubject.create(this.sub.on('simTime').whenChangedBy(1000), null);

  private readonly _tankMode = ConsumerSubject.create(this.sub.on('anti_ice_tank_mode'), Sr22tAntiIceTankMode.Auto);
  public readonly tankMode = this._tankMode as Subscribable<Sr22tAntiIceTankMode>;

  // Local TKS switch states
  private tksSwitches = {
    master: Subject.create(false),
    mode: Subject.create(Sr22tAntiIceModes.Normal),
  };

  private operatingMode = Sr22tAntiIceModes.Off;
  private previousMode = Sr22tAntiIceModes.Off;

  private readonly currentUsableQtyLeft = ConsumerSubject.create(this.sub.on('anti_ice_fluid_qty_left').whenChanged(), 2.6);      // Gallons
  private readonly currentUsableQtyRight = ConsumerSubject.create(this.sub.on('anti_ice_fluid_qty_right').whenChanged(), 2.6);    // Gallons
  private readonly currentUsableQtyTotal = MappedSubject.create(([left, right]) => left + right, this.currentUsableQtyLeft, this.currentUsableQtyRight);

  private readonly _currentTank = MappedSubject.create(
    ([mode, left, right]) => {
      switch (mode) {
        case Sr22tAntiIceTankMode.Left:
        case Sr22tAntiIceTankMode.Right:
          return mode;
        case Sr22tAntiIceTankMode.Auto:
          if (Math.abs(left - right) > 0.25) {
            return left >= right ? Sr22tAntiIceTankMode.Left : Sr22tAntiIceTankMode.Right;
          }

          return mode;
        default:
          return mode;
      }
    },
    this._tankMode,
    this.currentUsableQtyLeft,
    this.currentUsableQtyRight
  );
  public readonly currentTank = this._currentTank as Subscribable<Sr22tAntiIceTankMode>;

  private currentAirframeFlow = 0;
  private currentModeActivationTime = this.simTime.get() ?? 0;
  private previousTimestamp?: number;

  private readonly simStructuralDeiceState = ConsumerSubject.create(this.sub.on('anti_ice_structural_switch_on'), null);
  private keyEventManager?: KeyEventManager;

  private windshieldDeiceActive = false;
  private readonly windshieldDeiceTimer = new DebounceTimer();

  /**
   * Constructor
   * @param bus Eventbus
   */
  constructor(private readonly bus: EventBus) {
    // For intercepting anti-ice related key events
    KeyEventManager.getManager(bus).then(manager => {
      this.keyEventManager = manager;
      this.setupKeyIntercepts(manager);
    });

    // Initialize in off mode
    this.setOperatingMode(Sr22tAntiIceModes.Off);

    // Sync initial value from the sim weight
    const initialTksGallons = SimVar.GetSimVarValue(Sr22tAntiIceCalculatorSimVars.SimTksWeight, SimVarValueType.Pounds) / Sr22tAntiIceCalculator.TKS_FLUID_WEIGHT;
    const usableGallonsPerTank = (initialTksGallons / 2) - 0.25;
    SimVar.SetSimVarValue(Sr22tAntiIceCalculatorSimVars.TKSFluidQtyLeft, SimVarValueType.GAL, usableGallonsPerTank);
    SimVar.SetSimVarValue(Sr22tAntiIceCalculatorSimVars.TKSFluidQtyRight, SimVarValueType.GAL, usableGallonsPerTank);

    // Time based processing (every 3 seconds):
    this.simTime.sub(this.updateAntiIceFluidQty.bind(this), false);

    // Listen to the H events coming from the switches to set the local switch states
    this.sub.on('hEvent').handle(this.handleInteractionEvent.bind(this));

    MappedSubject.create(this.tksSwitches.master, this.tksSwitches.mode).sub(([master, mode]) => {
      if (master) {
        if (this.operatingMode !== Sr22tAntiIceModes.Max) {
          this.setOperatingMode(mode);
        }
      } else {
        this.setOperatingMode(Sr22tAntiIceModes.Off);
      }
    }, true);

    this.currentUsableQtyTotal.sub(v => {
      // update TKS Fluid weight in sim - adding the 0.5 gallons unusable fluid
      SimVar.SetSimVarValue(Sr22tAntiIceCalculatorSimVars.SimTksWeight, SimVarValueType.Pounds, (v + 0.5) * Sr22tAntiIceCalculator.TKS_FLUID_WEIGHT);
    }, false);
  }

  /**
   * Sets up this system's key event intercepts.
   * @param manager The key event manager.
   */
  private setupKeyIntercepts(manager: KeyEventManager): void {

    // ANTI_ICE_SET and ANTI_ICE_TOGGLE trigger ANTI_ICE_ON and ANTI_ICE_OFF.
    // ANTI_ICE_ON and ANTI_ICE_OFF trigger TOGGLE_STRUCTURAL_DEICE.
    // Therefore, TOGGLE_STRUCTURAL_DEICE is the only key event that needs
    // to be intercepted in order to control the sate of STRUCTURAL DEICE SWITCH.
    manager.interceptKey('TOGGLE_STRUCTURAL_DEICE', false);
    manager.interceptKey('WINDSHIELD_DEICE_ON', false);
    manager.interceptKey('WINDSHIELD_DEICE_OFF', false);
    manager.interceptKey('WINDSHIELD_DEICE_TOGGLE', false);
    manager.interceptKey('WINDSHIELD_DEICE_SET', false);

    this.bus.getSubscriber<KeyEvents>().on('key_intercept').handle(this.onKeyIntercepted.bind(this));
  }

  /**
   * Handles an interaction HEvent.
   * @param event The event to handle.
   */
  private handleInteractionEvent(event: string): void {
    switch (event) {
      case 'WT_SR22T_Deice_Master_On':
        this.tksSwitches.master.set(true);
        break;
      case 'WT_SR22T_Deice_Master_Off':
        this.tksSwitches.master.set(false);
        break;
      case 'WT_SR22T_Deice_Set_Mode_Norm':
        this.tksSwitches.mode.set(Sr22tAntiIceModes.Normal);
        break;
      case 'WT_SR22T_Deice_Set_Mode_High':
        this.tksSwitches.mode.set(Sr22tAntiIceModes.High);
        break;
      case 'WT_SR22T_Deice_Set_Mode_Max':
        if (this.tksSwitches.master.get()) {
          this.setOperatingMode(Sr22tAntiIceModes.Max);
        }
        break;
      case 'WT_SR22T_Deice_Windshield':
        this.triggerWindshieldDeice();
        break;
    }
  }

  /**
   * Responds to when a key event is intercepted.
   * @param data The intercepted key event data.
   */
  private onKeyIntercepted(data: KeyEventData): void {
    let newState: boolean;
    switch (data.key) {
      case 'TOGGLE_STRUCTURAL_DEICE':
        // define new switch state
        newState = !this.tksSwitches.master.get();
        // set local switch state
        this.tksSwitches.master.set(newState);
        // set virtual cokpit switch state
        SimVar.SetSimVarValue('L:XMLVAR_DEICE_MASTER', SimVarValueType.Bool, newState);
        break;
      case 'WINDSHIELD_DEICE_ON':
        this.triggerWindshieldDeice();
        break;
      case 'WINDSHIELD_DEICE_TOGGLE':
        this.triggerWindshieldDeice();
        break;
      case 'WINDSHIELD_DEICE_SET':
        data.value0 && this.triggerWindshieldDeice();
        break;
    }
  }

  /**
   * Update the TKS fluid quantity in the sim
   * @param simTime The current sim time
   */
  private updateAntiIceFluidQty(simTime: number | null): void {
    if (!this.previousTimestamp) {
      this.previousTimestamp = simTime ?? 0;
      return;
    }

    const currentSimTksFluidUsableGallons =
      (SimVar.GetSimVarValue(Sr22tAntiIceCalculatorSimVars.SimTksWeight, SimVarValueType.Pounds) / Sr22tAntiIceCalculator.TKS_FLUID_WEIGHT) - 0.5;
    // if the discrepancy between sim tks amount and our calculated amount is greater than 0.8 pound (0.087 gallon)
    // update our value since it's probably been changed in the sim by the user
    if (Math.abs(this.currentUsableQtyTotal.get() - currentSimTksFluidUsableGallons) > 0.087) {
      SimVar.SetSimVarValue(Sr22tAntiIceCalculatorSimVars.TKSFluidQtyLeft, SimVarValueType.GAL, MathUtils.clamp(currentSimTksFluidUsableGallons / 2, 0, 4));
      SimVar.SetSimVarValue(Sr22tAntiIceCalculatorSimVars.TKSFluidQtyRight, SimVarValueType.GAL, MathUtils.clamp(currentSimTksFluidUsableGallons / 2, 0, 4));
      // limit the payload station weight to 8.5 gallons total (8 gallons usable) - overfilled tanks will be drained
      if (currentSimTksFluidUsableGallons > 8) {
        SimVar.SetSimVarValue(Sr22tAntiIceCalculatorSimVars.SimTksWeight, SimVarValueType.Pounds, 8.5 * Sr22tAntiIceCalculator.TKS_FLUID_WEIGHT);
      }
      return;
    }

    if (simTime !== null) {
      if ((this.operatingMode === Sr22tAntiIceModes.Max) && ((simTime - this.currentModeActivationTime) > 120000)) {
        // Fallback from MAX to the previously active mode at latest after 120s:
        this.setOperatingMode(this.previousMode);
      }

      // Calculate the elapsed hours since the last update, and prevent negative values:
      const elapsedHoursSincePreviousTimestamp = Math.max(0, (simTime - this.previousTimestamp) / (1000 * 60 * 60));
      this.previousTimestamp = simTime;

      // Calculate the current flow rate also accounting for the windshield deice system:
      const flow = this.currentAirframeFlow + (this.windshieldDeiceActive ? 1.0 : 0.0);

      // Update the flow rate in the simvar
      SimVar.SetSimVarValue(Sr22tAntiIceCalculatorSimVars.CurrentTKSFluidFlow, SimVarValueType.GPH, flow);

      // AUTO TANK MODE - when the tanks are balanced, use fluid from both tanks equally
      if (this._currentTank.get() === Sr22tAntiIceTankMode.Auto) {
        const burntFuelHalf = elapsedHoursSincePreviousTimestamp * (flow / 2);
        const currentQtyLeft = this.currentUsableQtyLeft.get() - burntFuelHalf;
        const currentQtyRight = this.currentUsableQtyRight.get() - burntFuelHalf;
        SimVar.SetSimVarValue(Sr22tAntiIceCalculatorSimVars.TKSFluidQtyLeft, SimVarValueType.GAL, currentQtyLeft >= 0 ? currentQtyLeft : 0);
        SimVar.SetSimVarValue(Sr22tAntiIceCalculatorSimVars.TKSFluidQtyRight, SimVarValueType.GAL, currentQtyRight >= 0 ? currentQtyRight : 0);
        return;
      }

      // LEFT or RIGHT TANK MODE - use fluid from the selected tank,
      // or if the tanks are unbalanced in AUTO mode, use fluid from the tank with more fluid
      const currentTankUsableQty = ((): number => {
        switch (this._currentTank.get()) {
          case Sr22tAntiIceTankMode.Left:
            return this.currentUsableQtyLeft.get();
          case Sr22tAntiIceTankMode.Right:
            return this.currentUsableQtyRight.get();
          // this default case should never happen.
          default:
            return this.currentUsableQtyTotal.get();
        }
      })();

      let currentQty = currentTankUsableQty - elapsedHoursSincePreviousTimestamp * flow;

      // Prevent overconsumption
      if (currentQty < 0) { currentQty = 0; }

      // Prevent overfill
      if (currentQty > 4) { currentQty = 4; }

      // Turn off system if out of usable fluid and not already off
      if (this.currentUsableQtyTotal.get() <= 0 && this.operatingMode !== Sr22tAntiIceModes.Off) {
        this.setOperatingMode(Sr22tAntiIceModes.Off);
      }

      if (this._currentTank.get() === Sr22tAntiIceTankMode.Left) {
        SimVar.SetSimVarValue(Sr22tAntiIceCalculatorSimVars.TKSFluidQtyLeft, SimVarValueType.GAL, currentQty);
      }

      if (this._currentTank.get() === Sr22tAntiIceTankMode.Right) {
        SimVar.SetSimVarValue(Sr22tAntiIceCalculatorSimVars.TKSFluidQtyRight, SimVarValueType.GAL, currentQty);
      }
    }
  }

  /**
   * Set the actual TKS operating mode
   * @param newMode Set the new mode of the TKS system.
   */
  private setOperatingMode(newMode: Sr22tAntiIceModes): void {

    // Prevent system from turning on when out of useable TKS fluid
    if (this.currentUsableQtyTotal.get() <= 0) {
      newMode = Sr22tAntiIceModes.Off;
    }

    this.previousMode = this.operatingMode;
    this.operatingMode = newMode;

    switch (this.operatingMode) {
      case Sr22tAntiIceModes.Off:
        this.currentAirframeFlow = 0.0;
        // Turn off sim deice
        if (this.simStructuralDeiceState.get() === true) {
          this.keyEventManager?.triggerKey('TOGGLE_STRUCTURAL_DEICE', true);
        }
        break;
      case Sr22tAntiIceModes.Normal:
        this.currentAirframeFlow = 3.2;
        // Turn on sim deice
        if (this.simStructuralDeiceState.get() === false) {
          this.keyEventManager?.triggerKey('TOGGLE_STRUCTURAL_DEICE', true);
        }
        break;
      case Sr22tAntiIceModes.High:
        this.currentAirframeFlow = 6.4;
        // Turn on sim deice
        if (this.simStructuralDeiceState.get() === false) {
          this.keyEventManager?.triggerKey('TOGGLE_STRUCTURAL_DEICE', true);
        }
        break;
      case Sr22tAntiIceModes.Max:
        this.currentAirframeFlow = 12.8;
        // Turn on sim deice
        if (this.simStructuralDeiceState.get() === false) {
          this.keyEventManager?.triggerKey('TOGGLE_STRUCTURAL_DEICE', true);
        }
        break;
    }

    // Store the current time and qty for an easy and precise calculation of the consumption:
    this.currentModeActivationTime = this.simTime.get() ?? 0;

    SimVar.SetSimVarValue(Sr22tAntiIceCalculatorSimVars.CurrentMode, SimVarValueType.Number, newMode.valueOf());
    SimVar.SetSimVarValue(Sr22tAntiIceCalculatorSimVars.CurrentTKSFluidFlow, SimVarValueType.GPH, this.currentAirframeFlow);
  }

  /**
   * Trigger windshield deice
   */
  private triggerWindshieldDeice(): void {
    if (this.currentUsableQtyTotal.get() > 0) {
      this.windshieldDeiceActive = true;
      this.keyEventManager?.triggerKey('WINDSHIELD_DEICE_ON', true);
      this.windshieldDeiceTimer.schedule(() => {
        this.windshieldDeiceActive = false;
        this.keyEventManager?.triggerKey('WINDSHIELD_DEICE_OFF', true);
      }, 3500);
    }
  }
}
