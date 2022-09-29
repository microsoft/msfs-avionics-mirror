import {
  AdcEvents, ComponentProps, ComputedSubject, ConsumerSubject, DisplayComponent, EventBus, FSComponent, MinimumsEvents, MinimumsMode, VNode
} from 'msfssdk';

import './RadioAltimeter.css';

/**
 * The properties on the Radio Altimeter component.
 */
interface RadioAltimeterProps extends ComponentProps {

  /** An instance of the event bus. */
  bus: EventBus;

  /** Whether this instance of the G1000 has a Radio Altimeter. */
  hasRadioAltimeter: boolean;
}

/**
 * The Radio Altimeter Component.
 */
export class RadioAltimeter extends DisplayComponent<RadioAltimeterProps> {

  private containerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly radioAltRef = FSComponent.createRef<HTMLSpanElement>();
  private readonly radioAltitude = ConsumerSubject.create<number>(this.props.bus.getSubscriber<AdcEvents>().on('radio_alt').whenChangedBy(1), 0);

  private readonly radioAltitudeDisplay = ComputedSubject.create(0, (alt): number => {
    const rounded = Math.round(alt);
    if (rounded > 1500) {
      return Math.round(rounded / 50) * 50;
    } else if (alt > 200) {
      return Math.round(rounded / 10) * 10;
    } else {
      return Math.round(rounded / 5) * 5;
    }
  });

  private readonly minimumsMode = ConsumerSubject.create<MinimumsMode>(this.props.bus.getSubscriber<MinimumsEvents>().on('minimums_mode'), MinimumsMode.OFF);
  private readonly decisionHeightFeet = ConsumerSubject.create<number>(this.props.bus.getSubscriber<MinimumsEvents>().on('decision_height_feet'), 0);

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    if (this.props.hasRadioAltimeter) {
      this.radioAltitude.sub(this.onRadioAltitude, true);
    } else {
      this.radioAltitude.pause();
      this.minimumsMode.pause();
      this.decisionHeightFeet.pause();
      this.containerRef.instance.classList.add('hidden-element');
    }
  }

  private onRadioAltitude = (alt: number): void => {
    this.radioAltitudeDisplay.set(alt);
    const displayAlt = this.radioAltitudeDisplay.get();

    if (this.minimumsMode.get() === MinimumsMode.RA && displayAlt <= this.decisionHeightFeet.get()) {
      this.radioAltRef.instance.classList.add('yellow');
      this.radioAltRef.instance.classList.remove('white');
    } else {
      this.radioAltRef.instance.classList.add('white');
      this.radioAltRef.instance.classList.remove('yellow');
    }
    if (displayAlt <= 2500) {
      this.containerRef.instance.classList.remove('hidden-element');
    } else {
      this.containerRef.instance.classList.add('hidden-element');
    }
  };

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (

      <div class="radio-altimeter" ref={this.containerRef}>
        <span>RA</span>
        <span ref={this.radioAltRef} class="radio-altimeter-altitude">{this.radioAltitudeDisplay}</span>
      </div>

    );
  }
}
