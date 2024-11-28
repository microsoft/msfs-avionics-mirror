import {
  AdcEvents, ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, MappedSubject, Subject, Subscribable, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { TripPlanningStore } from '../../../Stores';
import { DisplayFieldData, DisplayFieldFormat, Sr22tTPDisplayField } from '../Shared/Fields/Sr22tTPDisplayField';

import '../../Sr22tTripPlanningPage.css';

/** The properties for an Other Stats Panel component. */
interface OtherStatsPanelProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The Trip Planning store. */
  store: TripPlanningStore;
}

/** Other Stats Panel component for the Trip Planning page. */
export class OtherStatsPanel extends DisplayComponent<OtherStatsPanelProps> {

  private subs: Subscription[] = [];

  // Mode subjects
  private inputMode = this.props.store.inputMode;

  // Data output source from the store (sensor or user)
  private data = this.props.store.inputData;

  // Other data source subjects
  private oatSubject = ConsumerSubject.create(this.props.bus.getSubscriber<AdcEvents>().on('ambient_temp_c').withPrecision(0), 0);
  private isaSubject = ConsumerSubject.create(this.props.bus.getSubscriber<AdcEvents>().on('isa_temp_c').withPrecision(0), 0);


  // Calculated subjects

  private densityAltSubject = MappedSubject.create( // KTAS
    ([oat, isa, alt, baro]): number => {
      const pressureAlt = ((29.92 - baro) * 1000) + alt;  // approximation
      return pressureAlt + (120 * (oat - isa));
    },
    this.oatSubject,
    this.isaSubject,
    this.data.indicatedAltitude,
    this.data.barometricPressure,
    this.inputMode,
  );

  private densityAltString = Subject.create('');

  private trueAirspeedSubject = MappedSubject.create( // KTAS
    ([alt, ias]): number => {
      return ias * (1 + (alt * 0.00002)); // approximation
    },
    this.data.indicatedAltitude,
    this.data.calibratedAirspeed,
    this.inputMode,
  );


  // Data field properties

  private readonly densityAlt: DisplayFieldData = {
    title: 'Density Altitude',
    stringValue: this.densityAltString,
    unit: 'FT',
    decimals: 0,
    minDigits: 1,
    maxDigits: 6,
    format: DisplayFieldFormat.stringValue,
  };

  private readonly trueAirspeed: DisplayFieldData = {
    title: 'True Airspeed',
    value: this.trueAirspeedSubject as Subscribable<number>,
    unit: 'KT',
    decimals: 0,
    minDigits: 1,
    maxDigits: 3,
    format: DisplayFieldFormat.value,
  };

  /** @inheritdoc
   */
  public onAfterRender(): void {

    // Add subscriptions to subs array
    this.subs.push(
      this.oatSubject,
      this.isaSubject,
    );

    this.densityAltSubject.sub((v) => {
      const sign = v >= 0 ? '+' : '-';
      this.densityAltString.set(sign + v.toFixed(0));
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {

    return (
      <div class='sr22t-system-page-section sr22t-tp-page-other-stats'>
        <div class='sr22t-system-page-section-title'>Other Stats</div>
        <div class='sr22t-system-page-section-content'>
          <div class="tp-page-section-column-full" >
            <Sr22tTPDisplayField data={this.densityAlt} />
            <Sr22tTPDisplayField data={this.trueAirspeed} />
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public pause(): void {
    this.subs.forEach(sub => sub.pause());
  }

  /** @inheritdoc */
  public resume(): void {
    this.subs.forEach(sub => sub.resume(true));
  }

  /** @inheritdoc */
  public destroy(): void {
    this.subs.forEach(sub => sub.destroy());
  }
}