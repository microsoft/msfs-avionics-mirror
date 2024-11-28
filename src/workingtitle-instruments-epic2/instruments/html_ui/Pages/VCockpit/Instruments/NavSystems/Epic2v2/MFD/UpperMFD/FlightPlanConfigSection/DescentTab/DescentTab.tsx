import { FSComponent, PerformancePlanRepository, Subject, VNode } from '@microsoft/msfs-sdk';

import {
  Epic2Fms, Epic2PerformancePlan, Epic2VSpeedController, FlightPlanStore, ModalService, Tab, TabbedContentContainer, TabContent, TabContentProps, Tabs
} from '@microsoft/msfs-epic2-shared';

import { DescentTabTabs } from '../FlightPlanTabTypes';
import { FltSumTab } from './FltSumTab';
import { StarLdgTab } from './StarLdgTab';
import { TCompTab } from './TCompTab';

import './DescentTab.css';

/** Props for DescentTab. */
interface DescentTabProps extends TabContentProps {
  /** The modal service. */
  readonly modalService: ModalService;
  /** The flight plan store.  */
  readonly activeFlightPlanStore: FlightPlanStore;
  /** The FMS. */
  readonly fms: Epic2Fms;
  /** The performance plan repository. */
  readonly perfPlanRepository: PerformancePlanRepository<Epic2PerformancePlan>;
  /** The vspeed controller */
  readonly vSpeedController: Epic2VSpeedController
}

/** The DescentTab component. */
export class DescentTab extends TabContent<DescentTabProps> {

  private readonly tabs: Readonly<Record<DescentTabTabs, Tab>> = {
    starLanding: {
      renderLabel: () => <>STAR/<br />Ldg</>,
      renderContent: () => <StarLdgTab
        bus={this.props.bus}
        modalService={this.props.modalService}
        activeFlightPlanStore={this.props.activeFlightPlanStore}
        fms={this.props.fms}
        perfPlanRepository={this.props.perfPlanRepository}
        inputFocusManager={this.props.inputFocusManager}
        vSpeedController={this.props.vSpeedController}
      />,
    },
    tcomp: {
      renderLabel: () => 'TComp',
      renderContent: () => <TCompTab
        bus={this.props.bus}
        fms={this.props.fms}
        activeFlightPlanStore={this.props.activeFlightPlanStore}
        inputFocusManager={this.props.inputFocusManager}
      />,
    },
    fltSum: {
      renderLabel: () => <>Flt<br />Sum</>,
      renderContent: () => <FltSumTab
        bus={this.props.bus}
        fms={this.props.fms}
        activeFlightPlanStore={this.props.activeFlightPlanStore}
        inputFocusManager={this.props.inputFocusManager}
      />,
    }
  };

  private readonly activeTab = Subject.create(this.tabs.starLanding);

  /** @inheritdoc */
  public override onAfterRender(): void {
    // Show Flt Sum tab after landing
    this.props.fms.flightLogger.landingTime.sub(t => {
      if (t > 0) { this.activeTab.set(this.tabs.fltSum); }
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="fpln-config-des-tab">
        <Tabs
          class="descent-tab-tabs"
          tabs={Object.values(this.tabs)}
          activeTab={this.activeTab}
          style='style-a'
        />
        <TabbedContentContainer
          bus={this.props.bus}
          tabs={Object.values(this.tabs)}
          activeTab={this.activeTab}
          className="fpln-config-des-tabbed-content-container"
        />
      </div>
    );
  }
}
