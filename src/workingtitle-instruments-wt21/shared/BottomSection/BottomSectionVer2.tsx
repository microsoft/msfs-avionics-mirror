import {
  ComponentProps, ComputedSubject, DisplayComponent, EventBus, FacilityLoader, FacilityType, FlightPlanner, FlightPlannerEvents,
  FSComponent, PressurizationEvents, Subject, UnitType, VNode
} from '@microsoft/msfs-sdk';

/**
 * The properties for the BottomSectionVer2 component.
 */
interface BottomSectionVer2Props extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** A facility loader. */
  facLoader: FacilityLoader;

  /** An instance of the flight planner. */
  planner: FlightPlanner;
}

/**
 * The BottomSectionVer2 component.  This has CABIN ALT, CABIN RATE, CABIN DIFF, DEST ELEV
 */
export class BottomSectionVer2 extends DisplayComponent<BottomSectionVer2Props> {
  private readonly cabAltitude = Subject.create<number>(0);
  private readonly cabAltitudeRate = Subject.create<number>(0);
  private readonly pressureDiff = ComputedSubject.create<number, string>(0, (v) => Math.abs(v).toFixed(1));
  private readonly destElevSubject = Subject.create<number | string>('-----');
  private readonly destElevRef = FSComponent.createRef<HTMLDivElement>();

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    const press = this.props.bus.getSubscriber<PressurizationEvents>();

    press.on('cabin_altitude').withPrecision(0).handle((v) => this.cabAltitude.set(this.formatCabinAltitude(v)));
    press.on('cabin_altitude_rate').withPrecision(0).handle((v) => this.cabAltitudeRate.set(this.formatCabinAltitude(v)));
    press.on('pressure_diff').withPrecision(1).handle((v) => this.pressureDiff.set(v));

    const planEvents = this.props.bus.getSubscriber<FlightPlannerEvents>();
    planEvents.on('fplCopied').handle(async () => {
      const plan = this.props.planner.getActiveFlightPlan();
      if (plan.destinationAirport !== undefined) {
        const airport = await this.props.facLoader.getFacility(FacilityType.Airport, plan.destinationAirport);
        const elevation = airport.runways[0].elevation;
        this.destElevSubject.set(elevation !== undefined ? Math.round(UnitType.METER.convertTo(elevation, UnitType.FOOT)) : '-----');
        this.destElevRef.instance?.classList.toggle('invalid', elevation === undefined);
      } else {
        this.destElevSubject.set('-----');
        this.destElevRef.instance?.classList.add('invalid');
      }
    });
  }

  /**
   * Formats the cabin altitude values to hundreth's of feet.
   * @param v The value to format.
   * @returns The formatted value.
   **/
  private formatCabinAltitude(v: number): number {
    return (Math.round(v / 100) * 100);
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class="bottom-section-container bottom-section-container-ver2 press">

        <div class="bottom-section-data-container first">
          <div class="bottom-section-data-title">CAB</div>
        </div>

        <div class="bottom-section-subcontainer">
          <div class="bottom-section-data-container border" style="padding:0">
            <div class="bottom-section-data-title">ALT</div>
            <div class="bottom-section-data-value" style="min-width:75px">{this.cabAltitude}</div>
            <div class="bottom-section-data-unit">FT</div>
          </div>

          <div class="bottom-section-data-container border">
            <div class="bottom-section-data-title">RATE</div>
            <div class="bottom-section-data-value" style="min-width:80px">{this.cabAltitudeRate}</div>
            <div class="bottom-section-data-unit">FPM</div>
          </div>

          <div class="bottom-section-data-container border">
            <div class="bottom-section-data-title" style="max-width:30px;">DIFF</div>
            <div class="bottom-section-data-value">{this.pressureDiff}</div>
            <div class="bottom-section-data-unit">PSI</div>
          </div>
        </div>

        <div class="bottom-section-data-container">
          <div class="bottom-section-data-title">DEST ELV</div>
          <div class="bottom-section-data-value magenta invalid" ref={this.destElevRef} style="min-width:75px">{this.destElevSubject}</div>
          <div class="bottom-section-data-unit">FT</div>
        </div>

      </div>
    );
  }
}