import {
  ClockEvents, ConsumerValue, EventBus, FacilityType, FlightPlanSegmentType, GameStateProvider, GeoPoint, Instrument, NearestContext, SimVarValueType, Subject,
  Subscribable, UnitType, Wait
} from '@microsoft/msfs-sdk';

import { FlightPlanStore } from '../FlightPlan';
import { AirGroundDataProviderEvents } from '../Instruments';
import { Epic2LNavDataEvents } from '../Navigation/Epic2LNavDataEvents';
import { FmsPositionSystemEvents } from '../Systems';

export enum Epic2FlightArea {
  /** Within 30 NM of the origin airport or on a SID. Default RNP 1.0 NM. */
  Departure,
  /** Not in oceanic, terminal, or approach area. Default RNP 2.0 NM. */
  EnRoute,
  /**
   * More than 200 NM from the nearest navaid, more than 30 NM from origin or destination airport,
   * and not flying a terminal area procedure. Default RNP 2.0 NM (or 4.0 NM without APM option).
   */
  Oceanic,
  /** Within 30 NM of the destination airport or on a STAR, but not on approach. Default RNP 1.0 NM. */
  Arrival,
  /** On a path between the IAF and the MAP. Default RNP 0.3 NM. */
  Approach,
  /** On a path between the MAP and the missed approach holding point (MAHWP). Default RNP 1.0 NM. */
  MissedApproach,
}

/** A state in the flight area state machine. */
interface FlightAreaState {
  /** This method is called each update on the active state to determine the next state (it should return itself for no change). */
  nextState: () => Epic2FlightArea;
  /** This method is called on the new state when the state has changed, and before the first update of the new state. */
  onEnterState?: () => void;
  /** This method is called on the old state when the state has changed, and before the the new state {@link onEnterState} is called. */
  onExitState?: () => void;
}

/** A computer that determines the current flight area. */
export class Epic2FlightAreaComputer implements Instrument {
  private static readonly TERMINAL_AREA_DISTANCE = UnitType.GA_RADIAN.convertFrom(30, UnitType.NMILE);
  private static readonly OCEANIC_NAVAID_DISTANCE = UnitType.GA_RADIAN.convertFrom(200, UnitType.NMILE);
  private static readonly OCEANIC_NAVAID_HYSTERESIS = UnitType.GA_RADIAN.convertFrom(5, UnitType.NMILE);

  private static readonly geoPointCache = new GeoPoint(NaN, NaN);

  private readonly publisher = this.bus.getPublisher<Epic2LNavDataEvents>();

  private isInitialising = false;
  private isInitialised = false;

  // TODO handle takeoff with no origin
  private readonly states: Record<Epic2FlightArea, FlightAreaState> = {
    [Epic2FlightArea.Departure]: {
      nextState: () => {
        if (this.isOnApproach) {
          return Epic2FlightArea.Approach;
        }
        if (this.isOnArrival) {
          return Epic2FlightArea.Arrival;
        }
        if (!this.isOnSid && this.distanceToOrigin > Epic2FlightAreaComputer.TERMINAL_AREA_DISTANCE) {
          return Epic2FlightArea.EnRoute;
        }
        return Epic2FlightArea.Departure;
      },
    },
    [Epic2FlightArea.EnRoute]: {
      nextState: () => {
        if (this.isOnApproach) {
          return Epic2FlightArea.Approach;
        }
        if (this.isOnArrival || this.distanceToDestination < Epic2FlightAreaComputer.TERMINAL_AREA_DISTANCE) {
          return Epic2FlightArea.Arrival;
        }
        if (this.distanceToNearestNavaid > Epic2FlightAreaComputer.OCEANIC_NAVAID_DISTANCE) {
          return Epic2FlightArea.Oceanic;
        }
        return Epic2FlightArea.EnRoute;
      },
    },
    [Epic2FlightArea.Oceanic]: {
      nextState: () => {
        if (this.isOnApproach) {
          return Epic2FlightArea.Approach;
        }
        if (this.isOnArrival || this.distanceToDestination < Epic2FlightAreaComputer.TERMINAL_AREA_DISTANCE) {
          return Epic2FlightArea.Arrival;
        }
        // 5 nm hyteresis for going in/out of oceanic
        if (this.distanceToNearestNavaid < (Epic2FlightAreaComputer.OCEANIC_NAVAID_DISTANCE - Epic2FlightAreaComputer.OCEANIC_NAVAID_HYSTERESIS)) {
          return Epic2FlightArea.EnRoute;
        }
        return Epic2FlightArea.Oceanic;
      },
    },
    [Epic2FlightArea.Arrival]: {
      nextState: () => {
        if (this.isOnApproach) {
          return Epic2FlightArea.Approach;
        }
        if (!this.isOnArrival && this.distanceToDestination > Epic2FlightAreaComputer.TERMINAL_AREA_DISTANCE) {
          return Epic2FlightArea.EnRoute;
        }
        return Epic2FlightArea.Arrival;
      },
    },
    [Epic2FlightArea.Approach]: {
      nextState: () => {
        if (!this.isOnApproach) {
          if (this.isOnMissedApproach) {
            return Epic2FlightArea.MissedApproach;
          } else {
            return Epic2FlightArea.Arrival;
          }
        }
        return Epic2FlightArea.Approach;
      },
    },
    [Epic2FlightArea.MissedApproach]: {
      nextState: () => {
        if (this.isOnApproach) {
          return Epic2FlightArea.Approach;
        }
        if (!this.isOnMissedApproach) {
          return Epic2FlightArea.Arrival;
        }
        return Epic2FlightArea.MissedApproach;
      },
    }
  };

  private activeState = Epic2FlightArea.EnRoute;
  private readonly _activeArea = Subject.create(Epic2FlightArea.EnRoute);
  public readonly activeArea: Subscribable<Epic2FlightArea> = this._activeArea;

  private readonly fmsPosition = ConsumerValue.create(null, new LatLongAlt(NaN, NaN));

  private readonly isOnGround = ConsumerValue.create(this.bus.getSubscriber<AirGroundDataProviderEvents>().on('air_ground_is_on_ground'), false);

  private distanceToNearestNavaid = NaN;
  private distanceToOrigin = NaN;
  private distanceToDestination = NaN;

  private isOnSid = false;
  private isOnArrival = false;
  private isOnApproach = false;
  private isOnMissedApproach = false;

  /**
   * Constructs a new flight area computer.
   * @param bus The instrument event bus.
   * @param selectedFmsPosIndex The selected FMS position system.
   * @param flightPlanStore The active flight plan store.
   */
  constructor(
    private readonly bus: EventBus,
    selectedFmsPosIndex: Subscribable<number>,
    private readonly flightPlanStore: FlightPlanStore,
  ) {
    this.publisher.pub('lnavdata_flight_area', Epic2FlightArea.Departure, true, true);

    // TODO handle fms pos invalid
    selectedFmsPosIndex.sub((index) => {
      if (index >= 0) {
        this.fmsPosition.setConsumer(this.bus.getSubscriber<FmsPositionSystemEvents>().on(`fms_pos_gps-position_${index}`));
      } else {
        this.fmsPosition.setConsumer(null);
      }
    }, true);
  }

  /** @inheritdoc */
  public init(): void {
    if (this.isInitialising) {
      console.warn('Epic2FlightAreaComputer: multiple init calls!');
      return;
    }
    this.isInitialising = true;

    Wait.awaitSubscribable(GameStateProvider.get(), state => state === GameState.briefing || state === GameState.ingame, true).then(() => {
      // determine the initial state before we do anything
      this.activeState = this.determineInitialState();
      this._activeArea.set(this.activeState);

      // let the initial state set itself up
      this.states[this.activeState].onEnterState?.();

      this._activeArea.sub((v) => this.publisher.pub('lnavdata_flight_area', v, true, true), true);

      this.isInitialised = true;
    });

    this.bus.getSubscriber<ClockEvents>().on('realTime').atFrequency(10).handle(this.updateNearestNavaid.bind(this));
  }

  /** @inheritdoc */
  public onUpdate(): void {
    if (!this.isInitialised) {
      return;
    }

    this.updateData();

    const newState = this.states[this.activeState].nextState();

    if (newState !== this.activeState) {
      this.states[this.activeState].onExitState?.();

      this.activeState = newState;

      this.states[this.activeState].onEnterState?.();

      this._activeArea.set(this.activeState);
    }
  }

  /**
   * Determines the initial state on instrument boot up.
   * @returns the initial state.
   */
  private determineInitialState(): Epic2FlightArea {
    // We don't need the Epic2 air/ground state here, but rather the actual physical state for this one-off check.
    const isOnGround = SimVar.GetSimVarValue('SIM ON GROUND', SimVarValueType.Bool);

    if (isOnGround) {
      return Epic2FlightArea.Departure;
    }
    return Epic2FlightArea.EnRoute;
  }

  /** Updates the input data. */
  private updateData(): void {
    const fmsPos = this.fmsPosition.get();

    if (isNaN(fmsPos.lat)) {
      this.resetTerminalProcStatus();
      this.distanceToDestination = NaN;
      this.distanceToOrigin = NaN;
      return;
    }

    Epic2FlightAreaComputer.geoPointCache.set(fmsPos.lat, fmsPos.long);

    const activeSegmentType = this.flightPlanStore.activeLegSegmentType.get();
    this.isOnSid = activeSegmentType === FlightPlanSegmentType.Departure || activeSegmentType === FlightPlanSegmentType.Origin;
    this.isOnArrival = activeSegmentType === FlightPlanSegmentType.Arrival;
    // we avoid entering approach area while the flight plan is being constructed prior to takeoff (<= 2 waypoints and on ground)..
    this.isOnApproach = (this.flightPlanStore.planLength.get() > 2 || !this.isOnGround.get())
      && (activeSegmentType === FlightPlanSegmentType.Approach || activeSegmentType === FlightPlanSegmentType.Destination);
    this.isOnMissedApproach = activeSegmentType === FlightPlanSegmentType.MissedApproach;

    const originFacility = this.flightPlanStore.originFacility.get();
    if (originFacility) {
      this.distanceToOrigin = Epic2FlightAreaComputer.geoPointCache.distance(originFacility.lat, originFacility.lon);
    }

    const arrivalFacility = this.flightPlanStore.arrivalFacility.get();
    if (arrivalFacility) {
      this.distanceToDestination = Epic2FlightAreaComputer.geoPointCache.distance(arrivalFacility.lat, arrivalFacility.lon);
    }
  }

  /** Resets the terminal procedure status to all false. */
  private resetTerminalProcStatus(): void {
    this.isOnSid = false;
    this.isOnArrival = false;
    this.isOnApproach = false;
    this.isOnMissedApproach = false;
  }

  /** Updates the nearest navaid. */
  private updateNearestNavaid(): void {
    const fmsPos = this.fmsPosition.get();

    if (NearestContext.isInitialized && !isNaN(fmsPos.lat)) {
      const nearestNavaid = NearestContext.getInstance().getNearest(FacilityType.VOR);
      if (nearestNavaid !== undefined) {
        Epic2FlightAreaComputer.geoPointCache.set(fmsPos.lat, fmsPos.long);
        this.distanceToNearestNavaid = Epic2FlightAreaComputer.geoPointCache.distance(nearestNavaid.lat, nearestNavaid.lon);
      } else {
        this.distanceToNearestNavaid = Infinity;
      }
    } else {
      this.distanceToNearestNavaid = NaN;
    }
  }
}
