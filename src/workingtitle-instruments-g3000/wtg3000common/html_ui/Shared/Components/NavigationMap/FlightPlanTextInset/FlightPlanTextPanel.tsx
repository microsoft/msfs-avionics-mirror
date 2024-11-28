/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  ClockEvents, ComponentProps, DisplayComponent, EventBus, FSComponent, FlightPlanSegment, SetSubject, StringUtils,
  Subject, Subscribable, Subscription, VNode,
} from '@microsoft/msfs-sdk';

import { DateTimeUserSettings, UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import { FlightPlanListManager } from '../../../FlightPlan/FlightPlanListManager';
import { FlightPlanStore } from '../../../FlightPlan/FlightPlanStore';
import { FlightPlanTextData, FlightPlanTextRowData, FlightPlanTextUpdater } from '../../../FlightPlan/FlightPlanTextUpdater';
import { FlightPlanTextUpdateData } from '../NavigationMapPaneViewEvents';
import { FlightPlanTextFromToArrow } from './FlightPlanTextFromToArrow';
import { FlightPlanTextRow } from './FlightPlanTextRow';

import './FlightPlanTextPanel.css';

/**
 * The properties for the {@link FlightPlanTextPanel} component.
 */
export interface FlightPlanTextPanelProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The flight plan store. */
  flightPlanStore: FlightPlanStore;
  /** The flight plan list manager to use. */
  flightPlanListManager: FlightPlanListManager;
  /** Whether to use cumulative distance or not. */
  mapInsetTextCumulativeSetting: Subscribable<boolean>;
}

/**
 * A flight plan text panel which displays information on up to five flight plan legs.
 */
export class FlightPlanTextPanel extends DisplayComponent<FlightPlanTextPanelProps> {
  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.props.bus);
  private readonly dateTimeSettingManager = DateTimeUserSettings.getManager(this.props.bus);
  private readonly lastUpdate = Subject.create<FlightPlanTextData | undefined>(undefined);
  private readonly clock = this.props.bus.getSubscriber<ClockEvents>().on('realTime').atFrequency(1 / 2).handle(() => this.update(), true);
  private readonly flightPlanTextUpdater = new FlightPlanTextUpdater(this.props.flightPlanStore, this.props.flightPlanListManager);
  private readonly topRow = Subject.create<FlightPlanTextRowData | undefined>(undefined);
  private readonly selectedRow = Subject.create<FlightPlanTextRowData | undefined>(undefined);
  private readonly legOrCum = this.props.mapInsetTextCumulativeSetting.map(x => x ? 'CUM' : 'Leg');

  private readonly classList = SetSubject.create(['flight-plan-text-panel', 'pane-inset-panel']);

  private isResumed = false;
  private directToRandomSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.directToRandomSub = this.props.flightPlanStore.isDirectToRandomActive.sub(() => this.update(), false, true);
  }

  /**
   * When a flight plan text update event is received.
   * @param event The event.
   */
  public onFlightPlanTextInsetEvent(event: FlightPlanTextUpdateData): void {
    this.processEvent(event);
    this.update();
  }

  /**
   * Handles the update event.
   * @param event The event.
   */
  private processEvent(event: FlightPlanTextUpdateData): void {
    const plan = this.props.flightPlanStore.fms.getFlightPlan(this.props.flightPlanStore.planIndex);

    // Collapsed segment
    if (event.collapsedSegmentIndexes !== undefined) {
      const collapsedSegments = event.collapsedSegmentIndexes.map(x => plan.tryGetSegment(x));
      this.props.flightPlanListManager.collapsedAirwaySegments.set(collapsedSegments.filter(x => !!x) as FlightPlanSegment[]);
    }

    // Top row
    if (event.topRowSegmentIndex === -1) {
      this.topRow.set(undefined);
    } else if (event.topRowSegmentLegIndex === -1) {
      const segment = plan.tryGetSegment(event.topRowSegmentIndex);
      if (!segment) { this.topRow.set(undefined); return; }

      const segmentData = this.props.flightPlanStore.segmentMap.get(segment);
      const segmentListData = this.props.flightPlanListManager.segmentDataMap.get(segmentData!);
      this.topRow.set(segmentListData);
    } else {
      const leg = plan.tryGetLeg(event.topRowSegmentIndex, event.topRowSegmentLegIndex);
      if (!leg) { this.topRow.set(undefined); return; }

      const legData = this.props.flightPlanStore.legMap.get(leg);
      const legListData = this.props.flightPlanListManager.legDataMap.get(legData!);
      this.topRow.set(legListData);
    }

    // Selected row
    if (event.selectedSegmentIndex === -1) {
      this.selectedRow.set(undefined);
    } else if (event.selectedSegmentLegIndex === -1) {
      const segment = plan.tryGetSegment(event.selectedSegmentIndex);
      if (!segment) { this.selectedRow.set(undefined); return; }

      const segmentData = this.props.flightPlanStore.segmentMap.get(segment);
      const segmentListData = this.props.flightPlanListManager.segmentDataMap.get(segmentData!);
      this.selectedRow.set(segmentListData);
    } else {
      const leg = plan.tryGetLeg(event.selectedSegmentIndex, event.selectedSegmentLegIndex);
      if (!leg) { this.selectedRow.set(undefined); return; }

      const legData = this.props.flightPlanStore.legMap.get(leg);
      const legListData = this.props.flightPlanListManager.legDataMap.get(legData!);
      this.selectedRow.set(legListData);
    }
  }

  /** Resumes the text panel. */
  public resume(): void {
    this.isResumed = true;
    this.clock.resume(true);
    this.directToRandomSub?.resume();
  }

  /** Pauses the text panel. */
  public pause(): void {
    this.isResumed = false;
    this.clock.pause();
    this.directToRandomSub?.pause();
  }

  /** Gets the latest text from the text updater so the rows can update. */
  private update(): void {
    if (!this.isResumed) { return; }
    const update = this.flightPlanTextUpdater.getUpdateData(this.topRow.get());
    this.lastUpdate.set(update);
    const firstRow = update.rows[0] as FlightPlanTextRowData | undefined;
    const secondRow = update.rows[1] as FlightPlanTextRowData | undefined;
    const isDirectToRandom = firstRow && firstRow.type === 'leg' && firstRow.legData.isDirectToRandom;
    const isDirectToRandomWithHold = secondRow && secondRow.type === 'leg' && secondRow.legData.isDirectToRandom;
    this.classList.toggle('direct-to-random', !!isDirectToRandom);
    this.classList.toggle('direct-to-random-with-hold', !!isDirectToRandomWithHold);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.classList}>
        <div class="pane-inset-panel-title">Active Flight Plan</div>
        <div class="column-headers">
          <div class="dtk">DTK</div>
          <div class="distance">
            <div>{this.legOrCum}</div>
            <div>DIS</div>
          </div>
          <div class="altitude">ALT</div>
          <div class="fuel">
            <div>Fuel</div>
            <div>REM</div>
          </div>
          <div class="ete">
            <div>{this.legOrCum}</div>
            <div>ETE</div>
          </div>
          <div class="eta">ETA</div>
        </div>
        <div class="direct-to-random-label">
          Offroute {StringUtils.DIRECT_TO}
        </div>
        <div class="header-line" />
        <div class="direct-to-random-line" />
        <div class="text-rows">
          {[0, 1, 2, 3, 4].map(index => (
            <FlightPlanTextRow
              index={index}
              bus={this.props.bus}
              store={this.props.flightPlanStore}
              unitsSettingManager={this.unitsSettingManager}
              dateTimeSettingManager={this.dateTimeSettingManager}
              data={this.lastUpdate}
              selectedRow={this.selectedRow}
              mapInsetTextCumulativeSetting={this.props.mapInsetTextCumulativeSetting}
            />
          ))}
          <FlightPlanTextFromToArrow
            fromIndex={this.lastUpdate.map(x => x?.fromIndex)}
            toIndex={this.lastUpdate.map(x => x?.toIndex)}
            listItemHeightPx={36}
          />
        </div>
      </div>
    );
  }

  /** Destroys subs and comps. */
  public destroy(): void {
    this.clock.destroy();
    this.flightPlanTextUpdater.destroy();
    this.legOrCum.destroy();
    this.directToRandomSub?.destroy();
  }
}