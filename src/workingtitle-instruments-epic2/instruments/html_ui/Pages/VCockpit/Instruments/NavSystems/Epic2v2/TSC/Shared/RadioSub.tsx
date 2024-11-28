import { ComponentProps, ComSpacing, DisplayComponent, EventBus, FSComponent, NavComEvents, XPDRSimVarEvents } from '@microsoft/msfs-sdk';

/** Common radio sub props. */
export interface RadioSubProps extends ComponentProps {
  /** An EventBus. */
  bus: EventBus
}

/** A base class for radio sub-window classes. */
export abstract class RadioSub<P extends RadioSubProps = RadioSubProps> extends DisplayComponent<P> {

  public readonly radioSub = this.props.bus.getSubscriber<NavComEvents & XPDRSimVarEvents>();

  /**
   * Formats COM frequencies to strings.
   * @param root0 Inputs
   * @param root0."0" The frequency.
   * @param root0."1" The channel spacing.
   * @returns A formatted string.
   */
  public static FrequencyFormatter([freq, spacing]: readonly [number, ComSpacing]): string {
    // Convert to kHz so that all potentially significant digits lie to the left of the decimal point.
    // This prevents floating point rounding errors.
    const freqKhz: number = Math.round(freq * 1e3);
    return spacing === ComSpacing.Spacing833Khz ?
      (freqKhz / 1000).toFixed(3) :
      // Truncate to 10 kHz
      (Math.trunc(freqKhz / 10) / 100).toFixed(2);
  }

  /**
   * Appends a number to another number.
   * @param originalNumber The number to append to.
   * @param numberToAppend The number to append.
   * @returns The result of appending the second number to the first.
   */
  public static appendNumber(originalNumber: number, numberToAppend: number): number {
    const resultString = originalNumber.toString() + numberToAppend.toString();
    return Number(resultString);
  }
}
