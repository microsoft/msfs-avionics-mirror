import {
  ConsumerSubject, ConsumerValue, EngineEvents, FSComponent, MappedSubject, NumberFormatter, NumberUnitSubject,
  SimVarValueType, Subject, Subscription, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import { FuelTotalizerControlEvents, FuelTotalizerEvents, NumberUnitDisplay, WeightFuelUserSettings } from '@microsoft/msfs-wtg3000-common';

import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcValueTouchButton } from '../../Components/TouchButton/GtcValueTouchButton';
import { GtcWeightDialog } from '../../Dialog/GtcWeightDialog';
import { GtcView } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';

import './GtcInitialFuelPage.css';

/**
 * A GTC initial fuel page.
 */
export class GtcInitialFuelPage extends GtcView {
  private static readonly TOTAL_FUEL_CAPACITY_GAL = SimVar.GetSimVarValue('FUEL TOTAL CAPACITY', SimVarValueType.GAL);

  private static readonly FUEL_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '_____' });

  private thisNode?: VNode;

  private readonly weightFuelSettingManager = WeightFuelUserSettings.getManager(this.bus);
  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.bus);

  private readonly fuelUsableTotal = ConsumerValue.create(null, 0).pause();

  private readonly fuelUsedSource = ConsumerSubject.create(null, 0).pause();
  private readonly fuelUsedValue = NumberUnitSubject.create(UnitType.GALLON_FUEL.createNumber(0));

  private readonly fuelRemainingSource = ConsumerSubject.create(null, 0).pause();
  private readonly fuelRemainingValue = NumberUnitSubject.create(UnitType.GALLON_FUEL.createNumber(0));

  private readonly initialFobSetting = this.weightFuelSettingManager.getSetting('weightFuelInitialFob');
  private readonly initialFobInput = Subject.create(0);
  private readonly initialFobInputValue = NumberUnitSubject.create(UnitType.POUND.createNumber(0));

  private readonly isConfirmButtonEnabled = MappedSubject.create(
    ([setting, input]) => setting !== input,
    this.initialFobSetting,
    this.initialFobInput
  ).pause();

  private readonly subscriptions: Subscription[] = [
    this.fuelUsableTotal,
    this.fuelUsedSource,
    this.fuelRemainingSource,
    this.isConfirmButtonEnabled
  ];

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Initial Fuel');

    const sub = this.props.gtcService.bus.getSubscriber<EngineEvents & FuelTotalizerEvents>();

    this.fuelUsableTotal.setConsumer(sub.on('fuel_usable_total'));
    this.fuelUsedSource.setConsumer(sub.on('fuel_totalizer_burned').atFrequency(1));
    this.fuelRemainingSource.setConsumer(sub.on('fuel_totalizer_remaining').atFrequency(1));

    this.initialFobInput.pipe(this.initialFobInputValue, value => value < 0 ? NaN : value);
    this.fuelUsedSource.pipe(this.fuelUsedValue);
    this.fuelRemainingSource.pipe(this.fuelRemainingValue);
  }

  /** @inheritDoc */
  public onOpen(wasPreviouslyOpened: boolean): void {
    if (!wasPreviouslyOpened) {
      this.initialFobInput.set(this.initialFobSetting.value);
    }
  }

  /** @inheritDoc */
  public onResume(): void {
    for (const sub of this.subscriptions) {
      sub.resume(true);
    }
  }

  /** @inheritDoc */
  public onPause(): void {
    for (const sub of this.subscriptions) {
      sub.pause();
    }
  }

  /**
   * Responds to when this page's initial fuel button is pressed.
   */
  private async onInitialFuelButtonPressed(): Promise<void> {
    const unitType = this.unitsSettingManager.fuelUnits.get();
    const result = await this.props.gtcService.openPopup<GtcWeightDialog>(GtcViewKeys.WeightDialog1, 'normal', 'hide')
      .ref.request({
        title: 'Fuel On Board',
        initialValue: this.initialFobInput.get(),
        initialUnit: UnitType.POUND,
        unitType,
        maximumValue: UnitType.GALLON_FUEL.convertTo(GtcInitialFuelPage.TOTAL_FUEL_CAPACITY_GAL, unitType)
      });

    if (!result.wasCancelled) {
      this.initialFobInput.set(result.payload.unit.convertTo(result.payload.value, UnitType.POUND));
    }
  }

  /**
   * Responds to when this page's confirm button is pressed.
   */
  private onConfirmButtonPressed(): void {
    this.initialFobSetting.value = this.initialFobInput.get();
    this.props.gtcService.bus.getPublisher<FuelTotalizerControlEvents>()
      .pub('fuel_totalizer_set_remaining', UnitType.POUND.convertTo(this.initialFobSetting.value, UnitType.GALLON_FUEL), true, false);
  }

  /**
   * Responds to when this page's FOB SYNC button is pressed.
   */
  private onSyncButtonPressed(): void {
    this.initialFobInput.set(Math.max(0, UnitType.GALLON_FUEL.convertTo(this.fuelUsableTotal.get(), UnitType.POUND)));
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='initial-fuel-page'>
        <div class='initial-fuel-page-left-panel gtc-panel'>
          <GtcValueTouchButton
            state={this.initialFobInput}
            label='Initial Fuel'
            renderValue={
              <NumberUnitDisplay
                value={this.initialFobInputValue}
                displayUnit={this.unitsSettingManager.fuelUnits}
                formatter={GtcInitialFuelPage.FUEL_FORMATTER}
              />
            }
            onPressed={this.onInitialFuelButtonPressed.bind(this)}
            class='initial-fuel-page-initial-fuel-button'
          />
          <div class='initial-fuel-page-left-value'>
            <div class='initial-fuel-page-left-value-title'>Fuel Used</div>
            <NumberUnitDisplay
              value={this.fuelUsedValue}
              displayUnit={this.unitsSettingManager.fuelUnits}
              formatter={GtcInitialFuelPage.FUEL_FORMATTER}
              class='initial-fuel-page-left-value-value'
            />
          </div>
          <div class='initial-fuel-page-left-value'>
            <div class='initial-fuel-page-left-value-title'>Remaining Fuel</div>
            <NumberUnitDisplay
              value={this.fuelRemainingValue}
              displayUnit={this.unitsSettingManager.fuelUnits}
              formatter={GtcInitialFuelPage.FUEL_FORMATTER}
              class='initial-fuel-page-left-value-value'
            />
          </div>
          <div class='initial-fuel-page-left-value'>
            <div class='initial-fuel-page-left-value-title'>Fuel Added</div>
            <NumberUnitDisplay
              // TODO: Not sure how this value is calculated.
              value={UnitType.POUND.createNumber(0)}
              displayUnit={this.unitsSettingManager.fuelUnits}
              formatter={GtcInitialFuelPage.FUEL_FORMATTER}
              class='initial-fuel-page-left-value-value'
            />
          </div>
        </div>
        <GtcTouchButton
          label='Confirm'
          isEnabled={this.isConfirmButtonEnabled}
          onPressed={this.onConfirmButtonPressed.bind(this)}
          class='initial-fuel-page-right-button initial-fuel-page-confirm-button'
        />
        <GtcTouchButton
          label='FOB SYNC'
          onPressed={this.onSyncButtonPressed.bind(this)}
          class='initial-fuel-page-right-button initial-fuel-page-sync-button'
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
