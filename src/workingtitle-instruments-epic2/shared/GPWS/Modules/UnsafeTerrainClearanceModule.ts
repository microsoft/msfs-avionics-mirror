/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConsumerValue, ControlSurfacesEvents, EventBus, LerpLookupTable, Lookahead, MathUtils, MultiExpSmoother, SimpleMovingAverage, SoundPacket,
  SoundServerController
} from '@microsoft/msfs-sdk';

import { AirspeedDataProvider } from '../../Instruments';
import { GpwsAlertController, GpwsAlertDefinition, GpwsVisualAlertType } from '../GpwsAlertController';
import { GpwsAlertPriority } from '../GpwsAlertPriorities';
import { GpwsData, GpwsModule } from '../GpwsModule';
import { GpwsOperatingMode } from '../GpwsTypes';

/**
 * A GPWS module which handles Mode 4 Unsafe Terrain Clearance alerts.
 */
export class UnsafeTerrainClearanceModule implements GpwsModule {
  private static readonly TOO_LOW_TERRAIN_ALERT_ID = 'utc-too-low-terrain';
  private static readonly TOO_LOW_TERRAIN_SOUND_PACKET: SoundPacket = { key: UnsafeTerrainClearanceModule.TOO_LOW_TERRAIN_ALERT_ID, sequence: ['aural_too_low_terrain'], continuous: true };
  private static readonly TOO_LOW_TERRAIN_ALERT_DEFINITION: GpwsAlertDefinition = {
    visualAlertType: GpwsVisualAlertType.GroundProximity,
    auralAlert: UnsafeTerrainClearanceModule.TOO_LOW_TERRAIN_SOUND_PACKET,
    priority: GpwsAlertPriority.Mode4TooLowTerrain
  };
  private static readonly TOO_LOW_GEAR_ALERT_ID = 'utc-too-low-gear';
  private static readonly TOO_LOW_GEAR_SOUND_PACKET: SoundPacket = { key: UnsafeTerrainClearanceModule.TOO_LOW_GEAR_ALERT_ID, sequence: ['aural_too_low_gear'], continuous: true };
  private static readonly TOO_LOW_GEAR_ALERT_DEFINITION: GpwsAlertDefinition = {
    visualAlertType: GpwsVisualAlertType.GroundProximity,
    auralAlert: UnsafeTerrainClearanceModule.TOO_LOW_GEAR_SOUND_PACKET,
    priority: GpwsAlertPriority.Mode4TooLowGear
  };
  private static readonly TOO_LOW_FLAPS_ALERT_ID = 'utc-too-low-flaps';
  private static readonly TOO_LOW_FLAPS_SOUND_PACKET: SoundPacket = { key: UnsafeTerrainClearanceModule.TOO_LOW_FLAPS_ALERT_ID, sequence: ['aural_too_low_flaps'], continuous: true };
  private static readonly TOO_LOW_FLAPS_ALERT_DEFINITION: GpwsAlertDefinition = {
    visualAlertType: GpwsVisualAlertType.GroundProximity,
    auralAlert: UnsafeTerrainClearanceModule.TOO_LOW_FLAPS_SOUND_PACKET,
    priority: GpwsAlertPriority.Mode4TooLowFlaps
  };

  private static readonly TOO_LOW_GEAR_4A_BOUNDARY_KTS = 148;
  private static readonly TOO_LOW_GEAR_4A_BOUNDARY_AGL = 500;
  private static readonly TOO_LOW_TERRAIN_4A_BOUNDARY_KTS = 170;
  private static readonly TOO_LOW_TERRAIN_4A_BOUNDARY_AGL = 750;

  private static readonly TOO_LOW_FLAPS_4B_BOUNDARY_KTS = 120;
  private static readonly TOO_LOW_FLAPS_4B_BOUNDARY_AGL = 170;
  private static readonly TOO_LOW_TERRAIN_4B_BOUNDARY_KTS = 170;
  private static readonly TOO_LOW_TERRAIN_4B_BOUNDARY_AGL = 750;

  private readonly gearPosition = ConsumerValue.create(this.bus.getSubscriber<ControlSurfacesEvents>().on('gear_position_2'), 0);
  private readonly flapHandleIndex = ConsumerValue.create(this.bus.getSubscriber<ControlSurfacesEvents>().on('flaps_handle_index'), 0);
  private readonly ias = this.airspeedDataProvider.cas;

  private readonly modeCRadioAltSmoother = new MultiExpSmoother(10 / Math.LN2, undefined, undefined, null, null, null, 10000);

  private lastRealTime: number | null = null;

  private tooLowTerrainActive = false;
  private tooLowFlapsActive = false;
  private tooLowGearActive = false;

  /**
   * Creates a new instance of TouchdownCalloutModule.
   * @param bus The event bus.
   * @param alertController The alert controller
   * @param airspeedDataProvider The aircrafts airspeed data provider
   */
  constructor(
    private readonly bus: EventBus,
    private readonly alertController: GpwsAlertController,
    private readonly airspeedDataProvider: AirspeedDataProvider,
  ) {
  }

  /** @inheritdoc */
  public onInit(): void {
    this.alertController.registerAlert(UnsafeTerrainClearanceModule.TOO_LOW_TERRAIN_ALERT_ID, UnsafeTerrainClearanceModule.TOO_LOW_TERRAIN_ALERT_DEFINITION);
    this.alertController.registerAlert(UnsafeTerrainClearanceModule.TOO_LOW_GEAR_ALERT_ID, UnsafeTerrainClearanceModule.TOO_LOW_GEAR_ALERT_DEFINITION);
    this.alertController.registerAlert(UnsafeTerrainClearanceModule.TOO_LOW_FLAPS_ALERT_ID, UnsafeTerrainClearanceModule.TOO_LOW_FLAPS_ALERT_DEFINITION);
  }

  /** @inheritdoc */
  public onUpdate(operatingMode: GpwsOperatingMode, data: Readonly<GpwsData>, realTime: number): void {
    const dt = this.lastRealTime && (realTime - this.lastRealTime) / 1000;
    this.lastRealTime = realTime;

    const landingFlaps = this.flapHandleIndex.get() !== 0 || data.inhibits.flaps === true;
    const gearDown = this.gearPosition.get() === 1;
    const ias = this.ias.get();

    this.tooLowFlapsActive = false;
    this.tooLowGearActive = false;
    this.tooLowTerrainActive = false;

    if (operatingMode !== GpwsOperatingMode.Normal || data.isOnGround || data.radarAltitude > 2500 || !ias || !dt) {
      this.alertController.untriggerAlert(UnsafeTerrainClearanceModule.TOO_LOW_TERRAIN_ALERT_ID);
      this.alertController.untriggerAlert(UnsafeTerrainClearanceModule.TOO_LOW_GEAR_ALERT_ID);
      this.alertController.untriggerAlert(UnsafeTerrainClearanceModule.TOO_LOW_FLAPS_ALERT_ID);

      return;
    }

    if (data.isRadarAltitudeValid && data.radarAltitude > 30) {
      if (data.isTakeoff && (!gearDown || !landingFlaps)) {
        this.updateModeC(data, dt);
      } else if (!gearDown) {
        this.updateModeA(data, ias, landingFlaps);
      } else if (gearDown && !landingFlaps) {
        this.updateModeB(data, ias);
      }
    }

    if (this.tooLowTerrainActive) {
      this.alertController.triggerAlert(UnsafeTerrainClearanceModule.TOO_LOW_TERRAIN_ALERT_ID);
    } else {
      this.alertController.untriggerAlert(UnsafeTerrainClearanceModule.TOO_LOW_TERRAIN_ALERT_ID);
    }
    if (this.tooLowGearActive) {
      this.alertController.triggerAlert(UnsafeTerrainClearanceModule.TOO_LOW_GEAR_ALERT_ID);
    } else {
      this.alertController.untriggerAlert(UnsafeTerrainClearanceModule.TOO_LOW_GEAR_ALERT_ID);
    }
    if (this.tooLowFlapsActive) {
      this.alertController.triggerAlert(UnsafeTerrainClearanceModule.TOO_LOW_FLAPS_ALERT_ID);
    } else {
      this.alertController.untriggerAlert(UnsafeTerrainClearanceModule.TOO_LOW_FLAPS_ALERT_ID);
    }
  }

  /**
   * Updates Mode 4A
   * @param data GPWS data
   * @param ias The aircrafts airspeed, in knots
   * @param landingFlaps Whether the aircraft is configured with landing flaps
   */
  private updateModeA(data: Readonly<GpwsData>, ias: number, landingFlaps: boolean): void {
    if (ias <= UnsafeTerrainClearanceModule.TOO_LOW_GEAR_4A_BOUNDARY_KTS && data.radarAltitude < UnsafeTerrainClearanceModule.TOO_LOW_GEAR_4A_BOUNDARY_AGL) {
      this.tooLowGearActive = true;
    } else if (ias > UnsafeTerrainClearanceModule.TOO_LOW_GEAR_4A_BOUNDARY_KTS && !landingFlaps) {
      const upperBoundary = MathUtils.lerp(
        ias, UnsafeTerrainClearanceModule.TOO_LOW_GEAR_4A_BOUNDARY_KTS, UnsafeTerrainClearanceModule.TOO_LOW_TERRAIN_4A_BOUNDARY_KTS,
        UnsafeTerrainClearanceModule.TOO_LOW_GEAR_4A_BOUNDARY_AGL, UnsafeTerrainClearanceModule.TOO_LOW_TERRAIN_4A_BOUNDARY_AGL,
        true, true
      );
      if (data.radarAltitude < upperBoundary) {
        this.tooLowTerrainActive = true;
      }
    }
  }

  /**
   * Updates Mode 4B
   * @param data GPWS data
   * @param ias The aircrafts airspeed, in knots
   */
  private updateModeB(data: Readonly<GpwsData>, ias: number): void {
    if (ias <= UnsafeTerrainClearanceModule.TOO_LOW_FLAPS_4B_BOUNDARY_KTS && data.radarAltitude < UnsafeTerrainClearanceModule.TOO_LOW_FLAPS_4B_BOUNDARY_AGL) {
      this.tooLowFlapsActive = true;
    } else if (ias > UnsafeTerrainClearanceModule.TOO_LOW_FLAPS_4B_BOUNDARY_KTS) {
      const upperBoundary = MathUtils.lerp(
        ias, UnsafeTerrainClearanceModule.TOO_LOW_FLAPS_4B_BOUNDARY_KTS, UnsafeTerrainClearanceModule.TOO_LOW_TERRAIN_4B_BOUNDARY_KTS,
        UnsafeTerrainClearanceModule.TOO_LOW_FLAPS_4B_BOUNDARY_AGL, UnsafeTerrainClearanceModule.TOO_LOW_TERRAIN_4B_BOUNDARY_AGL,
        true, true
      );
      if (data.radarAltitude < upperBoundary) {
        this.tooLowTerrainActive = true;
      }
    }
  }

  /**
   * Updates Mode 4C warnings
   * @param data GPWS data
   * @param dt Time since last update
   */
  private updateModeC(data: Readonly<GpwsData>, dt: number): void {
    const radarAltFloor = this.modeCRadioAltSmoother.next(data.radarAltitude * 0.75, dt);

    if (data.radarAltitude < radarAltFloor) {
      this.tooLowTerrainActive = true;
    }
  }

  /** @inheritdoc */
  public onDestroy(): void {
    // noop
  }
}
