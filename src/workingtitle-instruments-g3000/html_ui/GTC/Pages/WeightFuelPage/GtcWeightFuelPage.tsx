import {
  AdcEvents, AirportFacility, ClockEvents, ConsumerSubject, ConsumerValue, EngineEvents, FSComponent, GNSSEvents, LNavDataEvents,
  MappedSubject, NumberFormatter, NumberUnitSubject, SetSubject, SimpleUnit, SimVarValueType, Subscribable,
  Subscription, Unit, UnitFamily, UnitType, UserSetting, VNode
} from '@microsoft/msfs-sdk';

import { NumberUnitDisplay, UnitsFuelSettingMode, UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import {
  FuelTotalizerControlEvents, FuelTotalizerEvents, GtcViewKeys, PerformanceWeightLimits, WeightFuelEvents,
  WeightFuelUserSettings
} from '@microsoft/msfs-wtg3000-common';

import { GtcTouchButton, GtcValueTouchButton, TabbedContainer, TabbedContent, TabConfiguration } from '../../Components';
import { GtcDialogResult } from '../../Dialog/GtcDialogView';
import { GtcIntegerDialog } from '../../Dialog/GtcIntegerDialog';
import { GtcMinuteDurationDialog } from '../../Dialog/GtcMinuteDurationDialog';
import { GtcWeightDialog, GtcWeightDialogInput, GtcWeightDialogOutput } from '../../Dialog/GtcWeightDialog';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';

import './GtcWeightFuelPage.css';

const CAUTION_CLASS = 'caution';
const WARNING_CLASS = 'warning';

const WEIGHT_FUEL_FORMATTER_RAW = NumberFormatter.create({ useMinusSign: true, nanString: '_____', precision: 1 });

/**
 * Number formatter for the Weight and Fuel page.  Replicates the overflow behavior if a value exceeds five digits.
 * @param number The number to format.
 * @returns The formatted string.
 */
function WEIGHT_FUEL_FORMATTER(number: number): string {
  return number >= 100_000 ? '_____' : WEIGHT_FUEL_FORMATTER_RAW(number);
}

const FUEL_TOTAL_CAPACITY_GALLONS: number = SimVar.GetSimVarValue('FUEL TOTAL CAPACITY', SimVarValueType.GAL);

/**
 * Component props for {@link GtcWeightFuelPage}.
 */
export interface GtcWeightFuelPageProps extends GtcViewProps {
  /** Whether a destination facility has been entered. */
  destinationFacility: Subscribable<AirportFacility | undefined>;

  /** The aircraft weight limits. */
  weightLimits: PerformanceWeightLimits;

  /** Whether GPS data is in a failed state. */
  gpsHasFailed: Subscribable<boolean>;
}

/**
 * A GTC weight and fuel page.
 */
export class GtcWeightFuelPage extends GtcView<GtcWeightFuelPageProps> {

  private readonly tabsRef = FSComponent.createRef<TabbedContainer>();

  private readonly evtSub = this.bus.getSubscriber<ClockEvents & AdcEvents & EngineEvents & FuelTotalizerEvents & WeightFuelEvents & GNSSEvents & LNavDataEvents>();
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
  private readonly basicOperatingWeightSource = ConsumerSubject.create(this.evtSub.on('weightfuel_basic_operating_weight'), 0);
  private readonly totalPassengerWeightSource = ConsumerSubject.create(this.evtSub.on('weightfuel_total_passenger_weight'), 0);
  private readonly zeroFuelWeightSource = ConsumerSubject.create(this.evtSub.on('weightfuel_zero_fuel_weight'), 0);

  // Intermediary derived values
  private readonly fobHasBeenInitialized = this.fuelOnBoardWeightSetting.map(val => val >= 0);

  private readonly fuelOnBoardWeightSource = ConsumerValue.create(this.evtSub.on('weightfuel_fob_weight'), null).pause();
  private readonly aircraftWeightSource = ConsumerValue.create(this.evtSub.on('weightfuel_aircraft_weight'), null).pause();
  private readonly landingFuelSource = ConsumerValue.create(this.evtSub.on('weightfuel_landing_fuel'), null).pause();
  private readonly landingWeightSource = ConsumerValue.create(this.evtSub.on('weightfuel_landing_weight'), null).pause();
  private readonly holdingFuelSource = ConsumerValue.create(this.evtSub.on('weightfuel_holding_fuel'), null).pause();
  private readonly excessFuelSource = ConsumerValue.create(this.evtSub.on('weightfuel_excess_fuel'), null).pause();

  private readonly eventWeights = [
    this.fuelOnBoardWeightSource,
    this.aircraftWeightSource,
    this.landingFuelSource,
    this.landingWeightSource,
    this.holdingFuelSource,
    this.excessFuelSource
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
  private readonly overweightCautionClasses = SetSubject.create<string>(['wf-overweight-caution', 'hidden']);
  private readonly estLandingWeightClasses = SetSubject.create<string>(['wf-top-row']);
  private readonly estLandingFuelWeightClasses = SetSubject.create<string>(['wf-top-row']);
  private readonly fuelReservesRowClasses =
    SetSubject.create<string>(['wf-row', 'wf-derived-weight-row']);
  private readonly fuelHoldingRowClasses =
    SetSubject.create<string>(['wf-row', 'wf-derived-weight-row', 'wf-holding-time-row', 'wf-fuel-by-vol']);
  private readonly excessFuelWeightClasses = SetSubject.create<string>(['wf-excess-fuel']);

  private readonly settingPipes: Subscription[] = [];

  private updateSub?: Subscription;

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
      this.basicOperatingWeightSource.pipe(this.basicOperatingWeightNUS),
      this.totalPassengerWeightSource.pipe(this.totalPassengerWeightNUS),
      this.zeroFuelWeightSource.pipe(this.zeroFuelWeightNUS)
    );

    // Toggle classes
    this.fuelUnitIsVolumetric.sub(fuelUnitIsVolumetric => {
      this.fuelOnBoardRowClasses.toggle('wf-fuel-by-vol', fuelUnitIsVolumetric);
      this.fuelOnBoardRowClasses.toggle('wf-fuel-by-weight', !fuelUnitIsVolumetric);
      this.fuelReservesRowClasses.toggle('wf-fuel-by-vol', fuelUnitIsVolumetric);
      this.fuelReservesRowClasses.toggle('wf-fuel-by-weight', !fuelUnitIsVolumetric);
    }, true);

    this.zeroFuelWeightNUS.sub(zfw => {
      const maxZfwExceeded = zfw.compare(this.props.weightLimits.maxZeroFuel) > 0;
      this.zeroFuelWeightClasses.toggle(CAUTION_CLASS, maxZfwExceeded);
    }, true);

    this.aircraftWeightNUS.sub(tow => {
      const mtowExceeded = !tow.isNaN() && tow.compare(this.props.weightLimits.maxTakeoff) > 0;
      this.aircraftWeightClasses.toggle(CAUTION_CLASS, mtowExceeded);
      this.overweightCautionClasses.toggle('hidden', !mtowExceeded);
    }, true);

    this.estLandingWeightNUS.sub(elw => {
      const mlwExceeded = !elw.isNaN() && elw.compare(this.props.weightLimits.maxLanding) > 0;
      this.estLandingWeightClasses.toggle(CAUTION_CLASS, mlwExceeded);
    }, true);

    MappedSubject.create(
      this.estLandingFuelWeightNUS,
      this.excessFuelWeightNUS
    ).sub(([landingFuel, excessFuel]) => {
      const isValid = !landingFuel.isNaN() && !excessFuel.isNaN();

      const isWarning = isValid && landingFuel.number <= 0;
      this.estLandingFuelWeightClasses.toggle(WARNING_CLASS, isWarning);
      this.fuelHoldingRowClasses.toggle(WARNING_CLASS, isWarning);
      this.excessFuelWeightClasses.toggle(WARNING_CLASS, isWarning);

      const isCaution = isValid && !isWarning && excessFuel.number <= 0;
      this.estLandingFuelWeightClasses.toggle(CAUTION_CLASS, isCaution);
      this.fuelHoldingRowClasses.toggle(CAUTION_CLASS, isCaution);
      this.excessFuelWeightClasses.toggle(CAUTION_CLASS, isCaution);
    }, true);

    this.updateSub = this.evtSub.on('realTime').atFrequency(1).handle(this.update.bind(this), true);
  }

  /** @inheritDoc */
  public override onOpen(): void {
    this.tabsRef.instance.selectTab(1);

    // If basic empty weight is uninitialized, set it to the default value.
    if (this.basicEmptyWeightSetting.value < 0) {
      this.basicEmptyWeightSetting.value = this.props.weightLimits.basicEmpty.asUnit(UnitType.POUND);
    }
  }

  /** @inheritDoc */
  public override onResume(): void {
    this.settingPipes.forEach(sub => { sub.resume(true); });
    this.eventWeights.forEach(sub => { sub.resume(); });

    this.tabsRef.instance.resume();

    this.updateSub!.resume(true);
  }

  /** @inheritDoc */
  public override onPause(): void {
    this.settingPipes.forEach(sub => { sub.pause(); });
    this.eventWeights.forEach(sub => { sub.pause(); });

    this.tabsRef.instance.pause();

    this.updateSub!.pause();
  }

  /**
   * Updates this page.
   */
  private update(): void {
    this.fuelOnBoardWeightNUS.set(this.fuelOnBoardWeightSource.get() ?? NaN);
    this.aircraftWeightNUS.set(this.aircraftWeightSource.get() ?? NaN);
    this.estHoldingFuelWeightNUS.set(this.holdingFuelSource.get() ?? NaN);
    this.estLandingFuelWeightNUS.set(this.landingFuelSource.get() ?? NaN);
    this.estLandingWeightNUS.set(this.landingWeightSource.get() ?? NaN);
    this.excessFuelWeightNUS.set(this.excessFuelSource.get() ?? NaN);
  }

  /**
   * Opens a dialog that allows the user to select a weight.
   * @param input Input parameters defining the dialog request.
   * @returns A Promise which is fulfilled with the result of the request.
   */
  private async openWeightDialog(input: GtcWeightDialogInput): Promise<GtcDialogResult<GtcWeightDialogOutput>> {
    return this.props.gtcService.openPopup<GtcWeightDialog>(GtcViewKeys.WeightDialog1, 'normal', 'hide').ref.request(input);
  }

  /**
   * Opens a dialog that allows the user to select a weight to be saved to a user setting.
   * @param setting The user setting to change.
   * @param input Input parameters defining the dialog request.
   */
  private async openWeightDialogForSetting(
    setting: UserSetting<number>,
    input: Omit<GtcWeightDialogInput, 'initialValue' | 'initialUnit'>
  ): Promise<void> {
    const result = await this.openWeightDialog({
      ...input,
      initialValue: setting.value,
      initialUnit: UnitType.POUND,
    });

    if (!result.wasCancelled) {
      setting.value = result.payload.unit.convertTo(result.payload.value, UnitType.POUND);
    }
  }

  /**
   * Responds to when this page's crew stores button is pressed.
   */
  private async onCrewStoresPressed(): Promise<void> {
    await this.openWeightDialogForSetting(this.crewAndStoresWeightSetting, {
      title: 'Pilot and Stores',
      unitType: this.weightUnit,
      maximumValue: 9999
    });
  }

  /**
   * Responds to when this page's set empty weight button is pressed.
   */
  private async onSetEmptyWeightPressed(): Promise<void> {
    await this.openWeightDialogForSetting(this.basicEmptyWeightSetting, {
      title: 'Basic Empty Weight',
      unitType: this.weightUnit,
      maximumValue: 99999
    });
  }

  /**
   * Responds to when this page's passengers button is pressed.
   */
  private async onPassengersPressed(): Promise<void> {
    const result = await this.gtcService.openPopup<GtcIntegerDialog>(GtcViewKeys.IntegerDialog1, 'normal', 'hide')
      .ref.request({
        title: 'Number of Passengers',
        initialValue: this.numberOfPassengersSetting.value,
        maximumValue: this.props.weightLimits.maxPassengerCount
      });

    if (!result.wasCancelled) {
      this.numberOfPassengersSetting.value = result.payload;
    }
  }

  /**
   * Responds to when this page's passenger weight button is pressed.
   */
  private async onPassengerWeightPressed(): Promise<void> {
    await this.openWeightDialogForSetting(this.avgPassengerWeightSetting, {
      title: 'Weight Per Passenger',
      unitType: this.weightUnit,
      maximumValue: 999
    });
  }

  /**
   * Responds to when this page's cargo button is pressed.
   */
  private async onCargoPressed(): Promise<void> {
    await this.openWeightDialogForSetting(this.cargoWeightSetting, {
      title: 'Cargo Weight',
      unitType: this.weightUnit,
      maximumValue: 99999
    });
  }

  /**
   * Responds to when this page's fuel on board button is pressed.
   */
  private async onFuelOnBoardPressed(): Promise<void> {
    const currentFobWeight = this.fuelOnBoardWeightSource.get();

    const result = await this.openWeightDialog({
      title: 'Fuel On Board',
      initialValue: currentFobWeight === null ? 0 : currentFobWeight,
      initialUnit: UnitType.POUND,
      unitType: this.fuelUnit,
      maximumValue: this.fuelUnit.convertFrom(FUEL_TOTAL_CAPACITY_GALLONS, UnitType.GALLON_FUEL),
    });

    if (!result.wasCancelled) {
      this.fuelOnBoardWeightSetting.value = result.payload.unit.convertTo(result.payload.value, UnitType.POUND);
      this.publisher.pub(
        'fuel_totalizer_set_remaining',
        result.payload.unit.convertTo(result.payload.value, UnitType.GALLON_FUEL),
        true,
        false
      );
    }
  }

  /**
   * Responds to when this page's FOB SYNC button is pressed.
   */
  private onFobSyncPressed(): void {
    const fobLbs = this.fuelUsable.get();
    this.fuelOnBoardWeightSetting.set(fobLbs);
    this.publisher.pub(
      'fuel_totalizer_set_remaining',
      UnitType.POUND.convertTo(fobLbs, UnitType.GALLON_FUEL),
      true,
      false
    );
  }

  /**
   * Responds to when this page's fuel reserves button is pressed.
   */
  private async onFuelReservesPressed(): Promise<void> {
    await this.openWeightDialogForSetting(this.fuelReservesWeightSetting, {
      title: 'Fuel Reserves Weight',
      unitType: this.fuelUnit,
      maximumValue: this.fuelUnit.convertFrom(FUEL_TOTAL_CAPACITY_GALLONS, UnitType.GALLON_FUEL),
    });
  }

  /**
   * Responds to when this page's holding time button is pressed.
   */
  private async onHoldingTimePressed(): Promise<void> {
    const result = await this.gtcService.openPopup<GtcMinuteDurationDialog>
      (GtcViewKeys.MinuteDurationDialog, 'normal', 'hide')
      // No title is passed as the dialog is titleless in the trainer, but the trainer could be wrong
      .ref.request({ initialValue: this.estHoldingTimeMinsSetting.value, max: 240 });

    if (!result.wasCancelled) {
      this.estHoldingTimeMinsSetting.value = result.payload;
    }
  }

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
                    onPressed={this.onCrewStoresPressed.bind(this)}
                  />
                )}
                {GtcWeightFuelPage.renderUnderline()}
                {this.renderLabelValueRow('Basic Operating Weight', this.basicOperatingWeightNUS)}
                <GtcTouchButton
                  class='wf-row wf-bottom-center-button'
                  label={'Set Empty\nWeight'}
                  onPressed={this.onSetEmptyWeightPressed.bind(this)}
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
                      onPressed={this.onPassengersPressed.bind(this)}
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
                      onPressed={this.onPassengerWeightPressed.bind(this)}
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
                    onPressed={this.onCargoPressed.bind(this)}
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
                    state={this.fuelOnBoardWeightNUS}
                    renderValue={
                      <NumberUnitDisplay
                        formatter={WEIGHT_FUEL_FORMATTER}
                        value={this.fuelOnBoardWeightNUS}
                        displayUnit={this.unitsSettingManager.fuelUnits}
                      />
                    }
                    onPressed={this.onFuelOnBoardPressed.bind(this)}
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
                <div class={{ 'wf-fob-instructions': true, 'hidden': this.fobHasBeenInitialized }}>Press FOB SYNC or enter Fuel On<br />Board to confirm fuel.</div>
                <div class={this.overweightCautionClasses}>Max Takeoff Weight Exceeded</div>
                <GtcTouchButton
                  class='wf-row wf-bottom-center-button'
                  label={'FOB SYNC'}
                  onPressed={this.onFobSyncPressed.bind(this)}
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
                    onPressed={this.onFuelReservesPressed.bind(this)}
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
                    onPressed={this.onHoldingTimePressed.bind(this)}
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

    this.fuelUnitIsVolumetric.destroy();
    this.fuelUsable.destroy();
    this.fobHasBeenInitialized.destroy();

    this.updateSub!.destroy();

    super.destroy();
  }
}
