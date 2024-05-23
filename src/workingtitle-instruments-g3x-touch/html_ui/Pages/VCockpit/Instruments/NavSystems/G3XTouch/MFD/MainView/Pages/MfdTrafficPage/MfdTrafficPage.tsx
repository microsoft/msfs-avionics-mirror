import {
  CompiledMapSystem, FSComponent, MapIndexedRangeModule, MapSystemBuilder, ReadonlyFloat64Array, Subscription, UserSettingManager,
  VNode, Vec2Math, Vec2Subject, VecNMath, VecNSubject
} from '@microsoft/msfs-sdk';

import { GarminMapKeys, TrafficMapRangeController, TrafficSystem } from '@microsoft/msfs-garminsdk';

import { AvionicsStatusChangeEvent, AvionicsStatusEvents } from '../../../../Shared/AvionicsStatus/AvionicsStatusEvents';
import { AvionicsStatus } from '../../../../Shared/AvionicsStatus/AvionicsStatusTypes';
import { G3XTrafficMapBuilder } from '../../../../Shared/Components/Map/Assembled/G3XTrafficMapBuilder';
import { MapConfig } from '../../../../Shared/Components/Map/MapConfig';
import { G3XTrafficSystemSource } from '../../../../Shared/Components/Map/Modules/G3XMapTrafficModule';
import { G3XFplSourceDataProvider } from '../../../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { G3XTouchFilePaths } from '../../../../Shared/G3XTouchFilePaths';
import { DisplayUserSettingTypes } from '../../../../Shared/Settings/DisplayUserSettings';
import { G3XTrafficUserSettings } from '../../../../Shared/Settings/G3XTrafficUserSettings';
import { G3XUnitsUserSettings } from '../../../../Shared/Settings/G3XUnitsUserSettings';
import { GduUserSettingTypes } from '../../../../Shared/Settings/GduUserSettings';
import { UiInteractionEvent } from '../../../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../../../Shared/UiSystem/UiKnobTypes';
import { UiViewLifecyclePolicy, UiViewStackLayer } from '../../../../Shared/UiSystem/UiViewTypes';
import { AbstractMfdPage } from '../../../PageNavigation/AbstractMfdPage';
import { MfdPageProps } from '../../../PageNavigation/MfdPage';
import { MfdPageSizeMode } from '../../../PageNavigation/MfdPageTypes';
import { MfdTrafficOptionsPopup } from './MfdTrafficOptionsPopup';

import './MfdTrafficPage.css';

/**
 * Component props for MfdTrafficPage.
 */
export interface MfdTrafficPageProps extends MfdPageProps {
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
 * UI view keys for popups owned by the MFD traffic page.
 */
enum MfdTrafficPagePopupKeys {
  TrafficOptions = 'MfdTrafficPageOptions'
}

/**
 * An MFD traffic page.
 */
export class MfdTrafficPage extends AbstractMfdPage<MfdTrafficPageProps> {
  private static readonly DEFAULT_RANGE_INDEX = 2; // 2 nautical miles

  private readonly mapSize = Vec2Subject.create(Vec2Math.create(100, 100));
  private readonly targetOffset = Vec2Subject.create(Vec2Math.create());
  private readonly rangeEndpoints = VecNSubject.create(VecNMath.create(4, 0.5, 0.5, 0.5, 0));

  private readonly trafficSettingManager = G3XTrafficUserSettings.getManager(this.props.uiService.bus);

  private readonly compiledMap = MapSystemBuilder.create(this.props.uiService.bus)
    .with(G3XTrafficMapBuilder.build, {
      gduFormat: this.props.uiService.gduFormat,

      trafficSystem: this.props.trafficSystem,
      trafficSource: this.props.trafficSource,

      dataUpdateFreq: 30,

      gduIndex: this.props.uiService.instrumentIndex,
      gduSettingManager: this.props.gduSettingManager,

      targetOffset: this.targetOffset,
      rangeEndpoints: this.rangeEndpoints,

      trafficIconOptions: {
        iconSize: 52,
        fontSize: 24
      },

      rangeRingOptions: {
        outerLabelRadial: -45,
        innerLabelRadial: -45,
        innerMinorTickSize: 0
      },

      airplaneIconSrc: this.props.mapConfig.ownAirplaneIconSrc,

      flightPlanner: this.props.fplSourceDataProvider.flightPlanner,
      lnavIndex: this.props.fplSourceDataProvider.lnavIndex,
      vnavIndex: this.props.fplSourceDataProvider.vnavIndex,

      trafficSettingManager: this.trafficSettingManager,
      unitsSettingManager: G3XUnitsUserSettings.getManager(this.props.uiService.bus)
    })
    .withProjectedSize(this.mapSize)
    .build('mfd-traffic-map') as CompiledMapSystem<
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

  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.TrafficRange);

  private avionicsStatusSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this._title.set('Traffic');
    this._iconSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_traffic.png`);

    this.props.uiService.registerMfdView(
      UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, MfdTrafficPagePopupKeys.TrafficOptions,
      (uiService, containerRef) => {
        return (
          <MfdTrafficOptionsPopup
            uiService={uiService}
            containerRef={containerRef}
          />
        );
      }
    );

    this._knobLabelState.setValue(UiKnobId.SingleInner, 'Zoom');
    this._knobLabelState.setValue(UiKnobId.LeftInner, 'Zoom');
    this._knobLabelState.setValue(UiKnobId.RightInner, 'Zoom');

    this.compiledMap.ref.instance.sleep();

    this.reset();

    this.avionicsStatusSub = this.props.uiService.bus.getSubscriber<AvionicsStatusEvents>()
      .on(`avionics_status_${this.props.uiService.instrumentIndex}`)
      .handle(this.onAvionicsStatusChanged.bind(this));
  }

  /** @inheritdoc */
  public onOpen(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.updateFromSize(sizeMode, dimensions);

    this.compiledMap.ref.instance.wake();
  }

  /** @inheritdoc */
  public onClose(): void {
    this.compiledMap.ref.instance.sleep();
  }

  /** @inheritdoc */
  public onResize(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.updateFromSize(sizeMode, dimensions);
  }

  /**
   * Updates this page's child components when the size of this page's parent UI view changes.
   * @param sizeMode The new size mode of this page.
   * @param dimensions The new dimensions of this page, as `[width, height]` in pixels.
   */
  private updateFromSize(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    // TODO: Support GDU470 (portrait)

    // Reduce height by 1 pixel to exclude the stripe at the bottom of the page that overlaps the page nav bar border.
    const mapHeight = dimensions[1] - 1;
    this.mapSize.set(dimensions[0], mapHeight);

    if (sizeMode === MfdPageSizeMode.Full) {
      this.targetOffset.set(0, 0);
      this.rangeEndpoints.set(0.5, 0.5, 0.5, 40 / mapHeight);
    } else {
      const targetYRel = 297 / mapHeight;
      this.targetOffset.set(0, targetYRel - 0.5);
      this.rangeEndpoints.set(0.5, targetYRel, 0.5, 61 / mapHeight);
    }
  }

  /** @inheritdoc */
  public onUpdate(time: number): void {
    this.compiledMap.ref.instance.update(time);
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    switch (event) {
      case UiInteractionEvent.SingleKnobInnerInc:
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.RightKnobInnerInc:
        this.changeRangeIndex(this.props.displaySettingManager.getSetting('displayKnobZoomReverse').value ? 1 : -1);
        return true;
      case UiInteractionEvent.SingleKnobInnerDec:
      case UiInteractionEvent.LeftKnobInnerDec:
      case UiInteractionEvent.RightKnobInnerDec:
        this.changeRangeIndex(this.props.displaySettingManager.getSetting('displayKnobZoomReverse').value ? -1 : 1);
        return true;
      case UiInteractionEvent.MenuPress:
        this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, MfdTrafficPagePopupKeys.TrafficOptions, false, { popupType: 'slideout-bottom-full' });
        return true;
    }

    return false;
  }

  /**
   * Changes this page's map range index.
   * @param delta The change in index to apply.
   */
  private changeRangeIndex(delta: number): void {
    this.mapRangeController.changeRangeIndex(delta);
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
    this.mapRangeController.setRangeIndex(MfdTrafficPage.DEFAULT_RANGE_INDEX);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='mfd-traffic-page'>
        <svg viewBox='-50 -50 100 100' class='mfd-traffic-page-range-background'>
          <circle cx='0' cy='0' r='50' />
        </svg>
        {this.compiledMap.map}
        <div class='ui-layered-darken' />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.compiledMap.ref.getOrDefault()?.destroy();

    this.avionicsStatusSub?.destroy();

    super.destroy();
  }
}