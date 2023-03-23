import {
  ComponentProps, DisplayComponent, DurationDisplay, DurationDisplayFormat, FSComponent, MappedSubject, NumberUnitSubject, Subscribable, Subscription, UnitType,
  VNode
} from '@microsoft/msfs-sdk';

import { ComRadioSpacingSettingMode, ComRadioUserSettings, DateTimeFormatSettingMode, DateTimeUserSettings } from '@microsoft/msfs-garminsdk';
import { AoaIndicatorDisplaySettingMode, HorizonDirectorCueOption, PfdUserSettings, WindDisplaySettingMode } from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List/GtcList';
import { GtcListItem } from '../../Components/List/GtcListItem';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcLocalTimeOffsetDialog } from '../../Dialog/GtcLocalTimeOffsetDialog';
import { GtcInteractionEvent, GtcInteractionHandler } from '../../GtcService/GtcInteractionEvent';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { SidebarState } from '../../GtcService/Sidebar';

import './GtcPfdSettingsPageMasterList.css';

/**
 * Component props for GtcPfdSettingsPageMasterList.
 */
export interface GtcPfdSettingsPageMasterListProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** PFD horizon display flight director cue style support. */
  horizonDirectorCueOption: HorizonDirectorCueOption;

  /** The height of each list item, in pixels. */
  listItemHeight: number;

  /** The spacing between each list item, in pixels. */
  listItemSpacing: number;

  /** The SidebarState to use. */
  sidebarState?: SidebarState | Subscribable<SidebarState | null>;
}

/**
 * A GTC PFD setting page master settings list.
 */
export class GtcPfdSettingsPageMasterList extends DisplayComponent<GtcPfdSettingsPageMasterListProps> implements GtcInteractionHandler {
  private readonly listRef = FSComponent.createRef<GtcList<any>>();

  private readonly pfdSettingManager = PfdUserSettings.getAliasedManager(this.props.gtcService.bus, this.props.gtcService.pfdControlIndex);
  private readonly dateTimeSettingManager = DateTimeUserSettings.getManager(this.props.gtcService.bus);
  private readonly comRadioSettingManager = ComRadioUserSettings.getManager(this.props.gtcService.bus);

  private readonly headingLabelShowSetting = this.pfdSettingManager.getSetting('svtHeadingLabelShow');

  private readonly horizonHeadingButtonState = MappedSubject.create(
    ([svtEnabled, headingLabelShow]): boolean => {
      return svtEnabled && headingLabelShow;
    },
    this.pfdSettingManager.getSetting('svtEnabled'),
    this.headingLabelShowSetting
  );

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
  public render(): VNode {
    return (
      <GtcList
        ref={this.listRef}
        bus={this.props.gtcService.bus}
        itemsPerPage={4}
        listItemHeightPx={this.props.listItemHeight}
        listItemSpacingPx={this.props.listItemSpacing}
        sidebarState={this.props.sidebarState}
        class='pfd-settings-page-master-list'
      >
        <GtcListItem paddedListItem class='pfd-settings-page-row'>
          <div class='pfd-settings-page-row-left'>
            PFD Mode
          </div>
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.props.gtcService.displayPaneVisibleSettings[this.props.gtcService.pfdPaneIndex]}
            renderValue={(isPaneVisible): string => {
              return isPaneVisible ? 'Split' : 'Full';
            }}
            listParams={{
              title: 'PFD Mode',
              inputData: [
                {
                  value: false,
                  labelRenderer: () => 'Full'
                },
                {
                  value: true,
                  labelRenderer: () => 'Split'
                }
              ],
              selectedValue: this.props.gtcService.displayPaneVisibleSettings[this.props.gtcService.pfdPaneIndex]
            }}
            isInList
            class='pfd-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem paddedListItem class='pfd-settings-page-row'>
          <div class='pfd-settings-page-row-left'>
            AoA
          </div>
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.pfdSettingManager.getSetting('aoaDisplayMode')}
            renderValue={(value): string => {
              switch (value) {
                case AoaIndicatorDisplaySettingMode.On:
                  return 'On';
                case AoaIndicatorDisplaySettingMode.Off:
                  return 'Off';
                case AoaIndicatorDisplaySettingMode.Auto:
                  return 'Auto';
                default:
                  return '';
              }
            }}
            listParams={{
              title: 'AoA',
              inputData: [
                {
                  value: AoaIndicatorDisplaySettingMode.On,
                  labelRenderer: () => 'On'
                },
                {
                  value: AoaIndicatorDisplaySettingMode.Off,
                  labelRenderer: () => 'Off'
                },
                {
                  value: AoaIndicatorDisplaySettingMode.Auto,
                  labelRenderer: () => 'Auto'
                }
              ],
              selectedValue: this.pfdSettingManager.getSetting('aoaDisplayMode')
            }}
            isInList
            class='pfd-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem paddedListItem class='pfd-settings-page-row'>
          <div class='pfd-settings-page-row-left'>
            <div>Flight<br />Director<br />Active<br />Format</div>
          </div>
          <div class='pfd-settings-page-row-right'>
            Single Cue
          </div>
        </GtcListItem>
        <GtcListItem paddedListItem class='pfd-settings-page-row'>
          <div class='pfd-settings-page-row-left'>
            <div>SVT<br />Terrain</div>
          </div>
          <GtcToggleTouchButton
            state={this.pfdSettingManager.getSetting('svtEnabled')}
            label='Enable'
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='pfd-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem paddedListItem class='pfd-settings-page-row'>
          <div class='pfd-settings-page-row-left'>
            <div>SVT<br />Pathways</div>
          </div>
          <GtcToggleTouchButton
            state={this.pfdSettingManager.getSetting('svtPathwaysShow')}
            label='Enable'
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='pfd-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem paddedListItem class='pfd-settings-page-row'>
          <div class='pfd-settings-page-row-left'>
            <div>Horizon<br />Heading</div>
          </div>
          <GtcToggleTouchButton
            state={this.horizonHeadingButtonState}
            label='Enable'
            isEnabled={this.pfdSettingManager.getSetting('svtEnabled')}
            onPressed={(): void => {
              this.headingLabelShowSetting.value = !this.headingLabelShowSetting.value;
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='pfd-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem paddedListItem class='pfd-settings-page-row'>
          <div class='pfd-settings-page-row-left'>
            <div>SVT<br />Airport<br />Signs</div>
          </div>
          <GtcToggleTouchButton
            state={this.pfdSettingManager.getSetting('svtAirportSignShow')}
            label='Enable'
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='pfd-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem paddedListItem class='pfd-settings-page-row'>
          <div class='pfd-settings-page-row-left'>
            Wind
          </div>
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.pfdSettingManager.getSetting('windDisplayMode')}
            renderValue={(value): string => {
              switch (value) {
                case WindDisplaySettingMode.Option1:
                  return 'Option 1';
                case WindDisplaySettingMode.Option2:
                  return 'Option 2';
                case WindDisplaySettingMode.Option3:
                  return 'Option 3';
                case WindDisplaySettingMode.Off:
                  return 'Off';
                default:
                  return '';
              }
            }}
            listParams={{
              title: 'Wind',
              inputData: [
                {
                  value: WindDisplaySettingMode.Option1,
                  labelRenderer: () => 'Option 1'
                },
                {
                  value: WindDisplaySettingMode.Option2,
                  labelRenderer: () => 'Option 2'
                },
                {
                  value: WindDisplaySettingMode.Option3,
                  labelRenderer: () => 'Option 3'
                },
                {
                  value: WindDisplaySettingMode.Off,
                  labelRenderer: () => 'Off'
                }
              ],
              selectedValue: this.pfdSettingManager.getSetting('windDisplayMode')
            }}
            isInList
            class='pfd-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem paddedListItem class='pfd-settings-page-row'>
          <div class='pfd-settings-page-row-left'>
            <div>Time<br />Format</div>
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
        <GtcListItem paddedListItem class='pfd-settings-page-row'>
          <div class='pfd-settings-page-row-left'>
            <div>Time<br />Offset</div>
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
        <GtcListItem paddedListItem class='pfd-settings-page-row'>
          <div class='pfd-settings-page-row-left'>
            <div>COM<br />Channel<br />Spacing</div>
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
        <GtcListItem paddedListItem class='pfd-settings-page-row'>
          <div class='pfd-settings-page-row-left'>
            <div>Baro<br />Select<br />Units</div>
          </div>
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.pfdSettingManager.getSetting('altimeterBaroMetric')}
            renderValue={(isMetric): VNode => {
              return isMetric
                ? <div>Hectopascals (<span class='pfd-settings-page-small-text'>HPA</span>)</div>
                : <div>Inches (<span class='pfd-settings-page-small-text'>IN</span>)</div>;
            }}
            listParams={{
              title: 'Baro Select Units',
              inputData: [
                {
                  value: false,
                  labelRenderer: () => <div>Inches (<span class='pfd-settings-page-small-text'>IN</span>)</div>
                },
                {
                  value: true,
                  labelRenderer: () => <div>Hectopascals (<span class='pfd-settings-page-small-text'>HPA</span>)</div>
                }
              ],
              selectedValue: this.pfdSettingManager.getSetting('altimeterBaroMetric')
            }}
            isInList
            class='pfd-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem paddedListItem class='pfd-settings-page-row'>
          <div class='pfd-settings-page-row-left'>
            <div>Meters<br />Overlay</div>
          </div>
          <GtcToggleTouchButton
            state={this.pfdSettingManager.getSetting('altMetric')}
            label='Enable'
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='pfd-settings-page-row-right'
          />
        </GtcListItem>
      </GtcList>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    this.horizonHeadingButtonState.destroy();
    this.isLocalOffsetEditable.destroy();

    this.localOffsetPipe?.destroy();

    super.destroy();
  }
}