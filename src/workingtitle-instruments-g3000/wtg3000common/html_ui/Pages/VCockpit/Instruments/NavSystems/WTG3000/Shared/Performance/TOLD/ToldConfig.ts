import { NumberUnitReadOnly, UnitFamily, UnitType } from '@microsoft/msfs-sdk';
import { Config, ResolvableConfig } from '../../Config/Config';
import { ToldRunwaySurfaceCondition } from './ToldTypes';

/**
 * A flaps configuration option for TOLD (takeoff/landing) performance calculations.
 */
export type ToldFlapsOption = {
  /** The name of this option. */
  name: string;

  /** The amount of flaps extension, in degrees, associated with this option. */
  extension: number;
};

/**
 * Flaps configuration options for TOLD (takeoff/landing) performance calculations.
 */
export type ToldFlapsOptions = {
  /** The index of the default flaps configuration option. */
  defaultIndex: number;

  /** Flaps configuration options. */
  options: readonly Readonly<ToldFlapsOption>[];
};

/**
 * Anti-ice options for TOLD (takeoff/landing) performance calculations.
 */
export type ToldAntiIceOptions = {
  /** The maximum tempreature at which the anti-ice ON option is selectable. */
  maxTemp: NumberUnitReadOnly<UnitFamily.Temperature>;
};

/**
 * States describing which TOLD (takeoff/landing) performance calculation thrust reverser settings are selectable.
 */
export enum ToldThrustReverserSelectable {
  /** Only the `false` thrust reverser setting is selectable. */
  OnlyFalse = 'OnlyFalse',

  /** Only the `true` thrust reverser setting is selectable. */
  OnlyTrue = 'OnlyTrue',

  /** Both the `true` and `false` thrust reverser settings are selectable. */
  Both = 'Both'
}

/**
 * A function which checks which of the TOLD (takeoff/landing) performance calculation thrust reverser settings are
 * selectable for a given set of conditions.
 * @param surface The runway surface condition.
 * @param flaps The name of the flaps setting.
 * @param antiIce Whether anti-ice is on.
 * @returns Which of the TOLD (takeoff/landing) performance calculation thrust reverser settings are selectable for the
 * specified set of conditions.
 */
export type ToldThrustReverserSelectableChecker = (surface: ToldRunwaySurfaceCondition, flaps?: string, antiIce?: boolean) => ToldThrustReverserSelectable;

/**
 * Thrust reverser options for TOLD (takeoff/landing) performance calculations.
 */
export type ToldThrustReverserOptions = {
  /** A configuration object which resolves to a function which checks which thrust reverser settings are selectable. */
  selectable: ResolvableConfig<ToldThrustReverserSelectableChecker>;
};

/**
 * Rolling takeoff options for takeoff performance calculations.
 */
export type ToldRollingTakeoffOptions = {
  /** The default rolling takeoff option. */
  defaultOption: boolean;
};

/**
 * Autothrottle options for TOLD (takeoff/landing) performance calculations.
 */
export type ToldAutothrottleOptions = {
  /** A placeholder. */
  placeHolder: boolean;
};

/**
 * Takeoff performance calculation configuration options.
 */
export type TakeoffPerfConfigurationOptions = {
  /** Flaps configuration options. If not defined, flaps options are not supported. */
  flaps?: Readonly<ToldFlapsOptions>;

  /** Anti-ice options. If not defined, anti-ice options are not supported. */
  antiIce?: Readonly<ToldAntiIceOptions>;

  /** Thrust reverser options. If not defined, thrust reverser options are not supported. */
  thrustReverser?: Readonly<ToldThrustReverserOptions>;

  /** Rolling takeoff options. If not defined, rolling takeoff options are not supported. */
  rolling?: Readonly<ToldRollingTakeoffOptions>;
};

/**
 * Landing performance calculation configuration options.
 */
export type LandingPerfConfigurationOptions = {
  /** Flaps configuration options. If not defined, flaps options are not supported. */
  flaps?: Readonly<ToldFlapsOptions>;

  /** Anti-ice options. If not defined, anti-ice options are not supported. */
  antiIce?: Readonly<ToldAntiIceOptions>;

  /** Thrust reverser options. If not defined, thrust reverser options are not supported. */
  thrustReverser?: Readonly<ToldThrustReverserOptions>;

  /** Autothrottle options. If not defined, autothrottle options are not supported. */
  autothrottle?: Readonly<ToldAutothrottleOptions>;
};

/**
 * A configuration object which defines options related to TOLD (takeoff/landing) performance calculations.
 */
export class ToldConfig implements Config {
  /** Takeoff options. */
  public readonly takeoff: Readonly<TakeoffPerfConfigurationOptions>;

  /** Landing options. */
  public readonly landing: Readonly<LandingPerfConfigurationOptions>;

  /**
   * Creates a new ToldConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element) {
    if (element.tagName !== 'TOLD') {
      throw new Error(`Invalid ToldConfig definition: expected tag name 'TOLD' but was '${element.tagName}'`);
    }

    this.takeoff = this.parseTakeoff(element.querySelector(':scope>Takeoff'));
    this.landing = this.parseLanding(element.querySelector(':scope>Landing'));
  }

  /**
   * Parses takeoff options from a configuration document element.
   * @param element A configuration document element.
   * @returns The takeoff options defined by the configuration document element.
   */
  private parseTakeoff(element: Element | null): TakeoffPerfConfigurationOptions {
    return {
      flaps: this.parseFlaps(element?.querySelector(':scope>Flaps') ?? null),
      antiIce: this.parseAntiIce(element?.querySelector(':scope>AntiIce') ?? null),
      thrustReverser: this.parseThrustReverser(element?.querySelector(':scope>ThrustReverser') ?? null),
      rolling: this.parseRollingTakeoff(element?.querySelector(':scope>Rolling') ?? null)
    };
  }

  /**
   * Parses takeoff options from a configuration document element.
   * @param element A configuration document element.
   * @returns The takeoff options defined by the configuration document element.
   */
  private parseLanding(element: Element | null): LandingPerfConfigurationOptions {
    return {
      flaps: this.parseFlaps(element?.querySelector(':scope>Flaps') ?? null),
      antiIce: this.parseAntiIce(element?.querySelector(':scope>AntiIce') ?? null),
      thrustReverser: this.parseThrustReverser(element?.querySelector(':scope>ThrustReverser') ?? null),
      autothrottle: this.parseAutothrottle(element?.querySelector(':scope>Autothrottle') ?? null)
    };
  }

  /**
   * Parses flaps options from a configuration document element.
   * @param element A configuration document element.
   * @returns The flaps options defined by the configuration document element, or `undefined` if the element is `null`.
   */
  private parseFlaps(element: Element | null): ToldFlapsOptions | undefined {
    if (element === null) {
      return undefined;
    }

    const options = Array.from(element.querySelectorAll(':scope>Option'))
      .map(option => this.parseFlapsOption(option))
      .filter(option => option !== undefined) as ToldFlapsOption[];

    if (options.length === 0) {
      return undefined;
    }

    let defaultIndex = 0;
    const defaultOption = element.getAttribute('default');
    if (defaultOption !== null) {
      defaultIndex = options.findIndex(option => option.name === defaultOption);
      if (defaultIndex < 0) {
        console.warn(`Invalid ToldConfig definition: unrecognized default flaps option '${defaultOption}', defaulting to the first defined option`);
        defaultIndex = 0;
      }
    }

    return { defaultIndex, options };
  }

  /**
   * Parses a single flaps option from a configuration document element.
   * @param element A configuration document element.
   * @returns The flaps option defined by the configuration document element, or `undefined` if the element is malformed.
   */
  private parseFlapsOption(element: Element): ToldFlapsOption | undefined {
    const name = element.textContent;
    if (name === null || name.length === 0) {
      console.warn('Invalid ToldConfig definition: missing or empty flaps option name, discarding option');
      return undefined;
    }

    const extension = Number(element.getAttribute('extension') ?? undefined);
    if (!isFinite(extension)) {
      console.warn(`Invalid ToldConfig definition: missing or unrecognized flaps option extension value for option '${name}', discarding option`);
      return undefined;
    }

    return { name, extension };
  }

  /**
   * Parses anti-ice options from a configuration document element.
   * @param element A configuration document element.
   * @returns The anti-ice options defined by the configuration document element, or `undefined` if the element is `null`.
   */
  private parseAntiIce(element: Element | null): ToldAntiIceOptions | undefined {
    if (element === null) {
      return undefined;
    }

    const maxTemp = UnitType.CELSIUS.createNumber(Infinity);
    const maxTempAttr = element.getAttribute('max-temp');
    if (maxTempAttr !== null) {
      const maxTempValue = Number(element.getAttribute('max-temp') ?? undefined);
      if (!isFinite(maxTempValue)) {
        console.warn('Invalid ToldConfig definition: unrecognized maximum anti-ice temperature, defaulting to no maximum');
      } else {
        maxTemp.set(maxTempValue);
      }
    }

    return { maxTemp: maxTemp.readonly };
  }

  /**
   * Parses thrust reverser options from a configuration document element.
   * @param element A configuration document element.
   * @returns The thrust reverser options defined by the configuration document element, or `undefined` if the element is `null`.
   */
  private parseThrustReverser(element: Element | null): ToldThrustReverserOptions | undefined {
    if (element === null) {
      return undefined;
    }

    return {
      selectable: new ThrustReverserSelectableConfig(element)
    };
  }

  /**
   * Parses rolling takeoff options from a configuration document element.
   * @param element A configuration document element.
   * @returns The rolling takeoff options defined by the configuration document element, or `undefined` if the element is `null`.
   */
  private parseRollingTakeoff(element: Element | null): ToldRollingTakeoffOptions | undefined {
    if (element === null) {
      return undefined;
    }

    let defaultOption = false;
    const defaultString = element.getAttribute('default');
    switch (defaultString?.toLowerCase()) {
      case undefined:
      case 'false':
        break;
      case 'true':
        defaultOption = true;
        break;
      default:
        console.warn('Invalid ToldConfig definition: unrecognized default rolling takeoff option (must be true or false), defaulting to false');
    }

    return { defaultOption };
  }

  /**
   * Parses autothrottle options from a configuration document element.
   * @param element A configuration document element.
   * @returns The autothrottle options defined by the configuration document element, or `undefined` if the element is `null`.
   */
  private parseAutothrottle(element: Element | null): ToldAutothrottleOptions | undefined {
    if (element === null) {
      return undefined;
    }

    return { placeHolder: true };
  }
}

/**
 * A configuration object which defines selectable TOLD (takeoff/landing) performance calculation thrust reverser
 * settings.
 */
class ThrustReverserSelectableConfig implements ResolvableConfig<ToldThrustReverserSelectableChecker> {
  private static readonly SURFACE_KEYS: Record<ToldRunwaySurfaceCondition, string> = {
    [ToldRunwaySurfaceCondition.Dry]: 'dry',
    [ToldRunwaySurfaceCondition.Wet]: 'wet',
  };

  public readonly isResolvableConfig = true;

  private readonly conditions = new Map<string, ToldThrustReverserSelectable>();

  /**
   * Creates a new ThrustReverserSelectableConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element) {
    if (element.tagName !== 'ThrustReverser') {
      throw new Error(`Invalid ThrustReverserSelectableConfig definition: expected tag name 'ThrustReverser' but was '${element.tagName}'`);
    }

    for (const conditionElement of element.querySelectorAll(':scope>Condition')) {
      const selectableString = conditionElement.textContent?.toLowerCase() ?? 'false';
      let selectable: ToldThrustReverserSelectable;
      switch (selectableString) {
        case 'false':
        case 'off':
          selectable = ToldThrustReverserSelectable.OnlyFalse;
          break;
        case 'true':
        case 'on':
          selectable = ToldThrustReverserSelectable.OnlyTrue;
          break;
        case 'both':
          selectable = ToldThrustReverserSelectable.Both;
          break;
        default:
          continue;
      }

      let surface: string[];
      const surfaceString = conditionElement.getAttribute('surface')?.toLowerCase();
      if (surfaceString === 'dry' || surfaceString === 'wet' || surfaceString === 'contaminated') {
        surface = [surfaceString];
      } else {
        surface = ['dry', 'wet', 'contaminated'];
      }

      const flaps = conditionElement.getAttribute('flaps') ?? '';

      let antiIce: string[];
      switch (conditionElement.getAttribute('anti-ice')?.toLowerCase()) {
        case 'false':
        case 'off':
          antiIce = ['false'];
          break;
        case 'true':
        case 'on':
          antiIce = ['true'];
          break;
        default:
          antiIce = ['false', 'true'];
      }

      for (let i = 0; i < surface.length; i++) {
        for (let j = 0; j < antiIce.length; j++) {
          const key = `${surface[i]}::${antiIce[j]}::${flaps}`;
          this.conditions.set(key, selectable);
        }
      }
    }
  }

  /** @inheritdoc */
  public resolve(): ToldThrustReverserSelectableChecker {
    return (surface: ToldRunwaySurfaceCondition, flaps?: string, antiIce?: boolean): ToldThrustReverserSelectable => {
      const key = `${ThrustReverserSelectableConfig.SURFACE_KEYS[surface]}::${antiIce ?? false}::${flaps ?? ''}`;

      let selectable = this.conditions.get(key);
      if (selectable !== undefined) {
        return selectable;
      }

      if (flaps !== undefined) {
        const anyFlapsKey = `${ThrustReverserSelectableConfig.SURFACE_KEYS[surface]}::${antiIce}::`;
        selectable = this.conditions.get(anyFlapsKey);
      }

      return selectable ?? ToldThrustReverserSelectable.Both;
    };
  }
}