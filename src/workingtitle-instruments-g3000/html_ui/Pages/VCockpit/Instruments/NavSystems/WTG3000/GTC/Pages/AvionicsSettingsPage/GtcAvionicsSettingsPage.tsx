import {
  ClockEvents, ConsumerSubject, DateTimeFormatter, FSComponent, MappedSubject, NodeReference, Subject, Subscribable,
  SubscribableMapFunctions, VNode,
} from '@microsoft/msfs-sdk';

import { DateTimeFormatSettingMode, DateTimeUserSettings, TimeDisplayFormat } from '@microsoft/msfs-garminsdk';

import { AuralAlertsConfig, HorizonDirectorCueOption, TimeDisplay, TouchdownCalloutsConfig } from '@microsoft/msfs-wtg3000-common';

import { TabbedContainer, TabConfiguration } from '../../Components/Tabs/TabbedContainer';
import { TabbedContent } from '../../Components/Tabs/TabbedContent';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcAvionicsSettingsPageAlertsList } from './GtcAvionicsSettingsPageAlertsList';
import { GtcAvionicsSettingsPageAudioList } from './GtcAvionicsSettingsPageAudioList';
import { GtcAvionicsSettingsPageMfdFieldsList } from './GtcAvionicsSettingsPageMfdFieldsList';
import { GtcAvionicsSettingsPageSystemList } from './GtcAvionicsSettingsPageSystemList';
import { GtcAvionicsSettingsPageTabContent } from './GtcAvionicsSettingsPageTabContent';
import { GtcAvionicsSettingsPageUnitsList } from './GtcAvionicsSettingsPageUnitsList';

import './GtcAvionicsSettingsPage.css';

/**
 * Component props for GtcAvionicsSettingsPage.
 */
export interface GtcAvionicsSettingsPageProps extends GtcViewProps {
  /** PFD horizon display flight director cue style support. */
  horizonDirectorCueOption: HorizonDirectorCueOption;

  /** An aural alerts configuration object. */
  auralAlertsConfig: AuralAlertsConfig;

  /** A touchdown callouts configuration object. */
  touchdownCalloutsConfig: TouchdownCalloutsConfig;
}

/**
 * A GTC avionics settings page.
 */
export class GtcAvionicsSettingsPage extends GtcView<GtcAvionicsSettingsPageProps> {
  private static readonly DATE_TIME_FORMAT_SETTING_MAP = {
    [DateTimeFormatSettingMode.Local12]: TimeDisplayFormat.Local12,
    [DateTimeFormatSettingMode.Local24]: TimeDisplayFormat.Local24,
    [DateTimeFormatSettingMode.UTC]: TimeDisplayFormat.UTC
  };

  private static readonly DATE_FORMATTER = DateTimeFormatter.create('{dd}–{mon}–{YYYY}', { nanString: '__–___–____' });

  private readonly timeDisplayRef = FSComponent.createRef<TimeDisplay>();
  private readonly tabContainerRef = FSComponent.createRef<TabbedContainer>();

  private readonly simTime = ConsumerSubject.create(this.props.gtcService.bus.getSubscriber<ClockEvents>().on('simTime'), 0);
  private readonly dateTimeSettingManager = DateTimeUserSettings.getManager(this.bus);
  private readonly dateTimeFormat = this.dateTimeSettingManager.getSetting('dateTimeFormat').map(settingMode => {
    return GtcAvionicsSettingsPage.DATE_TIME_FORMAT_SETTING_MAP[settingMode] ?? TimeDisplayFormat.UTC;
  });

  private readonly time = this.simTime.map(SubscribableMapFunctions.withPrecision(1000));
  private readonly dateTimeOffset = MappedSubject.create(
    ([format, offset]): number => {
      return format === DateTimeFormatSettingMode.UTC ? 0 : offset;
    },
    this.dateTimeSettingManager.getSetting('dateTimeFormat'),
    this.dateTimeSettingManager.getSetting('dateTimeLocalOffset')
  );
  private readonly dateTime = MappedSubject.create(
    ([time, offset]): number => {
      return time + offset;
    },
    this.time,
    this.dateTimeOffset
  );

  private readonly listItemHeight = this.props.gtcService.orientation === 'horizontal' ? 155 : 85;
  private readonly listItemSpacing = this.props.gtcService.orientation === 'horizontal' ? 6 : 4;

  /** @inheritdoc */
  public onAfterRender(): void {
    this._title.set('Avionics Settings');
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.tabContainerRef.instance.selectTab(1);
  }

  /** @inheritdoc */
  public onResume(): void {
    this.tabContainerRef.instance.resume();
    this.simTime.resume();
    this.dateTime.resume();
  }

  /** @inheritdoc */
  public onPause(): void {
    this.tabContainerRef.instance.pause();
    this.simTime.pause();
    this.dateTime.pause();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='avionics-settings-page'>
        {this.renderHeader()}
        <TabbedContainer ref={this.tabContainerRef} configuration={TabConfiguration.Left5} class='avionics-settings-page-tabs'>
          {this.renderTab(1, 'System', this.renderSystemTab.bind(this))}
          {this.renderTab(2, 'Units', this.renderUnitsTab.bind(this))}
          {this.renderTab(3, 'Alerts', this.renderAlertsTab.bind(this))}
          {this.renderTab(4, 'MFD<br>Fields', this.renderMfdFieldsTab.bind(this))}
          {this.renderTab(5, 'Audio', this.renderAudioTab.bind(this))}
        </TabbedContainer>
      </div>
    );
  }

  /**
   * Renders this page's date/time header.
   * @returns This page's date/time header, as a VNode.
   */
  private renderHeader(): VNode {
    return (
      <div class='avionics-settings-page-header'>
        <div class='avionics-settings-page-header-date'>
          {this.dateTime.map(GtcAvionicsSettingsPage.DATE_FORMATTER)}
        </div>
        <TimeDisplay
          ref={this.timeDisplayRef}
          time={this.time}
          format={this.dateTimeFormat}
          localOffset={this.dateTimeSettingManager.getSetting('dateTimeLocalOffset')}
          class='avionics-settings-page-header-time'
        />
      </div>
    );
  }

  /**
   * Renders a settings tab for this page's tab container.
   * @param position The position of the tab.
   * @param label The tab label.
   * @param renderContent A function which renders the tab contents.
   * @returns A settings tab for this page's tab container, as a VNode.
   */
  private renderTab(
    position: number,
    label: string,
    renderContent?: (contentRef: NodeReference<GtcAvionicsSettingsPageTabContent>, sidebarState: Subscribable<SidebarState | null>) => VNode
  ): VNode {
    const contentRef = FSComponent.createRef<GtcAvionicsSettingsPageTabContent>();
    const sidebarState = Subject.create<SidebarState | null>(null);

    return (
      <TabbedContent
        position={position}
        label={label}
        onPause={(): void => {
          this._activeComponent.set(null);
          sidebarState.set(null);
          contentRef.instance.onPause();
        }}
        onResume={(): void => {
          this._activeComponent.set(contentRef.getOrDefault());
          sidebarState.set(this._sidebarState);
          contentRef.instance.onResume();
        }}
        disabled={renderContent === undefined}
      >
        {renderContent && renderContent(contentRef, sidebarState)}
      </TabbedContent>
    );
  }

  /**
   * Renders the system tab.
   * @param contentRef A reference to assign to the tab's content.
   * @param sidebarState The sidebar state to use.
   * @returns The sensor tab, as a VNode.
   */
  private renderSystemTab(contentRef: NodeReference<GtcAvionicsSettingsPageTabContent>, sidebarState: Subscribable<SidebarState | null>): VNode {
    return (
      <GtcAvionicsSettingsPageSystemList
        ref={contentRef}
        gtcService={this.props.gtcService}
        horizonDirectorCueOption={this.props.horizonDirectorCueOption}
        listItemHeight={this.listItemHeight}
        listItemSpacing={this.listItemSpacing}
        sidebarState={sidebarState}
      />
    );
  }

  /**
   * Renders the units tab.
   * @param contentRef A reference to assign to the tab's content.
   * @param sidebarState The sidebar state to use.
   * @returns The units tab, as a VNode.
   */
  private renderUnitsTab(contentRef: NodeReference<GtcAvionicsSettingsPageTabContent>, sidebarState: Subscribable<SidebarState | null>): VNode {
    return (
      <GtcAvionicsSettingsPageUnitsList
        ref={contentRef}
        gtcService={this.props.gtcService}
        listItemHeight={this.listItemHeight}
        listItemSpacing={this.listItemSpacing}
        sidebarState={sidebarState}
      />
    );
  }

  /**
   * Renders the alerts tab.
   * @param contentRef A reference to assign to the tab's content.
   * @param sidebarState The sidebar state to use.
   * @returns The alerts tab, as a VNode.
   */
  private renderAlertsTab(contentRef: NodeReference<GtcAvionicsSettingsPageTabContent>, sidebarState: Subscribable<SidebarState | null>): VNode {
    return (
      <GtcAvionicsSettingsPageAlertsList
        ref={contentRef}
        gtcService={this.props.gtcService}
        controlMode={this.props.controlMode}
        displayPaneIndex={this.props.displayPaneIndex}
        listItemHeight={this.listItemHeight}
        listItemSpacing={this.listItemSpacing}
        sidebarState={sidebarState}
        touchdownCalloutsConfig={this.props.touchdownCalloutsConfig}
      />
    );
  }

  /**
   * Renders the MFD data fields tab.
   * @param contentRef A reference to assign to the tab's content.
   * @param sidebarState The sidebar state to use.
   * @returns The MFD data fields tab, as a VNode.
   */
  private renderMfdFieldsTab(contentRef: NodeReference<GtcAvionicsSettingsPageTabContent>, sidebarState: Subscribable<SidebarState | null>): VNode {
    return (
      <GtcAvionicsSettingsPageMfdFieldsList
        ref={contentRef}
        gtcService={this.props.gtcService}
        listItemHeight={this.listItemHeight}
        listItemSpacing={this.listItemSpacing}
        sidebarState={sidebarState}
      />
    );
  }

  /**
   * Renders the audio tab.
   * @param contentRef A reference to assign to the tab's content.
   * @param sidebarState The sidebar state to use.
   * @returns The audio tab, as a VNode.
   */
  private renderAudioTab(contentRef: NodeReference<GtcAvionicsSettingsPageTabContent>, sidebarState: Subscribable<SidebarState | null>): VNode {
    return (
      <GtcAvionicsSettingsPageAudioList
        ref={contentRef}
        gtcService={this.props.gtcService}
        listItemHeight={this.listItemHeight}
        listItemSpacing={this.listItemSpacing}
        sidebarState={sidebarState}
        supportedAuralAlertVoices={this.props.auralAlertsConfig.supportedVoices}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.timeDisplayRef.getOrDefault()?.destroy();
    this.tabContainerRef.getOrDefault()?.destroy();

    this.simTime.destroy();
    this.dateTimeFormat.destroy();
    this.dateTimeOffset.destroy();

    super.destroy();
  }
}