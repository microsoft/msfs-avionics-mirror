# Garmin SDK Learning Path for MSFS Avionics

A comprehensive, progressively complex series of guides to master the Garmin SDK for building custom avionics instruments in Microsoft Flight Simulator.

---

## 📚 Complete Documentation Suite

This documentation provides **6 comprehensive guides** totaling **212 KB** covering everything from basic SDK architecture to complete flight management systems.

### 🎯 Learning Progression

The guides are designed to be studied in order, with each building on concepts from the previous ones.

---

## 📖 The Guides

### 1. Foundation: SDK Overview
**File:** `garmin-sdk-overview.md` (19 KB)

**What You'll Learn:**
- SDK location and structure
- EventBus architecture (the backbone of everything)
- Avionics Systems (ADC, AHRS, GPS, etc.)
- Data Providers pattern
- Flight Management System (FMS) basics
- Subscribable/reactive programming
- Navigation reference system
- Plugin architecture
- Real-world examples (G1000, G3000, G3X Touch)

**When to Read:** Start here! Essential foundation for everything else.

---

### 2. Complex Display: Attitude Indicator
**File:** `attitude-indicator-implementation-guide.md` (48 KB)

**Complexity:** Medium
**Type:** Display-only component

**What You'll Learn:**
- AHRS data flow (SimVars → EventBus → Display)
- AHRS System with state management and validation
- Canvas rendering with transform matrices
- SVG overlay techniques
- Projection-based rendering (HorizonProjection)
- Layered rendering architecture
- Synthetic Vision Technology (SVT) integration
- Flight Director integration
- Advanced features (pitch/roll limits, unusual attitude warnings)
- Data smoothing and validation

**Covered Implementations:**
- G1000 NXi (SVG + CSS transforms)
- G3000/G5000 (Canvas + projection system)
- G3X Touch (touch-optimized)
- WT21 (HTML/CSS approach)
- Epic2 (pitch clamping)

**When to Read:** After SDK Overview. Shows complex display patterns without user input complexity.

---

### 3. Simple Interactive: Heading Bug
**File:** `heading-bug-implementation-guide.md` (40 KB)

**Complexity:** Low-Medium
**Type:** Interactive component with bidirectional data flow

**What You'll Learn:**
- User input handling (knobs, buttons, touch)
- SimVar storage and persistence
- EventBus distribution
- Reactive visual updates
- Autopilot integration
- State management (white vs magenta)
- Platform-specific UI (knobs vs touch)
- MappedSubject for reactive calculations

**Covered Implementations:**
- Epic2 (clearest reactive pattern example)
- G1000 (simple approach)
- G3000 (complex state with mag var)
- G3X Touch (dialog-based touch input)
- WT21 (minimal overhead)

**Key Concepts:**
- `ap_heading_selected` event topic
- Knob event interception
- Heading sync (set to current)
- Visual state based on AP mode

**When to Read:** After Attitude Indicator. Perfect introduction to interactive components.

---

### 4. Settings & Units: Barometric Pressure Setting
**File:** `baro-setting-implementation-guide.md` (33 KB)

**Complexity:** Medium
**Type:** Interactive with settings persistence and units conversion

**What You'll Learn:**
- UserSettingManager for persistence
- Units conversion (inHg ↔ hPa ↔ mmHg)
- NumberUnitSubject pattern
- Raw SimVar value handling
- Settings synchronization across displays
- Input validation and range checking
- STD mode implementation
- Baro preselect (advanced feature)
- Display formatting with precision

**Covered Implementations:**
- G1000 (basic implementation)
- G3000 (advanced with preselect)
- G3X Touch (touch dialog entry)
- WT21 (preset box)
- Epic2 (settings sync)

**Key Concepts:**
- `KOHLSMAN SETTING MB` SimVar (raw units: 1/16 hPa)
- Conversion formulas: `inHg * 33.86388 * 16 = raw`
- Valid ranges: 28.00-31.00 inHg, 948-1084 hPa
- LocalStorage persistence

**When to Read:** After Heading Bug. Introduces settings system and units handling.

---

### 5. Multiple Sources: CDI/Course Indicator
**File:** `cdi-course-indicator-implementation-guide.md` (37 KB)

**Complexity:** Medium-High
**Type:** Multi-source navigation display with dynamic scaling

**What You'll Learn:**
- Navigation source architecture (GPS, VOR, LOC)
- NavIndicatorController for source management
- NavReferenceSource and NavReferenceIndicator patterns
- NavdataComputer for deviation calculations
- Dynamic CDI scaling (ENR, TERM, APPR sensitivity)
- TO/FROM indicator logic
- OBS course selection
- Source switching (manual and automatic)
- Autopilot integration (NAV mode, GPSS)
- Bearing pointers

**Covered Implementations:**
- G1000 (traditional HSI)
- G3000 (NavReferenceIndicator pattern)
- G3X Touch (touch-optimized with symbols)
- WT21 (business jet HSI)
- Epic2 (modern glass cockpit)

**Key Concepts:**
- Normalized deviation: -1.0 to +1.0
- `lateralDeviation = -xtk / deviationScale`
- GPS: Linear distance (NM), VOR/LOC: Angular (degrees)
- CDIScaleLabel enum (Enroute, Terminal, Approach, etc.)
- Scale transitions based on flight phase

**When to Read:** After Baro Setting. Shows complex data provider patterns and multiple source coordination.

---

### 6. Complete System: Flight Plan Waypoint Management
**File:** `flight-plan-waypoint-management-guide.md` (36 KB)

**Complexity:** High
**Type:** Complete flight management system with async operations

**What You'll Learn:**
- FlightPlanner architecture (multiple flight plan support)
- FlightPlan structure (segments, legs, procedures)
- FMS (Flight Management System) - 5400+ lines of logic!
- FacilityLoader for database searches
- Asynchronous facility loading (Promises)
- Waypoint insertion, removal, and activation
- Procedure integration (SIDs, STARs, approaches)
- Direct-to functionality (random and existing)
- FlightPlanStore pattern with SubscribableArray
- Batch modifications
- Flight path calculation
- Map integration

**Covered Implementations:**
- G1000 (FPLDetailsStore + Controller)
- G3000 (FlightPlanStore with SubscribableArray)
- G3X Touch (FlightPlanDataArray for touch)

**Key Concepts:**
- FlightPlan indices: 0=Primary, 1=DTO, 2=Preview
- LegDefinition with calculated data
- Facility types: Airport, VOR, NDB, Intersection, User
- ICAO V2 format (type, ident, region, airport)
- Direct-to 3-leg sequence
- Procedure leg building and remapping
- Event flow: `fplLegChange`, `fplSegmentChange`, etc.

**When to Read:** After CDI/Course. Completes your knowledge with full FMS integration.

---

## 🎓 Learning Path Timeline

### Week 1: Foundation
**Read:** SDK Overview + Attitude Indicator

**Goals:**
- Understand EventBus architecture
- Learn avionics systems pattern
- Study display rendering techniques
- Explore reactive programming with Subscribables

**Practice:**
- Create a simple display component
- Subscribe to AHRS data
- Render basic SVG or Canvas graphics

---

### Week 2: Basic Interaction
**Read:** Heading Bug

**Goals:**
- Understand user input handling
- Learn SimVar read/write patterns
- Study state management
- Explore autopilot integration

**Practice:**
- Create a heading bug component
- Handle knob rotation events
- Implement visual state changes
- Add autopilot color feedback

---

### Week 3: Settings & Units
**Read:** Barometric Pressure Setting

**Goals:**
- Master UserSettingManager
- Learn units conversion patterns
- Understand settings persistence
- Study multi-display synchronization

**Practice:**
- Create a baro setting component
- Implement units switching (inHg/hPa)
- Add settings persistence
- Handle STD mode

---

### Week 4: Multiple Sources
**Read:** CDI/Course Indicator

**Goals:**
- Understand navigation source architecture
- Learn data provider patterns
- Study dynamic scaling systems
- Explore source switching logic

**Practice:**
- Create a CDI component
- Implement multiple nav sources
- Add deviation calculation
- Handle source selection

---

### Week 5: Complex Systems
**Read:** Flight Plan Waypoint Management

**Goals:**
- Master async operations
- Learn FMS architecture
- Understand flight plan structure
- Study procedure integration

**Practice:**
- Create a flight plan list
- Implement waypoint search
- Add direct-to functionality
- Handle procedure insertion

---

### Week 6: Build Your Own!
**Project:** Complete Custom Instrument

**Options:**
- Simple VFR GPS navigator
- Basic autopilot control panel
- Minimalist PFD
- Custom MFD page
- Backup attitude indicator
- Flight plan manager

**What You'll Use:**
- All patterns from previous weeks
- EventBus for data flow
- Multiple systems integration
- User input handling
- Settings persistence
- Reactive UI updates

---

## 📊 Progression Summary

| Guide | Complexity | Input | Output | Data Sources | State |
|-------|------------|-------|--------|--------------|-------|
| **SDK Overview** | Foundation | N/A | N/A | N/A | Learn architecture |
| **Attitude Indicator** | Medium | None | Display | 1 (AHRS) | Simple |
| **Heading Bug** | Low-Medium | Knob/Button | Display | 1 (AP) | Simple |
| **Baro Setting** | Medium | Knob/Touch | Display | 1 (ADC) | Settings + Units |
| **CDI/Course** | Medium-High | OBS Knob | Display | 3-4 (Nav sources) | Source selection |
| **Flight Plan** | High | Search/Edit | List + Map | Many (DB, FMS, Nav) | Complex async |

---

## 🎯 What Each Guide Teaches

### Heading Bug → Baro Setting
**New Concepts:**
- ✅ Settings persistence with UserSettingManager
- ✅ Units conversion patterns (NumberUnitSubject)
- ✅ Input validation and range checking
- ✅ Multi-display synchronization
- ✅ Raw SimVar value handling

---

### Baro Setting → CDI/Course
**New Concepts:**
- ✅ Multiple data sources management
- ✅ NavIndicator system architecture
- ✅ Data provider patterns (aggregation)
- ✅ Dynamic scaling based on flight phase
- ✅ Source switching logic
- ✅ Complex derived calculations

---

### CDI/Course → Flight Plan
**New Concepts:**
- ✅ Asynchronous operations (Promises)
- ✅ FacilityLoader and database searches
- ✅ FMS system integration
- ✅ SubscribableArray for reactive lists
- ✅ Complex state management
- ✅ Batch operations
- ✅ Cross-system coordination (Map, Nav, FMS)
- ✅ Procedure handling

---

## 🚀 What You Can Build

After completing all guides, you'll have the knowledge to build:

### ✅ Primary Flight Displays (PFD)
- Attitude indicator
- Airspeed/altitude tapes
- HSI with CDI
- Autopilot annunciators
- Barometric setting display

### ✅ Multi-Function Displays (MFD)
- Moving map
- Flight plan display
- Weather radar
- Traffic display
- Engine instruments

### ✅ Navigation Systems
- GPS navigator
- VOR/ILS receivers
- Course guidance
- Waypoint database
- Nearest airports

### ✅ Flight Management Systems
- Flight plan creation/editing
- Procedure selection (SIDs, STARs, approaches)
- Direct-to functionality
- Flight plan storage/recall
- Performance calculations

### ✅ Autopilot Interfaces
- Mode selection
- Target setting (altitude, heading, speed)
- Approach coupling
- Flight director commands

### ✅ Touch-Enabled Glass Cockpits
- Touch keyboard input
- Gesture handling
- Dialog systems
- Touch-optimized layouts

### ✅ Custom Avionics Instruments
- Backup instruments
- Specialized displays
- Custom gauges
- Integration with existing systems

---

## 📈 By the Numbers

| Guide | Size | Lines | Topics | Examples | Complexity |
|-------|------|-------|--------|----------|------------|
| SDK Overview | 19 KB | ~800 | 12 | 5+ instruments | Foundation |
| Attitude Indicator | 48 KB | ~2000 | 17 | 5 implementations | Medium |
| Heading Bug | 40 KB | ~1400 | 17 | 5 implementations | Low-Medium |
| Baro Setting | 33 KB | ~1200 | 14 | 5 implementations | Medium |
| CDI/Course | 37 KB | ~1600 | 14 | 5 implementations | Medium-High |
| Flight Plan | 36 KB | ~1400 | 14 | 3 implementations | High |
| **Total** | **212 KB** | **~9400** | **88+** | **28+** | **Complete** |

---

## 💡 Study Tips

### 1. **Read in Order**
Each guide builds on concepts from previous ones. Don't skip ahead!

### 2. **Code Along**
Try implementing simplified versions of each component as you read.

### 3. **Explore the Source**
Use the file paths provided to examine actual implementations.

### 4. **Start Simple**
- G1000 implementations are usually the simplest
- WT21 often has the most minimal code
- G3000 shows advanced patterns
- G3X Touch demonstrates touch optimization

### 5. **Use the SDK Docs**
Reference the official API documentation: https://microsoft.github.io/msfs-avionics-mirror/2024/

### 6. **Experiment**
- Modify existing components
- Mix patterns from different instruments
- Add your own features

### 7. **Ask Questions**
If something is unclear, examine multiple implementations of the same component.

---

## 🔧 Development Setup

### Prerequisites:
- Node.js (version specified in repository)
- MSFS SDK
- Code editor (VS Code recommended)

### Build Process:
```bash
# Install dependencies
npm install

# Build an instrument (e.g., G1000)
npm run build:g1000

# Watch for changes
npm run build:g1000:watch
```

### Testing:
- Load into MSFS Developer Mode
- Use in-game inspector (DevTools)
- Monitor EventBus topics
- Check SimVar values

---

## 📁 Repository Structure

```
msfs-avionics-mirror/
├── src/
│   ├── sdk/                           # Base SDK (all instruments use)
│   │   ├── data/EventBus.ts          # Central event system
│   │   ├── instruments/              # Base publishers (ADC, AHRS, etc.)
│   │   ├── flightplan/               # Flight planning core
│   │   └── components/               # Base UI components
│   │
│   ├── garminsdk/                     # Garmin-specific SDK
│   │   ├── flightplan/Fms.ts         # Flight Management System
│   │   ├── navigation/               # Nav computers, indicators
│   │   ├── system/                   # Garmin avionics systems
│   │   └── components/               # Garmin UI components
│   │
│   └── workingtitle-instruments-*/   # Instrument implementations
│       ├── g1000/                    # G1000 NXi
│       ├── g3000/                    # G3000/G5000
│       ├── g3x-touch/                # G3X Touch
│       ├── wt21/                     # WT21 (Citation)
│       └── epic2/                    # Epic2/Apex
│
└── docs/                              # This documentation!
    ├── README.md                      # This file
    ├── garmin-sdk-overview.md
    ├── attitude-indicator-implementation-guide.md
    ├── heading-bug-implementation-guide.md
    ├── baro-setting-implementation-guide.md
    ├── cdi-course-indicator-implementation-guide.md
    └── flight-plan-waypoint-management-guide.md
```

---

## 🎓 Certification

After completing all guides and building a custom instrument, you will understand:

- ✅ EventBus architecture and reactive programming
- ✅ Avionics systems (ADC, AHRS, GPS, FMS)
- ✅ User input handling (knobs, buttons, touch)
- ✅ Settings persistence and synchronization
- ✅ Units conversion and formatting
- ✅ Navigation sources and data providers
- ✅ Flight plan management
- ✅ Asynchronous operations
- ✅ Map integration
- ✅ Autopilot integration
- ✅ Procedure handling
- ✅ Display rendering (Canvas, SVG, HTML)
- ✅ Component architecture and patterns

---

## 🌟 Next Steps

After mastering these guides:

1. **Contribute to Working Title Projects**
   - Fix bugs
   - Add features
   - Improve documentation

2. **Build Custom Instruments**
   - Specialized displays for specific aircraft
   - Training instruments
   - Backup systems

3. **Create New Implementations**
   - Different aircraft types
   - Regional variations
   - Experimental avionics

4. **Share Your Knowledge**
   - Write additional guides
   - Create tutorials
   - Help other developers

---

## 📞 Resources

- **Official SDK Docs:** https://microsoft.github.io/msfs-avionics-mirror/2024/
- **MSFS SDK:** https://docs.flightsimulator.com/
- **Working Title GitHub:** https://github.com/microsoft/msfs-avionics-mirror
- **MSFS Forums:** https://forums.flightsimulator.com/

---

## 🙏 Acknowledgments

This learning path is built upon the excellent work of:
- Working Title team for the comprehensive SDK and instrument implementations
- Microsoft Flight Simulator team for the platform
- The MSFS community for feedback and support

---

## 📝 License

This documentation follows the same license as the MSFS avionics mirror repository.

---

**Happy Learning! Clear skies and smooth coding! ✈️**

*Last Updated: November 2024*
