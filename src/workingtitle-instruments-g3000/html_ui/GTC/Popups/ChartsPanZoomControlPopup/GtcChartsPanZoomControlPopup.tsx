import { FSComponent, MathUtils, ReadonlyFloat64Array, Vec2Math, VNode } from '@microsoft/msfs-sdk';

import { TouchPad } from '@microsoft/msfs-garminsdk';

import {
  ChartsPaneViewEventTypes, ControllableDisplayPaneIndex, DisplayPaneControlEvents, G3000FilePaths, GtcViewKeys,
  MapPointerJoystickDirection, MapPointerJoystickHandler
} from '@microsoft/msfs-wtg3000-common';

import { ImgTouchButton } from '../../Components/TouchButton/ImgTouchButton';
import { TouchButton } from '../../Components/TouchButton/TouchButton';
import { GtcInteractionEvent } from '../../GtcService/GtcInteractionEvent';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcSidebar } from '../../GtcService/Sidebar';

import './GtcChartsPanZoomControlPopup.css';

/**
 * Component props for {@link GtcChartsPanZoomControlPopup}.
 */
export interface GtcChartsPanZoomControlPopupProps extends GtcViewProps {
  /**
   * A function which maps mouse drag distances on the touchpad to chart pan distances.
   * @param distance A touchpad mouse drag distance, in pixels.
   * @param dt The time, in milliseconds, over which the mouse drag distance was performed.
   * @returns The distance the chart should be panned given the specified mouse drag distance and elapsed time.
   */
  touchDragDistanceMap?: (distance: number, dt: number) => number;
}

/**
 * A GTC charts pan/zoom control popup.
 */
export class GtcChartsPanZoomControlPopup extends GtcView<GtcChartsPanZoomControlPopupProps> {
  private static readonly DEFAULT_DRAG_DISTANCE_MAP = (scale: number, distance: number, dt: number): number => {
    const factor = MathUtils.clamp(distance / dt * 2 * scale, 0.1, 1);
    return distance * factor * scale;
  };

  private static readonly vec2Cache = [Vec2Math.create()];

  private readonly touchPadRef = FSComponent.createRef<TouchPad>();

  private readonly touchDragDistanceMap = this.props.touchDragDistanceMap
    ?? GtcChartsPanZoomControlPopup.DEFAULT_DRAG_DISTANCE_MAP.bind(undefined, this.props.gtcService.isHorizontal ? 1 : 2);

  private readonly publisher = this.bus.getPublisher<DisplayPaneControlEvents<ChartsPaneViewEventTypes>>();

  private readonly displayPaneIndex: ControllableDisplayPaneIndex;

  private readonly joystickHandler = new MapPointerJoystickHandler();

  /**
   * Creates a new instance of GtcChartsPanZoomControlPopup.
   * @param props This component's props.
   * @throws Error if a display pane index is not defined for this view.
   */
  public constructor(props: GtcChartsPanZoomControlPopupProps) {
    super(props);

    if (this.props.displayPaneIndex === undefined) {
      throw new Error('GtcChartsPanZoomControlPopup: display pane index was not defined');
    }

    this.displayPaneIndex = this.props.displayPaneIndex;
  }

  /** @inheritDoc */
  public onAfterRender(): void {
    this._title.set('Charts Pan/Zoom Control');
    this._sidebarState.mapKnobLabel.set(this.props.gtcService.isHorizontal ? '−Range+\nPush:\nPan Off' : GtcSidebar.hidePanesString + '− Range +\nPush:Pan');
    if (this.props.gtcService.isHorizontal) {
      this._sidebarState.dualConcentricKnobLabel.set('panPointPushPanOff');
    }
  }

  /** @inheritDoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    switch (event) {
      case GtcInteractionEvent.OuterKnobDec:
      case GtcInteractionEvent.JoystickLeft: {
        if (this.props.gtcService.isHorizontal || event === GtcInteractionEvent.JoystickLeft) {
          const delta = this.joystickHandler.onInput(MapPointerJoystickDirection.Left, GtcChartsPanZoomControlPopup.vec2Cache[0]);
          this.sendPanEvent(delta[0], delta[1], false);
          return true;
        }
        break;
      }
      case GtcInteractionEvent.OuterKnobInc:
      case GtcInteractionEvent.JoystickRight: {
        if (this.props.gtcService.isHorizontal || event === GtcInteractionEvent.JoystickRight) {
          const delta = this.joystickHandler.onInput(MapPointerJoystickDirection.Right, GtcChartsPanZoomControlPopup.vec2Cache[0]);
          this.sendPanEvent(delta[0], delta[1], false);
          return true;
        }
        break;
      }
      case GtcInteractionEvent.InnerKnobDec:
      case GtcInteractionEvent.JoystickDown: {
        if (this.props.gtcService.isHorizontal || event === GtcInteractionEvent.JoystickDown) {
          const delta = this.joystickHandler.onInput(MapPointerJoystickDirection.Down, GtcChartsPanZoomControlPopup.vec2Cache[0]);
          this.sendPanEvent(delta[0], delta[1], false);
          return true;
        }
        break;
      }
      case GtcInteractionEvent.InnerKnobInc:
      case GtcInteractionEvent.JoystickUp: {
        if (this.props.gtcService.isHorizontal || event === GtcInteractionEvent.JoystickUp) {
          const delta = this.joystickHandler.onInput(MapPointerJoystickDirection.Up, GtcChartsPanZoomControlPopup.vec2Cache[0]);
          this.sendPanEvent(delta[0], delta[1], false);
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
   * Responds to drag started events from this popup's touchpad.
   */
  private onDragStarted(): void {
    this.sendSetOverscrollSnapbackInhibitEvent(true);
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

    const delta = Vec2Math.sub(position, prevPosition, GtcChartsPanZoomControlPopup.vec2Cache[0]);
    const distance = Vec2Math.abs(delta);

    if (distance < 1) {
      return;
    }

    const mappedDistance = this.touchDragDistanceMap(distance, dt);

    if (mappedDistance < 1) {
      return;
    }

    const pointerDelta = Vec2Math.multScalar(delta, mappedDistance / distance, delta);

    this.sendPanEvent(pointerDelta[0], pointerDelta[1], true);
  }

  /**
   * Responds to drag started events from this popup's touchpad.
   */
  private onDragEnded(): void {
    this.sendSetOverscrollSnapbackInhibitEvent(false);
  }

  /**
   * Sends an event to set whether panning overscroll snap-back is inhibited to this popup's controlled display pane.
   * @param allowOverscroll Whether overscroll snap-back should be inhibited.
   */
  private sendSetOverscrollSnapbackInhibitEvent(allowOverscroll: boolean): void {
    this.publisher.pub('display_pane_view_event', {
      displayPaneIndex: this.displayPaneIndex,
      eventType: 'display_pane_charts_set_overscroll_snapback_inhibit',
      eventData: allowOverscroll,
    }, true, false);
  }

  /**
   * Sends a pan event to this popup's controlled display pane.
   * @param dx The distance to move along the x axis, in pixels.
   * @param dy The distance to move along the y axis, in pixels.
   * @param allowOverscroll Whether to allow overscroll when panning.
   */
  private sendPanEvent(dx: number, dy: number, allowOverscroll: boolean): void {
    this.publisher.pub('display_pane_view_event', {
      displayPaneIndex: this.displayPaneIndex,
      eventType: allowOverscroll ? 'display_pane_charts_change_pan_with_overscroll' : 'display_pane_charts_change_pan',
      eventData: [dx, dy],
    }, true, false);
  }

  /**
   * Sends a rotate event to this popup's controlled display pane.
   * @param direction The rotation direction. A value of `1` indicates clockwise, and a value of `-1` indicates
   * counterclockwise.
   */
  private sendRotateEvent(direction: 1 | -1): void {
    this.publisher.pub('display_pane_view_event', {
      displayPaneIndex: this.displayPaneIndex,
      eventType: 'display_pane_charts_rotate',
      eventData: direction,
    }, true, false);
  }

  /**
   * Responds to when this popup's options button is pressed.
   */
  private onOptionsPressed(): void {
    this.props.gtcService.openPopup(GtcViewKeys.ChartsOptions);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='charts-pan-zoom-control'>
        <div class='charts-pan-zoom-control-header'>
          <ImgTouchButton
            label='Rotate'
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_cht_ccw_rotate.png`}
            onPressed={this.sendRotateEvent.bind(this, -1)}
          />
          <TouchButton
            label={'Charts\nOptions'}
            onPressed={this.onOptionsPressed.bind(this)}
          />
          <ImgTouchButton
            label='Rotate'
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_cht_cw_rotate.png`}
            onPressed={this.sendRotateEvent.bind(this, 1)}
          />
        </div>
        <TouchPad
          ref={this.touchPadRef}
          bus={this.bus}
          onDragStarted={this.onDragStarted.bind(this)}
          onDragTick={this.onDragTick.bind(this)}
          onDragEnded={this.onDragEnded.bind(this)}
          focusOnDrag
          lockFocusOnDrag
          class='charts-pan-zoom-control-touchpad'
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.touchPadRef.getOrDefault()?.destroy();

    super.destroy();
  }
}
