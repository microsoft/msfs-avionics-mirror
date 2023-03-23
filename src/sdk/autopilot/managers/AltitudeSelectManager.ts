import { EventBus, KeyEventData, KeyEvents, KeyEventManager, SimVarValueType } from '../../data';
import { APEvents } from '../../instruments';
import { MathUtils, NumberUnitInterface, Unit, UnitFamily, UnitType } from '../../math';
import { UserSetting, UserSettingManager } from '../../settings';
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
 * Configuration options for AltitudeSelectManager.
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
   * The required number of consecutive small-increment inputs received to trigger input acceleration. While
   * acceleration is active, small-increment inputs will be converted to large increments. A threshold less than or
   * equal to zero effectively disables input acceleration. Defaults to 0.
   */
  accelInputCountThreshold?: number;

  /** Whether to reset input acceleration if the direction of increment changes. Defaults to `false`. */
  accelResetOnDirectionChange?: boolean;

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
  private static readonly CONSECUTIVE_INPUT_PERIOD = 300; // the maximum amount of time, in ms, between input events that are counted as consecutive

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

  private readonly accelInputCountThreshold: number;
  private readonly accelResetOnDirectionChange: boolean;

  private readonly initToIndicatedAlt: boolean;

  private readonly transformSetToIncDec: boolean;

  private readonly altimeterMetricSetting: UserSetting<boolean> | undefined;

  private readonly stops = new SortedArray<number>((a, b) => a - b);

  private isEnabled = true;
  private isInitialized = false;
  private isPaused = false;
  private isLocked = false;

  private lockDebounceTimer = new DebounceTimer();

  private consecIncrSmallCount = 0;
  private lastIncrSmallDirection = 1;
  private lastIncrSmallInputTime = 0;

  private readonly selectedAltitudeChangedHandler = (): void => {
    // wait one frame before unlocking due to delay between when a key event is created and when it is intercepted on
    // the JS side
    setTimeout(() => {
      this.isLocked = false;
      this.lockDebounceTimer.clear();
    });
  };

  /**
   * Constructor.
   * @param bus The event bus.
   * @param settingsManager The user settings manager controlling metric altitude preselector setting.
   * @param options Configuration options for this manager.
   * @param stops Additional altitude stops, in feet, to respect when the selected altitude is incremented or
   * decremented.
   */
  constructor(
    private readonly bus: EventBus,
    settingsManager: MetricAltitudeSettingsManager,
    options: AltitudeSelectManagerOptions,
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

    this.accelInputCountThreshold = options.accelInputCountThreshold ?? 0;
    this.accelResetOnDirectionChange = options.accelResetOnDirectionChange ?? false;

    this.initToIndicatedAlt = options.initToIndicatedAlt ?? false;

    this.transformSetToIncDec = options.transformSetToIncDec ?? true;

    this.altimeterMetricSetting = options.supportMetric ? settingsManager.getSetting('altMetric') : undefined;

    if (stops !== undefined) {
      if ('isSubscribableSet' in stops) {
        stops.sub((set, type, key) => {
          if (type === SubscribableSetEventType.Added) {
            this.stops.insert(key);
          } else {
            this.stops.remove(key);
          }
        }, true);
      } else {
        this.stops.insertAll(new Set(stops)); // Make sure there are no duplicates.
      }
    }

    this.isInitialized = !(options.initOnInput ?? false);

    KeyEventManager.getManager(bus).then(manager => {
      this.keyEventManager = manager;

      manager.interceptKey('AP_ALT_VAR_SET_ENGLISH', false);
      manager.interceptKey('AP_ALT_VAR_SET_METRIC', false);
      manager.interceptKey('AP_ALT_VAR_INC', false);
      manager.interceptKey('AP_ALT_VAR_DEC', false);

      const sub = this.bus.getSubscriber<KeyEvents & APEvents>();

      if (this.transformSetToIncDec) {
        sub.on(`ap_altitude_selected_${this.altitudeHoldSlotIndex}`).whenChanged().handle(this.selectedAltitudeChangedHandler);
      }

      sub.on('key_intercept').handle(this.onKeyIntercepted.bind(this));

      this.publisher.pub('alt_select_is_initialized', !this.isEnabled || this.isInitialized, true);
    });
  }

  /**
   * Sets whether this manager is enabled. When this manager is disabled, all key events to change the selected
   * altitude setting are processed "as-is".
   * @param isEnabled Whether this manager is enabled.
   */
  public setEnabled(isEnabled: boolean): void {
    this.isEnabled = isEnabled;
    this.publisher.pub('alt_select_is_initialized', !isEnabled || this.isInitialized, true);
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
      this.publisher.pub('alt_select_is_initialized', false, true);
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
      this.publisher.pub('alt_select_is_initialized', true, true);
      this.isInitialized = true;
    }

    let direction: 0 | 1 | -1 = 0;
    let useLargeIncrement = false;
    let setAltitude: number | undefined = undefined;

    switch (key) {
      case 'AP_ALT_VAR_INC':
        direction = 1;
        useLargeIncrement = value !== undefined && value > this.inputIncrLargeThreshold;
        break;
      case 'AP_ALT_VAR_DEC':
        direction = -1;
        useLargeIncrement = value !== undefined && value > this.inputIncrLargeThreshold;
        break;
      case 'AP_ALT_VAR_SET_ENGLISH':
      case 'AP_ALT_VAR_SET_METRIC': {
        if (value !== undefined && value !== currentValue) {
          if (this.transformSetToIncDec) {
            const delta = value - currentValue;
            direction = delta < 0 ? -1 : 1;
            useLargeIncrement = Math.abs(delta) > this.inputIncrLargeThreshold;
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
    if (this.accelInputCountThreshold > 0) {
      const time = Date.now();

      let isAccelActive = this.consecIncrSmallCount >= this.accelInputCountThreshold;

      if (
        useLargeIncrement
        || direction === 0
        || (this.consecIncrSmallCount > 0 && time - this.lastIncrSmallInputTime > AltitudeSelectManager.CONSECUTIVE_INPUT_PERIOD)
        || ((isAccelActive ? this.accelResetOnDirectionChange : this.consecIncrSmallCount > 0) && this.lastIncrSmallDirection !== direction)
      ) {
        this.consecIncrSmallCount = 0;
      }

      if (!useLargeIncrement) {
        this.consecIncrSmallCount++;
        this.lastIncrSmallDirection = direction;
        this.lastIncrSmallInputTime = time;
      }

      isAccelActive = this.consecIncrSmallCount >= this.accelInputCountThreshold;

      if (isAccelActive) {
        useLargeIncrement = true;
      }
    }

    if (direction !== 0) {
      this.changeSelectedAltitude(startValue, direction, useLargeIncrement);
    }
  }

  /**
   * Sets the selected altitude to a specific value.
   * @param altitudeFeet The altitude to set, in feet.
   */
  private setSelectedAltitude(altitudeFeet: number): void {
    const isMetric = this.altimeterMetricSetting?.value ?? false;

    let min: number, max: number, unit: Unit<UnitFamily.Distance>;
    if (isMetric) {
      min = this.minValueMetric;
      max = this.maxValueMetric;
      unit = UnitType.METER;
    } else {
      min = this.minValue;
      max = this.maxValue;
      unit = UnitType.FOOT;
    }

    const valueToSet = UnitType.FOOT.convertFrom(
      MathUtils.clamp(UnitType.FOOT.convertTo(altitudeFeet, unit), min, max),
      unit
    );

    if (valueToSet !== SimVar.GetSimVarValue(this.altitudeHoldSlotSimVar, SimVarValueType.Feet)) {
      SimVar.SetSimVarValue(this.altitudeHoldSlotSimVar, SimVarValueType.Feet, valueToSet);
    }
  }

  /**
   * Increments or decrements the selected altitude setting. The amount the setting is changed depends on whether the
   * PFD altimeter metric mode is enabled. The value of the setting after the change is guaranteed to be a round number
   * in the appropriate units (nearest 100 feet or 50 meters).
   * @param startValue The value from which to change, in feet.
   * @param direction The direction of the change: `1` for increment, `-1` for decrement.
   * @param useLargeIncrement Whether to change the altitude by the large increment (1000 feet/500 meters) instead of
   * the small increment (100 feet/50 meters). False by default.
   */
  private changeSelectedAltitude(startValue: number, direction: -1 | 1, useLargeIncrement = false): void {
    const roundFunc = direction === 1 ? Math.floor : Math.ceil;
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
      Utils.Clamp((lockAlt ? roundFunc(startValueConverted / incrSmall) * incrSmall : startValueConverted) + direction * (useLargeIncrement ? incrLarge : incrSmall), min, max),
      units
    );

    // Check if we need to set the new altitude to a stop instead.
    if (this.stops.length > 0) {
      let nextStopIndex = this.stops.matchIndex(startValue);
      if (direction === 1) {
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
}