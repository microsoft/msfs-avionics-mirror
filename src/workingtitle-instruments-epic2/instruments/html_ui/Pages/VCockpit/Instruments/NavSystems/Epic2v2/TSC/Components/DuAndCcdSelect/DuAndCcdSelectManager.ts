import { ConsumerSubject, EventBus, MappedSubject, Subscribable } from '@microsoft/msfs-sdk';

import { DisplayUnitIndices, Epic2DuControlEvents } from '@microsoft/msfs-epic2-shared';

/** Keeps track of the currently selected DU, which is selected using the buttons in TSC's DU & CCD tab. */
export class DuAndCcdSelectManager {
  private readonly subscriber = this.bus.getSubscriber<Epic2DuControlEvents>();

  /**
   * To be used in `DuAndCcdTabContent`. Not to be confused with `trueDuIndex`
   * which is the index of the selected DU with MFD swap taken into account.
   */
  private readonly _selectedDu = ConsumerSubject.create<DisplayUnitIndices>(
    this.subscriber.on('epic2_selected_display_unit'),
    DisplayUnitIndices.PfdLeft
  );
  private readonly isMFDSwapped = ConsumerSubject.create<boolean>(
    this.subscriber.on('epic2_mfd_swap'),
    false
  );
  /** The index of the selected DU with MFD swap taken into account. */
  private readonly _trueDuIndex = MappedSubject.create(
    ([selectedDu, isSwapped]) => {
      let display = selectedDu;
      if (isSwapped) {
        display = display === DisplayUnitIndices.MfdLower ? DisplayUnitIndices.MfdUpper :
          display === DisplayUnitIndices.MfdUpper ? DisplayUnitIndices.MfdLower : display;
      }
      return display;
    },
    this._selectedDu,
    this.isMFDSwapped,
  );

  /**
   * To be used in `DuAndCcdTabContent`. Not to be confused with `trueDuIndex`
   * which is the index of the selected DU with MFD swap taken into account.
   */
  public readonly selectedDu = this._selectedDu as Subscribable<DisplayUnitIndices>;

  /** The index of the selected DU with MFD swap taken into account. */
  public readonly trueDuIndex = this._trueDuIndex as Subscribable<DisplayUnitIndices>;

  /**
   * The constructor of `DuAndCcdSelectManager`
   * @param bus An instance of the event bus.
   */
  constructor(private readonly bus: EventBus) {}

  /** Destroys this manager. */
  public destroy(): void {
    this.isMFDSwapped.destroy();
    this._selectedDu.destroy();
    this._trueDuIndex.destroy();
  }
}
