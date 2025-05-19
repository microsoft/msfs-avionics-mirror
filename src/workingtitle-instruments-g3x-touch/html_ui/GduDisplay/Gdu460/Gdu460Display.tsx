import { DisplayComponent, FSComponent, SetSubject, Subject, Vec2Math, Vec2Subject, VNode } from '@microsoft/msfs-sdk';

import { G3XTouchVersion } from '../../G3XTouchVersion';
import { AvionicsStatusChangeEvent } from '../../Shared/AvionicsStatus/AvionicsStatusEvents';
import { AvionicsStatus } from '../../Shared/AvionicsStatus/AvionicsStatusTypes';
import { EisLayouts, EisSizes, PfdPaneSide } from '../../Shared/CommonTypes';
import { G3XLoadingIcon } from '../../Shared/Components/Common/G3XLoadingIcon';
import { StatusBar } from '../../Shared/Components/StatusBar/StatusBar';
import { DefaultTemperatureInfoDataProvider } from '../../Shared/DataProviders';
import { G3XTouchFilePaths } from '../../Shared/G3XTouchFilePaths';
import { G3XTouchPlugin } from '../../Shared/G3XTouchPlugin';
import { CnsDataBarUserSettings } from '../../Shared/Settings/CnsDataBarUserSettings';
import { G3XDateTimeUserSettings } from '../../Shared/Settings/G3XDateTimeUserSettings';
import { G3XUnitsUserSettings } from '../../Shared/Settings/G3XUnitsUserSettings';
import { UiPaneContainer } from '../../Shared/UiSystem/UiPaneContainer';
import { UiPaneViewStackContainer } from '../../Shared/UiSystem/UiPaneViewStackContainer';
import { GduDisplay, GduDisplayProps } from '../GduDisplay';
import { Gdu460CnsDataBar } from './CnsDataBar/Gdu460CnsDataBar';
import { Gdu460Eis } from './Eis/Gdu460Eis';

import './Gdu460Display.css';

/**
 * A GDU460 (10.6-inch landscape) display.
 */
export class Gdu460Display extends DisplayComponent<GduDisplayProps> implements GduDisplay<GduDisplayProps> {
  private static readonly WIDTH = 1280;
  private static readonly HEIGHT = 768;

  private static readonly MAIN_CONTAINER_HEIGHT = 680;

  private static readonly EIS_WIDTHS: Record<EisSizes, number> = {
    [EisSizes.Narrow]: 164,
    [EisSizes.Wide]: 212
  };

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  private readonly checklistHighlightRef = FSComponent.createRef<HTMLElement>();

  private readonly rootCssClass = SetSubject.create(['gdu-display', 'gdu-460-display']);

  private readonly bootSplashHidden = Subject.create(false);
  private readonly bootSplashInfoHidden = Subject.create(false);

  private readonly temperatureDataProvider = new DefaultTemperatureInfoDataProvider(this.props.bus, 1);

  private readonly unitsSettingManager = G3XUnitsUserSettings.getManager(this.props.bus);

  private readonly paneContainerRef = FSComponent.createRef<UiPaneContainer>();
  private readonly pfdViewStackContainerRef = FSComponent.createRef<UiPaneViewStackContainer>();
  private readonly mfdViewStackContainerRef = FSComponent.createRef<UiPaneViewStackContainer>();

  private readonly paneFullSize = Vec2Subject.create(Vec2Math.create(Gdu460Display.WIDTH, Gdu460Display.MAIN_CONTAINER_HEIGHT));
  private readonly paneHalfSize = Vec2Subject.create(Vec2Math.create(Gdu460Display.WIDTH / 2, Gdu460Display.MAIN_CONTAINER_HEIGHT));

  private readonly eisWidth = this.props.uiService.gdu460EisSize === undefined ? 0 : Gdu460Display.EIS_WIDTHS[this.props.uiService.gdu460EisSize];

  /** @inheritDoc */
  public onAfterRender(): void {
    this.props.onChecklistHighlightRendered && this.props.onChecklistHighlightRendered(this.checklistHighlightRef);

    if (this.props.uiService.gdu460EisSize === undefined) {
      this.paneFullSize.set(Gdu460Display.WIDTH, Gdu460Display.MAIN_CONTAINER_HEIGHT);
      // In split mode, the pane divider takes up 4px of width.
      this.paneHalfSize.set((Gdu460Display.WIDTH - 4) / 2, Gdu460Display.MAIN_CONTAINER_HEIGHT);
    } else {
      this.rootCssClass.toggle('gdu-display-eis-narrow', this.props.uiService.gdu460EisSize === EisSizes.Narrow);
      this.rootCssClass.toggle('gdu-display-eis-wide', this.props.uiService.gdu460EisSize === EisSizes.Wide);
      this.props.uiService.gdu460EisLayout.sub(this.onEisLayoutChanged.bind(this), true);
    }

    this.props.uiService.gdu460PfdPaneSide.sub(this.onPfdPaneSideChanged.bind(this), true);

    this.props.uiService.attachViewStackContainers(this.pfdViewStackContainerRef.instance, this.mfdViewStackContainerRef.instance);
    this.props.uiService.initialize();

    this.temperatureDataProvider.init(false);
  }

  /**
   * Responds to when this display's EIS changes layout.
   * @param layout The layout of this display's EIS.
   */
  private onEisLayoutChanged(layout: EisLayouts): void {
    this.rootCssClass.toggle('gdu-display-eis-none', layout === EisLayouts.None);
    this.rootCssClass.toggle('gdu-display-eis-left', layout === EisLayouts.Left);
    this.rootCssClass.toggle('gdu-display-eis-right', layout === EisLayouts.Right);

    // The EIS divider takes up 2px of width.
    const eisWidth = layout === EisLayouts.None ? 0 : this.eisWidth + 2;

    this.paneFullSize.set(Gdu460Display.WIDTH - eisWidth, Gdu460Display.MAIN_CONTAINER_HEIGHT);
    // In split mode, the pane divider takes up 4px of width.
    this.paneHalfSize.set((Gdu460Display.WIDTH - eisWidth - 4) / 2, Gdu460Display.MAIN_CONTAINER_HEIGHT);
  }

  /**
   * Responds to when the side on which this display's PFD pane is positioned changes.
   * @param side The new side on which this display's PFD pane is positioned.
   */
  private onPfdPaneSideChanged(side: PfdPaneSide): void {
    this.rootCssClass.toggle('gdu-display-pfd-left', side === 'left');
    this.rootCssClass.toggle('gdu-display-pfd-right', side === 'right');
  }

  /** @inheritDoc */
  public onAvionicsStatusChanged(event: Readonly<AvionicsStatusChangeEvent>): void {
    if (event.current === AvionicsStatus.On || event.current === AvionicsStatus.Reversionary) {
      this.props.uiService.setReversionaryMode(event.current === AvionicsStatus.Reversionary);
      this.props.uiService.wake();
      this.paneContainerRef.instance.wake();
    } else {
      this.paneContainerRef.instance.sleep();
      this.props.uiService.sleep();
      this.props.uiService.setReversionaryMode(false);
      this.props.uiService.enterStartupPhase();
    }

    this.bootSplashHidden.set(
      event.current !== AvionicsStatus.Off
      && event.current !== AvionicsStatus.Booting1
      && event.current !== AvionicsStatus.Booting2
    );
    this.bootSplashInfoHidden.set(event.current !== AvionicsStatus.Booting2);
  }

  /**
   * Responds to when the PFD pane is updated.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  private onPfdPaneUpdated(time: number): void {
    this.props.uiService.updatePfdViewStack(time);
  }

  /**
   * Responds to when the MFD pane is updated.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  private onMfdPaneUpdated(time: number): void {
    this.props.uiService.updateMfdViewStack(time);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <>
        <div ref={this.rootRef} class={this.rootCssClass}>
          <Gdu460CnsDataBar
            fms={this.props.fms}
            uiService={this.props.uiService}
            config={this.props.config}
            navDataBarFieldModelFactory={this.props.navDataBarFieldModelFactory}
            navDataBarFieldRenderer={this.props.navDataBarFieldRenderer}
            navDataFieldGpsValidity={this.props.navDataFieldGpsValidity}
            navDataBarEditController={this.props.navDataBarEditController}
            radiosDataProvider={this.props.radiosDataProvider}
            displaySettingManager={this.props.displaySettingManager}
            dataBarSettingManager={CnsDataBarUserSettings.getManager(this.props.bus)}
            dateTimeSettingManager={G3XDateTimeUserSettings.getManager(this.props.bus)}
            unitsSettingManager={this.unitsSettingManager}
          />
          <div class='gdu-display-main-container'>
            {this.renderEis()}
            <UiPaneContainer
              ref={this.paneContainerRef}
              bus={this.props.bus}
              paneFullSize={this.paneFullSize}
              pane1HalfSize={this.paneHalfSize}
              pane2HalfSize={this.paneHalfSize}
              isPane1Visible={this.props.isPane1Visible}
              isPane2Visible={this.props.isPane2Visible}
              pane1Content={this.renderPfdPane()}
              pane2Content={this.renderMfdPane()}
              updateFreq={30}
              alternateUpdatesInSplitMode
            />
          </div>
          <StatusBar
            uiService={this.props.uiService}
            temperatureDataProvider={this.temperatureDataProvider}
            dateTimeSettingManager={G3XDateTimeUserSettings.getManager(this.props.bus)}
            unitsSettingManager={this.unitsSettingManager}
          />
        </div>

        <glasscockpit-highlight ref={this.checklistHighlightRef} id='highlight' class='gdu-460-display-highlight'></glasscockpit-highlight>

        <div class={{ 'gdu-460-display-boot': true, 'hidden': this.bootSplashHidden }}>
          <img class='gdu-460-display-boot-logo' src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/garmin_logo.png`} />
          <div class={{ 'gdu-460-display-boot-splash-info': true, 'hidden': this.bootSplashInfoHidden }}>
            <div class={'gdu-460-display-boot-please-wait-text'}>Please Wait...</div>
            <G3XLoadingIcon class='gdu-460-display-boot-loading-icon' />
            <div class={'gdu-460-display-boot-system-info-text'}>
              <div>GDU</div>
              <div>Software Version {G3XTouchVersion.VERSION}</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /**
   * Renders this display's EIS.
   * @returns This display's EIS, as a VNode, or `null` if this display does not have an EIS.
   */
  private renderEis(): VNode | null {
    if (!this.props.config.engine.includeEis) {
      return null;
    }

    // Check if any plugins render an EIS. We call the plugins in reverse order so that plugins loaded later have
    // priority.
    const pluginRenderEisFuncs: (() => VNode | null)[] = [];
    this.props.pluginSystem.callPlugins((plugin: G3XTouchPlugin) => {
      if (plugin.renderEis) {
        pluginRenderEisFuncs.push(plugin.renderEis.bind(plugin));
      }
    });

    let pluginEisNode: VNode | null = null;
    for (let i = pluginRenderEisFuncs.length - 1; i >= 0 && pluginEisNode === null; i--) {
      pluginEisNode = pluginRenderEisFuncs[i]();
    }

    if (pluginEisNode) {
      // If a plugin-rendered EIS exists, then use it.
      return (
        <>
          <Gdu460Eis
            uiService={this.props.uiService}
            supportEnginePage={this.props.config.engine.includeEnginePage}
            xmlLogicHost={this.props.xmlLogicHost}
          >
            {pluginEisNode}
          </Gdu460Eis>
          <div class='gdu-display-eis-divider' />
        </>
      );
    } else {
      // If no plugins render an EIS, then attempt to render the EIS based on panel.xml configuration.
      return (
        <>
          <Gdu460Eis
            uiService={this.props.uiService}
            supportEnginePage={this.props.config.engine.includeEnginePage}
            xmlLogicHost={this.props.xmlLogicHost}
            eisDefinition={this.props.config.engine.parseEis(this.props.bus)}
          />
          <div class='gdu-display-eis-divider' />
        </>
      );
    }
  }

  /**
   * Renders this display's PFD pane.
   * @returns This display's rendered PFD pane, as a VNode.
   */
  private renderPfdPane(): VNode {
    return (
      <UiPaneViewStackContainer
        ref={this.pfdViewStackContainerRef}
        onUpdate={this.onPfdPaneUpdated.bind(this)}
      />
    );
  }

  /**
   * Renders this display's MFD pane.
   * @returns This display's rendered MFD pane, as a VNode.
   */
  private renderMfdPane(): VNode {
    return (
      <UiPaneViewStackContainer
        ref={this.mfdViewStackContainerRef}
        onUpdate={this.onMfdPaneUpdated.bind(this)}
      />
    );
  }
}
