import { AhrsEvents, ControlPublisher, EventBus, FacilityLoader, FSComponent, GNSSEvents, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';

import { GarminFacilityWaypointCache } from '@microsoft/msfs-garminsdk';

import { NearestAirportSearchSettings } from '../../../Shared/NearestAirportSearchSettings';
import { NearestController } from '../../../Shared/UI/Controllers/NearestController';
import { NearbyAirport, NearestStore } from '../../../Shared/UI/Controllers/NearestStore';
import { FmsHEvent } from '../../../Shared/UI/FmsHEvent';
import { List } from '../../../Shared/UI/List';
import { ScrollBar } from '../../../Shared/UI/ScrollBar';
import { UiControl } from '../../../Shared/UI/UiControl';
import { UiView, UiViewProps } from '../../../Shared/UI/UiView';
import { NearestAirportItem } from './NearestAirportItem';

import './Nearest.css';

/**
 * The properties on the nearest airports popout component.
 */
interface NearestProps extends UiViewProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** A facility loader. */
  loader: FacilityLoader
  /** A ControlPublisher */
  publisher: ControlPublisher
}

/**
 * The PFD nearest airports popout.
 */
export class Nearest extends UiView<NearestProps> {
  private readonly nearestListContainerRef = FSComponent.createRef<HTMLElement>();
  private readonly noneMsgRef = FSComponent.createRef<HTMLDivElement>();

  private readonly searchSettings = NearestAirportSearchSettings.getManager(this.props.bus);

  private readonly store: NearestStore;
  private readonly controller: NearestController;
  private readonly publisher: ControlPublisher;

  private runwayLength = 0;
  private surfaceType = 0;

  private planePosSub?: Subscription;
  private planeHeadingSub?: Subscription;

  /**
   * Creates an instance of a nearest airport box.
   * @param props The props.
   */
  constructor(props: NearestProps) {
    super(props);
    this.store = new NearestStore(this.props.loader);
    this.publisher = this.props.publisher;
    this.controller = new NearestController(this.store, this.publisher, this.props.viewService);
    this.searchSettings.whenSettingChanged('runwayLength').handle(v => {
      this.store.setFilter(this.runwayLength = v, this.surfaceType);
    });
    this.searchSettings.whenSettingChanged('surfaceTypes').handle(v => {
      this.store.setFilter(this.runwayLength, this.surfaceType = v);
    });
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    const sub = this.props.bus.getSubscriber<GNSSEvents & AhrsEvents>();
    this.planePosSub = sub.on('gps-position').atFrequency(1).handle(this.onGps.bind(this), true);
    this.planeHeadingSub = sub.on('hdg_deg_true').atFrequency(1).handle(this.onPlaneHeadingChanged.bind(this), true);

    this.store.airportCount.sub(this.onAirportCountChanged.bind(this), true);
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.UPPER_PUSH:
        this.toggleScroll();
        return true;
      case FmsHEvent.CLR:
        this.close();
        return true;
    }

    return false;
  }

  /**
   * Set up the strobed update when the nearest popup is open.
   */
  protected onViewOpened(): void {
    this.setScrollEnabled(true);
    this.scrollController.gotoFirst();
    this.planePosSub!.resume(true);
    this.planeHeadingSub!.resume(true);
  }

  /**
   * When the popup is closed, kill the update to save cycles.
   */
  protected onViewClosed(): void {
    this.planePosSub!.pause();
    this.planeHeadingSub!.pause();
  }

  /**
   * Handle a GPS update.
   * @param pos The current LatLongAlt
   */
  private onGps(pos: LatLongAlt): void {
    this.store.planePos.set(pos.lat, pos.long);
  }

  /**
   * A callback which is called when the airplane's true heading changes.
   * @param heading The airplane's current true heading.
   */
  private onPlaneHeadingChanged(heading: number): void {
    this.store.planeHeading.set(heading);
  }

  /**
   * A callback which is called when the number of airports in the nearest list changes.
   * @param count The number of airports in the nearest list.
   */
  private onAirportCountChanged(count: number): void {
    if (count === 0) {
      this.noneMsgRef.instance.style.display = '';
    } else {
      this.noneMsgRef.instance.style.display = 'none';
    }
  }

  public buildNearestItem = (data: Subject<NearbyAirport>, registerFn: (ctrl: UiControl) => void): VNode => {
    return (
      <NearestAirportItem
        onRegister={registerFn}
        data={data}
        facWaypointCache={GarminFacilityWaypointCache.getCache(this.props.bus)}
        planeHeading={this.store.planeHeading}
        directToHandler={this.controller.onDirectIdentHandler}
        frequencyHandler={this.controller.onEnterFreqHandler}
      />
    );
  };

  /**
   * Render the component.
   * @returns a VNode
   */
  public render(): VNode {
    return (
      <div class='popout-dialog pfd-nearest-airport' ref={this.viewContainerRef}>
        <h1>{this.props.title}</h1>
        <div class='nearest-airport-popout-container' ref={this.nearestListContainerRef} >
          <List onRegister={this.register} data={this.store.nearestSubjectList} renderItem={this.buildNearestItem} scrollContainer={this.nearestListContainerRef} />
          <div ref={this.noneMsgRef} class='nearest-airport-none'>None within 200<span class='nearest-airport-none-unit'>NM</span></div>
        </div>
        <ScrollBar />
      </div>
    );
  }
}