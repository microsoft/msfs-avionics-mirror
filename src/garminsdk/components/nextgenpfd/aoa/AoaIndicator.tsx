import {
  ComponentProps, ComputedSubject, CssRotate3dTransform, CssTransformBuilder, CssTransformSubject, DisplayComponent,
  FSComponent, MappedSubject, MathUtils, NumberFormatter, ObjectSubject, SetSubject, Subject, Subscribable,
  SubscribableUtils, Subscription, SvgPathStream, VNode
} from '@microsoft/msfs-sdk';

import { AoaDataProvider } from './AoaDataProvider';

/**
 * Component props for AoaIndicator.
 */
export interface AoAIndicatorProps extends ComponentProps {
  /** Whether to display the advanced version of the indicator. */
  advanced: boolean;

  /** A data provider for the indicator. */
  dataProvider: AoaDataProvider;

  /** Whether to show the digital readout of normalized angle of attack. Defaults to `false`. */
  showDigitalReadout?: boolean;

  /**
   * The normalized angle of attack value at which the donut cue is positioned, or `NaN` if the cue should not be
   * displayed. Defaults to `NaN`.
   */
  donutCueNormAoa?: number | Subscribable<number>;

  /**
   * The normalized angle of attack value at which the reference tick is positioned for the simple version of the
   * indicator. If not defined, then the reference tick will not be displayed. Ignored if `advanced` is `true`.
   */
  referenceTickNormAoa?: number | Subscribable<number>;

  /**
   * Whether to show the minor ticks for the advanced version of the indicator. Ignored if `advanced` is `false`.
   * Defaults to `false`.
   */
  showMinorTicks?: boolean;

  /** The normalized angle of attack threshold for the warning range, or `undefined` if there is no warning range. */
  warningThreshold?: number | Subscribable<number>;

  /** The normalized angle of attack threshold for the caution range, or `undefined` if there is no caution range. */
  cautionThreshold?: number | Subscribable<number>;

  /** Whether to declutter the indicator. */
  declutter: Subscribable<boolean>;
}

/**
 * 
 */
type AoaIndicatorAlertType = 'none' | 'caution' | 'warning';

/**
 * A next-generation (NXi, G3000, etc) Garmin angle of attack indicator.
 */
export class AoaIndicator extends DisplayComponent<AoAIndicatorProps> {
  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly rootCssClass = SetSubject.create(['aoa', this.props.advanced ? 'aoa-advanced' : 'aoa-simple']);

  private readonly minNormAoa = this.props.advanced ? 0.2 : 0;
  private readonly rotationMaxAngle = this.props.advanced ? -180 : 90;

  private readonly donutCueNormAoa = this.props.donutCueNormAoa !== undefined && (typeof this.props.donutCueNormAoa !== 'number' || !isNaN(this.props.donutCueNormAoa))
    ? SubscribableUtils.toSubscribable(this.props.donutCueNormAoa, true)
    : undefined;

  private readonly warningThreshold = SubscribableUtils.toSubscribable(this.props.warningThreshold ?? Infinity, true);
  private readonly cautionThreshold = SubscribableUtils.toSubscribable(this.props.cautionThreshold ?? Infinity, true);

  private readonly alertType = MappedSubject.create(
    ([aoa, warning, caution]) => AoaIndicator.getAlertType(aoa, warning, caution),
    this.props.dataProvider.normAoa,
    this.warningThreshold,
    this.cautionThreshold
  ).pause();

  private readonly readoutText = this.props.showDigitalReadout
    ? ComputedSubject.create(0 as number, NumberFormatter.create({ precision: 0.01, maxDigits: 2, pad: 0, cache: true }))
    : undefined;

  private readonly needleTransform = CssTransformSubject.create(CssTransformBuilder.rotate3d('deg'));

  private readonly donutCueDisplay = this.donutCueNormAoa ? Subject.create('none') : undefined;
  private readonly donutCueTransform = this.donutCueNormAoa ? CssTransformSubject.create(CssTransformBuilder.rotate3d('deg')) : undefined;

  private readonly warningArcTransform = CssTransformSubject.create(CssTransformBuilder.rotate3d('deg'));
  private readonly cautionArcTransform = CssTransformSubject.create(CssTransformBuilder.rotate3d('deg'));

  private readonly hasReferenceTick = !this.props.advanced && this.props.referenceTickNormAoa !== undefined;
  private readonly referenceTickTransform = this.hasReferenceTick
    ? CssTransformSubject.create(CssTransformBuilder.rotate3d('deg'))
    : undefined;
  private readonly referenceTickNormAoa = this.hasReferenceTick
    ? SubscribableUtils.toSubscribable(this.props.referenceTickNormAoa as number | Subscribable<number>, true)
    : undefined;
  private readonly referenceTickCssClass = this.referenceTickNormAoa
    ? MappedSubject.create(
      ([aoa, warning, caution]) => AoaIndicator.getTickCssClass(AoaIndicator.getAlertType(aoa, warning, caution)),
      this.referenceTickNormAoa,
      this.warningThreshold,
      this.cautionThreshold
    ).pause()
    : undefined;

  private readonly advancedTickNormAoaValues = this.props.advanced
    ? this.props.showMinorTicks ? [0.2, 0.4, 0.6, 0.8, 1] : [0.2, 0.6, 1]
    : [];

  private readonly advancedTickCssClasses = this.advancedTickNormAoaValues.map(aoa => {
    return MappedSubject.create(
      ([warning, caution]) => AoaIndicator.getTickCssClass(AoaIndicator.getAlertType(aoa, warning, caution)),
      this.warningThreshold,
      this.cautionThreshold
    ).pause();
  });

  private declutterSub?: Subscription;
  private isDataFailedSub?: Subscription;
  private aoaSub?: Subscription;
  private alertTypeSub?: Subscription;
  private donutCueNormAoaSub?: Subscription;
  private warningThresholdSub?: Subscription;
  private cautionThresholdSub?: Subscription;
  private referenceTickNormAoaSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.aoaSub = this.props.dataProvider.normAoa.sub(this.onNormAoaChanged.bind(this), false, true);
    this.alertTypeSub = this.alertType.sub(this.onAlertTypeChanged.bind(this), false, true);

    this.isDataFailedSub = this.props.dataProvider.isDataFailed.sub(this.onIsDataFailedChanged.bind(this), false, true);

    this.donutCueNormAoaSub = this.donutCueNormAoa?.sub(this.onDonutCueNormAoaChanged.bind(this), false, true);

    this.warningThresholdSub = this.warningThreshold.sub(this.onRotatingElementNormAoaChanged.bind(this, this.warningArcTransform), false, true);
    this.cautionThresholdSub = this.cautionThreshold.sub(this.onRotatingElementNormAoaChanged.bind(this, this.cautionArcTransform), false, true);

    if (this.referenceTickNormAoa) {
      this.referenceTickNormAoaSub = this.referenceTickNormAoa!.sub(this.onRotatingElementNormAoaChanged.bind(this, this.referenceTickTransform!), false, true);
    }

    this.declutterSub = this.props.declutter.sub(this.onDeclutterChanged.bind(this), true);
  }

  /**
   * Responds to when whether to declutter this indicator changes.
   * @param declutter Whether to declutter this indicator.
   */
  private onDeclutterChanged(declutter: boolean): void {
    if (declutter) {
      this.rootStyle.set('display', 'none');

      this.isDataFailedSub!.pause();
      this.aoaSub!.pause();
      this.alertType.pause();
      this.alertTypeSub!.pause();

      this.donutCueNormAoaSub?.pause();

      this.warningThresholdSub!.pause();
      this.cautionThresholdSub!.pause();

      this.referenceTickCssClass?.pause();
      this.referenceTickNormAoaSub?.pause();

      for (const cssClass of this.advancedTickCssClasses) {
        cssClass.pause();
      }
    } else {
      this.rootStyle.set('display', '');

      this.isDataFailedSub!.resume(true);

      this.donutCueNormAoaSub?.resume(true);

      this.warningThresholdSub!.resume(true);
      this.cautionThresholdSub!.resume(true);

      this.referenceTickCssClass?.resume();
      this.referenceTickNormAoaSub?.resume(true);

      for (const cssClass of this.advancedTickCssClasses) {
        cssClass.resume();
      }
    }
  }

  /**
   * Responds to when whether angle of attack data is in a failed state changes.
   * @param isDataFailed Whether angle of attack data is in a failed state.
   */
  private onIsDataFailedChanged(isDataFailed: boolean): void {
    if (isDataFailed) {
      this.rootCssClass.add('aoa-data-failed');

      this.aoaSub!.pause();
      this.alertType.pause();
      this.alertTypeSub!.pause();

      this.rootCssClass.delete('aoa-warning');
      this.rootCssClass.delete('aoa-caution');
    } else {
      this.rootCssClass.delete('aoa-data-failed');

      this.aoaSub!.resume(true);
      this.alertType.resume();
      this.alertTypeSub!.resume(true);
    }
  }

  /**
   * Responds to when the airplane's normalized angle of attack changes.
   * @param normAoa The new normalized angle of attack.
   */
  private onNormAoaChanged(normAoa: number): void {
    this.readoutText?.set(MathUtils.clamp(normAoa, 0, 1));
    this.onRotatingElementNormAoaChanged(this.needleTransform, normAoa);
  }

  /**
   * Responds to when this indicator's alert type changes.
   * @param alertType The new alert type.
   */
  private onAlertTypeChanged(alertType: AoaIndicatorAlertType): void {
    this.rootCssClass.toggle('aoa-warning', alertType === 'warning');
    this.rootCssClass.toggle('aoa-caution', alertType === 'caution');
  }

  /**
   * Responds to when the normalized angle of attack value at which the donut cue is positioned changes.
   * @param normAoa The new normalized angle of attack value at which the donut cue is positioned.
   */
  private onDonutCueNormAoaChanged(normAoa: number): void {
    if (isNaN(normAoa)) {
      this.donutCueDisplay!.set('none');
    } else {
      this.donutCueDisplay!.set('');
      this.onRotatingElementNormAoaChanged(this.donutCueTransform!, normAoa);
    }
  }

  /**
   * Responds to when a normalized angle of attack value that is tracked by one of this indicator's rotating elements
   * changes.
   * @param transform The CSS transform subject controlling the indicator element's rotation.
   * @param normAoa The new normalized angle of attack value tracked by the indicator element.
   */
  private onRotatingElementNormAoaChanged(transform: CssTransformSubject<CssRotate3dTransform>, normAoa: number): void {
    if (isNaN(normAoa)) {
      normAoa = Infinity;
    }

    transform.transform.set(0, 0, 1, MathUtils.lerp(normAoa, this.minNormAoa, 1, 0, this.rotationMaxAngle, true, true), 0.1);
    transform.resolve();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} style={this.rootStyle}>
        <div class='aoa-label'>AOA</div>
        {this.readoutText !== undefined && (
          <div class='aoa-readout'>{this.readoutText}</div>
        )}
        {this.props.advanced ? this.renderAdvancedGauge() : this.renderSimpleGauge()}
        <div class='failed-box' />
      </div>
    );
  }

  /**
   * Renders the advanced gauge version for this indicator.
   * @returns The advanced gauge version for this indicator, as a VNode.
   */
  private renderSimpleGauge(): VNode {
    const svgPathStream = new SvgPathStream(0.01);

    svgPathStream.beginPath();
    svgPathStream.moveTo(-68, 0);
    svgPathStream.arc(0, 0, 68, Math.PI, 3 * Math.PI / 2);
    const arcPath = svgPathStream.getSvgPath();

    const viewBox = '-70 -70 70 70';

    return (
      <div class='aoa-gauge'>
        {this.props.referenceTickNormAoa !== undefined && (
          <svg
            viewBox={viewBox}
            class={this.referenceTickCssClass}
            style={{
              'position': 'absolute',
              'left': '0px',
              'top': '0px',
              'width': '100%',
              'height': '100%',
              'transform': this.referenceTickTransform,
              'transform-origin': '100% 100%',
              'overflow': 'visible'
            }}
          >
            <path d='M -68 0 h -15' stroke-width='1' />
          </svg>
        )}

        <svg viewBox={viewBox} class='aoa-gauge-arc aoa-gauge-arc-white' style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;'>
          <path d={arcPath} stroke-width='3.5' />
        </svg>
        <div style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; overflow: hidden;'>
          <svg
            viewBox={viewBox}
            class='aoa-gauge-arc aoa-gauge-arc-caution'
            style={{
              'position': 'absolute',
              'left': '0px',
              'top': '0px',
              'width': '100%',
              'height': '100%',
              'transform': this.cautionArcTransform,
              'transform-origin': '100% 100%'
            }}
          >
            <path d={arcPath} stroke-width='3.5' />
          </svg>
          <svg
            viewBox={viewBox}
            class='aoa-gauge-arc aoa-gauge-arc-warning'
            style={{
              'position': 'absolute',
              'left': '0px',
              'top': '0px',
              'width': '100%',
              'height': '100%',
              'transform': this.warningArcTransform,
              'transform-origin': '100% 100%'
            }}
          >
            <path d={arcPath} stroke-width='4' />
          </svg>
        </div>

        {this.donutCueNormAoa !== undefined && (
          <svg
            viewBox={viewBox}
            class='aoa-gauge-donut-cue'
            style={{
              'display': this.donutCueDisplay,
              'position': 'absolute',
              'left': '0px',
              'top': '0px',
              'width': '100%',
              'height': '100%',
              'transform': this.donutCueTransform,
              'transform-origin': '100% 100%',
              'overflow': 'visible'
            }}
          >
            <path d='M -70.5 -3.5 a 0.5 0.5 90 0 0 0 7 a 0.5 0.5 90 0 0 0 -7 m 0 2 a 0.5 0.5 90 0 1 0 3 a 0.5 0.5 90 0 1 0 -3' stroke-width='0.5' />
          </svg>
        )}

        <svg
          viewBox={viewBox}
          class='aoa-gauge-needle'
          style={{
            'position': 'absolute',
            'left': '0px',
            'top': '0px',
            'width': '100%',
            'height': '100%',
            'transform': this.needleTransform,
            'transform-origin': '100% 100%',
            'overflow': 'visible'
          }}
        >
          <path d='M -68 0 l 15 -4.5 l 0 9 Z' stroke-width='0.5' />
        </svg>
      </div>
    );
  }

  /**
   * Renders the advanced gauge version for this indicator.
   * @returns The advanced gauge version for this indicator, as a VNode.
   */
  private renderAdvancedGauge(): VNode {
    const svgPathStream = new SvgPathStream(0.01);

    svgPathStream.beginPath();
    svgPathStream.moveTo(0, 35);
    svgPathStream.arc(0, 0, 35, MathUtils.HALF_PI, -MathUtils.HALF_PI, true);
    const arcPath = svgPathStream.getSvgPath();

    const viewBox = '-37 -37 74 74';

    return (
      <div class='aoa-gauge'>
        {this.advancedTickNormAoaValues.map((aoa, index) => {
          return (
            <svg viewBox={viewBox} class={this.advancedTickCssClasses[index]} style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;'>
              <path d='M 0 36 v -7' transform={`rotate(${MathUtils.lerp(aoa, this.minNormAoa, 1, 0, this.rotationMaxAngle)})`} stroke-width='1' />
            </svg>
          );
        })}

        <svg viewBox={viewBox} class='aoa-gauge-labels' style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%'>
          <text x='0' y='20' class='aoa-gauge-label' text-anchor='middle' dominant-baseline='central'>.2</text>
          <text x='20' y='0' class='aoa-gauge-label' text-anchor='middle' dominant-baseline='central'>.6</text>
          <text x='0' y='-20' class='aoa-gauge-label' text-anchor='middle' dominant-baseline='central'>1.0</text>
        </svg>

        <svg viewBox={viewBox} class='aoa-gauge-arc aoa-gauge-arc-white' style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;'>
          <path d={arcPath} stroke-width='3.5' />
        </svg>
        <div style='position: absolute; left: 50%; top: 0%; width: 50%; height: 100%; overflow: hidden;'>
          <svg
            viewBox={viewBox}
            class='aoa-gauge-arc aoa-gauge-arc-caution'
            style={{
              'position': 'absolute',
              'left': '-100%',
              'top': '0px',
              'width': '200%',
              'height': '100%',
              'transform': this.cautionArcTransform
            }}
          >
            <path d={arcPath} stroke-width='3.5' />
          </svg>
          <svg
            viewBox={viewBox}
            class='aoa-gauge-arc aoa-gauge-arc-warning'
            style={{
              'position': 'absolute',
              'left': '-100%',
              'top': '0px',
              'width': '200%',
              'height': '100%',
              'transform': this.warningArcTransform
            }}
          >
            <path d={arcPath} stroke-width='4' />
          </svg>
        </div>

        {this.donutCueNormAoa !== undefined && (
          <svg
            viewBox={viewBox}
            class='aoa-gauge-donut-cue'
            style={{
              'display': this.donutCueDisplay,
              'position': 'absolute',
              'left': '0px',
              'top': '0px',
              'width': '100%',
              'height': '100%',
              'transform': this.donutCueTransform,
              'overflow': 'visible'
            }}
          >
            <path d='M 0 34 a 0.5 0.5 90 0 0 0 7 a 0.5 0.5 90 0 0 0 -7 m 0 2 a 0.5 0.5 90 0 1 0 3 a 0.5 0.5 90 0 1 0 -3' stroke-width='0.5' />
          </svg>
        )}

        <svg
          viewBox={viewBox}
          class='aoa-gauge-needle'
          style={{
            'position': 'absolute',
            'left': '0px',
            'top': '0px',
            'width': '100%',
            'height': '100%',
            'transform': this.needleTransform,
            'overflow': 'visible'
          }}
        >
          <path d='M 0 0 c 2 0 3 2 3 4 c 0 3 -1 10 -3 28 c -2 -18 -3 -25 -3 -28 c 0 -2 1 -4 3 -4' stroke-width='0.5' />
        </svg>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.alertType.destroy();
    this.referenceTickCssClass?.destroy();

    for (const cssClass of this.advancedTickCssClasses) {
      cssClass.destroy();
    }

    this.declutterSub?.destroy();
    this.isDataFailedSub?.destroy();
    this.aoaSub?.destroy();
    this.donutCueNormAoaSub?.destroy();
    this.warningThresholdSub?.destroy();
    this.cautionThresholdSub?.destroy();
    this.referenceTickNormAoaSub?.destroy();

    super.destroy();
  }

  /**
   * Gets the alert type associated with an angle of attack value given warning and caution thresholds.
   * @param aoa The angle of attack value for which to get the alert type.
   * @param warning The warning threshold.
   * @param caution The caution threshold.
   * @returns The alert type associated with the specified angle of attack value.
   */
  private static getAlertType(aoa: number, warning: number, caution: number): AoaIndicatorAlertType {
    return aoa >= warning ? 'warning' : aoa >= caution ? 'caution' : 'none';
  }

  /**
   * Gets a CSS class string to apply to a gauge tick for a given alert type.
   * @param alertType The alert type for which to get the CSS class string.
   * @returns The CSS class string to apply to a gauge tick for the specified alert type.
   */
  private static getTickCssClass(alertType: AoaIndicatorAlertType): string {
    switch (alertType) {
      case 'warning':
        return 'aoa-gauge-tick aoa-gauge-tick-warning';
      case 'caution':
        return 'aoa-gauge-tick aoa-gauge-tick-caution';
      default:
        return 'aoa-gauge-tick';
    }
  }
}
