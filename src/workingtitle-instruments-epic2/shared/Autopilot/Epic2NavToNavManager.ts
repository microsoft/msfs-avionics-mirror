import {
  APLateralModes, ApproachProcedure, ApproachUtils, APValues, APVerticalModes, BitFlags, CdiDeviation, ClockEvents, ConsumerValue, EventBus, FacilityLoader, GeoPoint,
  Localizer, NavComEvents, NavEvents, NavMath, NavRadioEvents, NavRadioIndex, NavSourceId, NavSourceType, NavToNavManager2, ObsSetting, SimVarValueType, Subject,
  Subscribable, Subscription, VorFacility
} from '@microsoft/msfs-sdk';

import { FlightPlanStore } from '../FlightPlan';
import { DisplayUnitIndices } from '../InstrumentIndices';
import { Epic2GhostNeedleControlEvents, Epic2LNavDataEvents } from '../Navigation';
import { FmsPositionSystemEvents } from '../Systems';
import { Epic2ApPanelEvents, FlightDirectorCouplingFlags } from './Epic2ApPanelPublisher';
import { Epic2FlightArea } from './Epic2FlightAreaComputer';
import { Epic2NavigationSourceEvents } from './Epic2NavSourceEvents';

enum Epic2NavToNavStates {
  /** In this state auto-nav preview is not available, due to manual selection, or coupled AP not in FMS NAV mode. */
  Off,
  /** In this state auto-nav preview is ready to activate when the aircraft gets within range of the destination airport. */
  Armed,
  /**
   * In this state auto-nav preview tunes the radio(s) and activates the ghost pointer.
   */
  ActivatePreview,
  /** In this state the CDI source is automatically switched to the approach NAV. */
  ActivateNav,
}

/** A state in the flight area state machine. */
interface Epic2NavToNavState {
  /** This method is called each update on the active state to determine the next state (it should return itself for no change). */
  nextState: () => Epic2NavToNavStates;
  /** This method is called on the new state when the state has changed, and before the first update of the new state. */
  onEnterState?: () => void;
  /** This method is called on the old state when the state has changed, and before the the new state {@link onEnterState} is called. */
  onExitState?: () => void;
}

/**
 * A manager to handle the auto nav preview function (NavToNav in WT terms).
 * This manages the transition from long range navigation (FMS) to short-range navigation (LOC) on approach.
 */
export class Epic2NavToNavManager implements NavToNavManager2 {
  private static readonly geoPointCache = new GeoPoint(NaN, NaN);

  /** @inheritDoc */
  public readonly isNavToNavManager2 = true;

  private readonly fmsPosition = ConsumerValue.create(null, new LatLongAlt({ lat: NaN, long: NaN }));

  private currentState: Epic2NavToNavStates;
  private flightArea = ConsumerValue.create(this.bus.getSubscriber<Epic2LNavDataEvents>().on('lnavdata_flight_area'), Epic2FlightArea.Departure);
  private referenceFacilityIcao = Subject.create<string | undefined>(undefined);
  private referenceFacility: VorFacility | undefined = undefined;
  private activeNavSourceType?: NavSourceType;
  private coupledSide = ConsumerValue.create(this.bus.getSubscriber<Epic2ApPanelEvents>().on('epic2_ap_fd_coupling'), FlightDirectorCouplingFlags.Left);
  private readonly previewSourceIndex = Subject.create<1 | 2 | 3 | 4>(1);
  private previewSource: NavSourceId = {
    index: 1,
    type: NavSourceType.Nav,
  };
  private readonly obs = ConsumerValue.create<ObsSetting>(null, { heading: 0, source: { index: 0, type: NavSourceType.Nav } });
  private readonly cdi = ConsumerValue.create<CdiDeviation>(null, { source: { index: 0, type: NavSourceType.Nav }, deviation: null });
  private readonly loc = ConsumerValue.create<Localizer>(null, { isValid: false, course: 0, source: { index: 0, type: NavSourceType.Nav } });

  public localizerCourse = 0;

  private cdiSub?: Subscription;

  private readonly states: Record<Epic2NavToNavStates, Epic2NavToNavState> = {
    [Epic2NavToNavStates.Off]: {
      nextState: () => this.canArm() ? Epic2NavToNavStates.Armed : Epic2NavToNavStates.Off,
    },
    [Epic2NavToNavStates.Armed]: {
      nextState: () => {
        if (!this.canArm()) {
          return Epic2NavToNavStates.Off;
        }
        if (this.isCloseToApproachArea()) {
          return Epic2NavToNavStates.ActivatePreview;
        }
        return Epic2NavToNavStates.Armed;
      },
    },
    [Epic2NavToNavStates.ActivatePreview]: {
      onEnterState: this.activateAutoNavPreview.bind(this),
      nextState: () => {
        if (!this.canArm()) {
          return Epic2NavToNavStates.Off;
        }
        if (this.canAutoNavActivate()) {
          return Epic2NavToNavStates.ActivateNav;
        }
        return Epic2NavToNavStates.ActivatePreview;
      },
    },
    [Epic2NavToNavStates.ActivateNav]: {
      onEnterState: this.activateAutoNav.bind(this),
      nextState: () => {
        if (!this.canArm(true)) {
          return Epic2NavToNavStates.Off;
        }
        return Epic2NavToNavStates.ActivateNav;
      },
      onExitState: () => {
        this.cdiSub?.destroy();
        this.cdiSub = undefined;
      },
    }
  };

  /**
   * Ctor.
   * @param bus The instrument event bus.
   * @param apValues The autopilot data values.
   * @param flightPlanStore The flight plan store.
   * @param facLoader The facility loader.
   * @param selectedFmsPosIndex The selected FMS pos system.
   */
  public constructor(
    private readonly bus: EventBus,
    public readonly apValues: APValues,
    private readonly flightPlanStore: FlightPlanStore,
    private readonly facLoader: FacilityLoader,
    selectedFmsPosIndex: Subscribable<number>,
  ) {
    this.currentState = Epic2NavToNavStates.Off;
    this.states[this.currentState].onEnterState?.();

    const sub = this.bus.getSubscriber<NavComEvents & NavEvents & NavRadioEvents>();

    sub.on('nav_localizer_crs_1').whenChanged().handle(x => {
      this.localizerCourse = x ? x * Avionics.Utils.RAD2DEG : x;
    });

    sub.on('cdi_select').handle(x => {
      this.activeNavSourceType = x.type ? x.type : undefined;
    });

    selectedFmsPosIndex.sub((index) => {
      if (index >= 0) {
        this.fmsPosition.setConsumer(this.bus.getSubscriber<FmsPositionSystemEvents>().on(`fms_pos_gps-position_${index}`));
      } else {
        this.fmsPosition.setConsumer(null);
      }
    }, true);

    this.referenceFacilityIcao.sub((icao) => {
      // reset this until we can fetch the new facility (async)
      this.referenceFacility = undefined;

      const approach = this.flightPlanStore.approachProcedure.get();
      if (icao !== undefined && approach) {
        // we can make this type assertion as ApproachUtils.getReferenceFacility will not return any other type for our approach types
        ApproachUtils.getReferenceFacility(approach, this.facLoader).then((fac) => this.referenceFacility = fac as VorFacility | undefined);
      }
    });

    this.previewSourceIndex.sub((navIndex) => {
      this.obs.setConsumer(sub.on(`nav_radio_obs_${navIndex}`));
      this.cdi.setConsumer(sub.on(`nav_radio_cdi_${navIndex}`));
      this.loc.setConsumer(sub.on(`nav_radio_localizer_${navIndex}`));
    }, true);

    this.bus.getSubscriber<ClockEvents>().on('realTime').atFrequency(1).handle(this.onUpdate.bind(this));
  }

  /** @inheritDoc */
  public getArmableNavRadioIndex(): NavRadioIndex | -1 {
    return -1;
  }

  // TODO maybe check if on-side has LOC tuned?

  /** @inheritDoc */
  public getArmableLateralMode(): number {
    return this.canArm() ? APLateralModes.LOC : APLateralModes.NONE;
  }

  /** @inheritDoc */
  public getArmableVerticalMode(): number {
    return this.canArm() ? APVerticalModes.GS : APVerticalModes.NONE;
  }

  /** @inheritDoc */
  public isTransferInProgress(): boolean {
    return false;
  }

  /** @inheritDoc */
  public onBeforeUpdate(): void {
    // noop
  }

  /** @inheritDoc */
  public onAfterUpdate(): void {
    // noop
  }

  /** Method called regularly to update the state. */
  private onUpdate(): void {
    this.updateReferenceFacility();
    this.updateSource();

    let nextState = this.currentState;
    try {
      nextState = this.states[this.currentState].nextState();
    } catch (e) {
      console.error('Epic2NavToNavManager: Failed to get next state!', e);
      nextState = Epic2NavToNavStates.Off;
    }

    if (nextState !== this.currentState) {
      this.states[this.currentState].onExitState?.();

      // eslint-disable-next-line no-console
      console.log(`NavToNav: Changed from state ${Epic2NavToNavStates[this.currentState]} to state ${Epic2NavToNavStates[nextState]}`);

      this.currentState = nextState;

      this.states[this.currentState].onEnterState?.();
    }
  }

  /** Ensure the {@link referenceFacility} is set for the approach in the active flight plan, or cleared if no suitable approach. */
  private updateReferenceFacility(): void {
    const approach = this.flightPlanStore.approachProcedure.get();
    if (!approach || !this.isSuitableApproachType(approach)) {
      this.referenceFacilityIcao.set(undefined);
      return;
    }

    this.referenceFacilityIcao.set(ApproachUtils.getFafOriginIcao(approach));
  }

  /** Updates the coupled source. */
  private updateSource(): void {
    const coupledSide = this.coupledSide.get();

    // TODO don't hardcode indices
    if (coupledSide === FlightDirectorCouplingFlags.Right) {
      this.previewSource.index = 2;
      this.previewSourceIndex.set(2);
    } else {
      this.previewSource.index = 1;
      this.previewSourceIndex.set(1);
    }
  }

  /**
   * Checks whether auto nav preview can arm.
   * @param bypassFmsCheck Whether to bypass the FMS source check.
   * @returns true if we can arm.
   */
  private canArm(bypassFmsCheck = false): boolean {
    const fmsIsActive = bypassFmsCheck || this.activeNavSourceType === NavSourceType.Gps;

    // the facility loading stuff already checks the approach type is appropriate
    const isSuitableApproach = this.referenceFacility !== undefined;

    return this.flightArea.get() !== Epic2FlightArea.Departure && isSuitableApproach && fmsIsActive;
  }

  /**
   * Checks whether an approach is a suitable type for auto-nav preview.
   * Suitable types are ILS, BC, LOC, SDF, LDA.
   * @param approach The selected approach.
   * @returns true if the approach can be previewed.
   */
  private isSuitableApproachType(approach: ApproachProcedure | undefined): boolean {
    // suitable approaches are ILS, BC, LOC, SDF, LDA
    if (!approach) {
      return false;
    }

    const approachType = approach?.approachType;
    switch (approachType) {
      case ApproachType.APPROACH_TYPE_ILS:
      case ApproachType.APPROACH_TYPE_LDA:
      case ApproachType.APPROACH_TYPE_LOCALIZER:
      case ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE:
      case ApproachType.APPROACH_TYPE_SDF:
        return true;
      default:
        return false;
    }
  }

  /**
   * Checks if an approach is eligible for dual-coupling.
   * @param approach The approach to check.
   * @returns true if the approach can be flown dual-coupled.
   */
  private isDualCoupledApproach(approach: ApproachProcedure): boolean {
    return approach?.approachType === ApproachType.APPROACH_TYPE_ILS;
  }

  /**
   * Checks if we are close enough to the approach area to activate auto nav preview.
   * @returns true if on approach or within 30 NM.
   */
  private isCloseToApproachArea(): boolean {
    const destination = this.flightPlanStore.destinationFacility.get();
    if (!destination) {
      return false;
    }

    // TODO handle fms pos invalid
    const fmsPos = this.fmsPosition.get();
    Epic2NavToNavManager.geoPointCache.set(fmsPos.lat, fmsPos.long);
    const distanceToDestination = Epic2NavToNavManager.geoPointCache.distance(destination.lat, destination.lon);
    const flightArea = this.flightArea.get();

    return flightArea === Epic2FlightArea.Approach || (flightArea === Epic2FlightArea.Arrival && distanceToDestination < 30);
  }

  /**
   * Activates auto nav preview.
   * @throws if the state is not as expected.
   */
  private activateAutoNavPreview(): void {
    const approach = this.flightPlanStore.approachProcedure.get();
    if (!approach) {
      throw new Error('No approach in activateAutoNavPreview!');
    }
    if (!this.referenceFacility) {
      throw new Error('No reference facility in activateAutoNavPreview!');
    }

    const approachFrequency = this.referenceFacility.freqMHz;
    const approachCourse = this.localizerCourse;

    // If it's an ILS approach, should we tune both sides for dual coupled?
    const shouldDualCouple = this.isDualCoupledApproach(approach);
    const coupledSide = this.coupledSide.get();

    if (shouldDualCouple || coupledSide === FlightDirectorCouplingFlags.Left) {
      // select left side NAV preview, tune the left side NAV radio, and set course
      this.setNavRadio(1, approachFrequency, approachCourse);
      this.setNavPreviewOn(DisplayUnitIndices.PfdLeft);
    }
    if (shouldDualCouple || coupledSide === FlightDirectorCouplingFlags.Right) {
      // select right side NAV preview, tune the right side NAV radio, and set course
      this.setNavRadio(2, approachFrequency, approachCourse);
      this.setNavPreviewOn(DisplayUnitIndices.PfdRight);
    }
  }

  /**
   * Tunes a nav radio and sets it's course.
   * @param index Index of the nav radio.
   * @param frequency The frequency in MHz.
   * @param course The course in degrees.
   * @returns a promise
   */
  private async setNavRadio(index: number, frequency: number, course: number): Promise<unknown> {
    return Promise.all([
      SimVar.SetSimVarValue(`K:NAV${index}_RADIO_SET_HZ`, 'number', frequency * 1e6),
      SimVar.SetSimVarValue(`K:VOR${index}_SET`, 'number', course),
    ]);
  }

  /**
   * Sets the NAV preview on or off for a given side.
   * @param side The PFD to set nav preview on.
   */
  private setNavPreviewOn(side: DisplayUnitIndices.PfdLeft | DisplayUnitIndices.PfdRight): void {
    if (side === DisplayUnitIndices.PfdLeft) {
      this.bus.getPublisher<Epic2GhostNeedleControlEvents>().pub('epic2_ghost_needle_set_source_1', 'NAV1', true);
    }
    if (side === DisplayUnitIndices.PfdRight) {
      this.bus.getPublisher<Epic2GhostNeedleControlEvents>().pub('epic2_ghost_needle_set_source_4', 'NAV2', true);
    }
  }

  /**
   * Sets the NAV preview on or off for a given side.
   * @param side The PFD to set nav preview on.
   */
  private setNavPreviewOff(side: DisplayUnitIndices.PfdLeft | DisplayUnitIndices.PfdRight): void {
    if (side === DisplayUnitIndices.PfdLeft) {
      this.bus.getPublisher<Epic2GhostNeedleControlEvents>().pub('epic2_ghost_needle_set_source_1', null, true);
    }
    if (side === DisplayUnitIndices.PfdRight) {
      this.bus.getPublisher<Epic2GhostNeedleControlEvents>().pub('epic2_ghost_needle_set_source_4', null, true);
    }
  }

  /**
   * Activates auto nav CDI source.
   * @throws if the state is not as expected.
   */
  private activateAutoNav(): void {
    // this waits for the AP cdi event to fire, then tells the AP the transfer is complete.
    this.cdiSub = this.bus.getSubscriber<NavEvents>().on('cdi_select').handle(() => {
      this.onTransferred();
      this.cdiSub?.destroy();
      this.cdiSub = undefined;
    }, true);

    this.cdiSub.resume(false);

    const topic = this.coupledSide.get() === FlightDirectorCouplingFlags.Left ? 'epic2_navsource_course_needle_left_source_set' : 'epic2_navsource_course_needle_right_source_set';
    this.bus.getPublisher<Epic2NavigationSourceEvents>().pub(topic, this.previewSource, true);

    // turn the nav preview off
    const coupledSides = this.coupledSide.get();
    if (BitFlags.isAll(coupledSides, FlightDirectorCouplingFlags.Left)) {
      this.setNavPreviewOff(DisplayUnitIndices.PfdLeft);
    }
    if (BitFlags.isAll(coupledSides, FlightDirectorCouplingFlags.Right)) {
      this.setNavPreviewOff(DisplayUnitIndices.PfdRight);
    }
  }

  /**
   * Checks if auto nav switching can activate.
   * @returns true when the LOC capture criteria are met.
   */
  private canAutoNavActivate(): boolean {
    // only if armed...
    if (!this.apValues.apApproachModeOn.get()) {
      return false;
    }

    // FIXME this is a copy of APNavDirector.canActivate... need to share it somehow..
    const cdi = this.cdi.get();
    const loc = this.loc.get();
    const obs = this.obs.get();

    const typeIsCorrect = this.previewSource.type === NavSourceType.Nav;
    const index = this.previewSource.index;
    const indexIsCorrect = index == cdi.source.index
      && ((loc.isValid && index == loc.source.index) || (!loc.isValid && index == obs.source.index));
    if (typeIsCorrect && indexIsCorrect && cdi.deviation !== null && Math.abs(cdi.deviation) < 127 && (loc.isValid || obs.heading !== null)) {
      const dtk = loc.isValid ? loc.course * Avionics.Utils.RAD2DEG : obs.heading;
      if (dtk === null || dtk === undefined) {
        return false;
      }
      // TODO use sub for this
      const headingDiff = NavMath.diffAngle(SimVar.GetSimVarValue('PLANE HEADING DEGREES MAGNETIC', SimVarValueType.Degree), dtk);
      const isLoc = loc.isValid ?? false;
      const sensitivity = isLoc ? 1 : .6;
      if (Math.abs(cdi.deviation * sensitivity) < 127 && Math.abs(headingDiff) < 110) {
        return true;
      }
    }
    return false;
  }

  /** @inheritdoc */
  public onTransferred(): void { }
}
