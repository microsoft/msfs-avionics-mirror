import { ComponentProps, DisplayComponent, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { NavDataFieldType } from '@microsoft/msfs-garminsdk';
import { MfdNavDataBarUserSettings } from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List/GtcList';
import { GtcListItem } from '../../Components/List/GtcListItem';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcInteractionEvent } from '../../GtcService/GtcInteractionEvent';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcAvionicsSettingsPageTabContent } from './GtcAvionicsSettingsPageTabContent';

import './GtcAvionicsSettingsPageMfdFieldsList.css';

/**
 * Component props for GtcAvionicsSettingsPageMfdFieldsList.
 */
export interface GtcAvionicsSettingsPageMfdFieldsListProps extends ComponentProps {
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
 * A GTC avionics setting page MFD fields settings list.
 */
export class GtcAvionicsSettingsPageMfdFieldsList extends DisplayComponent<GtcAvionicsSettingsPageMfdFieldsListProps> implements GtcAvionicsSettingsPageTabContent {
  private static readonly LONG_NAMES: Record<NavDataFieldType, string> = {
    [NavDataFieldType.BearingToWaypoint]: 'Bearing',
    [NavDataFieldType.Destination]: 'Destination Airport',
    [NavDataFieldType.DistanceToWaypoint]: 'Distance',
    [NavDataFieldType.DistanceToDestination]: 'Distance to Destination',
    [NavDataFieldType.DesiredTrack]: 'Desired Track',
    [NavDataFieldType.Endurance]: 'Endurance',
    [NavDataFieldType.TimeToDestination]: 'ETE to Final Destination',
    [NavDataFieldType.TimeOfWaypointArrival]: 'Estimated Time of Arrival',
    [NavDataFieldType.TimeToWaypoint]: 'Estimated Time Enroute',
    [NavDataFieldType.FuelOnBoard]: 'Fuel On Board',
    [NavDataFieldType.FuelOverDestination]: 'Fuel Over Destination',
    [NavDataFieldType.GroundSpeed]: 'Ground Speed',
    [NavDataFieldType.ISA]: 'International Standard Atmosphere',
    [NavDataFieldType.TimeOfDestinationArrival]: 'ETA at Final Destination',
    [NavDataFieldType.TrueAirspeed]: 'True Airspeed',
    [NavDataFieldType.TrackAngleError]: 'Track Angle Error',
    [NavDataFieldType.GroundTrack]: 'Track',
    [NavDataFieldType.VerticalSpeedRequired]: 'Vertical Speed Required',
    [NavDataFieldType.CrossTrack]: 'Cross-Track Error',
    [NavDataFieldType.Waypoint]: 'Active Waypoint'
  };

  private static readonly SELECTION_DEFS = Object.keys(GtcAvionicsSettingsPageMfdFieldsList.LONG_NAMES)
    .filter(fieldType => fieldType !== NavDataFieldType.Waypoint)
    .map(fieldType => {
      return {
        value: fieldType as NavDataFieldType,
        labelRenderer: (): VNode => GtcAvionicsSettingsPageMfdFieldsList.renderFieldType(fieldType as NavDataFieldType)
      };
    });

  private readonly listRef = FSComponent.createRef<GtcList<any>>();

  private readonly navDataBarSettingManager = MfdNavDataBarUserSettings.getManager(this.props.gtcService.bus);

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
        class='avionics-settings-page-tab-list avionics-settings-page-mfd-fields-list'
      >
        {
          Array.from({ length: 8 }, (v, index): VNode => {
            return (
              <GtcListItem class='avionics-settings-page-row'>
                <div class='avionics-settings-page-row-left'>
                  <div>
                    MFD<br />Data Bar<br />Field {`${index + 1}`}
                  </div>
                </div>
                <GtcListSelectTouchButton
                  gtcService={this.props.gtcService}
                  listDialogKey={GtcViewKeys.ListDialog1}
                  state={this.navDataBarSettingManager.getSetting(`navDataBarField${index}`)}
                  renderValue={GtcAvionicsSettingsPageMfdFieldsList.renderFieldType}
                  listParams={{
                    title: 'Select MFD Data Bar Field',
                    inputData: GtcAvionicsSettingsPageMfdFieldsList.SELECTION_DEFS,
                    selectedValue: this.navDataBarSettingManager.getSetting(`navDataBarField${index}`)
                  }}
                  isInList
                  class='avionics-settings-page-row-right'
                />
              </GtcListItem>
            );
          })
        }
      </GtcList>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    super.destroy();
  }

  /**
   * Renders a nav data field type.
   * @param value A nav data field type.
   * @returns A rendered nav data field type, as a VNode.
   */
  private static renderFieldType(value: NavDataFieldType): VNode {
    const longName = GtcAvionicsSettingsPageMfdFieldsList.LONG_NAMES[value] ?? '';

    return (
      <div>
        <div>{value}</div>
        <div class='avionics-settings-page-mfd-fields-small-text'>{longName}</div>
      </div>
    );
  }
}