import {
  ComponentProps, CssTransformBuilder, CssTransformSubject, DisplayComponent, FSComponent, SetSubject, Subscribable,
  Subscription, VNode
} from '@microsoft/msfs-sdk';

import './UiBearingArrow.css';

/**
 * Component props for {@link UiBearingArrow}.
 */
export interface UiBearingArrowProps extends ComponentProps {
  /** The relative bearing to display, in degrees. If the value is `NaN`, the arrow will be hidden. */
  relativeBearing: Subscribable<number>;
}

/**
 * A cyan arrow which rotates to point to a relative bearing.
 */
export class UiBearingArrow extends DisplayComponent<UiBearingArrowProps> {
  private readonly cssClass = SetSubject.create<string>();

  private readonly cssTransform = CssTransformSubject.create(CssTransformBuilder.rotate3d('deg'));

  private bearingSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.bearingSub = this.props.relativeBearing.sub(bearing => {
      if (isNaN(bearing)) {
        this.cssClass.add('hidden');
      } else {
        this.cssClass.delete('hidden');
        this.cssTransform.transform.set(0, 0, 1, bearing, 0.1);
        this.cssTransform.resolve();
      }
    }, true);
  }

  /** @inheritDoc */
  public render(): VNode {
    this.cssClass.add('ui-bearing-arrow');
    this.cssClass.add('ui-darken-filter');

    return (
      <svg viewBox='0 0 25 25' class={this.cssClass} style={{ 'transform': this.cssTransform }}>
        <path d='M 12.5 24.88 v -10.21 c 0 -0.78 0.86 -1.26 1.52 -0.85 l 1.99 1.22 c 0.86 0.53 1.87 -0.4 1.42 -1.3 l -6.53 -13.07 c -0.37 -0.74 -1.42 -0.74 -1.79 0 l -6.54 13.08 c -0.45 0.9 0.56 1.83 1.42 1.3 l 1.99 -1.22 c 0.67 -0.41 1.52 0.07 1.52 0.85 v 10.21 h 5 Z' />
      </svg>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.bearingSub?.destroy();

    super.destroy();
  }
}