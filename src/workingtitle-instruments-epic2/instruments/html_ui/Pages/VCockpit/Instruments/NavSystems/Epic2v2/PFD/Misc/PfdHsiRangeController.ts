import { EventBus, MathUtils, UserSettingManager } from '@microsoft/msfs-sdk';

import { Epic2PfdControlPfdEvents, HsiRange, PfdAliasedUserSettingTypes } from '@microsoft/msfs-epic2-shared';

/** A PFD HSI Range controller. */
export class PfdHsiRangeController {
  private readonly rangeSetting = this.pfdSettings.getSetting('hsiRange');

  private static readonly hsiRanges: HsiRange[] = [5, 10, 25, 50, 100, 200, 300, 400, 500, 1000, 2000];

  /**
   * Ctor.
   * @param bus The instrument event bus.
   * @param pfdSettings The settings for this PFD.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly pfdSettings: UserSettingManager<PfdAliasedUserSettingTypes>,
  ) {
    const sub = this.bus.getSubscriber<Epic2PfdControlPfdEvents>();

    sub.on('pfd_control_range_increment').handle(this.incrementRange.bind(this, 1));
    sub.on('pfd_control_range_decrement').handle(this.incrementRange.bind(this, -1));
  }

  /**
   * Increments or decrements the HSI range by one step.
   * @param increment The sign of the increment to make.
   */
  private incrementRange(increment: 1 | -1): void {
    const currentIndex = PfdHsiRangeController.hsiRanges.indexOf(this.rangeSetting.get());
    const newIndex = MathUtils.clamp(currentIndex + increment, 0, PfdHsiRangeController.hsiRanges.length - 1);
    this.rangeSetting.set(PfdHsiRangeController.hsiRanges[newIndex]);
  }
}
