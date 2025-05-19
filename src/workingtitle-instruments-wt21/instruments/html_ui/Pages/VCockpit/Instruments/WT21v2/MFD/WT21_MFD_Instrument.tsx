/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Instruments/Shared/BaseInstrument" />
/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Core/VCockpit" />
/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/js/netbingmap" />

import {
  ChecklistItemTypeDefMap, ChecklistManager, ClockEvents, CompositeLogicXMLHost, ConsumerSubject, DebounceTimer, DefaultChecklistStateProvider, FlightPlanPredictor, FSComponent,
  GameStateProvider, PluginSystem, PressurizationPublisher, SimVarValueType, SoundServer, StallWarningEvents, StallWarningPublisher, Subject, VNode, Wait
} from '@microsoft/msfs-sdk';

import {
  AvionicsConfig, BottomSectionContainer, BottomSectionVersion, InstrumentConfig, MapUserSettings, MenuContainer, MFDUserSettings, NavIndicatorContext,
  PerformancePlanProxy, WT21ChecklistSetDef, WT21ControlSimVarEvents, WT21DisplayUnitFsInstrument, WT21FlightPlanPredictorConfiguration, WT21FmsUtils, WT21InstrumentType,
  WT21LNavDataEvents, WT21SettingSaveManager, WT21XmlAuralsConfig
} from '@microsoft/msfs-wt21-shared';

import { CcpController } from './CCP/CcpController';
import { CcpEventPublisher } from './CCP/CcpEventPublisher';
import { CcpHEvents } from './CCP/CcpHEvents';
import { CAS } from './Components/CAS/CAS';
import { MfdHsi } from './Components/HSI/MfdHsi';
import { SystemsOverlayContainer } from './Components/SystemsOverlay/SystemsOverlayContainer';
import { TextPagesContainer } from './Components/TextPagesContainer';
import { UpperTextContainer } from './Components/UpperTextContainer';
import { MfdLwrMapSymbolsMenu } from './Menus/MfdLwrMapSymbolsMenu';
import { MfdLwrMenu } from './Menus/MfdLwrMenu';
import { MfdLwrMenuViewService } from './Menus/MfdLwrMenuViewService';
import { MfdLwrOverlaysMenu } from './Menus/MfdLwrOverlaysMenu';
import { MfdUprMenu } from './Menus/MfdUprMenu';
import { MfdUprMenuViewService } from './Menus/MfdUprMenuViewService';
import { WT21MfdAvionicsPlugin, WT21MfdPluginBinder } from './WT21MfdAvionicsPlugin';

import './WT21_MFD.css';

/**
 * The WT21 MFD Instrument
 */
export class WT21_MFD_Instrument extends WT21DisplayUnitFsInstrument {
  private readonly pluginSystem = new PluginSystem<WT21MfdAvionicsPlugin, WT21MfdPluginBinder>();

  private readonly settingSaveManager = new WT21SettingSaveManager(this.bus);
  private readonly mapSettingsManager = MapUserSettings.getAliasedManager(this.bus, WT21InstrumentType.Mfd, this.instrumentConfig.instrumentIndex);
  private readonly mfdSettingManager = MFDUserSettings.getAliasedManager(this.bus, this.instrumentConfig.instrumentIndex as 1 | 2);

  private readonly primaryPlanNominalLegIndexSub = ConsumerSubject.create(this.bus.getSubscriber<WT21LNavDataEvents>().on('lnavdata_nominal_leg_index'), -1,);
  private readonly predictor = new FlightPlanPredictor(
    this.bus,
    this.planner,
    Subject.create(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX),
    this.primaryPlanNominalLegIndexSub,
    WT21FlightPlanPredictorConfiguration,
  );
  private readonly performancePlanProxy = new PerformancePlanProxy(this.perfPlanRepository.getActivePlan());

  private readonly pressurizationPublisher = new PressurizationPublisher(this.bus);
  private readonly stallWarningPublisher = new StallWarningPublisher(this.bus, 0.8);

  private readonly uprMenuViewService = new MfdUprMenuViewService();
  private readonly lwrMenuViewService = new MfdLwrMenuViewService(this.bus, this.instrumentConfig, this.wt21ControlPublisher, this.mapSettingsManager, this.mfdSettingManager);
  private readonly ccpController = new CcpController(this.bus, this.mapSettingsManager, this.mfdSettingManager);
  private readonly ccpEventPublisher = new CcpEventPublisher(this.bus);

  private readonly xmlLogicHost = new CompositeLogicXMLHost(true);
  private readonly auralsConfig = new WT21XmlAuralsConfig(this.instrument, this.xmlLogicHost, this.bus);
  private readonly soundServer?: SoundServer;

  private readonly casRef = FSComponent.createRef<CAS>();
  private readonly textPageContainerRef = FSComponent.createRef<TextPagesContainer>();
  private readonly hsiRef = FSComponent.createRef<MfdHsi>();
  private readonly upperTextContainerRef = FSComponent.createRef<UpperTextContainer>();

  private readonly dispatchModeTimer = new DebounceTimer();

  private checklistDef?: WT21ChecklistSetDef;
  private checklistManager?: ChecklistManager;
  private checklistStateProvider?: DefaultChecklistStateProvider<ChecklistItemTypeDefMap, void, void, void, void>;

  /**
   * Creates an instance of the WT21_MFD.
   * @param instrument The base instrument.
   * @param config The avionics configuration object for the WT21 instrument suite.
   * @param instrumentConfig The configuration object for this specific instrument
   */
  constructor(
    readonly instrument: BaseInstrument,
    protected readonly config: AvionicsConfig,
    protected readonly instrumentConfig: InstrumentConfig
  ) {
    super(instrument, config, instrumentConfig);

    RegisterViewListener('JS_LISTENER_INSTRUMENTS');

    if (this.instrument.isPrimary) {
      this.soundServer = new SoundServer(this.bus);
    }

    this.backplane.addPublisher('ccpEvents', this.ccpEventPublisher);
    this.backplane.addPublisher('pressurization', this.pressurizationPublisher);
    this.backplane.addPublisher('stallWarning', this.stallWarningPublisher);

    this.backplane.addInstrument('ap', this.apInstrument);

    this.bus.getSubscriber<ClockEvents>().on('realTime').whenChangedBy(2_500).handle(() => this.predictor.update());

    this.uprMenuViewService.otherMenuServices.push(this.lwrMenuViewService);
    this.lwrMenuViewService.otherMenuServices.push(this.uprMenuViewService);

    // set up synced perf proxy so we can also pull in the per managers here
    this.performancePlanProxy.switchToPlan(this.perfPlanRepository.getActivePlan(), true);

    Wait.awaitSubscribable(GameStateProvider.get(), state => state === GameState.briefing || state === GameState.ingame, true).then(() => {
      this.onInGame();
    });

    this.doInit();
  }

  /** @inheritdoc */
  protected override async doInit(): Promise<void> {
    await this.initPluginSystem();

    const saveKey = `${SimVar.GetSimVarValue('ATC MODEL', 'string')}.profile_1`;
    this.settingSaveManager.load(saveKey);
    this.settingSaveManager.startAutoSave(saveKey);

    super.doInit();

    await this.initChecklist();

    this.doRenderComponents();
    this.doRegisterMenues();
    this.wireDispatchVisuals();
  }

  /**
   * Initializes this instrument's checklist system.
   */
  private async initChecklist(): Promise<void> {
    let checklistDef: WT21ChecklistSetDef | undefined = undefined;

    this.pluginSystem.callPlugins((plugin) => {
      checklistDef = plugin.getChecklistDef?.();
    });

    if (!this.checklistDef && this.config.checklist.checklistFileURL !== undefined) {
      const fetch = this.config.checklist.resolve();
      checklistDef = await fetch(5000);
    }

    if (checklistDef) {
      this.checklistDef = checklistDef;
      this.checklistStateProvider = new DefaultChecklistStateProvider(1, this.bus, this.checklistDef);

      this.checklistStateProvider.init();

      if (this.instrument.instrumentIndex === 1) {
        // Only one ChecklistManager is needed, so put it on MFD1
        this.checklistManager = new ChecklistManager(1, this.bus, this.checklistDef);
        this.checklistManager.wake();
      }
    }

    this.pluginSystem.callPlugins((plugin) => {
      plugin.onChecklistInit?.(checklistDef, this.checklistStateProvider);
    });
  }

  /**
   * Registers the MFD menues.
   */
  private doRegisterMenues(): void {
    this.uprMenuViewService.registerView('MfdUprMenu', () => <MfdUprMenu viewService={this.uprMenuViewService} bus={this.bus} mfdSettingManager={this.mfdSettingManager} isChecklistAvailable={this.checklistStateProvider !== undefined} />);
    this.lwrMenuViewService.registerView('MfdLwrMenu', () => <MfdLwrMenu viewService={this.lwrMenuViewService} bus={this.bus} mapSettingsManager={this.mapSettingsManager} />);
    this.lwrMenuViewService.registerView('MfdLwrOverlaysMenu', () => <MfdLwrOverlaysMenu viewService={this.lwrMenuViewService} bus={this.bus} mapSettingsManager={this.mapSettingsManager} />);
    this.lwrMenuViewService.registerView('MfdLwrMapSymbolsMenu', () => <MfdLwrMapSymbolsMenu viewService={this.lwrMenuViewService} bus={this.bus} mapSettingsManager={this.mapSettingsManager} />);
  }

  /**
   * Renders the components.
   */
  private doRenderComponents(): void {
    if (this.instrument.isPrimary) {
      let eisVNode: VNode | undefined;
      this.pluginSystem.callPlugins((it) => {
        eisVNode ??= it.renderEis?.();
      });

      if (eisVNode) {
        FSComponent.render(eisVNode, document.getElementById('EngineInstruments'));
      }
      FSComponent.render(<CAS ref={this.casRef} bus={this.bus} logicHandler={this.xmlLogicHost} instrument={this.instrument} />, document.getElementById('HSIMap'));
    } else {
      FSComponent.render(<CAS ref={this.casRef} bus={this.bus} logicHandler={this.xmlLogicHost} instrument={this.instrument} />, document.getElementById('EngineInstruments'));
    }
    FSComponent.render(
      <UpperTextContainer
        ref={this.upperTextContainerRef}
        bus={this.bus}
        pluginSystem={this.pluginSystem}
        planner={this.planner}
        facLoader={this.facLoader}
        performancePlanProxy={this.performancePlanProxy}
        mapSettingManager={this.mapSettingsManager}
        mfdSettingManager={this.mfdSettingManager}
        checklistDef={this.checklistDef}
        checklistStateProvider={this.checklistStateProvider}
      />,
      document.getElementById('UpperMenu'),
    );
    FSComponent.render(
      <TextPagesContainer
        ref={this.textPageContainerRef}
        bus={this.bus}
        pluginSystem={this.pluginSystem}
        planner={this.planner}
        facLoader={this.facLoader}
        predictor={this.predictor}
        performancePlan={this.performancePlanProxy}
        mfdIndex={this.instrument.instrumentIndex}
      />,
      document.getElementById('TextPagesContainer'));
    FSComponent.render(<SystemsOverlayContainer bus={this.bus} pluginSystem={this.pluginSystem} />, document.getElementById('Electricity'));
    FSComponent.render(
      <NavIndicatorContext.Provider value={this.navIndicators}>
        <MfdHsi
          ref={this.hsiRef}
          bus={this.bus}
          instrumentConfig={this.instrumentConfig}
          facLoader={this.facLoader}
          flightPlanner={this.planner}
          tcas={this.tcas}
          fixInfo={this.fixInfoManager}
          performancePlan={this.perfPlanRepository.getActivePlan()}
          mfdSettingManager={this.mfdSettingManager}
        />
      </NavIndicatorContext.Provider>,
      document.getElementById('HSIMap')
    );
    FSComponent.render(<BottomSectionContainer bus={this.bus} version={(this.instrument.isPrimary) ? BottomSectionVersion.ver2 : BottomSectionVersion.ver3}
      facLoader={this.facLoader} planner={this.planner} />,
      document.getElementById('MFDBottomSection'));
    FSComponent.render(<MenuContainer bus={this.bus} />, document.getElementById('MenuSection'));
  }

  /**
   * Wires up the visuals for dispatch mode.
   */
  private wireDispatchVisuals(): void {
    if (this.instrument.isPrimary) {
      const controlVarSub = this.bus.getSubscriber<WT21ControlSimVarEvents>();
      controlVarSub.on('wt21_dispatch_mode_enabled').whenChanged().handle((dispatchMode) => this.setDispatchMode(dispatchMode));

      this.bus.getSubscriber<StallWarningEvents>().on('stall_warning_on')
        .handle(w => SimVar.SetSimVarValue('L:WT21_STALL_WARNING', SimVarValueType.Number, w ? 1 : 0));
    } else {
      this.hsiRef.instance.electricityShow();
      this.textPageContainerRef.instance.electricityShow();
    }
  }

  /**
   * Initializes the plugin system.
   * @returns A promise that resolves when the plugin system is initialized.
   */
  private async initPluginSystem(): Promise<void> {
    await this.pluginSystem.addScripts(this.instrument.xmlConfig, `${this.instrument.templateID}_${this.instrument.instrumentIndex}`, (target) => {
      return target === this.instrument.templateID;
    });

    const pluginBinder: WT21MfdPluginBinder = {
      bus: this.bus,
      backplane: this.backplane,
      flightPlanner: this.planner,
      displayUnitIndex: this.instrumentConfig.instrumentIndex,
      isPrimaryInstrument: this.instrument.isPrimary,
    };

    return this.pluginSystem.startSystem(pluginBinder);
  }

  /** @inheritdoc */
  public onFlightStart(): void {
    //noop
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onGameStateChanged(oldState: GameState, newState: GameState): void {
    // noop
  }

  /**
   * Sets the MFD visuals for Dispatch mode.
   * @param shouldDispatch Is dispatch mode enabled?
   */
  private setDispatchMode(shouldDispatch: boolean): void {
    this.dispatchModeTimer.clear();
    this.dispatchModeTimer.schedule(() => {
      this.ccpController.setDispatchMode(shouldDispatch);
      if (shouldDispatch) {
        this.casRef.instance.show();
        this.textPageContainerRef.instance.electricityHide();
        this.hsiRef.instance.electricityHide();
      } else {
        this.casRef.instance.hide();
        this.textPageContainerRef.instance.electricityShow();
        this.hsiRef.instance.electricityShow();
      }
    }, shouldDispatch ? 1200 : 100);
  }

  /**
   * Callback for when the game state transitions to either briefing or in-game.
   * This can be used as a "last chance" hook to initialize things that need to wait
   * until a plane has loaded and everything is in a stable state.
   */
  protected onInGame(): void {
    this.xmlLogicHost.setIsPaused(false);
  }

  /**
   * A callback called when the instrument gets a frame update.
   */
  public Update(): void {
    // TODO dga: maybe don't do it every frame?
    this.xmlLogicHost.update(this.instrument.deltaTime);

    super.Update();
  }

  /**
   * A callback called when the instrument received a H event.
   * @param args The H event and associated arguments, if any.
   */
  public onInteractionEvent(args: string[]): void {
    const handledByUprMenu = this.uprMenuViewService.onInteractionEvent(args[0], this.instrument.instrumentIndex);
    const handledByLwrMenu = this.lwrMenuViewService.onInteractionEvent(args[0], this.instrument.instrumentIndex);
    const handledByUpperText = this.upperTextContainerRef.instance.onInteractionEvent(args[0], this.instrument.instrumentIndex);

    if (handledByUprMenu || handledByLwrMenu || handledByUpperText) {
      return;
    }

    const event = CcpHEvents.mapHEventToCcpEvent(args[0], this.instrument.instrumentIndex);
    if (event) {
      this.ccpEventPublisher.dispatchHEvent(event);
    } else {
      this.hEventPublisher.dispatchHEvent(args[0]);
    }
  }

  /**
   * A callback for when sounds are done playing.  This is needed to support the sound server.
   * @param soundEventId The sound that got played.
   */
  public onSoundEnd(soundEventId: Name_Z): void {
    if (this.soundServer) {
      this.soundServer.onSoundEnd(soundEventId);
    }
  }
}
