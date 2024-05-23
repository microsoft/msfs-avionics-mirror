import {
  AhrsEvents, APValues, CdiControlEvents, CdiDeviation, CdiEvents, CdiUtils, ClockEvents, ControlEvents, EventBus,
  FixTypeFlags, FlightPlanner, FrequencyBank, GeoPoint, GNSSEvents, LNavEvents, LNavUtils, Localizer, NavMath,
  NavRadioEvents, NavSourceId, NavSourceType, NavToNavManager, Radio, RadioEvents, RadioType, RnavTypeFlags,
  Subscribable, SubscribableUtils, Subscription, UnitType
} from '@microsoft/msfs-sdk';

import { Fms } from '../../flightplan/Fms';
import { FmsEvents } from '../../flightplan/FmsEvents';
import { ApproachDetails } from '../../flightplan/FmsTypes';
import { FmsUtils } from '../../flightplan/FmsUtils';

/**
 * A Garmin nav-to-nav manager.
 */
export class GarminNavToNavManager implements NavToNavManager {

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

  public onTransferred = (): void => { };

  private readonly flightPlanner?: FlightPlanner;
  private readonly fms?: Subscribable<Fms>;

  private currentHeading = 0;

  private approachDetails: Readonly<ApproachDetails> = GarminNavToNavManager.EMPTY_APPROACH_DETAILS;

  private nav1Frequency = 0;
  private nav1Localizer?: Localizer;
  private nav1Cdi?: CdiDeviation;
  private nav2Frequency = 0;
  private nav2Localizer?: Localizer;
  private nav2Cdi?: CdiDeviation;

  private activeSource?: Readonly<NavSourceId>;
  private isSourceChanging = false;
  private sourceChangeSub?: Subscription;

  /** Index of nav radio that has a localizer and frequency matches loaded approach. */
  public canArmIndex = 0;
  private navToNavCompleted = false;

  private lnavTrackedLegIndex = -1;

  private readonly planePos = new GeoPoint(0, 0);

  private readonly fmsSubs: Subscription[] = [];

  /**
   * Creates a new instance of GarminNavToNavManager.
   * @param bus The event bus.
   * @param flightPlanner The flight planner of the FMS instance from which to source data. The LNAV instance index
   * associated with the flight planner is assumed to be `0`.
   * @param apValues Autopilot values from this manager's parent autopilot.
   * @deprecated
   */
  public constructor(
    bus: EventBus,
    flightPlanner: FlightPlanner,
    apValues: APValues
  );
  /**
   * Creates a new instance of GarminNavToNavManager.
   * @param bus The event bus.
   * @param fms The FMS from which to source data.
   * @param apValues Autopilot values from this manager's parent autopilot.
   */
  public constructor(
    bus: EventBus,
    fms: Fms | Subscribable<Fms>,
    apValues: APValues
  );
  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(
    private readonly bus: EventBus,
    arg2: FlightPlanner | Fms | Subscribable<Fms>,
    private readonly apValues: APValues
  ) {
    if (arg2 instanceof FlightPlanner) {
      this.flightPlanner = arg2;
    } else {
      this.fms = SubscribableUtils.toSubscribable(arg2, true);
    }

    this.monitorEvents();
  }

  /**
   * Method to monitor nav events to keep track of NAV related data needed for guidance.
   */
  private monitorEvents(): void {
    const sub = this.bus.getSubscriber<
      RadioEvents & CdiEvents & NavRadioEvents & AhrsEvents & GNSSEvents & LNavEvents & ControlEvents & ClockEvents
      & FmsEvents
    >();

    this.sourceChangeSub = sub.on(`cdi_select${CdiUtils.getEventBusTopicSuffix(this.apValues.cdiId)}`)
      .handle(this.handleNavToNavSourceChanged.bind(this), true);

    sub.on('set_radio_state').handle((state) => {
      this.updateRadioState(state);
    });
    sub.on('set_frequency').handle((frequency) => {
      if (frequency.bank == FrequencyBank.Active && frequency.radio.radioType === RadioType.Nav) {
        switch (frequency.radio.index) {
          case 1:
            this.nav1Frequency = Math.round(frequency.frequency * 100) / 100;
            break;
          case 2:
            this.nav2Frequency = Math.round(frequency.frequency * 100) / 100;
        }
        this.updateState();
      }
    });

    sub.on('nav_radio_localizer_1').handle((loc) => {
      this.nav1Localizer = loc;
      this.updateState();
    });
    sub.on('nav_radio_localizer_2').handle((loc) => {
      this.nav2Localizer = loc;
      this.updateState();
    });
    sub.on('nav_radio_cdi_1').handle((cdi) => {
      this.nav1Cdi = cdi;
    });
    sub.on('nav_radio_cdi_2').handle((cdi) => {
      this.nav2Cdi = cdi;
    });
    sub.on(`cdi_select${CdiUtils.getEventBusTopicSuffix(this.apValues.cdiId)}`).handle((source) => this.activeSource = source);
    sub.on('hdg_deg').withPrecision(0).handle((h) => {
      this.currentHeading = h;
    });

    sub.on('gps-position').handle(lla => { this.planePos.set(lla.lat, lla.long); });

    const approachDetailsHandler = (approachDetails: Readonly<ApproachDetails>): void => {
      this.approachDetails = approachDetails;
      this.navToNavCompleted = false;
      this.updateState();
    };

    const approachActivateHandler = (): void => {
      this.navToNavCompleted = false;
    };

    const lnavTrackedLegIndexHandler = (index: number): void => {
      this.lnavTrackedLegIndex = index;
    };

    if (this.fms) {
      this.fms.sub(fms => {
        for (const fmsSub of this.fmsSubs) {
          fmsSub.destroy();
        }
        this.fmsSubs.length = 0;

        this.lnavTrackedLegIndex = -1;
        this.approachDetails = GarminNavToNavManager.EMPTY_APPROACH_DETAILS;
        this.navToNavCompleted = false;
        this.canArmIndex = 0;

        this.fmsSubs.push(
          FmsUtils.onFmsEvent(fms.flightPlanner.id, sub, 'fms_approach_details').handle(approachDetailsHandler),
          FmsUtils.onFmsEvent(fms.flightPlanner.id, sub, 'fms_approach_activate').handle(approachActivateHandler),
          sub.on(`lnav_tracked_leg_index${LNavUtils.getEventBusTopicSuffix(fms.lnavIndex)}`).handle(lnavTrackedLegIndexHandler)
        );
      }, true);
    } else if (this.flightPlanner) {
      FmsUtils.onFmsEvent(this.flightPlanner.id, sub, 'fms_approach_details').handle(approachDetailsHandler);
      FmsUtils.onFmsEvent(this.flightPlanner.id, sub, 'fms_approach_activate').handle(approachActivateHandler);
      sub.on('lnav_tracked_leg_index').handle(lnavTrackedLegIndexHandler);
    }

    sub.on('realTime').atFrequency(1).handle(() => {
      if (!this.navToNavCompleted && !this.isSourceChanging && this.canArmIndex > 0) {
        this.tryAutoSwitchSource();
      }
    });

    this.apValues.approachIsActive.sub((v) => {
      this.updateState();
      if (v) {
        this.navToNavCompleted = false;
      }
    });
  }

  /** @inheritdoc */
  public canLocArm(): boolean {
    return this.canArmIndex > 0;
  }

  /** @inheritdoc */
  public canLocActivate(): boolean {
    if (this.canArmIndex < 1) {
      return false;
    }
    const cdi = this.canArmIndex === 1 ? this.nav1Cdi : this.nav2Cdi;
    const loc = this.canArmIndex === 1 ? this.nav1Localizer : this.nav2Localizer;

    if (cdi && cdi.deviation !== null && Math.abs(cdi.deviation) < 127 && (loc?.course)) {
      const dtk = loc && loc.isValid && loc.course ? loc.course * Avionics.Utils.RAD2DEG : undefined;
      if (dtk === null || dtk === undefined) {
        return false;
      }
      const headingDiff = NavMath.diffAngle(this.currentHeading, dtk);
      if (cdi.deviation > 0 && cdi.deviation < 65 && headingDiff < 0 && headingDiff > -90) {
        return true;
      } else if (cdi.deviation < 0 && cdi.deviation > -65 && headingDiff > 0 && headingDiff < 90) {
        return true;
      } else if (Math.abs(cdi.deviation) < 35 && Math.abs(headingDiff) < 20) {
        return true;
      }
    }
    return false;
  }

  /**
   * Updates the canArmIndex after inputs from the event bus or changes in the approach frequency.
   */
  private updateState(): void {
    if (
      this.approachDetails.referenceFacility
      && (
        // Nav-to-nav supports all approaches that use a localizer except backcourse approaches.
        this.approachDetails.type === ApproachType.APPROACH_TYPE_ILS
        || this.approachDetails.type === ApproachType.APPROACH_TYPE_LOCALIZER
        || this.approachDetails.type === ApproachType.APPROACH_TYPE_LDA
        || this.approachDetails.type === ApproachType.APPROACH_TYPE_SDF
      )
      && this.apValues.approachIsActive.get()
    ) {
      const apprFreq = Math.round(this.approachDetails.referenceFacility.freqMHz * 100) / 100;
      if (apprFreq > 107) {
        if (apprFreq == this.nav1Frequency && this.nav1Localizer && this.nav1Localizer.isValid) {
          this.canArmIndex = 1;
        } else if (apprFreq == this.nav2Frequency && this.nav2Localizer && this.nav2Localizer.isValid) {
          this.canArmIndex = 2;
        } else {
          this.canArmIndex = 0;
        }
      } else {
        this.canArmIndex = 0;
      }
    } else {
      this.canArmIndex = 0;
    }
  }

  /**
   * Updates the nav 1 and nav 2 frequency from the bus.
   * @param radioState A radiostate event.
   */
  private updateRadioState(radioState: Radio): void {
    if (radioState.radioType === RadioType.Nav) {
      switch (radioState.index) {
        case 1:
          this.nav1Frequency = Math.round(radioState.activeFrequency * 100) / 100;
          break;
        case 2:
          this.nav2Frequency = Math.round(radioState.activeFrequency * 100) / 100;
          break;
      }
      this.updateState();
    }
  }

  /**
   * Tries to auto switch the source if criteria are met.
   */
  private tryAutoSwitchSource(): void {
    const flightPlanner = this.fms?.get().flightPlanner ?? this.flightPlanner;
    if (!flightPlanner) {
      return;
    }

    const plan = flightPlanner.hasActiveFlightPlan() && flightPlanner.getActiveFlightPlan();
    const currentLeg = plan && this.lnavTrackedLegIndex >= 0 && this.lnavTrackedLegIndex < plan.length
      ? plan.getLeg(this.lnavTrackedLegIndex)
      : undefined;

    if (
      !this.navToNavCompleted
      && !this.isSourceChanging
      && currentLeg?.calculated?.endLat !== undefined
      && currentLeg?.calculated?.endLon !== undefined
    ) {
      const fafIsActive = (currentLeg.leg.fixTypeFlags & FixTypeFlags.FAF) !== 0;
      const fafDistance = UnitType.GA_RADIAN.convertTo(this.planePos.distance(currentLeg.calculated.endLat, currentLeg.calculated.endLon), UnitType.NMILE);

      if (fafIsActive && fafDistance < 15 && this.canArmIndex > 0 && this.canLocActivate() && this.activeSource?.type === NavSourceType.Gps) {
        this.sourceChangeSub!.resume();
        this.changeSource();
      }
    }
  }

  /**
   * Method to set the HSI/NAV Source to the Can Arm Index.
   */
  public changeSource(): void {
    const navSource: NavSourceId = {
      type: NavSourceType.Nav,
      index: this.canArmIndex
    };
    this.isSourceChanging = true;
    this.bus.getPublisher<CdiControlEvents>()
      .pub(`cdi_src_set${CdiUtils.getEventBusTopicSuffix(this.apValues.cdiId)}`, navSource, true, false);
  }

  /**
   * Callback to handle the nav source changed event when received.
   * @param e is the NavSourceId event
   */
  private handleNavToNavSourceChanged(e: NavSourceId): void {
    if (e.type === NavSourceType.Nav && e.index === this.canArmIndex) {
      this.onTransferred();
      this.isSourceChanging = false;
      this.sourceChangeSub!.pause();
    }
  }
}