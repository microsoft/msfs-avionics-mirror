import { AdcEvents, AhrsEvents, ComponentProps, DisplayComponent, EventBus, FSComponent, GNSSEvents, VNode } from '@microsoft/msfs-sdk';

import { HSITickDirection } from './HSICommon';

import './HSITrackPointer.css';

// eslint-disable-next-line jsdoc/require-jsdoc
interface HSITrackPointerProps extends ComponentProps {
  // eslint-disable-next-line jsdoc/require-jsdoc
  bus: EventBus;
  // eslint-disable-next-line jsdoc/require-jsdoc
  svgViewBoxSize: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  radius: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  insideOrOutside: HSITickDirection;
}

/** Track pointer magenta open circle which displays the current aircraft track over the earth. */
export class HSITrackPointer extends DisplayComponent<HSITrackPointerProps> {
  private readonly trackPointerRef = FSComponent.createRef<HTMLDivElement>();
  private half: number;
  private onGround = true;

  /** @inheritdoc */
  constructor(props: HSITrackPointerProps) {
    super(props);
    this.half = props.svgViewBoxSize / 2;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    const sub = this.props.bus.getSubscriber<AdcEvents & AhrsEvents & GNSSEvents>();

    sub.on('track_deg_magnetic')
      .withPrecision(2)
      .handle(hdg => {
        if (!this.onGround) {
          this.updateRotation(hdg);
        }
      });

    sub.on('hdg_deg')
      .withPrecision(2)
      .handle(hdg => {
        if (this.onGround) {
          this.updateRotation(hdg);
        }
      });

    sub.on('on_ground').handle((v) => {
      this.onGround = v;
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly updateRotation = (rotation: number): void => {
    this.trackPointerRef.instance
      .style.transform = `rotate3d(0, 0, 1, ${rotation}deg)`;
  };

  /** @inheritdoc */
  public render(): VNode {
    const { radius, insideOrOutside, svgViewBoxSize } = this.props;
    const pointerRadius = 6;
    const offset = insideOrOutside === 'Inwards' ? -6.5 : 6.5;

    return (
      <div class="hsi-track-pointer" ref={this.trackPointerRef}>
        <svg viewBox={`0 0 ${svgViewBoxSize} ${svgViewBoxSize}`}>
          <circle
            class="hsi-track-pointer-black-outline"
            cx={this.half}
            cy={this.half - radius - offset}
            r={pointerRadius}
            stroke="var(--wt21-colors-black)"
            fill="none"
            stroke-width="5"
          />
          <circle
            class="hsi-track-pointer-circle"
            cx={this.half}
            cy={this.half - radius - offset}
            r={pointerRadius}
            stroke="var(--wt21-colors-magenta)"
            fill="none"
            stroke-width="2.5"
          />
        </svg>
      </div>
    );
  }
}