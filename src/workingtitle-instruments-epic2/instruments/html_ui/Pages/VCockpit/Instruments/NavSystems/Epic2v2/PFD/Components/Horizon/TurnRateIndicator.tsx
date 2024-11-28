import { DisplayComponent, FSComponent, MappedSubject, MathUtils, Subscribable, SubscribableMapFunctions, VNode } from '@microsoft/msfs-sdk';

import { HeadingDataProvider, NavigationSourceDataProvider } from '@microsoft/msfs-epic2-shared';

import './TurnRateIndicator.css';

/** The properties for the turn rate indicator component. */
interface TurnRateIndicatorProps {
  /** The heading data provider to use. */
  headingDataProvider: HeadingDataProvider;
  /** The navigation source data provider to use. */
  navigationSourceDataProvider: NavigationSourceDataProvider;
  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/** The horizon turn rate indicator. */
export class TurnRateIndicator extends DisplayComponent<TurnRateIndicatorProps> {
  private static PX_PER_DEGREE = 35 / 3;
  private static MAX_RATE = 4.5;

  // The turn rate indicator is replaced by the expanded localiser scale.
  private isHidden = MappedSubject.create(
    SubscribableMapFunctions.or(),
    this.props.navigationSourceDataProvider.courseNeedle.get().hasLocalizer.map(v => v === true),
    this.props.declutter
  );

  private translateTurnRatePx = this.props.headingDataProvider.deltaHeadingRate.map(
    v => v !== null ? MathUtils.round(MathUtils.clamp(v, -TurnRateIndicator.MAX_RATE, TurnRateIndicator.MAX_RATE) * TurnRateIndicator.PX_PER_DEGREE, .1) : 0
  ).pause();

  /** @inheritdoc */
  public onAfterRender(): void {
    this.isHidden.sub(isHidden => {
      if (isHidden) {
        this.translateTurnRatePx.pause();
      } else {
        this.translateTurnRatePx.resume();
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={{
        'turn-rate-container': true,
        'hidden': this.isHidden
      }}
      >
        <div
          class="turn-rate-pip-container">
          <div class="turn-rate-pip"></div>
          <div class="turn-rate-pip"></div>
          <div class="turn-rate-pip"></div>
        </div>
        <svg
          class="turn-rate-failed-overlay"
          viewBox="12 4 110 26"
          style={{
            width: '110px',
            height: '26px',
            display: this.props.headingDataProvider.deltaHeadingRate.map((v) => v === null ? 'block' : 'none'),
          }}
        >
          <path d="M 23 6 l 84 18 m -84 0 l 84 -18" />
        </svg>
        <div
          class={{
            'turn-rate-t': true,
            'hidden': this.props.headingDataProvider.deltaHeadingRate.map(v => v === null)
          }}
        >
          <svg
            viewBox="-8 0 16 12"
            style={{
              'width': '16px',
              'height': '12px',
              'transform': this.translateTurnRatePx.map(v => `translateX(${v}px)`)
            }}
          >
            <path
              d="M -4.8 2 c -0.5 1 -0.5 2.5 0 3.5 l 3 0 l 0 4 c 0.5 0.5 3 0.5 3.5 0 l 0 -4 l 3 0 c 0.5 -1 0.5 -2.5 0 -3.5 z"
            />
          </svg>
        </div>
      </div>
    );
  }
}
