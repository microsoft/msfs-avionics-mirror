import {
  BitFlags, MapProjection, MapProjectionChangeType, MapSystemContext, MapSystemController, MapSystemUtils,
  MutableSubscribable, ReadonlyFloat64Array, Subscribable, SubscribableUtils, Subscription, VecNMath
} from '@microsoft/msfs-sdk';

/**
 * Controls the map's nominal range endpoints.
 */
export class MapRangeEndpointsController extends MapSystemController {

  private readonly projectedRange: Subscribable<number>;

  private needUpdateEndpoints = false;
  private readonly endpoints = VecNMath.create(4);

  private readonly subscriptions: Subscription[] = [];

  /**
   * Creates a new instance of MapRangeEndpointsController.
   * @param context This controller's map context.
   * @param projectedRange The projected scale of the map's nominal range, in pixels.
   * @param nominalRangeEndpoints The mutable subscribable to which to write computed nominal range endpoints.
   */
  public constructor(
    context: MapSystemContext,
    projectedRange: number | Subscribable<number>,
    private readonly nominalRangeEndpoints: MutableSubscribable<any, ReadonlyFloat64Array>,
  ) {
    super(context);

    this.projectedRange = SubscribableUtils.toSubscribable(projectedRange, true);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    const scheduleUpdate = (): void => { this.needUpdateEndpoints = true; };

    this.subscriptions.push(
      this.context.deadZone.sub(scheduleUpdate),
      this.projectedRange.sub(scheduleUpdate)
    );

    this.needUpdateEndpoints = true;
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    if (BitFlags.isAny(changeFlags, MapProjectionChangeType.ProjectedSize | MapProjectionChangeType.TargetProjected)) {
      this.needUpdateEndpoints = true;
    }
  }

  /** @inheritdoc */
  public onBeforeUpdated(): void {
    if (!this.needUpdateEndpoints) {
      return;
    }

    this.needUpdateEndpoints = false;

    const deadZone = this.context.deadZone.get();
    const size = this.context.projection.getProjectedSize();
    const targetProjected = this.context.projection.getTargetProjected();

    const x = MapSystemUtils.trueToNominalRelativeX(targetProjected[0] / size[0], size[0], deadZone);
    const y1 = MapSystemUtils.trueToNominalRelativeY(targetProjected[1] / size[1], size[1], deadZone);
    const y2 = MapSystemUtils.trueToNominalRelativeY((targetProjected[1] - this.projectedRange.get()) / size[1], size[1], deadZone);

    this.endpoints[0] = x;
    this.endpoints[1] = y1;
    this.endpoints[2] = x;
    this.endpoints[3] = y2;

    this.nominalRangeEndpoints.set(this.endpoints);
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}