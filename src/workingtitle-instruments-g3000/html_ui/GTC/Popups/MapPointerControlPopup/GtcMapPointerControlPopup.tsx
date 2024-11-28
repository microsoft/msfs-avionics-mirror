import { FSComponent, MappedSubject, MathUtils, ReadonlyFloat64Array, Subject, Vec2Math, VNode } from '@microsoft/msfs-sdk';

import { TouchPad } from '@microsoft/msfs-garminsdk';

import {
  DisplayPaneControlEvents, DisplayPaneIndex, G3000FilePaths, MapPointerJoystickDirection, MapPointerJoystickHandler,
  PfdMapLayoutSettingMode, PfdUserSettings
} from '@microsoft/msfs-wtg3000-common';

import { ImgTouchButton } from '../../Components/TouchButton/ImgTouchButton';
import { TouchButton } from '../../Components/TouchButton/TouchButton';
import { GtcInteractionEvent } from '../../GtcService/GtcInteractionEvent';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcSidebar } from '../../GtcService/Sidebar';

import './GtcMapPointerControlPopup.css';

/**
 * Component props for GtcMapPointerControlPopup.
 */
export interface GtcMapPointerControlPopupProps extends GtcViewProps {
  /**
   * A function which maps mouse drag distances on the touchpad to map pointer move distances.
   * @param distance A touchpad mouse drag distance, in pixels.
   * @param dt The time, in milliseconds, over which the mouse drag distance was performed.
   * @returns The distance the map pointer should move given the specified mouse drag distance and elapsed time.
   */
  touchDragDistanceMap?: (distance: number, dt: number) => number;
}

/**
 * A GTC map pointer control popup.
 */
export class GtcMapPointerControlPopup extends GtcView<GtcMapPointerControlPopupProps> {
  private static readonly DEFAULT_DRAG_DISTANCE_MAP = (scale: number, distance: number, dt: number): number => {
    const factor = MathUtils.clamp(distance / dt * 2 * scale, 0.1, 1);
    return distance * factor * scale;
  };

  private static readonly vec2Cache = [Vec2Math.create()];

  private readonly touchPadRef = FSComponent.createRef<TouchPad>();

  private readonly touchDragDistanceMap = this.props.touchDragDistanceMap
    ?? GtcMapPointerControlPopup.DEFAULT_DRAG_DISTANCE_MAP.bind(undefined, this.props.gtcService.isHorizontal ? 1 : 2);

  private readonly publisher = this.bus.getPublisher<DisplayPaneControlEvents>();

  private readonly pfdInstrumentPaneIndex = this.gtcService.pfdControlIndex === 1 ? DisplayPaneIndex.LeftPfdInstrument : DisplayPaneIndex.RightPfdInstrument;
  private readonly displayPaneIndex = this.props.displayPaneIndex === undefined
    ? MappedSubject.create(
      ([isPfdPaneVisible, pfdMapLayout]): DisplayPaneIndex => {
        if (isPfdPaneVisible && pfdMapLayout !== PfdMapLayoutSettingMode.Hsi) {
          return this.gtcService.pfdPaneIndex;
        } else {
          return this.pfdInstrumentPaneIndex;
        }
      },
      this.props.gtcService.pfdPaneSettings.getSetting('displayPaneVisible'),
      PfdUserSettings.getAliasedManager(this.gtcService.bus, this.gtcService.pfdControlIndex).getSetting('pfdMapLayout')
    )
    : Subject.create(this.props.displayPaneIndex);

  private readonly joystickHandler = new MapPointerJoystickHandler();

  /** @inheritdoc */
  public onAfterRender(): void {
    this._title.set('Map Pointer Control');
    this._sidebarState.mapKnobLabel.set(this.props.gtcService.isHorizontal ? '−Range+\nPush:\nPan Off' : GtcSidebar.hidePanesString + '− Range +\nPush:Pan');
    if (this.props.gtcService.isHorizontal) {
      this._sidebarState.dualConcentricKnobLabel.set('panPointPushPanOff');
    }
  }

  /** @inheritdoc */
  public onOpen(): void {
    this.publisher.pub('display_pane_view_event', {
      displayPaneIndex: this.displayPaneIndex.get(),
      eventType: 'display_pane_map_pointer_active_set',
      eventData: true
    }, true, false);
  }

  /** @inheritdoc */
  public onClose(): void {
    this.publisher.pub('display_pane_view_event', {
      displayPaneIndex: this.displayPaneIndex.get(),
      eventType: 'display_pane_map_pointer_active_set',
      eventData: false
    }, true, false);
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    switch (event) {
      case GtcInteractionEvent.OuterKnobDec:
      case GtcInteractionEvent.JoystickLeft: {
        if (this.props.gtcService.isHorizontal || event === GtcInteractionEvent.JoystickLeft) {
          const delta = this.joystickHandler.onInput(MapPointerJoystickDirection.Left, GtcMapPointerControlPopup.vec2Cache[0]);
          this.sendMoveEvent(delta[0], delta[1]);
          return true;
        }
        break;
      }
      case GtcInteractionEvent.OuterKnobInc:
      case GtcInteractionEvent.JoystickRight: {
        if (this.props.gtcService.isHorizontal || event === GtcInteractionEvent.JoystickRight) {
          const delta = this.joystickHandler.onInput(MapPointerJoystickDirection.Right, GtcMapPointerControlPopup.vec2Cache[0]);
          this.sendMoveEvent(delta[0], delta[1]);
          return true;
        }
        break;
      }
      case GtcInteractionEvent.InnerKnobDec:
      case GtcInteractionEvent.JoystickDown: {
        if (this.props.gtcService.isHorizontal || event === GtcInteractionEvent.JoystickDown) {
          const delta = this.joystickHandler.onInput(MapPointerJoystickDirection.Down, GtcMapPointerControlPopup.vec2Cache[0]);
          this.sendMoveEvent(delta[0], delta[1]);
          return true;
        }
        break;
      }
      case GtcInteractionEvent.InnerKnobInc:
      case GtcInteractionEvent.JoystickUp: {
        if (this.props.gtcService.isHorizontal || event === GtcInteractionEvent.JoystickUp) {
          const delta = this.joystickHandler.onInput(MapPointerJoystickDirection.Up, GtcMapPointerControlPopup.vec2Cache[0]);
          this.sendMoveEvent(delta[0], delta[1]);
          return true;
        }
        break;
      }
      case GtcInteractionEvent.InnerKnobPush:
      case GtcInteractionEvent.InnerKnobPushLong:
      case GtcInteractionEvent.MapKnobPush:
        this.props.gtcService.goBack();
        return true;
    }

    return false;
  }

  /**
   * Responds to mouse drag tick events from this popup's touchpad.
   * @param position The current position of the mouse.
   * @param prevPosition The position of the mouse during the previous frame, or `undefined` if this is the first frame
   * since the start of the current drag motion.
   * @param initialPosition The position of the mouse at the start of the current drag motion.
   * @param dt The elapsed time, in milliseconds, since the previous frame.
   */
  private onDragTick(position: ReadonlyFloat64Array, prevPosition: ReadonlyFloat64Array | undefined, initialPosition: ReadonlyFloat64Array, dt: number): void {
    if (prevPosition === undefined || dt === 0) {
      return;
    }

    const delta = Vec2Math.sub(position, prevPosition, GtcMapPointerControlPopup.vec2Cache[0]);
    const distance = Vec2Math.abs(delta);

    if (distance < 1) {
      return;
    }

    const mappedDistance = this.touchDragDistanceMap(distance, dt);

    if (mappedDistance < 1) {
      return;
    }

    const pointerDelta = Vec2Math.multScalar(delta, mappedDistance / distance, delta);

    this.sendMoveEvent(pointerDelta[0], pointerDelta[1]);
  }

  /**
   * Sends a map pointer move event to the currently controlled display pane.
   * @param dx The distance to move along the x axis, in pixels.
   * @param dy The distance to move along the y axis, in pixels.
   */
  private sendMoveEvent(dx: number, dy: number): void {
    this.publisher.pub('display_pane_view_event', {
      displayPaneIndex: this.displayPaneIndex.get(),
      eventType: 'display_pane_map_pointer_move',
      eventData: [dx, dy]
    }, true, false);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='pointer-control'>
        <div class='pointer-control-header'>
          <ImgTouchButton
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_small_direct_to.png`}
            isEnabled={false}
          />
          <TouchButton
            label='Info'
            isEnabled={false}
          />
          <TouchButton
            label={'Insert in\nFPL'}
            isEnabled={false}
          />
          <TouchButton
            label={'Create\nWPT'}
            isEnabled={false}
          />
          <TouchButton
            label={'BRG /\nDIS'}
            isEnabled={false}
          />
        </div>
        <TouchPad
          ref={this.touchPadRef}
          bus={this.bus}
          onDragTick={this.onDragTick.bind(this)}
          focusOnDrag
          lockFocusOnDrag
          class='pointer-control-touchpad'
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.touchPadRef.getOrDefault()?.destroy();

    if (this.displayPaneIndex instanceof MappedSubject) {
      this.displayPaneIndex.destroy();
    }

    super.destroy();
  }
}
