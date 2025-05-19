import {
  Accessible, AdcEvents, AirportFacility, AirportFacilityDataFlags, ApproachUtils, ChartIndex, ChartsClient,
  ConsumerValue, EventBus, FacilityType, GeoPoint, GeoPointInterface, ICAO, IcaoValue, MappedValue, RunwayTransition,
  RunwayUtils, Subscribable, Subscription, UnitType
} from '@microsoft/msfs-sdk';

import { Fms, FmsPositionMode, FmsPositionSystemEvents, FmsUtils } from '@microsoft/msfs-garminsdk';

import {
  ControllableDisplayPaneIndex, DisplayPaneUtils, G3000ChartsControlEvents, G3000ChartsEvents, G3000ChartsPageData,
  G3000ChartsPageSelectionData, G3000ChartsSource, G3000ChartsSourcePageSectionDefinition, G3000ChartsUserSettings,
  G3000ChartsUtils
} from '@microsoft/msfs-wtg3000-common';

/**
 * A manager for G3000 electronic charts selected for display.
 */
export class G3000ChartsManager {
  private readonly managers: Partial<Record<ControllableDisplayPaneIndex, ChartsDisplayPaneManager>> = {};

  private chartSourcesMap?: Map<string, G3000ChartsSource>;

  private isAlive = true;

  private airplaneDataProvider?: AirplaneDataProvider;

  private preferredSourceSub?: Subscription;

  /**
   * Creates a new instance of G3000ChartsManager.
   * @param bus The event bus.
   * @param fms The FMS.
   * @param fmsPosIndex The index of the FMS positioning system to use to retrieve plane position data.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly fms: Fms,
    private readonly fmsPosIndex: Subscribable<number>
  ) {
  }

  /**
   * Initializes this manager. Once the manager is initialized, it will automatically manage the state of electronic
   * charts selected for display.
   * @param chartsSources The available charts sources.
   * @throws Error if this manager has been destroyed.
   */
  public init(chartsSources: Iterable<G3000ChartsSource>): void {
    if (!this.isAlive) {
      throw new Error('G3000ChartsManager::init(): cannot initializer a dead manager');
    }

    this.chartSourcesMap = new Map(Array.from(chartsSources, source => [source.uid, source]));
    this.airplaneDataProvider = new AirplaneDataProvider(this.bus, this.fmsPosIndex);

    for (const displayPaneIndex of DisplayPaneUtils.CONTROLLABLE_INDEXES) {
      this.managers[displayPaneIndex] = new ChartsDisplayPaneManager(
        this.bus,
        this.fms,
        displayPaneIndex,
        this.chartSourcesMap,
        this.airplaneDataProvider
      );
    }
  }

  /**
   * Starts automatic reconciliation of the preferred charts source with the available charts sources. If the preferred
   * charts source is set to an undefined value or one that references a non-existent source, then the preferred charts
   * source will be reset to the first available charts source. This method does nothing if this manager is not
   * initialized.
   * @throws Error if this manager has been destroyed.
   */
  public startReconcilePreferredSource(): void {
    if (!this.isAlive) {
      throw new Error('G3000ChartsManager::reconcilePreferredSource(): cannot manipulate a dead manager');
    }

    if (!this.chartSourcesMap) {
      return;
    }

    if (this.chartSourcesMap.size > 0) {
      const defaultSource = this.chartSourcesMap.keys().next().value!;

      const preferredSourceSetting = G3000ChartsUserSettings.getMasterManager(this.bus).getSetting('chartsPreferredSource');

      this.preferredSourceSub = preferredSourceSetting.sub(source => {
        if (!this.chartSourcesMap!.has(source)) {
          preferredSourceSetting.set(defaultSource);
        }
      }, true);
    }
  }

  /**
   * Resets the state of displayed electronic charts such that all selections are cleared. This method does nothing if
   * this manager is not initialized.
   * @throws Error if this manager has been destroyed.
   */
  public reset(): void {
    if (!this.isAlive) {
      throw new Error('G3000ChartsManager::reset(): cannot manipulate a dead manager');
    }

    for (const displayPaneIndex of DisplayPaneUtils.CONTROLLABLE_INDEXES) {
      this.managers[displayPaneIndex]?.reset();
    }
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.airplaneDataProvider?.destroy();

    this.preferredSourceSub?.destroy();

    for (const manager of Object.values(this.managers)) {
      manager.destroy();
    }
  }
}

/**
 * A provider of airplane data for {@link ChartsDisplayPaneManager}.
 */
class AirplaneDataProvider {
  private readonly _isOnGround = ConsumerValue.create(null, false);
  /** Whether the airplane is on the ground. */
  public readonly isOnGround = this._isOnGround as Accessible<boolean>;

  private readonly fmsPosModeSource = ConsumerValue.create(null, FmsPositionMode.None);
  private readonly planePositionSource = ConsumerValue.create(null, new LatLongAlt(0, 0, 0));

  private readonly planePositionPoint = new GeoPoint(NaN, NaN);
  private readonly _planePosition = MappedValue.create(
    ([fmsPosMode, planePosition]) => {
      if (fmsPosMode === FmsPositionMode.None) {
        return this.planePositionPoint.set(NaN, NaN);
      } else {
        return this.planePositionPoint.set(planePosition.lat, planePosition.long);
      }
    },
    this.fmsPosModeSource,
    this.planePositionSource
  );
  /**
   * The current position of the airplane. If position data is not available, then both latitude and longitude will be
   * equal to `NaN`.
   */
  public readonly planePosition = this._planePosition as Accessible<GeoPointInterface>;

  private readonly fmsPosIndexSub: Subscription;

  /**
   * Creates a new instance of ChartsDisplayPaneManagerDataProvider.
   * @param bus The event bus.
   * @param fmsPosIndex The index of the FMS positioning system to use to retrieve plane position data.
   */
  public constructor(private readonly bus: EventBus, fmsPosIndex: Subscribable<number>) {
    this._isOnGround.setConsumer(bus.getSubscriber<AdcEvents>().on('on_ground'));
    this.fmsPosIndexSub = fmsPosIndex.sub(this.onFmsPosIndexChanged.bind(this), true);
  }

  /**
   * Responds to when the index of the FMS positioning system used to retrieve plane position data changes.
   * @param index The index of the new FMS positioning system used to retrieve plane position data.
   */
  private onFmsPosIndexChanged(index: number): void {
    const sub = this.bus.getSubscriber<FmsPositionSystemEvents>();
    this.fmsPosModeSource.reset(FmsPositionMode.None, sub.on(`fms_pos_mode_${index}`));
    this.planePositionSource.setConsumer(sub.on(`fms_pos_gps-position_${index}`));
  }

  /**
   * Destroys this data provider.
   */
  public destroy(): void {
    this._isOnGround.destroy();
    this.fmsPosIndexSub.destroy();
    this.fmsPosModeSource.destroy();
    this.planePositionSource.destroy();
  }
}

/**
 * Data describing a selected airport and associated chart data.
 */
type AirportChartIndexData = {
  /** The ICAO of the airport. */
  icao: IcaoValue;

  /** The charts source that provided the chart data, or `undefined` if no source was used. */
  source: G3000ChartsSource | undefined;

  /** The airport's chart index, or `undefined` if an index could not be retrieved. */
  chartIndex: ChartIndex<string> | undefined;

  /** All airport information chart pages for the airport. */
  infoPages: G3000ChartsPageData[];

  /** All departure procedure chart pages for the airport. */
  departurePages: G3000ChartsPageData[];

  /** All arrival procedure chart pages for the airport. */
  arrivalPages: G3000ChartsPageData[];

  /** All approach procedure chart pages for the airport. */
  approachPages: G3000ChartsPageData[];
};

/**
 * A manager for electronic charts selected for display on a single display pane.
 */
class ChartsDisplayPaneManager {
  private readonly publisher = this.bus.getPublisher<G3000ChartsEvents>();

  private readonly settingManager = G3000ChartsUserSettings.getDisplayPaneManager(this.bus, this.displayPaneIndex);

  private readonly preferredSource = this.settingManager.getSetting('chartsPreferredSource').map(id => this.chartsSources.get(id));

  private selectedAirportChartIndexData: AirportChartIndexData | null = null;
  private selectedPageData: G3000ChartsPageData | null = null;
  private activePageSectionDefinition: G3000ChartsSourcePageSectionDefinition | null = null;

  private chartSelectionOpId = 0;

  private procPreviewSelectedPageData: G3000ChartsPageData | null = null;
  private procPreviewActivePageSectionDefinition: G3000ChartsSourcePageSectionDefinition | null = null;

  private readonly subscriptions: Subscription[] = [
    this.preferredSource
  ];

  /**
   * Creates a new instance of ChartsDisplayPaneManager.
   * @param bus The event bus.
   * @param fms The FMS.
   * @param displayPaneIndex The index of this manager's display pane.
   * @param chartsSources A map of available charts source IDs to their associated sources.
   * @param airplaneDataProvider A provider of airplane data.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly fms: Fms,
    private readonly displayPaneIndex: ControllableDisplayPaneIndex,
    private readonly chartsSources: ReadonlyMap<string, G3000ChartsSource>,
    private readonly airplaneDataProvider: AirplaneDataProvider
  ) {
    // Publish initial state.
    this.publisher.pub(`charts_airport_selection_${displayPaneIndex}`, null, true, true);
    this.publisher.pub(`charts_page_selection_${displayPaneIndex}`, null, true, true);
    this.publisher.pub(`charts_page_section_${displayPaneIndex}`, '', true, true);
    this.publisher.pub(`charts_proc_preview_page_selection_${displayPaneIndex}`, null, true, true);
    this.publisher.pub(`charts_proc_preview_page_section_${displayPaneIndex}`, '', true, true);

    this.preferredSource.sub(this.onPreferredSourceChanged.bind(this));

    const sub = bus.getSubscriber<G3000ChartsControlEvents>();

    this.subscriptions.push(
      sub.on(`charts_select_airport_${displayPaneIndex}`).handle(this.onSelectAirport.bind(this)),
      sub.on(`charts_select_page_${displayPaneIndex}`).handle(this.onSelectPage.bind(this)),
      sub.on(`charts_sync_pof_${displayPaneIndex}`).handle(this.onSyncPhaseOfFlight.bind(this)),
      sub.on(`charts_set_page_section_${displayPaneIndex}`).handle(this.onSetPageSection.bind(this)),
      sub.on(`charts_clear_selection_${displayPaneIndex}`).handle(this.clearSelection.bind(this)),

      sub.on(`charts_proc_preview_select_page_${displayPaneIndex}`).handle(this.onSelectProcPreviewPage.bind(this)),
      sub.on(`charts_proc_preview_set_page_section_${displayPaneIndex}`).handle(this.onSetProcPreviewPageSection.bind(this)),
      sub.on(`charts_proc_preview_clear_selection_${displayPaneIndex}`).handle(this.clearProcPreviewSelection.bind(this)),
    );
  }

  /**
   * Resets this manager's displayed electronic charts such that all selections are cleared.
   */
  public reset(): void {
    this.clearSelection();
    this.clearProcPreviewSelection();
  }

  /**
   * Selects a chart page for display.
   * @param airportChartIndexData The airport chart data associated with the page to select.
   * @param pageData The page to select, or `null` to clear the page selection.
   */
  private selectPage(airportChartIndexData: AirportChartIndexData, pageData: G3000ChartsPageData | null): void {
    if (!airportChartIndexData.source && pageData) {
      return;
    }

    if (
      !this.selectedAirportChartIndexData
      || !ICAO.valueEquals(this.selectedAirportChartIndexData.icao, airportChartIndexData.icao)
      || this.selectedAirportChartIndexData.source?.uid !== airportChartIndexData.source?.uid
    ) {
      this.selectedAirportChartIndexData = airportChartIndexData;
      this.publisher.pub(`charts_airport_selection_${this.displayPaneIndex}`, {
        icao: this.selectedAirportChartIndexData.icao,
        source: this.selectedAirportChartIndexData.source?.uid ?? null,
        infoPages: this.selectedAirportChartIndexData.infoPages,
        departurePages: this.selectedAirportChartIndexData.departurePages,
        arrivalPages: this.selectedAirportChartIndexData.arrivalPages,
        approachPages: this.selectedAirportChartIndexData.approachPages,
      }, true, true);
    }

    if (
      !(this.selectedPageData === null && pageData === null)
      && !(
        this.selectedPageData
        && pageData
        && this.selectedPageData.metadata.guid === pageData.metadata.guid
        && this.selectedPageData.pageIndex === pageData.pageIndex
      )
    ) {
      this.selectedPageData = pageData;
      this.publisher.pub(
        `charts_page_selection_${this.displayPaneIndex}`,
        pageData
          ? {
            source: this.selectedAirportChartIndexData.source!.uid,
            pageData,
          }
          : null,
        true,
        true
      );

      if (this.activePageSectionDefinition !== null) {
        this.activePageSectionDefinition = null;
        this.publisher.pub(`charts_page_section_${this.displayPaneIndex}`, '', true, true);
      }
    }
  }

  /**
   * Clears the selected airport and chart page.
   */
  private clearSelection(): void {
    if (this.selectedAirportChartIndexData !== null) {
      this.selectedAirportChartIndexData = null;
      this.publisher.pub(`charts_airport_selection_${this.displayPaneIndex}`, null, true, true);
    }

    if (this.selectedPageData !== null) {
      this.selectedPageData = null;
      this.publisher.pub(`charts_page_selection_${this.displayPaneIndex}`, null, true, true);
    }

    if (this.activePageSectionDefinition !== null) {
      this.activePageSectionDefinition = null;
      this.publisher.pub(`charts_page_section_${this.displayPaneIndex}`, '', true, true);
    }
  }

  /**
   * Sets the active page section.
   * @param definition The definition for the new active page section, or `null` if the active page section should be
   * cleared.
   */
  private setActivePageSection(definition: G3000ChartsSourcePageSectionDefinition | null): void {
    if (this.activePageSectionDefinition !== definition) {
      this.activePageSectionDefinition = definition;
      this.publisher.pub(`charts_page_section_${this.displayPaneIndex}`, definition?.uid ?? '', true, true);
    }
  }

  /**
   * Selects a procedure preview chart page for display.
   * @param source The page to select's parent source.
   * @param pageData The page to select.
   */
  private selectProcPreviewPage(source: G3000ChartsSource, pageData: G3000ChartsPageData): void {
    if (
      !(this.procPreviewSelectedPageData === null && pageData === null)
      && !(
        this.procPreviewSelectedPageData
        && pageData
        && this.procPreviewSelectedPageData.metadata.guid === pageData.metadata.guid
        && this.procPreviewSelectedPageData.pageIndex === pageData.pageIndex
      )
    ) {
      this.procPreviewSelectedPageData = pageData;
      this.publisher.pub(
        `charts_proc_preview_page_selection_${this.displayPaneIndex}`,
        pageData
          ? {
            source: source.uid,
            pageData,
          }
          : null,
        true,
        true
      );

      if (this.procPreviewActivePageSectionDefinition !== null) {
        this.procPreviewActivePageSectionDefinition = null;
        this.publisher.pub(`charts_proc_preview_page_section_${this.displayPaneIndex}`, '', true, true);
      }
    }
  }

  /**
   * Clears the selected procedure preview chart page.
   */
  private clearProcPreviewSelection(): void {
    if (this.procPreviewSelectedPageData !== null) {
      this.procPreviewSelectedPageData = null;
      this.publisher.pub(`charts_proc_preview_page_selection_${this.displayPaneIndex}`, null, true, true);
    }

    if (this.procPreviewActivePageSectionDefinition !== null) {
      this.procPreviewActivePageSectionDefinition = null;
      this.publisher.pub(`charts_page_section_${this.displayPaneIndex}`, '', true, true);
    }
  }

  /**
   * Sets the active procedure preview page section.
   * @param definition The definition for the new active page section, or `null` if the active page section should be
   * cleared.
   */
  private setProcPreviewActivePageSection(definition: G3000ChartsSourcePageSectionDefinition | null): void {
    if (this.procPreviewActivePageSectionDefinition !== definition) {
      this.procPreviewActivePageSectionDefinition = definition;
      this.publisher.pub(`charts_proc_preview_page_section_${this.displayPaneIndex}`, definition?.uid ?? '', true, true);
    }
  }

  /**
   * Gets chart data for an airport.
   * @param airportIcao The ICAO of the airport for which to get chart data.
   * @param source The charts source to use to get the chart data, or `undefined` to skip retrieving chart data.
   * @returns A Promise which will be fulfilled with the chart data for the specified airport, retrieved using the
   * specified source.
   */
  private async getAirportChartIndexData(airportIcao: IcaoValue, source: G3000ChartsSource | undefined): Promise<AirportChartIndexData> {
    if (source) {
      try {
        const chartIndex = await ChartsClient.getIndexForAirport(airportIcao, source.provider);

        const [
          infoPages,
          departurePages,
          arrivalPages,
          approachPages
        ] = await Promise.all([
          G3000ChartsUtils.getPageDataFromMetadata(source.getInfoCharts(chartIndex)),
          G3000ChartsUtils.getPageDataFromMetadata(source.getDepartureCharts(chartIndex)),
          G3000ChartsUtils.getPageDataFromMetadata(source.getArrivalCharts(chartIndex)),
          G3000ChartsUtils.getPageDataFromMetadata(source.getApproachCharts(chartIndex)),
        ]);

        return {
          icao: airportIcao,
          source,
          chartIndex,
          infoPages,
          departurePages,
          arrivalPages,
          approachPages,
        };
      } catch {
        // noop
      }
    }

    return {
      icao: airportIcao,
      source: undefined,
      chartIndex: undefined,
      infoPages: [],
      departurePages: [],
      arrivalPages: [],
      approachPages: [],
    };
  }

  /**
   * Attempts to automatically select the primary airport diagram page for an airport. If the primary airport diagram
   * page cannot be found, then the first airport information page is selected instead. If there are no airport
   * information pages, then the page selection will be cleared.
   * @param airportChartIndexData Chart data for the airport.
   */
  private autoSelectAirportDiagramPage(airportChartIndexData: AirportChartIndexData): void {
    let pageData: G3000ChartsPageData | undefined = undefined;

    if (airportChartIndexData.source) {
      pageData = airportChartIndexData.source.getAirportDiagramPage(airportChartIndexData.infoPages)
        ?? airportChartIndexData.infoPages[0];
    }

    if (pageData) {
      this.selectPage(airportChartIndexData, pageData);
    } else {
      this.selectPage(airportChartIndexData, null);
    }
  }

  // eslint-disable-next-line jsdoc/require-returns
  /**
   * Attempts to sync this manager's airport and page selections to the current phase of flight.
   */
  private async syncPhaseOfFlight(): Promise<void> {
    const opId = ++this.chartSelectionOpId;

    const dtoIcao = this.fms.getDirectToTargetIcaoValue();

    const primaryFlightPlan = this.fms.hasPrimaryFlightPlan() ? this.fms.getPrimaryFlightPlan() : undefined;

    if (this.airplaneDataProvider.isOnGround.get()) {
      // If we are on the ground, then sync to the airport diagram of the departure or destination airport. If both
      // airports are defined, then sync to the destination airport if the airplane is more than 30 nautical miles from
      // the departure airport or if it is closer to the destination airport. Otherwise sync to the departure airport.

      let departureAirport: AirportFacility | null = null;
      let destinationAirport: AirportFacility | null = null;

      // The departure airport is the origin airport of the primary flight plan.
      if (primaryFlightPlan?.originAirportIcao) {
        departureAirport = await this.fms.facLoader.tryGetFacility(FacilityType.Airport, primaryFlightPlan.originAirportIcao, 0);
      }

      // The destination airport is the direct-to target if a direct-to to an airport is active, or otherwise the
      // destination airport of the primary flight plan.
      if (dtoIcao && ICAO.isValueFacility(dtoIcao, FacilityType.Airport)) {
        destinationAirport = await this.fms.facLoader.tryGetFacility(FacilityType.Airport, dtoIcao, 0);
      } else if (primaryFlightPlan?.destinationAirportIcao) {
        destinationAirport = await this.fms.facLoader.tryGetFacility(FacilityType.Airport, primaryFlightPlan.destinationAirportIcao, 0);
      }

      if (opId !== this.chartSelectionOpId) {
        return;
      }

      const planePosition = this.airplaneDataProvider.planePosition.get();
      if (departureAirport && destinationAirport && planePosition.isValid()) {
        const distanceToDestination = planePosition.distance(departureAirport);
        if (
          UnitType.GA_RADIAN.convertTo(distanceToDestination, UnitType.NMILE) > 30
          || distanceToDestination < planePosition.distance(departureAirport)
        ) {
          return this.syncToAirportDiagram(opId, destinationAirport);
        } else {
          return this.syncToAirportDiagram(opId, departureAirport);
        }
      } else if (departureAirport) {
        return this.syncToAirportDiagram(opId, departureAirport);
      } else if (destinationAirport) {
        return this.syncToAirportDiagram(opId, destinationAirport);
      }
    } else {
      // We are not on the ground.

      if (dtoIcao && ICAO.isValueFacility(dtoIcao, FacilityType.Airport)) {
        // If a direct-to to an airport is active, then we will sync to the airport diagram of the direct-to target.

        const destinationAirport = await this.fms.facLoader.tryGetFacility(FacilityType.Airport, dtoIcao, 0);

        if (opId !== this.chartSelectionOpId) {
          return;
        }

        if (destinationAirport) {
          return this.syncToAirportDiagram(opId, destinationAirport);
        }
      } else if (primaryFlightPlan) {
        // If a direct-to to an airport is not active, then we will sync to

        const departureSegment = FmsUtils.getDepartureSegment(primaryFlightPlan);
        if (
          departureSegment
          && primaryFlightPlan.activeLateralLeg < departureSegment.offset + departureSegment.legs.length
          && primaryFlightPlan.procedureDetails.departureFacilityIcaoStruct
          && ICAO.isValueFacility(primaryFlightPlan.procedureDetails.departureFacilityIcaoStruct, FacilityType.Airport)
          && primaryFlightPlan.procedureDetails.departureIndex >= 0
        ) {
          return this.syncToDepartureArrival(
            opId,
            true,
            primaryFlightPlan.procedureDetails.departureFacilityIcaoStruct,
            primaryFlightPlan.procedureDetails.departureIndex,
            primaryFlightPlan.procedureDetails.departureTransitionIndex,
            primaryFlightPlan.procedureDetails.departureRunwayIndex
          );
        }

        const arrivalSegment = FmsUtils.getArrivalSegment(primaryFlightPlan);
        if (
          arrivalSegment
          && primaryFlightPlan.activeLateralLeg < arrivalSegment.offset + arrivalSegment.legs.length
          && primaryFlightPlan.procedureDetails.arrivalFacilityIcaoStruct
          && ICAO.isValueFacility(primaryFlightPlan.procedureDetails.arrivalFacilityIcaoStruct, FacilityType.Airport)
          && primaryFlightPlan.procedureDetails.arrivalIndex >= 0
        ) {
          return this.syncToDepartureArrival(
            opId,
            false,
            primaryFlightPlan.procedureDetails.arrivalFacilityIcaoStruct,
            primaryFlightPlan.procedureDetails.arrivalIndex,
            primaryFlightPlan.procedureDetails.arrivalTransitionIndex,
            primaryFlightPlan.procedureDetails.arrivalRunwayTransitionIndex
          );
        }

        const approachSegment = FmsUtils.getApproachSegment(primaryFlightPlan);
        if (
          approachSegment
          && primaryFlightPlan.procedureDetails.approachFacilityIcaoStruct
          && ICAO.isValueFacility(primaryFlightPlan.procedureDetails.approachFacilityIcaoStruct, FacilityType.Airport)
          && primaryFlightPlan.procedureDetails.approachIndex >= 0
        ) {
          return this.syncToApproach(
            opId,
            primaryFlightPlan.procedureDetails.approachFacilityIcaoStruct,
            primaryFlightPlan.procedureDetails.approachIndex,
            primaryFlightPlan.procedureDetails.approachTransitionIndex
          );
        }
      }
    }
  }

  /**
   * Attempts to sync this manager's airport and page selections to a departure or arrival procedure.
   * @param opId The ID of the current operation to change this manager's chart selection.
   * @param airport Whether the procedure to which to sync is a departure.
   */
  private async syncToAirportDiagram(opId: number, airport: AirportFacility): Promise<void> {
    const source = this.preferredSource.get();

    let airportChartIndexData = this.selectedAirportChartIndexData;

    if (
      !airportChartIndexData
      || !ICAO.valueEquals(airportChartIndexData.icao, airport.icaoStruct)
      || source?.uid !== airportChartIndexData.source?.uid
    ) {
      airportChartIndexData = await this.getAirportChartIndexData(airport.icaoStruct, source);

      if (opId !== this.chartSelectionOpId) {
        return;
      }
    }

    if (!airportChartIndexData.source) {
      this.selectPage(airportChartIndexData, null);
      return;
    }

    this.autoSelectAirportDiagramPage(airportChartIndexData);
  }

  /**
   * Attempts to sync this manager's airport and page selections to a departure or arrival procedure.
   * @param opId The ID of the current operation to change this manager's chart selection.
   * @param isDeparture Whether the procedure to which to sync is a departure.
   * @param airportIcao The ICAO of the procedure's parent airport.
   * @param procedureIndex The index of the procedure in its parent airport's procedure array.
   * @param enrouteTransitionIndex The index of the procedure's enroute transition.
   * @param runwayTransitionIndex The index of the procedure's runway transition.
   */
  private async syncToDepartureArrival(
    opId: number,
    isDeparture: boolean,
    airportIcao: IcaoValue,
    procedureIndex: number,
    enrouteTransitionIndex: number,
    runwayTransitionIndex: number
  ): Promise<void> {
    const airport = await this.fms.facLoader.tryGetFacility(
      FacilityType.Airport,
      airportIcao,
      isDeparture ? AirportFacilityDataFlags.Departures : AirportFacilityDataFlags.Arrivals
    );

    if (opId !== this.chartSelectionOpId) {
      return;
    }

    const procedure = airport?.[isDeparture ? 'departures' : 'arrivals'][procedureIndex];

    if (!procedure) {
      return;
    }

    const source = this.preferredSource.get();

    let airportChartIndexData = this.selectedAirportChartIndexData;

    if (
      !airportChartIndexData
      || !ICAO.valueEquals(airportChartIndexData.icao, airportIcao)
      || source?.uid !== airportChartIndexData.source?.uid
    ) {
      airportChartIndexData = await this.getAirportChartIndexData(airportIcao, source);

      if (opId !== this.chartSelectionOpId) {
        return;
      }
    }

    if (!airportChartIndexData.source) {
      this.selectPage(airportChartIndexData, null);
      return;
    }

    const runwayIdentifier = RunwayUtils.emptyIdentifier();
    const runwayTransition = procedure.runwayTransitions[runwayTransitionIndex] as RunwayTransition | undefined;
    if (runwayTransition) {
      runwayIdentifier.number = RunwayUtils.getNumberString(runwayTransition.runwayNumber);
      runwayIdentifier.designator = RunwayUtils.getDesignatorLetter(runwayTransition.runwayDesignation);
    }

    const pageGetter = isDeparture
      ? 'getDeparturePage'
      : 'getArrivalPage';

    const procedurePageData = airportChartIndexData.source[pageGetter](
      isDeparture ? airportChartIndexData.departurePages : airportChartIndexData.arrivalPages,
      procedure.name,
      procedure.enRouteTransitions[enrouteTransitionIndex]?.name ?? '',
      runwayIdentifier
    );

    if (procedurePageData) {
      this.selectPage(airportChartIndexData, procedurePageData);
    } else {
      this.autoSelectAirportDiagramPage(airportChartIndexData);
    }
  }

  /**
   * Attempts to sync this manager's airport and page selections to an approach procedure.
   * @param opId The ID of the current operation to change this manager's chart selection.
   * @param airportIcao The ICAO of the procedure's parent airport.
   * @param procedureIndex The index of the procedure in its parent airport's procedure array.
   * @param transitionIndex The index of the procedure's transition, or `-1` for the VECTORS transition.
   */
  private async syncToApproach(
    opId: number,
    airportIcao: IcaoValue,
    procedureIndex: number,
    transitionIndex: number
  ): Promise<void> {
    const airport = await this.fms.facLoader.tryGetFacility(
      FacilityType.Airport,
      airportIcao,
      AirportFacilityDataFlags.Approaches
    );

    if (opId !== this.chartSelectionOpId) {
      return;
    }

    const approach = airport?.approaches[procedureIndex];

    if (!approach) {
      return;
    }

    const source = this.preferredSource.get();

    let airportChartIndexData = this.selectedAirportChartIndexData;

    if (
      !airportChartIndexData
      || !ICAO.valueEquals(airportChartIndexData.icao, airportIcao)
      || source?.uid !== airportChartIndexData.source?.uid
    ) {
      airportChartIndexData = await this.getAirportChartIndexData(airportIcao, source);

      if (opId !== this.chartSelectionOpId) {
        return;
      }
    }

    if (!airportChartIndexData.source) {
      this.selectPage(airportChartIndexData, null);
      return;
    }

    const approachPageData = airportChartIndexData.source.getApproachPage(
      airportChartIndexData.approachPages,
      ApproachUtils.getIdentifier(approach),
      approach.transitions[transitionIndex]?.name ?? ''
    );

    if (approachPageData) {
      this.selectPage(airportChartIndexData, approachPageData);
    } else {
      this.autoSelectAirportDiagramPage(airportChartIndexData);
    }
  }

  /**
   * Responds to when this manager's preferred charts source changes.
   * @param source The new preferred charts source.
   */
  private async onPreferredSourceChanged(source: G3000ChartsSource | undefined): Promise<void> {
    const opId = ++this.chartSelectionOpId;

    // If no airport is selected, then we can't re-select a charts source.
    if (!this.selectedAirportChartIndexData) {
      return;
    }

    // If the new preferred charts source is the same as the charts source for the currently selected airport chart
    // index, then we don't need to re-select the charts source.
    if (this.selectedAirportChartIndexData.source?.uid === source?.uid) {
      return;
    }

    const airportChartIndexData = await this.getAirportChartIndexData(this.selectedAirportChartIndexData.icao, source);

    if (opId !== this.chartSelectionOpId) {
      return;
    }

    this.autoSelectAirportDiagramPage(airportChartIndexData);
  }

  /**
   * Responds to when a command to select an airport is received.
   * @param icao The ICAO of the airport to select.
   */
  private async onSelectAirport(icao: IcaoValue): Promise<void> {
    const opId = ++this.chartSelectionOpId;

    if (ICAO.isValueEmpty(icao)) {
      this.clearSelection();
      return;
    }

    // If the ICAO is not an airport, then ignore it.
    if (!ICAO.isValueFacility(icao, FacilityType.Airport)) {
      return;
    }

    const source = this.preferredSource.get();

    let airportChartIndexData = this.selectedAirportChartIndexData;

    if (
      !airportChartIndexData
      || !ICAO.valueEquals(airportChartIndexData.icao, icao)
      || source?.uid !== airportChartIndexData.source?.uid
    ) {
      airportChartIndexData = await this.getAirportChartIndexData(icao, source);

      if (opId !== this.chartSelectionOpId) {
        return;
      }
    }

    this.autoSelectAirportDiagramPage(airportChartIndexData);
  }

  /**
   * Responds to when a command to select a chart page is received.
   * @param pageSelectionData Data describing the page to select.
   */
  private async onSelectPage(pageSelectionData: G3000ChartsPageSelectionData): Promise<void> {
    const opId = ++this.chartSelectionOpId;

    const source = this.chartsSources.get(pageSelectionData.source);
    if (!source || source.uid !== this.preferredSource.get()?.uid) {
      return;
    }

    if (!ICAO.isValueFacility(pageSelectionData.pageData.metadata.airportIcao, FacilityType.Airport)) {
      return;
    }

    let airportChartIndexData = this.selectedAirportChartIndexData;

    if (
      !airportChartIndexData
      || !ICAO.valueEquals(airportChartIndexData.icao, pageSelectionData.pageData.metadata.airportIcao)
      || source?.uid !== airportChartIndexData.source?.uid
    ) {
      airportChartIndexData = await this.getAirportChartIndexData(pageSelectionData.pageData.metadata.airportIcao, source);

      if (opId !== this.chartSelectionOpId) {
        return;
      }
    }

    this.selectPage(airportChartIndexData, pageSelectionData.pageData);
  }

  /**
   * Responds to when a command to sync the chart selection to the current phase of flight is received.
   */
  private onSyncPhaseOfFlight(): void {
    this.syncPhaseOfFlight();
  }

  /**
   * Responds to when a command to set the active chart page section is received.
   * @param section The ID of the page section to set.
   */
  private onSetPageSection(section: string): void {
    if (section === '') {
      this.setActivePageSection(null);
      return;
    }

    if (!this.selectedPageData) {
      return;
    }

    const source = this.preferredSource.get();

    if (!source) {
      return;
    }

    const definition = source.pageSectionDefinitions.find(def => def.uid === section);

    if (!definition) {
      return;
    }

    if (definition.getArea(this.selectedPageData)) {
      this.setActivePageSection(definition);
    }
  }

  /**
   * Responds to when a command to select a procedure preview chart page is received.
   * @param pageSelectionData Data describing the page to select.
   */
  private async onSelectProcPreviewPage(pageSelectionData: G3000ChartsPageSelectionData): Promise<void> {
    const source = this.chartsSources.get(pageSelectionData.source);

    if (source) {
      this.selectProcPreviewPage(source, pageSelectionData.pageData);
    }
  }

  /**
   * Responds to when a command to set the active procedure preview chart page section is received.
   * @param section The ID of the page section to set.
   */
  private onSetProcPreviewPageSection(section: string): void {
    if (section === '') {
      this.setProcPreviewActivePageSection(null);
      return;
    }

    if (!this.procPreviewSelectedPageData) {
      return;
    }

    const source = this.preferredSource.get();

    if (!source) {
      return;
    }

    const definition = source.pageSectionDefinitions.find(def => def.uid === section);

    if (!definition) {
      return;
    }

    if (definition.getArea(this.procPreviewSelectedPageData)) {
      this.setProcPreviewActivePageSection(definition);
    }
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    ++this.chartSelectionOpId;

    for (const sub of this.subscriptions) {
      sub.destroy();
    }
  }
}
