import { MathUtils, Publisher, SimVarValueType } from '@microsoft/msfs-sdk';

import { Epic2TransponderEvents } from './Epic2TransponderManager';

const MHZ_TO_HZ_MULTIPLIER = 1000000;

/** A utility class for working with KTR 2280 radios. */
export class Epic2RadioUtils {

  /**
   * Increments or decrements the active ADF frequency.
   * @param freqComponent Whether to adjust the leftmost three or rightmost two digits of the frequency.
   * @param dir Whether to increment or decrement the frequency.
   * @param freqHz The frequency, in hertz.
   */
  public static changeActiveAdfFrequency(freqComponent: 'LEFT' | 'RIGHT', dir: 'INC' | 'DEC', freqHz: number): void {
    const directionalMultiplier = dir === 'INC' ? 1 : -1;
    const rightComponent: number = Math.floor((freqHz % 10000) / 100) * 100;

    if (freqComponent === 'LEFT') {
      // The sim will wrap from 1800 -> 100 Hz, but we want the wrap to be 1800 -> 190.
      if (freqHz >= 1790_000 && dir === 'INC') {
        Epic2RadioUtils.setActiveAdfFrequency(190_000 + rightComponent);
        return;
      } else if (freqHz <= 199_900 && dir === 'DEC') {
        Epic2RadioUtils.setActiveAdfFrequency(1790_000 + rightComponent);
        return;
      } else {
        Epic2RadioUtils.setActiveAdfFrequency(freqHz + (10000 * directionalMultiplier));
        return;
      }
    } else {
      const leftComponent: number = Math.floor(freqHz / 10000) * 10000;
      Epic2RadioUtils.setActiveAdfFrequency(leftComponent + (rightComponent + 10000 + (500 * directionalMultiplier)) % 10000);
      return;
    }
  }

  /**
   * Sets the ADF active frequency.
   * @param frequencyHz The frequency to set, in hertz.
   */
  private static setActiveAdfFrequency(frequencyHz: number): void {
    SimVar.SetSimVarValue('K:ADF_ACTIVE_SET', SimVarValueType.Number, Avionics.Utils.make_adf_bcd32(frequencyHz));
  }

  /**
   * Increments or decrements the transponder code.
   * @param increment Whether to make coarse or fine adjustments
   * @param sign Whether to increment or decrement the code.
   * @param code The current transponder code value.
   * @param transponderPublisher A {@link Epic2TransponderEvents} publisher.
   */
  public static changeXpdrCode(
    increment: 'COARSE' | 'FINE',
    sign: 1 | -1,
    code: number,
    transponderPublisher: Publisher<Epic2TransponderEvents>
  ): void {
    const codeString = code.toString();
    const newCode = MathUtils.clamp(
      parseInt(codeString, 8) + Math.sign(sign) * (increment === 'COARSE' ? 64 : 1),
      0,
      4095, // 7777 octal
    ).toString(8);
    transponderPublisher.pub('epic2_xpdr_set_code', parseInt(newCode), true);
  }

  /**
   * Tunes the specified navigation radio to the chosen frequency
   * @param radioIndex The index of the radio to use
   * @param frequency The nav radio frequency to tune
   */
  public static setActiveNavFrequencyMhz(radioIndex: 1 | 2, frequency: number): void {
    SimVar.SetSimVarValue(`K:NAV${radioIndex}_RADIO_SET_HZ`, 'Hz', frequency * MHZ_TO_HZ_MULTIPLIER);
  }

  /**
   * Sets the specified navigation radio course.
   * @param radioIndex The index of the radio to use.
   * @param course The course in degrees.
   */
  public static setActiveNavCourse(radioIndex: 1 | 2, course: number): void {
    SimVar.SetSimVarValue(`K:VOR${radioIndex}_SET`, 'number', course);
  }
}
