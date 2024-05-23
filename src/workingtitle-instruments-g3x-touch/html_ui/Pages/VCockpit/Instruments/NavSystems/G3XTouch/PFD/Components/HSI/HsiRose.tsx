import {
  BasicNavAngleSubject, BasicNavAngleUnit, ComponentProps, CssTransformBuilder, CssTransformSubject, DisplayComponent,
  FSComponent, MappedSubject, MathUtils, NavSourceType, NumberFormatter, NumberUnitSubject, ObjectSubject, Subject,
  Subscribable, SubscribableMapFunctions, SubscribableUtils, Subscription, UnitType, VNode
} from '@microsoft/msfs-sdk';

import {
  BearingDisplay, CdiScaleFormatter, CDIScaleLabel, NumberUnitDisplay, ObsSuspModes, TouchButton, TurnRateProps,
  UnitsNavAngleSettingMode, UnitsUserSettingManager
} from '@microsoft/msfs-garminsdk';

import { RadiosConfig } from '../../../Shared/AvionicsConfig/RadiosConfig';
import { G3XFailureBox } from '../../../Shared/Components/Common/G3XFailureBox';
import { G3XFplSource } from '../../../Shared/FlightPlan/G3XFplSourceTypes';
import { NavSourceFormatter } from '../../../Shared/Graphics/Text/NavSourceFormatter';
import { HsiActiveNavNeedle, HsiActiveNavNeedleProps } from './HsiActiveNavNeedle';
import { HsiBearingPointer, HsiBearingPointerProps } from './HsiBearingPointer';
import { HsiCompass } from './HsiCompass';
import { HsiDataProvider } from './HsiDataProvider';
import { HsiOrientationMode } from './HsiTypes';
import { TurnRateIndicator } from './TurnRateIndicator';

import './HsiRose.css';

/**
 * Turn rate indicator configuration options for {@link HsiRose}. 
 */
export type HsiRoseTurnRateIndicatorOptions = Required<Pick<
  TurnRateProps,
  'height' | 'tickOffset' | 'tickLength' | 'vectorOffset' | 'vectorWidth' | 'vectorArrowWidth' | 'vectorArrowLength'
>>;

/**
 * Active nav course needle configuration options for {@link HsiRose}. 
 */
export type HsiActiveNavNeedleOptions = Pick<
  HsiActiveNavNeedleProps,
  'deviationScaleLength' | 'deviationDotSize' | 'stemOuterRadius' | 'stemInnerRadius' | 'stemDeviationOuterRadius' | 'stemWidth'
  | 'arrowLength' | 'arrowWidth' | 'toFromArrowOuterRadius' | 'toFromArrowLength' | 'toFromArrowWidth'
>;

/**
 * Bearing pointer configuration options for {@link HsiRose}. 
 */
export type HsiBearingPointerOptions = Pick<
  HsiBearingPointerProps,
  'stemOuterRadius' | 'stemInnerRadius' | 'stemWidth' | 'arrowOuterRadius' | 'arrowLength' | 'arrowWidth'
>;

/**
 * Configuration options for {@link HsiRose}. 
 */
export type HsiRoseOptions = {
  /** The radius of the rose compass, in pixels. */
  compassRadius: number;

  /** The radius of the bearing pointer circle, in pixels. */
  bearingPointerCircleRadius: number;

  /** Options with which to configure the turn rate indicator. */
  turnRateIndicatorOptions: Readonly<HsiRoseTurnRateIndicatorOptions>;

  /** Options with which to configure the active course needle. */
  activeNavNeedleOptions: Readonly<HsiActiveNavNeedleOptions>;

  /** Options with which to configure the bearing pointers. */
  bearingPointerOptions: Readonly<HsiBearingPointerOptions>;
};

/**
 * Component props for {@link HsiRose}.
 */
export interface HsiRoseProps extends ComponentProps {
  /** Whether the rose should be visible. */
  show: Subscribable<boolean>;

  /** A provider of HSI data. */
  dataProvider: HsiDataProvider;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** A configuration object defining options for radios. */
  radiosConfig: RadiosConfig;

  /** A callback function which will be called every time the rose is pressed. */
  onPressed?: () => void;

  /** Options with which to configure the rose. */
  options: Readonly<HsiRoseOptions>;
}

/**
 * An HSI rose.
 */
export class HsiRose extends DisplayComponent<HsiRoseProps> {
  private thisNode?: VNode;

  private readonly turnRateIndicatorRef = FSComponent.createRef<TurnRateIndicator>();

  private readonly rootHidden = Subject.create(false);

  private readonly headingReadoutHidden = Subject.create(false);
  private readonly trackReadoutHidden = this.headingReadoutHidden.map(SubscribableMapFunctions.not());

  private readonly compassRotationTransform = CssTransformSubject.create(CssTransformBuilder.rotate3d('deg'));

  private readonly headingPointerTransform = CssTransformSubject.create(CssTransformBuilder.rotate3d('deg'));

  private readonly trackHidden = Subject.create(false);
  private readonly trackTransform = CssTransformSubject.create(CssTransformBuilder.rotate3d('deg'));

  private readonly headingBugTransform = CssTransformSubject.create(CssTransformBuilder.rotate3d('deg'));

  private readonly airplaneIconTransform = CssTransformSubject.create(CssTransformBuilder.rotate3d('deg'));

  private readonly xtkStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly headingState = MappedSubject.create(
    this.props.dataProvider.headingMag,
    this.props.dataProvider.magVar
  ).pause();
  private readonly headingValue = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(0));

  private readonly trackState = MappedSubject.create(
    this.props.dataProvider.trackMag,
    this.props.dataProvider.magVar
  ).pause();
  private readonly trackValue = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(0));

  private readonly magVarCorrection = Subject.create(0);

  private readonly nominalHeading = MappedSubject.create(
    ([headingMag, magVarCorrection]): number => {
      return headingMag + magVarCorrection;
    },
    this.props.dataProvider.headingMag,
    this.magVarCorrection
  ).pause();
  private readonly compassRotation = Subject.create(0);

  private readonly nominalTrack = MappedSubject.create(
    ([trackMag, magVarCorrection]): number => {
      return (trackMag ?? NaN) + magVarCorrection;
    },
    SubscribableUtils.NUMERIC_NAN_EQUALITY,
    this.props.dataProvider.trackMag,
    this.magVarCorrection
  );

  private readonly nominalSelectedHeading = MappedSubject.create(
    ([selectedHeadingMag, magVarCorrection]): number => {
      return selectedHeadingMag + magVarCorrection;
    },
    this.props.dataProvider.selectedHeadingMag,
    this.magVarCorrection
  );

  private readonly isBearingPointerCircleHidden = MappedSubject.create(
    ([source1, source2]): boolean => {
      return source1 === null && source2 === null;
    },
    this.props.dataProvider.bearing1Indicator.source,
    this.props.dataProvider.bearing2Indicator.source
  );

  private readonly navSourceCssClassSubscribable = this.props.dataProvider.externalFplSourceCount > 0
    ? MappedSubject.create(
      ([activeNavSource, fplSource]) => {
        if (activeNavSource?.getType() === NavSourceType.Gps) {
          switch (fplSource) {
            case G3XFplSource.Internal:
              return 'hsi-rose-nav-source hsi-rose-nav-source-int';
            case G3XFplSource.InternalRev:
              return 'hsi-rose-nav-source hsi-rose-nav-source-rev';
          }
        }

        return 'hsi-rose-nav-source';
      },
      this.props.dataProvider.activeNavIndicator.source,
      this.props.dataProvider.fplSource
    ).pause()
    : undefined;
  private readonly navSourceCssClass = this.navSourceCssClassSubscribable ?? 'hsi-rose-nav-source';
  private readonly navSourceText = MappedSubject.create(
    NavSourceFormatter.createForIndicator(
      this.props.dataProvider.externalFplSourceCount > 1,
      this.props.radiosConfig.navCount > 1,
      true
    ).bind(undefined, this.props.dataProvider.activeNavIndicator),
    this.props.dataProvider.activeNavIndicator.source,
    this.props.dataProvider.activeNavIndicator.isLocalizer
  ).pause();

  private readonly navSensitivityHidden = this.props.dataProvider.activeNavIndicator.source.map(source => {
    return source?.getType() !== NavSourceType.Gps;
  }).pause();
  private readonly navSensitivityValueHidden = this.props.dataProvider.activeNavIndicator.signalStrength.map(signalStrength => {
    return signalStrength === 0;
  }).pause();
  private readonly navSensitivityText = Subject.create('');
  private readonly navSensitivityUnitText = Subject.create('');
  private readonly navSensitivityFlagCssClassSubscribable = this.props.dataProvider.externalFplSourceCount > 0
    ? this.props.dataProvider.fplSource.map(source => {
      switch (source) {
        case G3XFplSource.Internal:
          return 'hsi-rose-nav-sensitivity-flag';
        case G3XFplSource.InternalRev:
          return 'hsi-rose-nav-sensitivity-flag hsi-rose-nav-sensitivity-flag-rev';
        default:
          return 'hsi-rose-nav-sensitivity-flag hidden';
      }
    }).pause()
    : undefined;
  private readonly navSensitivityFlagCssClass = this.navSensitivityFlagCssClassSubscribable ?? 'hsi-rose-nav-sensitivity-flag hidden';

  private readonly isXtkVisible = MappedSubject.create(
    ([activeNavSource, lnavXtk, cdiScale]): boolean => {
      return activeNavSource !== null && activeNavSource.getType() === NavSourceType.Gps && lnavXtk !== null && Math.abs(lnavXtk) >= (cdiScale ?? 0);
    },
    this.props.dataProvider.activeNavIndicator.source,
    this.props.dataProvider.lnavXtk,
    this.props.dataProvider.activeNavIndicator.lateralDeviationScale
  ).pause();
  private readonly lnavXtkPrecision = this.props.unitsSettingManager.distanceUnitsLarge.map(unit => unit.convertTo(0.01, UnitType.NMILE)).pause();
  private readonly lnavXtk = NumberUnitSubject.create(UnitType.NMILE.createNumber(0));

  private readonly obsSuspText = this.props.dataProvider.obsSuspMode.map(mode => {
    switch (mode) {
      case ObsSuspModes.OBS:
        return 'OBS';
      case ObsSuspModes.SUSP:
        return 'SUSP';
      default:
        return '';
    }
  }).pause();

  private readonly showHdgFailureBox = MappedSubject.create(
    ([isDataFailed, isAhrsAligning]) => isDataFailed && !isAhrsAligning,
    this.props.dataProvider.isHeadingDataFailed,
    this.props.dataProvider.isAhrsAligning
  ).pause();

  private showSub?: Subscription;

  private magVarCorrectionPipe?: Subscription;
  private navAngleUnitsSub?: Subscription;
  private orientationModeSub?: Subscription;
  private turnRateSub?: Subscription;
  private isHeadingDataFailedSub?: Subscription;

  private navSensitivitySub?: Subscription;

  private lnavXtkPipe?: Subscription;
  private lnavXtkPrecisionSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    // ---- Heading readout ----

    this.headingState.sub(([headingMag, magVar]) => {
      this.headingValue.set(headingMag, magVar);
    }, true);

    // ---- Track readout ----

    this.trackState.sub(([trackMag, magVar]) => {
      this.trackValue.set(trackMag ?? 0, magVar);
    }, true);

    // ---- Compass rotation ----

    const magVarCorrectionPipe = this.magVarCorrectionPipe = this.props.dataProvider.magVar.pipe(this.magVarCorrection, true);

    const navAngleUnitsSub = this.navAngleUnitsSub = this.props.unitsSettingManager.getSetting('unitsNavAngle').sub(navAngleUnits => {
      if (navAngleUnits === UnitsNavAngleSettingMode.Magnetic) {
        magVarCorrectionPipe.pause();
        this.magVarCorrection.set(0);
      } else {
        magVarCorrectionPipe.resume(true);
      }
    }, false, true);

    const headingPipe = this.nominalHeading.pipe(this.compassRotation, heading => MathUtils.round(-heading, 0.1), true);
    const trackPipe = this.nominalTrack.pipe(this.compassRotation, track => MathUtils.round(-track, 0.1), true);

    this.compassRotation.sub(rotation => {
      this.compassRotationTransform.transform.set(0, 0, 1, rotation);
      this.compassRotationTransform.resolve();
    }, true);

    // ---- Heading pointer rotation ----

    const headingPointerRotationSub = this.nominalHeading.sub(heading => {
      this.headingPointerTransform.transform.set(0, 0, 1, heading, 0.1);
      this.headingPointerTransform.resolve();
    }, false, true);

    // ---- Track bug rotation ----

    const trackRotationSub = this.nominalTrack.sub(track => {
      if (isFinite(track)) {
        this.trackHidden.set(false);
        this.trackTransform.transform.set(0, 0, 1, track, 0.1);
        this.trackTransform.resolve();
      } else {
        this.trackHidden.set(true);
      }
    }, false, true);

    // ---- Heading bug rotation ----

    const headingBugRotationSub = this.nominalSelectedHeading.sub(heading => {
      this.headingBugTransform.transform.set(0, 0, 1, heading, 0.1);
      this.headingBugTransform.resolve();
    }, false, true);

    // ---- Airplane icon rotation ----

    const airplaneIconRotationSub = this.nominalHeading.sub(heading => {
      this.airplaneIconTransform.transform.set(0, 0, 1, heading, 0.1);
      this.airplaneIconTransform.resolve();
    }, false, true);

    // ---- Turn rate ----

    const turnRateSub = this.turnRateSub = this.props.dataProvider.turnRate.sub(turnRate => {
      this.turnRateIndicatorRef.instance.setTurnRate(turnRate);
    }, false, true);

    // ---- Orientation ----

    const orientationSub = this.orientationModeSub = this.props.dataProvider.orientationMode.sub(mode => {
      if (mode === HsiOrientationMode.Heading) {
        this.trackState.pause();
        this.headingState.resume();

        trackPipe.pause();
        headingPipe.resume(true);
        headingPointerRotationSub.pause();

        this.headingReadoutHidden.set(false);
      } else {
        this.headingState.pause();
        this.trackState.resume();

        headingPipe.pause();
        trackPipe.resume(true);
        headingPointerRotationSub.resume(true);

        this.headingReadoutHidden.set(true);
      }
    }, false, true);

    // ---- Data failure ----

    const isHeadingDataFailedSub = this.isHeadingDataFailedSub = this.props.dataProvider.isHeadingDataFailed.sub(isFailed => {
      if (isFailed) {
        this.headingState.pause();
        this.trackState.pause();

        magVarCorrectionPipe.pause();
        navAngleUnitsSub.pause();

        this.nominalHeading.pause();
        this.nominalTrack.pause();

        orientationSub.pause();
        headingPipe.pause();
        trackPipe.pause();
        this.headingReadoutHidden.set(false);
        this.compassRotation.set(0);

        headingPointerRotationSub.pause();

        trackRotationSub.pause();

        this.nominalSelectedHeading.pause();
        headingBugRotationSub.pause();

        airplaneIconRotationSub.pause();
        this.airplaneIconTransform.transform.set(0, 0, 1, 0);
        this.airplaneIconTransform.resolve();

        turnRateSub.pause();
        this.turnRateIndicatorRef.instance.setTurnRate(0);
      } else {
        navAngleUnitsSub.resume(true);

        this.nominalHeading.resume();
        this.nominalTrack.resume();

        orientationSub.resume(true);

        trackRotationSub.resume(true);

        this.nominalSelectedHeading.resume();
        headingBugRotationSub.resume(true);

        airplaneIconRotationSub.resume(true);

        turnRateSub.resume(true);
      }
    }, false, true);

    // ---- Nav source and sensitivity ----

    const cdiScaleFormatter = CdiScaleFormatter.create(false);
    const navSensitivitySub = this.navSensitivitySub = this.props.dataProvider.activeNavIndicator.lateralDeviationScalingMode.sub(label => {
      switch (label) {
        case null:
          this.navSensitivityText.set('');
          this.navSensitivityUnitText.set('');
          break;
        case CDIScaleLabel.VfrEnroute:
          this.navSensitivityText.set('5.00');
          this.navSensitivityUnitText.set('NM');
          break;
        case CDIScaleLabel.VfrTerminal:
          this.navSensitivityText.set('1.25');
          this.navSensitivityUnitText.set('NM');
          break;
        case CDIScaleLabel.VfrApproach:
          this.navSensitivityText.set('0.25');
          this.navSensitivityUnitText.set('NM');
          break;
        default:
          this.navSensitivityText.set(cdiScaleFormatter(label));
          this.navSensitivityUnitText.set('');
      }
    }, false, true);

    const navSensitivityHiddenSub = this.navSensitivityHidden.sub(hidden => {
      if (hidden) {
        this.navSensitivityValueHidden.pause();
        navSensitivitySub.pause();
        this.navSensitivityFlagCssClassSubscribable?.pause();
      } else {
        this.navSensitivityValueHidden.resume();
        navSensitivitySub.resume(true);
        this.navSensitivityFlagCssClassSubscribable?.resume();
      }
    }, false, true);

    // ---- LNAV XTK ----

    const lnavXtkPipe = this.lnavXtkPipe = this.props.dataProvider.lnavXtk.pipe(this.lnavXtk, xtk => {
      return xtk === null ? 0 : MathUtils.round(Math.abs(xtk), this.lnavXtkPrecision.get());
    }, true);

    const isXtkVisibleSub = this.isXtkVisible.sub((isVisible) => {
      if (isVisible) {
        this.xtkStyle.set('display', '');
        this.lnavXtkPrecision.resume();
        lnavXtkPipe.resume(true);
      } else {
        this.xtkStyle.set('display', 'none');
        this.lnavXtkPrecision.pause();
        lnavXtkPipe.pause();
      }
    }, false, true);

    // ---- Visibility ----

    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.rootHidden.set(false);

        isHeadingDataFailedSub.resume(true);

        this.isBearingPointerCircleHidden.resume();

        this.navSourceCssClassSubscribable?.resume();
        this.navSourceText.resume();
        this.navSensitivityHidden.resume();
        navSensitivityHiddenSub.resume(true);

        this.obsSuspText.resume();

        this.isXtkVisible.resume();
        isXtkVisibleSub.resume(true);

        this.showHdgFailureBox.resume();
      } else {
        this.rootHidden.set(true);

        isHeadingDataFailedSub.pause();

        this.headingState.pause();
        this.trackState.pause();

        magVarCorrectionPipe.pause();
        navAngleUnitsSub.pause();

        this.nominalHeading.pause();
        this.nominalTrack.pause();

        orientationSub.pause();
        headingPipe.pause();
        trackPipe.pause();

        headingPointerRotationSub.pause();

        trackRotationSub.pause();

        this.nominalSelectedHeading.pause();
        headingBugRotationSub.pause();

        turnRateSub.pause();

        this.isBearingPointerCircleHidden.pause();

        this.navSourceCssClassSubscribable?.pause();
        this.navSourceText.pause();
        this.navSensitivityHidden.pause();
        navSensitivityHiddenSub.pause();
        this.navSensitivityValueHidden.pause();
        navSensitivitySub.pause();
        this.navSensitivityFlagCssClassSubscribable?.pause();

        this.obsSuspText.pause();

        this.isXtkVisible.pause();
        isXtkVisibleSub.pause();
        this.lnavXtkPrecision.pause();
        lnavXtkPipe.pause();

        this.showHdgFailureBox.pause();
      }
    }, true);
  }

  /** @inheritDoc */
  public render(): VNode {
    const compassRadius = this.props.options.compassRadius;
    const compassDiameter = compassRadius * 2;

    const rotatingStyle = {
      'position': 'absolute',
      'left': `${-compassRadius}px`,
      'top': `${-compassRadius}px`,
      'width': `${compassDiameter}px`,
      'height': `${compassDiameter}px`,
      'transform': this.compassRotationTransform
    };

    return (
      <div class={{ 'hsi-rose': true, 'hidden': this.rootHidden }} style='width: 0px; height: 0px;'>
        <div class='hsi-rose-checklist-box' data-checklist='checklist-hsi-rose' />

        <div class='hsi-rose-outer-tick-container' style='position: absolute; left: 0px; top: 0px; width: 0px; height: 0px;'>
          {[45, 90, 135, 225, 270, 315].map(angle => {
            return (
              <div class='hsi-rose-outer-tick' style={`transform: rotate(${angle}deg)`} />
            );
          })}
        </div>

        <div class='hsi-rose-rotating' style={rotatingStyle}>
          <HsiCompass
            size={compassDiameter}
            labelOffset={40}
            tickLengthSmall={6}
            tickLengthMedium={12}
            tickLengthLarge={24}
            rotation={this.compassRotation}
          />
        </div>

        <svg viewBox={`${-compassRadius} ${-compassRadius} ${compassDiameter} ${compassDiameter}`} class={{ 'hsi-rose-bearing-pointer-circle': true, 'hidden': this.isBearingPointerCircleHidden }}>
          <circle cx={0} cy={0} r={this.props.options.bearingPointerCircleRadius} />
        </svg>

        <TurnRateIndicator
          ref={this.turnRateIndicatorRef}
          compassRadius={this.props.options.compassRadius}
          {...this.props.options.turnRateIndicatorOptions}
        />

        <div class={{ 'hsi-rose-rotating': true, 'hidden': this.trackReadoutHidden }} style={rotatingStyle}>
          <svg viewBox='-4 -10 8 10' preserveAspectRatio='none' class='hsi-rose-hdg-pointer' style={{ 'transform': this.headingPointerTransform }}>
            <path d='M -4 -10 l 8 0 l -4 10 Z' vector-effect='non-scaling-stroke' />
          </svg>
        </div>

        <div class={{ 'hsi-rose-hdgtrk-readout': true, 'hsi-rose-trk-readout': true, 'hidden': this.trackReadoutHidden }}>
          <div class='hsi-rose-trk-readout-title'>TRK</div>
          <BearingDisplay
            value={this.trackValue}
            displayUnit={this.props.unitsSettingManager.navAngleUnits}
            formatter={NumberFormatter.create({ precision: 1, pad: 3 })}
            class='hsi-rose-hdgtrk-readout-value'
          />
        </div>

        <svg viewBox='-8 0 16 11' preserveAspectRatio='none' class={{ 'hsi-rose-index-pointer': true, 'hidden': this.trackReadoutHidden }}>
          <path d='M -8 0 l 16 0 l -8 11 Z' class='hsi-rose-index-pointer-background' />
          <path d='M -8 0 l 16 0 l -8 8 Z' class='hsi-rose-index-pointer-foreground' />
        </svg>

        <div class='hsi-rose-rotating' style={rotatingStyle}>
          <div
            class={{ 'hsi-rose-track-container': true, 'hidden': this.trackHidden }}
            style={{
              'position': 'absolute',
              'left': '50%',
              'top': '50%',
              'width': '0px',
              'height': '0px',
              'transform': this.trackTransform
            }}
          >
            <svg viewBox='-7 -7 14 7' preserveAspectRatio='none' class='hsi-rose-track-pointer'>
              <path d='M -7 -7 l 14 0 l -7 7 Z' vector-effect='non-scaling-stroke' />
            </svg>
            <svg
              viewBox={`-1 ${-compassRadius} 2 ${compassRadius}`}
              class='hsi-rose-track-line'
              style={`position: absolute; left: -1px; bottom: 0px; width: 2px; height: ${compassRadius}px`}
            >
              <path d={`M 0 0 l 0 ${-compassRadius}`} vector-effect='non-scaling-stroke' class='hsi-rose-track-line-outline' />
              <path d={`M 0 0 l 0 ${-compassRadius}`} vector-effect='non-scaling-stroke' class='hsi-rose-track-line-stroke' />
            </svg>
          </div>

          <HsiBearingPointer
            index={1}
            navIndicator={this.props.dataProvider.bearing1Indicator}
            magVarCorrection={this.magVarCorrection}
            isHeadingDataFailed={this.props.dataProvider.isHeadingDataFailed}
            isActive={this.props.show}
            {...this.props.options.bearingPointerOptions}
          />
          <HsiBearingPointer
            index={2}
            navIndicator={this.props.dataProvider.bearing2Indicator}
            magVarCorrection={this.magVarCorrection}
            isHeadingDataFailed={this.props.dataProvider.isHeadingDataFailed}
            isActive={this.props.show}
            {...this.props.options.bearingPointerOptions}
          />
        </div>

        <div class={{ 'hsi-rose-hdgtrk-readout': true, 'hsi-rose-hdg-readout': true, 'hidden': this.headingReadoutHidden }}>
          <BearingDisplay
            value={this.headingValue}
            displayUnit={this.props.unitsSettingManager.navAngleUnits}
            formatter={NumberFormatter.create({ precision: 1, pad: 3 })}
            class='hsi-rose-hdgtrk-readout-value'
          />
          <G3XFailureBox
            show={this.showHdgFailureBox}
            label='HDG'
            class='hsi-rose-hdg-failure-box'
          />
        </div>

        <svg viewBox='-8 0 16 11' preserveAspectRatio='none' class={{ 'hsi-rose-index-pointer': true, 'hidden': this.headingReadoutHidden }}>
          <path d='M -8 0 l 16 0 l -8 11 Z' class='hsi-rose-index-pointer-background' />
          <path d='M -8 0 l 16 0 l -8 8 Z' class='hsi-rose-index-pointer-foreground' />
        </svg>

        <div class={this.navSourceCssClass}>
          <div class='hsi-rose-nav-source-value'>{this.navSourceText}</div>
          <div class='hsi-rose-nav-source-flag hsi-rose-nav-source-flag-int'>INT</div>
          <div class='hsi-rose-nav-source-flag hsi-rose-nav-source-flag-rev'>REV</div>
        </div>

        <div class={{ 'hsi-rose-nav-sensitivity': true, 'hidden': this.navSensitivityHidden }}>
          <div class={{ 'hsi-rose-nav-sensitivity-value': true, 'hidden': this.navSensitivityValueHidden }}>
            <span>{this.navSensitivityText}</span>
            <span class='hsi-rose-nav-sensitivity-value-unit'>{this.navSensitivityUnitText}</span>
          </div>
          <div class={this.navSensitivityFlagCssClass}>VFR</div>
        </div>

        <div class='hsi-rose-susp'>{this.obsSuspText}</div>

        <div class='hsi-rose-xtk' style={this.xtkStyle}>
          <span class='hsi-rose-xtk-title'>XTK </span>
          <NumberUnitDisplay
            value={this.lnavXtk}
            displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
            formatter={NumberFormatter.create({ precision: 0.01, maxDigits: 3 })}
            class='hsi-rose-xtk-value'
          />
        </div>

        <div class='hsi-rose-rotating' style={rotatingStyle}>
          <HsiActiveNavNeedle
            navIndicator={this.props.dataProvider.activeNavIndicator}
            magVarCorrection={this.magVarCorrection}
            isHeadingDataFailed={this.props.dataProvider.isHeadingDataFailed}
            isActive={this.props.show}
            {...this.props.options.activeNavNeedleOptions}
          />

          <svg viewBox='-12 -12 24 12' preserveAspectRatio='none' class='hsi-rose-hdg-bug' style={{ 'transform': this.headingBugTransform }}>
            <path d='M -12 -12 l 6 0 l 6 6 l 6 -6 l 6 0 l 0 12 l -24 0 Z' vector-effect='non-scaling-stroke' />
          </svg>

          <svg viewBox='-22 -22 44 44' class='hsi-rose-plane-icon' style={{ 'transform': this.airplaneIconTransform }}>
            <path d='M -20 2.5 l 0 -4 l 16 -7 l 0 -10 l 4 -3 l 4 3 l 0 10 l 16 7 l 0 4 l -16 0 l 0 12 l 5 5 l 0 2 l -18 0 l 0 -2 l 5 -5 l 0 -12 l -16 0 Z' />
          </svg>
        </div>

        <TouchButton
          onPressed={this.props.onPressed}
          class='hsi-rose-button'
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.headingState.destroy();
    this.trackState.destroy();
    this.nominalHeading.destroy();
    this.nominalTrack.destroy();
    this.nominalSelectedHeading.destroy();
    this.isBearingPointerCircleHidden.destroy();
    this.navSourceText.destroy();
    this.navSensitivityHidden.destroy();
    this.navSensitivityValueHidden.destroy();
    this.navSensitivityFlagCssClassSubscribable?.destroy();
    this.obsSuspText.destroy();
    this.isXtkVisible.destroy();
    this.lnavXtkPrecision.destroy();
    this.showHdgFailureBox.destroy();

    this.showSub?.destroy();

    this.magVarCorrectionPipe?.destroy();
    this.navAngleUnitsSub?.destroy();
    this.orientationModeSub?.destroy();
    this.turnRateSub?.destroy();
    this.isHeadingDataFailedSub?.destroy();

    this.navSensitivitySub?.destroy();

    this.lnavXtkPipe?.destroy();
    this.lnavXtkPrecisionSub?.destroy();

    super.destroy();
  }
}
