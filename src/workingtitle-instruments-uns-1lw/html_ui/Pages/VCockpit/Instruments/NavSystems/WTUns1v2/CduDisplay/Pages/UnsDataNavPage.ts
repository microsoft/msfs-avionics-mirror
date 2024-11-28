import {
  AiracCycleFormatter, AiracUtils, DisplayField, EventBus, FacilitySearchType, FmcRenderTemplate, ICAO, SimVarValueType, Subject
} from '@microsoft/msfs-sdk';

import { UnsTextInputField, WritableUnsFieldState } from '../Components/UnsTextInputField';
import { UnsChars } from '../UnsCduDisplay';
import { UnsCduCursorPath, UnsFmcPage } from '../UnsFmcPage';

/**
 * Store for {@link UnsDeparturePage}
 */
class UnsNavDataPageStore {
  /** @inheritdoc */
  constructor(private readonly bus: EventBus) { }

  public readonly navdataRange = Subject.create(SimVar.GetGameVarValue('FLIGHT_NAVDATA_DATE_RANGE', SimVarValueType.String));

  public readonly selectedWaypointIdent = Subject.create<string | null>(null);
}


/** UNS Nav Data page */
export class UnsNavDataPage extends UnsFmcPage {
  protected pageTitle = ' DATA/NAV';

  private static readonly INACTIVE_AIRAC_FORMATTER = AiracCycleFormatter.create('{eff({dd}-{MON}-{YY})}');
  private static readonly ACTIVE_AIRAC_FORMATTER = AiracCycleFormatter.create('{exp({dd}-{MON}-{YY})}');

  private readonly store = new UnsNavDataPageStore(this.bus);

  protected readonly WaypointIdentField = new UnsTextInputField<string | null, string>(this, {
    formatter: {
      parse: (input): string | null => input,
      format: ([selectedWaypoint, isHighlighted, text]: WritableUnsFieldState<string | null>): string => {
        const isNull = (isHighlighted && text.length == 0) || (!isHighlighted && (selectedWaypoint == null || selectedWaypoint.length == 0));
        const nullString = '-----';
        const waypointText = isHighlighted ? text : selectedWaypoint;

        return `${!isNull ? waypointText?.padEnd(5, '') : nullString}[${isHighlighted ? 'r-white' : 'white'}]`;
      },
    },
    onSelected: async (scratchpadText) => {
      this.screen.toggleFieldFocused(this.WaypointIdentField);
      return scratchpadText;
    },
    onEnterPressed: async () => {
      const icao = this.store.selectedWaypointIdent.get();

      if (icao) {
        const idents = (await this.fms.facLoader.searchByIdent(FacilitySearchType.AllExceptVisual, icao))
          .filter((value) => value.includes(` ${icao} `))
          .map(async (value) => {
            const facility = await this.fms.facLoader.getFacility(ICAO.getFacilityType(value), value);
            return facility;
          });

        Promise.all(idents).then((facilities) => {
          this.screen.navigateTo('/waypoint-ident', { facilities: facilities });
        });
      }
      return true;
    },
    maxInputCharacterCount: 5,
    acceptEmptyInput: true,
  }).bindWrappedData(this.store.selectedWaypointIdent);

  private readonly ActiveNavDataExpiryField = new DisplayField<string>(this, {
    formatter: {
      /** @inheritDoc */
      format(navdataRange: string): string {
        const cycle = AiracUtils.parseFacilitiesCycle(navdataRange);
        return cycle ? UnsNavDataPage.ACTIVE_AIRAC_FORMATTER(cycle) : '---------';
      },
    },
  }).bind(this.store.navdataRange);

  private readonly InactiveNavDataExpiryField = new DisplayField<string>(this, {
    formatter: {
      /** @inheritDoc */
      format(navdataRange: string): string {
        const cycle = AiracUtils.parseFacilitiesCycle(navdataRange);
        return cycle ? `${UnsNavDataPage.INACTIVE_AIRAC_FORMATTER(cycle)}   [white] [line-tb]` : '---------   [white] [line-tb]';
      },
    },
  }).bind(this.store.navdataRange);

  private readonly ReturnPrompt = new DisplayField(this, {
    formatter: () => `RETURN${UnsChars.ArrowRight}`,
    onSelected: async () => {
      this.screen.navigateBackShallow();
      return true;
    },
  });

  public cursorPath: UnsCduCursorPath = {
    initialPosition: null,
    rules: new Map([[this.WaypointIdentField, this.WaypointIdentField]]),
  };

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    return [
      [
        [this.TitleField],
        ['          [white] [line-tb]', 'WPT IDENT[cyan]'],
        ['←SID[disabled]      [white] [line-tb]', this.WaypointIdentField],
        ['          [white] [line-tb]', 'EXP[cyan] 0900Z'],
        ['←STAR[disabled]     [white] [line-tb]', this.ActiveNavDataExpiryField],
        ['          [white] [line-tb]', 'REGION[cyan]'],
        ['←APPROACH[disabled] [white] [line-tb]', 'WORLDWIDE'],
        ['          [white] [line-tb]', '2000 FT'],
        ['←RUNWAY[disabled]   [white] [line-tb]', ''],
        [`          [white] [line-tb-mr]${' '.repeat(13)}[line-rl] [line-ml]`],
        ['←AIRWAY[disabled]   [white] [line-tb]', this.ReturnPrompt],
      ],
      [
        [this.TitleField],
        ['INACTIVE    [white] [line-tb]', 'ACTIVE'],
        ['            [white] [line-tb]', ''],
        ['EXP[cyan]         [white] [line-tb]', 'EXP[cyan]'],
        [this.InactiveNavDataExpiryField, this.ActiveNavDataExpiryField],
        ['REGION[cyan]      [white] [line-tb]', 'REGION[cyan]'],
        ['WORLDWIDE   [white] [line-tb]', 'WORLDWIDE'],
        ['2000 FT     [white] [line-tb]', '2000 FT'],
        ['            [white] [line-tb]', ''],
        [`            [line-rl] [line-mt-rl]${' '.repeat(11)}[line-rl] [line-ml]`],
        ['', this.ReturnPrompt],
      ],
    ];
  }
}
