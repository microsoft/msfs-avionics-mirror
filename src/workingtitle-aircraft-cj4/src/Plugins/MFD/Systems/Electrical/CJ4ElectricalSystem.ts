import { ConsumerValue, ElectricalEvents, EngineEvents, EventBus, Instrument, KeyEventManager, SimVarValueType } from '@microsoft/msfs-sdk';

/**
 * The electrical system for the Citation CJ4
 */
export class CJ4ElectricalSystem implements Instrument {
  private static readonly LEFT_ALT_TO_AC_BUS_LINE_INDEX = 8;
  private static readonly RIGHT_ALT_TO_AC_BUS_LINE_INDEX = 9;
  private static readonly LEFT_GEN_TO_XFEED_BUS_LINE_INDEX = 2;
  private static readonly RIGHT_GEN_TO_XFEED_BUS_LINE_INDEX = 3;
  private static readonly NON_CONVERTED_BUS_CONN_LINE_INDEX = 7;
  private static readonly AC_BUS_CONN_LINE_INDEX = 10;

  private keyEventManager?: KeyEventManager;

  private eng1N2 = ConsumerValue.create(this.bus.getSubscriber<EngineEvents>().on('n2_1').withPrecision(1), 0);
  private eng2N2 = ConsumerValue.create(this.bus.getSubscriber<EngineEvents>().on('n2_2').withPrecision(1), 0);
  private leftGenSwitch = ConsumerValue.create(this.bus.getSubscriber<ElectricalEvents>().on('elec_eng_gen_switch_1'), false);
  private rightGenSwitch = ConsumerValue.create(this.bus.getSubscriber<ElectricalEvents>().on('elec_eng_gen_switch_2'), false);

  private isLeftGenConnected = true;
  private isRightGenConnected = true;
  private isNonConvertedBusConnected = true;
  private isLeftAltConnected = false;
  private isRightAltConnected = false;
  private isAcBusConnected = false;

  private isLeftGenOnline = false;
  private isRightGenOnline = false;

  /** @inheritdoc */
  constructor(private readonly bus: EventBus) {
  }

  /** @inheritdoc */
  public init(): void {
    KeyEventManager.getManager(this.bus).then((manager) => {
      this.keyEventManager = manager;
    });
  }

  /** @inheritdoc */
  public onUpdate(): void {
    const eng1N2 = this.eng1N2.get();
    const eng2N2 = this.eng2N2.get();

    /** Check whether the engine N2 is > 45, and if it is then connect the generator to the xfeed bus, and vice versa. */
    this.isLeftGenConnected = this.setLineConnection(eng1N2 > 45, this.isLeftGenConnected, CJ4ElectricalSystem.LEFT_GEN_TO_XFEED_BUS_LINE_INDEX);
    this.isRightGenConnected = this.setLineConnection(eng2N2 > 45, this.isRightGenConnected, CJ4ElectricalSystem.RIGHT_GEN_TO_XFEED_BUS_LINE_INDEX);

    /** Check that the generators are connected to the crossfeed bus, and that they aren't switched off. */
    // TODO: Simply check the load on the gen->xfeed electrical line when possible to do so.
    this.isLeftGenOnline = this.leftGenSwitch.get() && this.isLeftGenConnected;
    this.isRightGenOnline = this.rightGenSwitch.get() && this.isRightGenConnected;

    /**
     * If both generators are offline, then connect the right alternator to the AC bus.
     * If the right alternator is also offline, then we will connect the left alternator to the AC bus.
     * When power is being supplied from the alternators, we will disconnect the non-converted bus,
     * and connect the AC bus to the battery bus.
     */
    const isAlternatorPowering = !this.isLeftGenOnline && !this.isRightGenOnline;
    const isRightAltPower = isAlternatorPowering && eng2N2 > 45;
    const isLeftAltPower = isAlternatorPowering && eng1N2 > 45 && !isRightAltPower;
    const isNonConvertedConnected = !isRightAltPower && !isLeftAltPower;
    this.isRightAltConnected = this.setLineConnection(isRightAltPower, this.isRightAltConnected, CJ4ElectricalSystem.RIGHT_ALT_TO_AC_BUS_LINE_INDEX);
    this.isLeftAltConnected = this.setLineConnection(isLeftAltPower, this.isLeftAltConnected, CJ4ElectricalSystem.LEFT_ALT_TO_AC_BUS_LINE_INDEX);

    this.isNonConvertedBusConnected = this.setLineConnection(isNonConvertedConnected, this.isNonConvertedBusConnected, CJ4ElectricalSystem.NON_CONVERTED_BUS_CONN_LINE_INDEX);
    this.isAcBusConnected = this.setLineConnection(!isNonConvertedConnected, this.isAcBusConnected, CJ4ElectricalSystem.AC_BUS_CONN_LINE_INDEX);
  }

  /**
   * Sets the engine alternator connection to the AC bus if it isn't already set
   * @param newState The state to set it to
   * @param currentState The current state
   * @param lineIndex The index of the line to set
   * @returns Whether the alternator is now connected to the AC bus
   */
  private setLineConnection(newState: boolean, currentState: boolean, lineIndex: number): boolean {
    if (newState !== currentState) {
      this.keyEventManager?.triggerKey('ELECTRICAL_LINE_CONNECTION_SET', true, lineIndex, newState === true ? 1 : 0);
      return newState;
    } else {
      return currentState;
    }
  }

  /**
   * Checks if a line is connected using the simvar
   * @param lineIndex The line index to check
   * @returns The result of LINE CONNECTION ON:#index#
   */
  private static getLineConnection(lineIndex: number): boolean {
    return SimVar.GetSimVarValue(`LINE CONNECTION ON:${lineIndex}`, SimVarValueType.Bool);
  }
}
