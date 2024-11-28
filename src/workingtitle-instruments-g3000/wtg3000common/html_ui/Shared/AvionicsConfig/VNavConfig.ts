import { MathUtils } from '@microsoft/msfs-sdk';

import { Config } from '../Config/Config';
import { LookupTableConfig } from '../Config/LookupTableConfig';
import { NumericBusConfig, NumericConfig, NumericConfigResult } from '../Config/NumericConfig';
import { FmsAirframeSpeedLimitContext } from '../FmsSpeed/FmsSpeedTypes';

/**
 * A configuration object which defines options related to VNAV.
 */
export class VNavConfig implements Config {
  /** Whether advanced VNAV is enabled. */
  public readonly advanced: boolean;

  /** A config which defines options for FMS speeds. */
  public readonly fmsSpeeds?: FmsSpeedsConfig;

  /**
   * Creates a new VNavConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   */
  public constructor(baseInstrument: BaseInstrument, element: Element | undefined) {
    if (element === undefined) {
      this.advanced = false;
    } else {
      if (element.tagName !== 'VNAV') {
        throw new Error(`Invalid VNavConfig definition: expected tag name 'VNAV' but was '${element.tagName}'`);
      }

      const advanced = element.getAttribute('advanced');
      switch (advanced?.toLowerCase()) {
        case 'true':
          this.advanced = true;
          break;
        case 'false':
          this.advanced = false;
          break;
        default:
          console.warn('Invalid VNavConfig definition: unrecognized advanced option (expected \'true\' or \'false\'). Defaulting to false.');
          this.advanced = false;
      }

      if (this.advanced) {
        this.fmsSpeeds = this.parseFmsSpeeds(baseInstrument, element.querySelector(':scope>FmsSpeeds'));
      }
    }
  }

  /**
   * Parses the advanced VNAV option from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns Whether advanced VNAV is enabled.
   */
  private parseFmsSpeeds(baseInstrument: BaseInstrument, element: Element | null): FmsSpeedsConfig {
    if (element !== null) {
      try {
        return new FmsSpeedsConfig(baseInstrument, element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new FmsSpeedsConfig(baseInstrument, undefined);
  }
}

/**
 * General FMS speed limits.
 */
export type FmsSpeedsGeneralLimits = {
  /** The minimum indicated airspeed, in knots. */
  minimumIas: number;

  /** The maximum indicated airspeed, in knots. */
  maximumIas: number;

  /** The minimum mach number. */
  minimumMach: number;

  /** The maximum mach number. */
  maximumMach: number;
};

/**
 * Airframe FMS speed limits.
 */
export type FmsAirframeSpeedLimits = {
  /** A config which defines the airframe's maximum indicated airspeed limit. */
  ias: FmsAirframeSpeedLimitConfig;

  /** A config which defines the airframe's maximum mach number limit. */
  mach: FmsAirframeSpeedLimitConfig;
};

/**
 * A definition for an FMS aircraft configuration speed limit setting.
 */
export type FmsConfigurationSpeedDefinition = {
  /** The type of configuration limit. */
  type: 'flaps' | 'gear';

  /**
   * The gear or flaps extension threshold required to activate the configuration limit. For gear, the value is
   * expressed as a percent of full extension. For glaps, the value is expressed as an angle in degrees.
   */
  extension: number;

  /** The display name of the configuration limit. */
  name: string;

  /** The configuration limit's minimum allowed value, in knots. */
  minimumValue: number;

  /** The configuration limit's maximum allowed value, in knots. */
  maximumValue: number;

  /** The configuration limit's default value, in knots. */
  defaultValue: number;
};

/**
 * A pre-defined FMS speed schedule.
 */
export type FmsSpeedBaseSchedule = {
  /** The name of this schedule. */
  name: string;

  /** Whether this schedule is a default schedule. */
  isDefault: boolean;

  /** This schedule's target indicated airspeed, in knots. */
  ias: number;

  /** This schedule's target mach number. */
  mach: number;
}

/**
 * A pre-defined FMS climb schedule.
 */
export type FmsSpeedClimbSchedule = FmsSpeedBaseSchedule & {
  /** The type of this schedule. */
  type: 'climb';
}

/**
 * A pre-defined FMS cruise schedule.
 */
export type FmsSpeedCruiseSchedule = FmsSpeedBaseSchedule & {
  /** The type of this schedule. */
  type: 'cruise';
}

/**
 * A pre-defined FMS descent schedule.
 */
export type FmsSpeedDescentSchedule = FmsSpeedBaseSchedule & {
  /** The type of this schedule. */
  type: 'descent';

  /** This schedule's target flight path angle. */
  fpa: number;
}

/**
 * A configuration object which defines options related to FMS speeds.
 */
export class FmsSpeedsConfig implements Config {
  /** General speed limits. */
  public readonly generalLimits: Readonly<FmsSpeedsGeneralLimits>;

  /** Airframe speed limits. */
  public readonly airframeLimits: Readonly<FmsAirframeSpeedLimits>;

  /** Definitions for aircraft configuration speed limits, in order from highest to lowest speed. */
  public readonly configurationSpeeds: readonly Readonly<FmsConfigurationSpeedDefinition>[];

  /** Pre-defined climb schedules. */
  public readonly climbSchedules: readonly Readonly<FmsSpeedClimbSchedule>[];

  /** Pre-defined cruise schedules. */
  public readonly cruiseSchedules: readonly Readonly<FmsSpeedCruiseSchedule>[];

  /** Pre-defined descent schedules. */
  public readonly descentSchedules: readonly Readonly<FmsSpeedDescentSchedule>[];

  /**
   * Creates a new FmsSpeedsConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   */
  public constructor(baseInstrument: BaseInstrument, element: Element | undefined) {
    const designSpeeds = Simplane.getDesignSpeeds();

    this.generalLimits = {
      minimumIas: Math.round(designSpeeds.VS0),
      maximumIas: Math.round(designSpeeds.VNe),
      minimumMach: 0.2,
      maximumMach: 0.8
    };

    if (element === undefined) {
      this.airframeLimits = this.parseAirframeLimits(null);
      this.configurationSpeeds = [];
      this.climbSchedules = [];
      this.cruiseSchedules = [];
      this.descentSchedules = [];
    } else {
      if (element.tagName !== 'FmsSpeeds') {
        throw new Error(`Invalid FmsSpeedsConfig definition: expected tag name 'FmsSpeeds' but was '${element.tagName}'`);
      }

      this.parseGeneralLimits(element.querySelector(':scope>GeneralLimits'), this.generalLimits as FmsSpeedsGeneralLimits);
      this.airframeLimits = this.parseAirframeLimits(element.querySelector(':scope>AirframeLimits'));
      this.configurationSpeeds = this.parseConfigurationSpeeds(element.querySelector(':scope>ConfigurationSpeeds'));

      const schedules = element.querySelector(':scope>Schedules');
      this.climbSchedules = this.parseClimbSchedules(schedules);
      this.cruiseSchedules = this.parseCruiseSchedules(schedules);
      this.descentSchedules = this.parseDescentSchedules(schedules);
    }
  }

  /**
   * Parses general speed limits options from a configuration document element.
   * @param element A configuration document element.
   * @param limits The object to which to write the parsed options.
   */
  private parseGeneralLimits(element: Element | null, limits: FmsSpeedsGeneralLimits): void {
    if (element === null) {
      return;
    }

    const minimumIas = Math.round(Number(element.querySelector(':scope>Ias>Minimum')?.textContent ?? undefined));
    if (isNaN(minimumIas) || minimumIas < 1 || minimumIas > 999) {
      console.warn('Invalid FmsSpeedsConfig definition: unrecognized minimum IAS value (expected a number between 1 and 999)');
    } else {
      limits.minimumIas = minimumIas;
    }

    const maximumIas = Math.round(Number(element.querySelector(':scope>Ias>Maximum')?.textContent ?? undefined));
    if (isNaN(maximumIas) || maximumIas <= limits.minimumIas || maximumIas > 999) {
      console.warn('Invalid FmsSpeedsConfig definition: unrecognized maximum IAS value (expected a number between the minimum IAS value and 999)');
    } else {
      limits.maximumIas = maximumIas;
    }

    const minimumMach = MathUtils.round(Number(element.querySelector(':scope>Mach>Minimum')?.textContent ?? undefined), 0.01);
    if (isNaN(minimumMach) || minimumMach < 0.01 || minimumMach > 0.99) {
      console.warn('Invalid FmsSpeedsConfig definition: unrecognized minimum mach value (expected a number between 0.01 and 0.99)');
    } else {
      limits.minimumMach = minimumMach;
    }

    const maximumMach = MathUtils.round(Number(element.querySelector(':scope>Mach>Maximum')?.textContent ?? undefined), 0.01);
    if (isNaN(maximumMach) || maximumMach <= limits.minimumMach || maximumMach > 0.99) {
      console.warn('Invalid FmsSpeedsConfig definition: unrecognized maximum mach value (expected a number between the minimum mach value and 0.99)');
    } else {
      limits.maximumMach = maximumMach;
    }
  }

  /**
   * Parses airframe speed limits options from a configuration document element.
   * @param element A configuration document element.
   * @returns The airframe speed limit options defined by the configuration document element.
   */
  private parseAirframeLimits(element: Element | null): FmsAirframeSpeedLimits {
    let ias: FmsAirframeSpeedLimitConfig | undefined;
    const iasElement = element?.querySelector(':scope>Ias');
    if (iasElement) {
      try {
        ias = new FmsAirframeSpeedLimitConfig(iasElement);
      } catch (e) {
        console.warn(e);
        console.warn(`Defaulting FMS airframe maximum IAS limit to the general maximum IAS limit: ${this.generalLimits.maximumIas}`);
      }
    }
    ias ??= new FmsAirframeSpeedLimitConfig(this.generalLimits.maximumIas);

    let mach: FmsAirframeSpeedLimitConfig | undefined;
    const machElement = element?.querySelector(':scope>Mach');
    if (machElement) {
      try {
        mach = new FmsAirframeSpeedLimitConfig(machElement);
      } catch (e) {
        console.warn(e);
        console.warn(`Defaulting FMS airframe maximum mach limit to the general maximum mach limit: ${this.generalLimits.maximumMach}`);
      }
    }
    mach ??= new FmsAirframeSpeedLimitConfig(this.generalLimits.maximumMach);

    return { ias, mach };
  }

  /**
   * Parses aircraft configuration speed limit definitions from a configuration document element.
   * @param element A configuration document element.
   * @returns The aircraft configuration speed limit definitions defined by the configuration document element.
   */
  private parseConfigurationSpeeds(element: Element | null): FmsConfigurationSpeedDefinition[] {
    if (element === null) {
      return [];
    }

    let hasGear = false;
    let flapsExtension = -1;

    return Array.from(element.children)
      .filter(child => child.tagName === 'Flaps' || child.tagName === 'Gear')
      .map(child => {
        const name = child.getAttribute('name');
        if (name === null) {
          console.warn('Invalid FmsSpeedsConfig definition: missing configuration speed limit name');
          return null;
        }

        const extension = Number(child.getAttribute('extension') ?? undefined);
        if (isNaN(extension) || extension < 0) {
          console.warn('Invalid FmsSpeedsConfig definition: missing or unrecognized configuration speed limit extension value (expected a non-negative number)');
          return null;
        }

        const minimumValue = Math.round(Number(child.getAttribute('min') ?? undefined));
        if (isNaN(minimumValue) || minimumValue < this.generalLimits.minimumIas || minimumValue > this.generalLimits.maximumIas) {
          console.warn('Invalid FmsSpeedsConfig definition: missing or unrecognized configuration speed limit minimum value (expected number between the minimum and maximum IAS values defined in general limits)');
          return null;
        }

        const maximumValue = Math.round(Number(child.getAttribute('max') ?? undefined));
        if (isNaN(maximumValue) || maximumValue <= minimumValue || maximumValue > this.generalLimits.maximumIas) {
          console.warn('Invalid FmsSpeedsConfig definition: missing or unrecognized configuration speed limit maximum value (expected number between the limit\'s minimum value and the maximum IAS value defined in general limits)');
          return null;
        }

        const defaultValue = Math.round(Number(child.getAttribute('default') ?? undefined));
        if (isNaN(defaultValue) || defaultValue < minimumValue || defaultValue > maximumValue) {
          console.warn('Invalid FmsSpeedsConfig definition: missing or unrecognized configuration speed limit default value (expected a positive number between the limit\'s minimum and maximum values)');
          return null;
        }

        return {
          type: child.tagName === 'Flaps' ? 'flaps' : 'gear',
          name,
          extension,
          minimumValue,
          maximumValue,
          defaultValue
        } as FmsConfigurationSpeedDefinition;
      })
      .filter(def => {
        if (def === null) {
          return false;
        }

        if (def.type === 'gear') {
          // A maximum of one gear limit is allowed.
          if (hasGear) {
            console.warn('Invalid FmsSpeedsConfig definition: multiple gear speed limits detected (maximum allowed of one)');
            return false;
          } else {
            hasGear = true;
            return true;
          }
        } else {
          // Flaps limit extension value must be greater than the values of all flaps limits that come before it.
          if (def.extension <= flapsExtension) {
            console.warn('Invalid FmsSpeedsConfig definition: duplicate or decreasing flaps speed limit extension value detected');
            return false;
          } else {
            flapsExtension = def.extension;
            return true;
          }
        }
      }) as FmsConfigurationSpeedDefinition[];
  }

  /**
   * Parses climb schedules from a configuration document element.
   * @param element A configuration document element.
   * @returns The climb schedules defined by the configuration document element.
   */
  private parseClimbSchedules(element: Element | null): FmsSpeedClimbSchedule[] {
    if (element === null) {
      return [];
    }

    return Array.from(element.querySelectorAll(':scope>ClimbSchedule'))
      .map(child => {
        const name = child.getAttribute('name');
        if (name === null) {
          console.warn('Invalid FmsSpeedsConfig definition: missing speed schedule name');
          return null;
        }

        let isDefault: boolean;
        const defaultOption = child.getAttribute('default');
        switch (defaultOption?.toLowerCase()) {
          case 'true':
            isDefault = true;
            break;
          case 'false':
          case undefined:
            isDefault = false;
            break;
          default:
            isDefault = false;
            console.warn('Invalid FmsSpeedsConfig definition: unrecognized speed schedule default option (expected true or false). Defaulting to false');
        }

        const ias = Math.round(Number(child.querySelector(':scope>Ias')?.textContent ?? undefined));
        if (isNaN(ias) || ias < this.generalLimits.minimumIas || ias > this.generalLimits.maximumIas) {
          console.warn('Invalid FmsSpeedsConfig definition: missing or unrecognized speed schedule IAS value (expected a number between the minimum and maximum IAS values defined in general limits)');
          return null;
        }

        const mach = MathUtils.round(Number(child.querySelector(':scope>Mach')?.textContent ?? undefined), 0.01);
        if (isNaN(mach) || mach < this.generalLimits.minimumMach || mach > this.generalLimits.maximumMach) {
          console.warn('Invalid FmsSpeedsConfig definition: missing or unrecognized speed schedule mach value (expected a number between the minimum and maximum mach values defined in general limits)');
          return null;
        }

        return {
          type: 'climb',
          name,
          isDefault,
          ias,
          mach
        } as FmsSpeedClimbSchedule;
      })
      .filter(def => def !== null) as FmsSpeedClimbSchedule[];
  }

  /**
   * Parses cruise schedules from a configuration document element.
   * @param element A configuration document element.
   * @returns The cruise schedules defined by the configuration document element.
   */
  private parseCruiseSchedules(element: Element | null): FmsSpeedCruiseSchedule[] {
    if (element === null) {
      return [];
    }

    return Array.from(element.querySelectorAll(':scope>CruiseSchedule'))
      .map(child => {
        const name = child.getAttribute('name');
        if (name === null) {
          console.warn('Invalid FmsSpeedsConfig definition: missing speed schedule name');
          return null;
        }

        let isDefault: boolean;
        const defaultOption = child.getAttribute('default');
        switch (defaultOption?.toLowerCase()) {
          case 'true':
            isDefault = true;
            break;
          case 'false':
          case undefined:
            isDefault = false;
            break;
          default:
            isDefault = false;
            console.warn('Invalid FmsSpeedsConfig definition: unrecognized speed schedule default option (expected true or false). Defaulting to false');
        }

        const iasElement = child.querySelector(':scope>Ias');
        const machElement = child.querySelector(':scope>Mach');

        let ias: number, mach: number;

        if (iasElement === null && machElement === null) {
          // If there is no IAS or mach value defined, this is a non-speed-targeting cruise schedule.
          ias = mach = -1;
        } else {
          ias = Math.round(Number(iasElement?.textContent ?? undefined));
          if (isNaN(ias) || ias < this.generalLimits.minimumIas || ias > this.generalLimits.maximumIas) {
            console.warn('Invalid FmsSpeedsConfig definition: missing or unrecognized speed schedule IAS value (expected a number between the minimum and maximum IAS values defined in general limits)');
            return null;
          }

          mach = MathUtils.round(Number(machElement?.textContent ?? undefined), 0.01);
          if (isNaN(mach) || mach < this.generalLimits.minimumMach || mach > this.generalLimits.maximumMach) {
            console.warn('Invalid FmsSpeedsConfig definition: missing or unrecognized speed schedule mach value (expected a number between the minimum and maximum mach values defined in general limits)');
            return null;
          }
        }

        return {
          type: 'cruise',
          name,
          isDefault,
          ias,
          mach
        } as FmsSpeedCruiseSchedule;
      })
      .filter(def => def !== null) as FmsSpeedCruiseSchedule[];
  }

  /**
   * Parses descent schedules from a configuration document element.
   * @param element A configuration document element.
   * @returns The descent schedules defined by the configuration document element.
   */
  private parseDescentSchedules(element: Element | null): FmsSpeedDescentSchedule[] {
    if (element === null) {
      return [];
    }

    return Array.from(element.querySelectorAll(':scope>DescentSchedule'))
      .map(child => {
        const name = child.getAttribute('name');
        if (name === null) {
          console.warn('Invalid FmsSpeedsConfig definition: missing speed schedule name');
          return null;
        }

        let isDefault: boolean;
        const defaultOption = child.getAttribute('default');
        switch (defaultOption?.toLowerCase()) {
          case 'true':
            isDefault = true;
            break;
          case 'false':
          case undefined:
            isDefault = false;
            break;
          default:
            isDefault = false;
            console.warn('Invalid FmsSpeedsConfig definition: unrecognized speed schedule default option (expected true or false). Defaulting to false');
        }

        const ias = Math.round(Number(child.querySelector(':scope>Ias')?.textContent ?? undefined));
        if (isNaN(ias) || ias < this.generalLimits.minimumIas || ias > this.generalLimits.maximumIas) {
          console.warn('Invalid FmsSpeedsConfig definition: missing or unrecognized speed schedule IAS value (expected a number between the minimum and maximum IAS values defined in general limits)');
          return null;
        }

        const mach = MathUtils.round(Number(child.querySelector(':scope>Mach')?.textContent ?? undefined), 0.01);
        if (isNaN(mach) || mach < this.generalLimits.minimumMach || mach > this.generalLimits.maximumMach) {
          console.warn('Invalid FmsSpeedsConfig definition: missing or unrecognized speed schedule mach value (expected a number between the minimum and maximum mach values defined in general limits)');
          return null;
        }

        const fpa = MathUtils.round(Number(child.querySelector(':scope>Fpa')?.textContent ?? undefined), 0.01);
        if (isNaN(fpa) || fpa < -6 || fpa > -1.5) {
          console.warn('Invalid FmsSpeedsConfig definition: missing or unrecognized descent schedule FPA value (expected a number between -1.5 and -6)');
          return null;
        }

        return {
          type: 'descent',
          name,
          isDefault,
          ias,
          mach,
          fpa
        } as FmsSpeedDescentSchedule;
      })
      .filter(def => def !== null) as FmsSpeedDescentSchedule[];
  }
}

/**
 * A configuration object which defines a factory for an FMS airframe speed limit value.
 *
 * The speed limit value can be defined as a constant value, a one-dimensional lookup table keyed on pressure altitude,
 * or a value bound to an event bus topic.
 */
export class FmsAirframeSpeedLimitConfig implements NumericConfig {
  public readonly isResolvableConfig = true;
  public readonly isNumericConfig = true;

  /** The value of this config. */
  public readonly value: number | LookupTableConfig | NumericBusConfig;

  /**
   * Creates a new FmsAirframeSpeedLimitConfig with a constant speed limit value.
   * @param value A speed limit value.
   */
  public constructor(value: number);
  /**
   * Creates a new FmsAirframeSpeedLimitConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element);
  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(source: Element | number) {
    if (typeof source === 'number') {
      this.value = source;
      return;
    }

    if (source.tagName !== 'Ias' && source.tagName !== 'Mach') {
      throw new Error(`Invalid FmsAirframeSpeedLimitConfig definition: expected tag name 'Ias' or 'Mach' but was '${source.tagName}'`);
    }

    let value: number | LookupTableConfig | NumericBusConfig | undefined;

    const child = source?.children[0];
    if (child && child.tagName === 'LookupTable') {
      value = new LookupTableConfig(child);
    } else if (child && child.tagName === 'Bus') {
      value = new NumericBusConfig(child);
    } else {
      if (source.textContent === null) {
        throw new Error('Invalid FmsAirframeSpeedLimitConfig definition: undefined value');
      }

      const parsedValue = Number(source.textContent);
      if (!isNaN(parsedValue)) {
        value = parsedValue;
      }
    }

    if (value === undefined) {
      throw new Error('Invalid FmsAirframeSpeedLimitConfig definition: value was not a number, lookup table, or numeric bus config');
    }

    this.value = value;
  }

  /** @inheritdoc */
  public resolve(): (context: FmsAirframeSpeedLimitContext) => NumericConfigResult {
    const value = this.value;

    return (context: FmsAirframeSpeedLimitContext) => {
      if (typeof value === 'number') {
        return { value };
      } else if (value instanceof LookupTableConfig) {
        const table = value.resolve();
        const mappedValue = context.pressureAlt.map(pressureAlt => table.get(pressureAlt));

        return {
          value: mappedValue,

          destroy: () => {
            mappedValue.destroy();
          }
        };
      } else {
        return value.resolve()(context);
      }
    };
  }
}
