import {
  ComponentProps, DebounceTimer, DisplayComponent, EventBus, FSComponent, MutableSubscribable, Subject, Subscribable, SubscribableMapFunctions,
  SubscribableUtils, VNode
} from '@microsoft/msfs-sdk';

import { Epic2DuControlEvents, Tab, TouchButton } from '@microsoft/msfs-epic2-shared';

import { SystemConfigWindowTabs } from './SystemConfigWindowTabs';

import './SystemConfigWindowMenu.css';

/** The properties for the {@link SystemConfigWindowMenu} component. */
interface SystemConfigWindowMenuProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The active tab. */
  readonly activeTab: MutableSubscribable<Tab>;
  /** Array of tab names to be displayed on each tab. Must have at least 1 element. */
  readonly tabs: Readonly<Record<SystemConfigWindowTabs, Tab>>;
}

/** The SystemConfigWindowMenu component. */
export class SystemConfigWindowMenu extends DisplayComponent<SystemConfigWindowMenuProps> {
  /** The menu will be auto-hidden after this period of inactivity in ms. */
  private static readonly AUTO_HIDE_TIME = 30_000;

  private readonly isHidden = Subject.create(true);
  private readonly autoHideTimer = new DebounceTimer();

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.bus.getSubscriber<Epic2DuControlEvents>().on('epic2_du_page_button').handle(() => {
      this.isHidden.set(!this.isHidden.get());
    });
    this.isHidden.sub((isHidden) => {
      if (isHidden) {
        this.autoHideTimer.clear();
      } else {
        this.autoHideTimer.schedule(() => this.isHidden.set(true), SystemConfigWindowMenu.AUTO_HIDE_TIME);
      }
    });
  }

  /**
   * Sets the active tab and hides this menu.
   * @param tab The tab to be set active.
   */
  private setActiveTab(tab: Tab): void {
    this.props.activeTab.set(tab);
    this.isHidden.set(true);
  }

  private readonly setActiveTabFunc = this.setActiveTab.bind(this);

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={{
        'system-config-window-menu': true,
        'hidden': this.isHidden,
      }}>
        <SystemConfigMenuButton tab={this.props.tabs['cklst']} setActiveTab={this.setActiveTabFunc} />
        <SystemConfigMenuButton tab={this.props.tabs['sensors']} setActiveTab={this.setActiveTabFunc} />
        <SystemConfigMenuButton tab={this.props.tabs['wx-lx-taws']} setActiveTab={this.setActiveTabFunc} />
        <SystemConfigMenuButton tab={this.props.tabs['avionics']} setActiveTab={this.setActiveTabFunc} />
        <SystemConfigMenuButton tab={this.props.tabs['datalink']} setActiveTab={this.setActiveTabFunc} />
        <SystemConfigMenuButton tab={this.props.tabs['scms-dl']} setActiveTab={this.setActiveTabFunc} />
      </div>
    );
  }
}

/** Props for a button on the system configuration menu. */
interface SystemConfigMenuButtonProps {
  /** The tab this button is connected to. */
  readonly tab: Tab;
  /** A function to hide the menu. */
  setActiveTab: (tab: Tab) => unknown;
}

/** A button on the system configuration menu. */
class SystemConfigMenuButton extends DisplayComponent<SystemConfigMenuButtonProps> {
  private readonly isDisabled = SubscribableUtils.toSubscribable(this.props.tab.isDisabled ?? false, true) as Subscribable<boolean>;
  private readonly isHidden = SubscribableUtils.toSubscribable(this.props.tab.isHidden ?? false, true) as Subscribable<boolean>;

  /** @inheritdoc */
  public render(): VNode | null {
    return <TouchButton
      variant={'bar-lime'}
      label={this.props.tab.renderLabel()}
      class="system-config-window-menu-button"
      onPressed={() => this.props.setActiveTab(this.props.tab)}
      isEnabled={this.isDisabled.map(SubscribableMapFunctions.not())}
      isVisible={this.isHidden.map(SubscribableMapFunctions.not())}
    />;
  }
}
