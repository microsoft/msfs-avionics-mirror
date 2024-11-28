import { FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { Tab, TabbedContentContainer, TabContent, Tabs } from '@microsoft/msfs-epic2-shared';

import { InitTabTabs } from '../FlightPlanTabTypes';
import { DatabasesTab } from './DatabasesTab';
import { SwIdentTab } from './SwIdentTab';
import { TimeDateTab } from './TimeDateTab';

import './InitTab.css';

/** The InitTab component. */
export class InitTab extends TabContent {

  private readonly tabs: Readonly<Record<InitTabTabs, Tab>> = {
    timedate: {
      renderLabel: () => <>Time/<br />Date</>,
      renderContent: () => <TimeDateTab
        bus={this.props.bus}
      />,
    },
    databases: {
      renderLabel: () => <>Data<br />Bases</>,
      renderContent: () => <DatabasesTab
        bus={this.props.bus}
      />,
    },
    swident: {
      renderLabel: () => <>S/W<br />Ident</>,
      renderContent: () => <SwIdentTab
        bus={this.props.bus}
      />,
    }
  };

  private readonly activeTab = Subject.create(this.tabs.timedate);

  /** @inheritdoc */
  public onAfterRender(): void {
    // TODO do stuff
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="fpln-config-init-tab">
        <Tabs
          class="init-tab-tabs"
          tabs={Object.values(this.tabs)}
          activeTab={this.activeTab}
          style='style-a'
        />
        <TabbedContentContainer
          bus={this.props.bus}
          tabs={Object.values(this.tabs)}
          activeTab={this.activeTab}
          className="fpln-config-init-tabbed-content-container"
        />
      </div>
    );
  }
}
