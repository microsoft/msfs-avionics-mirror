import {
  ComponentProps, CssTransformBuilder, CssTransformSubject, DisplayComponent, FSComponent, MappedSubject, Subscription, VNode,
} from '@microsoft/msfs-sdk';

import { DefaultSlipSkidDataProvider } from './SlipSkidDataProvider';

import './SlipSkidIndicator.css';


/** Properties of the {@link SlipSkidIndicator} component. */
export interface SlipSkidIndicatorProps extends ComponentProps {
  /** An instance of DefaultTurnCoordinatorDataProvider. */
  slipSkidDataProvider: DefaultSlipSkidDataProvider;
}

/** The slip indicator component of the PFD. */
export class SlipSkidIndicator extends DisplayComponent<SlipSkidIndicatorProps> {
  private readonly ballTransform = CssTransformSubject.create(CssTransformBuilder.translate3d('%', '%', 'px'));

  private readonly subs: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    this.subs.push(
      MappedSubject.create(this.props.slipSkidDataProvider.slipSkidBallPosition, this.props.slipSkidDataProvider.isAhrsDataValid).sub(([ballPosition, valid]) => {
        // ballPosition is -1 to 1, travel limits are -41% and 41% to keep the ball within the window
        // ball remains centered if AHRS data is invalid
        this.ballTransform.transform.set(valid ? ballPosition * 41 : 0, 0, 0);
        this.ballTransform.resolve();
      }, true)
    );
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="slip-indicator">
        <svg viewBox="0 0 160 30" class="slip-indicator-ball" style={{ 'transform': this.ballTransform }}>
          <circle cx="80" cy="15" r="12" stroke="#000000" fill="#FFFFFF" />
        </svg>
        <svg class="slip-indicator-lines" viewBox="0 0 160 30">
          <path d="M 63 1 l 0 28 l 4 0 l 0 -28 z M 93 1 l 0 28 l 4 0 l 0 -28 z" stroke="#000000" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.subs.forEach(sub => sub.destroy());
  }
}
