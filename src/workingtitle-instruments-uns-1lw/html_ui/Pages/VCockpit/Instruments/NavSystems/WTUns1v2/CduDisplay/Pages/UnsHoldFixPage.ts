import { DisplayField, FmcPagingEvents, FmcRenderTemplate, ICAO, Subject } from '@microsoft/msfs-sdk';

import { FixEntry } from '../../Fms/UnsFmsTypes';
import { UnsTextInputField } from '../Components/UnsTextInputField';
import { UnsWaypointPickList } from '../Components/UnsWaypointPickList';
import { UnsChars } from '../UnsCduDisplay';
import { UnsCduCursorPath, UnsFmcPage } from '../UnsFmcPage';

/**
 * UNS HOLD FIX page
 */
export class UnsHoldFixPage extends UnsFmcPage {
  private readonly WaypointList = new UnsWaypointPickList(this, this.fms);

  private readonly WaypointSelectionField = new UnsTextInputField<unknown, FixEntry>(this, {
    maxInputCharacterCount: 9,
    formatter: {
      /** @inheritDoc */
      format([, isHighlighted, typedText]): string {
        return `${typedText.padEnd(9, ' ')}[${isHighlighted ? 'r-white' : 'white'} d-text]  [white s-text]`;
      },

      parse: async (input: string): Promise<FixEntry | null> => {
        const intInput = parseInt(input);

        if (!Number.isFinite(intInput)) {
          const ident = input;

          let facilityIcao: string | undefined;
          for (let i = 0; i < this.WaypointList.eligibleWaypoints.length; i++) {
            const waypoint = this.WaypointList.eligibleWaypoints.get(i);

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
          const entry = this.WaypointList.data.get().data.find((it) => intInput === it.index);

          if (!entry) {
            return null;
          }

          return { type: 'existing', segmentIndex: entry.segmentIndex, localLegIndex: entry.localLegIndex, facilityIcao: entry.icao };
        }
      },
    },

    onModified: async (hold: FixEntry) => {
      this.screen.navigateTo('/hold-definition', { hold });
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

  protected pageTitle = 'HOLD FIX';

  protected displayedSubPagePadding = 2;

  public cursorPath: UnsCduCursorPath = {
    initialPosition: this.WaypointSelectionField,
    rules: new Map([]),
  };

  /** @inheritDoc */
  protected override onInit(): void {
    this.displayedSubPageIndexPipe?.destroy();
    this.displayedSubPageCountPipe?.destroy();
    this.addBinding(this.displayedSubPageIndexPipe = this.WaypointList.subPageIndex.pipe(this.displayedSubPageIndex));
    this.addBinding(this.displayedSubPageCountPipe = this.WaypointList.subPageCount.pipe(this.displayedSubPageCount));
  }

  /** @inheritDoc */
  protected override onResume(): void {
    this.WaypointList.onPageResume();
  }

  /** @inheritDoc */
  protected override onDestroy(): void {
    this.WaypointList.destroy();
  }

  /** @inheritDoc */
  public override render(): FmcRenderTemplate[] {
    return [
      [
        [this.TitleField],
        ['', this.WaypointList],
        [''],
        ['HOLD FIX[cyan s-text]'],
        [this.WaypointSelectionField],
        [''],
        [''],
        [''],
        [''],
        [''],
        ['', this.ReturnLink],
      ],
    ];
  }

  /** @inheritDoc */
  protected override async onHandleScrolling(event: keyof FmcPagingEvents<this> & string): Promise<boolean | string> {
    switch (event) {
      case 'pageLeft': this.WaypointList.prevSubpage(); return true;
      case 'pageRight': this.WaypointList.nextSubpage(); return true;
    }

    return super.onHandleScrolling(event);
  }
}
