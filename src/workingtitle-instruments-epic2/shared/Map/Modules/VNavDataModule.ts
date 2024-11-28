import { LegDefinition, Subject } from '@microsoft/msfs-sdk';

/** Provides vnav data. */
export class VNavDataModule {
  /** Holds the leg def for the next or current altitude constraint,
   * for the purposes of displaying the altitude constraitn on the map when DATA is off. */
  public readonly nextConstraintLegDefForMap = Subject.create<LegDefinition | undefined>(undefined);
}
