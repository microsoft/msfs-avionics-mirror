import { ComputedSubject, LegDefinition, NumberUnitSubject, Subject, UnitType } from '@microsoft/msfs-sdk';

/** Leg data to store on each FPL line. */
export class GnsLegDataItem {

  /** The Leg Definition */
  public readonly legDefinition: Subject<LegDefinition>;

  /** The name of the waypoint. */
  public readonly name = ComputedSubject.create<string | undefined, string>(undefined, (v) => {
    switch (v) {
      case undefined:
        return 'noname';
      case 'HOLD':
        return 'hold';
      case 'MANSEQ':
        return 'man seq';
      default:
        return v;
    }
  });

  /** The initial DTK to the waypoint. */
  public readonly dtk = NumberUnitSubject.create(UnitType.DEGREE.createNumber(NaN));

  /** The distance to the waypoint. */
  public readonly distance = NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN));

  /** The cumulative distance in the plan at the waypoint. */
  public readonly cumulativeDistance = NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN));

  /**
   * A GNS Leg Data Item
   * @param legDefinition Leg Global Leg Index
   */
  constructor(legDefinition: LegDefinition) {
    this.legDefinition = Subject.create<LegDefinition>(legDefinition);
    this.legDefinition.sub(this.updateLegData, true);
  }

  private updateLegData = (legDefiniton: LegDefinition): void => {
    this.name.set(legDefiniton.name);
    this.dtk.set(legDefiniton.calculated?.initialDtk ?? NaN, UnitType.DEGREE);
    this.distance.set(legDefiniton.calculated?.distance ?? NaN, UnitType.METER);
    this.cumulativeDistance.set(legDefiniton.calculated?.cumulativeDistance ?? NaN, UnitType.METER);
  };
}