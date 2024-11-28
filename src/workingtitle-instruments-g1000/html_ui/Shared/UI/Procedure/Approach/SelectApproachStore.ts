import {
  AirportFacility, ApproachUtils, ArraySubject, ComputedSubject, FacilityLoader, MinimumsMode,
  NumberUnitSubject, Subject, SubscribableArray, Unit, UnitFamily, UnitType, VorFacility,
} from '@microsoft/msfs-sdk';

import { ApproachListItem, FmsUtils, TransitionListItem } from '@microsoft/msfs-garminsdk';

import { SelectProcedureStore } from '../SelectProcedureStore';

/**
 * A data store for SelectApproach.
 */
export class SelectApproachStore extends SelectProcedureStore<ApproachListItem> {

  public readonly minimumsMode = Subject.create<MinimumsMode>(MinimumsMode.OFF);
  public readonly minimumsUnit = ComputedSubject.create<Unit<UnitFamily.Distance>, string>(
    UnitType.FOOT, (u) => { return u === UnitType.METER ? 'M' : 'FT'; }
  );
  public readonly decisionHeight = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));
  public readonly decisionAltitude = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));
  public readonly minimumsSubject = Subject.create(0);
  public minsToggleOptions = ['Off', 'BARO']; //, 'TEMP COMP'];

  public readonly frequencySubject = ComputedSubject.create<number | undefined, string>(undefined, (v): string => {
    if (v !== undefined) {
      return v.toFixed(2);
    }
    return '___.__';
  });

  public readonly selectedTransition = Subject.create<TransitionListItem | undefined>(undefined);

  private readonly _transitions = ArraySubject.create<TransitionListItem>();
  public readonly transitions = this._transitions as SubscribableArray<TransitionListItem>;

  public readonly inputValue = Subject.create('');
  public readonly currentMinFeet = Subject.create(0);

  /**
   * Constructor.
   * @param facLoader The facility loader.
   */
  constructor(private readonly facLoader: FacilityLoader) {
    super();
  }

  /** @inheritdoc */
  protected onSelectedFacilityChanged(facility: AirportFacility | undefined): void {
    this.selectedProcedure.set(undefined);
    this._procedures.set(FmsUtils.getApproaches(facility));
  }

  /** @inheritdoc */
  protected onSelectedProcedureChanged(): void {
    this.refreshTransitions();
    this.refreshApproachFrequencyText();
  }

  /**
   * Refreshes the transitions array to reflect the transition list of the currently selected approach.
   */
  private refreshTransitions(): void {
    this._transitions.set(FmsUtils.getApproachTransitions(this.selectedProcedure.get()));
  }

  private refreshFreqTextOpId = 0;

  /**
   * Refreshes the approach frequency text to reflect the frequency of the currently selected approach.
   */
  private async refreshApproachFrequencyText(): Promise<void> {
    const opId = ++this.refreshFreqTextOpId;
    const selectedApproach = this.selectedProcedure.get();
    if (this.selectedFacility && selectedApproach) {
      let referenceFacility: VorFacility | undefined = undefined;

      if (FmsUtils.approachHasNavFrequency(selectedApproach.approach)) {
        referenceFacility = await ApproachUtils.getReferenceFacility(selectedApproach.approach, this.facLoader) as VorFacility | undefined;

        if (opId !== this.refreshFreqTextOpId) {
          return;
        }
      }

      this.frequencySubject.set(referenceFacility?.freqMHz);
    } else {
      this.frequencySubject.set(undefined);
    }
  }
}