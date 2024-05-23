import {
  CssTransformBuilder, CssTransformSubject, FSComponent, MathUtils, Subject, Subscribable, Subscription, VNode, VorToFrom
} from '@microsoft/msfs-sdk';

import { HsiCourseNeedle, HsiCourseNeedleProps } from './HsiCourseNeedle';

import './HsiActiveNavNeedle.css';

/**
 * Component props for {@link HsiActiveNavNeedle}.
 */
export interface HsiActiveNavNeedleProps extends HsiCourseNeedleProps {
  /** The total length, in pixels, of the lateral deviation scale (5 dots). */
  deviationScaleLength: number;

  /** The size (diameter) of each lateral deviation scale dot, in pixels. */
  deviationDotSize: number;

  /** The radius from the center of the HSI compass, in pixels, at which each outer end of the course arrow stem lies. */
  stemOuterRadius: number;

  /** The radius from the center of the HSI compass, in pixels, at which each inner end of the course arrow stem lies. */
  stemInnerRadius: number;

  /** The radius from the center of the HSI compass, in pixels, at which each end of the deviation indicator stem lies. */
  stemDeviationOuterRadius: number;

  /** The width of the course arrow and deviation indicator stems, in pixels. */
  stemWidth: number;

  /** The length of the course arrowhead, in pixels. */
  arrowLength: number;

  /** The width of the course arrowhead, in pixels. */
  arrowWidth: number;

  /** The radius from the center of the HSI compass, in pixels, at which the tip of the TO/FROM arrow lies. */
  toFromArrowOuterRadius: number;

  /** The length of the TO/FROM arrow, in pixels. */
  toFromArrowLength: number;

  /** The width of the TO/FROM arrow, in pixels. */
  toFromArrowWidth: number;
}

/**
 * An HSI course needle for the active nav source, consisting of an arrow, to/from flag, and a course deviation
 * indicator (CDI) with hollow dot markers representing full- and half-scale deviation.
 *
 * The course needle supports four different styles: regular HSI rose style, HSI map style, and a closed (solid color)
 * style and an open (color outline with transparent middle) style for each of the first two. The HSI rose style
 * includes a course deviation indicator, while the HSI map style does not.
 */
export class HsiActiveNavNeedle extends HsiCourseNeedle<HsiActiveNavNeedleProps> {
  private readonly twoDotPx = 2 * this.props.deviationScaleLength / 5;

  private readonly rootHidden = Subject.create(false);
  private readonly rootTransform = CssTransformSubject.create(CssTransformBuilder.rotate3d('deg'));

  private readonly deviationHidden = Subject.create(false);
  private readonly deviationTransform = CssTransformSubject.create(CssTransformBuilder.translate3d('px', 'px', 'px'));

  private readonly toFromHidden = Subject.create(false);
  private readonly toFromTransform = CssTransformSubject.create(CssTransformBuilder.rotate3d('deg'));

  private courseSub?: Subscription;
  private deviationSub?: Subscription;
  private toFromSub?: Subscription;

  /**
   * Responds to when this needle's course changes.
   * @param course The new course, in degrees, or `null` if there is no valid course.
   */
  private onCourseChanged(course: number | null): void {
    if (course === null) {
      this.rootHidden.set(true);

      this.deviationSub!.pause();
      this.toFromSub!.pause();
    } else {
      this.rootHidden.set(false);
      this.rootTransform.transform.set(0, 0, 1, course, 0.1);
      this.rootTransform.resolve();

      this.deviationSub!.resume(true);
      this.toFromSub!.resume(true);
    }
  }

  /**
   * Responds to when this needle's deviation changes.
   * @param deviation The new deviation, scaled such that 2 dots deviation is equal to +/-1, or `null` if there is no
   * valid deviation.
   */
  private onDeviationChanged(deviation: number | null): void {
    if (deviation === null) {
      this.deviationHidden.set(true);
    } else {
      this.deviationHidden.set(false);
      this.deviationTransform.transform.set(MathUtils.clamp(deviation, -1.25, 1.25) * this.twoDotPx, 0, 0, 0.1);
      this.deviationTransform.resolve();
    }
  }

  /**
   * Responds to when this needle's TO/FROM flag changes.
   * @param toFrom The new TO/FROM flag, or `null` if there is no valid flag.
   */
  private onToFromChanged(toFrom: VorToFrom | null): void {
    if (toFrom === null || toFrom === VorToFrom.OFF) {
      this.toFromHidden.set(true);
    } else {
      this.toFromHidden.set(false);
      this.toFromTransform.transform.set(0, 0, 1, toFrom === VorToFrom.FROM ? 180 : 0);
      this.toFromTransform.resolve();
    }
  }

  /** @inheritDoc */
  protected getRootCssClass(): string {
    return 'hsi-course-needle-active';
  }

  /** @inheritDoc */
  protected renderNeedle(
    course: Subscribable<number | null>,
    deviation: Subscribable<number | null>,
    toFrom: Subscribable<VorToFrom | null>
  ): VNode {
    const {
      deviationDotSize,
      stemOuterRadius,
      stemInnerRadius,
      stemDeviationOuterRadius,
      stemWidth,
      arrowLength,
      arrowWidth,
      toFromArrowOuterRadius,
      toFromArrowLength,
      toFromArrowWidth
    } = this.props;

    const radius = stemOuterRadius + arrowLength;
    const diameter = radius * 2;

    const viewBox = `${-radius} ${-radius} ${diameter} ${diameter}`;

    const deviationDotRadius = deviationDotSize / 2;

    const stemHalfWidth = stemWidth / 2;
    const stemOuterLength = stemOuterRadius - stemInnerRadius;
    const arrowStemLength = stemOuterLength - stemHalfWidth / 3;
    const arrowHalfWidth = arrowWidth / 2;
    const arrowBaseDx = arrowHalfWidth - stemHalfWidth;
    const arrowBaseDy = arrowBaseDx / 3;
    const arrowPointDx = arrowHalfWidth;
    const arrowPointDy = arrowLength + arrowHalfWidth / 3;
    const deviationLength = stemDeviationOuterRadius * 2;

    const toFromArrowHalfWidth = toFromArrowWidth / 2;
    const toFromArrowBaseDx = toFromArrowHalfWidth;
    const toFromArrowBaseDy = toFromArrowBaseDx / 3;
    const toFromArrowPointDx = toFromArrowHalfWidth;
    const toFromArrowPointDy = toFromArrowLength + toFromArrowBaseDy;

    const needlePath
      = `M ${-stemHalfWidth} ${stemOuterRadius} v ${-stemOuterLength} h ${stemWidth} v ${stemOuterLength} Z M ${-stemHalfWidth} ${-stemInnerRadius} v ${-arrowStemLength} l ${-arrowBaseDx} ${arrowBaseDy} l ${arrowPointDx} ${-arrowPointDy} l ${arrowPointDx} ${arrowPointDy} l ${-arrowBaseDx} ${-arrowBaseDy} v ${arrowStemLength} Z`;

    const deviationPath
      = `M ${-stemHalfWidth} ${stemDeviationOuterRadius} v ${-deviationLength} h ${stemWidth} v ${deviationLength} Z`;

    const toFromPath
      = `M 0 ${-toFromArrowOuterRadius} l ${toFromArrowPointDx} ${toFromArrowPointDy} l ${-toFromArrowBaseDx} ${-toFromArrowBaseDy} l ${-toFromArrowBaseDx} ${toFromArrowBaseDy} Z`;

    this.deviationSub = deviation.sub(this.onDeviationChanged.bind(this), false, true);
    this.toFromSub = toFrom.sub(this.onToFromChanged.bind(this), false, true);
    this.courseSub = course.sub(this.onCourseChanged.bind(this), true);

    return (
      <div
        class={{ 'hsi-course-needle-active-inner': true, 'hidden': this.rootHidden }}
        style={{
          'position': 'absolute',
          'left': `${-radius}px`,
          'top': `${-radius}px`,
          'width': `${diameter}px`,
          'height': `${diameter}px`,
          'transform': this.rootTransform
        }}
      >
        <svg viewBox={viewBox} class='hsi-course-needle-active-closed' style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;'>
          <path class='hsi-course-needle-active-fill' d={needlePath} />
        </svg>
        <svg viewBox={viewBox} class='hsi-course-needle-active-open' style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;'>
          <path class='hsi-course-needle-active-outline' d={needlePath} />
          <path class='hsi-course-needle-active-fill' d={needlePath} />
        </svg>

        <svg viewBox={viewBox} class='hsi-course-needle-active-dots' style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;'>
          <circle cx={-this.twoDotPx} cy={0} r={deviationDotRadius} />
          <circle cx={-this.twoDotPx / 2} cy={0} r={deviationDotRadius} />
          <circle cx={this.twoDotPx / 2} cy={0} r={deviationDotRadius} />
          <circle cx={this.twoDotPx} cy={0} r={deviationDotRadius} />
        </svg>

        <div
          class={{ 'hsi-course-needle-active-deviation': true, 'hidden': this.deviationHidden }}
          style={{
            'position': 'absolute',
            'left': '0px',
            'top': '0px',
            'width': '100%',
            'height': '100%',
            'transform': this.deviationTransform
          }}
        >
          <svg viewBox={viewBox} class='hsi-course-needle-active-closed' style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;'>
            <path class='hsi-course-needle-active-fill' d={deviationPath} />
          </svg>
          <svg viewBox={viewBox} class='hsi-course-needle-active-open' style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;'>
            <path class='hsi-course-needle-active-outline' d={deviationPath} />
            <path class='hsi-course-needle-active-fill' d={deviationPath} />
          </svg>
        </div>

        <svg
          viewBox={viewBox}
          class={{ 'hsi-course-needle-active-tofrom': true, 'hidden': this.toFromHidden }}
          style={{
            'position': 'absolute',
            'left': '0px',
            'top': '0px',
            'width': '100%',
            'height': '100%',
            'transform': this.toFromTransform
          }}
        >
          <path class='hsi-course-needle-active-fill' d={toFromPath} />
        </svg>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.courseSub?.destroy();
    this.deviationSub?.destroy();
    this.toFromSub?.destroy();

    super.destroy();
  }
}
