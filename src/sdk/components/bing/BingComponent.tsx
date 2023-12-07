/// <reference types="@microsoft/msfs-types/js/common" />
/// <reference types="@microsoft/msfs-types/js/types" />
/// <reference types="@microsoft/msfs-types/js/netbingmap" />

import { GameStateProvider } from '../../data/GameStateProvider';
import { ReadonlyFloat64Array, Vec2Math } from '../../math/VecMath';
import { Vec2Subject } from '../../math/VectorSubject';
import { ArraySubject } from '../../sub/ArraySubject';
import { Subject } from '../../sub/Subject';
import { Subscribable } from '../../sub/Subscribable';
import { SubscribableArray } from '../../sub/SubscribableArray';
import { SubscribableSet } from '../../sub/SubscribableSet';
import { Subscription } from '../../sub/Subscription';
import { ArrayUtils } from '../../utils/datastructures/ArrayUtils';
import { DebounceTimer } from '../../utils/time/DebounceTimer';
import { ComponentProps, DisplayComponent, FSComponent, VNode } from '../FSComponent';

/**
 * Weather radar mode data for the BingComponent.
 */
export interface WxrMode {
  /** The weather mode. */
  mode: EWeatherRadar;

  /** The size of the weather radar arc in front of the plane, in radians. */
  arcRadians: number;
}

/**
 * Component props for the MapComponent.
 */
export interface BingComponentProps extends ComponentProps {
  /** The unique ID to assign to this Bing component. */
  id: string;

  /** The mode of the Bing component. */
  mode: EBingMode;

  /** A callback to call when the Bing component is bound. */
  onBoundCallback?: (component: BingComponent) => void;

  /** The internal resolution for the Bing component, as `[width, height]` in pixels. Defaults to 1024x1024 pixels. */
  resolution?: Subscribable<ReadonlyFloat64Array>;

  /**
   * The earth colors for the Bing component. Index 0 defines the water color, and indexes 1 to the end of the array
   * define the terrain colors. Each color should be expressed as `R + G * 256 + B * 256^2`. If not defined, all colors
   * default to black.
   */
  earthColors?: SubscribableArray<number>;

  /**
   * The elevation range over which to assign the earth terrain colors, as `[minimum, maximum]` in feet. The terrain
   * colors are assigned at regular intervals over the entire elevation range, starting with the first terrain color at
   * the minimum elevation and ending with the last terrain color at the maximum elevation. Terrain below and above the
   * minimum and maximum elevation are assigned the first and last terrain colors, respectively. Defaults to
   * `[0, 30000]`.
   */
  earthColorsElevationRange?: Subscribable<ReadonlyFloat64Array>;

  /**
   * The sky color for the Bing component. The sky color is only visible in synthetic vision (`EBingMode.HORIZON`)
   * mode. The color should be expressed as `R + G * 256 + B * 256^2`. Defaults to black.
   */
  skyColor?: Subscribable<number>;

  /** The reference mode for the Bing component. Defaults to `EBingReference.SEA`. */
  reference?: Subscribable<EBingReference>;

  /** The weather radar mode for the Bing component. Defaults to `EWeatherRadar.NONE`. */
  wxrMode?: Subscribable<WxrMode>;

  /**
   * The weather radar colors for the Bing component. Each entry `E_i` of the array is a tuple `[color, rate]` that
   * defines a color stop, where `color` is an RGBA color expressed as `R + G * 256 + B * 256^2 + A * 256^3` and `rate`
   * is a precipitation rate in millimeters per hour.
   *
   * In general, the color defined by `E_i` is applied to precipitation rates ranging from the rate defined by `E_i-1`
   * to the rate defined by `E_i`. There are two special cases. The color defined by `E_0` is applied to the
   * precipitation rates from zero to the rate defined by `E_0`. The color defined by `E_n-1`, where `n` is the length
   * of the array, is applied to the precipitation rates from the rate defined by `E_n-2` to positive infinity.
   *
   * If not defined, the colors default to {@link BingComponent.DEFAULT_WEATHER_COLORS}.
   */
  wxrColors?: SubscribableArray<readonly [number, number]>;

  /** Whether isolines should be shown. Defaults to `false`. */
  isoLines?: Subscribable<boolean>;

  /**
   * How long to delay binding the map in ms. Defaults to 3000.
   */
  delay?: number;

  /** CSS class(es) to add to the Bing component's image. */
  class?: string | SubscribableSet<string>;
}

/**
 * A FSComponent that displays the MSFS Bing Map, weather radar, and 3D terrain.
 */
export class BingComponent extends DisplayComponent<BingComponentProps> {
  /** The default resolution of the Bing Map along both horizontal and vertical axes, in pixels. */
  public static readonly DEFAULT_RESOLUTION = 1024;

  public static readonly DEFAULT_WEATHER_COLORS: readonly (readonly [number, number])[] = [
    [BingComponent.hexaToRGBAColor('#00000000'), 0.5],
    [BingComponent.hexaToRGBAColor('#004d00ff'), 2.75],
    [BingComponent.hexaToRGBAColor('#cb7300ff'), 12.5],
    [BingComponent.hexaToRGBAColor('#ff0000ff'), 12.5]
  ];

  private static readonly POSITION_RADIUS_INHIBIT_FRAMES = 10;

  private readonly modeFlags = this.props.mode === EBingMode.HORIZON ? 4 : 0;

  private mapListener!: ViewListener.ViewListener;
  private isListenerRegistered = false;
  private readonly imgRef = FSComponent.createRef<HTMLImageElement>();
  private binder?: BingMapsBinder;
  private uid = 0;

  private _isBound = false;
  private _isAwake = true;

  private isDestroyed = false;

  private pos = new LatLong(0, 0);
  private radius = 10;
  private readonly resolution = this.props.resolution ?? Vec2Subject.create(Vec2Math.create(BingComponent.DEFAULT_RESOLUTION, BingComponent.DEFAULT_RESOLUTION));
  private readonly earthColors = this.props.earthColors ?? ArraySubject.create(ArrayUtils.create(2, () => BingComponent.hexaToRGBColor('#000000')));
  private readonly earthColorsElevationRange = this.props.earthColorsElevationRange ?? Vec2Subject.create(Vec2Math.create(0, 30000));
  private readonly skyColor = this.props.skyColor ?? Subject.create(BingComponent.hexaToRGBColor('#000000'));
  private readonly reference = this.props.reference ?? Subject.create(EBingReference.SEA);
  private readonly wxrMode = this.props.wxrMode ?? Subject.create<WxrMode>({ mode: EWeatherRadar.OFF, arcRadians: 0.5 });
  private readonly wxrColors = this.props.wxrColors ?? ArraySubject.create(Array.from(BingComponent.DEFAULT_WEATHER_COLORS));
  private readonly isoLines = this.props.isoLines ?? Subject.create<boolean>(false);

  private readonly wxrColorsArray: number[] = [];
  private readonly wxrRateArray: number[] = [];

  private gameStateSub?: Subscription;

  private resolutionSub?: Subscription;
  private earthColorsSub?: Subscription;
  private earthColorsElevationRangeSub?: Subscription;
  private skyColorSub?: Subscription;
  private referenceSub?: Subscription;
  private wxrModeSub?: Subscription;
  private wxrColorsSub?: Subscription;
  private isoLinesSub?: Subscription;

  private readonly resolutionHandler = (resolution: ReadonlyFloat64Array): void => {
    Coherent.call('SET_MAP_RESOLUTION', this.uid, resolution[0], resolution[1]);

    // The sim ignores position/radius updates within a certain number of frames of sending a resolution change, so we
    // will keep trying to send pending updates for a few frames after any resolution change.
    this.positionRadiusInhibitFramesRemaining = BingComponent.POSITION_RADIUS_INHIBIT_FRAMES;
    if (!this.positionRadiusInhibitTimer.isPending()) {
      this.positionRadiusInhibitTimer.schedule(this.processPendingPositionRadius, 0);
    }
  };
  private readonly earthColorsHandler = (): void => {
    const colors = this.earthColors.getArray();

    if (colors.length < 2) {
      return;
    }

    Coherent.call('SET_MAP_HEIGHT_COLORS', this.uid, colors);
  };
  private readonly earthColorsElevationRangeHandler = (): void => {
    const colors = this.earthColors.getArray();

    if (colors.length < 2) {
      return;
    }

    // The way the map assigns colors to elevations is as follows:
    // ----------------------------------------------------------------------------------
    // - altitude range = MIN to MAX
    // - colors = array of length N >= 2 (colors[0] is the water color)
    // - STEP = (MAX - MIN) / N
    // - colors[i] is assigned to elevations from MIN + STEP * i to MIN + STEP * (i + 1)
    // - colors[1] is also assigned to all elevations < MIN + STEP
    // - colors[N - 1] is also assigned to all elevations > MIN + STEP * N
    // ----------------------------------------------------------------------------------

    const range = this.earthColorsElevationRange.get();
    const terrainColorCount = colors.length - 1;
    const desiredElevationStep = (range[1] - range[0]) / Math.max(terrainColorCount - 1, 1);

    const requiredMin = range[0] - desiredElevationStep;
    const requiredMax = range[1] + desiredElevationStep;

    Coherent.call('SET_MAP_ALTITUDE_RANGE', this.uid, requiredMin, requiredMax);
  };
  private readonly skyColorHandler = (color: number): void => {
    Coherent.call('SET_MAP_CLEAR_COLOR', this.uid, color);
  };
  private readonly referenceHandler = (reference: EBingReference): void => {
    const flags = this.modeFlags | (reference === EBingReference.PLANE ? 1 : 0);
    this.mapListener.trigger('JS_BIND_BINGMAP', this.props.id, flags);
  };
  private readonly wxrModeHandler = (wxrMode: WxrMode): void => {
    Coherent.call('SHOW_MAP_WEATHER', this.uid, wxrMode.mode, wxrMode.arcRadians);
  };
  private readonly wxrColorsHandler = (): void => {
    const array = this.wxrColors.getArray();

    if (array.length === 0) {
      return;
    }

    this.wxrColorsArray.length = array.length;
    this.wxrRateArray.length = array.length;

    for (let i = 0; i < array.length; i++) {
      this.wxrColorsArray[i] = array[i][0];
      this.wxrRateArray[i] = array[i][1];
    }

    Coherent.call('SET_MAP_WEATHER_RADAR_COLORS', this.uid, this.wxrColorsArray, this.wxrRateArray);
  };
  private readonly isoLinesHandler = (showIsolines: boolean): void => {
    Coherent.call('SHOW_MAP_ISOLINES', this.uid, showIsolines);
  };

  private setCurrentMapParamsTimer: NodeJS.Timer | null = null;

  private positionRadiusInhibitFramesRemaining = 0;
  private isPositionRadiusPending = false;
  private readonly positionRadiusInhibitTimer = new DebounceTimer();
  private readonly processPendingPositionRadius = (): void => {
    if (this.isPositionRadiusPending) {
      Coherent.call('SET_MAP_PARAMS', this.uid, this.pos, this.radius);
    }

    if (--this.positionRadiusInhibitFramesRemaining > 0) {
      this.positionRadiusInhibitTimer.schedule(this.processPendingPositionRadius, 0);
    } else {
      this.isPositionRadiusPending = false;
    }
  };

  /**
   * Checks whether this Bing component has been bound.
   * @returns whether this Bing component has been bound.
   */
  public isBound(): boolean {
    return this._isBound;
  }

  /**
   * Checks whether this Bing component is awake.
   * @returns whether this Bing component is awake.
   */
  public isAwake(): boolean {
    return this._isAwake;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    if ((window as any)['IsDestroying']) {
      this.destroy();
      return;
    }

    const gameStateSubscribable = GameStateProvider.get();
    const gameState = gameStateSubscribable.get();

    if (gameState === GameState.briefing || gameState === GameState.ingame) {
      this.registerListener();
    } else {
      this.gameStateSub = gameStateSubscribable.sub(state => {
        if (this.isDestroyed) {
          return;
        }

        if (state === GameState.briefing || state === GameState.ingame) {
          this.gameStateSub?.destroy();
          this.registerListener();
        }
      });
    }

    window.addEventListener('OnDestroy', this.destroy.bind(this));
  }

  /**
   * Registers this component's Bing map listener.
   */
  private registerListener(): void {
    if ((this.props.delay ?? 0) > 0) {
      setTimeout(() => {
        if (this.isDestroyed) {
          return;
        }

        this.mapListener = RegisterViewListener('JS_LISTENER_MAPS', this.onListenerRegistered.bind(this));
      }, this.props.delay);
    } else {
      this.mapListener = RegisterViewListener('JS_LISTENER_MAPS', this.onListenerRegistered.bind(this));
    }
  }

  /**
   * A callback called when this component's Bing map listener is registered.
   */
  private onListenerRegistered(): void {
    if (this.isDestroyed || this.isListenerRegistered) {
      return;
    }

    this.mapListener.on('MapBinded', this.onListenerBound);
    this.mapListener.on('MapUpdated', this.onMapUpdate);

    this.isListenerRegistered = true;
    this.mapListener.trigger('JS_BIND_BINGMAP', this.props.id, this.modeFlags);
  }

  /**
   * A callback called when the listener is fully bound.
   * @param binder The binder from the listener.
   * @param uid The unique ID of the bound map.
   */
  private onListenerBound = (binder: BingMapsBinder, uid: number): void => {
    if (this.isDestroyed) {
      return;
    }

    if (binder.friendlyName === this.props.id) {
      // console.log('Bing map listener bound.');
      this.binder = binder;
      this.uid = uid;
      if (this._isBound) {
        return;
      }

      this._isBound = true;

      Coherent.call('SHOW_MAP', uid, true);

      const pause = !this._isAwake;

      this.earthColorsSub = this.earthColors.sub(() => {
        this.earthColorsHandler();
        this.earthColorsElevationRangeHandler();
      }, true, pause);
      this.earthColorsElevationRangeSub = this.earthColorsElevationRange.sub(this.earthColorsElevationRangeHandler, true, pause);
      this.skyColorSub = this.skyColor.sub(this.skyColorHandler, true, pause);
      this.referenceSub = this.reference.sub(this.referenceHandler, true, pause);
      this.wxrModeSub = this.wxrMode.sub(this.wxrModeHandler, true, pause);
      this.wxrColorsSub = this.wxrColors.sub(this.wxrColorsHandler, true, pause);
      this.resolutionSub = this.resolution.sub(this.resolutionHandler, true, pause);
      this.isoLinesSub = this.isoLines.sub(this.isoLinesHandler, true, pause);

      // Only when not SVT, send in initial map params (even if we are asleep), because a bing instance that doesn't
      // have params initialized causes GPU perf issues.
      if (this.modeFlags !== 4) {
        Coherent.call('SET_MAP_PARAMS', this.uid, this.pos, this.radius);
      }

      this.props.onBoundCallback && this.props.onBoundCallback(this);
    }
  };

  /**
   * A callback called when the map image is updated.
   * @param uid The unique ID of the bound map.
   * @param imgSrc The img tag src attribute to assign to the bing map image.
   */
  private onMapUpdate = (uid: number, imgSrc: string): void => {
    if (this.binder !== undefined && this.uid === uid && this.imgRef.instance !== null) {
      if (this.imgRef.instance.src !== imgSrc) {
        this.imgRef.instance.src = imgSrc;
      }
    }
  };

  /**
   * Calls the position and radius set function to set map parameters.
   */
  private setCurrentMapParams = (): void => {
    this.setPositionRadius(this.pos, this.radius);
  };

  /**
   * Wakes this Bing component. Upon awakening, this component will synchronize its state from when it was put to sleep
   * to the Bing instance to which it is bound.
   */
  public wake(): void {
    this._isAwake = true;

    if (!this._isBound) {
      return;
    }

    this.setCurrentMapParams();

    // Only when not SVT, periodically send map params to Coherent in case another BingComponent binds to the same
    // bing instance and sends in the initial params set and overrides our params.
    if (this.modeFlags !== 4) {
      this.setCurrentMapParamsTimer = setInterval(this.setCurrentMapParams, 200);
    }

    this.earthColorsSub?.resume(true);
    this.earthColorsElevationRangeSub?.resume(true);
    this.skyColorSub?.resume(true);
    this.referenceSub?.resume(true);
    this.wxrModeSub?.resume(true);
    this.wxrColorsSub?.resume(true);
    this.resolutionSub?.resume(true);
    this.isoLinesSub?.resume(true);
  }

  /**
   * Puts this Bing component to sleep. While asleep, this component cannot make changes to the Bing instance to which
   * it is bound.
   */
  public sleep(): void {
    this._isAwake = false;

    if (!this._isBound) {
      return;
    }

    if (this.setCurrentMapParamsTimer !== null) {
      clearInterval(this.setCurrentMapParamsTimer);
    }

    this.earthColorsSub?.pause();
    this.earthColorsElevationRangeSub?.pause();
    this.skyColorSub?.pause();
    this.referenceSub?.pause();
    this.wxrModeSub?.pause();
    this.wxrColorsSub?.pause();
    this.resolutionSub?.pause();
    this.isoLinesSub?.pause();
  }

  /**
   * Sets the center position and radius.
   * @param pos The center position.
   * @param radius The radius, in meters.
   */
  public setPositionRadius(pos: LatLong, radius: number): void {
    this.pos = pos;
    this.radius = Math.max(radius, 10); // Not sure if bad things happen when radius is 0, so we just clamp it to 10 meters.

    if (this._isBound && this._isAwake) {
      if (this.positionRadiusInhibitFramesRemaining > 0) {
        this.isPositionRadiusPending = true;
      } else {
        Coherent.call('SET_MAP_PARAMS', this.uid, this.pos, this.radius);
      }
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <img ref={this.imgRef} src='' style='position: absolute; left: 0; top: 0; width: 100%; height: 100%;' class={this.props.class ?? ''} />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isDestroyed = true;
    this._isBound = false;

    if (this.setCurrentMapParamsTimer !== null) {
      clearInterval(this.setCurrentMapParamsTimer);
    }

    this.gameStateSub?.destroy();

    this.earthColorsSub?.destroy();
    this.earthColorsElevationRangeSub?.destroy();
    this.skyColorSub?.destroy();
    this.referenceSub?.destroy();
    this.wxrModeSub?.destroy();
    this.wxrColorsSub?.destroy();
    this.resolutionSub?.destroy();
    this.isoLinesSub?.destroy();

    this.mapListener?.off('MapBinded', this.onListenerBound);
    this.mapListener?.off('MapUpdated', this.onMapUpdate);
    this.mapListener?.trigger('JS_UNBIND_BINGMAP', this.props.id);
    this.isListenerRegistered = false;

    this.imgRef.instance.src = '';
    this.imgRef.instance.parentNode?.removeChild(this.imgRef.instance);

    super.destroy();
  }

  /**
   * Resets the img element's src attribute.
   */
  public resetImgSrc(): void {
    const imgRef = this.imgRef.getOrDefault();
    if (imgRef !== null) {
      const currentSrc = imgRef.src;
      imgRef.src = '';
      imgRef.src = currentSrc;
    }
  }

  /**
   * Converts an HTML hex color string to a numerical RGB value, as `R + G * 256 + B * 256^2`.
   * @param hexColor The hex color string to convert.
   * @returns The numerical RGB value equivalent of the specified hex color string, as `R + G * 256 + B * 256^2`.
   */
  public static hexaToRGBColor(hexColor: string): number {
    const hexStringColor = hexColor;
    let offset = 0;

    if (hexStringColor[0] === '#') {
      offset = 1;
    }

    const r = parseInt(hexStringColor.substr(0 + offset, 2), 16);
    const g = parseInt(hexStringColor.substr(2 + offset, 2), 16);
    const b = parseInt(hexStringColor.substr(4 + offset, 2), 16);

    return BingComponent.rgbColor(r, g, b);
  }

  /**
   * Converts a numerical RGB value to an HTML hex color string.
   * @param rgb The numerical RGB value to convert, as `R + G * 256 + B * 256^2`.
   * @param poundPrefix Whether to include the pound (`#`) prefix in the converted string. Defaults to `true`.
   * @returns The HTML hex color string equivalent of the specified numerical RGB value.
   */
  public static rgbToHexaColor(rgb: number, poundPrefix = true): string {
    const b = Math.floor((rgb % (256 * 256 * 256)) / (256 * 256));
    const g = Math.floor((rgb % (256 * 256)) / 256);
    const r = rgb % 256;

    return `${poundPrefix ? '#' : ''}${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Converts RGB color components to a numerical RGB value, as `R + G * 256 + B * 256^2`.
   * @param r The red component, from 0 to 255.
   * @param g The green component, from 0 to 255.
   * @param b The blue component, from 0 to 255.
   * @returns The numerical RGB value of the specified components, as `R + G * 256 + B * 256^2`.
   */
  public static rgbColor(r: number, g: number, b: number): number {
    return 256 * 256 * b + 256 * g + r;
  }

  /**
   * Converts an HTML hex color string to a numerical RGBA value, as `R + G * 256 + B * 256^2 + A * 256^3`.
   * @param hexColor The hex color string to convert.
   * @returns The numerical RGBA value equivalent of the specified hex color string, as
   * `R + G * 256 + B * 256^2 + A * 256^3`.
   */
  public static hexaToRGBAColor(hexColor: string): number {
    const hexStringColor = hexColor;
    let offset = 0;

    if (hexStringColor[0] === '#') {
      offset = 1;
    }

    const r = parseInt(hexStringColor.substr(0 + offset, 2), 16);
    const g = parseInt(hexStringColor.substr(2 + offset, 2), 16);
    const b = parseInt(hexStringColor.substr(4 + offset, 2), 16);
    const a = parseInt(hexStringColor.substr(6 + offset, 2), 16);

    return BingComponent.rgbaColor(r, g, b, a);
  }

  /**
   * Converts a numerical RGBA value to an HTML hex color string.
   * @param rgba The numerical RGBA value to convert, as `R + G * 256 + B * 256^2 + A * 256^3`.
   * @param poundPrefix Whether to include the pound (`#`) prefix in the converted string. Defaults to `true`.
   * @returns The HTML hex color string equivalent of the specified numerical RGBA value.
   */
  public static rgbaToHexaColor(rgba: number, poundPrefix = true): string {
    const a = Math.floor((rgba % (256 * 256 * 256 * 256)) / (256 * 256 * 256));
    const b = Math.floor((rgba % (256 * 256 * 256)) / (256 * 256));
    const g = Math.floor((rgba % (256 * 256)) / 256);
    const r = rgba % 256;

    return `${poundPrefix ? '#' : ''}${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${a.toString(16).padStart(2, '0')}`;
  }

  /**
   * Converts RGBA color components to a numerical RGBA value, as `R + G * 256 + B * 256^2 + A * 256^3`.
   * @param r The red component, from 0 to 255.
   * @param g The green component, from 0 to 255.
   * @param b The blue component, from 0 to 255.
   * @param a The alpha component, from 0 to 255.
   * @returns The numerical RGBA value of the specified components, as `R + G * 256 + B * 256^2 + A * 256^3`.
   */
  public static rgbaColor(r: number, g: number, b: number, a: number): number {
    return 256 * 256 * 256 * a + 256 * 256 * b + 256 * g + r;
  }

  /**
   * Creates a full Bing component earth colors array. The earth colors array will contain the specified water color
   * and terrain colors (including interpolated values between the explicitly defined ones, as necessary).
   * @param waterColor The desired water color, as a hex string with the format `#hhhhhh`.
   * @param terrainColors An array of desired terrain colors at specific elevations. Elevations should be specified in
   * feet and colors as hex strings with the format `#hhhhhh`.
   * @param minElevation The minimum elevation to which to assign a color, in feet. Defaults to 0.
   * @param maxElevation The maximum elevation to which to assign a color, in feet. Defaults to 30000.
   * @param stepCount The number of terrain color steps. Defaults to 61.
   * @returns a full Bing component earth colors array.
   */
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static createEarthColorsArray(waterColor: string, terrainColors: { elev: number, color: string }[], minElevation = 0, maxElevation = 30000, stepCount = 61): number[] {
    const earthColors = [BingComponent.hexaToRGBColor(waterColor)];

    const curve = new Avionics.Curve<string>();
    curve.interpolationFunction = Avionics.CurveTool.StringColorRGBInterpolation;
    for (let i = 0; i < terrainColors.length; i++) {
      curve.add(terrainColors[i].elev, terrainColors[i].color);
    }

    const elevationStep = (maxElevation - minElevation) / Math.max(stepCount - 1, 1);

    for (let i = 0; i < stepCount; i++) {
      const color = curve.evaluate(minElevation + i * elevationStep);
      earthColors[i + 1] = BingComponent.hexaToRGBColor(color);
    }

    return earthColors;
  }
}
