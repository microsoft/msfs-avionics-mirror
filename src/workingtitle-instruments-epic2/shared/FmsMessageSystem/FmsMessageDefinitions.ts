
import { FmsMessage } from './FmsMessage';
import { FmsMessageKey } from './FmsMessageKeys';

/**
 * Object associating {@link FmsMessageDefinitions} keys to pre-made {@link FmsMessage} objects
 */
export const DefinedFmsMessages: Record<Exclude<FmsMessageKey, FmsMessageKey.Generic>, FmsMessage> = {
  [FmsMessageKey.GenericInvalidEntry]: new FmsMessage(
    true,
    'INVALID ENTRY',
    [{ style: 'small', text: 'INVALID ENTRY' }],
  ),
  [FmsMessageKey.InvalidFlightPlanOp]: new FmsMessage(
    true,
    'INVALID FPLN OPERATION',
    [{ style: 'small', text: 'INVALID FPLN OPERATION' }],
  ),
  [FmsMessageKey.CheckVSpeeds]: new FmsMessage(
    true,
    'CHECK VSPEEDS',
    [{ style: 'small', text: 'CHECK VSPEEDS' }],
  ),
  [FmsMessageKey.CheckAltConstraint]: new FmsMessage(
    true,
    'CHECK ALT CONSTRAINT',
    [{ style: 'small', text: 'CHECK ALT CONSTRAINT' }],
  ),
  [FmsMessageKey.CheckBaroSet]: new FmsMessage(
    true,
    'CHECK BARO SET',
    [{ style: 'small', text: 'CHECK BARO SET' }],
  ),
  [FmsMessageKey.CompareFuelQty]: new FmsMessage(
    true,
    'COMPARE FUEL QUANTITY',
    [{ style: 'small', text: 'COMPARE FUEL QUANTITY' }],
  ),
  [FmsMessageKey.ResetAltSel]: new FmsMessage(
    true,
    'RESET ALT SEL?',
    [{ style: 'small', text: 'RESET ALT SEL?' }],
  ),
  [FmsMessageKey.UnableRnp]: new FmsMessage(
    true,
    'UNABLE RNP',
    [{ style: 'small', text: 'UNABLE RNP' }],
  ),
  [FmsMessageKey.UnableNextAlt]: new FmsMessage(
    true,
    'UNABLE NEXT ALT',
    [{ style: 'small', text: 'UNABLE NEXT ALT' }],
  ),

  // Fictional
};
