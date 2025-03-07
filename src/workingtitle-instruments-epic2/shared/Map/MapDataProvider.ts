/* eslint-disable max-len */
import {
  AdcEvents, AhrsEvents, APEvents, BitFlags, ConsumerSubject, EventBus, GNSSEvents, MappedSubject, MapProjection, MapProjectionChangeType, NavComEvents,
  NumberFormatter, Subject, Subscribable, TcasAlertLevel, TcasEvents
} from '@microsoft/msfs-sdk';

import { AirGroundDataProviderEvents } from '../Instruments/AirGroundDataProvider';
import { HeadingDataProvider } from '../Instruments/HeadingDataProvider';
import { InertialDataProvider } from '../Instruments/InertialDataProvider';
import { Epic2LNavDataEvents } from '../Navigation';
import { Epic2NavIndicators } from '../Navigation/Epic2NavIndicators';
import { MapWaypointsDisplay } from './EpicMapCommon';
import { MapDisplayMode } from '../Settings';
import { Epic2FlightArea } from '../Autopilot';

// import { BoeingFmaDataUtils, BoeingLNavDataEvents, FmaDataEvents } from '../../autopilot';
// import { IrsSystemGroupStatusEvents } from '../../instruments';
// import { BoeingNavIndicatorName, BoeingNavIndicators } from '../../navigation';
// import { BoeingMsfsUserSettingDefs, BoeingNdHdgTrkUpMode } from '../../settings';
// import { IrsSystemSelectorEvents } from '../../system';
// import { BoeingColors } from '../../utils';
// import { MapWaypointsDisplay, NavAidState, TerrWxState } from './BoeingMapCommon';
// import { MapCompassAnimator } from './MapCompassAnimator';

const RANGE_FORMATTER = NumberFormatter.create({ precision: .01, maxDigits: 3, forceDecimalZeroes: false });

/** Options for the boeing nd data provider. */
export interface MapDataProviderOptions {
  /** When true, the sel hdg line will always be visible, defaults to false. */
  readonly alwaysShowSelectedHeadingLine?: boolean;
  /** Should be true if map is always HDG up. Defaults to false. */
  readonly alwaysHeadingUp?: boolean;
}

/** Provides data for the map. */
export class MapDataProvider {
  // This is what honeywell airbus ADIRU uses, so probably close to real thing.
  private readonly trackHeadingGsThreshold = 50;

  // public readonly white = BoeingColors.white;
  // public readonly black = BoeingColors.black;
  // public readonly green = BoeingColors.green;
  // public readonly cyan = BoeingColors.cyan;
  // public readonly magenta = BoeingColors.magenta;

  private readonly _targetProjectedOffsetY = Subject.create(0);
  public readonly targetProjectedOffsetY = this._targetProjectedOffsetY as Subscribable<number>;

  public readonly isOnGround = ConsumerSubject.create(this.bus.getSubscriber<AirGroundDataProviderEvents>().on('air_ground_is_on_ground'), true);

  // TODO
  // public readonly isHeadingDataValid = this.headingDataProvider.magneticHeading.map(x => x !== null);
  // public readonly isWindDataValid = this.inertialDataProvider.windDirection.map(x => x !== null);
  // public readonly isPositionDataValid = this.inertialDataProvider.position.map(x => x !== null);
  public readonly isHeadingDataValid = Subject.create(true);
  public readonly isWindDataValid = Subject.create(true);
  public readonly isPositionDataValid = Subject.create(true);

  private readonly lnavEvents = this.bus.getSubscriber<Epic2LNavDataEvents>();

  // protected readonly ilsNavIndicator = this.navIndicators.get(this.ilsNavIndicatorName);

  // private readonly vorLeftNavIndicator = this.navIndicators.get('vorLeft');
  // private readonly vorRightNavIndicator = this.navIndicators.get('vorRight');

  // ------ VOR and APP modes ---------- //
  protected readonly navComEvents = this.bus.getSubscriber<NavComEvents>();

  // public readonly ilsActiveFrequency = ConsumerSubject.create(this.navComEvents.on(this.ilsFrequencyEvent), 0) as Subscribable<number>;
  // public readonly ilsIdent = this.ilsNavIndicator.ident as Subscribable<string | null>;
  // /** @inheritdoc */
  // public readonly ilsCourse = this.ilsNavIndicator.course as Subscribable<number | null>;
  // public readonly ilsDme = this.ilsNavIndicator.distance as Subscribable<number | null>;
  // /** @inheritdoc */
  // public readonly ilsCourseDeviation = this.ilsNavIndicator.lateralDeviation as Subscribable<number>;

  /** VOR courses in degrees. */
  // public readonly vorLeftCourse = this.vorLeftNavIndicator.course as Subscribable<number | null>;
  // public readonly vorRightCourse = this.vorRightNavIndicator.course as Subscribable<number | null>;

  // public readonly isVorLeftDmeValid = this.vorLeftNavIndicator.hasDme as Subscribable<boolean | null>;
  // public readonly isVorRightDmeValid = this.vorRightNavIndicator.hasDme as Subscribable<boolean | null>;

  // public readonly vorLeftDme = this.vorLeftNavIndicator.distance as Subscribable<number | null>;
  // public readonly vorRightDme = this.vorRightNavIndicator.distance as Subscribable<number | null>;

  /** VOR L course deviation in degrees. */
  // public readonly vorLeftCourseDeviation = this.vorLeftNavIndicator.lateralDeviation as Subscribable<number>;
  /** VOR R course deviation in degrees. */
  // public readonly vorRightCourseDeviation = this.vorRightNavIndicator.lateralDeviation as Subscribable<number>;
  // ------ End VOR and APP modes ------ //

  private readonly currentTrackDegMag = ConsumerSubject.create(
    this.bus.getSubscriber<GNSSEvents>().on('track_deg_magnetic').withPrecision(2), 0);
  // TODO Use AhrsSystemEvents for heading once it works
  // private readonly currentHeadingMag = ConsumerSubject.create(
  //   this.bus.getSubscriber<AhrsSystemEvents>().on('ahrs_hdg_deg_1').withPrecision(2), 0);
  private readonly currentHeadingMag = ConsumerSubject.create(
    this.bus.getSubscriber<AhrsEvents>().on('hdg_deg').withPrecision(2), 0);
  private readonly currentGroundSpeed = ConsumerSubject.create(
    this.bus.getSubscriber<GNSSEvents>().on('ground_speed').atFrequency(1), 0);
  private readonly selectedHeadingAndTrack = ConsumerSubject.create(
    this.bus.getSubscriber<APEvents>().on('ap_heading_selected'), 0);
  // private readonly fmaData = ConsumerSubject.create(
  //   this.bus.getSubscriber<FmaDataEvents>().on('fma_data'), BoeingFmaDataUtils.createBoeingFmaData());

  // When changing this also make sure the map format configs in the map format controller are in sync
  // public readonly isHdgUpMode = MappedSubject.create(([hdgTrkSetting, mapFormat]) => {
  //   if (this.options?.alwaysHeadingUp) {
  //     return true;
  //   } else if (mapFormat === 'APP' || mapFormat === 'APPCTR' || mapFormat === 'VOR' || mapFormat === 'VORCTR') {
  //     return true;
  //   } else {
  //     return hdgTrkSetting === BoeingNdHdgTrkUpMode.HDG;
  //   }
  // },
  //   this.boeingUserSettings.getSetting('boeingMsfsNdHdgTrkUpMode'),
  //   this.mapFormat,
  // ) as Subscribable<boolean>;
  public readonly isHdgUpMode = Subject.create(true);
  // TODO Does epic even support track up mode? (Yes it does)

  public readonly isMissedApproachActive = ConsumerSubject.create(this.lnavEvents.on('lnavdata_flight_area'), 0)
    .map(x => x === Epic2FlightArea.MissedApproach);

  public readonly compassRotation = MappedSubject.create(([track, heading, groundSpeed, isHeadingDataValid, isHdgUpMode]) => {
    return isHeadingDataValid
      ? groundSpeed < this.trackHeadingGsThreshold
        ? heading
        : isHdgUpMode ? heading : track
      : 0;
  }, this.currentTrackDegMag, this.currentHeadingMag, this.currentGroundSpeed, this.isHeadingDataValid, this.isHdgUpMode) as Subscribable<number>;

  // private readonly vorLeftRotation = MappedSubject.create(([compassRotation, vorLeftBearing]) => {
  //   return vorLeftBearing === null ? 0 : compassRotation - vorLeftBearing;
  // }, this.compassRotation, this.vorLeftNavIndicator.bearing);

  // private readonly vorRightRotation = MappedSubject.create(([compassRotation, vorRightBearing]) => {
  //   return vorRightBearing === null ? 0 : compassRotation - vorRightBearing;
  // }, this.compassRotation, this.vorRightNavIndicator.bearing);

  // private readonly adfLeftRotation = MappedSubject.create(([compassRotation, adfLeftBearing]) => {
  //   return adfLeftBearing === null ? 0 : compassRotation - adfLeftBearing;
  // }, this.compassRotation, this.navIndicators.get('adfLeft').bearing);

  // private readonly adfRightRotation = MappedSubject.create(([compassRotation, adfRightBearing]) => {
  //   return adfRightBearing === null ? 0 : compassRotation - adfRightBearing;
  // }, this.compassRotation, this.navIndicators.get('adfRight').bearing);

  // private readonly vorLeftCourseRotation = MappedSubject.create(([compassRotation, vorLeftCourse]) => {
  //   return vorLeftCourse === null ? 0 : compassRotation - vorLeftCourse;
  // }, this.compassRotation, this.vorLeftNavIndicator.course);

  // private readonly vorRightCourseRotation = MappedSubject.create(([compassRotation, vorRightCourse]) => {
  //   return vorRightCourse === null ? 0 : compassRotation - vorRightCourse;
  // }, this.compassRotation, this.vorRightNavIndicator.course);

  // private readonly ilsCourseRotation = MappedSubject.create(([compassRotation, vorIlsCourse]) => {
  //   return vorIlsCourse === null ? 0 : compassRotation - vorIlsCourse;
  // }, this.compassRotation, this.ilsNavIndicator.course);

  // protected readonly _navAidLeftState = Subject.create('OFF');
  // public readonly navAidLeftState = this._navAidLeftState as Subscribable<NavAidState>;
  // protected readonly _navAidRightState = Subject.create('OFF');
  // public readonly navAidRightState = this._navAidRightState as Subscribable<NavAidState>;

  // public readonly vorPointerLeftIsVisible = MappedSubject.create(([hasNav, isLoc, state, isHeadingDataValid, mapFormat]): boolean => {
  //   return !!hasNav && !isLoc && state === 'VOR' && isHeadingDataValid && mapFormat !== 'APP' && mapFormat !== 'APPCTR';
  // },
  //   this.vorLeftNavIndicator.hasNav,
  //   this.vorLeftNavIndicator.isLocalizer,
  //   this.navAidLeftState,
  //   this.isHeadingDataValid,
  //   this.mapFormat,
  // ) as Subscribable<boolean>;

  // public readonly vorPointerRightIsVisible = MappedSubject.create(([hasNav, isLoc, state, isHeadingDataValid, mapFormat]): boolean => {
  //   return !!hasNav && !isLoc && state === 'VOR' && isHeadingDataValid && mapFormat !== 'APP' && mapFormat !== 'APPCTR';
  // },
  //   this.vorRightNavIndicator.hasNav,
  //   this.vorRightNavIndicator.isLocalizer,
  //   this.navAidRightState,
  //   this.isHeadingDataValid,
  //   this.mapFormat,
  // ) as Subscribable<boolean>;

  // public readonly adfPointerLeftIsVisible = MappedSubject.create(([bearing, state, isHeadingDataValid, mapFormat]): boolean => {
  //   return bearing !== null && state === 'ADF' && isHeadingDataValid && mapFormat !== 'APP' && mapFormat !== 'APPCTR';
  // },
  //   this.navIndicators.get('adfLeft').bearing,
  //   this.navAidLeftState,
  //   this.isHeadingDataValid,
  //   this.mapFormat,
  // ) as Subscribable<boolean>;

  // public readonly adfPointerRightIsVisible = MappedSubject.create(([bearing, state, isHeadingDataValid, mapFormat]): boolean => {
  //   return bearing !== null && state === 'ADF' && isHeadingDataValid && mapFormat !== 'APP' && mapFormat !== 'APPCTR';
  // },
  //   this.navIndicators.get('adfRight').bearing,
  //   this.navAidRightState,
  //   this.isHeadingDataValid,
  //   this.mapFormat,
  // ) as Subscribable<boolean>;

  // private readonly _vorCoursePointerLeftIsVisible = MappedSubject.create(([mapFormat]): boolean => {
  //   return ['VOR', 'VORCTR'].includes(mapFormat);
  // },
  //   this.mapFormat
  // ) as Subscribable<boolean>;

  // private readonly _vorCoursePointerRightIsVisible = MappedSubject.create(([mapFormat]): boolean => {
  //   return ['VOR', 'VORCTR'].includes(mapFormat);
  // },
  //   this.mapFormat
  // ) as Subscribable<boolean>;

  // private readonly _ilsCoursePointerIsVisible = MappedSubject.create(([mapFormat]): boolean => {
  //   return ['APP', 'APPCTR'].includes(mapFormat);
  // },
  //   this.mapFormat
  // ) as Subscribable<boolean>;

  // private readonly vorLeftAnimator =
  //   new MapCompassAnimator(undefined, this.vorPointerLeftIsVisible, this.vorLeftRotation);
  // private readonly vorRightAnimator =
  //   new MapCompassAnimator(undefined, this.vorPointerRightIsVisible, this.vorRightRotation);
  // private readonly adfLeftAnimator =
  //   new MapCompassAnimator(undefined, this.adfPointerLeftIsVisible, this.adfLeftRotation);
  // private readonly adfRightAnimator =
  //   new MapCompassAnimator(undefined, this.adfPointerRightIsVisible, this.adfRightRotation);
  // private readonly vorLeftCourseAnimator =
  //   new MapCompassAnimator(undefined, this._vorCoursePointerLeftIsVisible, this.vorLeftCourseRotation);
  // private readonly vorRightCourseAnimator =
  //   new MapCompassAnimator(undefined, this._vorCoursePointerRightIsVisible, this.vorRightCourseRotation);
  // private readonly ilsCourseAnimator =
  //   new MapCompassAnimator(undefined, this._ilsCoursePointerIsVisible, this.ilsCourseRotation);

  // public readonly vorLeftRotationAnimated = this.vorLeftAnimator.output;
  // public readonly vorRightRotationAnimated = this.vorRightAnimator.output;
  // public readonly adfLeftRotationAnimated = this.adfLeftAnimator.output;
  // public readonly adfRightRotationAnimated = this.adfRightAnimator.output;
  // public readonly vorLeftCourseRotationAnimated = this.vorLeftCourseAnimator.output;
  // public readonly vorRightCourseRotationAnimated = this.vorRightCourseAnimator.output;
  // public readonly ilsCourseRotationAnimated = this.ilsCourseAnimator.output;

  // public readonly vorLeftCourseToFrom = this.vorLeftNavIndicator.toFrom;
  // public readonly vorRightCourseToFrom = this.vorRightNavIndicator.toFrom;

  private selectedHdgTrkTimeout?: number;

  public readonly currentHeadingRotation = MappedSubject.create(([compassRotation, hdg, isHdgUpMode]) => {
    return isHdgUpMode ? 0 : compassRotation - hdg;
  }, this.compassRotation, this.currentHeadingMag, this.isHdgUpMode) as Subscribable<number>;

  public readonly currentTrackRotation = MappedSubject.create(([compassRotation, trk, isHdgUpMode, groundSpeed, heading]) => {
    return isHdgUpMode
      ? groundSpeed < this.trackHeadingGsThreshold
        ? compassRotation - heading
        : compassRotation - trk
      : 0;
  }, this.compassRotation, this.currentTrackDegMag, this.isHdgUpMode, this.currentGroundSpeed, this.currentHeadingMag) as Subscribable<number>;

  public readonly selectedHeadingAndTrackRotation = MappedSubject.create(([compassRotation, selHdgTrk]) => {
    return compassRotation - selHdgTrk;
  }, this.compassRotation, this.selectedHeadingAndTrack) as Subscribable<number>;

  public readonly isPlanFormat = this.mapFormat.map(f => f === 'NorthUp') as Subscribable<boolean>;
  public readonly isVorFormat = this.mapFormat.map(f => ['VOR', 'VORCTR'].includes(f)) as Subscribable<boolean>;
  public readonly isAppFormat = this.mapFormat.map(f => ['APP', 'APPCTR'].includes(f)) as Subscribable<boolean>;
  public readonly isVorAppFormat = MappedSubject.create(
    ([isVorFormat, isAppFormat]): boolean => isVorFormat || isAppFormat,
    this.isVorFormat,
    this.isAppFormat
  ) as Subscribable<boolean>;

  public readonly hideWindVector = this.isPlanFormat;
  public readonly hideTrack = this.isPlanFormat;

  // public readonly isWxrEnabled = this.settings.getSetting('terrWxState').map(x => x === 'WX') as Subscribable<boolean>;
  // public readonly isTerrEnabled = this.settings.getSetting('terrWxState').map(x => x === 'TERR') as Subscribable<boolean>;
  // public readonly isTfcEnabled = this.settings.getSetting('tfcEnabled') as Subscribable<boolean>;

  // public readonly terrWxContrast = this.settings.getSetting('terrWxContrast') as Subscribable<number>;

  public readonly tcasTrafficStatus: MappedSubject<[number, number], TcasAlertLevel> = MappedSubject.create(
    ([taIntruderCount, raIntruderCount]): TcasAlertLevel => {
      if (raIntruderCount > 0) {
        return TcasAlertLevel.ResolutionAdvisory;
      } else if (taIntruderCount > 0) {
        return TcasAlertLevel.TrafficAdvisory;
      }

      return TcasAlertLevel.None;
    },
    ConsumerSubject.create(this.bus.getSubscriber<TcasEvents>().on('tcas_ta_intruder_count'), 0),
    ConsumerSubject.create(this.bus.getSubscriber<TcasEvents>().on('tcas_ra_intruder_count'), 0),
  );

  public readonly isWxrSupported = this.mapFormat.map(x => ['NorthUp', 'HeadingUp', 'TrackUp'].includes(x)) as Subscribable<boolean>;
  public readonly isTerrSupported = this.isWxrSupported;
  public readonly isTfcSupported = this.isWxrSupported;
  public readonly isNavPerfSupported = this.mapFormat.map(x => ['NorthUp', 'HeadingUp', 'TrackUp'].includes(x)) as Subscribable<boolean>;
  public readonly isVorSupported = this.mapFormat.map(x => x !== 'NorthUp') as Subscribable<boolean>;
  public readonly isAdfSupported = this.mapFormat.map(x => x !== 'NorthUp') as Subscribable<boolean>;
  public readonly isClockSupported = this.mapFormat.map(x => x !== 'NorthUp') as Subscribable<boolean>;
  public readonly isRangeSupported = this.mapFormat.map(x => ['NorthUp', 'HeadingUp', 'TrackUp'].includes(x)) as Subscribable<boolean>;

  // public readonly showWxr = MappedSubject.create(([isWxrEnabled, isWxrSupported]) =>
  //   isWxrEnabled && isWxrSupported, this.isWxrEnabled, this.isWxrSupported) as Subscribable<boolean>;
  // public readonly showTerr = MappedSubject.create(([isTerrEnabled, isTerrSupported]) =>
  //   isTerrEnabled && isTerrSupported, this.isTerrEnabled, this.isTerrSupported) as Subscribable<boolean>;
  // public readonly showTfc = MappedSubject.create(([isTfcEnabled, isTfcSupported]) =>
  //   isTfcEnabled && isTfcSupported, this.isTfcEnabled, this.isTfcSupported) as Subscribable<boolean>;

  public readonly rangeNumber = this.mapRange.map(RANGE_FORMATTER) as Subscribable<string>;
  public readonly halfRangeNumber = this.mapRange.map(x => RANGE_FORMATTER(x / 2)) as Subscribable<string>;

  protected readonly _selHdgOrTrk = Subject.create<'heading' | 'track'>('heading');
  public readonly selHdgOrTrk = this._selHdgOrTrk as Subscribable<'heading' | 'track'>;

  // private readonly isHeadingSelectActive = this.fmaData.map(x => x.lateralActive === APLateralModes.HEADING);
  // private readonly isTrackSelectActive = this.fmaData.map(x => x.lateralActive === APLateralModes.TRACK);

  private readonly hdgTrkWasSelectedInLast10Seconds = Subject.create(false);
  // public readonly showSelHdgTrkLine = MappedSubject.create(([hdgSelectActive, trkSelectActive, selectionRecentlyChanged]) => {
  //   return hdgSelectActive || trkSelectActive || selectionRecentlyChanged || this.options?.alwaysShowSelectedHeadingLine;
  // }, this.isHeadingSelectActive, this.isTrackSelectActive, this.hdgTrkWasSelectedInLast10Seconds) as Subscribable<boolean>;
  // TODO
  public readonly showSelHdgTrkLine = Subject.create(true);

  // public readonly anIrsIsOperating = ConsumerSubject.create(this.bus.getSubscriber<IrsSystemGroupStatusEvents>().on('an_irs_system_is_operating'), false) as Subscribable<boolean>;
  // public readonly anIrsIsAligning = ConsumerSubject.create(this.bus.getSubscriber<IrsSystemGroupStatusEvents>().on('an_irs_is_aligning'), false) as Subscribable<boolean>;
  // public readonly showTimeToAlign = MappedSubject.create(([anIrsIsOperating, anIrsIsAligning]) => anIrsIsOperating ? false : anIrsIsAligning,
  //   this.anIrsIsOperating, this.anIrsIsAligning) as Subscribable<boolean>;
  // TODO
  public readonly showTimeToAlign = Subject.create(false);

  // FIXME use AirspeedDataProvider
  public readonly hasWindData = MappedSubject.create(([tas, isWindDataValid, showTimeToAlign]): boolean => showTimeToAlign ? false : isWindDataValid ? tas >= 100 : false,
    ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('tas').withPrecision(0), 0),
    this.isWindDataValid,
    this.showTimeToAlign,
  ) as Subscribable<boolean>;

  /**
   * Creates a new data provider.
   * @param bus The event bus.
   * @param headingDataProvider The heading data provider.
   * @param inertialDataProvider The inertial data provider.
  //  * @param ilsNavIndicatorName The indicator to use for ILS.
  //  * @param ilsFrequencyEvent The topic to use for ILS frequency.
   * @param mapFormat The map format.
   * @param mapRange The map range.
   * @param mapWaypointsDisplay The map wpts display flags.
   * @param navIndicators The nav indicators.
   * @param options The options.
   */
  public constructor(
    protected readonly bus: EventBus,
    protected readonly headingDataProvider: HeadingDataProvider,
    protected readonly inertialDataProvider: InertialDataProvider,
    // protected readonly ilsNavIndicatorName: EpicNavIndicatorName,
    // protected readonly ilsFrequencyEvent: keyof NavComEvents,
    public readonly mapFormat: Subscribable<MapDisplayMode | 'Hsi'>,
    public readonly mapRange: Subscribable<number>,
    public readonly mapWaypointsDisplay: Subscribable<MapWaypointsDisplay>,
    protected readonly navIndicators?: Epic2NavIndicators,
    protected readonly options?: MapDataProviderOptions,
  ) {
    // Selected hdg/trk timeout
    if (!options?.alwaysShowSelectedHeadingLine) {
      this.selectedHeadingAndTrack.sub(() => this.startSelectedHdgTrkTimeout(), false);
    }
  }

  /** Keeps track of how long ago the selected hdg/trk was last changed. */
  protected startSelectedHdgTrkTimeout(): void {
    this.hdgTrkWasSelectedInLast10Seconds.set(true);
    if (this.selectedHdgTrkTimeout) {
      clearTimeout(this.selectedHdgTrkTimeout);
    }
    this.selectedHdgTrkTimeout = window.setTimeout(this.handleSelectedHdgTrkTimeoutCompleted, 10 * 1000);
  }

  /** Called n seconds after selected hdg/trk was last changed. */
  private readonly handleSelectedHdgTrkTimeoutCompleted = (): void => {
    this.hdgTrkWasSelectedInLast10Seconds.set(false);
    this.selectedHdgTrkTimeout = undefined;
  };

  /**
   * Set the map projection once map system is created.
   * @param mapProjection The map projection.
   */
  public initMapProjection(mapProjection: MapProjection): void {
    this._targetProjectedOffsetY.set(mapProjection.getTargetProjectedOffset()[1]);

    mapProjection.addChangeListener((projection, changeFlags) => {
      if (BitFlags.isAny(changeFlags, MapProjectionChangeType.TargetProjected)) {
        this._targetProjectedOffsetY.set(projection.getTargetProjectedOffset()[1]);
      }
    });
  }
}
