import {
  BitFlags, CssRotateTransform, CssTransformBuilder, CssTransformChain, CssTransformSubject, CssTranslate3dTransform,
  CssTranslateTransform, ExpSmoother, FSComponent, HorizonLayer, HorizonLayerProps, HorizonProjection,
  HorizonProjectionChangeType, MathUtils, ObjectSubject, ReadonlyFloat64Array, Subject, Subscribable,
  SubscribableUtils, Subscription, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { TcasRaCommandDataProvider } from '../../../traffic/TcasRaCommandDataProvider';

/**
 * Component props for TcasRaPitchCueLayer.
 */
export interface TcasRaPitchCueLayerProps extends HorizonLayerProps {
  /** Whether to show the layer. */
  show: Subscribable<boolean>;

  /** A provider of TCAS-II resolution advisory vertical speed command data. */
  dataProvider: TcasRaCommandDataProvider;

  /** The airplane's current vertical speed, in feet per minute. */
  verticalSpeed: Subscribable<number>;

  /** The airplane's current true airspeed, in degrees. */
  tas: Subscribable<number>;

  /** The current simulation rate factor. */
  simRate: Subscribable<number>;

  /**
   * The clipping bounds of the layer, as `[left, top, right, bottom]` in pixels relative to the center of the
   * projection.
   */
  clipBounds: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /**
   * The bounds defining the ovoid area in which the no-fly cues remain conformal, as `[left, top, right, bottom]` in
   * pixels relative to the center of the projection.
   */
  conformalBounds: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /**
   * The smoothing time constant, in milliseconds, to use for smoothing true airspeed values when calculating the pitch
   * attitude required to achieve a given vertical speed. Defaults to `2000 / Math.LN2`.
   */
  tasSmoothingTau?: number;

  /**
   * The smoothing time constant, in milliseconds, to use for smoothing pitch values when calculating the pitch
   * attitude required to achieve a given vertical speed. Defaults to `2000 / Math.LN2`.
   */
  pitchSmoothingTau?: number;
}

/**
 * A PFD TCAS-II resolution advisory pitch cue layer.
 */
export class TcasRaPitchCueLayer extends HorizonLayer<TcasRaPitchCueLayerProps> {

  private readonly clipBounds = SubscribableUtils.toSubscribable(this.props.clipBounds, true);
  private readonly conformalBounds = SubscribableUtils.toSubscribable(this.props.conformalBounds, true);

  private readonly rootStyle = ObjectSubject.create({
    'display': '',
    'position': 'absolute',
    'left': '0px',
    'top': '0px',
    'width': '0px',
    'height': '0px',
    'overflow': 'hidden'
  });

  private readonly clipCenterX = Subject.create('');
  private readonly clipCenterY = Subject.create('');

  private readonly noflyAboveDisplay = Subject.create('');
  private readonly noflyAboveTransform = CssTransformSubject.create(CssTransformBuilder.concat(
    CssTransformBuilder.rotate('deg'),
    CssTransformBuilder.translate3d('px'),
    CssTransformBuilder.translate('%')
  ));

  private readonly noflyBelowDisplay = Subject.create('');
  private readonly noflyBelowTransform = CssTransformSubject.create(CssTransformBuilder.concat(
    CssTransformBuilder.rotate('deg'),
    CssTransformBuilder.translate3d('px'),
    CssTransformBuilder.translate('%')
  ));

  private readonly flytoDisplay = Subject.create('');
  private readonly flytoHeight = Subject.create(0);
  private readonly flyToTransform = CssTransformSubject.create(CssTransformBuilder.concat(
    CssTransformBuilder.rotate('deg'),
    CssTransformBuilder.translate3d('px'),
    CssTransformBuilder.translate('%')
  ));

  private readonly tasSmoother = new ExpSmoother(this.props.tasSmoothingTau ?? 2000 / Math.LN2);
  private readonly pitchSmoother = new ExpSmoother(this.props.pitchSmoothingTau ?? 2000 / Math.LN2);
  private readonly smoothedTas = Subject.create(0);
  private readonly smoothedPitch = Subject.create(0);

  private needUpdateClipBounds = false;
  private needUpdateNoflyAbove = false;
  private needUpdateNoflyBelow = false;
  private needUpdateFlyto = false;

  private readonly pauseable: Subscription[] = [];

  private showSub?: Subscription;
  private clipBoundsSub?: Subscription;

  /** @inheritdoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    if (isVisible) {
      this.rootStyle.set('display', '');

      for (const pauseable of this.pauseable) {
        pauseable.resume();
      }

      this.checkNeedUpdateCues();
    } else {
      this.rootStyle.set('display', 'none');

      for (const pauseable of this.pauseable) {
        pauseable.pause();
      }

      this.tasSmoother.reset();
      this.pitchSmoother.reset();
    }
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.noflyAboveTransform.transform.getChild(2).set(-50, -100);
    this.noflyBelowTransform.transform.getChild(2).set(-50, 0);
    this.flyToTransform.transform.getChild(2).set(-50, 0);

    this.clipBoundsSub = this.clipBounds.sub(() => { this.needUpdateClipBounds = true; });

    const checkNeedUpdateCues = this.checkNeedUpdateCues.bind(this);

    const paused = !this.isVisible();

    this.pauseable.push(

      this.props.dataProvider.raMaxVs.sub(() => { this.needUpdateNoflyAbove = true; }, false, paused),

      this.props.dataProvider.raMinVs.sub(() => { this.needUpdateNoflyBelow = true; }, false, paused),

      this.props.dataProvider.raFlyToMaxVs.sub(() => { this.needUpdateFlyto = true; }, false, paused),
      this.props.dataProvider.raFlyToMinVs.sub(() => { this.needUpdateFlyto = true; }, false, paused),

      this.smoothedTas.sub(checkNeedUpdateCues, false, paused),
      this.smoothedPitch.sub(checkNeedUpdateCues, false, paused),

      this.conformalBounds.sub(() => {
        this.needUpdateNoflyAbove = true;
        this.needUpdateNoflyBelow = true;
      }, false, paused)

    );

    this.showSub = this.props.show.sub(this.setVisible.bind(this), true);

    this.needUpdateClipBounds = true;
    this.needUpdateNoflyAbove = true;
    this.needUpdateNoflyBelow = true;
    this.needUpdateFlyto = true;
  }

  /**
   * Checks whether any of this layer's cues are visible, and if so, marks them to be updated.
   */
  private checkNeedUpdateCues(): void {
    this.needUpdateNoflyAbove ||= this.props.dataProvider.raMaxVs.get() !== null;
    this.needUpdateNoflyBelow ||= this.props.dataProvider.raMinVs.get() !== null;
    this.needUpdateFlyto ||= this.props.dataProvider.raFlyToMaxVs.get() !== null && this.props.dataProvider.raFlyToMinVs.get() !== null;
  }

  /** @inheritdoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    this.needUpdateClipBounds ||= BitFlags.isAny(changeFlags, HorizonProjectionChangeType.OffsetCenterProjected);
    if (BitFlags.isAny(changeFlags, ~HorizonProjectionChangeType.Position)) {
      this.checkNeedUpdateCues();
    }
  }

  /** @inheritdoc */
  public onSleep(): void {
    this.tasSmoother.reset();
    this.pitchSmoother.reset();
  }

  /** @inheritdoc */
  public onUpdated(time: number, elapsed: number): void {
    if (!this.isVisible()) {
      return;
    }

    this.updateSmoothedValues(elapsed);

    if (this.needUpdateClipBounds) {
      this.updateClipBounds();
      this.needUpdateClipBounds = false;
    }

    if (this.needUpdateNoflyAbove) {
      this.updateNoflyCue(1, this.props.dataProvider.raMaxVs.get(), this.noflyAboveDisplay, this.noflyAboveTransform);
      this.needUpdateNoflyAbove = false;
    }

    if (this.needUpdateNoflyBelow) {
      this.updateNoflyCue(-1, this.props.dataProvider.raMinVs.get(), this.noflyBelowDisplay, this.noflyBelowTransform);
      this.needUpdateNoflyBelow = false;
    }

    if (this.needUpdateFlyto) {
      this.updateFlytoCue();
      this.needUpdateFlyto = false;
    }
  }

  /**
   * Updates this layer's smoothed true airspeed and pitch values.
   * @param elapsed The elapsed time since the last update, in milliseconds.
   */
  private updateSmoothedValues(elapsed: number): void {
    const tas = this.props.tas.get();

    const dt = elapsed * this.props.simRate.get();
    if (dt > 0) {
      this.smoothedTas.set(this.tasSmoother.next(tas, dt));
      this.smoothedPitch.set(this.pitchSmoother.next(this.props.projection.getPitch(), dt));
    } else {
      this.smoothedTas.set(this.tasSmoother.reset(tas));
      this.smoothedPitch.set(this.pitchSmoother.reset(this.props.projection.getPitch()));
    }
  }

  /**
   * Updates this layer's clipping bounds.
   */
  private updateClipBounds(): void {
    const center = this.props.projection.getOffsetCenterProjected();
    const bounds = this.clipBounds.get();

    const width = bounds[2] - bounds[0];
    const height = bounds[3] - bounds[1];

    this.rootStyle.set('left', `${center[0] + bounds[0]}px`);
    this.rootStyle.set('top', `${center[1] + bounds[1]}px`);
    this.rootStyle.set('width', `${width}px`);
    this.rootStyle.set('height', `${height}px`);

    this.clipCenterX.set(`${width / 2}px`);
    this.clipCenterY.set(`${height / 2}px`);

    this.checkNeedUpdateCues();
  }

  /**
   * Updates one of this layer's no-fly pitch cues.
   * @param direction The direction of the no-fly cue: +1 for above and -1 for below.
   * @param vsLimit The vertical speed limit, in feet per minute, commanded by the currently active resolution
   * advisory, or `null` if there is no such limit.
   * @param display The display style of the no-fly cue.
   * @param transform The CSS transform of the no-fly cue.
   */
  private updateNoflyCue(
    direction: 1 | -1,
    vsLimit: number | null,
    display: Subject<string>,
    transform: CssTransformSubject<CssTransformChain<[CssRotateTransform, CssTranslate3dTransform, CssTranslateTransform]>>
  ): void {
    const currentTas = this.smoothedTas.get();

    if (currentTas < 1 || vsLimit === null) {
      display.set('none');
      return;
    }

    const currentVs = this.props.verticalSpeed.get();

    const projection = this.props.projection;
    const angularResolution = projection.getScaleFactor() / projection.getFov();
    const roll = projection.getRoll();
    const rotation = (-roll + 540) % 360 - 180; // -180 to 180

    const conformalBounds = this.conformalBounds.get();

    let minPitchOffsetPx: number;
    let maxPitchOffsetPx: number;
    if (direction === 1) {
      minPitchOffsetPx = -Infinity;

      if (rotation >= 90) {
        maxPitchOffsetPx = MathUtils.lerp(rotation, 90, 180, -conformalBounds[0], -conformalBounds[1]);
      } else if (rotation >= 0) {
        maxPitchOffsetPx = MathUtils.lerp(rotation, 0, 90, conformalBounds[3], -conformalBounds[0]);
      } else if (rotation >= -90) {
        maxPitchOffsetPx = MathUtils.lerp(rotation, -90, 0, conformalBounds[2], conformalBounds[3]);
      } else {
        maxPitchOffsetPx = MathUtils.lerp(rotation, -180, -90, -conformalBounds[1], conformalBounds[2]);
      }
    } else {
      maxPitchOffsetPx = Infinity;

      if (rotation >= 90) {
        minPitchOffsetPx = MathUtils.lerp(rotation, 90, 180, -conformalBounds[2], -conformalBounds[3]);
      } else if (rotation >= 0) {
        minPitchOffsetPx = MathUtils.lerp(rotation, 0, 90, conformalBounds[1], -conformalBounds[2]);
      } else if (rotation >= -90) {
        minPitchOffsetPx = MathUtils.lerp(rotation, -90, 0, conformalBounds[0], conformalBounds[1]);
      } else {
        minPitchOffsetPx = MathUtils.lerp(rotation, -180, -90, -conformalBounds[3], conformalBounds[0]);
      }
    }

    const deltaVs = vsLimit - currentVs;
    const deltaPitch = Math.asin(MathUtils.clamp(deltaVs / UnitType.KNOT.convertTo(currentTas, UnitType.FPM), -1, 1)) * Avionics.Utils.RAD2DEG;

    const pitchOffsetPx = MathUtils.clamp(
      (this.smoothedPitch.get() - projection.getPitch() + deltaPitch) * -angularResolution,
      minPitchOffsetPx,
      maxPitchOffsetPx
    );

    transform.transform.getChild(0).set(rotation, 0.1);
    transform.transform.getChild(1).set(0, pitchOffsetPx, 0, 0.1, 0.1);
    transform.resolve();

    display.set('');
  }

  /**
   * Updates this layer's fly-to pitch cue.
   */
  private updateFlytoCue(): void {
    const currentTas = this.smoothedTas.get();
    const minVs = this.props.dataProvider.raFlyToMinVs.get();
    const maxVs = this.props.dataProvider.raFlyToMaxVs.get();

    if (currentTas < 1 || minVs === null || maxVs === null) {
      this.flytoDisplay.set('none');
      return;
    }

    const currentVs = this.props.verticalSpeed.get();

    const projection = this.props.projection;
    const angularResolution = projection.getScaleFactor() / projection.getFov();

    const tasFpm = UnitType.KNOT.convertTo(currentTas, UnitType.FPM);
    const deltaMinVs = minVs - currentVs;
    const deltaMaxVs = maxVs - currentVs;
    const deltaMinPitch = Math.asin(MathUtils.clamp(deltaMinVs / tasFpm, -1, 1)) * Avionics.Utils.RAD2DEG;
    const deltaMaxPitch = Math.asin(MathUtils.clamp(deltaMaxVs / tasFpm, -1, 1)) * Avionics.Utils.RAD2DEG;

    const pitchOffsetPx = (this.smoothedPitch.get() - projection.getPitch() + deltaMaxPitch) * -angularResolution;
    const pitchHeightPx = (deltaMaxPitch - deltaMinPitch) * angularResolution;

    this.flytoHeight.set(Math.round(pitchHeightPx));

    this.flyToTransform.transform.getChild(0).set(-projection.getRoll(), 0.1);
    this.flyToTransform.transform.getChild(1).set(0, pitchOffsetPx, 0, 0.1, 0.1);
    this.flyToTransform.resolve();

    this.flytoDisplay.set('');
  }

  /** @inheritdoc */
  public onDetached(): void {
    super.onDetached();

    this.destroy();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        class='tcas-ra-pitch'
        style={this.rootStyle}
      >
        <svg
          viewBox='-191 -140 382 140'
          class='tcas-ra-pitch-nofly tcas-ra-pitch-nofly-above'
          style={{
            'display': this.noflyAboveDisplay,
            'position': 'absolute',
            'left': this.clipCenterX,
            'top': this.clipCenterY,
            'transform': this.noflyAboveTransform,
            'transform-origin': '0px 0px',
            'overflow': 'visible'
          }}
        >
          <path
            d='M -185.17 -139.83 l -5.66 0 l 0 5.66 z'
            class='tcas-ra-pitch-nofly-end'
          />
          <path
            d='M 185.17 -139.83 l 5.66 0 l 0 5.66 z'
            class='tcas-ra-pitch-nofly-end'
          />
          <path
            d='M -185.17 -139.83 l -5.66 5.66 l 137.83 134.17 l 106 0 l 137.83 -134.17 l -5.66 -5.66 l -132.17 135.83 l -106 0 z'
            class='tcas-ra-pitch-nofly-main'
          />
        </svg>
        <svg
          viewBox='-191 0 382 140'
          class='tcas-ra-pitch-nofly tcas-ra-pitch-nofly-below'
          style={{
            'display': this.noflyBelowDisplay,
            'position': 'absolute',
            'left': this.clipCenterX,
            'top': this.clipCenterY,
            'transform': this.noflyBelowTransform,
            'transform-origin': '0px 0px',
            'overflow': 'visible'
          }}
        >
          <path
            d='M -185.17 139.83 l -5.66 0 l 0 -5.66 z'
            class='tcas-ra-pitch-nofly-end'
          />
          <path
            d='M 185.17 139.83 l 5.66 0 l 0 -5.66 z'
            class='tcas-ra-pitch-nofly-end'
          />
          <path
            d='M -185.17 139.83 l -5.66 -5.66 l 137.83 -134.17 l 106 0 l 137.83 134.17 l -5.66 5.66 l -132.17 -135.83 l -106 0 z'
            class='tcas-ra-pitch-nofly-main'
          />
        </svg>
        <div
          class='tcas-ra-pitch-flyto'
          style={{
            'display': this.flytoDisplay,
            'position': 'absolute',
            'left': this.clipCenterX,
            'top': this.clipCenterY,
            'height': this.flytoHeight.map(height => `${height}px`),
            'transform': this.flyToTransform,
            'transform-origin': '0px 0px'
          }}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    for (const pauseable of this.pauseable) {
      pauseable.destroy();
    }

    this.showSub?.destroy();
    this.clipBoundsSub?.destroy();

    super.destroy();
  }
}
