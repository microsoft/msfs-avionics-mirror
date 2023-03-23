import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, InstrumentEvents,
  MappedSubject, MappedSubscribable, MathUtils, ReadonlyFloat64Array, Subject, Subscribable, SubscribableMapFunctions, SubscribableUtils, Vec2Math, Vec2Subject, VNode,
} from '@microsoft/msfs-sdk';

import './TouchList.css';

/** The properties for the TouchList component. */
export interface TouchListProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus,

  /**
   * The height of each list item in pixels.
   */
  listItemHeightPx: number | Subscribable<number>;

  /**
   * The height of the list in pixels. If not defined, the default value depends on whether the number of items per
   * page is defined. If the number of items per page is defined, the height defaults to the sum of the list item
   * height and spacing multiplied by the number of items per page. If the number of items per page is not defined,
   * the height defaults to 100 pixels.
   */
  heightPx?: number | Subscribable<number>;

  /** The amount of space between each list item in pixels. Defaults to zero pixels. */
  listItemSpacingPx?: number | Subscribable<number>;

  /** The number of visible items per page. If not defined, the list will not snap to list items when scrolling. */
  itemsPerPage?: number | Subscribable<number>;

  /**
   * The maximum number of items that can be rendered simultaneously. Ignored if `itemsPerPage` is not defined. The
   * value will be clamped to be greater than or equal to `itemsPerPage * 3`. Defaults to infinity.
   */
  maxRenderedItemCount?: number | Subscribable<number>;

  /** The total number of items in the list. */
  itemCount: Subscribable<number>;
}

/** The TouchList component. */
export class TouchList extends DisplayComponent<TouchListProps> {
  /** A ref to the div that will be translated up and down. */
  private readonly translatableRef = FSComponent.createRef<HTMLDivElement>();
  private readonly itemsContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly touchListRef = FSComponent.createRef<HTMLDivElement>();

  private readonly listItemHeightPxSub = SubscribableUtils.toSubscribable(this.props.listItemHeightPx, true);
  private readonly listItemSpacingSub = SubscribableUtils.toSubscribable(this.props.listItemSpacingPx ?? 0, true);

  /**
   * The number of visible list items per page displayed by this list, or `undefined` if the number of items per page
   * is not prescribed.
   */
  public readonly itemsPerPage = this.props.itemsPerPage === undefined ? undefined : SubscribableUtils.toSubscribable(this.props.itemsPerPage, true);

  private readonly snapToItem = this.itemsPerPage !== undefined;

  private readonly _listItemHeightWithMarginPx = MappedSubject.create(([listItemHeightPx, listItemSpacing]) => {
    return listItemHeightPx + listItemSpacing;
  }, this.listItemHeightPxSub, this.listItemSpacingSub);
  /** The height, in pixels, of one item in this list plus its bottom margin. */
  public readonly listItemHeightWithMarginPx = this._listItemHeightWithMarginPx as Subscribable<number>;

  private readonly _totalHeightPx = MappedSubject.create(
    ([listItemHeightPx, listItemSpacing, itemCount]) => {
      return listItemHeightPx * Math.max(itemCount, 0) + listItemSpacing * Math.max(itemCount - 1, 0);
    },
    this.listItemHeightPxSub,
    this.listItemSpacingSub,
    this.props.itemCount
  );
  /** The total height, in pixels, of all items in this list plus their margins. */
  public readonly totalHeightPx = this._totalHeightPx as Subscribable<number>;

  private readonly _heightPx: Subscribable<number> | MappedSubscribable<number> = this.props.heightPx === undefined
    ? this.itemsPerPage === undefined
      ? Subject.create(100)
      : MappedSubject.create(
        ([listItemHeightPx, listItemSpacing, itemsPerPage]) => {
          return listItemHeightPx * Math.max(itemsPerPage, 0) + listItemSpacing * Math.max(itemsPerPage - 1, 0);
        },
        this.listItemHeightPxSub,
        this.listItemSpacingSub,
        this.itemsPerPage
      )
    : SubscribableUtils.toSubscribable(this.props.heightPx, true);
  /** The visible height of this list, in pixels. */
  public readonly heightPx = this._heightPx as Subscribable<number>;

  /** The height of one page, in pixels. */
  private readonly pageHeight = this.itemsPerPage === undefined
    ? this._heightPx.map(SubscribableMapFunctions.identity())
    : MappedSubject.create(
      ([itemHeightWithMarginPx, itemsPerPage]) => {
        return itemHeightWithMarginPx * itemsPerPage;
      },
      this._listItemHeightWithMarginPx,
      this.itemsPerPage
    );

  /** The scroll Y value when at the bottom of the list. Can overscroll past this. */
  private readonly maxScrollY = MappedSubject.create(
    ([totalHeightPx, heightPx]) => {
      return Math.max(totalHeightPx - heightPx, 0);
    },
    this._totalHeightPx,
    this._heightPx
  );

  /** How many pixels we will allow overscrolling before stopping. */
  private readonly maxOverscrollPx = this.listItemHeightPxSub;

  private readonly isMouseDown = Subject.create(false);

  private readonly _scrollY = Subject.create(0);
  /**
   * This list's current scroll position, in pixels. The scroll position is zero when the list is scrolled to the top
   * (without overscroll) and increases as the list is scrolled down.
   */
  public readonly scrollY = this._scrollY as Subscribable<number>;
  /**
   * This list's current scroll position, normalized such that 0 represents when the list is scrolled to the top
   * (without overscroll) and 1 represents when the list is scrolled to the bottom (without overscroll).
   */
  public readonly scrollPercentage = MappedSubject.create(([scrollY, maxScrollY, pageHeight]) => {
    if (maxScrollY > 0) {
      return scrollY / maxScrollY;
    } else {
      // This is used when itemCount <= itemsPerPage
      if (scrollY > 0) {
        return (scrollY / pageHeight) + 1;
      } else if (scrollY < 0) {
        return scrollY / pageHeight;
      } else {
        return 0;
      }
    }
  }, this._scrollY, this.maxScrollY, this.pageHeight) as Subscribable<number>;

  /** The fraction of this list's visible height compared to the total height of all items in the list plus their margins. */
  public readonly scrollBarHeightPercentage = MappedSubject.create(
    ([totalHeightPx, heightPx]) => {
      return Math.min(1, heightPx / totalHeightPx);
    },
    this._totalHeightPx,
    this._heightPx
  ) as Subscribable<number>;

  private readonly _topVisibleIndex = MappedSubject.create(([scrollY, listItemHeightWithMarginPx]) => {
    return Math.max(0, Math.round(scrollY / listItemHeightWithMarginPx));
  }, this._scrollY, this._listItemHeightWithMarginPx);
  public readonly topVisibleIndex = this._topVisibleIndex as Subscribable<number>;

  private readonly maxRenderedItemCount = this.itemsPerPage === undefined
    ? undefined
    : MappedSubject.create(
      ([itemsPerPage, desiredMax]) => Math.max(3, itemsPerPage * 3, desiredMax),
      this.itemsPerPage,
      SubscribableUtils.toSubscribable(this.props.maxRenderedItemCount ?? Infinity, true)
    );

  private readonly renderWindowStartIndex = Subject.create(0);
  private readonly renderWindowStartY = MappedSubject.create(
    ([index, itemHeight]) => index * itemHeight,
    this.renderWindowStartIndex,
    this._listItemHeightWithMarginPx
  );

  /** This list's current scroll position adjusted for the render window. */
  private readonly trueScrollY = MappedSubject.create(
    ([y, windowStartY]) => y - windowStartY,
    this._scrollY,
    this.renderWindowStartY
  );

  private readonly _renderWindow = Vec2Subject.create(Vec2Math.create(0, Infinity));
  /**
   * The window of rendered list items, as `[startIndex, endIndex]`, where `startIndex` is the index of the first
   * rendered item, inclusive, and `endIndex` is the index of the last rendered item, exclusive.
   */
  public readonly renderWindow = this._renderWindow as Subscribable<ReadonlyFloat64Array>;

  private readonly instrumentMouseLeaveSub = this.props.bus.getSubscriber<InstrumentEvents>()
    .on('vc_mouse_leave').handle(() => this.onMouseUp(), true);

  private lastMouseYPosition: number | undefined = undefined;
  private isAnimating = false;
  /** The speed and direction that we are scrolling after mouseup.  */
  private velocity = 0;
  private lastTimeSeconds = 0;
  private deltaTimeSeconds = 0;
  /** How long the list has been overscrolled. */
  private timeInOverscrollSeconds = 0;
  /** How long to wait while overscrolled before snapping back. */
  private maxTimeInOverscrollSeconds = 0.5;
  /** Once at or below this velocity, we pick that target Y to snap to. */
  private snappingTransitionSpeed = 200;
  /** The target scroll Y value to snap to. */
  private targetScrollY?: number = undefined;
  private goToTargetY = false;
  private interval?: number;

  /** @inheritdoc */
  public onAfterRender(): void {
    this._heightPx.sub(
      heightPx => this.touchListRef.instance.style.setProperty('--touch-list-height', heightPx + 'px'), true);
    this.listItemHeightPxSub.sub(
      listItemHeightPx => this.touchListRef.instance.style.setProperty('--touch-list-item-height', listItemHeightPx + 'px'), true);
    this.listItemSpacingSub.sub(
      listItemSpacing => this.touchListRef.instance.style.setProperty('--touch-list-item-margin', listItemSpacing + 'px'), true);

    this.touchListRef.instance.addEventListener('mousedown', this.onMouseDownCapture, {
      capture: true,
    });
    this.touchListRef.instance.addEventListener('mousedown', this.onMouseDown, {
      capture: false,
    });

    if (this.itemsPerPage && this.maxRenderedItemCount) {
      const updateRenderWindow = this.updateRenderWindow.bind(this);
      this._listItemHeightWithMarginPx.sub(updateRenderWindow);
      this.itemsPerPage.sub(updateRenderWindow);
      this._scrollY.sub(updateRenderWindow);
      this.maxRenderedItemCount.sub(updateRenderWindow);
    }

    this.trueScrollY.sub(this.updateTransform.bind(this), true);

    this.maxScrollY.sub(this.ensureScrollIsInBounds.bind(this));
  }

  /**
   * Returns a reference to the element where the list items should be added.
   * @returns A reference to the element where the list items should be added.
   */
  public getContainerRef(): HTMLDivElement {
    return this.itemsContainerRef.instance;
  }

  /**
   * Scrolls up by one full page height.
   */
  public pageUp(): void {
    const startingPoint = this.targetScrollY ?? this._scrollY.get();

    // If scrolled to top already, do nothing
    if (startingPoint <= 0) {
      return;
    }

    const desired = startingPoint - this.pageHeight.get();
    this.executeScrollTo(this.snapToItem ? this.pickNearestSnapToY(desired) : desired, true);
  }

  /**
   * Scrolls down by one full page height.
   */
  public pageDown(): void {
    const startingPoint = this.targetScrollY ?? this._scrollY.get();

    // If scrolled to bottom already, do nothing
    if (startingPoint >= this.maxScrollY.get()) {
      return;
    }

    const desired = startingPoint + this.pageHeight.get();
    this.executeScrollTo(this.snapToItem ? this.pickNearestSnapToY(desired) : desired, true);
  }

  /**
   * Scrolls until the item at a specified index is in view.
   * @param index The index of the item to which to scroll.
   * @param position The position to place the target item at the end of the scroll. Position `0` is the top-most
   * visible slot, position `1` is the next slot, and so on. Values greater than or equal to the number of visible
   * items per page will be clamped. If this value is negative, the target item will be placed at the visible position
   * that results in the shortest scroll distance. Ignored if this list does not support snapping to list items.
   * @param animate Whether to animate the scroll.
   */
  public scrollToIndex(index: number, position: number, animate: boolean): void {
    if (index < 0 || index >= this.props.itemCount.get()) {
      return;
    }

    if (this.isMouseDown.get() === true) {
      // We don't want to take control from the user if they are manually scrolling the list
      return;
    }

    const itemHeight = this.listItemHeightPxSub.get();

    const targetItemTopY = index * this._listItemHeightWithMarginPx.get();
    const targetItemBottomY = targetItemTopY + itemHeight;

    const currentPageTopY = this.targetScrollY ?? this._scrollY.get();
    const currentPageBottomY = currentPageTopY + this.pageHeight.get();

    const itemsPerPage = this.itemsPerPage?.get() ?? 0;

    let targetPageTopY, targetPageBottomY;

    position = Math.min(position, itemsPerPage - 1);

    if (position < 0) {
      targetPageTopY = targetItemTopY;
      targetPageBottomY = targetItemBottomY;
    } else {
      const itemCountAbove = position;
      const itemCountBelow = itemsPerPage - position - 1;

      targetPageTopY = targetItemTopY - itemCountAbove * this._listItemHeightWithMarginPx.get();
      targetPageBottomY = targetItemBottomY + itemCountBelow * this._listItemHeightWithMarginPx.get();
    }

    let scrollTarget: number | undefined = undefined;

    if (currentPageTopY < targetPageTopY || (position < 0 && itemHeight > this._heightPx.get())) {
      scrollTarget = targetPageTopY;
    } else if (currentPageBottomY > targetPageBottomY) {
      scrollTarget = targetPageBottomY - this.pageHeight.get();
    }

    if (scrollTarget === undefined) {
      return;
    }

    this.executeScrollTo(scrollTarget, animate);
  }

  /**
   * Executes a scroll to a specifed position.
   * @param y The position to which to scroll.
   * @param animate Whether to animate the scroll.
   */
  private executeScrollTo(y: number, animate: boolean): void {
    y = MathUtils.clamp(y, 0, this.maxScrollY.get());

    this.stopAnimating();

    if (animate) {
      this.targetScrollY = y;
      this.goToTargetY = true;
      this.startAnimating();
    } else {
      this._scrollY.set(y);
    }
  }

  /** Reset the animation vars and start the animation, if not already started. */
  private startAnimating(): void {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.lastTimeSeconds = performance.now() / 1000;
      this.timeInOverscrollSeconds = 0;
      this.interval = window.setInterval(this.animate, 0);
    }
  }

  /** Stop the animation. */
  private stopAnimating(): void {
    window.clearInterval(this.interval);
    this.isAnimating = false;
    this.goToTargetY = false;
    this.targetScrollY = undefined;
  }

  /**
   * Called once per animation frame while we are animating.
   */
  private readonly animate = (): void => {
    // TODO Allow pausing animation and have it go directly to targetY
    if (!this.isAnimating) {
      return;
    }

    const timeSeconds = performance.now() / 1000;

    /** Seconds since last animation frame. */
    let deltaTimeSeconds = timeSeconds - this.lastTimeSeconds;
    if (deltaTimeSeconds === 0) {
      deltaTimeSeconds = this.deltaTimeSeconds;
    }

    /** Whether we have been in an overscrolled state for too long, and now it's time to snapback. */
    const overstayedOverscroll = this.timeInOverscrollSeconds > this.maxTimeInOverscrollSeconds;

    const isAboveMinVelocity = Math.abs(this.velocity) > (this.snapToItem ? this.snappingTransitionSpeed : 0);

    if (this.goToTargetY === true) {
      this.animateSnapping(deltaTimeSeconds);
    } else if ((this.isOverscrolled() || isAboveMinVelocity) && this.velocity !== 0 && !overstayedOverscroll) {
      // Animate velocity until we slow down enough to where we can pick what list item to snap to,
      // or until we have been overscrolling for too long.
      this.animateVelocity(deltaTimeSeconds);
    } else if (this.scrollPercentage.get() < 0 || this.scrollPercentage.get() > 1) {
      this.animateSnapback();
    } else {
      this.animateSnapping(deltaTimeSeconds);
    }

    this.lastTimeSeconds = timeSeconds;
    this.deltaTimeSeconds = deltaTimeSeconds;

    // If we are overscrolled, keep track of how long we are overscrolled.
    if (this.getOverscrollPx() !== 0) {
      this.timeInOverscrollSeconds += deltaTimeSeconds;
    }
  };

  /**
   * Applies the velocity to the scroll position, which gives it the "flick" effect.
   * Also slows the velocity down overtime.
   * @param deltaTimeSeconds Seconds since last animation frame.
   */
  private animateVelocity(deltaTimeSeconds: number): void {
    const decel = this.getOverscrollPx() === 0 ? 1 : 10;

    // Slow the velocity down over time
    this.velocity = this.velocity - (this.velocity * (decel * deltaTimeSeconds));

    // Make sure we don't slow down too much to where we are going the other direction
    if (Math.sign(this.velocity) > 0) {
      this.velocity = Math.max(0, this.velocity);
    } else {
      this.velocity = Math.min(0, this.velocity);
    }

    // Apply velocity to the scroll position
    this._scrollY.set(this._scrollY.get() + ((this.velocity * this.getDampening(Math.sign(this.velocity))) * deltaTimeSeconds));

    // If it has slowed down enough, or hit max overscroll, kill the velocity,
    // so that it can stop animating, or start snapping back
    if (Math.abs(this.velocity) < 10 || this.getDampening(Math.sign(this.velocity)) === 0) {
      this.velocity = 0;
    }
  }

  /** Animates scrolling back when overscrolled. */
  private animateSnapback(): void {
    const currentScrollY = this._scrollY.get();

    if (this.scrollPercentage.get() < 0) {
      const newScrollY = currentScrollY / 2;

      if (newScrollY >= -1) {
        this._scrollY.set(0);
        this.stopAnimating();
      } else {
        this._scrollY.set(newScrollY);
      }
    } else {
      const maxScrollY = this.maxScrollY.get();
      const diff = currentScrollY - maxScrollY;
      const delta = diff / 2;
      const newScrollY = currentScrollY - delta;

      if (newScrollY <= maxScrollY + 1) {
        this._scrollY.set(maxScrollY);
        this.stopAnimating();
      } else {
        this._scrollY.set(newScrollY);
      }
    }
  }

  /**
   * If we have a target Y position to stop scrolling at,
   * animate towards a smooth stop right at that point.
   * @param deltaTimeSeconds  Seconds since last animation frame.
   */
  private animateSnapping(deltaTimeSeconds: number): void {
    // Need to pick a target y value to scroll to
    if (this.targetScrollY === undefined) {
      if (this.velocity === 0) {
        // Velocity could be 0 when user lets go of mouse. In this case if snapping is supported, we need
        // to pick the closest item to snap to. If snapping to item is not supported, we will just set the target
        // to the current scroll in order to end the animation immediately.

        this.targetScrollY = this.snapToItem ? this.pickNearestSnapToY(this._scrollY.get()) : this._scrollY.get();
        this.velocity = this.targetScrollY > this._scrollY.get()
          ? this.snappingTransitionSpeed
          : -this.snappingTransitionSpeed;
      } else {
        // This is when the user flick scrolled, and it has slowed down to a reasonable speed
        // to where we can now pick a stopping point in the direction that we are already moving.
        // Note that if we are in this case snapping to item must be supported.

        if (Math.sign(this.velocity) < 0) {
          const adjustment = this._scrollY.get() % this._listItemHeightWithMarginPx.get();
          this.targetScrollY = this._scrollY.get() - adjustment;
        } else {
          const adjustment = this._listItemHeightWithMarginPx.get() - (this._scrollY.get() % this._listItemHeightWithMarginPx.get());
          this.targetScrollY = this._scrollY.get() + adjustment;
        }
      }
    }

    // If we have reached our snapping destination, stop
    if (this._scrollY.get() === this.targetScrollY) {
      this.stopAnimating();
      return;
    }

    let direction: number;
    const absDistanceToTargetY = Math.abs(this._scrollY.get() - this.targetScrollY);

    if (this.goToTargetY) {
      // This is currently used for arrow button scrolling
      direction = this.targetScrollY > this._scrollY.get() ? 1 : -1;
      const speed = Math.sqrt(absDistanceToTargetY) * 80;
      this.velocity = speed * direction;
    } else {
      // This is used when snapping at the end of a flick,
      // or snapping after letting go in the middle of an item
      direction = Math.sign(this.velocity);

      /** 0 when at max distance, approaches 1 as it gets closer. */
      const snapCloseness = MathUtils.clamp((this._listItemHeightWithMarginPx.get() - absDistanceToTargetY) / this._listItemHeightWithMarginPx.get(), 0, 1);

      /** Approaches snappingTransitionSpeed as snapCloseness approaches 0.
       * It's curved so that it rapidly slows down when it gets really close to the stopping position. */
      const minVelocity = Math.max(10, this.snappingTransitionSpeed * (-(snapCloseness ** 5) + 1));

      // Gradually slow down the velocity
      this.velocity = this.velocity - (this.velocity * (10 * deltaTimeSeconds));

      // Apply the min velocity curve thing
      if (direction > 0) {
        this.velocity = Math.max(minVelocity, this.velocity);
      } else {
        this.velocity = Math.min(-minVelocity, this.velocity);
      }
    }

    // Apply velocity to the scroll position
    this._scrollY.set(this._scrollY.get() + (this.velocity * deltaTimeSeconds));

    // If we have scrolled past our target, set scroll y to the target and stop
    if (direction > 0) {
      if (this._scrollY.get() > this.targetScrollY) {
        this._scrollY.set(this.targetScrollY);
        this.stopAnimating();
      }
    } else {
      if (this._scrollY.get() < this.targetScrollY) {
        this._scrollY.set(this.targetScrollY);
        this.stopAnimating();
      }
    }
  }

  /**
   * Picks the scroll position, in pixels, of the snap-to target that is nearest to a given scroll position.
   * @param y The scroll position, in pixels, for which to find the nearest snap-to target.
   * @returns The scroll position, in pixels, of the snap-to target that is nearest to the specified scroll
   * position.
   */
  private pickNearestSnapToY(y: number): number {
    return MathUtils.clamp(MathUtils.round(y, this._listItemHeightWithMarginPx.get()), 0, this.maxScrollY.get());
  }

  /**
   * Updates this list's item render window.
   */
  private updateRenderWindow(): void {
    if (!this.itemsPerPage || !this.maxRenderedItemCount) {
      return;
    }

    const scrollY = MathUtils.clamp(this._scrollY.get(), 0, this.maxScrollY.get());

    const itemHeight = this._listItemHeightWithMarginPx.get();
    const itemsPerPage = this.itemsPerPage.get();
    const renderCount = this.maxRenderedItemCount.get();

    const windowStartY = this.renderWindowStartY.get();
    const windowHeight = (renderCount - itemsPerPage) * itemHeight;
    const windowEndY = windowStartY + windowHeight;

    if (scrollY >= windowStartY && scrollY < windowEndY) {
      // We are still within the rendered window, so nothing to do.
      return;
    }

    const newWindowStartY = scrollY - windowHeight / 2;
    const newWindowStartIndex = Math.max(0, Math.round(newWindowStartY / itemHeight));

    // Reset last mouse position so that we don't trigger any weird behaviors if the user is dragging when the
    // container translation is changed to accommodate the new render window.
    this.lastMouseYPosition = undefined;
    this.renderWindowStartIndex.set(newWindowStartIndex);
    this._renderWindow.set(newWindowStartIndex, newWindowStartIndex + renderCount);
  }

  /**
   * Updates this list's item container transform based on the current true scroll position.
   * @param scrollY The current true scroll position, in pixels.
   */
  private updateTransform(scrollY: number): void {
    this.translatableRef.instance.style.transform = `translate3d(0px, ${-scrollY}px, 0)`;
  }

  /**
   * Checks if the list is scrolled past the maximum limit, and if so, snaps the list back to the limit.
   */
  private ensureScrollIsInBounds(): void {
    const max = this.maxScrollY.get();
    const current = this._scrollY.get();

    if (current <= max) {
      return;
    }

    this.executeScrollTo(max, false);
  }

  /**
   * User has clicked on the list, so now we want to listen for
   * the mouse moving so we can scroll the list with the mouse.
   * @param e The mouse event.
   */
  private readonly onMouseDownCapture = (e: MouseEvent): void => {
    if (e.eventPhase === e.CAPTURING_PHASE && this.isAnimating) {
      // If list is drifting after a flick, and user clicks,
      // capture the event before it can get to any buttons in the list, and stop it
      e.stopPropagation();
      this.onMouseDown(e);
    } else {
      // Do nothing, it will fire again if it bubbles back up.
      return;
    }
  };

  /**
   * User has clicked on the list, so now we want to listen for
   * the mouse moving so we can scroll the list with the mouse.
   * @param e The mouse event.
   */
  private readonly onMouseDown = (e: MouseEvent): void => {
    this.lastMouseYPosition = e.clientY;
    this.lastTimeSeconds = performance.now() / 1000;
    this.isMouseDown.set(true);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    this.instrumentMouseLeaveSub.resume();
    this.stopAnimating();
  };

  /** On mouse up, remove event listeners and start animating. */
  private readonly onMouseUp = (): void => {
    this.isMouseDown.set(false);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.instrumentMouseLeaveSub.pause();
    if (this.isOverscrolled()) {
      // If we mouseup when overscrolled, we want it to immediately snap back,
      // so we kill the velocity.
      this.velocity = 0;
    }
    this.startAnimating();
  };

  /**
   * Moves the list with the user's mouse.
   * @param e The mouse event.
   */
  private readonly onMouseMove = (e: MouseEvent): void => {
    if (this.lastMouseYPosition === undefined) {
      return;
    }

    const timeSeconds = performance.now() / 1000;
    let deltaTimeSeconds = timeSeconds - this.lastTimeSeconds;
    if (deltaTimeSeconds === 0) {
      deltaTimeSeconds = this.deltaTimeSeconds;
    }
    const delta = e.clientY - this.lastMouseYPosition;
    this._scrollY.set(this._scrollY.get() - delta * this.getDampening(Math.sign(-delta)));
    this.lastMouseYPosition = e.clientY;
    this.velocity = -delta / deltaTimeSeconds;
    this.lastTimeSeconds = timeSeconds;
    this.deltaTimeSeconds = deltaTimeSeconds;
  };

  /**
   * Returns a number used to dampen the mouse movement when overscrolled.
   * @param direction What direction os the mouse moving in.
   * @returns a number used to dampen the mouse movement when overscrolled.
   */
  private getDampening(direction: number): number {
    const overscrollDirection = this.scrollPercentage.get() > 1 ? 1 : this.scrollPercentage.get() < 0 ? -1 : 0;
    const overscrollPercentage = Math.min(1, this.getOverscrollPx() / this.maxOverscrollPx.get());
    const overscrollDampening = overscrollPercentage > 0 ? 0.5 : 1;
    if (overscrollDirection !== direction) {
      return overscrollDampening;
    }
    const dampening = overscrollPercentage === 1 ? 0 : overscrollDampening;
    return dampening;
  }

  /** @returns The number of pixels that the list has been overscrolled by. */
  private getOverscrollPx(): number {
    if (this.scrollPercentage.get() < 0) {
      return -this._scrollY.get();
    } else if (this.scrollPercentage.get() > 1) {
      return this._scrollY.get() - this.maxScrollY.get();
    } else {
      return 0;
    }
  }

  /**
   * Returns whether the list is currently overscrolled.
   * Overscrolling is when you are already at the top/bottom of the list,
   * and now you try to scroll even further past the top/bottom of the list.
   * @returns Whether the list is currently overscrolled.
   */
  private isOverscrolled(): boolean {
    return this.getOverscrollPx() !== 0;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.touchListRef} class="touch-list">
        <div ref={this.translatableRef} class="touch-list-translatable">
          <div ref={this.itemsContainerRef} class="items-container" />
          {this.props.children}
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.touchListRef.getOrDefault()?.removeEventListener('mousedown', this.onMouseDownCapture);
    this.touchListRef.getOrDefault()?.removeEventListener('mousedown', this.onMouseDown);

    this._listItemHeightWithMarginPx.destroy();
    'destroy' in this._heightPx && this._heightPx.destroy();
    this.pageHeight.destroy();

    this.maxRenderedItemCount?.destroy();

    this._topVisibleIndex.destroy();
    this.instrumentMouseLeaveSub.destroy();

    super.destroy();
  }
}