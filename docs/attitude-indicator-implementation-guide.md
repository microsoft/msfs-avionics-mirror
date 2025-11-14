# Complete Guide: Attitude Indicator Implementation in Garmin Instruments

A comprehensive walkthrough of attitude indicator (artificial horizon) implementations across all Garmin instruments, from raw simulator data to pixels on screen.

---

## 📊 Overview: The Complete Data Flow

```
Simulator (SimVars)
    ↓
AHRS Publisher (converts SimVars to events)
    ↓
EventBus (central communication hub)
    ↓
AHRS System (adds validation & state management)
    ↓
Attitude Components (consume & render)
    ↓
Display (Canvas/SVG rendering)
```

---

## 1. 🎯 AHRS Data Source Foundation

### Base AHRS Publisher (SDK)

**Location:** `src/sdk/instruments/Ahrs.ts`

This is where simulator data becomes usable events:

```typescript
// Key SimVars that feed attitude indicators
ATTITUDE INDICATOR PITCH DEGREES:#index#  → pitch_deg
ATTITUDE INDICATOR BANK DEGREES:#index#   → roll_deg
PLANE PITCH DEGREES                       → actual_pitch_deg
PLANE BANK DEGREES                        → actual_roll_deg

// Published to EventBus
interface BaseAhrsEvents {
  pitch_deg: number;        // ±90° (negative = pitch up)
  roll_deg: number;         // ±180° (negative = roll right)
  hdg_deg: number;          // Magnetic heading
  turn_coordinator_ball: number;  // Slip/skid ball
}
```

**Data Sources** (SimVars):
- `ATTITUDE INDICATOR PITCH DEGREES:#index#` → `pitch_deg`
- `ATTITUDE INDICATOR BANK DEGREES:#index#` → `roll_deg`
- `HEADING INDICATOR:#index#` → `hdg_deg` and `hdg_deg_true`
- `DELTA HEADING RATE:#index#` → `delta_heading_rate`
- `PLANE PITCH DEGREES` → `actual_pitch_deg`
- `PLANE BANK DEGREES` → `actual_roll_deg`

### Garmin AHRS System (Enhanced)

**Location:** `src/garminsdk/system/AhrsSystem.ts`

Adds intelligence and validation:

```typescript
// Enhanced events with system state
ahrs_pitch_deg_1                    // Pitch from AHRS #1
ahrs_roll_deg_1                     // Roll from AHRS #1
ahrs_state_1                        // System state (Off/Init/On/Failed)
ahrs_attitude_data_valid_1          // Is attitude data good?
ahrs_heading_data_valid_1           // Is heading data good?

// Key behaviors:
- 45-second initialization time after power-on
- Early init if roll exceeds ±20° (aircraft moving)
- Heading requires magnetometer to be ON
- Validates data before marking as valid
```

**Published Topics (indexed):**

```typescript
ahrs_pitch_deg_${index}         // Pitch from attitude indicator
ahrs_roll_deg_${index}          // Roll from attitude indicator
ahrs_hdg_deg_${index}           // Magnetic heading
ahrs_hdg_deg_true_${index}      // True heading
ahrs_delta_heading_rate_${index} // Turn rate
ahrs_turn_coordinator_ball_${index} // Turn coordinator

// System state topics
ahrs_state_${index}             // AvionicsSystemState (Off/Initializing/On/Failed)
ahrs_attitude_data_valid_${index}   // Boolean validity flag
ahrs_heading_data_valid_${index}    // Boolean validity flag
```

**Key Features:**
- **45-second initialization time** after power-on
- **Early initialization** if roll exceeds ±20° during startup
- **Magnetometer dependency** for heading data validation
- **Power state tracking** from electrical system

### AHRS System Selector

**Location:** `src/garminsdk/system/AhrsSystemSelector.ts`

Automatically selects the best AHRS from multiple candidates:
- Prioritizes systems with valid attitude AND heading data
- Supports configurable system priorities
- Custom desirability comparators
- Publishes selected index and data validity states

---

## 2. 🛩️ G1000 NXi Implementation

### Simple SVG-Based Approach

**Location:** `src/workingtitle-instruments-g1000/html_ui/PFD/Components/FlightInstruments/AttitudeIndicator.tsx`

The G1000 uses a straightforward **SVG + CSS transform** approach:

### Architecture:

```typescript
<div class="attitude-indicator">
  {/* Outer container rotates for ROLL */}
  <div ref={bankElement} style={transform: rotate(roll)}>

    {/* Inner container translates for PITCH */}
    <div ref={pitchLinesContainer} style={transform: translate3d(0, pitch*pxPerDeg, 0)}>

      {/* SVG pitch ladder */}
      <svg>
        <g ref={pitchLinesGroup}>
          {/* Lines at -80, -70, -60, ... 0 ... +60, +70, +80 */}
          <line x1="..." y1="..." x2="..." y2="..." />
          <text>10</text>
          <text>20</text>
          {/* ... */}
        </g>
      </svg>

    </div>
  </div>

  {/* Turn coordinator (slip/skid ball) */}
  <svg ref={turnCoordinatorElement}>
    <circle cx="..." cy="..." /> {/* Ball translates left/right */}
  </svg>
</div>
```

### Data Consumption:

```typescript
// Subscribe to AHRS events
const ahrs = bus.getSubscriber<AhrsEvents>();

ahrs.on('turn_coordinator_ball')
  .withPrecision(2)  // Only update on 0.01 change
  .handle(ball => {
    // Translate ball left/right
    ballElement.style.transform = `translate3d(${ball * scale}px, 0, 0)`;
  });

// System state subscription
const ahrsSystem = bus.getSubscriber<AHRSSystemEvents>();
ahrsSystem.on('ahrs_state').handle(state => {
  if (state === AvionicsSystemState.On) {
    // Show attitude data
  } else if (state === AvionicsSystemState.Init) {
    // Show "AHRS ALIGN: Keep Wings Level"
  } else {
    // Show failed flag
  }
});
```

### Update Method:

```typescript
update(planeState: PlaneStateInfo): void {
  const pitch = planeState.pitch;  // In degrees
  const roll = planeState.roll;    // In degrees

  // Translate pitch ladder
  const pitchPixels = pitch * this.pxPerDegY;
  this.pitchLinesContainer.style.transform =
    `translate3d(0px, ${pitchPixels}px, 0px)`;

  // Rotate bank indicator
  this.bankElement.style.transform =
    `rotate(${roll}deg)`;
}
```

### Pitch Ladder Construction:

```typescript
// Lines every 2.5° with different styles
Major lines (every 10°): Full width 108px
Medium lines (every 5°): Half width 54px
Minor lines (every 2.5°): Small width 28px

// Numbers shown every 10°
// Built dynamically on initialization

// Pitch Configuration
- scroll_increment: 10 degrees between major scroll sections
- pitchIncrements: 2.5 degrees between marked lines
- numberIncrements: 4 (show numbers every 4th line)
- pxPerDegY: Calculated from SVT projection (varies based on FOV)

// Pitch Line Types (built dynamically)
- Major: Full width (108px) every 10°
- Medium: Half width (54px) every 5°
- Minor: Small width (28px) every 2.5°
```

### Display States:

- `'ok'`: Normal operation with attitude data
- `'align'`: AHRS initializing (shows "AHRS ALIGN: Keep Wings Level")
- `'failed'`: System off or failed (shows failed flag)

### Rendering Techniques:

- **Pitch motion**: `translate3d(0px, ${pitch * pxPerDegY}px, 0px)`
- **Roll motion**: `rotate(${roll}deg)` on outer bank element
- **Turn coordinator**: `translate3d(${translation}px, 0px, 0px)` for ball position
- **SVT mode switching**: Changes pitch ratio and rebuild ladder based on SVT toggle

### Primary Horizon Display (G1000)

**File:** `src/workingtitle-instruments-g1000/html_ui/PFD/Components/FlightInstruments/PrimaryHorizonDisplay.tsx`

Orchestrates attitude data collection and updates:

```typescript
// Subscribes to pitch and roll
sub.on('pitch_deg').withPrecision(2).handle(pitchHandler);
sub.on('roll_deg').withPrecision(3).handle(rollHandler);

// Calls AttitudeIndicator.update() with PlaneStateInfo object
planeState: {
  pitch: number;
  roll: number;
}
```

### G1000 AHRS System

**File:** `src/workingtitle-instruments-g1000/html_ui/Shared/Systems/AHRSSystem.ts`

Simpler than next-gen, directly manages state:
- Watches `roll_deg` for initialization trigger (≥20°)
- Waits for magnetometer state `On`
- Depends on electrical power (`elec_av1_bus`)
- 45-second initialization timeout

**Files to Study:**
- `src/workingtitle-instruments-g1000/html_ui/PFD/Components/FlightInstruments/AttitudeIndicator.tsx`
- `src/workingtitle-instruments-g1000/html_ui/PFD/Components/FlightInstruments/PrimaryHorizonDisplay.tsx`
- `src/workingtitle-instruments-g1000/html_ui/Shared/Systems/AHRSSystem.ts`

---

## 3. 🎨 G3000/G5000 Implementation

### Advanced Projection-Based Canvas Rendering

**Location:** `src/garminsdk/components/nextgenpfd/horizon/HorizonDisplay.tsx` (1133 lines!)

This is the **most sophisticated** implementation with full 3D projection.

### Core Architecture: HorizonProjection

**File:** `src/sdk/components/horizon/HorizonProjection.ts`

```typescript
// Converts 3D world space → 2D screen space
class HorizonProjection {
  // Input parameters
  set(params: {
    pitch?: number;           // Aircraft pitch
    roll?: number;            // Aircraft roll
    heading?: number;         // True heading
    fov?: number;             // Field of view (default 55°, Bing 50°)
    projectedSize?: [w, h];   // Screen dimensions
  });

  // Output methods
  getPitch(): number;
  getRoll(): number;
  getScaleFactor(): number;   // Pixels per degree

  // Subscribe to changes
  onChange(handler: (projection, changes) => void);
}
```

**Projection Parameters:**

```typescript
type HorizonProjectionParameters = {
  position?: LatLonInterface;              // Aircraft position (unused in attitude display)
  altitude?: number;                       // Aircraft altitude
  heading?: number;                        // True heading
  pitch?: number;                          // Pitch angle
  roll?: number;                           // Roll angle
  offset?: ReadonlyFloat64Array;           // Camera offset [x, y, z]
  projectedSize?: ReadonlyFloat64Array;    // Screen size [width, height]
  fov?: number;                            // Field of view (degrees)
  fovEndpoints?: ReadonlyFloat64Array;     // [x1, y1, x2, y2] for FOV measurement
  pitchScaleFactor?: number;               // Pitch distortion correction (1.0 = none)
  headingScaleFactor?: number;             // Heading distortion correction
  projectedOffset?: ReadonlyFloat64Array;  // Center offset [x, y]
}

// Change types (bitflags)
enum HorizonProjectionChangeType {
  Position = 1,
  Altitude = 1 << 1,
  Heading = 1 << 2,
  Pitch = 1 << 3,
  Roll = 1 << 4,
  ProjectedSize = 1 << 6,
  Fov = 1 << 7,
  ScaleFactor = 1 << 11,  // Combination of ProjectedSize and Fov
  OffsetCenterProjected = 1 << 13
}
```

### Layered Component System:

```typescript
<HorizonComponent projection={projection}>

  {/* Layer 1: Terrain (when SVT enabled) */}
  <SyntheticVision bingId="g3000_bing" isEnabled={svtEnabled} />

  {/* Layer 2: Sky/Ground (Canvas) */}
  <HorizonSharedCanvasLayer>
    <ArtificialHorizon
      groundColors={[
        [0, '#534a36'],      // At horizon
        [100, '#3d3528'],    // 100px down
        [200, '#2b2519']     // 200px down
      ]}
      skyColors={[
        [0, '#0099cc'],      // At horizon
        [200, '#006bb3']     // 200px up
      ]}
    />
    <HorizonLine color="white" />
  </HorizonSharedCanvasLayer>

  {/* Layer 3: Pitch Ladder (SVG) */}
  <PitchLadder options={pitchLadderOptions} />

  {/* Layer 4: Roll Indicator (SVG) */}
  <RollIndicator options={rollIndicatorOptions} />

  {/* Layer 5: Aircraft Symbol (SVG - always centered) */}
  <AttitudeAircraftSymbol format="dual-cue" color="yellow" />

  {/* Layer 6: Flight Director (SVG) */}
  <FlightDirectorDualCue dataProvider={fdDataProvider} />

  {/* Layer 7: Limit Indicators (SVG) */}
  <PitchLimitIndicator aoaLimit={10.5} />
  <RollLimitIndicators leftLimit={20} rightLimit={20} />

</HorizonComponent>
```

### HorizonDisplay Props

```typescript
interface HorizonDisplayProps {
  bus: EventBus;
  adcIndex: number | Subscribable<number>;      // Air Data Computer
  ahrsIndex: number | Subscribable<number>;     // Attitude/Heading Reference
  fmsPosIndex: number | Subscribable<number>;   // Position source
  aoaIndex?: number | Subscribable<number>;     // Angle of Attack (optional)

  updateFreq: number | Subscribable<number>;    // Update rate (Hz)
  bingId: string;                               // Bing maps instance ID

  // Configuration options
  artificialHorizonOptions: ArtificialHorizonOptions;
  horizonLineOptions: HorizonLineOptions;
  pitchLadderOptions: HorizonPitchLadderOptions;
  rollIndicatorOptions: RollIndicatorOptions;
  aircraftSymbolOptions: AircraftSymbolOptions;
  flightDirectorSingleCueOptions?: FlightDirectorSingleCueOptions;
  flightDirectorDualCueOptions?: FlightDirectorDualCueOptions;
  rollLimitIndicatorsOptions?: HorizonRollLimitIndicatorsOptions;
  pitchLimitIndicatorOptions?: HorizonPitchLimitIndicatorOptions;

  svtSettingManager: UserSettingManager<SynVisUserSettingTypes>;
  useMagneticHeading: Subscribable<boolean>;
}
```

### HorizonComponent - Main Rendering Container

**File:** `src/sdk/components/horizon/HorizonComponent.tsx`

```typescript
// Container for all horizon layers
export class HorizonComponent extends DisplayComponent<HorizonComponentProps> {
  public readonly projection: HorizonProjection;
  private readonly layerEntries: LayerEntry[] = [];

  // Manages wake/sleep states
  public sleep(): void { ... }    // Pauses updates
  public wake(): void { ... }     // Resumes updates

  // Updates projection from prop changes
  private projectedSizeSub = this.projectedSize.sub(size => {
    this.projection.set({ projectedSize: size });
  });
}
```

### Artificial Horizon (Canvas-based)

**File:** `src/garminsdk/components/nextgenpfd/horizon/ArtificialHorizon.tsx`

**Rendering Technique:** **Canvas 2D context with transform matrices**

```typescript
// Options
interface ArtificialHorizonOptions {
  groundColor?: string;              // Single color or gradient
  groundColors?: ColorStop[];        // [distance, color, step?]
  skyColor?: string;
  skyColors?: ColorStop[];           // Distance from horizon line in pixels
}

// Rendering approach
private drawHorizonRects(context: CanvasRenderingContext2D, projection: HorizonProjection) {
  // 1. Calculate pitch resolution from FOV
  const pitchResolution = projection.getScaleFactor() / projection.getFov();

  // 2. Calculate horizon translation due to pitch
  const pitch = projection.getPitch();
  const roll = projection.getRoll();
  Vec2Math.set(0, pitchResolution * pitch, this.bgTranslation);
  this.bgRotation = -roll;

  // 3. Build transform matrix
  const transform = new Transform2D()
    .addTranslation(-projectedCenter[0], -projectedCenter[1])
    .addRotation(-roll * DEG2RAD)
    .addTranslation(-pitchTranslation[0], -pitchTranslation[1]);

  // 4. Apply transform to canvas context
  context.setTransform(inverted);

  // 5. Draw gradient rectangles for sky/ground
  this.drawGradientRect(context, this.skyColors, minX, maxX, minY);
  this.drawGradientRect(context, this.groundColors, minX, maxX, maxY);

  context.resetTransform();
}

// Gradient interpolation to avoid Coherent bugs
static createColorGradient(colors: ColorStop[]): GradientStop[] {
  // Interpolates between color stops to create smooth gradients
  // Uses configurable step size (default 4px)
}
```

### Pitch Ladder (SVG overlay)

**File:** `src/garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx`

```typescript
interface PitchLadderOptions {
  svtDisabledStyles: PitchLadderStyles;  // Normal mode (55° FOV)
  svtEnabledStyles: PitchLadderStyles;   // SVT mode (50° Bing FOV)
}

interface PitchLadderStyles {
  majorLineIncrement: number;            // E.g., 10°
  mediumLineFactor: number;              // Lines per major
  minorLineFactor: number;               // Lines per medium
  minorLineMaxPitch: number;             // Hide minor lines beyond this
  mediumLineMaxPitch: number;
  minorLineLength: number;
  mediumLineLength: number;
  majorLineLength: number;
  minorLineShowNumber: boolean;
  majorLineShowNumber: boolean;
  chevronThresholdPositive: number;      // Unusual attitude warning
  chevronThresholdNegative: number;
}

// Rendering
- SVG <g> for lines and numbers
- CSS transforms for positioning:
  - translate3d for pitch movement
  - rotate for roll
  - clipPath for bounds clipping
- Chevrons displayed at extreme pitch angles
```

### Roll Indicator

**File:** `src/garminsdk/components/nextgenpfd/horizon/RollIndicator.tsx`

```typescript
interface RollIndicatorOptions {
  radius: number;                        // Circle radius in pixels
  showArc: boolean;                      // Display roll scale arc
  pointerStyle: 'ground' | 'sky';       // Fixed or rotating pointer
  lowBankAngle?: number;                // Low bank arc limit
  majorTickLength: number;               // Tick mark sizes
  minorTickLength: number;
  referencePointerSize: [width, height];
  referencePointerOffset: number;        // Offset from scale
  rollPointerSize: [width, height];
  rollPointerOffset: number;
  slipSkidIndicatorOffset: number;
  slipSkidIndicatorHeight: number;
  slipSkidIndicatorTranslateScale: number; // Ball deflection amount
}

// Rendering approach
- SVG for scale, pointers, and numbers
- Two modes:
  - Ground pointer: Scale rotates, pointer stays at top
  - Sky pointer: Pointer rotates, scale stays fixed
- Slip/skid ball position from turn_coordinator_ball
  - Translates based on normalized value [-1, 1]
```

### Attitude Aircraft Symbol

**File:** `src/garminsdk/components/nextgenpfd/horizon/AttitudeAircraftSymbol.tsx`

```typescript
interface AttitudeAircraftSymbolProps {
  format: AttitudeAircraftSymbolFormat.SingleCue | AttitudeAircraftSymbolFormat.DualCue;
  color: Subscribable<'yellow' | 'white'>;
}

// Rendering
- SVG fixed symbol in center of screen
- Two formats:
  - SingleCue: Basic aircraft symbol (short tick mark)
  - DualCue: Extended fuselage with pitch reference marks
- Always remains centered; scene rotates around it
```

### AHRS Data Consumption (G3000):

```typescript
// Subscribe to indexed AHRS
private onAhrsIndexChanged(index: number): void {
  const sub = this.bus.getSubscriber<AhrsSystemEvents>();

  // Attitude data
  this.pitch.setConsumer(sub.on(`ahrs_pitch_deg_${index}`));
  this.roll.setConsumer(sub.on(`ahrs_roll_deg_${index}`));
  this.heading.setConsumer(sub.on(`ahrs_hdg_deg_true_${index}`));

  // Turn coordinator
  this.turnCoordinatorBall.setConsumer(
    sub.on(`ahrs_turn_coordinator_ball_${index}`)
  );

  // System state
  this.ahrsState.setConsumer(sub.on(`ahrs_state_${index}`));
  this.isAttitudeDataValid.setConsumer(
    sub.on(`ahrs_attitude_data_valid_${index}`)
  );
  this.isHeadingDataValid.setConsumer(
    sub.on(`ahrs_heading_data_valid_${index}`)
  );
}

// Update loop
private onUpdated(time: number): void {
  // Update projection with latest attitude
  this.projection.set({
    pitch: this.pitch.get(),
    roll: this.roll.get(),
    heading: this.heading.get(),
    fov: this.fov.get()
  });

  // All layers automatically update via projection change events
}
```

### Synthetic Vision Technology (SVT)

**File:** `src/garminsdk/components/nextgenpfd/horizon/SyntheticVision.tsx`

```typescript
interface SyntheticVisionProps {
  bingId: string;                // Bing maps instance ID
  bingDelay?: number;            // Delay binding Bing (ms)
  isEnabled: Subscribable<boolean>;
}

// SVT Display
- Integrates Bing Maps terrain rendering via SynVisComponent
- Requires valid heading, attitude, and supported FMS position mode
- FOV switches from normal (55°) to Bing-constrained (50°) when enabled
- Supports optional features when advancedSvt = true:
  - Horizon heading labels in non-SVT mode
  - Flight path marker when SVT disabled
  - SVT pathways, airport signs, traffic

// Data Flow for SVT Enable Decision
const isSvtEnabled = MappedSubject.create(
  ([isHeadingDataValid, isAttitudeDataValid, fmsPosMode, svtEnabledSetting]): boolean => {
    return svtEnabledSetting && isHeadingDataValid && isAttitudeDataValid
      && [FmsPositionMode.Gps, FmsPositionMode.Hns, FmsPositionMode.Dme].includes(fmsPosMode);
  },
  this.isHeadingDataValid,
  this.isAttitudeDataValid,
  this.fmsPosMode,
  this.props.svtSettingManager.getSetting('svtEnabled')
);
```

### Configuration System (G3000)

**File:** `src/workingtitle-instruments-g3000/wtg3000common/html_ui/Shared/AvionicsConfig/HorizonConfig.ts`

```typescript
class HorizonConfig {
  directorCue: 'single' | 'dual' | 'both';     // FD cue options
  symbolColor: 'yellow' | 'white';             // Aircraft symbol color
  showRollArc: boolean;                        // Display roll scale arc
  rollPointerStyle: 'ground' | 'sky';          // Roll indicator style
  advancedSvt: boolean;                        // Support advanced SVT features
  rollLimitIndicatorsDef?: HorizonRollLimitIndicatorsDefinition;
  pitchLimitIndicatorDef?: HorizonPitchLimitIndicatorDefinition;
}

// XML Example
<Horizon director-cue="both" symbol-color="yellow" roll-arc="true"
         roll-pointer="ground" advanced-svt="false">
  <RollLimitIndicators leftRollLimit="20" rightRollLimit="20" />
  <PitchLimitIndicator aoaLimit="10.5" showPitchOffsetThreshold="-5"
                       hidePitchOffsetThreshold="-10" />
</Horizon>
```

**Key Files to Study:**
- `src/garminsdk/components/nextgenpfd/horizon/HorizonDisplay.tsx` - Main orchestrator
- `src/sdk/components/horizon/HorizonProjection.ts` - Projection math
- `src/garminsdk/components/nextgenpfd/horizon/ArtificialHorizon.tsx` - Sky/ground rendering
- `src/garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx` - Pitch ladder
- `src/garminsdk/components/nextgenpfd/horizon/RollIndicator.tsx` - Roll scale

---

## 4. 📱 G3X Touch Implementation

### Customized Next-Gen Components

**Location:** `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HorizonDisplay/G3XHorizonDisplay.tsx` (609 lines)

Based on G3000 architecture but with **G3X-specific styling**:

```typescript
interface G3XHorizonDisplayProps {
  bus: EventBus;
  gduFormat: GduFormat;                  // 460 (7") or 1200 (10.6")
  adcIndex: number | Subscribable<number>;
  ahrsIndex: number | Subscribable<number>;
  fmsPosIndex: number | Subscribable<number>;

  // G3X-specific options
  aircraftSymbolOptions: Readonly<G3XHorizonAircraftSymbolOptions>;
  // (includes singleCueBarSpan for custom FD sizing)

  pitchLadderOptions: G3XHorizonPitchLadderOptions;
  // (uses G3XPitchLadderProps with custom styling)

  rollIndicatorOptions: RollIndicatorOptions;
  // (standard options but G3X styling applied)
}

// AHRS data consumption identical to G3000
private onAhrsIndexChanged(index: number): void {
  this.pitch.setConsumer(sub.on(`ahrs_pitch_deg_${index}`));
  this.roll.setConsumer(sub.on(`ahrs_roll_deg_${index}`));
  // ... heading, turn coordinator, state, validity
}

// Uses same canvas rendering as G3000
// But with custom overlays:
<G3XAttitudeAircraftSymbol />   // Custom symbol
<G3XPitchLadder />              // Custom ladder styling
<G3XFlightDirectorDualCue />    // Custom FD
```

### G3X-Specific Components

**Custom Aircraft Symbol:**
- **File:** `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HorizonDisplay/AttitudeAircraftSymbol/G3XAttitudeAircraftSymbol.tsx`
- Tailored symbol for 460/1200 format distinctions
- Optional `singleCueBarSpan` property

**Custom Pitch Ladder:**
- **File:** `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HorizonDisplay/PitchLadder/G3XPitchLadder.tsx`
- G3X-specific line styles and labeling

**Custom Flight Director:**
- **SingleCue:** `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HorizonDisplay/FlightDirectorSingleCue/G3XFlightDirectorSingleCue.tsx`
- **DualCue:** `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HorizonDisplay/FlightDirectorDualCue/G3XFlightDirectorDualCue.tsx`

### Horizon Configuration (G3X)

**File:** `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HorizonDisplay/HorizonConfig.ts`

```typescript
class HorizonConfig {
  symbolColor: 'yellow' | 'white';
  showRollArc: boolean;
  rollPointerStyle: 'ground' | 'sky';
  includeUnusualAttitudeChevrons: boolean;  // G3X-specific
}

// Simpler than G3000 (no FD format selection, no limits)
```

**Key Differences from G3000:**
- Touch screen optimized layouts
- Different pitch ladder line styles
- Simplified roll indicator
- Format-specific sizing (460 vs 1200)
- Unusual attitude chevrons configurable

**Files:**
- `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HorizonDisplay/G3XHorizonDisplay.tsx`
- `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HorizonDisplay/AttitudeAircraftSymbol/G3XAttitudeAircraftSymbol.tsx`
- `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HorizonDisplay/PitchLadder/G3XPitchLadder.tsx`

---

## 5. ✈️ WT21 Implementation

### Simpler HTML/CSS Approach

**Location:** `src/workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/PFD/Components/FlightGuidance/AttitudeIndicator.tsx`

The WT21 uses a **lightweight HTML div** approach:

```typescript
// Basic structure
<div class="attitude-indicator-container">
  <div ref={outerRef} class="outer-rotation">  {/* Roll */}
    <div ref={innerRef} class="inner-translation">  {/* Pitch */}

      {/* Pitch ladder as HTML divs */}
      <div class="pitch-line pitch-10">10</div>
      <div class="pitch-line pitch-20">20</div>
      {/* ... */}

    </div>
  </div>
</div>

// Update via direct style manipulation
update(planeState: FlightGuidancePlaneInfo): void {
  this.innerRef.style.transform =
    `translate3d(0px, ${planeState.pitch * this.pxPerDegY}px, 0px)`;
  this.outerRef.style.transform =
    `rotate3d(0,0,1,${planeState.roll}deg)`;
}

// Very basic artificial horizon
// Subscribes to indexed AHRS topics:
ahrs.on(`ahrs_pitch_deg_${ahrsIndex}`)
    .withPrecision(2)
    .handle(this.onUpdatePitch);

ahrs.on(`ahrs_roll_deg_${ahrsIndex}`)
    .withPrecision(3)
    .handle(this.onUpdateRoll);
```

### Attitude Director Indicator (ADI)

**File:** `src/workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/PFD/Components/FlightGuidance/AttitudeDirectorIndicator.tsx`

Combines attitude with flight director cues using custom projection utils:

```typescript
// Custom projection calculations
const pxPerDegY = AdiProjectionUtils.getPxPerDegY();
const pxPerDegX = AdiProjectionUtils.getPxPerDegX();

// Flight director pitch/bank commands overlaid
```

### WT21 AHRS System

**File:** `src/workingtitle-instruments-wt21/shared/Systems/AHRSSystem.ts`

Standard next-gen AHRS with indexed event topics:

```typescript
// Subscribes to roll changes for initialization
private readonly rollSub = this.bus.getSubscriber<AhrsEvents>()
  .on('roll_deg')
  .whenChanged()
  .handle(this.onRollChanged.bind(this), true);
```

**Files:**
- `src/workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/PFD/Components/FlightGuidance/AttitudeIndicator.tsx`
- `src/workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/PFD/Components/FlightGuidance/AttitudeDirectorIndicator.tsx`
- `src/workingtitle-instruments-wt21/shared/Systems/AHRSSystem.ts`

---

## 6. 🚀 Epic2 Implementation

### Canvas with Pitch Clamping

**Location:** `src/workingtitle-instruments-epic2/instruments/html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/PFD/Components/Horizon/ArtificialHorizon.tsx`

Similar to G3000 but adds **pitch clamping**:

```typescript
// Constants
CLAMP_PITCH_MAX = 25;      // Maximum visible pitch
CLAMP_PITCH_MIN = -10.8;   // Minimum visible pitch

// Ensures sky and ground always visible
// Prevents "all blue" or "all brown" scenarios
```

### ADAHRS System (Advanced)

**File:** `src/workingtitle-instruments-epic2/shared/Systems/AdahrsSystem.ts`

**More advanced than standard AHRS** - integrates ADC and AHRS data:

```typescript
// Data sources beyond standard AHRS
type AdahrsAdcDataSourceTopics =
  'ias' | 'tas' | 'mach_number'
  | 'pressure_alt' | 'vertical_speed' | 'ambient_temp_c';

type AdahrsAhrsDataSourceTopics =
  'actual_hdg_deg' | 'actual_hdg_deg_true'
  | 'actual_pitch_deg' | 'actual_roll_deg' | 'delta_heading_rate';

type AdahrsAircraftInertialDataSourceTopics =
  'acceleration_body_x' | 'acceleration_body_y' | 'acceleration_body_z'
  | 'rotation_velocity_body_x' | 'rotation_velocity_body_y' | 'rotation_velocity_body_z';

// Two channels (A/B) support
enum AdahrsSystemChannel {
  A = 1,
  B = 2,
}

// Published topics
adahrs_pitch_deg_${channel}
adahrs_roll_deg_${channel}
adahrs_heading_*_${channel}
adahrs_attitude_data_valid_${channel}
adahrs_heading_data_valid_${channel}
// ... plus many more data topics
```

**Files:**
- `src/workingtitle-instruments-epic2/instruments/html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/PFD/Components/Horizon/ArtificialHorizon.tsx`
- `src/workingtitle-instruments-epic2/shared/Systems/AdahrsSystem.ts`

---

## 7. 🔍 GNS AHRS Publisher

### Custom AHRS Source

**File:** `src/workingtitle-instruments-gns/html_ui/Shared/Instruments/GnsAhrsPublisher.ts`

**Unique Feature:** Sources data from **PLANE simvars** instead of attitude/heading indicators

```typescript
// Workaround for vacuum gyro issues
// Maps simulator PLANE variables to AHRS events
const SIMVARS = [
  ['hdg_deg', { name: 'HEADING INDICATOR' }],
  ['pitch_deg', { name: 'PLANE PITCH DEGREES' }],
  ['roll_deg', { name: 'PLANE BANK DEGREES' }],
  ['actual_pitch_deg', { name: 'PLANE PITCH DEGREES' }],
  ['actual_roll_deg', { name: 'PLANE BANK DEGREES' }],
  // ... plus heading variants
];

// Same event interface as SDK AhrsPublisher
// but direct from airplane physics
```

---

## 8. 🧩 Common Base Classes & Infrastructure

### SDK Horizon Component Architecture

**File:** `src/sdk/components/horizon/`

```
HorizonComponent.tsx
├── Uses HorizonProjection for 3D→2D projection
├── Manages HorizonLayer children
└── Provides wake/sleep state management

HorizonLayer.ts (Abstract base)
├── onAttached()           - Called when added to horizon
├── onProjectionChanged()  - Reacts to attitude/heading changes
├── setVisible()           - Show/hide layer
└── onWake()/onSleep()    - Performance optimization

HorizonSharedCanvasLayer.tsx
├── Single canvas element shared by multiple sublayers
├── HorizonSharedCanvasSubLayer<T>
│   ├── ArtificialHorizon
│   └── HorizonLine
└── Coordinates invalidation

HorizonCanvasLayer.tsx / HorizonSyncedCanvasLayer.tsx
├── Manages canvas resolution sync with projection
└── Handles 2D context rendering
```

### Data Validation Pipeline

```
Simulator (SimVars)
    ↓
AhrsPublisher (SDK) / GnsAhrsPublisher
    ↓
BaseAhrsEvents (pitch_deg, roll_deg, etc.)
    ↓
AhrsSystem (Garmin SDK) - Adds state management & validation
    ↓
AhrsSystemEvents (ahrs_pitch_deg_${index}, ahrs_attitude_data_valid_${index}, etc.)
    ↓
AhrsSystemSelector (Optional) - Picks best AHRS from multiple
    ↓
HorizonDisplay / AttitudeIndicator
    ↓
ConsumerSubject subscriptions
    ↓
Rendering (Canvas/SVG)
```

---

## 9. 🎨 Rendering Techniques Comparison

### Pitch Ladder Rendering

| Technique | G1000 | G3X/G3000 | WT21 | Epic2 |
|-----------|-------|-----------|------|-------|
| **Technology** | SVG lines + CSS transforms | SVG lines + CSS transforms | HTML divs + CSS | Canvas (Epic) or SVG |
| **Update Method** | Translate pitch lines group | Translate pitch lines group | Transform inner div | Canvas redraw or transform |
| **Pitch Motion** | `translate3d(0, pitch*ratio, 0)` | `translate3d(0, pitch*ratio, 0)` | CSS translate | Canvas translation |
| **Roll Motion** | CSS rotate on outer div | CSS rotate on pitch layer | CSS rotate3d | Canvas rotation |
| **Line Generation** | Dynamic SVG on init | Dynamic SVG on init | CSS gradient | SVG rendering |
| **Number Labels** | SVG `<text>` elements | SVG `<text>` elements | HTML text | SVG `<text>` |
| **Update Frequency** | On pitch change | On update cycle | On state change | Canvas render cycle |

### Sky/Ground Rendering

| Aspect | G1000 | G3X/G3000 | WT21 | Epic2 |
|--------|-------|-----------|------|-------|
| **Method** | SVG paths with fills | Canvas gradient rectangles | CSS gradients | Canvas gradient rectangles |
| **Color Stops** | Hardcoded colors | Configurable color stops | Hardcoded | Configurable with distance |
| **Pitch Integration** | Manually positioned SVG | Transform + canvas context | CSS position | Transform matrix |
| **Roll Integration** | Outer div rotation | Canvas context rotation | CSS rotation | Canvas rotation |
| **Gradient Type** | Solid/linear | Linear (custom interpolation) | Linear CSS | Linear (pixel strips) |
| **Update Trigger** | Pitch/roll change | Projection change | Pitch/roll change | Projection change |

### Canvas vs SVG Strategy

**SVG Approach (G1000, WT21):**
- **Pros:** DOM accessible, easier text rendering, better scaling
- **Cons:** More elements in DOM, potential performance hit with many lines
- **Used for:** Pitch ladder, turn coordinator, flight director

**Canvas Approach (G3000/G5000, Epic2):**
- **Pros:** Single render surface, better for complex geometry, optimized for video
- **Cons:** Text rendering trickier, no DOM accessibility
- **Used for:** Artificial horizon (sky/ground), complex projections

**Hybrid (Most modern):**
- Canvas for sky/ground (base layer)
- SVG for overlays (ladder, symbols, FD)
- CSS transforms for simple elements

---

## 10. 🔄 Data Update Flow

### Complete Pipeline:

```typescript
// 1. Simulator updates SimVar (every frame)
ATTITUDE INDICATOR PITCH DEGREES = -5.2°

// 2. AhrsPublisher reads SimVar
onUpdate() {
  const pitch = SimVar.GetSimVarValue('ATTITUDE INDICATOR PITCH DEGREES', 'degrees');
  this.publish('pitch_deg', pitch);
}

// 3. AhrsSystem validates and republishes
onInit() {
  this.ahrsDataSourceSubscriber.on('pitch_deg').handle(pitch => {
    if (this.state === AvionicsSystemState.On && this.isAttitudeDataValid) {
      this.publisher.pub(`ahrs_pitch_deg_${this.index}`, pitch, true, true);
      //                                                        ^^^^  ^^^^
      //                                                        sync  cache
    }
  });
}

// 4. HorizonDisplay subscribes
this.pitch = ConsumerSubject.create(null, 0);
this.pitch.setConsumer(sub.on(`ahrs_pitch_deg_1`));

// 5. Projection updates
this.pitch.sub(newPitch => {
  this.projection.set({ pitch: newPitch });
});

// 6. Layers react to projection change
projection.onChange((proj, changeFlags) => {
  if (changeFlags & HorizonProjectionChangeType.Pitch) {
    this.onProjectionChanged(proj, changeFlags);
  }
});

// 7. Canvas redraws or CSS updates
onProjectionChanged() {
  const pitch = projection.getPitch();
  const roll = projection.getRoll();
  this.redrawHorizon(pitch, roll);
}
```

### Precision Control:

```typescript
// Reduce unnecessary updates
.withPrecision(2)  // Only fire if change > 0.01

// Examples:
pitch.withPrecision(2)  // Updates every 0.01°
roll.withPrecision(3)   // Updates every 0.001°
ball.withPrecision(2)   // Updates every 0.01 ball units
```

---

## 11. 🎛️ System State Management

### AHRS Initialization Sequence:

```typescript
// State machine
Power Off
  ↓ (power applied)
Initializing (45 seconds)
  ↓
  ├─ If roll ≥ 20° → Restart timer (aircraft moving)
  ├─ If magnetometer off → Heading invalid
  └─ After 45s → Fully operational
  ↓
On (attitude valid, heading valid if mag ok)

// States
enum AvionicsSystemState {
  Off = 'off',
  Initializing = 'init',
  On = 'on',
  Failed = 'failed'
}

// Display behavior
switch (ahrsState) {
  case 'init':
    // Show "AHRS ALIGN: Keep Wings Level"
    break;
  case 'on':
    if (isAttitudeDataValid) {
      // Show attitude indicator
    } else {
      // Show failed flag
    }
    break;
  case 'off':
  case 'failed':
    // Show failed flag (red X)
    break;
}
```

---

## 12. 🎮 Flight Director Integration

### Data Provider Pattern

**File:** `src/garminsdk/components/nextgenpfd/horizon/FlightDirectorDataProvider.ts`

```typescript
interface FlightDirectorDataProvider {
  isFdActive: Subscribable<boolean>;    // FD engaged?
  fdPitch: Subscribable<number>;        // Pitch command (degrees)
  fdBank: Subscribable<number>;         // Bank command (degrees)
}

// Default implementation
class DefaultFlightDirectorDataProvider {
  constructor(bus: EventBus, index: number) {
    // Subscribe to autopilot events
    sub.on('flight_director_is_active_1').handle(active => {
      this._isFdActive.set(active);
    });

    sub.on('flight_director_pitch_deg_1').handle(pitch => {
      // Smooth the command
      const smoothed = this.pitchSmoother.next(pitch, dt);
      this._fdPitch.set(smoothed);
    });

    sub.on('flight_director_bank_deg_1').handle(bank => {
      const smoothed = this.bankSmoother.next(bank, dt);
      this._fdBank.set(smoothed);
    });
  }
}

// Smoothing with exponential smoother
pitchSmoother = new ExpSmoother(721);  // ~721ms time constant
bankSmoother = new ExpSmoother(721);
```

### Single Cue Display

**File:** `src/garminsdk/components/nextgenpfd/horizon/FlightDirectorSingleCue.tsx`

```typescript
// Single crosshair showing combined pitch/bank error
// Moves around screen to show where to fly

// Conformal mode: Follows pitch ladder
// Non-conformal: Fixed scale beyond bank limits

render() {
  return (
    <svg>
      <g transform={`translate(${x}, ${y})`}>
        {/* Vertical bar */}
        <line x1="0" y1="-20" x2="0" y2="20" />

        {/* Horizontal bar */}
        <line x1="-20" y1="0" x2="20" y2="0" />
      </g>
    </svg>
  );
}
```

### Dual Cue Display

**File:** `src/garminsdk/components/nextgenpfd/horizon/FlightDirectorDualCue.tsx`

```typescript
// Separate pitch and bank commands
// Pitch bar: Horizontal line showing target pitch
// Bank pointer: Shows target bank angle

render() {
  return (
    <svg>
      {/* Pitch command bar (horizontal) */}
      <line
        x1="-40" y1={pitchY}
        x2="40" y2={pitchY}
        stroke="magenta"
      />

      {/* Bank command pointer */}
      <g transform={`rotate(${bankCommand})`}>
        <polygon points="0,-280 5,-270 -5,-270" />
      </g>
    </svg>
  );
}
```

---

## 13. 📐 Advanced Features

### Unusual Attitude Warning (Pitch Chevrons)

```typescript
// PitchLadder configuration
chevronThresholdPositive: number;  // e.g., 25°
chevronThresholdNegative: number;  // e.g., -10.8°

// When pitch exceeds thresholds, warning chevrons display
// Helps pilot recognize unusual attitudes
```

### Pitch Limit Indicator

**File:** `src/garminsdk/components/nextgenpfd/horizon/PitchLimitIndicator.tsx`

```typescript
interface HorizonPitchLimitIndicatorOptions {
  // Mode 1: Direct pitch limit
  pitchLimit?: number | Accessible<number>;

  // Mode 2: AOA-based
  aoaLimit?: number;

  // Mode 3: Normalized AOA
  normAoaLimit?: number;  // Interpolated between zero-lift and stall

  aoaSmoothingTau?: number;  // Data smoothing time constant

  showPitchOffsetThreshold: number;   // Show when pitch >= limit + threshold
  hidePitchOffsetThreshold: number;   // Hide when pitch < limit + threshold
}

// Use case: Prevent stall or overspeed conditions
```

### Roll Limit Indicators

**File:** `src/garminsdk/components/nextgenpfd/horizon/RollLimitIndicators.tsx`

```typescript
interface HorizonRollLimitIndicatorsOptions {
  leftRollLimit: number | Accessible<number>;   // e.g., 20°
  rightRollLimit: number | Accessible<number>;  // e.g., 20°
  easeDuration?: number;  // Animation time when limits change (1000ms default)
}

// Displays yellow markers at bank limits
// Helps stay within acceptable roll envelope
```

### Flight Path Marker (FPM)

**File:** `src/garminsdk/components/nextgenpfd/horizon/FlightPathMarker.tsx`

```typescript
// Shows where aircraft is actually going
// (vs. where it's pointing)

// Requires:
- Valid ground speed
- Valid track
- Valid attitude

// Symbol: Circle with wings
// Position: Offset from aircraft symbol based on wind/drift

// G3000/G5000 feature
showFpm = MappedSubject.create(
  ([isHeadingDataValid, isAttitudeDataValid, isSvtEnabled, svtDisabledFpmShowSetting]): boolean => {
    return isHeadingDataValid && isAttitudeDataValid
      && (isSvtEnabled || svtDisabledFpmShowSetting);  // Show with SVT or on demand
  }
);
```

### Data Smoothing

**Flight Director Commands:**

```typescript
// ExpSmoother with configurable time constants (tau)
class DefaultFlightDirectorDataProvider {
  private pitchSmoother = new ExpSmoother(pitchSmoothingTau);    // default ~721ms
  private bankSmoother = new ExpSmoother(bankSmoothingTau);      // default ~721ms

  update(time: number) {
    fdPitch = pitchSmoother.next(rawPitch, dt);
    fdBank = bankSmoother.next(rawBank, dt);
  }
}
```

**AOA Smoothing** (for pitch limit indicator):

```typescript
// Only when using AOA-based limits
aoaSmoother = new ExpSmoother(aoaSmoothingTau ?? 0);  // configurable
```

**TCAS RA Pitch Cue:**

```typescript
tasSmoother = new ExpSmoother(tasSmoothingTau ?? 2000/Math.LN2);
pitchSmoother = new ExpSmoother(pitchSmoothingTau ?? 2000/Math.LN2);
```

---

## 14. 🏗️ Architectural Patterns & Key Insights

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

### Layered Rendering

```
HorizonComponent (root)
├── Projection management
└── Layer management
    ├── HorizonSharedCanvasLayer
    │   ├── ArtificialHorizon (canvas)
    │   └── HorizonLine (canvas)
    ├── PitchLadder (SVG)
    ├── RollIndicator (SVG)
    ├── AttitudeAircraftSymbol (SVG)
    ├── FlightDirector*Cue (SVG)
    ├── PitchLimitIndicator (SVG)
    ├── RollLimitIndicators (SVG)
    └── SyntheticVision (Bing maps)
```

### Projection-Based Rendering

```
Instead of direct coordinate manipulation:
Pitch/Roll → HorizonProjection object → Layer reads values → Renders accordingly

Benefits:
- Single source of truth for camera orientation
- Layers automatically sync
- FOV changes propagate automatically
- Easy to add new layers (just subscribe to projection)
```

---

## 15. 📊 Summary Comparison Table

| Aspect | G1000 NXi | G3000/G5000 | G3X Touch | WT21 | Epic2 |
|--------|-----------|------------|-----------|------|-------|
| **AHRS System** | AHRSSystem (G1000 variant) | AhrsSystem (Garmin SDK) | AhrsSystem (Garmin SDK) | AhrsSystem | AdahrsSystem |
| **Rendering Tech** | SVG + CSS | Canvas + SVG | Canvas + SVG | HTML/CSS | Canvas |
| **Pitch Motion** | CSS translate | Canvas + CSS | Canvas + CSS | CSS | Canvas |
| **Roll Motion** | CSS rotate | CSS rotate | CSS rotate | CSS rotate3d | Canvas rotate |
| **Sky/Ground** | SVG paths | Canvas gradient | Canvas gradient | CSS divs | Canvas gradient |
| **Pitch Ladder** | SVG lines | SVG lines | SVG lines | HTML/CSS | Canvas |
| **Flight Director** | Overlaid on horizon | Integrated layers | G3X variants | Simple cues | Integrated |
| **SVT Support** | Limited | Full | Full | None | None |
| **Data Smoothing** | Minimal | Flight director only | Flight director only | Minimal | Pitch ladder |
| **Initialization** | 45 sec + 20° roll detect | 45 sec + 20° roll detect | 45 sec + 20° roll detect | 45 sec + 20° roll detect | 15 sec |
| **Multiplexing** | Dual AHRS support | Dual AHRS support | Dual AHRS support | Dual AHRS | Dual channel |

---

## 16. 💡 Implementation Tips

### Starting Your Own Attitude Indicator:

1. **Choose Your Rendering Approach:**
   - Simple instrument? → G1000 SVG approach
   - Advanced glass cockpit? → G3000 projection approach
   - Touch screen? → G3X approach

2. **Set Up Data Flow:**
   ```typescript
   // Create bus
   const bus = new EventBus();

   // Add AHRS system
   const ahrsSystem = new AhrsSystem(1, bus, options);

   // Subscribe in component
   const pitch = ConsumerSubject.create(null, 0);
   pitch.setConsumer(bus.getSubscriber<AhrsSystemEvents>()
     .on('ahrs_pitch_deg_1'));
   ```

3. **Build Rendering:**
   ```typescript
   // Simple: CSS transforms
   <div style={transform: `rotate(${roll}deg)`}>
     <div style={transform: `translateY(${pitch}px)`}>
       {/* Pitch ladder */}
     </div>
   </div>

   // Advanced: Canvas + projection
   <HorizonComponent projection={projection}>
     <ArtificialHorizon />
     <PitchLadder />
   </HorizonComponent>
   ```

4. **Handle System States:**
   ```typescript
   ahrsState.sub(state => {
     switch(state) {
       case 'init': showAlignMessage(); break;
       case 'on': showAttitude(); break;
       default: showFailedFlag(); break;
     }
   });
   ```

---

## 17. 📚 Key Files Reference

### SDK Foundation:

- `src/sdk/instruments/Ahrs.ts` - Base AHRS publisher
- `src/sdk/components/horizon/HorizonProjection.ts` - 3D→2D projection
- `src/sdk/components/horizon/HorizonComponent.tsx` - Layer management
- `src/sdk/components/horizon/HorizonLayer.ts` - Abstract base layer
- `src/sdk/components/horizon/HorizonSharedCanvasLayer.tsx` - Shared canvas

### Garmin SDK:

- `src/garminsdk/system/AhrsSystem.ts` - Enhanced AHRS with validation
- `src/garminsdk/system/AhrsSystemSelector.ts` - Multi-AHRS selection
- `src/garminsdk/components/nextgenpfd/horizon/HorizonDisplay.tsx` - Complete horizon
- `src/garminsdk/components/nextgenpfd/horizon/ArtificialHorizon.tsx` - Sky/ground
- `src/garminsdk/components/nextgenpfd/horizon/PitchLadder.tsx` - Pitch ladder
- `src/garminsdk/components/nextgenpfd/horizon/RollIndicator.tsx` - Roll scale
- `src/garminsdk/components/nextgenpfd/horizon/AttitudeAircraftSymbol.tsx` - Aircraft symbol
- `src/garminsdk/components/nextgenpfd/horizon/FlightDirectorDataProvider.ts` - FD data
- `src/garminsdk/components/nextgenpfd/horizon/FlightDirectorSingleCue.tsx` - Single cue FD
- `src/garminsdk/components/nextgenpfd/horizon/FlightDirectorDualCue.tsx` - Dual cue FD
- `src/garminsdk/components/nextgenpfd/horizon/PitchLimitIndicator.tsx` - Pitch limits
- `src/garminsdk/components/nextgenpfd/horizon/RollLimitIndicators.tsx` - Roll limits
- `src/garminsdk/components/nextgenpfd/horizon/SyntheticVision.tsx` - SVT integration

### Examples:

**G1000:**
- `src/workingtitle-instruments-g1000/html_ui/PFD/Components/FlightInstruments/AttitudeIndicator.tsx`
- `src/workingtitle-instruments-g1000/html_ui/PFD/Components/FlightInstruments/PrimaryHorizonDisplay.tsx`
- `src/workingtitle-instruments-g1000/html_ui/Shared/Systems/AHRSSystem.ts`

**G3000:**
- `src/garminsdk/components/nextgenpfd/horizon/` (all files)
- `src/workingtitle-instruments-g3000/wtg3000common/html_ui/Shared/AvionicsConfig/HorizonConfig.ts`

**G3X:**
- `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HorizonDisplay/G3XHorizonDisplay.tsx`
- `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HorizonDisplay/AttitudeAircraftSymbol/G3XAttitudeAircraftSymbol.tsx`
- `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HorizonDisplay/PitchLadder/G3XPitchLadder.tsx`

**WT21:**
- `src/workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/PFD/Components/FlightGuidance/AttitudeIndicator.tsx`
- `src/workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/PFD/Components/FlightGuidance/AttitudeDirectorIndicator.tsx`

**Epic2:**
- `src/workingtitle-instruments-epic2/instruments/html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/PFD/Components/Horizon/ArtificialHorizon.tsx`
- `src/workingtitle-instruments-epic2/shared/Systems/AdahrsSystem.ts`

---

This is a complete walkthrough of attitude indicator implementations across all Garmin instruments! Each approach has trade-offs between simplicity and features. The G1000 approach is great for learning, while the G3000 approach shows the full power of the SDK with projection-based rendering, synthetic vision, and advanced flight director integration.
