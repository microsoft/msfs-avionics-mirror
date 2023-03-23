import { MappedSubject } from '../../../sub/MappedSubject';
import { MappedSubscribable, Subscribable } from '../../../sub/Subscribable';
import { SubscribableUtils } from '../../../sub/SubscribableUtils';
import { MapOwnAirplaneIconModule, MapOwnAirplaneIconOrientation } from '../../map/modules/MapOwnAirplaneIconModule';
import { MapSystemContext } from '../MapSystemContext';
import { MapSystemController } from '../MapSystemController';
import { MapSystemKeys } from '../MapSystemKeys';
import { MapRotation, MapRotationModule } from '../modules/MapRotationModule';

/**
 * Modules required for MapOwnAirplaneIconOrientationController.
 */
export interface MapOwnAirplaneIconOrientationControllerModules {
  /** Own airplane icon module. */
  [MapSystemKeys.OwnAirplaneIcon]: MapOwnAirplaneIconModule;

  /** Rotation module. */
  [MapSystemKeys.Rotation]: MapRotationModule;
}

/**
 * Controls the orientation of the own airplane icon set in {@link MapOwnAirplaneIconModule} based on a desired
 * orientation and the map rotation type. If the desired orientation matches the map rotation (e.g. both Heading Up),
 * the icon orientation is set to Map Up; otherwise the orientation is set to the desired orientation.
 */
export class MapOwnAirplaneIconOrientationController extends MapSystemController<MapOwnAirplaneIconOrientationControllerModules> {
  private readonly ownAirplaneIconModule = this.context.model.getModule(MapSystemKeys.OwnAirplaneIcon);

  private readonly desiredIconOrientation: Subscribable<MapOwnAirplaneIconOrientation>;

  private readonly orientationState: MappedSubscribable<readonly [MapOwnAirplaneIconOrientation, MapRotation]>;

  private needUpdateIconOrientation = false;

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param desiredOrientation The desired orientation of the own airplane icon.
   */
  constructor(
    context: MapSystemContext<MapOwnAirplaneIconOrientationControllerModules>,
    desiredOrientation: MapOwnAirplaneIconOrientation | Subscribable<MapOwnAirplaneIconOrientation>
  ) {
    super(context);

    this.desiredIconOrientation = SubscribableUtils.toSubscribable(desiredOrientation, true);

    this.orientationState = MappedSubject.create(
      this.desiredIconOrientation,
      this.context.model.getModule(MapSystemKeys.Rotation).rotationType
    );
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.orientationState?.sub(() => { this.needUpdateIconOrientation = true; }, true);
  }

  /** @inheritdoc */
  public onBeforeUpdated(): void {
    if (this.needUpdateIconOrientation) {
      const [desiredOrientation, rotation] = this.orientationState.get();

      if (
        (desiredOrientation === MapOwnAirplaneIconOrientation.HeadingUp && rotation === MapRotation.HeadingUp)
        || (desiredOrientation === MapOwnAirplaneIconOrientation.TrackUp && rotation === MapRotation.TrackUp)
      ) {
        this.ownAirplaneIconModule.orientation.set(MapOwnAirplaneIconOrientation.MapUp);
      } else {
        this.ownAirplaneIconModule.orientation.set(desiredOrientation);
      }

      this.needUpdateIconOrientation = false;
    }
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.orientationState.destroy();

    super.destroy();
  }
}