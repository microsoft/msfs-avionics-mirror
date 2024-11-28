import {
  AiracCycleFormatter, AiracUtils, ClockEvents, ConsumerSubject, DateTimeFormatter, DisplayField, DmsFormatter2, EventBus, FmcRenderTemplate, GeoPointInterface,
  MappedSubject, SimVarValueType, Subject, UnitType
} from '@microsoft/msfs-sdk';

import { UnsFms } from '../../Fms';
import { UnsTextInputField } from '../Components/UnsTextInputField';
import { UnsChars } from '../UnsCduDisplay';
import { UnsCduCursorPath, UnsFmcPage } from '../UnsFmcPage';

/**
 * Store for {@link UnsInitPage}
 */
class UnsInitPageStore {
  /**
   * Ctor
   * @param bus the event bus
   */
  constructor(private readonly bus: EventBus) {
  }

  public readonly simTImmeSub = ConsumerSubject.create(
    this.bus.getSubscriber<ClockEvents>().on('simTime').atFrequency(1),
    NaN,
  );
}

/** A UNS Init page */
export class UnsInitPage extends UnsFmcPage {
  private static readonly DateFormatter = DateTimeFormatter.create('{dd}-{MON}-{YY}', { nanString: '--------' });

  private static readonly TimeFormatter = DateTimeFormatter.create('{HH}:{mm}:{ss}', { nanString: '--:--:--' });

  private static readonly LAT_FORMATTER = DmsFormatter2.create('{+[N]-[S]}  {dd} {mm.mm}', UnitType.ARC_SEC, 0.6, 'N  -- --.--');
  private static readonly LON_FORMATTER = DmsFormatter2.create('{+[E]-[W]} {ddd} {mm.mm}', UnitType.ARC_SEC, 0.6, 'E --- --.--');

  private static readonly AIRAC_FORMATTER = AiracCycleFormatter.create('{exp({dd}-{MON}-{YY})}');

  private readonly store = new UnsInitPageStore(this.bus);

  private readonly InitialPosIDField = new DisplayField<readonly ['gps', boolean]>(this, {
    formatter: {
      /** @inheritDoc */
      format([id, pposAccepted]): string {
        const idString = (!pposAccepted && id === 'gps') ? '<GPS>' : '-----';

        return `ID[cyan s-text]  ${idString}[white d-text]`;
      },
    }
  }).bind(MappedSubject.create(this.fms.pposID, this.fms.pposAccepted));

  private readonly DateField = new DisplayField<readonly [number, boolean]>(this, {
    formatter: {
      /** @inheritDoc */
      format([time, pposAccepted]): string {
        return `${UnsInitPage.DateFormatter(time)}[${pposAccepted ? 'white' : 'amber'} d-text]`;
      },
    },
  }).bind(MappedSubject.create(this.store.simTImmeSub, this.fms.pposAccepted));

  private readonly FmsPosField = new DisplayField<readonly [GeoPointInterface, boolean]>(this, {
    formatter: {
      /** @inheritDoc */
      format([{ lat, lon }, pposAccepted]): FmcRenderTemplate {
        const latString = UnsInitPage.LAT_FORMATTER(lat * 3_600);
        const longString = UnsInitPage.LON_FORMATTER(lon * 3_600);

        return [
          [`${latString}[${pposAccepted ? 'white' : 'amber'} d-text]`],
          [`${longString}[${pposAccepted ? 'white' : 'amber'} d-text]`],
        ];
      },
    },
  }).bind(MappedSubject.create(this.fms.pposSub, this.fms.pposAccepted));

  private readonly TimeField = new DisplayField<readonly [number, boolean]>(this, {
    formatter: {
      /** @inheritDoc */
      format([time, pposAccepted]): string {
        return `${UnsInitPage.TimeFormatter(time)}[${pposAccepted ? 'white' : 'amber'} d-text]`;
      },
    },
  }).bind(MappedSubject.create(this.store.simTImmeSub, this.fms.pposAccepted));

  private readonly NavDataExpiryField = new DisplayField(this, {
    formatter: {
      /** @inheritDoc */
      format(navdataRange: string): string {
        const cycle = AiracUtils.parseFacilitiesCycle(navdataRange);
        return cycle ? UnsInitPage.AIRAC_FORMATTER(cycle) : '---------';
      },
    },
  }).bind(Subject.create(SimVar.GetGameVarValue('FLIGHT_NAVDATA_DATE_RANGE', SimVarValueType.String)));

  private readonly AcceptField = new UnsTextInputField<boolean>(this, {
    maxInputCharacterCount: 0,

    formatter: {
      /** @inheritDoc */
      format([pposAccepted, isHighlighted]): string {
        return pposAccepted ? '' : `${UnsChars.ArrowLeft}ACCEPT[${isHighlighted ? 'r-white' : 'white'}]`;
      },

      /** @inheritDoc */
      parse(): null {
        return null;
      },
    },

    onEnterPressed: async () => {
      this.fms.pposAccepted.set(true);
      return true;
    },
  }).bindWrappedData(this.fms.pposAccepted);

  public readonly cursorPath: UnsCduCursorPath = {
    initialPosition: this.AcceptField,
    rules: new Map([
        [this.AcceptField, this.AcceptField],
    ]),
  };

  protected pageTitle = '   INIT';

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    return [
      [
        [this.TitleField],
        ['', 'DATE[cyan s-text]'],
        ['INITIAL POS[cyan s-text]', this.DateField],
        [this.InitialPosIDField, 'UTC[cyan]'],
        [this.FmsPosField, this.TimeField],
        [''],
        [''],
        ['NAV DATABASE EXPIRES[cyan]'],
        [this.NavDataExpiryField],
        [''],
        [this.AcceptField, `FMC VER[cyan s-text]${UnsFms.version.padStart(9, ' ')}[white d-text]`],
      ],
    ];
  }
}
