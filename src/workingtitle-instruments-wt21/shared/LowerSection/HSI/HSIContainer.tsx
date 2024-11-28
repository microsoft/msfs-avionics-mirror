import {
  APEvents, AvionicsSystemState, AvionicsSystemStateEvent, ComponentProps, ComputedSubject, ConsumerSubject, DisplayComponent, EventBus, FlightPlanner,
  FSComponent, MapAltitudeArcLayer, MapAltitudeArcLayerModules, MapAltitudeArcModule, MapSystemBuilder, MapSystemKeys, Subject, Subscription, UnitType,
  UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { InstrumentConfig, WT21InstrumentType } from '../../Config';
import { MapAltitudeArcController } from '../../Map/MapAltitudeArcController';
import { MapFacilitySelectModule } from '../../Map/MapFacilitySelectModule';
import { MapFormatController } from '../../Map/MapFormatController';
import { MapRangeController } from '../../Map/MapRangeController';
import { MapSelectWaypointLayer } from '../../Map/MapSelectWaypointLayer';
import { MapSystemCommon } from '../../Map/MapSystemCommon';
import { MapSystemConfig } from '../../Map/MapSystemConfig';
import { MapTerrainColorsController } from '../../Map/MapTerrainColorsController';
import { MapTerrainStateModule } from '../../Map/MapTerrainWeatherStateModule';
import { MapTodLayer } from '../../Map/MapTodLayer';
import { MapTrafficController } from '../../Map/MapTrafficController';
import { HSIFormat, MapRange, MapSettingsMfdAliased, MapUserSettings } from '../../Map/MapUserSettings';
import { PlanFormatController, PlanFormatControllerContext } from '../../Map/PlanFormatController';
import { WaypointDisplayController } from '../../Map/WaypointDisplayController';
import { WT21MapKeys } from '../../Map/WT21MapKeys';
import { WT21MapStylesModule } from '../../Map/WT21MapStylesModule';
import { WT21_PFD_MsgInfo } from '../../MessageSystem/PfdMsgInfo';
import { PerformancePlan } from '../../Performance/PerformancePlan';
import { AhrsSystemSelectorEvents } from '../../Systems';
import { AhrsSystemEvents } from '../../Systems/AHRSSystem';
import { WT21FixInfoManager } from '../../Systems/FixInfo/WT21FixInfoManager';
import { WT21TCAS } from '../../Traffic/WT21TCAS';
import { WaypointAlerter } from '../WaypointAlerter';
import { HSIArc } from './HSIArc';
import { HSIPlan } from './HSIPlan';
import { HSIRose } from './HSIRose';
import { HSITcas } from './HSITcas';
import { TcasFlag } from './TcasFlag';
import { WindVector } from './WindVector';

import './HSIContainer.css';

/**
 * Component props for HSIContainer.
 */
interface HSIContainerProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The instrument configuration object */
  instrumentConfig: InstrumentConfig;

  /** An instance of the flight planner. */
  flightPlanner: FlightPlanner;

  /** An instance of TCAS. */
  tcas: WT21TCAS;

  /** A waypoint alerter instance that controls display of waypoint alert flashing. */
  waypointAlerter: WaypointAlerter;

  /** The fix info manager. */
  fixInfo?: WT21FixInfoManager;

  /** The active performance plan */
  performancePlan: PerformancePlan;
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
  private readonly headingWasSelectedInLast5Seconds = Subject.create(false);
  private readonly mapShouldExtend = Subject.create(false);
  private readonly mapUserSettings = MapUserSettings.getAliasedManager(this.props.bus, this.props.instrumentConfig.instrumentType, this.props.instrumentConfig.instrumentIndex);

  private readonly selectedHeadingValue = ComputedSubject.create(0, (newSelectedHeadingDegrees): string =>
    (newSelectedHeadingDegrees === 0 ? 360 : newSelectedHeadingDegrees).toFixed(0).padStart(3, '0')
  );

  private readonly staticHeadingBoxValue = ComputedSubject.create(0, (newHeadingDegrees): string => {
    const rounded = Math.round(newHeadingDegrees) == 0
      ? 360
      : Math.round(newHeadingDegrees);
    return rounded.toFixed(0).padStart(3, '0');
  });

  private readonly mapSystem = MapSystemBuilder.create(this.props.bus)
    .withModule(WT21MapKeys.MapStyles, () => new WT21MapStylesModule(MapSystemCommon.mapStyles))
    .withBing(`wt21-map-${this.props.instrumentConfig.instrumentType}-${this.props.instrumentConfig.instrumentIndex}`, { bingDelay: this.props.instrumentConfig.instrumentType === WT21InstrumentType.Pfd ? 1000 : 0 })
    .withNearestWaypoints(MapSystemConfig.configureMapWaypoints(), false)
    .withFlightPlan(MapSystemConfig.configureModFlightPlan(this.props.bus, this.mapUserSettings), this.props.flightPlanner, 1, false)
    .withFlightPlan(MapSystemConfig.configureFlightPlan(this.props.bus, this.props.waypointAlerter, this.mapUserSettings), this.props.flightPlanner, 0, false)
    .withLayer(WT21MapKeys.Tod,
      (context): VNode => <MapTodLayer bus={context.bus} model={context.model} mapProjection={context.projection}
        planner={this.props.flightPlanner} waypointRenderer={context[MapSystemKeys.WaypointRenderer]}
        textManager={context.textManager} activePerformancePlan={this.props.performancePlan} fixInfo={this.props.fixInfo} />)

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
      'coui://html_ui/Pages/VCockpit/Instruments/WT21v2/Assets/icons/ownship.svg',
      new Float64Array([0.5, 0.6]),
      'hsi-map-ownship-icon'
    )
    .withModule(WT21MapKeys.TerrainModeState, () => new MapTerrainStateModule())
    .withController(MapSystemKeys.TerrainColors, context => new MapTerrainColorsController(context))
    .withTraffic(this.props.tcas, MapSystemConfig.createTrafficIntruderIcon, MapSystemConfig.initTrafficLayerCanvasStyles)
    .withOwnAirplanePropBindings(MapSystemConfig.getOwnAirplanePropsToBind(), 30)
    .withFollowAirplane()
    .withRotation()
    .withController('format', context => new MapFormatController(context, this.props.instrumentConfig.instrumentType, this.mapUserSettings))
    .withController('range', context => new MapRangeController(context, this.mapUserSettings))
    .withController('waypoints', context => new WaypointDisplayController(context, this.mapUserSettings, this.props.fixInfo))
    .withController<PlanFormatController, any, any, any, PlanFormatControllerContext>('planFormat', context => new PlanFormatController(context, this.props.instrumentConfig, this.props.flightPlanner, this.mapUserSettings))
    .withController('traffic', context => new MapTrafficController(context, this.mapUserSettings))

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
    .withController('altitudeArc', context => new MapAltitudeArcController(context, this.mapUserSettings))

    .withTargetOffset(new Float64Array([0, 66]))
    .withProjectedSize(new Float64Array([564, 564]))
    .withClockUpdate(30)
    .build();

  private readonly selectedAhrs = ConsumerSubject.create(this.props.bus.getSubscriber<AhrsSystemSelectorEvents>().on('ahrs_selected_source_index'), 1);
  private ahrsSubs = [] as Subscription[];

  /** @inheritdoc */
  public onAfterRender(): void {
    const { bus } = this.props;

    const ahrs = bus.getSubscriber<AhrsSystemEvents>();
    this.selectedAhrs.sub((ahrsIndex) => {
      for (const sub of this.ahrsSubs) {
        sub.destroy();
      }
      this.ahrsSubs = [];

      this.ahrsSubs.push(
        ahrs.on(`ahrs_hdg_deg_${ahrsIndex}`).withPrecision(0).handle(this.staticHeadingBoxValue.set.bind(this.staticHeadingBoxValue)),
        ahrs.on(`ahrs_state_${ahrsIndex}`).whenChanged().handle(this.onAhrsStateChanged.bind(this)),
        ahrs.on(`ahrs_heading_data_valid_${ahrsIndex}`).whenChanged().handle(this.onAhrsHdgValidityChanged.bind(this)),
      );
    }, true);

    this.mapUserSettings.whenSettingChanged('hsiFormat').handle(this.handleFormat);
    this.mapUserSettings.whenSettingChanged('mapRange').handle(this.handleMapRange);
    this.mapUserSettings.whenSettingChanged('tfcEnabled').handle(this.handleTfcEnabled);

    const apEvents = this.props.bus.getSubscriber<APEvents>();
    apEvents.on('ap_heading_selected')
      .whenChanged()
      .handle(this.handleNewSelectedHeading);

    this.mapUserSettings.whenSettingChanged('hsiFormat').handle((format) => {
      this.handleFormat(format);
    });
  }

  /**
   * Sets the desired map extended state.
   * @param shouldExtend Whether the map should be extended.
   */
  public setMapShouldExtend(shouldExtend: boolean): void {
    this.mapShouldExtend.set(shouldExtend);
  }

  /**
   * A callback called when the AHRS system state changes.
   * @param state The state change event to handle.
   */
  private onAhrsStateChanged(state: AvionicsSystemStateEvent): void {
    this.hsiContainerRef.instance.classList.toggle('align', state.current === AvionicsSystemState.Initializing);
  }

  /**
   * A callback called when the AHRS heading validity changes.
   * @param valid Whether the AHRS heading is valid
   */
  private onAhrsHdgValidityChanged(valid: boolean): void {
    this.hsiContainerRef.instance.classList.toggle('fail', !valid);
  }

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
    this.hsiArcRef.instance.setVisibility(format === 'ARC');
    this.hsiContainerRef.instance.classList.toggle('hsi-format-arc', format === 'ARC');
    this.hsiPPOSRef.instance.setVisibility(format === 'PPOS');
    this.hsiContainerRef.instance.classList.toggle('hsi-format-ppos', format === 'PPOS');
    this.hsiRoseRef.instance.setVisibility(format === 'ROSE');
    this.hsiContainerRef.instance.classList.toggle('hsi-format-rose', format === 'ROSE');
    if (this.props.instrumentConfig.instrumentType === WT21InstrumentType.Mfd) {
      const extendMap = this.mapShouldExtend.get() && (format === 'PLAN' || format === 'PPOS');
      (this.mapUserSettings as UserSettingManager<MapSettingsMfdAliased>).getSetting('mapExtended').set(extendMap);

      this.hsiPlanRef.instance.setVisibility(format === 'PLAN');
      this.hsiContainerRef.instance.classList.toggle('hsi-format-plan', format === 'PLAN');
      this.hsiTCASRef.instance.setVisibility(format === 'TCAS');
      this.hsiContainerRef.instance.classList.toggle('hsi-format-tcas', format === 'TCAS');
      this.hsiContainerRef.instance.classList.toggle('mfd-extended-map', extendMap);
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
          instrumentType={this.props.instrumentConfig.instrumentType}
          flightPlanner={this.props.flightPlanner}
        />
        <HSIArc
          ref={this.hsiPPOSRef}
          bus={this.props.bus}
          svgViewBoxSize={svgViewBoxSize}
          headingWasSelectedInLast5Seconds={this.headingWasSelectedInLast5Seconds}
          PPOSMode={true}
          mapRange={this.mapRange}
          mapRangeHalf={this.mapRangeHalf}
          instrumentType={this.props.instrumentConfig.instrumentType}
          flightPlanner={this.props.flightPlanner}
        />
        <HSIRose
          ref={this.hsiRoseRef}
          bus={this.props.bus}
          svgViewBoxSize={svgViewBoxSize}
          mapRangeHalf={this.mapRangeHalf}
          instrumentType={this.props.instrumentConfig.instrumentType}
        />
        {this.props.instrumentConfig.instrumentType === WT21InstrumentType.Mfd && (
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
        <WT21_PFD_MsgInfo bus={this.props.bus} instrumentType={this.props.instrumentConfig.instrumentType} />
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
