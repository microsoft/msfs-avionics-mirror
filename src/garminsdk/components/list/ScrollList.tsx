import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, MappedSubscribable, MathUtils, MutableSubscribable, ReadonlyFloat64Array,
  SetSubject, Subject, Subscribable, SubscribableMapFunctions, SubscribableSet, SubscribableUtils, Subscription,
  ToggleableClassNameRecord, Vec2Math, Vec2Subject, VNode,
} from '@microsoft/msfs-sdk';

/**
 * Component props for ScrollList.
 */
export interface ScrollListProps extends ComponentProps {
  /** The axis along which the list scrolls. Defaults to `y`. */
  scrollAxis?: 'x' | 'y';

  /**
   * The length of each list item, in pixels, along the list's scroll axis.
   */
  listItemLengthPx: number | Subscribable<number>;

  /** The amount of space between each list item in pixels. Defaults to zero pixels. */
  listItemSpacingPx?: number | Subscribable<number>;

  /**
   * The maximum distance the list can overscroll past the beginning and end, in pixels. Defaults to the length of one
   * list item.
   */
  maxOverscrollPx?: number | Subscribable<number>;

  /**
   * The length of the list, in pixels, along its scroll axis. If not defined, then the default value depends on
   * whether the number of items per page is defined. If the number of items per page is defined, then the length
   * defaults to the sum of the list item length and spacing multiplied by the number of items per page. If the number
   * of items per page is not defined, then the length defaults to 100 pixels.
   */
  lengthPx?: number | Subscribable<number>;

  /** The number of visible items per page. If not defined, the list will not snap to list items when scrolling. */
  itemsPerPage?: number | Subscribable<number>;

  /**
   * The maximum number of items that can be rendered simultaneously. Ignored if `itemsPerPage` is not defined. The
   * value will be clamped to be greater than or equal to `itemsPerPage * 3`. Defaults to infinity.
   */
  maxRenderedItemCount?: number | Subscribable<number>;

  /** The total number of items in the list. */
  itemCount: number | Subscribable<number>;

  /** CSS class(es) to apply to the list's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A scrollable list.
 */
export class ScrollList<P extends ScrollListProps = ScrollListProps> extends DisplayComponent<P> {
  protected static readonly RESERVED_CLASSES = ['scroll-list', 'scroll-list-x', 'scroll-list-y'];

  protected childrenNode?: VNode;

  protected readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  protected readonly translatableRef = FSComponent.createRef<HTMLDivElement>();
  protected readonly itemsContainerRef = FSComponent.createRef<HTMLDivElement>();

  protected readonly listItemLengthPxProp = SubscribableUtils.toSubscribable(this.props.listItemLengthPx, true);
  protected readonly listItemSpacingPxProp = SubscribableUtils.toSubscribable(this.props.listItemSpacingPx ?? 0, true);
  protected readonly itemsPerPageProp = this.props.itemsPerPage === undefined ? undefined : SubscribableUtils.toSubscribable(this.props.itemsPerPage, true);

  protected readonly listItemLengthPx = Subject.create(this.listItemLengthPxProp.get());
  protected readonly listItemSpacingPx = Subject.create(this.listItemSpacingPxProp.get());
  protected readonly itemCount = SubscribableUtils.toSubscribable(this.props.itemCount, true);

  /** The axis along which this list scrolls. */
  public readonly scrollAxis = this.props.scrollAxis ?? 'y';

  protected readonly _itemsPerPage = this.itemsPerPageProp === undefined ? undefined : Subject.create(this.itemsPerPageProp.get());
  /**
   * The number of visible list items per page displayed by this list, or `undefined` if the number of items per page
   * is not prescribed.
   */
  public readonly itemsPerPage = this._itemsPerPage as Subscribable<number> | undefined;

  protected readonly snapToItem = this.itemsPerPage !== undefined;

  protected readonly _listItemLengthWithMarginPx = MappedSubject.create(
    ([listItemLengthPx, listItemSpacingPx]) => listItemLengthPx + listItemSpacingPx,
    this.listItemLengthPx,
    this.listItemSpacingPx
  );
  /** The length, in pixels, of one item in this list plus its margin along this list's scroll axis. */
  public readonly listItemLengthWithMarginPx = this._listItemLengthWithMarginPx as Subscribable<number>;

  protected readonly _totalLengthPx = MappedSubject.create(
    ([listItemLengthPx, listItemSpacingPx, itemCount]) => {
      return listItemLengthPx * Math.max(itemCount, 0) + listItemSpacingPx * Math.max(itemCount - 1, 0);
    },
    this.listItemLengthPx,
    this.listItemSpacingPx,
    this.itemCount
  );
  /** The total length, in pixels, of all items in this list plus their margins along this list's scroll axis. */
  public readonly totalLengthPx = this._totalLengthPx as Subscribable<number>;

  protected readonly _lengthPx: Subscribable<number> | MappedSubscribable<number> = this.props.lengthPx === undefined
    ? this.itemsPerPage === undefined
      ? Subject.create(100)
      : MappedSubject.create(
        ([listItemLengthPx, listItemSpacingPx, itemsPerPage]) => {
          return listItemLengthPx * Math.max(itemsPerPage, 0) + listItemSpacingPx * Math.max(itemsPerPage - 1, 0);
        },
        this.listItemLengthPx,
        this.listItemSpacingPx,
        this.itemsPerPage
      )
    : SubscribableUtils.toSubscribable(this.props.lengthPx, true);
  /** The visible length of this list, in pixels, along its scroll axis. */
  public readonly lengthPx = this._lengthPx as Subscribable<number>;

  /** The length of one page, in pixels, along this list's scroll axis. */
  protected readonly pageLength = this.itemsPerPage === undefined
    ? this._lengthPx.map(SubscribableMapFunctions.identity())
    : MappedSubject.create(
      ([itemLengthWithMarginPx, itemsPerPage]) => {
        return itemLengthWithMarginPx * itemsPerPage;
      },
      this._listItemLengthWithMarginPx,
      this.itemsPerPage
    );

  protected readonly _maxScrollPos = MappedSubject.create(
    ([totalLengthPx, lengthPx]) => {
      return Math.max(totalLengthPx - lengthPx, 0);
    },
    this._totalLengthPx,
    this._lengthPx
  );
  /** This list's maximum allowed scroll position, in pixels. Does not include overscroll. */
  public readonly maxScrollPos = this._maxScrollPos as Subscribable<number>;

  /** How many pixels we will allow overscrolling before stopping. */
  protected readonly maxOverscrollPx = SubscribableUtils.toSubscribable(this.props.maxOverscrollPx ?? this.listItemLengthPx, true);

  protected readonly _scrollPos = Subject.create(0);
  /**
   * This list's current scroll position, in pixels. The scroll position is zero when the list is scrolled to the
   * beginning (without overscroll) and increases as the list is scrolled toward the end.
   */
  public readonly scrollPos = this._scrollPos as Subscribable<number>;

  /**
   * This list's current scroll position, normalized such that 0 represents when the list is scrolled to the beginning
   * (without overscroll) and 1 represents when the list is scrolled to the end (without overscroll).
   */
  public readonly scrollPosFraction = MappedSubject.create(
    ([scrollPos, maxScrollPos, pageLength]) => {
      if (maxScrollPos > 0) {
        return scrollPos / maxScrollPos;
      } else {
        // This is used when itemCount <= itemsPerPage
        if (scrollPos > 0) {
          return (scrollPos / pageLength) + 1;
        } else if (scrollPos < 0) {
          return scrollPos / pageLength;
        } else {
          return 0;
        }
      }
    },
    this._scrollPos,
    this._maxScrollPos,
    this.pageLength
  ) as Subscribable<number>;

  /**
   * The fraction of this list's visible length compared to the total length of all items in this list plus their
   * margins along this list's scroll axis.
   */
  public readonly scrollBarLengthFraction = MappedSubject.create(
    ([totalLengthPx, lengthPx]) => {
      return Math.min(1, lengthPx / totalLengthPx);
    },
    this._totalLengthPx,
    this._lengthPx
  ) as Subscribable<number>;

  protected readonly _animationTargetScrollPos = Subject.create<number | undefined>(undefined);
  /**
   * The scroll position targeted by this list's current scrolling animation, in pixels, or `undefined` if scrolling is
   * not currently animated or the animation has no defined target scroll position.
   */
  public readonly animationTargetScrollPos = this._animationTargetScrollPos as Subscribable<number | undefined>;

  /**
   * This list's current target scroll position, in pixels. The target scroll position is equal to the current
   * animation target if it is defined; otherwise it is equal to the current scroll position.
   */
  public readonly targetScrollPos = MappedSubject.create(
    ([animatedPos, scrollPos]) => animatedPos ?? scrollPos,
    this._animationTargetScrollPos,
    this._scrollPos
  );

  protected readonly _firstVisibleIndex = MappedSubject.create(
    ([scrollPos, listItemLengthWithMarginPx]) => {
      return Math.max(0, Math.round(scrollPos / listItemLengthWithMarginPx));
    },
    this._scrollPos,
    this._listItemLengthWithMarginPx
  );
  // The index of the first item in this list that is visible with the list's current scroll position.
  public readonly firstVisibleIndex = this._firstVisibleIndex as Subscribable<number>;

  protected readonly maxRenderedItemCount = this.itemsPerPage === undefined
    ? undefined
    : MappedSubject.create(
      ([itemsPerPage, desiredMax]) => Math.max(3, itemsPerPage * 3, desiredMax),
      this.itemsPerPage,
      SubscribableUtils.toSubscribable(this.props.maxRenderedItemCount ?? Infinity, true)
    );

  protected readonly renderWindowStartIndex = Subject.create(0);
  protected readonly renderWindowStartPos = MappedSubject.create(
    ([index, itemLength]) => index * itemLength,
    this.renderWindowStartIndex,
    this._listItemLengthWithMarginPx
  );

  /** This list's current scroll position adjusted for the render window. */
  protected readonly trueScrollPos = MappedSubject.create(
    ([scrollPos, windowStartPos]) => scrollPos - windowStartPos,
    this._scrollPos,
    this.renderWindowStartPos
  );

  protected readonly _renderWindow = Vec2Subject.create(Vec2Math.create(0, Infinity));
  /**
   * The window of rendered list items, as `[startIndex, endIndex]`, where `startIndex` is the index of the first
   * rendered item, inclusive, and `endIndex` is the index of the last rendered item, exclusive.
   */
  public readonly renderWindow = this._renderWindow as Subscribable<ReadonlyFloat64Array>;

  protected readonly animateFunc = this.animate.bind(this);

  protected isAnimating = false;
  protected velocity = 0;
  protected lastTimeSeconds = 0;
  protected deltaTimeSeconds = 0;
  protected timeInOverscrollSeconds = 0;
  /** How long to wait while overscrolled before snapping back. */
  protected maxTimeInOverscrollSeconds = 0.5;
  /** Once at or below this velocity, we pick that target Y to snap to. */
  protected snappingTransitionSpeed = 200;
  protected goToAnimationTargetPos = false;
  protected interval?: number;

  protected readonly listItemParamSubs: Subscription[] = [];

  protected cssClassSub?: Subscription | Subscription[];

  /** @inheritDoc */
  public onAfterRender(): void {
    if (this._itemsPerPage && this.itemsPerPageProp) {
      this.listItemLengthPx.set(this.listItemLengthPxProp.get());
      this.listItemSpacingPx.set(this.listItemSpacingPxProp.get());

      this._itemsPerPage.set(this.itemsPerPageProp.get());

      this.listItemParamSubs.push(
        this.listItemLengthPxProp.sub(this.onListItemParamChanged.bind(this, this.listItemLengthPx)),
        this.listItemSpacingPxProp.sub(this.onListItemParamChanged.bind(this, this.listItemSpacingPx)),
        this.itemsPerPageProp.sub(this.onListItemParamChanged.bind(this, this._itemsPerPage))
      );
    } else {
      this.listItemParamSubs.push(
        this.listItemLengthPxProp.pipe(this.listItemLengthPx),
        this.listItemSpacingPxProp.pipe(this.listItemSpacingPx),
      );
    }

    this._lengthPx.sub(lengthPx => {
      this.rootRef.instance.style.setProperty('--scroll-list-length', lengthPx + 'px');
    }, true);
    this.listItemLengthPx.sub(listItemLengthPx => {
      this.rootRef.instance.style.setProperty('--scroll-list-item-length', listItemLengthPx + 'px');
    }, true);
    this.listItemSpacingPx.sub(listItemSpacingPx => {
      this.rootRef.instance.style.setProperty('--scroll-list-item-margin', listItemSpacingPx + 'px');
    }, true);

    if (this.itemsPerPage && this.maxRenderedItemCount) {
      const updateRenderWindow = this.updateRenderWindow.bind(this);
      this._listItemLengthWithMarginPx.sub(updateRenderWindow);
      this.itemsPerPage.sub(updateRenderWindow);
      this._scrollPos.sub(updateRenderWindow);
      this.maxRenderedItemCount.sub(updateRenderWindow);
    }

    this.trueScrollPos.sub((this.scrollAxis === 'x' ? this.updateTransformX : this.updateTransformY).bind(this), true);

    this._maxScrollPos.sub(this.ensureScrollIsInBounds.bind(this));
  }

  /**
   * Returns a reference to the element where the list items should be added.
   * @returns A reference to the element where the list items should be added.
   */
  public getContainerRef(): HTMLDivElement {
    return this.itemsContainerRef.instance;
  }

  /**
   * Scrolls backward by one full page length.
   */
  public pageBack(): void {
    const startingPoint = this.targetScrollPos.get();

    // If scrolled to beginning already, do nothing
    if (startingPoint <= 0) {
      return;
    }

    const desired = startingPoint - this.pageLength.get();
    this.executeScrollTo(this.snapToItem ? this.pickNearestSnapToPos(desired) : desired, true);
  }

  /**
   * Scrolls forward by one full page length.
   */
  public pageForward(): void {
    const startingPoint = this.targetScrollPos.get();

    // If scrolled to end already, do nothing
    if (startingPoint >= this._maxScrollPos.get()) {
      return;
    }

    const desired = startingPoint + this.pageLength.get();
    this.executeScrollTo(this.snapToItem ? this.pickNearestSnapToPos(desired) : desired, true);
  }

  /**
   * Scrolls until the item at a specified index is in view.
   * @param index The index of the item to which to scroll.
   * @param position The position to place the target item at the end of the scroll. Position `0` is the top/left-most
   * visible slot, position `1` is the next slot, and so on. Values greater than or equal to the number of visible
   * items per page will be clamped. Negative values will be interpreted as counting backwards from the
   * bottom/right-most visible slot starting with `-1`. Ignored if this list does not support snapping to list items.
   * @param animate Whether to animate the scroll.
   */
  public scrollToIndex(index: number, position: number, animate: boolean): void {
    if (index < 0 || index >= this.itemCount.get()) {
      return;
    }

    const itemLength = this.listItemLengthPx.get();
    const itemLengthWithMargin = this._listItemLengthWithMarginPx.get();

    const targetItemStartPos = index * itemLengthWithMargin;
    const targetItemEndPos = targetItemStartPos + itemLength;

    const currentPageStartPos = this.targetScrollPos.get();
    const currentPageEndPos = currentPageStartPos + this._lengthPx.get();

    const itemsPerPage = this.itemsPerPage?.get() ?? 1;

    if (position < 0) {
      position += itemsPerPage;
      position = Math.max(position, 0);
    } else {
      position = Math.min(position, itemsPerPage - 1);
    }

    const itemCountBefore = position;
    const itemCountAfter = itemsPerPage - position - 1;

    const targetPageStartPos = targetItemStartPos - itemCountBefore * itemLengthWithMargin;
    const targetPageEndPos = targetItemEndPos + itemCountAfter * itemLengthWithMargin;

    let scrollTarget: number | undefined = undefined;

    if (currentPageStartPos < targetPageStartPos || (!this.snapToItem && itemLength > this._lengthPx.get())) {
      scrollTarget = targetPageStartPos;
    } else if (currentPageEndPos > targetPageEndPos) {
      scrollTarget = targetPageEndPos - this._lengthPx.get();
    }

    if (scrollTarget === undefined) {
      return;
    }

    this.executeScrollTo(scrollTarget, animate);
  }

  /**
   * Scrolls the minimum possible distance until the item at a specified index is in view with a given margin from the
   * edges of the visible list.
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
    if (index < 0 || index >= this.itemCount.get()) {
      return;
    }

    const itemLength = this.listItemLengthPx.get();
    const itemLengthWithMargin = this._listItemLengthWithMarginPx.get();

    const targetItemStartPos = index * itemLengthWithMargin;
    const targetItemEndPos = targetItemStartPos + itemLength;

    const currentPageStartPos = this.targetScrollPos.get();
    const currentPageEndPos = currentPageStartPos + this._lengthPx.get();

    if (this.itemsPerPage) {
      margin = Math.max(0, Math.min(margin, Math.ceil(this.itemsPerPage.get() / 2) - 1));
      margin *= itemLengthWithMargin;
    } else {
      margin = Math.max(0, Math.min(margin, (this._lengthPx.get() - itemLength) / 2));
    }

    const targetPageStartPos = targetItemStartPos - margin;
    const targetPageEndPos = targetItemEndPos + margin;

    let scrollTarget: number | undefined = undefined;

    if (currentPageStartPos > targetPageStartPos || (itemLength > this._lengthPx.get())) {
      scrollTarget = targetPageStartPos;
    } else if (currentPageEndPos < targetPageEndPos) {
      scrollTarget = targetPageEndPos - this._lengthPx.get();
    }

    if (scrollTarget === undefined) {
      return;
    }

    this.executeScrollTo(scrollTarget, animate);
  }

  /**
   * Executes a scroll to a specifed position.
   * @param pos The position to which to scroll.
   * @param animate Whether to animate the scroll.
   */
  protected executeScrollTo(pos: number, animate: boolean): void {
    pos = MathUtils.clamp(pos, 0, this._maxScrollPos.get());

    this.stopAnimating();

    if (animate) {
      this.goToAnimationTargetPos = true;
      this._animationTargetScrollPos.set(pos);
      this.startAnimating();
    } else {
      this._scrollPos.set(pos);
    }
  }

  /**
   * Reset the animation vars and start the animation, if not already started.
   */
  protected startAnimating(): void {
    if (this.isAnimating) {
      return;
    }

    this.isAnimating = true;
    this.lastTimeSeconds = Date.now() / 1000;
    this.timeInOverscrollSeconds = 0;
    this.interval = window.setInterval(this.animateFunc, 0);
  }

  /** Stop the animation. */
  protected stopAnimating(): void {
    window.clearInterval(this.interval);
    this.isAnimating = false;
    this.goToAnimationTargetPos = false;
    this._animationTargetScrollPos.set(undefined);
  }

  /**
   * Called once per animation frame while we are animating.
   */
  protected animate(): void {
    if (!this.isAnimating) {
      return;
    }

    const timeSeconds = Date.now() / 1000;

    /** Seconds since last animation frame. */
    let deltaTimeSeconds = timeSeconds - this.lastTimeSeconds;
    if (deltaTimeSeconds === 0) {
      deltaTimeSeconds = this.deltaTimeSeconds;
    }

    /** Whether we have been in an overscrolled state for too long, and now it's time to snapback. */
    const overstayedOverscroll = this.timeInOverscrollSeconds > this.maxTimeInOverscrollSeconds;

    const isAboveMinVelocity = Math.abs(this.velocity) > (this.snapToItem ? this.snappingTransitionSpeed : 0);

    if (this.goToAnimationTargetPos) {
      this.animateSnapping(deltaTimeSeconds);
    } else if ((this.isOverscrolled() || isAboveMinVelocity) && this.velocity !== 0 && !overstayedOverscroll) {
      // Animate velocity until we slow down enough to where we can pick what list item to snap to,
      // or until we have been overscrolling for too long.
      this.animateVelocity(deltaTimeSeconds);
    } else if (this.scrollPosFraction.get() < 0 || this.scrollPosFraction.get() > 1) {
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
  }

  /**
   * Applies the velocity to the scroll position, which gives it the "flick" effect.
   * Also slows the velocity down overtime.
   * @param deltaTimeSeconds Seconds since last animation frame.
   */
  protected animateVelocity(deltaTimeSeconds: number): void {
    const decel = this.getOverscrollPx() === 0 ? 1 : 10;

    // Slow the velocity down over time
    this.velocity *= Math.max(0, 1 - decel * deltaTimeSeconds);

    const maxOverscrollPx = this.maxOverscrollPx.get();

    // Apply velocity to the scroll position
    this._scrollPos.set(MathUtils.clamp(
      this._scrollPos.get() + ((this.velocity * this.getDampening(Math.sign(this.velocity))) * deltaTimeSeconds),
      -maxOverscrollPx,
      this._maxScrollPos.get() + maxOverscrollPx
    ));

    // If it has slowed down enough, or hit max overscroll, kill the velocity,
    // so that it can stop animating, or start snapping back
    if (Math.abs(this.velocity) < 10 || this.getDampening(Math.sign(this.velocity)) === 0) {
      this.velocity = 0;
    }
  }

  /**
   * Animates scrolling back when overscrolled.
   */
  protected animateSnapback(): void {
    const currentScrollPos = this._scrollPos.get();

    if (this.scrollPosFraction.get() < 0) {
      const newScrollPos = currentScrollPos / 2;

      if (newScrollPos >= -1) {
        this._scrollPos.set(0);
        this.stopAnimating();
      } else {
        this._scrollPos.set(newScrollPos);
      }
    } else {
      const maxScrollPos = this._maxScrollPos.get();
      const diff = currentScrollPos - maxScrollPos;
      const delta = diff / 2;
      const newScrollPos = currentScrollPos - delta;

      if (newScrollPos <= maxScrollPos + 1) {
        this._scrollPos.set(maxScrollPos);
        this.stopAnimating();
      } else {
        this._scrollPos.set(newScrollPos);
      }
    }
  }

  /**
   * If we have a target Y position to stop scrolling at, animate towards a smooth stop right at that point.
   * @param deltaTimeSeconds  Seconds since last animation frame.
   */
  protected animateSnapping(deltaTimeSeconds: number): void {
    let targetScrollPos = this._animationTargetScrollPos.get();

    // Need to pick a target value to scroll to
    if (targetScrollPos === undefined) {
      if (this.velocity === 0) {
        // Velocity could be 0 when user lets go of mouse. In this case if snapping is supported, we need
        // to pick the closest item to snap to. If snapping to item is not supported, we will just set the target
        // to the current scroll in order to end the animation immediately.

        targetScrollPos = this.snapToItem ? this.pickNearestSnapToPos(this._scrollPos.get()) : this._scrollPos.get();
        this.velocity = targetScrollPos > this._scrollPos.get()
          ? this.snappingTransitionSpeed
          : -this.snappingTransitionSpeed;
      } else {
        // This is when the user flick scrolled, and it has slowed down to a reasonable speed
        // to where we can now pick a stopping point in the direction that we are already moving.
        // Note that if we are in this case snapping to item must be supported.

        if (Math.sign(this.velocity) < 0) {
          const adjustment = this._scrollPos.get() % this._listItemLengthWithMarginPx.get();
          targetScrollPos = this._scrollPos.get() - adjustment;
        } else {
          const adjustment = this._listItemLengthWithMarginPx.get() - (this._scrollPos.get() % this._listItemLengthWithMarginPx.get());
          targetScrollPos = this._scrollPos.get() + adjustment;
        }
      }
    }

    // If we have reached our snapping destination, stop
    if (this._scrollPos.get() === targetScrollPos) {
      this.stopAnimating();
      return;
    }

    this._animationTargetScrollPos.set(targetScrollPos);

    let direction: number;
    const absDistanceToTargetPos = Math.abs(this._scrollPos.get() - targetScrollPos);

    if (this.goToAnimationTargetPos) {
      // This is currently used for arrow button scrolling
      direction = targetScrollPos > this._scrollPos.get() ? 1 : -1;
      const speed = Math.sqrt(absDistanceToTargetPos) * 80;
      this.velocity = speed * direction;
    } else {
      // This is used when snapping at the end of a flick,
      // or snapping after letting go in the middle of an item
      direction = Math.sign(this.velocity);

      // 0 when at max distance, approaches 1 as it gets closer.
      const snapCloseness = MathUtils.clamp((this._listItemLengthWithMarginPx.get() - absDistanceToTargetPos) / this._listItemLengthWithMarginPx.get(), 0, 1);

      // Approaches snappingTransitionSpeed as snapCloseness approaches 0.
      // It's curved so that it rapidly slows down when it gets really close to the stopping position.
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

    const maxOverscrollPx = this.maxOverscrollPx.get();

    // Apply velocity to the scroll position
    this._scrollPos.set(MathUtils.clamp(
      this._scrollPos.get() + (this.velocity * deltaTimeSeconds),
      -maxOverscrollPx,
      this._maxScrollPos.get() + maxOverscrollPx
    ));

    // If we have scrolled past our target, set scroll position to the target and stop
    if (direction > 0) {
      if (this._scrollPos.get() > targetScrollPos) {
        this._scrollPos.set(targetScrollPos);
        this.stopAnimating();
      }
    } else {
      if (this._scrollPos.get() < targetScrollPos) {
        this._scrollPos.set(targetScrollPos);
        this.stopAnimating();
      }
    }
  }

  /**
   * Picks the scroll position, in pixels, of the snap-to target that is nearest to a given scroll position.
   * @param pos The scroll position, in pixels, for which to find the nearest snap-to target.
   * @returns The scroll position, in pixels, of the snap-to target that is nearest to the specified scroll
   * position.
   */
  protected pickNearestSnapToPos(pos: number): number {
    return MathUtils.clamp(MathUtils.round(pos, this._listItemLengthWithMarginPx.get()), 0, this._maxScrollPos.get());
  }

  /**
   * Responds to when one of this list's item parameters changes when the list supports snapping to items.
   * @param pipeTo The mutable subscribable to which to pipe the new parameter value.
   * @param value The new parameter value.
   */
  protected onListItemParamChanged(pipeTo: MutableSubscribable<number>, value: number): void {
    // If a list item parameter changes, then after the change the list's scroll position may be misaligned with
    // respect to item snapping. Therefore, we will store the first visible item in the list before the parameter
    // change and force the list to snap to the stored item after the parameter change.

    const firstVisibleIndex = this._firstVisibleIndex.get();

    pipeTo.set(value);

    this.scrollToIndex(firstVisibleIndex, 0, false);
  }

  /**
   * Updates this list's item render window.
   */
  protected updateRenderWindow(): void {
    if (!this.itemsPerPage || !this.maxRenderedItemCount) {
      return;
    }

    const scrollPos = MathUtils.clamp(this._scrollPos.get(), 0, this._maxScrollPos.get());

    const itemLength = this._listItemLengthWithMarginPx.get();
    const itemsPerPage = this.itemsPerPage.get();
    const renderCount = this.maxRenderedItemCount.get();

    const windowStartPos = this.renderWindowStartPos.get();
    const windowLength = (renderCount - itemsPerPage) * itemLength;
    const windowEndLength = windowStartPos + windowLength;

    if (scrollPos >= windowStartPos && scrollPos < windowEndLength) {
      // We are still within the rendered window, so nothing to do.
      return;
    }

    this.changeRenderWindow(scrollPos, renderCount, itemLength, windowLength);
  }

  /**
   * Changes this list's item render window.
   * @param scrollPos The scroll position on which to center the new render window, in pixels.
   * @param renderCount The number of items to render in the new window.
   * @param itemLength The length of each item to render, including margin, in pixels.
   * @param windowLength The length of the render window, in pixels.
   */
  protected changeRenderWindow(scrollPos: number, renderCount: number, itemLength: number, windowLength: number): void {
    const newWindowStartLength = scrollPos - windowLength / 2;
    const newWindowStartIndex = Math.max(0, Math.round(newWindowStartLength / itemLength));

    this.renderWindowStartIndex.set(newWindowStartIndex);
    this._renderWindow.set(newWindowStartIndex, newWindowStartIndex + renderCount);
  }

  /**
   * Updates this list's item container's x-transform based on the current true scroll position.
   * @param scrollPos The current true scroll position, in pixels.
   */
  protected updateTransformX(scrollPos: number): void {
    this.translatableRef.instance.style.transform = `translate3d(${-scrollPos}px, 0px, 0)`;
  }

  /**
   * Updates this list's item container's y-transform based on the current true scroll position.
   * @param scrollPos The current true scroll position, in pixels.
   */
  protected updateTransformY(scrollPos: number): void {
    this.translatableRef.instance.style.transform = `translate3d(0px, ${-scrollPos}px, 0)`;
  }

  /**
   * Checks if the list is scrolled past the maximum limit, and if so, snaps the list back to the limit.
   */
  protected ensureScrollIsInBounds(): void {
    const max = this._maxScrollPos.get();
    const current = this._scrollPos.get();

    if (current <= max) {
      return;
    }

    this.executeScrollTo(max, false);
  }

  /**
   * Returns a number used to dampen the mouse movement when overscrolled.
   * @param direction What direction os the mouse moving in.
   * @returns a number used to dampen the mouse movement when overscrolled.
   */
  protected getDampening(direction: number): number {
    const maxScrollPos = this.maxScrollPos.get();
    const maxOverscrollPx = this.maxOverscrollPx.get();

    // If we can't scroll at all, always dampen velocity to zero.
    if (maxScrollPos <= 0 && maxOverscrollPx <= 0) {
      return 0;
    }

    const scrollPosFraction = this.scrollPosFraction.get();
    const overscrollDirection = scrollPosFraction >= 1 ? 1 : scrollPosFraction <= 0 ? -1 : 0;

    // If we are not trying to increase overscroll, then do not dampen velocity.
    if (overscrollDirection !== direction) {
      return 1;
    }

    if (maxOverscrollPx > 0) {
      // If we can overscroll, then dampen velocity to zero if we are at the overscroll limit or by half if we are not
      // at the limit.
      const overscrollPercentage = Math.min(1, this.getOverscrollPx() / maxOverscrollPx);
      return overscrollPercentage === 1 ? 0 : 0.5;
    } else {
      // If we can't overscroll, then always dampen velocity to zero.
      return 0;
    }
  }

  /**
   * Gets the distance by which this list is currently overscrolled, in pixels along the scroll axis.
   * @returns The distance by which this list is currently overscrolled, in pixels along the scroll axis.
   */
  protected getOverscrollPx(): number {
    if (this.scrollPosFraction.get() < 0) {
      return -this._scrollPos.get();
    } else if (this.scrollPosFraction.get() > 1) {
      return this._scrollPos.get() - this._maxScrollPos.get();
    } else {
      return 0;
    }
  }

  /**
   * Returns whether this list is currently overscrolled.
   * @returns Whether this list is currently overscrolled.
   */
  protected isOverscrolled(): boolean {
    return this.getOverscrollPx() !== 0;
  }

  /** @inheritDoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create();
      cssClass.add('scroll-list');
      cssClass.add(`scroll-list-${this.scrollAxis}`);

      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, this.getReservedCssClasses());
    } else {
      cssClass = `scroll-list scroll-list-${this.scrollAxis}`;

      if (this.props.class) {
        const reserved = this.getReservedCssClasses();
        cssClass += ` ${FSComponent.parseCssClassesFromString(this.props.class, classToFilter => !reserved.includes(classToFilter)).join(' ')}`;
      }
    }

    this.childrenNode = this.props.children === undefined ? undefined : <>{this.props.children}</>;

    return (
      <div ref={this.rootRef} class={cssClass}>
        <div ref={this.translatableRef} class='scroll-list-translatable'>
          <div ref={this.itemsContainerRef} class='items-container' />
          {this.childrenNode}
        </div>
      </div>
    );
  }

  /**
   * Gets an array of this list's reserved CSS classes.
   * @returns An array of this list's reserved CSS classes.
   */
  protected getReservedCssClasses(): readonly string[] {
    return ScrollList.RESERVED_CLASSES;
  }

  /** @inheritDoc */
  public destroy(): void {
    this.childrenNode && FSComponent.shallowDestroy(this.childrenNode);

    for (const sub of this.listItemParamSubs) {
      sub.destroy();
    }

    this._listItemLengthWithMarginPx.destroy();
    'destroy' in this._lengthPx && this._lengthPx.destroy();
    this.pageLength.destroy();

    this.maxRenderedItemCount?.destroy();

    this._firstVisibleIndex.destroy();

    super.destroy();
  }
}