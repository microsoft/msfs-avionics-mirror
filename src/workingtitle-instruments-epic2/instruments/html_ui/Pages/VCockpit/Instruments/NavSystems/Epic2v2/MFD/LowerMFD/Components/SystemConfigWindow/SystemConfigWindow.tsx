import {
  CasSystem, ChecklistItemTypeDefMap, ChecklistManager, ChecklistStateProvider, ComponentProps, DisplayComponent, EventBus, FSComponent, HEvent, Subject, VNode
} from '@microsoft/msfs-sdk';

import {
  Epic2BezelButtonEvents, Epic2ChecklistGroupMetadata, Epic2ChecklistListMetadata, Epic2ChecklistMetadata, Epic2DuController, PfdUserSettingManager, Tab,
  TabbedContentContainer, TabContent
} from '@microsoft/msfs-epic2-shared';

import { AvionicsWindow } from './AvionicsWindow/AvionicsWindow';
import { ChecklistWindow } from './Checklist';
import { SystemConfigWindowMenu } from './SystemConfigWindowMenu';
import { SystemConfigWindowTabs } from './SystemConfigWindowTabs';

import './SystemConfigWindow.css';
import { SensorsWindow } from './Sensors/SensorsWindow';

/**
 *
 */
export interface SystemConfigWindowProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The aliased PFD settings manager. */
  pfdSettingsManager: PfdUserSettingManager;
  /** Checklist state provider */
  checklistStateProvider?: ChecklistStateProvider<ChecklistItemTypeDefMap, Epic2ChecklistMetadata, Epic2ChecklistGroupMetadata, Epic2ChecklistListMetadata>
  /** The checklist manager */
  checklistManager?: ChecklistManager
  /** CAS System */
  casSystem: CasSystem
}

/**
 *
 */
export class SystemConfigWindow extends DisplayComponent<SystemConfigWindowProps> {
  private readonly tabContainerRef = FSComponent.createRef<TabbedContentContainer>();

  private readonly tabs: Readonly<Record<SystemConfigWindowTabs, Tab>> = {
    'cklst': {
      renderLabel: () => 'CKLST',
      renderContent: () => <ChecklistWindow
        checklistManager={this.props.checklistManager}
        checklistStateProvider={this.props.checklistStateProvider}
        bus={this.props.bus}
        casSystem={this.props.casSystem}
      />,
    },
    'sensors': {
      renderLabel: () => 'Sensors',
      renderContent: () => <SensorsWindow bus={this.props.bus}>Sensors</SensorsWindow>,
    },
    'wx-lx-taws': {
      renderLabel: () => 'WX/LX/TAWS',
      renderContent: () => <TabContent bus={this.props.bus}>WX/LX/TAWS</TabContent>,
    },
    'avionics': {
      renderLabel: () => 'Avionics',
      renderContent: () => <AvionicsWindow bus={this.props.bus} pfdSettingsManager={this.props.pfdSettingsManager} />,
    },
    'datalink': {
      renderLabel: () => 'Datalink',
      renderContent: () => <TabContent bus={this.props.bus}>Datalink</TabContent>,
      isHidden: true,
    },
    'scms-dl': {
      renderLabel: () => 'SCMS/DL',
      renderContent: () => <TabContent bus={this.props.bus}>SCMS/DL</TabContent>,
      isDisabled: true,
    },
  };

  /** Active Tab **/
  private readonly activeTab = Subject.create(this.tabs.cklst);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.bus.getSubscriber<HEvent>().on('hEvent').handle(this.handleHEvent.bind(this));
  }

  /**
   * Handles H events.
   * @param event Name of the H event.
   */
  private handleHEvent(event: string): void {
    let index: number | undefined;

    switch (event) {
      case Epic2BezelButtonEvents.LSK_L7:
      case Epic2BezelButtonEvents.LSK_L8:
      case Epic2BezelButtonEvents.LSK_L9:
      case Epic2BezelButtonEvents.LSK_L10:
      case Epic2BezelButtonEvents.LSK_L11:
      case Epic2BezelButtonEvents.LSK_L12:
        index = Epic2DuController.getSoftKeyIndexFromSoftKeyHEvent(event) - 7;
        break;
    }

    if (index !== undefined) {
      this.tabContainerRef.getOrDefault()?.onLineSelectKey(index);
    }
  }

  /** @inheritdoc  */
  public render(): VNode | null {
    return <div class='system-config-window'>
      <TabbedContentContainer
        ref={this.tabContainerRef}
        bus={this.props.bus}
        tabs={Object.values(this.tabs)}
        activeTab={this.activeTab}
        className="avionics-window-main-tabbed-content-container"
      />
      <SystemConfigWindowMenu bus={this.props.bus} tabs={this.tabs} activeTab={this.activeTab} />
    </div>;
  }
}
