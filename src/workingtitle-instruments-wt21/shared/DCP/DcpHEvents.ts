import { DcpEvent } from './DcpEvent';

export const WT21_H_EVENT_GENERIC_UPR_REGEX = /Generic_Upr_([12])_(.*)/;


/** Object index signature for dcpEventMap */
type DcpEventMapType = { [k in string]: DcpEvent };

const dcpEventMap: DcpEventMapType = {
    'Push_NAV': DcpEvent.DCP_NAV,
    'Push_PFD_MENU': DcpEvent.DCP_PFD_MENU,
    'Push_ESC': DcpEvent.DCP_ESC,
    'Push_ET': DcpEvent.DCP_ET,
    'Push_FRMT': DcpEvent.DCP_FRMT,
    'Push_TERR_WX': DcpEvent.DCP_TERR_WX,
    'Push_TFC': DcpEvent.DCP_TFC,
    // A few buttons are not pushable (yet?).
    // 'Push_': DcpEvent.DCP_CCP_MENU,
    'Push_REFS_MENU': DcpEvent.DCP_REFS_MENU,
    // 'Push_': DcpEvent.DCP_RADAR_MENU,
    // 'Push_': DcpEvent.DCP_TAWS_MENU,
    'MENU_ADV_INC': DcpEvent.DCP_MENU_ADV_INC,
    'MENU_ADV_DEC': DcpEvent.DCP_MENU_ADV_DEC,
    'DATA_INC': DcpEvent.DCP_DATA_INC,
    'DATA_DEC': DcpEvent.DCP_DATA_DEC,
    'DATA_PUSH': DcpEvent.DCP_DATA_PUSH,
    'TILT_INC': DcpEvent.DCP_TILT_INC,
    'TILT_DEC': DcpEvent.DCP_TILT_DEC,
    'TILT_PUSH': DcpEvent.DCP_TILT_PUSH,
    'RANGE_INC': DcpEvent.DCP_RANGE_INC,
    'RANGE_DEC': DcpEvent.DCP_RANGE_DEC,
};

/** HEvents for the DCP */
export class DcpHEvents {
    /**
     * Maps an H event to an DcpEvent
     * @param hEvent the raw H event string
     * @returns DcpEvent the mapped event
     * @throws if the event is invalid or unmapped
     */
    public static mapHEventToDcpEvent(hEvent: string): DcpEvent | undefined {
        const hEventWithoutPrefix = WT21_H_EVENT_GENERIC_UPR_REGEX[Symbol.match](hEvent);

        const btnName = hEventWithoutPrefix?.[2];

        if (!btnName) {
            // We don't need this event in the DCP.
            return undefined;
        }

        const mappedEvent = dcpEventMap[btnName];

        if (mappedEvent === undefined) {
            throw new Error(`[mapHEventToDcpEvent] Unmapped H event '${btnName}' not in event map.`);
        } else if (mappedEvent === DcpEvent.DCP_RANGE_INC || mappedEvent === DcpEvent.DCP_RANGE_DEC) {
            // special handling for map range indexing (pilot/copilot side)
            return undefined;
        }

        return mappedEvent;
    }
}