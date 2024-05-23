import {
  ComponentProps, CompositeLogicXMLHost, ConsumerSubject, DisplayComponent, FSComponent, SubscribableMapFunctions, VNode
} from '@microsoft/msfs-sdk';

import { MfdMainPageKeys } from '../../../MFD/MainView/MfdMainPageKeys';
import { G3XGaugeColumn } from '../../../Shared/Components/EngineInstruments/G3XGaugeColumn';
import { G3XEisDefinition } from '../../../Shared/Components/G3XGaugesConfigFactory/Definitions/G3XEisDefinition';
import { G3XGaugeColumnProps } from '../../../Shared/Components/G3XGaugesConfigFactory/Definitions/G3XGaugeColumnProps';
import { G3XGaugeSpec } from '../../../Shared/Components/G3XGaugesConfigFactory/Definitions/G3XGaugeSpec';
import { G3XGaugeType } from '../../../Shared/Components/G3XGaugesConfigFactory/Definitions/G3XGaugeType';
import { TouchButton } from '../../../Shared/Components/TouchButton/TouchButton';
import { G3XEisEvents } from '../../../Shared/Eis/G3XEisEvents';
import { UiService } from '../../../Shared/UiSystem/UiService';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';

import './Gdu460Eis.css';

/**
 * Component props for {@link Gdu460Eis}.
 */
export interface Gdu460EisProps extends ComponentProps {
  /** The UI service. */
  uiService: UiService;

  /** Whether the EIS's parent GDU supports an MFD engine page. */
  supportEnginePage: boolean;

  /** The logic host for the EIS's gauges. */
  xmlLogicHost: CompositeLogicXMLHost;

  /**
   * The definition for rendering the EIS parsed from `panel.xml`. If defined, then the definition will be used to
   * render the EIS's contents. If not defined, then the component's children will be rendered as the EIS's contents.
   */
  eisDefinition?: G3XEisDefinition;
}

/**
 * A GDU 460 EIS.
 */
export class Gdu460Eis extends DisplayComponent<Gdu460EisProps> {

  private readonly buttonRef = FSComponent.createRef<TouchButton>();

  private readonly isEnginePageOpen = ConsumerSubject.create(null, false);

  /** @inheritDoc */
  public onAfterRender(): void {
    if (this.props.eisDefinition) {
      for (const func of this.props.eisDefinition.functions.values()) {
        this.props.xmlLogicHost.addFunction(func);
      }
    }

    if (this.props.supportEnginePage) {
      this.isEnginePageOpen.setConsumer(this.props.uiService.bus.getSubscriber<G3XEisEvents>().on('g3x_eis_engine_page_is_open'));
    }
  }

  /**
   * Responds to when the user presses this EIS display.
   */
  private onPressed(): void {
    if (!this.isEnginePageOpen.get()) {
      this.props.uiService.openMfdPane();
      this.props.uiService.resetMfdToPage(UiViewKeys.MfdMain);
      this.props.uiService.selectMfdMainPage(MfdMainPageKeys.Engine);
    } else {
      if (this.props.uiService.operatingType.get() === 'PFD') {
        this.props.uiService.toggleSplitPaneMode(false);
      }
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='eis'>
        <TouchButton
          ref={this.buttonRef}
          isEnabled={this.props.supportEnginePage}
          onPressed={this.onPressed.bind(this)}
          class='eis-button'
        >
          {this.renderContents()}
        </TouchButton>
      </div>
    );
  }

  /**
   * Renders the contents of this EIS.
   * @returns The contents of this EIS, as a VNode.
   */
  private renderContents(): VNode {
    if (this.props.eisDefinition) {
      return (
        <>
          <div
            class={{
              'column-container': true,
              'hidden': this.props.eisDefinition.combinedGauges ? this.isEnginePageOpen : false
            }}
          >
            {this.renderGauges(this.props.eisDefinition.defaultGauges)}
          </div>
          {this.props.eisDefinition.combinedGauges !== undefined && (
            <div
              class={{ 'column-container': true, 'hidden': this.isEnginePageOpen.map(SubscribableMapFunctions.not()) }}
            >
              {this.renderGauges(this.props.eisDefinition.combinedGauges)}
            </div>
          )}
        </>
      );
    } else {
      return (
        <>{this.props.children}</>
      );
    }
  }

  /**
   * Renders a set of gauges.
   * @param gauges The specifications for the gauges to render.
   * @returns The set of gauges defined by the specifications, as a VNode.
   */
  private renderGauges(gauges: G3XGaugeSpec[]): VNode {
    if (gauges[0]?.gaugeType === G3XGaugeType.Column) {
      return (
        <G3XGaugeColumn
          {...gauges[0].configuration as G3XGaugeColumnProps}
          logicHost={this.props.xmlLogicHost}
        />
      );
    } else {
      return (
        <G3XGaugeColumn
          bus={this.props.uiService.bus}
          gaugeConfig={gauges}
          logicHost={this.props.xmlLogicHost}
          style={{
            width: '100%',
            justifyContent: 'space-around'
          }}
        />
      );
    }
  }

  /** @inheritDoc */
  public destroy(): void {
    this.buttonRef.getOrDefault()?.destroy();

    this.isEnginePageOpen.destroy();

    super.destroy();
  }
}
