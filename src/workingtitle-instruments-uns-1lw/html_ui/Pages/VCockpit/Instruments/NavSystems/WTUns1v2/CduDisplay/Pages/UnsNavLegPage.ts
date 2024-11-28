import {
  DisplayField, EventBus, Facility, FlightPlan, FlightPlanActiveLegEvent, FlightPlanCopiedEvent, FlightPlanIndicationEvent, FlightPlanLegEvent,
  FlightPlannerEvents, FlightPlanSegmentEvent, FmcPagingEvents, FmcRenderTemplate, ICAO, LegDefinition, LegType, MappedSubject, Subject, Subscribable,
  Subscription,
} from '@microsoft/msfs-sdk';

import { FixEntry, UnsFlightPlans, UnsFms, UnsFmsUtils } from '../../Fms';
import { UnsTextInputField, UnsTextInputFieldOptions } from '../Components/UnsTextInputField';
import { UnsWaypointPickList } from '../Components/UnsWaypointPickList';
import { UnsChars } from '../UnsCduDisplay';
import { UnsCduCursorPath, UnsFmcPage } from '../UnsFmcPage';

/**
 * Class for a waypoint selection field
 */
class NavWaypointSelectField extends UnsTextInputField<readonly [LegDefinition | null, Facility | undefined], FixEntry> {
  /** @inheritdoc */
  constructor(
    page: UnsNavLegPage,
    waypointList: UnsWaypointPickList,
    type: 'FR' | 'TO' | 'NX',
    subjects: Subscribable<readonly [LegDefinition | null, Facility | undefined]>,
    onSelect: (fix: FixEntry) => void,
    allowRandom = true
  ) {
    const options: UnsTextInputFieldOptions<readonly [LegDefinition | null, Facility | undefined], FixEntry> = {
      maxInputCharacterCount: 9,
      formatter: {
        /** @inheritDoc */
        format([[legDefinition, newWaypoint], isHighlighted, typedText]): string {
          let waypointText: string = (typedText.length == 0 && legDefinition && legDefinition.name) ? legDefinition.name : typedText;
          if (newWaypoint) {
            waypointText = ICAO.getIdent(newWaypoint.icao);
          }
          return `${type}[cyan s-text] ${waypointText.padEnd(9, ' ')}[${isHighlighted ? 'r-white' : 'white'} d-text]  [white s-text]`;
        },

        parse: async (input: string): Promise<FixEntry | null> => {
          const intInput = parseInt(input);

          if (!Number.isFinite(intInput) && allowRandom) {
            page.preventReset = true;
            const ident = input;

            let facilityIcao: string | undefined;
            for (let i = 0; i < waypointList.eligibleWaypoints.length; i++) {
              const waypoint = waypointList.eligibleWaypoints.get(i);

              if (ident === ICAO.getIdent(waypoint.icao)) {
                facilityIcao = waypoint.icao;
                break;
              }
            }

            if (!facilityIcao) {
              const pilotSelectedFacility = await page.screen.searchFacilityByIdent(ident, page.fms.pposSub.get());

              facilityIcao = pilotSelectedFacility?.icao;
            }

            if (!facilityIcao) {
              return null;
            }

            page.preventReset = false;

            return { type: 'random', facilityIcao };
          } else {
            const entry = waypointList.data.get().data.find((it) => intInput === it.index);

            if (!entry) {
              return null;
            }

            return { type: 'existing', segmentIndex: entry.segmentIndex, localLegIndex: entry.localLegIndex, facilityIcao: entry.icao };
          }
        },
      },

      onModified: async (fix: FixEntry) => {
        onSelect(fix);
        return true;
      },
    };

    super(page, options);
    this.bindWrappedData(subjects);
  }
}

/**
 * UNS Nav leg store
 */
class UnsNavLegStore {
  public readonly FromWaypoint = Subject.create<LegDefinition | null>(null);

  public readonly ToWaypoint = Subject.create<LegDefinition | null>(null);

  public readonly NextWaypoint = Subject.create<LegDefinition | null>(null);

  public readonly NewFromWaypoint = Subject.create<Facility | undefined>(undefined);
  public readonly NewToWaypoint = Subject.create<Facility | undefined>(undefined);
}

/**
 * Controller for {@link UnsNavLegPage}
 */
class UnsNavLegController {
  private readonly subscriptions: Subscription[] = [];

  /**
   * Ctor
   *
   * @param bus the event bus
   * @param store the nav page store
   * @param fms the fms
   */
  constructor(private readonly bus: EventBus, private readonly store: UnsNavLegStore, private readonly fms: UnsFms) {
    this.updateStoreFromFlightPlan();
    const fplSub = this.bus.getSubscriber<FlightPlannerEvents>();

    this.subscriptions.push(
      fplSub.on('fplLoaded').handle(this.handleFlightPlanEvent),
      fplSub.on('fplCreated').handle(this.handleFlightPlanEvent),
      fplSub.on('fplSegmentChange').handle(this.handleFlightPlanEvent),
      fplSub.on('fplLegChange').handle(this.handleFlightPlanEvent),
      fplSub.on('fplActiveLegChange').handle(this.handleFlightPlanEvent),
      fplSub.on('fplCopied').handle(this.handleFlightPlanCopiedEvent),
    );
  }

  /**
   * Destroys this controller
   */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }
  }

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

  /**
   * Updates the store according to the active flight plan
   */
  public updateStoreFromFlightPlan(): void {
    this.updateDisplayedLegs();
  }

  /**
   * Updates the displayed legs
   */
  private updateDisplayedLegs(): void {
    const plan = this.fms.getPrimaryFlightPlan();
    const activeLegIndex = plan.activeLateralLeg;

    let fromLeg: LegDefinition | null = null;
    const toLeg = plan.tryGetLeg(activeLegIndex);
    let nextLeg: LegDefinition | null = null;

    if (toLeg) {
      const toLegGlobalIndex = plan.getLegIndexFromLeg(toLeg);

      fromLeg = plan.getPrevLeg(plan.getSegmentIndex(toLegGlobalIndex), plan.getSegmentLegIndex(toLegGlobalIndex));
      nextLeg = plan.getNextLeg(plan.getSegmentIndex(toLegGlobalIndex), plan.getSegmentLegIndex(toLegGlobalIndex));
    }

    this.store.FromWaypoint.set(fromLeg);
    this.store.ToWaypoint.set(toLeg);
    this.store.NextWaypoint.set(nextLeg);
  }
}

/** A UNS NAV LEG page */
export class UnsNavLegPage extends UnsFmcPage {
  private readonly store = new UnsNavLegStore();
  private readonly controller = new UnsNavLegController(this.bus, this.store, this.fms);
  public preventReset = false;

  private readonly WaypointList = new UnsWaypointPickList(this, this.fms);

  private readonly FromWaypointSelectionField = new NavWaypointSelectField(this, this.WaypointList, 'FR', MappedSubject.create(this.store.FromWaypoint, this.store.NewFromWaypoint), async (fix) => {
    if (fix.type === 'existing') {
      const flightPlan = this.fms.getPrimaryFlightPlan();
      const batch = flightPlan.openBatch('uns1.cdu.navleg.handleModifyFlightPlan');
      const legIndex = UnsFmsUtils.getNominalFromLegIndex(flightPlan, fix.segmentIndex, fix.localLegIndex) + 2;
      const legSegment = flightPlan.getSegmentIndex(legIndex);
      const legLocalIndex = flightPlan.getSegmentLegIndex(legIndex);

      flightPlan.closeBatch(batch);
      this.fms.activateLeg(legSegment, legLocalIndex, true);
    } else {
      const facility = await this.fms.facLoader.getFacility(ICAO.getFacilityType(fix.facilityIcao), fix.facilityIcao);

      this.store.NewFromWaypoint.set(facility);
    }
  });

  private readonly ToWaypointSelectionField = new NavWaypointSelectField(this, this.WaypointList, 'TO', MappedSubject.create(this.store.ToWaypoint, this.store.NewToWaypoint), async (fix) => {
    const flightPlan = this.fms.getPrimaryFlightPlan();
    const newFromFacility = this.store.NewFromWaypoint.get();
    let currentLegIndex = flightPlan.activeLateralLeg;
    let currentSegment = flightPlan.getSegmentIndex(currentLegIndex);
    let currentSegmentLegIndex = flightPlan.getSegmentLegIndex(currentLegIndex);

    if (fix.type === 'existing') {
      const batch = flightPlan.openBatch('uns1.cdu.navleg.handleModifyFlightPlan');
      if (newFromFacility) {
        this.fms.setNewFromWaypoint(newFromFacility, currentSegment, currentSegmentLegIndex);

        currentLegIndex++;
        currentSegment = flightPlan.getSegmentIndex(currentLegIndex);
        currentSegmentLegIndex = flightPlan.getSegmentLegIndex(currentLegIndex);
        this.store.NewFromWaypoint.set(undefined);
      }

      const toLegIndex = UnsFmsUtils.getNominalFromLegIndex(flightPlan, fix.segmentIndex, fix.localLegIndex) + 1;
      for (let i = currentLegIndex; i < toLegIndex; i++) {
        currentSegment = flightPlan.getSegmentIndex(currentLegIndex);
        currentSegmentLegIndex = flightPlan.getSegmentLegIndex(currentLegIndex);
        flightPlan.removeLeg(currentSegment, currentSegmentLegIndex);
      }

      flightPlan.closeBatch(batch);
      this.fms.activateLeg(currentSegment, currentSegmentLegIndex, true);
      this.screen.navigateTo('/nav');
    } else {
      const facility = await this.fms.facLoader.getFacility(ICAO.getFacilityType(fix.facilityIcao), fix.facilityIcao);
      this.store.NewToWaypoint.set(facility);
      this.screen.tryFocusField(this.NextWaypointSelectionField);
    }
  });

  private readonly NextWaypointSelectionField = new NavWaypointSelectField(this, this.WaypointList, 'NX', MappedSubject.create(this.store.NextWaypoint, Subject.create(undefined)), async (fix) => {
    if (fix.type === 'existing') {
      const flightPlan = this.fms.getPrimaryFlightPlan();
      const batch = flightPlan.openBatch('uns1.cdu.navleg.handleModifyFlightPlan');
      const newFromFacility = this.store.NewFromWaypoint.get();
      const newToFacility = this.store.NewToWaypoint.get();
      let insertLegIndex = UnsFmsUtils.getNominalFromLegIndex(flightPlan, fix.segmentIndex, fix.localLegIndex) + 1;
      let insertSegment = flightPlan.getSegmentIndex(insertLegIndex);
      let insertSegmentLegIndex = flightPlan.getSegmentLegIndex(insertLegIndex);

      if (newFromFacility) {
        this.fms.setNewFromWaypoint(newFromFacility, insertSegment, insertSegmentLegIndex);

        insertLegIndex++;
        insertSegment = flightPlan.getSegmentIndex(insertLegIndex);
        insertSegmentLegIndex = flightPlan.getSegmentLegIndex(insertLegIndex);
        this.store.NewFromWaypoint.set(undefined);
      } else {
        const currentLegIndex = flightPlan.activeLateralLeg;
        let currentSegment = flightPlan.getSegmentIndex(currentLegIndex);
        let currentSegmentLegIndex = flightPlan.getSegmentLegIndex(currentLegIndex);

        for (let i = currentLegIndex; i < insertLegIndex; i++) {
          currentSegment = flightPlan.getSegmentIndex(currentLegIndex);
          currentSegmentLegIndex = flightPlan.getSegmentLegIndex(currentLegIndex);
          flightPlan.removeLeg(currentSegment, currentSegmentLegIndex);
        }

        insertLegIndex = currentLegIndex;
        insertSegment = flightPlan.getSegmentIndex(insertLegIndex);
        insertSegmentLegIndex = flightPlan.getSegmentLegIndex(insertLegIndex);
      }

      if (newToFacility) {
        flightPlan.addLeg(insertSegment, FlightPlan.createLeg({
          type: LegType.TF,
          fixIcaoStruct: newToFacility.icaoStruct,
        }), insertSegmentLegIndex);
        this.store.NewToWaypoint.set(undefined);
      }

      flightPlan.closeBatch(batch);
      this.fms.activateLeg(insertSegment, insertSegmentLegIndex, true);
      this.screen.navigateTo('/nav');
    }
  }, false);

  protected pageTitle = 'NAV LEG';

  protected displayedSubPagePadding = 2;

  private readonly ReturnLink = new DisplayField(this, {
    formatter: () => `RETURN${UnsChars.ArrowRight}`,
    onSelected: async () => {
      this.screen.navigateBackShallow();
      this.store.NewFromWaypoint.set(undefined);
      this.store.NewToWaypoint.set(undefined);
      return true;
    },
  });

  public cursorPath: UnsCduCursorPath = {
    initialPosition: this.FromWaypointSelectionField,
    rules: new Map([
      [this.FromWaypointSelectionField, this.ToWaypointSelectionField],
      [this.ToWaypointSelectionField, this.ToWaypointSelectionField],
    ]),
  };

  /** @inheritDoc */
  protected override onInit(): void {
    this.displayedSubPageIndexPipe?.destroy();
    this.displayedSubPageCountPipe?.destroy();
    this.addBinding(this.displayedSubPageIndexPipe = this.WaypointList.subPageIndex.pipe(this.displayedSubPageIndex));
    this.addBinding(this.displayedSubPageCountPipe = this.WaypointList.subPageCount.pipe(this.displayedSubPageCount));
  }

  /** @inheritDoc */
  protected onPause(): void {
    if (!this.preventReset) {
      this.store.NewFromWaypoint.set(undefined);
      this.store.NewToWaypoint.set(undefined);
    }
  }

  /** @inheritDoc */
  public override render(): FmcRenderTemplate[] {
    return [
      [
        [this.TitleField],
        ['', this.WaypointList],
        [this.FromWaypointSelectionField, ''],
        [''],
        [this.ToWaypointSelectionField, ''],
        [''],
        [this.NextWaypointSelectionField],
        [''],
        [''],
        [''],
        ['', this.ReturnLink],
      ],
    ];
  }

  /** @inheritDoc */
  protected override async onHandleScrolling(event: keyof FmcPagingEvents<this> & string): Promise<boolean | string> {
    switch (event) {
      case 'pageLeft': this.WaypointList.prevSubpage(); return true;
      case 'pageRight': this.WaypointList.nextSubpage(); return true;
    }

    return super.onHandleScrolling(event);
  }
}
