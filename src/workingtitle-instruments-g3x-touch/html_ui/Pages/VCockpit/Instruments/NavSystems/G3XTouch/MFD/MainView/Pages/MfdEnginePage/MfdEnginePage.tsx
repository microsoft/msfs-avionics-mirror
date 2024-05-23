import {
  CompositeLogicXMLHost, FSComponent, MathUtils, ReadonlyFloat64Array, Subject, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { G3XGaugeColumn } from '../../../../Shared/Components/EngineInstruments';
import {
  G3XEnginePageDefinition, G3XEnginePageGaugesDefinition, G3XEnginePageTabDefinition, G3XEnginePageTabType
} from '../../../../Shared/Components/G3XGaugesConfigFactory/Definitions/G3XEnginePageDefinition';
import { G3XGaugeColumnProps } from '../../../../Shared/Components/G3XGaugesConfigFactory/Definitions/G3XGaugeColumnProps';
import { G3XGaugeSpec } from '../../../../Shared/Components/G3XGaugesConfigFactory/Definitions/G3XGaugeSpec';
import { G3XGaugeType } from '../../../../Shared/Components/G3XGaugesConfigFactory/Definitions/G3XGaugeType';
import { GenericTabbedContent } from '../../../../Shared/Components/TabbedContainer/GenericTabbedContent';
import { TabbedContainer } from '../../../../Shared/Components/TabbedContainer/TabbedContainer';
import { G3XEisEvents } from '../../../../Shared/Eis/G3XEisEvents';
import { G3XTouchFilePaths } from '../../../../Shared/G3XTouchFilePaths';
import { GduUserSettingTypes } from '../../../../Shared/Settings/GduUserSettings';
import { UiInteractionEvent } from '../../../../Shared/UiSystem/UiInteraction';
import { UiKnobUtils } from '../../../../Shared/UiSystem/UiKnobUtils';
import { AbstractMfdPage } from '../../../PageNavigation/AbstractMfdPage';
import { MfdPageProps } from '../../../PageNavigation/MfdPage';
import { MfdPageSizeMode } from '../../../PageNavigation/MfdPageTypes';
import { FuelCalculatorTab } from './FuelCalculator/FuelCalculatorTab';

import './MfdEnginePage.css';

/** Component props for MfdMapPage. */
export interface MfdEnginePageProps extends MfdPageProps {
  /** The logic host for the GDU's gauges.*/
  xmlLogicHost: CompositeLogicXMLHost;

  /** A manager for GDU user settings. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;

  /**
   * The definition for rendering the engine page parsed from `panel.xml`. If not defined, then the page's contents
   * will be rendered as blank.
   */
  enginePageDefinition?: G3XEnginePageDefinition;
}

/**
 * An MFD engine page.
 */
export class MfdEnginePage extends AbstractMfdPage<MfdEnginePageProps> {
  private readonly tabbedContainerRef = FSComponent.createRef<TabbedContainer>();

  private readonly sizeMode = Subject.create(MfdPageSizeMode.Full);

  private tabsPerListPage?: number;
  private readonly tabLength = Subject.create(100);
  private readonly tabSpacing = 6;

  /** @inheritDoc */
  public onAfterRender(): void {
    this._title.set('Engine');
    this._iconSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_engine.png`);

    if (this.props.enginePageDefinition) {
      for (const func of this.props.enginePageDefinition.functions.values()) {
        this.props.xmlLogicHost.addFunction(func);
      }
    }

    this.tabbedContainerRef.getOrDefault()?.knobLabelState.pipe(this._knobLabelState);
  }

  /** @inheritDoc */
  public onOpen(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.sizeMode.set(sizeMode);
    this.updateTabStyling(dimensions);
    this.props.uiService.bus.getPublisher<G3XEisEvents>().pub('g3x_eis_engine_page_is_open', true, false, true);
  }

  /** @inheritDoc */
  public onClose(): void {
    this.props.uiService.bus.getPublisher<G3XEisEvents>().pub('g3x_eis_engine_page_is_open', false, false, true);
  }

  /** @inheritDoc */
  public onResume(): void {
    this.tabbedContainerRef.getOrDefault()?.resume();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.tabbedContainerRef.getOrDefault()?.pause();
  }

  /** @inheritDoc */
  public onResize(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.sizeMode.set(sizeMode);
    this.updateTabStyling(dimensions);
  }

  /**
   * Updates the styling of this page's tabbed container tabs.
   * @param dimensions The current dimensions of this page, as `[width, height]` in pixels.
   */
  private updateTabStyling(dimensions: ReadonlyFloat64Array): void {
    if (this.tabsPerListPage === undefined) {
      return;
    }

    // TODO: support GDU470 (portrait)

    // The tab list length is the width of the tab container (full width of the page minus 7px padding on one side)
    // minus the length of two tab arrows (10px + 3px margin on each side) and 12px margins on each side.
    const listLength = dimensions[0] - 7 - 2 * 16 - 2 * 12;
    const tabLength = Math.floor((listLength - this.tabSpacing * (this.tabsPerListPage - 1)) / this.tabsPerListPage);
    this.tabLength.set(tabLength);
  }

  /** @inheritDoc */
  public onUpdate(time: number): void {
    this.tabbedContainerRef.getOrDefault()?.update(time);
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    const container = this.tabbedContainerRef.getOrDefault();
    return container ? container.onUiInteractionEvent(event) : super.onUiInteractionEvent(event);
  }

  /** @inheritDoc */
  public render(): VNode {
    const content = this.props.enginePageDefinition?.content;

    return (
      <div class='mfd-engine-page'>
        {content !== undefined && (
          MfdEnginePage.isTabsContent(content)
            ? (
              <TabbedContainer
                ref={this.tabbedContainerRef}
                bus={this.props.uiService.bus}
                validKnobIds={this.props.uiService.validKnobIds.filter(UiKnobUtils.isInnerKnobId)}
                tabPosition="top"
                tabsPerListPage={this.tabsPerListPage = MathUtils.clamp(content.length, 1, 3)}
                tabLength={this.tabLength}
                tabSpacing={this.tabSpacing}
                gduFormat={this.props.uiService.gduFormat}
                class='mfd-engine-page-tabbed-container'
              >
                {content.map(this.renderTab.bind(this))}
              </TabbedContainer>
            )
            : (
              <div class='mfd-engine-page-container'>
                <div class='mfd-engine-page-container-content'>
                  {this.renderGaugeContent(content)}
                </div>
              </div>
            )
        )}
      </div>
    );
  }

  /**
   * Renders a tab.
   * @param tabDef The definition of the tab to render.
   * @returns The specified tab, as a VNode.
   */
  private renderTab(tabDef: G3XEnginePageTabDefinition): VNode {
    switch (tabDef.type) {
      case G3XEnginePageTabType.FuelCalculator:
        return (
          <FuelCalculatorTab
            tabLabel={tabDef.label}
            uiService={this.props.uiService}
            gduSettingManager={this.props.gduSettingManager}
            presetFuel1={tabDef.presetFuel1}
            presetFuel2={tabDef.presetFuel2}
          >
            {this.renderGaugeContent(tabDef.gaugesDef)}
          </FuelCalculatorTab>
        );
      default:
        return (
          <GenericTabbedContent tabLabel={tabDef.label}>
            <div class='mfd-engine-page-simple-tab'>
              {this.renderGaugeContent(tabDef.gaugesDef)}
            </div>
          </GenericTabbedContent>
        );
    }
  }

  /**
   * Renders gauge content.
   * @param def The definition describing the gauge content to render.
   * @returns The gauge content described by the specified definition, as a VNode, or `null` if the definition does not
   * describe any gauges.
   */
  private renderGaugeContent(def: G3XEnginePageGaugesDefinition): VNode | null {
    if (def.fullscreenGaugeConfig !== undefined || def.splitscreenGaugeConfig !== undefined) {
      return (
        <>
          {def.splitscreenGaugeConfig && (
            <div
              class={{
                'mfd-engine-page-gauge-container': true,
                'hidden': this.sizeMode.map((size) => size === MfdPageSizeMode.Full)
              }}
            >
              {this.renderGauges(def.splitscreenGaugeConfig)}
            </div>
          )}
          {def.fullscreenGaugeConfig && (
            <div
              class={{
                'mfd-engine-page-gauge-container': true,
                'hidden': this.sizeMode.map((size) => size === MfdPageSizeMode.Half)
              }}
            >
              {this.renderGauges(def.fullscreenGaugeConfig)}
            </div>
          )}
        </>
      );
    } else if (def.gaugeConfig) {
      return (
        <div class='mfd-engine-page-gauge-container'>
          {this.renderGauges(def.gaugeConfig)}
        </div>
      );
    } else {
      return null;
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

  /**
   * Determines if the config is a tab config or a gauges' config.
   * @param content The config to check.
   * @returns True if the config is a tab config, false if it is a gauges' config.
   */
  private static isTabsContent(content: G3XEnginePageTabDefinition[] | G3XEnginePageGaugesDefinition): content is G3XEnginePageTabDefinition[] {
    return Array.isArray(content);
  }
}
