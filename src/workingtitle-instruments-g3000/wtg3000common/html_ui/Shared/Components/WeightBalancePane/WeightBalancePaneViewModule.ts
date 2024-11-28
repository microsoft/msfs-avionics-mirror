import { EventBus, NodeReference, VNode } from '@microsoft/msfs-sdk';

import { UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';

import { WeightBalanceConfig } from '../../Performance/WeightBalance/WeightBalanceConfig';
import { WeightBalanceUserSettingManager } from '../../Settings/WeightBalanceUserSettings';
import { WeightBalancePaneViewPanel } from './WeightBalancePaneViewPanel';

/**
 * A module that allows customization of certain aspects of the weight and balance display pane.
 */
export interface WeightBalancePaneViewModule {
  /**
   * Renders the aircraft load panel for the weight and balance display pane. The panel should be rendered as a
   * display component that implements the `WeightBalancePaneViewPanel` interface.
   * @param ref A node reference to which to assign the rendered panel.
   * @param bus The event bus.
   * @param weightBalanceConfig A weight and balance configuration object.
   * @param weightBalanceSettingManager A manager for weight and balance user settings.
   * @param unitsSettingManager A manager for display unit user settings.
   * @returns An aircraft load panel for the weight and balance display pane, as a VNode.
   */
  renderAircraftLoadPanel(
    ref: NodeReference<WeightBalancePaneViewPanel>,
    bus: EventBus,
    weightBalanceConfig: WeightBalanceConfig,
    weightBalanceSettingManager: WeightBalanceUserSettingManager,
    unitsSettingManager: UnitsUserSettingManager
  ): VNode;
}
