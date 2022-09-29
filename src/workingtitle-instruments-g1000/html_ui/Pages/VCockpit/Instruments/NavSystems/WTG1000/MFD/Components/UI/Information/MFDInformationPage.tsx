import {
  CompiledMapSystem, ControlPublisher, EventBus, FacilityLoader, FocusPosition, FSComponent, ICAO, MapIndexedRangeModule, MapSystemBuilder, MathUtils, Subject,
  Vec2Math, VecNMath, VNode, Waypoint
} from 'msfssdk';

import {
  Fms, GarminMapKeys, MapPointerController, MapPointerInfoLayerSize, MapPointerModule, MapRangeController, MapWaypointHighlightModule, UnitsUserSettings
} from 'garminsdk';

import { MapBuilder } from '../../../../Shared/Map/MapBuilder';
import { MapUserSettings } from '../../../../Shared/Map/MapUserSettings';
import { MapWaypointIconImageCache } from '../../../../Shared/Map/MapWaypointIconImageCache';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { G1000UiControl } from '../../../../Shared/UI/G1000UiControl';
import { MenuSystem } from '../../../../Shared/UI/Menus/MenuSystem';
import { UiPageProps } from '../../../../Shared/UI/UiPage';
import { MFDUiPage } from '../MFDUiPage';
import { FacilityGroup } from './FacilityGroup';

import './MFDInformationPage.css';

/** The properties on the flight plan popout component. */
export interface MFDInformationPageProps extends UiPageProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** An FMS state manager. */
  fms: Fms;

  /** A facility loader. */
  facilityLoader: FacilityLoader;

  /** The MenuSystem. */
  menuSystem: MenuSystem;

  /** A control system publisher. */
  controlPublisher: ControlPublisher;
}

/**
 * A component that displays a list of the nearest facilities with accompanying information
 * and a map indicating the facilities location.
 */
export abstract class MFDInformationPage extends MFDUiPage<MFDInformationPageProps> {
  protected static readonly UPDATE_FREQ = 30; // Hz

  protected readonly unitsSettingManager = UnitsUserSettings.getManager(this.props.bus);

  protected readonly uiRoot = FSComponent.createRef<G1000UiControl>();
  protected readonly facilityGroup = FSComponent.createRef<FacilityGroup<any>>();

  protected readonly waypoint = Subject.create<Waypoint | null>(null);

  private readonly mapSettingManager = MapUserSettings.getMfdManager(this.props.bus);

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(MapBuilder.waypointMap, {
      bingId: 'mfd-page-map',
      dataUpdateFreq: MFDInformationPage.UPDATE_FREQ,

      supportAirportAutoRange: true,
      boundsOffset: VecNMath.create(4, 40, 40, 40, 40),

      waypointIconImageCache: MapWaypointIconImageCache.getCache(),

      rangeRingOptions: {
        showLabel: true
      },

      ...MapBuilder.ownAirplaneIconOptions(),

      pointerBoundsOffset: VecNMath.create(4, 0.1, 0.1, 0.1, 0.1),
      pointerInfoSize: MapPointerInfoLayerSize.Full,

      miniCompassImgSrc: MapBuilder.miniCompassIconSrc(),

      settingManager: this.mapSettingManager as any,
      unitsSettingManager: this.unitsSettingManager
    })
    .withProjectedSize(Vec2Math.create(578, 734))
    .withDeadZone(VecNMath.create(4, 0, 56, 0, 0))
    .withClockUpdate(MFDInformationPage.UPDATE_FREQ)
    .build('mfd-infomap') as CompiledMapSystem<
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

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.compiledMap.ref.instance.sleep();

    this.mapRangeController.setRangeIndex(this.getDefaultRangeIndex());

    this.waypoint.pipe(this.mapHighlightModule.waypoint);
  }

  /** Renders the other groups to display on the page. */
  protected abstract renderGroups(): VNode;

  /** Gets the class to add to the page display for the groups. */
  protected abstract getPageClass(): string;

  /** Gets the default map range index for this page. */
  protected abstract getDefaultRangeIndex(): number;

  /** @inheritdoc */
  protected onViewOpened(): void {
    super.onViewOpened();

    this.props.viewService.clearPageHistory();

    this.props.menuSystem.clear();
    this.props.menuSystem.pushMenu('navmap-root');

    this.compiledMap.ref.instance.wake();
  }

  /** @inheritdoc */
  public onViewClosed(): void {
    super.onViewClosed();

    this.uiRoot.instance.blur();
    this.compiledMap.ref.instance.sleep();

    this.mapRangeController.setRangeIndex(this.getDefaultRangeIndex());
  }

  /** @inheritdoc */
  protected onInputDataSet(icao: string | undefined): void {
    if (typeof icao === 'string' && ICAO.isFacility(icao)) {
      this.facilityGroup.instance.inputIcao.set(icao);

      this.facilityGroup.instance.focus(FocusPosition.First);
      setTimeout(() => {
        this.facilityGroup.instance.onInteractionEvent(FmsHEvent.ENT);
        this.uiRoot.instance.blur();
      });
    }
  }

  /** @inheritdoc */
  public processHEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.UPPER_PUSH:
        this.toggleScroll();
        if (!this.uiRoot.instance.isFocused) {
          this.uiRoot.instance.focus(FocusPosition.MostRecent);
        } else {
          this.uiRoot.instance.blur();
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

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="mfd-page" ref={this.viewContainerRef}>
        {this.compiledMap.map}
        <div class={`mfd-dark-background ${this.getPageClass()}`}>
          <G1000UiControl ref={this.uiRoot} isolateScroll>
            {this.renderGroups()}
          </G1000UiControl>
        </div>
      </div>
    );
  }
}