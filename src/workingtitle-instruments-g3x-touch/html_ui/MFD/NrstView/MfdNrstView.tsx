import {
  CompiledMapSystem, DebounceTimer, FSComponent, FilteredMapSubject, MapIndexedRangeModule, MapSystemBuilder,
  MappedSubject, ReadonlyFloat64Array, Subject, Subscription, UserSettingManager, VNode, Vec2Math, Vec2Subject, VecNMath
} from '@microsoft/msfs-sdk';

import { GarminMapKeys, MapRangeController, MapWaypointHighlightModule, TouchPad, TrafficSystem } from '@microsoft/msfs-garminsdk';

import { AvionicsStatusChangeEvent, AvionicsStatusEvents } from '../../Shared/AvionicsStatus/AvionicsStatusEvents';
import { AvionicsStatus } from '../../Shared/AvionicsStatus/AvionicsStatusTypes';
import { EisLayouts, EisSizes } from '../../Shared/CommonTypes';
import { G3XNearestMapBuilder } from '../../Shared/Components/Map/Assembled/G3XNearestMapBuilder';
import { MapDragPanController } from '../../Shared/Components/Map/Controllers/MapDragPanController';
import { G3XMapKeys } from '../../Shared/Components/Map/G3XMapKeys';
import { MapConfig } from '../../Shared/Components/Map/MapConfig';
import { MapDragPanModule } from '../../Shared/Components/Map/Modules/MapDragPanModule';
import { G3XFplSourceDataProvider } from '../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { G3XTouchFilePaths } from '../../Shared/G3XTouchFilePaths';
import { PositionHeadingDataProvider } from '../../Shared/Navigation/PositionHeadingDataProvider';
import { ComRadioSpacingDataProvider } from '../../Shared/Radio/ComRadioSpacingDataProvider';
import { G3XTrafficUserSettings } from '../../Shared/Settings/G3XTrafficUserSettings';
import { G3XUnitsUserSettings } from '../../Shared/Settings/G3XUnitsUserSettings';
import { GduUserSettingTypes } from '../../Shared/Settings/GduUserSettings';
import { MapUserSettings } from '../../Shared/Settings/MapUserSettings';
import { AbstractUiView } from '../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../Shared/UiSystem/UiKnobTypes';
import { UiKnobUtils } from '../../Shared/UiSystem/UiKnobUtils';
import { UiViewProps } from '../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../Shared/UiSystem/UiViewKeys';
import { UiViewLifecyclePolicy, UiViewOcclusionType, UiViewSizeMode, UiViewStackLayer } from '../../Shared/UiSystem/UiViewTypes';
import { MfdPageNavBar } from '../Components/PageNavigation/MfdPageNavBar';
import { MfdPageContainer } from '../PageNavigation/MfdPageContainer';
import { MfdPageDefinition } from '../PageNavigation/MfdPageDefinition';
import { MfdPageEntry, MfdPageSizeMode } from '../PageNavigation/MfdPageTypes';
import { MfdPageSelectDialog } from '../Views/PageSelectDialog/MfdPageSelectDialog';
import { MfdNrstPage } from './MfdNrstPage';
import { MfdNrstPageKeys } from './MfdNrstPageKeys';
import { MfdNrstAirportPage } from './Pages/MfdNrstAirportPage/MfdNrstAirportPage';
import { MfdNrstIntersectionPage } from './Pages/MfdNrstIntersectionPage/MfdNrstIntersectionPage';
import { MfdNrstNdbPage } from './Pages/MfdNrstNdbPage/MfdNrstNdbPage';
import { MfdNrstUserWaypointPage } from './Pages/MfdNrstUserWaypointPage/MfdNrstUserWaypointPage';
import { MfdNrstVorPage } from './Pages/MfdNrstVorPage/MfdNrstVorPage';

import './MfdNrstView.css';

/**
 * Component props for {@link MfdNrstView}.
 */
export interface MfdNrstViewProps extends UiViewProps {
  /** The traffic system used by the page's map to display traffic, or `null` if there is no traffic system. */
  trafficSystem: TrafficSystem | null;

  /** A provider of airplane position and heading data. */
  posHeadingDataProvider: PositionHeadingDataProvider;

  /** A provider of flight plan source data. */
  fplSourceDataProvider: G3XFplSourceDataProvider;

  /** A provider of COM radio spacing mode data. */
  comRadioSpacingDataProvider: ComRadioSpacingDataProvider;

  /** A manager for GDU user settings. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;

  /** A configuration object defining options for the map. */
  mapConfig: MapConfig;
}

/**
 * UI view keys for popups owned by the MFD NRST display.
 */
enum MfdNrstViewPopupKeys {
  PageSelectDialog = 'MfdNrstPageSelectDialog'
}

/**
 * An MFD NRST display.
 */
export class MfdNrstView extends AbstractUiView<MfdNrstViewProps> {
  private static readonly DEFAULT_RANGE_INDEX = 7; // 0.8 nautical miles

  private static readonly MAP_RESIZE_HIDE_DURATION = 250; // milliseconds

  private readonly touchPadRef = FSComponent.createRef<TouchPad>();
  private readonly pageContainerRef = FSComponent.createRef<MfdPageContainer>();
  private readonly navBarRef = FSComponent.createRef<MfdPageNavBar>();

  private readonly containerDimensions = Vec2Math.create();

  private readonly sizeMode = Subject.create(UiViewSizeMode.Hidden);
  private occlusionType: UiViewOcclusionType = 'none';

  private readonly pageDefs = this.createPageDefs();

  private readonly selectedPageTitle = Subject.create('');
  private readonly selectedPageIconSrc = Subject.create('');

  private readonly maxLabelsPerListPage = this.props.uiService.gduFormat === '460'
    ? MappedSubject.create(
      ([sizeMode, eisLayout], previousVal?: number): number => {
        switch (sizeMode) {
          case UiViewSizeMode.Full:
            return 10;
          case UiViewSizeMode.Half:
            if (this.props.uiService.gdu460EisSize === undefined || eisLayout === EisLayouts.None) {
              return 8;
            } else {
              return this.props.uiService.gdu460EisSize === EisSizes.Narrow ? 7 : 6;
            }
          default:
            return previousVal ?? 10;
        }
      },
      this.sizeMode,
      this.props.uiService.gdu460EisLayout
    )
    : Subject.create(6);

  private readonly activePageRequestedKnobLabelState = FilteredMapSubject.create<UiKnobId, string>(this.props.uiService.validKnobIds);
  private activePageRequestedKnobLabelStatePipe?: Subscription;

  private readonly mapSize = Vec2Subject.create(Vec2Math.create(100, 100));

  private readonly compiledMap = MapSystemBuilder.create(this.props.uiService.bus)
    .with(G3XNearestMapBuilder.build, {
      gduFormat: this.props.uiService.gduFormat,

      bingId: `g3x-${this.props.uiService.instrumentIndex}-map-1`,

      dataUpdateFreq: 30,

      gduIndex: this.props.uiService.instrumentIndex,
      gduSettingManager: this.props.gduSettingManager,

      highlightMargins: this.props.uiService.gduFormat === '460' ? VecNMath.create(4, 30, 30, 30, 30) : VecNMath.create(4, 15, 15, 15, 15),

      projectedRange: this.props.uiService.gduFormat === '460' ? 60 : 30,

      airplaneIconSrc: this.props.mapConfig.ownAirplaneIconSrc,

      flightPlanner: this.props.fplSourceDataProvider.flightPlanner,
      lnavIndex: this.props.fplSourceDataProvider.lnavIndex,
      vnavIndex: this.props.fplSourceDataProvider.vnavIndex,

      trafficSystem: this.props.trafficSystem ?? undefined,
      trafficIconOptions: {
        iconSize: 30,
        fontSize: 14
      },

      settingManager: MapUserSettings.getStandardManager(this.props.uiService.bus),
      trafficSettingManager: G3XTrafficUserSettings.getManager(this.props.uiService.bus),
      unitsSettingManager: G3XUnitsUserSettings.getManager(this.props.uiService.bus)
    })
    .withProjectedSize(this.mapSize)
    .build('common-map mfd-nrst-map') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;

        /** The waypoint highlight module. */
        [GarminMapKeys.WaypointHighlight]: MapWaypointHighlightModule;

        /** The drag-to-pan module. */
        [G3XMapKeys.DragPan]: MapDragPanModule;
      },
      any,
      {
        /** The range controller. */
        [GarminMapKeys.Range]: MapRangeController;

        /** The drag-to-pan controller. */
        [G3XMapKeys.DragPan]: MapDragPanController;
      },
      any
    >;

  private readonly mapHighlightModule = this.compiledMap.context.model.getModule(GarminMapKeys.WaypointHighlight);
  private readonly mapDragPanModule = this.compiledMap.context.model.getModule(G3XMapKeys.DragPan);

  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);
  private readonly mapDragPanController = this.compiledMap.context.getController(G3XMapKeys.DragPan);

  private selectedWaypointPipe?: Subscription;

  private dragPanPrimed = false;
  private readonly dragPanThreshold = this.props.uiService.gduFormat === '460' ? 20 : 10;
  private readonly dragStartPos = Vec2Math.create();
  private readonly dragDelta = Vec2Math.create();

  private readonly mapHiddenDebounce = new DebounceTimer();
  private readonly mapHidden = Subject.create(false);
  private readonly showMapFunc = this.mapHidden.set.bind(this.mapHidden, false);

  private isResumed = false;

  private avionicsStatusSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.pageContainerRef.instance.activePageEntry.sub(this.onActivePageChanged.bind(this), true);

    UiKnobUtils.reconcileRequestedLabelStates(
      this.props.uiService.validKnobIds, this._knobLabelState, false,
      this.activePageRequestedKnobLabelState,
      this.navBarRef.instance.knobLabelState
    );

    this.props.uiService.registerMfdView(
      UiViewStackLayer.Main, UiViewLifecyclePolicy.Transient, MfdNrstViewPopupKeys.PageSelectDialog,
      (uiService, containerRef) => {
        return (
          <MfdPageSelectDialog
            uiService={uiService}
            containerRef={containerRef}
            pageDefs={this.pageDefs}
          />
        );
      }
    );

    this.compiledMap.ref.instance.sleep();

    this.reset();

    this.avionicsStatusSub = this.props.uiService.bus.getSubscriber<AvionicsStatusEvents>()
      .on(`avionics_status_${this.props.uiService.instrumentIndex}`)
      .handle(this.onAvionicsStatusChanged.bind(this));
  }

  /**
   * Responds to when the active page changes.
   * @param pageEntry The entry for the new active page, or `null` if there is no active page.
   */
  private onActivePageChanged(pageEntry: MfdPageEntry | null): void {
    this.activePageRequestedKnobLabelStatePipe?.destroy();
    this.selectedWaypointPipe?.destroy();

    if (pageEntry) {
      this.activePageRequestedKnobLabelStatePipe = pageEntry.page.knobLabelState.pipe(this.activePageRequestedKnobLabelState);

      this.selectedWaypointPipe = (pageEntry.page as MfdNrstPage).selectedWaypoint?.pipe(this.mapHighlightModule.waypoint);
    } else {
      this.activePageRequestedKnobLabelStatePipe = undefined;
      this.activePageRequestedKnobLabelState.clear();

      this.selectedWaypointPipe = undefined;
    }
  }

  /** @inheritDoc */
  public onOpen(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.handleResize(sizeMode, dimensions);
  }

  /** @inheritDoc */
  public onClose(): void {
    this.occlusionType = 'none';

    this.mapDragPanController.setDragPanActive(false);

    this.pageContainerRef.instance.sleep();
    this.compiledMap.ref.instance.sleep();

    this.mapHiddenDebounce.clear();
    this.mapHidden.set(true);
  }

  /** @inheritDoc */
  public onResume(): void {
    this.isResumed = true;

    this.navBarRef.instance.resume();
    this.pageContainerRef.instance.resume();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.isResumed = false;

    this.navBarRef.instance.pause();
    this.pageContainerRef.instance.pause();
  }

  /** @inheritDoc */
  public onResize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.handleResize(sizeMode, dimensions);
  }

  /**
   * Handles potential changes in the size mode or dimensions of this view's container.
   * @param sizeMode The new size mode of this view's container.
   * @param dimensions The new dimensions of this view's container, as `[width, height]` in pixels.
   */
  private handleResize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    // TODO: Add support for GDU470 (portrait) dimensions.

    switch (sizeMode) {
      case UiViewSizeMode.Full: {
        // Both containers take up the full height of the view minus 7px padding and 3px border on each side, and 40px
        // title and 33px navigation bar.
        const height = dimensions[1] - 7 * 2 - 3 * 2 - 40 - 33;
        // The map takes up half the space remaining after subtracting from the view width 7px padding on each side and
        // 7px gap between the map and page, minus an additional 3px border on each side.
        const mapWidth = Math.round((dimensions[0] - 7 * 3) * 0.5) - 3 * 2;
        // The page takes up the width not taken up by the map minus 7px padding on each side, 7px gap between the map
        // and page, and 3px border on each side of the map and page.
        const pageWidth = dimensions[0] - mapWidth - 7 * 3 - 3 * 4;

        this.mapSize.set(mapWidth, height);

        Vec2Math.set(pageWidth, height, this.containerDimensions);
        this.pageContainerRef.instance.setSize(MfdPageSizeMode.Full, this.containerDimensions);

        if (this.occlusionType !== 'hide') {
          this.compiledMap.ref.instance.wake();
        }
        this.pageContainerRef.instance.wake();
        if (this.isResumed) {
          this.pageContainerRef.instance.resume();
        }
        break;
      }
      case UiViewSizeMode.Half: {
        // Both containers take up the full width of the view minus 7px padding on one side and 3px border on each side.
        const width = dimensions[0] - 7 - 3 * 2;
        const height = 288;

        this.mapSize.set(width, height);

        Vec2Math.set(width, height, this.containerDimensions);
        this.pageContainerRef.instance.setSize(MfdPageSizeMode.Half, this.containerDimensions);

        if (this.occlusionType !== 'hide') {
          this.compiledMap.ref.instance.wake();
        }
        this.pageContainerRef.instance.wake();
        if (this.isResumed) {
          this.pageContainerRef.instance.resume();
        }
        break;
      }
      default:
        this.compiledMap.ref.instance.sleep();
        this.pageContainerRef.instance.sleep();
    }

    this.sizeMode.set(sizeMode);

    // Hide the map for a short period after resizing so that users don't see any artifacts from the Bing map texture.
    this.mapHidden.set(true);
    this.mapHiddenDebounce.schedule(this.showMapFunc, MfdNrstView.MAP_RESIZE_HIDE_DURATION);
  }

  /** @inheritDoc */
  public onOcclusionChange(occlusionType: UiViewOcclusionType): void {
    this.occlusionType = occlusionType;

    if (occlusionType === 'hide') {
      this.compiledMap.ref.instance.sleep();
    } else {
      this.compiledMap.ref.instance.wake();
    }

    this.pageContainerRef.instance.setOcclusion(occlusionType);
  }

  /** @inheritDoc */
  public onUpdate(time: number): void {
    if (this.mapDragPanModule.isActive.get()) {
      if (this.dragDelta[0] !== 0 || this.dragDelta[1] !== 0) {
        this.mapDragPanController.drag(this.dragDelta[0], this.dragDelta[1]);
        Vec2Math.set(0, 0, this.dragDelta);
      }
    }

    this.compiledMap.ref.instance.update(time);

    this.pageContainerRef.instance.update(time);
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (this.pageContainerRef.instance.onUiInteractionEvent(event)) {
      return true;
    }

    if (this.navBarRef.instance.onUiInteractionEvent(event)) {
      return true;
    }

    if (event === UiInteractionEvent.MenuPress) {
      this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.NoOptionsPopup, false, { popupType: 'slideout-bottom-full' });
      return true;
    }

    return false;
  }

  /**
   * Responds to when the avionics status of this page's parent GDU changes.
   * @param event The event describing the avionics status change.
   */
  private onAvionicsStatusChanged(event: Readonly<AvionicsStatusChangeEvent>): void {
    if (event.current === AvionicsStatus.Off) {
      this.reset();
    }
  }

  /**
   * Resets this page in response to a power cycle.
   */
  private reset(): void {
    this.mapRangeController.setRangeIndex(MfdNrstView.DEFAULT_RANGE_INDEX);
  }

  /**
   * Responds to when a drag motion starts on this page's map.
   * @param position The position of the mouse.
   */
  private onDragStarted(position: ReadonlyFloat64Array): void {
    this.dragStartPos.set(position);
    this.dragPanPrimed = true;
  }

  /**
   * Responds to when the mouse moves while dragging over this page's map.
   * @param position The new position of the mouse.
   * @param prevPosition The position of the mouse at the previous update.
   */
  private onDragMoved(position: ReadonlyFloat64Array, prevPosition: ReadonlyFloat64Array): void {
    if (this.mapDragPanModule.isActive.get()) {
      // Drag-to-pan is active. Accumulate dragging deltas so that they can be applied at the next update cycle.

      this.dragDelta[0] += position[0] - prevPosition[0];
      this.dragDelta[1] += position[1] - prevPosition[1];
    } else if (this.dragPanPrimed) {
      // Drag-to-pan is not active but is primed. If the user has dragged farther than the threshold required to
      // activate drag-to-pan, then do so.

      const dx = position[0] - this.dragStartPos[0];
      const dy = position[1] - this.dragStartPos[1];

      if (Math.hypot(dx, dy) >= this.dragPanThreshold) {
        this.dragPanPrimed = false;

        this.mapDragPanController.setDragPanActive(true);
        this.mapDragPanController.drag(dx, dy);
      }
    }
  }

  /**
   * Responds to when a drag motion ends on this page's map.
   */
  private onDragEnded(): void {
    this.dragPanPrimed = false;
    Vec2Math.set(0, 0, this.dragDelta);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='mfd-nrst-view ui-titled-view'>
        <div class='mfd-nrst-view-title ui-view-title'>
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_nearest.png`} class='ui-view-title-icon' />
          <div>Nearest</div>
        </div>
        <div class='mfd-nrst-view-content ui-titled-view-content'>
          <div class='mfd-nrst-view-content-main'>
            <div class='mfd-nrst-view-map-container'>
              <div class={{ 'visibility-hidden': this.mapHidden }}>
                <TouchPad
                  ref={this.touchPadRef}
                  bus={this.props.uiService.bus}
                  onDragStarted={this.onDragStarted.bind(this)}
                  onDragMoved={this.onDragMoved.bind(this)}
                  onDragEnded={this.onDragEnded.bind(this)}
                  class='mfd-nrst-view-touch-pad'
                >
                  {this.compiledMap.map}
                </TouchPad>
                <div class='ui-layered-darken' />
              </div>
            </div>
            <div class='mfd-nrst-view-page-container-container'>
              <MfdPageContainer
                ref={this.pageContainerRef}
                registeredPageDefs={this.pageDefs}
                uiService={this.props.uiService}
                containerRef={this.props.containerRef}
                selectedPageKey={this.props.uiService.selectedMfdNrstPageKey}
                selectedPageTitle={this.selectedPageTitle}
                selectedPageIconSrc={this.selectedPageIconSrc}
              />
            </div>
          </div>
          <div class='mfd-nrst-view-nav-bar-container'>
            <MfdPageNavBar
              ref={this.navBarRef}
              pageDefs={this.pageDefs}
              uiService={this.props.uiService}
              selectedPageKey={this.props.uiService.selectedMfdNrstPageKey}
              selectedPageTitle={this.selectedPageTitle}
              selectedPageIconSrc={this.selectedPageIconSrc}
              labelWidth={48}
              maxLabelsPerListPage={this.maxLabelsPerListPage}
              pageSelectDialogKey={MfdNrstViewPopupKeys.PageSelectDialog}
              onPageSelected={pageDef => {
                this.props.uiService.selectMfdNrstPage(pageDef.key);
              }}
            />
            <div class='ui-layered-darken' />
          </div>
        </div>
      </div>
    );
  }

  /**
   * Creates an array of NRST page definitions.
   * @returns An array of NRST page definitions.
   */
  private createPageDefs(): Readonly<MfdPageDefinition>[] {
    return [
      {
        key: MfdNrstPageKeys.Airport,
        label: 'Apt',
        selectIconSrc: `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_nrst_airport.png`,
        selectLabel: 'Airports',
        order: 0,
        factory: (uiService, containerRef) => {
          return (
            <MfdNrstAirportPage
              uiService={uiService}
              containerRef={containerRef}
              posHeadingDataProvider={this.props.posHeadingDataProvider}
              comRadioSpacingDataProvider={this.props.comRadioSpacingDataProvider}
            />
          );
        }
      },

      {
        key: MfdNrstPageKeys.Vor,
        label: 'VOR',
        selectIconSrc: `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_nrst_vor.png`,
        selectLabel: 'VORs',
        order: 1,
        factory: (uiService, containerRef) => {
          return (
            <MfdNrstVorPage
              uiService={uiService} containerRef={containerRef}
              posHeadingDataProvider={this.props.posHeadingDataProvider}
            />
          );
        }
      },

      {
        key: MfdNrstPageKeys.Ndb,
        label: 'NDB',
        selectIconSrc: `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_nrst_ndb.png`,
        selectLabel: 'NDBs',
        order: 2,
        factory: (uiService, containerRef) => {
          return (
            <MfdNrstNdbPage
              uiService={uiService} containerRef={containerRef}
              posHeadingDataProvider={this.props.posHeadingDataProvider}
            />
          );
        }
      },

      {
        key: MfdNrstPageKeys.Intersection,
        label: 'INT',
        selectIconSrc: `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_nrst_intersection.png`,
        selectLabel: 'Intersections',
        order: 3,
        factory: (uiService, containerRef) => {
          return (
            <MfdNrstIntersectionPage
              uiService={uiService} containerRef={containerRef}
              posHeadingDataProvider={this.props.posHeadingDataProvider}
            />
          );
        }
      },

      {
        key: MfdNrstPageKeys.UserWaypoint,
        label: 'USR',
        selectIconSrc: `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_nrst_user.png`,
        selectLabel: 'User WPTs',
        order: 4,
        factory: (uiService, containerRef) => {
          return (
            <MfdNrstUserWaypointPage
              uiService={uiService} containerRef={containerRef}
              posHeadingDataProvider={this.props.posHeadingDataProvider}
            />
          );
        }
      },

      {
        key: MfdNrstPageKeys.City,
        label: 'CTY',
        selectIconSrc: `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_nrst_city.png`,
        selectLabel: 'Cities',
        order: 5,
      },

      {
        key: MfdNrstPageKeys.Artcc,
        label: 'ATC',
        selectIconSrc: '',
        selectLabel: 'ARTCC',
        order: 6,
      },

      {
        key: MfdNrstPageKeys.Fss,
        label: 'FSS',
        selectIconSrc: `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_nrst_fss.png`,
        selectLabel: 'FSS',
        order: 7,
      },

      {
        key: MfdNrstPageKeys.Airspace,
        label: 'ASPC',
        selectIconSrc: `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_nrst_airspace.png`,
        selectLabel: 'Airspace',
        order: 8,
      },
    ];
  }

  /** @inheritDoc */
  public destroy(): void {
    this.mapHiddenDebounce.clear();

    this.compiledMap.ref.getOrDefault()?.destroy();
    this.touchPadRef.getOrDefault()?.destroy();

    this.pageContainerRef.getOrDefault()?.destroy();
    this.navBarRef.getOrDefault()?.destroy();

    'destroy' in this.maxLabelsPerListPage && this.maxLabelsPerListPage.destroy();

    this.activePageRequestedKnobLabelStatePipe?.destroy();
    this.selectedWaypointPipe?.destroy();

    this.avionicsStatusSub?.destroy();

    super.destroy();
  }
}