import {
  Accessible, AccessibleUtils, EventBus, KeyEventData, KeyEventManager, KeyEvents, MathUtils, SimVarValueType,
  Subscription, UnitType
} from '@microsoft/msfs-sdk';

/**
 * Information describing an altimeter managed by {@link AltimeterBaroKeyEventHandler}.
 */
export type AltimeterBaroInfo = {
  /** The index of the altimeter. */
  index: number;

  /** Whether the altimeter supports baro preselect. */
  supportBaroPreselect: boolean;

  /** Whether the altimeter's baro setting is in metric units. */
  isBaroMetric: boolean | Accessible<boolean>;
};

/**
 * Information describing a managed altimeter, for internal use by {@link AltimeterBaroKeyEventHandler}.
 */
type AltimeterBaroInfoInternal = Omit<AltimeterBaroInfo, 'isBaroMetric'> & {
  /** The altimeter's baro setting simvar. */
  settingSimVar: string;

  /** The altimeter's STD BARO mode simvar. */
  stdSimVar: string;

  /** The altimeter's baro preselect setting simvar. */
  preselectSimVar: string;

  /** Whether the altimeter's baro setting is in metric units. */
  isBaroMetric: Accessible<boolean>;
};

/**
 * A handler for altimeter barometric setting key events.
 */
export class AltimeterBaroKeyEventHandler {
  private static readonly HPA_TO_RAW_KOHLSMAN = 16;
  private static readonly IN_HG_TO_RAW_KOHLSMAN = UnitType.IN_HG.convertTo(1, UnitType.HPA) * AltimeterBaroKeyEventHandler.HPA_TO_RAW_KOHLSMAN;

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
   * Creates a new instance of AltimeterBaroKeyEventHandler.
   * @param bus The event bus.
   * @param managedAltimeterInfos Information describing the altimeters to be managed by the handler.
   */
  public constructor(
    private readonly bus: EventBus,
    managedAltimeterInfos: Iterable<Readonly<AltimeterBaroInfo>>,
  ) {
    this.managedAltimeterInfos = Array.from(managedAltimeterInfos, info => {
      return {
        index: info.index,
        supportBaroPreselect: info.supportBaroPreselect,
        isBaroMetric: AccessibleUtils.toAccessible(info.isBaroMetric, true),
        settingSimVar: `KOHLSMAN SETTING MB:${info.index}`,
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
        const newValue = this.changeBaroSettingValue(
          SimVar.GetSimVarValue(info.preselectSimVar, SimVarValueType.Number),
          direction,
          info.isBaroMetric.get()
        );
        SimVar.SetSimVarValue(info.preselectSimVar, SimVarValueType.Number, newValue);
        return;
      } else {
        SimVar.SetSimVarValue(info.stdSimVar, SimVarValueType.Bool, 0);
      }
    }

    const newValue = this.changeBaroSettingValue(
      SimVar.GetSimVarValue(info.settingSimVar, SimVarValueType.MB) * AltimeterBaroKeyEventHandler.HPA_TO_RAW_KOHLSMAN,
      direction,
      info.isBaroMetric.get()
    );
    this.keyEventManager!.triggerKey('KOHLSMAN_SET', true, newValue, info.index);
  }

  /**
   * Increments or decrements a baro setting value for an altimeter.
   * @param currentValue The baro setting value to change, in raw units.
   * @param direction The direction in which to change the baro setting value.
   * @param isMetric Whether to change the baro setting value in increments of hectopascals instead of hundredths of an
   * inch of mercury.
   * @returns The changed baro setting value, in raw units.
   */
  private changeBaroSettingValue(currentValue: number, direction: 1 | -1, isMetric: boolean): number {
    const conversionFactor = isMetric
      ? AltimeterBaroKeyEventHandler.HPA_TO_RAW_KOHLSMAN
      : AltimeterBaroKeyEventHandler.IN_HG_TO_RAW_KOHLSMAN / 100;

    const currentValueInIncrements = Math.round(currentValue / conversionFactor);
    const newValueInIncrements = currentValueInIncrements + direction;

    return MathUtils.clamp(
      Math.round(newValueInIncrements * conversionFactor),
      AltimeterBaroKeyEventHandler.MIN_RAW,
      AltimeterBaroKeyEventHandler.MAX_RAW
    );
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
      const currentPressure = SimVar.GetSimVarValue(info.settingSimVar, SimVarValueType.MB);
      SimVar.SetSimVarValue(info.preselectSimVar, SimVarValueType.Number, currentPressure * AltimeterBaroKeyEventHandler.HPA_TO_RAW_KOHLSMAN);
      SimVar.SetSimVarValue(info.stdSimVar, SimVarValueType.Bool, 1);
      this.keyEventManager!.triggerKey('KOHLSMAN_SET', true, Math.round(1013.25 * AltimeterBaroKeyEventHandler.HPA_TO_RAW_KOHLSMAN), info.index);
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

    const baroToSetHpa = altitude >= 18000
      ? 1013.25
      : SimVar.GetSimVarValue('SEA LEVEL PRESSURE', SimVarValueType.HPA);

    for (const info of this.managedAltimeterInfos) {
      const isStd = SimVar.GetSimVarValue(info.stdSimVar, SimVarValueType.Bool) !== 0;

      // If STD BARO is active, we need to reconcile some state.
      if (isStd) {
        // If the altimeter supports baro preselect, change the preselected baro instead of the actual baro setting (we
        // also need to reset the baro setting to 29.92/1013.25 since the BAROMETRIC key event we passed through will
        // change it). Otherwise, deactivate STD BARO and allow the passed-through BAROMETRIC key event to change the
        // baro setting.
        if (info.supportBaroPreselect) {
          SimVar.SetSimVarValue(info.preselectSimVar, SimVarValueType.Number, Math.round(baroToSetHpa * AltimeterBaroKeyEventHandler.HPA_TO_RAW_KOHLSMAN));
          this.keyEventManager!.triggerKey('KOHLSMAN_SET', true, Math.round(1013.25 * AltimeterBaroKeyEventHandler.HPA_TO_RAW_KOHLSMAN), info.index);
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
