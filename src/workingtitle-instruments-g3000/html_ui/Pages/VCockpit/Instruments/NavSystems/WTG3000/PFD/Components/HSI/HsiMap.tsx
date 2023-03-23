import {
  BasicNavAngleSubject, BasicNavAngleUnit, CompiledMapSystem, ComponentProps, DisplayComponent, EventBus, FlightPlanner, FSComponent,
  MappedSubject, MapSystemBuilder, MathUtils, NavSourceType, NumberFormatter, NumberUnitSubject, ObjectSubject, SetSubject, Subject,
  Subscribable, Subscription, UnitType, Vec2Math, VNode, VorToFrom
} from '@microsoft/msfs-sdk';
import {
  BearingDisplay, CdiScaleFormatter, CDIScaleLabel, GarminMapKeys, MapRangeController, NumberUnitDisplay, ObsSuspModes, TrafficSystem, TrafficUserSettings,
  UnitsNavAngleSettingMode, UnitsUserSettingManager, UnitsUserSettings
} from '@microsoft/msfs-garminsdk';
import { BingUtils, DisplayPaneIndex, DisplayPaneViewEvent, IauUserSettingManager, MapBuilder, MapConfig, MapUserSettings, NavSourceFormatter, PfdIndex } from '@microsoft/msfs-wtg3000-common';

import { ActiveNavNeedle } from './ActiveNavNeedle';
import { ApproachPreviewNeedle } from './ApproachPreviewNeedle';
import { BearingPointer } from './BearingPointer';
import { HsiCompass } from './HsiCompass';
import { HsiDataProvider } from './HsiDataProvider';
import { TurnRateIndicator } from './TurnRateIndicator';

import './HsiMap.css';

/**
 * Component props for HsiMap.
 */
export interface HsiMapProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** An instance of the flight planner. */
  flightPlanner: FlightPlanner;

  /** The traffic system. */
  trafficSystem: TrafficSystem;

  /** The index of the PFD to which the HSI map belongs. */
  pfdIndex: PfdIndex;

  /** A configuration object defining options for the map. */
  config: MapConfig;

  /** A provider of HSI data. */
  dataProvider: HsiDataProvider;

  /** A manager for all IAU user settings. */
  iauSettingManager: IauUserSettingManager;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the map should be visible. */
  show: Subscribable<boolean>;
}

/**
 * An HSI component with a moving map.
 */
export class HsiMap extends DisplayComponent<HsiMapProps> {
  private static readonly UPDATE_FREQ = 5; // Hz
  private static readonly UPDATE_PERIOD = 1000 / HsiMap.UPDATE_FREQ;
  private static readonly DATA_UPDATE_FREQ = 5; // Hz

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

  private readonly headingBugStyle = ObjectSubject.create({
    transform: 'rotate3d(0, 0, 1, 0deg)'
  });

  private readonly deviationStyle = ObjectSubject.create({
    transform: 'translate3d(0px, 0px, 0px)'
  });

  private readonly triangleDeviationStyle = ObjectSubject.create({
    display: 'none',
    transform: 'rotate(0deg)'
  });

  private readonly diamondDeviationStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly previewDeviationStyle = ObjectSubject.create({
    display: 'none',
    transform: 'translate3d(0px, 0px, 0px)'
  });

  private readonly navSensitivityStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly obsSuspStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly deviationCssClass = SetSubject.create(['hsi-map-deviation']);

  private readonly mapSettingManager = MapUserSettings.getPfdManager(this.props.bus, this.props.pfdIndex);

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(MapBuilder.hsiMap, {
      bingId: `pfd-map-${this.props.pfdIndex}`,
      bingDelay: BingUtils.getBindDelayForPane(this.props.pfdIndex === 1 ? DisplayPaneIndex.LeftPfdInstrument : DisplayPaneIndex.RightPfdInstrument),

      dataUpdateFreq: HsiMap.DATA_UPDATE_FREQ,

      flightPlanner: this.props.flightPlanner,

      ...MapBuilder.ownAirplaneIconOptions(this.props.config),

      trafficSystem: this.props.trafficSystem,
      trafficIconOptions: {
        iconSize: 30,
        font: 'DejaVuSans-SemiBold',
        fontSize: 14
      },

      settingManager: this.mapSettingManager,
      unitsSettingManager: UnitsUserSettings.getManager(this.props.bus),
      trafficSettingManager: TrafficUserSettings.getManager(this.props.bus),

      iauIndex: this.props.pfdIndex,
      iauSettingManager: this.props.iauSettingManager
    })
    .withProjectedSize(Vec2Math.create(350, 350))
    .build('hsi-map') as CompiledMapSystem<
      any,
      any,
      {
        /** The range controller. */
        [GarminMapKeys.Range]: MapRangeController;
      },
      any
    >;

  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);

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

  private readonly nominalSelectedHeading = MappedSubject.create(
    ([selectedHeadingMag, magVarCorrection]): number => {
      return selectedHeadingMag + magVarCorrection;
    },
    this.props.dataProvider.selectedHeadingMag,
    this.magVarCorrection
  );
  private readonly headingBugRotation = Subject.create(0);

  private readonly deviationTranslate = Subject.create(0);
  private readonly previewDeviationTranslate = Subject.create(0);

  private readonly deviationType = MappedSubject.create(
    ([source, isLocalizer, scalingMode]): 'triangle' | 'diamond' => {
      if (source?.getType() === NavSourceType.Gps) {
        switch (scalingMode) {
          case CDIScaleLabel.LNav:
          case CDIScaleLabel.LNavPlusV:
          case CDIScaleLabel.LP:
          case CDIScaleLabel.LPPlusV:
          case CDIScaleLabel.LPV:
          case CDIScaleLabel.Visual:
            return 'diamond';
          default:
            return 'triangle';
        }
      } else {
        return isLocalizer ? 'diamond' : 'triangle';
      }
    },
    this.props.dataProvider.activeNavIndicator.source,
    this.props.dataProvider.activeNavIndicator.isLocalizer,
    this.props.dataProvider.activeNavIndicator.lateralDeviationScalingMode
  ).pause();

  private readonly noDeviationText = MappedSubject.create(
    ([source, isLocalizer]): string => {
      if (source?.getType() === NavSourceType.Gps) {
        return 'NO DTK';
      } else {
        return isLocalizer ? 'NO LOC' : 'NO VOR';
      }
    },
    this.props.dataProvider.activeNavIndicator.source,
    this.props.dataProvider.activeNavIndicator.isLocalizer
  ).pause();

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

  private readonly isObsSuspLabelVisible = this.props.dataProvider.obsSuspMode.map(mode => mode !== ObsSuspModes.SUSP).pause();
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

  private showSub?: Subscription;
  private magVarCorrectionPipe?: Subscription;
  private navAngleUnitsSub?: Subscription;
  private turnRateSub?: Subscription;
  private isHeadingDataFailedSub?: Subscription;

  private lateralDeviationSub?: Subscription;
  private toFromSub?: Subscription;

  private previewDeviationSub?: Subscription;

  private navSensitivityPipe?: Subscription;

  private lnavXtkPipe?: Subscription;
  private lnavXtkPrecisionSub?: Subscription;

  private lastUpdateTime = 0;

  private isInit = false;

  /**
   * A callback called when the component finishes rendering.
   */
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

        this.nominalSelectedHeading.pause();
        selectedHeadingPipe.pause();

        turnRateSub.pause();
        this.turnRateIndicatorRef.instance.setTurnRate(0);
      } else {
        this.headingState.resume();

        navAngleUnitsSub.resume(true);

        this.nominalHeading.resume();
        headingPipe.resume(true);

        this.nominalSelectedHeading.resume();
        selectedHeadingPipe.resume(true);

        turnRateSub.resume(true);
      }
    }, false, true);

    // ---- Lateral deviation ----

    const lateralDeviationSub = this.lateralDeviationSub = this.props.dataProvider.activeNavIndicator.lateralDeviation.sub(deviation => {
      if (deviation === null) {
        this.deviationCssClass.add('hsi-map-deviation-fail');
        this.noDeviationText.resume();
      } else {
        this.deviationCssClass.delete('hsi-map-deviation-fail');
        this.noDeviationText.pause();

        this.deviationTranslate.set(MathUtils.clamp(Math.round(deviation * 74), -89, 89));
      }
    }, false, true);

    this.deviationTranslate.sub(translate => {
      this.deviationStyle.set('transform', `translate3d(${translate}px, 0px, 0px)`);
    }, true);

    const toFromSub = this.toFromSub = this.props.dataProvider.activeNavIndicator.toFrom.sub(toFrom => {
      this.triangleDeviationStyle.set('transform', toFrom === VorToFrom.FROM ? 'rotate(180deg)' : 'rotate(0deg)');
    }, false, true);

    this.deviationType.sub(type => {
      if (type === 'triangle') {
        this.diamondDeviationStyle.set('display', 'none');
        this.triangleDeviationStyle.set('display', '');
      } else {
        this.triangleDeviationStyle.set('display', 'none');
        this.diamondDeviationStyle.set('display', '');
      }
    }, true);

    this.previewDeviationTranslate.sub(translate => {
      this.previewDeviationStyle.set('transform', `translate3d(${translate}px, 0px, 0px)`);
    }, true);

    const previewDeviationSub = this.previewDeviationSub = this.props.dataProvider.approachPreviewIndicator.lateralDeviation.sub(deviation => {
      if (deviation === null) {
        this.previewDeviationStyle.set('display', 'none');
      } else {
        this.previewDeviationStyle.set('display', '');
        this.previewDeviationTranslate.set(MathUtils.clamp(Math.round(deviation * 74), -89, 89));
      }
    }, false, true);

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
        this.deviationCssClass.add('hsi-map-deviation-xtk-show');

        this.lnavXtkPrecision.resume();
        lnavXtkPipe.resume(true);
      } else {
        this.deviationCssClass.delete('hsi-map-deviation-xtk-show');

        this.lnavXtkPrecision.pause();
        lnavXtkPipe.pause();
      }
    }, false, true);

    // ---- OBS/SUSP ----

    this.isObsSuspLabelVisible.sub(isVisible => {
      this.obsSuspStyle.set('display', isVisible ? '' : 'none');
    }, false, true);

    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.rootStyle.set('display', '');

        isHeadingDataFailedSub.resume(true);

        lateralDeviationSub.resume(true);
        toFromSub.resume(true);
        this.deviationType.resume();

        previewDeviationSub.resume(true);

        this.navSourceText.resume();
        this.isNavSensitivityVisible.resume();
        isNavSensitivityVisibleSub.resume(true);

        this.obsSuspText.resume();

        this.isXtkVisible.resume();
        isXtkVisibleSub.resume(true);

        this.isObsSuspLabelVisible.resume();
        this.obsSuspText.resume();

        this.compiledMap.ref.instance.wake();
      } else {
        this.rootStyle.set('display', 'none');

        isHeadingDataFailedSub.pause();

        this.headingState.pause();

        magVarCorrectionPipe.pause();
        navAngleUnitsSub.pause();

        this.nominalHeading.pause();
        headingPipe.pause();

        this.nominalSelectedHeading.pause();
        selectedHeadingPipe.pause();

        turnRateSub.pause();

        lateralDeviationSub.pause();
        toFromSub.pause();
        this.deviationType.pause();
        this.noDeviationText.pause();

        previewDeviationSub.pause();

        this.navSourceText.pause();
        this.isNavSensitivityVisible.pause();
        isNavSensitivityVisibleSub.pause();
        navSensitivityPipe.pause();

        this.obsSuspText.pause();

        this.isXtkVisible.pause();
        isXtkVisibleSub.pause();
        this.lnavXtkPrecision.pause();
        lnavXtkPipe.pause();

        this.isObsSuspLabelVisible.pause();
        this.obsSuspText.pause();

        this.compiledMap.ref.instance.sleep();
      }
    }, true);

    this.isInit = true;
  }

  /**
   * Updates this map.
   * @param time The current real time, as a UNIX timestamp in milliseconds.
   */
  public update(time: number): void {
    if (!this.isInit || !this.props.show.get()) {
      return;
    }

    if (time - this.lastUpdateTime >= HsiMap.UPDATE_PERIOD) {
      this.compiledMap.ref.instance.update(time);

      this.lastUpdateTime = time;
    }
  }

  /**
   * Responds to display pane view events.
   * @param event A display pane view event.
   */
  public onEvent(event: DisplayPaneViewEvent): void {
    switch (event.eventType) {
      case 'display_pane_map_range_inc':
        this.mapRangeController.changeRangeIndex(1);
        return;
      case 'display_pane_map_range_dec':
        this.mapRangeController.changeRangeIndex(-1);
        return;
    }
  }

  /**
   * Renders the HSIMap component.
   * @returns The rendered component VNode.
   */
  public render(): VNode {
    return (
      <div class="hsi-map-container" style={this.rootStyle}>
        <div class="hsi-map-circle">
          {this.compiledMap.map}
        </div>

        <div class={this.deviationCssClass}>
          <svg class="hsi-map-deviation-markings">
            <line x1="89" y1="1" x2="89" y2="22" class="hsi-map-deviation-center" />

            <circle cx="52" cy="11.5" r="3" class="hsi-map-deviation-dot-1" />
            <circle cx="126" cy="11.5" r="3" class="hsi-map-deviation-dot-1" />

            <circle cx="15" cy="11.5" r="3" class="hsi-map-deviation-dot-2" />
            <circle cx="163" cy="11.5" r="3" class="hsi-map-deviation-dot-2" />
          </svg>
          <div class="hsi-map-deviation-bug-container" style={this.previewDeviationStyle}>
            <svg class="hsi-map-deviation-bug hsi-map-deviation-bug-preview">
              <path d="M 11 3 l -8 8 l 8 8 l 8 -8 z" />
            </svg>
          </div>
          <div class="hsi-map-deviation-bug-container" style={this.deviationStyle}>
            <svg class="hsi-map-deviation-bug hsi-map-deviation-bug-triangle" style={this.triangleDeviationStyle}>
              <path d="M 11 2 L 2 20 L 20 20 z" />
            </svg>
            <svg class="hsi-map-deviation-bug hsi-map-deviation-bug-diamond" style={this.diamondDeviationStyle}>
              <path d="M 11 3 l -8 8 l 8 8 l 8 -8 z" />
            </svg>
          </div>

          <div class="hsi-map-xtk">
            <NumberUnitDisplay
              value={this.lnavXtk}
              displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
              formatter={NumberFormatter.create({ precision: 0.01, maxDigits: 3 })}
              class="hsi-map-xtk-value"
            />
          </div>

          <div class='hsi-map-deviation-fail-msg'>{this.noDeviationText}</div>
        </div>

        <div class="hsi-map-nav-source">{this.navSourceText}</div>
        <div class="hsi-map-nav-sensitivity" style={this.navSensitivityStyle}>{this.navSensitivityText}</div>
        <div class="hsi-map-susp" style={this.obsSuspStyle}>{this.obsSuspText}</div>

        <div class='hsi-map-rotating' style={this.compassRotationStyle}>
          <div class='hsi-map-rotating-background' />

          <HsiCompass
            ref={this.compassRef}
            size={350}
            majorTickLength={15}
            minorTickLength={8}
            labelOffset={20}
          />

          <BearingPointer
            ref={this.bearingPointer1Ref}
            hsiMap={true}
            index={1}
            navIndicator={this.props.dataProvider.bearing1Indicator}
            magVarCorrection={this.magVarCorrection}
            isHeadingDataFailed={this.props.dataProvider.isHeadingDataFailed}
            isActive={this.props.show}
          />
          <BearingPointer
            ref={this.bearingPointer2Ref}
            hsiMap={true}
            index={2}
            navIndicator={this.props.dataProvider.bearing2Indicator}
            magVarCorrection={this.magVarCorrection}
            isHeadingDataFailed={this.props.dataProvider.isHeadingDataFailed}
            isActive={this.props.show}
          />

          <ApproachPreviewNeedle
            ref={this.approachPreviewNeedleRef}
            hsiMap={true}
            navIndicator={this.props.dataProvider.approachPreviewIndicator}
            magVarCorrection={this.magVarCorrection}
            isHeadingDataFailed={this.props.dataProvider.isHeadingDataFailed}
            maxCdiDeflection={1.25}
            isActive={this.props.show}
          />

          <ActiveNavNeedle
            ref={this.activeNavNeedleRef}
            hsiMap={true}
            navIndicator={this.props.dataProvider.activeNavIndicator}
            magVarCorrection={this.magVarCorrection}
            isHeadingDataFailed={this.props.dataProvider.isHeadingDataFailed}
            isActive={this.props.show}
          />
        </div>

        <TurnRateIndicator ref={this.turnRateIndicatorRef} compassRadius={175} />

        <svg viewBox="-25 -25 50 50" class="hsi-map-plane-icon">
          <path d="m -20 2.5 l 0 -4 l 16 -7 l 0 -10 l 4 -3 l 4 3 l 0 10 l 16 7 l 0 4 l -16 0 l 0 12 l 5 5 l 0 2 l -18 0 l 0 -2 l 5 -5 l 0 -12 l -16 0 z" />
        </svg>

        <svg viewBox="0 0 16 20" class="hsi-map-index-pointer">
          <path d="M 8 20 l 8 -20 l -16 0 l 8 20 z" />
        </svg>

        <div class='hsi-map-rotating' style={this.compassRotationStyle}>
          <div class="hsi-map-hdg-bug" style={this.headingBugStyle}>
            <svg>
              <path d="M 175 175 m 0 -160 l 4 -9 l 8 0 l 0 12 l -24 0 l 0 -12 l 8 0 l 4 9 z" fill="cyan" stroke="black" stroke-width="1px" />
            </svg>
          </div>
        </div>

        <div class="hsi-map-hdg-box">
          <div class="failed-box" />
          <BearingDisplay
            value={this.headingValue}
            displayUnit={this.props.unitsSettingManager.navAngleUnits}
            formatter={NumberFormatter.create({ precision: 1, pad: 3 })}
            class="hsi-map-hdg-box-value"
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
    this.nominalSelectedHeading.destroy();
    this.deviationType.destroy();
    this.noDeviationText.destroy();
    this.navSourceText.destroy();
    this.isNavSensitivityVisible.destroy();
    this.isObsSuspLabelVisible.destroy();
    this.obsSuspText.destroy();
    this.isXtkVisible.destroy();
    this.lnavXtkPrecision.destroy();

    this.showSub?.destroy();

    this.magVarCorrectionPipe?.destroy();
    this.navAngleUnitsSub?.destroy();
    this.turnRateSub?.destroy();
    this.isHeadingDataFailedSub?.destroy();

    this.lateralDeviationSub?.destroy();
    this.toFromSub?.destroy();

    this.previewDeviationSub?.destroy();

    this.navSensitivityPipe?.destroy();

    this.lnavXtkPipe?.destroy();
    this.lnavXtkPrecisionSub?.destroy();

    super.destroy();
  }
}