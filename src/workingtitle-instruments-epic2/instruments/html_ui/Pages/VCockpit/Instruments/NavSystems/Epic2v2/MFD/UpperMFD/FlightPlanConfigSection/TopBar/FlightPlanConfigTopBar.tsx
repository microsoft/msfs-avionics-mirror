import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { Tab, TouchButton } from '@microsoft/msfs-epic2-shared';

import { FlightPlanConfigTopTabs } from '../FlightPlanTabTypes';

import './FlightPlanConfigTopBar.css';

/** The properties for the {@link FlightPlanConfigTopBar} component. */
interface FlightPlanConfigTopBarProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The active tab. */
  readonly activeTab: Subject<Tab>;
  /** Array of tab names to be displayed on each tab. Must have at least 1 element. */
  readonly tabs: Readonly<Record<FlightPlanConfigTopTabs, Tab>>;
}

/** The FlightPlanConfigTopBar component. */
export class FlightPlanConfigTopBar extends DisplayComponent<FlightPlanConfigTopBarProps> {
  /** @inheritdoc */
  public onAfterRender(): void {
    // TODO do stuff
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private renderTab(tab: Tab): VNode {
    return (
      <TouchButton
        variant={'bar-lime'}
        label={tab.renderLabel()}
        class="fpln-tab-icon-button"
        onPressed={() => this.props.activeTab.set(tab)}
        isActive={this.props.activeTab.map((x) => x === tab)}
      />
    );
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="flight-plan-config-top-bar">
        <TouchButton label="FPLN" class="fpln-button" variant={'bar-lime'} />
        {this.renderTab(this.props.tabs.init)}
        {this.renderTab(this.props.tabs.ground)}
        {this.renderTab(this.props.tabs.takeoff)}
        {this.renderTab(this.props.tabs.descent)}
      </div>
    );
  }
}
