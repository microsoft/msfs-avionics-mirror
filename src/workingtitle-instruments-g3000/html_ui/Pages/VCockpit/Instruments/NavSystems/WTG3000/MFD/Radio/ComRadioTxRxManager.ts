import { ConsumerSubject, EventBus, MappedSubject, NavComSimVars, Subscription } from '@microsoft/msfs-sdk';
import { ComRadioReceiveMode, G3000ComRadioUserSettings, G3000RadioUtils } from '@microsoft/msfs-wtg3000-common';

/**
 * A manager which controls COM radio transmit and receive states.
 */
export class ComRadioTxRxManager {

  private readonly isCom1Transmitting = ConsumerSubject.create(null, false);
  private readonly isCom2Transmitting = ConsumerSubject.create(null, false);
  private readonly isCom3Transmitting = ConsumerSubject.create(null, false);

  private readonly radioTransmitting = MappedSubject.create(
    ([isCom1Transmitting, isCom2Transmitting]): 'COM1' | 'COM2' | undefined => {
      // If the transmit states of COM1 and COM2 are equal, we are in an intermediate state, so we return undefined
      // while waiting for the state to resolve itself.
      if (isCom1Transmitting === isCom2Transmitting) {
        return undefined;
      }

      return isCom1Transmitting ? 'COM1' : 'COM2';
    },
    this.isCom1Transmitting,
    this.isCom2Transmitting
  );

  private readonly isCom1Receiving = ConsumerSubject.create(null, false);
  private readonly isCom2Receiving = ConsumerSubject.create(null, false);

  private readonly comRadioSettingManager = G3000ComRadioUserSettings.getManager(this.bus);
  private readonly comTransmitSetting = this.comRadioSettingManager.getSetting('comRadioTransmit');
  private readonly com1ReceiveSetting = this.comRadioSettingManager.getSetting('comRadio1ReceiveMode');
  private readonly com2ReceiveSetting = this.comRadioSettingManager.getSetting('comRadio2ReceiveMode');

  private lastKnownRadioTransmitting: 'COM1' | 'COM2' = 'COM1';

  private isAlive = true;
  private isInit = false;

  private com1ReceivingSub?: Subscription;
  private com2ReceivingSub?: Subscription;

  private comTransmitSettingSub?: Subscription;
  private com1ReceiveSettingSub?: Subscription;
  private com2ReceiveSettingSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {
  }

  /**
   * Initializes this manager. Once initialized, this manager will control COM radio transmit and receive states.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('ComRadioTxRxManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<NavComSimVars>();

    this.isCom1Transmitting.setConsumer(sub.on('com_transmit_1'));
    this.isCom2Transmitting.setConsumer(sub.on('com_transmit_2'));
    this.isCom3Transmitting.setConsumer(sub.on('com_transmit_3'));

    this.isCom1Receiving.setConsumer(sub.on('com_receive_1'));
    this.isCom2Receiving.setConsumer(sub.on('com_receive_2'));

    this.radioTransmitting.sub(radio => {
      if (radio !== undefined) {
        this.lastKnownRadioTransmitting = radio;
        this.reconcileStateFromTransmittingRadio();
      }
    });

    // COM3 should never be the transmitting radio, so if it ever is transmitting, revert the transmitting radio back
    // to the last known valid transmitting radio (COM1/2).
    this.isCom3Transmitting.sub(transmit => {
      if (transmit) {
        G3000RadioUtils.setComRadioTransmitting(this.lastKnownRadioTransmitting);
      }
    }, true);

    this.com1ReceivingSub = this.isCom1Receiving.sub(this.reconcileStateFromReceivingRadio.bind(this, 'COM1'));
    this.com2ReceivingSub = this.isCom2Receiving.sub(this.reconcileStateFromReceivingRadio.bind(this, 'COM2'));

    this.comTransmitSettingSub = this.comTransmitSetting.sub(transmitting => {
      G3000RadioUtils.setComRadioTransmitting(transmitting);
    }, true);

    this.com1ReceiveSettingSub = this.com1ReceiveSetting.sub(this.reconcileStateFromReceiveSetting.bind(this, 'COM1'));
    this.com2ReceiveSettingSub = this.com2ReceiveSetting.sub(this.reconcileStateFromReceiveSetting.bind(this, 'COM2'));
  }

  /**
   * Reconciles this manager's state based on the COM radio currently set to transmit.
   */
  private reconcileStateFromTransmittingRadio(): void {
    const transmitting = this.radioTransmitting.get();

    if (transmitting === undefined) {
      return;
    }

    // Sync the user setting with the transmitting radio.
    this.comTransmitSetting.value = transmitting;

    if (transmitting === 'COM1') {
      // Only the receive mode user setting for the transmitting radio controls the COM radio receive states, so make
      // sure we are listening to the right user setting.
      this.com2ReceiveSettingSub?.pause();
      this.com1ReceiveSettingSub?.resume();

      // Sync the COM radio receive states with the appropriate receive mode user setting.
      G3000RadioUtils.setComRadioReceiveState('COM1', true);
      G3000RadioUtils.setComRadioReceiveState('COM2', this.com1ReceiveSetting.value === ComRadioReceiveMode.Both);
    } else {
      // Only the receive mode user setting for the transmitting radio controls the COM radio receive states, so make
      // sure we are listening to the right user setting.
      this.com1ReceiveSettingSub?.pause();
      this.com2ReceiveSettingSub?.resume();

      // Sync the COM radio receive states with the appropriate receive mode user setting.
      G3000RadioUtils.setComRadioReceiveState('COM2', true);
      G3000RadioUtils.setComRadioReceiveState('COM1', this.com2ReceiveSetting.value === ComRadioReceiveMode.Both);
    }
  }

  /**
   * Reconciles this manager's state based on a change in a COM radio's receive state.
   * @param radio The COM radio whose receive state changed.
   * @param receiving Whether the COM radio is currently set to receive.
   */
  private reconcileStateFromReceivingRadio(radio: 'COM1' | 'COM2', receiving: boolean): void {
    const transmitting = this.radioTransmitting.get();

    if (transmitting === undefined) {
      return;
    }

    if (radio === transmitting) {
      // Ensure that the transmitting radio is always receiving.
      if (!receiving) {
        G3000RadioUtils.setComRadioReceiveState(radio, true);
      }
    } else {
      const setting = transmitting === 'COM1' ? this.com1ReceiveSetting : this.com2ReceiveSetting;
      setting.value = receiving ? ComRadioReceiveMode.Both : ComRadioReceiveMode.TransmitOnly;
    }
  }

  /**
   * Reconciles this manager's state based on a change in a COM radio receive mode user setting value.
   * @param radio The COM radio whose receive mode user setting value changed.
   * @param value The current value of the receive mode user setting.
   */
  private reconcileStateFromReceiveSetting(radio: 'COM1' | 'COM2', value: ComRadioReceiveMode): void {
    G3000RadioUtils.setComRadioReceiveState(radio === 'COM1' ? 'COM2' : 'COM1', value === ComRadioReceiveMode.Both);
  }

  /**
   * Resets the COM transmit and receive mode settings to their defaults.
   * @throws Error if this manager has been destroyed.
   */
  public reset(): void {
    if (!this.isAlive) {
      throw new Error('ComRadioTxRxManager: cannot reset a dead manager');
    }

    this.comTransmitSetting.resetToDefault();
    this.com1ReceiveSetting.resetToDefault();
    this.com2ReceiveSetting.resetToDefault();
  }

  /**
   * Destroys this manager. Once destroyed, this manager will no longer control COM radio transmit and receive states.
   */
  public destroy(): void {
    this.isAlive = false;

    this.isCom1Transmitting.destroy();
    this.isCom2Transmitting.destroy();
    this.isCom3Transmitting.destroy();

    this.isCom1Receiving.destroy();
    this.isCom2Receiving.destroy();

    this.comTransmitSettingSub?.destroy();
    this.com1ReceiveSettingSub?.destroy();
    this.com2ReceiveSettingSub?.destroy();
  }
}