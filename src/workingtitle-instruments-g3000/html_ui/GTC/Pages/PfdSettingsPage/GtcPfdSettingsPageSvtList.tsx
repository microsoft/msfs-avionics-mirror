import { ComponentProps, DisplayComponent, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { PfdUserSettings } from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List/GtcList';
import { GtcListItem } from '../../Components/List/GtcListItem';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcInteractionEvent } from '../../GtcService/GtcInteractionEvent';
import { GtcService } from '../../GtcService/GtcService';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcPfdSettingsPageTabContent } from './GtcPfdSettingsPageTabContent';

/**
 * Component props for GtcPfdSettingsPageSvtList.
 */
export interface GtcPfdSettingsPageSvtListProps extends ComponentProps {
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
 * A GTC PFD setting page SVT settings list.
 */
export class GtcPfdSettingsPageSvtList extends DisplayComponent<GtcPfdSettingsPageSvtListProps> implements GtcPfdSettingsPageTabContent {
  private readonly listRef = FSComponent.createRef<GtcList<any>>();

  private readonly pfdSettingManager = PfdUserSettings.getAliasedManager(this.props.gtcService.bus, this.props.gtcService.pfdControlIndex);

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
          <GtcToggleTouchButton
            state={this.pfdSettingManager.getSetting('svtEnabled')}
            label='SVT Terrain'
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='pfd-settings-page-row-left'
          />
        </GtcListItem>
        <GtcListItem class='pfd-settings-page-row'>
          <GtcToggleTouchButton
            state={this.pfdSettingManager.getSetting('svtPathwaysShow')}
            label='SVT Pathways'
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='pfd-settings-page-row-left'
          />
        </GtcListItem>
        <GtcListItem class='pfd-settings-page-row'>
          <GtcToggleTouchButton
            state={this.pfdSettingManager.getSetting('svtAirportSignShow')}
            label='SVT Airport Signs'
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='pfd-settings-page-row-left'
          />
        </GtcListItem>
        <GtcListItem class='pfd-settings-page-row'>
          <GtcToggleTouchButton
            state={this.pfdSettingManager.getSetting('svtTrafficShow')}
            label='SVT Traffic'
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='pfd-settings-page-row-left'
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