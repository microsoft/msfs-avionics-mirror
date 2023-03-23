import {
  AirportFacility, EventBus, FacilityFrequency, FacilityFrequencyType, FacilityType, FacilityUtils, FlightPlannerEvents, GeoPoint,
  GeoPointSubject, GNSSEvents, ICAO, MappedSubject, OriginDestChangeType, Subject,
} from '@microsoft/msfs-sdk';

import { FmcSelectKeysEvent } from '../FmcEvent';
import { FmcPage, FmcPageRenderCallback } from '../Framework/FmcPage';
import { FmcRenderTemplate, FmcRenderTemplateRow } from '../Framework/FmcRenderer';
import { DisplayField } from '../Framework/Components/DisplayField';
import { PageLinkField } from '../Framework/Components/PageLinkField';
import { TextInputField } from '../Framework/Components/TextInputField';
import { WT21Fms } from '../../Shared/FlightPlan/WT21Fms';
import { WT21FmsUtils } from '../../Shared/FlightPlan/WT21FmsUtils';
import { FmcPageManager } from '../Framework/FmcPageManager';
import { FmcRouter } from '../Framework/FmcRouter';
import { WT21_FMC_Instrument } from '../WT21_FMC_Instrument';

const NUM_FREQUENCY_ROWS = 8;
const NUM_FREQUENCY_ENTRIES = NUM_FREQUENCY_ROWS;

const FacilityFrequencyTypeArray = [
  FacilityFrequencyType.None,
  FacilityFrequencyType.ATIS,
  FacilityFrequencyType.Tower,
  FacilityFrequencyType.FSS,
  FacilityFrequencyType.Departure,
  FacilityFrequencyType.Unicom,
  FacilityFrequencyType.Multicom,
  FacilityFrequencyType.CTAF,
  FacilityFrequencyType.Ground,
  FacilityFrequencyType.Clearance,
  FacilityFrequencyType.Approach,
  FacilityFrequencyType.Center,
  FacilityFrequencyType.AWOS,
  FacilityFrequencyType.ASOS,
  FacilityFrequencyType.CPT,
  FacilityFrequencyType.GCO,
];

/** Base type for FrequencyPageAction */
interface BaseFrequencyPageAction {
  /** The type of the action */
  type: string,

  /** The value associated with the action */
  value: any,
}

/** FrequencyPageAction for setting the frequency */
interface SetFrequencyFrequencyPageAction extends BaseFrequencyPageAction {
  /** @inheritDoc */
  type: 'setFrequency',

  /** @inheritDoc */
  value: number,
}

/** FrequencyPageAction for opening the MULTIPLE page */
interface SeeMultipleFrequencyPageAction extends BaseFrequencyPageAction {
  /** @inheritDoc */
  type: 'seeMultiple',

  /** @inheritDoc */
  value: { /** Airport 5-letter Ident */ airportIdent: string, /** The frequencies to show */ frequencies: readonly FacilityFrequency[] }
}

/**
 * An action to perform on a certain LSK of the FREQUENCY DATA page
 */
type FrequencyPageAction = SetFrequencyFrequencyPageAction | SeeMultipleFrequencyPageAction

/**
 * Data store for the FREQUENCY DATA page
 */
class FrequencyPageStore {
  /**
   * PPOS
   */
  ppos = GeoPointSubject.create(new GeoPoint(0, 0));

  /**
   * FROM airport
   */
  fromAirport = Subject.create<AirportFacility | null>(null);

  /**
   * TO airport
   */
  toAirport = Subject.create<AirportFacility | null>(null);

  /**
   * ALTN airport
   */
  altnAirport = Subject.create<AirportFacility | null>(null);

  /**
   * Custom airport
   */
  inputAirport = Subject.create<AirportFacility | null>(null);

  /**
   * Selected airport index
   */
  selectedIndex = Subject.create<0 | 1 | 2 | 3>(0);
}

/**
 * Frequency page
 */
export class FrequencyPage extends FmcPage {
  private store = new FrequencyPageStore();

  private actionTable: [FrequencyPageAction | undefined, FrequencyPageAction | undefined][] = [
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
  ];

  /** @inheritDoc */
  constructor(
    renderCallback: FmcPageRenderCallback,
    pageManager: FmcPageManager,
    router: FmcRouter,
    eventBus: EventBus,
    baseInstrument: WT21_FMC_Instrument
  ) {
    super(renderCallback, pageManager, router, eventBus, baseInstrument);

    this.onPrimaryPlanChanged();
  }

  /** @inheritDoc */
  protected onInit(): void {
    super.onInit();

    const sub = this.eventBus.getSubscriber<GNSSEvents & FlightPlannerEvents>();

    sub.on('gps-position').whenChanged().handle(({ lat, long }) => {
      this.store.ppos.set(lat, long);
    });

    sub.on('fplLoaded').handle((evt) => {
      if (evt.planIndex === WT21Fms.PRIMARY_ACT_PLAN_INDEX) {
        this.onPrimaryPlanChanged();
      }
    });

    sub.on('fplCopied').handle((evt) => {
      if (evt.targetPlanIndex === WT21Fms.PRIMARY_ACT_PLAN_INDEX) {
        this.onPrimaryPlanChanged();
      }
    });

    sub.on('fplOriginDestChanged').handle((evt) => {
      switch (evt.type) {
        case OriginDestChangeType.OriginAdded:
        case OriginDestChangeType.OriginRemoved: {
          if (evt.airport) {
            this.fms.facLoader.getFacility(ICAO.getFacilityType(evt.airport) as FacilityType.Airport, evt.airport).then((airport) => {
              this.store.fromAirport.set(airport);
            });
          } else {
            this.store.fromAirport.set(null);
          }
          break;
        }
        case OriginDestChangeType.DestinationAdded:
        case OriginDestChangeType.DestinationRemoved: {
          if (evt.airport) {
            this.fms.facLoader.getFacility(ICAO.getFacilityType(evt.airport) as FacilityType.Airport, evt.airport).then((airport) => {
              this.store.toAirport.set(airport);
            });
          } else {
            this.store.toAirport.set(null);
          }
          break;
        }
      }
    });

    sub.on('fplUserDataSet').handle((evt) => {
      if (evt.planIndex === WT21Fms.PRIMARY_ACT_PLAN_INDEX && evt.key === WT21Fms.USER_DATA_KEY_ALTN) {
        const altnIcao = evt.data as string;

        this.fms.facLoader.getFacility(FacilityType.Airport, altnIcao).then((airport) => {
          this.store.toAirport.set(airport);
        }).catch();
      }
    });
  }

  /**
   * Handler for the primary flight plan changing
   */
  private onPrimaryPlanChanged(): void {
    if (!this.fms.hasPrimaryFlightPlan()) {
      return;
    }

    const originIcao = this.fms.getPrimaryFlightPlan().originAirport;

    if (originIcao) {
      this.fms.facLoader.getFacility(ICAO.getFacilityType(originIcao) as FacilityType.Airport, originIcao).then((airport) => {
        this.store.fromAirport.set(airport);
      });
    } else {
      this.store.fromAirport.set(null);
    }

    const destIcao = this.fms.getPrimaryFlightPlan().destinationAirport;

    if (destIcao) {
      this.fms.facLoader.getFacility(ICAO.getFacilityType(destIcao) as FacilityType.Airport, destIcao).then((airport) => {
        this.store.toAirport.set(airport);
      });
    } else {
      this.store.toAirport.set(null);
    }

    const altnIcao = this.fms.getPrimaryFlightPlan().getUserData(WT21Fms.USER_DATA_KEY_ALTN) as string;

    if (altnIcao) {
      this.fms.facLoader.getFacility(FacilityType.Airport, altnIcao).then((airport) => {
        this.store.altnAirport.set(airport);
      });
    } else {
      this.store.altnAirport.set(null);
    }
  }

  private AirportSelectionField = new DisplayField(this, {
    onSelected: async (scratchpadContents: string) => {
      if (scratchpadContents === '') {
        this.store.selectedIndex.set((this.store.selectedIndex.get() + 1) % 4 as 0 | 1 | 2 | 3);
        return true;
      }

      return false;
    },
    formatter: {
      nullValueString: '----/----/----/□□□□',

      /** @inheritDoc */
      format([from, to, altn, input, selectedIndex]: readonly [ // FIXME this is kinda sus
        from: AirportFacility | null,
        to: AirportFacility | null,
        altn: AirportFacility | null,
        input: AirportFacility | null,
        selectedIndex: number
      ]): string {
        let fromIdent = from ? ICAO.getIdent(from.icao) : '----';
        let toIdent = to ? ICAO.getIdent(to.icao) : '----';
        let altnIdent = altn ? ICAO.getIdent(altn.icao) : '----';
        let inputIdent = input ? ICAO.getIdent(input.icao) : '□□□□';

        switch (selectedIndex) {
          case 0:
            fromIdent += '[green d-text]/';
            toIdent += '[white s-text]/';
            altnIdent += '[white s-text]/';
            inputIdent += `[white ${input ? 's-text' : 'd-text'}]`;
            break;
          case 1:
            fromIdent += '/[white s-text]';
            toIdent += '[green d-text]/';
            altnIdent += '[white s-text]/';
            inputIdent += `[white ${input ? 's-text' : 'd-text'}]`;
            break;
          case 2:
            fromIdent += '/[white s-text]';
            toIdent += '/[white s-text]';
            altnIdent += '[green d-text]/';
            inputIdent += `[white ${input ? 's-text' : 'd-text'}]`;
            break;
          case 3:
            fromIdent += '/[white s-text]';
            toIdent += '/[white s-text]';
            altnIdent += '/[white s-text]';
            inputIdent += '[green d-text]';
            break;
        }

        return `${fromIdent}${toIdent}${altnIdent}${inputIdent}`;
      }
    },
  }).bind(MappedSubject.create(this.store.fromAirport, this.store.toAirport, this.store.altnAirport, this.store.inputAirport, this.store.selectedIndex));

  private readonly AirportInputField = new TextInputField<AirportFacility, AirportFacility>(this, {
    formatter: {
      nullValueString: '',

      /** @inheritDoc */
      format(): string {
        return '';
      },

      /** @inheritDoc */
      parse: async (input: string): Promise<AirportFacility | null> => {
        const facility = await this.pageManager.selectWptFromIdent(input, this.store.ppos.get());

        if (facility !== null && FacilityUtils.isFacilityType(facility, FacilityType.Airport)) {
          return facility as AirportFacility;
        } else {
          return null;
        }
      }
    }
  }).bind(this.store.inputAirport);

  private readonly IndexLinkField = PageLinkField.createLink(this, '<INDEX', '/index');

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    let selectedAirport;
    switch (this.store.selectedIndex.get()) {
      case 0:
        selectedAirport = this.store.fromAirport.get();
        break;
      case 1:
        selectedAirport = this.store.toAirport.get();
        break;
      case 2:
        selectedAirport = this.store.altnAirport.get();
        break;
      case 3:
        selectedAirport = this.store.inputAirport.get();
        break;
    }

    if (selectedAirport) {
      const frequencies = this.groupAirportFrequencies(selectedAirport);

      const numPages = Math.ceil(frequencies.size / NUM_FREQUENCY_ENTRIES);

      const pages = [];
      for (let i = 0; i < numPages; i++) {
        pages.push(
          [
            ['', this.PagingIndicator, 'FREQUENCY DATA[blue]'],
            [' SEL APT[blue]'],
            [this.AirportSelectionField, this.AirportInputField],
            ...this.renderAirportFrequencyList(frequencies, selectedAirport.icao, i),
            ['', '', '------------------------[blue]'],
            [this.IndexLinkField, ''],
          ],
        );
      }

      return pages;
    } else {
      return [
        [
          ['', this.PagingIndicator, 'FREQUENCY DATA[blue]'],
          [' SEL APT[blue]'],
          [this.AirportSelectionField, this.AirportInputField],
          ...this.renderNoDataAvailable(),
          ['', '', '------------------------[blue]'],
          [this.IndexLinkField, '']
        ]
      ];
    }
  }

  /**
   * Renders the frequency list for a given airport
   *
   * @param frequencies the mapped frequencies for the airport
   * @param airportIcao the ICAO for the airport
   * @param pageIndex   the page index to render
   *
   * @returns fmc template rows
   */
  private renderAirportFrequencyList(
    frequencies: Map<FacilityFrequencyType, FacilityFrequency[]>,
    airportIcao: string,
    pageIndex: number,
  ): FmcRenderTemplateRow[] {
    const isVisiblePage = pageIndex === this.router.currentSubpageIndex.get() - 1;

    if (frequencies.size > 0) {
      const rows: FmcRenderTemplateRow[] = [];

      const start = pageIndex * NUM_FREQUENCY_ENTRIES;
      const end = start + NUM_FREQUENCY_ENTRIES;

      for (let i = start; i < end && i < frequencies.size && rows.length < NUM_FREQUENCY_ROWS; i++) {
        if (i % 2 !== 0) {
          continue;
        }

        const entry = Array.from(frequencies.entries())[i];
        const nextEntry = Array.from(frequencies.entries())[i + 1];

        const leftFrequencyType = entry[0];

        let leftHeader = '', leftContent = '', rightHeader = '', rightContent = '';

        const leftFrequencies = frequencies.get(leftFrequencyType);

        if (!leftFrequencies) {
          break; // This basically never happens
        }

        leftHeader = WT21FmsUtils.formatFacilityFrequencyType(leftFrequencies[0], 'ILS/LOC');
        if (leftFrequencies.length > 1) {
          leftContent = '<MULTIPLE';
          if (isVisiblePage) {
            this.setFrequencyAction(i % NUM_FREQUENCY_ENTRIES, { type: 'seeMultiple', value: { airportIdent: ICAO.getIdent(airportIcao), frequencies: leftFrequencies } });
          }
        } else {
          leftContent = leftFrequencies[0].freqMHz.toFixed(3);
          if (isVisiblePage) {
            this.setFrequencyAction(i % NUM_FREQUENCY_ENTRIES, { type: 'setFrequency', value: leftFrequencies[0].freqMHz });
          }
        }

        if (nextEntry) {
          const rightFrequencyType = nextEntry[0];
          const rightFrequencies = frequencies.get(rightFrequencyType);

          if (!rightFrequencies) {
            break; // This basically never happens
          }

          rightHeader = WT21FmsUtils.formatFacilityFrequencyType(rightFrequencies[0], 'ILS/LOC');
          if (rightFrequencies.length > 1) {
            rightContent = 'MULTIPLE>';
            if (isVisiblePage) {
              this.setFrequencyAction((i + 1) % NUM_FREQUENCY_ENTRIES, { type: 'seeMultiple', value: { airportIdent: ICAO.getIdent(airportIcao), frequencies: rightFrequencies } });
            }
          } else {
            rightContent = rightFrequencies[0].freqMHz.toFixed(3);
            if (isVisiblePage) {
              this.setFrequencyAction((i + 1) % NUM_FREQUENCY_ENTRIES, { type: 'setFrequency', value: rightFrequencies[0].freqMHz });
            }
          }
        }

        rows.push(
          [` ${leftHeader}[blue]`, `${rightHeader}[blue] `],
          [leftContent, rightContent],
        );
      }

      // Pad rows at the bottom
      for (let i = 0; rows.length < NUM_FREQUENCY_ROWS; i++) {
        rows.push(['']);
      }

      return rows;
    } else {
      return this.renderNoDataAvailable();
    }
  }

  /**
   * Groups airport facility frequencies together by type
   *
   * @param airport the airport in question
   *
   * @returns a map
   */
  private groupAirportFrequencies(airport: AirportFacility): Map<FacilityFrequencyType, FacilityFrequency[]> {
    const map = new Map<FacilityFrequencyType, FacilityFrequency[]>();

    const sortedAirportFrequencies = [...airport.frequencies]
      .sort((a, b) => {
        const aPos = FacilityFrequencyTypeArray.findIndex((it) => it === a.type) ?? 0;
        const bPos = FacilityFrequencyTypeArray.findIndex((it) => it === b.type) ?? 0;

        return aPos - bPos;
      });

    for (const frequency of sortedAirportFrequencies) {
      if (!map.has(frequency.type)) {
        map.set(frequency.type, []);
      }

      if (map.has(frequency.type)) {
        map.get(frequency.type)?.push(frequency);
      }
    }

    return map;
  }

  /**
   * Renders NO DATA AVAILABLE
   *
   * @returns fmc template rows
   */
  private renderNoDataAvailable(): FmcRenderTemplateRow[] {
    return [
      ['', ''],
      ['', ''],
      ['', '', 'NO DATA[d-text]'],
      ['', ''],
      ['', '', 'AVAILABLE[d-text]'],
      ['', ''],
      ['', ''],
      ['', ''],
    ];
  }

  /**
   * Sets the action for a frequency, given its sequential index from the start of the list on the page and an action
   *
   * @param listStartIndex the index
   * @param action the action
   */
  private setFrequencyAction(listStartIndex: number, action: FrequencyPageAction): void {
    const actionTableRow = (listStartIndex - listStartIndex % 2) / 2;
    const actionTableColumn = listStartIndex % 2;

    if (!this.actionTable[actionTableRow]) {
      this.actionTable[actionTableRow] = [undefined, undefined];
    }

    this.actionTable[actionTableRow][actionTableColumn] = action;
  }

  /**
   * Gets a {@link FrequencyPageAction} from an LSK event
   * @param event the LSK event
   * @returns the event or `undefined`
   */
  private getLskAction(event: FmcSelectKeysEvent): FrequencyPageAction | undefined {
    const lskSide = Array.from(FmcSelectKeysEvent[event])[0];
    const lskNum = Array.from(FmcSelectKeysEvent[event])[4];

    const lskNumber = parseInt(lskNum);

    if (Number.isFinite(lskNumber)) {
      const actionTableRow = lskNumber - 2;

      if (actionTableRow >= 0 && actionTableRow <= 3) {
        const action = this.actionTable[actionTableRow][lskSide === 'L' ? 0 : 1];

        return action;
      }
    }
    return undefined;
  }

  /** @inheritDoc */
  public async handleSelectKey(event: FmcSelectKeysEvent): Promise<boolean | string> {
    const action = this.getLskAction(event);

    if (action) {
      if (action.type === 'setFrequency') {
        return action.value.toFixed(3);
      } else if (action.type === 'seeMultiple') {
        this.router.navigateTo('/comm-type', action.value);
        return true;
      }
    }

    return false;
  }
}
