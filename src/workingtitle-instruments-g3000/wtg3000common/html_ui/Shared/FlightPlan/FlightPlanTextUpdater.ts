/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Facility, FlightPlanSegmentType } from '@microsoft/msfs-sdk';
import { FlightPlanLegData, FlightPlanLegListData } from './FlightPlanLegListData';
import { FlightPlanSegmentListData } from './FlightPlanSegmentListData';
import { FlightPlanListManager } from './FlightPlanListManager';
import { FlightPlanStore } from './FlightPlanStore';
import { FlightPlanListData } from './FlightPlanDataTypes';

/** Data used to update the flight plan text. */
export interface FlightPlanTextData {
  /** Index for the from leg in the flight plan text list, 0, being at the top, -1 if from is outside the list. */
  readonly fromIndex: number | undefined;
  /** Index for the from leg in the flight plan text list, 0, being at the top, 5 if the to leg is outside the list. */
  readonly toIndex: number | undefined;
  /** The flight plan text row data. */
  readonly rows: FlightPlanTextRowData[];
}

/** Leg and segment list data. */
export type FlightPlanTextRowData = FlightPlanSegmentListData | FlightPlanLegListData;

/** Generates the rows to be used in the flight plan text inset. */
export class FlightPlanTextUpdater {
  private readonly dataListArray = this.flightPlanListManager.dataList.getArray();

  /**
   * Creates a new FlightPlanTextUpdater.
   * @param store The flight plan store.
   * @param flightPlanListManager The list manager to use.
   */
  public constructor(
    private readonly store: FlightPlanStore,
    private readonly flightPlanListManager: FlightPlanListManager,
  ) { }

  /**
   * Generates the data for the flight plan text inset.
   * @param topRow Reference to the leg or segment list data that should be in the top row.
   * @returns the data for the flight plan text inset.
   */
  public getUpdateData(topRow: FlightPlanTextRowData | undefined): FlightPlanTextData {
    const rows = this.getRows(topRow);

    const isDirectToRandomActive = this.store.isDirectToRandomActiveWithHold.get();
    const directToRandomLegListData = this.store.directToRandomLegListData.get();
    const directToRandomHoldLegListData = this.store.directToRandomHoldLegListData.get();
    const showOffroute = isDirectToRandomActive && directToRandomLegListData;
    const showOffrouteWithHold = showOffroute && isDirectToRandomActive === 'with-hold' && directToRandomHoldLegListData;

    if (showOffrouteWithHold) {
      rows.unshift(directToRandomHoldLegListData);
      delete rows[5];
      rows.unshift(directToRandomLegListData);
      delete rows[5];
    } else if (showOffroute) {
      rows.unshift(directToRandomLegListData);
      delete rows[5];
    }

    const fromLeg = this.store.fromLeg.get();
    const fromLegData = fromLeg ? this.store.legMap.get(fromLeg) : undefined;
    const fromLegListData = fromLegData ? this.flightPlanListManager.legDataMap.get(fromLegData) : undefined;
    // If undefined, we want to show the direct to arrow, else the arrow should come from off screen
    const fromIndex = showOffroute
      ? undefined
      : fromLeg === undefined
        ? undefined
        : fromLegListData
          ? rows.indexOf(fromLegListData)
          : undefined;

    const toLeg = this.store.toLeg.get();
    const toLegListData = toLeg ? this.flightPlanListManager.legDataMap.get(toLeg) : undefined;
    // If undefined, we want to show no arrow, else the arrow should point off screen
    const toIndex = (showOffrouteWithHold && directToRandomHoldLegListData?.legData.isActiveLeg.get())
      ? 1
      : showOffroute
        ? 0
        : toLeg === undefined
          ? undefined
          : toLegListData
            ? rows.indexOf(toLegListData)
            : undefined;

    return {
      fromIndex,
      // Setting it to 5 will make the arrow point off screen through the bottom
      toIndex: toIndex === -1 ? 5 : toIndex,
      rows,
    };
  }

  /**
   * Gets the rows. If no topRow, will put active leg in center, or just start at the top of the list.
   * @param topRow What to use as the top row.
   * @returns the rows.
   */
  private getRows(topRow: FlightPlanTextRowData | undefined): FlightPlanTextRowData[] {
    const toLeg = this.store.toLeg.get();
    if (topRow) {
      return this.getRowsFromTopRow(topRow);
    } else if (!toLeg) {
      return this.getRowsWhenNoToLeg();
    } else {
      return this.getRowsAroundToLeg(toLeg);
    }
  }

  /**
   * Gets rows using a top row.
   * @param topRow the top row data.
   * @returns the rows.
   */
  private getRowsFromTopRow(topRow: FlightPlanTextRowData): FlightPlanTextRowData[] {
    const rows: FlightPlanTextRowData[] = [];
    let foundTopRow = false;
    const filteredList = this.dataListArray.filter(x =>
      FlightPlanTextUpdater.shouldIgnoreItem(x, this.store.originFacility.get(), this.store.destinationFacility.get()) === false);

    for (const item of filteredList) {
      if (item === topRow) {
        foundTopRow = true;
      }
      if (foundTopRow) {
        rows.push(item as FlightPlanSegmentListData | FlightPlanLegListData);
      }
      if (rows.length === 5) { break; }
    }

    return rows;
  }

  /**
   * Gets rows when there is no to leg, it will just pull the first 5 items from the list.
   * @returns the rows.
   */
  private getRowsWhenNoToLeg(): FlightPlanTextRowData[] {
    const rows: FlightPlanTextRowData[] = [];
    const filteredList = this.dataListArray.filter(x =>
      FlightPlanTextUpdater.shouldIgnoreItem(x, this.store.originFacility.get(), this.store.destinationFacility.get()) === false);

    for (const item of filteredList) {
      rows.push(item as FlightPlanSegmentListData | FlightPlanLegListData);
      if (rows.length === 5) { break; }
    }

    return rows;
  }

  /**
   * Gets rows with the active leg in the center.
   * @param toLeg The active leg.
   * @returns the rows.
   */
  private getRowsAroundToLeg(toLeg: FlightPlanLegData): FlightPlanTextRowData[] {
    let rows: FlightPlanTextRowData[] = [];
    let foundToLeg = false;
    const filteredList = this.dataListArray.filter(x =>
      FlightPlanTextUpdater.shouldIgnoreItem(x, this.store.originFacility.get(), this.store.destinationFacility.get()) === false);

    // Add rows until we find the toLeg
    // Then slice the rows to leave the toLeg with the 2 rows behind it
    // Then keep adding rows until we have 5 rows or reach the end
    for (const item of filteredList) {
      rows.push(item as FlightPlanSegmentListData | FlightPlanLegListData);
      if (item.type === 'leg' && item.legData === toLeg) {
        foundToLeg = true;
        const toLegRowIndex = rows.length - 1;
        const rowsAfterToLeg = filteredList.length - toLegRowIndex - 1;
        const behindRowCount = Math.max(2, 4 - rowsAfterToLeg);
        const startIndex = Math.max(0, toLegRowIndex - behindRowCount);
        // Cut off the start of the rows to leave 2 rows before the toLeg
        rows = rows.slice(startIndex, toLegRowIndex + 1);
      }
      if (foundToLeg && rows.length === 5) { break; }
    }

    return rows;
  }

  /**
   * Whether an item should be left out of the text rows.
   * @param item the item to check.
   * @param originFacility The current origin facility.
   * @param destinationFacility The current destination facility.
   * @returns True if item should be ignored.
   */
  public static shouldIgnoreItem(item: FlightPlanListData, originFacility?: Facility, destinationFacility?: Facility): boolean {
    if (item.isVisible.get() !== true) { return true; }
    if (item.type === 'addEnrouteWaypointButton') { return true; }
    if (item.type === 'segment') {
      // Hide departure segment if no origin
      if (item.segmentData.segment.segmentType === FlightPlanSegmentType.Departure && originFacility === undefined) { return true; }
      // Hide destination segment if no destination
      if (item.segmentData.segment.segmentType === FlightPlanSegmentType.Destination && destinationFacility === undefined) { return true; }
    }
    return false;
  }

  /** Destroys subs and comps. */
  public destroy(): void {
    // noop
  }
}