import { Vec2Math } from '@microsoft/msfs-sdk';

import { MapPointerJoystickDirection, MapPointerJoystickHandler } from '../Components/Map/MapPointerJoystickHandler';
import { PfdControllerInteractionEvent } from './PfdControllerInteractionEvent';

/**
 * Configuration options for {@link PfdControllerJoystickEventMapHandler}.
 */
export type PfdControllerJoystickEventMapHandlerOptions = {
  /**
   * A function that handles map pointer toggle events. If not defined, then map pointer toggle events will not be
   * handled.
   * @returns Whether the event was handled.
   */
  onPointerToggle?: () => boolean;

  /**
   * A function that handles map pointer move events. If not defined, then map pointer move events will not be handled.
   * @param dx The horizontal displacement, in pixels.
   * @param dy The vertical displacement, in pixels.
   * @returns Whether the event was handled.
   */
  onPointerMove?: (dx: number, dy: number) => boolean;

  /**
   * A function that handles map range change events. If not defined, then map range change events will not be handled.
   * @param direction The direction in which to change the map range.
   * @returns Whether the event was handled.
   */
  onRangeChange?: (direction: 1 | -1) => boolean;
};

/**
 * Handles PFD controller joystick interaction events for a map. The handler will convert joystick interaction events
 * to map pointer toggle, map pointer move, and map range change events as appropriate and forward the converted events
 * to callback functions configured through options.
 */
export class PfdControllerJoystickEventMapHandler {
  private static readonly vec2Cache = [Vec2Math.create()];

  private readonly mapPointerJoystickHandler = new MapPointerJoystickHandler();

  private readonly onPointerToggle?: () => boolean;
  private readonly onPointerMove?: (dx: number, dy: number) => boolean;
  private readonly onRangeChange?: (direction: 1 | -1) => boolean;

  /**
   * Creates a new instance of PfdControllerJoystickEventHandler.
   * @param options Options with which to configure the handler.
   */
  public constructor(
    options?: Readonly<PfdControllerJoystickEventMapHandlerOptions>
  ) {
    this.onPointerToggle = options?.onPointerToggle;
    this.onPointerMove = options?.onPointerMove;
    this.onRangeChange = options?.onRangeChange;
  }

  /**
   * Handles an interaction event.
   * @param event The interaction event to handle.
   * @returns Whether the interaction event was handled.
   */
  public onInteractionEvent(event: string): boolean {
    switch (event) {
      case PfdControllerInteractionEvent.JoystickLeft:
        this.sendMapPointerMoveEvent(MapPointerJoystickDirection.Left);
        return true;
      case PfdControllerInteractionEvent.JoystickRight:
        this.sendMapPointerMoveEvent(MapPointerJoystickDirection.Right);
        return true;
      case PfdControllerInteractionEvent.JoystickUp:
        this.sendMapPointerMoveEvent(MapPointerJoystickDirection.Up);
        return true;
      case PfdControllerInteractionEvent.JoystickDown:
        this.sendMapPointerMoveEvent(MapPointerJoystickDirection.Down);
        return true;
      case PfdControllerInteractionEvent.JoystickInc:
        this.sendMapRangeChangeEvent(1);
        return true;
      case PfdControllerInteractionEvent.JoystickDec:
        this.sendMapRangeChangeEvent(-1);
        return true;
      case PfdControllerInteractionEvent.JoystickPush:
        this.sendMapPointerActiveToggleEvent();
        return true;
      default:
        return false;
    }
  }

  /**
   * Sends a map range change event.
   * @param direction The direction in which to change the map range.
   * @returns Whether the event was handled.
   */
  private sendMapRangeChangeEvent(direction: 1 | -1): boolean {
    if (this.onRangeChange) {
      return this.onRangeChange(direction);
    } else {
      return false;
    }
  }

  /**
   * Sends a map pointer toggle active event.
   * @returns Whether the event was handled.
   */
  private sendMapPointerActiveToggleEvent(): boolean {
    if (this.onPointerToggle) {
      return this.onPointerToggle();
    } else {
      return false;
    }
  }

  /**
   * Sends a map pointer move event.
   * @param direction The direction in which to move the pointer.
   * @returns Whether the event was handled.
   */
  private sendMapPointerMoveEvent(direction: MapPointerJoystickDirection): boolean {
    if (this.onPointerMove) {
      const delta = this.mapPointerJoystickHandler.onInput(direction, PfdControllerJoystickEventMapHandler.vec2Cache[0]);
      return this.onPointerMove(delta[0], delta[1]);
    } else {
      return false;
    }
  }
}
