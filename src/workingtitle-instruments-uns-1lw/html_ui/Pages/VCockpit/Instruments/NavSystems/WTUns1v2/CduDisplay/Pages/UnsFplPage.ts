import {
  AltitudeRestrictionType, ArraySubject, BitFlags, DebounceTimer, DisplayField, EventBus, Facility, FacilityType, FacilityUtils, FixTypeFlags, FlightPlan,
  FlightPlanCalculatedEvent, FlightPlanCopiedEvent, FlightPlanIndicationEvent, FlightPlanLegEvent, FlightPlannerEvents, FlightPlanSegment,
  FlightPlanSegmentEvent, FlightPlanSegmentType, FlightPlanUtils, FmcFormatter, FmcFormatterOutput, FmcPagingEvents, FmcRenderTemplate, GeoPoint,
  GeoPointInterface, ICAO, LegDefinition, LegEventType, SegmentEventType, SpeedRestrictionType, SpeedUnit, Subject, Subscription, UnitType, Validator
} from '@microsoft/msfs-sdk';

import { UnsFms, UnsFmsUtils, UnsLegAnnotationFormat } from '../../Fms';
import { UnsTextInputField, WritableUnsFieldState } from '../Components/UnsTextInputField';
import { UnsChars } from '../UnsCduDisplay';
import { UnsFmcPage } from '../UnsFmcPage';
import { UnsFmcScreen } from '../UnsFmcScreen';

const UNS_FPL_ROWS_PER_PAGE = 5;

/**
 * UNS FPL page base item
 */
interface BaseUnsFplPageItem {
  /** The type of item */
  type: string,

  /** The index of the row in the list */
  index: number,
}

/**
 * UNS FPL page leg item
 */
interface UnsFplPageLeg extends BaseUnsFplPageItem {
  /** @inheritDoc */
  type: 'leg',

  /** The global leg index */
  globalIndex: number,

  /** The annotation displayed above the leg name */
  annotation: string,

  /** The display name of the leg */
  name: string,

  /** The leg data */
  leg: LegDefinition,

  /** The length of the leg */
  length: number,

  /** The vertical data of the leg */
  verticalData: LegDefinition['verticalData'],

  /** Whether this leg is the active leg */
  isActiveLeg: boolean,
}

/**
 * UNS FPL page marker item
 */
interface UnsFplMarkerRow extends BaseUnsFplPageItem {
  /** @inheritDoc */
  type: 'marker',

  /** The marker text */
  text: string,
}

/**
 * UNS FPL page leg item
 */
interface UnsFplPageInputRow extends BaseUnsFplPageItem {
  /** @inheritDoc */
  type: 'inputRow',

  /** The global leg index */
  index: number,
}

/**
 * UNS FPL blank item
 */
interface UnsFplBlankRow extends BaseUnsFplPageItem {
  /** @inheritDoc */
  type: 'empty',
}

/**
 * UNS FPL page row
 */
type UnsFplRow = UnsFplPageLeg | UnsFplMarkerRow | UnsFplPageInputRow | UnsFplBlankRow

/**
 * Store for {@link UnsFplPage}
 */
class UnsFplPageStore {
  /**
   * Ctor
   *
   * @param fms the fms
   */
  constructor(private readonly fms: UnsFms) {
  }

  public targetPlan = this.fms.getPrimaryFlightPlan();

  public flightPlanItems = ArraySubject.create<UnsFplRow>([{ type: 'inputRow', index: 0 }]);

  /**
   * Clears and initializes the flight plan row list from a flight plan
   *
   * @param plan the flight plan
   */
  public initializeFlightPlanRowsFromPlan(plan: FlightPlan): void {
    this.flightPlanItems.clear();

    for (const segment of plan.segments()) {
      this.insertFlightPlanSegmentIntoStore(segment);
    }

    this.adjustInputRow();
  }

  /**
   * Adds a flight plan segment into the FPL row store
   *
   * @param segment the segment
   *
   * @throws with in valid FMS state
   */
  public insertFlightPlanSegmentIntoStore(segment: FlightPlanSegment): void {
    const planHasValidApproach = this.targetPlan.procedureDetails.approachIndex !== -1;

    if (segment.segmentType === FlightPlanSegmentType.Approach && this.fms.facilityInfo.destinationFacility && planHasValidApproach) {
      const approach = this.fms.facilityInfo.destinationFacility.approaches[this.targetPlan.procedureDetails.approachIndex];

      this.flightPlanItems.insert({ type: 'marker', index: segment.offset, text: `*${UnsFmsUtils.getApproachNameAsString(approach)}*` }, segment.offset);
    }

    for (let i = 0; i < segment.legs.length; i++) {
      const leg = segment.legs[i];

      this.insertLegDefinitionIntoStore(segment.offset + i, leg);
    }
  }

  /**
   * Removes a flight plan segment from the FPL row store
   *
   * @param segment the segment
   *
   * @throws if a segment cannot be removed due to an internal error
   */
  public removeFlightPlanSegmentFromStore(segment: FlightPlanSegment): void {
    if (segment.legs.length < 1) {
      return;
    }

    let removeStartIndex = -1;

    if (segment.legs.length === 0) {
      return;
    }

    let iter = 0;
    while (removeStartIndex === -1 && ++iter < 100) {
      removeStartIndex = this.removeLegFromStore(segment.offset);
    }

    if (removeStartIndex === -1) {
      throw new Error('Could not find first leg to remove from segment in list');
    }

    let numLegsRemoved = 1;
    while (numLegsRemoved !== segment.legs.length) {
      const row = this.flightPlanItems.get(removeStartIndex);

      this.flightPlanItems.removeAt(removeStartIndex);

      if (row.type !== 'leg') {
        continue;
      }

      numLegsRemoved++;
    }
  }

  /**
   * Adds a leg into the FPL row store
   *
   * @param globalIndex the global index of the leg, and the index to insert the leg at
   * @param leg the leg definition
   */
  public insertLegDefinitionIntoStore(globalIndex: number, leg: LegDefinition): void {
    // In a DTO, only include the target of a direct to
    if (!this.isLegInsertable(leg)) {
      return;
    }

    const insertIndex = this.getListInsertIndex(globalIndex);

    const prevLeg = this.targetPlan.getPrevLeg(this.targetPlan.getSegmentIndex(globalIndex), this.targetPlan.getSegmentLegIndex(globalIndex));

    const insertItem: UnsFplPageLeg = {
      type: 'leg',
      index: insertIndex,
      globalIndex,
      annotation: UnsFmsUtils.buildUnsLegAnnotation(leg, leg.calculated, prevLeg ?? undefined, UnsLegAnnotationFormat.Fpl, null),
      name: leg.name ?? 'NONAME',
      leg: leg,
      length: leg.calculated?.distance ?? NaN,
      verticalData: leg.verticalData,
      isActiveLeg: globalIndex === this.targetPlan.activeLateralLeg, // TODO maybe use nominal leg index
    };

    this.flightPlanItems.insert(insertItem, insertIndex);

    if (BitFlags.isAll(leg.leg.fixTypeFlags, FixTypeFlags.MAP)) {
      this.flightPlanItems.insert({ type: 'marker', index: insertIndex + 1, text: '*EOA*' }, insertIndex + 1);
    }

    this.adjustInputRow();
  }

  /**
   * Removes a leg from the FPL row store
   *
   * @param globalIndex the global index of the leg, and the index to remove the leg at
   *
   * @returns the index in the list at which the leg was found and removed
   *
   * @throws if the leg is not found in the list
   */
  public removeLegFromStore(globalIndex: number): number {
    const indexToRemove = this.getLegIndexInList(globalIndex);

    if (indexToRemove === -1) {
      return -1;
    }

    this.flightPlanItems.removeAt(indexToRemove);

    this.adjustInputRow();

    return indexToRemove;
  }

  /**
   * Removes all markers from the FPL row store
   */
  public removeAllMarkers(): void {
    for (let i = 0; i < this.flightPlanItems.length; i++) {
      const row = this.flightPlanItems.get(i);

      if (row.type !== 'marker') {
        continue;
      }

      this.flightPlanItems.removeAt(i);
      i--;
    }
  }

  /**
   * Ensures all legs in the list have consistent data
   */
  public ensureListConsistent(): void {
    for (let i = 0; i < this.flightPlanItems.getArray().length; i++) {
      const row = this.flightPlanItems.get(i);

      row.index = i;

      if (row.type !== 'leg') {
        continue;
      }

      const newGlobalIndex = this.targetPlan.getLegIndexFromLeg(row.leg);

      row.globalIndex = newGlobalIndex;
    }
  }

  /**
   * Generates the FPL row store markers
   */
  public generateMarkers(): void {
    for (let i = 0; i < this.flightPlanItems.length; i++) {
      const row = this.flightPlanItems.get(i);

      if (row.type !== 'leg') {
        continue;
      }

      const segmentIndex = this.targetPlan.getSegmentIndex(row.globalIndex);
      const legIndex = this.targetPlan.getSegmentLegIndex(row.globalIndex);
      const segment = this.targetPlan.getSegment(segmentIndex);

      const isLegStartOfApproach = segment.segmentType === FlightPlanSegmentType.Approach && UnsFmsUtils.isFirstLegInSegment(this.targetPlan, segmentIndex, legIndex);

      if (isLegStartOfApproach) {
        const destinationFacility = this.fms.facilityInfo.destinationFacility;
        const approachIndex = this.targetPlan.procedureDetails.approachIndex;

        const approach = destinationFacility?.approaches[approachIndex];

        if (approach) {
          this.flightPlanItems.insert({ type: 'marker', text: `*${approach.name}*`, index: i }, i);
          i++;
        }
        continue;
      }

      const isLegEndOfApproach = UnsFmsUtils.getEndOfApproachPoint(this.targetPlan) === row.globalIndex;

      if (isLegEndOfApproach) {
        this.flightPlanItems.insert({ type: 'marker', text: '*EOA*', index: i + 1 }, i + 1);
      }
    }
  }

  /**
   * Updates every leg in the FPL row store
   */
  public updateAllLegs(): void {
    for (let i = 0; i < this.flightPlanItems.getArray().length; i++) {
      const row = this.flightPlanItems.get(i);

      if (row.type !== 'leg' || row.globalIndex < 0) {
        continue;
      }

      const leg = this.targetPlan.getLeg(row.globalIndex);

      const copiedRow = { ...row };

      const prevLeg = this.targetPlan.getPrevLeg(this.targetPlan.getSegmentIndex(copiedRow.globalIndex), this.targetPlan.getSegmentLegIndex(copiedRow.globalIndex));

      // TODO this is inefficient

      copiedRow.annotation = UnsFmsUtils.buildUnsLegAnnotation(leg, leg.calculated, prevLeg ?? undefined, UnsLegAnnotationFormat.Fpl, null);
      copiedRow.length = leg.calculated?.distance ?? NaN;
      copiedRow.isActiveLeg = row.globalIndex === this.targetPlan.activeLateralLeg; // TODO maybe use nominal leg index

      this.flightPlanItems.removeAt(i);
      this.flightPlanItems.insert(copiedRow, i);
    }
  }

  /**
   * Adjusts the last input row after a change
   */
  public adjustInputRow(): void {
    const lastRow = this.flightPlanItems.tryGet(this.flightPlanItems.length - 1);

    if (!lastRow) {
      this.flightPlanItems.insert({ type: 'inputRow', index: 1 });
    } else if (lastRow && lastRow.type !== 'inputRow') {
      const lastIndex = (this.flightPlanItems.get(this.flightPlanItems.length - 1) as UnsFplPageInputRow).index;

      this.flightPlanItems.insert({ type: 'inputRow', index: lastIndex + 1 });
    } else if (this.flightPlanItems.length >= 2) {
      const lastIndex = (this.flightPlanItems.get(this.flightPlanItems.length - 2) as UnsFplPageInputRow).index;

      this.flightPlanItems.removeAt(this.flightPlanItems.length - 1);
      this.flightPlanItems.insert({ type: 'inputRow', index: lastIndex + 1 });
    }
  }

  /**
   * Returns whether a leg is valid for insertion into the FPL leg store given its definition
   *
   * @param leg the leg definition
   *
   * @returns a boolean
   */
  private isLegInsertable(leg: LegDefinition): boolean {
    const inMiddleOfDto = UnsFmsUtils.isLegInDirectTo(leg) && !UnsFmsUtils.isLegDirectToTarget(leg);

    return !inMiddleOfDto;
  }

  /**
   * Returns the global index of the previous leg that is valid for insertion into the FPL leg store
   *
   * @param globalLegIndex the global index of the log to do the lookup for
   *
   * @returns a number
   */
  private previousInsertableLeg(globalLegIndex: number): number {
    for (let i = globalLegIndex - 1; i >= 0; i--) {
      const leg = this.targetPlan.getLeg(i);

      if (this.isLegInsertable(leg)) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Returns the index in the list at which a leg should be inserted given its global index
   *
   * @param globalLegIndex the leg's global index
   *
   * @returns a number
   */
  private getListInsertIndex(globalLegIndex: number): number {
    // We get the index of what must be the previous leg row to be in the list
    const previousInsertableLegIndex = this.previousInsertableLeg(globalLegIndex);

    const list = this.flightPlanItems.getArray();

    // If there isn't one, we insert at the start of the list
    if (previousInsertableLegIndex === -1) {
      return 0;
    }

    // Otherwise, find the index in the list of that leg
    let previousInsertableLegListIndex = -1;
    for (let i = 0; i < list.length; i++) {
      const row = list[i];

      if (row.type !== 'leg') {
        continue;
      }

      if (row.globalIndex === previousInsertableLegIndex) {
        previousInsertableLegListIndex = i;
        break;
      }
    }

    // We go forward from there until we find a row index which is either another leg, or the end of the list
    let index = 0;
    if (previousInsertableLegListIndex + 1 === list.length) {
      index = previousInsertableLegListIndex;
    } else if (previousInsertableLegListIndex !== -1) {
      for (let i = previousInsertableLegListIndex + 1; i < list.length; i++) {
        const row = list[i];

        index = i;

        if (row.type === 'leg' || row.type === 'inputRow') {
          break;
        }
      }
    }

    return index;
  }

  /**
   * Returns the index in the list at which a leg is located given its global index
   *
   * @param globalLegIndex the leg's global index
   *
   * @returns a number
   */
  private getLegIndexInList(globalLegIndex: number): number {
    let index = -1;

    for (let i = 0; i < this.flightPlanItems.length; i++) {
      const item = this.flightPlanItems.get(i);

      if (item.type !== 'leg') {
        continue;
      }

      if (item.globalIndex === globalLegIndex) {
        index = i;
        break;
      }
    }

    return index;
  }
}

/**
 * Controller for {@link UnsFplPage}
 */
class UnsFplPageController {
  private readonly updateAllLegsDebounce = new DebounceTimer();

  private readonly subscriptions: Subscription[] = [];

  private readonly generateMarkersDebounce = new DebounceTimer();

  /**
   * Ctor
   *
   * @param bus the event bus
   * @param store the store
   * @param fms the fms
   * @param screen the screen
   */
  constructor(
    private readonly bus: EventBus,
    readonly store: UnsFplPageStore,
    private readonly fms: UnsFms,
    private readonly screen: UnsFmcScreen,
  ) {
    this.store.initializeFlightPlanRowsFromPlan(this.store.targetPlan);

    const fplSub = this.bus.getSubscriber<FlightPlannerEvents>();

    this.subscriptions.push(
      fplSub.on('fplLoaded').handle(this.handleFlightPlanInitialization),
      fplSub.on('fplCreated').handle(this.handleFlightPlanInitialization),
      fplSub.on('fplCopied').handle(this.handleFlightPlanCopied),
      fplSub.on('fplSegmentChange').handle(this.handleFlightPlanSegmentChange),
      fplSub.on('fplLegChange').handle(this.handleFlightPlanLegChange),
      fplSub.on('fplCalculated').handle(this.handleFlightPlanUpdate),
      fplSub.on('fplIndexChanged').handle(this.handleFlightPlanUpdate),
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

  /**
   * Handles inserting a waypoint at an existing leg
   *
   * @param segmentIndex the segment index of the existing leg
   * @param localLegIndex the local leg index of the existing leg
   * @param facility the facility to insert
   */
  public async handleInsertWaypointOnLeg(segmentIndex: number, localLegIndex: number, facility: Facility): Promise<void> {
    this.fms.insertWaypoint(facility, segmentIndex, localLegIndex);
  }

  /**
   * Handles inserting a waypoint at the end of the flight plan
   *
   * @param facility the facility to insert
   */
  public async handleInsertWaypointAtEnd(facility: Facility): Promise<void> {
    if (FacilityUtils.isFacilityType(facility, FacilityType.Airport)) {
      this.fms.insertAirportAtEnd(facility);
    } else {
      this.fms.insertWaypoint(facility);
    }
  }

  private readonly handleFlightPlanInitialization = (event: FlightPlanIndicationEvent): void => {
    if (event.planIndex !== this.store.targetPlan.planIndex) {
      return;
    }

    this.store.initializeFlightPlanRowsFromPlan(this.store.targetPlan);

    this.generateMarkersDebounce.schedule(() => this.store.generateMarkers(), 500);
  };

  private readonly handleFlightPlanCopied = (event: FlightPlanCopiedEvent): void => {
    if (event.planIndex !== this.store.targetPlan.planIndex) {
      return;
    }

    this.store.initializeFlightPlanRowsFromPlan(this.store.targetPlan);

    this.generateMarkersDebounce.schedule(() => this.store.generateMarkers(), 500);
  };

  private readonly handleFlightPlanSegmentChange = (event: FlightPlanSegmentEvent): void => {
    if (event.planIndex !== this.store.targetPlan.planIndex) {
      return;
    }

    switch (event.type) {
      case SegmentEventType.Added:
      case SegmentEventType.Inserted:
        this.store.removeAllMarkers();
        this.store.insertFlightPlanSegmentIntoStore(event.segment as FlightPlanSegment);
        this.store.ensureListConsistent();
        break;
      case SegmentEventType.Removed:
        this.store.removeAllMarkers();
        this.store.removeFlightPlanSegmentFromStore(event.segment as FlightPlanSegment);
        this.store.ensureListConsistent();
        break;
      case SegmentEventType.Changed:
      // noop, does not matter to us - only used for changes to airways, which we do not display anyway
    }

    this.generateMarkersDebounce.schedule(() => this.store.generateMarkers(), 500);
  };

  private readonly handleFlightPlanLegChange = (event: FlightPlanLegEvent): void => {
    if (event.planIndex !== this.store.targetPlan.planIndex) {
      return;
    }

    const segment = this.store.targetPlan.getSegment(event.segmentIndex);
    switch (event.type) {
      case LegEventType.Added: {
        this.store.removeAllMarkers();
        this.store.insertLegDefinitionIntoStore(segment.offset + event.legIndex, event.leg);
        this.store.ensureListConsistent();
        break;
      }
      case LegEventType.Removed: {
        this.store.removeAllMarkers();
        this.store.removeLegFromStore(segment.offset + event.legIndex);
        this.store.ensureListConsistent();
        break;
      }
      case LegEventType.Changed: {
        // TODO handle this (only verticalData related)
      }
    }

    this.generateMarkersDebounce.schedule(() => this.store.generateMarkers(), 500);
  };

  private readonly handleFlightPlanUpdate = (event: FlightPlanCalculatedEvent | FlightPlanIndicationEvent): void => {
    if (event.planIndex !== this.store.targetPlan.planIndex) {
      return;
    }

    this.updateAllLegsDebounce.schedule(() => this.store.updateAllLegs(), 500);
  };
}

/**
 * Formatter for UNS FPL row fields
 */
class UnsFplLegFormatter implements FmcFormatter<WritableUnsFieldState<UnsFplRow>>, Validator<Facility> {
  /** @inheritdoc */
  constructor(
    private readonly fms: UnsFms,
    private readonly screen: UnsFmcScreen,
    private readonly legData: Subject<UnsFplRow>[],
    private readonly rowIndex: number
  ) {
  }

  nullValueString = '';

  render: FmcRenderTemplate = [
    ['', ''],
    ['', ''],
  ];

  /** @inheritDoc */
  format([row, isHighlighted, typedText]: WritableUnsFieldState<UnsFplRow>): FmcFormatterOutput {
    switch (row.type) {
      case 'leg': {
        this.render[0][0] = ` ${row.annotation}[${row.isActiveLeg ? 'magenta' : 'white'}]`;
        break;
      }
      default:
        this.render[0][0] = '';
    }

    if (row.type === 'leg' && row.globalIndex === 0) {
      this.render[0][1] = 'ALT[cyan s-text]/[cyan d-text]FL[cyan s-text]';
    }

    switch (row.type) {
      case 'leg': {
        const listIndexString = (row.index + 1).toString().padStart(2, ' ');

        const isDiscontinuity = FlightPlanUtils.isDiscontinuityLeg(row.leg.leg.type);

        const textColor = isHighlighted ? 'r-white' : row.isActiveLeg ? 'magenta' : (isDiscontinuity ? 'amber flash' : 'white');
        const textToShow = typedText || (isDiscontinuity ? '*NO LINK*' : row.name);
        const nameString = `${textToShow.padEnd(8, ' ')}[${textColor} d-text]`;
        const additionalInfoString = `${FlightPlanUtils.isToRadialLeg(row.leg.leg.type) ? ICAO.getIdent(row.leg.leg.originIcao) : ''}[${textColor} s-text]`; // TODO show ETA/ETE

        this.render[1][0] = `${listIndexString}${row.isActiveLeg ? '>' : ' '}[white s-text]${nameString} ${additionalInfoString}`;
        break;
      }
      case 'marker': {
        const listIndexString = (row.index + 1).toString().padStart(2, ' ');

        this.render[1][0] = `${listIndexString}[s-text] ${row.text}`;
        break;
      }
      case 'inputRow': {
        const listIndexString = (row.index + 1).toString().padStart(2, ' ');

        this.render[1][0] = `${listIndexString}[s-text] [white]${typedText.padEnd(8, ' ')}[${isHighlighted ? 'r-white' : 'white'}]`;
        break;
      }
      case 'empty':
        this.render[1][0] = '';
        break;
    }

    return this.render;
  }

  /** @inheritDoc */
  async parse(input: string): Promise<Facility | null> {
    const row = this.legData[this.rowIndex].get();

    let refPos: GeoPointInterface;
    if (row.type === 'leg' && row.leg.calculated?.endLat !== undefined && row.leg.calculated.endLon !== undefined) {
      refPos = new GeoPoint(row.leg.calculated.endLat, row.leg.calculated.endLon);
    } else {
      refPos = this.fms.pposSub.get();
    }

    const facility = await this.screen.searchFacilityByIdent(input, refPos);

    return facility;
  }
}

/**
 * Formatter for UNS FPL row altitude fields
 */
class UnsFplLegAltitudeFormatter implements FmcFormatter<WritableUnsFieldState<UnsFplRow>>, Validator<number> {
  /** @inheritDoc */
  format([row, isHighlighted, typedText]: WritableUnsFieldState<UnsFplRow>): string {
    if (row.type !== 'leg') {
      return '';
    }

    let altitudeString: string;
    const alt1Feet = UnitType.FOOT.convertFrom(row.verticalData.altitude1, UnitType.METER);
    const aboveTransitionAltitude = alt1Feet > 18_000; // TODO see if we can configure the transition altitude
    const altString = aboveTransitionAltitude ? `FL${(alt1Feet / 100).toFixed(0)}` : alt1Feet.toFixed(0);

    if (isHighlighted) {
      altitudeString = `${typedText.padEnd(6, '-')}[r-white]`;
    } else if (!FlightPlanUtils.isDiscontinuityLeg(row.leg.leg.type)) {
      switch (row.verticalData.altDesc) {
        case AltitudeRestrictionType.At:
          altitudeString = `@${altString}`; break;
        case AltitudeRestrictionType.AtOrAbove:
          altitudeString = `+${altString}`; break;
        case AltitudeRestrictionType.AtOrBelow:
          altitudeString = `-${altString}`; break;
        default:
          altitudeString = '------';
      }
    } else {
      altitudeString = '';
    }

    return altitudeString;
  }

  /** @inheritDoc */
  parse(input: string): number | null {
    const number = parseInt(input);

    if (!Number.isFinite(number)) {
      return null;
    }

    const isFlightLevel = number < 640 && input.length === 3;

    return isFlightLevel ? number * 100 : number;
  }
}

const ROW_INDICES = [0, 1, 2, 3, 4] as const;

/**
 * FPL pages
 */
export class UnsFplPage extends UnsFmcPage {
  private store = new UnsFplPageStore(this.fms);

  private controller = new UnsFplPageController(this.bus, this.store, this.fms, this.screen);

  private subPageIndex = Subject.create(0);

  private subPageCount = Subject.create(1);

  private legData: Subject<UnsFplRow>[] = ROW_INDICES.map(index => Subject.create<UnsFplRow>({ index, type: 'empty' }));

  private legFields = [
    this.createLegField(0),
    this.createLegField(1),
    this.createLegField(2),
    this.createLegField(3),
    this.createLegField(4),
  ];

  private legAltitudeFields = [
    this.createLegAltitudeField(0),
    this.createLegAltitudeField(1),
    this.createLegAltitudeField(2),
    this.createLegAltitudeField(3),
    this.createLegAltitudeField(4),
  ];

  /**
   * Creates a FPL page leg row field
   *
   * @param index a zero-based, incremental index for this field
   *
   * @returns a text field
   */
  private createLegField(index: number): UnsTextInputField<UnsFplRow, Facility> {
    return new UnsTextInputField(this, {
      maxInputCharacterCount: 8,
      formatter: new UnsFplLegFormatter(this.fms, this.screen, this.legData, index),
      takeCursorControl: true,
      onSelected: async () => {
        this.showOverlay.set(true);

        const focused = this.screen.toggleFieldFocused(this.legFields[index]);

        if (!focused) {
          this.showOverlay.set(false);
        }

        this.overlayLeg.set(this.legData[index].get());
        return true;
      },
      onListPressed: async () => {
        // The reference leg for a list press, is actually the row *above* the selected row.
        // We subtract by the page index, because every page after the first page will display the last item of the prev page.
        const rowIndex = (this.subPageIndex.get() * 5) + index - this.subPageIndex.get();
        const targetRow = this.store.flightPlanItems.get(Math.max(rowIndex - 1, 0));

        const facility = await this.screen.invokeNormalListPage('ALL', targetRow.type === 'leg' ? targetRow.leg : undefined);

        if (!facility) {
          this.showOverlay.set(false);
          this.overlayLeg.set(null);
          return false;
        }

        await this.handleWaypointInsertedOnRow(this.legData[index].get(), facility);
        return true;
      },
      onModified: async (facility) => {
        const row = this.legData[index].get();

        await this.handleWaypointInsertedOnRow(row, facility);
        return true;
      },
    }).bindWrappedData(this.legData[index]);
  }

  /**
   * Creates a FPL page leg row altitude field
   *
   * @param index a zero-based, incremental index for this field
   *
   * @returns a text field
   */
  private createLegAltitudeField(index: number): UnsTextInputField<UnsFplRow, number> {
    return new UnsTextInputField(this, {
      maxInputCharacterCount: 8,
      formatter: new UnsFplLegAltitudeFormatter(),
      onSelected: async () => {
        const legData = this.legData[index].get();

        const canEditAltitude = legData.type === 'leg' && UnsFmsUtils.canLegAltitudeBeEdited(legData.leg.leg);

        if (canEditAltitude) {
          this.screen.toggleFieldFocused(this.legAltitudeFields[index]);
          return true;
        }

        return false;
      },
      onModified: async (altitude) => {
        const legData = this.legData[index].get();

        if (legData.type !== 'leg') {
          throw new Error('createLegAltitudeField onModified cannot be called on a non-leg FPL row');
        }

        this.fms.setUserConstraint(legData.globalIndex, {
          altDesc: AltitudeRestrictionType.At,
          altitude1: UnitType.METER.convertFrom(altitude, UnitType.FOOT),
          altitude2: 0,
          speed: 0,
          speedDesc: SpeedRestrictionType.Unused,
          speedUnit: SpeedUnit.IAS,
          displayAltitude1AsFlightLevel: false,
          displayAltitude2AsFlightLevel: false,
          isAltitude1TempCompensated: false,
          isAltitude2TempCompensated: false,
        });

        this.screen.tryFocusField(null);

        return true;
      },
    }).bindWrappedData(this.legData[index]);
  }

  public overlayLeg = Subject.create<UnsFplRow | null>(null);
  public overlayLegIcao = this.overlayLeg.map((row: UnsFplRow | null): string | null => {
    if (row?.type === 'leg') {
      const fixIcao = row.leg.leg.fixIcao;
      const originIcao = row.leg.leg.originIcao;

      return fixIcao !== '' && fixIcao !== ICAO.emptyIcao ? fixIcao :
        (originIcao !== '' && originIcao !== ICAO.emptyIcao ? originIcao : null);
    }

    return null;
  });

  /**
   * Handles the pilot inserting a waypoint on a row
   *
   * @param row the row in question
   * @param facility the facility to insert
   */
  private async handleWaypointInsertedOnRow(row: UnsFplRow, facility: Facility): Promise<void> {
    switch (row.type) {
      case 'leg': {
        const plan = this.store.targetPlan;
        const segment = plan.getSegment(plan.getSegmentIndex(row.globalIndex));

        await this.controller.handleInsertWaypointOnLeg(segment.segmentIndex, row.globalIndex - segment.offset, facility);
        break;
      }
      case 'inputRow':
        await this.controller.handleInsertWaypointAtEnd(facility);
        break;
      case 'empty':
        break;
      default:
        console.warn(`Could not handle inserting waypoint on row #${row.index + 1}: unhandled row type '${row.type}'`);
        break;
    }

    const isNextPage = (row.index % 4) === 0;
    const nextRow = isNextPage ? 1 : (row.index % 4) + 1;

    isNextPage && this.onHandleScrolling('pageRight');
    this.screen.tryFocusField(this.legFields[nextRow]);
    this.overlayLeg.set(this.legData[nextRow].get());
  }

  /** @inheritDoc */
  protected override onInit(): void {
    // TODO clean this up
    this.addBinding(this.store.flightPlanItems.sub((index, type, item, array) => {
      this.subPageCount.set(Math.max(1, Math.ceil(array.length / (UNS_FPL_ROWS_PER_PAGE - 1))));

      this.updateFieldsData(array, Math.max(0, this.subPageIndex.get()) * (UNS_FPL_ROWS_PER_PAGE - 1));
    }, true));

    this.subPageCount.sub((count) => {
      if (this.subPageIndex.get() >= count) {
        this.subPageIndex.set(Math.max(0, count - 1));
      }
    });

    this.subPageIndex.sub((index) => {
      this.updateFieldsData(this.store.flightPlanItems.getArray(), index * (UNS_FPL_ROWS_PER_PAGE - 1));
    });

    this.displayedSubPageIndexPipe?.destroy();
    this.displayedSubPageCountPipe?.destroy();
    this.addBinding(this.displayedSubPageIndexPipe = this.subPageIndex.pipe(this.displayedSubPageIndex, (index) => index + 1));
    this.addBinding(this.displayedSubPageCountPipe = this.subPageCount.pipe(this.displayedSubPageCount));
  }

  /** @inheritDoc */
  protected override onDestroy(): void {
    this.controller.destroy();
  }

  /**
   * Updates the row fields with the relevant data
   *
   * @param array the array of rows
   * @param offset the starting index in the array
   */
  private updateFieldsData(array: readonly UnsFplRow[], offset: number): void {
    ROW_INDICES.forEach(index => {
      const data: Subject<UnsFplRow> = this.legData[index];
      const row: UnsFplRow = array[offset + index];

      if (data.get() !== null) {
        data.apply(row ?? { type: 'empty' });
      } else {
        data.set(row ?? { type: 'empty' });
      }
    });
  }

  /** @inheritDoc */
  protected async onHandleScrolling(event: keyof FmcPagingEvents<this> & string): Promise<boolean | string> {
    switch (event) {
      case 'pageLeft': {
        const currentSubPageIndex = this.subPageIndex.get();

        if (currentSubPageIndex === 0) {
          this.subPageIndex.set(this.subPageCount.get() - 1);
        } else {
          this.subPageIndex.set(currentSubPageIndex - 1);
        }

        break;
      }
      case 'pageRight': {
        const currentSubPageIndex = this.subPageIndex.get();

        if (currentSubPageIndex === this.subPageCount.get() - 1) {
          this.subPageIndex.set(0);
        } else {
          this.subPageIndex.set(currentSubPageIndex + 1);
        }

        break;
      }
    }

    return super.onHandleScrolling(event);
  }

  protected override pageTitle = '  FPL  ';

  protected override displayedSubPagePadding = 2;

  protected override menuRoute = Subject.create('/fpl-menu');

  /** @inheritDoc */
  public override render(): FmcRenderTemplate[] {
    return [
      [
        [this.TitleField],
        [this.legFields[0]],
        ['', this.legAltitudeFields[0]],
        [this.legFields[1]],
        ['', this.legAltitudeFields[1]],
        [this.legFields[2]],
        ['', this.legAltitudeFields[2]],
        [this.legFields[3]],
        ['', this.legAltitudeFields[3]],
        [this.legFields[4]],
        ['', this.legAltitudeFields[4]],
      ],
    ];
  }

  private readonly OverlayMenuDeleteField = new UnsTextInputField<boolean, void>(this, {
    maxInputCharacterCount: 0,
    formatter: {
      nullValueString: ` [line-tb]  DEL${UnsChars.ArrowRight}`,

      /** @inheritDoc */
      format([, isHighlighted]) {
        return ` [line-tb]  DEL${UnsChars.ArrowRight}[${isHighlighted ? 'r-white' : 'white'}]`;
      },

      /** @inheritDoc */
      parse(): void | null {
        return void 0;
      },
    },

    onSelected: async () => {
      const isFocused = this.screen.currentCursorPosition === this.OverlayMenuDeleteField;

      if (isFocused) {
        const data = this.overlayLeg.get();

        if (data?.type !== 'leg') {
          return false;
        }

        const segmentIndex = this.store.targetPlan.getSegmentIndex(data.globalIndex);
        const legIndex = this.store.targetPlan.getSegmentLegIndex(data.globalIndex);

        this.fms.removeWaypoint(segmentIndex, legIndex);

        this.screen.toggleFieldFocused(this.OverlayMenuDeleteField);
        this.showOverlay.set(false);
      } else {
        this.screen.toggleFieldFocused(this.OverlayMenuDeleteField);
      }

      return true;
    },
  }).bindWrappedData(Subject.create(true));

  private readonly OverlayMenuInfoField = new DisplayField<string | null>(this, {
    formatter: (icao: string | null): string => icao ? ` [line-tb] INFO${UnsChars.ArrowRight}` : ' [line-tb]      ',
    onSelected: async () => {
      const icao: string | null = this.overlayLegIcao.get();
      if (icao) {
        const facility: Facility = await this.fms.facLoader.getFacility(ICAO.getFacilityType(icao), icao);
        this.screen.navigateTo('/waypoint-ident', { facilities: [facility] });
      }
      return true;
    },
  }).bind(this.overlayLegIcao);

  /** @inheritDoc */
  public override renderOverlay(): FmcRenderTemplate {
    return [
      [''],
      ['', ' '],
      ['', this.OverlayMenuDeleteField],
      ['', ' [line-tb]      '],
      ['', this.OverlayMenuInfoField],
      ['', ' [line-tb]      '],
      ['', ' [line-tb] TUNE→[disabled]'],
      ['', ' [line-tb]      '],
      ['', ' [line-tb]OVFLY→[disabled]'],
      ['', ' [line-tb]      '],
      ['', ' [line-tb]      '],
    ];
  }
}
