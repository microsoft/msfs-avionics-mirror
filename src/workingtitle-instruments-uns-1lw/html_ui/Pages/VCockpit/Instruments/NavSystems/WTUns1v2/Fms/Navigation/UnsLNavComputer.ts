import {
  Accessible, DefaultLNavComputerDataProvider, EventBus, FlightPlanner, LNavComputer, LNavComputerDataProvider, LNavRollSteerCommand, LNavRollSteerComputer,
  LNavRollSteerComputerDataProvider, LNavSteerCommand, Subscribable
} from '@microsoft/msfs-sdk';

/**
 * A UNS LNAV computer.
 */
export class UnsLNavComputer {
  private readonly lnavComputerDataProvider: DefaultLNavComputerDataProvider;
  private readonly lnavComputer: LNavComputer;
  private readonly lnavRollSteerComputer: LNavRollSteerComputer;

  /** The current roll steering command calculated by this computer. */
  public readonly steerCommand: Subscribable<Readonly<LNavRollSteerCommand>>;

  /**
   * Creates a new instance of UnsLNavComputer.
   * @param index The index of this computer.
   * @param bus The event bus to use with this instance.
   * @param flightPlanner The flight planner from which to source the active flight plan.
   * @param maxBankAngle A function which returns the maximum bank angle, in degrees, supported by the computer.
   */
  public constructor(
    index: number,
    bus: EventBus,
    flightPlanner: FlightPlanner,
    maxBankAngle: () => number
  ) {
    this.lnavComputerDataProvider = new DefaultLNavComputerDataProvider();
    this.lnavComputer = new LNavComputer(
      index,
      bus,
      flightPlanner,
      undefined,
      {
        dataProvider: this.lnavComputerDataProvider,
        maxBankAngle
      }
    );
    this.lnavRollSteerComputer = new LNavRollSteerComputer(
      new UnsLNavRollSteerComputerDataProvider(this.lnavComputer.steerCommand, this.lnavComputerDataProvider),
      { maxBankAngle }
    );
    this.steerCommand = this.lnavRollSteerComputer.steerCommand;
  }

  /**
   * Updates this computer.
   */
  public update(): void {
    this.lnavComputerDataProvider.update();
    this.lnavComputer.update();
    this.lnavRollSteerComputer.update(Date.now());
  }
}

/**
 * A provider of LNAV roll-steering computer data used by {@link UnsLNavComputer}.
 */
class UnsLNavRollSteerComputerDataProvider implements LNavRollSteerComputerDataProvider {
  /** @inheritDoc */
  public readonly gs: Accessible<number | null>;

  /** @inheritDoc */
  public readonly track: Accessible<number | null>;

  /** @inheritDoc */
  public readonly heading: Accessible<number | null>;

  /**
   * Creates a new instance of UnsLNavRollSteerComputerDataProvider.
   * @param lnavSteerCommand The current LNAV steering command.
   * @param source The source from which this provider gets its airplane state data.
   */
  public constructor(
    public readonly lnavSteerCommand: Accessible<LNavSteerCommand>,
    source: LNavComputerDataProvider,
  ) {
    this.gs = source.gs;
    this.track = source.track;
    this.heading = source.heading;
  }
}
