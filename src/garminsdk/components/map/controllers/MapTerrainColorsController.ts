import { ArrayUtils, BingComponent, MapSystemContext, MapSystemController, MapSystemKeys, MapTerrainColorsModule, ReadonlyFloat64Array, Subscription, Vec2Math } from '@microsoft/msfs-sdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapUtils } from '../MapUtils';
import { MapTerrainMode, MapTerrainModule } from '../modules/MapTerrainModule';

/**
 * A map terrain colors definition.
 */
export type MapTerrainColorsDefinition = {
  /**
   * The earth colors array. Index 0 defines the water color, and indexes 1 to the end of the array define the terrain
   * colors.
   */
  colors: readonly number[];

  /** The elevation range over which the terrain colors are applied, as `[minimum, maximum]` in feet. */
  elevationRange: ReadonlyFloat64Array;
};

/**
 * Modules required for MapTerrainColorsController.
 */
export interface MapTerrainColorsControllerModules {
  /** Terrain module. */
  [GarminMapKeys.Terrain]: MapTerrainModule;

  /** Terrain colors module. */
  [MapSystemKeys.TerrainColors]: MapTerrainColorsModule;
}

/**
 * Controls the display of terrain colors based on the terrain mode value in {@link MapTerrainModule}.
 */
export class MapTerrainColorsController extends MapSystemController<MapTerrainColorsControllerModules> {
  private static readonly DEFAULT_COLORS = MapUtils.noTerrainEarthColors();

  private static readonly MODE_REFERENCE_MAP = {
    [MapTerrainMode.None]: EBingReference.SEA,
    [MapTerrainMode.Absolute]: EBingReference.SEA,
    [MapTerrainMode.Relative]: EBingReference.PLANE,
    [MapTerrainMode.Ground]: EBingReference.PLANE
  };

  private static readonly BLEND_UPDATE_TARGET_STEP_COUNT = 100;
  private static readonly BLEND_UPDATE_MAX_HZ = 30;

  private readonly terrainModule = this.context.model.getModule(GarminMapKeys.Terrain);
  private readonly terrainColorsModule = this.context.model.getModule(MapSystemKeys.TerrainColors);

  private readonly groundRelativeBlendTimeStep: number = 0;
  private readonly groundRelativeBlendTimeOffset: number = 0;
  private readonly groundRelativeBlendColors?: number[][];

  private blendArmedMode: MapTerrainMode | undefined = undefined;
  private isBlending = false;
  private blendDirection: 1 | -1 = 1;
  private blendProgress = 0;
  private lastBlendIndex = -1;
  private lastBlendTime = 0;

  private modeSub?: Subscription;

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param colors The terrain colors to use for each terrain mode. Default colors will be used for any mode which does
   * not have a colors definition.
   * @param groundRelativeBlendDuration The amount of time, in milliseconds, over which to blend the on-ground and
   * relative terrain mode colors when transitioning between the two. Defaults to 0 milliseconds. A blend transition is
   * only possible if colors are defined for both the on-ground and relative terrain modes, and the colors for both
   * modes have the same number of steps and are applied over the same elevation range.
   */
  constructor(
    context: MapSystemContext<MapTerrainColorsControllerModules>,
    private readonly colors: Partial<Record<MapTerrainMode, Readonly<MapTerrainColorsDefinition>>>,
    private readonly groundRelativeBlendDuration = 0
  ) {
    super(context);

    if (groundRelativeBlendDuration > 0) {
      const groundDef = colors[MapTerrainMode.Ground];
      const relativeDef = colors[MapTerrainMode.Relative];

      if (groundDef && relativeDef && groundDef.colors.length === relativeDef.colors.length && Vec2Math.equals(groundDef.elevationRange, relativeDef.elevationRange)) {
        const desiredHz = 1000 / (groundRelativeBlendDuration / (MapTerrainColorsController.BLEND_UPDATE_TARGET_STEP_COUNT + 1));
        const actualHz = Math.min(desiredHz, MapTerrainColorsController.BLEND_UPDATE_MAX_HZ);
        const blendTimeStep = 1000 / actualHz;

        const blendSteps = Math.ceil(groundRelativeBlendDuration / blendTimeStep) - 1;
        this.groundRelativeBlendTimeStep = blendTimeStep;
        this.groundRelativeBlendTimeOffset = (groundRelativeBlendDuration - (blendSteps - 1) * blendTimeStep) / 2;

        this.groundRelativeBlendColors = MapTerrainColorsController.createGroundRelativeBlendedColors(
          groundDef.colors,
          relativeDef.colors,
          groundRelativeBlendDuration,
          blendTimeStep
        );
      }
    }
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.modeSub = this.terrainModule.terrainMode.sub(mode => {
      this.terrainColorsModule.reference.set(MapTerrainColorsController.MODE_REFERENCE_MAP[mode]);

      const colorsDef = this.colors[mode] ?? MapTerrainColorsController.DEFAULT_COLORS;
      this.terrainColorsModule.colorsElevationRange.set(colorsDef.elevationRange);

      let isBlending = false;

      // Check if we need to start blending between the on-ground and relative terrain colors.
      if (this.groundRelativeBlendColors && (mode === MapTerrainMode.Ground || mode === MapTerrainMode.Relative)) {
        if (this.blendArmedMode === mode) {
          isBlending = true;

          if (!this.isBlending) {
            this.isBlending = true;
            this.blendProgress = mode === MapTerrainMode.Relative ? 0 : this.groundRelativeBlendDuration;
            this.lastBlendIndex = -1;
            this.lastBlendTime = Date.now();
          }

          this.blendDirection = mode === MapTerrainMode.Relative ? 1 : -1;
        }

        this.blendArmedMode = mode === MapTerrainMode.Ground ? MapTerrainMode.Relative : MapTerrainMode.Ground;
      }

      if (!isBlending) {
        this.isBlending = false;
        this.terrainColorsModule.colors.set(colorsDef.colors);
      }
    }, true);
  }

  /** @inheritdoc */
  public onAfterUpdated(): void {
    if (!this.isBlending || !this.groundRelativeBlendColors) {
      return;
    }

    const currentTime = Date.now();
    this.blendProgress += (currentTime - this.lastBlendTime) * this.blendDirection;

    if (this.blendProgress <= 0 || this.blendProgress >= this.groundRelativeBlendDuration) {
      this.isBlending = false;
      const colorsDef = this.colors[this.terrainModule.terrainMode.get()] ?? MapTerrainColorsController.DEFAULT_COLORS;
      this.terrainColorsModule.colors.set(colorsDef.colors);
    } else {
      const blendColorsIndex = this.blendDirection === 1
        ? Math.floor((this.blendProgress - this.groundRelativeBlendTimeOffset) / this.groundRelativeBlendTimeStep)
        : Math.ceil((this.blendProgress - this.groundRelativeBlendTimeOffset) / this.groundRelativeBlendTimeStep);

      if (blendColorsIndex >= 0 && blendColorsIndex < this.groundRelativeBlendColors.length && blendColorsIndex !== this.lastBlendIndex) {
        this.lastBlendIndex = blendColorsIndex;
        this.terrainColorsModule.colors.set(this.groundRelativeBlendColors[blendColorsIndex]);
      }
    }

    this.lastBlendTime = currentTime;
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.modeSub?.destroy();
  }

  /**
   * Creates an array of terrain color arrays where each color array is an intermediate step in a blend transition
   * between the on-ground mode and relative mode color arrays.
   * @param groundColors The on-ground mode earth color array.
   * @param relativeColors The relative mode earth color array.
   * @param blendDuration The amount of time, in milliseconds, over which the blend transition occurs.
   * @param blendTimeStep The amount of time, in milliseconds, covered by each blend step.
   * @returns An array of terrain color arrays where each color array is an intermediate step in the specified blend
   * transition between the on-ground mode and relative mode color arrays, or `undefined` if a blend transition is not
   * possible.
   */
  private static createGroundRelativeBlendedColors(
    groundColors: readonly number[],
    relativeColors: readonly number[],
    blendDuration: number,
    blendTimeStep: number
  ): number[][] | undefined {
    if (groundColors.length !== relativeColors.length) {
      return undefined;
    }

    const blendSteps = Math.ceil(blendDuration / blendTimeStep) - 1;

    if (blendSteps === 0) {
      return undefined;
    }

    const timeOffset = (blendDuration - (blendSteps - 1) * blendTimeStep) / 2;

    const blendedColors: number[][] = ArrayUtils.create(blendSteps, () => []);

    for (let i = 0; i < groundColors.length; i++) {
      const curve = new Avionics.Curve<string>();
      curve.interpolationFunction = Avionics.CurveTool.StringColorRGBInterpolation;
      curve.add(0, BingComponent.rgbToHexaColor(groundColors[i]));
      curve.add(blendDuration, BingComponent.rgbToHexaColor(relativeColors[i]));

      for (let j = 0; j < blendSteps; j++) {
        blendedColors[j][i] = BingComponent.hexaToRGBColor(curve.evaluate(timeOffset + blendTimeStep * j));
      }
    }

    return blendedColors;
  }
}