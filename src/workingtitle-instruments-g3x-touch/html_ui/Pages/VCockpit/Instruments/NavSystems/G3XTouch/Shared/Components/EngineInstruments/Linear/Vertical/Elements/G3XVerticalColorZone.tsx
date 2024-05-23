import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { G3XHorizontalColorZone } from '../../Horizontal/Elements/G3XHorizontalColorZone';

/** The (potentially) dynamic colored segments on the gauge bar. */
export class G3XVerticalColorZone extends G3XHorizontalColorZone {

  /** @inheritDoc */
  protected redraw(): void {
    // we shorten the maximum length of the bar by a couple pixels so colors don't cover the end ticks
    const height = 100 * ((this.zoneMax - this.zoneMin) / (this.gaugeMax - this.gaugeMin));
    const startY = 100 * (((this.gaugeMax - this.zoneMax) / (this.gaugeMax - this.gaugeMin)));
    this.theRect.instance.setAttribute('y', `${startY}%`);
    this.theRect.instance.setAttribute('height', `${height}%`);
    this.theRect.instance.setAttribute('width', '100%');
    this.theShadowRect.instance.setAttribute('y', `${startY}%`);
    this.theShadowRect.instance.setAttribute('height', `${height}%`);
    this.theShadowRect.instance.setAttribute('width', '100%');
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <>
        <rect
          class='color-zone-fragment'
          ref={this.theRect}
          x={0}
          y={0}
          height={0}
          width={0}
          fill='white'
        />
        <rect
          class='color-zone-fragment'
          ref={this.theShadowRect}
          x={0}
          y={0}
          height={0}
          width={0}
          fill={'url(#verticalColorZoneCoverFill)'}
        />
      </>
    );
  }
}