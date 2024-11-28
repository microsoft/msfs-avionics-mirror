import { DurationFormatter, EventBus, FSComponent, NumberFormatter, UnitType, VNode } from '@microsoft/msfs-sdk';

import { Epic2Fms, FlightPlanStore, NumberUnitDisplay, TabContent, TabContentProps, TimeDisplay, TimeDisplayFormat } from '@microsoft/msfs-epic2-shared';

import { IconLineArrow } from '../Icons/IconLineArrow';
import { IconPlaneAirportLanding } from '../Icons/IconPlaneAirportLanding';
import { IconPlaneAirportTakeOff } from '../Icons/IconPlaneAirportTakeOff';
import { IconPlanePath } from '../Icons/IconPlanePath';

import './FltSumTab.css';

/** The properties for the {@link FltSumTab} component. */
interface FltSumTabProps extends TabContentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
  /** The FMS. */
  readonly fms: Epic2Fms;
  /** The flight plan store.  */
  readonly activeFlightPlanStore: FlightPlanStore;
}

/** The FltSumTab component. */
export class FltSumTab extends TabContent<FltSumTabProps> {

  private readonly avgTAS = this.props.fms.flightLogger.avgTrueAirspeed.map(v => UnitType.KNOT.createNumber(v > 0 ? v : NaN));
  private readonly airDistance = this.props.fms.flightLogger.airDistance.map(v => UnitType.NMILE.createNumber(v > 0 ? v : NaN));
  private readonly avgGS = this.props.fms.flightLogger.avgGroundSpeed.map(v => UnitType.KNOT.createNumber(v > 0 ? v : NaN));
  private readonly gndDistance = this.props.fms.flightLogger.groundDistance.map(v => UnitType.NMILE.createNumber(v > 0 ? v : NaN));
  private readonly origin = this.props.activeFlightPlanStore.originIdent.map(v => v ?? '____');
  private readonly destination = this.props.activeFlightPlanStore.destinationIdent.map(v => v ?? '____');
  private readonly takeoffTime = this.props.fms.flightLogger.takeoffTime.map(v => v > 0 ? v : NaN);
  private readonly landingTime = this.props.fms.flightLogger.landingTime.map(v => v > 0 ? v : NaN);
  private readonly timeSuffixFormat = (): string => 'z';
  private readonly durationFormatter = DurationFormatter.create('{hh}+{mm}', UnitType.MILLISECOND, 0, '__+__');
  private readonly flightTime = this.props.fms.flightLogger.enrouteTime.map(ms => this.durationFormatter(ms > 0 ? ms : NaN));

  /** @inheritdoc */
  public onAfterRender(): void {
    // empty
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="fpln-config-sum-tab">
        <IconPlanePath class="fpln-config-sum-tab-icon-plane-path" />
        <IconPlaneAirportTakeOff class="fpln-config-sum-tab-icon-plane-takeoff" />
        <IconPlaneAirportLanding class="fpln-config-sum-tab-icon-plane-landing" />
        <div class={'fpln-config-sum-units fpln-config-sum-units-top'}>
          <div>Avg TAS:</div>
          <div><NumberUnitDisplay
            value={this.avgTAS} displayUnit={null}
            unitFormatter={(out: [string, string]) => { out[0] = 'K'; out[1] = 't'; }}
            formatter={NumberFormatter.create({ precision: 1, forceDecimalZeroes: false, maxDigits: 5, nanString: '' })}
            class={'number-unit-display'}
          /></div>
          <div>Air Dist:</div>
          <div><NumberUnitDisplay
            value={this.airDistance} displayUnit={null}
            unitFormatter={(out: [string, string]) => { out[0] = 'N'; out[1] = 'M'; }}
            formatter={NumberFormatter.create({ precision: 1, forceDecimalZeroes: false, maxDigits: 5, nanString: '' })}
            class={'number-unit-display'}
          /></div>
        </div>
        <div class={'fpln-config-sum-units'}>
          <div>Avg GS:</div>
          <div><NumberUnitDisplay
            value={this.avgGS} displayUnit={null}
            unitFormatter={(out: [string, string]) => { out[0] = 'K'; out[1] = 't'; }}
            formatter={NumberFormatter.create({ precision: 1, forceDecimalZeroes: false, maxDigits: 5, nanString: '' })}
            class={'number-unit-display'}
          /></div>
          <div>Gnd Dist:</div>
          <div><NumberUnitDisplay
            value={this.gndDistance} displayUnit={null}
            unitFormatter={(out: [string, string]) => { out[0] = 'N'; out[1] = 'M'; }}
            formatter={NumberFormatter.create({ precision: 1, forceDecimalZeroes: false, maxDigits: 5, nanString: '' })}
            class={'number-unit-display'}
          /></div>
        </div>
        <IconLineArrow class="fpln-config-sum-tab-icon-line" />
        <div class={'fpln-config-takeoff-landing-icao'}>
          <div><span>{this.origin}</span></div>
          <div><span>{this.destination}</span></div>
        </div>
        <div class={'fpln-config-takeoff-landing-time'}>
          <div>T/O Time: <TimeDisplay
            class="time-display"
            time={this.takeoffTime}
            localOffset={0}
            format={TimeDisplayFormat.Local24}
            suffixFormatter={this.timeSuffixFormat}
          /></div>
          <div>Ldg Time: <TimeDisplay
            class="time-display"
            time={this.landingTime}
            localOffset={0}
            format={TimeDisplayFormat.Local24}
            suffixFormatter={this.timeSuffixFormat}
          /></div>
        </div>
        <div class={'fpln-config-flight-time'}>Flight Time:<span>{this.flightTime}</span></div>
      </div>
    );
  }
}
