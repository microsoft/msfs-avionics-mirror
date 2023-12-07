/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  FSComponent, HardwareControlListProps, HardwareUiControl, HardwareUiControlList, HardwareUiControlProps, UiControlEventHandler, UiControlEventHandlers,
  UiControlPropEventHandlers, VNode
} from '@microsoft/msfs-sdk';

import { FmsHEvent } from './FmsHEvent';
import { ScrollBar } from './ScrollBar';

import './G1000UiControlList.css';

/**
 * HardwareUiControl events for Fms interaction H events.
 */
export type FmsUiControlEvents = Record<FmsHEvent, UiControlEventHandler<G1000UiControl>>

/** Properties on the G1000UiControl component. */
export interface G1000UiControlProps extends UiControlPropEventHandlers<FmsUiControlEvents>, HardwareUiControlProps {
}

/**
 * A component that forms the base of the G1000 UI control system.
 */
export class G1000UiControl<P extends G1000UiControlProps = G1000UiControlProps>
  extends HardwareUiControl<FmsUiControlEvents, P>
  implements UiControlEventHandlers<FmsUiControlEvents> {

  /** @inheritdoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.UPPER_INC:
        if (this.props.innerKnobScroll) {
          return this.scroll('forward');
        }
        break;
      case FmsHEvent.UPPER_DEC:
        if (this.props.innerKnobScroll) {
          return this.scroll('backward');
        }
        break;
      case FmsHEvent.LOWER_INC:
        return this.scroll('forward');
      case FmsHEvent.LOWER_DEC:
        return this.scroll('backward');
    }

    return this.triggerEvent(evt, this);
  }

  /**
   * Handles FMS upper knob increase events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onUpperKnobInc(source: G1000UiControl): boolean {
    return this.props.onUpperKnobInc ? this.props.onUpperKnobInc(source) : false;
  }

  /**
   * Handles FMS upper knob decrease events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onUpperKnobDec(source: G1000UiControl): boolean {
    return this.props.onUpperKnobDec ? this.props.onUpperKnobDec(source) : false;
  }

  /**
   * Handles FMS lower knob increase events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onLowerKnobInc(source: G1000UiControl): boolean {
    return this.props.onLowerKnobInc ? this.props.onLowerKnobInc(source) : false;
  }

  /**
   * Handles FMS lower knob decrease events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onLowerKnobDec(source: G1000UiControl): boolean {
    return this.props.onLowerKnobDec ? this.props.onLowerKnobDec(source) : false;
  }

  /**
   * Handles FMS upper knob push events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onUpperKnobPush(source: G1000UiControl): boolean {
    return this.props.onUpperKnobPush ? this.props.onUpperKnobPush(source) : false;
  }

  /**
   * Handles MENU button press events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onMenu(source: G1000UiControl): boolean {
    return this.props.onMenu ? this.props.onMenu(source) : false;
  }

  /**
   * Handles ENTER button press events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onEnter(source: G1000UiControl): boolean {
    return this.props.onEnter ? this.props.onEnter(source) : false;
  }

  /**
   * Handles CLR button press events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onClr(source: G1000UiControl): boolean {
    return this.props.onClr ? this.props.onClr(source) : false;
  }

  /**
   * Handles CLR button long press events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onClrLong(source: G1000UiControl): boolean {
    return this.props.onClrLong ? this.props.onClrLong(source) : false;
  }

  /**
   * Handles DRCT button press events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onDirectTo(source: G1000UiControl): boolean {
    return this.props.onDirectTo ? this.props.onDirectTo(source) : false;
  }

  /**
   * Handles FPL button press events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onFPL(source: G1000UiControl): boolean {
    return this.props.onFPL ? this.props.onFPL(source) : false;
  }

  /**
   * Handles PROC button press events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onProc(source: G1000UiControl): boolean {
    return this.props.onProc ? this.props.onProc(source) : false;
  }

  /**
   * Handles range joystick increase events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onRangeInc(source: G1000UiControl): boolean {
    return this.props.onRangeInc ? this.props.onRangeInc(source) : false;
  }

  /**
   * Handles range joystick decrease events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onRangeDec(source: G1000UiControl): boolean {
    return this.props.onRangeDec ? this.props.onRangeDec(source) : false;
  }

  /**
   * Handles range joystick push events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onJoystickPush(source: G1000UiControl): boolean {
    return this.props.onJoystickPush ? this.props.onJoystickPush(source) : false;
  }

  /**
   * Handles range joystick left deflection events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onJoystickLeft(source: G1000UiControl): boolean {
    return this.props.onJoystickLeft ? this.props.onJoystickLeft(source) : false;
  }

  /**
   * Handles range joystick up deflection events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onJoystickUp(source: G1000UiControl): boolean {
    return this.props.onJoystickUp ? this.props.onJoystickUp(source) : false;
  }

  /**
   * Handles range joystick right deflection events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onJoystickRight(source: G1000UiControl): boolean {
    return this.props.onJoystickRight ? this.props.onJoystickRight(source) : false;
  }

  /**
   * Handles range joystick down deflection events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onJoystickDown(source: G1000UiControl): boolean {
    return this.props.onJoystickDown ? this.props.onJoystickDown(source) : false;
  }

  /**
   * Handles the A key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onA(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.A);
  }

  /**
   * Handles the B key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onB(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.B);
  }

  /**
   * Handles the C key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onC(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.C);
  }

  /**
   * Handles the D key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onD(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D);
  }

  /**
   * Handles the E key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onE(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.E);
  }

  /**
   * Handles the F key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onF(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.F);
  }

  /**
   * Handles the G key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onG(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.G);
  }

  /**
   * Handles the H key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onH(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.H);
  }

  /**
   * Handles the I key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onI(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.I);
  }

  /**
   * Handles the J key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onJ(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.J);
  }

  /**
   * Handles the K key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onK(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.K);
  }

  /**
   * Handles the L key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onL(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.L);
  }

  /**
   * Handles the M key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onM(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.M);
  }

  /**
   * Handles the N key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onN(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.N);
  }

  /**
   * Handles the O key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onO(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.O);
  }

  /**
   * Handles the P key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onP(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.P);
  }

  /**
   * Handles the Q key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onQ(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.Q);
  }

  /**
   * Handles the R key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onR(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.R);
  }

  /**
   * Handles the S key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onS(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.S);
  }

  /**
   * Handles the T key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onT(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.T);
  }

  /**
   * Handles the U key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onU(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.U);
  }

  /**
   * Handles the V key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onV(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.V);
  }

  /**
   * Handles the W key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onW(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.W);
  }

  /**
   * Handles the X key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onX(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.X);
  }

  /**
   * Handles the Y key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onY(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.Y);
  }

  /**
   * Handles the Z key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onZ(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.Z);
  }

  /**
   * Handles the  key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onSPC(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.SPC);
  }

  /**
   * Handles the 0 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on0(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D0);
  }

  /**
   * Handles the 1 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on1(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D1);
  }

  /**
   * Handles the 2 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on2(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D2);
  }

  /**
   * Handles the 3 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on3(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D3);
  }

  /**
   * Handles the 4 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on4(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D4);
  }

  /**
   * Handles the 5 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on5(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D5);
  }

  /**
   * Handles the 6 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on6(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D6);
  }

  /**
   * Handles the 7 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on7(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D7);
  }

  /**
   * Handles the 8 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on8(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D8);
  }

  /**
   * Handles the 9 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on9(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D9);
  }

  /**
   * Handles the Dot key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onDot(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.Dot);
  }

  /**
   * Handles the BKSP key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onBKSP(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.BKSP);
  }

  /**
   * Handles the +/- key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onPlusMinus(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.PlusMinus);
  }

  /**
   * Handles the Home key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onHome(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.HOME);
  }

  /**
   * Handles the COM key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onCom(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.COM);
  }

  /**
   * Handles the NAV key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onNav(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.NAV);
  }

  /**
   * Handles the XPDR key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onXpdr(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.XPDR);
  }

  /**
   * Handles the CRS key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onCrs(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.CRS);
  }

  /**
   * Consolidates all key events and allows sub classes to override and implement specific keyboard input behaviors.
   * @param source The source of the event.
   * @param evt FmsHEvent of the keyboard event.
   * @returns always false for the top level version of the method.
   */
  public consolidateKeyboardHEvent(source: G1000UiControl, evt: FmsHEvent): boolean {
    return false;
  }

}

/** Properties on the GarminControlList component. */
export interface GarminControlListProps<T> extends UiControlPropEventHandlers<FmsUiControlEvents>, HardwareUiControlProps, HardwareControlListProps<T> {
}

/**
 * A component that holds lists of G1000UiControls.
 */
export class G1000ControlList<T>
  extends HardwareUiControlList<T, FmsUiControlEvents, GarminControlListProps<T>>
  implements UiControlEventHandlers<FmsUiControlEvents> {

  /** @inheritdoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.UPPER_INC:
        if (this.props.innerKnobScroll) {
          return this.scroll('forward');
        }
        break;
      case FmsHEvent.UPPER_DEC:
        if (this.props.innerKnobScroll) {
          return this.scroll('backward');
        }
        break;
      case FmsHEvent.LOWER_INC:
        return this.scroll('forward');
      case FmsHEvent.LOWER_DEC:
        return this.scroll('backward');
    }

    return this.triggerEvent(evt, this);
  }

  /**
   * Handles FMS upper knob increase events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onUpperKnobInc(source: G1000UiControl): boolean {
    return this.props.onUpperKnobInc ? this.props.onUpperKnobInc(source) : false;
  }

  /**
   * Handles FMS upper knob decrease events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onUpperKnobDec(source: G1000UiControl): boolean {
    return this.props.onUpperKnobDec ? this.props.onUpperKnobDec(source) : false;
  }

  /**
   * Handles FMS lower knob increase events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onLowerKnobInc(source: G1000UiControl): boolean {
    return this.props.onLowerKnobInc ? this.props.onLowerKnobInc(source) : false;
  }

  /**
   * Handles FMS lower knob decrease events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onLowerKnobDec(source: G1000UiControl): boolean {
    return this.props.onLowerKnobDec ? this.props.onLowerKnobDec(source) : false;
  }

  /**
   * Handles FMS upper knob push events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onUpperKnobPush(source: G1000UiControl): boolean {
    return this.props.onUpperKnobPush ? this.props.onUpperKnobPush(source) : false;
  }

  /**
   * Handles MENU button press events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onMenu(source: G1000UiControl): boolean {
    return this.props.onMenu ? this.props.onMenu(source) : false;
  }

  /**
   * Handles ENTER button press events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onEnter(source: G1000UiControl): boolean {
    return this.props.onEnter ? this.props.onEnter(source) : false;
  }

  /**
   * Handles CLR button press events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onClr(source: G1000UiControl): boolean {
    return this.props.onClr ? this.props.onClr(source) : false;
  }

  /**
   * Handles CLR button long press events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onClrLong(source: G1000UiControl): boolean {
    return this.props.onClrLong ? this.props.onClrLong(source) : false;
  }

  /**
   * Handles DRCT button press events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onDirectTo(source: G1000UiControl): boolean {
    return this.props.onDirectTo ? this.props.onDirectTo(source) : false;
  }

  /**
   * Handles FPL button press events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onFPL(source: G1000UiControl): boolean {
    return this.props.onFPL ? this.props.onFPL(source) : false;
  }

  /**
   * Handles PROC button press events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onProc(source: G1000UiControl): boolean {
    return this.props.onProc ? this.props.onProc(source) : false;
  }

  /**
   * Handles range joystick increase events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onRangeInc(source: G1000UiControl): boolean {
    return this.props.onRangeInc ? this.props.onRangeInc(source) : false;
  }

  /**
   * Handles range joystick decrease events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onRangeDec(source: G1000UiControl): boolean {
    return this.props.onRangeDec ? this.props.onRangeDec(source) : false;
  }

  /**
   * Handles range joystick push events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onJoystickPush(source: G1000UiControl): boolean {
    return this.props.onJoystickPush ? this.props.onJoystickPush(source) : false;
  }

  /**
   * Handles range joystick left deflection events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onJoystickLeft(source: G1000UiControl): boolean {
    return this.props.onJoystickLeft ? this.props.onJoystickLeft(source) : false;
  }

  /**
   * Handles range joystick up deflection events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onJoystickUp(source: G1000UiControl): boolean {
    return this.props.onJoystickUp ? this.props.onJoystickUp(source) : false;
  }

  /**
   * Handles range joystick right deflection events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onJoystickRight(source: G1000UiControl): boolean {
    return this.props.onJoystickRight ? this.props.onJoystickRight(source) : false;
  }

  /**
   * Handles range joystick down deflection events.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onJoystickDown(source: G1000UiControl): boolean {
    return this.props.onJoystickDown ? this.props.onJoystickDown(source) : false;
  }

  /**
   * Handles the A key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onA(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.A);
  }

  /**
   * Handles the B key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onB(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.B);
  }

  /**
   * Handles the C key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onC(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.C);
  }

  /**
   * Handles the D key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onD(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D);
  }

  /**
   * Handles the E key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onE(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.E);
  }

  /**
   * Handles the F key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onF(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.F);
  }

  /**
   * Handles the G key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onG(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.G);
  }

  /**
   * Handles the H key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onH(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.H);
  }

  /**
   * Handles the I key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onI(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.I);
  }

  /**
   * Handles the J key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onJ(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.J);
  }

  /**
   * Handles the K key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onK(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.K);
  }

  /**
   * Handles the L key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onL(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.L);
  }

  /**
   * Handles the M key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onM(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.M);
  }

  /**
   * Handles the N key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onN(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.N);
  }

  /**
   * Handles the O key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onO(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.O);
  }

  /**
   * Handles the P key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onP(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.P);
  }

  /**
   * Handles the Q key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onQ(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.Q);
  }

  /**
   * Handles the R key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onR(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.R);
  }

  /**
   * Handles the S key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onS(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.S);
  }

  /**
   * Handles the T key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onT(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.T);
  }

  /**
   * Handles the U key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onU(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.U);
  }

  /**
   * Handles the V key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onV(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.V);
  }

  /**
   * Handles the W key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onW(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.W);
  }

  /**
   * Handles the X key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onX(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.X);
  }

  /**
   * Handles the Y key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onY(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.Y);
  }

  /**
   * Handles the Z key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onZ(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.Z);
  }

  /**
   * Handles the  key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onSPC(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.SPC);
  }

  /**
   * Handles the 0 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on0(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D0);
  }

  /**
   * Handles the 1 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on1(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D1);
  }

  /**
   * Handles the 2 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on2(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D2);
  }

  /**
   * Handles the 3 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on3(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D3);
  }

  /**
   * Handles the 4 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on4(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D4);
  }

  /**
   * Handles the 5 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on5(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D5);
  }

  /**
   * Handles the 6 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on6(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D6);
  }

  /**
   * Handles the 7 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on7(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D7);
  }

  /**
   * Handles the 8 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on8(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D8);
  }

  /**
   * Handles the 9 key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public on9(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.D9);
  }

  /**
   * Handles the Dot key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onDot(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.Dot);
  }

  /**
   * Handles the BKSP key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onBKSP(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.BKSP);
  }

  /**
   * Handles the +/- key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onPlusMinus(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.PlusMinus);
  }

  /**
   * Handles the Home key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onHome(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.HOME);
  }

  /**
   * Handles the COM key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onCom(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.COM);
  }

  /**
   * Handles the NAV key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onNav(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.NAV);
  }

  /**
   * Handles the XPDR key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onXpdr(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.XPDR);
  }

  /**
   * Handles the CRS key.
   * @param source The source of the event.
   * @returns Whether the event was handled.
   */
  public onCrs(source: G1000UiControl): boolean {
    return this.consolidateKeyboardHEvent(source, FmsHEvent.CRS);
  }

  /**
   * Consolidates all key events and allows sub classes to override and implement specific keyboard input behaviors.
   * @param source The source of the event.
   * @param evt FmsHEvent of the keyboard event.
   * @returns always false for the top level version of the method.
   */
  public consolidateKeyboardHEvent(source: G1000UiControl, evt: FmsHEvent): boolean {
    return false;
  }




  /** @inheritdoc */
  protected renderScrollbar(): VNode {
    return (<ScrollBar />);
  }
}
