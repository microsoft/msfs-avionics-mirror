import { FSComponent, NodeReference, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { HorizonConfig } from '@microsoft/msfs-wtg3000-common';
import { TabbedContainer, TabConfiguration } from '../../Components/Tabs/TabbedContainer';
import { TabbedContent } from '../../Components/Tabs/TabbedContent';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcPfdSettingsPageGeneralList } from './GtcPfdSettingsPageGeneralList';
import { GtcPfdSettingsPageMasterList } from './GtcPfdSettingsPageMasterList';
import { GtcPfdSettingsPagePfdList } from './GtcPfdSettingsPagePfdList';
import { GtcPfdSettingsPageSvtList } from './GtcPfdSettingsPageSvtList';
import { GtcPfdSettingsPageTabContent } from './GtcPfdSettingsPageTabContent';

import './GtcPfdSettingsPage.css';

/**
 * Component props for GtcPfdSettingsPage.
 */
export interface GtcPfdSettingsPageProps extends GtcViewProps {
  /** A config defining PFD horizon display options. */
  horizonConfig: HorizonConfig;
}

/**
 * A GTC PFD settings page.
 */
export class GtcPfdSettingsPage extends GtcView<GtcPfdSettingsPageProps> {
  /** @inheritdoc */
  public override readonly title = Subject.create('PFD Settings') as Subscribable<string | undefined>;

  private readonly masterListRef = FSComponent.createRef<GtcPfdSettingsPageMasterList>();
  private readonly tabContainerRef = FSComponent.createRef<TabbedContainer>();

  private readonly listItemHeight = this.props.horizonConfig.advancedSvt === true
    ? this.props.gtcService.orientation === 'horizontal' ? 130 : 70  // tabbed
    : this.props.gtcService.orientation === 'horizontal' ? 162 : 88; // non-tabbed
  private readonly listItemSpacing = this.props.horizonConfig.advancedSvt === true
    ? this.props.gtcService.orientation === 'horizontal' ? 4 : 2     // tabbed
    : this.props.gtcService.orientation === 'horizontal' ? 6 : 4;    // non-tabbed

  /** @inheritdoc */
  public onAfterRender(): void {
    if (this.masterListRef.getOrDefault() !== null) {
      this._activeComponent.set(this.masterListRef.instance);
    }
  }

  /** @inheritdoc */
  public onResume(): void {
    this.tabContainerRef.getOrDefault()?.resume();
  }

  /** @inheritdoc */
  public onPause(): void {
    this.tabContainerRef.getOrDefault()?.pause();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='pfd-settings-page'>
        {
          this.props.horizonConfig.advancedSvt === true
            ? this.renderTabs()
            : this.renderMasterList()
        }
      </div>
    );
  }

  /**
   * Renders a master list containing all settings.
   * @returns A master list containing all settings, as a VNode.
   */
  private renderMasterList(): VNode {
    return (
      <div class='pfd-settings-page-master-list-container'>
        <GtcPfdSettingsPageMasterList
          ref={this.masterListRef}
          gtcService={this.props.gtcService}
          horizonDirectorCueOption={this.props.horizonConfig.directorCue ?? 'single'}
          listItemHeight={this.listItemHeight}
          listItemSpacing={this.listItemSpacing}
          sidebarState={this._sidebarState}
        />
      </div>
    );
  }

  /**
   * Renders a tabbed container of all settings.
   * @returns A tabbed container of all settings, as a VNode.
   */
  private renderTabs(): VNode {
    return (
      <TabbedContainer ref={this.tabContainerRef} configuration={TabConfiguration.Left5} class='pfd-settings-page-tabs'>
        {this.renderTab(1, 'PFD', this.renderPfdTab.bind(this))}
        {this.renderTab(2, 'SVT', this.renderSvtTab.bind(this))}
        {this.renderTab(3, 'General', this.renderGeneralTab.bind(this))}
      </TabbedContainer>
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
    renderContent?: (contentRef: NodeReference<GtcPfdSettingsPageTabContent>, sidebarState: Subscribable<SidebarState | null>) => VNode
  ): VNode {
    const contentRef = FSComponent.createRef<GtcPfdSettingsPageTabContent>();
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
   * Renders the PFD tab.
   * @param contentRef A reference to assign to the tab's content.
   * @param sidebarState The sidebar state to use.
   * @returns The PFD tab, as a VNode.
   */
  private renderPfdTab(contentRef: NodeReference<GtcPfdSettingsPageTabContent>, sidebarState: Subscribable<SidebarState | null>): VNode {
    return (
      <GtcPfdSettingsPagePfdList
        ref={contentRef}
        gtcService={this.props.gtcService}
        horizonDirectorCueOption={this.props.horizonConfig.directorCue ?? 'single'}
        listItemHeight={this.listItemHeight}
        listItemSpacing={this.listItemSpacing}
        sidebarState={sidebarState}
      />
    );
  }

  /**
   * Renders the SVT tab.
   * @param contentRef A reference to assign to the tab's content.
   * @param sidebarState The sidebar state to use.
   * @returns The SVT tab, as a VNode.
   */
  private renderSvtTab(contentRef: NodeReference<GtcPfdSettingsPageTabContent>, sidebarState: Subscribable<SidebarState | null>): VNode {
    return (
      <GtcPfdSettingsPageSvtList
        ref={contentRef}
        gtcService={this.props.gtcService}
        listItemHeight={this.listItemHeight}
        listItemSpacing={this.listItemSpacing}
        sidebarState={sidebarState}
      />
    );
  }

  /**
   * Renders the General tab.
   * @param contentRef A reference to assign to the tab's content.
   * @param sidebarState The sidebar state to use.
   * @returns The General tab, as a VNode.
   */
  private renderGeneralTab(contentRef: NodeReference<GtcPfdSettingsPageTabContent>, sidebarState: Subscribable<SidebarState | null>): VNode {
    return (
      <GtcPfdSettingsPageGeneralList
        ref={contentRef}
        gtcService={this.props.gtcService}
        listItemHeight={this.listItemHeight}
        listItemSpacing={this.listItemSpacing}
        sidebarState={sidebarState}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.masterListRef.getOrDefault()?.destroy();
    this.tabContainerRef.getOrDefault()?.destroy();

    super.destroy();
  }
}