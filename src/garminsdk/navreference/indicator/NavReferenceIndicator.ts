import { Subject, Subscribable, Subscription } from '@microsoft/msfs-sdk';

import { AbstractNavReferenceBase, NavReferenceBase } from '../NavReferenceBase';
import { NavReferenceSource, NavReferenceSources } from '../source/NavReferenceSource';

/**
 * An indicator which presents data derived from a navigation reference source. An indicator may only have up to one
 * source at a time, but its source can be changed.
 */
export interface NavReferenceIndicator<SourceName extends string> extends NavReferenceBase {
  /** This indicator's source. */
  readonly source: Subscribable<NavReferenceSource<SourceName> | null>;

  /**
   * Sets this indicator's source. Once the source is set, this indicator's data will be derived from the new source.
   * If the new source is `null`, all of this indicator's data will be set to `null`.
   * @param sourceName The name of a nav source.
   */
  setSource(sourceName: SourceName | null): void;
}

/**
 * A basic implementation of {@link NavReferenceIndicator} whose data is derived directly from its source.
 */
export class BasicNavReferenceIndicator<SourceName extends string> extends AbstractNavReferenceBase implements NavReferenceIndicator<SourceName> {

  private readonly _source = Subject.create<NavReferenceSource<SourceName> | null>(null);
  /** @inheritdoc */
  public readonly source = this._source as Subscribable<NavReferenceSource<SourceName> | null>;

  protected readonly sourceSubs: Subscription[] = [];

  /**
   * Creates a new instance of BasicNavReferenceIndicator.
   * @param navSources The possible nav sources from which this indicator can derive data.
   * @param sourceName The initial source to use, if any.
   */
  public constructor(protected readonly navSources: NavReferenceSources<SourceName>, sourceName: SourceName | null = null) {
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
  protected updateFromSource(newSource: NavReferenceSource<SourceName> | null, oldSource: NavReferenceSource<SourceName> | null): void {
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
 * A collection of {@link NavReferenceIndicator|NavReferenceIndicators}.
 * @template SourceName The names of the nav sources supported by the nav indicators contained in the collection.
 * @template IndicatorName The names of the nav indicators contained in the collection.
 */
export interface NavReferenceIndicators<SourceName extends string, IndicatorName extends string> {
  /**
   * Gets a nav indicator with a given name.
   * @param name The name of the indicator to get.
   * @returns The specified nav indicator.
   * @throws Error if an indicator with the specified name could not be found.
   */
  get(name: IndicatorName): NavReferenceIndicator<SourceName>;
}

/**
 * A basic implementation of {@link NavReferenceIndicators} which stores the indicators in a Map.
 * @template SourceName The names of the nav sources supported by the nav indicators contained in the collection.
 * @template IndicatorName The names of the nav indicators contained in the collection.
 */
export class NavReferenceIndicatorsCollection<SourceName extends string, IndicatorName extends string> implements NavReferenceIndicators<SourceName, IndicatorName> {
  /**
   * Creates a new instance of NavReferenceIndicatorsCollection.
   * @param indicators A map of this collection's nav indicators, keyed by name.
   */
  public constructor(
    private readonly indicators = new Map<IndicatorName, NavReferenceIndicator<SourceName>>(),
  ) { }

  /** @inheritdoc */
  public get(name: IndicatorName): NavReferenceIndicator<SourceName> {
    const indicator = this.indicators.get(name);
    if (!indicator) {
      throw new Error('NavReferenceIndicatorsCollection: no nav indicator exists with the name: ' + name);
    } else {
      return indicator;
    }
  }
}