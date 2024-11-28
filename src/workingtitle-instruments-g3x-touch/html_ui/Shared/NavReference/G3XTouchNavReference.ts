import {
  ConsumerSubject, EventBus, GeoPoint, GeoPointInterface, GeoPointSubject, GNSSEvents, MappedSubject, MappedSubscribable,
  NavSourceType, Subscribable, Subscription, UnitType, UserSettingManager
} from '@microsoft/msfs-sdk';

import {
  BasicNavReferenceIndicator, NavReferenceBase, NavReferenceIndicator, NavReferenceIndicators, NavReferenceSource,
  NavReferenceSources
} from '@microsoft/msfs-garminsdk';

import { PfdBearingPointerSource, PfdBearingPointerUserSettingTypes } from '../Settings/PfdUserSettings';
import { G3XActiveNavSource, G3XNavEvents } from '../Navigation/G3XNavEvents';
import { G3XExternalNavigatorIndex } from '../CommonTypes';

/** A valid {@link NavReferenceSource} name for the G3X Touch. */
export type G3XTouchNavSourceName = 'NAV1' | 'NAV2' | 'GPSInt' | 'GPS1' | 'GPS2' | 'NRST';
/** A G3X Touch {@link NavReferenceSource}. */
export type G3XTouchNavSource = NavReferenceSource<G3XTouchNavSourceName>;
/** A collection of G3X Touch {@link NavReferenceSource|NavReferenceSources}. */
export type G3XTouchNavSources = NavReferenceSources<G3XTouchNavSourceName>;

/** A valid {@link NavReferenceIndicator} name for the G3X Touch. */
export type G3XTouchNavIndicatorName = 'bearingPointer1' | 'bearingPointer2' | 'activeSource';
/** A G3X Touch {@link NavReferenceIndicator}. */
export type G3XTouchNavIndicator = NavReferenceIndicator<G3XTouchNavSourceName>;
/** A collection of G3X Touch {@link NavReferenceIndicator|NavReferenceIndicators}. */
export type G3XTouchNavIndicators = NavReferenceIndicators<G3XTouchNavSourceName, G3XTouchNavIndicatorName>;

/**
 * A G3X Touch active navigation source {@link NavReferenceIndicator}.
 */
export class G3XTouchActiveSourceNavIndicator extends BasicNavReferenceIndicator<G3XTouchNavSourceName> {
  private readonly navSource: ConsumerSubject<G3XActiveNavSource>;

  /**
   * Creates a new instance of G3XTouchActiveSourceNavIndicator.
   * @param navSources A collection of {@link NavReferenceSource|NavReferenceSources} from which the indicator can
   * source data.
   * @param bus The event bus.
   */
  public constructor(navSources: G3XTouchNavSources, private readonly bus: EventBus) {
    super(navSources, 'NAV1');

    this.navSource = ConsumerSubject.create(this.bus.getSubscriber<G3XNavEvents>().on('g3x_active_nav_source'), G3XActiveNavSource.GpsInternal);

    this.navSource.sub(source => {
      switch (source) {
        case G3XActiveNavSource.Nav1:
          this.setSource('NAV1');
          break;
        case G3XActiveNavSource.Nav2:
          this.setSource('NAV2');
          break;
        case G3XActiveNavSource.GpsInternal:
          this.setSource('GPSInt');
          break;
        case G3XActiveNavSource.Gps1:
          this.setSource('GPS1');
          break;
        case G3XActiveNavSource.Gps2:
          this.setSource('GPS2');
          break;
      }
    }, true);
  }
}

/**
 * A G3X Touch bearing pointer {@link NavReferenceIndicator}.
 */
export class G3XTouchBearingPointerNavIndicator extends BasicNavReferenceIndicator<G3XTouchNavSourceName> {
  private static readonly EMPTY_FILTER: (keyof NavReferenceBase)[] = [];
  private static readonly NAV_FILTER: (keyof NavReferenceBase)[] = ['distance'];

  private readonly activeNavigatorIndex = ConsumerSubject.create<0 | G3XExternalNavigatorIndex>(null, 0);

  private readonly ppos = GeoPointSubject.create(new GeoPoint(0, 0));

  private readonly gpsDisState: MappedSubscribable<readonly [GeoPointInterface, GeoPointInterface | null]>;

  private readonly activeNavigatorIndexSub: Subscription;
  private readonly pposSub: Subscription;
  private readonly disSub: Subscription;

  /**
   * Creates a new instance of G3XTouchBearingPointerNavIndicator.
   * @param navSources A collection of {@link NavReferenceSource|NavReferenceSources} from which the indicator can
   * source data.
   * @param bus The event bus.
   * @param index The index of the indicator's bearing pointer.
   * @param settingManager A manager for bearing pointer user settings.
   */
  public constructor(
    navSources: NavReferenceSources<G3XTouchNavSourceName>,
    bus: EventBus,
    index: 1 | 2,
    settingManager: UserSettingManager<PfdBearingPointerUserSettingTypes>
  ) {
    super(navSources);

    const sub = bus.getSubscriber<GNSSEvents & G3XNavEvents>();

    this.activeNavigatorIndex.setConsumer(sub.on('g3x_active_navigator_index'));
    this.activeNavigatorIndexSub = this.activeNavigatorIndex.sub(this.updateGpsSource.bind(this), false, true);

    this.pposSub = sub.on('gps-position').handle(lla => {
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

    settingManager.getSetting(`pfdBearingPointer${index}Source`)
      .sub(this.onSourceSettingChanged.bind(this), true);
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected updateFromSource(newSource: NavReferenceSource<G3XTouchNavSourceName> | null, oldSource: NavReferenceSource<G3XTouchNavSourceName> | null): void {
    this.sourceSubs.forEach(sub => { sub.destroy(); });
    this.sourceSubs.length = 0;

    if (newSource) {
      // Bearing pointers always derive their distance information from GPS data. Therefore we need to
      // override the source's distance information if the source is NAV.

      const sourceType = newSource.getType();

      let exclude = G3XTouchBearingPointerNavIndicator.EMPTY_FILTER;

      if (sourceType === NavSourceType.Gps) {
        this.pposSub.pause();
        this.disSub.pause();
      } else {
        exclude = G3XTouchBearingPointerNavIndicator.NAV_FILTER;

        this.pposSub.resume(true);
        this.disSub.resume(true);
      }

      this.fields.forEach((field, key) => {
        if (!exclude.includes(key)) {
          this.sourceSubs.push((newSource[key] as Subscribable<any>).pipe(field));
        }
      });
    } else {
      this.pposSub.pause();
      this.disSub.pause();

      this.clearAll();
    }
  }

  /**
   * Responds to when this indicator's bearing pointer source setting value changes.
   * @param setting The new setting value.
   */
  private onSourceSettingChanged(setting: PfdBearingPointerSource): void {
    this.activeNavigatorIndexSub.pause();

    switch (setting) {
      case PfdBearingPointerSource.Nav1:
        this.setSource('NAV1');
        break;
      case PfdBearingPointerSource.Nav2:
        this.setSource('NAV2');
        break;
      case PfdBearingPointerSource.Gps:
        this.activeNavigatorIndexSub.resume(true);
        break;
      case PfdBearingPointerSource.NearestAirport:
        this.setSource('NRST');
        break;
      default:
        this.setSource(null);
    }
  }

  /**
   * Updates this indicator's GPS source from the current active navigator index.
   * @param activeNavigatorIndex The current active navigator index.
   */
  private updateGpsSource(activeNavigatorIndex: 0 | G3XExternalNavigatorIndex): void {
    switch (activeNavigatorIndex) {
      case 0:
        this.setSource('GPSInt');
        break;
      case 1:
        this.setSource('GPS1');
        break;
      case 2:
        this.setSource('GPS2');
        break;
      default:
        this.setSource(null);
    }
  }
}