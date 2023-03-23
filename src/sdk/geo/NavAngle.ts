import { AbstractUnit, NumberUnit, NumberUnitInterface, Unit } from '../math';
import { AbstractSubscribable } from '../sub/AbstractSubscribable';
import { MutableSubscribable } from '../sub/Subscribable';
import { LatLonInterface } from './GeoInterfaces';
import { MagVar } from './MagVar';

/**
 * The navigation angle unit family type.
 */
export type NavAngleUnitFamily = 'navangle';

/**
 * A navigation angle unit, which is a measure of angular degrees relative to either true or magnetic north.
 * 
 * Unlike most other unit types, each instance of navigation angle unit contains state specific to that instance,
 * namely the magnetic variation used to convert between true and magnetic bearing.
 *
 * Conversions use the magnetic variation of the NavAngleUnit instance whose conversion method is called; this also
 * means that when calling `NumberUnit.asUnit()`, the magnetic variation of the unit of the NumberUnit whose `asUnit()`
 * method was called will be used.
 */
export interface NavAngleUnit extends Unit<NavAngleUnitFamily> {
  /** This unit's magnetic variation, in degrees. */
  readonly magVar: number;

  /**
   * Checks whether this nav angle unit is relative to magnetic north.
   * @returns Whether this nav angle unit is relative to magnetic north.
   */
  isMagnetic(): boolean;
}

/**
 * The possible reference norths for navigation angle units.
 */
export enum NavAngleUnitReferenceNorth {
  True = 'true',
  Magnetic = 'magnetic'
}

/**
 * A basic implementation of a navigation angle unit.
 */
export class BasicNavAngleUnit extends AbstractUnit<NavAngleUnitFamily> implements NavAngleUnit {
  /** @inheritdoc */
  public readonly family = 'navangle';

  private _magVar = 0;
  /** @inheritdoc */
  public get magVar(): number {
    return this._magVar;
  }

  /**
   * Constructor.
   * @param referenceNorth The reference north of the new unit.
   * @param magVar The initial magnetic variation of the new unit.
   */
  constructor(referenceNorth: NavAngleUnitReferenceNorth, magVar: number) {
    super(referenceNorth === NavAngleUnitReferenceNorth.True ? 'true bearing' : 'magnetic bearing');

    this._magVar = magVar;
  }

  /**
   * Checks whether this nav angle unit is relative to magnetic north.
   * @returns Whether this nav angle unit is relative to magnetic north.
   */
  public isMagnetic(): boolean {
    return this.name === 'magnetic bearing';
  }

  /**
   * Converts a value of this unit to another unit. This unit's magnetic variation is used for the conversion.
   * @param value The value to convert.
   * @param toUnit The unit to which to convert.
   * @returns The converted value.
   * @throws Error if attempting an invalid conversion.
   */
  public convertTo(value: number, toUnit: Unit<NavAngleUnitFamily>): number {
    if (!this.canConvert(toUnit)) {
      throw new Error(`Invalid conversion from ${this.name} to ${toUnit.name}.`);
    }

    if (!isFinite(value)) {
      return NaN;
    }

    if (this.isMagnetic() === (toUnit as NavAngleUnit).isMagnetic()) {
      return value;
    }

    return this.isMagnetic() ? MagVar.magneticToTrue(value, this.magVar) : MagVar.trueToMagnetic(value, this.magVar);
  }

  /**
   * Converts a value of another unit to this unit. This unit's magnetic variation is used for the conversion.
   * @param value The value to convert.
   * @param fromUnit The unit from which to convert.
   * @returns The converted value.
   * @throws Error if attempting an invalid conversion.
   */
  public convertFrom(value: number, fromUnit: Unit<NavAngleUnitFamily>): number {
    if (!this.canConvert(fromUnit)) {
      throw new Error(`Invalid conversion from ${fromUnit.name} to ${this.name}.`);
    }

    if (!isFinite(value)) {
      return NaN;
    }

    if (this.isMagnetic() === (fromUnit as NavAngleUnit).isMagnetic()) {
      return value;
    }

    return this.isMagnetic() ? MagVar.trueToMagnetic(value, this.magVar) : MagVar.magneticToTrue(value, this.magVar);
  }

  /**
   * Sets this unit's magnetic variation.
   * @param magVar The magnetic variation to set, in degrees.
   */
  public setMagVar(magVar: number): void {
    this._magVar = magVar;
  }

  /**
   * Sets this unit's magnetic variation from a geographic location.
   * @param location The location defining the new magnetic variation.
   */
  public setMagVarFromLocation(location: LatLonInterface): void;
  /**
   * Sets this unit's magnetic variation from a geographic location.
   * @param lat The latitude, in degrees, of the location defining the new magnetic variation.
   * @param lon The longitude, in degrees, of the location defining the new magnetic variation.
   */
  public setMagVarFromLocation(lat: number, lon: number): void;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public setMagVarFromLocation(arg1: LatLonInterface | number, arg2?: number): void {
    if (typeof arg1 === 'number') {
      this._magVar = MagVar.get(arg1, arg2 as number);
    } else {
      this._magVar = MagVar.get(arg1);
    }
  }

  /** @inheritdoc */
  public equals(other: Unit<string>): boolean {
    return other instanceof BasicNavAngleUnit && this.name === other.name && this.magVar === other.magVar;
  }

  /**
   * Creates an instance of BasicNavAngleUnit.
   * @param isMagnetic Whether the new unit is relative to magnetic north.
   * @param magVar The initial magnetic variation of the new unit, in degrees. Defaults to 0 degrees.
   * @returns An instance of BasicNavAngleUnit.
   */
  public static create(isMagnetic: boolean, magVar?: number): BasicNavAngleUnit;
  /**
   * Creates an instance of BasicNavAngleUnit.
   * @param isMagnetic Whether the new unit is relative to magnetic north.
   * @param location The initial location of the new unit.
   * @returns An instance of BasicNavAngleUnit.
   */
  public static create(isMagnetic: boolean, location: LatLonInterface): BasicNavAngleUnit;
  /**
   * Creates an instance of BasicNavAngleUnit.
   * @param isMagnetic Whether the new unit is relative to magnetic north.
   * @param lat The initial latitude of the new unit, in degrees.
   * @param lon The initial longitude of the new unit, in degrees.
   * @returns An instance of BasicNavAngleUnit.
   */
  public static create(isMagnetic: boolean, lat: number, lon: number): BasicNavAngleUnit;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static create(isMagnetic: boolean, arg2?: LatLonInterface | number, arg3?: number): BasicNavAngleUnit {
    const referenceNorth = isMagnetic ? NavAngleUnitReferenceNorth.Magnetic : NavAngleUnitReferenceNorth.True;

    let magVar = 0;

    if (arg2 !== undefined) {
      if (typeof arg2 === 'number') {
        if (arg3 === undefined) {
          magVar = arg2;
        } else {
          magVar = MagVar.get(arg2, arg3);
        }
      } else {
        magVar = MagVar.get(arg2);
      }
    }

    return new BasicNavAngleUnit(referenceNorth, magVar);
  }
}

/**
 * A Subject which provides a navigation angle value.
 */
export class BasicNavAngleSubject
  extends AbstractSubscribable<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>>
  implements MutableSubscribable<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>> {

  private static readonly TRUE_BEARING = BasicNavAngleUnit.create(false);

  /** @inheritdoc */
  public readonly isMutableSubscribable = true;

  /**
   * Constructor.
   * @param value The value of this subject.
   */
  private constructor(private readonly value: NumberUnit<NavAngleUnitFamily, BasicNavAngleUnit>) {
    super();
  }

  /**
   * Creates a BasicNavAngleSubject.
   * @param initialVal The initial value.
   * @returns A BasicNavAngleSubject.
   */
  public static create(initialVal: NumberUnit<NavAngleUnitFamily, BasicNavAngleUnit>): BasicNavAngleSubject {
    return new BasicNavAngleSubject(initialVal);
  }

  /** @inheritdoc */
  public get(): NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit> {
    return this.value.readonly;
  }

  /**
   * Sets the new value and notifies the subscribers if the value changed.
   * @param value The new value.
   */
  public set(value: NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>): void;
  /**
   * Sets the new value and notifies the subscribers if the value changed.
   * @param value The numeric part of the new value.
   * @param unit The unit type of the new value. Defaults to the unit type of the NumberUnit used to create this
   * subject.
   */
  public set(value: number, unit?: NavAngleUnit): void;
  /**
   * Sets the new value and notifies the subscribers if the value changed.
   * @param value The numeric part of the new value.
   * @param magVar The magnetic variation of the new value.
   */
  public set(value: number, magVar: number): void;
  /**
   * Sets the new value and notifies the subscribers if the value changed.
   * @param value The numeric part of the new value.
   * @param location The location defining the new value's magnetic variation.
   */
  public set(value: number, location: LatLonInterface): void;
  /**
   * Sets the new value and notifies the subscribers if the value changed.
   * @param value The numeric part of the new value.
   * @param lat The latitude of the location defining the new value's magnetic variation.
   * @param lon The longitude of the location defining the new value's magnetic variation.
   */
  public set(value: number, lat: number, lon: number): void;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public set(
    arg1: NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit> | number,
    arg2?: NavAngleUnit | LatLonInterface | number,
    arg3?: number
  ): void {
    const isArg1Number = typeof arg1 === 'number';
    const isArg2Number = typeof arg2 === 'number';
    const isArg2LatLon = typeof arg2 === 'object' && 'lat' in arg2 && 'lon' in arg2;
    const unit = isArg1Number
      ? isArg2Number || isArg2LatLon || arg2 === undefined ? this.value.unit : arg2
      : arg1.unit;

    const oldMagVar = this.value.unit.magVar;
    const oldValue = this.value.number;

    if (isArg2LatLon) {
      this.value.unit.setMagVarFromLocation(arg2);
    } else if (isArg2Number) {
      if (typeof arg3 === 'number') {
        this.value.unit.setMagVarFromLocation(arg2, arg3);
      } else {
        this.value.unit.setMagVar(arg2);
      }
    } else {
      this.value.unit.setMagVar(unit.magVar);
    }

    if (isArg1Number) {
      this.value.set(arg1, unit);
    } else {
      this.value.set(arg1);
    }

    if (
      (!(isNaN(oldMagVar) && isNaN(this.value.unit.magVar)) && oldMagVar !== this.value.unit.magVar)
      || (!(isNaN(oldValue) && isNaN(this.value.number)) && oldValue !== this.value.number)
    ) {
      this.notify();
    }
  }
}