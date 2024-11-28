import {
  ComponentProps, DisplayComponent, DurationDisplay, DurationDisplayDelim, DurationDisplayFormat, EventBus, FSComponent, NumberFormatter, VNode
} from '@microsoft/msfs-sdk';

import { AirportIcaoInputFormat, FlightPlanStore, InputField, NumberUnitDisplay } from '@microsoft/msfs-epic2-shared';

import './DestinationInfo.css';

/** The properties for the {@link DestinationInfo} component. */
export interface DestinationInfoProps extends ComponentProps {
  /** Active Flight Plant Store */
  readonly store: FlightPlanStore;
  /**
   * The event bus. Required for the input to respond appropriately to the mouse leaving the virtual cockpit instrument
   * screen while the user is dragging the control.
   */
  readonly bus: EventBus;
}

/**
 * The DestinationInfo component.
 */
export class DestinationInfo extends DisplayComponent<DestinationInfoProps> {
  /** Destination Leg Name */
  private readonly destinationIdent = this.props.store.destinationIdent.map((ident) => ident ?? '');

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="destination-info">
        <div class="destination-grid">
          <div>
            <InputField
              bus={this.props.bus}
              topLabel="Dest"
              bind={this.destinationIdent}
              maxLength={5}
              formatter={new AirportIcaoInputFormat('-----')}
            />
          </div>
          <div class="destination-info-metric">
            <p>DTG</p>
            <NumberUnitDisplay
              class="destination-unit"
              value={this.props.store.destinationDistanceToGo} displayUnit={null}
              formatter={NumberFormatter.create({ precision: 1, forceDecimalZeroes: false, maxDigits: 3, nanString: '---' })}
            />
          </div>
          <div class="destination-info-metric">
            <p>ETE</p>
            <DurationDisplay
              class="destination-unit"
              value={this.props.store.destinationEstimatedTimeEnroute}
              options={{
                delim: DurationDisplayDelim.ColonOrCross,
                format: DurationDisplayFormat.hh_mm,
                pad: 1,
                nanString: '----',
              }}
            />
          </div>
          <div class="destination-info-metric">
            <p>Fuel Rem</p>
            <NumberUnitDisplay
              class="destination-unit"
              value={this.props.store.destinationFuelRemaining} displayUnit={null}
              formatter={NumberFormatter.create({ precision: 2, forceDecimalZeroes: true, maxDigits: 2, nanString: '---' })}
            />
          </div>
        </div>
      </div>
    );
  }

}
