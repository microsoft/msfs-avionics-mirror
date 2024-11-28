import { Config, ConfigFactory, NumericConfig, NumericConfigResult } from '@microsoft/msfs-wtg3000-common';

import { AoaValueDefinitionFactory } from './AoaValueDefinitionFactory';

/**
 * A configuration object which defines angle of attack indicator options.
 */
export class AoaIndicatorConfig implements Config {
  /** Whether to display the advanced version of the AoA indicator. */
  public readonly advanced: boolean;

  /** Whether to show the digital readout of normalized angle of attack. */
  public readonly showDigitalReadout: boolean;

  /**
   * A factory that generates the normalized angle of attack value of the donut cue, or `undefined` if the donut cue
   * should not be displayed.
   */
  public readonly donutCueNormAoa?: AoaValueDefinitionFactory;

  /**
   * A factory that generates the normalized angle of attack value of the reference tick for the simple version of the
   * AoA indicator, or `undefined` if the reference tick should not be displayed.
   */
  public readonly referenceTickNormAoa?: AoaValueDefinitionFactory;

  /** Whether to show minor tick ticks for the advanced version of the AoA indicator. */
  public readonly showMinorTicks: boolean;

  /**
   * A factory that generates the normalized angle of attack warning threshold, or `undefined` if there is no warning
   * threshold.
   */
  public readonly warningThreshold?: AoaValueDefinitionFactory;

  /**
   * A factory that generates the normalized angle of attack caution threshold, or `undefined` if there is no caution
   * threshold.
   */
  public readonly cautionThreshold?: AoaValueDefinitionFactory;

  /**
   * Creates a new AoaIndicatorConfig from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  public constructor(element: Element | undefined, factory: ConfigFactory) {
    if (element === undefined) {
      this.advanced = false;
      this.showDigitalReadout = false;
      this.showMinorTicks = false;
    } else {
      if (element.tagName !== 'AoaIndicator') {
        throw new Error(`Invalid AoaIndicatorConfig definition: expected tag name 'AoaIndicator' but was '${element.tagName}'`);
      }

      const inheritFromId = element.getAttribute('inherit');
      const inheritFromElement = inheritFromId === null
        ? null
        : element.ownerDocument.querySelector(`AoaIndicator[id='${inheritFromId}']`);

      const inheritData = inheritFromElement ? new AoaIndicatorConfigData(inheritFromElement, factory) : undefined;
      const data = new AoaIndicatorConfigData(element, factory);

      this.advanced = data.advanced ?? inheritData?.advanced ?? false;
      this.showDigitalReadout = data.showDigitalReadout ?? inheritData?.showDigitalReadout ?? false;

      this.donutCueNormAoa = data.donutCueNormAoa ?? inheritData?.donutCueNormAoa;

      if (this.advanced) {
        this.showMinorTicks = data.showMinorTicks ?? inheritData?.showMinorTicks ?? true;
      } else {
        this.showMinorTicks = false;
        this.referenceTickNormAoa = data.referenceTickNormAoa ?? inheritData?.referenceTickNormAoa ?? this.getDefaultReferenceTickNormAoa();
      }

      this.warningThreshold = data.warningThreshold ?? inheritData?.warningThreshold ?? this.getDefaultWarningThreshold();
      this.cautionThreshold = data.cautionThreshold ?? inheritData?.cautionThreshold ?? this.getDefaultCautionThreshold();
    }
  }

  /**
   * Gets a factory that generates a default reference tick normalized angle of attack value for the simple version of
   * the AoA indicator.
   * @returns A factory that generates a default reference tick normalized angle of attack value for the simple version of
   * the AoA indicator, or `undefined` if the reference tick should not be displayed.
   */
  private getDefaultReferenceTickNormAoa(): AoaValueDefinitionFactory | undefined {
    if (this.advanced) {
      return undefined;
    } else {
      return () => {
        return { value: 0.6 };
      };
    }
  }

  /**
   * Gets a factory that generates a default normalized angle of attack warning threshold.
   * @returns A factory that generates a default normalized angle of attack warning threshold, or `undefined` if there
   * is no default threshold.
   */
  private getDefaultWarningThreshold(): AoaValueDefinitionFactory | undefined {
    return () => {
      return { value: 0.9 };
    };
  }

  /**
   * Gets a factory that generates a default normalized angle of attack caution threshold.
   * @returns A factory that generates a default normalized angle of attack caution threshold, or `undefined` if there
   * is no default threshold.
   */
  private getDefaultCautionThreshold(): AoaValueDefinitionFactory | undefined {
    if (this.advanced) {
      return () => {
        return { value: 0.7 };
      };
    } else {
      return undefined;
    }
  }
}

/**
 * An object containing PFD angle of attack indicator config data parsed from an XML document element.
 */
class AoaIndicatorConfigData {
  /** Whether to display the advanced version of the AoA indicator. */
  public readonly advanced?: boolean;

  /** Whether to show the digital readout of normalized angle of attack. */
  public readonly showDigitalReadout?: boolean;

  /** A factory that generates the normalized angle of attack value of the donut cue. */
  public readonly donutCueNormAoa?: AoaValueDefinitionFactory;

  /**
   * A factory that generates the normalized angle of attack value of the reference tick for the simple version of the
   * AoA indicator.
   */
  public readonly referenceTickNormAoa?: AoaValueDefinitionFactory;

  /** Whether to show minor tick ticks for the advanced version of the AoA indicator. */
  public readonly showMinorTicks?: boolean;

  /** A factory that generates the normalized angle of attack warning threshold. */
  public readonly warningThreshold?: AoaValueDefinitionFactory;

  /** A factory that generates the normalized angle of attack caution threshold. */
  public readonly cautionThreshold?: AoaValueDefinitionFactory;

  /**
   * Creates a new AoaIndicatorConfigData from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  public constructor(element: Element | undefined, factory: ConfigFactory) {
    if (element === undefined) {
      return;
    }

    const advancedAttr = element.getAttribute('advanced')?.toLowerCase();
    switch (advancedAttr) {
      case 'true':
        this.advanced = true;
        break;
      case 'false':
        this.advanced = false;
        break;
      case undefined:
        break;
      default:
        console.warn('Invalid AoaIndicatorConfig definition: invalid "advanced" option (must be "true" or "false")');
    }

    const showDigitalReadoutAttr = element.getAttribute('readout')?.toLowerCase();
    switch (showDigitalReadoutAttr) {
      case 'true':
        this.showDigitalReadout = true;
        break;
      case 'false':
        this.showDigitalReadout = false;
        break;
      case undefined:
        break;
      default:
        console.warn('Invalid AoaIndicatorConfig definition: invalid "readout" option (must be "true" or "false")');
    }

    const showMinorTicksAttr = element.getAttribute('minor-ticks')?.toLowerCase();
    switch (showMinorTicksAttr) {
      case 'true':
        this.showMinorTicks = true;
        break;
      case 'false':
        this.showMinorTicks = false;
        break;
      case undefined:
        break;
      default:
        console.warn('Invalid AoaIndicatorConfig definition: invalid "minor-ticks" option (must be "true" or "false")');
    }

    this.donutCueNormAoa = this.parseAoaValue(element.querySelector(':scope>DonutCue'), factory);
    this.referenceTickNormAoa = this.parseAoaValue(element.querySelector(':scope>ReferenceTick'), factory);
    this.warningThreshold = this.parseAoaValue(element.querySelector(':scope>Warning'), factory);
    this.cautionThreshold = this.parseAoaValue(element.querySelector(':scope>Caution'), factory);
  }

  /**
   * Parses a factory for a normalized angle of attack value from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   * @returns A factory for a normalized angle of attack value defined by the specified element, or `undefined` if
   * `element` is `null`.
   */
  private parseAoaValue(element: Element | null, factory: ConfigFactory): ((context: any) => NumericConfigResult) | undefined {
    const child = element?.children[0];
    if (!child) {
      return undefined;
    }

    try {
      const config = factory.create(child);

      if (config === undefined || !('isNumericConfig' in config)) {
        console.warn(`Invalid AoaIndicatorConfig definition: angle of attack value ${element.tagName} is not a numeric config. Discarding option.`);
        return undefined;
      }

      return (config as NumericConfig).resolve();
    } catch (e) {
      console.warn(e);
    }

    return undefined;
  }
}
