import {
  AhrsEvents, APLateralModes, APVerticalModes, BitFlags, CdiEvents, CdiUtils, ClockEvents, ConsumerSubject, ConsumerValue, EventBus,
  FixTypeFlags, FlightPlanner, GeoPoint, GNSSEvents, LNavEvents, LNavUtils, NavRadioIndex, NavRadioTuneEvents, NavSourceId, NavSourceType, RadioUtils,
  RnavTypeFlags, SetSubject, Subject, Subscribable, SubscribableSet, SubscribableSetEventType, SubscribableUtils,
  Subscription, UnitType
} from '@microsoft/msfs-sdk';

import { Fms } from '../../flightplan/Fms';
import { FmsEvents } from '../../flightplan/FmsEvents';
import { ApproachDetails, FmsFlightPhase } from '../../flightplan/FmsTypes';
import { FmsUtils } from '../../flightplan/FmsUtils';
import { LNavDataEvents } from '../../navigation/LNavDataEvents';

/**
 * Configuration options for {@link GarminNavToNavComputer}.
 */
export type GarminNavToNavComputerOptions = {
  /** The ID of the CDI associated with the computer. Defaults to the empty string (`''`). */
  cdiId?: string;

  /** The indexes of the NAV radios that are allowable targets of a CDI source switch. */
  navRadioIndexes?: Iterable<NavRadioIndex> | SubscribableSet<NavRadioIndex>;

  /** The frequency, in hertz, with which the computer updates whether a CDI source switch is allowed. Defaults to `1`. */
  canSwitchUpdateFrequency?: number;

  /**
   * Whether to inhibit multiple CDI source switches for the same approach. If `true`, then after the CDI changes from
   * a GPS source to a NAV source while a CDI source switch is allowed by the computer, further source switches will be
   * disallowed by the computer until the approach is activated again or another approach is loaded.
   */
  inhibitMultipleSwitches?: boolean;
};

/**
 * Data describing a nav radio.
 */
type NavRadioData = {
  /** The radio's tuned active frequency, in megahertz. */
  activeFreq: ConsumerSubject<number>;

  /** Whether the radio is tuned to a localizer. */
  isLocalizer: ConsumerSubject<boolean>;
};

/**
 * A computer that calculates Garmin guidance data for an autopilot nav-to-nav manager.
 *
 * The guidance data produced by the computer allows automatic CDI source switching to be armed while all of the
 * following conditions are met:
 * - A localizer-based approach is loaded and active in the flight plan.
 * - The approach frequency is tuned in the active frequency bank of one or more supported NAV radios.
 *
 * While the guidance data allows automatic CDI source switching to be armed, it also allows the autopilot's LOC and GS
 * modes to be armed.
 *
 * The guidance data allows automatic CDI source switching to occur when the conditions for arming in addition to all
 * of the following conditions are met:
 * - The approach leg ending at the faf fix is active in the flight plan.
 * - The airplane is within 15 nautical miles of the faf fix.
 * - LNAV CDI deviation is less than 1.2 times full-scale deviation.
 */
export class GarminNavToNavComputer {
  private static readonly EMPTY_APPROACH_DETAILS: Readonly<ApproachDetails> = {
    isLoaded: false,
    type: ApproachType.APPROACH_TYPE_UNKNOWN,
    isRnpAr: false,
    bestRnavType: RnavTypeFlags.None,
    rnavTypeFlags: RnavTypeFlags.None,
    isCircling: false,
    isVtf: false,
    referenceFacility: null,
    runway: null
  };

  private readonly cdiId: string;

  private readonly flightPlanner?: FlightPlanner;
  private readonly fms?: Subscribable<Fms>;

  private readonly navRadioIndexes: SubscribableSet<NavRadioIndex>;
  private readonly navRadioData: (NavRadioData | undefined)[] = [];

  private readonly inhibitMultipleSwitches: boolean;

  private readonly cdiSource = ConsumerSubject.create<Readonly<NavSourceId> | undefined>(null, undefined);

  private readonly planePos = new GeoPoint(0, 0);

  private lnavIsTracking = false;
  private readonly lnavDataXtk = ConsumerValue.create(null, 0);
  private readonly lnavDataCdiScale = ConsumerValue.create(null, 1);

  private approachDetails = GarminNavToNavComputer.EMPTY_APPROACH_DETAILS;
  private isApproachActive = false;

  private inhibitSwitchArmed = false;
  private inhibitSwitch = false;

  private readonly _armableNavRadioIndex = Subject.create<NavRadioIndex | -1>(-1);
  /**
   * The index of the NAV radio that can be armed for a CDI source switch, or `-1` if a CDI source switch cannot be
   * armed.
   */
  public readonly armableNavRadioIndex = this._armableNavRadioIndex as Subscribable<NavRadioIndex | -1>;

  private readonly _armableLateralMode = Subject.create<number>(APLateralModes.NONE);
  /**
   * The autopilot lateral mode that can be armed prior to a CDI source switch, or `APLateralModes.NONE` if no modes
   * can be armed.
   */
  public readonly armableLateralMode = this._armableLateralMode as Subscribable<number>;

  private readonly _armableVerticalMode = Subject.create<number>(APVerticalModes.NONE);
  /**
   * The autopilot vertical mode that can be armed prior to a CDI source switch, or `APVerticalModes.NONE` if no modes
   * can be armed.
   */
  public readonly armableVerticalMode = this._armableVerticalMode as Subscribable<number>;

  private readonly _canSwitchCdi = Subject.create(false);
  /** Whether a CDI source switch is allowed at the current time. */
  public readonly canSwitchCdi = this._canSwitchCdi as Subscribable<boolean>;

  private readonly fmsSubs: Subscription[] = [];

  private readonly canSwitchUpdateSub: Subscription;
  private readonly inhibitSwitchSub?: Subscription;

  /**
   * Creates a new instance of GarminNavToNavComputer.
   * @param bus The event bus.
   * @param fms The FMS from which to source data.
   * @param options Options with which to configure the computer.
   */
  public constructor(
    bus: EventBus,
    fms: Fms | Subscribable<Fms>,
    options?: Readonly<GarminNavToNavComputerOptions>
  );
  /**
   * Creates a new instance of GarminNavToNavComputer.
   * @param bus The event bus.
   * @param flightPlanner The flight planner from which to source data.
   * @param options Options with which to configure the computer.
   */
  public constructor(
    bus: EventBus,
    flightPlanner: FlightPlanner,
    options?: Readonly<GarminNavToNavComputerOptions>
  );
  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(
    private readonly bus: EventBus,
    arg2: Fms | Subscribable<Fms> | FlightPlanner,
    options?: Readonly<GarminNavToNavComputerOptions>
  ) {
    if (arg2 instanceof FlightPlanner) {
      this.flightPlanner = arg2;
    } else {
      this.fms = SubscribableUtils.toSubscribable(arg2, true);
    }

    this.cdiId = options?.cdiId ?? '';

    this.navRadioIndexes = SubscribableUtils.isSubscribableSet(options?.navRadioIndexes)
      ? options.navRadioIndexes
      : SetSubject.create(options?.navRadioIndexes);

    this.inhibitMultipleSwitches = options?.inhibitMultipleSwitches ?? false;

    const sub = this.bus.getSubscriber<CdiEvents & AhrsEvents & GNSSEvents & LNavEvents & LNavDataEvents & ClockEvents & FmsEvents>();

    if (this.inhibitMultipleSwitches) {
      this.cdiSource.setConsumer(sub.on(`cdi_select${CdiUtils.getEventBusTopicSuffix(this.cdiId)}`));
      this.inhibitSwitchSub = this.cdiSource.sub(this.onCdiSourceChanged.bind(this), false, true);
    }

    this.canSwitchUpdateSub = sub.on('realTime').atFrequency(options?.canSwitchUpdateFrequency ?? 1).handle(this.updateCanSwitchCdi.bind(this), true);

    sub.on('gps-position').handle(lla => { this.planePos.set(lla.lat, lla.long); });

    const approachDetailsHandler = this.onApproachDetailsChanged.bind(this);

    const fmsFlightPhaseHandler = this.onFmsFlightPhaseChanged.bind(this);

    const approachActivatedHandler = this.onApproachActivated.bind(this);

    const lnavIsTrackingHandler = (isTracking: boolean): void => { this.lnavIsTracking = isTracking; };

    if (this.fms) {
      this.fms.sub(fms => {
        for (const fmsSub of this.fmsSubs) {
          fmsSub.destroy();
        }
        this.fmsSubs.length = 0;

        this.lnavIsTracking = false;

        this.approachDetails = GarminNavToNavComputer.EMPTY_APPROACH_DETAILS;
        this.isApproachActive = false;

        this.updateArmableState();

        const lnavTopicSuffix = LNavUtils.getEventBusTopicSuffix(fms.lnavIndex);

        this.fmsSubs.push(
          FmsUtils.onFmsEvent(fms.flightPlanner.id, sub, 'fms_approach_details').handle(approachDetailsHandler),
          FmsUtils.onFmsEvent(fms.flightPlanner.id, sub, 'fms_flight_phase').handle(fmsFlightPhaseHandler),

          sub.on(`lnav_is_tracking${lnavTopicSuffix}`).handle(lnavIsTrackingHandler)
        );

        this.lnavDataXtk.setConsumer(sub.on(`lnavdata_xtk${lnavTopicSuffix}`));
        this.lnavDataCdiScale.setConsumer(sub.on(`lnavdata_cdi_scale${lnavTopicSuffix}`));

        if (this.inhibitMultipleSwitches) {
          this.fmsSubs.push(
            FmsUtils.onFmsEvent(fms.flightPlanner.id, sub, 'fms_approach_activate').handle(approachActivatedHandler)
          );
        }
      }, true);
    } else if (this.flightPlanner) {
      FmsUtils.onFmsEvent(this.flightPlanner.id, sub, 'fms_approach_details').handle(approachDetailsHandler);
      FmsUtils.onFmsEvent(this.flightPlanner.id, sub, 'fms_flight_phase').handle(fmsFlightPhaseHandler);
      sub.on('lnav_is_tracking').handle(lnavIsTrackingHandler);

      this.lnavDataXtk.setConsumer(sub.on('lnavdata_xtk'));
      this.lnavDataCdiScale.setConsumer(sub.on('lnavdata_cdi_scale'));

      if (this.inhibitMultipleSwitches) {
        FmsUtils.onFmsEvent(this.flightPlanner.id, sub, 'fms_approach_activate').handle(approachActivatedHandler);
      }
    }

    this.navRadioIndexes.sub(this.onNavRadioIndexesChanged.bind(this), true);
  }

  /**
   * Responds to when this computer's supported NAV radio indexes change.
   * @param set The set containing the supported NAV radio indexes.
   * @param type The type of change that occurred.
   * @param index The NAV radio index that was added or removed.
   */
  private onNavRadioIndexesChanged(set: ReadonlySet<NavRadioIndex>, type: SubscribableSetEventType, index: NavRadioIndex): void {
    if (type === SubscribableSetEventType.Deleted) {
      const data = this.navRadioData[index];
      if (data) {
        data.activeFreq.destroy();
        data.isLocalizer.destroy();
        this.navRadioData[index] = undefined;
      }
    } else {
      if (!this.navRadioData[index]) {
        const sub = this.bus.getSubscriber<NavRadioTuneEvents>();

        const updateState = this.updateArmableState.bind(this);

        const activeFreq = ConsumerSubject.create(sub.on(`nav_active_frequency_${index}`), 0);
        const isLocalizer = ConsumerSubject.create(sub.on(`nav_localizer_${index}`), false);

        activeFreq.sub(updateState);
        isLocalizer.sub(updateState);

        this.navRadioData[index] = {
          activeFreq,
          isLocalizer
        };
      }
    }

    this.updateArmableState();
  }

  /**
   * Responds to when the FMS approach details change.
   * @param approachDetails The new FMS approach details.
   */
  private onApproachDetailsChanged(approachDetails: Readonly<ApproachDetails>): void {
    const didChange = !FmsUtils.approachDetailsEquals(approachDetails, this.approachDetails);

    this.approachDetails = approachDetails;

    if (didChange) {
      this.inhibitSwitchArmed = false;
      this.inhibitSwitch = false;
      this.updateArmableState();
    }
  }

  /**
   * Responds to when the FMS flight phase changes.
   * @param flightPhase The new FMS flight phase.
   */
  private onFmsFlightPhaseChanged(flightPhase: Readonly<FmsFlightPhase>): void {
    const isApproachActive = flightPhase.isApproachActive;

    if (isApproachActive !== this.isApproachActive) {
      this.inhibitSwitchArmed = false;
      this.inhibitSwitch = false;
      this.isApproachActive = isApproachActive;
      this.updateArmableState();
    }
  }

  /**
   * Responds to when the FMS flight phase changes.
   */
  private onApproachActivated(): void {
    this.inhibitSwitchArmed = false;
    this.inhibitSwitch = false;
  }

  /**
   * Responds to when the source for this computer's associated CDI changes.
   * @param source The new CDI source.
   */
  private onCdiSourceChanged(source: Readonly<NavSourceId> | undefined): void {
    if (source === undefined) {
      return;
    }

    if (this.inhibitSwitchArmed) {
      if (source.type === NavSourceType.Nav) {
        this.inhibitSwitch = true;
        this.inhibitSwitchArmed = false;
        this.inhibitSwitchSub!.pause();
      }
    } else if (source.type === NavSourceType.Gps) {
      this.inhibitSwitchArmed = true;
    }
  }

  /**
   * Updates the CDI switch armable state calculated by this computer.
   */
  private updateArmableState(): void {
    let armableNavRadioIndex: NavRadioIndex | -1 = -1;

    if (
      this.approachDetails.referenceFacility
      && (
        // Nav-to-nav supports all approaches that use a localizer except backcourse approaches.
        this.approachDetails.type === ApproachType.APPROACH_TYPE_ILS
        || this.approachDetails.type === ApproachType.APPROACH_TYPE_LOCALIZER
        || this.approachDetails.type === ApproachType.APPROACH_TYPE_LDA
        || this.approachDetails.type === ApproachType.APPROACH_TYPE_SDF
      )
      && this.isApproachActive
    ) {
      const apprFreq = this.approachDetails.referenceFacility.freqMHz;

      if (RadioUtils.isLocalizerFrequency(apprFreq)) {
        for (let i = 1 as NavRadioIndex; i < 5; i++) {
          const data = this.navRadioData[i];
          if (
            data
            && Math.abs(data.activeFreq.get() - apprFreq) < 1e-3
            && data.isLocalizer.get()
          ) {
            armableNavRadioIndex = i;
            break;
          }
        }
      }
    }

    this._armableNavRadioIndex.set(armableNavRadioIndex);

    if (armableNavRadioIndex === -1) {
      this.canSwitchUpdateSub.pause();
      this._canSwitchCdi.set(false);

      this._armableLateralMode.set(APLateralModes.NONE);
      this._armableVerticalMode.set(APVerticalModes.NONE);
    } else {
      this.canSwitchUpdateSub.resume(true);

      this._armableLateralMode.set(APLateralModes.LOC);
      this._armableVerticalMode.set(APVerticalModes.GS);
    }
  }

  /**
   * Updates whether a CDI switch is allowed at the current time.
   */
  private updateCanSwitchCdi(): void {
    let canSwitchCdi = false;

    if (!this.inhibitSwitch) {
      const armedNavIndex = this._armableNavRadioIndex.get();

      if (armedNavIndex !== -1 && this.lnavIsTracking) {
        const flightPlanner = this.fms?.get().flightPlanner ?? this.flightPlanner;
        if (flightPlanner) {
          const plan = flightPlanner.hasActiveFlightPlan() ? flightPlanner.getActiveFlightPlan() : undefined;
          const activeLeg = plan?.tryGetLeg(plan.activeLateralLeg);

          const deviation = Math.abs(this.lnavDataXtk.get() / this.lnavDataCdiScale.get());

          if (
            activeLeg
            && BitFlags.isAny(activeLeg.leg.fixTypeFlags, FixTypeFlags.FAF)
            && activeLeg.calculated
            && activeLeg.calculated.endLat !== undefined
            && activeLeg.calculated.endLon !== undefined
            && isFinite(deviation) && deviation < 1.2
          ) {
            const distanceToFaf = UnitType.GA_RADIAN.convertTo(this.planePos.distance(activeLeg.calculated.endLat, activeLeg.calculated.endLon), UnitType.NMILE);
            if (distanceToFaf < 15) {
              canSwitchCdi = true;
            }
          }
        }
      }
    }

    if (this.inhibitSwitchSub) {
      if (canSwitchCdi) {
        this.inhibitSwitchSub.resume(true);
      } else {
        this.inhibitSwitchArmed = false;
        this.inhibitSwitchSub.pause();
      }
    }

    this._canSwitchCdi.set(canSwitchCdi);
  }
}
