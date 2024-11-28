import { FmsMessageCategories } from './FmsMessageCategories';

/**
 * FMS message definitions.
 */
export enum FmsMessageKey {
  Generic = 'Generic',
  GenericInvalidEntry = 'GenericInvalidEntry',
  InvalidFlightPlanOp = 'InvalidFlightPlanOperation',
  CheckVSpeeds = 'CheckVSpeeds',
  CheckAltConstraint = 'CheckAltConstraint',
  UnableNextAlt = 'UnableNextAlt',
  CheckBaroSet = 'CheckBaroSet',
  CompareFuelQty = 'CompareFuelQty',
  ResetAltSel = 'ResetAltSel',
  UnableRnp = 'UnableRnp',

  // Fictional
}

export const FmsMessageKeyCategories: { [k in FmsMessageKey]: FmsMessageCategories } = {
  [FmsMessageKey.Generic]: FmsMessageCategories.Advisory,
  [FmsMessageKey.GenericInvalidEntry]: FmsMessageCategories.EntryErrorAdvisory,
  [FmsMessageKey.InvalidFlightPlanOp]: FmsMessageCategories.EntryErrorAdvisory,
  [FmsMessageKey.CheckVSpeeds]: FmsMessageCategories.EntryErrorAdvisory,
  [FmsMessageKey.CheckAltConstraint]: FmsMessageCategories.EntryErrorAdvisory,
  [FmsMessageKey.UnableNextAlt]: FmsMessageCategories.EntryErrorAdvisory,
  [FmsMessageKey.CheckBaroSet]: FmsMessageCategories.EntryErrorAdvisory,
  [FmsMessageKey.CompareFuelQty]: FmsMessageCategories.EntryErrorAdvisory,
  [FmsMessageKey.ResetAltSel]: FmsMessageCategories.EntryErrorAdvisory,
  [FmsMessageKey.UnableRnp]: FmsMessageCategories.EntryErrorAdvisory,

  // Fictional
};
