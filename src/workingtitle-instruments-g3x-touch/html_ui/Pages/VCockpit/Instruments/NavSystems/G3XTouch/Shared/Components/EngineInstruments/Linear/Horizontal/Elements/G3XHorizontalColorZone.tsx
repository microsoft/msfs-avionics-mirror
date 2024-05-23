import { XMLGaugeColorZone, XMLHostedLogicGauge, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { G3XHorizontalBarGaugeGeometry } from '../G3XHorizontalGauge';

/** Properties defining a single colored segment on the bar. */
interface ColorZoneProps {
  /** The geometry layout of the gauge. */
  geometry: G3XHorizontalBarGaugeGeometry,
  /** The min, max, and color of this zone. */
  values: XMLGaugeColorZone,
  /** The gauge's minimum value logic. */
  gaugeMin: CompositeLogicXMLElement | undefined,
  /** The gauge's maximum value logic. */
  gaugeMax: CompositeLogicXMLElement | undefined,
}

/** The (potentially) dynamic colored segments on the gauge bar. */
export class G3XHorizontalColorZone extends DisplayComponent<ColorZoneProps & XMLHostedLogicGauge> {
  protected readonly theRect = FSComponent.createRef<SVGRectElement>();
  protected readonly theShadowRect = FSComponent.createRef<SVGRectElement>();
  protected gaugeMin = 0;
  protected gaugeMax = 0;
  protected zoneMin = 0;
  protected zoneMax = 0;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.zoneMin = this.props.logicHost?.addLogicAsNumber(this.props.values.begin, (min: number) => {
      this.zoneMin = min;
      this.redraw();
    }, 2, this.props.values.smoothFactor);

    this.zoneMax = this.props.logicHost?.addLogicAsNumber(this.props.values.end, (max: number) => {
      this.zoneMax = max;
      this.redraw();
    }, 2, this.props.values.smoothFactor);

    if (this.props.gaugeMin) {
      this.gaugeMin = this.props.logicHost?.addLogicAsNumber(this.props.gaugeMin, (min: number) => {
        this.gaugeMin = min;
        this.redraw();
      }, 2, this.props.values.smoothFactor);
    }

    if (this.props.gaugeMax) {
      this.gaugeMax = this.props.logicHost?.addLogicAsNumber(this.props.gaugeMax, (max: number) => {
        this.gaugeMax = max;
        this.redraw();
      }, 2, this.props.values.smoothFactor);
    }

    this.theRect.instance.setAttribute('fill', this.props.values.color ? this.props.values.color : 'white');
  }

  /**
   * Redraw ourselves when something changes.  Since a lot of our values are
   * relative, we'll recompute our dimensions whenever one of them changes.
   */
  protected redraw(): void {
    // we shorten the maximum length of the bar by a couple pixels so colors don't cover the end ticks
    const startX = 100 * (this.zoneMin - this.gaugeMin) / (this.gaugeMax - this.gaugeMin);
    const width = 100 * (this.zoneMax - this.zoneMin) / (this.gaugeMax - this.gaugeMin);
    this.theRect.instance.setAttribute('x', `${startX}%`);
    this.theRect.instance.setAttribute('width', `${width}%`);
    this.theRect.instance.setAttribute('height', '100%');
    this.theShadowRect.instance.setAttribute('x', `${startX}%`);
    this.theShadowRect.instance.setAttribute('width', `${width}%`);
    this.theShadowRect.instance.setAttribute('height', '100%');
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
          class='color-zone-fragment-cover'
          ref={this.theShadowRect}
          x={0}
          y={0}
          height={0}
          width={0}
          fill={'url(#horizontalColorZoneCoverFill)'}
        />
      </>
    );
  }
}