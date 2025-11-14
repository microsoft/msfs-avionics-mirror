# Complete Guide: Heading Bug Indicator Implementation in Garmin Instruments

A comprehensive walkthrough of heading bug indicator implementations across all Garmin instruments, covering both display rendering and user interaction patterns.

---

## 📊 Overview: What is a Heading Bug?

The **heading bug** (also called heading select bug) is a visual marker on the compass rose that displays the pilot's selected target heading. It's a critical component for:

- **Manual heading reference** - Visual target for hand-flying
- **Autopilot HDG mode** - Target heading for autopilot to track
- **Flight planning** - Quick reference for desired course

### Visual Behavior:

- **White/Cyan** - Selected heading not actively tracked by autopilot
- **Magenta** - Autopilot HDG mode actively tracking this heading
- **Position** - Rotates around compass rose to selected heading value

### User Interactions:

- **Heading knob rotation** - Increment/decrement selected heading
- **Heading sync button** - Set bug to current magnetic heading
- **Touch input** (G3X) - Direct numeric entry via dialog

---

## 🔄 Complete Data Flow

```
User Input (Knob/Button/Touch)
    ↓
Key Events (H:HEADING_BUG_INC/DEC/SET)
    ↓
SimVar: AUTOPILOT HEADING LOCK DIR
    ↓
APPublisher (SDK)
    ↓
EventBus Topic: ap_heading_selected
    ↓
ConsumerSubject in Component
    ↓
Visual Rendering (SVG transform)
```

### Autopilot Integration:

```
AP Mode (ap_lateral_active)
    ↓
Check if mode is HeadingSelect or TrackSelect
    ↓
Change bug color: White → Magenta
```

---

## 1. 🎯 Data Source Foundation

### SimVar Storage

**Location:** MSFS Simulator
**SimVar:** `AUTOPILOT HEADING LOCK DIR` (degrees, 0-359)

This SimVar is:
- **Persistent** - Automatically saved/restored with aircraft state
- **Writable** - Can be set via `SimVar.SetSimVarValue()`
- **Indexed** - Supports multiple autopilot systems (autopilot index)

### APPublisher (SDK)

**File:** `src/sdk/instruments/APPublisher.ts`

```typescript
// Publishes autopilot-related SimVars to EventBus
class APPublisher extends SimVarPublisher<APEvents> {
  // SimVar definitions
  private static simvars = new Map<keyof APEvents, SimVarDefinition>([
    ['ap_heading_selected', { name: 'AUTOPILOT HEADING LOCK DIR:#index#', type: SimVarValueType.Degree }],
    ['ap_lateral_active', { name: 'AUTOPILOT NAV SELECTED:#index#', type: SimVarValueType.Number }],
    // ... more AP-related simvars
  ]);
}

// Published Events
interface APEvents {
  ap_heading_selected: number;        // Selected heading (0-359°)
  ap_lateral_active: APLateralModes;  // Active lateral mode
  // ... more events
}

enum APLateralModes {
  NONE,
  WING_LEVELER,
  HEADING,      // ← Bug is magenta when this is active
  VOR,
  LOC,
  BC,
  ROLL,
  LEVEL,
  GPSS,
  FMS,
  NAV,
  TRACK         // ← Or this (track mode)
}
```

### Event Bus Distribution

```typescript
// Any component can subscribe to heading bug value
const sub = bus.getSubscriber<APEvents>();

sub.on('ap_heading_selected').handle(heading => {
  console.log('Selected heading:', heading); // 0-359
});

sub.on('ap_lateral_active').handle(mode => {
  const isBugActive = mode === APLateralModes.HEADING || mode === APLateralModes.TRACK;
  console.log('Bug is magenta:', isBugActive);
});
```

---

## 2. 🛩️ Epic2 Implementation (Clearest Example)

### Heading Bug Component

**File:** `src/workingtitle-instruments-epic2/instruments/html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/PFD/Components/HSI/HeadingBug.tsx` (201 lines)

This is one of the **clearest implementations** to study.

### Architecture:

```typescript
interface HeadingBugProps {
  bus: EventBus;
  selectedHeading: Subscribable<number>;     // From ap_heading_selected
  magneticHeading: Subscribable<number>;     // Current heading from AHRS
  lateralActive: Subscribable<APLateralModes>; // AP mode
  rotationRadius: number;                    // Distance from compass center
}

export class HeadingBug extends DisplayComponent<HeadingBugProps> {
  private readonly headingBugRef = FSComponent.createRef<HTMLDivElement>();

  // Reactive calculation: rotation = selected - current
  private readonly rotationDeg = MappedSubject.create(
    ([selectedHeading, magneticHeading]) => selectedHeading - magneticHeading,
    this.props.selectedHeading,
    this.props.magneticHeading
  );

  // Color state based on AP mode
  private readonly isActive = this.props.lateralActive.map(mode =>
    mode === APLateralModes.HEADING || mode === APLateralModes.TRACK
  );

  public onAfterRender(): void {
    // Update rotation when heading changes
    this.rotationDeg.sub(rotation => {
      this.headingBugRef.instance.style.transform = `rotate(${rotation}deg)`;
    }, true);

    // Update color when AP mode changes
    this.isActive.sub(active => {
      this.headingBugRef.instance.classList.toggle('active', active);
    }, true);
  }

  public render(): VNode {
    return (
      <div
        ref={this.headingBugRef}
        class="heading-bug"
        style={{
          transformOrigin: `50% ${this.props.rotationRadius}px`,
          position: 'absolute',
          top: '50%',
          left: '50%'
        }}
      >
        {/* SVG bug symbol */}
        <svg viewBox="0 0 20 20">
          <path d="M 10,0 L 5,8 L 15,8 Z" class="bug-triangle" />
        </svg>
      </div>
    );
  }
}
```

### CSS Styling:

```css
.heading-bug {
  pointer-events: none;
  transition: transform 0.1s ease-out;
}

.heading-bug .bug-triangle {
  fill: white;
  stroke: black;
  stroke-width: 0.5;
}

.heading-bug.active .bug-triangle {
  fill: magenta;  /* When AP HDG mode active */
}
```

### Key Concepts:

1. **Relative Rotation** - Bug rotates relative to rotating compass rose
   - `rotation = selectedHeading - currentHeading`
   - As compass rotates with aircraft, bug stays at selected heading

2. **Transform Origin** - Rotation point is offset from element center
   - `transformOrigin: '50% ${radius}px'`
   - Creates circular motion around compass center

3. **Reactive Updates** - MappedSubject automatically recalculates
   - Changes to either selected or current heading trigger update
   - No manual computation needed

4. **Visual State** - CSS class toggle for color change
   - Simple, declarative approach
   - No manual style manipulation

---

## 3. 📱 G1000 NXi Implementation

### HSI Rose Component

**File:** `src/workingtitle-instruments-g1000/html_ui/PFD/Components/HSI/HSIRose.tsx`

The G1000 uses a simpler **absolute rotation** approach.

### Heading Bug Rendering:

```typescript
export class HSIRose extends DisplayComponent<HSIRoseProps> {
  private readonly hdgBugRotation = Subject.create(0);
  private readonly hdgBugColor = Subject.create('white');

  public onAfterRender(): void {
    // Subscribe to selected heading
    this.props.selectedHeading.sub(hdg => {
      this.hdgBugRotation.set(hdg);
    });

    // Subscribe to AP mode for color
    this.props.apMode.sub(mode => {
      const isActive = mode === APLateralModes.HEADING;
      this.hdgBugColor.set(isActive ? 'magenta' : 'white');
    });
  }

  public render(): VNode {
    return (
      <div class="hsi-rose">
        {/* Compass rose rotates with aircraft heading */}
        <div class="rose-card" style={...}>
          {/* Cardinal directions, tick marks, etc. */}
        </div>

        {/* Heading bug - absolute position */}
        <svg class="heading-bug-container">
          <g
            transform={this.hdgBugRotation.map(hdg => `rotate(${hdg} 256 256)`)}
          >
            <path
              d="M 256,20 L 248,35 L 264,35 Z"
              fill={this.hdgBugColor}
              stroke="black"
            />
          </g>
        </svg>
      </div>
    );
  }
}
```

### Differences from Epic2:

| Aspect | Epic2 | G1000 |
|--------|-------|-------|
| **Rotation** | Relative (selected - current) | Absolute (selected heading) |
| **Compass** | Rotates with aircraft | Fixed or rotates separately |
| **Transform** | CSS `style.transform` | SVG `transform` attribute |
| **Color** | CSS class toggle | Direct fill attribute |

### Data Provider Pattern (G1000):

```typescript
// HsiDataProvider aggregates all HSI-related data
export class HsiDataProvider {
  public readonly selectedHeading = ConsumerSubject.create<number>(null, 0);
  public readonly magneticHeading = ConsumerSubject.create<number>(null, 0);
  public readonly apLateralMode = ConsumerSubject.create<APLateralModes>(null, APLateralModes.NONE);

  constructor(bus: EventBus) {
    const ap = bus.getSubscriber<APEvents>();
    const ahrs = bus.getSubscriber<AhrsEvents>();

    this.selectedHeading.setConsumer(ap.on('ap_heading_selected'));
    this.magneticHeading.setConsumer(ahrs.on('hdg_deg'));
    this.apLateralMode.setConsumer(ap.on('ap_lateral_active'));
  }
}
```

**Files:**
- `src/workingtitle-instruments-g1000/html_ui/PFD/Components/HSI/HSIRose.tsx`
- `src/workingtitle-instruments-g1000/html_ui/PFD/Components/HSI/HSIContainer.tsx`

---

## 4. 🎨 G3000/G5000 Implementation

### Advanced HSI Rose

**File:** `src/workingtitle-instruments-g3000/html_ui/MFD/WTG3000_MFD/Components/HSI/HsiRose.tsx` (768 lines)

The G3000 has the most **sophisticated implementation** with:
- Magnetic variation correction
- Multiple reference sources
- Touch interaction support
- Advanced visual states

### Complex State Management:

```typescript
export class HsiRose extends DisplayComponent<HsiRoseProps> {
  // Selected heading with magnetic variation correction
  private readonly selectedHeadingMag = MappedSubject.create(
    ([selectedHeading, magVar, useMagneticHeading]) => {
      if (useMagneticHeading) {
        return selectedHeading;
      } else {
        // Convert true to magnetic
        return MagVar.trueToMagnetic(selectedHeading, magVar);
      }
    },
    this.props.selectedHeading,
    this.props.magVar,
    this.props.useMagneticHeading
  );

  // Bug rotation relative to compass (which may be rotating)
  private readonly headingBugRotation = MappedSubject.create(
    ([selectedHdg, currentHdg, compassRotation]) => {
      // Account for compass rotation mode
      return selectedHdg - currentHdg + compassRotation;
    },
    this.selectedHeadingMag,
    this.props.heading,
    this.compassRotation
  );

  // Visual state with multiple mode checks
  private readonly headingBugColor = MappedSubject.create(
    ([lateralActive, lateralArmed]) => {
      if (lateralActive === APLateralModes.HEADING ||
          lateralActive === APLateralModes.TRACK) {
        return 'var(--wt-g3000-magenta)';
      } else if (lateralArmed === APLateralModes.HEADING) {
        return 'var(--wt-g3000-white)';
      } else {
        return 'var(--wt-g3000-cyan)';
      }
    },
    this.props.apLateralActive,
    this.props.apLateralArmed
  );
}
```

### Rendering:

```typescript
public render(): VNode {
  return (
    <div class="hsi-rose-container">
      {/* Rotating compass card */}
      <div
        class="compass-rose"
        style={{
          transform: this.compassRotation.map(rot => `rotate(${rot}deg)`)
        }}
      >
        {/* Compass markings */}
      </div>

      {/* Heading bug */}
      <svg class="heading-bug-svg">
        <g
          transform={this.headingBugRotation.map(rot =>
            `rotate(${rot} ${centerX} ${centerY})`
          )}
        >
          <path
            class="heading-bug-path"
            d="M 256,30 L 248,45 L 264,45 Z"
            fill={this.headingBugColor}
            stroke="black"
            stroke-width="1.5"
          />
        </g>
      </svg>
    </div>
  );
}
```

### Advanced Features:

1. **Magnetic Variation Handling**
   - Supports both true and magnetic heading modes
   - Automatic conversion based on setting

2. **Multiple Visual States**
   - Active (magenta) - HDG mode tracking
   - Armed (white) - HDG mode armed
   - Inactive (cyan) - Not in use

3. **Compass Rotation Modes**
   - Arc mode - Compass rotates, bug fixed
   - 360 mode - Compass fixed, bug rotates
   - Rose mode - Both rotate together

**Files:**
- `src/workingtitle-instruments-g3000/html_ui/MFD/WTG3000_MFD/Components/HSI/HsiRose.tsx`
- `src/workingtitle-instruments-g3000/wtg3000common/html_ui/Components/HSI/HsiCommon.tsx`

---

## 5. 🖱️ G3X Touch Implementation

### Touch-Optimized Heading Selection

**File:** `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HSI/Hsi.tsx`

The G3X Touch has unique **dialog-based** heading selection:

### Touch Input Flow:

```typescript
export class Hsi extends DisplayComponent<HsiProps> {
  private readonly selectedHeadingDialogRef = FSComponent.createRef<SelectedHeadingDialog>();

  // Handle touch on heading bug or heading readout
  private onHeadingTouched = (): void => {
    // Open dialog for numeric input
    this.selectedHeadingDialogRef.instance.request({
      initialValue: this.selectedHeading.get(),
      title: 'Selected Heading'
    }).then(result => {
      if (result.wasCancelled) {
        return;
      }

      // Set SimVar directly
      SimVar.SetSimVarValue(
        'AUTOPILOT HEADING LOCK DIR',
        'degrees',
        result.payload
      );
    });
  };

  public render(): VNode {
    return (
      <div class="g3x-hsi">
        {/* HSI display */}
        <HsiRose
          selectedHeading={this.selectedHeading}
          // ... other props
        />

        {/* Touchable heading readout */}
        <TouchButton
          class="heading-readout"
          onPressed={this.onHeadingTouched}
        >
          <div>HDG</div>
          <div>{this.selectedHeading.map(hdg => hdg.toFixed(0).padStart(3, '0'))}</div>
        </TouchButton>

        {/* Heading selection dialog */}
        <SelectedHeadingDialog
          ref={this.selectedHeadingDialogRef}
          bus={this.props.bus}
        />
      </div>
    );
  }
}
```

### SelectedHeadingDialog:

```typescript
export class SelectedHeadingDialog extends AbstractNumberDialog {
  protected getTitle(): string {
    return 'Selected Heading';
  }

  protected getInvalidValueMessage(): string | VNode {
    return 'Invalid Entry\nValue must be between\n1 and 360';
  }

  protected isValueValid(value: number): boolean {
    return value >= 1 && value <= 360;
  }

  protected getPayload(value: number): number {
    return value;
  }
}
```

### Knob Control Configuration:

```typescript
// G3X supports optional heading knob
export enum G3XExternalControlKnobIds {
  Heading = 'heading',
  BaroKnob = 'baro',
  ComKnob = 'com',
  // ...
}

// Configuration in panel.xml
<ExternalControlKnobs>
  <Knob id="heading" />
</ExternalControlKnobs>

// In component
if (this.props.config.hasHeadingKnob) {
  // Subscribe to knob events
  this.knobHandler.register({
    knobId: G3XExternalControlKnobIds.Heading,
    onRotate: this.onHeadingKnobRotated
  });
}

private onHeadingKnobRotated = (direction: 1 | -1): void => {
  const current = this.selectedHeading.get();
  const newHeading = (current + direction + 360) % 360;
  SimVar.SetSimVarValue('AUTOPILOT HEADING LOCK DIR', 'degrees', newHeading);
};
```

**Files:**
- `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HSI/Hsi.tsx`
- `src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/CnsDataBar/CnsDataBarFields/SelectedHeadingDataBarField.tsx`
- `src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/Common/SelectedHeadingDialog.tsx`

---

## 6. ✈️ WT21 Implementation

### Minimal, Focused Implementation

**File:** `src/workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/PFD/Components/HSI/HSIHeadingBug.tsx` (73 lines)

The WT21 has the **most compact** implementation:

```typescript
interface HSIHeadingBugProps {
  bus: EventBus;
}

export class HSIHeadingBug extends DisplayComponent<HSIHeadingBugProps> {
  private readonly bugRef = FSComponent.createRef<SVGGElement>();

  // Simple subjects
  private readonly selectedHeading = Subject.create(0);
  private readonly currentHeading = Subject.create(0);
  private readonly isActive = Subject.create(false);

  public onAfterRender(): void {
    const ap = this.props.bus.getSubscriber<APEvents>();
    const ahrs = this.props.bus.getSubscriber<AhrsEvents>();

    // Direct subscriptions
    ap.on('ap_heading_selected').handle(hdg => {
      this.selectedHeading.set(hdg);
      this.updateBugRotation();
    });

    ahrs.on('hdg_deg').handle(hdg => {
      this.currentHeading.set(hdg);
      this.updateBugRotation();
    });

    ap.on('ap_lateral_active').handle(mode => {
      this.isActive.set(mode === APLateralModes.HEADING);
      this.updateBugColor();
    });
  }

  private updateBugRotation(): void {
    const rotation = this.selectedHeading.get() - this.currentHeading.get();
    this.bugRef.instance.setAttribute('transform', `rotate(${rotation} 256 256)`);
  }

  private updateBugColor(): void {
    const color = this.isActive.get() ? '#d900ff' : 'white';
    this.bugRef.instance.setAttribute('fill', color);
  }

  public render(): VNode {
    return (
      <svg class="heading-bug-svg">
        <g ref={this.bugRef}>
          <path d="M 256,40 L 250,52 L 262,52 Z" />
        </g>
      </svg>
    );
  }
}
```

### Key Simplifications:

- No MappedSubject - Manual update methods
- Direct DOM manipulation - setAttribute instead of reactive bindings
- Minimal state - Just what's needed for display
- No data provider abstraction

**Files:**
- `src/workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/PFD/Components/HSI/HSIHeadingBug.tsx`
- `src/workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/PFD/Components/HSI/HSI.tsx`

---

## 7. 🎮 User Input Handling

### Heading Knob Control

**Key Events** (standard MSFS):
- `H:HEADING_BUG_INC` - Increment selected heading
- `H:HEADING_BUG_DEC` - Decrement selected heading
- `H:HEADING_BUG_SET` - Set to specific value

### APStateManager (G3000 Example)

**File:** `src/workingtitle-instruments-g3000/wtg3000common/html_ui/Autopilot/GarminAPStateManager.ts`

```typescript
export class GarminAPStateManager {
  private keyInterceptManager?: KeyInterceptManager;

  public constructor(bus: EventBus, apConfig: ApConfig) {
    // Intercept key events for custom handling
    this.keyInterceptManager = new KeyInterceptManager(bus);

    // Handle heading bug keys
    this.keyInterceptManager.interceptKey('HEADING_BUG_INC', false);
    this.keyInterceptManager.interceptKey('HEADING_BUG_DEC', false);
    this.keyInterceptManager.interceptKey('HEADING_BUG_SET', false);
  }

  private onHeadingBugInc = (): void => {
    const current = SimVar.GetSimVarValue('AUTOPILOT HEADING LOCK DIR', 'degrees');
    const increment = this.getHeadingIncrement();
    const newHeading = (current + increment) % 360;

    SimVar.SetSimVarValue('AUTOPILOT HEADING LOCK DIR', 'degrees', newHeading);
  };

  private onHeadingBugDec = (): void => {
    const current = SimVar.GetSimVarValue('AUTOPILOT HEADING LOCK DIR', 'degrees');
    const increment = this.getHeadingIncrement();
    const newHeading = (current - increment + 360) % 360;

    SimVar.SetSimVarValue('AUTOPILOT HEADING LOCK DIR', 'degrees', newHeading);
  };

  private getHeadingIncrement(): number {
    // Some aircraft have configurable increments (1° vs 5°)
    return this.apConfig.headingIncrement ?? 1;
  }
}
```

### Heading Sync (Set to Current)

**Key Event:** `AP_HDG_HOLD_ON` or custom sync button

**File:** `src/garminsdk/autopilot/GarminHeadingSyncManager.ts`

```typescript
export class GarminHeadingSyncManager {
  private readonly keyInterceptManager: KeyInterceptManager;

  public constructor(bus: EventBus) {
    this.keyInterceptManager = new KeyInterceptManager(bus);

    // Intercept HDG mode button
    this.keyInterceptManager.interceptKey('AP_HDG_HOLD_ON', false);

    const hEvent = bus.getSubscriber<HEvent>();
    hEvent.on('hEvent').handle(this.onHEvent);
  }

  private onHEvent = (event: string): void => {
    if (event === 'AP_HDG_HOLD_ON') {
      this.syncHeadingBug();
    }
  };

  private syncHeadingBug(): void {
    const currentHeading = SimVar.GetSimVarValue('HEADING INDICATOR', 'degrees');
    const selectedHeading = SimVar.GetSimVarValue('AUTOPILOT HEADING LOCK DIR', 'degrees');

    // Only sync if sufficiently different (avoid micro-adjustments)
    const diff = Math.abs(currentHeading - selectedHeading);
    if (diff > 1 && diff < 359) {
      SimVar.SetSimVarValue('AUTOPILOT HEADING LOCK DIR', 'degrees', currentHeading);
    }
  }
}
```

### Smart Sync with Bank Detection

```typescript
// Advanced version - only sync if wings level or small bank
private syncHeadingBug(): void {
  const bank = SimVar.GetSimVarValue('PLANE BANK DEGREES', 'degrees');

  // Only sync if bank < 6° (wings roughly level)
  if (Math.abs(bank) < 6) {
    const currentHeading = SimVar.GetSimVarValue('HEADING INDICATOR', 'degrees');
    SimVar.SetSimVarValue('AUTOPILOT HEADING LOCK DIR', 'degrees', currentHeading);
  } else {
    // Show message: "Cannot sync while in turn"
    this.showSyncFailedMessage();
  }
}
```

---

## 8. 🎨 Rendering Techniques Comparison

### SVG Transform Approach (Most Common)

```typescript
// G1000, WT21, Epic2 approach
<svg>
  <g transform={`rotate(${rotation} ${centerX} ${centerY})`}>
    <path d="M 256,40 L 250,52 L 262,52 Z" fill={color} />
  </g>
</svg>
```

**Pros:**
- Clean, declarative
- SVG handles rotation math
- Easy to style with CSS/attributes

**Cons:**
- String concatenation for transform
- Requires center point calculation

### CSS Transform Approach (Epic2)

```typescript
<div
  style={{
    transform: `rotate(${rotation}deg)`,
    transformOrigin: `50% ${radius}px`
  }}
>
  <svg>...</svg>
</div>
```

**Pros:**
- CSS transitions work automatically
- Transform origin more intuitive
- Hardware accelerated

**Cons:**
- Requires careful positioning
- Transform origin calculation needed

### Reactive Binding Patterns

#### Pattern 1: MappedSubject (Recommended)

```typescript
// Automatic recalculation when dependencies change
private readonly rotation = MappedSubject.create(
  ([selected, current]) => selected - current,
  this.selectedHeading,
  this.currentHeading
);

// In render
transform={this.rotation.map(rot => `rotate(${rot})`)}
```

**Pros:**
- Declarative, pure function
- Automatic dependency tracking
- Efficient updates

#### Pattern 2: Manual Subscriptions

```typescript
// Manual update on each change
this.selectedHeading.sub(this.updateRotation);
this.currentHeading.sub(this.updateRotation);

private updateRotation = (): void => {
  const rotation = this.selectedHeading.get() - this.currentHeading.get();
  this.element.setAttribute('transform', `rotate(${rotation})`);
};
```

**Pros:**
- More control over updates
- Can optimize update frequency

**Cons:**
- More verbose
- Easy to miss updates
- Manual cleanup needed

---

## 9. 🔌 Autopilot Integration

### Mode Detection

```typescript
// Check if heading bug is actively tracked
const isHeadingModeActive = MappedSubject.create(
  ([lateralActive, lateralArmed]) => {
    return lateralActive === APLateralModes.HEADING
        || lateralActive === APLateralModes.TRACK;
  },
  this.apLateralActive,
  this.apLateralArmed
);

// Visual feedback
isHeadingModeActive.sub(active => {
  this.bugElement.classList.toggle('ap-active', active);
});
```

### FMA (Flight Mode Annunciator) Coordination

```typescript
// When HDG mode engaged, FMA shows "HDG" in magenta
// Heading bug also turns magenta to show coordination

interface FmaData {
  lateralActive: APLateralModes;
  lateralArmed: APLateralModes;
  // ...
}

// Components subscribe to same AP events
// Ensures visual consistency across PFD
```

### Target Heading Display

Some instruments show numeric readout near bug:

```typescript
<div class="selected-heading-readout">
  <div class="label">HDG</div>
  <div class="value">
    {this.selectedHeading.map(hdg => {
      return hdg.toFixed(0).padStart(3, '0') + '°';
    })}
  </div>
</div>

// Styling changes when AP tracking
.selected-heading-readout.ap-active {
  color: magenta;
}
```

---

## 10. 💾 State Management & Persistence

### No Custom Persistence Needed

The heading bug value is stored in **MSFS SimVar**, which:
- Automatically persists with aircraft state
- Survives instrument reloads
- Synchronized across all instruments
- Saved/restored with flight save files

### Multi-Display Synchronization

```typescript
// Display 1 (PFD)
SimVar.SetSimVarValue('AUTOPILOT HEADING LOCK DIR', 'degrees', 270);

// Display 2 (MFD) - automatically receives update via APPublisher
this.props.bus.getSubscriber<APEvents>()
  .on('ap_heading_selected')
  .handle(hdg => {
    console.log('Synced heading:', hdg); // 270
  });
```

### Event Bus Flow:

```
User rotates HDG knob on PFD
    ↓
PFD sets SimVar
    ↓
APPublisher (on each instrument) polls SimVar
    ↓
APPublisher publishes to local EventBus
    ↓
All components on all displays receive update
    ↓
Visual updates on PFD, MFD, backup instruments
```

---

## 11. 🧩 Common Patterns & Utilities

### HsiDataProvider Pattern (Recommended)

```typescript
// Centralizes all HSI-related data subscriptions
export class HsiDataProvider {
  // Heading bug
  public readonly selectedHeading: ConsumerSubject<number>;

  // Current heading
  public readonly magneticHeading: ConsumerSubject<number>;
  public readonly trueHeading: ConsumerSubject<number>;

  // AP state
  public readonly apLateralActive: ConsumerSubject<APLateralModes>;
  public readonly apLateralArmed: ConsumerSubject<APLateralModes>;

  // Navigation
  public readonly courseToSteer: ConsumerSubject<number>;
  public readonly trackAngleError: ConsumerSubject<number>;

  constructor(bus: EventBus, options?: HsiDataProviderOptions) {
    const ap = bus.getSubscriber<APEvents>();
    const ahrs = bus.getSubscriber<AhrsEvents>();

    this.selectedHeading = ConsumerSubject.create(
      ap.on('ap_heading_selected'),
      0
    );

    this.magneticHeading = ConsumerSubject.create(
      ahrs.on('hdg_deg'),
      0
    );

    this.apLateralActive = ConsumerSubject.create(
      ap.on('ap_lateral_active'),
      APLateralModes.NONE
    );

    // ... more subscriptions
  }

  public destroy(): void {
    this.selectedHeading.destroy();
    this.magneticHeading.destroy();
    // ... cleanup
  }
}
```

### Usage in Component:

```typescript
export class HSI extends DisplayComponent<HSIProps> {
  private readonly dataProvider = new HsiDataProvider(this.props.bus);

  public render(): VNode {
    return (
      <div>
        <HsiRose
          selectedHeading={this.dataProvider.selectedHeading}
          currentHeading={this.dataProvider.magneticHeading}
          apMode={this.dataProvider.apLateralActive}
        />

        <HeadingBug
          selectedHeading={this.dataProvider.selectedHeading}
          currentHeading={this.dataProvider.magneticHeading}
          isActive={this.dataProvider.apLateralActive.map(
            mode => mode === APLateralModes.HEADING
          )}
        />
      </div>
    );
  }

  public destroy(): void {
    this.dataProvider.destroy();
    super.destroy();
  }
}
```

### Rotation Utilities

```typescript
// Common utility for normalizing angles
export class MathUtils {
  /**
   * Normalizes angle to 0-360 range
   */
  public static normalizeAngle(angle: number): number {
    return ((angle % 360) + 360) % 360;
  }

  /**
   * Calculates shortest rotation between two angles
   */
  public static angularDifference(from: number, to: number): number {
    const diff = to - from;
    return ((diff + 180) % 360) - 180;
  }

  /**
   * Calculates if angle is within range
   */
  public static isAngleInRange(
    angle: number,
    start: number,
    end: number
  ): boolean {
    const normalized = this.normalizeAngle(angle);
    const normalizedStart = this.normalizeAngle(start);
    const normalizedEnd = this.normalizeAngle(end);

    if (normalizedStart <= normalizedEnd) {
      return normalized >= normalizedStart && normalized <= normalizedEnd;
    } else {
      return normalized >= normalizedStart || normalized <= normalizedEnd;
    }
  }
}

// Usage in heading bug
const rotation = MathUtils.angularDifference(
  this.currentHeading.get(),
  this.selectedHeading.get()
);
```

---

## 12. 📊 Implementation Comparison Table

| Aspect | Epic2 | G1000 | G3000 | G3X Touch | WT21 |
|--------|-------|-------|-------|-----------|------|
| **File Size** | 201 lines | ~150 lines | 768 lines | ~200 lines | 73 lines |
| **Complexity** | Medium | Low | High | Medium | Very Low |
| **Rotation** | Relative | Absolute | Context-aware | Relative | Relative |
| **Data Pattern** | MappedSubject | Subject + manual | MappedSubject | MappedSubject | Subject + manual |
| **Rendering** | CSS transform | SVG transform | SVG transform | SVG transform | SVG setAttribute |
| **Color States** | 2 (white/magenta) | 2 (white/magenta) | 3 (cyan/white/magenta) | 2 (white/magenta) | 2 (white/magenta) |
| **Input Method** | Knob | Knob | Knob/Touch | Touch/Optional Knob | Knob |
| **Mag Var** | No | No | Yes | Yes | No |
| **Data Provider** | No | Yes (HsiDataProvider) | Yes | Yes | No |
| **Best For** | Learning reactive patterns | Simple integration | Full-featured HSI | Touch interfaces | Minimal overhead |

---

## 13. 💡 Implementation Tips

### Starting Your Own Heading Bug:

**1. Choose Your Approach:**

For simple instruments:
```typescript
// Direct subscription, manual updates (WT21 style)
ap.on('ap_heading_selected').handle(hdg => {
  this.rotation = hdg - this.currentHeading;
  this.updateDisplay();
});
```

For reactive instruments:
```typescript
// MappedSubject, automatic updates (Epic2 style)
const rotation = MappedSubject.create(
  ([selected, current]) => selected - current,
  selectedHeading,
  currentHeading
);
```

**2. Set Up Data Flow:**

```typescript
// Create event bus consumer
const ap = bus.getSubscriber<APEvents>();

// Subscribe to heading bug
const selectedHeading = ConsumerSubject.create(
  ap.on('ap_heading_selected'),
  0
);

// Subscribe to current heading
const ahrs = bus.getSubscriber<AhrsEvents>();
const currentHeading = ConsumerSubject.create(
  ahrs.on('hdg_deg'),
  0
);

// Subscribe to AP mode
const apMode = ConsumerSubject.create(
  ap.on('ap_lateral_active'),
  APLateralModes.NONE
);
```

**3. Implement Rendering:**

```typescript
// SVG approach
<svg class="heading-bug">
  <g transform={rotation.map(r => `rotate(${r} 256 256)`)}>
    <path
      d="M 256,40 L 250,52 L 262,52 Z"
      fill={apMode.map(mode =>
        mode === APLateralModes.HEADING ? 'magenta' : 'white'
      )}
    />
  </g>
</svg>

// CSS approach
<div
  style={{
    transform: rotation.map(r => `rotate(${r}deg)`),
    transformOrigin: '50% 200px'
  }}
>
  <svg>...</svg>
</div>
```

**4. Handle User Input:**

```typescript
// Intercept heading knob
keyInterceptManager.interceptKey('HEADING_BUG_INC', false);

// Handle increment
onHeadingInc(): void {
  const current = SimVar.GetSimVarValue('AUTOPILOT HEADING LOCK DIR', 'degrees');
  const newHeading = (current + 1) % 360;
  SimVar.SetSimVarValue('AUTOPILOT HEADING LOCK DIR', 'degrees', newHeading);
}

// Handle sync button
onHeadingSync(): void {
  const currentHeading = SimVar.GetSimVarValue('HEADING INDICATOR', 'degrees');
  SimVar.SetSimVarValue('AUTOPILOT HEADING LOCK DIR', 'degrees', currentHeading);
}
```

**5. Add Visual States:**

```typescript
// Color based on AP mode
const bugColor = apMode.map(mode => {
  switch(mode) {
    case APLateralModes.HEADING:
    case APLateralModes.TRACK:
      return 'magenta';
    default:
      return 'white';
  }
});

// Visibility based on flight mode
const isVisible = Subject.create(true);
// Hide in some flight phases or modes if needed
```

---

## 14. 🎯 Advanced Features

### Heading Readout with Touch

```typescript
export class HeadingReadout extends DisplayComponent<HeadingReadoutProps> {
  private readonly dialogRef = FSComponent.createRef<SelectedHeadingDialog>();

  private onPressed = (): void => {
    this.dialogRef.instance.request({
      initialValue: this.props.selectedHeading.get()
    }).then(result => {
      if (!result.wasCancelled) {
        SimVar.SetSimVarValue(
          'AUTOPILOT HEADING LOCK DIR',
          'degrees',
          result.payload
        );
      }
    });
  };

  public render(): VNode {
    return (
      <TouchButton onPressed={this.onPressed} class="hdg-readout">
        <div class="label">HDG</div>
        <div class="value">
          {this.props.selectedHeading.map(hdg =>
            hdg.toFixed(0).padStart(3, '0')
          )}
        </div>
        <div class="units">°</div>
      </TouchButton>
    );
  }
}
```

### Track Mode Support

```typescript
// Track mode uses same bug but different AP mode
const bugLabel = apMode.map(mode => {
  switch(mode) {
    case APLateralModes.HEADING:
      return 'HDG';
    case APLateralModes.TRACK:
      return 'TRK';
    default:
      return 'HDG';
  }
});

// Bug behavior identical, just visual label changes
```

### Magnetic Variation Correction

```typescript
// Some instruments support true/magnetic toggle
const displayHeading = MappedSubject.create(
  ([heading, magVar, useTrue]) => {
    if (useTrue) {
      return MagVar.magneticToTrue(heading, magVar);
    }
    return heading;
  },
  selectedHeading,
  magneticVariation,
  useTrueHeading
);
```

---

## 15. 📚 Key Files Reference

### SDK Foundation:

- `src/sdk/instruments/APPublisher.ts` - Autopilot event publisher
- `src/sdk/data/EventBus.ts` - Event system
- `src/sdk/sub/Subscribable.ts` - Reactive subscriptions

### Garmin SDK:

- `src/garminsdk/autopilot/GarminHeadingSyncManager.ts` - Heading sync logic
- `src/garminsdk/autopilot/GarminAPStateManager.ts` - AP state management

### Implementations:

**Epic2** (Clearest Example):
- `src/workingtitle-instruments-epic2/instruments/html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/PFD/Components/HSI/HeadingBug.tsx`

**G1000**:
- `src/workingtitle-instruments-g1000/html_ui/PFD/Components/HSI/HSIRose.tsx`
- `src/workingtitle-instruments-g1000/html_ui/PFD/Components/HSI/HSIContainer.tsx`

**G3000** (Most Advanced):
- `src/workingtitle-instruments-g3000/html_ui/MFD/WTG3000_MFD/Components/HSI/HsiRose.tsx`
- `src/workingtitle-instruments-g3000/wtg3000common/html_ui/Components/HSI/HsiCommon.tsx`
- `src/workingtitle-instruments-g3000/wtg3000common/html_ui/Autopilot/GarminAPStateManager.ts`

**G3X Touch** (Touch Input):
- `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HSI/Hsi.tsx`
- `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/HSI/HsiRose.tsx`
- `src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/Common/SelectedHeadingDialog.tsx`

**WT21** (Minimal):
- `src/workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/PFD/Components/HSI/HSIHeadingBug.tsx`
- `src/workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/PFD/Components/HSI/HSI.tsx`

---

## 16. 🔄 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INPUT LAYER                         │
├─────────────────────────────────────────────────────────────┤
│ Heading Knob Rotation  │  Sync Button Press  │ Touch Input │
│  HEADING_BUG_INC/DEC   │  AP_HDG_CURRENT_    │  Dialog     │
│                        │  HDG_SET            │  Entry      │
└──────────┬─────────────┴──────────┬──────────┴──────┬───────┘
           │                        │                 │
           ▼                        ▼                 ▼
    ┌────────────────────────────────────────────────────┐
    │          KeyInterceptManager / InputHandler        │
    │         (May customize increment, validation)      │
    └────────────────────┬───────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   SimVar.Set()       │
              │   AUTOPILOT HEADING  │
              │   LOCK DIR           │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   MSFS Simulator     │
              │   (Persistent Store) │
              └──────────┬───────────┘
                         │
           ┌─────────────┴─────────────┐
           │                           │
           ▼                           ▼
    ┌─────────────┐            ┌─────────────┐
    │ APPublisher │            │ APPublisher │
    │  (PFD)      │            │  (MFD)      │
    └──────┬──────┘            └──────┬──────┘
           │                          │
           ▼                          ▼
    ┌─────────────┐            ┌─────────────┐
    │  EventBus   │            │  EventBus   │
    │   (PFD)     │            │   (MFD)     │
    └──────┬──────┘            └──────┬──────┘
           │                          │
           │ ap_heading_selected      │
           │ ap_lateral_active        │
           │                          │
           ▼                          ▼
    ┌─────────────┐            ┌─────────────┐
    │ Consumer    │            │ Consumer    │
    │ Subject     │            │ Subject     │
    └──────┬──────┘            └──────┬──────┘
           │                          │
           ▼                          ▼
    ┌─────────────┐            ┌─────────────┐
    │ Mapped      │            │ Heading     │
    │ Subject     │            │ Display     │
    │ (rotation)  │            │ Component   │
    └──────┬──────┘            └─────────────┘
           │
           ▼
    ┌─────────────┐
    │ Heading Bug │
    │ Component   │
    │ (Render)    │
    └─────────────┘
```

---

## 17. 🎓 Learning Progression

### Start Here (Simplest):

1. **WT21 Implementation** - 73 lines, direct approach
   - Manual subscriptions
   - Direct DOM manipulation
   - Minimal abstractions

### Intermediate:

2. **Epic2 Implementation** - 201 lines, reactive patterns
   - MappedSubject for derived state
   - CSS transforms
   - Clean component structure

### Advanced:

3. **G3000 Implementation** - 768 lines, full-featured
   - Complex state management
   - Magnetic variation handling
   - Multiple visual modes
   - Touch integration

### Specialized:

4. **G3X Touch Implementation** - Touch-optimized
   - Dialog-based input
   - Optional knob support
   - Mobile-friendly UX

---

This comprehensive guide demonstrates how a "simple" component like the heading bug actually showcases many advanced SDK patterns: reactive programming, event bus architecture, user input handling, state management, and visual feedback systems. It's an excellent learning component that bridges basic display and interactive functionality!
