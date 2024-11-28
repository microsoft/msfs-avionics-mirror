import { NumericBusConfigContext, NumericConfigResult } from '@microsoft/msfs-wtg3000-common';

/**
 * A function that creates a definition of a normalized angle of attack value.
 */
export type AoaValueDefinitionFactory = (context: NumericBusConfigContext) => NumericConfigResult;
