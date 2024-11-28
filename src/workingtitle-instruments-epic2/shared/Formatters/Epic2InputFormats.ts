import { Formatter, Subscribable, Validator } from '@microsoft/msfs-sdk';

import { Epic2InputFormatters } from './Epic2InputFormatters';
import { Epic2InputParsers } from './Epic2InputParsers';

/** Formatter for a {@link InputBox} */
export type FormatterValidator<T> = Validator<T> & Formatter<T>;

/** Format for a 4-letter airport ICAO.*/
export class AirportIcaoInputFormat implements FormatterValidator<string> {
  /** @inheritDoc */
  constructor(private nullValueDisplay = '□□□□□') { }
  /** @inheritDoc */
  parse = Epic2InputParsers.AirportIcao();
  /** @inheritDoc */
  format = Epic2InputFormatters.PlainText();
  nullValueString = this.nullValueDisplay;
}

/** Format for a calibrated airspeed input. */
export class AirspeedCasInputFormat implements FormatterValidator<number> {
  /** @inheritDoc */
  constructor(private nullValueDisplay = '□□□', private min?: number, private max?: number) { }
  /** @inheritDoc */
  parse = Epic2InputParsers.AirspeedCas(this.min, this.max);
  /** @inheritDoc */
  format = Epic2InputFormatters.AirspeedCas();
  nullValueString = this.nullValueDisplay;
}

/** Format for a mach airspeed input. */
export class AirspeedMachInputFormat implements FormatterValidator<number> {
  /** @inheritDoc */
  constructor(private nullValueDisplay = '□□□') { }
  /** @inheritDoc */
  parse = Epic2InputParsers.AirspeedMach();
  /** @inheritDoc */
  format = Epic2InputFormatters.AirspeedMach();
  nullValueString = this.nullValueDisplay;
}

/** Format for altitude input. */
export class AltitudeInputFormat implements FormatterValidator<number> {
  /** @inheritDoc */
  constructor(private readonly transitionAlt: Subscribable<number>, private nullValueDisplay = '□□□□□', private min?: number, private max?: number) { }
  /** @inheritDoc */
  parse = Epic2InputParsers.Altitude(this.min, this.max);
  /** @inheritDoc */
  format = Epic2InputFormatters.Altitude(this.transitionAlt);
  nullValueString = this.nullValueDisplay;
}

/** Format for altitude input with display in feet only (no flight level). */
export class AltitudeFeetInputFormat implements FormatterValidator<number> {
  /** @inheritDoc */
  constructor(private nullValueDisplay = '□□□□□', private min?: number | Subscribable<number>, private max?: number | Subscribable<number>) { }
  /** @inheritDoc */
  parse = Epic2InputParsers.Altitude(this.min, this.max);
  /** @inheritDoc */
  format = Epic2InputFormatters.AltitudeFeet();
  nullValueString = this.nullValueDisplay;
}

/** Format for temperature input with display in celsius. */
export class CelsiusTemperatureInputFormat implements FormatterValidator<number> {
  /** @inheritDoc */
  constructor(private nullValueDisplay = '□□', private min?: number, private max?: number) { }
  /** @inheritDoc */
  parse = Epic2InputParsers.CelsiusTemperature(this.min, this.max);
  /** @inheritDoc */
  format = Epic2InputFormatters.CelsiusTemperature();
  nullValueString = this.nullValueDisplay;
}

/** Format for temperature input with display in celsius. */
export class FaranheitTemperatureInputFormat implements FormatterValidator<number> {
  /** @inheritDoc */
  constructor(private nullValueDisplay = '□□', private min?: number, private max?: number) { }
  /** @inheritDoc */
  parse = Epic2InputParsers.FaranheitTemperature(this.min, this.max);
  /** @inheritDoc */
  format = Epic2InputFormatters.FaranheitTemperature();
  nullValueString = this.nullValueDisplay;
}

/** Format for flight level input (accepts altitudes as well but always displays flight level). */
export class FlightLevelInputFormat implements FormatterValidator<number> {
  /** @inheritDoc */
  constructor(private nullValueDisplay = '□□□□□') { }
  /** @inheritDoc */
  parse = Epic2InputParsers.Altitude();
  /** @inheritDoc */
  format = Epic2InputFormatters.FlightLevel();
  nullValueString = this.nullValueDisplay;
}

/** Format for fuel flow in pounds/hour. */
export class FuelFlowInputFormat implements FormatterValidator<number> {
  /** @inheritDoc */
  constructor(private nullValueDisplay = '□□□□□') { }
  /** @inheritDoc */
  parse = Epic2InputParsers.FuelFlow();
  /** @inheritDoc */
  format = Epic2InputFormatters.FuelFlow();
  nullValueString = this.nullValueDisplay;
}

/** Format for a plain number. */
export class NumberInputFormat implements FormatterValidator<number> {
  /** @inheritDoc */
  constructor(private nullValueDisplay = '□□□□□', private min?: number, private max?: number, private decimals?: number) { }
  /** @inheritDoc */
  parse = Epic2InputParsers.Number(this.min, this.max, this.decimals);
  /** @inheritDoc */
  format = Epic2InputFormatters.Number(this.decimals);
  nullValueString = this.nullValueDisplay;
}

/** Format for a bearing. */
export class BearingInputFormat implements FormatterValidator<number> {
  /** @inheritDoc */
  constructor(private nullValueDisplay = '□□□□□', private min = 0, private max = 360, private decimals?: number) { }
  /** @inheritDoc */
  parse = Epic2InputParsers.Number(this.min, this.max, this.decimals);
  /** @inheritDoc */
  format = Epic2InputFormatters.Bearing();
  nullValueString = this.nullValueDisplay;
}

/** Format for a plain string that when parsed is transformed into uppercase characters. */
export class UppercaseTextInputFormat implements FormatterValidator<string> {
  /** @inheritDoc */
  constructor(private nullValueDisplay = '', private maxLength?: number, private minLength?: number,) { }
  /** @inheritDoc */
  parse = Epic2InputParsers.UppercasePlainText(this.maxLength, this.minLength);
  /** @inheritDoc */
  format = Epic2InputFormatters.PlainText();
  nullValueString = this.nullValueDisplay;
}

/** Format for a plain string. */
export class TextInputFormat implements FormatterValidator<string> {
  /** @inheritDoc */
  constructor(private nullValueDisplay = '', private maxLength?: number, private minLength?: number,) { }
  /** @inheritDoc */
  parse = Epic2InputParsers.PlainText(this.maxLength, this.minLength);
  /** @inheritDoc */
  format = Epic2InputFormatters.PlainText();
  nullValueString = this.nullValueDisplay;
}

/** Format for weight in pounds. */
export class WeightInputFormat implements FormatterValidator<number> {
  /** @inheritDoc */
  constructor(private nullValueDisplay = '□□□□□', private min?: number, private max?: number) { }
  /** @inheritDoc */
  parse = Epic2InputParsers.Weight(this.min, this.max);
  /** @inheritDoc */
  format = Epic2InputFormatters.Number();
  nullValueString = this.nullValueDisplay;
}

/** Format for radio frequency. */
export class FrequencyInputFormat implements FormatterValidator<string> {
  /** @inheritDoc */
  constructor(private nullValueDisplay = '□□□□□', private min?: number, private max?: number) { }
  /** @inheritDoc */
  parse = Epic2InputParsers.VhfFrequency(this.min, this.max);
  /** @inheritDoc */
  format = Epic2InputFormatters.PlainText();
  nullValueString = this.nullValueDisplay;
}

/** Format for nav radio frequency. */
export class TransponderInputFormat implements FormatterValidator<string> {
  /** @inheritDoc */
  constructor(private nullValueDisplay = '□□□□□', private min?: number, private max?: number) {
  }
  /** @inheritDoc */
  parse = Epic2InputParsers.TransponderCode();
  /** @inheritDoc */
  format = Epic2InputFormatters.PlainText();
  nullValueString = this.nullValueDisplay;
}
