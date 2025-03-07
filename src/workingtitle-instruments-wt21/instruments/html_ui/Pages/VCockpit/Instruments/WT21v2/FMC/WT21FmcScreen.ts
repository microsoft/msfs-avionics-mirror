import {
  DebounceTimer, EventBus, Facility, FacilitySearchType, FmcScratchpad, FmcScratchpadOptions, FmcScreen, FmcScreenOptions, GeoPointInterface, ICAO,
  SearchTypeMap, SimpleFmcRenderer, SimpleFmcRendererOptions
} from '@microsoft/msfs-sdk';

import { FmcMsgLine } from './Framework/Components/FmcMsgLine';
import { FmcBtnEvents } from './Framework/FmcEventPublisher';
import { FmcSelectWptPopup } from './Framework/FmcSelectWptPage';
import { WT21_FMC_Instrument } from './WT21_FMC_Instrument';
import { WT21FmcEvents } from './WT21FmcEvents';
import { WT21FmcPage } from './WT21FmcPage';
import { WT21FmcPageFactory } from './WT21FmcPageFactory';
import { WT21Fms } from './FlightPlan/WT21Fms';
import { FmcMsgInfo } from './Data/FmcMsgInfo';

const ScratchpadBrackets = {
  Normal: ['__LSB[blue]', '__RSB[blue]'] as const,
  Invert: ['__LSB[bluebg]', '__RSB[bluebg]'] as const,
};

/**
 * WT21 FMC screen
 */
export class WT21FmcScreen extends FmcScreen<WT21FmcPage<any>, WT21FmcEvents> {
  private static SCREEN_OPTIONS: FmcScreenOptions = {
    screenDimensions: {
      cellWidth: 24,
      cellHeight: 15,
    },
  };

  private static RENDERER_OPTIONS: SimpleFmcRendererOptions = {
    screenCellWidth: 24,
    screenCellHeight: 15,
    screenPXWidth: 980,
    screenPXHeight: 940,
  };

  private static SCRATCHPAD_OPTIONS: Partial<FmcScratchpadOptions> = {
    renderRow: 13,
    cellWidth: 24,
    clearScratchpadOnError: true,
    deleteText: 'DELETE',
    errorTextCentered: true,
    surroundingText: ['__LSB[blue]', '__RSB[blue]'],
  };

  private keyboardEntryBlinkTimer = new DebounceTimer();

  /**
   * Ctor
   * @param bus the event bus
   * @param baseInstrument the FMC base instrument
   * @param fms the fms
   * @param fmcIndex the fmc index
   * @param targetElement the cdu render target element
   */
  constructor(bus: EventBus, baseInstrument: WT21_FMC_Instrument, private readonly fms: WT21Fms, public readonly fmcIndex: 1 | 2, targetElement: HTMLDivElement) {
    super(
      bus,
      new WT21FmcPageFactory(baseInstrument, fms),
      WT21FmcScreen.SCREEN_OPTIONS,
      new SimpleFmcRenderer(bus, targetElement, WT21FmcScreen.RENDERER_OPTIONS),
      new FmcScratchpad(bus, WT21FmcScreen.SCRATCHPAD_OPTIONS, () => { }),
    );

    new FmcMsgInfo(bus, new FmcMsgLine(this, fms.planInMod));

    this.onPrefixedEvent('scratchpad_plus_minus').handle(() => {
      const contents = this.scratchpad.contents.get();

      if (contents.endsWith('-')) {
        this.scratchpad.contents.set(contents.replace(/-$/, '+'));
      } else if (contents.endsWith('+')) {
        this.scratchpad.contents.set(contents.replace(/\+$/, '-'));
      } else {
        this.scratchpad.contents.set(contents + '-');
      }
    });

    bus.getSubscriber<FmcBtnEvents>().on('fmcActivateKeyboardInputEvent').handle((v) => {
      this.keyboardEntryBlinkTimer.clear();
      this.scratchpad.options.surroundingText = ['__LSB[blue]', '__RSB[blue]'];
      if (v) {
        this.scratchpad.options.surroundingText = ['__LSB[bluebg]', '__RSB[bluebg]'];
        this.scheduleBlink();
      }
      this.scratchpad.contents.notify();
    });
  }

  /**
   * Schedules a timer for changing the brackets color.
   * Used for indicating active keyboard input.
   */
  private scheduleBlink(): void {
    this.keyboardEntryBlinkTimer.schedule(() => {
      this.scratchpad.options.surroundingText = (this.scratchpad.options.surroundingText === ScratchpadBrackets.Normal ? ScratchpadBrackets.Invert : ScratchpadBrackets.Normal);
      this.scratchpad.contents.notify();
      this.scheduleBlink();
    }, 500);
  }


  /**
   * Runs the flow to select a facility based on the given ident.
   * @param ident The ident to search for.
   * @param referencePos The reference position to use to sort multiple matching facilities. Facilities are sorted
   * in order of increasing distance from the reference position.
   * @param filter the filter to apply to the facility search.
   * @returns The selected facility or null.
   */
  public async selectWptFromIdent<F extends (Exclude<FacilitySearchType, FacilitySearchType.Boundary>) = FacilitySearchType.All>(
    ident: string,
    referencePos: GeoPointInterface,
    filter?: F,
  ): Promise<SearchTypeMap[F] | null> {
    let selectedFacility: SearchTypeMap[F] | null = null;

    const results = await this.fms.facLoader.searchByIdent(filter ?? FacilitySearchType.All, ident);

    if (results) {
      const foundFacilities: (SearchTypeMap[F])[] = [];

      // get facilities for results
      for (let i = 0; i < results.length; i++) {
        const icao = results[i];
        const facIdent = ICAO.getIdent(icao);
        if (facIdent === ident) {
          try {
            const fac = await this.fms.facLoader.getFacility(ICAO.getFacilityType(icao), icao) as SearchTypeMap[F];
            foundFacilities.push(fac);
          } catch (e) {
            console.error('selectWptFromIdent: Failed to fetch facility', e);
          }
        }
      }

      if (foundFacilities.length > 1) {
        foundFacilities.sort((a, b) => referencePos.distance(a) - referencePos.distance(b));
        selectedFacility = await this.showSelectWptPopup<SearchTypeMap[F]>(foundFacilities);
      } else if (foundFacilities.length === 1) {
        selectedFacility = foundFacilities[0];
      }
    }
    return Promise.resolve(selectedFacility);
  }

  /**
   * Displays the SELECT WPT popup
   * @param data The facility data to display
   * @returns The selected facility or null.
   */
  private async showSelectWptPopup<F extends Facility>(data: F[]): Promise<F | null> {
    const oldRoute = this.currentRoute.get();
    const oldSubPageIndex = this.currentSubpageIndex.get();

    // We first set the active route so that we can set it back later after the callback
    // (otherwise we are still on the old page, from the router's perspective)
    this.currentRoute.set('/select-wpt');

    this.navigateTo('/select-wpt');

    const page = this.currentlyDisplayedPage as FmcSelectWptPopup;

    page.facilities.set(data);

    return new Promise((resolve) => {
      page.selectedFacility.set(null);
      page.addBinding(
        page.selectedFacility.sub(
          (value) => {
            if (value !== undefined && value !== null) {
              this.navigateTo(`${oldRoute}#${oldSubPageIndex}`);
              // TODO what happens all around when someone just moves away from this page? is the caller stuck?
              resolve(value as F);
            }
          }
        ));
      page.resume();
    });
  }
}
