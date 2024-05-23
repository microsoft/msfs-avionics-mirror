import { DisplayComponent, MapSubject, Subscribable, SubscribableMap } from '@microsoft/msfs-sdk';

import { UiInteractionEvent } from '../../UiSystem/UiInteraction';
import { UiKnobId, UiKnobRequestedLabelState } from '../../UiSystem/UiKnobTypes';
import { TabbedContent, TabbedContentProps } from './TabbedContent';

/**
 * An abstract implementation of {@link TabbedContent}.
 */
export abstract class AbstractTabbedContent<P extends TabbedContentProps = TabbedContentProps> extends DisplayComponent<P> implements TabbedContent {
  /** @inheritdoc */
  public readonly isTabbedContent = true;

  protected readonly _knobLabelState = MapSubject.create<UiKnobId, string>();
  /** @inheritdoc */
  public readonly knobLabelState = this._knobLabelState as SubscribableMap<UiKnobId, string> & Subscribable<UiKnobRequestedLabelState>;

  /** @inheritdoc */
  public onSelect(): void {
    // noop
  }

  /** @inheritdoc */
  public onDeselect(): void {
    // noop
  }

  /** @inheritdoc */
  public onOpen(): void {
    // noop
  }

  /** @inheritdoc */
  public onClose(): void {
    // noop
  }

  /** @inheritdoc */
  public onResume(): void {
    // noop
  }

  /** @inheritdoc */
  public onPause(): void {
    // noop
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onUpdate(time: number): void {
    // noop
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return false;
  }
}