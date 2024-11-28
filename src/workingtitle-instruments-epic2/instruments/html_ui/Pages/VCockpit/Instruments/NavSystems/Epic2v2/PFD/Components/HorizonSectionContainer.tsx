import {
  ArraySubject, ComponentProps, DisplayComponent, EventBus, FacilityLoader, FlightPlanner, FSComponent, GameStateProvider, Subject, TcasAdvisoryDataProvider,
  UserSettingManager, Value, Vec2Math, VecNMath, VNode, Wait
} from '@microsoft/msfs-sdk';

import {
  AirframeConfig, AirGroundDataProvider, AirspeedDataProvider, AltitudeDataProvider, AttitudeDataProvider, AutopilotDataProvider, AutothrottleDataProvider,
  DefaultVerticalDeviationDataProvider, DisplayUnitIndices, Epic2PfdControlPfdEvents, Epic2TcasII, FlapWarningDataProvider, HeadingDataProvider,
  InertialDataProvider, MapDataProvider, NavComUserSettingManager, NavigationSourceDataProvider, PfdAliasedUserSettingTypes, PfdConfiguration,
  RadioAltimeterDataProvider, StallWarningDataProvider, TawsDataProvider, TcasRaCommandDataProvider, VSpeedDataProvider
} from '@microsoft/msfs-epic2-shared';

import { SpeedTapeContainer } from './Airspeed/SpeedTapeContainer';
import { AltitudeTapeContainer } from './Altitude/AltitudeTapeContainer';
import { VnavTargetAltitudeReadout } from './Altitude/VnavTargetAltitudeReadout';
import { AutothrottleStatus } from './Autothrottle/AutothrottleStatus';
import { ThrustDirector } from './Autothrottle/ThrustDirector';
import { BaroSelection } from './BaroSelection/BaroSelection';
import { ApproachStatus } from './Fma/ApproachStatus';
import { Fma } from './Fma/Fma';
import { SteepApproachStatus } from './Fma/SteepApproachStatus';
import { ArtificialHorizonOptions } from './Horizon/ArtificialHorizon';
import { AircraftSymbolOptions, HorizonDisplay, HorizonPitchLadderOptions, TcasRaPitchCueLayerOptions } from './Horizon/HorizonDisplay';
import { HorizonLineOptions } from './Horizon/HorizonLine';
import { RollIndicatorOptions } from './Horizon/RollIndicator';
import { BearingPointerSourcesDisplay } from './HSI/BearingPointer';
import { HSIContainer } from './HSI/HSIContainer';
import { NavPreview } from './HSI/NavPreview';
import { SelectedNavSourceInfo } from './HSI/SelectedNavSourceInfo';
import { MachDigitalReadout } from './MachDigitalReadout/MachDigitalReadout';
import { MarkerBeacon } from './MarkerBeacon/MarkerBeacon';
import { MinimumsAlert } from './MinimumsAlert/MinimumsAlert';
import { PfdAlerts } from './PfdAlerts/PfdAlerts';
import { PfdControllerState } from './PfdControllerState/PfdControllerState';
import { PfdInfo } from './PfdInfo/PfdInfo';
import { SelectedAltitude } from './SelectedAltitude/SelectedAltitude';
import { SelectedHeading } from './SelectedHeading';
import { SelectedMinimums } from './SelectedMinimums/SelectedMinimums';
import { SelectedSpeed } from './SelectedSpeed/SelectedSpeed';
import { SelectedVerticalSpeed } from './SelectedVerticalSpeed/SelectedVerticalSpeed';
import { TimeInfo } from './TimeInfo/TimeInfo';
import { VerticalDeviation } from './VerticalDeviation/VerticalDeviation';
import { VerticalDeviationSource } from './VerticalDeviation/VerticalDeviationSource';
import { VerticalSpeedContainer } from './VerticalSpeed/VerticalSpeedContainer';
import { VerticalTrackAlert } from './VerticalTrackAlert/VerticalTrackAlert';

/** The PFD horizon section props. */
interface HorizonSectionContainerProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
  /** Index of this PFD */
  readonly pfdIndex: DisplayUnitIndices,
  /** A manager for PFD settings. */
  readonly pfdSettingsManager: UserSettingManager<PfdAliasedUserSettingTypes>;
  /** The definition for the PFD panel.xml config */
  readonly pfdPanelConfig: PfdConfiguration;
  /** The air/ground system data provider to use. */
  readonly airGroundDataProvider: AirGroundDataProvider;
  /** The airspeed data provider to use. */
  readonly airspeedDataProvider: AirspeedDataProvider;
  /** The altitude data provider to use. */
  readonly altitudeDataProvider: AltitudeDataProvider;
  /** The attitude data provider to use. */
  readonly attitudeDataProvider: AttitudeDataProvider;
  /** An autopilot data provider. */
  readonly autopilotDataProvider: AutopilotDataProvider,
  /** An autothrottle data provider. */
  readonly autothrottleDataProvider: AutothrottleDataProvider,
  /** The flap warning data provider to use. */
  readonly flapWarningDataProvider: FlapWarningDataProvider;
  /** The heading data provider to tuse. */
  readonly headingDataProvider: HeadingDataProvider;
  /** The intertial data provider to use. */
  readonly inertialDataProvider: InertialDataProvider;
  /** The radio altimeter data provider to use. */
  readonly radioAltimeterDataProvider: RadioAltimeterDataProvider;
  /** The stall warning data provider to use. */
  readonly stallWarningDataProvider: StallWarningDataProvider;
  /** The vspeed data provider to use. */
  readonly vSpeedDataProvider: VSpeedDataProvider;
  /** The map data provider. */
  readonly mapDataProvider: MapDataProvider;
  /** The nav com settings manager. */
  readonly navComSettingsManager: NavComUserSettingManager;
  /** The navigation source data provider. */
  readonly navigationSourceDataProvider: NavigationSourceDataProvider;
  /** A TCAS advisory data provider */
  readonly tcasAdvisoryDataProvider: TcasAdvisoryDataProvider
  /** A TCAS RA Command data provider */
  readonly tcasRaCommandDataProvider: TcasRaCommandDataProvider;
  /** The instrument index. */
  readonly instrumentIndex: number;
  /** An instance of the flight planner. */
  readonly flightPlanner: FlightPlanner;
  /** An instance of the facility loader. */
  readonly facLoader: FacilityLoader;
  /** An Vertical Deviation Data Provider. */
  readonly verticalDeviationDataProvider: DefaultVerticalDeviationDataProvider;
  /** A TAWS data provder */
  readonly tawsDataProvider: TawsDataProvider
  /** An instance of TCAS. */
  readonly tcas: Epic2TcasII;
  /** The airframe config */
  readonly airframeConfig: AirframeConfig;
}

// TODO: refactor the horizon config below into separate objects

/** The PFD horizon section container. */
export class HorizonSectionContainer extends DisplayComponent<HorizonSectionContainerProps> {
  private static readonly artificialHorizonOptions: ArtificialHorizonOptions = {
    groundColor: '#684531',
    skyColors: [[0, '#1C7EFF']],
  };

  private static readonly horizonLineOptions: HorizonLineOptions = {
    headingPointerMinSize: Vec2Math.create(12, 16),
    headingPointerMaxSize: Vec2Math.create(17, 22),
    strokeWidth: 4,
    outlineColor: 'rgba(0,0,0,0.5)',
    headingPointerWidth: 2,
    headingPointerOffsetY: 0,
  };

  private static readonly pitchLadderOptions: HorizonPitchLadderOptions = {
    clipBounds: VecNMath.create(4, -172, -160, 172, 174),
    options: {
      svtDisabledStyles: {
        majorLineIncrement: 5,
        descentReferenceLinePitch: -3,
        minorLineIncrement: 1,
        minorLineMaxPitch: 4,
        minorLineLength: 15,
        descentReferenceLineLength: 30,
        majorLineLength: 140,
        majorLineSpacing: 72,
        majorLineVerticalLength: 12,
        majorLineShowNumber: true,
        numberMargin: 10,
        numberOffsetY: -7,
        chevronBoundaries: [
          Vec2Math.create(30, 23),
          Vec2Math.create(45, 35),
          Vec2Math.create(65, 50),
          Vec2Math.create(86, 70),
          Vec2Math.create(-25, -20),
          Vec2Math.create(-33, -25),
          Vec2Math.create(-45, -35),
          Vec2Math.create(-65, -50),
          Vec2Math.create(-86, -70),
        ],
      },
      svtEnabledStyles: {
        majorLineIncrement: 5,
        descentReferenceLinePitch: -3,
        minorLineIncrement: 1,
        minorLineMaxPitch: 4,
        minorLineLength: 15,
        descentReferenceLineLength: 30,
        majorLineLength: 140,
        majorLineSpacing: 72,
        majorLineVerticalLength: 12,
        majorLineShowNumber: true,
        numberMargin: 10,
        numberOffsetY: -7,
        chevronBoundaries: [
          Vec2Math.create(30, 23),
          Vec2Math.create(45, 35),
          Vec2Math.create(65, 50),
          Vec2Math.create(86, 70),
          Vec2Math.create(-25, -20),
          Vec2Math.create(-33, -25),
          Vec2Math.create(-45, -35),
          Vec2Math.create(-65, -50),
          Vec2Math.create(-86, -70),
        ],
      },
    }
  };

  private static readonly aircraftSymbolOptions: AircraftSymbolOptions = {
    color: 'white',
  };

  private static readonly rollIndicatorOptions: RollIndicatorOptions = {
    radius: 185,
    lastTickRadius: 163,
    majorTickLength: 16,
    minorTickLength: 10,
    referencePointerSize: Vec2Math.create(22, 20),
    referencePointerOffset: 0,
    rollPointerSize: Vec2Math.create(18, 16),
    rollPointerOffset: 0,
    slipSkidIndicatorOffset: 0,
    slipSkidIndicatorHeight: 7,
    slipSkidIndicatorTranslateScale: 18,
    slipSkidFullScale: 0.074,
    slipSkidExtremeThreshold: 0.148,
    lowBankAngle: 17,
  };

  private static readonly tcasRaPitchCueOptions: TcasRaPitchCueLayerOptions = {
    clipBounds: VecNMath.create(4, -210, -130, 210, 180),
    conformalBounds: VecNMath.create(4, -150, -105, 150, 180)
  };

  /** @inheritdoc */
  constructor(props: HorizonSectionContainerProps) {
    super(props);

    this.props.bus.getSubscriber<Epic2PfdControlPfdEvents>().on('pfd_control_hsi_push').handle(() => {
      this.hsiArc.set(!this.hsiArc.get());
    });

    this.renderSpeedTape();
  }

  /** The HSI mode: Partial (Arc) or Full (Rose) */
  private readonly hsiArc = Value.create(true);

  private readonly horizonOcclusions = ArraySubject.create([
    {
      // HSI
      path: (context: CanvasRenderingContext2D): void => {
        context.closePath();

        if (this.hsiArc.get()) {
          context.beginPath();
          context.moveTo(0, 0);
          context.lineTo(0, 768);
          context.lineTo(110, 768);
          context.lineTo(110, 565);
          context.quadraticCurveTo(160, 432, 308, 420);
          context.lineTo(308, 0);
          context.moveTo(676, 0);
          context.lineTo(676, 768);
          context.lineTo(505, 768);
          context.lineTo(505, 565);
          context.quadraticCurveTo(456, 432, 308, 420);
          context.lineTo(308, 0);
        } else {
          context.beginPath();
          context.moveTo(0, 0);
          context.lineTo(0, 768);
          context.lineTo(175, 768);
          context.lineTo(175, 565);
          context.quadraticCurveTo(180, 432, 308, 420);
          context.lineTo(308, 0);
          context.moveTo(676, 0);
          context.lineTo(676, 768);
          context.lineTo(437, 768);
          context.lineTo(437, 565);
          context.quadraticCurveTo(432, 432, 308, 420);
          context.lineTo(308, 0);
        }
      }
    },
    {
      // speed tape
      path: (context: CanvasRenderingContext2D): void => {
        context.rect(8, 34, 83, 363);
      }
    },
    {
      // alt tape
      path: (context: CanvasRenderingContext2D): void => {
        context.rect(527, 34, 88, 363);
      }
    },
    {
      // VSI
      path: (context: CanvasRenderingContext2D): void => {
        context.rect(622, 0, 62, 432);
      }
    }
  ]);

  /**
   * Renders the speed tape once the game has initialized
   * We can't render the speed tape before the game is initialized as GameVars needed for flap bugs will be unavailable
   */
  private renderSpeedTape(): void {
    Wait.awaitSubscribable(GameStateProvider.get(), s => s === GameState.ingame, true).then(() => {
      FSComponent.render(<SpeedTapeContainer
        bus={this.props.bus}
        airGroundDataProvider={this.props.airGroundDataProvider}
        airspeedDataProvider={this.props.airspeedDataProvider}
        altitudeDataProvider={this.props.altitudeDataProvider}
        autopilotDataProvider={this.props.autopilotDataProvider}
        flapWarningDataProvider={this.props.flapWarningDataProvider}
        stallWarningDataProvider={this.props.stallWarningDataProvider}
        vSpeedDataProvider={this.props.vSpeedDataProvider}
        autothrottleDataProvider={this.props.autothrottleDataProvider}
        airframeConfig={this.props.airframeConfig}
        declutter={this.props.attitudeDataProvider.excessiveAttitude}
      />, document.getElementById('HorizonSection'));
    });
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return <>
      <HorizonDisplay
        bus={this.props.bus}
        airspeedDataProvider={this.props.airspeedDataProvider}
        altitudeDataProvider={this.props.altitudeDataProvider}
        attitudeDataProvider={this.props.attitudeDataProvider}
        autopilotDataProvider={this.props.autopilotDataProvider}
        headingDataProvider={this.props.headingDataProvider}
        inertialDataProvider={this.props.inertialDataProvider}
        navigationSourceDataProvider={this.props.navigationSourceDataProvider}
        radioAltimeterDataProvider={this.props.radioAltimeterDataProvider}
        stallWarningDataProvider={this.props.stallWarningDataProvider}
        tcasRaCommandDataProvider={this.props.tcasRaCommandDataProvider}
        updateFreq={30}
        bingId={`Epic2Pfd${this.props.pfdIndex}`}
        artificialHorizonOptions={HorizonSectionContainer.artificialHorizonOptions}
        horizonLineOptions={HorizonSectionContainer.horizonLineOptions}
        pitchLadderOptions={HorizonSectionContainer.pitchLadderOptions}
        aircraftSymbolOptions={HorizonSectionContainer.aircraftSymbolOptions}
        tcasRaPitchCueLayerOptions={HorizonSectionContainer.tcasRaPitchCueOptions}
        useMagneticHeading={Subject.create(true)}
        flightDirectorMode={this.props.pfdSettingsManager.getSetting('flightDirectorMode')}
        pfdSettingsManager={this.props.pfdSettingsManager}
        rollIndicatorOptions={HorizonSectionContainer.rollIndicatorOptions}
        occlusions={this.horizonOcclusions}
      />
      <MarkerBeacon bus={this.props.bus} declutter={this.props.attitudeDataProvider.excessiveAttitude} />
      <SelectedSpeed
        autopilotDataProvider={this.props.autopilotDataProvider}
        autothrottleDataProvider={this.props.autothrottleDataProvider}
        airspeedDataProvider={this.props.airspeedDataProvider}
        altitudeDataProvider={this.props.altitudeDataProvider}
        airGroundDataProvider={this.props.airGroundDataProvider}
        readoutConfig={this.props.pfdPanelConfig.speedReference}
      />
      <MachDigitalReadout airspeedDataProvider={this.props.airspeedDataProvider} />
      <SelectedAltitude
        autopilotDataProvider={this.props.autopilotDataProvider}
        altitudeDataProvider={this.props.altitudeDataProvider}
        pfdSettingsManager={this.props.pfdSettingsManager}
        declutter={this.props.attitudeDataProvider.excessiveAttitude}
      />
      <VerticalTrackAlert verticalDeviationDataProvider={this.props.verticalDeviationDataProvider} autopilotDataProvider={this.props.autopilotDataProvider} />
      <VnavTargetAltitudeReadout
        autopilotDataProvider={this.props.autopilotDataProvider}
        altitudeDataProvider={this.props.altitudeDataProvider}
        declutter={this.props.attitudeDataProvider.excessiveAttitude}
      />
      <BaroSelection bus={this.props.bus} altitudeDataProvider={this.props.altitudeDataProvider} pfdSettingsManager={this.props.pfdSettingsManager} />
      <AltitudeTapeContainer
        bus={this.props.bus}
        altitudeDataProvider={this.props.altitudeDataProvider}
        autopilotDataProvider={this.props.autopilotDataProvider}
        pfdSettingsManager={this.props.pfdSettingsManager}
        radioAltimeterDataProvider={this.props.radioAltimeterDataProvider}
        declutter={this.props.attitudeDataProvider.excessiveAttitude}
      />
      <VerticalSpeedContainer
        bus={this.props.bus}
        altitudeDataProvider={this.props.altitudeDataProvider}
        autopilotDataProvider={this.props.autopilotDataProvider}
      />
      <SelectedVerticalSpeed autopilotDataProvider={this.props.autopilotDataProvider} />
      <VerticalDeviation verticalDeviationDataProvider={this.props.verticalDeviationDataProvider} declutter={this.props.attitudeDataProvider.excessiveAttitude} />
      <MinimumsAlert bus={this.props.bus} declutter={this.props.attitudeDataProvider.excessiveAttitude} />
      <SelectedMinimums bus={this.props.bus} declutter={this.props.attitudeDataProvider.excessiveAttitude} />
      <VerticalDeviationSource verticalDeviationDataProvider={this.props.verticalDeviationDataProvider} declutter={this.props.attitudeDataProvider.excessiveAttitude} />
      <Fma autopilotDataProvider={this.props.autopilotDataProvider} declutter={this.props.attitudeDataProvider.excessiveAttitude} />
      <AutothrottleStatus autothrottleDataProvider={this.props.autothrottleDataProvider} declutter={this.props.attitudeDataProvider.excessiveAttitude} />
      <ThrustDirector autothrottleDataProvider={this.props.autothrottleDataProvider} thrustDirectorEnabled={this.props.pfdSettingsManager.getSetting('thrustDirectorEnabled')} declutter={this.props.attitudeDataProvider.excessiveAttitude} />
      <ApproachStatus autopilotDataProvider={this.props.autopilotDataProvider} declutter={this.props.attitudeDataProvider.excessiveAttitude} />
      <SteepApproachStatus
        autopilotDataProvider={this.props.autopilotDataProvider}
        tawsDataProvider={this.props.tawsDataProvider}
        declutter={this.props.attitudeDataProvider.excessiveAttitude}
      />
      <SelectedHeading bus={this.props.bus} autopilotDataProvider={this.props.autopilotDataProvider} />
      <HSIContainer
        bus={this.props.bus}
        flightPlanner={this.props.flightPlanner}
        facLoader={this.props.facLoader}
        headingDataProvider={this.props.headingDataProvider}
        autopilotDataProvider={this.props.autopilotDataProvider}
        navigationSourceDataProvider={this.props.navigationSourceDataProvider}
        settings={this.props.pfdSettingsManager}
        mapDataProvider={this.props.mapDataProvider}
        tcasAdvisoryDataProvider={this.props.tcasAdvisoryDataProvider}
        // perfPlanRepository={this.props.perfPlanRepository}
        // activeRoutePredictor={this.props.pred}
        tcas={this.props.tcas}
        // navIndicators={this.props.navIndicators}
        instrumentIndex={this.props.instrumentIndex}
      />
      <PfdInfo
        bus={this.props.bus}
        pfdSettingsManager={this.props.pfdSettingsManager}
        airGroundDataProvider={this.props.airGroundDataProvider}
        airspeedDataProvider={this.props.airspeedDataProvider}
        inertialDataProvider={this.props.inertialDataProvider}
        headingDataProvider={this.props.headingDataProvider}
        navSourceDataProvider={this.props.navigationSourceDataProvider}
      />
      <TimeInfo bus={this.props.bus} />
      <SelectedNavSourceInfo navigationSourceDataProvider={this.props.navigationSourceDataProvider} />
      <NavPreview bus={this.props.bus} navigationSourceDataProvider={this.props.navigationSourceDataProvider} settings={this.props.navComSettingsManager}/>
      <BearingPointerSourcesDisplay navigationSourceDataProvider={this.props.navigationSourceDataProvider} />
      <PfdControllerState bus={this.props.bus} />
      <PfdAlerts bus={this.props.bus} />
    </>;
  }
}
