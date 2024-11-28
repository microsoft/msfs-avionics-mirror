/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FacilityType, FSComponent, ICAO, IcaoType, NodeReference, RunwayUtils, Subscribable, UnitType, VNode } from '@microsoft/msfs-sdk';

import { ToldLandingPerformanceResult, ToldUserSettings, VSpeedGroupType } from '@microsoft/msfs-wtg3000-common';

import { SidebarState } from '../../GtcService/Sidebar';
import { GtcPositionHeadingDataProvider } from '../../Navigation/GtcPositionHeadingDataProvider';
import { GtcLandingDataPageConfigTab } from './GtcLandingDataPageConfigTab';
import { GtcToldDataPage, GtcToldDataPageProps } from './GtcToldDataPage';
import { GtcToldDataPageTabContent } from './GtcToldDataPageTabContent';
import { GtcLandingDataPageDataTab } from './GtcLandingDataPageDataTab';

/**
 * Component props for GtcLandingDataPage.
 */
export interface GtcLandingDataPageProps extends GtcToldDataPageProps {
  /** A provider of airplane position and heading data. */
  posHeadingDataProvider: GtcPositionHeadingDataProvider;
}

/**
 * A GTC landing data page.
 */
export class GtcLandingDataPage extends GtcToldDataPage<ToldLandingPerformanceResult, GtcLandingDataPageProps> {
  private static readonly DEFAULT_ORIGIN_AIRPORT_MAX_DISTANCE = UnitType.NMILE.convertTo(30, UnitType.GA_RADIAN);

  protected readonly isTakeoff = false;

  protected readonly originDestIcaoSetting = this.toldSettingManager.getSetting('toldDestinationIcao');
  protected readonly resultSetting = this.toldSettingManager.getSetting('toldLandingCalcResult');

  private readonly destDefaultAppliedSetting = this.toldSettingManager.getSetting('toldDestinationDefaultApplied');
  private readonly originIcaoSetting = this.toldSettingManager.getSetting('toldOriginIcao');

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this._title.set('Landing Data');
  }

  /** @inheritdoc */
  public onOpen(): void {
    super.onOpen();

    if (!this.destDefaultAppliedSetting.value) {
      this.autoSelectDestination();
    }
  }

  /**
   * Automatically selects a destination airport and runway. The selected destination will be one of the following, in
   * order of decreasing priority:
   * * The current takeoff origin if the airplane is within 30 nautical miles of the origin airport.
   * * The current destination runway in the primary flight plan.
   * * The current destination airport in the primary flight plan.
   * * A null selection.
   */
  private async autoSelectDestination(): Promise<void> {
    const originIcao = this.originIcaoSetting.value;
    const originIcaoValue = ICAO.stringV2ToValue(originIcao);

    const isOriginRunway = ICAO.isValueFacility(originIcaoValue, FacilityType.RWY);
    const isOriginAirport = !isOriginRunway && ICAO.isValueFacility(originIcaoValue, FacilityType.Airport);

    // Default to the takeoff origin if it exists and the airplane is within 30 nautical miles of the origin airport.
    if (isOriginRunway || isOriginAirport) {
      const originAirportIcao = isOriginAirport ? originIcaoValue : ICAO.value(IcaoType.Airport, '', '', originIcaoValue.airport);

      const originAirportFacility = await this.props.facLoader.tryGetFacility(FacilityType.Airport, originAirportIcao);

      if (!originAirportFacility || this.destDefaultAppliedSetting.value) {
        return;
      }

      if (this.props.posHeadingDataProvider.ppos.get().distance(originAirportFacility) <= GtcLandingDataPage.DEFAULT_ORIGIN_AIRPORT_MAX_DISTANCE) {
        this.destDefaultAppliedSetting.value = true;
        this.originDestIcaoSetting.value = originIcao;
        return;
      }
    }

    // If the takeoff origin does not exist or the airplane is further than 30 nautical miles from the origin, default
    // to the flight plan destination airport/runway if it exists. Otherwise default to a null selection.

    this.destDefaultAppliedSetting.value = true;

    const destinationFacility = this.props.flightPlanStore.destinationFacility.get();
    const destinationRunway = this.props.flightPlanStore.destinationRunway.get();

    if (destinationFacility !== undefined) {
      if (destinationRunway !== undefined) {
        this.originDestIcaoSetting.value = ICAO.tryValueToStringV2(RunwayUtils.getRunwayFacilityIcaoValue(destinationFacility, destinationRunway));
      } else {
        this.originDestIcaoSetting.value = ICAO.tryValueToStringV2(destinationFacility.icaoStruct);
      }
    } else {
      this.originDestIcaoSetting.value = '';
    }
  }

  /** @inheritdoc */
  protected parseResult(resultString: string): ToldLandingPerformanceResult | null {
    return ToldUserSettings.parseLandingResultString(resultString) ?? null;
  }

  /** @inheritdoc */
  protected getRootCssClass(): string {
    return 'landing-data-page';
  }

  /** @inheritdoc */
  protected renderConfigTab(contentRef: NodeReference<GtcToldDataPageTabContent>, sidebarState: Subscribable<SidebarState | null>): VNode {
    return (
      <GtcLandingDataPageConfigTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        controlMode={this.props.controlMode}
        displayPaneIndex={this.props.displayPaneIndex}
        options={this.props.perfConfig.toldConfig!.landing}
        toldSettingManager={this.toldSettingManager}
        unitsSettingManager={this.unitsSettingManager}
        sidebarState={sidebarState}
      />
    );
  }

  /** @inheritdoc */
  protected renderDataTab(contentRef: NodeReference<GtcToldDataPageTabContent>): VNode {
    return (
      <GtcLandingDataPageDataTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        landingVSpeedGroup={this.props.vSpeedGroups.get(VSpeedGroupType.Landing)}
        selectedAirport={this.selectedAirport}
        selectedRunway={this.selectedRunway}
        result={this.result}
        toldSettingManager={this.toldSettingManager}
        unitsSettingManager={this.unitsSettingManager}
      />
    );
  }
}
