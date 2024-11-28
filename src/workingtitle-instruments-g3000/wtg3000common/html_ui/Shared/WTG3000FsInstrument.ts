/// <reference types="@microsoft/msfs-types/js/avionics" />
import {
  AdcPublisher, AhrsPublisher, AmbientPublisher, ArrayUtils, AutopilotInstrument, AvionicsSystem,
  BaseInstrumentPublisher, Clock, ConsumerSubject, ControlSurfacesPublisher, DebounceTimer,
  DefaultChecklistStateProvider, EISPublisher, EventBus, FacilityLoader, FacilityRepository,
  FlightPathAirplaneSpeedMode, FlightPathAirplaneWindMode, FlightPathCalculator, FlightPlanner, FlightTimerPublisher,
  FsInstrument, GameStateProvider, GNSSPublisher, GPSSatComputer, HEventPublisher, InstrumentBackplane,
  LNavObsSimVarPublisher, MinimumsSimVarPublisher, NavComSimVarPublisher, PluginSystem, SBASGroupName, SimVarValueType,
  SmoothingPathCalculator, Subject, VNavSimVarPublisher, Wait
} from '@microsoft/msfs-sdk';

import {
  AdcSystem, AglSystem, AhrsSystem, AoaSystem, DefaultMinimumsDataProvider,
  DefaultTerrainSystemStateDataProvider, Fms, FmsPositionSystem, FmsPositionSystemSelector, GarminAPSimVarPublisher,
  GarminChecklistItemTypeDefMap, GarminNavSimVarPublisher, GarminSpeedConstraintStore, GarminVNavUtils, GpsNavSource,
  GpsReceiverSelector, GpsReceiverSystem, MagnetometerSystem, MarkerBeaconSystem, NavEventsPublisher,
  NavRadioNavSource, NavReferenceIndicatorsCollection, NavReferenceSourceCollection, RadarAltimeterSystem,
  WeatherRadarAvionicsSystem
} from '@microsoft/msfs-garminsdk';

import { AvionicsConfig } from './AvionicsConfig/AvionicsConfig';
import { AvionicsStatusChangeEvent, AvionicsStatusEvents } from './AvionicsStatus/AvionicsStatusEvents';
import { AvionicsStatusClient, AvionicsStatusEventClient } from './AvionicsStatus/AvionicsStatusManager';
import { AvionicsStatus } from './AvionicsStatus/AvionicsStatusTypes';
import { CasPowerStateManager } from './CAS/CasPowerStateManager';
import { G3000ChecklistGroupMetadata, G3000ChecklistMetadata, G3000ChecklistSetDef } from './Checklist/G3000ChecklistDefinition';
import { InstrumentType, PfdIndex } from './CommonTypes';
import { DefaultDisplayOverlayController } from './DisplayOverlay/DefaultDisplayOverlayController';
import { FuelTotalizerSimVarPublisher } from './Fuel';
import { G3000FilePaths } from './G3000FilePaths';
import { G3000Plugin, G3000PluginBinder } from './G3000Plugin';
import { InstrumentBackplaneNames } from './Instruments/InstrumentBackplaneNames';
import {
  G3000ActiveSourceNavIndicator, G3000NavIndicator, G3000NavIndicatorName, G3000NavIndicators, G3000NavSource,
  G3000NavSourceName, G3000NavSources
} from './NavReference/G3000NavReference';
import { FmsSpeedUserSettingManager } from './Settings/FmsSpeedUserSettings';
import { PfdSensorsUserSettingManager } from './Settings/PfdSensorsUserSettings';
import { VSpeedUserSettingManager } from './Settings/VSpeedUserSettings';
import { WeightBalanceUserSettingManager } from './Settings/WeightBalanceUserSettings';
import { WeatherRadarEvents } from './WeatherRadar/WeatherRadarEvents';

import './WTG3000_Common.css';

/**
 * A common instrument for the G3000.
 */
export abstract class WTG3000FsInstrument implements FsInstrument {

  private isInstrumentPowered = false;
  private isPowerValid = false;
  protected isPowered: boolean | undefined = undefined;

  private readonly bootTimer = new DebounceTimer();

  protected readonly displayOverlayController = new DefaultDisplayOverlayController();

  protected readonly bus = new EventBus();
  protected readonly facRepo = FacilityRepository.getRepository(this.bus);
  protected readonly facLoader = new FacilityLoader(this.facRepo);

  protected readonly hEventPublisher = new HEventPublisher(this.bus);

  protected readonly flightPathCalculator = new FlightPathCalculator(
    this.facLoader,
    {
      initSyncRole: this.instrumentType === 'MFD' ? 'primary' : 'replica',
      defaultClimbRate: 300,
      defaultSpeed: 50,
      bankAngle: [[10, 60], [40, 300]],
      holdBankAngle: null,
      courseReversalBankAngle: null,
      turnAnticipationBankAngle: [[10, 60], [15, 100]],
      maxBankAngle: this.config.fms.flightPathOptions.maxBankAngle,
      airplaneSpeedMode: FlightPathAirplaneSpeedMode.TrueAirspeedPlusWind,
      airplaneWindMode: FlightPathAirplaneWindMode.Automatic,
    },
    this.bus
  );
  protected readonly flightPlanner = FlightPlanner.getPlanner('', this.bus, { calculator: this.flightPathCalculator });

  protected readonly verticalPathCalculator = new SmoothingPathCalculator(this.bus, this.flightPlanner, Fms.PRIMARY_PLAN_INDEX, {
    defaultFpa: 3,
    maxFpa: 6,
    isLegEligible: GarminVNavUtils.isLegVNavEligible,
    shouldUseConstraint: GarminVNavUtils.shouldUseConstraint,
    invalidateClimbConstraint: GarminVNavUtils.invalidateClimbConstraint,
    invalidateDescentConstraint: GarminVNavUtils.invalidateDescentConstraint
  });

  protected readonly speedConstraintStore = new GarminSpeedConstraintStore(this.bus, this.flightPlanner);

  protected readonly fms = new Fms(
    this.instrumentType === 'MFD',
    this.bus,
    this.flightPlanner,
    this.verticalPathCalculator,
    {
      lnavIndex: 0,
      isAdvancedVnav: this.config.vnav.advanced,
      visualApproachOptions: this.config.fms.approach.visualApproachOptions
    }
  );

  protected readonly avionicsStatusClient = new AvionicsStatusClient(this.instrumentType, this.instrument.instrumentIndex, this.bus);
  protected readonly avionicsStatusEventClient = new AvionicsStatusEventClient(this.avionicsStatusClient.uid, this.bus);
  protected readonly avionicsStatusSimVar = `L:WTG3000_${this.avionicsStatusClient.uid}_Avionics_Status`;
  protected readonly avionicsStatus = Subject.create<Readonly<AvionicsStatusChangeEvent> | undefined>(undefined);

  protected readonly backplane = new InstrumentBackplane();

  protected readonly clock = new Clock(this.bus);

  protected readonly baseInstrumentPublisher = new BaseInstrumentPublisher(this.instrument, this.bus);
  protected readonly ambientPublisher = new AmbientPublisher(this.bus);
  protected readonly adcPublisher = new AdcPublisher(this.bus);
  protected readonly ahrsPublisher = new AhrsPublisher(this.bus);
  protected readonly gnssPublisher = new GNSSPublisher(this.bus);
  protected readonly garminNavPublisher = new GarminNavSimVarPublisher(this.bus);
  protected readonly lnavObsPublisher = new LNavObsSimVarPublisher(this.bus);
  protected readonly vNavPublisher = new VNavSimVarPublisher(this.bus);
  protected readonly navComSimVarPublisher = new NavComSimVarPublisher(this.bus);
  protected readonly garminAutopilotPublisher = new GarminAPSimVarPublisher(this.bus);
  protected readonly minimumsPublisher = new MinimumsSimVarPublisher(this.bus);
  protected readonly navEventsPublisher = new NavEventsPublisher(this.bus);
  protected readonly eisPublisher = new EISPublisher(this.bus);
  protected readonly controlSurfacesPublisher = new ControlSurfacesPublisher(this.bus, 3);
  protected readonly timerPublisher = new FlightTimerPublisher(this.bus, 2);
  protected readonly fuelTotalizerPublisher = new FuelTotalizerSimVarPublisher(this.bus);

  protected readonly apInstrument = new AutopilotInstrument(this.bus);

  protected readonly systems: AvionicsSystem[] = [];

  protected abstract readonly navSources: G3000NavSources;
  protected abstract readonly navIndicators: G3000NavIndicators;

  protected readonly fmsPositionSystemSelector = new FmsPositionSystemSelector(this.bus, ArrayUtils.range(this.config.iauDefs.count, 1), 1);

  protected readonly minimumsDataProvider = new DefaultMinimumsDataProvider(this.bus, this.config.sensors.hasRadarAltimeter);
  protected readonly terrainSystemStateDataProvider = new DefaultTerrainSystemStateDataProvider(this.bus, '');

  protected readonly pfdSensorsSettingManager: PfdSensorsUserSettingManager;
  protected readonly vSpeedSettingManager: VSpeedUserSettingManager;
  protected readonly fmsSpeedsSettingManager?: FmsSpeedUserSettingManager;
  protected readonly weightBalanceSettingManager?: WeightBalanceUserSettingManager;

  protected readonly casPowerStateManager = new CasPowerStateManager(this.bus);

  protected checkListDef?: G3000ChecklistSetDef;
  protected checklistStateProvider?: DefaultChecklistStateProvider<GarminChecklistItemTypeDefMap, G3000ChecklistMetadata, G3000ChecklistGroupMetadata, void, void>;

  /** Whether this instrument has started updating. */
  protected haveUpdatesStarted = false;

  /**
   * Constructor.
   * @param instrumentType The type of this instrument.
   * @param instrument This instrument's parent BaseInstrument.
   * @param config This instrument's general configuration object.
   */
  constructor(
    protected readonly instrumentType: InstrumentType,
    public readonly instrument: BaseInstrument,
    protected readonly config: AvionicsConfig
  ) {
    this.backplane.addInstrument(InstrumentBackplaneNames.Clock, this.clock);
    this.backplane.addInstrument(InstrumentBackplaneNames.Autopilot, this.apInstrument);

    this.backplane.addPublisher(InstrumentBackplaneNames.Base, this.baseInstrumentPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.HEvents, this.hEventPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Ambient, this.ambientPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Adc, this.adcPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Ahrs, this.ahrsPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Gnss, this.gnssPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.GarminNav, this.garminNavPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.LNavObs, this.lnavObsPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.VNav, this.vNavPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.NavCom, this.navComSimVarPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.GarminAutopilot, this.garminAutopilotPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Minimums, this.minimumsPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.NavEvents, this.navEventsPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Eis, this.eisPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.ControlSurfaces, this.controlSurfacesPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Timer, this.timerPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.FuelTotalizer, this.fuelTotalizerPublisher);

    this.pfdSensorsSettingManager = this.createPfdSensorsUserSettingManager(config);
    this.vSpeedSettingManager = this.createVSpeedUserSettingManager(config);
    this.fmsSpeedsSettingManager = this.createFmsSpeedUserSettingManager(config);
    this.weightBalanceSettingManager = this.createWeightBalanceUserSettingManager(config);

    // force enable animations
    document.documentElement.classList.add('animationsEnabled');

    // Wait until game has entered briefing or in-game mode before initializing the avionics status client. This
    // ensures that we do not publish any statuses based on erroneous power states.
    Wait.awaitSubscribable(GameStateProvider.get(), gameState => gameState === GameState.briefing || gameState === GameState.ingame, true).then(async () => {
      this.isPowerValid = true;

      this.avionicsStatusClient.init();
      this.avionicsStatusEventClient.init();

      // Wait until updates have started before initializing the power state because instrument power is not
      // initialized until the first update.
      await Wait.awaitCondition(() => this.haveUpdatesStarted);

      if (this.isPowered === undefined) {
        this.isPowered = this.isInstrumentPowered;
        this.onPowerChanged(this.isPowered, undefined);
      }
    });
  }

  /**
   * Creates this instrument's avionics systems. This method should be called after `this.iauIndex` has been defined.
   */
  protected createSystems(): void {
    const globalSystemsPower = Subject.create(false);

    const adcSystems: AdcSystem[] = [];
    for (let pfdIndex = 1; pfdIndex <= this.config.gduDefs.pfdCount; pfdIndex++) {
      const pfdDef = this.config.gduDefs.pfds[pfdIndex];
      for (let i = 1; i <= this.config.sensors.adcCount; i++) {
        const adcDef = this.config.sensors.adcDefinitions[i];
        adcSystems.push(new AdcSystem(adcSystems.length + 1, this.bus, adcDef.airspeedIndicatorIndex, pfdDef.altimeterIndex, adcDef.electricity));
      }
    }

    // Garmin GMUs seem to always be powered directly from their parent AHRS systems.
    const magnetometers = this.config.sensors.ahrsDefinitions.slice(1, this.config.sensors.ahrsCount + 1).map((def, index) => {
      return new MagnetometerSystem(index + 1, this.bus, def.electricity);
    });
    const ahrsSystems = this.config.sensors.ahrsDefinitions.slice(1, this.config.sensors.ahrsCount + 1).map((def, index) => {
      return new AhrsSystem(index + 1, this.bus, def.attitudeIndicatorIndex, def.directionIndicatorIndex, def.electricity);
    });

    const gpsSystems: GpsReceiverSystem[] = [];
    const fmsPosSystems: FmsPositionSystem[] = [];

    for (let index = 1; index <= this.config.iauDefs.count; index++) {
      const iau = this.config.iauDefs.definitions[index];

      gpsSystems.push(new GpsReceiverSystem(
        index,
        this.bus,
        new GPSSatComputer(
          index,
          this.bus,
          `${G3000FilePaths.ASSETS_PATH}/Data/gps_ephemeris.json`,
          `${G3000FilePaths.ASSETS_PATH}/Data/gps_sbas.json`,
          5000,
          Object.values(SBASGroupName),
          this.instrumentType === 'MFD' ? 'primary' : 'replica',
          {
            channelCount: 15,
            satInUseMaxCount: 15,
            satInUsePdopTarget: 2,
            satInUseOptimumCount: 5
          }
        ),
        iau.gpsDefinition.electricity
      ));
    }

    for (let pfdIndex = 1; pfdIndex <= this.config.gduDefs.pfdCount; pfdIndex++) {
      const gpsReceiverSelector = new GpsReceiverSelector(
        this.bus,
        ArrayUtils.range(this.config.iauDefs.count, 1),
        {
          receiverPriorities: this.config.gduDefs.pfds[pfdIndex].fmsPosDefinition.gpsReceiverPriorities
        }
      );
      gpsReceiverSelector.init();

      fmsPosSystems.push(new FmsPositionSystem(
        1,
        this.bus,
        gpsReceiverSelector.selectedIndex,
        this.pfdSensorsSettingManager.getAliasedManager(pfdIndex as PfdIndex).getSetting('pfdAdcIndex'),
        this.pfdSensorsSettingManager.getAliasedManager(pfdIndex as PfdIndex).getSetting('pfdAhrsIndex'),
        undefined, undefined,
        globalSystemsPower
      ));
    }

    this.fmsPositionSystemSelector.init();

    const aoaDefContext = { bus: this.bus };

    this.systems.push(
      ...magnetometers,
      ...adcSystems,
      ...ahrsSystems,
      ...gpsSystems,
      ...fmsPosSystems,
      new AoaSystem(1, this.bus, this.config.sensors.aoaDefinition.electricity, {
        stallAoa: this.config.sensors.aoaDefinition.stallAoa?.(aoaDefContext).value,
        zeroLiftAoa: this.config.sensors.aoaDefinition.zeroLiftAoa?.(aoaDefContext).value,
      }),
      new MarkerBeaconSystem(1, this.bus, this.config.sensors.markerBeaconDefinition.electricity)
    );

    if (this.config.sensors.radarAltimeterDefinition !== undefined) {
      this.systems.push(new RadarAltimeterSystem(1, this.bus, this.config.sensors.radarAltimeterDefinition.electricity));
    }

    if (this.config.sensors.weatherRadarDefinition !== undefined) {
      const def = this.config.sensors.weatherRadarDefinition;
      const activeScanCircuitTopic = def.scanActiveCircuitIndex !== undefined && def.scanActiveCircuitProcedureIndex !== undefined
        ? `elec_circuit_on_${def.scanActiveCircuitIndex}` as const
        : undefined;

      this.systems.push(new WeatherRadarAvionicsSystem(
        this.bus,
        def.electricity,
        activeScanCircuitTopic,
        ConsumerSubject.create(this.bus.getSubscriber<WeatherRadarEvents>().on('wx_radar_is_scan_active'), false)
      ));
    }

    this.systems.push(new AglSystem(1, this.bus, globalSystemsPower, { fmsPosIndex: this.fmsPositionSystemSelector.selectedIndex }));
    if (this.config.sensors.radarAltimeterDefinition !== undefined) {
      this.systems.push(new AglSystem(2, this.bus, globalSystemsPower, { radarAltIndex: 1, maxRadarAlt: 2500 }));
    }

    this.initGlobalSystemsPower(globalSystemsPower);
  }

  /**
   * Initializes power logic for avionics systems that are considered globally powered.
   * @param globalSystemsPower A subject to which to write the power state for globally powered avionics systems.
   */
  private initGlobalSystemsPower(globalSystemsPower: Subject<boolean>): void {
    this.bus.getSubscriber<AvionicsStatusEvents>().on('avionics_global_power').handle(event => {
      globalSystemsPower.set(event.current === true);
    });
  }

  /**
   * Creates a navigation reference source collection for this instrument to use.
   * @returns A navigation reference source collection for this instrument to use.
   */
  protected createNavReferenceSourceCollection(): G3000NavSources {
    return new NavReferenceSourceCollection<G3000NavSourceName>(...this.createNavReferenceSources());
  }

  /**
   * Creates a navigation reference indicator collection for this instrument to use.
   * @returns A navigation reference indicator collection for this instrument to use.
   */
  protected createNavReferenceIndicatorCollection(): G3000NavIndicators {
    return new NavReferenceIndicatorsCollection(new Map<G3000NavIndicatorName, G3000NavIndicator>(this.createNavReferenceIndicators()));
  }

  /**
   * Creates an array of the navigation reference sources for this instrument to use.
   * @returns An array of the navigation reference sources for this instrument to use.
   */
  protected createNavReferenceSources(): G3000NavSource[] {
    return [
      new NavRadioNavSource<G3000NavSourceName>(this.bus, 'NAV1', 1),
      new NavRadioNavSource<G3000NavSourceName>(this.bus, 'NAV2', 2),
      new GpsNavSource<G3000NavSourceName>(this.bus, 'FMS1', 1),
      new GpsNavSource<G3000NavSourceName>(this.bus, 'FMS2', 2)
    ];
  }

  /**
   * Creates an array of tuples of the navigation reference indicator names and their associated indicators for this
   * instrument to use.
   * @returns An array of tuples of the navigation reference indicator names and their associated indicators for this
   * instrument to use.
   */
  protected createNavReferenceIndicators(): [G3000NavIndicatorName, G3000NavIndicator][] {
    return [
      ['activeSource', new G3000ActiveSourceNavIndicator(this.navSources, this.bus, 1)]
    ];
  }

  /**
   * Creates a manager for PFD sensors user settings defined by a configuration object.
   * @param config A general configuration object.
   * @returns A manager for PFD sensors user settings defined by the specified configuration object.
   */
  private createPfdSensorsUserSettingManager(config: AvionicsConfig): PfdSensorsUserSettingManager {
    return new PfdSensorsUserSettingManager(this.bus, config.gduDefs, config.sensors);
  }

  /**
   * Creates a manager for reference V-speed user settings defined by a configuration object.
   * @param config A general configuration object.
   * @returns A manager for reference V-speed user settings defined by the specified configuration object.
   */
  private createVSpeedUserSettingManager(config: AvionicsConfig): VSpeedUserSettingManager {
    return new VSpeedUserSettingManager(this.bus, config.vSpeedGroups);
  }

  /**
   * Creates a manager for reference V-speed user settings defined by a configuration object.
   * @param config A general configuration object.
   * @returns A manager for reference V-speed user settings defined by the specified configuration object.
   */
  private createFmsSpeedUserSettingManager(config: AvionicsConfig): FmsSpeedUserSettingManager | undefined {
    return config.vnav.fmsSpeeds === undefined ? undefined : new FmsSpeedUserSettingManager(this.bus, config.vnav.fmsSpeeds);
  }

  /**
   * Creates a manager for weight and balance user settings defined by a configuration object.
   * @param config A general configuration object.
   * @returns A manager for weight and balance user settings defined by the specified configuration object.
   */
  private createWeightBalanceUserSettingManager(config: AvionicsConfig): WeightBalanceUserSettingManager | undefined {
    return config.performance.weightBalanceConfig === undefined ? undefined : new WeightBalanceUserSettingManager(this.bus, config.performance.weightBalanceConfig);
  }

  /**
   * Initializes this instrument's checklist system.
   * @param pluginSystem This instrument's plugin system.
   */
  protected async initChecklist(pluginSystem: PluginSystem<G3000Plugin, G3000PluginBinder>): Promise<void> {
    let checklistDef: G3000ChecklistSetDef | undefined = undefined;

    pluginSystem.callPlugins((plugin: G3000Plugin) => {
      checklistDef = plugin.getChecklistDef?.();
    });

    if (!checklistDef && this.config.checklist.checklistFileURL !== undefined) {
      const fetch = this.config.checklist.resolve();
      checklistDef = await fetch(10000);
    }

    if (checklistDef) {
      this.checkListDef = checklistDef;
      this.checklistStateProvider = new DefaultChecklistStateProvider(1, this.bus, checklistDef);
    }

    pluginSystem.callPlugins((plugin: G3000Plugin) => {
      plugin.onChecklistInit?.(this.checkListDef, this.checklistStateProvider);
    });
  }

  /**
   * Initializes this instrument's avionics status listener. Once intialized, the listener will call this instrument's
   * `onAvionicsStatusChanged()` method as appropriate.
   */
  protected initAvionicsStatusListener(): void {
    this.bus.getSubscriber<AvionicsStatusEvents>().on(`avionics_status_${this.avionicsStatusClient.uid}`).handle(this.onAvionicsStatusChanged.bind(this));
  }

  /**
   * Gets the duration, in milliseconds, required for this instrument to boot on power up.
   * @returns The duration, in milliseconds, required for this instrument to boot on power up.
   */
  protected abstract getBootDuration(): number;

  /** @inheritdoc */
  public Update(): void {
    this.haveUpdatesStarted = true;
    this.backplane.onUpdate();
    this.updateSystems();
  }

  /**
   * Updates this instrument's systems.
   */
  protected updateSystems(): void {
    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i].onUpdate();
    }
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onInteractionEvent(args: string[]): void {
    this.hEventPublisher.dispatchHEvent(args[0]);
  }

  /** @inheritdoc */
  public onFlightStart(): void {
    // noop
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onGameStateChanged(oldState: GameState, newState: GameState): void {
    // noop
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onSoundEnd(soundEventId: Name_Z): void {
    // noop
  }

  /**
   * A callback which is executed when this instrument transitions from a power-off to power-on state.
   */
  public onPowerOn(): void {
    this.isInstrumentPowered = true;

    if (this.isPowerValid) {
      const old = this.isPowered;
      this.isPowered = true;

      if (old !== true) {
        this.onPowerChanged(true, old);
      }
    }
  }

  /**
   * A callback which is executed when this instrument transitions from a power-on to power-off state.
   */
  public onPowerOff(): void {
    this.isInstrumentPowered = false;

    if (this.isPowerValid) {
      const old = this.isPowered;
      this.isPowered = false;

      if (old !== false) {
        this.onPowerChanged(false, old);
      }
    }
  }

  /**
   * Responds to when this instrument's power state changes.
   * @param current The current power state.
   * @param previous The previous power state, or `undefined` if the previous state was invalid.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onPowerChanged(current: boolean, previous: boolean | undefined): void {
    if (current) {
      if (previous === undefined) {
        // The instrument started in a powered state, so we skip bootup and set the status to ON.
        this.bootTimer.clear();
        this.avionicsStatusClient.setStatus(AvionicsStatus.On);
      } else {
        // The instrument transitioned from an unpowered to a powered state, so perform bootup.
        this.avionicsStatusClient.setStatus(AvionicsStatus.Booting);
        this.bootTimer.schedule(this.onBootFinished.bind(this), this.getBootDuration());
      }
    } else {
      this.bootTimer.clear();
      this.avionicsStatusClient.setStatus(AvionicsStatus.Off);
    }
  }

  /**
   * Responds to when this instrument is finished booting.
   */
  protected onBootFinished(): void {
    this.avionicsStatusClient.setStatus(AvionicsStatus.On);
  }

  /**
   * Responds to when the avionics status of this instrument changes.
   * @param event The event describing the avionics status change.
   */
  protected onAvionicsStatusChanged(event: Readonly<AvionicsStatusChangeEvent>): void {
    this.avionicsStatus.set(event);
    SimVar.SetSimVarValue(this.avionicsStatusSimVar, SimVarValueType.Number, event.current);
  }
}
