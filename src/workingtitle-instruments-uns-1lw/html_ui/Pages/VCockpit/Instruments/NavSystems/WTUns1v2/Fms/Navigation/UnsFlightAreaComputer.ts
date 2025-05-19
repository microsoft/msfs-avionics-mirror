import {
  AdcEvents, BitFlags, ClockEvents, ConsumerValue, EventBus, FacilityType, FlightPlanSegmentType, FlightPlanUtils, GameStateProvider, GeoPoint, Instrument,
  LatLongInterface, LegDefinitionFlags, LegType, NearestContext, SimVarValueType, Subject, Subscribable, UnitType, Wait
} from '@microsoft/msfs-sdk';

import { UnsFlightAreas } from '../UnsFlightAreas';
import { UnsFms } from '../UnsFms';
import { UnsLNavDataEvents } from './UnsLNavDataEvents';
import { UnsPositionSystemEvents } from './UnsPositionSystems';

/** A state in the flight area state machine. */
interface FlightAreaState {
  /** This method is called each update on the active state to determine the next state (it should return itself for no change). */
  nextState: () => UnsFlightAreas;
  /** This method is called on the new state when the state has changed, and before the first update of the new state. */
  onEnterState?: () => void;
  /** This method is called on the old state when the state has changed, and before the the new state {@link onEnterState} is called. */
  onExitState?: () => void;
}

/** A computer that determines the current flight area. */
export class UnsFlightAreaComputer implements Instrument {
  private static readonly TERMINAL_AREA_DISTANCE = UnitType.GA_RADIAN.convertFrom(30, UnitType.NMILE);
  private static readonly OCEANIC_NAVAID_DISTANCE = UnitType.GA_RADIAN.convertFrom(200, UnitType.NMILE);
  private static readonly OCEANIC_NAVAID_HYSTERESIS = UnitType.GA_RADIAN.convertFrom(5, UnitType.NMILE);

  private static readonly geoPointCache = new GeoPoint(NaN, NaN);

  private readonly publisher = this.bus.getPublisher<UnsLNavDataEvents>();

  private isInitialising = false;
  private isInitialised = false;

  // TODO handle takeoff with no origin
  private readonly states: Record<UnsFlightAreas, FlightAreaState> = {
    [UnsFlightAreas.Departure]: {
      nextState: () => {
        if (this.isOnApproach) {
          return UnsFlightAreas.Approach;
        }
        if (this.isOnArrival) {
          return UnsFlightAreas.Arrival;
        }
        if (!this.isOnSid && this.distanceToOrigin > UnsFlightAreaComputer.TERMINAL_AREA_DISTANCE) {
          return UnsFlightAreas.EnRoute;
        }
        return UnsFlightAreas.Departure;
      },
    },
    [UnsFlightAreas.EnRoute]: {
      nextState: () => {
        if (this.isOnApproach) {
          return UnsFlightAreas.Approach;
        }
        if (this.isOnArrival || this.distanceToDestination < UnsFlightAreaComputer.TERMINAL_AREA_DISTANCE) {
          return UnsFlightAreas.Arrival;
        }
        if (this.distanceToNearestNavaid > UnsFlightAreaComputer.OCEANIC_NAVAID_DISTANCE) {
          return UnsFlightAreas.Oceanic;
        }
        return UnsFlightAreas.EnRoute;
      },
    },
    [UnsFlightAreas.Oceanic]: {
      nextState: () => {
        if (this.isOnApproach) {
          return UnsFlightAreas.Approach;
        }
        if (this.isOnArrival || this.distanceToDestination < UnsFlightAreaComputer.TERMINAL_AREA_DISTANCE) {
          return UnsFlightAreas.Arrival;
        }
        // 5 nm hyteresis for going in/out of oceanic
        if (this.distanceToNearestNavaid < (UnsFlightAreaComputer.OCEANIC_NAVAID_DISTANCE - UnsFlightAreaComputer.OCEANIC_NAVAID_HYSTERESIS)) {
          return UnsFlightAreas.EnRoute;
        }
        return UnsFlightAreas.Oceanic;
      },
    },
    [UnsFlightAreas.Arrival]: {
      nextState: () => {
        if (this.isOnApproach) {
          return UnsFlightAreas.Approach;
        }
        if (!this.isOnArrival && this.distanceToDestination > UnsFlightAreaComputer.TERMINAL_AREA_DISTANCE) {
          return UnsFlightAreas.EnRoute;
        }
        return UnsFlightAreas.Arrival;
      },
    },
    [UnsFlightAreas.Approach]: {
      nextState: () => {
        if (!this.isOnApproach) {
          if (this.isOnMissedApproach) {
            return UnsFlightAreas.MissedApproach;
          } else {
            return UnsFlightAreas.Arrival;
          }
        }
        return UnsFlightAreas.Approach;
      },
    },
    [UnsFlightAreas.MissedApproach]: {
      nextState: () => {
        if (this.isOnApproach) {
          return UnsFlightAreas.Approach;
        }
        if (!this.isOnMissedApproach) {
          return UnsFlightAreas.Arrival;
        }
        return UnsFlightAreas.MissedApproach;
      },
    }
  };

  private activeState = UnsFlightAreas.EnRoute;
  private readonly _activeArea = Subject.create(UnsFlightAreas.EnRoute);
  public readonly activeArea: Subscribable<UnsFlightAreas> = this._activeArea;

  private readonly fmsPosition = ConsumerValue.create<LatLongInterface>(this.bus.getSubscriber<UnsPositionSystemEvents>().on('uns_position'), new LatLongAlt({ lat: NaN, long: NaN }));

  private readonly isOnGround = ConsumerValue.create(this.bus.getSubscriber<AdcEvents>().on('on_ground'), false);

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
   * @param fms The instrument FMS
   */
  constructor(
    private readonly bus: EventBus,
    private readonly fms: UnsFms
  ) {
    this.publisher.pub('lnavdata_flight_area', UnsFlightAreas.Departure, true, true);
  }

  /** @inheritdoc */
  public init(): void {
    if (this.isInitialising) {
      console.warn('UnsFlightAreaComputer: multiple init calls!');
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
  private determineInitialState(): UnsFlightAreas {
    // We don't need the Uns air/ground state here, but rather the actual physical state for this one-off check.
    const isOnGround = SimVar.GetSimVarValue('SIM ON GROUND', SimVarValueType.Bool);

    if (isOnGround) {
      return UnsFlightAreas.Departure;
    }
    return UnsFlightAreas.EnRoute;
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

    UnsFlightAreaComputer.geoPointCache.set(fmsPos.lat, fmsPos.long);

    const plan = this.fms.getPrimaryFlightPlan();

    const activeLeg = plan.getLeg(plan.activeLateralLeg);
    const activeSegment = plan.getSegmentFromLeg(activeLeg);
    const activeSegmentType = activeSegment?.segmentType;

    this.isOnSid = activeSegmentType === FlightPlanSegmentType.Departure || activeSegmentType === FlightPlanSegmentType.Origin;
    this.isOnArrival = activeSegmentType === FlightPlanSegmentType.Arrival;
    // We avoid entering approach area while the flight plan is being constructed prior to takeoff (<= 2 waypoints and on ground)..
    // and also when we're inbound to a disconinuity or IF at the beginning of the approach.
    this.isOnApproach = (plan.length > 2 || !this.isOnGround.get())
      && (activeSegmentType === FlightPlanSegmentType.Approach || activeSegmentType === FlightPlanSegmentType.Destination)
      && (
        activeSegment?.legs[0] !== activeLeg ||
        (!!activeLeg && !FlightPlanUtils.isDiscontinuityLeg(activeLeg.leg.type) && activeLeg.leg.type !== LegType.IF
        ));
    this.isOnMissedApproach = activeSegmentType === FlightPlanSegmentType.MissedApproach || (!!activeLeg && BitFlags.isAny(activeLeg.flags, LegDefinitionFlags.MissedApproach));

    const originFacility = this.fms.facilityInfo.originFacility;
    if (originFacility) {
      this.distanceToOrigin = UnsFlightAreaComputer.geoPointCache.distance(originFacility.lat, originFacility.lon);
    }

    const arrivalFacility = this.fms.facilityInfo.destinationFacility;
    if (arrivalFacility) {
      this.distanceToDestination = UnsFlightAreaComputer.geoPointCache.distance(arrivalFacility.lat, arrivalFacility.lon);
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
        UnsFlightAreaComputer.geoPointCache.set(fmsPos.lat, fmsPos.long);
        this.distanceToNearestNavaid = UnsFlightAreaComputer.geoPointCache.distance(nearestNavaid.lat, nearestNavaid.lon);
      } else {
        this.distanceToNearestNavaid = Infinity;
      }
    } else {
      this.distanceToNearestNavaid = NaN;
    }
  }
}
