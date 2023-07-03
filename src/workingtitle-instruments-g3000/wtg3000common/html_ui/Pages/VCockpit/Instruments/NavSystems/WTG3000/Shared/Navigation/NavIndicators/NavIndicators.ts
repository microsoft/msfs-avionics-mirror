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
export interface NavIndicator<SourceName extends string> extends NavBase {
  /** This indicator's source. */
  readonly source: Subscribable<NavSource<SourceName> | null>;

  /**
   * Sets this indicator's source. Once the source is set, this indicator's data will be derived from the new source.
   * If the new source is `null`, all of this indicator's data will be set to `null`.
   * @param sourceName The name of a nav source.
   */
  setSource(sourceName: SourceName | null): void;
}

/**
 * A basic implementation of {@link NavIndicator} whose data is derived directly from its source.
 */
export class BasicNavIndicator<SourceName extends string> extends AbstractNavBase implements NavIndicator<SourceName> {

  private readonly _source = Subject.create<NavSource<SourceName> | null>(null);
  /** @inheritdoc */
  public readonly source = this._source as Subscribable<NavSource<SourceName> | null>;

  protected readonly sourceSubs: Subscription[] = [];

  /**
   * Creates a new instance of BasicNavIndicator.
   * @param navSources The possible nav sources from which this indicator can derive data.
   * @param sourceName The initial source to use, if any.
   */
  public constructor(protected readonly navSources: NavSources<SourceName>, sourceName: SourceName | null = null) {
    super();
    this.setSource(sourceName);
  }

  /** @inheritdoc */
  public setSource(sourceName: SourceName | null): void {
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
  protected updateFromSource(newSource: NavSource<SourceName> | null, oldSource: NavSource<SourceName> | null): void {
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

/**
 * A collection of nav indicators.
 * @template SourceName The names of the nav sources supported by the nav indicators contained in the collection.
 * @template IndicatorName The names of the nav indicators contained in the collection.
 */
export interface NavIndicators<SourceName extends string, IndicatorName extends string> {
  /**
   * Gets a nav indicator with a given name.
   * @param name The name of the indicator to get.
   * @returns The specified nav indicator.
   * @throws Error if an indicator with the specified name could not be found.
   */
  get(name: IndicatorName): NavIndicator<SourceName>;
}

/**
 * A basic implementation of {@link NavIndicators} which stores the indicators in a Map.
 * @template SourceName The names of the nav sources supported by the nav indicators contained in the collection.
 * @template IndicatorName The names of the nav indicators contained in the collection.
 */
export class NavIndicatorsCollection<SourceName extends string, IndicatorName extends string> implements NavIndicators<SourceName, IndicatorName> {
  /**
   * Creates a new instance of NavIndicatorsCollection.
   * @param indicators A map of this collection's nav indicators, keyed by name.
   */
  public constructor(
    private readonly indicators = new Map<IndicatorName, NavIndicator<SourceName>>(),
  ) { }

  /** @inheritdoc */
  public get(name: IndicatorName): NavIndicator<SourceName> {
    const indicator = this.indicators.get(name);
    if (!indicator) {
      throw new Error('NavIndicatorsCollection: no nav indicator exists with the name: ' + name);
    } else {
      return indicator;
    }
  }
}