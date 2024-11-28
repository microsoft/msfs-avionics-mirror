import {
  AirportClass, AirportFacility, ArraySubject, ArrayUtils, BitFlags, ClockEvents, ConsumerSubject, EventBus, FacilityType, FlightPlan, FSComponent, GeoPoint,
  GNSSEvents, ICAO, LegType, NearestContext, SetSubject, Subject, SubscribableArrayEventType, UnitType, VNode
} from '@microsoft/msfs-sdk';

import {
  Epic2FlightPlans, Epic2Fms, Epic2List, FlightPlanStore, FmsMessageTransmitter, ListItem, Modal, ModalProps, TouchButton
} from '@microsoft/msfs-epic2-shared';

import './NearestFunctionModal.css';

/** Properties for the {@link NearestFunctionModal} class */
interface NearestFunctionModalProps extends ModalProps {
  /** fms */
  readonly fms: Epic2Fms
  /** Event bus */
  readonly bus: EventBus
  /** The flight plan store.  */
  readonly store: FlightPlanStore;
}

/** Modal used for the nearest function menu */
export class NearestFunctionModal extends Modal<NearestFunctionModalProps> {
  private readonly fmsMessageTransmitter = new FmsMessageTransmitter(this.props.bus);
  protected readonly cssClassSet = SetSubject.create(['nearest-function-modal', 'modal-top-left']);

  private readonly position = ConsumerSubject.create<LatLongAlt>(this.props.bus.getSubscriber<GNSSEvents>().on('gps-position'), new LatLongAlt(0, 0)).map((pos) => new GeoPoint(pos.lat ?? 0, pos.long ?? 0));
  private readonly _airports = ArraySubject.create<AirportFacility>([]);
  private readonly airports = ArraySubject.create<AirportFacility>();

  private readonly selectedAirport = Subject.create<AirportFacility | null>(null);
  private readonly selectedAirportRef = FSComponent.createRef<HTMLDivElement>();

  /**
   * Sorts the airports by ascending distance and filters to the 10 nearest
   */
  private sortAirports(): void {
    const airportArray = this._airports.getArray();
    if (airportArray) {
      const airports = airportArray as AirportFacility[];
      airports.sort((a, b) => {
        const distA = this.position.get().distance(a.lat, a.lon);
        const distB = this.position.get().distance(b.lat, b.lon);
        return distA - distB;
      });

      const oldAirports = this.airports.getArray();

      airports.slice(0, 10).forEach((airport, index) => {
        if (oldAirports[index]?.icao !== airport.icao) {
          this.airports.removeAt(index);
          this.airports.insert(airport, index);
        }
      });
    }
  }

  /**
   * Creates the divert to
   */
  private async divertTo(): Promise<Promise<void>> {
    const airport = this.selectedAirport.get();
    if (airport) {
      const plan = this.props.fms.getModFlightPlan();
      const origin = plan.originAirport;

      this.props.fms.emptyFlightPlan(Epic2FlightPlans.Pending);

      if (origin) {
        const airportFac = await this.props.fms.facLoader.getFacility(FacilityType.Airport, origin);
        origin && this.props.fms.setOrigin(airportFac);
      }

      plan.addLeg(0, FlightPlan.createLeg({ type: LegType.Discontinuity }));
      plan.setLateralLeg(plan.length - 1);

      this.props.fms.createDirectTo(undefined, undefined, true, undefined, airport);
      plan.setDestinationAirport(airport.icao);
      plan.setApproach(airport.icao);
      plan.setArrival(airport.icao);
    }
  }

  /** @inheritdoc */
  public onResume(): void {
    this.selectedAirport.set(null);
    this.setSelectedAirportLabels(null);
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    NearestContext.onInitialized((instance) => {
      // Exclude
      const airportClassMask = BitFlags.union(
        BitFlags.createFlag(AirportClass.HardSurface),
        BitFlags.createFlag(AirportClass.SoftSurface),
        BitFlags.createFlag(AirportClass.AllWater),
        BitFlags.createFlag(AirportClass.Private),
      );
      instance.airports.setFilter(false, airportClassMask);
      instance.airports.sub((_index, type, item) => {
        const validItem = item as AirportFacility;

        let itemIndex;
        switch (type) {
          case SubscribableArrayEventType.Added:
            this._airports.insert(validItem);
            break;
          case SubscribableArrayEventType.Removed:
            itemIndex = this._airports.getArray().findIndex((findItem) => findItem.icao == validItem.icao);
            this._airports.removeAt(itemIndex);
            break;
          case SubscribableArrayEventType.Cleared:
            this._airports.clear();
            break;
        }
      });
    });

    this.props.bus.getSubscriber<ClockEvents>().on('simTime').atFrequency(1).handle(() => this.sortAirports());
    this.selectedAirport.sub((airport) => this.setSelectedAirportLabels(airport));
    this.setSelectedAirportLabels(this.selectedAirport.get());
  }

  /**
   * Renders the selected airport label
   * @param facility The selected facility
   */
  private setSelectedAirportLabels(facility: AirportFacility | null): void {
    for (const child of this.selectedAirportRef.instance.childNodes) {
      this.selectedAirportRef.instance.removeChild(child);
    }

    if (facility) {
      const name = facility.name.startsWith('TT') ? Utils.Translate(facility.name) : facility.name;
      const distance = `${UnitType.NMILE.convertFrom(this.position.get().distance(facility.lat, facility.lon), UnitType.GA_RADIAN).toFixed(1)} NM`.padEnd(11, ' ');
      const bearing = this.position.get().bearingTo(facility.lat, facility.lon).toFixed(0).padStart(3, '0');
      const longestRunway = facility.runways.sort((a, b) => b.length - a.length)[0];
      const elevation = UnitType.FOOT.convertFrom(longestRunway.elevation, UnitType.METER).toFixed(0);
      const length = UnitType.FOOT.convertFrom(longestRunway.length, UnitType.METER).toFixed(0);

      FSComponent.render(
        <div class='select-airport-holder'>
          <p>{ICAO.getIdent(facility.icao)} {ICAO.getRegionCode(facility.icao)}</p>
          <p>{name.length > 31 ? `${name.slice(0, 28)}...` : name ?? ' '}</p>
          <p>{bearing}°  {distance}{`${elevation}Ft`.padEnd(9, ' ')}{length}Ft</p>
        </div>, this.selectedAirportRef.instance);
    } else {
      FSComponent.render(<div class='select-airport-holder'>
        <p>----  -----</p>
        <p>----------</p>
        <p>---°  ---.- NM   ---- Ft  ---- Ft</p>
      </div>, this.selectedAirportRef.instance);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.cssClassSet}>
        <div class="header">
          <p class="title">Nearest Airports</p>
          <TouchButton variant="bar" label="X" class="nearest-airport-close-button" onPressed={() => {
            this.close();
            this.selectedAirport.set(null);
            this.setSelectedAirportLabels(null);
          }} />
        </div>

        <div class="airport-container">
          <div class="airport-list-placeholder selected-airport-background" ref={this.selectedAirportRef} />
        </div>
        <p class="list-title">{'Brg   Dist       Elev     Rwy Len'}</p>
        <div class="airport-list-container">
          <div class="airport-list-placeholder">
            <div class="white-border-box-background" />
            <Epic2List<any>
              bus={this.props.bus}
              listItemHeightPx={63}
              listItemSpacingPx={2}
              heightPx={63}
              itemsPerPage={1}
              scrollbarStyle="outside"
              data={this.airports}
              renderItem={(data: AirportFacility) => {
                const name = data.name.startsWith('TT') ? Utils.Translate(data.name) : data.name;
                const distance = `${UnitType.NMILE.convertFrom(this.position.get().distance(data.lat, data.lon), UnitType.GA_RADIAN).toFixed(1)} NM`.padEnd(11, ' ');
                const bearing = this.position.get().bearingTo(data.lat, data.lon).toFixed(0).padStart(3, '0');
                const longestRunway = ArrayUtils.peekFirst(data.runways.sort((a, b) => b.length - a.length));
                const elevation = longestRunway ? UnitType.FOOT.convertFrom(longestRunway.elevation, UnitType.METER).toFixed(0) : '----';
                const length = longestRunway ? UnitType.FOOT.convertFrom(longestRunway.length, UnitType.METER).toFixed(0) : '----';

                return (<ListItem>
                  <TouchButton
                    variant='list-button'
                    isHighlighted={this.selectedAirport.map((selected) => data.icao.trim() == selected?.icao.trim())}
                    onPressed={() => this.selectedAirport.set(data)}
                  >
                    <div class='select-airport-holder'>
                      <p>{ICAO.getIdent(data.icao)} {ICAO.getRegionCode(data.icao)}</p>
                      <p>{name.length > 31 ? `${name.slice(0, 28)}...` : name ?? ' '}</p>
                      <p>{bearing}°  {distance}{`${elevation}Ft`.padEnd(9, ' ')}{length}Ft</p>
                    </div>
                  </TouchButton>
                </ListItem>);
              }
              }
            />
          </div>
        </div>

        <TouchButton
          class={'divert-button'}
          variant={'bar-menu'}
          label={'Divert<br />To'}
          onPressed={() => this.divertTo()}
          isEnabled={this.selectedAirport.map((airport) => airport !== null)} />
      </div >
    );
  }
}
