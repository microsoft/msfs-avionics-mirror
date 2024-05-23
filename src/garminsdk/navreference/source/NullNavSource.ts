import { NavSourceType } from '@microsoft/msfs-sdk';

import { AbstractNavReferenceBase } from '../NavReferenceBase';
import { NavReferenceSource } from './NavReferenceSource';

/**
 * A `NavReferenceSource` that always provides null data.
 */
export class NullNavSource<NameType extends string> extends AbstractNavReferenceBase implements NavReferenceSource<NameType> {
  /**
   * Creates a new instance of EmptyNavSource.
   * @param name The name of this source.
   * @param type The type of this source.
   * @param index The index of this source.
   */
  public constructor(
    public readonly name: NameType,
    private readonly type: NavSourceType,
    public readonly index: number
  ) {
    super();
  }

  /** @inheritDoc */
  public getType(): NavSourceType {
    return this.type;
  }
}
