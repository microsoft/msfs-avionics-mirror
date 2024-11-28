import { VNode, FSComponent, MutableSubscribable, Subject, MappedSubject, Subscription } from '@microsoft/msfs-sdk';
import { SelectableFlightPlanListData } from '@microsoft/msfs-wtg3000-common';
import { GtcViewEntry } from '../../GtcService/GtcService';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';

/**
 * Component props for GtcFlightPlanPageSlideoutMenu.
 */
export interface GtcFlightPlanPageSlideoutMenuProps extends GtcViewProps {
  /**
   * A mutable subscribable which controls the selected list data. If not defined, pressing the list item's leg button
   * will not cause its list data to become selected or unselected.
   */
  selectedListData: MutableSubscribable<SelectableFlightPlanListData | null>;
}

/** OriginOptionsSlideoutMenu. */
export abstract class GtcFlightPlanPageSlideoutMenu<Data extends SelectableFlightPlanListData, P extends GtcFlightPlanPageSlideoutMenuProps = GtcFlightPlanPageSlideoutMenuProps>
  extends GtcView<P> {

  protected static readonly CLOSE_MENU_SELECTOR = (steps: number, stackPeeker: (depth: number) => GtcViewEntry<GtcView<GtcViewProps>> | undefined): boolean => {
    return stackPeeker(0)?.key === GtcViewKeys.FlightPlan;
  };

  private thisNode?: VNode;

  protected readonly listItemData = Subject.create<Data | null>(null);

  protected readonly isListDataSelected = MappedSubject.create(
    ([selectedListData, listData]) => selectedListData === listData,
    this.props.selectedListData,
    this.listItemData
  );

  protected closeWhenUnselectedSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.closeWhenUnselectedSub = this.isListDataSelected.sub(isSelected => {
      if (!isSelected) {
        this.closeMenu();
      }
    }, false, true);
  }

  /**
   * Pass initial list item data to use.
   * @param listItemData The list item data.
   */
  public setData(listItemData: Data): void {
    this.closeWhenUnselectedSub?.pause();

    this.listItemData.set(listItemData);

    if (this.props.gtcService.activeView.get().ref === this) {
      // We don't use this.isListDataSelected here in case this method was called in a handler callback for the
      // selected list data subscribable, in which case the value of this.isListDataSelected might not be properly
      // updated yet.
      if (this.props.selectedListData.get() === listItemData) {
        this.closeWhenUnselectedSub?.resume();
      } else {
        this.closeMenu();
      }
    }
  }

  /** @inheritdoc */
  public onResume(): void {
    if (this.listItemData.get() !== null) {
      this.closeWhenUnselectedSub?.resume(true);
    }
  }

  /** @inheritdoc */
  public onClose(): void {
    this.closeWhenUnselectedSub?.pause();

    if (this.isListDataSelected.get()) {
      this.props.selectedListData.set(null);
    }

    this.listItemData.set(null);
  }

  /**
   * Closes this menu to end up on the flight plan page.
   */
  protected closeMenu(): void {
    this.gtcService.goBackTo(GtcFlightPlanPageSlideoutMenu.CLOSE_MENU_SELECTOR);
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.isListDataSelected.destroy();

    super.destroy();
  }
}