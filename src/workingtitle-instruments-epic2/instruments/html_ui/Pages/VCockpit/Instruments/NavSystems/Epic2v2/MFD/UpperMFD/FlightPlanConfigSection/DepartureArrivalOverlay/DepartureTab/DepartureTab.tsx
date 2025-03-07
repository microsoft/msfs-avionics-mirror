import {
  ArraySubject, ComponentProps, DepartureProcedure, EnrouteTransition, EventBus, FSComponent, MappedSubject, OneWayRunway, RunwayUtils, SetSubject, Subject,
  Subscribable, VNode
} from '@microsoft/msfs-sdk';

import { DiamondListItem, Epic2Fms, Epic2List, FlightPlanStore, TabContent, TouchButton } from '@microsoft/msfs-epic2-shared';

import './DepartureTab.css';

/** The properties for the {@link DepartureTab} component. */
interface DepartureTabProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
  /** The FMS. */
  readonly fms: Epic2Fms;
  /** Show/hide the flight plan preview */
  readonly togglePreview: Subscribable<boolean>;
  /** The active flight plan store.  */
  readonly activeStore: FlightPlanStore;
  /** The pending flight plan store.  */
  readonly pendingStore: FlightPlanStore;
  /** Called when departure is inserted. */
  readonly onInserted: () => void;
}

/** The DepartureTab component. */
export class DepartureTab extends TabContent<DepartureTabProps> {
  /** Css classes **/
  private readonly cssClassSet = SetSubject.create('');

  private readonly selectedAirport = MappedSubject.create(
    ([planInMod, pendingOrigin, activeOrigin]) => {
      return planInMod ? pendingOrigin : activeOrigin;
    },
    this.props.fms.planInMod,
    this.props.pendingStore.originFacility,
    this.props.activeStore.originFacility,
  );
  private readonly originRunway = MappedSubject.create(
    ([planInMod, pendingOriginRunway, activeOriginRunway]) => {
      return planInMod ? pendingOriginRunway : activeOriginRunway;
    },
    this.props.fms.planInMod,
    this.props.pendingStore.originRunway,
    this.props.activeStore.originRunway,
  );
  private readonly departureProcedure = MappedSubject.create(
    ([planInMod, pendingDepartureProcedure, activeDepartureProcedure]) => {
      return planInMod ? pendingDepartureProcedure : activeDepartureProcedure;
    },
    this.props.fms.planInMod,
    this.props.pendingStore.departureProcedure,
    this.props.activeStore.departureProcedure,
  );
  private readonly departureTransition = MappedSubject.create(
    ([planInMod, pendingDepartureTransition, activeDepartureTransition]) => {
      return planInMod ? pendingDepartureTransition : activeDepartureTransition;
    },
    this.props.fms.planInMod,
    this.props.pendingStore.departureTransition,
    this.props.activeStore.departureTransition,
  );

  private readonly selectedRunway = Subject.create<OneWayRunway | undefined>(undefined);
  private readonly selectedDeparture = Subject.create<DepartureProcedure | undefined>(undefined);
  private readonly selectedDepartureIndex = this.selectedDeparture.map(x => (x ? this.selectedAirport.get()?.departures.indexOf(x) : x) ?? -1);
  private readonly selectedTransition = Subject.create<EnrouteTransition | undefined>(undefined);
  private readonly selectedTransitionIndex = this.selectedTransition.map(x => (x ? this.selectedDeparture.get()?.enRouteTransitions.indexOf(x) : x) ?? -1);

  private readonly selectedRunwayTransitionIndex = MappedSubject.create(([runway, departure]) => {
    return (departure?.runwayTransitions.findIndex(trans => RunwayUtils.getRunwayNameString(trans.runwayNumber, trans.runwayDesignation) === runway?.designation)) ?? -1;
  }, this.selectedRunway, this.selectedDeparture);

  private readonly allOneWayRunways = this.selectedAirport.map(x => x ? RunwayUtils.getOneWayRunwaysFromAirport(x) : []);

  private readonly runways = MappedSubject.create(([allOneWayRunways, selectedRunway]) => {
    return selectedRunway
      ? [selectedRunway]
      : allOneWayRunways;
  }, this.allOneWayRunways, this.selectedRunway);

  private readonly enrouteTransitions = MappedSubject.create(([departure]) => {
    if (!departure) { return []; }

    return departure.enRouteTransitions;
  }, this.selectedDeparture);

  private readonly departuresAndTransitions = MappedSubject.create(([airport, runway, selectedDeparture, selectedTransition, enrouteTransitions]) => {
    if (!airport || !runway) { return []; }

    if (!selectedDeparture) {
      return airport.departures.filter(x => x.runwayTransitions.length === 0 || x.runwayTransitions.some(
        trans => RunwayUtils.getRunwayNameString(trans.runwayNumber, trans.runwayDesignation) === runway.designation));
    }

    if (!selectedTransition) {
      return [selectedDeparture, ...enrouteTransitions];
    }

    return [selectedDeparture, selectedTransition];
  }, this.selectedAirport, this.selectedRunway, this.selectedDeparture, this.selectedTransition, this.enrouteTransitions);

  private readonly runwayListData = ArraySubject.create<OneWayRunway>();
  private readonly departureListData = ArraySubject.create<DepartureProcedure | EnrouteTransition>();

  /** @inheritdoc */
  public onAfterRender(): void {

    this.selectedAirport.sub(() => this.clearSelections(), true);

    this.props.togglePreview.sub((x) => {
      this.cssClassSet.clear();
      return x ? this.cssClassSet.add('departure-tab-section-view') : this.cssClassSet.add('departure-tab-section-runway-sid');
    }, true);

    this.runways.sub(x => this.runwayListData.set(x));
    this.departuresAndTransitions.sub(x => this.departureListData.set(x));
    this.selectedAirport.sub(() => this.onResume());
  }

  /** @inheritdoc */
  public onResume(): void {
    // Populate selections based on active flight plan
    this.selectedRunway.set(this.originRunway.get());

    const departure = this.departureProcedure.get();
    this.selectedDeparture.set(departure);

    const transition = this.departureTransition.get();
    if (transition) {
      this.selectedTransition.set(transition);
    } else if (departure) {
      this.selectedTransition.set(undefined);
    }

    // Just making sure the lists are fresh, might not need this
    this.runwayListData.set(this.runways.get());
    this.departureListData.set(this.departuresAndTransitions.get());
  }

  /** @inheritdoc */
  public onPause(): void {
    this.clearSelections();
  }

  /** Clears all selections. */
  private clearSelections(): void {
    this.selectedRunway.set(undefined);
    this.selectedDeparture.set(undefined);
    this.selectedTransition.set(undefined);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="departure-tab">
        <div class={this.cssClassSet}>
          <div class="departure-tab-view">
            <div class="departure-tab-view-labels">
              <p>Crs</p>
              <p>Dist</p>
              <p>Alt</p>
              <p>Ang</p>
              <p>Spd</p>
            </div>
            <div class="departure-tab-view-list-placeholder">
              <div class="white-border-box-background" />
              <Epic2List<any>
                class="departure-view-list"
                bus={this.props.bus}
                listItemHeightPx={24}
                itemsPerPage={8}
                scrollbarStyle="inside"
                data={this.departureListData}
                renderItem={(data: DepartureProcedure) => <DiamondListItem label={data.name} isSelected={false} />}
              />
            </div>
            <div class="departure-tab-buttons-view">
              <TouchButton variant="bar" label="Insert" />
            </div>
          </div>
          <div class="departure-tab-runway-sid-section">
            <div class="departure-tab-runway-sid">
              <div class="departure-tab-selection touch-button-bar-image-border">
                <div class="departure-tab-selection-heading"><p>Runway</p></div>
                <div class="departure-tab-list-placeholder">
                  <div class="white-border-box-background" />
                  <Epic2List<any>
                    class="runway-list"
                    bus={this.props.bus}
                    listItemHeightPx={24}
                    itemsPerPage={8}
                    scrollbarStyle="inside"
                    data={this.runwayListData}
                    renderItem={(data: OneWayRunway) =>
                      <DiamondListItem
                        label={data.designation}
                        isSelected={this.selectedRunway.get() === data}
                        onPressed={() => this.selectedRunway.set(this.selectedRunway.get() ? undefined : data)}
                      />
                    }
                  />
                </div>
              </div>
              <div class="departure-tab-selection touch-button-bar-image-border">
                <div class="departure-tab-selection-heading">
                  <p>SID</p>
                  <p class="departure-tab-heading-trans">Trans</p>
                </div>
                <div class="departure-tab-list-placeholder">
                  <div class="white-border-box-background" />
                  <Epic2List<any>
                    class="departure-list"
                    bus={this.props.bus}
                    listItemHeightPx={24}
                    itemsPerPage={8}
                    scrollbarStyle="inside"
                    data={this.departureListData}
                    renderItem={(data: DepartureProcedure | EnrouteTransition) => {
                      const isDeparture = 'commonLegs' in data;

                      return <DiamondListItem
                        label={data.name}
                        class={isDeparture ? 'departure' : 'enroute-transition'}
                        isSelected={this.selectedDeparture.get() === data || this.selectedTransition.get() === data}
                        onPressed={() => {
                          const selectedDeparture = this.selectedDeparture.get();
                          const selectedTransition = this.selectedTransition.get();
                          if (isDeparture) {
                            // is departure
                            if (selectedDeparture) {
                              // deselect dep and trans
                              this.selectedDeparture.set(undefined);
                              this.selectedTransition.set(undefined);
                            } else {
                              this.selectedDeparture.set(data);
                              this.selectedTransition.set(undefined);
                            }
                          } else {
                            // is transition
                            if (selectedTransition) {
                              this.selectedTransition.set(undefined);

                            } else {
                              this.selectedTransition.set(data);
                            }
                          }
                        }}
                      />;
                    }}
                  />
                </div>
              </div>
            </div>
            <div class="departure-tab-buttons">
              <TouchButton
                variant="bar"
                label="Delete"
                isEnabled={MappedSubject.create(x => x.some(y => y),
                  this.originRunway, this.departureProcedure, this.departureTransition)}
                onPressed={() => {
                  this.props.fms.removeDeparture();
                  // This deletes the runway leg
                  this.props.fms.setOrigin(this.selectedAirport.get());
                  this.props.onInserted();
                }}
              />
              <TouchButton
                variant="bar"
                label="Clear All"
                isEnabled={MappedSubject.create(x => x.some(y => y),
                  this.selectedRunway, this.selectedDeparture, this.selectedTransition)}
                onPressed={() => this.clearSelections()}
              />
              <TouchButton
                variant="bar"
                label="Insert"
                isEnabled={this.selectedRunway.map(x => !!x)}
                onPressed={() => {
                  const selectedAirport = this.selectedAirport.get();
                  const selectedDeparture = this.selectedDeparture.get();

                  if (selectedAirport) {
                    if (selectedDeparture) {
                      this.props.fms.insertDeparture(
                        selectedAirport,
                        this.selectedDepartureIndex.get(),
                        this.selectedRunwayTransitionIndex.get(),
                        this.selectedTransitionIndex.get(),
                        this.selectedRunway.get(),
                      );
                    } else {
                      this.props.fms.setOrigin(this.selectedAirport.get(), this.selectedRunway.get());
                    }

                    this.props.onInserted();
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
