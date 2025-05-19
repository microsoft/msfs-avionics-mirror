import {
  FacilityType, FacilityWaypoint, FSComponent, ICAO, NodeReference, ReadonlyFloat64Array, Subject, UserSettingManager,
  Vec2Math, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import { GarminFacilityWaypointCache } from '@microsoft/msfs-garminsdk';

import { RadiosConfig } from '../../../../Shared/AvionicsConfig/RadiosConfig';
import { G3XChartsConfig } from '../../../../Shared/Charts/G3XChartsConfig';
import { G3XChartsSource } from '../../../../Shared/Charts/G3XChartsSource';
import { MapConfig } from '../../../../Shared/Components/Map/MapConfig';
import { UiTouchButton } from '../../../../Shared/Components/TouchButton/UiTouchButton';
import { G3XFms } from '../../../../Shared/FlightPlan/G3XFms';
import { G3XFplSourceDataProvider } from '../../../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { G3XTouchFilePaths } from '../../../../Shared/G3XTouchFilePaths';
import { PositionHeadingDataProvider } from '../../../../Shared/Navigation/PositionHeadingDataProvider';
import { ComRadioSpacingDataProvider } from '../../../../Shared/Radio/ComRadioSpacingDataProvider';
import { G3XRadiosDataProvider } from '../../../../Shared/Radio/G3XRadiosDataProvider';
import { DisplayUserSettingTypes } from '../../../../Shared/Settings/DisplayUserSettings';
import { G3XChartsUserSettingTypes } from '../../../../Shared/Settings/G3XChartsUserSettings';
import { G3XDateTimeUserSettings } from '../../../../Shared/Settings/G3XDateTimeUserSettings';
import { G3XUnitsUserSettings } from '../../../../Shared/Settings/G3XUnitsUserSettings';
import { GduUserSettingTypes } from '../../../../Shared/Settings/GduUserSettings';
import { MapUserSettings } from '../../../../Shared/Settings/MapUserSettings';
import { GenericUiView } from '../../../../Shared/UiSystem/GenericUiView';
import { UiFocusController } from '../../../../Shared/UiSystem/UiFocusController';
import { UiInteractionEvent } from '../../../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../../../Shared/UiSystem/UiKnobTypes';
import { UiKnobUtils } from '../../../../Shared/UiSystem/UiKnobUtils';
import { UiService } from '../../../../Shared/UiSystem/UiService';
import { UiViewKeys } from '../../../../Shared/UiSystem/UiViewKeys';
import { UiViewLifecyclePolicy, UiViewOcclusionType, UiViewSizeMode, UiViewStackLayer } from '../../../../Shared/UiSystem/UiViewTypes';
import { WaypointInfo } from '../../../Components/WaypointInfo/WaypointInfo';
import { AbstractMfdPage } from '../../../PageNavigation/AbstractMfdPage';
import { MfdPageProps } from '../../../PageNavigation/MfdPage';
import { MfdPageSizeMode } from '../../../PageNavigation/MfdPageTypes';
import { MfdWaypointMapPopup } from './MfdWaypointMapPopup';

import './MfdWaypointOptionsPopup.css';
import './MfdWaypointPage.css';

/**
 * Component props for {@link MfdWaypointPage}
 */
export interface MfdWaypointPageProps extends MfdPageProps {
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
 * UI view keys for popups owned by the MFD map page.
 */
enum MfdWaypointPagePopupKeys {
  WaypointOptions = 'MfdWaypointPageOptions',
  WaypointMap = 'MfdWaypointMap'
}

/**
 * An MFD Waypoint page.
 */
export class MfdWaypointPage extends AbstractMfdPage<MfdWaypointPageProps> {
  private static readonly SIZE_MODE_MAP: Record<MfdPageSizeMode, UiViewSizeMode> = {
    [MfdPageSizeMode.Full]: UiViewSizeMode.Full,
    [MfdPageSizeMode.Half]: UiViewSizeMode.Half
  };

  private readonly facWaypointCache = GarminFacilityWaypointCache.getCache(this.props.uiService.bus);

  private readonly waypointInfoRef = FSComponent.createRef<WaypointInfo>();

  private readonly waypointInfoSize = Vec2Math.create();
  private readonly waypointInfoExpandMargins = VecNMath.create(4);

  private readonly selectedWaypoint = Subject.create<FacilityWaypoint | null>(null);

  /** @inheritDoc */
  public onAfterRender(): void {
    this._title.set('Waypoint');
    this._iconSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_waypoint_info.png`);

    this.props.uiService.registerMfdView(
      UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, MfdWaypointPagePopupKeys.WaypointOptions,
      this.renderOptionsPopup.bind(this)
    );

    this.props.uiService.registerMfdView(
      UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Persistent, MfdWaypointPagePopupKeys.WaypointMap,
      (uiService, containerRef) => {
        return (
          <MfdWaypointMapPopup
            uiService={uiService} containerRef={containerRef}
            facLoader={this.props.fms.facLoader}
            fplSourceDataProvider={this.props.fplSourceDataProvider}
            gduSettingManager={this.props.gduSettingManager}
            displaySettingManager={this.props.displaySettingManager}
            mapConfig={this.props.mapConfig}
          />
        );
      }
    );

    this.waypointInfoRef.instance.knobLabelState.pipe(this._knobLabelState);
  }

  /** @inheritDoc */
  public onOpen(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.updateWaypointInfoSize(dimensions);
    this.waypointInfoRef.instance.onOpen(
      MfdWaypointPage.SIZE_MODE_MAP[sizeMode],
      this.waypointInfoSize,
      this.waypointInfoExpandMargins
    );
  }

  /** @inheritDoc */
  public onClose(): void {
    this.waypointInfoRef.instance.onClose();
  }

  /** @inheritDoc */
  public onResize(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.updateWaypointInfoSize(dimensions);
    this.waypointInfoRef.instance.onResize(
      MfdWaypointPage.SIZE_MODE_MAP[sizeMode],
      this.waypointInfoSize,
      this.waypointInfoExpandMargins
    );
  }

  /**
   * Updates this page's waypoint information display size.
   * @param dimensions This page's dimensions, as `[width, height]` in pixels.
   */
  private updateWaypointInfoSize(dimensions: ReadonlyFloat64Array): void {
    // TODO: support GDU470 (portrait)
    VecNMath.set(this.waypointInfoExpandMargins, 7, 8, 0, 8);
    Vec2Math.set(dimensions[0] - 7, dimensions[1] - 16, this.waypointInfoSize);
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
    if (event === UiInteractionEvent.MenuPress) {
      this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, MfdWaypointPagePopupKeys.WaypointOptions, false, { popupType: 'slideout-bottom-full' });
      return true;
    }

    return this.waypointInfoRef.instance.onUiInteractionEvent(event);
  }

  private selectAirportOpId = 0;

  /**
   * Selects the current departure airport to be displayed. If there is no departure airport, then this method does
   * nothing.
   */
  private async selectDepartureAirport(): Promise<void> {
    const opId = ++this.selectAirportOpId;

    const flightPlan = this.props.fms.hasPrimaryFlightPlan() && this.props.fms.getPrimaryFlightPlan();

    if (!flightPlan) {
      return;
    }

    const originIcao = flightPlan.originAirport;

    if (originIcao === undefined) {
      return;
    }

    const originFacility = await this.props.fms.facLoader.getFacility(FacilityType.Airport, originIcao);

    if (opId !== this.selectAirportOpId) {
      return;
    }

    this.selectedWaypoint.set(this.facWaypointCache.get(originFacility));
  }

  /**
   * Selects the current destination airport to be displayed. If there is no destination airport, then this method
   * does nothing.
   */
  private async selectDestinationAirport(): Promise<void> {
    const opId = ++this.selectAirportOpId;

    let destIcao: string | undefined;

    const dtoTargetIcao = this.props.fms.getDirectToTargetIcao();
    if (dtoTargetIcao && ICAO.isFacility(dtoTargetIcao, FacilityType.Airport)) {
      destIcao = dtoTargetIcao;
    }

    if (destIcao === undefined) {
      const flightPlan = this.props.fms.hasPrimaryFlightPlan() && this.props.fms.getPrimaryFlightPlan();
      if (flightPlan) {
        destIcao = flightPlan.destinationAirport;
      }
    }

    if (destIcao === undefined) {
      return;
    }

    const destFacility = await this.props.fms.facLoader.getFacility(FacilityType.Airport, destIcao);

    if (opId !== this.selectAirportOpId) {
      return;
    }

    this.selectedWaypoint.set(this.facWaypointCache.get(destFacility));
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='mfd-waypoint-page ui-view-generic-bg'>
        <WaypointInfo
          ref={this.waypointInfoRef}
          uiService={this.props.uiService}
          containerRef={this.props.containerRef}
          validKnobIds={this.props.uiService.validKnobIds.filter(UiKnobUtils.isInnerKnobId)}
          facLoader={this.props.fms.facLoader}
          fplSourceDataProvider={this.props.fplSourceDataProvider}
          posHeadingDataProvider={this.props.posHeadingDataProvider}
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
          allowSelection={true}
        />
      </div>
    );
  }

  /**
   * Renders a waypoint options popup view for this page.
   * @param uiService The UI service.
   * @param containerRef A reference to the root element of the view's container.
   * @returns A waypoint options popup view for this page, as a VNode.
   */
  private renderOptionsPopup(uiService: UiService, containerRef: NodeReference<HTMLElement>): VNode {
    const focusController = new UiFocusController(uiService.validKnobIds);

    return (
      <GenericUiView
        uiService={uiService}
        containerRef={containerRef}
        createFocusController={() => focusController}
        onAfterRender={(thisNode, members) => {
          members.focusController.setActive(true);
          members.knobLabelState.set([
            [UiKnobId.SingleOuter, 'Move Selector'],
            [UiKnobId.SingleInner, 'Move Selector'],
            [UiKnobId.LeftOuter, 'Move Selector'],
            [UiKnobId.LeftInner, 'Move Selector'],
            [UiKnobId.RightOuter, 'Move Selector'],
            [UiKnobId.RightInner, 'Move Selector']
          ]);
        }}
        onClose={members => {
          members.focusController.clearRecentFocus();
        }}
        onResume={members => {
          members.focusController.focusRecent();
        }}
        onPause={members => {
          members.focusController.removeFocus();
        }}
        onUiInteractionEvent={(event, members) => {
          if (event === UiInteractionEvent.MenuPress) {
            this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.MainMenu, true, {
              popupType: 'slideout-bottom-full',
              backgroundOcclusion: 'hide'
            });
            return true;
          }

          return members.focusController.onUiInteractionEvent(event);
        }}
      >
        <div class='mfd-waypoint-options-popup ui-view-panel'>
          <div class='mfd-waypoint-options-popup-title'>Waypoint Options</div>
          <div class='mfd-waypoint-options-popup-main'>
            <UiTouchButton
              label={'View Departure\nAirport'}
              onPressed={() => {
                this.props.uiService.goBackMfd();
                this.selectDepartureAirport();
              }}
              focusController={focusController}
            />
            <UiTouchButton
              label={'View Destination\nAirport'}
              onPressed={() => {
                this.props.uiService.goBackMfd();
                this.selectDestinationAirport();
              }}
              focusController={focusController}
            />
            <UiTouchButton
              label={'Show Map'}
              onPressed={() => {
                this.props.uiService
                  .openMfdPopup<MfdWaypointMapPopup>(UiViewStackLayer.Overlay, MfdWaypointPagePopupKeys.WaypointMap, true, {
                    popupType: 'slideout-bottom-full',
                    backgroundOcclusion: 'hide'
                  })
                  .ref.setSelectedWaypoint(this.selectedWaypoint.get());
              }}
              focusController={focusController}
            />
            <UiTouchButton
              label={'Show En Route\nChart'}
              isEnabled={false}
              focusController={focusController}
            />
          </div>
          <div class='mfd-waypoint-options-popup-main-menu-msg'>
            <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_menu_button.png`} class='mfd-waypoint-options-popup-main-menu-icon' /> for Main Menu
          </div>
        </div>
      </GenericUiView>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.waypointInfoRef.getOrDefault()?.destroy();

    super.destroy();
  }
}
