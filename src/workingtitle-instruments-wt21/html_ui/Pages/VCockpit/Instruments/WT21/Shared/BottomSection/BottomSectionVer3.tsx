import { AdcEvents, ComponentProps, ComputedSubject, DisplayComponent, EventBus, FSComponent, GNSSEvents, Subject, VNode } from '@microsoft/msfs-sdk';

/**
 * The properties for the BottomSectionVer3 component.
 */
interface BottomSectionVer3Props extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The BottomSectionVer3 component.  This has GS, TAS, RAT, SAT, ISA
 */
export class BottomSectionVer3 extends DisplayComponent<BottomSectionVer3Props> {
  private readonly gs = Subject.create<number>(0);
  private readonly tas = Subject.create<number>(0);
  private readonly rat = Subject.create<number>(0);
  private readonly sat = Subject.create<number>(0);
  private readonly isaDeviation = ComputedSubject.create<number, string>(0, (v) => {
    if (v > 0) {
      return ('+' + v.toFixed(0));
    } else { return v.toFixed(0); }
  });

  private isaTemp = Subject.create(0);

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    this.props.bus.getSubscriber<GNSSEvents>().on('ground_speed').withPrecision(0).handle((v) => this.gs.set(v));
    this.props.bus.getSubscriber<AdcEvents>().on('tas').withPrecision(0).handle((v) => this.tas.set(v));
    this.props.bus.getSubscriber<AdcEvents>().on('ram_air_temp_c').withPrecision(0).handle((v) => this.rat.set(v));
    this.props.bus.getSubscriber<AdcEvents>().on('ambient_temp_c').withPrecision(0).handle((v) => this.sat.set(v));
    this.props.bus.getSubscriber<AdcEvents>().on('isa_temp_c').withPrecision(0).handle((v) => this.isaTemp.set(v));

    this.sat.sub(this.updateIsaDeviation.bind(this));
    this.isaTemp.sub(this.updateIsaDeviation.bind(this));
  }

  /**
   * Updates the ISA deviation.
   */
  private updateIsaDeviation(): void {
    this.isaDeviation.set(this.sat.get() - this.isaTemp.get());
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class="bottom-section-container-ver3">
        <div class="bottom-section-data-container-ver3 bottom-section-size85">
          <div class="bottom-section-data-title">GS</div>
          <div class="bottom-section-data-value magenta digit-shift">{this.gs}</div>
        </div>
        <div class="bottom-section-data-container-ver3 bottom-section-size95">
          <div class="bottom-section-data-title">TAS</div>
          <div class="bottom-section-data-value digit-shift">{this.tas}</div>
        </div>
        <div class="bottom-section-data-container-ver3">
          <div class="bottom-section-data-title">RAT</div>
          <div class="bottom-section-data-value" style="min-width:73px">{this.rat}<span class="bottom-section-data-unit">°C</span></div>
        </div>
        <div class="bottom-section-data-container-ver3">
          <div class="bottom-section-data-title">SAT</div>
          <div class="bottom-section-data-value" style="min-width:73px">{this.sat}<span class="bottom-section-data-unit">°C</span></div>
        </div>
        <div class="bottom-section-data-container-ver3">
          <div class="bottom-section-data-title">ISA</div>
          <div class="bottom-section-data-value" style="min-width:73px">{this.isaDeviation}<span class="bottom-section-data-unit">°C</span></div>
        </div>
      </div>
    );
  }
}