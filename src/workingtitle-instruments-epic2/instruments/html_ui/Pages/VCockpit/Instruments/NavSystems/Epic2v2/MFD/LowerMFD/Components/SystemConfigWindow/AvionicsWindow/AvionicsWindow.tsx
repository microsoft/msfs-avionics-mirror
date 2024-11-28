import { EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { PfdUserSettingManager, SectionOutline, Tab, TabbedContentContainer, TabContent, TabContentProps } from '@microsoft/msfs-epic2-shared';

import { AvionicsWindowTabs } from '../SystemConfigWindowTabs';
import { AvionicsWindowTopBar } from './AvionicsWindowTopBar';
import { FcsSettings } from './FcsSettings';
import { MiscSettings } from './MiscSettings';
import { PfdSettings } from './PfdSettings';

import './AvionicsWindow.css';

/** The properties for the {@link AvionicsWindow} component. */
interface AvionicsWindowProps extends TabContentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The aliased PFD settings manager. */
  pfdSettingsManager: PfdUserSettingManager;
}

/** The AvionicsWindow component. */
export class AvionicsWindow extends TabContent<AvionicsWindowProps> {
  private readonly tabContainerRef = FSComponent.createRef<TabbedContentContainer>();

  private readonly tabs: Readonly<Record<AvionicsWindowTabs, Tab>> = {
    'pfd': {
      renderLabel: () => 'PFD',
      renderContent: () => <PfdSettings bus={this.props.bus} pfdSettingsManager={this.props.pfdSettingsManager} />,
    },
    'fcs': {
      renderLabel: () => 'FCS',
      renderContent: () => <FcsSettings bus={this.props.bus} pfdSettingsManager={this.props.pfdSettingsManager} />,
    },
    'misc': {
      renderLabel: () => 'Misc',
      renderContent: () => <MiscSettings bus={this.props.bus} pfdSettingsManager={this.props.pfdSettingsManager}>Misc</MiscSettings>,
    },
    'cust-db': {
      renderLabel: () => 'Cust DB',
      renderContent: () => <TabContent bus={this.props.bus}>Cust DB</TabContent>,
    },
  };

  /** Active Tab **/
  private readonly activeTab = Subject.create(this.tabs.pfd);

  /** @inheritdoc */
  public onLineSelectKey(key: number): void {
    this.tabContainerRef.getOrDefault()?.onLineSelectKey(key);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="avionics-window-section">
        <SectionOutline bus={this.props.bus}>
          <AvionicsWindowTopBar
            bus={this.props.bus}
            activeTab={this.activeTab}
            tabs={this.tabs}
          />
          <TabbedContentContainer
            ref={this.tabContainerRef}
            bus={this.props.bus}
            tabs={Object.values(this.tabs)}
            activeTab={this.activeTab}
            className="avionics-window-main-tabbed-content-container"
          />
        </SectionOutline>
      </div>
    );
  }
}
