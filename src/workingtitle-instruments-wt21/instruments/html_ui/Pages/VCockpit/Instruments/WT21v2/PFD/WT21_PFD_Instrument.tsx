/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Instruments/Shared/BaseInstrument" />
/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Core/VCockpit" />
/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/js/netbingmap" />
/// <reference types="@microsoft/msfs-types/js/avionics" />
/// <reference types="@microsoft/msfs-types/js/common" />

import {
  ControlPublisher, ControlSurfacesPublisher, DefaultUserSettingManager, FSComponent, MinimumsEvents, MinimumsManager, PluginSystem, SimVarValueType
} from '@microsoft/msfs-sdk';

import {
  AOASystemEvents, AvionicsConfig, BottomSectionContainer, BottomSectionVersion, DcpController, DcpEvent, DcpEventPublisher, DcpEvents, DcpHEvents,
  DisplayUnitConfig, DisplayUnitLayout, ElapsedTime, Gpws, MapUserSettings, MenuContainer, NavIndicatorContext, RefsSettings, RefsUserSettings,
  WT21AvionicsPlugin, WT21CourseNeedleNavIndicator, WT21DisplayUnitFsInstrument, WT21InstrumentType, WT21PluginBinder, WT21TCASTransponderManager
} from '@microsoft/msfs-wt21-shared';

import { MinimumsAlertController } from './Components/FlightInstruments/MinimumsAlertController';
import { UpperSectionContainer } from './Components/FlightInstruments/UpperSectionContainer';
import { LowerSectionContainer } from './Components/LowerSection/LowerSectionContainer';
import { PfdInstrumentConfig } from './Config/PfdInstrumentConfig';
import { PfdBaroSetMenu } from './Menus/PfdBaroSetMenu';
import { PfdBrgSrcMenu } from './Menus/PfdBrgSrcMenu';
import { PfdConfigMenu } from './Menus/PfdConfigMenu';
import { PfdMenu } from './Menus/PfdMenu';
import { PfdMenuViewService } from './Menus/PfdMenuViewService';
import { PfdOverlaysMenu } from './Menus/PfdOverlaysMenu';
import { PfdRefsMenu } from './Menus/PfdRefsMenu';
import { PfdSideButtonsNavBrgSrcMenu } from './Menus/PfdSideButtonsNavBrgSrcMenu';
import { PfdSideButtonsRefs1Menu } from './Menus/PfdSideButtonsRefs1Menu';
import { PfdSideButtonsRefs2Menu } from './Menus/PfdSideButtonsRefs2Menu';

import './WT21_PFD.css';

/**
 * The WT21 PFD Instrument
 */
export class WT21_PFD_Instrument extends WT21DisplayUnitFsInstrument {
  private readonly pluginSystem = new PluginSystem<WT21AvionicsPlugin, WT21PluginBinder>();

  private readonly cfPublisher = new ControlSurfacesPublisher(this.bus, 3);
  private readonly dcpEventPublisher = new DcpEventPublisher(this.bus);
  private readonly controlPublisher = new ControlPublisher(this.bus);

  private readonly dcpController = new DcpController(this.bus, this.instrumentConfig);
  private readonly elapsedTime = new ElapsedTime(this.bus);
  private readonly refsSettings: DefaultUserSettingManager<RefsSettings>;

  private readonly pfdMenuViewService = new PfdMenuViewService(this.bus, this.instrumentConfig.displayUnitConfig ?? DisplayUnitConfig.DEFAULT, this.courseNeedleIndicator);
  private readonly mapSettingsManager = MapUserSettings.getAliasedManager(this.bus, WT21InstrumentType.Pfd, this.instrumentConfig.instrumentIndex);

  private readonly minimumsManager = new MinimumsManager(this.bus);
  private readonly minimumsAlertController = new MinimumsAlertController(this.bus);

  private readonly gpws = new Gpws(this.bus, this.facLoader);
  private readonly tcasTransponderManager = new WT21TCASTransponderManager(this.bus);

  /**
   * Creates an instance of the WT21_PFD.
   * @param instrument The base instrument.
   * @param config The avionics configuration object for the WT21 instrument suite.
   * @param instrumentConfig The configuration object for this specific instrument
   */
  constructor(
    readonly instrument: BaseInstrument,
    protected readonly config: AvionicsConfig,
    protected readonly instrumentConfig: PfdInstrumentConfig
  ) {
    super(instrument, config, instrumentConfig);

    SimVar.SetSimVarValue('L:WT21_BETA_VERSION', 'number', 15);

    RegisterViewListener('JS_LISTENER_INSTRUMENTS');

    // TODO: Support pilot profiles.

    this.refsSettings = RefsUserSettings.getManager(this.bus);

    this.backplane.addPublisher('cf', this.cfPublisher);
    this.backplane.addPublisher('dcpEvents', this.dcpEventPublisher);
    this.backplane.addPublisher('control', this.controlPublisher);

    // TODO Remove once pfd menu is implemented
    this.controlPublisher.publishEvent('brg_src_switch', 1); // Sets bearing pointer 1 to nav 1
    this.controlPublisher.publishEvent('brg_src_switch', 2); // Sets bearing pointer 2 to nav 1
    this.controlPublisher.publishEvent('brg_src_switch', 2); // Sets bearing pointer 2 to nav 2

    // Sync minimums with settings
    const minsPub = this.bus.getPublisher<MinimumsEvents>();

    minsPub.pub('set_minimums_mode', this.refsSettings.getSetting('minsmode').value);
    minsPub.pub('set_decision_height_feet', this.refsSettings.getSetting('radiomins').value);
    minsPub.pub('set_decision_altitude_feet', this.refsSettings.getSetting('baromins').value);

    SimVar.SetSimVarValue('L:AS3000_Brightness', 'number', 0.85);

    this.setupAoaLvarPublish();

    // TODO move this somewhere else
    const dcpEvents = this.bus.getSubscriber<DcpEvents>();
    dcpEvents.on('dcpEvent').handle((event: DcpEvent): void => {
      switch (event) {
        case DcpEvent.DCP_NAV:
          if (this.instrumentConfig.displayUnitConfig.displayUnitLayout === DisplayUnitLayout.Softkeys) {
            return;
          }

          (this.navIndicators.get('courseNeedle') as WT21CourseNeedleNavIndicator).navSwap();
          break;
        case DcpEvent.DCP_DATA_INC:
          (this.navIndicators.get('courseNeedle') as WT21CourseNeedleNavIndicator).presetIncrease();
          break;
        case DcpEvent.DCP_DATA_DEC:
          (this.navIndicators.get('courseNeedle') as WT21CourseNeedleNavIndicator).presetDecrease();
          break;
      }
    });

    this.doInit();
  }

  /** @inheritdoc */
  protected override doInit(): void {
    this.initPluginSystem().then(() => {
      this.doRenderComponents();
      this.doRegisterMenus();

      super.doInit();

      this.gpws.init();
      this.tcasTransponderManager.init();
    });
  }

  /**
   * Registers the menus.
   */
  private doRegisterMenus(): void {
    this.pfdMenuViewService.registerView(
      'PfdMenu',
      () => <PfdMenu
        viewService={this.pfdMenuViewService}
        bus={this.bus}
        courseNeedle={this.navIndicators.get('courseNeedle') as WT21CourseNeedleNavIndicator}
        mapSettingsManager={this.mapSettingsManager}
      />
    );
    this.pfdMenuViewService.registerView(
      'BrgSrcMenu',
      () => <PfdBrgSrcMenu
        bus={this.bus}
        viewService={this.pfdMenuViewService}
        bearingPointerIndicator1={this.navIndicators.get('bearingPointer1')}
        bearingPointerIndicator2={this.navIndicators.get('bearingPointer2')}
        nav1Source={this.navSources.get('NAV1')}
        nav2Source={this.navSources.get('NAV2')}
        adfSource={this.navSources.get('ADF')} />
    );
    this.pfdMenuViewService.registerView('PfdConfigMenu', () => <PfdConfigMenu viewService={this.pfdMenuViewService} bus={this.bus} />);
    this.pfdMenuViewService.registerView('PfdRefsMenu', () => <PfdRefsMenu viewService={this.pfdMenuViewService} bus={this.bus} planner={this.planner} />);
    this.pfdMenuViewService.registerView('PfdOverlaysMenu', () => <PfdOverlaysMenu viewService={this.pfdMenuViewService} bus={this.bus} instrumentIndex={this.instrumentConfig.instrumentIndex} />);
    this.pfdMenuViewService.registerView('PfdBaroSetMenu', () => <PfdBaroSetMenu viewService={this.pfdMenuViewService} bus={this.bus} />);
    this.pfdMenuViewService.registerView(
      'PfdSideButtonsNavBrgSrcMenu',
      () => <PfdSideButtonsNavBrgSrcMenu
        bus={this.bus}
        viewService={this.pfdMenuViewService}
        bearingPointerIndicator1={this.navIndicators.get('bearingPointer1')}
        bearingPointerIndicator2={this.navIndicators.get('bearingPointer2')}
        nav1Source={this.navSources.get('NAV1')}
        nav2Source={this.navSources.get('NAV2')}
        adfSource={this.navSources.get('ADF')}
        courseNeedle={this.navIndicators.get('courseNeedle') as WT21CourseNeedleNavIndicator} />
    );
    this.pfdMenuViewService.registerView(
      'PfdSideButtonsRefs1Menu',
      () => <PfdSideButtonsRefs1Menu
        bus={this.bus}
        viewService={this.pfdMenuViewService}
        planner={this.planner} />
    );
    this.pfdMenuViewService.registerView(
      'PfdSideButtonsRefs2Menu',
      () => <PfdSideButtonsRefs2Menu
        bus={this.bus}
        viewService={this.pfdMenuViewService}
        planner={this.planner} />
    );
  }

  /**
   * Renders the components.
   */
  private doRenderComponents(): void {
    FSComponent.render(
      <NavIndicatorContext.Provider value={this.navIndicators}>
        <UpperSectionContainer
          bus={this.bus}
          planner={this.planner}
          performancePlan={this.perfPlanRepository.getActivePlan()}
          pfdConfig={this.instrumentConfig}
          mapSettingsManager={this.mapSettingsManager}
        />
      </NavIndicatorContext.Provider>,
      document.getElementById('UpperSection')
    );
    FSComponent.render(
      <NavIndicatorContext.Provider value={this.navIndicators}>
        <LowerSectionContainer
          bus={this.bus}
          instrumentConfig={this.instrumentConfig}
          elapsedTime={this.elapsedTime}
          activeMenu={this.pfdMenuViewService.activeView}
          flightPlanner={this.planner}
          tcas={this.tcas}
          fixInfo={this.fixInfoManager}
          performancePlan={this.perfPlanRepository.getActivePlan()} />
      </NavIndicatorContext.Provider>,
      document.getElementById('LowerSection')
    );
    FSComponent.render(
      <NavIndicatorContext.Provider value={this.navIndicators}>
        <BottomSectionContainer bus={this.bus} version={BottomSectionVersion.ver1} />
      </NavIndicatorContext.Provider>,
      document.getElementById('BottomSection')
    );
    FSComponent.render(<MenuContainer bus={this.bus} />, document.getElementById('MenuSection'));
  }

  /**
   * Initializes the plugin system.
   * @returns A promise that resolves when the plugin system is initialized.
   */
  private async initPluginSystem(): Promise<void> {
    await this.pluginSystem.addScripts(this.instrument.xmlConfig, `${this.instrument.templateID}_${this.instrument.instrumentIndex}`, (target) => {
      return target === this.instrument.templateID;
    });

    const pluginBinder: WT21PluginBinder = {
      bus: this.bus,
      backplane: this.backplane,
      flightPlanner: this.planner,
      isPrimaryInstrument: this.instrument.isPrimary,
    };

    return this.pluginSystem.startSystem(pluginBinder);
  }

  /** @inheritdoc */
  public onInteractionEvent(_args: Array<string>): void {
    const handledByMenu = this.pfdMenuViewService.onInteractionEvent(_args[0], this.instrumentConfig.instrumentIndex);
    if (!handledByMenu) {
      try {
        const event = DcpHEvents.mapHEventToDcpEvent(_args[0], this.instrumentConfig.instrumentIndex);
        if (event) {
          this.dcpEventPublisher.dispatchHEvent(event);
        } else {
          this.hEventPublisher.dispatchHEvent(_args[0]);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  /**
   * Method to subscribe to aoasys_aoa_pct and write the LVAR for the glareshield AOA indicator.
   */
  private setupAoaLvarPublish(): void {
    this.bus.getSubscriber<AOASystemEvents>().on('aoasys_aoa_pct').withPrecision(2).handle(v => {
      SimVar.SetSimVarValue('L:WT21_AOA_PCT', SimVarValueType.Number, v);
    });
  }
}
