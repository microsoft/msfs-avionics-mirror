import { DisplayComponent, FSComponent, NodeReference, Subject, Subscribable, SubscribableSet, UserSettingValueFilter, VNode } from '@microsoft/msfs-sdk';

import { MapTerrainSettingMode, MapUtils, TrafficSystemType, UnitsUserSettings } from '@microsoft/msfs-garminsdk';
import { G3000MapUserSettingTypes, MapAliasedUserSettingManager, MapRangeSettingDisplay, PfdMapLayoutSettingMode, PfdUserSettings } from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List/GtcList';
import { GtcListItem } from '../../Components/List/GtcListItem';
import { TabbedContainer, TabConfiguration } from '../../Components/Tabs/TabbedContainer';
import { TabbedContent } from '../../Components/Tabs/TabbedContent';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcMapRangeSettingSelectButton } from '../../Components/TouchButton/GtcMapRangeSettingSelectButton';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcValueTouchButton } from '../../Components/TouchButton/GtcValueTouchButton';
import { SetValueTouchButton } from '../../Components/TouchButton/SetValueTouchButton';
import { ToggleTouchButton } from '../../Components/TouchButton/ToggleTouchButton';
import { TouchButton } from '../../Components/TouchButton/TouchButton';
import { GtcGenericView } from '../../GtcService/GtcGenericView';
import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcMapDetailSettingIcon } from './GtcMapDetailSettingIcon';
import { GtcMapDetailSettingsPopup } from './GtcMapDetailSettingsPopup';
import { GtcMapNexradSettingsPopup } from './GtcMapNexradSettingsPopup';
import { GtcMapTrafficSettingsPopup } from './GtcMapTrafficSettingsPopup';

import './GtcMapSettingsPage.css';
import './GtcPfdMapSettingsPage.css';
import './GtcMapSettingsPopups.css';

/**
 * Component props for GtcPfdMapSettingsPage.
 */
export interface GtcPfdMapSettingsPageProps extends GtcViewProps {
  /** The type of traffic system installed in the airplane. */
  trafficSystemType: TrafficSystemType;

  /** Whether the installed traffic system supports ADS-B in. */
  adsb: boolean;
}

/**
 * GTC view keys for popups owned by the PFD map settings page.
 */
enum GtcPfdMapSettingsPagePopupKeys {
  DetailSettings = 'PfdMapDetailSettings',
  TrafficSettings = 'PfdMapTrafficSettings',
  TawsSettings = 'PfdMapTawsSettings',
  TerrainSettings = 'PfdMapTerrainSettings',
  NexradSettings = 'PfdMapNexradSettings'
}

/**
 * A GTC PFD map settings page.
 */
export class GtcPfdMapSettingsPage extends GtcView<GtcPfdMapSettingsPageProps> {
  private thisNode?: VNode;

  private readonly tabContainerRef = FSComponent.createRef<TabbedContainer>();

  public override readonly title = Subject.create('PFD Map Settings');

  private readonly pfdSettingManager = PfdUserSettings.getAliasedManager(this.bus, this.props.gtcService.pfdControlIndex);
  private readonly mapSettingManager = new MapAliasedUserSettingManager(this.bus);
  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.bus);

  private readonly mapRangeArray = this.unitsSettingManager.getSetting('unitsDistance').map(mode => MapUtils.nextGenMapRanges(mode));

  private readonly listItemHeight = this.props.gtcService.orientation === 'horizontal' ? 130 : 70;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.mapSettingManager.usePfdSettings(this.props.gtcService.pfdControlIndex);

    this.props.gtcService.registerView(GtcViewLifecyclePolicy.Transient, GtcPfdMapSettingsPagePopupKeys.DetailSettings, 'PFD', this.renderDetailSettingsPopup.bind(this));
    this.props.gtcService.registerView(GtcViewLifecyclePolicy.Transient, GtcPfdMapSettingsPagePopupKeys.TrafficSettings, 'PFD', this.renderTrafficSettingsPopup.bind(this));
    this.props.gtcService.registerView(GtcViewLifecyclePolicy.Transient, GtcPfdMapSettingsPagePopupKeys.TawsSettings, 'PFD', this.renderTawsSettingsPopup.bind(this));
    this.props.gtcService.registerView(GtcViewLifecyclePolicy.Transient, GtcPfdMapSettingsPagePopupKeys.TerrainSettings, 'PFD', this.renderTerrainSettingsPopup.bind(this));
    this.props.gtcService.registerView(GtcViewLifecyclePolicy.Transient, GtcPfdMapSettingsPagePopupKeys.NexradSettings, 'PFD', this.renderNexradSettingsPopup.bind(this));
  }

  /** @inheritdoc */
  public onResume(): void {
    this.tabContainerRef.instance.resume();
  }

  /** @inheritdoc */
  public onPause(): void {
    this.tabContainerRef.instance.pause();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-settings-page pfd-map-settings-page'>
        {this.renderLeftColumn()}
        <TabbedContainer ref={this.tabContainerRef} configuration={TabConfiguration.Left5} class='map-settings-page-right'>
          {this.renderTab(1, 'Overlays', this.renderOverlaysTab.bind(this))}
        </TabbedContainer>
      </div>
    );
  }

  /**
   * Renders the left column (layout and detail buttons).
   * @returns The left column, as a VNode.
   */
  private renderLeftColumn(): VNode {
    const detailIcon = FSComponent.createRef<GtcMapDetailSettingIcon>();

    return (
      <div class='map-settings-page-left'>
        <SetValueTouchButton
          state={this.pfdSettingManager.getSetting('pfdMapLayout')}
          setValue={PfdMapLayoutSettingMode.Off}
          label='Off'
        />
        <SetValueTouchButton
          state={this.pfdSettingManager.getSetting('pfdMapLayout')}
          setValue={PfdMapLayoutSettingMode.Hsi}
          label='HSI Map'
        />
        <SetValueTouchButton
          state={this.pfdSettingManager.getSetting('pfdMapLayout')}
          setValue={PfdMapLayoutSettingMode.Inset}
          label='Inset Map'
        />
        <SetValueTouchButton
          state={this.pfdSettingManager.getSetting('pfdMapLayout')}
          setValue={PfdMapLayoutSettingMode.Traffic}
          label='Traffic Inset'
        />
        <TouchButton
          label={'Map Detail'}
          onPressed={(): void => {
            this.props.gtcService.openPopup(GtcPfdMapSettingsPagePopupKeys.DetailSettings);
          }}
          onDestroy={(): void => { detailIcon.getOrDefault()?.destroy(); }}
          class='map-settings-page-detail-button'
        >
          <GtcMapDetailSettingIcon
            ref={detailIcon}
            mode={this.mapSettingManager.getSetting('mapDeclutter')}
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
  private renderOverlaysTab(listRef: NodeReference<GtcList<any>>, sidebarState: Subscribable<SidebarState | null>): VNode {
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
            label={'Weather\nLegend'}
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
        </GtcListItem>
        <GtcListItem class='map-settings-page-row'>
          <GtcToggleTouchButton
            state={this.mapSettingManager.getSetting('mapTrafficShow')}
            label='Traffic'
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='map-settings-page-row-left'
          />
          <GtcTouchButton
            label='Settings'
            onPressed={(): void => {
              this.props.gtcService.openPopup(GtcPfdMapSettingsPagePopupKeys.TrafficSettings);
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
            state={this.mapSettingManager.getSetting('mapTerrainMode')}
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
              selectedValue: this.mapSettingManager.getSetting('mapTerrainMode')
            }}
            isInList
            class='map-settings-page-row-left'
          />
          <GtcTouchButton
            label='Settings'
            onPressed={(): void => {
              this.props.gtcService.openPopup(GtcPfdMapSettingsPagePopupKeys.TawsSettings);
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
            state={this.mapSettingManager.getSetting('mapNexradShow')}
            label={'Connext\nRadar'}
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
   * Renders the detail settings popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @returns The detail settings popup, as a VNode.
   */
  private renderDetailSettingsPopup(gtcService: GtcService, controlMode: GtcControlMode): VNode {
    return (
      <GtcMapDetailSettingsPopup
        gtcService={gtcService}
        controlMode={controlMode}
        mapReadSettingManager={this.mapSettingManager}
      />
    );
  }

  /**
   * Renders the traffic settings popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @returns The traffic settings popup, as a VNode.
   */
  private renderTrafficSettingsPopup(gtcService: GtcService, controlMode: GtcControlMode): VNode {
    return (
      <GtcMapTrafficSettingsPopup
        gtcService={gtcService}
        controlMode={controlMode}
        trafficSystemType={this.props.trafficSystemType}
        adsb={this.props.adsb}
        mapReadSettingManager={this.mapSettingManager}
      />
    );
  }

  /**
   * Renders the TAWS settings popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @returns The TAWS settings popup, as a VNode.
   */
  private renderTawsSettingsPopup(gtcService: GtcService, controlMode: GtcControlMode): VNode {
    const buttonRefs = Array.from({ length: 2 }, () => FSComponent.createRef<DisplayComponent<any>>());

    return (
      <GtcGenericView
        gtcService={gtcService}
        controlMode={controlMode}
        title='TAWS Settings'
        onDestroy={(): void => {
          buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });
        }}
      >
        <div class='map-settings-popup map-taws-settings'>
          <ToggleTouchButton
            ref={buttonRefs[0]}
            state={Subject.create(false)}
            label={'TAWS\nInhibit'}
            isEnabled={false}
            class='map-taws-settings-inhibit-button'
          />
          <TouchButton
            ref={buttonRefs[1]}
            label={'Map\nSettings'}
            onPressed={(): void => {
              this.props.gtcService.openPopup(GtcPfdMapSettingsPagePopupKeys.TerrainSettings);
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
   * @returns The terrain settings popup, as a VNode.
   */
  private renderTerrainSettingsPopup(gtcService: GtcService, controlMode: GtcControlMode): VNode {
    const buttonRefs = Array.from({ length: 2 }, () => FSComponent.createRef<DisplayComponent<any>>());

    return (
      <GtcGenericView
        gtcService={gtcService}
        controlMode={controlMode}
        title='Terrain Settings'
        onDestroy={(): void => {
          buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });
        }}
      >
        <div class='map-settings-popup map-terrain-settings'>
          {this.renderRangeSelectButton('mapTerrainRangeIndex', 9, 27, false, 'Terrain', 'Map Terrain Range', 'map-terrain-settings-button', undefined, buttonRefs[0]) /* 1 nm to 1000 nm */}
          <ToggleTouchButton
            ref={buttonRefs[1]}
            state={Subject.create(false)}
            label={'Absolute Terrain\nScale'}
            isEnabled={false}
            class='map-terrain-settings-button'
          />
        </div>
      </GtcGenericView>
    );
  }

  /**
   * Renders the NEXRAD settings popup.
   * @returns The NEXRAD settings popup, as a VNode.
   */
  private renderNexradSettingsPopup(): VNode {
    return (
      <GtcMapNexradSettingsPopup
        gtcService={this.props.gtcService}
        controlMode={'PFD'}
        mapReadSettingManager={this.mapSettingManager}
      />
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
        mapReadSettingManager={this.mapSettingManager}
        settingName={settingName}
        startIndex={startIndex}
        endIndex={endIndex}
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

    super.destroy();
  }
}