import { RadioType, SimVarValueType } from '@microsoft/msfs-sdk';
import { ComRadio, G3000RadioType, G3000RadioTypeMap, G3000RadioTypeMapReverse, Radio, TunableRadio } from './G3000Radio';

/**
 * A utility class for working with G3000 radios.
 */
export class G3000RadioUtils {
  /**
   * Gets the type of a radio.
   * @param radio A radio.
   * @returns The type of the specified radio.
   * @throws Error if `radio` is not a valid radio.
   */
  public static getRadioType<R extends Radio>(radio: R): G3000RadioTypeMapReverse[R] {
    switch (radio) {
      case 'NAV1':
      case 'NAV2':
        return G3000RadioType.Nav as G3000RadioTypeMapReverse[R];
      case 'COM1':
      case 'COM2':
      case 'COM3':
        return G3000RadioType.Com as G3000RadioTypeMapReverse[R];
      case 'ADF1':
      case 'ADF2':
        return G3000RadioType.Adf as G3000RadioTypeMapReverse[R];
      case 'DME1':
      case 'DME2':
        return G3000RadioType.Dme as G3000RadioTypeMapReverse[R];
      default:
        throw new Error(`G3000RadioUtils: unrecognized radio type ${radio}`);
    }
  }

  /**
   * Checks if a radio is of a certain type.
   * @param radio The radio to check.
   * @param type The radio type to check.
   * @returns Whether the specified radio is of the specified type.
   * @throws Error if `radio` is not a valid radio.
   */
  public static isRadioType<Type extends G3000RadioType>(radio: Radio, type: Type): radio is G3000RadioTypeMap[Type] {
    return G3000RadioUtils.getRadioType(radio) === type;
  }

  /**
   * Gets the sim radio type of a radio.
   * @param radio A radio.
   * @returns The sim radio type of the specified radio.
   * @throws Error if `radio` is not a valid radio.
   */
  public static getSimRadioType(radio: Radio): RadioType {
    switch (radio) {
      case 'NAV1':
      case 'NAV2':
        return RadioType.Nav;
      case 'COM1':
      case 'COM2':
      case 'COM3':
        return RadioType.Com;
      case 'ADF1':
      case 'ADF2':
        return RadioType.Adf;
      case 'DME1':
      case 'DME2':
        return RadioType.Nav;
      default:
        throw new Error(`G3000RadioUtils: unrecognized radio type ${radio}`);
    }
  }

  /**
   * Creates a function which formats radio names.
   * @param adfCount The number of ADF radios supported by the airplane.
   * @param dmeCount The number of DME radios supported by the airplane.
   * @returns A function which formats radio names.
   */
  public static radioNameFormatter(adfCount: number, dmeCount: number): (radio: Radio) => string {
    return (radio: Radio): string => {
      switch (radio) {
        case 'ADF1':
          return adfCount > 1 ? radio : 'ADF';
        case 'DME1':
          return dmeCount > 1 ? radio : 'DME';
        default:
          return radio;
      }
    };
  }

  /**
   * Sets the transmitting COM radio.
   * @param radio The com radio to set as transmitting.
   * @returns A Promise which is fulfilled when the command to set the transmitting radio has been sent.
   */
  public static setComRadioTransmitting(radio: 'COM1' | 'COM2'): Promise<void> {
    return SimVar.SetSimVarValue('K:PILOT_TRANSMITTER_SET', SimVarValueType.Number, radio === 'COM1' ? 0 : 1);
  }

  /**
   * Sets the receiving state of a COM radio.
   * @param radio The radio to set the receiving state of.
   * @param receive The receiving state to set.
   * @returns A Promise which is fulfilled when the command to set the receiving state has been sent.
   */
  public static setComRadioReceiveState(radio: ComRadio, receive: boolean): Promise<void> {
    return SimVar.SetSimVarValue(`K:${radio}_RECEIVE_SELECT`, SimVarValueType.Number, receive ? 1 : 0);
  }

  /**
   * Sets a standby radio frequency.
   * @param radio The radio for which to set the frequency.
   * @param frequencyHz The frequency to set, in hertz.
   * @returns A Promise which is fulfilled when the command to set the frequency has been sent.
   */
  public static setStandbyRadioFrequency(radio: TunableRadio, frequencyHz: number): Promise<void> {
    switch (radio) {
      case 'NAV1':
        return SimVar.SetSimVarValue('K:NAV1_STBY_SET_HZ', SimVarValueType.Number, frequencyHz);
      case 'NAV2':
        return SimVar.SetSimVarValue('K:NAV2_STBY_SET_HZ', SimVarValueType.Number, frequencyHz);
      case 'COM1':
        return SimVar.SetSimVarValue('K:COM_STBY_RADIO_SET_HZ', SimVarValueType.Number, frequencyHz);
      case 'COM2':
        return SimVar.SetSimVarValue('K:COM2_STBY_RADIO_SET_HZ', SimVarValueType.Number, frequencyHz);
      case 'COM3':
        return SimVar.SetSimVarValue('K:COM3_STBY_RADIO_SET_HZ', SimVarValueType.Number, frequencyHz);
      case 'ADF1':
        return SimVar.SetSimVarValue('K:ADF_STBY_SET', SimVarValueType.Number, Avionics.Utils.make_adf_bcd32(frequencyHz));
      case 'ADF2':
        return SimVar.SetSimVarValue('K:ADF2_STBY_SET', SimVarValueType.Number, Avionics.Utils.make_adf_bcd32(frequencyHz));
    }
  }

  /**
   * Swaps active and standby radio frequencies.
   * @param radio The radio whose frequencies are to be swapped.
   * @returns A Promise which is fulfilled when the command to swap frequencies has been sent.
   */
  public static swapRadioFrequency(radio: TunableRadio): Promise<void> {
    return SimVar.SetSimVarValue(`K:${radio}_RADIO_SWAP`, SimVarValueType.Number, 0);
  }

  /**
   * Increments or decrements a radio's volume.
   * @param radio The radio to adjust the volume of.
   * @param dir Whether to increment or decrement the volume.
   * @returns A Promise which is fulfilled when the command to change the volume has been sent.
   */
  public static changeRadioVolume(radio: Radio, dir: 'INC' | 'DEC'): Promise<void> {
    let radioName: string;
    switch (radio) {
      case 'ADF1':
        radioName = 'ADF';
        break;
      case 'DME1':
        radioName = 'NAV3';
        break;
      case 'DME2':
        radioName = 'NAV4';
        break;
      default:
        radioName = radio;
    }

    return SimVar.SetSimVarValue(`K:${radioName}_VOLUME_${dir}`, SimVarValueType.Number, 0);
  }

  /**
   * Increments or decrements a radio's frequency.
   * @param radio The radio to adjust the frequency of.
   * @param freqComponent Whether to adjust the MHz (WHOLE) or kHz (FRACT) component of the frequency.
   * @param dir Whether to increment or decrement the frequency.
   * @returns A Promise which is fulfilled when the command to change the frequency has been sent.
   */
  public static changeRadioFrequency(radio: TunableRadio, freqComponent: 'WHOLE' | 'FRACT', dir: 'INC' | 'DEC'): Promise<void> {
    if (G3000RadioUtils.isRadioType(radio, G3000RadioType.Adf)) {
      const freq = SimVar.GetSimVarValue(`ADF STANDBY FREQUENCY:${radio === 'ADF1' ? 1 : 2}`, 'hertz');

      if (freqComponent === 'WHOLE') {
        // The sim will wrap from 1800 -> 100 Hz, but we want the wrap to be 1800 -> 190.
        if (freq >= 1799e3 && dir === 'INC') {
          const fractPart = Math.floor((freq % 1000) / 500) * 500;
          return G3000RadioUtils.setStandbyRadioFrequency(radio, 190e3 + fractPart);
        } else if (freq <= 191e3 && dir === 'DEC') {
          const fractPart = Math.floor((freq % 1000) / 500) * 500;
          return G3000RadioUtils.setStandbyRadioFrequency(radio, 1799e3 + fractPart);
        } else {
          return SimVar.SetSimVarValue(`K:${radio}_WHOLE_${dir}`, SimVarValueType.Number, 0);
        }
      } else {
        // The FRACT/TENTHS INC/DEC key events change frequency by 100 Hz, but we want to change by 500 Hz, so we have
        // to do it manually.
        const kHzPart = Math.floor(freq / 1000) * 1000;
        const newFreq = kHzPart + (Math.floor((freq % 1000) / 500) + 1) % 2 * 500;
        return G3000RadioUtils.setStandbyRadioFrequency(radio, newFreq);
      }
    } else {
      return SimVar.SetSimVarValue(`K:${radio === 'COM1' ? 'COM' : radio}_RADIO_${freqComponent}_${dir}`, SimVarValueType.Number, 0);
    }
  }
}
