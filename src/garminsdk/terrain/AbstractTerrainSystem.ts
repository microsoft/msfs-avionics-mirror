import { EventBus, SetSubject, Subject, SubscribableSetEventType, Subscription } from '@microsoft/msfs-sdk';

import { TerrainSystem } from './TerrainSystem';
import { TerrainSystemDataProvider } from './TerrainSystemDataProvider';
import { BaseTerrainSystemEvents, TerrainSystemControlEvents, TerrainSystemEventSuffix, TerrainSystemEvents } from './TerrainSystemEvents';
import { TerrainSystemModule } from './TerrainSystemModule';
import { TerrainSystemAlertController, TerrainSystemOperatingMode } from './TerrainSystemTypes';
import { TerrainSystemUtils } from './TerrainSystemUtils';

/**
 * An abstract implementation of {@link TerrainSystem}. This class handles adding, initializing, updating, and
 * destroying modules. It also handles publishing topics to the event bus in responses to changes in state. Finally, it
 * handles listening to and responding to control events published to the event bus.
 */
export abstract class AbstractTerrainSystem<ID extends string> implements TerrainSystem {

  protected readonly idSuffix: TerrainSystemEventSuffix<ID>;

  protected readonly topicMap: {
    [P in keyof BaseTerrainSystemEvents]: `${P}${TerrainSystemEventSuffix<ID>}`;
  };

  protected readonly publisher = this.bus.getPublisher<TerrainSystemEvents>();

  protected readonly operatingMode = Subject.create(TerrainSystemOperatingMode.Off);

  protected readonly statuses = SetSubject.create<string>();
  protected readonly inhibits = SetSubject.create<string>();

  protected readonly triggeredAlerts = SetSubject.create<string>();
  protected readonly inhibitedAlerts = SetSubject.create<string>();
  protected readonly activeAlerts = SetSubject.create<string>();
  protected readonly prioritizedAlert = Subject.create<string | null>(null);

  protected readonly modules: TerrainSystemModule[] = [];

  protected readonly alertController: TerrainSystemAlertController = {
    triggerAlert: this.triggerAlert.bind(this),
    untriggerAlert: this.untriggerAlert.bind(this),
    inhibitAlert: this.inhibitAlert.bind(this),
    uninhibitAlert: this.uninhibitAlert.bind(this)
  };

  protected isAlive = true;
  protected isInit = false;

  protected readonly subscriptions: Subscription[] = [];

  /**
   * Creates a new instance of AbstractTerrainSystem.
   * @param id This terrain system's ID.
   * @param type This terrain system's type.
   * @param bus The event bus.
   * @param dataProvider A provider of terrain system data.
   * @param prioritizedAlertSelector A function that this system uses to select a prioritized alert from an iterable of
   * active alerts each time the set of active alerts changes.
   */
  public constructor(
    public readonly id: ID,
    public readonly type: string,
    protected readonly bus: EventBus,
    protected readonly dataProvider: TerrainSystemDataProvider,
    protected readonly prioritizedAlertSelector: (alerts: Iterable<string>) => string | null
  ) {
    this.idSuffix = TerrainSystemUtils.getIdSuffix(id);

    this.topicMap = {
      'terrainsys_type': `terrainsys_type${this.idSuffix}`,
      'terrainsys_operating_mode': `terrainsys_operating_mode${this.idSuffix}`,
      'terrainsys_status_flags': `terrainsys_status_flags${this.idSuffix}`,
      'terrainsys_status_added': `terrainsys_status_added${this.idSuffix}`,
      'terrainsys_status_removed': `terrainsys_status_removed${this.idSuffix}`,
      'terrainsys_inhibit_flags': `terrainsys_inhibit_flags${this.idSuffix}`,
      'terrainsys_inhibit_added': `terrainsys_inhibit_added${this.idSuffix}`,
      'terrainsys_inhibit_removed': `terrainsys_inhibit_removed${this.idSuffix}`,
      'terrainsys_triggered_alerts': `terrainsys_triggered_alerts${this.idSuffix}`,
      'terrainsys_alert_triggered': `terrainsys_alert_triggered${this.idSuffix}`,
      'terrainsys_alert_untriggered': `terrainsys_alert_untriggered${this.idSuffix}`,
      'terrainsys_inhibited_alerts': `terrainsys_inhibited_alerts${this.idSuffix}`,
      'terrainsys_alert_inhibited': `terrainsys_alert_inhibited${this.idSuffix}`,
      'terrainsys_alert_uninhibited': `terrainsys_alert_uninhibited${this.idSuffix}`,
      'terrainsys_active_alerts': `terrainsys_active_alerts${this.idSuffix}`,
      'terrainsys_alert_activated': `terrainsys_alert_activated${this.idSuffix}`,
      'terrainsys_alert_deactivated': `terrainsys_alert_deactivated${this.idSuffix}`,
      'terrainsys_prioritized_alert': `terrainsys_prioritized_alert${this.idSuffix}`,
    };

    this.publisher.pub(this.topicMap['terrainsys_type'], this.type, true, true);

    this.operatingMode.sub(this.onOperatingModeChanged.bind(this), true);

    this.triggeredAlerts.sub(this.onTriggeredAlertsChanged.bind(this));
    this.inhibitedAlerts.sub(this.onInhibitedAlertsChanged.bind(this));
    this.activeAlerts.sub(this.onActiveAlertsChanged.bind(this));
  }

  /** @inheritDoc */
  public addModule(module: TerrainSystemModule): void {
    if (this.modules.includes(module)) {
      return;
    }

    this.modules.push(module);
    if (this.isInit) {
      module.onInit();
    }
  }

  /** @inheritDoc */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('AbstractTerrainSystem: cannot initialize a dead system');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    this.onInit();
  }

  /**
   * A method that is called when this system is initialized.
   */
  protected onInit(): void {
    this.initOperatingModePublishing();
    this.initStatusPublishing();
    this.initInhibitPublishing();
    this.initAlertPublishing();
    this.initControlEventListeners();
    this.initModules();
  }

  /**
   * Initializes publishing of this system's operating mode to the event bus.
   */
  protected initOperatingModePublishing(): void {
    this.operatingMode.sub(mode => { this.publisher.pub(this.topicMap['terrainsys_operating_mode'], mode, true, true); }, true);
  }

  /**
   * Initializes publishing of this system's status flags to the event bus.
   */
  protected initStatusPublishing(): void {
    this.statuses.sub((set, type, status) => {
      this.publisher.pub(this.topicMap['terrainsys_status_flags'], Array.from(set), true, true);

      if (type === SubscribableSetEventType.Added) {
        this.publisher.pub(this.topicMap['terrainsys_status_added'], status, true, false);
      } else {
        this.publisher.pub(this.topicMap['terrainsys_status_removed'], status, true, false);
      }
    }, true);
  }

  /**
   * Initializes publishing of this system's inhibit flags to the event bus.
   */
  protected initInhibitPublishing(): void {
    this.inhibits.sub((set, type, inhibit) => {
      this.publisher.pub(this.topicMap['terrainsys_inhibit_flags'], Array.from(set), true, true);

      if (type === SubscribableSetEventType.Added) {
        this.publisher.pub(this.topicMap['terrainsys_inhibit_added'], inhibit, true, false);
      } else {
        this.publisher.pub(this.topicMap['terrainsys_inhibit_removed'], inhibit, true, false);
      }
    }, true);
  }

  /**
   * Initializes publishing of this system's active alerts to the event bus.
   */
  protected initAlertPublishing(): void {
    this.publisher.pub(this.topicMap['terrainsys_active_alerts'], Array.from(this.triggeredAlerts.get()), true, true);
    for (const alert of this.triggeredAlerts.get()) {
      this.publisher.pub(this.topicMap['terrainsys_alert_activated'], alert, true, false);
    }

    this.prioritizedAlert.sub(alert => {
      this.publisher.pub(this.topicMap['terrainsys_prioritized_alert'], alert, true, true);
    }, true);
  }

  /**
   * Initializes listeners for control events published to the event bus.
   */
  protected initControlEventListeners(): void {
    const sub = this.bus.getSubscriber<TerrainSystemControlEvents>();

    this.subscriptions.push(
      sub.on(`terrainsys_turn_on${this.idSuffix}`).handle(this.onStartTest.bind(this)),
      sub.on(`terrainsys_turn_off${this.idSuffix}`).handle(this.onStartTest.bind(this)),
      sub.on(`terrainsys_start_test${this.idSuffix}`).handle(this.onStartTest.bind(this)),
      sub.on(`terrainsys_add_inhibit${this.idSuffix}`).handle(this.onAddInhibit.bind(this)),
      sub.on(`terrainsys_remove_inhibit${this.idSuffix}`).handle(this.onRemoveInhibit.bind(this)),
      sub.on(`terrainsys_remove_all_inhibits${this.idSuffix}`).handle(this.onRemoveAllInhibits.bind(this)),
    );
  }

  /**
   * Initializes this system's modules.
   */
  protected initModules(): void {
    for (const module of this.modules) {
      module.onInit();
    }
  }

  /** @inheritDoc */
  public turnOn(): void {
    if (!this.isAlive) {
      throw new Error('AbstractTerrainSystem: cannot manipulate a dead system');
    }

    if (!this.isInit) {
      return;
    }

    this.onTurnOn();
  }

  /** @inheritDoc */
  public turnOff(): void {
    if (!this.isAlive) {
      throw new Error('AbstractTerrainSystem: cannot manipulate a dead system');
    }

    if (!this.isInit) {
      return;
    }

    this.onTurnOff();
  }

  /** @inheritDoc */
  public startTest(): void {
    if (!this.isAlive) {
      throw new Error('AbstractTerrainSystem: cannot manipulate a dead system');
    }

    if (!this.isInit) {
      return;
    }

    this.onStartTest();
  }

  /** @inheritDoc */
  public addInhibit(inhibit: string): void {
    if (!this.isAlive) {
      throw new Error('AbstractTerrainSystem: cannot manipulate a dead system');
    }

    if (!this.isInit) {
      return;
    }

    this.onAddInhibit(inhibit);
  }

  /** @inheritDoc */
  public removeInhibit(inhibit: string): void {
    if (!this.isAlive) {
      throw new Error('AbstractTerrainSystem: cannot manipulate a dead system');
    }

    if (!this.isInit) {
      return;
    }

    this.onRemoveInhibit(inhibit);
  }

  /** @inheritDoc */
  public removeAllInhibits(): void {
    if (!this.isAlive) {
      throw new Error('AbstractTerrainSystem: cannot manipulate a dead system');
    }

    if (!this.isInit) {
      return;
    }

    this.onRemoveAllInhibits();
  }

  /**
   * Responds to when this system's operating mode changes.
   * @param mode The new operating mode.
   */
  protected onOperatingModeChanged(mode: TerrainSystemOperatingMode): void {
    if (mode !== TerrainSystemOperatingMode.Operating) {
      if (mode === TerrainSystemOperatingMode.Off) {
        this.statuses.clear();
      }
      this.triggeredAlerts.clear();
    }
  }

  /**
   * Responds to when the set of this system's triggered alerts changes.
   * @param alerts The set of triggered alerts.
   * @param type The type of change that occurred.
   * @param alert The alert that was changed.
   */
  protected onTriggeredAlertsChanged(alerts: ReadonlySet<string>, type: SubscribableSetEventType, alert: string): void {
    if (this.isInit) {
      this.publishTriggeredAlert(alerts, type, alert);
    }

    if (type === SubscribableSetEventType.Added) {
      if (!this.inhibitedAlerts.has(alert)) {
        this.activeAlerts.add(alert);
      }
    } else {
      this.activeAlerts.delete(alert);
    }
  }

  /**
   * Responds to when the set of this system's inhibited alerts changes.
   * @param alerts The set of inhibited alerts.
   * @param type The type of change that occurred.
   * @param alert The alert that was changed.
   */
  protected onInhibitedAlertsChanged(alerts: ReadonlySet<string>, type: SubscribableSetEventType, alert: string): void {
    if (this.isInit) {
      this.publishInhibitedAlert(alerts, type, alert);
    }

    if (type === SubscribableSetEventType.Added) {
      this.activeAlerts.delete(alert);
    } else {
      if (this.triggeredAlerts.has(alert)) {
        this.activeAlerts.add(alert);
      }
    }
  }

  /**
   * Responds to when the set of this system's active alerts changes.
   * @param alerts The set of active alerts.
   * @param type The type of change that occurred.
   * @param alert The alert that was changed.
   */
  protected onActiveAlertsChanged(alerts: ReadonlySet<string>, type: SubscribableSetEventType, alert: string): void {
    if (this.isInit) {
      this.publishActiveAlert(alerts, type, alert);
    }

    this.prioritizedAlert.set(this.prioritizedAlertSelector(alerts));
  }

  /**
   * Publishes data to event bus alert topics based on a change to this system's active alerts.
   * @param alerts The set of active alerts.
   * @param type The type of change that occurred.
   * @param alert The alert that was changed.
   */
  protected publishTriggeredAlert(alerts: ReadonlySet<string>, type: SubscribableSetEventType, alert: string): void {
    this.publisher.pub(this.topicMap['terrainsys_triggered_alerts'], Array.from(alerts), true, true);

    if (type === SubscribableSetEventType.Added) {
      this.publisher.pub(this.topicMap['terrainsys_alert_triggered'], alert, true, false);
    } else {
      this.publisher.pub(this.topicMap['terrainsys_alert_untriggered'], alert, true, false);
    }
  }

  /**
   * Publishes data to event bus alert topics based on a change to this system's active alerts.
   * @param alerts The set of active alerts.
   * @param type The type of change that occurred.
   * @param alert The alert that was changed.
   */
  protected publishInhibitedAlert(alerts: ReadonlySet<string>, type: SubscribableSetEventType, alert: string): void {
    this.publisher.pub(this.topicMap['terrainsys_inhibited_alerts'], Array.from(alerts), true, true);

    if (type === SubscribableSetEventType.Added) {
      this.publisher.pub(this.topicMap['terrainsys_alert_inhibited'], alert, true, false);
    } else {
      this.publisher.pub(this.topicMap['terrainsys_alert_uninhibited'], alert, true, false);
    }
  }

  /**
   * Publishes data to event bus alert topics based on a change to this system's active alerts.
   * @param alerts The set of active alerts.
   * @param type The type of change that occurred.
   * @param alert The alert that was changed.
   */
  protected publishActiveAlert(alerts: ReadonlySet<string>, type: SubscribableSetEventType, alert: string): void {
    this.publisher.pub(this.topicMap['terrainsys_active_alerts'], Array.from(alerts), true, true);

    if (type === SubscribableSetEventType.Added) {
      this.publisher.pub(this.topicMap['terrainsys_alert_activated'], alert, true, false);
    } else {
      this.publisher.pub(this.topicMap['terrainsys_alert_deactivated'], alert, true, false);
    }
  }

  /**
   * A method that is called when this system receives a command to turn on.
   */
  protected onTurnOn(): void {
    // noop
  }

  /**
   * A method that is called when this system receives a command to turn off.
   */
  protected onTurnOff(): void {
    // noop
  }

  /**
   * A method that is called when this system receives a command to start a self-test.
   */
  protected onStartTest(): void {
    // noop
  }

  /**
   * A method that is called when this system receives a command to add an inhibit flag.
   * @param inhibit The flag to add.
   */
  protected onAddInhibit(inhibit: string): void {
    this.inhibits.add(inhibit);
  }

  /**
   * A method that is called when this system receives a command to remove an inhibit flag.
   * @param inhibit The flag to remove.
   */
  protected onRemoveInhibit(inhibit: string): void {
    this.inhibits.delete(inhibit);
  }

  /**
   * A method that is called when this system receives a command to remove all inhibit flags.
   */
  protected onRemoveAllInhibits(): void {
    this.inhibits.clear();
  }

  /**
   * Triggers an alert.
   * @param alert The alert to trigger.
   */
  protected triggerAlert(alert: string): void {
    if (this.operatingMode.get() === TerrainSystemOperatingMode.Operating) {
      this.triggeredAlerts.add(alert);
    }
  }

  /**
   * Untriggers an alert.
   * @param alert The alert to untrigger.
   */
  protected untriggerAlert(alert: string): void {
    this.triggeredAlerts.delete(alert);
  }

  /**
   * Inhibits an alert.
   * @param alert The alert to inhibit.
   */
  protected inhibitAlert(alert: string): void {
    this.inhibitedAlerts.add(alert);
  }

  /**
   * Uninhibits an alert.
   * @param alert The alert to uninhibit.
   */
  protected uninhibitAlert(alert: string): void {
    this.inhibitedAlerts.delete(alert);
  }

  /** @inheritDoc */
  public update(): void {
    if (!this.isAlive) {
      throw new Error('AbstractTerrainSystem: cannot update a dead system');
    }

    if (!this.isInit) {
      return;
    }

    this.onUpdate();
  }

  /**
   * A method that is called when this system is updated.
   */
  protected onUpdate(): void {
    this.updateModules();
  }

  /**
   * Updates this system's modules.
   */
  protected updateModules(): void {
    for (let i = 0; i < this.modules.length; i++) {
      this.modules[i].onUpdate(
        this.operatingMode.get(),
        this.statuses.get(),
        this.inhibits.get(),
        this.dataProvider.data,
        this.alertController
      );
    }
  }

  /** @inheritDoc */
  public destroy(): void {
    this.isAlive = false;

    for (const module of this.modules) {
      module.onDestroy();
    }

    for (const sub of this.subscriptions) {
      sub.destroy();
    }
  }
}
