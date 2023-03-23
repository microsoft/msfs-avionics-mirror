import { ComponentProps, DisplayComponent, FSComponent, MathUtils, ObjectSubject, SetSubject, Subject, Subscribable, Subscription, VNode } from '@microsoft/msfs-sdk';

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
  private readonly style = ObjectSubject.create({
    transform: 'rotate3d(0, 0, 1, 0deg)'
  });

  private readonly cssClass = SetSubject.create(['bearing-arrow']);

  private readonly bearing = Subject.create(0);

  private bearingSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.bearing.sub(bearing => {
      this.style.set('transform', `rotate3d(0, 0, 1, ${bearing}deg)`);
    }, true);

    this.bearingSub = this.props.relativeBearing.sub(bearing => {
      if (isNaN(bearing)) {
        this.cssClass.add('hidden');
      } else {
        this.cssClass.delete('hidden');
        this.bearing.set(MathUtils.round(bearing, 0.1));
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <img src='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_bearing_arrow_blue.png' class={this.cssClass} style={this.style} />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.bearingSub?.destroy();

    super.destroy();
  }
}