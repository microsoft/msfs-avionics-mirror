import { ComRadioIndex, NavRadioIndex, SimVarValueType } from '@microsoft/msfs-sdk';

/**
 * A utility class for working with G3X radios.
 */
export class G3XRadioUtils {

  /**
   * Sets the transmitting COM radio.
   * @param radioSimIndex The sim index of the radio to set as transmitting.
   * @returns A Promise which is fulfilled when the command to set the transmitting radio has been sent.
   */
  public static setTransmittingComIndex(radioSimIndex: ComRadioIndex): Promise<void> {
    /**
     * This event can be used to select the COM channel to use. The input is one of the following values:
     *
     * 0: Com1
     * 1: Com2
     * 2: Com3
     * 4: None (not working)
     *
     * but SIM index is 1-based, so we need to subtract 1 from the radioSimIndex.
     */
    return SimVar.SetSimVarValue('K:PILOT_TRANSMITTER_SET', SimVarValueType.Number, radioSimIndex - 1);
  }

  /**
   * Sets the receiving state of a COM radio.
   * @param radioSimIndex The sim index of the radio to set the receiving state of.
   * @param receive The receiving state to set.
   * @returns A Promise which is fulfilled when the command to set the receiving state has been sent.
   */
  public static setComRadioReceiveState(radioSimIndex: ComRadioIndex, receive: boolean): Promise<void> {
    return SimVar.SetSimVarValue(`K:COM${radioSimIndex}_RECEIVE_SELECT`, SimVarValueType.Number, receive ? 1 : 0);
  }

  /**
   * Sets the receiving ident audio from a NAV radio.
   * @param radioSimIndex - The simulation index of the radio.
   * @param receive - The receiving state to set.
   * @returns - A Promise which is fulfilled when the command to set the receiving state has been sent.
   */
  public static setNavRadioIdentReceiveState(radioSimIndex: NavRadioIndex, receive: boolean): Promise<void> {
    return SimVar.SetSimVarValue(`K:RADIO_VOR${radioSimIndex}_IDENT_SET`, SimVarValueType.Number, receive ? 1 : 0);
  }

  /**
   * Sets the marker beacon enabled or disabled.
   * @returns A Promise which is fulfilled when the command to set marker beacon sound state has been sent.
   */
  public static setMarkerBeaconSoundState(): Promise<void> {
    return SimVar.SetSimVarValue('K:MARKER_SOUND_TOGGLE', SimVarValueType.Bool, true);
  }
}
