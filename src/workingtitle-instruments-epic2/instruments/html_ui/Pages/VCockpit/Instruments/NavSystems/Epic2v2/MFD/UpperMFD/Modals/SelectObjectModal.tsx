import {
  ArraySubject, ComponentProps, DisplayComponent, DmsFormatter2, EventBus, Facility, FacilityType, FSComponent, ICAO, IcaoValue, MappedSubject, SetSubject, Subject,
  UnitType, VNode, VorFacility, VorType
} from '@microsoft/msfs-sdk';

import { Epic2Fms, Epic2List, FlightPlanStore, ListItem, Modal, ModalProps, TouchButton } from '@microsoft/msfs-epic2-shared';

import './SelectObjectModal.css';

/** Interface for the waypoint display list */
interface WaypointDisplayProps extends ComponentProps {
  /** fms */
  readonly fms: Epic2Fms
  /** Event bus */
  readonly bus: EventBus
  /** The selected facility */
  readonly selectedFacility: Subject<Facility | null>
  /** Whether list is collapsed */
  readonly listCollapsed: Subject<boolean>
}
/** Class that renders the facility data and selected facility */
class WaypointDisplay extends DisplayComponent<WaypointDisplayProps> {
  public static readonly LAT_FORMATTER = DmsFormatter2.create('{+[N]-[S]}{dd}°{mm.mm}', UnitType.DEGREE, 0, 'N--°--.--');
  public static readonly LON_FORMATTER = DmsFormatter2.create('{+[E]-[W]}{ddd}°{mm.mm}', UnitType.DEGREE, 0, 'E---°--.--');

  private readonly selectedWaypointRef = FSComponent.createRef<HTMLDivElement>();
  private readonly facilityData = ArraySubject.create<Facility>([]);
  private readonly isHidden = Subject.create<boolean>(false);

  /**
   * Sets the facility data of this modal
   * @param facilityIcaos List of the FS ICAOs for the facilitys to display
   */
  public async setFacilityData(facilityIcaos?: IcaoValue[]): Promise<void> {
    this.facilityData.clear();
    if (facilityIcaos) {
      // FIXME remove type cast when typescript upgraded
      const facilities = (await this.props.fms.facLoader.getFacilities(facilityIcaos)).filter((v) => v !== null) as Facility[];
      this.facilityData.set(facilities);
    }
    this.isHidden.set(facilityIcaos === undefined);
  }

  /**
   * Gets the link for the waypoint image
   * @param facility The facility
   * @returns The link to the facility image
   */
  private static getWaypointImage(facility: Facility): string {
    /*  eslint-disable no-case-declarations */
    switch (ICAO.getFacilityType(facility.icao)) {
      case FacilityType.Airport:
        return 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/airport_w.png';
      case FacilityType.Intersection:
        return 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/intersection.png';
      case FacilityType.VOR: {
        switch ((facility as VorFacility).type) {
          case VorType.DME:
            return 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/dme.png';
          case VorType.VORTAC:
            return 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/vortac.png';
          case VorType.VORDME:
            return 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/vordme.png';
          case VorType.ILS:
            return 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/localizer.png';
          default:
            return 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/vor.png';
        }
      }
      case FacilityType.NDB:
        return 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/ndb.png';
      default:
        return 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/flightplan.png';
    }
    /*  eslint-enable no-case-declarations */
  }

  /**
   * Renders the facility info row.
   * @param facility The facility to render.
   * @returns The DOM elements.
   */
  private static renderFacilityRow(facility: Facility): VNode {
    let city = facility.city.split(', ')[0];
    if (city.startsWith('TT:')) {
      city = Utils.Translate(city);
    }
    if (city.length > 10) {
      city = city.substring(0, 10);
    }

    let name = facility.name;
    if (name.length === 0) {
      name = '------';
    } else {
      if (name.startsWith('TT:')) {
        name = Utils.Translate(name);
      }
      if (name.length > 22) {
        name = `${name.slice(0, 19)}...`;
      }
    }

    return (
      <div class='select-object-modal-label'>
        <p>
          <span class="waypoint-item-image"><img src={WaypointDisplay.getWaypointImage(facility)} /></span>
          {facility.icaoStruct.ident.padEnd(7, '\xa0')}&nbsp;{city}
        </p>
        <p>{name}</p>
        <p>{WaypointDisplay.LAT_FORMATTER(facility.lat)} {WaypointDisplay.LON_FORMATTER(facility.lon)}</p>
      </div>
    );
  }

  /**
   * Renders the selected waypoint label
   * @param facility The selected facility
   */
  private setSelectedWaypointLabels(facility: Facility | null): void {
    for (const child of this.selectedWaypointRef.instance.childNodes) {
      this.selectedWaypointRef.instance.removeChild(child);
    }

    if (facility) {
      FSComponent.render(WaypointDisplay.renderFacilityRow(facility), this.selectedWaypointRef.instance);
    } else {
      FSComponent.render(<div class='select-object-modal-label'>
        <p>{'   ----- -----'}</p>
        <p>------</p>
        <p>------------------</p>
      </div>, this.selectedWaypointRef.instance);
    }
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.selectedFacility.sub((fac) => this.setSelectedWaypointLabels(fac));
    this.setSelectedWaypointLabels(this.props.selectedFacility.get());
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div class={{ 'hidden': this.isHidden }}>
        <div class="waypoint-container">
          <div class="waypoint-list-placeholder selected-waypoint-background" ref={this.selectedWaypointRef} />
        </div>
        <div class="waypoint-list-container">
          <div class="waypoint-list-placeholder">
            <div class="white-border-box-background" />
            <Epic2List<any>
              bus={this.props.bus}
              listItemHeightPx={63}
              listItemSpacingPx={2}
              heightPx={this.props.listCollapsed.map((collapsed) => collapsed ? 63 : 254)}
              itemsPerPage={this.props.listCollapsed.map((collapsed) => collapsed ? 1 : 4)}
              scrollbarStyle="outside"
              data={this.facilityData}
              sortItems={(a, b) => this.props.fms.ppos.isValid() ? (this.props.fms.ppos.distance(a.lat, a.lon) - this.props.fms.ppos.distance(b.lat, b.lon)) : 0}
              renderItem={(data: Facility) => {
                return (<ListItem>
                  <TouchButton
                    variant='list-button'
                    isHighlighted={this.props.selectedFacility.map((selected) => data.icao.trim() == selected?.icao.trim())}
                    onPressed={() => this.props.selectedFacility.set(data)}>
                    {WaypointDisplay.renderFacilityRow(data)}
                  </TouchButton>
                </ListItem>);
              }
              }
            />
          </div>
        </div>
      </div >
    );
  }
}

/** Properties for the {@link SelectObjectOverlay} class */
interface SelectObjectOverlayProps extends ModalProps {
  /** fms */
  readonly fms: Epic2Fms
  /** The flight plan store.  */
  readonly store: FlightPlanStore;
}

/** Modal used for the join airway menu */
export class SelectObjectModal extends Modal<SelectObjectOverlayProps> {
  protected readonly cssClassSet = SetSubject.create(['select-object-modal', 'modal-bottom-left']);
  private readonly facilityListARef = FSComponent.createRef<WaypointDisplay>();
  private readonly facilityListBRef = FSComponent.createRef<WaypointDisplay>();

  private readonly selectedFacilityA = Subject.create<Facility | null>(null);
  private readonly selectedFacilityB = Subject.create<Facility | null>(null);
  private readonly listCollapsed = Subject.create<boolean>(false);

  private resolve: ((value: (Facility | null)[]) => void) | undefined;

  /**
   * Sets the facility data of this modal
   * @param facilityIcaosA List of the FS ICAOs for the facilitys to display
   * @param facilityIcaosB List of the FS ICAOs for the facilitys to display, or undefined if it is not a PBPB waypoint
   * @returns Promise that is resolved with a tuple of the selected facilitie(s) or null if the menu is closed
   */
  public async getFacility(facilityIcaosA: IcaoValue[], facilityIcaosB?: IcaoValue[]): Promise<(Facility | null)[]> {
    if (this.facilityListARef.instance) {
      this.selectedFacilityA.set(null);
      this.facilityListARef.instance.setFacilityData(facilityIcaosA);
    }

    if (this.facilityListBRef.instance) {
      this.selectedFacilityB.set(null);
      this.facilityListBRef.instance.setFacilityData(facilityIcaosB);
    }

    this.listCollapsed.set(facilityIcaosA !== undefined && facilityIcaosB !== undefined);

    const promise: Promise<(Facility | null)[]> = new Promise((resolve) => {
      this.resolve = resolve;
    });

    return promise;
  }

  /**
   * Resets the selected data
   */
  private resetData(): void {
    this.facilityListARef.instance.setFacilityData([]);
    this.facilityListBRef.instance.setFacilityData([]);
    this.selectedFacilityA.set(null);
    this.selectedFacilityB.set(null);
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.fms.planInMod.sub((inMod) => {
      if (!inMod) {
        this.close();
      }
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.cssClassSet}>
        <div class="header">
          <p class="title">Select Object</p>
          <TouchButton variant="bar" label="X" class="waypoint-modal-close-button" onPressed={() => {
            const fac = this.selectedFacilityA.get();
            if (this.resolve && fac) {
              this.resolve([null]);
            }
            this.close();
            this.resetData();
          }} />
        </div>
        <WaypointDisplay ref={this.facilityListARef} fms={this.props.fms} bus={this.props.bus} selectedFacility={this.selectedFacilityA} listCollapsed={this.listCollapsed} />
        <WaypointDisplay ref={this.facilityListBRef} fms={this.props.fms} bus={this.props.bus} selectedFacility={this.selectedFacilityB} listCollapsed={this.listCollapsed} />
        <TouchButton
          class={'insert-waypoint-button'}
          variant={'bar-menu'}
          label={'Insert'}
          onPressed={() => {
            const facA = this.selectedFacilityA.get();
            const facB = this.selectedFacilityB.get();
            if (this.resolve) {
              if (this.listCollapsed) {
                this.resolve([facA, facB]);
              } else {
                this.resolve([facA]);
              }
            }
            this.close();
            this.resetData();
          }}
          isEnabled={MappedSubject.create(([collapsed, facA, facB]) => {
            if (collapsed) {
              return facA !== null && facB !== null;
            } else {
              return facA !== null;
            }
          }, this.listCollapsed, this.selectedFacilityA, this.selectedFacilityB)} />
      </div >
    );
  }
}
