import { AuralAlertControlEvents, AuralAlertRegistrationManager, EventBus, Subscription } from '@microsoft/msfs-sdk';

import { GarminVNavTrackAlertType, VNavDataProvider } from '@microsoft/msfs-garminsdk';

import {
  AuralAlertUserSettings, AuralAlertVoiceSetting, G3000AuralAlertIds, G3000AuralAlertUtils
} from '@microsoft/msfs-wtg3000-common';

/**
 * A manager that automatically controls VNAV aural alerts.
 */
export class VNavAuralManager {
  private readonly publisher = this.bus.getPublisher<AuralAlertControlEvents>();

  private readonly registrationManager = new AuralAlertRegistrationManager(this.bus);

  private readonly auralAlertVoice = AuralAlertUserSettings.getManager(this.bus).voice;

  private readonly subscriptions: Subscription[] = [];

  /**
   * Creates a new instance of VNavAuralManager.
   * @param bus The event bus.
   * @param dataProvider A provider of VNAV data.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly dataProvider: VNavDataProvider
  ) {
    this.registrationManager.register({
      uuid: G3000AuralAlertIds.VerticalTrack,
      queue: G3000AuralAlertUtils.PRIMARY_QUEUE,
      priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.VerticalTrack],
      sequence: 'aural_vertical_track_f',
      continuous: false,
      repeat: false,
      timeout: 3000
    });
  }

  /**
   * Initializes this manager. Once initialized, this manager will automatically control VNAV aural alerts.
   */
  public init(): void {
    this.subscriptions.push(
      this.dataProvider.trackAlert.on(this.onVerticalTrackAlert.bind(this)),
      this.dataProvider.timeToTod.sub(this.onTimeToTodChanged.bind(this))
    );
  }

  /**
   * Responds to when a vertical track alert is issued.
   * @param source The source of the alert event.
   * @param type The type of alert that was issued.
   */
  private onVerticalTrackAlert(source: void, type: GarminVNavTrackAlertType): void {
    if (type === GarminVNavTrackAlertType.TodOneMinute) {
      this.publisher.pub('aural_alert_trigger', {
        uuid: G3000AuralAlertIds.VerticalTrack,
        sequence: this.auralAlertVoice.get() === AuralAlertVoiceSetting.Male
          ? 'aural_vertical_track_m'
          : 'aural_vertical_track_f'
      }, true, false);
    } else {
      this.publisher.pub('aural_alert_untrigger', G3000AuralAlertIds.VerticalTrack, true, false);
    }
  }

  /**
   * Responds to when the time remaining until TOD changes.
   * @param timeToTod The time remaining until TOD, or `null` if the time remaining is not available.
   */
  private onTimeToTodChanged(timeToTod: number | null): void {
    if (timeToTod === null) {
      this.publisher.pub('aural_alert_untrigger', G3000AuralAlertIds.VerticalTrack, true, false);
    }
  }

  /**
   * Destroys this manager. Once destroyed, the manager will no longer control aural alerts.
   */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }
  }
}
