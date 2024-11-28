/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EventBus, KeyEventData, KeyEventManager, KeyEvents, MathUtils, SimVarValueType, Subscription, UnitType } from '@microsoft/msfs-sdk';

import { DisplayUnitIndices } from '../InstrumentIndices';
import { Epic2PerformancePlan } from '../Performance/Epic2PerformancePlan';
import { BaroCorrectionUnit, PfdUserSettingManager } from '../Settings/PfdUserSettings';

/**
 * Information describing an altimeter managed by {@link AltimeterBaroKeyEventHandler}.
 */
export type AltimeterBaroInfo = {
  /** The index of the altimeter. */
  index: number;
  /** The index of the display unit the altimeter is associated with. */
  displayIndex?: DisplayUnitIndices;
};

/**
 * Information describing a managed altimeter, for internal use by {@link AltimeterBaroKeyEventHandler}.
 */
type AltimeterBaroInfoInternal = AltimeterBaroInfo & {
  /** The altimeter's baro setting simvar. */
  settingSimVar: string;

  /** The altimeter's STD BARO mode simvar. */
  stdSimVar: string;
};

/**
 * A handler for altimeter barometric setting key events.
 */
export class AltimeterBaroKeyEventHandler {
  private static readonly HPA_TO_RAW_KOHLSMAN = 16;
  private static readonly HPA_INCREMENT_KOHLSMAN = AltimeterBaroKeyEventHandler.HPA_TO_RAW_KOHLSMAN;
  private static readonly IN_HG_TO_RAW_KOHLSMAN = UnitType.IN_HG.convertTo(1, UnitType.HPA) * AltimeterBaroKeyEventHandler.HPA_TO_RAW_KOHLSMAN;
  private static readonly IN_HG_INCREMENT_KOHLSMAN = UnitType.IN_HG.convertTo(0.01, UnitType.HPA) * AltimeterBaroKeyEventHandler.HPA_TO_RAW_KOHLSMAN;
  private static readonly STD_KOHLSMAN = Math.round(29.92 * AltimeterBaroKeyEventHandler.IN_HG_TO_RAW_KOHLSMAN);

  // FIXME do not know the min/max for Primus
  private static readonly MIN_RAW = 15169;
  private static readonly MAX_RAW = 17344;

  private readonly managedAltimeterInfos: AltimeterBaroInfoInternal[];

  private keyEventManager?: KeyEventManager;

  private isAlive = true;
  private isInit = false;

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly keyEventManagerReadyPromises: { resolve: () => void, reject: (reason?: any) => void }[] = [];

  private baroUnitSub?: Subscription;
  private keyEventSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param managedAltimeterInfos Information describing the altimeters to be managed by the handler.
   * @param pfdSettings The PFD settings for this PFD.
   * @param activePerfPlan The active performance plan.
   */
  public constructor(
    private readonly bus: EventBus,
    managedAltimeterInfos: Iterable<Readonly<AltimeterBaroInfo>>,
    private readonly pfdSettings: PfdUserSettingManager,
    private readonly activePerfPlan: Epic2PerformancePlan,
  ) {
    this.managedAltimeterInfos = Array.from(managedAltimeterInfos, info => {
      return {
        ...info,
        settingSimVar: `KOHLSMAN SETTING HG:${info.index}`,
        stdSimVar: `L:XMLVAR_Baro${info.index}_ForcedToSTD`,
      };
    }).filter((info, index, array) => array.findIndex(query => query.index === info.index) === index); // Filter out duplicate altimeters of the same index

    KeyEventManager.getManager(this.bus).then(manager => {
      this.keyEventManager = manager;
      while (this.isAlive && this.keyEventManagerReadyPromises.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.keyEventManagerReadyPromises.shift()!.resolve();
      }
    });

    this.baroUnitSub = this.pfdSettings.getSetting('baroCorrectionUnit').sub(this.onBaroUnitChanged.bind(this));
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
   * The current raw Kohlsmann increment.
   * @returns the current raw Kohlsmann increment.
   * */
  private get currentRawIncrement(): number {
    const unitSetting = this.pfdSettings.getSetting('baroCorrectionUnit').get();
    return unitSetting === BaroCorrectionUnit.Hpa ? AltimeterBaroKeyEventHandler.HPA_INCREMENT_KOHLSMAN : AltimeterBaroKeyEventHandler.IN_HG_INCREMENT_KOHLSMAN;
  }

  /**
   * Rounds a raw Kohlsman value to the nearest increment for the current unit setting, and clamps it within the min/max values.
   * @param rawValue The input value.
   * @returns the rounded and clamped kohlsman value.
   */
  private roundToIncrementAndClamp(rawValue: number): number {
    const increment = this.currentRawIncrement;
    return Math.round(MathUtils.clamp(MathUtils.round(rawValue, increment), AltimeterBaroKeyEventHandler.MIN_RAW, AltimeterBaroKeyEventHandler.MAX_RAW));
  }

  /**
   * Sets a managed altimeter to STD
   * @param info The altimeter to set.
   */
  private setStd(info: AltimeterBaroInfoInternal): void {
    SimVar.SetSimVarValue(info.stdSimVar, SimVarValueType.Bool, 1);
    this.keyEventManager!.triggerKey('KOHLSMAN_SET', true, AltimeterBaroKeyEventHandler.STD_KOHLSMAN, info.index);
  }

  /**
   * Sets a managed altimeter to a given QNH setting.
   * @param info The altimeter to set.
   * @param kohlsman The raw kohlsman setting.
   */
  private setQnh(info: AltimeterBaroInfoInternal, kohlsman: number): void {
    SimVar.SetSimVarValue(info.stdSimVar, SimVarValueType.Bool, 0);
    this.keyEventManager!.triggerKey('KOHLSMAN_SET', true, kohlsman, info.index);
  }

  /**
   * Sets the baro setting for an altimeter. If STD BARO mode is currently on,
   * STD BARO will be deactivated and the active baro setting will be
   * changed.
   * @param info Information on the altimeter to modify.
   * @param value The value to set, in units of raw baro setting pressure (equal to 1/16 hPa).
   */
  private setBaroSetting(info: AltimeterBaroInfoInternal, value: number): void {
    const newValue = this.roundToIncrementAndClamp(value);

    this.setQnh(info, newValue);

    // sync to other altimeters if sync is enabled
    if (this.pfdSettings.getSetting('baroSynchEnabled').get()) {
      for (const def of this.managedAltimeterInfos) {
        if (def.index !== info.index) {
          this.setQnh(def, newValue);
        }
      }
    }
  }

  /**
   * Increments or decrements the baro setting for an altimeter. If STD BARO mode
   * is currently on, STD BARO will be deactivated and the active baro setting will
   * be changed.
   * @param info Information on the altimeter to modify.
   * @param direction The direction to change the baro setting.
   */
  private changeBaroSetting(info: AltimeterBaroInfoInternal, direction: 1 | -1): void {
    const rawSetting = SimVar.GetSimVarValue(info.settingSimVar, SimVarValueType.InHG) * AltimeterBaroKeyEventHandler.IN_HG_TO_RAW_KOHLSMAN;
    const newSetting = this.roundToIncrementAndClamp(rawSetting + Math.sign(direction) * this.currentRawIncrement);

    this.setQnh(info, newSetting);

    if (this.pfdSettings.getSetting('baroSynchEnabled').get()) {
      for (const def of this.managedAltimeterInfos) {
        if (def.index !== info.index) {
          this.setQnh(def, newSetting);
        }
      }
    }
  }

  /**
   * Toggles STD BARO mode for an altimeter. If STD BARO is currently off, this will set the active baro setting to 29.92 inches
   * (1013 hPa). If STD BARO is currently on, this will turn off STD BARO mode.
   * @param info Information on the altimeter to modify.
   */
  private toggleBaroStd(info: AltimeterBaroInfoInternal): void {
    const isStd = SimVar.GetSimVarValue(info.stdSimVar, SimVarValueType.Bool) !== 0;

    if (isStd) {
      SimVar.SetSimVarValue(info.stdSimVar, SimVarValueType.Bool, 0);
    } else {
      this.setStd(info);
    }

    if (this.pfdSettings.getSetting('baroSynchEnabled').get()) {
      for (const def of this.managedAltimeterInfos) {
        if (def.index === info.index) {
          continue;
        }
        // if the other altimeter is in STD, put it to QNH
        if (isStd) {
          SimVar.SetSimVarValue(def.stdSimVar, SimVarValueType.Bool, 0);
        } else {
          this.setStd(def);
        }
      }
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

    // FIXME use trans level in cruise phase or later when flight phases implemented
    const transAlt = this.activePerfPlan.transitionAltitude.get();
    const setStd = altitude >= (transAlt > 0 ? transAlt : 18_000);

    for (const info of this.managedAltimeterInfos) {
      if (setStd) {
        this.setStd(info);
      } else {
        const value = this.roundToIncrementAndClamp(SimVar.GetSimVarValue('SEA LEVEL PRESSURE', SimVarValueType.InHG) * AltimeterBaroKeyEventHandler.IN_HG_TO_RAW_KOHLSMAN);
        this.setQnh(info, value);
      }
    }
  }

  /**
   * Handles setting the baro correction to the nearest hPa or in.Hg when the correction unit changes.
   */
  onBaroUnitChanged(): void {
    for (const info of this.managedAltimeterInfos) {
      const isStd = SimVar.GetSimVarValue(info.stdSimVar, SimVarValueType.Bool) !== 0;
      if (isStd) {
        continue;
      }

      const rawSetting = Math.round(SimVar.GetSimVarValue(info.settingSimVar, SimVarValueType.InHG) * AltimeterBaroKeyEventHandler.IN_HG_TO_RAW_KOHLSMAN);
      const newSetting = this.roundToIncrementAndClamp(rawSetting);
      if (rawSetting !== newSetting) {
        this.keyEventManager!.triggerKey('KOHLSMAN_SET', true, newSetting, info.index);
      }
    }
  }

  /**
   * Destroys this handler.
   */
  public destroy(): void {
    this.isAlive = false;

    this.keyEventManagerReadyPromises.forEach(promise => { promise.reject('AltimeterBaroKeyEventHandler: handler was destroyed'); });

    this.baroUnitSub?.destroy();
    this.keyEventSub?.destroy();
  }
}
