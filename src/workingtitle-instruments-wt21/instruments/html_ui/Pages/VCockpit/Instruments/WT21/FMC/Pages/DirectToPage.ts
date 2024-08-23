import { DisplayField, FmcPagingEvents, FmcRenderTemplate, MappedSubject, RawFormatter } from '@microsoft/msfs-sdk';

import { PageNumberDisplay } from '../Framework/FmcFormats';
import { WT21FmcPage } from '../WT21FmcPage';
import { DirectToPageController } from './DirectToPageController';
import { DirectToPageStore } from './DirectToPageStore';
import { LegsPageController } from './LegsPageController';

/**
 * Direct To Page
 */
export class DirectToPage extends WT21FmcPage {

  private readonly store = new DirectToPageStore();
  private readonly controller = new DirectToPageController(this.bus, this.fms, this.store, this, this.screen);

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
    this.addBinding(this.fms.planInMod.sub(this.handleHeaderChange));

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
      this.controller.renderPage(),
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
  protected async onHandleScrolling(event: keyof FmcPagingEvents<this> & string): Promise<boolean | string> {
    const currentPage = this.controller.currentPage.get();
    const pageCount = this.controller.pageCount.get();

    switch (event) {
      case 'pageRight':
        if (currentPage === pageCount) {
          this.controller.currentPage.set(1);
        } else {
          this.controller.currentPage.set(Math.min(currentPage + 1, pageCount));
        }
        return true;
      case 'pageLeft':
        if (currentPage === 1) {
          this.screen.navigateTo('/direct-to-history');
        } else {
          this.controller.currentPage.set(Math.max(currentPage - 1, 1));
        }
        return true;
    }

    return false;
  }


  /** @inheritdoc */
  public override onPageButtonPressed(): void {
    this.controller.currentPage.set(1);
  }
}
