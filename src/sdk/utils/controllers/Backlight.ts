import { ConsumerSubject, EventBus } from '../../data';
import { GeoPoint } from '../../geo';
import { ClockEvents, GNSSEvents } from '../../instruments';
import { Vec3Math } from '../../math';
import { Subject, Subscribable, Subscription } from '../../sub';

/**
 * A controler for automated backlighting levels based upon the angle of the sun in the sky.
 */
export class BacklightLevelController {
  private static readonly AUTO_MAX_SOLAR_ANGLE = 3; // The solar altitude angle at which auto backlight reaches maximum intensity.
  private static readonly AUTO_MIN_SOLAR_ANGLE = -8; // The solar altitude angle at which auto backlight reaches minimum intensity.
  private static readonly AUTO_MAX_SOLAR_ANGLE_SIN = Math.sin(BacklightLevelController.AUTO_MAX_SOLAR_ANGLE * Avionics.Utils.DEG2RAD);
  private static readonly AUTO_MIN_SOLAR_ANGLE_SIN = Math.sin(BacklightLevelController.AUTO_MIN_SOLAR_ANGLE * Avionics.Utils.DEG2RAD);
  private static readonly AUTO_SOLAR_ANGLE_RANGE_SIN = BacklightLevelController.AUTO_MAX_SOLAR_ANGLE_SIN - BacklightLevelController.AUTO_MIN_SOLAR_ANGLE_SIN;

  private static readonly AUTO_UPDATE_REALTIME_FREQ = 10; // max frequency (Hz) of auto backlight level updates in real time
  private static readonly AUTO_UPDATE_SIMTIME_THRESHOLD = 60000; // minimum interval (ms) between auto backlight level updates in sim time
  private static readonly EPOCH = 946684800000; // Jan 1, 2000 00:00:00 UTC
  private static readonly DAY = 86400000; // milliseconds in one day

  private static readonly DEFAULT_MIN_INTENSITY = 0;
  private static readonly DEFAULT_MAX_INTENSITY = 1;

  private static tempVec3 = new Float64Array(3);

  private readonly simTime = ConsumerSubject.create(null, 0);
  private readonly ppos = new Float64Array(3);

  private needRecalcAuto = true;
  private lastSimTime = 0;

  private _autoMaxIntensity: number; // The maximum intensity applied by auto backlight.
  private _autoMinIntensity: number; // The minimum intensity applied by auto backlight.
  private _autoIntensityRange: number;
  private paused = false;

  private readonly pposSub: Subscription;
  private readonly updateSub: Subscription;

  private readonly _intensity = Subject.create(0);
  public readonly intensity = this._intensity as Subscribable<number>;

  /**
   * Creates an automatic backlight controller.
   * @param bus The event bus.
   * @param paused Whether the controller should be initially paused. Defaults to `false`.
   * @param minIntensity The maximum intensity commanded by the controller. Defaults to 0.
   * @param maxIntensity The minimum intensity commanded by the controller. Defaults to 1.
   */
  constructor(
    bus: EventBus,
    paused = false,
    minIntensity = BacklightLevelController.DEFAULT_MIN_INTENSITY,
    maxIntensity = BacklightLevelController.DEFAULT_MAX_INTENSITY
  ) {
    this._autoMinIntensity = minIntensity;
    this._autoMaxIntensity = maxIntensity;
    this._autoIntensityRange = this.autoMaxIntensity - this.autoMinIntensity;
    this.needRecalcAuto = true;

    const sub = bus.getSubscriber<ClockEvents & GNSSEvents>();
    this.simTime.setConsumer(sub.on('simTime'));
    this.pposSub = sub.on('gps-position').atFrequency(BacklightLevelController.AUTO_UPDATE_REALTIME_FREQ).handle(this.onPPosChanged.bind(this));
    this.updateSub = sub.on('realTime').atFrequency(BacklightLevelController.AUTO_UPDATE_REALTIME_FREQ).handle(this.onUpdate.bind(this));

    this.setPaused(paused);
  }

  /**
   * Get the max auto intensity value
   * @returns The maximum intensity applied by the auto backlight.
   */
  public get autoMaxIntensity(): number {
    return this._autoMaxIntensity;
  }

  /**
   * Set the max auto intensity value.
   * @param max_intensity The maximum intensity applied by auto backlight.
   */
  public set autoMaxIntensity(max_intensity: number) {
    this._autoMaxIntensity = max_intensity;
    this._autoIntensityRange = this._autoMaxIntensity - this._autoMinIntensity;
    this.needRecalcAuto = true;
  }

  /**
   * Get the min auto intensity value
   * @returns THe minimum intensity applied by the auto backlight.
   */
  public get autoMinIntensity(): number {
    return this._autoMinIntensity;
  }

  /**
   * Set the min auto intensity value.
   * @param min_intensity The minimum intensity applied by the auto backlight.
   */
  public set autoMinIntensity(min_intensity: number) {
    this._autoMinIntensity = min_intensity;
    this._autoIntensityRange = this._autoMinIntensity - min_intensity;
    this.needRecalcAuto = true;
  }

  /**
   * Pause or unpause real-time processing.
   * @param paused Whether to pause or not.
   */
  public setPaused(paused: boolean): void {
    if (paused !== this.paused) {
      this.paused = paused;
      if (paused) {
        this.updateSub.pause();
        this.pposSub.pause();
        this.simTime.pause();
        this.needRecalcAuto = false;
      } else {
        this.needRecalcAuto = true;
        this.simTime.resume();
        this.pposSub.resume(true);
        this.updateSub.resume(true);
      }
    }
  }

  /**
   * A callback which is called when the user's location changes.
   * @param ppos The new plane position.
   */
  private onPPosChanged(ppos: LatLongAlt): void {
    const pposVec = GeoPoint.sphericalToCartesian(ppos.lat, ppos.long, BacklightLevelController.tempVec3);
    if (Vec3Math.dot(pposVec, this.ppos) >= 1 - 1e-4) { // ~600 m
      return;
    }

    Vec3Math.copy(pposVec, this.ppos);
    this.needRecalcAuto = true;
  }

  /**
   * Updates this controller's commanded backlight intensity if necessary.
   */
  private onUpdate(): void {
    const simTime = this.simTime.get();

    this.needRecalcAuto ||= Math.abs(simTime - this.lastSimTime) >= BacklightLevelController.AUTO_UPDATE_SIMTIME_THRESHOLD;

    if (this.needRecalcAuto) {
      this.needRecalcAuto = false;
      this.updateAutoBacklightIntensity(simTime);
    }
  }

  /**
   * Updates this controller's commanded backlight intensity according to the auto setting algorithm.
   * @param simTime The current sim time.
   */
  private updateAutoBacklightIntensity(simTime: number): void {
    this.lastSimTime = simTime;

    const subSolarPoint = BacklightLevelController.calculateSubSolarPoint(simTime, BacklightLevelController.tempVec3);
    const sinSolarAngle = Vec3Math.dot(this.ppos, subSolarPoint);
    const sinSolarAngleClamped = Utils.Clamp(sinSolarAngle, BacklightLevelController.AUTO_MIN_SOLAR_ANGLE_SIN, BacklightLevelController.AUTO_MAX_SOLAR_ANGLE_SIN);
    const intensityFrac = (sinSolarAngleClamped - BacklightLevelController.AUTO_MIN_SOLAR_ANGLE_SIN) / BacklightLevelController.AUTO_SOLAR_ANGLE_RANGE_SIN;

    this._intensity.set(this._autoMinIntensity + intensityFrac * this._autoIntensityRange);
  }

  /**
   * Calculates the subsolar point (the point on Earth's surface directly below the Sun, where solar zenith angle = 0)
   * given a specific time.
   * @param time A UNIX timestamp in milliseconds.
   * @param out A Float64Array object to which to write the result.
   * @returns The subsolar point at the specified time.
   */
  private static calculateSubSolarPoint(time: number, out: Float64Array): Float64Array {
    // Source: Zhang, T et al. https://doi.org/10.1016/j.renene.2021.03.047
    const PI2 = 2 * Math.PI;
    const days = (time - BacklightLevelController.EPOCH) / BacklightLevelController.DAY;
    const daysFrac = days - Math.floor(days);
    const L = (4.895055 + 0.01720279 * days);
    const g = (6.240041 + 0.01720197 * days);
    const lambda = L + 0.033423 * Math.sin(g) + 0.000349 * Math.sin(2 * g);
    const epsilon = 0.40910518 - 6.98e-9 * days;
    const rAscension = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda));
    const declination = Math.asin(Math.sin(epsilon) * Math.sin(lambda));

    // equation of time in days.
    const E = (((L - rAscension) % PI2 + 3 * Math.PI) % PI2 - Math.PI) * 0.159155;

    const lat = declination * Avionics.Utils.RAD2DEG;
    const lon = -15 * (daysFrac - 0.5 + E) * 24;

    return GeoPoint.sphericalToCartesian(lat, lon, out);
  }
}
