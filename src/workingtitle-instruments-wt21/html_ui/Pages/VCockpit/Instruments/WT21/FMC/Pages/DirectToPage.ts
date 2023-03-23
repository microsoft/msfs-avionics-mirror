import { MappedSubject } from '@microsoft/msfs-sdk';

import { FmcPrevNextEvent } from '../FmcEvent';
import { DisplayField } from '../Framework/Components/DisplayField';
import { Binding } from '../Framework/FmcDataBinding';
import { PageNumberDisplay, RawFormatter } from '../Framework/FmcFormats';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';
import { DirectToPageController } from './DirectToPageController';
import { DirectToPageStore } from './DirectToPageStore';
import { LegsPageController } from './LegsPageController';

/**
 * Direct To Page
 */
export class DirectToPage extends FmcPage {

  private readonly store = new DirectToPageStore();
  private readonly controller = new DirectToPageController(this.eventBus, this.fms, this.store, this, this.pageManager);

  public readonly pageCountDisplay = new DisplayField(this, {
    formatter: PageNumberDisplay,
  });

  public readonly pageHeaderDisplay = new DisplayField(this, {
    formatter: RawFormatter,
  });

  protected readonly FplnPagingSub = MappedSubject.create(
    ([currentPage, pageCount]) => ([currentPage, pageCount] as const),
    this.controller.currentPage,
    this.controller.pageCount,
  );

  public readonly FplnPagingIndicator = new DisplayField(this, {
    formatter: this.PagingFormat,
  });

  /** @inheritDoc */
  protected override onInit(): void {
    // Paging
    this.FplnPagingIndicator.bind(this.FplnPagingSub);
    this.addBinding(new Binding(this.fms.planInMod, this.handleHeaderChange));

    this.pageHeaderDisplay.takeValue(this.fms.planInMod.get() ? LegsPageController.modHeaderString : LegsPageController.activeHeaderString);
  }

  /** @inheritDoc */
  protected override onPause(): void {
    this.controller.destroy();
  }

  /** @inheritDoc */
  protected override onResume(): void {
    this.controller.currentPage.set(1);
    this.controller.init();
  }

  /** @inheritDoc */
  public override render(): FmcRenderTemplate[] {
    return [
      this.controller.renderPage()
    ];
  }

  /**
   * Handles when the FMS changes between MOD and ACT modes.
   * @param pageInMod is whether we're in MOD or ACT mode.
   */
  private readonly handleHeaderChange = (pageInMod: boolean): void => {
    this.pageHeaderDisplay.takeValue(pageInMod ? DirectToPageController.modHeaderString : DirectToPageController.activeHeaderString);
  };

  /** @inheritDoc */
  public override dispatchScrollKeyEvent(event: FmcPrevNextEvent): boolean {
    const currentPage = this.controller.currentPage.get();
    const pageCount = this.controller.pageCount.get();
    switch (event) {
      case FmcPrevNextEvent.BTN_NEXT:
        if (currentPage === pageCount) {
          this.controller.currentPage.set(1);
        } else {
          this.controller.currentPage.set(Math.min(currentPage + 1, pageCount));
        }
        return true;
      case FmcPrevNextEvent.BTN_PREV:
        if (currentPage === 1) {
          this.setActiveRoute('/direct-to-history');
        } else {
          this.controller.currentPage.set(Math.max(currentPage - 1, 1));
        }
        return true;
    }
  }

  /** @inheritDoc */
  public override setActiveRoute(routeString: string): void {
    this.router.activeRouteSubject.set(routeString);
  }

  /** @inheritdoc */
  public override onPageButtonPressed(): void {
    this.controller.currentPage.set(1);
  }
}
