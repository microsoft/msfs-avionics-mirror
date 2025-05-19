import { CcpEvent } from './CcpEvent';

const WT21_H_EVENT_GENERIC_LWR_REGEX = /Generic_Lwr_([12])_(.*)/;

/** Object index signature for dcpEventMap */
type CcpEventMapType = { [k in string]: CcpEvent };

const dcpEventMap: CcpEventMapType = {
  Push_UPR_MENU: CcpEvent.CCP_UPR_MENU,
  Push_ESC: CcpEvent.CCP_ESC,
  // Push_: CcpEvent.CCP_DATABASE,
  Push_NAV_DATA: CcpEvent.CCP_NAV_DATA,
  // Push_: CcpEvent.CCP_CHART,
  Push_CAS_PAGE: CcpEvent.CCP_CAS_PAGE,
  Push_LWR_MENU: CcpEvent.CCP_LWR_MENU,
  // Push_: CcpEvent.CCP_CURSR,
  Push_ENG: CcpEvent.CCP_ENG,
  Push_TERR_WX: CcpEvent.CCP_TERR_WX,
  Push_TFC: CcpEvent.CCP_TFC,
  Push_MEM1: CcpEvent.CCP_MEM_1,
  Push_MEM2: CcpEvent.CCP_MEM_2,
  Push_MEM3: CcpEvent.CCP_MEM_3,
  Hold_MEM1: CcpEvent.CCP_MEM_1_LONG,
  Hold_MEM2: CcpEvent.CCP_MEM_2_LONG,
  Hold_MEM3: CcpEvent.CCP_MEM_3_LONG,
  // Push_: CcpEvent.CCP_ROTATE,
  Push_ZOOM_INC: CcpEvent.CCP_ZOOM_INC,
  Push_ZOOM_DEC: CcpEvent.CCP_ZOOM_DEC,
  Push_SYS: CcpEvent.CCP_SYS,
  Push_CKLST: CcpEvent.CCP_CKLST,
  // Push_: CcpEvent.CCP_PASS_BRIEF,
  Push_MENU_ADV_INC: CcpEvent.CCP_MENU_ADV_INC,
  Push_MENU_ADV_DEC: CcpEvent.CCP_MENU_ADV_DEC,
  Push_DATA_INC: CcpEvent.CCP_DATA_INC,
  Push_DATA_DEC: CcpEvent.CCP_DATA_DEC,
  Push_DATA_PUSH: CcpEvent.CCP_DATA_PUSH,
  JOYSTICK_UP: CcpEvent.CCP_JOYSTICK_UP,
  JOYSTICK_RIGHT: CcpEvent.CCP_JOYSTICK_RIGHT,
  JOYSTICK_DOWN: CcpEvent.CCP_JOYSTICK_DOWN,
  JOYSTICK_LEFT: CcpEvent.CCP_JOYSTICK_LEFT,
};

/** HEvents for the CCP */
export class CcpHEvents {
  /**
   * Maps an H event to an CcpEvent
   * @param hEvent the raw H event string
   * @param instrumentIndex the index of the instrument
   * @returns CcpEvent the mapped event
   */
  public static mapHEventToCcpEvent(hEvent: string, instrumentIndex: number): CcpEvent | undefined {
    const hEventWithoutPrefix = WT21_H_EVENT_GENERIC_LWR_REGEX[Symbol.match](hEvent);

    if (hEventWithoutPrefix !== null) {
      const evtIndex = hEventWithoutPrefix[1];
      if (Number(evtIndex) === instrumentIndex) {
        const evt = dcpEventMap[hEventWithoutPrefix[2]];
        if (evt !== undefined) {
          return evt;
        }
      }
    }

    return;
  }
}
