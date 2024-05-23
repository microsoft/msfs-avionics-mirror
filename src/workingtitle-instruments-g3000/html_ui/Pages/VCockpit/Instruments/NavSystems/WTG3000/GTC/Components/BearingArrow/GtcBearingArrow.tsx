import {
  ComponentProps, CssTransformBuilder, CssTransformSubject, DisplayComponent, FSComponent, SetSubject, Subscribable,
  Subscription, VNode
} from '@microsoft/msfs-sdk';

import './GtcBearingArrow.css';

/**
 * Component props for GtcBearingArrow.
 */
export interface GtcBearingArrowProps extends ComponentProps {
  /** The relative bearing to display, in degrees. If the value is `NaN`, the arrow will be hidden. */
  relativeBearing: Subscribable<number>;
}

/**
 * A cyan arrow which rotates to point to a relative bearing.
 */
export class GtcBearingArrow extends DisplayComponent<GtcBearingArrowProps> {
  private readonly cssClass = SetSubject.create(['bearing-arrow']);

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
    return (
      <img
        src='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_bearing_arrow_blue.png'
        class={this.cssClass}
        style={{ 'transform': this.cssTransform }}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.bearingSub?.destroy();

    super.destroy();
  }
}