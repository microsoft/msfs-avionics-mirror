import {
  FSComponent, MathUtils, MutableSubscribable, PerformancePlanRepository, SimVarValueType, Subject, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import {
  Epic2Fms, Epic2PerformancePlan, FlightPlanStore, InputFocusManager, MfdAliasedUserSettingTypes, Tab, TabbedContentContainer, TabContent, TabContentProps, Tabs
} from '@microsoft/msfs-epic2-shared';

import { GroundTabTabs } from '../FlightPlanTabTypes';
import { AltSpdTab, PerfModeOptions } from './AltSpdTab';
import { FplnTab } from './FplnTab';
import { FuelWeightTab } from './FuelWeightTab';

import './GroundTab.css';

/** Props for GroundTab. */
interface GroundTabProps extends TabContentProps {
  /** The FMS. */
  readonly fms: Epic2Fms;
  /** The performance plan repository. */
  readonly perfPlanRepository: PerformancePlanRepository<Epic2PerformancePlan>;
  /** The settings manager. */
  readonly settings: UserSettingManager<MfdAliasedUserSettingTypes>;
  /** The flight plan store.  */
  readonly activeFlightPlanStore: FlightPlanStore;
  /** The pending flight plan store.  */
  readonly pendingFlightPlanStore: FlightPlanStore;
  /** An instance of `InputFocusManager`. */
  readonly inputFocusManager: InputFocusManager;
}

/** Preflight Data type definition */
export type PreFlightData = {
  /** Predicted Cruise Speed [Mach] */
  crzSpdMach: MutableSubscribable<number | null>,
  /** Predicted Cruise Speed [Knots] */
  crzSpdKts: MutableSubscribable<number | null>,
  /** Predicted Cruise Fuel Flow [Lbs/Hr] */
  crzFF: MutableSubscribable<number | null>,
  /** Initial Cruise Altitude [Ft] */
  initCrzAlt: MutableSubscribable<number | null>,
  /** Performance Calculation Mode */
  perfMode: MutableSubscribable<PerfModeOptions>,
  /** Basic Operating Weight [lbs] */
  bow: MutableSubscribable<number | null>,
  /** Fuel Weight [lbs] */
  fuel: MutableSubscribable<number | null>,
  /** Number of passengers */
  paxNum: MutableSubscribable<number | null>,
  /** Weight per passenger [lbs] */
  paxWeight: MutableSubscribable<number | null>,
  /** Cargo weight [lbs] */
  cargo: MutableSubscribable<number | null>,
}

/** The GroundTab component. */
export class GroundTab extends TabContent<GroundTabProps> {

  private readonly preFlightData: PreFlightData = {
    crzSpdMach: this.props.fms.performancePlanProxy.cruiseTargetSpeedMach,
    crzSpdKts: this.props.fms.performancePlanProxy.cruiseTargetSpeedIas,
    crzFF: Subject.create(null),
    initCrzAlt: this.props.fms.performancePlanProxy.cruiseAltitude,
    perfMode: Subject.create<PerfModeOptions>(PerfModeOptions.CurrentPerfMode),
    bow: this.props.settings.getSetting('basicOperatingWeightLbs'),
    fuel: Subject.create(null),
    paxNum: Subject.create(null),
    paxWeight: this.props.settings.getSetting('passengerWeightLbs'),
    cargo: Subject.create(null),
  };

  private readonly tabs: Readonly<Record<GroundTabTabs, Tab>> = {
    fpln: {
      renderLabel: () => 'FPLN',
      renderContent: () => <FplnTab
        bus={this.props.bus}
        fms={this.props.fms}
        activePlanStore={this.props.activeFlightPlanStore}
        pendingPlanStore={this.props.pendingFlightPlanStore}
        inputFocusManager={this.props.inputFocusManager}
      />,
    },
    altSpd: {
      renderLabel: () => 'Alt/Spd',
      renderContent: () => <AltSpdTab
        bus={this.props.bus}
        perfPlanRepository={this.props.perfPlanRepository}
        settings={this.props.settings}
        preFlightData={this.preFlightData}
        inputFocusManager={this.props.inputFocusManager}
      />,
    },
    fuelWeight: {
      renderLabel: () => <>Fuel/<br />Weight</>,
      renderContent: () => <FuelWeightTab
        bus={this.props.bus}
        perfPlanRepository={this.props.perfPlanRepository}
        settings={this.props.settings}
        activeFlightPlanStore={this.props.activeFlightPlanStore}
        preFlightData={this.preFlightData}
        inputFocusManager={this.props.inputFocusManager}
      />,
    },
  };

  /** @inheritdoc */
  public override onAfterRender(): void {
    this.preFlightData.fuel.set(MathUtils.round(SimVar.GetSimVarValue('FUEL TOTAL QUANTITY WEIGHT', SimVarValueType.LBS), 10));
  }

  private readonly activeTab = Subject.create(this.tabs.fpln);

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="fpln-config-grnd-tab">
        <Tabs
          class="ground-tab-tabs"
          tabs={Object.values(this.tabs)}
          activeTab={this.activeTab}
          style='style-a'
        />
        <TabbedContentContainer
          bus={this.props.bus}
          tabs={Object.values(this.tabs)}
          activeTab={this.activeTab}
          className="fpln-config-grnd-tabbed-content-container"
        />
      </div>
    );
  }
}
