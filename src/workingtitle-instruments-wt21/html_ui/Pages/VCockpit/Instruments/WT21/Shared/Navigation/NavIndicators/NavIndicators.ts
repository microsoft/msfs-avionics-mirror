/* eslint-disable @typescript-eslint/ban-types */
import { Instrument, Subject, Subscribable } from '@microsoft/msfs-sdk';

import { NavBase, NavBaseControlEvents, NavBaseEvents, NavBaseFields } from '../NavBase';
import { NavSourceBase, NavSources } from '../NavSources/NavSourceBase';

/** NavBaseFields plus NavIndicator specific fields. */
type NavIndicatorFields<T extends readonly string[]> = NavBaseFields & Pick<NavIndicator<T>, 'source'>;

/** Just the fields that can have control events generated for them. */
export interface NavIndicatorControlFields<NavSourceNames extends readonly string[]> {
  /** The name of the source to set, or null to remove the source. */
  readonly source: NavSourceNames[number] | null;
}

/** Field changed events for NavIndicator fields. */
export type NavIndicatorEvents<T extends readonly string[], Indicator extends string[number]> =
  NavBaseEvents<`nav_ind_${Indicator}`, NavIndicatorFields<T>>;

/** Control events for changing field values of a NavIndicator. */
export type NavIndicatorControlEvents<
  NavSourceNames extends readonly string[],
  IndicatorNames extends readonly string[],
  Indicator extends IndicatorNames[number],
  Fields extends { [key: string]: any } = {},
> = NavBaseControlEvents<`nav_ind_${Indicator}`, Fields & NavIndicatorControlFields<NavSourceNames>>;

/** Represent a navigation indicator, like a course needle or bearing pointer.
 * Can only be pointed to 1 nav source at a time.
 * Gives visual components a single thing to subscribe to, while the actual source can be easily changed. */
export class NavIndicator<T extends readonly string[]> extends NavBase {

  private readonly _source = Subject.create<NavSourceBase<T> | null>(null);
  /** The nav source that is feeding data into the indicator fields.
   * Can only be changed with the {@link setSource} function. */
  public readonly source = this._source as Subscribable<NavSourceBase<T> | null>;

  /** NavIndicator constructor.
   * @param navSources The possible nav sources that could be pointed to.
   * @param sourceName The initial source to use, if any.
   */
  public constructor(protected readonly navSources: NavSources<T>, sourceName: T[number] | null = null) {
    super();
    this.setSource(sourceName);
  }

  /** Changes the source of this indicator.
   * All subjects will be republished with the current info from the new source.
   * @param newSourceName Name of new source, if any.
   */
  public setSource(newSourceName: T[number] | null): void {
    const oldSource = this.source.get();

    if (oldSource && oldSource.name === newSourceName) { return; }
    if (oldSource === null && newSourceName === null) { return; }

    const newSource = (newSourceName ? this.navSources.get(newSourceName) : null);

    if (oldSource) {
      this.setters.forEach((setter, key) => {
        oldSource[key].unsub(setter);
      });
    }

    this._source.set(newSource);

    if (newSource) {
      this.setters.forEach((setter, key) => {
        newSource[key].sub(setter, true);
      });
    } else {
      this.setters.forEach((setter) => {
        setter(null);
      });
    }
  }
}

/** Holds the nav indicators. */
export class NavIndicators<T extends readonly string[], U extends readonly string[]> implements Instrument {
  /** NavIndicators constructor.
   * @param indicators The nav indicators to hold. */
  public constructor(
    private readonly indicators = new Map<U[number], NavIndicator<T>>(),
  ) { }

  /** @inheritdoc */
  public init(): void {
    // todo
  }

  /** @inheritdoc */
  public onUpdate(): void {
    // todo
  }

  /** Gets a nav indicator.
   * @param key The name of the indicator to get.
   * @returns The indicator.
   * @throws Error if indicator not found.
   */
  public get(key: U[number]): NavIndicator<T> {
    const indicator = this.indicators.get(key);
    if (!indicator) {
      throw new Error('no nav indicator exists with given key: ' + key);
    } else {
      return indicator;
    }
  }
}