/// <reference types="msfstypes/JS/Avionics" />

import {
  AhrsEvents, AvionicsSystemState, AvionicsSystemStateEvent, BitFlags, ConsumerSubject, EventBus, FSComponent, HorizonLayer, HorizonLayerProps,
  HorizonProjection, HorizonProjectionChangeType, ObjectSubject, SetSubject, Subject, Subscribable, SubscribableMapFunctions, Subscription, VNode
} from 'msfssdk';

import { AhrsSystemEvents } from '../../../system/AhrsSystem';

/**
 * Styling options for the attitude indicator pitch ladder.
 */
export type PitchLadderOptions = Pick<PitchLadderProps, 'svtDisabledStyles' | 'svtEnabledStyles'>;

/**
 * Styling options for the slip/skid indicator.
 */
export type SlipSkidIndicatorOptions = Pick<SlipSkidIndicatorProps, 'translationFactor'>;

/**
 * Component props for AttitudeIndicator.
 */
export interface AttitudeIndicatorProps extends HorizonLayerProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The index of the AHRS that is the source of the attitude indicator's data. */
  ahrsIndex: Subscribable<number>;

  /** Whether synthetic vision is enabled. */
  isSVTEnabled: Subscribable<boolean>;

  /** Styling options for the pitch ladder. */
  pitchLadderOptions: PitchLadderOptions;

  /** Styling options for the slip/skid indicator. */
  slipSkidOptions: SlipSkidIndicatorOptions;
}

/**
 * A PFD attitude indicator. Displays a roll scale arc with pointer indicating the current roll angle, a pitch ladder
 * indicating the current pitch angle, and a slip/skid indicator.
 */
export class AttitudeIndicator extends HorizonLayer<AttitudeIndicatorProps> {
  private readonly pitchLadderRef = FSComponent.createRef<PitchLadder>();
  private readonly slipSkidRef = FSComponent.createRef<SlipSkidIndicator>();

  private readonly rootCssClass = SetSubject.create(['attitude-container']);

  private readonly rootStyle = ObjectSubject.create({
    display: ''
  });

  private readonly bankStyle = ObjectSubject.create({
    transform: 'rotate(0deg)'
  });
  private readonly reverseBankStyle = ObjectSubject.create({
    transform: 'rotate(0deg)'
  });

  private readonly ahrsAlignStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly ahrsState = ConsumerSubject.create(null, { previous: undefined, current: AvionicsSystemState.On } as AvionicsSystemStateEvent);

  private readonly roll = Subject.create(0);
  private readonly turnCoordinatorBallSource = ConsumerSubject.create(null, 0);
  private readonly turnCoordinatorBall = Subject.create(0);

  private needUpdateRoll = false;

  private turnCoordinatorBallPipe?: Subscription;
  private ahrsIndexSub?: Subscription;

  /** @inheritdoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    this.rootStyle.set('display', isVisible ? '' : 'none');
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.pitchLadderRef.instance.onAttached();
    this.slipSkidRef.instance.onAttached();

    const sub = this.props.bus.getSubscriber<AhrsEvents & AhrsSystemEvents>();

    this.turnCoordinatorBallPipe = this.turnCoordinatorBallSource.pipe(this.turnCoordinatorBall, true);

    this.roll.map(SubscribableMapFunctions.withPrecision(0.1)).sub(roll => {
      this.bankStyle.set('transform', `rotate(${-roll}deg)`);
      this.reverseBankStyle.set('transform', `rotate(${roll}deg)`);
    });

    this.ahrsState.sub(this.onAhrsStateChanged.bind(this), true);

    this.ahrsIndexSub = this.props.ahrsIndex.sub(index => {
      this.ahrsState.setConsumer(sub.on(`ahrs_state_${index}`));
      this.turnCoordinatorBallSource.setConsumer(sub.on(`ahrs_turn_coordinator_ball_${index}`).withPrecision(2));
    }, true);
  }

  /**
   * Responds to AHRS system state events.
   * @param state An AHRS system state event.
   */
  private onAhrsStateChanged(state: AvionicsSystemStateEvent): void {
    if (state.previous === undefined && state.current !== AvionicsSystemState.Off) {
      this.setDisplayState('ok');
    } else {
      switch (state.current) {
        case AvionicsSystemState.Off:
        case AvionicsSystemState.Failed:
          this.setDisplayState('failed');
          break;
        case AvionicsSystemState.Initializing:
          this.setDisplayState('align');
          break;
        case AvionicsSystemState.On:
          this.setDisplayState('ok');
          break;
      }
    }
  }

  /**
   * Sets the display state of the attitude display.
   * @param state The state to set the display to.
   */
  private setDisplayState(state: 'failed' | 'align' | 'ok'): void {
    switch (state) {
      case 'failed':
        this.rootCssClass.add('failed-instr');

        this.ahrsAlignStyle.set('display', 'none');

        this.turnCoordinatorBallPipe?.pause();
        this.turnCoordinatorBall.set(0);

        this.pitchLadderRef.instance.setVisible(false);
        this.slipSkidRef.instance.setVisible(false);
        break;
      case 'align':
        this.rootCssClass.delete('failed-instr');

        this.ahrsAlignStyle.set('display', '');

        this.turnCoordinatorBallPipe?.pause();
        this.turnCoordinatorBall.set(0);

        this.pitchLadderRef.instance.setVisible(false);
        this.slipSkidRef.instance.setVisible(false);
        break;
      case 'ok':
        this.rootCssClass.delete('failed-instr');

        this.ahrsAlignStyle.set('display', 'none');

        this.turnCoordinatorBallPipe?.resume(true);

        this.pitchLadderRef.instance.setVisible(true);
        this.slipSkidRef.instance.setVisible(true);
        break;
    }
  }

  /** @inheritdoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    this.pitchLadderRef.instance.onProjectionChanged(projection, changeFlags);

    if (BitFlags.isAll(changeFlags, HorizonProjectionChangeType.Roll)) {
      this.needUpdateRoll = true;
    }
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.isVisible()) {
      return;
    }

    this.pitchLadderRef.instance.onUpdated();
    this.slipSkidRef.instance.onUpdated();

    if (this.needUpdateRoll) {
      this.roll.set(this.props.projection.getRoll());
      this.needUpdateRoll = false;
    }
  }

  /** @inheritdoc */
  public onDetached(): void {
    super.onDetached();

    this.destroy();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} style={this.rootStyle}>
        <div class='failed-box' />
        <div class='attitude-bank' style={this.bankStyle}>
          <svg viewBox='0 0 414 315' class='attitude-roll-scale'>
            <path d='M 207 214 m 0 -193 l -10 -20 l 20 0 l -10 20 a 193 193 0 0 1 32.53 2.76 l 2.43 -13.79 l 1.97 0.35 l -2.43 13.79 a 193 193 0 0 1 29.63 7.86 l 4.79 -13.16 l 1.88 0.68 l -4.79 13.16 a 193 193 0 0 1 28.76 13.22 l 14 -24.25 l 1.73 1 l -14 24.25 a 193 193 0 0 1 38.56 29.26 l 9.9 -9.9 l 1.41 1.41 l -9.9 9.9 a 193 193 0 0 1 29.67 38.24 l 24.24 -14 l 1 1.73 l -25.98 15 a 191 191 0 0 0 -330.8 0 l -25.98 -15 l 1 -1.73 l 24.25 14 a 193 193 0 0 1 29.67 -38.24 l -9.9 -9.9 l 1.41 -1.41 l 9.9 9.9 a 193 193 0 0 1 38.56 -29.26 l -14 -24.25 l 1.73 -1 l 14 24.25 a 193 193 0 0 1 28.76 -13.22 l -4.79 -13.16 l 1.88 -0.68 l 4.79 13.16 a 193 193 0 0 1 29.63 -7.86 l -2.43 -13.79 l 1.97 -0.35 l 2.43 13.79 a 193 193 0 0 1 32.53 -2.76' />
          </svg>
          <div class='attitude-cutout' style={this.reverseBankStyle}>
            <div class='attitude-inner-bank' style={this.bankStyle}>
              <PitchLadder
                ref={this.pitchLadderRef}
                projection={this.props.projection}
                isSVTEnabled={this.props.isSVTEnabled}
                {...this.props.pitchLadderOptions}
              />
            </div>
          </div>
        </div>
        <svg viewBox='0 0 414 315' class='attitude-roll-pointer'>
          <path d="M 207 214 m 0 -192 l -10 20 l 20 0 l -10 -20 " />
        </svg>
        <SlipSkidIndicator
          ref={this.slipSkidRef}
          projection={this.props.projection}
          turnCoordinatorBall={this.turnCoordinatorBall}
          {...this.props.slipSkidOptions}
        />
        <div class='ahrs-align-msg' style={this.ahrsAlignStyle}>AHRS ALIGN: Keep Wings Level</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.turnCoordinatorBallSource.destroy();
    this.ahrsState.destroy();

    this.ahrsIndexSub?.destroy();

    this.pitchLadderRef.getOrDefault()?.destroy();
    this.slipSkidRef.getOrDefault()?.destroy();
  }
}

/**
 * Styling options for the pitch ladder.
 */
export type PitchLadderStyles = {
  /** The increment, in degrees, between minor pitch lines. */
  minorLineIncrement: number;

  /** The number of minor pitch lines for each medium pitch line. */
  mediumLineFactor: number;

  /** The number of medium pitch lines for each major pitch line. */
  majorLineFactor: number;

  /** The maximum pitch at which to draw minor pitch lines. */
  minorLineMaxPitch: number;

  /** The maximum pitch at which to draw medium pitch lines. */
  mediumLineMaxPitch: number;

  /** The length of minor pitch lines. */
  minorLineLength: number;

  /** The length of medium pitch lines. */
  mediumLineLength: number;

  /** The length of major pitch lines. */
  majorLineLength: number;

  /** Whether to show numbers for minor pitch lines. */
  minorLineShowNumber: boolean;

  /** Whether to show numbers for medium pitch lines. */
  mediumLineShowNumber: boolean;

  /** Whether to show numbers for major pitch lines. */
  majorLineShowNumber: boolean;
};

/**
 * Component props for PitchLadder.
 */
interface PitchLadderProps extends HorizonLayerProps {
  /** Whether synthetic vision is enabled. */
  isSVTEnabled: Subscribable<boolean>;

  /** Styling options to apply when synthetic vision is disabled. */
  svtDisabledStyles: PitchLadderStyles;

  /** Styling options to apply when synthetic vision is enabled. */
  svtEnabledStyles: PitchLadderStyles;
}

/**
 * A pitch ladder for the PFD attitude indicator.
 */
class PitchLadder extends HorizonLayer<PitchLadderProps> {
  private readonly svgRef = FSComponent.createRef<SVGElement>();

  private readonly style = ObjectSubject.create({
    display: '',
    overflow: 'visible',
    transform: 'translate3d(0px, 0px, 0px)'
  });

  private pitchResolution = 0; // pixels per degree

  private readonly translation = Subject.create(0);

  private needRebuildLadder = false;
  private needReposition = false;

  private svtSub?: Subscription;

  /** @inheritdoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    this.style.set('display', isVisible ? '' : 'none');
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.svtSub = this.props.isSVTEnabled.sub(() => { this.needRebuildLadder = true; }, true);

    this.translation.map(SubscribableMapFunctions.withPrecision(0.1)).sub(translation => {
      this.style.set('transform', `translate3d(0px, ${translation}px, 0px)`);
    });
  }

  /** @inheritdoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    if (BitFlags.isAny(changeFlags, HorizonProjectionChangeType.Fov | HorizonProjectionChangeType.ScaleFactor)) {
      this.needRebuildLadder = true;
    }
    if (BitFlags.isAny(changeFlags, HorizonProjectionChangeType.Pitch)) {
      this.needReposition = true;
    }
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.needReposition && !this.needRebuildLadder) {
      return;
    }

    if (this.needRebuildLadder) {
      this.rebuildLadder();
      this.needRebuildLadder = false;
    }

    this.repositionLadder();

    this.needReposition = false;
  }

  /**
   * Repositions this ladder based on the current pitch.
   */
  private repositionLadder(): void {
    this.translation.set(this.props.projection.getPitch() * this.pitchResolution);
  }

  /**
   * Rebuilds this ladder.
   */
  private rebuildLadder(): void {
    this.pitchResolution = this.props.projection.getScaleFactor() / this.props.projection.getFov();
    const styles = this.props.isSVTEnabled.get() ? this.props.svtEnabledStyles : this.props.svtDisabledStyles;

    this.svgRef.instance.innerHTML = '';

    const majorFactor = styles.majorLineFactor * styles.mediumLineFactor;
    const len = Math.floor(90 / styles.minorLineIncrement);
    for (let i = 1; i < len; i++) {
      const pitch = i * styles.minorLineIncrement;
      const y = pitch * this.pitchResolution;

      let lineLength: number | undefined;
      let showNumber = false;

      if (i % majorFactor === 0) {
        // major line
        lineLength = styles.majorLineLength;
        showNumber = styles.majorLineShowNumber;
      } else if (i % styles.mediumLineFactor === 0 && pitch <= styles.mediumLineMaxPitch) {
        // medium line
        lineLength = styles.mediumLineLength;
        showNumber = styles.mediumLineShowNumber;
      } else if (pitch <= styles.minorLineMaxPitch) {
        // minor line
        lineLength = styles.minorLineLength;
        showNumber = styles.minorLineShowNumber;
      }

      if (lineLength !== undefined) {
        if (lineLength > 0) {
          FSComponent.render(<line x1={-lineLength / 2} y1={-y} x2={lineLength / 2} y2={-y}>.</line>, this.svgRef.instance);
          FSComponent.render(<line x1={-lineLength / 2} y1={y} x2={lineLength / 2} y2={y}>.</line>, this.svgRef.instance);
        }

        if (showNumber) {
          const pitchText = pitch.toString();
          const leftAnchorX = -lineLength / 2 - 20;
          const rightAnchorX = lineLength / 2 + 20;

          FSComponent.render(<text x={leftAnchorX} y={-y} text-anchor='middle' dominant-baseline='central'>{pitchText}</text>, this.svgRef.instance);
          FSComponent.render(<text x={rightAnchorX} y={-y} text-anchor='middle' dominant-baseline='central'>{pitchText}</text>, this.svgRef.instance);

          FSComponent.render(<text x={leftAnchorX} y={y} text-anchor='middle' dominant-baseline='central'>{pitchText}</text>, this.svgRef.instance);
          FSComponent.render(<text x={rightAnchorX} y={y} text-anchor='middle' dominant-baseline='central'>{pitchText}</text>, this.svgRef.instance);
        }
      }
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <svg ref={this.svgRef} class='attitude-pitchladder' style={this.style}>
      </svg>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.svtSub?.destroy();
  }
}

/**
 * Component props for SlipSkidIndicator.
 */
interface SlipSkidIndicatorProps extends HorizonLayerProps {
  /** A subscribable which provides the position of the turn coordinator ball. */
  turnCoordinatorBall: Subscribable<number>;

  /** The amount to translate the indicator, in pixels, for every unit of turn coordinator ball deviation. */
  translationFactor: number;
}

/**
 * A slip/skid indicator for the PFD attitude indicator.
 */
class SlipSkidIndicator extends HorizonLayer<SlipSkidIndicatorProps> {
  private readonly style = ObjectSubject.create({
    display: '',
    transform: 'translate3d(0px, 0px, 0px)'
  });

  private needUpdate = false;

  private ballSub?: Subscription;

  /** @inheritdoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    this.style.set('display', isVisible ? '' : 'none');
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.ballSub = this.props.turnCoordinatorBall.sub(() => {
      this.needUpdate = true;
    });
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.needUpdate) {
      return;
    }

    const ballPosition = this.props.turnCoordinatorBall.get();
    this.style.set('transform', `translate3d(${ballPosition * this.props.translationFactor}px, 0px, 0px)`);

    this.needUpdate = false;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <svg viewBox='0 0 30 20' class='attitude-slip-skid' style={this.style}>
        <path d='M 15 15 l 15 0 l -3 -6 l -24 0 l -3 6 l 15 0' />
      </svg>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.ballSub?.destroy();
  }
}