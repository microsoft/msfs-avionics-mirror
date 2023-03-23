import { VNode } from '@microsoft/msfs-sdk';
import { NavDataFieldRenderer, NavDataFieldTypeRenderer } from './NavDataFieldRenderer';
import { NavDataFieldType, NavDataFieldTypeModelMap } from './NavDataFieldType';

/**
 * A generic implementation of a navigation data field renderer. For each data field type, a single-type renderer
 * can be registered. Once registered, the single-type renderer is used to create render data fields for its assigned
 * data field type.
 */
export class GenericNavDataFieldRenderer implements NavDataFieldRenderer {
  private readonly renderers = new Map<NavDataFieldType, NavDataFieldTypeRenderer<NavDataFieldType>>();

  /**
   * Registers a single-type renderer.
   * @param type The data field type of the single-type renderer to register.
   * @param renderer The single-type renderer to register.
   */
  public register<T extends NavDataFieldType>(type: T, renderer: NavDataFieldTypeRenderer<T>): void {
    this.renderers.set(type, renderer);
  }

  /**
   * Deregisters a single-type renderer.
   * @param type The data field type of the single-type renderer to deregister.
   * @returns Whether a single-type renderer was deregistered.
   */
  public deregister<T extends NavDataFieldType>(type: T): boolean {
    return this.renderers.delete(type);
  }

  /** @inheritdoc */
  public render<T extends NavDataFieldType>(type: T, model: NavDataFieldTypeModelMap[T]): VNode {
    const rendered = this.renderers.get(type)?.render(model);

    if (!rendered) {
      throw new Error(`GenericNavDataFieldRenderer: no single-type renderer of data field type [${type}] is registered`);
    }

    return rendered;
  }
}