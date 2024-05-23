import {
  CompiledMapSystem, DebounceTimer, DurationFormatter, FSComponent, MapIndexedRangeModule, MapSystemBuilder, MathUtils, MutableSubscribable,
  MutableSubscribableInputType, NumberFormatter, NumberUnitSubject, ReadonlyFloat64Array, Subject, SubscribableMapFunctions,
  SubscribableType, Subscription, UnitType, UserSettingManager, VNode, Vec2Math, Vec2Subject
} from '@microsoft/msfs-sdk';

import {
  GarminMapKeys, MapOrientation, MapOrientationSettingMode, MapRangeController, MapTerrainSettingMode, TrafficSystem
} from '@microsoft/msfs-garminsdk';

import { G3XNumberUnitDisplay } from '../../../../Shared/Components/Common/G3XNumberUnitDisplay';
import { UiList } from '../../../../Shared/Components/List/UiList';
import { UiListFocusable } from '../../../../Shared/Components/List/UiListFocusable';
import { UiListItem } from '../../../../Shared/Components/List/UiListItem';
import { G3XNavMapBuilder } from '../../../../Shared/Components/Map/Assembled/G3XNavMapBuilder';
import { G3XMapKeys } from '../../../../Shared/Components/Map/G3XMapKeys';
import { MapConfig } from '../../../../Shared/Components/Map/MapConfig';
import { G3XMapCompassArcModule } from '../../../../Shared/Components/Map/Modules/G3XMapCompassArcModule';
import { MapOrientationOverrideModule } from '../../../../Shared/Components/Map/Modules/MapOrientationOverrideModule';
import { GenericTabbedContent } from '../../../../Shared/Components/TabbedContainer/GenericTabbedContent';
import { TabbedContainer } from '../../../../Shared/Components/TabbedContainer/TabbedContainer';
import { CombinedTouchButton } from '../../../../Shared/Components/TouchButton/CombinedTouchButton';
import { UiSetValueTouchButton } from '../../../../Shared/Components/TouchButton/UiSetValueTouchButton';
import { UiTouchButton } from '../../../../Shared/Components/TouchButton/UiTouchButton';
import { G3XFplSourceDataProvider } from '../../../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { G3XTouchFilePaths } from '../../../../Shared/G3XTouchFilePaths';
import { DisplayUserSettingTypes } from '../../../../Shared/Settings/DisplayUserSettings';
import { G3XTrafficUserSettings } from '../../../../Shared/Settings/G3XTrafficUserSettings';
import { G3XUnitsUserSettings } from '../../../../Shared/Settings/G3XUnitsUserSettings';
import { GduUserSettingTypes } from '../../../../Shared/Settings/GduUserSettings';
import { G3XMapLabelTextSizeSettingMode, G3XMapTrackVectorSettingMode, MapUserSettings } from '../../../../Shared/Settings/MapUserSettings';
import { AbstractUiView } from '../../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../../Shared/UiSystem/UiInteraction';
import { UiKnobUtils } from '../../../../Shared/UiSystem/UiKnobUtils';
import { UiViewProps } from '../../../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../../../Shared/UiSystem/UiViewKeys';
import { UiViewSizeMode, UiViewStackLayer } from '../../../../Shared/UiSystem/UiViewTypes';
import { MapRangeSettingSelectButton, MapRangeSettingSelectButtonListParams } from '../../../Components/TouchButton/MapRangeSettingSelectButton';
import { UiListSelectTouchButton } from '../../../Components/TouchButton/UiListSelectTouchButton';
import { UiGenericNumberUnitDialog } from '../../../Dialogs/UiGenericNumberUnitDialog';
import { UiListDialogParams } from '../../../Dialogs/UiListDialog';

import './MfdMapSetupPopup.css';

/**
 * Component props for MfdMapSetupPopup.
 */
export interface MfdMapSetupPopupProps extends UiViewProps {
  /** The traffic system used by the popup's map to display traffic, or `null` if there is no traffic system. */
  trafficSystem: TrafficSystem | null;

  /** A provider of flight plan source data. */
  fplSourceDataProvider: G3XFplSourceDataProvider;

  /** A manager for GDU user settings. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;

  /** A manager for display user settings. */
  displaySettingManager: UserSettingManager<DisplayUserSettingTypes>;

  /** A configuration object defining options for the map. */
  mapConfig: MapConfig;

  /** A mutable subscribable with which to sync the popup's map orientation override value. */
  mapOrientationOverride: MutableSubscribable<MapOrientation | null>;
}

/**
 * An MFD map setup menu.
 */
export class MfdMapSetupPopup extends AbstractUiView<MfdMapSetupPopupProps> {
  private static readonly MAP_RESIZE_HIDE_DURATION = 250; // milliseconds

  private readonly tabbedContainerRef = FSComponent.createRef<TabbedContainer>();

  private readonly mapSize = Vec2Subject.create(Vec2Math.create(100, 100));

  private readonly mapTrackUpTargetOffset = Vec2Subject.create(Vec2Math.create());

  private readonly mapCompassArcAngularWidth = Subject.create(70);
  private readonly mapCompassArcTopMargin = Subject.create(40);

  private readonly mapSettingManager = MapUserSettings.getStandardManager(this.props.uiService.bus);
  private readonly unitsSettingManager = G3XUnitsUserSettings.getManager(this.props.uiService.bus);

  private readonly compiledMap = MapSystemBuilder.create(this.props.uiService.bus)
    .with(G3XNavMapBuilder.build, {
      gduFormat: this.props.uiService.gduFormat,

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

      // TODO: Support GDU470 (portrait)
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

      trafficSystem: this.props.trafficSystem ?? undefined,
      trafficIconOptions: {
        iconSize: 30,
        fontSize: 14
      },

      includeOrientationToggle: true,
      includeDragPan: false,

      settingManager: this.mapSettingManager,
      trafficSettingManager: G3XTrafficUserSettings.getManager(this.props.uiService.bus),
      unitsSettingManager: this.unitsSettingManager
    })
    .withProjectedSize(this.mapSize)
    .build('common-map mfd-map-setup-nav-map') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;

        /** The orientation override module. */
        [G3XMapKeys.OrientationOverride]: MapOrientationOverrideModule;

        /** The compass arc module. */
        [G3XMapKeys.CompassArc]: G3XMapCompassArcModule;
      },
      any,
      {
        /** The range controller. */
        [GarminMapKeys.Range]: MapRangeController;
      },
      any
    >;

  private readonly mapOrientationOverrideModule = this.compiledMap.context.model.getModule(G3XMapKeys.OrientationOverride);
  private readonly mapCompassArcModule = this.compiledMap.context.model.getModule(G3XMapKeys.CompassArc);

  private readonly mapHiddenDebounce = new DebounceTimer();
  private readonly mapHidden = Subject.create(false);
  private readonly showMapFunc = this.mapHidden.set.bind(this.mapHidden, false);

  private readonly tabLength = this.props.uiService.gduFormat === '460' ? 152 : 76;
  private readonly tabSpacing = Subject.create(0);

  private readonly listKnobIds = this.props.uiService.validKnobIds.filter(knobId => UiKnobUtils.isInnerKnobId(knobId));
  private readonly listItemsPerPage = Subject.create(5);
  private readonly listItemLength = this.props.uiService.gduFormat === '460' ? 113 : 60;
  private readonly listItemSpacing = Subject.create(0);

  private readonly subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public onAfterRender(): void {
    this.tabbedContainerRef.instance.knobLabelState.pipe(this._knobLabelState);

    this.subscriptions.push(
      this.props.mapOrientationOverride.pipe(this.mapOrientationOverrideModule.orientationOverride),
      this.mapOrientationOverrideModule.orientationOverride.pipe(this.props.mapOrientationOverride)
    );
  }

  /** @inheritdoc */
  public onOpen(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.updateFromSize(sizeMode, dimensions);

    this.compiledMap.ref.instance.wake();
    this.tabbedContainerRef.instance.selectFirstTab();
    this.tabbedContainerRef.instance.open();
  }

  /** @inheritdoc */
  public onClose(): void {
    this.compiledMap.ref.instance.sleep();
    this.tabbedContainerRef.instance.close();

    this.mapHiddenDebounce.clear();
    this.mapHidden.set(true);
  }

  /** @inheritdoc */
  public onResume(): void {
    this.tabbedContainerRef.instance.resume();
  }

  /** @inheritdoc */
  public onPause(): void {
    this.tabbedContainerRef.instance.pause();
  }

  /** @inheritdoc */
  public onResize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.updateFromSize(sizeMode, dimensions);
  }

  /**
   * Updates this popup's child components when the size of this popup's container changes.
   * @param sizeMode The size mode of this popup's container.
   * @param dimensions The dimensions of this popup's container, as `[width, height]` in pixels.
   */
  private updateFromSize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    // TODO: Support GDU470 (portrait)

    let tabListLength: number;

    if (sizeMode === UiViewSizeMode.Full) {
      // Map is rendered to the left of the tabs, at 50% width (minus margin) and full height (minus title bar and margin).
      this.mapSize.set(dimensions[0] * 0.5 - 6, dimensions[1] - 60);

      this.mapTrackUpTargetOffset.set(0, 0.25);

      this.mapCompassArcAngularWidth.set(70);
      this.mapCompassArcTopMargin.set(40);
      this.mapCompassArcModule.showMinorBearingLabels.set(true);
      this.mapCompassArcModule.showReadout.set(true);

      tabListLength = dimensions[0] * 0.5 - 52;

      this.listItemsPerPage.set(5);
      this.listItemSpacing.set(3);
    } else {
      // Map is rendered above the tabs, at full width (minus margin) and a fixed height.
      this.mapSize.set(dimensions[0] - 13, 200);

      this.mapTrackUpTargetOffset.set(0, 0.375);

      this.mapCompassArcAngularWidth.set(90);
      this.mapCompassArcTopMargin.set(15);
      this.mapCompassArcModule.showMinorBearingLabels.set(false);
      this.mapCompassArcModule.showReadout.set(false);

      tabListLength = dimensions[0] - 52;

      this.listItemsPerPage.set(3);
      this.listItemSpacing.set(8);
    }

    this.tabSpacing.set(Math.max(0, Math.floor((tabListLength - 3 * this.tabLength) / 2)));

    // Hide the map for a short period after resizing so that users don't see any artifacts from the Bing map texture.
    this.mapHidden.set(true);
    this.mapHiddenDebounce.schedule(this.showMapFunc, MfdMapSetupPopup.MAP_RESIZE_HIDE_DURATION);
  }

  /** @inheritdoc */
  public onUpdate(time: number): void {
    this.compiledMap.ref.instance.update(time);
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.tabbedContainerRef.instance.onUiInteractionEvent(event);
  }

  /**
   * Increments a state value.
   * @param state The state to change.
   * @param min The minimum value to set after applying the increment.
   * @param max The maximum value to set after applying the increment.
   * @param increment The increment by which to change the value.
   */
  private incrementState(state: MutableSubscribable<number>, min: number, max: number, increment: number): void {
    state.set(MathUtils.clamp(state.get() + increment, min, max));
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='mfd-map-setup-popup'>
        <div class='mfd-map-setup-popup-title ui-view-title'>
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_map_setup.png`} class='ui-view-title-icon' />
          <div>Map Setup</div>
        </div>
        <div class='mfd-map-setup-popup-content'>
          <div class='mfd-map-setup-popup-map-container'>
            <div class={{ 'visibility-hidden': this.mapHidden }}>
              {this.compiledMap.map}
            </div>
            <div class='ui-layered-darken' />
          </div>
          <TabbedContainer
            ref={this.tabbedContainerRef}
            validKnobIds={this.props.uiService.validKnobIds}
            tabPosition='top'
            tabsPerListPage={3}
            tabLength={this.tabLength}
            tabSpacing={this.tabSpacing}
            gduFormat={this.props.uiService.gduFormat}
            class='mfd-map-setup-popup-tabs'
          >
            {this.renderGeneralTab()}
            {this.renderMapTab()}
            {this.renderLineTab()}
            {this.props.trafficSystem !== null && this.renderTrafficTab()}
            {this.renderAirportTab()}
            {this.renderNavaidTab()}
            {this.renderAirspaceTab()}
            {this.renderWeatherTab()}
            {this.renderCityTab()}
            {this.renderRoadTab()}
            {this.renderPointTab()}
          </TabbedContainer>
        </div>
      </div>
    );
  }

  /**
   * Renders this popup's general settings tab.
   * @returns This popup's general settings tab, as a VNode.
   */
  private renderGeneralTab(): VNode {
    return this.renderTab(
      'General',
      <>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Autozoom</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create(false),
              value => value ? 'On' : 'Off',
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Orientation</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              this.mapSettingManager.getSetting('mapOrientation'),
              value => {
                switch (value) {
                  case MapOrientationSettingMode.NorthUp:
                    return 'North Up';
                  case MapOrientationSettingMode.TrackUp:
                    return 'Track Up';
                  case MapOrientationSettingMode.DtkUp:
                    return 'Dtk Up';
                  default:
                    return '';
                }
              },
              {
                selectedValue: this.mapSettingManager.getSetting('mapOrientation'),
                inputData: [
                  {
                    value: MapOrientationSettingMode.NorthUp,
                    labelRenderer: () => 'North Up'
                  },
                  {
                    value: MapOrientationSettingMode.TrackUp,
                    labelRenderer: () => 'Track Up'
                  },
                  {
                    value: MapOrientationSettingMode.DtkUp,
                    labelRenderer: () => 'DTK Up',
                    isEnabled: false
                  }
                ]
              },
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Compass Arc</div>
          <UiListFocusable>
            {this.renderOnOffSelectButton(
              this.mapSettingManager.getSetting('mapCompassArcShow'),
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>North Up Above</div>
          <UiListFocusable>
            {this.renderMapRangeListSelectButton(
              this.mapSettingManager.getSetting('mapAutoNorthUpRangeIndex'),
              11, // 5 nm
              19, // 200 nm
              false,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>North Up On Ground</div>
          <UiListFocusable>
            {this.renderOnOffSelectButton(
              this.mapSettingManager.getSetting('mapGroundNorthUpActive'),
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
      </>
    );
  }

  /**
   * Renders this popup's map settings tab.
   * @returns This popup's map settings tab, as a VNode.
   */
  private renderMapTab(): VNode {
    return this.renderTab(
      'Map',
      <>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Map Type</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create('VFR'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Topo Shading</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create('Off'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Terrain Shading</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              this.mapSettingManager.getSetting('mapTerrainMode'),
              value => value === MapTerrainSettingMode.Relative ? 'On' : 'Off',
              {
                selectedValue: this.mapSettingManager.getSetting('mapTerrainMode'),
                inputData: [
                  {
                    value: MapTerrainSettingMode.Absolute,
                    labelRenderer: () => 'Off'
                  },
                  {
                    value: MapTerrainSettingMode.Relative,
                    labelRenderer: () => 'On'
                  }
                ]
              },
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Navigation Feature Style</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create('Standard'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Obstacles</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create('Off'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Fuel Range Ring / Reserve Time</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create('Off'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Selected Altitude Intercept Arc</div>
          <UiListFocusable>
            {this.renderOnOffSelectButton(
              this.mapSettingManager.getSetting('mapAltitudeArcShow'),
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
      </>
    );
  }

  /**
   * Renders this popup's line settings tab.
   * @returns This popup's line settings tab, as a VNode.
   */
  private renderLineTab(): VNode {
    const showTrackVectorDistance = this.mapSettingManager.getSetting('mapTrackVectorMode').map(mode => mode === G3XMapTrackVectorSettingMode.Distance);
    const trackVectorDistanceValue = NumberUnitSubject.create(UnitType.NMILE.createNumber(0));
    const trackVectorDistancePipe = this.mapSettingManager.getSetting('mapTrackVectorDistance').pipe(trackVectorDistanceValue);

    const showTrackVectorTime = this.mapSettingManager.getSetting('mapTrackVectorMode').map(mode => mode === G3XMapTrackVectorSettingMode.Time);
    const trackVectorTimeText = this.mapSettingManager.getSetting('mapTrackVectorLookahead').map(DurationFormatter.create('{MM}:{ss}', UnitType.SECOND, 1));

    this.subscriptions.push(
      showTrackVectorDistance,
      trackVectorDistancePipe,
      showTrackVectorTime,
      trackVectorTimeText
    );

    return this.renderTab(
      'Line',
      <>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Track Log</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create('Hide'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Track Log Record Mode</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create('Off'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Track Log Interval</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create('Auto'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Track Log Color</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create('Black'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Track Vector</div>
          <UiListFocusable>
            <UiTouchButton
              label={
                <G3XNumberUnitDisplay
                  value={trackVectorDistanceValue}
                  formatter={NumberFormatter.create({ precision: 0.01 })}
                  displayUnit={this.unitsSettingManager.distanceUnitsLarge}
                />
              }
              isEnabled={showTrackVectorDistance}
              isVisible={showTrackVectorDistance}
              onPressed={async () => {
                const unit = this.unitsSettingManager.distanceUnitsLarge.get();

                const result = await this.props.uiService.openMfdPopup<UiGenericNumberUnitDialog>(UiViewStackLayer.Overlay, UiViewKeys.GenericNumberUnitDialog1)
                  .ref.request({
                    unitType: unit,
                    minimumValue: 1,
                    maximumValue: 9999,
                    decimalCount: 2,
                    initialValue: trackVectorDistanceValue.get().asUnit(unit),
                    title: 'Select Distance',
                    innerKnobLabel: 'Select Distance',
                    outerKnobLabel: 'Select Distance',
                  });

                if (!result.wasCancelled) {
                  this.mapSettingManager.getSetting('mapTrackVectorDistance').value = result.payload.unit.convertTo(result.payload.value, UnitType.NMILE);
                }
              }}
              class='mfd-map-setup-popup-list-item-left'
            />
            <div
              class={{
                'mfd-map-setup-popup-list-item-left': true,
                'mfd-map-setup-popup-track-vector-time': true,
                'hidden': showTrackVectorTime.map(SubscribableMapFunctions.not())
              }}
            >
              <UiTouchButton
                label='-'
                isEnabled={showTrackVectorTime}
                onPressed={this.incrementState.bind(this, this.mapSettingManager.getSetting('mapTrackVectorLookahead'), 60, 9999 * 60, -30)}
              />
              <div class='mfd-map-setup-popup-track-vector-time-value'>{trackVectorTimeText}</div>
              <UiTouchButton
                label='+'
                isEnabled={showTrackVectorTime}
                onPressed={this.incrementState.bind(this, this.mapSettingManager.getSetting('mapTrackVectorLookahead'), 60, 9999 * 60, 30)}
              />
            </div>
            {this.renderListSelectButton(
              this.mapSettingManager.getSetting('mapTrackVectorMode'),
              value => {
                switch (value) {
                  case G3XMapTrackVectorSettingMode.Off:
                    return 'Off';
                  case G3XMapTrackVectorSettingMode.Distance:
                    return 'Distance';
                  case G3XMapTrackVectorSettingMode.Time:
                    return 'Time';
                  default:
                    return '';
                }
              },
              {
                selectedValue: this.mapSettingManager.getSetting('mapTrackVectorMode'),
                inputData: [
                  {
                    value: G3XMapTrackVectorSettingMode.Off,
                    labelRenderer: () => 'Off'
                  },
                  {
                    value: G3XMapTrackVectorSettingMode.Distance,
                    labelRenderer: () => 'Distance'
                  },
                  {
                    value: G3XMapTrackVectorSettingMode.Time,
                    labelRenderer: () => 'Time'
                  }
                ]
              },
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
      </>
    );
  }

  /**
   * Renders this popup's traffic settings tab.
   * @returns This popup's traffic settings tab, as a VNode.
   */
  private renderTrafficTab(): VNode {
    return this.renderTab(
      'Traffic',
      <>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Traffic Data</div>
          <UiListFocusable>
            {this.renderOnOffSelectButton(
              this.mapSettingManager.getSetting('mapTrafficShow'),
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Traffic Symbol</div>
          <UiListFocusable>
            {this.renderMapRangeListSelectButton(
              this.mapSettingManager.getSetting('mapTrafficRangeIndex'),
              10, // 3 nm
              16, // 50 nm
              false,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Traffic Label</div>
          <UiListFocusable>
            {this.renderMapRangeListSelectButton(
              this.mapSettingManager.getSetting('mapTrafficLabelRangeIndex'),
              10, // 3 nm
              16, // 50 nm
              false,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Traffic Identifier</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create('Off'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Traffic Trend</div>
          <UiListFocusable>
            {this.renderOnOffCombinedButton(
              Subject.create(false),
              'mfd-map-setup-popup-list-item-right',
              false
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Traffic Trend Scale</div>
          <UiListFocusable>
            {this.renderOnOffCombinedButton(
              Subject.create(false),
              'mfd-map-setup-popup-list-item-right',
              false
            )}
          </UiListFocusable>
        </UiListItem>
      </>
    );
  }

  /**
   * Renders this popup's airport settings tab.
   * @returns This popup's airport settings tab, as a VNode.
   */
  private renderAirportTab(): VNode {
    return this.renderTab(
      'Airport',
      <>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Large Airport</div>
          <UiListFocusable>
            {this.renderTextSizeSelectButton(
              this.mapSettingManager.getSetting('mapAirportLargeTextSize'),
              'mfd-map-setup-popup-list-item-left'
            )}
            {this.renderMapRangeListSelectButton(
              this.mapSettingManager.getSetting('mapAirportLargeRangeIndex'),
              9, // 2 nm
              18, // 120 nm
              true,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Medium Airport</div>
          <UiListFocusable>
            {this.renderTextSizeSelectButton(
              this.mapSettingManager.getSetting('mapAirportMediumTextSize'),
              'mfd-map-setup-popup-list-item-left'
            )}
            {this.renderMapRangeListSelectButton(
              this.mapSettingManager.getSetting('mapAirportMediumRangeIndex'),
              9, // 2 nm
              18, // 120 nm
              true,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Small Airport</div>
          <UiListFocusable>
            {this.renderTextSizeSelectButton(
              this.mapSettingManager.getSetting('mapAirportSmallTextSize'),
              'mfd-map-setup-popup-list-item-left'
            )}
            {this.renderMapRangeListSelectButton(
              this.mapSettingManager.getSetting('mapAirportSmallRangeIndex'),
              9, // 2 nm
              18, // 120 nm
              true,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Runway Numbers</div>
          <UiListFocusable>
            {this.renderMapRangeListSelectButton(
              this.mapSettingManager.getSetting('mapRunwayLabelRangeIndex'),
              8, // 1.2 nm
              11, // 5 nm
              true,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
      </>
    );
  }

  /**
   * Renders this popup's navaid settings tab.
   * @returns This popup's navaid settings tab, as a VNode.
   */
  private renderNavaidTab(): VNode {
    return this.renderTab(
      'Navaid',
      <>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Airways</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create('Off'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>VOR</div>
          <UiListFocusable>
            {this.renderTextSizeSelectButton(
              this.mapSettingManager.getSetting('mapVorTextSize'),
              'mfd-map-setup-popup-list-item-left'
            )}
            {this.renderMapRangeListSelectButton(
              this.mapSettingManager.getSetting('mapVorRangeIndex'),
              9, // 2 nm
              18, // 120 nm
              true,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>NDB</div>
          <UiListFocusable>
            {this.renderTextSizeSelectButton(
              this.mapSettingManager.getSetting('mapNdbTextSize'),
              'mfd-map-setup-popup-list-item-left'
            )}
            {this.renderMapRangeListSelectButton(
              this.mapSettingManager.getSetting('mapNdbRangeIndex'),
              9, // 2 nm
              18, // 120 nm
              true,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Intersection</div>
          <UiListFocusable>
            {this.renderTextSizeSelectButton(
              this.mapSettingManager.getSetting('mapIntersectionTextSize'),
              'mfd-map-setup-popup-list-item-left'
            )}
            {this.renderMapRangeListSelectButton(
              this.mapSettingManager.getSetting('mapIntersectionRangeIndex'),
              6, // 0.5 nm
              16, // 50 nm
              true,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
      </>
    );
  }

  /**
   * Renders this popup's airspace settings tab.
   * @returns This popup's airspace settings tab, as a VNode.
   */
  private renderAirspaceTab(): VNode {
    return this.renderTab(
      'Airspace',
      <>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Class B/TMA</div>
          <UiListFocusable>
            {this.renderMapRangeListSelectButton(
              this.mapSettingManager.getSetting('mapAirspaceClassBRangeIndex'),
              9, // 2 nm
              18, // 120 nm
              true,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Class C/CTA</div>
          <UiListFocusable>
            {this.renderMapRangeListSelectButton(
              this.mapSettingManager.getSetting('mapAirspaceClassCRangeIndex'),
              9, // 2 nm
              17, // 80 nm
              true,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Class A/D</div>
          <UiListFocusable>
            {this.renderMapRangeListSelectButton(
              this.mapSettingManager.getSetting('mapAirspaceClassDRangeIndex'),
              9, // 2 nm
              16, // 50 nm
              true,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Euro Airway</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create('Off'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>TFR</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create('Off'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Restricted</div>
          <UiListFocusable>
            {this.renderMapRangeListSelectButton(
              this.mapSettingManager.getSetting('mapAirspaceRestrictedRangeIndex'),
              9, // 2 nm
              17, // 80 nm
              true,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>MOA (Military)</div>
          <UiListFocusable>
            {this.renderMapRangeListSelectButton(
              this.mapSettingManager.getSetting('mapAirspaceMoaRangeIndex'),
              9, // 2 nm
              18, // 120 nm
              true,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Other/ADIZ</div>
          <UiListFocusable>
            {this.renderMapRangeListSelectButton(
              this.mapSettingManager.getSetting('mapAirspaceOtherRangeIndex'),
              9, // 2 nm
              18, // 120 nm
              true,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Altitude Labels</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create('Medium Text'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-left'
            )}
            {this.renderListSelectButton(
              Subject.create('Off'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Smart Airspace</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create('Off'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
      </>
    );
  }

  /**
   * Renders this popup's weather settings tab.
   * @returns This popup's weather settings tab, as a VNode.
   */
  private renderWeatherTab(): VNode {
    return this.renderTab(
      'Weather',
      <>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Weather Data</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              this.mapSettingManager.getSetting('mapWeatherShow'),
              value => value ? 'On' : 'Off',
              {
                selectedValue: this.mapSettingManager.getSetting('mapWeatherShow'),
                inputData: [
                  {
                    value: false,
                    labelRenderer: () => 'Off'
                  },
                  {
                    value: true,
                    labelRenderer: () => 'On'
                  }
                ]
              },
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>NEXRAD</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              this.mapSettingManager.getSetting('mapNexradShow'),
              value => value ? 'On' : 'Off',
              {
                selectedValue: this.mapSettingManager.getSetting('mapNexradShow'),
                inputData: [
                  {
                    value: false,
                    labelRenderer: () => 'Off'
                  },
                  {
                    value: true,
                    labelRenderer: () => 'On'
                  }
                ]
              },
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Radar Coverage</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create('Off'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>METAR</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create('Off'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
      </>
    );
  }

  /**
   * Renders this popup's city settings tab.
   * @returns This popup's city settings tab, as a VNode.
   */
  private renderCityTab(): VNode {
    return (
      <GenericTabbedContent
        tabLabel='City'
        isEnabled={false}
      >
      </GenericTabbedContent>
    );
  }

  /**
   * Renders this popup's road settings tab.
   * @returns This popup's road settings tab, as a VNode.
   */
  private renderRoadTab(): VNode {
    return (
      <GenericTabbedContent
        tabLabel='Road'
        isEnabled={false}
      >
      </GenericTabbedContent>
    );
  }

  /**
   * Renders this popup's point settings tab.
   * @returns This popup's point settings tab, as a VNode.
   */
  private renderPointTab(): VNode {
    return this.renderTab(
      'Point',
      <>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>User Waypoint</div>
          <UiListFocusable>
            {this.renderTextSizeSelectButton(
              this.mapSettingManager.getSetting('mapUserWaypointTextSize'),
              'mfd-map-setup-popup-list-item-left'
            )}
            {this.renderMapRangeListSelectButton(
              this.mapSettingManager.getSetting('mapUserWaypointRangeIndex'),
              9, // 2 nm
              19, // 200 nm
              true,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Point Of Interest</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create('No Text'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-left'
            )}
            {this.renderListSelectButton(
              Subject.create('Off'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
        <UiListItem>
          <div class='mfd-map-setup-popup-list-item-title'>Proximity Circle</div>
          <UiListFocusable>
            {this.renderListSelectButton(
              Subject.create('Off'),
              undefined,
              undefined,
              'mfd-map-setup-popup-list-item-right'
            )}
          </UiListFocusable>
        </UiListItem>
      </>
    );
  }

  /**
   * Renders one of this popup's settings tabs.
   * @param label The tab's label.
   * @param listChildren The children to render into the tab's list.
   * @returns The specified settings tab, as a VNode.
   */
  private renderTab(label: string, listChildren: VNode): VNode {
    const listRef = FSComponent.createRef<UiList<any>>();

    return (
      <GenericTabbedContent
        tabLabel={label}
        onAfterRender={(thisNode, members) => {
          listRef.instance.knobLabelState.pipe(members.knobLabelState);
          listRef.instance.focusFirst();
        }}
        onResume={() => {
          listRef.instance.focusRecent();
        }}
        onPause={() => {
          listRef.instance.removeFocus();
        }}
        onUiInteractionEvent={event => listRef.instance.onUiInteractionEvent(event)}
      >
        <UiList
          ref={listRef}
          bus={this.props.uiService.bus}
          validKnobIds={this.listKnobIds}
          listItemLengthPx={this.listItemLength}
          listItemSpacingPx={this.listItemSpacing}
          itemsPerPage={this.listItemsPerPage}
          class='mfd-map-setup-popup-list mfd-map-setup-popup-list-general'
        >
          {listChildren}
        </UiList>
      </GenericTabbedContent>
    );
  }

  /**
   * Renders a button which displays a state value and when pressed, allows the user to select a value for the state
   * from a list dialog.
   * @param state The state to which to bind the button.
   * @param renderValue A function which renders the value of the button's bound state, or a VNode which renders the
   * value. If not defined, then values are rendered into strings via default `toString()` behavior. If the rendered
   * value is a VNode, then all first-level DisplayComponents in the VNode tree will be destroyed when a new value is
   * rendered or when the button is destroyed.
   * @param listParams Parameters to pass to the selection list dialog, or a function which will return the parameters
   * when called each time the list is opened.
   * @param cssClass CSS class(es) to apply to the button's root element.
   * @returns A button which displays a state value and when pressed, allows the user to select a value for the state
   * from a list dialog, as a VNode.
   */
  private renderListSelectButton<S extends MutableSubscribable<any, any>>(
    state: S,
    renderValue?: VNode | ((stateValue: SubscribableType<S>) => string | VNode),
    listParams?: UiListDialogParams<MutableSubscribableInputType<S>> | ((state: S) => UiListDialogParams<MutableSubscribableInputType<S>>),
    cssClass?: string
  ): VNode {
    const defaultListItemHeight = this.props.uiService.gduFormat === '460' ? 66 : 33;
    const defaultListItemSpacing = this.props.uiService.gduFormat === '460' ? 4 : 2;

    const modifyListParams = (inputListParams: UiListDialogParams<MutableSubscribableInputType<S>>): UiListDialogParams<MutableSubscribableInputType<S>> => {
      const modified = Object.assign({}, inputListParams);

      modified.itemsPerPage ??= Math.min(inputListParams.inputData.length, 5);
      modified.listItemHeightPx ??= defaultListItemHeight;
      modified.listItemSpacingPx ??= defaultListItemSpacing;
      modified.class ??= 'mfd-map-setup-popup-select-list';

      return modified;
    };

    let finalListParams: UiListDialogParams<MutableSubscribableInputType<S>> | ((state: S) => UiListDialogParams<MutableSubscribableInputType<S>>);

    if (listParams === undefined) {
      finalListParams = { inputData: [] };
    } else if (typeof listParams === 'object') {
      finalListParams = modifyListParams(listParams);
    } else {
      finalListParams = (listParamsState: S): UiListDialogParams<MutableSubscribableInputType<S>> => {
        return modifyListParams(listParams(listParamsState));
      };
    }

    return (
      <UiListSelectTouchButton
        uiService={this.props.uiService}
        listDialogLayer={UiViewStackLayer.Overlay}
        listDialogKey={UiViewKeys.ListDialog1}
        openDialogAsPositioned
        containerRef={this.props.containerRef}
        isEnabled={listParams !== undefined}
        state={state}
        renderValue={renderValue}
        listParams={finalListParams}
        isInList
        class={cssClass}
      />
    );
  }

  /**
   * Renders a button which displays a boolean state value as 'On'/'Off' for `true`/`false`, respectively, and when
   * pressed, allows the user to select a value for the state from a list dialog.
   * @param state The state to which to bind the button.
   * @param cssClass CSS class(es) to apply to the button's root element.
   * @returns A button which displays a boolean state value as 'On'/'Off' for `true`/`false`, respectively, and when
   * pressed, allows the user to select a value for the state from a list dialog.
   */
  private renderOnOffSelectButton(
    state: MutableSubscribable<boolean>,
    cssClass?: string
  ): VNode {
    return this.renderListSelectButton(
      state,
      value => value ? 'On' : 'Off',
      {
        selectedValue: state,
        inputData: [
          {
            value: false,
            labelRenderer: () => 'Off'
          },
          {
            value: true,
            labelRenderer: () => 'On'
          }
        ]
      },
      cssClass
    );
  }

  /**
   * Renders a combined button which contains two set-value touch buttons that toggle a boolean state and are labeled
   * 'Off' and 'On'.
   * @param state The state to which to bind the buttons.
   * @param cssClass CSS class(es) to apply to the combined button's root element.
   * @param isEnabled Whether the buttons are enabled. Defaults to `true`.
   * @returns A combined button which contains two set-value touch buttons that toggle a boolean state and are labeled
   * 'Off' and 'On'.
   */
  private renderOnOffCombinedButton(
    state: MutableSubscribable<boolean>,
    cssClass?: string,
    isEnabled?: boolean
  ): VNode {
    isEnabled ??= true;

    return (
      <CombinedTouchButton
        orientation='row'
        isFocusable
        canBeFocused={isEnabled}
        focusSelfOnTouch
        onUiInteractionEvent={event => {
          switch (event) {
            case UiInteractionEvent.SingleKnobPress:
            case UiInteractionEvent.LeftKnobPress:
            case UiInteractionEvent.RightKnobPress:
              state.set(!state.get());
              return true;
            default:
              return false;
          }
        }}
        class={cssClass}
      >
        <UiSetValueTouchButton
          state={state}
          setValue={false}
          label='Off'
          isEnabled={isEnabled}
          isInList
          gduFormat={this.props.uiService.gduFormat}
        />
        <UiSetValueTouchButton
          state={state}
          setValue={true}
          isEnabled={isEnabled}
          label='On'
          isInList
          gduFormat={this.props.uiService.gduFormat}
        />
      </CombinedTouchButton>
    );
  }

  /**
   * Renders a button which displays a label text size state value and when pressed, allows the user to select a value
   * for the state from a list dialog.
   * @param state The state to which to bind the button.
   * @param cssClass CSS class(es) to apply to the button's root element.
   * @returns A button which displays a label text size state value and when pressed, allows the user to select a value
   * for the state from a list dialog.
   */
  private renderTextSizeSelectButton(
    state: MutableSubscribable<G3XMapLabelTextSizeSettingMode>,
    cssClass?: string
  ): VNode {
    return this.renderListSelectButton(
      state,
      value => {
        switch (value) {
          case G3XMapLabelTextSizeSettingMode.None:
            return 'No Text';
          case G3XMapLabelTextSizeSettingMode.Small:
            return 'Small Text';
          case G3XMapLabelTextSizeSettingMode.Medium:
            return 'Medium Text';
          case G3XMapLabelTextSizeSettingMode.Large:
            return 'Large Text';
          default:
            return '';
        }
      },
      {
        selectedValue: state,
        inputData: [
          {
            value: G3XMapLabelTextSizeSettingMode.None,
            labelRenderer: () => 'No Text'
          },
          {
            value: G3XMapLabelTextSizeSettingMode.Small,
            labelRenderer: () => 'Small Text'
          },
          {
            value: G3XMapLabelTextSizeSettingMode.Medium,
            labelRenderer: () => 'Medium Text'
          },
          {
            value: G3XMapLabelTextSizeSettingMode.Large,
            labelRenderer: () => 'Large Text'
          }
        ]
      },
      cssClass
    );
  }

  /**
   * Renders a button which displays a map range setting and when pressed, allows the user to select a value for the
   * setting from a list dialog.
   * @param state The map range setting to which to bind the button.
   * @param startIndex The index of the smallest selectable map range, inclusive.
   * @param endIndex The index of the largest selectable map range, inclusive.
   * @param includeOff Whether to include the 'Off' (`-1`) setting in the selection list.
   * @param listParams Parameters to pass to the selection list dialog.
   * @param cssClass CSS class(es) to apply to the button's root element.
   * @returns A button which displays a map range setting and when pressed, allows the user to select a value for the
   * setting from a list dialog, as a VNode.
   */
  private renderMapRangeListSelectButton(
    state: MutableSubscribable<number>,
    startIndex: number,
    endIndex: number,
    includeOff: boolean,
    listParams?: Readonly<MapRangeSettingSelectButtonListParams>,
    cssClass?: string
  ): VNode {
    const defaultListItemHeight = this.props.uiService.gduFormat === '460' ? 66 : 33;
    const defaultListItemSpacing = this.props.uiService.gduFormat === '460' ? 4 : 2;

    const finalListParams = Object.assign({}, listParams) as MapRangeSettingSelectButtonListParams;

    finalListParams.itemsPerPage ??= Math.min((endIndex - startIndex + 1) + (includeOff ? 1 : 0), 5);
    finalListParams.listItemHeightPx ??= defaultListItemHeight;
    finalListParams.listItemSpacingPx ??= defaultListItemSpacing;
    finalListParams.class ??= 'mfd-map-setup-popup-select-list';

    return (
      <MapRangeSettingSelectButton
        uiService={this.props.uiService}
        listDialogLayer={UiViewStackLayer.Overlay}
        listDialogKey={UiViewKeys.ListDialog1}
        openDialogAsPositioned
        containerRef={this.props.containerRef}
        state={state}
        unitsSettingManager={this.unitsSettingManager}
        startIndex={startIndex}
        endIndex={endIndex}
        includeOff={includeOff}
        listParams={finalListParams}
        isInList
        class={cssClass}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.mapHiddenDebounce.clear();

    this.compiledMap.ref.getOrDefault()?.destroy();
    this.tabbedContainerRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}