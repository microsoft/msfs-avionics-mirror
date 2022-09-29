import { CompiledMapSystem, EventBus, FlightPlanner, FSComponent, MapIndexedRangeModule, MapSystemBuilder, Vec2Math, VecNMath, VNode } from 'msfssdk';

import {
  GarminMapKeys, TrafficAdvisorySystem, TrafficAltitudeModeSetting, TrafficMapRangeController, TrafficOperatingModeSetting, TrafficUserSettings,
  UnitsUserSettings
} from 'garminsdk';

import { MapBuilder } from '../../../../Shared/Map/MapBuilder';
import { MapUserSettings } from '../../../../Shared/Map/MapUserSettings';
import { MapWaypointIconImageCache } from '../../../../Shared/Map/MapWaypointIconImageCache';
import { MenuItemDefinition } from '../../../../Shared/UI/Dialogs/PopoutMenuItem';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { MFDPageMenuDialog } from '../MFDPageMenuDialog';
import { MFDUiPage, MFDUiPageProps } from '../MFDUiPage';

import './MFDTrafficMapPage.css';

/**
 * Component props for MFDTrafficMapPage.
 */
export interface MFDTrafficMapPageProps extends MFDUiPageProps {
  /** The event bus. */
  bus: EventBus;

  /** An instance of the flight planner. */
  flightPlanner: FlightPlanner;

  /** The G1000 traffic advisory system. */
  tas: TrafficAdvisorySystem;
}

/**
 * The MFD traffic map page.
 */
export class MFDTrafficMapPage extends MFDUiPage<MFDTrafficMapPageProps> {
  private static readonly UPDATE_FREQ = 30; // Hz

  private readonly trafficSettingManager = TrafficUserSettings.getManager(this.props.bus);
  private readonly mapSettingManager = MapUserSettings.getMfdManager(this.props.bus);

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(MapBuilder.trafficMap, {
      trafficSystem: this.props.tas,

      dataUpdateFreq: MFDTrafficMapPage.UPDATE_FREQ,

      rangeEndpoints: VecNMath.create(4, 0.5, 0.5, 0.5, 0.95),

      waypointIconImageCache: MapWaypointIconImageCache.getCache(),

      trafficIconOptions: {
        iconSize: 52,
        font: 'Roboto-Bold',
        fontSize: 28
      },

      rangeRingOptions: {
        innerMinorTickSize: 0
      },

      flightPlanner: this.props.flightPlanner,

      ...MapBuilder.ownAirplaneIconOptions(false),

      miniCompassImgSrc: MapBuilder.miniCompassIconSrc(),

      trafficSettingManager: this.trafficSettingManager as any,
      mapRangeSettingManager: this.mapSettingManager as any,
      unitsSettingManager: UnitsUserSettings.getManager(this.props.bus),
    })
    .withProjectedSize(Vec2Math.create(876, 678))
    .withClockUpdate(MFDTrafficMapPage.UPDATE_FREQ)
    .build('mfd-trafficmap') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;
      },
      any,
      {
        /** The range controller. */
        [GarminMapKeys.TrafficRange]: TrafficMapRangeController;
      },
      any
    >;

  private readonly mapRangeModule = this.compiledMap.context.model.getModule(GarminMapKeys.Range);

  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.TrafficRange);

  private readonly pageMenuItems: MenuItemDefinition[] = [
    {
      id: 'tas-operate',
      renderContent: (): VNode => <span>TAS {this.trafficSettingManager.getSetting('trafficOperatingMode').value === TrafficOperatingModeSetting.Operating ? 'Standby' : 'Operate'} Mode</span>,
      action: (): void => { this.trafficSettingManager.getSetting('trafficOperatingMode').value = TrafficOperatingModeSetting.Operating; }
    },
    {
      id: 'test',
      renderContent: (): VNode => <span>Test Mode</span>,
      isEnabled: false
    },
    {
      id: 'below',
      renderContent: (): VNode => <span>Below</span>,
      action: (): void => { this.trafficSettingManager.getSetting('trafficAltitudeMode').value = TrafficAltitudeModeSetting.Below; },
      isEnabled: this.trafficSettingManager.getSetting('trafficAltitudeMode').value !== TrafficAltitudeModeSetting.Below
    },
    {
      id: 'normal',
      renderContent: (): VNode => <span>Normal</span>,
      action: (): void => { this.trafficSettingManager.getSetting('trafficAltitudeMode').value = TrafficAltitudeModeSetting.Normal; },
      isEnabled: this.trafficSettingManager.getSetting('trafficAltitudeMode').value !== TrafficAltitudeModeSetting.Normal
    },
    {
      id: 'above',
      renderContent: (): VNode => <span>Above</span>,
      action: (): void => { this.trafficSettingManager.getSetting('trafficAltitudeMode').value = TrafficAltitudeModeSetting.Above; },
      isEnabled: this.trafficSettingManager.getSetting('trafficAltitudeMode').value !== TrafficAltitudeModeSetting.Above
    },
    {
      id: 'unrestricted',
      renderContent: (): VNode => <span>Unrestricted</span>,
      action: (): void => { this.trafficSettingManager.getSetting('trafficAltitudeMode').value = TrafficAltitudeModeSetting.Unrestricted; },
      isEnabled: this.trafficSettingManager.getSetting('trafficAltitudeMode').value !== TrafficAltitudeModeSetting.Unrestricted
    },
  ];

  /** @inheritdoc */
  constructor(props: MFDTrafficMapPageProps) {
    super(props);

    this._title.set('Map – Traffic Map');
  }

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.compiledMap.ref.instance.sleep();
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.RANGE_DEC:
        this.changeMapRangeIndex(-1);
        return true;
      case FmsHEvent.RANGE_INC:
        this.changeMapRangeIndex(1);
        return true;
    }

    return super.onInteractionEvent(evt);
  }

  /**
   * Changes the MFD map range index setting.
   * @param delta The change in index to apply.
   */
  private changeMapRangeIndex(delta: 1 | -1): void {
    this.mapRangeController.changeRangeIndex(delta);
  }

  /** @inheritdoc */
  protected onViewOpened(): void {
    super.onViewOpened();

    this.props.viewService.clearPageHistory();

    this.props.menuSystem.clear();
    this.props.menuSystem.pushMenu('traffic-root');

    this.compiledMap.ref.instance.wake();
  }

  /** @inheritdoc */
  protected onViewClosed(): void {
    super.onViewClosed();

    this.compiledMap.ref.instance.sleep();
  }

  /** @inheritdoc */
  protected onMenuPressed(): boolean {
    this.props.menuSystem.pushMenu('empty');
    const pageMenu = (this.props.viewService.open('PageMenuDialog') as MFDPageMenuDialog);
    pageMenu.setMenuItems(this.pageMenuItems);
    pageMenu.onClose.on(() => { this.props.menuSystem.back(); });
    return true;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.viewContainerRef} class='mfd-page'>
        {this.compiledMap.map}
      </div>
    );
  }
}
