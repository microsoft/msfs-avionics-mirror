# Complete Guide: Flight Plan Waypoint Management in Garmin Instruments

A comprehensive walkthrough of flight plan waypoint entry and management implementations across all Garmin instruments, covering facility search, flight plan modification, procedures, and direct-to functionality.

---

## 📊 Overview: What is Flight Plan Management?

**Flight Plan Management** involves creating, modifying, and navigating a sequence of waypoints that define the aircraft's intended route from origin to destination.

### Core Concepts:

**Waypoints:**
- Individual navigation fixes (airports, VORs, NDBs, intersections, user-defined points)
- Referenced by ICAO identifier (e.g., "KJFK", "BOS VOR", "CAMRN")

**Legs:**
- Flight plan segments connecting waypoints
- Define navigation type: TF (track-to-fix), DF (direct-to-fix), CF (course-to-fix), etc.
- Include calculated data: distance, bearing, turn radius

**Segments:**
- Groups of legs organized by flight phase
- Types: Origin, Departure, Enroute, Arrival, Approach, Destination, MissedApproach

**Procedures:**
- Pre-defined flight paths: SIDs (departures), STARs (arrivals), approaches
- Include transitions for different entry/exit points

**Direct-To:**
- Off-route navigation to any waypoint
- Creates temporary 3-leg sequence in flight plan

---

## 🔄 Complete Data Flow

```
User Waypoint Entry
    ↓
Facility Search (FacilityLoader)
    ↓
Facility Selection
    ↓
FMS.insertWaypoint()
    ↓
FlightPlanner Updates
    ↓
Flight Path Calculation
    ↓
Events Published (fplLegChange, fplSegmentChange)
    ↓
Store Updates (FlightPlanStore)
    ↓
UI Rendering (List, Map)
```

---

## 1. 🏗️ Core Architecture

### FlightPlanner Class

**File:** `src/sdk/flightplan/FlightPlanner.ts`

The central manager for all flight plans:

```typescript
export class FlightPlanner {
  // Multiple flight plans supported
  private readonly plans: FlightPlan[] = [];

  /**
   * Gets a flight planner instance
   */
  public static getPlanner<ID extends string = string>(
    id: ID,
    bus: EventBus,
    options?: FlightPlannerOptions
  ): FlightPlanner;

  /**
   * Gets a flight plan by index
   */
  public getFlightPlan(index: number): FlightPlan;

  /**
   * Creates a new flight plan
   */
  public createFlightPlan(index: number): FlightPlan;

  /**
   * Deletes a flight plan
   */
  public deleteFlightPlan(index: number): void;

  /**
   * Checks if a flight plan exists
   */
  public hasFlightPlan(index: number): boolean;

  // Events published:
  // - fplCreated
  // - fplDeleted
  // - fplLegChange
  // - fplSegmentChange
  // - fplActiveLegChange
  // - fplOriginDestChanged
  // - fplCalculated
}
```

### FlightPlan Indices:

```typescript
// Standard plan indices
static readonly PRIMARY_PLAN_INDEX = 0;      // Main flight plan
static readonly DTO_RANDOM_PLAN_INDEX = 1;   // Direct-to random waypoint
static readonly PROC_PREVIEW_PLAN_INDEX = 2; // Procedure preview
```

### FlightPlan Structure

**File:** `src/sdk/flightplan/FlightPlan.ts`

```typescript
export class FlightPlan {
  // Origin and destination
  public get originAirportIcao(): IcaoValue | undefined;
  public get destinationAirportIcao(): IcaoValue | undefined;

  // Active legs
  public get activeLateralLeg(): number;   // Global leg index
  public get activeVerticalLeg(): number;

  // Direct-to data
  public directToData: FlightPlanLegIndexes;  // {segmentIndex, segmentLegIndex}

  // Segments
  public get segmentCount(): number;
  public getSegment(index: number): FlightPlanSegment;
  public insertSegment(index: number, type: FlightPlanSegmentType): FlightPlanSegment;
  public removeSegment(index: number): void;

  // Legs
  public addLeg(
    segmentIndex: number,
    leg: FlightPlanLeg,
    legIndex?: number,
    flags?: number
  ): LegDefinition;

  public removeLeg(segmentIndex: number, legIndex: number): void;

  public tryGetLeg(segmentIndex: number, legIndex: number): LegDefinition | null;

  // Calculation
  public async calculate(index?: number): Promise<void>;
}
```

### Leg Definition

```typescript
interface LegDefinition {
  readonly name?: string;                    // Leg name/identifier
  calculated?: LegCalculations;              // Distance, bearing, vectors
  leg: Readonly<FlightPlanLeg>;             // The actual leg data
  readonly flags: number;                    // DirectTo, MissedApproach, etc.
  readonly verticalData: VerticalData;      // Altitude/speed constraints
}

interface LegCalculations {
  distance: number;                          // Leg distance (meters)
  cumulativeDistance: number;                // Total distance to this point
  initialDtk: number;                        // Initial desired track (°)
  startLat: number;                          // Start latitude
  startLon: number;                          // Start longitude
  endLat: number;                            // End latitude
  endLon: number;                            // End longitude
  flightPath: FlightPathVector[];           // Calculated path vectors
}
```

### Segment Types:

```typescript
enum FlightPlanSegmentType {
  Origin,              // Departure airport
  Departure,           // SID procedure
  Enroute,             // Cruise waypoints
  Arrival,             // STAR procedure
  Approach,            // Approach procedure
  Destination,         // Arrival airport
  MissedApproach,      // Missed approach procedure
  RandomDirectTo       // Direct-to temporary segment
}
```

---

## 2. 🗂️ Facility System

### FacilityLoader

**File:** `src/sdk/navigation/FacilityLoader.ts`

Loads facility data from MSFS simulator:

```typescript
export class FacilityLoader {
  /**
   * Gets a facility by ICAO
   */
  public async getFacility(
    type: FacilityType,
    icao: string | IcaoValue
  ): Promise<Facility>;

  /**
   * Searches for facilities by identifier
   */
  public async searchByIdent(
    filter: FacilitySearchType,
    ident: string,
    maxItems = 40
  ): Promise<string[]>;

  /**
   * Finds nearest facilities
   */
  public async findNearestFacilities(
    type: FacilitySearchType,
    position: LatLonInterface,
    distance: number
  ): Promise<NearestSearchResults>;

  /**
   * Batch facility loading
   */
  public async getFacilities(
    icaos: (string | IcaoValue)[]
  ): Promise<Facility[]>;
}
```

### Facility Types:

```typescript
enum FacilityType {
  Airport = 'LOAD_AIRPORT',      // Airports with runways, procedures
  VOR = 'LOAD_VOR',               // VOR navaids
  NDB = 'LOAD_NDB',               // NDB navaids
  Intersection = 'LOAD_INTERSECTION', // Named intersections
  USR = 'USR',                    // User-defined waypoints
  VIS = 'VIS',                    // Visual waypoints
  RWY = 'RWY'                     // Runway waypoints
}

// Composite search types
enum FacilitySearchType {
  All = 'ALL',                    // All facility types
  Airport = 'AIRPORT',
  VorNdb = 'VOR_NDB',            // VORs and NDBs
  Intersection = 'INTERSECTION',
  User = 'USER',
  AllExceptVisual = 'ALL_EXCEPT_VISUAL'
}
```

### ICAO Format:

```typescript
// V2 ICAO structure (current)
interface IcaoValue {
  type: FacilityType;
  ident: string;              // e.g., "JFK"
  region: string;             // e.g., "K1"
  airport: string;            // Parent airport (if runway/terminal)
}

// Conversion utilities
const icao = ICAO.stringV1ToValue('KJFK');     // Convert from string
const string = ICAO.valueToStringV2(icao);     // Convert to string
```

### Facility Search Example:

```typescript
// Search for "BOS" identifier
const results = await facLoader.searchByIdent(
  FacilitySearchType.All,
  'BOS',
  40  // Max results
);

// Returns: ["KBOS", "BOSA", "BOSN", ...]
// Sorted by: exact match, partial match, distance

// Load facility
const facility = await facLoader.getFacility(
  FacilityType.Airport,
  'KBOS'
);

// Returns: AirportFacility with runways, procedures, etc.
```

---

## 3. 🎮 Fms Class - Flight Management System

**File:** `src/garminsdk/flightplan/Fms.ts` (5400+ lines!)

The Fms class is the heart of Garmin flight planning:

```typescript
export class Fms<ID extends string = any> {
  public static readonly PRIMARY_PLAN_INDEX = 0;
  public static readonly DTO_RANDOM_PLAN_INDEX = 1;
  public static readonly PROC_PREVIEW_PLAN_INDEX = 2;

  constructor(
    bus: EventBus,
    flightPlanner: FlightPlanner,
    private readonly facLoader: FacilityLoader,
    options?: FmsOptions
  ) {
    this.flightPlanner = flightPlanner;
  }

  // Primary flight plan accessor
  public get flightPlan(): FlightPlan;

  // Waypoint operations
  public insertWaypoint(
    segmentIndex: number,
    facility: Facility,
    legIndex?: number
  ): LegDefinition | undefined;

  public removeWaypoint(
    segmentIndex: number,
    segmentLegIndex: number
  ): boolean;

  // Procedure operations
  public insertDeparture(
    facility: AirportFacility,
    departureIndex: number,
    departureRunwayIndex: number,
    enrouteTransitionIndex: number,
    oneWayRunway?: OneWayRunway
  ): void;

  public insertArrival(
    facility: AirportFacility,
    arrivalIndex: number,
    arrivalRunwayIndex: number,
    enrouteTransitionIndex: number
  ): void;

  public async insertApproach(
    facility: AirportFacility,
    approachIndex: number,
    transitionIndex: number,
    runway?: OneWayRunway
  ): Promise<void>;

  // Direct-to operations
  public createDirectToRandom(
    target: Facility | string,
    course?: number
  ): void;

  public createDirectToExisting(
    segmentIndex: number,
    segmentLegIndex: number,
    course?: number
  ): void;

  public cancelDirectTo(): boolean;

  // Activation
  public activateLeg(
    segmentIndex: number,
    segmentLegIndex: number,
    planIndex?: number
  ): void;

  // Utility
  public initManagedFlightPlan(): void;
  public invertFlightplan(): void;
  public copyFlightPlan(source: number, target: number): void;
}
```

---

## 4. 🛩️ G1000 NXi Implementation

### FPL Page Structure

**Files:** `src/workingtitle-instruments-g1000/html_ui/Shared/UI/FPL/`

### FPLDetailsStore

**File:** `FPLDetailsStore.ts`

```typescript
export class FPLDetailsStore {
  // Facility info
  public readonly originFacility = Subject.create<AirportFacility | undefined>(undefined);
  public readonly destinationFacility = Subject.create<AirportFacility | undefined>(undefined);
  public readonly arrivalFacility = Subject.create<AirportFacility | undefined>(undefined);

  // Flight plan segments
  public readonly segments = ArraySubject.create<FlightPlanSegment>([]);

  // Active leg tracking
  public readonly activeLegGlobalIndex = Subject.create(-1);
  public readonly activeLeg = Subject.create<LegDefinition | undefined>(undefined);

  // Scroll state
  public readonly currentPage = Subject.create(0);
  public readonly currentItemIndex = Subject.create(-1);

  /**
   * Updates segments from flight plan
   */
  public updateSegments(plan: FlightPlan): void {
    const newSegments: FlightPlanSegment[] = [];

    for (let i = 0; i < plan.segmentCount; i++) {
      const segment = plan.getSegment(i);
      if (segment.legs.length > 0) {
        newSegments.push(segment);
      }
    }

    this.segments.set(newSegments);
  }
}
```

### FPLDetailsController

**File:** `FPLDetailsController.ts`

```typescript
export class FPLDetailsController {
  private readonly store: FPLDetailsStore;
  private readonly fms: Fms;

  constructor(bus: EventBus, store: FPLDetailsStore, fms: Fms) {
    this.store = store;
    this.fms = fms;

    // Subscribe to flight plan events
    this.subscribeToFlightPlanEvents();
  }

  private subscribeToFlightPlanEvents(): void {
    const fpl = this.fms.flightPlanner;

    // Segment changes
    fpl.on('fplSegmentChange').handle(event => {
      this.onSegmentChange(event);
    });

    // Leg changes
    fpl.on('fplLegChange').handle(event => {
      this.onLegChange(event);
    });

    // Active leg changes
    fpl.on('fplActiveLegChange').handle(event => {
      this.onActiveLegChange(event);
    });

    // Origin/destination changes
    fpl.on('fplOriginDestChanged').handle(event => {
      this.onOriginDestChanged(event);
    });
  }

  private onLegChange(event: FlightPlanLegEvent): void {
    switch (event.type) {
      case LegEventType.Added:
        // New leg added
        this.store.updateSegments(this.fms.flightPlan);
        break;

      case LegEventType.Removed:
        // Leg removed
        this.store.updateSegments(this.fms.flightPlan);
        break;

      case LegEventType.Changed:
        // Leg modified
        this.store.updateSegments(this.fms.flightPlan);
        break;
    }
  }
}
```

### Waypoint Entry Flow (G1000):

```
1. User presses INSERT softkey
2. Waypoint entry field appears
3. User types identifier (e.g., "BOS")
4. Facility search: await facLoader.searchByIdent('BOS')
5. Results dropdown shows matches
6. User selects "KBOS"
7. Facility loaded: await facLoader.getFacility('KBOS')
8. FMS inserts waypoint: fms.insertWaypoint(segment, facility, index)
9. Events published: fplLegChange
10. Store updated: store.updateSegments()
11. UI redrawn with new waypoint
```

**Files:**
- `src/workingtitle-instruments-g1000/html_ui/Shared/UI/FPL/FPLDetailsStore.ts`
- `src/workingtitle-instruments-g1000/html_ui/Shared/UI/FPL/FPLDetailsController.ts`

---

## 5. 🎨 G3000/G5000 Implementation

### FlightPlanStore Pattern

**File:** `src/workingtitle-instruments-g3000/wtg3000common/html_ui/Shared/FlightPlan/FlightPlanStore.ts`

```typescript
export class FlightPlanStore {
  // Segments and legs (reactive)
  private readonly _segmentMap = new Map<FlightPlanSegment, FlightPlanSegmentData>();
  private readonly _legMap = new Map<LegDefinition, FlightPlanLegData>();

  public readonly segments = ArraySubject.create<FlightPlanSegmentData>([]);

  // Origin/destination
  public readonly originFacility = Subject.create<AirportFacility | undefined>(undefined);
  public readonly originRunway = Subject.create<OneWayRunway | undefined>(undefined);
  public readonly destinationFacility = Subject.create<AirportFacility | undefined>(undefined);

  // Procedures
  public readonly departureProcedure = Subject.create<Procedure | undefined>(undefined);
  public readonly departureTransition = Subject.create<EnrouteTransition | undefined>(undefined);
  public readonly arrivalProcedure = Subject.create<Procedure | undefined>(undefined);
  public readonly arrivalTransition = Subject.create<EnrouteTransition | undefined>(undefined);
  public readonly approachProcedure = Subject.create<ApproachProcedure | undefined>(undefined);
  public readonly approachTransition = Subject.create<ApproachTransition | undefined>(undefined);

  // Direct-to
  public readonly directToData = Subject.create<DirectToData>({
    segmentIndex: -1,
    segmentLegIndex: -1
  });

  /**
   * Initializes store with flight plan events
   */
  public init(fms: Fms): void {
    const fpl = fms.flightPlanner;

    // Segment changes
    fpl.on('fplSegmentChange').handle(event => {
      this.handleSegmentChange(event);
    });

    // Leg changes
    fpl.on('fplLegChange').handle(event => {
      this.handleLegChange(event);
    });

    // Initial load
    this.rebuildSegmentMap(fms.flightPlan);
  }

  /**
   * Rebuilds segment map from flight plan
   */
  private rebuildSegmentMap(plan: FlightPlan): void {
    this._segmentMap.clear();
    this.segments.clear();

    for (let i = 0; i < plan.segmentCount; i++) {
      const segment = plan.getSegment(i);
      const data = new FlightPlanSegmentData(segment, i);
      this._segmentMap.set(segment, data);
      this.segments.insert(data);
    }
  }
}
```

### SubscribableArray Pattern:

```typescript
// Flight plan segments as subscribable array
public readonly segments: ArraySubject<FlightPlanSegmentData>;

// UI components subscribe to array changes
this.props.store.segments.sub((index, type, item) => {
  switch (type) {
    case SubscribableArrayEventType.Added:
      // New segment added
      this.renderSegment(item, index);
      break;

    case SubscribableArrayEventType.Removed:
      // Segment removed
      this.removeSegmentDisplay(index);
      break;

    case SubscribableArrayEventType.Cleared:
      // All segments cleared
      this.clearDisplay();
      break;
  }
}, true);
```

### Touch Waypoint Entry:

```typescript
export class WaypointSearchDialog extends AbstractDialog {
  private readonly keyboard = FSComponent.createRef<TouchKeyboard>();
  private readonly results = ArraySubject.create<Facility>([]);

  public onAfterRender(): void {
    // Subscribe to keyboard input
    this.keyboard.instance.onInput.handle(text => {
      this.performSearch(text);
    });
  }

  private async performSearch(text: string): Promise<void> {
    if (text.length < 1) {
      this.results.clear();
      return;
    }

    // Search facilities
    const icaos = await this.facLoader.searchByIdent(
      FacilitySearchType.All,
      text,
      40
    );

    // Load facilities
    const facilities = await this.facLoader.getFacilities(icaos);

    // Sort by distance
    facilities.sort((a, b) => {
      const distA = this.calculateDistance(a);
      const distB = this.calculateDistance(b);
      return distA - distB;
    });

    // Update results
    this.results.set(facilities);
  }

  private onFacilitySelected(facility: Facility): void {
    // Return facility to caller
    this.resolve(facility);
  }
}
```

**Files:**
- `src/workingtitle-instruments-g3000/wtg3000common/html_ui/Shared/FlightPlan/FlightPlanStore.ts`
- `src/workingtitle-instruments-g3000/wtg3000common/html_ui/Shared/FlightPlan/FlightPlanLegListData.ts`

---

## 6. 📱 G3X Touch Implementation

### FlightPlanDataArray Pattern

**File:** `src/workingtitle-instruments-g3x-touch/html_ui/Shared/FlightPlan/FlightPlanDataArray.ts`

```typescript
export interface FlightPlanDataArray extends SubscribableArray<FlightPlanDataItem> {
  readonly fromLegIndex: Subscribable<number>;
  readonly toLegIndex: Subscribable<number>;
  readonly cumulativeDataFields: readonly Subscribable<FlightPlanDataField<FlightPlanDataFieldType> | null>[];
}

export type FlightPlanDataItem =
  | FlightPlanLegDataItem
  | FlightPlanAddWaypointDataItem
  | FlightPlanApproachLegPreviewDataItem;

export enum FlightPlanDataItemType {
  Leg = 'Leg',
  AddWaypoint = 'AddWaypoint',
  ApproachLegPreview = 'ApproachLegPreview'
}
```

### Leg Data Item:

```typescript
export interface FlightPlanLegDataItem {
  type: FlightPlanDataItemType.Leg;
  flightPlan: FlightPlan;
  leg: LegDefinition;
  fixIcao: string;
  activeStatus: Subscribable<FlightPlanLegDataItemActiveStatus>;
  dataFields: readonly Subscribable<FlightPlanDataField<FlightPlanDataFieldType> | null>[];
}

export enum FlightPlanLegDataItemActiveStatus {
  None = 'None',
  From = 'From',      // Current leg (departing)
  To = 'To',          // Next leg (arriving)
  Past = 'Past'       // Already passed
}
```

### Data Fields:

```typescript
export enum FlightPlanDataFieldType {
  WaypointName = 'WaypointName',
  BearingMagnetic = 'BearingMagnetic',
  BearingTrue = 'BearingTrue',
  Distance = 'Distance',
  CumulativeDistance = 'CumulativeDistance',
  Altitude = 'Altitude',
  ETE = 'ETE',                    // Estimated time enroute
  Fuel = 'Fuel',
  DTK = 'DTK'                     // Desired track
}

export type FlightPlanDataField<T extends FlightPlanDataFieldType> =
  T extends FlightPlanDataFieldType.WaypointName
    ? { type: T; value: Subscribable<string> }
  : T extends FlightPlanDataFieldType.Distance
    ? { type: T; value: NumberUnitSubject<UnitFamily.Distance> }
  : T extends FlightPlanDataFieldType.BearingMagnetic
    ? { type: T; value: BasicNavAngleSubject }
  : never;
```

### Touch List Rendering:

```typescript
export class FlightPlanListItem extends DisplayComponent<FlightPlanListItemProps> {
  public render(): VNode {
    return (
      <div class="flight-plan-list-item">
        {/* Active status indicator */}
        <div class="active-indicator">
          {this.props.data.activeStatus.map(status => {
            switch (status) {
              case 'From': return '→';
              case 'To': return '▶';
              default: return '';
            }
          })}
        </div>

        {/* Waypoint name */}
        <div class="waypoint-name">
          {this.props.data.dataFields[0].map(field =>
            field?.type === FlightPlanDataFieldType.WaypointName
              ? field.value
              : ''
          )}
        </div>

        {/* Distance */}
        <div class="distance">
          {this.props.data.dataFields[2].map(field =>
            field?.type === FlightPlanDataFieldType.Distance
              ? field.value.map(val => val.toFixed(1) + ' NM')
              : ''
          )}
        </div>

        {/* Bearing */}
        <div class="bearing">
          {this.props.data.dataFields[1].map(field =>
            field?.type === FlightPlanDataFieldType.BearingMagnetic
              ? field.value.map(val => val.toFixed(0) + '°')
              : ''
          )}
        </div>
      </div>
    );
  }
}
```

**Files:**
- `src/workingtitle-instruments-g3x-touch/html_ui/Shared/FlightPlan/FlightPlanDataArray.ts`
- `src/workingtitle-instruments-g3x-touch/html_ui/Shared/FlightPlan/ActiveFlightPlanDataArray.ts`
- `src/workingtitle-instruments-g3x-touch/html_ui/Shared/FlightPlan/FlightPlanDataItem.ts`

---

## 7. 🔧 Flight Plan Modification Operations

### Insert Waypoint

**File:** `src/garminsdk/flightplan/Fms.ts`

```typescript
public insertWaypoint(
  segmentIndex: number,
  facility: Facility,
  legIndex?: number
): LegDefinition | undefined {
  const plan = this.getFlightPlan();
  const segment = plan.tryGetSegment(segmentIndex);

  if (!segment) {
    return undefined;
  }

  // Validate not inserting between DTO target and DTO leg
  if (segmentIndex === plan.directToData.segmentIndex && legIndex !== undefined) {
    const legIndexDelta = legIndex - plan.directToData.segmentLegIndex;
    if (legIndexDelta > 0 && legIndexDelta <= FmsUtils.DTO_LEG_OFFSET) {
      return undefined;  // Invalid insertion point
    }
  }

  // Create TF (track-to-fix) leg
  const leg = FlightPlan.createLeg({
    type: LegType.TF,
    fixIcaoStruct: facility.icaoStruct
  });

  // Check for duplicate legs
  const prevLeg = legIndex !== undefined && legIndex > 0
    ? segment.legs[legIndex - 1]
    : undefined;

  const nextLeg = legIndex !== undefined && legIndex < segment.legs.length
    ? segment.legs[legIndex]
    : undefined;

  if ((prevLeg && this.isDuplicateLeg(prevLeg.leg, leg)) ||
      (nextLeg && this.isDuplicateLeg(leg, nextLeg.leg))) {
    return undefined;  // Duplicate not allowed
  }

  // Add leg to flight plan
  const addedLeg = this.planAddLeg(segmentIndex, leg, legIndex);

  // Calculate flight path
  plan.calculate();

  return addedLeg;
}

private isDuplicateLeg(leg1: FlightPlanLeg, leg2: FlightPlanLeg): boolean {
  return ICAO.valueEquals(leg1.fixIcaoStruct, leg2.fixIcaoStruct);
}
```

### Remove Waypoint:

```typescript
public removeWaypoint(
  segmentIndex: number,
  segmentLegIndex: number
): boolean {
  const plan = this.getFlightPlan();
  const segment = plan.tryGetSegment(segmentIndex);

  if (!segment || segmentLegIndex >= segment.legs.length) {
    return false;
  }

  // Cannot remove DTO legs directly
  if (segment.legs[segmentLegIndex].flags & LegDefinitionFlags.DirectTo) {
    return false;
  }

  // Remove leg
  plan.removeLeg(segmentIndex, segmentLegIndex);

  // Update active leg if necessary
  const globalIndex = FmsUtils.getGlobalLegIndex(plan, segmentIndex, segmentLegIndex);
  if (globalIndex <= plan.activeLateralLeg) {
    plan.setLateralLeg(Math.max(0, plan.activeLateralLeg - 1));
  }

  // Recalculate
  plan.calculate();

  return true;
}
```

### Activate Leg:

```typescript
public activateLeg(
  segmentIndex: number,
  segmentLegIndex: number,
  planIndex = Fms.PRIMARY_PLAN_INDEX
): void {
  const plan = this.flightPlanner.getFlightPlan(planIndex);
  const globalIndex = FmsUtils.getGlobalLegIndex(plan, segmentIndex, segmentLegIndex);

  // Set active lateral leg
  plan.setLateralLeg(globalIndex);

  // Set calculating leg (for VNAV)
  plan.setCalculatingLeg(globalIndex);

  // Publish event
  this.flightPlanner.onEvent('fplActiveLegChange').notify(this, {
    planIndex,
    type: ActiveLegType.Lateral,
    index: globalIndex,
    segmentIndex,
    legIndex: segmentLegIndex,
    leg: plan.getLeg(globalIndex)
  });
}
```

---

## 8. 🚀 Direct-To Functionality

### Direct-To Random Waypoint:

```typescript
public createDirectToRandom(
  target: Facility | string,
  course?: number
): void {
  // Load facility if string ICAO
  const facility = typeof target === 'string'
    ? await this.facLoader.getFacility(ICAO.getFacilityType(target), target)
    : target;

  // Create DTO flight plan (index 1)
  const plan = this.flightPlanner.createFlightPlan(Fms.DTO_RANDOM_PLAN_INDEX);
  plan.insertSegment(0, FlightPlanSegmentType.RandomDirectTo);

  // Create 3-leg DTO sequence
  const segment = plan.getSegment(0);

  // Leg 0: Discontinuity
  const discoLeg = FlightPlan.createLeg({ type: LegType.Discontinuity });

  // Leg 1: Origin (aircraft position)
  const dtoOriginLeg = course === undefined
    ? this.createDTOOriginLeg(this.ppos)
    : discoLeg;

  // Leg 2: Target (direct-to-fix or course-to-fix)
  const dtoTargetLeg = course === undefined
    ? FlightPlan.createLeg({
        type: LegType.DF,
        fixIcaoStruct: facility.icaoStruct
      })
    : FlightPlan.createLeg({
        type: LegType.CF,
        fixIcaoStruct: facility.icaoStruct,
        course,
        trueDegrees: false
      });

  // Add legs to plan
  plan.addLeg(0, discoLeg, 0, LegDefinitionFlags.DirectTo);
  plan.addLeg(0, dtoOriginLeg, 1, LegDefinitionFlags.DirectTo);
  plan.addLeg(0, dtoTargetLeg, 2, LegDefinitionFlags.DirectTo);

  // Activate target leg
  plan.setLateralLeg(2);

  // Switch to DTO plan
  this.flightPlanner.setActivePlanIndex(Fms.DTO_RANDOM_PLAN_INDEX);

  // Calculate
  plan.calculate();
}
```

### Direct-To Existing Waypoint:

```typescript
public createDirectToExisting(
  segmentIndex: number,
  segmentLegIndex: number,
  course?: number
): void {
  const plan = this.getFlightPlan();

  // Set direct-to data
  plan.setDirectToData(segmentIndex, segmentLegIndex);

  // Get target leg
  const targetLeg = plan.getSegment(segmentIndex).legs[segmentLegIndex];

  // Create 3 DTO legs
  const discoLeg = FlightPlan.createLeg({ type: LegType.Discontinuity });
  const originLeg = course === undefined
    ? this.createDTOOriginLeg(this.ppos)
    : discoLeg;

  const dtoLeg = course === undefined
    ? FlightPlan.createLeg({
        type: LegType.DF,
        fixIcaoStruct: targetLeg.leg.fixIcaoStruct
      })
    : FlightPlan.createLeg({
        type: LegType.CF,
        fixIcaoStruct: targetLeg.leg.fixIcaoStruct,
        course
      });

  // Insert DTO legs before target
  plan.addLeg(segmentIndex, discoLeg, segmentLegIndex, LegDefinitionFlags.DirectTo);
  plan.addLeg(segmentIndex, originLeg, segmentLegIndex + 1, LegDefinitionFlags.DirectTo);
  plan.addLeg(segmentIndex, dtoLeg, segmentLegIndex + 2, LegDefinitionFlags.DirectTo);

  // Activate DTO target leg
  const globalIndex = FmsUtils.getGlobalLegIndex(
    plan,
    segmentIndex,
    segmentLegIndex + FmsUtils.DTO_LEG_OFFSET
  );
  plan.setLateralLeg(globalIndex);

  // Calculate
  plan.calculate();
}
```

### Cancel Direct-To:

```typescript
public cancelDirectTo(): boolean {
  const activePlanIndex = this.flightPlanner.activePlanIndex;

  // If DTO random, delete plan and return to primary
  if (activePlanIndex === Fms.DTO_RANDOM_PLAN_INDEX) {
    this.flightPlanner.deleteFlightPlan(Fms.DTO_RANDOM_PLAN_INDEX);
    this.flightPlanner.setActivePlanIndex(Fms.PRIMARY_PLAN_INDEX);
    return true;
  }

  // If DTO existing, remove DTO legs
  const plan = this.getFlightPlan();
  if (plan.directToData.segmentIndex !== -1) {
    const segmentIndex = plan.directToData.segmentIndex;
    const legIndex = plan.directToData.segmentLegIndex;

    // Remove 3 DTO legs
    plan.removeLeg(segmentIndex, legIndex);
    plan.removeLeg(segmentIndex, legIndex);
    plan.removeLeg(segmentIndex, legIndex);

    // Clear DTO data
    plan.setDirectToData(-1, -1);

    // Reactivate next leg
    plan.setLateralLeg(FmsUtils.getGlobalLegIndex(plan, segmentIndex, legIndex));

    return true;
  }

  return false;
}
```

---

## 9. 🎯 Procedure Integration

### Insert Departure (SID):

```typescript
public insertDeparture(
  facility: AirportFacility,
  departureIndex: number,
  departureRunwayIndex: number,
  enrouteTransitionIndex: number,
  oneWayRunway?: OneWayRunway
): void {
  const plan = this.getFlightPlan();

  // Build departure legs
  const procedureLegs = await this.buildDepartureLegs(
    facility,
    departureIndex,
    enrouteTransitionIndex,
    departureRunwayIndex,
    oneWayRunway
  );

  // Clear existing departure segment
  this.removeDeparture();

  // Insert departure segment
  const segmentIndex = FmsUtils.getDepartureSegmentIndex(plan);
  plan.insertSegment(segmentIndex, FlightPlanSegmentType.Departure);

  // Add legs to segment
  for (const leg of procedureLegs) {
    plan.addLeg(segmentIndex, leg);
  }

  // Set departure in plan
  plan.setDeparture(facility.icao, departureIndex);
  plan.setDepartureRunway(oneWayRunway);
  plan.setDepartureEnrouteTransition(enrouteTransitionIndex);

  // Calculate
  plan.calculate();
}
```

### Build Departure Legs:

```typescript
private async buildDepartureLegs(
  facility: AirportFacility,
  departureIndex: number,
  enrouteTransitionIndex: number,
  runwayTransitionIndex: number,
  runway?: OneWayRunway,
  performLegRemap = false
): Promise<FlightPlanLeg[]> {
  const procedure = facility.departures[departureIndex];

  // Get runway transition (if selected)
  const runwayTransition = runwayTransitionIndex >= 0
    ? procedure.runwayTransitions[runwayTransitionIndex]
    : undefined;

  // Get enroute transition (if selected)
  const enrouteTransition = enrouteTransitionIndex >= 0
    ? procedure.enRouteTransitions[enrouteTransitionIndex]
    : undefined;

  // Collect all legs
  const legs: FlightPlanLeg[] = [];

  // Add runway transition legs
  if (runwayTransition) {
    legs.push(...runwayTransition.legs);
  }

  // Add common legs
  legs.push(...procedure.commonLegs);

  // Add enroute transition legs
  if (enrouteTransition) {
    legs.push(...enrouteTransition.legs);
  }

  // Remap unsupported leg types if requested
  if (performLegRemap) {
    return this.procedureLegMapper(legs, facility, procedure);
  }

  return legs;
}
```

### Insert Approach:

```typescript
public async insertApproach(
  facility: AirportFacility,
  approachIndex: number,
  transitionIndex: number,
  runway?: OneWayRunway,
  skipCourseReversal = false
): Promise<void> {
  const plan = this.getFlightPlan();

  // Build approach legs
  const procedureLegs = await this.buildApproachLegs(
    facility,
    approachIndex,
    transitionIndex,
    skipCourseReversal
  );

  // Clear existing approach
  this.removeApproach();

  // Insert approach segment
  const segmentIndex = FmsUtils.getApproachSegmentIndex(plan);
  plan.insertSegment(segmentIndex, FlightPlanSegmentType.Approach);

  // Add legs
  for (const leg of procedureLegs.legs) {
    plan.addLeg(segmentIndex, leg);
  }

  // Set approach in plan
  plan.setApproach(facility.icao, approachIndex);
  plan.setApproachTransition(transitionIndex);

  // Set runway if available
  if (runway) {
    plan.setDestinationRunway(runway);
  }

  // Calculate
  await plan.calculate();
}
```

---

## 10. 📊 Implementation Comparison Table

| Aspect | G1000 | G3000 | G3X Touch |
|--------|-------|-------|-----------|
| **Architecture** | Store + Controller | FlightPlanStore | FlightPlanDataArray |
| **Reactive Pattern** | ArraySubject | SubscribableArray | SubscribableArray |
| **Waypoint Entry** | Scratchpad/Keyboard | Touch keyboard | Touch keyboard |
| **Search** | Dropdown menu | Dialog overlay | Dialog overlay |
| **List Display** | Text-based | Touch-optimized | Grid with columns |
| **Direct-To** | Softkey menu | Touch button | Touch button |
| **Procedures** | Selection pages | Touch dialogs | Touch dialogs |
| **Map Integration** | Basic | Advanced | Advanced |
| **Complexity** | Medium | High | Medium-High |

---

## 11. 💡 Implementation Tips

### Starting Your Own Flight Plan System:

**1. Initialize FlightPlanner:**

```typescript
// Get flight planner instance
const fpl = FlightPlanner.getPlanner('my-fpl', bus);

// Create primary flight plan
const plan = fpl.createFlightPlan(0);

// Subscribe to events
fpl.on('fplLegChange').handle(event => {
  console.log('Leg changed:', event);
});
```

**2. Set Up FMS:**

```typescript
const fms = new Fms(bus, fpl, facLoader, {
  // Options
});

// Initialize managed flight plan
fms.initManagedFlightPlan();
```

**3. Insert Waypoint:**

```typescript
// Search for facility
const results = await facLoader.searchByIdent(
  FacilitySearchType.All,
  'BOS'
);

// Load facility
const facility = await facLoader.getFacility(
  FacilityType.Airport,
  results[0]
);

// Insert waypoint
fms.insertWaypoint(
  0,           // Segment index (enroute)
  facility,
  undefined    // Append to end
);
```

**4. Create Store:**

```typescript
export class MyFlightPlanStore {
  public readonly legs = ArraySubject.create<LegDisplayData>([]);

  constructor(fms: Fms) {
    const fpl = fms.flightPlanner;

    // Subscribe to leg changes
    fpl.on('fplLegChange').handle(event => {
      this.handleLegChange(event);
    });

    // Initial load
    this.rebuild(fms.flightPlan);
  }

  private rebuild(plan: FlightPlan): void {
    const newLegs: LegDisplayData[] = [];

    for (let i = 0; i < plan.segmentCount; i++) {
      const segment = plan.getSegment(i);

      for (let j = 0; j < segment.legs.length; j++) {
        const leg = segment.legs[j];
        newLegs.push(this.createLegDisplayData(leg));
      }
    }

    this.legs.set(newLegs);
  }
}
```

**5. Render Flight Plan List:**

```typescript
export class FlightPlanList extends DisplayComponent<FlightPlanListProps> {
  public render(): VNode {
    return (
      <div class="flight-plan-list">
        {this.props.store.legs.map((leg, index) => (
          <FlightPlanLegRow
            leg={leg}
            index={index}
            isActive={index === this.props.store.activeLegIndex.get()}
          />
        ))}
      </div>
    );
  }
}
```

---

## 12. 📚 Key Files Reference

### Core SDK:
- `src/sdk/flightplan/FlightPlanner.ts` - Flight planner manager
- `src/sdk/flightplan/FlightPlan.ts` - Flight plan class
- `src/sdk/flightplan/FlightPlanning.ts` - Types and interfaces
- `src/sdk/navigation/FacilityLoader.ts` - Facility loading/search

### Garmin FMS:
- `src/garminsdk/flightplan/Fms.ts` - Main FMS (5400+ lines!)
- `src/garminsdk/flightplan/FmsUtils.ts` - Utility functions
- `src/garminsdk/flightplan/FmsEvents.ts` - Event definitions

### G1000:
- `src/workingtitle-instruments-g1000/html_ui/Shared/UI/FPL/FPLDetailsStore.ts`
- `src/workingtitle-instruments-g1000/html_ui/Shared/UI/FPL/FPLDetailsController.ts`

### G3000:
- `src/workingtitle-instruments-g3000/wtg3000common/html_ui/Shared/FlightPlan/FlightPlanStore.ts`
- `src/workingtitle-instruments-g3000/wtg3000common/html_ui/Shared/FlightPlan/FlightPlanLegListData.ts`

### G3X Touch:
- `src/workingtitle-instruments-g3x-touch/html_ui/Shared/FlightPlan/FlightPlanDataArray.ts`
- `src/workingtitle-instruments-g3x-touch/html_ui/Shared/FlightPlan/ActiveFlightPlanDataArray.ts`

---

This guide demonstrates the complete flight plan management architecture from waypoint search through flight plan modification to visual display. The system showcases asynchronous operations, reactive data patterns, and complex state management - representing the full power of the Garmin SDK!
