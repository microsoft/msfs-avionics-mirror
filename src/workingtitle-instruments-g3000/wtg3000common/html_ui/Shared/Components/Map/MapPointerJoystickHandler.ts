import { Vec2Math } from '@microsoft/msfs-sdk';

/**
 * A direction for a joystick input that controls a map pointer.
 */
export enum MapPointerJoystickDirection {
  Left = 'Left',
  LeftUp = 'LeftUp',
  Up = 'Up',
  RightUp = 'RightUp',
  Right = 'Right',
  RightDown = 'RightDown',
  Down = 'Down',
  LeftDown = 'LeftDown'
}

/**
 * A handler for joystick inputs that control the movement of a map pointer. Consumes inputs and converts them into
 * displacement vectors for the map pointer. Supports input acceleration.
 */
export class MapPointerJoystickHandler {
  /** The base distance moved by the map pointer per input, in pixels. */
  private static readonly STEP = 5;

  /** The maximum time, in milliseconds, between inputs required to trigger acceleration. */
  private static readonly DEFAULT_ACCEL_TIME_THRESHOLD = 250;

  private consecutiveInputs = 0;
  private lastInputTime = 0;

  /**
   * Constructor.
   * @param accelTimeThreshold The maximum time, in milliseconds, between inputs required to trigger acceleration.
   * Defaults to {@link MapPointerJoystickHandler.DEFAULT_ACCEL_TIME_THRESHOLD}.
   */
  public constructor(
    private readonly accelTimeThreshold = MapPointerJoystickHandler.DEFAULT_ACCEL_TIME_THRESHOLD
  ) {
  }

  /**
   * Handles a joystick input, converting it into a displacement vector for the map pointer.
   * @param direction The direction of the input.
   * @param out The vector to which to write the result.
   * @returns The displacement vector for the map pointer commanded by the input.
   */
  public onInput(direction: MapPointerJoystickDirection, out: Float64Array): Float64Array {
    let angle = 0;
    switch (direction) {
      case MapPointerJoystickDirection.Right:
        angle = 0;
        break;
      case MapPointerJoystickDirection.RightDown:
        angle = Math.PI / 4;
        break;
      case MapPointerJoystickDirection.Down:
        angle = Math.PI / 2;
        break;
      case MapPointerJoystickDirection.LeftDown:
        angle = 3 * Math.PI / 4;
        break;
      case MapPointerJoystickDirection.Left:
        angle = Math.PI;
        break;
      case MapPointerJoystickDirection.LeftUp:
        angle = -3 * Math.PI / 4;
        break;
      case MapPointerJoystickDirection.Up:
        angle = -Math.PI / 2;
        break;
      case MapPointerJoystickDirection.RightUp:
        angle = -Math.PI / 4;
        break;
    }

    const time = Date.now();
    const dt = time - this.lastInputTime;

    this.lastInputTime = time;

    if (dt <= this.accelTimeThreshold) {
      this.consecutiveInputs++;
    } else {
      this.consecutiveInputs = 0;
    }

    let distance = MapPointerJoystickHandler.STEP;


    if (this.consecutiveInputs > 4) {
      distance *= 4;
    } else if (this.consecutiveInputs > 1) {
      distance *= 2;
    }

    return Vec2Math.setFromPolar(distance, angle, out);
  }
}