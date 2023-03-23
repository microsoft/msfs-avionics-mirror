import {
  ArraySubject, BingComponent, BitFlags, FSComponent, HorizonLayer, HorizonLayerProps, HorizonProjection, HorizonProjectionChangeType,
  ObjectSubject, Subject, Subscribable, Subscription, SynVisComponent, Vec2Math, Vec2Subject, VNode
} from '@microsoft/msfs-sdk';
import { HorizonLine, HorizonLineProps } from './HorizonLine';

/**
 * Styling options for the synthetic vision horizon line.
 */
export type SvtHorizonLineOptions = Omit<
  HorizonLineProps, keyof HorizonLayerProps | 'approximate' | 'useMagneticHeading' | 'showHeadingTicks' | 'showHeadingLabels'
>;

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

  /** Whether to show horizon heading labels. */
  showHeadingLabels: Subscribable<boolean>;

  /** Whether to show magnetic heading ticks and labels instead of true heading. */
  useMagneticHeading: Subscribable<boolean>;

  /** Styling options for the horizon line. */
  horizonLineOptions: SvtHorizonLineOptions;
}

/**
 * A synthetic vision technology (SVT) display.
 */
export class SyntheticVision extends HorizonLayer<SyntheticVisionProps> {
  private static readonly SKY_COLOR = '#0033E6';

  private readonly horizonLineRef = FSComponent.createRef<HorizonLine>();

  private readonly rootStyle = ObjectSubject.create({
    position: 'absolute',
    display: '',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%'
  });

  private readonly bingStyle = ObjectSubject.create({
    position: 'absolute',
    display: '',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%'
  });

  private readonly resolution = Vec2Subject.createFromVector(Vec2Math.create(100, 100));

  private needUpdate = false;

  private isEnabledSub?: Subscription;

  /** @inheritdoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    this.rootStyle.set('display', isVisible ? '' : 'none');
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.horizonLineRef.instance.onAttached();

    this.isEnabledSub = this.props.isEnabled.sub(isEnabled => { this.setVisible(isEnabled); }, true);

    this.needUpdate = true;
  }

  /** @inheritdoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    this.horizonLineRef.instance.onProjectionChanged(projection, changeFlags);

    if (BitFlags.isAny(
      changeFlags,
      HorizonProjectionChangeType.ProjectedSize | HorizonProjectionChangeType.ProjectedOffset
    )) {
      this.needUpdate = true;
    }
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.isVisible()) {
      return;
    }

    this.horizonLineRef.instance.onUpdated();

    if (!this.needUpdate) {
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

    this.bingStyle.set('left', `${offsetCenterProjected[0] - bingWidth / 2}px`);
    this.bingStyle.set('top', `${offsetCenterProjected[1] - bingHeight / 2}px`);
    this.bingStyle.set('width', `${bingWidth}px`);
    this.bingStyle.set('height', `${bingHeight}px`);

    this.needUpdate = false;
  }

  /** @inheritdoc */
  public onDetached(): void {
    super.onDetached();

    this.destroy();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div style={this.rootStyle}>
        <div style={this.bingStyle}>
          <SynVisComponent
            bingId={this.props.bingId}
            bingDelay={this.props.bingDelay}
            resolution={this.resolution}
            skyColor={Subject.create(BingComponent.hexaToRGBColor(SyntheticVision.SKY_COLOR))}
            earthColors={ArraySubject.create(SyntheticVision.createEarthColors())}
            earthColorsElevationRange={Vec2Subject.create(Vec2Math.create(-1400, 29000))}
          />
        </div>
        <HorizonLine
          ref={this.horizonLineRef}
          projection={this.props.projection}
          approximate={false}
          showHeadingTicks={true}
          showHeadingLabels={this.props.showHeadingLabels}
          useMagneticHeading={this.props.useMagneticHeading}
          {...this.props.horizonLineOptions}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.isEnabledSub?.destroy();

    this.horizonLineRef.getOrDefault()?.destroy();
  }

  /**
   * Creates a full Bing component earth color array.
   * @returns A full Bing component earth color array.
   */
  private static createEarthColors(): number[] {
    return BingComponent.createEarthColorsArray('#000066', [
      {
        elev: -1400,
        color: '#2d5b61'
      },
      {
        elev: -1300,
        color: '#2d6161'
      },
      {
        elev: -1200,
        color: '#2e636a'
      },
      {
        elev: -1100,
        color: '#335f65'
      },
      {
        elev: -1000,
        color: '#336565'
      },
      {
        elev: -900,
        color: '#356e6e'
      },
      {
        elev: -800,
        color: '#3a6d6d'
      },
      {
        elev: -700,
        color: '#3a736c'
      },
      {
        elev: -600,
        color: '#3a7373'
      },
      {
        elev: -500,
        color: '#3b7b75'
      },
      {
        elev: -400,
        color: '#3a7366'
      },
      {
        elev: -300,
        color: '#3a6d54'
      },
      {
        elev: -200,
        color: '#3a6d4d'
      },
      {
        elev: -100,
        color: '#3a6846'
      },
      {
        elev: 0,
        color: '#34582b'
      },
      {
        elev: 100,
        color: '#356335'
      },
      {
        elev: 200,
        color: '#355c27'
      },
      {
        elev: 300,
        color: '#345920'
      },
      {
        elev: 400,
        color: '#345312'
      },
      {
        elev: 500,
        color: '#355506'
      },
      {
        elev: 600,
        color: '#3b530d'
      },
      {
        elev: 700,
        color: '#3f590c'
      },
      {
        elev: 800,
        color: '#495c13'
      },
      {
        elev: 900,
        color: '#4c5d12'
      },
      {
        elev: 1000,
        color: '#566a1a'
      },
      {
        elev: 1100,
        color: '#5c6a1a'
      },
      {
        elev: 1200,
        color: '#686d20'
      },
      {
        elev: 1300,
        color: '#6d6d20'
      },
      {
        elev: 1400,
        color: '#727226'
      },
      {
        elev: 1500,
        color: '#7c7c27'
      },
      {
        elev: 1600,
        color: '#7d7625'
      },
      {
        elev: 1700,
        color: '#89822d'
      },
      {
        elev: 1800,
        color: '#8f882d'
      },
      {
        elev: 2000,
        color: '#a9922c'
      },
      {
        elev: 2500,
        color: '#9f8431'
      },
      {
        elev: 3000,
        color: '#9d742d'
      },
      {
        elev: 6000,
        color: '#744d1a'
      },
      {
        elev: 7000,
        color: '#723f12'
      },
      {
        elev: 8000,
        color: '#6d380c'
      },
      {
        elev: 9000,
        color: '#6e3306'
      },
      {
        elev: 10000,
        color: '#6e2c06'
      },
      {
        elev: 16000,
        color: '#714827'
      },
      {
        elev: 17000,
        color: '#6c4c2c'
      },
      {
        elev: 18000,
        color: '#744d34'
      },
      {
        elev: 20000,
        color: '#745a47'
      },
      {
        elev: 22000,
        color: '#766255'
      },
      {
        elev: 24000,
        color: '#756760'
      },
      {
        elev: 26000,
        color: '#76766f'
      },
      {
        elev: 27000,
        color: '#757575'
      },
      {
        elev: 28000,
        color: '#898989'
      },
      {
        elev: 29000,
        color: '#8e8e8e'
      }
    ], -1400, 29000, 305);
  }
}