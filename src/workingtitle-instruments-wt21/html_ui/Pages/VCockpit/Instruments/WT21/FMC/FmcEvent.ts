export enum FmcPageEvent {
    PAGE_INDEX = 'PAGE_INDEX',
    PAGE_STATUS = 'PAGE_STATUS',
    PAGE_LEGS = 'PAGE_LEGS',
    PAGE_MCDUMENU = 'PAGE_MCDUMENU',
    PAGE_DSPLMENU1 = 'PAGE_DSPLMENU1',
    PAGE_MFDADV = 'PAGE_MFDADV',
    PAGE_MFDDATA = 'PAGE_MFDDATA',
    PAGE_DIR = 'PAGE_DIR',
    PAGE_FPLN = 'PAGE_FPLN',
    PAGE_POSINIT = 'PAGE_POSINIT',
    PAGE_PERF = 'PAGE_PERF',
    PAGE_PERFINIT = 'PAGE_PERFINIT',
    PAGE_TAKEOFFREF = 'PAGE_TAKEOFFREF',
    PAGE_APPROACHREF1 = 'PAGE_APPROACHREF1',
    PAGE_VNAVSETUP = 'PAGE_VNAVSETUP',
    PAGE_FUELMGMT1 = 'PAGE_FUELMGMT1',
    PAGE_FUELMGMT2 = 'PAGE_FUELMGMT2',
    PAGE_FUELMGMT3 = 'PAGE_FUELMGMT3',
    PAGE_FLTLOG = 'PAGE_FLTLOG',
    PAGE_DEPARRIDX = 'PAGE_DEPARRIDX',
    PAGE_DEPART = 'PAGE_DEPART',
    PAGE_ARRIVAL = 'PAGE_ARRIVAL',
    PAGE_DATALINKMENU = 'PAGE_DATALINK',
    PAGE_WEATHER = 'PAGE_WEATHER',
    PAGE_TERMWX_REQ = 'PAGE_TERMWX_REQ',
    PAGE_TERMWX_VIEW = 'PAGE_TERMWX_VIEW',
    PAGE_VORDMECTL = 'PAGE_VORDMECTL',
    PAGE_GNSSCTL = 'PAGE_GNSSCTL',
    PAGE_GNSS1POS = 'PAGE_GNSS1POS',
    PAGE_FREQ = 'PAGE_FREQ',
    PAGE_FIX = 'PAGE_FIX',
    PAGE_PROG = 'PAGE_PROG',
    PAGE_MSG = 'PAGE_MSG',
    PAGE_TUNE = 'PAGE_TUNE',
    PAGE_DEFAULTS = 'PAGE_DEFAULTS',
    PAGE_USERSETTINGS = 'PAGE_USERSETTINGS',
}

export enum FmcSelectKeysEvent {
    LSK_1 = 'LSK_1',
    LSK_2 = 'LSK_2',
    LSK_3 = 'LSK_3',
    LSK_4 = 'LSK_4',
    LSK_5 = 'LSK_5',
    LSK_6 = 'LSK_6',
    RSK_1 = 'RSK_1',
    RSK_2 = 'RSK_2',
    RSK_3 = 'RSK_3',
    RSK_4 = 'RSK_4',
    RSK_5 = 'RSK_5',
    RSK_6 = 'RSK_6',
}

export enum FmcPrevNextEvent {
    BTN_PREV = 'BTN_PREV',
    BTN_NEXT = 'BTN_NEXT',
}

export enum FmcAlphaEvent {
    BTN_A = 'BTN_A',
    BTN_B = 'BTN_B',
    BTN_C = 'BTN_C',
    BTN_D = 'BTN_D',
    BTN_E = 'BTN_E',
    BTN_F = 'BTN_F',
    BTN_G = 'BTN_G',
    BTN_H = 'BTN_H',
    BTN_I = 'BTN_I',
    BTN_J = 'BTN_J',
    BTN_K = 'BTN_K',
    BTN_L = 'BTN_L',
    BTN_M = 'BTN_M',
    BTN_N = 'BTN_N',
    BTN_O = 'BTN_O',
    BTN_P = 'BTN_P',
    BTN_Q = 'BTN_Q',
    BTN_R = 'BTN_R',
    BTN_S = 'BTN_S',
    BTN_T = 'BTN_T',
    BTN_U = 'BTN_U',
    BTN_V = 'BTN_V',
    BTN_W = 'BTN_W',
    BTN_X = 'BTN_X',
    BTN_Y = 'BTN_Y',
    BTN_Z = 'BTN_Z',
    BTN_1 = 'BTN_1',
    BTN_2 = 'BTN_2',
    BTN_3 = 'BTN_3',
    BTN_4 = 'BTN_4',
    BTN_5 = 'BTN_5',
    BTN_6 = 'BTN_6',
    BTN_7 = 'BTN_7',
    BTN_8 = 'BTN_8',
    BTN_9 = 'BTN_9',
    BTN_0 = 'BTN_0',
    BTN_PLUSMINUS = 'BTN_PLUSMINUS',
    BTN_SP = 'BTN_SP',
    BTN_DIV = 'BTN_DIV',
    BTN_DOT = 'BTN_DOT',
}

export enum FmcMiscEvents {
    BTN_CLR_DEL = 'BTN_CLR_DEL',
    BTN_CLR_DEL_LONG = 'BTN_CLR_DEL_LONG',
    BTN_PLUS_MINUS = 'BTN_PLUS_MINUS',
    BTN_EXEC = 'BTN_EXEC'
}

/** A union type for events to be handled by the scratchpad */
export type FmcScratchpadInputEvent = FmcAlphaEvent | FmcMiscEvents.BTN_CLR_DEL | FmcMiscEvents.BTN_CLR_DEL_LONG;

/**
 * Type for all FMC events
 */
export type FmcEvent = FmcPageEvent | FmcSelectKeysEvent | FmcPrevNextEvent | FmcAlphaEvent | FmcMiscEvents
