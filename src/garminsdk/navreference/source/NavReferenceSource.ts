import { NavSourceType } from '@microsoft/msfs-sdk';

import { NavReferenceBase } from '../NavReferenceBase';

/**
 * A source of navigation reference data.
 */
export interface NavReferenceSource<NameType extends string> extends NavReferenceBase {
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

/**
 * A collection of {@link NavReferenceSource|NavReferenceSources}.
 * @template SourceName The names of the navigation reference sources supported by the collection.
 */
export interface NavReferenceSources<SourceName extends string> {
  /**
   * Gets a navigation reference source with a given name.
   * @param name The name of the source to get.
   * @returns The specified navigation reference source.
   * @throws Error if a source with the specified name could not be found.
   */
  get(name: SourceName): NavReferenceSource<SourceName>;
}

/**
 * A basic implementation of {@link NavReferenceSources} which stores the sources in a Map.
 * @template SourceName The names of the navigation reference sources supported by the collection.
 */
export class NavReferenceSourceCollection<SourceName extends string> implements NavReferenceSources<SourceName> {
  private readonly sources: readonly NavReferenceSource<SourceName>[];

  /**
   * Creates a new instance of NavReferenceSourceCollection.
   * @param sources The navigation reference sources to include in the collection.
   */
  public constructor(...sources: readonly NavReferenceSource<SourceName>[]) {
    this.sources = sources;
  }

  /** @inheritdoc */
  public get(name: SourceName): NavReferenceSource<SourceName> {
    const indicator = this.sources.find(x => x.name === name);
    if (!indicator) {
      throw new Error('NavReferenceSourceCollection: no nav source exists with given name: ' + name);
    } else {
      return indicator;
    }
  }
}
