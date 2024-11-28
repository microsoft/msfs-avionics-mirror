import {
  AirportFacility, AltitudeRestrictionType, BitFlags, ClockEvents, ComponentProps, ConsumerSubject, DateTimeFormatter, DisplayComponent, DurationFormatter,
  EngineEvents, EventBus, FacilityLoader, FacilityType, FlightPlanner, FlightPlanPredictor, FSComponent, GNSSEvents, ICAO, LegDefinition, LegPredictions,
  LegType, LNavEvents, MathUtils, NumberFormatter, Subject, Subscribable, SubscribableMapFunctions, Subscription, UnitType, UserSettingManager, VerticalData,
  VerticalFlightPhase, VNavEvents, VNavUtils, VNode
} from '@microsoft/msfs-sdk';

import {
  MapSettingsMfdAliased, MFDSettingsAliased, PerformancePlanProxy, WT21_PFD_MFD_Colors, WT21FlightPlanPredictorConfiguration, WT21FmsUtils,
  WT21LegDefinitionFlags, WT21LNavDataEvents, WT21UnitsUtils, WT21VNavDataEvents
} from '@microsoft/msfs-wt21-shared';

import { BasePerformanceDataManager } from '../../../FMC/PerformanceCalculators/BasePerformanceDataManager';

import './FMSText.css';

/**
 * Props for FMSText
 */
export interface FMSTextProps extends ComponentProps {
  /** The event bus */
  bus: EventBus,

  /** The flight planner */
  planner: FlightPlanner,

  /** The facility loader */
  facLoader: FacilityLoader,

  /** The performance plan */
  performancePlanProxy: PerformancePlanProxy,

  /** The mfd setting manager */
  mfdSettingManager: UserSettingManager<MFDSettingsAliased>;

  /** The map setting manager */
  mapSettingManager: UserSettingManager<MapSettingsMfdAliased>;
}

/**
 * The FMS Text display. Displays information on the current active FROM, TO, and NEXT legs and the destination,
 * and optionally VNAV information.
 */
export class FMSText extends DisplayComponent<FMSTextProps> {
  private static readonly UPDATE_FREQ = 1; // update frequency, in hertz

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  private readonly vnavRef = FSComponent.createRef<FMSTextVNavWindow>();
  private readonly incompatibleRef = FSComponent.createRef<HTMLDivElement>();

  private readonly vnavShowSetting = this.props.mfdSettingManager.getSetting('mfdUpperFmsTextVNavShow');

  private readonly fromRowData = new FMSTextRowData();
  private readonly toRowData = new FMSTextRowData();
  private readonly nextRowData = new FMSTextRowData();
  private readonly destRowData = new FMSTextDestRowData();

  private readonly ppos = ConsumerSubject.create(null, new LatLongAlt()).pause();
  private readonly groundSpeed = ConsumerSubject.create(null, 0).pause();
  private readonly fob = ConsumerSubject.create(null, 0).pause();
  private readonly fuelFlow = ConsumerSubject.create(null, 0).pause();

  private readonly lnavIsTracking = ConsumerSubject.create(null, false).pause();
  private readonly distanceToNominalLegEgress = ConsumerSubject.create(null, NaN).pause();
  private readonly distanceToDestination = ConsumerSubject.create(null, NaN).pause();
  private readonly lnavNominalLegIndex = ConsumerSubject.create(null, -1).pause();

  private readonly flightPlanPredictor = new FlightPlanPredictor(
    this.props.bus,
    this.props.planner,
    Subject.create(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX),
    this.lnavNominalLegIndex,
    WT21FlightPlanPredictorConfiguration,
  );

  public readonly basePerformanceManager = new BasePerformanceDataManager(this.props.performancePlanProxy, this.props.bus);

  private _cachedDestinationFacility: AirportFacility | null = null;
  private _cachedDestinationFacilityIcao: string | null = null;

  private isVisible = false;
  private isCompatible = false;
  private isInit = false;

  private updateSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const sub = this.props.bus.getSubscriber<ClockEvents & GNSSEvents & EngineEvents & LNavEvents & WT21LNavDataEvents>();

    this.ppos.setConsumer(sub.on('gps-position').atFrequency(1));
    this.groundSpeed.setConsumer(sub.on('ground_speed').atFrequency(1));
    this.fob.setConsumer(sub.on('fuel_total').atFrequency(1));
    this.fuelFlow.setConsumer(sub.on('fuel_flow_total').atFrequency(1));

    this.lnavIsTracking.setConsumer(sub.on('lnav_is_tracking'));
    this.distanceToNominalLegEgress.setConsumer(sub.on('lnavdata_waypoint_distance').atFrequency(1));
    this.distanceToDestination.setConsumer(sub.on('lnavdata_destination_distance').atFrequency(1));
    this.lnavNominalLegIndex.setConsumer(sub.on('lnavdata_nominal_leg_index'));

    this.updateSub = sub.on('simTime').atFrequency(FMSText.UPDATE_FREQ).handle(this.update.bind(this), true);

    this.props.mfdSettingManager.whenSettingChanged('mfdUpperFmsTextVNavShow').handle(show => {
      this.vnavRef.instance.setVisibility(this.isVisible && show);
    });
    this.props.mapSettingManager.whenSettingChanged('hsiFormat').handle(format => {
      this.isCompatible = format === 'PPOS' || format === 'PLAN';
      this.applyVisibilityState();
    });

    this.isInit = true;
    this.applyVisibilityState();
  }

  /**
   * Sets the visibility of this display.
   * @param isVisible Whether the display is visible.
   */
  public setVisibility(isVisible: boolean): void {
    if (isVisible === this.isVisible) {
      return;
    }

    this.isVisible = isVisible;
    if (this.isInit) {
      this.applyVisibilityState();
    }
  }

  /**
   * Applies this display's visibility state. While visible, this display is shown and will update itself
   * periodically. While not visible, this display is hidden and updates are paused.
   */
  private applyVisibilityState(): void {
    this.rootRef.instance.classList.toggle('hidden', !this.isVisible);
    this.incompatibleRef.instance.classList.toggle('hidden', this.isCompatible);

    if (this.isVisible && this.isCompatible) {
      this.ppos.resume();
      this.groundSpeed.resume();
      this.fob.resume();
      this.fuelFlow.resume();

      this.lnavIsTracking.resume();
      this.distanceToNominalLegEgress.resume();
      this.distanceToDestination.resume();
      this.lnavNominalLegIndex.resume();

      this.updateSub!.resume(true);
    } else {
      this.ppos.pause();
      this.groundSpeed.pause();
      this.fob.pause();
      this.fuelFlow.pause();

      this.lnavIsTracking.pause();
      this.distanceToNominalLegEgress.pause();
      this.distanceToDestination.pause();
      this.lnavNominalLegIndex.pause();

      this.updateSub!.pause();
    }

    this.vnavRef.instance.setVisibility(this.isVisible && this.isCompatible && this.vnavShowSetting.value);
  }

  /**
   * Updates this display with the latest flight plan information.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   */
  private update(simTime: number): void {
    this.flightPlanPredictor.update();

    if (!this.flightPlanPredictor.planAndPredictionsValid) {
      this.fromRowData.reset();
      this.toRowData.reset();
      this.nextRowData.reset();
      this.destRowData.reset();
      return;
    }

    const plan = this.props.planner.getFlightPlan(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX);

    const lnavEffectiveLegIndex = this.lnavNominalLegIndex.get();

    const toLeg = plan.tryGetLeg(lnavEffectiveLegIndex);
    const fromLegIndex = lnavEffectiveLegIndex - (BitFlags.isAll(toLeg?.flags ?? 0, WT21LegDefinitionFlags.DirectTo) ? 4 : 1);
    const nextLegIndex = lnavEffectiveLegIndex + 1;

    let fromLeg: LegDefinition | null = null;
    let nextLeg: LegDefinition | null = null;

    for (const leg of plan.legs(true, fromLegIndex)) {
      if (leg.leg.type !== LegType.Discontinuity) {
        fromLeg = leg;
        break;
      }
    }

    for (const leg of plan.legs(false, nextLegIndex)) {
      if (leg.leg.type !== LegType.Discontinuity) {
        nextLeg = leg;
        break;
      }
    }

    const unixDayStartMs = simTime - (simTime % (1000 * 60 * 60 * 24));

    const fromLegPredictions = fromLeg && this.flightPlanPredictor.predictionsForLeg(fromLeg);

    if (fromLeg && fromLegPredictions) {
      this.fromRowData.ident.set(fromLeg.name ?? '-----');
      this.fromRowData.distance.set(fromLegPredictions.distance);
    } else {
      this.fromRowData.reset();
    }

    const toLegPredictions = toLeg && this.flightPlanPredictor.predictionsForLeg(toLeg);

    if (toLeg && toLegPredictions) {
      this.toRowData.ident.set(toLeg.name ?? '-----');
      this.toRowData.distance.set(toLegPredictions.distance);
      this.toRowData.ete.set(toLegPredictions.estimatedTimeEnroute / 60);
      this.toRowData.eta.set(unixDayStartMs + toLegPredictions.estimatedTimeOfArrival * 1000);
    } else {
      this.toRowData.reset();
    }

    const nextLegPredictions = nextLeg && this.flightPlanPredictor.predictionsForLeg(nextLeg);

    if (nextLeg && nextLegPredictions) {
      this.nextRowData.ident.set(nextLeg.name ?? '-----');
      this.nextRowData.distance.set(nextLegPredictions.distance);
      this.nextRowData.ete.set(nextLegPredictions.estimatedTimeEnroute / 60);
      this.nextRowData.eta.set(unixDayStartMs + nextLegPredictions.estimatedTimeOfArrival * 1000);
    } else {
      this.nextRowData.reset();
    }

    if (plan.destinationAirport && plan.destinationAirport !== this._cachedDestinationFacilityIcao) {
      this._cachedDestinationFacility = null;

      this.props.facLoader.getFacility(FacilityType.Airport, plan.destinationAirport).then((facility) => {
        this._cachedDestinationFacility = facility;
        this._cachedDestinationFacilityIcao = facility.icao;
      });
    }

    const airport = this._cachedDestinationFacility;
    const destinationPredictions = airport && this.flightPlanPredictor.getDestinationPrediction(airport);

    if (airport && destinationPredictions) {
      this.destRowData.ident.set(ICAO.getIdent(airport.icao));
      this.destRowData.distance.set(destinationPredictions.distance);
      this.destRowData.ete.set(destinationPredictions.estimatedTimeEnroute / 60);
      this.destRowData.eta.set(unixDayStartMs + destinationPredictions.estimatedTimeOfArrival * 1000);

      if (destinationPredictions.fob !== null) {
        this.destRowData.fod.set(destinationPredictions.fob);
        this.destRowData.landingWeight.set((this.basePerformanceManager.zfw.get() ?? 10280) + destinationPredictions.fob);
      } else {
        this.destRowData.fod.set(NaN);
        this.destRowData.landingWeight.set(NaN);
      }
    } else {
      this.destRowData.reset();
    }

    this.vnavRef.instance.update();
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class='fms-text-container' ref={this.rootRef}>
        <FMSTextRow color={WT21_PFD_MFD_Colors.cyan} ident={this.fromRowData.ident} distance={this.fromRowData.distance}
          eta={this.fromRowData.eta} />
        <FMSTextRow color={WT21_PFD_MFD_Colors.magenta} ident={this.toRowData.ident} distance={this.toRowData.distance}
          ete={this.toRowData.ete} eta={this.toRowData.eta} />
        <FMSTextRow color={WT21_PFD_MFD_Colors.white} ident={this.nextRowData.ident}
          distance={this.nextRowData.distance} ete={this.nextRowData.ete} eta={this.nextRowData.eta} />
        <FMSTextDestRow
          color={WT21_PFD_MFD_Colors.white} ident={this.destRowData.ident} distance={this.destRowData.distance}
          ete={this.destRowData.ete} eta={this.destRowData.eta}
          fod={this.destRowData.fod} landingWeight={this.destRowData.landingWeight}
        />
        <FMSTextVNavWindow
          ref={this.vnavRef}
          bus={this.props.bus}
          planner={this.props.planner}
          performancePlanProxy={this.props.performancePlanProxy}
          predictor={this.flightPlanPredictor}
        />
        <div ref={this.incompatibleRef} class='fms-text-incompatible'>
          <div>FMS TEXT INCOMPATIBLE</div>
        </div>
      </div>
    );
  }
}

/**
 * Data for a flight plan leg row on the FMS Text display.
 */
class FMSTextRowData {
  /** The ident string of the row's leg. */
  public readonly ident = Subject.create('----');

  /** The distance to the row's leg's terminator waypoint, in nautical miles. */
  public readonly distance = Subject.create(NaN);

  /** The estimated time enroute to the row's leg's terminator waypoint, in minutes. */
  public readonly ete = Subject.create(NaN);

  /** The estimated time of arrival to the row's leg's terminator waypoint, as a UNIX timestamp in milliseconds. */
  public readonly eta = Subject.create(NaN);

  /**
   * Resets all data contained in this data object. Ident is set to a default string, and all numeric fields are set
   * to `NaN`.
   */
  public reset(): void {
    this.ident.set('----');
    this.distance.set(NaN);
    this.ete.set(NaN);
    this.eta.set(NaN);
  }
}

/**
 * Data for the destination row on the FMS Text display.
 */
class FMSTextDestRowData extends FMSTextRowData {
  /** The estimated fuel remaining over the destination, in pounds. */
  public readonly fod = Subject.create(NaN);

  /** The estimated landing weight, in pounds. */
  public readonly landingWeight = Subject.create(NaN);

  /** @inheritdoc */
  public reset(): void {
    super.reset();

    this.fod.set(NaN);
    this.landingWeight.set(NaN);
  }
}

/**
 * Component props for FMSTextRow.
 */
interface FMSTextRowProps extends ComponentProps {
  /** The color of the row's text. */
  color: string;

  /** A subscribable which provides the ident string for the row's leg. */
  ident: Subscribable<string>;

  /** A subscribable which provides the distance to the row's leg's terminator waypoint, in nautical miles. */
  distance: Subscribable<number>;

  /**
   * A subscribable which provides the estimated time enroute to the row's leg's terminator waypoint, in minutes. If
   * not defined, the row will not display the ETE field.
   */
  ete?: Subscribable<number>;

  /**
   * A subscribable which provides the estimated time of arrival to the row's leg's terminator waypoint, as a UNIX
   * timestamp in milliseconds.
   */
  eta: Subscribable<number>;
}

/**
 * A flight plan leg row in the FMS Text display.
 */
class FMSTextRow<P extends FMSTextRowProps> extends DisplayComponent<P> {
  protected static readonly DISTANCE_FORMATTER = NumberFormatter.create({
    precision: 0.1,
    maxDigits: 3,
    nanString: '----',
  });
  protected static readonly DURATION_FORMATTER = DurationFormatter.create('{h}:{mm}', UnitType.MINUTE, 0, '--:--');
  protected static readonly TIME_FORMATTER = DateTimeFormatter.create('{HH}:{mm}', { nanString: '--:--' });

  protected readonly eteRoundedSub = this.props.ete?.map(Math.ceil);

  protected readonly identTextSub = this.props.ident.map(SubscribableMapFunctions.identity());
  protected readonly distanceTextSub = this.props.distance.map(distance => `${FMSTextRow.DISTANCE_FORMATTER(distance)}NM`);
  protected readonly eteTextSub = this.eteRoundedSub?.map(FMSTextRow.DURATION_FORMATTER);
  protected readonly etaTextSub = this.props.eta.map(FMSTextRow.TIME_FORMATTER);

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='fms-text-row' style={`color: ${this.props.color}`}>
        <div>{this.identTextSub}</div>
        <div class='fms-text-row-right-align'>{this.distanceTextSub}</div>
        <div class='fms-text-row-right-align'>{this.eteTextSub ?? null}</div>
        <div class='fms-text-row-right-align'>{this.etaTextSub}</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.eteRoundedSub?.destroy();

    this.identTextSub.destroy();
    this.distanceTextSub.destroy();
    this.etaTextSub.destroy();
  }
}

/**
 * Component props for FMSTextDestRow.
 */
interface FMSTextDestRowProps extends FMSTextRowProps {
  /** A subscribable which provides the estimated fuel remaining over the destination, in pounds. */
  fod: Subscribable<number>;

  /** A subscribable which provides the estimated landing weight, in pounds. */
  landingWeight: Subscribable<number>;
}

/**
 * A destination leg row in the FMS Text display.
 */
class FMSTextDestRow extends FMSTextRow<FMSTextDestRowProps> {
  private readonly fodTextSub = this.props.fod.map(fod => {
    const isMetric = WT21UnitsUtils.getIsMetric();
    const fuelUnit = isMetric ? WT21UnitsUtils.getUnitString(UnitType.KILOGRAM) : WT21UnitsUtils.getUnitString(UnitType.POUND);

    return `${isNaN(fod) ? '----' : isMetric ? UnitType.POUND.convertTo(fod, UnitType.KILOGRAM).toFixed(0) : fod.toFixed(0)} ${fuelUnit}`;
  });

  private readonly landingWeightSub = this.props.landingWeight.map(lw => {
    const isMetric = WT21UnitsUtils.getIsMetric();

    return `${isNaN(lw) ? '----' : isMetric ? (UnitType.POUND.convertTo(lw, UnitType.KILOGRAM) / 1000).toFixed(1) : (lw / 1000).toFixed(1)} GW`;
  });

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='fms-text-row' style={`color: ${this.props.color}`}>
        <div>{this.identTextSub}</div>
        <div class='fms-text-row-right-align'>{this.distanceTextSub}</div>
        <div class='fms-text-row-right-align'>{this.eteTextSub ?? null}</div>
        <div class='fms-text-row-right-align'>{this.etaTextSub}</div>
        <div class='fms-text-row-right-align'>{this.fodTextSub}</div>
        <div class='fms-text-row-right-align'>{this.landingWeightSub}</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.fodTextSub.destroy();
    this.landingWeightSub.destroy();
  }
}

/**
 * Component props for FMSTextVNavWindow.
 */
interface FMSTextVnavWindowProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The flight planner. */
  planner: FlightPlanner,

  /**
   * The performance plan
   */
  performancePlanProxy: PerformancePlanProxy,

  /**
   * The flight plan predictor
   */
  predictor: FlightPlanPredictor,
}

/**
 * The FMS Text VNAV window. Displays information on the current VNAV situation, including distance/time to TOD,
 * next altitude constraint, and name and distance/time to the next VNAV waypoint.
 */
class FMSTextVNavWindow extends DisplayComponent<FMSTextVnavWindowProps> {
  private static readonly DURATION_FORMATTER = DurationFormatter.create('{h}:{mm}', UnitType.MINUTE, 0);

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private readonly todTextSub = Subject.create('');
  private readonly todTimeDistanceTextSub = Subject.create('');
  private readonly waypointTypeTextSub = Subject.create('');
  private readonly vpaTextSub = Subject.create('');
  private readonly waypointIdentTextSub = Subject.create('');
  private readonly waypointConstraintTextSub = Subject.create('');
  private readonly waypointTimeDistanceTextSub = Subject.create('');

  private readonly ppos = ConsumerSubject.create(null, new LatLongAlt()).pause();
  private readonly groundSpeed = ConsumerSubject.create(null, 0).pause();

  private readonly todDistance = ConsumerSubject.create(null, -1).pause();
  private readonly bodDistance = ConsumerSubject.create(null, -1).pause();
  private readonly todLegIndex = ConsumerSubject.create(null, -1).pause();
  private readonly nextConstraintLegIndex = ConsumerSubject.create(null, -1).pause();
  private readonly vpa = ConsumerSubject.create(null, 0).pause();
  private readonly vsr = ConsumerSubject.create(null, 0).pause();

  private readonly desAdvisoryDistance = ConsumerSubject.create(null, -1).pause();
  private readonly desAdvisoryLegIndex = ConsumerSubject.create(null, -1).pause();


  private isVisible = false;
  private isInit = false;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.isInit = true;

    const sub = this.props.bus.getSubscriber<GNSSEvents & VNavEvents & WT21VNavDataEvents>();

    this.ppos.setConsumer(sub.on('gps-position').atFrequency(1));
    this.groundSpeed.setConsumer(sub.on('ground_speed').atFrequency(1));

    this.todDistance.setConsumer(sub.on('vnav_tod_distance').atFrequency(1));
    this.bodDistance.setConsumer(sub.on('vnav_bod_distance').atFrequency(1));
    this.todLegIndex.setConsumer(sub.on('vnav_tod_global_leg_index').whenChanged());

    this.nextConstraintLegIndex.setConsumer(sub.on('vnav_constraint_global_leg_index').atFrequency(1));
    this.vpa.setConsumer(sub.on('vnav_fpa').atFrequency(1));
    this.vsr.setConsumer(sub.on('vnav_required_vs').atFrequency(1).withPrecision(-2));

    this.desAdvisoryDistance.setConsumer(sub.on('wt21vnav_des_advisory_distance').atFrequency(1));
    this.desAdvisoryLegIndex.setConsumer(sub.on('wt21vnav_des_advisory_global_leg_index').whenChanged());

    this.applyVisibilityState();
  }

  /**
   * Sets the visibility of this display.
   * @param isVisible Whether the display is visible.
   */
  public setVisibility(isVisible: boolean): void {
    if (isVisible === this.isVisible) {
      return;
    }

    this.isVisible = isVisible;
    if (this.isInit) {
      this.applyVisibilityState();
    }
  }

  /**
   * Applies this display's visibility state. While visible, this display is shown and will update itself
   * periodically. While not visible, this display is hidden and updates are paused.
   */
  private applyVisibilityState(): void {
    this.rootRef.instance.classList.toggle('hidden', !this.isVisible);

    if (this.isVisible) {
      this.ppos.resume();
      this.groundSpeed.resume();

      this.todDistance.resume();
      this.bodDistance.resume();
      this.todLegIndex.resume();
      this.nextConstraintLegIndex.resume();
      this.vpa.resume();
      this.vsr.resume();
      this.desAdvisoryDistance.resume();
      this.desAdvisoryLegIndex.resume();
    } else {
      this.ppos.pause();
      this.groundSpeed.pause();

      this.todDistance.pause();
      this.bodDistance.pause();
      this.todLegIndex.pause();
      this.nextConstraintLegIndex.pause();
      this.vpa.pause();
      this.vsr.pause();
      this.desAdvisoryDistance.pause();
      this.desAdvisoryLegIndex.pause();
    }
  }

  /**
   * Updates this display with the latest VNAV information.
   */
  public update(): void {
    let resetTodInfo = true;
    let resetWaypointTypeInfo = true;
    let resetWaypointInfo = true;

    if (this.props.planner.hasFlightPlan(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX)) {
      const plan = this.props.planner.getFlightPlan(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX);

      const gs = Math.max(150, this.groundSpeed.get());

      const todDistanceMeters = this.todDistance.get();
      const desAdvisoryDistanceMeters = this.desAdvisoryDistance.get();

      let showConstraintInfo = false;

      if (todDistanceMeters <= 100) {
        const bodDistance = this.bodDistance.get();
        if (bodDistance > 0) {
          // We are in a descent segment

          resetTodInfo = false;
          showConstraintInfo = true;

          this.todTextSub.set('');
          this.todTimeDistanceTextSub.set('');
        } else {
          // There is no next TOD

          if (desAdvisoryDistanceMeters >= 0
            && this.desAdvisoryLegIndex.get() >= 0) {
            // Show DES advisory

            resetTodInfo = false;
            resetWaypointTypeInfo = false;
            resetWaypointInfo = true;

            const desAdvisoryDistanceNM = UnitType.METER.convertTo(desAdvisoryDistanceMeters, UnitType.NMILE);
            const timeRemainingMin = UnitType.HOUR.convertTo(desAdvisoryDistanceNM / gs, UnitType.MINUTE);

            this.todTextSub.set('DES');
            this.todTimeDistanceTextSub.set(`${FMSTextVNavWindow.DURATION_FORMATTER(Math.ceil(timeRemainingMin))}/${desAdvisoryDistanceNM.toFixed(1)}NM`);
            this.waypointTypeTextSub.set('ADVISORY');
            this.vpaTextSub.set('');
          }
        }
      } else if (this.todLegIndex.get() >= 0) {
        // We are before the first TOD, or in a flat segment with an upcoming TOD.

        resetTodInfo = false;
        showConstraintInfo = true;

        const todDistanceNM = UnitType.METER.convertTo(todDistanceMeters, UnitType.NMILE);
        const timeRemainingMin = UnitType.HOUR.convertTo(todDistanceNM / gs, UnitType.MINUTE);

        this.todTextSub.set('TOD');
        this.todTimeDistanceTextSub.set(`${FMSTextVNavWindow.DURATION_FORMATTER(Math.ceil(timeRemainingMin))}/${todDistanceNM.toFixed(1)}NM`);
      }

      if (showConstraintInfo) {
        const nextConstraintLegIndex = this.nextConstraintLegIndex.get();
        const vnavWaypointLeg = plan.tryGetLeg(nextConstraintLegIndex);
        if (vnavWaypointLeg) {
          resetWaypointInfo = false;
          resetWaypointTypeInfo = false;

          let waypointPrediction: LegPredictions | null = null;
          if (nextConstraintLegIndex >= plan.activeLateralLeg) {
            waypointPrediction = this.props.predictor.predictionsForLegIndex(nextConstraintLegIndex);
          }

          const isClimb = vnavWaypointLeg.verticalData.phase === VerticalFlightPhase.Climb;
          // HINT: not exactly accurate
          if (isClimb) {
            resetTodInfo = true;
          }
          const vsr = this.vsr.get();
          const requiredFpa = MathUtils.clamp(Math.abs(VNavUtils.getFpaFromVerticalSpeed(vsr, gs)), 0, 6);
          this.vpaTextSub.set(Math.abs(vsr) < 100 ? '' : `${requiredFpa.toFixed(1)}°   ${Math.abs(vsr)}↓`);

          this.waypointTypeTextSub.set(isClimb ? 'CLIMB' : 'DIRECT');
          this.waypointIdentTextSub.set(vnavWaypointLeg.name ?? '');
          this.waypointConstraintTextSub.set(FMSTextVNavWindow.formatAltitudeConstraint(vnavWaypointLeg.verticalData,
            this.props.performancePlanProxy.transitionAltitude.get() ?? 18000));

          if (waypointPrediction) {
            const timeRemainingMin = UnitType.SECOND.convertTo(waypointPrediction.estimatedTimeEnroute, UnitType.MINUTE);

            this.waypointTimeDistanceTextSub.set(`${FMSTextVNavWindow.DURATION_FORMATTER(Math.ceil(timeRemainingMin))}/${waypointPrediction.distance.toFixed(1)}NM`);
          } else {
            this.waypointTimeDistanceTextSub.set('');
          }
        }
      }
    }

    if (resetTodInfo) {
      this.todTextSub.set('');
      this.todTimeDistanceTextSub.set('');
      this.vpaTextSub.set('');
    }

    if (resetWaypointTypeInfo) {
      this.waypointTypeTextSub.set('');
    }

    if (resetWaypointInfo) {
      this.waypointIdentTextSub.set('');
      this.waypointConstraintTextSub.set('');
      this.waypointTimeDistanceTextSub.set('');
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.rootRef} class='fms-text-vnav'>
        <div class='fms-text-vnav-divider'>:</div>
        <div>{this.todTextSub}</div>
        <div>{this.todTimeDistanceTextSub}</div>
        <div class='fms-text-vnav-divider'>:</div>
        <div>{this.waypointTypeTextSub}</div>
        <div>{this.vpaTextSub}</div>
        <div class='fms-text-vnav-divider'>:</div>
        <div>{this.waypointIdentTextSub}</div>
        <div>{this.waypointConstraintTextSub}</div>
        <div class='fms-text-vnav-divider'>:</div>
        <div></div>
        <div>{this.waypointTimeDistanceTextSub}</div>
      </div>
    );
  }

  /**
   * Formats an altitude constraint for display.
   * @param constraint An altitude constraint.
   * @param transitionAltitude The transition altitude, in feet.
   * @returns A formatted altitude constraint.
   */
  private static formatAltitudeConstraint(constraint: VerticalData, transitionAltitude: number): string {
    switch (constraint.altDesc) {
      case AltitudeRestrictionType.At:
        return WT21FmsUtils.parseAltitudeForDisplay(constraint.altitude1, transitionAltitude);
      case AltitudeRestrictionType.AtOrAbove:
        return `${WT21FmsUtils.parseAltitudeForDisplay(constraint.altitude1, transitionAltitude)}A`;
      case AltitudeRestrictionType.AtOrBelow:
        return `${WT21FmsUtils.parseAltitudeForDisplay(constraint.altitude1, transitionAltitude)}B`;
      case AltitudeRestrictionType.Between:
        return `${WT21FmsUtils.parseAltitudeForDisplay(constraint.altitude2, transitionAltitude)}A${WT21FmsUtils.parseAltitudeForDisplay(constraint.altitude1, transitionAltitude)}B`;
      default:
        return '-----';
    }
  }
}
