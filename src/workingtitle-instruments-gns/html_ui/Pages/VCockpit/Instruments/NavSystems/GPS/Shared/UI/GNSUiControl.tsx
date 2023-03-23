import {
  FSComponent, HardwareControlListProps, HardwareUiControl, HardwareUiControlList, HardwareUiControlProps, UiControlEventHandler, UiControlEventHandlers,
  UiControlPropEventHandlers, VNode
} from '@microsoft/msfs-sdk';

import { GNSScrollBar } from './GNSScrollBar';
import { InteractionEvent } from './InteractionEvent';

import './GNSUiControl.css';

/** Control event handlers for the GNS UI control classes. */
export type GNSUiControlEvents = Record<InteractionEvent, UiControlEventHandler<GNSUiControl>>

/** Props for the GNSUiControl component. */
export interface GNSUiControlProps extends UiControlPropEventHandlers<GNSUiControlEvents>, HardwareUiControlProps { }

/**
 * A UI control implementation for the GNS430/530 hardware controls.
 */
export class GNSUiControl<P extends GNSUiControlProps = GNSUiControlProps>
  extends HardwareUiControl<GNSUiControlEvents, P>
  implements UiControlEventHandlers<GNSUiControlEvents> {

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    switch (evt) {
      case InteractionEvent.RightInnerInc:
        if (this.props.innerKnobScroll) {
          return this.scroll('forward');
        }
        break;
      case InteractionEvent.RightInnerDec:
        if (this.props.innerKnobScroll) {
          return this.scroll('backward');
        }
        break;
      case InteractionEvent.RightOuterInc:
        return this.scroll('forward');
      case InteractionEvent.RightOuterDec:
        return this.scroll('backward');
    }

    return this.triggerEvent(evt, this);
  }

  /**
   * Handles when the left knob is pushed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onLeftKnobPush(sender: GNSUiControl): boolean {
    return this.props.onLeftKnobPush ? this.props.onLeftKnobPush(sender) : false;
  }

  /**
   * Handles when the left inner knob is decremented.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onLeftInnerDec(sender: GNSUiControl): boolean {
    return this.props.onLeftInnerDec ? this.props.onLeftInnerDec(sender) : false;
  }

  /**
   * Handles when the left inner knob is incremented.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onLeftInnerInc(sender: GNSUiControl): boolean {
    return this.props.onLeftInnerInc ? this.props.onLeftInnerInc(sender) : false;
  }

  /**
   * Handles when the left outer knob is decremented.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onLeftOuterDec(sender: GNSUiControl): boolean {
    return this.props.onLeftOuterDec ? this.props.onLeftOuterDec(sender) : false;
  }

  /**
   * Handles when the left outer knob is incremented.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onLeftOuterInc(sender: GNSUiControl): boolean {
    return this.props.onLeftOuterInc ? this.props.onLeftOuterInc(sender) : false;
  }

  /**
   * Handles when the right knob is pushed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onRightKnobPush(sender: GNSUiControl): boolean {
    return this.props.onRightKnobPush ? this.props.onRightKnobPush(sender) : false;
  }

  /**
   * Handles when the right inner knob is decremented.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onRightInnerDec(sender: GNSUiControl): boolean {
    return this.props.onRightInnerDec ? this.props.onRightInnerDec(sender) : false;
  }

  /**
   * Handles when the right inner knob is incremented.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onRightInnerInc(sender: GNSUiControl): boolean {
    return this.props.onRightInnerInc ? this.props.onRightInnerInc(sender) : false;
  }

  /**
   * Handles when the right outer knob is decremented.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onRightOuterDec(sender: GNSUiControl): boolean {
    return this.props.onRightOuterDec ? this.props.onRightOuterDec(sender) : false;
  }

  /**
   * Handles when the right outer knob is incremented.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onRightOuterInc(sender: GNSUiControl): boolean {
    return this.props.onRightOuterInc ? this.props.onRightOuterInc(sender) : false;
  }

  /**
   * Handles when the CLR button is held down.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onClrLong(sender: GNSUiControl): boolean {
    return this.props.onClrLong ? this.props.onClrLong(sender) : false;
  }

  /**
   * Handles when the CLR button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onClr(sender: GNSUiControl): boolean {
    return this.props.onClr ? this.props.onClr(sender) : false;
  }

  /**
   * Handles when the ENT button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onEnt(sender: GNSUiControl): boolean {
    return this.props.onEnt ? this.props.onEnt(sender) : false;
  }

  /**
   * Handles when the MENU button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onMenu(sender: GNSUiControl): boolean {
    return this.props.onMenu ? this.props.onMenu(sender) : false;
  }

  /**
   * Handles when the direct-to button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onDirectTo(sender: GNSUiControl): boolean {
    return this.props.onDirectTo ? this.props.onDirectTo(sender) : false;
  }

  /**
   * Handles when the range decrease button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onRangeDecrease(sender: GNSUiControl): boolean {
    return this.props.onRangeDecrease ? this.props.onRangeDecrease(sender) : false;
  }

  /**
   * Handles when the range increase button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onRangeIncrease(sender: GNSUiControl): boolean {
    return this.props.onRangeIncrease ? this.props.onRangeIncrease(sender) : false;
  }

  /**
   * Handles when the PROC button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onProc(sender: GNSUiControl): boolean {
    return this.props.onProc ? this.props.onProc(sender) : false;
  }

  /**
   * Handles when the VNAV button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onVnav(sender: GNSUiControl): boolean {
    return this.props.onVnav ? this.props.onVnav(sender) : false;
  }

  /**
   * Handles when the FPL button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onFpl(sender: GNSUiControl): boolean {
    return this.props.onFpl ? this.props.onFpl(sender) : false;
  }

  /**
   * Handles when the MSG buttons is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onMsg(sender: GNSUiControl): boolean {
    return this.props.onMsg ? this.props.onMsg(sender) : false;
  }

  /**
   * Handles when the OBS button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onObs(sender: GNSUiControl): boolean {
    return this.props.onObs ? this.props.onObs(sender) : false;
  }

  /**
   * Handles when the nav swap button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onNavSwap(sender: GNSUiControl): boolean {
    return this.props.onNavSwap ? this.props.onNavSwap(sender) : false;
  }

  /**
   * Handles when the com swap button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onComSwap(sender: GNSUiControl): boolean {
    return this.props.onComSwap ? this.props.onComSwap(sender) : false;
  }

  /**
   * Handles when the CDI button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onCdi(sender: GNSUiControl): boolean {
    return this.props.onCdi ? this.props.onCdi(sender) : false;
  }
}

/** Props on the control list class. */
export interface GNSUiControlListProps<T> extends UiControlPropEventHandlers<GNSUiControlEvents>, HardwareControlListProps<T> { }

/**
 * A control list implementation for the GNS430/530 hardware controls.
 */
export class GNSUiControlList<T, P extends GNSUiControlListProps<T> = GNSUiControlListProps<T>>
  extends HardwareUiControlList<T, GNSUiControlEvents, P>
  implements UiControlEventHandlers<GNSUiControlEvents> {

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    switch (evt) {
      case InteractionEvent.RightInnerInc:
        if (this.props.innerKnobScroll) {
          return this.scroll('forward');
        }
        break;
      case InteractionEvent.RightInnerDec:
        if (this.props.innerKnobScroll) {
          return this.scroll('backward');
        }
        break;
      case InteractionEvent.RightOuterInc:
        return this.scroll('forward');
      case InteractionEvent.RightOuterDec:
        return this.scroll('backward');
    }

    return this.triggerEvent(evt, this);
  }

  /** @inheritdoc */
  protected renderScrollbar(): VNode {
    return (<GNSScrollBar />);
  }

  /**
   * Handles when the left knob is pushed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onLeftKnobPush(sender: GNSUiControl): boolean {
    return this.props.onLeftKnobPush ? this.props.onLeftKnobPush(sender) : false;
  }

  /**
   * Handles when the left inner knob is decremented.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onLeftInnerDec(sender: GNSUiControl): boolean {
    return this.props.onLeftInnerDec ? this.props.onLeftInnerDec(sender) : false;
  }

  /**
   * Handles when the left inner knob is incremented.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onLeftInnerInc(sender: GNSUiControl): boolean {
    return this.props.onLeftInnerInc ? this.props.onLeftInnerInc(sender) : false;
  }

  /**
   * Handles when the left outer knob is decremented.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onLeftOuterDec(sender: GNSUiControl): boolean {
    return this.props.onLeftOuterDec ? this.props.onLeftOuterDec(sender) : false;
  }

  /**
   * Handles when the left outer knob is incremented.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onLeftOuterInc(sender: GNSUiControl): boolean {
    return this.props.onLeftOuterInc ? this.props.onLeftOuterInc(sender) : false;
  }

  /**
   * Handles when the right knob is pushed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onRightKnobPush(sender: GNSUiControl): boolean {
    return this.props.onRightKnobPush ? this.props.onRightKnobPush(sender) : false;
  }

  /**
   * Handles when the right inner knob is decremented.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onRightInnerDec(sender: GNSUiControl): boolean {
    return this.props.onRightInnerDec ? this.props.onRightInnerDec(sender) : false;
  }

  /**
   * Handles when the right inner knob is incremented.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onRightInnerInc(sender: GNSUiControl): boolean {
    return this.props.onRightInnerInc ? this.props.onRightInnerInc(sender) : false;
  }

  /**
   * Handles when the right outer knob is decremented.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onRightOuterDec(sender: GNSUiControl): boolean {
    return this.props.onRightOuterDec ? this.props.onRightOuterDec(sender) : false;
  }

  /**
   * Handles when the right outer knob is incremented.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onRightOuterInc(sender: GNSUiControl): boolean {
    return this.props.onRightOuterInc ? this.props.onRightOuterInc(sender) : false;
  }

  /**
   * Handles when the CLR button is held down.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onClrLong(sender: GNSUiControl): boolean {
    return this.props.onClrLong ? this.props.onClrLong(sender) : false;
  }

  /**
   * Handles when the CLR button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onClr(sender: GNSUiControl): boolean {
    return this.props.onClr ? this.props.onClr(sender) : false;
  }

  /**
   * Handles when the ENT button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onEnt(sender: GNSUiControl): boolean {
    return this.props.onEnt ? this.props.onEnt(sender) : false;
  }

  /**
   * Handles when the MENU button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onMenu(sender: GNSUiControl): boolean {
    return this.props.onMenu ? this.props.onMenu(sender) : false;
  }

  /**
   * Handles when the direct-to button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onDirectTo(sender: GNSUiControl): boolean {
    return this.props.onDirectTo ? this.props.onDirectTo(sender) : false;
  }

  /**
   * Handles when the range decrease button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onRangeDecrease(sender: GNSUiControl): boolean {
    return this.props.onRangeDecrease ? this.props.onRangeDecrease(sender) : false;
  }

  /**
   * Handles when the range increase button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onRangeIncrease(sender: GNSUiControl): boolean {
    return this.props.onRangeIncrease ? this.props.onRangeIncrease(sender) : false;
  }

  /**
   * Handles when the PROC button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onProc(sender: GNSUiControl): boolean {
    return this.props.onProc ? this.props.onProc(sender) : false;
  }

  /**
   * Handles when the VNAV button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onVnav(sender: GNSUiControl): boolean {
    return this.props.onVnav ? this.props.onVnav(sender) : false;
  }

  /**
   * Handles when the FPL button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onFpl(sender: GNSUiControl): boolean {
    return this.props.onFpl ? this.props.onFpl(sender) : false;
  }

  /**
   * Handles when the MSG buttons is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onMsg(sender: GNSUiControl): boolean {
    return this.props.onMsg ? this.props.onMsg(sender) : false;
  }

  /**
   * Handles when the OBS button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onObs(sender: GNSUiControl): boolean {
    return this.props.onObs ? this.props.onObs(sender) : false;
  }

  /**
   * Handles when the nav swap button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onNavSwap(sender: GNSUiControl): boolean {
    return this.props.onNavSwap ? this.props.onNavSwap(sender) : false;
  }

  /**
   * Handles when the com swap button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onComSwap(sender: GNSUiControl): boolean {
    return this.props.onComSwap ? this.props.onComSwap(sender) : false;
  }

  /**
   * Handles when the CDI button is pressed.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onCdi(sender: GNSUiControl): boolean {
    return this.props.onCdi ? this.props.onCdi(sender) : false;
  }
}