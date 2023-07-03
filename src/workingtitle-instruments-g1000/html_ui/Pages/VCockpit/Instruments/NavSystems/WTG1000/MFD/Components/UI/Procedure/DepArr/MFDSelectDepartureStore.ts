import { FlightPlan, Subject } from '@microsoft/msfs-sdk';

import { SelectDepartureStore } from '../../../../../Shared/UI/Procedure/DepArr/SelectDepartureStore';

/**
 * A data store for the MFD departure selection component.
 */
export class MFDSelectDepartureStore extends SelectDepartureStore {
  public readonly transitionPreviewPlan = Subject.create<FlightPlan | null>(null);
}