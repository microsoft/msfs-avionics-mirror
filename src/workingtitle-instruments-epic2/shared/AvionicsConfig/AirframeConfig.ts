import { GameStateProvider, SimVarValueType, Wait } from '@microsoft/msfs-sdk';

import { BaseVSpeedDefinition, VSpeedType } from '../Performance';

export enum SpeedLimitUnit {
  Kias,
  Keas,
}

export enum ConfigurationLimitType {
  Flaps,
  Gear,
  GearExtend,
  GearRetract,
}

/** A definition for an aircraft configuration limit */
export interface ConfigurationLimit {
  /** The type of this config limit, either a flap or landing gear limit */
  type: ConfigurationLimitType;
  /** The airspeed limit */
  airspeed: number;
  /** The flap handle index, if applicable */
  flapHandleIndex?: number;
}

/** A configuration object for the airframe. */
export class AirframeConfig {
  /** The maximum operating speed in knots. */
  public readonly vmo?: number;

  /** The units for Vmo. */
  public readonly vmoUnit?: SpeedLimitUnit;

  /** The maximum operating mach number. */
  public readonly mmo?: number;

  public readonly vSpeeds: BaseVSpeedDefinition[] = [];

  public readonly configurationLimits: ConfigurationLimit[] = [];

  // Weight information
  public basicOperatingWeight?: number;
  public avgPaxWeight?: number;

  /**
   * Creates a new SensorsConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element | undefined) {

    if (element !== undefined) {
      const speedLimitElements = element.querySelectorAll(':scope>SpeedLimits');
      if (speedLimitElements.length >= 1) {
        [this.vmo, this.vmoUnit, this.mmo, this.configurationLimits] = this.parseSpeedLimits(speedLimitElements[0]);
        if (speedLimitElements.length > 1) {
          console.warn('AirframeConfig: Multiple AirframeConfiguration>SpeedLimits elements found!');
        }
      } else {
        console.warn('AirframeConfig: No AirframeConfiguration>SpeedLimits element found!');
      }

      const vSpeedElement = element.querySelector(':scope>VSpeeds');
      if (vSpeedElement) {
        this.vSpeeds = this.parseVSpeeds(vSpeedElement);
      } else {
        console.warn('AirframeConfig: No AirframeConfiguration>VSpeeds element found!');
      }

      const bowElement = element.querySelector(':scope>BasicOperatingWeight');
      this.basicOperatingWeight = bowElement?.textContent ? parseInt(bowElement.textContent) : undefined;

      const paxWeightElement = element.querySelector(':scope>AveragePassengerWeight');
      this.avgPaxWeight = paxWeightElement?.textContent ? parseInt(paxWeightElement.textContent) : undefined;

      this.basicOperatingWeight = !isNaN(this.basicOperatingWeight ?? NaN) ? this.basicOperatingWeight : undefined;
      this.avgPaxWeight = !isNaN(this.avgPaxWeight ?? NaN) ? this.avgPaxWeight : undefined;
    } else {
      console.warn('AirframeConfig: No AirframeConfiguration element found!');
    }
  }

  /**
   * Parses v speed entries
   * @param element A configuration document element.
   * @returns An array containing V Speed definitions.
   */
  private parseVSpeeds(element: Element): BaseVSpeedDefinition[] {
    const speedDefinitionTags = element.querySelectorAll(':scope VSpeed');

    if (speedDefinitionTags.length < 1) {
      console.warn('AirframeConfig: No VSpeeds configured');
      return [];
    } else {
      const speedDefinitions: BaseVSpeedDefinition[] = [];
      for (const definition of speedDefinitionTags) {
        const definitionType = definition.parentElement?.tagName;
        const definitionLabel = definition.getAttribute('label');
        const definitionSpeed = definition.getAttribute('default');

        if (definitionType?.toLowerCase() !== 'landing' && definitionType?.toLowerCase() !== 'takeoff') {
          console.warn(`AirframeConfig: VSpeed definition with label ${definitionLabel} and speed ${definitionSpeed} has invalid parent tag. The parent tag must be either Landing or Takeoff. Defaulting to takeoff`);
        }

        if (!definitionLabel) {
          console.warn(`AirframeConfig: VSpeed definition with speed ${definitionSpeed} has invalid label. Defaulting to 'NA'`);
        }

        const defaultSpeed = Number(definitionSpeed);

        if (definitionSpeed && isNaN(defaultSpeed)) {
          console.warn(`AirframeConfig: VSpeed definition with label ${definitionLabel} has invalid default speed. Setting no default speed.`);
        }

        speedDefinitions.push({
          type: definitionType?.toLowerCase() === 'landing' ? VSpeedType.Landing : VSpeedType.Takeoff,
          label: definitionLabel ?? 'NA',
          speed: definitionSpeed && !isNaN(defaultSpeed) ? defaultSpeed : null
        });
      }

      return speedDefinitions;
    }
  }

  /**
   * Parses aiframe speed limits from configuration document elements.
   * @param element A configuration document element.
   * @returns An array containing Vmo, Vmo unit and Mmo, each element being undefined if invalid/not defined.
   */
  private parseSpeedLimits(element: Element): [number | undefined, SpeedLimitUnit | undefined, number | undefined, ConfigurationLimit[]] {
    let vmo = undefined;
    let vmoUnit = undefined;
    let mmo = undefined;
    const configLimits = [] as ConfigurationLimit[];

    const vmoElements = element.querySelectorAll(':scope>Vmo');
    if (vmoElements.length > 0) {
      vmo = this.parseSpeedElement(vmoElements[0]);
      if (vmoElements.length > 1) {
        console.warn('AirframeConfig: Multiple Vmo elements!');
      }

      const unit = vmoElements[0].getAttribute('unit')?.toLocaleLowerCase();
      if (unit === 'keas') {
        vmoUnit = SpeedLimitUnit.Keas;
      } else if (unit === 'kias') {
        vmoUnit = SpeedLimitUnit.Kias;
      } else {
        vmo = undefined;
        console.warn('AirframeConfig: Invalid Vmo unit! Must be KEAS or KIAS. Vmo invalid.', unit);
      }
    } else {
      console.warn('AirframeConfig: No Vmo element!');
    }

    const mmoElements = element.querySelectorAll(':scope>Mmo');
    if (mmoElements.length > 0) {
      mmo = this.parseSpeedElement(mmoElements[0]);
      if (mmoElements.length > 1) {
        console.warn('AirframeConfig: Multiple Mmo elements!');
      }
    }
    // Mmo can be undefined

    Wait.awaitSubscribable(GameStateProvider.get(), s => s === GameState.ingame, true).then(() => {
      configLimits.push(...this.parseFlapConfigs());
    });

    const gearElements = element.querySelectorAll(':scope>Gear');
    if (gearElements.length > 0) {
      configLimits.push(...this.parseGearConfigElement(gearElements));
    }

    return [vmo, vmoUnit, mmo, configLimits];
  }

  /**
   * Parses the flap configs
   * @returns Configuration limits for the flaps
   */
  private parseFlapConfigs(): ConfigurationLimit[] {
    const definitions: ConfigurationLimit[] = [];
    const numPositions = SimVar.GetSimVarValue('FLAPS NUM HANDLE POSITIONS', SimVarValueType.Number);

    for (let i = 1; i <= numPositions; i++) {
      const limit = SimVar.GetGameVarValue('AIRCRAFT FLAPS SPEED LIMIT', 'knot', i);
      if (limit > 1) {
        definitions.push({
          type: ConfigurationLimitType.Flaps,
          airspeed: Math.round(limit),
          flapHandleIndex: i
        });
      }
    }

    return definitions;
  }

  /**
   * Parse a landing gear configuration from an element.
   * @param elements Configuration document elements.
   * @returns The value or undefined if invalid.
   */
  private parseGearConfigElement(elements: NodeListOf<Element>): ConfigurationLimit[] {
    const definitions: ConfigurationLimit[] = [];

    for (const element of elements) {
      const speedLimit = Number(element.textContent);
      const gearType = element.getAttribute('type');
      const isGearRetract = gearType?.toLowerCase() === 'retract';
      const isGearExtend = gearType?.toLowerCase() === 'extend';

      let limitType = ConfigurationLimitType.Gear;
      if (isGearRetract) {
        limitType = ConfigurationLimitType.GearRetract;
      } else if (isGearExtend) {
        limitType = ConfigurationLimitType.GearExtend;
      }

      if (gearType && !isGearExtend && !isGearRetract) {
        console.warn('AirframeConfig: Invalid type specified for Gear element. Must be either \'extend\', \'retract\' or undefined. Defaulting to undefined type.');
      }

      if (isFinite(speedLimit)) {
        definitions.push({
          type: limitType,
          airspeed: Math.round(speedLimit)
        });
      } else {
        console.warn('AirframeConfig: Invalid speed limit for Gear element');
      }
    }

    return definitions;
  }

  /**
   * Parse a speed value from the text content of an element.
   * @param element A configuration document element.
   * @returns The value or undefined if invalid.
   */
  private parseSpeedElement(element: Element): number | undefined {
    const speedLimit = Number(element.textContent);
    if (isFinite(speedLimit)) {
      return speedLimit;
    }
    console.warn(`AirframeConfig: Invalid speed limit for ${element.tagName} element`);
  }
}
