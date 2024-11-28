import {
  ComponentProps, CssTransformBuilder, CssTransformSubject, DisplayComponent, FSComponent, MappedSubject, MathUtils,
  Subject, Subscribable, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { NeedleAnimator } from '@microsoft/msfs-garminsdk';

import { G3XTouchNavIndicator } from '../../../Shared/NavReference/G3XTouchNavReference';

import './HsiBearingPointer.css';

/**
 * Component props for {@link HsiBearingPointer}.
 */
export interface HsiBearingPointerProps extends ComponentProps {
  /** The index of the bearing pointer. */
  index: 1 | 2;

  /** The nav indicator to use. */
  navIndicator: G3XTouchNavIndicator;

  /** The magnetic variation correction to apply to the needle's magnetic course, in degrees. */
  magVarCorrection: Subscribable<number>;

  /** Whether heading data is in a failure state. */
  isHeadingDataFailed: Subscribable<boolean>;

  /** Whether the bearing pointer should actively update. */
  isActive: Subscribable<boolean>;

  /** The radius from the center of the HSI compass, in pixels, at which each outer end of the pointer stem lies. */
  stemOuterRadius: number;

  /** The radius from the center of the HSI compass, in pixels, at which each inner end of the pointer stem lies. */
  stemInnerRadius: number;

  /** The width of the block stem, in pixels. Ignored if `index` is `1`. */
  stemWidth: number;

  /** The radius from the center of the HSI compass, in pixels, at which the tip of the pointer arrow lies. */
  arrowOuterRadius: number;

  /** The length of the pointer arrowhead, in pixels. */
  arrowLength: number;

  /** The width of the pointer arrowhead, in pixels. */
  arrowWidth: number;
}

/**
 * A bearing pointer for an HSI.
 */
export class HsiBearingPointer extends DisplayComponent<HsiBearingPointerProps> {
  private static readonly ANIMATION_RATE = 45; // degrees per second

  private readonly hidden = Subject.create(false);

  private readonly transform = CssTransformSubject.create(CssTransformBuilder.rotate3d('deg'));

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

  private readonly animator = new NeedleAnimator(HsiBearingPointer.ANIMATION_RATE);

  private isActiveSub?: Subscription;

  /** @inheritDoc */
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
      this.transform.transform.set(0, 0, 1, rotation, 0.1);
      this.transform.resolve();
    }, true);

    const isVisibleSub = this.isVisible.sub(isVisible => {
      if (isVisible) {
        this.hidden.set(false);
        this.nominalBearing.resume();
        bearingSub.resume(true);
      } else {
        this.hidden.set(true);
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

  /** @inheritDoc */
  public render(): VNode {
    const {
      stemOuterRadius,
      stemInnerRadius,
      stemWidth,
      arrowOuterRadius,
      arrowLength,
      arrowWidth
    } = this.props;

    const radius = stemOuterRadius;
    const diameter = radius * 2;

    const viewBox = `${-radius} ${-radius} ${diameter} ${diameter}`;

    const arrowHalfWidth = arrowWidth / 2;
    const arrowDx = arrowHalfWidth;
    const arrowDy = arrowLength;
    const arrowHypot = Math.hypot(arrowDx, arrowDy);
    const arrowOutlineDx = MathUtils.round((arrowHypot + 1) / arrowHypot * arrowDx, 0.01);
    const arrowOutlineDy = MathUtils.round((arrowHypot + 1) / arrowHypot * arrowDy, 0.01);

    const arrowStartX = -arrowDx;
    const arrowStartY = -arrowOuterRadius + arrowDy;

    const arrowOutlineStartX = -arrowOutlineDx;
    const arrowOutlineStartY = -arrowOuterRadius + arrowOutlineDy;

    const arrowOutlinePath = `M ${arrowOutlineStartX.toFixed(2)} ${arrowOutlineStartY.toFixed(2)} l ${arrowOutlineDx.toFixed(2)} ${-arrowOutlineDy.toFixed(2)} l ${arrowOutlineDx.toFixed(2)} ${arrowOutlineDy.toFixed(2)}`;
    const arrowPath = `M ${arrowStartX} ${arrowStartY} l ${arrowDx} ${-arrowDy} l ${arrowDx} ${arrowDy}`;

    let outlinePath: string;
    let strokePath: string;

    if (this.props.index === 1) {
      const stemLength = stemOuterRadius - stemInnerRadius;

      outlinePath
        = `M 0 ${stemOuterRadius + 1} v ${-(stemLength + 2)} M 0 ${-(stemOuterRadius + 1)} v ${stemLength + 2} ${arrowOutlinePath}`;

      strokePath
        = `M 0 ${stemOuterRadius} v ${-stemLength} M 0 ${-stemOuterRadius} v ${stemLength} ${arrowPath}`;
    } else {
      const stemHalfWidth = stemWidth / 2;
      const stemOuterLength = stemOuterRadius - arrowOuterRadius;
      const stemBottomInnerLength = arrowOuterRadius - stemInnerRadius;
      const stemTopInnerLength = arrowOuterRadius - (arrowLength / arrowHalfWidth) * stemHalfWidth - stemInnerRadius;

      outlinePath
        = `M 0 ${stemOuterRadius + 1} v ${-(stemOuterLength + 1)} M ${-stemHalfWidth} ${stemInnerRadius - 1} v ${stemBottomInnerLength + 1} h ${stemWidth} v ${-(stemBottomInnerLength + 1)} M 0 ${-(stemOuterRadius + 1)} v ${stemOuterLength + 1} ${arrowOutlinePath} M ${-stemHalfWidth} ${-(stemInnerRadius - 1)} v ${-(stemTopInnerLength + 1)} M ${stemHalfWidth} ${-(stemInnerRadius - 1)} v ${-(stemTopInnerLength + 1)}`;

      strokePath
        = `M 0 ${stemOuterRadius} v ${-stemOuterLength} M ${-stemHalfWidth} ${stemInnerRadius} v ${stemBottomInnerLength} h ${stemWidth} v ${-stemBottomInnerLength} M 0 ${-stemOuterRadius} v ${stemOuterLength} ${arrowPath} M ${-stemHalfWidth} ${-stemInnerRadius} v ${-stemTopInnerLength} M ${stemHalfWidth} ${-stemInnerRadius} v ${-stemTopInnerLength}`;
    }

    return (
      <div class={{ 'hsi-bearing-pointer': true, 'hidden': this.hidden }} style='width: 0px; height: 0px;'>
        <svg
          viewBox={viewBox}
          class='hsi-bearing-pointer-svg'
          style={{
            'position': 'absolute',
            'left': `${-radius}px`,
            'top': `${-radius}px`,
            'width': `${diameter}px`,
            'height': `${diameter}px`,
            'transform': this.transform
          }}
        >
          <path d={outlinePath} class='hsi-bearing-pointer-outline' />
          <path d={strokePath} class='hsi-bearing-pointer-stroke' />
        </svg>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.animator.setRotation(0);

    this.nominalBearing.destroy();
    this.isVisible.destroy();

    this.isActiveSub?.destroy();

    super.destroy();
  }
}