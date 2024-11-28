import { UnsIndex } from '../WTUns1FsInstrument';

/**
 * Indexed UNS-1 CDU events
 */
export class UnsCduHEventMap {
  private readonly prefix = `UNS1_${this.index}`;

  private readonly eventMap: Record<keyof UnsFmcEvents & string, string> = {
    lsk_1_l: `${this.prefix}_LSK_1_L`,
    lsk_2_l: `${this.prefix}_LSK_2_L`,
    lsk_3_l: `${this.prefix}_LSK_3_L`,
    lsk_4_l: `${this.prefix}_LSK_4_L`,
    lsk_5_l: `${this.prefix}_LSK_5_L`,
    lsk_1_r: `${this.prefix}_LSK_1_R`,
    lsk_2_r: `${this.prefix}_LSK_2_R`,
    lsk_3_r: `${this.prefix}_LSK_3_R`,
    lsk_4_r: `${this.prefix}_LSK_4_R`,
    lsk_5_r: `${this.prefix}_LSK_5_R`,
    scratchpad_type: `${this.prefix}_SCRATCHPAD_TYPE`,
    scratchpad_back: `${this.prefix}_SCRATCHPAD_BACK`,
    scratchpad_enter: `${this.prefix}_SCRATCHPAD_ENTER`,
    scratchpad_plus_minus: `${this.prefix}_SCRATCHPAD_PLUS_MINUS`,
    menu: `${this.prefix}_MENU`,
    prev_page: `${this.prefix}_PREV_PAGE`,
    next_page: `${this.prefix}_NEXT_PAGE`,
    mode_key: `${this.prefix}_MODE_KEY`,
    pwr_dim: `${this.prefix}_PWR_DIM`,
  };

  private readonly hEventMap: Record<string, (keyof UnsFmcEvents & string) | undefined> = (() => {
    const obj: Record<string, string> = {};

    for (const [k, v] of Object.entries(this.eventMap)) {
      obj[v] = k;
    }

    return obj as Record<string, keyof UnsFmcEvents & string>;
  })();

  /**
   * Matches an H event string to a UNS FMC event
   *
   * @param hEvent the H event string
   *
   * @returns the UNS FMC event
   */
  public getFmcEventFromHEvent(hEvent: string): [(keyof UnsFmcEvents & string) | undefined, string | undefined] {
    if (hEvent.startsWith(`${this.prefix}_SCRATCHPAD_TYPE`)) {
      const text = hEvent.replace(`${this.prefix}_SCRATCHPAD_TYPE_`, '');

      return ['scratchpad_type', text];
    }

    if (hEvent.startsWith(`${this.prefix}_PWR_DIM`)) {
      return ['mode_key', 'pwr_dim'];
    }

    if (hEvent.startsWith(`${this.prefix}_MODE_KEY`)) {
      const text = hEvent.replace(`${this.prefix}_MODE_KEY_`, '');

      return ['mode_key', text];
    }

    return [this.hEventMap[hEvent], undefined];
  }

  /**
   * Matches a UNS FMC event to an H event string
   *
   * @param event the FMC event key
   *
   * @returns the H event string
   */
  public getHEventFromFmcEvent(event: keyof UnsFmcEvents & string): string {
    return this.eventMap[event];
  }

  /**
   * Constructor
   *
   * @param index the index of the CDU to create the events for
   */
  private constructor(private readonly index: number) {
  }

  private static readonly INSTANCES: Record<UnsIndex, UnsCduHEventMap> = {
    1: new UnsCduHEventMap(1),
    2: new UnsCduHEventMap(2),
    3: new UnsCduHEventMap(3),
  } as const;

  /**
   * Returns an instance of {@link UnsCduHEventMap} for a given index
   *
   * @param index the CDU index
   *
   * @returns an object
   */
  public static forIndex(index: UnsIndex): UnsCduHEventMap {
    return this.INSTANCES[index];
  }
}

export enum UnsModeKey {
  MSG = 'MSG',
  DATA = 'DATA',
  FUEL = 'FUEL',
  TUNE = 'TUNE',
  NAV = 'NAV',
  DTO = 'DTO',
  FPL = 'FPL',
  VNAV = 'VNAV',
  LIST = 'LIST',
  MENU = 'MENU',
  PERF = 'PERF',
}

/**
 * UNS-1 CDU events
 */
export interface UnsFmcEvents {
  /** LSK 1L */
  'lsk_1_l': void,

  /** LSK 2L */
  'lsk_2_l': void,

  /** LSK 3L */
  'lsk_3_l': void,

  /** LSK 4L */
  'lsk_4_l': void,

  /** LSK 5L */
  'lsk_5_l': void,

  /** LSK 1R */
  'lsk_1_r': void,

  /** LSK 2R */
  'lsk_2_r': void,

  /** LSK 3R */
  'lsk_3_r': void,

  /** LSK 4R */
  'lsk_4_r': void,

  /** LSK 5R */
  'lsk_5_r': void,

  /** Scratchpad typing */
  'scratchpad_type': string,

  /** Scratchpad BACK */
  'scratchpad_back': void,

  /** Scratchpad ENTER */
  'scratchpad_enter': void,

  /** Scratchpad +/- */
  'scratchpad_plus_minus': void,

  /** MENU */
  'menu': void

  /** Previous page */
  'prev_page': void,

  /** Next page */
  'next_page': void,

  /** PWR/DIM */
  'pwr_dim': void,

  /** Mode key */
  'mode_key': UnsModeKey,
}

/** CJ4 Control keys */
export const CJ4_CONTROL_KEYS = [
  // 'PWR_DIM'
  'PREV',
  'NEXT',
  'CLR',
  'PLUSMINUS',
  'MSG',
] as const;
/** Control key names */
export type CJ4ControlKeyNames = typeof CJ4_CONTROL_KEYS[number];

export const CJ4_CONTROL_KEYS_TO_UNS_EVENTS: Record<CJ4ControlKeyNames, [keyof UnsFmcEvents, UnsModeKey?]> = {
  PREV: ['prev_page'],
  NEXT: ['next_page'],
  CLR: ['scratchpad_back'],
  PLUSMINUS: ['scratchpad_plus_minus'],
  MSG: ['mode_key', UnsModeKey.MSG],
};

/** CJ4 Function keys */
export const CJ4_FUNCTION_KEYS = [
  'IDX',
  'DSPL_MENU',
  'MFD_DATA',
  'LEGS',
  'DEPARR',
  'DIR',
  'MFD_ADV',
  'FPLN',
  'PERF',
  'TUN',
] as const;
/** Function key names */
export type CJ4FunctionKeyNames = typeof CJ4_FUNCTION_KEYS[number];

export const CJ4_FUNCTION_KEYS_TO_UNS_EVENTS: Record<CJ4FunctionKeyNames, [keyof UnsFmcEvents, UnsModeKey?]> = {
  DIR: ['mode_key', UnsModeKey.DTO],
  FPLN: ['mode_key', UnsModeKey.FPL],
  LEGS: ['mode_key', UnsModeKey.NAV],
  DEPARR: ['mode_key', UnsModeKey.FUEL],
  PERF: ['mode_key', UnsModeKey.PERF],
  DSPL_MENU: ['mode_key', UnsModeKey.MENU],
  MFD_ADV: ['mode_key', UnsModeKey.VNAV],
  MFD_DATA: ['mode_key', UnsModeKey.DATA],
  IDX: ['mode_key', UnsModeKey.LIST],
  TUN: ['mode_key', UnsModeKey.TUNE],
};
