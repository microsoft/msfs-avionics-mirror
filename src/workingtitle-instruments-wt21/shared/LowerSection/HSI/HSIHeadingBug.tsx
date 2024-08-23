import { APEvents, ComponentProps, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

// eslint-disable-next-line jsdoc/require-jsdoc
interface HSIHeadingBugProps extends ComponentProps {
  // eslint-disable-next-line jsdoc/require-jsdoc
  bus: EventBus;
  // eslint-disable-next-line jsdoc/require-jsdoc
  svgViewBoxSize: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  radius: number;
}

/** Cyan heading bug for the HSI. */
export class HSIHeadingBug extends DisplayComponent<HSIHeadingBugProps> {
  private readonly headingBugRef = FSComponent.createRef<SVGGElement>();
  private half: number;

  /** @inheritdoc */
  constructor(props: HSIHeadingBugProps) {
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
    this.headingBugRef.instance.classList.toggle('hidden', !isVisible);
  }

  private readonly handleNewSelectedHeading = (selectedHeading: number): void => {
    this.updateHeadingBugRotation(selectedHeading);
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private updateHeadingBugRotation(selectedHeading: number): void {
    this.headingBugRef.instance
      .setAttribute('transform', `rotate(${selectedHeading}, ${this.half}, ${this.half})`);
  }

  /** @inheritdoc */
  public render(): VNode {
    const { radius } = this.props;
    const headingBugPath = 'm -1.75 -1 l -17 0 l 0 -11 l 10 0 l 7 6 Z';

    return (
      <g class="hsi-heading-bug" ref={this.headingBugRef}>
        <g
          class="hsi-heading-bug-translated"
          transform={`translate(${this.half}, ${this.half - radius})`}
          stroke="var(--wt21-colors-cyan)"
          fill="var(--wt21-colors-cyan)"
        >
          <path
            class="hsi-heading-bug-left"
            d={headingBugPath}
          />
          <path
            class="hsi-heading-bug-right"
            d={headingBugPath}
            transform={'scale(-1, 1)'}
          />
        </g>
      </g>
    );
  }
}