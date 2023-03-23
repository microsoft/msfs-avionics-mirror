/**
 * Utility class defining the priority values for common resource consumers.
 */
export class MapResourcePriority {
  /** Default follow player airplane behavior. */
  public static readonly FOLLOW_AIRPLANE = 0;

  /** Orientation mode. */
  public static readonly ORIENTATION = 0;

  /** Rotation behavior from orientation mode. */
  public static readonly ORIENTATION_ROTATION = 0;

  /** Pointer. */
  public static readonly POINTER = 100;

  /** Waypoint highlight. */
  public static readonly WAYPOINT_HIGHLIGHT = 75;

  /** Flight plan focus. */
  public static readonly FLIGHT_PLAN_FOCUS = 50;

  /** Data integrity. */
  public static readonly DATA_INTEGRITY = 25;
}