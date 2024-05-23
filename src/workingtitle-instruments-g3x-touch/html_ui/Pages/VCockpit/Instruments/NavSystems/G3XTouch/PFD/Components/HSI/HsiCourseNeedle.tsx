import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, MathUtils, NavSourceType, SetSubject, Subject,
  Subscribable, Subscription, VNode, VorToFrom
} from '@microsoft/msfs-sdk';

import { NeedleAnimator } from '@microsoft/msfs-garminsdk';
import { G3XTouchNavIndicator } from '../../../Shared/NavReference/G3XTouchNavReference';

import './HsiCourseNeedle.css';

/**
 * Component props for {@link HsiCourseNeedle}.
 */
export interface HsiCourseNeedleProps extends ComponentProps {
  /** The nav indicator to use. */
  navIndicator: G3XTouchNavIndicator;

  /** The magnetic variation correction to apply to the needle's magnetic course, in degrees. */
  magVarCorrection: Subscribable<number>;

  /** Whether heading data is in a failure state. */
  isHeadingDataFailed: Subscribable<boolean>;

  /** Whether the course needle should actively update. */
  isActive: Subscribable<boolean>;
}

/**
 * A course needle for an HSI.
 *
 * The course needle recognizes a total of four separate active NAV sources: two of type NAV (radio) and two of type
 * GPS. A CSS class is added to the needle's root element (e.g. `hsi-course-needle-nav1`) based on which source is
 * currently active.
 */
export abstract class HsiCourseNeedle<P extends HsiCourseNeedleProps = HsiCourseNeedleProps> extends DisplayComponent<P> {
  private static readonly RESERVED_CSS_CLASSES = [
    'hsi-course-needle',
    'hsi-course-needle-nav1',
    'hsi-course-needle-nav2',
    'hsi-course-needle-gps1',
    'hsi-course-needle-gps2'
  ];

  private static readonly ANIMATION_RATE = 180; // degrees per second

  private readonly rootCssClass = SetSubject.create(['hsi-course-needle']);

  private readonly nominalCourse = MappedSubject.create(
    ([courseMag, magVarCorrection]): number | null => {
      return courseMag === null ? null : courseMag + magVarCorrection;
    },
    this.props.navIndicator.course,
    this.props.magVarCorrection
  );
  private readonly targetRotation = Subject.create(0);

  private readonly animator = new NeedleAnimator(HsiCourseNeedle.ANIMATION_RATE);

  private readonly rotation = Subject.create<number | null>(null);

  private sourceSub?: Subscription;
  private isHeadingDataFailedSub?: Subscription;
  private isActiveSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.sourceSub = this.props.navIndicator.source.sub(source => {
      this.rootCssClass.delete('hsi-course-needle-nav1');
      this.rootCssClass.delete('hsi-course-needle-nav2');
      this.rootCssClass.delete('hsi-course-needle-gps1');
      this.rootCssClass.delete('hsi-course-needle-gps2');

      if (source !== null) {
        const prefix = source.getType() === NavSourceType.Gps ? 'gps' : 'nav';
        const index = source.index === 3 ? 1 : source.index;

        this.rootCssClass.add(`hsi-course-needle-${prefix}${index}`);
      }
    }, true);

    const coursePipe = this.nominalCourse.pipe(this.targetRotation, course => MathUtils.round(course ?? 0, 0.1), true);

    const rotationSub = this.targetRotation.sub(rotation => {
      this.animator.animateRotation(rotation);
    }, false, true);

    const rotationPipe = this.animator.rotation.pipe(this.rotation, true);

    const courseSub = this.nominalCourse.sub(course => {
      if (course === null) {
        coursePipe.pause();
        rotationSub.pause();
        rotationPipe.pause();
        this.rotation.set(null);
        this.animator.stopAnimation();
      } else {
        coursePipe.resume(true);
        this.animator.setRotation(this.targetRotation.get());
        rotationSub.resume();
        rotationPipe.resume(true);
      }
    }, false, true);

    const isHeadingDataFailedSub = this.isHeadingDataFailedSub = this.props.isHeadingDataFailed.sub(isFailed => {
      if (isFailed) {
        this.nominalCourse.pause();
        courseSub.pause();
        coursePipe.pause();
        rotationSub.pause();
        rotationPipe.pause();
        this.rotation.set(null);
        this.animator.stopAnimation();
      } else {
        this.nominalCourse.resume();
        courseSub.resume(true);
      }
    }, false, true);

    this.isActiveSub = this.props.isActive.sub(isActive => {
      if (isActive) {
        isHeadingDataFailedSub.resume(true);
      } else {
        isHeadingDataFailedSub.pause();
        this.nominalCourse.pause();
        courseSub.pause();
        coursePipe.pause();
        rotationSub.pause();
        rotationPipe.pause();
        this.animator.stopAnimation();
      }
    }, true);
  }

  /** @inheritDoc */
  public render(): VNode {
    for (const classToAdd of FSComponent.parseCssClassesFromString(this.getRootCssClass(), cssClass => !HsiCourseNeedle.RESERVED_CSS_CLASSES.includes(cssClass))) {
      this.rootCssClass.add(classToAdd);
    }

    return (
      <div class={this.rootCssClass} style='width: 0px; height: 0px;'>
        {this.renderNeedle(this.rotation, this.props.navIndicator.lateralDeviation, this.props.navIndicator.toFrom)}
      </div>
    );
  }

  /**
   * Gets the CSS class(es) to apply to this needle's root element.
   * @returns The CSS class(es) to apply to this needle's root element.
   */
  protected getRootCssClass(): string {
    return '';
  }

  /**
   * Renders a needle.
   * @returns A needle, as a VNode.
   */
  protected abstract renderNeedle(
    course: Subscribable<number | null>,
    deviation: Subscribable<number | null>,
    toFrom: Subscribable<VorToFrom | null>
  ): VNode;

  /** @inheritDoc */
  public destroy(): void {
    this.animator.setRotation(0);

    this.nominalCourse.destroy();

    this.sourceSub?.destroy();
    this.isHeadingDataFailedSub?.destroy();
    this.isActiveSub?.destroy();

    super.destroy();
  }
}