import {
  ChecklistDOMParseOptionsToUse, ChecklistDOMParser, ChecklistItemDef, ChecklistItemType
} from '@microsoft/msfs-sdk';

import {
  GarminChecklistBranchItemLinkItemDef, GarminChecklistItemTextColor, GarminChecklistItemTypeDefMap,
  GarminChecklistLinkItemType, GarminChecklistNormalLinkItemDef
} from './GarminChecklistDefinitions';

/**
 * A parser of Garmin checklist definitions from DOM elements.
 * @template I A map from checklist item types to checklist item definitions to which the definitions parsed by the
 * parser conform. Defaults to `GarminChecklistItemTypeDefMap`. Subclasses that parse item definitions that do not
 * conform to the default map should override this type parameter as appropriate.
 */
export class GarminChecklistDOMParser<I extends GarminChecklistItemTypeDefMap = GarminChecklistItemTypeDefMap> extends ChecklistDOMParser<I> {
  /** @inheritDoc */
  protected parseItemDefArray(
    element: Element,
    groupName: string,
    listName: string,
    branchName: string | undefined,
    options: ChecklistDOMParseOptionsToUse<I>
  ): ChecklistItemDef<I>[] {
    const items: ChecklistItemDef<I>[] = [];

    for (const itemElement of element.querySelectorAll(':scope>Item')) {
      let itemDef = this.parseItemDef(itemElement, groupName, listName, branchName, options);
      if (itemDef) {
        if (itemDef.type === ChecklistItemType.Link && itemDef.linkType === GarminChecklistLinkItemType.BranchItem) {
          itemDef = this.resolveAndValidateBranchItemLinkItemDef(items, itemDef, groupName, listName, branchName, options);
        }

        if (itemDef) {
          items.push(itemDef);

          if (itemDef.type === ChecklistItemType.Branch) {
            const autoLinkItemDefs = this.parseAutoBranchItemLinkItemDefs(itemElement, itemDef, groupName, listName, branchName, options);
            if (autoLinkItemDefs) {
              items.push(...autoLinkItemDefs);
            }
          }
        }
      }
    }

    return items;
  }

  /**
   * Parses automatically generated branch item link item definitions from a parent branch item definition.
   * @param parentItemElement The DOM element from which the parent branch item definition was parsed.
   * @param parentItem The parent branch item definition.
   * @param groupName The name of the checklist group for which the link items are to be parsed.
   * @param listName The name of the checklist list for which the link items are to be parsed.
   * @param branchName The name of the checklist branch for which the link items are to be parsed.
   * @param options The options to use when parsing.
   * @returns The automatically generated branch item link checklist item definitions parsed from the specified parent
   * branch item, or `undefined` none could be parsed.
   */
  protected parseAutoBranchItemLinkItemDefs(
    parentItemElement: Element,
    parentItem: I[ChecklistItemType.Branch],
    groupName: string,
    listName: string,
    branchName: string | undefined,
    options: ChecklistDOMParseOptionsToUse<I>
  ): GarminChecklistBranchItemLinkItemDef[] | undefined {
    if (parentItem.branches.length === 0 || parentItemElement.getAttribute('auto-link')?.toLowerCase() !== 'true') {
      return undefined;
    }

    if (!parentItem.uid) {
      options.onError(`GarminChecklistDOMParser: a branch item definition with the "auto-link" option enabled is missing a UID in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
      return undefined;
    }

    const autoLinkItemDefs: GarminChecklistBranchItemLinkItemDef[] = [];

    for (let linkIndex = 0; linkIndex < parentItem.branches.length; linkIndex++) {
      autoLinkItemDefs.push({
        type: ChecklistItemType.Link,
        target: parentItem.branches[linkIndex],
        linkType: GarminChecklistLinkItemType.BranchItem,
        branchItem: parentItem.uid,
        linkIndex
      });
    }

    return autoLinkItemDefs;
  }

  /**
   * Resolves and validates a branch item link checklist item definition. First, the item definitions preceding the
   * item to resolve and validate will be checked to ensure that the latter is not separated from its parent branch
   * item by any items that are not another branch item link item. Then, the item's specified parent branch item UID
   * will be compared to the actual UID of the candidate parent branch item to ensure they match. If the item does not
   * specify a parent branch item UID, then it will be assigned the UID of the candidate parent. Next, the item's
   * link index will be compared to the parent branch item's linked branch array to ensure the index is not out of
   * bounds. Finally, the item's link target UID will be resolved from the parent branch item's linked branch array.
   * @param itemArray An array of item definitions that precede the item to resolve and validate.
   * @param item The item definition to resolve and validate.
   * @param groupName The name of the checklist group for which the item is to be resolved and validated.
   * @param listName The name of the checklist list for which the item is to be resolved and validated.
   * @param branchName The name of the checklist branch for which the item is to be resolved and validated.
   * @param options The options to use when parsing.
   * @returns The resolved and validated branch item link checklist item definition, or `undefined` if the definition
   * could not be resolved or validated.
   */
  protected resolveAndValidateBranchItemLinkItemDef(
    itemArray: readonly ChecklistItemDef<I>[],
    item: GarminChecklistBranchItemLinkItemDef,
    groupName: string,
    listName: string,
    branchName: string | undefined,
    options: ChecklistDOMParseOptionsToUse<I>
  ): GarminChecklistBranchItemLinkItemDef | undefined {
    for (let i = itemArray.length - 1; i >= 0; i--) {
      const currentItem = itemArray[i];
      switch (currentItem.type) {
        case ChecklistItemType.Branch:
          if (!currentItem.uid) {
            options.onError(`GarminChecklistDOMParser: a parent branch item of a branch item link checklist item definition is missing a UID in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
            return undefined;
          }

          if (item.branchItem === '') {
            // If the parent branch item was not defined, then define it here.
            (item.branchItem as string) = currentItem.uid;
          } else {
            // If the parent branch item was defined, then validate it.
            if (item.branchItem !== currentItem.uid) {
              options.onError(`GarminChecklistDOMParser: a branch item link checklist item definition specifies a different parent branch item UID from the closest preceding branch item ("${item.branchItem}" versus "${currentItem.uid}") in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
              return undefined;
            }
          }

          // Validate that the linked index exists.
          if (item.linkIndex >= currentItem.branches.length) {
            options.onError(`GarminChecklistDOMParser: a branch item link checklist item definition (parent branch item UID "${item.branchItem}") specifies an out-of-bounds link index ("${item.linkIndex}" versus a maximum of "${currentItem.branches.length - 1}") in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
            return undefined;
          }

          // Resolve the target UID.
          (item.target as string) = currentItem.branches[item.linkIndex];

          return item;
        case ChecklistItemType.Link:
          if (currentItem.linkType === GarminChecklistLinkItemType.BranchItem) {
            continue;
          }
        // fallthrough
        default:
          options.onError(`GarminChecklistDOMParser: a branch item link checklist item definition is separated from its parent branch item by a non-link item in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
          return undefined;
      }
    }

    options.onError(`GarminChecklistDOMParser: could not find parent branch item for a branch item link checklist item definition in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
    return undefined;
  }

  /** @inheritDoc */
  protected parseActionableItemDef(
    element: Element,
    groupName: string,
    listName: string,
    branchName: string | undefined,
    options: ChecklistDOMParseOptionsToUse<I>
  ): I[ChecklistItemType.Actionable] | undefined {
    const baseItemDef = super.parseActionableItemDef(element, groupName, listName, branchName, options);
    if (!baseItemDef) {
      return undefined;
    }

    const indentAttr = element.getAttribute('indent');
    const indent = Number(indentAttr ?? 1);
    if (!Number.isInteger(indent) || indent < 1 || indent > 4) {
      options.onError(`GarminChecklistDOMParser: invalid indent "${indentAttr}" for an actionable checklist item (must be 1, 2, 3, or 4) in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
      return undefined;
    }

    const textColorAttr = element.getAttribute('text-color');
    const textColor = GarminChecklistDOMParser.getTextColorFromString(textColorAttr ?? 'white');
    if (!textColor) {
      options.onError(`GarminGarminChecklistDOMParser: invalid text color "${textColorAttr}" for an actionable checklist item in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
      return undefined;
    }

    return {
      ...baseItemDef,
      indent: indent as 1 | 2 | 3 | 4,
      textColor
    } as I[ChecklistItemType.Actionable];
  }

  /** @inheritDoc */
  protected parseBranchItemDef(
    element: Element,
    groupName: string,
    listName: string,
    branchName: string | undefined,
    options: ChecklistDOMParseOptionsToUse<I>
  ): I[ChecklistItemType.Branch] | undefined {
    const baseItemDef = super.parseBranchItemDef(element, groupName, listName, branchName, options);
    if (!baseItemDef) {
      return undefined;
    }

    const uid = element.getAttribute('uid');

    const omitCheckboxAttr = element.getAttribute('omit-checkbox')?.toLowerCase();
    let omitCheckbox: boolean;
    switch (omitCheckboxAttr) {
      case 'true':
        if (baseItemDef.branches.length > 1) {
          omitCheckbox = true;
        } else {
          options.onError(`GarminChecklistDOMParser: invalid "omit-checkbox" option "true" for a branch checklist item with one or fewer linked branches (must be "false") in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
          return undefined;
        }
        break;
      case 'false':
      case undefined:
        omitCheckbox = false;
        break;
      default:
        options.onError(`GarminChecklistDOMParser: invalid "omit-checkbox" option "${omitCheckboxAttr}" for a branch checklist item (must be "true" or "false") in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
        return undefined;
    }

    const indentAttr = element.getAttribute('indent');
    const indent = Number(indentAttr ?? (omitCheckbox ? 0 : 1));
    if (!Number.isInteger(indent) || indent < 0 || indent > 4) {
      options.onError(`GarminChecklistDOMParser: invalid indent "${indentAttr}" for a branch checklist item (must be 0, 1, 2, 3, or 4) in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
      return undefined;
    } else if (indent === 0 && !omitCheckbox) {
      options.onError(`GarminChecklistDOMParser: invalid indent "${indentAttr}" for a branch checklist item with checkbox (must be 1, 2, 3, or 4) in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
      return undefined;
    }

    const justifyAttr = element.getAttribute('justify');
    let justify: 'left' | 'center' | 'right';
    switch (justifyAttr?.toLowerCase() ?? 'left') {
      case 'left':
        justify = 'left';
        break;
      case 'center':
        justify = 'center';
        break;
      case 'right':
        justify = 'right';
        break;
      default:
        options.onError(`GarminChecklistDOMParser: invalid justify "${justifyAttr}" for a branch checklist item in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
        return undefined;
    }

    const textColorAttr = element.getAttribute('text-color');
    const textColor = GarminChecklistDOMParser.getTextColorFromString(textColorAttr ?? 'cyan');
    if (!textColor) {
      options.onError(`GarminGarminChecklistDOMParser: invalid text color "${textColorAttr}" for a branch checklist item in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
      return undefined;
    }

    return {
      ...baseItemDef,
      uid: uid ? uid : undefined,
      omitCheckbox,
      indent: indent as 0 | 1 | 2 | 3 | 4,
      textColor,
      justify
    } as I[ChecklistItemType.Branch];
  }

  /** @inheritDoc */
  protected parseLinkItemDef(
    element: Element,
    groupName: string,
    listName: string,
    branchName: string | undefined,
    options: ChecklistDOMParseOptionsToUse<I>
  ): I[ChecklistItemType.Link] | undefined {
    const linkTypeAttr = element.getAttribute('link-type')?.toLowerCase();
    switch (linkTypeAttr) {
      case 'normal':
      case undefined:
        return this.parseNormalLinkItemDef(element, groupName, listName, branchName, options);
      case 'branch-item':
        return this.parseBranchItemLinkItemDef(element, groupName, listName, branchName, options);
      default:
        options.onError(`GarminChecklistDOMParser: unrecognized link type "${linkTypeAttr}" for a link checklist item in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
        return undefined;
    }
  }

  /**
   * Parses a normal link checklist item definition from a DOM element.
   * @param element The element to parse.
   * @param groupName The name of the checklist group for which the item is to be parsed.
   * @param listName The name of the checklist list for which the item is to be parsed.
   * @param branchName The name of the checklist branch for which the item is to be parsed.
   * @param options The options to use when parsing.
   * @returns The normal link checklist item definition parsed from the specified element, or `undefined` if the
   * definition was discarded.
   */
  protected parseNormalLinkItemDef(
    element: Element,
    groupName: string,
    listName: string,
    branchName: string | undefined,
    options: ChecklistDOMParseOptionsToUse<I>
  ): GarminChecklistNormalLinkItemDef | undefined {
    const baseItemDef = super.parseLinkItemDef(element, groupName, listName, branchName, options);
    if (!baseItemDef) {
      return undefined;
    }

    const indentAttr = element.getAttribute('indent');
    const indent = Number(indentAttr ?? 0);
    if (!Number.isInteger(indent) || indent < 0 || indent > 4) {
      options.onError(`GarminChecklistDOMParser: invalid indent "${indentAttr}" for a link checklist item (must be 0, 1, 2, 3, or 4) in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
      return undefined;
    }

    const justifyAttr = element.getAttribute('justify');
    let justify: 'left' | 'center' | 'right';
    switch (justifyAttr?.toLowerCase() ?? 'left') {
      case 'left':
        justify = 'left';
        break;
      case 'center':
        justify = 'center';
        break;
      case 'right':
        justify = 'right';
        break;
      default:
        options.onError(`GarminChecklistDOMParser: invalid justify "${justifyAttr}" for a link checklist item in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
        return undefined;
    }

    const textColorAttr = element.getAttribute('text-color');
    const textColor = GarminChecklistDOMParser.getTextColorFromString(textColorAttr ?? 'cyan');
    if (!textColor) {
      options.onError(`GarminChecklistDOMParser: invalid text color "${textColorAttr}" for a link checklist item in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
      return undefined;
    }

    return {
      ...baseItemDef,
      linkType: GarminChecklistLinkItemType.Normal,
      indent: indent as 0 | 1 | 2 | 3 | 4,
      textColor,
      justify
    };
  }

  /**
   * Parses a branch item link checklist item definition from a DOM element.
   * @param element The element to parse.
   * @param groupName The name of the checklist group for which the item is to be parsed.
   * @param listName The name of the checklist list for which the item is to be parsed.
   * @param branchName The name of the checklist branch for which the item is to be parsed.
   * @param options The options to use when parsing.
   * @returns The branch item link checklist item definition parsed from the specified element, or `undefined` if the
   * definition was discarded.
   */
  protected parseBranchItemLinkItemDef(
    element: Element,
    groupName: string,
    listName: string,
    branchName: string | undefined,
    options: ChecklistDOMParseOptionsToUse<I>
  ): GarminChecklistBranchItemLinkItemDef | undefined {

    const targetElement = element.querySelector(':scope>Target');
    if (!targetElement) {
      options.onError(`GarminChecklistDOMParser: a link checklist item definition in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}) has no defined target.`);
      return undefined;
    }

    const branchItem = targetElement.getAttribute('branch-item') ?? '';

    const linkIndex = Number(targetElement.textContent?.trim() ?? NaN);
    if (!isFinite(linkIndex) || linkIndex < 0) {
      options.onError(`GarminChecklistDOMParser: missing or unrecognized target link index for a branch item link checklist item definition in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
      return undefined;
    }

    const textContent = element.querySelector(':scope>Text')?.textContent?.trim();
    const text = textContent === undefined ? undefined : ChecklistDOMParser.tryParseTextAsJSON(textContent);

    return {
      type: ChecklistItemType.Link,
      target: '',
      text,
      linkType: GarminChecklistLinkItemType.BranchItem,
      branchItem,
      linkIndex
    };
  }

  /** @inheritDoc */
  protected parseNoteItemDef(
    element: Element,
    groupName: string,
    listName: string,
    branchName: string | undefined,
    options: ChecklistDOMParseOptionsToUse<I>
  ): I[ChecklistItemType.Note] | undefined {
    const baseItemDef = super.parseNoteItemDef(element, groupName, listName, branchName, options);
    if (!baseItemDef) {
      return undefined;
    }

    const indentAttr = element.getAttribute('indent');
    const indent = Number(indentAttr ?? 0);
    if (!Number.isInteger(indent) || indent < 0 || indent > 4) {
      options.onError(`GarminChecklistDOMParser: invalid indent "${indentAttr}" for a note checklist item (must be 0, 1, 2, 3, or 4) in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
      return undefined;
    }

    const justifyAttr = element.getAttribute('justify');
    let justify: 'left' | 'center' | 'right';
    switch (justifyAttr?.toLowerCase() ?? 'left') {
      case 'left':
        justify = 'left';
        break;
      case 'center':
        justify = 'center';
        break;
      case 'right':
        justify = 'right';
        break;
      default:
        options.onError(`GarminChecklistDOMParser: invalid justify "${justifyAttr}" for a note checklist item in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
        return undefined;
    }

    const textColorAttr = element.getAttribute('text-color');
    const textColor = GarminChecklistDOMParser.getTextColorFromString(textColorAttr ?? 'white');
    if (!textColor) {
      options.onError(`GarminGarminChecklistDOMParser: invalid text color "${textColorAttr}" for a note checklist item in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
      return undefined;
    }

    return {
      ...baseItemDef,
      indent: indent as 0 | 1 | 2 | 3 | 4,
      textColor,
      justify,
    } as I[ChecklistItemType.Note];
  }

  /** @inheritDoc */
  protected parseTitleItemDef(
    element: Element,
    groupName: string,
    listName: string,
    branchName: string | undefined,
    options: ChecklistDOMParseOptionsToUse<I>
  ): I[ChecklistItemType.Title] | undefined {
    const baseItemDef = super.parseTitleItemDef(element, groupName, listName, branchName, options);
    if (!baseItemDef) {
      return undefined;
    }

    const indentAttr = element.getAttribute('indent');
    const indent = Number(indentAttr ?? 0);
    if (!Number.isInteger(indent) || indent < 0 || indent > 4) {
      options.onError(`GarminChecklistDOMParser: invalid indent "${indentAttr}" for a title checklist item (must be 0, 1, 2, 3, or 4) in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
      return undefined;
    }

    const textColorAttr = element.getAttribute('text-color');
    const textColor = GarminChecklistDOMParser.getTextColorFromString(textColorAttr ?? 'white');
    if (!textColor) {
      options.onError(`GarminGarminChecklistDOMParser: invalid text color "${textColorAttr}" for a note checklist item in list ${listName}${branchName === undefined ? '' : `, branch ${branchName}`} (group ${groupName}).`);
      return undefined;
    }

    return {
      ...baseItemDef,
      indent: indent as 0 | 1 | 2 | 3 | 4,
      textColor
    } as I[ChecklistItemType.Title];
  }

  /** @inheritDoc */
  protected parseSpacerItemDef(
    element: Element,
    groupName: string,
    listName: string,
    branchName: string | undefined,
    options: ChecklistDOMParseOptionsToUse<I>
  ): I[ChecklistItemType.Spacer] | undefined {
    const def = super.parseSpacerItemDef(element, groupName, listName, branchName, options);
    if (def && def.height === undefined) {
      return { ...def, height: 1 };
    } else {
      return def;
    }
  }

  /**
   * Parses a Garmin checklist text color from an optional string.
   * @param string The string to parse.
   * @returns The Garmin checklist text color parsed from the specified string, or `undefined` if none could be parsed.
   */
  private static getTextColorFromString(string: string): GarminChecklistItemTextColor | undefined {
    switch (string?.toLowerCase()) {
      case 'white':
        return GarminChecklistItemTextColor.White;
      case 'silver':
        return GarminChecklistItemTextColor.Silver;
      case 'gray':
      case 'grey':
        return GarminChecklistItemTextColor.Gray;
      case 'navy':
        return GarminChecklistItemTextColor.Navy;
      case 'cyan':
        return GarminChecklistItemTextColor.Cyan;
      case 'lime':
        return GarminChecklistItemTextColor.Lime;
      case 'green':
        return GarminChecklistItemTextColor.Green;
      case 'yellow':
        return GarminChecklistItemTextColor.Yellow;
      case 'olive':
        return GarminChecklistItemTextColor.Olive;
      case 'red':
        return GarminChecklistItemTextColor.Red;
      case 'maroon':
        return GarminChecklistItemTextColor.Maroon;
      case 'magenta':
        return GarminChecklistItemTextColor.Magenta;
      default:
        return undefined;
    }
  }
}
