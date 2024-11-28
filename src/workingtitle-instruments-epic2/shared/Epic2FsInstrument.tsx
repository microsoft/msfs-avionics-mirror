import {
  AdcPublisher, AhrsPublisher, AircraftInertialPublisher, AntiIcePublisher, AutopilotInstrument, AvionicsSystem, AvionicsSystemState, BaseInstrumentPublisher,
  BrakeSimvarPublisher, Clock, ControlSurfacesPublisher, DebounceTimer, EISPublisher, ElectricalPublisher, EventBus, FacilityLoader, FacilityRepository,
  FlightPathAirplaneSpeedMode, FlightPathAirplaneWindMode, FlightPathCalculator, FlightPlanner, FlightTimerPublisher, FSComponent, FsInstrument, FuelSystemSimVarPublisher,
  GameStateProvider, GNSSPublisher, GPSSatComputer, HEventPublisher, InstrumentBackplane, MappedSubject, MinimumsSimVarPublisher,
  NavComSimVarPublisher, SBASGroupName, SimVarValueType, SmoothingPathCalculator, Subject, TrafficInstrument, VNavSimVarPublisher, Wait, XPDRInstrument
} from '@microsoft/msfs-sdk';

import { Epic2ApPanelPublisher } from './Autopilot/Epic2ApPanelPublisher';
import { AvionicsConfig } from './AvionicsConfig/AvionicsConfig';
import { Epic2FlightPlans, Epic2FmsUtils } from './Fms';
import { InstrumentBackplaneNames } from './InstrumentBackplaneNames';
import { DisplayUnitIndices } from './InstrumentIndices';
import { SpeedLimitPublisher } from './Instruments/SpeedLimit';
import {
  Epic2DuControlEvents, Epic2DuController, Epic2DuControlLocalVars, Epic2GraphicsModule, Epic2GraphicsModuleEvents, Epic2InputControlPublisher
} from './Misc';
import { Epic2StartupDisplayComponent } from './Misc/Epic2StartupScreen';
import { Epic2NearestContext } from './Navigation/Epic2NearestContext';
import { CockpitUserSettings, MfdUserSettingManager, NavComUserSettingManager, PfdUserSettingManager } from './Settings';
import { XpdrSystem } from './Systems';
import { AdahrsSystem, AdahrsSystemChannel } from './Systems/AdahrsSystem';
import { AdahrsSystemSelector } from './Systems/AdahrsSystemSelector';
import { AdfSystem } from './Systems/AdfSystem';
import { AoaSystem } from './Systems/AoaSystem';
import { AoaSystemSelector } from './Systems/AoaSystemSelector';
import { FlapWarningSystem } from './Systems/FlapWarningSystem';
import { FlapWarningSystemSelector } from './Systems/FlapWarningSystemSelector';
import { FmsPositionSystem } from './Systems/FmsPositionSystem';
import { GpsReceiverSelector } from './Systems/GpsReceiverSelector';
import { GpsReceiverSystem } from './Systems/GpsReceiverSystem';
import { LandingGearSystem } from './Systems/LandingGearSystem';
import { MagnetometerSystem } from './Systems/MagnetometerSystem';
import { RASystem } from './Systems/RASystem';

import './Epic2.css';

/**
 * A common instrument for the Epic 2.
 */
export abstract class Epic2FsInstrument implements FsInstrument {
  /** The home display unit for this display (i.e. without MFD swap). */
  protected readonly displayUnitIndex = this.instrument.instrumentIndex as DisplayUnitIndices;
  /** The actual DU hosting this display, considering MFD swap. */
  protected readonly hostDisplayUnitIndex = Subject.create(this.displayUnitIndex);

  private isInstrumentPowered = false;
  private isPowerValid = false;
  protected isPowered: boolean | undefined = undefined;

  protected readonly selectedAoaIndex = Subject.create(-1);
  protected readonly selectedAdahrsIndex = Subject.create(-1);
  protected readonly selectedFmsPosIndex = Subject.create(-1);
  protected readonly selectedFlapWarningIndex = Subject.create(-1);

  protected readonly agm1State = Subject.create(AvionicsSystemState.Off);
  protected readonly agm2State = Subject.create(AvionicsSystemState.Off);
  protected readonly isAgmOn = Subject.create(false);
  protected readonly isDuBooted = Subject.create(false);
  private readonly bootTimer = new DebounceTimer();
  private readonly bootScreenRef = FSComponent.createRef<Epic2StartupDisplayComponent>();

  protected readonly bus = new EventBus();

  protected readonly cockpitUserSettings = CockpitUserSettings.getManager(this.bus);

  protected readonly facRepo = FacilityRepository.getRepository(this.bus);
  protected readonly facLoader = new FacilityLoader(this.facRepo);
  protected readonly nearestContext = new Epic2NearestContext(this.bus, this.facLoader);

  protected readonly mfdUserSettingsManager = new MfdUserSettingManager(this.bus, [DisplayUnitIndices.MfdUpper, DisplayUnitIndices.MfdLower], this.config);
  protected readonly pfdUserSettingsManager = new PfdUserSettingManager(this.bus, [DisplayUnitIndices.PfdLeft, DisplayUnitIndices.PfdRight]);

  protected readonly navComUserSettingsManager = new NavComUserSettingManager(this.bus, 2);

  protected readonly hEventPublisher = new HEventPublisher(this.bus);
  protected readonly softKeyController = new Epic2DuController(this.bus, this.displayUnitIndex, this.hEventPublisher);
  protected readonly duControlPublisher = new Epic2InputControlPublisher(this.bus, this.hostDisplayUnitIndex);

  protected readonly flightPathCalculator = new FlightPathCalculator(
    this.facLoader,
    {
      defaultClimbRate: 300,
      defaultSpeed: 50,
      bankAngle: [[10, 60], [40, 300]],
      holdBankAngle: null,
      courseReversalBankAngle: null,
      turnAnticipationBankAngle: [[10, 60], [15, 100]],
      maxBankAngle: 25,
      airplaneSpeedMode: FlightPathAirplaneSpeedMode.TrueAirspeedPlusWind,
      airplaneWindMode: FlightPathAirplaneWindMode.Automatic,
    },
    this.bus
  );
  protected readonly flightPlanner = FlightPlanner.getPlanner(this.bus, this.flightPathCalculator, Epic2FmsUtils.buildEpic2LegName);

  protected readonly verticalPathCalculator = new SmoothingPathCalculator(this.bus, this.flightPlanner, Epic2FlightPlans.Active, {
    defaultFpa: 3,
    maxFpa: 6,
  });

  protected readonly backplane = new InstrumentBackplane();

  protected readonly clock = new Clock(this.bus);

  protected readonly baseInstrumentPublisher = new BaseInstrumentPublisher(this.instrument, this.bus);
  protected readonly adcPublisher = new AdcPublisher(this.bus);
  protected readonly ahrsPublisher = new AhrsPublisher(this.bus);
  protected readonly aircraftInertialPublisher = new AircraftInertialPublisher(this.bus);
  protected readonly antiIcePublisher = new AntiIcePublisher(this.bus);
  protected readonly brakePublisher = new BrakeSimvarPublisher(this.bus);
  protected readonly gnssPublisher = new GNSSPublisher(this.bus);
  protected readonly vNavPublisher = new VNavSimVarPublisher(this.bus);
  protected readonly navComSimVarPublisher = new NavComSimVarPublisher(this.bus);
  protected readonly minimumsPublisher = new MinimumsSimVarPublisher(this.bus);
  protected readonly eisPublisher = new EISPublisher(this.bus);
  protected readonly controlSurfacesPublisher = new ControlSurfacesPublisher(this.bus, 3);
  protected readonly timerPublisher = new FlightTimerPublisher(this.bus, 2);
  protected readonly electricalPublisher = new ElectricalPublisher(this.bus);
  protected readonly speedLimitPublisher = new SpeedLimitPublisher(this.bus, this.selectedAoaIndex, this.selectedAdahrsIndex, this.config);
  protected readonly fuelSystemPublisher = new FuelSystemSimVarPublisher(this.bus);
  protected readonly apPanelPublisher = new Epic2ApPanelPublisher(this.bus);

  protected readonly apInstrument = new AutopilotInstrument(this.bus);
  protected readonly trafficInstrument = new TrafficInstrument(this.bus, { realTimeUpdateFreq: 2, simTimeUpdateFreq: 1, contactDeprecateTime: 10 });
  protected readonly xpdrInstrument = new XPDRInstrument(this.bus);

  protected readonly systems: AvionicsSystem[] = [];

  protected gpsReceiverSelector?: GpsReceiverSelector;
  protected adahrsSelector?: AdahrsSystemSelector;
  protected flapWarningSelector?: FlapWarningSystemSelector;

  /** Whether this instrument has started updating. */
  protected haveUpdatesStarted = false;

  /**
   * Creates a new instance of Epic2FsInstrument.
   * @param instrument This instrument's parent BaseInstrument.
   * @param config The general avionics configuration object.
   */
  constructor(
    public readonly instrument: BaseInstrument,
    protected readonly config: AvionicsConfig,
  ) {
    this.renderBootScreen();

    this.backplane.addInstrument(InstrumentBackplaneNames.Clock, this.clock);
    this.backplane.addInstrument(InstrumentBackplaneNames.Autopilot, this.apInstrument);
    this.backplane.addInstrument(InstrumentBackplaneNames.Traffic, this.trafficInstrument);
    this.backplane.addInstrument(InstrumentBackplaneNames.Xpdr, this.xpdrInstrument);

    this.backplane.addPublisher(InstrumentBackplaneNames.Base, this.baseInstrumentPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.HEvents, this.hEventPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Adc, this.adcPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Ahrs, this.ahrsPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.AircraftInertial, this.aircraftInertialPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.AntiIce, this.antiIcePublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Brakes, this.brakePublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Gnss, this.gnssPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.VNav, this.vNavPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.NavCom, this.navComSimVarPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Minimums, this.minimumsPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Eis, this.eisPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.ControlSurfaces, this.controlSurfacesPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Timer, this.timerPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Electrical, this.electricalPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.SpeedLimit, this.speedLimitPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.FuelSystem, this.fuelSystemPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.ApPanelPublisher, this.apPanelPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.DuControl, this.duControlPublisher);

    this.createSystems();

    // force enable animations
    document.documentElement.classList.add('animationsEnabled');

    // Wait until game has entered briefing or in-game mode before initializing the avionics status client. This
    // ensures that we do not publish any statuses based on erroneous power states.
    Wait.awaitSubscribable(GameStateProvider.get(), gameState => gameState === GameState.briefing || gameState === GameState.ingame, true).then(async () => {
      this.isPowerValid = true;

      // Wait until updates have started before initializing the power state because instrument power is not
      // initialized until the first update.
      await Wait.awaitCondition(() => this.haveUpdatesStarted);

      if (this.isPowered === undefined) {
        this.isPowered = this.isInstrumentPowered;
        this.onPowerChanged(this.isPowered, undefined);
      }
    });

    if (this.displayUnitIndex === DisplayUnitIndices.MfdLower || this.displayUnitIndex === DisplayUnitIndices.MfdUpper) {
      this.bus.getSubscriber<Epic2DuControlEvents>().on('epic2_mfd_swap').handle((isSwapped) => {
        if (this.displayUnitIndex === DisplayUnitIndices.MfdLower) {
          this.hostDisplayUnitIndex.set(isSwapped ? DisplayUnitIndices.MfdUpper : DisplayUnitIndices.MfdLower);
        } else {
          this.hostDisplayUnitIndex.set(isSwapped ? DisplayUnitIndices.MfdLower : DisplayUnitIndices.MfdUpper);
        }
      });
    }
  }

  /**
   * Renders the boot screen
   */
  private renderBootScreen(): void {
    FSComponent.render(<Epic2StartupDisplayComponent ref={this.bootScreenRef} />, document.getElementById('Bootup'));

    const bootScreen = this.bootScreenRef.getOrDefault();
    const displayContents = document.getElementById('Powered');

    if (bootScreen && displayContents) {
      MappedSubject.create(([agmOn, duBooted]) => {
        displayContents.style.visibility = duBooted && agmOn ? 'visible' : 'hidden';
        bootScreen.setVisibility(duBooted && !agmOn);
      }, this.isAgmOn, this.isDuBooted);
    }
  }

  /**
   * Creates this instrument's avionics systems.
   */
  protected createSystems(): void {
    const magnetometerSystems = this.config.sensors.magnetometerDefinitions.slice(1, this.config.sensors.magnetometerCount + 1).map((def, index) => {
      return new MagnetometerSystem(index + 1, this.bus, def.electricity);
    });

    const adfSystems = this.config.sensors.adfDefinitions.slice(1, this.config.sensors.adfCount + 1).map((def, index) => {
      return new AdfSystem(index + 1, this.bus, def.electricity);
    });

    const xpdrSystems = this.config.sensors.xpdrDefinitions.slice(1, this.config.sensors.xpdrCount + 1).map((def, index) => {
      return new XpdrSystem(index + 1, this.bus, def.electricity);
    });

    const raSystems = this.config.sensors.radarAltimeterDefinitions.slice(1, this.config.sensors.radarAltimeterCount + 1).map((def, index) => {
      return new RASystem(index + 1, this.bus, def.antennaOffset, def.measurementOffset, def.electricity);
    });

    const gpsSystems = this.config.sensors.gpsDefinitions.slice(1, this.config.sensors.gpsCount + 1).map((def, index) => new GpsReceiverSystem(
      index + 1,
      this.bus,
      new GPSSatComputer(
        index + 1,
        this.bus,
        'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Data/gps_ephemeris.json',
        'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Data/gps_sbas.json',
        5000,
        Object.values(SBASGroupName),
        this.displayUnitIndex === DisplayUnitIndices.MfdUpper ? 'primary' : 'replica',
      ),
      def.electricity,
    ));

    const gpsIndices = Array.from({ length: this.config.sensors.gpsCount }, (v, index) => index + 1);
    this.gpsReceiverSelector = new GpsReceiverSelector(
      this.bus,
      gpsIndices,
      Math.min(1, this.config.sensors.gpsCount)
    );

    this.gpsReceiverSelector.init();

    const adahrsSystems = this.config.sensors.adahrsDefinitions.slice(1, this.config.sensors.adahrsCount + 1).map((def, index) => {
      return new AdahrsSystem(
        (index + 1) as AdahrsSystemChannel,
        this.bus, def.leftAltimeterIndex,
        def.rightAltimeterIndex,
        def.airspeedIndicatorIndex,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.gpsReceiverSelector!.selectedIndex,
        Subject.create(false),
        def.electricity,
        def.admElectricity,
      );
    });

    const adahrsIndices = adahrsSystems.map((v) => v.index);
    this.adahrsSelector = new AdahrsSystemSelector(
      1,
      this.bus,
      adahrsIndices,
      this.displayUnitIndex === DisplayUnitIndices.PfdRight ? adahrsIndices.reverse() : adahrsIndices,
      'none',
      this.displayUnitIndex === DisplayUnitIndices.PfdRight || this.displayUnitIndex === DisplayUnitIndices.PfdLeft,
    );

    // Two FMS geo-positioning system for the MAU
    const fmsPosSystems = [
      new FmsPositionSystem(
        1,
        this.bus,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.gpsReceiverSelector!.selectedIndex,
        this.adahrsSelector.selectedIndex,
        'elec_circuit_avionics_on_1',
      ),
    ];

    const aoaSystems = this.config.sensors.stallWarningDefinitions.slice(1, this.config.sensors.stallWarningCount + 1).map((def, index) => {
      return new AoaSystem(index + 1, this.bus, def.electricity);
    });

    const aoaIndices = aoaSystems.map((v) => v.index);
    const aoaSystemSelector = new AoaSystemSelector(1, this.bus, aoaIndices, this.displayUnitIndex === DisplayUnitIndices.PfdRight ? aoaIndices.reverse() : aoaIndices);
    aoaSystemSelector.init();

    const landingGearSystem = new LandingGearSystem(1, this.bus, this.config.sensors.landingGearDefinitions[1].electricity);

    const flapWarningSystems = this.config.sensors.flapWarningDefinitions.slice(1, this.config.sensors.flapWarningCount + 1).map((def, index) => {
      return new FlapWarningSystem(index + 1, this.bus, def.minTakeoffPosition, def.maxTakeoffPosition, def.electricity);
    });

    const flapWarningIndices = flapWarningSystems.map((v) => v.index);
    this.flapWarningSelector = new FlapWarningSystemSelector(1, this.bus, flapWarningIndices);

    const graphicsModules = [
      new Epic2GraphicsModule(this.bus, 1, this.config.displayUnits.graphicsModuleDefinitions[1]),
      new Epic2GraphicsModule(this.bus, 2, this.config.displayUnits.graphicsModuleDefinitions[2])
    ];

    this.systems.push(
      ...magnetometerSystems,
      ...adahrsSystems,
      ...raSystems,
      ...gpsSystems,
      ...fmsPosSystems,
      ...aoaSystems,
      landingGearSystem,
      ...flapWarningSystems,
      ...adfSystems,
      ...xpdrSystems,
      ...graphicsModules
    );

    this.bus.getSubscriber<Epic2GraphicsModuleEvents>().on('epic2_agm_state_1').handle((event) => {
      this.agm1State.set(event.current ?? AvionicsSystemState.On);
    });
    this.bus.getSubscriber<Epic2GraphicsModuleEvents>().on('epic2_agm_state_2').handle((event) => {
      this.agm2State.set(event.current ?? AvionicsSystemState.On);
    });

    this.adahrsSelector.selectedIndex.pipe(this.selectedAdahrsIndex);
    aoaSystemSelector.selectedIndex.pipe(this.selectedAoaIndex);
    this.flapWarningSelector.selectedIndex.pipe(this.selectedFlapWarningIndex);
    //FIXME:
    this.selectedFmsPosIndex.set(1);
  }

  /**
   * Gets the duration, in milliseconds, required for this instrument to boot on power up.
   * @returns The duration, in milliseconds, required for this instrument to boot on power up.
   */
  protected getBootDuration(): number {
    return 1500 + Math.random() * 2000;
  }

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

  /** Init instrument. */
  protected doInit(): void {
    this.backplane.init();
    this.gpsReceiverSelector?.init();
    this.adahrsSelector?.init();
    this.flapWarningSelector?.init();
    this.nearestContext.init();

    // add a click handler to set this DU as selected whenever the user clicks on it
    const mainElement = document.getElementById('Mainframe');
    if (mainElement) {
      mainElement.onclick = () => this.setSelectedDu();
    } else {
      console.error('No element found with ID "Mainframe". DU selection on click will not work!');
    }
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

    this.cockpitUserSettings.getSetting('decisionAltitudeFeet').set(0);
    this.cockpitUserSettings.getSetting('decisionHeightFeet').set(0);

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
        this.onPoweredStart();
      } else {
        // The instrument transitioned from an unpowered to a powered state, so perform bootup.
        this.onBootStart();
      }
    } else {
      this.onBootStart();
    }
  }

  /**
   * Responds to when the instrument begins to boot
   */
  protected onBootStart(): void {
    this.bootTimer.schedule(this.onBootFinished.bind(this), this.getBootDuration());
    this.isDuBooted.set(false);
  }

  /**
   * Responds to when this instrument is finished booting.
   */
  protected onBootFinished(): void {
    this.bootTimer.clear();
    this.isDuBooted.set(true);
  }

  /** @inheritdoc */
  protected onPoweredStart(): void {
    this.bootTimer.clear();
    this.isDuBooted.set(true);
  }

  /**
   * Sets the selected display unit index (for TSC/MF controller input).
   * @param hostDuIndex The DU index to set; defaults to this display's host DU.
   */
  protected setSelectedDu(hostDuIndex?: DisplayUnitIndices): void {
    SimVar.SetSimVarValue(Epic2DuControlLocalVars.SelectedDisplayUnit, SimVarValueType.Enum, hostDuIndex ? hostDuIndex : this.hostDisplayUnitIndex.get());
  }
}
