import { ArraySubject, Facility, LegDefinition, Subject, SubscribableArray, VNavConstraint, VNavLeg } from '@microsoft/msfs-sdk';

/** Leg Page Items */
export class LegPageItem {

    /**
     * A Leg Page Item
     * @param globalIndex Leg Global Leg Index
     * @param segmentIndex Segment Index
     * @param segmentLegIndex Leg Index in Segment
     * @param isPpos whether this is a PPOS leg (for hold selection)
     * @param isFromLeg Whether this is the from leg.
     * @param isToLeg Whether this is the to leg.
     * @param isFirstMissedLeg Whether this is the first leg of the missed approach sequence.
     * @param legDefinition Leg Definition.
     * @param vnavLeg The VNav Leg.
     * @param vnavConstraint The VNav Constraint for the VNav Leg.
     */
    constructor(
        public globalIndex: number,
        public segmentIndex: number,
        public segmentLegIndex: number,
        public isPpos: boolean,
        public isFromLeg: boolean,
        public isToLeg: boolean,
        public isFirstMissedLeg: boolean,
        public legDefinition?: LegDefinition,
        public vnavLeg?: VNavLeg,
        public vnavConstraint?: VNavConstraint
    ) {
    }
}

/**
 * LEGS Page Store
 */
export class LegsPageStore {

    private readonly _legs = ArraySubject.create<LegPageItem>();
    public readonly legs = this._legs as SubscribableArray<LegPageItem>;

    public selectedLeg: LegPageItem | undefined;

    public holdAtFacilitySubject = Subject.create<Facility | null>(null);

    public lastRenderPlanIndex: number | undefined = undefined;

    // /**
    //  * Creates the store.
    //  */
    // constructor() {
    // }

    /**
     * Sets the legs array.
     * @param legs The array of RoutePageLegItems
     */
    public setLegs(legs: LegPageItem[]): void {
        this._legs.set(legs);
    }

    /**
     * Sets the legs array.
     * @param index The index to insert the leg at.
     * @param leg The RoutePageLegItem to insert
     */
    public insertLegAt(index: number, leg: LegPageItem): void {
        this._legs.insert(leg, index);
    }

    /**
     * Set the vnavLeg on a LegPageItem
     * @param globalIndex The global leg index of the leg.
     * @param vnavLeg The VNavLeg or undefined if none exists.
     * @param vnavConstraint The VNavConstraint or undefined if none exists.
     */
    public setVNavLegAndConstraint(globalIndex: number, vnavLeg?: VNavLeg, vnavConstraint?: VNavConstraint): void {
        const array = this._legs.getArray();
        const legPageItem = array.find(l => l.globalIndex === globalIndex);

        if (legPageItem !== undefined) {
            legPageItem.vnavConstraint = vnavConstraint;
            legPageItem.vnavLeg = vnavLeg;
        }
    }
}
