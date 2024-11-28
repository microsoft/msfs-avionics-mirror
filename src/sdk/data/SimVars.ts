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
  Knots = 'knots',
  LBS = 'pounds',
  Liters = 'liters',
  LLA = 'latlonalt',
  Mach = 'mach',
  MB = 'Millibars',
  Meters = 'meters',
  MetersPerSecond = 'meters per second',
  MetersPerSecondSquared = 'meters per second squared',
  MillimetersWater = 'millimeters of water',
  MHz = 'MHz',
  NM = 'nautical mile',
  Number = 'number',
  Percent = 'percent',
  PercentOver100 = 'percent over 100',
  PerSecond = 'per second',
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

// @ts-ignore
const SimOvrd = {
  GetSimVarValue: SimVar.GetSimVarValue,
  SetSimVarValue: SimVar.SetSimVarValue,
};

export { SimOvrd };
