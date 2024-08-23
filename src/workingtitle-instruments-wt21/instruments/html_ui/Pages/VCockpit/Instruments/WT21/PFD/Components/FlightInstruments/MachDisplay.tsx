import { AdcEvents, ComponentProps, ComputedSubject, DisplayComponent, EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import './MachDisplay.css';

/**
 * The properties for the Mach display component.
 */
interface MachDisplayProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The Mach Display component.
 */
export class MachDisplay extends DisplayComponent<MachDisplayProps> {
  private readonly machDisplayRef = FSComponent.createRef<HTMLDivElement>();
  private readonly machSpeedSubject = ComputedSubject.create(0, (mach) => mach.toFixed(3).substring(1));
  private readonly machActive = Subject.create(false);

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    const adc = this.props.bus.getSubscriber<AdcEvents>();

    this.machActive.sub((active) => {
      this.machDisplayRef.instance.classList.toggle('hidden', !active);
    });

    adc.on('mach_number')
      .withPrecision(3)
      .handle(this.updateMachNumber.bind(this));
  }

  /**
   * A method called for the mach number.
   * @param mach The mach number.
   */
  private updateMachNumber = (mach: number): void => {
    this.machActive.set(mach > .450 || this.machActive.get() && mach > 0.400);

    if (this.machActive.get()) {
      this.machSpeedSubject.set(mach);
    }
  };

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class="mach-display-container hidden" ref={this.machDisplayRef}>
        <span class="mach-gray">M</span>
        <span class="mach-value">{this.machSpeedSubject}</span>
      </div>
    );
  }
}