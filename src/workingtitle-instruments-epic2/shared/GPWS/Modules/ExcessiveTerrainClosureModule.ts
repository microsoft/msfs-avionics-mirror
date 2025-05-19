/* eslint-disable @typescript-eslint/no-unused-vars */
import { ConsumerValue, ControlSurfacesEvents, EventBus, LerpLookupTable, MultiExpSmoother, SoundPacket, SoundServerController } from '@microsoft/msfs-sdk';

import { AirspeedDataProvider, VerticalDeviationDataProvider } from '../../Instruments';
import { GpwsAlertController, GpwsAlertDefinition, GpwsVisualAlertType } from '../GpwsAlertController';
import { GpwsAlertPriority } from '../GpwsAlertPriorities';
import { GpwsData, GpwsModule } from '../GpwsModule';
import { GpwsOperatingMode } from '../GpwsTypes';

/**
 * A GPWS module which handles Mode 2 Excessive Closure to Terrain callouts.
 */
export class ExcessiveTerrainClosureModule implements GpwsModule {
  private static readonly PULL_UP_ALERT_ID = 'etc-pull-up';
  private static readonly TERRAIN_ALERT_ID = 'etc-terrain';

  private static readonly PULL_UP_SOUND_PACKET: SoundPacket = { key: 'etc-pull-up', sequence: ['aural_pull_up'], continuous: true };
  private static readonly TERRAIN_SOUND_PACKET: SoundPacket = { key: 'etc-terrain', sequence: ['aural_terrain_terrain'], continuous: false };

  private static readonly PULL_UP_ALERT_DEFINITION: GpwsAlertDefinition = {
    visualAlertType: GpwsVisualAlertType.PullUp,
    auralAlert: ExcessiveTerrainClosureModule.PULL_UP_SOUND_PACKET,
    priority: GpwsAlertPriority.Mode2PullUp
  };
  private static readonly TERRAIN_ALERT_DEFINITION: GpwsAlertDefinition = {
    visualAlertType: GpwsVisualAlertType.GroundProximity,
    auralAlert: ExcessiveTerrainClosureModule.TERRAIN_SOUND_PACKET,
    priority: GpwsAlertPriority.Mode2Terrain
  };

  protected static readonly TERRAIN_WARNING_REGION = new LerpLookupTable([[-1031, 0], [-5007, 2450], [-Infinity, 2451]]);
  protected static readonly PULL_UP_WARNING_REGION = new LerpLookupTable([[-1500, 0], [-1765, 346], [-10000, 1958], [-Infinity, 1959]]);
  protected static readonly TERRAIN_WARNING_STEEP_APPR_BIAS = 300;
  protected static readonly PULL_UP_WARNING_STEEP_APPR_BIAS = 200;

  /** Terrain, terrain caution region - before applying boundaries based on speed */
  protected static readonly CAUTION_REGION_BEFORE_SPEED_LIMIT = new LerpLookupTable([[-1750, 0], [-3500, 1300], [-4900, 1650], [-10000, 2450]]);
  protected static readonly CAUTION_REGION_SPEED_LIMIT = new LerpLookupTable([[1650, 0], [1650, 190], [2450, 310]]);
  protected static readonly WARNING_REGION = new LerpLookupTable([[-2000, 0], [-3750, 1300], [-8000, 1400], [-10000, 1450]]);

  private static readonly RADAR_ALT_CLOSURE_SMOOTHING_TAU = Math.LN2;
  private static readonly RADAR_ALT_MODE_LOWER_LIMIT = 30;

  private readonly gearPosition = ConsumerValue.create(this.bus.getSubscriber<ControlSurfacesEvents>().on('gear_position_2'), 0);
  private readonly flapHandleIndex = ConsumerValue.create(this.bus.getSubscriber<ControlSurfacesEvents>().on('flaps_handle_index'), 0);
  private readonly ias = this.airspeedDataProvider.cas;

  private readonly radarAltitudeClosure = new MultiExpSmoother(ExcessiveTerrainClosureModule.RADAR_ALT_CLOSURE_SMOOTHING_TAU, undefined, undefined, null, null, null, 10000);

  private lastTerrainTimeToImpact: number | null = null;
  private lastRealTime: number | null = null;
  private lastAgl: number | null = null;
  private lastTimeOnGround: number | null = null;

  /**
   * Creates a new instance of TouchdownCalloutModule.
   * @param bus The event bus.
   * @param alertController The alert controller
   * @param airspeedDataProvider The aircraft airspeed data provider
   * @param verticalDeviationDataProvider The aircraft vertical deviation data provider
   */
  constructor(
    private readonly bus: EventBus,
    private readonly alertController: GpwsAlertController,
    private readonly airspeedDataProvider: AirspeedDataProvider,
    private readonly verticalDeviationDataProvider: VerticalDeviationDataProvider
  ) {
  }

  /** @inheritdoc */
  public onInit(): void {
    this.alertController.registerAlert(ExcessiveTerrainClosureModule.PULL_UP_ALERT_ID, ExcessiveTerrainClosureModule.PULL_UP_ALERT_DEFINITION);
    this.alertController.registerAlert(ExcessiveTerrainClosureModule.TERRAIN_ALERT_ID, ExcessiveTerrainClosureModule.TERRAIN_ALERT_DEFINITION);
  }

  /** @inheritdoc */
  public onUpdate(operatingMode: GpwsOperatingMode, data: Readonly<GpwsData>, realTime: number): void {
    if (data.isOnGround === true) {
      this.lastTimeOnGround = realTime;
    }
    if (operatingMode !== GpwsOperatingMode.Normal || data.isOnGround || data.radarAltitude > 2500) {
      return;
    }

    if (this.lastRealTime === null) {
      this.lastRealTime = realTime;
    }
    if (this.lastAgl === null) {
      this.radarAltitudeClosure;
      this.lastAgl = data.radarAltitude;
    }

    const dt = (realTime - this.lastRealTime) / 1000;

    const flapsInLandingConfig = this.flapHandleIndex.get() !== 0 || data.inhibits.flaps === true;
    if (data.isRadarAltitudeValid && data.radarAltitude > ExcessiveTerrainClosureModule.RADAR_ALT_MODE_LOWER_LIMIT) {
      const rawClosureRate = (data.radarAltitude - this.lastAgl) * 60 / dt;
      const closureRate = this.radarAltitudeClosure.next(isNaN(rawClosureRate) ? 0 : rawClosureRate, dt);

      let terrainActive = false;
      let pullUpActive = false;

      const gsDeviation = this.verticalDeviationDataProvider.gsApproachPointerDeviation.get();
      if (
        (this.lastTimeOnGround && Math.abs(realTime - this.lastTimeOnGround) < 60000) || (flapsInLandingConfig) || (gsDeviation && Math.abs(gsDeviation) < 0.5)
      ) {
        // Use Mode 2B if 60seconds since takeoff, flaps extended (we assume this is landing configuration) or within 2 dots of localizer
        // Mode 2B has a lower maximum cutoff (789ft), inhibits PULL UP if gear is down, and has a higher minimum cutoff if flaps extended

        const altInhibit = data.radarAltitude < 789 && (flapsInLandingConfig ? data.radarAltitude > 200 : data.radarAltitude > 30);

        terrainActive = altInhibit ? ExcessiveTerrainClosureModule.isAircraftInCautionRegion(0, data.radarAltitude, closureRate) : false;
        pullUpActive = altInhibit && this.gearPosition.get() < 1 ? ExcessiveTerrainClosureModule.isAircraftInWarningRegion(data.radarAltitude, closureRate) : false;
      } else {
        // Otherwise use Mode 2A
        terrainActive = ExcessiveTerrainClosureModule.isAircraftInCautionRegion(this.ias.get() ?? 310, data.radarAltitude, closureRate);
        pullUpActive = ExcessiveTerrainClosureModule.isAircraftInWarningRegion(data.radarAltitude, closureRate);
      }

      if (pullUpActive) {
        this.alertController.triggerAlert(ExcessiveTerrainClosureModule.PULL_UP_ALERT_ID);
      } else {
        this.alertController.untriggerAlert(ExcessiveTerrainClosureModule.PULL_UP_ALERT_ID);

        if (terrainActive) {
          const timeToImpact = Math.abs(data.radarAltitude / closureRate);
          if (this.lastTerrainTimeToImpact === null || timeToImpact < 0.8 * this.lastTerrainTimeToImpact) {
            if (this.lastTerrainTimeToImpact === null) {
              this.alertController.triggerAlert(ExcessiveTerrainClosureModule.TERRAIN_ALERT_ID);
            } else {
              this.alertController.triggerAuralAlert(ExcessiveTerrainClosureModule.TERRAIN_ALERT_ID);
            }

            this.lastTerrainTimeToImpact = timeToImpact;
          }
        } else {
          this.alertController.untriggerAlert(ExcessiveTerrainClosureModule.TERRAIN_ALERT_ID);
        }
      }

      this.lastAgl = data.radarAltitude;
    }

    this.lastRealTime = realTime;
  }

  /**
   * Whether the aircraft is currently within the caution (terrain-terrain) region
   * @param ias The aircraft airspeed
   * @param radarAlt The current radar altitude
   * @param closureRate The terrain closure rate, in fpm.
   * @returns Whether the aircraft is in the Terrain, Terrain caution region
   */
  protected static isAircraftInCautionRegion(ias: number, radarAlt: number, closureRate: number): boolean {
    const iasUpperBoundary = ExcessiveTerrainClosureModule.CAUTION_REGION_SPEED_LIMIT.get(ias);
    const warningClosureRate = ExcessiveTerrainClosureModule.CAUTION_REGION_BEFORE_SPEED_LIMIT.get(Math.min(radarAlt, iasUpperBoundary));

    return closureRate < warningClosureRate;
  }


  /**
   * Whether the aircraft is currently within the warning (pull up-pull up) region
   * @param radarAlt The current radar altitude
   * @param closureRate The terrain closure rate, in fpm.
   * @returns Whether the aircraft is in the Pull Up, Pull warning region
   */
  protected static isAircraftInWarningRegion(radarAlt: number, closureRate: number): boolean {
    const warningClosureRate = ExcessiveTerrainClosureModule.CAUTION_REGION_BEFORE_SPEED_LIMIT.get(radarAlt);

    return closureRate < warningClosureRate;
  }

  /** @inheritdoc */
  public onDestroy(): void {
    // noop
  }
}
