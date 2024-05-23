/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  AdcEvents, AuralAlertControlEvents, AuralAlertRegistrationManager, ConsumerValue, EventBus, SubscribableSetEventType,
  Subscription
} from '@microsoft/msfs-sdk';

import {
  GarminTawsAlert, GarminTawsStatus, TerrainSystemOperatingMode, TerrainSystemStateDataProvider, TerrainSystemType
} from '@microsoft/msfs-garminsdk';

import {
  AuralAlertUserSettings, AuralAlertVoiceSetting, G3000AuralAlertIds, G3000AuralAlertUtils
} from '@microsoft/msfs-wtg3000-common';

/**
 * An entry describing an aural alert to play while a terrain system alert is active.
 */
type AlertEntry = {
  /** The ID of the aural alert. */
  uuid: string;

  /** The priority of the aural alert within its queue. */
  priority: number;

  /** The aural alert sound atom sequence, keyed by voice setting. */
  sequence: Record<AuralAlertVoiceSetting, string>;

  /**
   * The amount of time, in milliseconds, after the alert starts playing at which to forcibly stop the alert. Defaults
   * to 10000 milliseconds.
   */
  timeout?: number;
};

/**
 * A manager that controls terrain alerting system aural alerts, including test mode aurals, status flag aurals, and
 * all alert aurals except for voice callout (touchdown callout) alerts.
 */
export class TerrainSystemAuralManager {
  private readonly publisher = this.bus.getPublisher<AuralAlertControlEvents>();

  private readonly registrationManager = new AuralAlertRegistrationManager(this.bus);

  private readonly auralAlertVoice = AuralAlertUserSettings.getManager(this.bus).voice;

  private readonly alertEntries: Map<string, AlertEntry>;

  private readonly isOnGround = ConsumerValue.create(null, false);

  private hasTestStarted = false;

  private activeAlertAuralUuid: string | null = null;

  private readonly subscriptions: Subscription[] = [
    this.isOnGround
  ];
  private terrainSystemTypeSub?: Subscription;

  /**
   * Creates a new instance of TerrainSystemAuralManager.
   * @param bus The event bus.
   * @param dataProvider A provider of terrain alerting system state data.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly dataProvider: TerrainSystemStateDataProvider
  ) {
    // ---- Test aurals ----

    this.registrationManager.register({
      uuid: G3000AuralAlertIds.TawsTestPass,
      queue: G3000AuralAlertUtils.PRIMARY_QUEUE,
      priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.TawsTestPass],
      sequence: '',
      continuous: false,
      repeat: false,
      timeout: 5000
    });

    // ---- Status flag aurals ----

    this.registrationManager.register({
      uuid: G3000AuralAlertIds.TawsNotAvailable,
      queue: G3000AuralAlertUtils.PRIMARY_QUEUE,
      priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.TawsNotAvailable],
      sequence: '',
      continuous: false,
      repeat: false,
      timeout: 5000
    });

    this.registrationManager.register({
      uuid: G3000AuralAlertIds.TawsAvailable,
      queue: G3000AuralAlertUtils.PRIMARY_QUEUE,
      priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.TawsAvailable],
      sequence: '',
      continuous: false,
      repeat: false,
      timeout: 5000
    });

    this.registrationManager.register({
      uuid: G3000AuralAlertIds.TawsFailed,
      queue: G3000AuralAlertUtils.PRIMARY_QUEUE,
      priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.TawsFailed],
      sequence: '',
      continuous: false,
      repeat: false,
      timeout: 5000
    });

    this.registrationManager.register({
      uuid: G3000AuralAlertIds.GpwsAvailable,
      queue: G3000AuralAlertUtils.PRIMARY_QUEUE,
      priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.GpwsAvailable],
      sequence: '',
      continuous: false,
      repeat: false,
      timeout: 5000
    });

    this.registrationManager.register({
      uuid: G3000AuralAlertIds.GpwsFailed,
      queue: G3000AuralAlertUtils.PRIMARY_QUEUE,
      priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.GpwsFailed],
      sequence: '',
      continuous: false,
      repeat: false,
      timeout: 5000
    });

    // ---- Alert aurals ----

    this.alertEntries = new Map([
      [GarminTawsAlert.PdaCaution, {
        uuid: G3000AuralAlertIds.TawsPdaCaution,
        priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.TawsPdaCaution],
        sequence: {
          [AuralAlertVoiceSetting.Female]: 'aural_too_low_terrain_f',
          [AuralAlertVoiceSetting.Male]: 'aural_too_low_terrain_m'
        },
        timeout: 3000
      }],

      [GarminTawsAlert.EdrWarning, {
        uuid: G3000AuralAlertIds.TawsEdr,
        priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.TawsEdr],
        sequence: {
          [AuralAlertVoiceSetting.Female]: 'aural_pull_up_f',
          [AuralAlertVoiceSetting.Male]: 'aural_pull_up_m'
        },
        timeout: 3000
      }],
      [GarminTawsAlert.EdrCaution, {
        uuid: G3000AuralAlertIds.TawsEdrCaution,
        priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.TawsEdrCaution],
        sequence: {
          [AuralAlertVoiceSetting.Female]: 'aural_sink_rate_f',
          [AuralAlertVoiceSetting.Male]: 'aural_sink_rate_m'
        },
        timeout: 3000
      }],

      [GarminTawsAlert.EcrWarning, {
        uuid: G3000AuralAlertIds.TawsEcr,
        priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.TawsEcr],
        sequence: {
          [AuralAlertVoiceSetting.Female]: 'aural_pull_up_f',
          [AuralAlertVoiceSetting.Male]: 'aural_pull_up_m'
        },
        timeout: 3000
      }],
      [GarminTawsAlert.EcrCaution, {
        uuid: G3000AuralAlertIds.TawsEcrCaution,
        priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.TawsEcrCaution],
        sequence: {
          [AuralAlertVoiceSetting.Female]: 'aural_terrain_terrain_f',
          [AuralAlertVoiceSetting.Male]: 'aural_terrain_terrain_m'
        },
        timeout: 3000
      }],

      [GarminTawsAlert.NcrCaution, {
        uuid: G3000AuralAlertIds.TawsNcrCaution,
        priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.TawsNcrCaution],
        sequence: {
          [AuralAlertVoiceSetting.Female]: 'aural_dont_sink_f',
          [AuralAlertVoiceSetting.Male]: 'aural_dont_sink_m'
        },
        timeout: 3000
      }]
    ]);

    for (const entry of this.alertEntries.values()) {
      this.registrationManager.register({
        uuid: entry.uuid,
        queue: G3000AuralAlertUtils.PRIMARY_QUEUE,
        priority: entry.priority,
        sequence: '',
        continuous: false,
        repeat: true,
        timeout: entry.timeout
      });
    }
  }

  /**
   * Initializes this manager. Once initialized, this manager will control aural alerts based on the terrain alerting
   * system state.
   */
  public init(): void {
    // TAWS-A uses different aurals for certain alerts.
    this.terrainSystemTypeSub = this.dataProvider.type.sub(type => {
      if (type !== undefined) {
        this.terrainSystemTypeSub!.destroy();
        this.terrainSystemTypeSub = undefined;

        if (type === TerrainSystemType.TawsA) {
          const edrWarning = this.alertEntries.get(GarminTawsAlert.EdrWarning)!;
          edrWarning.sequence = {
            [AuralAlertVoiceSetting.Female]: 'aural_tone_tone_pull_up_f',
            [AuralAlertVoiceSetting.Male]: 'aural_tone_tone_pull_up_m'
          };
          edrWarning.timeout = 5000;

          const ecrWarning = this.alertEntries.get(GarminTawsAlert.EcrWarning)!;
          ecrWarning.sequence = {
            [AuralAlertVoiceSetting.Female]: 'aural_tone_tone_pull_up_f',
            [AuralAlertVoiceSetting.Male]: 'aural_tone_tone_pull_up_m'
          };
          ecrWarning.timeout = 5000;
        }
      }
    }, false, true);
    this.terrainSystemTypeSub.resume(true);

    this.isOnGround.setConsumer(this.bus.getSubscriber<AdcEvents>().on('on_ground'));

    this.subscriptions.push(
      this.dataProvider.operatingMode.sub(this.onOperatingModeChanged.bind(this), true),
      this.dataProvider.statusFlags.sub(this.onStatusFlagsChanged.bind(this), true),
      this.dataProvider.prioritizedAlert.sub(this.onPrioritizedAlertChanged.bind(this), true)
    );
  }

  /**
   * Responds to when the terrain system's operating mode changes.
   * @param mode The new operating mode.
   */
  private onOperatingModeChanged(mode: TerrainSystemOperatingMode): void {
    // Handle test aural logic.
    if (mode === TerrainSystemOperatingMode.Test) {
      this.hasTestStarted = true;
      this.publisher.pub('aural_alert_untrigger', G3000AuralAlertIds.TawsTestPass, true, false);
    } else {
      if (mode === TerrainSystemOperatingMode.Operating) {
        if (this.hasTestStarted) {
          this.publisher.pub('aural_alert_trigger', {
            uuid: G3000AuralAlertIds.TawsTestPass,
            sequence: this.auralAlertVoice.get() === AuralAlertVoiceSetting.Male
              ? 'aural_taws_system_test_ok_m'
              : 'aural_taws_system_test_ok_f'
          }, true, false);
        }
      } else {
        this.publisher.pub('aural_alert_untrigger', G3000AuralAlertIds.TawsTestPass, true, false);
      }

      this.hasTestStarted = false;
    }

    // If mode is not operating, then untrigger all status aurals.
    if (mode !== TerrainSystemOperatingMode.Operating) {
      this.publisher.pub('aural_alert_untrigger', G3000AuralAlertIds.TawsAvailable, true, false);
      this.publisher.pub('aural_alert_untrigger', G3000AuralAlertIds.TawsNotAvailable, true, false);
      this.publisher.pub('aural_alert_untrigger', G3000AuralAlertIds.TawsFailed, true, false);
      this.publisher.pub('aural_alert_untrigger', G3000AuralAlertIds.GpwsAvailable, true, false);
      this.publisher.pub('aural_alert_untrigger', G3000AuralAlertIds.GpwsFailed, true, false);
    }
  }

  /**
   * Responds to when a status flag is added to or removed from the terrain system.
   * @param flags The current set of all status flags.
   * @param type The type of change that occurred.
   * @param flag The flag that was changed.
   */
  private onStatusFlagsChanged(flags: ReadonlySet<string>, type: SubscribableSetEventType, flag: string): void {
    if (this.dataProvider.operatingMode.get() !== TerrainSystemOperatingMode.Operating) {
      return;
    }

    let triggerUuid: string | null = null;
    let sequenceMale: string | null = null;
    let sequenceFemale: string | null = null;
    let untriggerUuid: string | null = null;

    switch (flag) {
      case GarminTawsStatus.TawsNotAvailable:
        if (type === SubscribableSetEventType.Added) {
          untriggerUuid = G3000AuralAlertIds.TawsAvailable;

          if (!this.isOnGround.get()) {
            triggerUuid = G3000AuralAlertIds.TawsNotAvailable;
            sequenceMale = 'aural_taws_not_available_m';
            sequenceFemale = 'aural_taws_not_available_f';
          }
        } else {
          untriggerUuid = G3000AuralAlertIds.TawsNotAvailable;

          if (!flags.has(GarminTawsStatus.TawsFailed) && !this.isOnGround.get()) {
            triggerUuid = G3000AuralAlertIds.TawsAvailable;
            sequenceMale = 'aural_taws_available_m';
            sequenceFemale = 'aural_taws_available_f';
          }
        }
        break;
      case GarminTawsStatus.TawsFailed:
        if (type === SubscribableSetEventType.Added) {
          untriggerUuid = G3000AuralAlertIds.TawsAvailable;

          triggerUuid = G3000AuralAlertIds.TawsFailed;
          sequenceMale = 'aural_taws_system_failure_m';
          sequenceFemale = 'aural_taws_system_failure_f';
        } else {
          untriggerUuid = G3000AuralAlertIds.TawsFailed;

          if (!flags.has(GarminTawsStatus.TawsNotAvailable)) {
            triggerUuid = G3000AuralAlertIds.TawsAvailable;
            sequenceMale = 'aural_taws_available_m';
            sequenceFemale = 'aural_taws_available_f';
          }
        }
        break;
      case GarminTawsStatus.GpwsFailed:
        if (type === SubscribableSetEventType.Added) {
          untriggerUuid = G3000AuralAlertIds.GpwsAvailable;

          triggerUuid = G3000AuralAlertIds.GpwsFailed;
          sequenceMale = 'aural_gpws_system_failure_m';
          sequenceFemale = 'aural_gpws_system_failure_f';
        } else {
          untriggerUuid = G3000AuralAlertIds.GpwsFailed;

          triggerUuid = G3000AuralAlertIds.GpwsAvailable;
          sequenceMale = 'aural_gpws_available_m';
          sequenceFemale = 'aural_gpws_available_f';
        }
        break;
      default:
        return;
    }

    if (untriggerUuid !== null) {
      this.publisher.pub('aural_alert_untrigger', untriggerUuid, true, false);
    }

    if (triggerUuid !== null && sequenceMale !== null && sequenceFemale !== null) {
      this.publisher.pub('aural_alert_trigger', {
        uuid: triggerUuid,
        sequence: this.auralAlertVoice.get() === AuralAlertVoiceSetting.Male
          ? sequenceMale
          : sequenceFemale
      }, true, false);
    }
  }

  /**
   * Responds to when a terrain system alert is activated.
   * @param alert The alert that was activated.
   */
  private onPrioritizedAlertChanged(alert: string | null): void {
    if (this.activeAlertAuralUuid !== null) {
      this.publisher.pub('aural_alert_deactivate', this.activeAlertAuralUuid, true, false);
    }

    if (alert === null) {
      return;
    }

    const entry = this.alertEntries.get(alert);
    if (!entry) {
      return;
    }

    this.activeAlertAuralUuid = entry.uuid;
    this.publisher.pub('aural_alert_activate', { uuid: entry.uuid, sequence: entry.sequence[this.auralAlertVoice.get()] }, true, false);
  }

  /**
   * Destroys this manager. Once destroyed, the manager will no longer control aural alerts.
   */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }
    this.terrainSystemTypeSub?.destroy();
  }
}