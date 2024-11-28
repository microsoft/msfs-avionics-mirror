import { SimVarValueType } from '../../data/SimVars';
import { LatLonInterface } from '../../geo/GeoInterfaces';
import { GeoPoint } from '../../geo/GeoPoint';
import { MathUtils } from '../../math/MathUtils';
import { Accessible } from '../../sub/Accessible';
import { AccessibleUtils } from '../../sub/AccessibleUtils';
import { Value } from '../../sub/Value';
import { LNavComputerDataProvider } from './LNavComputer';

/**
 * Configuration options for {@link LNavComputerDataProvider}.
 */
export type DefaultLNavComputerDataProviderOptions = {
  /**
   * Whether position data is considered valid. Position data includes airplane position, ground speed, and ground
   * track. Defaults to `true`.
   */
  isPositionDataValid?: boolean | Accessible<boolean>;

  /** Whether heading data is considered valid. Defaults to `true`. */
  isHeadingDataValid?: boolean | Accessible<boolean>;

  /**
   * Whether magnetic variation data is considered valid. Position data includes airplane position, ground speed, ground track,
   * and magnetic variation. Defaults to `true`.
   */
  isMagVarDataValid?: boolean | Accessible<boolean>;

  /** Whether true airspeed data is considered valid. Defaults to `true`. */
  isTrueAirspeedDataValid?: boolean | Accessible<boolean>;
};

/**
 * An implementation of {@link LNavComputerDataProvider} that sources data directly from SimVars.
 */
export class DefaultLNavComputerDataProvider implements LNavComputerDataProvider {
  private readonly latSimVarId = SimVar.GetRegisteredId('PLANE LATITUDE', SimVarValueType.Degree, '');
  private readonly lonSimVarId = SimVar.GetRegisteredId('PLANE LONGITUDE', SimVarValueType.Degree, '');

  private readonly velocityXSimVarId = SimVar.GetRegisteredId('VELOCITY WORLD X', SimVarValueType.Knots, '');
  private readonly velocityZSimVarId = SimVar.GetRegisteredId('VELOCITY WORLD Z', SimVarValueType.Knots, '');

  private readonly headingSimVarId = SimVar.GetRegisteredId('PLANE HEADING DEGREES TRUE', SimVarValueType.Degree, '');

  private readonly magVarSimVarId = SimVar.GetRegisteredId('MAGVAR', SimVarValueType.Degree, '');

  private readonly tasSimVarId = SimVar.GetRegisteredId('AIRSPEED TRUE', SimVarValueType.Knots, '');

  private readonly isPositionDataValid: Accessible<boolean>;
  private readonly isHeadingDataValid: Accessible<boolean>;
  private readonly isMagVarDataValid: Accessible<boolean>;
  private readonly isTrueAirspeedDataValid: Accessible<boolean>;

  private readonly _planePos = Value.create(new GeoPoint(NaN, NaN));
  /** @inheritDoc */
  public readonly planePos = this._planePos as Accessible<Readonly<LatLonInterface>>;

  private readonly _gs = Value.create<number | null>(null);
  /** @inheritDoc */
  public readonly gs = this._gs as Accessible<number | null>;

  private readonly _track = Value.create<number | null>(null);
  /** @inheritDoc */
  public readonly track = this._track as Accessible<number | null>;

  private readonly _heading = Value.create<number | null>(null);
  /** @inheritDoc */
  public readonly heading = this._heading as Accessible<number | null>;

  private readonly _magVar = Value.create<number | null>(null);
  /** @inheritDoc */
  public readonly magVar = this._magVar as Accessible<number | null>;

  private readonly _tas = Value.create<number | null>(null);
  /** @inheritDoc */
  public readonly tas = this._tas as Accessible<number | null>;

  /**
   * Creates a new instance of DefaultLNavComputerDataProvider.
   * @param options Options with which to configure the data provider.
   */
  public constructor(options?: Readonly<DefaultLNavComputerDataProviderOptions>) {
    this.isPositionDataValid = AccessibleUtils.toAccessible(options?.isPositionDataValid ?? true, true);
    this.isHeadingDataValid = AccessibleUtils.toAccessible(options?.isHeadingDataValid ?? true, true);
    this.isMagVarDataValid = AccessibleUtils.toAccessible(options?.isMagVarDataValid ?? true, true);
    this.isTrueAirspeedDataValid = AccessibleUtils.toAccessible(options?.isTrueAirspeedDataValid ?? true, true);
  }

  /**
   * Updates this provider's data.
   */
  public update(): void {
    let heading: number | undefined;

    if (this.isPositionDataValid.get()) {
      this._planePos.get().set(SimVar.GetSimVarValueFastReg(this.latSimVarId), SimVar.GetSimVarValueFastReg(this.lonSimVarId));

      const velocityEW = SimVar.GetSimVarValueFastReg(this.velocityXSimVarId);
      const velocityNS = SimVar.GetSimVarValueFastReg(this.velocityZSimVarId);

      const gs = Math.hypot(velocityEW, velocityNS);
      this._gs.set(gs);

      if (gs > 1) {
        this._track.set(MathUtils.normalizeAngleDeg(Math.atan2(velocityEW, velocityNS) * Avionics.Utils.RAD2DEG));
      } else {
        this._track.set(heading = SimVar.GetSimVarValueFastReg(this.headingSimVarId));
      }
    } else {
      this._planePos.get().set(NaN, NaN);
      this._gs.set(null);
      this._track.set(null);
    }

    if (this.isHeadingDataValid.get()) {
      this._heading.set(heading ?? SimVar.GetSimVarValueFastReg(this.headingSimVarId));
    } else {
      this._heading.set(null);
    }

    if (this.isMagVarDataValid.get()) {
      this._magVar.set(SimVar.GetSimVarValueFastReg(this.magVarSimVarId));
    } else {
      this._magVar.set(null);
    }

    if (this.isTrueAirspeedDataValid.get()) {
      this._tas.set(SimVar.GetSimVarValueFastReg(this.tasSimVarId));
    } else {
      this._tas.set(null);
    }
  }
}
