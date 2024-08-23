import { DisplayField, FmcPagingEvents, FmcRenderTemplate, LineSelectKeyEvent } from '@microsoft/msfs-sdk';

import { IcaoIdentFormatter } from '../Framework/FmcFormats';
import { WT21FmcPage } from '../WT21FmcPage';
import { DepArrPageController, DepArrView } from './DepArrPageController';
import { DepArrPageStore } from './DepArrPageStore';

/**
 * Dep Arr Page
 */
export class DepArrPage extends WT21FmcPage {
  private readonly store = new DepArrPageStore();
  private readonly controller = new DepArrPageController(this.bus, this.fms, this.store, this);

  private readonly primaryOrigin = new DisplayField(this, {
    formatter: IcaoIdentFormatter,
  });

  private readonly primaryDestination = new DisplayField(this, {
    formatter: IcaoIdentFormatter,
  });

  /** @inheritDoc */
  protected onInit(): void {
    this.primaryOrigin.bind(this.store.origin);
    this.primaryDestination.bind(this.store.destination);

    this.controller.currentView.sub((view) => { this.changePage(view); });
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
  public override onPageButtonPressed(): void {
    this.controller.currentView.set(DepArrView.INDEX);
  }

  /**
   * Method to Update When Changing Pages
   * @param view The new view
   */
  changePage(view: DepArrView): void {
    if (view !== DepArrView.INDEX) {
      this.store.loadCurrentProcedureData(this.fms, this.controller.currentView.get());
    }
    this.invalidate();
  }

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    switch (this.controller.currentView.get()) {
      case DepArrView.INDEX:
        return [this.getIndexTemplate()];
      case DepArrView.ARR:
      case DepArrView.DEP:
        return [this.controller.renderDepArrTemplate()];
    }
  }

  /** @inheritDoc */
  protected async onHandleSelectKey(event: LineSelectKeyEvent): Promise<boolean | string> {
    if (this.controller.currentView.get() === DepArrView.INDEX) {
      if (event.col === 0 && event.row === (1 * 2) && this.fms.facilityInfo.originFacility) {
        this.controller.displayDeparture();
        return true;
      } else if (event.col === 1 && event.row === (2 * 2) && this.fms.facilityInfo.destinationFacility) {
        this.controller.displayArrival();
        return true;
      }
    }
    return false;
  }

  /** @inheritDoc */
  protected async onHandleScrolling(event: keyof FmcPagingEvents<this> & string): Promise<boolean | string> {
    if (this.controller.currentView.get() !== DepArrView.INDEX) {
      const currentPage = this.controller.currentPage.get();
      const pageCount = this.controller.pageCount.get();
      if (event === 'pageRight') {
        if (currentPage < pageCount) {
          this.controller.currentPage.set(currentPage + 1);
        } else {
          this.controller.currentPage.set(1);
        }
      } else if (event === 'pageLeft') {
        if (currentPage > 1) {
          this.controller.currentPage.set(currentPage - 1);
        } else {
          this.controller.currentPage.set(pageCount);
        }
      }
    }
    return true;
  }

  /**
   * Returns the Index template
   * @returns the Index Template
   */
  getIndexTemplate(): FmcRenderTemplate {
    return [
      ['', '', 'DEP/ARR INDEX[blue]'],
      ['', '', 'ACT FPLN[blue]'],
      ['<DEP', 'ARR>[disabled]', this.primaryOrigin],
      ['', ''],
      ['<DEP[disabled]', 'ARR>', this.primaryDestination],
      // ['', '', 'SEC FPLN[blue]'],
      ['', '', ''],
      ['', ''],
      ['', ''],
      ['', ''],
      ['', ''],
      ['', ''],
      // [' DEP', 'ARR ', 'OTHER'],
      ['', '', ''],
      // ['<----', '---->'],
      ['', ''],
    ];
  }

  /** @inheritDoc */
  setActiveRoute(routeString: string): void {
    this.screen.navigateTo(routeString);
  }
}


