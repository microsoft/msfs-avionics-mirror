import { DisplayComponent, NodeReference, VNode } from '@microsoft/msfs-sdk';

import { WT21AvionicsPlugin, WT21ChecklistSetDef, WT21ChecklistStateProvider, WT21PluginBinder } from '@microsoft/msfs-wt21-shared';

import { MfdTextPagesContext, SystemsPageComponent } from './Components';

/** A plugin binder for WT21 MFD plugins */
export interface WT21MfdPluginBinder extends WT21PluginBinder {
  /** The display unit index */
  displayUnitIndex: number,
}

/**
 * Definition of a systems page rendered by an MFD plugin
 */
export interface WT21MfdPluginSystemsPageDefinition {
  /** A ref to the systems page instance */
  ref: NodeReference<DisplayComponent<any> & SystemsPageComponent>,

  /** The VNode representing the systems page*/
  vnode: VNode,
}

/**
 * A WT21 MFD plugin
 *
 * TODO separate out into interface and abstract class
 */
export abstract class WT21MfdAvionicsPlugin extends WT21AvionicsPlugin<WT21MfdPluginBinder> {
  /**
   * Method called to render the Engine Indication System (EIS) on the MFD
   *
   * @returns a VNode representing the EIS
   */
  renderEis?(): VNode;

  /**
   * Method called to render system pages on the MFD
   *
   * @param onRefCreated a callback fired whenever a systems page is
   * instantiated, with its index and a ref to it passed as the first argument
   *
   * @returns an array of VNodes representing systems pages
   */
  renderSystemPages?(onRefCreated?: (pageIndex: number, ref: NodeReference<DisplayComponent<any> & SystemsPageComponent>) => void): WT21MfdPluginSystemsPageDefinition[];

  /**
   * Method that is called with a {@link MfdTextPagesContext}, letting the plugin register MFD text pages
   *
   * @param context the MFD text page context
   */
  registerExtraMfdTextPages?(context: MfdTextPagesContext): void;

  /**
   * Gets a checklist definition to be used by the electronic checklist system.
   * @returns A checklist definition, or `undefined` if checklists are not to be supported.
   */
  getChecklistDef?(): WT21ChecklistSetDef | undefined;

  /**
   * Lifecycle method called when the electronic checklist system is initialized.
   * @param checklistDef The checklist definition used by the checklist system, or `undefined` if checklists are not
   * supported.
   * @param checklistStateProvider A provider of checklist state, or `undefined` if checklists are not supported.
   */
  onChecklistInit?(checklistDef: WT21ChecklistSetDef | undefined, checklistStateProvider?: WT21ChecklistStateProvider): void;
}
