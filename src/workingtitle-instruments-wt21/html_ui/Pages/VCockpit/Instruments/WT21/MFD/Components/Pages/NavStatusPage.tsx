import {
  AdcEvents, AhrsEvents, ClockEvents, ConsumerSubject, DateTimeFormatter, DmsFormatter, DurationFormatter, FlightPlanner, FlightPlannerEvents,
  FlightPlanPredictor, FSComponent, GNSSEvents, LatLongInterface, MappedSubject, Subject, UnitType, VNode,
} from '@microsoft/msfs-sdk';
import { MfdTextPageComponent, MfdTextPageProps } from './MfdTextPageComponent';
import { WT21Fms } from '../../../Shared/FlightPlan/WT21Fms';
import { WT21LNavDataEvents } from '../../../FMC/Autopilot/WT21LNavDataEvents';
import { WT21FlightPlanPredictorConfiguration } from '../../../Shared/WT21FlightPlanPredictorConfiguration';

import './NavStatusPage.css';
import './MfdPagesContainer.css';

/**
 * Props for {@link NavStatusPage}
 */
export interface NavStatusPageProps extends MfdTextPageProps {
  /** A flight planner */
  planner: FlightPlanner,
}

/**
 * The Navigation Status Page component.
 */
export class NavStatusPage extends MfdTextPageComponent<NavStatusPageProps> {
  private readonly dmsFormatter = new DmsFormatter();

  private readonly durationFormatter = DurationFormatter.create('{m}:{ss}', UnitType.SECOND, 0, '-:--');
  private readonly timeFormatter = DateTimeFormatter.create('{HH}:{mm}', { nanString: '--:--' });

  private readonly pposTextSub = Subject.create('---°--.-- ----°--.--');

  private readonly identTextSub = Subject.create('-----');

  private readonly eteTextSub = Subject.create('-:--');

  private readonly etaTextSub = Subject.create('--:--');

  private readonly distanceTextSub = Subject.create('--.- NM');

  private readonly xtkTextSub = Subject.create('- -.-- NM');

  private readonly dtkTextSub = Subject.create('---°');

  private readonly brgTextSub = Subject.create('---°');

  private readonly hdgTextSub = Subject.create('---°');

  private readonly trkTextSub = Subject.create('---°');

  private readonly tasTextSub = Subject.create('--- KT');

  private readonly iasTextSub = Subject.create('--- KT');

  private readonly windTextSub = Subject.create('---T/ -- KT');

  private readonly gsTextSub = Subject.create('--- KT');

  private readonly headwindTitleTextSub = Subject.create('HEADWIND');
  private readonly headwindTextSub = Subject.create('--- KT');

  private readonly crosswindTextSub = Subject.create('--- KT');

  private readonly driftTextSub = Subject.create('-.-°-');

  private readonly magVarTextSub = Subject.create('-°');

  private readonly pAltTextSub = Subject.create('---- FT');

  private readonly satTextSub = Subject.create('--°C');

  private readonly nominalLegIndexSub = Subject.create(-1);

  private readonly subs = this.props.bus.getSubscriber<AdcEvents & AhrsEvents & GNSSEvents & WT21LNavDataEvents & FlightPlannerEvents & ClockEvents>();

  private readonly gpsPositionSub = ConsumerSubject.create(this.subs.on('gps-position').whenChanged(), null).pause();

  private readonly lnavNominalActiveLegIndexSub = ConsumerSubject.create(this.subs.on('lnavdata_nominal_leg_index').whenChanged(), null).pause();

  private readonly lnavXtkSub = ConsumerSubject.create(this.subs.on('lnavdata_xtk').whenChanged(), null).pause();

  private readonly lnavDtkMagSub = ConsumerSubject.create(this.subs.on('lnavdata_dtk_mag').whenChanged(), null).pause();

  private readonly waypointBearingMagSub = ConsumerSubject.create(this.subs.on('lnavdata_waypoint_bearing_mag').whenChanged(), null).pause();

  private readonly hdgDegSub = ConsumerSubject.create(this.subs.on('hdg_deg').whenChanged(), null).pause();

  private readonly hdgDegTrueSub = ConsumerSubject.create(this.subs.on('hdg_deg_true').whenChanged(), null).pause();

  private readonly trkDegSub = ConsumerSubject.create(this.subs.on('track_deg_magnetic').whenChanged(), null).pause();

  private readonly tasSub = ConsumerSubject.create(this.subs.on('tas').whenChangedBy(0.5), null).pause();

  private readonly iasSub = ConsumerSubject.create(this.subs.on('ias').whenChangedBy(0.5), null).pause();

  private readonly windDirectionSub = ConsumerSubject.create(this.subs.on('ambient_wind_direction').whenChangedBy(1), null).pause();

  private readonly windSpeedSub = ConsumerSubject.create(this.subs.on('ambient_wind_velocity').whenChangedBy(1), null).pause();

  private readonly magVarSub = ConsumerSubject.create(this.subs.on('magvar').whenChangedBy(1), null).pause();

  private readonly gsSub = ConsumerSubject.create(this.subs.on('ground_speed').whenChangedBy(0.5), null).pause();

  private readonly pAltSub = ConsumerSubject.create(this.subs.on('pressure_alt').whenChangedBy(1), null).pause();

  private readonly satSub = ConsumerSubject.create(this.subs.on('ram_air_temp_c').whenChangedBy(1), null).pause();

  private readonly fplLoadedSub = ConsumerSubject.create(this.subs.on('fplLoaded'), null).pause();

  private readonly updateSub = ConsumerSubject.create(this.subs.on('realTime').whenChangedBy(2_500), null).pause();

  private readonly simTimeSub = ConsumerSubject.create(this.subs.on('simTime'), null).pause();

  /**
   * Provides the actually used track, which is equal to heading below 5 knots ground speed
   */
  private readonly finalTrkSub = MappedSubject.create(this.gsSub, this.hdgDegSub, this.trkDegSub).map(([gs, hdg, trk]) => {
    if (gs !== null && hdg !== null && trk !== null) {
      if (gs < 5) {
        return hdg;
      } else {
        return trk;
      }
    } else {
      return null;
    }
  });

  private readonly predictor = new FlightPlanPredictor(
    this.props.bus,
    this.props.planner,
    Subject.create(WT21Fms.PRIMARY_ACT_PLAN_INDEX),
    this.lnavNominalActiveLegIndexSub.map((i) => i === null ? -1 : i),
    WT21FlightPlanPredictorConfiguration,
  );

  /**
   * Handles a new PPOS value
   *
   * @param ppos the position
   */
  private handleNewPpos(ppos: LatLongInterface | null): void {
    if (ppos) {
      const formatted = this.dmsFormatter.getLatDmsStr(ppos.lat, false) + ' ' + this.dmsFormatter.getLonDmsStr(ppos.long);

      this.pposTextSub.set(formatted);
    }
  }

  /**
   * Handles recomputing the leg data
   */
  private handleRecomputeLegData(): void {
    const legIndex = this.nominalLegIndexSub.get();

    if (legIndex !== -1 && this.props.planner.hasFlightPlan(WT21Fms.PRIMARY_ACT_PLAN_INDEX)) {
      const plan = this.props.planner.getFlightPlan(WT21Fms.PRIMARY_ACT_PLAN_INDEX);

      const leg = plan.tryGetLeg(legIndex);

      if (leg) {
        const ident = leg.name ?? '-----';

        this.identTextSub.set(ident);

        const prediction = this.predictor.predictionsForLegIndex(legIndex);

        if (prediction) {
          const formattedEte = this.durationFormatter(prediction.estimatedTimeEnroute);

          this.eteTextSub.set(formattedEte);

          const simTime = this.simTimeSub.get();
          if (simTime) {
            const unixDayStartMs = simTime - (simTime % (1000 * 60 * 60 * 24));

            const formattedEta = this.timeFormatter(unixDayStartMs + (prediction.estimatedTimeOfArrival * 1_000));

            this.etaTextSub.set(formattedEta);
          } else {
            this.etaTextSub.set('--:--');
          }

          const formattedDistance = prediction.distance < 100
            ? `${prediction.distance.toFixed(1).padStart(2, '0')} NM`
            : `${Math.round(prediction.distance)} NM`;

          this.distanceTextSub.set(formattedDistance);
        } else {
          this.eteTextSub.set('-:--');
          this.etaTextSub.set('--:--');
          this.distanceTextSub.set('--.- NM');
        }
      } else {
        this.eteTextSub.set('-:--');
        this.etaTextSub.set('--:--');
        this.distanceTextSub.set('--.- NM');
      }
    }
  }

  /** @inheritDoc */
  show(): void {
    super.show();

    this.gpsPositionSub.resume();
    this.lnavNominalActiveLegIndexSub.resume();
    this.lnavXtkSub.resume();
    this.lnavDtkMagSub.resume();
    this.waypointBearingMagSub.resume();
    this.hdgDegSub.resume();
    this.hdgDegTrueSub.resume();
    this.trkDegSub.resume();
    this.tasSub.resume();
    this.iasSub.resume();
    this.windDirectionSub.resume();
    this.windSpeedSub.resume();
    this.gsSub.resume();
    this.magVarSub.resume();
    this.pAltSub.resume();
    this.satSub.resume();
    this.fplLoadedSub.resume();
    this.updateSub.resume();
    this.simTimeSub.resume();
  }

  /** @inheritDoc */
  hide(): void {
    super.hide();

    this.gpsPositionSub.pause();
    this.lnavNominalActiveLegIndexSub.pause();
    this.lnavXtkSub.pause();
    this.lnavDtkMagSub.pause();
    this.waypointBearingMagSub.pause();
    this.hdgDegSub.pause();
    this.hdgDegTrueSub.pause();
    this.trkDegSub.pause();
    this.tasSub.pause();
    this.iasSub.pause();
    this.windDirectionSub.pause();
    this.windSpeedSub.pause();
    this.gsSub.pause();
    this.magVarSub.pause();
    this.pAltSub.pause();
    this.satSub.pause();
    this.fplLoadedSub.pause();
    this.updateSub.pause();
    this.simTimeSub.pause();
  }

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    // PPOS
    this.gpsPositionSub.sub((pos) => this.handleNewPpos(pos));

    // Leg predictions
    this.lnavNominalActiveLegIndexSub.sub((index) => {
      if (index !== null) {
        this.nominalLegIndexSub.set(index);
      }
      this.handleRecomputeLegData();
    });

    // XTK
    this.lnavXtkSub.sub((v) => {
      if (v !== null) {
        const direction = v > 0 ? 'R' : 'L';

        this.xtkTextSub.set(`${direction} ${v.toFixed(v < 10 ? 2 : 1)} NM`);
      } else {
        this.xtkTextSub.set('- -.-- NM');
      }
    }, true);

    // DTK
    this.lnavDtkMagSub.sub((v) => {
      if (v !== null) {
        this.dtkTextSub.set(`${Math.round(v).toString().padStart(3, '0')}°`);
      } else {
        this.dtkTextSub.set('---°');
      }
    }, true);

    // BRG
    this.waypointBearingMagSub.sub((v) => {
      if (v !== null) {
        this.brgTextSub.set(`${Math.round(v).toString().padStart(3, '0')}°`);
      } else {
        this.brgTextSub.set('---°');
      }
    }, true);

    // HDG
    this.hdgDegSub.sub((v) => {
      if (v !== null) {
        this.hdgTextSub.set(`${Math.round(v).toString().padStart(3, '0')}°`);
      } else {
        this.hdgTextSub.set('---°');
      }
    }, true);

    // TRK
    this.finalTrkSub.sub((v) => {
      if (v !== null) {
        this.trkTextSub.set(`${Math.round(v).toString().padStart(3, '0')}°`);
      } else {
        this.trkTextSub.set('---°');
      }
    }, true);

    // TAS
    this.tasSub.sub((v) => {
      if (v !== null) {
        this.tasTextSub.set(`${v.toFixed(0)} KT`);
      } else {
        this.tasTextSub.set('--- KT');
      }
    }, true);

    // IAS
    this.iasSub.sub((v) => {
      if (v !== null) {
        this.iasTextSub.set(`${v.toFixed(0)} KT`);
      } else {
        this.iasTextSub.set('--- KT');
      }
    }, true);

    // WIND, HEAD/TAILWIND, CROSSWIND
    MappedSubject.create(this.hdgDegTrueSub, this.windDirectionSub, this.windSpeedSub).sub(([heading, direction, speed]) => {
      if (heading !== null && direction !== null && speed !== null) {
        const headwind = Math.trunc(speed * (Math.cos((heading * Math.PI / 180) - (direction * Math.PI / 180))));
        const crosswind = Math.trunc(speed * (Math.sin((heading * Math.PI / 180) - (direction * Math.PI / 180))));

        const dirStr = `${direction.toFixed(0).padStart(3, '0')}T`;
        const speedStr = `${speed.toFixed(0)} KT`;

        this.windTextSub.set(`${dirStr}/ ${speedStr}`);

        const headwindSpeedStr = `${Math.abs(headwind).toFixed(0)} KT`;

        this.headwindTitleTextSub.set(headwind > 0 ? 'HEADWIND' : 'TAILWIND');
        this.headwindTextSub.set(headwindSpeedStr);

        const crosswindDirStr = crosswind > 0 ? 'L' : 'R';
        const crosswindSpeedStr = `${Math.abs(crosswind).toFixed(0)} KT`;

        this.crosswindTextSub.set(`${crosswindDirStr} ${crosswindSpeedStr}`);
      } else {
        this.windTextSub.set('---T/ -- KT');
        this.headwindTitleTextSub.set('--- KT');
        this.crosswindTextSub.set('- --- KT');
      }
    }, true);

    // GS
    this.gsSub.sub((v) => {
      if (v !== null) {
        this.gsTextSub.set(`${v.toFixed(0)} KT`);
      } else {
        this.gsTextSub.set('--- KT');
      }
    }, true);

    // DRIFT
    MappedSubject.create(this.hdgDegSub, this.finalTrkSub).sub(([hdg, trk]) => {
      if (hdg !== null && trk !== null) {
        const delta = trk - hdg;

        const driftDirStr = delta > 0 ? 'R' : 'L';
        const driftAngleStr = Math.abs(delta).toFixed(1);

        this.driftTextSub.set(`${driftAngleStr}°${driftDirStr}`);
      } else {
        this.driftTextSub.set('---°');
      }
    }, true);

    // MAGVAR
    this.magVarSub.sub((v) => {
      if (v !== null) {
        this.magVarTextSub.set(`${v.toFixed(0)}°`);
      } else {
        this.magVarTextSub.set('-°');
      }
    }, true);

    // PRESS ALT
    this.pAltSub.sub((v) => {
      if (v !== null) {
        this.pAltTextSub.set(`${v.toFixed(0)} FT`);
      } else {
        this.pAltTextSub.set('---- FT');
      }
    }, true);

    // SAT
    this.satSub.sub((v) => {
      if (v !== null) {
        this.satTextSub.set(`${v.toFixed(0)}°C`);
      } else {
        this.satTextSub.set('--°C');
      }
    }, true);

    this.fplLoadedSub.sub(() => this.handleRecomputeLegData());

    this.updateSub.sub(() => {
      this.predictor.update();

      this.handleRecomputeLegData();
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.pageContainerDivRef} class="mfd-page-main-container">
        <div class="nav-status-title-header cyan-text">
          <div>FMS NAV STATUS</div>
          <div>FMS POS: <span class="white-text">{this.pposTextSub}</span></div>
          <div class="magenta-text">TO WPT: <span>{this.identTextSub}</span></div>
        </div>

        <div class="nav-status-grid">
          <div>ETE</div>
          <div>{this.eteTextSub}</div>

          <div>DIST</div>
          <div>{this.distanceTextSub}</div>

          <div>ETA</div>
          <div>{this.etaTextSub}</div>

          <div>XTK</div>
          <div>{this.xtkTextSub}</div>

          <div>BRG</div>
          <div>{this.brgTextSub}</div>

          <div>DTK</div>
          <div>{this.dtkTextSub}</div>

          <div>HDG</div>
          <div>{this.hdgTextSub}</div>

          <div>TRK</div>
          <div>{this.trkTextSub}</div>

          <div>TAS</div>
          <div>{this.tasTextSub}</div>

          <div>IAS</div>
          <div>{this.iasTextSub}</div>

          <div>WIND</div>
          <div>{this.windTextSub}</div>

          <div>GND SPD</div>
          <div>{this.gsTextSub}</div>

          <div>{this.headwindTitleTextSub}</div>
          <div>{this.headwindTextSub}</div>

          <div>DRIFT</div>
          <div>{this.driftTextSub}</div>

          <div>CROSSWIND</div>
          <div>{this.crosswindTextSub}</div>

          <div>MAG VAR</div>
          <div>{this.magVarTextSub}</div>

          <div>PRESS ALT</div>
          <div>{this.pAltTextSub}</div>

          <div>SAT</div>
          <div>{this.satTextSub}</div>
        </div>
      </div>
    );
  }
}