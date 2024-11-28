import {
  Accessible, ComponentProps, CssRotate3dTransform, CssTransformBuilder, CssTransformSubject, DisplayComponent, Easing,
  FSComponent, HorizonProjection, MathUtils, Subject, Subscribable, VNode
} from '@microsoft/msfs-sdk';

import { RollIndicatorScaleComponent, RollIndicatorScaleParameters } from './RollIndicatorScaleComponent';

/**
 * Component props for {@link RollLimitIndicators}.
 */
export interface RollLimitIndicatorsProps extends ComponentProps {
  /** The component's horizon projection. */
  projection: HorizonProjection;

  /** Parameters describing the indicators' parent roll scale. */
  scaleParams: Readonly<RollIndicatorScaleParameters>;

  /** Whether to show the indicators. */
  show: Subscribable<boolean>;

  /**
   * The roll angle magnitude at which to place the left limit indicator, in degrees. A non-finite value or `NaN` will
   * cause the indicator to not be displayed.
   */
  leftRollLimit: Accessible<number>;

  /**
   * The roll angle magnitude at which to place the right limit indicator, in degrees. A non-finite value or `NaN` will
   * cause the indicator to not be displayed.
   */
  rightRollLimit: Accessible<number>;

  /**
   * The duration of the indicators' easing animation, in milliseconds. The easing animation is used to smoothly
   * transition the indicators from one roll angle to another when the roll limits change. Defaults to `1000`.
   */
  easeDuration?: number;
}

/**
 * An entry describing a roll limit indicator.
 */
type RollLimitIndicatorEntry = {
  /** The side to which the indicator belongs. */
  side: 'left' | 'right';

  /** The roll angle magnitude at which to position the indicator, in degrees. */
  limit: Accessible<number>;

  /** The display style to apply to the indicator. */
  display: Subject<string>;

  /** The transform to apply to the indicator. */
  transform: CssTransformSubject<CssRotate3dTransform>;

  /** The sign of the indicator's rotation transformation. */
  rotateSign: 1 | -1;

  /** The roll angle magnitude, in degrees, at which the indicator's current easing animation starts. */
  easingStart: number;

  /** The roll angle magnitude, in degrees, at which the indicator's current easing animation ends. */
  easingEnd: number;

  /** The easing function to use for the indicator's current easing animation. */
  easingFunc: (progress: number) => number;

  /** The progress of the indicator's current easing animation, from 0 to 1. */
  easingProgress: number;

  /**
   * The roll angle magnitude, in degrees, at which to position the indicator after the easing animation has been
   * applied.
   */
  limitEased: number;
};

/**
 * A PFD roll indicator scale component that displays roll limit indicators.
 */
export class RollLimitIndicators extends DisplayComponent<RollLimitIndicatorsProps> implements RollIndicatorScaleComponent {
  private static readonly EASING_BOTH_FUNC = Easing.sin('both');
  private static readonly EASING_OUT_FUNC = Easing.sin('out');

  /** @inheritDoc */
  public readonly isRollIndicatorScaleComponent = true;

  private readonly easeDuration = this.props.easeDuration ?? 1000;

  private readonly entries = {
    left: RollLimitIndicators.createEntry('left', this.props.leftRollLimit),
    right: RollLimitIndicators.createEntry('right', this.props.rightRollLimit)
  };

  private isScaleVisible = true;

  /** @inheritDoc */
  public onScaleAttached(): void {
    // noop
  }

  /** @inheritDoc */
  public onScaleVisibilityChanged(isVisible: boolean): void {
    this.isScaleVisible = isVisible;
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    // noop
  }

  /** @inheritDoc */
  public onUpdated(time: number, elapsed: number): void {
    if (this.isScaleVisible && this.props.show.get()) {
      this.updateIndicator(this.entries.left, elapsed);
      this.updateIndicator(this.entries.right, elapsed);
    } else {
      this.hideIndicator(this.entries.left);
      this.hideIndicator(this.entries.right);
    }
  }

  /**
   * Updates a roll limit indicator.
   * @param entry The entry for the indicator to update.
   * @param elapsed The elapsed time, in milliseconds, since the last update.
   */
  private updateIndicator(entry: RollLimitIndicatorEntry, elapsed: number): void {
    const limit = entry.limit.get();
    if (!isFinite(limit)) {
      this.hideIndicator(entry);
      return;
    }

    const dt = Math.max(0, elapsed);

    const clampedLimit = Math.max(0, limit);

    if (clampedLimit !== entry.easingEnd) {
      entry.easingFunc = entry.easingProgress === 1 ? RollLimitIndicators.EASING_BOTH_FUNC : RollLimitIndicators.EASING_OUT_FUNC;
      entry.easingEnd = clampedLimit;

      if (isFinite(entry.limitEased)) {
        entry.easingStart = entry.limitEased;
        entry.easingProgress = 0;
      } else {
        entry.easingStart = clampedLimit;
        entry.easingProgress = 1;
        entry.limitEased = clampedLimit;
      }
    }

    if (entry.easingProgress < 1) {
      entry.easingProgress = Math.min(entry.easingProgress += dt / this.easeDuration, 1);
      entry.limitEased = MathUtils.lerp(entry.easingFunc(entry.easingProgress), 0, 1, entry.easingStart, entry.easingEnd);
    }

    entry.transform.transform.set(0, 0, 1, entry.limitEased * entry.rotateSign, 0.1);
    entry.transform.resolve();
    entry.display.set('');
  }

  /**
   * Hides a roll limit indicator.
   * @param entry The entry for the indicator to hide.
   */
  private hideIndicator(entry: RollLimitIndicatorEntry): void {
    entry.display.set('none');
    entry.easingStart = NaN;
    entry.easingEnd = NaN;
    entry.easingProgress = 1;
    entry.limitEased = NaN;
  }

  /** @inheritDoc */
  public onScaleDetached(): void {
    // noop
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <>
        {this.renderIndicator(this.entries.left)}
        {this.renderIndicator(this.entries.right)}
      </>
    );
  }

  /**
   * Renders a roll limit indicator.
   * @param entry The entry for the indicator to render.
   * @returns A roll limit indicator, as a VNode.
   */
  private renderIndicator(entry: RollLimitIndicatorEntry): VNode {
    return (
      <div
        class={`roll-limit-indicator roll-limit-indicator-${entry.side}`}
        style={{
          'display': entry.display,
          'position': 'absolute',
          'left': '0px',
          'top': `${-this.props.scaleParams.radius}px`,
          'width': '0px',
          'height': '0px',
          'transform': entry.transform,
          'transform-origin': `0px ${this.props.scaleParams.radius}px`
        }}
      >
        <svg viewBox='0 0 10 10' preserveAspectRatio='none' class='roll-limit-indicator-marker'>
          <path d='M 0 0 v 10 M 10 0 v 10' vector-effect='non-scaling-stroke' />
        </svg>
      </div>
    );
  }

  /**
   * Creates an entry for a roll limit indicator.
   * @param side The indicator's side.
   * @param limit The roll angle magnitude at which to position the indicator, in degrees.
   * @returns An entry for the specified roll limit indicator.
   */
  private static createEntry(side: 'left' | 'right', limit: Accessible<number>): RollLimitIndicatorEntry {
    return {
      side,
      limit,
      display: Subject.create(''),
      transform: CssTransformSubject.create(CssTransformBuilder.rotate3d('deg')),
      rotateSign: side === 'left' ? -1 : 1,
      easingStart: NaN,
      easingEnd: NaN,
      easingFunc: RollLimitIndicators.EASING_BOTH_FUNC,
      easingProgress: 1,
      limitEased: NaN
    };
  }
}
