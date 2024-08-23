import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subject, SVGUtils, VNode } from '@microsoft/msfs-sdk';

import './HSIPlan.css';

// eslint-disable-next-line jsdoc/require-jsdoc
interface HSIPlanProps extends ComponentProps {
  // eslint-disable-next-line jsdoc/require-jsdoc
  bus: EventBus;
  // eslint-disable-next-line jsdoc/require-jsdoc
  svgViewBoxSize: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  mapRange: Subject<string>;
}

/** Plan format for the HSI. */
export class HSIPlan extends DisplayComponent<HSIPlanProps> {
  private readonly hsiPlanRef = FSComponent.createRef<HTMLDivElement>();
  private half: number;

  /** @inheritdoc */
  public constructor(props: HSIPlanProps) {
    super(props);
    this.half = props.svgViewBoxSize / 2;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public setVisibility(isVisible: boolean): void {
    this.hsiPlanRef.instance.classList.toggle('hidden', !isVisible);
  }

  /** @inheritdoc */
  public render(): VNode {
    const { svgViewBoxSize } = this.props;
    const outerRadius = 230;

    return (
      <div class="hsi-plan" ref={this.hsiPlanRef}>
        <svg class="hsi-plan-static" viewBox={`0 0 ${svgViewBoxSize} ${svgViewBoxSize}`}>
          <path
            class="hsi-plan-outer-circle"
            d={SVGUtils.describeArc(this.half, this.half, outerRadius, -65, 286)}
            stroke="rgb(128,128,128)"
            fill="none"
            stroke-linecap="round"
          />
        </svg>
        <div class="hsi-plan-north-symbol">N</div>
        <div class="hsi-plan-range-text-outer">{this.props.mapRange}</div>
      </div>
    );
  }
}