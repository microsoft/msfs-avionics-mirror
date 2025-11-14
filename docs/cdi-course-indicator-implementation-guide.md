# Complete Guide: CDI/Course Indicator Implementation in Garmin Instruments

A comprehensive walkthrough of Course Deviation Indicator (CDI) and OBS (Omni-Bearing Selector) implementations across all Garmin instruments, covering multiple navigation sources, deviation calculations, and visual rendering.

---

## 📊 Overview: What is the CDI/OBS System?

The **Course Deviation Indicator (CDI)** displays lateral deviation from a selected navigation course, showing the pilot how far off-course the aircraft is.

The **OBS (Omni-Bearing Selector)** allows manual selection of the desired course for VOR navigation or OBS mode on GPS.

### Key Components:

- **CDI Needle** - Vertical bar showing lateral deviation
- **Course Pointer** - Rotates to show desired track/course
- **Deviation Scale** - Dots showing scale (typically 5 dots = full-scale deflection)
- **TO/FROM Indicator** - Triangle showing navigation direction
- **Scale Annunciator** - Shows current sensitivity (ENR, TERM, APPR, etc.)

### Critical Concepts:

```typescript
// Normalized Deviation
lateralDeviation: number;  // -1.0 to +1.0
// -1.0 = Full-scale right (aircraft left of course)
// +1.0 = Full-scale left (aircraft right of course)
//  0.0 = On course

// Deviation Scale (Full-Scale Deflection Distance)
deviationScale: number;  // Nautical miles
// Enroute: 2.0 NM (low sensitivity)
// Terminal: 1.0 NM (medium sensitivity)
// Approach: 0.3 NM (high sensitivity)
// ILS/LOC: 2.5° (angular, not linear)

// TO/FROM Indicator
enum VorToFrom {
  OFF = 0,   // No valid signal
  TO = 1,    // Heading toward station/waypoint
  FROM = 2   // Heading away from station/waypoint
}
```

---

## 🔄 Complete Data Flow

```
Navigation Sources (GPS, VOR1, VOR2, LOC)
    ↓
Nav Source Data (XTK, CDI Value, Bearing, etc.)
    ↓
NavIndicatorController (source selection & aggregation)
    ↓
Deviation Calculation (normalize to -1 to +1)
    ↓
HSI/CDI Components (visual rendering)
    ↓
Pilot Display (needle, course, TO/FROM)
```

### Source Switching:

```
CDI Source Selector Switch
    ↓
NavIndicatorController.onUpdateCdiSelect()
    ↓
activeSourceIndex updated
    ↓
Components read navStates[activeSourceIndex]
    ↓
Visual updates (needle, course, scale label)
```

---

## 1. 🎯 Navigation Source Architecture

### NavReferenceBase Interface

**File:** `src/garminsdk/navreference/NavReferenceBase.ts`

The foundation for all navigation sources:

```typescript
interface NavReferenceBase {
  // Identity
  ident: Subscribable<string | null>;              // Waypoint/station ID
  signalStrength: Subscribable<number | null>;     // 0-1 signal quality

  // Bearing and Distance
  bearing: Subscribable<number | null>;            // Bearing FROM station (°)
  distance: Subscribable<number | null>;           // Distance to station (NM)

  // Course and Deviation
  course: Subscribable<number | null>;             // Desired track/OBS (°)
  lateralDeviation: Subscribable<number | null>;   // -1 to +1 normalized
  lateralDeviationScale: Subscribable<number | null>;      // NM for full-scale
  lateralDeviationScalingMode: Subscribable<number | null>; // CDIScaleLabel enum

  // Vertical Navigation (for ILS/RNAV)
  verticalDeviation: Subscribable<number | null>;  // -1 to +1 (glideslope)

  // Direction Indicator
  toFrom: Subscribable<VorToFrom | null>;          // TO/FROM/OFF
}
```

### GPS/LNAV Source

**File:** `src/garminsdk/navreference/source/GpsNavSource.ts`

```typescript
export class GpsNavSource implements NavReferenceSource<'GPS'> {
  // LNAV data consumers
  private readonly lnavIsTracking = ConsumerSubject.create(null, false);
  private readonly lnavDtkMag = ConsumerSubject.create(null, 0);      // Desired track
  private readonly lnavXtk = ConsumerSubject.create(null, 0);         // Cross-track error (NM)
  private readonly lnavBrgMag = ConsumerSubject.create(null, 0);      // Bearing to waypoint
  private readonly lnavDistance = ConsumerSubject.create(null, 0);    // Distance (NM)
  private readonly lnavCdiScale = ConsumerSubject.create(null, 2.0);  // Scale (NM)
  private readonly lnavCdiScaleLabel = ConsumerSubject.create(null, CDIScaleLabel.Enroute);

  // Computed lateral deviation
  private readonly lateralDeviation = MappedSubject.create(
    ([isTracking, xtk, scale]): number | null => {
      if (!isTracking || scale === null || scale === 0) {
        return null;
      }

      // Negative sign inverts XTK to match CDI convention
      // Positive XTK = right of course = negative deviation (needle left)
      const deviation = -xtk / scale;

      // Clamp to valid range
      return Math.max(-1, Math.min(1, deviation));
    },
    this.lnavIsTracking,
    this.lnavXtk,
    this.lnavCdiScale
  );

  // Course from LNAV DTK
  public readonly course = this.lnavDtkMag;

  // Distance and bearing
  public readonly distance = this.lnavDistance;
  public readonly bearing = this.lnavBrgMag;

  // Scale information
  public readonly lateralDeviationScale = this.lnavCdiScale;
  public readonly lateralDeviationScalingMode = this.lnavCdiScaleLabel;
}
```

**Key Points:**
- XTK (cross-track error) is positive when right of course
- Deviation is negated: `-xtk / scale`
- Result: positive deviation = needle right = aircraft left of course
- Scale changes automatically based on flight phase

### VOR/ILS/LOC Source

**File:** `src/garminsdk/navreference/source/NavRadioNavSource.ts`

```typescript
export class NavRadioNavSource implements NavReferenceSource<'NAV1' | 'NAV2'> {
  // SimVar consumers
  private readonly navCdi = ConsumerSubject.create(null, 0);           // -127 to 127
  private readonly navSignal = ConsumerSubject.create(null, 0);        // Signal strength
  private readonly navHasNav = ConsumerSubject.create(null, false);    // VOR available
  private readonly navLocalizer = ConsumerSubject.create(null, false); // LOC signal
  private readonly navLocalizerCourse = ConsumerSubject.create(null, 0); // ILS course
  private readonly navGlideslope = ConsumerSubject.create(null, 0);    // GS error
  private readonly navToFrom = ConsumerSubject.create(null, VorToFrom.OFF);
  private readonly navRadial = ConsumerSubject.create(null, 0);        // Radial from station
  private readonly navDme = ConsumerSubject.create(null, 0);           // DME distance
  private readonly navObs = ConsumerSubject.create(null, 0);           // OBS setting

  // Lateral deviation (already normalized by MSFS)
  private readonly lateralDeviation = this.navCdi.map(cdi => {
    // navCdi is -127 to 127, normalize to -1 to 1
    return cdi / 127;
  });

  // Course from OBS setting or LOC course
  private readonly course = MappedSubject.create(
    ([isLoc, locCourse, obs]) => {
      return isLoc ? locCourse : obs;
    },
    this.navLocalizer,
    this.navLocalizerCourse,
    this.navObs
  );

  // Vertical deviation (glideslope)
  private readonly verticalDeviation = this.navGlideslope.map(gs => {
    // Glideslope error normalized to -1 to +1
    // 0.7 degrees = full-scale deflection
    return -gs / 0.7;
  });

  // Scale is fixed for VOR/LOC
  public readonly lateralDeviationScale = Subject.create(2.5);  // 2.5° for LOC
  public readonly lateralDeviationScalingMode = Subject.create(CDIScaleLabel.Approach);
}
```

**Key Differences from GPS:**
- **Already normalized** - MSFS provides -127 to 127
- **Angular deviation** - 2.5° full-scale for LOC, not linear distance
- **Fixed scale** - Doesn't change based on flight phase
- **TO/FROM from SimVar** - Computed by MSFS, not calculated

---

## 2. 📐 CDI Scaling System

### NavdataComputer - Scale Calculation Engine

**File:** `src/garminsdk/navigation/NavdataComputer.ts`

The NavdataComputer determines CDI sensitivity based on flight phase:

```typescript
export class NavdataComputer {
  private computeIfrCdiScaling(): void {
    let scale = 2.0;  // Default enroute
    let scaleLabel = CDIScaleLabel.Enroute;

    const leg = this.lnavLegIndex.get();
    const activePlan = this.flightPlanner.getActiveFlightPlan();

    // Determine scale based on leg type and distance
    if (leg !== undefined && activePlan) {
      const segment = activePlan.getSegment(leg.segmentIndex);

      switch (segment.segmentType) {
        case FlightPlanSegmentType.Departure:
          scale = 0.3;
          scaleLabel = CDIScaleLabel.Departure;
          break;

        case FlightPlanSegmentType.Arrival:
        case FlightPlanSegmentType.Approach:
          // Scale transitions based on distance to FAF
          const distanceToFaf = this.calculateDistanceToFaf();

          if (distanceToFaf < 2.0) {
            // Inside FAF - high sensitivity
            scale = 0.3;
            scaleLabel = CDIScaleLabel.Approach;
          } else if (distanceToFaf < 30.0) {
            // Transition zone - interpolate 0.3 to 1.0
            const ratio = (distanceToFaf - 2.0) / 28.0;
            scale = 0.3 + (ratio * 0.7);
            scaleLabel = CDIScaleLabel.Terminal;
          } else {
            // Terminal area
            scale = 1.0;
            scaleLabel = CDIScaleLabel.Terminal;
          }
          break;

        case FlightPlanSegmentType.Enroute:
          scale = 2.0;
          scaleLabel = CDIScaleLabel.Enroute;
          break;
      }
    }

    // Publish scale
    this.publisher.pub('lnavdata_cdi_scale', scale, true, true);
    this.publisher.pub('lnavdata_cdi_scale_label', scaleLabel, true, true);
  }
}
```

### CDI Scale Labels:

```typescript
enum CDIScaleLabel {
  Departure = 0,        // 0.3 NM - Takeoff/climb
  Terminal = 1,         // 1.0 NM - Approach/arrival area
  TerminalDeparture = 2,// Variable - Terminal departure
  TerminalArrival = 3,  // Variable - Terminal arrival
  Enroute = 4,          // 2.0 NM - Cruise
  Oceanic = 5,          // 4.0 NM - Over water
  LNav = 6,             // Variable - GPS approach
  LNavPlusV = 7,        // Variable - GPS + VNAV
  Visual = 8,           // 0.5 NM - Visual approach
  LNavVNav = 9,         // Variable - GPS VNAV
  LP = 10,              // 0.35-0.5 NM - Localizer Performance
  LPPlusV = 11,         // 0.35-0.5 NM - LP + vertical
  LPV = 12,             // 0.25 NM - LP with vertical (precision)
  RNP = 13,             // Variable - Required Nav Performance
  Approach = 14,        // Generic approach
  MissedApproach = 15,  // 1.0 NM - Missed approach
  VfrEnroute = 16,      // 5.0 NM - VFR cruise
  VfrTerminal = 17,     // Variable - VFR terminal
  VfrApproach = 18      // 0.25 NM - VFR approach
}
```

### Scale Table:

| Flight Phase | Scale (NM) | Label | Description |
|--------------|------------|-------|-------------|
| Departure | 0.3 | DPRT | High sensitivity for obstacle clearance |
| Terminal | 1.0 | TERM | Medium sensitivity for approach/arrival |
| Enroute | 2.0 | ENR | Low sensitivity for cruise |
| Approach | 0.3 | APPR | High sensitivity for final approach |
| Oceanic | 4.0 | OCN | Very low sensitivity over water |
| ILS/LOC | 2.5° | ILS | Angular deviation (not linear) |
| LPV | 0.25 | LPV | Highest sensitivity (precision approach) |

---

## 3. 🎮 NavIndicatorController - Source Management

**File:** `src/garminsdk/navigation/NavIndicatorController.ts`

The NavIndicatorController aggregates data from all navigation sources and manages which source is active:

```typescript
export class NavIndicatorController {
  // Nav source states (Nav1, Nav2, GPS)
  private readonly navStates: HsiSource[] = [];

  // Currently active source
  private activeSourceIndex: number = 0;  // 0=Nav1, 1=Nav2, 2=GPS

  // Current sensitivity
  private activeSensitivity: NavSensitivity = NavSensitivity.GPS;

  constructor(bus: EventBus) {
    // Initialize nav states
    this.navStates[0] = this.createNavState('NAV1');
    this.navStates[1] = this.createNavState('NAV2');
    this.navStates[2] = this.createNavState('GPS');

    // Subscribe to CDI source selection
    bus.getSubscriber<ControlEvents>()
      .on('cdi_src_set')
      .handle(this.onUpdateCdiSelect);

    // Subscribe to nav data updates
    this.subscribeToNavData();
  }

  /**
   * Handles CDI source selection
   */
  private onUpdateCdiSelect = (source: NavSourceId): void => {
    switch (source.type) {
      case NavSourceType.Nav:
        this.activeSourceIndex = source.index - 1;  // 0 or 1

        // Auto-slew OBS for localizer
        if (this.navStates[this.activeSourceIndex].isLocalizer) {
          this.slewObs();
        }
        break;

      case NavSourceType.Gps:
        this.activeSourceIndex = 2;
        break;
    }

    this.updateSensitivity();
    this.updateComponentsDisplay();
  };

  /**
   * Updates active sensitivity based on source
   */
  private updateSensitivity(): void {
    const activeState = this.navStates[this.activeSourceIndex];

    switch (activeState.source.type) {
      case NavSourceType.Nav:
        if (activeState.isLocalizer) {
          this.activeSensitivity = NavSensitivity.ILS;
        } else {
          this.activeSensitivity = NavSensitivity.VOR;
        }
        break;

      case NavSourceType.Gps:
        this.setGpsSensitivity();
        break;
    }
  }

  /**
   * Gets active nav state
   */
  public getActiveNavState(): HsiSource {
    return this.navStates[this.activeSourceIndex];
  }
}

/**
 * HSI source data structure
 */
interface HsiSource {
  source: NavSourceId;
  valid: boolean;
  bearing: number | null;
  distance: number | null;
  deviation: number | null;             // -1 to +1
  deviationScale: number;               // NM for full-scale
  deviationScaleLabel: CDIScaleLabel;
  toFrom: VorToFrom;
  dtk_obs: number | null;               // Course (DTK or OBS)
  isLocalizer: boolean;
  hasSignal: boolean;
  hasLocalizer: boolean;
  localizerCourse: number | null;
  hasGlideslope: boolean;
  gsDeviation: number | null;
}
```

---

## 4. 🛩️ G1000 NXi Implementation

### HSI Course Deviation Display

**File:** `src/workingtitle-instruments-g1000/html_ui/PFD/Components/HSI/HSIMapCourseDeviation.tsx`

```typescript
export class HSIMapCourseDeviation extends DisplayComponent<HSIMapCourseDeviationProps> {
  private readonly hsiMapDeviationRef = FSComponent.createRef<HTMLDivElement>();
  private readonly diamondIndicatorRef = FSComponent.createRef<HTMLDivElement>();

  private currentDeviation: number = 0;
  private currentToFrom: VorToFrom = VorToFrom.OFF;

  /**
   * Sets the lateral deviation
   * @param deviation Normalized deviation (-1 to +1)
   */
  public setDeviation(deviation: number): void {
    this.currentDeviation = deviation;

    // Convert to pixels (90.5 pixels = full-scale)
    const deviationPixels = NavMath.clamp(deviation, -1, 1) * 90.5;

    if (deviation >= -1 && deviation <= 1) {
      // Show deviation bar
      this.hsiMapDeviationRef.instance.style.display = '';
      this.hsiMapDeviationRef.instance.style.transform =
        `translate3d(${deviationPixels}px, 0px, 0px)`;
    } else {
      // Hide when out of range
      this.hsiMapDeviationRef.instance.style.display = 'none';
    }
  }

  /**
   * Sets the TO/FROM indicator
   */
  public setFromTo(toFrom: VorToFrom): void {
    this.currentToFrom = toFrom;

    if (toFrom === VorToFrom.FROM) {
      // Rotate triangle 180°
      this.diamondIndicatorRef.instance.style.transform =
        'rotate3d(0, 0, 1, 180deg)';
    } else {
      this.diamondIndicatorRef.instance.style.transform =
        'rotate3d(0, 0, 1, 0deg)';
    }

    // Show/hide based on signal
    this.diamondIndicatorRef.instance.style.display =
      toFrom === VorToFrom.OFF ? 'none' : '';
  }

  public render(): VNode {
    return (
      <div class="hsi-map-course-deviation-container">
        {/* Deviation scale (5 dots) */}
        <div class="deviation-dots">
          <div class="dot left-2"></div>
          <div class="dot left-1"></div>
          <div class="dot center"></div>
          <div class="dot right-1"></div>
          <div class="dot right-2"></div>
        </div>

        {/* Deviation bar */}
        <div
          ref={this.hsiMapDeviationRef}
          class="deviation-bar"
        >
          {/* TO/FROM indicator */}
          <div
            ref={this.diamondIndicatorRef}
            class="to-from-triangle"
          />
        </div>
      </div>
    );
  }
}
```

### Course Needle Rotation:

```typescript
export class HSICourseNeedle extends DisplayComponent<HSICourseNeedleProps> {
  private readonly needleRef = FSComponent.createRef<HTMLDivElement>();

  public setCourse(course: number): void {
    // Rotate entire needle assembly
    this.needleRef.instance.style.transform =
      `rotate3d(0, 0, 1, ${course}deg)`;
  }

  public render(): VNode {
    return (
      <div ref={this.needleRef} class="course-needle">
        {/* Needle head (points to course) */}
        <div class="needle-head" />

        {/* Needle tail (opposite direction) */}
        <div class="needle-tail" />

        {/* Deviation bar container (moves with needle) */}
        <HSIMapCourseDeviation ref={this.deviationRef} />
      </div>
    );
  }
}
```

**Visual Layout:**
- **Scale**: 90.5 pixels = full-scale (±1.0 deviation)
- **Dots**: 5 dots (2.5 per side)
- **Dot spacing**: ~18.1 pixels per dot
- **Center line**: Fixed vertical line

**Files:**
- `src/workingtitle-instruments-g1000/html_ui/PFD/Components/HSI/HSI.tsx`
- `src/workingtitle-instruments-g1000/html_ui/PFD/Components/HSI/HSIMapCourseDeviation.tsx`
- `src/workingtitle-instruments-g1000/html_ui/PFD/Components/HSI/HSIRose.tsx`

---

## 5. 🎨 G3000/G5000 Implementation

### NavReferenceIndicator Pattern

**File:** `src/workingtitle-instruments-g3000/html_ui/PFD/Components/HSI/ActiveNavNeedle.tsx`

The G3000 uses a more modular **NavReferenceIndicator** pattern:

```typescript
export class ActiveNavNeedle extends DisplayComponent<ActiveNavNeedleProps> {
  private readonly needleRotation = Subject.create(0);
  private readonly lateralDeviation = Subject.create<number | null>(null);
  private readonly toFrom = Subject.create(VorToFrom.OFF);

  public onAfterRender(): void {
    // Subscribe to active nav indicator
    const indicator = this.props.dataProvider.activeNavIndicator;

    // Course rotation
    indicator.course.sub(course => {
      if (course !== null) {
        this.needleRotation.set(course);
      }
    }, true);

    // Lateral deviation
    indicator.lateralDeviation.sub(deviation => {
      this.lateralDeviation.set(deviation);
    }, true);

    // TO/FROM
    indicator.toFrom.sub(toFrom => {
      this.toFrom.set(toFrom ?? VorToFrom.OFF);
    }, true);
  }

  public render(): VNode {
    return (
      <div
        class="active-nav-needle"
        style={{
          transform: this.needleRotation.map(rot => `rotate(${rot}deg)`)
        }}
      >
        {/* Needle path */}
        <svg class="needle-svg">
          <path d="M 0,-200 L 0,200" stroke="magenta" stroke-width="2" />
        </svg>

        {/* Deviation bar */}
        <div
          class="deviation-bar"
          style={{
            transform: this.lateralDeviation.map(dev => {
              if (dev === null) return 'translate3d(0, 0, 0)';
              const pixels = NavMath.clamp(dev, -1, 1) * 90;
              return `translate3d(${pixels}px, 0, 0)`;
            })
          }}
        >
          {/* TO/FROM triangle */}
          <div
            class="to-from-indicator"
            style={{
              transform: this.toFrom.map(tf =>
                tf === VorToFrom.FROM ? 'rotate(180deg)' : 'rotate(0deg)'
              ),
              display: this.toFrom.map(tf =>
                tf === VorToFrom.OFF ? 'none' : ''
              )
            }}
          />
        </div>
      </div>
    );
  }
}
```

### HsiDataProvider:

```typescript
export interface HsiDataProvider {
  readonly activeNavIndicator: NavReferenceIndicator;
  readonly previewNavIndicator: NavReferenceIndicator;
  readonly bearingPointer1: NavReferenceIndicator;
  readonly bearingPointer2: NavReferenceIndicator;
}

// Components consume from data provider
const activeSource = dataProvider.activeNavIndicator;

activeSource.lateralDeviation.sub(deviation => {
  // Update CDI display
});
```

**Advanced Features:**
- **Preview needle** - Shows armed approach course
- **Dual needles** - Active + preview simultaneously
- **Smooth animations** - NeedleAnimator for rotation
- **Color coding** - Magenta (active), Cyan (armed), White (inactive)

**Files:**
- `src/workingtitle-instruments-g3000/html_ui/PFD/Components/HSI/Hsi.tsx`
- `src/workingtitle-instruments-g3000/html_ui/PFD/Components/HSI/ActiveNavNeedle.tsx`
- `src/workingtitle-instruments-g3000/html_ui/PFD/Components/HSI/ApproachPreviewNeedle.tsx`
- `src/workingtitle-instruments-g3000/html_ui/PFD/Components/HSI/DefaultHsiDataProvider.ts`

---

## 6. 📱 G3X Touch Implementation

### Upper Deviation Indicator

**File:** `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HSI/HsiUpperDeviationIndicator.tsx`

```typescript
export class HsiUpperDeviationIndicator extends DisplayComponent<HsiUpperDeviationIndicatorProps> {
  private readonly pointerTransform = CssTransformSubject.create(
    CssTransformBuilder.translate3d('px')
  );

  public onAfterRender(): void {
    // Subscribe to lateral deviation
    this.props.lateralDeviation.sub(deviation => {
      if (deviation === null) {
        this.setVisible(false);
        return;
      }

      this.setVisible(true);

      // Calculate pixel offset
      // Scale: 2 dots = 40% of width
      const width = this.props.width;
      const twoDotPx = 2 * (width / 5);  // Each dot is 20% width

      // Clamp deviation to ±1.25 (allows slight over-scale)
      const deviationPx = MathUtils.clamp(deviation, -1.25, 1.25) * twoDotPx;

      // Update transform
      this.pointerTransform.transform.set(deviationPx, 0, 0);
    }, true);
  }

  public render(): VNode {
    const width = this.props.width;
    const height = this.props.height;
    const dotSize = height * 0.15;

    return (
      <div class="upper-deviation-indicator">
        <svg viewBox={`0 0 ${width} ${height}`}>
          {/* Deviation dots */}
          <circle cx={width / 10} cy={height / 2} r={dotSize / 2} class="dot" />
          <circle cx={3 * width / 10} cy={height / 2} r={dotSize / 2} class="dot" />
          <circle cx={7 * width / 10} cy={height / 2} r={dotSize / 2} class="dot" />
          <circle cx={9 * width / 10} cy={height / 2} r={dotSize / 2} class="dot" />

          {/* Center line */}
          <line
            x1={width / 2}
            y1={0}
            x2={width / 2}
            y2={height}
            class="center-line"
          />

          {/* Deviation pointer */}
          <g
            transform={this.pointerTransform}
            transform-origin={`${width / 2} ${height / 2}`}
          >
            {this.props.symbolType.map(type => {
              if (type === 'triangle') {
                // VOR navigation
                return (
                  <path
                    d={`M ${width / 2},${height * 0.2} L ${width / 2 - 5},${height * 0.35} L ${width / 2 + 5},${height * 0.35} Z`}
                    class="pointer-triangle"
                  />
                );
              } else {
                // GPS/RNAV navigation
                return (
                  <path
                    d={`M ${width / 2},${height * 0.2} L ${width / 2 - 4},${height / 2} L ${width / 2},${height * 0.8} L ${width / 2 + 4},${height / 2} Z`}
                    class="pointer-diamond"
                  />
                );
              }
            })}
          </g>
        </svg>
      </div>
    );
  }
}
```

**Symbol Types:**
- **Triangle** - VOR/LOC navigation
- **Diamond** - GPS/RNAV approaches

**Files:**
- `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HSI/Hsi.tsx`
- `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HSI/HsiUpperDeviationIndicator.tsx`
- `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HSI/HsiCourseNeedle.tsx`

---

## 7. ✈️ WT21 Implementation

### Course Needle with Deviation

**File:** `src/workingtitle-instruments-wt21/shared/LowerSection/HSI/HSICourseNeedle.tsx`

```typescript
export class HSICourseNeedle extends DisplayComponent<HSICourseNeedleProps> {
  private readonly courseNeedleRef = FSComponent.createRef<SVGElement>();
  private readonly deviationBarRef = FSComponent.createRef<SVGLineElement>();

  private handleDeviation = (deviation: number): void => {
    // Calculate pixel offset
    // Scale: innerRadius * 2/3 = full-scale deviation
    const deviationPx = deviation * ((this.props.innerRadius / 3) * 2);

    // Update deviation bar position
    this.deviationBarRef.instance.setAttribute('transform',
      `translate(${deviationPx}, 0)`
    );
  };

  private handleCourse = (course: number): void => {
    // Rotate entire needle group
    this.courseNeedleRef.instance.setAttribute('transform',
      `rotate(${course} ${this.props.cx} ${this.props.cy})`
    );
  };

  public render(): VNode {
    return (
      <g ref={this.courseNeedleRef}>
        {/* Needle line */}
        <line
          x1={this.props.cx}
          y1={this.props.cy - this.props.innerRadius}
          x2={this.props.cx}
          y2={this.props.cy + this.props.innerRadius}
          class="course-needle-line"
        />

        {/* Deviation bar */}
        <line
          ref={this.deviationBarRef}
          x1={this.props.cx}
          y1={this.props.cy - 20}
          x2={this.props.cx}
          y2={this.props.cy + 20}
          class="deviation-bar"
        />

        {/* TO/FROM arrow */}
        <path
          d={this.toFromArrowPath}
          class="to-from-arrow"
        />
      </g>
    );
  }
}
```

**Files:**
- `src/workingtitle-instruments-wt21/shared/LowerSection/HSI/HSICourseNeedle.tsx`
- `src/workingtitle-instruments-wt21/shared/LowerSection/HSI/HSI.tsx`

---

## 8. 🎮 OBS Course Selection

### OBS Knob Handling

**File:** `src/garminsdk/navigation/NavIndicatorController.ts`

```typescript
export class NavIndicatorController {
  /**
   * Handles OBS knob rotation
   */
  private onUpdateDtk = (obs: ObsSetting): void => {
    if (obs.source.type === NavSourceType.Nav) {
      // VOR OBS setting
      const index = obs.source.index - 1;  // 0 or 1
      this.navStates[index].dtk_obs = obs.heading;
    } else if (obs.source.type === NavSourceType.Gps) {
      // GPS OBS mode
      this.navStates[2].dtk_obs = obs.heading;
    }

    this.updateComponentsDisplay();
  };

  /**
   * Auto-slews OBS to localizer course
   */
  private slewObs(): void {
    const index = this.activeSourceIndex;
    const state = this.navStates[index];

    if (index < 2 &&  // Nav1 or Nav2
        state.isLocalizer &&
        state.hasLocalizer &&
        state.localizerCourse !== null) {

      // Set OBS to LOC inbound course
      SimVar.SetSimVarValue(
        `K:VOR${index + 1}_SET`,
        'number',
        Math.round(state.localizerCourse)
      );
    }
  }
}
```

### OBS/SUSP Modes:

```typescript
enum ObsSuspModes {
  NONE = 0,  // Normal LNAV tracking
  SUSP = 1,  // Suspend (holding position)
  OBS = 2    // Manual OBS mode (select course)
}

// GPS OBS mode activation
private onGpsObsActive = (active: boolean): void => {
  if (active) {
    this.obsSuspMode = ObsSuspModes.OBS;
    // Can manually rotate course with OBS knob
  } else {
    this.obsSuspMode = ObsSuspModes.NONE;
    // Auto-sequencing to next waypoint
  }
};
```

---

## 9. 📊 Deviation Calculation Examples

### GPS Example:

```typescript
// Flight scenario
const xtk = 0.5;           // 0.5 NM right of course
const scale = 2.0;         // Enroute mode (2 NM full-scale)

// Calculation
const deviation = -xtk / scale;
// = -0.5 / 2.0
// = -0.25

// Result: -0.25 (needle deflects 25% to the LEFT)
// Meaning: Aircraft is right of course, fly left to correct

// Visual display
const pixels = deviation * 90.5;  // Assuming 90.5px full-scale
// = -0.25 * 90.5
// = -22.625 pixels (left of center)
```

### VOR Example:

```typescript
// SimVar input
const navCdi = 64;  // MSFS CDI value (half-scale right)

// Normalization
const deviation = navCdi / 127;
// = 64 / 127
// = 0.504

// Result: +0.504 (needle deflects 50% to the RIGHT)
// Meaning: Aircraft is left of course, fly right to correct

// Visual display
const pixels = deviation * 90.5;
// = 0.504 * 90.5
// = 45.6 pixels (right of center)
```

### Scale Transition Example:

```typescript
// Approaching FAF on RNAV approach
const distanceToFaf = 10.0;  // 10 NM from FAF

// Scale calculation (transition zone)
let scale: number;
if (distanceToFaf < 2.0) {
  scale = 0.3;  // Inside FAF
} else if (distanceToFaf < 30.0) {
  // Linear interpolation
  const ratio = (distanceToFaf - 2.0) / 28.0;  // 0 to 1
  scale = 0.3 + (ratio * 0.7);
  // = 0.3 + ((10 - 2) / 28) * 0.7
  // = 0.3 + (0.286 * 0.7)
  // = 0.3 + 0.2
  // = 0.5 NM
} else {
  scale = 1.0;  // Terminal
}

// XTK remains constant, but deviation changes with scale
const xtk = 0.15;  // 0.15 NM right
const deviation = -xtk / scale;
// = -0.15 / 0.5
// = -0.3 (30% deflection)

// Closer to FAF (scale = 0.3):
// deviation = -0.15 / 0.3 = -0.5 (50% deflection)
// More sensitive!
```

---

## 10. 🔌 Autopilot Integration

### NAV Mode:

```typescript
// Autopilot NAV mode reads active CDI
class NavDirector extends APLateralDirector {
  private readonly navIndicator: NavIndicatorController;

  public update(): void {
    const activeState = this.navIndicator.getActiveNavState();
    const deviation = activeState.deviation;
    const course = activeState.dtk_obs;

    if (deviation !== null && course !== null) {
      // Compute bank command to track course
      const bankCommand = this.computeBankCommand(
        deviation,
        activeState.deviationScale
      );

      this.setBank(bankCommand);
    }
  }

  private computeBankCommand(deviation: number, scale: number): number {
    // Simple proportional control
    const trackError = deviation * scale;  // Convert to NM
    const bankPerNm = 5;  // 5° bank per NM error

    return MathUtils.clamp(
      trackError * bankPerNm,
      -25,  // Max bank
      25
    );
  }
}
```

### GPS Steering (GPSS):

```typescript
// GPSS bypasses CDI, reads LNAV track directly
class GpssDirector extends APLateralDirector {
  private readonly lnavXtk = ConsumerSubject.create(null, 0);
  private readonly lnavDtk = ConsumerSubject.create(null, 0);

  public update(): void {
    const xtk = this.lnavXtk.get();
    const dtk = this.lnavDtk.get();

    // Direct track-angle error control
    const bankCommand = this.computeBankFromXtk(xtk, dtk);
    this.setBank(bankCommand);
  }
}
```

---

## 11. 📚 Common Patterns

### NavReferenceIndicator Pattern (Recommended):

```typescript
// Define your nav sources
const navSources = new Map<string, NavReferenceSource>();
navSources.set('GPS', new GpsNavSource(bus));
navSources.set('NAV1', new NavRadioNavSource(bus, 1));
navSources.set('NAV2', new NavRadioNavSource(bus, 2));

// Create indicator
const activeNavIndicator = new NavReferenceIndicator(bus, 'activeNav');

// Set active source
activeNavIndicator.setSource('GPS');

// Components consume from indicator
activeNavIndicator.lateralDeviation.sub(deviation => {
  this.updateCdiNeedle(deviation);
});

activeNavIndicator.course.sub(course => {
  this.updateCourseNeedle(course);
});
```

### Data Provider Pattern:

```typescript
export class HsiDataProvider {
  public readonly activeNavIndicator: NavReferenceIndicator;
  public readonly bearing Pointer1: NavReferenceIndicator;
  public readonly bearingPointer2: NavReferenceIndicator;

  constructor(
    bus: EventBus,
    sources: Map<string, NavReferenceSource>
  ) {
    this.activeNavIndicator = new NavReferenceIndicator(bus, 'active');
    this.bearingPointer1 = new NavReferenceIndicator(bus, 'brg1');
    this.bearingPointer2 = new NavReferenceIndicator(bus, 'brg2');
  }
}

// Usage in components
const dataProvider = new HsiDataProvider(bus, sources);

<ActiveNavNeedle dataProvider={dataProvider} />
<BearingPointer index={1} dataProvider={dataProvider} />
```

---

## 12. 💡 Implementation Tips

### Starting Your Own CDI:

**1. Set Up Nav Sources:**

```typescript
// Create GPS source
const gpsSource = new GpsNavSource(bus);

// Create VOR sources
const nav1Source = new NavRadioNavSource(bus, 1);
const nav2Source = new NavRadioNavSource(bus, 2);

// Store in map
const navSources = new Map([
  ['GPS', gpsSource],
  ['NAV1', nav1Source],
  ['NAV2', nav2Source]
]);
```

**2. Create Indicator Controller:**

```typescript
const navIndicator = new NavIndicatorController(bus);

// Subscribe to source selection
bus.getSubscriber<ControlEvents>()
  .on('cdi_src_set')
  .handle(source => {
    navIndicator.setActiveSource(source);
  });
```

**3. Implement Visual CDI:**

```typescript
export class CdiNeedle extends DisplayComponent<CdiNeedleProps> {
  private readonly deviation = Subject.create(0);
  private readonly course = Subject.create(0);
  private readonly toFrom = Subject.create(VorToFrom.OFF);

  public onAfterRender(): void {
    const activeState = this.props.navIndicator.getActiveNavState();

    // Subscribe to deviation
    activeState.deviation.sub(dev => {
      this.deviation.set(dev ?? 0);
    });

    // Subscribe to course
    activeState.dtk_obs.sub(course => {
      this.course.set(course ?? 0);
    });

    // Subscribe to TO/FROM
    activeState.toFrom.sub(tf => {
      this.toFrom.set(tf);
    });
  }

  public render(): VNode {
    return (
      <div
        class="course-needle"
        style={{
          transform: this.course.map(c => `rotate(${c}deg)`)
        }}
      >
        {/* Deviation bar */}
        <div
          class="deviation-bar"
          style={{
            transform: this.deviation.map(d => {
              const pixels = d * 90;  // 90px full-scale
              return `translate3d(${pixels}px, 0, 0)`;
            })
          }}
        >
          {/* TO/FROM indicator */}
          <div
            class="to-from-arrow"
            style={{
              transform: this.toFrom.map(tf =>
                tf === VorToFrom.FROM ? 'rotate(180deg)' : 'rotate(0deg)'
              ),
              display: this.toFrom.map(tf =>
                tf === VorToFrom.OFF ? 'none' : ''
              )
            }}
          />
        </div>
      </div>
    );
  }
}
```

**4. Add Scale Annunciator:**

```typescript
export class CdiScaleLabel extends DisplayComponent<CdiScaleLabelProps> {
  private readonly scaleLabel = Subject.create('');

  public onAfterRender(): void {
    this.props.deviationScaleLabel.sub(label => {
      this.scaleLabel.set(this.formatLabel(label));
    });
  }

  private formatLabel(label: CDIScaleLabel): string {
    switch (label) {
      case CDIScaleLabel.Enroute: return 'ENR';
      case CDIScaleLabel.Terminal: return 'TERM';
      case CDIScaleLabel.Approach: return 'APPR';
      case CDIScaleLabel.Departure: return 'DPRT';
      case CDIScaleLabel.LPV: return 'LPV';
      default: return '';
    }
  }

  public render(): VNode {
    return (
      <div class="scale-label">
        {this.scaleLabel}
      </div>
    );
  }
}
```

---

## 13. 📊 Implementation Comparison Table

| Aspect | G1000 | G3000 | G3X Touch | WT21 | Epic2 |
|--------|-------|-------|-----------|------|-------|
| **Complexity** | Medium | High | Medium-High | Medium | High |
| **Pattern** | Direct HSI | NavReferenceIndicator | NavReferenceIndicator | Direct HSI | NavSource pattern |
| **Visual Style** | Traditional HSI | Modern PFD | Compact HSI | Business jet | Glass cockpit |
| **Scale Display** | Dots + label | Dots + label | Dots + label | Dots | Integrated |
| **Preview Needle** | No | Yes | No | Yes | No |
| **Bearing Pointers** | 2 | 2 | 2 | 2 | 2 |
| **Symbol Type** | Triangle | Triangle/Diamond | Triangle/Diamond | Triangle | Diamond |
| **Best For** | Learning basics | Advanced features | Touch interfaces | Classic HSI | Modern glass |

---

## 14. 📚 Key Files Reference

### Core Navigation:
- `src/garminsdk/navigation/NavIndicatorController.ts` - Main controller
- `src/garminsdk/navigation/NavdataComputer.ts` - Scale calculation
- `src/garminsdk/navreference/NavReferenceBase.ts` - Base interface
- `src/garminsdk/navreference/source/GpsNavSource.ts` - GPS source
- `src/garminsdk/navreference/source/NavRadioNavSource.ts` - VOR/LOC source

### G1000:
- `src/workingtitle-instruments-g1000/html_ui/PFD/Components/HSI/HSI.tsx`
- `src/workingtitle-instruments-g1000/html_ui/PFD/Components/HSI/HSIMapCourseDeviation.tsx`
- `src/workingtitle-instruments-g1000/html_ui/PFD/Components/HSI/HSIRose.tsx`

### G3000:
- `src/workingtitle-instruments-g3000/html_ui/PFD/Components/HSI/Hsi.tsx`
- `src/workingtitle-instruments-g3000/html_ui/PFD/Components/HSI/ActiveNavNeedle.tsx`
- `src/workingtitle-instruments-g3000/html_ui/PFD/Components/HSI/DefaultHsiDataProvider.ts`

### G3X Touch:
- `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HSI/Hsi.tsx`
- `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HSI/HsiCourseNeedle.tsx`
- `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HSI/HsiUpperDeviationIndicator.tsx`

### WT21:
- `src/workingtitle-instruments-wt21/shared/LowerSection/HSI/HSICourseNeedle.tsx`
- `src/workingtitle-instruments-wt21/shared/LowerSection/HSI/HSI.tsx`

---

This guide demonstrates how multiple navigation sources, dynamic scaling, and complex deviation calculations work together in the Garmin SDK. The CDI/Course Indicator is an excellent learning component that showcases data provider patterns, source switching, and real-time sensitivity adjustments!
