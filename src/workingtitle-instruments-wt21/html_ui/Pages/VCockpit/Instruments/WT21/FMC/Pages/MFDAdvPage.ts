import { Facility, FacilitySearchType, ICAO, Subject } from '@microsoft/msfs-sdk';
import { PlanMapEvents } from '../../Shared/Map/MapSystemConfig';
import { FmcSelectKeysEvent } from '../FmcEvent';
import { SwitchLabel } from '../Framework/Components/SwitchLabel';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';
import { MfdDisplayMode, MFDUserSettings } from '../../MFD/MFDUserSettings';
import { DisplayField } from '../Framework/Components/DisplayField';
import { WT21MfdTextPageEvents } from '../../Shared/WT21MfdTextPageEvents';
import { TextInputField } from '../Framework/Components/TextInputField';
import { StringInputFormat } from '../Framework/FmcFormats';

/**
 * MFD Advanced Page
 */
export class MFDAdvPage extends FmcPage {
  private readonly index = Subject.create<number>(this.pageManager.fmcIndex - 1);

  private readonly mfdSettings = MFDUserSettings.getMasterManager(this.eventBus);

  private readonly mfdDisplayModeSetting = this.mfdSettings.getSetting(`mfdDisplayMode_${this.pageManager.fmcIndex}`);

  private readonly SubTitle = new DisplayField(this, {
    formatter: {
      nullValueString: '',

      /** @inheritDoc */
      format(value: MfdDisplayMode): string {
        if (value === MfdDisplayMode.Map) {
          return 'ACT PLAN MAP CENTER';
        } else {
          return 'TEXT DISPLAY';
        }
      }
    },
    style: '[blue]',
  }).bind(this.mfdDisplayModeSetting);

  private readonly PrevButton = new DisplayField(this, {
    formatter: {
      nullValueString: '',

      /** @inheritDoc */
      format(value: MfdDisplayMode): string {
        if (value === MfdDisplayMode.Map) {
          return '<PREV WPT';
        } else {
          return '<PREV PAGE';
        }
      }
    },
    style: '[white]',
  }).bind(this.mfdDisplayModeSetting);

  private readonly NextButton = new DisplayField(this, {
    formatter: {
      nullValueString: '',

      /** @inheritDoc */
      format(value: MfdDisplayMode): string {
        if (value === MfdDisplayMode.Map) {
          return '<NEXT WPT';
        } else {
          return '<NEXT PAGE';
        }
      }
    },
    style: '[white]',
  }).bind(this.mfdDisplayModeSetting);

  private readonly ctrIdentValue = Subject.create<string | null>(null);
  private readonly ctrFacilityValue = Subject.create<Facility | null>(null);
  private readonly ctrIdentField = new TextInputField<string | null>(this, {
    formatter: new StringInputFormat({ nullValueString: '-----', }),
    onSelected: async (scratchpadContents) => {
      let selectedFacility: Facility;
      if (scratchpadContents.length === 0 && this.ctrFacilityValue.get() === null) {
        return true;
      } else if (scratchpadContents.length === 0 && this.ctrFacilityValue.get() !== null) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        selectedFacility = this.ctrFacilityValue.get()!;
      } else {
        selectedFacility = (await this.pageManager.selectWptFromIdent(scratchpadContents, this.fms.ppos, FacilitySearchType.All) as Facility);
      }

      if (selectedFacility) {
        this.ctrFacilityValue.set(selectedFacility);
        this.ctrIdentValue.set(ICAO.getIdent(selectedFacility.icao));
        this.publisher.pub('plan_map_ctr_wpt', { index: this.index.get() + 1, icao: selectedFacility.icao, position: { lat: selectedFacility.lat, lon: selectedFacility.lon } }, true, false);
        return true;
      } else {
        return Promise.reject('FACILITY NOT FOUND');
      }
    },
    onDelete: async () => {
      this.ctrFacilityValue.set(null);
      this.ctrIdentValue.set(null);
      this.publisher.pub('plan_map_ctr_wpt', { index: this.index.get() + 1, icao: null, position: null }, true, false);
      return true;
    },
    prefix: '<'
  }).bind(this.ctrIdentValue);

  private readonly sideSwitch = new SwitchLabel(this, {
    optionStrings: ['L', 'R'],
  });

  private readonly publisher = this.eventBus.getPublisher<PlanMapEvents & WT21MfdTextPageEvents>();


  /** @inheritDoc */
  protected onInit(): void {
    this.sideSwitch.bind(this.index);
  }

  /** @inheritDoc */
  public handleSelectKey(event: FmcSelectKeysEvent): Promise<string | boolean> {

    if (this.mfdDisplayModeSetting.get() === MfdDisplayMode.Map) {
      switch (event) {
        case FmcSelectKeysEvent.LSK_1:
          this.publisher.pub('plan_map_prev', this.index.get() + 1, true, false);
          break;
        case FmcSelectKeysEvent.LSK_2:
          this.publisher.pub('plan_map_next', this.index.get() + 1, true, false);
          break;
        case FmcSelectKeysEvent.LSK_3:
          if (this.mfdDisplayModeSetting.value === MfdDisplayMode.Map) {
            this.publisher.pub('plan_map_to', this.index.get() + 1, true, false);
          }
          break;
      }
    } else {
      switch (event) {
        case FmcSelectKeysEvent.LSK_1:
          this.publisher.pub('wt21mfd_text_page_prev', this.index.get() + 1, true, false);
          break;
        case FmcSelectKeysEvent.LSK_2:
          this.publisher.pub('wt21mfd_text_page_next', this.index.get() + 1, true, false);
          break;
      }
    }

    return Promise.resolve(true);
  }

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return (this.mfdDisplayModeSetting.value === MfdDisplayMode.Map) ? [
      [
        ['', '', `${this.pageManager.fmcIndex === 1 ? 'LEFT' : 'RIGHT'} DISPLAY ADVANCE[blue]`],
        ['', '', this.SubTitle],
        [this.PrevButton, ''],
        ['', ''],
        [this.NextButton, ''],
        ['', ''],
        ['<TO WPT', ''],
        [' CTR WPT[blue]', ''],
        [this.ctrIdentField, ''],
        ['', ''],
        ['', ''],
        ['', 'SIDE[blue]'],
        ['', this.sideSwitch]
      ]
    ] : [
      [
        ['', '', `${this.pageManager.fmcIndex === 1 ? 'LEFT' : 'RIGHT'} DISPLAY ADVANCE[blue]`],
        ['', '', this.SubTitle],
        [this.PrevButton, ''],
        ['', ''],
        [this.NextButton, ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', 'SIDE[blue]'],
        ['', this.sideSwitch]
      ]
    ];
  }
}
