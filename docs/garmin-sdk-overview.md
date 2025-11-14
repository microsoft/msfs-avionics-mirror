# Understanding the Garmin SDK for MSFS Avionics

A comprehensive guide to the Garmin SDK structure and how to use it to build your own instruments.

---

## 📦 SDK Location and Structure

The Garmin SDK is located at `/src/garminsdk/` and contains these major systems:

### Core Modules

- **`flightplan/Fms.ts`** - Flight Management System (the brain of the aircraft)
- **`autopilot/`** - Autopilot logic, VNAV, LNAV systems
- **`navigation/`** - Nav computers, waypoint tracking, GPS integrity
- **`system/`** - Avionics systems (ADC, AHRS, GPS, Radar Altimeter, etc.)
- **`components/`** - Reusable UI components (maps, nav displays, touch controls)
- **`settings/`** - User settings management
- **`traffic/`** - TCAS and traffic systems

### Package Organization

**Core Packages:**
- **`alerts/`** - Alert management (baro transition alerts, etc.)
- **`autopilot/`** - Autopilot systems (FMA data, VNAV, LNAV, Go-around, etc.)
- **`charts/`** - Chart utilities (FAA, Lido charts)
- **`checklist/`** - Checklist system and DOM parsing
- **`components/`** - Reusable UI components
- **`esp/`** - Electronic Stability and Protection system
- **`flightplan/`** - Flight management system (Fms class)
- **`graphics/`** - Rendering and graphics utilities
- **`instruments/`** - Instrument-specific systems
- **`math/`** - Unit types and math utilities
- **`minimums/`** - Minimums data providers
- **`navigation/`** - Navigation systems (NavIndicator, NavdataComputer, etc.)
- **`navreference/`** - Navigation reference sources and selectors
- **`radio/`** - Radio control and management
- **`settings/`** - User settings management
- **`softkey/`** - Soft key system
- **`system/`** - Avionics systems (ADC, AHRS, GPS, etc.)
- **`terrain/`** - Terrain and TAWS
- **`timer/`** - Timer management
- **`traffic/`** - Traffic management and TCAS
- **`wind/`** - Wind data providers

**Package Info:**
- **Name:** `@microsoft/msfs-garminsdk`
- **Version:** 2.2.3
- **Entry Point:** `/src/garminsdk/index.ts`

---

## 🎯 Key Concepts You Need to Know

### 1. EventBus - The Communication Backbone

Everything communicates through a central event bus:

```typescript
// Create the bus
const bus = new EventBus();

// Publish data
const publisher = bus.getPublisher<AdcEvents>();
publisher.pub('adc_altitude', 5000);

// Subscribe to data
const subscriber = bus.getSubscriber<AdcEvents>();
subscriber.on('adc_altitude').handle(altitude => {
  console.log('Altitude:', altitude);
});
```

**Location:** `/src/sdk/data/EventBus.ts`

**Key Concepts:**
- **Topics** - String identifiers for events
- **Events** - Typed objects containing event data
- **Publisher** - Publishes events to a topic
- **Subscriber** - Listens for events on topics
- **Sync** - Whether event syncs across instruments
- **Cached** - Whether event data is cached for late subscribers

### 2. Avionics Systems

Systems extend `BasicAvionicsSystem` and handle specific aircraft data:

- **AdcSystem** (`system/AdcSystem.ts`) - Air data (altitude, speed, temperature)
- **AhrsSystem** (`system/AhrsSystem.ts`) - Attitude and heading
- **GpsReceiverSystem** - GPS data
- **FmsPositionSystem** - Position calculations

Each system:
- Has initialization time (simulates startup)
- Publishes data to the EventBus
- Can fail or be powered off

**System States:**
- `AvionicsSystemState.Init` - Initializing
- `AvionicsSystemState.On` - Operating normally
- `AvionicsSystemState.Off` - Powered off
- `AvionicsSystemState.Failed` - System failure

**Example:**

```typescript
export class AdcSystem extends BasicAvionicsSystem<AdcSystemEvents> {
  protected initializationTime = 15000;  // Initialization time in ms

  // System publishes events
  private readonly dataSourceSubscriber = this.bus.getSubscriber<AdcEvents>();

  // Maps source topics to output topics
  private readonly altitudeDataSourceTopicMap = {
    [`adc_indicated_alt_${this.index}`]: `indicated_alt_${this.altimeterIndex}`,
    // ...
  };

  // System initialization
  onInit() {
    // Subscribe to sources
    // Set up data mappings
  }

  onPowerOn() {
    // Handle power on
  }

  onPowerOff() {
    // Handle power off
  }
}
```

### 3. Data Providers

Providers compute derived data from raw systems:

- **WindDataProvider** - Calculates wind from TAS/GS/Track
- **VNavDataProvider** - Vertical navigation guidance
- **AltimeterDataProvider** - Barometric corrections
- **GpsIntegrityDataProvider** - GPS accuracy/integrity

**Pattern:**

```typescript
// Interface definition
export interface WindDataProvider {
  readonly windDirection: Subscribable<number>;
  readonly windSpeed: Subscribable<number>;
  readonly headwind: Subscribable<number>;
  readonly crosswind: Subscribable<number>;
  readonly magVar: Subscribable<number>;
  readonly isGpsDeadReckoning: Subscribable<boolean>;
  readonly isDataFailed: Subscribable<boolean>;
}

// Implementation
export class DefaultWindDataProvider implements WindDataProvider {
  private readonly _windSpeed = Subject.create(0);
  public readonly windSpeed = this._windSpeed as Subscribable<number>;

  // Consumes data from event bus and computes derived values
  private readonly tas = ConsumerValue.create(null, 0).pause();
  private readonly windDirectionSource = ConsumerValue.create(null, 0).pause();

  constructor(bus: EventBus, adcIndex: Subscribable<number>, ...) {
    // Connect consumers and set up computations
  }
}
```

### 4. FMS (Flight Management System)

The `Fms` class (`flightplan/Fms.ts`) is central:
- Manages flight plans
- Handles procedures (SIDs, STARs, approaches)
- Direct-to navigation
- Holds patterns
- ~4000+ lines of complex logic!

```typescript
// Main FMS class
export class Fms<ID extends string = any> {
  public static readonly PRIMARY_PLAN_INDEX = 0;
  public static readonly DTO_RANDOM_PLAN_INDEX = 1;
  public static readonly PROC_PREVIEW_PLAN_INDEX = 2;

  // Configuration
  constructor(
    bus: EventBus,
    flightPlanner: FlightPlanner,
    facLoader: FacilityLoader,
    options?: FmsOptions
  ) {
    this.activeFlightPlan = flightPlanner.getFlightPlan(Fms.PRIMARY_PLAN_INDEX);
  }

  // Methods
  initManagedFlightPlan(): void
  directTo(facility: Facility): void
  insertProcedure(procedure: Procedure): void
  activateApproach(approach: ApproachProcedure): void
}
```

### 5. Subscribables (Reactive Pattern)

Like RxJS observables:

```typescript
const altitude = Subject.create<number>(0);

// Subscribe to changes
altitude.sub(alt => console.log('New altitude:', alt));

// Update value
altitude.set(5000);

// Advanced: MappedSubject combines multiple subscribables
const combined = MappedSubject.create(
  ([val1, val2]) => val1 + val2,
  subject1,
  subject2
);

// ConsumerValue - subscribes to event bus topics
const adcIndex = ConsumerValue.create(null, 0).pause();
adcIndex.setConsumer(bus.getSubscriber<PfdSensorsSettingManagerSensorIndexEvents>().on('pfdAdcIndex'));
```

**Key Subjects:**
- `Subject<T>` - Basic subscribable
- `ObjectSubject<T>` - Subject for objects
- `MappedSubject` - Combines multiple subscribables
- `ConsumerSubject` - Consumes from event bus
- `ConsumerValue` - Single-value consumer

### 6. Navigation Reference System

```typescript
// Navigation sources
interface G3000NavSources extends NavReferenceSourceCollection {
  gps: GpsNavSource;
  nav1: NavRadioNavSource;
  nav2: NavRadioNavSource;
  // ... etc
}

// Navigation indicators (displays)
interface G3000NavIndicators extends NavReferenceIndicatorsCollection {
  activeNavIndicator: G3000ActiveNavIndicator;
  bearingPointer1: G3000BearingPointerNavIndicator;
  // ... etc
}

// In your instrument:
const navSources = this.createNavReferenceSourceCollection();
const navIndicators = this.createNavReferenceIndicatorCollection();
```

### 7. Plugin System

Instruments support plugins for extensibility:

```typescript
// Plugin interface
export interface G3000PfdPlugin {
  onInit(): void;
  onFsInstrumentReady(): void;
}

// Binder passes context to plugins
export class G3000PfdPluginBinder {
  public bus!: EventBus;
  public fms!: Fms;
  // ... other properties
}

// Register plugins
const pluginSystem = new PluginSystem<G3000PfdPlugin, G3000PfdPluginBinder>();
pluginSystem.register(pluginBinder);
```

---

## 📚 Real-World Examples

### G1000 NXi

**Path:** `/src/workingtitle-instruments-g1000/`
**Entry:** `html_ui/PFD/WTG1000_PFD.tsx`

Simple architecture:

```typescript
class WTG1000_PFD extends BaseInstrument {
  private readonly bus = new EventBus();

  // Publishers for different data sources
  private readonly baseInstrumentPublisher: BaseInstrumentPublisher;
  private readonly adcPublisher: AdcPublisher;
  private readonly ahrsPublisher: AhrsPublisher;
  // ... more publishers

  // Systems
  private readonly adcSystem: AdcSystem;
  private readonly ahrsSystem: AhrsSystem;
  // ... more systems

  constructor() {
    // Initialize publishers, systems, and UI
    this.initializeSystems();
    this.renderUI();
  }
}
```

**Key Pattern:**
1. Create an `EventBus` instance
2. Create Publishers for each data source (ADC, AHRS, GNSS, etc.)
3. Create Systems that process the data
4. Subscribe to the event bus in UI components

**Structure:**
```
- Shared/          # Configuration, plugins, common systems
  - G1000Plugin.ts
  - Systems/       # ADC, AHRS, Transponder, etc.
  - Profiles/      # Airframe options, settings
  - NavCom/        # Radio configuration
  - UI/            # Menus, dialogs, soft keys
- PFD/             # Primary flight display
  - Components/    # Flight instruments, HSI, overlays
  - WTG1000_PFD.tsx
- MFD/             # Multi-function display
  - Components/    # Engine info, maps
  - WTG1000_MFD.tsx
```

### G3000/G5000

**Path:** `/src/workingtitle-instruments-g3000/`
**Entry:** `html_ui/PFD/WTG3000PfdInstrument.tsx`

More complex with:
- Configuration system (XML-driven)
- Plugin architecture
- Data providers
- Navigation reference system

```typescript
// WTG3000_PFD.ts
class WTG3000_PFD extends WTG3000BaseInstrument<WTG3000PfdInstrument> {
  public constructInstrument(): WTG3000PfdInstrument {
    return new WTG3000PfdInstrument(
      this,
      new AvionicsConfig(this, this.xmlConfig),
      new PfdConfig(this.xmlConfig, this.instrumentXmlConfig)
    );
  }
}

// WTG3000PfdInstrument.tsx
export class WTG3000PfdInstrument extends WTG3000FsInstrument {
  private readonly bus = this.bus;  // From parent

  // Systems
  private readonly trafficSystem: TrafficSystem;
  private readonly casSystem = new CasSystem(this.bus);

  // Data providers
  private readonly windDataProvider = new DefaultWindDataProvider(...);
  private readonly vnavDataProvider = new DefaultVNavDataProvider(...);
  private readonly altimeterDataProvider = new DefaultAltimeterDataProvider(...);

  // Flight management
  private readonly fms: Fms;
  private readonly flightPlanStore = new FlightPlanStore(...);

  constructor(instrument: BaseInstrument, config: AvionicsConfig, ...) {
    this.createSystems();
    this.navSources = this.createNavReferenceSourceCollection();
    this.navIndicators = this.createNavReferenceIndicatorCollection();
  }
}
```

### G3X Touch

**Path:** `/src/workingtitle-instruments-g3x-touch/`
**Entry:** `html_ui/Shared/G3XTouchFsInstrument.tsx`

Modern touch interface with integrated PFD/MFD.

### Other Instruments

- **GNS430W/530W**: `/src/workingtitle-instruments-gns/`
- **WT21**: `/src/workingtitle-instruments-wt21/`
- **Epic 2/Apex**: `/src/workingtitle-instruments-epic2/`
- **UNS-1**: `/src/workingtitle-instruments-uns-1lw/`

---

## 🛠️ How to Build Your Own Instrument

### Basic Pattern:

```typescript
// 1. Extend BaseInstrument
class MyInstrument extends BaseInstrument {

  // 2. Create EventBus
  private readonly bus = new EventBus();

  // 3. Initialize Systems
  private readonly adcSystem = new AdcSystem(0, this.bus, ...);
  private readonly ahrsSystem = new AhrsSystem(0, this.bus, ...);

  // 4. Create Data Providers
  private readonly windDataProvider = new DefaultWindDataProvider(
    this.bus, adcIndex, ahrsIndex
  );

  // 5. Initialize FMS
  private readonly fms = new Fms(
    this.bus,
    flightPlanner,
    facLoader
  );

  // 6. Build UI
  public render(): VNode {
    return <MyDisplay bus={this.bus} fms={this.fms} />;
  }
}
```

### Essential Steps:

1. **Create EventBus** - Communication hub
2. **Add Publishers** - For sim data (GPS, ADC, AHRS, autopilot, etc.)
3. **Add Systems** - Process and validate data
4. **Add Data Providers** - Compute derived values
5. **Initialize FMS** - Flight planning and navigation
6. **Build UI Components** - Display data using FSComponent
7. **Wire up User Input** - Knobs, buttons, touch

### Configuration-Driven Initialization

Most instruments use XML configuration files:

```typescript
// Configuration is loaded from XML and passed to instrument
new AvionicsConfig(this, this.xmlConfig)  // General config
new PfdConfig(this.xmlConfig, ...)         // Instrument-specific config
```

---

## 🧩 Common Base Classes and Interfaces

### From Base SDK (`/src/sdk/`)

- **`FsInstrument`** - Base class for all instruments
- **`BaseInstrument`** - MSFS base class
- **`EventBus`** - Central event system
- **`Subject/Subscribable`** - Observable pattern
- **`Consumer/Publisher`** - Event bus patterns
- **`AvionicsSystem`** - Base for all systems
- **`FlightPlanner`** - Flight plan management
- **`FacilityLoader`** - Facility data loading

### From Garmin SDK (`/src/garminsdk/`)

- **`BasicAvionicsSystem<Events>`** - Base for Garmin systems
- **`Fms`** - Flight management system
- **`NavIndicatorController`** - Navigation displays
- **`NavdataComputer`** - Navigation calculations
- **`GarminAutopilot`** - Autopilot implementation
- **Data Providers** - Wind, VNav, GPS Integrity, Minimums, etc.

---

## 🔍 Key Files to Study

### Foundation:

**Entry Points:**
- `/src/sdk/FsInstrument.ts` - Base instrument class
- `/src/garminsdk/index.ts` - SDK exports
- `/src/garminsdk/flightplan/Fms.ts` - FMS system (study this!)
- `/src/sdk/data/EventBus.ts` - Event system
- `/src/sdk/sub/Subscribable.ts` - Subscription system

### Real Examples:

- `/src/workingtitle-instruments-g1000/html_ui/PFD/WTG1000_PFD.tsx` - Simpler example
- `/src/workingtitle-instruments-g3000/html_ui/PFD/WTG3000PfdInstrument.tsx` - Complex example
- `/src/workingtitle-instruments-g3x-touch/html_ui/Shared/G3XTouchFsInstrument.tsx` - Modern example

---

## 📖 Documentation Resources

### Official Documentation

**API Docs:** https://microsoft.github.io/msfs-avionics-mirror/2024/
- Complete API documentation
- Architecture guides
- Best practices

### README Files:

- `/README.md` - Project overview
- `/src/workingtitle-instruments-g1000/README.md` - G1000 build instructions

### Example Code Comments:

- G1000, G3000, G3X Touch provide detailed examples
- Configuration files show system setup
- UI components show component patterns

---

## 💡 Pro Tips

1. **Start Simple** - Look at G1000 structure first, it's the most straightforward
2. **EventBus is Everything** - All data flows through it
3. **Reuse Systems** - Don't reinvent ADC, AHRS, etc.
4. **Study the FMS** - It's complex but handles all flight planning
5. **Use Data Providers** - They handle the math for you
6. **Components are Modular** - Mix and match UI components from SDK

---

## 🎯 Core Component Systems

### Display Systems

The Garmin SDK provides sophisticated component systems:

**Map Components** (`components/map/`):
- `MapWaypointRenderer.ts` - Renders waypoints on maps
- `MapAirspaceRendering.ts` - Airspace rendering
- `MapTerrainWxSettingCompatManager.ts` - Terrain/weather compatibility
- Controllers for range, orientation, panning, traffic, etc.

**UI Components** (`components/`):
- **CAS** - Crew alerting system
- **Charts** - Chart display layers
- **List** - Dynamic list components
- **NavDataBar** - Navigation data bar fields
- **NavDataField** - Individual data field components
- **NextGenPFD** - Primary flight display components
- **Terrain** - Terrain annunciation
- **TouchButton, TouchPad, TouchSlider** - Touch input controls
- **WeatherRadar** - Weather radar display

### Navigation Systems (`navigation/`)

Core navigation classes:
- **`NavIndicatorController.ts`** - Controls nav indicator displays
- **`NavdataComputer.ts`** - Computes navigation data from various sources
- **`VNavDataProvider.ts`** - Vertical navigation data
- **`GpsIntegrityDataProvider.ts`** - GPS data integrity
- **`WaypointAlertComputer.ts`** - Waypoint alerts
- **`CdiAutoSlewManager.ts`** - Course deviation indicator

### Autopilot Systems (`autopilot/`)

- **`GarminAutopilot.ts`** - Main autopilot class extending base Autopilot
- **`GarminAPStateManager.ts`** - AP state management
- **`GarminVNavManager2.ts`** - Vertical navigation
- **`GarminNavToNavComputer.ts`** - Nav-to-nav transitions
- **`GarminSpeedConstraintStore.ts`** - Speed constraint management
- **`FmaData.ts`** - Flight mode annunciator data

---

## 📊 Data Flow Architecture

### Event Bus Architecture

```
All attitude data flows through the event bus:
- SimVars → SDK Publishers
- Publishers → Event Bus
- Subscribers (Components) ← Event Bus
- Components render to DOM/Canvas
```

### Indexing Pattern

Most systems support multiple instances (dual-AHRS):

```typescript
ahrs_pitch_deg_1     // Primary AHRS
ahrs_pitch_deg_2     // Secondary AHRS

// Selector automatically picks best one
// Components subscribe to selected index
```

### Subscribable Pattern

Heavy use of reactive data binding:

```typescript
// Instead of polling, data "flows" through subscribables
ConsumerSubject<T>()  // Subscribe to event bus topic
  .sub(callback)      // React to changes
  .pipe(derived)      // Transform data
  .map(transform)     // Create derived values
  .whenChanged()      // Only on actual change
```

---

## 🚀 Summary: Building Your Own Garmin Instrument

### Steps:

1. **Extend BaseInstrument or WTG3000BaseInstrument**
   ```typescript
   class MyInstrument extends BaseInstrument {
     private readonly bus = new EventBus();
   }
   ```

2. **Create or reuse Systems**
   ```typescript
   private readonly adcSystem = new AdcSystem(0, this.bus, ...);
   private readonly ahrsSystem = new AhrsSystem(0, this.bus, ...);
   ```

3. **Use Data Providers for derived data**
   ```typescript
   private readonly windDataProvider = new DefaultWindDataProvider(
     this.bus, adcIndex, ahrsIndex
   );
   ```

4. **Initialize Flight Management**
   ```typescript
   private readonly fms = new Fms(this.bus, flightPlanner, facLoader, options);
   ```

5. **Create Navigation References**
   ```typescript
   const navSources = this.createNavReferenceSourceCollection();
   const navIndicators = this.createNavReferenceIndicatorCollection();
   ```

6. **Build UI with FSComponent**
   ```typescript
   return <InstrumentDisplay bus={this.bus} fms={this.fms} />;
   ```

7. **Handle User Input**
   ```typescript
   private handleSoftKeyPress(key: number) {
     // Route to appropriate handler
   }
   ```

---

This comprehensive overview provides everything needed to understand and build custom Garmin avionics instruments for MSFS!
