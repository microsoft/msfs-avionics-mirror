/**
 * Valid type arguments for Set/GetSimVarValue
 */
export enum SimVarValueType {
    Number = 'number',
    Percent = 'percent',
    Degree = 'degrees',
    Knots = 'knots',
    Feet = 'feet',
    Meters = 'meters',
    FPM = 'feet per minute',
    Radians = 'radians',
    InHG = 'inches of mercury',
    MB = 'Millibars',
    Bool = 'bool',
    Celsius = 'celsius',
    MHz = 'MHz',
    KHz = 'KHz',
    NM = 'nautical mile',
    String = 'string',
    RPM = 'Rpm',
    PPH = 'Pounds per hour',
    GPH = 'gph',
    Farenheit = 'farenheit',
    PSI = 'psi',
    GAL = 'gallons',
    LBS = 'pounds',
    Hours = 'Hours',
    Volts = 'Volts',
    Amps = 'Amperes',
    Seconds = 'seconds',
    Enum = 'enum',
    LLA = 'latlonalt',
    MetersPerSecond = 'meters per second',
    Mach = 'mach',
    Pounds = 'pounds',
    SlugsPerCubicFoot = 'slug per cubic foot'
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

