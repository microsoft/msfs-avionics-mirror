import { CompositeLogicXMLHost, DisplayComponent, FSComponent, Subscription, VNode } from '@microsoft/msfs-sdk';

import { G3XHorizontalBarGaugeGeometry } from '../G3XHorizontalGauge';

/** Properties for a colored line element */
export interface G3XHorizontalColorLineProps {
  /** An XML logic host. */
  logicHost: CompositeLogicXMLHost;

  /** The geometry of the horizontal bar. */
  geometry: G3XHorizontalBarGaugeGeometry;

  /** The color of the line. */
  color: string;

  /** The logic controlling the position of the line. */
  position: CompositeLogicXMLElement;

  /** An optional smoothing factor for value changes. */
  smoothFactor?: number;

  /** The width of the line's parent gauge scale. */
  scaleWidth: number;

  /** The height of the line's parent gauge scale. */
  scaleHeight: number;
}

/** A single, thick colored stroke at a specific value. */
export class G3XHorizontalColorLine extends DisplayComponent<G3XHorizontalColorLineProps> {
  protected readonly lineRef = FSComponent.createRef<SVGLineElement>();
  private readonly subscriptions: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    if (this.props.position) {
      this.updatePosition(this.props.logicHost.addLogicAsNumber(this.props.position, (pos: number) => {
        this.updatePosition(pos);
      }, 2, this.props.smoothFactor));
    }

    this.subscriptions.push(this.props.geometry.maxValue.sub(() => this.updatePosition(this.props.position.getValueAsNumber())));
    this.subscriptions.push(this.props.geometry.minValue.sub(() => this.updatePosition(this.props.position.getValueAsNumber())));
  }

  /** @inheritDoc */
  protected updatePosition(position: number): void {
    const min = this.props.geometry.minValue.get();
    const max = this.props.geometry.maxValue.get();
    const translation = (((position - min) / (max - min)) * this.props.scaleWidth);
    this.lineRef.instance.style.transform = `translate3d(${translation}px, 0px, 0px)`;
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <line
        class='color-line'
        ref={this.lineRef}
        x1={0}
        y1={0}
        x2={0}
        y2={this.props.scaleHeight}
        stroke={this.props.color}
        stroke-width={2}
        vector-effect='non-scaling-stroke'
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
    this.subscriptions.forEach((subscription) => subscription.destroy());
  }
}