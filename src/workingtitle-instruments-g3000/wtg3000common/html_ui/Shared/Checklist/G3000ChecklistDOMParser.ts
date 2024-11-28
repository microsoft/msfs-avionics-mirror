import { ChecklistDOMParser, ChecklistDOMParserParseOptions, ParsedChecklistGroupDefNoMetadata, ParsedChecklistSetDefNoMetadata } from '@microsoft/msfs-sdk';

import { GarminChecklistDOMParser, GarminChecklistItemTypeDefMap } from '@microsoft/msfs-garminsdk';

import { G3000ChecklistGroupMetadata, G3000ChecklistMetadata, G3000ChecklistSetDef } from './G3000ChecklistDefinition';

/**
 * Options to apply when {@link G3000ChecklistDOMParser} is parsing a checklist definition.
 */
export type G3000ChecklistDOMParserParseOptions = Omit<
  ChecklistDOMParserParseOptions<GarminChecklistItemTypeDefMap, void, void, void, void>,
  'parseSetMetadata' | 'parseGroupMetadata' | 'parseListMetadata'
>;

/**
 * A parser of G3000 checklist definitions from DOM elements.
 */
export class G3000ChecklistDOMParser {
  private readonly parser = new GarminChecklistDOMParser();

  /**
   * Parses the G3000 checklist definition specified by a DOM element.
   * @param element The element to parse.
   * @param options Options to apply to the parsing operation.
   * @returns The checklist definition parsed from the specified element.
   * @throws Error if the parsing operation encounters an unrecoverable syntax error or if the `errorInsteadOfDiscard`
   * option is enabled and the operation encounters a syntax error that would normally cause a definition to be
   * discarded.
   */
  public parse(
    element: Element,
    options?: Readonly<G3000ChecklistDOMParserParseOptions>
  ): G3000ChecklistSetDef {
    const optionsToUse: ChecklistDOMParserParseOptions<GarminChecklistItemTypeDefMap, G3000ChecklistMetadata, G3000ChecklistGroupMetadata, void, void> = {
      ...options,
      parseSetMetadata: this.parseSetMetadata.bind(this),
      parseGroupMetadata: this.parseGroupMetadata.bind(this)
    };

    return this.parser.parse(element, optionsToUse) as G3000ChecklistSetDef;
  }

  /**
   * Parses checklist set metadata from a DOM element.
   * @param element The element to parse.
   * @param parsed The checklist set definition without metadata parsed from the element.
   * @returns The checklist group definition parsed from the specified element, or `undefined` if the definition
   * was discarded.
   */
  private parseSetMetadata(element: Element, parsed: ParsedChecklistSetDefNoMetadata<GarminChecklistItemTypeDefMap, G3000ChecklistGroupMetadata, void>): G3000ChecklistMetadata {
    let forceDefaultListIndexToZero = false;

    let defaultGroupIndex = 0;
    let defaultListIndex = 0;

    const defaultGroupIndexAttr = element.getAttribute('default-group-index');
    if (defaultGroupIndexAttr) {
      defaultGroupIndex = Number(defaultGroupIndexAttr);
      if (!Number.isInteger(defaultGroupIndex) || defaultGroupIndex < 0) {
        console.warn(`G3000ChecklistDOMParser: invalid default group index ${defaultGroupIndexAttr} (must be a non-negative integer). Defaulting to 0.`);
        defaultGroupIndex = 0;
        forceDefaultListIndexToZero = true;
      }
    } else {
      // Attempt to parse default group by name.
      const defaultGroupNameAttr = element.getAttribute('default-group-name');
      if (defaultGroupNameAttr) {
        const defaultGroupIndexByName = parsed.groups.findIndex(group => group.name === defaultGroupNameAttr);
        if (defaultGroupIndexByName >= 0) {
          defaultGroupIndex = defaultGroupIndexByName;
        } else {
          console.warn(`G3000ChecklistDOMParser: could not find default group with name ${defaultGroupNameAttr}. Defaulting default group index to 0.`);
          defaultGroupIndex = 0;
          forceDefaultListIndexToZero = true;
        }
      }
    }

    forceDefaultListIndexToZero ||= defaultGroupIndex >= parsed.groups.length;

    if (!forceDefaultListIndexToZero) {
      const defaultListIndexAttr = element.getAttribute('default-list-index');
      if (defaultListIndexAttr) {
        defaultListIndex = Number(defaultListIndexAttr);
        if (!Number.isInteger(defaultListIndex) || defaultListIndex < 0) {
          console.warn(`G3000ChecklistDOMParser: invalid default list index ${defaultListIndexAttr} (must be a non-negative integer). Defaulting to 0.`);
          defaultListIndex = 0;
        }
      } else {
        // Attempt to parse default list by name.
        const defaultListNameAttr = element.getAttribute('default-list-name');
        if (defaultListNameAttr) {
          const defaultGroup = parsed.groups[defaultGroupIndex];
          const defaultListIndexByName = defaultGroup.lists.findIndex(list => list.name === defaultListNameAttr);
          if (defaultListIndexByName >= 0) {
            defaultListIndex = defaultListIndexByName;
          } else {
            console.warn(`G3000ChecklistDOMParser: could not find default list with name ${defaultListNameAttr} in the default group ${defaultGroup.name} (index ${defaultGroupIndex}). Defaulting default list index to 0.`);
            defaultListIndex = 0;
          }
        }
      }
    }

    if (defaultGroupIndex >= parsed.groups.length || defaultListIndex >= parsed.groups[defaultGroupIndex].lists.length) {
      console.warn('G3000ChecklistDOMParser: default group index and default list index reference a non-existent list. Defaulting both indexes to 0.');
      defaultGroupIndex = 0;
      defaultListIndex = 0;
    }

    return {
      defaultGroupIndex,
      defaultListIndex
    };
  }

  /**
   * Parses checklist set metadata from a DOM element.
   * @param element The element to parse.
   * @param parsed The checklist set definition without metadata parsed from the element.
   * @returns The checklist group definition parsed from the specified element, or `undefined` if the definition
   * was discarded.
   */
  private parseGroupMetadata(element: Element, parsed: ParsedChecklistGroupDefNoMetadata<GarminChecklistItemTypeDefMap, void>): G3000ChecklistGroupMetadata {
    let tabLabel = parsed.name;

    const tabLabelAttr = element.getAttribute('tab-label');
    if (tabLabelAttr !== null) {
      if (tabLabelAttr === '') {
        console.warn(`G3000ChecklistDOMParser: cannot use the empty string as a tab label for group ${parsed.name}. Defaulting tab label to the group name.`);
      } else {
        tabLabel = ChecklistDOMParser.tryParseTextAsJSON(tabLabelAttr);
      }
    }

    return {
      tabLabel
    };
  }
}
