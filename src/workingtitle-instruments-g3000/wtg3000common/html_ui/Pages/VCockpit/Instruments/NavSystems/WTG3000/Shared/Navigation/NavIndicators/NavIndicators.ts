/* eslint-disable @typescript-eslint/ban-types */
import { Subject, Subscribable, Subscription } from '@microsoft/msfs-sdk';

import { AbstractNavBase, NavBase } from '../NavBase';
import { NavSource, NavSources } from '../NavSources/NavSource';

/** Just the fields that can have control events generated for them. */
export interface NavIndicatorControlFields<NavSourceName extends string> {
  /** The name of the source to set, or null to remove the source. */
  readonly source: NavSourceName | null;
}

/**
 * A nav indicator which presents data derived from a nav source. An indicator may only have up to one source at a
 * time, but its source can be changed.
 */
export interface NavIndicator<NameType extends string> extends NavBase {
  /** This indicator's source. */
  readonly source: Subscribable<NavSource<NameType> | null>;

  /**
   * Sets this indicator's source. Once the source is set, this indicator's data will be derived from the new source.
   * If the new source is `null`, all of this indicator's data will be set to `null`.
   * @param sourceName The name of a nav source.
   */
  setSource(sourceName: NameType | null): void;
}

/**
 * A basic implementation of {@link NavIndicator} whose data is derived directly from its source.
 */
export class BasicNavIndicator<NameType extends string> extends AbstractNavBase implements NavIndicator<NameType> {

  private readonly _source = Subject.create<NavSource<NameType> | null>(null);
  /** @inheritdoc */
  public readonly source = this._source as Subscribable<NavSource<NameType> | null>;

  protected readonly sourceSubs: Subscription[] = [];

  /**
   * Creates a new instance of BasicNavIndicator.
   * @param navSources The possible nav sources from which this indicator can derive data.
   * @param sourceName The initial source to use, if any.
   */
  public constructor(protected readonly navSources: NavSources<NameType>, sourceName: NameType | null = null) {
    super();
    this.setSource(sourceName);
  }

  /** @inheritdoc */
  public setSource(sourceName: NameType | null): void {
    const oldSource = this.source.get();

    if (oldSource && oldSource.name === sourceName) { return; }
    if (oldSource === null && sourceName === null) { return; }

    const newSource = (sourceName ? this.navSources.get(sourceName) : null);

    this._source.set(newSource);

    this.updateFromSource(this._source.get(), oldSource);
  }

  /**
   * Updates this nav indicator from a new source.
   * @param newSource The new nav source.
   * @param oldSource The old nav source.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected updateFromSource(newSource: NavSource<NameType> | null, oldSource: NavSource<NameType> | null): void {
    this.sourceSubs.forEach(sub => { sub.destroy(); });
    this.sourceSubs.length = 0;

    if (newSource) {
      this.fields.forEach((field, key) => {
        this.sourceSubs.push((newSource[key] as Subscribable<any>).pipe(field));
      });
    } else {
      this.clearAll();
    }
  }
}

/** Holds the nav indicators. */
export class NavIndicators<NameType extends string, KeyType extends string> {
  /** NavIndicators constructor.
   * @param indicators The nav indicators to hold. */
  public constructor(
    private readonly indicators = new Map<KeyType, NavIndicator<NameType>>(),
  ) { }

  /** Gets a nav indicator.
   * @param key The name of the indicator to get.
   * @returns The indicator.
   * @throws Error if indicator not found.
   */
  public get(key: KeyType): NavIndicator<NameType> {
    const indicator = this.indicators.get(key);
    if (!indicator) {
      throw new Error('no nav indicator exists with given key: ' + key);
    } else {
      return indicator;
    }
  }
}