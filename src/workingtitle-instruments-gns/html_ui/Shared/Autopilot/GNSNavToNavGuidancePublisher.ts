import { EventBus } from '@microsoft/msfs-sdk';

import { GarminNavToNavComputer } from '@microsoft/msfs-garminsdk';
import { GnsNavToNavManager } from '../Navigation/GnsNavToNavManager';

/**
 * A record defining event bus topics to which to publish GNS nav-to-nav guidance data.
 */
export type GNSNavToNavGuidancePublisherTopics = {
  /**
   * The event bus topic to which to publish the armable navigation radio index. If not defined, then the data will not
   * be published.
   */
  armableNavRadioIndex?: string;

  /**
   * The event bus topic to which to publish the armable lateral autopilot mode. If not defined, then the data will not
   * be published.
   */
  armableLateralMode?: string;

  /**
   * The event bus topic to which to publish the armable vertical autopilot mode. If not defined, then the data will
   * not be published.
   */
  armableVerticalMode?: string;

  /**
   * The event bus topic to which to publish whether CDI switch is allowed. If not defined, then the data will not be
   * published.
   */
  canSwitchCdi?: string;

  /**
   * The event bus topic to which to publish whether the GNS is automatically switching its CDI source.
   */
  isExternalCdiSwitchInProgress?: string;
};

/**
 * A publisher of GNS nav-to-nav guidance data.
 */
export class GNSNavToNavGuidancePublisher {
  /**
   * Creates a new instance of GNSNavToNavGuidancePublisher.
   * @param bus The event bus.
   * @param computer The computer from which to source guidance data.
   * @param manager The manager that controls CDI source auto-switch.
   * @param topics The event bus topics to which to publish.
   */
  public constructor(
    bus: EventBus,
    computer: GarminNavToNavComputer,
    manager: GnsNavToNavManager,
    topics: Readonly<GNSNavToNavGuidancePublisherTopics>
  ) {
    if (topics.armableNavRadioIndex) {
      computer.armableNavRadioIndex.sub(value => { bus.pub(topics.armableNavRadioIndex!, value, true, true); });
    }
    if (topics.armableLateralMode) {
      computer.armableLateralMode.sub(value => { bus.pub(topics.armableLateralMode!, value, true, true); });
    }
    if (topics.armableVerticalMode) {
      computer.armableVerticalMode.sub(value => { bus.pub(topics.armableVerticalMode!, value, true, true); });
    }
    if (topics.canSwitchCdi) {
      computer.canSwitchCdi.sub(value => { bus.pub(topics.canSwitchCdi!, value, true, true); });
    }
    if (topics.isExternalCdiSwitchInProgress) {
      manager.isCdiSwitchInProgress.sub(value => { bus.pub(topics.isExternalCdiSwitchInProgress!, value, true, true); });
    }
  }
}
