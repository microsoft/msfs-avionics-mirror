import { ArraySubject, LegDefinition, SubscribableArray } from '@microsoft/msfs-sdk';

/** Direct To Page Items */
export class DirectToPageItem {

    /**
     * A Leg Page Item
     * @param globalIndex Leg Global Leg Index
     * @param segmentIndex Segment Index
     * @param segmentLegIndex Leg Index in Segment
     * @param isToLeg Whether this is the to leg.
     * @param legDefinition Leg Definition.
     */
    constructor(
        public globalIndex: number,
        public segmentIndex: number,
        public segmentLegIndex: number,
        public isToLeg: boolean,
        public legDefinition?: LegDefinition,
    ) {
    }
}

/**
 * Direct To Page Store
 */
export class DirectToPageStore {

    private readonly _legs = ArraySubject.create<DirectToPageItem>();
    public readonly legs = this._legs as SubscribableArray<DirectToPageItem>;

    /**
     * Sets the legs array.
     * @param legs The array of DirectToPageItems
     */
    public setLegs(legs: DirectToPageItem[]): void {
        this._legs.set(legs);
    }

    /**
     * Sets the legs array.
     * @param index The index to insert the leg at.
     * @param leg The DirectToPageItems to insert
     */
    public insertLegAt(index: number, leg: DirectToPageItem): void {
        this._legs.insert(leg, index);
    }
}
