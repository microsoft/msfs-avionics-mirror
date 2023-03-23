/* eslint-disable max-len */
import { FSComponent, NodeReference, VNode } from '@microsoft/msfs-sdk';
import { Fms, VNavDataProvider } from '@microsoft/msfs-garminsdk';
import { FlightPlanStore, FmsSpeedUserSettingManager, FmsSpeedTargetDataProvider, VnavProfileStore } from '@microsoft/msfs-wtg3000-common';
import { TabbedContainer, TabConfiguration } from '../../Components/Tabs/TabbedContainer';
import { TabbedContent } from '../../Components/Tabs/TabbedContent';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcAdvancedVnavProfilePageTabContent } from './GtcAdvancedVnavProfilePageTabContent';
import { GtcAdvancedVnavClimbTab } from './GtcAdvancedVnavClimbTab';
import { GtcAdvancedVnavCruiseTab } from './GtcAdvancedVnavCruiseTab';
import { GtcAdvancedVnavDescentTab } from './GtcAdvancedVnavDescentTab';
import { GtcAdvancedVnavProfileTab } from './GtcAdvancedVnavProfileTab';

import './GtcAdvancedVnavProfilePage.css';

/** Props for {@link GtcAdvancedVnavProfilePage}. */
interface GtcAdvancedVnavProfilePageProps extends GtcViewProps {
  /** The fms. */
  fms: Fms;

  /** The flight plan store. */
  flightPlanStore: FlightPlanStore;

  /** A provider of VNAV data. */
  vnavDataProvider: VNavDataProvider;

  /** A setting manager for FMS speeds. */
  fmsSpeedSettingManager: FmsSpeedUserSettingManager;

  /** A provider of FMS speed target data. */
  fmsSpeedTargetDataProvider: FmsSpeedTargetDataProvider;
}

/** The advanced vnav profile page. */
export class GtcAdvancedVnavProfilePage extends GtcView<GtcAdvancedVnavProfilePageProps> {
  private readonly tabContainerRef = FSComponent.createRef<TabbedContainer>();

  private readonly vnavProfileStore = new VnavProfileStore(this.bus, this.props.flightPlanStore, this.gtcService.isAdvancedVnav, this.props.vnavDataProvider);

  /** @inheritdoc */
  public onResume(): void {
    this.vnavProfileStore.resume();
    this.tabContainerRef.instance.resume();
  }

  /** @inheritdoc */
  public onPause(): void {
    this.vnavProfileStore.pause();
    this.tabContainerRef.instance.pause();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='advanced-vnav-profile'>
        <TabbedContainer ref={this.tabContainerRef} configuration={TabConfiguration.Left5} class='advanced-vnav-profile-tabs'>
          {this.renderTab(1, 'Profile', this.renderProfileTab.bind(this))}
          {this.renderTab(2, 'Climb', this.renderClimbTab.bind(this))}
          {this.renderTab(3, 'Cruise', this.renderCruiseTab.bind(this))}
          {this.renderTab(4, 'Descent', this.renderDescentTab.bind(this))}
        </TabbedContainer>
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
    renderContent?: (contentRef: NodeReference<GtcAdvancedVnavProfilePageTabContent>) => VNode
  ): VNode {
    const contentRef = FSComponent.createRef<GtcAdvancedVnavProfilePageTabContent>();

    return (
      <TabbedContent
        position={position}
        label={label}
        onPause={(): void => {
          this._activeComponent.set(null);
          contentRef.instance.onPause();
        }}
        onResume={(): void => {
          this._title.set(`VNAV ${label}`);
          this._activeComponent.set(contentRef.getOrDefault());
          contentRef.instance.onResume();
        }}
        disabled={renderContent === undefined}
      >
        {renderContent && renderContent(contentRef)}
      </TabbedContent>
    );
  }

  /**
   * Renders the profile tab.
   * @param contentRef A reference to assign to the tab's content.
   * @returns The profile tab, as a VNode.
   */
  private renderProfileTab(contentRef: NodeReference<GtcAdvancedVnavProfilePageTabContent>): VNode {
    return (
      <GtcAdvancedVnavProfileTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        fms={this.props.fms}
        store={this.props.flightPlanStore}
        vnavDataProvider={this.props.vnavDataProvider}
        fmsSpeedSettingManager={this.props.fmsSpeedSettingManager}
        fmsSpeedTargetDataProvider={this.props.fmsSpeedTargetDataProvider}
        vnavProfileStore={this.vnavProfileStore}
      />
    );
  }

  /**
   * Renders the climb tab.
   * @param contentRef A reference to assign to the tab's content.
   * @returns The climb tab, as a VNode.
   */
  private renderClimbTab(contentRef: NodeReference<GtcAdvancedVnavProfilePageTabContent>): VNode {
    return (
      <GtcAdvancedVnavClimbTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        fms={this.props.fms}
        store={this.props.flightPlanStore}
        fmsSpeedSettingManager={this.props.fmsSpeedSettingManager}
      />
    );
  }

  /**
   * Renders the cruise tab.
   * @param contentRef A reference to assign to the tab's content.
   * @returns The cruise tab, as a VNode.
   */
  private renderCruiseTab(contentRef: NodeReference<GtcAdvancedVnavProfilePageTabContent>): VNode {
    return (
      <GtcAdvancedVnavCruiseTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        fms={this.props.fms}
        store={this.props.flightPlanStore}
        fmsSpeedSettingManager={this.props.fmsSpeedSettingManager}
      />
    );
  }

  /**
   * Renders the descent tab.
   * @param contentRef A reference to assign to the tab's content.
   * @returns The descent tab, as a VNode.
   */
  private renderDescentTab(contentRef: NodeReference<GtcAdvancedVnavProfilePageTabContent>): VNode {
    return (
      <GtcAdvancedVnavDescentTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        fms={this.props.fms}
        store={this.props.flightPlanStore}
        fmsSpeedSettingManager={this.props.fmsSpeedSettingManager}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.tabContainerRef.getOrDefault()?.destroy();

    this.vnavProfileStore.destroy();

    super.destroy();
  }
}