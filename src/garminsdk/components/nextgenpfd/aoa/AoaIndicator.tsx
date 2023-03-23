import { ComponentProps, DisplayComponent, FSComponent, MathUtils, ObjectSubject, SetSubject, Subject, Subscribable, Subscription, VNode } from '@microsoft/msfs-sdk';
import { AoaDataProvider } from './AoaDataProvider';

/**
 * Component props for AoaIndicator.
 */
export interface AoAIndicatorProps extends ComponentProps {
  /** Whether to display the advanced version of the indicator. */
  advanced: boolean;

  /** A data provider for the indicator. */
  dataProvider: AoaDataProvider;

  /** Whether to declutter the indicator. */
  declutter: Subscribable<boolean>;
}

/**
 * A next-generation (NXi, G3000, etc) Garmin angle of attack indicator.
 */
export class AoaIndicator extends DisplayComponent<AoAIndicatorProps> {
  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly needleStyle = ObjectSubject.create({
    transform: 'rotate3d(0, 0, 1, 0deg)'
  });

  private readonly rootCssClass = SetSubject.create(['aoa', this.props.advanced ? 'aoa-advanced' : 'aoa-simple']);

  private readonly rotationSign = this.props.advanced ? -1 : 1;
  private readonly minAoa = this.props.advanced ? 0.2 : 0;
  private readonly aoaRange = 1 - this.minAoa;
  private readonly angleRange = this.props.advanced ? 180 : 90;

  private readonly redMin = 0.9;
  private readonly yellowMin = this.props.advanced ? 0.7 : 0.9;

  private readonly needleRotation = Subject.create(0);

  private aoaSub?: Subscription;
  private isDataFailedSub?: Subscription;
  private declutterSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.needleRotation.sub(rotation => {
      this.needleStyle.set('transform', `rotate3d(0, 0, 1, ${rotation}deg)`);
    }, true);

    const aoaSub = this.aoaSub = this.props.dataProvider.normAoa.sub(aoa => {
      const angle = MathUtils.clamp((aoa - this.minAoa) / this.aoaRange, 0, 1) * this.angleRange * this.rotationSign;
      this.needleRotation.set(MathUtils.round(angle, 0.1));

      if (aoa >= this.redMin) {
        this.rootCssClass.delete('aoa-yellow');
        this.rootCssClass.add('aoa-red');
      } else if (aoa >= this.yellowMin) {
        this.rootCssClass.delete('aoa-red');
        this.rootCssClass.add('aoa-yellow');
      } else {
        this.rootCssClass.delete('aoa-red');
        this.rootCssClass.delete('aoa-yellow');
      }
    }, false, true);

    const isDataFailedSub = this.isDataFailedSub = this.props.dataProvider.isDataFailed.sub(isFailed => {
      if (isFailed) {
        this.rootCssClass.add('aoa-data-failed');
        aoaSub.pause();
      } else {
        this.rootCssClass.delete('aoa-data-failed');
        aoaSub.resume(true);
      }
    }, false, true);

    this.declutterSub = this.props.declutter.sub(declutter => {
      if (declutter) {
        this.rootStyle.set('display', 'none');

        isDataFailedSub.pause();
        aoaSub.pause();
      } else {
        this.rootStyle.set('display', '');

        isDataFailedSub.resume(true);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} style={this.rootStyle}>
        <div class='aoa-label'>AOA</div>
        {this.props.advanced ? this.renderAdvancedGauge() : this.renderSimpleGauge()}
        <div class='failed-box' />
      </div>
    );
  }

  /**
   * Renders the simple gauge version for this indicator.
   * @returns The simple gauge version for this indicator, as a VNode.
   */
  private renderSimpleGauge(): VNode {
    return (
      <div class='aoa-gauge'>
        <svg viewBox='-70 -70 140 140' class='aoa-gauge-scale'>
          <path class='aoa-gauge-tick aoa-gauge-tick-white' d='M -39.67 -54.61 L -48.03 -66.1' stroke-width='2' />

          <path class='aoa-gauge-arc aoa-gauge-arc-white' d='M -67.5 0 A 67.5 67.5 90 0 1 -10.56 -66.67' stroke-width='5' />
          <path class='aoa-gauge-arc aoa-gauge-arc-red' d='M -10.56 -66.67 A 67.5 67.5 90 0 1 0 -67.5' stroke-width='5' />
        </svg>
        <svg viewBox='-70 -70 140 140' class='aoa-gauge-needle' style={this.needleStyle}>
          <path d='M -67.5 0 l 12 -6 l 0 12 z' stroke-width='0.5' />
        </svg>
      </div>
    );
  }

  /**
   * Renders the advanced gauge version for this indicator.
   * @returns The advanced gauge version for this indicator, as a VNode.
   */
  private renderAdvancedGauge(): VNode {
    return (
      <div class='aoa-gauge'>
        <svg viewBox='-40 -40 80 80' class='aoa-gauge-scale'>
          <path class='aoa-gauge-tick aoa-gauge-tick-white' d='M 0 37 l 0 -10 M 26.16 26.16 l -7.07 -7.07 M 37 0 l -10 0' stroke-width='2' />
          <path class='aoa-gauge-tick aoa-gauge-tick-yellow' d='M 26.16 -26.16 l -7.07 7.07' stroke-width='2' />
          <path class='aoa-gauge-tick aoa-gauge-tick-red' d='M 0 -37 l 0 10' stroke-width='2' />

          <path class='aoa-gauge-arc aoa-gauge-arc-white' d='M 0 35 A 35 35 0 0 0 32.34 -13.39' stroke-width='4' />
          <path class='aoa-gauge-arc aoa-gauge-arc-yellow' d='M 32.34 -13.39 A 35 35 0 0 0 13.39 -32.34' stroke-width='4' />
          <path class='aoa-gauge-arc aoa-gauge-arc-red' d='M 13.39 -32.34 A 35 35 0 0 0 0 -35' stroke-width='4' />

          <text x='0' y='23' class='aoa-gauge-label' text-anchor='middle' dominant-baseline='auto'>.2</text>
          <text x='23' y='0' class='aoa-gauge-label' text-anchor='end' dominant-baseline='central'>.6</text>
          <text x='0' y='-23' class='aoa-gauge-label' text-anchor='middle' dominant-baseline='hanging'>1.0</text>
        </svg>
        <svg viewBox='-40 -40 80 80' class='aoa-gauge-needle' style={this.needleStyle}>
          <path d='M 0.5 2 l 2.5 5 q 0.5 1 0 4 l -3 22 l -3 -22 q -0.5 -3 0 -4 l 2.5 -5 q 0.5 -1 1 0' />
        </svg>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.aoaSub?.destroy();
    this.isDataFailedSub?.destroy();
    this.declutterSub?.destroy();

    super.destroy();
  }
}