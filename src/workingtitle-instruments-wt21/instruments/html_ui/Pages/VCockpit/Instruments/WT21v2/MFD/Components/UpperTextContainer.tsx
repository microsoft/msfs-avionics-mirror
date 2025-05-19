import {
  ChecklistStateProvider, ComponentProps, DisplayComponent, EventBus, FacilityLoader, FlightPlanner, FSComponent, NodeReference, PluginSystem, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import {
  EngineIndicationDisplayMode, GuiHEvent, MapSettingsMfdAliased, MfdDisplayMode, MFDSettingsAliased, MFDUpperWindowState, PerformancePlanProxy, WT21ChecklistSetDef,
  WT21PluginBinder
} from '@microsoft/msfs-wt21-shared';

import { CcpControlEvents } from '../CCP/CcpControlEvents';
import { WT21MfdAvionicsPlugin } from '../WT21MfdAvionicsPlugin';
import { FMSText } from './FMSText/FMSText';
import { SystemsPageComponent } from './SystemsOverlay/SystemsPageComponent';
import { Checklist } from './Checklist/Checklist';

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

  /** The mfd setting manager */
  mfdSettingManager: UserSettingManager<MFDSettingsAliased>;

  /** The map setting manager */
  mapSettingManager: UserSettingManager<MapSettingsMfdAliased>;

  /** The checklist definition */
  checklistDef?: WT21ChecklistSetDef;

  /** The checklist state provider */
  checklistStateProvider?: ChecklistStateProvider;
}

/** The UpperTextContainer component. */
export class UpperTextContainer extends DisplayComponent<UpperTextContainerProps> {
  private readonly upperTextRef = FSComponent.createRef<HTMLDivElement>();
  private readonly fmsTextRef = FSComponent.createRef<FMSText>();
  private readonly checklistRef = FSComponent.createRef<Checklist>();

  private firstSystemsPageRef: NodeReference<DisplayComponent<any> & SystemsPageComponent> | undefined;

  private readonly mfdUpperWindowStateSetting = this.props.mfdSettingManager.getSetting('mfdUpperWindowState');
  private readonly mfdDisplayModeSetting = this.props.mfdSettingManager.getSetting('mfdDisplayMode');

  private isVisible = true;

  /**
   * Handles interaction events.
   * @param hEvent The event name.
   * @param instrumentIndex The instrument index.
   * @returns Whether the event was handled.
   */
  public onInteractionEvent(hEvent: string, instrumentIndex: number): boolean {
    if (this.mfdUpperWindowStateSetting.get() === MFDUpperWindowState.Checklist) {
      // TODO(Vito): deduplicate this code
      if (hEvent.startsWith('Generic_Lwr_')) {
        const hEventWithoutPrefix = hEvent.match(/Generic_Lwr_([12])_(.*)/);

        if (hEventWithoutPrefix !== null) {
          const evtIndex = hEventWithoutPrefix[1];

          if (Number(evtIndex) === instrumentIndex) {
            let evt = undefined;
            switch (hEventWithoutPrefix[2]) {
              case 'MENU_ADV_INC':
                evt = GuiHEvent.LOWER_INC;
                break;
              case 'MENU_ADV_DEC':
                evt = GuiHEvent.LOWER_DEC;
                break;
              case 'DATA_PUSH':
                evt = GuiHEvent.UPPER_PUSH;
                break;
              case 'Push_ESC':
                evt = GuiHEvent.MFD_ESC;
                break;
            }

            if (evt) {
              return this.checklistRef.instance.onInteractionEvent(evt);
            }
          }
        }
      }
    }

    return false;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    const ccp = this.props.bus.getSubscriber<CcpControlEvents>();

    ccp.on('ccp_eng_state').handle(state => {
      // The expanded EIS format covers up the upper text display.
      this.isVisible = state === EngineIndicationDisplayMode.Compressed;
      this.updateChildVisibility();
    });

    this.props.mfdSettingManager.whenSettingChanged('mfdUpperWindowState').handle(this.updateChildVisibility.bind(this));
    this.props.mfdSettingManager.whenSettingChanged('mfdDisplayMode').handle(this.updateChildVisibility.bind(this));
  }

  /**
   * Updates the visibility of this container's child components.
   */
  private updateChildVisibility(): void {
    const mode = this.mfdDisplayModeSetting.value;

    if (mode === MfdDisplayMode.Text) {
      this.fmsTextRef.instance.setVisibility(false);
      this.checklistRef.getOrDefault()?.setVisibility(false);
      this.firstSystemsPageRef?.instance.setVisibility(false);
    } else {
      const state = this.mfdUpperWindowStateSetting.value;

      this.fmsTextRef.instance.setVisibility(this.isVisible && state === MFDUpperWindowState.FmsText);
      this.checklistRef.getOrDefault()?.setVisibility(this.isVisible && state === MFDUpperWindowState.Checklist);
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
        <FMSText
          ref={this.fmsTextRef}
          bus={this.props.bus}
          planner={this.props.planner}
          facLoader={this.props.facLoader}
          performancePlanProxy={this.props.performancePlanProxy}
          mapSettingManager={this.props.mapSettingManager}
          mfdSettingManager={this.props.mfdSettingManager}
        />
        {
          this.props.checklistStateProvider && this.props.checklistDef && <Checklist
            ref={this.checklistRef}
            bus={this.props.bus}
            checklistDef={this.props.checklistDef}
            checklistStateProvider={this.props.checklistStateProvider}
          />
        }
        {firstSystemsPageVNode}
      </div>
    );
  }
}
