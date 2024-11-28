import { AdcEvents, ClockEvents, ConsumerSubject, EventBus, GameStateProvider, GeoPoint, GNSSEvents, SimVarValueType, Subject, Subscription, UnitType } from '@microsoft/msfs-sdk';
import { FMS_MESSAGE_ID, FmsPosEvents, MessageService, WT21NavigationUserSettings } from '@microsoft/msfs-wt21-shared';

/**
 * A class for managing the FMS POS initialization
 */
export class FmsPos {
  // TODO for the future
  // - persist last destination airport

  private tmpGeoPoint = new GeoPoint(0, 0);
  private isFmsPosValid = false;
  private publisher = this.bus.getPublisher<FmsPosEvents>();
  private subscriber = this.bus.getSubscriber<FmsPosEvents>();
  public readonly isPosInitialized = Subject.create<boolean>(false);
  public readonly gnssPos = ConsumerSubject.create(this.bus.getSubscriber<GNSSEvents>().on('gps-position').atFrequency(1).whenChanged(), new LatLongAlt());
  public readonly fmsPos = Subject.create<LatLongAlt>(new LatLongAlt());
  public readonly setPosValue = Subject.create<LatLongAlt | null>(null);
  private readonly onGround = ConsumerSubject.create<boolean>(this.bus.getSubscriber<AdcEvents>().on('on_ground').whenChanged(), true);
  private readonly simTime = ConsumerSubject.create<number>(this.bus.getSubscriber<ClockEvents>().on('simTime').whenChangedBy(1000), 0);
  private posInitTimeStamp: number | null = null;

  private gameStateSub?: Subscription;

  /**
   * Ctor
   * @param bus The event bus
   * @param messageService The message service
   */
  constructor(private readonly bus: EventBus,
    public readonly messageService: MessageService | undefined
  ) {
    const fmsPosSetting = WT21NavigationUserSettings.getManager(this.bus).getSetting('lastFmsPos');
    this.fmsPos.set(LatLong.fromStringFloat(fmsPosSetting.value) as LatLongAlt);

    this.isPosInitialized.sub((v: boolean) => {
      if (v) {
        this.messageService?.clear(FMS_MESSAGE_ID.INITIALIZE_POSITION);
        this.setPosValue.set(this.gnssPos.get());
        if (!this.onGround.get()) {
          this.posInitTimeStamp = this.simTime.get();
        }
      } else {
        this.messageService?.post(FMS_MESSAGE_ID.INITIALIZE_POSITION);
      }
    }, true);

    this.onGround.sub(onGround => {
      if (!onGround && this.isPosInitialized.get()) {
        this.posInitTimeStamp = this.simTime.get();
      }
    });

    this.simTime.sub(time => {
      if (this.posInitTimeStamp !== null && time >= this.posInitTimeStamp + 120000) {
        this.setPosValue.set(null);
        this.posInitTimeStamp = null;
      }
    });

    // subscribe to fms pos state on the bus to sync state with the other instrument
    this.subscriber.on('fms_pos_initialized').whenChanged().handle((v: boolean) => {
      this.isPosInitialized.set(v);
    });

    this.subscriber.on('fms_pos_valid').whenChanged().handle((v: boolean) => {
      this.isFmsPosValid = v;
    });

    this.fmsPos.sub((v: LatLongAlt) => {
      fmsPosSetting.value = v.toStringFloat();
    });

    // only let the primary instrument update the FMS POS
    const isPrimaryInstrument = this.messageService !== undefined;
    if (isPrimaryInstrument) {

      this.gameStateSub = GameStateProvider.get().sub(state => {
        if (state === GameState.ingame) {
          this.tryInitPosOnForFlightStart(this.gnssPos.get());
          this.gameStateSub?.destroy();
        }
      }, false, true);
      this.gameStateSub.resume(true);

      this.gnssPos.sub((v: LatLongAlt) => {
        if (this.isFmsPosValid && this.isPosInitialized.get()) {
          this.fmsPos.set(v);
        }
      }, true);

      this.fmsPos.sub((v: LatLongAlt) => {
        fmsPosSetting.value = v.toStringFloat();
      });

    } else {
      // the secondary instrument will only listen to the setting
      fmsPosSetting.sub((v) => {
        this.fmsPos.set(LatLong.fromStringFloat(v) as LatLongAlt);
      });
    }
  }

  /**
   * Initialize the FMS POS with the current GPS position.
   */
  public initPosWithGnss(): void {
    // fake some delay
    setTimeout(() => {
      if (this.fmsPos.get().lat) {
        // const dist = this.getFmsPosDistance();
        // now we can set fms pos since we have the distance of previous pos
        this.fmsPos.set(this.gnssPos.get());
        // // check if new fms pos > 40 nm from gnss pos
        // if (dist > 40) {
        //   this.messageService?.post(FMS_MESSAGE_ID.RESET_INITIAL_POS);
        //   return;
        // }
      }
      this.isFmsPosValid = true;
      this.publishState();
    }, 6000);
    // this.messageService?.clear(FMS_MESSAGE_ID.RESET_INITIAL_POS);
    this.isPosInitialized.set(true);
    this.publishState();
  }

  /** pre initialize fms pos when plane is already on (spawning on RWY)
   * @param pos GNSS Positon
   */
  private readonly tryInitPosOnForFlightStart = (pos: LatLongAlt): void => {
    // Unsub now, as we only wanted this to be called once.
    this.gameStateSub!.destroy();

    // checking for engines on is the most generic way to check if the plane is already on
    const enginesOn = SimVar.GetSimVarValue('ENG N1 RPM:1', SimVarValueType.RPM) > 1;
    if (enginesOn) {
      this.fmsPos.set(pos);
      this.isPosInitialized.set(true);
      this.isFmsPosValid = true;
      this.publishState();
    }
  };

  /**
   * Publishes the FMS POS state on the bus.
   */
  private publishState(): void {
    this.publisher.pub('fms_pos_initialized', this.isPosInitialized.get(), true, true);
    this.publisher.pub('fms_pos_valid', this.isFmsPosValid, true, true);
  }

  /**
   * Gets the distance from the FMS POS to the current GPS position.
   * @returns The distance in nautical miles.
   */
  private getFmsPosDistance(): number {
    const gnssPos = this.gnssPos.get();
    this.tmpGeoPoint.set(this.fmsPos.get().lat, this.fmsPos.get().long);
    const dist = UnitType.GA_RADIAN.convertTo(this.tmpGeoPoint.distance(gnssPos.lat, gnssPos.long), UnitType.NMILE);
    return dist;
  }
}
