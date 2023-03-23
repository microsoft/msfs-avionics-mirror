/** CcpControlEvents */
export interface CcpControlEvents {
  /** State of the EIS. */
  ccp_eng_state: EngineIndicationDisplayMode;
  /** State of the SYS overlay window. */
  ccp_sys_state: 'off' | '1' | '2';
}

export enum EngineIndicationDisplayMode {
  Compressed,
  Expanded
}