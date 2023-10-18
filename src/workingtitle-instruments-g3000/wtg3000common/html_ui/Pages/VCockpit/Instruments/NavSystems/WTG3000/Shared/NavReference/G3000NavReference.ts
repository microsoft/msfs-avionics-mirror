/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  ConsumerSubject, EventBus, ExtendedApproachType, GeoPoint, GeoPointInterface, GeoPointSubject, GNSSEvents, MappedSubject, MappedSubscribable,
  NavSourceType, RadioFrequencyFormatter, RnavTypeFlags, Subject, Subscribable, Subscription, UnitType, UserSettingManager
} from '@microsoft/msfs-sdk';

import {
  ActiveNavSource, ApproachDetails, BasicNavReferenceIndicator, FmsEvents, FmsFlightPhase, FmsUtils, GarminNavEvents, NavReferenceBase,
  NavReferenceIndicator, NavReferenceIndicators, NavReferenceSource, NavReferenceSources
} from '@microsoft/msfs-garminsdk';

import { PfdBearingPointerSource, PfdBearingPointerUserSettingTypes } from '../Settings/PfdUserSettings';

/** The names of the available nav sources in the G3000 for the course needle. */
export const courseNeedleNavSourceNames = [
  'FMS1',
  'NAV1',
  'NAV2',
] as const;

/** A valid {@link NavReferenceSource} name for the G3000. */
export type G3000NavSourceName = 'NAV1' | 'NAV2' | 'DME1' | 'DME2' | 'ADF1' | 'ADF2' | 'FMS1' | 'FMS2';
/** The names of the available nav sources in the G3000 for the course needle. */
export type G3000CourseNeedleNavSourceName = typeof courseNeedleNavSourceNames[number];
/** A G3000 {@link NavReferenceSource}. */
export type G3000NavSource = NavReferenceSource<G3000NavSourceName>;
/** A collection of G3000 {@link NavReferenceSource|NavReferenceSources}. */
export type G3000NavSources = NavReferenceSources<G3000NavSourceName>;
/** A collection of NavSources that can be used with the G3000CourseNeedle. */
export type G3000CourseNeedleNavSources = NavReferenceSources<G3000CourseNeedleNavSourceName>;
/** A NavSource for the G3000CourseNeedle. */
export type G3000CourseNeedleNavSource = NavReferenceSource<G3000CourseNeedleNavSourceName>;

/** A valid {@link NavReferenceIndicator} name for the G3000. */
export type G3000NavIndicatorName = 'bearingPointer1' | 'bearingPointer2' | 'activeSource' | 'approachPreview' | 'navInfo' | 'dmeInfo';
/** A G3000 {@link NavReferenceIndicator}. */
export type G3000NavIndicator = NavReferenceIndicator<G3000NavSourceName>;
/** A collection of G3000 {@link NavReferenceIndicator|NavReferenceIndicators}. */
export type G3000NavIndicators = NavReferenceIndicators<G3000NavSourceName, G3000NavIndicatorName>;

/**
 * A G3000 active navigation source {@link NavReferenceIndicator}.
 */
export class G3000ActiveSourceNavIndicator extends BasicNavReferenceIndicator<G3000NavSourceName> {
  private readonly navSource: ConsumerSubject<ActiveNavSource>;

  /**
   * Creates a new instance of G3000ActiveSourceNavIndicator.
   * @param navSources A collection of {@link NavReferenceSource|NavReferenceSources} from which the indicator can
   * source data.
   * @param bus The event bus.
   * @param index The index of this indicator's active nav source.
   */
  public constructor(navSources: G3000NavSources, private readonly bus: EventBus, index: 1 | 2) {
    super(navSources, 'NAV1');

    this.navSource = ConsumerSubject.create(this.bus.getSubscriber<GarminNavEvents>().on(`active_nav_source_${index}`), ActiveNavSource.Nav1);

    this.navSource.sub(source => {
      switch (source) {
        case ActiveNavSource.Nav1:
          this.setSource('NAV1');
          break;
        case ActiveNavSource.Nav2:
          this.setSource('NAV2');
          break;
        case ActiveNavSource.Gps1:
        case ActiveNavSource.Gps2:
          // TODO: support multiple FMS sources
          this.setSource('FMS1');
          break;
      }
    }, true);
  }
}

/**
 * A provider of approach preview data.
 */
export class G3000ApproachPreviewDataProvider {
  private static readonly SUPPORTED_APPROACH_TYPES = new Set<ExtendedApproachType>([
    ApproachType.APPROACH_TYPE_ILS,
    ApproachType.APPROACH_TYPE_LOCALIZER,
    ApproachType.APPROACH_TYPE_LDA,
    ApproachType.APPROACH_TYPE_SDF
  ]);

  private static readonly isTunedToApproachFreq = ([approachDetails, activeFreq]: readonly [Readonly<ApproachDetails>, number | null]): boolean => {
    return G3000ApproachPreviewDataProvider.SUPPORTED_APPROACH_TYPES.has(approachDetails.type)
      && approachDetails.referenceFacility !== null
      && activeFreq !== null
      && Math.round(approachDetails.referenceFacility.freqMHz * 100) === Math.round(activeFreq * 100);
  };

  private readonly _source = Subject.create<'NAV1' | 'NAV2' | null>(null);
  /**
   * The navigation source from which approach preview data is derived, or `null` if approach preview data is not
   * available.
   */
  public readonly source = this._source as Subscribable<'NAV1' | 'NAV2' | null>;

  private readonly approachDetails = ConsumerSubject.create<Readonly<ApproachDetails>>(null, {
    isLoaded: false,
    type: ApproachType.APPROACH_TYPE_UNKNOWN,
    isRnpAr: false,
    bestRnavType: RnavTypeFlags.None,
    rnavTypeFlags: RnavTypeFlags.None,
    isCircling: false,
    isVtf: false,
    referenceFacility: null
  }, FmsUtils.approachDetailsEquals);

  private readonly flightPhase = ConsumerSubject.create<Readonly<FmsFlightPhase>>(null, {
    isApproachActive: false,
    isPastFaf: false,
    isInMissedApproach: false
  }, FmsUtils.flightPhaseEquals);

  private readonly activeNavSource = ConsumerSubject.create(null, ActiveNavSource.Nav1);

  private readonly isNav1TunedToApproachFreq = MappedSubject.create(
    G3000ApproachPreviewDataProvider.isTunedToApproachFreq,
    this.approachDetails,
    this.navSources.get('NAV1').activeFrequency
  ).pause();
  private readonly isNav2TunedToApproachFreq = MappedSubject.create(
    G3000ApproachPreviewDataProvider.isTunedToApproachFreq,
    this.approachDetails,
    this.navSources.get('NAV2').activeFrequency
  ).pause();

  /**
   * Creates a new instance of G3000ApproachPreviewDataProvider.
   * @param navSources A collection of G3000 {@link NavReferenceSource|NavReferenceSources}.
   * @param bus The event bus.
   */
  public constructor(private readonly navSources: G3000NavSources, bus: EventBus) {
    const sub = bus.getSubscriber<FmsEvents & GarminNavEvents>();

    this.activeNavSource.setConsumer(sub.on('active_nav_source_1'));

    this.approachDetails.setConsumer(sub.on('fms_approach_details'));
    this.flightPhase.setConsumer(sub.on('fms_flight_phase'));

    const tuneState = MappedSubject.create(this.isNav1TunedToApproachFreq, this.isNav2TunedToApproachFreq);

    const tuneStateSub = tuneState.sub(([isNav1Tuned, isNav2Tuned]) => {
      if (isNav1Tuned) {
        this._source.set('NAV1');
      } else if (isNav2Tuned) {
        this._source.set('NAV2');
      } else {
        this._source.set(null);
      }
    }, false, true);

    const flightPhaseSub = this.flightPhase.sub(flightPhase => {
      if (flightPhase.isApproachActive && !flightPhase.isInMissedApproach) {
        this.isNav1TunedToApproachFreq.resume();
        this.isNav2TunedToApproachFreq.resume();
        tuneStateSub.resume(true);
      } else {
        tuneStateSub.pause();

        this.isNav1TunedToApproachFreq.pause();
        this.isNav2TunedToApproachFreq.pause();
        this._source.set(null);
      }
    }, false, true);

    this.activeNavSource.sub(source => {
      if (source === ActiveNavSource.Gps1 || source === ActiveNavSource.Gps2) {
        flightPhaseSub.resume(true);
      } else {
        flightPhaseSub.pause();
        tuneStateSub.pause();

        this._source.set(null);
      }
    }, true);
  }
}

/**
 * A G3000 approach preview (LOC and glideslope) {@link NavReferenceIndicator}.
 */
export class G3000ApproachPreviewNavIndicator extends BasicNavReferenceIndicator<G3000NavSourceName> {
  /**
   * Creates a new instance of G3000ApproachPreviewNavIndicator.
   * @param navSources A collection of {@link NavReferenceSource|NavReferenceSources} from which the indicator can
   * source data.
   * @param dataProvider A provider of approach preview data.
   */
  public constructor(navSources: G3000NavSources, dataProvider: G3000ApproachPreviewDataProvider) {
    super(navSources, null);

    dataProvider.source.sub(source => { this.setSource(source); });
  }
}

/**
 * A G3000 bearing pointer {@link NavReferenceIndicator}.
 */
export class G3000BearingPointerNavIndicator extends BasicNavReferenceIndicator<G3000NavSourceName> {
  private static readonly ADF_FREQ_FORMATTER = RadioFrequencyFormatter.createAdf('');

  private static readonly EMPTY_FILTER: (keyof NavReferenceBase)[] = [];
  private static readonly NAV_FILTER: (keyof NavReferenceBase)[] = ['distance'];
  private static readonly ADF_FILTER: (keyof NavReferenceBase)[] = ['distance', 'ident'];

  private readonly ppos = GeoPointSubject.create(new GeoPoint(0, 0));

  private readonly gpsDisState: MappedSubscribable<readonly [GeoPointInterface, GeoPointInterface | null]>;

  private readonly pposSub: Subscription;
  private readonly disSub: Subscription;
  private readonly freqIdentPipe: Subscription;

  /**
   * Creates a new instance of G3000BearingPointerNavIndicator.
   * @param navSources A collection of {@link NavReferenceSource|NavReferenceSources} from which the indicator can
   * source data.
   * @param bus The event bus.
   * @param index The index of the indicator's bearing pointer.
   * @param settingManager A manager for bearing pointer user settings.
   */
  public constructor(
    navSources: NavReferenceSources<G3000NavSourceName>,
    bus: EventBus,
    index: 1 | 2,
    settingManager: UserSettingManager<PfdBearingPointerUserSettingTypes>
  ) {
    super(navSources);

    const gnss = bus.getSubscriber<GNSSEvents>();

    this.pposSub = gnss.on('gps-position').handle(lla => {
      this.ppos.set(lla.lat, lla.long);
    }, true);

    this.gpsDisState = MappedSubject.create(
      this.ppos,
      this.location
    );

    this.disSub = this.gpsDisState.sub(([ppos, location]) => {
      if (location === null) {
        this.distance.set(null);
      } else {
        this.distance.set(UnitType.GA_RADIAN.convertTo(ppos.distance(location), UnitType.NMILE));
      }
    }, false, true);

    this.freqIdentPipe = this.activeFrequency.pipe(this.ident, freq => freq === null ? null : G3000BearingPointerNavIndicator.ADF_FREQ_FORMATTER(freq * 1000), true);

    const sourceSetting = settingManager.getSetting(`pfdBearingPointer${index}Source`);

    sourceSetting.sub(source => {
      switch (source) {
        case PfdBearingPointerSource.Nav1:
          this.setSource('NAV1');
          break;
        case PfdBearingPointerSource.Nav2:
          this.setSource('NAV2');
          break;
        case PfdBearingPointerSource.Fms1:
          this.setSource('FMS1');
          break;
        case PfdBearingPointerSource.Fms2:
          this.setSource('FMS2');
          break;
        case PfdBearingPointerSource.Adf1:
          this.setSource('ADF1');
          break;
        case PfdBearingPointerSource.Adf2:
          this.setSource('ADF2');
          break;
        default:
          this.setSource(null);
      }
    }, true);
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected updateFromSource(newSource: NavReferenceSource<G3000NavSourceName> | null, oldSource: NavReferenceSource<G3000NavSourceName> | null): void {
    this.sourceSubs.forEach(sub => { sub.destroy(); });
    this.sourceSubs.length = 0;

    if (newSource) {
      // Bearing pointers always derive their distance information from GPS data. Therefore we need to
      // override the source's distance information if the source is NAV or ADF.
      // Additionally, for bearing pointers the IDENT of an ADF source is its active frequency, so we need to
      // override the source's ident information with the active frequency.

      const sourceType = newSource.getType();

      let exclude = G3000BearingPointerNavIndicator.EMPTY_FILTER;

      if (sourceType === NavSourceType.Gps) {
        this.pposSub.pause();
        this.disSub.pause();
      } else {
        if (sourceType === NavSourceType.Adf) {
          exclude = G3000BearingPointerNavIndicator.ADF_FILTER;
        } else {
          exclude = G3000BearingPointerNavIndicator.NAV_FILTER;
        }

        this.pposSub.resume(true);
        this.disSub.resume(true);
      }

      this.fields.forEach((field, key) => {
        if (!exclude.includes(key)) {
          this.sourceSubs.push((newSource[key] as Subscribable<any>).pipe(field));
        }
      });

      if (sourceType === NavSourceType.Adf) {
        this.freqIdentPipe.resume(true);
      } else {
        this.freqIdentPipe.pause();
      }
    } else {
      this.pposSub.pause();
      this.disSub.pause();

      this.freqIdentPipe.pause();

      this.clearAll();
    }
  }
}

/**
 * A G3000 Nav info {@link NavReferenceIndicator}.
 */
export class G3000NavInfoNavIndicator extends BasicNavReferenceIndicator<G3000NavSourceName> {
  private static readonly SOURCE_MAP = {
    [ActiveNavSource.Nav1]: 'NAV1',
    [ActiveNavSource.Nav2]: 'NAV2',
    [ActiveNavSource.Gps1]: null,
    [ActiveNavSource.Gps2]: null
  } as const;

  private readonly _isPreview = Subject.create(false);
  /** Whether this indicator is in preview mode. */
  public readonly isPreview = this._isPreview as Subscribable<boolean>;

  private readonly previewSourceSub: Subscription;

  /**
   * Creates a new instance of G3000NavInfoNavIndicator.
   * @param navSources A collection of {@link NavReferenceSource|NavReferenceSources} from which the indicator can
   * source data.
   * @param bus The event bus.
   * @param index The index of the active nav source associated with the indicator.
   * @param previewDataProvider A provider of approach preview data.
   */
  public constructor(
    navSources: G3000NavSources,
    private readonly bus: EventBus,
    index: 1 | 2,
    previewDataProvider: G3000ApproachPreviewDataProvider
  ) {
    super(navSources, null);

    this.previewSourceSub = previewDataProvider.source.sub(source => { this.setSource(source); }, false, true);

    this.bus.getSubscriber<GarminNavEvents>().on(`active_nav_source_${index}`).whenChanged().handle(activeNavSource => {
      const source = G3000NavInfoNavIndicator.SOURCE_MAP[activeNavSource];

      if (source === null) {
        this._isPreview.set(true);
        this.previewSourceSub.resume(true);
      } else {
        this._isPreview.set(false);
        this.previewSourceSub.pause();
        this.setSource(source);
      }
    });
  }
}

/**
 * A G3000 DME info {@link NavReferenceIndicator}.
 */
export class G3000DmeInfoNavIndicator extends BasicNavReferenceIndicator<G3000NavSourceName> {
  private readonly _isPreview = Subject.create(false);
  /** Whether this indicator is in preview mode. */
  public readonly isPreview = this._isPreview as Subscribable<boolean>;

  private readonly previewSourceSub?: Subscription;

  /**
   * Creates a new instance of G3000DmeInfoNavIndicator.
   * @param navSources A collection of {@link NavReferenceSource|NavReferenceSources} from which the indicator can
   * source data.
   * @param bus The event bus.
   * @param index The index of the active nav source associated with the indicator.
   * @param dmeRadioCount The number of supported DME radios.
   * @param previewDataProvider A provider of approach preview data.
   */
  public constructor(
    navSources: G3000NavSources,
    private readonly bus: EventBus,
    index: 1 | 2,
    dmeRadioCount: 0 | 1 | 2,
    previewDataProvider: G3000ApproachPreviewDataProvider
  ) {
    super(navSources, null);

    if (dmeRadioCount > 0) {
      const activeNavSourceMap = {
        [ActiveNavSource.Nav1]: 'DME1',
        [ActiveNavSource.Nav2]: dmeRadioCount > 1 ? 'DME2' : 'DME1',
        [ActiveNavSource.Gps1]: null,
        [ActiveNavSource.Gps2]: null
      } as const;

      const previewSourceMap = {
        ['NAV1']: 'DME1',
        ['NAV2']: dmeRadioCount > 1 ? 'DME2' : 'DME1'
      } as const;

      this.previewSourceSub = previewDataProvider.source.sub(source => { this.setSource(source === null ? null : previewSourceMap[source]); });

      this.bus.getSubscriber<GarminNavEvents>().on(`active_nav_source_${index}`).whenChanged().handle(activeNavSource => {
        const source = activeNavSourceMap[activeNavSource];

        if (source === null) {
          this._isPreview.set(true);
          this.previewSourceSub!.resume(true);
        } else {
          this._isPreview.set(false);
          this.previewSourceSub!.pause();
          this.setSource(source);
        }
      });
    }
  }
}