import {
  AdcEvents, AirportFacility, ConsumerSubject, ConsumerValue, EngineEvents, FSComponent, GNSSEvents, LNavDataEvents, MappedSubject, NumberFormatter,
  NumberUnitSubject, SetSubject, SimpleUnit, SimVarValueType, Subscribable, SubscribableUtils, Subscription, Unit, UnitFamily,
  UnitType, VNode,
} from '@microsoft/msfs-sdk';
import { NumberUnitDisplay, UnitsFuelSettingMode, UnitsUserSettings } from '@microsoft/msfs-garminsdk';
import {
  FuelTotalizerControlEvents, FuelTotalizerEvents, PerformanceWeightLimits, WeightFuelEvents, WeightFuelUserSettings,
} from '@microsoft/msfs-wtg3000-common';
import { GtcView, GtcViewKeys, GtcViewProps } from '../../GtcService';
import { GtcTouchButton, GtcValueTouchButton, TabbedContainer, TabbedContent, TabConfiguration } from '../../Components';
import { GtcDialogResult } from '../../Dialog/GtcDialogView';
import { GtcIntegerDialog } from '../../Dialog/GtcIntegerDialog';
import { GtcMinuteDurationDialog } from '../../Dialog/GtcMinuteDurationDialog';
import { GtcWeightDialog, GtcWeightDialogInput, GtcWeightDialogOutput } from '../../Dialog/GtcWeightDialog';

import './GtcWeightFuelPage.css';

const CAUTION_CLASS = 'caution';
const WARNING_CLASS = 'warning';

const INTERNAL_WEIGHT_UNIT: SimpleUnit<UnitFamily.Weight> = UnitType.POUND;

const WEIGHT_FUEL_FORMATTER_RAW = NumberFormatter.create({ useMinusSign: true, nanString: '_____', precision: 1 });

/**
 * Number formatter for the Weight and Fuel page.  Replicates the overflow behavior if a value exceeds five digits.
 * @param number The number to format.
 * @returns The formatted string.
 */
function WEIGHT_FUEL_FORMATTER(number: number): string {
  return number >= 100_000 ? '_____' : WEIGHT_FUEL_FORMATTER_RAW(number);
}

/**
 * Converts negative numbers to `NaN`.
 * @param number The input number.
 * @returns `NaN` if the input number is negative, otherwise the value of the input number.
 */
function NEGATIVE_TO_NAN(number: number): number {
  return number < 0 ? NaN : number;
}

const FUEL_TOTAL_CAPACITY_GALLONS: number = SimVar.GetSimVarValue('FUEL TOTAL CAPACITY', SimVarValueType.GAL);

/**
 * Params object for the weight dialog invocation method. Identical to {@link GtcWeightDialogInput}
 * except that the `initialValue` is substituted for a {@link Subject} and `unitType` is inferred.
 */
type InvokeWeightDialogParams = Omit<GtcWeightDialogInput, 'initialValue' | 'unitType'> &
// eslint-disable-next-line jsdoc/require-jsdoc
{ value: Subscribable<number> };

/** Component props for GtcWeightFuelPage. */
export interface GtcWeightFuelPageProps extends GtcViewProps {
  /** Whether a destination facility has been entered. */
  destinationFacility: Subscribable<AirportFacility | undefined>;

  /** The aircraft weight limits. */
  weightLimits: PerformanceWeightLimits;

  /** Whether GPS data is in a failed state. */
  gpsHasFailed: Subscribable<boolean>;
}

/** Weight and Fuel page. */
export class GtcWeightFuelPage extends GtcView<GtcWeightFuelPageProps> {

  private readonly tabsRef = FSComponent.createRef<TabbedContainer>();

  private readonly evtSub = this.bus.getSubscriber<AdcEvents & EngineEvents & FuelTotalizerEvents & WeightFuelEvents & GNSSEvents & LNavDataEvents>();
  private readonly publisher = this.bus.getPublisher<FuelTotalizerControlEvents>();

  // User Settings
  private readonly weightFuelSettingsManager = WeightFuelUserSettings.getManager(this.bus);
  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.bus);
  private readonly fuelUnitIsVolumetric = this.unitsSettingManager.getSetting('unitsFuel')
    .map(unit => [UnitsFuelSettingMode.Liters, UnitsFuelSettingMode.Gallons, UnitsFuelSettingMode.ImpGal].includes(unit));
  // eslint-disable-next-line jsdoc/require-returns
  /** Returns the weight user setting. */
  private get weightUnit(): Unit<UnitFamily.Weight> {
    return this.unitsSettingManager.weightUnits.get();
  }
  // eslint-disable-next-line jsdoc/require-returns
  /** Returns the fuel user setting. */
  private get fuelUnit(): Unit<UnitFamily.Weight> {
    return this.unitsSettingManager.fuelUnits.get();
  }

  // From systems
  private readonly fuelUsable = ConsumerValue.create(this.evtSub.on('fuel_usable_total_weight'), 0);

  // User inputs, weights in pounds (as defined by INTERNAL_WEIGHT_UNIT)
  private readonly basicEmptyWeightSetting = this.weightFuelSettingsManager.getSetting('weightFuelBasicEmpty');
  private readonly crewAndStoresWeightSetting = this.weightFuelSettingsManager.getSetting('weightFuelCrewStores');
  private readonly numberOfPassengersSetting = this.weightFuelSettingsManager.getSetting('weightFuelNumberPax');
  private readonly avgPassengerWeightSetting = this.weightFuelSettingsManager.getSetting('weightFuelAvgPax');
  private readonly cargoWeightSetting = this.weightFuelSettingsManager.getSetting('weightFuelCargo');
  private readonly fuelOnBoardWeightSetting = this.weightFuelSettingsManager.getSetting('weightFuelInitialFob');
  private readonly fuelReservesWeightSetting = this.weightFuelSettingsManager.getSetting('weightFuelReserves');
  private readonly estHoldingTimeMinsSetting = this.weightFuelSettingsManager.getSetting('weightFuelEstHoldingTime');

  // Calculated weights
  private readonly basicOperatingWeightSetting = this.weightFuelSettingsManager.getSetting('weightFuelBasicOperating');
  private readonly totalPassengerWeightSetting = this.weightFuelSettingsManager.getSetting('weightFuelTotalPassenger');
  private readonly zeroFuelWeightSetting = this.weightFuelSettingsManager.getSetting('weightFuelZeroFuel');

  // Intermediary derived values
  private readonly fobHasBeenInitialized = this.fuelOnBoardWeightSetting.map(val => val >= 0);

  private readonly fuelOnBoardWeightSource = ConsumerSubject.create(this.evtSub.on('weightfuel_fob_weight').atFrequency(1), -1).pause();
  private readonly aircraftWeightSource = ConsumerSubject.create(this.evtSub.on('weightfuel_aircraft_weight').atFrequency(1), -1).pause();
  private readonly landingFuelSource = ConsumerSubject.create(this.evtSub.on('weightfuel_landing_fuel').atFrequency(1), Number.MIN_SAFE_INTEGER).pause();
  private readonly landingWeightSource = ConsumerSubject.create(this.evtSub.on('weightfuel_landing_weight').atFrequency(1), -1).pause();
  private readonly holdingFuelSource = ConsumerSubject.create(this.evtSub.on('weightfuel_holding_fuel').atFrequency(1), -1).pause();

  private readonly fuelOnBoardWeight = this.fuelOnBoardWeightSource.map(NEGATIVE_TO_NAN);
  private readonly aircraftWeight = this.aircraftWeightSource.map(NEGATIVE_TO_NAN);
  private readonly estLandingFuelWeight = this.landingFuelSource.map(weight => weight <= Number.MIN_SAFE_INTEGER ? NaN : weight);
  private readonly estLandingWeight = this.landingWeightSource.map(NEGATIVE_TO_NAN);
  private readonly estHoldingFuelWeight = this.holdingFuelSource.map(NEGATIVE_TO_NAN);

  private readonly excessFuelWeight = MappedSubject.create(
    ([landingFuel, reserveFuel, holdingFuel]) => landingFuel - reserveFuel - holdingFuel,
    SubscribableUtils.NUMERIC_NAN_EQUALITY,
    this.estLandingFuelWeight,
    this.fuelReservesWeightSetting,
    this.estHoldingFuelWeight,
  ).pause();

  private readonly eventWeights = [
    this.fuelOnBoardWeightSource,
    this.aircraftWeightSource,
    this.landingFuelSource,
    this.landingWeightSource,
    this.holdingFuelSource
  ];

  private readonly calculatedWeights = [
    this.estHoldingFuelWeight,
    this.estLandingFuelWeight,
    this.excessFuelWeight
  ];

  // NumberUnitSubjects for use in components
  private readonly basicEmptyWeightNUS = NumberUnitSubject.create(UnitType.POUND.createNumber(0));
  private readonly crewAndStoresWeightNUS = NumberUnitSubject.create(UnitType.POUND.createNumber(0));
  private readonly avgPassengerWeightNUS = NumberUnitSubject.create(UnitType.POUND.createNumber(0));
  private readonly cargoWeightNUS = NumberUnitSubject.create(UnitType.POUND.createNumber(0));
  private readonly fuelReservesWeightNUS = NumberUnitSubject.create(UnitType.POUND.createNumber(0));
  private readonly estHoldingTimeMinsNUS = NumberUnitSubject.create(UnitType.MINUTE.createNumber(0));

  private readonly basicOperatingWeightNUS = NumberUnitSubject.create(UnitType.POUND.createNumber(0));
  private readonly totalPassengerWeightNUS = NumberUnitSubject.create(UnitType.POUND.createNumber(0));
  private readonly zeroFuelWeightNUS = NumberUnitSubject.create(UnitType.POUND.createNumber(0));
  private readonly fuelOnBoardWeightNUS = NumberUnitSubject.create(UnitType.POUND.createNumber(0));
  private readonly aircraftWeightNUS = NumberUnitSubject.create(UnitType.POUND.createNumber(0));
  private readonly estHoldingFuelWeightNUS = NumberUnitSubject.create(UnitType.POUND.createNumber(0));
  private readonly estLandingFuelWeightNUS = NumberUnitSubject.create(UnitType.POUND.createNumber(0));
  private readonly estLandingWeightNUS = NumberUnitSubject.create(UnitType.POUND.createNumber(0));
  private readonly excessFuelWeightNUS = NumberUnitSubject.create(UnitType.POUND.createNumber(0));

  // CSS Classes
  private readonly zeroFuelWeightClasses = SetSubject.create<string>();
  private readonly fuelOnBoardRowClasses: SetSubject<string> =
    SetSubject.create(['wf-row', 'wf-derived-weight-row', 'wf-wide-right']);
  private readonly aircraftWeightClasses = SetSubject.create<string>();
  private readonly fobInstructionClasses = SetSubject.create<string>(['wf-fob-instructions']);
  private readonly overweightCautionClasses = SetSubject.create<string>(['wf-overweight-caution', 'hidden']);
  private readonly estLandingWeightClasses = SetSubject.create<string>(['wf-top-row']);
  private readonly estLandingFuelWeightClasses = SetSubject.create<string>(['wf-top-row']);
  private readonly fuelReservesRowClasses =
    SetSubject.create<string>(['wf-row', 'wf-derived-weight-row']);
  private readonly fuelHoldingRowClasses =
    SetSubject.create<string>(['wf-row', 'wf-derived-weight-row', 'wf-holding-time-row', 'wf-fuel-by-vol']);
  private readonly excessFuelWeightClasses = SetSubject.create<string>(['wf-excess-fuel']);

  private readonly settingPipes: Subscription[] = [];

  /** @inheritDoc */
  public override onAfterRender(): void {
    this._title.set('Weight and Fuel');

    // Pipe user-defined and derived values into their corresponding NumberUnitSubjects

    this.settingPipes.push(
      this.basicEmptyWeightSetting.pipe(this.basicEmptyWeightNUS, value => Math.max(value, 0)),
      this.crewAndStoresWeightSetting.pipe(this.crewAndStoresWeightNUS),
      this.avgPassengerWeightSetting.pipe(this.avgPassengerWeightNUS),
      this.cargoWeightSetting.pipe(this.cargoWeightNUS),
      this.fuelReservesWeightSetting.pipe(this.fuelReservesWeightNUS),
      this.estHoldingTimeMinsSetting.pipe(this.estHoldingTimeMinsNUS),
      this.basicOperatingWeightSetting.pipe(this.basicOperatingWeightNUS),
      this.totalPassengerWeightSetting.pipe(this.totalPassengerWeightNUS),
      this.zeroFuelWeightSetting.pipe(this.zeroFuelWeightNUS)
    );

    this.fuelOnBoardWeight.pipe(this.fuelOnBoardWeightNUS);
    this.aircraftWeight.pipe(this.aircraftWeightNUS);
    this.estHoldingFuelWeight.pipe(this.estHoldingFuelWeightNUS);
    this.estLandingFuelWeight.pipe(this.estLandingFuelWeightNUS);
    this.estLandingWeight.pipe(this.estLandingWeightNUS);
    this.excessFuelWeight.pipe(this.excessFuelWeightNUS);

    // Toggle classes
    this.fuelUnitIsVolumetric.sub(fuelUnitIsVolumetric => {
      this.fuelOnBoardRowClasses.toggle('wf-fuel-by-vol', fuelUnitIsVolumetric);
      this.fuelOnBoardRowClasses.toggle('wf-fuel-by-weight', !fuelUnitIsVolumetric);
      this.fuelReservesRowClasses.toggle('wf-fuel-by-vol', fuelUnitIsVolumetric);
      this.fuelReservesRowClasses.toggle('wf-fuel-by-weight', !fuelUnitIsVolumetric);
    }, true);

    this.fobHasBeenInitialized.sub(val => this.fobInstructionClasses.toggle('hidden', val));

    this.zeroFuelWeightSetting.sub(zfw => {
      const maxZfw: number | undefined = this.props.weightLimits.maxZeroFuel.asUnit(INTERNAL_WEIGHT_UNIT);
      this.zeroFuelWeightClasses.toggle(CAUTION_CLASS, maxZfw !== undefined && zfw > maxZfw);
    }, true);

    this.aircraftWeight.sub((tow: number): void => {
      const mtow: number | undefined = this.props.weightLimits.maxTakeoff.asUnit(INTERNAL_WEIGHT_UNIT);
      const mtowExceeded: boolean = mtow !== undefined && tow > mtow;
      this.aircraftWeightClasses.toggle(CAUTION_CLASS, mtowExceeded);
      this.overweightCautionClasses.toggle('hidden', !mtowExceeded);
    }, true);

    this.estLandingWeight.sub((elw: number): void => {
      const mlw: number | undefined = this.props.weightLimits.maxLanding.asUnit(INTERNAL_WEIGHT_UNIT);
      this.estLandingWeightClasses.toggle(CAUTION_CLASS, mlw !== undefined && elw > mlw);
    }, true);

    this.estLandingFuelWeight.sub((elfw: number): void => {
      if (isNaN(elfw)) { return; }
      const isCaution: boolean = elfw > 0 && elfw <= (this.fuelReservesWeightSetting.get() + this.estHoldingFuelWeight.get());
      this.estLandingFuelWeightClasses.toggle(CAUTION_CLASS, isCaution);
      this.fuelHoldingRowClasses.toggle(CAUTION_CLASS, isCaution);
      this.excessFuelWeightClasses.toggle(CAUTION_CLASS, isCaution);
      const isWarning: boolean = elfw <= 0;
      this.estLandingFuelWeightClasses.toggle(WARNING_CLASS, isWarning);
      this.fuelHoldingRowClasses.toggle(WARNING_CLASS, isWarning);
      this.excessFuelWeightClasses.toggle(WARNING_CLASS, isWarning);
    }, true);
  }

  /** @inheritDoc */
  public override onOpen(): void {
    this.tabsRef.instance.selectTab(1);

    // If basic empty weight is uninitialized, set it to the default value.
    if (this.basicEmptyWeightSetting.value < 0) {
      this.basicEmptyWeightSetting.value = this.props.weightLimits.basicEmpty.asUnit(INTERNAL_WEIGHT_UNIT);
    }
  }

  /** @inheritDoc */
  public override onResume(): void {
    this.settingPipes.forEach(sub => { sub.resume(true); });
    this.eventWeights.forEach(sub => { sub.resume(); });
    this.calculatedWeights.forEach(sub => { sub.resume(); });

    this.tabsRef.instance.resume();
  }

  /** @inheritDoc */
  public override onPause(): void {
    this.settingPipes.forEach(sub => { sub.pause(); });
    this.eventWeights.forEach(sub => { sub.pause(); });
    this.calculatedWeights.forEach(sub => { sub.pause(); });

    this.tabsRef.instance.pause();
  }

  /**
   * Opens a {@link GtcWeightDialog} and sets the output value if its mutable and not cancelled.
   * @param inputs See {@link InvokeWeightDialogParams}.
   * @param type Whether the quantity being set is a weight or a fuel amount.
   */
  private async invokeWeightDialog(
    inputs: InvokeWeightDialogParams, type: 'weight' | 'fuel' = 'weight'
  ): Promise<GtcWeightDialogOutput | void> {
    const unitType: Unit<UnitFamily.Weight> = type === 'weight' ? this.weightUnit : this.fuelUnit;
    const value: Subscribable<number> = inputs.value;
    const initialValue: number = unitType.convertFrom(value.get() ?? 0, INTERNAL_WEIGHT_UNIT);
    const result: GtcDialogResult<GtcWeightDialogOutput> =
      await this.props.gtcService.openPopup<GtcWeightDialog>(GtcViewKeys.WeightDialog1, 'normal', 'hide')
        .ref.request({ ...inputs, unitType, initialValue });
    if (!result.wasCancelled) {
      SubscribableUtils.isMutableSubscribable(value) && value.set(unitType.convertTo(result.payload.value, INTERNAL_WEIGHT_UNIT));
      return result.payload;
    }
  }

  private onCrewStoresPressed = (): void => {
    this.invokeWeightDialog({
      title: 'Pilot and Stores',
      value: this.crewAndStoresWeightSetting,
      maximumValue: 9999,
    });
  };

  private onSetEmptyWeightPressed = (): void => {
    this.invokeWeightDialog({
      title: 'Basic Empty Weight',
      value: this.basicEmptyWeightSetting,
      maximumValue: 99999,
    });
  };

  private onPassengersPressed = async (): Promise<void> => {
    const result = await this.gtcService.openPopup<GtcIntegerDialog>(GtcViewKeys.IntegerDialog1, 'normal', 'hide')
      .ref.request({
        title: 'Number of Passengers',
        initialValue: this.numberOfPassengersSetting.get(),
        maximumValue: this.props.weightLimits.maxPassengerCount
      });
    !result.wasCancelled && this.numberOfPassengersSetting.set(result.payload);
  };

  private onPassengerWeightPressed = (): void => {
    this.invokeWeightDialog({
      title: 'Weight Per Passenger',
      value: this.avgPassengerWeightSetting,
      maximumValue: 999,
    });
  };

  private onCargoPressed = (): void => {
    this.invokeWeightDialog({
      title: 'Cargo Weight',
      value: this.cargoWeightSetting,
      maximumValue: 99999,
    });
  };

  private onFuelOnBoardPressed = async (): Promise<void> => {
    const result: GtcWeightDialogOutput | void = await this.invokeWeightDialog({
      title: 'Fuel On Board',
      value: this.fuelOnBoardWeight,
      maximumValue: this.fuelUnit.convertFrom(FUEL_TOTAL_CAPACITY_GALLONS, UnitType.GALLON_FUEL),
    }, 'fuel');
    if (result) {
      this.fuelOnBoardWeightSetting.set(UnitType.POUND.convertFrom(result.value, result.unit));
      this.publisher.pub('fuel_totalizer_set_remaining',
        UnitType.GALLON_FUEL.convertFrom(result.value, result.unit), true, false);
    }
  };

  private onFobSyncPressed = (): void => {
    this.fuelOnBoardWeightSetting.set(INTERNAL_WEIGHT_UNIT.convertTo(this.fuelUsable.get(), UnitType.POUND));
    this.publisher.pub('fuel_totalizer_set_remaining',
      INTERNAL_WEIGHT_UNIT.convertTo(this.fuelUsable.get(), UnitType.GALLON_FUEL), true, false);
  };

  private onFuelReservesPressed = (): void => {
    this.invokeWeightDialog({
      title: 'Fuel Reserves Weight',
      value: this.fuelReservesWeightSetting,
      maximumValue: this.fuelUnit.convertFrom(FUEL_TOTAL_CAPACITY_GALLONS, UnitType.GALLON_FUEL),
    }, 'fuel');
  };

  private onHoldingTimePressed = async (): Promise<void> => {
    const result = await this.gtcService.openPopup<GtcMinuteDurationDialog>
      (GtcViewKeys.MinuteDurationDialog, 'normal', 'hide')
      // No title is passed as the dialog is titleless in the trainer, but the trainer could be wrong
      .ref.request({ initialValue: this.estHoldingTimeMinsSetting.get(), max: 240 });
    !result.wasCancelled && this.estHoldingTimeMinsSetting.set(result.payload);
  };

  /**
   * Renders a label/value row.
   * @param label The label to render.
   * @param value The value to render.
   * @param classes Any optional classes to add to the parent div.
   * @returns The rendered label/value row.
   */
  private renderLabelValueRow(
    label: string,
    value: NumberUnitSubject<UnitFamily.Weight, SimpleUnit<UnitFamily.Weight>>,
    classes?: SetSubject<string>
  ): VNode {
    classes ??= SetSubject.create();
    classes.add('wf-row');
    classes.add('wf-label-value-row');
    return (
      <div class={classes}>
        <div class='wf-label'>{label}</div>
        <NumberUnitDisplay
          class='wf-unit-value'
          formatter={WEIGHT_FUEL_FORMATTER}
          value={value}
          displayUnit={this.unitsSettingManager.weightUnits}
        />
      </div>
    );
  }

  /**
   * Renders the final term of an arithmetic operation.
   * @param sign Whether to add or subtract.
   * @param value A VNode that renders the value.
   * @param classes Any optional classes to add to the parent div.
   * @returns The rendered final term.
   */
  private static renderFinalTerm(sign: '+' | '–', value: VNode, classes?: string): VNode {
    return (
      <div class={['wf-row wf-math-row', classes].join(' ')}>
        <span>{sign}</span>
        {value}
      </div>
    );
  }

  /**
   * Renders a row in which the fuel weight can be derived from a volume or duration.
   * @param buttonElem A VNode that renders the button element.  Must include the class `wf-derived-weight-button`.
   * @param sign Whether to add or subtract.
   * @param valueElem A VNode that renders the value element.  Must include the class `wf-weight-value`.
   * @param cssClasses The classes to add to the parent div.
   * @returns The rendered row.
   */
  private static renderDerivedWeightRow(buttonElem: VNode, sign: '+' | '–', valueElem: VNode, cssClasses: SetSubject<string>): VNode {
    return (
      <div class={cssClasses}>
        {buttonElem}
        <span class='wf-derived-weight-row-sign'>{sign}</span>
        {valueElem}
      </div>
    );
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private static renderUnderline(): VNode {
    return (
      <div class='wf-row wf-math-row'>
        <div class='wf-underline' />
      </div>
    );
  }

  /** @inheritdoc */
  public render(): VNode {
    let operatingWeightTabNode: VNode;
    let payloadTabNode: VNode;
    let takeoffTabNode: VNode;
    let landingTabNode: VNode;

    return (
      <div class='gtc-fuel-weight'>
        <TabbedContainer
          ref={this.tabsRef}
          configuration={TabConfiguration.Left5}
          initiallySelectedTabPosition={1}
        >

          <TabbedContent
            position={1}
            label={'Operating\nWeight'}
            onDestroy={() => { FSComponent.shallowDestroy(operatingWeightTabNode); }}
          >
            {operatingWeightTabNode = (
              <div class='wf-tab'>
                {this.renderLabelValueRow('Basic Empty Weight', this.basicEmptyWeightNUS, SetSubject.create(['wf-top-row']))}
                {GtcWeightFuelPage.renderFinalTerm('+',
                  <GtcValueTouchButton
                    class='wf-right-aligned-value wf-crew-stores-button'
                    label='Crew & Stores'
                    state={this.crewAndStoresWeightSetting}
                    renderValue={
                      <NumberUnitDisplay
                        formatter={WEIGHT_FUEL_FORMATTER}
                        value={this.crewAndStoresWeightNUS}
                        displayUnit={this.unitsSettingManager.weightUnits}
                      />
                    }
                    onPressed={this.onCrewStoresPressed}
                  />
                )}
                {GtcWeightFuelPage.renderUnderline()}
                {this.renderLabelValueRow('Basic Operating Weight', this.basicOperatingWeightNUS)}
                <GtcTouchButton
                  class='wf-row wf-bottom-center-button'
                  label={'Set Empty\nWeight'}
                  onPressed={this.onSetEmptyWeightPressed}
                />
              </div>
            )}
          </TabbedContent>

          <TabbedContent
            position={2}
            label='Payload'
            onDestroy={() => { FSComponent.shallowDestroy(payloadTabNode); }}
          >
            {payloadTabNode = (
              <div class='wf-tab'>
                {this.renderLabelValueRow('Basic Operating Weight', this.basicOperatingWeightNUS, SetSubject.create(['wf-top-row']))}
                <div class='wf-row wf-label-value-row'>
                  <div class='wf-label-value-row wf-pass-mult'>
                    <GtcValueTouchButton
                      class='wf-num-pass-button'
                      label='Passengers'
                      state={this.numberOfPassengersSetting}
                      onPressed={this.onPassengersPressed}
                    />
                    <span>@</span>
                    <GtcValueTouchButton
                      class='wf-pass-weight-button'
                      label='WT Each'
                      state={this.avgPassengerWeightSetting}
                      renderValue={
                        <NumberUnitDisplay
                          formatter={WEIGHT_FUEL_FORMATTER}
                          value={this.avgPassengerWeightNUS}
                          displayUnit={this.unitsSettingManager.weightUnits}
                        />
                      }
                      onPressed={this.onPassengerWeightPressed}
                    />
                    <span>=</span>
                  </div>
                  <NumberUnitDisplay
                    formatter={WEIGHT_FUEL_FORMATTER}
                    value={this.totalPassengerWeightNUS}
                    displayUnit={this.unitsSettingManager.weightUnits}
                  />
                </div>
                {GtcWeightFuelPage.renderFinalTerm('+',
                  <GtcValueTouchButton
                    class='wf-right-aligned-value wf-cargo-button'
                    label='Cargo'
                    state={this.cargoWeightSetting}
                    renderValue={
                      <NumberUnitDisplay
                        formatter={WEIGHT_FUEL_FORMATTER}
                        value={this.cargoWeightNUS}
                        displayUnit={this.unitsSettingManager.weightUnits}
                      />
                    }
                    onPressed={this.onCargoPressed}
                  />,
                  'wf-cargo-row'
                )}
                {GtcWeightFuelPage.renderUnderline()}
                {this.renderLabelValueRow('Zero Fuel Weight', this.zeroFuelWeightNUS, this.zeroFuelWeightClasses)}
              </div>
            )}
          </TabbedContent>

          <TabbedContent
            position={3}
            label='Takeoff'
            onDestroy={() => { FSComponent.shallowDestroy(takeoffTabNode); }}
          >
            {takeoffTabNode = (
              <div class='wf-tab'>
                {this.renderLabelValueRow('Zero Fuel Weight', this.zeroFuelWeightNUS, this.zeroFuelWeightClasses.add('wf-top-row'))}
                {GtcWeightFuelPage.renderDerivedWeightRow(
                  <GtcValueTouchButton
                    class='wf-derived-weight-button wf-fuel-button wf-fuel-on-board-button'
                    label='Fuel On Board'
                    state={this.fuelOnBoardWeight}
                    renderValue={
                      <NumberUnitDisplay
                        formatter={WEIGHT_FUEL_FORMATTER}
                        value={this.fuelOnBoardWeightNUS}
                        displayUnit={this.unitsSettingManager.fuelUnits}
                      />
                    }
                    onPressed={this.onFuelOnBoardPressed}
                  />,
                  '+',
                  <NumberUnitDisplay
                    class='wf-weight-value'
                    formatter={WEIGHT_FUEL_FORMATTER}
                    value={this.fuelOnBoardWeightNUS}
                    displayUnit={this.unitsSettingManager.weightUnits}
                  />,
                  this.fuelOnBoardRowClasses,
                )}
                {GtcWeightFuelPage.renderUnderline()}
                {this.renderLabelValueRow('Aircraft Weight', this.aircraftWeightNUS, this.aircraftWeightClasses)}
                <div class={this.fobInstructionClasses}>Press FOB SYNC or enter Fuel On<br />Board to confirm fuel.</div>
                <div class={this.overweightCautionClasses}>Max Takeoff Weight Exceeded</div>
                <GtcTouchButton
                  class='wf-row wf-bottom-center-button'
                  label={'FOB SYNC'}
                  onPressed={this.onFobSyncPressed}
                />
              </div>
            )}
          </TabbedContent>

          <TabbedContent
            position={4}
            label='Landing'
            onDestroy={() => { FSComponent.shallowDestroy(landingTabNode); }}
          >
            {landingTabNode = (
              <div class='wf-tab'>
                {this.renderLabelValueRow('Est. Landing Weight', this.estLandingWeightNUS, this.estLandingWeightClasses)}
                <div class='wf-full-underline' />
                {this.renderLabelValueRow('Est. Landing Fuel', this.estLandingFuelWeightNUS, this.estLandingFuelWeightClasses)}
                {GtcWeightFuelPage.renderDerivedWeightRow(
                  <GtcValueTouchButton
                    class='wf-derived-weight-button wf-fuel-button wf-fuel-reserves-button'
                    label='Fuel Reserves'
                    state={this.fuelReservesWeightSetting}
                    renderValue={
                      <NumberUnitDisplay
                        formatter={WEIGHT_FUEL_FORMATTER}
                        value={this.fuelReservesWeightNUS}
                        displayUnit={this.unitsSettingManager.fuelUnits}
                      />
                    }
                    onPressed={this.onFuelReservesPressed}
                  />,
                  '–',
                  <NumberUnitDisplay
                    class='wf-weight-value'
                    formatter={WEIGHT_FUEL_FORMATTER}
                    value={this.fuelReservesWeightNUS}
                    displayUnit={this.unitsSettingManager.weightUnits}
                  />,
                  this.fuelReservesRowClasses,
                )}
                {GtcWeightFuelPage.renderDerivedWeightRow(
                  <GtcValueTouchButton
                    class='wf-derived-weight-button wf-holding-time-button'
                    label='Holding Time'
                    state={this.estHoldingTimeMinsSetting}
                    renderValue={
                      <NumberUnitDisplay
                        formatter={WEIGHT_FUEL_FORMATTER}
                        value={this.estHoldingTimeMinsNUS}
                        displayUnit={UnitType.MINUTE}
                      />
                    }
                    onPressed={this.onHoldingTimePressed}
                  />,
                  '–',
                  <NumberUnitDisplay
                    class='wf-unit-value wf-weight-value'
                    formatter={WEIGHT_FUEL_FORMATTER}
                    value={this.estHoldingFuelWeightNUS}
                    displayUnit={this.unitsSettingManager.weightUnits}
                  />,
                  this.fuelHoldingRowClasses,
                )}
                {GtcWeightFuelPage.renderUnderline()}
                {this.renderLabelValueRow('Excess Fuel', this.excessFuelWeightNUS, this.excessFuelWeightClasses)}
              </div>
            )}
          </TabbedContent>

        </TabbedContainer>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.tabsRef.getOrDefault()?.destroy();

    this.settingPipes.forEach(sub => { sub.destroy(); });
    this.eventWeights.forEach(sub => { sub.destroy(); });
    this.calculatedWeights.forEach(sub => { sub.destroy(); });

    this.fuelUnitIsVolumetric.destroy();
    this.fuelUsable.destroy();
    this.fobHasBeenInitialized.destroy();

    super.destroy();
  }
}