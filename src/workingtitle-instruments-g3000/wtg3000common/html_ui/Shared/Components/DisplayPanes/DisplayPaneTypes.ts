/**
 * Indexes for display panes.
 */
export enum DisplayPaneIndex {
  LeftPfdInstrument = 0,
  LeftPfd = 1,
  LeftMfd = 2,
  RightMfd = 3,
  RightPfd = 4,
  RightPfdInstrument = 5
}

/**
 * Indexes for display panes that are controllable by GTCs.
 */
export type ControllableDisplayPaneIndex = DisplayPaneIndex.LeftPfd | DisplayPaneIndex.LeftMfd | DisplayPaneIndex.RightMfd | DisplayPaneIndex.RightPfd;

/**
 * Indexes for GTC units that can control display panes.
 */
export enum DisplayPaneControlGtcIndex {
  LeftGtc = 1,
  RightGtc = 2,
}

/**
 * Size modes for display panes.
 */
export enum DisplayPaneSizeMode {
  Full = 'Full',
  Half = 'Half',
  Hidden = 'Hidden'
}