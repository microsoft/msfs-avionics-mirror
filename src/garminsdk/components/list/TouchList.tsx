import { EventBus, InstrumentEvents, MathUtils, Subject } from '@microsoft/msfs-sdk';

import { ScrollList, ScrollListProps } from './ScrollList';

/**
 * Component props for TouchList.
 */
export interface TouchListProps extends ScrollListProps {
  /**
   * The event bus. Required for the list to respond appropriately to the mouse leaving the virtual cockpit instrument
   * screen while the user is dragging the list.
   */
  bus?: EventBus;
}

/**
 * A touchscreen list which can be scrolled by clicking and dragging the mouse.
 */
export class TouchList extends ScrollList<TouchListProps> {
  protected static readonly RESERVED_CLASSES = [...ScrollList.RESERVED_CLASSES, 'touch-list', 'touch-list-x', 'touch-list-y'];

  protected readonly isMouseDown = Subject.create(false);

  protected readonly instrumentMouseLeaveSub = this.props.bus?.getSubscriber<InstrumentEvents>()
    .on('vc_mouse_leave').handle(() => this.onMouseUp(), true);

  protected lastMousePosition: number | undefined = undefined;

  protected readonly onMouseDownCaptureFunc = this.onMouseDownCapture.bind(this);
  protected readonly onMouseDownFunc = this.onMouseDown.bind(this);
  protected readonly onMouseUpFunc = this.onMouseUp.bind(this);
  protected readonly onMouseMoveFunc = this.onMouseMove.bind(this);

  /** @inheritDoc */
  public onAfterRender(): void {
    this.rootRef.instance.classList.add('touch-list', `touch-list-${this.scrollAxis}`);
    this.translatableRef.instance.classList.add('touch-list-translatable');

    this._lengthPx.sub(lengthPx => {
      this.rootRef.instance.style.setProperty('--touch-list-length', lengthPx + 'px');
    }, true);
    this.listItemLengthPx.sub(listItemLengthPx => {
      this.rootRef.instance.style.setProperty('--touch-list-item-length', listItemLengthPx + 'px');
    }, true);
    this.listItemSpacingPx.sub(listItemSpacingPx => {
      this.rootRef.instance.style.setProperty('--touch-list-item-margin', listItemSpacingPx + 'px');
    }, true);

    super.onAfterRender();

    this.rootRef.instance.addEventListener('mousedown', this.onMouseDownCaptureFunc, {
      capture: true,
    });
    this.rootRef.instance.addEventListener('mousedown', this.onMouseDownFunc, {
      capture: false,
    });
  }

  /**
   * Scrolls until the item at a specified index is in view. The operation will be aborted if the list is currently
   * being dragged by the user.
   * @param index The index of the item to which to scroll.
   * @param position The position to place the target item at the end of the scroll. Position `0` is the top/left-most
   * visible slot, position `1` is the next slot, and so on. Values greater than or equal to the number of visible
   * items per page will be clamped. Negative values will be interpreted as counting backwards from the
   * bottom/right-most visible slot starting with `-1`. Ignored if this list does not support snapping to list items.
   * @param animate Whether to animate the scroll.
   */
  public scrollToIndex(index: number, position: number, animate: boolean): void {
    if (this.isMouseDown.get() === true) {
      // We don't want to take control from the user if they are manually scrolling the list
      return;
    }

    super.scrollToIndex(index, position, animate);
  }

  /**
   * Scrolls the minimum possible distance until the item at a specified index is in view with a given margin from the
   * edges of the visible list. The operation will be aborted if the list is currently being dragged by the user.
   * @param index The index of the item to which to scroll.
   * @param margin The margin from the edges of the visible list to respect when scrolling to the target item. In other
   * words, the scrolling operation will attempt to place the target item at least as far from the edges of the visible
   * list as the specified margin. If this list supports snapping to items, then the margin should be expressed as an
   * item count. If this list does not support snapping to items, then the margin should be expressed as pixels. The
   * margin will be clamped between zero and the largest possible value such that an item can be placed within the
   * visible list while respecting the margin value on both sides.
   * @param animate Whether to animate the scroll.
   */
  public scrollToIndexWithMargin(index: number, margin: number, animate: boolean): void {
    if (this.isMouseDown.get() === true) {
      // We don't want to take control from the user if they are manually scrolling the list
      return;
    }

    super.scrollToIndexWithMargin(index, margin, animate);
  }

  /** @inheritdoc */
  protected changeRenderWindow(scrollPos: number, renderCount: number, itemLength: number, windowLength: number): void {
    // Reset last mouse position so that we don't trigger any weird behaviors if the user is dragging when the
    // container translation is changed to accommodate the new render window.
    this.lastMousePosition = undefined;

    super.changeRenderWindow(scrollPos, renderCount, itemLength, windowLength);
  }

  /**
   * User has clicked on the list, so now we want to listen for
   * the mouse moving so we can scroll the list with the mouse.
   * @param e The mouse event.
   */
  protected onMouseDownCapture(e: MouseEvent): void {
    if (e.eventPhase === e.CAPTURING_PHASE && this.isAnimating) {
      // If list is drifting after a flick, and user clicks,
      // capture the event before it can get to any buttons in the list, and stop it
      e.stopPropagation();
      this.onMouseDown(e);
    } else {
      // Do nothing, it will fire again if it bubbles back up.
      return;
    }
  }

  /**
   * User has clicked on the list, so now we want to listen for
   * the mouse moving so we can scroll the list with the mouse.
   * @param e The mouse event.
   */
  protected onMouseDown(e: MouseEvent): void {
    this.lastMousePosition = this.scrollAxis === 'x' ? e.clientX : e.clientY;
    this.lastTimeSeconds = Date.now() / 1000;
    this.isMouseDown.set(true);
    window.addEventListener('mousemove', this.onMouseMoveFunc);
    window.addEventListener('mouseup', this.onMouseUpFunc);
    this.instrumentMouseLeaveSub?.resume();
    this.stopAnimating();
  }

  /**
   * Responds to `mouseup` events on this list after the user has started dragging.
   */
  protected onMouseUp(): void {
    this.isMouseDown.set(false);
    window.removeEventListener('mousemove', this.onMouseMoveFunc);
    window.removeEventListener('mouseup', this.onMouseUpFunc);
    this.instrumentMouseLeaveSub?.pause();
    if (this.isOverscrolled()) {
      // If we mouseup when overscrolled, we want it to immediately snap back,
      // so we kill the velocity.
      this.velocity = 0;
    }
    this.startAnimating();
  }

  /**
   * Responds to `mousemove` events on this list while the user is dragging.
   * @param e The mouse event.
   */
  protected onMouseMove(e: MouseEvent): void {
    if (this.lastMousePosition === undefined) {
      return;
    }

    const timeSeconds = Date.now() / 1000;
    let deltaTimeSeconds = timeSeconds - this.lastTimeSeconds;
    if (deltaTimeSeconds === 0) {
      deltaTimeSeconds = this.deltaTimeSeconds;
    }

    const mousePos = this.scrollAxis === 'x' ? e.clientX : e.clientY;
    const delta = mousePos - this.lastMousePosition;

    const maxOverscrollPx = this.maxOverscrollPx.get();
    this._scrollPos.set(MathUtils.clamp(
      this._scrollPos.get() - delta * this.getDampening(Math.sign(-delta)),
      -maxOverscrollPx,
      this._maxScrollPos.get() + maxOverscrollPx
    ));

    this.lastMousePosition = mousePos;
    this.velocity = -delta / deltaTimeSeconds;
    this.lastTimeSeconds = timeSeconds;
    this.deltaTimeSeconds = deltaTimeSeconds;
  }

  /** @inheritDoc */
  protected getReservedCssClasses(): readonly string[] {
    return TouchList.RESERVED_CLASSES;
  }

  /** @inheritDoc */
  public destroy(): void {
    this.rootRef.getOrDefault()?.removeEventListener('mousedown', this.onMouseDownCaptureFunc);
    this.rootRef.getOrDefault()?.removeEventListener('mousedown', this.onMouseDownFunc);

    this.instrumentMouseLeaveSub?.destroy();

    super.destroy();
  }
}