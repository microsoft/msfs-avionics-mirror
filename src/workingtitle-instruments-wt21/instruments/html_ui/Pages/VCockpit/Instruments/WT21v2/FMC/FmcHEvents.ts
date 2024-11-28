import { FmcAlphaEvent, FmcEvent, FmcMiscEvents, FmcPageEvent, FmcPrevNextEvent, FmcSelectKeysEvent } from './FmcEvent';

const WT21_H_EVENT_FMC_REGEX = /[a-zA-Z0-9]+_FMC_([12])_(.*)/;

/**
 * Object index signature for fmcEventMap
 */
type FmcEventMapType = { [k in string]: FmcEvent };
const fmcEventMap: FmcEventMapType = {
  'BTN_IDX': FmcPageEvent.PAGE_INDEX,
  'BTN_FPLN': FmcPageEvent.PAGE_FPLN,
  'BTN_DEPARR': FmcPageEvent.PAGE_DEPARRIDX,
  'BTN_LEGS': FmcPageEvent.PAGE_LEGS,
  'BTN_DSPL_MENU': FmcPageEvent.PAGE_DSPLMENU1,
  'BTN_MFD_ADV': FmcPageEvent.PAGE_MFDADV,
  'BTN_MFD_DATA': FmcPageEvent.PAGE_MFDDATA,
  'BTN_DIR': FmcPageEvent.PAGE_DIR,
  'BTN_PERF': FmcPageEvent.PAGE_PERF,
  'BTN_MSG': FmcPageEvent.PAGE_MSG,
  'BTN_TUN': FmcPageEvent.PAGE_TUNE,
  'BTN_L1': FmcSelectKeysEvent.LSK_1,
  'BTN_L2': FmcSelectKeysEvent.LSK_2,
  'BTN_L3': FmcSelectKeysEvent.LSK_3,
  'BTN_L4': FmcSelectKeysEvent.LSK_4,
  'BTN_L5': FmcSelectKeysEvent.LSK_5,
  'BTN_L6': FmcSelectKeysEvent.LSK_6,
  'BTN_R1': FmcSelectKeysEvent.RSK_1,
  'BTN_R2': FmcSelectKeysEvent.RSK_2,
  'BTN_R3': FmcSelectKeysEvent.RSK_3,
  'BTN_R4': FmcSelectKeysEvent.RSK_4,
  'BTN_R5': FmcSelectKeysEvent.RSK_5,
  'BTN_R6': FmcSelectKeysEvent.RSK_6,
  'BTN_PREVPAGE': FmcPrevNextEvent.BTN_PREV,
  'BTN_NEXTPAGE': FmcPrevNextEvent.BTN_NEXT,
  'BTN_A': FmcAlphaEvent.BTN_A,
  'BTN_B': FmcAlphaEvent.BTN_B,
  'BTN_C': FmcAlphaEvent.BTN_C,
  'BTN_D': FmcAlphaEvent.BTN_D,
  'BTN_E': FmcAlphaEvent.BTN_E,
  'BTN_F': FmcAlphaEvent.BTN_F,
  'BTN_G': FmcAlphaEvent.BTN_G,
  'BTN_H': FmcAlphaEvent.BTN_H,
  'BTN_I': FmcAlphaEvent.BTN_I,
  'BTN_J': FmcAlphaEvent.BTN_J,
  'BTN_K': FmcAlphaEvent.BTN_K,
  'BTN_L': FmcAlphaEvent.BTN_L,
  'BTN_M': FmcAlphaEvent.BTN_M,
  'BTN_N': FmcAlphaEvent.BTN_N,
  'BTN_O': FmcAlphaEvent.BTN_O,
  'BTN_P': FmcAlphaEvent.BTN_P,
  'BTN_Q': FmcAlphaEvent.BTN_Q,
  'BTN_R': FmcAlphaEvent.BTN_R,
  'BTN_S': FmcAlphaEvent.BTN_S,
  'BTN_T': FmcAlphaEvent.BTN_T,
  'BTN_U': FmcAlphaEvent.BTN_U,
  'BTN_V': FmcAlphaEvent.BTN_V,
  'BTN_W': FmcAlphaEvent.BTN_W,
  'BTN_X': FmcAlphaEvent.BTN_X,
  'BTN_Y': FmcAlphaEvent.BTN_Y,
  'BTN_Z': FmcAlphaEvent.BTN_Z,
  'BTN_1': FmcAlphaEvent.BTN_1,
  'BTN_2': FmcAlphaEvent.BTN_2,
  'BTN_3': FmcAlphaEvent.BTN_3,
  'BTN_4': FmcAlphaEvent.BTN_4,
  'BTN_5': FmcAlphaEvent.BTN_5,
  'BTN_6': FmcAlphaEvent.BTN_6,
  'BTN_7': FmcAlphaEvent.BTN_7,
  'BTN_8': FmcAlphaEvent.BTN_8,
  'BTN_9': FmcAlphaEvent.BTN_9,
  'BTN_0': FmcAlphaEvent.BTN_0,
  'BTN_PLUSMINUS': FmcAlphaEvent.BTN_PLUSMINUS,
  'BTN_SP': FmcAlphaEvent.BTN_SP,
  'BTN_DIV': FmcAlphaEvent.BTN_DIV,
  'BTN_DOT': FmcAlphaEvent.BTN_DOT,
  'BTN_CLR': FmcMiscEvents.BTN_CLR_DEL,
  'BTN_CLR_LONG': FmcMiscEvents.BTN_CLR_DEL_LONG,
  'BTN_EXEC': FmcMiscEvents.BTN_EXEC,
};

/**
 * Maps an H event to an FmcEvent
 * @param hEvent the raw H event string
 * @param instrumentIndex the instrument index
 * @returns FmcEvent the mapped event
 * @throws if the event is invalid or unmapped
 */
export function mapHEventToFmcEvent(hEvent: string, instrumentIndex: number): FmcEvent | undefined {
  const hEventWithoutPrefix = WT21_H_EVENT_FMC_REGEX[Symbol.match](hEvent);
  if (hEventWithoutPrefix !== null) {
    const evtIndex = hEventWithoutPrefix[1];
    if (Number(evtIndex) !== instrumentIndex) {
      return undefined;
    }
    const btnName = hEventWithoutPrefix[2];

    if (!btnName) {
      // We don't need this event in the FMC.
      return;
    }

    const mappedEvent = fmcEventMap[btnName.toUpperCase()];

    if (mappedEvent === undefined) {
      throw new Error(`[mapHEventToFmcEvent] Unmapped H event '${btnName}'.`);
    }

    return mappedEvent;
  }

  return undefined;

}
