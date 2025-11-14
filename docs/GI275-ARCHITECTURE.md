# Garmin GI 275 - Architecture Documentation

## Project Overview

This document describes the architecture for implementing the Garmin GI 275 electronic flight instrument for Microsoft Flight Simulator 2024, based on the Working Title G3X Touch framework.

## Product Specifications

### Garmin GI 275

The GI 275 is a compact, multi-mode electronic flight instrument that can replace various 3.125-inch round instruments.

**Key Features:**
- 3.125-inch circular touchscreen display
- Multi-mode operation: AI, HSI, CDI, MFD, EIS
- Touchscreen interface with optional concentric knob
- Built-in Bluetooth and WiFi connectivity
- 60-minute backup battery option
- Terrain, obstacles, and SafeTaxi databases
- 4-in-1 capability (attitude, airspeed, altitude, heading)

**Display Modes:**
1. **AI** - Attitude Indicator with airspeed/altitude tapes
2. **HSI** - Horizontal Situation Indicator with bearing pointers
3. **CDI** - Course Deviation Indicator with navigation source
4. **MFD** - Multi-Function Display with maps, terrain, SafeTaxi
5. **EIS** - Engine Indication System with full engine monitoring

## Architecture Foundation: G3X Touch

### Why G3X Touch?

After analyzing existing implementations (G1000 NXi, G3000, G3X Touch, WT21, Epic2), the **G3X Touch** provides the ideal architectural foundation:

✓ **Extensible display system** - Supports multiple GDU formats
✓ **Built-in mode switching** - Page/view registration system
✓ **Touchscreen-first** - Native touch infrastructure
✓ **Modular plugin architecture** - Clean component isolation
✓ **Component reusability** - Extensive library of flight instruments
✓ **Proven data providers** - FMS, navigation, radios, engine data

### Key Architectural Components

```
G3X Touch Architecture (adapted for GI 275)
├── GduDisplay                    # Display container framework
├── MfdPageRegistrar              # Mode/page registration system
├── UiService                     # UI state and lifecycle management
├── G3XTouchPlugin                # Plugin interface for components
├── Touch Infrastructure          # Touch buttons, gestures, interactions
├── Data Providers                # FMS, nav indicators, radios, engine
└── Shared Components             # Horizon, HSI, maps, gauges
```

## Project Structure

```
src/workingtitle-instruments-gi275/
├── html_ui/
│   ├── GduDisplay/
│   │   └── Gi275/
│   │       ├── Gi275Display.tsx              # Main display container
│   │       ├── Gi275DisplayProps.ts          # Display properties
│   │       ├── Gi275CircularViewport.tsx     # Circular clipping/layout
│   │       └── Gi275ModeController.ts        # Mode state management
│   │
│   ├── Modes/
│   │   ├── AiMode/                           # Attitude Indicator
│   │   │   ├── Gi275AiMode.tsx               # AI mode container
│   │   │   ├── Gi275HorizonDisplay.tsx       # Circular horizon
│   │   │   ├── Gi275AirspeedTape.tsx         # Compact airspeed
│   │   │   ├── Gi275AltitudeTape.tsx         # Compact altitude
│   │   │   └── Gi275AiSettings.ts            # AI mode settings
│   │   │
│   │   ├── HsiMode/                          # Horizontal Situation Indicator
│   │   │   ├── Gi275HsiMode.tsx              # HSI mode container
│   │   │   ├── Gi275CompassRose.tsx          # Rotating compass
│   │   │   ├── Gi275BearingPointer.tsx       # ADF/NAV bearing pointers
│   │   │   ├── Gi275CourseNeedle.tsx         # Course indicator
│   │   │   └── Gi275HsiSettings.ts           # HSI mode settings
│   │   │
│   │   ├── CdiMode/                          # Course Deviation Indicator
│   │   │   ├── Gi275CdiMode.tsx              # CDI mode container
│   │   │   ├── Gi275CdiNeedle.tsx            # Deviation needle
│   │   │   ├── Gi275CourseSelector.tsx       # Course selection
│   │   │   ├── Gi275NavSourceIndicator.tsx   # GPS/VOR/LOC indicator
│   │   │   └── Gi275CdiSettings.ts           # CDI mode settings
│   │   │
│   │   ├── MfdMode/                          # Multi-Function Display
│   │   │   ├── Gi275MfdMode.tsx              # MFD mode container
│   │   │   ├── Gi275Map.tsx                  # Circular map display
│   │   │   ├── Gi275TerrainOverlay.tsx       # Terrain awareness
│   │   │   ├── Gi275SafeTaxi.tsx             # Airport diagrams
│   │   │   ├── Gi275TrafficOverlay.tsx       # Traffic display
│   │   │   └── Gi275MfdSettings.ts           # MFD mode settings
│   │   │
│   │   └── EisMode/                          # Engine Indication System
│   │       ├── Gi275EisMode.tsx              # EIS mode container
│   │       ├── Gi275EngineGauges.tsx         # RPM, manifold pressure
│   │       ├── Gi275FuelGauges.tsx           # Fuel quantity, flow
│   │       ├── Gi275ElectricalGauges.tsx     # Volts, amps
│   │       ├── Gi275TemperatureGauges.tsx    # CHT, EGT, oil temp
│   │       └── Gi275EisSettings.ts           # EIS mode settings
│   │
│   ├── Components/
│   │   ├── ModeSelector/
│   │   │   ├── Gi275ModeSelector.tsx         # Mode switching UI
│   │   │   ├── Gi275ModeButton.tsx           # Individual mode button
│   │   │   └── Gi275ModeIcon.tsx             # Mode icons
│   │   │
│   │   ├── TouchZones/
│   │   │   ├── Gi275CircularTouchZone.tsx    # Circular touch areas
│   │   │   ├── Gi275TouchGesture.tsx         # Gesture recognition
│   │   │   └── Gi275KnobHandler.tsx          # Concentric knob input
│   │   │
│   │   ├── Common/
│   │   │   ├── Gi275Frame.tsx                # Circular frame/bezel
│   │   │   ├── Gi275StatusBar.tsx            # Status indicators
│   │   │   └── Gi275AlertDisplay.tsx         # Alerts/warnings
│   │   │
│   │   └── Shared/                           # Reused from G3X Touch
│   │       ├── UiTouchButton.tsx             # Touch buttons
│   │       ├── UiToggleTouchButton.tsx       # Toggle buttons
│   │       └── NumberUnitDisplay.tsx         # Unit displays
│   │
│   ├── DataProviders/
│   │   ├── Gi275DataProvider.ts              # Main data aggregator
│   │   ├── Gi275NavDataProvider.ts           # Navigation data
│   │   ├── Gi275EngineDataProvider.ts        # Engine parameters
│   │   └── Gi275TerrainDataProvider.ts       # Terrain/obstacle data
│   │
│   ├── Systems/
│   │   ├── Gi275BackupBattery.ts             # Battery simulation
│   │   ├── Gi275Connectivity.ts              # Bluetooth/WiFi (future)
│   │   └── Gi275CrossfillSystem.ts           # Data sharing between units
│   │
│   ├── Settings/
│   │   ├── Gi275UserSettings.ts              # User preferences
│   │   ├── Gi275ModeSettings.ts              # Per-mode settings
│   │   └── Gi275DisplaySettings.ts           # Display brightness, etc.
│   │
│   ├── Config/
│   │   ├── Gi275Config.ts                    # Configuration interface
│   │   ├── Gi275ConfigBuilder.ts             # Config parsing
│   │   └── panel.xml                         # MSFS instrument definition
│   │
│   ├── Plugins/
│   │   ├── Gi275AiPlugin.ts                  # AI mode plugin
│   │   ├── Gi275HsiPlugin.ts                 # HSI mode plugin
│   │   ├── Gi275CdiPlugin.ts                 # CDI mode plugin
│   │   ├── Gi275MfdPlugin.ts                 # MFD mode plugin
│   │   └── Gi275EisPlugin.ts                 # EIS mode plugin
│   │
│   └── Assets/
│       ├── Icons/                            # Mode icons, symbols
│       ├── Textures/                         # Graphics assets
│       └── Fonts/                            # Display fonts
│
├── PackageDefinitions/
│   └── workingtitle-gi275/                   # MSFS package structure
│
└── PackageSources/
    └── manifest.json                         # Package manifest
```

## Core Architecture Patterns

### 1. Display Container Pattern

```typescript
// Gi275Display.tsx - Main display container
export class Gi275Display extends DisplayComponent<Gi275DisplayProps> implements GduDisplay {
  private static readonly DIAMETER = 400;  // Pixels (3.125 inches @ ~127 DPI)
  private static readonly RADIUS = 200;

  // Circular viewport dimensions
  private readonly viewportDimensions = Vec2Subject.create(
    Vec2Math.create(Gi275Display.DIAMETER, Gi275Display.DIAMETER)
  );

  // Current active mode
  private readonly activeMode = Subject.create<Gi275Mode>('AI');

  // Mode registry
  private readonly modeRegistry = new Map<Gi275Mode, MfdPageDefinition>();

  public render(): VNode {
    return (
      <div class="gi275-display" style="width: 400px; height: 400px;">
        {/* Circular clipping mask */}
        <svg class="gi275-viewport-mask">
          <defs>
            <clipPath id="gi275-circular-clip">
              <circle cx="200" cy="200" r="200" />
            </clipPath>
          </defs>
        </svg>

        {/* Active mode content */}
        <div
          class="gi275-mode-content"
          style="clip-path: url(#gi275-circular-clip);">
          {this.renderActiveMode()}
        </div>

        {/* Mode selector overlay */}
        <Gi275ModeSelector
          activeMode={this.activeMode}
          onModeSelected={this.handleModeChange.bind(this)}
        />

        {/* Status bar */}
        <Gi275StatusBar bus={this.props.bus} />
      </div>
    );
  }

  private renderActiveMode(): VNode {
    const modeDef = this.modeRegistry.get(this.activeMode.get());
    if (modeDef?.factory) {
      return modeDef.factory(this.props.uiService, new NodeReference<HTMLElement>());
    }
    return <div>No mode active</div>;
  }
}
```

### 2. Mode Registration Pattern

```typescript
// Gi275Plugin.ts - Plugin interface
export abstract class Gi275Plugin extends G3XTouchPlugin {
  /**
   * Register GI 275 display modes.
   */
  abstract registerGi275Modes?(
    registrar: Gi275ModeRegistrar,
    context: Readonly<Gi275ComponentContext>
  ): void;
}

// Gi275ModeRegistrar.ts - Mode registry
export class Gi275ModeRegistrar {
  private readonly modes = new Map<Gi275Mode, MfdPageDefinition>();

  public registerMode(mode: Gi275Mode, definition: MfdPageDefinition): void {
    if (this.modes.has(mode)) {
      console.warn(`GI 275 mode ${mode} is already registered. Overwriting.`);
    }
    this.modes.set(mode, definition);
  }

  public getModes(): ReadonlyMap<Gi275Mode, MfdPageDefinition> {
    return this.modes;
  }
}

// Gi275AiPlugin.ts - Example plugin implementation
export class Gi275AiPlugin extends Gi275Plugin {
  public registerGi275Modes(
    registrar: Gi275ModeRegistrar,
    context: Readonly<Gi275ComponentContext>
  ): void {
    registrar.registerMode('AI', {
      key: 'AI',
      label: 'Attitude Indicator',
      selectIconSrc: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GI275/Assets/Icons/ai.svg',
      selectLabel: 'AI',
      order: 0,
      factory: (uiService, containerRef) => (
        <Gi275AiMode
          bus={context.bus}
          uiService={uiService}
          navIndicators={context.navIndicators}
        />
      )
    });
  }
}
```

### 3. Circular Layout Pattern

```typescript
// Gi275CircularViewport.tsx - Circular viewport utilities
export class Gi275CircularLayout {
  /**
   * Calculate position on circular display perimeter
   * @param angle Angle in degrees (0 = top, 90 = right)
   * @param radius Distance from center (0-1, where 1 = edge)
   */
  public static polarToCartesian(
    angle: number,
    radius: number = 1,
    centerX: number = 200,
    centerY: number = 200,
    maxRadius: number = 200
  ): { x: number; y: number } {
    const angleRad = (angle - 90) * Math.PI / 180;
    return {
      x: centerX + (maxRadius * radius * Math.cos(angleRad)),
      y: centerY + (maxRadius * radius * Math.sin(angleRad))
    };
  }

  /**
   * Create SVG arc path for circular elements
   */
  public static createArcPath(
    startAngle: number,
    endAngle: number,
    radius: number,
    innerRadius?: number
  ): string {
    const start = this.polarToCartesian(startAngle, 1, 200, 200, radius);
    const end = this.polarToCartesian(endAngle, 1, 200, 200, radius);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    if (innerRadius !== undefined) {
      // Create arc with inner and outer radius (for rings)
      const innerStart = this.polarToCartesian(startAngle, 1, 200, 200, innerRadius);
      const innerEnd = this.polarToCartesian(endAngle, 1, 200, 200, innerRadius);

      return [
        `M ${start.x} ${start.y}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
        `L ${innerEnd.x} ${innerEnd.y}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
        'Z'
      ].join(' ');
    } else {
      // Simple arc
      return [
        `M ${start.x} ${start.y}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`
      ].join(' ');
    }
  }
}
```

### 4. Touch Zone Pattern

```typescript
// Gi275TouchZone.tsx - Circular touch zones
export interface Gi275TouchZoneProps extends ComponentProps {
  /** Start angle in degrees (0 = top) */
  startAngle: number;

  /** End angle in degrees */
  endAngle: number;

  /** Inner radius (0-1) */
  innerRadius?: number;

  /** Outer radius (0-1), default 1.0 */
  outerRadius?: number;

  /** Touch handler */
  onPressed?: () => void;

  /** Label to display */
  label?: string | Subscribable<string>;

  /** Icon to display */
  icon?: string;
}

export class Gi275TouchZone extends DisplayComponent<Gi275TouchZoneProps> {
  private readonly touchRef = FSComponent.createRef<HTMLDivElement>();

  public render(): VNode {
    const path = Gi275CircularLayout.createArcPath(
      this.props.startAngle,
      this.props.endAngle,
      (this.props.outerRadius ?? 1) * 200,
      (this.props.innerRadius ?? 0.8) * 200
    );

    return (
      <div ref={this.touchRef} class="gi275-touch-zone">
        <svg class="gi275-touch-zone-shape">
          <path
            d={path}
            class="gi275-touch-zone-path"
            onTouchStart={this.handleTouch.bind(this)}
            onClick={this.handleTouch.bind(this)}
          />
        </svg>

        {this.props.label && (
          <div class="gi275-touch-zone-label">
            {this.props.label}
          </div>
        )}

        {this.props.icon && (
          <img
            src={this.props.icon}
            class="gi275-touch-zone-icon"
          />
        )}
      </div>
    );
  }

  private handleTouch(): void {
    this.props.onPressed?.();
  }
}
```

### 5. Data Provider Pattern

```typescript
// Gi275DataProvider.ts - Main data aggregator
export interface Gi275ComponentContext {
  /** Event bus */
  bus: EventBus;

  /** Flight management system */
  fms: G3XFms;

  /** Navigation indicators */
  navIndicators: G3XNavIndicators;

  /** Radio data provider */
  radiosDataProvider: G3XRadiosDataProvider;

  /** UI service */
  uiService: UiService;

  /** AHRS system */
  ahrsSystem: AhrsSystem;

  /** ADC system */
  adcSystem: AdcSystem;

  /** Engine data provider (for EIS mode) */
  engineDataProvider?: Gi275EngineDataProvider;

  /** Terrain data provider (for MFD mode) */
  terrainDataProvider?: Gi275TerrainDataProvider;
}

export class Gi275DataProvider {
  // AHRS data (for AI and HSI modes)
  public readonly pitch = ConsumerSubject.create(
    this.bus.getSubscriber<AhrsEvents>().on('ahrs_pitch_deg_1'),
    0
  );

  public readonly roll = ConsumerSubject.create(
    this.bus.getSubscriber<AhrsEvents>().on('ahrs_roll_deg_1'),
    0
  );

  public readonly heading = ConsumerSubject.create(
    this.bus.getSubscriber<AhrsEvents>().on('ahrs_hdg_deg_1'),
    0
  );

  // ADC data (for AI mode)
  public readonly indicatedAirspeed = ConsumerSubject.create(
    this.bus.getSubscriber<AdcEvents>().on('indicated_alt'),
    0
  );

  public readonly altitude = ConsumerSubject.create(
    this.bus.getSubscriber<AdcEvents>().on('indicated_alt'),
    0
  );

  public readonly verticalSpeed = ConsumerSubject.create(
    this.bus.getSubscriber<AdcEvents>().on('vertical_speed'),
    0
  );

  // Navigation data (for HSI and CDI modes)
  public readonly selectedCourse = Subject.create(0);
  public readonly selectedHeading = Subject.create(0);

  constructor(private readonly bus: EventBus) {
    // Initialize data subscriptions
  }
}
```

## Mode Implementation Details

### AI Mode (Attitude Indicator)

**Components:**
- Central artificial horizon (pitch and roll)
- Airspeed tape (left side, compact)
- Altitude tape (right side, compact)
- Vertical speed indicator
- Slip/skid indicator

**Layout:**
```
┌─────────────────────┐
│    ╱────────╲       │  ← Circular display boundary
│   ╱   180°   ╲      │
│  │  ──────── │      │  ← Horizon line
│  │    Pitch   │     │
│AS│   Markings │ ALT │  ← AS=Airspeed, ALT=Altitude
│  │            │     │
│   ╲          ╱      │
│    ╲   V    ╱       │  ← V=VSI indicator
│     ╲──────╱        │
└─────────────────────┘
```

**Data Flow:**
```
AHRS System → EventBus → ConsumerSubject → HorizonDisplay
ADC System  → EventBus → ConsumerSubject → Airspeed/Altitude Tapes
```

### HSI Mode (Horizontal Situation Indicator)

**Components:**
- Rotating compass rose
- Heading bug
- Course needle
- Bearing pointer 1 (ADF/VOR)
- Bearing pointer 2 (VOR)
- To/From indicator
- DME display

**Layout:**
```
┌─────────────────────┐
│        360°         │
│    ╱───╱───╲───╲    │
│   │  N  ▲  N  │   │  ← Compass rose, heading bug
│  270  │ H │  90  │  ← Course needle
│   │  W  ▼  E  │   │  ← Bearing pointers
│    ╲───╲───╱───╱    │
│        180°         │
│      DME: 12.5      │  ← Distance display
└─────────────────────┘
```

**Data Flow:**
```
AhrsSystem → Heading → Compass Rose Rotation
NavIndicators → Course/Bearing → Needles
FMS → Active Waypoint → DME Distance
```

### CDI Mode (Course Deviation Indicator)

**Components:**
- CDI needle (lateral deviation)
- Course selector
- To/From indicator
- Navigation source indicator (GPS/VOR/LOC)
- Distance to waypoint
- Desired track

**Layout:**
```
┌─────────────────────┐
│      GPS ▼          │  ← Nav source
│     CRS: 180°       │  ← Selected course
│   ╱───┼───┼───╲     │
│  │  ◄ │ │ │ ►  │   │  ← CDI scale
│  │    ╎ │ ╎    │   │  ← Deviation needle
│  │  TO│ │ │    │   │  ← To/From flag
│   ╲───┼───┼───╱     │
│   DTW: 25.3 NM      │  ← Distance to waypoint
└─────────────────────┘
```

**Data Flow:**
```
NavIndicatorController → Active Source → Source Display
NavdataComputer → Lateral Deviation → CDI Needle
FMS → Active Leg → Course/Distance
```

### MFD Mode (Multi-Function Display)

**Components:**
- Moving map display
- Terrain overlay (yellow/red)
- Obstacle database
- SafeTaxi airport diagram
- Traffic display (optional)
- Weather overlay (future)

**Layout:**
```
┌─────────────────────┐
│     ┌─RWY 27─┐      │
│    ╱ ▓▓▓█▓▓▓ ╲      │  ← Terrain colors
│   │ ┌────────┐ │    │    Green = low
│   │ │ ✈      │ │    │    Yellow = caution
│   │ │   APT  │ │    │    Red = warning
│   │ └────────┘ │    │
│    ╲          ╱      │
│     ╲────────╱       │
│    Range: 5 NM      │
└─────────────────────┘
```

**Data Flow:**
```
GPS → Aircraft Position → Map Center
TerrainDataProvider → Elevation → Color Overlay
FacilityLoader → Airports/Navaids → Map Symbols
```

### EIS Mode (Engine Indication System)

**Components:**
- RPM gauge
- Manifold pressure
- Fuel quantity (left/right)
- Fuel flow
- Oil pressure/temperature
- Cylinder head temperature
- Exhaust gas temperature
- Electrical (volts/amps)

**Layout (6-cylinder engine example):**
```
┌─────────────────────┐
│   RPM      MP       │
│  2400    25.5"      │
│                     │
│  FUEL    FLOW       │
│  25.5G   12.5 GPH   │
│                     │
│  OIL  CHT  EGT      │
│  85°C 380°C 750°C   │
│                     │
│  VOLTS   AMPS       │
│   28.5    35        │
└─────────────────────┘
```

**Data Flow:**
```
EngineSimVarPublisher → EventBus → EngineEvents
Gi275EngineDataProvider → Gauge Components
UserSettings → Units (°C/°F, US gal/Liters)
```

## Configuration System

### Instrument Configuration

```typescript
// Gi275Config.ts
export interface Gi275Config {
  /** Display format identifier */
  format: 'GI275';

  /** Default mode on power-up */
  defaultMode: Gi275Mode;

  /** Enabled modes */
  enabledModes: Gi275Mode[];

  /** Touch screen enabled */
  touchEnabled: boolean;

  /** Concentric knob enabled */
  knobEnabled: boolean;

  /** Backup battery installed */
  backupBattery: boolean;

  /** Terrain awareness enabled */
  terrainEnabled: boolean;

  /** SafeTaxi database enabled */
  safeTaxiEnabled: boolean;

  /** Traffic display enabled (requires transponder) */
  trafficEnabled: boolean;

  /** AHRS system index (1 or 2) */
  ahrsIndex: 1 | 2;

  /** ADC system index (1 or 2) */
  adcIndex: 1 | 2;

  /** Engine index for EIS mode (1-4) */
  engineIndex?: 1 | 2 | 3 | 4;

  /** Display brightness (0-100) */
  brightness: number;
}
```

### panel.xml Configuration

```xml
<PlaneHTMLConfig>
  <Name>GI275</Name>
  <HostedInstrument>
    <Name>GI275_1</Name>
    <Electric>CIRCUIT AVIONICS ON</Electric>
    <URL>
      <![CDATA[
        coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GI275/GI275.html?Index=1
      ]]>
    </URL>
  </HostedInstrument>
</PlaneHTMLConfig>
```

### instrument.xml Configuration

```xml
<Instrument>
  <Name>GI275</Name>
  <ConfigPath>Config/GI275Config.json</ConfigPath>

  <Settings>
    <Format>GI275</Format>
    <DefaultMode>AI</DefaultMode>
    <EnabledModes>
      <Mode>AI</Mode>
      <Mode>HSI</Mode>
      <Mode>CDI</Mode>
      <Mode>MFD</Mode>
      <Mode>EIS</Mode>
    </EnabledModes>
    <TouchEnabled>true</TouchEnabled>
    <KnobEnabled>true</KnobEnabled>
    <BackupBattery>true</BackupBattery>
    <TerrainEnabled>true</TerrainEnabled>
    <SafeTaxiEnabled>true</SafeTaxiEnabled>
    <TrafficEnabled>false</TrafficEnabled>
    <AhrsIndex>1</AhrsIndex>
    <AdcIndex>1</AdcIndex>
    <EngineIndex>1</EngineIndex>
    <Brightness>80</Brightness>
  </Settings>
</Instrument>
```

## User Settings

```typescript
// Gi275UserSettings.ts
export type Gi275UserSettingTypes = {
  /** Last selected mode */
  gi275LastMode: Gi275Mode;

  /** Display brightness (0-100) */
  gi275Brightness: number;

  /** Auto-brightness enabled */
  gi275AutoBrightness: boolean;

  /** Selected heading bug */
  gi275SelectedHeading: number;

  /** Selected course */
  gi275SelectedCourse: number;

  /** Barometric pressure setting (inHg * 16) */
  gi275BaroSetting: number;

  /** Map range (NM) */
  gi275MapRange: number;

  /** Map orientation (heading up, track up, north up) */
  gi275MapOrientation: 'HDG' | 'TRK' | 'NORTH';

  /** Terrain display enabled */
  gi275TerrainEnabled: boolean;

  /** Traffic display enabled */
  gi275TrafficEnabled: boolean;
};

export class Gi275UserSettings {
  private static readonly settings = new Map<string, UserSettingDefinition<any>>();

  public static getManager(bus: EventBus): UserSettingManager<Gi275UserSettingTypes> {
    return new DefaultUserSettingManager(bus, Gi275UserSettings.getSettingDefs());
  }

  private static getSettingDefs(): UserSettingDefinition<Gi275UserSettingTypes[keyof Gi275UserSettingTypes]>[] {
    return [
      {
        name: 'gi275LastMode',
        defaultValue: 'AI' as Gi275Mode
      },
      {
        name: 'gi275Brightness',
        defaultValue: 80
      },
      // ... additional settings
    ];
  }
}
```

## Development Workflow

### Phase 1: Project Setup
1. Create project structure based on G3X Touch
2. Set up build configuration (rollup, TypeScript)
3. Create basic HTML instrument shell
4. Implement Gi275Display container with circular viewport

### Phase 2: Mode Framework
1. Implement mode registration system
2. Create mode selector UI
3. Add touch zone infrastructure
4. Implement mode switching logic

### Phase 3: AI Mode (First Mode)
1. Adapt G3X Touch HorizonDisplay for circular layout
2. Create compact airspeed tape
3. Create compact altitude tape
4. Integrate AHRS and ADC data
5. Test in simulator

### Phase 4: Navigation Modes
1. Implement HSI mode with compass rose
2. Implement CDI mode with deviation needle
3. Integrate navigation data providers
4. Add heading/course bug controls

### Phase 5: Advanced Modes
1. Implement MFD mode with map
2. Add terrain overlay
3. Add SafeTaxi support
4. Implement EIS mode
5. Add engine parameter displays

### Phase 6: Polish
1. Optimize rendering performance
2. Add animations and transitions
3. Implement settings persistence
4. Add backup battery simulation
5. Documentation and testing

## Testing Strategy

### Unit Tests
- Mode registration and switching
- Data provider subscriptions
- Touch zone hit detection
- Circular layout calculations
- Settings persistence

### Integration Tests
- EventBus data flow (AHRS → Display)
- FMS integration (flight plan → CDI)
- Navigation source switching
- Mode transitions

### Simulator Tests
- Visual accuracy (compare with real GI 275)
- Performance (60 FPS minimum)
- Multi-unit installation (data crossfill)
- Failure scenarios (AHRS fail, GPS fail, etc.)

## Performance Considerations

### Rendering Optimization
- Use CSS transforms for rotations (hardware accelerated)
- Minimize SVG complexity (path simplification)
- Batch DOM updates using requestAnimationFrame
- Implement render throttling for background modes

### Data Flow Optimization
- Use ConsumerSubject for EventBus subscriptions
- Implement data decimation for high-frequency updates
- Lazy-load terrain/map data
- Cache calculated values (MappedSubject)

### Memory Management
- Unsubscribe from events when mode is inactive
- Dispose of temporary resources
- Limit map tile cache size
- Clean up SVG elements

## Future Enhancements

### Phase 2 Features
- Bluetooth/WiFi connectivity (Garmin Pilot sync)
- Weather overlay (NEXRAD, METARs)
- Enhanced traffic (TIS-B/ADS-B)
- Synthetic vision (SVT)
- Multi-unit crossfill
- Custom checklists

### Advanced Features
- Chart overlay (approach plates)
- Flight logging
- Engine trend monitoring
- Custom alerts/warnings
- Remote display (tablet/phone)

## References

### Source Material
- Garmin GI 275 Pilot's Guide
- G3X Touch Pilot's Guide
- MSFS SDK Documentation
- Working Title G3X Touch source code

### Internal Documentation
- `docs/garmin-sdk-overview.md` - SDK fundamentals
- `docs/gi-275-architecture-recommendation.md` - Architecture analysis
- G3X Touch implementation: `src/workingtitle-instruments-g3x-touch/`

### External Resources
- Garmin Product Page: https://www.garmin.com/en-US/p/719027/
- MSFS SDK: https://docs.flightsimulator.com/
- TypeScript Documentation: https://www.typescriptlang.org/docs/

---

**Document Version:** 1.0
**Last Updated:** 2025-11-14
**Author:** Architecture Team
**Status:** Initial Draft
