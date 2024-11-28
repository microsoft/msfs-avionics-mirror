import { AttitudeAircraftSymbolColor } from '@microsoft/msfs-garminsdk';

import { Config, ConfigFactory } from '../Config/Config';
import { ConfigUtils } from '../Config/ConfigUtils';
import { NumericBusConfigContext, NumericConfig, NumericConfigResult } from '../Config/NumericConfig';

/**
 * An option for horizon display flight director cue style support.
 */
export type HorizonDirectorCueOption = 'single' | 'dual' | 'both';

/**
 * A definition for horizon display roll limit indicators.
 */
export type HorizonRollLimitIndicatorsDefinition = {
  /** A factory that generates the roll angle magnitude, in degrees, at which to position the left roll limit indicator. */
  leftRollLimit?: (context: NumericBusConfigContext) => NumericConfigResult;

  /** A factory that generates the roll angle magnitude, in degrees, at which to position the right roll limit indicator. */
  rightRollLimit?: (context: NumericBusConfigContext) => NumericConfigResult;
};

/**
 * A definition for a horizon display pitch limit indicator.
 */
export type HorizonPitchLimitIndicatorDefinition = {
  /** A factory that generates the pitch angle, in degrees, at which to position the indicator. */
  pitchLimit?: (context: NumericBusConfigContext) => NumericConfigResult;

  /** A factory that generates the angle of attack value, in degrees, at which to position the indicator. */
  aoaLimit?: (context: NumericBusConfigContext) => NumericConfigResult;

  /** A factory that generates the normalized angle of attack value, at which to position the indicator. */
  normAoaLimit?: (context: NumericBusConfigContext) => NumericConfigResult;

  /**
   * A factory that generates the offset of the airplane's pitch from the indicated pitch limit, in degrees, at which
   * to show the indicator.
   */
  showPitchOffsetThreshold: (context: NumericBusConfigContext) => NumericConfigResult;

  /**
   * A factory that generates the offset of the airplane's pitch from the indicated pitch limit, in degrees, at which
   * to hide the indicator. If not defined, then `showPitchOffsetThreshold` should be used to generate the offset
   * instead.
   */
  hidePitchOffsetThreshold?: (context: NumericBusConfigContext) => NumericConfigResult;
};

/**
 * A configuration object which defines PFD horizon display options.
 */
export class HorizonConfig implements Config {
  /** Flight director cue style support. */
  public readonly directorCue: HorizonDirectorCueOption;

  /** The color of the symbolic aircraft. */
  public readonly symbolColor: AttitudeAircraftSymbolColor;

  /** Whether to show the roll indicator arc. */
  public readonly showRollArc: boolean;

  /** Whether to render the roll indicator with a ground pointer or a sky pointer. */
  public readonly rollPointerStyle: 'ground' | 'sky';

  /** Whether to support advanced SVT features. */
  public readonly advancedSvt: boolean;

  /** A definition for the roll limit indicators, or `undefined` if the roll limit indicators should not be displayed. */
  public readonly rollLimitIndicatorsDef?: Readonly<HorizonRollLimitIndicatorsDefinition>;

  /** A definition for the pitch limit indicator, or `undefined` if the pitch limit indicator should not be displayed. */
  public readonly pitchLimitIndicatorDef?: Readonly<HorizonPitchLimitIndicatorDefinition>;

  /**
   * Creates a new HorizonConfig from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  public constructor(element: Element | undefined, factory: ConfigFactory) {
    if (element === undefined) {
      this.directorCue = 'single';
      this.symbolColor = 'yellow';
      this.showRollArc = true;
      this.rollPointerStyle = 'ground';
      this.advancedSvt = false;
    } else {
      if (element.tagName !== 'Horizon') {
        throw new Error(`Invalid HorizonConfig definition: expected tag name 'Horizon' but was '${element.tagName}'`);
      }

      const directorCue = element.getAttribute('director-cue')?.toLowerCase();
      switch (directorCue) {
        case 'single':
        case undefined:
          this.directorCue = 'single';
          break;
        case 'dual':
          this.directorCue = 'dual';
          break;
        case 'both':
          this.directorCue = 'both';
          break;
        default:
          console.warn(`Invalid HorizonConfig definition: unrecognized director cue option "${directorCue}". Defaulting to "single".`);
          this.directorCue = 'single';
      }

      const symbolColor = element.getAttribute('symbol-color')?.toLowerCase();
      switch (symbolColor) {
        case 'yellow':
        case undefined:
          this.symbolColor = 'yellow';
          break;
        case 'white':
          this.symbolColor = 'white';
          break;
        default:
          console.warn(`Invalid HorizonConfig definition: unrecognized symbolic aircraft color option "${symbolColor}". Defaulting to "yellow".`);
          this.symbolColor = 'yellow';
      }

      const showRollArc = ConfigUtils.parseBoolean(element.getAttribute('roll-arc'), true);
      if (showRollArc === undefined) {
        console.warn('Invalid HorizonConfig definition: unrecognized "roll-arc" option (expected "true" or "false"). Defaulting to true.');
        this.showRollArc = true;
      } else {
        this.showRollArc = showRollArc;
      }

      const rollPointerStyle = element.getAttribute('roll-pointer')?.toLowerCase();
      switch (rollPointerStyle) {
        case 'ground':
        case undefined:
          this.rollPointerStyle = 'ground';
          break;
        case 'sky':
          this.rollPointerStyle = 'sky';
          break;
        default:
          console.warn(`Invalid HorizonConfig definition: unrecognized roll pointer option "${rollPointerStyle}" (expected "ground" or "sky"). Defaulting to "ground".`);
          this.rollPointerStyle = 'ground';
      }

      const advancedSvt = ConfigUtils.parseBoolean(element.getAttribute('advanced-svt'), false);
      if (advancedSvt === undefined) {
        console.warn('Invalid HorizonConfig definition: unrecognized "advanced-svt" option (expected "true" or "false"). Defaulting to false.');
        this.advancedSvt = false;
      } else {
        this.advancedSvt = advancedSvt;
      }

      this.rollLimitIndicatorsDef = this.parseRollLimitIndicatorsDef(element.querySelector(':scope>RollLimit'), factory);
      this.pitchLimitIndicatorDef = this.parsePitchLimitIndicatorDef(element.querySelector(':scope>PitchLimit'), factory);
    }
  }

  /**
   * Parses a roll limit indicators definition from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   * @returns The roll limit indicators definition defined by the configuration document element.
   */
  private parseRollLimitIndicatorsDef(element: Element | null, factory: ConfigFactory): HorizonRollLimitIndicatorsDefinition | undefined {
    if (element) {
      const leftRollLimit = this.parseNumericFactory(element.querySelector(':scope>LeftRoll'), factory);
      const rightRollLimit = this.parseNumericFactory(element.querySelector(':scope>RightRoll'), factory);

      if (leftRollLimit || rightRollLimit) {
        return {
          leftRollLimit,
          rightRollLimit
        };
      }
    }

    return undefined;
  }

  /**
   * Parses a pitch limit indicator definition from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   * @returns The pitch limit indicator definition defined by the configuration document element.
   */
  private parsePitchLimitIndicatorDef(element: Element | null, factory: ConfigFactory): HorizonPitchLimitIndicatorDefinition | undefined {
    if (element) {
      const showPitchOffsetThreshold = this.parseNumericFactory(element.querySelector(':scope>ShowOffset'), factory);
      const hidePitchOffsetThreshold = this.parseNumericFactory(element.querySelector(':scope>HideOffset'), factory);

      if (showPitchOffsetThreshold) {
        const def: HorizonPitchLimitIndicatorDefinition = {
          showPitchOffsetThreshold,
          hidePitchOffsetThreshold
        };

        const pitchLimit = this.parseNumericFactory(element.querySelector(':scope>Pitch'), factory);
        if (pitchLimit) {
          def.pitchLimit = pitchLimit;
          return def;
        } else {
          const aoaLimit = this.parseNumericFactory(element.querySelector(':scope>Aoa'), factory);
          if (aoaLimit) {
            def.aoaLimit = aoaLimit;
            return def;
          } else {
            const normAoaLimit = this.parseNumericFactory(element.querySelector(':scope>NormAoa'), factory);
            if (normAoaLimit) {
              def.normAoaLimit = normAoaLimit;
              return def;
            }
          }
        }

        console.warn('Invalid HorizonConfig definition: PitchLimit tag is missing a Pitch, Aoa, or NormAoa child');
      } else {
        console.warn('Invalid HorizonConfig definition: PitchLimit tag is missing ShowOffset child');
      }
    }

    return undefined;
  }

  /**
   * Parses a numeric factory from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   * @returns The numeric factory defined by the configuration document element, or `undefined` if a factory could not
   * be parsed.
   */
  private parseNumericFactory(element: Element | null, factory: ConfigFactory): ((context: NumericBusConfigContext) => NumericConfigResult) | undefined {
    if (!element) {
      return undefined;
    }

    const child = element.children[0];
    if (child) {
      try {
        const config = factory.create(child);
        if (config === undefined || !('isNumericConfig' in config)) {
          console.warn(`Invalid HorizonConfig definition: ${element.tagName} does not define a numeric constant or a numeric config. Discarding option.`);
        } else {
          return (config as NumericConfig).resolve();
        }
      } catch (e) {
        console.warn(e);
      }
    } else {
      const value = ConfigUtils.parseNumber(element.textContent);
      if (typeof value === 'number') {
        return () => {
          return { value };
        };
      } else {
        console.warn(`Invalid HorizonConfig definition: ${element.tagName} does not define a numeric constant or a numeric config. Discarding option.`);
      }
    }

    return undefined;
  }
}
