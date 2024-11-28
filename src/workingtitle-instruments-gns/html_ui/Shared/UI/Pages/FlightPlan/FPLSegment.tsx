import {
  ActiveLegType, ArraySubject, BitFlags, EventBus, FlightPlanActiveLegEvent, FlightPlanCalculatedEvent, FlightPlanLegEvent,
  FlightPlanSegment, FlightPlanSegmentType, FocusPosition, FSComponent, HardwareUiControl, LegDefinition,
  LegDefinitionFlags, LegEventType, LegType, NodeReference, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { DirectToState, Fms, LegIndexes } from '@microsoft/msfs-garminsdk';

import { GNSUiControl, GNSUiControlList, GNSUiControlProps } from '../../GNSUiControl';
import { FPLEntry } from './FPLEntry';
import { LegArrowType } from './FPLLegArrow';
import { FPLPageUtils } from './FPLPageUtils';
import { FPLSegmentHeader } from './FPLSegmentHeader';
import { GnsLegDataItem } from './GnsLegDataItem';
import { GNSType } from '../../../UITypes';

/**
 * Props on the FPLSegment component.
 */
export interface FPLSegmentProps extends GNSUiControlProps {
  /** The GNS type */
  gnsType: GNSType,

  /** The flight plan segment to display. */
  segment: FlightPlanSegment;

  /** An instance of the bus to subscribe to. */
  bus: EventBus;

  /** An instance of the FMS. */
  fms: Fms;

  /** A callback called when a leg is selected. */
  onSelected?: (legIndex: number) => void;

  /** A callback called when an entry at a leg index must be focused*/
  onFocusLegIndex: (legIndex: number) => void;

  /** The container to scroll when an element is focused. */
  scrollContainer: NodeReference<HTMLDivElement>;
}

/**
 * A control component that displays a flight plan segment.
 */
export class FPLSegment extends GNSUiControl<FPLSegmentProps> {
  private legSubscription?: Subscription;
  private calcSubscription?: Subscription;
  private activeLegSubscription?: Subscription;

  public readonly legs = ArraySubject.create<GnsLegDataItem>();
  private readonly header = FSComponent.createRef<FPLSegmentHeader>();
  private readonly el = FSComponent.createRef<HTMLDivElement>();
  private readonly scrollContainer = FSComponent.createRef<HTMLElement>();
  private readonly legList = FSComponent.createRef<GNSUiControlList<GnsLegDataItem>>();

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);
    this.props.segment.legs.forEach((leg, i) => this.insertLeg(i, leg));

    this.legSubscription = this.props.fms.flightPlanner
      .onEvent('fplLegChange')
      .handle(this.onLegChanged.bind(this));
    this.calcSubscription = this.props.fms.flightPlanner
      .onEvent('fplCalculated')
      .handle(this.onCalculated.bind(this));
    this.activeLegSubscription = this.props.fms.flightPlanner
      .onEvent('fplActiveLegChange')
      .handle(this.onActiveLegChanged.bind(this));

    this.setHeader();

    if (this.el.instance.parentElement !== null) {
      this.scrollContainer.instance = this.el.instance.parentElement;
    }

    this.disableOnEmpty();
  }

  /**
   * Gets the number of displayed lines in the segment.
   * @returns The number of FPL page lines in the segment.
   */
  public getLineCount(): number {
    if (this.header.instance.isDisabled) {
      return this.props.segment.legs.length;
    } else {
      return this.props.segment.legs.length + 1;
    }
  }

  /**
   * Scrolls to a leg in the segment.
   * @param index The index of the leg in the segment to scroll to.
   */
  public scrollToLeg(index: number): void {
    const fplEntry = this.legList.instance.getChildInstance<FPLEntry>(index);
    if (fplEntry !== null) {
      fplEntry.focus(FocusPosition.First);
      fplEntry.blur();

      this.legList.instance.ensureIndexInView(index, 'top');
    }
  }

  /**
   * Focuses a leg in the segment.
   * @param index The index of the leg in the segment to focus.
   */
  public focusLeg(index: number): void {
    const fplEntry = this.legList.instance.getChildInstance<FPLEntry>(index);

    if (fplEntry) {
      fplEntry.focus(FocusPosition.First);
    }
  }

  /**
   * Reconciles the active leg arrows when a flight plan change doesn't trigger the active leg changed event.
   * @param legIndexes The leg indexes for the active leg.
   */
  public reconcileActiveLeg(legIndexes: LegIndexes): void {
    this.onActiveLegChanged({
      planIndex: Fms.PRIMARY_PLAN_INDEX,
      index: legIndexes.globalLegIndex,
      segmentIndex: legIndexes.segmentIndex,
      legIndex: legIndexes.segmentLegIndex,
      previousSegmentIndex: legIndexes.segmentIndex,
      previousLegIndex: legIndexes.segmentLegIndex,
      type: ActiveLegType.Lateral
    });
  }

  /**
   * Sets the segment header, if applicable.
   */
  private async setHeader(): Promise<void> {
    switch (this.props.segment.segmentType) {
      case FlightPlanSegmentType.Departure:
        await this.setDepartureHeader();
        break;
      case FlightPlanSegmentType.Enroute:
        this.header.instance.setDisabled(false);
        break;
      case FlightPlanSegmentType.Arrival:
        await this.setArrivalHeader();
        break;
      case FlightPlanSegmentType.Approach:
        await this.setApproachHeader();
        break;
    }
  }

  /**
   * Sets a departure header on the header component.
   */
  private async setDepartureHeader(): Promise<void> {
    const departureNames = await FPLPageUtils.getDepartureNames(this.props.fms);

    if (departureNames !== undefined) {
      this.header.instance.setName(departureNames.short, departureNames.long);
      this.header.instance.setDisabled(false);
    } else {
      this.header.instance.setName('');
      this.header.instance.setDisabled(true);
    }
  }

  /**
   * Sets an arrival header on the header component.
   */
  private async setArrivalHeader(): Promise<void> {
    const arrivalNames = await FPLPageUtils.getArrivalNames(this.props.fms);

    if (arrivalNames !== undefined) {
      this.header.instance.setName(arrivalNames.short, arrivalNames.long);
      this.header.instance.setDisabled(false);
    } else {
      this.header.instance.setName('');
      this.header.instance.setDisabled(true);
    }
  }

  /**
   * Sets an approach header on the header component.
   */
  private async setApproachHeader(): Promise<void> {
    const approachNames = await FPLPageUtils.getApproachNames(this.props.fms);

    if (approachNames !== undefined) {
      this.header.instance.setName(approachNames.short, approachNames.long);
      this.header.instance.setDisabled(false);
    } else {
      this.header.instance.setName('');
      this.header.instance.setDisabled(true);
    }
  }

  /**
   * Handles when a leg is changed in the segment.
   * @param evt The event describing the change.
   */
  private onLegChanged(evt: FlightPlanLegEvent): void {
    if (evt.planIndex === Fms.PRIMARY_PLAN_INDEX && evt.segmentIndex === this.props.segment.segmentIndex) {
      switch (evt.type) {
        case LegEventType.Added:
          this.insertLeg(evt.legIndex, evt.leg);
          break;
        case LegEventType.Removed:
          this.removeLeg(evt.legIndex);
          break;
        case LegEventType.Changed:
          this.removeLeg(evt.legIndex);
          this.insertLeg(evt.legIndex, evt.leg);
          break;
      }
    }

    const plan = this.props.fms.getFlightPlan(evt.planIndex);

    const segmentIndex = plan.getSegmentIndex(plan.activeLateralLeg);
    const segmentLegIndex = plan.getSegmentLegIndex(plan.activeLateralLeg);
    const globalLegIndex = plan.activeLateralLeg;

    this.reconcileActiveLeg({ segmentIndex, segmentLegIndex, globalLegIndex });
    this.disableOnEmpty();
  }

  /**
   * Handles when the active leg changes.
   * @param evt The active leg event to process.
   */
  private onActiveLegChanged(evt: FlightPlanActiveLegEvent): void {
    if (evt.planIndex === Fms.PRIMARY_PLAN_INDEX && evt.type === ActiveLegType.Lateral) {
      this.clearLegArrows();

      const inSegment = evt.segmentIndex === this.props.segment.segmentIndex;
      const directToState = this.props.fms.getDirectToState();

      if (inSegment) {
        if (evt.legIndex === 0 && directToState !== DirectToState.TOEXISTING) {
          this.header.instance.setLegArrow(LegArrowType.Between);
        }

        if (directToState !== DirectToState.TOEXISTING) {
          const fplEntry = this.legList.instance.getChildInstance<FPLEntry>(evt.legIndex);

          if (fplEntry !== null) {
            const plan = this.props.fms.getFlightPlan(evt.planIndex);
            const globalLegIndex = this.props.segment.offset + evt.legIndex;

            if (globalLegIndex === 0 && globalLegIndex === plan.activeLateralLeg) {
              fplEntry.setLegArrow(LegArrowType.None);
            } else {
              const legDefinition = fplEntry.props.data?.legDefinition.get();
              const prevLeg = plan.tryGetLeg(evt.index - 1);

              if (legDefinition &&
                (BitFlags.isAny(legDefinition.flags, LegDefinitionFlags.VectorsToFinalFaf)
                  || (prevLeg && legDefinition.leg.type === LegType.CF && prevLeg.leg.type === LegType.ThruDiscontinuity))) {
                fplEntry.setLegArrow(LegArrowType.Direct);
                return;
              } else {
                fplEntry.setLegArrow(LegArrowType.To);
              }
            }
          }

          const prevFplEntry = this.legList.instance.getChildInstance<FPLEntry>(evt.legIndex - 1);

          if (prevFplEntry !== null) {
            prevFplEntry.setLegArrow(LegArrowType.From);
          }
        } else if (directToState === DirectToState.TOEXISTING) {
          const fplEntry = this.legList.instance.getChildInstance<FPLEntry>(evt.legIndex - 3);

          if (fplEntry !== null) {
            fplEntry.setLegArrow(LegArrowType.Direct);
          }
        }
      } else {
        const plan = this.props.fms.getPrimaryFlightPlan();
        const prevLeg = plan.tryGetLeg(evt.index - 1);

        if (prevLeg !== null) {
          const segment = plan.getSegmentFromLeg(prevLeg);
          if (segment === this.props.segment && directToState !== DirectToState.TOEXISTING) {
            const fplEntry = this.legList.instance.getChildInstance<FPLEntry>(this.legList.instance.length - 1);

            if (fplEntry !== null) {
              fplEntry.setLegArrow(LegArrowType.From);
            }
          }
        }
      }
    }
  }

  /**
   * Clears all leg arrows in the FPL segment.
   */
  private clearLegArrows(): void {
    for (let i = 0; i < this.legList.instance.length; i++) {
      const legEntry = this.legList.instance.getChildInstance<FPLEntry>(i);
      if (legEntry !== null) {
        legEntry.setLegArrow(LegArrowType.None);
      }
    }

    this.header.instance.setLegArrow(LegArrowType.None);
  }

  /**
   * Disables the control when the segment contains no legs.
   */
  private disableOnEmpty(): void {
    if (this.props.segment.legs.length === 0) {
      this.setDisabled(true);
      this.header.instance.setName('');
      this.header.instance.setDisabled(true);
    } else {
      if (this.isDisabled) {
        this.setDisabled(false);
        this.setHeader();
      }
    }
  }

  /**
   * Handles when the flight plan is calculated.
   * @param evt The event describing the calculation.
   */
  private onCalculated(evt: FlightPlanCalculatedEvent): void {
    if (evt.planIndex === Fms.PRIMARY_PLAN_INDEX) {
      for (let i = 0; i < this.props.segment.legs.length; i++) {
        const leg = this.props.segment.legs[i];
        const legItem = this.legs.tryGet(i);

        legItem?.legDefinition.set(leg);
      }
    }
  }

  /**
   * Inserts a leg into the segment's legs.
   * @param index The index to insert at.
   * @param leg The leg to insert.
   */
  private insertLeg(index: number, leg?: LegDefinition): void {
    if (leg !== undefined) {
      const data = new GnsLegDataItem(leg);
      this.legs.insert(data, index);
    }
  }

  /**
   * Removes a leg from the segment's legs.
   * @param index The index to remove at.
   */
  private removeLeg(index: number): void {
    this.legs.removeAt(index);
    this.props.onFocusLegIndex(index);
  }

  /**
   * A callback called when the header is selected.
   */
  private onHeaderSelected(): void {
    this.props.onSelected && this.props.onSelected(-1);
  }

  /**
   * A callback called when a leg is selected in the leg list.
   * @param item The data item that was selected.
   * @param control The control associated with the data item.
   * @param index The index of the item that was selected.
   */
  private onLegSelected(item: GnsLegDataItem | null, control: HardwareUiControl | null, index: number): void {
    this.props.onSelected && this.props.onSelected(index);
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.legSubscription?.destroy();
    this.calcSubscription?.destroy();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.el}>
        <FPLSegmentHeader ref={this.header} scrollContainer={this.props.scrollContainer} type={this.props.segment.segmentType}
          fms={this.props.fms} onSelected={this.onHeaderSelected.bind(this)} />
        <GNSUiControlList<GnsLegDataItem> data={this.legs}
          renderItem={(data: GnsLegDataItem): VNode => <FPLEntry data={data} fms={this.props.fms} gnsType={this.props.gnsType} />} ref={this.legList}
          scrollContainer={this.props.scrollContainer} hideScrollbar onItemSelected={this.onLegSelected.bind(this)} />
      </div>
    );
  }
}