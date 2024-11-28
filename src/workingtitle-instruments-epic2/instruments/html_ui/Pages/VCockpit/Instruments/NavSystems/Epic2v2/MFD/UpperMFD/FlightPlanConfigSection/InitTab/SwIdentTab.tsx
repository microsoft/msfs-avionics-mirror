import { ComponentProps, EventBus, FSComponent, SimVarValueType, Subject, VNode } from '@microsoft/msfs-sdk';

import { CockpitUserSettings, Epic2Version, InputField, TabContent, TextInputFormat } from '@microsoft/msfs-epic2-shared';

import './SwIdentTab.css';

/** The properties for the {@link SwIdentTab} component. */
interface SwIdentTabProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
}

/** The SwIdentTab component. */
export class SwIdentTab extends TabContent<SwIdentTabProps> {
  private static readonly FLIGHT_NUMBER_MAX_LENGTH = 8;

  private readonly cockpitUserSettings = CockpitUserSettings.getManager(this.props.bus);

  private readonly flightNumber = Subject.create<string>('-'.repeat(SwIdentTab.FLIGHT_NUMBER_MAX_LENGTH));
  private readonly tailId = SimVar.GetSimVarValue('ATC ID', SimVarValueType.String);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.cockpitUserSettings.whenSettingChanged('fltNumber').handle(this.onFlightNumberChanged.bind(this));
  }

  /**
   * Update flightNumber subject when the fltNumber in the CockpitUserSettings changes
   * @param fltNumber the new flight number
   */
  private onFlightNumberChanged(fltNumber: string): void {
    this.flightNumber.set(fltNumber || '-'.repeat(SwIdentTab.FLIGHT_NUMBER_MAX_LENGTH));
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="fpln-sw-ident-tab">
        <div class="sw-title">Software Identifiers</div>
        <div class="fms-column">FMS:<span class="fms-text">{`WT${Epic2Version.VERSION}`}</span></div>
        <div class="tail-row">Tail #:<span class="tail-text">{this.tailId}</span></div>
        <div class="id-box">
          <InputField
            bus={this.props.bus}
            class="fpln-id-input"
            topLabel='Flt ID:'
            bind={this.flightNumber}
            formatter={new TextInputFormat('', SwIdentTab.FLIGHT_NUMBER_MAX_LENGTH)}
            maxLength={SwIdentTab.FLIGHT_NUMBER_MAX_LENGTH}
            textAlign='right'
          />
        </div>
      </div>
    );
  }
}
