/// <reference types="@microsoft/msfs-types/js/avionics" />
import {
  AdcPublisher, AhrsPublisher, AutopilotInstrument, AvionicsSystem, BaseInstrumentPublisher, Clock, ControlSurfacesPublisher,
  DebounceTimer, EISPublisher, EventBus, FacilityLoader, FacilityRepository, FlightPathAirplaneSpeedMode, FlightPathCalculator,
  FlightPlanner, FlightTimerPublisher, FsInstrument, GameStateProvider, GNSSPublisher, GPSSatComputer, HEventPublisher,
  InstrumentBackplane, LNavSimVarPublisher, MinimumsSimVarPublisher, SBASGroupName, SimVarValueType, SmoothingPathCalculator,
  VNavSimVarPublisher, Wait
} from '@microsoft/msfs-sdk';

import {
  AdcSystem, AhrsSystem, AoaSystem, DefaultMinimumsDataProvider, Fms, FmsPositionSystem, GarminNavSimVarPublisher, GarminSpeedConstraintStore, GarminVNavUtils,
  GpsReceiverSelector, GpsReceiverSystem, LNavDataSimVarPublisher, MagnetometerSystem, MarkerBeaconSystem, NavEventsPublisher, RadarAltimeterSystem,
} from '@microsoft/msfs-garminsdk';

import { AvionicsConfig } from './AvionicsConfig/AvionicsConfig';
import { AvionicsStatusChangeEvent, AvionicsStatusEvents } from './AvionicsStatus/AvionicsStatusEvents';
import { AvionicsStatusClient, AvionicsStatusEventClient } from './AvionicsStatus/AvionicsStatusManager';
import { AvionicsStatus } from './AvionicsStatus/AvionicsStatusTypes';
import { CasPowerStateManager } from './CAS/CasPowerStateManager';
import { FmsSpeedUserSettingManager } from './Settings/FmsSpeedUserSettings';
import { IauUserSettingManager } from './Settings/IauUserSettings';
import { VSpeedUserSettingManager } from './Settings/VSpeedUserSettings';
import { InstrumentType } from './CommonTypes';
import { InstrumentBackplaneNames } from './Instruments/InstrumentBackplaneNames';
import { FuelTotalizerSimVarPublisher } from './Fuel';
import { WeightFuelPublisher } from './Performance/WeightFuel/WeightFuelEvents';

import './WTG3000_Common.css';

/**
 * A common instrument for the G3000.
 */
export abstract class WTG3000FsInstrument implements FsInstrument {

  /** The index of the IAU (integrated avionics unit) linked to this instrument. */
  protected abstract readonly iauIndex: number;

  private isInstrumentPowered = false;
  private isPowerValid = false;
  protected isPowered: boolean | undefined = undefined;

  private readonly bootTimer = new DebounceTimer();

  protected readonly bus = new EventBus();
  protected readonly facRepo = FacilityRepository.getRepository(this.bus);
  protected readonly facLoader = new FacilityLoader(this.facRepo);

  protected readonly hEventPublisher = new HEventPublisher(this.bus);

  protected readonly flightPathCalculator = new FlightPathCalculator(
    this.facLoader,
    {
      defaultClimbRate: 300,
      defaultSpeed: 50,
      bankAngle: [[10, 60], [40, 300]],
      holdBankAngle: null,
      courseReversalBankAngle: null,
      turnAnticipationBankAngle: [[10, 60], [15, 100]],
      maxBankAngle: this.config.fms.flightPathOptions.maxBankAngle,
      airplaneSpeedMode: FlightPathAirplaneSpeedMode.TrueAirspeedPlusWind
    },
    this.bus
  );
  protected readonly flightPlanner = FlightPlanner.getPlanner(this.bus, this.flightPathCalculator);

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
    this.config.vnav.advanced,
    undefined,
    this.config.fms.approach.visualApproachOptions
  );

  protected readonly avionicsStatusClient = new AvionicsStatusClient(this.instrumentType, this.instrument.instrumentIndex, this.bus);
  protected readonly avionicsStatusEventClient = new AvionicsStatusEventClient(this.avionicsStatusClient.uid, this.bus);
  protected readonly avionicsStatusSimVar = `L:WTG3000_${this.avionicsStatusClient.uid}_Avionics_Status`;

  protected readonly backplane = new InstrumentBackplane();

  protected readonly clock = new Clock(this.bus);

  protected readonly baseInstrumentPublisher = new BaseInstrumentPublisher(this.instrument, this.bus);
  protected readonly adcPublisher = new AdcPublisher(this.bus);
  protected readonly ahrsPublisher = new AhrsPublisher(this.bus);
  protected readonly gnssPublisher = new GNSSPublisher(this.bus);
  protected readonly garminNavPublisher = new GarminNavSimVarPublisher(this.bus);
  protected readonly lNavPublisher = new LNavSimVarPublisher(this.bus);
  protected readonly lNavDataPublisher = new LNavDataSimVarPublisher(this.bus);
  protected readonly vNavPublisher = new VNavSimVarPublisher(this.bus);
  protected readonly minimumsPublisher = new MinimumsSimVarPublisher(this.bus);
  protected readonly navEventsPublisher = new NavEventsPublisher(this.bus);
  protected readonly eisPublisher = new EISPublisher(this.bus);
  protected readonly controlSurfacesPublisher = new ControlSurfacesPublisher(this.bus, 3);
  protected readonly timerPublisher = new FlightTimerPublisher(this.bus, 2);
  protected readonly fuelTotalizerPublisher = new FuelTotalizerSimVarPublisher(this.bus);
  protected readonly weightFuelPublisher = new WeightFuelPublisher(this.bus);

  protected readonly apInstrument = new AutopilotInstrument(this.bus);

  protected readonly systems: AvionicsSystem[] = [];

  protected readonly minimumsDataProvider = new DefaultMinimumsDataProvider(this.bus, this.config.sensors.hasRadarAltimeter);

  protected readonly iauSettingManager: IauUserSettingManager;
  protected readonly vSpeedSettingManager: VSpeedUserSettingManager;
  protected readonly fmsSpeedsSettingManager?: FmsSpeedUserSettingManager;

  protected readonly casPowerStateManager = new CasPowerStateManager(this.bus);

  protected gpsReceiverSelector?: GpsReceiverSelector;

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
    this.backplane.addPublisher(InstrumentBackplaneNames.Adc, this.adcPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Ahrs, this.ahrsPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Gnss, this.gnssPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.GarminNav, this.garminNavPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.LNav, this.lNavPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.LNavData, this.lNavDataPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.VNav, this.vNavPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Minimums, this.minimumsPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.NavEvents, this.navEventsPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Eis, this.eisPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.ControlSurfaces, this.controlSurfacesPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Timer, this.timerPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.FuelTotalizer, this.fuelTotalizerPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.WeightFuel, this.weightFuelPublisher);

    this.iauSettingManager = this.createIauUserSettingManager(config);
    this.vSpeedSettingManager = this.createVSpeedUserSettingManager(config);
    this.fmsSpeedsSettingManager = this.createFmsSpeedUserSettingManager(config);

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
    const altimeterIndex = this.config.iauDefs.definitions[this.iauIndex].altimeterIndex;

    const adcSystems = this.config.sensors.adcDefinitions.slice(1, this.config.sensors.adcCount + 1).map((def, index) => {
      return new AdcSystem(index + 1, this.bus, def.airspeedIndicatorIndex, altimeterIndex, def.electricity);
    });

    // Garmin GMUs seem to always be powered directly from their parent AHRS systems.
    const magnetometers = this.config.sensors.ahrsDefinitions.slice(1, this.config.sensors.ahrsCount + 1).map((def, index) => {
      return new MagnetometerSystem(index + 1, this.bus, def.electricity);
    });
    const ahrsSystems = this.config.sensors.ahrsDefinitions.slice(1, this.config.sensors.ahrsCount + 1).map((def, index) => {
      return new AhrsSystem(index + 1, this.bus, def.attitudeIndicatorIndex, def.directionIndicatorIndex, def.electricity);
    });

    const gpsSystems: GpsReceiverSystem[] = [];
    const fmsPosSystems: FmsPositionSystem[] = [];

    this.gpsReceiverSelector = new GpsReceiverSelector(
      this.bus,
      Array.from({ length: this.config.iauDefs.count }, (v, index) => index + 1),
      Math.min(this.iauIndex, this.config.iauDefs.count)
    );

    for (let index = 1; index <= this.config.iauDefs.count; index++) {
      const iau = this.config.iauDefs.definitions[index];

      gpsSystems.push(new GpsReceiverSystem(
        index,
        this.bus,
        new GPSSatComputer(
          index,
          this.bus,
          'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Data/gps_ephemeris.json',
          'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Data/gps_sbas.json',
          5000,
          Object.values(SBASGroupName),
          this.instrumentType === 'MFD' ? 'primary' : 'replica'
        ),
        iau.gpsDefinition.electricity
      ));

      fmsPosSystems.push(new FmsPositionSystem(
        index,
        this.bus,
        this.gpsReceiverSelector.selectedIndex,
        this.iauSettingManager.getAliasedManager(index).getSetting('iauAdcIndex'),
        this.iauSettingManager.getAliasedManager(index).getSetting('iauAhrsIndex'),
        undefined, undefined,
        iau.fmsPosDefinition.electricity
      ));
    }

    this.gpsReceiverSelector.init();

    this.systems.push(
      ...magnetometers,
      ...adcSystems,
      ...ahrsSystems,
      ...gpsSystems,
      ...fmsPosSystems,
      new AoaSystem(1, this.bus, this.config.sensors.aoaDefinition.electricity),
      new MarkerBeaconSystem(1, this.bus, this.config.sensors.markerBeaconDefinition.electricity)
    );

    if (this.config.sensors.radarAltimeterDefinition !== undefined) {
      this.systems.push(new RadarAltimeterSystem(1, this.bus, this.config.sensors.radarAltimeterDefinition.electricity));
    }
  }

  /**
   * Creates a manager for IAU user settings defined by a configuration object.
   * @param config A general configuration object.
   * @returns A manager for IAU user settings defined by the specified configuration object.
   */
  private createIauUserSettingManager(config: AvionicsConfig): IauUserSettingManager {
    return new IauUserSettingManager(this.bus, config.iauDefs);
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
    SimVar.SetSimVarValue(this.avionicsStatusSimVar, SimVarValueType.Number, event.current);
  }
}