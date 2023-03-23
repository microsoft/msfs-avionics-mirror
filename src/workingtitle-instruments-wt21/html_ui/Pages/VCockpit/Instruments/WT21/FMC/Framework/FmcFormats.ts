import {
  AirportFacility, DmsFormatter, FacilitySearchType, ICAO, NumberFormatter, OneWayRunway, Subscribable, UnitType,
  LatLongInterface, Unit
} from '@microsoft/msfs-sdk';

import { WT21Fms } from '../../Shared/FlightPlan/WT21Fms';
import { VorTuningMode } from '../../Shared/Profiles/FgpUserSettings';
import { WindEntry } from '../../Shared/Types';
import { WT21UnitsUtils } from '../../Shared/WT21UnitsUtils';
import { WT21CoordinatesUtils } from '../Navigation/WT21CoordinatesUtils';
import { WT21PilotWaypointUtils, PlaceBearingDistanceInput, PlaceBearingPlaceBearingInput } from '../Navigation/WT21PilotWaypointUtils';

/**
 * Validates an input string into a value of a type
 */
export interface Validator<T> {

  parse(input: string): Promise<T | null> | (T | null)

}

/**
 * Formats a value of a type
 */
export interface Formatter<T> {

  /**
   * The string to show when a value is `null`
   */
  nullValueString: string

  /**
   * Formats a value of a type into a string
   *
   * @param value the value to format
   */
  format(value: T): string

}

const pad = (value: number): string => value.toString().padStart(2, '0');

/** An object containing the frequency and ident. */
type FreqMode = {
  /** The frequency. */
  freq: number,
  /** The ident. */
  mode: VorTuningMode,
}


/**
 * {@link FmcFormat} for displaying a nav frequency
 *
 * Accepts an XXX.YY string
 */
export class NavFrequencyFormat implements Validator<number>, Formatter<FreqMode> {

  private readonly NAVAID_REGEX = /^[A-Z]{3}$/;

  private readonly FREQUENCY_NO_DECIMAL_REGEX = /^\d+$/;

  private readonly FREQUENCY_REGEX = /\d{1,3}\.\d{1,2}/;

  private formatter = NumberFormatter.create({ precision: 0.01 });

  /**
   * Constructs a `FrequencyFormat`
   *
   * @param fms the FMS
   * @param index which nav radio is this for
   */
  constructor(private readonly fms: WT21Fms, private readonly index: 1 | 2) { }

  nullValueString = '---.--';

  // eslint-disable-next-line jsdoc/require-jsdoc
  format({ freq, mode }: FreqMode): string {
    // Only display the ident if not a localizer
    const modeString = (mode === VorTuningMode.Auto ? 'AUTO' : 'MAN');
    if (this.index === 1) {
      return `${this.formatter(freq)}[green] ${modeString}[blue s-text]`;
    } else {
      return `${modeString}[blue s-text] ${this.formatter(freq)}[green]`;
    }
  }

  /** @inheritDoc */
  async parse(input: string): Promise<number | null> {
    const isNavaid = input.match(this.NAVAID_REGEX);

    if (isNavaid) {
      try {
        const ident = input;
        const facility = (await this.fms.facLoader.findNearestFacilitiesByIdent(FacilitySearchType.Vor, ident, this.fms.ppos.lat, this.fms.ppos.lon))[0];
        if (facility) {
          return Math.round(facility.freqMHz * 100) / 100;
        } else {
          return Promise.reject('FACILITY NOT FOUND');
        }
      } catch (e) {
        return Promise.reject('FACILITY NOT FOUND');
      }
    }

    const isFrequencyWithNoDecimal = input.match(this.FREQUENCY_NO_DECIMAL_REGEX);

    if (isFrequencyWithNoDecimal) {
      if (input.length === 1) {
        input = `10${input}.00`;
      } else if (input.length === 2) {
        input = `1${input}.00`;
      } else if (input.length >= 3 && input.length <= 4) {
        input = `1${input.substring(0, 2)}.${input.substring(2).padEnd(2, '0')}`;
      } else if (input.length === 5) {
        input = `${input.substring(0, 3)}.${input.substring(3)}`;
      } else {
        return null;
      }
    }

    const isFrequency = input.match(this.FREQUENCY_REGEX);

    if (isFrequency) {
      let freq = parseFloat(input);
      if (freq < 100) {
        freq += 100;
      }
      return (freq >= 108 && freq <= 117.95 && RadioNav.isHz50Compliant(freq)) ? freq : null;
    }

    return null;
  }
}

/**
 * {@link FmcFormat} for parsing and displaying a com frequency
 * Also accepts various shorthand formats.
 * ex. 'xxx', 'xxxx', 'xxxxx', 'xxxxxx,'xxx.xxx', 'xxx.xx', 'xxx.x'
 */
export class ComFrequencyFormat implements Validator<number>, Formatter<number> {
  private formatter = NumberFormatter.create({ precision: 0.001 });
  nullValueString = '---.---';

  /** @inheritDoc */
  format(freq: number): string {
    return this.formatter(freq);
  }

  /** @inheritDoc */
  async parse(input: string): Promise<number | null> {
    const normalizeInput = (channel: number): number => {
      let normalized = channel > 100 ? channel : channel + 100;
      const normalizedAsString = normalized.toFixed(3);

      const channelEnd = normalizedAsString.substring(5);
      if (channelEnd === '20' || channelEnd === '70') {
        normalized += .005;
      }

      return normalized;
    };

    let output = -1;
    if (input.indexOf('.') !== -1) {
      output = normalizeInput(parseFloat(input));
    } else {
      switch (input.length) {
        case 3: {
          const inputNum = parseFloat(input);
          output = normalizeInput(inputNum / (inputNum > 136.0 ? 10 : 1));
          break;
        }
        case 4: {
          const inputNum = parseFloat(input);
          output = normalizeInput(parseFloat(input) / (inputNum > 1360 ? 100 : 10));
          break;
        }
        case 5:
          output = normalizeInput(parseFloat(input) / 100);
          break;
        case 6:
          output = normalizeInput(parseFloat(input) / 1000);
          break;
      }
    }

    if (output < 118 || output > 136) {
      return null;
    }

    return output;
  }
}

export const TimeFormatter: Formatter<Date> = {

  nullValueString: '--:--',

  /** @inheritDoc */
  format(value: Date): string {
    return value.getTime() === 0 ? this.nullValueString : `${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}`;
  }
};

/**
 * Validator and Formatter for temperatures
 */
export class TemperatureFormat implements Validator<number>, Formatter<number> {

  /** @inheritDoc */
  parse(input: string): number | null {
    const TEMP_REGEX = /^[+-]?[0-9]+$/;

    if (!TEMP_REGEX.test(input)) {
      return null;
    }

    const int = parseInt(input);

    if (Number.isNaN(int)) {
      return null;
    }

    if (Math.abs(int) > 54) {
      return null;
    }

    return int;
  }

  nullValueString = '□□□°C';

  /** @inheritDoc */
  format(value: number): string {

    return `${value > 0 ? '+' : '-'}${Math.abs(Math.trunc(value))}°C`;
  }

}

/**
 * Format for XX.XX inHg QNH values
 */
export class PerfQnhFormat implements Validator<number>, Formatter<number> { // FIXME hPA
  /**
   * Ctor
   *
   * @param manualQnhSubject subject for manually entered QNH
   */
  constructor(
    private readonly manualQnhSubject: Subscribable<any | null>,
  ) {
  }

  /** @inheritDoc */
  parse(input: string): number | null {
    const QNH_REGEX = /^\d\d.\d\d$/;
    const HPA_REGEX = /^\d\d\d\d$/;

    if (!QNH_REGEX.test(input)) {
      if (!HPA_REGEX.test(input)) {
        return null;
      } else {
        const hpaValue = parseInt(input);

        if (Number.isNaN(hpaValue) || Math.trunc(hpaValue) !== hpaValue) {
          return null;
        }

        // Handle XXXX QNH entry
        if (hpaValue > 2000) {
          return parseFloat((hpaValue / 100).toFixed(2));
        }

        return UnitType.IN_HG.convertFrom(hpaValue, UnitType.HPA);
      }
    } else {
      return parseFloat(parseFloat(input).toFixed(2));
    }
  }

  nullValueString = '--.-- IN';

  /** @inheritDoc */
  format(value: number): string {
    const isMetric = WT21UnitsUtils.getIsMetric();
    const unitStr = WT21UnitsUtils.getUnitString(isMetric ? UnitType.HPA : UnitType.IN_HG);
    let valueStr = '';
    if (isMetric) {
      valueStr = UnitType.IN_HG.convertTo(value, UnitType.HPA).toFixed(0);
    } else {
      valueStr = value.toFixed(2);
    }

    return `${valueStr}${this.manualQnhSubject.get() !== null ? '[d-text]' : '[s-text]'} ${unitStr}`;
  }
}
/**
 * The options for number and unit inputs.
 */
export interface NumberAndUnitFormatOptions {
  /** Number precision (default: 0) */
  precision: number;
  /** Padding of the output string (default: 0) */
  padStart: number;
  /** Maximum value (default: max int) */
  maxValue: number;
  /** Minimum value (default: 0) */
  minValue: number;
  /** Indicating if there should be a space between number and unit */
  spaceBetween: boolean;
}

/**
 * Format for number with unit entries
 */
export class NumberAndUnitFormat implements Validator<number>, Formatter<number> {
  protected readonly options: NumberAndUnitFormatOptions;

  /**
   * CTOR
   * @param unit A unit
   * @param options Format options
   * @param nullValueString null value string
   */
  constructor(
    protected readonly unit: string,
    options: Partial<NumberAndUnitFormatOptions> = {},
    readonly nullValueString = ''
  ) {
    this.options = Object.assign({
      precision: 0,
      padStart: 0,
      maxValue: Number.MAX_SAFE_INTEGER,
      minValue: 0,
      spaceBetween: true
    }, options);
    if (nullValueString === '') {
      this.nullValueString = `${''.padStart(this.options.padStart, '-')}[d-text]${this.options.spaceBetween ? ' ' : ''}${unit}[s-text]`;
    }
  }

  /** @inheritDoc */
  parse(input: string): number | null {
    const tmp = this.options.precision > 0 ? parseFloat(input) : parseInt(input);

    if (isNaN(tmp)) {
      return null;
    }

    if (tmp > this.options.maxValue || tmp < this.options.minValue) {
      return null;
    }

    return tmp;
  }

  /** @inheritDoc */
  format(value: number): string {
    return `${value.toFixed(this.options.precision).padStart(this.options.padStart, ' ')}${this.options.spaceBetween ? ' ' : ''}[d-text]${this.unit}[s-text]`;
  }
}

/**
 * The options for convertable number and unit inputs.
 */
export interface ConvertableNumberAndUnitFormatOptions extends NumberAndUnitFormatOptions {
  /** Indicating if the unit should be displayed. */
  showUnit: boolean;
}

/**
 * Format for number with unit entries that is convertable
 * based on the sim's unit system.
 */
export class ConvertableNumberAndUnitFormat implements Validator<number>, Formatter<number> {
  protected readonly options: ConvertableNumberAndUnitFormatOptions;

  /**
   * CTOR
   * @param imperialUnit The type of the imperial unit.
   * @param metricUnit The type of the metric unit.
   * @param options Format options.
   * @param nullValueString null value string.
   * @param conditionalStyle A function that can return a style string.
   */
  constructor(
    protected readonly imperialUnit: Unit<any>, protected readonly metricUnit: Unit<any>,
    options: Partial<ConvertableNumberAndUnitFormatOptions> = {},
    readonly nullValueString = '',
    protected readonly conditionalStyle: (value: number) => string = () => { return ''; }
  ) {
    this.options = Object.assign({
      precision: 0,
      padStart: 0,
      maxValue: Number.MAX_SAFE_INTEGER,
      minValue: 0,
      spaceBetween: true,
      showUnit: true
    }, options);

    if (nullValueString === '') {
      const unitStr = this.options.showUnit ? WT21UnitsUtils.getUnitString(WT21UnitsUtils.getIsMetric() ? this.metricUnit : this.imperialUnit) : '';
      this.nullValueString = `${''.padStart(this.options.padStart, '-')}[d-text]${this.options.spaceBetween ? ' ' : ''}${unitStr}[s-text]`;
    }
  }

  /** @inheritDoc */
  parse(input: string): number | null {
    let tmp = this.options.precision > 0 ? parseFloat(input) : parseInt(input);

    if (isNaN(tmp)) {
      return null;
    }

    // if is metric then convert
    if (WT21UnitsUtils.getIsMetric()) {
      tmp = this.metricUnit.convertTo(tmp, this.imperialUnit);
    }

    if (tmp > this.options.maxValue || tmp < this.options.minValue) {
      return null;
    }

    return tmp;
  }

  /** @inheritDoc */
  format(value: number): string {
    const isMetric = WT21UnitsUtils.getIsMetric();
    const unitStr = this.options.showUnit ? WT21UnitsUtils.getUnitString(isMetric ? this.metricUnit : this.imperialUnit) : '';

    const conditionalStyle = this.conditionalStyle(value);

    if (isMetric) {
      value = this.imperialUnit.convertTo(value, this.metricUnit);
    }

    return `${value.toFixed(this.options.precision).padStart(this.options.padStart, ' ')}${this.options.spaceBetween ? ' ' : ''}[${conditionalStyle} d-text]${unitStr}[${conditionalStyle} s-text]`;
  }
}



/**
 * Options for {@link LatLongTextFormat}
 */
export interface LatLongTextFormatOptions {
  /**
   * The number of spaces between the lat and long components
   */
  spacesBetweenLatLong: number,

  /**
   * Whether to accept the short (XYYZUU/XYYUUZ) formats
   */
  acceptShortFormInput: boolean,
}

/**
 * Format for lla entries
 */
export class LatLongTextFormat implements Validator<LatLongInterface>, Formatter<LatLongInterface> {
  private readonly options: LatLongTextFormatOptions;

  private readonly dmsFormatter = new DmsFormatter();

  nullValueString;

  /** @inheritDoc */
  constructor(options?: Partial<LatLongTextFormatOptions>) {
    this.options = {
      spacesBetweenLatLong: options?.spacesBetweenLatLong ?? 1,
      acceptShortFormInput: options?.acceptShortFormInput ?? true,
    };

    this.nullValueString = `---°--.--${' '.repeat(this.options.spacesBetweenLatLong)}---°--.--`;
  }

  /** @inheritDoc */
  format(value: LatLongInterface): string {
    if (!value.lat && !value.long) {
      return this.nullValueString;
    }

    return this.dmsFormatter.getLatDmsStr(value.lat, false) + ' '.repeat(Math.max(0, this.options.spacesBetweenLatLong - 1)) + this.dmsFormatter.getLonDmsStr(value.long);
  }

  /** @inheritDoc */
  parse(text: string): LatLong | null {
    const llaObject = WT21CoordinatesUtils.parseLatLong(text, this.options.acceptShortFormInput);

    return llaObject ? new LatLong(llaObject?.lla.lat, llaObject?.lla.long) : null;
  }
}

/**
 * The options for text inputs.
 */
export interface StringInputFormatOptions {
  /** The maximum string length. */
  maxLength: number;
  /** The text to be shown when value is null. */
  nullValueString: string;
}

/**
 * Validator/Formatter for string, string input fields
 */
export class StringInputFormat implements Validator<string>, Formatter<string> {
  protected readonly options: StringInputFormatOptions;

  nullValueString = '';

  /**
   * Ctor
   * @param options The format options.
   */
  constructor(options: Partial<StringInputFormatOptions> = {},) {
    this.options = Object.assign({
      maxLength: 16,
      nullValueString: ''
    }, options);
    this.nullValueString = this.options.nullValueString;
  }

  /** @inheritDoc */
  format(value: string): string {
    // FIXME really need to put the space elsewhere...
    return value;
  }

  /** @inheritDoc */
  parse(text: string): string | null {

    if (!text) {
      return null;
    } else if (text.length > this.options.maxLength) {
      return null;
    }

    return text;
  }
}

/**
 * {@link Formatter} for displaying page number values
 */
export const PageNumberDisplay: Formatter<string | null> = {
  nullValueString: '',

  /** @inheritDoc */
  format(value: string | null): string {
    return value ? value + '[blue] ' : '1/1[blue] ';
  }
};

/**
 * {@link Validator} for parsing raw string values
 */
export const RawValidator: Validator<string | null> = {
  /** @inheritDoc */
  parse(input: string | null): string {
    return input ?? '';
  }
};


/**
 * {@link Formatter} for displaying raw string values
 */
export const RawFormatter: Formatter<string | number | null> = {
  nullValueString: '',

  /** @inheritDoc */
  format(value: string | null): string {
    return value ?? '';
  }
};

export const IcaoIdentFormatter: Formatter<string | null> = {
  nullValueString: '',

  /** @inheritDoc */
  format(value: string | null): string {
    return value !== null ? ICAO.getIdent(value) : '';
  }
};

/**
 * {@link Formatter} for displaying a string without a takeValue call
 */
export class SimpleStringFormat implements Formatter<string> {
  nullValueString: string;

  /** ctor
   * @param nullValue the string value for null
   */
  constructor(nullValue: string) {
    this.nullValueString = nullValue;
  }

  /** @inheritDoc */
  format(value: string | null): string {
    return value ?? this.nullValueString;
  }
}


/**
 * Validator and Formatter for temperatures
 *
 * FIXME make this universal
 */
export class RwySlopeFormat implements Validator<number>, Formatter<number> {

  /** @inheritDoc */
  parse(input: string): number | null {
    let rawNumber = input;

    const firstChar = input.substring(0, 1);
    if (firstChar.match(/[DU]/)) {
      // DXXX, UXXXU
      if (firstChar === 'D') {
        rawNumber = '-' + input.substring(1);
      } else {
        rawNumber = input.substring(1);
      }
    } else {
      const lastChar = input.substring(input.length - 1);
      if (lastChar.match(/[DU]/)) {
        // XXXD, XXXU
        if (lastChar === 'D') {
          rawNumber = '-' + input.substring(0, input.length - 1);
        } else {
          rawNumber = input.substring(0, input.length - 1);
        }
      }
    }

    const float = parseFloat(rawNumber);

    if (Number.isNaN(float)) {
      return null;
    }

    if (float < -2 || float > 2) {
      return null;
    }

    return float;
  }

  nullValueString = '--.-%';

  /** @inheritDoc */
  format(value: number): string {
    const fixedValue = Math.abs(value).toFixed(1);

    return `${value > 0 ? 'U' : value < 0 ? 'D' : ' '}${fixedValue}%`;
  }

}


/**
 * Formatter for V-Speeds
 */
export class VSpeedFormat implements Formatter<number> {

  /**
   * Constructor
   * @param vSpeedName V speed prefix
   */
  constructor(
    private vSpeedName: string,
  ) {
  }

  nullValueString = `V[blue d-text]${this.vSpeedName}:[blue s-text]  -[yellow] `;

  /** @inheritDoc */
  format(value: number): string {
    return `V[blue d-text]${this.vSpeedName}:[blue s-text] ${Math.trunc(value).toString().padStart(3, ' ')}[white d-text]`;
  }

}


/**
 * Interface for field length data display
 */
export interface FieldLengthData {
  /**
   * Calculated takeoff length
   */
  fieldLength: number | null,

  /**
   * Total runway length
   */
  runwayLength: number | null,
}

/** Interface for airports data */
export interface AirportsData {
  /** Origin airport. */
  origin: AirportFacility | null;
  /** Destination airport. */
  destination: AirportFacility | null;
}

/**
 * Format for field length / runway length combined display
 */
export class FieldLengthFormatter implements Formatter<FieldLengthData> {
  nullValueString = `---- / ---- ${WT21UnitsUtils.getUnitString(WT21UnitsUtils.getIsMetric() ? UnitType.METER : UnitType.FOOT)}`;


  /** @inheritDoc */
  format(value: FieldLengthData): string {
    let { fieldLength, runwayLength } = value;

    const isMetric = WT21UnitsUtils.getIsMetric();
    if (isMetric) {
      if (fieldLength) {
        fieldLength = UnitType.FOOT.convertTo(fieldLength, UnitType.METER);
      }
      if (runwayLength) {
        runwayLength = UnitType.FOOT.convertTo(runwayLength, UnitType.METER);
      }
    }

    const takeoffLengthString = fieldLength ? Math.round(fieldLength).toString().padEnd(5, ' ') : '---- ';
    const runwayLengthString = runwayLength ? Math.round(runwayLength).toString().padStart(5, ' ') : ' ----';

    let colorString;
    if (fieldLength === null || runwayLength === null) {
      colorString = 'white';
    } else {
      colorString = fieldLength > runwayLength ? 'yellow' : 'white';
    }

    const unitStr = WT21UnitsUtils.getUnitString(WT21UnitsUtils.getIsMetric() ? UnitType.METER : UnitType.FOOT);

    return `${takeoffLengthString}/[white]${runwayLengthString}[${colorString}] ${unitStr}`;
  }

}

/**
 * Formats a runway identifier
 */
export class RunwayIdentFormat implements Formatter<OneWayRunway> {
  nullValueString = '-----';

  /** @inheritDoc */
  format(value: OneWayRunway): string {
    return `RW${value.designation}`;
  }
}


/**
 * Format for entering wind values
 */
export class WindFormat implements Validator<WindEntry>, Formatter<WindEntry> {
  /** @inheritDoc */
  parse(input: string): WindEntry | null {
    // TODO support partial entry. this will be harder

    const regex = /^(\d{1,3})\/(\d{1,3})$/;

    const match = regex.exec(input);

    if (!match) {
      return null;
    }

    const direction = parseInt(match[1]);
    const speed = parseInt(match[2]);

    if (direction < 0 || direction > 360 || speed < 0 || speed > 100) {
      return null;
    }

    return {
      direction,
      trueDegrees: false, // TODO support true entry
      speed,
    };
  }

  nullValueString = '---°/---';

  /** @inheritDoc */
  format(value: WindEntry): string {
    let roundedDirection = Math.round(value.direction);
    if (roundedDirection === 0) { roundedDirection = 360; }
    const directionString = roundedDirection.toString().padStart(3, '0') + (value.trueDegrees ? 'T' : '°');
    const speedString = Math.round(value.speed).toString().padStart(3, ' ');
    return `${directionString}/${speedString}`;
  }
}

/**
 * Format for number and a fixed precision
 */
export class TransponderCodeFormat implements Validator<number>, Formatter<number> {
  private readonly CODE_REGEX = /^([0-7]{4})$/;
  readonly nullValueString = '----';

  /** @inheritDoc */
  parse(input: string): number | null {
    if (!this.CODE_REGEX.test(input)) {
      return null;
    }

    return parseInt(input);
  }

  /** @inheritDoc */
  format(value: number): string {
    return value.toString().padStart(4, '0');
  }
}

/** Struct for a ias/mach speed entry */
export type IasMachEntry = readonly [number | null, number | null];

/** Format for IAS and Mach input */
export class IasMachFormat implements Validator<IasMachEntry>, Formatter<IasMachEntry> {
  private readonly INPUT_REGEX = /([0-9]{3})?\/?\.?([0-9]{2})?/;
  readonly nullValueString = '---/-';

  /** @inheritDoc */
  parse(input: string): IasMachEntry | null {
    const match = this.INPUT_REGEX.exec(input);
    if (!match || match[0].length < 1) {
      return null;
    }

    const ias = parseInt(match[1]);
    const mach = parseInt(match[2]) / 100;

    return [isNaN(ias) ? null : ias, isNaN(mach) ? null : mach];
  }

  /** @inheritDoc */
  format(value: IasMachEntry): string {
    return `${value[0]?.toString().padStart(3, ' ')}/.${((value[1] ?? 0) * 100).toString().padStart(2, ' ')}`;
  }
}

/**
 * Format for altitude input
 */
export class AltitudeInputFormat implements Validator<number>, Formatter<number> {
  /** @inheritDoc */
  parse(input: string): number | null {
    const isFL = input.match(/^FL?/);
    const int = parseInt(input.replace(/^FL?/, ''));

    if (Number.isNaN(int) || int < 0) {
      return null;
    }

    if (int >= 0 && int <= 450) {
      return int * 100;
    } else if (isFL) {
      return null;
    }

    // There's a video showing that 900 is a valid input that results in just "900"
    if (int > 450 && int <= 45000) {
      return int;
    } else {
      return null;
    }
  }

  nullValueString = '□□□□□';

  /** @inheritDoc */
  format(value: number): string {
    // TODO Trans altitude should come from setting. But it feels bad to pull the setting here hmm
    if (value >= 18000) {
      return `FL${Math.round(value / 100).toString().padStart(3, '0').substring(0, 3)}`;
    } else {
      return `${Math.round(value).toString()}`;
    }
  }
}
/**
 * Format for PLACE+BEARING/DISTANCE entries
 */
export class PlaceBearingDistanceInputFormat implements Validator<PlaceBearingDistanceInput>, Formatter<PlaceBearingDistanceInput> {
  nullValueString = '----- ---.-/--.-';

  /** @inheritDoc */
  parse(input: string): PlaceBearingDistanceInput | null {
    return WT21PilotWaypointUtils.parsePlaceBearingDistance(input);
  }

  /** @inheritDoc */
  format(value: PlaceBearingDistanceInput): string {
    const placeStr = value.placeIdent;
    const bearingStr = value.bearing.toFixed(1).padStart(5, '0');
    const distanceStr = value.distance.toFixed(1);

    return `${placeStr}${bearingStr}/${distanceStr}`;
  }
}


/**
 * Format for PLACE+BEARING/PLACE+BEARING entries
 */
export class PlaceBearingPlaceBearingInputFormat implements Validator<PlaceBearingPlaceBearingInput>, Formatter<PlaceBearingPlaceBearingInput> {
  nullValueString = '----- ---.-/----- ---.-';

  /** @inheritDoc */
  parse(input: string): PlaceBearingPlaceBearingInput | null {
    return WT21PilotWaypointUtils.parsePlaceBearingPlaceBearing(input);
  }

  /** @inheritDoc */
  format(value: PlaceBearingPlaceBearingInput): string {
    const placeAStr = value.placeAIdent;
    const bearingAStr = value.bearingA.toFixed(1).padStart(5, '0');

    const placeBStr = value.placeBIdent;
    const bearingBStr = value.bearingB.toFixed(1).padStart(5, '0');

    return `${placeAStr}${bearingAStr}/${placeBStr}${bearingBStr}`;
  }
}