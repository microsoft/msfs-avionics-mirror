import {
  APVerticalModes, CdiControlEvents, CdiEvents, CdiUtils, ConsumerSubject, ConsumerValue, DebounceTimer, EventBus, LNavEvents,
  LNavUtils, NavSourceId, NavSourceType, SimVarValueType, Subscribable, SubscribableUtils, Subscription
} from '@microsoft/msfs-sdk';

import { Fms } from '../flightplan/Fms';
import { FmsUtils } from '../flightplan/FmsUtils';
import { FmaDataEvents } from './FmaData';

/**
 * Configuration options for {@link GarminGoAroundManager}.
 */
export type GarminGoAroundManagerOptions = {
  /** The ID of the CDI controlled by the manager. Defaults to the empty string (`''`). */
  cdiId?: string | Subscribable<string>;
};

/**
 * A manager which responds to autopilot go-around mode activation by attempting to switch the active navigation
 * soruce to GPS and activate the missed approach.
 */
export class GarminGoAroundManager {

  private readonly fms: Subscribable<Fms>;
  private isLNavIndexValid = false;

  private readonly cdiId: Subscribable<string>;

  private isGaActive?: boolean;

  private readonly isLNavTracking = ConsumerValue.create(null, false).pause();
  private readonly activeNavSource = ConsumerSubject.create<Readonly<NavSourceId>>(
    null,
    { type: NavSourceType.Nav, index: 1 },
    CdiUtils.navSourceIdEquals
  ).pause();

  private readonly gpsSelectedDebounceTimer = new DebounceTimer();
  private readonly gpsSelectedCallback = (): void => {
    if (this.activeNavSource.get().type === NavSourceType.Gps) {
      this.onGpsNavSourceSelected();
    }
  };

  private isInit = false;
  private isAlive = true;
  private isPaused = true;

  private fmsSub?: Subscription;
  private cdiIdSub?: Subscription;
  private fmaDataSub?: Subscription;
  private activeNavSourceSub?: Subscription;

  /**
   * Creates a new instance of GarminGoAroundManager.
   * @param bus The event bus.
   * @param fms The FMS.
   * @param options Options with which to configure the manager.
   */
  public constructor(
    private readonly bus: EventBus,
    fms: Fms | Subscribable<Fms>,
    options?: Readonly<GarminGoAroundManagerOptions>
  ) {
    this.fms = SubscribableUtils.toSubscribable(fms, true);
    this.cdiId = SubscribableUtils.toSubscribable(options?.cdiId ?? '', true);
  }

  /**
   * Initializes this manager. Once initialized, this manager will automatically attempt to switch the active
   * navigation source to GPS and activate the missed approach and when autopilot go-around mode is activated.
   * @param paused Whether to initialize this manager as paused. Defaults to `false`.
   * @throws Error if this manager has been destroyed.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('GarminGoAroundManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<FmaDataEvents & LNavEvents & CdiEvents>();

    this.fmsSub = this.fms.sub(fms => {
      if (LNavUtils.isValidLNavIndex(fms.lnavIndex)) {
        this.isLNavIndexValid = true;
        this.isLNavTracking.setConsumer(sub.on(`lnav_is_tracking${LNavUtils.getEventBusTopicSuffix(fms.lnavIndex)}`));
      } else {
        this.isLNavIndexValid = false;
        this.isLNavTracking.setConsumer(null);
      }
    }, true);

    this.cdiIdSub = this.cdiId.sub(id => {
      this.activeNavSource.setConsumer(sub.on(`cdi_select${CdiUtils.getEventBusTopicSuffix(id)}`));
    }, true);

    this.activeNavSourceSub = this.activeNavSource.sub(source => {
      this.activeNavSourceSub?.pause();

      if (source.type === NavSourceType.Gps) {
        // Delay the callback by one frame in order to ensure that Fms gets the active nav source change event
        // before we try to activate the missed approach.
        this.gpsSelectedDebounceTimer.schedule(this.gpsSelectedCallback, 0);
      }
    }, false, true);

    this.fmaDataSub = sub.on('fma_data').handle(fmaData => {
      const isGaActive = fmaData.verticalActive === APVerticalModes.GA;

      if (isGaActive && this.isGaActive === false) {
        this.onGaActivated();
      }

      this.isGaActive = isGaActive;
    }, true);

    if (!paused) {
      this.resume();
    }
  }

  /**
   * Responds to when go-around mode has been activated. This will switch the active navigation source to GPS and the
   * autopilot lateral mode to NAV (GPS/FMS) if an approach is loaded and LNAV guidance is available. Additionally,
   * this will activate the missed approach if such an action is possible.
   */
  private onGaActivated(): void {
    this.activeNavSourceSub?.pause();

    const fms = this.fms.get();

    if (
      this.isLNavIndexValid
      && this.isLNavTracking.get()
      && fms.hasPrimaryFlightPlan()
      && FmsUtils.isApproachLoaded(fms.getPrimaryFlightPlan())
    ) {
      if (this.activeNavSource.get().type === NavSourceType.Gps) {
        this.onGpsNavSourceSelected();
      } else {
        this.activeNavSourceSub?.resume();

        this.bus.getPublisher<CdiControlEvents>().pub(`cdi_src_set${CdiUtils.getEventBusTopicSuffix(this.cdiId.get())}`, {
          type: NavSourceType.Gps,
          index: 1
        }, true, false);
      }
    }
  }

  /**
   * Responds to when GPS has been selected as the active navigation source after go-around mode has been activated.
   */
  private onGpsNavSourceSelected(): void {
    // Switch AP lateral mode to NAV.
    SimVar.SetSimVarValue('K:AP_NAV1_HOLD_ON', SimVarValueType.Number, 0);

    const fms = this.fms.get();

    // Attempt to activate missed approach.
    if (fms.canMissedApproachActivate()) {
      fms.activateMissedApproach();
    }
  }

  /**
   * Resumes this manager. Once resumed, this manager will automatically attempt to switch the active navigation source
   * to GPS and activate the missed approach and when autopilot go-around mode is activated.
   * @throws Error if this manager has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('GarminGoAroundManager: cannot resume a dead manager');
    }

    if (!this.isInit || !this.isPaused) {
      return;
    }

    this.isPaused = false;

    this.isLNavTracking.resume();
    this.activeNavSource.resume();

    this.fmaDataSub?.resume();
  }

  /**
   * Pauses this manager. Once paused, this data provider will not respond to go-around mode activations until it is
   * resumed.
   * @throws Error if this manager has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('GarminGoAroundManager: cannot pause a dead manager');
    }

    if (!this.isInit || this.isPaused) {
      return;
    }

    this.isPaused = true;

    this.isLNavTracking.pause();
    this.activeNavSource.pause();

    this.fmaDataSub?.pause();
    this.activeNavSourceSub?.pause();

    this.isGaActive = undefined;
  }

  /**
   * Destroys this manager. Once destroyed, this manager will cease responding to go-around mode activations, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.gpsSelectedDebounceTimer.clear();

    this.isLNavTracking.destroy();
    this.activeNavSource.destroy();

    this.fmsSub?.destroy();
    this.cdiIdSub?.destroy();
    this.activeNavSourceSub?.destroy();
    this.fmaDataSub?.destroy();
  }
}