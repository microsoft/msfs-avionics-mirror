import { ArraySubject, FlightPlan, LegDefinition, Subject } from '@microsoft/msfs-sdk';

import { SelectApproachStore } from '../../../../../Shared/UI/Procedure/Approach/SelectApproachStore';

/**
 * A data store for the MFD approach selection component.
 */
export class MFDSelectApproachStore extends SelectApproachStore {
  public readonly sequence = ArraySubject.create<Subject<LegDefinition>>();

  public readonly previewPlan = Subject.create<FlightPlan | null>(null);
  public readonly transitionPreviewPlan = Subject.create<FlightPlan | null>(null);
}