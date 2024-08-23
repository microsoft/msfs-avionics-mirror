import { EventBus, Instrument, NavSourceType } from '@microsoft/msfs-sdk';

import { NavBase } from '../NavBase';

/** Base class for NavSources that are meant to be used by NavIndicators.
 * A NavSource subscribes to SimVars and updates the NavBaseFields accordingly. */
export abstract class NavSourceBase<T extends readonly string[]> extends NavBase {
  // eslint-disable-next-line jsdoc/require-jsdoc
  public abstract getType(): NavSourceType;

  /** The NavSourceBase constructor.
   * @param bus The event bus.
   * NavSources need to tell the publisher what to subscribe to.
   * @param name The name of the nav source. Ex: NAV1, ADF, FMS2.
   * @param index The index of the nav source. Ex: 1 for NAV1, or 2 for FMS2, or 1 for ADF.
   */
  public constructor(
    protected readonly bus: EventBus,
    public readonly name: T[number],
    public readonly index: number,
  ) {
    super();
  }
}

// TODO Does this need to be an instrument?
/** Holds the available Nav Sources that NavIndicators can use. */
export class NavSources<T extends readonly string[]> implements Instrument {
  private readonly sources: readonly NavSourceBase<T>[];

  /** NavSources constructor.
   * @param sources The nav sources. */
  public constructor(...sources: readonly NavSourceBase<T>[]) {
    this.sources = sources;
  }

  /** @inheritdoc */
  public init(): void {
    // TODO
  }

  /** @inheritdoc */
  public onUpdate(): void {
    // TODO
  }

  /** Gets a nav source.
   * @param name Name of source.
   * @returns The source.
   * @throws Error if name not found.
   */
  public get(name: T[number]): NavSourceBase<T> {
    const indicator = this.sources.find(x => x.name === name);
    if (!indicator) {
      throw new Error('no nav source exists with given name: ' + name);
    } else {
      return indicator;
    }
  }
}
