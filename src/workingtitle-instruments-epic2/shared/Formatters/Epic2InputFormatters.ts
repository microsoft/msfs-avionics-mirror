import { Subscribable } from '@microsoft/msfs-sdk';

/** A function type which formats a value into a string. */
export type FormatterFunction<T> = (value: T) => string;

/** Contains Epic2 input format functions and format function factories. */
export class Epic2InputFormatters {
  /**
   * A formatter for calibrated airspeeds.
   * @returns A CAS airspeed formatter.
   */
  public static AirspeedCas(): FormatterFunction<number> {
    return (cas: number): string => {
      return cas.toFixed().padStart(3, ' ');
    };
  }

  /**
   * A formatter for Mach airspeeds.
   * @returns A Mach airspeed formatter.
   */
  public static AirspeedMach(): FormatterFunction<number> {
    return (mach: number): string => {
      return `.${Math.round(mach * 1000)}`;
    };
  }

  /**
   * An altitude formatter factory.
   * @param transitionAltSub The transition altitude, in feet.
   * @returns An altitude formatter.
   */
  public static Altitude(transitionAltSub: Subscribable<number>): FormatterFunction<number> {
    return (value: number): string => {
      return (value < transitionAltSub.get()) ?
        `${value.toFixed().padStart(5, ' ')}` :
        `FL${(value / 100).toFixed().padStart(3, '0').substring(0, 3)}`;
    };
  }

  /**
   * A formatter factory for altitudes in feet.
   * @returns A altitude in feet formatter.
   */
  public static AltitudeFeet(): FormatterFunction<number> {
    return (alt: number): string => {
      return alt.toFixed().padStart(5, ' ');
    };
  }

  /**
   * A parser which formats Celsius temperatures.
   * @returns The temperature formatter.
   */
  public static CelsiusTemperature(): FormatterFunction<number> {
    return (temp: number): string => {
      return temp.toFixed(0).padStart(2);
    };
  }

  /**
   * A parser which formats Faranheit temperatures.
   * @returns The temperature formatter.
   */
  public static FaranheitTemperature(): FormatterFunction<number> {
    return (temp: number): string => {
      return temp.toFixed(0).padStart(3);
    };
  }

  /**
   * A flight level formatter factory.
   * @returns A flight level formatter.
   */
  public static FlightLevel(): FormatterFunction<number> {
    return (value: number): string => {
      return `FL${(value / 100).toFixed().padStart(3, '0').substring(0, 3)}`;
    };
  }

  /**
   * A fuel flow formatter factory.
   * @returns a fuel flow formatter.
   */
  public static FuelFlow(): FormatterFunction<number> {
    return (value: number): string => {
      return value.toFixed().padStart(4, '0');
    };
  }

  /**
   * A plain number formatter factory.
   * @param decimals The number of decimal places.
   * @returns A plain number formatter.
   */
  public static Number(decimals = 0): FormatterFunction<number> {
    return (value: number): string => {
      return value.toFixed(decimals);
    };
  }

  /**
   * A bearing formatter factory.
   * @returns A bearing formatter.
   */
  public static Bearing(): FormatterFunction<number> {
    return (value: number): string => {
      return value.toFixed(0).padStart(3, '0');
    };
  }

  /**
   * A plain text formatter factory.
   * @returns A plain text formatter that simply returns the input.
   */
  public static PlainText(): FormatterFunction<string> {
    return (value: string): string => {
      return value;
    };
  }
}
