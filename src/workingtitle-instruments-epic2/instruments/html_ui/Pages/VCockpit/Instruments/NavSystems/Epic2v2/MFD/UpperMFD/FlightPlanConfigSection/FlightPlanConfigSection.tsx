import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, PerformancePlanRepository, Subject, Subscription, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import {
  Epic2Fms, Epic2PerformancePlan, Epic2VSpeedController, FlightPlanStore, InputFocusManager, KeyboardInputButton, MfdAliasedUserSettingTypes, ModalService,
  SectionOutline, Tab, TabbedContentContainer
} from '@microsoft/msfs-epic2-shared';

import { DescentTab } from './DescentTab/DescentTab';
import { FlightPlanConfigTopTabs } from './FlightPlanTabTypes';
import { GroundTab } from './GroundTab/GroundTab';
import { IconPlaneLanding } from './Icons/IconPlaneLanding';
import { IconPlaneRunway } from './Icons/IconPlaneRunway';
import { IconPlaneTakeoff } from './Icons/IconPlaneTakeoff';
import { InitTab } from './InitTab/InitTab';
import { SidTakeoffTab } from './TakeoffTab/SidTakeoffTab';
import { FlightPlanConfigTopBar } from './TopBar/FlightPlanConfigTopBar';

import './FlightPlanConfigSection.css';

/** The properties for the {@link FlightPlanConfigSection} component. */
interface FlightPlanConfigSectionProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
  /** The FMS. */
  readonly fms: Epic2Fms;
  /** The flight plan store.  */
  readonly activeFlightPlanStore: FlightPlanStore;
  /** The flight plan store.  */
  readonly pendingFlightPlanStore: FlightPlanStore;
  /** The modal service. */
  readonly modalService: ModalService;
  /** The performance plan repository. */
  readonly perfPlanRepository: PerformancePlanRepository<Epic2PerformancePlan>;
  /** The settings manager. */
  readonly settings: UserSettingManager<MfdAliasedUserSettingTypes>;
  /** The vspeed controller */
  readonly vSpeedController: Epic2VSpeedController
}

/** The FlightPlanConfigSection component. */
export class FlightPlanConfigSection extends DisplayComponent<FlightPlanConfigSectionProps> {
  private readonly inputFocusManager = new InputFocusManager(this.props.bus);

  private readonly tabs: Readonly<Record<FlightPlanConfigTopTabs, Tab>> = {
    init: {
      name: 'init',
      renderLabel: () => 'INIT',
      renderContent: () => <InitTab bus={this.props.bus} />,
    },
    ground: {
      name: 'ground',
      renderLabel: () => <IconPlaneRunway />,
      renderContent: () => (
        <GroundTab
          bus={this.props.bus}
          fms={this.props.fms}
          perfPlanRepository={this.props.perfPlanRepository}
          settings={this.props.settings}
          activeFlightPlanStore={this.props.activeFlightPlanStore}
          pendingFlightPlanStore={this.props.pendingFlightPlanStore}
          inputFocusManager={this.inputFocusManager}
        />
      ),
    },
    takeoff: {
      name: 'takeoff',
      renderLabel: () => <IconPlaneTakeoff />,
      renderContent: () => <SidTakeoffTab
        bus={this.props.bus}
        fms={this.props.fms}
        modalService={this.props.modalService}
        activeFlightPlanStore={this.props.activeFlightPlanStore}
        pendingFlightPlanStore={this.props.pendingFlightPlanStore}
        perfPlanRepository={this.props.perfPlanRepository}
        inputFocusManager={this.inputFocusManager}
        vSpeedController={this.props.vSpeedController}
      />,
    },
    descent: {
      name: 'descent',
      renderLabel: () => <IconPlaneLanding />,
      renderContent: () => <DescentTab
        bus={this.props.bus}
        modalService={this.props.modalService}
        activeFlightPlanStore={this.props.activeFlightPlanStore}
        pendingFlightPlanStore={this.props.pendingFlightPlanStore}
        fms={this.props.fms}
        perfPlanRepository={this.props.perfPlanRepository}
        inputFocusManager={this.inputFocusManager}
        vSpeedController={this.props.vSpeedController}
      />,
    },
  };

  /** Active Tab **/
  private readonly activeTab = Subject.create(this.tabs.ground);

  private landingTimeSub: Subscription | undefined;
  private activeTabSub: Subscription | undefined;

  /** @inheritdoc */
  public onAfterRender(): void {
    // Show Flt Sum tab after landing
    this.landingTimeSub = this.props.fms.flightLogger.landingTime.sub(t => {
      if (t > 0) { this.activeTab.set(this.tabs.descent); }
    });

    this.activeTabSub = this.activeTab.sub((v: Tab) => this.inputFocusManager.activeTopTab.set(v.name));
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={{ 'flight-plan-config-section': true, 'hidden': this.props.activeFlightPlanStore.isFlightPlanListExpanded }} data-checklist="checklist-fmw">
        <SectionOutline bus={this.props.bus}>
          <FlightPlanConfigTopBar
            bus={this.props.bus}
            activeTab={this.activeTab}
            tabs={this.tabs}
          />
          <TabbedContentContainer
            bus={this.props.bus}
            tabs={Object.values(this.tabs)}
            activeTab={this.activeTab}
            className="flight-plan-config-main-tabbed-content-container"
          />
          <KeyboardInputButton bus={this.props.bus} classes='keyboard-button' />
        </SectionOutline>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.landingTimeSub?.destroy();
    this.activeTabSub?.destroy();
    this.inputFocusManager.destroy();
  }
}
