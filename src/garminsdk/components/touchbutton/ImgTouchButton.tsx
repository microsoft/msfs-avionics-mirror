import {
  DisplayComponent, FSComponent, SetSubject, Subscribable, SubscribableMapFunctions, SubscribableUtils, Subscription, VNode,
} from '@microsoft/msfs-sdk';
import { TouchButton, TouchButtonProps } from './TouchButton';

/** Component props for ImgTouchButton. */
export interface ImgTouchButtonProps extends TouchButtonProps {
  /** The src of the button's image. If not defined, the button will not display an image. */
  imgSrc?: string | Subscribable<string>;
}

/**
 * A touchscreen button which displays an optional label and image.
 *
 * The root element of the button contains the `touch-button-img` CSS class by default, in addition to all
 * root-element classes used by {@link TouchButton}.
 *
 * The root element contains an optional child `<img>` element with the CSS class `touch-button-img-img` and an
 * optional label element with the CSS class `touch-button-label`.
 */
export class ImgTouchButton extends DisplayComponent<ImgTouchButtonProps> {
  protected static readonly RESERVED_CSS_CLASSES = new Set(['touch-button-img']);

  protected readonly buttonRef = FSComponent.createRef<TouchButton>();

  protected readonly cssClassSet = SetSubject.create(['touch-button-img']);

  protected readonly imgSrc = SubscribableUtils.isSubscribable(this.props.imgSrc)
    ? this.props.imgSrc.map(SubscribableMapFunctions.identity())
    : undefined;

  protected cssClassSub?: Subscription;

  /**
   * Gets this button's root HTML element.
   * @returns This button's root HTML element.
   * @throws Error if this button has not yet been rendered.
   */
  public getRootElement(): HTMLElement {
    return this.buttonRef.instance.getRootElement();
  }

  /**
   * Simulates this button being pressed. This will execute the `onPressed()` callback if one is defined.
   * @param ignoreDisabled Whether to simulate the button being pressed regardless of whether the button is disabled.
   * Defaults to `false`.
   */
  public simulatePressed(ignoreDisabled = false): void {
    this.buttonRef.getOrDefault()?.simulatePressed(ignoreDisabled);
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
      <TouchButton
        ref={this.buttonRef}
        isEnabled={this.props.isEnabled}
        isHighlighted={this.props.isHighlighted}
        label={this.props.label}
        onTouched={this.props.onTouched}
        onPressed={this.props.onPressed}
        onHoldStarted={this.props.onHoldStarted}
        onHoldTick={this.props.onHoldTick}
        onHoldEnded={this.props.onHoldEnded}
        focusOnDrag={this.props.focusOnDrag}
        inhibitOnDrag={this.props.inhibitOnDrag}
        dragThresholdPx={this.props.dragThresholdPx}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis}
        isVisible={this.props.isVisible}
        class={this.cssClassSet}
      >
        {this.renderImg()}
        {this.props.children}
      </TouchButton>
    );
  }

  /**
   * Renders this button's image.
   * @returns This button's rendered image, or `null` if this button does not have an image.
   */
  protected renderImg(): VNode | null {
    const imgSrc = this.imgSrc ?? this.props.imgSrc;

    if (imgSrc === undefined) {
      return null;
    }

    return (
      <img src={imgSrc} class='touch-button-img-img' />
    );
  }

  /**
   * Gets the CSS classes that are reserved for this button's root element.
   * @returns The CSS classes that are reserved for this button's root element.
   */
  protected getReservedCssClasses(): ReadonlySet<string> {
    return ImgTouchButton.RESERVED_CSS_CLASSES;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.buttonRef.getOrDefault()?.destroy();

    this.imgSrc?.destroy();

    this.cssClassSub?.destroy();

    super.destroy();
  }
}