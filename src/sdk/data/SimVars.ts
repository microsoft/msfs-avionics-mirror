/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * Valid type arguments for Set/GetSimVarValue
 */
export enum SimVarValueType {
  Amps = 'Amperes',
  Bool = 'bool',
  Celsius = 'celsius',
  Degree = 'degrees',
  DegreesPerSecond = 'degrees per second',
  Enum = 'enum',
  Farenheit = 'farenheit',
  Feet = 'feet',
  FPM = 'feet per minute',
  GAL = 'gallons',
  GPH = 'gph',
  Hours = 'Hours',
  HPA = 'hectopascals',
  InHG = 'inches of mercury',
  KHz = 'KHz',
  Knots = 'knots',
  LBS = 'pounds',
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
  FtLb = 'Foot pounds',
}

/**
 * The definition of a simvar and associated value type.
 */
export type SimVarDefinition = {

  /** The name of the simvar. */
  name: string,

  /** The value to be used to retrieve this simvar. */
  type: SimVarValueType,
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
