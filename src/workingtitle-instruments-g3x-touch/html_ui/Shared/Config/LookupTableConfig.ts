import { LerpLookupTable } from '@microsoft/msfs-sdk';

import { ResolvableConfig } from './Config';

/**
 * A configuration object which defines a lookup table.
 */
export class LookupTableConfig implements ResolvableConfig<LerpLookupTable> {
  /** @inheritdoc */
  public readonly isResolvableConfig = true;

  /** The dimension count of this config's lookup table. */
  public readonly dimensions: number;

  /** The breakpoints of this config's lookup table. */
  public readonly breakpoints: readonly (readonly number[])[];

  /**
   * Creates a new LookupTableConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element) {
    if (element.tagName !== 'LookupTable') {
      throw new Error(`Invalid LookupTableConfig definition: expected tag name 'LookupTable' but was '${element.tagName}'`);
    }

    const dimensions = element.getAttribute('dimensions');
    if (dimensions === null) {
      throw new Error('Invalid LookupTableConfig definition: undefined \'dimensions\' attribute');
    }

    const parsedDimensions = Number(dimensions);
    if (isNaN(parsedDimensions) || Math.trunc(parsedDimensions) !== parsedDimensions || parsedDimensions <= 0) {
      throw new Error(`Invalid LookupTableConfig definition: expected 'dimensions' to be a positive integer but was '${dimensions}'`);
    }
    this.dimensions = parsedDimensions;

    const value = element.textContent;
    if (value === null) {
      throw new Error('Invalid LookupTableConfig definition: undefined value');
    }

    let parsedValue: any = undefined;
    try {
      parsedValue = JSON.parse(value);
    } catch {
      // continue
    }

    if (parsedValue instanceof Array) {
      for (const breakpoint of parsedValue) {
        if (!(breakpoint instanceof Array && breakpoint.length === parsedDimensions + 1 && breakpoint.every(el => typeof el === 'number'))) {
          throw new Error('Invalid LookupTableConfig definition: malformed lookup table array');
        }
      }
    } else {
      throw new Error('Invalid LookupTableConfig definition: value was not an array');
    }

    this.breakpoints = parsedValue;
  }

  /** @inheritdoc */
  public resolve(): LerpLookupTable {
    const table = new LerpLookupTable(this.dimensions);

    for (const breakpoint of this.breakpoints) {
      table.insertBreakpoint(breakpoint);
    }

    return table;
  }
}