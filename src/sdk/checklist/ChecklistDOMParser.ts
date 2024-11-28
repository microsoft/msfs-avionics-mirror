import {
  ChecklistSetDef, BaseChecklistItemTypeDefMap, ChecklistGroupDef, ChecklistItemDef, ChecklistItemType,
  ChecklistItemTypeDefMap, ChecklistListDef, ChecklistBranchDef, ChecklistBranchItemLogicType
} from './ChecklistDefinitions';

/**
 * A parsed definition for a set of checklists without metadata.
 */
export type ParsedChecklistSetDefNoMetadata<I extends BaseChecklistItemTypeDefMap, G = unknown, L = unknown, B = unknown> = Omit<ChecklistSetDef<I, any, G, L, B>, 'metadata'>;

/**
 * A parsed definition for a checklist group without metadata.
 */
export type ParsedChecklistGroupDefNoMetadata<I extends BaseChecklistItemTypeDefMap, L = unknown, B = unknown> = Omit<ChecklistGroupDef<I, any, L, B>, 'metadata'>;

/**
 * A parsed definition for a checklist list without metadata.
 */
export type ParsedChecklistListDefNoMetadata<I extends BaseChecklistItemTypeDefMap, B = unknown> = Omit<ChecklistListDef<I, any, B>, 'metadata'>;

/**
 * A parsed definition for a checklist branch without metadata.
 */
export type ParsedChecklistBranchDefNoMetadata<I extends BaseChecklistItemTypeDefMap> = Omit<ChecklistBranchDef<I>, 'metadata'>;

/**
 * A fragment of a {@link ChecklistDOMParser} parsing options object that defines how checklist set metadata is
 * parsed.
 */
type ParseOptionsSetMetadataFragment<I extends BaseChecklistItemTypeDefMap, S, G, L, B> = {
  /** A function that parses checklist set metadata from a DOM element. */
  parseSetMetadata: (element: Element, parsed: ParsedChecklistSetDefNoMetadata<I, G, L, B>, onError: (message: string) => void) => S;
};

/**
 * A fragment of a {@link ChecklistDOMParser} parsing options object that defines how checklist group metadata is
 * parsed.
 */
type ParseOptionsGroupMetadataFragment<I extends BaseChecklistItemTypeDefMap, G, L, B> = {
  /** A function that parses checklist group metadata from a DOM element. */
  parseGroupMetadata: (element: Element, parsed: ParsedChecklistGroupDefNoMetadata<I, L, B>, onError: (message: string) => void) => G;
}

/**
 * A fragment of a {@link ChecklistDOMParser} parsing options object that defines how checklist list metadata is
 * parsed.
 */
type ParseOptionsListMetadataFragment<I extends BaseChecklistItemTypeDefMap, L, B> = {
  /** A function that parses checklist list metadata from a DOM element. */
  parseListMetadata: (element: Element, parsed: ParsedChecklistListDefNoMetadata<I, B>, onError: (message: string) => void) => L;
};

/**
 * A fragment of a {@link ChecklistDOMParser} parsing options object that defines how checklist branch metadata is
 * parsed.
 */
type ParseOptionsBranchMetadataFragment<I extends BaseChecklistItemTypeDefMap, B> = {
  /** A function that parses checklist branch metadata from a DOM element. */
  parseBranchMetadata: (element: Element, parsed: ParsedChecklistBranchDefNoMetadata<I>, onError: (message: string) => void) => B;
};

/**
 * A utility type that returns the partial version of `U` if `T` is `undefined` or `void` and returns `U` otherwise.
 */
type PartialIfUndefined<T, U> = T extends undefined | void ? Partial<U> : U;

/**
 * Options to apply when {@link ChecklistDOMParser} is parsing a checklist definition.
 */
export type ChecklistDOMParserParseOptions<I extends BaseChecklistItemTypeDefMap, S, G, L, B> = {
  /** Whether to discard parsed checklist branch definitions that have no items. Defaults to `false`. */
  discardEmptyBranches?: boolean;

  /** Whether to discard parsed checklist list definitions that have no items. Defaults to `false`. */
  discardEmptyLists?: boolean;

  /** Whether to discard parsed checklist group definitions that have no lists. Defaults to `false`. */
  discardEmptyGroups?: boolean;

  /**
   * Whether to throw an error when a syntax error is encountered that is normally resolved by discarding the
   * offending definition. Defaults to `false`.
   */
  errorInsteadOfDiscard?: boolean;
} & PartialIfUndefined<S, ParseOptionsSetMetadataFragment<I, S, G, L, B>>
  & PartialIfUndefined<G, ParseOptionsGroupMetadataFragment<I, G, L, B>>
  & PartialIfUndefined<L, ParseOptionsListMetadataFragment<I, L, B>>
  & PartialIfUndefined<B, ParseOptionsBranchMetadataFragment<I, B>>;

/**
 * Parsing options used internally by {@link ChecklistDOMParser}.
 */
export type ChecklistDOMParseOptionsToUse<I extends BaseChecklistItemTypeDefMap>
  = Required<Pick<ChecklistDOMParserParseOptions<I, any, any, any, any>, 'discardEmptyBranches' | 'discardEmptyLists' | 'discardEmptyGroups'>>
  & {
    /** The function to call when a syntax error is encountered that can be resolved by discarding the offending definition. */
    onError: (message: string) => void;
  }
  & Partial<ParseOptionsSetMetadataFragment<I, any, any, any, any>>
  & Partial<ParseOptionsGroupMetadataFragment<I, any, any, any>>
  & Partial<ParseOptionsListMetadataFragment<I, any, any>>
  & Partial<ParseOptionsBranchMetadataFragment<I, any>>;

/**
 * A utility type that returns the type of the parsed checklist set metadata defined by a
 * {@link ChecklistDOMParser} parsing options object.
 */
type TypeOfParseOptionsSetMetadata<T extends ChecklistDOMParserParseOptions<any, any, any, any, any>>
  = T extends ParseOptionsSetMetadataFragment<any, infer S, any, any, any> ? S : unknown;

/**
 * A utility type that returns the type of the parsed checklist group metadata defined by a
 * {@link ChecklistDOMParser} parsing options object.
 */
type TypeOfParseOptionsGroupMetadata<T extends ChecklistDOMParserParseOptions<any, any, any, any, any>>
  = T extends ParseOptionsGroupMetadataFragment<any, infer G, any, any> ? G : unknown;

/**
 * A utility type that returns the type of the parsed checklist list metadata defined by a
 * {@link ChecklistDOMParser} parsing options object.
 */
type TypeOfParseOptionsListMetadata<T extends ChecklistDOMParserParseOptions<any, any, any, any, any>>
  = T extends ParseOptionsListMetadataFragment<any, infer L, any> ? L : unknown;

/**
 * A utility type that returns the type of the parsed checklist branch metadata defined by a
 * {@link ChecklistDOMParser} parsing options object.
 */
type TypeOfParseOptionsBranchMetadata<T extends ChecklistDOMParserParseOptions<any, any, any, any, any>>
  = T extends ParseOptionsBranchMetadataFragment<any, infer B> ? B : unknown;

/**
 * A parser of checklist definitions from DOM elements.
 * @template I A map from checklist item types to checklist item definitions to which the definitions parsed by the
 * parser conform. Defaults to `ChecklistItemTypeDefMap`. Subclasses that parse item definitions that do not conform to
 * to the default map should override this type parameter as appropriate.
 */
export class ChecklistDOMParser<I extends BaseChecklistItemTypeDefMap = ChecklistItemTypeDefMap> {
  /**
   * Parses the checklist set definition specified by a DOM element.
   * @param element The element to parse.
   * @returns The checklist set definition parsed from the specified element.
   * @throws Error if the parsing operation encounters an unrecoverable syntax error or if the `errorInsteadOfDiscard`
   * option is enabled and the operation encounters a syntax error that would normally cause a definition to be
   * discarded.
   */
  public parse(
    element: Element
  ): ChecklistSetDef<I>;
  /**
   * Parses the checklist set definition specified by a DOM element.
   * @param element The element to parse.
   * @param options Options to apply to the parsing operation.
   * @returns The checklist set definition parsed from the specified element.
   * @throws Error if the parsing operation encounters an unrecoverable syntax error or if the `errorInsteadOfDiscard`
   * option is enabled and the operation encounters a syntax error that would normally cause a definition to be
   * discarded.
   */
  public parse<O extends ChecklistDOMParserParseOptions<I, any, any, any, any>>(
    element: Element,
    options: Readonly<O>
  ): ChecklistSetDef<I, TypeOfParseOptionsSetMetadata<O>, TypeOfParseOptionsGroupMetadata<O>, TypeOfParseOptionsListMetadata<O>, TypeOfParseOptionsBranchMetadata<O>>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public parse(
    element: Element,
    options?: Readonly<ChecklistDOMParserParseOptions<I, any, any, any, any>>
  ): ChecklistSetDef<I> {
    if (element.tagName !== 'Checklist') {
      throw new Error(`ChecklistDOMParser: expected root element tag name Checklist but was ${element.tagName} instead`);
    }

    const optionsToUse: ChecklistDOMParseOptionsToUse<I> = {
      parseSetMetadata: options?.parseSetMetadata,
      parseGroupMetadata: options?.parseGroupMetadata,
      parseListMetadata: options?.parseListMetadata,
      discardEmptyBranches: options?.discardEmptyBranches ?? false,
      discardEmptyLists: options?.discardEmptyLists ?? false,
      discardEmptyGroups: options?.discardEmptyGroups ?? false,
      onError: this.onError.bind(this, options?.errorInsteadOfDiscard ?? false)
    };

    const groups: ChecklistGroupDef<I>[] = [];

    for (const groupElement of element.querySelectorAll(':scope>Group')) {
      const groupDef = this.parseGroupDef(groupElement, optionsToUse);
      if (groupDef) {
        groups.push(groupDef);
      }
    }

    const setDef: ChecklistSetDef<I> = {
      groups,
      metadata: optionsToUse.parseSetMetadata?.(element, { groups }, optionsToUse.onError)
    };

    this.auditLinksInSet(setDef, optionsToUse);

    return setDef;
  }

  /**
   * Parses a checklist group definition from a DOM element.
   * @param element The element to parse.
   * @param options The options to use when parsing.
   * @returns The checklist group definition parsed from the specified element, or `undefined` if the definition
   * was discarded.
   */
  protected parseGroupDef(element: Element, options: ChecklistDOMParseOptionsToUse<I>): ChecklistGroupDef<I> | undefined {
    const nameAttr = element.getAttribute('name');
    if (!nameAttr) {
      options.onError('ChecklistDOMParser: a checklist group definition has no defined name.');
      return undefined;
    }

    const name = ChecklistDOMParser.tryParseTextAsJSON(nameAttr);

    const lists: ChecklistListDef<I>[] = [];

    for (const listElement of element.querySelectorAll(':scope>List')) {
      const listDef = this.parseListDef(listElement, name, options);
      if (listDef) {
        lists.push(listDef);
      }
    }

    if (options.discardEmptyGroups && lists.length === 0) {
      options.onError(`ChecklistDOMParser: definition for checklist group ${name} has no parseable lists and the discard empty group option is enabled.`);
      return undefined;
    }

    return {
      name,
      lists,
      metadata: options.parseGroupMetadata?.(element, { name, lists }, options.onError)
    };
  }

  /**
   * Parses a checklist list definition from a DOM element.
   * @param element The element to parse.
   * @param groupName The name of the checklist group for which the list is to be parsed.
   * @param options The options to use when parsing.
   * @returns The checklist list definition parsed from the specified element, or `undefined` if the definition
   * was discarded.
   */
  protected parseListDef(element: Element, groupName: string, options: ChecklistDOMParseOptionsToUse<I>): ChecklistListDef<I> | undefined {
    const uid = element.getAttribute('uid');

    const nameAttr = element.getAttribute('name');
    if (!nameAttr) {
      options.onError(`ChecklistDOMParser: a checklist list definition in group ${groupName} has no defined name.`);
      return undefined;
    }

    const name = ChecklistDOMParser.tryParseTextAsJSON(nameAttr);

    const branches: ChecklistBranchDef<I>[] = [];

    for (const branchElement of element.querySelectorAll(':scope>Branch')) {
      const branchDef = this.parseBranchDef(branchElement, groupName, name, options);
      if (branchDef) {
        branches.push(branchDef);
      }
    }

    const items = this.parseItemDefArray(element, groupName, name, undefined, options);

    if (options.discardEmptyLists && items.length === 0) {
      options.onError(`ChecklistDOMParser: definition for checklist list ${name} in group ${groupName} has no parseable items and the discard empty list option is enabled.`);
      return undefined;
    }

    return {
      uid: uid ? uid : undefined,
      name,
      items,
      branches,
      metadata: options.parseListMetadata?.(element, { name, items, branches }, options.onError)
    };
  }

  /**
   * Parses a checklist branch definition from a DOM element.
   * @param element The element to parse.
   * @param groupName The name of the checklist group for which the branch is to be parsed.
   * @param listName The name of the checklist list for which the branch is to be parsed.
   * @param options The options to use when parsing.
   * @returns The checklist branch definition parsed from the specified element, or `undefined` if the definition
   * was discarded.
   */
  protected parseBranchDef(element: Element, groupName: string, listName: string, options: ChecklistDOMParseOptionsToUse<I>): ChecklistBranchDef<I> | undefined {
    const uid = element.getAttribute('uid');
    if (!uid) {
      options.onError(`ChecklistDOMParser: a checklist branch definition in list ${listName} (group ${groupName}) has no defined UID.`);
      return undefined;
    }

    const nameAttr = element.getAttribute('name');
    if (!nameAttr) {
      options.onError(`ChecklistDOMParser: a checklist branch definition in list ${listName} (group ${groupName}) has no defined name.`);
      return undefined;
    }

    const name = ChecklistDOMParser.tryParseTextAsJSON(nameAttr);

    const items = this.parseItemDefArray(element, groupName, listName, name, options);

    if (options.discardEmptyBranches && items.length === 0) {
      options.onError(`ChecklistDOMParser: definition for checklist branch ${name} in list ${listName} (group ${groupName}) has no parseable items and the discard empty branch option is enabled.`);
      return undefined;
    }

    return {
      uid,
      name,
      items,
      metadata: options.parseBranchMetadata?.(element, { uid, name, items }, options.onError)
    };
  }

  /**
   * Parses an array of item definitions from a DOM element.
   * @param element The element to parse.
   * @param groupName The name of the checklist group for which the item array is to be parsed.
   * @param listName The name of the checklist list for which the item array is to be parsed.
   * @param branchName The name of the checklist branch for which the item array is to be parsed.
   * @param options The options to use when parsing.
   * @returns The checklist item definition array parsed from the specified element.
   */
  protected parseItemDefArray(
    element: Element,
    groupName: string,
    listName: string,
    branchName: string | undefined,
    options: ChecklistDOMParseOptionsToUse<I>
  ): ChecklistItemDef<I>[] {
    const items: ChecklistItemDef<I>[] = [];

    for (const itemElement of element.querySelectorAll(':scope>Item')) {
      const itemDef = this.parseItemDef(itemElement, groupName, listName, branchName, options);
      if (itemDef) {
        items.push(itemDef);
      }
    }

    return items;
  }

  /**
   * Parses a checklist item definition from a DOM element.
   * @param element The element to parse.
   * @param groupName The name of the checklist group for which the item is to be parsed.
   * @param listName The name of the checklist list for which the item is to be parsed.
   * @param branchName The name of the checklist branch for which the item is to be parsed.
   * @param options The options to use when parsing.
   * @returns The checklist item definition parsed from the specified element, or `undefined` if the definition
   * was discarded.
   */
  protected parseItemDef(
    element: Element,
    groupName: string,
    listName: string,
    branchName: string | undefined,
    options: ChecklistDOMParseOptionsToUse<I>
  ): ChecklistItemDef<I> | undefined {
    const typeAttr = element.getAttribute('type');
    if (!typeAttr) {
      options.onError(`ChecklistDOMParser: a checklist item definition in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}) has no defined type.`);
      return undefined;
    }

    switch (typeAttr.toLowerCase()) {
      case 'actionable':
        return this.parseActionableItemDef(element, groupName, listName, branchName, options);
      case 'branch':
        return this.parseBranchItemDef(element, groupName, listName, branchName, options);
      case 'link':
        return this.parseLinkItemDef(element, groupName, listName, branchName, options);
      case 'note':
        return this.parseNoteItemDef(element, groupName, listName, branchName, options);
      case 'title':
        return this.parseTitleItemDef(element, groupName, listName, branchName, options);
      case 'spacer':
        return this.parseSpacerItemDef(element, groupName, listName, branchName, options);
      default:
        options.onError(`ChecklistDOMParser: unrecognized checklist item type ${typeAttr} in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
        return undefined;
    }
  }

  /**
   * Parses an actionable checklist item definition from a DOM element.
   * @param element The element to parse.
   * @param groupName The name of the checklist group for which the item is to be parsed.
   * @param listName The name of the checklist list for which the item is to be parsed.
   * @param branchName The name of the checklist branch for which the item is to be parsed.
   * @param options The options to use when parsing.
   * @returns The actionable checklist item definition parsed from the specified element, or `undefined` if the
   * definition was discarded.
   */
  protected parseActionableItemDef(
    element: Element,
    groupName: string,
    listName: string,
    branchName: string | undefined,
    options: ChecklistDOMParseOptionsToUse<I>
  ): I[ChecklistItemType.Actionable] | undefined {
    const labelTextContent = element.querySelector(':scope>LabelText')?.textContent?.trim();
    if (!labelTextContent) {
      options.onError(`ChecklistDOMParser: an actionable checklist item definition in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}) has no defined label text.`);
      return undefined;
    }

    const labelText = ChecklistDOMParser.tryParseTextAsJSON(labelTextContent);

    const actionTextContent = element.querySelector(':scope>ActionText')?.textContent?.trim();
    const actionText = actionTextContent ? ChecklistDOMParser.tryParseTextAsJSON(actionTextContent) : '';

    return {
      type: ChecklistItemType.Actionable,
      labelText,
      actionText
    } as I[ChecklistItemType.Actionable];
  }

  /**
   * Parses a branch checklist item definition from a DOM element.
   * @param element The element to parse.
   * @param groupName The name of the checklist group for which the item is to be parsed.
   * @param listName The name of the checklist list for which the item is to be parsed.
   * @param branchName The name of the checklist branch for which the item is to be parsed.
   * @param options The options to use when parsing.
   * @returns The branch checklist item definition parsed from the specified element, or `undefined` if the definition
   * was discarded.
   */
  protected parseBranchItemDef(
    element: Element,
    groupName: string,
    listName: string,
    branchName: string | undefined,
    options: ChecklistDOMParseOptionsToUse<I>
  ): I[ChecklistItemType.Branch] | undefined {
    const textContent = element.querySelector(':scope>Text')?.textContent?.trim();
    if (!textContent) {
      options.onError(`ChecklistDOMParser: a branch checklist item definition in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}) has no defined text.`);
      return undefined;
    }

    const text = ChecklistDOMParser.tryParseTextAsJSON(textContent);

    const branches: string[] = [];
    const branchLogic: ChecklistBranchItemLogicType[] = [];

    for (const branchElement of element.querySelectorAll(':scope>Branch')) {
      const uid = branchElement.textContent?.trim();
      if (!uid) {
        options.onError(`ChecklistDOMParser: missing branch UID for a branch checklist item in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
        return undefined;
      }

      let logic: ChecklistBranchItemLogicType;
      switch (branchElement.getAttribute('logic')?.toLowerCase()) {
        case 'none':
        case undefined:
          logic = ChecklistBranchItemLogicType.None;
          break;
        case 'sufficient':
          logic = ChecklistBranchItemLogicType.Sufficient;
          break;
        case 'necessary':
          logic = ChecklistBranchItemLogicType.Necessary;
          break;
        default:
          options.onError(`ChecklistDOMParser: invalid branch logic for a branch checklist item (must be "none", "sufficient", or "necessary") in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
          return undefined;
      }

      branches.push(uid);
      branchLogic.push(logic);
    }

    return {
      type: ChecklistItemType.Branch,
      branches,
      branchLogic,
      text
    } as I[ChecklistItemType.Branch];
  }

  /**
   * Parses a link checklist item definition from a DOM element.
   * @param element The element to parse.
   * @param groupName The name of the checklist group for which the item is to be parsed.
   * @param listName The name of the checklist list for which the item is to be parsed.
   * @param branchName The name of the checklist branch for which the item is to be parsed.
   * @param options The options to use when parsing.
   * @returns The link checklist item definition parsed from the specified element, or `undefined` if the definition
   * was discarded.
   */
  protected parseLinkItemDef(
    element: Element,
    groupName: string,
    listName: string,
    branchName: string | undefined,
    options: ChecklistDOMParseOptionsToUse<I>
  ): I[ChecklistItemType.Link] | undefined {
    const target = element.querySelector(':scope>Target')?.textContent?.trim();
    if (!target) {
      options.onError(`ChecklistDOMParser: a link checklist item definition in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}) has no defined target.`);
      return undefined;
    }

    const textContent = element.querySelector(':scope>Text')?.textContent?.trim();

    const text = textContent === undefined ? undefined : ChecklistDOMParser.tryParseTextAsJSON(textContent);

    return {
      type: ChecklistItemType.Link,
      target,
      text
    } as I[ChecklistItemType.Link];
  }

  /**
   * Parses a note checklist item definition from a DOM element.
   * @param element The element to parse.
   * @param groupName The name of the checklist group for which the item is to be parsed.
   * @param listName The name of the checklist list for which the item is to be parsed.
   * @param branchName The name of the checklist branch for which the item is to be parsed.
   * @param options The options to use when parsing.
   * @returns The note checklist item definition parsed from the specified element, or `undefined` if the definition
   * was discarded.
   */
  protected parseNoteItemDef(
    element: Element,
    groupName: string,
    listName: string,
    branchName: string | undefined,
    options: ChecklistDOMParseOptionsToUse<I>
  ): I[ChecklistItemType.Note] | undefined {
    const textContent = element.querySelector(':scope>Text')?.textContent?.trim();
    if (!textContent) {
      options.onError(`ChecklistDOMParser: a note checklist item definition in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}) has no defined text.`);
      return undefined;
    }

    const text = ChecklistDOMParser.tryParseTextAsJSON(textContent);

    return {
      type: ChecklistItemType.Note,
      text
    } as I[ChecklistItemType.Note];
  }

  /**
   * Parses a title checklist item definition from a DOM element.
   * @param element The element to parse.
   * @param groupName The name of the checklist group for which the item is to be parsed.
   * @param listName The name of the checklist list for which the item is to be parsed.
   * @param branchName The name of the checklist branch for which the item is to be parsed.
   * @param options The options to use when parsing.
   * @returns The title checklist item definition parsed from the specified element, or `undefined` if the definition
   * was discarded.
   */
  protected parseTitleItemDef(
    element: Element,
    groupName: string,
    listName: string,
    branchName: string | undefined,
    options: ChecklistDOMParseOptionsToUse<I>
  ): I[ChecklistItemType.Title] | undefined {
    const textContent = element.querySelector(':scope>Text')?.textContent?.trim();
    if (!textContent) {
      options.onError(`ChecklistDOMParser: a title checklist item definition in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}) has no defined text.`);
      return undefined;
    }

    const text = ChecklistDOMParser.tryParseTextAsJSON(textContent);

    return {
      type: ChecklistItemType.Title,
      text,
    } as I[ChecklistItemType.Title];
  }

  /**
   * Parses a spacer checklist item definition from a DOM element.
   * @param element The element to parse.
   * @param groupName The name of the checklist group for which the item is to be parsed.
   * @param listName The name of the checklist list for which the item is to be parsed.
   * @param branchName The name of the checklist branch for which the item is to be parsed.
   * @param options The options to use when parsing.
   * @returns The spacer checklist item definition parsed from the specified element, or `undefined` if the definition
   * was discarded.
   */
  protected parseSpacerItemDef(
    element: Element,
    groupName: string,
    listName: string,
    branchName: string | undefined,
    options: ChecklistDOMParseOptionsToUse<I>
  ): I[ChecklistItemType.Spacer] | undefined {
    const heightAttr = element.getAttribute('height');

    if (heightAttr === null) {
      return { type: ChecklistItemType.Spacer };
    }

    const height = Number(heightAttr);
    if (!Number.isFinite(height) || height < 0) {
      options.onError(`ChecklistDOMParser: invalid height ${heightAttr} for a spacer checklist item (must be a finite non-negative number) in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
      return undefined;
    }

    return {
      type: ChecklistItemType.Spacer,
      height
    } as I[ChecklistItemType.Spacer];
  }

  /**
   * Audits links contained in a parsed checklist set definition.
   * @param set The set to audit.
   * @param options The options to use when parsing.
   */
  protected auditLinksInSet(set: ChecklistSetDef<I>, options: ChecklistDOMParseOptionsToUse<I>): void {
    for (const group of set.groups) {
      this.auditLinksInGroup(set, group, options);
    }
  }

  /**
   * Audits links contained in a parsed checklist group definition.
   * @param set The set containing the group to audit.
   * @param group The group to audit.
   * @param options The options to use when parsing.
   */
  protected auditLinksInGroup(set: ChecklistSetDef<I>, group: ChecklistGroupDef<I>, options: ChecklistDOMParseOptionsToUse<I>): void {
    for (const list of group.lists) {
      this.auditLinksInList(set, group, list, options);
    }
  }

  /**
   * Audits links contained in a parsed checklist list definition.
   * @param set The set containing the group to audit.
   * @param group The group containing the list to audit.
   * @param list The list to audit.
   * @param options The options to use when parsing.
   */
  protected auditLinksInList(
    set: ChecklistSetDef<I>,
    group: ChecklistGroupDef<I>,
    list: ChecklistListDef<I>,
    options: ChecklistDOMParseOptionsToUse<I>
  ): void {
    for (const item of list.items) {
      this.auditLinksInItem(set, group, list, undefined, item, options);
    }

    for (const branch of list.branches) {
      for (const item of branch.items) {
        this.auditLinksInItem(set, group, list, undefined, item, options);
      }
    }
  }

  /**
   * Audits links contained in a parsed checklist item definition.
   * @param set The set containing the group to audit.
   * @param group The group containing the item to audit.
   * @param list The list containing the item to audit.
   * @param branch The branch containing the item to audit, or `undefined` if the item is not in a branch.
   * @param item The item to audit.
   * @param options The options to use when parsing.
   */
  protected auditLinksInItem(
    set: ChecklistSetDef<I>,
    group: ChecklistGroupDef<I>,
    list: ChecklistListDef<I>,
    branch: ChecklistBranchDef<I> | undefined,
    item: ChecklistItemDef<I>,
    options: ChecklistDOMParseOptionsToUse<I>
  ): void {
    switch (item.type) {
      case ChecklistItemType.Branch:
        this.auditBranchItemLinks(set, group, list, branch, item, options);
        break;
      case ChecklistItemType.Link:
        this.auditLinkItemTarget(set, group, list, branch, item, options);
        break;
    }
  }

  /**
   * Audits links contained in a parsed branch checklist item definition.
   * @param set The set containing the group to audit.
   * @param group The group containing the item to audit.
   * @param list The list containing the item to audit.
   * @param branch The branch containing the item to audit, or `undefined` if the item is not in a branch.
   * @param item The item to audit.
   * @param options The options to use when parsing.
   */
  protected auditBranchItemLinks(
    set: ChecklistSetDef<I>,
    group: ChecklistGroupDef<I>,
    list: ChecklistListDef<I>,
    branch: ChecklistBranchDef<I> | undefined,
    item: ChecklistItemDef<I, ChecklistItemType.Branch>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: ChecklistDOMParseOptionsToUse<I>
  ): void {
    for (const branchUid of item.branches) {
      if (list.branches.findIndex(branchDef => branchDef.uid === branchUid) < 0) {
        console.warn(`ChecklistDOMParser: a branch checklist item definition in list ${list.name}${branch === undefined ? '' : `, branch ${branch.name}`} (group ${group.name}) has an invalid branch link: UID "${branchUid}".`);
      }
    }
  }

  /**
   * Audits links contained in a parsed link checklist item definition.
   * @param set The set containing the group to audit.
   * @param group The group containing the item to audit.
   * @param list The list containing the item to audit.
   * @param branch The branch containing the item to audit, or `undefined` if the item is not in a branch.
   * @param item The item to audit.
   * @param options The options to use when parsing.
   */
  protected auditLinkItemTarget(
    set: ChecklistSetDef<I>,
    group: ChecklistGroupDef<I>,
    list: ChecklistListDef<I>,
    branch: ChecklistBranchDef<I> | undefined,
    item: ChecklistItemDef<I, ChecklistItemType.Link>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: ChecklistDOMParseOptionsToUse<I>
  ): void {
    for (const searchGroup of set.groups) {
      for (const searchList of searchGroup.lists) {
        if (searchList.uid === item.target) {
          return;
        }

        for (const searchBranch of searchList.branches) {
          if (searchBranch.uid === item.target) {
            return;
          }
        }
      }
    }

    console.warn(`ChecklistDOMParser: a link checklist item definition in list ${list.name}${branch === undefined ? '' : `, branch ${branch.name}`} (group ${group.name}) has an invalid link target: UID "${item.target}".`);
  }

  /**
   * Processes an error message by either throwing an error or emitting a console warning.
   * @param throwError Whether to throw an error with the message instead of emitting a console warning.
   * @param message The error message.
   * @throws Error if `throwError` is `true`.
   */
  private onError(throwError: boolean, message: string): void {
    if (throwError) {
      throw new Error(message);
    } else {
      console.warn(`${message} ... Discarding the offending definition.`);
    }
  }

  /**
   * Attempts to parse a text string as a JSON-formatted string.
   * @param text The text string to parse.
   * @returns The string parsed from the text string, or the original text string if it did not encode a JSON-formatted
   * string.
   */
  public static tryParseTextAsJSON(text: string): string {
    try {
      const parsedText = JSON.parse(text);
      if (typeof parsedText === 'string') {
        return parsedText;
      }
    } catch {
      // noop
    }

    return text;
  }
}
