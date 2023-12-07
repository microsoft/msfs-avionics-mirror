import {
  MapDataIntegrityModule, MapOwnAirplaneIconModule, MapSystemContext, MapSystemController, MapSystemKeys, MappedSubject,
  MappedSubscribable, MutableSubscribable, ReadonlyFloat64Array, ResourceConsumer, ResourceModerator, Subscribable, Subscription
} from '@microsoft/msfs-sdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapResourcePriority } from '../MapResourcePriority';
import { MapOrientation, MapOrientationModule } from '../modules/MapOrientationModule';

/**
 * Modules required for MapDataIntegrityRTRController.
 */
export interface MapDataIntegrityRTRControllerModules {
  /** Data integrity module. */
  [MapSystemKeys.DataIntegrity]: MapDataIntegrityModule;

  /** Orientation module. */
  [GarminMapKeys.Orientation]?: MapOrientationModule;

  /** Orientation module. */
  [MapSystemKeys.OwnAirplaneIcon]?: MapOwnAirplaneIconModule;
}

/**
 * Context properties required for MapDataIntegrityRTRController.
 */
export interface MapDataIntegrityRTRControllerContext {
  /** Resource moderator for control of the map's projection target. */
  [MapSystemKeys.TargetControl]?: ResourceModerator;

  /** Resource moderator for control of the map's orientation mode. */
  [GarminMapKeys.OrientationControl]?: ResourceModerator;
}

/**
 * Controls the map's projected target, orientation mode, and player airplane icon based on heading and GPS signal validity.
 */
export class MapDataIntegrityRTRController extends MapSystemController<MapDataIntegrityRTRControllerModules, any, any, MapDataIntegrityRTRControllerContext> {
  private readonly dataIntegrityModule = this.context.model.getModule(MapSystemKeys.DataIntegrity);
  private readonly orientationModule = this.context.model.getModule(GarminMapKeys.Orientation);
  private readonly ownAirplaneIconModule = this.context.model.getModule(MapSystemKeys.OwnAirplaneIcon);

  private readonly targetControl = this.context[MapSystemKeys.TargetControl];

  private readonly targetControlConsumer: ResourceConsumer = {
    priority: MapResourcePriority.DATA_INTEGRITY,

    onAcquired: () => { }, // if we have loss of GPS signal, we simply do nothing since there is nothing to follow.

    onCeded: () => { }
  };

  private readonly orientationControl = this.context[GarminMapKeys.OrientationControl];

  private readonly orientationControlConsumer: ResourceConsumer = {
    priority: MapResourcePriority.DATA_INTEGRITY,

    onAcquired: () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.orientationOverridePipe!.resume(true);
    },

    onCeded: () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.orientationOverridePipe!.pause();
    }
  };

  private readonly canChangeAirplaneIcon
    = this.airplaneIconSrc !== undefined
    && this.airplaneIconAnchor !== undefined
    && this.normalIconSrc !== undefined
    && this.normalIconAnchor !== undefined
    && this.noHeadingIconSrc !== undefined
    && this.noHeadingIconAnchor !== undefined;

  private orientationOverride?: MappedSubscribable<MapOrientation | null>;
  private orientationOverridePipe?: Subscription;

  private headingSignalSub?: Subscription;
  private gpsSignalSub?: Subscription;

  private normalIconSrcPipe?: Subscription;
  private normalIconAnchorPipe?: Subscription;
  private noHeadingIconSrcPipe?: Subscription;
  private noHeadingIconAnchorPipe?: Subscription;

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param airplaneIconSrc A mutable subscribable which controls the player airplane icon's image source URI.
   * Required for this controller to change the player airplane icon.
   * @param airplaneIconAnchor A mutable subscribable which controls the anchor point of the player airplane icon.
   * Required for this controller to change the player airplane icon.
   * @param normalIconSrc A subscribable which provides the URI of the normal player airplane icon's image source.
   * Required for this controller to change the player airplane icon.
   * @param normalIconAnchor A subscribable which provides the anchor point of the normal player airplane icon, as
   * `[x, y]`, where each component is relative to the width or height of the icon. Required for this controller to
   * change the player airplane icon.
   * @param noHeadingIconSrc A subscribable which provides the URI of the no-heading player airplane icon's image
   * source. Required for this controller to change the player airplane icon.
   * @param noHeadingIconAnchor A subscribable which provides the anchor point of the no-heading player airplane icon,
   * as `[x, y]`, where each component is relative to the width or height of the icon. Required for this controller to
   * change the player airplane icon.
   */
  constructor(
    context: MapSystemContext<MapDataIntegrityRTRControllerModules, any, any, MapDataIntegrityRTRControllerContext>,
    private readonly airplaneIconSrc?: MutableSubscribable<string>,
    private readonly airplaneIconAnchor?: MutableSubscribable<ReadonlyFloat64Array>,
    private readonly normalIconSrc?: Subscribable<string>,
    private readonly normalIconAnchor?: Subscribable<ReadonlyFloat64Array>,
    private readonly noHeadingIconSrc?: Subscribable<string>,
    private readonly noHeadingIconAnchor?: Subscribable<ReadonlyFloat64Array>
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    if (this.canChangeAirplaneIcon) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.normalIconSrcPipe = this.normalIconSrc!.pipe(this.airplaneIconSrc!, true);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.normalIconAnchorPipe = this.normalIconAnchor!.pipe(this.airplaneIconAnchor!, true);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.noHeadingIconSrcPipe = this.noHeadingIconSrc!.pipe(this.airplaneIconSrc!, true);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.noHeadingIconAnchorPipe = this.noHeadingIconAnchor!.pipe(this.airplaneIconAnchor!, true);
    }

    if (this.orientationModule) {
      this.orientationOverride = MappedSubject.create(
        ([desiredOrientation, isHeadingValid, isGpsValid]) => {
          if (isHeadingValid && isGpsValid) {
            return null;
          }

          switch (desiredOrientation) {
            case MapOrientation.HeadingUp:
              return isHeadingValid ? desiredOrientation : MapOrientation.NorthUp;
            case MapOrientation.TrackUp:
            case MapOrientation.DtkUp:
              return isGpsValid ? desiredOrientation : MapOrientation.NorthUp;
            default:
              return desiredOrientation;
          }
        },
        this.orientationModule.desiredOrientation,
        this.dataIntegrityModule.headingSignalValid,
        this.dataIntegrityModule.gpsSignalValid
      );

      this.orientationOverridePipe = this.orientationOverride.pipe(this.orientationModule.orientation, true);

      this.orientationOverride.sub(override => {
        if (override === null) {
          if (this.orientationControl === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.orientationOverridePipe!.pause();
          } else {
            this.orientationControl.forfeit(this.orientationControlConsumer);
          }
        } else {
          if (this.orientationControl === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.orientationOverridePipe!.resume(true);
          } else {
            this.orientationControl.claim(this.orientationControlConsumer);
          }
        }
      }, true);
    }

    this.headingSignalSub = this.dataIntegrityModule.headingSignalValid.sub(isValid => {
      if (isValid) {
        this.orientationControl?.forfeit(this.orientationControlConsumer);
        this.setNormalAirplaneIcon();
      } else {
        this.setNoHeadingAirplaneIcon();
      }
    }, true);

    this.gpsSignalSub = this.dataIntegrityModule.gpsSignalValid.sub(isValid => {
      if (isValid) {
        this.targetControl?.forfeit(this.targetControlConsumer);
        this.ownAirplaneIconModule?.show.set(true);
      } else {
        this.ownAirplaneIconModule?.show.set(false);
        this.targetControl?.claim(this.targetControlConsumer);
      }
    }, true);
  }

  /**
   * Changes the player airplane icon to the normal variety.
   */
  private setNormalAirplaneIcon(): void {
    this.noHeadingIconSrcPipe?.pause();
    this.noHeadingIconAnchorPipe?.pause();

    this.normalIconSrcPipe?.resume(true);
    this.normalIconAnchorPipe?.resume(true);
  }

  /**
   * Changes the player airplane icon to the no-heading variety.
   */
  private setNoHeadingAirplaneIcon(): void {
    this.normalIconSrcPipe?.pause();
    this.normalIconAnchorPipe?.pause();

    this.noHeadingIconSrcPipe?.resume(true);
    this.noHeadingIconAnchorPipe?.resume(true);
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.targetControl?.forfeit(this.targetControlConsumer);
    this.orientationControl?.forfeit(this.orientationControlConsumer);

    this.orientationOverride?.destroy();
    this.orientationOverridePipe?.destroy();

    this.headingSignalSub?.destroy();
    this.gpsSignalSub?.destroy();

    this.normalIconSrcPipe?.destroy();
    this.normalIconAnchorPipe?.destroy();
    this.noHeadingIconSrcPipe?.destroy();
    this.noHeadingIconAnchorPipe?.destroy();

    super.destroy();
  }
}