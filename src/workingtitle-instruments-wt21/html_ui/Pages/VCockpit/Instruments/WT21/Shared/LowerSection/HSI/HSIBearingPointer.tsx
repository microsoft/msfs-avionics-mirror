import { ComponentProps, DisplayComponent, EventBus, FSComponent, NavMath, Subject, VNode } from '@microsoft/msfs-sdk';

import { NavIndicatorContext } from '../../Navigation/NavIndicators/NavIndicatorContext';
import { WT21NavIndicator, WT21NavIndicators } from '../../Navigation/WT21NavIndicators';
import { NavIndicatorAnimator } from './NavIndicatorAnimator';

// eslint-disable-next-line jsdoc/require-jsdoc
interface HSIBearingPointerProps extends ComponentProps {
  // eslint-disable-next-line jsdoc/require-jsdoc
  bus: EventBus;
  // eslint-disable-next-line jsdoc/require-jsdoc
  svgViewBoxSize: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  outerRadius: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  innerRadius: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  bearingPointerNumber: 1 | 2;
}

/** An HSI bearing pointer. */
export class HSIBearingPointer extends DisplayComponent<HSIBearingPointerProps, [WT21NavIndicators]> {
  public readonly contextType = [NavIndicatorContext] as const;
  private readonly bearingPointerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly half: number;
  private readonly pointerAnimator = new NavIndicatorAnimator();
  private readonly isVisible = Subject.create(false);
  private bearingPointerIndicator!: WT21NavIndicator;

  /** @inheritdoc */
  constructor(props: HSIBearingPointerProps) {
    super(props);
    this.half = props.svgViewBoxSize / 2;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.setColor(
      this.props.bearingPointerNumber === 1
        ? 'var(--wt21-colors-cyan)'
        : 'var(--wt21-colors-white)');

    const navIndicators = this.getContext(NavIndicatorContext).get();
    this.bearingPointerIndicator = navIndicators.get(`bearingPointer${this.props.bearingPointerNumber}`);
    this.bearingPointerIndicator.bearing.sub(x => this.pointerAnimator.setTargetValue(x === null ? 0 : x), true);
    this.bearingPointerIndicator.bearing.sub(this.updateVisibility, true);
    this.bearingPointerIndicator.isLocalizer.sub(this.updateVisibility, true);

    this.pointerAnimator.output.sub(this.handleNewBearingDirection);

    this.isVisible.sub(this.handleVisibility, true);
  }

  private readonly updateVisibility = (): void => {
    const hasBearing = this.bearingPointerIndicator.bearing.get() !== null;
    const isNotLocalizer = !this.bearingPointerIndicator.isLocalizer.get();
    this.isVisible.set(hasBearing && isNotLocalizer);
  };

  private readonly handleVisibility = (isVisible: boolean): void => {
    this.bearingPointerRef.instance.classList.toggle('hidden', !isVisible);
    if (isVisible) {
      this.pointerAnimator.start();
    } else {
      this.pointerAnimator.stop();
    }
  };

  private handleNewBearingDirection = (direction: number): void => {
    const rotation = NavMath.normalizeHeading(direction);
    this.updateRotation(rotation);
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private updateRotation(rotation: number): void {
    this.bearingPointerRef.instance
      .style.transform = `rotate3d(0, 0, 1, ${rotation}deg)`;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private setColor(color: string): void {
    this.bearingPointerRef.instance.style.color = color;
  }

  /** @inheritdoc */
  public render(): VNode {
    const { outerRadius, svgViewBoxSize, innerRadius, bearingPointerNumber } = this.props;

    const trianglePath = 'M -14 8 L 0 -10 L 14 8 ';
    const triangleOffset = outerRadius * 0.75;

    const number2Width = 14;
    const number2HeadLinesOffset = -1;
    const number2TailLinesOffset = -3;

    return (
      <div
        class="hsi-bearing-pointer hsi-absolute-square"
        ref={this.bearingPointerRef}
      >
        <svg viewBox={`0 0 ${svgViewBoxSize} ${svgViewBoxSize}`}>
          <g
            stroke-width={3}
            stroke="currentcolor"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          >
            <path
              class="hsi-bearing-pointer-head-triangle"
              d={trianglePath}
              transform={`translate(${this.half}, ${this.half - triangleOffset})`}
            />
            <path
              class="hsi-bearing-pointer-tail-triangle"
              d={trianglePath}
              transform={`translate(${this.half}, ${this.half + triangleOffset})`}
            />
            {bearingPointerNumber === 1 &&
              <g class="hsi-bearing-pointer-1">
                <line
                  class="hsi-bearing-pointer-head-line"
                  x1={this.half}
                  y1={this.half - (innerRadius) - 1}
                  x2={this.half}
                  y2={this.half - outerRadius}
                />
                <line
                  class="hsi-bearing-pointer-tail-line"
                  x1={this.half}
                  y1={this.half + outerRadius}
                  x2={this.half}
                  y2={this.half + (innerRadius) + 1}
                />
              </g>
            }
            {bearingPointerNumber === 2 &&
              <g class="hsi-bearing-pointer-2">
                <line
                  class="hsi-bearing-pointer-head-line-tip"
                  x1={this.half}
                  y1={this.half - triangleOffset - 11}
                  x2={this.half}
                  y2={this.half - outerRadius}
                />
                <line
                  class="hsi-bearing-pointer-head-wide-line-1"
                  x1={this.half - (number2Width / 2)}
                  y1={this.half - (innerRadius) - 1}
                  x2={this.half - (number2Width / 2)}
                  y2={this.half - triangleOffset + number2HeadLinesOffset}
                />
                <line
                  class="hsi-bearing-pointer-head-wide-line-2"
                  x1={this.half + (number2Width / 2)}
                  y1={this.half - (innerRadius) - 1}
                  x2={this.half + (number2Width / 2)}
                  y2={this.half - triangleOffset + number2HeadLinesOffset}
                />
                <line
                  class="hsi-bearing-pointer-tail-wide-line-1"
                  x1={this.half - (number2Width / 2)}
                  y1={this.half + (innerRadius) + 1}
                  x2={this.half - (number2Width / 2)}
                  y2={this.half + triangleOffset + number2TailLinesOffset}
                />
                <line
                  class="hsi-bearing-pointer-tail-wide-line-2"
                  x1={this.half + (number2Width / 2)}
                  y1={this.half + (innerRadius) + 1}
                  x2={this.half + (number2Width / 2)}
                  y2={this.half + triangleOffset + number2TailLinesOffset}
                />
                <line
                  class="hsi-bearing-pointer-tail-line-tip"
                  x1={this.half}
                  y1={this.half + triangleOffset - 11}
                  x2={this.half}
                  y2={this.half + outerRadius}
                />
              </g>
            }
          </g>
        </svg>
      </div>
    );
  }
}