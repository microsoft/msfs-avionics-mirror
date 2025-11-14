# Complete Guide: Barometric Pressure Setting Implementation in Garmin Instruments

A comprehensive walkthrough of barometric pressure setting (Kohlsman window) implementations across all Garmin instruments, covering settings persistence, units conversion, and altimeter integration.

---

## 📊 Overview: What is Barometric Pressure Setting?

The **barometric pressure setting** (also called Kohlsman setting or altimeter setting) is a critical aviation instrument that calibrates the altimeter to show accurate altitude above sea level.

### Why It's Critical:

- **Altitude Accuracy** - Without correct baro setting, altimeter can be off by hundreds of feet
- **Terrain Clearance** - Essential for safe obstacle avoidance
- **Traffic Separation** - ATC assigns altitudes based on standard settings
- **Weather Compensation** - Adjusts for atmospheric pressure variations

### Standard Pressures:

```typescript
// Sea level standard pressure
STANDARD_PRESSURE_INHG = 29.92  // inches of mercury
STANDARD_PRESSURE_HPA = 1013.25 // hectopascals (millibars)

// Regional reference
US: Uses inHg (inches of mercury)
International: Uses hPa or mb (hectopascals/millibars)
Russia/CIS: Sometimes uses mmHg (millimeters of mercury)
```

### Operating Modes:

1. **QNH Mode** - Set to local airport pressure (shows field elevation on ground)
2. **STD Mode** - Set to standard pressure 29.92/1013 (used above transition altitude)
3. **QFE Mode** - Set to show 0 at airport elevation (rarely used in US)

---

## 🔄 Complete Data Flow

```
User Input (BARO Knob/Button/Touch)
    ↓
Input Handler (validates, converts units)
    ↓
Key Event: K:KOHLSMAN_SET
    ↓
SimVar: KOHLSMAN SETTING MB:#index# (raw units, 1/16 hPa)
    ↓
AdcPublisher reads SimVar
    ↓
EventBus: adc_altimeter_baro_setting_inhg_#index#
    ↓
Components consume value
    ├─→ Baro Display Window (shows setting)
    ├─→ Altimeter Tape (affects altitude calculation)
    └─→ STD Annunciator (shows when in STD mode)
```

### Settings Persistence:

```
User selects units (inHg ↔ hPa)
    ↓
UserSettingManager: altimeterBaroMetric_#index#
    ↓
Stored in LocalStorage
    ↓
Restored on instrument reload
```

---

## 1. 🎯 Data Source Foundation

### SimVar Storage

**SimVar:** `KOHLSMAN SETTING MB:#index#`
- **Type:** Raw units (1/16 hectopascal)
- **Indexed:** Supports multiple altimeters (1, 2, 3)
- **Writeable:** Via key events

### Raw Value Conversion:

```typescript
// Raw value is in 1/16 hPa units
const RAW_TO_HPA = 1 / 16;        // 16 = 1 hPa
const HPA_TO_INHG = 0.02953;      // Conversion factor
const INHG_TO_HPA = 33.86388;     // Inverse

// Convert raw to inHg
function rawToInhg(raw: number): number {
  return (raw * RAW_TO_HPA) * HPA_TO_INHG;
}

// Convert inHg to raw
function inhgToRaw(inhg: number): number {
  return Math.round(inhg * INHG_TO_HPA * 16);
}

// Examples:
rawToInhg(16211) = 29.92 inHg (standard pressure)
inhgToRaw(29.92) = 16211 raw
```

### Valid Ranges:

```typescript
// inHg range
MIN_BARO_INHG = 28.00  // Low pressure system
MAX_BARO_INHG = 31.00  // High pressure system

// hPa range
MIN_BARO_HPA = 948     // ~28.00 inHg
MAX_BARO_HPA = 1084    // ~32.01 inHg

// Raw value range
MIN_RAW = 15169        // 948.0625 hPa
MAX_RAW = 17344        // 1084 hPa
```

### ADC Publisher

**File:** `src/sdk/instruments/Adc.ts`

```typescript
class AdcPublisher extends SimVarPublisher<AdcEvents> {
  private static simvars = new Map([
    // Baro setting in inHg (converted from raw)
    ['adc_altimeter_baro_setting_inhg_1', {
      name: 'KOHLSMAN SETTING MB:1',
      type: SimVarValueType.MB,
      map: (mb: number) => mb * 0.02953  // Convert to inHg
    }],
    // ... more indices
  ]);
}

interface AdcEvents {
  adc_altimeter_baro_setting_inhg_1: number;  // Altimeter 1 setting
  adc_altimeter_baro_setting_inhg_2: number;  // Altimeter 2 setting
  // ...
}
```

---

## 2. 📏 Units System

### Unit Types:

```typescript
// Unit definitions
const BARO_UNITS = {
  IN_HG: {
    name: 'inHg',
    precision: 2,           // Display: 29.92
    increment: 0.01,        // Knob increment
    standard: 29.92
  },
  HPA: {
    name: 'hPa',
    precision: 0,           // Display: 1013
    increment: 1,           // Knob increment
    standard: 1013.25
  },
  MB: {
    name: 'mb',             // Same as hPa
    precision: 0,
    increment: 1,
    standard: 1013.25
  }
};
```

### Conversion Utilities:

```typescript
// UnitType system (SDK)
const UnitType = {
  HPA: UnitFamily.Pressure.createUnit('hectopascal'),
  IN_HG: UnitFamily.Pressure.createUnit('inch of mercury'),
  MB: UnitFamily.Pressure.createUnit('millibar')  // Alias for hPa
};

// Convert between units
const baroInhg = 29.92;
const baroHpa = UnitType.IN_HG.convertTo(baroInhg, UnitType.HPA);  // 1013.25

// NumberUnitSubject for reactive conversion
const baroSetting = NumberUnitSubject.create(
  UnitType.IN_HG.createNumber(29.92)
);

// Get value in different unit
const inhg = baroSetting.get().asUnit(UnitType.IN_HG);  // 29.92
const hpa = baroSetting.get().asUnit(UnitType.HPA);     // 1013.25
```

---

## 3. 🛩️ G1000 NXi Implementation

### Baro Setting Display

**File:** `src/workingtitle-instruments-g1000/html_ui/PFD/Components/UI/Altimeter/BaroSettingDisplay.tsx`

```typescript
interface BaroSettingDisplayProps {
  bus: EventBus;
  altimeterIndex: number;
  settingManager: UserSettingManager<AltimeterUserSettingTypes>;
}

export class BaroSettingDisplay extends DisplayComponent<BaroSettingDisplayProps> {
  private readonly baroSettingInhg = ConsumerSubject.create(null, 29.92);
  private readonly isMetric = Subject.create(false);

  public onAfterRender(): void {
    const adc = this.props.bus.getSubscriber<AdcEvents>();

    // Subscribe to baro setting from ADC
    this.baroSettingInhg.setConsumer(
      adc.on(`adc_altimeter_baro_setting_inhg_${this.props.altimeterIndex}`)
    );

    // Subscribe to units setting
    this.props.settingManager
      .getSetting('altimeterBaroMetric')
      .sub(isMetric => {
        this.isMetric.set(isMetric);
      }, true);
  }

  public render(): VNode {
    return (
      <div class="baro-setting-display">
        {/* Numeric value */}
        <div class="baro-value">
          {this.baroSettingInhg.map(inhg => {
            if (this.isMetric.get()) {
              // Convert to hPa and format
              const hpa = inhg * 33.86388;
              return hpa.toFixed(0);  // "1013"
            } else {
              return inhg.toFixed(2);   // "29.92"
            }
          })}
        </div>

        {/* Units label */}
        <div class="baro-units">
          {this.isMetric.map(metric => metric ? 'hPa' : 'IN')}
        </div>
      </div>
    );
  }
}
```

### User Input Handler

**File:** `src/workingtitle-instruments-g1000/html_ui/Shared/UI/Controllers/BaroKnobInputHandler.ts`

```typescript
export class BaroKnobInputHandler {
  private readonly keyInterceptManager: KeyInterceptManager;
  private readonly altimeterIndex: number;

  constructor(bus: EventBus, altimeterIndex: number) {
    this.altimeterIndex = altimeterIndex;
    this.keyInterceptManager = new KeyInterceptManager(bus);

    // Intercept baro knob events
    this.keyInterceptManager.interceptKey('KOHLSMAN_INC', false);
    this.keyInterceptManager.interceptKey('KOHLSMAN_DEC', false);
    this.keyInterceptManager.interceptKey('BAROMETRIC', false);  // STD button

    const hEvent = bus.getSubscriber<HEvent>();
    hEvent.on('hEvent').handle(this.onHEvent);
  }

  private onHEvent = (event: string): void => {
    switch(event) {
      case 'KOHLSMAN_INC':
        this.adjustBaro(1);
        break;
      case 'KOHLSMAN_DEC':
        this.adjustBaro(-1);
        break;
      case 'BAROMETRIC':
        this.toggleStd();
        break;
    }
  };

  private adjustBaro(direction: 1 | -1): void {
    // Get current raw value
    const currentRaw = SimVar.GetSimVarValue(
      `KOHLSMAN SETTING MB:${this.altimeterIndex}`,
      'number'
    );

    // Determine increment based on units setting
    const isMetric = this.settingManager.getSetting('altimeterBaroMetric').value;
    const increment = isMetric
      ? 16      // 1 hPa = 16 raw units
      : 5.4;    // 0.01 inHg ≈ 5.4 raw units

    // Calculate new raw value
    const newRaw = currentRaw + (direction * increment);

    // Validate range
    const clampedRaw = Math.max(
      MIN_RAW,
      Math.min(MAX_RAW, Math.round(newRaw))
    );

    // Set new value
    SimVar.SetSimVarValue(
      `K:KOHLSMAN_SET`,
      'number',
      clampedRaw
    );
  }

  private toggleStd(): void {
    const currentRaw = SimVar.GetSimVarValue(
      `KOHLSMAN SETTING MB:${this.altimeterIndex}`,
      'number'
    );

    const stdRaw = 16211;  // 29.92 inHg / 1013.25 hPa

    if (Math.abs(currentRaw - stdRaw) < 10) {
      // Already at STD, do nothing or restore saved value
      return;
    }

    // Set to standard pressure
    SimVar.SetSimVarValue('K:KOHLSMAN_SET', 'number', stdRaw);
  }
}
```

### Settings Manager

**File:** `src/workingtitle-instruments-g1000/html_ui/Shared/Settings/AltimeterSettings.ts`

```typescript
export type AltimeterUserSettingTypes = {
  altimeterBaroMetric: boolean;  // true = hPa, false = inHg
};

export class AltimeterUserSettings {
  private static readonly settings: UserSettingDefinition<AltimeterUserSettingTypes>[] = [
    {
      name: 'altimeterBaroMetric',
      defaultValue: false  // Default to inHg
    }
  ];

  public static getManager(bus: EventBus): UserSettingManager<AltimeterUserSettingTypes> {
    return new DefaultUserSettingManager(bus, AltimeterUserSettings.settings);
  }
}

// Usage
const settingManager = AltimeterUserSettings.getManager(bus);

// Toggle units
settingManager.getSetting('altimeterBaroMetric').set(!isMetric);

// Subscribe to changes
settingManager.getSetting('altimeterBaroMetric').sub(isMetric => {
  console.log('Units changed to:', isMetric ? 'hPa' : 'inHg');
});
```

**Files:**
- `src/workingtitle-instruments-g1000/html_ui/PFD/Components/UI/Altimeter/BaroSettingDisplay.tsx`
- `src/workingtitle-instruments-g1000/html_ui/Shared/UI/Controllers/BaroKnobInputHandler.ts`

---

## 4. 🎨 G3000/G5000 Implementation

### Advanced Baro Setting Handler

**File:** `src/workingtitle-instruments-g3000/wtg3000common/html_ui/Shared/Components/BaroSet/BaroSetHandler.ts`

The G3000 has the most sophisticated implementation with **baro preselect** support:

```typescript
export class BaroSetHandler {
  private readonly baroSettingInhg = ConsumerSubject.create(null, 29.92);
  private readonly baroPreselect = Subject.create<number | null>(null);
  private readonly isStdActive = Subject.create(false);

  // Settings (per-PFD indexed)
  private readonly baroMetricSetting: UserSetting<boolean>;

  constructor(
    bus: EventBus,
    altimeterIndex: number,
    settingManager: UserSettingManager<AltimeterUserSettingTypes>
  ) {
    this.baroMetricSetting = settingManager.getSetting(
      `altimeterBaroMetric_${altimeterIndex}`
    );

    // Subscribe to baro setting
    const adc = bus.getSubscriber<AdcEvents>();
    this.baroSettingInhg.setConsumer(
      adc.on(`adc_altimeter_baro_setting_inhg_${altimeterIndex}`)
    );
  }

  /**
   * Increments the baro setting
   */
  public incrementBaro(): void {
    if (this.isStdActive.get()) {
      // In STD mode, adjust preselect value
      this.incrementPreselect(1);
    } else {
      // Normal mode, adjust actual baro
      this.adjustBaro(1);
    }
  }

  /**
   * Decrements the baro setting
   */
  public decrementBaro(): void {
    if (this.isStdActive.get()) {
      this.incrementPreselect(-1);
    } else {
      this.adjustBaro(-1);
    }
  }

  /**
   * Toggles STD BARO mode
   */
  public toggleStd(): void {
    const isStd = this.isStdActive.get();

    if (isStd) {
      // Exit STD mode
      const preselect = this.baroPreselect.get();
      if (preselect !== null) {
        // Restore preselect value
        this.setBaroInhg(preselect);
      }
      this.isStdActive.set(false);
      this.baroPreselect.set(null);
    } else {
      // Enter STD mode
      // Save current value as preselect
      this.baroPreselect.set(this.baroSettingInhg.get());

      // Set to standard pressure
      this.setBaroInhg(29.92);
      this.isStdActive.set(true);
    }
  }

  private adjustBaro(direction: 1 | -1): void {
    const current = this.baroSettingInhg.get();
    const isMetric = this.baroMetricSetting.value;

    let newValue: number;
    if (isMetric) {
      // hPa increment (1 hPa)
      const currentHpa = current * 33.86388;
      const newHpa = currentHpa + direction;
      newValue = newHpa / 33.86388;
    } else {
      // inHg increment (0.01)
      newValue = current + (direction * 0.01);
    }

    // Clamp to valid range
    newValue = Math.max(28.00, Math.min(31.00, newValue));

    this.setBaroInhg(newValue);
  }

  private incrementPreselect(direction: 1 | -1): void {
    let preselect = this.baroPreselect.get() ?? 29.92;
    const isMetric = this.baroMetricSetting.value;

    if (isMetric) {
      const hpa = preselect * 33.86388;
      preselect = (hpa + direction) / 33.86388;
    } else {
      preselect += direction * 0.01;
    }

    preselect = Math.max(28.00, Math.min(31.00, preselect));
    this.baroPreselect.set(preselect);
  }

  private setBaroInhg(inhg: number): void {
    const raw = Math.round(inhg * 33.86388 * 16);
    SimVar.SetSimVarValue('K:KOHLSMAN_SET', 'number', raw);
  }

  /**
   * Toggles between inHg and hPa
   */
  public toggleUnits(): void {
    const current = this.baroMetricSetting.value;
    this.baroMetricSetting.value = !current;
  }
}
```

### Baro Setting Display (G3000)

**File:** `src/workingtitle-instruments-g3000/html_ui/PFD/Components/PfdBaroSetDisplay/PfdBaroSetDisplay.tsx`

```typescript
export class PfdBaroSetDisplay extends DisplayComponent<PfdBaroSetDisplayProps> {
  private readonly isStdActive = Subject.create(false);
  private readonly baroValue = Subject.create('29.92');
  private readonly baroUnits = Subject.create('IN');

  public render(): VNode {
    return (
      <div class="pfd-baro-set-display">
        {/* STD indicator */}
        <div
          class="std-indicator"
          style={{
            display: this.isStdActive.map(std => std ? '' : 'none')
          }}
        >
          STD BARO
        </div>

        {/* Numeric value (hidden in STD mode) */}
        <div
          class="baro-value-container"
          style={{
            display: this.isStdActive.map(std => std ? 'none' : '')
          }}
        >
          <div class="baro-value">{this.baroValue}</div>
          <div class="baro-units">{this.baroUnits}</div>
        </div>

        {/* Preselect indicator (shown in STD mode when adjusting) */}
        <div
          class="baro-preselect"
          style={{
            display: this.baroPreselect.map(pre => pre !== null ? '' : 'none')
          }}
        >
          PRE {this.baroPreselect.map(pre => pre?.toFixed(2))}
        </div>
      </div>
    );
  }
}
```

**Key Features:**
- **Baro Preselect** - Can set QNH while in STD mode for quick transition
- **STD BARO Indicator** - Shows "STD BARO" when at standard pressure
- **Indexed Settings** - Separate settings for PFD1, PFD2, etc.

**Files:**
- `src/workingtitle-instruments-g3000/wtg3000common/html_ui/Shared/Components/BaroSet/BaroSetHandler.ts`
- `src/workingtitle-instruments-g3000/html_ui/PFD/Components/PfdBaroSetDisplay/PfdBaroSetDisplay.tsx`

---

## 5. 📱 G3X Touch Implementation

### Touch-Optimized Baro Entry

**File:** `src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/BaroSet/BaroSetDisplay.tsx`

```typescript
export class BaroSetDisplay extends DisplayComponent<BaroSetDisplayProps> {
  private readonly dialogRef = FSComponent.createRef<BaroSetDialog>();
  private readonly baroValue = NumberUnitSubject.create(
    UnitType.IN_HG.createNumber(29.92)
  );

  /**
   * Opens the baro set dialog
   */
  private onPressed = (): void => {
    this.dialogRef.instance.request({
      initialValue: this.baroValue.get(),
      units: this.isMetric.get() ? UnitType.HPA : UnitType.IN_HG
    }).then(result => {
      if (!result.wasCancelled) {
        const inhg = result.payload.asUnit(UnitType.IN_HG);
        this.setBaroSetting(inhg);
      }
    });
  };

  /**
   * Sets baro to standard pressure
   */
  private onStdPressed = (): void => {
    this.setBaroSetting(29.92);
  };

  /**
   * Sets baro to field elevation pressure
   */
  private onFieldPressed = (): void => {
    // Calculate pressure for current field elevation
    const elevation = SimVar.GetSimVarValue('GROUND ALTITUDE', 'feet');
    const fieldPressure = this.calculateFieldPressure(elevation);
    this.setBaroSetting(fieldPressure);
  };

  private setBaroSetting(inhg: number): void {
    const raw = Math.round(inhg * 33.86388 * 16);
    SimVar.SetSimVarValue('K:KOHLSMAN_SET', 'number', raw);
  }

  public render(): VNode {
    return (
      <div class="baro-set-display">
        {/* Touchable readout */}
        <TouchButton
          class="baro-readout"
          onPressed={this.onPressed}
        >
          <div class="value">
            {this.baroValue.map(val => {
              if (this.isMetric.get()) {
                return val.asUnit(UnitType.HPA).toFixed(0);
              } else {
                return val.asUnit(UnitType.IN_HG).toFixed(2);
              }
            })}
          </div>
          <div class="units">
            {this.isMetric.map(m => m ? 'hPa' : 'IN')}
          </div>
        </TouchButton>

        {/* Quick action buttons */}
        <div class="baro-actions">
          <TouchButton onPressed={this.onStdPressed}>
            STD
          </TouchButton>
          <TouchButton onPressed={this.onFieldPressed}>
            FIELD
          </TouchButton>
        </div>

        {/* Dialog */}
        <BaroSetDialog ref={this.dialogRef} />
      </div>
    );
  }
}
```

### Baro Set Dialog

```typescript
export class BaroSetDialog extends AbstractNumberUnitDialog {
  protected getTitle(): string {
    return 'Barometric Pressure';
  }

  protected getInvalidValueMessage(): string {
    return this.isMetric
      ? 'Invalid Entry\nValue must be between\n948 and 1084 hPa'
      : 'Invalid Entry\nValue must be between\n28.00 and 31.00 IN';
  }

  protected isValueValid(value: NumberUnitInterface<UnitFamily.Pressure>): boolean {
    const inhg = value.asUnit(UnitType.IN_HG);
    return inhg >= 28.00 && inhg <= 31.00;
  }
}
```

**Files:**
- `src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/BaroSet/BaroSetDisplay.tsx`
- `src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/BaroSet/BaroSetDialog.tsx`

---

## 6. ✈️ WT21 Implementation

### Baro Setting with Preselect Box

**File:** `src/workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/PFD/Components/BaroSet/BaroSet.tsx`

```typescript
export class BaroSet extends DisplayComponent<BaroSetProps> {
  private readonly baroInhg = ConsumerSubject.create(null, 29.92);
  private readonly baroPreset = Subject.create<number | null>(null);
  private readonly isMetric = Subject.create(false);

  // STD mode state
  private readonly isStd = MappedSubject.create(
    ([baro]) => Math.abs(baro - 29.92) < 0.005,
    this.baroInhg
  );

  public render(): VNode {
    return (
      <div class="baro-set-container">
        {/* Main baro display */}
        <div class="baro-main">
          <div class="baro-label">BARO</div>
          <div class="baro-value">
            {this.baroInhg.map(inhg => {
              if (this.isMetric.get()) {
                return (inhg * 33.86388).toFixed(0);
              }
              return inhg.toFixed(2);
            })}
          </div>
          <div class="baro-units">
            {this.isMetric.map(m => m ? 'HPA' : 'IN')}
          </div>
        </div>

        {/* Preset box (shows when adjusting in STD mode) */}
        <div
          class="baro-preset-box"
          style={{
            display: this.baroPreset.map(pre => pre !== null ? '' : 'none')
          }}
        >
          <div class="preset-label">PRE</div>
          <div class="preset-value">
            {this.baroPreset.map(pre => pre?.toFixed(2))}
          </div>
        </div>

        {/* STD indicator */}
        <div
          class="std-indicator"
          style={{
            visibility: this.isStd.map(std => std ? 'visible' : 'hidden')
          }}
        >
          STD
        </div>
      </div>
    );
  }
}
```

**Unique Features:**
- Preset box shows QNH while in STD mode
- Flight level alerts based on baro setting
- CAS messages for incorrect baro setting

**Files:**
- `src/workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/PFD/Components/BaroSet/BaroSet.tsx`

---

## 7. 🚀 Epic2 Implementation

### Settings Synchronization

**File:** `src/workingtitle-instruments-epic2/shared/Settings/BaroSettings.ts`

```typescript
export class BaroSettings {
  // Sync baro correction unit across all altimeters
  public static syncBaroCorrectionUnit(
    settingManager: UserSettingManager<AltimeterSettings>,
    newUnit: BaroCorrectionUnit
  ): void {
    // Set for all altimeter indices
    for (let i = 1; i <= 3; i++) {
      settingManager
        .getSetting(`altimeterBaroCorrectionUnit_${i}`)
        .value = newUnit;
    }
  }
}

// Baro correction unit enum
export enum BaroCorrectionUnit {
  InHg = 'InHg',
  Hpa = 'Hpa',
  Mb = 'Mb'  // Alias for hPa
}
```

**Files:**
- `src/workingtitle-instruments-epic2/shared/Settings/BaroSettings.ts`

---

## 8. 💾 Settings Persistence

### UserSettingManager Pattern

```typescript
// Define setting types
export type AltimeterUserSettingTypes = {
  altimeterBaroMetric_1: boolean;  // PFD 1
  altimeterBaroMetric_2: boolean;  // PFD 2
  altimeterBaroMetric_3: boolean;  // PFD 3 (if exists)
};

// Define defaults
const settings: UserSettingDefinition<AltimeterUserSettingTypes>[] = [
  {
    name: 'altimeterBaroMetric_1',
    defaultValue: false  // Default to inHg
  },
  {
    name: 'altimeterBaroMetric_2',
    defaultValue: false
  }
];

// Create manager
const settingManager = new DefaultUserSettingManager(bus, settings);

// Access setting
const baroMetricSetting = settingManager.getSetting('altimeterBaroMetric_1');

// Read value
const isMetric = baroMetricSetting.value;

// Write value
baroMetricSetting.value = true;  // Switch to hPa

// Subscribe to changes
baroMetricSetting.sub(isMetric => {
  console.log('Units changed:', isMetric ? 'hPa' : 'inHg');
});
```

### LocalStorage Persistence:

Settings are automatically saved to browser LocalStorage:

```typescript
// Stored as:
// Key: g1000_altimeterBaroMetric_1
// Value: "false" or "true"

// Retrieved on instrument load
// Applied to display and input handlers
```

---

## 9. 🔌 Altimeter Integration

### How Baro Setting Affects Altitude

**Pressure Altitude Formula:**
```typescript
// Pressure altitude = altitude when baro set to 29.92
pressureAltitude = indicatedAltitude + (29.92 - currentBaro) * 1000

// Example:
// Field elevation: 1000 ft MSL
// Current baro: 30.12 inHg
// Indicated altitude when set to 30.12: 1000 ft
// If set to 29.92 (STD): 1000 + (29.92 - 30.12) * 1000 = 1000 - 200 = 800 ft
```

### ADC System Integration:

**File:** `src/garminsdk/system/AdcSystem.ts`

```typescript
export class AdcSystem extends BasicAvionicsSystem<AdcSystemEvents> {
  public onInit(): void {
    // Map baro setting from ADC publisher to system events
    this.dataSourceSubscriber
      .on(`adc_altimeter_baro_setting_inhg_${this.adcIndex}`)
      .handle(baroInhg => {
        // Publish to system events
        this.publisher.pub(
          `adc_altimeter_baro_setting_inhg_${this.altimeterIndex}`,
          baroInhg,
          true,
          true
        );

        // Trigger altitude recalculation
        this.updateAltitude();
      });
  }

  private updateAltitude(): void {
    // Altitude calculation uses current baro setting
    // MSFS handles the actual calculation
    // We just distribute the value
  }
}
```

### Altimeter Tape Display:

```typescript
export class AltimeterTape extends DisplayComponent<AltimeterTapeProps> {
  private readonly baroSetting = ConsumerSubject.create(null, 29.92);
  private readonly indicatedAltitude = ConsumerSubject.create(null, 0);

  // Altitude display updates automatically when baro changes
  // MSFS recalculates indicated altitude internally
}
```

---

## 10. 🎨 Common Patterns & Utilities

### NumberUnitSubject Pattern (Recommended)

```typescript
// Best practice for handling values with units
import { NumberUnitSubject, UnitType } from '@microsoft/msfs-sdk';

export class BaroDisplay extends DisplayComponent<BaroDisplayProps> {
  // Create subject with unit
  private readonly baroSetting = NumberUnitSubject.create(
    UnitType.IN_HG.createNumber(29.92)
  );

  // Update from EventBus
  private readonly baroConsumer = ConsumerSubject.create(null, 29.92);

  public onAfterRender(): void {
    this.baroConsumer.setConsumer(
      this.props.bus.getSubscriber<AdcEvents>()
        .on('adc_altimeter_baro_setting_inhg_1')
    );

    // Pipe to NumberUnitSubject
    this.baroConsumer.sub(inhg => {
      this.baroSetting.set(inhg, UnitType.IN_HG);
    });
  }

  // Display with automatic unit conversion
  public render(): VNode {
    return (
      <div>
        {/* Display in inHg */}
        <div>{this.baroSetting.map(val =>
          val.asUnit(UnitType.IN_HG).toFixed(2)
        )}</div>

        {/* Display in hPa */}
        <div>{this.baroSetting.map(val =>
          val.asUnit(UnitType.HPA).toFixed(0)
        )}</div>
      </div>
    );
  }
}
```

### Unit Conversion Utilities:

```typescript
export class BaroUtils {
  /**
   * Converts inHg to raw SimVar value
   */
  public static inhgToRaw(inhg: number): number {
    return Math.round(inhg * 33.86388 * 16);
  }

  /**
   * Converts raw SimVar value to inHg
   */
  public static rawToInhg(raw: number): number {
    return (raw / 16) * 0.02953;
  }

  /**
   * Converts inHg to hPa
   */
  public static inhgToHpa(inhg: number): number {
    return inhg * 33.86388;
  }

  /**
   * Converts hPa to inHg
   */
  public static hpaToInhg(hpa: number): number {
    return hpa * 0.02953;
  }

  /**
   * Checks if baro is at standard pressure
   */
  public static isStandard(inhg: number, tolerance = 0.005): boolean {
    return Math.abs(inhg - 29.92) < tolerance;
  }

  /**
   * Validates baro setting is in valid range
   */
  public static isValid(inhg: number): boolean {
    return inhg >= 28.00 && inhg <= 31.00;
  }

  /**
   * Clamps baro to valid range
   */
  public static clamp(inhg: number): number {
    return Math.max(28.00, Math.min(31.00, inhg));
  }
}
```

---

## 11. 📊 Implementation Comparison Table

| Aspect | G1000 | G3000 | G3X Touch | WT21 | Epic2 |
|--------|-------|-------|-----------|------|-------|
| **Complexity** | Low | High | Medium | Medium | Medium |
| **Units Support** | inHg, hPa | inHg, hPa | inHg, hPa, mmHg | inHg, hPa | inHg, hPa, mb |
| **STD Mode** | Toggle | With preselect | Quick button | With preset box | Standard |
| **Input Method** | Knob | Knob/Touch | Touch dialog | Knob | Knob |
| **Settings** | Single | Per-PFD indexed | Per-GDU | Single | Synced across |
| **Preselect** | No | Yes | No | Yes | No |
| **Field Button** | No | No | Yes | No | No |
| **Best For** | Simple integration | Full-featured | Touch interfaces | Business jets | Advanced display |

---

## 12. 💡 Implementation Tips

### Starting Your Own Baro Setting:

**1. Set Up Data Flow:**

```typescript
// Subscribe to baro setting from ADC
const adc = bus.getSubscriber<AdcEvents>();
const baroInhg = ConsumerSubject.create(
  adc.on('adc_altimeter_baro_setting_inhg_1'),
  29.92
);

// Create units setting
const settingManager = AltimeterUserSettings.getManager(bus);
const isMetric = settingManager.getSetting('altimeterBaroMetric');
```

**2. Implement Display:**

```typescript
public render(): VNode {
  return (
    <div class="baro-display">
      <div class="value">
        {baroInhg.map(inhg => {
          if (isMetric.get()) {
            return (inhg * 33.86388).toFixed(0);  // hPa
          }
          return inhg.toFixed(2);  // inHg
        })}
      </div>
      <div class="units">
        {isMetric.map(m => m ? 'hPa' : 'IN')}
      </div>
    </div>
  );
}
```

**3. Handle Input:**

```typescript
private adjustBaro(direction: 1 | -1): void {
  const current = this.baroInhg.get();
  const isMetric = this.isMetric.get();

  let newValue: number;
  if (isMetric) {
    const hpa = current * 33.86388;
    newValue = (hpa + direction) / 33.86388;
  } else {
    newValue = current + (direction * 0.01);
  }

  // Clamp and set
  newValue = Math.max(28.00, Math.min(31.00, newValue));
  const raw = Math.round(newValue * 33.86388 * 16);
  SimVar.SetSimVarValue('K:KOHLSMAN_SET', 'number', raw);
}
```

**4. Add STD Button:**

```typescript
private toggleStd(): void {
  const current = this.baroInhg.get();
  const isStd = Math.abs(current - 29.92) < 0.01;

  if (!isStd) {
    // Set to standard
    const raw = Math.round(29.92 * 33.86388 * 16);  // 16211
    SimVar.SetSimVarValue('K:KOHLSMAN_SET', 'number', raw);
  }
}
```

---

## 13. 🎯 Advanced Features

### Baro Preselect (G3000 Style)

```typescript
export class BaroPreselect {
  private readonly preselect = Subject.create<number | null>(null);
  private readonly isStd = Subject.create(false);

  public toggleStd(): void {
    if (this.isStd.get()) {
      // Restore preselect
      const value = this.preselect.get();
      if (value !== null) {
        this.setBaro(value);
      }
      this.isStd.set(false);
      this.preselect.set(null);
    } else {
      // Save current, set to STD
      this.preselect.set(this.currentBaro.get());
      this.setBaro(29.92);
      this.isStd.set(true);
    }
  }

  public adjustPreselect(direction: 1 | -1): void {
    if (!this.isStd.get()) return;

    let value = this.preselect.get() ?? 29.92;
    value += direction * 0.01;
    value = Math.max(28.00, Math.min(31.00, value));
    this.preselect.set(value);
  }
}
```

### Field Elevation Button (G3X Touch)

```typescript
private setToFieldElevation(): void {
  // Get airport elevation
  const elevation = SimVar.GetSimVarValue('GROUND ALTITUDE', 'feet');

  // Calculate pressure for field elevation
  // Standard lapse rate: 1 inHg per 1000 ft
  const pressureOffset = elevation / 1000;
  const fieldPressure = 29.92 + pressureOffset;

  // Clamp to valid range
  const clampedPressure = Math.max(28.00, Math.min(31.00, fieldPressure));

  this.setBaro(clampedPressure);
}
```

### Automatic STD Transition

```typescript
// Auto-switch to STD above transition altitude
export class AutoStdManager {
  private readonly transitionAltitude = 18000;  // FL180 in US

  constructor(bus: EventBus) {
    const adc = bus.getSubscriber<AdcEvents>();

    adc.on('indicated_alt').handle(altitude => {
      if (altitude > this.transitionAltitude) {
        // Above transition, use STD
        if (!this.isStd()) {
          this.setStd();
        }
      } else {
        // Below transition, use local QNH
        if (this.isStd()) {
          this.restoreLocal();
        }
      }
    });
  }
}
```

---

## 14. 📚 Key Files Reference

### SDK Foundation:
- `src/sdk/instruments/Adc.ts` - ADC publisher with baro setting
- `src/sdk/data/NumberUnitSubject.ts` - Unit-aware subjects
- `src/sdk/settings/UserSettingManager.ts` - Settings persistence

### G1000:
- `src/workingtitle-instruments-g1000/html_ui/PFD/Components/UI/Altimeter/BaroSettingDisplay.tsx`
- `src/workingtitle-instruments-g1000/html_ui/Shared/UI/Controllers/BaroKnobInputHandler.ts`
- `src/workingtitle-instruments-g1000/html_ui/Shared/Settings/AltimeterSettings.ts`

### G3000 (Most Advanced):
- `src/workingtitle-instruments-g3000/wtg3000common/html_ui/Shared/Components/BaroSet/BaroSetHandler.ts`
- `src/workingtitle-instruments-g3000/html_ui/PFD/Components/PfdBaroSetDisplay/PfdBaroSetDisplay.tsx`

### G3X Touch (Touch Input):
- `src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/BaroSet/BaroSetDisplay.tsx`
- `src/workingtitle-instruments-g3x-touch/html_ui/Shared/Components/BaroSet/BaroSetDialog.tsx`

### WT21:
- `src/workingtitle-instruments-wt21/instruments/html_ui/Pages/VCockpit/Instruments/WT21v2/PFD/Components/BaroSet/BaroSet.tsx`

### Epic2:
- `src/workingtitle-instruments-epic2/shared/Settings/BaroSettings.ts`

---

This guide demonstrates how settings persistence, units conversion, and multi-display synchronization work in the Garmin SDK. The barometric pressure setting is an excellent learning component that bridges simple interactive controls with complex system integration!
