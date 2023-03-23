import { ComponentProps, DisplayComponent, EventBus, FacilityLoader, FlightPlanner, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { PerformancePlanProxy } from '../../Shared/Performance/PerformancePlanProxy';
import { CcpControlEvents, EngineIndicationDisplayMode } from '../CCP/CcpControlEvents';
import { MfdDisplayMode, MFDUpperWindowState, MFDUserSettings } from '../MFDUserSettings';
import { EisInstrument } from './EngineIndication/EisData';
import { FMSText } from './FMSText/FMSText';
import { Systems1 } from './SystemsOverlay/Systems1';

import './UpperTextContainer.css';

/** The properties for the UpperTextContainer component. */
interface UpperTextContainerProps extends ComponentProps {
  /** The event bus */
  bus: EventBus;
  /** The flight planner */
  planner: FlightPlanner;
  /**
   * The facility loader
   */
  facLoader: FacilityLoader,
  /** The engine data instrument */
  eis: EisInstrument;
  /** The active performance plan */
  performancePlanProxy: PerformancePlanProxy;
}

/** The UpperTextContainer component. */
export class UpperTextContainer extends DisplayComponent<UpperTextContainerProps> {
  private readonly upperTextRef = FSComponent.createRef<HTMLDivElement>();
  private readonly fmsTextRef = FSComponent.createRef<FMSText>();
  private readonly systems1Ref = FSComponent.createRef<Systems1>();

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
      this.systems1Ref.instance.setVisibility(false);
    } else {
      const state = this.mfdUpperWindowStateSetting.value;

      this.fmsTextRef.instance.setVisibility(this.isVisible && state === MFDUpperWindowState.FmsText);
      this.systems1Ref.instance.setVisibility(this.isVisible && state === MFDUpperWindowState.Systems);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="upper-text-container" ref={this.upperTextRef}>
        <FMSText ref={this.fmsTextRef} bus={this.props.bus} planner={this.props.planner} facLoader={this.props.facLoader} performancePlanProxy={this.props.performancePlanProxy} />
        <Systems1 ref={this.systems1Ref} eis={this.props.eis} />
      </div>
    );
  }
}
