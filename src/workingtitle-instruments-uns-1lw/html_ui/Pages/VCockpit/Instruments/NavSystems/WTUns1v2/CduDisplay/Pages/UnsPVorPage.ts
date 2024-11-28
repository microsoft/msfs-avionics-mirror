import { DisplayField, FlightPlan, FmcPagingEvents, FmcRenderTemplate, ICAO, MappedSubject, Subject } from '@microsoft/msfs-sdk';

import { UnsCduCursorPath, UnsFmcPage } from '../UnsFmcPage';
import { UnsWaypointPickList } from '../Components/UnsWaypointPickList';
import { UnsChars } from '../UnsCduDisplay';
import { UnsTextInputField } from '../Components/UnsTextInputField';
import { UnsDisplayField } from '../Components/UnsDisplayField';
import { FixEntry, PVorDescription, UnsFms } from '../../Fms';
import { UnsBearingFormat } from '../UnsCduIOUtils';
import { UnsFocusableField } from '../Components/UnsFocusableField';

/**
 * Store for {@link UnsPVorPage}
 */
class UnsPVorPageStore {
  /**
   * Ctor
   * @param targetPlan the target flight plan
   */
  constructor(private readonly targetPlan: FlightPlan) {
  }

  public readonly fixEntry = Subject.create<FixEntry | null>(null);

  public readonly fixIdent = this.fixEntry.map((it) => {
    if (!it) {
      return null;
    }

    if (it.type === 'existing') {
      const segment = this.targetPlan.getSegment(it.segmentIndex);
      const leg = this.targetPlan.getLeg(segment.offset + it.localLegIndex);

      return ICAO.getIdent(leg.leg.fixIcao);
    } else {
      return ICAO.getIdent(it.facilityIcao);
    }
  });

  public readonly bearing = Subject.create<number | null>(null);

  public readonly inboundRadio = Subject.create<number | null>(null);

  public readonly outboundRadial = Subject.create<number | null>(null);

  public canAcceptPVor = MappedSubject.create(([fixEntry, bearing, inboundRadial, outboundRadial]) => {
    return fixEntry && (bearing || inboundRadial || outboundRadial);
  }, this.fixEntry, this.bearing, this.inboundRadio, this.outboundRadial);
}

/**
 * Controller for {@link UnsPVorPage}
 */
class UnsPVorPageController {
  /**
   * Ctor
   * @param store the store
   * @param fms the fms
   */
  constructor(private readonly store: UnsPVorPageStore, private readonly fms: UnsFms) {
  }

  /**
   * Accepts the current PVOR entry
   */
  public async acceptPVor(): Promise<void> {
    const fixEntry = this.store.fixEntry.get();
    const pickedBearing = this.store.bearing.get();
    const pickedInboundRadial = this.store.inboundRadio.get();
    const pickedOutboundRadial = this.store.outboundRadial.get();

    if (!fixEntry) {
      return;
    }

    let type: PVorDescription['type'] | undefined;
    let bearing: number | undefined;

    if (pickedBearing !== null) {
      type = 'track';
      bearing = pickedBearing;
    } else if (pickedInboundRadial !== null) {
      type = 'inboundRadial';
      bearing = pickedInboundRadial;
    } else if (pickedOutboundRadial !== null) {
      type = 'outboundRadial';
      bearing = pickedOutboundRadial;
    }

    if (type === undefined || bearing === undefined) {
      return;
    }

    const pvorInserted = await this.fms.insertPVor({ type, fixEntry, bearing });

    if (!pvorInserted) {
      throw new Error('[UnsPVorPageController](acceptPVor) UnsFms::insertPVor returned false');
    }
  }
}

/**
 * UNS PVOR page
 */
export class UnsPVorPage extends UnsFmcPage {
  private readonly store = new UnsPVorPageStore(this.fms.getPrimaryFlightPlan());

  private readonly controller = new UnsPVorPageController(this.store, this.fms);

  private readonly WaypointPicKList = new UnsWaypointPickList(this, this.fms);

  private readonly WaypointSelectionField = new UnsTextInputField<string | null, FixEntry>(this, {
    maxInputCharacterCount: 9,
    formatter: {
      /** @inheritDoc */
      format([ident, isHighlighted, typedText]): string {
        const text = typedText.length > 0 ? typedText : (ident ?? '-----');

        return `${text.padStart(9, ' ')}[${isHighlighted ? 'r-white' : 'white'} d-text]`;
      },

      parse: async (input: string): Promise<FixEntry | null> => {
        const intInput = parseInt(input);

        if (!Number.isFinite(intInput)) {
          const ident = input;

          let facilityIcao: string | undefined;
          for (let i = 0; i < this.WaypointPicKList.eligibleWaypoints.length; i++) {
            const waypoint = this.WaypointPicKList.eligibleWaypoints.get(i);

            if (ident === ICAO.getIdent(waypoint.icao)) {
              facilityIcao = waypoint.icao;
              break;
            }
          }

          if (!facilityIcao) {
            const pilotSelectedFacility = await this.screen.searchFacilityByIdent(ident, this.fms.pposSub.get());

            facilityIcao = pilotSelectedFacility?.icao;
          }

          if (!facilityIcao) {
            return null;
          }

          return { type: 'random', facilityIcao };
        } else {
          const entry = this.WaypointPicKList.data.get().data.find((it) => intInput === it.index);

          if (!entry) {
            return null;
          }

          return { type: 'existing', segmentIndex: entry.segmentIndex, localLegIndex: entry.localLegIndex, facilityIcao: entry.icao };
        }
      },
    },

    onSelected: async () => {
      this.screen.toggleFieldFocused(this.WaypointSelectionField);
      return true;
    },

    onModified: async (fix) => {
      this.store.fixEntry.set(fix);
      return true;
    },
  }).bindWrappedData(this.store.fixIdent);

  private readonly DesiredTrackField = new UnsTextInputField(this, {
    maxInputCharacterCount: 3,
    formatter: new UnsBearingFormat(),
    onSelected: async () => {
      this.screen.toggleFieldFocused(this.DesiredTrackField);
      return true;
    },
    onModified: async () => {
      this.store.inboundRadio.set(null);
      this.store.outboundRadial.set(null);
      return false;
    },
  }).bindWrappedData(this.store.bearing);

  private readonly InboundRadialField = new UnsTextInputField(this, {
    maxInputCharacterCount: 3,
    formatter: new UnsBearingFormat({ prefix: 'INBOUND[cyan s-text] [white]' }),
    onSelected: async () => {
      this.screen.toggleFieldFocused(this.InboundRadialField);
      return true;
    },
    onModified: async () => {
      this.store.bearing.set(null);
      this.store.outboundRadial.set(null);
      return false;
    },
  }).bindWrappedData(this.store.inboundRadio);

  private readonly OutboundRadialField = new UnsTextInputField(this, {
    maxInputCharacterCount: 3,
    formatter: new UnsBearingFormat({ prefix: 'OUTBOUND[cyan s-text] [white]' }),
    onSelected: async () => {
      this.screen.toggleFieldFocused(this.OutboundRadialField);
      return true;
    },
    onModified: async () => {
      this.store.bearing.set(null);
      this.store.inboundRadio.set(null);
      return false;
    },
  }).bindWrappedData(this.store.outboundRadial);

  private readonly AcceptPrompt = new UnsDisplayField(this, {
    formatter: ([, isHighlighted]) => `${UnsChars.ArrowLeft}ACCEPT[${isHighlighted ? 'r-white' : 'white'}]`,
    onSelected: async () => {
      this.screen.toggleFieldFocused(this.AcceptPrompt);
      return true;
    },
    onEnterPressed: async () => {
      await this.controller.acceptPVor();
      this.screen.navigateTo('/nav');
      return true;
    },
  }).bindWrappedData(Subject.create(undefined));

  private readonly ReturnLink = new DisplayField(this, {
    formatter: () => `RETURN${UnsChars.ArrowRight}`,
    onSelected: async () => {
      this.screen.navigateBackShallow();
      return true;
    },
  });

  protected override pageTitle = '   PVOR';

  protected override displayedSubPagePadding = 2;

  public override cursorPath: UnsCduCursorPath = {
    initialPosition: this.WaypointSelectionField,
    rules: new Map<UnsFocusableField<any>, UnsFocusableField<any>>([
      [this.WaypointSelectionField, this.DesiredTrackField],
      [this.DesiredTrackField, this.InboundRadialField],
      [this.InboundRadialField, this.OutboundRadialField],
      [this.AcceptPrompt, this.AcceptPrompt],
    ]),
  };

  /** @inheritDoc */
  protected override onInit(): void {
    this.displayedSubPageIndexPipe?.destroy();
    this.displayedSubPageCountPipe?.destroy();
    this.addBinding(this.displayedSubPageIndexPipe = this.WaypointPicKList.subPageIndex.pipe(this.displayedSubPageIndex));
    this.addBinding(this.displayedSubPageCountPipe = this.WaypointPicKList.subPageCount.pipe(this.displayedSubPageCount));

    this.addBinding(this.store.canAcceptPVor.sub(() => this.invalidate()));
  }

  /** @inheritDoc */
  protected override onResume(): void {
    this.WaypointPicKList.onPageResume();
  }

  /** @inheritDoc */
  protected override onDestroy(): void {
    this.WaypointPicKList.destroy();
  }

  /** @inheritDoc */
  public override render(): FmcRenderTemplate[] {
    const showAccept = this.store.canAcceptPVor.get();

    return [
      [
        [this.TitleField],
        [this.WaypointPicKList, 'WPT[cyan s-text]'],
        ['', this.WaypointSelectionField],
        ['', 'DESIRED TRACK[cyan s-text]'],
        ['', this.DesiredTrackField],
        ['', 'RADIAL[cyan s-text]'],
        ['', this.InboundRadialField],
        [''],
        ['', this.OutboundRadialField],
        [''],
        [showAccept ? this.AcceptPrompt : '', this.ReturnLink],
      ],
    ];
  }

  /** @inheritDoc */
  protected async onHandleScrolling(event: keyof FmcPagingEvents<this> & string): Promise<boolean | string> {
    switch (event) {
      case 'pageLeft': this.WaypointPicKList.prevSubpage(); return true;
      case 'pageRight': this.WaypointPicKList.nextSubpage(); return true;
      default: return false;
    }
  }
}
