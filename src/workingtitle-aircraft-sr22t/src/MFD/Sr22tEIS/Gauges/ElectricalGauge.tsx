import {
  ComponentProps, ComputedSubject, ConsumerSubject, DisplayComponent, ElectricalEvents, EventBus, FSComponent, NumberFormatter, Subject, VNode
} from '@microsoft/msfs-sdk';

import { Sr22tElectricalSystemEvents } from '../../Sr22tEcu/Sr22tElectricalSystem';

import './ElectricalGauge.css';

/** Component properties for {@link ElectricalGauge}. */
export interface ElectricalGaugeProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;
}

/**
 * The EIS Electrical Gauge component.
 */
export class ElectricalGauge extends DisplayComponent<ElectricalGaugeProps> {
  private static readonly ESS_BUS_V_MIN_WARNING = 24.4; // Volts
  private static readonly ESS_BUS_V_MAX_WARNING = 32; // Volts
  private static readonly BATT_1_A_CAUTION_MIN = -5; // Amps

  private readonly sub = this.props.bus.getSubscriber<ElectricalEvents & Sr22tElectricalSystemEvents>();

  private readonly batt1Amps = ConsumerSubject.create(this.sub.on('sr22_batt_1_amps'), 0);
  private readonly essBusVolts = ConsumerSubject.create(this.sub.on('sr22_ess_bus_volts'), 0);

  private readonly batt1ADisplay = this.batt1Amps.map(NumberFormatter.create({ precision: 1 }));
  private readonly essBusVDisplay = ComputedSubject.create<number, string>(0, v => v.toFixed(1));

  private readonly essBusWarning = Subject.create(false);
  private readonly batt1AmpsCaution = Subject.create(false);

  /** @inheritDoc */
  public onAfterRender(): void {
    this.batt1Amps.sub(v => {
      this.batt1AmpsCaution.set(v <= ElectricalGauge.BATT_1_A_CAUTION_MIN);
    }, true);
    this.essBusVolts.sub(v => {
      this.essBusVDisplay.set(v);
      this.essBusWarning.set(v <= ElectricalGauge.ESS_BUS_V_MIN_WARNING || v > ElectricalGauge.ESS_BUS_V_MAX_WARNING);
    }, true);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="eis-gauge electrical-gauge" data-checklist="checklist-electrical-gauge">
        <div class="elec-row">
          <div class={{
            'elec-label': true,
            'caution': this.batt1AmpsCaution,
          }}><span class="warning-wrapper">Batt1 A</span></div>
          <div class={{
            'elec-value': true,
            'caution': this.batt1AmpsCaution,
          }}><span class="warning-wrapper">{this.batt1ADisplay}</span></div>
        </div>
        <div class="elec-row">
          <div class={{
            'elec-label': true,
            'warning': this.essBusWarning,
          }}><span class="warning-wrapper">Ess Bus V</span></div>
          <div class={{
            'elec-value': true,
            'warning': this.essBusWarning,
          }}><span class="warning-wrapper">{this.essBusVDisplay}</span></div>
        </div>
      </div>
    );
  }
}
