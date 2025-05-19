import {
  BasicNavAngleSubject, BasicNavAngleUnit, CompiledMapSystem, DebounceTimer, FacilitySearchType, FacilityUtils,
  FacilityWaypoint, FSComponent, MagVar, MapIndexedRangeModule, MapSystemBuilder, MutableSubscribable, NodeReference,
  NumberFormatter, ReadonlyFloat64Array, Subject, Subscribable, SubscribableUtils, Subscription, UserSettingManager,
  Vec2Math, Vec2Subject, VNode
} from '@microsoft/msfs-sdk';

import {
  GarminFacilityWaypointCache, GarminMapKeys, LatLonDisplay, LatLonDisplayFormat, MapRangeController, TouchPad,
  WaypointInfoStore, WaypointMapSelectionModule
} from '@microsoft/msfs-garminsdk';

import { UiBearingArrow } from '../../../../Shared/Components/BearingArrow/UiBearingArrow';
import { G3XBearingDisplay } from '../../../../Shared/Components/Common/G3XBearingDisplay';
import { G3XNumberUnitDisplay } from '../../../../Shared/Components/Common/G3XNumberUnitDisplay';
import { G3XWaypointMapBuilder } from '../../../../Shared/Components/Map/Assembled/G3XWaypointMapBuilder';
import { MapDragPanController } from '../../../../Shared/Components/Map/Controllers/MapDragPanController';
import { G3XMapKeys } from '../../../../Shared/Components/Map/G3XMapKeys';
import { MapConfig } from '../../../../Shared/Components/Map/MapConfig';
import { MapDragPanModule } from '../../../../Shared/Components/Map/Modules/MapDragPanModule';
import { AbstractTabbedContent } from '../../../../Shared/Components/TabbedContainer/AbstractTabbedContent';
import { TabbedContentProps } from '../../../../Shared/Components/TabbedContainer/TabbedContent';
import { UiImgTouchButton } from '../../../../Shared/Components/TouchButton/UiImgTouchButton';
import { UiValueTouchButton } from '../../../../Shared/Components/TouchButton/UiValueTouchButton';
import { G3XFms } from '../../../../Shared/FlightPlan/G3XFms';
import { G3XFplSourceDataProvider } from '../../../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { G3XFplSource } from '../../../../Shared/FlightPlan/G3XFplSourceTypes';
import { G3XTouchFilePaths } from '../../../../Shared/G3XTouchFilePaths';
import { PositionHeadingDataProvider } from '../../../../Shared/Navigation/PositionHeadingDataProvider';
import { FplSourceUserSettings, G3XFplSourceSettingMode } from '../../../../Shared/Settings/FplSourceUserSettings';
import { G3XUnitsUserSettingManager } from '../../../../Shared/Settings/G3XUnitsUserSettings';
import { GduUserSettingTypes } from '../../../../Shared/Settings/GduUserSettings';
import { G3XMapUserSettingTypes } from '../../../../Shared/Settings/MapUserSettings';
import { UiInteractionEvent } from '../../../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../../../Shared/UiSystem/UiKnobTypes';
import { UiService } from '../../../../Shared/UiSystem/UiService';
import { UiViewKeys } from '../../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../../Shared/UiSystem/UiViewTypes';
import { UiListSelectTouchButton } from '../../../Components/TouchButton/UiListSelectTouchButton';
import { UiWaypointSelectButton } from '../../../Components/TouchButton/UiWaypointSelectButton';
import { CourseDialog } from '../../../Dialogs/CourseDialog';
import { WaypointInfoPopup } from '../../WaypointInfoPopup';
import { DirectToTargetParams } from '../DirectToTargetParams';

import './DirectToWaypointTab.css';

/**
 * Component props for the {@link DirectToWaypointTab}.
 */
export interface DirectToWaypointTabProps extends TabbedContentProps {
  /** The UI service. */
  uiService: UiService;

  /** A reference to the root element of the container of this tab's parent UI view. */
  containerRef: NodeReference<HTMLElement>;

  /** The FMS. */
  fms: G3XFms;

  /** The waypoint to display. */
  selectedTargetParams: MutableSubscribable<Readonly<DirectToTargetParams>>;

  /** A provider of data related to flight plan source. */
  fplSourceDataProvider: G3XFplSourceDataProvider;

  /** A provider of position and heading data. */
  posHeadingDataProvider: PositionHeadingDataProvider;

  /** A manager for GDU user settings. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;

  /** A manager for map user settings. */
  mapSettingManager: UserSettingManager<Partial<G3XMapUserSettingTypes>>;

  /** A manager for display unit user settings. */
  unitsSettingManager: G3XUnitsUserSettingManager;

  /** A configuration object defining options for the map. */
  mapConfig: MapConfig;
}

/**
 * A tab that displays information about a waypoint.
 */
export class DirectToWaypointTab extends AbstractTabbedContent<DirectToWaypointTabProps> {
  private static readonly NAV_ANGLE_TRUE = BasicNavAngleUnit.create(false);

  private static readonly BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '__._' });

  private static readonly MAP_WAKE_HIDE_DURATION = 250; // milliseconds
  private static readonly DEFAULT_TARGET_RANGE_INDEX = 12; // 8 nm

  private readonly targetWaypoint = Subject.create<FacilityWaypoint | null>(null);
  private readonly waypointInfoStore: WaypointInfoStore = new WaypointInfoStore(
    this.targetWaypoint,
    this.props.posHeadingDataProvider.pposWithFailure,
    { useRegionFallbackForAirport: false }
  );
  private readonly waypointRelativeBearing = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);

  private readonly hasTargetWaypoint = this.props.selectedTargetParams.map(params => params.waypoint !== null).pause();
  private readonly regionText = this.waypointInfoStore.region.map(region => region === undefined ? ' ' : region);

  private readonly defaultCourse = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(NaN));
  private readonly selectedCourse = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(NaN));
  private readonly displayedCourse = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(NaN));

  private readonly isFplSourceInternal = this.props.fplSourceDataProvider.source.map(source => {
    return source === G3XFplSource.Internal || source === G3XFplSource.InternalRev;
  }).pause();

  private readonly mapSize = Vec2Subject.create(Vec2Math.create(315, 300));

  private readonly compiledMap = MapSystemBuilder.create(this.props.uiService.bus)
    .with(G3XWaypointMapBuilder.build, {
      gduFormat: this.props.uiService.gduFormat,

      facilityLoader: this.props.fms.facLoader,

      bingId: `g3x-${this.props.uiService.gduIndex}-map-3`,

      dataUpdateFreq: 30,

      gduIndex: this.props.uiService.instrumentIndex,
      gduSettingManager: this.props.gduSettingManager,

      projectedRange: this.props.uiService.gduFormat === '460' ? 60 : 30,

      airplaneIconSrc: this.props.mapConfig.ownAirplaneIconSrc,

      flightPlanner: this.props.fplSourceDataProvider.flightPlanner,
      lnavIndex: this.props.fplSourceDataProvider.lnavIndex,
      vnavIndex: this.props.fplSourceDataProvider.vnavIndex,

      settingManager: this.props.mapSettingManager,
      unitsSettingManager: this.props.unitsSettingManager
    })
    .withProjectedSize(this.mapSize)
    .build('common-map direct-to-waypoint-tab-map') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;

        /** The drag-to-pan module. */
        [G3XMapKeys.DragPan]: MapDragPanModule;

        /** The waypoint selection module. */
        [GarminMapKeys.WaypointSelection]: WaypointMapSelectionModule;
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

  private readonly mapDragPanModule = this.compiledMap.context.model.getModule(G3XMapKeys.DragPan);
  private readonly mapWptSelectionModule = this.compiledMap.context.model.getModule(GarminMapKeys.WaypointSelection);

  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);
  private readonly mapDragPanController = this.compiledMap.context.getController(G3XMapKeys.DragPan);

  private dragPanPrimed = false;
  private readonly dragPanThreshold = this.props.uiService.gduFormat === '460' ? 20 : 10;
  private readonly dragStartPos = Vec2Math.create();
  private readonly dragDelta = Vec2Math.create();

  private readonly mapHiddenDebounce = new DebounceTimer();
  private readonly mapHidden = Subject.create(false);
  private readonly showMapFunc = this.mapHidden.set.bind(this.mapHidden, false);

  private readonly subscriptions: Subscription[] = [
    this.hasTargetWaypoint,
    this.isFplSourceInternal
  ];

  private readonly waypointSelectButtonRef = FSComponent.createRef<UiWaypointSelectButton<FacilitySearchType.AllExceptVisual, Subscribable<FacilityWaypoint | null>>>();

  private thisNode?: VNode;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.compiledMap.ref.instance.sleep();

    this.targetWaypoint.sub(this.onWaypointChanged.bind(this), true);

    const updateDisplayedCourseFunc = this.updateDisplayedCourse.bind(this);
    this.defaultCourse.sub(updateDisplayedCourseFunc);
    this.selectedCourse.sub(updateDisplayedCourseFunc);
    updateDisplayedCourseFunc();

    this.subscriptions.push(
      this.props.selectedTargetParams.sub(this.onTargetParamsChanged.bind(this), true)
    );

    this._knobLabelState.set([
      [UiKnobId.SingleInner, 'Edit Wpt'],
      [UiKnobId.LeftInner, 'Edit Wpt'],
      [UiKnobId.RightInner, 'Edit Wpt'],
    ]);

    this.isFplSourceInternal.sub(isInternal => {
      if (isInternal) {
        this._knobLabelState.setValue(UiKnobId.SingleInnerPush, 'Push Activate');
        this._knobLabelState.setValue(UiKnobId.LeftInnerPush, 'Push Activate');
        this._knobLabelState.setValue(UiKnobId.RightInnerPush, 'Push Activate');
      } else {
        this._knobLabelState.delete(UiKnobId.SingleInnerPush);
        this._knobLabelState.delete(UiKnobId.LeftInnerPush);
        this._knobLabelState.delete(UiKnobId.RightInnerPush);
      }
    }, true);
  }

  /** @inheritDoc */
  public onOpen(): void {
    // Hide the map for a short period after waking so that users don't see any artifacts from the Bing map texture.
    this.mapHidden.set(true);
    this.mapHiddenDebounce.schedule(this.showMapFunc, DirectToWaypointTab.MAP_WAKE_HIDE_DURATION);

    this.compiledMap.ref.instance.wake();

    this.hasTargetWaypoint.resume();
    this.isFplSourceInternal.resume();
  }

  /** @inheritDoc */
  public onClose(): void {
    this.hasTargetWaypoint.pause();
    this.isFplSourceInternal.pause();

    this.mapDragPanController.setDragPanActive(false);
    this.compiledMap.ref.instance.sleep();

    this.mapHiddenDebounce.clear();
    this.mapHidden.set(true);
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

    const waypointTrueBearing = this.waypointInfoStore.bearing.get().asUnit(DirectToWaypointTab.NAV_ANGLE_TRUE);
    const planeHeading = this.props.posHeadingDataProvider.headingTrueWithFailure.get();
    this.waypointRelativeBearing.set((waypointTrueBearing - planeHeading + 360) % 360);
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    switch (event) {
      case UiInteractionEvent.SingleKnobPress:
      case UiInteractionEvent.LeftKnobPress:
      case UiInteractionEvent.RightKnobPress:
        this.onDirectToPressed();
        return true;
      case UiInteractionEvent.LeftKnobInnerDec:
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.RightKnobInnerDec:
      case UiInteractionEvent.RightKnobInnerInc:
      case UiInteractionEvent.SingleKnobInnerDec:
      case UiInteractionEvent.SingleKnobInnerInc:
        this.waypointSelectButtonRef.instance.simulatePressed();
        return true;
      default:
        return false;
    }
  }

  /**
   * Responds to when the Direct-To target parameters change.
   * @param params The new Direct-To target parameters.
   */
  private onTargetParamsChanged(params: Readonly<DirectToTargetParams>): void {
    this.targetWaypoint.set(params.waypoint);

    if (params.course === undefined) {
      this.selectedCourse.set(NaN);
    } else {
      this.selectedCourse.set(MagVar.magneticToTrue(params.course, this.selectedCourse.get().unit.magVar));
    }
  }

  /**
   * Responds to when this display's waypoint changes.
   * @param waypoint The new waypoint to display.
   */
  private onWaypointChanged(waypoint: FacilityWaypoint | null): void {
    this.mapDragPanController.setDragPanActive(false);
    this.mapWptSelectionModule.waypoint.set(waypoint);
    this.mapRangeController.setRangeIndex(DirectToWaypointTab.DEFAULT_TARGET_RANGE_INDEX);

    this.updateDefaultCourseAndMagVar(waypoint);
  }

  /**
   * Updates the default course and the magnetic variation of the default and selected course values for a given
   * waypoint.
   * @param waypoint The waypoint for which to update the default course and magnetic variation.
   */
  private updateDefaultCourseAndMagVar(waypoint: FacilityWaypoint | null): void {
    if (waypoint === null) {
      this.defaultCourse.set(NaN, 0);
      return;
    }

    const facility = waypoint.facility.get();
    const bearing = this.props.posHeadingDataProvider.pposWithFailure.get().bearingTo(facility);
    const magVar = FacilityUtils.getMagVar(facility);

    this.defaultCourse.set(bearing, magVar);
    this.selectedCourse.set(this.selectedCourse.get().number, magVar);
  }

  /**
   * Updates the course value that is displayed with this tab's Course button.
   */
  private updateDisplayedCourse(): void {
    if (this.selectedCourse.get().isNaN()) {
      this.displayedCourse.set(this.defaultCourse.get());
    } else {
      this.displayedCourse.set(this.selectedCourse.get());
    }
  }

  /**
   * Responds to when the user selects a waypoint.
   * @param waypoint The selected waypoint.
   */
  private onWaypointSelected(waypoint: FacilityWaypoint): void {
    this.props.selectedTargetParams.set({
      waypoint,
      course: undefined
    });
  }

  /**
   * Opens a waypoint information popup and sets it to display a waypoint.
   */
  private openWaypointInfoPopup(): void {
    this.props.uiService
      .openMfdPopup<WaypointInfoPopup>(UiViewStackLayer.Overlay, UiViewKeys.WaypointInfoPopup, false, {
        popupType: 'slideout-right-full',
        backgroundOcclusion: 'hide'
      })
      .ref.setWaypoint(this.props.selectedTargetParams.get().waypoint);
  }

  /**
   * Responds to when the course button is pressed.
   */
  private async onCourseButtonPressed(): Promise<void> {
    const displayUnit = this.props.unitsSettingManager.navAngleUnits.get();

    let initialValue = this.displayedCourse.get().asUnit(displayUnit);
    if (isNaN(initialValue)) {
      initialValue = 360;
    }

    const result = await this.props.uiService
      .openMfdPopup<CourseDialog>(UiViewStackLayer.Overlay, UiViewKeys.CourseDialog, false)
      .ref.request({
        initialValue,
        unit: displayUnit.isMagnetic() ? 'magnetic' : 'true',
        title: 'Course To Waypoint',
      });

    if (!result.wasCancelled) {
      const targetCourse = displayUnit.isMagnetic()
        ? result.payload
        : MagVar.trueToMagnetic(result.payload, this.selectedCourse.get().unit.magVar);

      const targetParams = this.props.selectedTargetParams.get();
      this.props.selectedTargetParams.set({
        waypoint: targetParams.waypoint,
        course: targetCourse
      });
    }
  }

  /**
   * Responds to when the direct-to button is pressed.
   */
  private onDirectToPressed(): void {
    const targetParams = this.props.selectedTargetParams.get();

    if (!this.isFplSourceInternal.get() || targetParams.waypoint === null) {
      return;
    }

    if (targetParams.waypoint !== null) {
      this.props.fms.createDirectTo(targetParams.waypoint.facility.get(), targetParams.course);
      this.props.uiService.goBackMfd();
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
      <div class={{ 'direct-to-waypoint-tab': true, 'direct-to-waypoint-tab-has-target': this.hasTargetWaypoint }}>
        <UiWaypointSelectButton
          ref={this.waypointSelectButtonRef}
          uiService={this.props.uiService}
          type={FacilitySearchType.AllExceptVisual}
          waypoint={this.targetWaypoint}
          waypointCache={GarminFacilityWaypointCache.getCache(this.props.uiService.bus)}
          nullIdent={''}
          onSelected={this.onWaypointSelected.bind(this)}
          class='direct-to-waypoint-tab-waypoint-select-button'
        >
          <div class='direct-to-waypoint-tab-waypoint-select-button-null-label'>Select Waypoint</div>
        </UiWaypointSelectButton>
        <div class='direct-to-waypoint-tab-middle-row'>
          <div class='direct-to-waypoint-tab-info-block'>
            <div class='direct-to-waypoint-tab-info-block-brg-dist-container'>
              <div class='direct-to-waypoint-tab-info-block-brg-dist direct-to-waypoint-tab-info-block-brg'>
                <div class='direct-to-waypoint-tab-info-block-brg-dist-title'>Brg</div>
                <G3XBearingDisplay
                  value={this.waypointInfoStore.bearing}
                  displayUnit={this.props.unitsSettingManager.navAngleUnits}
                  formatter={DirectToWaypointTab.BEARING_FORMATTER}
                  class='direct-to-waypoint-tab-info-block-brg-dist-value'
                />
              </div>
              <div class='direct-to-waypoint-tab-info-block-brg-dist direct-to-waypoint-tab-info-block-dist'>
                <div class='direct-to-waypoint-tab-info-block-brg-dist-title'>Dist</div>
                <G3XNumberUnitDisplay
                  value={this.waypointInfoStore.distance}
                  displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
                  formatter={DirectToWaypointTab.DISTANCE_FORMATTER}
                  class='direct-to-waypoint-tab-info-block-brg-dist-value'
                />
              </div>
              <UiBearingArrow
                relativeBearing={this.waypointRelativeBearing}
              />
            </div>
            <div class='direct-to-waypoint-tab-info-block-region'>
              {this.regionText}
            </div>
            <LatLonDisplay
              value={this.waypointInfoStore.location}
              format={LatLonDisplayFormat.HDDD_MMmmm}
              splitPrefix
              blankPrefixWhenNaN
              class='direct-to-waypoint-tab-info-block-latlon'
            />
            <UiValueTouchButton
              isVisible={this.hasTargetWaypoint}
              state={this.displayedCourse}
              label='Course To'
              renderValue={
                <G3XBearingDisplay
                  value={this.displayedCourse}
                  displayUnit={this.props.unitsSettingManager.navAngleUnits}
                  formatter={DirectToWaypointTab.BEARING_FORMATTER}
                  class='direct-to-waypoint-tab-info-block-course-to-value'
                />
              }
              onPressed={this.onCourseButtonPressed.bind(this)}
              class='direct-to-waypoint-tab-info-block-course-to'
            />
          </div>
          <div class='direct-to-waypoint-tab-map-box'>
            <div class={{ 'direct-to-waypoint-tab-map-container': true, 'visibility-hidden': this.mapHidden }}>
              <TouchPad
                bus={this.props.uiService.bus}
                onDragStarted={this.onDragStarted.bind(this)}
                onDragMoved={this.onDragMoved.bind(this)}
                onDragEnded={this.onDragEnded.bind(this)}
              >
                {this.compiledMap.map}
              </TouchPad>
              <div class='ui-layered-darken' />
            </div>
          </div>
        </div>
        <div class='direct-to-waypoint-tab-bottom-row'>
          <UiImgTouchButton
            isEnabled={this.hasTargetWaypoint}
            label={'Info'}
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_waypoint_info.png`}
            onPressed={this.openWaypointInfoPopup.bind(this)}
            class='direct-to-waypoint-tab-info-button'
          />
          <UiListSelectTouchButton
            uiService={this.props.uiService}
            listDialogLayer={UiViewStackLayer.Overlay}
            listDialogKey={UiViewKeys.ListDialog1}
            openDialogAsPositioned
            containerRef={this.props.containerRef}
            isVisible={this.props.fplSourceDataProvider.externalSourceCount > 0}
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
              class: 'direct-to-waypoint-tab-fpl-source-select-dialog'
            }}
            renderValue={source => source === G3XFplSourceSettingMode.External ? 'External GPS' : 'Internal'}
            hideDropdownArrow
            class='direct-to-waypoint-tab-fpl-source-button'
          />
          <UiImgTouchButton
            isVisible={this.isFplSourceInternal}
            isEnabled={false}
            label={'Stop\nNavigation'}
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_stop_navigation.png`}
            class='direct-to-waypoint-tab-stop-navigation-button'
          />
          <UiImgTouchButton
            isVisible={this.isFplSourceInternal}
            isEnabled={this.hasTargetWaypoint}
            label={'Activate'}
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_direct_to.png`}
            class='direct-to-waypoint-tab-activate-button'
            onPressed={this.onDirectToPressed.bind(this)}
          />
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.mapHiddenDebounce.clear();

    this.compiledMap.ref.getOrDefault()?.destroy();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    this.waypointInfoStore.destroy();

    super.destroy();
  }
}
