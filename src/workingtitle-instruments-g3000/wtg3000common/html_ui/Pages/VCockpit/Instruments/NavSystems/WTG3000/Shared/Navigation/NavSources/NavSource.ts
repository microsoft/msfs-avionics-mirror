import { NavSourceType } from '@microsoft/msfs-sdk';

import { NavBase } from '../NavBase';

/**
 * A navigation reference source.
 */
export interface NavSource<NameType extends string> extends NavBase {
  /** The name of this source. */
  readonly name: NameType;

  /** The index of this source. */
  readonly index: number;

  /**
   * Gets the type of this source.
   * @returns The type of this source.
   */
  getType(): NavSourceType;
}

// TODO Does this need to be an instrument?
/** Holds the available Nav Sources that NavIndicators can use. */
export class NavSources<NameType extends string> {
  private readonly sources: readonly NavSource<NameType>[];

  /** NavSources constructor.
   * @param sources The nav sources. */
  public constructor(...sources: readonly NavSource<NameType>[]) {
    this.sources = sources;
  }

  /** Gets a nav source.
   * @param name Name of source.
   * @returns The source.
   * @throws Error if name not found.
   */
  public get(name: NameType): NavSource<NameType> {
    const indicator = this.sources.find(x => x.name === name);
    if (!indicator) {
      throw new Error('no nav source exists with given name: ' + name);
    } else {
      return indicator;
    }
  }
}
