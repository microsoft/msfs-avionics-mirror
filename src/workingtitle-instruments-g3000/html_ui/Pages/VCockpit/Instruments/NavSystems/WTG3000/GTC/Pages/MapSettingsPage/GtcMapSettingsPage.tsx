import {
  DisplayComponent, DurationDisplay, DurationDisplayDelim, DurationDisplayFormat, FSComponent, NodeReference, Subject, Subscribable, SubscribableSet,
  Subscription, UnitType, UserSetting, UserSettingManager, UserSettingValueFilter, VNode
} from '@microsoft/msfs-sdk';
import { MapOrientationSettingMode, MapTerrainSettingMode, MapUtils, TrafficSystemType, UnitsUserSettings } from '@microsoft/msfs-garminsdk';
import {
  ControllableDisplayPaneIndex, DisplayPaneIndex, G3000MapUserSettingTypes, MapInsetSettingMode, MapRangeSettingDisplay, MapSettingSync,
  MapSettingSyncUserSettings, MapUserSettings
} from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List/GtcList';
import { GtcListItem } from '../../Components/List/GtcListItem';
import { TabbedContainer, TabConfiguration } from '../../Components/Tabs/TabbedContainer';
import { TabbedContent } from '../../Components/Tabs/TabbedContent';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcMapRangeSettingSelectButton } from '../../Components/TouchButton/GtcMapRangeSettingSelectButton';
import { GtcSetValueTouchButton } from '../../Components/TouchButton/GtcSetValueTouchButton';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcValueTouchButton } from '../../Components/TouchButton/GtcValueTouchButton';
import { ToggleTouchButton } from '../../Components/TouchButton/ToggleTouchButton';
import { TouchButton } from '../../Components/TouchButton/TouchButton';
import { GtcGenericView } from '../../GtcService/GtcGenericView';
import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcMapDetailSettingIcon } from './GtcMapDetailSettingIcon';
import { GtcMapDetailSettingsPopup } from './GtcMapDetailSettingsPopup';
import { GtcMapSettingSyncUtils } from './GtcMapSettingSyncUtils';
import { GtcMapTrafficSettingsPopup } from './GtcMapTrafficSettingsPopup';

import './GtcMapSettingsPage.css';
import './GtcMapSettingsPopups.css';

/**
 * Component props for GtcMapSettingsPage.
 */
export interface GtcMapSettingsPageProps extends GtcViewProps {
  /** The type of traffic system installed in the airplane. */
  trafficSystemType: TrafficSystemType;

  /** Whether the installed traffic system supports ADS-B in. */
  adsb: boolean;
}

/**
 * GTC view keys for popups owned by the map settings page.
 */
enum GtcMapSettingsPagePopupKeys {
  SettingSyncOnsideInit = 'MapSettingSyncOnsideInit',
  SettingSyncAllInit = 'MapSettingSyncAllInit',
  DetailSettings = 'MapDetailSettings',
  TrafficSettings = 'MapTrafficSettings',
  TawsSettings = 'MapTawsSettings',
  TerrainSettings = 'MapTerrainSettings',
  NexradSettings = 'MapNexradSettings',
  AirspaceSettings = 'MapAirspaceSettings',
  AirportSettings = 'MapAirportSettings',
  VorSettings = 'MapVorSettings'
}

/**
 * A GTC map settings page.
 */
export class GtcMapSettingsPage extends GtcView<GtcMapSettingsPageProps> {
  private static readonly PANE_TEXT = {
    [DisplayPaneIndex.LeftPfd]: 'PFD Left',
    [DisplayPaneIndex.LeftMfd]: 'MFD Left',
    [DisplayPaneIndex.RightMfd]: 'MFD Right',
    [DisplayPaneIndex.RightPfd]: 'PFD Right'
  };

  private thisNode?: VNode;

  private readonly tabContainerRef = FSComponent.createRef<TabbedContainer>();

  private readonly displayPaneIndex: ControllableDisplayPaneIndex;

  private readonly allPaneIndexes: ControllableDisplayPaneIndex[] = [DisplayPaneIndex.LeftMfd, DisplayPaneIndex.RightMfd, DisplayPaneIndex.LeftPfd, DisplayPaneIndex.RightPfd];
  private readonly onsidePaneIndexes: ControllableDisplayPaneIndex[];

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.bus);

  private readonly allMapSettingManagers = [
    MapUserSettings.getDisplayPaneManager(this.bus, DisplayPaneIndex.LeftPfd),
    MapUserSettings.getDisplayPaneManager(this.bus, DisplayPaneIndex.LeftMfd),
    MapUserSettings.getDisplayPaneManager(this.bus, DisplayPaneIndex.RightMfd),
    MapUserSettings.getDisplayPaneManager(this.bus, DisplayPaneIndex.RightPfd)
  ];
  private readonly onsideMapSettingManagers: UserSettingManager<G3000MapUserSettingTypes>[];

  private readonly mapReadSettingManager: UserSettingManager<G3000MapUserSettingTypes>;
  private readonly mapWriteSettingManagers: UserSettingManager<G3000MapUserSettingTypes>[] = [];
  private readonly onsideMapSyncSetting: UserSetting<MapSettingSync>;
  private readonly crossSideMapSyncSetting: UserSetting<MapSettingSync>;

  private readonly mapRangeArray = this.unitsSettingManager.getSetting('unitsDistance').map(mode => MapUtils.nextGenMapRanges(mode));

  private readonly listItemHeight = this.props.gtcService.orientation === 'horizontal' ? 130 : 70;

  private syncSub?: Subscription;

  /**
   * Constructor.
   * @param props This component's props.
   * @throws Error if a display pane index is not defined for this view.
   */
  public constructor(props: GtcMapSettingsPageProps) {
    super(props);

    if (this.props.displayPaneIndex === undefined) {
      throw new Error('GtcMapSettingsPage: display pane index was not defined');
    }

    this.displayPaneIndex = this.props.displayPaneIndex;
    switch (this.displayPaneIndex) {
      case DisplayPaneIndex.LeftPfd:
      case DisplayPaneIndex.LeftMfd:
        this.onsidePaneIndexes = [DisplayPaneIndex.LeftPfd, DisplayPaneIndex.LeftMfd];
        this.onsideMapSettingManagers = this.allMapSettingManagers.slice(0, 2);
        this.onsideMapSyncSetting = MapSettingSyncUserSettings.getManager(this.bus).getSetting('mapUserSettingSyncLeft');
        this.crossSideMapSyncSetting = MapSettingSyncUserSettings.getManager(this.bus).getSetting('mapUserSettingSyncRight');
        break;
      case DisplayPaneIndex.RightMfd:
      case DisplayPaneIndex.RightPfd:
        this.onsidePaneIndexes = [DisplayPaneIndex.RightPfd, DisplayPaneIndex.RightMfd];
        this.onsideMapSettingManagers = this.allMapSettingManagers.slice(2, 4);
        this.onsideMapSyncSetting = MapSettingSyncUserSettings.getManager(this.bus).getSetting('mapUserSettingSyncRight');
        this.crossSideMapSyncSetting = MapSettingSyncUserSettings.getManager(this.bus).getSetting('mapUserSettingSyncLeft');
        break;
    }

    this.mapReadSettingManager = MapUserSettings.getDisplayPaneManager(this.bus, this.displayPaneIndex);
  }

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Map Settings');

    this.props.gtcService.registerView(GtcViewLifecyclePolicy.Transient, GtcMapSettingsPagePopupKeys.SettingSyncOnsideInit, 'MFD', this.renderSettingSyncOnsideInitPopup.bind(this), this.displayPaneIndex);
    this.props.gtcService.registerView(GtcViewLifecyclePolicy.Transient, GtcMapSettingsPagePopupKeys.SettingSyncAllInit, 'MFD', this.renderSettingSyncAllInitPopup.bind(this), this.displayPaneIndex);
    this.props.gtcService.registerView(GtcViewLifecyclePolicy.Transient, GtcMapSettingsPagePopupKeys.DetailSettings, 'MFD', this.renderDetailSettingsPopup.bind(this), this.displayPaneIndex);
    this.props.gtcService.registerView(GtcViewLifecyclePolicy.Transient, GtcMapSettingsPagePopupKeys.TrafficSettings, 'MFD', this.renderTrafficSettingsPopup.bind(this), this.displayPaneIndex);
    this.props.gtcService.registerView(GtcViewLifecyclePolicy.Transient, GtcMapSettingsPagePopupKeys.TawsSettings, 'MFD', this.renderTawsSettingsPopup.bind(this), this.displayPaneIndex);
    this.props.gtcService.registerView(GtcViewLifecyclePolicy.Transient, GtcMapSettingsPagePopupKeys.TerrainSettings, 'MFD', this.renderTerrainSettingsPopup.bind(this), this.displayPaneIndex);
    this.props.gtcService.registerView(GtcViewLifecyclePolicy.Transient, GtcMapSettingsPagePopupKeys.AirspaceSettings, 'MFD', this.renderAirspaceSettingsPopup.bind(this), this.displayPaneIndex);
    this.props.gtcService.registerView(GtcViewLifecyclePolicy.Transient, GtcMapSettingsPagePopupKeys.AirportSettings, 'MFD', this.renderAirportSettingsPopup.bind(this), this.displayPaneIndex);
    this.props.gtcService.registerView(GtcViewLifecyclePolicy.Transient, GtcMapSettingsPagePopupKeys.VorSettings, 'MFD', this.renderVorSettingsPopup.bind(this), this.displayPaneIndex);

    this.syncSub = this.onsideMapSyncSetting.sub(sync => {
      this.mapWriteSettingManagers.length = 0;

      if (sync === MapSettingSync.All) {
        this.mapWriteSettingManagers.push(...this.allMapSettingManagers);
      } else if (sync === MapSettingSync.Onside) {
        this.mapWriteSettingManagers.push(...this.onsideMapSettingManagers);
      } else {
        this.mapWriteSettingManagers.push(MapUserSettings.getDisplayPaneManager(this.bus, this.displayPaneIndex));
      }
    }, false, true);
  }

  /** @inheritdoc */
  public onOpen(): void {
    this.syncSub?.resume(true);
  }

  /** @inheritdoc */
  public onClose(): void {
    this.syncSub?.pause();
  }

  /** @inheritdoc */
  public onResume(): void {
    this.tabContainerRef.instance.resume();
  }

  /** @inheritdoc */
  public onPause(): void {
    this.tabContainerRef.instance.pause();
  }

  /**
   * Writes a value to a map user setting, taking into account the current map setting sync mode.
   * @param settingName The name of the setting to which to write.
   * @param value The value to write.
   */
  private writeToSetting<K extends keyof G3000MapUserSettingTypes & string>(settingName: K, value: NonNullable<G3000MapUserSettingTypes[K]>): void {
    for (const manager of this.mapWriteSettingManagers) {
      manager.getSetting(settingName).value = value;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-settings-page'>
        {this.renderLeftColumn()}
        <TabbedContainer ref={this.tabContainerRef} configuration={TabConfiguration.Left5} class='map-settings-page-right'>
          {this.renderTab(1, 'Sensor', this.renderSensorTab.bind(this))}
          {this.renderTab(2, 'Inset Window', this.renderInsetTab.bind(this))}
          {this.renderTab(3, 'Aviation', this.renderAviationTab.bind(this))}
          {this.renderTab(4, 'Land')}
          {this.renderTab(5, 'Other', this.renderOtherTab.bind(this))}
        </TabbedContainer>
      </div>
    );
  }

  /**
   * Renders the left column (orientation, sync, and detail buttons).
   * @returns The left column, as a VNode.
   */
  private renderLeftColumn(): VNode {
    const detailIcon = FSComponent.createRef<GtcMapDetailSettingIcon>();

    return (
      <div class='map-settings-page-left'>
        <GtcListSelectTouchButton
          gtcService={this.props.gtcService}
          listDialogKey={GtcViewKeys.ListDialog1}
          state={this.mapReadSettingManager.getSetting('mapOrientation')}
          label='Orientation'
          renderValue={(value): string => {
            switch (value) {
              case MapOrientationSettingMode.HeadingUp:
                return 'Heading Up';
              case MapOrientationSettingMode.TrackUp:
                return 'Track Up';
              case MapOrientationSettingMode.NorthUp:
                return 'North Up';
              default:
                return '';
            }
          }}
          listParams={{
            title: 'Map Orientation',
            inputData: [
              {
                value: MapOrientationSettingMode.HeadingUp,
                labelRenderer: () => 'Heading Up'
              },
              {
                value: MapOrientationSettingMode.TrackUp,
                labelRenderer: () => 'Track Up'
              },
              {
                value: MapOrientationSettingMode.NorthUp,
                labelRenderer: () => 'North Up'
              }
            ],
            selectedValue: this.mapReadSettingManager.getSetting('mapOrientation')
          }}
          onSelected={(value): void => {
            this.writeToSetting('mapOrientation', value);
          }}
        />
        <GtcListSelectTouchButton
          gtcService={this.props.gtcService}
          listDialogKey={GtcViewKeys.ListDialog1}
          state={this.onsideMapSyncSetting}
          label='Map Sync'
          renderValue={(value): string => {
            switch (value) {
              case MapSettingSync.None:
                return 'Off';
              case MapSettingSync.Onside:
                return 'Onside';
              case MapSettingSync.All:
                return 'All';
              default:
                return '';
            }
          }}
          listParams={{
            title: 'Map Sync',
            inputData: [
              {
                value: MapSettingSync.None,
                labelRenderer: () => 'Off',
                onPressed: () => {
                  if (this.crossSideMapSyncSetting.value === MapSettingSync.All) {
                    this.crossSideMapSyncSetting.value = MapSettingSync.None;
                  }
                  return true;
                }
              },
              {
                value: MapSettingSync.Onside,
                labelRenderer: () => 'Onside',
                onPressed: () => {
                  this.props.gtcService.openPopup(GtcMapSettingsPagePopupKeys.SettingSyncOnsideInit);
                  return false;
                }
              },
              {
                value: MapSettingSync.All,
                labelRenderer: () => 'All',
                onPressed: () => {
                  this.props.gtcService.openPopup(GtcMapSettingsPagePopupKeys.SettingSyncAllInit);
                  return false;
                }
              }
            ],
            selectedValue: this.onsideMapSyncSetting
          }}
        />
        <TouchButton
          label={'Map Detail'}
          onPressed={(): void => {
            this.props.gtcService.openPopup(GtcMapSettingsPagePopupKeys.DetailSettings);
          }}
          onDestroy={(): void => { detailIcon.getOrDefault()?.destroy(); }}
          class='map-settings-page-detail-button'
        >
          <GtcMapDetailSettingIcon
            ref={detailIcon}
            mode={this.mapReadSettingManager.getSetting('mapDeclutter')}
            class='map-settings-page-detail-button-icon'
          />
        </TouchButton>
      </div>
    );
  }

  /**
   * Renders a settings tab for this page's right-side settings tab container.
   * @param position The position of the tab.
   * @param label The tab label.
   * @param renderContent A function which renders the tab contents.
   * @returns A settings tab for this page's right-side settings tab container, as a VNode.
   */
  private renderTab(
    position: number,
    label: string,
    renderContent?: (listRef: NodeReference<GtcList<any>>, sidebarState: Subscribable<SidebarState | null>) => VNode
  ): VNode {
    const listRef = FSComponent.createRef<GtcList<any>>();
    const sidebarState = Subject.create<SidebarState | null>(null);

    return (
      <TabbedContent
        position={position}
        label={label}
        onPause={(): void => {
          this._activeComponent.set(null);
          sidebarState.set(null);
        }}
        onResume={(): void => {
          this._activeComponent.set(listRef.getOrDefault());
          sidebarState.set(this._sidebarState);
        }}
        disabled={renderContent === undefined}
      >
        {renderContent && renderContent(listRef, sidebarState)}
      </TabbedContent>
    );
  }

  /**
   * Renders the sensor tab.
   * @param listRef A reference to assign to the tab's list.
   * @param sidebarState The sidebar state to use.
   * @returns The sensor tab, as a VNode.
   */
  private renderSensorTab(listRef: NodeReference<GtcList<any>>, sidebarState: Subscribable<SidebarState | null>): VNode {
    return (
      <GtcList
        ref={listRef}
        bus={this.bus}
        itemsPerPage={5}
        listItemHeightPx={this.listItemHeight}
        listItemSpacingPx={1}
        sidebarState={sidebarState}
        class='map-settings-page-tab-list'
      >
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={this.mapReadSettingManager.getSetting('mapTrafficShow')}
            label='Traffic'
            onPressed={(button, state): void => {
              this.writeToSetting('mapTrafficShow', !state.value);
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          <GtcTouchButton
            label='Settings'
            onPressed={(): void => {
              this.props.gtcService.openPopup(GtcMapSettingsPagePopupKeys.TrafficSettings);
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.mapReadSettingManager.getSetting('mapTerrainMode')}
            label='Terrain'
            renderValue={(value): string => {
              switch (value) {
                case MapTerrainSettingMode.None:
                  return 'Off';
                case MapTerrainSettingMode.Absolute:
                  return 'Absolute';
                case MapTerrainSettingMode.Relative:
                  return 'Relative';
                default:
                  return '';
              }
            }}
            listParams={{
              title: 'Map Terrain Displayed',
              inputData: [
                {
                  value: MapTerrainSettingMode.None,
                  labelRenderer: () => 'Off'
                },
                {
                  value: MapTerrainSettingMode.Absolute,
                  labelRenderer: () => 'Absolute'
                },
                {
                  value: MapTerrainSettingMode.Relative,
                  labelRenderer: () => 'Relative'
                }
              ],
              selectedValue: this.mapReadSettingManager.getSetting('mapTerrainMode')
            }}
            onSelected={(value): void => {
              this.writeToSetting('mapTerrainMode', value);
            }}
            isInList
            class='map-settings-page-row-left'
          />
          <GtcTouchButton
            label='Settings'
            onPressed={(): void => {
              this.props.gtcService.openPopup(GtcMapSettingsPagePopupKeys.TawsSettings);
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={Subject.create(false)}
            label='Weather Radar'
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          <GtcTouchButton
            label='Settings'
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={Subject.create(false)}
            label={'Graphical\nMETARs'}
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          <GtcTouchButton
            label={
              <MapRangeSettingDisplay rangeIndex={21} rangeArray={this.mapRangeArray} displayUnit={this.unitsSettingManager.distanceUnitsLarge} />
            }
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={this.mapReadSettingManager.getSetting('mapNexradShow')}
            label={'Connext\nRadar'}
            onPressed={(button, state): void => {
              this.writeToSetting('mapNexradShow', !state.value);
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          {this.renderRangeSelectButton('mapNexradRangeIndex', 13, 27, true, undefined, 'Map Connext Radar Range', 'map-settings-page-row-right') /* 5 nm to 1000 nm */}
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={Subject.create(false)}
            label={'Connext\nLightning'}
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          <GtcTouchButton
            label={
              <MapRangeSettingDisplay rangeIndex={27} rangeArray={this.mapRangeArray} displayUnit={this.unitsSettingManager.distanceUnitsLarge} />
            }
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcValueTouchButton
            state={Subject.create('Connext')}
            label='WX Source'
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
        </GtcListItem>
      </GtcList>
    );
  }

  /**
   * Renders the inset window tab.
   * @param listRef A reference to assign to the tab's list.
   * @param sidebarState The sidebar state to use.
   * @returns The inset window tab, as a VNode.
   */
  private renderInsetTab(listRef: NodeReference<GtcList<any>>, sidebarState: Subscribable<SidebarState | null>): VNode {
    return (
      <GtcList
        ref={listRef}
        bus={this.bus}
        itemsPerPage={5}
        listItemHeightPx={this.listItemHeight}
        listItemSpacingPx={1}
        sidebarState={sidebarState}
        class='map-settings-page-tab-list'
      >
        <GtcListItem class='map-settings-page-row'>
          <GtcSetValueTouchButton
            state={this.mapReadSettingManager.getSetting('mapInsetMode')}
            setValue={MapInsetSettingMode.VertSituationDisplay}
            label={'VERT Situation\nDisplay'}
            onPressed={(button, state): void => {
              if (state.value === MapInsetSettingMode.VertSituationDisplay) {
                this.writeToSetting('mapInsetMode', MapInsetSettingMode.None);
              } else {
                this.writeToSetting('mapInsetMode', MapInsetSettingMode.VertSituationDisplay);
              }
            }}
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          <GtcTouchButton
            label='Settings'
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcSetValueTouchButton
            state={this.mapReadSettingManager.getSetting('mapInsetMode')}
            setValue={MapInsetSettingMode.FlightPlanText}
            label={'Flight Plan\nText'}
            onPressed={(button, state): void => {
              if (state.value === MapInsetSettingMode.FlightPlanText) {
                this.writeToSetting('mapInsetMode', MapInsetSettingMode.None);
              } else {
                this.writeToSetting('mapInsetMode', MapInsetSettingMode.FlightPlanText);
              }
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          <GtcListSelectTouchButton
            gtcService={this.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.mapReadSettingManager.getSetting('mapInsetTextCumulative')}
            renderValue={(value): string => {
              return value ? 'CUM' : 'Leg-Leg';
            }}
            listParams={{
              title: 'Distance Setting',
              inputData: [
                {
                  value: false,
                  labelRenderer: () => 'Leg-Leg'
                },
                {
                  value: true,
                  labelRenderer: () => 'CUM'
                },
              ],
              selectedValue: this.mapReadSettingManager.getSetting('mapInsetTextCumulative')
            }}
            onSelected={(value): void => {
              this.writeToSetting('mapInsetTextCumulative', value);
            }}
            isInList
            class='map-settings-page-row-right'
          />
        </GtcListItem>
      </GtcList>
    );
  }

  /**
   * Renders the aviation tab.
   * @param listRef A reference to assign to the tab's list.
   * @param sidebarState The sidebar state to use.
   * @returns The aviation tab, as a VNode.
   */
  private renderAviationTab(listRef: NodeReference<GtcList<any>>, sidebarState: Subscribable<SidebarState | null>): VNode {
    return (
      <GtcList
        ref={listRef}
        bus={this.bus}
        itemsPerPage={5}
        listItemHeightPx={this.listItemHeight}
        listItemSpacingPx={1}
        sidebarState={sidebarState}
        class='map-settings-page-tab-list'
      >
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={Subject.create(false)}
            label={'Low Altitude\nAirways'}
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          <GtcTouchButton
            label={
              <MapRangeSettingDisplay rangeIndex={19} rangeArray={this.mapRangeArray} displayUnit={this.unitsSettingManager.distanceUnitsLarge} />
            }
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={Subject.create(false)}
            label={'High Altitude\nAirways'}
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          <GtcTouchButton
            label={
              <MapRangeSettingDisplay rangeIndex={19} rangeArray={this.mapRangeArray} displayUnit={this.unitsSettingManager.distanceUnitsLarge} />
            }
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={this.mapReadSettingManager.getSetting('mapAirspaceShow')}
            label='Airspaces'
            onPressed={(button, state): void => {
              this.writeToSetting('mapAirspaceShow', !state.value);
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          <GtcTouchButton
            label='Settings'
            onPressed={(): void => {
              this.props.gtcService.openPopup(GtcMapSettingsPagePopupKeys.AirspaceSettings);
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={this.mapReadSettingManager.getSetting('mapAirportShow')}
            label='Airports'
            onPressed={(button, state): void => {
              this.writeToSetting('mapAirportShow', !state.value);
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          <GtcTouchButton
            label='Settings'
            onPressed={(): void => {
              this.props.gtcService.openPopup(GtcMapSettingsPagePopupKeys.AirportSettings);
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={this.mapReadSettingManager.getSetting('mapVorShow')}
            label='VOR'
            onPressed={(button, state): void => {
              this.writeToSetting('mapVorShow', !state.value);
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          <GtcTouchButton
            label='Settings'
            onPressed={(): void => {
              this.props.gtcService.openPopup(GtcMapSettingsPagePopupKeys.VorSettings);
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={this.mapReadSettingManager.getSetting('mapIntersectionShow')}
            label='INT'
            onPressed={(button, state): void => {
              this.writeToSetting('mapIntersectionShow', !state.value);
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          {this.renderRangeSelectButton('mapIntersectionRangeIndex', 9, 18, true, undefined, 'Map Intersection Range', 'map-settings-page-row-right') /* 1 nm to 40 nm */}
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={this.mapReadSettingManager.getSetting('mapNdbShow')}
            label='NDB'
            onPressed={(button, state): void => {
              this.writeToSetting('mapNdbShow', !state.value);
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          {this.renderRangeSelectButton('mapNdbRangeIndex', 9, 19, true, undefined, 'Map NDB Range', 'map-settings-page-row-right') /* 1 nm to 50 nm */}
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={this.mapReadSettingManager.getSetting('mapUserWaypointShow')}
            label='User Waypoint'
            onPressed={(button, state): void => {
              this.writeToSetting('mapUserWaypointShow', !state.value);
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          {this.renderRangeSelectButton('mapUserWaypointRangeIndex', 9, 27, true, undefined, 'Map User Waypoint Range', 'map-settings-page-row-right') /* 1 nm to 1000 nm */}
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={Subject.create(false)}
            label='SafeTaxi'
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          <GtcTouchButton
            label={
              <MapRangeSettingDisplay rangeIndex={10} rangeArray={this.mapRangeArray} displayUnit={this.unitsSettingManager.distanceUnitsLarge} />
            }
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-right'
          />
        </GtcListItem>
      </GtcList>
    );
  }

  /**
   * Renders the other tab.
   * @param listRef A reference to assign to the tab's list.
   * @param sidebarState The sidebar state to use.
   * @returns The other tab, as a VNode.
   */
  private renderOtherTab(listRef: NodeReference<GtcList<any>>, sidebarState: Subscribable<SidebarState | null>): VNode {
    return (
      <GtcList
        ref={listRef}
        bus={this.bus}
        itemsPerPage={5}
        listItemHeightPx={this.listItemHeight}
        listItemSpacingPx={1}
        sidebarState={sidebarState}
        class='map-settings-page-tab-list'
      >
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={Subject.create(false)}
            label={'Auto Zoom'}
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          <GtcTouchButton
            label='Settings'
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={this.mapReadSettingManager.getSetting('mapAutoNorthUpActive')}
            label={'North Up\nAbove'}
            onPressed={(button, state): void => {
              this.writeToSetting('mapAutoNorthUpActive', !state.value);
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          {this.renderRangeSelectButton('mapAutoNorthUpRangeIndex', 21, 27, true, undefined, 'Map North Up Above', 'map-settings-page-row-right') /* 100 nm to 1000 nm */}
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={this.mapReadSettingManager.getSetting('mapTrackVectorShow')}
            label='Track Vector'
            onPressed={(button, state): void => {
              this.writeToSetting('mapTrackVectorShow', !state.value);
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.mapReadSettingManager.getSetting('mapTrackVectorLookahead')}
            renderValue={(value): string => {
              if (value <= 60) {
                return `${value.toFixed(0)}\nseconds`;
              } else {
                return `${(value / 60).toFixed(0)}\nminutes`;
              }
            }}
            listParams={{
              title: 'Map Track Vector Time',
              inputData: [
                {
                  value: 30,
                  labelRenderer: () => '30 seconds'
                },
                {
                  value: 60,
                  labelRenderer: () => '60 seconds'
                },
                {
                  value: 120,
                  labelRenderer: () => '2 minutes'
                },
                {
                  value: 300,
                  labelRenderer: () => '5 minutes'
                },
                {
                  value: 600,
                  labelRenderer: () => '10 minutes'
                },
                {
                  value: 1200,
                  labelRenderer: () => '20 minutes'
                }
              ],
              selectedValue: this.mapReadSettingManager.getSetting('mapTrackVectorLookahead')
            }}
            onSelected={(value): void => {
              this.writeToSetting('mapTrackVectorLookahead', value);
            }}
            isInList
            class='map-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={this.mapReadSettingManager.getSetting('mapWindVectorShow')}
            label={'Wind Vector'}
            onPressed={(button, state): void => {
              this.writeToSetting('mapWindVectorShow', !state.value);
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={Subject.create(false)}
            label={'Fuel Rng (Rsv)'}
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          <GtcTouchButton
            label={
              <DurationDisplay
                value={UnitType.MINUTE.createNumber(45)}
                options={{
                  format: DurationDisplayFormat.hh_mm,
                  delim: DurationDisplayDelim.ColonOrCross
                }}
              />
            }
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={this.mapReadSettingManager.getSetting('mapAltitudeArcShow')}
            label={'Selected Alt\nRange Arc'}
            onPressed={(button, state): void => {
              this.writeToSetting('mapAltitudeArcShow', !state.value);
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={Subject.create(false)}
            label={'Field of View'}
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={Subject.create(false)}
            label={'Lat/Lon Lines'}
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          <GtcTouchButton
            label={
              <MapRangeSettingDisplay rangeIndex={9} rangeArray={this.mapRangeArray} displayUnit={this.unitsSettingManager.distanceUnitsLarge} />
            }
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-right'
          />
        </GtcListItem>
      </GtcList>
    );
  }

  /**
   * Renders the onside setting sync initialization popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns The onside setting sync initialization popup, as a VNode.
   */
  private renderSettingSyncOnsideInitPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    const buttonRefs: NodeReference<GtcTouchButton>[] = [];

    return (
      <GtcGenericView
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        title='Map Settings Sync Onside'
        onDestroy={() => { buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); }); }}
      >
        <div class='map-settings-sync-init'>
          <div class='map-settings-sync-init-message'>Initially Sync Settings From?</div>
          <div class='map-settings-sync-init-button-container'>
            {this.onsidePaneIndexes.map(index => {
              const manager = MapUserSettings.getDisplayPaneManager(this.bus, index);

              const ref = FSComponent.createRef<GtcTouchButton>();
              buttonRefs.push(ref);

              return (
                <GtcTouchButton
                  ref={ref}
                  label={GtcMapSettingsPage.PANE_TEXT[index]}
                  onPressed={(): void => {
                    GtcMapSettingSyncUtils.syncSettings(manager, this.onsideMapSettingManagers);
                    if (this.crossSideMapSyncSetting.value === MapSettingSync.All) {
                      this.crossSideMapSyncSetting.value = MapSettingSync.None;
                    }
                    this.onsideMapSyncSetting.value = MapSettingSync.Onside;
                    this.props.gtcService.goBack();
                    this.props.gtcService.goBack();
                  }}
                  class='map-settings-sync-init-button'
                />
              );
            })}
          </div>
        </div>
      </GtcGenericView>
    );
  }

  /**
   * Renders the all setting sync initialization popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns The all setting sync initialization popup, as a VNode.
   */
  private renderSettingSyncAllInitPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    const buttonRefs: NodeReference<GtcTouchButton>[] = [];

    return (
      <GtcGenericView
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        title='Map Settings Sync All'
        onDestroy={() => { buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); }); }}
      >
        <div class='map-settings-sync-init'>
          <div class='map-settings-sync-init-message'>Initially Sync Settings From?</div>
          <div class='map-settings-sync-init-button-container'>
            {this.allPaneIndexes.map(index => {
              const manager = MapUserSettings.getDisplayPaneManager(this.bus, index);

              const ref = FSComponent.createRef<GtcTouchButton>();
              buttonRefs.push(ref);

              return (
                <GtcTouchButton
                  ref={ref}
                  label={GtcMapSettingsPage.PANE_TEXT[index]}
                  onPressed={(): void => {
                    GtcMapSettingSyncUtils.syncSettings(manager, this.allMapSettingManagers);
                    this.onsideMapSyncSetting.value = MapSettingSync.All;
                    this.crossSideMapSyncSetting.value = MapSettingSync.All;
                    this.props.gtcService.goBack();
                    this.props.gtcService.goBack();
                  }}
                  class='map-settings-sync-init-button'
                />
              );
            })}
          </div>
        </div>
      </GtcGenericView>
    );
  }

  /**
   * Renders the detail settings popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns The detail settings popup, as a VNode.
   */
  private renderDetailSettingsPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    return (
      <GtcMapDetailSettingsPopup
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        mapReadSettingManager={this.mapReadSettingManager}
        writeToSetting={this.writeToSetting.bind(this)}
      />
    );
  }

  /**
   * Renders the traffic settings popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns The traffic settings popup, as a VNode.
   */
  private renderTrafficSettingsPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    return (
      <GtcMapTrafficSettingsPopup
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        trafficSystemType={this.props.trafficSystemType}
        adsb={this.props.adsb}
        mapReadSettingManager={this.mapReadSettingManager}
        writeToSetting={this.writeToSetting.bind(this)}
      />
    );
  }

  /**
   * Renders the TAWS settings popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns The TAWS settings popup, as a VNode.
   */
  private renderTawsSettingsPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    const buttonRefs = Array.from({ length: 2 }, () => FSComponent.createRef<DisplayComponent<any>>());

    return (
      <GtcGenericView
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        title='TAWS Settings'
        onDestroy={(): void => {
          buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });
        }}
      >
        <div class='map-settings-popup map-taws-settings'>
          <GtcToggleTouchButton
            ref={buttonRefs[0]}
            state={Subject.create(false)}
            label={'TAWS\nInhibit'}
            isEnabled={false}
            class='map-taws-settings-inhibit-button'
          />
          <GtcTouchButton
            ref={buttonRefs[1]}
            label={'Map\nSettings'}
            onPressed={(): void => {
              this.props.gtcService.openPopup(GtcMapSettingsPagePopupKeys.TerrainSettings);
            }}
            class='map-taws-settings-settings-button'
          />
        </div>
      </GtcGenericView>
    );
  }

  /**
   * Renders the terrain settings popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns The terrain settings popup, as a VNode.
   */
  private renderTerrainSettingsPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    const buttonRefs = Array.from({ length: 2 }, () => FSComponent.createRef<DisplayComponent<any>>());

    return (
      <GtcGenericView
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        title='Terrain Settings'
        onDestroy={(): void => {
          buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });
        }}
      >
        <div class='map-settings-popup map-terrain-settings'>
          {this.renderRangeSelectButton('mapTerrainRangeIndex', 9, 27, false, 'Terrain', 'Map Terrain Range', 'map-terrain-settings-button', undefined, buttonRefs[0]) /* 1 nm to 1000 nm */}
          <ToggleTouchButton
            ref={buttonRefs[1]}
            state={this.mapReadSettingManager.getSetting('mapTerrainScaleShow')}
            label={'Absolute Terrain\nScale'}
            onPressed={(button, state): void => {
              this.writeToSetting('mapTerrainScaleShow', !state.value);
            }}
            class='map-terrain-settings-button'
          />
        </div>
      </GtcGenericView>
    );
  }

  /**
   * Renders the airspace settings popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns The airspace settings popup, as a VNode.
   */
  private renderAirspaceSettingsPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    const buttonRefs = Array.from({ length: 8 }, () => FSComponent.createRef<DisplayComponent<any>>());

    return (
      <GtcGenericView
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        title='Airspace Settings'
        onDestroy={(): void => {
          buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });
        }}
      >
        <div class='map-settings-popup map-airspace-settings'>
          <ToggleTouchButton
            ref={buttonRefs[0]}
            state={Subject.create(false)}
            label={'Smart Airspace'}
            isEnabled={false}
            class='map-airspace-settings-button'
          />
          <ToggleTouchButton
            ref={buttonRefs[1]}
            state={Subject.create(false)}
            label={'Airspace\nAltitude Labels'}
            isEnabled={false}
            class='map-airspace-settings-button'
          />
          {this.renderRangeSelectButton('mapAirspaceClassBRangeIndex', -1, 22, false, 'Class B/TMA', 'Map Class B/TMA Range', 'map-airspace-settings-button', undefined, buttonRefs[2]) /* Off to 150 nm */}
          {this.renderRangeSelectButton('mapAirspaceRestrictedRangeIndex', -1, 21, false, 'Restricted', 'Map Restricted Range', 'map-airspace-settings-button', undefined, buttonRefs[3]) /* Off to 100 nm */}
          {this.renderRangeSelectButton('mapAirspaceClassCRangeIndex', -1, 21, false, 'Class C/TCA', 'Map Class C/TCA Range', 'map-airspace-settings-button', undefined, buttonRefs[4]) /* Off to 100 nm */}
          {this.renderRangeSelectButton('mapAirspaceMoaRangeIndex', -1, 23, false, 'MOA (Military)', 'Map MOA (Military) Range', 'map-airspace-settings-button', undefined, buttonRefs[5]) /* Off to 250 nm */}
          {this.renderRangeSelectButton('mapAirspaceClassDRangeIndex', -1, 21, false, 'Class D', 'Map Class D Range', 'map-airspace-settings-button', undefined, buttonRefs[6]) /* Off to 100 nm */}
          {this.renderRangeSelectButton('mapAirspaceOtherRangeIndex', -1, 23, false, 'Other/ADIZ', 'Map Other/ADIZ Range', 'map-airspace-settings-button', undefined, buttonRefs[7]) /* Off to 250 nm */}
        </div>
      </GtcGenericView>
    );
  }

  /**
   * Renders the airport settings popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns The airport settings popup, as a VNode.
   */
  private renderAirportSettingsPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    const buttonRefs = Array.from({ length: 3 }, () => FSComponent.createRef<DisplayComponent<any>>());

    return (
      <GtcGenericView
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        title='Airport Settings'
        onDestroy={(): void => {
          buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });
        }}
      >
        <div class='map-settings-popup map-airport-settings'>
          {this.renderRangeSelectButton('mapAirportLargeRangeIndex', -1, 27, false, 'Large Airport', 'Map Large Airport Range', 'map-airport-settings-button', undefined, buttonRefs[0]) /* Off to 1000 nm */}
          {this.renderRangeSelectButton('mapAirportMediumRangeIndex', -1, 24, false, 'Medium Airport', 'Map Medium Airport Range', 'map-airport-settings-button', undefined, buttonRefs[1]) /* Off to 400 nm */}
          {this.renderRangeSelectButton('mapAirportSmallRangeIndex', -1, 22, false, 'Small Airport', 'Map Small Airport Range', 'map-airport-settings-button', undefined, buttonRefs[2]) /* Off to 150 nm */}
        </div>
      </GtcGenericView>
    );
  }

  /**
   * Renders the VOR settings popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns The VOR settings popup, as a VNode.
   */
  private renderVorSettingsPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    const buttonRefs = Array.from({ length: 2 }, () => FSComponent.createRef<DisplayComponent<any>>());

    return (
      <GtcGenericView
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        title='VOR Settings'
        onDestroy={(): void => {
          buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });
        }}
      >
        <div class='map-settings-popup map-vor-settings'>
          {this.renderRangeSelectButton('mapVorRangeIndex', 9, 23, false, 'VOR', 'Map VOR Range', 'map-vor-settings-button', undefined, buttonRefs[0]) /* 1 nm to 250 nm */}
          <ToggleTouchButton
            ref={buttonRefs[1]}
            state={Subject.create(false)}
            label={'Compass Rose'}
            isEnabled={false}
            class='map-vor-settings-button'
          />
        </div>
      </GtcGenericView>
    );
  }

  /**
   * Renders a map range select button.
   * @param settingName The name of the setting to which to bind the button.
   * @param startIndex The index of the lowest selectable range, inclusive.
   * @param endIndex The index of the highest selectable range, inclusive.
   * @param isInList Whether the button is in a scrollable list.
   * @param label The button's label.
   * @param title The title of the selection list dialog.
   * @param buttonCssClass CSS class(es) to apply to the button's root element.
   * @param dialogCssClass CSS class(es) to apply to the selection list dialog.
   * @param ref A reference to which to assign the rendered button.
   * @returns A map range selection button, as a VNode.
   */
  private renderRangeSelectButton(
    settingName: keyof UserSettingValueFilter<G3000MapUserSettingTypes, number>,
    startIndex: number,
    endIndex: number,
    isInList: boolean,
    label?: string,
    title?: string,
    buttonCssClass?: string | SubscribableSet<string>,
    dialogCssClass?: string,
    ref?: NodeReference<any>
  ): VNode {
    return (
      <GtcMapRangeSettingSelectButton
        ref={ref}
        gtcService={this.props.gtcService}
        listDialogKey={GtcViewKeys.ListDialog1}
        unitsSettingManager={this.unitsSettingManager}
        mapReadSettingManager={this.mapReadSettingManager}
        settingName={settingName}
        startIndex={startIndex}
        endIndex={endIndex}
        writeToSetting={this.writeToSetting.bind(this)}
        isInList={isInList}
        label={label}
        title={title}
        dialogCssClass={dialogCssClass}
        class={buttonCssClass}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.mapRangeArray.destroy();

    this.syncSub?.destroy();

    super.destroy();
  }
}