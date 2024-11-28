import { BitFlags, FacilityLoader, FacilityWaypointCache, FlightPlan, LegDefinition, LegDefinitionFlags, LegType } from '@microsoft/msfs-sdk';

import { MapWaypointRenderer, MapWaypointRenderRole } from '../MapWaypointRenderer';
import {
  FixIcaoWaypointsRecord, FlightPathTerminatorWaypointsRecord, FlightPlanLegWaypointsRecord, ProcedureTurnLegWaypointsRecord
} from './MapFlightPlanWaypointRecord';
import { MapFlightPlanWaypointRecordManager } from './MapFlightPlanWaypointRecordManager';

/**
 * Manages flight plan waypoint records.
 */
export class MapDefaultFlightPlanWaypointRecordManager implements MapFlightPlanWaypointRecordManager {
  private readonly legWaypointRecords = new Map<LegDefinition, FlightPlanLegWaypointsRecord>();

  private _isBusy = false;

  /**
   * Creates a new instance of MapDefaultFlightPlanWaypointRecordManager.
   * @param facLoader This manager's facility loader.
   * @param facWaypointCache This manager's facility waypoint cache.
   * @param waypointRenderer This manager's waypoint renderer.
   * @param inactiveRenderRole The role(s) under which waypoints should be registered when they are part of an inactive
   * leg.
   * @param activeRenderRole The role(s) under which waypoints should be registered when they are part of an active
   * leg.
   */
  public constructor(
    private readonly facLoader: FacilityLoader,
    private readonly facWaypointCache: FacilityWaypointCache,
    private readonly waypointRenderer: MapWaypointRenderer,
    private readonly inactiveRenderRole: MapWaypointRenderRole,
    private readonly activeRenderRole: MapWaypointRenderRole
  ) {
  }

  /** @inheritDoc */
  public isBusy(): boolean {
    return this._isBusy;
  }

  /** @inheritDoc */
  public async refreshWaypoints(
    flightPlan: FlightPlan | null,
    activeLegIndex: number,
    repick: boolean,
    startIndex?: number,
    endIndex?: number
  ): Promise<void> {
    if (this._isBusy) {
      throw new Error('MapFlightPlanWaypointRecordManager: cannot refresh waypoints while busy');
    }

    this._isBusy = true;

    if (!flightPlan) {
      // Remove all waypoint records.
      for (const record of this.legWaypointRecords.values()) {
        record.destroy();
      }
      this.legWaypointRecords.clear();

      this._isBusy = false;
      return;
    }

    const activeLeg = flightPlan.tryGetLeg(activeLegIndex);

    if (repick) {
      startIndex ??= 0;
      endIndex ??= flightPlan.length - 1;

      const legsToDisplay = new Set<LegDefinition>();
      // Gather all legs to display.
      let legIndex = startIndex;
      for (const leg of flightPlan.legs(false, startIndex)) {
        if (legIndex > endIndex) {
          break;
        }

        if (!BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo | LegDefinitionFlags.VectorsToFinal) || legIndex === flightPlan.activeLateralLeg) {
          legsToDisplay.add(leg);
        }

        legIndex++;
      }

      // Remove records of legs that are no longer in the set of legs to display.
      for (const record of this.legWaypointRecords.values()) {
        if (legsToDisplay.has(record.leg)) {
          legsToDisplay.delete(record.leg);
        } else {
          record.destroy();
          this.legWaypointRecords.delete(record.leg);
        }
      }

      // Create new records for legs to display that don't already have records.
      for (const leg of legsToDisplay) {
        const record = this.createLegWaypointsRecord(leg);
        this.legWaypointRecords.set(leg, record);
      }
    }

    const waypointRefreshes: Promise<void>[] = [];
    for (const record of this.legWaypointRecords.values()) {
      waypointRefreshes.push(record.refresh(record.leg === activeLeg));
    }

    await Promise.all(waypointRefreshes);

    this._isBusy = false;
  }

  /**
   * Creates a FlightPlanLegWaypointsRecord for a specified flight plan leg.
   * @param leg A flight plan leg.
   * @returns A FlightPlanLegWaypointsRecord for the specified flight plan leg.
   */
  private createLegWaypointsRecord(leg: LegDefinition): FlightPlanLegWaypointsRecord {
    switch (leg.leg.type) {
      case LegType.CD:
      case LegType.VD:
      case LegType.CR:
      case LegType.VR:
      case LegType.FC:
      case LegType.FD:
      case LegType.FA:
      case LegType.CA:
      case LegType.VA:
      case LegType.FM:
      case LegType.VM:
      case LegType.CI:
      case LegType.VI:
        return new FlightPathTerminatorWaypointsRecord(leg, this.waypointRenderer, this.facLoader, this.inactiveRenderRole, this.activeRenderRole);
      case LegType.PI:
        return new ProcedureTurnLegWaypointsRecord(leg, this.waypointRenderer, this.facLoader, this.facWaypointCache, this.inactiveRenderRole, this.activeRenderRole);
      default:
        return new FixIcaoWaypointsRecord(leg, this.waypointRenderer, this.facLoader, this.facWaypointCache, this.inactiveRenderRole, this.activeRenderRole);
    }
  }
}
