import {
  ComRadioIndex, ComSpacing, Consumer, ConsumerSubject, DisplayComponent, EventBus, FSComponent, MappedSubject, NavComSimVars,
  SimVarValueType, Subscribable, VNode,
} from '@microsoft/msfs-sdk';

import './ComInfoBox.css';

/** Properties for the ComInfoBox component. */
export interface ComInfoBoxProps {
  /** The display's event bus. */
  bus: EventBus

  /** Whether TCAS is supported. */
  tcasIsSupported: boolean;
}

/** Properties for the component labelling the com source. */
interface ComSourceBoxProps {
  /** The index of the active com radio. */
  activeComRadio: Subscribable<ComRadioIndex>
}

/** Properties for the component displaying the active com frequency. */
interface ComFreqBoxProps {
  /** The frequency of the active com radio. */
  activeFrequency: Subscribable<number>
  /** The frequency spacing of the active radio. */
  activeComSpacing: Subscribable<ComSpacing>,
}

/** Properties for the component displaying active facility information. */
interface ComDescBoxProps {
  /** The name or ident of the active facility. */
  activeFacilityName: Subscribable<string>
  /** A text description of the type of facility. */
  activeFacilityDesc: Subscribable<string>
}

/** A component that displays the active com radio source. */
class ComSourceBox extends DisplayComponent<ComSourceBoxProps> {
  /** @inheritdoc */
  public render(): VNode {
    return <span class="com-active">COM{this.props.activeComRadio}</span>;
  }
}

/** A component that displays the frequency of the active com radio. */
class ComFreqBox extends DisplayComponent<ComFreqBoxProps> {
  private freqText = MappedSubject.create(
    ([freq, spacing]): string => {
      const freqKhz = Math.round(freq * 1000);
      if (spacing === ComSpacing.Spacing25Khz) {
        return (Math.trunc(freqKhz / 10) / 100).toFixed(2);
      } else {
        return (freqKhz / 1000).toFixed(3);
      }
    },
    this.props.activeFrequency,
    this.props.activeComSpacing
  );

  /** @inheritdoc */
  public render(): VNode {
    return <span class="com-freq">{this.freqText}</span>;
  }
}

/** A component that displays a textual description of the active facility. */
class ComDescBox extends DisplayComponent<ComDescBoxProps> {
  // Map the symbolic strings we get from the game for facility type to the labels
  // used by the G3000.
  private static facilityTypeMap = new Map<string, string>([
    ['ATIS', 'ATIS'],
    ['UNI', 'UNICOM'],
    ['CTAF', 'CTAF'],
    ['GND', 'GROUND'],
    ['TWR', 'TOWER'],
    ['CLR', 'CLEARANCE'],
    ['APPR', 'APPROACH'],
    ['DEP', 'DEPARTURE'],
    ['FSS', 'FSS'],
    ['AWS', 'AWOS']
  ]);

  private descText = MappedSubject.create(
    ([facName, facType]): string => {
      // COM indicates we have tuned a frequency that's not used in the area.
      if (facName == 'COM') {
        return '';
      }

      // Looks like in the trainer, approach facilities are listed without a facility name.
      return `${facType == 'APPR' ? '' : facName + ' '}${ComDescBox.facilityTypeMap.get(facType) || ''}`;
    },
    this.props.activeFacilityName,
    this.props.activeFacilityDesc
  );

  /** @inheritdoc */
  public render(): VNode {
    return <div class="com-desc com-info-left-padding">{this.descText}</div>;
  }
}

/**
 * The ComInfoBox component displays the active com radio, its current frequency,
 * and a textual description of the kind of facility that is tuned, if any.
 */
export class ComInfoBox extends DisplayComponent<ComInfoBoxProps> {
  private readonly isCom1Active = ConsumerSubject.create(null, false);
  private readonly isCom2Active = ConsumerSubject.create(null, false);

  private readonly activeComRadio = MappedSubject.create(
    ([isCom1Active, isCom2Active]): ComRadioIndex => {
      if (isCom1Active || !isCom2Active) {
        return 1;
      } else {
        return 2;
      }
    },
    this.isCom1Active,
    this.isCom2Active
  );

  private readonly facilityFreq = ConsumerSubject.create(null, 0);
  private readonly facilityIdent = ConsumerSubject.create(null, '');
  private readonly facilityType = ConsumerSubject.create(null, '');
  private readonly comSpacing = ConsumerSubject.create(null, ComSpacing.Spacing25Khz);

  /**
   * Returns the value to populate the FLT ID field with.  Tries call sign + flight
   * number, and if neither of those exist falls back to the registration.
   * @returns The Flight ID.
   */
  private flightId(): string {
    // World Map >> Customization >> ATC Options
    // "Call Sign"
    const callSign = SimVar.GetSimVarValue('ATC AIRLINE', SimVarValueType.String);
    // "Flight Number"
    const flightNumber = SimVar.GetSimVarValue('ATC FLIGHT NUMBER', SimVarValueType.String);
    // "Tail Number"
    const tailNumber = SimVar.GetSimVarValue('ATC ID', SimVarValueType.String);

    return (callSign && flightNumber) ? (callSign + flightNumber) : tailNumber;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    const sub = this.props.bus.getSubscriber<NavComSimVars>();
    this.isCom1Active.setConsumer(sub.on('com_transmit_1') as unknown as Consumer<boolean>);
    this.isCom2Active.setConsumer(sub.on('com_transmit_2') as unknown as Consumer<boolean>);
    this.activeComRadio.sub(index => {
      this.facilityIdent.setConsumer(sub.on(`com_active_facility_ident_${index}`) as unknown as Consumer<string>);
      this.facilityType.setConsumer(sub.on(`com_active_facility_type_${index}`) as unknown as Consumer<string>);
      this.facilityFreq.setConsumer(sub.on(`com_active_frequency_${index}`) as unknown as Consumer<number>);
      this.comSpacing.setConsumer(sub.on(`com_spacing_mode_${index}`) as unknown as Consumer<ComSpacing>);
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return <div class="com-info-box">
      <div class="com-info-content">
        <div class="com-info-top-line com-info-left-padding">
          <ComSourceBox activeComRadio={this.activeComRadio} />
          <ComFreqBox activeFrequency={this.facilityFreq} activeComSpacing={this.comSpacing} />
        </div>
        <ComDescBox activeFacilityName={this.facilityIdent} activeFacilityDesc={this.facilityType} />
        {this.props.tcasIsSupported &&
          <div class='com-flight-id com-info-left-padding'>
            <span class='flight-id-label'>FLT<span>&nbsp;</span>ID</span>
            <span class='flight-id-value'>{this.flightId()}</span>
          </div>
        }
      </div>
    </div>;
  }
}