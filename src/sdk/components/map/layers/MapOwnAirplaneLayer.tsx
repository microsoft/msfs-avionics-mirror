/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CssTransformBuilder } from '../../../graphics/css/CssTransform';
import { BitFlags } from '../../../math/BitFlags';
import { UnitType } from '../../../math/NumberUnit';
import { ReadonlyFloat64Array, Vec2Math, VecNMath } from '../../../math/VecMath';
import { ObjectSubject } from '../../../sub/ObjectSubject';
import { Subscribable } from '../../../sub/Subscribable';
import { SubscribableMapFunctions } from '../../../sub/SubscribableMapFunctions';
import { SubscribableUtils } from '../../../sub/SubscribableUtils';
import { Subscription } from '../../../sub/Subscription';
import { FSComponent, VNode } from '../../FSComponent';
import { MapLayer, MapLayerProps } from '../MapLayer';
import { MapProjection, MapProjectionChangeType } from '../MapProjection';
import { MapOwnAirplaneIconModule, MapOwnAirplaneIconOrientation } from '../modules/MapOwnAirplaneIconModule';
import { MapOwnAirplanePropsModule } from '../modules/MapOwnAirplanePropsModule';

/**
 * Modules required by MapOwnAirplaneLayer.
 */
export interface MapOwnAirplaneLayerModules {
  /** Own airplane properties module. */
  ownAirplaneProps: MapOwnAirplanePropsModule;

  /** Own airplane icon module. */
  ownAirplaneIcon: MapOwnAirplaneIconModule;
}

/**
 * Component props for MapOwnAirplaneLayer.
 */
export interface MapOwnAirplaneLayerProps<M extends MapOwnAirplaneLayerModules> extends MapLayerProps<M> {
  /** The path to the icon's image file. */
  imageFilePath: string | Subscribable<string>;

  /** The size of the airplane icon, in pixels. */
  iconSize: number | Subscribable<number>;

  /**
   * The point on the icon which is anchored to the airplane's position, expressed relative to the icon's width and
   * height, with [0, 0] at the top left and [1, 1] at the bottom right.
   */
  iconAnchor: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;
}

/**
 * A layer which draws an own airplane icon. The icon is positioned at the projected location of the airplane and is
 * rotated to match the airplane's heading.
 */
export class MapOwnAirplaneLayer<M extends MapOwnAirplaneLayerModules = MapOwnAirplaneLayerModules> extends MapLayer<MapOwnAirplaneLayerProps<M>> {
  protected static readonly vec2Cache = [Vec2Math.create()];

  protected readonly imageFilePath = SubscribableUtils.isSubscribable(this.props.imageFilePath)
    ? this.props.imageFilePath.map(SubscribableMapFunctions.identity())
    : this.props.imageFilePath;

  protected readonly style = ObjectSubject.create({
    display: '',
    position: 'absolute',
    left: '0px',
    top: '0px',
    width: '0px',
    height: '0px',
    transform: 'translate3d(0, 0, 0) rotate(0deg)',
    'transform-origin': '50% 50%'
  });

  protected readonly ownAirplanePropsModule = this.props.model.getModule('ownAirplaneProps');
  protected readonly ownAirplaneIconModule = this.props.model.getModule('ownAirplaneIcon');

  protected readonly iconSize = SubscribableUtils.toSubscribable(this.props.iconSize, true);
  protected readonly iconAnchor = SubscribableUtils.toSubscribable(this.props.iconAnchor, true);

  protected readonly iconOffset = Vec2Math.create();
  protected readonly visibilityBounds = VecNMath.create(4);

  protected readonly iconTransform = CssTransformBuilder.concat(
    CssTransformBuilder.translate3d('px'),
    CssTransformBuilder.rotate('deg')
  );

  protected readonly isGsAboveTrackThreshold = this.ownAirplanePropsModule.groundSpeed.map(gs => gs.asUnit(UnitType.KNOT) >= 5).pause();

  protected showIcon = true;
  protected isInsideVisibilityBounds = true;
  protected planeRotation = 0;

  protected needUpdateVisibility = false;
  protected needUpdatePositionRotation = false;

  protected showSub?: Subscription;
  protected positionSub?: Subscription;
  protected headingSub?: Subscription;
  protected trackSub?: Subscription;
  protected trackThresholdSub?: Subscription;
  protected iconSizeSub?: Subscription;
  protected iconAnchorSub?: Subscription;
  protected orientationSub?: Subscription;

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onVisibilityChanged(isVisible: boolean): void {
    this.needUpdateVisibility = true;
    this.needUpdatePositionRotation = this.showIcon = isVisible && this.ownAirplaneIconModule.show.get();
  }

  /** @inheritdoc */
  public onAttached(): void {
    this.showSub = this.ownAirplaneIconModule.show.sub(show => {
      this.needUpdateVisibility = true;
      this.needUpdatePositionRotation = this.showIcon = show && this.isVisible();
    });

    this.positionSub = this.ownAirplanePropsModule.position.sub(() => {
      this.needUpdatePositionRotation = this.showIcon;
    });

    this.headingSub = this.ownAirplanePropsModule.hdgTrue.sub(hdg => {
      this.planeRotation = hdg;
      this.needUpdatePositionRotation = this.showIcon;
    }, false, true);
    this.trackSub = this.ownAirplanePropsModule.trackTrue.sub(track => {
      this.planeRotation = track;
      this.needUpdatePositionRotation = this.showIcon;
    }, false, true);
    this.trackThresholdSub = this.isGsAboveTrackThreshold.sub(isAboveThreshold => {
      if (isAboveThreshold) {
        this.headingSub!.pause();
        this.trackSub!.resume(true);
      } else {
        this.trackSub!.pause();
        this.headingSub!.resume(true);
      }
    }, false, true);

    this.iconSizeSub = this.iconSize.sub(size => {
      this.style.set('width', `${size}px`);
      this.style.set('height', `${size}px`);

      this.updateOffset();
    }, true);

    this.iconAnchorSub = this.iconAnchor.sub(() => {
      this.updateOffset();
    });

    this.orientationSub = this.ownAirplaneIconModule.orientation.sub(orientation => {
      switch (orientation) {
        case MapOwnAirplaneIconOrientation.HeadingUp:
          this.isGsAboveTrackThreshold.pause();
          this.trackThresholdSub!.pause();
          this.trackSub!.pause();
          this.headingSub!.resume(true);
          break;
        case MapOwnAirplaneIconOrientation.TrackUp:
          this.headingSub!.pause();
          this.trackSub!.pause();
          this.isGsAboveTrackThreshold.resume();
          this.trackThresholdSub!.resume(true);
          break;
        default:
          this.needUpdatePositionRotation = this.showIcon;
          this.isGsAboveTrackThreshold.pause();
          this.trackThresholdSub!.pause();
          this.headingSub!.pause();
          this.trackSub!.pause();
          this.planeRotation = 0;
      }
    }, true);

    this.needUpdateVisibility = true;
    this.needUpdatePositionRotation = true;
  }

  /**
   * Updates the icon's offset from the projected position of the airplane.
   */
  protected updateOffset(): void {
    const anchor = this.iconAnchor.get();

    this.iconOffset.set(anchor);
    Vec2Math.multScalar(this.iconOffset, -this.iconSize.get(), this.iconOffset);

    this.style.set('left', `${this.iconOffset[0]}px`);
    this.style.set('top', `${this.iconOffset[1]}px`);
    this.style.set('transform-origin', `${anchor[0] * 100}% ${anchor[1] * 100}%`);

    this.updateVisibilityBounds();
  }

  /**
   * Updates the boundaries within the map's projected window that define a region such that if the airplane's
   * projected position falls outside of it, the icon is not visible and therefore does not need to be updated.
   */
  protected updateVisibilityBounds(): void {
    const size = this.iconSize.get();

    // Find the maximum possible protrusion of the icon from its anchor point, defined as the distance from the
    // anchor point to the farthest point within the bounds of the icon. This farthest point is always one of the
    // four corners of the icon.

    const maxProtrusion = Math.max(
      Math.hypot(this.iconOffset[0], this.iconOffset[1]),                  // top left corner
      Math.hypot(this.iconOffset[0] + size, this.iconOffset[1]),           // top right corner
      Math.hypot(this.iconOffset[0] + size, this.iconOffset[1] + size),    // bottom right corner
      Math.hypot(this.iconOffset[0], this.iconOffset[1] + size),           // bottom left corner
    );

    const boundsOffset = maxProtrusion + 50; // Add some additional buffer

    const projectedSize = this.props.mapProjection.getProjectedSize();

    this.visibilityBounds[0] = -boundsOffset;
    this.visibilityBounds[1] = -boundsOffset;
    this.visibilityBounds[2] = projectedSize[0] + boundsOffset;
    this.visibilityBounds[3] = projectedSize[1] + boundsOffset;

    this.needUpdatePositionRotation = this.showIcon;
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize)) {
      this.updateVisibilityBounds();
    }

    this.needUpdatePositionRotation = this.showIcon;
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onUpdated(time: number, elapsed: number): void {
    if (this.needUpdatePositionRotation) {
      this.updateIconPositionRotation();
      this.needUpdatePositionRotation = false;
      this.needUpdateVisibility = false;
    } else if (this.needUpdateVisibility) {
      this.updateIconVisibility();
      this.needUpdateVisibility = false;
    }
  }

  /**
   * Updates the airplane icon's visibility.
   */
  protected updateIconVisibility(): void {
    this.style.set('display', this.isInsideVisibilityBounds && this.showIcon ? '' : 'none');
  }

  /**
   * Updates the airplane icon's projected position and rotation.
   */
  protected updateIconPositionRotation(): void {
    const projected = this.props.mapProjection.project(this.ownAirplanePropsModule.position.get(), MapOwnAirplaneLayer.vec2Cache[0]);

    this.isInsideVisibilityBounds = this.props.mapProjection.isInProjectedBounds(projected, this.visibilityBounds);

    // If the projected position of the icon is far enough out of bounds that the icon is not visible, do not bother to
    // update the icon.
    if (this.isInsideVisibilityBounds) {
      let rotation: number;
      switch (this.ownAirplaneIconModule.orientation.get()) {
        case MapOwnAirplaneIconOrientation.HeadingUp:
        case MapOwnAirplaneIconOrientation.TrackUp:
          rotation = this.planeRotation + this.props.mapProjection.getRotation() * Avionics.Utils.RAD2DEG;
          break;
        default:
          rotation = 0;
      }

      this.iconTransform.getChild(0).set(projected[0], projected[1], 0, 0.1);
      this.iconTransform.getChild(1).set(rotation, 0.1);

      this.style.set('transform', this.iconTransform.resolve());
    }

    this.updateIconVisibility();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <img src={this.imageFilePath} class={this.props.class ?? ''} style={this.style} />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    if (SubscribableUtils.isSubscribable(this.imageFilePath)) {
      this.imageFilePath.destroy();
    }

    this.isGsAboveTrackThreshold.destroy();

    this.showSub?.destroy();
    this.positionSub?.destroy();
    this.headingSub?.destroy();
    this.trackSub?.destroy();
    this.trackThresholdSub?.destroy();
    this.iconSizeSub?.destroy();
    this.iconAnchorSub?.destroy();
    this.orientationSub?.destroy();

    super.destroy();
  }
}