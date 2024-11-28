import {
  EventBus, FSComponent, GeoPoint, GeoPointInterface, GeoPointSubject, GNSSEvents, LatLonDisplay, NumberFormatter, Subject, Subscribable, VNode, Waypoint
} from '@microsoft/msfs-sdk';
import { WaypointComponentProps, WaypointComponent } from '@microsoft/msfs-garminsdk';

import { BearingDisplay } from '../../../../Shared/UI/Common/BearingDisplay';
import { NumberUnitDisplay } from '../../../../Shared/UI/Common/NumberUnitDisplay';
import { List } from '../../../../Shared/UI/List';
import { ScrollBar } from '../../../../Shared/UI/ScrollBar';
import { UiViewProps } from '../../../../Shared/UI/UiView';
import { WaypointInfoStore } from '@microsoft/msfs-garminsdk';
import { WptDupDialog } from '../../../../Shared/UI/WptDup/WptDupDialog';
import { UnitsUserSettingManager, UnitsUserSettings } from '../../../../Shared/Units/UnitsUserSettings';
import { GroupBox } from '../GroupBox';

import './MFDWptDupDialog.css';

/**
 * Component props for MFDWaypointDuplicateDialog.
 */
export interface MFDWptDupDialogProps extends UiViewProps {
  /** The event bus. */
  bus: EventBus;
}

/**
 * A dialog for selecting from a list of duplicate waypoints.
 */
export class MFDWptDupDialog extends WptDupDialog<MFDWptDupDialogProps> {
  private static readonly tempGeoPoint = new GeoPoint(0, 0);

  private readonly selectedWaypointSub = Subject.create<Waypoint | null>(null);
  private readonly planePos = GeoPointSubject.createFromGeoPoint(new GeoPoint(NaN, NaN));

  protected readonly unitSettingManager = UnitsUserSettings.getManager(this.props.bus);

  private readonly planePosSub = this.props.bus.getSubscriber<GNSSEvents>().on('gps-position').handle(this.onPlanePosChanged.bind(this), true);

  /** @inheritdoc */
  protected onViewOpened(): void {
    this.planePosSub.resume(true);
  }

  /** @inheritdoc */
  protected onViewClosed(): void {
    this.planePosSub.pause();
  }

  /**
   * A callback which is called when the plane's current position changes.
   * @param pos The new position.
   */
  private onPlanePosChanged(pos: LatLongAlt): void {
    this.planePos.set(MFDWptDupDialog.tempGeoPoint.set(pos.lat, pos.long));
  }

  /**
   * A callback which is called when the selected waypoint changes.
   * @param waypoint The new selected waypoint.
   */
  private onWaypointSelected(waypoint: Waypoint | null): void {
    this.selectedWaypointSub.set(waypoint);
  }

  /** @inheritdoc */
  public render(): VNode {
    const listContainerRef = FSComponent.createRef<HTMLDivElement>();
    return (
      <div class='popout-dialog mfd-wpt-dup' ref={this.viewContainerRef}>
        <h1>{this.props.title}</h1>
        <GroupBox title={'Waypoint'}>
          <div class='mfd-wpt-dup-ident'>{this.ident}</div>
        </GroupBox>
        <GroupBox title={'Duplicates'} class='mfd-wpt-dup-list-box'>
          <div class='mfd-wpt-dup-list-wrapper'>
            <div class='mfd-wpt-dup-list-container' ref={listContainerRef}>
              <List ref={this.listRef} onRegister={this.register}
                data={this.waypoints} renderItem={this.renderListItem.bind(this, 'mfd-wpt-dup-listitem')}
                onItemSelected={this.onWaypointSelected.bind(this)}
                scrollContainer={listContainerRef} class='mfd-wpt-dup-list' />
            </div>
            <ScrollBar />
          </div>
        </GroupBox>
        <GroupBox title={'Information'} class='mfd-wpt-dup-info-box'>
          <MFDWptDupInfo waypoint={this.selectedWaypointSub} planePos={this.planePos} unitsSettingManager={this.unitSettingManager} />
        </GroupBox>
        <div class='mfd-wpt-dup-prompt'>Press "ENT" to select duplicate or "CLR" to cancel</div>
      </div>
    );
  }
}

/**
 * Component props for MFDWaypointDuplicateInfo.
 */
interface MFDWptDupInfoProps extends WaypointComponentProps {
  /** A subject which provides the airplane's current position. */
  planePos: Subscribable<GeoPointInterface>;

  /** A display units user setting manager. */
  unitsSettingManager: UnitsUserSettingManager;
}

/**
 * Displays waypoint information in the MFD duplicate waypoints dialog.
 */
class MFDWptDupInfo extends WaypointComponent<MFDWptDupInfoProps> {
  private readonly store = new WaypointInfoStore(this.props.waypoint, this.props.planePos);

  private readonly cityText = this.store.city.map(city => city ?? '__________');
  private readonly nameText = this.store.name.map(name => name ?? '__________');

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='mfd-wpt-dup-info'>
        <div class='mfd-wpt-dup-info-city'>{this.cityText}</div>
        <div class='mfd-wpt-dup-info-name'>{this.nameText}</div>
        <LatLonDisplay location={this.store.location} class='mfd-wpt-dup-info-latlon' />
        <BearingDisplay value={this.store.bearing} displayUnit={this.props.unitsSettingManager.navAngleUnits}
          formatter={NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' })}
          class='mfd-wpt-dup-info-bearing' />
        <NumberUnitDisplay value={this.store.distance} displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
          formatter={NumberFormatter.create({ precision: 0.1, maxDigits: 3, forceDecimalZeroes: true, nanString: '___' })}
          class='mfd-wpt-dup-info-distance' />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.store.destroy();

    super.destroy();
  }
}