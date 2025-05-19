import { EventBus, SoundPacket, SoundServerController } from '@microsoft/msfs-sdk';

import { GpwsEvents } from './GpwsEvents';

/** Enum documenting the priority of various GPWS alert visuals. Lower numbers are higher priority. */
export enum GpwsVisualAlertType {
  PullUp = 1,
  GroundProximity = 2,
  None = 3,
}

/** An interface describing a GPWS alert definition */
export interface GpwsAlertDefinition {
  /** The type of visual GPWS alert that should be displayed */
  visualAlertType: GpwsVisualAlertType;
  /** The aural alert that should be played when the alert is triggered */
  auralAlert: SoundPacket;
  /** The priority of this alert */
  priority: number;
  /** Whether to immediately clear this alert. Ignored if the aural alert is continuous. Defaults to false. */
  clearImmediately?: boolean;
}

/** A class responsible for controlling GPWS alerts */
export class GpwsAlertController {
  private readonly registeredAlerts = new Map<string, GpwsAlertDefinition>();
  private activeAlerts: Record<string, boolean> = {};

  private readonly soundController = new SoundServerController(this.bus);

  /** @inheritdoc */
  constructor(private readonly bus: EventBus) {
  }

  /**
   * Registers a GPWS alert
   * @param id The ID of the alert, to be later used to trigger an alert
   * @param definition The alerts definition
   */
  public registerAlert(id: string, definition: GpwsAlertDefinition): void {
    this.registeredAlerts.set(id, definition);
  }

  /** Updates the currently active alerts */
  private updateAlerts(): void {
    const highestAlertId = this.getHighestPriorityAlertId();
    let highestVisualAlertEnum = GpwsVisualAlertType.None;

    for (const alert of Object.keys(this.activeAlerts)) {
      const alertDef = this.registeredAlerts.get(alert);

      if (alertDef) {
        // Some alerts have higher priorities but lower visual alert priorities, so we need to account for this
        if (alertDef.visualAlertType < highestVisualAlertEnum) {
          highestVisualAlertEnum = alertDef.visualAlertType;
        }

        if (alert === highestAlertId) {
          this.soundController.play(alertDef.auralAlert);

          if (alertDef.clearImmediately === true && alertDef.auralAlert.continuous !== true) {
            delete this.activeAlerts[alert];
          }
        } else {
          this.soundController.stop(alertDef.auralAlert.key);
        }
      }
    }

    this.bus.getPublisher<GpwsEvents>().pub('gpws_visual_alert', highestVisualAlertEnum, true);

    if (Object.keys(this.activeAlerts).length === 0) {
      this.bus.getPublisher<GpwsEvents>().pub('gpws_visual_alert', null, true);
    }
  }

  /**
   * Gets the alert with the highest priority
   * @returns The ID of the highest priority alert, or null if there is none
   */
  private getHighestPriorityAlertId(): string | null {
    let highestAlert: null | string = null;
    let highestAlertDef: null | GpwsAlertDefinition = null;
    for (const alert of Object.keys(this.activeAlerts)) {
      const alertDef = this.registeredAlerts.get(alert);

      if (alertDef && (highestAlert === null || highestAlertDef === null || alertDef.priority < highestAlertDef.priority)) {
        highestAlert = alert;
        highestAlertDef = alertDef;
      }
    }

    return highestAlert;
  }

  /**
   * Triggers a GPWS alert
   * @param id The ID of the alert to trigger
   */
  public triggerAlert(id: string): void {
    if (!this.activeAlerts[id]) {
      this.activeAlerts[id] = true;

      this.updateAlerts();
    }
  }

  /**
   * Untriggers a GPWS alert
   * @param id The ID of the alert to trigger
   */
  public untriggerAlert(id: string): void {
    const alertDef = this.registeredAlerts.get(id);
    if (this.activeAlerts[id] && alertDef) {
      delete this.activeAlerts[id];

      this.updateAlerts();
      this.soundController.stop(alertDef.auralAlert.key);
    }
  }

  /**
   * Triggers the aural component of an already triggered GPWS alert
   * @param id The ID of the alert to play
   * @returns If the aural alert played
   */
  public triggerAuralAlert(id: string): boolean {
    if (this.activeAlerts[id] === true) {
      const highestAlertId = this.getHighestPriorityAlertId();
      const alertDef = this.registeredAlerts.get(id);

      if (alertDef && highestAlertId === id) {
        this.soundController.play(alertDef.auralAlert);
      }

      return true;
    }

    return false;
  }
}
