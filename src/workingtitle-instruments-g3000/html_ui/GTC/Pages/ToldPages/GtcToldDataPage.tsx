import {
  AirportFacility, FacilityLoader, FacilityType, FSComponent, ICAO, IcaoType, MagVar, MappedSubject, NodeReference,
  OneWayRunway, RunwayUtils, Subject, Subscribable, Subscription, UserSetting, VNode
} from '@microsoft/msfs-sdk';

import { AirportWaypoint, GarminFacilityWaypointCache, UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import {
  FlightPlanStore, PerformanceConfig, ToldLandingPerformanceResult, ToldTakeoffPerformanceResult, ToldUserSettings,
  VSpeedGroup, VSpeedGroupType, WeightFuelUserSettings
} from '@microsoft/msfs-wtg3000-common';

import { TabbedContainer, TabConfiguration } from '../../Components/Tabs/TabbedContainer';
import { TabbedContent } from '../../Components/Tabs/TabbedContent';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcToldDataPageOriginDestTab } from './GtcToldDataPageOriginDestTab';
import { GtcToldDataPageRunwayTab } from './GtcToldDataPageRunwayTab';
import { GtcToldDataPageTabContent } from './GtcToldDataPageTabContent';
import { GtcToldDataPageWeatherTab } from './GtcToldDataPageWeatherTab';

import './GtcToldDataPage.css';

/**
 * Component props for GtcToldDataPage.
 */
export interface GtcToldDataPageProps extends GtcViewProps {
  /** The facility loader. */
  facLoader: FacilityLoader;

  /** A performance calculations configuration object. */
  perfConfig: PerformanceConfig;

  /** The avionics system's defined reference V-speed groups. */
  vSpeedGroups: ReadonlyMap<VSpeedGroupType, VSpeedGroup>;

  /** The flight plan store. */
  flightPlanStore: FlightPlanStore;
}

/**
 * A GTC TOLD (takeoff/landing) data page.
 */
export abstract class GtcToldDataPage<
  ResultType extends ToldTakeoffPerformanceResult | ToldLandingPerformanceResult,
  P extends GtcToldDataPageProps = GtcToldDataPageProps
> extends GtcView<P> {

  private readonly tabContainerRef = FSComponent.createRef<TabbedContainer>();

  protected abstract readonly isTakeoff: boolean;

  protected readonly facWaypointCache = GarminFacilityWaypointCache.getCache(this.props.gtcService.bus);

  protected readonly toldSettingManager = ToldUserSettings.getManager(this.bus);
  protected readonly weightFuelSettingManager = WeightFuelUserSettings.getManager(this.bus);

  protected abstract readonly originDestIcaoSetting: UserSetting<string>;
  protected abstract readonly resultSetting: UserSetting<string>;

  protected readonly unitsSettingManager = UnitsUserSettings.getManager(this.bus);

  protected readonly selectedAirport = Subject.create<AirportWaypoint | null>(null);
  protected readonly selectedRunway = Subject.create<OneWayRunway | null>(null);

  protected readonly magVar = MappedSubject.create(
    ([airport, runway]) => {
      if (runway !== null) {
        return MagVar.get(runway.latitude, runway.longitude);
      } else if (airport !== null) {
        return MagVar.get(airport.location.get());
      } else {
        return 0;
      }
    },
    this.selectedAirport,
    this.selectedRunway
  );

  protected readonly result = Subject.create<ResultType | null>(null);

  protected readonly listItemHeight = this.props.gtcService.orientation === 'horizontal' ? 155 : 85;
  protected readonly listItemSpacing = this.props.gtcService.orientation === 'horizontal' ? 6 : 4;

  private originDestOpId = 0;

  protected isPaused = true;

  protected originDestIcaoSub?: Subscription;
  protected selectedAirportSub?: Subscription;
  protected selectedRunwaySub?: Subscription;
  private resultSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.selectedAirportSub = this.selectedAirport.sub(this.onSelectedAirportChanged.bind(this), false, true);
    this.selectedRunwaySub = this.selectedRunway.sub(this.updateOriginDestIcao.bind(this), false, true);

    this.originDestIcaoSub = this.originDestIcaoSetting.sub(this.onOriginDestIcaoChanged.bind(this), false, true);

    if (this.props.perfConfig.isToldSupported) {
      this.resultSub = this.resultSetting.sub(this.onResultChanged.bind(this), false, true);
    }
  }

  /**
   * Responds to when the origin/destination ICAO changes.
   * @param icao The origin/destination ICAO string (V2).
   */
  private async onOriginDestIcaoChanged(icao: string): Promise<void> {
    const selectedAirport = this.selectedAirport.get();

    const icaoValue = ICAO.stringV2ToValue(icao);
    const isRunway = ICAO.isValueFacility(icaoValue, FacilityType.RWY);
    const isAirport = !isRunway && ICAO.isValueFacility(icaoValue, FacilityType.Airport);

    this.selectedAirportSub?.pause();
    this.selectedRunwaySub?.pause();

    if (!isRunway && !isAirport) {
      this.selectedAirport.set(null);
      this.selectedRunway.set(null);
      this.selectedRunwaySub?.resume();
      this.selectedAirportSub?.resume();
      this.updateOriginDestIcao();
      return;
    }

    const airportIcao = isAirport ? icaoValue : ICAO.value(IcaoType.Airport, '', '', icaoValue.airport);
    let airportFacility: AirportFacility | null = null;

    // Note: airportIcao cannot be the empty ICAO.

    if (!selectedAirport || !ICAO.valueEquals(selectedAirport.facility.get().icaoStruct, airportIcao)) {
      const opId = ++this.originDestOpId;

      airportFacility = await this.props.facLoader.tryGetFacility(FacilityType.Airport, airportIcao);

      if (this.isPaused || opId !== this.originDestOpId) {
        return;
      }

      if (!airportFacility) {
        this.selectedAirport.set(null);
        this.selectedRunway.set(null);
        this.selectedRunwaySub?.resume();
        this.selectedAirportSub?.resume();
        this.updateOriginDestIcao();
        return;
      }

      this.selectedAirport.set(this.facWaypointCache.get(airportFacility) as AirportWaypoint);
    } else {
      airportFacility = selectedAirport.facility.get();
    }

    if (isRunway) {
      const runway = RunwayUtils.matchOneWayRunwayFromIdent(airportFacility, icaoValue.ident);
      if (runway === undefined) {
        console.warn(`GtcTakeoffDataPage: could not retrieve runway for ICAO: ${icao}`);
        this.selectedRunway.set(null);
      } else {
        this.selectedRunway.set(runway);
      }
    } else {
      this.selectedRunway.set(null);
    }

    this.selectedRunwaySub?.resume();
    this.selectedAirportSub?.resume();
    this.updateOriginDestIcao();
  }

  /**
   * Responds to when the selected airport changes.
   * @param waypoint The selected airport.
   */
  private onSelectedAirportChanged(waypoint: AirportWaypoint | null): void {
    this.selectedRunwaySub?.pause();

    if (waypoint === null) {
      this.selectedRunway.set(null);
    } else {
      const fac = waypoint.facility.get();

      // Attempt to select the first available runway at the airport.
      if (fac.runways.length === 0) {
        this.selectedRunway.set(null);
      } else {
        this.selectedRunway.set(RunwayUtils.getOneWayRunways(fac.runways[0], 0)[0]);
      }
    }

    this.selectedRunwaySub?.resume();
    this.updateOriginDestIcao();
  }

  /**
   * Updates the origin/destination ICAO setting based on the selected airport and runway.
   */
  private updateOriginDestIcao(): void {
    const selectedAirport = this.selectedAirport.get();

    if (selectedAirport === null) {
      this.originDestIcaoSetting.value = '';
      return;
    }

    const selectedRunway = this.selectedRunway.get();

    if (selectedRunway === null) {
      this.originDestIcaoSetting.value = ICAO.tryValueToStringV2(selectedAirport.facility.get().icaoStruct);
    } else {
      this.originDestIcaoSetting.value = ICAO.tryValueToStringV2(
        RunwayUtils.getRunwayFacilityIcaoValue(selectedAirport.facility.get(), selectedRunway)
      );
    }
  }

  /**
   * Responds to when the performance calculation result changes.
   * @param resultString The stringified performance calculation result.
   */
  private onResultChanged(resultString: string): void {
    if (resultString === '') {
      this.result.set(null);
      this.tabContainerRef.instance.setTabEnabled(5, false);
      return;
    }

    const result = this.parseResult(resultString);
    this.result.set(result);
    this.tabContainerRef.instance.setTabEnabled(5, result !== null);
  }

  /**
   * Parses a performance result object from a string.
   * @param resultString The stringified result object.
   * @returns The performance result object parsed from the specified string, or `null` if the string does not define
   * such an object.
   */
  protected abstract parseResult(resultString: string): ResultType | null;

  /** @inheritdoc */
  public onOpen(): void {
    this.tabContainerRef.instance.selectTab(1);
  }

  /** @inheritdoc */
  public onResume(): void {
    this.isPaused = false;

    this.selectedRunwaySub?.resume();
    this.selectedAirportSub?.resume();
    this.originDestIcaoSub?.resume(true);
    this.resultSub?.resume(true);

    this.tabContainerRef.instance.resume();
  }

  /** @inheritdoc */
  public onPause(): void {
    this.isPaused = true;

    this.tabContainerRef.instance.pause();

    this.originDestIcaoSub?.pause();
    this.selectedAirportSub?.pause();
    this.selectedRunwaySub?.pause();
    this.resultSub?.pause();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={`told-data-page ${this.getRootCssClass()}`}>
        <TabbedContainer ref={this.tabContainerRef} configuration={TabConfiguration.Left5} class='told-data-page-tabs'>
          {this.props.perfConfig.isToldSupported ? this.renderTabsWithPerformance() : this.renderTabsWithoutPerformance()}
        </TabbedContainer>
      </div>
    );
  }

  /**
   * Gets this page's root CSS class.
   * @returns This page's root CSS class.
   */
  protected abstract getRootCssClass(): string;

  /**
   * Renders this page's tabs without performance calculation support.
   * @returns This page's tabs without performance calculation support, as an array of VNodes.
   */
  protected renderTabsWithoutPerformance(): VNode[] {
    return [
      this.renderTab(1, this.isTakeoff ? 'Origin' : 'Destination', this.renderOriginDestTab.bind(this)),
      this.renderTab(2, 'Runway', this.renderRunwayTab.bind(this)),
    ];
  }

  /**
   * Renders this page's tabs with performance calculation support.
   * @returns This page's tabs without performance calculation support, as an array of VNodes.
   */
  protected renderTabsWithPerformance(): VNode[] {
    return [
      this.renderTab(1, this.isTakeoff ? 'Origin' : 'Destination', this.renderOriginDestTab.bind(this)),
      this.renderTab(2, 'Weather', this.renderWeatherTab.bind(this)),
      this.renderTab(3, 'Runway', this.renderRunwayTab.bind(this)),
      this.renderTab(4, `${this.isTakeoff ? 'Takeoff' : 'Landing'}<br>Config`, this.renderConfigTab.bind(this)),
      this.renderTab(5, `${this.isTakeoff ? 'Takeoff' : 'Landing'}<br>Data`, this.renderDataTab.bind(this))
    ];
  }

  /**
   * Renders a tab for this page's tab container.
   * @param position The position of the tab.
   * @param label The tab label.
   * @param renderContent A function which renders the tab contents.
   * @returns A tab for this page's tab container, as a VNode.
   */
  protected renderTab(
    position: number,
    label: string,
    renderContent?: (contentRef: NodeReference<GtcToldDataPageTabContent>, sidebarState: Subscribable<SidebarState | null>) => VNode
  ): VNode {
    const contentRef = FSComponent.createRef<GtcToldDataPageTabContent>();
    const sidebarState = Subject.create<SidebarState | null>(null);

    return (
      <TabbedContent
        position={position}
        label={label}
        onPause={(): void => {
          this._activeComponent.set(null);
          sidebarState.set(null);
          contentRef.instance.onPause();
        }}
        onResume={(): void => {
          this._activeComponent.set(contentRef.getOrDefault());
          sidebarState.set(this._sidebarState);
          contentRef.instance.onResume();
        }}
        disabled={renderContent === undefined}
      >
        {renderContent && renderContent(contentRef, sidebarState)}
      </TabbedContent>
    );
  }

  /**
   * Renders this page's origin/destination tab.
   * @param contentRef A reference to assign to the tab's content.
   * @returns This page's origin/destination tab, as a VNode.
   */
  protected renderOriginDestTab(contentRef: NodeReference<GtcToldDataPageTabContent>): VNode {
    return (
      <GtcToldDataPageOriginDestTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        facWaypointCache={this.facWaypointCache}
        selectedAirport={this.selectedAirport}
        selectedRunway={this.selectedRunway}
        toldSettingManager={this.toldSettingManager}
        unitsSettingManager={this.unitsSettingManager}
        isTakeoff={this.isTakeoff}
        supportPerformance={this.props.perfConfig.isToldSupported}
      />
    );
  }

  /**
   * Renders this page's weather tab.
   * @param contentRef A reference to assign to the tab's content.
   * @returns This page's weather tab, as a VNode.
   */
  protected renderWeatherTab(contentRef: NodeReference<GtcToldDataPageTabContent>): VNode {
    return (
      <GtcToldDataPageWeatherTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        controlMode={this.props.controlMode}
        displayPaneIndex={this.props.displayPaneIndex}
        facLoader={this.props.facLoader}
        selectedAirport={this.selectedAirport}
        selectedRunway={this.selectedRunway}
        magVar={this.magVar}
        toldSettingManager={this.toldSettingManager}
        unitsSettingManager={this.unitsSettingManager}
        isTakeoff={this.isTakeoff}
      />
    );
  }

  /**
   * Renders this page's runway tab.
   * @param contentRef A reference to assign to the tab's content.
   * @returns This page's runway tab, as a VNode.
   */
  protected renderRunwayTab(contentRef: NodeReference<GtcToldDataPageTabContent>): VNode {
    return (
      <GtcToldDataPageRunwayTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        controlMode={this.props.controlMode}
        displayPaneIndex={this.props.displayPaneIndex}
        selectedAirport={this.selectedAirport}
        selectedRunway={this.selectedRunway}
        magVar={this.magVar}
        toldSettingManager={this.toldSettingManager}
        unitsSettingManager={this.unitsSettingManager}
        isTakeoff={this.isTakeoff}
      />
    );
  }

  /**
   * Renders this page's config tab.
   * @param contentRef A reference to assign to the tab's content.
   * @param sidebarState The sidebar state to use.
   * @returns This page's config tab, as a VNode.
   */
  protected abstract renderConfigTab(contentRef: NodeReference<GtcToldDataPageTabContent>, sidebarState: Subscribable<SidebarState | null>): VNode;

  /**
   * Renders this page's data tab.
   * @param contentRef A reference to assign to the tab's content.
   * @returns This page's data tab, as a VNode.
   */
  protected abstract renderDataTab(contentRef: NodeReference<GtcToldDataPageTabContent>): VNode;

  /** @inheritdoc */
  public destroy(): void {
    this.tabContainerRef.getOrDefault()?.destroy();

    this.originDestIcaoSub?.destroy();
    this.resultSub?.destroy();

    super.destroy();
  }
}
