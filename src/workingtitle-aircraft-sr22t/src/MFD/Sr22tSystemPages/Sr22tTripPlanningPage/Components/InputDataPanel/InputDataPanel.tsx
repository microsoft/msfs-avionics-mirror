import {
  AdcEvents, ClockEvents, CompiledMapSystem, ConsumerSubject, EngineEvents, EventBus, Facility, FlightPlannerEvents, FSComponent, GNSSEvents, LegDefinition,
  MapIndexedRangeModule, MapSystemBuilder, MathUtils, SetSubject, Subject, Subscribable, Vec2Math, VecNMath, VNode
} from '@microsoft/msfs-sdk';
import {
  Fms, GarminMapKeys, MapFlightPlanFocusModule, MapPointerController, MapPointerInfoLayerSize, MapPointerModule, MapRangeController, MapTerrainMode,
  MapTerrainModule
} from '@microsoft/msfs-garminsdk';
import {
  DigitInput, FmsHEvent, FuelTotalizerSimVars, G1000UiControlWrapper, GenericNumberInput, MapBuilder, MapUserSettings, MapWaypointIconImageCache, UiControl, UiView, UiViewProps,
  UnitsUserSettings
} from '@microsoft/msfs-wtg1000';

import {
  DisplayFieldData, DisplayFieldFormat, Sr22tTPDisplayField, NumberInputFieldData, Sr22tTPNumberInputField, Sr22tTPBarometricInputField, Sr22tTPDepartureTimeInputField
} from '../Shared/Fields';
import { TripPlanningStore } from '../../../Stores';
import { InputModes, LegModes } from '../../Sr22tTripPlanningModes';

import '../../Sr22tTripPlanningPage.css';
import './InputDataPanel.css';

/** The properties for an Other Stats Panel component. */
interface InputDataPanelProps extends UiViewProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The function to use to register the group's controls. */
  registerFunc: (ctrl: UiControl, unregister?: boolean) => void;

  /** The flight management system. */
  fms: Fms;

  /** The Trip Planning data store. */
  store: TripPlanningStore;
}

/** Bi-directional mapping between input number subjects with decimal places to output number subjects without decimal places.
 * The output subject contains the multiplied input number, so that the ones represent the smallest decimal place of the input.
 * This is needed for fractional values as GenericNumberInput can only handle full digits.
 */
class DecimalMapper {
  /**
   * Constructor
   * @param inputSubject input
   * @param outputSubject output
   * @param decimalPlaces number of decimal places
   */
  constructor(
    private readonly inputSubject: Subject<number>,
    private readonly outputSubject: Subject<number>,
    private readonly decimalPlaces: (1 | 2)) {
    const multiplier = Math.pow(10, decimalPlaces);
    const inputOutputSub = inputSubject.sub(newInputValue => {
      inputOutputSub.pause();
      outputSubject.set(newInputValue * multiplier);
      inputOutputSub.resume();
    });
    const outputInputSub = outputSubject.sub(newOutputValue => {
      outputInputSub.pause();
      inputSubject.set(newOutputValue / multiplier);
      outputInputSub.resume();
    });
  }
}

/** Input Data Panel component for the Trip Planning page. */
export class InputDataPanel<T extends InputDataPanelProps = InputDataPanelProps> extends UiView<T, Facility> {
  private readonly inputBaroRef = FSComponent.createRef<DigitInput>();
  private readonly inputTimeInputRef = FSComponent.createRef<GenericNumberInput>();


  // Page mode boolean subject:
  private readonly isAutomaticInputMode = Subject.create(true);
  private readonly inputModeUnitCss = Subject.create('tp-labeled-number-unit');

  // Automatic data sources: sim and event bus data subjects
  private readonly sub = this.props.bus.getSubscriber<FuelTotalizerSimVars & ClockEvents & AdcEvents & GNSSEvents & FlightPlannerEvents & EngineEvents>();

  private readonly simTimeConsumer = ConsumerSubject.create(this.sub.on('simTime').atFrequency(1), 0);                    // milliseconds
  private readonly groundSpeedConsumer = ConsumerSubject.create(this.sub.on('ground_speed').whenChangedBy(1), 0);                  // knots
  private readonly iasConsumer = ConsumerSubject.create(this.sub.on('ias').whenChangedBy(1), 0);                          // knots
  private readonly altConsumer = ConsumerSubject.create(this.sub.on('indicated_alt').whenChangedBy(1), 0);                // feet
  private readonly baroInConsumer = ConsumerSubject.create(this.sub.on('altimeter_baro_setting_inhg').whenChanged(), 0);  // InchHg
  private readonly tatConsumer = ConsumerSubject.create(this.sub.on('ram_air_temp_c').whenChangedBy(1), 0);               // °C
  private readonly fuelFlowConsumer = ConsumerSubject.create(this.sub.on('fuel_flow_1').withPrecision(0.1), 0);
  private readonly fuelRemainingConsumer = ConsumerSubject.create(this.sub.on('remainingFuel').withPrecision(1), 0);
  private readonly departureTimeMillisSubject = Subject.create(0);

  // As manual input maintains an own set of variables, we need backup variables to store the values for it:
  private manualBackupDepartureTimeMillis = 0;
  private manualBackupGroundSpeed = 0;
  private manualBackupCalibratedAirspeed = 0;
  private manualBackupIndicatedAltitude = 0;
  private manualBackupBarometricPressure = 0;
  private manualBackupTotalAirTemp = 0;
  private manualBackupFuelFlow = 0;
  private manualBackupFuelOnBoard = 0;
  private manualBackupAvailable = false;   // Will become true after the first Automatic -> Manual -> Automatic cycle.

  // Input data subjects:
  private readonly fplIndex = Subject.create(0);  // We do not support stored flight plans -> will always stay 0!

  private readonly legTargetNameSubject = Subject.create('_ _ _ _ _ _');
  private readonly editableEmulationCss = SetSubject.create(['tp-editable-emulation-value']);

  // Subject for the mode annunciation in the title:
  private readonly titleDisplayMode = Subject.create('');

  // DecimalMappers, these map input subjects to fractionless output:
  private readonly fuelFlowTenfold = Subject.create(0);
  private readonly fuelFlowMapper = new DecimalMapper(this.props.store.inputData.fuelFlow, this.fuelFlowTenfold, 1);



  // Subjects and formatter for the LEG selector:
  private readonly legSelectionTargetIndex = Subject.create(0);
  private readonly legSelectionTargetMax = Subject.create(1);           // Number items for the leg selector (# of waypoints + 1 for REM)
  private readonly legSelectionFormatter = ((value: number): string => {
    if (value === 0) {
      // 0 stands for the REM (=remaining) setting:
      return 'REM';
    } else if (value < this.legSelectionTargetMax.get()) {
      if (value < 10) {
        return '0' + value.toFixed(0) + '\u00A0\u00A0\u00A0\u00A0';
      } else {
        return value.toFixed(0) + '\u00A0\u00A0\u00A0\u00A0';
      }
    } else {
      return '';
    }
  });

  /** @inheritdoc */
  public onAfterRender(): void {

    // Handle the automatic/manual mode:
    this.props.store.inputMode.sub(newMode => {
      this.titleDisplayMode.set(newMode === InputModes.Auto ? 'Automatic' : 'Manual');

      const newIsDisabledState = newMode === InputModes.Auto;
      this.inputBaroRef.instance.setDisabled(newIsDisabledState);
      this.inputTimeInputRef.instance.setDisabled(newIsDisabledState);

      this.isAutomaticInputMode.set(newIsDisabledState);
    }, true); // -> no initial notify!

    this.isAutomaticInputMode.sub(newIsDisabledState => {
      if (newIsDisabledState) {
        // Enable Automatic input mode:
        this.inputModeUnitCss.set('tp-labeled-number-unit');

        // As manual input maintains an own set of variables, we need to backup the manual input when going to automatic.
        // After that we restore the subjects with the measured live data:
        this.manualBackupDepartureTimeMillis = this.departureTimeMillisSubject.get();
        this.manualBackupGroundSpeed = this.props.store.inputData.groundSpeed.get();
        this.manualBackupCalibratedAirspeed = this.props.store.inputData.calibratedAirspeed.get();
        this.manualBackupIndicatedAltitude = this.props.store.inputData.indicatedAltitude.get();
        this.manualBackupBarometricPressure = this.props.store.inputData.barometricPressure.get();
        this.manualBackupTotalAirTemp = this.props.store.inputData.totalAirTemp.get();
        this.manualBackupFuelFlow = this.props.store.inputData.fuelFlow.get();
        this.manualBackupFuelOnBoard = this.props.store.inputData.fuelOnBoard.get();
        this.manualBackupAvailable = true;

        this.departureTimeMillisSubject.set(this.simTimeConsumer.get() % 86400000);
        this.props.store.inputData.groundSpeed.set(this.groundSpeedConsumer.get());
        this.props.store.inputData.calibratedAirspeed.set(this.iasConsumer.get());
        this.props.store.inputData.indicatedAltitude.set(this.altConsumer.get());
        this.props.store.inputData.barometricPressure.set(this.baroInConsumer.get());
        this.props.store.inputData.totalAirTemp.set(this.tatConsumer.get());
        this.props.store.inputData.fuelFlow.set(this.fuelFlowConsumer.get());
        this.props.store.inputData.fuelOnBoard.set(this.fuelRemainingConsumer.get());
      } else {
        // Enable Manual input mode:
        this.inputModeUnitCss.set('tp-labeled-editable-number-unit');

        // For manual input we set the subjects with the backed up variables from before:
        if (this.manualBackupAvailable === true) {
          this.departureTimeMillisSubject.set(this.manualBackupDepartureTimeMillis);
          this.props.store.inputData.groundSpeed.set(this.manualBackupGroundSpeed);
          this.props.store.inputData.calibratedAirspeed.set(this.manualBackupCalibratedAirspeed);
          this.props.store.inputData.indicatedAltitude.set(this.manualBackupIndicatedAltitude);
          this.props.store.inputData.barometricPressure.set(this.manualBackupBarometricPressure);
          this.props.store.inputData.totalAirTemp.set(this.manualBackupTotalAirTemp);
          this.props.store.inputData.fuelFlow.set(this.manualBackupFuelFlow);
          this.props.store.inputData.fuelOnBoard.set(this.manualBackupFuelOnBoard);
        }
      }
    }); // -> no initial notify!

    // In auto mode, we connect the automatic sources with the stores input subjects:
    this.simTimeConsumer.sub(newSimTime => {
      if (this.props.store.inputMode.get() === InputModes.Auto) {
        this.departureTimeMillisSubject.set(newSimTime % 86400000); // ms since 1970 to daytime in milliseconds
      }
    }, true);

    this.departureTimeMillisSubject.map((newDepTime) => {
      this.props.store.inputData.departureTime.set(newDepTime / 3600000);
    });

    this.groundSpeedConsumer.sub(newGroundSpeed => {
      if (this.props.store.inputMode.get() === InputModes.Auto) {
        this.props.store.inputData.groundSpeed.set(newGroundSpeed);
      }
    }, true);

    this.iasConsumer.sub(newIas => {
      if (this.props.store.inputMode.get() === InputModes.Auto) {
        this.props.store.inputData.calibratedAirspeed.set(newIas);
      }
    }, true);

    this.altConsumer.sub(newAltitude => {
      if (this.props.store.inputMode.get() === InputModes.Auto) {
        this.props.store.inputData.indicatedAltitude.set(newAltitude);
      }
    }, true);

    this.baroInConsumer.sub(newBaroPressure => {
      if (this.props.store.inputMode.get() === InputModes.Auto) {
        this.props.store.inputData.barometricPressure.set(newBaroPressure);
      }
    }, true);

    this.tatConsumer.sub(newTat => {
      if (this.props.store.inputMode.get() === InputModes.Auto) {
        this.props.store.inputData.totalAirTemp.set(newTat);
      }
    }, true);

    this.fuelFlowConsumer.sub(newFuelFlow => {
      if (this.props.store.inputMode.get() === InputModes.Auto) {
        this.props.store.inputData.fuelFlow.set(newFuelFlow);
      }
    }, true);

    this.fuelRemainingConsumer.sub(fuelOnBoard => {
      if (this.props.store.inputMode.get() === InputModes.Auto) {
        this.props.store.inputData.fuelOnBoard.set(fuelOnBoard);
      }
    }, true);

    // Handle changes to the LEG input, be it a particular leg or REM:
    this.legSelectionTargetIndex.sub(newIndex => {
      let legDefinitions: LegDefinition[];
      const plan = this.props.fms.getFlightPlan();
      if (newIndex === 0) {
        // Index 0 means REM is selected, so move the entire route into focus (not only the remaining legs)
        // and apply much less focus margins, otherwise the route is squeezed in the middle of the little
        // map!
        legDefinitions = Array.from(plan.legs());
        if (legDefinitions.length > 0) {
          this.mapFocusMargins.set(VecNMath.create(4, 7, 7, 7, 7));

          const legTargetName = legDefinitions[legDefinitions.length - 1]?.name ?? '-';
          this.legTargetNameSubject.set(legTargetName);
        }

        // Update the store:
        this.props.store.legMode.set(LegModes.REM);
      } else {
        // For Index 1 to leg-count, put the respective leg into focus and apply the default map focus margin.
        // This is also the case for already completed legs!
        const exclusiveLegEndIndex = newIndex + 1;
        legDefinitions = Array.from(plan.legs(false, newIndex, exclusiveLegEndIndex));
        this.mapFocusMargins.set(VecNMath.create(4, 40, 40, 40, 40));
        // Set the leg target name:
        const legTargetName = legDefinitions[0]?.name ?? '-';
        this.legTargetNameSubject.set(legTargetName);

        // Update the store:
        this.props.store.selectedLeg.set(newIndex);
        this.props.store.legMode.set(LegModes.LEG);
      }
      if (legDefinitions.length > 0) {
        this.mapFocusModule.focus.set(legDefinitions);
      }
    }, true);

    // FPL changes need to be tracked to update the flightplan related input data:
    this.sub.on('fplLoaded').handle(() => this.updateMaxLegCount());
    this.sub.on('fplSegmentChange').handle(() => this.updateMaxLegCount());
    this.sub.on('fplIndexChanged').handle(() => this.updateMaxLegCount());
    this.sub.on('fplLegChange').handle(() => this.updateMaxLegCount());
    this.sub.on('fplSegmentChange').handle(() => this.updateMaxLegCount());
    this.sub.on('fplOriginDestChanged').handle(() => this.updateMaxLegCount());
    this.sub.on('fplCreated').handle(() => this.updateMaxLegCount());
    this.sub.on('fplDeleted').handle(() => this.updateMaxLegCount());
    this.sub.on('fplCopied').handle(() => this.updateMaxLegCount());

    // Set the initial leg selection count with minimally 1:
    const plan = this.props.fms.getFlightPlan();
    this.legSelectionTargetMax.set(Math.max(1, plan.length));

    // Map definitions:
    this.mapRangeController.setRangeIndex(InputDataPanel.DEFAULT_MAP_RANGE_INDEX);
    this.mapTerrainModule.terrainMode.set(MapTerrainMode.Absolute);
    this.mapFocusModule.planHasFocus.set(true);
  }

  /** Update the leg count for the leg selector */
  private updateMaxLegCount(): void {
    const plan = this.props.fms.getFlightPlan();
    this.legSelectionTargetIndex.set(0);                      // Reset to REM
    this.legSelectionTargetMax.set(Math.max(1, plan.length)); // With 0 as max val, DigitInput does not behave well!
  }

  private fplSelectionField: DisplayFieldData = {
    title: 'FPL',
    value: this.fplIndex as Subscribable<number>,
    unit: '',
    decimals: 0,
    minDigits: 2,
    maxDigits: 2,
    format: DisplayFieldFormat.value,
    valueCssClass: this.editableEmulationCss
  };

  private gsField: NumberInputFieldData = {
    title: 'Ground Speed',
    value: this.props.store.inputData.groundSpeed,
    unit: 'KT',
    registerFunc: this.props.registerFunc,
    isInputDisabled: this.isAutomaticInputMode,
    digitCount: 3,
    decimalPlaces: 0,
  };

  private fuelFlowField: NumberInputFieldData = {
    title: 'Fuel Flow',
    value: this.fuelFlowTenfold,
    unit: 'GAL/HR',
    registerFunc: this.props.registerFunc,
    isInputDisabled: this.isAutomaticInputMode,
    digitCount: 5,
    decimalPlaces: 1,
  };

  private fobField: NumberInputFieldData = {
    title: 'Fuel on Board',
    value: this.props.store.inputData.fuelOnBoard,
    unit: 'GAL',
    registerFunc: this.props.registerFunc,
    isInputDisabled: this.isAutomaticInputMode,
    digitCount: 5,
    decimalPlaces: 0,
  };

  private casField: NumberInputFieldData = {
    title: 'Calibrated Airspeed',
    value: this.props.store.inputData.calibratedAirspeed,
    unit: 'KT',
    registerFunc: this.props.registerFunc,
    isInputDisabled: this.isAutomaticInputMode,
    digitCount: 3,
    decimalPlaces: 0,
  };

  private altField: NumberInputFieldData = {
    title: 'Indicated Altitude',
    value: this.props.store.inputData.indicatedAltitude,
    unit: 'FT',
    registerFunc: this.props.registerFunc,
    isInputDisabled: this.isAutomaticInputMode,
    digitCount: 5,
    decimalPlaces: 0,
  };

  private tatField: NumberInputFieldData = {
    title: 'Total Air Temperature',
    value: this.props.store.inputData.totalAirTemp,
    unit: '°C',
    registerFunc: this.props.registerFunc,
    isInputDisabled: this.isAutomaticInputMode,
    digitCount: 3,
    decimalPlaces: 0,
  };

  /** @inheritdoc */
  protected onViewOpened(): void {
    super.onViewOpened();
    this.compiledMap.ref.instance.wake();
  }

  /** @inheritdoc */
  protected onViewClosed(): void {
    super.onViewClosed();
    this.mapPointerController.setPointerActive(false);
    this.compiledMap.ref.instance.sleep();
    this.mapRangeController.setRangeIndex(InputDataPanel.DEFAULT_MAP_RANGE_INDEX);
  }


  /** @inheritdoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.RANGE_DEC:
        this.changeMapRangeIndex(-1);
        return true;
      case FmsHEvent.RANGE_INC:
        this.changeMapRangeIndex(1);
        return true;
      case FmsHEvent.JOYSTICK_PUSH:
        this.mapPointerController.togglePointerActive();
        return true;
    }
    return this.handleMapPointerMoveEvent(evt);
  }

  /** @inheritdoc */
  public render(): VNode {

    return (
      <div class='sr22t-system-page-section sr22t-tp-page-input-data'>
        <div class='sr22t-system-page-section-title'>Input Data</div>
        <div class='sr22t-system-page-section-content'>
          <div class="tp-page-section-column-1" >
            {this.compiledMap.map}
          </div>
          <div class='tp-page-section-column-2-and-3'>
            <div class='tp-section-two-column-title'><span class='tp-title-static-part'>Page Mode&nbsp;&nbsp;—&nbsp;&nbsp;</span>{this.titleDisplayMode}</div>
            <div class='tp-section-two-column-container'>

              <div class="tp-page-section-column-1" >
                <div id='tp-selection-input-field'>
                  <div id='tp-fpl-selection-field'>
                    <Sr22tTPDisplayField data={this.fplSelectionField} />
                  </div>
                  <div id='tp-leg-selection-field' class='tp-labeled-number' >
                    <div class='tp-labeled-number-title'>LEG</div> */
                    <G1000UiControlWrapper onRegister={this.props.registerFunc}>
                      <DigitInput
                        value={this.legSelectionTargetIndex}
                        formatter={this.legSelectionFormatter}
                        minValue={0}
                        maxValue={this.legSelectionTargetMax}
                        increment={1}
                        wrap={true}
                        scale={1}
                        class='tp-labeled-editable-number-value' />
                    </G1000UiControlWrapper>
                  </div>
                  <div id='tp-inipos-field'>P.POS</div>
                  <div id='tp-right-arrow'>
                    <svg version="1.1" stroke="#ffffff" stroke-width="2" viewBox="0 0 30 10" height="10px">
                      <g>
                        <path d="M 5 5 L 20 5 L 16 0 M 20 5 L 16 10"></path>
                      </g>
                    </svg>
                  </div>
                  <div id='tp-end-selection-name' class='tp-leg-target-name'>{this.legTargetNameSubject}</div>
                </div>
                <div class="horizontal-separator-line"></div>
                <div class='tp-labeled-number' >
                  <div class='tp-labeled-number-title'>Departure Time</div>
                  <G1000UiControlWrapper onRegister={this.props.registerFunc}>
                    <Sr22tTPDepartureTimeInputField
                      inputRef={this.inputTimeInputRef}
                      departureTimeMillisSubject={this.departureTimeMillisSubject}
                      unitStyle={this.inputModeUnitCss}
                    />
                  </G1000UiControlWrapper>
                </div>
                <Sr22tTPNumberInputField data={this.gsField} />
                <Sr22tTPNumberInputField data={this.fuelFlowField} />
                <Sr22tTPNumberInputField data={this.fobField} />
              </div>
              <div class="vertical-separator-line"></div>
              <div class="tp-page-section-column-2" >
                <Sr22tTPNumberInputField data={this.casField} />
                <Sr22tTPNumberInputField data={this.altField} />
                <div class='tp-labeled-number' >
                  <div class='tp-labeled-number-title'>Barometric Pressure</div>
                  <div class='number-input tp-labeled-number-entry-value'>
                    <G1000UiControlWrapper onRegister={this.props.registerFunc}>
                      <Sr22tTPBarometricInputField
                        inputRef={this.inputBaroRef}
                        barometricStoreValue={this.props.store.inputData.barometricPressure}
                        unitStyle={this.inputModeUnitCss}
                      />
                    </G1000UiControlWrapper>
                  </div>
                </div>
                <Sr22tTPNumberInputField data={this.tatField} />
              </div>
            </div>
          </div>
        </div>
      </div >
    );
  }


  /**
   * Handles events that move the map pointer.
   * @param evt The event.
   * @returns Whether the event was handled.
   */
  private handleMapPointerMoveEvent(evt: FmsHEvent): boolean {
    if (!this.mapPointerModule.isActive.get()) {
      return false;
    }

    switch (evt) {
      case FmsHEvent.JOYSTICK_LEFT:
        this.mapPointerController.movePointer(-InputDataPanel.POINTER_MOVE_INCREMENT, 0);
        return true;
      case FmsHEvent.JOYSTICK_UP:
        this.mapPointerController.movePointer(0, -InputDataPanel.POINTER_MOVE_INCREMENT);
        return true;
      case FmsHEvent.JOYSTICK_RIGHT:
        this.mapPointerController.movePointer(InputDataPanel.POINTER_MOVE_INCREMENT, 0);
        return true;
      case FmsHEvent.JOYSTICK_DOWN:
        this.mapPointerController.movePointer(0, InputDataPanel.POINTER_MOVE_INCREMENT);
        return true;
    }

    return false;
  }

  /**
   * Changes the MFD map range index setting.
   * @param delta The change in index to apply.
   */
  private changeMapRangeIndex(delta: number): void {
    const currentIndex = this.mapRangeModule.nominalRangeIndex.get();
    const newIndex = MathUtils.clamp(currentIndex + delta, 0, this.mapRangeModule.nominalRanges.get().length - 1);

    if (newIndex !== currentIndex) {
      this.mapPointerController.targetPointer();
      this.mapRangeController.setRangeIndex(newIndex);
    }
    this.mapTerrainModule.terrainMode.set(MapTerrainMode.Absolute);
  }

  // Map data:
  private static readonly DEFAULT_MAP_RANGE_INDEX = 14;
  private static readonly MAP_UPDATE_FREQ = 30; // Hz
  private static readonly MAP_DATA_UPDATE_FREQ = 4; // Hz
  private static readonly POINTER_MOVE_INCREMENT = 2; // pixels

  private readonly mapSettingManager = MapUserSettings.getMfdManager(this.props.bus);
  private readonly mapFocusMargins = Subject.create(VecNMath.create(4, 40, 40, 40, 40));

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(MapBuilder.navMap, {
      bingId: 'mfd-tripplanning-map',
      dataUpdateFreq: InputDataPanel.MAP_DATA_UPDATE_FREQ,
      waypointIconImageCache: MapWaypointIconImageCache.getCache(),
      waypointStyleFontType: 'Roboto',
      rangeRingOptions: {
        showLabel: true
      },
      rangeCompassOptions: {
        showLabel: true,
        showHeadingBug: true,
        bearingTickMajorLength: 10,
        bearingTickMinorLength: 5,
        bearingLabelFont: 'Roboto-Bold',
        bearingLabelFontSize: 20
      },
      flightPlanner: this.props.fms.flightPlanner,
      supportFlightPlanFocus: true,
      nominalFocusMargins: this.mapFocusMargins,
      ...MapBuilder.ownAirplaneIconOptions(),
      pointerBoundsOffset: VecNMath.create(4, 0.1, 0.1, 0.1, 0.1),
      pointerInfoSize: MapPointerInfoLayerSize.Medium,
      miniCompassImgSrc: MapBuilder.miniCompassIconSrc(),
      settingManager: this.mapSettingManager as any,
      unitsSettingManager: UnitsUserSettings.getManager(this.props.bus),
      defaultFocusRangeIndex: 5,
      includeTrackVector: false,
      includeAltitudeArc: false,
      includeWindVector: false,
      includeRangeIndicator: false,
      includeDetailIndicator: false,
      includeTrafficOffScaleIndicator: false,
      includeTerrainScale: false,
      useOrientationUserSettings: false,
    })
    .withProjectedSize(Vec2Math.create(270, 283))
    .withClockUpdate(InputDataPanel.MAP_UPDATE_FREQ)
    .build('mfd-tripplanning-map') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;

        /** The pointer module. */
        [GarminMapKeys.Pointer]: MapPointerModule;

        /** The terrain module. */
        [GarminMapKeys.Terrain]: MapTerrainModule;

        /** The flight plan focus module. */
        [GarminMapKeys.FlightPlanFocus]: MapFlightPlanFocusModule;

      },
      any,
      {
        /** The range controller. */
        [GarminMapKeys.Range]: MapRangeController;

        /** The pointer controller. */
        [GarminMapKeys.Pointer]: MapPointerController;
      },
      any
    >;

  // Map modules:
  private readonly mapRangeModule = this.compiledMap.context.model.getModule(GarminMapKeys.Range);
  private readonly mapPointerModule = this.compiledMap.context.model.getModule(GarminMapKeys.Pointer);
  private readonly mapTerrainModule = this.compiledMap.context.model.getModule(GarminMapKeys.Terrain);
  private readonly mapFocusModule = this.compiledMap.context.model.getModule(GarminMapKeys.FlightPlanFocus);

  // Map controllers:
  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);
  private readonly mapPointerController = this.compiledMap.context.getController(GarminMapKeys.Pointer);
}
