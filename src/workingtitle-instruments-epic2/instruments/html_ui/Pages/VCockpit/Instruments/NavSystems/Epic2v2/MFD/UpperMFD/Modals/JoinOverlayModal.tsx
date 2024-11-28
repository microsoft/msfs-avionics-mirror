import {
  AirwayData,
  AirwayObject, ArraySubject, FacilityType, FlightPlanSegmentType, FSComponent, ICAO, IntersectionFacility,
  LegDefinition, MappedSubject, SetSubject, Subject,
  VNode
} from '@microsoft/msfs-sdk';

import {
  DiamondListItem, Epic2Fms, Epic2List, FlightPlanStore, FmsMessageKey, FmsMessageTransmitter, Modal, ModalProps, TouchButton, TouchButtonCheckbox
} from '@microsoft/msfs-epic2-shared';

import './JoinOverlayModal.css';

/** Properties for the {@link JoinAirwayOverlay} class */
interface JoinAirwayOverlayProps extends ModalProps {
  /** fms */
  readonly fms: Epic2Fms
  /** The flight plan store.  */
  readonly store: FlightPlanStore;
}

/** Modal used for the join airway menu */
export class JoinAirwayOverlay extends Modal<JoinAirwayOverlayProps> {
  private readonly fmsMessageTransmitter = new FmsMessageTransmitter(this.props.bus);
  protected readonly cssClassSet = SetSubject.create(['join-airway-modal', 'modal-top-left']);

  private readonly togglePreview = Subject.create(false);
  private readonly airwayData = ArraySubject.create<AirwayData>([]);
  private readonly exitWaypointData = ArraySubject.create<IntersectionFacility>([]);
  private readonly selectedAirway = Subject.create<string | null>(null);
  private readonly selectedExitWaypoint = Subject.create<string | null>(null);
  private readonly subheaderTitle = MappedSubject.create(([entryWaypoint, airway, exitWaypoint]) => {
    const entryIcao = entryWaypoint?.leg.leg.fixIcao;
    return `${entryIcao ? ICAO.getIdent(entryIcao) : '-----'}.${airway ?? '--'}.${exitWaypoint ? ICAO.getIdent(exitWaypoint) : '-----'}`;
  }, this.props.store.amendWaypointForDisplay, this.selectedAirway, this.selectedExitWaypoint);

  private readonly showIdent = Subject.create<boolean>(true);
  // private readonly menuOptions = [
  //   <TouchButton class={'waypoint-menu-label'} variant={'bar-menu'} label={'Name'} onPressed={() => this.showIdent.set(false)} />,
  //   <TouchButton class={'waypoint-menu-label'} variant={'bar-menu'} label={'Ident'} onPressed={() => this.showIdent.set(true)} />
  // ];

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.store.amendWaypointForDisplay.sub((legData) => this.getAirways(legData?.leg.leg.fixIcao));
    this.selectedAirway.sub((airwayIcao) => this.getExitWaypoints(this.airwayData.getArray().find((airway) => airway.name == airwayIcao)));
  }

  /**
   * Gets all the airways present in a leg
   * @param waypointIcao The FS ICAO of the entry waypoint
   */
  private async getAirways(waypointIcao?: string): Promise<void> {
    this.selectedAirway.set(null);
    this.selectedExitWaypoint.set(null);
    this.airwayData.set([]);
    const airways: AirwayData[] = [];

    const facType = waypointIcao && waypointIcao.trim().length > 0 && ICAO.getFacilityType(waypointIcao);
    if (facType && facType !== FacilityType.Airport && facType !== FacilityType.RWY && facType !== FacilityType.VIS && facType !== FacilityType.USR) {
      const facility = waypointIcao ? await this.props.fms.facLoader.getFacility(FacilityType.Intersection, waypointIcao) : undefined;

      if (waypointIcao && facility) {
        for (const airwaySegment of facility.routes) {
          const airwayObject = await this.props.fms.facLoader.getAirway(airwaySegment.name, airwaySegment.type, waypointIcao);
          airways.push(airwayObject);

          airways.sort((a, b) => a.name.localeCompare(b.name));
          this.airwayData.set(airways);
        }
      }
    }

  }

  /**
   * Gets the exit waypoints from an airway
   * @param airway the selected airway
   */
  private async getExitWaypoints(airway: AirwayData | undefined): Promise<void> {
    this.exitWaypointData.set([]);
    const exitWaypoints: IntersectionFacility[] = [];
    if (airway) {
      airway.waypoints.forEach((facility) => {
        if (facility.icao !== this.props.store.amendWaypointForDisplay.get()?.leg.leg.fixIcao) {
          exitWaypoints.push(facility);
          exitWaypoints.sort((a, b) => a.name.localeCompare(b.name));

          this.exitWaypointData.set(exitWaypoints);
        }
      });
    }
  }

  /**
   * Sets the index of the amend list item
   * @param referenceLegDef the leg definition to be used for setting the index
   */
  private setAmendListItemIndex(referenceLegDef: LegDefinition): void {
    const referenceLeg = this.props.store.legMap.get(referenceLegDef);

    this.props.store.amendWaypointForDisplay.set(referenceLeg);
  }

  /**
   * Inserts the airway into the flight plan
   */
  private async insertAirway(): Promise<void> {
    const entry = this.props.store.amendWaypointForDisplay.get();
    const flightPlan = this.props.fms.getModFlightPlan();
    const displaySegmentIndex = entry ? flightPlan.getSegmentIndex(entry.globalLegIndex.get()) : undefined;
    const displaySegmentLegIndex = entry ? flightPlan.getSegmentLegIndex(entry.globalLegIndex.get()) : undefined;

    const entryIcao = entry?.leg.leg.fixIcao;
    const exitIcao = this.selectedExitWaypoint.get();
    const airway = this.selectedAirway.get();
    if (entryIcao && exitIcao && airway && displaySegmentIndex !== undefined && displaySegmentLegIndex !== undefined) {
      const entryFacility = await this.props.fms.facLoader.getFacility(FacilityType.Intersection, entryIcao);
      const selectedAirway = this.airwayData.getArray().find((airwaySearch) => airway === airwaySearch.name) as AirwayData;
      const selectedExit = selectedAirway.waypoints.find((waypointSearch) => waypointSearch.icao == exitIcao);

      if (selectedExit) {
        const segmentType = flightPlan.getSegment(displaySegmentIndex).segmentType;

        if (segmentType == FlightPlanSegmentType.Enroute || segmentType == FlightPlanSegmentType.Departure) {
          this.props.fms.insertAirwaySegment(selectedAirway, entryFacility, selectedExit, displaySegmentIndex, displaySegmentLegIndex);

          for (const segment of flightPlan.segmentsOfType(FlightPlanSegmentType.Enroute)) {
            if (segment.airway == airway.toUpperCase()) {
              this.setAmendListItemIndex(segment.legs[segment.legs.length - 1]);
              this.close();
            }
          }
        } else {
          this.fmsMessageTransmitter.sendMessage(FmsMessageKey.GenericInvalidEntry);
        }
      } else {
        this.fmsMessageTransmitter.sendMessage(FmsMessageKey.GenericInvalidEntry);
      }
    } else {
      this.fmsMessageTransmitter.sendMessage(FmsMessageKey.GenericInvalidEntry);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.cssClassSet}>
        <div class="header">
          <p class="title">Join Airway</p>
          <TouchButton variant="bar" label="X" class="join-airway-close-button" onPressed={() => this.close()} />
        </div>
        <div class="subheader">
          <p class="airway">{this.subheaderTitle}</p>
          <TouchButtonCheckbox label={'View'} class="join-airway-view-toggle-button" isChecked={this.togglePreview} variant="bar" isEnabled={false} />
        </div>
        <div class="join-airway-popout-rectangle join-airway-airway-container">
          <p class="airway-container-title">Airway</p>
          <div class="join-airway-list-placeholder">
            <div class="white-border-box-background" />
            <Epic2List<any>
              class="airway-modal-list"
              bus={this.props.bus}
              listItemHeightPx={24}
              itemsPerPage={8}
              scrollbarStyle="inside"
              data={this.airwayData}
              renderItem={(data: AirwayObject) => <DiamondListItem
                label={data.name}
                isSelected={this.selectedAirway.map((airway) => airway == data.name)}
                onPressed={() => {
                  this.selectedAirway.set(this.selectedAirway.get() === data.name ? null : data.name);
                  this.selectedExitWaypoint.set(null);
                }}
              />
              }
            />
          </div>
        </div>
        <div class="join-airway-popout-rectangle join-airway-exit-waypoint-container">
          <p class="airway-container-title">Exit Wpt</p>
          {/* <ButtonMenu class={'waypoint-name-menu-base'} buttons={this.menuOptions} position={'bottom'}>
            <div class='button-box-arrow' style='width: 80px'>
              <TouchButton variant={'small'}>
                <div class="airway-name-menu-container">
                  <div class="airway-name-menu-label">{this.showIdent.map((showIdent) => showIdent ? 'Ident' : 'Name')}</div>
                  <svg height="12" width="16" class="triangle">
                    <polygon points="0,0 0,12 12,6" />
                  </svg>
                </div>
              </TouchButton>
            </div>
          </ButtonMenu> */}
          <div class="join-airway-list-placeholder">
            <div class="white-border-box-background" />
            <Epic2List<any>
              class="airway-modal-list"
              bus={this.props.bus}
              listItemHeightPx={24}
              itemsPerPage={8}
              scrollbarStyle="inside"
              data={this.exitWaypointData}
              renderItem={(data: IntersectionFacility) => <DiamondListItem
                label={this.showIdent.map((showIdent) => showIdent == true ? ICAO.getIdent(data.icao) : data.name)}
                isSelected={this.selectedExitWaypoint.map((fac) => fac == data.icao)}
                onPressed={() => this.selectedExitWaypoint.set(this.selectedExitWaypoint.get() === data.icao ? null : data.icao)}
              />
              }
            />
          </div>
        </div>
        <TouchButton
          class={'insert-airway-button'}
          variant={'bar-menu'}
          label={'Insert'}
          onPressed={() => this.insertAirway()}
          isEnabled={MappedSubject.create(this.selectedAirway, this.selectedExitWaypoint).map((([airway, exitWaypoint]) => airway !== null && exitWaypoint !== null))} />
      </div>
    );
  }
}
