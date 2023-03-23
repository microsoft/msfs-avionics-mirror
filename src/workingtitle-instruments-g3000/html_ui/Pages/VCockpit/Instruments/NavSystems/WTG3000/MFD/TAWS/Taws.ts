import {
  AdcEvents, APVerticalModes, AvionicsSystemState, AvionicsSystemStateEvent, ClockEvents, ConsumerSubject, ConsumerValue, EventBus,
  ExpSmoother, GeoPoint, MappedSubject, Subject, Subscribable, SubscribableUtils, Subscription, UnitType
} from '@microsoft/msfs-sdk';
import { FmaData, FmaDataEvents, FmsPositionMode, FmsPositionSystemEvents, RadarAltimeterSystemEvents } from '@microsoft/msfs-garminsdk';
import { TawsOperatingMode } from '@microsoft/msfs-wtg3000-common';
import { TawsModule } from './TawsModule';

/**
 * A TAWS system.
 */
export class Taws {

  private readonly modules: TawsModule[] = [];

  private readonly operatingMode = Subject.create(TawsOperatingMode.Off);

  private readonly fmsPosIndex: Subscribable<number>;

  private readonly isOnGround = ConsumerValue.create(null, false);

  private readonly _hasGpsPos = Subject.create(false);
  private readonly gpsPos = new GeoPoint(0, 0);

  private readonly radarAltimeterState = ConsumerSubject.create<AvionicsSystemStateEvent | undefined>(null, undefined);
  private readonly radarAltitudeSource = ConsumerValue.create(null, 0);
  private readonly radarAltitudeSmoother = new ExpSmoother(1000 / Math.LN2);

  private readonly fmaData = ConsumerSubject.create<FmaData | undefined>(null, undefined);

  private readonly data = {
    isOnGround: false,
    isGpsPosValid: false,
    gpsPos: this.gpsPos.readonly,
    gpsAltitude: 0,
    isRadarAltitudeValid: false,
    radarAltitude: 0,
    isGsGpActive: false
  };

  private readonly _isPowered = Subject.create(true);
  private readonly operatingModeState = MappedSubject.create(this._isPowered);

  private lastUpdateTime: number | undefined = undefined;

  private isAlive = true;
  private isInit = false;

  private fmsPosIndexSub?: Subscription;
  private fmsPosModeSub?: Subscription;
  private gpsAltitudeSub?: Subscription;
  private updateSub?: Subscription;

  /**
   * Creates a new instance of Taws.
   * @param bus The event bus.
   * @param fmsPosIndex The index of the FMS geo-positioning system from which to source data.
   */
  constructor(
    private readonly bus: EventBus,
    fmsPosIndex: number | Subscribable<number>
  ) {
    this.fmsPosIndex = SubscribableUtils.toSubscribable(fmsPosIndex, true);

    this.operatingModeState.pipe(this.operatingMode, ([isPowered]) => {
      if (isPowered) {
        return TawsOperatingMode.Normal;
      } else {
        return TawsOperatingMode.Off;
      }
    });
  }

  /**
   * Adds a module to this system.
   * @param module The module to add.
   * @returns This system, after the module has been added.
   */
  public addModule(module: TawsModule): this {
    this.modules.push(module);

    if (this.isInit) {
      module.onInit();
    }

    return this;
  }

  /**
   * Initializes this system. Once this system is initialized, it will begin collecting data and updating its modules.
   * @throws Error if this system has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('Taws: cannot initialize a dead system');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<ClockEvents & FmsPositionSystemEvents & RadarAltimeterSystemEvents & AdcEvents & FmaDataEvents>();

    this.isOnGround.setConsumer(sub.on('on_ground'));

    this.radarAltimeterState.setConsumer(sub.on('radaralt_state_1'));
    this.radarAltitudeSource.setConsumer(sub.on('radio_alt'));

    this.fmaData.setConsumer(sub.on('fma_data'));

    const updateFmsPosMode = (mode: FmsPositionMode): void => {
      this._hasGpsPos.set(mode !== FmsPositionMode.None && mode !== FmsPositionMode.DeadReckoning && mode !== FmsPositionMode.DeadReckoningExpired);
      this.data.isGpsPosValid = this._hasGpsPos.get();
    };

    const updateGpsPos = (lla: LatLongAlt): void => {
      this.gpsPos.set(lla.lat, lla.long);
      this.data.gpsAltitude = UnitType.METER.convertTo(lla.alt, UnitType.FOOT);
    };

    this.fmsPosIndexSub = this.fmsPosIndex.sub(index => {
      this.fmsPosModeSub?.destroy();
      this.gpsAltitudeSub?.destroy();

      if (index <= 0) {
        this._hasGpsPos.set(false);
        this.data.isGpsPosValid = false;
      } else {
        this.fmsPosModeSub = sub.on(`fms_pos_mode_${index}`).handle(updateFmsPosMode);
        this.gpsAltitudeSub = sub.on(`fms_pos_gps-position_${index}`).handle(updateGpsPos);
      }
    }, true);

    this.radarAltimeterState.sub(state => {
      this.data.isRadarAltitudeValid = state !== undefined && state.current === AvionicsSystemState.On;
    }, true);

    this.fmaData.sub(data => {
      const verticalActive = data?.verticalActive;
      this.data.isGsGpActive = verticalActive === APVerticalModes.GS || verticalActive === APVerticalModes.GP;
    }, true);

    for (let i = 0; i < this.modules.length; i++) {
      this.modules[i].onInit();
    }

    this.updateSub = sub.on('simTime').whenChanged().handle(this.update.bind(this));
  }

  /**
   * Checks if this system is powered.
   * @returns Whether this is system is powered.
   */
  public isPowered(): boolean {
    return this._isPowered.get();
  }

  /**
   * Sets whether this system is powered.
   * @param isPowered Whether this system is powered.
   */
  public setPowered(isPowered: boolean): void {
    this._isPowered.set(isPowered);
  }

  /**
   * Updates this system.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   */
  private update(simTime: number): void {
    const dt = Math.max(0, simTime - (this.lastUpdateTime ?? simTime));

    this.data.isOnGround = this.isOnGround.get();
    this.data.radarAltitude = this.radarAltitudeSmoother.next(this.radarAltitudeSource.get(), dt);

    const operatingMode = this.operatingMode.get();
    for (let i = 0; i < this.modules.length; i++) {
      this.modules[i].onUpdate(simTime, operatingMode, this.data);
    }

    this.lastUpdateTime = simTime;
  }

  /**
   * Destroys this system.
   */
  public destroy(): void {
    this.isAlive = false;

    this.isOnGround.destroy();

    this.radarAltimeterState.destroy();
    this.radarAltitudeSource.destroy();

    this.fmaData.destroy();

    this.fmsPosIndexSub?.destroy();
    this.fmsPosModeSub?.destroy();
    this.gpsAltitudeSub?.destroy();
    this.updateSub?.destroy();

    for (let i = 0; i < this.modules.length; i++) {
      this.modules[i].onDestroy();
    }
  }
}