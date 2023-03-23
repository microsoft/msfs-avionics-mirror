import { APEvents, ComponentProps, DefaultUserSettingManager, DisplayComponent, EventBus, FSComponent, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';

import { WT21ControlEvents } from '../../../Shared/WT21ControlEvents';
import { PFDSettings, PFDUserSettings } from '../../PFDUserSettings';
import { AltAlertState } from './AltitudeAlertController';

import './AltPreselectBox.css';

/**
 * The properties for the AltPreselectBox component.
 */
interface AltPreselectBoxProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The AltPreselectBox component.
 */
export class AltPreselectBox extends DisplayComponent<AltPreselectBoxProps> {
  private selectedBoxRef = FSComponent.createRef<HTMLDivElement>();
  private altAlerterRef = FSComponent.createRef<HTMLDivElement>();
  private selectedAltitudeTensSubject = Subject.create('-----');
  private selectedAltitudeTensRef = FSComponent.createRef<HTMLSpanElement>();
  private selectedAltitudeHundredsSubject = Subject.create('');
  private selectedAltitudeHundredsRef = FSComponent.createRef<HTMLSpanElement>();
  private pfdSettingsManager!: DefaultUserSettingManager<PFDSettings>;
  private currentAlt = 0;
  private readonly ctrlSub = this.props.bus.getSubscriber<WT21ControlEvents>();
  private apSelectedSub?: Subscription;

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    this.pfdSettingsManager = PFDUserSettings.getManager(this.props.bus);

    const ap = this.props.bus.getSubscriber<APEvents>();

    this.apSelectedSub = ap.on('ap_altitude_selected')
      .withPrecision(0)
      .handle(this.updateSelectedAltitude.bind(this));

    this.pfdSettingsManager.whenSettingChanged('altMetric').handle(v => {
      this.selectedBoxRef.instance?.classList.toggle('metric', v);
      if (this.selectedAltitudeTensSubject.get() != '-----') {
        this.updateSelectedAltitude(this.currentAlt);
      }
    });

    this.ctrlSub.on('altitude_alert').whenChanged().handle(this.onAlerterStateChanged.bind(this));
  }

  /**
   * A method called when a selected altitude value changes from the event bus.
   * @param alt The selected altitude value.
   */
  private updateSelectedAltitude = (alt: number): void => {
    if (alt !== this.currentAlt) {
      this.currentAlt = alt;
      if (!this.pfdSettingsManager.getSetting('altMetric').value) {
        this.selectedAltitudeHundredsSubject.set(`${alt / 100}`);
        this.selectedAltitudeTensSubject.set('00');
      } else {
        this.selectedAltitudeHundredsSubject.set('');
        this.selectedAltitudeTensSubject.set(`${Math.round(alt * 0.3048)}`);
      }
    }
  };

  /**
   * A method called when the alt alerter state is changed.
   * @param state is the altitude alerter state
   */
  private onAlerterStateChanged(state: AltAlertState): void {
    switch (state) {
      case AltAlertState.DISABLED:
      case AltAlertState.ARMED:
      case AltAlertState.WITHIN_200:
        this.altAlerterRef.instance.classList.remove('thousand-flash', 'deviation-flash');
        break;
      case AltAlertState.WITHIN_1000:
        this.altAlerterRef.instance.classList.add('thousand-flash');
        this.altAlerterRef.instance.classList.remove('deviation-flash');
        break;
      case AltAlertState.CAPTURED:
        break;
      case AltAlertState.DEVIATION_200:
      case AltAlertState.DEVIATION_1000:
        this.altAlerterRef.instance.classList.add('deviation-flash');
        break;
    }
  }



  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class="translucent-box alt-select-box" ref={this.selectedBoxRef}>
        <div class="preselect-value" ref={this.altAlerterRef}>
          <span ref={this.selectedAltitudeHundredsRef}>{this.selectedAltitudeHundredsSubject}</span>
          <span ref={this.selectedAltitudeTensRef} class="preselect-tens">{this.selectedAltitudeTensSubject}<span class="preselect-unit">M</span></span>
        </div>
      </div>
    );
  }
}