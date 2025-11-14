# Claude Code Assistant Guide - Garmin GI 275 Implementation

## Project Overview

You are assisting with the implementation of the **Garmin GI 275** electronic flight instrument for Microsoft Flight Simulator 2024. This is a compact, multi-mode, touchscreen-based avionics instrument based on the Working Title G3X Touch architecture.

## Quick Reference

| Item | Value |
|------|-------|
| **Project Name** | Garmin GI 275 Implementation |
| **Base Architecture** | G3X Touch (`src/workingtitle-instruments-g3x-touch/`) |
| **Display Type** | 3.125-inch circular touchscreen |
| **Operating Modes** | AI, HSI, CDI, MFD, EIS |
| **Primary Language** | TypeScript with Preact/JSX |
| **Build System** | Rollup |
| **Target Simulator** | MSFS 2024 |

## Essential Documentation

Before starting any task, familiarize yourself with these documents:

1. **GI275-ARCHITECTURE.md** - Complete architectural specification
2. **gi-275-architecture-recommendation.md** - Why G3X Touch was chosen
3. **garmin-sdk-overview.md** - Garmin SDK fundamentals
4. **attitude-indicator-implementation-guide.md** - Display component patterns
5. **heading-bug-implementation-guide.md** - Interactive component patterns

These are located in the `docs/` folder.

## Architecture Philosophy

### Core Principle: Extend, Don't Reinvent

The GI 275 implementation **extends** the proven G3X Touch architecture. Follow these principles:

✓ **REUSE** existing G3X Touch components whenever possible
✓ **ADAPT** G3X Touch patterns for circular display layout
✓ **EXTEND** the GduDisplay and plugin systems
✓ **FOLLOW** established Garmin SDK patterns

✗ **DON'T** rewrite components from scratch
✗ **DON'T** deviate from G3X Touch architectural patterns
✗ **DON'T** create new data provider patterns (use existing ones)

### Key Architectural Components

```
G3X Touch Foundation (DO NOT MODIFY)
├── GduDisplay interface          → Extend for Gi275Display
├── MfdPageRegistrar              → Use for mode registration
├── UiService                     → Use for lifecycle management
├── G3XTouchPlugin                → Extend for mode plugins
└── Data Providers                → Reuse directly

GI 275 Implementation (NEW CODE)
├── Gi275Display                  → Circular viewport container
├── Gi275ModeRegistrar            → Mode management system
├── Mode Components               → AI, HSI, CDI, MFD, EIS
├── Touch Infrastructure          → Circular touch zones
└── Circular Layout Utilities     → SVG/CSS helpers
```

## Critical Patterns to Follow

### 1. EventBus Architecture (ALWAYS USE THIS)

**Data flow in Garmin instruments:**
```
SimVar → System Publisher → EventBus → ConsumerSubject → Component → Display
```

**Example:**
```typescript
// CORRECT ✓
export class Gi275AiMode extends DisplayComponent<Gi275AiModeProps> {
  private readonly pitch = ConsumerSubject.create(
    this.props.bus.getSubscriber<AhrsEvents>().on('ahrs_pitch_deg_1'),
    0
  );

  public render(): VNode {
    return (
      <Gi275HorizonDisplay pitch={this.pitch} roll={this.roll} />
    );
  }
}

// INCORRECT ✗ - Never read SimVars directly in components
export class BadAiMode extends DisplayComponent<any> {
  public onUpdate(): void {
    const pitch = SimVar.GetSimVarValue('PLANE PITCH DEGREES', 'degrees');  // DON'T DO THIS!
  }
}
```

### 2. Subscribable/Reactive Pattern (ALWAYS USE THIS)

**All data should be reactive using Subscribable:**

```typescript
// CORRECT ✓ - Reactive calculation
const rotation = MappedSubject.create(
  ([selectedHeading, magneticHeading]) => selectedHeading - magneticHeading,
  this.selectedHeading,
  this.magneticHeading
);

// Use in JSX
<div style={`transform: rotate(${rotation}deg)`} />

// INCORRECT ✗ - Manual updates
public onUpdate(): void {
  this.rotation = this.selectedHeading - this.magneticHeading;  // Don't do this!
  this.forceUpdate();  // Never force updates!
}
```

### 3. Plugin Registration Pattern (REQUIRED FOR MODES)

**Each GI 275 mode is a plugin:**

```typescript
// Gi275AiPlugin.ts
export class Gi275AiPlugin extends Gi275Plugin {
  public registerGi275Modes(
    registrar: Gi275ModeRegistrar,
    context: Readonly<Gi275ComponentContext>
  ): void {
    registrar.registerMode('AI', {
      key: 'AI',
      label: 'Attitude Indicator',
      selectIconSrc: 'coui://html_ui/.../ai-icon.svg',
      selectLabel: 'AI',
      order: 0,
      factory: (uiService, containerRef) => (
        <Gi275AiMode
          bus={context.bus}
          uiService={uiService}
          // ... other props
        />
      )
    });
  }
}
```

### 4. Circular Layout Pattern (SPECIFIC TO GI 275)

**Use polar coordinates for circular elements:**

```typescript
// Gi275CircularLayout utility
export class Gi275CircularLayout {
  /**
   * Convert polar to cartesian coordinates
   * @param angle Angle in degrees (0 = top, 90 = right, 180 = bottom, 270 = left)
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
}

// Usage: Place mode button at 45 degrees, 90% from center
const pos = Gi275CircularLayout.polarToCartesian(45, 0.9);
```

### 5. Component Lifecycle (FOLLOW G3X TOUCH PATTERN)

**All mode components implement these methods:**

```typescript
export interface Gi275Mode {
  /** Called when mode becomes active */
  onOpen(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void;

  /** Called when mode becomes inactive */
  onClose(): void;

  /** Called when mode resumes (from pause) */
  onResume(): void;

  /** Called when mode is backgrounded */
  onPause(): void;

  /** Called when display size changes */
  onResize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void;

  /** Called every frame */
  onUpdate(time: number): void;
}
```

**IMPORTANT:** Always unsubscribe/pause in `onPause()` and `onClose()` to prevent memory leaks!

## Development Guidelines

### When Implementing a New Mode

1. **Study the G3X Touch equivalent** first
   - Location: `src/workingtitle-instruments-g3x-touch/html_ui/`
   - Example: For HSI mode, study `PFD/Components/HSI/`

2. **Identify reusable components**
   - Can you use the component as-is?
   - Does it need minor CSS adjustments?
   - Does it need to be adapted for circular layout?

3. **Create mode plugin**
   - Extend `Gi275Plugin`
   - Implement `registerGi275Modes()`
   - Register in mode registry

4. **Implement mode component**
   - Extend `DisplayComponent<Gi275ModeProps>`
   - Implement lifecycle methods
   - Use reactive data patterns
   - Apply circular layout utilities

5. **Test incrementally**
   - Build frequently
   - Test in simulator
   - Verify data flow
   - Check performance

### File Organization Standards

```
// DO THIS ✓
src/workingtitle-instruments-gi275/html_ui/
├── GduDisplay/Gi275/
│   └── Gi275Display.tsx              // Main display
├── Modes/AiMode/
│   ├── Gi275AiMode.tsx               // Mode container
│   ├── Gi275HorizonDisplay.tsx       // Horizon component
│   └── Gi275AiSettings.ts            // Mode settings
└── Components/
    └── Shared/                       // Reusable components

// DON'T DO THIS ✗
src/gi275/
├── stuff.tsx                         // Poor naming
├── display.tsx                       // Unclear purpose
└── things/                           // Vague organization
```

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Components | `Gi275[Name]` | `Gi275HorizonDisplay` |
| Modes | `Gi275[Mode]Mode` | `Gi275AiMode` |
| Plugins | `Gi275[Mode]Plugin` | `Gi275AiPlugin` |
| Props Interfaces | `Gi275[Name]Props` | `Gi275AiModeProps` |
| Settings Types | `Gi275[Name]Settings` | `Gi275UserSettings` |
| Data Providers | `Gi275[Name]DataProvider` | `Gi275EngineDataProvider` |

### CSS Class Naming

```css
/* Use BEM-style naming with gi275 prefix */
.gi275-display { }              /* Block */
.gi275-display__content { }     /* Element */
.gi275-display--inactive { }    /* Modifier */

/* Mode-specific classes */
.gi275-ai-mode { }
.gi275-ai-mode__horizon { }
.gi275-ai-mode__airspeed-tape { }
```

## Common Tasks

### Task: Adding a New Mode

**Steps:**
1. Create mode directory: `html_ui/Modes/[ModeName]/`
2. Create mode component: `Gi275[Mode]Mode.tsx`
3. Create mode plugin: `Gi275[Mode]Plugin.ts`
4. Register plugin in main instrument file
5. Add mode icon to assets
6. Update configuration types
7. Test mode switching

**Reference:** See `GI275-ARCHITECTURE.md` → "Mode Implementation Details"

### Task: Adapting a G3X Touch Component

**Steps:**
1. Locate G3X Touch component in `src/workingtitle-instruments-g3x-touch/`
2. Copy to GI 275 project (rename with Gi275 prefix)
3. Adjust for circular viewport:
   - Use Gi275CircularLayout utilities
   - Update CSS for circular clipping
   - Adjust dimensions (400px diameter)
4. Update imports and dependencies
5. Test in circular context

**Reference:** See `attitude-indicator-implementation-guide.md` for examples

### Task: Implementing Touch Zones

**Steps:**
1. Determine zone location (angle and radius)
2. Create `Gi275TouchZone` component instance
3. Define touch handler callback
4. Add icon or label
5. Test touch responsiveness

**Example:**
```typescript
<Gi275TouchZone
  startAngle={315}        // NW position
  endAngle={45}           // To NE position
  innerRadius={0.85}      // 85% from center
  outerRadius={1.0}       // To edge
  label="MODE"
  onPressed={() => this.showModeSelector()}
/>
```

### Task: Adding Data Subscriptions

**Steps:**
1. Identify event type (`AhrsEvents`, `AdcEvents`, etc.)
2. Create `ConsumerSubject` in component
3. Subscribe in constructor or `onAfterRender()`
4. Use in `MappedSubject` for derived values
5. Unsubscribe in `onDestroy()` or `onClose()`

**Example:**
```typescript
private readonly pitch = ConsumerSubject.create(
  this.props.bus.getSubscriber<AhrsEvents>().on('ahrs_pitch_deg_1'),
  0
);

public onClose(): void {
  this.pitch.destroy();  // Clean up subscription
}
```

## What NOT to Do

### ❌ Don't Modify G3X Touch Source Code

**Why:** G3X Touch is a separate product. Changes would break updates.

**Instead:** Extend and adapt components in GI 275 codebase.

### ❌ Don't Read SimVars Directly in Components

**Why:** Breaks data flow architecture, causes performance issues.

**Instead:** Use EventBus → ConsumerSubject pattern.

### ❌ Don't Use Imperative DOM Manipulation

**Why:** Preact is declarative. Imperative updates cause bugs.

**Instead:** Use reactive Subscribables and let Preact handle DOM updates.

```typescript
// DON'T DO THIS ✗
public onUpdate(): void {
  document.getElementById('pitch').style.transform = `rotate(${this.pitch}deg)`;
}

// DO THIS ✓
public render(): VNode {
  return (
    <div style={`transform: rotate(${this.pitch}deg)`} />
  );
}
```

### ❌ Don't Create Monolithic Components

**Why:** Hard to maintain, test, and reuse.

**Instead:** Break into smaller, focused components.

```typescript
// DON'T DO THIS ✗
export class Gi275AiMode extends DisplayComponent<any> {
  // 2000 lines of code handling everything
}

// DO THIS ✓
export class Gi275AiMode extends DisplayComponent<Gi275AiModeProps> {
  public render(): VNode {
    return (
      <>
        <Gi275HorizonDisplay {...horizonProps} />
        <Gi275AirspeedTape {...airspeedProps} />
        <Gi275AltitudeTape {...altitudeProps} />
      </>
    );
  }
}
```

### ❌ Don't Hardcode Values

**Why:** Configuration should be flexible.

**Instead:** Use configuration and settings systems.

```typescript
// DON'T DO THIS ✗
const diameter = 400;
const ahrsIndex = 1;

// DO THIS ✓
const diameter = this.props.config.displayDiameter;
const ahrsIndex = this.props.config.ahrsIndex;
```

## Performance Best Practices

### 1. Minimize Re-renders

```typescript
// Use MappedSubject to calculate derived values reactively
const rotation = MappedSubject.create(
  ([heading, selectedHeading]) => heading - selectedHeading,
  this.heading,
  this.selectedHeading
);

// Instead of calculating every frame in onUpdate()
```

### 2. Throttle High-Frequency Updates

```typescript
// For fast-changing values (e.g., airspeed)
private readonly airspeed = ConsumerSubject.create(
  this.props.bus.getSubscriber<AdcEvents>().on('indicated_alt'),
  0,
  undefined,
  10  // Update max every 10ms (100Hz instead of 1000Hz)
);
```

### 3. Lazy-Load Resources

```typescript
// Don't load terrain data until MFD mode is active
public onOpen(): void {
  if (!this.terrainDataProvider) {
    this.terrainDataProvider = new Gi275TerrainDataProvider(this.props.bus);
  }
}
```

### 4. Use CSS Transforms (GPU Accelerated)

```typescript
// DO THIS ✓ - GPU accelerated
<div style={`transform: rotate(${angle}deg)`} />

// DON'T DO THIS ✗ - Forces layout recalculation
<svg>
  <g transform={`rotate(${angle} 200 200)`}>  {/* SVG transforms are slower */}
  </g>
</svg>
```

## Debugging Tips

### Enable Verbose Logging

```typescript
// In development, log mode transitions
public onOpen(): void {
  console.log(`[GI275] Opening ${this.props.mode} mode`);
  // ... mode setup
}

public onClose(): void {
  console.log(`[GI275] Closing ${this.props.mode} mode`);
  // ... cleanup
}
```

### Monitor EventBus Traffic

```typescript
// Subscribe to all events of a type to see data flow
this.props.bus.getSubscriber<AhrsEvents>().on('ahrs_pitch_deg_1').handle(pitch => {
  console.log('AHRS Pitch:', pitch);
});
```

### Verify Data Provider State

```typescript
// Log subscriptions to verify data flow
console.log('NavIndicator active source:', this.navIndicators.activeSource.get());
console.log('GPS lateral deviation:', this.navIndicators.gpsLateralDeviation.get());
```

### Check Circular Clipping

```css
/* Temporarily disable clipping to see full layout */
.gi275-mode-content {
  /* clip-path: url(#gi275-circular-clip); */  /* Commented out for debug */
}
```

## Testing Checklist

Before committing any mode implementation:

- [ ] Mode registers correctly in mode selector
- [ ] Mode switches without errors
- [ ] Data subscriptions work (values update)
- [ ] Touch zones respond correctly
- [ ] Performance is 60 FPS minimum
- [ ] No console errors or warnings
- [ ] Circular clipping works correctly
- [ ] Component cleans up on close (no memory leaks)
- [ ] Settings persist correctly
- [ ] Works with different aircraft configurations

## Code Review Standards

When reviewing code, check for:

1. **Architecture Compliance**
   - Uses EventBus pattern ✓
   - Follows Subscribable/reactive pattern ✓
   - Extends G3X Touch appropriately ✓

2. **Code Quality**
   - TypeScript types are correct ✓
   - No `any` types (except where necessary) ✓
   - Components are focused and small ✓
   - Naming follows conventions ✓

3. **Performance**
   - No unnecessary re-renders ✓
   - Subscriptions are throttled if needed ✓
   - Resources are cleaned up ✓

4. **Documentation**
   - Complex logic has comments ✓
   - Public methods have JSDoc ✓
   - README updated if needed ✓

## Quick Reference: Key Files

### Architecture Documentation
- `docs/GI275-ARCHITECTURE.md` - Complete architecture spec
- `docs/gi-275-architecture-recommendation.md` - Architecture decision rationale
- `docs/garmin-sdk-overview.md` - SDK fundamentals

### Learning Guides
- `docs/attitude-indicator-implementation-guide.md` - Display components
- `docs/heading-bug-implementation-guide.md` - Interactive components
- `docs/baro-setting-implementation-guide.md` - Settings & units
- `docs/cdi-course-indicator-implementation-guide.md` - Multi-source navigation
- `docs/flight-plan-waypoint-management-guide.md` - FMS integration

### G3X Touch Reference (DO NOT MODIFY)
- `src/workingtitle-instruments-g3x-touch/html_ui/GduDisplay/` - Display framework
- `src/workingtitle-instruments-g3x-touch/html_ui/Shared/G3XTouchPlugin.ts` - Plugin system
- `src/workingtitle-instruments-g3x-touch/html_ui/PFD/Components/` - PFD components
- `src/workingtitle-instruments-g3x-touch/html_ui/MFD/` - MFD components

### Garmin SDK (READ-ONLY REFERENCE)
- `src/garminsdk/` - SDK components and data providers
- `src/sdk/` - Core MSFS SDK

## Working with Claude Code

### Effective Prompts

**Good prompts:**
- "Implement the HSI mode following the G3X Touch HSI component pattern"
- "Add touch zone for mode switching at the top of the display (0-45 degrees)"
- "Create data provider for engine parameters following the existing pattern"

**Less effective prompts:**
- "Make it work" (too vague)
- "Add AI mode" (missing context about which patterns to follow)
- "Fix the bug" (need specific reproduction steps)

### Providing Context

Always provide:
1. **What you want to implement** - Specific mode, component, or feature
2. **Which pattern to follow** - Reference G3X Touch component or pattern
3. **Where it goes** - Specific file location or mode
4. **Acceptance criteria** - How to know it's done correctly

**Example:**
```
I want to implement the altitude tape for AI mode.
Follow the G3X Touch airspeed indicator pattern (PFD/Components/AirspeedIndicator/)
but adapt it for the right side of the circular display.
It should be in html_ui/Modes/AiMode/Gi275AltitudeTape.tsx.
Success criteria: Shows altitude from ADC with tape format, updates smoothly, fits in circular viewport.
```

## Getting Unstuck

### Problem: Can't Find the Right G3X Touch Component

**Solution:**
1. Search for keywords in G3X Touch directory
2. Check the implementation guides in `docs/`
3. Look at similar instruments (G1000, WT21)

### Problem: Data Not Updating

**Solution:**
1. Check EventBus subscription is correct
2. Verify event type matches publisher
3. Log values in console to see if events are firing
4. Check if component is paused or closed

### Problem: Circular Layout Looks Wrong

**Solution:**
1. Verify circular clipping is applied
2. Check polar coordinate calculations
3. Temporarily disable clipping to see full layout
4. Use browser dev tools to inspect SVG paths

### Problem: Touch Zones Not Working

**Solution:**
1. Verify SVG path is correct (use browser inspector)
2. Check z-index (touch zone should be on top)
3. Test with mouse clicks before touch
4. Log touch events to console

## Resources

### Official Documentation
- [MSFS SDK Docs](https://docs.flightsimulator.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Preact Documentation](https://preactjs.com/)

### Internal References
- Working Title Discord (for questions)
- GitHub Issues (for bugs/features)
- This repository's documentation (`docs/`)

### External Resources
- Garmin GI 275 Pilot's Guide (PDF)
- G3X Touch Pilot's Guide (PDF)
- Real-world GI 275 videos (for visual reference)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-14 | Initial version |

---

**Remember:** This is a complex project. Take it one mode at a time, follow the established patterns, and don't hesitate to reference the G3X Touch implementation for guidance.

**When in doubt, ask:** "How does G3X Touch do this?"

Good luck! 🚁
