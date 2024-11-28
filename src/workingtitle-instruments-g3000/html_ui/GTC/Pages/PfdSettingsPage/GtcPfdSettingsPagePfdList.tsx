import { ComponentProps, DisplayComponent, FSComponent, MappedSubject, Subscribable, SubscribableMapFunctions, VNode } from '@microsoft/msfs-sdk';

import { AoaIndicatorDisplaySettingMode, FlightDirectorFormatSettingMode, HorizonDirectorCueOption, PfdUserSettings, WindDisplaySettingMode } from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List/GtcList';
import { GtcListItem } from '../../Components/List/GtcListItem';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcInteractionEvent } from '../../GtcService/GtcInteractionEvent';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcPfdSettingsPageTabContent } from './GtcPfdSettingsPageTabContent';

/**
 * Component props for GtcPfdSettingsPagePfdList.
 */
export interface GtcPfdSettingsPagePfdListProps extends ComponentProps {
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
 * A GTC PFD setting page PFD settings list.
 */
export class GtcPfdSettingsPagePfdList extends DisplayComponent<GtcPfdSettingsPagePfdListProps> implements GtcPfdSettingsPageTabContent {
  private readonly listRef = FSComponent.createRef<GtcList<any>>();

  private readonly pfdSettingManager = PfdUserSettings.getAliasedManager(this.props.gtcService.bus, this.props.gtcService.pfdControlIndex);

  private readonly isSvtDisabled = this.pfdSettingManager.getSetting('svtEnabled').map(SubscribableMapFunctions.not());
  private readonly svtDisabledFpmShowSetting = this.pfdSettingManager.getSetting('svtDisabledFpmShow');
  private readonly fpmButtonState = MappedSubject.create(
    ([svtEnabled, svtDisabledFpmShow]): boolean => {
      return svtEnabled || svtDisabledFpmShow;
    },
    this.pfdSettingManager.getSetting('svtEnabled'),
    this.svtDisabledFpmShowSetting
  );

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
            Flight Director
          </div>
          {
            this.props.horizonDirectorCueOption === 'both'
              ? (
                <GtcListSelectTouchButton
                  gtcService={this.props.gtcService}
                  listDialogKey={GtcViewKeys.ListDialog1}
                  state={this.pfdSettingManager.getSetting('flightDirectorFormat')}
                  renderValue={(value): string => value === FlightDirectorFormatSettingMode.Dual ? 'Dual Cue' : 'Single Cue'}
                  listParams={{
                    title: 'Flight Director Active Format',
                    inputData: [
                      {
                        value: FlightDirectorFormatSettingMode.Single,
                        labelRenderer: () => 'Single Cue'
                      },
                      {
                        value: FlightDirectorFormatSettingMode.Dual,
                        labelRenderer: () => 'Dual Cue'
                      }
                    ],
                    selectedValue: this.pfdSettingManager.getSetting('flightDirectorFormat')
                  }}
                  isInList
                  class='pfd-settings-page-row-right'
                />
              ) : (
                <div class='pfd-settings-page-row-right'>
                  {this.props.horizonDirectorCueOption === 'dual' ? 'Dual Cue' : 'Single Cue'}
                </div>
              )
          }
        </GtcListItem>
        <GtcListItem class='pfd-settings-page-row'>
          <GtcToggleTouchButton
            state={this.fpmButtonState}
            label='Flight Path Marker'
            onPressed={(): void => {
              this.svtDisabledFpmShowSetting.value = !this.svtDisabledFpmShowSetting.value;
            }}
            isEnabled={this.isSvtDisabled}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='pfd-settings-page-row-left'
          />
        </GtcListItem>
        <GtcListItem class='pfd-settings-page-row'>
          <GtcToggleTouchButton
            state={this.pfdSettingManager.getSetting('svtHeadingLabelShow')}
            label='Horizon Heading'
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='pfd-settings-page-row-left'
          />
        </GtcListItem>
        <GtcListItem class='pfd-settings-page-row'>
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
        <GtcListItem class='pfd-settings-page-row'>
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
        <GtcListItem class='pfd-settings-page-row'>
          <div class='pfd-settings-page-row-left'>
            <div>Baro Select<br />Units</div>
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
        <GtcListItem class='pfd-settings-page-row'>
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

    this.isSvtDisabled.destroy();
    this.fpmButtonState.destroy();

    super.destroy();
  }
}