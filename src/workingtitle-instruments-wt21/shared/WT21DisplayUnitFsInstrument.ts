/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Instruments/Shared/BaseInstrument" />
/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Core/VCockpit" />
/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/js/avionics" />
/// <reference types="@microsoft/msfs-types/js/common" />

import {
  AdcPublisher, AhrsPublisher, AutopilotInstrument, BaseInstrumentPublisher, BasicAvionicsSystem, Clock, ElectricalPublisher, EventBus, FacilityLoader,
  FacilityRepository, FlightPathAirplaneSpeedMode, FlightPathAirplaneWindMode, FlightPathCalculator, FlightPlanner, FsInstrument, GNSSPublisher,
  HEventPublisher, InstrumentBackplane, MinimumsSimVarPublisher, NavComSimVarPublisher, TrafficInstrument, VNavSimVarPublisher, Wait,
  XPDRSimVarPublisher
} from '@microsoft/msfs-sdk';

import { AvionicsConfig } from './Config/AvionicsConfig';
import { InstrumentConfig } from './Config/InstrumentConfig';
import { FmcSimVarPublisher } from './FmcSimVars';
import {
  AdfRadioSource, GpsSource, initNavIndicatorContext, NavIndicators, NavRadioNavSource, NavSources, WT21BearingPointerNavIndicator,
  WT21CourseNeedleNavIndicator, WT21GhostNeedleNavIndicator, WT21NavIndicator, WT21NavIndicatorName, WT21NavIndicators, WT21NavSourceNames
} from './Navigation';
import { PerformancePlanRepository } from './Performance';
import {
  AdcSystem, AdcSystemSelector, AhrsSystem, AhrsSystemSelector, AOASystem, RadioAltimeterSystem, TransponderSystem, WT21FixInfoConfig, WT21FixInfoManager,
  WT21FmsUtils
} from './Systems';
import { WT21TCAS } from './Traffic';
import { WT21ControlPublisher } from './WT21ControlEvents';
import { WT21ControlSimVarPublisher } from './WT21ControlVarEvents';

import './WT21_Common.css';

/**
 * Base WT21 FsInstrument
 */
export abstract class WT21DisplayUnitFsInstrument implements FsInstrument {
  protected readonly bus = new EventBus();
  protected readonly backplane = new InstrumentBackplane();

  protected readonly facRepo = FacilityRepository.getRepository(this.bus);
  protected readonly facLoader = new FacilityLoader(this.facRepo);
  protected readonly calculator = new FlightPathCalculator(this.facLoader, {
    defaultClimbRate: 2000,
    defaultSpeed: 220,
    bankAngle: 25,
    holdBankAngle: null,
    courseReversalBankAngle: null,
    turnAnticipationBankAngle: null,
    maxBankAngle: 25,
    airplaneSpeedMode: FlightPathAirplaneSpeedMode.TrueAirspeedPlusWind,
    airplaneWindMode: FlightPathAirplaneWindMode.Automatic,
  }, this.bus);

  protected readonly planner = FlightPlanner.getPlanner(this.bus, this.calculator, WT21FmsUtils.buildWT21LegName);
  protected readonly perfPlanRepository = new PerformancePlanRepository(this.planner, this.bus);
  protected readonly fixInfoManager = new WT21FixInfoManager(this.bus, this.facLoader, WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX, this.planner, WT21FixInfoConfig); // FIXME Add route predictor when FlightPlanPredictor refactored to implement FlightPlanPredictionsProvider

  protected readonly trafficInstrument = new TrafficInstrument(this.bus, { realTimeUpdateFreq: 2, simTimeUpdateFreq: 1, contactDeprecateTime: 10 });
  protected readonly clock = new Clock(this.bus);
  protected readonly tcas = new WT21TCAS(this.bus, this.trafficInstrument);

  protected readonly baseInstrumentPublisher = new BaseInstrumentPublisher(this.instrument, this.bus);
  protected readonly hEventPublisher = new HEventPublisher(this.bus);
  protected readonly adcPublisher = new AdcPublisher(this.bus);
  protected readonly ahrsPublisher = new AhrsPublisher(this.bus);
  protected readonly electricalPublisher = new ElectricalPublisher(this.bus);
  protected readonly gnssPublisher = new GNSSPublisher(this.bus);
  protected readonly fmcSimVarPublisher = new FmcSimVarPublisher(this.bus);
  protected readonly minimumsPublisher = new MinimumsSimVarPublisher(this.bus);
  protected readonly xpdrSimVarPublisher = new XPDRSimVarPublisher(this.bus);
  protected readonly wt21ControlPublisher = new WT21ControlPublisher(this.bus);
  protected readonly wt21ControlVarPublisher = new WT21ControlSimVarPublisher(this.bus);

  protected readonly navSources = new NavSources<WT21NavSourceNames>(
    new NavRadioNavSource<WT21NavSourceNames>(this.bus, 'NAV1', 1),
    new NavRadioNavSource<WT21NavSourceNames>(this.bus, 'NAV2', 2),
    new AdfRadioSource<WT21NavSourceNames>(this.bus, 'ADF', 1),
    new GpsSource<WT21NavSourceNames>(this.bus, 'FMS1', 1, this.planner),
    new GpsSource<WT21NavSourceNames>(this.bus, 'FMS2', 2, this.planner),
  );
  protected readonly courseNeedleIndicator = new WT21CourseNeedleNavIndicator(this.navSources, this.instrumentConfig, this.bus);
  protected readonly navIndicators: WT21NavIndicators = new NavIndicators(new Map<WT21NavIndicatorName, WT21NavIndicator>([
    ['courseNeedle', this.courseNeedleIndicator],
    ['ghostNeedle', new WT21GhostNeedleNavIndicator(this.navSources, this.bus)],
    ['bearingPointer1', new WT21BearingPointerNavIndicator(this.navSources, this.bus, 1, 'NAV1')],
    ['bearingPointer2', new WT21BearingPointerNavIndicator(this.navSources, this.bus, 2, 'NAV2')],
  ]));
  protected readonly navComSimVarPublisher = new NavComSimVarPublisher(this.bus);
  protected readonly vnavSimVarPublisher = new VNavSimVarPublisher(this.bus);

  protected readonly apInstrument = new AutopilotInstrument(this.bus);

  protected readonly avionicsSystems: BasicAvionicsSystem<any>[] = [];
  protected readonly ahrsSystemSelector = new AhrsSystemSelector(this.bus, this.instrumentConfig.instrumentIndex, this.config.sensors.ahrsDefinitions);
  protected readonly adcSystemSelector = new AdcSystemSelector(this.bus, this.instrumentConfig.instrumentIndex, this.config.sensors.adcDefinitions);

  /** @inheritDoc */
  protected constructor(
    public readonly instrument: BaseInstrument,
    protected readonly config: AvionicsConfig,
    protected readonly instrumentConfig: InstrumentConfig
  ) {
    this.backplane.addPublisher('base', this.baseInstrumentPublisher);
    this.backplane.addPublisher('adc', this.adcPublisher);
    this.backplane.addPublisher('ahrs', this.ahrsPublisher);
    this.backplane.addPublisher('hEvents', this.hEventPublisher);
    this.backplane.addPublisher('gnss', this.gnssPublisher);
    this.backplane.addPublisher('vnav', this.vnavSimVarPublisher);
    this.backplane.addPublisher('xpdr', this.xpdrSimVarPublisher);
    this.backplane.addPublisher('electrical', this.electricalPublisher);
    this.backplane.addPublisher('wt21control', this.wt21ControlPublisher);
    this.backplane.addPublisher('wt21controlvar', this.wt21ControlVarPublisher);
    this.backplane.addPublisher('navCom', this.navComSimVarPublisher);
    this.backplane.addPublisher('fmc', this.fmcSimVarPublisher);
    this.backplane.addPublisher('minimums', this.minimumsPublisher);

    this.backplane.addInstrument('navSources', this.navSources);
    this.backplane.addInstrument('navIndicators', this.navIndicators);
    this.backplane.addInstrument('traffic', this.trafficInstrument);
    this.backplane.addInstrument('ap', this.apInstrument);

    // force enable animations
    document.documentElement.classList.add('animationsEnabled');

    this.initPrimaryFlightPlan();

    initNavIndicatorContext(this.navIndicators);

    this.clock.init();
    this.tcas.init();

    this.initializeSystems();
  }

  /**
   * Initialises the instrument
   */
  protected doInit(): void {
    this.backplane.init();
  }

  /**
   * Initializes various avionics' systems.
   */
  private initializeSystems(): void {
    this.config.sensors.ahrsDefinitions.map((ahrs, index) => {
      this.avionicsSystems.push(new AhrsSystem(index, this.bus, ahrs));
    });

    this.config.sensors.adcDefinitions.map((adc, index) => {
      this.avionicsSystems.push(new AdcSystem(index, this.bus, adc));
    });

    this.avionicsSystems.push(new AOASystem(1, this.bus, this.config.sensors.aoaDefinition));
    this.avionicsSystems.push(new RadioAltimeterSystem(1, this.bus, this.config.sensors.raDefinition));
    this.avionicsSystems.push(new TransponderSystem(1, this.bus, this.config.sensors.xpdrDefinition));
  }

  /**
   * Updates this instrument's systems.
   */
  private updateSystems(): void {
    for (let i = 0; i < this.avionicsSystems.length; i++) {
      this.avionicsSystems[i].onUpdate();
    }
  }

  /**
   * Initializes the primary flight plan.
   */
  private async initPrimaryFlightPlan(): Promise<void> {
    // Request a sync from the FMC in case of an instrument reload
    await Wait.awaitDelay(2500);
    this.planner.requestSync();
    // // Initialize the primary plan in case one was not synced.
    // if (this.planner.hasFlightPlan(0)) {
    //   return;
    // }

    // this.planner.createFlightPlan(0);
    // this.planner.createFlightPlan(1);
  }

  /** @inheritDoc */
  public Update(): void {
    this.backplane.onUpdate();
    this.clock.onUpdate();
    this.updateSystems();
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onInteractionEvent(_args: Array<string>): void {
    // noop
  }

  /** @inheritDoc */
  public onFlightStart(): void {
    // noop
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onGameStateChanged(oldState: GameState, newState: GameState): void {
    // noop
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onSoundEnd(soundEventId: Name_Z): void {
    // noop
  }
}
