import {
  FSComponent, MapLabeledRingLabel, MapLabeledRingLayer, MapLayerProps, MapProjection, MapRangeModule, NumberUnitInterface, Subject, Subscribable, Unit,
  UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapRangeDisplay } from '../MapRangeDisplay';
import { MapRangeRingModule } from '../modules/MapRangeRingModule';
import { MapUnitsModule } from '../modules/MapUnitsModule';

/**
 * Modules required by MapRangeRingLayer.
 */
export interface MapRangeRingLayerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapRangeModule;

  /** Range ring module. */
  [GarminMapKeys.RangeRing]: MapRangeRingModule;

  /** Display units module. */
  [GarminMapKeys.Units]?: MapUnitsModule;
}

/**
 * A function which renders labels for map range rings.
 */
export type MapRangeRingLabelRenderer = (range: Subscribable<NumberUnitInterface<UnitFamily.Distance>>, displayUnit: Subscribable<Unit<UnitFamily.Distance>>) => VNode;

/**
 * Component props for MapRangeRingLayer.
 */
export interface MapRangeRingLayerProps extends MapLayerProps<MapRangeRingLayerModules> {
  /** Whether to show the range label. */
  showLabel: boolean;

  /**
   * The radial on which the range label is positioned, in degrees. A value of zero is in the positive x direction.
   * Defaults to 225 degrees.
   */
  labelRadial?: number;

  /**
   * A function which renders labels for the rings. If not defined, a default label of type {@link MapRangeDisplay}
   * will be rendered.
   */
  renderLabel?: MapRangeRingLabelRenderer;

  /** The stroke width of the range ring, in pixels. Defaults to 2 pixels. */
  strokeWidth?: number;

  /** The stroke style of the range ring. Defaults to `'white'`. */
  strokeStyle?: string | CanvasGradient | CanvasPattern;

  /** The stroke dash of the range ring. Defaults to no dash. */
  strokeDash?: readonly number[];

  /** The outline width of the range ring, in pixels. Defaults to 0. */
  outlineWidth?: number;

  /** The outline style of the range ring. Defaults to `'black'`. */
  outlineStyle?: string | CanvasGradient | CanvasPattern;

  /** The outline dash of the range ring. Defaults to no dash. */
  outlineDash?: readonly number[];
}

/**
 * A map layer which draws a range ring around the map target.
 */
export class MapRangeRingLayer extends MapLabeledRingLayer<MapRangeRingLayerProps> {
  private readonly rangeModule = this.props.model.getModule(GarminMapKeys.Range);
  private readonly rangeRingModule = this.props.model.getModule(GarminMapKeys.RangeRing);

  private label: MapLabeledRingLabel<MapRangeDisplay> | null = null;
  private needUpdateRing = false;

  /** @inheritdoc */
  protected updateFromVisibility(): void {
    super.updateFromVisibility();

    if (this.isVisible()) {
      this.needUpdateRing = true;
    }
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.initLabel();
    this.initStyles();
    this.initModuleListeners();
    this.updateVisibility();
    this.needUpdateRing = true;
  }

  /**
   * Initializes the range display label.
   */
  private initLabel(): void {
    if (!this.props.showLabel) {
      return;
    }

    const displayUnit = this.props.model.getModule(GarminMapKeys.Units)?.distanceLarge ?? Subject.create(UnitType.NMILE);

    this.label = this.createLabel<any>(
      this.props.renderLabel !== undefined
        ? this.props.renderLabel(this.rangeModule.nominalRange, displayUnit)
        : (<MapRangeDisplay range={this.rangeModule.nominalRange} displayUnit={displayUnit} />)
    ) as MapLabeledRingLabel<any>;

    this.label.setAnchor(new Float64Array([0.5, 0.5]));
    this.label.setRadialAngle((this.props.labelRadial ?? 225) * Avionics.Utils.DEG2RAD);
  }

  /**
   * Initializes ring styles.
   */
  private initStyles(): void {
    this.setRingStrokeStyles(this.props.strokeWidth ?? 2, this.props.strokeStyle ?? 'white', this.props.strokeDash);
    this.setRingOutlineStyles(this.props.outlineWidth ?? 0, this.props.outlineStyle ?? 'black', this.props.outlineDash);
  }

  /**
   * Initializes modules listeners.
   */
  private initModuleListeners(): void {
    this.rangeModule.nominalRange.sub(this.onRangeChanged.bind(this));
    this.rangeRingModule.show.sub(this.updateVisibility.bind(this));
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    super.onMapProjectionChanged(mapProjection, changeFlags);

    if (!this.isVisible()) {
      return;
    }

    this.needUpdateRing = true;
  }

  /**
   * Updates this layer's visibility.
   */
  private updateVisibility(): void {
    this.setVisible(this.rangeRingModule.show.get());
  }

  /** @inheritdoc */
  public onUpdated(time: number, elapsed: number): void {
    if (this.needUpdateRing) {
      this.updateRing();
      this.needUpdateRing = false;
    }

    super.onUpdated(time, elapsed);
  }

  /**
   * Updates the ring.
   */
  private updateRing(): void {
    const center = this.props.mapProjection.getTargetProjected();
    const radius = (this.rangeModule.nominalRange.get().asUnit(UnitType.GA_RADIAN) as number) / this.props.mapProjection.getProjectedResolution();

    this.setRingPosition(center, radius);
  }

  /**
   * A callback which is called when the nominal map range changes.
   */
  private onRangeChanged(): void {
    if (!this.isVisible()) {
      return;
    }

    this.needUpdateRing = true;
  }
}