import { DisplayComponent, FilteredMapSubject, ReadonlyFloat64Array, Subscribable, SubscribableMap } from '@microsoft/msfs-sdk';

import { UiFocusController } from './UiFocusController';
import { UiInteractionEvent } from './UiInteraction';
import { UiKnobId, UiKnobRequestedLabelState } from './UiKnobTypes';
import { UiView, UiViewProps } from './UiView';
import { UiViewOcclusionType, UiViewSizeMode } from './UiViewTypes';

/**
 * An abstract implementation of {@link UiView}.
 */
export abstract class AbstractUiView<P extends UiViewProps = UiViewProps> extends DisplayComponent<P> implements UiView<P> {
  protected readonly _knobLabelState = FilteredMapSubject.create<UiKnobId, string>(this.props.uiService.validKnobIds);
  /** @inheritDoc */
  public readonly knobLabelState = this._knobLabelState as SubscribableMap<UiKnobId, string> & Subscribable<UiKnobRequestedLabelState>;

  protected readonly focusController = this.createFocusController();

  /**
   * Creates a new focus controller for this view.
   * @returns A new focus controller.
   */
  protected createFocusController(): UiFocusController {
    return new UiFocusController(this.props.uiService.validKnobIds);
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onOpen(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
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
  public onResize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
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
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.focusController.onUiInteractionEvent(event);
  }

  /** @inheritDoc */
  public destroy(): void {
    this.focusController.destroy();

    super.destroy();
  }
}