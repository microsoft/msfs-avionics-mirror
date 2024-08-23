import { ComponentProps, DisplayComponent, EventBus, FacilityLoader, FlightPlanner, FSComponent, NodeReference, PluginSystem, VNode } from '@microsoft/msfs-sdk';

import { EngineIndicationDisplayMode, MfdDisplayMode, MFDUpperWindowState, MFDUserSettings, PerformancePlanProxy, WT21PluginBinder } from '@microsoft/msfs-wt21-shared';

import { CcpControlEvents } from '../CCP/CcpControlEvents';
import { FMSText } from './FMSText/FMSText';
import { WT21MfdAvionicsPlugin } from '../WT21MfdAvionicsPlugin';
import { SystemsPageComponent } from './SystemsOverlay/SystemsPageComponent';

import './UpperTextContainer.css';

/** The properties for the UpperTextContainer component. */
interface UpperTextContainerProps extends ComponentProps {
  /** The event bus */
  bus: EventBus;

  /** The plugin system */
  pluginSystem: PluginSystem<WT21MfdAvionicsPlugin, WT21PluginBinder>

  /** The flight planner */
  planner: FlightPlanner;

  /** The facility loader */
  facLoader: FacilityLoader,

  /** The active performance plan */
  performancePlanProxy: PerformancePlanProxy;
}

/** The UpperTextContainer component. */
export class UpperTextContainer extends DisplayComponent<UpperTextContainerProps> {
  private readonly upperTextRef = FSComponent.createRef<HTMLDivElement>();
  private readonly fmsTextRef = FSComponent.createRef<FMSText>();

  private firstSystemsPageRef: NodeReference<DisplayComponent<any> & SystemsPageComponent> | undefined;

  private readonly mfdSettingManager = MFDUserSettings.getAliasedManager(this.props.bus);
  private readonly mfdUpperWindowStateSetting = this.mfdSettingManager.getSetting('mfdUpperWindowState');
  private readonly mfdDisplayModeSetting = this.mfdSettingManager.getSetting('mfdDisplayMode');

  private isVisible = true;

  /** @inheritdoc */
  public onAfterRender(): void {
    const ccp = this.props.bus.getSubscriber<CcpControlEvents>();

    ccp.on('ccp_eng_state').handle(state => {
      // The expanded EIS format covers up the upper text display.
      this.isVisible = state === EngineIndicationDisplayMode.Compressed;
      this.updateChildVisibility();
    });

    this.mfdSettingManager.whenSettingChanged('mfdUpperWindowState').handle(this.updateChildVisibility.bind(this));
    this.mfdSettingManager.whenSettingChanged('mfdDisplayMode').handle(this.updateChildVisibility.bind(this));
  }

  /**
   * Updates the visibility of this container's child components.
   */
  private updateChildVisibility(): void {
    const mode = this.mfdDisplayModeSetting.value;

    if (mode === MfdDisplayMode.Text) {
      this.fmsTextRef.instance.setVisibility(false);
      this.firstSystemsPageRef?.instance.setVisibility(false);
    } else {
      const state = this.mfdUpperWindowStateSetting.value;

      this.fmsTextRef.instance.setVisibility(this.isVisible && state === MFDUpperWindowState.FmsText);
      this.firstSystemsPageRef?.instance.setVisibility(this.isVisible && state === MFDUpperWindowState.Systems);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    let firstSystemsPageVNode: VNode | null = null;
    this.props.pluginSystem.callPlugins((it) => {
      const systemPages = it.renderSystemPages?.();

      if (systemPages) {
        this.firstSystemsPageRef ??= systemPages[0].ref;
        firstSystemsPageVNode ??= systemPages[0].vnode;
      }
    });

    return (
      <div class="upper-text-container" ref={this.upperTextRef}>
        <FMSText ref={this.fmsTextRef} bus={this.props.bus} planner={this.props.planner} facLoader={this.props.facLoader} performancePlanProxy={this.props.performancePlanProxy} />
        {firstSystemsPageVNode}
      </div>
    );
  }
}
