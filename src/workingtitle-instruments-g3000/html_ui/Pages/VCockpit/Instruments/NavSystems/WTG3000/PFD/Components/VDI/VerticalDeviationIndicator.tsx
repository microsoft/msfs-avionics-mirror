import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, MappedSubject, MathUtils, ObjectSubject, SetSubject,
  Subject, Subscribable, SubscribableMapFunctions, SubscribableSet, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { GlidepathServiceLevel, VdiDataProvider } from '@microsoft/msfs-garminsdk';

import './VerticalDeviationIndicator.css';

/**
 * Component props for VerticalDeviationIndicator.
 */
export interface VerticalDeviationIndicatorProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** A data provider for the indicator. */
  dataProvider: VdiDataProvider;

  /** Whether the indicator should be decluttered. */
  declutter: Subscribable<boolean>;

  /**
   * Whether the indicator should support vertical deviation limit indicators for LNAV/VNAV glidepaths. Defaults to
   * `false`.
   */
  supportLimitIndicators?: boolean;
}

/** A type of vertical deviation indicator. */
type IndicatorType = 'vnav' | 'glidepath' | 'glideslope' | 'none';

/**
 * A G3000 vertical deviation indicator.
 */
export class VerticalDeviationIndicator extends DisplayComponent<VerticalDeviationIndicatorProps> {
  /** The scale's maximum absolute deviation, as a factor of full-scale deflection. */
  private static readonly SCALE_MAX = 1.25;

  /** The scale denoted by the vertical deviation limit indicators, in feet. */
  private static readonly LIMIT_INDICATOR_SCALE = 75;

  private readonly vnavBugRef = FSComponent.createRef<VerticalDeviationBug>();
  private readonly gpBugRef = FSComponent.createRef<VerticalDeviationBug>();
  private readonly gsBugRef = FSComponent.createRef<VerticalDeviationBug>();

  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly upperDot1Style = ObjectSubject.create({
    display: '',
    position: 'absolute',
    left: '50%',
    top: `${this.calculateScalePosition(0.5) * 100}%`,
    transform: 'translate(-50%, -50%)'
  });
  private readonly lowerDot1Style = ObjectSubject.create({
    display: '',
    position: 'absolute',
    left: '50%',
    top: `${this.calculateScalePosition(-0.5) * 100}%`,
    transform: 'translate(-50%, -50%)'
  });

  private readonly centerLineStyle = ObjectSubject.create({
    display: '',
    position: 'absolute',
    left: '0%',
    top: `${this.calculateScalePosition(0) * 100}%`,
    width: '100%',
    transform: 'translateY(-50%)'
  });

  private readonly noSignalStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly limitIndicatorContainerStyle = ObjectSubject.create({
    display: 'none',
    position: 'absolute',
    left: '0px',
    top: '0px',
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  });

  private readonly limitIndicatorTopStyle = ObjectSubject.create({
    position: 'absolute',
    top: '0px',
    height: '50%',
    transform: 'translate3d(0px, 0px, 0px)'
  });
  private readonly limitIndicatorBottomStyle = ObjectSubject.create({
    position: 'absolute',
    bottom: '0px',
    height: '50%',
    transform: 'translate3d(0px, 0px, 0px)'
  });

  private readonly rootCssClass = SetSubject.create(['vdi']);

  private readonly supportLimitIndicators = this.props.supportLimitIndicators ?? false;

  private readonly labelText = Subject.create('');
  private readonly noSignalText = Subject.create('');

  private readonly primaryType = MappedSubject.create(
    ([hasVNav, hasGp, hasGs]): IndicatorType => {
      if (hasVNav) {
        return 'vnav';
      } else if (hasGp) {
        return 'glidepath';
      } else if (hasGs) {
        return 'glideslope';
      } else {
        return 'none';
      }
    },
    this.props.dataProvider.hasVNav,
    this.props.dataProvider.hasGp,
    this.props.dataProvider.hasGs,
  ).pause();

  private readonly showVNavBug = Subject.create(false);
  private readonly showGpBug = Subject.create(false);
  private readonly showGsBug = Subject.create(false);

  private readonly vnavBugDeviation = Subject.create(0);
  private readonly gpBugDeviation = Subject.create(0);
  private readonly gsBugDeviation = Subject.create(0);

  private readonly showNoSignal = Subject.create(false);

  private readonly showLimitIndicator = this.supportLimitIndicators
    ? MappedSubject.create(
      ([primaryType, gpIsPreview, gpServiceLevel, isPastFaf]): boolean => {
        return primaryType === 'glidepath'
          && !gpIsPreview
          && (gpServiceLevel === GlidepathServiceLevel.LNavVNav || gpServiceLevel === GlidepathServiceLevel.LNavVNavBaro)
          && isPastFaf;
      },
      this.primaryType,
      this.props.dataProvider.gpDeviationIsPreview,
      this.props.dataProvider.gpServiceLevel,
      this.props.dataProvider.isPastFaf
    ).pause()
    : undefined;

  private readonly limitIndicatorOffset = this.supportLimitIndicators
    ? this.props.dataProvider.gpDeviationScale.map(scale => {
      return scale === null ? 0.5 : MathUtils.clamp(MathUtils.round(VerticalDeviationIndicator.LIMIT_INDICATOR_SCALE / scale, 0.001), 0, 1);
    }).pause()
    : undefined;

  private readonly isGpOutsideLimits = this.supportLimitIndicators
    ? MappedSubject.create(
      ([showLimitIndicator, gpBugDeviation, gpScale]): boolean => {
        return showLimitIndicator && gpScale !== null && Math.abs(gpBugDeviation) * gpScale > VerticalDeviationIndicator.LIMIT_INDICATOR_SCALE;
      },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.showLimitIndicator!,
      this.gpBugDeviation,
      this.props.dataProvider.gpDeviationScale
    ).pause()
    : undefined;

  private readonly isVisible = Subject.create(false);

  private declutterSub?: Subscription;
  private vnavSub?: Subscription;
  private gpSub?: Subscription;
  private gsSub?: Subscription;
  private gpNoSignalSub?: Subscription;
  private gpPreviewSub?: Subscription;
  private gsPreviewSub?: Subscription;
  private gsNoSignalSub?: Subscription;
  private gsPreviewNoSignalSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.isVisible.sub(isVisible => {
      this.rootStyle.set('display', isVisible ? '' : 'none');
    });

    this.showNoSignal.sub(show => {
      this.noSignalStyle.set('display', show ? '' : 'none');
      this.upperDot1Style.set('display', show ? 'none' : '');
      this.lowerDot1Style.set('display', show ? 'none' : '');
      this.centerLineStyle.set('display', show ? 'none' : '');
    }, true);

    this.limitIndicatorOffset?.sub(offset => {
      this.limitIndicatorTopStyle.set('transform', `translate3d(0px, ${-offset * 100}%, 0px)`);
      this.limitIndicatorBottomStyle.set('transform', `translate3d(0px, ${offset * 100}%, 0px)`);
    }, true);

    const isGpOutsideLimitsSub = this.isGpOutsideLimits?.sub(isOutsideLimits => {
      if (isOutsideLimits) {
        this.rootCssClass.add('vdi-gp-outside-limits');
      } else {
        this.rootCssClass.delete('vdi-gp-outside-limits');
      }
    }, false, true);

    this.showLimitIndicator?.sub(show => {
      if (show) {
        this.limitIndicatorContainerStyle.set('display', '');
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.limitIndicatorOffset!.resume();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.isGpOutsideLimits!.resume();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        isGpOutsideLimitsSub!.resume(true);
      } else {
        this.limitIndicatorContainerStyle.set('display', 'none');
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.limitIndicatorOffset!.pause();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.isGpOutsideLimits!.pause();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        isGpOutsideLimitsSub!.pause();

        this.rootCssClass.delete('vdi-gp-outside-limits');
      }
    }, true);

    const vnavSub = this.vnavSub = this.props.dataProvider.vnavDeviation.sub(deviation => {
      if (deviation === null) {
        this.showVNavBug.set(false);
      } else {
        this.showVNavBug.set(true);
        this.vnavBugDeviation.set(deviation);
      }
    }, false, true);

    const gpSub = this.gpSub = this.props.dataProvider.gpDeviation.sub(deviation => {
      if (deviation === null) {
        this.showGpBug.set(false);
      } else {
        this.showGpBug.set(true);
        this.gpBugDeviation.set(deviation);
      }
    }, false, true);

    const gsSub = this.gsSub = this.props.dataProvider.gsDeviation.sub(deviation => {
      if (deviation === null) {
        this.showGsBug.set(false);
      } else {
        this.showGsBug.set(true);
        this.gsBugDeviation.set(deviation);
      }
    }, false, true);

    const gpNoSignalSub = this.gpNoSignalSub = this.props.dataProvider.gpDeviation.sub(deviation => {
      this.showNoSignal.set(deviation === null);
    }, false, true);

    const gpPreviewSub = this.gpPreviewSub = this.props.dataProvider.gpDeviationIsPreview.sub(isPreview => {
      if (isPreview) {
        gpNoSignalSub.pause();
        this.showNoSignal.set(false);
        this.rootCssClass.add('vdi-gp-preview');
      } else {
        this.rootCssClass.delete('vdi-gp-preview');
        gpNoSignalSub.resume(true);
      }
    }, false, true);

    const gsNoSignalSub = this.gsNoSignalSub = this.props.dataProvider.gsDeviation.sub(deviation => {
      this.showNoSignal.set(deviation === null);
    }, false, true);

    const gsPreviewNoSignalSub = this.gsPreviewNoSignalSub = this.props.dataProvider.gsDeviation.sub(deviation => {
      this.isVisible.set(deviation !== null);
    }, false, true);

    const gsPreviewSub = this.gsPreviewSub = this.props.dataProvider.gsDeviationIsPreview.sub(isPreview => {
      if (isPreview) {
        gsNoSignalSub.pause();
        this.showNoSignal.set(false);

        gsPreviewNoSignalSub.resume(true);
        this.rootCssClass.add('vdi-gs-preview');
      } else {
        gsPreviewNoSignalSub.pause();
        this.rootCssClass.delete('vdi-gs-preview');

        gsNoSignalSub.resume(true);
      }
    }, false, true);

    const primaryTypeSub = this.primaryType.sub(type => {
      if (type === 'none') {
        this.isVisible.set(false);

        vnavSub.pause();
        gpSub.pause();
        gsSub.pause();
        gpPreviewSub.pause();
        gsPreviewSub.pause();
        gpNoSignalSub.pause();
        gsNoSignalSub.pause();
      } else {
        this.isVisible.set(true);

        switch (type) {
          case 'vnav':
            this.rootCssClass.delete('vdi-gp');
            this.rootCssClass.delete('vdi-gs');
            this.rootCssClass.add('vdi-vnav');
            this.rootCssClass.add('vdi-gp-preview');
            this.rootCssClass.add('vdi-gs-preview');

            this.labelText.set('V');

            gsSub.resume(true);
            gpSub.resume(true);
            vnavSub.resume(true);

            gpPreviewSub.pause();
            gpNoSignalSub.pause();
            gsPreviewSub.pause();
            gsNoSignalSub.pause();
            gsPreviewNoSignalSub.pause();
            this.showNoSignal.set(false);
            break;
          case 'glidepath':
            this.rootCssClass.delete('vdi-vnav');
            this.rootCssClass.delete('vdi-gs');
            this.rootCssClass.delete('vdi-gs-preview');
            this.rootCssClass.add('vdi-gp');

            this.labelText.set('G');
            this.noSignalText.set('N\nO\n\nG\nP');

            this.showVNavBug.set(false);
            this.showGsBug.set(false);

            vnavSub.pause();
            gsSub.pause();
            gpSub.resume(true);

            gsPreviewSub.pause();
            gsNoSignalSub.pause();
            gsPreviewNoSignalSub.pause();
            gpPreviewSub.resume(true);
            break;
          case 'glideslope':
            this.rootCssClass.delete('vdi-vnav');
            this.rootCssClass.delete('vdi-gp');
            this.rootCssClass.delete('vdi-gp-preview');
            this.rootCssClass.add('vdi-gs');

            this.labelText.set('G');
            this.noSignalText.set('N\nO\n\nG\nS');

            this.showVNavBug.set(false);
            this.showGpBug.set(false);

            vnavSub.pause();
            gpSub.pause();
            gsSub.resume(true);

            gpPreviewSub.pause();
            gpNoSignalSub.pause();
            gsPreviewSub.resume(true);
            break;
        }
      }
    }, false, true);

    this.declutterSub = this.props.declutter.sub(declutter => {
      if (declutter) {
        this.primaryType.pause();
        primaryTypeSub.pause();

        vnavSub.pause();
        gpSub.pause();
        gsSub.pause();

        gpPreviewSub.pause();
        gpNoSignalSub.pause();
        gsNoSignalSub.pause();
        gsPreviewNoSignalSub.pause();

        this.showLimitIndicator?.pause();

        this.isVisible.set(false);
      } else {
        this.primaryType.resume();
        primaryTypeSub.resume(true);

        this.showLimitIndicator?.resume();
      }
    }, true);
  }

  /**
   * Calculates the vertical position on this indicator's scale at which a particular vertical speed is located, with
   * `0` at the top of the scale and `1` at the bottom.
   * @param deviation A vertical speed, in feet per minute.
   * @returns The vertical position on this indicator's scale at which the specified vertical speed is located, with
   * `0` at the top of the scale and `1` at the bottom.
   */
  private calculateScalePosition(deviation: number): number {
    return 1 - (deviation + VerticalDeviationIndicator.SCALE_MAX) / (2 * VerticalDeviationIndicator.SCALE_MAX);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} style={this.rootStyle}>
        <div class='vdi-label-container'>
          <div class='vdi-label'>{this.labelText}</div>
        </div>
        <div class='vdi-scale'>
          <svg
            viewBox='0 0 100 100'
            class='vdi-scale-dot'
            style={`position: absolute; left: 50%; top: ${this.calculateScalePosition(1) * 100}%; transform: translate(-50%, -50%);`}
          >
            <circle cx={50} cy={50} r={25} vector-effect='non-scaling-stroke' />
          </svg>
          <svg
            viewBox='0 0 100 100'
            class='vdi-scale-dot'
            style={this.upperDot1Style}
          >
            <circle cx={50} cy={50} r={25} vector-effect='non-scaling-stroke' />
          </svg>
          <div class='vdi-scale-center' style={this.centerLineStyle} />
          <svg
            viewBox='0 0 100 100'
            class='vdi-scale-dot'
            style={this.lowerDot1Style}
          >
            <circle cx={50} cy={50} r={25} vector-effect='non-scaling-stroke' />
          </svg>
          <svg
            viewBox='0 0 100 100'
            class='vdi-scale-dot'
            style={`position: absolute; left: 50%; top: ${this.calculateScalePosition(-1) * 100}%; transform: translate(-50%, -50%);`}
          >
            <circle cx={50} cy={50} r={25} vector-effect='non-scaling-stroke' />
          </svg>

          {this.props.supportLimitIndicators === true && (
            <div class='vdi-limit-indicator-container' style={this.limitIndicatorContainerStyle}>
              <div class='vdi-limit-indicator' style={this.limitIndicatorTopStyle} />
              <div class='vdi-limit-indicator' style={this.limitIndicatorBottomStyle} />
            </div>
          )}

          <div class='vdi-bug-container' style='position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: hidden;'>
            <VerticalDeviationBug
              ref={this.gsBugRef}
              show={this.showGsBug}
              deviation={this.gsBugDeviation}
              getPosition={this.calculateScalePosition.bind(this)}
              class='vdi-gs-bug'
            >
              <svg viewBox='0 0 18 22' class='vdi-gs-bug-icon'>
                <path d='M 9 1 L 17 11 L 9 21 L 1 11 Z' vector-effect='non-scaling-stroke' />
              </svg>
            </VerticalDeviationBug>

            <VerticalDeviationBug
              ref={this.gpBugRef}
              show={this.showGpBug}
              deviation={this.gpBugDeviation}
              getPosition={this.calculateScalePosition.bind(this)}
              class='vdi-gp-bug'
            >
              <svg viewBox='0 0 18 22' class='vdi-gp-bug-icon'>
                <path d='M 9 1 L 17 11 L 9 21 L 1 11 Z' vector-effect='non-scaling-stroke' />
              </svg>
            </VerticalDeviationBug>

            <VerticalDeviationBug
              ref={this.vnavBugRef}
              show={this.showVNavBug}
              deviation={this.vnavBugDeviation}
              getPosition={this.calculateScalePosition.bind(this)}
              class='vdi-vnav-bug'
            >
              <svg viewBox='0 0 18 28' class='vdi-vnav-bug-icon'>
                <path d='M -3.5 14 l 19.5 -12 l 0 4 l -13 8 l 13 8 l 0 4 z' vector-effect='non-scaling-stroke' />
              </svg>
            </VerticalDeviationBug>
          </div>

          <div class='vdi-no-signal' style={this.noSignalStyle}>{this.noSignalText}</div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.vnavBugRef.getOrDefault()?.destroy();
    this.gpBugRef.getOrDefault()?.destroy();
    this.gsBugRef.getOrDefault()?.destroy();

    this.primaryType.destroy();

    this.showLimitIndicator?.destroy();
    this.limitIndicatorOffset?.destroy();
    this.isGpOutsideLimits?.destroy();

    this.declutterSub?.destroy();
    this.vnavSub?.destroy();
    this.gpSub?.destroy();
    this.gsSub?.destroy();
    this.gpNoSignalSub?.destroy();
    this.gpPreviewSub?.destroy();
    this.gsPreviewSub?.destroy();
    this.gsNoSignalSub?.destroy();
    this.gsPreviewNoSignalSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for VerticalDeviationBug.
 */
interface VerticalDeviationBugProps extends ComponentProps {
  /** Whether the bug should be visible. */
  show: Subscribable<boolean>;

  /** The reference vertical deviation of the bug, scaled such that +/-1 is equal to full-scale (2 dots) deflection. */
  deviation: Subscribable<number>;

  /** A function which gets the position on the bug's parent scale at which a particular deviation is located. */
  getPosition: (deviation: number) => number;

  /** CSS class(es) to apply to the bug's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A vertical deviation bug for a next-generation (NXi, G3000, etc) Garmin vertical deviation indicator.
 */
class VerticalDeviationBug extends DisplayComponent<VerticalDeviationBugProps> {
  private readonly style = ObjectSubject.create({
    display: '',
    position: 'absolute',
    top: '50%',
    transform: 'translate3d(0, -50%, 0)'
  });

  private readonly position = Subject.create(0);

  private readonly deviationRounded = this.props.deviation.map(SubscribableMapFunctions.withPrecision(0.001)).pause();

  private cssClassSub?: Subscription;
  private showSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.deviationRounded.sub(deviation => {
      const pos = MathUtils.clamp(this.props.getPosition(deviation), 0, 1);
      this.position.set(MathUtils.round(pos * 100, 0.1));
    }, true);

    this.position.sub(translate => {
      this.style.set('top', `${translate}%`);
    }, true);

    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.deviationRounded.resume();
        this.style.set('display', '');
      } else {
        this.deviationRounded.pause();
        this.style.set('display', 'none');
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      const baseClass = ['vdi-bug'];
      cssClass = SetSubject.create(baseClass);
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, baseClass);
    } else {
      const classesToAdd = this.props.class === undefined
        ? ''
        : FSComponent.parseCssClassesFromString(this.props.class, classToAdd => classToAdd !== 'vdi-bug').join(' ');

      cssClass = `vdi-bug ${classesToAdd}`;
    }

    return (
      <div class={cssClass} style={this.style}>
        {this.props.children}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.deviationRounded.destroy();

    this.cssClassSub?.destroy();
    this.showSub?.destroy();
  }
}