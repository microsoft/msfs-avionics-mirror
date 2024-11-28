import { ChecklistDOMParser, ChecklistDOMParserParseOptions, ChecklistItemTypeDefMap } from '@microsoft/msfs-sdk';

import { Epic2ChecklistDef, Epic2ChecklistGroupMetadata, Epic2ChecklistListMetadata, Epic2ChecklistMetadata } from './Epic2ChecklistDefinitions';

/**
 * Options to apply when {@link G3000ChecklistDOMParser} is parsing a checklist definition.
 */
export type Epic2ChecklistDOMParserParseOptions = Omit<
  ChecklistDOMParserParseOptions<ChecklistItemTypeDefMap, void, void, void, void>,
  'parseSetMetadata' | 'parseGroupMetadata' | 'parseListMetadata'
>;

/**
 * A checklist DOM parser specific for Epic 2 checklists
 */
export class Epic2ChecklistDOMParser {
  private parser = new ChecklistDOMParser();

  /**
   * Parses the Epic2 checklist definition specified by a DOM element.
   * @param element The element to parse.
   * @param options Options to apply to the parsing operation.
   * @returns The checklist definition parsed from the specified element.
   * @throws Error if the parsing operation encounters an unrecoverable syntax error or if the `errorInsteadOfDiscard`
   * option is enabled and the operation encounters a syntax error that would normally cause a definition to be
   * discarded.
   */
  public parse(
    element: Element,
    options?: Readonly<Epic2ChecklistDOMParserParseOptions>
  ): Epic2ChecklistDef {
    const optionsToUse: ChecklistDOMParserParseOptions<ChecklistItemTypeDefMap, Epic2ChecklistMetadata, Epic2ChecklistGroupMetadata, Epic2ChecklistListMetadata, void> = {
      ...options,
      parseListMetadata: this.parseListMetadata.bind(this)
    };

    return this.parser.parse(element, optionsToUse) as Epic2ChecklistDef;
  }

  /**
   * Parses checklist list metadata from a DOM element.
   * @param element The element to parse.
   * @returns The checklist group definition parsed from the specified element, or `undefined` if the definition
   * was discarded.
   */
  private parseListMetadata(element: Element): Epic2ChecklistListMetadata {
    const casMessages = [];

    const casMessageContainer = element.querySelector(':scope > LinkedCasMessages');
    const casMessageElements = casMessageContainer?.querySelectorAll(':scope > Message') ?? [];

    for (const casMessage of casMessageElements) {
      const messageName = casMessage.textContent?.toUpperCase() ?? '';
      casMessages.push(messageName);
    }

    return {
      casMessages
    };
  }
}
