import {
  ComponentProps, DisplayComponent, DurationDisplay, DurationDisplayFormat, FSComponent, NumberUnitSubject,
  Subscribable, Subscription, UnitType, VNode
} from '@microsoft/msfs-sdk';
import { ComRadioSpacingSettingMode, ComRadioUserSettings, DateTimeFormatSettingMode, DateTimeUserSettings } from '@microsoft/msfs-garminsdk';
import { GtcList } from '../../Components/List/GtcList';
import { GtcListItem } from '../../Components/List/GtcListItem';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcLocalTimeOffsetDialog } from '../../Dialog/GtcLocalTimeOffsetDialog';
import { GtcInteractionEvent } from '../../GtcService/GtcInteractionEvent';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcPfdSettingsPageTabContent } from './GtcPfdSettingsPageTabContent';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';

/**
 * Component props for GtcPfdSettingsPageGeneralList.
 */
export interface GtcPfdSettingsPageGeneralListProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** The height of each list item, in pixels. */
  listItemHeight: number;

  /** The spacing between each list item, in pixels. */
  listItemSpacing: number;

  /** The SidebarState to use. */
  sidebarState?: SidebarState | Subscribable<SidebarState | null>;
}

/**
 * A GTC PFD setting page general settings list.
 */
export class GtcPfdSettingsPageGeneralList extends DisplayComponent<GtcPfdSettingsPageGeneralListProps> implements GtcPfdSettingsPageTabContent {
  private readonly listRef = FSComponent.createRef<GtcList<any>>();

  private readonly dateTimeSettingManager = DateTimeUserSettings.getManager(this.props.gtcService.bus);
  private readonly comRadioSettingManager = ComRadioUserSettings.getManager(this.props.gtcService.bus);

  private readonly isLocalOffsetEditable = this.dateTimeSettingManager.getSetting('dateTimeFormat').map(format => {
    return format !== DateTimeFormatSettingMode.UTC;
  });
  private readonly localOffset = NumberUnitSubject.create(UnitType.MILLISECOND.createNumber(0));

  private localOffsetPipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.localOffsetPipe = this.dateTimeSettingManager.getSetting('dateTimeLocalOffset').pipe(this.localOffset);
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    return this.listRef.instance.onGtcInteractionEvent(event);
  }

  /** @inheritdoc */
  public onPause(): void {
    // noop
  }

  /** @inheritdoc */
  public onResume(): void {
    // noop
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GtcList
        ref={this.listRef}
        bus={this.props.gtcService.bus}
        itemsPerPage={5}
        listItemHeightPx={this.props.listItemHeight}
        listItemSpacingPx={this.props.listItemSpacing}
        sidebarState={this.props.sidebarState}
        class='pfd-settings-page-tab-list'
      >
        <GtcListItem class='pfd-settings-page-row'>
          <div class='pfd-settings-page-row-left'>
            Time Format
          </div>
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.dateTimeSettingManager.getSetting('dateTimeFormat')}
            renderValue={(value): string => {
              switch (value) {
                case DateTimeFormatSettingMode.Local12:
                  return 'Local 12hr';
                case DateTimeFormatSettingMode.Local24:
                  return 'Local 24hr';
                case DateTimeFormatSettingMode.UTC:
                  return 'UTC';
                default:
                  return '';
              }
            }}
            listParams={{
              title: 'Select Time Format',
              inputData: [
                {
                  value: DateTimeFormatSettingMode.Local12,
                  labelRenderer: () => 'Local 12hr'
                },
                {
                  value: DateTimeFormatSettingMode.Local24,
                  labelRenderer: () => 'Local 24hr'
                },
                {
                  value: DateTimeFormatSettingMode.UTC,
                  labelRenderer: () => 'UTC'
                }
              ],
              selectedValue: this.dateTimeSettingManager.getSetting('dateTimeFormat')
            }}
            isInList
            class='pfd-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='pfd-settings-page-row'>
          <div class='pfd-settings-page-row-left'>
            Time Offset
          </div>
          <div class='pfd-settings-page-row-right pfd-settings-page-local-offset-row'>
            <div class='pfd-settings-page-local-offset-default'>––:––</div>
            <GtcTouchButton
              isVisible={this.isLocalOffsetEditable}
              label={
                <DurationDisplay
                  value={this.localOffset}
                  options={{ format: DurationDisplayFormat.hh_mm, pad: 2, useMinusSign: true, forceSign: true }}
                />
              }
              onPressed={async (): Promise<void> => {
                const setting = this.dateTimeSettingManager.getSetting('dateTimeLocalOffset');

                const result = await this.props.gtcService
                  .openPopup<GtcLocalTimeOffsetDialog>(GtcViewKeys.LocalTimeOffsetDialog, 'normal', 'hide')
                  .ref.request({ initialValue: setting.value });

                if (!result.wasCancelled) {
                  setting.value = result.payload;
                }
              }}
              isInList
              gtcOrientation={this.props.gtcService.orientation}
              class='pfd-settings-page-local-offset-button'
            />
          </div>
        </GtcListItem>
        <GtcListItem class='pfd-settings-page-row'>
          <div class='pfd-settings-page-row-left'>
            <div>COM Channel<br />Spacing</div>
          </div>
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.comRadioSettingManager.getSetting('comRadioSpacing')}
            renderValue={(value): string => {
              switch (value) {
                case ComRadioSpacingSettingMode.Spacing8_33Khz:
                  return '8.33 kHz';
                case ComRadioSpacingSettingMode.Spacing25Khz:
                  return '25.0 kHz';
                default:
                  return '';
              }
            }}
            listParams={{
              title: 'Select COM Spacing',
              inputData: [
                {
                  value: ComRadioSpacingSettingMode.Spacing8_33Khz,
                  labelRenderer: () => '8.33 kHz'
                },
                {
                  value: ComRadioSpacingSettingMode.Spacing25Khz,
                  labelRenderer: () => '25.0 kHz'
                }
              ],
              selectedValue: this.comRadioSettingManager.getSetting('comRadioSpacing')
            }}
            isInList
            class='pfd-settings-page-row-right'
          />
        </GtcListItem>
      </GtcList>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    this.isLocalOffsetEditable.destroy();
    this.localOffsetPipe?.destroy();

    super.destroy();
  }
}