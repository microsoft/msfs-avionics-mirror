import {
  AirportFacility, AirportPrivateType, AirportRunway, AirportUtils, ApproachUtils, ArraySubject, ArrivalProcedure, BasicNavAngleSubject, BasicNavAngleUnit, ComponentProps,
  ComSpacing, DateTimeFormatter, DepartureProcedure, DisplayComponent, ExtendedApproachType, Facility, FacilityFrequencyType, FacilityLoader, FacilitySearchType, FacilityType,
  FacilityWaypoint, FSComponent, ICAO, MagVar, MappedSubject, MathUtils, Metar, MetarCloudLayer, MetarCloudLayerCoverage, MetarCloudLayerType,
  MetarVisibilityUnits, MetarWindSpeedUnits, MutableSubscribable, NodeReference, NumberFormatter, NumberUnitSubject, Procedure, RadioFrequencyFormatter,
  RadioUtils, RunwayLightingType, RunwaySurfaceCategory, RunwayUtils, Subject, Subscribable, Subscription, UnitType, VNode
} from '@microsoft/msfs-sdk';

import {
  AirportWaypoint, ApproachListItem, ComRadioSpacingSettingMode, ComRadioUserSettings, DirectToState, Fms, FmsUtils, LatLonDisplayFormat, ProcedureType,
  UnitsUserSettingManager, WaypointInfoStore
} from '@microsoft/msfs-garminsdk';
import {
  ApproachNameDisplay, BearingDisplay, DynamicList, DynamicListData, FlightPlanStore, G3000FmsUtils, G3000NearestContext, GarminLatLonDisplay, NumberUnitDisplay
} from '@microsoft/msfs-wtg3000-common';

import { GtcBearingArrow } from '../../Components/BearingArrow/GtcBearingArrow';
import { GtcList } from '../../Components/List/GtcList';
import { GtcListButton } from '../../Components/List/GtcListButton';
import { GtcListItem } from '../../Components/List/GtcListItem';
import { TabbedContainer, TabConfiguration } from '../../Components/Tabs/TabbedContainer';
import { TabbedContent } from '../../Components/Tabs/TabbedContent';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcLoadFrequencyDialog } from '../../Dialog/GtcLoadFrequencyDialog';
import { GtcInteractionEvent, GtcInteractionHandler } from '../../GtcService/GtcInteractionEvent';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcApproachPage } from '../Procedures/GtcApproachPage';
import { GtcArrivalPage } from '../Procedures/GtcArrivalPage';
import { GtcDeparturePage } from '../Procedures/GtcDeparturePage';
import { GtcWaypointInfoPage, GtcWaypointInfoPageNoWaypointMessage, GtcWaypointInfoPageProps } from './GtcWaypointInfoPage';

import './GtcAirportInfoPage.css';

/**
 * Component props for GtcAirportInfoPage.
 */
export interface GtcAirportInfoPageProps extends GtcWaypointInfoPageProps {
  /** The FMS. */
  fms: Fms;

  /** The flight plan store to use. */
  flightPlanStore: FlightPlanStore;

  /** Whether RNP (AR) approaches should be displayed. */
  allowRnpAr: boolean;
}

/**
 * GTC view keys for popups owned by airport information pages.
 */
enum GtcAirportInfoPagePopupKeys {
  Options = 'AirportInfoOptions'
}

/**
 * A GTC airport information page.
 */
export class GtcAirportInfoPage extends GtcWaypointInfoPage<FacilitySearchType.Airport, GtcAirportInfoPageProps> {
  protected readonly waypointSelectType = FacilitySearchType.Airport;
  protected readonly optionsPopupKey = GtcAirportInfoPagePopupKeys.Options;

  private readonly tabContainerRef = FSComponent.createRef<TabbedContainer>();

  private readonly selectedRunwayIndex = Subject.create(-1);

  private readonly selectionState = MappedSubject.create(
    this.selectedFacility,
    this.selectedRunwayIndex
  );

  private nearestContext?: G3000NearestContext;
  private autoSelectOpId = 0;

  /** @inheritdoc */
  public constructor(props: GtcAirportInfoPageProps) {
    super(props);

    G3000NearestContext.getInstance().then(instance => { this.nearestContext = instance; });
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this.selectionState.pipe(this.showOnMapData, ([facility, runwayIndex]) => {
      return { icao: facility?.icao ?? '', runwayIndex };
    });
  }

  /**
   * Initializes this page's airport selection.
   * @param facility The airport facility to select, or its ICAO. If not defined, an initial airport will automatically
   * be selected.
   */
  public async initSelection(facility?: AirportFacility | string): Promise<void> {
    if (facility === undefined) {
      const opId = ++this.autoSelectOpId;
      const selection = await this.autoSelectFacility();

      if (opId === this.autoSelectOpId) {
        this.selectedWaypoint.set(selection === null ? null : this.facWaypointCache.get(selection) as AirportWaypoint);
      }
    } else {
      if (typeof facility === 'string') {
        if (ICAO.isFacility(facility, FacilityType.Airport)) {
          try {
            facility = await this.props.facLoader.getFacility(FacilityType.Airport, facility);
            this.selectedWaypoint.set(this.facWaypointCache.get(facility) as AirportWaypoint);
          } catch {
            // noop
          }
        }
      } else {
        this.selectedWaypoint.set(this.facWaypointCache.get(facility) as AirportWaypoint);
      }
    }
  }

  /**
   * Automatically selects an airport facility. The selected airport will be one of the following, in order of
   * decreasing priority:
   * * The current active flight plan waypoint (if it is an airport).
   * * The current destination airport in the primary flight plan.
   * * The last airport waypoint that appears in the primary flight plan.
   * * The current origin airport in the primary flight plan.
   * * The nearest airport to the airplane's current position.
   * * The most recently selected airport.
   * @returns A Promise which is fulfilled with the automatically selected airport facility or `null` if a selection
   * could not be made.
   */
  private async autoSelectFacility(): Promise<AirportFacility | null> {
    // ---- Active waypoint ----

    const activeFlightPlan = this.props.fms.getDirectToState() === DirectToState.TORANDOM
      ? this.props.fms.getDirectToFlightPlan()
      : this.props.fms.hasPrimaryFlightPlan() ? this.props.fms.getPrimaryFlightPlan() : undefined;

    const activeLegIcao = activeFlightPlan?.tryGetLeg(activeFlightPlan.activeLateralLeg)?.leg.fixIcao;
    if (activeLegIcao !== undefined && ICAO.isFacility(activeLegIcao) && ICAO.getFacilityType(activeLegIcao) === FacilityType.Airport) {
      try {
        const activeLegFacility = await this.props.fms.facLoader.getFacility(FacilityType.Airport, activeLegIcao);
        return activeLegFacility;
      } catch {
        // noop
      }
    }

    // ---- Destination airport ----

    const destinationFacility = this.props.flightPlanStore.destinationFacility.get();
    if (destinationFacility !== undefined) {
      return destinationFacility;
    }

    // ---- Last airport in primary flight plan ----

    const lastAirportIcao = FmsUtils.getLastAirportFromPlan(this.props.fms.getFlightPlan(Fms.PRIMARY_PLAN_INDEX));
    if (lastAirportIcao !== undefined && ICAO.isFacility(lastAirportIcao)) {
      try {
        const lastAirportFacility = await this.props.fms.facLoader.getFacility(FacilityType.Airport, lastAirportIcao);
        return lastAirportFacility;
      } catch {
        // noop
      }
    }

    // ---- Origin airport ----

    const originFacility = this.props.flightPlanStore.originFacility.get();
    if (originFacility !== undefined) {
      return originFacility;
    }

    // ---- Nearest airport ----

    if (this.nearestContext !== undefined) {
      const nearest = this.nearestContext.getNearest(FacilityType.Airport);
      if (nearest !== undefined) {
        return nearest;
      }
    }

    // ---- Last selected airport ----

    return this.selectedFacility.get();
  }

  /** @inheritdoc */
  public onOpen(): void {
    super.onOpen();

    this.tabContainerRef.instance.selectTab(1);
  }

  /** @inheritdoc */
  public onResume(): void {
    super.onResume();

    this.tabContainerRef.instance.resume();
  }

  /** @inheritdoc */
  public onPause(): void {
    super.onPause();

    this.tabContainerRef.instance.pause();
  }

  /** @inheritdoc */
  protected getCssClass(): string {
    return 'airport-info-page';
  }

  /** @inheritdoc */
  protected renderContent(): VNode {
    return (
      <TabbedContainer ref={this.tabContainerRef} configuration={TabConfiguration.LeftRight4} class='airport-info-page-tab-container'>
        {this.renderTab(1, 'Info', this.renderInfoTab.bind(this))}
        {this.renderTab(2, 'Freqs', this.renderFreqTab.bind(this))}
        {this.renderTab(3, 'Weather', this.renderWeatherTab.bind(this))}
        {this.renderTab(4, 'APT DIR')}
        {this.renderTab(5, 'Charts')}
        {this.renderTab(6, 'Runways', this.renderRunwaysTab.bind(this))}
        {this.renderTab(7, 'Chart<br>NOTAMs')}
        {this.renderTab(8, 'Proc', this.renderProcTab.bind(this))}
      </TabbedContainer>
    );
  }

  /**
   * Renders a tab for this page's tab container.
   * @param position The position of the tab.
   * @param label The tab label.
   * @param renderContent A function which renders the tab contents.
   * @returns A tab for this page's tab container, as a VNode.
   */
  private renderTab(
    position: number,
    label: string,
    renderContent?: (
      contentRef: NodeReference<GtcAirportInfoPageTabContent>,
      title: MutableSubscribable<string | undefined>,
      sidebarState: Subscribable<SidebarState | null>
    ) => VNode
  ): VNode {
    const contentRef = FSComponent.createRef<GtcAirportInfoPageTabContent>();
    const title = Subject.create<string | undefined>(undefined);
    const sidebarState = Subject.create<SidebarState | null>(null);

    const titlePipe = title.pipe(this._title, true);

    return (
      <TabbedContent
        position={position}
        label={label}
        onPause={(): void => {
          this._activeComponent.set(null);
          titlePipe.pause();
          sidebarState.set(null);
          contentRef.instance.onPause();
        }}
        onResume={(): void => {
          this._activeComponent.set(contentRef.getOrDefault());
          titlePipe.resume(true);
          sidebarState.set(this._sidebarState);
          contentRef.instance.onResume();
        }}
        onDestroy={(): void => {
          titlePipe.destroy();
        }}
        disabled={renderContent === undefined}
      >
        {renderContent && renderContent(contentRef, title, sidebarState)}
      </TabbedContent>
    );
  }

  /**
   * Renders the info tab.
   * @param contentRef A reference to assign to the tab's content.
   * @param title A mutable subscribable to set to the tab's requested GTC view title.
   * @param sidebarState The sidebar state to use.
   * @returns The info tab, as a VNode.
   */
  private renderInfoTab(
    contentRef: NodeReference<GtcAirportInfoPageTabContent>,
    title: MutableSubscribable<string | undefined>,
    sidebarState: Subscribable<SidebarState | null>
  ): VNode {
    return (
      <GtcAirportInfoPageInfoTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        waypoint={this.selectedWaypoint}
        facility={this.selectedFacility}
        title={title}
        sidebarState={sidebarState}
        waypointInfo={this.selectedWaypointInfo}
        waypointRelativeBearing={this.selectedWaypointRelativeBearing}
        unitsSettingManager={this.unitsSettingManager}
      />
    );
  }

  /**
   * Renders the freq tab.
   * @param contentRef A reference to assign to the tab's content.
   * @param title A mutable subscribable to set to the tab's requested GTC view title.
   * @param sidebarState The sidebar state to use.
   * @returns The freq tab, as a VNode.
   */
  private renderFreqTab(
    contentRef: NodeReference<GtcAirportInfoPageTabContent>,
    title: MutableSubscribable<string | undefined>,
    sidebarState: Subscribable<SidebarState | null>
  ): VNode {
    return (
      <GtcAirportInfoPageFreqTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        waypoint={this.selectedWaypoint}
        facility={this.selectedFacility}
        title={title}
        sidebarState={sidebarState}
        facLoader={this.props.facLoader}
      />
    );
  }

  /**
   * Renders the weather tab.
   * @param contentRef A reference to assign to the tab's content.
   * @param title A mutable subscribable to set to the tab's requested GTC view title.
   * @param sidebarState The sidebar state to use.
   * @returns The weather tab, as a VNode.
   */
  private renderWeatherTab(
    contentRef: NodeReference<GtcAirportInfoPageTabContent>,
    title: MutableSubscribable<string | undefined>,
    sidebarState: Subscribable<SidebarState | null>
  ): VNode {
    return (
      <GtcAirportInfoPageWeatherTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        waypoint={this.selectedWaypoint}
        facility={this.selectedFacility}
        title={title}
        sidebarState={sidebarState}
        facLoader={this.props.fms.facLoader}
        waypointInfo={this.selectedWaypointInfo}
        waypointRelativeBearing={this.selectedWaypointRelativeBearing}
        unitsSettingManager={this.unitsSettingManager}
      />
    );
  }

  /**
   * Renders the runways tab.
   * @param contentRef A reference to assign to the tab's content.
   * @param title A mutable subscribable to set to the tab's requested GTC view title.
   * @param sidebarState The sidebar state to use.
   * @returns The runways tab, as a VNode.
   */
  private renderRunwaysTab(
    contentRef: NodeReference<GtcAirportInfoPageTabContent>,
    title: MutableSubscribable<string | undefined>,
    sidebarState: Subscribable<SidebarState | null>
  ): VNode {
    return (
      <GtcAirportInfoPageRunwaysTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        waypoint={this.selectedWaypoint}
        facility={this.selectedFacility}
        title={title}
        sidebarState={sidebarState}
        selectedRunwayIndex={this.selectedRunwayIndex}
        unitsSettingManager={this.unitsSettingManager}
      />
    );
  }

  /**
   * Renders the proc tab.
   * @param contentRef A reference to assign to the tab's content.
   * @param title A mutable subscribable to set to the tab's requested GTC view title.
   * @param sidebarState The sidebar state to use.
   * @returns The proc tab, as a VNode.
   */
  private renderProcTab(
    contentRef: NodeReference<GtcAirportInfoPageTabContent>,
    title: MutableSubscribable<string | undefined>,
    sidebarState: Subscribable<SidebarState | null>
  ): VNode {
    return (
      <GtcAirportInfoPageProcTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        waypoint={this.selectedWaypoint}
        facility={this.selectedFacility}
        title={title}
        sidebarState={sidebarState}
        allowRnpAr={this.props.allowRnpAr}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.tabContainerRef.getOrDefault()?.destroy();

    super.destroy();
  }
}

/**
 * Component props for GTC airport information page tab contents.
 */
interface GtcAirportInfoPageTabContentProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** The selected waypoint. */
  waypoint: Subscribable<AirportWaypoint | null>;

  /** The facility associated with the selected waypoint. */
  facility: Subscribable<AirportFacility | null>;

  /** A mutable subscribable to set to the tab's requested GTC view title. */
  title: MutableSubscribable<string | undefined>;

  /** The SidebarState to use. */
  sidebarState: Subscribable<SidebarState | null>;
}

/**
 * A content component for a GTC airport information page tab.
 */
interface GtcAirportInfoPageTabContent extends DisplayComponent<GtcAirportInfoPageTabContentProps>, GtcInteractionHandler {
  /** A method which is called when this component's parent tab is paused. */
  onPause(): void;

  /** A method which is called when this component's parent tab is resumed. */
  onResume(): void;
}

/**
 * Component props for GtcAirportInfoPageInfoTab.
 */
interface GtcAirportInfoPageInfoTabProps extends GtcAirportInfoPageTabContentProps {
  /** An information store for the selected airport waypoint. */
  waypointInfo: WaypointInfoStore;

  /**
   * The bearing to the selected airport waypoint, relative to the airplane's current heading, or `NaN` if there is no
   * selected waypoint or position/heading data is invalid.
   */
  waypointRelativeBearing: Subscribable<number>;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;
}

/**
 * A GTC airport information page info tab.
 */
class GtcAirportInfoPageInfoTab extends DisplayComponent<GtcAirportInfoPageInfoTabProps> implements GtcAirportInfoPageTabContent {
  private static readonly BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '__._' });
  private static readonly ELEVATION_FORMATTER = NumberFormatter.create({ precision: 1, useMinusSign: true, nanString: '____' });

  private static readonly ACCESS_TYPE_TEXT = {
    [AirportPrivateType.Public]: 'PUBLIC',
    [AirportPrivateType.Private]: 'PRIVATE',
    [AirportPrivateType.Military]: 'MILITARY',
    [AirportPrivateType.Uknown]: 'UNKNOWN',
  };

  private thisNode?: VNode;

  private readonly cityText = this.props.waypointInfo.city.map(city => city ?? ' ');
  private readonly regionText = this.props.waypointInfo.region.map(region => region ?? ' ');

  private readonly elevation = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));
  private readonly accessTypeText = this.props.facility.map(facility => {
    if (facility === null) {
      return '';
    }

    return GtcAirportInfoPageInfoTab.ACCESS_TYPE_TEXT[facility.airportPrivateType];
  });

  private titlePipe?: Subscription;
  private elevationPipe?: Subscription;
  private sidebarStateSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.titlePipe = this.props.facility.pipe(
      this.props.title,
      facility => `Airport Information${facility === null ? '' : ` – ${ICAO.getIdent(facility.icao)}`}`
    );

    this.elevationPipe = this.props.facility.pipe(this.elevation, facility => {
      if (facility === null) {
        return NaN;
      }

      return AirportUtils.getElevation(facility) ?? NaN;
    });

    this.sidebarStateSub = this.props.sidebarState.sub(sidebarState => {
      sidebarState?.slot5.set(null);
    }, true);
  }

  /** @inheritdoc */
  public onPause(): void {
    // noop
  }

  /** @inheritdoc */
  public onResume(): void {
    // noop
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(): boolean {
    return false;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <div class='airport-info-page-tab airport-info-page-info'>
          <div class='airport-info-page-info-section airport-info-page-info-section-bottom-separator airport-info-page-info-city-region'>
            <div>{this.cityText}</div>
            <div>{this.regionText}</div>
          </div>
          <div class='airport-info-page-info-section airport-info-page-info-section-bottom-separator airport-info-page-info-pos'>
            <div class='airport-info-page-info-pos-top'>
              <div class='airport-info-page-info-field airport-info-page-info-gps-field'>
                <div class='airport-info-page-info-field-title'>BRG</div>
                <div class='airport-info-page-bearing'>
                  <BearingDisplay
                    value={this.props.waypointInfo.bearing}
                    displayUnit={this.props.unitsSettingManager.navAngleUnits}
                    formatter={GtcAirportInfoPageInfoTab.BEARING_FORMATTER}
                  />
                  <GtcBearingArrow
                    relativeBearing={this.props.waypointRelativeBearing}
                  />
                </div>
              </div>
              <div class='airport-info-page-info-field airport-info-page-info-gps-field'>
                <div class='airport-info-page-info-field-title'>DIS</div>
                <NumberUnitDisplay
                  value={this.props.waypointInfo.distance}
                  displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
                  formatter={GtcAirportInfoPageInfoTab.DISTANCE_FORMATTER}
                />
              </div>
            </div>
            <GarminLatLonDisplay
              value={this.props.waypointInfo.location}
              format={LatLonDisplayFormat.HDDD_MMmm}
              class='airport-info-page-info-coords'
            />
          </div>
          <div class='airport-info-page-info-section airport-info-page-info-section-bottom-separator airport-info-page-info-elev-time'>
            <div class='airport-info-page-info-field'>
              <div class='airport-info-page-info-field-title'>Elev</div>
              <NumberUnitDisplay
                value={this.elevation}
                displayUnit={this.props.unitsSettingManager.altitudeUnits}
                formatter={GtcAirportInfoPageInfoTab.ELEVATION_FORMATTER}
              />
            </div>
            <div class='airport-info-page-info-field'>
              <div class='airport-info-page-info-field-title'>Time</div>
              <div>–––</div>
            </div>
          </div>
          <div class='airport-info-page-info-section airport-info-page-info-fuel-access'>
            <div class='airport-info-page-info-field'>
              <div class='airport-info-page-info-field-title'>Fuel</div>
              <div>–––</div>
            </div>
            <div class='airport-info-page-info-field'>
              {this.accessTypeText}
            </div>
          </div>
        </div>
        <GtcWaypointInfoPageNoWaypointMessage selectedWaypoint={this.props.waypoint as Subscribable<FacilityWaypoint<Facility> | null>}>
          No Airport Available
        </GtcWaypointInfoPageNoWaypointMessage>
      </>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    if (this.thisNode !== undefined) {
      FSComponent.visitNodes(this.thisNode, node => {
        if (node !== this.thisNode && node.instance instanceof DisplayComponent) {
          node.instance.destroy();
          return true;
        } else {
          return false;
        }
      });
    }

    this.cityText.destroy();
    this.regionText.destroy();
    this.accessTypeText.destroy();

    this.titlePipe?.destroy();
    this.elevationPipe?.destroy();
    this.sidebarStateSub?.destroy();

    super.destroy();
  }
}

/**
 * Data for an airport frequency.
 */
interface AirportFrequencyData extends DynamicListData {
  /** The frequency's parent airport. */
  facility: AirportFacility;

  /** The type of the frequency. */
  type: FacilityFrequencyType;

  /** The frequency's radio type. */
  radioType: 'COM' | 'NAV';

  /** The name of the frequency. */
  name: string;

  /** The frequency value, in hertz. */
  frequencyHz: number;
}

/**
 * Component props for GtcAirportInfoPageFreqTab.
 */
interface GtcAirportInfoPageFreqTabProps extends GtcAirportInfoPageTabContentProps {
  /** A facility loader. */
  facLoader: FacilityLoader;
}

/**
 * A GTC airport information page frequencies tab.
 */
class GtcAirportInfoPageFreqTab extends DisplayComponent<GtcAirportInfoPageFreqTabProps> implements GtcAirportInfoPageTabContent {
  private static readonly FREQ_NAME_MAP = {
    [FacilityFrequencyType.ASOS]: 'ASOS',
    [FacilityFrequencyType.ATIS]: 'ATIS',
    [FacilityFrequencyType.AWOS]: 'AWOS',
    [FacilityFrequencyType.Approach]: 'APPROACH',
    [FacilityFrequencyType.CPT]: 'PRE-TAXI',
    [FacilityFrequencyType.CTAF]: 'CTAF',
    [FacilityFrequencyType.Center]: 'CENTER',
    [FacilityFrequencyType.Clearance]: 'CLEARANCE',
    [FacilityFrequencyType.Departure]: 'DEPARTURE',
    [FacilityFrequencyType.FSS]: 'FSS',
    [FacilityFrequencyType.GCO]: 'GCO',
    [FacilityFrequencyType.Ground]: 'GROUND',
    [FacilityFrequencyType.Multicom]: 'MULTICOM',
    [FacilityFrequencyType.Tower]: 'TOWER',
    [FacilityFrequencyType.Unicom]: 'UNICOM',
    [FacilityFrequencyType.None]: 'UNKNOWN'
  };

  private static readonly FREQ_TYPE_PRIORITY = {
    [FacilityFrequencyType.ATIS]: 0,
    [FacilityFrequencyType.ASOS]: 1,
    [FacilityFrequencyType.AWOS]: 2,
    [FacilityFrequencyType.CTAF]: 3,
    [FacilityFrequencyType.CPT]: 4,
    [FacilityFrequencyType.Clearance]: 5,
    [FacilityFrequencyType.Ground]: 6,
    [FacilityFrequencyType.Tower]: 7,
    [FacilityFrequencyType.Unicom]: 8,
    [FacilityFrequencyType.Multicom]: 9,
    [FacilityFrequencyType.Departure]: 10,
    [FacilityFrequencyType.Approach]: 11,
    [FacilityFrequencyType.FSS]: 12,
    [FacilityFrequencyType.GCO]: 13,
    [FacilityFrequencyType.Center]: 14,
    [FacilityFrequencyType.None]: 15
  };

  private static readonly FREQ_SORT = (a: AirportFrequencyData, b: AirportFrequencyData): number => {
    return GtcAirportInfoPageFreqTab.FREQ_TYPE_PRIORITY[a.type] - GtcAirportInfoPageFreqTab.FREQ_TYPE_PRIORITY[b.type];
  };

  private static readonly NAV_FORMATTER = RadioFrequencyFormatter.createNav();
  private static readonly COM_25_FORMATTER = RadioFrequencyFormatter.createCom(ComSpacing.Spacing25Khz);
  private static readonly COM_833_FORMATTER = RadioFrequencyFormatter.createCom(ComSpacing.Spacing833Khz);

  private static readonly ILS_LOC_APPROACH_TYPES = new Set<ExtendedApproachType>([
    ApproachType.APPROACH_TYPE_ILS,
    ApproachType.APPROACH_TYPE_LOCALIZER,
    ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE,
    ApproachType.APPROACH_TYPE_LDA,
    ApproachType.APPROACH_TYPE_SDF
  ]);

  private readonly listRef = FSComponent.createRef<GtcList<AirportFrequencyData>>();
  private readonly noWaypointRef = FSComponent.createRef<GtcWaypointInfoPageNoWaypointMessage>();

  private readonly listItemHeight = this.props.gtcService.isHorizontal ? 130 : 69;

  private readonly frequencies = ArraySubject.create<AirportFrequencyData>();

  private readonly comSpacingModeSetting = ComRadioUserSettings.getManager(this.props.gtcService.bus).getSetting('comRadioSpacing');

  private readonly facilityState = MappedSubject.create(
    this.props.facility,
    this.comSpacingModeSetting
  );

  private generateFrequencyDataOpId = 0;

  private titlePipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.titlePipe = this.props.facility.pipe(
      this.props.title,
      facility => `Airport Frequencies${facility === null ? '' : ` – ${ICAO.getIdent(facility.icao)}`}`
    );

    this.facilityState.sub(async ([facility, comSpacingMode]) => {
      if (facility === null) {
        this.frequencies.clear();
      } else {
        const opId = ++this.generateFrequencyDataOpId;
        const data = await this.generateFrequencyData(facility, comSpacingMode);

        if (opId !== this.generateFrequencyDataOpId) {
          return;
        }

        this.frequencies.set(data);
      }

      this.listRef.instance.scrollToIndex(0, 0, false);
    }, true);
  }

  /** @inheritdoc */
  public onPause(): void {
    // noop
  }

  /** @inheritdoc */
  public onResume(): void {
    // noop
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    return this.listRef.instance.onGtcInteractionEvent(event);
  }

  /**
   * Generates a frequency data array from an airport facility.
   * @param facility An airport facility.
   * @param comSpacingMode The current COM channel spacing mode.
   * @returns An array of frequency data for the specified airport.
   */
  private async generateFrequencyData(facility: AirportFacility, comSpacingMode: ComRadioSpacingSettingMode): Promise<AirportFrequencyData[]> {
    const data: AirportFrequencyData[] = [];

    const frequencies = facility.frequencies;
    for (let i = 0; i < frequencies.length; i++) {
      const freq = frequencies[i];

      const freqHz = MathUtils.round(freq.freqMHz * 1e6, 1e3);
      if (freqHz < 118e6) {
        // Do not include ILS/LOC frequencies.
        continue;
      }

      if (comSpacingMode !== ComRadioSpacingSettingMode.Spacing8_33Khz && RadioUtils.isCom833Frequency(freqHz / 1e6)) {
        // Do not include 8.33 kHz spacing frequencies when in 25 kHz spacing mode.
        continue;
      }

      data.push({
        facility,
        type: freq.type,
        radioType: 'COM',
        name: GtcAirportInfoPageFreqTab.FREQ_NAME_MAP[freq.type],
        frequencyHz: freqHz
      });
    }

    data.sort(GtcAirportInfoPageFreqTab.FREQ_SORT);

    // Populate ILS/LOC frequencies

    const approachItems = FmsUtils.getApproaches(facility, false)
      .filter(approachItem => GtcAirportInfoPageFreqTab.ILS_LOC_APPROACH_TYPES.has(approachItem.approach.approachType))
      .sort(G3000FmsUtils.sortApproachItem);
    const referenceFacilities = await Promise.all(approachItems.map(approachItem => ApproachUtils.getReferenceFacility(approachItem.approach, this.props.facLoader)));

    for (let i = 0; i < referenceFacilities.length; i++) {
      const referenceFacility = referenceFacilities[i];
      if (referenceFacility) {
        data.push({
          facility,
          type: FacilityFrequencyType.None,
          radioType: 'NAV',
          name: FmsUtils.getApproachNameAsString(approachItems[i].approach),
          frequencyHz: MathUtils.round(referenceFacility.freqMHz * 1e6, 1e3)
        });
      }
    }

    return data;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <div class='airport-info-page-tab airport-info-page-freq'>
          <GtcList
            ref={this.listRef}
            bus={this.props.gtcService.bus}
            data={this.frequencies}
            renderItem={data => {
              const comSpacing = this.comSpacingModeSetting.value === ComRadioSpacingSettingMode.Spacing8_33Khz ? ComSpacing.Spacing833Khz : ComSpacing.Spacing25Khz;
              const formatter = data.radioType === 'NAV'
                ? GtcAirportInfoPageFreqTab.NAV_FORMATTER
                : comSpacing === ComSpacing.Spacing833Khz
                  ? GtcAirportInfoPageFreqTab.COM_833_FORMATTER
                  : GtcAirportInfoPageFreqTab.COM_25_FORMATTER;

              return (
                <GtcListItem class='airport-info-page-freq-row'>
                  <div class='airport-info-page-freq-row-left'>{data.name}</div>
                  <GtcTouchButton
                    label={formatter(data.frequencyHz)}
                    onPressed={() => {
                      this.props.gtcService.openPopup<GtcLoadFrequencyDialog>(GtcViewKeys.LoadFrequencyDialog)
                        .ref.request({
                          type: data.radioType,
                          comChannelSpacing: comSpacing,
                          frequency: data.frequencyHz / 1e6,
                          label: data.radioType === 'NAV' ? '' : `${ICAO.getIdent(data.facility.icao)} ${data.name}`
                        });
                    }}
                    isInList
                    gtcOrientation={this.props.gtcService.orientation}
                    class='airport-info-page-freq-row-right'
                  />
                </GtcListItem>
              );
            }}
            sidebarState={this.props.sidebarState}
            listItemHeightPx={this.listItemHeight}
            listItemSpacingPx={1}
            itemsPerPage={4}
            maxRenderedItemCount={20}
            class='airport-info-page-freq-list'
          />
        </div>
        <GtcWaypointInfoPageNoWaypointMessage ref={this.noWaypointRef} selectedWaypoint={this.props.waypoint as Subscribable<FacilityWaypoint<Facility> | null>}>
          No Airport Available
        </GtcWaypointInfoPageNoWaypointMessage>
      </>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();
    this.noWaypointRef.getOrDefault()?.destroy();

    this.facilityState.destroy();

    this.titlePipe?.destroy();

    super.destroy();
  }
}

/**
 * Component props for GtcAirportInfoPageWeatherTab.
 */
interface GtcAirportInfoPageWeatherTabProps extends GtcAirportInfoPageTabContentProps {
  /** The facility loader. */
  facLoader: FacilityLoader;

  /** An information store for the selected airport waypoint. */
  waypointInfo: WaypointInfoStore;

  /**
   * The bearing to the selected airport waypoint, relative to the airplane's current heading, or `NaN` if there is no
   * selected waypoint or position/heading data is invalid.
   */
  waypointRelativeBearing: Subscribable<number>;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;
}

/**
 * A GTC airport information page weather tab.
 */
class GtcAirportInfoPageWeatherTab extends DisplayComponent<GtcAirportInfoPageWeatherTabProps> implements GtcAirportInfoPageTabContent {
  private static readonly WIND_SPEED_UNITS = {
    [MetarWindSpeedUnits.Knot]: UnitType.KNOT,
    [MetarWindSpeedUnits.KilometerPerHour]: UnitType.KPH,
    [MetarWindSpeedUnits.MeterPerSecond]: UnitType.MPS
  };

  private static readonly VISIBILITY_UNITS = {
    [MetarVisibilityUnits.Meter]: UnitType.METER,
    [MetarVisibilityUnits.StatuteMile]: UnitType.MILE
  };

  private static readonly CLOUD_COVER_TEXT = {
    [MetarCloudLayerCoverage.Clear]: 'CLEAR',
    [MetarCloudLayerCoverage.SkyClear]: 'SKY CLEAR',
    [MetarCloudLayerCoverage.NoSignificant]: 'NO SIGNIFICANT',
    [MetarCloudLayerCoverage.Few]: 'FEW',
    [MetarCloudLayerCoverage.Scattered]: 'SCATTERED',
    [MetarCloudLayerCoverage.Broken]: 'BROKEN',
    [MetarCloudLayerCoverage.Overcast]: 'OVERCAST'
  };

  private static readonly CLOUD_TYPE_TEXT = {
    [MetarCloudLayerType.Unspecified]: '',
    [MetarCloudLayerType.AltocumulusCastellanus]: 'ALTOCUMULUS',
    [MetarCloudLayerType.Cumulonimbus]: 'CUMULONIMBUS',
    [MetarCloudLayerType.ToweringCumulus]: 'TOWERING CUMULUS',
  };

  private static readonly BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '__._' });
  private static readonly SPEED_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
  private static readonly MILE_FORMATTER = NumberFormatter.create({ precision: 0.01, forceDecimalZeroes: false, nanString: '__' });
  private static readonly METER_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '____' });
  private static readonly ALTITUDE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '_____' });
  private static readonly TEMPERATURE_FORMATTER = NumberFormatter.create({ precision: 1, useMinusSign: true, nanString: '__' });
  private static readonly IN_HG_FORMATTER = NumberFormatter.create({ precision: 0.01, nanString: '__.__' });
  private static readonly HPA_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '____' });

  private static readonly TIME_FORMATTER = DateTimeFormatter.create('{dd}–{mon} {HH}:{mm}');

  private readonly listRef = FSComponent.createRef<GtcList<AirportRunwayData>>();
  private readonly noWaypointRef = FSComponent.createRef<GtcWaypointInfoPageNoWaypointMessage>();
  private readonly listContentRef = FSComponent.createRef<HTMLDivElement>();
  private readonly cloudsListRef = FSComponent.createRef<HTMLDivElement>();

  private readonly listHeight = this.props.gtcService.isHorizontal ? 523 : 270;
  private readonly listItemHeight = Subject.create(1);

  private cloudsList?: DynamicList<MetarCloudLayer & DynamicListData>;

  private readonly metar = Subject.create<Metar | null>(null, (a, b) => {
    if (a === null && b === null) {
      return true;
    }

    if (a === null || b === null) {
      return false;
    }

    return a.icao === b.icao && a.day === b.day && a.hour === b.hour && a.min === b.min;
  });
  private metarOpId = 0;

  private readonly headerTitleText = this.props.facility.map(facility => facility === null ? '' : `${ICAO.getIdent(facility.icao)} Observation`);

  private readonly time = new Date();
  private readonly metarTime = Subject.create(0);

  private readonly windDirection = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(NaN));
  private readonly windSpeed = NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN));

  private readonly showGust = Subject.create(false);
  private readonly windGust = NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN));

  private readonly visibility = NumberUnitSubject.create(UnitType.MILE.createNumber(NaN));
  private readonly visibilityUnit = Subject.create(UnitType.MILE);
  private readonly visibilityLessThan = Subject.create(false);

  private readonly cloudLayers = ArraySubject.create<MetarCloudLayer & DynamicListData>();

  private readonly temperature = NumberUnitSubject.create(UnitType.CELSIUS.createNumber(NaN));
  private readonly dewPoint = NumberUnitSubject.create(UnitType.CELSIUS.createNumber(NaN));

  private readonly showAltimeter = Subject.create(false);
  private readonly altimeter = NumberUnitSubject.create(UnitType.IN_HG.createNumber(NaN));
  private readonly altimeterUnit = Subject.create(UnitType.IN_HG);

  private readonly rawMetar = Subject.create('');

  private titlePipe?: Subscription;
  private facilitySub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.cloudsList = new DynamicList(this.cloudLayers, this.cloudsListRef.instance, this.renderCloudsListItem.bind(this));

    this.titlePipe = this.props.facility.pipe(
      this.props.title,
      facility => `Airport Weather${facility === null ? '' : ` – ${ICAO.getIdent(facility.icao)}`}`
    );

    this.facilitySub = this.props.facility.sub(facility => {
      this.loadMetar();

      if (facility !== null) {
        this.windDirection.set(this.windDirection.get().number, MagVar.get(facility));
      }
    });

    this.metar.sub(metar => {
      if (metar !== null) {
        this.time.setTime(Date.now());
        this.time.setUTCDate(metar.day);
        this.time.setUTCHours(metar.hour, metar.min, 0, 0);

        this.metarTime.set(this.time.getTime());

        const windSpeedUnit = GtcAirportInfoPageWeatherTab.WIND_SPEED_UNITS[metar.windSpeedUnits];

        this.windDirection.set(metar.windDir);
        this.windSpeed.set(metar.windSpeed, windSpeedUnit);

        if (metar.gust === undefined) {
          this.showGust.set(false);
        } else {
          this.showGust.set(true);
          this.windGust.set(metar.gust, windSpeedUnit);
        }

        const visibilityUnit = GtcAirportInfoPageWeatherTab.VISIBILITY_UNITS[metar.visUnits];
        this.visibility.set(metar.vis, visibilityUnit);
        this.visibilityUnit.set(visibilityUnit);
        this.visibilityLessThan.set(metar.visLt);

        this.cloudLayers.set(metar.layers);

        this.temperature.set(metar.temp);
        this.dewPoint.set(metar.dew);

        if (metar.altimeterA !== undefined) {
          this.showAltimeter.set(true);
          this.altimeter.set(metar.altimeterA);
          this.altimeterUnit.set(UnitType.IN_HG);
        } else if (metar.altimeterQ !== undefined) {
          this.showAltimeter.set(true);
          this.altimeter.set(metar.altimeterQ, UnitType.HPA);
          this.altimeterUnit.set(UnitType.HPA);
        } else {
          this.showAltimeter.set(false);
          this.altimeter.set(NaN);
        }

        this.rawMetar.set(metar.metarString);

        this.listItemHeight.set(this.listContentRef.instance.offsetHeight);

        this.listRef.instance.scrollToIndex(0, 0, false);
      }
    }, true);
  }

  /** @inheritdoc */
  public onPause(): void {
    // noop
  }

  /** @inheritdoc */
  public onResume(): void {
    // Need to refresh list content height in case the last METAR change was when the list was hidden, in which case
    // offsetHeight would not have been calculated properly.
    this.listItemHeight.set(this.listContentRef.instance.offsetHeight);
    this.loadMetar();
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    return this.listRef.instance.onGtcInteractionEvent(event);
  }

  /**
   * Loads METAR data from the currently selected facility.
   */
  private async loadMetar(): Promise<void> {
    const facility = this.props.facility.get();

    if (facility === null) {
      this.metar.set(null);
      return;
    }

    const opId = ++this.metarOpId;

    const metar = await this.props.facLoader.getMetar(facility) ?? null;

    if (opId !== this.metarOpId) {
      return;
    }

    this.metar.set(metar);
  }

  /**
   * Renders a METAR cloud layer list item.
   * @param layer A METAR cloud layer.
   * @returns The list item for the specified METAR cloud layer, as a VNode.
   */
  private renderCloudsListItem(layer: MetarCloudLayer): VNode {
    const coverText = GtcAirportInfoPageWeatherTab.CLOUD_COVER_TEXT[layer.cover];
    const typeText = GtcAirportInfoPageWeatherTab.CLOUD_TYPE_TEXT[layer.type];

    return (
      <div class='airport-info-page-weather-clouds-row'>
        <NumberUnitDisplay
          value={UnitType.FOOT.createNumber(layer.alt * 100)}
          displayUnit={null}
          formatter={GtcAirportInfoPageWeatherTab.ALTITUDE_FORMATTER}
          class='airport-info-page-weather-clouds-alt'
        />
        <span> {coverText}</span>
        {typeText.length > 0 && (<span> {typeText}</span>)}
      </div>
    );
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <div class='airport-info-page-tab airport-info-page-weather'>
          <GtcList
            ref={this.listRef}
            bus={this.props.gtcService.bus}
            sidebarState={this.props.sidebarState}
            listItemHeightPx={this.listItemHeight}
            heightPx={this.listHeight}
            class='airport-info-page-weather-list'
          >
            <div ref={this.listContentRef} class='airport-info-page-weather-list-content'>
              <div class='airport-info-page-weather-row airport-info-page-weather-row-bottom-border airport-info-page-weather-header'>
                <div class='airport-info-page-weather-header-title'>{this.headerTitleText}</div>
                <div class='airport-info-page-weather-header-pos'>
                  <div class='airport-info-page-weather-field airport-info-page-weather-gps-field'>
                    <div class='airport-info-page-weather-field-title'>BRG</div>
                    <div class='airport-info-page-bearing'>
                      <BearingDisplay
                        value={this.props.waypointInfo.bearing}
                        displayUnit={this.props.unitsSettingManager.navAngleUnits}
                        formatter={GtcAirportInfoPageWeatherTab.BEARING_FORMATTER}
                      />
                      <GtcBearingArrow
                        relativeBearing={this.props.waypointRelativeBearing}
                      />
                    </div>
                  </div>
                  <div class='airport-info-page-weather-field airport-info-page-weather-gps-field'>
                    <div class='airport-info-page-weather-field-title'>DIS</div>
                    <NumberUnitDisplay
                      value={this.props.waypointInfo.distance}
                      displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
                      formatter={GtcAirportInfoPageWeatherTab.DISTANCE_FORMATTER}
                    />
                  </div>
                </div>
              </div>
              <div class='airport-info-page-weather-row airport-info-page-weather-row-bottom-border airport-info-page-weather-time'>
                <div class='airport-info-page-weather-row-title'>Timestamp</div>
                <div>{this.metarTime.map(GtcAirportInfoPageWeatherTab.TIME_FORMATTER)}<span class='time-suffix'>UTC</span></div>
              </div>
              <div class='airport-info-page-weather-row airport-info-page-weather-row-bottom-border airport-info-page-weather-winddir'>
                <div class='airport-info-page-weather-row-title'>Wind Direction</div>
                <BearingDisplay
                  value={this.windDirection}
                  displayUnit={this.props.unitsSettingManager.navAngleUnits}
                  formatter={GtcAirportInfoPageWeatherTab.BEARING_FORMATTER}
                />
              </div>
              <div class='airport-info-page-weather-row airport-info-page-weather-row-bottom-border airport-info-page-weather-windspeed'>
                <div class='airport-info-page-weather-row-title'>Wind Speed</div>
                <NumberUnitDisplay
                  value={this.windSpeed}
                  displayUnit={this.props.unitsSettingManager.speedUnits}
                  formatter={GtcAirportInfoPageWeatherTab.SPEED_FORMATTER}
                />
              </div>
              <div class={this.showGust.map(show => `airport-info-page-weather-row airport-info-page-weather-row-bottom-border airport-info-page-weather-windgust ${show ? '' : 'hidden'}`)}>
                <div class='airport-info-page-weather-row-title'>Wind Gusts</div>
                <NumberUnitDisplay
                  value={this.windGust}
                  displayUnit={this.props.unitsSettingManager.speedUnits}
                  formatter={GtcAirportInfoPageWeatherTab.SPEED_FORMATTER}
                />
              </div>
              <div class='airport-info-page-weather-row airport-info-page-weather-row-bottom-border airport-info-page-weather-vis'>
                <div class='airport-info-page-weather-row-title'>Visibility</div>
                <div class='airport-info-page-weather-vis-value'>
                  <div class={this.visibilityLessThan.map(lessThan => lessThan ? '' : 'hidden')}>{'<&nbsp'}</div>
                  <NumberUnitDisplay
                    value={this.visibility}
                    displayUnit={this.visibilityUnit}
                    formatter={number => {
                      return this.visibilityUnit.get() === UnitType.MILE
                        ? GtcAirportInfoPageWeatherTab.MILE_FORMATTER(number)
                        : GtcAirportInfoPageWeatherTab.METER_FORMATTER(number);
                    }}
                  />
                </div>
              </div>
              <div class='airport-info-page-weather-row airport-info-page-weather-row-bottom-border airport-info-page-weather-clouds'>
                <div class='airport-info-page-weather-row-title'>Clouds</div>
                <div ref={this.cloudsListRef} class='airport-info-page-weather-clouds-list' />
              </div>
              <div class='airport-info-page-weather-row airport-info-page-weather-row-bottom-border airport-info-page-weather-temp'>
                <div class='airport-info-page-weather-row-title'>Temperature</div>
                <NumberUnitDisplay
                  value={this.temperature}
                  displayUnit={this.props.unitsSettingManager.temperatureUnits}
                  formatter={GtcAirportInfoPageWeatherTab.TEMPERATURE_FORMATTER}
                />
              </div>
              <div class='airport-info-page-weather-row airport-info-page-weather-row-bottom-border airport-info-page-weather-dew'>
                <div class='airport-info-page-weather-row-title'>Dew Point</div>
                <NumberUnitDisplay
                  value={this.dewPoint}
                  displayUnit={this.props.unitsSettingManager.temperatureUnits}
                  formatter={GtcAirportInfoPageWeatherTab.TEMPERATURE_FORMATTER}
                />
              </div>
              <div class={this.showAltimeter.map(show => `airport-info-page-weather-row airport-info-page-weather-row-bottom-border airport-info-page-weather-altimeter ${show ? '' : 'hidden'}`)}>
                <div class='airport-info-page-weather-row-title'>Altimeter</div>
                <NumberUnitDisplay
                  value={this.altimeter}
                  displayUnit={this.altimeterUnit}
                  formatter={number => {
                    return this.altimeterUnit.get() === UnitType.IN_HG
                      ? GtcAirportInfoPageWeatherTab.IN_HG_FORMATTER(number)
                      : GtcAirportInfoPageWeatherTab.HPA_FORMATTER(number);
                  }}
                />
              </div>
              <div class='airport-info-page-weather-row airport-info-page-weather-text'>
                <div class='airport-info-page-weather-row-title'>Original METAR Text</div>
                <div>{this.rawMetar}</div>
              </div>
            </div>
          </GtcList>
        </div>
        <div class={this.metar.map(metar => `airport-info-page-weather-nometar ${metar === null ? '' : 'hidden'}`)}>
          No METAR data available
        </div>
        <GtcWaypointInfoPageNoWaypointMessage ref={this.noWaypointRef} selectedWaypoint={this.props.waypoint as Subscribable<FacilityWaypoint<Facility> | null>}>
          No Airport Available
        </GtcWaypointInfoPageNoWaypointMessage>
      </>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();
    this.noWaypointRef.getOrDefault()?.destroy();

    this.headerTitleText.destroy();

    this.titlePipe?.destroy();
    this.facilitySub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for GtcAirportInfoPageInfoTab.
 */
interface GtcAirportInfoPageRunwaysTabProps extends GtcAirportInfoPageTabContentProps {
  /** A mutable subscribable to bind to the selected runway index. */
  selectedRunwayIndex: MutableSubscribable<number>;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;
}

/**
 * Data for an airport runway.
 */
interface AirportRunwayData extends DynamicListData {
  /** The runway's parent airport. */
  facility: AirportFacility;

  /** The index of the runway. */
  index: number;

  /** The name of the runway. */
  name: string;

  /** The runway's surface category. */
  surfaceCategory: RunwaySurfaceCategory;

  /** The runway definition. */
  runway: AirportRunway;
}

/**
 * A GTC airport information page runways tab.
 */
class GtcAirportInfoPageRunwaysTab extends DisplayComponent<GtcAirportInfoPageRunwaysTabProps> implements GtcAirportInfoPageTabContent {
  private static readonly SURFACE_TEXT = {
    [RunwaySurfaceCategory.Hard]: 'Hard Surface',
    [RunwaySurfaceCategory.Soft]: 'Turf Surface',
    [RunwaySurfaceCategory.Water]: 'Water Surface',
    [RunwaySurfaceCategory.Unknown]: 'Unknown Surface'
  };

  private static readonly LIGHTING_TEXT = {
    [RunwayLightingType.FullTime]: 'Full Time',
    [RunwayLightingType.PartTime]: 'Part Time',
    [RunwayLightingType.Frequency]: 'PCL',
    [RunwayLightingType.None]: 'No Lights',
    [RunwayLightingType.Unknown]: 'Unknown'
  };

  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 1 });

  private readonly listRef = FSComponent.createRef<GtcList<AirportRunwayData>>();
  private readonly noWaypointRef = FSComponent.createRef<GtcWaypointInfoPageNoWaypointMessage>();

  private readonly listItemHeight = this.props.gtcService.isHorizontal ? 174 : 92;

  private readonly runways = ArraySubject.create<AirportRunwayData>();

  private titlePipe?: Subscription;
  private facilitySub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.titlePipe = this.props.facility.pipe(
      this.props.title,
      facility => `Airport Runways${facility === null ? '' : ` – ${ICAO.getIdent(facility.icao)}`}`
    );

    this.facilitySub = this.props.facility.sub(facility => {
      this.props.selectedRunwayIndex.set(-1);

      if (facility === null) {
        this.runways.clear();
      } else {
        this.runways.set(this.generateRunwayData(facility));
      }

      this.listRef.instance.scrollToIndex(0, 0, false);
    }, true);
  }

  /** @inheritdoc */
  public onPause(): void {
    // noop
  }

  /** @inheritdoc */
  public onResume(): void {
    // noop
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    return this.listRef.instance.onGtcInteractionEvent(event);
  }

  /**
   * Generates a runway data array from an airport facility.
   * @param facility An airport facility.
   * @returns An array of runway data for the specified airport.
   */
  private generateRunwayData(facility: AirportFacility): AirportRunwayData[] {
    return Array.from(facility.runways).sort(G3000FmsUtils.sortRunway).map(runway => {
      return {
        facility,
        index: facility.runways.indexOf(runway),
        name: runway.designation.split('-').map((number, index) => {
          return `${number.padStart(2, '0')}${RunwayUtils.getDesignatorLetter(index === 0 ? runway.designatorCharPrimary : runway.designatorCharSecondary)}`;
        }).join('–'),
        surfaceCategory: RunwayUtils.getSurfaceCategory(runway),
        runway
      };
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <div class='airport-info-page-tab airport-info-page-runways'>
          <GtcList
            ref={this.listRef}
            bus={this.props.gtcService.bus}
            data={this.runways}
            renderItem={data => {
              const refs = [FSComponent.createRef<NumberUnitDisplay<any>>(), FSComponent.createRef<NumberUnitDisplay<any>>()];
              const isHighlighted = this.props.selectedRunwayIndex.map(runwayIndex => runwayIndex === data.index);

              return (
                <GtcListButton
                  fullSizeButton
                  isHighlighted={isHighlighted}
                  onPressed={() => {
                    this.props.selectedRunwayIndex.set(data.index === this.props.selectedRunwayIndex.get() ? -1 : data.index);
                  }}
                  gtcOrientation={this.props.gtcService.orientation}
                  onDestroy={() => {
                    refs.forEach(ref => { ref.getOrDefault()?.destroy(); });
                    isHighlighted.destroy();
                  }}
                  touchButtonClasses='airport-info-page-runways-row-button'
                >
                  <div class='airport-info-page-runways-row-name'>{data.name}</div>
                  <div>
                    <NumberUnitDisplay
                      ref={refs[0]}
                      value={UnitType.METER.createNumber(data.runway.length)}
                      displayUnit={this.props.unitsSettingManager.distanceUnitsSmall}
                      formatter={GtcAirportInfoPageRunwaysTab.DISTANCE_FORMATTER}
                      class='airport-info-page-runways-row-dimension'
                    />
                    <span> x </span>
                    <NumberUnitDisplay
                      ref={refs[1]}
                      value={UnitType.METER.createNumber(data.runway.width)}
                      displayUnit={this.props.unitsSettingManager.distanceUnitsSmall}
                      formatter={GtcAirportInfoPageRunwaysTab.DISTANCE_FORMATTER}
                      class='airport-info-page-runways-row-dimension'
                    />
                  </div>
                  <div class='airport-info-page-runways-row-bottom'>
                    <div class='airport-info-page-runways-row-surface'>{GtcAirportInfoPageRunwaysTab.SURFACE_TEXT[data.surfaceCategory]}</div>
                    <div class='airport-info-page-runways-row-lighting'>{GtcAirportInfoPageRunwaysTab.LIGHTING_TEXT[data.runway.lighting]}</div>
                  </div>
                </GtcListButton>
              );
            }}
            sidebarState={this.props.sidebarState}
            listItemHeightPx={this.listItemHeight}
            listItemSpacingPx={1}
            itemsPerPage={3}
            class='airport-info-page-runways-list'
          />
        </div>
        <GtcWaypointInfoPageNoWaypointMessage ref={this.noWaypointRef} selectedWaypoint={this.props.waypoint as Subscribable<FacilityWaypoint<Facility> | null>}>
          No Airport Available
        </GtcWaypointInfoPageNoWaypointMessage>
      </>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();
    this.noWaypointRef.getOrDefault()?.destroy();

    this.titlePipe?.destroy();
    this.facilitySub?.destroy();

    super.destroy();
  }
}

/**
 * Data for an airport procedure.
 */
interface AirportProcedureData extends DynamicListData {
  /** The procedure's parent airport. */
  facility: AirportFacility;

  /** The type of the procedure. */
  type: Exclude<ProcedureType, ProcedureType.VISUALAPPROACH>;

  /** The procedure definition. */
  procedure: Procedure | ApproachListItem;
}

/**
 * Component props for GtcAirportInfoPageProcTab.
 */
interface GtcAirportInfoPageProcTabProps extends GtcAirportInfoPageTabContentProps {
  /** Whether RNP (AR) approaches should be selectable. */
  allowRnpAr: boolean;
}

/**
 * A GTC airport information page procedures tab.
 */
class GtcAirportInfoPageProcTab extends DisplayComponent<GtcAirportInfoPageProcTabProps> implements GtcAirportInfoPageTabContent {
  private static readonly TYPE_TEXT = {
    [ProcedureType.APPROACH]: 'Approach',
    [ProcedureType.DEPARTURE]: 'Departure',
    [ProcedureType.ARRIVAL]: 'Arrival'
  };

  private readonly listRef = FSComponent.createRef<GtcList<AirportProcedureData>>();
  private readonly noWaypointRef = FSComponent.createRef<GtcWaypointInfoPageNoWaypointMessage>();

  private readonly listItemHeight = this.props.gtcService.isHorizontal ? 130 : 69;

  private readonly procedures = ArraySubject.create<AirportProcedureData>();

  private titlePipe?: Subscription;
  private facilitySub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.titlePipe = this.props.facility.pipe(
      this.props.title,
      facility => `Airport Procedures${facility === null ? '' : ` – ${ICAO.getIdent(facility.icao)}`}`
    );

    this.facilitySub = this.props.facility.sub(facility => {
      if (facility === null) {
        this.procedures.clear();
      } else {
        this.procedures.set(this.generateProcedureData(facility));
      }

      this.listRef.instance.scrollToIndex(0, 0, false);
    }, true);
  }

  /** @inheritdoc */
  public onPause(): void {
    // noop
  }

  /** @inheritdoc */
  public onResume(): void {
    // noop
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    return this.listRef.instance.onGtcInteractionEvent(event);
  }

  /**
   * Generates a procedure data array from an airport facility.
   * @param facility An airport facility.
   * @returns An array of procedure data for the specified airport.
   */
  private generateProcedureData(facility: AirportFacility): AirportProcedureData[] {
    const data: AirportProcedureData[] = [];

    const approaches = FmsUtils.getApproaches(facility).sort(G3000FmsUtils.sortApproachItem);
    for (let i = 0; i < approaches.length; i++) {
      const approach = approaches[i];

      // Do not include visual approaches.
      if (approach.isVisualApproach) {
        continue;
      }

      // Do not include RNP AR approaches if not allowed.
      if (!this.props.allowRnpAr && FmsUtils.isApproachRnpAr(approach.approach)) {
        continue;
      }

      data.push({
        facility,
        type: ProcedureType.APPROACH,
        procedure: approach
      });
    }

    const departures = Array.from(facility.departures).sort(G3000FmsUtils.sortDeparture);
    for (let i = 0; i < departures.length; i++) {
      const departure = departures[i];

      data.push({
        facility,
        type: ProcedureType.DEPARTURE,
        procedure: departure
      });
    }

    const arrivals = Array.from(facility.arrivals).sort(G3000FmsUtils.sortArrival);
    for (let i = 0; i < arrivals.length; i++) {
      const arrival = arrivals[i];

      data.push({
        facility,
        type: ProcedureType.ARRIVAL,
        procedure: arrival
      });
    }

    return data;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <div class='airport-info-page-tab airport-info-page-proc'>
          <GtcList
            ref={this.listRef}
            bus={this.props.gtcService.bus}
            data={this.procedures}
            renderItem={data => {
              const name = data.type === ProcedureType.APPROACH
                ? (
                  <ApproachNameDisplay
                    approach={(data.procedure as ApproachListItem).approach}
                  />
                )
                : (data.procedure as Procedure).name;

              return (
                <GtcListButton
                  fullSizeButton
                  onPressed={() => {
                    switch (data.type) {
                      case ProcedureType.APPROACH:
                        this.props.gtcService.changePageTo<GtcApproachPage>(GtcViewKeys.Approach)
                          .ref.initSelection(data.facility, data.procedure as ApproachListItem);
                        break;
                      case ProcedureType.DEPARTURE:
                        this.props.gtcService.changePageTo<GtcDeparturePage>(GtcViewKeys.Departure)
                          .ref.initSelection(data.facility, data.procedure as DepartureProcedure);
                        break;
                      case ProcedureType.ARRIVAL:
                        this.props.gtcService.changePageTo<GtcArrivalPage>(GtcViewKeys.Arrival)
                          .ref.initSelection(data.facility, data.procedure as ArrivalProcedure);
                        break;
                    }
                  }}
                  gtcOrientation={this.props.gtcService.orientation}
                >
                  <div class='airport-info-page-proc-row-title'>{GtcAirportInfoPageProcTab.TYPE_TEXT[data.type]}</div>
                  <div class='airport-info-page-proc-row-label'>{name}</div>
                </GtcListButton>
              );
            }}
            sidebarState={this.props.sidebarState}
            listItemHeightPx={this.listItemHeight}
            listItemSpacingPx={1}
            itemsPerPage={4}
            maxRenderedItemCount={20}
            class='airport-info-page-proc-list'
          />
        </div>
        <GtcWaypointInfoPageNoWaypointMessage ref={this.noWaypointRef} selectedWaypoint={this.props.waypoint as Subscribable<FacilityWaypoint<Facility> | null>}>
          No Airport Available
        </GtcWaypointInfoPageNoWaypointMessage>
      </>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();
    this.noWaypointRef.getOrDefault()?.destroy();

    this.titlePipe?.destroy();
    this.facilitySub?.destroy();

    super.destroy();
  }
}