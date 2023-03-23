import {
  AhrsEvents, APEvents, AvionicsSystemState, AvionicsSystemStateEvent, ComponentProps, ComputedSubject, DisplayComponent, EventBus, FlightPlanner, FSComponent, MapAltitudeArcLayer,
  MapAltitudeArcLayerModules, MapAltitudeArcModule, MapSystemBuilder, MapSystemKeys, Subject, UnitType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';
import { AHRSSystemEvents } from '../../../Shared/Systems';

import { MapFormatController } from '../../Map/MapFormatController';
import { MapRangeController } from '../../Map/MapRangeController';
import { MapSystemConfig } from '../../Map/MapSystemConfig';
import { MapTodLayer } from '../../Map/MapTodLayer';
import { MapTrafficController } from '../../Map/MapTrafficController';
import { HSIFormat, MapRange, MapSettingsMfdAliased, MapUserSettings, PfdOrMfd } from '../../Map/MapUserSettings';
import { WT21MapKeys } from '../../Map/WT21MapKeys';
import { PlanFormatController, PlanFormatControllerContext } from '../../Map/PlanFormatController';
import { WaypointDisplayController } from '../../Map/WaypointDisplayController';
import { CJ4_PFD_MsgInfo } from '../../MessageSystem/PfdMsgInfo';
import { WT21TCAS } from '../../Traffic/WT21TCAS';
import { WaypointAlerter } from '../WaypointAlerter';
import { HSIArc } from './HSIArc';
import { HSIPlan } from './HSIPlan';
import { HSIRose } from './HSIRose';
import { HSITcas } from './HSITcas';
import { WindVector } from './WindVector';

import { CcpControlEvents, EngineIndicationDisplayMode } from '../../../MFD/CCP/CcpControlEvents';
import { MFDUpperWindowState, MFDUserSettings } from '../../../MFD/MFDUserSettings';
import { MapAltitudeArcController } from '../../Map/MapAltitudeArcController';
import { MapFacilitySelectModule } from '../../Map/MapFacilitySelectModule';
import { MapSelectWaypointLayer } from '../../Map/MapSelectWaypointLayer';
import './HSIContainer.css';
import { TcasFlag } from './TcasFlag';

/**
 * Component props for HSIContainer.
 */
interface HSIContainerProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** Whether the component is rendered on the PFD or the MFD. */
  pfdOrMfd: PfdOrMfd;

  /** An instance of the flight planner. */
  flightPlanner: FlightPlanner;

  /** An instance of TCAS. */
  tcas: WT21TCAS;

  /** The index of the MFD screen. */
  mfdIndex: number;

  /** A waypoint alerter instance that controls display of waypoint alert flashing. */
  waypointAlerter: WaypointAlerter;
}

/** The container for the Horizontal Situation Indicator. */
export class HSIContainer extends DisplayComponent<HSIContainerProps> {

  private readonly hsiArcRef = FSComponent.createRef<HSIArc>();
  // We re-use the HSIArc component because there are only a couple differences between ARC and PPOS
  private readonly hsiPPOSRef = FSComponent.createRef<HSIArc>();
  private readonly hsiRoseRef = FSComponent.createRef<HSIRose>();
  private readonly hsiPlanRef = FSComponent.createRef<HSIPlan>();
  private readonly hsiTCASRef = FSComponent.createRef<HSITcas>();
  private readonly mapRange = Subject.create<string>('');
  private readonly mapRangeHalf = Subject.create<string>('');
  private readonly hsiContainerRef = FSComponent.createRef<HTMLDivElement>();
  private selectedHeadingTimeout?: number;
  private headingWasSelectedInLast5Seconds = Subject.create(false);
  private eisState = EngineIndicationDisplayMode.Compressed;
  private upperWindowState = MFDUpperWindowState.Off;
  private mapExtended = Subject.create(false);

  private readonly selectedHeadingValue = ComputedSubject.create(0, (newSelectedHeadingDegrees): string =>
    (newSelectedHeadingDegrees === 0 ? 360 : newSelectedHeadingDegrees).toFixed(0).padStart(3, '0')
  );

  private readonly staticHeadingBoxValue = ComputedSubject.create(0, (newHeadingDegrees): string => {
    const rounded = Math.round(newHeadingDegrees) == 0
      ? 360
      : Math.round(newHeadingDegrees);
    return rounded.toFixed(0).padStart(3, '0');
  });

  private mapSystem = MapSystemBuilder.create(this.props.bus)
    .withBing(`wt21-map-${this.props.pfdOrMfd}-${this.props.mfdIndex}`, this.props.pfdOrMfd === 'PFD' ? 1000 : 0)
    .withNearestWaypoints(MapSystemConfig.configureMapWaypoints(), false)
    .withFlightPlan(MapSystemConfig.configureModFlightPlan(this.props.bus, this.props.pfdOrMfd), this.props.flightPlanner, 1, false)
    .withFlightPlan(MapSystemConfig.configureFlightPlan(this.props.bus, this.props.waypointAlerter, this.props.pfdOrMfd), this.props.flightPlanner, 0, false)
    .withLayer(WT21MapKeys.Tod,
      (context): VNode => <MapTodLayer bus={context.bus} model={context.model} mapProjection={context.projection}
        planner={this.props.flightPlanner} waypointRenderer={context[MapSystemKeys.WaypointRenderer]} />)

    .withModule(WT21MapKeys.CtrWpt, () => new MapFacilitySelectModule(this.props.bus))
    .withLayer(WT21MapKeys.CtrWpt,
      (context) => {
        return <MapSelectWaypointLayer bus={context.bus} model={context.model} mapProjection={context.projection}
          iconFactory={context[MapSystemKeys.IconFactory]}
          labelFactory={context[MapSystemKeys.LabelFactory]}
          waypointRenderer={context[MapSystemKeys.WaypointRenderer]} />;
      })

    .withOwnAirplaneIcon(
      56,
      'coui://html_ui/Pages/VCockpit/Instruments/WT21/Assets/icons/ownship_cj4.svg',
      new Float64Array([0.5, 0.6]),
      'hsi-map-ownship-icon'
    )
    .withTraffic(this.props.tcas, MapSystemConfig.createTrafficIntruderIcon, MapSystemConfig.initTrafficLayerCanvasStyles)
    .withOwnAirplanePropBindings(MapSystemConfig.getOwnAirplanePropsToBind(), 30)
    .withFollowAirplane()
    .withRotation()
    .withController('format', context => new MapFormatController(context, this.props.pfdOrMfd))
    .withController('range', context => new MapRangeController(context, this.props.pfdOrMfd))
    .withController('waypoints', context => new WaypointDisplayController(context, this.props.pfdOrMfd))
    .withController<PlanFormatController, any, any, any, PlanFormatControllerContext>(
      'planFormat',
      context => new PlanFormatController(context, this.props.pfdOrMfd, this.props.mfdIndex as 1 | 2, this.props.flightPlanner)
    )
    .withController('traffic', context => new MapTrafficController(context, this.props.pfdOrMfd))

    // alt banana
    .withAutopilotProps(
      ['selectedAltitude'],
      4
    )
    .withModule(MapSystemKeys.AltitudeArc, () => new MapAltitudeArcModule())
    .withLayer<MapAltitudeArcLayer, MapAltitudeArcLayerModules>(MapSystemKeys.AltitudeArc, context => {
      return (
        <MapAltitudeArcLayer
          model={context.model}
          mapProjection={context.projection}
          renderMethod='canvas'
          verticalSpeedPrecision={UnitType.FPM.createNumber(10)}
          verticalSpeedThreshold={UnitType.FPM.createNumber(150)}
          altitudeDeviationThreshold={UnitType.FOOT.createNumber(750)}
          arcRadius={196}
          arcAngularWidth={25}
          strokeStyle='white'
          strokeWidth={2}
          outlineWidth={0}
          outlineStyle='white'
        />
      );
    })
    .withController('altitudeArc', context => new MapAltitudeArcController(context, this.props.pfdOrMfd))

    .withTargetOffset(new Float64Array([0, 66]))
    .withProjectedSize(new Float64Array([564, 564]))
    .withClockUpdate(30)
    .build();

  /** @inheritdoc */
  public onAfterRender(): void {
    const { bus } = this.props;

    const ahrs = bus.getSubscriber<AhrsEvents>();

    ahrs.on('hdg_deg')
      .withPrecision(0)
      .handle(this.staticHeadingBoxValue.set.bind(this.staticHeadingBoxValue));

    const mapSettingsManager = MapUserSettings.getAliasedManager(bus, this.props.pfdOrMfd);
    mapSettingsManager.whenSettingChanged('hsiFormat').handle(this.handleFormat);
    //this.handleFormat(mapSettingsManager.getSetting(`hsiFormat${this.props.pfdOrMfd}`).value);

    mapSettingsManager.whenSettingChanged('mapRange').handle(this.handleMapRange);
    //this.handleMapRange(mapSettingsManager.getSetting('mapRange').value);

    mapSettingsManager.whenSettingChanged('tfcEnabled').handle(this.handleTfcEnabled);
    //this.handleTfcEnabled(mapSettingsManager.getSetting(`tfcEnabled${this.props.pfdOrMfd}`).value);


    const ccp = bus.getSubscriber<CcpControlEvents>();
    ccp.on('ccp_eng_state').handle(x => {
      this.eisState = x;
      this.handleFormat(mapSettingsManager.getSetting('hsiFormat').value);
    });

    if (this.props.pfdOrMfd === 'MFD') {
      this.mapExtended.sub((v: boolean) => {
        (mapSettingsManager as UserSettingManager<MapSettingsMfdAliased>).getSetting('mapExtended').set(v);
      }, true);

      const mfdSettingsManager = MFDUserSettings.getAliasedManager(bus);
      mfdSettingsManager.whenSettingChanged('mfdUpperWindowState').handle(x => {
        this.upperWindowState = x;
        this.handleFormat(mapSettingsManager.getSetting('hsiFormat').value);
      });
    }

    const apEvents = this.props.bus.getSubscriber<APEvents>();
    apEvents.on('ap_heading_selected')
      .whenChanged()
      .handle(this.handleNewSelectedHeading);

    const ahrsEvents = this.props.bus.getSubscriber<AHRSSystemEvents>();
    ahrsEvents.on('ahrs_state')
      .whenChanged()
      .handle(this.onAhrsStateChanged.bind(this));
  }

  /**
   * A callback called when the AHRS system state changes.
   * @param state The state change event to handle.
   */
  private onAhrsStateChanged(state: AvionicsSystemStateEvent): void {
    this.hsiContainerRef.instance.classList.toggle('fail', state.current === AvionicsSystemState.Failed || state.current === AvionicsSystemState.Off);
    this.hsiContainerRef.instance.classList.toggle('align', state.current === AvionicsSystemState.Initializing);
  }



  private readonly handleMfdRelayout = (format: HSIFormat): void => {
    this.mapExtended.set(this.upperWindowState === MFDUpperWindowState.Off
      && this.eisState == EngineIndicationDisplayMode.Compressed
      && (format === 'PLAN' || format === 'PPOS'));
    // this.handleFormat(format);
  };

  private readonly handleTfcEnabled = (tfcEnabled: boolean): void => {
    this.hsiContainerRef.instance.classList.toggle('tfc-enabled', tfcEnabled);
  };

  private readonly handleMapRange = (newRange: MapRange): void => {
    this.mapRange.set(newRange.toFixed(0));
    const halfRange = newRange / 2;
    // If halfRange is something like 2.5, then display 1 decimal place.
    const halfRangeText = halfRange % 1 !== 0 ? halfRange.toFixed(1) : halfRange.toFixed(0);
    this.mapRangeHalf.set(halfRangeText);
    this.hsiContainerRef.instance.classList.toggle('hsi-range-5NM', newRange === 5);
    this.hsiContainerRef.instance.classList.toggle('hsi-range-10NM', newRange === 10);
    this.hsiContainerRef.instance.classList.toggle('hsi-range-25NM', newRange === 25);
  };

  private readonly handleFormat = (format: HSIFormat): void => {
    if (this.props.pfdOrMfd === 'MFD') {
      this.handleMfdRelayout(format);
    }

    this.hsiArcRef.instance.setVisibility(format === 'ARC');
    this.hsiContainerRef.instance.classList.toggle('hsi-format-arc', format === 'ARC');
    this.hsiPPOSRef.instance.setVisibility(format === 'PPOS');
    this.hsiContainerRef.instance.classList.toggle('hsi-format-ppos', format === 'PPOS');
    this.hsiRoseRef.instance.setVisibility(format === 'ROSE');
    this.hsiContainerRef.instance.classList.toggle('hsi-format-rose', format === 'ROSE');
    if (this.props.pfdOrMfd === 'MFD') {
      this.hsiPlanRef.instance.setVisibility(format === 'PLAN');
      this.hsiContainerRef.instance.classList.toggle('hsi-format-plan', format === 'PLAN');
      this.hsiTCASRef.instance.setVisibility(format === 'TCAS');
      this.hsiContainerRef.instance.classList.toggle('hsi-format-tcas', format === 'TCAS');
      this.hsiContainerRef.instance.classList.toggle('mfd-extended-map', this.mapExtended.get());
    }
  };

  private readonly handleNewSelectedHeading = (heading: number): void => {
    this.selectedHeadingValue.set(heading);
    this.startSelectedHeadingTimeout();
  };

  /** Keeps track of how long ago the selected heading was last changed. */
  private startSelectedHeadingTimeout(): void {
    this.headingWasSelectedInLast5Seconds.set(true);
    if (this.selectedHeadingTimeout) {
      clearTimeout(this.selectedHeadingTimeout);
    }
    this.selectedHeadingTimeout = window.setTimeout(this.handleSelectedHeadingTimeoutCompleted, 5000);
  }

  /** Called 5 seconds after selected heading was last changed. */
  private readonly handleSelectedHeadingTimeoutCompleted = (): void => {
    this.headingWasSelectedInLast5Seconds.set(false);
    this.selectedHeadingTimeout = undefined;
  };

  /** @inheritdoc */
  public render(): VNode {
    const svgViewBoxSize = 564;

    return (
      <div class="hsi-container" ref={this.hsiContainerRef}>
        <div class="hsi-arc-map">
          <div class="map-fail-flag">MAP</div>
          {this.mapSystem.map}
        </div>
        <HSIArc
          ref={this.hsiArcRef}
          bus={this.props.bus}
          svgViewBoxSize={svgViewBoxSize}
          headingWasSelectedInLast5Seconds={this.headingWasSelectedInLast5Seconds}
          PPOSMode={false}
          mapRange={this.mapRange}
          mapRangeHalf={this.mapRangeHalf}
          pfdOrMfd={this.props.pfdOrMfd}
          flightPlanner={this.props.flightPlanner}
          mfdIndex={this.props.mfdIndex}
        />
        <HSIArc
          ref={this.hsiPPOSRef}
          bus={this.props.bus}
          svgViewBoxSize={svgViewBoxSize}
          headingWasSelectedInLast5Seconds={this.headingWasSelectedInLast5Seconds}
          PPOSMode={true}
          mapRange={this.mapRange}
          mapRangeHalf={this.mapRangeHalf}
          pfdOrMfd={this.props.pfdOrMfd}
          flightPlanner={this.props.flightPlanner}
          mfdIndex={this.props.mfdIndex}
        />
        <HSIRose
          ref={this.hsiRoseRef}
          bus={this.props.bus}
          svgViewBoxSize={svgViewBoxSize}
          mapRangeHalf={this.mapRangeHalf}
          pfdOrMfd={this.props.pfdOrMfd}
        />
        {this.props.pfdOrMfd === 'MFD' && (
          <>
            <HSIPlan
              ref={this.hsiPlanRef}
              bus={this.props.bus}
              svgViewBoxSize={svgViewBoxSize}
              mapRange={this.mapRange}
            />
            <HSITcas
              ref={this.hsiTCASRef}
              bus={this.props.bus}
              svgViewBoxSize={svgViewBoxSize}
              mapRange={this.mapRange}
            />
          </>
        )}
        <CJ4_PFD_MsgInfo bus={this.props.bus} pfdOrMfd={this.props.pfdOrMfd} />
        <WindVector bus={this.props.bus} />
        <div class="hsi-heading-infos">
          <div class="hsi-selected-heading-readout">
            <div class="hsi-selected-heading-background" />
            <div class="hsi-selected-heading-legend">HDG</div>
            <div class="hsi-selected-heading-value">{this.selectedHeadingValue}</div>
          </div>
          <div class="hsi-static-heading-box">
            <svg class="hsi-heading-box-lubber-line" viewBox="-150 0 300 150">
              <path
                d="M -32 0 l 0 30 l 24 0 l 8 8 l 8 -8 l 24 0 l 0 -30"
                stroke="var(--wt21-colors-gray)"
                fill="var(--wt21-colors-black)"
              />
            </svg>
            <div class="hsi-static-current-heading">{this.staticHeadingBoxValue}</div>
          </div>
          <div class="fail-box">
            HDG
          </div>
        </div>
        <TcasFlag bus={this.props.bus} />
      </div>
    );
  }
}