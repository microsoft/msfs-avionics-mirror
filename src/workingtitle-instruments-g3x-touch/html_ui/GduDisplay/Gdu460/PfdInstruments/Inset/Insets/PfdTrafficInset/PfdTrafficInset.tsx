import {
  CompiledMapSystem, FSComponent, FacilityLoader, MapSystemBuilder, ReadonlyFloat64Array, Subscription,
  UserSettingManager, VNode, Vec2Math, Vec2Subject, VecNMath
} from '@microsoft/msfs-sdk';

import { GarminMapKeys, TrafficMapRangeController, TrafficSystem } from '@microsoft/msfs-garminsdk';

import { MfdMainPageKeys } from '../../../../../../MFD/MainView/MfdMainPageKeys';
import { AvionicsStatusChangeEvent, AvionicsStatusEvents } from '../../../../../../Shared/AvionicsStatus/AvionicsStatusEvents';
import { AvionicsStatus } from '../../../../../../Shared/AvionicsStatus/AvionicsStatusTypes';
import { G3XTrafficMapBuilder } from '../../../../../../Shared/Components/Map/Assembled/G3XTrafficMapBuilder';
import { MapConfig } from '../../../../../../Shared/Components/Map/MapConfig';
import { G3XTrafficSystemSource } from '../../../../../../Shared/Components/Map/Modules/G3XMapTrafficModule';
import { TouchButton } from '../../../../../../Shared/Components/TouchButton/TouchButton';
import { G3XFplSourceDataProvider } from '../../../../../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { DisplayUserSettingTypes } from '../../../../../../Shared/Settings/DisplayUserSettings';
import { G3XTrafficUserSettings } from '../../../../../../Shared/Settings/G3XTrafficUserSettings';
import { G3XUnitsUserSettings } from '../../../../../../Shared/Settings/G3XUnitsUserSettings';
import { GduUserSettingTypes } from '../../../../../../Shared/Settings/GduUserSettings';
import { UiViewKeys } from '../../../../../../Shared/UiSystem/UiViewKeys';
import { AbstractPfdInset } from '../../AbstractPfdInset';
import { PfdInsetProps } from '../../PfdInset';
import { PfdInsetSizeMode } from '../../PfdInsetTypes';

import './PfdTrafficInset.css';

/**
 * Component props for PfdTrafficInset.
 */
export interface PfdTrafficInsetProps extends PfdInsetProps {
  /** A facility loader. */
  facLoader: FacilityLoader;

  /** The traffic system used by the map. */
  trafficSystem: TrafficSystem;

  /** The traffic data source used by the traffic system. */
  trafficSource: G3XTrafficSystemSource;

  /** A provider of flight plan source data. */
  fplSourceDataProvider: G3XFplSourceDataProvider;

  /** A manager for GDU user settings. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;

  /** A manager for display user settings. */
  displaySettingManager: UserSettingManager<DisplayUserSettingTypes>;

  /** A configuration object defining options for the map. */
  mapConfig: MapConfig;
}

/**
 * A PFD traffic inset.
 */
export class PfdTrafficInset extends AbstractPfdInset<PfdTrafficInsetProps> {
  private static readonly DEFAULT_RANGE_INDEX = 2; // 2 nautical miles

  private readonly mapSize = Vec2Subject.create(Vec2Math.create(100, 100));

  private readonly buttonRef = FSComponent.createRef<TouchButton>();

  private readonly trafficSettingManager = G3XTrafficUserSettings.getManager(this.props.uiService.bus);

  private readonly compiledMap = MapSystemBuilder.create(this.props.uiService.bus)
    .with(G3XTrafficMapBuilder.buildInset, {
      gduFormat: this.props.uiService.gduFormat,

      facilityLoader: this.props.facLoader,

      trafficSystem: this.props.trafficSystem,
      trafficSource: this.props.trafficSource,

      dataUpdateFreq: 30,

      gduIndex: this.props.uiService.instrumentIndex,
      gduSettingManager: this.props.gduSettingManager,

      targetOffset: Vec2Math.create(0, 0.07),
      rangeEndpoints: VecNMath.create(4, 0.5, 0.57, 0.5, 0.2),

      trafficIconOptions: {
        iconSize: 30,
        fontSize: 18
      },

      rangeRingOptions: {
        outerStrokeDash: [5, 5],
        innerStrokeDash: [5, 5],
        outerLabelRadial: -45,
        innerLabelRadial: -45,
        innerMinorTickSize: 0
      },

      airplaneIconSrc: this.props.mapConfig.ownAirplaneIconSrc,

      flightPlanner: this.props.fplSourceDataProvider.flightPlanner,
      lnavIndex: this.props.fplSourceDataProvider.lnavIndex,
      vnavIndex: this.props.fplSourceDataProvider.vnavIndex,

      trafficSettingManager: this.trafficSettingManager,
      unitsSettingManager: G3XUnitsUserSettings.getManager(this.props.uiService.bus),

      rangeControlGroup: this.props.side === 'left' ? 'bottom-left' : 'bottom-right'
    })
    .withProjectedSize(this.mapSize)
    .build('pfd-traffic-inset-map') as CompiledMapSystem<
      any,
      any,
      {
        /** The range controller. */
        [GarminMapKeys.TrafficRange]: TrafficMapRangeController;
      },
      any
    >;

  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.TrafficRange);

  private avionicsStatusSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.compiledMap.ref.instance.sleep();

    this.reset();

    this.avionicsStatusSub = this.props.uiService.bus.getSubscriber<AvionicsStatusEvents>()
      .on(`avionics_status_${this.props.uiService.instrumentIndex}`)
      .handle(this.onAvionicsStatusChanged.bind(this));
  }

  /** @inheritdoc */
  public onOpen(sizeMode: PfdInsetSizeMode, dimensions: ReadonlyFloat64Array): void {
    // Subtract border width from dimensions.
    this.mapSize.set(dimensions[0] - 6, dimensions[1] - 6);

    this.compiledMap.ref.instance.wake();
  }

  /** @inheritdoc */
  public onClose(): void {
    this.compiledMap.ref.instance.sleep();
  }

  /** @inheritdoc */
  public onResize(sizeMode: PfdInsetSizeMode, dimensions: ReadonlyFloat64Array): void {
    // Subtract border width from dimensions.
    this.mapSize.set(dimensions[0] - 6, dimensions[1] - 6);
  }

  /** @inheritdoc */
  public onUpdate(time: number): void {
    this.compiledMap.ref.instance.update(time);
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
    this.mapRangeController.setRangeIndex(PfdTrafficInset.DEFAULT_RANGE_INDEX);
  }

  /**
   * Responds to when a user touches this inset's map.
   */
  private onMapTouched(): void {
    this.props.uiService.openMfdPane();
    this.props.uiService.resetMfdToPage(UiViewKeys.MfdMain);
    this.props.uiService.selectMfdMainPage(MfdMainPageKeys.Traffic);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <TouchButton
        ref={this.buttonRef}
        onPressed={this.onMapTouched.bind(this)}
        class='pfd-traffic-inset'
      >
        {this.compiledMap.map}
      </TouchButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.compiledMap.ref.getOrDefault()?.destroy();
    this.buttonRef.getOrDefault()?.destroy();

    this.avionicsStatusSub?.destroy();

    super.destroy();
  }
}