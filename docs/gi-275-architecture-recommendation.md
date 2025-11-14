# GI 275 Architecture Recommendation

## Overview

This document provides the architectural recommendation for implementing the Garmin GI 275 electronic flight instrument based on analysis of the existing MSFS Avionics codebase.

## GI 275 Characteristics

The Garmin GI 275 is a compact, multi-mode electronic flight instrument with:

- **3.125-inch circular display** (compact, round form factor)
- **Multi-mode operation**: Can switch between AI, HSI, CDI, MFD, EIS modes
- **Touchscreen-first interface** with optional concentric knob
- **Standalone operation** (can function independently)
- **Modern features**: Terrain, SafeTaxi, Bluetooth/WiFi connectivity
- **Modular installation**: Direct replacement for various 3.125-inch instruments

## Recommendation: G3X Touch Architecture

After comprehensive analysis of existing architectures (G1000, G3000, G3X Touch, WT21, Epic2), the **G3X Touch architecture** is the clear winner for implementing the GI 275.

### Why G3X Touch is the Perfect Fit

#### 1. Extensible Display System

The G3X Touch already supports multiple GDU formats:

```typescript
// src/workingtitle-instruments-g3x-touch/html_ui/Shared/CommonTypes.ts
export type GduFormat = '460' | '470';
```

- Easy to extend to include `'GI275'`
- Each format has its own display implementation class
- Container-based layout system allows responsive sizing

#### 2. Built-in Multi-Mode Architecture

```typescript
// G3X Touch uses a page/mode registration system
export interface G3XTouchPlugin {
  registerMfdMainPages?(registrar: MfdMainPageRegistrar): void;
  registerPfdPages?(registrar: PfdPageRegistrar): void;
  registerPfdInsets?(registrar: PfdInsetRegistrar): void;
}
```

**For GI 275 Implementation:**
- Each mode (AI, HSI, CDI, MFD, EIS) registers as a page
- Mode switching is built into the architecture
- Clean lifecycle management (onOpen, onClose, onResume, onPause, onResize, onUpdate)

**Page Definition Pattern:**
```typescript
export type MfdPageDefinition = {
  key: string;              // e.g., 'AI', 'HSI', 'CDI'
  label: string;            // Display label
  selectIconSrc: string;    // Icon for mode selection
  selectLabel: string;      // Short label
  order: number;            // Display order
  factory?: MfdPageFactory; // Component factory
};
```

#### 3. Touchscreen-First Design

Complete touch infrastructure already implemented:

- **Touch Button Components** (`html_ui/Shared/Components/TouchButton/`)
  - `UiTouchButton.tsx`
  - `UiToggleTouchButton.tsx`
  - `UiImgTouchButton.tsx`

- **TouchPad Component** - Handles drag-pan, touch interactions
- **UI Interaction System** - Unified event handling for touch and rotary knobs

This matches the GI 275's touchscreen-first design with optional concentric knob.

#### 4. Highly Modular Plugin System

```typescript
export interface PfdInstrumentsPluginComponent extends DisplayComponent<any> {
  readonly isPfdInstrumentsPluginComponent: true;
  onOpen(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void;
  onClose(): void;
  onResume(): void;
  onPause(): void;
  onResize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void;
  onOcclusionChange(occlusionType: UiViewOcclusionType): void;
  onUpdate(time: number): void;
}
```

- Components are highly decoupled and reusable
- Each mode can operate independently
- Clean data provider injection pattern
- Perfect for GI 275's standalone operation

#### 5. Component Reusability

Existing G3X Touch components can be adapted for GI 275 modes:

| GI 275 Mode | Reusable G3X Touch Components |
|-------------|-------------------------------|
| **AI** (Attitude Indicator) | HorizonDisplay, AirspeedIndicator, AltitudeIndicator, VSI |
| **HSI** (Horizontal Situation) | HSI component, bearing pointer, course indicator |
| **CDI** (Course Deviation) | CDI needle, course selector, navigation source display |
| **MFD** (Multi-Function) | Map components, terrain, SafeTaxi, weather |
| **EIS** (Engine Indication) | Engine gauges, fuel, electrical, temperatures |

#### 6. Circular Display Support

While G3X Touch uses rectangular displays, the architecture supports circular adaptation:

- **CSS-Driven Layout** - Display-specific CSS classes (`.gdu-460-display`, etc.)
- **Component-Based Rendering** - Individual components can be sized/styled for circular displays
- **UI View Size Mode System** - Components receive `sizeMode` and `dimensions` for responsive resizing

```typescript
// Easy to add circular display support
export class Gi275Display extends DisplayComponent<GduDisplayProps> implements GduDisplay {
  private static readonly DIAMETER = 400; // 3.125-inch display
  private static readonly RADIUS = 200;

  // Apply circular clipping and layout
}
```

## Architecture Comparison

| Aspect | G3X Touch | G3000 | Epic2 |
|--------|-----------|-------|-------|
| **Multi-size Display Support** | ✓ Extensible format system | Separate PFD/MFD instruments | ✗ No clear pattern |
| **Circular Display Ready** | ✓ Can extend GduDisplay | ✗ Not designed for it | ✗ Not designed for it |
| **Plugin Modularity** | ✓ Excellent (page registrars) | ○ Good but complex | ○ Component-based |
| **Touchscreen-First** | ✓ Native support | ○ Touch + rotary knob | ✓ Touch components exist |
| **Mode Switching** | ✓ Page/mode system built-in | ✗ Separate instruments | ✓ Can work but less clean |
| **Compact Display Design** | ✓ Best fit | ✗ Not designed | ✗ Not designed |
| **Component Reusability** | ✓ Highly decoupled | ○ Shared library approach | ✓ Good sharing |
| **Data Provider Injection** | ✓ Clean plugin binder pattern | ○ More coupling | ✓ Works but complex |

**Verdict: G3X Touch is the clear winner for a compact, multi-mode, touchscreen-first instrument like the GI 275.**

## Implementation Strategy

### Phase 1: Create GI 275 Display Framework

1. **Create `Gi275Display.tsx`** extending `GduDisplay` interface
   - Location: `html_ui/GduDisplay/Gi275/`
   - Implement circular viewport (400px diameter)
   - Handle touch input and rotary knob

2. **Update `CommonTypes.ts`**
   ```typescript
   export type GduFormat = '460' | '470' | 'GI275';
   export type Gi275Mode = 'AI' | 'HSI' | 'CDI' | 'MFD' | 'EIS';
   ```

3. **Implement Mode System**
   - Leverage existing `MfdMainPageRegistrar` pattern
   - Register AI, HSI, CDI, MFD, EIS as pages/modes
   - Add mode selector UI with circular touch zones

### Phase 2: Mode-Specific Components

Create dedicated components for each mode:

```
html_ui/GduDisplay/Gi275/
├── Gi275Display.tsx              # Main display container
├── Modes/
│   ├── Gi275AiMode/              # Attitude Indicator
│   │   ├── Gi275AiMode.tsx
│   │   ├── Gi275HorizonDisplay.tsx
│   │   ├── Gi275AirspeedTape.tsx
│   │   └── Gi275AltitudeTape.tsx
│   ├── Gi275HsiMode/             # Horizontal Situation Indicator
│   │   ├── Gi275HsiMode.tsx
│   │   ├── Gi275CompassRose.tsx
│   │   └── Gi275BearingPointer.tsx
│   ├── Gi275CdiMode/             # Course Deviation Indicator
│   │   ├── Gi275CdiMode.tsx
│   │   ├── Gi275CdiNeedle.tsx
│   │   └── Gi275CourseSelector.tsx
│   ├── Gi275MfdMode/             # Multi-Function Display
│   │   ├── Gi275MfdMode.tsx
│   │   ├── Gi275Map.tsx
│   │   └── Gi275TerrainOverlay.tsx
│   └── Gi275EisMode/             # Engine Indication System
│       ├── Gi275EisMode.tsx
│       ├── Gi275EngineGauges.tsx
│       └── Gi275FuelElectrical.tsx
└── Components/
    ├── Gi275ModeSelector.tsx     # Mode switching UI
    ├── Gi275TouchZone.tsx        # Circular touch zones
    └── Gi275CircularFrame.tsx    # Circular display frame
```

### Phase 3: Touch Interface Layer

1. **Mode Selection UI**
   - Circular touch zones around display perimeter
   - Icon-based mode indicators
   - Touch or knob-based selection

2. **Mode-Specific Touch Handlers**
   - AI Mode: Altitude/airspeed bugs
   - HSI Mode: Heading bug, course selector
   - CDI Mode: Course adjustment
   - MFD Mode: Map pan/zoom
   - EIS Mode: Engine parameter selection

3. **Integration with UiInteraction System**
   - Leverage existing touch/knob event handling
   - Consistent interaction patterns across modes

### Phase 4: Data Integration

Use existing G3X Touch data providers:

- **Flight Data**: `G3XFms`, `G3XNavIndicators`, `G3XRadiosDataProvider`
- **AHRS Data**: AhrsSystem (pitch, roll, heading)
- **ADC Data**: AdcSystem (airspeed, altitude, vertical speed)
- **Navigation**: NavdataComputer, NavIndicatorController
- **Engine Data**: EngineDataProvider (for EIS mode)
- **Terrain/Maps**: G3XNavMapBuilder, terrain rendering
- **SafeTaxi**: Existing map module support

### Phase 5: Configuration System

1. **Instrument Configuration**
   ```typescript
   export interface Gi275Config {
     format: 'GI275';
     defaultMode: Gi275Mode;
     enabledModes: Gi275Mode[];
     touchEnabled: boolean;
     knobEnabled: boolean;
     backupBattery: boolean;
     terrainEnabled: boolean;
     safeTaxiEnabled: boolean;
   }
   ```

2. **Settings Persistence**
   - Use UserSettingManager pattern
   - Save selected mode, user preferences
   - Synchronize via Bluetooth/WiFi (future)

## Key Files to Study

### Core Architecture
- **Display Framework**: `src/workingtitle-instruments-g3x-touch/html_ui/GduDisplay/GduDisplay.ts`
- **Plugin System**: `src/workingtitle-instruments-g3x-touch/html_ui/Shared/G3XTouchPlugin.ts`
- **UI Service**: `src/workingtitle-instruments-g3x-touch/html_ui/Shared/UiSystem/UiService.ts` (1280 lines)
- **Page System**: `src/workingtitle-instruments-g3x-touch/html_ui/MFD/PageNavigation/MfdPageDefinition.ts`

### Component Examples
- **Horizon Display**: `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HorizonDisplay/`
- **HSI**: `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HSI/`
- **Map**: `src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/Map/`
- **Touch Controls**: `src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/TouchButton/`

### Configuration
- **Instrument Config**: `src/workingtitle-instruments-g3x-touch/html_ui/Shared/InstrumentConfig/InstrumentConfig.ts`
- **Common Types**: `src/workingtitle-instruments-g3x-touch/html_ui/Shared/CommonTypes.ts`

### Data Providers
- **FMS**: `src/garminsdk/flightplan/Fms.ts`
- **Navigation Indicators**: `src/workingtitle-instruments-g3x-touch/html_ui/Shared/NavIndicators/G3XNavIndicators.ts`
- **Radios**: `src/workingtitle-instruments-g3x-touch/html_ui/Shared/DataProviders/G3XRadiosDataProvider.ts`

## Development Roadmap

### Milestone 1: Foundation (Week 1-2)
- [ ] Set up GI 275 project structure
- [ ] Create Gi275Display base class
- [ ] Implement circular viewport rendering
- [ ] Add mode registration system
- [ ] Basic touch input handling

### Milestone 2: First Mode - AI (Week 3-4)
- [ ] Implement Attitude Indicator mode
- [ ] Adapt HorizonDisplay for circular layout
- [ ] Add airspeed and altitude tapes
- [ ] Integrate AHRS and ADC data
- [ ] Test in simulator

### Milestone 3: Navigation Modes (Week 5-7)
- [ ] Implement HSI mode
- [ ] Implement CDI mode
- [ ] Integrate navigation data providers
- [ ] Add course/heading bug controls
- [ ] Test with various navigation sources

### Milestone 4: Advanced Modes (Week 8-10)
- [ ] Implement MFD mode with map
- [ ] Add terrain and SafeTaxi
- [ ] Implement EIS mode
- [ ] Engine parameter displays
- [ ] Multi-mode testing

### Milestone 5: Polish & Features (Week 11-12)
- [ ] Mode selector UI refinement
- [ ] Touch gesture optimization
- [ ] Settings persistence
- [ ] Backup battery simulation
- [ ] Documentation and user guide

## Technical Patterns to Follow

### 1. EventBus Architecture
```typescript
const bus = new EventBus();
const subscriber = bus.getSubscriber<AhrsEvents>();
subscriber.on('ahrs_pitch_deg_1').handle(pitch => {
  this.pitchSubject.set(pitch);
});
```

### 2. Subscribable/Reactive Pattern
```typescript
const rotation = MappedSubject.create(
  ([selectedHeading, magneticHeading]) => selectedHeading - magneticHeading,
  this.selectedHeading,
  this.magneticHeading
);
```

### 3. Plugin Registration
```typescript
export class Gi275AiPlugin extends G3XTouchPlugin {
  registerMfdMainPages(registrar: MfdMainPageRegistrar): void {
    registrar.registerPage({
      key: 'AI',
      label: 'Attitude Indicator',
      selectIconSrc: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GI275/Assets/ai-icon.svg',
      selectLabel: 'AI',
      order: 0,
      factory: (uiService, containerRef) => <Gi275AiMode {...this.props} />
    });
  }
}
```

### 4. Data Provider Injection
```typescript
export interface Gi275ComponentContext {
  bus: EventBus;
  fms: G3XFms;
  navIndicators: G3XNavIndicators;
  radiosDataProvider: G3XRadiosDataProvider;
  uiService: UiService;
}
```

## Conclusion

The G3X Touch architecture provides the ideal foundation for implementing the GI 275 due to its:

- **Extensible display system** that easily accommodates new formats
- **Built-in multi-mode architecture** perfect for GI 275's mode switching
- **Touchscreen-first design** matching the GI 275's interface
- **Highly modular components** that can be reused and adapted
- **Clean data provider pattern** for standalone operation
- **Proven codebase** with extensive flight-tested components

By following the G3X Touch architectural patterns and reusing its components, the GI 275 implementation will benefit from a solid foundation, reduced development time, and consistency with existing Garmin instrument implementations.

## References

- [Garmin GI 275 Product Page](https://www.garmin.com/en-US/p/719027/)
- G3X Touch Implementation: `src/workingtitle-instruments-g3x-touch/`
- Garmin SDK Documentation: `docs/garmin-sdk-overview.md`
- Attitude Indicator Guide: `docs/attitude-indicator-implementation-guide.md`
- Heading Bug Guide: `docs/heading-bug-implementation-guide.md`
