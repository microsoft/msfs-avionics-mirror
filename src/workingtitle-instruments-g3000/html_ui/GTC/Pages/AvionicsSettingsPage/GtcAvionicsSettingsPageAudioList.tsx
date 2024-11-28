import {
  ComponentProps, DisplayComponent, FSComponent, NumberFormatter, Subscribable, VNode
} from '@microsoft/msfs-sdk';

import { AuralAlertUserSettings, AuralAlertVoiceSetting } from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List/GtcList';
import { GtcListItem } from '../../Components/List/GtcListItem';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcInteractionEvent } from '../../GtcService/GtcInteractionEvent';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcAvionicsSettingsPageTabContent } from './GtcAvionicsSettingsPageTabContent';

/**
 * Component props for GtcAvionicsSettingsPageAudioList.
 */
export interface GtcAvionicsSettingsPageAudioListProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** The height of each list item, in pixels. */
  listItemHeight: number;

  /** The spacing between each list item, in pixels. */
  listItemSpacing: number;

  /** The SidebarState to use. */
  sidebarState?: SidebarState | Subscribable<SidebarState | null>;

  /** The supported voice types for aural alerts. */
  supportedAuralAlertVoices: 'male' | 'female' | 'both';
}

/**
 * A GTC avionics settings page audio settings list.
 */
export class GtcAvionicsSettingsPageAudioList extends DisplayComponent<GtcAvionicsSettingsPageAudioListProps> implements GtcAvionicsSettingsPageTabContent {
  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, nanString: '__._' });
  private static readonly ALTITUDE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '____' });

  private readonly listRef = FSComponent.createRef<GtcList<any>>();

  private readonly auralAlertsSettingManager = AuralAlertUserSettings.getManager(this.props.gtcService.bus);

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
            Audio Alert Voice
          </div>
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.auralAlertsSettingManager.getSetting('auralAlertVoice')}
            renderValue={(value): string => {
              switch (value) {
                case AuralAlertVoiceSetting.Male:
                  return 'Male';
                case AuralAlertVoiceSetting.Female:
                  return 'Female';
                default:
                  return '';
              }
            }}
            listParams={{
              title: 'Select Alert Voice',
              inputData: [
                {
                  value: AuralAlertVoiceSetting.Male,
                  labelRenderer: () => 'Male'
                },
                {
                  value: AuralAlertVoiceSetting.Female,
                  labelRenderer: () => 'Female'
                }
              ],
              selectedValue: this.auralAlertsSettingManager.getSetting('auralAlertVoice')
            }}
            isEnabled={this.props.supportedAuralAlertVoices === 'both'}
            isInList
            class='avionics-settings-page-row-right'
          />
        </GtcListItem>
      </GtcList>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    super.destroy();
  }
}