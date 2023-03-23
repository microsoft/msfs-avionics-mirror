import { ControlEvents, Facility, GeoPoint, ICAO, LegType, MappedSubject } from '@microsoft/msfs-sdk';

import { WT21FmsUtils } from '../../Shared/FlightPlan/WT21FmsUtils';
import { FmcPrevNextEvent } from '../FmcEvent';
import { DisplayField } from '../Framework/Components/DisplayField';
import { TextInputField } from '../Framework/Components/TextInputField';
import { DataInterface } from '../Framework/FmcDataBinding';
import { PageNumberDisplay, RawFormatter, RawValidator, SimpleStringFormat } from '../Framework/FmcFormats';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';
import { LegsPageController } from './LegsPageController';
import { LegsPageStore } from './LegsPageStore';

/**
 * LEGS page
 */
export class LegsPage extends FmcPage {
  private readonly store = new LegsPageStore();
  private readonly controller = new LegsPageController(
    this.eventBus, this.fms, this.store, this, this.pageManager);

  public readonly pageCountDisplay = new DisplayField(this, {
    formatter: PageNumberDisplay,
  });

  public readonly pageHeaderDisplay = new DisplayField(this, {
    formatter: RawFormatter,
  });

  public readonly cancelModDisplay = new DisplayField(this, {
    formatter: RawFormatter,
  });

  protected readonly FplnPaging = MappedSubject.create(
    ([currentPage, pageCount]) => ([currentPage, pageCount] as const),
    this.controller.currentPage,
    this.controller.pageCount,
  );

  public readonly FplnPagingIndicator = new DisplayField(this, {
    formatter: this.PagingFormat,
  });

  /**
   * Modifiable data source for the "hold at" facility. Modified using a facility ident and outputs the corresponding facility.
   * Will prompt for duplicate facilities if needed.
   *
   * @private
   */
  private readonly HoldFacilityData = new DataInterface<Facility | null, string>(this.store.holdAtFacilitySubject, async (ident) => {
    if (ident === null) {
      this.store.holdAtFacilitySubject.set(null);
    }

    const { lat, long } = this.controller.ppos.get();

    const pos = new GeoPoint(lat, long);

    const selection = await this.pageManager.selectWptFromIdent(ident, pos);

    if (selection) {
      this.store.holdAtFacilitySubject.set(selection);

      this.pageManager.showScratchpadMessage('HOLD AT ' + ICAO.getIdent(selection.icao));
    } else {
      this.pageManager.showScratchpadError('FACILITY NOT FOUND');
    }
  });

  /**
   * Handler called when LSK6 is pressed.
   * @returns Whether this button press was successfully handled.
   */
  private readonly lskL6Pressed = async (): Promise<boolean | string> => {
    if (this.fms.planInMod.get()) {
      //cancel the mod
      this.fms.cancelMod();
      return Promise.resolve(true);
    } else {
      //do the runway update
      return Promise.resolve(true);
    }
  };

  // TODO RWY UPDATE Should only be visible when on ground and a departure runway in in the plan and not in MOD
  private readonly L6Text = this.fms.planInMod.map((is) => is ? '<CANCEL MOD' : '<RWY UPDATE[disabled]');

  private readonly L6Field = new DisplayField(this, {
    formatter: RawFormatter,
    onSelected: this.lskL6Pressed.bind(this),
  });

  private readonly L6HoldLegField = new TextInputField<Facility | null, string>(this, {
    formatter: {
      ...RawValidator,

      nullValueString: '□□□□□',

      /** @inheritDoc */
      format(value: Facility): string {
        return ICAO.getIdent(value.icao);
      },
    },
  });

  /** @inheritDoc */
  protected override onInit(): void {
    // Paging
    this.L6Field.bind(this.L6Text);
    this.L6HoldLegField.bindSource(this.HoldFacilityData);
    this.FplnPagingIndicator.bind(this.FplnPaging);
    this.addBinding(this.fms.planInMod.sub(this.handleHeaderChange));

    this.pageHeaderDisplay.takeValue(this.fms.planInMod.get() ? LegsPageController.modHeaderString : LegsPageController.activeHeaderString);
  }

  /** @inheritDoc */
  protected override onPause(): void {
    this.controller.destroy();
  }

  /** @inheritDoc */
  protected override onResume(): void {
    const { isForHoldSelection } = this.router.params;

    this.controller.isForHoldSelection = (isForHoldSelection as boolean) ?? false;
    this.controller.currentPage.set(1);
    this.controller.init();
  }

  /** @inheritDoc */
  public override render(): FmcRenderTemplate[] {
    let L6;
    if (this.controller.isForHoldSelection) {
      if (this.fms.planInMod.get()) {
        L6 = new DisplayField(this, {
          formatter: new SimpleStringFormat('<CANCEL'),
          onSelected: (): Promise<boolean> => {
            this.fms.cancelMod();
            return Promise.resolve(true);
          },
        });
      } else {
        L6 = this.L6HoldLegField;
      }
    } else {
      const activeLeg = this.fms.getPlanForFmcRender().tryGetLeg(this.fms.getPlanForFmcRender().activeLateralLeg);

      // Show <EXIT HOLD is active leg is a hold
      if (activeLeg && WT21FmsUtils.isHoldAtLeg(activeLeg.leg.type)) {
        L6 = new DisplayField(this, {
          formatter: new SimpleStringFormat(this.controller.lnavSequencing ? '<CANCEL EXIT' : '<EXIT HOLD'),
          onSelected: async (): Promise<boolean> => {
            // FIXME find out specifics about WT21 hold exits? for now just suspend/unsuspend
            this.eventBus.getPublisher<ControlEvents>().pub('suspend_sequencing', this.controller.lnavSequencing);
            return true;
          },
        });
      } else {
        L6 = this.L6Field;
      }
    }

    let R6: string | DisplayField<string | null> = 'LEG WIND>[disabled]';
    let footerHeader = '------------------------[blue]';
    if (this.controller.isForHoldSelection) {
      R6 = new DisplayField(this, {
        formatter: new SimpleStringFormat('PPOS>'),
        onSelected: async (): Promise<boolean> => {
          this.fms.insertPposHold();
          this.setActiveRoute('/fpln-hold', { atLeg: 1 });
          return true;
        }
      });
      footerHeader = '---------HOLD AT--------[blue]';
    } else if (this.fms.planInMod.get() && this.controller.isFmcPageInDirectToExistingState()) {

      const modPlan = this.fms.getPlanForFmcRender();
      const activeDirectLeg = modPlan.tryGetLeg(modPlan.activeLateralLeg);
      const directCourse = activeDirectLeg !== null && WT21FmsUtils.getDirectToCourse(activeDirectLeg);
      const isUserCourse = activeDirectLeg?.leg.type === LegType.CF;
      const directCourseString = directCourse !== false ? `${directCourse.toFixed(0).padStart(3, '0')}°` + (isUserCourse ? '[d-text]' : '[s-text]') : '---°';

      R6 = new DisplayField(this, {
        formatter: new SimpleStringFormat(directCourseString + '>'),
        onSelected: async (scratchpadContents): Promise<boolean | string> => {
          if (scratchpadContents !== undefined && activeDirectLeg !== undefined) {
            const parsed = parseInt(scratchpadContents);

            if (!Number.isFinite(parsed)) {
              return Promise.reject('INVALID ENTRY');
            }

            return this.controller.setDirectToCourse(modPlan, parsed);
          }

          return false;
        }
      });

      footerHeader = '----------------[blue]INTC CRS[white]';
    }

    return [
      [
        ...this.controller.renderPageRows(),
        [footerHeader],
        [L6, R6]
      ]
    ];
  }

  /**
   * Handles when the FMS changes between MOD and ACT modes.
   * @param pageInMod is whether we're in MOD or ACT mode.
   */
  private readonly handleHeaderChange = (pageInMod: boolean): void => {
    this.pageHeaderDisplay.takeValue(pageInMod ? LegsPageController.modHeaderString : LegsPageController.activeHeaderString);
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
          this.controller.currentPage.set(pageCount);
        } else {
          this.controller.currentPage.set(Math.max(currentPage - 1, 1));
        }
        return true;
    }
  }

  /** @inheritdoc */
  public override onPageButtonPressed(): void {
    this.controller.currentPage.set(1);
  }
}
