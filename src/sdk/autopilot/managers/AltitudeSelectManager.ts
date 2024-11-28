import { EventBus, KeyEventData, KeyEventManager, KeyEvents, SimVarValueType } from '../../data';
import { APEvents } from '../../instruments/APPublisher';
import { ClockEvents } from '../../instruments/Clock';
import { BitFlags, MathUtils, NumberUnitInterface, Unit, UnitFamily, UnitType } from '../../math';
import { UserSetting, UserSettingManager } from '../../settings/UserSetting';
import { SubscribableSet, SubscribableSetEventType } from '../../sub/SubscribableSet';
import { SortedArray } from '../../utils/datastructures/SortedArray';
import { DebounceTimer } from '../../utils/time';

/**
 * Events related to autopilot altitude selection.
 */
export interface AltitudeSelectEvents {
  /** Whether the autopilot selected altitude has been initialized to a value. */
  alt_select_is_initialized: boolean;
}

/**
 * Metric Altitude Select Setting.
 */
export type MetricAltitudeSelectSetting = {
  /** Whether the altimeter is set to Metric */
  'altMetric': boolean;
};

/**
 * A type describing a settings manager that at least has the metric altimeter setting.
 */
export type MetricAltitudeSettingsManager = UserSettingManager<MetricAltitudeSelectSetting>;

/**
 * Types of input acceleration supported by {@link AltitudeSelectManager}.
 */
export enum AltitudeSelectManagerAccelType {
  /** No input acceleration. */
  None = 'None',

  /** While input acceleration is active, small-increment inputs will be converted to large increments. */
  SmallToLarge = 'SmallToLarge',

  /**
   * While input acceleration is active, the magnitude of small-increment inputs will be adjusted by an arbitrary
   * factor based on the observed rate of small-increment inputs.
   */
  DynamicSmall = 'DynamicSmall'
}

/**
 * Bitflags used to filter input events eligible to trigger input acceleration for {@link AltitudeSelectManager}.
 */
export enum AltitudeSelectManagerAccelFilter {
  /** No events. */
  None = 0,

  /** INC/DEC events with a value of zero. */
  ZeroIncDec = 1 << 0,

  /** INC/DEC events with a non-zero value. */
  NonZeroIncDec = 1 << 1,

  /** SET events that are transformed to an INC/DEC event. */
  TransformedSet = 1 << 2,

  /** All events. */
  All = ~0
}

/**
 * Configuration options for {@link AltitudeSelectManager}.
 */
export type AltitudeSelectManagerOptions = {
  /** The altitude hold slot index to use. Defaults to 1. */
  altitudeHoldSlotIndex?: 1 | 2 | 3;

  /** Whether to support metric mode. */
  supportMetric: boolean,

  /** The minimum value of the selected altitude setting. */
  minValue: NumberUnitInterface<UnitFamily.Distance>;

  /** The maximum value of the selected altitude setting. */
  maxValue: NumberUnitInterface<UnitFamily.Distance>;

  /**
   * The minimum value of the selected altitude setting in metric mode. If undefined, it will be set equal to the
   * minimum value in non-metric mode.
   */
  minValueMetric?: NumberUnitInterface<UnitFamily.Distance>;

  /**
   * The maximum value of the selected altitude setting in metric mode. If undefined, it will be set equal to the
   * maximum value in non-metric mode.
   */
  maxValueMetric?: NumberUnitInterface<UnitFamily.Distance>;

  /**
   * The threshold for an altitude select change key input value above which the input is interpreted as a large
   * increment.
   */
  inputIncrLargeThreshold: number;

  /** The value to increase/decrease the selected altitude setting on a small increment. */
  incrSmall: NumberUnitInterface<UnitFamily.Distance>;

  /** The value to increase/decrease the selected altitude setting on a large increment.  */
  incrLarge: NumberUnitInterface<UnitFamily.Distance>;

  /**
   * The value to increase/decrease the selected altitude setting on a small increment in metric mode. If undefined,
   * it will be set equal to the small increment value in non-metric mode.
   */
  incrSmallMetric?: NumberUnitInterface<UnitFamily.Distance>;

  /**
   * The value to increase/decrease the selected altitude setting on a large increment in metric mode. If undefined,
   * it will be set equal to the large increment value in non-metric mode.
   */
  incrLargeMetric?: NumberUnitInterface<UnitFamily.Distance>;

  /**
   * Whether to lock the selected altitude setting to multiples of the appropriate increment value on a small or large
   * increment. Defaults to `true`.
   */
  lockAltToStepOnIncr?: boolean;

  /**
   * Whether to lock the selected altitude setting to multiples of the appropriate increment value on a small or large
   * increment in metric mode. If undefined, it will be set equal to the lock flag in non-metric mode.
   */
  lockAltToStepOnIncrMetric?: boolean;

  /**
   * Whether to lock the selected altitude setting to multiples of the small increment on a SET event. Defaults to
   * `false`.
   */
  lockAltToStepOnSet?: boolean;

  /**
   * Whether to lock the selected altitude setting to multiples of the small increment in metric mode on a SET event.
   * If undefined, it will be set equal to the lock flag in non-metric mode.
   */
  lockAltToStepOnSetMetric?: boolean;

  /**
   * The type of input acceleration to use when handling increment/decrement events. Defaults to
   * {@link AltitudeSelectManagerAccelType.None}.
   */
  accelType?: AltitudeSelectManagerAccelType;

  /**
   * The required number of consecutive small-increment inputs received to trigger input acceleration. Only applies
   * to the {@link AltitudeSelectManagerAccelType.SmallToLarge} acceleration type. A threshold less than or equal to
   * zero disables input acceleration. Defaults to 0.
   */
  accelInputCountThreshold?: number;

  /**
   * The maximum amount of time, in milliseconds, between input events that are counted as consecutive for triggering
   * input acceleration. Only applies to the {@link AltitudeSelectManagerAccelType.SmallToLarge} acceleration type.
   * Defaults to 300.
   */
  accelInputCountWindow?: number;

  /**
   * The required average rate of inputs received to trigger input acceleration. Only applies to the
   * {@link AltitudeSelectManagerAccelType.DynamicSmall} acceleration type. A threshold less than or equal to zero
   * enables input acceleration for every eligible input. Defaults to 0.
   */
  accelInputRateThreshold?: number;

  /**
   * The window of time, in milliseconds, over which input rate is averaged when calculating input acceleration. Only
   * applies to the {@link AltitudeSelectManagerAccelType.DynamicSmall} acceleration type. A window less than or equal
   * to zero disables input acceleration. Defaults to 0.
   */
  accelInputRateWindow?: number;

  /**
   * A function that transforms an observed input rate to an accelerated input rate when input acceleration is active.
   * The amount by which each input increments the selected altitude setting will be adjusted such that the setting's
   * rate of change approximately equals that which would be effected by unaccelerated inputs at the transformed rate.
   * @param inputRate The observed input rate to transform, in inputs per second.
   * @returns The accelerated input rate for the specified observed input rate, in inputs per second.
   */
  accelInputRateTransformer?: (inputRate: number) => number;

  /** Whether to reset input acceleration if the direction of increment changes. Defaults to `false`. */
  accelResetOnDirectionChange?: boolean;

  /**
   * Bitflags to use to filter input events for input acceleration. Only events that pass the filter are eligible to
   * trigger input acceleration. Defaults to `AltitudeSelectManagerAccelFilter.All`.
   */
  accelFilter?: number;

  /**
   * Whether to initialize the selected altitude setting only on the first detected input. If `false`, the selected
   * altitude will be initialized as soon as the manager is fully initialized. Defaults to `false`.
   */
  initOnInput?: boolean;

  /**
   * Whether to initialize the selected altitude setting to the indicated altitude. If `false`, the selected altitude
   * will be initialized to `0`. Defaults to `false`.
   */
  initToIndicatedAlt?: boolean;

  /**
   * Whether to treat all intercepted SET key events as if they were INC or DEC events. Defaults to `true`.
   */
  transformSetToIncDec?: boolean;
};

/**
 * Controls the value of the autopilot selected altitude setting in response to key events.
 */
export class AltitudeSelectManager {
  private keyEventManager?: KeyEventManager;

  private readonly publisher = this.bus.getPublisher<AltitudeSelectEvents>();

  private readonly altitudeHoldSlotIndex: 1 | 2 | 3;
  private readonly altitudeHoldSlotSimVar: string;

  private readonly minValue: number;
  private readonly maxValue: number;
  private readonly minValueMetric: number;
  private readonly maxValueMetric: number;

  private readonly inputIncrLargeThreshold: number;
  private readonly incrSmall: number;
  private readonly incrLarge: number;
  private readonly incrSmallMetric: number;
  private readonly incrLargeMetric: number;

  private readonly lockAltToStepOnIncr: boolean;
  private readonly lockAltToStepOnIncrMetric: boolean;
  private readonly lockAltToStepOnSet: boolean;
  private readonly lockAltToStepOnSetMetric: boolean;

  private readonly accelType: AltitudeSelectManagerAccelType;
  private readonly accelInputCountThreshold: number;
  private readonly accelInputCountWindow: number;

  private readonly accelInputRateThreshold: number;
  private readonly accelInputRateWindow: number;
  private readonly accelInputRateTransformer: (inputRate: number) => number;

  private readonly accelResetOnDirectionChange: boolean;
  private readonly accelFilter: number;

  private readonly initToIndicatedAlt: boolean;

  private readonly transformSetToIncDec: boolean;

  private readonly altimeterMetricSetting: UserSetting<boolean> | undefined;

  private readonly stops = new SortedArray<number>((a, b) => a - b);

  private readonly lockDebounceTimer = new DebounceTimer();

  private isKeyEventInit = false;

  private isEnabled = true;
  private isInitialized = false;
  private isPaused = false;
  private isLocked = false;

  private frameCounter = 0;

  private isAccelActive = false;

  private accelConsecIncrSmallCount = 0;
  private accelLastIncrDirection = 0;
  private accelLastIncrInputTime = 0;

  private readonly accelWindowRecord: number[] = [];
  private lastAccelInputFrame: number | undefined = undefined;
  private accelInputRateResidual = 0;

  private readonly selectedAltitudeChangedHandler = (): void => {
    // wait one frame before unlocking due to delay between when a key event is created and when it is intercepted on
    // the JS side
    setTimeout(() => {
      this.isLocked = false;
      this.lockDebounceTimer.clear();
    });
  };

  /**
   * Creates a new instance of AltitudeSelectManager.
   * @param bus The event bus.
   * @param settingsManager The user settings manager controlling metric altitude preselector setting. Required to
   * support metric mode.
   * @param options Configuration options for this manager.
   * @param stops Additional altitude stops, in feet, to respect when the selected altitude is incremented or
   * decremented.
   */
  public constructor(
    private readonly bus: EventBus,
    settingsManager: MetricAltitudeSettingsManager | undefined,
    options: Readonly<AltitudeSelectManagerOptions>,
    stops?: Iterable<number> | SubscribableSet<number>
  ) {
    this.altitudeHoldSlotIndex = options.altitudeHoldSlotIndex ?? 1;
    this.altitudeHoldSlotSimVar = `AUTOPILOT ALTITUDE LOCK VAR:${this.altitudeHoldSlotIndex}`;

    this.minValue = Math.round(options.minValue.asUnit(UnitType.FOOT));
    this.maxValue = Math.round(options.maxValue.asUnit(UnitType.FOOT));
    this.minValueMetric = Math.round((options.minValueMetric ?? options.minValue).asUnit(UnitType.METER));
    this.maxValueMetric = Math.round((options.maxValueMetric ?? options.maxValue).asUnit(UnitType.METER));

    this.inputIncrLargeThreshold = options.inputIncrLargeThreshold;
    this.incrSmall = Math.round(options.incrSmall.asUnit(UnitType.FOOT));
    this.incrLarge = Math.round(options.incrLarge.asUnit(UnitType.FOOT));
    this.incrSmallMetric = Math.round((options.incrSmallMetric ?? options.incrSmall).asUnit(UnitType.METER));
    this.incrLargeMetric = Math.round((options.incrLargeMetric ?? options.incrLarge).asUnit(UnitType.METER));

    this.lockAltToStepOnIncr = options.lockAltToStepOnIncr ?? true;
    this.lockAltToStepOnIncrMetric = options.lockAltToStepOnIncrMetric ?? this.lockAltToStepOnIncr;

    this.lockAltToStepOnSet = options.lockAltToStepOnSet ?? false;
    this.lockAltToStepOnSetMetric = options.lockAltToStepOnSetMetric ?? this.lockAltToStepOnSet;

    this.accelType = options.accelType ?? AltitudeSelectManagerAccelType.None;

    this.accelInputCountThreshold = options.accelInputCountThreshold ?? 0;
    this.accelInputCountWindow = options.accelInputCountWindow ?? 300;

    this.accelInputRateThreshold = options.accelInputRateThreshold ?? 0;
    this.accelInputRateWindow = options.accelInputRateWindow ?? 0;
    this.accelInputRateTransformer = options.accelInputRateTransformer ?? AltitudeSelectManager.defaultInputRateTransformer;

    this.accelResetOnDirectionChange = options.accelResetOnDirectionChange ?? false;
    this.accelFilter = options.accelFilter ?? AltitudeSelectManagerAccelFilter.All;

    this.initToIndicatedAlt = options.initToIndicatedAlt ?? false;

    this.transformSetToIncDec = options.transformSetToIncDec ?? true;

    this.altimeterMetricSetting = options.supportMetric && settingsManager ? settingsManager.getSetting('altMetric') : undefined;

    if (stops !== undefined) {
      if ('isSubscribableSet' in stops) {
        stops.sub(this.onStopsChanged.bind(this), true);
      } else {
        this.stops.insertAll(new Set(stops)); // Make sure there are no duplicates.
      }
    }

    this.isInitialized = !(options.initOnInput ?? false);

    this.initKeyEvents();
  }

  /**
   * Initializes this manager's key event intercepts.
   */
  private async initKeyEvents(): Promise<void> {
    this.keyEventManager = await KeyEventManager.getManager(this.bus);

    this.keyEventManager.interceptKey('AP_ALT_VAR_SET_ENGLISH', false);
    this.keyEventManager.interceptKey('AP_ALT_VAR_SET_METRIC', false);
    this.keyEventManager.interceptKey('AP_ALT_VAR_INC', false);
    this.keyEventManager.interceptKey('AP_ALT_VAR_DEC', false);

    this.isKeyEventInit = true;

    const sub = this.bus.getSubscriber<KeyEvents & APEvents & ClockEvents>();

    if (this.transformSetToIncDec) {
      sub.on(`ap_altitude_selected_${this.altitudeHoldSlotIndex}`).whenChanged().handle(this.selectedAltitudeChangedHandler);
    }

    sub.on('key_intercept').handle(this.onKeyIntercepted.bind(this));

    this.publisher.pub('alt_select_is_initialized', !this.isEnabled || this.isInitialized, true);

    sub.on('simTimeHiFreq').handle(this.update.bind(this));
  }

  /**
   * Sets whether this manager is enabled. When this manager is disabled, all key events to change the selected
   * altitude setting are processed "as-is".
   * @param isEnabled Whether this manager is enabled.
   */
  public setEnabled(isEnabled: boolean): void {
    if (this.isEnabled === isEnabled) {
      return;
    }

    this.isEnabled = isEnabled;

    if (this.isKeyEventInit) {
      this.publisher.pub('alt_select_is_initialized', !isEnabled || this.isInitialized, true);
    }
  }

  /**
   * Resumes this manager. When resumed, this manager will respond to key events that manipulate selected altitude.
   */
  public resume(): void {
    this.isPaused = false;
  }

  /**
   * Pauses this manager. When paused, this manager will not respond to key events that manipulate selected altitude.
   * If this manager is disabled, it will still pass through key events while paused.
   */
  public pause(): void {
    this.isPaused = true;
  }

  /**
   * Resets the selected altitude to a specific value and optionally sets the initialized state of the selected
   * altitude to uninitialized.
   * @param altitude The altitude, in feet, to which to reset the selected altitude.
   * @param resetInitialized Whether to reset the initialized state of the selected altitude to uninitialized. Defaults
   * to `false`.
   */
  public reset(altitude: number, resetInitialized = false): void {
    if (!this.isEnabled) {
      return;
    }

    SimVar.SetSimVarValue(this.altitudeHoldSlotSimVar, SimVarValueType.Feet, altitude);
    if (resetInitialized) {
      this.isInitialized = false;
      if (this.isKeyEventInit) {
        this.publisher.pub('alt_select_is_initialized', false, true);
      }
    }
  }

  /**
   * Sets the initialized state of the selected altitude.
   * @param initialized The state to set.
   */
  public setSelectedAltitudeInitialized(initialized: boolean): void {
    if (this.isInitialized === initialized) {
      return;
    }

    this.isInitialized = initialized;

    if (this.isKeyEventInit) {
      this.publisher.pub('alt_select_is_initialized', !this.isEnabled || initialized, true);
    }
  }

  /**
   * Responds to when the set of additional altitude increment stops changes.
   * @param set The set containing all additional altitude increment stops.
   * @param type The type of change.
   * @param stop The stop that changed.
   */
  private onStopsChanged(set: ReadonlySet<number>, type: SubscribableSetEventType, stop: number): void {
    if (type === SubscribableSetEventType.Added) {
      this.stops.insert(stop);
    } else {
      this.stops.remove(stop);
    }
  }

  /**
   * Responds to key intercepted events.
   * @param data The event data.
   * @param data.key The key that was intercepted.
   * @param data.value0 The value of the intercepted key event.
   * @param data.value1 The index of the intercepted key event.
   */
  private onKeyIntercepted({ key, value0: value, value1: index }: KeyEventData): void {
    switch (key) {
      case 'AP_ALT_VAR_INC':
      case 'AP_ALT_VAR_DEC':
      case 'AP_ALT_VAR_SET_ENGLISH':
      case 'AP_ALT_VAR_SET_METRIC':
        break;
      default:
        return;
    }

    index ??= 1; // key events without an explicit index automatically get mapped to index 1
    index = Math.max(1, index); // treat index 0 events as index 1.

    if (!this.isEnabled || index !== this.altitudeHoldSlotIndex) {
      this.passThroughKeyEvent(key, index, value);
      return;
    }

    if (!this.isPaused && !this.isLocked) {
      this.handleKeyEvent(key, value);
    }
  }

  /**
   * Handles a key event.
   * @param key The key.
   * @param value The value of the key event.
   */
  private handleKeyEvent(key: string, value?: number): void {
    const currentValue = SimVar.GetSimVarValue(this.altitudeHoldSlotSimVar, SimVarValueType.Feet);
    let startValue = currentValue;
    if (!this.isInitialized) {
      if (this.initToIndicatedAlt) {
        startValue = SimVar.GetSimVarValue('INDICATED ALTITUDE', SimVarValueType.Feet);
      } else {
        startValue = 0;
      }
    }

    let direction: 0 | 1 | -1 = 0;
    let useLargeIncrement = false;
    let setAltitude: number | undefined = undefined;
    let accelFilterChallenge = 0;

    switch (key) {
      case 'AP_ALT_VAR_INC':
        direction = 1;
        useLargeIncrement = value !== undefined && value > this.inputIncrLargeThreshold;
        if (value === undefined || value === 0) {
          accelFilterChallenge = AltitudeSelectManagerAccelFilter.ZeroIncDec;
        } else {
          accelFilterChallenge = AltitudeSelectManagerAccelFilter.NonZeroIncDec;
        }
        break;
      case 'AP_ALT_VAR_DEC':
        direction = -1;
        useLargeIncrement = value !== undefined && value > this.inputIncrLargeThreshold;
        if (value === undefined || value === 0) {
          accelFilterChallenge = AltitudeSelectManagerAccelFilter.ZeroIncDec;
        } else {
          accelFilterChallenge = AltitudeSelectManagerAccelFilter.NonZeroIncDec;
        }
        break;
      case 'AP_ALT_VAR_SET_ENGLISH':
      case 'AP_ALT_VAR_SET_METRIC': {
        if (value !== undefined && value !== currentValue) {
          if (this.transformSetToIncDec) {
            const delta = value - currentValue;
            direction = delta < 0 ? -1 : 1;
            useLargeIncrement = Math.abs(delta) > this.inputIncrLargeThreshold;
            accelFilterChallenge = AltitudeSelectManagerAccelFilter.TransformedSet;
          } else {
            setAltitude = value;
          }
        }
        break;
      }
    }

    if (setAltitude !== undefined) {
      this.setSelectedAltitude(setAltitude);
      return;
    }

    // Handle input acceleration
    switch (this.accelType) {
      case AltitudeSelectManagerAccelType.SmallToLarge:
        this.handleSmallToLargeAccel(startValue, direction, useLargeIncrement, accelFilterChallenge);
        break;
      case AltitudeSelectManagerAccelType.DynamicSmall:
        this.handleDynamicSmallAccel(startValue, direction, useLargeIncrement, accelFilterChallenge);
        break;
      default:
        if (direction !== 0) {
          this.changeSelectedAltitude(startValue, direction, useLargeIncrement);
        }
    }
  }

  /**
   * Sets the selected altitude to a specific value.
   * @param altitudeFeet The altitude to set, in feet.
   */
  private setSelectedAltitude(altitudeFeet: number): void {
    const isMetric = this.altimeterMetricSetting?.value ?? false;
    let lockIncr: number;

    let min: number, max: number, unit: Unit<UnitFamily.Distance>;
    if (isMetric) {
      min = this.minValueMetric;
      max = this.maxValueMetric;
      unit = UnitType.METER;
      lockIncr = this.lockAltToStepOnSetMetric ? this.incrSmallMetric : 0;
    } else {
      min = this.minValue;
      max = this.maxValue;
      unit = UnitType.FOOT;
      lockIncr = this.lockAltToStepOnSet ? this.incrSmall : 0;
    }

    let altitudeInUnits = UnitType.FOOT.convertTo(altitudeFeet, unit);

    if (lockIncr > 0) {
      altitudeInUnits = MathUtils.clamp(
        MathUtils.round(altitudeInUnits, lockIncr),
        MathUtils.ceil(min, lockIncr),
        MathUtils.floor(max, lockIncr)
      );
    } else {
      altitudeInUnits = MathUtils.clamp(altitudeInUnits, min, max);
    }

    const valueToSet = UnitType.FOOT.convertFrom(altitudeInUnits, unit);

    if (valueToSet !== SimVar.GetSimVarValue(this.altitudeHoldSlotSimVar, SimVarValueType.Feet)) {
      SimVar.SetSimVarValue(this.altitudeHoldSlotSimVar, SimVarValueType.Feet, valueToSet);
    }

    if (!this.isInitialized) {
      this.publisher.pub('alt_select_is_initialized', true, true, true);
      this.isInitialized = true;
    }
  }

  /**
   * Handles an increment/decrement input with small-to-large increment acceleration.
   * @param startValue The value from which to change, in feet.
   * @param direction The direction of change.
   * @param useLargeIncrement Whether the input to handle is for a large increment.
   * @param accelFilterChallenge Bitflags with which to challenge this manager's input acceleration filter. The input
   * will meet the conditions for acceleration if and only if the challenge flags shares at least one non-zero bit with
   * the filter.
   */
  private handleSmallToLargeAccel(
    startValue: number,
    direction: 0 | 1 | -1,
    useLargeIncrement: boolean,
    accelFilterChallenge: number
  ): void {
    if (this.accelInputCountThreshold > 0) {
      const time = Date.now();

      let isAccelActive = this.accelConsecIncrSmallCount >= this.accelInputCountThreshold;

      const didPassFilter = BitFlags.isAny(accelFilterChallenge, this.accelFilter);

      if (
        useLargeIncrement
        || !didPassFilter
        || direction === 0
        || (this.accelConsecIncrSmallCount > 0 && time - this.accelLastIncrInputTime > this.accelInputCountWindow)
        || ((isAccelActive ? this.accelResetOnDirectionChange : this.accelConsecIncrSmallCount > 0) && this.accelLastIncrDirection !== direction)
      ) {
        this.accelConsecIncrSmallCount = 0;
      }

      if (!useLargeIncrement && didPassFilter) {
        this.accelConsecIncrSmallCount++;
        this.accelLastIncrDirection = direction;
        this.accelLastIncrInputTime = time;
      }

      isAccelActive = this.accelConsecIncrSmallCount >= this.accelInputCountThreshold;

      if (isAccelActive) {
        useLargeIncrement = true;
      }

      this.isAccelActive = isAccelActive;
    }

    if (direction !== 0) {
      this.changeSelectedAltitude(startValue, direction, useLargeIncrement);
    }
  }

  /**
   * Handles an increment/decrement input with dynamic small-increment acceleration.
   * @param startValue The value from which to change, in feet.
   * @param direction The direction of change.
   * @param useLargeIncrement Whether the input to handle is for a large increment.
   * @param accelFilterChallenge Bitflags with which to challenge this manager's input acceleration filter. The input
   * will meet the conditions for acceleration if and only if the challenge flags shares at least one non-zero bit with
   * the filter.
   */
  private handleDynamicSmallAccel(
    startValue: number,
    direction: 0 | 1 | -1,
    useLargeIncrement: boolean,
    accelFilterChallenge: number
  ): void {
    let delta = direction;

    if (this.accelInputRateWindow > 0) {
      const time = Date.now();

      if (direction !== 0 && direction !== this.accelLastIncrDirection) {
        if (this.isAccelActive) {
          this.accelInputRateResidual = 0;
          if (this.accelResetOnDirectionChange) {
            this.accelWindowRecord.length = 0;
            this.isAccelActive = false;
          }
        } else {
          this.accelWindowRecord.length = 0;
        }
      }

      this.updateAccelWindowRecord(time);

      const isLastAccelInputThisFrame = this.frameCounter === this.lastAccelInputFrame;
      const isInputEligibleForAccel = direction !== 0 && !useLargeIncrement && BitFlags.isAny(accelFilterChallenge, this.accelFilter);

      // Do not push the current input into the record if the input was received on the same frame as the previous
      // acceleration-eligible input. We are effectively limited to changing the selected altitude once per frame, so
      // we are unable to "accumulate" multiple increments per frame.
      if (isInputEligibleForAccel && !isLastAccelInputThisFrame) {
        this.accelWindowRecord.push(time);
        this.lastAccelInputFrame = this.frameCounter;
      }

      const inputRate = this.accelWindowRecord.length / this.accelInputRateWindow * 1000;
      const isAccelActive = inputRate >= this.accelInputRateThreshold;

      if (isAccelActive !== this.isAccelActive) {
        if (!isAccelActive) {
          this.accelWindowRecord.length = 0;
          this.accelInputRateResidual = 0;
        }
        this.isAccelActive = isAccelActive;
      } else if (isAccelActive && isInputEligibleForAccel) {
        // Do not try to change the selected altitude if the current input was received on the same frame as the
        // previous acceleration-eligible input.
        if (isLastAccelInputThisFrame) {
          delta = 0;
        } else {
          // Over multiple frames, error from quantizing the change in the selected altitude to the small increment can
          // add to become significant. To combat this, we calculate a residual input rate and add it to the next
          // accelerated input.
          const desiredInputRate = Math.max(Math.max(this.accelInputRateTransformer(inputRate), 0) + this.accelInputRateResidual, 0);
          const increment = Math.round(desiredInputRate / inputRate);
          this.accelInputRateResidual = desiredInputRate - increment * inputRate;
          delta *= increment;
        }
      }

      this.accelLastIncrDirection = direction;
    }

    if (delta !== 0) {
      this.changeSelectedAltitude(startValue, delta, useLargeIncrement);
    }
  }

  /**
   * Updates the record of input events within the acceleration window. Existing events in the record that are older
   * than the window are removed. If the current time is less than the most recent event in the record, then all events
   * are removed from the record.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  private updateAccelWindowRecord(time: number): void {
    if (this.accelWindowRecord.length === 0) {
      return;
    }

    // Check if the most recent time is after the current time (can only happen if the operating system clock is
    // changed). If it is, then empty the entire record.
    if (this.accelWindowRecord[this.accelWindowRecord.length - 1] > time) {
      this.accelWindowRecord.length = 0;
    }

    // Remove all entries that are older than the window.
    let startIndex = 0;
    for (; startIndex < this.accelWindowRecord.length; startIndex++) {
      const dt = time - this.accelWindowRecord[startIndex];
      if (dt <= this.accelInputRateWindow) {
        break;
      }
    }
    this.accelWindowRecord.splice(0, startIndex);
  }

  /**
   * Increments or decrements the selected altitude setting. The amount the setting is changed depends on whether the
   * PFD altimeter metric mode is enabled. The value of the setting after the change is guaranteed to be a round number
   * in the appropriate units (nearest 100 feet or 50 meters).
   * @param startValue The value from which to change, in feet.
   * @param delta The direction of the change: `1` for increment, `-1` for decrement.
   * @param useLargeIncrement Whether to change the altitude by the large increment (1000 feet/500 meters) instead of
   * the small increment (100 feet/50 meters). False by default.
   */
  private changeSelectedAltitude(startValue: number, delta: number, useLargeIncrement = false): void {
    if (delta === 0) {
      return;
    }

    const roundFunc = delta > 0 ? MathUtils.floor : MathUtils.ceil;
    const isMetric = this.altimeterMetricSetting?.value ?? false;

    let min, max, incrSmall, incrLarge, units, lockAlt;
    if (isMetric) {
      min = this.minValueMetric;
      max = this.maxValueMetric;
      incrSmall = this.incrSmallMetric;
      incrLarge = this.incrLargeMetric;
      units = UnitType.METER;
      lockAlt = this.lockAltToStepOnIncrMetric;
    } else {
      min = this.minValue;
      max = this.maxValue;
      incrSmall = this.incrSmall;
      incrLarge = this.incrLarge;
      units = UnitType.FOOT;
      lockAlt = this.lockAltToStepOnIncr;
    }

    const startValueConverted = Math.round(UnitType.FOOT.convertTo(startValue, units));
    useLargeIncrement &&= !lockAlt || (startValueConverted % incrSmall === 0);
    let valueToSet = UnitType.FOOT.convertFrom(
      MathUtils.clamp((lockAlt ? roundFunc(startValueConverted, incrSmall) : startValueConverted) + delta * (useLargeIncrement ? incrLarge : incrSmall), min, max),
      units
    );

    // Check if we need to set the new altitude to a stop instead.
    if (this.stops.length > 0) {
      let nextStopIndex = this.stops.matchIndex(startValue);
      if (delta > 0) {
        if (nextStopIndex < 0) {
          nextStopIndex = -nextStopIndex - 1;
        } else {
          nextStopIndex++;
        }
      } else {
        if (nextStopIndex < 0) {
          nextStopIndex = -nextStopIndex - 2;
        } else {
          nextStopIndex--;
        }
      }

      const nextStop = this.stops.peek(nextStopIndex);
      if (nextStop !== undefined && Math.abs(valueToSet - startValue) > Math.abs(nextStop - startValue)) {
        valueToSet = nextStop;
      }
    }

    if (valueToSet !== SimVar.GetSimVarValue(this.altitudeHoldSlotSimVar, SimVarValueType.Feet)) {
      SimVar.SetSimVarValue(this.altitudeHoldSlotSimVar, SimVarValueType.Feet, valueToSet);

      // If we are transforming SET events to INC/DEC, we need to lock out any further changes until the simvar is
      // completely updated. Otherwise, calculations of the inc/dec delta that rely on knowing the current value of
      // the simvar will be incorrect.
      if (this.transformSetToIncDec) {
        this.isLocked = true;
        // Sometimes the alt select change event will not fire if the change is too small, so we set a timeout to unlock
        // just in case
        this.lockDebounceTimer.schedule(() => { this.isLocked = false; }, 250);
      }
    }

    if (!this.isInitialized) {
      this.publisher.pub('alt_select_is_initialized', true, true, true);
      this.isInitialized = true;
    }
  }

  /**
   * Processes a key event "as-is".
   * @param key The key that was pressed.
   * @param index The index of the key event.
   * @param value The value of the key event.
   */
  private passThroughKeyEvent(key: string, index: number, value?: number): void {
    index = Math.max(1, index);

    const currentValue = SimVar.GetSimVarValue(`AUTOPILOT ALTITUDE LOCK VAR:${index}`, SimVarValueType.Feet);

    let valueToSet = currentValue;

    switch (key) {
      case 'AP_ALT_VAR_SET_ENGLISH':
      case 'AP_ALT_VAR_SET_METRIC':
        if (value !== undefined) {
          valueToSet = value;
        }
        break;
      case 'AP_ALT_VAR_INC':
        valueToSet += value === 0 || value === undefined ? 100 : value;
        break;
      case 'AP_ALT_VAR_DEC':
        valueToSet -= value === 0 || value === undefined ? 100 : value;
        break;
    }

    SimVar.SetSimVarValue(`AUTOPILOT ALTITUDE LOCK VAR:${index}`, SimVarValueType.Feet, valueToSet);
  }

  /**
   * Updates this manager every frame.
   */
  private update(): void {
    this.frameCounter = (this.frameCounter + 1) % Number.MAX_SAFE_INTEGER;
  }

  /**
   * A function that returns an input rate without changing it.
   * @param inputRate An input rate.
   * @returns The specified input rate, unchanged.
   */
  private static defaultInputRateTransformer(inputRate: number): number {
    return inputRate;
  }
}