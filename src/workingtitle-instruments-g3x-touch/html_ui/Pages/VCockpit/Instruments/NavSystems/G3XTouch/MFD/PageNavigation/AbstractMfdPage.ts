import { DisplayComponent, FilteredMapSubject, ReadonlyFloat64Array, Subject, Subscribable, SubscribableMap } from '@microsoft/msfs-sdk';

import { UiInteractionEvent } from '../../Shared/UiSystem/UiInteraction';
import { UiKnobId, UiKnobRequestedLabelState } from '../../Shared/UiSystem/UiKnobTypes';
import { UiViewOcclusionType } from '../../Shared/UiSystem/UiViewTypes';
import { MfdPage, MfdPageProps } from './MfdPage';
import { MfdPageSizeMode } from './MfdPageTypes';

/**
 * An abstract implementation of `MfdPage`.
 */
export abstract class AbstractMfdPage<P extends MfdPageProps = MfdPageProps> extends DisplayComponent<P> implements MfdPage<P> {
  protected readonly _title = Subject.create<string>('');
  /** @inheritDoc */
  public readonly title = this._title as Subscribable<string>;

  protected readonly _iconSrc = Subject.create<string>('');
  /** @inheritDoc */
  public readonly iconSrc = this._iconSrc as Subscribable<string>;

  protected readonly _knobLabelState = FilteredMapSubject.create<UiKnobId, string>(this.props.uiService.validKnobIds);
  /** @inheritDoc */
  public readonly knobLabelState = this._knobLabelState as SubscribableMap<UiKnobId, string> & Subscribable<UiKnobRequestedLabelState>;

  /** @inheritDoc */
  public onStage(): void {
    // noop
  }

  /** @inheritDoc */
  public onUnstage(): void {
    // noop
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onOpen(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    // noop
  }

  /** @inheritDoc */
  public onClose(): void {
    // noop
  }

  /** @inheritDoc */
  public onResume(): void {
    // noop
  }

  /** @inheritDoc */
  public onPause(): void {
    // noop
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onResize(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    // noop
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onOcclusionChange(occlusionType: UiViewOcclusionType): void {
    // noop
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onUpdate(time: number): void {
    // noop
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return false;
  }
}