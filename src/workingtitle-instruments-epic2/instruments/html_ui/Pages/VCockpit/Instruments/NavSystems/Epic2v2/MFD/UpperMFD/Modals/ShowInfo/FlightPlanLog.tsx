import { DateTimeFormatter, DurationFormatter, Facility, FSComponent, Subject, UnitType, VNode } from '@microsoft/msfs-sdk';

import { Epic2Fms, FlightPlanStore, TabContent, TabContentProps } from '@microsoft/msfs-epic2-shared';

/** Props for GroundTab. */
interface FlightPlanLogTabProps extends TabContentProps {
  /** The FMS. */
  readonly fms: Epic2Fms;
  /** The subject being displayed */
  readonly facility: Subject<Facility | undefined>
  /** Flight plan store */
  readonly store: FlightPlanStore
}


/** The GroundTab component. */
export class FlightPlanLogTab extends TabContent<FlightPlanLogTabProps> {
  private static etaFormatter = DateTimeFormatter.create('{hh}{mm}Z', { nanString: '' });
  private static eteFormatter = DurationFormatter.create('{hh}+{mm}', UnitType.SECOND, 60, '');

  private readonly predictedAlt = Subject.create<string>('');
  private readonly predictedAng = Subject.create<string>('');
  private readonly predictedSpd = Subject.create<string>('');
  private readonly eta = Subject.create<string>('');
  private readonly wind = Subject.create<string>('');
  private readonly tempIsa = Subject.create<string>('');
  private readonly groundSpeed = Subject.create<string>('');
  private readonly dtg = Subject.create<string>('');
  private readonly ete = Subject.create<string>('');
  private readonly fuelRem = Subject.create<string>('');
  private readonly grossWeight = Subject.create<string>('');



  /** @inheritdoc */
  public onAfterRender(): void {
    // TODO do stuff
    this.props.facility.sub((fac) => {
      let planLeg;
      for (const [legDef, legData] of this.props.store.legMap) {
        if (legDef.leg.fixIcao === fac?.icao) {
          planLeg = legData;
        }
      }

      if (planLeg && fac) {
        const fpa = planLeg.fpa.get();
        const remainingFuel = planLeg.fuelRemaining.get().asUnit(UnitType.KILOGRAM);
        const grossWt = planLeg.grossWeight.get().asUnit(UnitType.KILOGRAM);
        const speed = planLeg.speed.get();
        const predictedAlt = planLeg.altitude1.get().asUnit(UnitType.FOOT);

        this.predictedAlt.set((!isNaN(predictedAlt) && predictedAlt > 0) ? predictedAlt.toFixed(0) : '');
        this.predictedAng.set((!isNaN(fpa) && fpa !== 0) ? fpa.toFixed(2) : '');
        this.predictedSpd.set(!isNaN(speed) ? speed.toFixed(0) : '');
        this.eta.set(FlightPlanLogTab.etaFormatter(planLeg.estimatedTimeOfArrival.get()));
        this.groundSpeed.set(!isNaN(speed) ? `${speed.toFixed(0)} Kt` : '');
        this.dtg.set(`${planLeg.distanceCumulative.get().asUnit(UnitType.NMILE).toFixed(1)} NM`);
        this.ete.set(FlightPlanLogTab.eteFormatter(planLeg.estimatedTimeEnrouteCumulative.get().asUnit(UnitType.SECOND)));
        this.fuelRem.set(`${!isNaN(remainingFuel) ? `${remainingFuel.toFixed(0)} KG` : ''}`);
        this.grossWeight.set(`${!isNaN(grossWt) ? `${grossWt.toFixed(0)} KG` : ''}`);
      }
    }, true);

  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div>
        <div class='database-container'>
          <p>Predicted Alt: <span class='variable'>{this.predictedAlt}</span></p>
          <p>Predicted Ang: <span class='variable'>{this.predictedAng}</span></p>
          <p>Predicted Spd: <span class='variable'>{this.predictedSpd}</span></p>
          <p>ETA: <span class='variable'>{this.eta}</span></p>
          <p>Wind: <span class='variable'>{this.wind}</span></p>
          <p>Temp/ISA: <span class='variable'>{this.tempIsa}</span></p>
          <p>Ground Speed: <span class='variable'>{this.groundSpeed}</span></p>
          <p>DTG: <span class='variable'>{this.dtg}</span></p>
          <p>ETE: <span class='variable'>{this.ete}</span></p>
          <p>Fuel Rem: <span class='variable'>{this.fuelRem}</span></p>
          <p>Gross Weight: <span class='variable'>{this.grossWeight}</span></p>
        </div>
      </div>
    );
  }
}
