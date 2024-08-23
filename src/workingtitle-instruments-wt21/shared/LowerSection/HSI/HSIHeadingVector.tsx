import { APEvents, ComponentProps, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

// eslint-disable-next-line jsdoc/require-jsdoc
interface HSIArcHeadingVectorProps extends ComponentProps {
  // eslint-disable-next-line jsdoc/require-jsdoc
  bus: EventBus;
  // eslint-disable-next-line jsdoc/require-jsdoc
  svgViewBoxSize: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  outerRadius: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  innerRadius: number;
}

/** The cyan heading vector dashed line. */
export class HSIArcHeadingVector extends DisplayComponent<HSIArcHeadingVectorProps> {
  private readonly headingVectorDashedLineRef = FSComponent.createRef<SVGGElement>();
  private half: number;

  /** @inheritdoc */
  constructor(props: HSIArcHeadingVectorProps) {
    super(props);
    this.half = props.svgViewBoxSize / 2;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    const apEvents = this.props.bus.getSubscriber<APEvents>();

    apEvents.on('ap_heading_selected')
      .whenChanged()
      .handle(this.handleNewSelectedHeading);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public setVisibility(isVisible: boolean): void {
    this.headingVectorDashedLineRef.instance.classList.toggle('hidden', !isVisible);
  }

  private readonly handleNewSelectedHeading = (selectedHeading: number): void => {
    this.updateHeadingVectorDashedLineRotation(selectedHeading);
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private updateHeadingVectorDashedLineRotation(selectedHeading: number): void {
    this.headingVectorDashedLineRef.instance
      .style.transform = `rotate3d(0, 0, 1, ${selectedHeading}deg)`;
  }

  /** @inheritdoc */
  public render(): VNode {
    const { svgViewBoxSize, outerRadius, innerRadius } = this.props;
    return (
      <div class="hsi-heading-vector-dashed-line hsi-absolute-square" ref={this.headingVectorDashedLineRef}>
        <svg viewBox={`0 0 ${svgViewBoxSize} ${svgViewBoxSize}`}>
          <line
            x1={this.half}
            y1={this.half - outerRadius}
            x2={this.half}
            y2={this.half - innerRadius}
            stroke-linecap="round"
            stroke="var(--wt21-colors-cyan)"
            stroke-dasharray="12 8"
          />
        </svg>
      </div>
    );
  }
}