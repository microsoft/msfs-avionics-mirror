import { FSComponent, SetSubject, Subscribable, SubscribableMapFunctions, SubscribableUtils, VNode } from '@microsoft/msfs-sdk';
import { TouchButton, TouchButtonProps } from './TouchButton';

/** Component props for BgImgTouchButton */
export interface BgImgTouchButtonProps extends TouchButtonProps {
  /** The src of the button's "up" state background image. If not defined, the button will not display an image. */
  upImgSrc?: string | Subscribable<string>;

  /** The src of the button's "down" state background image. If not defined, the button will not display an image. */
  downImgSrc?: string | Subscribable<string>;
}

const BG_IMG_TOUCH_BUTTON_CSS_CLASS = 'bg-img-touch-button';

/**
 * A touchscreen button which uses different images for its "up" state and "down" state backgrounds and displays an optional label.
 *
 * The root element of the button contains the `bg-img-touch-button` CSS class by default, in addition to all
 * root-element classes used by {@link TouchButton}, with the exception of `touch-button` itself.
 *
 * The root element contains optional child `<img>` elements with the CSS classes `bg-img-touch-button-up-img` and
 * `bg-img-touch-button-down-img` as well as an optional label element with the CSS class `bg-img-touch-button-label`.
 */
export class BgImgTouchButton extends TouchButton<BgImgTouchButtonProps> {
  protected static override readonly RESERVED_CSS_CLASSES: Set<string> = new Set([
    BG_IMG_TOUCH_BUTTON_CSS_CLASS,
    'touch-button-disabled',
    'touch-button-primed',
    'touch-button-highlight',
    'touch-button-hidden',
  ]);


  protected override readonly cssClassSet: SetSubject<string> = SetSubject.create([BG_IMG_TOUCH_BUTTON_CSS_CLASS]);

  protected readonly upImgSrc = SubscribableUtils.isSubscribable(this.props.upImgSrc)
    ? this.props.upImgSrc.map(SubscribableMapFunctions.identity()) : undefined;

  protected readonly downImgSrc = SubscribableUtils.isSubscribable(this.props.downImgSrc)
    ? this.props.downImgSrc.map(SubscribableMapFunctions.identity()) : undefined;

  /** @inheritdoc */
  public override render(): VNode {
    const reservedClasses: ReadonlySet<string> = this.getReservedCssClasses();
    const upImgSrc = this.upImgSrc ?? this.props.upImgSrc;
    const downImgSrc = this.downImgSrc ?? this.props.downImgSrc;

    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.cssClassSet, this.props.class, reservedClasses);
    } else if (this.props.class !== undefined && this.props.class.length > 0) {
      for (const cssClassToAdd of FSComponent.parseCssClassesFromString(this.props.class, cssClass => !reservedClasses.has(cssClass))) {
        this.cssClassSet.add(cssClassToAdd);
      }
    }

    return (
      <div ref={this.rootRef} class={this.cssClassSet}>
        {upImgSrc && <img src={upImgSrc} class="bg-img-touch-button-up-img" />}
        {downImgSrc && <img src={downImgSrc} class="bg-img-touch-button-down-img" />}
        {this.props.label && <div class='bg-img-touch-button-label'>{this.labelContent}</div>}
        {this.props.children}
      </div>

    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.upImgSrc?.destroy();
    this.downImgSrc?.destroy();

    this.cssClassSub?.destroy();

    super.destroy();
  }
}