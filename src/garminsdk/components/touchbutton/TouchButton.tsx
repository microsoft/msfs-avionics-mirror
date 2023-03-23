import {
  ComponentProps, DisplayComponent, FSComponent, SetSubject, Subscribable, SubscribableMapFunctions, SubscribableSet, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

/**
 * Component props for TouchButton.
 */
export interface TouchButtonProps extends ComponentProps {
  /**
   * Whether the button is enabled, or a subscribable which provides it. Disabled buttons cannot be pressed. Defaults
   * to `true`.
   */
  isEnabled?: boolean | Subscribable<boolean>;

  /** Whether the button is highlighted, or a subscribable which provides it. Defaults to `false`. */
  isHighlighted?: boolean | Subscribable<boolean>;

  /** Whether the button is visible. Defaults to `true`. */
  isVisible?: boolean | Subscribable<boolean>;

  /**
   * The label for the button. Can be defined as either a static `string`, a subscribable which provides the label
   * `string`, or a VNode. If not defined, the button will not have a label.
   *
   * If the label is defined as a VNode, all first-level DisplayComponents in the VNode tree will be destroyed when
   * the button is destroyed.
   */
  label?: string | Subscribable<string> | VNode;

  /**
   * A callback function which will be called every time the button is pressed.
   * @param button The button that was pressed.
   */
  onPressed?: <B extends TouchButton = TouchButton>(button: B) => void;

  /**
   * Whether the pad should focus all mouse events when dragging, preventing them from bubbling up to any ancestors
   * in the DOM tree. Defaults to `false`.
   */
  focusOnDrag?: boolean;

  /** Whether this button should refire a mousedown event on its parent and unprime
   * when mouse is clicked and dragged past the dragThresholdPx or on mouseleave.
   * Defaults to false. */
  inhibitOnDrag?: boolean;

  /** How far the mouse can be clicked and moved from the click position before propogating the mousedown event and unpriming.
   * Only applies when inhibitOnDrag is true.
   * Defaults to 40px. */
  dragThresholdPx?: number;

  /** Which axis to apply the drag threshold to.
   * Only applies when inhibitOnDrag is true.
   * Defaults to both. */
  inhibitOnDragAxis?: 'x' | 'y' | 'both';

  /** A callback function which will be called when the button is destroyed. */
  onDestroy?: () => void;

  /** CSS class(es) to apply to the button's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A touchscreen button.
 *
 * The root element of the button contains the `touch-button` CSS class by default. The root element also
 * conditionally contains the `touch-button-disabled` and `touch-button-primed` classes when the button is disabled
 * and primed, respectively.
 *
 * The root element optionally contains a child label element with the CSS class `touch-button-label`.
 */
export class TouchButton<P extends TouchButtonProps = TouchButtonProps> extends DisplayComponent<P> {
  protected static readonly RESERVED_CSS_CLASSES = new Set([
    'touch-button',
    'touch-button-disabled',
    'touch-button-primed',
    'touch-button-highlight',
    'touch-button-hidden'
  ]);

  protected readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  protected readonly cssClassSet = SetSubject.create(['touch-button']);

  protected readonly mouseDownListener = this.onMouseDown.bind(this);
  protected readonly mouseUpListener = this.onMouseUp.bind(this);
  protected readonly mouseLeaveListener = this.onMouseLeave.bind(this);
  protected readonly mouseMoveListener = this.onMouseMove.bind(this);

  protected readonly isEnabled = SubscribableUtils.toSubscribable(this.props.isEnabled ?? true, true);
  protected readonly isHighlighted = SubscribableUtils.toSubscribable(this.props.isHighlighted ?? false, true);
  protected readonly isVisible = SubscribableUtils.toSubscribable(this.props.isVisible ?? true, true);

  protected readonly labelContent = this.props.label !== undefined && SubscribableUtils.isSubscribable(this.props.label)
    ? this.props.label.map(SubscribableMapFunctions.identity())
    : this.props.label;

  protected isPrimed = false;

  protected isEnabledSub?: Subscription;
  protected isHighlightedSub?: Subscription;
  protected isVisibleSub?: Subscription;
  protected cssClassSub?: Subscription;

  protected readonly mouseClickPosition = new Vec2();
  protected readonly currentMousePosition = new Vec2();

  protected readonly focusOnDrag = this.props.focusOnDrag ?? false;
  protected readonly inhibitOnDrag = this.props.inhibitOnDrag ?? false;
  protected readonly dragThresholdPxActual = this.props.dragThresholdPx ?? 40;
  protected readonly inhibitOnDragAxisActual = this.props.inhibitOnDragAxis ?? 'both';

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onAfterRender(node: VNode): void {
    this.isEnabledSub = this.isEnabled.sub(isEnabled => {
      if (isEnabled) {
        this.cssClassSet.delete('touch-button-disabled');
      } else {
        this.cssClassSet.add('touch-button-disabled');
      }

      if (!isEnabled) {
        this.setPrimed(false);
      }
    }, true);

    this.isHighlightedSub = this.isHighlighted.sub(isHighlighted => {
      if (isHighlighted) {
        this.cssClassSet.add('touch-button-highlight');
      } else {
        this.cssClassSet.delete('touch-button-highlight');
      }
    }, true);

    this.isVisibleSub = this.isVisible.sub(isVisible => {
      if (isVisible) {
        this.cssClassSet.delete('touch-button-hidden');
      } else {
        this.cssClassSet.add('touch-button-hidden');
      }
    }, true);

    this.rootRef.instance.addEventListener('mousedown', this.mouseDownListener);
    this.rootRef.instance.addEventListener('mouseup', this.mouseUpListener);
    this.rootRef.instance.addEventListener('mouseleave', this.mouseLeaveListener);
  }

  /**
   * Sets the primed state of this button.
   * @param isPrimed The new primed state.
   */
  protected setPrimed(isPrimed: boolean): void {
    if (this.isPrimed === isPrimed) {
      return;
    }

    this.isPrimed = isPrimed;
    if (isPrimed) {
      this.cssClassSet.add('touch-button-primed');
      if (this.inhibitOnDrag) {
        this.rootRef.instance.addEventListener('mousemove', this.mouseMoveListener);
      }
    } else {
      this.cssClassSet.delete('touch-button-primed');
      if (this.inhibitOnDrag) {
        this.rootRef.instance.removeEventListener('mousemove', this.mouseMoveListener);
      }
    }

  }

  /**
   * Responds to mouse down events on this button's root element.
   * @param e The mouse event.
   */
  protected onMouseDown(e: MouseEvent): void {
    if (this.isEnabled.get()) {
      if (this.focusOnDrag) {
        this.mouseClickPosition.x = e.clientX;
        this.mouseClickPosition.y = e.clientY;
        e.stopPropagation();
      }
      this.setPrimed(true);
    }
  }

  /**
   * Responds to mouse up events on this button's root element.
   */
  protected onMouseUp(): void {
    const wasPrimed = this.isPrimed;
    this.setPrimed(false);
    if (wasPrimed && this.isEnabled.get()) {
      this.onPressed();
    }
  }

  /**
   * Responds to mouse leave events on this button's root element.
   * @param e The mouse event.
   */
  protected onMouseLeave(e: MouseEvent): void {
    if (!this.isPrimed) {
      return;
    }
    this.setPrimed(false);
    if (this.focusOnDrag) {
      const newE = new MouseEvent('mousedown', {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: true,
      });
      this.rootRef.instance.parentElement?.dispatchEvent(newE);
    }
  }

  /**
   * Handle mouse moving after clicking.
   * @param e The mouse event.
   */
  protected onMouseMove(e: MouseEvent): void {
    if (!this.isPrimed) {
      return;
    }

    this.currentMousePosition.x = e.clientX;
    this.currentMousePosition.y = e.clientY;

    if (this.getDragDistance() > this.dragThresholdPxActual) {
      this.setPrimed(false);

      const newE = new MouseEvent('mousedown', {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: true,
      });
      this.rootRef.instance.parentElement?.dispatchEvent(newE);

    }
  }

  /**
   * Get the distance that the mouse has been dragged on the correct axis.
   * @returns The distance.
   */
  protected getDragDistance(): number {
    switch (this.inhibitOnDragAxisActual) {
      case 'x': return Math.abs(this.mouseClickPosition.x - this.currentMousePosition.x);
      case 'y': return Math.abs(this.mouseClickPosition.y - this.currentMousePosition.y);
      case 'both': return this.mouseClickPosition.Distance(this.currentMousePosition);
    }
  }

  /**
   * Responds to when this button is pressed.
   */
  protected onPressed(): void {
    this.props.onPressed && this.props.onPressed(this);
  }

  /** @inheritdoc */
  public render(): VNode {
    const reservedClasses = this.getReservedCssClasses();

    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.cssClassSet, this.props.class, reservedClasses);
    } else if (this.props.class !== undefined && this.props.class.length > 0) {
      for (const cssClassToAdd of FSComponent.parseCssClassesFromString(this.props.class, cssClass => !reservedClasses.has(cssClass))) {
        this.cssClassSet.add(cssClassToAdd);
      }
    }

    return (
      <div ref={this.rootRef} class={this.cssClassSet}>
        {this.renderLabel()}
        {this.props.children}
      </div>
    );
  }

  /**
   * Renders this button's label.
   * @returns This button's rendered label, or `null` if this button does not have a label.
   */
  protected renderLabel(): VNode | null {
    if (this.labelContent === undefined) {
      return null;
    }

    return (
      <div class='touch-button-label'>{this.labelContent}</div>
    );
  }

  /**
   * Gets the CSS classes that are reserved for this button's root element.
   * @returns The CSS classes that are reserved for this button's root element.
   */
  protected getReservedCssClasses(): ReadonlySet<string> {
    return TouchButton.RESERVED_CSS_CLASSES;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    if (this.labelContent !== undefined) {
      if (SubscribableUtils.isSubscribable(this.labelContent)) {
        this.labelContent.destroy();
      } else if (typeof this.labelContent === 'object') {
        FSComponent.visitNodes(this.labelContent, node => {
          if (node.instance instanceof DisplayComponent) {
            node.instance.destroy();
            return true;
          }

          return false;
        });
      }
    }

    this.isEnabledSub?.destroy();
    this.isHighlightedSub?.destroy();
    this.isVisibleSub?.destroy();
    this.cssClassSub?.destroy();

    this.rootRef.instance.removeEventListener('mousedown', this.mouseDownListener);
    this.rootRef.instance.removeEventListener('mouseup', this.mouseUpListener);
    this.rootRef.instance.removeEventListener('mouseleave', this.mouseLeaveListener);
    this.rootRef.instance.removeEventListener('mousemove', this.mouseMoveListener);

    super.destroy();
  }
}