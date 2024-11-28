import {
  CompiledMapSystem, FSComponent, MapIndexedRangeModule, MapSystemBuilder, ReadonlyFloat64Array, Subscription,
  UserSettingManager, VNode, Vec2Math, Vec2Subject
} from '@microsoft/msfs-sdk';

import { GarminMapKeys, MapOrientation, MapRangeController, TrafficSystem } from '@microsoft/msfs-garminsdk';

import { MfdMainPageKeys } from '../../../../../../MFD/MainView/MfdMainPageKeys';
import { AvionicsStatusChangeEvent, AvionicsStatusEvents } from '../../../../../../Shared/AvionicsStatus/AvionicsStatusEvents';
import { AvionicsStatus } from '../../../../../../Shared/AvionicsStatus/AvionicsStatusTypes';
import { G3XNavMapBuilder } from '../../../../../../Shared/Components/Map/Assembled/G3XNavMapBuilder';
import { MapConfig } from '../../../../../../Shared/Components/Map/MapConfig';
import { TouchButton } from '../../../../../../Shared/Components/TouchButton/TouchButton';
import { G3XFplSourceDataProvider } from '../../../../../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { DisplayUserSettingTypes } from '../../../../../../Shared/Settings/DisplayUserSettings';
import { G3XTrafficUserSettings } from '../../../../../../Shared/Settings/G3XTrafficUserSettings';
import { G3XUnitsUserSettings } from '../../../../../../Shared/Settings/G3XUnitsUserSettings';
import { GduUserSettingTypes } from '../../../../../../Shared/Settings/GduUserSettings';
import { MapUserSettings } from '../../../../../../Shared/Settings/MapUserSettings';
import { UiViewKeys } from '../../../../../../Shared/UiSystem/UiViewKeys';
import { AbstractPfdInset } from '../../AbstractPfdInset';
import { PfdInsetProps } from '../../PfdInset';
import { PfdInsetSizeMode } from '../../PfdInsetTypes';

import './PfdMapInset.css';

/**
 * Component props for PfdMapInset.
 */
export interface PfdMapInsetProps extends PfdInsetProps {
  /** The traffic system used by the inset to display traffic, or `null` if there is no traffic system. */
  trafficSystem: TrafficSystem | null;

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
 * A PFD map inset.
 */
export class PfdMapInset extends AbstractPfdInset<PfdMapInsetProps> {
  private static readonly DEFAULT_RANGE_INDEX = 7; // 0.8 nautical miles

  private readonly mapSize = Vec2Subject.create(Vec2Math.create(100, 100));

  private readonly buttonRef = FSComponent.createRef<TouchButton>();

  private readonly compiledMap = MapSystemBuilder.create(this.props.uiService.bus)
    .with(G3XNavMapBuilder.build, {
      gduFormat: this.props.uiService.gduFormat,

      // Both left and right insets can use the same bing ID because only one of them can be shown at a time. They can
      // also use the same ID as the PFD pane map because the PFD pane map and insets can't be visible at the same time.
      bingId: `g3x-${this.props.uiService.gduIndex}-map-2`,

      dataUpdateFreq: 30,

      gduIndex: this.props.uiService.gduIndex,
      gduSettingManager: this.props.gduSettingManager,

      projectedRange: 60,
      targetOffsets: {
        [MapOrientation.TrackUp]: Vec2Math.create(0, 0.27),
        [MapOrientation.DtkUp]: Vec2Math.create(0, 0.27)
      },

      airplaneIconSrc: this.props.mapConfig.ownAirplaneIconSrc,

      flightPlanner: this.props.fplSourceDataProvider.flightPlanner,
      lnavIndex: this.props.fplSourceDataProvider.lnavIndex,
      vnavIndex: this.props.fplSourceDataProvider.vnavIndex,

      trafficSystem: this.props.trafficSystem ?? undefined,
      trafficIconOptions: {
        iconSize: 30,
        fontSize: 14
      },

      includeOrientationToggle: false,
      includeDragPan: false,

      rangeTargetControlGroup: this.props.side === 'left' ? 'bottom-left' : 'bottom-right',

      settingManager: MapUserSettings.getStandardManager(this.props.uiService.bus),
      trafficSettingManager: G3XTrafficUserSettings.getManager(this.props.uiService.bus),
      unitsSettingManager: G3XUnitsUserSettings.getManager(this.props.uiService.bus),

      useRangeUserSettingByDefault: false
    })
    .withProjectedSize(this.mapSize)
    .build('pfd-map-inset-nav-map') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;
      },
      any,
      {
        /** The range controller. */
        [GarminMapKeys.Range]: MapRangeController;
      },
      any
    >;

  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);

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
    this.mapRangeController.setRangeIndex(PfdMapInset.DEFAULT_RANGE_INDEX);
  }

  /**
   * Responds to when a user touches this inset's map.
   */
  private onMapTouched(): void {
    this.props.uiService.openMfdPane();
    this.props.uiService.resetMfdToPage(UiViewKeys.MfdMain);
    this.props.uiService.selectMfdMainPage(MfdMainPageKeys.Map);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <TouchButton
        ref={this.buttonRef}
        onPressed={this.onMapTouched.bind(this)}
        class='pfd-map-inset'
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