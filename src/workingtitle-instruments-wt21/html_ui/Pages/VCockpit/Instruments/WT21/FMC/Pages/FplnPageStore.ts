import { ArraySubject, FlightPlanSegmentType, LegDefinition, Subject, SubscribableArray } from '@microsoft/msfs-sdk';

/** Route Page Leg Items */
export class RoutePageLegItem {

    /**
     * A Route Page Item
     * @param globalIndex Leg Global Leg Index
     * @param segmentIndex Segment Index
     * @param segmentLegIndex Leg Index in Segment
     * @param lastRowWasDiscontinuity Whether the last row was a discontinuity
     * @param isPlanEnd Whether this is the plan end line
     * @param isFirstRow Whether this is the first row of the list on the page
     * @param isActive Where this is or contains the active leg
     * @param segmentType is the Segment Type for the segment containing this leg
     * @param legDefinition Leg Definition
     * @param title The title for this route page item (DIRECT, AirwayName, Proc Name)
     */
    constructor(
        public globalIndex: number,
        public segmentIndex: number,
        public segmentLegIndex: number,
        public lastRowWasDiscontinuity: boolean,
        public isPlanEnd: boolean,
        public isFirstRow: boolean,
        public isActive: boolean,
        public segmentType?: FlightPlanSegmentType,
        public legDefinition?: LegDefinition,
        public title?: string,
    ) {
    }
}

/**
 * FPLN Page Store
 */
export class FplnPageStore {

    private readonly _legs = ArraySubject.create<RoutePageLegItem>();
    public readonly legs = this._legs as SubscribableArray<RoutePageLegItem>;

    public readonly origin = Subject.create<string | null>(null);
    public readonly destination = Subject.create<string | null>(null);
    public readonly altn = Subject.create<string | null>(null);
    public readonly originRunway = Subject.create<string>('');
    public readonly distance = Subject.create<number>(0);

    /**
     * Sets the legs array.
     * @param legs The array of RoutePageLegItems
     */
    public setLegs(legs: RoutePageLegItem[]): void {
        this._legs.clear();
        this._legs.set(legs);
    }

    /**
     * Sets the legs array.
     * @param index The index to insert the leg at.
     * @param leg The RoutePageLegItem to insert
     */
    public insertLegAt(index: number, leg: RoutePageLegItem): void {
        this._legs.insert(leg, index);
    }
}
