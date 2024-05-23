import {
  AdcEvents, ArrayUtils, ConsumerSubject, ConsumerValue, EventBus, FlightPlan, FlightPlanner, GeoPoint,
  GlidePathCalculator, GNSSEvents, GPSSystemState, LNavDataEvents, LNavEvents, LNavUtils, MathUtils, RnavTypeFlags,
  SimVarValueType, Subject, Subscribable, SubscribableUtils, UnitType, VNavUtils, VNavVars
} from '@microsoft/msfs-sdk';

import { FmsEvents } from '../../flightplan/FmsEvents';
import { ApproachDetails, FmsFlightPhase } from '../../flightplan/FmsTypes';
import { FmsUtils } from '../../flightplan/FmsUtils';
import { GlidepathServiceLevelCalculator } from './../GlidepathServiceLevelCalculator';
import { BaseGarminVNavDataEvents, GarminVNavDataEvents } from './GarminVNavDataEvents';
import { GarminVNavEvents } from './GarminVNavEvents';
import { GarminVNavGlidepathGuidance, GlidepathServiceLevel } from './GarminVNavTypes';

/**
 * Configuration options for {@link GarminGlidepathComputer}.
 */
export interface GarminGlidepathComputerOptions {
  /** The index of the flight plan for which to provide vertical guidance. Defaults to `0`. */
  primaryPlanIndex?: number;

  /** The index of the LNAV from which to source data. Defaults to `0`. */
  lnavIndex?: number | Subscribable<number>;

  /** Whether to allow +V approach service levels when no SBAS is present. Defaults to `true`. */
  allowPlusVWithoutSbas?: boolean;

  /** Whether to allow approach service levels requiring baro VNAV. Defaults to `false`. */
  allowApproachBaroVNav?: boolean;

  /** Whether to allow RNP (AR) approach service levels. Defaults to `false`. */
  allowRnpAr?: boolean;

  /**
   * The current GPS system state. If not defined, then the computer behaves as if a 3D solution with differential
   * corrections applied is available at all times.
   */
  gpsSystemState?: Subscribable<GPSSystemState>;
}

/**
 * VNAV-related data events used by {@link GarminGlidepathComputer}, keyed by base topic names.
 */
type UsedBaseVNavDataEvents = Pick<BaseGarminVNavDataEvents, 'gp_available'>;

/**
 * A computer that calculates Garmin glidepath guidance for an active flight plan.
 */
export class GarminGlidepathComputer {
  private readonly publisher = this.bus.getPublisher<GarminVNavEvents & GarminVNavDataEvents>();

  private readonly simVarMap: Record<VNavVars, string>;
  private readonly vnavTopicMap: {
    [P in keyof UsedBaseVNavDataEvents]: P | `${P}_${number}`
  };

  private readonly lnavIndex: Subscribable<number>;
  private isLNavIndexValid = false;

  private readonly planePos = new GeoPoint(0, 0);

  private currentAltitude = 0;
  private currentGpsAltitude = 0;

  private readonly fmsFlightPhase = ConsumerValue.create<Readonly<FmsFlightPhase>>(
    FmsUtils.onFmsEvent(this.flightPlanner.id, this.bus, 'fms_flight_phase'),
    {
      isApproachActive: false,
      isToFaf: false,
      isPastFaf: false,
      isInMissedApproach: false
    }
  );

  private readonly approachDetails = ConsumerSubject.create<Readonly<ApproachDetails>>(
    FmsUtils.onFmsEvent(this.flightPlanner.id, this.bus, 'fms_approach_details'),
    {
      isLoaded: false,
      type: ApproachType.APPROACH_TYPE_UNKNOWN,
      isRnpAr: false,
      bestRnavType: RnavTypeFlags.None,
      rnavTypeFlags: RnavTypeFlags.None,
      isCircling: false,
      isVtf: false,
      referenceFacility: null,
      runway: null
    },
    FmsUtils.approachDetailsEquals
  );

  private readonly glidepathServiceLevelCalculator: GlidepathServiceLevelCalculator;
  private readonly glidepathCalculator: GlidePathCalculator;

  private readonly approachHasGp = Subject.create<boolean>(false);
  private readonly gpVerticalDeviation = Subject.create<number | null>(null);
  private readonly gpDistance = Subject.create<number | null>(null);
  private readonly gpFpa = Subject.create<number | null>(null);
  private readonly gpServiceLevel = Subject.create<GlidepathServiceLevel>(GlidepathServiceLevel.None);

  // LNAV Consumer Subjects
  private readonly lnavLegIndex = ConsumerValue.create(null, 0);
  private readonly lnavLegDistanceAlong = ConsumerValue.create(null, 0);
  private readonly lnavDataXtk = ConsumerValue.create(null, 0);
  private readonly lnavDataCdiScale = ConsumerValue.create(null, 4);

  private readonly gpSupported: ConsumerValue<boolean>;

  private readonly primaryPlanIndex: number;
  private readonly gpsSystemState: Subscribable<GPSSystemState>;

  private readonly glidepathGuidanceBuffer: GarminVNavGlidepathGuidance[] = ArrayUtils.create(2, () => {
    return {
      approachHasGlidepath: false,
      isValid: false,
      canCapture: false,
      fpa: 0,
      deviation: 0
    };
  });

  private readonly _glidepathGuidance = Subject.create(
    this.glidepathGuidanceBuffer[0],
    (a, b) => {
      return a.approachHasGlidepath === b.approachHasGlidepath
        && (
          (!a.isValid && !b.isValid)
          || (
            a.isValid === b.isValid
            && a.canCapture === b.canCapture
            && a.fpa === b.fpa
            && a.deviation === b.deviation
          )
        );
    }
  );
  /** The glidepath guidance calculated by this computer. */
  public readonly glidepathGuidance = this._glidepathGuidance as Subscribable<Readonly<GarminVNavGlidepathGuidance>>;

  /**
   * Creates a new instance of GarminGlidepathComputer.
   * @param index The index of this computer.
   * @param bus The event bus.
   * @param flightPlanner The flight planner containing the flight plan for which this computer provides guidance.
   * @param options Options with which to configure the computer.
   */
  public constructor(
    public readonly index: number,
    private readonly bus: EventBus,
    private readonly flightPlanner: FlightPlanner,
    options?: Partial<Readonly<GarminGlidepathComputerOptions>>
  ) {
    if (!VNavUtils.isValidVNavIndex(index)) {
      throw new Error(`GarminGlidepathComputer: invalid index (${index}) specified (must be a non-negative integer)`);
    }

    const simVarSuffix = this.index === 0 ? '' : `:${this.index}`;
    this.simVarMap = {} as Record<VNavVars, string>;
    for (const simVar of Object.values(VNavVars)) {
      this.simVarMap[simVar] = `${simVar}${simVarSuffix}`;
    }

    const eventBusTopicSuffix = VNavUtils.getEventBusTopicSuffix(this.index);
    this.vnavTopicMap = {
      'gp_available': `gp_available${eventBusTopicSuffix}`
    };

    this.lnavIndex = SubscribableUtils.toSubscribable(options?.lnavIndex ?? 0, true);

    this.primaryPlanIndex = options?.primaryPlanIndex ?? 0;
    this.gpsSystemState = options?.gpsSystemState ?? Subject.create(GPSSystemState.DiffSolutionAcquired);

    this.glidepathServiceLevelCalculator = new GlidepathServiceLevelCalculator(
      options?.allowPlusVWithoutSbas ?? true,
      options?.allowApproachBaroVNav ?? false,
      options?.allowRnpAr ?? false,
      this.gpsSystemState,
      this.approachDetails
    );

    this.glidepathCalculator = new GlidePathCalculator(this.bus, this.flightPlanner, this.primaryPlanIndex);

    const sub = this.bus.getSubscriber<LNavEvents & LNavDataEvents & AdcEvents & GNSSEvents & FmsEvents>();

    this.lnavIndex.sub(lnavIndex => {
      this.isLNavIndexValid = LNavUtils.isValidLNavIndex(lnavIndex);
      if (this.isLNavIndexValid) {
        const suffix = LNavUtils.getEventBusTopicSuffix(lnavIndex);
        this.lnavLegIndex.setConsumer(sub.on(`lnav_tracked_leg_index${suffix}`));
        this.lnavLegDistanceAlong.setConsumer(sub.on(`lnav_leg_distance_along${suffix}`));
        this.lnavDataXtk.setConsumer(sub.on(`lnavdata_xtk${suffix}`));
        this.lnavDataCdiScale.setConsumer(sub.on(`lnavdata_cdi_scale${suffix}`));
      } else {
        this.lnavLegIndex.setConsumer(null);
        this.lnavLegDistanceAlong.setConsumer(null);
        this.lnavDataXtk.setConsumer(null);
        this.lnavDataCdiScale.setConsumer(null);
      }
    }, true);

    sub.on('indicated_alt').handle(alt => this.currentAltitude = alt);

    sub.on('gps-position').handle(lla => {
      this.planePos.set(lla.lat, lla.long);
      this.currentGpsAltitude = UnitType.METER.convertTo(lla.alt, UnitType.FOOT);
    });

    this.gpSupported = ConsumerValue.create(FmsUtils.onFmsEvent(this.flightPlanner.id, sub, 'approach_supports_gp'), false);

    this.approachHasGp.sub(v => {
      this.publisher.pub(this.vnavTopicMap['gp_available'], v, true, true);
    });

    this.monitorVars();
  }

  /**
   * Applies the failed state to this computer's glidepath calculations.
   */
  private failGlidepath(): void {
    this.approachHasGp.set(false);
    this.resetGpVars();
  }

  /**
   * Updates this computer.
   */
  public update(): void {
    if (!this.isLNavIndexValid || !this.flightPlanner.hasFlightPlan(this.primaryPlanIndex)) {
      this.failGlidepath();
      this.updateGlidepathGuidance();
      return;
    }

    const lateralPlan = this.flightPlanner.getFlightPlan(this.primaryPlanIndex);

    const alongLegDistance = UnitType.NMILE.convertTo(this.lnavLegDistanceAlong.get(), UnitType.METER);

    const lateralLegIndex = this.lnavLegIndex.get();

    if (
      lateralPlan.length > 0
      && lateralLegIndex < lateralPlan.length
    ) {
      this.manageGlidepath(lateralPlan, lateralLegIndex, alongLegDistance);
    } else {
      this.failGlidepath();
    }

    this.updateGlidepathGuidance();
  }

  /**
   * Updates the glidepath guidance provided by this computer.
   */
  private updateGlidepathGuidance(): void {
    const guidanceBufferActiveIndex = this._glidepathGuidance.get() === this.glidepathGuidanceBuffer[0] ? 0 : 1;
    const guidance = this.glidepathGuidanceBuffer[(guidanceBufferActiveIndex + 1) % 2];

    const fpa = this.gpFpa.get();
    const deviation = this.gpVerticalDeviation.get();

    const fmsFlightPhase = this.fmsFlightPhase.get();

    guidance.approachHasGlidepath = this.approachHasGp.get();

    // Glidepath guidance is valid if and only if...
    const isValid
      // ... FPA and deviation were successfully computed...
      = fpa !== null && deviation !== null
      // ... and the active flight plan leg is to or past the faf but not in the missed approach.
      && (fmsFlightPhase.isToFaf || fmsFlightPhase.isPastFaf) && !fmsFlightPhase.isInMissedApproach;

    guidance.isValid = isValid;

    // Can capture the glidepath if and only if...
    guidance.canCapture
      // ... guidance is valid...
      = isValid
      // ... and FPA is downward sloping...
      && fpa > 0
      // ... and deviation is within limits...
      && deviation <= 100 && deviation >= -15
      // ... and the CDI is at less than full-scale deviation.
      && Math.abs(this.lnavDataXtk.get() / this.lnavDataCdiScale.get()) < 1;

    guidance.fpa = fpa ?? 0;
    guidance.deviation = deviation ?? 0;

    this._glidepathGuidance.set(guidance);
  }

  /**
   * Method to monitor VNavVars.
   */
  private monitorVars(): void {
    // init vnav vars
    this.initVars();

    this.gpVerticalDeviation.sub(dev => SimVar.SetSimVarValue(this.simVarMap[VNavVars.GPVerticalDeviation], SimVarValueType.Feet, dev ?? -1001));
    this.gpDistance.sub(dis => SimVar.SetSimVarValue(this.simVarMap[VNavVars.GPDistance], SimVarValueType.Meters, dis ?? -1));
    this.gpFpa.sub(fpa => SimVar.SetSimVarValue(this.simVarMap[VNavVars.GPFpa], SimVarValueType.Degree, fpa ?? 0));
    this.gpServiceLevel.sub(gpServiceLevel => SimVar.SetSimVarValue(this.simVarMap[VNavVars.GPServiceLevel], SimVarValueType.Number, gpServiceLevel));
  }

  /**
   * Initializes glidepath-related SimVars.
   */
  private initVars(): void {
    SimVar.SetSimVarValue(this.simVarMap[VNavVars.GPServiceLevel], SimVarValueType.Number, GlidepathServiceLevel.None);
    SimVar.SetSimVarValue(this.simVarMap[VNavVars.GPVerticalDeviation], SimVarValueType.Feet, -1001);
    SimVar.SetSimVarValue(this.simVarMap[VNavVars.GPDistance], SimVarValueType.Meters, -1);
    SimVar.SetSimVarValue(this.simVarMap[VNavVars.GPFpa], SimVarValueType.Degree, 0);
  }

  /**
   * Resets glidepath-related SimVars.
   */
  private resetGpVars(): void {
    this.gpServiceLevel.set(GlidepathServiceLevel.None);
    this.gpVerticalDeviation.set(null);
    this.gpDistance.set(null);
    this.gpFpa.set(null);
  }

  /**
   * Manages glidepath state.
   * @param lateralPlan The lateral flight plan.
   * @param activeLegIndex The global index of the active flight plan leg.
   * @param distanceAlongLeg The along-track distance from the start of the active flight plan leg to the airplane's
   * position, in meters.
   */
  private manageGlidepath(lateralPlan: FlightPlan | undefined, activeLegIndex: number, distanceAlongLeg: number): void {
    if (lateralPlan && this.gpSupported.get()) {
      const gpServiceLevel = this.glidepathServiceLevelCalculator.getServiceLevel();

      if (gpServiceLevel !== GlidepathServiceLevel.None) {
        this.gpServiceLevel.set(gpServiceLevel);

        const gpDistance = this.glidepathCalculator.getGlidepathDistance(activeLegIndex, distanceAlongLeg);
        this.gpDistance.set(gpDistance);

        const currentAlt = this.glidepathServiceLevelCalculator.isBaroServiceLevel(gpServiceLevel) ? this.currentAltitude : this.currentGpsAltitude;
        const desiredGPAltitudeFeet = UnitType.METER.convertTo(this.glidepathCalculator.getDesiredGlidepathAltitude(gpDistance), UnitType.FOOT);

        this.gpVerticalDeviation.set(MathUtils.clamp(desiredGPAltitudeFeet - currentAlt, -1000, 1000));
        this.gpFpa.set(this.glidepathCalculator.glidepathFpa);
        this.approachHasGp.set(true);
        return;
      }
    }

    this.approachHasGp.set(false);
    this.resetGpVars();
  }
}
