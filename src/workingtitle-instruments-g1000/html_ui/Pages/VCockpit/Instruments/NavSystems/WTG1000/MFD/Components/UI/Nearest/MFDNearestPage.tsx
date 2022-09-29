import {
  CompiledMapSystem, Consumer, ControlPublisher, EventBus, EventSubscriber, Facility, FacilityLoader, FocusPosition, FSComponent, GeoPoint, GNSSEvents,
  MapIndexedRangeModule, MapSystemBuilder, MathUtils, NearestSubscription, Vec2Math, VecNMath, VNode
} from 'msfssdk';

import {
  Fms, GarminFacilityWaypointCache, GarminMapKeys, MapPointerController, MapPointerInfoLayerSize, MapPointerModule, MapRangeController,
  MapWaypointHighlightModule, TrafficAdvisorySystem, TrafficUserSettings, UnitsUserSettings
} from 'garminsdk';

import { MapBuilder } from '../../../../Shared/Map/MapBuilder';
import { MapUserSettings } from '../../../../Shared/Map/MapUserSettings';
import { MapWaypointIconImageCache } from '../../../../Shared/Map/MapWaypointIconImageCache';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { G1000UiControl } from '../../../../Shared/UI/G1000UiControl';
import { MenuSystem } from '../../../../Shared/UI/Menus/MenuSystem';
import { UiPageProps } from '../../../../Shared/UI/UiPage';
import { MFDUiPage } from '../MFDUiPage';
import { MFDViewService } from '../MFDViewService';
import { FacilitiesGroup } from './FacilitiesGroup';

/** The properties on the flight plan popout component. */
export interface MFDNearestPageProps extends UiPageProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** An FMS state manager. */
  fms: Fms;

  /** The MenuSystem. */
  menuSystem: MenuSystem;

  /** A facility loader. */
  loader: FacilityLoader;

  /** A ControlPublisher */
  publisher: ControlPublisher;

  /** The G1000 traffic advisory system. */
  tas: TrafficAdvisorySystem;

  /** The MFD view service. */
  viewService: MFDViewService;
}

/**
 * A component that display a list of the nearest facilities with accompanying information
 * and a map indicating the facilities location.
 */
export abstract class MFDNearestPage<T extends Facility, P extends MFDNearestPageProps = MFDNearestPageProps> extends MFDUiPage<P> {
  private static readonly UPDATE_FREQ = 30; // Hz

  private gps: EventSubscriber<GNSSEvents>;
  private consumer: Consumer<LatLongAlt>;

  protected readonly unitsSettingManager = UnitsUserSettings.getManager(this.props.bus);

  protected readonly uiRoot = FSComponent.createRef<G1000UiControl>();
  protected readonly facilitiesGroup = FSComponent.createRef<FacilitiesGroup<T>>();

  protected readonly data = this.buildNearestSubscription();

  private readonly locGeoPoint: GeoPoint;

  private readonly mapSettingManager = MapUserSettings.getMfdManager(this.props.bus);

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(MapBuilder.nearestMap, {
      bingId: 'mfd-page-map',
      dataUpdateFreq: MFDNearestPage.UPDATE_FREQ,

      waypointIconImageCache: MapWaypointIconImageCache.getCache(),

      rangeRingOptions: {
        showLabel: true
      },

      flightPlanner: this.props.fms.flightPlanner,

      ...MapBuilder.ownAirplaneIconOptions(),

      trafficSystem: this.props.tas,
      trafficIconOptions: {
        iconSize: 30,
        font: 'Roboto-Bold',
        fontSize: 16
      },

      pointerBoundsOffset: VecNMath.create(4, 0.1, 0.1, 0.1, 0.1),
      pointerInfoSize: MapPointerInfoLayerSize.Full,

      miniCompassImgSrc: MapBuilder.miniCompassIconSrc(),

      settingManager: this.mapSettingManager as any,
      unitsSettingManager: this.unitsSettingManager,
      trafficSettingManager: TrafficUserSettings.getManager(this.props.bus) as any
    })
    .withProjectedSize(Vec2Math.create(578, 734))
    .withDeadZone(VecNMath.create(4, 0, 56, 0, 0))
    .withClockUpdate(MFDNearestPage.UPDATE_FREQ)
    .build('mfd-navmap') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;

        /** The pointer module. */
        [GarminMapKeys.WaypointHighlight]: MapWaypointHighlightModule;

        /** The pointer module. */
        [GarminMapKeys.Pointer]: MapPointerModule;
      },
      any,
      {
        /** The range controller. */
        [GarminMapKeys.Range]: MapRangeController;

        /** The pointer controller. */
        [GarminMapKeys.Pointer]: MapPointerController;
      },
      any
    >;

  private readonly mapRangeModule = this.compiledMap.context.model.getModule(GarminMapKeys.Range);
  private readonly mapHighlightModule = this.compiledMap.context.model.getModule(GarminMapKeys.WaypointHighlight);
  private readonly mapPointerModule = this.compiledMap.context.model.getModule(GarminMapKeys.Pointer);

  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);
  private readonly mapPointerController = this.compiledMap.context.getController(GarminMapKeys.Pointer);

  /**
   * Creates an instance of a nearest facilities page.
   * @param props The props.
   */
  constructor(props: P) {
    super(props);

    this.gps = this.props.bus.getSubscriber<GNSSEvents>();
    this.consumer = this.gps.on('gps-position').atFrequency(1);
    this.locGeoPoint = new GeoPoint(0, 0);
  }

  /** @inheritdoc */
  public onViewOpened(): void {
    super.onViewOpened();

    this.props.viewService.clearPageHistory();

    this.consumer.handle(this.onGps);
    this.compiledMap.ref.instance.wake();
  }

  /** @inheritdoc */
  public onViewClosed(): void {
    super.onViewClosed();

    this.uiRoot.instance.blur();
    this.consumer.off(this.onGps);
    this.compiledMap.ref.instance.sleep();
  }

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);
    this.data.start().then(() => this.setFilter());
  }

  /** @inheritdoc */
  public processHEvent(evt: FmsHEvent): boolean {
    const selectedGroup = this.getSelectedGroup();

    switch (evt) {
      case FmsHEvent.UPPER_PUSH:
        if (!selectedGroup.isFocused) {
          selectedGroup.focus(FocusPosition.MostRecent);
          this.setScrollEnabled(true);
        } else {
          selectedGroup.blur();
          this.setScrollEnabled(false);
        }

        return true;
      case FmsHEvent.RANGE_DEC:
        this.changeMapRangeIndex(-1);
        return true;
      case FmsHEvent.RANGE_INC:
        this.changeMapRangeIndex(1);
        return true;
    }

    if (this.uiRoot.instance.isFocused && this.uiRoot.instance.onInteractionEvent(evt)) {
      return true;
    }

    return super.processHEvent(evt);
  }

  /**
   * Changes the MFD map range index setting.
   * @param delta The change in index to apply.
   */
  private changeMapRangeIndex(delta: number): void {
    const currentIndex = this.mapRangeModule.nominalRangeIndex.get();
    const newIndex = MathUtils.clamp(currentIndex + delta, 0, this.mapRangeModule.nominalRanges.get().length - 1);

    if (newIndex !== currentIndex) {
      this.mapPointerController.targetPointer();
      this.mapRangeController.setRangeIndex(newIndex);
    }
  }

  /** Gets the title that should be displayed above the facility selection group. */
  protected abstract getFacilityGroupTitle(): string;

  /** Gets the class to add to the page display for the groups. */
  protected abstract getPageClass(): string;

  /** Gets the currently selected focus control group from the page. */
  protected abstract getSelectedGroup(): G1000UiControl;

  /** Builds a nearest subscription applicable for this nearest facilities page. */
  protected abstract buildNearestSubscription(): NearestSubscription<T>;

  /** Renders the other groups to display on the page. */
  protected abstract renderGroups(): VNode;

  /** Gets the icon for a given facility. */
  protected abstract getIconSource(facility: Facility): string;

  /** Sets the filter on the nearest subscription, if any. */
  protected setFilter(): void { /* virtual */ }

  /**
   * A callback called when a facility is selected from the nearest facilities group.
   * @param facility The facility that was selected.
   */
  protected onFacilitySelected(facility: T | null): void {
    if (facility !== null) {
      this.mapHighlightModule.waypoint.set(GarminFacilityWaypointCache.getCache(this.props.bus).get(facility));
    } else {
      this.mapHighlightModule.waypoint.set(null);
    }
  }

  /**
   * Handle a GPS update.
   * @param pos The current LatLongAlt
   */
  private onGps = (pos: LatLongAlt): void => {
    this.locGeoPoint.set(pos.lat, pos.long);
    this.facilitiesGroup.getOrDefault()?.update(this.locGeoPoint);
  };

  /**
   * Render the component.
   * @returns a VNode
   */
  public render(): VNode {
    return (
      <div class="mfd-page" ref={this.viewContainerRef}>
        {this.compiledMap.map}
        <div class={`mfd-dark-background ${this.getPageClass()}`}>
          <G1000UiControl ref={this.uiRoot} innerKnobScroll>
            <FacilitiesGroup<T>
              viewService={this.props.viewService}
              ref={this.facilitiesGroup}
              unitsSettingManager={this.unitsSettingManager}
              data={this.data}
              title={this.getFacilityGroupTitle()}
              onSelected={this.onFacilitySelected.bind(this)}
              iconSource={this.getIconSource.bind(this)}
              isolateScroll />
            {this.renderGroups()}
          </G1000UiControl>
        </div>
      </div>
    );
  }
}
