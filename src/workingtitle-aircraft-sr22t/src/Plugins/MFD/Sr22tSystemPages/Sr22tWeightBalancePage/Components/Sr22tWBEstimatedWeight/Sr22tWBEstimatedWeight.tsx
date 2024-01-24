import { ComponentProps, ConsumerSubject, DisplayComponent, EngineEvents, EventBus, FSComponent, GNSSEvents, LNavDataEvents, LNavEvents, MappedSubject, MutableSubscribable, ObjectSubject, Subject, Subscribable, Subscription, VNode } from '@microsoft/msfs-sdk';

import { ScrollableControl, UnitsUserSettings } from '@microsoft/msfs-wtg1000';

import { WeightBalanceStore } from '../../../Stores';
import { Sr22tWBDisplayField, Sr22tWBEditableField } from '../Shared';

import '../../Sr22tWeightBalancePage.css';
import '../Sr22tWBAircraftLoad/Sr22tWBAircraftLoad.css';

/** Component props for {@link Sr22tWBEstimatedWeight}. */
export interface Sr22tWBEstimatedWeightProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;
  /** The weight and balance store. */
  weightBalanceStore: WeightBalanceStore;
  /** The function to register scroll controls */
  registerScroll: (ctrl: ScrollableControl, unregister: boolean) => void;
}

/** A component which displays the SR22T's estimated weights. */
export class Sr22tWBEstimatedWeight extends DisplayComponent<Sr22tWBEstimatedWeightProps> {

  private subs: Subscription[] = [];

  private readonly sub = this.props.bus.getSubscriber<GNSSEvents & LNavEvents & LNavDataEvents & EngineEvents>();

  private readonly reservesInputRef = FSComponent.createRef<Sr22tWBEditableField>();

  private readonly weightUnit = UnitsUserSettings.getManager(this.props.bus).getSetting('unitsWeight');

  private readonly estimatedLandingWeight = Subject.create(-1);
  private readonly estimatedExcessFuelWeight = Subject.create(-1);

  private readonly lnavIsTracking = ConsumerSubject.create(this.sub.on('lnav_is_tracking'), false);
  private readonly remainingFlightDistance = ConsumerSubject.create(this.sub.on('lnavdata_destination_distance').onlyAfter(5000.0), 0);
  private readonly groundSpeed = ConsumerSubject.create(this.sub.on('ground_speed'), 0);

  private readonly currentFuelFlow = ConsumerSubject.create(this.sub.on('fuel_flow_total'), 0);
  private readonly poundsPerGallon = ConsumerSubject.create(this.sub.on('fuel_weight_per_gallon'), 0);

  private fuelReservesWeight = Subject.create(0);

  private readonly estimatedLandingWeightData = ObjectSubject.create({
    title: 'Est. Landing Weight',
    value: this.estimatedLandingWeight as Subscribable<number>,
    weightUnit: this.weightUnit
  });

  private readonly estimatedLandingFuelWeightData = ObjectSubject.create({
    title: 'Est. Landing Fuel',
    value: this.props.weightBalanceStore.estimatedFuelAtLanding as Subscribable<number>,
    weightUnit: this.weightUnit
  });

  private readonly estimatedExcessFuelWeightData = ObjectSubject.create({
    title: 'Excess Fuel',
    value: this.estimatedExcessFuelWeight as Subscribable<number>,
    weightUnit: this.weightUnit
  });

  private readonly fuelReservesWeightData = ObjectSubject.create({
    title: 'Fuel Reserves',
    storeValue: this.fuelReservesWeight as MutableSubscribable<number>,
    weightUnit: this.weightUnit,
    registerScroll: this.props.registerScroll,
  });

  /** @inheritdoc */
  public onAfterRender(): void {

    MappedSubject.create(
      ([lnavIsOn, remainingDistance, gs, reserves]) => {
        if (lnavIsOn && gs > 30) {
          const fuelConsumptionToDestination = this.poundsPerGallon.get() * this.currentFuelFlow.get() * remainingDistance / gs; // LB

          // Estimated landing fuel (in pounds):
          const estimatedLandingFuel = this.props.weightBalanceStore.fuelOnBoard.get() - fuelConsumptionToDestination;
          this.props.weightBalanceStore.estimatedFuelAtLanding.set(Math.round(estimatedLandingFuel));

          // Estimated landing weight:
          this.estimatedLandingWeight.set(Math.round(this.props.weightBalanceStore.currentWeight.get() - fuelConsumptionToDestination));

          // Excess fuel:
          this.estimatedExcessFuelWeight.set(Math.round(estimatedLandingFuel - reserves));
        }
      },
      this.lnavIsTracking,
      this.remainingFlightDistance,
      this.groundSpeed,
      this.fuelReservesWeight
    );

    // Add subscriptions to the subs array
    this.subs.push(
      this.lnavIsTracking,
      this.remainingFlightDistance,
      this.groundSpeed,
      this.currentFuelFlow,
      this.poundsPerGallon,
    );
  }

  /** Resets the temporary values to the values in the store. */
  public resetValues(): void {
    this.reservesInputRef.getOrDefault()?.reset();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='sr22t-system-page-section sr22t-wb-page-estimated-weight'>
        <div class='sr22t-system-page-section-title'>Estimated Weight</div>
        <div class='sr22t-system-page-section-content'>
          <div class="wb-page-section-column-1" >
            <Sr22tWBDisplayField data={this.estimatedLandingWeightData} />
            <Sr22tWBDisplayField data={this.estimatedLandingFuelWeightData} />
          </div>
          <div class="wb-page-section-column-2" >
            <Sr22tWBEditableField data={this.fuelReservesWeightData} ref={this.reservesInputRef} maxValue={552} />
            <Sr22tWBDisplayField data={this.estimatedExcessFuelWeightData} />
          </div>
        </div>
      </div >
    );
  }

  /** @inheritdoc */
  public pause(): void {
    this.subs.forEach(sub => sub.pause());
  }

  /** @inheritdoc */
  public resume(): void {
    this.subs.forEach(sub => sub.resume());
  }

  /** @inheritdoc */
  public destroy(): void {
    this.subs.forEach(sub => sub.destroy());
  }
}
