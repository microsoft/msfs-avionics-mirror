/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ConsumerSubject, ControlEvents, EventBus, KeyEventData, KeyEventManager, KeyEvents, NavEvents, NavSourceType, SimVarValueType, Subscription } from '@microsoft/msfs-sdk';
import { ActiveNavSource, GarminNavEvents, GarminNavVars } from '@microsoft/msfs-garminsdk';

/**
 * A manager for the active navigation source. Changes the active navigation source in response to control events and
 * keeps various data in sync with the active nav source.
 */
export class ActiveNavSourceManager {
  private readonly publisher = this.bus.getPublisher<NavEvents>();

  private keyEventManager?: KeyEventManager;

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly keyEventManagerReadyPromises: { resolve: () => void, reject: (reason?: any) => void }[] = [];

  private readonly source1 = ConsumerSubject.create(null, ActiveNavSource.Nav1);
  private readonly source2 = ConsumerSubject.create(null, ActiveNavSource.Nav1);

  private srcSetSub?: Subscription;
  private srcSwitchSub?: Subscription;

  private isAlive = true;
  private isInit = false;

  private keyEventSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {
    KeyEventManager.getManager(this.bus).then(manager => {
      this.keyEventManager = manager;
      while (this.isAlive && this.keyEventManagerReadyPromises.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.keyEventManagerReadyPromises.shift()!.resolve();
      }
    });
  }

  /**
   * Waits for this manager's key event manager to be ready.
   * @returns A Promise which will be fulfilled when this manager's key event manager is ready, or rejected if this
   * manager is destroyed before then.
   */
  private awaitKeyEventManagerReady(): Promise<void> {
    if (this.keyEventManager !== undefined) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => { this.keyEventManagerReadyPromises.push({ resolve, reject }); });
  }

  /**
   * Initializes this manager. Once this manager is initialized, it will manage the active navigation source in
   * response to control events and keep various data in sync with the active nav source.
   * @throws Error if this manager has been destroyed.
   */
  public async init(): Promise<void> {
    if (!this.isAlive) {
      throw new Error('ActiveNavSourceManager: cannot initialize a dead manager');
    }

    await this.awaitKeyEventManagerReady();

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    this.keyEventManager!.interceptKey('AP_NAV_SELECT_SET', false);
    this.keyEventManager!.interceptKey('TOGGLE_GPS_DRIVES_NAV1', false);

    const sub = this.bus.getSubscriber<GarminNavEvents & ControlEvents & KeyEvents>();

    // TODO: Support both active nav sources.

    // Initialize the state based on the sim state so that we respect what was set in the .FLT files.
    if (SimVar.GetSimVarValue('GPS DRIVES NAV1', SimVarValueType.Bool) !== 0) {
      this.setActiveNavSource(1, ActiveNavSource.Gps1);
      this.publisher.pub('cdi_select', { index: 1, type: NavSourceType.Gps }, true, true);
    } else {
      if (SimVar.GetSimVarValue('AUTOPILOT NAV SELECTED', SimVarValueType.Number) !== 1) {
        this.setActiveNavSource(1, ActiveNavSource.Nav2);
        this.publisher.pub('cdi_select', { index: 2, type: NavSourceType.Nav }, true, true);
      } else {
        this.setActiveNavSource(1, ActiveNavSource.Nav1);
        this.publisher.pub('cdi_select', { index: 1, type: NavSourceType.Nav }, true, true);
      }
    }

    this.source1.setConsumer(sub.on('active_nav_source_1'));

    this.source1.sub(source => {
      const cdiSelect = {
        index: 1,
        type: NavSourceType.Nav
      };

      switch (source) {
        case ActiveNavSource.Nav1:
          cdiSelect.index = 1;
          cdiSelect.type = NavSourceType.Nav;
          break;
        case ActiveNavSource.Nav2:
          cdiSelect.index = 2;
          cdiSelect.type = NavSourceType.Nav;
          break;
        case ActiveNavSource.Gps1:
          cdiSelect.index = 1;
          cdiSelect.type = NavSourceType.Gps;
          break;
        case ActiveNavSource.Gps2:
          cdiSelect.index = 2;
          cdiSelect.type = NavSourceType.Gps;
          break;
      }

      SimVar.SetSimVarValue('GPS DRIVES NAV1', SimVarValueType.Bool, cdiSelect.type === NavSourceType.Gps);
      if (cdiSelect.type === NavSourceType.Nav) {
        SimVar.SetSimVarValue('AUTOPILOT NAV SELECTED', SimVarValueType.Number, cdiSelect.index);
      }

      this.publisher.pub('cdi_select', cdiSelect, true, true);
    });

    this.srcSetSub = sub.on('cdi_src_set').handle((src) => {
      if (src.type === NavSourceType.Gps) {
        src.index === 2 ? this.setActiveNavSource(1, ActiveNavSource.Gps2) : this.setActiveNavSource(1, ActiveNavSource.Gps1);
      } else if (src.type === NavSourceType.Nav) {
        src.index === 2 ? this.setActiveNavSource(1, ActiveNavSource.Nav2) : this.setActiveNavSource(1, ActiveNavSource.Nav1);
      }
    });

    this.srcSwitchSub = sub.on('cdi_src_switch').handle(this.switchActiveNavSource.bind(this, 1));

    this.keyEventSub = sub.on('key_intercept').handle(this.onKeyIntercepted.bind(this));
  }

  /**
   * Responds to when a key event is intercepted.
   * @param data The data for the intercepted key event.
   */
  private onKeyIntercepted(data: KeyEventData): void {
    switch (data.key) {
      case 'AP_NAV_SELECT_SET':
        if (data.value0 !== undefined && (data.value0 === 1 || data.value0 === 2)) {
          this.setActiveNavSource(1, data.value0 === 1 ? ActiveNavSource.Nav1 : ActiveNavSource.Nav2);
        }
        break;
      case 'TOGGLE_GPS_DRIVES_NAV1': {
        const currentSource = this.source1.get();
        switch (currentSource) {
          case ActiveNavSource.Gps1:
          case ActiveNavSource.Gps2:
            this.setActiveNavSource(1, ActiveNavSource.Nav1);
            break;
          default:
            this.setActiveNavSource(1, ActiveNavSource.Gps1);
        }
        break;
      }
    }
  }

  /**
   * Sets the active nav source.
   * @param index The index of the active nav source to set.
   * @param source The source to set.
   */
  private setActiveNavSource(index: 1 | 2, source: ActiveNavSource): void {
    SimVar.SetSimVarValue(index === 1 ? GarminNavVars.ActiveNavSource1 : GarminNavVars.ActiveNavSource2, SimVarValueType.Number, source);
  }

  /**
   * Switches the active nav source.
   * @param index The index of the active nav source to set.
   */
  private switchActiveNavSource(index: 1 | 2): void {
    const currentSource = index === 1 ? this.source1.get() : this.source2.get();

    // TODO: support multiple FMS sources
    switch (currentSource) {
      case ActiveNavSource.Nav1:
        this.setActiveNavSource(index, ActiveNavSource.Nav2);
        break;
      case ActiveNavSource.Nav2:
        this.setActiveNavSource(index, ActiveNavSource.Gps1);
        break;
      default:
        this.setActiveNavSource(index, ActiveNavSource.Nav1);
    }
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.keyEventManagerReadyPromises.forEach(promise => { promise.reject('ActiveNavSourceManager: manager was destroyed'); });

    this.source1.destroy();
    this.source2.destroy();

    this.srcSetSub?.destroy();
    this.srcSwitchSub?.destroy();
    this.keyEventSub?.destroy();
  }
}