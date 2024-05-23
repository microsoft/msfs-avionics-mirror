import {
  FacilityWaypoint, FSComponent, ICAO, LegType, Subject, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { GarminFacilityWaypointCache } from '@microsoft/msfs-garminsdk';

import { MapConfig } from '../../../Shared/Components/Map/MapConfig';
import { GenericTabbedContent } from '../../../Shared/Components/TabbedContainer/GenericTabbedContent';
import { TabbedContainer } from '../../../Shared/Components/TabbedContainer/TabbedContainer';
import { G3XFms } from '../../../Shared/FlightPlan/G3XFms';
import { G3XFplSourceDataProvider } from '../../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { PositionHeadingDataProvider } from '../../../Shared/Navigation/PositionHeadingDataProvider';
import { G3XUnitsUserSettings } from '../../../Shared/Settings/G3XUnitsUserSettings';
import { GduUserSettingTypes } from '../../../Shared/Settings/GduUserSettings';
import { MapUserSettings } from '../../../Shared/Settings/MapUserSettings';
import { UiViewProps } from '../../../Shared/UiSystem';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiKnobUtils } from '../../../Shared/UiSystem/UiKnobUtils';
import { DirectToNearestTab } from './DirectToNearestTab/DirectToNearestTab';
import { DirectToTargetParams } from './DirectToTargetParams';
import { DirectToWaypointTab } from './DirectToWaypointTab/DirectToWaypointTab';

import './DirectToView.css';

/**
 * Component props for the {@link DirectToView}.
 */
export interface DirectToDialogProps extends UiViewProps {
  /** A G3X Touch flight management system. */
  fms: G3XFms;

  /** A provider of position and heading data. */
  posHeadingDataProvider: PositionHeadingDataProvider;

  /** A provider of data related to flight plan source. */
  fplSourceDataProvider: G3XFplSourceDataProvider;

  /** A manager for GDU user settings. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;

  /** A configuration object defining options for the map. */
  mapConfig: MapConfig;
}

/**
 * A view that allows the user to select a Direct-To target.
 */
export class DirectToView extends AbstractUiView<DirectToDialogProps> {
  private readonly tabbedContainerRef = FSComponent.createRef<TabbedContainer>();

  private readonly facWaypointCache = GarminFacilityWaypointCache.getCache(this.props.uiService.bus);

  private readonly unitsSettingManager = G3XUnitsUserSettings.getManager(this.props.uiService.bus);

  private readonly selectedTargetParams = Subject.create<Readonly<DirectToTargetParams>>({
    waypoint: null,
    course: undefined
  });

  /** @inheritDoc */
  public onAfterRender(): void {
    this.tabbedContainerRef.instance.knobLabelState.pipe(this._knobLabelState);
  }

  /**
   * Sets this view's selected Direct-To target parameters.
   * @param params The target parameters to set.
   */
  public setSelectedTargetParams(params: Readonly<DirectToTargetParams>): void {
    ++this.initSelectedTargetParamsOpId;
    this.selectedTargetParams.set(params);
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.tabbedContainerRef.instance.open();
    this.tabbedContainerRef.instance.selectFirstTab();

    this.initSelectedTargetParams();
  }

  /** @inheritDoc */
  public onClose(): void {
    this.tabbedContainerRef.instance.close();
  }

  /** @inheritDoc */
  public onResume(): void {
    this.tabbedContainerRef.instance.resume();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.tabbedContainerRef.instance.pause();
  }

  /** @inheritDoc */
  public onUpdate(time: number): void {
    this.tabbedContainerRef.instance.update(time);
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.tabbedContainerRef.instance.onUiInteractionEvent(event);
  }

  private initSelectedTargetParamsOpId = 0;

  /**
   * Reads the waypoint from the flight planner and sets it as the current waypoint.
   */
  private async initSelectedTargetParams(): Promise<void> {
    const opId = ++this.initSelectedTargetParamsOpId;

    let waypoint: FacilityWaypoint | null = null;
    let course: number | undefined = undefined;

    const fms = this.props.fms.getCurrentFms();

    if (fms) {
      const currentDtoTargetIcao = fms.getDirectToTargetIcao();

      if (currentDtoTargetIcao) {
        // If a Direct-To is currently active, then we need to initialize the parameters to the active Direct-To
        // target. If the Direct-To was activated with a custom course, then we need to initialize the parameters with
        // the same course.

        if (ICAO.isFacility(currentDtoTargetIcao)) {
          try {
            const facility = await this.props.fms.facLoader.getFacility(ICAO.getFacilityType(currentDtoTargetIcao), currentDtoTargetIcao);
            waypoint = this.facWaypointCache.get(facility);

            const plan = fms.flightPlanner.getActiveFlightPlan();
            const activeLeg = plan.getLeg(plan.activeLateralLeg);
            if (activeLeg.leg.type === LegType.CF) {
              course = activeLeg.leg.course;
            }
          } catch {
            // noop
          }
        }
      } else {
        // If no Direct-To is active, then attempt to initialize the parameters to target the active leg's terminator
        // fix.

        const plan = fms.hasPrimaryFlightPlan() ? fms.getPrimaryFlightPlan() : undefined;
        if (plan) {
          const activeLeg = plan.tryGetLeg(plan.activeLateralLeg);
          switch (activeLeg?.leg.type) {
            case LegType.IF:
            case LegType.TF:
            case LegType.CF:
            case LegType.DF:
            case LegType.AF:
            case LegType.RF:
            case LegType.HF:
            case LegType.HA:
            case LegType.HM:
              if (ICAO.isFacility(activeLeg.leg.fixIcao)) {
                try {
                  const facility = await this.props.fms.facLoader.getFacility(ICAO.getFacilityType(activeLeg.leg.fixIcao), activeLeg.leg.fixIcao);
                  waypoint = this.facWaypointCache.get(facility);
                } catch {
                  // noop
                }
              }
          }
        }
      }
    }

    if (opId !== this.initSelectedTargetParamsOpId) {
      return;
    }

    this.selectedTargetParams.set({
      waypoint,
      course
    });
  }

  /**
   * Responds to when a waypoint is selected from one of this view's tabs that is not the Waypoint tab.
   * @param waypoint The waypoint that was selected.
   */
  private onWaypointSelected(waypoint: FacilityWaypoint): void {
    this.selectedTargetParams.set({
      waypoint,
      course: undefined
    });

    this.tabbedContainerRef.instance.selectFirstTab();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='direct-to-view ui-view-panel'>
        <div class='direct-to-view-title'>
          <img
            src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_direct_to.png`}
            class='direct-to-view-title-icon'
          />
          <span class='direct-to-view-title-text'>Direct To</span>
        </div>
        <TabbedContainer
          ref={this.tabbedContainerRef}
          bus={this.props.uiService.bus}
          validKnobIds={this.props.uiService.validKnobIds.filter(UiKnobUtils.isOuterKnobId)}
          tabsPerListPage={4}
          tabLength={116}
          tabSpacing={10}
          gduFormat={this.props.uiService.gduFormat}
          tabPosition='top'
          class='direct-to-view-tabbed-container'
        >
          <DirectToWaypointTab
            tabLabel='Waypoint'
            uiService={this.props.uiService}
            containerRef={this.props.containerRef}
            fms={this.props.fms}
            selectedTargetParams={this.selectedTargetParams}
            fplSourceDataProvider={this.props.fplSourceDataProvider}
            posHeadingDataProvider={this.props.posHeadingDataProvider}
            gduSettingManager={this.props.gduSettingManager}
            mapSettingManager={MapUserSettings.getStandardManager(this.props.uiService.bus)}
            unitsSettingManager={this.unitsSettingManager}
            mapConfig={this.props.mapConfig}
          />
          <GenericTabbedContent tabLabel={'Flight\nPlan'} isEnabled={false} />
          <DirectToNearestTab
            tabLabel={'Nearest\nAirports'}
            uiService={this.props.uiService}
            posHeadingDataProvider={this.props.posHeadingDataProvider}
            onWaypointSelected={this.onWaypointSelected.bind(this)}
          />
          <GenericTabbedContent tabLabel={'Recent'} isEnabled={false} />
        </TabbedContainer>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.tabbedContainerRef.getOrDefault()?.destroy();

    super.destroy();
  }
}
