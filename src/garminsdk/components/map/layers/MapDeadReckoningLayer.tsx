import {
  BitFlags, FSComponent, MapLayer, MapLayerProps, MapOwnAirplaneIconModule, MapOwnAirplanePropsModule, MappedSubject,
  MapProjection, MapProjectionChangeType, MapSystemKeys, MathUtils, ObjectSubject, ReadonlyFloat64Array, Subject,
  Subscribable, SubscribableUtils, Subscription, Vec2Math, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import { MapGarminDataIntegrityModule } from '../modules/MapGarminDataIntegrityModule';

/**
 * Modules required for MapDeadReckoningLayer.
 */
export interface MapDeadReckoningLayerModules {
  /** Own airplane props module. */
  [MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule;

  /** Own airplane icon module. */
  [MapSystemKeys.OwnAirplaneIcon]: MapOwnAirplaneIconModule;

  /** Data integrity module. */
  [MapSystemKeys.DataIntegrity]: MapGarminDataIntegrityModule;
}

/**
 * Component props for MapDeadReckoningLayer.
 */
export interface MapDeadReckoningLayerProps extends MapLayerProps<MapDeadReckoningLayerModules> {
  /** The size of the airplane icon, in pixels. */
  airplaneIconSize: number | Subscribable<number>;

  /**
   * The point on the airplane icon which is anchored to the airplane's position, expressed relative to the icon's
   * width and height, with `[0, 0]` at the top left and `[1, 1]` at the bottom right.
   */
  airplaneIconAnchor: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;
}

/**
 * A map layer which displays a dead reckoning annunciation at the position of the airplane icon.
 */
export class MapDeadReckoningLayer extends MapLayer<MapDeadReckoningLayerProps> {
  private static readonly vec2Cache = [Vec2Math.create()];

  private readonly style = ObjectSubject.create({
    display: '',
    position: 'absolute',
    left: '0px',
    top: '0px',
    transform: 'translate3d(0, 0, 0)',
    'transform-origin': '0% 0%'
  });

  private readonly ownAirplanePropsModule = this.props.model.getModule(MapSystemKeys.OwnAirplaneProps);
  private readonly ownAirplaneIconModule = this.props.model.getModule(MapSystemKeys.OwnAirplaneIcon);
  private readonly dataIntegrityModule = this.props.model.getModule(MapSystemKeys.DataIntegrity);

  private readonly iconSize = SubscribableUtils.toSubscribable(this.props.airplaneIconSize, true);
  private readonly iconAnchor = SubscribableUtils.toSubscribable(this.props.airplaneIconAnchor, true);

  private readonly iconCenterOffset = Vec2Math.create();
  private readonly visibilityBounds = VecNMath.create(4);

  private readonly isInsideVisibilityBounds = Subject.create(true);

  private readonly show = MappedSubject.create(
    ([showIcon, isDr]) => showIcon && isDr,
    this.ownAirplaneIconModule.show,
    this.dataIntegrityModule.isDeadReckoning,
  );

  private readonly visibility = MappedSubject.create(
    ([show, isInsideBounds]) => show && isInsideBounds,
    this.show,
    this.isInsideVisibilityBounds
  );

  private needUpdatePosition = false;

  private positionSub?: Subscription;
  private headingSub?: Subscription;
  private iconSizeSub?: Subscription;
  private iconAnchorSub?: Subscription;

  /** @inheritdoc */
  public onVisibilityChanged(isVisible: boolean): void {
    this.style.set('display', isVisible ? '' : 'none');
  }

  /** @inheritdoc */
  public onAttached(): void {
    this.show.sub(show => { this.needUpdatePosition = show; });
    this.visibility.sub(isVisible => { this.setVisible(isVisible); }, true);

    this.positionSub = this.ownAirplanePropsModule.position.sub(() => { this.needUpdatePosition = this.show.get(); });
    this.headingSub = this.ownAirplanePropsModule.hdgTrue.sub(() => { this.needUpdatePosition = this.show.get(); });

    this.iconSizeSub = this.iconSize.sub(() => {
      this.updateOffset();
    });

    this.iconAnchorSub = this.iconAnchor.sub(() => {
      this.updateOffset();
    });

    this.updateOffset();

    this.needUpdatePosition = true;
  }

  /**
   * Updates the annunciation's offset from the projected position of the airplane.
   */
  private updateOffset(): void {
    // Since the annunciation is positioned at the center of the airplane icon, we need to calculate the offset of
    // the airplane icon's center.

    const anchor = this.iconAnchor.get();
    const size = this.iconSize.get();

    this.iconCenterOffset[0] = size * (0.5 - anchor[0]);
    this.iconCenterOffset[1] = size * (0.5 - anchor[1]);

    this.updateVisibilityBounds();
  }

  /**
   * Updates the boundaries within the map's projected window that define a region such that if the airplane's
   * projected position falls outside of it, the annunciation is not visible and therefore does not need to be updated.
   */
  private updateVisibilityBounds(): void {
    const halfSize = this.iconSize.get() / 2;

    // Because the annunciation is supposed to be positioned at the center of the airplane icon, if the airplane icon is
    // out of bounds, so will the annunciation. Therefore, we can use the airplane icon as a proxy for visibility bounds
    // calculations.

    // Find the maximum possible protrusion of the airplane icon from its anchor point, defined as the distance from the
    // anchor point to the farthest point within the bounds of the icon. This farthest point is always one of the
    // four corners of the icon.

    const maxProtrusion = Math.max(
      Math.hypot(this.iconCenterOffset[0] - halfSize, this.iconCenterOffset[1] - halfSize),  // top left corner
      Math.hypot(this.iconCenterOffset[0] + halfSize, this.iconCenterOffset[1] - halfSize),  // top right corner
      Math.hypot(this.iconCenterOffset[0] + halfSize, this.iconCenterOffset[1] + halfSize),  // bottom right corner
      Math.hypot(this.iconCenterOffset[0] - halfSize, this.iconCenterOffset[1] + halfSize),  // bottom left corner
    );

    const boundsOffset = maxProtrusion + 50; // Add some additional buffer

    const projectedSize = this.props.mapProjection.getProjectedSize();

    this.visibilityBounds[0] = -boundsOffset;
    this.visibilityBounds[1] = -boundsOffset;
    this.visibilityBounds[2] = projectedSize[0] + boundsOffset;
    this.visibilityBounds[3] = projectedSize[1] + boundsOffset;

    this.needUpdatePosition = this.show.get();
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize)) {
      this.updateVisibilityBounds();
    }

    this.needUpdatePosition = this.show.get();
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onUpdated(time: number, elapsed: number): void {
    if (this.needUpdatePosition) {
      this.updatePosition();
      this.needUpdatePosition = false;
    }
  }

  /**
   * Updates the annunciation's projected position.
   */
  private updatePosition(): void {
    const projected = this.props.mapProjection.project(this.ownAirplanePropsModule.position.get(), MapDeadReckoningLayer.vec2Cache[0]);

    this.isInsideVisibilityBounds.set(this.props.mapProjection.isInProjectedBounds(projected, this.visibilityBounds));

    // Only update position if actually visible.
    if (this.visibility.get()) {
      const rotation = MathUtils.round(this.ownAirplanePropsModule.hdgTrue.get() + this.props.mapProjection.getRotation() * Avionics.Utils.RAD2DEG, 0.1);

      this.style.set('transform', `translate3d(${projected[0].toFixed(1)}px, ${projected[1].toFixed(1)}px, 0px) rotate(${rotation}deg) translate(${this.iconCenterOffset[0]}px, ${this.iconCenterOffset[1]}px) rotate(${-rotation}deg) translate(-50%, -50%)`);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-deadreckoning' style={this.style}>DR</div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.show.destroy();

    this.positionSub?.destroy();
    this.headingSub?.destroy();
    this.iconSizeSub?.destroy();
    this.iconAnchorSub?.destroy();

    super.destroy();
  }
}