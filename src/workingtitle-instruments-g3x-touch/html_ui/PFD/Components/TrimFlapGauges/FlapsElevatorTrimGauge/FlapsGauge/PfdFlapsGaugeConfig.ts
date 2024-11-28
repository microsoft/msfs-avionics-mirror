import { Config } from '../../../../../Shared/Config/Config';

/**
 * A definition for a PFD flaps gauge scale tick mark.
 */
export type PfdFlapsGaugeScaleTickDef = {
  /** The angle value at which the tick mark is positioned, in degrees. */
  angle: number;

  /** The color of the line. */
  color: string;
};

/**
 * A definition for a PFD flags gauge scale range.
 */
export type PfdFlapsGaugeScaleRangeDef = {
  /** The minimum angle value to which the range extends, in degrees. */
  minAngle: number;

  /** The maximum angle value to which the range extends, in degrees. */
  maxAngle: number;

  /** The color of the range. */
  color: string;
};

/**
 * Flaps Gauge user settings.
 */
export class PfdFlapsGaugeConfig implements Config {
  /** The gauge scale's minimum angle, in degrees. */
  public readonly minAngle: number;

  /** The gauge scale's maximum angle, in degrees. */
  public readonly maxAngle: number;

  /** The gauge's scale tick marks. */
  public readonly scaleTicks: readonly Readonly<PfdFlapsGaugeScaleTickDef>[];

  /** The gauge's scale ranges. */
  public readonly scaleRanges: readonly Readonly<PfdFlapsGaugeScaleRangeDef>[];

  /**
   * Creates a new PfdFlapsGaugeConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element) {
    if (element.tagName !== 'FlapsGauge') {
      throw new Error(`Invalid PfdFlapsGaugeConfig definition: expected tag name 'FlapsGauge' but was '${element.tagName}'`);
    }

    const minAngle = Number(element.getAttribute('min-angle') ?? 0);
    if (isFinite(minAngle)) {
      this.minAngle = minAngle;
    } else {
      console.warn('Invalid PfdFlapsGaugeConfig definition: unrecognized "min-angle" option (must be a finite number). Defaulting to 0.');
      this.minAngle = 0;
    }

    const maxAngle = Number(element.getAttribute('max-angle') ?? NaN);
    if (isFinite(maxAngle) && maxAngle > minAngle) {
      this.maxAngle = maxAngle;
    } else {
      throw new Error('Invalid PfdFlapsGaugeConfig definition: missing or unrecognized "max-angle" option (must be a finite number that is greater than "min-angle")');
    }

    this.scaleTicks = this.parseScaleTickDefArray(element);
    this.scaleRanges = this.parseScaleRangeDefArray(element);
  }

  /**
   * Parses an array of scale tick mark definitions from a configuration document element.
   * @param element A configuration document element.
   * @returns An array of scale tick mark definitions defined by the configuration document element.
   */
  private parseScaleTickDefArray(element: Element): Readonly<PfdFlapsGaugeScaleTickDef>[] {
    const ticks: Readonly<PfdFlapsGaugeScaleTickDef>[] = [];

    const ticksElement = element.querySelector(':scope>ScaleTicks');
    if (ticksElement) {
      for (const tickElement of ticksElement.querySelectorAll(':scope>Tick')) {
        const tickDef = this.parseScaleTickDef(tickElement);
        if (tickDef) {
          ticks.push(tickDef);
        }
      }
    }

    return ticks;
  }

  /**
   * Parses a scale tick mark definition from a configuration document element.
   * @param element A configuration document element.
   * @returns The scale tick mark definition defined by the configuration document element, or `undefined` if one could
   * not be parsed.
   */
  private parseScaleTickDef(element: Element): PfdFlapsGaugeScaleTickDef | undefined {
    const angle = Number(element.getAttribute('angle') ?? NaN);
    if (!isFinite(angle)) {
      console.warn('Invalid PfdFlapsGaugeConfig definition: missing or unrecognized tick mark "angle" option (must be a finite number). Discarding tick mark.');
      return undefined;
    }

    const color = element.getAttribute('color') ?? 'white';

    return { angle, color };
  }

  /**
   * Parses an array of scale range definitions from a configuration document element.
   * @param element A configuration document element.
   * @returns An array of scale range definitions defined by the configuration document element.
   */
  private parseScaleRangeDefArray(element: Element): Readonly<PfdFlapsGaugeScaleRangeDef>[] {
    const ranges: Readonly<PfdFlapsGaugeScaleRangeDef>[] = [];

    const rangesElement = element.querySelector(':scope>ScaleRanges');
    if (rangesElement) {
      for (const rangeElement of rangesElement.querySelectorAll(':scope>Range')) {
        const rangeDef = this.parseScaleRangeDef(rangeElement);
        if (rangeDef) {
          ranges.push(rangeDef);
        }
      }
    }

    return ranges;
  }

  /**
   * Parses a scale range definition from a configuration document element.
   * @param element A configuration document element.
   * @returns The scale range definition defined by the configuration document element, or `undefined` if one could not
   * be parsed.
   */
  private parseScaleRangeDef(element: Element): PfdFlapsGaugeScaleRangeDef | undefined {
    const minAngle = Number(element.getAttribute('min-angle') ?? NaN);
    if (!isFinite(minAngle)) {
      console.warn('Invalid PfdFlapsGaugeConfig definition: missing or unrecognized range "min-angle" option (must be a finite number). Discarding range.');
      return undefined;
    }

    const maxAngle = Number(element.getAttribute('max-angle') ?? NaN);
    if (!isFinite(maxAngle) || maxAngle <= minAngle) {
      console.warn('Invalid PfdFlapsGaugeConfig definition: missing or unrecognized range "max-angle" option (must be a finite number that is greater than "min-angle"). Discarding range.');
      return undefined;
    }

    const color = element.getAttribute('color') ?? 'white';

    return { minAngle, maxAngle, color };
  }
}
