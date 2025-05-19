import {
  ConsumerSubject, ConsumerValue, DurationFormatter, EngineEvents, FSComponent, NumberFormatter, NumberUnitSubject,
  Subject, SubscribableUtils, Subscription, Unit, UnitFamily, UnitType, UserSettingManager, VNode, Value
} from '@microsoft/msfs-sdk';

import { AdcSystemEvents, FmsPositionMode, FmsPositionSystemEvents } from '@microsoft/msfs-garminsdk';

import { G3XUnitsFuelType, UnitsConfig } from '../../../../../Shared/AvionicsConfig/UnitsConfig';
import { G3XNumberUnitDisplay } from '../../../../../Shared/Components/Common/G3XNumberUnitDisplay';
import { AbstractTabbedContent } from '../../../../../Shared/Components/TabbedContainer/AbstractTabbedContent';
import { TabbedContentProps } from '../../../../../Shared/Components/TabbedContainer/TabbedContent';
import { CombinedTouchButton } from '../../../../../Shared/Components/TouchButton/CombinedTouchButton';
import { UiTouchButton } from '../../../../../Shared/Components/TouchButton/UiTouchButton';
import { UiValueTouchButton } from '../../../../../Shared/Components/TouchButton/UiValueTouchButton';
import { FuelTotalizerControlEvents, FuelTotalizerEvents } from '../../../../../Shared/Fuel';
import { G3XUnitType } from '../../../../../Shared/Math/G3XUnitType';
import { G3XUnitsUserSettings } from '../../../../../Shared/Settings/G3XUnitsUserSettings';
import { GduUserSettingTypes } from '../../../../../Shared/Settings/GduUserSettings';
import { UiService } from '../../../../../Shared/UiSystem/UiService';
import { UiViewKeys } from '../../../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../../../Shared/UiSystem/UiViewTypes';
import { UiGenericNumberUnitDialog } from '../../../../Dialogs/UiGenericNumberUnitDialog';

import './FuelCalculatorTab.css';

/**
 * Component props for {@link FuelCalculatorTab}.
 */
export interface FuelCalculatorTabProps extends TabbedContentProps {
  /** The UI service. */
  uiService: UiService;

  /** A manager for GDU user settings. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;

  /** A configuration object defining options for measurement units. */
  unitsConfig: UnitsConfig;

  /**
   * The first preset fuel amount, in gallons. If not defined, then the button for setting the fuel remaining to the
   * first preset fuel amount will not be visible.
   */
  presetFuel1?: number;

  /**
   * The second preset fuel amount, in gallons. If not defined, then the button for setting the fuel remaining to the
   * second preset fuel amount will not be visible.
   */
  presetFuel2?: number;
}

/**
 * An MFD engine page fuel calculator tab.
 */
export class FuelCalculatorTab extends AbstractTabbedContent<FuelCalculatorTabProps> {
  private static readonly VALUE_UPDATE_INTERVAL = 1000; // milliseconds

  // gallons
  private readonly fuelRemaining = ConsumerSubject.create(null, 0).pause();
  // gallons per hour
  private readonly fuelFlow = ConsumerValue.create(null, 0).pause();
  // gallons
  private readonly fuelBurned = ConsumerSubject.create(null, 0).pause();

  private readonly isAirspeedDataValid = ConsumerValue.create(null, false).pause();
  private readonly isTemperatureDataValid = ConsumerValue.create(null, false).pause();
  // knots
  private readonly tas = ConsumerValue.create(null, 0).pause();

  private readonly fmsPosMode = ConsumerValue.create(null, FmsPositionMode.None).pause();
  // knots
  private readonly groundSpeed = ConsumerValue.create(null, 0).pause();

  private readonly economyWeightPerDistanceVisible = Subject.create<boolean>(false);
  private readonly economyDistancePerWeightVisible = Subject.create<boolean>(false);
  // hours
  private readonly endurance = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);
  // nautical miles per gallon
  private readonly economy = Value.create(NaN);

  private readonly gallonFuelWeightUnit = FuelCalculatorTab.getGallonFuelWeightUnit(this.props.unitsConfig.fuelType);
  private readonly defaultDistancePerWeightUnit = FuelCalculatorTab.getDefaultDistancePerWeightEconomyUnit(this.props.unitsConfig.fuelType);
  private readonly defaultWeightPerDistanceUnit = FuelCalculatorTab.getDefaultWeightPerDistanceEconomyUnit(this.props.unitsConfig.fuelType);

  private readonly economyWeightPerDistanceValue = NumberUnitSubject.create(this.defaultWeightPerDistanceUnit.createNumber(0));
  private readonly economyDistancePerWeightValue = NumberUnitSubject.create(this.defaultDistancePerWeightUnit.createNumber(0));

  private readonly noWindRangeValue = NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN));
  private readonly fuelRemainingValue = NumberUnitSubject.create(this.gallonFuelWeightUnit.createNumber(NaN));
  private readonly fuelUsedValue = NumberUnitSubject.create(this.gallonFuelWeightUnit.createNumber(NaN));
  private readonly decreaseButtonEnabled = this.fuelRemaining.map(fuelRemaining => fuelRemaining > 0);

  private readonly unitsSettingManager = G3XUnitsUserSettings.getManager(this.props.uiService.bus);
  private readonly fuelEconomyUnitsDistancePerWeight = this.unitsSettingManager.fuelEconomyUnits.map(unit => {
    return unit.family === UnitFamily.DistancePerWeight ? unit : this.defaultDistancePerWeightUnit;
  });
  private readonly fuelEconomyUnitsWeightPerDistance = this.unitsSettingManager.fuelEconomyUnits.map(unit => {
    return unit.family === UnitFamily.WeightPerDistance ? unit : this.defaultWeightPerDistanceUnit;
  });

  private lastValueUpdateTime: number | undefined = undefined;

  private readonly subscriptions: Subscription[] = [
    this.fuelRemaining,
    this.fuelFlow,
    this.fuelBurned,
    this.isAirspeedDataValid,
    this.isTemperatureDataValid,
    this.tas,
    this.fmsPosMode,
    this.groundSpeed,
    this.fuelEconomyUnitsDistancePerWeight,
    this.fuelEconomyUnitsWeightPerDistance
  ];

  private readonly pauseable = [
    this.fuelRemaining,
    this.fuelFlow,
    this.fuelBurned,
    this.isAirspeedDataValid,
    this.isTemperatureDataValid,
    this.tas,
    this.fmsPosMode,
    this.groundSpeed
  ];

  /** @inheritDoc */
  public onAfterRender(): void {
    const sub = this.props.uiService.bus.getSubscriber<EngineEvents & AdcSystemEvents & FmsPositionSystemEvents & FuelTotalizerEvents>();

    this.fuelRemaining.setConsumer(sub.on('fuel_totalizer_remaining'));
    this.fuelFlow.setConsumer(sub.on('fuel_flow_total'));
    this.fuelBurned.setConsumer(sub.on('fuel_totalizer_burned'));
    this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${this.props.uiService.gduIndex}`));
    this.groundSpeed.setConsumer(sub.on(`fms_pos_ground_speed_${this.props.uiService.gduIndex}`));

    this.fuelRemaining.pipe(this.fuelRemainingValue);
    this.fuelBurned.pipe(this.fuelUsedValue);

    this.subscriptions.push(
      this.props.gduSettingManager.getSetting('gduAdcIndex').sub(index => {
        this.isAirspeedDataValid.setConsumer(sub.on(`adc_airspeed_data_valid_${index}`));
        this.isTemperatureDataValid.setConsumer(sub.on(`adc_temperature_data_valid_${index}`));
        this.tas.setConsumer(sub.on(`adc_tas_${index}`));
      }, true),

      this.unitsSettingManager.fuelEconomyUnits.sub(this.updateEconomyDisplay.bind(this), true)
    );
  }

  /** @inheritDoc */
  public onOpen(): void {
    for (const pauseable of this.pauseable) {
      pauseable.resume();
    }
  }

  /** @inheritDoc */
  public onClose(): void {
    for (const pauseable of this.pauseable) {
      pauseable.pause();
    }

    this.lastValueUpdateTime = undefined;
  }

  /** @inheritDoc */
  public onUpdate(time: number): void {
    if (this.lastValueUpdateTime !== undefined) {
      if (time < this.lastValueUpdateTime) {
        time = this.lastValueUpdateTime;
      }
    }

    if (this.lastValueUpdateTime === undefined || time - this.lastValueUpdateTime >= FuelCalculatorTab.VALUE_UPDATE_INTERVAL) {
      this.updateValues();
      this.lastValueUpdateTime = time;
    }
  }

  /**
   * Updates this tab's computed values.
   */
  private updateValues(): void {
    const fuelRemaining = this.fuelRemaining.get();
    const fuelFlow = this.fuelFlow.get();
    const tas = this.isAirspeedDataValid.get() && this.isTemperatureDataValid.get() ? this.tas.get() : NaN;
    const gs = this.fmsPosMode.get() !== FmsPositionMode.None ? this.groundSpeed.get() : NaN;

    const endurance = fuelFlow <= 0 ? NaN : fuelRemaining / fuelFlow;
    const noWindRange = isNaN(tas) || tas < 20 ? NaN : tas * endurance;
    const economy = isNaN(gs) || gs < 20 || fuelFlow <= 0 ? NaN : gs / fuelFlow;

    this.endurance.set(endurance);
    this.noWindRangeValue.set(noWindRange);
    this.economy.set(economy);

    this.updateEconomyDisplay(this.unitsSettingManager.fuelEconomyUnits.get());
  }

  /**
   * Updates the display of this tab's calculated fuel economy value.
   * @param economyUnit The unit in which to display the fuel economy value.
   */
  private updateEconomyDisplay(economyUnit: Unit<UnitFamily.DistancePerWeight | UnitFamily.WeightPerDistance>): void {
    const economy = this.economy.get();

    if (economyUnit.family === UnitFamily.DistancePerWeight) {
      this.economyDistancePerWeightValue.set(economy);
      this.economyWeightPerDistanceVisible.set(false);
      this.economyDistancePerWeightVisible.set(true);
    } else {
      this.economyWeightPerDistanceValue.set(235.2145 / economy);
      this.economyDistancePerWeightVisible.set(false);
      this.economyWeightPerDistanceVisible.set(true);
    }
  }

  /**
   * Publishes a fuel totalizer set fuel remaining command to the event bus.
   * @param fuelRemaining The fuel remaining value to set, in gallons.
   */
  private publishSetFuelRemaining(fuelRemaining: number): void {
    this.props.uiService.bus.getPublisher<FuelTotalizerControlEvents>().pub('fuel_totalizer_set_remaining', fuelRemaining, true, false);
  }

  /**
   * Publishes a fuel totalizer set fuel burned command to the event bus.
   * @param fuelBurned The fuel burned value to set, in gallons.
   */
  private publishSetFuelBurned(fuelBurned: number): void {
    this.props.uiService.bus.getPublisher<FuelTotalizerControlEvents>().pub('fuel_totalizer_set_burned', fuelBurned, true, false);
  }

  /**
   * Responds to when this tab's Fuel Remaining button is pressed.
   */
  private async onFuelRemainingPressed(): Promise<void> {
    const result = await this.props.uiService
      .openMfdPopup<UiGenericNumberUnitDialog>(UiViewStackLayer.Overlay, UiViewKeys.GenericNumberUnitDialog1)
      .ref.request({
        unitType: this.unitsSettingManager.fuelUnits.get(),
        initialValue: this.fuelRemaining.get(),
        initialUnit: this.gallonFuelWeightUnit,
        minimumValue: 0,
        maximumValue: 999,
        //I have no reference to original title, so I'm just guessing here
        title: 'Set Fuel Remaining',
        innerKnobLabel: 'Set Fuel Remaining',
        outerKnobLabel: 'Set Fuel Remaining',
      });

    if (!result.wasCancelled) {
      const newValue = result.payload.unit.convertTo(result.payload.value, this.gallonFuelWeightUnit);
      this.publishSetFuelRemaining(newValue);
    }
  }

  /**
   * Responds to when this tab's Fuel Remaining Increase button is pressed.
   */
  private async onFuelRemainingIncPressed(): Promise<void> {
    const result = await this.props.uiService.openMfdPopup<UiGenericNumberUnitDialog>(UiViewStackLayer.Overlay, UiViewKeys.GenericNumberUnitDialog1)
      .ref.request({
        unitType: this.unitsSettingManager.fuelUnits.get(),
        initialValue: 0,
        minimumValue: 0,
        maximumValue: 999,
        title: 'Add Fuel',
        innerKnobLabel: 'Add Fuel',
        outerKnobLabel: 'Add Fuel',
      });

    if (!result.wasCancelled) {
      const newValue = this.fuelRemaining.get() + result.payload.unit.convertTo(result.payload.value, this.gallonFuelWeightUnit);
      this.publishSetFuelRemaining(newValue);
    }
  }

  /**
   * Responds to when this tab's Fuel Remaining Decrease button is pressed.
   */
  private async onFuelRemainingDecPressed(): Promise<void> {
    const result = await this.props.uiService.openMfdPopup<UiGenericNumberUnitDialog>(UiViewStackLayer.Overlay, UiViewKeys.GenericNumberUnitDialog1)
      .ref.request({
        unitType: this.unitsSettingManager.fuelUnits.get(),
        initialValue: 0,
        minimumValue: 0,
        maximumValue: 999,
        title: 'Remove Fuel',
        innerKnobLabel: 'Remove Fuel',
        outerKnobLabel: 'Remove Fuel',
      });

    if (!result.wasCancelled) {
      const newValue = this.fuelRemaining.get() - result.payload.unit.convertTo(result.payload.value, this.gallonFuelWeightUnit);
      this.publishSetFuelRemaining(newValue);
    }
  }

  /**
   * Responds to when this tab's Fuel Used button is pressed.
   */
  private async onFuelUsedPressed(): Promise<void> {
    const result = await this.props.uiService.openMfdPopup<UiGenericNumberUnitDialog>(UiViewStackLayer.Overlay, UiViewKeys.GenericNumberUnitDialog1)
      .ref.request({
        unitType: this.unitsSettingManager.fuelUnits.get(),
        initialValue: this.fuelBurned.get(),
        initialUnit: this.gallonFuelWeightUnit,
        minimumValue: 0,
        maximumValue: 999,
        //I have no reference to original title, so I'm just guessing here
        title: 'Set Fuel Used',
        innerKnobLabel: 'Set Fuel Used',
        outerKnobLabel: 'Set Fuel Used',
      });

    if (!result.wasCancelled) {
      const newValue = result.payload.unit.convertTo(result.payload.value, this.gallonFuelWeightUnit);
      this.publishSetFuelBurned(newValue);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='fuel-calculator-tab'>
        <div class='fuel-calculator-tab-box fuel-calculator-tab-gauges-box'>
          {this.props.children}
        </div>
        <div class='fuel-calculator-tab-main'>
          <div class='fuel-calculator-tab-box fuel-calculator-tab-values-box'>
            <div class='fuel-calculator-tab-value-box'>
              <div class='fuel-calculator-tab-value-box-title'>Endurance</div>
              <div class='fuel-calculator-tab-value-box-value'>
                {this.endurance.map(DurationFormatter.create('{-}{hh}:{mm}', UnitType.HOUR, 1 / 60, '__:__'))}
              </div>
            </div>

            <div class='fuel-calculator-tab-value-box fuel-calculator-tab-value-box-range'>
              <div class='fuel-calculator-tab-value-box-title'>No-Wind Range</div>
              <G3XNumberUnitDisplay
                value={this.noWindRangeValue}
                formatter={NumberFormatter.create({ precision: 0.1, nanString: '_____' })}
                displayUnit={this.unitsSettingManager.distanceUnitsLarge}
                class='fuel-calculator-tab-value-box-value'
              />
            </div>

            <div class='fuel-calculator-tab-value-box'>
              <div class='fuel-calculator-tab-value-box-title'>Economy</div>
              <G3XNumberUnitDisplay
                value={this.economyDistancePerWeightValue}
                formatter={NumberFormatter.create({ precision: 0.1, nanString: '__._' })}
                displayUnit={this.fuelEconomyUnitsDistancePerWeight}
                class={{ 'fuel-calculator-tab-value-box-value': true, hidden: this.economyWeightPerDistanceVisible }}
              />
              <G3XNumberUnitDisplay
                value={this.economyWeightPerDistanceValue}
                formatter={NumberFormatter.create({ precision: 0.1, nanString: '__._' })}
                displayUnit={this.fuelEconomyUnitsWeightPerDistance}
                class={{ 'fuel-calculator-tab-value-box-value': true, hidden: this.economyDistancePerWeightVisible }}
              />
            </div>
          </div>
          <div class='fuel-calculator-tab-box fuel-calculator-tab-controls-box'>
            <div class='fuel-calculator-tab-controls-box-inner'>
              <div class='fuel-calculator-tab-controls-box-spacer-top' />

              <CombinedTouchButton
                orientation='row'
                class='fuel-calculator-tab-fuel-remaining'
              >
                <UiTouchButton
                  label='-'
                  isEnabled={this.decreaseButtonEnabled}
                  onPressed={this.onFuelRemainingDecPressed.bind(this)}
                  class='fuel-calculator-tab-fuel-remaining-incdec'
                />
                <UiValueTouchButton
                  state={this.fuelRemainingValue}
                  label='Fuel Remaining'
                  renderValue={
                    <G3XNumberUnitDisplay
                      value={this.fuelRemainingValue}
                      formatter={NumberFormatter.create({ precision: 0.1, nanString: '_._' })}
                      displayUnit={this.unitsSettingManager.fuelUnits}
                    />
                  }
                  onPressed={this.onFuelRemainingPressed.bind(this)}
                  class='fuel-calculator-tab-fuel-remaining-value'
                />
                <UiTouchButton
                  label='+'
                  onPressed={this.onFuelRemainingIncPressed.bind(this)}
                  class='fuel-calculator-tab-fuel-remaining-incdec'
                />
              </CombinedTouchButton>

              {this.props.presetFuel1 || this.props.presetFuel2
                ? (
                  <>
                    <CombinedTouchButton
                      orientation='row'
                      class='fuel-calculator-tab-fuel-presets'
                    >
                      {this.props.presetFuel1 && (
                        <UiTouchButton
                          label={
                            <G3XNumberUnitDisplay
                              value={this.gallonFuelWeightUnit.createNumber(this.props.presetFuel1)}
                              formatter={NumberFormatter.create({ precision: 0, nanString: '__' })}
                              displayUnit={this.unitsSettingManager.fuelUnits}
                            />
                          }
                          onPressed={this.publishSetFuelRemaining.bind(this, this.props.presetFuel1)}
                          class='fuel-calculator-tab-fuel-preset'
                        />
                      )}
                      {this.props.presetFuel2 && (
                        <UiTouchButton
                          label={
                            <G3XNumberUnitDisplay
                              value={this.gallonFuelWeightUnit.createNumber(this.props.presetFuel2)}
                              formatter={NumberFormatter.create({ precision: 0, nanString: '__' })}
                              displayUnit={this.unitsSettingManager.fuelUnits}
                            />
                          }
                          onPressed={this.publishSetFuelRemaining.bind(this, this.props.presetFuel2)}
                          class='fuel-calculator-tab-fuel-preset'
                        />
                      )}
                    </CombinedTouchButton>
                    <div class='fuel-calculator-tab-fuel-preset-divider' />
                  </>
                )
                : <div class='fuel-calculator-tab-fuel-preset-separator' />
              }

              <CombinedTouchButton
                orientation='row'
                class='fuel-calculator-tab-fuel-used'
              >
                <UiValueTouchButton
                  state={this.fuelUsedValue}
                  label='Fuel Used'
                  renderValue={
                    <G3XNumberUnitDisplay
                      value={this.fuelUsedValue}
                      formatter={NumberFormatter.create({ precision: 0.1, nanString: '_._' })}
                      displayUnit={this.unitsSettingManager.fuelUnits}
                    />
                  }
                  onPressed={this.onFuelUsedPressed.bind(this)}
                  class='fuel-calculator-tab-fuel-used-value'
                />
                <UiTouchButton
                  label='Reset'
                  onPressed={this.publishSetFuelBurned.bind(this, 0)}
                  class='fuel-calculator-tab-fuel-used-reset'
                />
              </CombinedTouchButton>

              <div class='fuel-calculator-tab-controls-box-spacer-bottom' />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }

  /**
   * Gets the weight unit equivalent to one gallon of fuel for a given fuel type.
   * @param type The fuel type for which to get the fuel weight unit.
   * @returns The weight unit equivalent to one gallon of fuel for the specified fuel type.
   */
  private static getGallonFuelWeightUnit(type: G3XUnitsFuelType): Unit<UnitFamily.Weight> {
    switch (type) {
      case G3XUnitsFuelType.JetA:
        return UnitType.GALLON_JET_A_FUEL;
      case G3XUnitsFuelType.OneHundredLL:
        return UnitType.GALLON_100LL_FUEL;
      case G3XUnitsFuelType.Autogas:
        return UnitType.GALLON_AUTOGAS_FUEL;
      case G3XUnitsFuelType.Sim:
      default:
        return G3XUnitType.GALLON_SIM_FUEL;
    }
  }

  /**
   * Gets the default distance per fuel weight unit for a given fuel type.
   * @param type The fuel type for which to get the distance per fuel weight unit.
   * @returns The default distance per fuel weight unit for the specified fuel type.
   */
  private static getDefaultDistancePerWeightEconomyUnit(type: G3XUnitsFuelType): Unit<UnitFamily.DistancePerWeight> {
    switch (type) {
      case G3XUnitsFuelType.JetA:
        return UnitType.NMILE_PER_GALLON_JET_A_FUEL;
      case G3XUnitsFuelType.OneHundredLL:
        return UnitType.NMILE_PER_GALLON_100LL_FUEL;
      case G3XUnitsFuelType.Autogas:
        return UnitType.NMILE_PER_GALLON_AUTOGAS_FUEL;
      case G3XUnitsFuelType.Sim:
      default:
        return G3XUnitType.NMILE_PER_GALLON_SIM_FUEL;
    }
  }

  /**
   * Gets the default fuel weight per distance unit for a given fuel type.
   * @param type The fuel type for which to get the fuel weight per distance unit.
   * @returns The default fuel weight per distance unit for the specified fuel type.
   */
  private static getDefaultWeightPerDistanceEconomyUnit(type: G3XUnitsFuelType): Unit<UnitFamily.WeightPerDistance> {
    switch (type) {
      case G3XUnitsFuelType.JetA:
        return G3XUnitType.LITER_JET_A_FUEL_PER_100KM;
      case G3XUnitsFuelType.OneHundredLL:
        return G3XUnitType.LITER_100LL_FUEL_PER_100KM;
      case G3XUnitsFuelType.Autogas:
        return G3XUnitType.LITER_AUTOGAS_FUEL_PER_100KM;
      case G3XUnitsFuelType.Sim:
      default:
        return G3XUnitType.LITER_SIM_FUEL_PER_100KM;
    }
  }
}
