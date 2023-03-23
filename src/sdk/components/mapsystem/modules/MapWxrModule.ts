import { UnitType } from '../../../math/NumberUnit';
import { NumberUnitSubject } from '../../../math/NumberUnitSubject';
import { ArraySubject } from '../../../sub/ArraySubject';
import { MappedSubject } from '../../../sub/MappedSubject';
import { Subject } from '../../../sub/Subject';
import { Subscribable } from '../../../sub/Subscribable';
import { BingComponent, WxrMode } from '../../bing/BingComponent';

/**
 * A module that describes the display of weather on a Bing Map instance.
 */
export class MapWxrModule {
  /** Whether the weather radar is enabled. */
  public readonly isEnabled = Subject.create(false);

  /** The current map weather radar arc sweep angle in degrees. */
  public readonly weatherRadarArc = NumberUnitSubject.create(UnitType.DEGREE.createNumber(90));

  /** The current weather radar mode. */
  public readonly weatherRadarMode = Subject.create<EWeatherRadar.HORIZONTAL | EWeatherRadar.VERTICAL | EWeatherRadar.TOPVIEW>(EWeatherRadar.HORIZONTAL);

  /**
   * The current weather radar colors. Each entry `E_i` of the array is a tuple `[color, rate]` that defines a color
   * stop, where `color` is an RGBA color expressed as `R + G * 256 + B * 256^2 + A * 256^3` and `rate` is a
   * precipitation rate in millimeters per hour.
   *
   * In general, the color defined by `E_i` is applied to precipitation rates ranging from the rate defined by `E_i-1`
   * to the rate defined by `E_i`. There are two special cases. The color defined by `E_0` is applied to the
   * precipitation rates from zero to the rate defined by `E_0`. The color defined by `E_n-1`, where `n` is the length
   * of the array, is applied to the precipitation rates from the rate defined by `E_n-2` to positive infinity.
   */
  public readonly weatherRadarColors = ArraySubject.create<readonly [number, number]>(Array.from(BingComponent.DEFAULT_WEATHER_COLORS));

  private readonly _wxrMode = MappedSubject.create(
    ([isEnabled, arc, mode]) => {
      return {
        mode: isEnabled ? mode : EWeatherRadar.OFF,
        arcRadians: arc.asUnit(UnitType.RADIAN),
      };
    },
    this.isEnabled,
    this.weatherRadarArc,
    this.weatherRadarMode
  );

  /**
   * A subscribable containing the combined WxrMode from the mode and arc subjects,
   * suitable for consumption in a MapBingLayer.
   * @returns The WxrMode subscribable.
   */
  public get wxrMode(): Subscribable<WxrMode> {
    return this._wxrMode;
  }
}