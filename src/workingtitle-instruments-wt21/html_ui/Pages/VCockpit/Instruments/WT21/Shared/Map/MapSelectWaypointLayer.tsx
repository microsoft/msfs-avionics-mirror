import {
  BasicFacilityWaypoint,
  EventBus,
  Facility,
  FacilityWaypoint,
  MapLayerProps,
  MapSyncedCanvasLayer,
  MapSystemIconFactory,
  MapSystemLabelFactory,
  MapSystemWaypointRoles,
  MapSystemWaypointsRenderer
} from '@microsoft/msfs-sdk';
import { MapFacilitySelectModule } from './MapFacilitySelectModule';

import { WT21MapKeys } from './WT21MapKeys';

/**
 * Modules required for MapSelectWaypointLayer.
 */
export interface MapSelectWaypointLayerModules {
  /** The facility select module. */
  [WT21MapKeys.CtrWpt]: MapFacilitySelectModule;
}


/** The props for the MapSelectWaypointLayer component. */
export interface MapSelectWaypointLayerProps extends MapLayerProps<MapSelectWaypointLayerModules> {
  /** The event bus. */
  bus: EventBus;
  /** The waypoint renderer to use. */
  waypointRenderer: MapSystemWaypointsRenderer;
  /** The icon factory to use with this layer. */
  iconFactory: MapSystemIconFactory;
  /** The label factory to use with this layer. */
  labelFactory: MapSystemLabelFactory;
}

/** A map layer for displaying a selected waypoint. */
export class MapSelectWaypointLayer extends MapSyncedCanvasLayer<MapSelectWaypointLayerProps>{
  public static readonly CtrWaypointRole = 'CtrWptRole';
  private readonly facilitySelectModule = this.props.model.getModule(WT21MapKeys.CtrWpt);
  private systemWaypointRole = this.props.waypointRenderer.getRoleFromName(MapSystemWaypointRoles.Normal) ?? 0;

  protected displayWaypoint: FacilityWaypoint | undefined;

  /** @inheritdoc */
  onAttached(): void {
    super.onAttached();

    this.facilitySelectModule.facility.sub(this.updateDisplayWaypoint.bind(this));
  }

  /**
   * Updates the displayed facility.
   * @param facility The facility to display.
   */
  async updateDisplayWaypoint(facility: Facility | null): Promise<void> {
    this.displayWaypoint && this.props.waypointRenderer.deregister(this.displayWaypoint, this.systemWaypointRole, 'dspl-wpt-layer');
    if (facility !== null) {
      this.displayWaypoint = new BasicFacilityWaypoint(facility, this.props.bus);
      this.props.waypointRenderer.register(this.displayWaypoint, this.systemWaypointRole, 'dspl-wpt-layer');
    }
  }
}