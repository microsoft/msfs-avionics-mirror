import { AirportFacility, FlightPathCalculator, FlightPlan, Subject } from 'msfssdk';

import { Fms, ProcedureType, TransitionListItem } from 'garminsdk';

import { FlightPlanFocus } from '../../../../../Shared/UI/FPL/FPLTypesAndProps';
import { SelectApproachController } from '../../../../../Shared/UI/Procedure/Approach/SelectApproachController';
import { ApproachListItem } from '../../../../../Shared/UI/Procedure/Approach/SelectApproachStore';
import { SelectControl2 } from '../../../../../Shared/UI/UiControls2/SelectControl';
import { ViewService } from '../../../../../Shared/UI/ViewService';
import { MFDSelectApproachStore } from './MFDSelectApproachStore';

/**
 * Controller for MFDSelectApproach component.
 */
export class MFDSelectApproachController extends SelectApproachController<MFDSelectApproachStore> {
  /**
   * Creates an instance of select approach controller.
   * @param store The store.
   * @param selectNextCb Callback when the next control should be focused.
   * @param fms Instance of FMS.
   * @param calculator The flight path calculator used by this controller to build preview flight plans.
   * @param viewService The view service used by this controller.
   * @param fplKey The FPL ViewService Key.
   * @param procedurePlan A subject to provide the procedure preview flight plan.
   * @param transitionPlan A subject to provide the procedure transition preview flight plan.
   * @param focus A subject to provide the flight plan focus for the selected approach.
   */
  constructor(
    store: MFDSelectApproachStore,
    selectNextCb: () => void,
    fms: Fms,
    calculator: FlightPathCalculator,
    viewService: ViewService,
    fplKey: string,
    private readonly procedurePlan: Subject<FlightPlan | null>,
    private readonly transitionPlan: Subject<FlightPlan | null>,
    private readonly focus: Subject<FlightPlanFocus>
  ) {
    super(fms.bus, store, selectNextCb, fms, calculator, viewService, fplKey, true);

    store.previewPlan.sub(plan => {
      if (plan && plan === procedurePlan.get()) {
        procedurePlan.notify();
      } else {
        procedurePlan.set(plan);
      }
    }, true);
    store.transitionPreviewPlan.sub(plan => { transitionPlan.set(plan); }, true);
    store.sequence.sub(this.onSequenceChanged.bind(this));
  }

  /**
   * Refreshes the procedure and transition preview plan subjects.
   */
  public refreshPreviewPlans(): void {
    this.procedurePlan.set(this.store.previewPlan.get());
    this.transitionPlan.set((this.store as MFDSelectApproachStore).transitionPreviewPlan.get());
    this.onSequenceChanged();
  }

  /** @inheritdoc */
  protected async onApproachSelectionClosed(source: SelectControl2<ApproachListItem>, selectionMade: boolean): Promise<void> {
    await super.onApproachSelectionClosed(source, selectionMade);

    if (!selectionMade) {
      await this.buildTransitionPreviewPlan(this.store.selectedFacility.get(), this.store.selectedProcedure.get(), this.store.selectedTransition.get());
    }
  }

  /** @inheritdoc */
  protected onApproachSelected(index: number, item: ApproachListItem, isRefresh: boolean): void {
    super.onApproachSelected(index, item, isRefresh);
    this.store.transitionPreviewPlan.set(null);
  }

  /** @inheritdoc */
  protected async onApproachFocused(item: ApproachListItem): Promise<void> {
    await super.onApproachFocused(item);
    await this.buildTransitionPreviewPlan(this.store.selectedFacility.get(), item, this.store.selectedTransition.get());
  }

  /** @inheritdoc */
  protected async onTransSelected(index: number, item: TransitionListItem, isRefresh: boolean): Promise<void> {
    await super.onTransSelected(index, item, isRefresh);
    this.store.transitionPreviewPlan.set(null);
  }

  /** @inheritdoc */
  protected async onTransFocused(item: TransitionListItem): Promise<void> {
    await super.onTransFocused(item);

    await this.buildTransitionPreviewPlan(this.store.selectedFacility.get(), this.store.selectedProcedure.get(), item);
  }

  /**
   * Responds to changes in the selected approach leg sequence.
   */
  private onSequenceChanged(): void {
    const sequence = this.store.sequence.getArray();
    this.focus.set(sequence.length > 0 ? sequence.map(sub => sub.get()) : null);
  }

  private transitionPreviewOpId = 0;

  /**
   * Builds a transition preview flight plan.
   * @param airport The airport of the approach containing the transitions to preview.
   * @param approach The approach containing the transitions to preview.
   * @param transition The currently selected transition.
   */
  private async buildTransitionPreviewPlan(airport?: AirportFacility, approach?: ApproachListItem, transition?: TransitionListItem): Promise<void> {
    if (airport && approach && approach.index >= 0 && !approach.isVisualApproach) {
      const opId = ++this.transitionPreviewOpId;

      const plan = await this.fms.buildProcedureTransitionPreviewPlan(
        this.calculator, airport, ProcedureType.APPROACH, approach.index, transition?.transitionIndex ?? -1
      );

      if (opId === this.transitionPreviewOpId) {
        this.store.transitionPreviewPlan.set(plan.length > 0 ? plan : null);
      }
    } else {
      this.store.transitionPreviewPlan.set(null);
    }
  }
}