import {
  Facility, FacilityType, FacilityWaypoint, FSComponent, ICAO, ReadonlyFloat64Array, Subject, Subscription,
  UserSettingManager, Vec2Math, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import { RadiosConfig } from '../../../Shared/AvionicsConfig/RadiosConfig';
import { G3XChartsConfig } from '../../../Shared/Charts/G3XChartsConfig';
import { G3XChartsSource } from '../../../Shared/Charts/G3XChartsSource';
import { MapConfig } from '../../../Shared/Components/Map/MapConfig';
import { G3XFms } from '../../../Shared/FlightPlan/G3XFms';
import { G3XFplSourceDataProvider } from '../../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { PositionHeadingDataProvider } from '../../../Shared/Navigation/PositionHeadingDataProvider';
import { ComRadioSpacingDataProvider } from '../../../Shared/Radio/ComRadioSpacingDataProvider';
import { G3XRadiosDataProvider } from '../../../Shared/Radio/G3XRadiosDataProvider';
import { DisplayUserSettingTypes } from '../../../Shared/Settings/DisplayUserSettings';
import { G3XChartsUserSettingTypes } from '../../../Shared/Settings/G3XChartsUserSettings';
import { G3XDateTimeUserSettings } from '../../../Shared/Settings/G3XDateTimeUserSettings';
import { G3XUnitsUserSettings } from '../../../Shared/Settings/G3XUnitsUserSettings';
import { GduUserSettingTypes } from '../../../Shared/Settings/GduUserSettings';
import { MapUserSettings } from '../../../Shared/Settings/MapUserSettings';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiViewOcclusionType, UiViewSizeMode } from '../../../Shared/UiSystem/UiViewTypes';
import { WaypointInfo } from '../../Components/WaypointInfo/WaypointInfo';

import './WaypointInfoPopup.css';

/**
 * Component props for {@link WaypointInfoPopup}
 */
export interface WaypointInfoPopupProps extends UiViewProps {
  /** The FMS. */
  fms: G3XFms;

  /** A provider of airplane position and heading data. */
  posHeadingDataProvider: PositionHeadingDataProvider;

  /** A provider of flight plan source data. */
  fplSourceDataProvider: G3XFplSourceDataProvider;

  /** A provider of radios data. */
  radiosDataProvider: G3XRadiosDataProvider;

  /** A provider of COM radio spacing mode data. */
  comRadioSpacingDataProvider: ComRadioSpacingDataProvider;

  /** A manager for GDU user settings. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;

  /** A manager for display user settings. */
  displaySettingManager: UserSettingManager<DisplayUserSettingTypes>;

  /** A manager for electronic charts user settings. */
  chartsSettingManager: UserSettingManager<G3XChartsUserSettingTypes>;

  /** A configuration object defining options for the map. */
  mapConfig: MapConfig;

  /** A configuration object defining options for electronic charts. */
  chartsConfig: G3XChartsConfig;

  /** A configuration object defining options for radios. */
  radiosConfig: RadiosConfig;

  /** All available electronic charts sources. */
  chartsSources: Iterable<G3XChartsSource>;
}

/**
 * A popup that displays information about a waypoint.
 */
export class WaypointInfoPopup extends AbstractUiView<WaypointInfoPopupProps> {
  private static readonly TITLE_FORMATTER = (facility: Facility | null): string => {
    if (!facility) {
      return '';
    }

    switch (ICAO.getFacilityType(facility.icao)) {
      case FacilityType.Airport:
        return 'Airport';
      case FacilityType.VOR:
        return 'VOR';
      case FacilityType.NDB:
        return 'NDB';
      case FacilityType.Intersection:
      case FacilityType.RWY:
      case FacilityType.VIS:
        return 'Intersection';
      case FacilityType.USR:
        return 'User Waypoint';
      default:
        return '';
    }
  };

  private readonly waypointInfoRef = FSComponent.createRef<WaypointInfo>();

  private readonly waypointInfoSize = Vec2Math.create();
  private readonly waypointInfoExpandMargins = VecNMath.create(4);

  private readonly selectedWaypoint = Subject.create<FacilityWaypoint | null>(null);

  private readonly selectedFacility = Subject.create<Facility | null>(null);

  private viewSizeMode = UiViewSizeMode.Hidden;
  private readonly viewDimensions = Vec2Math.create();

  private selectedFacilityPipe?: Subscription;
  private pfdPaneSideSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.waypointInfoRef.instance.knobLabelState.pipe(this._knobLabelState);

    this.selectedWaypoint.sub(waypoint => {
      this.selectedFacilityPipe?.destroy();
      if (waypoint) {
        this.selectedFacilityPipe = waypoint.facility.pipe(this.selectedFacility);
      } else {
        this.selectedFacility.set(null);
        this.selectedFacilityPipe = undefined;
      }
    }, true);

    if (this.props.uiService.gduFormat === '460') {
      this.pfdPaneSideSub = this.props.uiService.gdu460PfdPaneSide
        .sub(this.onPfdPaneSideChanged.bind(this), false, true);
    }
  }

  /**
   * Sets this popup's displayed waypoint.
   * @param waypoint The waypoint to set.
   */
  public setWaypoint(waypoint: FacilityWaypoint | null): void {
    this.selectedWaypoint.set(waypoint);
  }

  /** @inheritDoc */
  public onOpen(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.viewSizeMode = sizeMode;
    Vec2Math.copy(dimensions, this.viewDimensions);
    this.updateWaypointInfoSize();
    this.waypointInfoRef.instance.onOpen(this.viewSizeMode, this.waypointInfoSize, this.waypointInfoExpandMargins);

    this.pfdPaneSideSub?.resume();
  }

  /** @inheritDoc */
  public onClose(): void {
    this.waypointInfoRef.instance.onClose();

    this.pfdPaneSideSub?.pause();
  }

  /** @inheritDoc */
  public onResize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.viewSizeMode = sizeMode;
    Vec2Math.copy(dimensions, this.viewDimensions);
    this.updateWaypointInfoSize();
    this.waypointInfoRef.instance.onResize(this.viewSizeMode, this.waypointInfoSize, this.waypointInfoExpandMargins);
  }

  /**
   * Updates this popup's waypoint information display size.
   */
  private updateWaypointInfoSize(): void {
    // TODO: support GDU470 (portrait)

    let marginLeft: number;
    let marginRight: number;

    if (this.viewSizeMode === UiViewSizeMode.Half) {
      // The popup takes up the entire width of the pane minus 6px margin on one side, up to a maximum width of
      // 600px. The popup also has 3px border and 7px padding on each side.

      const popupWidth = Math.min(600, this.viewDimensions[0] - 6);
      const popupHalfWidthExcess = (this.viewDimensions[0] - popupWidth) * 0.5;
      let popupMarginLeft = Math.floor(popupHalfWidthExcess);
      let popupMarginRight = Math.ceil(popupHalfWidthExcess);

      if (this.props.uiService.gdu460PfdPaneSide.get() === 'right') {
        popupMarginLeft -= 3;
        popupMarginRight += 3;
      } else {
        popupMarginLeft += 3;
        popupMarginRight -= 3;
      }

      marginLeft = popupMarginLeft + 3 + 7;
      marginRight = popupMarginRight + 3 + 7;
    } else {
      // The popup takes up the entire width of the pane minus 6px margin on each side, up to a maximum width of
      // 1210px. The popup also has 3px border and 7px padding on each side.

      const popupWidth = Math.min(1210, this.viewDimensions[0] - 12);
      const popupHalfWidthExcess = (this.viewDimensions[0] - popupWidth) * 0.5;
      const popupMarginLeft = Math.floor(popupHalfWidthExcess);
      const popupMarginRight = Math.ceil(popupHalfWidthExcess);

      marginLeft = popupMarginLeft + 3 + 7;
      marginRight = popupMarginRight + 3 + 7;
    }
    const width = this.viewDimensions[0] - (marginLeft + marginRight);

    // The popup is 668px in height with 3px border on each side. On the top side, there is a 31px tall title, and
    // on the bottom there is a 7px padding.
    const popupHalfHeightExcess = (this.viewDimensions[1] - 668) * 0.5;
    const popupMarginTop = Math.floor(popupHalfHeightExcess);
    const popupMarginBottom = Math.ceil(popupHalfHeightExcess);
    const marginTop = popupMarginTop + 3 + 31;
    const marginBottom = popupMarginBottom + 3 + 7;
    const height = this.viewDimensions[1] - (marginTop + marginBottom);

    Vec2Math.set(width, height, this.waypointInfoSize);
    VecNMath.set(this.waypointInfoExpandMargins, marginLeft, marginTop, marginRight, marginBottom);
  }

  /** @inheritDoc */
  public onResume(): void {
    this.waypointInfoRef.instance.onResume();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.waypointInfoRef.instance.onPause();
  }

  /** @inheritDoc */
  public onOcclusionChange(occlusionType: UiViewOcclusionType): void {
    this.waypointInfoRef.instance.onOcclusionChange(occlusionType);
  }

  /** @inheritDoc */
  public onUpdate(time: number): void {
    this.waypointInfoRef.instance.onUpdate(time);
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.waypointInfoRef.instance.onUiInteractionEvent(event);
  }

  /**
   * Responds to when 
   */
  private onPfdPaneSideChanged(): void {
    this.updateWaypointInfoSize();
    this.waypointInfoRef.instance.onResize(this.viewSizeMode, this.waypointInfoSize, this.waypointInfoExpandMargins);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='waypoint-info-popup ui-view-panel'>
        <div class='waypoint-info-popup-title'>{this.selectedFacility.map(WaypointInfoPopup.TITLE_FORMATTER)}</div>
        <div class='waypoint-info-popup-main'>
          <WaypointInfo
            ref={this.waypointInfoRef}
            uiService={this.props.uiService}
            containerRef={this.props.containerRef}
            validKnobIds={this.props.uiService.validKnobIds}
            facLoader={this.props.fms.facLoader}
            posHeadingDataProvider={this.props.posHeadingDataProvider}
            fplSourceDataProvider={this.props.fplSourceDataProvider}
            radiosDataProvider={this.props.radiosDataProvider}
            comRadioSpacingDataProvider={this.props.comRadioSpacingDataProvider}
            mapBingId={`g3x-${this.props.uiService.gduIndex}-map-1`}
            runwayTabMapBingId={`g3x-${this.props.uiService.gduIndex}-map-3`}
            gduSettingManager={this.props.gduSettingManager}
            displaySettingManager={this.props.displaySettingManager}
            dateTimeSettingManager={G3XDateTimeUserSettings.getManager(this.props.uiService.bus)}
            mapSettingManager={MapUserSettings.getStandardManager(this.props.uiService.bus)}
            chartsSettingManager={this.props.chartsSettingManager}
            unitsSettingManager={G3XUnitsUserSettings.getManager(this.props.uiService.bus)}
            mapConfig={this.props.mapConfig}
            chartsConfig={this.props.chartsConfig}
            radiosConfig={this.props.radiosConfig}
            chartsSources={this.props.chartsSources}
            selectedWaypoint={this.selectedWaypoint}
            allowSelection={false}
          />
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.waypointInfoRef.getOrDefault()?.destroy();

    this.selectedFacilityPipe?.destroy();
    this.pfdPaneSideSub?.destroy();

    super.destroy();
  }
}
