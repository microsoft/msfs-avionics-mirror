import { HardwareUiControl, HardwareUiControlProps, Subject, UiControlEventHandler, UiControlEventHandlers, UiControlPropEventHandlers, VNode } from '@microsoft/msfs-sdk';

import { GuiHEvent } from './GuiHEvent';

/**
 * HardwareUiControl events for GUI interaction H events.
 */
export type GuiUiControlEvents = Record<GuiHEvent, UiControlEventHandler<WT21UiControl>>

/** Properties on the WT21UiControl component. */
export interface WT21UiControlProps extends UiControlPropEventHandlers<GuiUiControlEvents>, HardwareUiControlProps {
  /** If this control should be disabled */
  disabled?: boolean;

  /** Custom CSS classes for this element */
  cssClasses?: Subject<string>;
}

/**
 * A component that forms the base of the WT21 UI control system.
 */
export abstract class WT21UiControl<P extends WT21UiControlProps = WT21UiControlProps>
  extends HardwareUiControl<GuiUiControlEvents, P>
  implements UiControlEventHandlers<GuiUiControlEvents> {

  public static readonly FOCUS_CLASS = 'highlight';

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    if (this.props.disabled) {
      this.setDisabled(true);
    }
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: GuiHEvent): boolean {
    switch (evt) {
      case GuiHEvent.UPPER_INC:
        if (this.props.innerKnobScroll) {
          return this.scroll('forward');
        }
        break;
      case GuiHEvent.UPPER_DEC:
        if (this.props.innerKnobScroll) {
          return this.scroll('backward');
        }
        break;
      case GuiHEvent.LOWER_INC:
        return this.scroll('forward');
      case GuiHEvent.LOWER_DEC:
        return this.scroll('backward');
    }

    return this.triggerEvent(evt, this);
  }

  /**
   * Handles GUI upper knob increase events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onUpperKnobInc(source: WT21UiControl): boolean {
    return this.props.onUpperKnobInc ? this.props.onUpperKnobInc(source) : false;
  }

  /**
   * Handles GUI upper knob decrease events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onUpperKnobDec(source: WT21UiControl): boolean {
    return this.props.onUpperKnobDec ? this.props.onUpperKnobDec(source) : false;
  }

  /**
   * Handles GUI lower knob increase events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onLowerKnobInc(source: WT21UiControl): boolean {
    return this.props.onLowerKnobInc ? this.props.onLowerKnobInc(source) : false;
  }

  /**
   * Handles GUI lower knob decrease events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onLowerKnobDec(source: WT21UiControl): boolean {
    return this.props.onLowerKnobDec ? this.props.onLowerKnobDec(source) : false;
  }

  /**
   * Handles upper knob push events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onUpperKnobPush(source: WT21UiControl): boolean {
    return this.props.onUpperKnobPush ? this.props.onUpperKnobPush(source) : false;
  }

  /**
   * Handles PFD menu push events. (not implemented)
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onPfdMenuPush(source: WT21UiControl): boolean {
    return false;
  }

  /**
   * Handles REFS menu push events. (not implemented)
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onRefsMenuPush(source: WT21UiControl): boolean {
    return false;
  }

  /**
   * Handles PFD esc events. (not implemented)
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onPfdEsc(source: WT21UiControl): boolean {
    return false;
  }

  /**
   * Handles MFD UPR menu push events. (not implemented)
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onUpperMenuPush(source: WT21UiControl): boolean {
    return false;
  }

  /**
   * Handles MFD LWR menu push events. (not implemented)
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onLowerMenuPush(source: WT21UiControl): boolean {
    return false;
  }

  /**
   * Handles MFD esc events. (not implemented)
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onMfdEsc(source: WT21UiControl): boolean {
    return false;
  }


  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onSoftkey1L(source: WT21UiControl): boolean {
    return false;
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onSoftkey2L(source: WT21UiControl): boolean {
    return false;
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onSoftkey3L(source: WT21UiControl): boolean {
    return false;
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onSoftkey4L(source: WT21UiControl): boolean {
    return false;
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onSoftkey1R(source: WT21UiControl): boolean {
    return false;
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onSoftkey2R(source: WT21UiControl): boolean {
    return false;
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onSoftkey3R(source: WT21UiControl): boolean {
    return false;
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onSoftkey4R(source: WT21UiControl): boolean {
    return false;
  }
}