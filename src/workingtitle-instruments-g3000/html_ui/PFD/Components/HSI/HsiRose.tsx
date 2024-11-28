import {
  BasicNavAngleSubject, BasicNavAngleUnit, ComponentProps, DisplayComponent, EventBus, FSComponent, MappedSubject, MathUtils, NavSourceType,
  NumberFormatter, NumberUnitSubject, ObjectSubject, Subject, Subscribable, Subscription, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { CdiScaleFormatter, CDIScaleLabel, NumberUnitDisplay, ObsSuspModes, UnitsNavAngleSettingMode, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { BearingDisplay, NavSourceFormatter } from '@microsoft/msfs-wtg3000-common';

import { ActiveNavNeedle } from './ActiveNavNeedle';
import { ApproachPreviewNeedle } from './ApproachPreviewNeedle';
import { BearingPointer } from './BearingPointer';
import { HsiCompass } from './HsiCompass';
import { HsiDataProvider } from './HsiDataProvider';
import { TurnRateIndicator } from './TurnRateIndicator';

import './HsiRose.css';

/**
 * Component props for HsiRose.
 */
export interface HsiRoseProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** A provider of HSI data. */
  dataProvider: HsiDataProvider;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whther the rose should be visible. */
  show: Subscribable<boolean>;
}

/**
 * An HSI rose.
 */
export class HsiRose extends DisplayComponent<HsiRoseProps> {

  private readonly compassRef = FSComponent.createRef<HsiCompass>();
  private readonly activeNavNeedleRef = FSComponent.createRef<ActiveNavNeedle>();
  private readonly approachPreviewNeedleRef = FSComponent.createRef<ApproachPreviewNeedle>();
  private readonly turnRateIndicatorRef = FSComponent.createRef<TurnRateIndicator>();
  private readonly bearingPointer1Ref = FSComponent.createRef<BearingPointer>();
  private readonly bearingPointer2Ref = FSComponent.createRef<BearingPointer>();

  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly compassRotationStyle = ObjectSubject.create({
    transform: 'rotate3d(0, 0, 1, 0deg)'
  });

  private readonly bearingPointerCircleStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly trackBugStyle = ObjectSubject.create({
    transform: 'rotate3d(0, 0, 1, 0deg)'
  });

  private readonly headingBugStyle = ObjectSubject.create({
    transform: 'rotate3d(0, 0, 1, 0deg)'
  });

  private readonly navSensitivityStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly xtkStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly headingState = MappedSubject.create(
    this.props.dataProvider.headingMag,
    this.props.dataProvider.magVar
  ).pause();
  private readonly headingValue = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(0));

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
      return trackMag + magVarCorrection;
    },
    this.props.dataProvider.trackMag,
    this.magVarCorrection
  );
  private readonly trackBugRotation = Subject.create(0);

  private readonly nominalSelectedHeading = MappedSubject.create(
    ([selectedHeadingMag, magVarCorrection]): number => {
      return selectedHeadingMag + magVarCorrection;
    },
    this.props.dataProvider.selectedHeadingMag,
    this.magVarCorrection
  );
  private readonly headingBugRotation = Subject.create(0);

  private readonly isBearingPointerCircleVisible = MappedSubject.create(
    ([source1, source2]): boolean => {
      return source1 !== null || source2 !== null;
    },
    this.props.dataProvider.bearing1Indicator.source,
    this.props.dataProvider.bearing2Indicator.source
  );

  private readonly navSourceText = MappedSubject.create(
    NavSourceFormatter.createForIndicator('FMS', false, false, false, true).bind(undefined, this.props.dataProvider.activeNavIndicator),
    this.props.dataProvider.activeNavIndicator.source,
    this.props.dataProvider.activeNavIndicator.isLocalizer
  ).pause();

  private readonly isNavSensitivityVisible = this.props.dataProvider.activeNavIndicator.source.map(source => {
    return source?.getType() === NavSourceType.Gps;
  }).pause();
  private readonly navSensitivityText = Subject.create('');

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

  private readonly previewSourceText = MappedSubject.create(
    NavSourceFormatter.createForIndicator('FMS', false, false, false, true).bind(undefined, this.props.dataProvider.approachPreviewIndicator),
    this.props.dataProvider.approachPreviewIndicator.source,
    this.props.dataProvider.approachPreviewIndicator.isLocalizer
  ).pause();

  private readonly previewCourseText = MappedSubject.create(
    ([obsSuspText, course]) => {
      if (obsSuspText.length > 0 || course === null) {
        return '';
      }

      const rounded = Math.round(course) % 360;
      return `${(rounded === 0 ? 360 : rounded).toString().padStart(3, '0')}°`;
    },
    this.obsSuspText,
    this.props.dataProvider.approachPreviewIndicator.course
  ).pause();

  private showSub?: Subscription;

  private magVarCorrectionPipe?: Subscription;
  private navAngleUnitsSub?: Subscription;
  private turnRateSub?: Subscription;
  private isHeadingDataFailedSub?: Subscription;

  private navSensitivityPipe?: Subscription;

  private lnavXtkPipe?: Subscription;
  private lnavXtkPrecisionSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    // ---- Heading ----

    this.headingState.sub(([headingMag, magVar]) => {
      this.headingValue.set(headingMag, magVar);
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

    this.compassRotation.sub(rotation => { this.compassRotationStyle.set('transform', `rotate3d(0, 0, 1, ${rotation}deg)`); }, true);

    // ---- Track bug rotation ----

    const trackPipe = this.nominalTrack.pipe(this.trackBugRotation, track => MathUtils.round(track, 0.1), true);

    this.trackBugRotation.sub(rotation => { this.trackBugStyle.set('transform', `rotate3d(0, 0, 1, ${rotation}deg)`); }, true);

    // ---- Heading bug rotation ----

    const selectedHeadingPipe = this.nominalSelectedHeading.pipe(this.headingBugRotation, selectedHeading => MathUtils.round(selectedHeading, 0.1), true);

    this.headingBugRotation.sub(rotation => { this.headingBugStyle.set('transform', `rotate3d(0, 0, 1, ${rotation}deg)`); }, true);

    // ---- Turn rate ----

    const turnRateSub = this.turnRateSub = this.props.dataProvider.turnRate.sub(turnRate => {
      this.turnRateIndicatorRef.instance.setTurnRate(turnRate);
    }, false, true);

    // ---- Data failure ----

    const isHeadingDataFailedSub = this.isHeadingDataFailedSub = this.props.dataProvider.isHeadingDataFailed.sub(isFailed => {
      if (isFailed) {
        this.headingState.pause();

        magVarCorrectionPipe.pause();
        navAngleUnitsSub.pause();

        this.nominalHeading.pause();
        headingPipe.pause();
        this.compassRotation.set(0);

        this.nominalTrack.pause();
        trackPipe.pause();

        this.nominalSelectedHeading.pause();
        selectedHeadingPipe.pause();

        turnRateSub.pause();
        this.turnRateIndicatorRef.instance.setTurnRate(0);
      } else {
        this.headingState.resume();

        navAngleUnitsSub.resume(true);

        this.nominalHeading.resume();
        headingPipe.resume(true);

        this.nominalTrack.resume();
        trackPipe.resume(true);

        this.nominalSelectedHeading.resume();
        selectedHeadingPipe.resume(true);

        turnRateSub.resume(true);
      }
    }, false, true);

    // ---- Bearing pointers ----

    this.isBearingPointerCircleVisible.sub(isVisible => {
      this.bearingPointerCircleStyle.set('display', isVisible ? '' : 'none');
    }, true);

    // ---- Nav source and sensitivity ----

    // TODO: Figure out what determines if CDI scale labels are formatted with RNP values
    const cdiScaleFormatter = CdiScaleFormatter.create(false);
    const navSensitivityPipe = this.navSensitivityPipe = this.props.dataProvider.activeNavIndicator.lateralDeviationScalingMode.pipe(
      this.navSensitivityText,
      label => cdiScaleFormatter(label ?? CDIScaleLabel.Enroute),
      true
    );

    const isNavSensitivityVisibleSub = this.isNavSensitivityVisible.sub(isVisible => {
      if (isVisible) {
        this.navSensitivityStyle.set('display', '');
        navSensitivityPipe.resume(true);
      } else {
        this.navSensitivityStyle.set('display', 'none');
        navSensitivityPipe.pause();
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
        this.rootStyle.set('display', '');

        isHeadingDataFailedSub.resume(true);

        this.isBearingPointerCircleVisible.resume();

        this.navSourceText.resume();
        this.isNavSensitivityVisible.resume();
        isNavSensitivityVisibleSub.resume(true);

        this.previewSourceText.resume();
        this.previewCourseText.resume();

        this.obsSuspText.resume();

        this.isXtkVisible.resume();
        isXtkVisibleSub.resume(true);
      } else {
        this.rootStyle.set('display', 'none');

        isHeadingDataFailedSub.pause();

        this.headingState.pause();

        magVarCorrectionPipe.pause();
        navAngleUnitsSub.pause();

        this.nominalHeading.pause();
        headingPipe.pause();

        this.nominalTrack.pause();
        trackPipe.pause();

        this.nominalSelectedHeading.pause();
        selectedHeadingPipe.pause();

        turnRateSub.pause();

        this.isBearingPointerCircleVisible.pause();

        this.navSourceText.pause();
        this.isNavSensitivityVisible.pause();
        isNavSensitivityVisibleSub.pause();
        navSensitivityPipe.pause();

        this.previewSourceText.pause();
        this.previewCourseText.pause();

        this.obsSuspText.pause();

        this.isXtkVisible.pause();
        isXtkVisibleSub.pause();
        this.lnavXtkPrecision.pause();
        lnavXtkPipe.pause();
      }
    }, true);
  }

  /**
   * Builds the 4 tick marks on the outside of the compass rose.
   * @param radius The radius of the circle to build around.
   * @returns A collection of tick mark line elements.
   */
  public buildRoseOuterTicks(radius = 149): SVGLineElement[] {
    const lines: SVGLineElement[] = [];

    for (let i = 0; i < 360; i += 45) {
      if ((i == 0 || i >= 180) && i != 270) {
        const length = 16;

        const startX = 184 + (radius) * Math.cos(i * Math.PI / 180);
        const startY = 185 + (radius) * Math.sin(i * Math.PI / 180);

        const endX = startX + (length * Math.cos(i * Math.PI / 180));
        const endY = startY + (length * Math.sin(i * Math.PI / 180));

        lines.push(<line x1={startX} y1={startY} x2={endX} y2={endY} stroke="white" stroke-width="3px" />);
      }
    }

    return lines;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="hsi-rose" style={this.rootStyle}>
        <div class="hsi-rose-outer-ticks">
          <svg viewBox="0 0 368 330">
            <path d="m 184 185 m -20 1 l 0 -4 l 16 -7 l 0 -10 l 4 -3 l 4 3 l 0 10 l 16 7 l 0 4 l -16 0 l 0 12 l 5 5 l 0 2 l -18 0 l 0 -2 l 5 -5 l 0 -12 l -16 0 z" fill="white" />
            {this.buildRoseOuterTicks()}
          </svg>
        </div>

        <div class="hsi-rose-rotating" style={this.compassRotationStyle}>
          <HsiCompass
            ref={this.compassRef}
            size={292}
            majorTickLength={15}
            minorTickLength={8}
            labelOffset={20}
          />

          <BearingPointer
            ref={this.bearingPointer1Ref}
            hsiMap={false}
            index={1}
            navIndicator={this.props.dataProvider.bearing1Indicator}
            magVarCorrection={this.magVarCorrection}
            isHeadingDataFailed={this.props.dataProvider.isHeadingDataFailed}
            isActive={this.props.show}
          />
          <BearingPointer
            ref={this.bearingPointer2Ref}
            hsiMap={false}
            index={2}
            navIndicator={this.props.dataProvider.bearing2Indicator}
            magVarCorrection={this.magVarCorrection}
            isHeadingDataFailed={this.props.dataProvider.isHeadingDataFailed}
            isActive={this.props.show}
          />

          <svg viewBox="0 0 368 368" class="hsi-rose-bearing-pointer-circle" style={this.bearingPointerCircleStyle}>
            <circle cx={184} cy={184} r={82} />
          </svg>

          <div class="hsi-rose-track-bug" style={this.trackBugStyle}>
            <svg>
              <path d="M 170 50 l 4 -9 l 0 -2 l -4 -9 l -4 9 l 0 2 z" fill="magenta" stroke="black" stroke-width="1px" />
            </svg>
          </div>
        </div>

        <TurnRateIndicator ref={this.turnRateIndicatorRef} compassRadius={146} />

        <div class="hsi-rose-nav-source">{this.navSourceText}</div>
        <div class="hsi-rose-nav-sensitivity" style={this.navSensitivityStyle}>{this.navSensitivityText}</div>

        <div class="hsi-rose-preview-source">{this.previewSourceText}</div>
        <div class="hsi-rose-preview-course">{this.previewCourseText}</div>

        <div class="hsi-rose-susp">{this.obsSuspText}</div>

        <svg viewBox="0 0 16 20" class="hsi-rose-index-pointer">
          <path d="M 8 20 l 8 -20 l -16 0 l 8 20 z" />
        </svg>

        <div class="hsi-rose-rotating" style={this.compassRotationStyle}>
          <ApproachPreviewNeedle
            ref={this.approachPreviewNeedleRef}
            hsiMap={false}
            navIndicator={this.props.dataProvider.approachPreviewIndicator}
            magVarCorrection={this.magVarCorrection}
            isHeadingDataFailed={this.props.dataProvider.isHeadingDataFailed}
            maxCdiDeflection={1.25}
            isActive={this.props.show}
          />
        </div>

        <div class="hsi-rose-xtk" style={this.xtkStyle}>
          <div class="hsi-rose-xtk-title">XTK</div>
          <NumberUnitDisplay
            value={this.lnavXtk}
            displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
            formatter={NumberFormatter.create({ precision: 0.01, maxDigits: 3 })}
            class="hsi-rose-xtk-value"
          />
        </div>

        <div class="hsi-rose-rotating" style={this.compassRotationStyle}>
          <ActiveNavNeedle
            ref={this.activeNavNeedleRef}
            hsiMap={false}
            navIndicator={this.props.dataProvider.activeNavIndicator}
            magVarCorrection={this.magVarCorrection}
            isHeadingDataFailed={this.props.dataProvider.isHeadingDataFailed}
            maxCdiDeflection={1.25}
            isActive={this.props.show}
          />

          <div class="hsi-rose-hdg-bug" style={this.headingBugStyle}>
            <svg>
              <path d="M 184 184 m 0 -135 l 4 -9 l 7 0 l 0 12 l -22 0 l 0 -12 l 7 0 l 4 9 z" />
            </svg>
          </div>
        </div>

        <svg viewBox="-25 -25 50 50" class="hsi-rose-plane-icon">
          <path d="m -20 2.5 l 0 -4 l 16 -7 l 0 -10 l 4 -3 l 4 3 l 0 10 l 16 7 l 0 4 l -16 0 l 0 12 l 5 5 l 0 2 l -18 0 l 0 -2 l 5 -5 l 0 -12 l -16 0 z" />
        </svg>

        <div class="hsi-rose-hdg-box">
          <div class="failed-box" />
          <BearingDisplay
            value={this.headingValue}
            displayUnit={this.props.unitsSettingManager.navAngleUnits}
            formatter={NumberFormatter.create({ precision: 1, pad: 3 })}
            class="hsi-rose-hdg-box-value"
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.compassRef.getOrDefault()?.destroy();
    this.activeNavNeedleRef.getOrDefault()?.destroy();
    this.approachPreviewNeedleRef.getOrDefault()?.destroy();
    this.turnRateIndicatorRef.getOrDefault()?.destroy();
    this.bearingPointer1Ref.getOrDefault()?.destroy();
    this.bearingPointer2Ref.getOrDefault()?.destroy();

    this.headingState.destroy();
    this.nominalHeading.destroy();
    this.nominalTrack.destroy();
    this.nominalSelectedHeading.destroy();
    this.isBearingPointerCircleVisible.destroy();
    this.navSourceText.destroy();
    this.isNavSensitivityVisible.destroy();
    this.obsSuspText.destroy();
    this.previewSourceText.destroy();
    this.previewCourseText.destroy();
    this.isXtkVisible.destroy();
    this.lnavXtkPrecision.destroy();

    this.showSub?.destroy();

    this.magVarCorrectionPipe?.destroy();
    this.navAngleUnitsSub?.destroy();
    this.turnRateSub?.destroy();
    this.isHeadingDataFailedSub?.destroy();

    this.navSensitivityPipe?.destroy();

    this.lnavXtkPipe?.destroy();
    this.lnavXtkPrecisionSub?.destroy();

    super.destroy();
  }
}