import { MathUtils, Subscribable, SubscribableUtils, Validator } from '@microsoft/msfs-sdk';

/** A function type which formats a value into a string. */
export type Parser<T> = Validator<T>['parse'];

/** Contains Boeing FMC parse functions and parse function factories. */
export class Epic2InputParsers {
  /**
   * A 4-character airport ICAO parser.
   * @returns A 4-character airport ICAO parser.
   */
  public static AirportIcao(): Parser<string> {
    return (input: string): string | null => {
      const regex = /^[a-zA-Z0-9]{4}$/;
      if (!regex.test(input)) {
        return null;
      }
      return input.toUpperCase();
    };
  }

  /**
   * A calibrated airspeed parser.
   * @param lowerBound the lower accepted bound, inclusive, default -Infinity
   * @param upperBound the upper accepted bound, inclusive, default Infinity.
   * @returns A calibrated airspeed parser.
   */
  public static AirspeedCas(lowerBound = 0, upperBound = 550): Parser<number> {
    return (input: string): number | null => {
      const regex = /^\d{2,3}$/;
      if (!regex.test(input)) {
        return null;
      }
      const int = parseInt(input);
      return !isNaN(int) && int >= lowerBound && int <= upperBound ? int : null;
    };
  }

  /**
   * A Mach airspeed parser.
   * @param lowerBound the lower accepted bound, inclusive, default .100.
   * @param upperBound the upper accepted bound, inclusive, default .990.
   * @returns A Mach parser.
   */
  public static AirspeedMach(lowerBound = .100, upperBound = .990): Parser<number> {
    return (input: string): number | null => {
      const regex = /^(\.?)(\d{1,3})$/;
      const match = input.match(regex);
      if (match === null) {
        return null;
      }
      const int = parseFloat(match[2].padEnd(3, '0')) / 1000;
      return !isNaN(int) && int >= lowerBound && int <= upperBound ? int : null;
    };
  }

  /**
   * A parser which validates altitudes.
   * @param lowerBound the lower accepted bound, inclusive, default -2000.
   * @param upperBound the upper accepted bound, inclusive, default 60000.
   * @returns An altitude parser.
   */
  public static Altitude(lowerBound: number | Subscribable<number> = -2000, upperBound: number | Subscribable<number> = 60000): Parser<number> {
    return (input: string): number | null => {
      if (!/^(\d{3,5}|[Ff][Ll]\d{3}|-\d{4})$/.test(input)) {
        return null;
      }

      const int: number = /^([Ff][Ll])?\d{3}$/.test(input) ?
        parseInt(input.replace(/[Ff][Ll]/, '')) * 100 : // FLXXX or XXX
        MathUtils.round(parseInt(input), 10); // -XXXX or XXXX or XXXXX

      const min = SubscribableUtils.toSubscribable(lowerBound ?? NaN, true) as Subscribable<number>;
      const max = SubscribableUtils.toSubscribable(upperBound ?? NaN, true) as Subscribable<number>;

      return (
        Number.isNaN(int) ||
          !(min.get() <= int && int <= max.get()) ||
          (/^\d{4}$/.test(input) && int > 9994) ? // XXXX cannot exceed 9994
          null : int
      );
    };
  }

  /**
   * A parser which validates Celsius temperatures.
   * @param lowerBound the lower accepted bound, inclusive, default -55.
   * @param upperBound the upper accepted bound, inclusive, default 50.
   * @returns The temperature in Celsius or null.
   */
  public static CelsiusTemperature(lowerBound = -55, upperBound = 50): Parser<number> {
    return (input: string) => {
      // Valid entry is X, XX
      const regex = /^[+-]?\d{1,2}$/;

      if (!regex.test(input)) {
        return null;
      }

      const inputC = parseInt(input);

      return (!Number.isNaN(inputC) && lowerBound <= inputC && inputC <= upperBound) ? inputC : null;
    };
  }

  /**
   * A parser which validates Faranheit temperatures.
   * @param lowerBound the lower accepted bound, inclusive, default -67.
   * @param upperBound the upper accepted bound, inclusive, default 122.
   * @returns The temperature in Faranheit or null.
   */
  public static FaranheitTemperature(lowerBound = -67, upperBound = 122): Parser<number> {
    return (input: string) => {
      // Valid entry is X, XX
      const regex = /^[+-]?\d{1,3}$/;

      if (!regex.test(input)) {
        return null;
      }

      const inputF = parseInt(input);

      return (!Number.isNaN(inputF) && lowerBound <= inputF && inputF <= upperBound) ? inputF : null;
    };
  }

  /**
   * A parser which validates fuel flows in pounds per hour.
   * @param lowerBound the lower accepted bound, inclusive, default 0.
   * @param upperBound the upper accepted bound, inclusive, default 5000.
   * @returns The fuel flow in pounds per hour or null.
   */
  public static FuelFlow(lowerBound = 0, upperBound = 5000): Parser<number> {
    return (input: string) => {
      const regex = /^\d{1,4}$/;

      if (!regex.test(input)) {
        return null;
      }

      const inputPounds = parseInt(input);

      return inputPounds >= lowerBound && inputPounds <= upperBound ? inputPounds : null;
    };
  }

  /**
   * A parser which validates plain unitless numbers.
   * @param lowerBound the lower accepted bound, inclusive, default -Infinity.
   * @param upperBound the upper accepted bound, inclusive, default Infinity.
   * @param decimals the number of decimal places.
   * @returns The fuel flow in pounds per hour or null.
   */
  public static Number(lowerBound = -Infinity, upperBound = Infinity, decimals = 0): Parser<number> {
    return (input: string) => {
      const regex = decimals > 0 ? new RegExp(`\\d(\\.[\\d]${decimals})?`) : /^\d+$/;

      if (!regex.test(input)) {
        return null;
      }

      const inputNumber = parseInt(input);

      return inputNumber >= lowerBound && inputNumber <= upperBound ? inputNumber : null;
    };
  }

  /**
   * A parser which validates plain text and transforms it to be upper case
   * @param maxLength the maximum length accepted, default 10.
   * @param minLength the minimum length accepted, default 1.
   * @returns The temperature in Faranheit or null.
   */
  public static UppercasePlainText(maxLength = 10, minLength = 1): Parser<string> {
    return (input: string) => {
      return input.length >= minLength && input.length <= maxLength ? input.toUpperCase() : null;
    };
  }

  /**
   * A parser which validates Faranheit temperatures.
   * @param maxLength the maximum length accepted, default 10.
   * @param minLength the minimum length accepted, default 1.
   * @returns The temperature in Faranheit or null.
   */
  public static PlainText(maxLength = 10, minLength = 1): Parser<string> {
    return (input: string) => {
      return input.length >= minLength && input.length <= maxLength ? input : null;
    };
  }

  /**
   * A parser which validates weights in pounds.
   * @param lowerBound the lower accepted bound, inclusive, default 0.
   * @param upperBound the upper accepted bound, inclusive, default 99000.
   * @returns The temperature in Faranheit or null.
   */
  public static Weight(lowerBound = 0, upperBound = 99000): Parser<number> {
    return (input: string) => {
      const regex = /^\d{1,5}$/;

      if (!regex.test(input)) {
        return null;
      }

      const inputPounds = parseInt(input);

      return inputPounds >= lowerBound && inputPounds <= upperBound ? inputPounds : null;
    };
  }

  /**
   * A parser which validates frequencies.
   * @param lowerBound the lower accepted bound, inclusive, default 118.
   * @param upperBound the upper accepted bound, inclusive, default 136.995.
   * @returns An altitude parser.
   */
  public static VhfFrequency(lowerBound: number = 118, upperBound: number = 136.995): Parser<string> {
    return (input: string): string | null => {
      // Split the input by the decimal place, or if there is none then by the third character (i.e. 118.5 to 118, 5)
      let splitInput = input.split('.');
      if (splitInput.length === 1) {
        splitInput = [input.slice(0,3), input.slice(3)];
      }

      if (splitInput[0].length !== 3) {
        return null;
      }

      const freqInt = Number(`${splitInput[0]}.${splitInput[1].padEnd(3, '0')}`);

      if (freqInt < lowerBound || freqInt > upperBound) {
        return null;
      }

      return isNaN(freqInt) ? null : freqInt.toFixed(3);
    };
  }

  /**
   * A parser which validates frequencies.
   * @param lowerBound the lower accepted bound, inclusive, default 190.
   * @param upperBound the upper accepted bound, inclusive, default 1750.
   * @returns An altitude parser.
   */
  public static AdfFrequency(lowerBound: number = 190, upperBound: number = 1750): Parser<string> {
    return (input: string): string | null => {
      // Split the input by the decimal place, or if there is none then by the third character (i.e. 118.5 to 118, 5)

      if (input.length < 3) {
        return null;
      }

      const freqInt = Number(input);

      if (freqInt < lowerBound || freqInt > upperBound) {
        return null;
      }

      return isNaN(freqInt) ? null : freqInt.toFixed(1);
    };
  }

   /**
    * A parser which validates transponder codes.
    * @returns A squawk parser.
    */
   public static TransponderCode(): Parser<string> {
    return (input: string): string | null => {
      // Split the input by the decimal place, or if there is none then by the third character (i.e. 118.5 to 118, 5)
      if (!/[0-7]{4}/.test(input)) {
        return null;
      }

      return input;
    };
  }
}
