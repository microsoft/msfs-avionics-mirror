import {
  ComponentProps, CssTransformBuilder, CssTransformSubject, DisplayComponent, FSComponent, MappedSubject, MathUtils,
  NavSourceType, ReadonlyFloat64Array, Subject, Subscribable, SubscribableMapFunctions, Subscription, VNode, VorToFrom
} from '@microsoft/msfs-sdk';

import { CDIScaleLabel } from '@microsoft/msfs-garminsdk';

import { HsiDataProvider } from './HsiDataProvider';

import './HsiUpperDeviationIndicator.css';

/**
 * Component props for {@link HsiUpperDeviationIndicator}.
 */
export interface HsiUpperDeviationIndicatorProps extends ComponentProps {
  /** Whether to show the indicator. */
  show: Subscribable<boolean>;

  /** A provider of HSI data. */
  dataProvider: HsiDataProvider;

  /** The size of the indicator, as `[width, height]` in pixels. */
  size: ReadonlyFloat64Array;

  /** The size (diameter) of each scale dot, in pixels. */
  dotSize: number;
}

/**
 * An upper lateral deviation indicator for a G3X Touch HSI. The indicator displays lateral course deviation with a
 * five-dot scale (2.5 dots on each side). The indicator automatically hides itself if there is no deviation data.
 */
export class HsiUpperDeviationIndicator extends DisplayComponent<HsiUpperDeviationIndicatorProps> {

  private readonly twoDotPx = 2 * this.props.size[0] / 5;

  private readonly hidden = Subject.create(false);

  private readonly pointerTransform = CssTransformSubject.create(CssTransformBuilder.translate3d('px', 'px', 'px'));

  private readonly triangleTransform = Subject.create('');

  private readonly isPointerDiamond = MappedSubject.create(
    ([source, isLocalizer, scalingMode]): boolean => {
      if (source === null) {
        return false;
      }

      if (source.getType() === NavSourceType.Gps) {
        switch (scalingMode) {
          case CDIScaleLabel.LNav:
          case CDIScaleLabel.LNavPlusV:
          case CDIScaleLabel.LP:
          case CDIScaleLabel.LPPlusV:
          case CDIScaleLabel.LPV:
          case CDIScaleLabel.Visual:
            return true;
          default:
            return false;
        }
      } else {
        return !!isLocalizer;
      }
    },
    this.props.dataProvider.activeNavIndicator.source,
    this.props.dataProvider.activeNavIndicator.isLocalizer,
    this.props.dataProvider.activeNavIndicator.lateralDeviationScalingMode
  );

  private readonly subscriptions: Subscription[] = [
    this.isPointerDiamond
  ];

  /** @inheritDoc */
  public onAfterRender(): void {
    const toFromSub = this.props.dataProvider.activeNavIndicator.toFrom.sub(toFrom => {
      toFrom === VorToFrom.FROM
        ? this.triangleTransform.set('rotate(180deg)')
        : this.triangleTransform.set('rotate(0deg)');
    }, true);

    const deviationSub = this.props.dataProvider.activeNavIndicator.lateralDeviation.sub(deviation => {
      if (deviation === null) {
        this.hidden.set(true);
      } else {
        this.hidden.set(false);
        this.pointerTransform.transform.set(MathUtils.clamp(deviation, -1.25, 1.25) * this.twoDotPx, 0, 0, 0.1);
        this.pointerTransform.resolve();
      }
    }, true);

    this.subscriptions.push(
      toFromSub,
      deviationSub,

      this.props.show.sub(show => {
        if (show) {
          toFromSub.resume(true);
          deviationSub.resume(true);
        } else {
          toFromSub.pause();
          deviationSub.pause();
          this.hidden.set(true);
        }
      }, true)
    );
  }

  /** @inheritDoc */
  public render(): VNode {
    const [width, height] = this.props.size;

    return (
      <div class={{ 'hsi-upper-cdi': true, 'hidden': this.hidden }} style={`width: ${width}px; height: ${height}px;`}>
        <svg viewBox={`0 0 ${width} ${height}`} class='hsi-upper-cdi-scale' style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;'>
          <circle cx={width / 10} cy={height / 2} r={this.props.dotSize / 2} />
          <circle cx={3 * width / 10} cy={height / 2} r={this.props.dotSize / 2} />
          <line x1={width / 2} y1={0} x2={width / 2} y2={height} />
          <circle cx={7 * width / 10} cy={height / 2} r={this.props.dotSize / 2} />
          <circle cx={9 * width / 10} cy={height / 2} r={this.props.dotSize / 2} />
        </svg>
        <div
          class='hsi-upper-cdi-pointer-container'
          style={{
            'position': 'absolute',
            'left': '50%',
            'top': '50%',
            'width': '0px',
            'height': '0px',
            'transform': this.pointerTransform
          }}
        >
          <svg
            viewBox='0 0 16 16'
            preserveAspectRatio='none'
            class={{ 'hsi-upper-cdi-pointer': true, 'hsi-upper-cdi-pointer-triangle': true, 'hidden': this.isPointerDiamond }}
            style={{ 'transform': this.triangleTransform }}
          >
            <path d='M 0 16 l 8 -16 l 8 16 Z' vector-effect='non-scaling-stroke' />
          </svg>
          <svg
            viewBox='0 0 16 16'
            preserveAspectRatio='none'
            class={{ 'hsi-upper-cdi-pointer': true, 'hsi-upper-cdi-pointer-diamond': true, 'hidden': this.isPointerDiamond.map(SubscribableMapFunctions.not()) }}
          >
            <path d='M 0 8 l 8 -8 l 8 8 l -8 8 Z' vector-effect='non-scaling-stroke' />
          </svg>
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
