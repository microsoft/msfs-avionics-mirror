/** Events related to the use of the GNS as a source of external guidance */
export interface ExternalSourceEvents {
  /** Whether the GNS is available as an external flight plan source. */
  [g3x_fpl_source_external_available: `g3x_fpl_source_external_available_${number}`]: boolean;
}
