import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, MathUtils, NavSourceType, ObjectSubject, SetSubject, Subject, Subscribable, Subscription, VNode,
  VorToFrom
} from '@microsoft/msfs-sdk';

import { NeedleAnimator } from '@microsoft/msfs-garminsdk';
import { G3000NavIndicator } from '@microsoft/msfs-wtg3000-common';

/**
 * Component props for CourseNeedle.
 */
export interface CourseNeedleProps extends ComponentProps {
  /** Whether the bearing pointer should use the HSI map style. */
  hsiMap: boolean;

  /** The nav indicator to use. */
  navIndicator: G3000NavIndicator;

  /** The magnetic variation correction to apply to the needle's magnetic course, in degrees. */
  magVarCorrection: Subscribable<number>;

  /** Whether heading data is in a failure state. */
  isHeadingDataFailed: Subscribable<boolean>;

  /**
   * The magnitude of the maximum allowed deflection of the CDI, scaled such that 1 is equal to full-scale (2 dots)
   * deflection. Defaults to 1.
   */
  maxCdiDeflection?: number;

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
export abstract class CourseNeedle extends DisplayComponent<CourseNeedleProps> {
  private static readonly RESERVED_CSS_CLASSES = [
    'hsi-course-needle',
    'hsi-course-needle-nav1',
    'hsi-course-needle-nav2',
    'hsi-course-needle-gps1',
    'hsi-course-needle-gps2'
  ];

  private static readonly ANIMATION_RATE = 180; // degrees per second

  private readonly rotationStyle = ObjectSubject.create({
    transform: 'rotate3d(0, 0, 1, 0deg)'
  });

  private readonly toFromStyle = ObjectSubject.create({
    transform: 'rotate3d(0, 0, 1, 0deg)'
  });

  private readonly deviationStyle = ObjectSubject.create({
    display: 'none',
    transform: 'translate3d(0px, 0px, 0px)'
  });

  private readonly rootCssClass = SetSubject.create(['hsi-course-needle']);

  private readonly maxCdiDeflection = this.props.maxCdiDeflection ?? 1;

  private readonly nominalCourse = MappedSubject.create(
    ([courseMag, magVarCorrection]): number => {
      return courseMag === null ? 0 : courseMag + magVarCorrection;
    },
    this.props.navIndicator.course,
    this.props.magVarCorrection
  );
  private readonly targetRotation = Subject.create(0);

  private readonly animator = new NeedleAnimator(CourseNeedle.ANIMATION_RATE);

  private readonly deviationTranslate = Subject.create(0);

  private sourceSub?: Subscription;
  private deviationSub?: Subscription;
  private toFromSub?: Subscription;
  private isHeadingDataFailedSub?: Subscription;
  private isActiveSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.sourceSub = this.props.navIndicator.source.sub(source => {
      this.rootCssClass.delete('hsi-course-needle-nav1');
      this.rootCssClass.delete('hsi-course-needle-nav2');
      this.rootCssClass.delete('hsi-course-needle-gps1');
      this.rootCssClass.delete('hsi-course-needle-gps2');

      if (source !== null) {
        const prefix = source.getType() === NavSourceType.Gps ? 'gps' : 'nav';
        const index = source.index;

        this.rootCssClass.add(`hsi-course-needle-${prefix}${index}`);
      }
    }, true);

    const coursePipe = this.nominalCourse.pipe(this.targetRotation, course => MathUtils.round(course, 0.1), true);

    const rotationSub = this.targetRotation.sub(rotation => {
      this.animator.animateRotation(rotation);
    }, false, true);

    this.animator.rotation.sub(rotation => {
      this.rotationStyle.set('transform', `rotate3d(0, 0, 1, ${rotation}deg)`);
    }, true);

    this.toFromSub = this.props.navIndicator.toFrom.sub(toFrom => {
      this.toFromStyle.set('transform', `rotate3d(0, 0, 1, ${toFrom === VorToFrom.FROM ? 180 : 0}deg`);
    }, true);

    if (!this.props.hsiMap) {
      this.deviationSub = this.props.navIndicator.lateralDeviation.sub(deviation => {
        if (deviation === null) {
          this.deviationStyle.set('display', 'none');
        } else {
          this.deviationStyle.set('display', '');
          this.deviationTranslate.set(MathUtils.clamp(MathUtils.round(deviation, 0.001), -this.maxCdiDeflection, this.maxCdiDeflection));
        }
      });

      this.deviationTranslate.sub(translate => {
        this.deviationStyle.set('transform', `translate3d(calc(${translate} * var(--hsi-course-needle-deviation-full)), 0px, 0px)`);
      }, true);
    }

    const isHeadingDataFailedSub = this.isHeadingDataFailedSub = this.props.isHeadingDataFailed.sub(isFailed => {
      if (isFailed) {
        this.nominalCourse.pause();
        coursePipe.pause();
        rotationSub.pause();
        this.animator.setRotation(0);
      } else {
        this.nominalCourse.resume();
        coursePipe.resume(true);
        this.animator.setRotation(this.targetRotation.get());
        rotationSub.resume();
      }
    }, false, true);

    this.isActiveSub = this.props.isActive.sub(isActive => {
      if (isActive) {
        isHeadingDataFailedSub.resume(true);
      } else {
        isHeadingDataFailedSub.pause();
        this.nominalCourse.pause();
        coursePipe.pause();
        rotationSub.pause();
        this.animator.stopAnimation();
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    for (const classToAdd of FSComponent.parseCssClassesFromString(this.getRootCssClass(), cssClass => !CourseNeedle.RESERVED_CSS_CLASSES.includes(cssClass))) {
      this.rootCssClass.add(classToAdd);
    }

    return (
      <div class={this.rootCssClass}>
        {this.props.hsiMap ? this.renderMapNeedle(this.rotationStyle) : this.renderRoseNeedle(this.rotationStyle, this.deviationStyle, this.toFromStyle)}
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
   * Renders needles for an HSI rose.
   * @returns Needles for an HSI rose, as a VNode.
   */
  protected abstract renderRoseNeedle(rotationStyle: ObjectSubject<any>, deviationStyle: ObjectSubject<any>, toFromStyle: ObjectSubject<any>): VNode;

  /**
   * Renders needles for an HSI map.
   * @returns Needles for an HSI map, as a VNode.
   */
  protected abstract renderMapNeedle(rotationStyle: ObjectSubject<any>): VNode;

  /** @inheritdoc */
  public destroy(): void {
    this.animator.setRotation(0);

    this.nominalCourse.destroy();

    this.sourceSub?.destroy();
    this.deviationSub?.destroy();
    this.toFromSub?.destroy();
    this.isHeadingDataFailedSub?.destroy();
    this.isActiveSub?.destroy();

    super.destroy();
  }
}