/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ComponentProps, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { NavIndicatorContext } from '../../Navigation/NavIndicators/NavIndicatorContext';
import { WT21GhostNeedleNavIndicator, WT21NavIndicators } from '../../Navigation/WT21NavIndicators';
import { NavIndicatorAnimator } from './NavIndicatorAnimator';

import './HSIGhostNeedle.css';

// eslint-disable-next-line jsdoc/require-jsdoc
interface HSIGhostNeedleProps extends ComponentProps {
  // eslint-disable-next-line jsdoc/require-jsdoc
  bus: EventBus;
  // eslint-disable-next-line jsdoc/require-jsdoc
  svgViewBoxSize: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  outerRadius: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  innerRadius: number
}

/** The HSI ghost needle. */
export class HSIGhostNeedle extends DisplayComponent<HSIGhostNeedleProps, [WT21NavIndicators]> {
  public readonly contextType = [NavIndicatorContext] as const;
  private readonly ghostNeedleRef = FSComponent.createRef<HTMLDivElement>();
  private readonly courseDeviationRef = FSComponent.createRef<HTMLDivElement>();
  private readonly half: number;
  private readonly ghostNeedleRotationAnimator = new NavIndicatorAnimator();
  private readonly ghostDeviationAnimator = new NavIndicatorAnimator();
  private ghostNeedleIndicator!: WT21GhostNeedleNavIndicator;

  /** @inheritdoc */
  constructor(props: HSIGhostNeedleProps) {
    super(props);
    this.half = props.svgViewBoxSize / 2;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.ghostNeedleIndicator = this.getContext(NavIndicatorContext).get().get('ghostNeedle') as WT21GhostNeedleNavIndicator;
    this.ghostNeedleIndicator.course.sub(x => this.ghostNeedleRotationAnimator.setTargetValue(x === null ? 0 : x), true);
    this.ghostNeedleIndicator.lateralDeviation.sub(x => this.ghostDeviationAnimator.setTargetValue(x === null ? 0 : x), true);
    this.ghostNeedleIndicator.isVisible.sub(this.setVisibility, true);

    this.ghostNeedleRotationAnimator.output.sub(this.handleNewCourse);
    this.ghostDeviationAnimator.output.sub(this.handleDeviation);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly setVisibility = (isVisible: boolean): void => {
    this.ghostNeedleRef.instance.classList.toggle('hidden', !isVisible);
    if (isVisible) {
      this.ghostNeedleRotationAnimator.start();
      this.ghostDeviationAnimator.start();
    } else {
      this.ghostNeedleRotationAnimator.stop();
      this.ghostDeviationAnimator.stop();
    }
  };

  private readonly handleNewCourse = (rotation: number | null): void => {
    this.ghostNeedleRef.instance
      .style.transform = `rotate3d(0, 0, 1, ${rotation}deg)`;
  };

  /** Set the deviation in terms of a percentage of the max deviation that can be displayed for the given NAV source.
   * @param deviation The normalized deviation (-1, 1). */
  private readonly handleDeviation = (deviation: number | null): void => {
    this.courseDeviationRef.instance
      .style.transform = `translate3d(${(deviation === null ? -1 : deviation) * ((this.props.innerRadius / 3) * 2)}px, 0, 0)`;
  };

  /** @inheritdoc */
  public render(): VNode {
    const { outerRadius, svgViewBoxSize, innerRadius } = this.props;
    const needleStrokeWidth = 2;
    const gapWidth = 8;
    const dashArrayDeviation = '14 12';
    const dashArrayTailHead = '14 12';
    const deviationNeedleOffset = 14;
    const deviationNeedleTipsLength = 7;
    const tailHeadInnerOffset = 3;
    const tailOuterOffset = 1;
    const headOuterOffset = 62;

    return (
      <div
        class="hsi-ghost-needle hsi-absolute-square"
        ref={this.ghostNeedleRef}
      >
        <svg viewBox={`0 0 ${svgViewBoxSize} ${svgViewBoxSize}`}>
          <g
            stroke-width={needleStrokeWidth}
            stroke="currentcolor"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          >
            <path
              class="hsi-ghost-needle-triangle-tip hsi-ghost-needle-shadow"
              d="M 0 1 L -14 44 L 14 44 Z M 8 44 L 8 50 M -8 44 L -8 50"
              transform={`translate(${this.half}, ${this.half - outerRadius})`}
            />
            <path
              class="hsi-ghost-needle-triangle-tip"
              d="M 0 1 L -14 44 L 14 44 Z M 8 44 L 8 50 M -8 44 L -8 50"
              transform={`translate(${this.half}, ${this.half - outerRadius})`}
            />
            <g class="hsi-ghost-needle-head" stroke-dasharray={dashArrayTailHead} stroke-dashoffset="0">
              <line
                class="hsi-ghost-needle-shadow"
                x1={this.half + gapWidth}
                y1={this.half - outerRadius + headOuterOffset}
                x2={this.half + gapWidth}
                y2={this.half - innerRadius - tailHeadInnerOffset}
              />
              <line
                x1={this.half + gapWidth}
                y1={this.half - outerRadius + headOuterOffset}
                x2={this.half + gapWidth}
                y2={this.half - innerRadius - tailHeadInnerOffset}
              />
              <line
                class="hsi-ghost-needle-shadow"
                x1={this.half + -gapWidth}
                y1={this.half - outerRadius + headOuterOffset}
                x2={this.half + -gapWidth}
                y2={this.half - innerRadius - tailHeadInnerOffset}
              />
              <line
                x1={this.half + -gapWidth}
                y1={this.half - outerRadius + headOuterOffset}
                x2={this.half + -gapWidth}
                y2={this.half - innerRadius - tailHeadInnerOffset}
              />
            </g>
            <g class="hsi-ghost-needle-tail" stroke-dasharray={dashArrayTailHead} stroke-dashoffset="15">
              <line
                class="hsi-ghost-needle-shadow"
                x1={this.half + gapWidth}
                y1={this.half + outerRadius - tailOuterOffset}
                x2={this.half + gapWidth}
                y2={this.half + innerRadius + tailHeadInnerOffset + 1}
              />
              <line
                x1={this.half + gapWidth}
                y1={this.half + outerRadius - tailOuterOffset}
                x2={this.half + gapWidth}
                y2={this.half + innerRadius + tailHeadInnerOffset + 1}
              />
              <line
                class="hsi-ghost-needle-shadow"
                x1={this.half + -gapWidth}
                y1={this.half + outerRadius - tailOuterOffset}
                x2={this.half + -gapWidth}
                y2={this.half + innerRadius + tailHeadInnerOffset + 1}
              />
              <line
                x1={this.half + -gapWidth}
                y1={this.half + outerRadius - tailOuterOffset}
                x2={this.half + -gapWidth}
                y2={this.half + innerRadius + tailHeadInnerOffset + 1}
              />
            </g>
            <g class="hsi-ghost-needle-tail-tips">
              <line
                class="hsi-ghost-needle-deviation-needle hsi-ghost-needle-shadow"
                x1={this.half + -gapWidth}
                y1={this.half + outerRadius - 1}
                x2={this.half + -gapWidth}
                y2={this.half + outerRadius - 4}
              />
              <line
                class="hsi-ghost-needle-deviation-needle"
                x1={this.half + -gapWidth}
                y1={this.half + outerRadius - 1}
                x2={this.half + -gapWidth}
                y2={this.half + outerRadius - 4}
                stroke="currentcolor"
                stroke-width={needleStrokeWidth}
              />
              <line
                class="hsi-ghost-needle-deviation-needle hsi-ghost-needle-shadow"
                x1={this.half + gapWidth}
                y1={this.half + outerRadius - 1}
                x2={this.half + gapWidth}
                y2={this.half + outerRadius - 4}
              />
              <line
                class="hsi-ghost-needle-deviation-needle"
                x1={this.half + gapWidth}
                y1={this.half + outerRadius - 1}
                x2={this.half + gapWidth}
                y2={this.half + outerRadius - 4}
                stroke="currentcolor"
                stroke-width={needleStrokeWidth}
              />
            </g>
          </g>
        </svg>
        <div
          class="hsi-ghost-needle-deviation hsi-absolute-square"
          ref={this.courseDeviationRef}
        >
          <svg
            viewBox={`0 0 ${svgViewBoxSize} ${svgViewBoxSize}`}
            stroke-linecap="round"
          >
            <g stroke-dasharray={dashArrayDeviation}>
              <line
                class="hsi-ghost-needle-deviation-needle hsi-ghost-needle-shadow"
                x1={this.half + gapWidth}
                y1={this.half + (innerRadius - deviationNeedleOffset)}
                x2={this.half + gapWidth}
                y2={this.half - (innerRadius - deviationNeedleOffset)}
              />
              <line
                class="hsi-ghost-needle-deviation-needle"
                x1={this.half + gapWidth}
                y1={this.half + (innerRadius - deviationNeedleOffset)}
                x2={this.half + gapWidth}
                y2={this.half - (innerRadius - deviationNeedleOffset)}
                stroke="currentcolor"
                stroke-width={needleStrokeWidth}
              />
              <line
                class="hsi-ghost-needle-deviation-needle hsi-ghost-needle-shadow"
                x1={this.half + -gapWidth}
                y1={this.half + (innerRadius - deviationNeedleOffset)}
                x2={this.half + -gapWidth}
                y2={this.half - (innerRadius - deviationNeedleOffset)}
              />
              <line
                class="hsi-ghost-needle-deviation-needle"
                x1={this.half + -gapWidth}
                y1={this.half + (innerRadius - deviationNeedleOffset)}
                x2={this.half + -gapWidth}
                y2={this.half - (innerRadius - deviationNeedleOffset)}
                stroke="currentcolor"
                stroke-width={needleStrokeWidth}
              />
            </g>
            <g class="deviationNeedleTips">
              <line
                class="hsi-ghost-needle-deviation-needle hsi-ghost-needle-shadow"
                x1={this.half + -gapWidth}
                y1={this.half + (innerRadius - deviationNeedleTipsLength)}
                x2={this.half + -gapWidth}
                y2={this.half + (innerRadius)}
              />
              <line
                class="hsi-ghost-needle-deviation-needle"
                x1={this.half + -gapWidth}
                y1={this.half + (innerRadius - deviationNeedleTipsLength)}
                x2={this.half + -gapWidth}
                y2={this.half + (innerRadius)}
                stroke="currentcolor"
                stroke-width={needleStrokeWidth}
              />
              <line
                class="hsi-ghost-needle-deviation-needle hsi-ghost-needle-shadow"
                x1={this.half + gapWidth}
                y1={this.half + (innerRadius - deviationNeedleTipsLength)}
                x2={this.half + gapWidth}
                y2={this.half + (innerRadius)}
              />
              <line
                class="hsi-ghost-needle-deviation-needle"
                x1={this.half + gapWidth}
                y1={this.half + (innerRadius - deviationNeedleTipsLength)}
                x2={this.half + gapWidth}
                y2={this.half + (innerRadius)}
                stroke="currentcolor"
                stroke-width={needleStrokeWidth}
              />
              <line
                class="hsi-ghost-needle-deviation-needle hsi-ghost-needle-shadow"
                x1={this.half + -gapWidth}
                y1={this.half - (innerRadius - deviationNeedleTipsLength)}
                x2={this.half + -gapWidth}
                y2={this.half - (innerRadius)}
              />
              <line
                class="hsi-ghost-needle-deviation-needle"
                x1={this.half + -gapWidth}
                y1={this.half - (innerRadius - deviationNeedleTipsLength)}
                x2={this.half + -gapWidth}
                y2={this.half - (innerRadius)}
                stroke="currentcolor"
                stroke-width={needleStrokeWidth}
              />
              <line
                class="hsi-ghost-needle-deviation-needle hsi-ghost-needle-shadow"
                x1={this.half + gapWidth}
                y1={this.half - (innerRadius - deviationNeedleTipsLength)}
                x2={this.half + gapWidth}
                y2={this.half - (innerRadius)}
              />
              <line
                class="hsi-ghost-needle-deviation-needle"
                x1={this.half + gapWidth}
                y1={this.half - (innerRadius - deviationNeedleTipsLength)}
                x2={this.half + gapWidth}
                y2={this.half - (innerRadius)}
                stroke="currentcolor"
                stroke-width={needleStrokeWidth}
              />
            </g>
          </svg>
        </div>
      </div>
    );
  }
}