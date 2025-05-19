import { ComRadioIndex, ComSpacing, NavRadioIndex, Subscribable } from '@microsoft/msfs-sdk';
import { ComRadio, NavRadio } from './G3XRadioTypes';

/**
 * A provider of data for G3X Touch radios.
 */
export interface G3XRadiosDataProvider {
  /**
   * Providers of data for COM radios, keyed by the radio's G3X Touch-assigned index. If a radio is not supported, then
   * its provider will not exist.
   */
  readonly comRadioDataProviders: Readonly<Partial<Record<1 | 2, G3XComRadioDataProvider>>>;

  /**
   * Providers of data for NAV radios, keyed by the radio's G3X Touch-assigned index. If a radio is not supported, then
   * its provider will not exist.
   */
  readonly navRadioDataProviders: Readonly<Partial<Record<1 | 2, G3XNavRadioDataProvider>>>;
}

/**
 * A provider of common data for a G3X Touch NAV or COM radio.
 */
interface BaseG3XNavComRadioDataProvider {
  /** The radio's G3X Touch-assigned index. */
  readonly index: 1 | 2;

  /** Whether the radio is powered. */
  readonly isPowered: Subscribable<boolean>;

  /** The radio's active frequency, in megahertz. */
  readonly activeFrequency: Subscribable<number>;

  /** The radio's standby frequency, in megahertz. */
  readonly standbyFrequency: Subscribable<number>;

  /** The radio's volume setting, as a percent. */
  readonly volume: Subscribable<number>;
}

/**
 * A provider of data for a G3X Touch COM radio.
 */
export interface G3XComRadioDataProvider extends BaseG3XNavComRadioDataProvider {
  /** The ID of the radio. */
  readonly id: ComRadio;

  /** The sim index of the radio. */
  readonly simIndex: ComRadioIndex;

  /** The COM frequency spacing mode used by the radio. */
  readonly frequencySpacing: Subscribable<ComSpacing>;
}

/**
 * A provider of data for a G3X Touch NAV radio.
 */
export interface G3XNavRadioDataProvider extends BaseG3XNavComRadioDataProvider {
  /** The ID of the radio. */
  readonly id: NavRadio;

  /** The sim index of the radio. */
  readonly simIndex: NavRadioIndex;
}
