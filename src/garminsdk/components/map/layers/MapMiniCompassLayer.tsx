import { BitFlags, FSComponent, MapLayer, MapLayerProps, MapProjection, MapProjectionChangeType, SetSubject, Subscription, VNode } from 'msfssdk';

/**
 * Component props for MapMiniCompassLayer.
 */
export interface MapMiniCompassLayerProps extends MapLayerProps<any> {
  /** The source for the arrow graphic. */
  imgSrc: string;
}

/**
 * The map layer showing a rotating compass arrow pointing to true north.
 */
export class MapMiniCompassLayer extends MapLayer<MapMiniCompassLayerProps> {
  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  private readonly imgRef = FSComponent.createRef<HTMLImageElement>();
  private needUpdate = false;

  private cssClassSub?: Subscription;

  /** @inheritdoc */
  public onVisibilityChanged(isVisible: boolean): void {
    const root = this.rootRef.getOrDefault();

    if (root !== null) {
      root.style.display = isVisible ? '' : 'none';
    }
  }

  /** @inheritdoc */
  public onAttached(): void {
    this.needUpdate = true;

    this.onVisibilityChanged(this.isVisible());
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    this.needUpdate = BitFlags.isAll(changeFlags, MapProjectionChangeType.Rotation);
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.needUpdate || !this.isVisible()) {
      return;
    }

    this.updateRotation();

    this.needUpdate = false;
  }

  /**
   * Updates the rotation of the arrow.
   */
  private updateRotation(): void {
    const rotation = this.props.mapProjection.getRotation();
    this.imgRef.instance.style.transform = `rotate3d(0,0,1,${rotation}rad)`;
  }

  /** @inheritdoc */
  public render(): VNode {
    let cssClass;
    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass = SetSubject.create(['map-minicompass']), this.props.class, ['map-minicompass']);
    } else {
      cssClass = `map-minicompass ${this.props.class ?? ''}`;
    }

    return (
      <div ref={this.rootRef} class={cssClass} style={'position: relative; width: var(--minicompass-size, 4em); height: var(--minicompass-size, 4em);'}>
        <img ref={this.imgRef} src={this.props.imgSrc} style={'width: 100%; height: 100%;'} />
        <div style={'position: absolute; top: 50%; width: 100%; transform: translateY(-50%); text-align: center; color: black;'}>N</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.cssClassSub?.destroy();
  }
}