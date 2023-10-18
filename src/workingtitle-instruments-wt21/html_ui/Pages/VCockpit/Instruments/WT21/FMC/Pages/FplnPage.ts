import { ICAO, MappedSubject } from '@microsoft/msfs-sdk';

import { FmcPrevNextEvent, FmcSelectKeysEvent } from '../FmcEvent';
import { DisplayField } from '../Framework/Components/DisplayField';
import { PageLinkField } from '../Framework/Components/PageLinkField';
import { TextInputField } from '../Framework/Components/TextInputField';
import { Binding, DataInterface } from '../Framework/FmcDataBinding';
import { PageNumberDisplay, RawFormatter, StringInputFormat } from '../Framework/FmcFormats';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';
import { FplnPageController } from './FplnPageController';
import { FplnPageStore } from './FplnPageStore';

/**
 * FPLN page
 */
export class FplnPage extends FmcPage {

  public readonly perfInitLink = PageLinkField.createLink(this, 'PERF INIT>', '/perf-init');

  private store = new FplnPageStore(this.eventBus);
  private controller = new FplnPageController(this.eventBus, this.fms, this.store, this, this.pageManager);

  // private readonly renderList = new FmcListUtility(this, this.store.legs, this.renderListRow, 5);

  public pageCountDisplay = new DisplayField(this, {
    formatter: PageNumberDisplay,
  });

  // new DisplayField<string, string>(this.initialRender.bind(this), PageNumberDisplay);

  public pageHeaderDisplay = new DisplayField(this, {
    formatter: RawFormatter,
  });

  public cancelModDisplay = new DisplayField(this, {
    formatter: RawFormatter,
  });

  private originField = new TextInputField<string | null>(this, {
    formatter: new StringInputFormat({ nullValueString: '□□□□' }),
    onSelected: async (scratchpadContents): Promise<string | boolean> => {
      if (scratchpadContents.length === 0) {
        const plan = this.fms.getPlanForFmcRender();

        if (plan.originAirport) {
          return ICAO.getIdent(plan.originAirport);
        }
      }
      return false;
    },
    deleteAllowed: false,
    clearScratchpadOnSelectedHandled: false,
  });

  private readonly fltNoField = new TextInputField(this, {
    formatter: new StringInputFormat({ nullValueString: '--------', maxLength: 8 }),
    deleteAllowed: true,
  }).bind(this.store.flightNoSetting);


  private distanceField = new DisplayField(this, {
    formatter: {
      nullValueString: '----',

      /** @inheritDoc */
      format(dist: number): string {
        return dist > 0 ? dist.toFixed(0) : this.nullValueString;
      },
    },
  });

  private originRunway = new DisplayField(this, {
    formatter: RawFormatter,
  });

  /** @inheritDoc */
  protected onInit(): void {
    // Paging
    this.FplnPagingIndicator.bind(this.FplnPaging);

    // Input Data
    this.originField.bindSource(new DataInterface(this.store.origin, (v) => this.controller.setOrigin(v)));
    this.originRunway.bind(this.store.originRunway);
    this.distanceField.bind(this.store.distance);

    // FMS Event
    this.addBinding(new Binding(this.fms.planInMod, this.handleHeaderChange));
    this.addBinding(new Binding(this.fms.planInMod, this.handleHeaderChange));

    this.cancelModDisplay.takeValue(this.fms.planInMod.get() ? '<CANCEL MOD' : '<SEC FPLN');
    this.pageHeaderDisplay.takeValue(this.fms.planInMod.get() ? FplnPageController.modHeaderString : FplnPageController.activeHeaderString);
  }

  /** @inheritDoc */
  protected onPause(): void {
    this.controller.destroy();
  }

  /** @inheritDoc */
  protected onResume(): void {
    this.controller.init();
  }

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return [
      this.renderMainPage(),
      this.renderRoutePage(),
    ];
  }

  protected readonly FplnPaging = MappedSubject.create(
    ([routerSubpageIndex, currentPage, pageCount]) => {
      if (routerSubpageIndex === 1) {
        return [1, pageCount] as const;
      } else {
        return [currentPage, pageCount] as const;
      }
    },
    this.router.currentSubpageIndex,
    this.controller.currentPage,
    this.controller.pageCount,
  );

  public readonly FplnPagingIndicator = new DisplayField(this, {
    formatter: this.PagingFormat,
  });

  /**
   * Renders the Main Page
   * @returns the Render Template
   */
  renderMainPage(): FmcRenderTemplate {
    const firstLeg = this.store.legs.tryGet(0);
    const firstLegName = new DisplayField(this, {
      formatter: RawFormatter,
      onSelected: (scratchpadContents) => this.controller.onWaypointInput(firstLeg, scratchpadContents, false),
      onDelete: () => this.controller.onWaypointInput(firstLeg, '', true),
      style: (firstLeg && firstLeg.isActive) ? '[magenta]' : '',
    });
    firstLegName.takeValue((firstLeg && firstLeg.legDefinition && firstLeg.legDefinition.name) ?? FplnPageController.emptyIdentString);

    const { flightPlanner } = this.fms;
    const hasActiveFlightPlan = flightPlanner.hasActiveFlightPlan() && flightPlanner.getActiveFlightPlan().length > 0;

    const firstLegTitle = (firstLeg !== undefined && firstLeg.globalIndex > -1) ? `${firstLeg.title}${firstLeg.isActive ? '[magenta]' : ''}` : FplnPageController.emptyAirwayString;

    return [
      [this.pageHeaderDisplay, this.FplnPagingIndicator],
      [' ORIGIN[blue]', 'DEST[blue] ', 'DIST[blue]'],
      [this.originField, this.controller.destinationField, this.distanceField],
      [' ROUTE[blue]', 'ALTN[blue] '],
      ['----------', this.controller.altnField],
      [' ', 'ORIG RWY[blue] '],
      [' ', this.originRunway],
      [' VIA[blue]', 'TO[blue] '],
      [firstLegTitle, firstLegName],
      ['----------------[blue]', 'FLT NO[blue] '],
      [!this.fms.planInMod.get() && hasActiveFlightPlan ? '<COPY ACTIVE[disabled]' : '', this.fltNoField],
      ['', ''],
      [this.cancelModDisplay, this.perfInitLink],
    ];
  }

  /**
   * Renders the Route Pages
   * @returns the Render Template
   */
  renderRoutePage(): FmcRenderTemplate {
    return this.controller.renderPage();
  }

  // Special handling for F-PLN page
  /** @inheritDoc */
  handleScrollKey(event: FmcPrevNextEvent): boolean {
    // The currentSubpageIndex is 1 when on the main page, and 2 when on any of the other "fixes" pages
    const routerPageIndex = this.router.currentSubpageIndex.get();

    if (routerPageIndex === 1) {
      if (this.controller.pageCount.get() > 1) {
        if (event === FmcPrevNextEvent.BTN_NEXT) {
          this.router.currentSubpageIndex.set(2);
          this.controller.currentPage.set(2);
        } else {
          this.router.currentSubpageIndex.set(2);
          this.controller.currentPage.set(this.controller.pageCount.get());
        }
      }
    } else {
      if (event === FmcPrevNextEvent.BTN_NEXT) {
        if (this.controller.currentPage.get() === this.controller.pageCount.get()) {
          this.router.currentSubpageIndex.set(1);
          this.controller.currentPage.set(1);
        } else {
          this.controller.currentPage.set(this.controller.currentPage.get() + 1);
        }
      } else {
        if (this.controller.currentPage.get() === 2) {
          this.router.currentSubpageIndex.set(1);
          this.controller.currentPage.set(1);
        } else {
          this.controller.currentPage.set(this.controller.currentPage.get() - 1);
        }
      }
    }
    return true;
  }

  /**
   * Handles when the FMS changes between MOD and ACT modes.
   * @param pageInMod is whether we're in MOD or ACT mode.
   */
  private handleHeaderChange = (pageInMod: boolean): void => {
    this.pageHeaderDisplay.takeValue(pageInMod ? FplnPageController.modHeaderString : FplnPageController.activeHeaderString);
    this.cancelModDisplay.takeValue(pageInMod ? '<CANCEL MOD' : '<SEC FPLN[disabled]');
  };

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleSelectKey(event: FmcSelectKeysEvent, scratchpadContents: string, isDelete: boolean): Promise<boolean | string> {
    switch (event[0]) {
      case 'L':
        if (event === FmcSelectKeysEvent.LSK_6) {
          if (this.fms.planInMod.get()) {
            this.controller.handleCancelMod();

            return Promise.resolve(true);
          }
          // TODO Open whatever menu is the lower left
        }
        return Promise.resolve(true);
      case 'R':
        if (event === FmcSelectKeysEvent.RSK_6) {
          // TODO Open whatever menu is the lower right
        }
        return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }
}
