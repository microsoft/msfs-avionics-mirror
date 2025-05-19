import {
  ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FacilityLoader, FlightPlanner, FSComponent, MappedSubject, Subject, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import {
  EngineIndicationDisplayMode, HSIContainer, InstrumentConfig, LeftInfoPanel, MfdDisplayMode, MFDSettingsAliased, MFDUpperWindowState, PerformancePlan,
  RightInfoPanel, WaypointAlerter, WT21FixInfoManager, WT21TCAS
} from '@microsoft/msfs-wt21-shared';

import { CcpControlEvents } from '../../CCP/CcpControlEvents';

import './MfdHsi.css';

/**
 * The properties for the MfdHsi component.
 */
interface MfdHsiProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The instrument configuration object */
  instrumentConfig: InstrumentConfig;

  /** A facility loader. */
  facLoader: FacilityLoader;

  /** An instance of the flight planner. */
  flightPlanner: FlightPlanner;

  /** An instance of TCAS. */
  tcas: WT21TCAS;

  /** The fix info manager. */
  fixInfo?: WT21FixInfoManager;

  /** The active performance plan */
  performancePlan: PerformancePlan;

  /** The mfd setting manager */
  mfdSettingManager: UserSettingManager<MFDSettingsAliased>;
}

/**
 * The MfdHsi component.
 */
export class MfdHsi extends DisplayComponent<MfdHsiProps> {
  private readonly waypointAlerter = new WaypointAlerter(this.props.bus);
  private readonly containerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly hsiContainerRef = FSComponent.createRef<HSIContainer>();
  private readonly mfdDisplayModeSetting = this.props.mfdSettingManager.getSetting('mfdDisplayMode');

  private readonly eisState = ConsumerSubject.create<EngineIndicationDisplayMode>(this.props.bus.getSubscriber<CcpControlEvents>().on('ccp_eng_state'), EngineIndicationDisplayMode.Compressed);

  private visibleForElectricity = Subject.create(false);
  private visibleForMode = Subject.create(false);

  /** Show the MFD HSI based on electricity status. */
  public electricityShow(): void {
    this.visibleForElectricity.set(true);
  }

  /** Hide the MFD HSI based on electricity status. */
  public electricityHide(): void {
    this.visibleForElectricity.set(false);
  }

  /** Show the MFD HSI based on MFD mode. */
  public modeShow(): void {
    this.visibleForMode.set(true);
  }

  /** Hide the MFD HSI based on MFD mode. */
  public modeHide(): void {
    this.visibleForMode.set(false);
  }

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.mfdDisplayModeSetting.sub((mode) => {
      if (mode === MfdDisplayMode.Map) {
        this.modeShow();
      } else {
        this.modeHide();
      }
    }, true);

    MappedSubject.create(this.visibleForElectricity, this.visibleForMode).sub(([visibleForElectricity, visibleForMode]) => {
      const shown = visibleForElectricity && visibleForMode;

      this.containerRef.instance.classList.toggle('hidden', !shown);
    }, true);

    MappedSubject.create(
      ([eisState, upperWindowState]) => {
        return upperWindowState === MFDUpperWindowState.Off
          && eisState == EngineIndicationDisplayMode.Compressed;
      },
      this.eisState,
      this.props.mfdSettingManager.getSetting('mfdUpperWindowState'),
    ).sub((shouldBeExtended) => {
      this.hsiContainerRef.instance.setMapShouldExtend(shouldBeExtended);
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <div ref={this.containerRef} class="mfd-hsi MFD">
          <div class="left-panel">
            <LeftInfoPanel bus={this.props.bus} instrumentConfig={this.props.instrumentConfig} waypointAlerter={this.waypointAlerter} />
          </div>
          <div class="hsi-center">
            <HSIContainer
              ref={this.hsiContainerRef}
              bus={this.props.bus}
              instrumentConfig={this.props.instrumentConfig}
              facLoader={this.props.facLoader}
              flightPlanner={this.props.flightPlanner}
              tcas={this.props.tcas}
              waypointAlerter={this.waypointAlerter}
              fixInfo={this.props.fixInfo}
              performancePlan={this.props.performancePlan}
            />
          </div>
          <div class="right-panel">
            <RightInfoPanel
              bus={this.props.bus}
              instrumentConfig={this.props.instrumentConfig}
              tcas={this.props.tcas}
            />
          </div>
        </div>
      </>
    );
  }
}
