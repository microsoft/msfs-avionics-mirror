import {
  ComponentProps, CssTransformBuilder, CssTransformSubject, DisplayComponent, FSComponent, MappedSubject, MathUtils, Subscribable, VNode
} from '@microsoft/msfs-sdk';

import { AirspeedDataProvider } from '@microsoft/msfs-epic2-shared';

import './FlightPathAccelerationChevron.css';

/** Props the acceleration chevron. */
export interface FlightPathAccelerationChevronProps extends ComponentProps {
  /** The airspeed data provider to use. */
  airspeedDataProvider: AirspeedDataProvider;
  /** Whether to show the chevron. */
  isHidden: Subscribable<boolean>;
}

/** An acceleration chevron for the flight path marker. */
export class FlightPathAccelerationChevron extends DisplayComponent<FlightPathAccelerationChevronProps> {
  private static readonly PX_PER_KNOT = 2.5;
  private static readonly MAX_ACCEL_KTS = 20;

  private readonly translateTransform = CssTransformSubject.create(CssTransformBuilder.concat(
    CssTransformBuilder.translate('%'),
    CssTransformBuilder.translate3d('px'),
  ));
  private readonly pxOffset = this.props.airspeedDataProvider.casTrendDiff.map((v) => v !== null ? MathUtils.round(
    MathUtils.clamp(-v * FlightPathAccelerationChevron.PX_PER_KNOT, -FlightPathAccelerationChevron.MAX_ACCEL_KTS, FlightPathAccelerationChevron.MAX_ACCEL_KTS),
    0.5,
  ) : 0);

  private readonly isHidden = MappedSubject.create(
    ([isHidden, casTrendDiff]) => isHidden || casTrendDiff === null,
    this.props.isHidden,
    this.props.airspeedDataProvider.casTrendDiff,
  );

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onAfterRender(node: VNode): void {
    this.translateTransform.transform.getChild(0).set(0, -50);

    const pxOffsetSub = this.pxOffset.sub((v) => {
      this.translateTransform.transform.getChild(1).set(0, v, 0);
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
    return <svg
      class={{ 'flight-path-acceleration-chevron': true, 'hidden': this.isHidden }}
      style={{ 'transform': this.translateTransform }}
      viewBox='-2 -11 16 22'
    >
      <path d='M -0.5 -9.5 l 9.5 9.5 l -9.5 9.5' class="shadow" />
      <path d='M 0 -9 l 9 9 l -9 9' />
    </svg>;
  }
}
