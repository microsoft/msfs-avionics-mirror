import { EventBus, HEvent, KeyEventManager, MappedSubject, SimVarValueType, Subject, Subscription, Vec2Math } from '@microsoft/msfs-sdk';

import {
  DisplayPaneControlEvents, DisplayPaneIndex, DisplayPanesAliasedUserSettingManager, DisplayPanesUserSettings, MapPointerJoystickDirection,
  MapPointerJoystickHandler, PfdIndex, PfdMapLayoutSettingMode, PfdUserSettings
} from '@microsoft/msfs-wtg3000-common';

/**
 * Handles PFD control panel map joystick inputs.
 */
export class PfdMapJoystickInputHandler {
  private static readonly vec2Cache = [Vec2Math.create()];

  private readonly publisher = this.bus.getPublisher<DisplayPaneControlEvents>();

  private readonly hEventJoystickPrefix = `AS3000_PFD_${this.index}_JOYSTICK_`;
  private readonly hEventRangePrefix = `AS3000_PFD_${this.index}_RANGE_`;

  private readonly mapPointerActiveVar = `L:WTG3000_Control_Panel_MapShowCursor:${this.index}`;

  private keyEventManager?: KeyEventManager;

  private readonly pfdPaneIndex = this.index === 1 ? DisplayPaneIndex.LeftPfd : DisplayPaneIndex.RightPfd;
  private readonly pfdInstrumentPaneIndex = this.index === 1 ? DisplayPaneIndex.LeftPfdInstrument : DisplayPaneIndex.RightPfdInstrument;

  private readonly pfdPaneSettingManager = DisplayPanesUserSettings.getDisplayPaneManager(this.bus, this.pfdPaneIndex);
  private readonly pfdSettingManager = PfdUserSettings.getAliasedManager(this.bus, this.index);

  private readonly controlledMapDisplayPaneIndex = MappedSubject.create(
    ([isPfdPaneVisible, pfdMapLayout]): DisplayPaneIndex | -1 => {
      if (pfdMapLayout === PfdMapLayoutSettingMode.Hsi || (pfdMapLayout !== PfdMapLayoutSettingMode.Off && !isPfdPaneVisible)) {
        return this.pfdInstrumentPaneIndex;
      } else if (isPfdPaneVisible) {
        return this.pfdPaneIndex;
      } else {
        return -1;
      }
    },
    this.pfdPaneSettingManager.getSetting('displayPaneVisible'),
    this.pfdSettingManager.getSetting('pfdMapLayout')
  );

  private readonly controlledMapPaneSettingManager = new DisplayPanesAliasedUserSettingManager(this.bus);

  private readonly isMapPointerActive = Subject.create(false);

  private readonly mapPointerJoystickHandler = new MapPointerJoystickHandler();

  private isAlive = true;
  private isInit = false;

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly keyEventManagerReadyPromises: { resolve: () => void, reject: (reason?: any) => void }[] = [];

  private hEventSub?: Subscription;
  private mapPointerActivePipe?: Subscription;

  /**
   * Constructor.
   * @param index The index of this handler's parent PFD.
   * @param bus The event bus.
   */
  public constructor(
    public readonly index: PfdIndex,
    private readonly bus: EventBus
  ) {
    KeyEventManager.getManager(this.bus).then(manager => {
      this.keyEventManager = manager;
      while (this.isAlive && this.keyEventManagerReadyPromises.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.keyEventManagerReadyPromises.shift()!.resolve();
      }
    });
  }

  /**
   * Waits for this handler's key event manager to be ready.
   * @returns A Promise which will be fulfilled when this handler's key event manager is ready, or rejected if this
   * handler is destroyed before then.
   */
  private awaitKeyEventManagerReady(): Promise<void> {
    if (this.keyEventManager !== undefined) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => { this.keyEventManagerReadyPromises.push({ resolve, reject }); });
  }

  /**
   * Initializes this handler. Once this handler is initialized, it will respond to input events from the map joystick
   * on its PFD's control panel.
   * @returns A Promise which will be fulfilled when this handler is fully initialized, or rejected if this handler is
   * destroyed before then.
   */
  public async init(): Promise<void> {
    if (!this.isAlive) {
      throw new Error('PfdMapJoystickInputHandler: cannot initialize a dead handler');
    }

    await this.awaitKeyEventManagerReady();

    if (this.isInit) {
      return;
    }

    // Publish map pointer active state to simvar so that the joystick modelbehavior can set its tooltip.

    const mapPointerActivePipe = this.mapPointerActivePipe = this.controlledMapPaneSettingManager.getSetting('displayPaneMapPointerActive').pipe(this.isMapPointerActive, false);

    this.controlledMapDisplayPaneIndex.sub(index => {
      if (index < 0) {
        mapPointerActivePipe.pause();
        this.isMapPointerActive.set(false);
      } else {
        this.controlledMapPaneSettingManager.useDisplayPaneSettings(index);
        mapPointerActivePipe.resume(true);
      }
    }, true);

    this.isMapPointerActive.sub(isActive => {
      SimVar.SetSimVarValue(this.mapPointerActiveVar, SimVarValueType.Number, isActive ? 1 : 0);
    }, true);

    this.hEventSub = this.bus.getSubscriber<HEvent>().on('hEvent').handle(hEvent => {
      if (hEvent.startsWith(this.hEventJoystickPrefix)) {
        this.handleJoystickInput(hEvent.substring(this.hEventJoystickPrefix.length));
      } else if (hEvent.startsWith(this.hEventRangePrefix)) {
        this.handleJoystickInput(hEvent.substring(this.hEventRangePrefix.length));
      }
    });
  }

  /**
   * Handles a joystick input.
   * @param input The key of the input to handle, with the prefix removed.
   */
  private handleJoystickInput(input: string): void {
    switch (input) {
      case 'LEFT':
        this.sendMapPointerMoveEvent(MapPointerJoystickDirection.Left);
        break;
      case 'RIGHT':
        this.sendMapPointerMoveEvent(MapPointerJoystickDirection.Right);
        break;
      case 'UP':
        this.sendMapPointerMoveEvent(MapPointerJoystickDirection.Up);
        break;
      case 'DOWN':
        this.sendMapPointerMoveEvent(MapPointerJoystickDirection.Down);
        break;
      case 'INC':
        this.sendMapRangeEvent('inc');
        break;
      case 'DEC':
        this.sendMapRangeEvent('dec');
        break;
      case 'PUSH': {
        this.sendMapPointerActiveToggleEvent();
        break;
      }
    }
  }

  /**
   * Sends a map range event to the currently controlled map.
   * @param incOrDec Increase or decrease event.
   */
  private sendMapRangeEvent(incOrDec: 'inc' | 'dec'): void {
    const displayPaneIndex = this.controlledMapDisplayPaneIndex.get();
    if (displayPaneIndex < 0) {
      return;
    } else {
      this.publisher.pub('display_pane_view_event', {
        displayPaneIndex: displayPaneIndex,
        eventType: `display_pane_map_range_${incOrDec}`,
        eventData: undefined
      }, true);
      return;
    }
  }

  /**
   * Sends a map pointer toggle active event to the currently controlled map.
   */
  private sendMapPointerActiveToggleEvent(): void {
    const displayPaneIndex = this.controlledMapDisplayPaneIndex.get();

    if (displayPaneIndex < 0) {
      return;
    } else {
      this.publisher.pub('display_pane_view_event', {
        displayPaneIndex: displayPaneIndex,
        eventType: 'display_pane_map_pointer_active_toggle',
        eventData: undefined
      }, true);
      return;
    }
  }

  /**
   * Sends a map pointer move event to the currently controlled map.
   * @param direction The direction in which to move the pointer.
   */
  private sendMapPointerMoveEvent(direction: MapPointerJoystickDirection): void {
    const displayPaneIndex = this.controlledMapDisplayPaneIndex.get();

    if (displayPaneIndex < 0) {
      return;
    } else {
      const delta = this.mapPointerJoystickHandler.onInput(direction, PfdMapJoystickInputHandler.vec2Cache[0]);
      this.publisher.pub('display_pane_view_event', {
        displayPaneIndex: displayPaneIndex,
        eventType: 'display_pane_map_pointer_move',
        eventData: [delta[0], delta[1]]
      }, true);
      return;
    }
  }

  /**
   * Destroys this handler.
   */
  public destroy(): void {
    this.isAlive = false;

    this.keyEventManagerReadyPromises.forEach(promise => { promise.reject('PfdMapJoystickInputHandler: handler was destroyed'); });

    this.controlledMapDisplayPaneIndex.destroy();

    this.hEventSub?.destroy();
    this.mapPointerActivePipe?.destroy();
  }
}