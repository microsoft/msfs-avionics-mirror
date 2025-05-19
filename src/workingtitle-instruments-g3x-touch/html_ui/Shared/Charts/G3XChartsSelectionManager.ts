import {
  Accessible, AdcEvents, AirportFacilityDataFlags, ApproachUtils, ChartIndex, ChartsClient, ConsumerValue, EventBus,
  FacilityType, GeoPointInterface, ICAO, IcaoValue, MappedSubscribable, RunwayTransition, RunwayUtils, Subject,
  Subscribable, UserSettingManager
} from '@microsoft/msfs-sdk';

import { FmsFplUserDataKey, FmsFplVfrApproachData, FmsUtils } from '@microsoft/msfs-garminsdk';

import { G3XFplSourceDataProvider } from '../FlightPlan/G3XFplSourceDataProvider';
import { PositionHeadingDataProvider } from '../Navigation/PositionHeadingDataProvider';
import { G3XChartsUserSettingTypes } from '../Settings/G3XChartsUserSettings';
import { G3XChartsSource } from './G3XChartsSource';
import { G3XChartsAirportSelectionData, G3XChartsPageData, G3XChartsPageSelectionData } from './G3XChartsTypes';
import { G3XChartsUtils } from './G3XChartsUtils';

/**
 * Data describing a selected airport and associated chart data.
 */
type AirportChartIndexData = {
  /** The ICAO of the airport. */
  icao: IcaoValue;

  /** The charts source that provided the chart data, or `undefined` if no source was used. */
  source: G3XChartsSource | undefined;

  /** The airport's chart index, or `undefined` if an index could not be retrieved. */
  chartIndex: ChartIndex<string> | undefined;

  /** All airport diagram chart pages for the airport. */
  airportDiagramPages: G3XChartsPageData[];

  /** All airport information chart pages for the airport, *excluding* any airport diagram charts. */
  infoPages: G3XChartsPageData[];

  /** All departure procedure chart pages for the airport. */
  departurePages: G3XChartsPageData[];

  /** All arrival procedure chart pages for the airport. */
  arrivalPages: G3XChartsPageData[];

  /** All approach procedure chart pages for the airport. */
  approachPages: G3XChartsPageData[];
};

/**
 * A G3X Touch manager for electronic charts selected for display.
 */
export class G3XChartsSelectionManager {
  /** A map to all available electronic charts sources from their unique IDs. */
  public readonly chartsSources: ReadonlyMap<string, G3XChartsSource>;

  private readonly preferredSource: MappedSubscribable<G3XChartsSource | undefined>;

  private readonly airplaneDataProvider: AirplaneDataProvider;

  private selectedAirportChartIndexData: AirportChartIndexData | null = null;
  private selectedPageDataInternal: G3XChartsPageData | null = null;

  private readonly _selectedAirportData = Subject.create<G3XChartsAirportSelectionData | null>(null);
  /** Data describing the currently selected airport. */
  public readonly selectedAirportData = this._selectedAirportData as Subscribable<G3XChartsAirportSelectionData | null>;

  private readonly _selectedPageData = Subject.create<G3XChartsPageSelectionData | null>(null);
  /** Data describing the currently selected chart page. */
  public readonly selectedPageData = this._selectedPageData as Subscribable<G3XChartsPageSelectionData | null>;

  private readonly _isLoadingAirportData = Subject.create(false);
  /** Whether this manager is currently busy loading airport chart data. */
  public readonly isLoadingAirportData = this._isLoadingAirportData as Subscribable<boolean>;

  private chartSelectionOpId = 0;

  /**
   * Creates a new instance of G3XChartsSelectionManager.
   * @param bus The event bus.
   * @param chartsSources All available electronic charts sources.
   * @param fplSourceDataProvider A provider of flight plan source data.
   * @param posHeadingDataProvider A provider of airplane position and heading data.
   * @param chartsSettingManager A manager for electronic charts user settings.
   */
  public constructor(
    bus: EventBus,
    chartsSources: Iterable<G3XChartsSource>,
    private readonly fplSourceDataProvider: G3XFplSourceDataProvider,
    posHeadingDataProvider: PositionHeadingDataProvider,
    private readonly chartsSettingManager: UserSettingManager<G3XChartsUserSettingTypes>
  ) {
    this.chartsSources = new Map(Array.from(chartsSources).map(source => [source.uid, source]));
    this.airplaneDataProvider = new AirplaneDataProvider(bus, posHeadingDataProvider);

    this.preferredSource = this.chartsSettingManager.getSetting('chartsPreferredSource').map(id => this.chartsSources.get(id));
    this.preferredSource.sub(this.onPreferredSourceChanged.bind(this));
  }

  /**
   * Selects an airport for which to display charts.
   * @param icao The ICAO value of the airport to select.
   * @param syncToFlightPlan Whether to sync the selected chart page for the newly selected airport with the active
   * flight plan. If false, then the selected chart page will be set to the primary airport diagram page instead (if
   * an airport diagram page is not available, then the first airport information chart page is used). Defaults to
   * `false`.
   * @returns A Promise which fulfills with whether the selection was successful.
   */
  public selectAirport(icao: IcaoValue, syncToFlightPlan = false): Promise<boolean> {
    return this.onSelectAirport(icao, syncToFlightPlan);
  }

  /**
   * Selects a chart page to display.
   * @param pageData Data describing the page to select.
   * @returns A Promise which fulfills with whether the selection was successful.
   */
  public selectPage(pageData: G3XChartsPageSelectionData): Promise<boolean> {
    return this.onSelectPage(pageData);
  }

  /**
   * Syncs the selected chart page for the currently selected airport with the active flight plan. If no airport is
   * selected, then this method does nothing (the returned Promise is immediately fulfilled with a value of `true`).
   * @returns A Promise which fulfills with whether the sync was successful.
   */
  public syncToFlightPlan(): Promise<boolean> {
    return this.onSyncToFlightPlan();
  }

  /**
   * Resets this manager's displayed electronic charts such that both the selected airport and selected chart page are
   * cleared.
   */
  public reset(): void {
    this.clearSelection();
  }

  /**
   * Selects a chart page for display.
   * @param airportChartIndexData The airport chart data associated with the page to select.
   * @param pageData The page to select, or `null` to clear the page selection.
   */
  private doSelectPage(airportChartIndexData: AirportChartIndexData, pageData: G3XChartsPageData | null): void {
    if (!airportChartIndexData.source && pageData) {
      return;
    }

    if (
      !this.selectedAirportChartIndexData
      || !ICAO.valueEquals(this.selectedAirportChartIndexData.icao, airportChartIndexData.icao)
      || this.selectedAirportChartIndexData.source?.uid !== airportChartIndexData.source?.uid
    ) {
      this.selectedAirportChartIndexData = airportChartIndexData;
      this._selectedAirportData.set({
        icao: this.selectedAirportChartIndexData.icao,
        source: this.selectedAirportChartIndexData.source?.uid ?? null,
        airportDiagramPages: this.selectedAirportChartIndexData.airportDiagramPages,
        infoPages: this.selectedAirportChartIndexData.infoPages,
        departurePages: this.selectedAirportChartIndexData.departurePages,
        arrivalPages: this.selectedAirportChartIndexData.arrivalPages,
        approachPages: this.selectedAirportChartIndexData.approachPages,
      });
    }

    if (
      !(this.selectedPageDataInternal === null && pageData === null)
      && !(
        this.selectedPageDataInternal
        && pageData
        && this.selectedPageDataInternal.metadata.guid === pageData.metadata.guid
        && this.selectedPageDataInternal.pageIndex === pageData.pageIndex
      )
    ) {
      this.selectedPageDataInternal = pageData;
      this._selectedPageData.set(
        pageData
          ? {
            source: this.selectedAirportChartIndexData.source!.uid,
            pageData,
          }
          : null
      );
    }
  }

  /**
   * Clears the selected airport and chart page.
   */
  private clearSelection(): void {
    if (this.selectedAirportChartIndexData !== null) {
      this.selectedAirportChartIndexData = null;
      this._selectedAirportData.set(null);
    }

    if (this.selectedPageDataInternal !== null) {
      this.selectedPageDataInternal = null;
      this._selectedPageData.set(null);
    }
  }

  /**
   * Gets chart data for an airport.
   * @param airportIcao The ICAO of the airport for which to get chart data.
   * @param source The charts source to use to get the chart data, or `undefined` to skip retrieving chart data.
   * @returns A Promise which will be fulfilled with the chart data for the specified airport, retrieved using the
   * specified source.
   */
  private async getAirportChartIndexData(airportIcao: IcaoValue, source: G3XChartsSource | undefined): Promise<AirportChartIndexData> {
    if (source) {
      try {
        const chartIndex = await ChartsClient.getIndexForAirport(airportIcao, source.provider);

        const [
          airportDiagramPages,
          infoPages,
          departurePages,
          arrivalPages,
          approachPages
        ] = await Promise.all([
          G3XChartsUtils.getPageDataFromMetadata(source.getAirportDiagramCharts(chartIndex)),
          G3XChartsUtils.getPageDataFromMetadata(source.getInfoCharts(chartIndex)),
          G3XChartsUtils.getPageDataFromMetadata(source.getDepartureCharts(chartIndex)),
          G3XChartsUtils.getPageDataFromMetadata(source.getArrivalCharts(chartIndex)),
          G3XChartsUtils.getPageDataFromMetadata(source.getApproachCharts(chartIndex)),
        ]);

        return {
          icao: airportIcao,
          source,
          chartIndex,
          airportDiagramPages,
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
      airportDiagramPages: [],
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
    let pageData: G3XChartsPageData | undefined = undefined;

    if (airportChartIndexData.source) {
      pageData = airportChartIndexData.source.getAirportDiagramPage(airportChartIndexData.airportDiagramPages)
        ?? airportChartIndexData.infoPages[0];
    }

    if (pageData) {
      this.doSelectPage(airportChartIndexData, pageData);
    } else {
      this.doSelectPage(airportChartIndexData, null);
    }
  }

  /**
   * Responds to when this manager's preferred charts source changes.
   * @param source The new preferred charts source.
   */
  private async onPreferredSourceChanged(source: G3XChartsSource | undefined): Promise<void> {
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

    this._isLoadingAirportData.set(true);

    const airportChartIndexData = await this.getAirportChartIndexData(this.selectedAirportChartIndexData.icao, source);

    if (opId !== this.chartSelectionOpId) {
      return;
    }

    this._isLoadingAirportData.set(false);

    this.autoSelectAirportDiagramPage(airportChartIndexData);
  }

  /**
   * Responds to when a command to select an airport is received.
   * @param icao The ICAO of the airport to select.
   * @param syncToFlightPlan Whether to sync the selected chart page for the newly selected airport with the active
   * flight plan. If false, then the selected chart page will be set to the primary airport diagram page instead (if
   * an airport diagram page is not available, then the first airport information chart page is used).
   * @returns Whether the selection was successful.
   */
  private async onSelectAirport(icao: IcaoValue, syncToFlightPlan: boolean): Promise<boolean> {
    const opId = ++this.chartSelectionOpId;

    if (ICAO.isValueEmpty(icao)) {
      this._isLoadingAirportData.set(false);
      this.clearSelection();
      return false;
    }

    // If the ICAO is not an airport, then ignore it.
    if (!ICAO.isValueFacility(icao, FacilityType.Airport)) {
      this._isLoadingAirportData.set(false);
      return false;
    }

    const source = this.preferredSource.get();

    let airportChartIndexData = this.selectedAirportChartIndexData;

    if (
      !airportChartIndexData
      || !ICAO.valueEquals(airportChartIndexData.icao, icao)
      || source?.uid !== airportChartIndexData.source?.uid
    ) {
      this._isLoadingAirportData.set(true);

      airportChartIndexData = await this.getAirportChartIndexData(icao, source);

      if (opId !== this.chartSelectionOpId) {
        return false;
      }
    }

    this._isLoadingAirportData.set(false);

    if (syncToFlightPlan) {
      this.doSelectPage(airportChartIndexData, null);
      return this.onSyncToFlightPlan();
    } else {
      this.autoSelectAirportDiagramPage(airportChartIndexData);
      return true;
    }
  }

  /**
   * Responds to when a command to select a chart page is received.
   * @param pageSelectionData Data describing the page to select.
   * @returns Whether the selection was successful.
   */
  private async onSelectPage(pageSelectionData: G3XChartsPageSelectionData): Promise<boolean> {
    const opId = ++this.chartSelectionOpId;

    const source = this.chartsSources.get(pageSelectionData.source);
    if (!source || source.uid !== this.preferredSource.get()?.uid) {
      this._isLoadingAirportData.set(false);
      return false;
    }

    if (!ICAO.isValueFacility(pageSelectionData.pageData.metadata.airportIcao, FacilityType.Airport)) {
      this._isLoadingAirportData.set(false);
      return false;
    }

    let airportChartIndexData = this.selectedAirportChartIndexData;

    if (
      !airportChartIndexData
      || !ICAO.valueEquals(airportChartIndexData.icao, pageSelectionData.pageData.metadata.airportIcao)
      || source?.uid !== airportChartIndexData.source?.uid
    ) {
      this._isLoadingAirportData.set(true);

      airportChartIndexData = await this.getAirportChartIndexData(pageSelectionData.pageData.metadata.airportIcao, source);

      if (opId !== this.chartSelectionOpId) {
        return false;
      }
    }

    this._isLoadingAirportData.set(false);

    this.doSelectPage(airportChartIndexData, pageSelectionData.pageData);

    return true;
  }

  /**
   * Responds to when a command to sync this manager's page selection to the active flight plan is received.
   * @returns Whether the sync was successful.
   */
  private async onSyncToFlightPlan(): Promise<boolean> {
    const opId = ++this.chartSelectionOpId;

    this._isLoadingAirportData.set(false);

    if (!this.selectedAirportChartIndexData || !this.selectedAirportChartIndexData.source) {
      return true;
    }

    const fms = this.fplSourceDataProvider.fms.get();

    const dtoIcao = fms.getDirectToTargetIcaoValue();

    const primaryFlightPlan = fms.hasPrimaryFlightPlan() ? fms.getPrimaryFlightPlan() : undefined;

    if (this.airplaneDataProvider.isOnGround.get()) {
      // If we are on the ground, then sync to the airport diagram of the departure or destination airport.

      // The departure airport is the origin airport of the primary flight plan.
      if (
        primaryFlightPlan?.originAirportIcao
        && ICAO.valueEquals(primaryFlightPlan.originAirportIcao, this.selectedAirportChartIndexData.icao)
      ) {
        this.autoSelectAirportDiagramPage(this.selectedAirportChartIndexData);
        return true;
      }

      // The destination airport is the direct-to target if a direct-to to an airport is active, or otherwise the
      // destination airport of the primary flight plan.
      if (
        dtoIcao
        && ICAO.isValueFacility(dtoIcao, FacilityType.Airport)
        && ICAO.valueEquals(dtoIcao, this.selectedAirportChartIndexData.icao)
      ) {
        this.autoSelectAirportDiagramPage(this.selectedAirportChartIndexData);
        return true;
      } else if (
        primaryFlightPlan?.destinationAirportIcao
        && ICAO.valueEquals(primaryFlightPlan.destinationAirportIcao, this.selectedAirportChartIndexData.icao)
      ) {
        this.autoSelectAirportDiagramPage(this.selectedAirportChartIndexData);
        return true;
      }
    } else {
      // We are not on the ground.

      if (
        dtoIcao
        && ICAO.isValueFacility(dtoIcao, FacilityType.Airport)
        && ICAO.valueEquals(dtoIcao, this.selectedAirportChartIndexData.icao)
      ) {
        // If a direct-to to an airport is active, then we will sync to the airport diagram of the direct-to target.
        this.autoSelectAirportDiagramPage(this.selectedAirportChartIndexData);
        return true;
      } else if (primaryFlightPlan) {
        // If a direct-to to an airport is not active, then we will sync to either the departure, arrival, or approach
        // chart, depending on what is loaded in the primary flight plan and the active flight plan leg.

        // Try departure.
        const departureSegment = FmsUtils.getDepartureSegment(primaryFlightPlan);
        if (
          departureSegment
          && primaryFlightPlan.activeLateralLeg < departureSegment.offset + departureSegment.legs.length
          && primaryFlightPlan.procedureDetails.departureFacilityIcaoStruct
          && ICAO.isValueFacility(primaryFlightPlan.procedureDetails.departureFacilityIcaoStruct, FacilityType.Airport)
          && ICAO.valueEquals(primaryFlightPlan.procedureDetails.departureFacilityIcaoStruct, this.selectedAirportChartIndexData.icao)
          && primaryFlightPlan.procedureDetails.departureIndex >= 0
        ) {
          return this.syncToDepartureArrival(
            opId,
            true,
            primaryFlightPlan.procedureDetails.departureIndex,
            primaryFlightPlan.procedureDetails.departureTransitionIndex,
            primaryFlightPlan.procedureDetails.departureRunwayIndex
          );
        }

        // Try arrival.
        const arrivalSegment = FmsUtils.getArrivalSegment(primaryFlightPlan);
        if (
          arrivalSegment
          && primaryFlightPlan.activeLateralLeg < arrivalSegment.offset + arrivalSegment.legs.length
          && primaryFlightPlan.procedureDetails.arrivalFacilityIcaoStruct
          && ICAO.isValueFacility(primaryFlightPlan.procedureDetails.arrivalFacilityIcaoStruct, FacilityType.Airport)
          && ICAO.valueEquals(primaryFlightPlan.procedureDetails.arrivalFacilityIcaoStruct, this.selectedAirportChartIndexData.icao)
          && primaryFlightPlan.procedureDetails.arrivalIndex >= 0
        ) {
          return this.syncToDepartureArrival(
            opId,
            false,
            primaryFlightPlan.procedureDetails.arrivalIndex,
            primaryFlightPlan.procedureDetails.arrivalTransitionIndex,
            primaryFlightPlan.procedureDetails.arrivalRunwayTransitionIndex
          );
        }

        // Try approach.
        if (
          primaryFlightPlan.procedureDetails.approachFacilityIcaoStruct
          && ICAO.isValueFacility(primaryFlightPlan.procedureDetails.approachFacilityIcaoStruct, FacilityType.Airport)
          && ICAO.valueEquals(primaryFlightPlan.procedureDetails.approachFacilityIcaoStruct, this.selectedAirportChartIndexData.icao)
          && primaryFlightPlan.procedureDetails.approachIndex >= 0
        ) {
          // Try published approach
          if (primaryFlightPlan.procedureDetails.approachIndex >= 0) {
            return this.syncToApproach(
              opId,
              primaryFlightPlan.procedureDetails.approachIndex,
              primaryFlightPlan.procedureDetails.approachTransitionIndex
            );
          } else {
            // Try VFR approach.
            const vfrApproach = primaryFlightPlan.getUserData<Readonly<FmsFplVfrApproachData>>(FmsFplUserDataKey.VfrApproach);
            if (
              vfrApproach
              && vfrApproach.approachIndex >= 0
            ) {
              return this.syncToApproach(
                opId,
                vfrApproach.approachIndex,
                -1
              );
            }
          }
        }
      }
    }

    this.autoSelectAirportDiagramPage(this.selectedAirportChartIndexData);
    return true;
  }

  /**
   * Attempts to sync this manager's chart page selection to a departure or arrival procedure.
   * @param opId The ID of the current operation to change this manager's chart selection.
   * @param isDeparture Whether the procedure to which to sync is a departure.
   * @param procedureIndex The index of the procedure in its parent airport's procedure array.
   * @param enrouteTransitionIndex The index of the procedure's enroute transition.
   * @param runwayTransitionIndex The index of the procedure's runway transition.
   * @returns Whether the sync was successful.
   */
  private async syncToDepartureArrival(
    opId: number,
    isDeparture: boolean,
    procedureIndex: number,
    enrouteTransitionIndex: number,
    runwayTransitionIndex: number
  ): Promise<boolean> {
    if (!this.selectedAirportChartIndexData || !this.selectedAirportChartIndexData.source) {
      return true;
    }

    const fms = this.fplSourceDataProvider.fms.get();

    const airport = await fms.facLoader.tryGetFacility(
      FacilityType.Airport,
      this.selectedAirportChartIndexData.icao,
      isDeparture ? AirportFacilityDataFlags.Departures : AirportFacilityDataFlags.Arrivals
    );

    if (opId !== this.chartSelectionOpId) {
      return false;
    }

    const procedure = airport?.[isDeparture ? 'departures' : 'arrivals'][procedureIndex];

    if (!procedure) {
      this.autoSelectAirportDiagramPage(this.selectedAirportChartIndexData);
      return true;
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

    const procedurePageData = this.selectedAirportChartIndexData.source[pageGetter](
      isDeparture ? this.selectedAirportChartIndexData.departurePages : this.selectedAirportChartIndexData.arrivalPages,
      procedure.name,
      procedure.enRouteTransitions[enrouteTransitionIndex]?.name ?? '',
      runwayIdentifier
    );

    if (procedurePageData) {
      this.doSelectPage(this.selectedAirportChartIndexData, procedurePageData);
    } else {
      this.autoSelectAirportDiagramPage(this.selectedAirportChartIndexData);
    }

    return true;
  }

  /**
   * Attempts to sync this manager's chart page selection to an approach procedure.
   * @param opId The ID of the current operation to change this manager's chart selection.
   * @param procedureIndex The index of the procedure in its parent airport's procedure array.
   * @param transitionIndex The index of the procedure's transition, or `-1` for the VECTORS transition.
   * @returns Whether the sync was successful.
   */
  private async syncToApproach(
    opId: number,
    procedureIndex: number,
    transitionIndex: number
  ): Promise<boolean> {
    if (!this.selectedAirportChartIndexData || !this.selectedAirportChartIndexData.source) {
      return true;
    }

    const fms = this.fplSourceDataProvider.fms.get();

    const airport = await fms.facLoader.tryGetFacility(
      FacilityType.Airport,
      this.selectedAirportChartIndexData.icao,
      AirportFacilityDataFlags.Approaches
    );

    if (opId !== this.chartSelectionOpId) {
      return false;
    }

    const approach = airport?.approaches[procedureIndex];

    if (!approach) {
      this.autoSelectAirportDiagramPage(this.selectedAirportChartIndexData);
      return true;
    }

    const approachPageData = this.selectedAirportChartIndexData.source.getApproachPage(
      this.selectedAirportChartIndexData.approachPages,
      ApproachUtils.getIdentifier(approach),
      approach.transitions[transitionIndex]?.name ?? ''
    );

    if (approachPageData) {
      this.doSelectPage(this.selectedAirportChartIndexData, approachPageData);
    } else {
      this.autoSelectAirportDiagramPage(this.selectedAirportChartIndexData);
    }

    return true;
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    ++this.chartSelectionOpId;

    this.preferredSource.destroy();
    this.airplaneDataProvider.destroy();
  }
}

/**
 * A provider of airplane data for {@link G3XChartsSelectionManager}.
 */
class AirplaneDataProvider {
  private readonly _isOnGround = ConsumerValue.create(null, false);
  /** Whether the airplane is on the ground. */
  public readonly isOnGround = this._isOnGround as Accessible<boolean>;

  /**
   * The current position of the airplane. If position data is not available, then both latitude and longitude will be
   * equal to `NaN`.
   */
  public readonly planePosition: Accessible<GeoPointInterface>;

  /**
   * Creates a new instance of ChartsDisplayPaneManagerDataProvider.
   * @param bus The event bus.
   * @param posHeadingDataProvider A provider of airplane position and heading data.
   */
  public constructor(private readonly bus: EventBus, posHeadingDataProvider: PositionHeadingDataProvider) {
    this._isOnGround.setConsumer(bus.getSubscriber<AdcEvents>().on('on_ground'));
    this.planePosition = posHeadingDataProvider.pposWithFailure;
  }

  /**
   * Destroys this data provider.
   */
  public destroy(): void {
    this._isOnGround.destroy();
  }
}
