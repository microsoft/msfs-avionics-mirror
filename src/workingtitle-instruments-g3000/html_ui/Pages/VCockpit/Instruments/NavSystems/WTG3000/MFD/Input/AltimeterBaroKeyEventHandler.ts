/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EventBus, KeyEventData, KeyEventManager, KeyEvents, MathUtils, SimVarValueType, Subscription, UnitType } from '@microsoft/msfs-sdk';

/**
 * Information describing an altimeter managed by {@link AltimeterBaroKeyEventHandler}.
 */
export type AltimeterBaroInfo = {
  /** The index of the altimeter. */
  index: number;

  /** Whether the altimeter supports baro preselect. */
  supportBaroPreselect: boolean;
};

/**
 * Information describing a managed altimeter, for internal use by {@link AltimeterBaroKeyEventHandler}.
 */
type AltimeterBaroInfoInternal = AltimeterBaroInfo & {
  /** The altimeter's baro setting simvar. */
  settingSimVar: string;

  /** The altimeter's STD BARO mode simvar. */
  stdSimVar: string;

  /** The altimeter's baro preselect setting simvar. */
  preselectSimVar: string;
};

/**
 * A handler for altimeter barometric setting key events.
 */
export class AltimeterBaroKeyEventHandler {
  private static readonly IN_HG_TO_RAW_KOHLSMAN = UnitType.IN_HG.convertTo(1, UnitType.HPA) * 16;

  private static readonly INCREMENT_RAW = 5;
  private static readonly MIN_RAW = 15169;
  private static readonly MAX_RAW = 17344;

  private readonly managedAltimeterInfos: AltimeterBaroInfoInternal[];

  private keyEventManager?: KeyEventManager;

  private isAlive = true;
  private isInit = false;

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly keyEventManagerReadyPromises: { resolve: () => void, reject: (reason?: any) => void }[] = [];

  private keyEventSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param managedAltimeterInfos Information describing the altimeters to be managed by the handler.
   */
  public constructor(
    private readonly bus: EventBus,
    managedAltimeterInfos: Iterable<Readonly<AltimeterBaroInfo>>,
  ) {
    this.managedAltimeterInfos = Array.from(managedAltimeterInfos, info => {
      return {
        ...info,
        settingSimVar: `KOHLSMAN SETTING HG:${info.index}`,
        stdSimVar: `L:XMLVAR_Baro${info.index}_ForcedToSTD`,
        preselectSimVar: `L:XMLVAR_Baro${info.index}_SavedPressure`
      };
    }).filter((info, index, array) => array.findIndex(query => query.index === info.index) === index); // Filter out duplicate altimeters of the same index

    KeyEventManager.getManager(this.bus).then(manager => {
      this.keyEventManager = manager;
      while (this.isAlive && this.keyEventManagerReadyPromises.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.keyEventManagerReadyPromises.shift()!.resolve();
      }
    });
  }

  /**
   * Waits for this handler's key event manager to be ready.
   * @returns A Promise which will be fulfilled when this handler's key event manager is ready, or rejected if this
   * handler is destroyed before then.
   */
  private awaitKeyEventManagerReady(): Promise<void> {
    if (this.keyEventManager !== undefined) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => { this.keyEventManagerReadyPromises.push({ resolve, reject }); });
  }

  /**
   * Initializes this handler. Once this handler is initialized, it will change the baro setting for this handler's
   * PFD's altimeter in response to baro knob input events.
   * @returns A Promise which will be fulfilled when this handler is fully initialized, or rejected if this handler is
   * destroyed before then.
   */
  public async init(): Promise<void> {
    if (!this.isAlive) {
      throw new Error('AltimeterBaroKeyEventHandler: cannot initialize a dead handler');
    }

    await this.awaitKeyEventManagerReady();

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    // Publish baro setting to simvar so that the baro knob modelbehavior can set its tooltip.

    this.keyEventManager!.interceptKey('KOHLSMAN_SET', false);
    this.keyEventManager!.interceptKey('KOHLSMAN_INC', false);
    this.keyEventManager!.interceptKey('KOHLSMAN_DEC', false);
    this.keyEventManager!.interceptKey('BAROMETRIC_STD_PRESSURE', false);
    this.keyEventManager!.interceptKey('BAROMETRIC', false);

    this.keyEventSub = this.bus.getSubscriber<KeyEvents>().on('key_intercept').handle(this.onKeyIntercepted.bind(this));
  }

  /**
   * Gets information on a managed altimeter.
   * @param index The index of the altimeter.
   * @returns Information on the specified managed altimeter, or `undefined` if the altimeter is not managed by this
   * handler.
   */
  private getInfo(index: number): AltimeterBaroInfoInternal | undefined {
    return this.managedAltimeterInfos.find(info => info.index === index);
  }

  /**
   * Handles a key event intercept.
   * @param data Data describing the intercepted key event.
   */
  private onKeyIntercepted(data: KeyEventData): void {
    switch (data.key) {
      case 'KOHLSMAN_SET': {
        if (data.value0 !== undefined) {
          const info = this.getInfo(data.value1 ?? 0);
          if (info) {
            this.setBaroSetting(info, data.value0);
            return;
          }
        }

        this.keyEventManager!.triggerKey(data.key, true, data.value0, data.value1);
        break;
      }
      case 'KOHLSMAN_INC': {
        const info = this.getInfo(data.value0 ?? 0);
        if (info) {
          this.changeBaroSetting(info, 1);
          return;
        }

        this.keyEventManager!.triggerKey(data.key, true, data.value0);
        break;
      }
      case 'KOHLSMAN_DEC': {
        const info = this.getInfo(data.value0 ?? 0);
        if (info) {
          this.changeBaroSetting(info, -1);
          return;
        }

        this.keyEventManager!.triggerKey(data.key, true, data.value0);
        break;
      }
      case 'BAROMETRIC_STD_PRESSURE': {
        const info = this.getInfo(data.value0 ?? 0);
        if (info) {
          this.toggleBaroStd(info);
          return;
        }

        this.keyEventManager!.triggerKey(data.key, true, data.value0);
        break;
      }
      case 'BAROMETRIC': {
        this.handleBarometric();
        break;
      }
    }
  }

  /**
   * Sets the baro setting for an altimeter. If STD BARO mode is currently on and baro preselect is supported, the
   * preselected baro setting will be changed instead of the active baro setting. If STD BARO mode is currently on
   * and baro preselect is not supported, STD BARO will be deactivated and the active baro setting will be
   * changed.
   * @param info Information on the altimeter to modify.
   * @param value The value to set, in units of raw baro setting pressure (equal to 1/16 hPa).
   */
  private setBaroSetting(info: AltimeterBaroInfoInternal, value: number): void {
    value = MathUtils.clamp(value, AltimeterBaroKeyEventHandler.MIN_RAW, AltimeterBaroKeyEventHandler.MAX_RAW);

    const isStd = SimVar.GetSimVarValue(info.stdSimVar, SimVarValueType.Bool) !== 0;

    if (isStd) {
      if (info.supportBaroPreselect) {
        SimVar.SetSimVarValue(info.preselectSimVar, SimVarValueType.Number, value);
        return;
      } else {
        SimVar.SetSimVarValue(info.stdSimVar, SimVarValueType.Bool, 0);
      }
    }

    this.keyEventManager!.triggerKey('KOHLSMAN_SET', true, value, info.index);
  }

  /**
   * Increments or decrements the baro setting for an altimeter. If STD BARO mode is currently on and baro preselect
   * is supported, the preselected baro setting will be changed instead of the active baro setting. If STD BARO mode
   * is currently on and baro preselect is not supported, STD BARO will be deactivated and the active baro setting will
   * be changed.
   * @param info Information on the altimeter to modify.
   * @param direction The direction to change the baro setting.
   */
  private changeBaroSetting(info: AltimeterBaroInfoInternal, direction: 1 | -1): void {
    const isStd = SimVar.GetSimVarValue(info.stdSimVar, SimVarValueType.Bool) !== 0;

    if (isStd) {
      if (info.supportBaroPreselect) {
        const currentVal = SimVar.GetSimVarValue(info.preselectSimVar, SimVarValueType.Number);
        const newVal = MathUtils.clamp(
          currentVal + AltimeterBaroKeyEventHandler.INCREMENT_RAW * direction,
          AltimeterBaroKeyEventHandler.MIN_RAW,
          AltimeterBaroKeyEventHandler.MAX_RAW
        );
        SimVar.SetSimVarValue(info.preselectSimVar, SimVarValueType.Number, newVal);
        return;
      } else {
        SimVar.SetSimVarValue(info.stdSimVar, SimVarValueType.Bool, 0);
      }
    }

    this.keyEventManager!.triggerKey(`KOHLSMAN_${direction === 1 ? 'INC' : 'DEC'}`, true, info.index);
  }

  /**
   * Toggles STD BARO mode for an altimeter. If STD BARO is currently off, this will turn on STD BARO mode, set the
   * preselected baro setting to the current active baro setting, and set the active baro setting to 29.92 inches
   * (1013 hPa). If STD BARO is currently on, this will turn off STD BARO mode and set the active baro setting to the
   * current preselected baro setting.
   * @param info Information on the altimeter to modify.
   */
  private toggleBaroStd(info: AltimeterBaroInfoInternal): void {
    const isStd = SimVar.GetSimVarValue(info.stdSimVar, SimVarValueType.Bool) !== 0;

    if (isStd) {
      const preselect = SimVar.GetSimVarValue(info.preselectSimVar, SimVarValueType.Number);
      SimVar.SetSimVarValue(info.stdSimVar, SimVarValueType.Bool, 0);
      this.keyEventManager!.triggerKey('KOHLSMAN_SET', true, Math.round(preselect), info.index);
    } else {
      const currentPressure = SimVar.GetSimVarValue(info.settingSimVar, SimVarValueType.InHG);
      SimVar.SetSimVarValue(info.preselectSimVar, SimVarValueType.Number, currentPressure * AltimeterBaroKeyEventHandler.IN_HG_TO_RAW_KOHLSMAN);
      SimVar.SetSimVarValue(info.stdSimVar, SimVarValueType.Bool, 1);
      this.keyEventManager!.triggerKey('KOHLSMAN_SET', true, Math.round(29.92 * AltimeterBaroKeyEventHandler.IN_HG_TO_RAW_KOHLSMAN), info.index);
    }
  }

  /**
   * Handles the `BAROMETRIC` key event. For each managed altimeter, if STD BARO mode is currently on and baro
   * preselect is supported, then the preselected baro setting will be changed instead of the active baro setting.
   * If STD BARO mode is currently on and baro preselect is not supported, STD BARO will be deactivated and the active
   * baro setting will be changed.
   */
  private handleBarometric(): void {
    // Pass through the key event into the sim so that any altimeters that aren't managed by us are correctly modified.
    // The reason we do it here instead of having the intercept set up to pass through automatically is so that in case
    // we need to reset the baro setting for STD BARO mode below, we don't get a frame where the baro setting changes.
    this.keyEventManager!.triggerKey('BAROMETRIC', true);

    const altitude = SimVar.GetSimVarValue('PRESSURE ALTITUDE', SimVarValueType.Feet);

    const baroToSetInHg = altitude >= 18000
      ? 29.92
      : SimVar.GetSimVarValue('SEA LEVEL PRESSURE', SimVarValueType.InHG);

    for (const info of this.managedAltimeterInfos) {
      const isStd = SimVar.GetSimVarValue(info.stdSimVar, SimVarValueType.Bool) !== 0;

      // If STD BARO is active, we need to reconcile some state.
      if (isStd) {
        // If the altimeter supports baro preselect, change the preselected baro instead of the actual baro setting (we
        // also need to reset the baro setting to 29.92 since the BAROMETRIC key event we passed through will change
        // it). Otherwise, deactivate STD BARO and allow the passed-through BAROMETRIC key event to change the baro
        // setting.
        if (info.supportBaroPreselect) {
          SimVar.SetSimVarValue(info.preselectSimVar, SimVarValueType.Number, Math.round(baroToSetInHg * AltimeterBaroKeyEventHandler.IN_HG_TO_RAW_KOHLSMAN));
          this.keyEventManager!.triggerKey('KOHLSMAN_SET', true, Math.round(29.92 * AltimeterBaroKeyEventHandler.IN_HG_TO_RAW_KOHLSMAN), info.index);
        } else {
          SimVar.SetSimVarValue(info.stdSimVar, SimVarValueType.Bool, 0);
        }
      }
    }
  }

  /**
   * Destroys this handler.
   */
  public destroy(): void {
    this.isAlive = false;

    this.keyEventManagerReadyPromises.forEach(promise => { promise.reject('AltimeterBaroKeyEventHandler: handler was destroyed'); });

    this.keyEventSub?.destroy();
  }
}