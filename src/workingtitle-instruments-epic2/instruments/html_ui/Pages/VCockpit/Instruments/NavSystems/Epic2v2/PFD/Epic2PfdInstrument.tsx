/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Instruments/Shared/BaseInstrument" />
/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Core/VCockpit" />
/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/js/netbingmap" />
/// <reference types="@microsoft/msfs-types/js/common" />
/// <reference types="@microsoft/msfs-types/js/avionics" />

import {
  AvionicsSystemState, DefaultTcasAdvisoryDataProvider, FSComponent, MappedSubject, MinimumsManager, PluginSystem, SoundServer, Subject
} from '@microsoft/msfs-sdk';

import {
  AdfRadioSource, AltitudeLossAfterTakeoffModule, AvionicsConfig, DefaultAirGroundDataProvider, DefaultAirspeedDataProvider, DefaultAltitudeDataProvider,
  DefaultAttitudeDataProvider, DefaultAutopilotDataProvider, DefaultAutothrottleDataProvider, DefaultFlapWarningDataProvider, DefaultHeadingDataProvider,
  DefaultInertialDataProvider, DefaultLandingGearDataProvider, DefaultNavigationSourceDataProvider, DefaultRadioAltimeterDataProvider,
  DefaultStallWarningDataProvider, DefaultTawsDataProvider, DefaultTcasRaCommandDataProvider, DefaultVerticalDeviationDataProvider, DefaultVSpeedDataProvider,
  DisplayUnitDefinition, DisplayUnitIndices, Epic2Adsb, Epic2BearingPointerNavIndicator, Epic2CourseNeedleNavIndicator, Epic2CourseNeedleNavSourceNames,
  Epic2FsInstrument, Epic2GhostNeedleNavIndicator, Epic2GhostNeedleNavSourceNames, Epic2NavIndicator, Epic2NavIndicatorName, Epic2NavIndicators,
  Epic2NavSourceNames, Epic2TcasII, Epic2TransponderManager, Epic2VSpeedController, ExcessiveDescentRateModule, ExcessiveGlideslopeDeviationModule,
  ExcessiveTerrainClosureModule, GpsSource, Gpws, GpwsAlertController, InstrumentBackplaneNames, MapDataProvider, MapWaypointsDisplay, NavIndicators,
  NavRadioNavSource, NavSources, TouchdownCalloutModule, UnsafeTerrainClearanceModule
} from '@microsoft/msfs-epic2-shared';

import { HorizonSectionContainer } from './Components/HorizonSectionContainer';
import { MinimumsAlertController } from './Components/MinimumsAlert/MinimumsAlertController';
import { RadioSectionContainer } from './Components/RadioSectionContainer';
import { MinimumsStateController } from './Components/SelectedMinimums/MinimumsStateController';
import { Epic2PfdAvionicsPlugin, Epic2PfdPluginBinder } from './Epic2PfdAvionicsPlugin';
import { Epic2PfdControllerPublisher } from './Epic2PfdControllerPublisher';
import { PfdBaroEventManager } from './Misc/PfdBaroEventManager';
import { PfdHsiRangeController } from './Misc/PfdHsiRangeController';
import { PfdControllerSystem } from './Systems/PfdControllerSystem';

/** The PFD instrument. */
export class Epic2PfdInstrument extends Epic2FsInstrument {
  private readonly soundServer?: SoundServer;
  private readonly gpws?: Gpws;
  private readonly gpwsAlertController?: GpwsAlertController;
  private readonly tcas: Epic2TcasII;
  private readonly tcasAdvisoryDataProvider: DefaultTcasAdvisoryDataProvider;
  private readonly tcasRaCommandDataProvider: DefaultTcasRaCommandDataProvider;
  private readonly pluginSystem = new PluginSystem<Epic2PfdAvionicsPlugin, Epic2PfdPluginBinder>();

  private readonly pfdController = new Epic2PfdControllerPublisher(this.bus, this.displayUnitIndex);
  private readonly baroEventManager = new PfdBaroEventManager(this.bus, this.config.sensors.adahrsDefinitions.reduce((managedAltimeters, def) => {
    if (def.leftAltimeterIndex !== undefined && this.displayUnitIndex === DisplayUnitIndices.PfdLeft) {
      managedAltimeters.push(def.leftAltimeterIndex);
    } else if (def.rightAltimeterIndex !== undefined && this.displayUnitIndex === DisplayUnitIndices.PfdRight) {
      managedAltimeters.push(def.rightAltimeterIndex);
    }
    return managedAltimeters;
  }, [] as number[]));

  // DU 1 is left PFD, DU 4 is right PFD
  protected readonly pfdSettings = this.pfdUserSettingsManager.getAliasedManager(this.displayUnitIndex);
  private readonly pfdHsiRangeController = new PfdHsiRangeController(this.bus, this.pfdSettings);

  protected readonly airspeedDataProvider = new DefaultAirspeedDataProvider(
    this.bus, this.selectedAdahrsIndex, this.displayUnitIndex
  );
  protected readonly altitudeDataProvider = new DefaultAltitudeDataProvider(
    this.bus, this.selectedAdahrsIndex, this.displayUnitIndex
  );
  protected readonly attitudeDataProvider = new DefaultAttitudeDataProvider(
    this.bus, this.selectedAdahrsIndex
  );
  protected readonly tawsDataProvider = new DefaultTawsDataProvider(this.bus);
  protected readonly autopilotDataProvider = new DefaultAutopilotDataProvider(this.bus, this.displayUnitIndex, this.config.autopilot);
  protected readonly autothrottleDataProvider = new DefaultAutothrottleDataProvider(this.bus, this.config.autothrottle, this.airspeedDataProvider);
  protected readonly headingDataProvider = new DefaultHeadingDataProvider(
    this.bus, this.selectedFmsPosIndex, this.selectedAdahrsIndex, this.displayUnitIndex
  );
  protected readonly flapWarningDataProvider = new DefaultFlapWarningDataProvider(this.bus, this.selectedFlapWarningIndex);
  protected readonly inertialDataProvider = new DefaultInertialDataProvider(
    this.bus, this.selectedAdahrsIndex, this.selectedFmsPosIndex, this.displayUnitIndex
  );
  protected readonly landingGearDataProvider = new DefaultLandingGearDataProvider(this.bus, 1);
  protected readonly radioAltimeterDataProvider = new DefaultRadioAltimeterDataProvider(
    this.bus, this.config.displayUnits.displayUnitDefinitions[this.displayUnitIndex].radioAltimeterIndex
  );
  protected readonly stallWarningDataProvider = new DefaultStallWarningDataProvider(
    this.bus, this.selectedAoaIndex, this.selectedAdahrsIndex,
  );

  protected readonly airGroundDataProvider = new DefaultAirGroundDataProvider(
    this.bus,
    this.airspeedDataProvider,
    this.landingGearDataProvider,
    this.radioAltimeterDataProvider,
  );

  private readonly vSpeedController = new Epic2VSpeedController(this.bus, this.config.airframe);
  protected readonly vSpeedDataProvider = new DefaultVSpeedDataProvider(
    this.bus,
    this.airspeedDataProvider,
    this.airGroundDataProvider,
    this.vSpeedController
  );

  private readonly navSources = new NavSources<Epic2NavSourceNames>(
    new AdfRadioSource<Epic2NavSourceNames>(this.bus, 'ADF', 1),
    new NavRadioNavSource<Epic2NavSourceNames>(this.bus, 'NAV1', 1),
    new NavRadioNavSource<Epic2NavSourceNames>(this.bus, 'NAV2', 2),
    new GpsSource<Epic2NavSourceNames>(this.bus, 'FMS', 1, this.flightPlanner),
  );

  private courseNeedleSources: Epic2CourseNeedleNavSourceNames[number][] = this.displayUnitIndex === DisplayUnitIndices.PfdRight
    ? ['FMS', 'NAV2', 'NAV1']
    : ['FMS', 'NAV1', 'NAV2'];

  private ghostNeedleSources: Epic2GhostNeedleNavSourceNames[number][] = this.displayUnitIndex === DisplayUnitIndices.PfdRight
    ? ['NAV2', 'NAV1']
    : ['NAV1', 'NAV2'];

  private readonly navIndicators = new NavIndicators(new Map<Epic2NavIndicatorName, Epic2NavIndicator>([
    ['bearingPointer1', new Epic2BearingPointerNavIndicator(this.navSources, this.bus, 1, ['FMS', 'NAV1', 'ADF'])],
    ['bearingPointer2', new Epic2BearingPointerNavIndicator(this.navSources, this.bus, 2, ['FMS', 'NAV2', 'ADF'])],
    ['courseNeedle', new Epic2CourseNeedleNavIndicator(this.navSources, this.displayUnitIndex, this.bus, this.courseNeedleSources)],
    ['ghostNeedle', new Epic2GhostNeedleNavIndicator(this.navSources, this.bus, this.ghostNeedleSources, this.displayUnitIndex)],
  ])) as Epic2NavIndicators;

  protected readonly navigationSourceDataProvider = new DefaultNavigationSourceDataProvider(this.bus, this.navIndicators, this.autopilotDataProvider);

  protected readonly pfdMapDataProvider = new MapDataProvider(
    this.bus,
    this.headingDataProvider,
    this.inertialDataProvider,
    Subject.create('Hsi'),
    this.pfdSettings.getSetting('hsiRange'),
    Subject.create(MapWaypointsDisplay.None),
    this.navIndicators,
  );

  protected readonly verticalDeviationDataProvider = new DefaultVerticalDeviationDataProvider(
    this.bus,
    this.displayUnitIndex,
    this.navIndicators,
    this.autopilotDataProvider
  );

  private readonly transponder = new Epic2TransponderManager(this.bus, this.navComUserSettingsManager);

  private readonly agmSubject = MappedSubject.create(
    ([agm1State, agm2State]) => agm1State === AvionicsSystemState.On || agm2State === AvionicsSystemState.On,
    this.agm1State, this.agm2State
  );

  private readonly ahiSide: Exclude<DisplayUnitDefinition['ahiSide'], undefined>;

  /** @inheritdoc */
  constructor(
    public readonly instrument: BaseInstrument,
    protected readonly config: AvionicsConfig,
  ) {
    super(instrument, config);

    if (this.instrument.isPrimary) {
      this.soundServer = new SoundServer(this.bus);
    }

    new MinimumsManager(this.bus);
    if (this.displayUnitIndex === DisplayUnitIndices.PfdLeft) {
      new MinimumsAlertController(this.bus, this.airGroundDataProvider, this.altitudeDataProvider, this.radioAltimeterDataProvider);
      new MinimumsStateController(this.bus);

      this.gpws = new Gpws(this.bus, 1, this.facLoader, this.autopilotDataProvider);
      this.gpwsAlertController = new GpwsAlertController(this.bus);
      this.gpws.addModule(new TouchdownCalloutModule(this.bus, this.gpwsAlertController, [500, 100, 50, 40, 30, 20, 10], this.altitudeDataProvider));
      this.gpws.addModule(new ExcessiveDescentRateModule(this.bus, this.gpwsAlertController));
      this.gpws.addModule(new ExcessiveTerrainClosureModule(this.bus, this.gpwsAlertController, this.airspeedDataProvider, this.verticalDeviationDataProvider));
      this.gpws.addModule(new AltitudeLossAfterTakeoffModule(this.bus, this.gpwsAlertController));
      this.gpws.addModule(new UnsafeTerrainClearanceModule(this.bus, this.gpwsAlertController, this.airspeedDataProvider));
      this.gpws.addModule(new ExcessiveGlideslopeDeviationModule(this.bus, this.gpwsAlertController, this.verticalDeviationDataProvider, this.autopilotDataProvider));

    }

    this.tcas = new Epic2TcasII(this.bus, this.trafficInstrument, new Epic2Adsb(this.bus), this.config.sensors.acasDefinition);
    this.tcasAdvisoryDataProvider = new DefaultTcasAdvisoryDataProvider(this.bus, this.tcas);
    this.tcasRaCommandDataProvider = new DefaultTcasRaCommandDataProvider(this.bus, this.tcas);

    const duConfig = this.config.displayUnits.displayUnitDefinitions[this.displayUnitIndex];
    this.ahiSide = duConfig.ahiSide ?? (this.displayUnitIndex === DisplayUnitIndices.PfdRight ? 'right' : 'left');
    this.instrument.classList.add(this.ahiSide);

    this.backplane.addInstrument(InstrumentBackplaneNames.AirGroundDataProvider, this.airGroundDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.AirspeedDataProvider, this.airspeedDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.AltitudeDataProvider, this.altitudeDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.AttitudeDataProvider, this.attitudeDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.AutopilotDataProvider, this.autopilotDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.AutothrottleDataProvider, this.autothrottleDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.FlapWarningDataProvider, this.flapWarningDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.HeadingDataProvider, this.headingDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.InertialDataProvider, this.inertialDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.LandingGearDataProvider, this.landingGearDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.RadioAltimeterDataProvider, this.radioAltimeterDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.StallWarningDataProvider, this.stallWarningDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.VSpeedDataProvider, this.vSpeedDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.VerticalDeviationDataProvider, this.verticalDeviationDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.TawsDataProvider, this.tawsDataProvider);

    this.backplane.addInstrument(InstrumentBackplaneNames.NavSources, this.navSources);
    this.backplane.addInstrument(InstrumentBackplaneNames.NavIndicators, this.navIndicators);
    this.backplane.addInstrument(InstrumentBackplaneNames.NavigationSourceDataProvider, this.navigationSourceDataProvider);

    this.agmSubject.pipe(this.isAgmOn);

    this.doInit();
  }

  /** Init instrument. */
  protected doInit(): void {
    this.tcas.init();
    this.tcasAdvisoryDataProvider.init();
    this.tcasRaCommandDataProvider.init();
    this.gpws?.init();
    this.transponder.init();
    // init plugins before super init so they have a chance to hook up to the backplane etc.
    this.initPluginSystem().then(() => {
      super.doInit();

      this.baroEventManager.init();

      this.renderComponents();
    });
  }

  /** @inheritdoc */
  protected override createSystems(): void {
    super.createSystems();

    if (this.displayUnitIndex === DisplayUnitIndices.PfdLeft) {
      this.systems.push(new PfdControllerSystem(1, this.bus, this.config.displayUnits.displayUnitDefinitions[1].pfdControllerElectricity));
    } else {
      this.systems.push(new PfdControllerSystem(2, this.bus, this.config.displayUnits.displayUnitDefinitions[4].pfdControllerElectricity));
    }
  }

  /**
   * Initializes the plugin system.
   * @returns A promise that resolves when the plugin system is ready.
   */
  private async initPluginSystem(): Promise<void> {
    await this.pluginSystem.addScripts(
      this.instrument.xmlConfig,
      `${this.instrument.templateID}_${this.instrument.instrumentIndex}`,
      target => target === this.instrument.templateID
    );
    const pluginBinder: Epic2PfdPluginBinder = {
      bus: this.bus,
      backplane: this.backplane,
      config: this.config,
    };

    return this.pluginSystem.startSystem(pluginBinder);
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

  /** @inheritdoc */
  protected renderComponents(): void {
    FSComponent.render(<HorizonSectionContainer
      bus={this.bus}
      airGroundDataProvider={this.airGroundDataProvider}
      airspeedDataProvider={this.airspeedDataProvider}
      altitudeDataProvider={this.altitudeDataProvider}
      attitudeDataProvider={this.attitudeDataProvider}
      autopilotDataProvider={this.autopilotDataProvider}
      autothrottleDataProvider={this.autothrottleDataProvider}
      flapWarningDataProvider={this.flapWarningDataProvider}
      headingDataProvider={this.headingDataProvider}
      inertialDataProvider={this.inertialDataProvider}
      radioAltimeterDataProvider={this.radioAltimeterDataProvider}
      stallWarningDataProvider={this.stallWarningDataProvider}
      vSpeedDataProvider={this.vSpeedDataProvider}
      tcasAdvisoryDataProvider={this.tcasAdvisoryDataProvider}
      tcasRaCommandDataProvider={this.tcasRaCommandDataProvider}
      pfdIndex={this.displayUnitIndex}
      pfdSettingsManager={this.pfdSettings}
      pfdPanelConfig={this.config.displayUnits.pfdConfig}
      instrumentIndex={this.displayUnitIndex}
      mapDataProvider={this.pfdMapDataProvider}
      facLoader={this.facLoader}
      flightPlanner={this.flightPlanner}
      navComSettingsManager={this.navComUserSettingsManager}
      navigationSourceDataProvider={this.navigationSourceDataProvider}
      verticalDeviationDataProvider={this.verticalDeviationDataProvider}
      tawsDataProvider={this.tawsDataProvider}
      tcas={this.tcas}
      airframeConfig={this.config.airframe}
      ahiSide={this.ahiSide}
    />, document.getElementById('HorizonSection'));
    FSComponent.render(<RadioSectionContainer
      bus={this.bus}
      duIndex={this.displayUnitIndex}
      duSide={this.ahiSide === 'right' ? 'left' : 'right'}
      navComSettingsManager={this.navComUserSettingsManager}
    />, document.getElementById('RadioSection'));

    this.pluginSystem.callPlugins(p => {
      const node = p.renderEIS?.();
      if (node) {
        FSComponent.render(node, document.getElementById('EngineSection'));
      }
    });
  }

  /** @inheritdoc */
  public override onInteractionEvent(args: string[]): void {
    if (!this.pfdController.tryHandleHEvent(args[0])) {
      if (!this.softKeyController.mapHEventToSoftKeyEvent(args[0])) {
        this.hEventPublisher.dispatchHEvent(args[0]);
      }
    }
  }
}
