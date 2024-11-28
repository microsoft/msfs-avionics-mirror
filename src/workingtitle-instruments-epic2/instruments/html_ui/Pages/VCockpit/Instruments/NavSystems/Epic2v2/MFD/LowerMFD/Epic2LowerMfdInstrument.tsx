/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Instruments/Shared/BaseInstrument" />
/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Core/VCockpit" />
/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/js/netbingmap" />
/// <reference types="@microsoft/msfs-types/js/common" />
/// <reference types="@microsoft/msfs-types/js/avionics" />

import {
  AvionicsSystemState, CasSystem, CasSystemLegacyAdapter, ChecklistItemTypeDefMap, ChecklistManager, CompositeLogicXMLHost, ConsumerSubject,
  DefaultChecklistStateProvider, FSComponent, MappedSubject, PluginSystem, Wait, XMLAnnunciationFactory
} from '@microsoft/msfs-sdk';

import {
  AvionicsConfig, DefaultAirGroundDataProvider, DefaultAirspeedDataProvider, DefaultAltitudeDataProvider, DefaultCasInhibitStateDataProvider,
  DefaultFlapWarningDataProvider, DefaultInertialDataProvider, DefaultLandingGearDataProvider, DefaultRadioAltimeterDataProvider, Epic2ChecklistDef,
  Epic2ChecklistGroupMetadata, Epic2ChecklistListMetadata, Epic2ChecklistMetadata, Epic2DuControlEvents, Epic2Fms, Epic2FsInstrument, FuelTotalizer,
  FuelTotalizerSimVarPublisher, InstrumentBackplaneNames
} from '@microsoft/msfs-epic2-shared';

import { CAS } from './Components';
import { CasPowerStateManager } from './Components/CAS/CasPowerStateManager';
import { SystemConfigWindow } from './Components/SystemConfigWindow/SystemConfigWindow';
import { Epic2LowerMfdAvionicsPlugin, Epic2LowerMfdPluginBinder } from './Epic2LowerMfdAvionicsPlugin';
import { Epic2XmlAuralsConfig } from './Systems/Epic2XmlAuralsConfig';

/**
 * The EPIC2 lower MFD instrument.
 */
export class Epic2LowerMfdInstrument extends Epic2FsInstrument {
  private readonly pluginSystem = new PluginSystem<Epic2LowerMfdAvionicsPlugin, Epic2LowerMfdPluginBinder>();

  // When the MFDs are swapped, the lower MFD instrument is displayed on the upper DU. The upper DU is driven by AGM1.
  // When the MFD are not swapped, the lower MFD instrument is displayed on the lower DU which is driven by AGM2.
  private readonly isMfdSwapped = ConsumerSubject.create(this.bus.getSubscriber<Epic2DuControlEvents>().on('epic2_mfd_swap'), false);
  private readonly agmSubject = MappedSubject.create(
    ([agm1State, agm2State, isMfdSwapped]) => (isMfdSwapped && agm1State === AvionicsSystemState.On) || (!isMfdSwapped && agm2State === AvionicsSystemState.On),
    this.agm1State, this.agm2State, this.isMfdSwapped
  );

  protected readonly fms?: Epic2Fms;

  protected readonly fuelTotalizer = new FuelTotalizer(this.bus);
  protected readonly fuelTotalizerPublisher = new FuelTotalizerSimVarPublisher(this.bus);
  protected readonly landingGearData = new DefaultLandingGearDataProvider(this.bus, 1);
  protected readonly flapWarningData = new DefaultFlapWarningDataProvider(this.bus, this.selectedFlapWarningIndex);

  protected readonly landingGearDataProvider = new DefaultLandingGearDataProvider(this.bus, 1);
  protected readonly airspeedDataProvider = new DefaultAirspeedDataProvider(this.bus, this.selectedAdahrsIndex, this.displayUnitIndex);
  protected readonly altitudeDataProvider = new DefaultAltitudeDataProvider(this.bus, this.selectedAdahrsIndex, this.displayUnitIndex);
  protected readonly inertialDataProvider = new DefaultInertialDataProvider(this.bus, this.selectedAdahrsIndex, this.selectedFmsPosIndex, this.displayUnitIndex);
  protected readonly radioAltimeterDataProvider = new DefaultRadioAltimeterDataProvider(
    this.bus, this.config.displayUnits.displayUnitDefinitions[this.displayUnitIndex].radioAltimeterIndex
  );
  protected readonly airGroundDataProvider = new DefaultAirGroundDataProvider(this.bus, this.airspeedDataProvider, this.landingGearDataProvider, this.radioAltimeterDataProvider);
  protected readonly casSystem = new CasSystem(this.bus, true);
  protected readonly xmlLogicHost = new CompositeLogicXMLHost();
  protected readonly auralsConfig: Epic2XmlAuralsConfig;

  private readonly casLegacyAdapter;
  private readonly casPowerStateManager;
  protected readonly casInhibitStateProvider = new DefaultCasInhibitStateDataProvider(
    this.bus, this.airGroundDataProvider, this.inertialDataProvider, this.altitudeDataProvider, this.radioAltimeterDataProvider
  );

  // for avionics config
  private readonly pfdUserSettings = this.pfdUserSettingsManager;

  private checkListDef?: Epic2ChecklistDef;
  private checklistStateProvider?: DefaultChecklistStateProvider<ChecklistItemTypeDefMap, Epic2ChecklistMetadata, Epic2ChecklistGroupMetadata, Epic2ChecklistListMetadata>;
  private checklistManager?: ChecklistManager;

  /** @inheritdoc */
  constructor(
    public readonly instrument: BaseInstrument,
    protected readonly config: AvionicsConfig,
  ) {
    super(instrument, config);

    this.backplane.addInstrument(InstrumentBackplaneNames.FuelTotalizer, this.fuelTotalizer);
    this.backplane.addInstrument(InstrumentBackplaneNames.LandingGearDataProvider, this.landingGearData);
    this.backplane.addInstrument(InstrumentBackplaneNames.FlapWarningDataProvider, this.flapWarningData);
    this.backplane.addPublisher(InstrumentBackplaneNames.FuelTotalizerPublisher, this.fuelTotalizerPublisher);

    const annunciations = new XMLAnnunciationFactory(this.instrument).parseConfig(this.instrument.xmlConfig);
    this.casLegacyAdapter = new CasSystemLegacyAdapter(this.bus, this.xmlLogicHost, annunciations);
    this.auralsConfig = new Epic2XmlAuralsConfig(this.instrument, this.xmlLogicHost, this.bus);

    this.casPowerStateManager = new CasPowerStateManager(this.bus);

    this.agmSubject.pipe(this.isAgmOn);

    this.doInit();
  }

  /** Init instrument. */
  protected doInit(): void {
    this.initChecklists();

    // init plugins before super init so they have a chance to hook up to the backplane etc.
    this.initPluginSystem().then(() => {
      super.doInit();

      this.renderComponents();

      this.renderPluginComponents();
      this.casLegacyAdapter.start();
    });

    this.initFlightPlan();
  }

  /**
   * Initializes a checklist
   */
  private async initChecklists(): Promise<void> {
    let checklistDef: Epic2ChecklistDef | undefined;
    if (this.config.checklist.checklistFileURL !== undefined) {
      const fetch = this.config.checklist.resolve();
      checklistDef = await fetch(10000);
    }

    if (checklistDef) {
      this.checkListDef = checklistDef;
      this.checklistStateProvider = new DefaultChecklistStateProvider(1, this.bus, checklistDef);
      this.checklistManager = new ChecklistManager(1, this.bus, checklistDef);

      this.checklistStateProvider.init();
      this.checklistManager.wake();
    }
  }

  /**
   * Initializes the plugin system.
   * @returns A promise that resolves when the plugin system is ready.
   */
  private async initPluginSystem(): Promise<void> {
    await this.pluginSystem.addScripts(this.instrument.xmlConfig, `${this.instrument.templateID}_${this.instrument.instrumentIndex}`, (target) => {
      return target === this.instrument.templateID;
    });

    const pluginBinder: Epic2LowerMfdPluginBinder = {
      bus: this.bus,
      backplane: this.backplane,
      config: this.config,
    };

    return this.pluginSystem.startSystem(pluginBinder);
  }

  /** Makes sure that we have the flight plan, requesting sync if needed. */
  private async initFlightPlan(): Promise<void> {
    // Wait for Upper MFD to init the plan
    await Wait.awaitDelay(3000);

    // Request sync
    this.flightPlanner.requestSync();

    // Wait for sync
    await Wait.awaitDelay(500);
  }

  /** @inheritdoc */
  public Update(): void {
    super.Update();
    this.xmlLogicHost.update(this.instrument.deltaTime);
  }

  /** @inheritdoc */
  protected onPowerChanged(current: boolean, previous: boolean | undefined): void {
    super.onPowerChanged(current, previous);

    this.casPowerStateManager.onPowerChanged(current, previous);
  }

  /**
   * Renders any plugin UI components.
   */
  protected renderPluginComponents(): void {
    this.pluginSystem.callPlugins(p => {
      const node = p.renderSection?.();
      if (node) {
        FSComponent.render(node, document.getElementById('TwoThirdSection'));
      }
    });
  }

  /** @inheritdoc */
  protected renderComponents(): void {
    FSComponent.render(<CAS
      bus={this.bus}
      casSystem={this.casSystem}
      inhibitStateProvider={this.casInhibitStateProvider}
    />, document.getElementById('TopOneSixthSection'));
    FSComponent.render(<SystemConfigWindow
      bus={this.bus}
      pfdSettingsManager={this.pfdUserSettings}
      checklistStateProvider={this.checklistStateProvider}
      checklistManager={this.checklistManager}
      casSystem={this.casSystem}
    />, document.getElementById('BottomOneSixthSection'));
  }

  /** @inheritdoc */
  public override onInteractionEvent(args: string[]): void {
    if (!this.softKeyController.mapHEventToSoftKeyEvent(args[0])) {
      this.hEventPublisher.dispatchHEvent(args[0]);
    }
  }
}
