import { MapIndexedRangeModule, UnitType } from '@microsoft/msfs-sdk';

/** An extended version of the map range module that handles setting a range simvar for tooltips. */
export class GNSMapIndexedRangeModule extends MapIndexedRangeModule {
  private rangeSimvar: string | undefined;
  /**
   * Create a GNSMapIndexedRangeModule.
   * @param rangeSimvar The SimVar to update with the current range in NM.
   */
  constructor(rangeSimvar?: string) {
    super();

    this.rangeSimvar = rangeSimvar;

    if (rangeSimvar !== undefined) {
      this.nominalRange.sub(v => {
        SimVar.SetSimVarValue(rangeSimvar, 'number', v.asUnit(UnitType.NMILE));
      });
    }
  }

  /**
   * Update the map range simvar.
   */
  public updateMapRangeSimvar(): void {
    if (this.rangeSimvar !== undefined) {
      SimVar.SetSimVarValue(this.rangeSimvar, 'number', this.nominalRange.get().asUnit(UnitType.NMILE));
    }
  }
}