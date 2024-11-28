import { UiView } from './UiView';

/**
 * Policies governing the lifecycle of UI views.
 */
export enum UiViewLifecyclePolicy {
  /** The view is created immediately on initialization and is never destroyed. */
  Static = 'Static',

  /** The view is created when it is opened for the first time and is never destroyed. */
  Persistent = 'Persistent',

  /**
   * The view is created when it is opened and destroyed when it is closed and no longer appears in the history of its
   * view stack.
   */
  Transient = 'Transient'
}

/**
 * Types of open UI views.
 */
export type UiViewType = 'page' | 'popup' | 'base';

/**
 * Types of UI popups.
 */
export type UiPopupType = 'normal' | 'fade' | 'positioned' | 'slideout-top-full' | 'slideout-bottom-full' | 'slideout-right-full';

/**
 * Types of occlusion applied to UI views.
 */
export type UiViewOcclusionType = 'darken' | 'hide' | 'none';

/**
 * UI view stack layers.
 */
export enum UiViewStackLayer {
  Main = 'Main',
  Overlay = 'Overlay'
}

/**
 * An entry describing a UI view registered to a view stack.
 */
export type UiViewEntry<T extends UiView = UiView> = {
  /** The view stack layer to which the view belongs. */
  readonly layer: UiViewStackLayer;

  /** The key of the view. */
  readonly key: string;

  /** A reference to the view, or `undefined` if the view is not rendered. */
  readonly ref: T | undefined;
};

/**
 * An entry describing a rendered UI view registered to a view stack.
 */
export type RenderedUiViewEntry<T extends UiView = UiView> = Omit<UiViewEntry<T>, 'ref'> & {
  /** A reference to the view. */
  readonly ref: T;
};

/**
 * An item describing a UI view within a view stack.
 */
export type UiViewStackItem<T extends UiView = UiView> = {
  /** The entry for the UI view. */
  readonly viewEntry: RenderedUiViewEntry<T>;

  /** The view type as which the UI view was opened. */
  readonly type: UiViewType;
};

/**
 * Size modes for UI views.
 */
export enum UiViewSizeMode {
  Full = 'Full',
  Half = 'Half',
  Hidden = 'Hidden'
}