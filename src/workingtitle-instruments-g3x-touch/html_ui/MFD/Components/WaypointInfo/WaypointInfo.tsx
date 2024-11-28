import {
  ComponentProps, DisplayComponent, FSComponent, FacilityLoader, FacilitySearchType, FacilityType, FacilityWaypoint,
  FilteredMapSubject, GeoPoint, GeoPointSubject, ICAO, MapSubject, MappedSubject, MutableSubscribable, NodeReference,
  ReadonlyFloat64Array, Subject, Subscribable, SubscribableMap, SubscribableUtils, Subscription, UserSettingManager,
  VNode, Vec2Math, Vec2Subject
} from '@microsoft/msfs-sdk';

import { DateTimeUserSettingTypes, GarminFacilityWaypointCache, WaypointInfoStore } from '@microsoft/msfs-garminsdk';

import { RadiosConfig } from '../../../Shared/AvionicsConfig/RadiosConfig';
import { MapConfig } from '../../../Shared/Components/Map/MapConfig';
import { GenericTabbedContent } from '../../../Shared/Components/TabbedContainer/GenericTabbedContent';
import { TabbedContainer } from '../../../Shared/Components/TabbedContainer/TabbedContainer';
import { G3XFplSourceDataProvider } from '../../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { PositionHeadingDataProvider } from '../../../Shared/Navigation/PositionHeadingDataProvider';
import { ComRadioSpacingDataProvider } from '../../../Shared/Radio/ComRadioSpacingDataProvider';
import { DisplayUserSettingTypes } from '../../../Shared/Settings/DisplayUserSettings';
import { G3XUnitsUserSettingManager } from '../../../Shared/Settings/G3XUnitsUserSettings';
import { GduUserSettingTypes } from '../../../Shared/Settings/GduUserSettings';
import { G3XMapUserSettingTypes } from '../../../Shared/Settings/MapUserSettings';
import { UiFocusController } from '../../../Shared/UiSystem/UiFocusController';
import { UiInteractionEvent, UiInteractionHandler } from '../../../Shared/UiSystem/UiInteraction';
import { UiKnobId, UiKnobRequestedLabelState } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiKnobUtils } from '../../../Shared/UiSystem/UiKnobUtils';
import { UiService } from '../../../Shared/UiSystem/UiService';
import { UiViewOcclusionType, UiViewSizeMode } from '../../../Shared/UiSystem/UiViewTypes';
import { UiWaypointSelectButton } from '../TouchButton/UiWaypointSelectButton';
import { AirportFreqTab } from './AirportFreqTab';
import { AirportRunwayTab } from './AirportRunwayTab';
import { AirportWeatherTab } from './AirportWeatherTab';
import { WaypointInfoInfo } from './WaypointInfoInfo';
import { WaypointInfoContentMode } from './WaypointInfoTypes';

import './WaypointInfo.css';

/**
 * Component props for {@link WaypointInfo}.
 */
export interface WaypointInfoProps extends ComponentProps {
  /** The UI service instance. */
  uiService: UiService;

  /** A reference to the root element of the container of the display's parent UI view. */
  containerRef: NodeReference<HTMLElement>;

  /** The IDs of the valid bezel rotary knobs that can be used to control the display. */
  validKnobIds: Iterable<UiKnobId>;

  /** The facility loader. */
  facLoader: FacilityLoader;

  /** A provider of airplane position and heading data. */
  posHeadingDataProvider: PositionHeadingDataProvider;

  /** A provider of flight plan source data. */
  fplSourceDataProvider: G3XFplSourceDataProvider;

  /** A provider of COM radio spacing mode data. */
  comRadioSpacingDataProvider: ComRadioSpacingDataProvider;

  /** The ID to assign to the Bing instance bound to the display's map. */
  mapBingId: string;

  /** The ID to assign to the Bing instance bound to the display's airport runway tab map. */
  runwayTabMapBingId: string;

  /** A manager for GDU user settings. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;

  /** A manager for display user settings. */
  displaySettingManager: UserSettingManager<DisplayUserSettingTypes>;

  /** A manager for date/time user settings. */
  dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>;

  /** A manager for map user settings. */
  mapSettingManager: UserSettingManager<Partial<G3XMapUserSettingTypes>>;

  /** A manager for display units user settings. */
  unitsSettingManager: G3XUnitsUserSettingManager;

  /** A configuration object defining options for the map. */
  mapConfig: MapConfig;

  /** A configuration object defining options for radios. */
  radiosConfig: RadiosConfig;

  /**
   * A mutable subscribable to which to bind the display's selected waypoint. If not defined, then the display's
   * selected waypoint will be initialized to `null`.
   */
  selectedWaypoint?: MutableSubscribable<FacilityWaypoint | null>;

  /** Whether to allow the user to select the display's waypoint. */
  allowSelection: boolean | Subscribable<boolean>;
}

/**
 * A component which displays waypoint information.
 */
export class WaypointInfo extends DisplayComponent<WaypointInfoProps> implements UiInteractionHandler {
  private thisNode?: VNode;

  private readonly tabsRef = FSComponent.createRef<TabbedContainer>();
  private readonly infoRef = FSComponent.createRef<WaypointInfoInfo>();

  private readonly allowSelection = SubscribableUtils.toSubscribable(this.props.allowSelection, true) as Subscribable<boolean>;

  private sizeMode = UiViewSizeMode.Full;
  private readonly dimensions = Vec2Math.create();

  private readonly tabsPerListPage = Subject.create(6);
  private readonly tabLength = Subject.create(80);
  private readonly tabSpacing = Subject.create(18);
  private readonly tabKnobLabel = Subject.create('Select Tab');

  private readonly ppos = GeoPointSubject.create(new GeoPoint(NaN, NaN));
  private readonly pposPipe = this.props.posHeadingDataProvider.pposWithFailure.pipe(this.ppos, true);

  private readonly selectedWaypoint = this.props.selectedWaypoint ?? Subject.create<FacilityWaypoint | null>(null);
  private readonly waypointInfoStore = new WaypointInfoStore(this.selectedWaypoint, this.ppos);

  private readonly contentMode = this.waypointInfoStore.facility.map(facility => {
    if (!facility) {
      return WaypointInfoContentMode.None;
    }

    switch (ICAO.getFacilityType(facility.icao)) {
      case FacilityType.Airport:
        return WaypointInfoContentMode.Airport;
      case FacilityType.VOR:
        return WaypointInfoContentMode.Vor;
      case FacilityType.NDB:
        return WaypointInfoContentMode.Ndb;
      case FacilityType.Intersection:
      case FacilityType.RWY:
      case FacilityType.VIS:
        return WaypointInfoContentMode.Intersection;
      case FacilityType.USR:
        return WaypointInfoContentMode.User;
      default:
        return WaypointInfoContentMode.None;
    }
  });

  private readonly tabsHidden = Subject.create(true);
  private readonly tabContentDimensions = Vec2Subject.create(Vec2Math.create());

  private readonly isInfoInTab = Subject.create(false);
  private readonly isInfoTabSelected = Subject.create(false);

  private readonly infoHidden = MappedSubject.create(
    ([isInTab, isInfoTabSelected]) => isInTab && !isInfoTabSelected,
    this.isInfoInTab,
    this.isInfoTabSelected
  );

  private updateFocusSub?: Subscription;
  private readonly updateTabsVisSub = this.contentMode.sub(this.updateTabsVisibility.bind(this), false, true);
  private readonly updateTabsResumeSub = this.tabsHidden.sub(this.updateTabsResumeState.bind(this), false, true);
  private readonly updateInfoSizeSub = this.tabsHidden.sub(this.updateInfoSize.bind(this), false, true);
  private readonly updateInfoResumeSub = this.infoHidden.sub(this.updateInfoResumeState.bind(this), false, true);

  private readonly focusController = new UiFocusController();

  private readonly baseRequestedKnobLabelState = MapSubject.create<UiKnobId, string>();

  private readonly _knobLabelState = FilteredMapSubject.create<UiKnobId, string>(this.props.validKnobIds);
  /** The bezel rotary knob label state requested by this display. */
  public readonly knobLabelState = this._knobLabelState as SubscribableMap<UiKnobId, string> & Subscribable<UiKnobRequestedLabelState>;

  private isResumed = false;

  private readonly subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.subscriptions.push(
      this.allowSelection.sub(this.updateBaseRequestedKnobLabelState.bind(this), true),

      this.updateFocusSub = this.allowSelection.sub(this.updateFocus.bind(this), false, true)
    );

    this.focusController.setActive(true);

    UiKnobUtils.reconcileRequestedLabelStates(
      [...this.props.validKnobIds], this._knobLabelState, false,
      this.baseRequestedKnobLabelState,
      this.tabsRef.instance.knobLabelState,
      this.infoRef.instance.knobLabelState,
    );

    // Shorten the knob label for selecting tabs when there is a knob label for the push action being requested.
    this._knobLabelState.pipe(this.tabKnobLabel, knobLabelState => {
      return (
        knobLabelState.has(UiKnobId.SingleInnerPush)
        || knobLabelState.has(UiKnobId.LeftInnerPush)
        || knobLabelState.has(UiKnobId.RightInnerPush)
      ) ? 'Tab' : 'Tab Select';
    });
  }

  /**
   * Selects a waypoint for this display.
   * @param waypoint The waypoint to select, or `null` to clear the selected waypoint.
   */
  public selectWaypoint(waypoint: FacilityWaypoint | null): void {
    this.selectedWaypoint.set(waypoint);
  }

  /**
   * Responds to when this display's parent view is opened.
   * @param sizeMode The new size mode of this display's parent view.
   * @param dimensions The new dimensions of this display, as `[width, height]` in pixels.
   */
  public onOpen(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.updateTabsVisibility();
    this.updateFromSize(sizeMode, dimensions);

    this.updateTabsVisSub.resume();
    this.updateInfoSizeSub.resume();
    this.updateInfoResumeSub.resume(true);
    this.updateTabsResumeSub.resume(true);

    this.pposPipe.resume(true);
  }

  /**
   * Responds to when this display's parent view is closed.
   */
  public onClose(): void {
    this.pposPipe.pause();

    this.updateTabsVisSub.pause();
    this.updateInfoSizeSub.pause();
    this.updateInfoResumeSub.pause();

    this.tabsRef.instance.close();
    this.infoRef.instance.pause();
  }

  /**
   * Responds to when this display's parent view is resumed.
   */
  public onResume(): void {
    this.isResumed = true;

    if (!this.tabsHidden.get()) {
      this.tabsRef.instance.resume();
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.updateFocusSub!.resume(true);
  }

  /**
   * Responds to when this display's parent view is paused.
   */
  public onPause(): void {
    this.isResumed = false;

    this.tabsRef.instance.pause();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.updateFocusSub!.pause();
    this.focusController.removeFocus();
  }

  /**
   * Responds to when this display's parent view is resized while open.
   * @param sizeMode The new size mode of this display's parent view.
   * @param dimensions The new dimensions of this display, as `[width, height]` in pixels.
   */
  public onResize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.updateFromSize(sizeMode, dimensions);
  }

  /**
   * Updates this display when the size of its parent view changes.
   * @param sizeMode The new size mode of this display's parent view.
   * @param dimensions The new dimensions of this display, as `[width, height]` in pixels.
   */
  private updateFromSize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.sizeMode = sizeMode;
    Vec2Math.copy(dimensions, this.dimensions);

    // TODO: support GDU470 (portrait)

    let isTabsFullWidth: boolean;
    let isTabsFullHeight: boolean;
    let tabsPerListPage: number;
    if (sizeMode === UiViewSizeMode.Half) {
      isTabsFullWidth = true;
      isTabsFullHeight = false;
      tabsPerListPage = 7;
    } else {
      isTabsFullWidth = false;
      isTabsFullHeight = true;
      tabsPerListPage = 6;
    }

    // If the tab container does not take up the full width of the display, then it takes up the right side, which is
    // 6/11th of the available horizontal space after a 7px gap is subtracted.
    const tabContainerWidth = (isTabsFullWidth ? this.dimensions[0] : Math.floor(6 * (this.dimensions[0] - 7) / 11));
    // The tab content height is the width of the tab container minus 3px borders and 2px padding on each side and the
    // 92px width of the tabs.
    const tabContentWidth = tabContainerWidth - 3 * 2 - 2 * 2 - 92;

    // The tab container takes up the remaining height of the display after optionally subtracting the 70px height of
    // the selection button and the 7px margin between the button and the tab container.
    const tabContainerHeight = dimensions[1] - (isTabsFullHeight ? 0 : 70 + 7);
    // The tab content height is the height of the tab container minus 3px borders and 2px padding on each side.
    const tabContentHeight = tabContainerHeight - 3 * 2 - 2 * 2;
    // The tab list height is the height of the tab container minus the height of two tab arrows (10px + 3px margin
    // on each side) and 12px margins on each side.
    const tabListHeight = tabContainerHeight - (10 + 2 * 3) * 2 - 12 * 2;

    this.tabContentDimensions.set(tabContentWidth, tabContentHeight);
    this.tabsPerListPage.set(tabsPerListPage);

    let tabLength = 86;
    let tabSpacing = 3;

    const totalTabHeight = tabLength * tabsPerListPage;
    const totalTabSpacingHeight = tabSpacing - (tabsPerListPage - 1);
    const remainingHeight = tabListHeight - totalTabHeight - totalTabSpacingHeight;

    if (remainingHeight >= 0) {
      // We have extra space. Increase the spacing.
      tabSpacing += Math.floor(remainingHeight / (tabsPerListPage - 1));
    } else {
      // We are taking too much space. Reduce the length of the tabs.
      tabLength += Math.floor(remainingHeight / tabsPerListPage);
    }

    this.tabLength.set(tabLength);
    this.tabSpacing.set(tabSpacing);

    this.updateInfoSize();
  }

  /**
   * Responds to when the occlusion type applied to this display's parent view changes while the view is open.
   * @param occlusionType The new occlusion type applied to this display's parent view.
   */
  public onOcclusionChange(occlusionType: UiViewOcclusionType): void {
    if (occlusionType === 'hide') {
      this.updateInfoResumeSub.pause();
      this.pposPipe.pause();

      this.infoRef.instance.pause();
    } else {
      this.updateInfoResumeSub.resume(true);

      this.pposPipe.resume(true);
    }
  }

  /**
   * Responds to when this display's parent view is updated.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  public onUpdate(time: number): void {
    this.tabsRef.instance.update(time);
    this.infoRef.instance.update(time);
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (this.focusController.onUiInteractionEvent(event)) {
      return true;
    }

    if (this.tabsRef.instance.onUiInteractionEvent(event)) {
      return true;
    }

    if (!this.isInfoInTab.get()) {
      return this.infoRef.instance.onUiInteractionEvent(event);
    }

    return false;
  }

  /**
   * Updates this display's base requested knob label state.
   * @param allowSelection Whether the user is allowed to select the display's waypoint.
   */
  private updateBaseRequestedKnobLabelState(allowSelection: boolean): void {
    if (allowSelection) {
      this.baseRequestedKnobLabelState.setValue(UiKnobId.SingleInnerPush, 'Edit WPT');
      this.baseRequestedKnobLabelState.setValue(UiKnobId.LeftInnerPush, 'Edit WPT');
      this.baseRequestedKnobLabelState.setValue(UiKnobId.RightInnerPush, 'Edit WPT');
    } else {
      this.baseRequestedKnobLabelState.delete(UiKnobId.SingleInnerPush);
      this.baseRequestedKnobLabelState.delete(UiKnobId.LeftInnerPush);
      this.baseRequestedKnobLabelState.delete(UiKnobId.RightInnerPush);
    }
  }

  /**
   * Updates this display's focused component.
   * @param allowSelection Whether the user is allowed to select the display's waypoint.
   */
  private updateFocus(allowSelection: boolean): void {
    if (allowSelection) {
      this.focusController.focusFirst();
    }
  }

  /**
   * Updates the visibility of this display's tab container.
   */
  private updateTabsVisibility(): void {
    if (this.contentMode.get() === WaypointInfoContentMode.Airport) {
      this.tabsHidden.set(false);
      this.tabsRef.instance.selectFirstTab();
    } else {
      this.tabsHidden.set(true);
      this.tabsRef.instance.selectTabIndex(-1);
    }
  }

  /**
   * Updates the pause/resume state of this display's tab container.
   */
  private updateTabsResumeState(): void {
    if (this.tabsHidden.get()) {
      this.tabsRef.instance.close();
    } else {
      if (this.isResumed) {
        this.tabsRef.instance.resume();
      } else {
        this.tabsRef.instance.open();
      }
    }
  }

  /**
   * Updates the size of this display's information component.
   */
  private updateInfoSize(): void {
    // TODO: support GDU470 (portrait)

    const tabsHidden = this.tabsHidden.get();

    let width: number, height: number;

    // Calculate the size of the info component.
    if (this.sizeMode === UiViewSizeMode.Half) {
      // The info component is contained within the Info tab if the tab container is visible, or within its own panel
      // if the tab container is hidden.

      // It has 8px horizontal margins from the inner border of the tab container/panel on each side. We also need to
      // subtract the 3px borders of the tab container/panel on each side. If the tab container is visible, then we
      // subtract the 92px width of the tabs.
      width = this.dimensions[0] - 8 * 2 - 3 * 2 - (tabsHidden ? 0 : 92);

      // It has 2px vertical margins from the inner border of the tab container on each side. We also need to
      // subtract the 3px borders of the tab container on each side, the 70px height of the selection button, and the
      // the 7px margin between the selection button and the tab container.
      height = this.dimensions[1] - 2 * 2 - 3 * 2 - 70 - 7;

      this.isInfoInTab.set(!tabsHidden);
    } else {
      // The info component is contained within its own panel.

      // If the tab container is hidden, then the panel takes up the entire width of the display. Otherwise, the panel
      // takes up the entire width of the left side, which itself takes up 5/11th of the available horizontal space
      // after a 7px gap is subtracted.
      const panelWidth = tabsHidden
        ? this.dimensions[0]
        : Math.floor(5 * (this.dimensions[0] - 7) / 11);

      // The info component has 8px horizontal margins from the inner border of the panel. We also need to subtract the
      // 3px borders of the panel.
      width = panelWidth - 8 * 2 - 3 * 2;

      // The vertical layout is similar to that in half-pane mode (see above), with the panel replacing the tab
      // container.
      height = this.dimensions[1] - 2 * 2 - 3 * 2 - 70 - 7;

      this.isInfoInTab.set(false);
    }

    this.infoRef.instance.setSize(width, height);
  }

  /**
   * Updates the pause/resume state of this display's information component.
   */
  private updateInfoResumeState(): void {
    if (this.infoHidden.get()) {
      this.infoRef.instance.pause();
    } else {
      this.infoRef.instance.resume();
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        class={{
          'waypoint-info': true,
          'waypoint-info-info-in-tab': this.isInfoInTab
        }}
      >
        <div class='waypoint-info-grid'>
          <UiWaypointSelectButton
            uiService={this.props.uiService}
            type={FacilitySearchType.AllExceptVisual}
            waypoint={this.selectedWaypoint}
            waypointCache={GarminFacilityWaypointCache.getCache(this.props.uiService.bus)}
            nullIdent={'––––––'}
            isEnabled={this.props.allowSelection}
            focusController={this.focusController}
            class='waypoint-info-select'
          />
          <TabbedContainer
            ref={this.tabsRef}
            bus={this.props.uiService.bus}
            validKnobIds={this.props.validKnobIds}
            knobLabel={this.tabKnobLabel}
            tabPosition='right'
            tabsPerListPage={this.tabsPerListPage}
            tabLength={this.tabLength}
            tabSpacing={this.tabSpacing}
            gduFormat={this.props.uiService.gduFormat}
            class={{ 'waypoint-info-tab-container': true, 'hidden': this.tabsHidden }}
          >
            <GenericTabbedContent
              tabLabel={() => {
                return (
                  <>
                    <img
                      src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_apt_info_tab.png`}
                      class='waypoint-info-tab-label-icon'
                      style={{ '--waypoint-info-tab-label-icon-img-height': '47px' }}
                    />
                    <div class='waypoint-info-tab-label-text'>Info</div>
                  </>
                );
              }}
              isVisible={this.isInfoInTab}
              onSelect={() => { this.isInfoTabSelected.set(true); }}
              onDeselect={() => { this.isInfoTabSelected.set(false); }}
              onUiInteractionEvent={event => this.infoRef.instance.onUiInteractionEvent(event)}
            />

            <AirportFreqTab
              tabLabel={() => {
                return (
                  <>
                    <img
                      src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_apt_freq_tab.png`}
                      class='waypoint-info-tab-label-icon'
                      style={{ '--waypoint-info-tab-label-icon-img-height': '50px' }}
                    />
                    <div class='waypoint-info-tab-label-text'>Freq</div>
                  </>
                );
              }}
              uiService={this.props.uiService}
              facLoader={this.props.facLoader}
              facility={this.waypointInfoStore.facility}
              radiosConfig={this.props.radiosConfig}
              tabContentDimensions={this.tabContentDimensions}
              comRadioSpacingDataProvider={this.props.comRadioSpacingDataProvider}
            />

            <AirportRunwayTab
              tabLabel={() => {
                return (
                  <>
                    <img
                      src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_apt_runway_tab.png`}
                      class='waypoint-info-tab-label-icon'
                      style={{ '--waypoint-info-tab-label-icon-img-height': '45px' }}
                    />
                    <div class='waypoint-info-tab-label-text'>Runway</div>
                  </>
                );
              }}
              uiService={this.props.uiService}
              containerRef={this.props.containerRef}
              facLoader={this.props.facLoader}
              waypointInfo={this.waypointInfoStore}
              tabContentDimensions={this.tabContentDimensions}
              mapBingId={this.props.runwayTabMapBingId}
              gduSettingManager={this.props.gduSettingManager}
              mapSettingManager={this.props.mapSettingManager}
              unitsSettingManager={this.props.unitsSettingManager}
              mapConfig={this.props.mapConfig}
            />

            <AirportWeatherTab
              tabLabel={() => {
                return (
                  <>
                    <img
                      src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_weather.png`}
                      class='waypoint-info-tab-label-icon'
                      style={{ '--waypoint-info-tab-label-icon-img-height': '48px' }}
                    />
                    <div class='waypoint-info-tab-label-text'>Weather</div>
                  </>
                );
              }}
              uiService={this.props.uiService}
              facLoader={this.props.facLoader}
              waypointInfo={this.waypointInfoStore}
              tabContentDimensions={this.tabContentDimensions}
              comRadioSpacingDataProvider={this.props.comRadioSpacingDataProvider}
              dateTimeSettingManager={this.props.dateTimeSettingManager}
              unitsSettingManager={this.props.unitsSettingManager}
            />

            <GenericTabbedContent tabLabel={() => {
              return (
                <>
                  <img
                    src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_nrst_fss.png`}
                    class='waypoint-info-tab-label-icon'
                    style={{ '--waypoint-info-tab-label-icon-img-height': '48px' }}
                  />
                  <div class='waypoint-info-tab-label-text'>NOTAM</div>
                </>
              );
            }} isEnabled={false}
            >
            </GenericTabbedContent>

            <GenericTabbedContent tabLabel={() => {
              return (
                <>
                  <img
                    src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_directory.png`}
                    class='waypoint-info-tab-label-icon'
                    style={{ '--waypoint-info-tab-label-icon-img-height': '48px' }}
                  />
                  <div class='waypoint-info-tab-label-text'>AOPA</div>
                </>
              );
            }} isEnabled={false}>
            </GenericTabbedContent>

            <GenericTabbedContent tabLabel={() => {
              return (
                <>
                  <img
                    src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_charts.png`}
                    class='waypoint-info-tab-label-icon'
                    style={{ '--waypoint-info-tab-label-icon-img-height': '48px' }}
                  />
                  <div class='waypoint-info-tab-label-text'>Charts</div>
                </>
              );
            }} isEnabled={false}>
            </GenericTabbedContent>
          </TabbedContainer>
        </div>
        <div class={{ 'waypoint-info-info-wrapper': true, 'hidden': this.infoHidden }}>
          <WaypointInfoInfo
            ref={this.infoRef}
            uiService={this.props.uiService}
            validKnobIds={this.props.validKnobIds}
            waypointInfoStore={this.waypointInfoStore}
            contentMode={this.contentMode}
            showTitle={MappedSubject.create(
              ([contentMode, isInfoInTab]) => contentMode === WaypointInfoContentMode.Airport && !isInfoInTab,
              this.contentMode,
              this.isInfoInTab
            )}
            allowKnobZoom={this.tabsHidden}
            fplSourceDataProvider={this.props.fplSourceDataProvider}
            mapBingId={this.props.mapBingId}
            gduSettingManager={this.props.gduSettingManager}
            displaySettingManager={this.props.displaySettingManager}
            mapSettingManager={this.props.mapSettingManager}
            unitsSettingManager={this.props.unitsSettingManager}
            mapConfig={this.props.mapConfig}
          />
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.pposPipe.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
