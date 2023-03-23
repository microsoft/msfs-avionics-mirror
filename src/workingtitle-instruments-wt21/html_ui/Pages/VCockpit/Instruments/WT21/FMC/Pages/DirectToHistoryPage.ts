import { MappedSubject } from '@microsoft/msfs-sdk';

import { FmcPrevNextEvent } from '../FmcEvent';
import { DisplayField } from '../Framework/Components/DisplayField';
import { Binding } from '../Framework/FmcDataBinding';
import { PageNumberDisplay, RawFormatter } from '../Framework/FmcFormats';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';
import { DirectToHistoryPageController } from './DirectToHistoryPageController';
import { DirectToPageStore } from './DirectToPageStore';

/**
 * Direct To History Page
 */
export class DirectToHistoryPage extends FmcPage {

    private store = new DirectToPageStore();
    private controller = new DirectToHistoryPageController(this.eventBus, this.fms, this.store, this, this.pageManager);

    public pageCountDisplay = new DisplayField(this, {
        formatter: PageNumberDisplay,
    });

    public pageHeaderDisplay = new DisplayField(this, {
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
    protected onInit(): void {
        // Paging
        this.FplnPagingIndicator.bind(this.FplnPagingSub);
        this.addBinding(new Binding(this.fms.planInMod, this.handleHeaderChange));

        this.pageHeaderDisplay.takeValue(this.fms.planInMod.get() ? DirectToHistoryPageController.modHeaderString : DirectToHistoryPageController.activeHeaderString);
    }

    /** @inheritDoc */
    protected onPause(): void {
        this.controller.destroy();
    }

    /** @inheritDoc */
    protected onResume(): void {
        this.controller.currentPage.set(1);
        this.controller.init();
    }

    /** @inheritDoc */
    public render(): FmcRenderTemplate[] {
        return [
            this.controller.renderPage()
        ];
    }

    /**
     * Handles when the FMS changes between MOD and ACT modes.
     * @param pageInMod is whether we're in MOD or ACT mode.
     */
    private handleHeaderChange = (pageInMod: boolean): void => {
        this.pageHeaderDisplay.takeValue(pageInMod ? DirectToHistoryPageController.modHeaderString : DirectToHistoryPageController.activeHeaderString);
    };

    /** @inheritDoc */
    public dispatchScrollKeyEvent(event: FmcPrevNextEvent): boolean {
        const currentPage = this.controller.currentPage.get();
        const pageCount = this.controller.pageCount.get();
        switch (event) {
            case FmcPrevNextEvent.BTN_NEXT:
                if (currentPage === pageCount) {
                    this.setActiveRoute('/direct-to');
                } else {
                    this.controller.currentPage.set(Math.min(currentPage + 1, pageCount));
                }
                return true;
            case FmcPrevNextEvent.BTN_PREV:
                this.controller.currentPage.set(Math.max(currentPage - 1, 1));
                return true;
        }
    }

    /** @inheritDoc */
    setActiveRoute(routeString: string): void {
        this.router.activeRouteSubject.set(routeString);
    }

}
