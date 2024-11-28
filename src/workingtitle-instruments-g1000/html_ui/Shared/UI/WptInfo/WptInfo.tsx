import {
  AhrsEvents, EventBus, Facility, FacilitySearchType, FacilityWaypoint, FSComponent, GeoPoint, GeoPointSubject, GNSSEvents, NumberFormatter, Subject, Subscription, VNode,
  Waypoint
} from '@microsoft/msfs-sdk';

import { UnitsUserSettings } from '../../Units/UnitsUserSettings';
import { BearingDisplay } from '../Common/BearingDisplay';
import { NumberUnitDisplay } from '../Common/NumberUnitDisplay';
import { FmsHEvent } from '../FmsHEvent';
import { WaypointInput } from '../UIControls/WaypointInput';
import { UiView, UiViewProps } from '../UiView';
import { WptInfoController } from './WptInfoController';
import { WptInfoStore } from './WptInfoStore';

/**
 * The properties on the waypoint info popout component.
 */
export interface WptInfoProps extends UiViewProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The PFD waypoint info popout.
 */
export abstract class WptInfo<T extends WptInfoProps = WptInfoProps> extends UiView<T, Facility> {
  protected readonly inputSelectedIcao = Subject.create('');

  protected readonly selectedWaypointSub = Subject.create<Waypoint | null>(null);
  protected readonly planePos = GeoPointSubject.createFromGeoPoint(new GeoPoint(NaN, NaN));
  protected readonly planeHeading = Subject.create(NaN);

  protected readonly store = new WptInfoStore(this.selectedWaypointSub, this.planePos);
  protected readonly controller = new WptInfoController(this.store, this.selectedWaypointSub);

  protected readonly unitSettingManager = UnitsUserSettings.getManager(this.props.bus);

  private planePosSub?: Subscription;
  private planeHeadingSub?: Subscription;

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onAfterRender(node: VNode): void {
    const sub = this.props.bus.getSubscriber<GNSSEvents & AhrsEvents>();
    this.planePosSub = sub.on('gps-position').handle(this.onPlanePosChanged.bind(this), true);
    this.planeHeadingSub = sub.on('hdg_deg_true').atFrequency(1).handle(this.onPlaneHeadingChanged.bind(this), true);
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.CLR:
        this.close();
        return true;
      case FmsHEvent.ENT:
        this.onEnterPressed();
        return true;
    }
    return false;
  }

  /**
   * Executes actions when Enter is pressed.
   */
  protected onEnterPressed(): void {
    const matchedWaypoints = this.store.matchedWaypoints;
    const selectedWaypoint = this.store.waypoint.get() as FacilityWaypoint<Facility>;

    if (matchedWaypoints.length > 1) {
      const dialog = this.props.viewService.open('WptDup', true).setInput(matchedWaypoints);
      dialog.onAccept.on((sender: UiView<any, Facility, readonly FacilityWaypoint<Facility>[]>, facility: Facility | null) => {
        this.onWptDupDialogAccept(facility);
      });
      dialog.onClose.on(() => { this.onWptDupDialogClose(); });
    } else if (selectedWaypoint) {
      this.accept(selectedWaypoint.facility.get());
    }
  }

  /**
   * A callback which is called when a waypoint duplicate dialog invoked by this view accepts.
   * @param facility The facility returned by the waypoint duplicate dialog.
   */
  protected onWptDupDialogAccept(facility: Facility | null): void {
    facility && this.accept(facility);
  }

  /**
   * A callback which is called when a waypoint duplicate dialog invoked by this view closes.
   */
  protected onWptDupDialogClose(): void {
    // noop
  }

  /** @inheritDoc */
  protected onViewOpened(): void {
    this.inputSelectedIcao.set('');
    this.planePosSub!.resume(true);
    this.planeHeadingSub!.resume(true);
  }

  /** @inheritDoc */
  protected onViewClosed(): void {
    this.planePosSub!.pause();
    this.planeHeadingSub!.pause();
    this.inputSelectedIcao.set('');       // Clean up the icao subject, otherwise the subject's subscriptions are notified when the view opens the next time.
  }

  /**
   * A callback which is called when the plane's current position changes.
   * @param pos The new position.
   */
  private onPlanePosChanged(pos: LatLongAlt): void {
    this.planePos.set(pos.lat, pos.long);
  }

  /**
   * A callback which is called when the plane's current true heading changes.
   * @param heading The new heading, in degrees.
   */
  private onPlaneHeadingChanged(heading: number): void {
    this.planeHeading.set(heading);
  }

  /**
   * Renders a waypoint input component.
   * @returns a waypoint input component, as a VNode.
   */
  protected renderWaypointInput(): VNode {
    return (
      <WaypointInput
        bus={this.props.bus}
        viewService={this.props.viewService}
        onRegister={this.register}
        selectedIcao={this.inputSelectedIcao}
        onMatchedWaypointsChanged={this.controller.matchedWaypointsChangedHandler}
        onWaypointChanged={this.controller.selectedWaypointChangedHandler}
        onInputEnterPressed={this.onEnterPressed.bind(this)}
        planeHeading={this.planeHeading}
        filter={FacilitySearchType.AllExceptVisual}
      />
    );
  }

  /**
   * Renders a component which displays the bearing to the store's selected waypoint.
   * @param cssClass CSS class(es) to apply to the root of the component.
   * @returns a component which displays the bearing to the store's selected waypoint, as a VNode.
   */
  protected renderBearing(cssClass?: string): VNode {
    return (
      <BearingDisplay
        value={this.store.bearing} displayUnit={this.unitSettingManager.navAngleUnits}
        formatter={NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' })}
        class={cssClass}
      />
    );
  }

  /**
   * Renders a component which displays the distance to the store's selected waypoint.
   * @param cssClass CSS class(es) to apply to the root of the component.
   * @returns a component which displays the distance to the store's selected waypoint, as a VNode.
   */
  protected renderDistance(cssClass?: string): VNode {
    return (
      <NumberUnitDisplay
        value={this.store.distance} displayUnit={this.unitSettingManager.distanceUnitsLarge}
        formatter={NumberFormatter.create({ precision: 0.1, maxDigits: 3, forceDecimalZeroes: true, nanString: '__._' })}
        class={cssClass}
      />
    );
  }
}