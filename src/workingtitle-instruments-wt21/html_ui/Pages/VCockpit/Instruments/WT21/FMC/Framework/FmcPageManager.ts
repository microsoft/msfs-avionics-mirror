import { EventBus, Facility, FacilitySearchType, GeoPointInterface, ICAO, Subject, SearchTypeMap } from '@microsoft/msfs-sdk';

import { FmcPageEvent, FmcPrevNextEvent, FmcSelectKeysEvent } from '../FmcEvent';
import { WT21_FMC_Instrument } from '../WT21_FMC_Instrument';
import { FmcMsgLine } from './Components/FmcMsgLine';
import { Binding } from './FmcDataBinding';
import { FmcPage, FmcPageConstructor, FmcPageLifecyclePolicy } from './FmcPage';
import { FMC_LINE_COUNT, FmcOutputTemplate, FmcRenderer } from './FmcRenderer';
import { FmcRouter } from './FmcRouter';
import { FmcScratchpad } from './FmcScratchpad';
import { FmcSelectWptPopup } from './FmcSelectWptPage';
import { MfdDisplayMode, MFDUserSettings } from '../../MFD/MFDUserSettings';
import { FmcBtnEvents } from './FmcEventPublisher';

/**
 * Manages rendering and input/output from pages
 */
export class FmcPageManager {
  private currentlyDisplayedPageConstructor: FmcPageConstructor | null = null;

  private currentlyDisplayedPage: FmcPage | null = null;

  private mfdSettings = MFDUserSettings.getMasterManager(this.eventBus);

  /**
   * Creates an instance of the FmcPageManager.
   * @param eventBus The event bus to use with this instance.
   * @param fmcRenderer The FMC renderer to use to render pages as they are displayed.
   * @param fmcRouter The FMC page router to use to route to page routes.
   * @param fmcScratchpad The FMC scratchpad line to manage.
   * @param baseInstrument The base instrument of this instance.
   * @param fmcMsgLine The FMC message line to manage.
   * @param fmcIndex The index of the FMC, 1 for the left unit and 2 for the right unit.
   */
  constructor(
    private readonly eventBus: EventBus,
    public readonly fmcRenderer: FmcRenderer,
    private readonly fmcRouter: FmcRouter,
    private readonly fmcScratchpad: FmcScratchpad,
    // TODO: the hard dependency on WT21_FMC has to move out when we move to SDK
    // should be a generic type param of FsInstrument
    private readonly baseInstrument: WT21_FMC_Instrument,
    private readonly fmcMsgLine: FmcMsgLine,
    public readonly fmcIndex: 1 | 2
  ) {
    const sub = this.eventBus.getSubscriber<FmcBtnEvents>();

    sub.on('fmcSelectKeyEvent').handle((data: FmcSelectKeysEvent) => {
      const scratchpadContents = this.fmcScratchpad.contents;
      const scratchpadIsDelete = this.fmcScratchpad.isDelete;

      this.currentlyDisplayedPage?.dispatchSelectKeyEvent(data, scratchpadContents, scratchpadIsDelete).then((value) => {
        if (typeof value === 'string') {
          this.fmcScratchpad.showValue(value);
        }
        this.fmcScratchpad.render();
      }).catch((error) => {
        if (typeof error !== 'string') {
          console.error(error);
        } else {
          this.showScratchpadError(error);
        }
      });
    });

    sub.on('fmcPrevNextKeyEvent').handle((data: FmcPrevNextEvent) => {
      this.currentlyDisplayedPage?.dispatchScrollKeyEvent(data);
    });

    // Handle MFD DATA key switching between MAP and TEXT
    sub.on('fmcPageKeyEvent').handle((data: FmcPageEvent) => {
      if (data === FmcPageEvent.PAGE_MFDDATA) {
        const setting = this.mfdSettings.getSetting(`mfdDisplayMode_${this.fmcIndex}`);

        if (setting.get() === MfdDisplayMode.Map) {
          setting.set(MfdDisplayMode.Text);
        } else {
          setting.set(MfdDisplayMode.Map);
        }

        return true;
      }
    });

    this.fmcRouter.activePageButtonPressed.on(() => this.currentlyDisplayedPage?.onPageButtonPressed());
  }

  private memoizedPages = new Map<FmcPageConstructor, FmcPage>();

  /**
   * Switches the currently rendered page
   *
   * @param ctor a constructor to instantiate an `FmcPage`
   *
   * @returns the created {@link FmcPage}
   * @throws if the {@link FmcPageLifecyclePolicy} is invalid
   */
  public switchToPage(ctor: FmcPageConstructor): FmcPage {
    if (this.currentlyDisplayedPageConstructor) {
      this.currentlyDisplayedPage?.pause();

      if (this.currentlyDisplayedPageConstructor?.lifecyclePolicy === FmcPageLifecyclePolicy.Transient) {
        this.currentlyDisplayedPage?.destroy();
      }
    }

    let pageInstance: FmcPage;

    switch (ctor.lifecyclePolicy) {
      case FmcPageLifecyclePolicy.Singleton:
        if (this.memoizedPages.has(ctor)) {
          pageInstance = this.memoizedPages.get(ctor) as FmcPage;
          pageInstance.resume();
        } else {
          pageInstance = this.initializePage(ctor);
          pageInstance.resume();

          this.memoizedPages.set(ctor, pageInstance);
        }
        break;
      case FmcPageLifecyclePolicy.Transient:
        pageInstance = this.initializePage(ctor);
        pageInstance.resume();
        break;
      default:
        throw new Error('[FMC] Invalid page lifecycle policy.');
    }

    this.currentlyDisplayedPageConstructor = ctor;
    this.currentlyDisplayedPage = pageInstance;

    this.currentlyDisplayedPage.initialRender();

    return pageInstance;
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

    const results = await this.baseInstrument.fms.facLoader.searchByIdent(filter ?? FacilitySearchType.All, ident);

    if (results) {
      const foundFacilities: (SearchTypeMap[F])[] = [];

      // get facilities for results
      for (let i = 0; i < results.length; i++) {
        const icao = results[i];
        const facIdent = ICAO.getIdent(icao);
        if (facIdent === ident) {
          const fac = await this.baseInstrument.fms.facLoader.getFacility(ICAO.getFacilityType(icao), icao) as SearchTypeMap[F];

          foundFacilities.push(fac);
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
    const oldRoute = this.fmcRouter.activeRouteSubject.get();
    const oldSubPageIndex = this.fmcRouter.currentSubpageIndex.get();

    // We first set the active route so that we can set it back later after the callback
    // (otherwise we are still on the old page, from the router's perspective)
    this.fmcRouter.activeRouteSubject.set('/select-wpt');

    const page = this.switchToPage(FmcSelectWptPopup) as FmcSelectWptPopup;

    page.facilities.set(data);

    return new Promise((resolve) => {
      page.selectedFacility.set(null);
      page.addBinding(new Binding(
        page.selectedFacility as Subject<F | null>,
        (value) => {
          if (value !== undefined && value !== null) {
            this.fmcRouter.activeRouteSubject.set(oldRoute);
            this.fmcRouter.currentSubpageIndex.set(oldSubPageIndex);
            // TODO what happens all around when someone just moves away from this page? is the caller stuck?
            resolve(value);
          }
        }
      ));
      page.resume();
    });
  }

  /**
   * Displays a message on the scratchpad.
   *
   * @param message The message to display.
   */
  public showScratchpadMessage(message: string): void {
    this.fmcScratchpad.showValue(message);
  }

  /**
   * Displays an error on the scratchpad.
   *
   * @param error The error to display.
   */
  public showScratchpadError(error: string): void {
    this.fmcScratchpad.showError(error);
  }

  /**
   * Clears the scratchpad
   */
  public clearScratchpad(): void {
    this.fmcScratchpad.clear();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private initializePage(ctor: FmcPageConstructor): FmcPage {
    const newPage = new ctor(this.acceptPageOutput.bind(this), this, this.fmcRouter, this.eventBus, this.baseInstrument);
    newPage.init();
    this.fmcRouter.currentSubpageCount.set(newPage.render().length);
    newPage.isInitialized = true;

    return newPage;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private acceptPageOutput(output: FmcOutputTemplate, atRowIndex: number): void {
    const rows = [...output];

    for (let i = rows.length; i < FMC_LINE_COUNT - 2; i++) {
      rows.push(['']);
    }

    this.fmcRenderer.editOutputTemplate(rows, atRowIndex);
    this.fmcScratchpad.render();
    this.fmcMsgLine.render();
  }

}
