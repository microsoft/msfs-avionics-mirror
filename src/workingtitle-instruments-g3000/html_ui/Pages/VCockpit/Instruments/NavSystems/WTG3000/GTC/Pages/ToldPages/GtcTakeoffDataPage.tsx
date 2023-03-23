/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FacilityType, FSComponent, NodeReference, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { AirportWaypoint } from '@microsoft/msfs-garminsdk';
import { G3000NearestContext, ToldTakeoffPerformanceResult, ToldUserSettings, VSpeedGroupType, VSpeedUserSettingManager } from '@microsoft/msfs-wtg3000-common';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcTakeoffDataPageConfigTab } from './GtcTakeoffDataPageConfigTab';
import { GtcTakeoffDataPageDataTab } from './GtcTakeoffDataPageDataTab';
import { GtcToldDataPage, GtcToldDataPageProps } from './GtcToldDataPage';
import { GtcToldDataPageTabContent } from './GtcToldDataPageTabContent';

/**
 * Component props for GtcTakeoffDataPage.
 */
export interface GtcTakeoffDataPageProps extends GtcToldDataPageProps {
  /** A manager for reference V-speed user settings. */
  vSpeedSettingManager: VSpeedUserSettingManager;
}

/**
 * A GTC takeoff data page.
 */
export class GtcTakeoffDataPage extends GtcToldDataPage<ToldTakeoffPerformanceResult, GtcTakeoffDataPageProps> {
  protected readonly isTakeoff = true;

  protected readonly originDestIcaoSetting = this.toldSettingManager.getSetting('toldOriginIcao');
  protected readonly resultSetting = this.toldSettingManager.getSetting('toldTakeoffCalcResult');

  private nearestContext?: G3000NearestContext;

  /** @inheritdoc */
  public constructor(props: GtcTakeoffDataPageProps) {
    super(props);

    G3000NearestContext.getInstance().then(instance => { this.nearestContext = instance; });
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this._title.set('Takeoff Data');
  }

  /** @inheritdoc */
  public onOpen(): void {
    super.onOpen();

    if (this.originDestIcaoSetting.value === '') {
      this.selectedAirportSub?.resume();
      this.selectedRunwaySub?.resume();

      this.autoSelectOrigin();

      this.selectedAirportSub?.pause();
      this.selectedRunwaySub?.pause();
    }
  }

  /**
   * Automatically selects an origin airport and runway. The selected origin will be one of the following, in order
   * of decreasing priority:
   * * The current origin runway in the primary flight plan.
   * * The current origin airport in the primary flight plan.
   * * The nearest airport to the airplane's current position.
   */
  private autoSelectOrigin(): void {
    const originFacility = this.props.flightPlanStore.originFacility.get();
    const originRunway = this.props.flightPlanStore.originRunway.get();

    if (originFacility !== undefined) {
      this.selectedAirport.set(this.facWaypointCache.get(originFacility) as AirportWaypoint);

      if (originRunway !== undefined) {
        this.selectedRunway.set(originRunway);
      }

      return;
    }

    if (this.nearestContext !== undefined) {
      const nearest = this.nearestContext.getNearest(FacilityType.Airport);
      if (nearest !== undefined) {
        this.selectedAirport.set(this.facWaypointCache.get(nearest) as AirportWaypoint);
        return;
      }
    }
  }

  /** @inheritdoc */
  protected parseResult(resultString: string): ToldTakeoffPerformanceResult | null {
    return ToldUserSettings.parseTakeoffResultString(resultString) ?? null;
  }

  /** @inheritdoc */
  protected getRootCssClass(): string {
    return 'takeoff-data-page';
  }

  /** @inheritdoc */
  protected renderConfigTab(contentRef: NodeReference<GtcToldDataPageTabContent>, sidebarState: Subscribable<SidebarState | null>): VNode {
    return (
      <GtcTakeoffDataPageConfigTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        controlMode={this.props.controlMode}
        displayPaneIndex={this.props.displayPaneIndex}
        options={this.props.perfConfig.toldConfig!.takeoff}
        toldSettingManager={this.toldSettingManager}
        unitsSettingManager={this.unitsSettingManager}
        sidebarState={sidebarState}
      />
    );
  }

  /** @inheritdoc */
  protected renderDataTab(contentRef: NodeReference<GtcToldDataPageTabContent>): VNode {
    return (
      <GtcTakeoffDataPageDataTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        takeoffVSpeedGroup={this.props.vSpeedGroups.get(VSpeedGroupType.Takeoff)}
        selectedAirport={this.selectedAirport}
        selectedRunway={this.selectedRunway}
        result={this.result}
        toldSettingManager={this.toldSettingManager}
        vSpeedSettingManager={this.props.vSpeedSettingManager}
        unitsSettingManager={this.unitsSettingManager}
      />
    );
  }
}