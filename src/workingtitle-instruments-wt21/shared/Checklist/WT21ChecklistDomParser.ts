import { ChecklistDOMParser, ChecklistDOMParserParseOptions, ChecklistItemTypeDefMap } from '@microsoft/msfs-sdk';
import { WT21ChecklistSetDef } from './WT21ChecklistDefinition';

/**
 * Options to apply when {@link WT21ChecklistDomParser} is parsing a checklist definition.
 */
export type WT21ChecklistDomParserParseOptions = ChecklistDOMParserParseOptions<ChecklistItemTypeDefMap, void, void, void, void>;

/** A checklist DOM parser specifically for the WT21 */
export class WT21ChecklistDomParser extends ChecklistDOMParser {
  /** @inheritdoc */
  public parse(
    element: Element,
    options?: Readonly<WT21ChecklistDomParserParseOptions>
  ): WT21ChecklistSetDef {
    const parsed = super.parse(element, options ?? {});

    return {
      ...parsed,
      preambleLines: this.parsePreamble(element)
    } as WT21ChecklistSetDef;
  }

  /** @inheritdoc */
  protected parseBranchDef(): undefined {
    console.warn('[ChecklistDOMParser] Branches are not supported in the WT21.');
    return undefined;
  }

  /** @inheritdoc */
  protected parseBranchItemDef(): undefined {
    console.warn('[ChecklistDOMParser] Branch items are not supported in the WT21.');
    return undefined;
  }

  /** @inheritdoc */
  protected parseLinkItemDef(): undefined {
    console.warn('[ChecklistDOMParser] Link items are not supported in the WT21.');
    return undefined;
  }

  /** @inheritdoc */
  protected parseTitleItemDef(): undefined {
    console.warn('[ChecklistDOMParser] Title items are not supported in the WT21.');
    return undefined;
  }

  /** @inheritdoc */
  protected parseNoteItemDef(): undefined {
    console.warn('[ChecklistDOMParser] Note items are not supported in the WT21.');
    return undefined;
  }

  /** @inheritdoc */
  protected parseSpacerItemDef(): undefined {
    console.warn('[ChecklistDOMParser] Spacer items are not supported in the WT21.');
    return undefined;
  }

  /**
   * Parses the preamble of a checklist.
   * @param element The checklist root element to parse from.
   * @returns The array of preamble lines, or `undefined` if no preamble was found.
   */
  private parsePreamble(element: Element): string[] | undefined {
    const preambleElement = element.querySelector(':scope>Preamble');

    if (!preambleElement) {
      return undefined;
    }

    // Split the text content by lines, trim each line, filter out empty lines, and try to parse each line as JSON.
    return preambleElement.childNodes[0]?.textContent
      ?.split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ChecklistDOMParser.tryParseTextAsJSON(line));
  }
}
