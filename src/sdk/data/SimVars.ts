/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * Valid type arguments for Set/GetSimVarValue
 */
export enum SimVarValueType {
  Amps = 'Amperes',
  Bool = 'bool',
  Celsius = 'celsius',
  CubicInches = 'cubic inches',
  Degree = 'degrees',
  DegreesPerSecond = 'degrees per second',
  Enum = 'enum',
  Farenheit = 'farenheit',
  Feet = 'feet',
  FPM = 'feet per minute',
  FtLb = 'Foot pounds',
  GAL = 'gallons',
  GPH = 'gph',
  Hertz = 'hertz',
  Hours = 'Hours',
  HPA = 'hectopascals',
  Inches = 'inches',
  InHG = 'inches of mercury',
  KHz = 'KHz',
  Kilograms = 'kilograms',
  Knots = 'knots',
  KgPerCubicMeter = 'kilogram per cubic meter',
  LBS = 'pounds',
  Liters = 'liters',
  LLA = 'latlonalt',
  LLA_PBH = 'latlonaltpbh',
  Mach = 'mach',
  MB = 'Millibars',
  Meters = 'meters',
  MetersPerSecond = 'meters per second',
  MetersPerSecondSquared = 'meters per second squared',
  MillimetersWater = 'millimeters of water',
  MHz = 'MHz',
  NM = 'nautical mile',
  Number = 'number',
  PBH = 'pbh',
  Percent = 'percent',
  PercentOver100 = 'percent over 100',
  PerSecond = 'per second',
  PIDStruct = 'pid_struct',
  Position = 'position',
  Position16k = 'position 16k',
  Position32k = 'position 32k',
  Pounds = 'pounds',
  PPH = 'Pounds per hour',
  PSI = 'psi',
  Radians = 'radians',
  RadiansPerSecond = 'radians per second',
  Rankine = 'rankine',
  RPM = 'Rpm',
  Seconds = 'seconds',
  SlugsPerCubicFoot = 'slug per cubic foot',
  String = 'string',
  Volts = 'Volts',
  XYZ = 'xyz',
}

/**
 * The definition of a SimVar and associated value type.
 */
export type SimVarDefinition = {
  /** The name of the SimVar. */
  name: string,

  /** The value type used to retrieve the SimVar. */
  type: SimVarValueType,
}

/**
 * The definition of a resolved registered SimVar.
 */
export type RegisteredSimVarDefinition = {
  /** The name of the SimVar. */
  name: string, // Note: would not be necessary if each structure type had a getValueRef variant

  /** The SimVar struct type used to retrieve the SimVar. */
  structType: SimVarStructTypes,

  /** The definition's registered ID, or `-1` if a registered ID could not be retrieved for the SimVar. */
  registeredID: number;
}

// WT: SimVar.js optimizations
declare let simvar: any;
const latlonaltRegEx = new RegExp(/latlonalt/i);
const latlonaltpbhRegex = new RegExp(/latlonaltpbh/i);
const pbhRegex = new RegExp(/pbh/i);
const pid_structRegex = new RegExp(/pid_struct/i);
const xyzRegex = new RegExp(/xyz/i);
const stringRegex = new RegExp(/string/i);
const boolRegex = new RegExp(/boolean|bool/i);
const numberRegex = new RegExp(/number/i);
const defaultSource = '';

export enum SimVarStructTypes {
  Number,
  String,
  LatLongAlt,
  LatLongAltPbh,
  PitchBankHeading,
  PidStruct,
  XYZ,
  Boolean
}

/**
 * Converts a SimVar unit type to a SimVar value struct type.
 * @param unit The SimVar unit type for which to get a struct type.
 * @param coerceBooleanType Whether the `bool/boolean` SimVar unit type should be converted to the `Boolean` struct
 * type instead of the `Number` struct type. Using the `Boolean` struct type will cause SimVar values to be coerced to
 * the `boolean` type using the `!!` operator. Defaults to `false`.
 * @returns The SimVar value struct type corresponding to the specified unit type.
 */
export function GetSimVarStructType(unit: string, coerceBooleanType = false): SimVarStructTypes {
  if (numberRegex.test(unit)) {
    return SimVarStructTypes.Number;
  } else if (stringRegex.test(unit)) {
    return SimVarStructTypes.String;
  } else if (latlonaltRegEx.test(unit)) {
    return SimVarStructTypes.LatLongAlt;
  } else if (latlonaltpbhRegex.test(unit)) {
    return SimVarStructTypes.LatLongAltPbh;
  } else if (pbhRegex.test(unit)) {
    return SimVarStructTypes.PitchBankHeading;
  } else if (pid_structRegex.test(unit)) {
    return SimVarStructTypes.PidStruct;
  } else if (xyzRegex.test(unit)) {
    return SimVarStructTypes.XYZ;
  } else if (boolRegex.test(unit) && coerceBooleanType) {
    return SimVarStructTypes.Boolean;
  } else {
    return SimVarStructTypes.Number;
  }
}

// @ts-ignore
SimVar.GetSimVarValue = (name: string, unit: string, dataSource = defaultSource): any => {
  try {
    if (simvar) {
      let output: any;

      const registeredID = SimVar.GetRegisteredId(name, unit, dataSource);
      if (registeredID >= 0) {
        if (numberRegex.test(unit)) {
          output = simvar.getValueReg(registeredID) as number;
        } else if (stringRegex.test(unit)) {
          output = simvar.getValueReg_String(registeredID);
        } else if (latlonaltRegEx.test(unit)) {
          output = new LatLongAlt(simvar.getValue_LatLongAlt(name, dataSource));
        } else if (latlonaltpbhRegex.test(unit)) {
          output = new LatLongAltPBH(simvar.getValue_LatLongAltPBH(name, dataSource));
        } else if (pbhRegex.test(unit)) {
          output = new PitchBankHeading(simvar.getValue_PBH(name, dataSource));
        } else if (pid_structRegex.test(unit)) {
          output = new PID_STRUCT(simvar.getValue_PID_STRUCT(name, dataSource));
        } else if (xyzRegex.test(unit)) {
          output = new XYZ(simvar.getValue_XYZ(name, dataSource));
        } else {
          output = simvar.getValueReg(registeredID) as number;
        }
      }
      return output;
    } else { console.warn('SimVar handler is not defined (' + name + ')'); }
  } catch (error) {
    console.warn('ERROR ', error, ' GetSimVarValue ' + name + ' unit : ' + unit);
    return null;
  }

  return null;
};

/**
 * Resolves a SimVar definition into a registered definition. The registered definition can be used with
 * {@link GetRegisteredSimVarValue | GetRegisteredSimVarValue()} for efficient retrieval of SimVar values.
 * @param simVarDef The SimVar definition to resolve.
 * @param coerceBooleanType Whether to coerce values retrieved using the `bool/boolean` SimVar type to the `boolean`
 * type. If `true`, then type coercion will be performed using the "boolean cast" operator (`!!`). If `false`, then
 * type coercion will not be performed and values will be left typed as `number`. Defaults to `false`.
 * @returns The resolved registered SimVar definition corresponding to the specified SimVar definition.
 */
export function ResolveRegisteredSimVar(simVarDef: Readonly<SimVarDefinition>, coerceBooleanType = false): RegisteredSimVarDefinition {
  return {
    name: simVarDef.name,
    registeredID: SimVar.GetRegisteredId(simVarDef.name, simVarDef.type, defaultSource),
    structType: GetSimVarStructType(simVarDef.type, coerceBooleanType)
  };
}

/**
 * Gets the value of a SimVar using a registered SimVar definition. This function is more performant than
 * `SimVar.GetSimVarValue()`.
 * @param regSimVarDef The registered SimVar definition describing the value to get.
 * @returns The value of the SimVar described by the specified registered SimVar definition, or `null` if the value
 * could not be retrieved.
 */
export function GetRegisteredSimVarValue(regSimVarDef: Readonly<RegisteredSimVarDefinition>): any {
  try {
    if (regSimVarDef.registeredID >= 0) {
      switch (regSimVarDef.structType) {
        case SimVarStructTypes.Number:
          return simvar.getValueReg(regSimVarDef.registeredID) as number;
        case SimVarStructTypes.String:
          return simvar.getValueReg_String(regSimVarDef.registeredID);
        case SimVarStructTypes.LatLongAlt:
          return new LatLongAlt(simvar.getValue_LatLongAlt(regSimVarDef.name, defaultSource));
        case SimVarStructTypes.LatLongAltPbh:
          return new LatLongAltPBH(simvar.getValue_LatLongAltPBH(regSimVarDef.name, defaultSource));
        case SimVarStructTypes.PitchBankHeading:
          return new PitchBankHeading(simvar.getValue_PBH(regSimVarDef.name, defaultSource));
        case SimVarStructTypes.PidStruct:
          return new PID_STRUCT(simvar.getValue_PID_STRUCT(regSimVarDef.name, defaultSource));
        case SimVarStructTypes.XYZ:
          return new XYZ(simvar.getValue_XYZ(regSimVarDef.name, defaultSource));
        case SimVarStructTypes.Boolean:
          return !!simvar.getValueReg(regSimVarDef.registeredID);
        default: return null;
      }
    }
  } catch (error) {
    console.warn('ERROR ', error, ' GetSimVarValue ' + regSimVarDef.name + ' structType : ' + regSimVarDef.structType);
  }
  return null;
}

// @ts-ignore
SimVar.SetSimVarValue = (name: string, unit: string, value: any, dataSource = defaultSource): Promise<any> => {
  if (value == undefined) {
    console.warn(name + ' : Trying to set a null value');
    return Promise.resolve();
  }

  try {
    if (simvar) {
      const regID = SimVar.GetRegisteredId(name, unit, dataSource);
      if (regID >= 0) {
        if (stringRegex.test(unit)) {
          return Coherent.call('setValueReg_String', regID, value);
        } else if (boolRegex.test(unit)) {
          return Coherent.call('setValueReg_Bool', regID, !!value);
        } else if (numberRegex.test(unit)) {
          return Coherent.call('setValueReg_Number', regID, value);
        } else if (latlonaltRegEx.test(unit)) {
          return Coherent.call('setValue_LatLongAlt', name, value, dataSource);
        } else if (latlonaltpbhRegex.test(unit)) {
          return Coherent.call('setValue_LatLongAltPBH', name, value, dataSource);
        } else if (pbhRegex.test(unit)) {
          return Coherent.call('setValue_PBH', name, value, dataSource);
        } else if (pid_structRegex.test(unit)) {
          return Coherent.call('setValue_PID_STRUCT', name, value, dataSource);
        } else if (xyzRegex.test(unit)) {
          return Coherent.call('setValue_XYZ', name, value, dataSource);
        } else {
          return Coherent.call('setValueReg_Number', regID, value);
        }
      }
    } else { console.warn('SimVar handler is not defined'); }
  } catch (error) {
    console.warn('error SetSimVarValue ' + error);
  }

  return Promise.resolve();
};

/**
 * A mapping from non-numeric SimVar unit types to Typescript types.
 * 
 * Note that this mapping is not complete (all SimVarUnit types are supposed to be case-insensitive). Only the most
 * common capitalization schemes are included.
 */
type SimVarUnitTypeMap = {
  /** LatLongAlt. */
  ['latlongalt']: LatLongAlt;
  /** LatLongAlt. */
  ['Latlongalt']: LatLongAlt;
  /** LatLongAlt. */
  ['LatLongAlt']: LatLongAlt;

  /** LatLongAltPBH. */
  ['latlongaltpbh']: LatLongAltPBH;
  /** LatLongAltPBH. */
  ['Latlongaltpbh']: LatLongAltPBH;
  /** LatLongAltPBH. */
  ['LatlongaltPbh']: LatLongAltPBH;
  /** LatLongAltPBH. */
  ['LatlongaltPBH']: LatLongAltPBH;
  /** LatLongAltPBH. */
  ['LatLongAltPbh']: LatLongAltPBH;
  /** LatLongAltPBH. */
  ['LatLongAltPBH']: LatLongAltPBH;

  /** PBH. */
  ['pbh']: PitchBankHeading;
  /** PBH. */
  ['Pbh']: PitchBankHeading;
  /** PBH. */
  ['PBH']: PitchBankHeading;

  /** PID_STRUCT. */
  ['pid_struct']: PID_STRUCT;
  /** PID_STRUCT. */
  ['Pid_Struct']: PID_STRUCT;
  /** PID_STRUCT. */
  ['PID_Struct']: PID_STRUCT;

  /** string. */
  ['string']: string;
  /** string. */
  ['String']: string;

  /** XYZ. */
  ['xyz']: XYZ;
  /** XYZ. */
  ['Xyz']: XYZ;
  /** XYZ. */
  ['XYZ']: XYZ;
};

/**
 * Maps a SimVar unit type to its corresponding Typescript type.
 */
export type SimVarUnitToType<Unit extends string> = Unit extends keyof SimVarUnitTypeMap ? SimVarUnitTypeMap[Unit] : number;

/**
 * A registered SimVar.
 */
export interface RegisteredSimVar<T> {
  /** The name of this SimVar. */
  readonly name: string;

  /** The unit type of this SimVar. */
  readonly unit: string

  /** The data source linked to this SimVar. */
  readonly dataSource: string;

  /**
   * Gets the value of this SimVar.
   * @returns The value of this SimVar.
   */
  get(): T;

  /**
   * Sets the value of this SimVar.
   * @param value The value to set.
   * @returns A Promise which is fulfilled when the operation to set the SimVar value has been successfully sent.
   */
  set(value: T): Promise<void>;
}

/**
 * A registered SimVar.
 */
abstract class AbstractRegisteredSimVar<T> implements RegisteredSimVar<T> {
  protected readonly id: number;

  /**
   * Creates a new instance of AbstractRegisteredSimVar.
   * @param name The name of this SimVar.
   * @param unit The unit type of this SimVar.
   * @param dataSource The data source linked to this SimVar. Defaults to the empty string.
   */
  public constructor(public readonly name: string, public readonly unit: string, public readonly dataSource = '') {
    this.id = SimVar.GetRegisteredId(name, unit, dataSource);

    if (this.id < 0) {
      throw new Error(`new AbstractRegisteredSimVar(): could not retrieve a valid registered ID for SimVar "${name}", unit "${unit}", data source "${dataSource}"`);
    }
  }

  /** @inheritDoc */
  public abstract get(): T;

  /** @inheritDoc */
  public abstract set(value: T): Promise<void>;
}

/**
 * A registered SimVar with a numeric value.
 */
class RegisteredNumberSimVar extends AbstractRegisteredSimVar<number> {
  /** @inheritDoc */
  public get(): number {
    return simvar.getValueReg(this.id);
  }

  /** @inheritDoc */
  public set(value: number): Promise<void> {
    return Coherent.call('setValueReg_Number', this.id, value);
  }
}

/**
 * A registered SimVar with a boolean value.
 */
class RegisteredBooleanSimVar extends AbstractRegisteredSimVar<boolean> {
  /**
   * Creates a new instance of RegisteredBooleanSimVar.
   * @param name The name of this SimVar.
   * @param dataSource The data source linked to this SimVar. Defaults to the empty string.
   */
  public constructor(public readonly name: string, dataSource = '') {
    super(name, SimVarValueType.Bool, dataSource);
  }

  /** @inheritDoc */
  public get(): boolean {
    return !!simvar.getValueReg(this.id);
  }

  /** @inheritDoc */
  public set(value: boolean): Promise<void> {
    return Coherent.call('setValueReg_Number', this.id, value ? 1 : 0);
  }
}

/**
 * A registered SimVar with a string value.
 */
class RegisteredStringSimVar extends AbstractRegisteredSimVar<string> {
  /** @inheritDoc */
  public get(): string {
    return simvar.getValueReg_String(this.id);
  }

  /** @inheritDoc */
  public set(value: string): Promise<void> {
    return Coherent.call('setValueReg_String', this.id, value);
  }
}

/**
 * A registered SimVar with a LatLongAlt value.
 */
class RegisteredLlaSimVar extends AbstractRegisteredSimVar<LatLongAlt> {
  /** @inheritDoc */
  public get(): LatLongAlt {
    return new LatLongAlt(simvar.getValue_LatLongAlt(this.name, this.dataSource));
  }

  /** @inheritDoc */
  public set(value: LatLongAlt): Promise<void> {
    return Coherent.call('setValue_LatLongAlt', this.name, value, this.dataSource);
  }
}

/**
 * A registered SimVar with a LatLongAltPBH value.
 */
class RegisteredLlaPbhSimVar extends AbstractRegisteredSimVar<LatLongAltPBH> {
  /** @inheritDoc */
  public get(): LatLongAltPBH {
    return new LatLongAltPBH(simvar.getValue_LatLongAltPBH(this.name, this.dataSource));
  }

  /** @inheritDoc */
  public set(value: LatLongAltPBH): Promise<void> {
    return Coherent.call('setValue_LatLongAltPBH', this.name, value, this.dataSource);
  }
}

/**
 * A registered SimVar with a PitchBankHeading value.
 */
class RegisteredPbhSimVar extends AbstractRegisteredSimVar<PitchBankHeading> {
  /** @inheritDoc */
  public get(): PitchBankHeading {
    return new PitchBankHeading(simvar.getValue_PBH(this.name, this.dataSource));
  }

  /** @inheritDoc */
  public set(value: PitchBankHeading): Promise<void> {
    return Coherent.call('setValue_PBH', this.name, value, this.dataSource);
  }
}

/**
 * A registered SimVar with a PID_STRUCT value.
 */
class RegisteredPidStructSimVar extends AbstractRegisteredSimVar<PID_STRUCT> {
  /** @inheritDoc */
  public get(): PID_STRUCT {
    return new PID_STRUCT(simvar.getValue_PID_STRUCT(this.name, this.dataSource));
  }

  /** @inheritDoc */
  public set(value: PID_STRUCT): Promise<void> {
    return Coherent.call('setValue_PID_STRUCT', this.name, value, this.dataSource);
  }
}

/**
 * A registered SimVar with a XYZ value.
 */
class RegisteredXyzSimVar extends AbstractRegisteredSimVar<XYZ> {
  /** @inheritDoc */
  public get(): XYZ {
    return new XYZ(simvar.getValue_XYZ(this.name, this.dataSource));
  }

  /** @inheritDoc */
  public set(value: XYZ): Promise<void> {
    return Coherent.call('setValue_XYZ', this.name, value, this.dataSource);
  }
}

/**
 * A utility class for working with registered SimVars.
 */
export class RegisteredSimVarUtils {
  /**
   * Creates a new registered SimVar instance.
   * @param name The name of the SimVar.
   * @param unit The unit type of the SimVar.
   * @param dataSource The data source to link to the SimVar instance. Defaults to the empty string.
   * @returns A new registered SimVar instance.
   */
  public static create<T = undefined, U extends string = string>(
    name: string,
    unit: U,
    dataSource = ''
  ): RegisteredSimVar<T extends undefined ? SimVarUnitToType<U> : T> {
    if (stringRegex.test(unit)) {
      return new RegisteredStringSimVar(name, unit, dataSource) as unknown as RegisteredSimVar<T extends undefined ? SimVarUnitToType<U> : T>;
    } else if (latlonaltRegEx.test(unit)) {
      return new RegisteredLlaSimVar(name, unit, dataSource) as unknown as RegisteredSimVar<T extends undefined ? SimVarUnitToType<U> : T>;
    } else if (latlonaltpbhRegex.test(unit)) {
      return new RegisteredLlaPbhSimVar(name, unit, dataSource) as unknown as RegisteredSimVar<T extends undefined ? SimVarUnitToType<U> : T>;
    } else if (pbhRegex.test(unit)) {
      return new RegisteredPbhSimVar(name, unit, dataSource) as unknown as RegisteredSimVar<T extends undefined ? SimVarUnitToType<U> : T>;
    } else if (pid_structRegex.test(unit)) {
      return new RegisteredPidStructSimVar(name, unit, dataSource) as unknown as RegisteredSimVar<T extends undefined ? SimVarUnitToType<U> : T>;
    } else if (xyzRegex.test(unit)) {
      return new RegisteredXyzSimVar(name, unit, dataSource) as unknown as RegisteredSimVar<T extends undefined ? SimVarUnitToType<U> : T>;
    } else {
      return new RegisteredNumberSimVar(name, unit, dataSource) as unknown as RegisteredSimVar<T extends undefined ? SimVarUnitToType<U> : T>;
    }
  }

  /**
   * Creates a new boolean-valued registered SimVar instance. The unit type of the SimVar will be set to
   * `SimVarValueType.Bool`. When getting the SimVar value, zero will be interpreted as `false`, and any other value
   * will be interpreted as `true`. When setting the SimVar value, `true` will be converted to `1` and `false` will be
   * converted to `0`.
   * @param name The name of the SimVar.
   * @param dataSource The data source to link to the SimVar instance. Defaults to the empty string.
   * @returns A new boolean-valued registered SimVar instance.
   */
  public static createBoolean(name: string, dataSource = ''): RegisteredSimVar<boolean> {
    return new RegisteredBooleanSimVar(name, dataSource);
  }
}

// @ts-ignore
const SimOvrd = {
  GetSimVarValue: SimVar.GetSimVarValue,
  SetSimVarValue: SimVar.SetSimVarValue,
};

export { SimOvrd };
