import { MappedSubject, NavEvents, NavSourceId, Vec2Math } from '@microsoft/msfs-sdk';

import {
  DisplayPaneControlEvents, DisplayPaneIndex, G3000RadioUtils, MapPointerJoystickDirection, MapPointerJoystickHandler, PfdMapLayoutSettingMode, PfdUserSettings
} from '@microsoft/msfs-wtg3000-common';

import { GtcInteractionEvent } from './GtcInteractionEvent';
import { GtcCenterKnobState, GtcDualKnobState, GtcMapKnobState } from './GtcKnobStates';
import { GtcService } from './GtcService';
import { GtcViewKeys } from './GtcViewKeys';

/** Whether the knob rotation in an increasing or decreasing direction. */
type GtcKnobDirection = 'inc' | 'dec';

/** Handles default behavior for the physical GTC knobs and buttons. */
export class GtcKnobHandler {
  private static readonly vec2Cache = [Vec2Math.create()];

  private readonly bus = this.gtcService.bus;

  private readonly publisher = this.bus.getPublisher<DisplayPaneControlEvents>();

  private cdiSource!: NavSourceId;

  private readonly pfdMapLayoutSetting = PfdUserSettings.getAliasedManager(this.gtcService.bus, this.gtcService.pfdControlIndex).getSetting('pfdMapLayout');

  private readonly controlledMapDisplayPaneIndex = MappedSubject.create(
    ([activeControlMode, selectedDisplayPane, isPfdPaneVisible, pfdMapLayout]): DisplayPaneIndex | -1 => {
      if (activeControlMode === 'PFD') {
        if (pfdMapLayout === PfdMapLayoutSettingMode.Hsi || (pfdMapLayout !== PfdMapLayoutSettingMode.Off && !isPfdPaneVisible)) {
          return this.gtcService.pfdInstrumentPaneIndex;
        } else if (isPfdPaneVisible) {
          return this.gtcService.pfdPaneIndex;
        }
      } else if (activeControlMode === 'MFD') {
        return selectedDisplayPane;
      }

      return -1;
    },
    this.gtcService.activeControlMode,
    this.gtcService.selectedDisplayPane,
    this.gtcService.pfdPaneSettings.getSetting('displayPaneVisible'),
    this.pfdMapLayoutSetting
  );

  private readonly mapPointerJoystickHandler = new MapPointerJoystickHandler();

  /**
   * The GtcKnobHandler constructor.
   * @param gtcService The GTC service instance for the GTC with which this handler is associated.
   */
  public constructor(private readonly gtcService: GtcService) {
    const sub = this.bus.getSubscriber<NavEvents>();
    sub.on('cdi_select').handle(x => {
      this.cdiSource = x;
    });
  }

  /**
   * Handles GtcInteractionEvents in the case that a GtcView has not overridden the knob behavior.
   * @param event The event.
   */
  public handleDefaultInteractionBehavior(event: GtcInteractionEvent): void {
    switch (event) {
      case GtcInteractionEvent.SoftKey1:
        this.gtcService.changeControlModeTo('PFD');
        return;
      case GtcInteractionEvent.SoftKey2:
        this.gtcService.changeControlModeTo('MFD');
        return;
      case GtcInteractionEvent.SoftKey3:
        this.gtcService.changeControlModeTo('NAV_COM');
        return;
      case GtcInteractionEvent.InnerKnobInc:
        this.handleInnerKnobRotate(event, 'inc');
        return;
      case GtcInteractionEvent.OuterKnobInc:
        this.handleOuterKnobRotate(event, 'inc');
        return;
      case GtcInteractionEvent.InnerKnobDec:
        this.handleInnerKnobRotate(event, 'dec');
        return;
      case GtcInteractionEvent.OuterKnobDec:
        this.handleOuterKnobRotate(event, 'dec');
        return;
      case GtcInteractionEvent.InnerKnobPush:
        this.handleInnerKnobPush(event, false);
        return;
      case GtcInteractionEvent.InnerKnobPushLong:
        this.handleInnerKnobPush(event, true);
        return;
      case GtcInteractionEvent.CenterKnobInc:
        this.handleCenterKnobRotate('inc');
        return;
      case GtcInteractionEvent.CenterKnobDec:
        this.handleCenterKnobRotate('dec');
        return;
      case GtcInteractionEvent.MapKnobInc:
        this.handleMapKnobRotate('inc');
        return;
      case GtcInteractionEvent.MapKnobDec:
        this.handleMapKnobRotate('dec');
        return;
      case GtcInteractionEvent.MapKnobPush:
        this.handleMapKnobPush();
        return;
      case GtcInteractionEvent.JoystickLeft:
        this.handleJoystickPan('left');
        return;
      case GtcInteractionEvent.JoystickRight:
        this.handleJoystickPan('right');
        return;
      case GtcInteractionEvent.JoystickDown:
        this.handleJoystickPan('down');
        return;
      case GtcInteractionEvent.JoystickUp:
        this.handleJoystickPan('up');
        return;
      case GtcInteractionEvent.ButtonBarCancelPressed:
        this.gtcService.goBack();
        return;
    }
  }

  /**
   * Handles inner knob rotate events.
   * @param event The GtcInteractionEvent.
   * @param incOrDec Increase or decrease event.
   */
  private handleInnerKnobRotate(event: GtcInteractionEvent, incOrDec: GtcKnobDirection): void {
    switch (this.gtcService.gtcKnobStates.dualKnobState.get()) {
      case GtcDualKnobState.CRS:
        this.changeCourse(incOrDec);
        return;
      case GtcDualKnobState.DisplayPanes:
      case GtcDualKnobState.DisplayPanesAndRadarControl:
        this.changeSelectedDisplayPane(incOrDec);
        return;
      case GtcDualKnobState.MapPointerControl:
        this.sendMapPointerMoveEvent(incOrDec === 'inc' ? MapPointerJoystickDirection.Up : MapPointerJoystickDirection.Down);
        return;
      case GtcDualKnobState.NAVCOM1:
      case GtcDualKnobState.NAVCOM2:
        this.gtcService.navComEventHandler.get()?.onGtcInteractionEvent(event);
        return;
    }
  }

  /**
   * Handles inner knob push events.
   * @param event The GtcInteractionEvent.
   * @param isLong Whether the event is a long push.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleInnerKnobPush(event: GtcInteractionEvent, isLong: boolean): void {
    switch (this.gtcService.gtcKnobStates.dualKnobState.get()) {
      case GtcDualKnobState.MapPointerControl:
        this.sendMapPointerActiveSetEvent(false);
        break;
      case GtcDualKnobState.NAVCOM1:
      case GtcDualKnobState.NAVCOM2:
        this.gtcService.navComEventHandler.get()?.onGtcInteractionEvent(event);
        break;
    }
  }

  /**
   * Handles outer knob rotate events.
   * @param event The GtcInteractionEvent.
   * @param incOrDec Increase or decrease event.
   */
  private handleOuterKnobRotate(event: GtcInteractionEvent, incOrDec: GtcKnobDirection): void {
    switch (this.gtcService.gtcKnobStates.dualKnobState.get()) {
      case GtcDualKnobState.CRS:
        this.changeCourse(incOrDec);
        return;
      case GtcDualKnobState.DisplayPanes:
      case GtcDualKnobState.DisplayPanesAndRadarControl:
        this.changeSelectedDisplayPane(incOrDec);
        return;
      case GtcDualKnobState.MapPointerControl:
        this.sendMapPointerMoveEvent(incOrDec === 'inc' ? MapPointerJoystickDirection.Right : MapPointerJoystickDirection.Left);
        return;
      case GtcDualKnobState.NAVCOM1:
      case GtcDualKnobState.NAVCOM2:
        this.gtcService.navComEventHandler.get()?.onGtcInteractionEvent(event);
        return;
    }
  }

  /**
   * Handles center knob rotate events.
   * @param incOrDec Increase or decrease event.
   */
  private handleCenterKnobRotate(incOrDec: GtcKnobDirection): void {
    // TODO: The above is a temp fix until the vertical GTC gets a joystick, at which time replace with below.
    switch (this.gtcService.gtcKnobStates.centerKnobState.get()) {
      case GtcCenterKnobState.NAVCOM1:
        G3000RadioUtils.changeRadioVolume('COM1', incOrDec.toUpperCase() as 'INC' | 'DEC');
        return;
      case GtcCenterKnobState.NAVCOM2:
        G3000RadioUtils.changeRadioVolume('COM2', incOrDec.toUpperCase() as 'INC' | 'DEC');
        return;
    }
  }

  /**
   * Sends event to scroll display pane selection left or right.
   * @param incOrDec Increase goes right, decrease left.
   */
  private changeSelectedDisplayPane(incOrDec: GtcKnobDirection): void {
    const leftOrRight = incOrDec === 'inc' ? 'right' : 'left';
    this.bus.getPublisher<DisplayPaneControlEvents>()
      .pub(`change_display_pane_select_${leftOrRight}`, this.gtcService.displayPaneControlIndex, true);
  }

  /**
   * Change the course knob course.
   * @param incOrDec Increase or decrease event.
   */
  private changeCourse(incOrDec: GtcKnobDirection): void {
    SimVar.SetSimVarValue(`K:VOR${this.cdiSource.index}_OBI_${incOrDec.toUpperCase()}`, 'number', 0);
  }

  /**
   * Handles map knob rotate events.
   * @param incOrDec Increase or decrease event.
   */
  private handleMapKnobRotate(incOrDec: GtcKnobDirection): void {
    switch (this.gtcService.gtcKnobStates.mapKnobState.get()) {
      case GtcMapKnobState.Blank:
        return;
      case GtcMapKnobState.MapNoPointer:
      case GtcMapKnobState.MapWithPointer:
      case GtcMapKnobState.WeatherRadar:
      case GtcMapKnobState.MapPointerControl:
        this.sendMapRangeEvent(incOrDec);
        return;
      // TODO Navcom stuff
      case GtcMapKnobState.NAVCOM1:
      case GtcMapKnobState.NAVCOM2:
        return;
    }
  }

  /**
   * Handles map knob push events.
   */
  private handleMapKnobPush(): void {
    switch (this.gtcService.gtcKnobStates.mapKnobState.get()) {
      case GtcMapKnobState.Blank:
      case GtcMapKnobState.MapNoPointer:
      case GtcMapKnobState.WeatherRadar:
        return;
      case GtcMapKnobState.MapWithPointer:
        switch (this.gtcService.activeControlMode.get()) {
          case 'PFD': {
            this.sendMapPointerActiveSetEvent(true);
            break;
          }
          case 'MFD':
            this.gtcService.openPopup(GtcViewKeys.MapPointerControl, 'slideout-bottom', 'none');
            break;
        }
        return;
      case GtcMapKnobState.MapPointerControl: {
        this.sendMapPointerActiveSetEvent(false);
        return;
      }
      // TODO Navcom stuff
      case GtcMapKnobState.NAVCOM1:
      case GtcMapKnobState.NAVCOM2:
        return;
    }
  }

  /**
   * Handles joystick pan events.
   * @param direction The direction of the pan.
   */
  private handleJoystickPan(direction: 'left' | 'right' | 'down' | 'up'): void {
    switch (this.gtcService.gtcKnobStates.mapKnobState.get()) {
      case GtcMapKnobState.MapPointerControl: {
        let pointerDirection: MapPointerJoystickDirection;
        switch (direction) {
          case 'left':
            pointerDirection = MapPointerJoystickDirection.Left;
            break;
          case 'right':
            pointerDirection = MapPointerJoystickDirection.Right;
            break;
          case 'down':
            pointerDirection = MapPointerJoystickDirection.Down;
            break;
          case 'up':
            pointerDirection = MapPointerJoystickDirection.Up;
            break;
        }
        this.sendMapPointerMoveEvent(pointerDirection);
        return;
      }
      default:
        if (this.gtcService.activeControlMode.get() === 'MFD') {
          switch (direction) {
            case 'left':
              this.changeSelectedDisplayPane('dec');
              break;
            case 'right':
              this.changeSelectedDisplayPane('inc');
              break;
          }
        }
    }
  }

  /**
   * Sends a map range event to the currently controlled display pane.
   * @param incOrDec Increase or decrease event.
   */
  private sendMapRangeEvent(incOrDec: GtcKnobDirection): void {
    const displayPaneIndex = this.controlledMapDisplayPaneIndex.get();
    if (displayPaneIndex < 0) {
      return;
    } else {
      this.publisher.pub('display_pane_view_event', {
        displayPaneIndex: displayPaneIndex as DisplayPaneIndex,
        eventType: `display_pane_map_range_${incOrDec}`,
        eventData: undefined
      }, true);
      return;
    }
  }

  /**
   * Sends a map pointer set active state event to the currently controlled display pane.
   * @param activate Whether to activate the pointer.
   */
  private sendMapPointerActiveSetEvent(activate: boolean): void {
    const displayPaneIndex = this.controlledMapDisplayPaneIndex.get();

    if (displayPaneIndex < 0) {
      return;
    } else {
      this.publisher.pub('display_pane_view_event', {
        displayPaneIndex: displayPaneIndex as DisplayPaneIndex,
        eventType: 'display_pane_map_pointer_active_set',
        eventData: activate
      }, true);
      return;
    }
  }

  /**
   * Sends a map pointer move event to the currently controlled display pane.
   * @param direction The direction in which to move the pointer.
   */
  private sendMapPointerMoveEvent(direction: MapPointerJoystickDirection): void {
    const displayPaneIndex = this.controlledMapDisplayPaneIndex.get();

    if (displayPaneIndex < 0) {
      return;
    } else {
      const delta = this.mapPointerJoystickHandler.onInput(direction, GtcKnobHandler.vec2Cache[0]);
      this.publisher.pub('display_pane_view_event', {
        displayPaneIndex: displayPaneIndex as DisplayPaneIndex,
        eventType: 'display_pane_map_pointer_move',
        eventData: [delta[0], delta[1]]
      }, true);
      return;
    }
  }
}