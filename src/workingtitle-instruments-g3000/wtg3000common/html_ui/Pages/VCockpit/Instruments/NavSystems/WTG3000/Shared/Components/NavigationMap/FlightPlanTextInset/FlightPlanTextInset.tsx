/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { EventBus, FSComponent, SetSubject, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { VNavDataProvider } from '@microsoft/msfs-garminsdk';

import { FlightPlanListManager } from '../../../FlightPlan/FlightPlanListManager';
import { FlightPlanStore } from '../../../FlightPlan/FlightPlanStore';
import { DisplayPaneInsetView, DisplayPaneInsetViewProps } from '../../DisplayPanes/DisplayPaneInsetView';
import { DisplayPaneSizeMode } from '../../DisplayPanes/DisplayPaneTypes';
import { FlightPlanTextUpdateData } from '../NavigationMapPaneViewEvents';
import { CurrentVnavProfilePanel } from './CurrentVnavProfilePanel';
import { FlightPlanTextPanel } from './FlightPlanTextPanel';

import './FlightPlanTextInset.css';

/**
 * The properties for the {@link FlightPlanTextInset} component.
 */
export interface FlightPlanTextInsetProps extends DisplayPaneInsetViewProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The flight plan store. */
  flightPlanStore: FlightPlanStore;
  /** The flight plan list manager to use. */
  flightPlanListManager: FlightPlanListManager;
  /** Whether to use cumulative distance or not. */
  mapInsetTextCumulativeSetting: Subscribable<boolean>;
  /** A provider of VNAV data. */
  vnavDataProvider: VNavDataProvider;
}

/**
 * A flight plan text inset for the navigation map pane. Diplays information on up to five flight plan legs and
 * information related to the current VNAV profile.
 */
export class FlightPlanTextInset extends DisplayPaneInsetView<FlightPlanTextInsetProps> {
  private readonly textPanelRef = FSComponent.createRef<FlightPlanTextPanel>();
  private readonly vnavProfilePanelRef = FSComponent.createRef<CurrentVnavProfilePanel>();

  private readonly displayPaneSizeMode = Subject.create<DisplayPaneSizeMode>(DisplayPaneSizeMode.Hidden);

  private readonly classList = SetSubject.create(['flight-plan-text-inset']);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.displayPaneSizeMode.sub(mode => {
      this.classList.toggle('show-vnav-box', mode === DisplayPaneSizeMode.Full);
    }, true);
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public override onResume(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.displayPaneSizeMode.set(size);
    this.textPanelRef.instance.resume();
    this.vnavProfilePanelRef.getOrDefault()?.resume();
  }

  /** @inheritdoc */
  public override onPause(): void {
    this.textPanelRef.instance.pause();
    this.vnavProfilePanelRef.getOrDefault()?.pause();
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public override onResize(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.displayPaneSizeMode.set(size);
  }

  /**
   * Handles the flight plan text update event.
   * @param event The event.
   */
  public onFlightPlanTextInsetEvent(event: FlightPlanTextUpdateData): void {
    this.textPanelRef.getOrDefault()?.onFlightPlanTextInsetEvent(event);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.classList}>
        <FlightPlanTextPanel
          ref={this.textPanelRef}
          bus={this.props.bus}
          flightPlanStore={this.props.flightPlanStore}
          flightPlanListManager={this.props.flightPlanListManager}
          mapInsetTextCumulativeSetting={this.props.mapInsetTextCumulativeSetting}
        />
        {!this.isPfd &&
          <CurrentVnavProfilePanel
            ref={this.vnavProfilePanelRef}
            bus={this.props.bus}
            fms={this.props.flightPlanStore.fms}
            planIndex={this.props.flightPlanStore.planIndex}
            store={this.props.flightPlanStore}
            vnavDataProvider={this.props.vnavDataProvider}
          />
        }
      </div>
    );
  }

  /** Destroys subs and comps. */
  public destroy(): void {
    this.textPanelRef.getOrDefault()?.destroy();
    this.vnavProfilePanelRef.getOrDefault()?.destroy();
  }
}