import { EventBus, Instrument, NavComEvents, Subject } from '@microsoft/msfs-sdk';

import { Epic2DmeStateEvents, NavComUserSettingManager } from '@microsoft/msfs-epic2-shared';

/** A controller for the DME receivers. */
export class Epic2DmeController implements Instrument {
  private readonly isDme1HoldOn = this.navComSettings.getSetting('dme1HoldOn');
  private readonly isDme2HoldOn = this.navComSettings.getSetting('dme2HoldOn');

  private readonly isDmePairingSwapped = this.navComSettings.getSetting('dmePairSwapped');

  private readonly nav1DmeAssociation = Subject.create<1 | 2>(1);
  private readonly nav2DmeAssociation = Subject.create<1 | 2>(2);
  private readonly nav1DmeHold = Subject.create(false);
  private readonly nav2DmeHold = Subject.create(false);

  private nav1Frequency = 0;
  private nav2Frequency = 0;

  private readonly dme1Frequency = Subject.create(0);
  private readonly dme2Frequency = Subject.create(0);

  /**
   * Ctor.
   * @param bus The instrument event bus.
   * @param navComSettings The NAV/COM user settings manager.
   */
  constructor(private readonly bus: EventBus, private readonly navComSettings: NavComUserSettingManager) {}

  /** @inheritdoc */
  public init(): void {
    const sub = this.bus.getSubscriber<NavComEvents>();
    sub.on('nav_active_frequency_1').handle((v) => this.nav1Frequency = v);
    sub.on('nav_active_frequency_2').handle((v) => this.nav2Frequency = v);

    const pub = this.bus.getPublisher<Epic2DmeStateEvents>();
    this.dme1Frequency.sub((v) => SimVar.SetSimVarValue('K:NAV3_RADIO_SET_HZ', 'number', v * 1e6), true);
    this.dme2Frequency.sub((v) => SimVar.SetSimVarValue('K:NAV4_RADIO_SET_HZ', 'number', v * 1e6), true);
    this.nav1DmeAssociation.sub((v) => pub.pub('epic2_nav1_dme_association', v, true, true), true);
    this.nav2DmeAssociation.sub((v) => pub.pub('epic2_nav2_dme_association', v, true, true), true);
    this.nav1DmeHold.sub((v) => pub.pub('epic2_nav1_dme_hold', v, true, true), true);
    this.nav2DmeHold.sub((v) => pub.pub('epic2_nav2_dme_hold', v, true, true), true);
  }

  /** @inheritdoc */
  public onUpdate(): void {
    const isDmePairingSwapped = this.isDmePairingSwapped.get();
    const isDme1Held = this.isDme1HoldOn.get();
    const isDme2Held = this.isDme2HoldOn.get();

    if (!isDme1Held) {
      this.dme1Frequency.set(isDmePairingSwapped ? this.nav2Frequency : this.nav1Frequency);
    }
    if (!isDme2Held) {
      this.dme2Frequency.set(isDmePairingSwapped ? this.nav1Frequency : this.nav2Frequency);
    }

    this.nav1DmeAssociation.set(isDmePairingSwapped ? 2 : 1);
    this.nav2DmeAssociation.set(isDmePairingSwapped ? 1 : 2);

    this.nav1DmeHold.set(isDmePairingSwapped ? isDme2Held : isDme1Held);
    this.nav2DmeHold.set(isDmePairingSwapped ? isDme1Held : isDme2Held);
  }
}
