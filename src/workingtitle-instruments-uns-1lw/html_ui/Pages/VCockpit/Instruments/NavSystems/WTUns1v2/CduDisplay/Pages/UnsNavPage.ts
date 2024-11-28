import {
  Accessible, AdcEvents, AhrsEvents, ApproachProcedure, BitFlags, ConsumerSubject, DateTimeFormatter, DisplayField, DmsFormatter2, EventBus, FacilityType,
  FlightPlanActiveLegEvent, FlightPlanCalculatedEvent, FlightPlanCopiedEvent, FlightPlanIndicationEvent, FlightPlanLegEvent, FlightPlannerEvents,
  FlightPlanSegmentEvent, FlightPlanUtils, FmcFormatter, FmcRenderTemplate, GeoPoint, GeoPointInterface, GeoPointSubject, GNSSEvents, ICAO, LegDefinition,
  LegType, LNavDataEvents, LNavEvents, MappedSubject, NavMath, NumberFormatter, PageLinkField, Predictions, Subject, Subscription, UnitType
} from '@microsoft/msfs-sdk';

import { UnsLNavConfig } from '../../Config/LNavConfigBuilder';
import { UnsApproachState, UnsExtraLegDefinitionFlags, UnsFlightPlans, UnsFms, UnsFmsUtils, UnsLegAnnotationFormat } from '../../Fms';
import { UnsApproachEvents } from '../../Fms/Navigation/UnsApproachStateController';
import { UnsLNavDataEvents } from '../../Fms/Navigation/UnsLNavDataEvents';
import { UnsLnavControlEvents, UnsLnavMode, UnsLnavSteeringStateEvents } from '../../Fms/Navigation/UnsLnavSteeringController';
import { UnsPositionSystemEvents } from '../../Fms/Navigation/UnsPositionSystems';
import { UnsTextInputField } from '../Components/UnsTextInputField';
import { UnsChars } from '../UnsCduDisplay';
import { UnsCduFormatters } from '../UnsCduIOUtils';
import { UnsCduCursorPath, UnsFmcPage } from '../UnsFmcPage';

/**
 * An entry for a leg on the NAV page
 */
interface NavLeg {
  /** The leg definition associated with this NAV leg */
  leg: LegDefinition,

  /** The global leg index associated with this NAV leg */
  legIndex: number,

  /** Whether the leg is a PPOS point */
  isPpos: boolean,

  /** Whether the leg is PVOR origin leg */
  isPVorOrigin: boolean,
}

/**
 * Formatter for leg definitions on the NAV page.
 */
class UnsNavLegFormatter implements FmcFormatter<readonly [NavLeg, Map<number, Predictions | undefined>, number | null]> {
  private static readonly LEG_POSITION_TEXT: Record<'from' | 'to' | 'next', string> = {
    from: 'FR',
    to: 'TO',
    next: 'NX',
  };

  private static readonly LEG_ETA_FORMATTER = DateTimeFormatter.create('{HH}:{mm}', { nanString: '--:--' });
  private static readonly LEG_ETE_FORMATTER = DateTimeFormatter.create('{H}+{mm}', { nanString: '-+--' });

  private readonly render: FmcRenderTemplate = [
    [],
    [],
  ];

  /**
   * Ctor
   *
   * @param legPosition the display position of the leg
   * @param pageOverlayShown an accessible telling whether the page overlay is shown or not
   */
  constructor(private readonly legPosition: 'from' | 'to' | 'next', private readonly pageOverlayShown: Accessible<boolean>) {
  }

  nullValueString = this.legPosition !== 'from' ? [
    [`${' '.repeat(18)}[white] [line-tb-l]`],
    [`${UnsNavLegFormatter.LEG_POSITION_TEXT[this.legPosition]}[cyan s-text] ${'-'.repeat(10)}[white d-text]     [white] [line-tb-l]`],
  ] : [
    [`${UnsNavLegFormatter.LEG_POSITION_TEXT[this.legPosition]}[cyan s-text] ${'-'.repeat(10)}[white d-text]     [white] [line-tb-l]`],
  ];

  /** @inheritDoc */
  format([navLeg, predictions, toLegDtg]: readonly [NavLeg | null, Map<number, Predictions | undefined>, number | null]): FmcRenderTemplate {
    if (!navLeg) {
      return this.nullValueString;
    }

    const { leg, legIndex, isPpos, isPVorOrigin } = navLeg;
    const legPredictions = predictions.get(legIndex);

    const legColor = this.legPosition === 'to' ? 'magenta' : 'white';
    const showPredictions = !isPVorOrigin && !FlightPlanUtils.isManualDiscontinuityLeg(leg.leg.type) && legPredictions;

    const pageFormat = this.pageOverlayShown.get() ? UnsLegAnnotationFormat.NavCompact : UnsLegAnnotationFormat.Nav;

    const legAnnotationString = UnsFmsUtils.buildUnsLegAnnotation(leg, leg.calculated, undefined, pageFormat, toLegDtg);
    const legEteString = showPredictions && this.legPosition !== 'from' ? UnsNavLegFormatter.LEG_ETE_FORMATTER(legPredictions.duration * 1000) : '    ';
    const topLineStyle = this.legPosition === 'from' ? 'line-mb-l' : 'line-tb-l';
    const legPositionString = UnsNavLegFormatter.LEG_POSITION_TEXT[this.legPosition];
    let nameToShow: string;
    if (isPpos) {
      nameToShow = '(PPOS)';
    } else if (isPVorOrigin) {
      nameToShow = '(PVOR)';
    } else if (FlightPlanUtils.isDiscontinuityLeg(leg.leg.type)) {
      nameToShow = '-'.repeat(10);
    } else {
      nameToShow = leg.name ?? 'NONAME';
    }
    const legNameString = nameToShow.padEnd(8, ' ');

    const legEta = showPredictions ? legPredictions.estimatedTimeOfArrival * 1000 : 0;
    const legTimeString = showPredictions ? UnsNavLegFormatter.LEG_ETA_FORMATTER(legEta) : '     ';

    (this.legPosition !== 'from') && (this.render[0][0] = `${legAnnotationString.padEnd(14, ' ')}${legEteString}[${legColor}] [${topLineStyle}]`);
    this.render[this.legPosition !== 'from' ? 1 : 0][0] = `${legPositionString}[cyan s-text] ${legNameString}  ${legTimeString}[${legColor} d-text] [line-tb-l]`;

    return this.render;
  }
}

enum NavPageHdgSelState {
  Idle,
  WaitForHeadingConfirm,
  WaitForTurnDirectionConfirm,
  WaitForDeltaHeadingConfirm,
}

/**
 * Store for {@link UnsNavPage}
 */
class UnsNavPageStore {
  /**
   * Ctor
   *
   * @param bus the event bus
   * @param lnavIndex the LNAV index
   * @param fms fms class
   */
  constructor(private readonly bus: EventBus, private readonly lnavIndex: UnsLNavConfig['index'], private readonly fms: UnsFms) {
    MappedSubject.create(this.lnavMode, this.apprState, this.approach, this.toLeg, this.nextLeg)
      .sub(([lnavMode, apprState, approach, toLeg, nextLeg]) => this.updateNavMessage(lnavMode, apprState, approach, toLeg?.leg ?? null, nextLeg?.leg ?? null), true);
  }

  /**
   * Updates the NAV page message given inputs
   *
   * @param lnavMode the current LNAV mode
   * @param apprState the current approach status
   * @param approach the current aircraft approach
   * @param activeLeg the active leg
   * @param nextLeg the next leg
   */
  private updateNavMessage(
    lnavMode: UnsLnavMode | null,
    apprState: UnsApproachState,
    approach: ApproachProcedure | null,
    activeLeg: LegDefinition | null,
    nextLeg: LegDefinition | null,
  ): void {
    let message = '';

    if (activeLeg !== null && FlightPlanUtils.isHoldLeg(activeLeg.leg.type)) {
      message = '        HOLDING[magenta s-text]';
    } else if (nextLeg !== null && FlightPlanUtils.isHoldLeg(nextLeg.leg.type)) {
      message = '        HOLD ARMED[magenta s-text]';
    } else if (apprState === UnsApproachState.Armed) {
      message = '    APPR ARMED[magenta s-text]';
    } else if (approach && apprState === UnsApproachState.Active) {
      const destination = this.fms.getPrimaryFlightPlan().destinationAirport;
      message = `${ICAO.getIdent(destination ?? 'NO ICAO')} ${UnsFmsUtils.getApproachNameAsString(approach)}[magenta s-text]`;
    } else if (lnavMode === UnsLnavMode.Heading) {
      message = '     HDG SEL[magenta s-text]';
    }

    this.navMessage.set(message);
  }

  public readonly navMessage = Subject.create('');

  public readonly fromLeg = Subject.create<NavLeg | null>(null, () => false);

  public readonly toLeg = Subject.create<NavLeg | null>(null, () => false);

  public readonly nextLeg = Subject.create<NavLeg | null>(null, () => false);

  public readonly xtk = ConsumerSubject.create(this.bus.getSubscriber<LNavEvents>().on(`lnav_xtk_${this.lnavIndex}`), null);

  public readonly dtk = ConsumerSubject.create(this.bus.getSubscriber<LNavEvents>().on(`lnav_dtk_${this.lnavIndex}`), null);

  public readonly track = ConsumerSubject.create(this.bus.getSubscriber<GNSSEvents>().on('track_deg_magnetic').atFrequency(1), null);

  public readonly heading = ConsumerSubject.create(this.bus.getSubscriber<AhrsEvents>().on('hdg_deg'), null);

  public readonly tke = MappedSubject.create(([track, dtk]) => (track ?? NaN) - (dtk ?? NaN), this.track, this.dtk);

  public readonly dtg = ConsumerSubject.create(this.bus.getSubscriber<UnsLNavDataEvents>().on(`lnavdata_waypoint_distance_${this.lnavIndex}`).atFrequency(1), 0);

  public readonly windDirection = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('ambient_wind_direction').atFrequency(1), null);

  public readonly windVelocity = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('ambient_wind_velocity').atFrequency(1), null);

  public readonly groundSpeed = ConsumerSubject.create(this.bus.getSubscriber<GNSSEvents>().on('ground_speed'), null);

  public readonly bearing = ConsumerSubject.create(this.bus.getSubscriber<LNavDataEvents>().on(`lnavdata_waypoint_bearing_mag_${this.lnavIndex}`), null);

  public readonly anp = ConsumerSubject.create(this.bus.getSubscriber<UnsPositionSystemEvents>().on('uns_anp'), 0);

  public readonly position = ConsumerSubject.create(this.bus.getSubscriber<GNSSEvents>().on('gps-position'), null);

  public readonly lnavMode = ConsumerSubject.create(this.bus.getSubscriber<UnsLnavSteeringStateEvents>().on('uns_lnav_mode'), null);

  public readonly commandedHeading = ConsumerSubject.create(this.bus.getSubscriber<UnsLnavSteeringStateEvents>().on('uns_lnav_commanded_heading').whenChanged(), null);

  public readonly commandedTurnDirection = ConsumerSubject.create(this.bus.getSubscriber<UnsLnavSteeringStateEvents>().on('uns_lnav_commanded_turn_direction').whenChanged(), null);

  public readonly commandedHeadingEntryState = Subject.create(NavPageHdgSelState.Idle);

  public readonly pendingCommandedHeadingValue = Subject.create<number | null>(null);

  public readonly pendingCommandedHeadingTurnDirection = Subject.create<'left' | 'right' | null>(null);

  public readonly eoaLegIndex = Subject.create(-1);

  public readonly eoaPosition = GeoPointSubject.create(new GeoPoint(NaN, NaN));

  public readonly approach = Subject.create<ApproachProcedure | null>(null);

  public readonly apprState = ConsumerSubject.create<UnsApproachState>(this.bus.getSubscriber<UnsApproachEvents>().on('current_state'), UnsApproachState.None);

  public readonly nextApprState = ConsumerSubject.create<UnsApproachState>(this.bus.getSubscriber<UnsApproachEvents>().on('next_state'), UnsApproachState.None);

  public readonly predictions = Subject.create<Map<number, Predictions | undefined>>(new Map());
}

/**
 * Controller for {@linnk UnsNavPage}
 */
class UnsNavPageController {
  private readonly subscriptions: Subscription[] = [];

  /**
   * Ctor
   *
   * @param bus the event bus
   * @param store the nav page store
   * @param fms the fms
   */
  constructor(private readonly bus: EventBus, private readonly store: UnsNavPageStore, private readonly fms: UnsFms) {
    this.updateStoreFromFlightPlan();

    const fplSub = this.bus.getSubscriber<FlightPlannerEvents>();

    this.subscriptions.push(
      fplSub.on('fplLoaded').handle(this.handleFlightPlanEvent),
      fplSub.on('fplCreated').handle(this.handleFlightPlanEvent),
      fplSub.on('fplSegmentChange').handle(this.handleFlightPlanEvent),
      fplSub.on('fplLegChange').handle(this.handleFlightPlanEvent),
      fplSub.on('fplActiveLegChange').handle(this.handleFlightPlanEvent),
      fplSub.on('fplCopied').handle(this.handleFlightPlanCopiedEvent),
      fplSub.on('fplCalculated').handle(this.handleFlightPlanCalculated),
      this.fms.predictor.onPredictionsUpdated.on(this.handlePredictionsUpdated)
    );

    this.store.apprState.sub(() => this.updateStoreFromFlightPlan());
  }

  /**
   * Destroys this controller
   */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }
  }

  private readonly handlePredictionsUpdated = (): void => {
    const predictions = new Map<number, Predictions | undefined>();

    for (let i = 0; i < this.fms.getFlightPlan(UnsFlightPlans.Active).length; i++) {
      predictions.set(i, this.fms.predictor.getPredictionsForLeg(i));
    }

    this.store.predictions.set(predictions);
  };

  private readonly handleFlightPlanEvent = (e: FlightPlanIndicationEvent | FlightPlanSegmentEvent | FlightPlanActiveLegEvent | FlightPlanLegEvent): void => {
    if (e.planIndex !== UnsFlightPlans.Active) {
      return;
    }

    this.updateStoreFromFlightPlan();
  };

  private readonly handleFlightPlanCopiedEvent = (e: FlightPlanCopiedEvent): void => {
    if (e.targetPlanIndex !== UnsFlightPlans.Active) {
      return;
    }

    this.updateStoreFromFlightPlan();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly handleFlightPlanCalculated = (e: FlightPlanCalculatedEvent): void => {
    this.updateEndOfApproachPosition();
  };

  /**
   * Updates the store according to the active flight plan
   */
  public updateStoreFromFlightPlan(): void {
    this.updateDisplayedLegs();
    this.updateEndOfApproachLegIndex();
    this.updateApproach();
  }

  /**
   * Sets up the initial state of selected heading entry
   */
  public startHeadingEntry(): void {
    const currentHeading = this.store.heading.get();

    if (currentHeading === null) {
      return;
    }

    this.store.commandedHeadingEntryState.set(NavPageHdgSelState.WaitForHeadingConfirm);
    this.store.pendingCommandedHeadingValue.set(currentHeading);
    this.store.pendingCommandedHeadingTurnDirection.set(null);
  }

  /**
   * Stops a currently ongoing heading entry
   */
  public stopHeadingEntry(): void {
    this.store.commandedHeadingEntryState.set(NavPageHdgSelState.Idle);
    this.store.pendingCommandedHeadingValue.set(null);
    this.store.pendingCommandedHeadingTurnDirection.set(null);
  }

  /**
   * Activates SEL HDG wit the current store state
   *
   * @throws if the pending heading value or turn direction are invalid
   */
  public activateHeadingSelected(): void {
    const pendingHeading = this.store.pendingCommandedHeadingValue.get();
    const pendingTurnDirection = this.store.pendingCommandedHeadingTurnDirection.get();

    if (pendingHeading === null || pendingTurnDirection === null) {
      throw Error('pendingCommandedHeadingValue/pendingCommandedHeadingTurnDirection null');
    }

    this.bus.getPublisher<UnsLnavControlEvents>().pub('unslnav_set_mode', UnsLnavMode.Heading);
    this.bus.getPublisher<UnsLnavControlEvents>().pub('unslnav_set_commanded_heading', [pendingHeading, pendingTurnDirection]);
    this.store.commandedHeadingEntryState.set(NavPageHdgSelState.Idle);
    this.store.pendingCommandedHeadingValue.set(null);
    this.store.pendingCommandedHeadingTurnDirection.set(null);
  }

  /**
   * Updates the displayed legs
   */
  private updateDisplayedLegs(): void {
    const plan = this.fms.getPrimaryFlightPlan();
    const activeLegIndex = plan.activeLateralLeg;

    let fromLeg: LegDefinition | null = null;
    const toLeg = plan.tryGetLeg(activeLegIndex);
    const eoaLegIndex = UnsFmsUtils.getEndOfApproachPoint(this.fms.getPrimaryFlightPlan());
    let nextLeg: LegDefinition | null = null;

    if (toLeg) {
      const toLegGlobalIndex = plan.getLegIndexFromLeg(toLeg);

      fromLeg = plan.getPrevLeg(plan.getSegmentIndex(toLegGlobalIndex), plan.getSegmentLegIndex(toLegGlobalIndex));
      nextLeg = plan.getNextLeg(plan.getSegmentIndex(toLegGlobalIndex), plan.getSegmentLegIndex(toLegGlobalIndex));
      if (nextLeg && toLegGlobalIndex == eoaLegIndex && this.store.apprState.get() != UnsApproachState.Missed) {
        nextLeg = {
          name: '*EOA*',
          leg: nextLeg.leg,
          flags: nextLeg.flags,
          verticalData: nextLeg.verticalData,
          userData: nextLeg.userData,
        };
      }
    }

    const isFromLegDto = fromLeg ? (UnsFmsUtils.isLegInDirectTo(fromLeg) && !UnsFmsUtils.isLegDirectToTarget(fromLeg)) : false;
    const isFromLegPVorOrigin = fromLeg ? BitFlags.isAll(fromLeg.flags, UnsExtraLegDefinitionFlags.PVorOriginLeg) : false;

    this.store.fromLeg.set(fromLeg ? { leg: fromLeg, legIndex: plan.getLegIndexFromLeg(fromLeg), isPpos: isFromLegDto, isPVorOrigin: isFromLegPVorOrigin } : null);
    this.store.toLeg.set(toLeg ? { leg: toLeg, legIndex: plan.getLegIndexFromLeg(toLeg), isPpos: false, isPVorOrigin: false } : null);

    const isActiveLegHoldingPattern = toLeg ? (FlightPlanUtils.isHoldLeg(toLeg.leg.type) && toLeg.leg.type !== LegType.HF) : false;
    const isActiveLegVectors = toLeg ? FlightPlanUtils.isManualDiscontinuityLeg(toLeg.leg.type) : false;

    // If the active leg is a holding pattern (except HF) or a vectors leg, we show dashes in the NX field
    (nextLeg && !isActiveLegHoldingPattern && !isActiveLegVectors)
      ? this.store.nextLeg.set({ leg: nextLeg, legIndex: plan.getLegIndexFromLeg(nextLeg), isPpos: false, isPVorOrigin: false })
      : this.store.nextLeg.set(null);
  }

  /**
   * Updates the end of approach leg index
   */
  private updateEndOfApproachLegIndex(): void {
    const eoaIndex = UnsFmsUtils.getEndOfApproachPoint(this.fms.getPrimaryFlightPlan());

    if (eoaIndex === -1) {
      this.store.eoaLegIndex.set(-1);
      this.store.eoaPosition.set(NaN, NaN);
      return;
    }
  }

  /**
   * Updates the approach stored
   */
  private async updateApproach(): Promise<void> {
    const flightPlan = this.fms.getPrimaryFlightPlan();
    if (flightPlan.destinationAirport) {
      const destinationAirport = await this.fms.facLoader.getFacility(FacilityType.Airport, flightPlan.destinationAirport);
      const approach = UnsFmsUtils.getApproachFromPlan(flightPlan, destinationAirport);

      this.store.approach.set(approach ? approach : null);
    } else {
      this.store.approach.set(null);
    }
  }

  /**
   * Updates the end of approach position
   */
  private updateEndOfApproachPosition(): void {
    const eoaIndex = this.store.eoaLegIndex.get();

    if (eoaIndex === -1) {
      this.store.eoaPosition.set(NaN, NaN);
      return;
    }

    const leg = this.fms.getPrimaryFlightPlan().tryGetLeg(eoaIndex);

    if (!leg || !leg.calculated || leg.calculated.endLat === undefined || leg.calculated.endLon === undefined) {
      this.store.eoaPosition.set(NaN, NaN);
      return;
    }

    this.store.eoaPosition.set(leg.calculated.endLat, leg.calculated.endLon);
  }

  /**
   * Determines the next approach state that is valid at the current time
   * @returns The next approach state to switch to
   */
  public async getNextApproachState(): Promise<UnsApproachState> {
    const position = this.store.position.get();
    const flightPlan = this.fms.getPrimaryFlightPlan();

    if (!position || !UnsFmsUtils.isApproachLoaded(this.fms.getPrimaryFlightPlan()) || !flightPlan.destinationAirport) {
      return UnsApproachState.None;
    } else {
      const destinationAirport = await this.fms.facLoader.getFacility(FacilityType.Airport, flightPlan.destinationAirport);
      const positionGeoPoint = new GeoPoint(position.lat, position.long);
      const distanceFromAirport = UnitType.GA_RADIAN.convertTo(positionGeoPoint.distance(destinationAirport.lat, destinationAirport.lon), UnitType.NMILE);

      switch (this.store.apprState.get()) {
        // TODO: Implement approach tune if RTU is present
        case UnsApproachState.None:
          return distanceFromAirport < 50 ? UnsApproachState.Armed : UnsApproachState.None;
        case UnsApproachState.AwaitingTune:
        case UnsApproachState.Armed:
          // TODO: If required localizer/vor is not tuned then alert in some way
          return UnsApproachState.Active;
        case UnsApproachState.Active:
          return UnsApproachState.Missed;
        case UnsApproachState.Missed:
          return flightPlan.activeLateralLeg > UnsFmsUtils.getLastNonMissedApproachLeg(flightPlan) ? UnsApproachState.Armed : UnsApproachState.Missed;
      }
    }
  }
}

/**
 * UNS NAV page
 */
export class UnsNavPage extends UnsFmcPage {
  private static readonly XTK_FORMATTER = NumberFormatter.create({ precision: .01, maxDigits: 3, hideSign: true });

  private static readonly BEARING_FORMATTER = NumberFormatter.create({ pad: 3, precision: 1, nanString: '---' });

  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: .1, maxDigits: 3, nanString: '--.-' });

  private static readonly LAT_FORMATTER = DmsFormatter2.create('{+[N]-[S]}  {dd} {mm.mm}', UnitType.ARC_SEC, 0.6, 'N  -- --.--');
  private static readonly LON_FORMATTER = DmsFormatter2.create('{+[E]-[W]} {ddd} {mm.mm}', UnitType.ARC_SEC, 0.6, 'E --- --.--');

  private readonly store = new UnsNavPageStore(this.bus, this.fmsConfig.lnav.index, this.fms);
  private readonly pageNameSubject = MappedSubject.create(this.displayedSubPageIndex, this.store.apprState);

  private readonly controller = new UnsNavPageController(this.bus, this.store, this.fms);

  /**
   * Updates the page title
   * @param pageIndex Current index of page
   * @param approachState Current approach state
   */
  private updatePageTitle(pageIndex: number, approachState: UnsApproachState): void {
    if (pageIndex <= 2 && approachState == UnsApproachState.Active) {
      this.pageTitle = 'NAV APPR';
    } else {
      this.pageTitle = '  NAV   ';
    }
  }

  // 1/3, 2/3

  private NavMessageField = new DisplayField<string>(this, {
    formatter: (message) => message,
  }).bind(this.store.navMessage);

  private FromLegField = new DisplayField<readonly [NavLeg | null, Map<number, Predictions | undefined>, null]>(this, {
    formatter: new UnsNavLegFormatter('from', this.showOverlay),
    onSelected: async () => {
      this.screen.navigateTo('/nav/legs');
      return true;
    },
  }).bind(MappedSubject.create(this.store.fromLeg, this.store.predictions, Subject.create(null)));

  private ToLegField = new DisplayField<readonly [NavLeg | null, Map<number, Predictions | undefined>, number]>(this, {
    formatter: new UnsNavLegFormatter('to', this.showOverlay),
    onSelected: async () => {
      this.screen.navigateTo('/nav/legs');
      return true;
    },
  }).bind(MappedSubject.create(this.store.toLeg, this.store.predictions, this.store.dtg));

  private NextLegField = new DisplayField<readonly [NavLeg | null, Map<number, Predictions | undefined>, null]>(this, {
    formatter: new UnsNavLegFormatter('next', this.showOverlay),
    onSelected: async () => {
      this.screen.navigateTo('/nav/legs');
      return true;
    },
  }).bind(MappedSubject.create(this.store.nextLeg, this.store.predictions, Subject.create(null)));

  private readonly HeadingField = new DisplayField(this, {
    formatter: () => `HDG${UnsChars.ArrowRight}`,
    onSelected: async () => {
      this.showOverlay.set(true);
      this.screen.tryFocusField(this.CommandedHeadingField);
      this.controller.startHeadingEntry();
      return true;
    },
  });

  private readonly ManeuverPageLink = PageLinkField.createLink(this, `MNVR${UnsChars.ArrowRight}`, '/maneuver');

  private readonly ApproachField = new DisplayField<readonly [UnsApproachState, UnsApproachState]>(this, {
    formatter: ([nextApprState, apprState]): string => {
      return nextApprState !== UnsApproachState.None && nextApprState !== apprState ? `APPR${UnsChars.ArrowRight}` : 'APPR[disabled s-text] ';
    },
    onSelected: async () => {
      this.bus.getPublisher<UnsApproachEvents>().pub('activate_next_state', true);
      return true;
    },
  }).bind(MappedSubject.create(this.store.nextApprState, this.store.apprState));

  private readonly ApproachFieldHeading = new DisplayField<readonly [UnsApproachState, UnsApproachState]>(this, {
    formatter: ([nextApprState, apprState]): string => {
      switch (nextApprState) {
        case UnsApproachState.None:
          return '';
        case UnsApproachState.Armed:
          return 'ARM  ';
        case UnsApproachState.AwaitingTune:
          return 'TUNE ';
        case UnsApproachState.Active:
          return 'ACT  ';
        case UnsApproachState.Missed:
          return `MISSD${apprState == UnsApproachState.Missed ? '[disabled s-text]' : ''}`;
      }
    },
  }).bind(MappedSubject.create(this.store.nextApprState, this.store.apprState));

  private readonly XtkField = new DisplayField<number | null>(this, {
    formatter: {
      nullValueString: 'XTK [cyan s-text]([cyan d-text]T[white s-text])[cyan d-text] R-.--[white s-text]',

      /** @inheritDoc */
      format(xtk): string {
        const xtkLetter = xtk >= 0 ? 'R' : 'L';
        const xtkString = UnsNavPage.XTK_FORMATTER(xtk);

        return `XTK [cyan s-text]([cyan d-text]T[white s-text])[cyan d-text] ${xtkLetter}${xtkString}[white s-text]`;
      },
    },
  }).bind(this.store.xtk);

  private readonly WindField = new DisplayField<readonly [number | null, number | null]>(this, {
    formatter: {
      nullValueString: 'WND[cyan s-text]  ---T/---[white s-text]',

      /** @inheritDoc */
      format([direction, velocity]): string {
        if (!velocity || Number.isNaN(velocity) || !direction || Number.isNaN(direction)) {
          return 'WND[cyan s-text]  ---T/---[white s-text]';
        }

        const directionString = direction.toFixed(0).padStart(3, '0');
        const velocityString = velocity.toFixed(0).padStart(3, ' ');

        return `WND[cyan s-text]  ${directionString}T/${velocityString}[white s-text]`;
      },
    },
  }).bind(MappedSubject.create(this.store.windDirection, this.store.windVelocity));

  private readonly GroundSpeedField = new DisplayField<number | null>(this, {
    formatter: {
      nullValueString: 'GS[cyan s-text]     ---[white s-text]',

      /** @inheritDoc */
      format(gs): string {
        const gsString = gs !== null ? gs.toFixed(0).padStart(3, ' ') : '---';

        return `GS[cyan s-text]${' '.repeat(4)}${gsString}[white s-text]`;
      },
    },
  }).bind(this.store.groundSpeed);

  private readonly ANPField = new DisplayField<number | null>(this, {
    formatter: {
      nullValueString: 'ANP[cyan s-text]   ---[white s-text]',

      /** @inheritDoc */
      format(anp): string {
        const anpString = anp !== null ? anp.toFixed(2).padStart(3, ' ') : '---';

        return `ANP[cyan s-text]  ${anpString}[white s-text]`;
      },
    },
  }).bind(this.store.anp);

  private readonly BearingField = new DisplayField<number | null>(this, {
    formatter: {
      nullValueString: 'BRG[cyan s-text]  ---°[white s-text]',

      /** @inheritDoc */
      format(bearing): string {
        const bearingString = bearing.toFixed(0).padStart(3, '0');

        return `BRG[cyan s-text]  ${bearingString}°[white s-text]`;
      },
    },
  }).bind(this.store.bearing);

  private readonly TailwindHeadwindField = new DisplayField<
    readonly [number | null, number | null, number | null]
  >(this, {
    formatter: UnsCduFormatters.Headwind(2, 'white s-text'),
  }).bind(MappedSubject.create(this.store.track, this.store.windDirection, this.store.windVelocity));

  private readonly TkeField = new DisplayField<number | null>(this, {
    formatter: {
      nullValueString: 'TKE[cyan s-text]  ---°[white s-text]',

      /** @inheritDoc */
      format(tke): string {
        const sideString = tke >= 0 ? 'R' : 'L';
        const tkeString = Number.isFinite(tke) ? Math.abs(tke).toFixed(0).padStart(3, '0') : '---';

        return `TKE[cyan s-text] ${sideString}${tkeString}°[white s-text]`;
      },
    },
  }).bind(this.store.tke);

  // 1/3, 2/3 overlay

  private readonly CommandedHeadingField = new UnsTextInputField<readonly [NavPageHdgSelState, number | null, 'left' | 'right' | null, number | null, 'left' | 'right' | null], number>(this, {
    maxInputCharacterCount: 3,
    formatter: {
      /** @inheritDoc */
      format([[state, commandedHeading, commandedTurnDirection, pendingHeading, pendingTurnDirection], isHighlighted, typedText]): string {
        let prefixStr = ' '.repeat(5);
        let signStr = ' ';
        let headingStr = '   ';

        if (state === NavPageHdgSelState.WaitForHeadingConfirm) {
          if (typedText.length > 0) {
            headingStr = typedText.padStart(3, ' ');
          } else if (pendingHeading !== null) {
            headingStr = pendingHeading.toFixed(0).padStart(3, '0');
          }
        } else if (state === NavPageHdgSelState.WaitForDeltaHeadingConfirm && pendingTurnDirection !== null) {
          prefixStr = 'TURN ';
          signStr = pendingTurnDirection === 'left' ? 'L' : 'R';
          headingStr = typedText.padStart(3, ' ');
        } else if (state === NavPageHdgSelState.WaitForTurnDirectionConfirm && pendingHeading !== null) {
          signStr = pendingTurnDirection === 'left' ? 'L' : 'R';
          headingStr = Math.abs(pendingHeading).toFixed(0).padStart(3, ' ');
        } else if (commandedHeading !== null && commandedTurnDirection !== null) {
          signStr = commandedTurnDirection === 'left' ? 'L' : 'R';
          headingStr = Math.abs(commandedHeading).toFixed(0).padStart(3, '0');
        }

        const shouldFlash = state !== NavPageHdgSelState.Idle && typedText.length === 0;

        return ` [line-tb]${prefixStr}[white]${signStr}${headingStr}[${isHighlighted ? 'r-white' : 'white'}${shouldFlash ? ' flash' : ''} d-text]°[white d-text]`;
      },

      /** @inheritDoc */
      parse: (input: string): number | null => {
        const state = this.store.commandedHeadingEntryState.get();

        if (state === NavPageHdgSelState.WaitForHeadingConfirm || state === NavPageHdgSelState.WaitForDeltaHeadingConfirm) {
          const intInput = parseInt(input);

          if (!Number.isFinite(intInput)) {
            return null;
          }

          return intInput;
        }

        return null;
      },
    },

    onModified: async (value) => {
      const state = this.store.commandedHeadingEntryState.get();
      const pendingTurnDirection = this.store.pendingCommandedHeadingTurnDirection.get();
      const currentHeading = this.store.heading.get();

      if (currentHeading === null) {
        return false;
      }

      if (state === NavPageHdgSelState.WaitForHeadingConfirm) {
        this.store.commandedHeadingEntryState.set(NavPageHdgSelState.WaitForTurnDirectionConfirm);
        this.store.pendingCommandedHeadingValue.set(value);
        this.store.pendingCommandedHeadingTurnDirection.set(NavMath.getTurnDirection(currentHeading, value));
      } else if (state === NavPageHdgSelState.WaitForDeltaHeadingConfirm && pendingTurnDirection !== null) {
        this.store.pendingCommandedHeadingValue.set(
          NavMath.normalizeHeading(currentHeading + ((pendingTurnDirection === 'left' ? -1 : 1) * value)),
        );

        this.controller.activateHeadingSelected();
        return false;
      }

      return true;
    },

    onSelected: async () => {
      const state = this.store.commandedHeadingEntryState.get();
      const lnavMode = this.store.lnavMode.get();

      this.screen.tryFocusField(this.CommandedHeadingField);

      if (state === NavPageHdgSelState.Idle) {
        this.controller.startHeadingEntry();
        return true;
      } else if (lnavMode === UnsLnavMode.Heading || lnavMode === UnsLnavMode.HeadingIntercept) {
        this.controller.stopHeadingEntry();
      }

      return false;
    },

    onEnterPressed: async () => {
      const state = this.store.commandedHeadingEntryState.get();

      if (state === NavPageHdgSelState.WaitForTurnDirectionConfirm) {
        this.controller.activateHeadingSelected();
      }

      return false;
    },

    onPlusMinusPressed: async () => {
      const state = this.store.commandedHeadingEntryState.get();
      const turnDirection = this.store.pendingCommandedHeadingTurnDirection.get();

      if ((state === NavPageHdgSelState.WaitForTurnDirectionConfirm
        || state === NavPageHdgSelState.WaitForDeltaHeadingConfirm) && turnDirection !== null
      ) {
        this.store.pendingCommandedHeadingTurnDirection.set(turnDirection === 'left' ? 'right' : 'left');
      } else if (state === NavPageHdgSelState.WaitForHeadingConfirm) {
        this.store.commandedHeadingEntryState.set(NavPageHdgSelState.WaitForDeltaHeadingConfirm);
        this.store.pendingCommandedHeadingTurnDirection.set('right');
      }

      return true;
    },
  }).bindWrappedData(
    MappedSubject.create(
      this.store.commandedHeadingEntryState,
      this.store.commandedHeading,
      this.store.commandedTurnDirection,
      this.store.pendingCommandedHeadingValue,
      this.store.pendingCommandedHeadingTurnDirection,
    ),
  );

  private readonly OverlayManeuverPageLink = PageLinkField.createLink(this, ` [line-tb]     MNVR${UnsChars.ArrowRight}`, '/maneuver');

  private readonly CancelHeadingField = new DisplayField(this, {
    formatter: () => ` [line-tb] CNCL HDG${UnsChars.ArrowRight}`,
    onSelected: async () => {
      this.bus.getPublisher<UnsLnavControlEvents>().pub('unslnav_set_mode', UnsLnavMode.FlightPlanTracking);
      this.showOverlay.set(false);
      return true;
    },
  });


  // 3/3

  private readonly FmsPosField = new DisplayField<GeoPointInterface>(this, {
    formatter: {
      /** @inheritDoc */
      format({ lat, lon }): FmcRenderTemplate {
        const latString = UnsNavPage.LAT_FORMATTER(lat * 3_600);
        const longString = UnsNavPage.LON_FORMATTER(lon * 3_600);

        return [
          [`${latString}[d-text]`],
          [`${longString}[d-text]`],
        ];
      },
    },
  }).bind(this.fms.pposSub);

  private readonly EoaBearingDistanceField = new DisplayField<readonly [GeoPointInterface, GeoPointInterface]>(this, {
    formatter: {
      /** @inheritDoc */
      format([eoaPosition, presentPosition]): string {
        const bearing = presentPosition.bearingTo(eoaPosition);
        const bearingString = UnsNavPage.BEARING_FORMATTER(bearing);

        const distance = presentPosition.distance(eoaPosition);
        const distanceNM = UnitType.NMILE.convertFrom(distance, UnitType.GA_RADIAN);
        const distanceString = UnsNavPage.DISTANCE_FORMATTER(distanceNM);

        return `${bearingString}°/${distanceString}[d-text]NM[s-text]`;
      },
    },
  }).bind(MappedSubject.create(this.store.eoaPosition, this.fms.pposSub));

  /** @inheritDoc */
  protected override onInit(): void {
    this.addBinding(this.store.xtk);
    this.addBinding(this.store.dtk);
    this.addBinding(this.store.track);
    this.addBinding(this.store.heading);
    this.addBinding(this.store.tke);
    this.addBinding(this.store.windDirection);
    this.addBinding(this.store.windVelocity);
    this.addBinding(this.store.groundSpeed);
    this.addBinding(this.store.bearing);
    this.addBinding(this.store.position);
    this.addBinding(this.store.lnavMode);
    this.addBinding(this.store.commandedHeading);
    this.addBinding(this.store.commandedTurnDirection);
    this.addBinding(this.pageNameSubject);
    this.addBinding(this.pageNameSubject.sub(([pageIndex, apprState]) => this.updatePageTitle(pageIndex, apprState)));
  }

  protected pageTitle = '  NAV   ';

  public cursorPath: UnsCduCursorPath = {
    initialPosition: null,
    rules: new Map([
      [this.CommandedHeadingField, this.CommandedHeadingField],
    ]),
  };

  /** @inheritDoc */
  protected onPause(): void {
    this.controller.stopHeadingEntry();
  }

  /** @inheritDoc */
  protected onResume(): void {
    const lnavMode = this.store.lnavMode.get();

    if (lnavMode === UnsLnavMode.Heading || lnavMode === UnsLnavMode.HeadingIntercept) {
      this.showOverlay.set(true);
      this.screen.tryFocusField(this.CommandedHeadingField);
    } else {
      this.showOverlay.set(false);
    }
  }

  /** @inheritDoc */
  protected override onDestroy(): void {
    this.controller.destroy();
  }

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    const rows: FmcRenderTemplate[] = [
      [
        [this.TitleField],
        [this.NavMessageField],
        [this.FromLegField, this.HeadingField],
        [this.ToLegField],
        ['', this.ManeuverPageLink],
        [this.NextLegField, this.ApproachFieldHeading],
        ['', this.ApproachField],
        [` [line-mr]${' '.repeat(17)}[line-rl] [line-mt-rl-l]${' '.repeat(4)}[line-rl] [line-ml]`],
        [this.XtkField, this.GroundSpeedField],
        [this.WindField, this.ANPField],
        [this.pageTitle == 'NAV APPR' ? 'VDEV[cyan s-text]  ---[disabled s-text]' : '', 'RNP[cyan s-text]  1.00[white s-text]'],
      ],
      [
        [this.TitleField],
        [this.NavMessageField],
        [this.FromLegField, this.HeadingField],
        [this.ToLegField],
        ['', this.ManeuverPageLink],
        [this.NextLegField],
        [''],
        [` [line-mr]${' '.repeat(17)}[line-rl] [line-mt-rl-l]${' '.repeat(4)}[line-rl] [line-ml]`],
        [this.XtkField, this.GroundSpeedField],
        [this.TailwindHeadwindField, this.BearingField],
        [this.WindField, this.TkeField],
      ],
      [
        [this.TitleField],
        ['', 'RNP   ANP[cyan]'],
        [`FMS${this.fmsConfig.index} POS[cyan s-text]`, '1.00 / 0.03[d-text]'],
        [this.FmsPosField, 'NAV MODE[cyan s-text]'],
        ['', 'GPS/DME[d-text] '],
        [''],
        ['BRG /DIST TO EOA[cyan s-text]]'],
        [this.EoaBearingDistanceField],
        ['', `UPDATE SENS${UnsChars.ArrowRight}[disabled]`],
        [''],
        [`${UnsChars.ArrowLeft}HOLD POS[disabled]`, `SENSORS${UnsChars.ArrowRight}[disabled]`],
      ],
    ];

    if (this.store.apprState.get() == UnsApproachState.Active) {
      rows.splice(1, 0, [
        [this.TitleField],
        [this.NavMessageField],
        [this.FromLegField, this.HeadingField],
        [this.ToLegField],
        ['', this.ManeuverPageLink],
        [this.NextLegField, this.ApproachFieldHeading],
        ['', this.ApproachField],
        [` [line-mr]${' '.repeat(17)}[line-rl] [line-mt-rl-l]${' '.repeat(4)}[line-rl] [line-ml]`],
        [this.XtkField, 'VDEV[cyan s-text]  ---[disabled s-text]'],
        [this.TailwindHeadwindField, this.GroundSpeedField],
        [this.WindField, 'VSR[cyan s-text]  ----[disabled s-text]'],
      ]);
    }

    return rows;
  }

  /** @inheritDoc */
  renderOverlay(): FmcRenderTemplate {
    return [
      [''],
      ['', 'CMD HDG[cyan s-text]'],
      ['', this.CommandedHeadingField],
      ['', ' [line-tb]          '],
      ['', ' [line-tb] NO INTCPT[disabled]'],
      ['', ' [line-tb]          '],
      ['', this.OverlayManeuverPageLink],
      ['', ' [line-tb-ml]          '],
      ['', ' [line-tb]          '],
      ['', ' [line-tb]          '],
      ['', this.CancelHeadingField],
    ];
  }
}
