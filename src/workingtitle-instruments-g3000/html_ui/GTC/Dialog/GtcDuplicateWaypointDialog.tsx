import {
  ArraySubject, Facility, FacilityWaypoint, FSComponent, GeoPoint, GeoPointSubject, MappedSubject, NumberFormatter, SetSubject, Subject,
  SubscribableUtils, Subscription, VNode,
} from '@microsoft/msfs-sdk';

import { GarminFacilityWaypointCache, UnitsUserSettings, WaypointInfoStore } from '@microsoft/msfs-garminsdk';
import { BearingDisplay, DynamicListData, NumberUnitDisplay } from '@microsoft/msfs-wtg3000-common';

import { GtcBearingArrow } from '../Components/BearingArrow/GtcBearingArrow';
import { GtcListItem } from '../Components/List';
import { GtcList } from '../Components/List/GtcList';
import { GtcWaypointButton } from '../Components/TouchButton/GtcWaypointButton';
import { GtcDialogResult, GtcDialogView } from './GtcDialogView';
import { GtcView, GtcViewProps } from '../GtcService/GtcView';
import { GtcPositionHeadingDataProvider } from '../Navigation/GtcPositionHeadingDataProvider';

import './GtcDuplicateWaypointDialog.css';

/**
 * Component props for GtcDuplicateWaypointDialog.
 */
export interface GtcDuplicateWaypointDialogProps extends GtcViewProps {
  /** A provider of airplane position and heading data. */
  posHeadingDataProvider: GtcPositionHeadingDataProvider;
}

/**
 * A request input for {@link GtcDuplicateWaypointDialog}.
 */
export type GtcDuplicateWaypointDialogInput<T extends Facility = Facility> = {
  /** The ident of the duplicate facilities. */
  ident: string;

  /** The duplicate facilities. */
  duplicates: readonly T[];
};

/**
 * An entry for a duplicate waypoint.
 */
type GtcDuplicateWaypointDialogEntry = DynamicListData & {
  /** An info store for this entry's waypoint. */
  store: WaypointInfoStore;
};

/**
 * A GTC duplicate waypoint dialog.
 */
export class GtcDuplicateWaypointDialog extends GtcView<GtcDuplicateWaypointDialogProps>
  implements GtcDialogView<GtcDuplicateWaypointDialogInput, Facility> {

  private static readonly BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '__._' });

  private static readonly ENTRY_SORT = (a: GtcDuplicateWaypointDialogEntry, b: GtcDuplicateWaypointDialogEntry): number => {
    const diff = a.store.distance.get().number - b.store.distance.get().number;

    return isNaN(diff) ? 0 : diff;
  };

  private readonly listRef = FSComponent.createRef<GtcList<GtcDuplicateWaypointDialogEntry>>();

  private readonly rootCssClass = SetSubject.create(['wpt-dup-dialog']);

  private readonly listItemHeight = this.props.gtcService.isHorizontal ? 145 : 80;
  private readonly listItemSpacing = this.props.gtcService.isHorizontal ? 10 : 5;

  private readonly facWaypointCache = GarminFacilityWaypointCache.getCache(this.bus);

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.bus);

  private readonly ppos = GeoPointSubject.create(new GeoPoint(NaN, NaN));
  private readonly planeHeading = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);

  private readonly duplicateEntries = ArraySubject.create<GtcDuplicateWaypointDialogEntry>();

  private readonly identText = Subject.create('');

  private resolveFunction?: (value: GtcDialogResult<any>) => void;
  private resultObject: GtcDialogResult<Facility> = {
    wasCancelled: true,
  };

  private isAlive = true;

  private pposPipe?: Subscription;
  private headingPipe?: Subscription;
  private isGpsDrSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this._title.set('Waypoint Duplicates');

    this._activeComponent.set(this.listRef.instance);

    this.pposPipe = this.props.posHeadingDataProvider.pposWithFailure.pipe(this.ppos, true);
    this.headingPipe = this.props.posHeadingDataProvider.headingTrueWithFailure.pipe(this.planeHeading, true);

    this.isGpsDrSub = this.props.posHeadingDataProvider.isGpsDeadReckoning.sub(isDr => {
      this.rootCssClass.toggle('dead-reckoning', isDr);
    }, true);
  }

  /** @inheritDoc */
  public onClose(): void {
    this.cleanupRequest();
  }

  /** @inheritdoc */
  public onResume(): void {
    this.pposPipe?.resume(true);
    this.headingPipe?.resume(true);
  }

  /** @inheritdoc */
  public onPause(): void {
    this.pposPipe?.pause();
    this.headingPipe?.pause();
  }

  /** @inheritdoc */
  public request<T extends Facility>(input: GtcDuplicateWaypointDialogInput<T>): Promise<GtcDialogResult<T>> {
    if (!this.isAlive) {
      throw new Error('GtcDuplicateWaypointDialog: cannot request from a dead dialog');
    }

    return new Promise(resolve => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.identText.set(input.ident);

      this.duplicateEntries.set(
        input.duplicates.map(facility => {
          return {
            store: new WaypointInfoStore(this.facWaypointCache.get(facility), this.ppos)
          };
        }).sort(GtcDuplicateWaypointDialog.ENTRY_SORT)
      );
    });
  }

  /**
   * Clears this dialog's pending request and fulfills the pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * Renders a list item for a duplicate waypoint entry.
   * @param entry A duplicate waypoint entry.
   * @returns A list item for the specified duplicate waypoint entry, as a VNode.
   */
  private renderEntry(entry: GtcDuplicateWaypointDialogEntry): VNode {
    const waypoint = entry.store.waypoint.get() as FacilityWaypoint;
    const relativeBearing = MappedSubject.create(
      ([bearing, planeHeading]) => bearing.number - planeHeading,
      SubscribableUtils.NUMERIC_NAN_EQUALITY,
      entry.store.bearing,
      this.planeHeading
    );

    const city = entry.store.city.get();
    const region = entry.store.region.get();

    const cityRegionText = city === undefined && region === undefined
      ? ' '
      : `${city ?? ''}${region !== undefined && region !== city ? `${city === undefined ? '' : ', '}${region}` : ''}`;

    return (
      <GtcListItem
        paddedListItem
        onDestroy={() => {
          entry.store.destroy();
          relativeBearing.destroy();
        }}
        class='wpt-dup-dialog-row'
      >
        <GtcWaypointButton
          waypoint={waypoint}
          onPressed={() => {
            this.resultObject = {
              wasCancelled: false,
              payload: waypoint.facility.get()
            };
            this.props.gtcService.goBack();
          }}
          isInList
          gtcOrientation={this.props.gtcService.orientation}
          class='wpt-dup-dialog-button'
        >
          <div class='wpt-dup-dialog-button-city-region'>
            {cityRegionText}
          </div>
        </GtcWaypointButton>
        <div class='wpt-dup-dialog-bearing'>
          <GtcBearingArrow
            relativeBearing={relativeBearing}
          />
          <BearingDisplay
            value={entry.store.bearing}
            displayUnit={this.unitsSettingManager.navAngleUnits}
            formatter={GtcDuplicateWaypointDialog.BEARING_FORMATTER}
            class='wpt-dup-dialog-pos-value'
          />
        </div>
        <div class='wpt-dup-dialog-row-separator' />
        <NumberUnitDisplay
          value={entry.store.distance}
          displayUnit={this.unitsSettingManager.distanceUnitsLarge}
          formatter={GtcDuplicateWaypointDialog.DISTANCE_FORMATTER}
          class='wpt-dup-dialog-pos-value'
        />
      </GtcListItem>
    );
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <div class='wpt-dup-dialog-label'>Search Results for "{this.identText}"</div>
        <div class='wpt-dup-dialog-header'>
          <div>Bearing</div>
          <div>Distance</div>
        </div>
        <div class='wpt-dup-dialog-list-container'>
          <GtcList
            ref={this.listRef}
            bus={this.bus}
            data={this.duplicateEntries}
            renderItem={this.renderEntry.bind(this)}
            sidebarState={this._sidebarState}
            listItemHeightPx={this.listItemHeight}
            listItemSpacingPx={this.listItemSpacing}
            itemsPerPage={4}
            class='wpt-dup-dialog-list'
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    this.cleanupRequest();

    this.listRef.getOrDefault()?.destroy();

    this.isGpsDrSub?.destroy();

    super.destroy();
  }
}