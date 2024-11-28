import {
  ComponentProps, CssTransformBuilder, DisplayComponent, FSComponent, MappedSubject, MathUtils, Subject, Subscribable, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { AutothrottleDataProvider, AutothrottleState } from '@microsoft/msfs-epic2-shared';

import './ThrustDirector.css';

/** Thrust director status props. */
export interface ThrustDirectorProps extends ComponentProps {
  /** An autothrottle data provider. */
  readonly autothrottleDataProvider: AutothrottleDataProvider,
  /** Whether the thrust director setting is enabled. */
  readonly thrustDirectorEnabled: Subscribable<boolean>,
  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/** A component to display the autothrottle status. */
export class ThrustDirector extends DisplayComponent<ThrustDirectorProps> {
  private static readonly THRUST_ERROR_TO_PX = 400;
  private static readonly MAX_THRUST_ERROR = 0.05;

  private readonly isHidden = MappedSubject.create(
    ([atStatus, thrustDirSetting, target, declutter]) => (atStatus !== AutothrottleState.Active && !thrustDirSetting) || target === null || declutter,
    this.props.autothrottleDataProvider.state,
    // TODO re-enable when thrust director is available without A/T engaged
    Subject.create(false), // this.props.thrustDirectorEnabled,
    this.props.autothrottleDataProvider.thrustDirectorTargetSpeed,
    this.props.declutter
  );

  private readonly thrustErrorPx = this.props.autothrottleDataProvider.thrustDirectorTargetSpeed.map((v) => MathUtils.round(
    MathUtils.clamp(v ? v : 0, -ThrustDirector.MAX_THRUST_ERROR, ThrustDirector.MAX_THRUST_ERROR) * ThrustDirector.THRUST_ERROR_TO_PX, 0.1
  ));

  private readonly isErrorNegative = this.thrustErrorPx.map((v) => v < 0);

  private readonly stemHidden = this.thrustErrorPx.map((v) => Math.abs(v) < 9);

  private readonly targetTransformBuilder = CssTransformBuilder.translate3d('px');

  private readonly stemTransformBuilder = CssTransformBuilder.scale3d();

  private readonly targetTransform = Subject.create('translate3d(0 0 0)');

  private readonly stemTransform = Subject.create('scale3d(1 1 1)');

  private targetTransformSub?: Subscription;

  private stemTransformSub?: Subscription;

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onAfterRender(node: VNode): void {
    this.targetTransformSub = this.thrustErrorPx.sub((v) => {
      this.targetTransformBuilder.set(0, -v, 0, 0.1, 0.1, 0.1);
      this.targetTransform.set(this.targetTransformBuilder.resolve());
    }, true);

    this.stemTransformSub = this.thrustErrorPx.sub((v) => {
      const scale = v >= 0 ? MathUtils.lerp(v, 9, 20, 0, -1, true, true) : MathUtils.lerp(v, -9, -20, 0, 1, true, true);
      this.stemTransformBuilder.set(1, scale, 1, 0.01, 0.01, 0.01);
      this.stemTransform.set(this.stemTransformBuilder.resolve());
    }, true);

    this.isHidden.sub((isHidden) => {
      if (isHidden) {
        this.stemHidden.pause();
        this.isErrorNegative.pause();
        this.targetTransformSub?.pause();
        this.stemTransformSub?.pause();
      } else {
        this.targetTransformSub?.resume(true);
        this.stemHidden.resume();
        if (!this.stemHidden.get()) {
          this.stemTransformSub?.resume(true);
          this.isErrorNegative.resume();
        }
      }
    });

    this.stemHidden.sub((isHidden) => {
      if (isHidden) {
        this.stemTransformSub?.pause();
        this.isErrorNegative.pause();
      } else {
        this.stemTransformSub?.resume(true);
        this.isErrorNegative.resume();
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div
        class={{
          'thrust-director': true,
          'hidden': this.isHidden,
        }}
      >
        <div class={{ 'thrust-target-stem': true, 'negative': this.isErrorNegative, 'hidden': this.stemHidden }} style={{ 'transform': this.stemTransform }} />
        <div class="thrust-target" style={{ 'transform': this.targetTransform }} />

        <svg class="thrust-reference" viewBox="-17 -17 34 34">
          <circle r="9" class="shadow" />
          <circle r="9" />
        </svg>
      </div>
    );
  }
}
