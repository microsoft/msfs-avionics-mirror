import {
  AirportUtils, CompiledMapSystem, ComponentProps, DebounceTimer, DisplayComponent, FacilityType, FacilityUtils,
  FilteredMapSubject, FSComponent, ICAO, MagVar, MapIndexedRangeModule, MappedSubject, MapSystemBuilder, NdbType,
  NumberFormatter, RadioFrequencyFormatter, ReadonlyFloat64Array, Subject, Subscribable, SubscribableMap,
  SubscribableMapFunctions, Subscription, UnitType, UserSettingManager, Vec2Math, Vec2Subject, VNode, VorClass,
  Waypoint
} from '@microsoft/msfs-sdk';

import {
  GarminMapKeys, LatLonDisplay, LatLonDisplayFormat, MapRangeController, TouchPad, UnitsUserSettingManager,
  WaypointInfoStore, WaypointMapSelectionModule
} from '@microsoft/msfs-garminsdk';

import { G3XBearingDisplay } from '../../../Shared/Components/Common/G3XBearingDisplay';
import { G3XNumberUnitDisplay } from '../../../Shared/Components/Common/G3XNumberUnitDisplay';
import { G3XWaypointMapBuilder } from '../../../Shared/Components/Map/Assembled/G3XWaypointMapBuilder';
import { MapDragPanController } from '../../../Shared/Components/Map/Controllers/MapDragPanController';
import { G3XMapKeys } from '../../../Shared/Components/Map/G3XMapKeys';
import { MapConfig } from '../../../Shared/Components/Map/MapConfig';
import { MapDragPanModule } from '../../../Shared/Components/Map/Modules/MapDragPanModule';
import { G3XFplSourceDataProvider } from '../../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { G3XSpecialChar } from '../../../Shared/Graphics/Text/G3XSpecialChar';
import { DisplayUserSettingTypes } from '../../../Shared/Settings/DisplayUserSettings';
import { GduUserSettingTypes } from '../../../Shared/Settings/GduUserSettings';
import { G3XMapUserSettingTypes } from '../../../Shared/Settings/MapUserSettings';
import { UiInteractionEvent, UiInteractionHandler } from '../../../Shared/UiSystem/UiInteraction';
import { UiInteractionUtils } from '../../../Shared/UiSystem/UiInteractionUtils';
import { UiKnobId, UiKnobRequestedLabelState } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiService } from '../../../Shared/UiSystem/UiService';
import { WaypointInfoContentMode } from './WaypointInfoTypes';

import './WaypointInfoInfo.css';

/**
 * Component props for {@link WaypointInfoInfo}.
 */
export interface WaypointInfoInfoProps extends ComponentProps {
  /** The UI service instance. */
  uiService: UiService;

  /** The IDs of the valid bezel rotary knobs that can be used to control the display. */
  validKnobIds: Iterable<UiKnobId>;

  /** A store containing information about the waypoint for which to display information. */
  waypointInfoStore: WaypointInfoStore;

  /** The content mode associated with the waypoint for which to display information. */
  contentMode: Subscribable<WaypointInfoContentMode>;

  /** Whether to show the component's title. */
  showTitle: Subscribable<boolean>;

  /** Whether the inner bezel rotary knobs are allowed to control the zoom of the component's map. */
  allowKnobZoom: Subscribable<boolean>;

  /** A provider of flight plan source data. */
  fplSourceDataProvider: G3XFplSourceDataProvider;

  /** The ID to assign to the Bing instance bound to the component's map. */
  mapBingId: string;

  /** A manager for GDU user settings. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;

  /** A manager for display user settings. */
  displaySettingManager: UserSettingManager<DisplayUserSettingTypes>;

  /** A manager for map user settings. */
  mapSettingManager: UserSettingManager<Partial<G3XMapUserSettingTypes>>;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** A configuration object defining options for the map. */
  mapConfig: MapConfig;
}

/**
 * A waypoint info display information component, which displays a map and summary information about a waypoint.
 */
export class WaypointInfoInfo extends DisplayComponent<WaypointInfoInfoProps> implements UiInteractionHandler {
  private static readonly DEFAULT_TARGET_RANGE_INDEX = 12; // 8 nm

  private static readonly MAP_RESIZE_HIDE_DURATION = 250; // milliseconds

  private static readonly KNOB_LABEL_STATE: [UiKnobId, string][] = [
    [UiKnobId.SingleInner, 'Zoom'],
    [UiKnobId.SingleOuter, 'Zoom'],
    [UiKnobId.LeftInner, 'Zoom'],
    [UiKnobId.LeftOuter, 'Zoom'],
    [UiKnobId.RightInner, 'Zoom'],
    [UiKnobId.RightOuter, 'Zoom']
  ];

  private thisNode?: VNode;

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private readonly dimensions = Vec2Math.create(100, 100);

  private readonly titleHidden = this.props.showTitle.map(SubscribableMapFunctions.not());

  private readonly showAirportContent = this.props.contentMode.map(mode => mode === WaypointInfoContentMode.Airport);
  private readonly showVorContent = this.props.contentMode.map(mode => mode === WaypointInfoContentMode.Vor);
  private readonly showNdbContent = this.props.contentMode.map(mode => mode === WaypointInfoContentMode.Ndb);
  private readonly showIntersectionContent = this.props.contentMode.map(mode => mode === WaypointInfoContentMode.Intersection);
  private readonly showUserWaypointContent = this.props.contentMode.map(mode => mode === WaypointInfoContentMode.User);

  private readonly mapSize = Vec2Subject.create(Vec2Math.create(100, 100));

  private readonly compiledMap = MapSystemBuilder.create(this.props.uiService.bus)
    .with(G3XWaypointMapBuilder.build, {
      gduFormat: this.props.uiService.gduFormat,

      bingId: this.props.mapBingId,

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
    .build('waypoint-info-info-map') as CompiledMapSystem<
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

  private readonly mapSizeState = MappedSubject.create(
    this.props.showTitle,
    this.props.contentMode
  );
  private readonly contentModeSizeSub = this.mapSizeState.sub(this.updateMapSize.bind(this), false, true);

  private readonly mapHiddenDebounce = new DebounceTimer();
  private readonly mapHidden = Subject.create(false);
  private readonly showMapFunc = this.mapHidden.set.bind(this.mapHidden, false);

  private readonly allowKnobZoom = this.props.allowKnobZoom.map(SubscribableMapFunctions.identity());
  private readonly allowKnobZoomSub = this.allowKnobZoom.sub(this.onAllowKnobZoomChanged.bind(this), false, true);

  private readonly validKnobIds = new Set(this.props.validKnobIds);

  private readonly _knobLabelState = FilteredMapSubject.create<UiKnobId, string>(this.validKnobIds);
  /** The bezel rotary knob label state requested by this component. */
  public readonly knobLabelState = this._knobLabelState as SubscribableMap<UiKnobId, string> & Subscribable<UiKnobRequestedLabelState>;

  private isPaused = true;

  private readonly subscriptions: Subscription[] = [
    this.mapSizeState,
    this.showAirportContent,
    this.showVorContent,
    this.showNdbContent,
    this.showIntersectionContent,
    this.showUserWaypointContent,
    this.allowKnobZoom
  ];

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.rootRef.instance.style.width = `${this.dimensions[0]}px`;
    this.rootRef.instance.style.height = `${this.dimensions[1]}px`;

    this.compiledMap.ref.instance.sleep();

    this.subscriptions.push(
      this.props.waypointInfoStore.waypoint.sub(this.onWaypointChanged.bind(this), true)
    );
  }

  /**
   * Resumes this component.
   */
  public resume(): void {
    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    this.allowKnobZoomSub.resume(true);

    this.contentModeSizeSub.resume();
    this.updateMapSize();

    this.compiledMap.ref.instance.wake();
  }

  /**
   * Pauses this component.
   */
  public pause(): void {
    if (this.isPaused) {
      return;
    }

    this.isPaused = true;

    this.mapDragPanController.setDragPanActive(false);

    this.compiledMap.ref.instance.sleep();

    this.contentModeSizeSub.pause();

    this.mapHiddenDebounce.clear();
    this.mapHidden.set(true);

    this.allowKnobZoomSub.pause();

    this._knobLabelState.clear();
  }

  /**
   * Sets the size of this component.
   * @param width The new width, in pixels.
   * @param height The new height, in pixels.
   */
  public setSize(width: number, height: number): void {
    if (width === this.dimensions[0] && height === this.dimensions[1]) {
      return;
    }

    Vec2Math.set(width, height, this.dimensions);

    if (this.rootRef.getOrDefault()) {
      this.rootRef.instance.style.width = `${this.dimensions[0]}px`;
      this.rootRef.instance.style.height = `${this.dimensions[1]}px`;
    }

    if (!this.isPaused) {
      this.updateMapSize();
    }
  }

  /**
   * Updates this component. Has no effect if this component is paused.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  public update(time: number): void {
    if (this.isPaused) {
      return;
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
      case UiInteractionEvent.SingleKnobOuterInc:
      case UiInteractionEvent.LeftKnobOuterInc:
      case UiInteractionEvent.RightKnobOuterInc:
      case UiInteractionEvent.SingleKnobInnerInc:
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.RightKnobInnerInc:
        if (this.validKnobIds.has(UiInteractionUtils.KNOB_EVENT_TO_KNOB_ID[event]) && this.allowKnobZoom.get()) {
          this.changeMapRangeIndex(this.props.displaySettingManager.getSetting('displayKnobZoomReverse').value ? 1 : -1);
          return true;
        }
        break;
      case UiInteractionEvent.SingleKnobOuterDec:
      case UiInteractionEvent.LeftKnobOuterDec:
      case UiInteractionEvent.RightKnobOuterDec:
      case UiInteractionEvent.SingleKnobInnerDec:
      case UiInteractionEvent.LeftKnobInnerDec:
      case UiInteractionEvent.RightKnobInnerDec:
        if (this.validKnobIds.has(UiInteractionUtils.KNOB_EVENT_TO_KNOB_ID[event]) && this.allowKnobZoom.get()) {
          this.changeMapRangeIndex(this.props.displaySettingManager.getSetting('displayKnobZoomReverse').value ? -1 : 1);
          return true;
        }
        break;
      case UiInteractionEvent.BackPress:
        if (this.mapDragPanModule.isActive.get()) {
          this.mapDragPanController.setDragPanActive(false);
          return true;
        }
        break;
    }

    return false;
  }

  /**
   * Changes this component's map range index.
   * @param delta The change in index to apply.
   */
  private changeMapRangeIndex(delta: number): void {
    this.mapRangeController.changeRangeIndex(delta);
  }

  /**
   * Updates the size of this component's map.
   */
  private updateMapSize(): void {
    // TODO: support GDU470 (portrait)

    const titleHeight = this.props.showTitle.get() ? 28 + 4 : 0;

    let topHeight: number;
    switch (this.props.contentMode.get()) {
      case WaypointInfoContentMode.Airport:
      case WaypointInfoContentMode.Intersection:
      case WaypointInfoContentMode.User:
        topHeight = 64;
        break;
      case WaypointInfoContentMode.Vor:
        topHeight = 136;
        break;
      case WaypointInfoContentMode.Ndb:
        topHeight = 112;
        break;
      default:
        topHeight = 0;
    }

    const bottomHeight = 44;

    // The map takes up the full width of the component. In the vertical direction, we need to subtract the heights
    // of the title, top and bottom sections, 2 pixels for the top and bottom dividers, and 3 pixel margins on both the
    // top and bottom of the map.
    this.mapSize.set(this.dimensions[0], this.dimensions[1] - titleHeight - topHeight - bottomHeight - 2 - 6);

    // Hide the map for a short period after resizing so that users don't see any artifacts from the Bing map texture.
    this.mapHidden.set(true);
    this.mapHiddenDebounce.schedule(this.showMapFunc, WaypointInfoInfo.MAP_RESIZE_HIDE_DURATION);
  }

  /**
   * Responds to when whether the inner bezel rotary knobs are allowed to control the zoom of this component's map
   * changes.
   * @param allow Whether the inner bezel rotary knobs are allowed to control map zoom.
   */
  private onAllowKnobZoomChanged(allow: boolean): void {
    if (allow) {
      this._knobLabelState.set(WaypointInfoInfo.KNOB_LABEL_STATE);
    } else {
      this._knobLabelState.clear();
    }
  }

  /**
   * Responds to when this component's waypoint changes.
   * @param waypoint The new waypoint.
   */
  private onWaypointChanged(waypoint: Waypoint | null): void {
    this.mapDragPanController.setDragPanActive(false);

    this.mapWptSelectionModule.waypoint.set(waypoint);

    this.mapRangeController.setRangeIndex(WaypointInfoInfo.DEFAULT_TARGET_RANGE_INDEX);
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
      <div ref={this.rootRef} class={{ 'waypoint-info-info': true, 'waypoint-info-info-knob-zoom': this.allowKnobZoom }}>
        <div class={{ 'waypoint-info-info-title': true, 'hidden': this.titleHidden }}>
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_apt_info_tab.png`} class='waypoint-info-info-title-icon' />
          <span class='waypoint-info-info-title-text'>Info</span>
        </div>

        <div class='waypoint-info-info-top'>
          <AirportInfoContent
            show={this.showAirportContent}
            waypointInfoStore={this.props.waypointInfoStore}
            unitsSettingManager={this.props.unitsSettingManager}
          />
          <VorInfoContent
            show={this.showVorContent}
            waypointInfoStore={this.props.waypointInfoStore}
          />
          <NdbInfoContent
            show={this.showNdbContent}
            waypointInfoStore={this.props.waypointInfoStore}
          />
          <IntersectionInfoContent
            show={this.showIntersectionContent}
            waypointInfoStore={this.props.waypointInfoStore}
          />
          <UserWaypointInfoContent
            show={this.showUserWaypointContent}
            waypointInfoStore={this.props.waypointInfoStore}
          />
        </div>

        <div class={{ 'waypoint-info-info-map-container': true, 'hidden': this.mapHidden }}>
          <TouchPad
            bus={this.props.uiService.bus}
            onDragStarted={this.onDragStarted.bind(this)}
            onDragMoved={this.onDragMoved.bind(this)}
            onDragEnded={this.onDragEnded.bind(this)}
            class='waypoint-info-info-touch-pad'
          >
            {this.compiledMap.map}
          </TouchPad>
          <div class='ui-layered-darken' />
        </div>

        <div class='waypoint-info-info-bottom'>
          <div class='waypoint-info-info-brg'>
            <span class='waypoint-info-info-brgdist-title'>Brg </span>
            <G3XBearingDisplay
              value={this.props.waypointInfoStore.bearing}
              displayUnit={this.props.unitsSettingManager.navAngleUnits}
              formatter={NumberFormatter.create({ precision: 1, pad: 3, nanString: '___', cache: true })}
              class='waypoint-info-info-brgdist-value'
            />
          </div>
          <div class='waypoint-info-info-dist'>
            <span class='waypoint-info-info-brgdist-title'>Dist </span>
            <G3XNumberUnitDisplay
              value={this.props.waypointInfoStore.distance}
              displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
              formatter={NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '__._', cache: true })}
              class='waypoint-info-info-brgdist-value'
            />
          </div>
          <LatLonDisplay
            value={this.props.waypointInfoStore.location}
            format={LatLonDisplayFormat.HDDD_MMmmm}
            splitPrefix
            class='waypoint-info-info-latlon'
          />
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.mapHiddenDebounce.clear();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.compiledMap.ref.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}

/**
 * Component props for waypoint info information content.
 */
interface WaypointInfoContentProps extends ComponentProps {
  /** Whether to show the content. */
  show: Subscribable<boolean>;

  /** A store containing information about the waypoint for which to display information. */
  waypointInfoStore: WaypointInfoStore;
}

/**
 * Component props for {@link AirportInfoContent}.
 */
interface AirportInfoContentProps extends WaypointInfoContentProps {
  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;
}

/**
 * An airport information content display.
 */
class AirportInfoContent extends DisplayComponent<AirportInfoContentProps> {
  private readonly hidden = this.props.show.map(SubscribableMapFunctions.not());

  private readonly elevationText = this.props.waypointInfoStore.facility.map(facility => {
    if (!facility || !FacilityUtils.isFacilityType(facility, FacilityType.Airport)) {
      return '––––ft';
    }

    const elevationMetres = AirportUtils.getElevation(facility);

    if (elevationMetres === undefined) {
      return '––––ft';
    }

    const elevationFeet = UnitType.FOOT.convertFrom(elevationMetres, UnitType.METER);

    return `${elevationFeet.toFixed(0)}ft`;
  });

  private readonly regionText = this.props.waypointInfoStore.region.map(region => region === undefined ? '––––' : region);

  private readonly fuelText = this.props.waypointInfoStore.facility.map(facility => {
    if (!facility || !FacilityUtils.isFacilityType(facility, FacilityType.Airport)) {
      return '';
    }

    return facility.fuel1 + (facility.fuel2 ? `, ${facility.fuel2}` : '');
  });

  private readonly subscriptions: Subscription[] = [
    this.hidden,
    this.elevationText,
    this.regionText,
    this.fuelText
  ];

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={{ 'waypoint-info-info-airport': true, 'hidden': this.hidden }}>
        <div class='waypoint-info-info-airport-elevation'>{this.elevationText} MSL</div>
        <div class='waypoint-info-info-airport-region'>{this.regionText}</div>
        <div class='waypoint-info-info-airport-fuel'>{this.fuelText}</div>
        <div class='waypoint-info-info-airport-timezone'>––––</div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}

const MORSE_MAP: Partial<Record<string, string>> = {
  'A': '._',
  'B': '_...',
  'C': '_._.',
  'D': '_..',
  'E': '.',
  'F': '.._.',
  'G': '__.',
  'H': '....',
  'I': '..',
  'J': '.___',
  'K': '_._',
  'L': '._..',
  'M': '__',
  'N': '_.',
  'O': '___',
  'P': '.__.',
  'Q': '__._',
  'R': '._.',
  'S': '...',
  'T': '_',
  'U': '.._',
  'V': '..._',
  'W': '.__',
  'X': '_.._',
  'Y': '_.__',
  'Z': '__..',
};

/**
 * A VOR information content display.
 */
class VorInfoContent extends DisplayComponent<WaypointInfoContentProps> {
  private static readonly FREQ_FORMATTER = RadioFrequencyFormatter.createNav();

  private readonly hidden = this.props.show.map(SubscribableMapFunctions.not());

  private readonly classText = this.props.waypointInfoStore.facility.map(facility => {
    if (!facility || !FacilityUtils.isFacilityType(facility, FacilityType.VOR)) {
      return '––––';
    }

    switch (facility.vorClass) {
      case VorClass.HighAlt:
        return 'High Altitude VOR';
      case VorClass.LowAlt:
        return 'Low Altitude VOR';
      case VorClass.Terminal:
        return 'Terminal VOR';
      case VorClass.ILS:
        return 'ILS/LOC';
      case VorClass.VOT:
        return 'VOR Test Facility';
      case VorClass.Unknown:
        return 'Unknown';
      default:
        return '––––';
    }
  });

  private readonly regionText = this.props.waypointInfoStore.region.map(region => region === undefined ? '––––' : region);

  private readonly freqText = this.props.waypointInfoStore.facility.map(facility => {
    if (!facility || !FacilityUtils.isFacilityType(facility, FacilityType.VOR)) {
      return '––––';
    }

    return VorInfoContent.FREQ_FORMATTER(facility.freqMHz * 1e6);
  });

  private readonly morseText = this.props.waypointInfoStore.facility.map(facility => {
    if (!facility || !ICAO.isFacility(facility.icao, FacilityType.VOR)) {
      return '–––';
    }

    return ICAO.getIdent(facility.icao).split('').map(char => MORSE_MAP[char] ?? '').join('\n');
  });

  private readonly radialText = MappedSubject.create(
    ([facility, radial]) => {
      if (!facility || !FacilityUtils.isFacilityType(facility, FacilityType.VOR) || radial.isNaN()) {
        return '';
      }

      // Magvar on VOR facilities uses positive-west convention, so we need to negate it to conform to the standard
      // positive-east convention.
      const radialRounded = Math.round(MagVar.trueToMagnetic(radial.number, -facility.magneticVariation));
      return radialRounded === 0 ? '360' : radialRounded.toString().padStart(3, '0');
    },
    this.props.waypointInfoStore.facility,
    this.props.waypointInfoStore.radial
  ).pause();

  private readonly subscriptions: Subscription[] = [
    this.hidden,
    this.classText,
    this.regionText,
    this.freqText,
    this.morseText,
    this.radialText
  ];

  /** @inheritDoc */
  public onAfterRender(): void {
    this.hidden.sub(hidden => {
      if (hidden) {
        this.radialText.pause();
      } else {
        this.radialText.resume();
      }
    }, true);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={{ 'waypoint-info-info-vor': true, 'hidden': this.hidden }}>
        <div class='waypoint-info-info-vor-class'>{this.classText}</div>
        <div class='waypoint-info-info-vor-region'>{this.regionText}</div>
        <div class='waypoint-info-info-tuning'>
          <div class='waypoint-info-info-freq'>{this.freqText}{G3XSpecialChar.Megahertz}</div>
          <div class='waypoint-info-info-morse'>{this.morseText}</div>
        </div>
        <div class='waypoint-info-info-vor-radial'>Radial {this.radialText}°</div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}

/**
 * An NDB information content display.
 */
class NdbInfoContent extends DisplayComponent<WaypointInfoContentProps> {
  private static readonly FREQ_FORMATTER = NumberFormatter.create({ precision: 0.1, forceDecimalZeroes: false });

  private readonly hidden = this.props.show.map(SubscribableMapFunctions.not());

  private readonly typeText = this.props.waypointInfoStore.facility.map(facility => {
    if (!facility || !FacilityUtils.isFacilityType(facility, FacilityType.NDB)) {
      return '––––';
    }

    switch (facility.type) {
      case NdbType.CompassPoint:
        return 'Compass Locator';
      // TODO: Need to confirm what the description is for non-compass locator NDBs.
      case NdbType.MH:
        return 'Medium Homing';
      case NdbType.H:
        return 'Homing';
      case NdbType.HH:
        return 'High Homing';
      default:
        return '––––';
    }
  });

  private readonly regionText = this.props.waypointInfoStore.region.map(region => region === undefined ? '––––' : region);

  private readonly freqText = this.props.waypointInfoStore.facility.map(facility => {
    if (!facility || !FacilityUtils.isFacilityType(facility, FacilityType.NDB)) {
      return '––––';
    }

    return NdbInfoContent.FREQ_FORMATTER(facility.freqMHz);
  });

  private readonly morseText = this.props.waypointInfoStore.facility.map(facility => {
    if (!facility || !ICAO.isFacility(facility.icao, FacilityType.NDB)) {
      return '';
    }

    return ICAO.getIdent(facility.icao).split('').map(char => MORSE_MAP[char] ?? '').join('\n');
  });

  private readonly subscriptions: Subscription[] = [
    this.hidden,
    this.typeText,
    this.regionText,
    this.freqText,
    this.morseText
  ];

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={{ 'waypoint-info-info-ndb': true, 'hidden': this.hidden }}>
        <div class='waypoint-info-info-ndb-type'>{this.typeText}</div>
        <div class='waypoint-info-info-ndb-region'>{this.regionText}</div>
        <div class='waypoint-info-info-tuning'>
          <div class='waypoint-info-info-freq'>{this.freqText}{G3XSpecialChar.Kilohertz}</div>
          <div class='waypoint-info-info-morse'>{this.morseText}</div>
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}

/**
 * An intersection information content display.
 */
class IntersectionInfoContent extends DisplayComponent<WaypointInfoContentProps> {
  private readonly hidden = this.props.show.map(SubscribableMapFunctions.not());

  private readonly regionText = this.props.waypointInfoStore.region.map(region => region === undefined ? '––––' : region);

  private readonly subscriptions: Subscription[] = [
    this.hidden,
    this.regionText
  ];

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={{ 'waypoint-info-info-int': true, 'hidden': this.hidden }}>
        <div class='waypoint-info-info-int-region'>{this.regionText}</div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}

/**
 * A user waypoint information content display.
 */
class UserWaypointInfoContent extends DisplayComponent<WaypointInfoContentProps> {
  private readonly hidden = this.props.show.map(SubscribableMapFunctions.not());

  private readonly subscriptions: Subscription[] = [
    this.hidden
  ];

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={{ 'waypoint-info-info-user': true, 'hidden': this.hidden }}>
        <div class='waypoint-info-info-user-elevation'>–––– MSL</div>
        <div class='waypoint-info-info-user-region'>––––</div>
        <div class='waypoint-info-info-user-time'>––––</div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}