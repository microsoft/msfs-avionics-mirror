import {
  ComponentProps, DisplayComponent, FacilityLoader, FacilitySearchType, FacilityWaypoint, FSComponent, GeoPoint,
  GeoPointSubject, ICAO, IcaoValue, MappedSubject, SearchTypeMap, SetSubject, Subject, Subscribable, SubscribableUtils,
  Subscription, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { GarminFacilityWaypointCache, UnitsUserSettings, WaypointInfoStore } from '@microsoft/msfs-garminsdk';

import {
  ControllableDisplayPaneIndex, DisplayPaneControlEvents, DisplayPaneSettings, DisplayPanesUserSettings, DisplayPaneViewKeys,
  WaypointInfoPaneSelectionData, WaypointInfoPaneViewEventTypes
} from '@microsoft/msfs-wtg3000-common';

import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcWaypointSelectButton, WaypointSelectType, WaypointSelectTypeMap } from '../../Components/TouchButton/GtcWaypointSelectButton';
import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcPositionHeadingDataProvider } from '../../Navigation/GtcPositionHeadingDataProvider';
import { GtcWaypointInfoOptionsPopup } from './GtcWaypointInfoOptionsPopup';

import './GtcWaypointInfoPage.css';

/**
 * Component props for GtcWaypointInfoPage.
 */
export interface GtcWaypointInfoPageProps extends GtcViewProps {
  /** A facility loader. */
  facLoader: FacilityLoader;

  /** A provider of airplane position and heading data. */
  posHeadingDataProvider: GtcPositionHeadingDataProvider;
}

/**
 * A GTC waypoint information page.
 */
export abstract class GtcWaypointInfoPage<T extends WaypointSelectType, P extends GtcWaypointInfoPageProps = GtcWaypointInfoPageProps> extends GtcView<P> {
  protected static readonly NULL_IDENT = {
    [FacilitySearchType.AllExceptVisual]: '––––––',
    [FacilitySearchType.Airport]: '––––',
    [FacilitySearchType.Vor]: '–––––',
    [FacilitySearchType.Ndb]: '–––––',
    [FacilitySearchType.Intersection]: '–––––',
    [FacilitySearchType.User]: '––––––'
  };

  /** The type of waypoint displayed by this page. */
  protected abstract readonly waypointSelectType: T;

  /** The view key for this page's options popup. */
  protected abstract readonly optionsPopupKey: string;

  protected readonly rootCssClass = SetSubject.create(['wpt-info-page', this.getCssClass()]);

  protected readonly publisher = this.bus.getPublisher<DisplayPaneControlEvents<WaypointInfoPaneViewEventTypes>>();

  protected readonly displayPaneIndex: ControllableDisplayPaneIndex;
  protected readonly displayPaneSettings: UserSettingManager<DisplayPaneSettings>;

  protected readonly facWaypointCache = GarminFacilityWaypointCache.getCache(this.bus);

  /** The selected waypoint, or `null` if there is no selected waypoint. */
  protected readonly selectedWaypoint = Subject.create<WaypointSelectTypeMap[T] | null>(null);
  /** Whether a waypoint is selected. */
  protected readonly hasSelectedWaypoint = this.selectedWaypoint.map(waypoint => waypoint !== null);

  /** The facility associated with the selected waypoint. */
  protected readonly selectedFacility = Subject.create<SearchTypeMap[T] | null>(null);
  protected selectedFacilityPipe?: Subscription;

  /** The position of the airplane. */
  protected readonly ppos = GeoPointSubject.create(new GeoPoint(NaN, NaN));

  /** The true heading of the airplane, in degrees, or `NaN` if heading data is invalid. */
  protected readonly planeHeadingTrue = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);

  /** An information store for the selected waypoint. */
  protected readonly selectedWaypointInfo = new WaypointInfoStore(this.selectedWaypoint, this.ppos);

  /**
   * The bearing to the selected waypoint, relative to the airplane's current heading, in degrees, or `NaN` if there is
   * no selected waypoint or position/heading data is invalid.
   */
  protected readonly selectedWaypointRelativeBearing = MappedSubject.create(
    ([bearing, planeHeading]) => bearing.number - planeHeading,
    SubscribableUtils.NUMERIC_NAN_EQUALITY,
    this.selectedWaypointInfo.bearing,
    this.planeHeadingTrue
  );

  protected readonly showOnMap = Subject.create(false);
  protected readonly showOnMapData = Subject.create<Omit<WaypointInfoPaneSelectionData, 'resetRange'>>(
    { icao: ICAO.emptyValue(), runwayIndex: -1 },
    (a, b) => {
      if (a === null && b === null) {
        return true;
      }

      if (a === null || b === null) {
        return false;
      }

      return ICAO.valueEquals(a.icao, b.icao) && a.runwayIndex === b.runwayIndex;
    }
  );
  protected resetMapRange = false;

  protected readonly unitsSettingManager = UnitsUserSettings.getManager(this.bus);

  protected pposPipe?: Subscription;
  protected headingPipe?: Subscription;
  protected isGpsDrSub?: Subscription;
  protected showOnMapSub?: Subscription;

  /**
   * Constructor.
   * @param props This component's props.
   * @throws Error if a display pane index is not defined for this view.
   */
  public constructor(props: P) {
    super(props);

    if (this.props.displayPaneIndex === undefined) {
      throw new Error('GtcWaypointInfoPage: display pane index was not defined');
    }

    this.displayPaneIndex = this.props.displayPaneIndex;
    this.displayPaneSettings = DisplayPanesUserSettings.getDisplayPaneManager(this.bus, this.displayPaneIndex);

    this.selectedWaypoint.sub(waypoint => {
      this.selectedFacilityPipe?.destroy();

      if (waypoint === null) {
        this.selectedFacility.set(null);
      } else {
        this.selectedFacilityPipe = (waypoint.facility as Subscribable<SearchTypeMap[T]>).pipe(this.selectedFacility);
      }
    }, true);
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      this.optionsPopupKey,
      this.props.controlMode,
      this.renderOptionsPopup.bind(this),
      this.props.displayPaneIndex
    );

    this.pposPipe = this.props.posHeadingDataProvider.pposWithFailure.pipe(this.ppos, true);
    this.headingPipe = this.props.posHeadingDataProvider.headingTrueWithFailure.pipe(this.planeHeadingTrue, true);

    this.isGpsDrSub = this.props.posHeadingDataProvider.isGpsDeadReckoning.sub(isDr => {
      this.rootCssClass.toggle('dead-reckoning', isDr);
    }, true);

    const showOnMapDataSub = this.showOnMapData.sub(data => {
      this.sendSelectionData({ ...data, resetRange: this.resetMapRange });
      this.resetMapRange = false;
    }, false, true);

    const canShowOnMapSub = this.hasSelectedWaypoint.sub(canShow => {
      if (canShow) {
        showOnMapDataSub.resume(true);
      } else {
        showOnMapDataSub.pause();
        this.showOnMap.set(false);
      }
    }, false, true);

    this.showOnMapSub = this.showOnMap.sub(show => {
      const viewSetting = this.displayPaneSettings.getSetting('displayPaneView');

      if (show) {
        this.resetMapRange = true;
        viewSetting.value = DisplayPaneViewKeys.WaypointInfo;
        canShowOnMapSub.resume(true);
      } else {
        canShowOnMapSub.pause();
        showOnMapDataSub.pause();
        viewSetting.value = this.displayPaneSettings.getSetting('displayPaneDesignatedView').value;
      }
    }, false, true);
  }

  /**
   * Initializes this page's waypoint selection.
   * @param facility The facility to select, or its ICAO.
   */
  public abstract initSelection(facility?: SearchTypeMap[T] | IcaoValue): Promise<void>;

  /** @inheritdoc */
  public onOpen(): void {
    this.showOnMapSub?.resume(true);
  }

  /** @inheritdoc */
  public onClose(): void {
    this.showOnMap.set(false);
    this.showOnMapSub?.pause();
  }

  /** @inheritdoc */
  public onResume(): void {
    this.pposPipe?.resume(true);
    this.headingPipe?.resume(true);
  }

  /** @inheritdoc */
  public onPause(): void {
    this.pposPipe?.pause();
    this.headingPipe?.pause();
  }

  /**
   * Sends waypoint selection data to the display pane controlled by this page.
   * @param data The data to send.
   */
  protected sendSelectionData(data: WaypointInfoPaneSelectionData): void {
    this.publisher.pub('display_pane_view_event', {
      displayPaneIndex: this.displayPaneIndex,
      eventType: 'display_pane_waypoint_info_set',
      eventData: data
    }, true, false);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <div class='wpt-info-page-container'>
          <div class='wpt-info-page-header'>
            <GtcWaypointSelectButton
              gtcService={this.props.gtcService}
              type={this.waypointSelectType}
              waypoint={this.selectedWaypoint}
              waypointCache={GarminFacilityWaypointCache.getCache(this.bus)}
              nullIdent={GtcWaypointInfoPage.NULL_IDENT[this.waypointSelectType]}
              class='wpt-info-page-select-button'
            />
            <GtcTouchButton
              label='Waypoint<br>Options'
              isEnabled={this.hasSelectedWaypoint}
              onPressed={() => { this.props.gtcService.openPopup(this.optionsPopupKey, 'slideout-right'); }}
              class='wpt-info-page-options-button'
            />
          </div>
          {this.renderContent()}
        </div>
      </div>
    );
  }

  /**
   * Gets the CSS class for this page's root element.
   * @returns The CSS class for this page's root element.
   */
  protected abstract getCssClass(): string;

  /**
   * Renders this page's main content.
   * @returns This page's main content, as a VNode.
   */
  protected abstract renderContent(): VNode;

  /**
   * Renders this page's options popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns This page's options popup, as a VNode.
   */
  protected renderOptionsPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    return (
      <GtcWaypointInfoOptionsPopup
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        title={this._title}
        selectedWaypoint={this.selectedWaypoint}
        showOnMap={this.showOnMap}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.selectedWaypointInfo.destroy();
    this.selectedWaypointRelativeBearing.destroy();

    this.pposPipe?.destroy();
    this.headingPipe?.destroy();
    this.isGpsDrSub?.destroy();

    this.selectedFacilityPipe?.destroy();
    this.showOnMapSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for GtcAirportInfoPageTabNoAirportMessage.
 */
export interface GtcWaypointInfoPageNoWaypointMessageProps extends ComponentProps {
  /** The selected waypoint. */
  selectedWaypoint: Subscribable<FacilityWaypoint | null>;
}

/**
 * A message displayed when a GTC waypoint information page has no selected waypoint.
 */
export class GtcWaypointInfoPageNoWaypointMessage extends DisplayComponent<GtcWaypointInfoPageNoWaypointMessageProps> {
  private readonly rootCssClass = this.props.selectedWaypoint.map(waypoint => {
    return `wpt-info-page-no-wpt ${waypoint === null ? '' : 'hidden'}`;
  });

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        {this.props.children}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.rootCssClass.destroy();

    super.destroy();
  }
}
