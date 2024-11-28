import { AuralAlertControlEvents, AuralAlertRegistrationManager, EventBus, Subscription, UserSetting } from '@microsoft/msfs-sdk';

import { GarminTawsAlert, TerrainSystemEventsForId } from '@microsoft/msfs-garminsdk';

import {
  AuralAlertUserSettings, AuralAlertVoiceSetting, G3000AuralAlertIds, G3000AuralAlertUtils, TouchdownCalloutUserSettings
} from '@microsoft/msfs-wtg3000-common';

/**
 * An entry for a touchdown callout aural alert.
 */
type TouchdownCalloutAuralEntry = {
  /** The user setting controlling whether the callout is enabled. */
  enabled: UserSetting<boolean>;

  /** The aural alert alias used by the callout. */
  alertAlias: string;

  /** The aural alert track used by the callout. */
  alertTrack: string;

  /** The aural alert sound atom sequence used by the callout. */
  alertSequence: Record<AuralAlertVoiceSetting, string>;
};

/**
 * A manager that controls touchdown callout aural alerts.
 */
export class TouchdownCalloutAuralManager {
  private readonly publisher = this.bus.getPublisher<AuralAlertControlEvents>();

  private readonly registrationManager = new AuralAlertRegistrationManager(this.bus);

  private readonly masterEnabledSetting: UserSetting<boolean>;
  private readonly auralAlertVoice = AuralAlertUserSettings.getManager(this.bus).voice;

  private readonly entries: Map<string, TouchdownCalloutAuralEntry>;

  private readonly subscriptions: Subscription[] = [];

  /**
   * Creates a new instance of TouchdownCalloutAuralManager.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {
    const settingManager = TouchdownCalloutUserSettings.getManager(bus);
    this.masterEnabledSetting = settingManager.getSetting('touchdownCalloutMasterEnabled');

    this.entries = new Map(
      Array.from([500, 450, 400, 350, 300, 250, 200, 150, 100, 50, 40, 30, 20, 10] as const, altitude => {
        return [
          GarminTawsAlert[`Vco${altitude}`],
          {
            enabled: settingManager.getEnabledSetting(altitude),
            alertAlias: `${G3000AuralAlertIds.TouchdownCallout}-${altitude}`,
            alertTrack: `${G3000AuralAlertIds.TouchdownCallout}-${altitude}`,
            alertSequence: {
              [AuralAlertVoiceSetting.Male]: `aural_${altitude}_m`,
              [AuralAlertVoiceSetting.Female]: `aural_${altitude}_f`,
            }
          }
        ];
      })
    );

    this.registrationManager.register({
      uuid: G3000AuralAlertIds.TouchdownCallout,
      queue: G3000AuralAlertUtils.PRIMARY_QUEUE,
      priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.TouchdownCallout],
      sequence: 'aural_500_f',
      continuous: false,
      repeat: false,
      timeout: 3000,
      queuedLifetime: 500
    });
  }

  /**
   * Initializes this manager. Once initialized, this manager will trigger touchdown callout aural alerts when the
   * corresponding terrain system alerts are activated.
   */
  public init(): void {
    const sub = this.bus.getSubscriber<TerrainSystemEventsForId<''>>();

    this.subscriptions.push(
      sub.on('terrainsys_alert_activated').handle(this.onAlertActivated.bind(this)),
      sub.on('terrainsys_alert_deactivated').handle(this.onAlertDeactivated.bind(this))
    );
  }

  /**
   * Responds to when a terrain system alert is activated.
   * @param alert The alert that was activated.
   */
  private onAlertActivated(alert: string): void {
    const entry = this.entries.get(alert);
    if (!entry) {
      return;
    }

    if (this.masterEnabledSetting.value && entry.enabled.value) {
      this.publisher.pub('aural_alert_trigger', {
        uuid: G3000AuralAlertIds.TouchdownCallout,
        alias: entry.alertAlias,
        track: entry.alertTrack,
        sequence: entry.alertSequence[this.auralAlertVoice.get()]
      }, true, false);
    }
  }

  /**
   * Responds to when a terrain system alert is deactivated.
   * @param alert The alert that was deactivated.
   */
  private onAlertDeactivated(alert: string): void {
    const entry = this.entries.get(alert);
    if (!entry) {
      return;
    }

    this.publisher.pub('aural_alert_untrigger', entry.alertAlias, true, false);
  }

  /**
   * Destroys this manager. Once destroyed, the manager will no longer trigger aural alerts.
   */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }
  }
}