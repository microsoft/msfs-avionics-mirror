import { VNode } from '@microsoft/msfs-sdk';
import { NavDataFieldType, NavDataFieldTypeModelMap } from './NavDataFieldType';

/**
 * Renders navigation data fields.
 */
export interface NavDataFieldRenderer {
  /**
   * Renders a navigation data field of a given type.
   * @param type A navigation data field type.
   * @param model The data model for the field.
   * @returns A navigation data field of the given type, as a VNode.
   * @throws Error if an unsupported field type is specified.
   */
  render<T extends NavDataFieldType>(type: T, model: NavDataFieldTypeModelMap[T]): VNode
}

/**
 * Renders data field components for a single type of navigation data field.
 */
export interface NavDataFieldTypeRenderer<T extends NavDataFieldType> {
  /**
   * Renders a navigation data field of this renderer's data field type.
   * @param model The data model to use for the data field.
   * @returns A navigation data field of this renderer's data field type, as a VNode.
   */
  render(model: NavDataFieldTypeModelMap[T]): VNode;
}