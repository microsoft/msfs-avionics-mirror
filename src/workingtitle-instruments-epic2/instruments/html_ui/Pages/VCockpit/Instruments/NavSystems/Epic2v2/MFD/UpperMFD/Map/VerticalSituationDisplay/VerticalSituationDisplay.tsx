import {
  AdcEvents, AltitudeRestrictionType, APLateralModes, ClockEvents, ComponentProps, ConsumerSubject, ConsumerValue, DisplayComponent, EventBus,
  FlightPlannerEvents, FlightPlanTerrainProfile, FSComponent, GeoPoint, GNSSEvents, LegDefinition, LNavDataEvents, LNavEvents, MappedSubject, MathUtils,
  Subject, SubscribableMapFunctions, SvgPathStream, TerrainProfile, TerrainProfileLoader, UnitType, UserSettingManager, Value, VerticalData,
  VerticalFlightPhase, VerticalFlightPlan, VNavEvents, VNavUtils, VNode
} from '@microsoft/msfs-sdk';

import {
  AltitudeDataProvider, Epic2FmaEvents, Epic2Fms, FlightPlanLegData, FlightPlanStore, InertialDataProvider, MfdAliasedUserSettingTypes, TouchButton
} from '@microsoft/msfs-epic2-shared';

import { VsdAltitudeDigitalReadout } from './Components/VsdAltitudeReadout';
import { VsdAltitudeTape } from './Components/VsdAltitudeTape';

import './VerticalSituationDisplay.css';

enum VsdModes {
  Track,
  Plan
}

/**
 * An interface describing the options for a flight plan leg that is to be displayed on the VSD
 */
interface VsdDisplayLeg {
  /** The name of the leg */
  name: string;
  /** The distance to offset the leg from the start of the plan, in metres */
  distanceOffset: number;
  /** The distance along the leg, in metres */
  distance: number;
  /** The leg target altitude in metres */
  targetAltitude: number;
  /** The previous leg's target altitude in metres */
  prevTargetAltitude: number;
  /** The flight plan leg definition */
  leg: LegDefinition;
  /** Is this the active leg? */
  isActiveLeg: boolean;
}

/** The properties for the {@link MfdMap} component. */
interface VerticalSituationDisplayProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;
  /** The active flight plan store */
  readonly store: FlightPlanStore;
  /** The aircraft fms */
  readonly fms: Epic2Fms;
  /** The settings manager to use. */
  readonly settings: UserSettingManager<MfdAliasedUserSettingTypes>;
  /** The altitude data provider to use. */
  readonly altitudeDataProvider: AltitudeDataProvider;
  /** The inertial data provider to use */
  readonly inertialDataProvider: InertialDataProvider
}

/** An Epic2 VSD for terrain and VNAV awareness */
export class VerticalSituationDisplay extends DisplayComponent<VerticalSituationDisplayProps> {
  private static readonly LNAV_ENGAGED_MODES = [APLateralModes.GPSS, APLateralModes.NAV];
  public static readonly VSD_WINDOW_WIDTH_PX = 534;
  public static readonly VSD_WINDOW_HEIGHT_PX = 168;

  private static readonly NON_TERRAIN_LINE_DIAGONAL_PX_OFFSET = 4;
  private static readonly NON_TERRAIN_LINE_DISTANCE_PX = 9;

  private readonly isVsdEnabled = this.props.settings.getSetting('vsdEnabled');

  private readonly svgRef = FSComponent.createRef<SVGElement>();
  private readonly terrainContainerRef = FSComponent.createRef<SVGElement>();
  private readonly legLineContainerRef = FSComponent.createRef<SVGElement>();
  private readonly legIconContainerRef = FSComponent.createRef<SVGElement>();

  private readonly profile = new TerrainProfileLoader();

  private readonly mapRange = this.props.settings.getSetting('mapRange');
  private readonly mapRangeMetre = this.mapRange.map((v) => UnitType.NMILE.convertTo(v, UnitType.METER));
  private readonly vsdRenderDistanceMetre = this.mapRangeMetre.map((v) => v * 1.5);
  private readonly altInterval = this.mapRange.map((v) => {
    if (v <= 25) {
      return 2000;
    } else if (v <= 35) {
      return 3000;
    } else if (v <= 50) {
      return 5000;
    } else if (v <= 90) {
      return 10000;
    } else {
      return 15000;
    }
  });

  private readonly hPixelsPerMetre = this.mapRange.map((v) => VerticalSituationDisplay.VSD_WINDOW_WIDTH_PX / UnitType.NMILE.convertTo(v, UnitType.METER));
  private readonly hPixelsPerNm = this.mapRange.map((v) => VerticalSituationDisplay.VSD_WINDOW_WIDTH_PX / v);
  private readonly yPixelsPerFoot = this.altInterval.map((v) => VsdAltitudeTape.PX_PER_ALT_INTERVAL / v);
  private readonly yPixelsPerMetre = this.altInterval.map((v) => VsdAltitudeTape.PX_PER_ALT_INTERVAL / UnitType.METER.convertFrom(v, UnitType.FOOT));

  private readonly lowestDisplayedAltTarget = Subject.create<number | null>(null);

  private readonly windowBottomAltitude = MappedSubject.create(([aircraftAltitude, lowestDisplayedAltTarget, pxPerFoot]) => {
    // We never want the VSD to show any altitude above 50000ft, but in some cases this may happen
    // Therefore if the VSD would show a value above 50000ft, then we will modify the display altitude
    if (!aircraftAltitude) { return 0; }

    const vsdWindowHeightFt = VerticalSituationDisplay.VSD_WINDOW_HEIGHT_PX / pxPerFoot;
    const lowestDisplayedAlt = UnitType.METER.convertTo(lowestDisplayedAltTarget ?? Infinity, UnitType.FOOT);
    const bottomAltTarget = Math.max(Math.min(aircraftAltitude, lowestDisplayedAlt), aircraftAltitude - vsdWindowHeightFt);
    const maxDisplayedAltFromCurrent = bottomAltTarget + vsdWindowHeightFt;

    return Math.min(bottomAltTarget, bottomAltTarget - (maxDisplayedAltFromCurrent - VsdAltitudeTape.TAPE_WINDOW_MAX_ALT));
  }, this.props.altitudeDataProvider.altitude, this.lowestDisplayedAltTarget, this.yPixelsPerFoot);

  private readonly windowAltDifference = MappedSubject.create(
    ([alt, bottomAlt]) => alt ? MathUtils.round(alt - bottomAlt, 50) : 0,
    this.props.altitudeDataProvider.altitude, this.windowBottomAltitude
  );

  private readonly simTime = ConsumerValue.create(this.props.bus.getSubscriber<ClockEvents>().on('simTime'), 0);
  private readonly gpsPos = ConsumerSubject.create(this.props.bus.getSubscriber<GNSSEvents>().on('gps-position').atFrequency(10), new LatLongAlt(0, 0));
  private readonly groundSpeed = ConsumerSubject.create(this.props.bus.getSubscriber<GNSSEvents>().on('ground_speed').atFrequency(10), 0);
  private readonly airspeed = ConsumerSubject.create(this.props.bus.getSubscriber<AdcEvents>().on('ias').atFrequency(10), 0);
  private readonly acceleration = ConsumerSubject.create(this.props.bus.getSubscriber<GNSSEvents>().on('inertial_track_acceleration').atFrequency(10), 0);
  private readonly alongLegDistance = ConsumerSubject.create(this.props.bus.getSubscriber<LNavEvents>().on('lnav_leg_distance_along').atFrequency(10), 0);
  private readonly verticalSpeed = ConsumerSubject.create(this.props.bus.getSubscriber<AdcEvents>().on('vertical_speed').atFrequency(10), 0);
  private readonly fpa = MappedSubject.create(
    ([gs, vs]) => gs && gs > 30 ? Math.round(Math.atan(vs / UnitType.KNOT.convertTo(gs, UnitType.FPM)) * (180 / Math.PI)) : 0,
    this.groundSpeed, this.verticalSpeed
  );

  private readonly lnavDtk = ConsumerValue.create(this.props.bus.getSubscriber<LNavEvents>().on('lnav_dtk'), 0);
  private readonly acftTrk = ConsumerValue.create(this.props.bus.getSubscriber<GNSSEvents>().on('track_deg_true'), 0);
  private readonly lnavXtk = ConsumerValue.create(this.props.bus.getSubscriber<LNavEvents>().on('lnav_xtk'), 0);
  private readonly rnp = ConsumerValue.create(this.props.bus.getSubscriber<LNavDataEvents>().on('lnavdata_cdi_scale'), 0);
  private readonly onGround = ConsumerValue.create(this.props.bus.getSubscriber<AdcEvents>().on('on_ground'), false);
  private readonly isLnavTracking = Value.create(false);

  private readonly todIndex = ConsumerValue.create(this.props.bus.getSubscriber<VNavEvents>().on('vnav_tod_global_leg_index'), -1);
  private readonly tocIndex = ConsumerValue.create(this.props.bus.getSubscriber<VNavEvents>().on('vnav_toc_global_leg_index'), -1);
  private readonly todLegDistance = ConsumerValue.create(this.props.bus.getSubscriber<VNavEvents>().on('vnav_tod_leg_distance'), -1);
  private readonly tocLegDistance = ConsumerValue.create(this.props.bus.getSubscriber<VNavEvents>().on('vnav_toc_leg_distance'), -1);

  private readonly svgTransformY = MappedSubject.create(
    ([bottomAlt, yPixelsPerFoot]) => MathUtils.round(-1230 + (bottomAlt * yPixelsPerFoot), 0.1),
    this.windowBottomAltitude, this.yPixelsPerFoot
  );
  private readonly svgTransformX = MappedSubject.create(
    ([alongLegDistance, pixelsPerNm]) => MathUtils.round(MathUtils.clamp(-alongLegDistance * pixelsPerNm, -1080, 0), 0.1),
    this.alongLegDistance, this.hPixelsPerNm
  );

  private readonly svgTransform = MappedSubject.create(this.svgTransformX, this.svgTransformY);

  private readonly svgGraphicsTransformX = MappedSubject.create(
    ([alongLegDistance, pixelsPerNm]) => Math.round(Math.min(-alongLegDistance * pixelsPerNm + 1080, 0)),
    this.alongLegDistance, this.hPixelsPerNm
  );

  private readonly acftIconTransformY = MappedSubject.create(([altDiff, pxPerFoot]) => -altDiff * pxPerFoot, this.windowAltDifference, this.yPixelsPerFoot);

  private readonly vsdModeAuto = Subject.create(true);
  private readonly vsdMode = Subject.create(VsdModes.Plan);

  /** @inheritdoc */
  public onAfterRender(): void {
    const sub = this.props.bus.getSubscriber<FlightPlannerEvents & ClockEvents>();

    sub.on('fplLegChange').handle(() => this.vsdMode.get() === VsdModes.Plan ? this.needsRedraw = true : null);
    this.props.store.activeLeg.sub(() => this.vsdMode.get() === VsdModes.Plan ? this.needsRedraw = true : null);
    MappedSubject.create(this.yPixelsPerMetre, this.hPixelsPerMetre).sub(() => this.needsRedraw = true);
    this.props.bus.getSubscriber<Epic2FmaEvents>().on('epic2_fma_data').handle((data) => {
      this.isLnavTracking.set(VerticalSituationDisplay.LNAV_ENGAGED_MODES.includes(data.lateralActive));
      this.needsRedraw = true;
    });
    this.vsdMode.sub(() => this.needsRedraw = true);

    sub.on('simTime').atFrequency(1).handle(() => this.update());
    this.isVsdEnabled.sub(() => this.update());
  }

  private needsRedraw = false;
  private lastSimtime = 0;
  private distSinceDraw = 0;
  private trkAtDraw = 0;
  private geoPointCache = new GeoPoint(0, 0);

  /**
   * Updates the VSD
   */
  private async update(): Promise<void> {
    if (!this.isVsdEnabled.get() || this.gpsPos.get() === null) {
      return;
    }

    this.updateAutoMode();

    const vsdMode = this.vsdMode.get();
    const simtime = this.simTime.get();
    const gs = this.groundSpeed.get();

    this.distSinceDraw += gs * UnitType.MILLISECOND.convertTo(simtime - this.lastSimtime, UnitType.HOUR);
    this.lastSimtime = simtime;

    if (this.distSinceDraw > (this.mapRange.get() / 2) || this.distSinceDraw > gs / 30) {
      this.needsRedraw = true;
    } else if (vsdMode === VsdModes.Track && Math.abs(this.acftTrk.get() - this.trkAtDraw) > 1) {
      this.needsRedraw = true;
    }

    if (this.needsRedraw === true) {
      if (vsdMode === VsdModes.Plan) {
        this.updateTerrainProfileFromPlan();
      } else {
        this.trkAtDraw = this.acftTrk.get();

        this.updateTerrainProfileFromTrack();
      }

      this.distSinceDraw = 0;
      this.needsRedraw = false;
    }
  }

  /**
   * Updates and re-renders the VSD terrain profile based on the aircraft track.
   */
  private async updateTerrainProfileFromTrack(): Promise<void> {
    const gpsPos = this.gpsPos.get();
    this.lowestDisplayedAltTarget.set(null);

    if (gpsPos === null) {
      return;
    }

    const distanceToGetMetric = this.vsdRenderDistanceMetre.get();
    const distanceToGet = UnitType.GA_RADIAN.convertFrom(distanceToGetMetric, UnitType.METER);

    const startPoint = new LatLong(gpsPos.lat, gpsPos.long);
    const endPoint = this.geoPointCache.set(startPoint.lat, startPoint.long).offset(this.acftTrk.get(), distanceToGet);

    const profilePoints = [startPoint, new LatLong(endPoint.lat, endPoint.lon)];
    const profile = await this.profile.getTerrainProfileAlongPath(profilePoints, distanceToGetMetric / 250);

    const svgPathStream = new SvgPathStream(0.01);
    svgPathStream.beginPath();
    svgPathStream.moveTo(0, 1400);
    svgPathStream.lineTo(0, 2);

    const lastDrawnPointY = Value.create(0);
    this.drawPathForTerrainProfile(svgPathStream, lastDrawnPointY, profile, this.hPixelsPerMetre.get(), this.yPixelsPerMetre.get(), distanceToGetMetric);

    svgPathStream.closePath();


    FSComponent.render(<path d={svgPathStream.getSvgPath().toLowerCase()} fill={'#83856E'} stroke='#83856E' stroke-width='2' />, this.terrainContainerRef.instance);
  }

  /**
   * Updates the flight plan terrain profile, when the active leg is changed or the flight plan is modified.
   * And re-renders the terrain profile
   */
  private async updateTerrainProfileFromPlan(): Promise<void> {
    if (!this.isVsdEnabled.get() || this.gpsPos.get() === null) {
      return;
    }

    if (this.vsdMode.get() === VsdModes.Plan) {
      if (this.props.fms.hasPrimaryFlightPlan()) {
        const plan = this.props.fms.getFlightPlan();

        const terrainResolution = Math.max(150, Math.floor(this.mapRangeMetre.get() / VerticalSituationDisplay.VSD_WINDOW_WIDTH_PX));
        const profile = await this.profile.getTerrainProfileForFlightPlan(plan, plan.activeLateralLeg, terrainResolution);

        this.updateFlightPlanProfileLegDistances(profile);
        this.updateFlightPlanProfile(profile);
      }
    }
  }

  /**
   * Updates the VSD mode
   */
  private updateAutoMode(): void {
    if (this.vsdModeAuto.get()) {
      const hasPlan = this.props.fms.hasPrimaryFlightPlan();
      const isOnGround = this.onGround.get();
      const isOnTrack = Math.abs(this.acftTrk.get() - this.lnavDtk.get()) <= 20;
      const isOnLateralTrack = this.lnavXtk.get() <= this.rnp.get();

      const selectFplMode = hasPlan && (isOnGround || isOnTrack && isOnLateralTrack);
      this.vsdMode.set(selectFplMode ? VsdModes.Plan : VsdModes.Track);
    }
  }

  /**
   * Updates a flight plan's terrain profile to correct any invalid leg distances
   * @param profile The flight plan terrain profile
   */
  private updateFlightPlanProfileLegDistances(profile: FlightPlanTerrainProfile): void {
    const plan = this.props.fms.getFlightPlan();

    const prevLegLatLon = this.geoPointCache.set(0, 0);

    for (const [legIndex, leg] of profile.legs.entries()) {
      const globalLegIndex = profile.startLegGlobalIndex + legIndex;
      const planLeg = plan.getLeg(globalLegIndex);

      let legDistance = 0;

      if (leg.profile) {
        // If a leg returns a profile we can safely assume that it has a correct leg distance
        legDistance = leg.legDistance;

        prevLegLatLon.set(planLeg.calculated?.endLat ?? NaN, planLeg.calculated?.endLon ?? NaN);
      } else if (globalLegIndex !== 0 && globalLegIndex !== plan.length - 1) {
        // We ignore the first and last leg since they're basically always guaranteed to not have a valid distance
        legDistance = planLeg.calculated?.distanceWithTransitions ?? legDistance;

        // If we dont have a valid leg profile, its likely a discontinuity so we need to find the last valid latlong and next valid latlong
        if (!legDistance) {
          if (prevLegLatLon.isValid()) {
            for (let i = globalLegIndex + 1; i < plan.length; i++) {
              const futureLeg = plan.getLeg(i);
              if (futureLeg.calculated?.startLat && futureLeg.calculated?.startLon) {
                legDistance = UnitType.METER.convertFrom(prevLegLatLon.distance(futureLeg.calculated?.startLat, futureLeg.calculated?.startLon), UnitType.GA_RADIAN);
                break;
              } else if (futureLeg.calculated?.endLat && futureLeg.calculated?.endLon) {
                legDistance = UnitType.METER.convertFrom(prevLegLatLon.distance(futureLeg.calculated?.endLat, futureLeg.calculated?.endLon), UnitType.GA_RADIAN);
                break;
              }
            }
          }
        }
      }

      leg.legDistance = legDistance;
    }
  }

  /**
   * Renders the terrain profile of a flight plan to an SVG
   * @param profile The terrain profile to render
   */
  private updateFlightPlanProfile(profile: FlightPlanTerrainProfile): void {
    this.lowestDisplayedAltTarget.set(null);

    const svgRef = this.svgRef.getOrDefault();
    const plan = this.props.fms.getFlightPlan();
    const verticalPlan = this.props.fms.getVerticalPlanForFmcRender();
    const activeLegIndex = this.props.store.activeLegGlobalIndex.get();
    const alongLegDist = this.alongLegDistance.get();
    if (!svgRef) {
      return;
    }

    this.clearContainers();

    const yPixelsPerMetre = this.yPixelsPerMetre.get();
    const hPixelsPerMetre = this.hPixelsPerMetre.get();
    const distanceToRender = this.vsdRenderDistanceMetre.get();

    let cumulativeDist = 0;
    let prevLegTargetAlt = this.props.altitudeDataProvider.metricAltitude.get() ?? 0;
    const prevLegLatLon = this.geoPointCache.set(0, 0);

    // We need to find out what the target altitude was for the FROM leg
    if (profile.startLegGlobalIndex > 0) {
      const fromStoreLeg = this.props.store.legMap.get(plan.getLeg(profile.startLegGlobalIndex - 1));

      if (fromStoreLeg) {
        const prevConstraint = VNavUtils.getConstraintFromLegIndex(verticalPlan, profile.startLegGlobalIndex - 1);

        if (prevConstraint) {
          prevLegTargetAlt = VerticalSituationDisplay.getLegTargetAltitude(fromStoreLeg, verticalPlan, prevConstraint.minAltitude, alongLegDist) ?? prevLegTargetAlt;
        }
      }
    }

    const tocIndex = this.tocIndex.get();
    const todIndex = this.todIndex.get();
    const tocLegDistance = this.tocLegDistance.get();
    const todLegDistance = this.todLegDistance.get();

    const svgPathStream = new SvgPathStream(0.01);
    svgPathStream.beginPath();
    svgPathStream.moveTo(0, 1400);
    svgPathStream.lineTo(0, 2);

    const lastDrawnPointY = Value.create(0);
    let invalidLegDistance = 0;

    for (const [legIndex, leg] of profile.legs.entries()) {
      const globalLegIndex = profile.startLegGlobalIndex + legIndex;
      const planLeg = plan.getLeg(globalLegIndex);

      const distOffset = cumulativeDist - ((4 / hPixelsPerMetre) * legIndex);
      const legDistance = leg.legDistance;

      // We want to begin by rendering the terrain profile for the flight plan leg
      if (leg.profile) {
        if (invalidLegDistance > 0) {
          svgPathStream.lineTo(0, 1400);
          svgPathStream.moveTo(distOffset * hPixelsPerMetre, 1400);
          svgPathStream.lineTo(0, 2);

          invalidLegDistance = 0;
          lastDrawnPointY.set(0);
        }
        this.drawPathForTerrainProfile(svgPathStream, lastDrawnPointY, leg.profile, hPixelsPerMetre, yPixelsPerMetre, legDistance);

        prevLegLatLon.set(planLeg.calculated?.endLat ?? NaN, planLeg.calculated?.endLon ?? NaN);

        prevLegLatLon.set(planLeg.calculated?.endLat ?? NaN, planLeg.calculated?.endLon ?? NaN);
      } else if (globalLegIndex !== 0 && globalLegIndex !== plan.length - 1) {
        // We don't render the first and last leg since they're basically always guaranteed to not have a valid route
        invalidLegDistance += distOffset;

        this.renderNonTerrainSegment(distOffset, legDistance, hPixelsPerMetre, yPixelsPerMetre);
      }

      // We now need to render the flight plan legs
      const storeLeg = this.props.store.legMap.get(planLeg);
      if (storeLeg) {
        const targetAlt = VerticalSituationDisplay.getLegTargetAltitude(storeLeg, verticalPlan, prevLegTargetAlt, legDistance);

        if (targetAlt && isFinite(targetAlt)) {
          const isLegActive = activeLegIndex === globalLegIndex;
          const legDescription = {
            distanceOffset: distOffset,
            distance: legDistance,
            targetAltitude: targetAlt,
            prevTargetAltitude: prevLegTargetAlt,
            name: planLeg.name ?? '',
            leg: planLeg,
            isActiveLeg: isLegActive
          };

          if (tocIndex > 1 || todIndex > 1) {
            if (tocIndex === todIndex && tocIndex === globalLegIndex) {
              // Need to handle edge case of the TOC and TOD being on the same leg, and also handle if TOD is before TOC, or vice versa
              const tocDistance = legDescription.distance - this.tocLegDistance.get();
              const todDistance = legDescription.distance - this.todLegDistance.get();
              if (tocLegDistance < todLegDistance) {
                // The TOC is before the TOD but in the same leg
                const todDistFromToc = todDistance - tocDistance;

                legDescription.isActiveLeg = isLegActive && alongLegDist <= tocDistance;
                this.renderTocOrTod(legDescription, 'TOC', tocDistance, hPixelsPerMetre, yPixelsPerMetre);
                this.correctLegForTocTod(legDescription, tocDistance);

                legDescription.isActiveLeg = isLegActive && alongLegDist > tocDistance && alongLegDist <= todDistance;
                this.renderTocOrTod(legDescription, 'TOD', todDistFromToc, hPixelsPerMetre, yPixelsPerMetre);
                this.correctLegForTocTod(legDescription, todDistFromToc);

                legDescription.isActiveLeg = isLegActive && alongLegDist > todDistance;
              } else {
                // The TOD is before the TOC but in the same leg
                const tocDistFromTod = tocDistance - todDistance;

                legDescription.isActiveLeg = isLegActive && alongLegDist <= todDistance;
                this.renderTocOrTod(legDescription, 'TOD', todDistance, hPixelsPerMetre, yPixelsPerMetre);
                this.correctLegForTocTod(legDescription, todDistance);

                legDescription.isActiveLeg = isLegActive && alongLegDist > todDistance && alongLegDist <= tocDistance;
                this.renderTocOrTod(legDescription, 'TOC', tocDistFromTod, hPixelsPerMetre, yPixelsPerMetre);
                this.correctLegForTocTod(legDescription, tocDistFromTod);

                legDescription.isActiveLeg = isLegActive && alongLegDist > tocDistance;
              }
            } else if (tocIndex === globalLegIndex) {
              const tocDistance = legDescription.distance - this.tocLegDistance.get();

              legDescription.isActiveLeg = isLegActive && alongLegDist <= tocDistance;
              this.renderTocOrTod(legDescription, 'TOC', tocDistance, hPixelsPerMetre, yPixelsPerMetre);
              this.correctLegForTocTod(legDescription, tocDistance);

              legDescription.isActiveLeg = isLegActive && alongLegDist > tocDistance;
            } else if (todIndex === globalLegIndex) {
              const todDistance = legDescription.distance - this.tocLegDistance.get();

              legDescription.isActiveLeg = isLegActive && alongLegDist <= todDistance;
              this.renderTocOrTod(legDescription, 'TOD', todDistance, hPixelsPerMetre, yPixelsPerMetre);
              this.correctLegForTocTod(legDescription, todDistance);

              legDescription.isActiveLeg = isLegActive && alongLegDist > todDistance;
            }
          }

          this.renderFlightPlanLegProfile(legDescription, hPixelsPerMetre, yPixelsPerMetre);
          prevLegTargetAlt = targetAlt;
        }
      }

      if (cumulativeDist > distanceToRender) {
        break;
      }

      cumulativeDist += legDistance;
    }

    svgPathStream.closePath();
    FSComponent.render(<path d={svgPathStream.getSvgPath().toLowerCase().replace(/m/g, 'M')} fill={'#83856E'} stroke='#83856E' stroke-width='2' />, this.terrainContainerRef.instance);
  }

  /**
   * Corrects a leg description for a TOC/TOD
   * @param legDescription The leg description to be corrected
   * @param tocTodDistance The distance of the TOC/TOD from the distance offset
   */
  private correctLegForTocTod(legDescription: VsdDisplayLeg, tocTodDistance: number): void {
    legDescription.distanceOffset = legDescription.distanceOffset + tocTodDistance;
    legDescription.distance = legDescription.distance - tocTodDistance;
    legDescription.prevTargetAltitude = legDescription.targetAltitude;
  }

  /**
   * Draws a leg's terrain profile to the svg path stream
   * @param svgPathStream The svg path stream to render to
   * @param lastDrawnPointY The altitude of the last drawn point
   * @param profile The terrain profile to draw
   * @param hPixelsPerMetre The number of pixels per metre along the horizontal axis
   * @param yPixelsPerMetre The number of pixels per metre along the vertical axis
   * @param pathDistance The distance to target, in metres, of this path
   */
  private drawPathForTerrainProfile(
    svgPathStream: SvgPathStream,
    lastDrawnPointY: Value<number>,
    profile: TerrainProfile,
    hPixelsPerMetre: number,
    yPixelsPerMetre: number,
    pathDistance: number
  ): void {
    let distSinceLastPoint = 0;
    const numElevations = profile.elevations.length;
    const distPerPoint = pathDistance / numElevations;
    const terrainPointTolerance = 1 / yPixelsPerMetre;

    for (let i = 0; i < numElevations; i++) {
      const y = profile.elevations[i];

      if (lastDrawnPointY === undefined || Math.abs(y - lastDrawnPointY.get()) > terrainPointTolerance || i === numElevations - 1) {
        svgPathStream.lineTo(distSinceLastPoint * hPixelsPerMetre, (lastDrawnPointY.get() - y) * yPixelsPerMetre);
        distSinceLastPoint = distPerPoint;
        lastDrawnPointY.set(y);
      } else {
        distSinceLastPoint += distPerPoint;
      }
    }

    // const svgPathStream = new SvgPathStream(0.01);
    // svgPathStream.beginPath();
    // svgPathStream.moveTo(Math.floor(hDistOffset * hPixelsPerMetre), 1400);
    // svgPathStream.lineTo(0, 2);

    // let distSinceLastPoint = 0;
    // const numElevations = profile.elevations.length;
    // const distPerPoint = pathDistance / numElevations;
    // const terrainPointTolerance = 1 / yPixelsPerMetre;

    // let lastDrawnPointY = 0;
    // for (let i = 0; i < numElevations; i++) {
    //   const y = profile.elevations[i];

    //   if (lastDrawnPointY === undefined || Math.abs(y - lastDrawnPointY) > terrainPointTolerance || i === numElevations - 1) {
    //     svgPathStream.lineTo(distSinceLastPoint * hPixelsPerMetre, (lastDrawnPointY - y) * yPixelsPerMetre);
    //     distSinceLastPoint = distPerPoint;
    //     lastDrawnPointY = y;
    //   } else {
    //     distSinceLastPoint += distPerPoint;
    //   }
    // }

    // svgPathStream.closePath();
    // return svgPathStream;
  }

  /**
   * Renders a non-terrain segment to the VSD
   * @param distOffset The distance to offset this segment by, in metres
   * @param distance The distance of this segment, in metres
   * @param hPixelsPerMetre The number of pixels per metre along the horizontal axis
   * @param yPixelsPerMetre The number of pixels per metre along the vertical axis
   */
  private renderNonTerrainSegment(distOffset: number, distance: number, hPixelsPerMetre: number, yPixelsPerMetre: number): void {
    const height = UnitType.METER.convertFrom(this.altInterval.get() / 3, UnitType.FOOT) * yPixelsPerMetre;
    const initialX = Math.floor((distOffset * hPixelsPerMetre));

    const distancePx = distance * hPixelsPerMetre;
    const numLines = Math.floor((distancePx - 4) / VerticalSituationDisplay.NON_TERRAIN_LINE_DISTANCE_PX);

    const lines: VNode[] = [];
    for (let i = 0; i < numLines; i++) {
      const x = initialX + VerticalSituationDisplay.NON_TERRAIN_LINE_DIAGONAL_PX_OFFSET + (VerticalSituationDisplay.NON_TERRAIN_LINE_DISTANCE_PX * i);
      lines.push(
        <line x1={x} x2={x + 8} y2={1400 - height} y1={1400} stroke="white" stroke-width="2"></line>
      );
    }

    FSComponent.render(<g>
      <line x1={initialX} x2={initialX} y2={1400 - height} y1={1400} stroke="white" stroke-width="2" />
      {...lines}
      <line x1={initialX + distancePx} x2={initialX + distancePx} y2={1400 - height} y1={1400} stroke="white" stroke-width="2" />
    </g>, this.terrainContainerRef.instance);
  }

  /**
   * Renders a flight plan leg vertical profile to the VSD
   * @param legDescription An object that describes various properties of this leg
   * @param hPixelsPerMetre The number of pixels per metre along the horizontal axis
   * @param yPixelsPerMetre The number of pixels per metre along the vertical axis
   */
  private renderFlightPlanLegProfile(
    legDescription: VsdDisplayLeg,
    hPixelsPerMetre: number,
    yPixelsPerMetre: number
  ): void {
    const initialX = Math.floor(legDescription.distanceOffset * hPixelsPerMetre);
    const distancePx = Math.ceil(legDescription.distance * hPixelsPerMetre - 3);

    const colour = legDescription.isActiveLeg ? (this.isLnavTracking.get() ? 'magenta' : 'lime') : 'white';

    const legVerticalData = legDescription.leg.verticalData;
    const isConstraint = legVerticalData.altDesc !== AltitudeRestrictionType.Unused;

    FSComponent.render(<line x1={initialX} x2={initialX + distancePx} y2={1400 - (legDescription.targetAltitude * yPixelsPerMetre)} y1={1400 - (legDescription.prevTargetAltitude * yPixelsPerMetre)} stroke={colour} stroke-width="3" />, this.legLineContainerRef.instance);
    FSComponent.render(
      <g style={`transform: translate3d(${initialX + distancePx - 12.5}px, ${1400 - (legDescription.targetAltitude * yPixelsPerMetre) - 12.5}px, 0)`}>
        <text fill={colour} stroke="black" stroke-width="3px" style="font-size: 22px;" text-anchor="middle" x="13" y="-2">{legDescription.name}</text>
        {!isConstraint && <path d="M25 12.5C25 11.6291 20.8333 10.0922 15.3292 9.68238C14.8663 4.14959 13.2716 0 12.5 0C11.6255 0 10.1337 4.14959 9.67078 9.68238C4.16667 10.041 0 11.4242 0 12.5C0 13.4221 4.11523 14.9078 9.67078 15.3176C10.0309 20.8504 11.4712 25 12.5 25C13.4259 25 14.9177 20.8504 15.3292 15.3176C20.8333 14.8566 25 13.2172 25 12.5Z" stroke="black" stroke-width="2px" fill={colour} />}
      </g>, this.legIconContainerRef.instance
    );

    if (initialX + distancePx < VerticalSituationDisplay.VSD_WINDOW_WIDTH_PX && legVerticalData.phase === VerticalFlightPhase.Descent) {
      this.lowestDisplayedAltTarget.set(Math.min(this.lowestDisplayedAltTarget.get() ?? Infinity, Math.max(legDescription.targetAltitude - 200, 0)));
    }

    if (isConstraint) {
      this.renderConstraintLabel(legVerticalData, initialX + distancePx, colour, yPixelsPerMetre);
    }
  }

  /**
   * Renders a flight plan TOC/TOD to the VSD
   * @param legDescription An object that describes various properties of the leg which contains the TOC/TOD
   * @param type Whether this is the TOC or TOD
   * @param distance The distance from the start of the leg to the TOC/TOD, in metres
   * @param hPixelsPerMetre The number of pixels per metre along the horizontal axis
   * @param yPixelsPerMetre The number of pixels per metre along the vertical axis
   */
  private renderTocOrTod(
    legDescription: VsdDisplayLeg,
    type: 'TOC' | 'TOD',
    distance: number,
    hPixelsPerMetre: number,
    yPixelsPerMetre: number
  ): void {
    const initialX = Math.floor(legDescription.distanceOffset * hPixelsPerMetre);
    const distancePx = Math.ceil(distance * hPixelsPerMetre - 3);

    const colour = legDescription.isActiveLeg ? (this.isLnavTracking.get() ? 'magenta' : 'lime') : 'white';

    FSComponent.render(<line x1={initialX} x2={initialX + distancePx} y2={1400 - (legDescription.targetAltitude * yPixelsPerMetre)} y1={1400 - (legDescription.prevTargetAltitude * yPixelsPerMetre)} stroke={colour} stroke-width="3" />, this.legLineContainerRef.instance);
    FSComponent.render(
      <g style={`transform: translate3d(${initialX + distancePx - 12.5}px, ${1400 - (legDescription.targetAltitude * yPixelsPerMetre) - 12.5}px, 0)`}>
        <text fill={colour} stroke="black" stroke-width="3px" style="font-size: 22px;" text-anchor="middle" x="13" y="-2">{`*${type}`}</text>
        <path d="M12.5 1L19 12H6L12.5 1Z M6 12L12.5 24L19 12H6Z" stroke="black" stroke-width="2px" fill={colour} />
      </g>, this.legIconContainerRef.instance
    );
  }

  /**
   * Renders a leg constraint label
   * @param legVerticalData The vertical data for the leg that holds this constraint
   * @param x The x co-ordinate where this constraint is located at
   * @param colour The colour of this label
   * @param yPixelsPerMetre The number of pixels per metre along the vertical axis
   */
  private renderConstraintLabel(legVerticalData: VerticalData, x: number, colour: string, yPixelsPerMetre: number): void {
    const constraintType = legVerticalData.altDesc;
    const minConstraintAlt = constraintType === AltitudeRestrictionType.Between ? legVerticalData.altitude2 : legVerticalData.altitude1;
    const maxConstraintAlt = constraintType === AltitudeRestrictionType.Between ? legVerticalData.altitude1 : legVerticalData.altitude2;

    if (constraintType === AltitudeRestrictionType.At) {
      FSComponent.render(
        <g style={`transform: translate3d(${x - 12.5}px, ${1400 - (minConstraintAlt * yPixelsPerMetre) - 12.5}px, 0)`}>
          <text fill={colour} stroke="black" stroke-width="1px" style="font-size: 20px;" text-anchor="right" x="-33" y="20">{UnitType.METER.convertTo(minConstraintAlt, UnitType.FOOT).toFixed(0)}</text>
          <path d="M12.5 12L6 2H19L12.5 12Z" stroke="black" stroke-width="2px" fill={colour} />
          <path d="M12.5 13L19 23H6L12.5 13Z" stroke="black" stroke-width="2px" fill={colour} />
        </g>, this.legIconContainerRef.instance
      );
    } else if (minConstraintAlt > 0) {
      FSComponent.render(
        <g style={`transform: translate3d(${x - 12.5}px, ${1400 - (minConstraintAlt * yPixelsPerMetre) - 12.5}px, 0)`}>
          <text fill={colour} stroke="black" stroke-width="1px" style="font-size: 20px;" text-anchor="right" x="-33" y="24">{UnitType.METER.convertTo(minConstraintAlt, UnitType.FOOT).toFixed(0)}</text>
          <path d="M12.5 13L19 23H6L12.5 13Z" stroke="black" stroke-width="2px" fill={colour} />
        </g>, this.legIconContainerRef.instance
      );
    } else if (maxConstraintAlt > 0) {
      FSComponent.render(
        <g style={`transform: translate3d(${x - 12.5}px, ${1400 - (maxConstraintAlt * yPixelsPerMetre) - 12.5}px, 0)`}>
          <text fill={colour} stroke="black" stroke-width="1px" style="font-size: 20px;" text-anchor="right" x="-33" y="16">{UnitType.METER.convertTo(maxConstraintAlt, UnitType.FOOT).toFixed(0)}</text>
          <path d="M12.5 12L6 2H19L12.5 12Z" stroke="black" stroke-width="2px" fill={colour} />
        </g>, this.legIconContainerRef.instance
      );
    }
  }

  /**
   * Clears the terrain and leg containers of any children
   */
  private clearContainers(): void {
    const terrContainer = this.terrainContainerRef.getOrDefault();
    const legLineContainer = this.legLineContainerRef.getOrDefault();
    const legLabelContainer = this.legIconContainerRef.getOrDefault();

    while (terrContainer?.lastChild) {
      terrContainer.removeChild(terrContainer.lastChild);
    }
    while (legLineContainer?.lastChild) {
      legLineContainer.removeChild(legLineContainer.lastChild);
    }
    while (legLabelContainer?.lastChild) {
      legLabelContainer.removeChild(legLabelContainer.lastChild);
    }
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div class={{ 'vsd-container': true, 'hidden': this.isVsdEnabled.map(SubscribableMapFunctions.not()) }}>
        <div class={'vsd-altitude-container'}>
          <div class={{ 'hidden': this.props.altitudeDataProvider.altitude.map((v) => v === null) }}>
            <VsdAltitudeTape
              bus={this.props.bus}
              bottomAltitude={this.windowBottomAltitude}
              altInterval={this.altInterval}
              pixelsPerFoot={this.yPixelsPerFoot}
            />
            <VsdAltitudeDigitalReadout altitude={this.props.altitudeDataProvider.altitude} bottomWindowAlt={this.windowBottomAltitude} pixelPerFoot={this.yPixelsPerFoot} />
          </div>
          <div class={{ 'vsd-invalid-alt-container': true, 'hidden': this.props.altitudeDataProvider.altitude.map((v) => v !== null) }}>
            <svg viewBox="0 0 87 100">
              <path d="M 0 0 L 87 192 M 87 0 L 0 192" />
            </svg>
          </div>
        </div>
        <div class={'vsd-display-container'}>
          <div class={'vsd-display'}>
            <div class={{ 'hidden': this.gpsPos.map((v) => v === null) }}>
              <svg viewBox="0 0 1068 1400" style={{
                width: '1068px',
                height: '1400px',
                transform: this.svgTransform.map(([x, y]) => `translate3d(${x}px, ${y}px, 0px)`)
              }}>
                <g ref={this.svgRef} style={{ transform: this.svgGraphicsTransformX.map((x) => `translate3d(${x}px, 0px, 0px)`) }}>
                  <g ref={this.terrainContainerRef} />
                  <g ref={this.legLineContainerRef} />
                  <g ref={this.legIconContainerRef} />
                </g>
              </svg>
              <div class='vsd-aircraft-icon' style={{ transform: this.acftIconTransformY.map((v) => `translate3d(0, ${v}px, 0)`) }}>
                <div class="vsd-fpa-line" style={{ transform: this.fpa.map((v) => `rotateZ(-${v}deg)`) }} />
                <img src="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/pc12-airplane-vsd.png" height="25" style={'position: absolute;'} />
              </div>
            </div>
            <div class={{ 'vsd-invalid-position-label': true, 'hidden': this.gpsPos.map((v) => v !== null) }}>
              <p>Position Invalid</p>
            </div>
          </div>
          <div class={'vsd-range-labels'}>
            <p>0</p>
            <p>{this.mapRange.map((v) => (v / 2) % 1 === 0 ? (v / 2).toFixed(0) : (v / 2).toFixed(1))}</p>
            <p>{this.mapRange}</p>
          </div>
        </div>
        <div class='vsd-right-container'>
          <div class={'vsd-mode-container'}>
            <TouchButton class='vsd-mode-auto-annunciator' variant='list-button' onPressed={() => this.vsdModeAuto.set(!this.vsdModeAuto.get())}>{this.vsdModeAuto.map((v) => v ? 'A' : 'M')}</TouchButton>
            <TouchButton class='vsd-mode-annunciator' variant='list-button' onPressed={() => {
              this.vsdModeAuto.set(false);
              this.vsdMode.set(this.vsdMode.get() === VsdModes.Plan ? VsdModes.Track : VsdModes.Plan);
            }}>{this.vsdMode.map((v) => v === VsdModes.Plan ? 'F P L' : 'T R K')}</TouchButton>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Gets the target altitude for a leg
   * @param legData The leg data returned by the flight plan store
   * @param verticalPlan The vertical flight plan
   * @param prevLegTargetAlt The target altitude of the previous leg
   * @param legDistance The distance of this leg, in metres
   * @returns The target altitude of this leg, or undefined if one cannot be found
   */
  private static getLegTargetAltitude(legData: FlightPlanLegData, verticalPlan: VerticalFlightPlan, prevLegTargetAlt: number, legDistance: number): number | undefined {
    const globalLegIndex = legData.globalLegIndex.get();

    const isAltAdvisory = legData.isAltitudeAdvisory.get();
    const legConstraint = VNavUtils.getConstraintFromLegIndex(verticalPlan, globalLegIndex);
    let targetAlt = isAltAdvisory ? legData.altitude1.get().asUnit(UnitType.METER)
      : legConstraint?.type === 'climb' ? legConstraint.maxAltitude : legConstraint?.targetAltitude;

    if (targetAlt && !isFinite(targetAlt)) {
      if (legConstraint?.type === 'climb') {
        const nextConstraint = VNavUtils.getNextClimbTargetConstraint(verticalPlan, globalLegIndex);

        if (nextConstraint) {
          targetAlt = prevLegTargetAlt + ((nextConstraint.maxAltitude / nextConstraint.distance) * legDistance);
        }
      }
    }

    return targetAlt;
  }
}
