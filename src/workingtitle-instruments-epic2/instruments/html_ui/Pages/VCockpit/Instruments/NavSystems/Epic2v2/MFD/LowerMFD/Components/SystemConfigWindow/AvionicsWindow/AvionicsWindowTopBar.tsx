import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, MutableSubscribable, Subscribable, SubscribableMapFunctions, SubscribableUtils, VNode
} from '@microsoft/msfs-sdk';

import { Tab, TouchButton } from '@microsoft/msfs-epic2-shared';

import { AvionicsWindowTabs } from '../SystemConfigWindowTabs';

import './AvionicsWindowTopBar.css';

/** The properties for the {@link AvionicsWindowTopBar} component. */
interface AvionicsWindowTopBarProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The active tab. */
  readonly activeTab: MutableSubscribable<Tab>;
  /** Array of tab names to be displayed on each tab. Must have at least 1 element. */
  readonly tabs: Readonly<Record<AvionicsWindowTabs, Tab>>;
}

/** The AvionicsWindowTopBar component. */
export class AvionicsWindowTopBar extends DisplayComponent<AvionicsWindowTopBarProps> {
  /**
   * Sets the active tab.
   * @param tab The tab to be set active.
   */
  private setActiveTab(tab: Tab): void {
    this.props.activeTab.set(tab);
  }

  private readonly setActiveTabFunc = this.setActiveTab.bind(this);

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="avionics-window-top-bar">
        <AvionicsWindowTab tab={this.props.tabs['pfd']} activeTab={this.props.activeTab} setActiveTab={this.setActiveTabFunc} />
        <AvionicsWindowTab tab={this.props.tabs['fcs']} activeTab={this.props.activeTab} setActiveTab={this.setActiveTabFunc} />
        <AvionicsWindowTab tab={this.props.tabs['misc']} activeTab={this.props.activeTab} setActiveTab={this.setActiveTabFunc} />
        <AvionicsWindowTab tab={this.props.tabs['cust-db']} activeTab={this.props.activeTab} setActiveTab={this.setActiveTabFunc} />
      </div>
    );
  }
}

/** Props for a button on the system configuration menu. */
interface AvionicsWindowTabProps {
  /** The tab this button is connected to. */
  readonly tab: Tab;
  /** The active tab. */
  activeTab: Subscribable<Tab>;
  /** A function to hide the menu. */
  setActiveTab: (tab: Tab) => unknown;
}

/** A button on the system configuration menu. */
class AvionicsWindowTab extends DisplayComponent<AvionicsWindowTabProps> {
  private readonly isDisabled = SubscribableUtils.toSubscribable(this.props.tab.isDisabled ?? false, true) as Subscribable<boolean>;
  private readonly isActive = this.props.activeTab.map((v) => v === this.props.tab);

  /** @inheritdoc */
  public render(): VNode | null {
    return <>
      <TouchButton
        variant={'bar-lime'}
        label={this.props.tab.renderLabel()}
        class="avionics-window-button"
        onPressed={() => this.props.setActiveTab(this.props.tab)}
        isEnabled={this.isDisabled.map(SubscribableMapFunctions.not())}
        isActive={this.isActive}
      >
        <div class="touch-button-white-footer" />
      </TouchButton>
    </>;
  }
}
