import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';

import { Epic2CockpitEvents, Tab, TouchButton } from '@microsoft/msfs-epic2-shared';

import { TscWindowTabs } from './TscWindowTabs';

import './TscWindowMenu.css';

/** The properties for the {@link TscWindowMenu} component. */
interface TscWindowMenuProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The active tab. */
  readonly activeTab: Subject<Tab>;
  /** The last viewed tab. */
  lastViewedTab: Subject<Tab>;
  /** Array of tab names to be displayed on each tab. Must have at least 1 element. */
  readonly tabs: Readonly<Record<TscWindowTabs, Tab>>;
}

/** The TscWindowMenu component. */
export class TscWindowMenu extends DisplayComponent<TscWindowMenuProps> {

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  private readonly subscriber = this.props.bus.getSubscriber<Epic2CockpitEvents>();

  private subs: Subscription[] = [];

  /** @inheritdoc */
  public onAfterRender(): void {
    this.subs = [
      this.subscriber.on('tsc_keyboard_active_input_id').handle((id) => {
        this.rootRef.instance.classList.toggle('hidden', id !== undefined);
      }),
    ];
  }

  /** @inheritdoc */
  private setActiveAndLastViewedTab = (tab: Tab): void => {
    this.props.activeTab.set(tab);
    this.props.lastViewedTab.set(tab);
  };

  /** @inheritdoc */
  private renderTab(tab: Tab): VNode {
    return (
      <TouchButton
        variant='base'
        label={tab.renderLabel()}
        onPressed={this.setActiveAndLastViewedTab.bind(this, tab)}
        isActive={this.props.activeTab.map((x) => x === tab)}
      />
    );
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='tsc-window-menu' ref={this.rootRef}>
        {this.renderTab(this.props.tabs.home)}
        {this.renderTab(this.props.tabs.duandccd)}
        {this.renderTab(this.props.tabs.com)}
        {this.renderTab(this.props.tabs.nav)}
        {this.renderTab(this.props.tabs.xpdr)}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.subs.map((sub) => sub.destroy());
  }
}
