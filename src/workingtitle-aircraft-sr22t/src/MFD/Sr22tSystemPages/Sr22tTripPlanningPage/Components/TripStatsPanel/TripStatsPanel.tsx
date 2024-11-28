import {
  ClockEvents, ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FlightPlannerEvents, FSComponent, GNSSEvents, LNavDataEvents, MappedSubject,
  Subject, Subscribable, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

import { TripPlanningStore } from '../../../Stores';
import { DisplayFieldData, DisplayFieldFormat, Sr22tTPDisplayField } from '../Shared/Fields/Sr22tTPDisplayField';
import { coordinate, getLegsDistance, getWaypointCoord, getWptsDistance, getWptsTrack, legFlown, sunDate } from '../Shared/TripPlanningCalcs/TripPlanningCalcs';
import { FixModes, InputModes, LegModes } from '../../Sr22tTripPlanningModes';

import '../../Sr22tTripPlanningPage.css';

/** The properties for a Trip Stats Panel component. */
interface TripStatsPanelProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The flight management system. */
  fms: Fms;
  /** The Trip Planning store. */
  store: TripPlanningStore;
}

/** Trip Stats Panel component for the Trip Planning page. */
export class TripStatsPanel extends DisplayComponent<TripStatsPanelProps> {

  private subs: Subscription[] = [];

  // Mode subjects
  private inputMode = this.props.store.inputMode;
  private fixModeSubject = this.props.store.fixMode;
  private legModeSubject = this.props.store.legMode;
  private selectedLegSubject = this.props.store.selectedLeg;

  // Waypoint subjects
  private fromWptSubject = this.props.store.fromWpt;
  private toWptSubject = this.props.store.toWpt;
  private fromCoordSubject: Subject<coordinate> = Subject.create({ lat: 0, lon: 0, });
  private toCoordSubject: Subject<coordinate> = Subject.create({ lat: 0, lon: 0, });

  // Data output from the store
  private data = this.props.store.inputData;

  // Other data source subjects
  private flightPlanCalcSubject = ConsumerSubject.create(this.props.bus.getSubscriber<FlightPlannerEvents>().on('fplCalculated'), null);
  private flightPlanActLegSubject = ConsumerSubject.create(this.props.bus.getSubscriber<FlightPlannerEvents>().on('fplActiveLegChange'), null);
  private flightPlanDestSubject = ConsumerSubject.create(this.props.bus.getSubscriber<FlightPlannerEvents>().on('fplOriginDestChanged'), null);
  private zuluTimeSubject = ConsumerSubject.create(this.props.bus.getSubscriber<GNSSEvents>().on('zulu_time').withPrecision(0), 0);
  private simEpochSubject = ConsumerSubject.create(this.props.bus.getSubscriber<ClockEvents>().on('simTime').withPrecision(-6), 0);
  private activeLegMilesRemSubject = ConsumerSubject.create(this.props.bus.getSubscriber<LNavDataEvents>().on('lnavdata_waypoint_distance').withPrecision(1), 0);  // NM


  // Calculated subjects

  private desiredTrackSubject = MappedSubject.create( // degrees magnetic
    ([fixMode, legMode, selectedLeg, fromCoord, toCoord]): number => {
      const flightPlan = this.props.fms.getFlightPlan();
      if (fixMode === FixModes.FPL && legMode === LegModes.LEG && !legFlown(flightPlan, selectedLeg)) {
        const heading = flightPlan.tryGetLeg(selectedLeg)?.calculated?.initialDtk;
        return heading !== undefined ? heading : -1;  // returning -1 if undefined will cause the display to be dashed out
      } else if (fixMode === FixModes.WPT) {
        const heading = getWptsTrack(fromCoord, toCoord);
        return heading !== undefined ? heading : -1;  // returning -1 if undefined will cause the display to be dashed out
      } else {
        return -1;
      }
    },
    this.fixModeSubject, this.legModeSubject, this.selectedLegSubject,
    this.fromCoordSubject, this.toCoordSubject,
    this.flightPlanCalcSubject, this.flightPlanActLegSubject
  );

  private distanceSubject = MappedSubject.create( // NM
    ([fixMode, fromCoord, toCoord, legMode, selectedLeg, actLegMilesRem]): number => {
      if (fixMode === FixModes.WPT) {
        return getWptsDistance(fromCoord, toCoord);
      } else {
        return getLegsDistance(this.props.fms.getFlightPlan(), legMode, selectedLeg, actLegMilesRem);
      }
    },
    this.fixModeSubject, this.fromCoordSubject, this.toCoordSubject,
    this.legModeSubject, this.selectedLegSubject, this.activeLegMilesRemSubject,
    this.flightPlanCalcSubject
  );

  private eteSubject = MappedSubject.create( // hours or minutes
    ([distance, groundSpeed]): number => {
      if (groundSpeed < 1) { return -1; }
      const hours = distance / groundSpeed;
      if (hours < 1) {
        return hours * 60;  // return minutes
      } else {
        return hours;
      }
    },
    this.distanceSubject, this.data.groundSpeed,
    this.inputMode,
  );

  private etaSubject = MappedSubject.create( // hours UTC
    ([fixMode, inputMode, zuluSeconds, ete, departureHours]): number => {
      if (ete < 0) { return -1; }
      let utcHours;
      if (fixMode === FixModes.FPL && inputMode === InputModes.Auto) {
        utcHours = zuluSeconds / 60 / 60;
      } else {
        utcHours = departureHours;
      }
      return (utcHours + ete) % 24;
    },
    this.fixModeSubject,
    this.inputMode,
    this.zuluTimeSubject,
    this.eteSubject,
    this.data.departureTime,
  );

  private esaSubject = MappedSubject.create( // FT
    (): number => {
      return -1;
    },
  );

  private sunriseSubject = MappedSubject.create( // hours UTC
    ([simEpoch]): number => {

      let lat;
      let lon;

      const flightPlan = this.props.fms.getFlightPlan();

      if (this.fixModeSubject.get() === FixModes.FPL && flightPlan.length > 0) {
        lat = flightPlan.tryGetLeg(flightPlan.length - 1)?.calculated?.endLat;
        lon = flightPlan.tryGetLeg(flightPlan.length - 1)?.calculated?.endLon;
      } else if (this.fixModeSubject.get() === FixModes.WPT) {
        lat = this.toCoordSubject.get().lat;
        lon = this.toCoordSubject.get().lon;
      }

      if (lat !== undefined && lon !== undefined) {
        const sunriseDate = sunDate('rise', lat, lon, simEpoch);
        const hours = sunriseDate.getUTCHours() + (sunriseDate.getUTCMinutes() / 60);
        return hours;
      } else {
        return -1;
      }
    },
    this.simEpochSubject,
    this.flightPlanDestSubject,
    this.flightPlanCalcSubject,
    this.fixModeSubject,
  );

  private sunsetSubject = MappedSubject.create( // hours UTC
    ([simEpoch]): number => {

      let lat;
      let lon;

      const flightPlan = this.props.fms.getFlightPlan();

      if (this.fixModeSubject.get() === FixModes.FPL && flightPlan.length > 0) {
        lat = flightPlan.tryGetLeg(flightPlan.length - 1)?.calculated?.endLat;
        lon = flightPlan.tryGetLeg(flightPlan.length - 1)?.calculated?.endLon;
      } else if (this.fixModeSubject.get() === FixModes.WPT) {
        lat = this.toCoordSubject.get().lat;
        lon = this.toCoordSubject.get().lon;
      }

      if (lat !== undefined && lon !== undefined) {
        const sunsetDate = sunDate('set', lat, lon, simEpoch);
        const hours = sunsetDate.getUTCHours() + (sunsetDate.getUTCMinutes() / 60);
        return hours;
      } else {
        return -1;
      }
    },
    this.simEpochSubject,
    this.flightPlanDestSubject,
    this.flightPlanCalcSubject,
    this.fixModeSubject,
  );


  // Data field properties

  private desiredTrack: DisplayFieldData = {
    title: 'Desired Track',
    value: this.desiredTrackSubject as Subscribable<number>,
    unit: '°',
    decimals: 0,
    minDigits: 3,
    maxDigits: 3,
    format: DisplayFieldFormat.value,
  };

  private distance: DisplayFieldData = {
    title: 'Distance',
    value: this.distanceSubject as Subscribable<number>,
    unit: 'NM',
    decimals: 1,
    minDigits: 1,
    maxDigits: 4,
    format: DisplayFieldFormat.value,
  };

  private estimatedTimeEnroute: DisplayFieldData = {
    title: 'ETE',
    value: this.eteSubject as Subscribable<number>,
    unit: undefined,
    decimals: undefined,
    minDigits: undefined,
    maxDigits: undefined,
    format: DisplayFieldFormat.timePlus,
  };

  private estimatedTimeOfArrival: DisplayFieldData = {
    title: 'ETA',
    value: this.etaSubject as Subscribable<number>,
    unit: 'UTC',
    decimals: undefined,
    minDigits: undefined,
    maxDigits: undefined,
    format: DisplayFieldFormat.timeColon,
  };

  private enrouteSafeAltitude: DisplayFieldData = {
    title: 'ESA',
    value: this.esaSubject as Subscribable<number>,
    unit: 'FT',
    decimals: 0,
    minDigits: 1,
    maxDigits: 5,
    format: DisplayFieldFormat.value,
  };

  private sunrise: DisplayFieldData = {
    title: 'Sunrise',
    value: this.sunriseSubject as Subscribable<number>,
    unit: 'UTC',
    decimals: undefined,
    minDigits: undefined,
    maxDigits: undefined,
    format: DisplayFieldFormat.timeColon,
  };

  private sunset: DisplayFieldData = {
    title: 'Sunset',
    value: this.sunsetSubject as Subscribable<number>,
    unit: 'UTC',
    decimals: undefined,
    minDigits: undefined,
    maxDigits: undefined,
    format: DisplayFieldFormat.timeColon,
  };

  /** @inheritdoc
   */
  public onAfterRender(): void {

    // Add subscriptions to subs array
    this.subs.push(
      this.flightPlanCalcSubject,
      this.flightPlanActLegSubject,
      this.flightPlanDestSubject,
      this.zuluTimeSubject,
      this.simEpochSubject,
      this.activeLegMilesRemSubject,
      this.fromWptSubject.sub(async (n) => {
        this.fromCoordSubject.set(await getWaypointCoord(this.props.bus, n));
      }, true),
      this.toWptSubject.sub(async (n) => {
        this.toCoordSubject.set(await getWaypointCoord(this.props.bus, n));
      }, true),
    );
  }

  /** @inheritdoc
   */
  public render(): VNode {

    return (
      <div class='sr22t-system-page-section sr22t-tp-page-trip-stats'>
        <div class='sr22t-system-page-section-title'>Trip Stats</div>
        <div class='sr22t-system-page-section-content'>
          <div class="tp-page-section-column-full" >
            <Sr22tTPDisplayField data={this.desiredTrack} />
            <Sr22tTPDisplayField data={this.distance} />
            <Sr22tTPDisplayField data={this.estimatedTimeEnroute} />
            <Sr22tTPDisplayField data={this.estimatedTimeOfArrival} />
            <Sr22tTPDisplayField data={this.enrouteSafeAltitude} />
            <Sr22tTPDisplayField data={this.sunrise} />
            <Sr22tTPDisplayField data={this.sunset} />
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public pause(): void {
    this.subs.forEach(sub => sub.pause());
  }

  /** @inheritdoc */
  public resume(): void {
    this.subs.forEach(sub => sub.resume(true));
  }

  /** @inheritdoc */
  public destroy(): void {
    this.subs.forEach(sub => sub.destroy());
  }
}
