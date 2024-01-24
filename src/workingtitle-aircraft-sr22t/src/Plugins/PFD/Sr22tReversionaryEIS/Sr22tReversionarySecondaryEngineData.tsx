import {
  ComponentProps, ComputedSubject, ConsumerSubject, DisplayComponent, ElectricalEvents, EngineEvents, EventBus, Formatter, FSComponent, GNSSEvents,
  MappedSubject, SimVarValueType, Subject, Subscribable, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { FuelTotalizerSimVars } from '@microsoft/msfs-wtg1000';

import { Sr22tElectricalSystemEvents } from '../../MFD/Sr22tEcu/Sr22tElectricalSystem';
import { EnginePowerDisplay } from '../../MFD/Sr22tEIS/EnginePowerDisplay/EnginePowerDisplay';
import { Sr22tSimvarEvents } from '../../MFD/Sr22tSimvarPublisher/Sr22tSimvarPublisher';

import './Sr22tReversionarySecondaryEngineData.css';

/** SR22T's parser and formatter for electrical values of the EIS's secondary engine data page. */
class ElectricalValueFormatter implements Formatter<number> {
  nullValueString?: string | undefined;

  /**
   * The constructor.
   * @param precision The decimal precision of the value, default to 1.
   * @param nullValueString The string to display when value is null.
   */
  constructor(private readonly precision = 1, nullValueString = '') {
    this.nullValueString = nullValueString;
  }

  /** @inheritdoc */
  public format(value: number, unit?: SimVarValueType): string {
    let prefix = '';
    let unitString = '';

    if (unit === SimVarValueType.Amps) {
      unitString = 'A';
      if (value > 0) {
        prefix = '-';
      } else if (value < 0) {
        prefix = '+';
      }
    } else if (unit === SimVarValueType.Volts) {
      unitString = 'V';
    }

    return `${prefix}${Math.abs(value).toFixed(this.precision)}${unitString === '' ? '' : ' '}${unitString}`;
  }
}

/** The properties for the {@link SecondaryEngineDataRow} component. */
interface SecondaryEngineDataRowProps extends ComponentProps {
  /** the DOM id of this <div> element. */
  readonly id: string;
  /** The label of the data row. */
  readonly label: string;
  /** The subscribable value of the data row. */
  readonly value: Subscribable<string>;
  /** The prefix to the value (if any, in smaller font size). */
  readonly prefix?: string;
  /** Whether the data row is in alert state (blinking red background). */
  readonly alert?: Subscribable<boolean>;
  /** Whether the data row is in caution state (static black text on yellow background). */
  readonly caution?: Subscribable<boolean>;
}

/** A single text data row with label and value of the SR22T Reversionary EIS's secondary engine data panel. */
class SecondaryEngineDataRow extends DisplayComponent<SecondaryEngineDataRowProps> {

  private readonly labelRef = FSComponent.createRef<HTMLDivElement>();
  private readonly valueRef = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div id={this.props.id} class="secondary-engine-data-row">
        <div
          class={{
            'data-row-label': true,
            'warning': this.props.alert ?? false,
            'caution': this.props.caution ?? false
          }}
          ref={this.labelRef}
        >
          {this.props.label}
        </div>
        <div
          class={{
            'data-row-value': true,
            'warning': this.props.alert ?? false,
            'caution': this.props.caution ?? false
          }}
          ref={this.valueRef}
        >
          {this.props.prefix && <span class='data-row-value-prefix' style={{ 'font-size': '16px' }}>{this.props.prefix}</span>}
          {this.props.value}
        </div>
      </div>
    );
  }
}

/** The properties for the {@link SecondaryEngineDataGroupTitle} component. */
interface SecondaryEngineDataGroupTitleProps extends ComponentProps {
  /** The label of the data group. */
  readonly title: string;
}

/** A single title row of the SR22T Reversionary EIS's secondary engine data panel. */
class SecondaryEngineDataGroupTitle extends DisplayComponent<SecondaryEngineDataGroupTitleProps> {
  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="secondary-engine-data-title-row">
        <span class='title-text-wrapper'>
          {this.props.title}
        </span>
      </div>
    );
  }
}

/** The properties for the {@link Sr22tReversionarySecondaryEngineData} component. */
interface Sr22tReversionarySecondaryEngineDataProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
}

/** The Sr22tReversionarySecondaryEngineData component. */
export class Sr22tReversionarySecondaryEngineData extends DisplayComponent<Sr22tReversionarySecondaryEngineDataProps> {

  private static readonly ESS_BUS_V_MIN_WARNING = 24.4; // Volts
  private static readonly ESS_BUS_V_MAX_WARNING = 32; // Volts
  private static readonly BATT_1_A_CAUTION_MIN = 5; // Amps

  private readonly sub = this.props.bus.getSubscriber<EngineEvents & GNSSEvents & FuelTotalizerSimVars & ElectricalEvents & Sr22tElectricalSystemEvents>();

  private readonly leftFuelSubject = Subject.create<number>(0);   // Gallons
  private readonly rightFuelSubject = Subject.create<number>(0);  // Gallons
  private readonly galRem = MappedSubject.create<[number, number], number>(
    ([leftFuel, rightFuel]): number => leftFuel + rightFuel,
    this.leftFuelSubject, this.rightFuelSubject
  );
  private readonly galRemAlert = this.galRem.map((v) => v === 0);

  private readonly galUsed = Subject.create<number>(0);

  private readonly fuelFlow = Subject.create<number>(0);

  private readonly gs = Subject.create<number>(0);
  private readonly econ = MappedSubject.create(
    ([groundSpeed, fuelFLow]): number => groundSpeed / fuelFLow,
    this.gs,
    this.fuelFlow
  );

  private readonly timeRem = MappedSubject.create(
    ([galRem, fuelFlow]): string => {
      const hours = galRem / fuelFlow;
      const minutes = (hours * 60) % 60;
      return `${Math.floor(hours).toString()}+${Math.floor(minutes).toString().padStart(2, '0')}`;
    },
    this.galRem,
    this.fuelFlow
  );

  private readonly ampereValueFormatter = new ElectricalValueFormatter(0);
  private readonly voltageValueFormatter = new ElectricalValueFormatter(1);

  private readonly battery1Subject = Subject.create<number>(0);
  private readonly battery1 = this.battery1Subject.map((v) => this.ampereValueFormatter.format(v, SimVarValueType.Amps));
  private readonly baterry1Caution = this.battery1Subject.map((v) => v >= Sr22tReversionarySecondaryEngineData.BATT_1_A_CAUTION_MIN);

  private readonly alt1 = ComputedSubject.create<number, string>(0, (v) => this.ampereValueFormatter.format(v, SimVarValueType.Amps));

  private readonly alt2 = ComputedSubject.create<number, string>(0, (v) => this.ampereValueFormatter.format(v, SimVarValueType.Amps));

  private readonly essBusSubject = Subject.create<number>(0);
  private readonly essBus = this.essBusSubject.map((v) => this.voltageValueFormatter.format(v, SimVarValueType.Volts));
  private readonly essBusAlert = this.essBusSubject.map((v) =>
    v <= Sr22tReversionarySecondaryEngineData.ESS_BUS_V_MIN_WARNING || v > Sr22tReversionarySecondaryEngineData.ESS_BUS_V_MAX_WARNING
  );

  private readonly engineHours = ConsumerSubject.create(this.sub.on('eng_hours_1'), 0);

  private readonly leftFluidSubject = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tSimvarEvents>().on('anti_ice_fluid_qty_left').withPrecision(1), 0);  // gallons
  private readonly rightFluidSubject = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tSimvarEvents>().on('anti_ice_fluid_qty_right').withPrecision(1), 0); // gallons
  private readonly antiIceGal = MappedSubject.create<[number, number], number>(
    ([left, right]) => left + right,
    this.leftFluidSubject,
    this.rightFluidSubject
  );

  private subs: Subscription[] = [];

  /** @inheritdoc */
  public onAfterRender(): void {
    this.subs = [
      this.sub.on('fuel_left').withPrecision(1).handle((v) => this.leftFuelSubject.set(v)),
      this.sub.on('fuel_right').withPrecision(1).handle((v) => this.rightFuelSubject.set(v)),
      this.sub.on('burnedFuel').withPrecision(1).handle((v) => this.galUsed.set(v)),
      this.sub.on('fuel_flow_total').withPrecision(1).handle((v) => this.fuelFlow.set(v)),
      this.sub.on('ground_speed').withPrecision(0).handle((v) => this.gs.set(v)),
      this.sub.on('elec_bat_a_1').handle((v) => this.battery1Subject.set(v)),
      this.sub.on('elec_bus_genalt_1_a').handle((v) => this.alt1.set(v)),
      this.sub.on('elec_bus_genalt_2_a').handle((v) => this.alt2.set(v)),
      this.sub.on('sr22_ess_bus_volts').handle((v) => this.essBusSubject.set(v)),
    ];
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <EnginePowerDisplay bus={this.props.bus} />

        <SecondaryEngineDataGroupTitle title='Fuel Calc' />
        <SecondaryEngineDataRow id="2nd-eis-gal-dest" label="GAL Dest" value={Subject.create<string>('___')} />
        <SecondaryEngineDataRow id="2nd-eis-fuel-flow-gph" label="FFlow GPH" value={this.fuelFlow.map((v) => v.toFixed(1))} />
        <SecondaryEngineDataRow id="2nd-eis-gal-used" label="GAL Used" value={this.galUsed.map((v) => v.toFixed(1))} />
        <SecondaryEngineDataRow id="2nd-eis-gal-rem" label="GAL Rem" value={this.galRem.map((v) => v.toFixed(1))} alert={this.galRemAlert} />

        <SecondaryEngineDataRow id="2nd-eis-time-rem" label="Time Rem" value={this.timeRem} />
        <SecondaryEngineDataRow id="2nd-eis-econ-nmpg" label="Econ NMPG" value={this.econ.map((v) => v.toFixed(1))} />

        <SecondaryEngineDataGroupTitle title='Electrical' />
        <SecondaryEngineDataRow id="2nd-eis-batt-1" label="Batt1" value={this.battery1} caution={this.baterry1Caution} />

        <div class="secondary-engine-data-straight-line" />
        <SecondaryEngineDataRow id="2nd-eis-alt-1" label="Alt1" value={this.alt1} />
        <SecondaryEngineDataRow id="2nd-eis-alt-2" label="Alt2" value={this.alt2} />

        <div class="secondary-engine-data-straight-line" />
        <SecondaryEngineDataRow id="2nd-eis-ess-bus" label="Ess Bus" value={this.essBus} alert={this.essBusAlert} />
        <SecondaryEngineDataRow id="2nd-eis-m-bus-1" label="M. Bus 1" value={Subject.create<string>('__._ V')} />
        <SecondaryEngineDataRow id="2nd-eis-m-bus-2" label="M. Bus 2" value={Subject.create<string>('__._ V')} />

        <SecondaryEngineDataGroupTitle title='Misc' />
        <SecondaryEngineDataRow id="2nd-eis-eng-hrs" label="Eng Hrs" value={this.engineHours.map((v) => v.toFixed(1))} />
        <SecondaryEngineDataRow id="2nd-eis-anti-ice" label="Anti-Ice" value={this.antiIceGal.map((v) => v.toFixed(1))} prefix='GAL' />
        <SecondaryEngineDataRow id="2nd-eis-oxy-psi" label="Oxy PSI" value={Subject.create<string>('1750')} />
      </>
    );
  }

  /** @inheritdoc*/
  public destroy(): void {
    this.subs.map((sub) => sub.destroy());
  }
}
