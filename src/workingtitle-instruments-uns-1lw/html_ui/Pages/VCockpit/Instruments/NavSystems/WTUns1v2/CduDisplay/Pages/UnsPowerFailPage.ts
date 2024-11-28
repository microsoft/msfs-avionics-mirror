import {
  ClockEvents, ConsumerSubject, DateTimeFormatter, DisplayField, DmsFormatter2, EventBus, FmcRenderTemplate, GeoPointInterface, Subject, UnitType
} from '@microsoft/msfs-sdk';

import { UnsFmcPage } from '../UnsFmcPage';

/**
 * Store for {@link UnsInitPage}
 */
class UnsPowerFailPageStore {
  /**
   * Ctor
   * @param bus the event bus
   */
  constructor(private readonly bus: EventBus) {
  }

  public readonly simTimeSub = ConsumerSubject.create(this.bus.getSubscriber<ClockEvents>().on('simTime').atFrequency(1/60), NaN);
  public readonly durationSub = Subject.create(0);
}

/** A UNS Init page */
export class UnsPowerFailPage extends UnsFmcPage {
  private static readonly TimeFormatter = DateTimeFormatter.create('{HH}:{mm}', { nanString: '--:--:--' });

  private static readonly LAT_FORMATTER = DmsFormatter2.create('{+[N]-[S]}  {dd} {mm.mm}', UnitType.ARC_SEC, 0.6, 'N  -- --.--');
  private static readonly LON_FORMATTER = DmsFormatter2.create('{+[E]-[W]} {ddd} {mm.mm}', UnitType.ARC_SEC, 0.6, 'E --- --.--');

  private readonly store = new UnsPowerFailPageStore(this.bus);

  /** @inheritdoc */
  protected onInit(): void {
    this.addBinding(this.store.simTimeSub);
  }

  /** @inheritdoc */
  protected onResume(): void {
    this.store.durationSub.set(this.params.get('duration'));
  }

  private readonly FmsPosField = new DisplayField<GeoPointInterface>(this, {
    formatter: ({ lat, lon }): FmcRenderTemplate => {
        const latString = UnsPowerFailPage.LAT_FORMATTER(lat * 3_600);
        const longString = UnsPowerFailPage.LON_FORMATTER(lon * 3_600);

        return [
          [`${latString}[d-text]      `],
          [`${longString}[d-text]      `],
        ];
      }
  }).bind(this.fms.pposSub);

  protected pageTitle = '  POWER FAIL';

  private readonly TimeField = new DisplayField<number>(this, {
    formatter: (time) => `${UnsPowerFailPage.TimeFormatter(time)}[d-text]       `
  }).bind(this.store.simTimeSub);

  private readonly DurationField = new DisplayField<number>(this, {
    formatter: (time) => `${Math.floor(time / 60)}[d-text] MIN[s-text] ${Math.floor(time % 60).toString().padStart(2, '0')}[d-text] SEC[s-text]`
  }).bind(this.store.durationSub);

  private readonly FailTitleField = new DisplayField(this, {
    formatter: () => `     ${this.pageTitle.padEnd(14, ' ')}[cyan d-text]`
  });

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    return [
      [
        [this.FailTitleField],
        [''],
        ['   POS[cyan s-text]', this.FmsPosField],
        [''],
        [''],
        ['   UTC[cyan s-text]', this.TimeField],
        [''],
        [' DURATION[cyan s-text]', this.DurationField],
        [''],
        ['** PRESS ANY MODE KEY **[amber s-text]'],
        ['**    TO CONTINUE.    **[amber s-text]'],
      ],
    ];
  }
}
