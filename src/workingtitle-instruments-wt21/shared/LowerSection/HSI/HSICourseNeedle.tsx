/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AhrsEvents, ComponentProps, DisplayComponent, EventBus, FSComponent, NavSourceType, Subject, VNode, VorToFrom } from '@microsoft/msfs-sdk';

import { NavIndicatorContext } from '../../Navigation/NavIndicators/NavIndicatorContext';
import { WT21NavIndicator, WT21NavIndicators, WT21NavSource } from '../../Navigation/WT21NavIndicators';
import { NavIndicatorAnimator } from './NavIndicatorAnimator';

import './HSICourseNeedle.css';

// eslint-disable-next-line jsdoc/require-jsdoc
interface HSICourseNeedleProps extends ComponentProps {
  // eslint-disable-next-line jsdoc/require-jsdoc
  bus: EventBus;
  // eslint-disable-next-line jsdoc/require-jsdoc
  svgViewBoxSize: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  outerRadius: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  innerRadius: number
}

/** The HSI course needle. */
export class HSICourseNeedle extends DisplayComponent<HSICourseNeedleProps, [WT21NavIndicators]> {
  public readonly contextType = [NavIndicatorContext] as const;
  private readonly courseNeedleRef = FSComponent.createRef<HTMLDivElement>();
  private readonly courseDeviationRef = FSComponent.createRef<HTMLDivElement>();
  private readonly courseToFromTriangle = FSComponent.createRef<HTMLDivElement>();
  private readonly courseNeedleRotationAnimator = new NavIndicatorAnimator();
  private readonly courseDeviationAnimator = new NavIndicatorAnimator();
  private readonly isNeedleVisible = Subject.create(false);
  private readonly isDeviationVisible = Subject.create(false);
  private readonly toFromShifted = Subject.create(false);
  private readonly toFromRotated = Subject.create(false);
  private readonly adcHdgDeg = Subject.create(0);
  private readonly half: number;
  private courseNeedleIndicator!: WT21NavIndicator;

  /** @inheritdoc */
  constructor(props: HSICourseNeedleProps) {
    super(props);
    this.half = props.svgViewBoxSize / 2;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.courseNeedleIndicator = this.getContext(NavIndicatorContext).get().get('courseNeedle');
    this.courseNeedleIndicator.source.sub(this.handleNewSource, true);
    this.courseNeedleIndicator.course.sub(x => this.courseNeedleRotationAnimator.setTargetValue(x === null ? 0 : x), true);
    this.courseNeedleIndicator.course.sub(x => this.isNeedleVisible.set(x === null ? false : true), true);
    this.courseNeedleIndicator.lateralDeviation.sub(x => this.courseDeviationAnimator.setTargetValue(x === null ? 0 : x), true);
    this.courseNeedleIndicator.lateralDeviation.sub(this.updateDeviationVisibility, true);
    this.courseNeedleIndicator.toFrom.sub(this.handleToFrom, true);
    this.courseNeedleIndicator.isLocalizer.sub(this.handleIsLocalizer, true);

    this.props.bus.getSubscriber<AhrsEvents>().on('hdg_deg')
      .withPrecision(0).handle(this.adcHdgDeg.set.bind(this.adcHdgDeg));

    this.adcHdgDeg.sub(this.updateToFromShifting, true);
    this.courseNeedleIndicator.course.sub(this.updateToFromShifting, true);

    this.isNeedleVisible.sub(this.setVisiblity, true);
    this.isNeedleVisible.sub(this.updateDeviationVisibility, true);

    this.isDeviationVisible.sub(this.handleDeviationVisibility, true);

    this.toFromShifted.sub(this.updateToFromTriangle, true);
    this.toFromRotated.sub(this.updateToFromTriangle, true);

    this.courseNeedleRotationAnimator.output.sub(this.handleNewCourse);
    this.courseDeviationAnimator.output.sub(this.handleDeviation);

    this.courseNeedleRotationAnimator.start();
    this.courseDeviationAnimator.start();
  }

  private readonly updateToFromTriangle = (): void => {
    const translation = this.toFromShifted.get() ? 1 : -1;
    const rotation = this.toFromRotated.get() ? 180 : 0;

    this.courseToFromTriangle.instance.style.transform =
      `translate3d(0, ${translation * (this.props.innerRadius / 1.5)}px, 0) rotate3d(0, 0, 1, ${rotation}deg)`;
  };

  private readonly setVisiblity = (isVisible: boolean): void => {
    this.courseNeedleRef.instance.classList.toggle('hidden', !isVisible);
    if (isVisible) {
      this.courseNeedleRotationAnimator.start();
      this.courseDeviationAnimator.start();
    } else {
      this.courseNeedleRotationAnimator.stop();
      this.courseDeviationAnimator.stop();
    }
  };

  private readonly updateDeviationVisibility = (): void => {
    const isNeedleVisible = this.isNeedleVisible.get();
    const isDeviationAvailable = this.courseNeedleIndicator.lateralDeviation.get() !== null;
    const shouldDeviationBeVisible = isNeedleVisible && isDeviationAvailable;
    this.isDeviationVisible.set(shouldDeviationBeVisible);
  };

  private readonly handleDeviationVisibility = (isVisible: boolean): void => {
    this.courseDeviationRef.instance.classList.toggle('hidden', !isVisible);
  };

  private readonly handleNewSource = (source: WT21NavSource | null): void => {
    if (!source) {
      throw new Error('This should not happen');
    } else {
      switch (source.getType()) {
        case NavSourceType.Nav:
          this.setNeedleColor('var(--wt21-hsi-course-needle-nav)');
          break;
        case NavSourceType.Gps:
          this.setNeedleColor('var(--wt21-hsi-course-needle-gps)');
          break;
        default: throw new Error('unexpected nav source type');
      }
    }
  };

  private readonly handleIsLocalizer = (isLocalizer: boolean | null): void => {
    this.courseNeedleRef.instance.classList.toggle('isLocalizer', !!isLocalizer);
  };

  private readonly updateToFromShifting = (): void => {
    // Handles moving the triangle to the head or tail side to keep it on the top side of the HSI
    const visualRotation = (this.courseNeedleIndicator.course.get()! + (360 - this.adcHdgDeg.get())) % 360;
    if (visualRotation > 90 && visualRotation < 270) {
      this.toFromShifted.set(true);
    } else {
      this.toFromShifted.set(false);
    }
  };

  private readonly handleNewCourse = (rotation: number | null): void => {
    this.courseNeedleRef.instance
      .style.transform = `rotate3d(0, 0, 1, ${rotation}deg)`;
  };

  /** Set the deviation in terms of a percentage of the max deviation that can be displayed for the given NAV source.
   * @param deviation The normalized deviation (-1, 1). */
  private readonly handleDeviation = (deviation: number): void => {
    this.courseDeviationRef.instance
      .style.transform = `translate3d(${deviation * ((this.props.innerRadius / 3) * 2)}px, 0, 0)`;
  };

  /** Set whether the TO/FROM triangle flag should point to the head or tail.
   * @param toFrom 'to' or 'from' */
  private readonly handleToFrom = (toFrom: VorToFrom | null): void => {
    if (toFrom === VorToFrom.TO || toFrom === null) {
      this.toFromRotated.set(false);
    } else if (toFrom === VorToFrom.FROM) {
      this.toFromRotated.set(true);
    }

    if (toFrom === VorToFrom.OFF) {
      this.courseToFromTriangle.instance.classList.add('hidden');
    } else {
      this.courseToFromTriangle.instance.classList.remove('hidden');
    }
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private setNeedleColor(color: string): void {
    this.courseNeedleRef.instance.style.color = color;
  }

  /** @inheritdoc */
  public render(): VNode {
    const { outerRadius, svgViewBoxSize, innerRadius } = this.props;
    const needleStrokeWidth = 5;

    return (
      <div
        class="hsi-course-needle hsi-absolute-square"
        ref={this.courseNeedleRef}
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
              class="hsi-course-needle-triangle-tip hsi-course-needle-shadow"
              d={`M 0 2 L -10 44 L 10 44 Z M 0 44 L 0 ${(outerRadius - innerRadius) - 6}`}
              transform={`translate(${this.half}, ${this.half - outerRadius})`}
            />
            <path
              class="hsi-course-needle-triangle-tip"
              d={`M 0 2 L -10 44 L 10 44 Z M 0 44 L 0 ${(outerRadius - innerRadius) - 6}`}
              transform={`translate(${this.half}, ${this.half - outerRadius})`}
            />
            <line
              class="hsi-course-needle-tail hsi-course-needle-shadow"
              x1={this.half}
              y1={this.half + outerRadius}
              x2={this.half}
              y2={this.half + (innerRadius) + 5}
            />
            <line
              class="hsi-course-needle-tail"
              x1={this.half}
              y1={this.half + outerRadius}
              x2={this.half}
              y2={this.half + (innerRadius) + 5}
            />
          </g>
          <g
            class="hsi-course-deviation-scale-circles"
            stroke="var(--wt21-colors-white)"
            stroke-width="3"
            fill="none"
          >
            {[-2, -1, 1, 2].map(x => {
              return <>
                <circle
                  class="hsi-course-needle-shadow"
                  cx={this.half + ((innerRadius / 3) * x)}
                  cy={this.half}
                  r={4.5}
                />
                <circle
                  cx={this.half + ((innerRadius / 3) * x)}
                  cy={this.half}
                  r={4.5}
                />
              </>;
            })}
          </g>
        </svg>
        <div
          class="hsi-course-needle-deviation hsi-absolute-square"
          ref={this.courseDeviationRef}
        >
          <svg
            viewBox={`0 0 ${svgViewBoxSize} ${svgViewBoxSize}`}
            stroke-linecap="round"
          >
            <line
              class="hsi-course-needle-deviation-needle hsi-course-needle-shadow"
              x1={this.half}
              y1={this.half + (innerRadius) - 1}
              x2={this.half}
              y2={this.half - (innerRadius)}
            />
            <line
              class="hsi-course-needle-deviation-needle"
              x1={this.half}
              y1={this.half + (innerRadius) - 1}
              x2={this.half}
              y2={this.half - (innerRadius)}
              stroke="currentcolor"
              stroke-width={needleStrokeWidth}
            />
          </svg>
        </div>
        <div
          class="hsi-course-needle-to-from-triangle hsi-absolute-square"
          ref={this.courseToFromTriangle}
        >
          <svg
            viewBox={`0 0 ${svgViewBoxSize} ${svgViewBoxSize}`}
          >
            <g
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            >
              <path
                class="hsi-course-needle-shadow"
                d="m 0 -7 l -11 26 l 22 0 z"
                transform={`translate(${this.half}, ${this.half})`}
              />
              <path
                d="m 0 -7 l -11 26 l 22 0 z"
                stroke="currentcolor"
                stroke-width={needleStrokeWidth}
                transform={`translate(${this.half}, ${this.half})`}
              />
            </g>
          </svg>
        </div>
      </div>
    );
  }
}
