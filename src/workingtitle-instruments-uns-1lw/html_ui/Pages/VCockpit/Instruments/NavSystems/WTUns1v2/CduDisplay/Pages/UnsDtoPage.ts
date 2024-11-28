import { DisplayField, FlightPlan, FmcPagingEvents, FmcRenderTemplate, ICAO, LegTurnDirection, Subject } from '@microsoft/msfs-sdk';

import { UnsCduCursorPath, UnsFmcPage } from '../UnsFmcPage';
import { UnsChars } from '../UnsCduDisplay';
import { UnsTextInputField } from '../Components/UnsTextInputField';
import { UnsWaypointPickList } from '../Components/UnsWaypointPickList';

/**
 * Store for {@link UnsDtoPage}
 */
class UnsDtoPageStore {
  /**
   * Constructor
   *
   * @param targetPlan the target flight plan
   */
  constructor(public readonly targetPlan: FlightPlan) {
  }

  public readonly specifiedTurnDirection = Subject.create(LegTurnDirection.None);
}

/**
 * A DTO output to an existing flight plan waypoint
 */
interface DtoExistingOutput {
  /** The type of DTO */
  type: 'existing',

  /** The segment index of the leg to DTO to */
  segmentIndex: number,


  /** The local leg index of the leg to DTO to */
  localLegIndex: number,
}

/**
 * A DTO output to a random facility
 */
interface DtoRandomOutput {
  /** The type of DTO */
  type: 'random',

  /** The ICAO of the facility to DTO to */
  facilityIcao: string,
}

/**
 * A DTO output by the {@link UnsDtoPage.WaypointSelectionField} field
 */
type DtoOutput = DtoExistingOutput | DtoRandomOutput


/** A UNS Dto page */
export class UnsDtoPage extends UnsFmcPage {
  private readonly store = new UnsDtoPageStore(this.fms.getPrimaryFlightPlan());

  private readonly WaypointList = new UnsWaypointPickList(this, this.fms);

  private readonly WaypointSelectionField = new UnsTextInputField<unknown, DtoOutput>(this, {
    maxInputCharacterCount: 9,
    formatter: {
      /** @inheritDoc */
      format([, isHighlighted, typedText]): string {
        return `DIRECT [cyan s-text]${typedText.padEnd(9, ' ')}[${isHighlighted ? 'r-white' : 'white'} d-text]  [white s-text]`;
      },

      parse: async (input: string): Promise<DtoOutput | null> => {
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

          return { type: 'existing', segmentIndex: entry.segmentIndex, localLegIndex: entry.localLegIndex };
        }
      },
    },

    onModified: async (dto: DtoOutput) => {
      if (dto.type === 'existing') {
        this.fms.createDirectTo({
          segmentIndex: dto.segmentIndex,
          segmentLegIndex: dto.localLegIndex,
          isNewDto: true,
          course: undefined,
          facility: undefined,
          turnDirection: this.store.specifiedTurnDirection.get(),
        });
      } else {
        const facility = await this.fms.facLoader.getFacility(ICAO.getFacilityType(dto.facilityIcao), dto.facilityIcao);

        this.fms.createDirectTo({
          facility,
          isNewDto: true,
        });
      }

      return true;
    },
  }).bindWrappedData(Subject.create(undefined));

  private readonly LeftTurnDirectionField = new DisplayField(this, {
    formatter: (turnDirection) => turnDirection === LegTurnDirection.Left ? 'LEFT [white s-text]' : `LEFT${UnsChars.ArrowRight}[white d-text]`,
    onSelected: async () => {
      this.store.specifiedTurnDirection.set(LegTurnDirection.Left);
      return true;
    },
  }).bind(this.store.specifiedTurnDirection);

  private readonly RightTurnDirectionField = new DisplayField(this, {
    formatter: (turnDirection) => turnDirection === LegTurnDirection.Right ? 'RIGHT [white s-text]' : `RIGHT${UnsChars.ArrowRight}[white d-text]`,
    onSelected: async () => {
      this.store.specifiedTurnDirection.set(LegTurnDirection.Right);
      return true;
    },
  }).bind(this.store.specifiedTurnDirection);

  private readonly AutoTurnDirectionField = new DisplayField(this, {
    formatter: (turnDirection) => turnDirection === LegTurnDirection.None ? 'AUTO [white s-text]' : `AUTO${UnsChars.ArrowRight}[white d-text]`,
    onSelected: async () => {
      this.store.specifiedTurnDirection.set(LegTurnDirection.None);
      return true;
    },
  }).bind(this.store.specifiedTurnDirection);

  protected pageTitle = '   DTO';

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
        [this.WaypointList, this.WaypointSelectionField],
        ['', this.LeftTurnDirectionField],
        [''],
        ['', this.RightTurnDirectionField],
        [''],
        ['', this.AutoTurnDirectionField],
        [''],
        ['', `HOLDING${UnsChars.ArrowRight}[disabled d-text]`],
        [''],
        [`${UnsChars.ArrowLeft}PVOR[disabled d-text]`, `DIVERT${UnsChars.ArrowRight}[disabled d-text]`],
      ],
    ];
  }

  /** @inheritDoc */
  protected async onHandleScrolling(event: keyof FmcPagingEvents<this> & string): Promise<boolean | string> {
    switch (event) {
      case 'pageLeft': this.WaypointList.prevSubpage(); return true;
      case 'pageRight': this.WaypointList.nextSubpage(); return true;
      default: return false;
    }
  }
}
