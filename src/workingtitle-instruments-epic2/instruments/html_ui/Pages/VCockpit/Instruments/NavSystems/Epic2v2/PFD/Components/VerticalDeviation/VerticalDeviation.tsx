import { ComponentProps, DisplayComponent, FSComponent, MappedSubject, MathUtils, Subscribable, SubscribableMapFunctions, VNode } from '@microsoft/msfs-sdk';

import { DefaultVerticalDeviationDataProvider, Epic2VerticalDeviationMode } from '@microsoft/msfs-epic2-shared';

import './VerticalDeviation.css';

/** The vertical deviation props. */
export interface VerticalDeviationProps extends ComponentProps {
  /** A provider of vertical deviation data. */
  verticalDeviationDataProvider: DefaultVerticalDeviationDataProvider;
  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/** The vertical deviation component. */
export class VerticalDeviation extends DisplayComponent<VerticalDeviationProps> {

  private readonly translatePreApproachPx = MappedSubject.create(([verticalDeviation]) => {
    return verticalDeviation !== null ? MathUtils.clamp(verticalDeviation, -1, 1) * 102 : 0;
  },
    this.props.verticalDeviationDataProvider.preApproachPointerDeviation
  );

  private readonly translateGpPx = MappedSubject.create(([verticalDeviation]) => {
    return verticalDeviation !== null ? MathUtils.clamp(verticalDeviation, -1, 1) * 102 : 0;
  },
    this.props.verticalDeviationDataProvider.gpApproachPointerDeviation
  );

  private readonly translateGsPx = MappedSubject.create(([verticalDeviation]) => {
    return verticalDeviation !== null ? MathUtils.clamp(verticalDeviation, -1, 1) * 102 : 0;
  },
    this.props.verticalDeviationDataProvider.gsApproachPointerDeviation
  );

  private readonly hidden = MappedSubject.create(SubscribableMapFunctions.or(),
    this.props.verticalDeviationDataProvider.verticalDeviationIndicatorInactive, this.props.declutter
  );

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div
        class={{
          'vertical-deviation-container': true,
          'border-box': true,
          'amber': false,
          'amber-flash': false,
          'hidden': this.hidden
        }}
      >
        <div class="vertical-deviation-pip-container">
          <div class={{ 'vertical-deviation-pip': true, 'amber': false, 'amber-flash': false }}></div>
          <div class={{ 'vertical-deviation-pip': true, 'amber': false, 'amber-flash': false }}></div>
          <div class={{ 'vertical-deviation-middle-pip': true, 'amber': false, 'amber-flash': false }}></div>
          <div class={{ 'vertical-deviation-pip': true, 'amber': false, 'amber-flash': false }}></div>
          <div class={{ 'vertical-deviation-pip': true, 'amber': false, 'amber-flash': false }}></div>
        </div>
        <svg
          class="vnav-failed-overlay"
          viewBox="-9 -16 35 190"
          style={{
            width: '35px',
            height: '190px',
            display: 'none'
          }}
        >
          <path d="M 0 -2 l 16 172 m -16 0 l 16 -172" />
        </svg>
        <div
          class={{
            'pre-approach-vnav-arrow': true,
            'magenta': this.props.verticalDeviationDataProvider.preApproachPointerMode.map(v => v === Epic2VerticalDeviationMode.Active),
            'cyan': this.props.verticalDeviationDataProvider.preApproachPointerMode.map(v => v === Epic2VerticalDeviationMode.Armed),
            'hidden': this.props.verticalDeviationDataProvider.preApproachPointerActive.map(v => !v),
          }}
        >
          <svg
            viewBox="0 0 25 35"
            style={{
              'width': '25px',
              'height': '35px',
              'transform': this.translatePreApproachPx.map(v => `translateY(${v}px)`),
            }}
          >
            <path
              d="M 5 3 l 15 15 l -15 15 z"
            />
          </svg>
        </div>
        <div
          class={{
            'vnav-pointer': true,
            'magenta': this.props.verticalDeviationDataProvider.gpApproachPointerMode.map(v => v === Epic2VerticalDeviationMode.Active),
            'cyan': this.props.verticalDeviationDataProvider.gpApproachPointerMode.map(v => v === Epic2VerticalDeviationMode.Armed),
            'cyan-stroke': this.props.verticalDeviationDataProvider.gpApproachPointerMode.map(v => v === Epic2VerticalDeviationMode.GPGhostWithPreApproachActive),
            'hidden': this.props.verticalDeviationDataProvider.gpApproachPointerActive.map(v => !v),
          }}
        >
          <svg
            viewBox="4 0 22 38"
            style={{
              'width': '22px',
              'height': '38px',
              'transform': this.translateGpPx.map(v => `translateY(${v}px)`),
            }}
          >
            <path
              d="M 16 2 l -12 16 l 12 16 l 0 -6 l -7 -10 l 7 -10 z"
            />
          </svg>
        </div>
        <div
          class={{
            'gs-arrow': true,
            'magenta': this.props.verticalDeviationDataProvider.gsApproachPointerMode.map(v => v === Epic2VerticalDeviationMode.Active),
            'cyan': this.props.verticalDeviationDataProvider.gsApproachPointerMode.map(v => v === Epic2VerticalDeviationMode.Armed),
            'hidden': this.props.verticalDeviationDataProvider.gsApproachPointerActive.map(v => !v),
          }}
        >
          <svg
            viewBox="4 0 22 38"
            style={{
              'width': '22px',
              'height': '38px',
              'transform': this.translateGsPx.map(v => `translateY(${v}px)`),
            }}
          >
            <path
              d="M 16 2 l -12 16 l 12 16 z"
            />
          </svg>
        </div>
      </div>
    );
  }

}
