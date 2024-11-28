import {
  ArraySubject, BingComponent, BitFlags, ColorUtils, FSComponent, HorizonLayer, HorizonLayerProps, HorizonProjection, HorizonProjectionChangeType, ObjectSubject, Subject,
  Subscribable, Subscription, SynVisComponent, Vec2Math, Vec2Subject, VNode
} from '@microsoft/msfs-sdk';

// import { MapUtils } from '../../map/MapUtils';

/**
 * Component props for SyntheticVision.
 */
export interface SyntheticVisionProps extends HorizonLayerProps {
  /** The string ID to assign to the layer's bound Bing instance. */
  bingId: string;

  /** The amount of time, in milliseconds, to delay binding the layer's Bing instance. Defaults to 0. */
  bingDelay?: number;

  /** Whether synthetic vision is enabled. */
  isEnabled: Subscribable<boolean>;
}

/**
 * A synthetic vision technology (SVT) display terrain colors object.
 */
type TerrainColors = {
  /**
   * The earth colors array. Index 0 defines the water color, and indexes 1 to the end of the array define the terrain
   * colors.
   */
  colors: number[];

  /** The elevation range over which the terrain colors are applied, as `[minimum, maximum]` in feet. */
  elevationRange: Float64Array;
};

/**
 * A synthetic vision technology (SVT) display.
 */
export class SyntheticVision extends HorizonLayer<SyntheticVisionProps> {
  private static readonly SKY_COLOR = '#87a0f3';

  private readonly rootStyle = ObjectSubject.create({
    position: 'absolute',
    display: '',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%'
  });

  private readonly resolution = Vec2Subject.createFromVector(Vec2Math.create(100, 100));

  private needUpdateVisibility = false;
  private needUpdate = false;

  private isEnabledSub?: Subscription;

  /** @inheritdoc */
  protected onVisibilityChanged(): void {
    this.needUpdateVisibility = true;
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.isEnabledSub = this.props.isEnabled.sub(this.setVisible.bind(this), true);

    this.needUpdateVisibility = true;
    this.needUpdate = true;
  }

  /** @inheritdoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    if (BitFlags.isAny(
      changeFlags,
      HorizonProjectionChangeType.ProjectedSize | HorizonProjectionChangeType.ProjectedOffset
    )) {
      this.needUpdate = true;
    }
  }

  /** @inheritdoc */
  public onUpdated(): void {
    const isVisible = this.isVisible();

    if (this.needUpdateVisibility) {
      this.rootStyle.set('display', isVisible ? '' : 'none');
    }

    if (!this.needUpdate || !isVisible) {
      return;
    }

    const projectedSize = this.props.projection.getProjectedSize();
    const projectedOffset = this.props.projection.getProjectedOffset();
    const offsetCenterProjected = this.props.projection.getOffsetCenterProjected();

    // We need to move the Bing texture such that its center lies at the center of the projection, including offset.
    // If there is an offset, we need to overdraw the Bing texture in order to fill the entire projection window.

    const xOverdraw = Math.abs(projectedOffset[0]);
    const yOverdraw = Math.abs(projectedOffset[1]);

    const bingWidth = projectedSize[0] + xOverdraw * 2;
    const bingHeight = projectedSize[1] + yOverdraw * 2;

    this.resolution.set(bingWidth, bingHeight);

    this.rootStyle.set('left', `${offsetCenterProjected[0] - bingWidth / 2}px`);
    this.rootStyle.set('top', `${offsetCenterProjected[1] - bingHeight / 2}px`);
    this.rootStyle.set('width', `${bingWidth}px`);
    this.rootStyle.set('height', `${bingHeight}px`);

    this.needUpdate = false;
  }

  /** @inheritdoc */
  public onDetached(): void {
    super.onDetached();

    this.destroy();
  }

  /** @inheritdoc */
  public render(): VNode {
    const colorsDef = SyntheticVision.createEarthColors();

    return (
      <div style={this.rootStyle}>
        <SynVisComponent
          bingId={this.props.bingId}
          bingDelay={this.props.bingDelay}
          resolution={this.resolution}
          skyColor={Subject.create(BingComponent.hexaToRGBColor(SyntheticVision.SKY_COLOR))}
          earthColors={ArraySubject.create(colorsDef.colors)}
          earthColorsElevationRange={Vec2Subject.create(colorsDef.elevationRange)}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.isEnabledSub?.destroy();
  }

  /**
   * Creates an object containing an earth color array and elevation range for an SVT display.
   * @returns An object containing an earth color array and elevation range for an SVT display.
   */
  private static createEarthColors(): TerrainColors {
    // Get absolute map terrain colors and scale lightness by 0.8.
    const def = {
      colors: BingComponent.createEarthColorsArray('#000084', [
        {
          elev: -1400,
          color: '#9b9f92'
        },
        {
          elev: 1500,
          color: '#627352'
        },
        {
          elev: 3000,
          color: '#8e8c69'
        },
        {
          elev: 4000,
          color: '#a5996b'
        },
        {
          elev: 4500,
          color: '#746246'
        },
        {
          elev: 10000,
          color: '#8c7252'
        },
        {
          elev: 20000,
          color: '#483a1d'
        },
        {
          elev: 30000,
          color: '#000000'
        },
      ], -1500, 30000, 56),
      elevationRange: Vec2Math.create(-1500, 30000)
    };

    // return def;

    // return {
    //   colors: def.colors.map(c => c),
    //   elevationRange: def.elevationRange.map(x => x)
    // };
    const cache = new Float64Array(3);

    return {
      colors: def.colors.map(color => {
        const hsl = ColorUtils.hexToHsl(color, cache, true);
        hsl[2] *= 0.8;

        return ColorUtils.hslToHex(hsl, true);
      }),
      elevationRange: def.elevationRange
    };
  }
}
