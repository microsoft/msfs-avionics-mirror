import {
  CompiledMapSystem, DebounceTimer, FSComponent, FacilitySearchType, FacilityType, FacilityWaypoint, FlightPlan,
  FlightPlanner, ICAO, LegDefinition, MapIndexedRangeModule, MapSystemBuilder, MapSystemGenericController,
  MappedSubject, NumberFormatter, NumberUnitSubject, ReadonlyFloat64Array, ResourceConsumer, ResourceModerator,
  Subject, SubscribableMapFunctions, Subscription, Unit, UnitFamily, UnitType, UserSetting, UserSettingManager, VNode,
  Vec2Math, Vec2Subject, VecNMath
} from '@microsoft/msfs-sdk';

import {
  FmsUtils, GarminFacilityWaypointCache, GarminMapKeys, LegIndexes, MapFlightPlanFocusModule, MapOrientation,
  MapOrientationModule, MapRangeController, TouchPad, TrafficSystem
} from '@microsoft/msfs-garminsdk';

import { FmsFlightPlanningConfig } from '../../../../Shared/AvionicsConfig/FmsConfig';
import { G3XUnitsFuelType, UnitsConfig } from '../../../../Shared/AvionicsConfig/UnitsConfig';
import { EisLayouts } from '../../../../Shared/CommonTypes';
import { G3XNumberUnitDisplay } from '../../../../Shared/Components/Common/G3XNumberUnitDisplay';
import { UiFlightPlanList } from '../../../../Shared/Components/FlightPlan/UiFlightPlanList';
import { UiListButton } from '../../../../Shared/Components/List/UiListButton';
import { G3XNavMapBuilder } from '../../../../Shared/Components/Map/Assembled/G3XNavMapBuilder';
import { MapDragPanController } from '../../../../Shared/Components/Map/Controllers/MapDragPanController';
import { G3XMapKeys } from '../../../../Shared/Components/Map/G3XMapKeys';
import { MapConfig } from '../../../../Shared/Components/Map/MapConfig';
import { G3XMapCompassArcModule } from '../../../../Shared/Components/Map/Modules/G3XMapCompassArcModule';
import { MapDragPanModule } from '../../../../Shared/Components/Map/Modules/MapDragPanModule';
import { UiTouchButton } from '../../../../Shared/Components/TouchButton/UiTouchButton';
import { UiValueTouchButton } from '../../../../Shared/Components/TouchButton/UiValueTouchButton';
import { ActiveFlightPlanDataArray } from '../../../../Shared/FlightPlan/ActiveFlightPlanDataArray';
import { DefaultFlightPlanDataFieldCalculatorRepo } from '../../../../Shared/FlightPlan/DefaultFlightPlanDataFieldCalculatorRepo';
import { DefaultFlightPlanDataFieldFactory } from '../../../../Shared/FlightPlan/DefaultFlightPlanDataFieldFactory';
import { FlightPlanDataFieldType } from '../../../../Shared/FlightPlan/FlightPlanDataField';
import {
  FlightPlanAddWaypointDataItem, FlightPlanApproachLegPreviewDataItem, FlightPlanDataItem, FlightPlanDataItemType,
  FlightPlanLegDataItem
} from '../../../../Shared/FlightPlan/FlightPlanDataItem';
import { FlightPlanStore } from '../../../../Shared/FlightPlan/FlightPlanStore';
import { G3XFms } from '../../../../Shared/FlightPlan/G3XFms';
import { G3XFplSourceDataProvider } from '../../../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { G3XExternalFplSourceIndex, G3XFplSource } from '../../../../Shared/FlightPlan/G3XFplSourceTypes';
import { G3XTouchFilePaths } from '../../../../Shared/G3XTouchFilePaths';
import { G3XUnitType } from '../../../../Shared/Math/G3XUnitType';
import { FplCalculationUserSettings } from '../../../../Shared/Settings/FplCalculationUserSettings';
import { FplDisplayUserSettings } from '../../../../Shared/Settings/FplDisplayUserSettings';
import { FplSourceUserSettings, G3XFplSourceSettingMode } from '../../../../Shared/Settings/FplSourceUserSettings';
import { G3XDateTimeUserSettings } from '../../../../Shared/Settings/G3XDateTimeUserSettings';
import { G3XTrafficUserSettings } from '../../../../Shared/Settings/G3XTrafficUserSettings';
import { G3XUnitsUserSettings } from '../../../../Shared/Settings/G3XUnitsUserSettings';
import { GduUserSettingTypes } from '../../../../Shared/Settings/GduUserSettings';
import { MapUserSettings } from '../../../../Shared/Settings/MapUserSettings';
import { UiInteractionEvent } from '../../../../Shared/UiSystem/UiInteraction';
import { UiKnobUtils } from '../../../../Shared/UiSystem/UiKnobUtils';
import { UiViewKeys } from '../../../../Shared/UiSystem/UiViewKeys';
import { UiViewLifecyclePolicy, UiViewOcclusionType, UiViewStackLayer } from '../../../../Shared/UiSystem/UiViewTypes';
import { UiViewUtils } from '../../../../Shared/UiSystem/UiViewUtils';
import { UiListSelectTouchButton } from '../../../Components/TouchButton/UiListSelectTouchButton';
import { UiGenericNumberUnitDialog } from '../../../Dialogs/UiGenericNumberUnitDialog';
import { UiListDialog } from '../../../Dialogs/UiListDialog';
import { UiMessageDialog } from '../../../Dialogs/UiMessageDialog';
import { AbstractMfdPage } from '../../../PageNavigation/AbstractMfdPage';
import { MfdPageProps } from '../../../PageNavigation/MfdPage';
import { MfdPageSizeMode } from '../../../PageNavigation/MfdPageTypes';
import { ApproachDialog } from '../../../Views/ApproachDialog/ApproachDialog';
import { DirectToView } from '../../../Views/DirectToView/DirectToView';
import { WaypointDialog } from '../../../Views/WaypointDialog/WaypointDialog';
import { WaypointInfoPopup } from '../../../Views/WaypointInfoPopup/WaypointInfoPopup';
import { MfdFplPageDataFieldRenderer } from './DataField/MfdFplPageDataFieldRenderer';
import { MfdFplPageDataFieldSelectDialog } from './DataField/MfdFplPageDataFieldSelectDialog';
import { MfdFplPageDataFieldSlot } from './DataField/MfdFplPageDataFieldSlot';
import { MfdFplOptionsPopup } from './MfdFplOptionsPopup';
import { MfdFplPageApproachLegPreviewListItem } from './MfdFplPageApproachLegPreviewListItem';
import { MfdFplPageLegListItem } from './MfdFplPageLegListItem';

import './MfdFplPage.css';

/**
 * Props for {@link MfdFplPage}
 */
export interface MfdFplPageProps extends MfdPageProps {
  /** The FMS. */
  fms: G3XFms;

  /** The traffic system used by the page's map to display traffic, or `null` if there is no traffic system. */
  trafficSystem: TrafficSystem | null;

  /** A provider of flight plan source data. */
  fplSourceDataProvider: G3XFplSourceDataProvider;

  /** A store for the active flight plan. */
  flightPlanStore: FlightPlanStore;

  /** A manager for GDU user settings. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;

  /** A configuration object defining options for flight planning. */
  flightPlanningConfig: FmsFlightPlanningConfig;

  /** A configuration object defining options for the map. */
  mapConfig: MapConfig;

  /** A configuration object defining options for measurement units. */
  unitsConfig: UnitsConfig;
}

/**
 * List dialog options for pressing a flight plan leg button on the MFD FPL page.
 */
enum MfdFplPageLegDialogOption {
  WaypointInfo = 'WaypointInfo',
  InsertBefore = 'InsertBefore',
  InsertAfter = 'InsertAfter',
  Remove = 'Remove',
  ActivateLeg = 'ActivateLeg'
}

/**
 * List dialog options for pressing an approach leg button on the MFD FPL page.
 */
enum MfdFplPageApproachLegDialogOption {
  InsertBefore = 'InsertBefore',
  SelectApproach = 'SelectApproach',
  RemoveApproach = 'RemoveApproach'
}

/**
 * UI view keys for popups owned by the MFD FPL page.
 */
enum MfdFplPagePopupKeys {
  FplOptions = 'MfdFplPageOptions',
  FplDataFieldSelectDialog = 'FplDataFieldSelectDialog'
}

/**
 * An MFD active flight plan page.
 */
export class MfdFplPage extends AbstractMfdPage<MfdFplPageProps> {
  private static readonly DATA_FIELD_UPDATE_INTERVAL = 1000; // milliseconds
  private static readonly MAP_RESIZE_HIDE_DURATION = 250; // milliseconds
  private static readonly MAP_DEFAULT_RANGE_INDEX = 7; // 0.8 nautical miles

  private static readonly DATA_FIELD_LABELS: Partial<Record<FlightPlanDataFieldType, string>> = {
    [FlightPlanDataFieldType.CumulativeDistance]: 'CUM\nDist',
    [FlightPlanDataFieldType.CumulativeEte]: 'CUM\nETE',
    [FlightPlanDataFieldType.CumulativeFuel]: 'CUM\nFuel',
    [FlightPlanDataFieldType.Dtk]: 'Leg\nDTK',
    [FlightPlanDataFieldType.Eta]: 'ETA',
    [FlightPlanDataFieldType.FuelRemaining]: 'Fuel\nREM',
    [FlightPlanDataFieldType.LegDistance]: 'Leg\nDist',
    [FlightPlanDataFieldType.LegEte]: 'Leg\nETE',
    [FlightPlanDataFieldType.LegFuel]: 'Leg\nFuel',
    [FlightPlanDataFieldType.Sunrise]: 'Sunrise',
    [FlightPlanDataFieldType.Sunset]: 'Sunset'
  };

  private thisNode?: VNode;

  private readonly listRef = FSComponent.createRef<UiFlightPlanList>();

  private sizeMode = MfdPageSizeMode.Full;
  private readonly dimensions = Vec2Math.create();

  private readonly facWaypointCache = GarminFacilityWaypointCache.getCache(this.props.uiService.bus);

  private readonly fplCalculationSettingManager = FplCalculationUserSettings.getManager(this.props.uiService.bus);
  private readonly unitsSettingManager = G3XUnitsUserSettings.getManager(this.props.uiService.bus);

  private readonly fplDataFieldCalculatorRepo = new DefaultFlightPlanDataFieldCalculatorRepo(
    this.props.uiService.bus,
    this.props.uiService.gduIndex,
    this.fplCalculationSettingManager.getSetting('fplSpeed'),
    this.fplCalculationSettingManager.getSetting('fplFuelFlow'),
    {
      supportSensedFuelFlow: this.props.flightPlanningConfig.supportSensedFuelFlow,
      fuelOnBoardType: this.props.flightPlanningConfig.fuelOnBoardType
    }
  );

  private readonly fplDataFieldRenderer = new MfdFplPageDataFieldRenderer(
    false,
    this.unitsSettingManager,
    G3XDateTimeUserSettings.getManager(this.props.uiService.bus)
  );
  private readonly cumulativeFplDataFieldRenderer = new MfdFplPageDataFieldRenderer(
    true,
    this.unitsSettingManager,
    G3XDateTimeUserSettings.getManager(this.props.uiService.bus)
  );

  private readonly fplDataArray = new ActiveFlightPlanDataArray(
    new DefaultFlightPlanDataFieldFactory(),
    this.fplDataFieldCalculatorRepo,
    {
      dataFieldCount: 3
    }
  );

  private activeFlightPlanner: FlightPlanner | null = null;

  private readonly fplDisplaySettingManager = FplDisplayUserSettings.getManager(this.props.uiService.bus);
  private readonly fplDataFieldSettings = ([1, 2, 3] as const).map(index => this.fplDisplaySettingManager.getSetting(`fplDataField${index}`));

  private readonly listItemLengthPx = Subject.create(80);
  private readonly listItemSpacingPx = Subject.create(8);
  private readonly listItemsPerPage = Subject.create(6);

  private mostRecentFocusedItem?: FlightPlanDataItem;
  private mostRecentFocusedLegItemIndex = -1;
  private readonly reconcileListFocusDebounce = new DebounceTimer();
  private readonly reconcileListFocusFunc = this.reconcileListFocus.bind(this);

  private readonly showFplDataField3 = Subject.create(false);

  private readonly headerLeftHidden = MappedSubject.create(
    SubscribableMapFunctions.nor(),
    this.fplDataFieldCalculatorRepo.isUsingPlanSpeed,
    this.fplDataFieldCalculatorRepo.isUsingPlanFuelFlow
  );

  private readonly planSpeedValue = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));
  private readonly planFuelFlowValue = NumberUnitSubject.create(UnitType.GPH_FUEL.createNumber(0));

  private readonly touchPadRef = FSComponent.createRef<TouchPad>();

  private readonly mapSize = Vec2Subject.create(Vec2Math.create(100, 100));

  private readonly mapTrackUpTargetOffset = Vec2Subject.create(Vec2Math.create());

  private readonly mapCompassArcAngularWidth = Subject.create(70);
  private readonly mapCompassArcTopMargin = Subject.create(40);

  // TODO: Support GDU470 (portrait)
  private readonly compiledMap = MapSystemBuilder.create(this.props.uiService.bus)
    .with(G3XNavMapBuilder.build, {
      gduFormat: this.props.uiService.gduFormat,

      facilityLoader: this.props.fms.facLoader,

      bingId: `g3x-${this.props.uiService.instrumentIndex}-map-1`,

      dataUpdateFreq: 30,

      gduIndex: this.props.uiService.instrumentIndex,
      gduSettingManager: this.props.gduSettingManager,

      projectedRange: this.props.uiService.gduFormat === '460' ? 60 : 30,
      targetOffsets: {
        [MapOrientation.TrackUp]: this.mapTrackUpTargetOffset,
        [MapOrientation.DtkUp]: this.mapTrackUpTargetOffset
      },

      airplaneIconSrc: this.props.mapConfig.ownAirplaneIconSrc,

      compassArcOptions: {
        arcAngularWidth: this.mapCompassArcAngularWidth,
        arcTopMargin: this.mapCompassArcTopMargin,
        bearingTickMajorLength: 15,
        bearingTickMinorLength: 10,
        bearingLabelFont: 'DejaVuSans-SemiBold',
        bearingLabelMajorFontSize: 24,
        bearingLabelMinorFontSize: 22,
        bearingLabelRadialOffset: 14,
        readoutBorderSize: Vec2Math.create(72, 40)
      },

      flightPlanner: this.props.fplSourceDataProvider.flightPlanner,
      lnavIndex: this.props.fplSourceDataProvider.lnavIndex,
      vnavIndex: this.props.fplSourceDataProvider.vnavIndex,

      drawEntirePlan: true,
      supportFlightPlanFocus: true,
      nominalFocusMargins: VecNMath.create(4, 20, 20, 20, 20),

      trafficSystem: this.props.trafficSystem ?? undefined,
      trafficIconOptions: {
        iconSize: 30,
        fontSize: 14
      },

      settingManager: MapUserSettings.getStandardManager(this.props.uiService.bus),
      trafficSettingManager: G3XTrafficUserSettings.getManager(this.props.uiService.bus),
      unitsSettingManager: this.unitsSettingManager,

      includeMiniCompass: false,
      useRangeUserSettingByDefault: false,
      useOrientationUserSettings: false
    })
    .withProjectedSize(this.mapSize)
    .withController<
      MapSystemGenericController,
      {
        /** The orientation module. */
        [GarminMapKeys.Orientation]: MapOrientationModule
      },
      any, any,
      {
        /** Resource moderator for control of the map's desired orientation mode. */
        [GarminMapKeys.DesiredOrientationControl]: ResourceModerator
      }
    >('fplMapDesiredOrientation', context => {
      // Force the map to North Up.

      const orientationModule = context.model.getModule(GarminMapKeys.Orientation);
      const orientationControlConsumer: ResourceConsumer = {
        priority: 1,

        onAcquired: () => {
          orientationModule.desiredOrientation.set(MapOrientation.NorthUp);
        },

        onCeded: () => { }
      };

      let controller: MapSystemGenericController;

      return controller = new MapSystemGenericController(context, {
        onAfterMapRender: (contextArg): void => {
          contextArg[GarminMapKeys.DesiredOrientationControl].claim(orientationControlConsumer);
        },

        onMapDestroyed: (): void => {
          controller.destroy();
        },

        onDestroyed: (contextArg): void => {
          contextArg[GarminMapKeys.DesiredOrientationControl].forfeit(orientationControlConsumer);
        }
      });
    })
    .build('mfd-fpl-map common-map') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;

        /** The compass arc module. */
        [G3XMapKeys.CompassArc]: G3XMapCompassArcModule;

        /** The flight plan focus module. */
        [GarminMapKeys.FlightPlanFocus]: MapFlightPlanFocusModule;

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

  private readonly mapCompassArcModule = this.compiledMap.context.model.getModule(G3XMapKeys.CompassArc);
  private readonly mapFlightPlanFocusModule = this.compiledMap.context.model.getModule(GarminMapKeys.FlightPlanFocus);
  private readonly mapDragPanModule = this.compiledMap.context.model.getModule(G3XMapKeys.DragPan);

  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);
  private readonly mapDragPanController = this.compiledMap.context.getController(G3XMapKeys.DragPan);

  private dragPanPrimed = false;
  private readonly dragPanThreshold = this.props.uiService.gduFormat === '460' ? 20 : 10;
  private readonly dragStartPos = Vec2Math.create();
  private readonly dragDelta = Vec2Math.create();

  private readonly showMap = Subject.create(false);

  private readonly mapHiddenDebounce = new DebounceTimer();
  private readonly mapHidden = Subject.create(false);
  private readonly showMapFunc = this.mapHidden.set.bind(this.mapHidden, false);

  private focusedLegItem?: FlightPlanLegDataItem;
  private needUpdateMapFlightPlanFocus = false;
  private readonly mapFlightPlanFocusDebounce = new DebounceTimer();
  private readonly updateMapFlightPlanFocusFunc = this.updateMapFlightPlanFocus.bind(this);

  private lastDataFieldUpdateTime: number | undefined = undefined;

  private isOpen = false;
  private isResumed = false;

  private readonly subscriptions: Subscription[] = [];

  private showMapResizeSub?: Subscription;
  private fplSourceSub?: Subscription;
  private fplDataField1Sub?: Subscription;
  private fplDataField2Sub?: Subscription;
  private fplDataField3Sub?: Subscription;
  private eisLayoutSub?: Subscription;
  private fplDataArraySub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Active FPL');
    this._iconSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_fpl.png`);

    this.props.uiService.registerMfdView(
      UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, MfdFplPagePopupKeys.FplOptions,
      (uiService, containerRef) => {
        return (
          <MfdFplOptionsPopup
            uiService={uiService}
            containerRef={containerRef}
            fms={this.props.fms}
            fplSourceDataProvider={this.props.fplSourceDataProvider}
            flightPlanStore={this.props.flightPlanStore}
            fplDisplaySettingManager={this.fplDisplaySettingManager}
          />
        );
      }
    );

    this.props.uiService.registerMfdView(
      UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Persistent, MfdFplPagePopupKeys.FplDataFieldSelectDialog,
      (uiService, containerRef) => {
        return (
          <MfdFplPageDataFieldSelectDialog
            uiService={uiService}
            containerRef={containerRef}
            fms={this.props.fms}
            fplSourceDataProvider={this.props.fplSourceDataProvider}
            flightPlanningConfig={this.props.flightPlanningConfig}
          />
        );
      }
    );

    this.fplDataArray.setAddWaypointItemVisible(true);

    this.listRef.instance.knobLabelState.pipe(this._knobLabelState);

    this.compiledMap.ref.instance.sleep();
    this.mapRangeController.setRangeIndex(MfdFplPage.MAP_DEFAULT_RANGE_INDEX);
    this.mapFlightPlanFocusModule.planHasFocus.set(true);

    this.subscriptions.push(
      this.showMapResizeSub = this.fplDisplaySettingManager.getSetting('fplShowMap').sub(this.updateLayout.bind(this), false, true),

      this.fplSourceSub = this.props.fplSourceDataProvider.source.sub(this.onFplSourceChanged.bind(this), false, true),

      this.fplDataField1Sub = this.fplDataFieldSettings[0].sub(this.onFplDataFieldTypeChanged.bind(this, 0), false, true),

      this.fplDataField2Sub = this.fplDataFieldSettings[1].sub(this.onFplDataFieldTypeChanged.bind(this, 1), false, true),

      this.fplCalculationSettingManager.getSetting('fplSpeed').pipe(this.planSpeedValue),
      this.fplCalculationSettingManager.getSetting('fplFuelFlow').pipe(this.planFuelFlowValue)
    );

    this.fplDataArraySub = this.fplDataArray.sub(this.onFplDataArrayChanged.bind(this), false, true);

    if (this.props.uiService.gduFormat === '460') {
      this.subscriptions.push(
        this.fplDataField3Sub = this.fplDataFieldSettings[2].sub(this.onFplDataFieldTypeChanged.bind(this, 2), false, true),

        this.eisLayoutSub = this.props.uiService.gdu460EisLayout.sub(this.updateDataField3Visibility.bind(this), false, true)
      );
    }
  }

  /**
   * Responds to when the flight plan source changes.
   * @param source The new flight plan source.
   */
  private onFplSourceChanged(source: G3XFplSource): void {
    this.updateFplArrayFromSource(source);

    if (this.isResumed) {
      this.tryFocusActiveLeg();
    }

    if (this.showMap.get()) {
      this.scheduleUpdateMapFlightPlanFocus();
    }
  }

  /**
   * Updates this page's flight plan data array from a flight plan source.
   * @param source The flight plan source from which to update the array.
   */
  private updateFplArrayFromSource(source: G3XFplSource): void {
    if (source === G3XFplSource.Internal || source === G3XFplSource.InternalRev) {
      this.activeFlightPlanner = this.props.fms.internalFms.flightPlanner;
      this.fplDataFieldCalculatorRepo.setLNavIndex(this.props.fplSourceDataProvider.internalSourceDef.lnavIndex);
      this.fplDataArray.setFlightPlanner(false, this.activeFlightPlanner);
    } else {
      this.updateFplArrayFromExternalSource(source === G3XFplSource.External1 ? 1 : 2);
    }
  }

  /**
   * Updates this page's flight plan data array from an external flight plan source.
   * @param index The index of the external flight plan source from which to update the array.
   */
  private updateFplArrayFromExternalSource(index: G3XExternalFplSourceIndex): void {
    const def = this.props.fplSourceDataProvider.externalSourceDefs[index];

    this.activeFlightPlanner = def?.fms.flightPlanner ?? null;
    this.fplDataFieldCalculatorRepo.setLNavIndex(def?.lnavIndex ?? -1);
    this.fplDataArray.setFlightPlanner(true, this.activeFlightPlanner);
  }

  /**
   * Responds to when a flight plan data field type is changed.
   * @param index The index of the changed data field.
   * @param type The new data field type.
   */
  private onFplDataFieldTypeChanged(index: number, type: FlightPlanDataFieldType): void {
    this.fplDataArray.setDataFieldType(index, type);
  }

  /**
   * Updates the visibility of the third flight plan data field.
   */
  private updateDataField3Visibility(): void {
    const showDataField3 = this.props.uiService.gduFormat === '460' && (
      this.props.uiService.gdu460EisLayout.get() === EisLayouts.None
      || this.sizeMode === MfdPageSizeMode.Full
    );

    this.showFplDataField3.set(showDataField3);

    if (showDataField3) {
      this.fplDataField3Sub!.resume(true);
    } else {
      this.fplDataField3Sub!.pause();
      this.fplDataArray.setDataFieldType(2, null);
    }
  }

  /**
   * Responds to when this page's flight plan data array changes.
   */
  private onFplDataArrayChanged(): void {
    if (this.showMap.get()) {
      this.scheduleUpdateMapFlightPlanFocus();
    }

    this.reconcileListFocusDebounce.schedule(this.reconcileListFocusFunc, 0);
  }

  /** @inheritDoc */
  public onOpen(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.isOpen = true;

    this.fplDataArray.resume();

    this.sizeMode = sizeMode;
    Vec2Math.copy(dimensions, this.dimensions);
    this.updateLayout();

    this.updateFplArrayFromSource(this.props.fplSourceDataProvider.source.get());

    this.fplSourceSub!.resume();
    this.fplDataField1Sub!.resume(true);
    this.fplDataField2Sub!.resume(true);

    if (this.props.uiService.gduFormat === '460') {
      this.updateDataField3Visibility();
      this.eisLayoutSub!.resume();
    }

    // Attempt to reset the most recently focused item to be the active flight plan leg. We remove the focus
    // immediately in order to ensure no item is focused while the page is paused. The focus will be restored in
    // onResume().
    this.tryFocusActiveLeg();
    this.listRef.instance.removeFocus();

    // if (this.showMap.get()) {
    //   this.scheduleUpdateMapFlightPlanFocus();
    // }

    this.fplDataArraySub!.resume();
  }

  /** @inheritDoc */
  public onClose(): void {
    this.isOpen = false;

    this.fplDataArray.pause();

    this.mapDragPanController.setDragPanActive(false);
    this.compiledMap.ref.instance.sleep();

    this.showMapResizeSub!.pause();
    this.fplSourceSub!.pause();
    this.eisLayoutSub?.pause();
    this.fplDataField1Sub!.pause();
    this.fplDataField2Sub!.pause();
    this.fplDataField3Sub?.pause();
    this.fplDataArraySub!.pause();

    this.mapHiddenDebounce.clear();
    this.mapHidden.set(true);

    this.reconcileListFocusDebounce.clear();
    this.mapFlightPlanFocusDebounce.clear();

    this.mostRecentFocusedItem = undefined;
    this.mostRecentFocusedLegItemIndex = -1;
  }

  /** @inheritDoc */
  public onResume(): void {
    this.isResumed = true;

    this.listRef.instance.focusRecent();

    if (this.listRef.instance.getFocusedIndex() < 0) {
      this.tryFocusActiveLeg(true);
    }

    if (this.needUpdateMapFlightPlanFocus && this.showMap.get()) {
      this.scheduleUpdateMapFlightPlanFocus();
    }
  }

  /** @inheritDoc */
  public onPause(): void {
    this.isResumed = false;

    this.listRef.instance.removeFocus();
  }

  /** @inheritDoc */
  public onResize(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.sizeMode = sizeMode;
    Vec2Math.copy(dimensions, this.dimensions);
    this.updateLayout();
    this.updateDataField3Visibility();
  }

  /**
   * Updates this page's layout.
   */
  private updateLayout(): void {
    const alwaysShowMap = this.props.uiService.gduFormat === '460' && this.sizeMode === MfdPageSizeMode.Full;

    const showMap = alwaysShowMap || this.fplDisplaySettingManager.getSetting('fplShowMap').value;

    // TODO: support GDU470 (portrait)
    if (this.sizeMode === MfdPageSizeMode.Full || !showMap) {
      this.listItemLengthPx.set(80);
      this.listItemSpacingPx.set(8);
      this.listItemsPerPage.set(6);
    } else {
      this.listItemLengthPx.set(92);
      this.listItemSpacingPx.set(8);
      this.listItemsPerPage.set(3);
    }

    if (showMap) {
      this.showMap.set(true);

      if (this.sizeMode === MfdPageSizeMode.Full) {
        // Map is rendered to the left of the tabs, at full height (minus margin and borders). The width of the map
        // is the width of the pane minus the width of the list and margin and borders.
        this.mapSize.set(this.dimensions[0] - 662 - 20, this.dimensions[1] - 20);

        this.mapTrackUpTargetOffset.set(0, 0.25);

        this.mapCompassArcAngularWidth.set(70);
        this.mapCompassArcTopMargin.set(40);
        this.mapCompassArcModule.showMinorBearingLabels.set(true);
        this.mapCompassArcModule.showReadout.set(true);
      } else {
        // Map is rendered above the list, at full width (minus margin and borders) and a fixed height.
        this.mapSize.set(this.dimensions[0] - 13, 213);

        this.mapTrackUpTargetOffset.set(0, 0.375);

        this.mapCompassArcAngularWidth.set(90);
        this.mapCompassArcTopMargin.set(15);
        this.mapCompassArcModule.showMinorBearingLabels.set(false);
        this.mapCompassArcModule.showReadout.set(false);
      }

      // Hide the map for a short period after resizing so that users don't see any artifacts from the Bing map texture.
      this.mapHidden.set(true);
      this.mapHiddenDebounce.schedule(this.showMapFunc, MfdFplPage.MAP_RESIZE_HIDE_DURATION);

      this.compiledMap.ref.instance.wake();

      this.scheduleUpdateMapFlightPlanFocus();
    } else {
      this.showMap.set(false);

      this.compiledMap.ref.instance.sleep();
    }

    if (alwaysShowMap) {
      this.showMapResizeSub!.pause();
    } else {
      this.showMapResizeSub!.resume();
    }
  }

  /** @inheritDoc */
  public onOcclusionChange(occlusionType: UiViewOcclusionType): void {
    if (occlusionType === 'hide') {
      this.compiledMap.ref.instance.sleep();
    } else {
      if (this.showMap.get()) {
        this.compiledMap.ref.instance.wake();
        this.updateMapFlightPlanFocus();
      }
    }
  }

  /** @inheritDoc */
  public onUpdate(time: number): void {
    if (this.lastDataFieldUpdateTime !== undefined && time < this.lastDataFieldUpdateTime) {
      this.lastDataFieldUpdateTime = time;
    }

    if (this.lastDataFieldUpdateTime === undefined || time - this.lastDataFieldUpdateTime >= MfdFplPage.DATA_FIELD_UPDATE_INTERVAL) {
      this.fplDataArray.calculateDataFields();
      this.lastDataFieldUpdateTime = time;
    }

    if (this.mapDragPanModule.isActive.get()) {
      if (this.dragDelta[0] !== 0 || this.dragDelta[1] !== 0) {
        this.mapDragPanController.drag(this.dragDelta[0], this.dragDelta[1]);
        Vec2Math.set(0, 0, this.dragDelta);
      }
    }

    this.compiledMap.ref.instance.update(time);
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    switch (event) {
      case UiInteractionEvent.MenuPress:
        this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, MfdFplPagePopupKeys.FplOptions, false, { popupType: 'slideout-bottom-full' });
        return true;
      case UiInteractionEvent.DirectToPress: {
        this.openDirectToView();
        return true;
      }
    }

    return this.listRef.instance.onUiInteractionEvent(event);
  }

  /**
   * Opens the Direct-To menu view.
   */
  private async openDirectToView(): Promise<void> {
    let initialWaypoint: FacilityWaypoint | undefined = undefined;

    // Attempt to the set the initial selected waypoint of the Direct-To menu to the waypoint fix of the currently
    // focused flight plan leg.
    if (this.focusedLegItem && ICAO.isFacility(this.focusedLegItem.fixIcao)) {
      try {
        initialWaypoint = this.facWaypointCache.get(
          await this.props.fms.facLoader.getFacility(ICAO.getFacilityType(this.focusedLegItem.fixIcao), this.focusedLegItem.fixIcao)
        );
      } catch {
        // noop
      }
    }

    const dtoViewEntry = this.props.uiService.openMfdPopup<DirectToView>(UiViewStackLayer.Overlay, UiViewKeys.DirectTo, true);
    if (initialWaypoint) {
      dtoViewEntry.ref.setSelectedTargetParams({ waypoint: initialWaypoint, course: undefined });
    }
  }

  /**
   * Attempts to focus the list item associated with the active flight plan leg and scroll the list such that the
   * focused item is positioned in the middle of the list. If there is no active flight plan leg, then the last item in
   * the list will be focused instead.
   * @param skipScrollIfItemInView Whether to skip the scroll operation if the focused item is already in view.
   * Defaults to `false`.
   */
  private tryFocusActiveLeg(skipScrollIfItemInView = false): void {
    if (this.fplDataArray.length === 1) {
      this.listRef.instance.focusFirst();
      return;
    }

    const toLegIndex = this.fplDataArray.toLegIndex.get();
    if (toLegIndex >= 0) {
      this.listRef.instance.scrollToItem(this.fplDataArray.get(toLegIndex), Math.ceil(this.listItemsPerPage.get() / 2) - 1, true, false, skipScrollIfItemInView);
    } else {
      this.listRef.instance.focusLast();
    }
  }

  /**
   * Attempts to assign UI focus to an appropriate item in this page's flight plan list if no list item is currently
   * focused.
   */
  private reconcileListFocus(): void {
    if (this.listRef.instance.getFocusedIndex() >= 0 || this.listRef.instance.visibleItemCount.get() === 0) {
      return;
    }

    const array = this.fplDataArray.getArray();

    let dataItemToFocus: FlightPlanDataItem | null = null;

    if (this.mostRecentFocusedItem && this.mostRecentFocusedItem.isVisible.get() && array.includes(this.mostRecentFocusedItem)) {
      // If the most recently focused item is still in the array and visible, then re-focus it.
      dataItemToFocus = this.mostRecentFocusedItem;
    } else if (this.mostRecentFocusedLegItemIndex >= 0) {
      // If the most recently focused item was a leg data item, then attempt to focus the data item associated with the
      // leg at the same index. If such an item does not exist or is not visible, then scan backwards through the array
      // until a visible leg data item is found and focus that item.
      const start = Math.min(this.mostRecentFocusedLegItemIndex, array.length - 1);
      for (let i = start; i >= 0; i--) {
        const item = array[i];
        if (item.type === FlightPlanDataItemType.Leg && item.isVisible.get()) {
          dataItemToFocus = item;
          break;
        }
      }
    }

    if (dataItemToFocus) {
      this.listRef.instance.focusItem(dataItemToFocus);
    } else {
      this.tryFocusActiveLeg(true);
    }

    // If the page is not resumed, immediately remove the focus from the list item to ensure nothing is focused while
    // the page is paused. The next time the page is resumed, it will restore focus to the appropriate item.
    if (!this.isResumed) {
      this.listRef.instance.removeFocus();
    }
  }

  /**
   * Schedules an update of the flight plan focus of this page's map at the end of the current frame.
   */
  private scheduleUpdateMapFlightPlanFocus(): void {
    this.needUpdateMapFlightPlanFocus = false;
    this.mapFlightPlanFocusDebounce.schedule(this.updateMapFlightPlanFocusFunc, 0);
  }

  /**
   * Updates the flight plan focus of this page's map.
   */
  private updateMapFlightPlanFocus(): void {
    if (!this.isResumed || !this.showMap.get()) {
      return;
    }

    if (this.focusedLegItem) {
      const plan = this.focusedLegItem.flightPlan;

      let legToFocus = this.focusedLegItem.leg;

      // Check if the focused leg is the target leg of a DTO. If so, then we need to set the focus to the corresponding
      // DTO leg.
      if (plan.planIndex === FmsUtils.PRIMARY_PLAN_INDEX && plan.directToData.segmentIndex >= 0 && plan.directToData.segmentLegIndex >= 0) {
        const dtoSegment = plan.tryGetSegment(plan.directToData.segmentIndex);
        if (dtoSegment && dtoSegment.legs[plan.directToData.segmentLegIndex] === this.focusedLegItem.leg) {
          legToFocus = dtoSegment.legs[plan.directToData.segmentLegIndex + FmsUtils.DTO_LEG_OFFSET];
        }
      }

      this.mapFlightPlanFocusModule.focus.set([legToFocus]);
    } else {
      // If no leg item has UI focus, then we will set the map focus to the entire active flight plan, if one exists.

      const flightPlan = this.activeFlightPlanner?.hasActiveFlightPlan()
        ? this.activeFlightPlanner.getActiveFlightPlan()
        : undefined;

      const focus = flightPlan && flightPlan.length > 0 ? Array.from(flightPlan.legs()) : null;

      this.mapFlightPlanFocusModule.focus.set(focus);
    }
  }

  /**
   * Responds to when the Add Waypoint button is pressed.
   */
  private async onAddWaypointButtonPressed(): Promise<void> {
    if (!this.props.fms.canEdit() || !this.props.fms.hasInternalPrimaryFlightPlan()) {
      return;
    }

    const waypoint = await this.requestWaypoint();

    if (!waypoint || !this.props.fms.canEdit()) {
      return;
    }

    await this.props.fms.insertWaypointAtEnd(waypoint.facility.get());
  }

  /**
   * Responds to when a flight plan leg button is pressed.
   * @param button The button that was pressed.
   * @param data The flight plan data item associated with the button that was pressed.
   * @returns A Promise which will be fulfilled when the operation is complete.
   */
  private async onLegButtonPressed(button: UiTouchButton, data: FlightPlanLegDataItem): Promise<void> {
    if (data.approachData) {
      return this.onApproachLegButtonPressed(button, data);
    }

    const plan = !this.props.fms.canEdit() || !this.props.fms.hasInternalPrimaryFlightPlan()
      ? undefined
      : this.props.fms.getInternalPrimaryFlightPlan();

    const indexes = plan ? FmsUtils.getLegIndexes(plan, data.leg) : undefined;

    const allowEditing = indexes !== undefined && this.props.fms.canEdit();
    const canActivateLeg = allowEditing && this.props.fms.canActivateLeg(indexes.segmentIndex, indexes.segmentLegIndex);

    const inputData = [
      { value: MfdFplPageLegDialogOption.WaypointInfo, labelRenderer: () => 'Waypoint Info', isEnabled: ICAO.isFacility(data.fixIcao) },
      { value: MfdFplPageLegDialogOption.InsertBefore, labelRenderer: () => 'Insert Before', isEnabled: allowEditing },
      { value: MfdFplPageLegDialogOption.InsertAfter, labelRenderer: () => 'Insert After', isEnabled: allowEditing },
      { value: MfdFplPageLegDialogOption.Remove, labelRenderer: () => 'Remove', isEnabled: allowEditing }
    ];

    if (canActivateLeg) {
      inputData.push(
        { value: MfdFplPageLegDialogOption.ActivateLeg, labelRenderer: () => 'Activate Leg', isEnabled: canActivateLeg }
      );
    }

    // Align popup to the side (top/bottom) of the button that has more room.
    let popupReference: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    let alignTo: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    const containerRect = this.props.containerRef.instance.getBoundingClientRect();
    const targetRect = button.getRootElement().getBoundingClientRect();
    if ((targetRect.top + targetRect.bottom) / 2 > (containerRect.top + containerRect.bottom) / 2) {
      popupReference = 'bottom-left';
      alignTo = 'top-left';
    } else {
      popupReference = 'top-left';
      alignTo = 'bottom-left';
    }

    const result = await this.props.uiService.openMfdPopup<UiListDialog>(UiViewStackLayer.Overlay, UiViewKeys.ListDialog1, false,
      UiViewUtils.alignPositionedPopupToElement(
        { popupType: 'positioned' },
        this.props.containerRef.instance,
        button.getRootElement(),
        popupReference,
        alignTo
      ))
      .ref.request({
        class: 'mfd-fpl-page-leg-dialog',
        itemsPerPage: inputData.length,
        listItemHeightPx: 60,
        autoDisableOverscroll: true,
        inputData
      });

    if (result.wasCancelled) {
      return;
    }

    if (result.payload === MfdFplPageLegDialogOption.WaypointInfo) {
      this.openWaypointInfoPopup(data.fixIcao);
      return;
    }

    if (
      !this.props.fms.canEdit()
      || this.props.fms.getInternalPrimaryFlightPlan() !== plan
    ) {
      return;
    }

    switch (result.payload) {
      case MfdFplPageLegDialogOption.InsertBefore:
        if (plan && indexes) {
          const waypoint = await this.requestWaypoint();
          if (
            waypoint
            && this.props.fms.canEdit()
            && this.props.fms.getInternalPrimaryFlightPlan() === plan
            && plan.getLeg(indexes.segmentIndex, indexes.segmentLegIndex) === data.leg
          ) {
            await this.props.fms.insertWaypoint(indexes.segmentIndex, waypoint.facility.get(), indexes.segmentLegIndex);
          }
        }
        break;
      case MfdFplPageLegDialogOption.InsertAfter:
        if (plan && indexes) {
          const waypoint = await this.requestWaypoint();
          if (
            waypoint
            && this.props.fms.canEdit()
            && this.props.fms.getInternalPrimaryFlightPlan() === plan
            && plan.getLeg(indexes.segmentIndex, indexes.segmentLegIndex) === data.leg
          ) {
            await this.props.fms.insertWaypoint(indexes.segmentIndex, waypoint.facility.get(), indexes.segmentLegIndex + 1);
          }
        }
        break;
      case MfdFplPageLegDialogOption.Remove:
        if (plan && indexes) {
          await this.removeLeg(plan, data.leg, indexes);
        }
        break;
      case MfdFplPageLegDialogOption.ActivateLeg:
        if (plan && indexes) {
          await this.activateLeg(plan, data.leg, indexes);
        }
        break;
    }
  }

  /**
   * Removes a leg from the internal primary flight plan.
   * @param plan The internal primary flight plan.
   * @param leg The leg to remove.
   * @param indexes The indexes of the leg to remove.
   */
  private async removeLeg(plan: FlightPlan, leg: LegDefinition, indexes: LegIndexes): Promise<void> {
    const result = await this.props.uiService
      .openMfdPopup<UiMessageDialog>(UiViewStackLayer.Overlay, UiViewKeys.MessageDialog1)
      .ref.request({
        message: `Remove ${ICAO.getIdent(leg.leg.fixIcao)} from\nflight plan?`,
        showRejectButton: true,
        acceptButtonLabel: 'Yes',
        rejectButtonLabel: 'No',
        class: 'mfd-fpl-page-remove-leg-confirm-dialog'
      });

    if (
      !result.wasCancelled
      && result.payload
      && this.props.fms.canEdit()
      && this.props.fms.getInternalPrimaryFlightPlan() === plan
      && plan.tryGetLeg(indexes.segmentIndex, indexes.segmentLegIndex) === leg
    ) {
      await this.props.fms.removeWaypoint(indexes.segmentIndex, indexes.segmentLegIndex);
    }
  }

  /**
   * Activates a leg in the internal primary flight plan.
   * @param plan The internal primary flight plan.
   * @param leg The leg to activate.
   * @param indexes The indexes of the leg to activate.
   */
  private async activateLeg(plan: FlightPlan, leg: LegDefinition, indexes: LegIndexes): Promise<void> {
    const toLeg = plan.tryGetLeg(indexes.segmentIndex, indexes.segmentLegIndex);

    if (toLeg !== leg) {
      return;
    }

    const fromLeg = FmsUtils.getFromLegForArrowDisplay(plan, indexes.segmentIndex, indexes.segmentLegIndex);

    const result = await this.props.uiService
      .openMfdPopup<UiMessageDialog>(UiViewStackLayer.Overlay, UiViewKeys.MessageDialog1)
      .ref.request({
        message: `Activate leg\n${fromLeg ? `${ICAO.getIdent(fromLeg.leg.fixIcao)} - ` : ''}${ICAO.getIdent(toLeg.leg.fixIcao)}?`,
        showRejectButton: true,
        acceptButtonLabel: 'Yes',
        rejectButtonLabel: 'No',
        class: 'mfd-fpl-page-activate-leg-confirm-dialog'
      });

    if (
      !result.wasCancelled
      && result.payload
      && this.props.fms.canEdit()
      && this.props.fms.getInternalPrimaryFlightPlan() === plan
      && plan.tryGetLeg(indexes.segmentIndex, indexes.segmentLegIndex) === leg
    ) {
      // TODO: Immediate sequence inhibit is disabled because there doesn't seem to be any way to control SUSP in
      // the G3X.
      this.props.fms.activateLeg(indexes.segmentIndex, indexes.segmentLegIndex, FmsUtils.PRIMARY_PLAN_INDEX, false);
    }
  }

  /**
   * Responds to when a flight plan approach leg button is pressed.
   * @param button The button that was pressed.
   * @param data The flight plan data item associated with the button that was pressed.
   */
  private async onApproachLegButtonPressed(button: UiTouchButton, data: FlightPlanLegDataItem): Promise<void> {
    const plan = !this.props.fms.canEdit() || !this.props.fms.hasInternalPrimaryFlightPlan()
      ? undefined
      : this.props.fms.getInternalPrimaryFlightPlan();

    const indexes = plan ? FmsUtils.getLegIndexes(plan, data.leg) : undefined;

    const allowInsertBefore = plan && indexes && indexes.segmentLegIndex === 0;

    const inputData = [
      { value: MfdFplPageApproachLegDialogOption.SelectApproach, labelRenderer: () => 'Select Approach' },
      { value: MfdFplPageApproachLegDialogOption.RemoveApproach, labelRenderer: () => 'Remove Approach' }
    ];

    if (allowInsertBefore) {
      inputData.unshift(
        { value: MfdFplPageApproachLegDialogOption.InsertBefore, labelRenderer: () => 'Insert Before' }
      );
    }

    // Align popup to the side (top/bottom) of the button that has more room.
    let popupReference: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    let alignTo: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    const containerRect = this.props.containerRef.instance.getBoundingClientRect();
    const targetRect = button.getRootElement().getBoundingClientRect();
    if ((targetRect.top + targetRect.bottom) / 2 > (containerRect.top + containerRect.bottom) / 2) {
      popupReference = 'bottom-left';
      alignTo = 'top-left';
    } else {
      popupReference = 'top-left';
      alignTo = 'bottom-left';
    }

    const result = await this.props.uiService.openMfdPopup<UiListDialog>(UiViewStackLayer.Overlay, UiViewKeys.ListDialog1, false,
      UiViewUtils.alignPositionedPopupToElement(
        { popupType: 'positioned' },
        this.props.containerRef.instance,
        button.getRootElement(),
        popupReference,
        alignTo
      ))
      .ref.request({
        class: 'mfd-fpl-page-approach-leg-dialog',
        itemsPerPage: inputData.length,
        listItemHeightPx: 60,
        autoDisableOverscroll: true,
        inputData
      });

    if (result.wasCancelled) {
      return;
    }

    if (
      !this.props.fms.canEdit()
      || this.props.fms.getInternalPrimaryFlightPlan() !== plan
    ) {
      return;
    }

    switch (result.payload) {
      case MfdFplPageApproachLegDialogOption.InsertBefore:
        if (plan && indexes) {
          const waypoint = await this.requestWaypoint();
          if (
            waypoint
            && this.props.fms.canEdit()
            && plan.getLeg(indexes.segmentIndex, indexes.segmentLegIndex) === data.leg
          ) {
            const lastEnrouteSegment = FmsUtils.getLastEnrouteSegment(plan);
            if (lastEnrouteSegment) {
              await this.props.fms.insertWaypoint(lastEnrouteSegment.segmentIndex, waypoint.facility.get());
            }
          }
        }
        break;
      case MfdFplPageApproachLegDialogOption.SelectApproach:
        if (data.approachData) {
          await this.openApproachDialog(data.approachData.airportIcao, data.approachData.approachIndex);
        }
        break;
      case MfdFplPageApproachLegDialogOption.RemoveApproach:
        await this.props.fms.removeApproach();
        break;
    }
  }

  /**
   * Responds to when a flight plan approach leg preview button is pressed.
   * @param button The button that was pressed.
   * @param data The flight plan data item associated with the button that was pressed.
   */
  private async onApproachLegPreviewButtonPressed(button: UiTouchButton, data: FlightPlanApproachLegPreviewDataItem): Promise<void> {
    await this.openApproachDialog(data.approachData.airportIcao, data.approachData.approachIndex);
  }

  private openWaypointInfoPopupOpId = 0;

  /**
   * Opens the Waypoint Info popup to display information on a facility waypoint.
   * @param icao The ICAO of the facility waypoint to display in the popup.
   */
  private async openWaypointInfoPopup(icao: string): Promise<void> {
    const opId = ++this.openWaypointInfoPopupOpId;

    try {
      const facility = await this.props.fms.facLoader.getFacility(ICAO.getFacilityType(icao), icao);

      if (!this.isOpen || opId !== this.openWaypointInfoPopupOpId) {
        return;
      }

      this.props.uiService.openMfdPopup<WaypointInfoPopup>(UiViewStackLayer.Overlay, UiViewKeys.WaypointInfoPopup, true, {
        popupType: 'slideout-right-full',
        backgroundOcclusion: 'hide'
      }).ref.setWaypoint(this.facWaypointCache.get(facility));
    } catch {
      // noop
    }
  }

  /**
   * Opens the waypoint dialog to allow the user to select a waypoint.
   * @returns A Promise which is fulfilled with the waypoint selected by the user, or with `null` if the user did not
   * select a waypoint.
   */
  private async requestWaypoint(): Promise<FacilityWaypoint | null> {
    const result = await this.props.uiService
      .openMfdPopup<WaypointDialog>(UiViewStackLayer.Overlay, UiViewKeys.WaypointDialog, false, { popupType: 'normal' })
      .ref.request({
        searchType: FacilitySearchType.AllExceptVisual
      });

    if (result.wasCancelled) {
      return null;
    } else {
      return result.payload;
    }
  }

  /**
   * Opens the approach dialog to allow a user to select and load/activate an approach.
   * @param initialAirportIcao The ICAO of the airport to which to initialize the approach dialog.
   * @param initialApproachIndex The index of the approach to which to initialize the approach dialog.
   */
  private async openApproachDialog(initialAirportIcao: string | undefined, initialApproachIndex: number | undefined): Promise<void> {
    let initialAirport = initialAirportIcao === undefined
      ? undefined
      : await this.props.fms.facLoader.getFacility(FacilityType.Airport, initialAirportIcao)
        .catch(() => undefined);

    if (!initialAirport) {
      initialApproachIndex = undefined;

      const airportResult = await this.props.uiService
        .openMfdPopup<WaypointDialog>(UiViewStackLayer.Overlay, UiViewKeys.WaypointDialog, true)
        .ref.request({
          searchType: FacilitySearchType.Airport
        });

      if (!airportResult.wasCancelled) {
        initialAirport = airportResult.payload.facility.get();
      }
    }

    const approachResult = await this.props.uiService
      .openMfdPopup<ApproachDialog>(UiViewStackLayer.Overlay, UiViewKeys.ApproachDialog, true, { popupType: 'slideout-right-full' })
      .ref.request({
        initialAirport,
        initialApproachIndex,
        loadedApproachData: this.props.flightPlanStore.loadedVfrApproachData.get() ?? undefined,
        isLoadedApproachActive: this.props.flightPlanStore.vfrApproachActiveStatus.get() !== 'none',
        disableLoad: !this.props.fms.hasInternalPrimaryFlightPlan() || this.props.fms.getInternalPrimaryFlightPlan().length === 0
      });

    if (!this.props.fms.canEdit()) {
      return;
    }

    if (!approachResult.wasCancelled) {
      const { airport, approachIndex, action } = approachResult.payload;
      await this.props.fms.loadApproach(airport, approachIndex, action !== 'load', action === 'vtf');
    }
  }

  /**
   * Responds to when a flight plan leg data item gains UI focus.
   * @param data The data item that gained focus.
   */
  private onLegItemFocusGained(data: FlightPlanLegDataItem): void {
    this.mostRecentFocusedItem = data;
    this.mostRecentFocusedLegItemIndex = this.fplDataArray.getArray().indexOf(data);

    this.focusedLegItem = data;
    this.needUpdateMapFlightPlanFocus = true;

    if (this.isResumed && this.showMap.get()) {
      this.scheduleUpdateMapFlightPlanFocus();
    }
  }

  /**
   * Responds to when a flight plan leg data item loses UI focus.
   * @param data The data item that lost focus.
   */
  private onLegItemFocusLost(data: FlightPlanLegDataItem): void {
    if (this.focusedLegItem === data) {
      this.focusedLegItem = undefined;
      this.needUpdateMapFlightPlanFocus = true;
    }

    if (this.isResumed && this.showMap.get()) {
      this.scheduleUpdateMapFlightPlanFocus();
    }
  }

  /**
   * Responds to when a previewed approach flight plan leg data item gains UI focus.
   * @param data The data item that gained focus.
   */
  private onApproachLegPreviewItemFocusGained(data: FlightPlanApproachLegPreviewDataItem): void {
    this.mostRecentFocusedItem = data;
    this.mostRecentFocusedLegItemIndex = -1;
  }

  /**
   * Responds to when a flight plan leg data item gains UI focus.
   * @param data The data item that gained focus.
   */
  private onAddWaypointFocusGained(data: FlightPlanAddWaypointDataItem): void {
    this.mostRecentFocusedItem = data;
    this.mostRecentFocusedLegItemIndex = -1;
  }

  /**
   * Responds to when a flight plan data field button is pressed.
   * @param setting The flight plan data field user setting associated with the button that was pressed.
   */
  private async onFplDataFieldButtonPressed(setting: UserSetting<FlightPlanDataFieldType>): Promise<void> {
    const focusedItem = this.fplDataArray.tryGet(this.listRef.instance.getFocusedIndex());

    let focusedLeg: LegDefinition | null = null;
    if (focusedItem?.type === FlightPlanDataItemType.Leg) {
      focusedLeg = focusedItem.leg;
    } else {
      // If the focused item is not a leg item, then attempt to set the preview leg to the last leg in the flight plan.
      const array = this.fplDataArray.getArray();
      for (let i = array.length - 1; i >= 0; i--) {
        const item = array[i];
        if (item.type === FlightPlanDataItemType.Leg && item.isVisible.get()) {
          focusedLeg = item.leg;
          break;
        }
      }
    }

    const result = await this.props.uiService
      .openMfdPopup<MfdFplPageDataFieldSelectDialog>(UiViewStackLayer.Overlay, MfdFplPagePopupKeys.FplDataFieldSelectDialog)
      .ref.request({
        initialValue: setting.value,
        previewLeg: focusedLeg
      });

    if (!result.wasCancelled) {
      setting.value = result.payload;
    }
  }

  /**
   * Responds to when a flight plan source is selected.
   * @param source The selected flight plan source.
   * @param setting The user setting that controls the flight plan source.
   */
  private async onFplSourceSelected(source: G3XFplSourceSettingMode, setting: UserSetting<G3XFplSourceSettingMode>): Promise<void> {
    if (source === setting.value) {
      return;
    }

    if (source === G3XFplSourceSettingMode.External) {
      setting.value = source;
      return;
    }

    const result = await this.props.uiService
      .openMfdPopup<UiMessageDialog>(UiViewStackLayer.Overlay, UiViewKeys.MessageDialog1)
      .ref.request({
        message: 'Flight plan may\nbe modified\nduring crossfill.',
        showRejectButton: true,
        class: 'mfd-fpl-page-fpl-source-warning-dialog'
      });

    if (!result.wasCancelled) {
      setting.value = source;
    }
  }

  /**
   * Responds to when the flight plan speed button is pressed.
   * @param button The button that was pressed.
   * @param setting The user setting that controls the flight plan speed.
   */
  private async onPlanSpeedButtonPressed(button: UiValueTouchButton<UserSetting<number>>, setting: UserSetting<number>): Promise<void> {
    const result = await this.props.uiService
      .openMfdPopup<UiGenericNumberUnitDialog>(UiViewStackLayer.Overlay, UiViewKeys.GenericNumberUnitDialog1)
      .ref.request({
        initialValue: setting.value,
        initialUnit: UnitType.KNOT,
        unitType: this.unitsSettingManager.speedUnits.get(),
        digitCount: 3,
        decimalCount: 0,
        minimumValue: 1,
        maximumValue: 999,
        title: 'Select Plan Speed',
        innerKnobLabel: 'Select Plan Speed',
        outerKnobLabel: 'Select Plan Speed'
      });

    if (!result.wasCancelled) {
      setting.value = UnitType.KNOT.convertFrom(result.payload.value, result.payload.unit);
    }
  }

  /**
   * Responds to when the flight plan fuel button is pressed.
   * @param button The button that was pressed.
   * @param setting The user setting that controls the flight plan fuel flow.
   */
  private async onPlanFuelButtonPressed(button: UiValueTouchButton<UserSetting<number>>, setting: UserSetting<number>): Promise<void> {
    let settingUnit: Unit<UnitFamily.WeightFlux>;

    switch (this.props.unitsConfig.fuelType) {
      case G3XUnitsFuelType.JetA:
        settingUnit = UnitType.GPH_JET_A_FUEL;
        break;
      case G3XUnitsFuelType.OneHundredLL:
        settingUnit = UnitType.GPH_100LL_FUEL;
        break;
      case G3XUnitsFuelType.Autogas:
        settingUnit = UnitType.GPH_AUTOGAS_FUEL;
        break;
      case G3XUnitsFuelType.Sim:
      default:
        settingUnit = G3XUnitType.GPH_SIM_FUEL;
    }

    const result = await this.props.uiService
      .openMfdPopup<UiGenericNumberUnitDialog>(UiViewStackLayer.Overlay, UiViewKeys.GenericNumberUnitDialog1)
      .ref.request({
        initialValue: setting.value,
        initialUnit: settingUnit,
        unitType: this.unitsSettingManager.fuelFlowUnits.get(),
        digitCount: 3,
        decimalCount: 1,
        minimumValue: 0.1,
        maximumValue: 999.9,
        title: 'Select Plan Fuel',
        innerKnobLabel: 'Select Plan Fuel',
        outerKnobLabel: 'Select Plan Fuel'
      });

    if (!result.wasCancelled) {
      setting.value = settingUnit.convertFrom(result.payload.value, result.payload.unit);
    }
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
  public render(): VNode | null {
    return (
      <div
        class={{
          'mfd-fpl-page': true,
          'ui-view-generic-bg': true,
          'mfd-fpl-page-show-map': this.showMap,
          'mfd-fpl-page-show-data-field-3': this.showFplDataField3
        }}
      >
        <div class='mfd-fpl-page-map-box'>
          <div class={{ 'mfd-fpl-page-map-container': true, 'visibility-hidden': this.mapHidden }}>
            <TouchPad
              ref={this.touchPadRef}
              bus={this.props.uiService.bus}
              onDragStarted={this.onDragStarted.bind(this)}
              onDragMoved={this.onDragMoved.bind(this)}
              onDragEnded={this.onDragEnded.bind(this)}
              class='mfd-fpl-page-touch-pad'
            >
              {this.compiledMap.map}
            </TouchPad>
            <div class='ui-layered-darken' />
          </div>
        </div>

        <div class='mfd-fpl-page-main ui-darken-filter'>
          <div class='mfd-fpl-page-main-header'>
            <div class={{ 'mfd-fpl-page-main-header-left': true, 'hidden': this.headerLeftHidden }}>
              <UiValueTouchButton
                state={this.fplCalculationSettingManager.getSetting('fplFuelFlow')}
                label='Plan Fuel'
                renderValue={
                  <G3XNumberUnitDisplay
                    value={this.planFuelFlowValue}
                    displayUnit={this.unitsSettingManager.fuelFlowUnits}
                    formatter={NumberFormatter.create({ precision: 0.1, nanString: '__._' })}
                  />
                }
                isVisible={this.fplDataFieldCalculatorRepo.isUsingPlanFuelFlow}
                onPressed={this.onPlanFuelButtonPressed.bind(this)}
                class='mfd-fpl-page-plan-fuel-button'
              />
              <UiValueTouchButton
                state={this.fplCalculationSettingManager.getSetting('fplSpeed')}
                label='Plan Spd'
                renderValue={
                  <G3XNumberUnitDisplay
                    value={this.planSpeedValue}
                    displayUnit={this.unitsSettingManager.speedUnits}
                    formatter={NumberFormatter.create({ precision: 1 })}
                  />
                }
                isVisible={this.fplDataFieldCalculatorRepo.isUsingPlanSpeed}
                onPressed={this.onPlanSpeedButtonPressed.bind(this)}
                class='mfd-fpl-page-plan-spd-button'
              />
            </div>
            {this.props.fplSourceDataProvider.externalSourceCount && (
              <UiListSelectTouchButton
                uiService={this.props.uiService}
                listDialogLayer={UiViewStackLayer.Overlay}
                listDialogKey={UiViewKeys.ListDialog1}
                openDialogAsPositioned
                containerRef={this.props.containerRef}
                state={FplSourceUserSettings.getManager(this.props.uiService.bus).getSetting('fplSource')}
                label='FPL Source'
                listParams={{
                  inputData: [
                    {
                      value: G3XFplSourceSettingMode.Internal,
                      labelRenderer: () => 'Internal',
                    },
                    {
                      value: G3XFplSourceSettingMode.External,
                      labelRenderer: () => 'External GPS'
                    }
                  ],
                  selectedValue: FplSourceUserSettings.getManager(this.props.uiService.bus).getSetting('fplSource'),
                  listItemHeightPx: this.props.uiService.gduFormat === '460' ? 60 : 30,
                  listItemSpacingPx: this.props.uiService.gduFormat === '460' ? 4 : 2,
                  itemsPerPage: 2,
                  class: 'mfd-fpl-page-fpl-source-select-dialog'
                }}
                renderValue={source => source === G3XFplSourceSettingMode.External ? 'External GPS' : 'Internal'}
                onSelected={this.onFplSourceSelected.bind(this)}
                hideDropdownArrow
                class='mfd-fpl-page-fpl-source-button'
              />
            )}
            {this.fplDataFieldSettings.map((setting, index) => {
              if (index >= 3) {
                return null;
              }

              return (
                <UiValueTouchButton
                  state={setting}
                  renderValue={type => MfdFplPage.DATA_FIELD_LABELS[type] ?? ''}
                  onPressed={this.onFplDataFieldButtonPressed.bind(this, setting)}
                  class={`mfd-fpl-page-main-header-data-field-button mfd-fpl-page-main-header-data-field-button-${index + 1}`}
                />
              );
            })}
          </div>
          <div class='mfd-fpl-page-main-divider' />
          <UiFlightPlanList
            ref={this.listRef}
            bus={this.props.uiService.bus}
            validKnobIds={this.props.uiService.validKnobIds.filter(UiKnobUtils.isInnerKnobId)}
            data={this.fplDataArray}
            renderItem={this.renderListItem.bind(this)}
            listItemLengthPx={this.listItemLengthPx}
            listItemSpacingPx={this.listItemSpacingPx}
            maxRenderedItemCount={24}
            itemsPerPage={this.listItemsPerPage}
            gduFormat={this.props.uiService.gduFormat}
            class='mfd-fpl-page-list'
          />
          <div class='mfd-fpl-page-main-divider' />
          <div class='mfd-fpl-page-main-footer'>
            <div class='mfd-fpl-page-main-footer-title'>Total</div>
            {this.fplDataArray.cumulativeDataFields.map((dataField, index) => {
              if (index >= 3) {
                return null;
              }

              return (
                <MfdFplPageDataFieldSlot
                  index={index}
                  dataField={dataField}
                  renderer={this.cumulativeFplDataFieldRenderer}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Renders a list item for a data item in this page's flight plan array.
   * @param data The flight plan data item to render.
   * @returns A list item for the specified data item, as a VNode.
   * @throws Error if the data item has an unrecognized type.
   */
  private renderListItem(data: FlightPlanDataItem): VNode {
    switch (data.type) {
      case FlightPlanDataItemType.AddWaypoint:
        return (
          <UiListButton
            label='Add Waypoint'
            onPressed={this.onAddWaypointButtonPressed.bind(this)}
            onFocusGained={this.onAddWaypointFocusGained.bind(this, data)}
            class='mfd-fpl-page-list-add-waypoint-button'
          />
        );
      case FlightPlanDataItemType.Leg:
        return (
          <MfdFplPageLegListItem
            data={data}
            facLoader={this.props.fms.facLoader}
            facWaypointCache={this.facWaypointCache}
            dataFieldRenderer={this.fplDataFieldRenderer}
            unitsSettingManager={G3XUnitsUserSettings.getManager(this.props.uiService.bus)}
            gduFormat={this.props.uiService.gduFormat}
            onButtonPressed={this.onLegButtonPressed.bind(this)}
            onFocusGained={this.onLegItemFocusGained.bind(this)}
            onFocusLost={this.onLegItemFocusLost.bind(this)}
          />
        );
      case FlightPlanDataItemType.ApproachLegPreview:
        return (
          <MfdFplPageApproachLegPreviewListItem
            data={data}
            facLoader={this.props.fms.facLoader}
            facWaypointCache={this.facWaypointCache}
            gduFormat={this.props.uiService.gduFormat}
            onButtonPressed={this.onApproachLegPreviewButtonPressed.bind(this)}
            onFocusGained={this.onApproachLegPreviewItemFocusGained.bind(this)}
          />
        );
      default:
        throw new Error(`MfdFplPage: unrecognized flight plan data item type: ${(data as FlightPlanDataItem).type}`);
    }
  }

  /** @inheritDoc */
  public destroy(): void {
    this.mapHiddenDebounce.clear();
    this.reconcileListFocusDebounce.clear();
    this.mapFlightPlanFocusDebounce.clear();

    this.compiledMap.ref.getOrDefault()?.destroy();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.fplDataArray.destroy();
    this.fplDataFieldCalculatorRepo.destroy();
    this.fplDataFieldRenderer.destroy();
    this.cumulativeFplDataFieldRenderer.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
