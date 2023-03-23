import {
  CombinedSubject, ComponentProps, DisplayComponent, EventBus, FlightPlanner, FSComponent, ObjectSubject, SetSubject, Subject, UserSettingManager, Vec2Math,
  Vec2Subject, VNode
} from '@microsoft/msfs-sdk';
import { TrafficSystem } from '@microsoft/msfs-garminsdk';
import { DisplayPaneSizeMode, DisplayPaneViewEvent, IauUserSettingManager, MapConfig, PfdIndex, PfdMapLayoutSettingMode, PfdMapLayoutUserSettingTypes } from '@microsoft/msfs-wtg3000-common';

import { NavInsetMap } from './NavInsetMap';
import { TrafficInsetMap } from './TrafficInsetMap';

import './InsetMapContainer.css';

/**
 * Component props for InsetMapContainer.
 */
export interface InsetMapContainerProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The flight planner. */
  flightPlanner: FlightPlanner;

  /** The traffic system used by the map to display traffic. */
  trafficSystem: TrafficSystem;

  /** The index of the PFD to which the map belongs. */
  pfdIndex: PfdIndex;

  /** A configuration object defining options for the map. */
  config: MapConfig;

  /** A manager for all IAU user settings. */
  iauSettingManager: IauUserSettingManager;

  /** Manager for PFD map layout user settings. */
  pfdMapLayoutSettingManager: UserSettingManager<PfdMapLayoutUserSettingTypes>;
}

/**
 * A container for the PFD inset map and traffic inset map.
 */
export class InsetMapContainer extends DisplayComponent<InsetMapContainerProps> {
  private readonly navMapRef = FSComponent.createRef<NavInsetMap>();
  private readonly trafficMapRef = FSComponent.createRef<TrafficInsetMap>();

  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly rootCssClass = SetSubject.create(['inset-map-container']);

  private readonly mapSize = Vec2Subject.create(Vec2Math.create(272, 284));

  private readonly mapLayoutSetting = this.props.pfdMapLayoutSettingManager.getSetting('pfdMapLayout');

  private activeMap: NavInsetMap | TrafficInsetMap | null = null;

  private readonly displayPaneSizeMode = Subject.create(DisplayPaneSizeMode.Full);

  private readonly mapLayoutState = CombinedSubject.create(
    this.displayPaneSizeMode,
    this.mapLayoutSetting
  );

  /** @inheritdoc */
  public onAfterRender(): void {
    this.mapLayoutState.sub(([displayPaneSizeMode, layoutSettingMode]) => {
      this.activeMap?.sleep();

      if (displayPaneSizeMode === DisplayPaneSizeMode.Full) {
        switch (layoutSettingMode) {
          case PfdMapLayoutSettingMode.Off:
          case PfdMapLayoutSettingMode.Hsi:
            this.rootStyle.set('display', 'none');
            this.activeMap = null;
            break;
          case PfdMapLayoutSettingMode.Inset:
            this.rootStyle.set('display', '');
            this.rootCssClass.delete('inset-map-container-traffic');
            this.rootCssClass.add('inset-map-container-nav');
            this.activeMap = this.navMapRef.instance;
            break;
          case PfdMapLayoutSettingMode.Traffic:
            this.rootStyle.set('display', '');
            this.rootCssClass.delete('inset-map-container-nav');
            this.rootCssClass.add('inset-map-container-traffic');
            this.activeMap = this.trafficMapRef.instance;
            break;
        }
      } else {
        this.rootStyle.set('display', 'none');
        this.activeMap = null;
      }

      this.activeMap?.wake();
    }, true);
  }

  /**
   * Responds to when this container's parent display pane is resized.
   * @param size The size of the parent display pane.
   */
  public onResize(size: DisplayPaneSizeMode): void {
    this.displayPaneSizeMode.set(size);
  }

  /**
   * Responds to when this container's parent display pane view is updated.
   * @param time The current real time, as a UNIX timestamp in milliseconds.
   */
  public onUpdate(time: number): void {
    this.activeMap?.update(time);
  }

  /**
   * Responds to events sent to this container's parent display pane view.
   * @param event A display pane view event.
   */
  public onEvent(event: DisplayPaneViewEvent): void {
    this.activeMap?.onEvent(event);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} style={this.rootStyle}>
        <NavInsetMap
          ref={this.navMapRef}
          bus={this.props.bus}
          flightPlanner={this.props.flightPlanner}
          trafficSystem={this.props.trafficSystem}
          pfdIndex={this.props.pfdIndex}
          projectedSize={this.mapSize}
          iauSettingManager={this.props.iauSettingManager}
          config={this.props.config}
        />
        <TrafficInsetMap
          ref={this.trafficMapRef}
          bus={this.props.bus}
          flightPlanner={this.props.flightPlanner}
          trafficSystem={this.props.trafficSystem}
          pfdIndex={this.props.pfdIndex}
          projectedSize={this.mapSize}
          iauSettingManager={this.props.iauSettingManager}
          config={this.props.config}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.navMapRef.getOrDefault()?.destroy();

    this.mapLayoutState.destroy();

    super.destroy();
  }
}