import {
  ArraySubject, ArrivalProcedure, ComponentProps, EnrouteTransition, EventBus, FSComponent, MappedSubject, OneWayRunway, RunwayUtils, SetSubject, Subject,
  Subscribable, VNode
} from '@microsoft/msfs-sdk';

import {
  ApproachListItem, DiamondListItem, Epic2Fms, Epic2FmsUtils, Epic2List, FlightPlanStore, TabContent, TouchButton, TransitionListItem
} from '@microsoft/msfs-epic2-shared';

import './ArrivalTab.css';

/** The properties for the {@link ArrivalTab} component. */
interface ArrivalTabProps extends ComponentProps {
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
  /** Called when arrival is inserted. */
  readonly onInserted: () => void;
  /** Whether RNP (AR) approaches should be selectable. */
  allowRnpAr: boolean;
}

/** Possible types for an element in the approaches list. */
type ApproachListElement = ApproachListItem | TransitionListItem | object;
/** Possible types for an element in the arrivals list. */
type ArrivalListElement = ArrivalProcedure | EnrouteTransition;

/** The ArrivalTab component. */
export class ArrivalTab extends TabContent<ArrivalTabProps> {
  /** Css classes **/
  private readonly cssClassSet = SetSubject.create('');

  private readonly selectedAirport = MappedSubject.create(
    ([planInMod, pendingDest, activeDest]) => {
      return planInMod ? pendingDest : activeDest;
    },
    this.props.fms.planInMod,
    this.props.pendingStore.destinationFacility,
    this.props.activeStore.destinationFacility,
  );
  private readonly destinationRunway = MappedSubject.create(
    ([planInMod, pendingDestRunway, activeDestRunway]) => {
      return planInMod ? pendingDestRunway : activeDestRunway;
    },
    this.props.fms.planInMod,
    this.props.pendingStore.destinationRunway,
    this.props.activeStore.destinationRunway,
  );
  private readonly arrivalProcedure = MappedSubject.create(
    ([planInMod, pendingArrivalProcedure, activeArrivalProcedure]) => {
      return planInMod ? pendingArrivalProcedure : activeArrivalProcedure;
    },
    this.props.fms.planInMod,
    this.props.pendingStore.arrivalProcedure,
    this.props.activeStore.arrivalProcedure,
  );
  private readonly arrivalTransition = MappedSubject.create(
    ([planInMod, pendingArrivalTransition, activeArrivalTransition]) => {
      return planInMod ? pendingArrivalTransition : activeArrivalTransition;
    },
    this.props.fms.planInMod,
    this.props.pendingStore.arrivalTransition,
    this.props.activeStore.arrivalTransition,
  );
  private readonly isApproachLoaded = MappedSubject.create(
    ([planInMod, pendingIsApproachLoaded, activeIsApproachLoaded]) => {
      return planInMod ? pendingIsApproachLoaded : activeIsApproachLoaded;
    },
    this.props.fms.planInMod,
    this.props.pendingStore.isApproachLoaded,
    this.props.activeStore.isApproachLoaded,
  );
  private readonly approachIndex = MappedSubject.create(
    ([planInMod, pendingApproachIndex, activeApproachIndex]) => {
      return planInMod ? pendingApproachIndex : activeApproachIndex;
    },
    this.props.fms.planInMod,
    this.props.pendingStore.approachIndex,
    this.props.activeStore.approachIndex,
  );
  private readonly visualApproachOneWayRunwayDesignation = MappedSubject.create(
    ([planInMod, pendingVisualApproachOneWayRunwayDesignation, activeVisualApproachOneWayRunwayDesignation]) => {
      return planInMod ? pendingVisualApproachOneWayRunwayDesignation : activeVisualApproachOneWayRunwayDesignation;
    },
    this.props.fms.planInMod,
    this.props.pendingStore.visualApproachOneWayRunwayDesignation,
    this.props.activeStore.visualApproachOneWayRunwayDesignation,
  );
  private readonly approachTransitionIndex = MappedSubject.create(
    ([planInMod, pendingApproachTransitionIndex, activeApproachTransitionIndex]) => {
      return planInMod ? pendingApproachTransitionIndex : activeApproachTransitionIndex;
    },
    this.props.fms.planInMod,
    this.props.pendingStore.approachTransitionIndex,
    this.props.activeStore.approachTransitionIndex,
  );

  private readonly selectedRunway = Subject.create<OneWayRunway | undefined>(undefined);
  private readonly selectedArrival = Subject.create<ArrivalProcedure | undefined>(undefined);
  private readonly selectedApproach = Subject.create<ApproachListItem | undefined>(undefined);
  private readonly selectedArrivalIndex = this.selectedArrival.map(x => (x ? this.selectedAirport.get()?.arrivals.indexOf(x) : x) ?? -1);
  private readonly selectedTransition = Subject.create<EnrouteTransition | undefined>(undefined);
  private readonly selectedTransitionIndex = this.selectedTransition.map(x => (x ? this.selectedArrival.get()?.enRouteTransitions.indexOf(x) : x) ?? -1);
  private readonly selectedApproachTransition = Subject.create<TransitionListItem | undefined>(undefined);

  private readonly selectedRunwayTransitionIndex = MappedSubject.create(([runway, arrival]) => {
    return (arrival?.runwayTransitions.findIndex(trans => RunwayUtils.getRunwayNameString(trans.runwayNumber, trans.runwayDesignation) === runway?.designation)) ?? -1;
  }, this.selectedRunway, this.selectedArrival);

  private readonly approachTransitions = this.selectedApproach.map(approach => {
    return Epic2FmsUtils.getApproachTransitionListItems(approach);
  });

  private readonly allOneWayRunways = this.selectedAirport.map(x => x ? RunwayUtils.getOneWayRunwaysFromAirport(x) : []);

  private readonly runways = MappedSubject.create(
    ([allOneWayRunways, selectedRunway, selectedArrival]) => {
      if (selectedRunway) {
        return [selectedRunway];
      }

      if (selectedArrival && selectedArrival.runwayTransitions.length > 0) {
        return allOneWayRunways.filter((runway) => selectedArrival.runwayTransitions.some(
          (trans) => trans.runwayNumber === runway.direction && trans.runwayDesignation === runway.runwayDesignator
        ));
      }
      return allOneWayRunways;
    },
    this.allOneWayRunways,
    this.selectedRunway,
    this.selectedArrival,
  );

  private readonly allApproaches = this.props.allowRnpAr
    ? this.selectedAirport.map(x => Epic2FmsUtils.getApproachListItems(x).sort(Epic2FmsUtils.sortApproachItem))
    : this.selectedAirport.map(x => Epic2FmsUtils.getApproachListItems(x).filter(
      approach => !Epic2FmsUtils.isApproachRnpAr(approach.approach)
    ).sort(Epic2FmsUtils.sortApproachItem));

  private readonly enrouteTransitions = MappedSubject.create(([arrival]) => {
    if (!arrival) { return []; }

    return arrival.enRouteTransitions;
  }, this.selectedArrival);

  // Using null here so that an approach list item effectively takes up two rows in the list
  private readonly approachesAndTransitions = MappedSubject.create(
    ([selectedRunway, selectedApproach, allApproaches, approachTransitions, selectedArrival]) => {
      if (!selectedApproach) {
        let filtered;

        if (selectedRunway) {
          filtered = allApproaches.filter((appr) => appr.approach.runwayNumber === selectedRunway.direction && appr.approach.runwayDesignator === selectedRunway.runwayDesignator);
        } else if (selectedArrival && selectedArrival.runwayTransitions.length > 0) {
          filtered = allApproaches.filter((appr) => selectedArrival.runwayTransitions.some(
            (trans) => trans.runwayNumber === appr.approach.runwayNumber && trans.runwayDesignation === appr.approach.runwayDesignator
          ));
        } else {
          filtered = allApproaches;
        }

        const padded = [] as (ApproachListItem | object)[];
        filtered.forEach(app => {
          padded.push(app);
          padded.push({});
        });
        return padded;
      }

      return [selectedApproach, {}, ...approachTransitions];

    },
    this.selectedRunway,
    this.selectedApproach,
    this.allApproaches,
    this.approachTransitions,
    this.selectedArrival,
  );

  private readonly arrivalsAndTransitions = MappedSubject.create(
    ([airport, selectedArrival, selectedTransition, enrouteTransitions, selectedRunway]) => {
      if (!airport) {
        return [];
      }

      if (!selectedArrival) {
        if (!selectedRunway) {
          return airport.arrivals;
        }
        return airport.arrivals.filter(
          (x) => x.runwayTransitions.length === 0 || x.runwayTransitions.some(
            (trans) => trans.runwayNumber === selectedRunway.direction && trans.runwayDesignation === selectedRunway.runwayDesignator
          )
        );
      }

      if (!selectedTransition) {
        return [selectedArrival, ...enrouteTransitions];
      }

      return [selectedArrival, selectedTransition];
    },
    this.selectedAirport,
    this.selectedArrival,
    this.selectedTransition,
    this.enrouteTransitions,
    this.selectedRunway,
  );

  private readonly runwayListData = ArraySubject.create<OneWayRunway>();
  private readonly approachListData = ArraySubject.create<ApproachListElement>();
  private readonly arrivalListData = ArraySubject.create<ArrivalListElement>();

  /** @inheritdoc */
  public onAfterRender(): void {

    this.selectedAirport.sub(() => this.clearSelections(), true);

    this.props.togglePreview.sub((x) => {
      this.cssClassSet.clear();
      return x ? this.cssClassSet.add('arrival-tab-section-view') : this.cssClassSet.add('arrival-tab-section-runway-sid');
    }, true);

    this.runways.sub(x => this.runwayListData.set(x));
    this.approachesAndTransitions.sub(x => this.approachListData.set(x));
    this.arrivalsAndTransitions.sub(x => this.arrivalListData.set(x));
    this.selectedAirport.sub(() => this.onResume());
  }

  /** @inheritdoc */
  public onResume(): void {
    // Populate selections based on active flight plan
    this.selectedRunway.set(this.destinationRunway.get());

    const arrival = this.arrivalProcedure.get();
    this.selectedArrival.set(arrival);

    const transition = this.arrivalTransition.get();
    if (transition) {
      this.selectedTransition.set(transition);
    }

    this.selectedApproach.set(this.getApproach());
    this.selectedApproachTransition.set(this.getPlanApproachTransition());

    // Just making sure the lists are fresh, might not need this
    this.runwayListData.set(this.runways.get());
    this.approachListData.set(this.approachesAndTransitions.get());
    this.arrivalListData.set(this.arrivalsAndTransitions.get());

  }

  /** @inheritdoc */
  public onPause(): void {
    this.clearSelections();
  }

  /**
   * Choose the appropriate approach to use.
   * @returns The approach to use.
   */
  private getApproach(): ApproachListItem | undefined {
    const planDestinationFacility = this.selectedAirport.get();
    const planHasApproachLoaded = this.isApproachLoaded.get();
    const planApproachIndex = this.approachIndex.get();
    const planVisualApproachOneWayRunwayDesignation = this.visualApproachOneWayRunwayDesignation.get();
    const planDestinationRunway = this.destinationRunway.get();

    const selectedAirport = this.selectedAirport.get();
    const approaches = this.allApproaches.get();

    // 1. If selected airport matches plan approach facility, and plan has an approach, use that
    if (selectedAirport === planDestinationFacility) {
      let approach: ApproachListItem | undefined = undefined;
      if (planHasApproachLoaded) {
        if (planVisualApproachOneWayRunwayDesignation) {
          approach = approaches.find(appr => appr.isVisualApproach === true
            && appr.approach.runway === planVisualApproachOneWayRunwayDesignation);
        } else {
          approach = approaches.find(appr => appr.isVisualApproach === false
            && appr.index === planApproachIndex);
        }
      } else if (planDestinationRunway) {
        approach = approaches.find(appr => {
          return appr.approach.runwayNumber === planDestinationRunway.direction
            && appr.approach.runwayDesignator === planDestinationRunway.runwayDesignator;
        });
      }

      return approach;
    }

    return undefined;
  }

  /**
   * Gets the approach transition list item for the approach transition selected in the flightplan.
   * @returns The selected transition list item, or undefined if none selected.
   */
  private getPlanApproachTransition(): TransitionListItem | undefined {
    const planDestinationFacility = this.selectedAirport.get();
    const isApproachLoaded = this.isApproachLoaded.get();
    const planTransitionIndex = this.approachTransitionIndex.get();
    const selectedAirport = this.selectedAirport.get();

    if (selectedAirport === planDestinationFacility && isApproachLoaded) {
      return this.approachTransitions.get().find((v) => v.transitionIndex === planTransitionIndex);
    }

    return undefined;
  }

  /** Clears all selections. */
  private clearSelections(): void {
    this.selectedRunway.set(undefined);
    this.selectedApproachTransition.set(undefined);
    this.selectedApproach.set(undefined);
    this.selectedTransition.set(undefined);
    this.selectedArrival.set(undefined);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="arrival-tab">
        <div class={this.cssClassSet}>
          <div class="arrival-tab-view">
            <div class="arrival-tab-view-labels">
              <p>Crs</p>
              <p>Dist</p>
              <p>Alt</p>
              <p>Ang</p>
              <p>Spd</p>
            </div>
            <div class="arrival-tab-view-list-placeholder">
              <div class="white-border-box-background" />
              <Epic2List<any>
                class="arrival-view-list"
                bus={this.props.bus}
                listItemHeightPx={24}
                itemsPerPage={8}
                data={this.approachListData}
                renderItem={(data: ArrivalProcedure) => <DiamondListItem label={data.name} isSelected={false} />}
                scrollbarStyle={'inside'} />
            </div>
            <div class="departure-tab-buttons-view">
              <TouchButton variant="bar" label="Insert" />
            </div>
          </div>
          <div class="arrival-tab-runway-sid-section">
            <div class="arrival-tab-runway-sid">
              {/** Runway **/}
              <div class="arrival-tab-selection touch-button-bar-image-border">
                <div class="arrival-tab-selection-heading"><p>Runway</p></div>
                <div class="arrival-tab-list-placeholder">
                  <div class="white-border-box-background" />
                  <Epic2List<any>
                    class="runway-list"
                    bus={this.props.bus}
                    listItemHeightPx={24}
                    itemsPerPage={8}
                    scrollbarStyle={'inside'}
                    data={this.runwayListData}
                    renderItem={(runway: OneWayRunway) =>
                      <DiamondListItem
                        label={runway.designation}
                        isSelected={this.selectedRunway.get() === runway}
                        onPressed={() => {
                          const selectedRunway = this.selectedRunway.get();

                          if (selectedRunway) {
                            this.selectedRunway.set(undefined);
                            this.selectedApproach.set(undefined);
                          } else {
                            this.selectedRunway.set(runway);
                          }
                        }}
                      />
                    }
                  />
                </div>
              </div>
              {/** Approach **/}
              <div class="arrival-tab-selection touch-button-bar-image-border">
                <div class="arrival-tab-selection-heading">
                  <p>Approach</p>
                  <p class="arrival-tab-heading-trans">Trans</p>
                </div>
                <div class="arrival-tab-list-placeholder">
                  <div class="white-border-box-background" />
                  <Epic2List<any>
                    class="approach-list"
                    bus={this.props.bus}
                    listItemHeightPx={24}
                    itemsPerPage={8}
                    scrollbarStyle={'inside'}
                    data={this.approachListData}
                    renderItem={(data: ApproachListElement) => {
                      const isApproach = 'approach' in data;
                      const isTransition = 'name' in data;

                      if (!isApproach && !isTransition) {
                        return <div />;
                      }

                      return <DiamondListItem
                        label={isApproach ? Epic2FmsUtils.getApproachNameForList(data.approach) : data.name}
                        class={isApproach ? 'approach' : 'approach-transition'}
                        isSelected={isApproach
                          ? this.selectedApproach.map(x => x === data)
                          : this.selectedApproachTransition.map(x => x === data)}
                        shape={isTransition ? 'circle' : 'diamond'}
                        onPressed={() => {
                          const selectedApproach = this.selectedApproach.get();
                          if (isApproach) {
                            // is approach
                            if (selectedApproach) {
                              // click on approach deselect approach and trans
                              this.selectedApproach.set(undefined);
                              this.selectedApproachTransition.set(undefined);
                            } else {
                              this.selectedApproach.set(data);
                              // by default no transition is selected
                              this.selectedApproachTransition.set(undefined);
                              // data.approach.runway will store 08R as 8R, so we need to strip the leading zero from the designation
                              this.selectedRunway.set(this.runways.get().find(x => x.designation === data.approach.runway || x.designation.replace(/^0/, '') === data.approach.runway));
                            }
                          } else {
                            // is transition
                            this.selectedApproachTransition.set(data);
                          }
                        }}
                      />;
                    }}
                  />
                </div>
              </div>
              {/** STAR **/}
              <div class="arrival-tab-selection touch-button-bar-image-border">
                <div class="arrival-tab-selection-heading">
                  <p>STAR</p>
                  <p class="arrival-tab-heading-trans">Trans</p>
                </div>
                <div class="arrival-tab-list-placeholder">
                  <div class="white-border-box-background" />
                  <Epic2List<any>
                    class="star-list"
                    bus={this.props.bus}
                    listItemHeightPx={24}
                    itemsPerPage={8}
                    scrollbarStyle={'inside'}
                    data={this.arrivalListData}
                    renderItem={(data: ArrivalListElement) => {
                      const isArrival = 'commonLegs' in data;

                      return <DiamondListItem
                        label={data.name}
                        class={isArrival ? 'arrival' : 'enroute-transition'}
                        isSelected={this.selectedArrival.get() === data || this.selectedTransition.get() === data}
                        onPressed={() => {
                          const selectedArrival = this.selectedArrival.get();
                          const selectedTransition = this.selectedTransition.get();
                          if (isArrival) {
                            // is arrival
                            if (selectedArrival) {
                              // deselect arrival and trans
                              this.selectedArrival.set(undefined);
                              this.selectedTransition.set(undefined);
                            } else {
                              this.selectedArrival.set(data);
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
            <div class="arrival-tab-buttons">
              <TouchButton
                variant="bar"
                label="Delete"
                isEnabled={MappedSubject.create(x => x.some(y => y),
                  this.destinationRunway, this.arrivalProcedure, this.arrivalTransition)}
                onPressed={() => {
                  this.props.fms.removeApproach();
                  this.props.fms.removeArrival();
                  // This deletes the runway leg
                  this.props.fms.setOrigin(this.selectedAirport.get());
                  this.props.onInserted();
                }}
              />
              <TouchButton
                variant="bar"
                label="Clear All"
                isEnabled={MappedSubject.create(x => x.some(y => y),
                  this.selectedRunway, this.selectedArrival, this.selectedApproach)}
                onPressed={() => this.clearSelections()}
              />
              <TouchButton
                variant="bar"
                label="Insert"
                isEnabled={this.selectedRunway.map(x => !!x)}
                onPressed={() => {
                  const selectedAirport = this.selectedAirport.get();
                  const selectedArrival = this.selectedArrival.get();
                  const selectedApproach = this.selectedApproach.get();
                  const selectedApproachTransition = this.selectedApproachTransition.get();
                  const selectedRunway = this.selectedRunway.get();

                  const isVisualApproach = selectedApproach?.isVisualApproach;

                  if (selectedAirport) {
                    if (selectedArrival) {
                      this.props.fms.insertArrival(
                        selectedAirport,
                        this.selectedArrivalIndex.get(),
                        this.selectedRunwayTransitionIndex.get(),
                        this.selectedTransitionIndex.get(),
                        selectedRunway,
                      );
                    } else {
                      this.props.fms.clearArrival();
                    }

                    if (selectedApproach) {
                      this.props.fms.insertApproach({
                        facility: selectedAirport,
                        approachIndex: selectedApproach.index,
                        approachTransitionIndex: selectedApproachTransition ? selectedApproachTransition.transitionIndex : -1,
                        visualRunwayNumber: isVisualApproach ? selectedApproach.approach.runwayNumber : undefined,
                        visualRunwayDesignator: isVisualApproach ? selectedApproach.approach.runwayDesignator : undefined,
                        visualRunwayOffset: undefined,
                        vfrVerticalPathAngle: undefined,
                      });
                    } else {
                      this.props.fms.clearApproach();
                      this.props.fms.setDestination(selectedAirport, selectedRunway);
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
