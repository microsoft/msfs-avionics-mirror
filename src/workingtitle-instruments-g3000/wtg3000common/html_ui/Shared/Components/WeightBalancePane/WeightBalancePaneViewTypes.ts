/**
 * A weight and balance pane display mode.
 */
export enum WeightBalancePaneViewMode {
  Full = 'Full',
  Summary = 'Summary',
  Loading = 'Loading',
  Graph = 'Graph'
}

/**
 * Weight and balance pane half-size display modes.
 */
export type WeightBalancePaneViewHalfMode
  = WeightBalancePaneViewMode.Summary
  | WeightBalancePaneViewMode.Loading
  | WeightBalancePaneViewMode.Graph;
