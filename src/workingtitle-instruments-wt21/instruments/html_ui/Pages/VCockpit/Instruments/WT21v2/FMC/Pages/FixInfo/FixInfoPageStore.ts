import { Subject } from '@microsoft/msfs-sdk';

export enum FixInfoRef {
  Direct,
  AlongTrack,
  Abeam,
}

/** Data store for the fix info page */
export class WT21FixInfoPageStore {
  private static readonly ARRAY_EQUALITY = (a: unknown[], b: unknown[]): boolean => (a.length === b.length && a.every((v, i) => v === b[i]));

  // all the data to render the current page
  public readonly currentFixIdent = Subject.create<string | null>(null);

  public readonly currentRadCross = Subject.create<[number | null, boolean]>([null, false], WT21FixInfoPageStore.ARRAY_EQUALITY);
  public readonly currentDisCross = Subject.create<[number | null, boolean]>([null, false], WT21FixInfoPageStore.ARRAY_EQUALITY);

  public readonly currentLatCross = Subject.create<[number | null, boolean]>([null, false], WT21FixInfoPageStore.ARRAY_EQUALITY);
  public readonly currentLonCross = Subject.create<[number | null, boolean]>([null, false], WT21FixInfoPageStore.ARRAY_EQUALITY);

  public readonly currentRef = Subject.create(FixInfoRef.Direct);
  public readonly currentRefCrsDist = Subject.create<[number | null, number | null]>([null, null], WT21FixInfoPageStore.ARRAY_EQUALITY);

  public currentAbeamPointCalculated = false;

  public readonly activeRouteExists = Subject.create(false);

  /**
   * Erase the page data
   */
  public erasePageData(): void {
    this.currentFixIdent.set(null);
    this.currentRadCross.set([null, false]);
    this.currentDisCross.set([null, false]);
    this.currentLatCross.set([null, false]);
    this.currentLonCross.set([null, false]);
    this.currentRef.set(FixInfoRef.Direct);
    this.currentRefCrsDist.set([null, null]);
    this.currentAbeamPointCalculated = false;
  }
}
