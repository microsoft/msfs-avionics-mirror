import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, MathUtils, ObjectSubject, Subject, Subscribable, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { ScrollableControl, UnitsUserSettings, UnitsWeightSettingMode } from '@microsoft/msfs-wtg1000';

import { WeightBalanceStore, WeightCgDataset } from '../../../Stores';
import { Sr22tWBDisplayField, Sr22tWBEditableField } from '../Shared';

import '../../Sr22tWeightBalancePage.css';

/** The properties for the {@link Sr22tWBAircraftWeightBalance} component. */
interface AircraftWeightBalanceProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The weight and balance store. */
  store: WeightBalanceStore;

  /** The function to register scroll controls */
  registerScroll: (ctrl: ScrollableControl, unregister: boolean) => void;
}

/** The AircraftWeightAndBalance component. Displays the `Aircraft Weight And Balance` section of the WeightBalance screen. */
export class Sr22tWBAircraftWeightBalance extends DisplayComponent<AircraftWeightBalanceProps> {
  private static readonly MAX_RAMP_WEIGHT = 3600;
  private static readonly MAX_TAKEOFF_WEIGHT = 3600;
  private static readonly MAX_ZFW = 3400;

  private readonly store = this.props.store;

  private readonly taxiInputRef = FSComponent.createRef<Sr22tWBEditableField>();

  private readonly weightUnit = UnitsUserSettings.getManager(this.props.bus).getSetting('unitsWeight');

  private readonly isRampWeightInvalid = Subject.create<boolean>(false);
  private readonly isTakeoffWeightInvalid = Subject.create<boolean>(false);
  private readonly isZeroFuelWeightInvalid = Subject.create<boolean>(false);
  private readonly isCgInvalid = Subject.create<boolean>(false);
  private readonly isCurrentWeightInvalid = Subject.create<boolean>(false);

  private subscriptions: Subscription[] = [];

  private readonly basicEmptyWeight = ObjectSubject.create({
    title: 'Basic Empty Weight',
    value: this.store.basicEmptyWeight,
    weightUnit: this.weightUnit,
  });

  private readonly zeroFuelWeight = ObjectSubject.create({
    title: 'Zero Fuel Weight',
    value: this.store.zeroFuelWeight.map((v) => MathUtils.round(v)) as Subscribable<number>,
    weightUnit: this.weightUnit,
  });

  private readonly fuelOnBoard = ObjectSubject.create({
    title: 'Fuel on Board',
    value: this.store.fuelOnBoard.map((v) => MathUtils.round(v)) as Subscribable<number>,
    weightUnit: this.weightUnit,
  });

  private readonly rampWeight = ObjectSubject.create({
    title: 'Ramp Weight',
    value: this.store.rampWeight.map((v) => MathUtils.round(v)) as Subscribable<number>,
    weightUnit: this.weightUnit,
  });

  private readonly takeoffWeight = ObjectSubject.create({
    title: 'Takeoff Weight',
    value: this.store.takeoffWeight.map((v) => MathUtils.round(v)) as Subscribable<number>,
    weightUnit: this.weightUnit,
  });

  private readonly currentWeight = ObjectSubject.create({
    title: 'Current Weight',
    value: this.store.currentWeight.map((v) => MathUtils.round(v)) as Subscribable<number>,
    weightUnit: this.weightUnit,
  });

  private readonly station = ObjectSubject.create({
    title: 'Station',
    value: this.store.station.map((v) => MathUtils.round(v, 0.1)) as Subscribable<number>,
    weightUnit: this.weightUnit,
  });

  private readonly macPercent = ObjectSubject.create({
    title: 'MAC',
    value: this.store.macPercent.map((v) => MathUtils.round(v, 0.1)) as Subscribable<number>,
    weightUnit: this.weightUnit,
  });

  private readonly taxiFuel = ObjectSubject.create({
    title: 'Taxi Fuel',
    storeValue: this.store.taxiFuelWeightInput,
    weightUnit: this.weightUnit,
    registerScroll: this.props.registerScroll,
  });

  /** @inheritdoc */
  public onAfterRender(): void {
    this.subscriptions = [
      this.store.cgCurrent.sub((v: WeightCgDataset) => {
        this.isCgInvalid.set(v.isOutOfCGEnvelope);
        this.isCurrentWeightInvalid.set(v.isWeightInvalid);
      }, true),

      this.rampWeight.get().value.sub((v) => {
        this.isRampWeightInvalid.set(v > Sr22tWBAircraftWeightBalance.MAX_RAMP_WEIGHT);
      }, true),

      this.takeoffWeight.get().value.sub((v) => {
        this.isTakeoffWeightInvalid.set(v > Sr22tWBAircraftWeightBalance.MAX_TAKEOFF_WEIGHT);
      }, true),

      this.zeroFuelWeight.get().value.sub((v) => {
        this.isZeroFuelWeightInvalid.set(v > Sr22tWBAircraftWeightBalance.MAX_ZFW);
      }, true),
    ];
  }

  /** Resets the temporary values to the values in the store. */
  public resetValues(): void {
    this.taxiInputRef.getOrDefault()?.reset();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='sr22t-system-page-section sr22t-wb-page-aircraft-wb'>
        <div class='sr22t-system-page-section-title'>Aircraft Weight and Balance</div>
        <div class='sr22t-system-page-section-content'>
          <div class="wb-page-section-column-1" >
            <Sr22tWBDisplayField data={this.basicEmptyWeight} />
            <Sr22tWBDisplayField data={this.zeroFuelWeight} isWarning={this.isZeroFuelWeightInvalid} />
            <Sr22tWBDisplayField data={this.fuelOnBoard} />
            <Sr22tWBDisplayField data={this.rampWeight} isWarning={this.isRampWeightInvalid} />
            <Sr22tWBEditableField data={this.taxiFuel} ref={this.taxiInputRef} maxValue={552} />
          </div>
          <div class="wb-page-section-column-2" >
            <Sr22tWBDisplayField data={this.takeoffWeight} isWarning={this.isTakeoffWeightInvalid} />
            <Sr22tWBDisplayField data={this.currentWeight} isWarning={this.isCurrentWeightInvalid} />
            <Sr22tWBDisplayField
              data={this.station}
              unitLabel={this.station.get().weightUnit.get() === UnitsWeightSettingMode.Pounds ? 'IN' : 'M'}
              isWarning={this.isCgInvalid}
            />
            <Sr22tWBDisplayField
              data={this.macPercent}
              valueCallback={(value: number) => value.toFixed(1)}
              unitLabel='%'
              isWarning={this.isCgInvalid}
            />
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public pause(): void {
    this.subscriptions.forEach(sub => sub.pause());
  }

  /** @inheritdoc */
  public resume(): void {
    this.subscriptions.forEach(sub => sub.resume());
  }

  /** @inheritdoc */
  public destroy(): void {
    this.subscriptions.map((sub) => sub.destroy());
  }
}
