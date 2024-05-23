import { EventBus, PublishPacer, SimVarDefinition, SimVarPublisher, SimVarValueType } from '@microsoft/msfs-sdk';

import { G3XExternalNavigatorIndex } from '../CommonTypes';

/**
 * Active navigation sources for the G3X Touch.
 */
export enum G3XActiveNavSource {
  Nav1,
  Nav2,
  GpsInternal,
  Gps1,
  Gps2
}

/**
 * SimVar names for G3X Touch navigation data.
 */
export enum G3XNavVars {
  /** The active navigation source for the G3X Touch. */
  ActiveNavSource = 'L:WTG3X_Nav_Active_Nav_Source',

  /**
   * The index of the active navigator for the G3X Touch. Index 0 refers to the internal GPS navigator, and indexes 1
   * and 2 refer to external navigators.
   */
  ActiveNavigatorIndex = 'L:WTG3X_Nav_Active_Navigator_Index'
}

/**
 * G3X Touch events related to navigation.
 */
export interface G3XNavEvents {
  /** The active navigation source for the G3X Touch. */
  g3x_active_nav_source: G3XActiveNavSource;

  /**
   * The index of the active navigator for the G3X Touch. Index 0 refers to the internal GPS navigator, and indexes 1
   * and 2 refer to external navigators.
   */
  g3x_active_navigator_index: 0 | G3XExternalNavigatorIndex;
}

/**
 * A publisher for G3X Touch navigation SimVar events.
 */
export class G3XNavSimVarPublisher extends SimVarPublisher<G3XNavEvents> {
  private static readonly simvars = new Map<keyof G3XNavEvents, SimVarDefinition>([
    ['g3x_active_nav_source', { name: G3XNavVars.ActiveNavSource, type: SimVarValueType.Number }],
    ['g3x_active_navigator_index', { name: G3XNavVars.ActiveNavigatorIndex, type: SimVarValueType.Number }]
  ]);

  /**
   * Creates a new instance of G3XNavSimVarPublisher.
   * @param bus The event bus to which to publish.
   * @param pacer An optional pacer to control the rate of publishing.
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<G3XNavEvents>) {
    super(G3XNavSimVarPublisher.simvars, bus, pacer);
  }
}
