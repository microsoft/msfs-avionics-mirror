/** Events from transponder view */
export interface TransponderViewEvents {
  /**
   * XDPR view code state
   */
  xpdr_view_code_state: 'invalid' | 'unchanged' | 'changed';
}