import {
  AbstractFmcPage, AirportFacility, AirwayData, BitFlags, ComputedSubject, ConsumerSubject, DisplayField,
  EventBus, FacilitySearchType, FacilityType,
  FixTypeFlags, FlightPathUtils, FlightPlanActiveLegEvent, FlightPlanCalculatedEvent, FlightPlanCopiedEvent,
  FlightPlanLegEvent, FlightPlannerEvents,
  FlightPlanSegmentType, FlightPlanUserDataEvent, FmcListUtility, FmcRenderTemplate, FmcRenderTemplateRow, GeoPoint,
  GNSSEvents, ICAO, LegDefinition, LegType,
  Subject, TextInputField, UnitType
} from '@microsoft/msfs-sdk';

import { WT21FmsUtils, WT21LegDefinitionFlags } from '@microsoft/msfs-wt21-shared';

import { WT21Fms } from '../FlightPlan/WT21Fms';
import { RawFormatter, StringInputFormat } from '../Framework/FmcFormats';
import { WT21PilotWaypointUtils } from '../Navigation/WT21PilotWaypointUtils';
import { WT21FmcPage } from '../WT21FmcPage';
import { FplnPage } from './FplnPage';
import { FplnPageStore, RoutePageLegItem } from './FplnPageStore';

/**
 * FPLN page controller
 */
export class FplnPageController {
  private static readonly geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0)];

  static readonly discontinuityHeader = '---- DISCONTINUITY -----';
  static readonly discoIdentString = '□□□□□';
  static readonly emptyIdentString = '-----';
  static readonly emptyAirwayString = '-----';
  static readonly activeHeaderString = ' ACT FPLN[blue]';
  static readonly modHeaderString = ' MOD[white] FPLN[blue]';

  public readonly currentPage = Subject.create(1);
  public readonly pageCount = ComputedSubject.create<number, number>(0, (v): number => {
    return Math.max(1, 1 + (Math.ceil((v - 1) / 5)));
  });

  public destinationField = new TextInputField<string | null>(this.page, {
    formatter: new StringInputFormat({ nullValueString: '□□□□' }),
    onSelected: async (scratchpadContents): Promise<string | boolean> => {
      if (scratchpadContents.length === 0) {
        const plan = this.fms.getPlanForFmcRender();

        if (plan.destinationAirport) {
          return ICAO.getIdent(plan.destinationAirport);
        }
      }
      return this.setDestination(scratchpadContents, false);
    },
    onDelete: (): Promise<string | boolean> => this.setDestination(null, true),
  });

  public readonly altnField = new TextInputField<string | null>(this.page, {
    formatter: new StringInputFormat({ nullValueString: '----' }),
    onSelected: async (scratchpadContents): Promise<string | boolean> => {
      if (scratchpadContents.length === 0) {
        const altnIcao = this.fms.getFlightPlanAlternate(this.fms.getPlanIndexForFmcPage());

        if (altnIcao) {
          return ICAO.getIdent(altnIcao);
        }
      }

      const facility = await this.page.screen.selectWptFromIdent(scratchpadContents, this.fms.ppos, FacilitySearchType.Airport);

      if (facility) {
        this.fms.setFlightPlanAlternate(facility);
        return true;
      } else {
        return Promise.reject('FACILITY NOT FOUND');
      }
    },
    onDelete: async (): Promise<string | boolean> => {
      this.fms.setFlightPlanAlternate(undefined);
      return true;
    },
  }).bind(this.store.altn);

  private legChangeConsumerFpln = this.eventBus.getSubscriber<FlightPlannerEvents>().on('fplLegChange');
  private activeLegChangeConsumerFpln = this.eventBus.getSubscriber<FlightPlannerEvents>().on('fplActiveLegChange');
  private originDestinationChangeConsumerFpln = this.eventBus.getSubscriber<FlightPlannerEvents>().on('fplOriginDestChanged');
  private planCopiedConsumerFpln = this.eventBus.getSubscriber<FlightPlannerEvents>().on('fplCopied');
  private planCalculatedConsumerFpln = this.eventBus.getSubscriber<FlightPlannerEvents>().on('fplCalculated');
  private planUserDataSetConsumerFpln = this.eventBus.getSubscriber<FlightPlannerEvents>().on('fplUserDataSet');
  private listConsumer = this.store.legs;
  private destinationConsumer = this.store.destination;
  private planChanged = false;

  private readonly ppos = ConsumerSubject.create(this.eventBus.getSubscriber<GNSSEvents>().on('gps-position'), new LatLongAlt());

  public renderRow = (page: AbstractFmcPage, indexInDisplay: number, prevData: RoutePageLegItem | undefined, data: RoutePageLegItem | undefined): FmcRenderTemplateRow[] => {
    if (data !== undefined) {
      const title = new DisplayField(this.page, {
        formatter: RawFormatter,
        onSelected: (scratchpadContents) => this.onAirwayInput(data, scratchpadContents, false),
        onDelete: () => this.onAirwayInput(data, '', true),
      });
      const name = new DisplayField(this.page, {
        formatter: RawFormatter,
        onSelected: (scratchpadContents) => this.onWaypointInput(data, scratchpadContents, false),
        onDelete: () => this.onWaypointInput(data, '', true),
      });
      const header = new DisplayField(this.page, {
        formatter: RawFormatter,
      });

      if (data.legDefinition) {
        if (data.legDefinition.leg.type === LegType.Discontinuity) {
          title.takeValue(FplnPageController.emptyAirwayString);
          name.takeValue(FplnPageController.discoIdentString);
        } else {
          title.takeValue(data.title ?? '');
          name.takeValue(data.legDefinition.name ?? '');
        }
      } else if (data.isPlanEnd) {
        title.takeValue(FplnPageController.emptyAirwayString);
        name.takeValue(FplnPageController.emptyIdentString);
      } else {
        title.takeValue(data.title ?? '');
        name.takeValue(data.title ? FplnPageController.discoIdentString : '');
      }

      title.getOptions().style = data.isActive ? '[magenta]' : '';
      name.getOptions().style = data.isActive ? '[magenta]' : '';
      header.takeValue(data.lastRowWasDiscontinuity ? FplnPageController.discontinuityHeader : '');
      if (data.isFirstRow) {
        return [[' VIA[s-text blue]', 'TO[s-text blue] ', header], [title, name]];
      } else {
        return [[header], [title, name]];
      }
    }
    return [[''], ['']];
  };

  public fplnLegList = new FmcListUtility(this.page, this.store.legs, this.renderRow, 5, 1);

  private airwayInEdit: AirwayData | undefined;
  private airwayEntryLeg: LegDefinition | undefined;
  private airwayInEditRow = -1;

  /**
   * Creates the Controller.
   * @param eventBus The event bus
   * @param fms The FMS.
   * @param store The store.
   * @param page The FMC Page.
   */
  constructor(private readonly eventBus: EventBus, private readonly fms: WT21Fms, private readonly store: FplnPageStore,
    private readonly page: WT21FmcPage) {

    this.page.addBinding(this.legChangeConsumerFpln.handle(this.handleFlightPlanChangeEvent));
    this.page.addBinding(this.activeLegChangeConsumerFpln.handle(this.handleFlightPlanChangeEvent));
    this.page.addBinding(this.originDestinationChangeConsumerFpln.handle(this.handleFlightPlanChangeEvent));
    this.page.addBinding(this.planCopiedConsumerFpln.handle(this.handleFlightPlanCopiedEvent));
    this.page.addBinding(this.planCalculatedConsumerFpln.handle(this.handleFlightPlanCalculated));
    this.page.addBinding(this.planUserDataSetConsumerFpln.handle(this.handleFlightPlanUserDataSet));
    this.page.addBinding(this.currentPage.sub(this.handleCurrentPageChange));
    this.page.addBinding(this.listConsumer.sub(this.handleOnListUpdate));
    this.page.addBinding(this.destinationConsumer.sub(this.handleDestinationChanged));
  }

  /**
   * Initializes the Controller
   */
  public init(): void {
    this.getData();
  }

  /**
   * Destroys the Controller.
   */
  public destroy(): void {
    // noop
  }

  /**
   * Handles when the OriginDestination Event is received over the bus
   * @param event is the FlightPlanOriginDestEvent
   */
  private handleFlightPlanChangeEvent = (event: FlightPlanLegEvent | FlightPlanActiveLegEvent | FlightPlanCalculatedEvent): void => {
    if (event.planIndex === this.fms.getPlanIndexForFmcPage()) {
      this.planChanged = true;
    }
  };

  private handleFlightPlanCopiedEvent = (event: FlightPlanCopiedEvent): void => {
    if (event.targetPlanIndex === WT21FmsUtils.PRIMARY_MOD_PLAN_INDEX && this.airwayInEdit && this.airwayEntryLeg) {
      return;
    }
    this.planChanged = true;
  };

  private handleFlightPlanCalculated = (event: FlightPlanCalculatedEvent): void => {
    if (event.planIndex === this.fms.getPlanIndexForFmcPage() && this.planChanged) {
      this.getData();
    }
  };

  private handleFlightPlanUserDataSet = (event: FlightPlanUserDataEvent): void => {
    if (event.planIndex === this.fms.getPlanIndexForFmcPage() && event.key === WT21FmsUtils.USER_DATA_KEY_ALTN) {
      if (event.data && ICAO.isFacility(event.data as string)) {
        this.store.altn.set(ICAO.getIdent(event.data as string));
      } else {
        this.store.altn.set(null);
      }
    }
  };

  private handleCurrentPageChange = (): void => {
    this.invalidate();
  };

  private handleOnListUpdate = (): void => {
    this.invalidate();
  };

  private handleDestinationChanged = (dest: string | null): void => {
    this.destinationField.takeValue(dest !== null ? dest.trim() : null);
  };

  /**
   * Local invalidate method
   */
  private invalidate(): void {
    this.page.invalidate();
  }

  /**
   * Renders the Page
   * @returns The FmcRenderTemplate
   */
  public renderPage(): FmcRenderTemplate {
    const page = this.page as FplnPage;
    const template: FmcRenderTemplate = [[page.pageHeaderDisplay, page.FplnPagingIndicator]];
    this.fplnLegList.renderList(this.currentPage.get()).forEach(row => template.push(row));
    template.push(['-----------------------[blue]']);
    template.push([page.cancelModDisplay, page.perfInitLink]);
    return template;
  }

  /**
   * Method to get the flight plan data on initial open.
   */
  private getData(): void {
    if (this.fms.hasFlightPlan(this.fms.getPlanIndexForFmcPage())) {
      const plan = this.fms.getPlanForFmcRender();
      this.store.origin.set(plan.originAirport ? ICAO.getIdent(plan.originAirport) : null);
      this.store.destination.set(plan.destinationAirport ? ICAO.getIdent(plan.destinationAirport) : null);
      this.store.altn.set(plan.getUserData('wt21.altn') ? ICAO.getIdent(plan.getUserData(WT21FmsUtils.USER_DATA_KEY_ALTN) as string) : null);
      if (plan.originAirport && plan.destinationAirport) {
        const originFac = this.fms.facilityInfo.originFacility;
        const destFac = this.fms.facilityInfo.destinationFacility;
        if (originFac && destFac) {
          this.calculateDistance(originFac, destFac);
        }
      } else {
        this.store.distance.set(0);
      }
    }
    this.airwayInEdit = undefined;
    this.airwayInEditRow = -1;
    this.airwayEntryLeg = undefined;
    this.planChanged = false;
    this.loadLegs();
  }

  /**
   * Calculates the distance between Origin and Destination and sets the distance in the store.
   * @param originFac The origin facility.
   * @param destFac The destination facility.
   */
  private calculateDistance(originFac: AirportFacility, destFac: AirportFacility): void {
    FplnPageController.geoPointCache[1].set(originFac.lat, originFac.lon);
    const distance = UnitType.GA_RADIAN.convertTo(FplnPageController.geoPointCache[1].distance(destFac.lat, destFac.lon), UnitType.NMILE);
    this.store.distance.set(distance);
  }

  /**
   * Method to populate the legs array with the flight plan legs.
   */
  private loadLegs(): void {
    const plan = this.fms.getPlanForFmcRender();
    const legs: RoutePageLegItem[] = [];
    let lastLegWasDiscontinuity = false;

    const isFirstRow = (): boolean => {
      if (legs.length === 1 || (legs.length - 1) % 5 === 0) {
        return true;
      } else {
        return false;
      }
    };

    const isDiscontinuity = (): boolean => {
      if (lastLegWasDiscontinuity) {
        return true;
      } else {
        return false;
      }
    };

    const activeLegIndex = plan.activeLateralLeg;
    const activeLeg = plan.tryGetLeg(activeLegIndex);

    if (activeLeg === null) {
      this.store.setLegs(legs);
      this.store.originRunway.set('');
      this.invalidate();
      return;
    }

    const activeSegmentIndex = plan.getSegmentIndex(activeLegIndex);
    const activeSegment = plan.getSegment(activeSegmentIndex);

    for (let s = activeSegmentIndex; s < plan.segmentCount; s++) {
      const segment = plan.getSegment(s);
      const segmentType = segment.segmentType;

      let procedureAdded = false;

      const segmentIsAirway = segmentType === FlightPlanSegmentType.Enroute && segment.airway !== undefined;

      const startSegmentLegIndex = segmentIsAirway && segment.legs.length > 0 ? segment.legs.length - 1
        : s === activeSegmentIndex ? activeLegIndex - activeSegment.offset
          : 0;

      for (let l = startSegmentLegIndex; l < segment.legs.length; l++) {
        const leg = segment.legs[l];

        if (segmentIsAirway) {
          legs.push(new RoutePageLegItem(
            segment.offset + l,
            segment.segmentIndex,
            l,
            false,
            false,
            isFirstRow(),
            (activeLegIndex >= segment.offset && activeLegIndex < segment.offset + segment.legs.length),
            segmentType,
            leg,
            segment.airway
          ));
          lastLegWasDiscontinuity = false;
          break;
        }

        if (!procedureAdded && BitFlags.isAny(leg.flags, WT21LegDefinitionFlags.ProcedureLeg)) {
          let procedureEndIndex = -1;
          for (let p = l + 1; p < segment.legs.length; p++) {
            if (!segment.legs[p].flags || !BitFlags.isAny(segment.legs[p].flags, WT21LegDefinitionFlags.ProcedureLeg)) {
              procedureEndIndex = p - 1;
              break;
            }
            if (segmentType === FlightPlanSegmentType.Approach && BitFlags.isAny(segment.legs[p].leg.fixTypeFlags, FixTypeFlags.MAP)) {
              procedureEndIndex = p;
              break;
            }
          }

          if (procedureEndIndex < 0) {
            procedureEndIndex = segment.legs.length - 1;
          }

          while (segment.legs[procedureEndIndex].leg.type === LegType.Discontinuity) {
            procedureEndIndex--;
          }

          const procedureIndexes = WT21FmsUtils.getProcedureIndexAndTransitionIndexFromSegmentType(segmentType, plan);

          if (!isDiscontinuity() && segmentType !== FlightPlanSegmentType.Departure) {
            legs.push(new RoutePageLegItem(
              segment.offset + l,
              segment.segmentIndex,
              l,
              false,
              false,
              isFirstRow(),
              (segment.offset + l === activeLegIndex),
              segmentType,
              leg,
              'DIRECT'
            ));
            lastLegWasDiscontinuity = false;
          }

          legs.push(new RoutePageLegItem(
            segment.offset + procedureEndIndex,
            segment.segmentIndex,
            procedureEndIndex,
            isDiscontinuity(),
            false,
            isFirstRow(),
            (activeLegIndex >= segment.offset + l && activeLegIndex <= segment.offset + procedureEndIndex),
            segmentType,
            segment.legs[procedureEndIndex],
            WT21FmsUtils.getProcedureNameAsString(segmentType,
              segmentType === FlightPlanSegmentType.Departure ? this.fms.facilityInfo.originFacility : this.fms.facilityInfo.destinationFacility,
              procedureIndexes[0],
              procedureIndexes[1]
            )));
          procedureAdded = true;
          lastLegWasDiscontinuity = false;

          if (segmentType === FlightPlanSegmentType.Approach && procedureAdded) {

            for (let m = procedureEndIndex + 1; m < segment.legs.length; m++) {
              if (BitFlags.isAll(segment.legs[m].leg.fixTypeFlags, FixTypeFlags.MAHP)) {

                procedureEndIndex = m;

                const nextLeg = segment.legs[procedureEndIndex + 1];

                if (nextLeg !== undefined && nextLeg.leg.fixIcao === segment.legs[m].leg.fixIcao) {
                  procedureEndIndex++;
                }

                legs.push(new RoutePageLegItem(
                  segment.offset + procedureEndIndex,
                  segment.segmentIndex,
                  procedureEndIndex,
                  isDiscontinuity(),
                  false,
                  isFirstRow(),
                  (activeLegIndex >= segment.offset + l && activeLegIndex <= segment.offset + procedureEndIndex),
                  segmentType,
                  segment.legs[procedureEndIndex],
                  'MISSED APPROACH'));
                lastLegWasDiscontinuity = false;
                break;
              }
            }

          }

          if (procedureEndIndex >= segment.legs.length - 1) {
            break;
          } else {
            l = procedureEndIndex;
            continue;
          }

        } else {
          // filter out origin or rwy
          if (segmentType === FlightPlanSegmentType.Departure && l === 0) {
            continue;
          }
          legs.push(new RoutePageLegItem(
            segment.offset + l,
            segment.segmentIndex,
            l,
            isDiscontinuity(),
            false,
            isFirstRow(),
            (segment.offset + l === activeLegIndex),
            segmentType,
            leg,
            'DIRECT'));

          lastLegWasDiscontinuity = leg.leg.type === LegType.Discontinuity;
        }
      }
    }

    if (legs.length > 0) {
      legs[legs.length - 1].isPlanEnd = true;
    }

    legs.push(new RoutePageLegItem(-1, -1, -1, false, true, legs.length === 1 || legs.length - 1 % 5 === 0, false));

    this.pageCount.set(legs.length);

    for (let e = legs.length; e < 1 + ((this.pageCount.get() - 1) * 5); e++) {
      if (e === 1 || e - 1 % 5 === 0) {
        legs.push(new RoutePageLegItem(-1, -1, -1, false, false, true, false));
      } else {
        legs.push(new RoutePageLegItem(-1, -1, -1, false, false, false, false));
      }
    }

    this.store.setLegs(legs);

    this.store.originRunway.set(plan.procedureDetails.originRunway?.designation ? `RW${plan.procedureDetails.originRunway.designation}` : '');
    this.invalidate();
  }



  public onAirwayInput = (data: RoutePageLegItem | undefined, scratchpadContents: string, isDelete?: boolean): Promise<boolean | string> => {
    if (data !== undefined && isDelete) {
      return this.deleteAirway(data);
    } else if (data !== undefined && scratchpadContents) {
      return this.takeAirwayEntry(data, scratchpadContents);
    }
    return Promise.reject(false);
  };

  /**
   * Takes a waypoint.
   * @param data The RoutePageLegItem.
   * @param scratchpadContents The Scratchpad Contents.
   * @param isDelete Whether this is a delete.
   * @returns Whether this entry was successfully completed.
   */
  public onWaypointInput(data: RoutePageLegItem | undefined, scratchpadContents: string, isDelete?: boolean): Promise<boolean | string> {
    if (data !== undefined && isDelete) {
      return this.deleteLeg(data);
    } else if (data !== undefined && scratchpadContents) {
      return this.takeLegEntry(data, scratchpadContents);
    } else if (data === undefined && scratchpadContents) {
      const emptyItem = new RoutePageLegItem(-1, -1, -1, false, false, false, false, undefined, undefined, undefined);
      return this.takeLegEntry(emptyItem, scratchpadContents);
    }
    return Promise.reject(false);
  }

  /**
   * Takes an airway.
   * @param displayItem The Selected Display Item
   * @param scratchpadContents The Scratchpad Contents
   * @returns Whether this leg entry was successful
   */
  private async takeAirwayEntry(displayItem: RoutePageLegItem, scratchpadContents: string): Promise<boolean | string> {

    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    const legsArray = this.store.legs.getArray();
    const entryLeg = this.store.legs.tryGet(legsArray.indexOf(displayItem) - 1);
    const insertIndex = legsArray.indexOf(displayItem);

    if (entryLeg) {
      const plan = this.fms.getPlanForFmcRender();
      const segment = plan.getSegment(entryLeg.segmentIndex);
      if (segment.segmentType === FlightPlanSegmentType.Enroute || segment.segmentType === FlightPlanSegmentType.Departure) {
        const entry = plan.getLeg(entryLeg.globalIndex);
        const airwayInEdit = await WT21FmsUtils.isAirwayAtLeg(this.fms.facLoader, entry.leg.fixIcao, scratchpadContents);
        if (airwayInEdit) {

          this.airwayInEdit = airwayInEdit;
          this.airwayInEditRow = insertIndex;
          this.airwayEntryLeg = entry;

          this.store.insertLegAt(this.airwayInEditRow,
            new RoutePageLegItem(entryLeg.globalIndex + 1, -1, -1, false, false, false, false, undefined, undefined, scratchpadContents));

          for (let l = 0; l < legsArray.length; l++) {
            legsArray[l].isFirstRow = l === 1 || l - 1 % 5 === 0;
          }

          if (!this.fms.planInMod.get()) {
            this.fms.getModFlightPlan();
          }

          this.invalidate();

          return Promise.resolve(true);
        } else { return Promise.reject('AIRWAY NOT FOUND'); }
      }
    }
    return Promise.reject('INVALID AIRWAY LOCATION');

  }

  /**
   * Takes a leg entry.
   * @param displayItem The Selected Display Item
   * @param scratchpadContents The Scratchpad Contents
   * @returns Whether this leg entry was successful
   */
  private async takeLegEntry(displayItem: RoutePageLegItem, scratchpadContents: string): Promise<boolean | string> {
    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    const legsArray = this.store.legs.getArray();

    if (this.airwayInEdit && this.airwayEntryLeg) {
      // case where we're entering an airway exit

      if (this.airwayInEditRow === legsArray.indexOf(displayItem)) {
        const exitFacility = WT21FmsUtils.matchIdentToAirway(this.airwayInEdit, scratchpadContents);

        if (exitFacility) {
          const entryFacility = await this.fms.facLoader.getFacility(FacilityType.Intersection, this.airwayEntryLeg.leg.fixIcao);
          const airwayEntryLeg = this.store.legs.tryGet(legsArray.indexOf(displayItem) - 1);
          if (airwayEntryLeg && entryFacility) {
            this.fms.insertAirwaySegment(this.airwayInEdit, entryFacility, exitFacility, airwayEntryLeg.segmentIndex, airwayEntryLeg.segmentLegIndex);
            this.airwayInEdit = undefined;
            this.airwayInEditRow = -1;
            this.airwayEntryLeg = undefined;
            return Promise.resolve(true);
          }
        }
        return Promise.reject('INVALID AIRWAY EXIT');
      } else {
        return Promise.reject('INVALID LINE SELECTED');
      }

    } else {
      // DCT case

      let pos: GeoPoint | undefined;

      let plan = this.fms.getPlanForFmcRender();
      const prevLegIndex = (displayItem.globalIndex >= 0 ? displayItem.globalIndex : plan.length) - 1;
      if (prevLegIndex >= 0 && prevLegIndex < plan.length) {
        const prevLeg = plan.getLeg(prevLegIndex);
        pos = prevLeg.calculated ? FlightPathUtils.getLegFinalPosition(prevLeg.calculated, FplnPageController.geoPointCache[0]) : undefined;
        if (!pos) {
          switch (prevLeg.leg.type) {
            case LegType.IF:
            case LegType.TF:
            case LegType.DF:
            case LegType.CF:
            case LegType.AF:
            case LegType.RF:
            case LegType.HF:
            case LegType.HM:
            case LegType.HA: {
              const facility = await this.fms.facLoader.getFacility(ICAO.getFacilityType(prevLeg.leg.fixIcao), prevLeg.leg.fixIcao);
              pos = FplnPageController.geoPointCache[0].set(facility);
            }
          }
        }
      }

      if (!pos) {
        const ppos = this.ppos.get();
        pos = FplnPageController.geoPointCache[0].set(ppos.lat, ppos.long);
      }

      let selectedFacility = await this.page.screen.selectWptFromIdent(scratchpadContents, pos);

      // Pilot-defined waypoints
      if (!selectedFacility) {
        const result = await WT21PilotWaypointUtils.createFromScratchpadEntry(
          this.fms,
          (ident, refPos) => this.page.screen.selectWptFromIdent(ident, refPos),
          scratchpadContents,
        );

        if (result) {
          const [userFacility] = result;

          this.fms.addUserFacility(userFacility);

          selectedFacility = userFacility;
        }
      }

      if (selectedFacility !== null && displayItem) {
        this.fms.getModFlightPlan();

        plan = this.fms.getPlanForFmcRender();

        let segmentIndex = displayItem.segmentIndex > -1 ? displayItem.segmentIndex : undefined;
        let segmentLegIndex = displayItem.segmentLegIndex > -1 ? displayItem.segmentLegIndex : undefined;

        if (segmentIndex !== undefined) {
          const segment = plan.getSegment(segmentIndex);

          if (segment.segmentType === FlightPlanSegmentType.Departure) {
            // If we have a departure segment, we have to insert our waypoint into a non-airway enroute segment immediately
            // after the departure
            let enrouteSegment = Array.from(plan.segmentsOfType(FlightPlanSegmentType.Enroute))[0];

            if (!enrouteSegment || enrouteSegment.airway) {
              enrouteSegment = plan.insertSegment(segmentIndex + 1, FlightPlanSegmentType.Enroute);
            }

            segmentIndex = enrouteSegment?.segmentIndex;
            segmentLegIndex = 0;
          }
        }

        this.fms.insertWaypoint(selectedFacility, segmentIndex, segmentLegIndex);
        return Promise.resolve(true);
      }

      return Promise.reject('FACILITY NOT FOUND');
    }

  }

  /**
   * Deletes a selected airway segment.
   * @param displayItem The Selected Display Item
   * @returns Whether this airway removal was successful
   */
  private async deleteAirway(displayItem: RoutePageLegItem): Promise<boolean | string> {

    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    if (displayItem) {
      const segment = this.fms.getPlanForFmcRender().getSegment(displayItem.segmentIndex);
      if (segment.segmentType === FlightPlanSegmentType.Enroute && segment.airway) {
        this.fms.removeAirway(displayItem.segmentIndex);
        return Promise.resolve(true);
      } else {
        return await this.deleteLeg(displayItem);
      }
    }
    return Promise.reject('INVALID DELETE');

  }

  /**
   * Deletes a selected leg.
   * @param displayItem The Selected Display Item
   * @returns Whether this leg removal was successful
   */
  private async deleteLeg(displayItem: RoutePageLegItem): Promise<boolean | string> {

    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    if (displayItem) {
      const segment = this.fms.getPlanForFmcRender().getSegment(displayItem.segmentIndex);
      if (segment.segmentType === FlightPlanSegmentType.Enroute && segment.airway) {
        this.fms.removeAirway(displayItem.segmentIndex);
        return Promise.resolve(true);
      } else if (segment.segmentType === FlightPlanSegmentType.Enroute || displayItem.legDefinition?.leg.type === LegType.Discontinuity) {
        if (this.fms.removeWaypoint(segment.segmentIndex, displayItem.segmentLegIndex)) {
          return Promise.resolve(true);
        }
      }
    }
    return Promise.reject('INVALID DELETE');
  }

  /**
   * Sets the origin for the flight plan.
   * @param ident The ICAO to set
   */
  public async setOrigin(ident: string | null): Promise<void> {
    if (!Simplane.getIsGrounded()) {
      throw 'NOT ON GROUND';
    }

    if (!this.fms.canEditPlan()) {
      throw 'XSIDE EDIT IN PROGRESS';
    }

    if (ident !== null && ident.length > 0) {
      const results = await this.fms.facLoader.searchByIdent(FacilitySearchType.Airport, ident, 1);

      if (results && results.length === 1) {
        const facility = await this.fms.facLoader.getFacility(FacilityType.Airport, results[0]);
        if (facility) {
          this.fms.emptyModFlightPlan(true);
          if (ident === this.store.origin.get()) {
            this.store.origin.set(null);
          }
          this.fms.setOrigin(facility);
          this.store.destination.set(null);
          return;
        }
      }
    }

    throw 'FACILITY NOT FOUND';
  }

  /**
   * Sets the destination for the flight plan.
   * @param ident The ICAO to set
   * @param isDelete Whether this was a delete
   * @returns Whether this was successful
   */
  public async setDestination(ident: string | null, isDelete?: boolean): Promise<boolean | string> {

    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }


    if (ident === '' && this.store.destination.get() !== null) {
      const destinationIcao = this.store.destination.get();
      const destinationIdent = destinationIcao !== null && ICAO.getIdent(destinationIcao);
      return Promise.resolve(destinationIdent ? `${destinationIdent}` : '');
    }

    if (ident === null || isDelete) {
      this.fms.setDestination(undefined);
      this.store.destination.set(null);
      this.invalidate();
      return Promise.resolve(true);
    }

    if (ident.length > 0) {
      const results = await this.fms.facLoader.searchByIdent(FacilitySearchType.Airport, ident, 1);
      if (results && results.length === 1) {
        const facility = await this.fms.facLoader.getFacility(FacilityType.Airport, results[0]);
        if (facility) {
          this.fms.setDestination(facility);
          this.store.destination.set(facility.icao);
          this.invalidate();
          return Promise.resolve(true);
        }
      }
    }
    return Promise.reject('FACILITY NOT FOUND');
  }

  /**
   * Handles when Cancel Mod is pressed
   */
  public handleCancelMod(): void {
    this.fms.cancelMod();
    this.getData();
    this.invalidate();
  }

}
