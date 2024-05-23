import { DisplayComponent, ReadonlyFloat64Array } from '@microsoft/msfs-sdk';

import { PfdInset, PfdInsetProps } from './PfdInset';
import { PfdInsetSizeMode } from './PfdInsetTypes';

/**
 * An abstract implementation of {@link PfdInset}.
 */
export abstract class AbstractPfdInset<P extends PfdInsetProps = PfdInsetProps> extends DisplayComponent<P> implements PfdInset<P> {
  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onOpen(sizeMode: PfdInsetSizeMode, dimensions: ReadonlyFloat64Array): void {
    // noop
  }

  /** @inheritdoc */
  public onClose(): void {
    // noop
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onResize(sizeMode: PfdInsetSizeMode, dimensions: ReadonlyFloat64Array): void {
    // noop
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onUpdate(time: number): void {
    // noop
  }
}