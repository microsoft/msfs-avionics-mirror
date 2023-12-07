import { VNode } from '@microsoft/msfs-sdk';

import { UnitsUserSettingManager } from '../../../settings/UnitsUserSettings';
import { GenericNavDataFieldRenderer } from '../../navdatafield/GenericNavDataFieldRenderer';
import { NavDataFieldType, NavDataFieldTypeModelMap } from '../../navdatafield/NavDataFieldType';
import { NextGenNavDataFieldBrgRenderer, NextGenNavDataFieldDisRenderer, NextGenNavDataFieldEteRenderer } from '../../navdatafield/NextGenNavDataFieldTypeRenderers';
import { NavStatusBoxFieldType } from './NavStatusBoxFieldType';

/**
 * A navigation status box field renderer.
 */
export class NavStatusBoxFieldRenderer {
  private readonly renderer: GenericNavDataFieldRenderer;

  /**
   * Constructor.
   * @param unitsSettingManager A display units user setting manager.
   */
  constructor(
    unitsSettingManager: UnitsUserSettingManager
  ) {
    this.renderer = new GenericNavDataFieldRenderer();

    this.renderer.register(NavDataFieldType.BearingToWaypoint, new NextGenNavDataFieldBrgRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.DistanceToWaypoint, new NextGenNavDataFieldDisRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.TimeToWaypoint, new NextGenNavDataFieldEteRenderer(unitsSettingManager));
  }

  /** @inheritdoc */
  public render<T extends NavStatusBoxFieldType>(type: T, model: NavDataFieldTypeModelMap[T]): VNode {
    return this.renderer.render(type, model);
  }
}