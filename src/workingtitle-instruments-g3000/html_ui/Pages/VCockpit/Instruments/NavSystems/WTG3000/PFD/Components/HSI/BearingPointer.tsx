import { ComponentProps, DisplayComponent, FSComponent, MappedSubject, MathUtils, ObjectSubject, Subject, Subscribable, Subscription, VNode } from '@microsoft/msfs-sdk';

import { NeedleAnimator } from '@microsoft/msfs-garminsdk';
import { G3000NavIndicator } from '@microsoft/msfs-wtg3000-common';

import './BearingPointer.css';

/**
 * Component props for BearingPointer.
 */
export interface BearingPointerProps extends ComponentProps {
  /** Whether the bearing pointer should use the HSI map style. */
  hsiMap: boolean;

  /** The index of the bearing pointer. */
  index: 1 | 2;

  /** The nav indicator to use. */
  navIndicator: G3000NavIndicator;

  /** The magnetic variation correction to apply to the needle's magnetic course, in degrees. */
  magVarCorrection: Subscribable<number>;

  /** Whether heading data is in a failure state. */
  isHeadingDataFailed: Subscribable<boolean>;

  /** Whether the bearing pointer should actively update. */
  isActive: Subscribable<boolean>;
}

/**
 * A bearing pointer for an HSI.
 */
export class BearingPointer extends DisplayComponent<BearingPointerProps> {
  private static readonly ANIMATION_RATE = 45; // degrees per second

  private readonly rootStyle = ObjectSubject.create({
    display: 'none',
    transform: 'rotate3d(0, 0, 1, 0deg)'
  });

  private readonly nominalBearing = MappedSubject.create(
    ([bearingMag, magVarCorrection]): number | null => {
      return bearingMag === null ? null : bearingMag + magVarCorrection;
    },
    this.props.navIndicator.bearing,
    this.props.magVarCorrection
  );
  private readonly targetRotation = Subject.create(0);

  private readonly isVisible = MappedSubject.create(
    ([source, isLocalizer, bearing, isHeadingDataFailed]): boolean => {
      return source !== null
        && !(source.isLocalizer.get() ?? false)
        && !(isLocalizer ?? false)
        && bearing !== null
        && !isHeadingDataFailed;
    },
    this.props.navIndicator.source,
    this.props.navIndicator.isLocalizer,
    this.props.navIndicator.bearing,
    this.props.isHeadingDataFailed
  );

  private readonly animator = new NeedleAnimator(BearingPointer.ANIMATION_RATE);

  private isActiveSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const bearingSub = this.nominalBearing.sub(bearing => {
      if (bearing !== null) {
        this.targetRotation.set(MathUtils.round(bearing, 0.1));
      }
    }, false, true);

    this.targetRotation.sub(rotation => {
      this.animator.animateRotation(rotation);
    }, true);

    this.animator.rotation.sub(rotation => {
      this.rootStyle.set('transform', `rotate3d(0, 0, 1, ${rotation}deg)`);
    }, true);

    const isVisibleSub = this.isVisible.sub(isVisible => {
      if (isVisible) {
        this.rootStyle.set('display', '');
        this.nominalBearing.resume();
        bearingSub.resume(true);
      } else {
        this.rootStyle.set('display', 'none');
        this.nominalBearing.pause();
        bearingSub.pause();
        this.animator.setRotation(this.targetRotation.get());
      }
    }, false, true);

    this.isActiveSub = this.props.isActive.sub(isActive => {
      if (isActive) {
        this.isVisible.resume();
        isVisibleSub.resume(true);
        this.animator.setRotation(this.targetRotation.get());
      } else {
        this.isVisible.pause();
        isVisibleSub.pause();
        this.nominalBearing.pause();
        bearingSub.pause();
        this.animator.stopAnimation();
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="hsi-bearing-pointer" style={this.rootStyle}>
        {this.props.hsiMap ? this.renderMapNeedle() : this.renderRoseNeedle()}
      </div>
    );
  }

  /**
   * Renders a needle for an HSI rose.
   * @returns A needle for an HSI rose, as a VNode.
   */
  private renderRoseNeedle(): VNode {
    const needlePath = this.props.index === 1
      ? 'M 184 70 l 0 7 l -16 16 M 184 77 l 16 16 M 184 77 l 0 25 z M 184 266 l 0 42'
      : 'M 184 70 l 0 7 l -16 16 M 184 77 l 16 16 M 179 82 l 0 20 M 189 82 l 0 20 M 179 266 l 0 34 l 10 0 l 0 -34 M 184 300 l 0 8';

    return (
      <svg viewBox="0 0 368 368" class="hsi-bearing-pointer-needle">
        <path d={needlePath} />
      </svg>
    );
  }

  /**
   * Renders a needle for an HSI map.
   * @returns A needle for an HSI map, as a VNode.
   */
  private renderMapNeedle(): VNode {
    const needlePath = this.props.index === 1
      ? 'M 175 20 l 0 7 l -16 16 M 175 27 l 16 16 M 175 27 l 0 25 z M 175 290 l 0 40'
      : 'M 175 20 l 0 7 l -16 16 M 175 27 l 16 16 M 170 32 l 0 20 M 180 32 l 0 20 M 170 290 l 0 32 l 10 0 l 0 -32 M 175 322 l 0 8';

    return (
      <svg viewBox="0 0 350 350" class="hsi-bearing-pointer-needle">
        <path d={needlePath} />
      </svg>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.animator.setRotation(0);

    this.nominalBearing.destroy();
    this.isVisible.destroy();

    this.isActiveSub?.destroy();

    super.destroy();
  }
}