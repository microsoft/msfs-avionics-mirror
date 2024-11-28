import { DisplayPaneIndex } from '../DisplayPanes/DisplayPaneTypes';

/**
 * Events describing state changes for weight and balance pane views keyed by base topic names.
 */
export interface BaseWeightBalancePaneViewStateEvents {
  /** Whether the weight and balance pane view is displayed in half-size mode. */
  weight_balance_pane_is_half_size: boolean;
}

/**
 * Events describing state changes for an indexed weight and balance pane view keyed by indexed topic names.
 */
export type IndexedWeightBalancePaneViewStateEvents<Index extends DisplayPaneIndex> = {
  [P in keyof BaseWeightBalancePaneViewStateEvents as `${P}_${Index}`]: BaseWeightBalancePaneViewStateEvents[P];
};

/**
 * All events describing state changes for weight and balance pane views.
 */
export type WeightBalancePaneViewStateEvents = IndexedWeightBalancePaneViewStateEvents<DisplayPaneIndex>;
