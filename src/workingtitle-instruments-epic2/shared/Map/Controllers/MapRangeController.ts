import { MapSystemContext, MapSystemController, Subscribable, UnitType } from '@microsoft/msfs-sdk';

/**
 * A controller that handles map range settings.
 */
export class MapRangeController extends MapSystemController {
  /**
   * Creates an instance of the MapRangeController.
   * @param context The map system context to use with this controller.
   * @param mapRange The map range.
   */
  constructor(
    context: MapSystemContext,
    private readonly mapRange: Subscribable<number>,
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.wireSettings();
  }

  /**
   * Wires the controller to the settings manager.
   */
  private wireSettings(): void {
    this.mapRange.sub(this.handleRangeChanged.bind(this), true);
  }

  /**
   * Handles when the range changes.
   * @param range The range of the map, in nautical miles.
   */
  private handleRangeChanged(range: number): void {
    // HINT: range is "radius" of the map, so we need to multiply by 2 to get the diameter
    this.context.projection.setQueued({ range: UnitType.NMILE.convertTo(range * 2, UnitType.GA_RADIAN) });
  }
}
