import {
  ComponentProps, DisplayComponent, DurationDisplay, DurationDisplayFormat, FSComponent, NumberFormatter,
  NumberUnitSubject, RunwaySurfaceCategory, Subscribable, Subscription, UnitType, VNode
} from '@microsoft/msfs-sdk';

import {
  ComRadioSpacingSettingMode, ComRadioUserSettings, DateTimeFormatSettingMode, DateTimeUserSettings,
  NearestAirportUserSettings, UnitsDistanceSettingMode, UnitsUserSettings
} from '@microsoft/msfs-garminsdk';

import { EspConfig, EspUserSettings, FlightDirectorFormatSettingMode, HorizonDirectorCueOption, NumberUnitDisplay, PfdUserSettings } from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List/GtcList';
import { GtcListItem } from '../../Components/List/GtcListItem';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcLocalTimeOffsetDialog } from '../../Dialog/GtcLocalTimeOffsetDialog';
import { GtcRunwayLengthDialog } from '../../Dialog/GtcRunwayLengthDialog';
import { GtcInteractionEvent } from '../../GtcService/GtcInteractionEvent';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcAvionicsSettingsPageTabContent } from './GtcAvionicsSettingsPageTabContent';

import './GtcAvionicsSettingsPageSystemList.css';

/**
 * Component props for GtcAvionicsSettingsPageSystemList.
 */
export interface GtcAvionicsSettingsPageSystemListProps extends ComponentProps {
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

  /** An ESP configuration object. If not defined, then the list will not support user configuration of ESP settings. */
  espConfig?: EspConfig;
}

/**
 * A GTC avionics setting page system settings list.
 */
export class GtcAvionicsSettingsPageSystemList extends DisplayComponent<GtcAvionicsSettingsPageSystemListProps> implements GtcAvionicsSettingsPageTabContent {
  private static readonly RUNWAY_SURFACE_TYPE_FILTERS = {
    'Any': ~0,
    'Hard Only': RunwaySurfaceCategory.Hard,
    'Hard/Soft': RunwaySurfaceCategory.Hard + RunwaySurfaceCategory.Soft,
    'Water': RunwaySurfaceCategory.Water
  };

  private readonly listRef = FSComponent.createRef<GtcList<any>>();

  private readonly dateTimeSettingManager = DateTimeUserSettings.getManager(this.props.gtcService.bus);
  private readonly comRadioSettingManager = ComRadioUserSettings.getManager(this.props.gtcService.bus);
  private readonly nearestAirportSettingManager = NearestAirportUserSettings.getManager(this.props.gtcService.bus);
  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.props.gtcService.bus);
  private readonly pfdSettingManager = PfdUserSettings.getAliasedManager(this.props.gtcService.bus, this.props.gtcService.pfdControlIndex);

  private readonly isLocalOffsetEditable = this.dateTimeSettingManager.getSetting('dateTimeFormat').map(format => {
    return format !== DateTimeFormatSettingMode.UTC;
  });
  private readonly localOffset = NumberUnitSubject.create(UnitType.MILLISECOND.createNumber(0));

  private readonly minRunwayLength = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));

  private localOffsetPipe?: Subscription;
  private minRunwayLengthPipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.localOffsetPipe = this.dateTimeSettingManager.getSetting('dateTimeLocalOffset').pipe(this.localOffset);
    this.minRunwayLengthPipe = this.nearestAirportSettingManager.getSetting('nearestAptRunwayLength').pipe(this.minRunwayLength);
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
        itemsPerPage={4}
        listItemHeightPx={this.props.listItemHeight}
        listItemSpacingPx={this.props.listItemSpacing}
        sidebarState={this.props.sidebarState}
        class='avionics-settings-page-tab-list'
      >
        <GtcListItem class='avionics-settings-page-row'>
          <div class='avionics-settings-page-row-left'>
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
            class='avionics-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='avionics-settings-page-row'>
          <div class='avionics-settings-page-row-left'>
            Time Offset
          </div>
          <div class='avionics-settings-page-row-right avionics-settings-page-local-offset-row'>
            <div class='avionics-settings-page-local-offset-default'>––:––</div>
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
              class='avionics-settings-page-local-offset-button'
            />
          </div>
        </GtcListItem>
        <GtcListItem class='avionics-settings-page-row'>
          <div class='avionics-settings-page-row-left'>
            Keyboard Format
          </div>
          <GtcTouchButton
            label='Alphabetical'
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='avionics-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='avionics-settings-page-row'>
          <div class='avionics-settings-page-row-left'>
            <div>Flight Director<br />Active Format</div>
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
                  class='avionics-settings-page-row-right'
                />
              ) : (
                <div class='avionics-settings-page-row-right'>
                  {this.props.horizonDirectorCueOption === 'dual' ? 'Dual Cue' : 'Single Cue'}
                </div>
              )
          }
        </GtcListItem>
        <GtcListItem class='avionics-settings-page-row'>
          <div class='avionics-settings-page-row-left'>
            <div>GPS CDI</div>
            <div></div>
          </div>
          <GtcTouchButton
            label='AUTO'
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='avionics-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='avionics-settings-page-row'>
          <div class='avionics-settings-page-row-left'>
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
            class='avionics-settings-page-row-right'
          />
        </GtcListItem>
        {this.props.espConfig !== undefined && (
          <GtcListItem class='avionics-settings-page-row'>
            <GtcToggleTouchButton
              state={EspUserSettings.getManager(this.props.gtcService.bus).getSetting('espEnabled')}
              label={'Stability &\nProtection'}
              isInList
              gtcOrientation={this.props.gtcService.orientation}
              class='avionics-settings-page-row-left avionics-settings-page-esp-enable-button'
            />
            <div class='avionics-settings-page-row-right' />
          </GtcListItem>
        )}
        <GtcListItem class='avionics-settings-page-row'>
          <div class='avionics-settings-page-row-left'>
            <div>Nearest Airport<br />Runway Surface</div>
          </div>
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.nearestAirportSettingManager.getSetting('nearestAptRunwaySurfaceTypes')}
            renderValue={(value): string => {
              switch (value) {
                case GtcAvionicsSettingsPageSystemList.RUNWAY_SURFACE_TYPE_FILTERS['Any']:
                  return 'Any';
                case GtcAvionicsSettingsPageSystemList.RUNWAY_SURFACE_TYPE_FILTERS['Hard Only']:
                  return 'Hard Only';
                case GtcAvionicsSettingsPageSystemList.RUNWAY_SURFACE_TYPE_FILTERS['Hard/Soft']:
                  return 'Hard/Soft';
                case GtcAvionicsSettingsPageSystemList.RUNWAY_SURFACE_TYPE_FILTERS['Water']:
                  return 'Water';
                default:
                  return '';
              }
            }}
            listParams={{
              title: 'Select Airport Surface Type',
              inputData: [
                {
                  value: GtcAvionicsSettingsPageSystemList.RUNWAY_SURFACE_TYPE_FILTERS['Any'],
                  labelRenderer: () => 'Any'
                },
                {
                  value: GtcAvionicsSettingsPageSystemList.RUNWAY_SURFACE_TYPE_FILTERS['Hard Only'],
                  labelRenderer: () => 'Hard Only'
                },
                {
                  value: GtcAvionicsSettingsPageSystemList.RUNWAY_SURFACE_TYPE_FILTERS['Hard/Soft'],
                  labelRenderer: () => 'Hard/Soft'
                },
                {
                  value: GtcAvionicsSettingsPageSystemList.RUNWAY_SURFACE_TYPE_FILTERS['Water'],
                  labelRenderer: () => 'Water'
                }
              ],
              selectedValue: this.nearestAirportSettingManager.getSetting('nearestAptRunwaySurfaceTypes')
            }}
            isInList
            class='avionics-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='avionics-settings-page-row'>
          <div class='avionics-settings-page-row-left'>
            <div>Nearest Airport<br />Min Rwy Length</div>
          </div>
          <GtcTouchButton
            label={
              <NumberUnitDisplay
                value={this.minRunwayLength}
                displayUnit={this.unitsSettingManager.distanceUnitsSmall}
                formatter={NumberFormatter.create({ precision: 1 })}
              />
            }
            onPressed={async (): Promise<void> => {
              const setting = this.nearestAirportSettingManager.getSetting('nearestAptRunwayLength');

              const unitsMode = this.unitsSettingManager.getSetting('unitsDistance').value === UnitsDistanceSettingMode.Metric ? 'meters' : 'feet';

              const result = await this.props.gtcService
                .openPopup<GtcRunwayLengthDialog>(GtcViewKeys.RunwayLengthDialog, 'normal', 'hide')
                .ref.request({
                  title: 'Minimum Runway Surface',
                  initialValue: setting.value,
                  initialUnit: UnitType.FOOT,
                  unitsMode
                });

              if (!result.wasCancelled) {
                setting.value = result.payload.unit.convertTo(result.payload.value, UnitType.FOOT);
              }
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='avionics-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='avionics-settings-page-row'>
          <div class='avionics-settings-page-row-left'>
            <div>Show Airport<br />Chart on Landing</div>
          </div>
          <GtcTouchButton
            label='Off'
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='avionics-settings-page-row-right'
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

    this.minRunwayLengthPipe?.destroy();

    super.destroy();
  }
}
