import { ConsumerSubject, ConsumerValue, EventBus, SetSubject, Subscribable, SubscribableSet, Subscription } from '@microsoft/msfs-sdk';

import { TerrainSystemStateDataProvider } from './TerrainSystemStateDataProvider';
import { TerrainSystemOperatingMode } from './TerrainSystemTypes';
import { TerrainSystemEvents } from './TerrainSystemEvents';
import { TerrainSystemUtils } from './TerrainSystemUtils';

/**
 * A default implementation of {@link TerrainSystemStateDataProvider}.
 */
export class DefaultTerrainSystemStateDataProvider implements TerrainSystemStateDataProvider {

  private readonly _type = ConsumerSubject.create<string | undefined>(null, undefined).pause();
  /** @inheritDoc */
  public readonly type = this._type as Subscribable<string | undefined>;

  private readonly _operatingMode = ConsumerSubject.create(null, TerrainSystemOperatingMode.Off).pause();
  /** @inheritDoc */
  public readonly operatingMode = this._operatingMode as Subscribable<TerrainSystemOperatingMode>;

  private readonly statusFlagsSource = ConsumerValue.create<readonly string[]>(null, []);
  private readonly _statusFlags = SetSubject.create<string>();
  /** @inheritDoc */
  public readonly statusFlags = this._statusFlags as SubscribableSet<string> & Subscribable<ReadonlySet<string>>;

  private readonly inhibitFlagsSource = ConsumerValue.create<readonly string[]>(null, []);
  private readonly _inhibitFlags = SetSubject.create<string>();
  /** @inheritDoc */
  public readonly inhibitFlags = this._inhibitFlags as SubscribableSet<string> & Subscribable<ReadonlySet<string>>;

  private readonly triggeredAlertsSource = ConsumerValue.create<readonly string[]>(null, []);
  private readonly _triggeredAlerts = SetSubject.create<string>();
  /** @inheritDoc */
  public readonly triggeredAlerts = this._triggeredAlerts as SubscribableSet<string> & Subscribable<ReadonlySet<string>>;

  private readonly inhibitedAlertsSource = ConsumerValue.create<readonly string[]>(null, []);
  private readonly _inhibitedAlerts = SetSubject.create<string>();
  /** @inheritDoc */
  public readonly inhibitedAlerts = this._inhibitedAlerts as SubscribableSet<string> & Subscribable<ReadonlySet<string>>;

  private readonly activeAlertsSource = ConsumerValue.create<readonly string[]>(null, []);
  private readonly _activeAlerts = SetSubject.create<string>();
  /** @inheritDoc */
  public readonly activeAlerts = this._activeAlerts as SubscribableSet<string> & Subscribable<ReadonlySet<string>>;

  private readonly _prioritizedAlert = ConsumerSubject.create<string | null>(null, null).pause();
  /** @inheritDoc */
  public readonly prioritizedAlert = this._prioritizedAlert as Subscribable<string | null>;

  private isInit = false;
  private isAlive = true;
  private isPaused = true;

  private readonly pauseable: Subscription[] = [
    this._type,
    this._operatingMode,
    this._prioritizedAlert
  ];

  private readonly subscriptions: Subscription[] = [
    this._type,
    this._operatingMode,
    this._prioritizedAlert,
    this.statusFlagsSource,
    this.inhibitFlagsSource,
    this.activeAlertsSource
  ];

  /**
   * Creates a new instance of DefaultTerrainSystemStateDataProvider.
   * @param bus The event bus.
   * @param id The ID of the terrain alerting system for which to provide data.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly id: string
  ) {
  }

  /**
   * Initializes this data provider. Once initialized, this data provider will continuously update its data until
   * paused or destroyed.
   * @param paused Whether to initialize this data provider as paused. If `true`, this data provider will provide an
   * initial set of data but will not update the provided data until it is resumed. Defaults to `false`.
   * @throws Error if this data provider is dead.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('DefaultTerrainSystemStateDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<TerrainSystemEvents>();

    this._type.setConsumer(TerrainSystemUtils.onEvent(this.id, sub, 'terrainsys_type'));
    this._operatingMode.setConsumer(TerrainSystemUtils.onEvent(this.id, sub, 'terrainsys_operating_mode'));

    this.statusFlagsSource.setConsumer(TerrainSystemUtils.onEvent(this.id, sub, 'terrainsys_status_flags'));
    this.inhibitFlagsSource.setConsumer(TerrainSystemUtils.onEvent(this.id, sub, 'terrainsys_inhibit_flags'));
    this.triggeredAlertsSource.setConsumer(TerrainSystemUtils.onEvent(this.id, sub, 'terrainsys_triggered_alerts'));
    this.inhibitedAlertsSource.setConsumer(TerrainSystemUtils.onEvent(this.id, sub, 'terrainsys_inhibited_alerts'));
    this.activeAlertsSource.setConsumer(TerrainSystemUtils.onEvent(this.id, sub, 'terrainsys_active_alerts'));

    this._prioritizedAlert.setConsumer(TerrainSystemUtils.onEvent(this.id, sub, 'terrainsys_prioritized_alert'));

    const addToSet = (set: SetSubject<string>, key: string): void => {
      set.add(key);
    };
    const removeFromSet = (set: SetSubject<string>, key: string): void => {
      set.delete(key);
    };

    const setSubs = [
      TerrainSystemUtils.onEvent(this.id, sub, 'terrainsys_status_added').handle(addToSet.bind(this, this._statusFlags)),
      TerrainSystemUtils.onEvent(this.id, sub, 'terrainsys_status_removed').handle(removeFromSet.bind(this, this._statusFlags)),
      TerrainSystemUtils.onEvent(this.id, sub, 'terrainsys_inhibit_added').handle(addToSet.bind(this, this._inhibitFlags)),
      TerrainSystemUtils.onEvent(this.id, sub, 'terrainsys_inhibit_removed').handle(removeFromSet.bind(this, this._inhibitFlags)),
      TerrainSystemUtils.onEvent(this.id, sub, 'terrainsys_alert_triggered').handle(addToSet.bind(this, this._triggeredAlerts)),
      TerrainSystemUtils.onEvent(this.id, sub, 'terrainsys_alert_untriggered').handle(removeFromSet.bind(this, this._triggeredAlerts)),
      TerrainSystemUtils.onEvent(this.id, sub, 'terrainsys_alert_inhibited').handle(addToSet.bind(this, this._inhibitedAlerts)),
      TerrainSystemUtils.onEvent(this.id, sub, 'terrainsys_alert_uninhibited').handle(removeFromSet.bind(this, this._inhibitedAlerts)),
      TerrainSystemUtils.onEvent(this.id, sub, 'terrainsys_alert_activated').handle(addToSet.bind(this, this._activeAlerts)),
      TerrainSystemUtils.onEvent(this.id, sub, 'terrainsys_alert_deactivated').handle(removeFromSet.bind(this, this._activeAlerts))
    ];

    this.pauseable.push(...setSubs);
    this.subscriptions.push(...setSubs);

    if (!paused) {
      this.resume();
    }
  }

  /**
   * Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or
   * destroyed.
   * @throws Error if this data provider is dead.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('DefaultTerrainSystemStateDataProvider: cannot resume a dead provider');
    }

    if (!this.isInit || !this.isPaused) {
      return;
    }

    this.isPaused = false;

    this._statusFlags.set(this.statusFlagsSource.get());
    this._inhibitFlags.set(this.inhibitFlagsSource.get());
    this._triggeredAlerts.set(this.triggeredAlertsSource.get());
    this._inhibitedAlerts.set(this.inhibitedAlertsSource.get());
    this._activeAlerts.set(this.activeAlertsSource.get());

    for (const pauseable of this.pauseable) {
      pauseable.resume();
    }
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultTerrainSystemStateDataProvider: cannot pause a dead provider');
    }

    if (!this.isInit || this.isPaused) {
      return;
    }

    this.isPaused = true;

    for (const pauseable of this.pauseable) {
      pauseable.pause();
    }
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    for (const sub of this.subscriptions) {
      sub.destroy();
    }
  }
}
