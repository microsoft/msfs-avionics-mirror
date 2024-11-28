import {
  ComponentProps, CssTransformBuilder, CssTransformSubject, DisplayComponent, FSComponent, MappedSubject, MathUtils, Subscribable, VNode
} from '@microsoft/msfs-sdk';

import { AirspeedDataProvider } from '@microsoft/msfs-epic2-shared';

import './FlightPathSpeedError.css';

/** Props the acceleration chevron. */
export interface FlightPathSpeedErrorProps extends ComponentProps {
  /** The airspeed data provider to use. */
  airspeedDataProvider: AirspeedDataProvider;
  /** Whether to show the chevron. */
  isHidden: Subscribable<boolean>;
}

/** An acceleration chevron for the flight path marker. */
export class FlightPathSpeedError extends DisplayComponent<FlightPathSpeedErrorProps> {
  private static readonly MAX_SPEED_ERROR = 20;

  private readonly translateTransform = CssTransformSubject.create(CssTransformBuilder.scale3d());
  private readonly scaleY = this.props.airspeedDataProvider.speedError.map((v) => v !== null
    ? MathUtils.round(MathUtils.clamp(-v / FlightPathSpeedError.MAX_SPEED_ERROR, -1, 1), 0.01)
    : 0
  );

  private readonly isHidden = MappedSubject.create(
    ([isHidden, speedError]) => isHidden || speedError === null,
    this.props.isHidden,
    this.props.airspeedDataProvider.speedError,
  );

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onAfterRender(node: VNode): void {
    const pxOffsetSub = this.scaleY.sub((v) => {
      this.translateTransform.transform.set(1, v, 0);
      this.translateTransform.resolve();
    }, false, true);

    this.isHidden.sub((v) => {
      if (v) {
        pxOffsetSub.pause();
      } else {
        pxOffsetSub.resume(true);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return <div
      class={{ 'flight-path-speed-error': true, 'hidden': this.isHidden }}
      style={{ 'transform': this.translateTransform }}
    />;
  }
}
