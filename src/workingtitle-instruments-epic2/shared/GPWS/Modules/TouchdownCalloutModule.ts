/* eslint-disable @typescript-eslint/no-unused-vars */
import { ArrayUtils, EventBus, MinimumsMode, SoundPacket, SoundServerController } from '@microsoft/msfs-sdk';

import { AltitudeDataProvider } from '../../Instruments';
import { CockpitUserSettings } from '../../Settings';
import { GpwsAlertController, GpwsAlertDefinition, GpwsVisualAlertType } from '../GpwsAlertController';
import { GpwsAlertPriority } from '../GpwsAlertPriorities';
import { GpwsData, GpwsModule } from '../GpwsModule';
import { GpwsOperatingMode } from '../GpwsTypes';

/**
 * Supported touchdown callout altitudes (in feet AGL).
 */
export type TouchdownCalloutAltitude = 2500 | 1000 | 500 | 400 | 300 | 200 | 100 | 70 | 60 | 50 | 40 | 30 | 20 | 10 | 5;

/**
 * An entry for a touchdown callout.
 */
type TouchdownCalloutEntry = {
  /** The altitude at which the callout is triggered if armed, in feet. */
  triggerAltitude: number;

  /** The altitude at which the callout is armed, in feet. */
  armAltitude: number;

  /** Whether baro altitude should be used. Defaults to false if not set */
  useBaroAlt?: boolean;

  /** Whether the callout is armed. */
  isArmed: boolean;

  /** GPWS alert id */
  alertId: string;

  /** GPWS alert definition */
  alertDefinition: GpwsAlertDefinition;
};

/**
 * A GPWS module which handles touchdown callouts.
 */
export class TouchdownCalloutModule implements GpwsModule {
  protected static readonly APPROACHING_MINIMUMS_ALT_OFFSET = 80;

  private static readonly MINIMUMS_ALERT_ID = 'tcm-minimums';
  private static readonly MINIMUMS_SOUND_PACKET: SoundPacket = { key: TouchdownCalloutModule.MINIMUMS_ALERT_ID, sequence: ['aural_minimums'], continuous: false };
  private static readonly MINIMUMS_ALERT_DEFINITION: GpwsAlertDefinition = {
    visualAlertType: GpwsVisualAlertType.None,
    auralAlert: TouchdownCalloutModule.MINIMUMS_SOUND_PACKET,
    priority: GpwsAlertPriority.Mode6Minimums,
    clearImmediately: true
  };

  private static readonly APPROACHING_MINIMUMS_ALERT_ID = 'tcm-approaching-minimums';
  private static readonly APPROACHING_MINIMUMS_SOUND_PACKET: SoundPacket = { key: TouchdownCalloutModule.MINIMUMS_ALERT_ID, sequence: ['aural_approaching_minimums'], continuous: false };
  private static readonly APPROACHING_MINIMUMS_ALERT_DEFINITION: GpwsAlertDefinition = {
    visualAlertType: GpwsVisualAlertType.None,
    auralAlert: TouchdownCalloutModule.APPROACHING_MINIMUMS_SOUND_PACKET,
    priority: GpwsAlertPriority.Mode6ApproachingMinimums,
    clearImmediately: true
  };

  private readonly entries: TouchdownCalloutEntry[];

  private isReset = true;

  private readonly cockpitUserSettings = CockpitUserSettings.getManager(this.bus);

  private readonly minimumsModeSetting = this.cockpitUserSettings.getSetting('minimumsMode');
  private readonly baroMinimumsSetting = this.cockpitUserSettings.getSetting('decisionAltitudeFeet');
  private readonly radioMinimumsSetting = this.cockpitUserSettings.getSetting('decisionHeightFeet');

  private minimumsAlerts: TouchdownCalloutEntry[] = [
    {
      triggerAltitude: -Infinity,
      armAltitude: Infinity,
      isArmed: false,
      alertId: TouchdownCalloutModule.MINIMUMS_ALERT_ID,
      alertDefinition: TouchdownCalloutModule.MINIMUMS_ALERT_DEFINITION,
    },
    {
      triggerAltitude: -Infinity,
      armAltitude: Infinity,
      isArmed: false,
      alertId: TouchdownCalloutModule.APPROACHING_MINIMUMS_ALERT_ID,
      alertDefinition: TouchdownCalloutModule.APPROACHING_MINIMUMS_ALERT_DEFINITION,
    }
  ];

  /**
   * Creates a new instance of TouchdownCalloutModule.
   * @param bus The event bus.
   * @param alertController The alert controller
   * @param altitudeCallouts Which altitudes to callout.
   * @param altitudeDataProvider The aircraft altitude data provider
   */
  constructor(
    private readonly bus: EventBus,
    private readonly alertController: GpwsAlertController,
    altitudeCallouts: readonly TouchdownCalloutAltitude[],
    private readonly altitudeDataProvider: AltitudeDataProvider
  ) {
    this.alertController.registerAlert(TouchdownCalloutModule.MINIMUMS_ALERT_ID, TouchdownCalloutModule.MINIMUMS_ALERT_DEFINITION);
    this.alertController.registerAlert(TouchdownCalloutModule.APPROACHING_MINIMUMS_ALERT_ID, TouchdownCalloutModule.APPROACHING_MINIMUMS_ALERT_DEFINITION);

    this.entries = Array.from(altitudeCallouts, altitude => {
      const alertId = `alt-callout-${altitude}ft`;
      const alertDefinition = {
        visualAlertType: GpwsVisualAlertType.None,
        auralAlert: { key: `alt-callout-${altitude}ft`, sequence: [`aural_${altitude}ft`], continuous: false },
        priority: GpwsAlertPriority.Mode6AltitudeCallouts,
        clearImmediately: true
      };

      this.alertController.registerAlert(alertId, alertDefinition);

      return {
        triggerAltitude: altitude,
        // This is leftover from the garmin, not sure if it needs to change for boeing
        armAltitude: Math.max(altitude * 1.1, altitude + 10),
        isArmed: false,
        alertId,
        alertDefinition,
      };
    });
  }

  /** @inheritdoc */
  public onInit(): void {
    // noop
  }

  /** @inheritdoc */
  public onUpdate(operatingMode: GpwsOperatingMode, data: Readonly<GpwsData>, realTime: number): void {
    if (operatingMode !== GpwsOperatingMode.Normal || data.isOnGround) {
      this.reset();
      return;
    }

    if (data.isRadarAltitudeValid) {
      this.updateMinimumsCalloutEntries();
      this.updateCallouts(data, data.radarAltitude, this.altitudeDataProvider.altitude.get() ?? 0);
    }
  }

  /**
   * Updates the callout entries relating to the aircraft minimums
   */
  private updateMinimumsCalloutEntries(): void {
    const minimumsMode = this.minimumsModeSetting.get();
    const minimumsAlt = minimumsMode === MinimumsMode.BARO ? this.baroMinimumsSetting.get() : this.radioMinimumsSetting.get();

    if (minimumsAlt !== 0 && this.minimumsAlerts[0].triggerAltitude !== minimumsAlt) {
      // Index 0 is for MINIMUMS, Index 1 is for APPROACHING MINIMUMS
      this.minimumsAlerts[0].triggerAltitude = minimumsAlt;
      this.minimumsAlerts[0].armAltitude = Math.max(minimumsAlt * 1.1, minimumsAlt + 10);
      this.minimumsAlerts[0].useBaroAlt = minimumsMode === MinimumsMode.BARO;

      const approachingMinsAlt = minimumsAlt + TouchdownCalloutModule.APPROACHING_MINIMUMS_ALT_OFFSET;
      this.minimumsAlerts[1].triggerAltitude = approachingMinsAlt;
      this.minimumsAlerts[1].armAltitude = Math.max(approachingMinsAlt * 1.1, approachingMinsAlt + 10);
      this.minimumsAlerts[1].useBaroAlt = minimumsMode === MinimumsMode.BARO;
    }
  }

  /**
   * Updates the state of all callout alerts.
   * @param data The current GPWS data.
   * @param radarAlt The radar altitude, in feet AGL
   * @param baroAlt The baro altitude, in feet
   */
  private updateCallouts(data: Readonly<GpwsData>, radarAlt: number, baroAlt: number): void {
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      this.updateCalloutEntry(entry, radarAlt, baroAlt);
    }

    for (let i = 0; i < this.minimumsAlerts.length; i++) {
      const entry = this.minimumsAlerts[i];
      this.updateCalloutEntry(entry, radarAlt, baroAlt);
    }
  }

  /**
   * Updates the state of a callout alert.
   * @param entry The entry for this callout alert
   * @param radarAlt The radar altitude, in feet AGL
   * @param baroAlt The baro altitude, in feet
   */
  private updateCalloutEntry(entry: TouchdownCalloutEntry, radarAlt: number, baroAlt: number): void {
    const altitudeAbove = entry.useBaroAlt ? baroAlt : radarAlt;

    if (entry.isArmed) {
      if (altitudeAbove <= entry.triggerAltitude) {
        this.alertController.triggerAlert(entry.alertId);
        entry.isArmed = false;
      }
    } else if (altitudeAbove >= entry.armAltitude) {
      entry.isArmed = true;
    }
  }

  /**
   * Disarms all touchdown callout alerts.
   */
  private reset(): void {
    if (this.isReset) {
      return;
    }

    for (let i = 0; i < this.entries.length; i++) {
      this.entries[i].isArmed = false;
    }

    this.isReset = true;
  }

  /** @inheritdoc */
  public onDestroy(): void {
    // noop
  }
}
