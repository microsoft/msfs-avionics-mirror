import {
  AhrsEvents, APEvents, AvionicsSystemState, AvionicsSystemStateEvent, BitFlags, ConsumerSubject, CssTransformBuilder, EventBus,
  FSComponent, HorizonLayer, HorizonLayerProps, HorizonProjection, HorizonProjectionChangeType, MappedSubject, MathUtils,
  ObjectSubject, SetSubject, Subject, Subscribable, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { AhrsSystemEvents } from '../../../system/AhrsSystem';

/**
 * Options for the roll scale.
 */
export type RollScaleOptions = {
  /** Whether to show the arc. */
  showArc: boolean;

  /** The bank angle limit, in degrees, in Low Bank Mode. If not defined, the low-bank arc will not be displayed. */
  lowBankAngle?: number;
};

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

  /** Whether to show the arc on the roll scale. */
  rollScaleOptions: RollScaleOptions;

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
    transform: 'rotate3d(0, 0, 1, 0deg)'
  });

  private readonly lowBankStyle = this.props.rollScaleOptions.lowBankAngle === undefined
    ? undefined
    : ObjectSubject.create({
      display: 'none'
    });

  private readonly ahrsAlignStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly ahrsState = ConsumerSubject.create(null, { previous: undefined, current: AvionicsSystemState.On } as AvionicsSystemStateEvent);
  private readonly isAttitudeDataValid = ConsumerSubject.create(null, true);

  private readonly rollTransform = CssTransformBuilder.rotate3d('deg');

  private readonly turnCoordinatorBallSource = ConsumerSubject.create(null, 0);
  private readonly turnCoordinatorBall = Subject.create(0);

  private needUpdateRoll = false;

  private turnCoordinatorBallPipe?: Subscription;
  private ahrsIndexSub?: Subscription;
  private lowBankSub?: Subscription;

  /** @inheritdoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    this.rootStyle.set('display', isVisible ? '' : 'none');
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.pitchLadderRef.instance.onAttached();
    this.slipSkidRef.instance.onAttached();

    const sub = this.props.bus.getSubscriber<AhrsEvents & AhrsSystemEvents & APEvents>();

    this.turnCoordinatorBallPipe = this.turnCoordinatorBallSource.pipe(this.turnCoordinatorBall, true);

    if (this.lowBankStyle !== undefined) {
      this.lowBankSub = sub.on('ap_max_bank_id').whenChanged().handle(id => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.lowBankStyle!.set('display', id === 1 ? '' : 'none');
      });
    }

    this.ahrsIndexSub = this.props.ahrsIndex.sub(index => {
      this.ahrsState.setConsumer(sub.on(`ahrs_state_${index}`));
      this.turnCoordinatorBallSource.setConsumer(sub.on(`ahrs_turn_coordinator_ball_${index}`).withPrecision(2));
      this.isAttitudeDataValid.setConsumer(sub.on(`ahrs_attitude_data_valid_${index}`));
    }, true);

    const dataState = MappedSubject.create(
      this.ahrsState,
      this.isAttitudeDataValid
    );

    dataState.sub(([ahrsState, isAttitudeDataValid]) => {
      const isAhrsOk = ahrsState.current === undefined || ahrsState.current === AvionicsSystemState.On;

      if (isAhrsOk) {
        this.setDisplayState(isAttitudeDataValid ? 'ok' : 'failed');
      } else {
        this.setDisplayState(ahrsState.current === AvionicsSystemState.Initializing ? 'align' : 'failed');
      }
    }, true);

    this.needUpdateRoll = true;
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
      this.rollTransform.set(0, 0, 1, -this.props.projection.getRoll(), 0.1);
      this.bankStyle.set('transform', this.rollTransform.resolve());
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
          {this.renderRollScale()}
        </div>
        <div class='attitude-cutout'>
          <div class='attitude-inner-bank' style={this.bankStyle}>
            <PitchLadder
              ref={this.pitchLadderRef}
              projection={this.props.projection}
              isSVTEnabled={this.props.isSVTEnabled}
              {...this.props.pitchLadderOptions}
            />
          </div>
        </div>
        <svg viewBox='0 0 414 315' class='attitude-roll-pointer'>
          <path d='M 207 204 m 0 -180 l -10 20 l 20 0 l -10 -20' />
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

  /**
   * Renders this indicator's roll scale.
   * @returns This indicator's roll scale, as a VNode.
   */
  private renderRollScale(): VNode {
    const lowBankAngleRad = this.props.rollScaleOptions.lowBankAngle === undefined
      ? undefined
      : this.props.rollScaleOptions.lowBankAngle * Avionics.Utils.DEG2RAD;

    return (
      <>
        <svg viewBox='0 0 414 315' class='attitude-roll-scale'>
          <path d='M 207 21 l -10 -20 l 20 0 z' class='attitude-roll-scale-zero' />
          {this.props.rollScaleOptions.showArc && <path d='M 49.38 113 A 182 182 0 0 1 364.62 113' class='attitude-roll-scale-arc-outline' />}
          <path d='M 116 46.38 L 101 20.4 M 298 46.38 L 313 20.4 M 49.38 113 L 23.4 98 M 364.62 113 L 390.6 98 M 175.4 24.76 L 172.79 9.99 M 238.6 24.76 L 241.21 9.99 M 144.75 32.98 L 139.62 18.88 M 269.25 32.98 L 274.38 18.88 M 78.31 75.31 L 67.7 64.7 M 335.69 75.31 L 346.3 64.7' class='attitude-roll-scale-ticks-outline' />
          {this.props.rollScaleOptions.showArc && <path d='M 49.38 113 A 182 182 0 0 1 364.62 113' class='attitude-roll-scale-arc-stroke' />}
          <path d='M 116 46.38 L 101 20.4 M 298 46.38 L 313 20.4 M 49.38 113 L 23.4 98 M 364.62 113 L 390.6 98 M 175.4 24.76 L 172.79 9.99 M 238.6 24.76 L 241.21 9.99 M 144.75 32.98 L 139.62 18.88 M 269.25 32.98 L 274.38 18.88 M 78.31 75.31 L 67.7 64.7 M 335.69 75.31 L 346.3 64.7' class='attitude-roll-scale-ticks-stroke' />
        </svg>
        {lowBankAngleRad !== undefined && (
          <svg viewBox='0 0 414 315' class='attitude-roll-scale-low-bank' style={this.lowBankStyle}>
            <path d={`M ${207 + Math.cos(-MathUtils.HALF_PI - lowBankAngleRad) * 182} ${204 + Math.sin(-MathUtils.HALF_PI - lowBankAngleRad) * 182} A 182 182 0 0 1 ${207 + Math.cos(-MathUtils.HALF_PI + lowBankAngleRad) * 182} ${204 + Math.sin(-MathUtils.HALF_PI + lowBankAngleRad) * 182}`} />
          </svg>
        )}
      </>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.turnCoordinatorBallSource.destroy();
    this.ahrsState.destroy();
    this.isAttitudeDataValid.destroy();

    this.ahrsIndexSub?.destroy();
    this.lowBankSub?.destroy();

    this.pitchLadderRef.getOrDefault()?.destroy();
    this.slipSkidRef.getOrDefault()?.destroy();

    super.destroy();
  }
}

/**
 * Styling options for the pitch ladder.
 */
export type PitchLadderStyles = {
  /** The increment, in degrees, between major pitch lines. */
  majorLineIncrement: number;

  /** The number of medium pitch lines for each major pitch line. */
  mediumLineFactor: number;

  /** The number of minor pitch lines for each medium pitch line. */
  minorLineFactor: number;

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

  /** The minimum positive pitch value at which to display warning chevrons. */
  chevronThresholdPositive: number;

  /** The maximum negative pitch value at which to display warning chevrons. */
  chevronThresholdNegative: number;
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

    this.translation.sub(translation => {
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
    // Approximate translation due to pitch using a constant pitch resolution (pixels per degree of pitch) derived
    // from the projection's current field of view. This approximation always keeps the pitch ladder reading at the
    // center of the projection (i.e. at the symbolic aircraft reference) accurate. However, the error increases as
    // distance from the center of the projection increases because the true pitch resolution is not constant
    // throughout screen space. To get a truly accurate pitch ladder, we would need to project and position each pitch
    // line individually. Doing this via SVG is too performance-intensive (we would be redrawing the SVG every frame
    // that the pitch ladder is moving) and doing it via canvas looks horrible due to it not being able to draw text
    // with sub-pixel resolution.

    this.translation.set(MathUtils.round(this.props.projection.getPitch() * this.pitchResolution, 0.1));
  }

  /**
   * Rebuilds this ladder.
   */
  private rebuildLadder(): void {
    this.pitchResolution = this.props.projection.getScaleFactor() / this.props.projection.getFov();
    const styles = this.props.isSVTEnabled.get() ? this.props.svtEnabledStyles : this.props.svtDisabledStyles;

    this.svgRef.instance.innerHTML = '';

    const majorLineSeparation = styles.majorLineIncrement * this.pitchResolution;
    const minorFactor = styles.minorLineFactor * styles.mediumLineFactor;
    const minorIncrement = styles.majorLineIncrement / minorFactor;
    const len = Math.floor(90 / minorIncrement);
    for (let i = 1; i <= len; i++) {
      const pitch = i * minorIncrement;
      const y = pitch * this.pitchResolution;

      let lineLength: number | undefined;
      let showNumber = false;

      if (i % minorFactor === 0) {
        // major line
        lineLength = styles.majorLineLength;
        showNumber = styles.majorLineShowNumber;
      } else if (i % styles.minorLineFactor === 0 && pitch <= styles.mediumLineMaxPitch) {
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

          if (i % minorFactor === 0) {
            // major line

            const lastMajorPitch = pitch - styles.majorLineIncrement;
            const widthFactor = 0.5 + (pitch / 90) * 0.5;
            const height = 0.9 * majorLineSeparation;
            const width = lineLength * widthFactor;
            const legWidth = width * 0.3;

            // positive pitch chevron
            if (lastMajorPitch >= styles.chevronThresholdPositive) {
              FSComponent.render(this.renderChevron(-y + majorLineSeparation / 2, height, width, legWidth, 1), this.svgRef.instance);
            }

            // negative pitch chevron
            if (lastMajorPitch >= styles.chevronThresholdNegative) {
              FSComponent.render(this.renderChevron(y - majorLineSeparation / 2, height, width, legWidth, -1), this.svgRef.instance);
            }
          }
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

  /**
   * Renders a warning chevron.
   * @param centerY The y coordinate of the center of the chevron, in pixels.
   * @param height The height of the chevron, in pixels.
   * @param width The width of the chevron, in pixels.
   * @param legWidth The width of each leg of the chevron, in pixels.
   * @param direction The direction in which the chevron is pointed: `1` for the positive y direction, `-1` for the
   * negative y direction.
   * @returns A warning chevron, as a VNode.
   */
  private renderChevron(centerY: number, height: number, width: number, legWidth: number, direction: 1 | -1): VNode {
    const top = centerY - height / 2 * direction;
    const bottom = centerY + height / 2 * direction;
    const halfWidth = width / 2;
    const halfLegWidth = legWidth / 2;
    const legJoinHeight = legWidth * height / (width - legWidth);

    return (
      <path d={`M ${-halfLegWidth} ${bottom} L ${-width / 2} ${top} L ${-halfWidth + legWidth} ${top} L ${0} ${bottom - legJoinHeight * direction} L ${halfWidth - legWidth} ${top} L ${halfWidth} ${top} L ${halfLegWidth} ${bottom} Z`} >.</path>
    );
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