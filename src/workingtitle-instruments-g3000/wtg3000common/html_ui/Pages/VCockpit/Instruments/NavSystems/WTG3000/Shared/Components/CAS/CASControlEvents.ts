/** Base events for controlling CAS scrolling and GTC inputs. */
type CASControlEventsRoot = {
  /** Whether or not upward scrolling is available on the indexed GTC. */
  cas_scroll_up_enable: boolean;
  /** Whether or not downward scrolling is available on the indexed GTC. */
  cas_scroll_down_enable: boolean;
  /** Command an upward scroll of the CAS display fron the indexed GTC. */
  cas_scroll_up: boolean;
  /** Command an downward scroll of the CAS display from the indexed GTC. */
  cas_scroll_down: boolean;
}

/** Indexed versions of the CAS control events. */
type CASControlEventsIndexed<Index extends number> = {
  [Event in keyof CASControlEventsRoot as `${Event}_${Index}`]: CASControlEventsRoot[Event]
}

/** Events for the control of CAS scrolling. */
export interface CASControlEvents extends
  CASControlEventsIndexed<1>,
  CASControlEventsIndexed<2> {
}