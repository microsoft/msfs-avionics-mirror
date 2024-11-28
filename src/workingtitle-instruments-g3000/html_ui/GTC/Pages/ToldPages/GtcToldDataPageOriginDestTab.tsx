import {
  ComponentProps, DisplayComponent, FacilitySearchType, FSComponent, MutableSubscribable, NumberFormatter,
  NumberUnitSubject, OneWayRunway, RunwayUtils, Subscription, UnitType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { AirportWaypoint, GarminFacilityWaypointCache, NumberUnitDisplay, UnitsDistanceSettingMode, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';

import { G3000FilePaths, G3000FmsUtils, ToldControlEvents, ToldUserSettingTypes } from '@microsoft/msfs-wtg3000-common';

import { GtcImgTouchButton } from '../../Components/TouchButton/GtcImgTouchButton';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcValueTouchButton } from '../../Components/TouchButton/GtcValueTouchButton';
import { GtcWaypointSelectButton } from '../../Components/TouchButton/GtcWaypointSelectButton';
import { GtcRunwayLengthDialog } from '../../Dialog/GtcRunwayLengthDialog';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcToldDataPageTabContent } from './GtcToldDataPageTabContent';
import { GtcToldRunwayDisplay } from './GtcToldRunwayDisplay';

import '../../Components/TouchButton/GtcDirectoryButton.css';
import './GtcToldDataPageOriginDestTab.css';

/**
 * Component props for GtcToldDataPageOriginDestTab.
 */
export interface GtcToldDataPageOriginDestTabProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** The cache from which to retrieve facility waypoints. */
  facWaypointCache: GarminFacilityWaypointCache;

  /** The selected airport. */
  selectedAirport: MutableSubscribable<AirportWaypoint | null>;

  /** The selected runway. */
  selectedRunway: MutableSubscribable<OneWayRunway | null>;

  /** A manager for TOLD performance calculation user settings. */
  toldSettingManager: UserSettingManager<ToldUserSettingTypes>;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the tab is for the takeoff data page. */
  isTakeoff: boolean;

  /** Whether to render a version of the tab that supports performance calculations. */
  supportPerformance: boolean;
}

/**
 * A GTC TOLD (takeoff/landing) data page origin/destination tab.
 */
export class GtcToldDataPageOriginDestTab extends DisplayComponent<GtcToldDataPageOriginDestTabProps> implements GtcToldDataPageTabContent {
  private static readonly LENGTH_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '____' });
  private static readonly WEIGHT_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '_____' });

  private thisNode?: VNode;

  private readonly settingString = this.props.isTakeoff ? 'Takeoff' : 'Landing';
  private readonly requiredDistanceSetting = this.props.toldSettingManager.getSetting(`told${this.settingString}DistanceRequired`);
  private readonly weightSetting = this.props.toldSettingManager.getSetting(`told${this.settingString}Weight`);

  private readonly runways = this.props.selectedAirport.map(origin => {
    if (origin === null) {
      return [];
    }

    return RunwayUtils.getOneWayRunwaysFromAirport(origin.facility.get()).sort(G3000FmsUtils.sortOneWayRunway);
  }).pause();

  private readonly runwayListItemHeightPx = this.props.gtcService.isHorizontal ? 162 : 86;
  private readonly runwayListItemSpacingPx = this.props.gtcService.isHorizontal ? 2 : 1;

  private readonly distanceRequired = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));
  private readonly weight = NumberUnitSubject.create(UnitType.POUND.createNumber(NaN));

  private distanceRequiredPipe?: Subscription;
  private weightPipe?: Subscription;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    if (this.props.supportPerformance) {
      this.weightPipe = this.weightSetting.pipe(this.weight, weight => {
        return weight < 0 ? NaN : weight;
      }, true);
    } else {
      this.distanceRequiredPipe = this.requiredDistanceSetting.pipe(this.distanceRequired, distance => {
        return distance < 0 ? NaN : distance;
      }, true);
    }
  }

  /** @inheritDoc */
  public onGtcInteractionEvent(): boolean {
    return false;
  }

  /** @inheritDoc */
  public onPause(): void {
    this.runways.pause();
    this.distanceRequiredPipe?.pause();
    this.weightPipe?.pause();
  }

  /** @inheritDoc */
  public onResume(): void {
    this.runways.resume();
    this.distanceRequiredPipe?.resume(true);
    this.weightPipe?.resume(true);
  }

  /**
   * Sends a command to the TOLD computer to load takeoff data into landing data for an emergency return.
   */
  private loadEmergencyReturn(): void {
    this.props.gtcService.bus.getPublisher<ToldControlEvents>().pub('told_load_emergency_return', undefined, true, false);
  }

  /**
   * Opens a dialog chain to select this tab's distance required parameter.
   */
  private async selectDistanceRequired(): Promise<void> {
    const unitsMode = this.props.unitsSettingManager.getSetting('unitsDistance').value === UnitsDistanceSettingMode.Metric ? 'meters' : 'feet';

    const result = await this.props.gtcService.openPopup<GtcRunwayLengthDialog>(GtcViewKeys.RunwayLengthDialog)
      .ref.request({
        title: this.props.isTakeoff ? 'Required Takeoff DIS' : 'Required Landing DIS',
        initialValue: Math.max(this.requiredDistanceSetting.value, 0),
        initialUnit: UnitType.FOOT,
        unitsMode
      });

    if (!result.wasCancelled) {
      this.requiredDistanceSetting.value = result.payload.unit.convertTo(result.payload.value, UnitType.FOOT);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='told-data-page-origindest'>
        <div class='told-data-page-origindest-left'>
          <GtcImgTouchButton
            label='Flight Plan'
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_small_fplan.png`}
            onPressed={() => this.props.gtcService.changePageTo(GtcViewKeys.FlightPlan)}
            class='gtc-directory-button told-data-page-origindest-fpl-button'
          />
          {!this.props.isTakeoff && this.props.supportPerformance && (
            <>
              <GtcTouchButton
                label='Load<br>Emergency<br>Return'
                onPressed={this.loadEmergencyReturn.bind(this)}
                class='told-data-page-origindest-left-button'
              />
              <GtcListSelectTouchButton
                gtcService={this.props.gtcService}
                listDialogKey={GtcViewKeys.ListDialog1}
                label='WT Source'
                state={this.props.toldSettingManager.getSetting('toldLandingUsePredictedWeight')}
                renderValue={state => state ? 'Predicted' : 'Current'}
                listParams={state => {
                  return {
                    title: 'WT Source',
                    inputData: [
                      {
                        value: false,
                        labelRenderer: () => 'Current'
                      },
                      {
                        value: true,
                        labelRenderer: () => 'Predicted',
                        isEnabled: this.props.toldSettingManager.getSetting('toldLandingCanUsePredictedWeight').value
                      }
                    ],
                    selectedValue: state
                  };
                }}
                class='told-data-page-origindest-left-button'
              />
            </>
          )}
        </div>
        <div class='told-data-page-origindest-right gtc-panel'>
          <GtcWaypointSelectButton
            gtcService={this.props.gtcService}
            type={FacilitySearchType.Airport}
            waypoint={this.props.selectedAirport}
            waypointCache={this.props.facWaypointCache}
            nullIdent='––––'
            class='told-data-page-origindest-right-button told-data-page-origindest-airport-button'
          />
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            isEnabled={this.runways.map(runways => runways.length > 0)}
            label='Runway'
            state={this.props.selectedRunway}
            renderValue={runway => runway === null ? '___' : RunwayUtils.getRunwayNameString(runway.direction, runway.runwayDesignator, true)}
            listParams={() => {
              return {
                title: 'Select Runway',
                inputData: this.runways.get().map(runway => {
                  return {
                    value: runway,
                    labelRenderer: () => {
                      return (
                        <GtcToldRunwayDisplay
                          runway={runway}
                          includeDisplacedThreshold={true}
                          unitsSettingManager={this.props.unitsSettingManager}
                          class='told-data-page-origindest-runway-display'
                        />
                      );
                    }
                  };
                }),
                listItemHeightPx: this.runwayListItemHeightPx,
                listItemSpacingPx: this.runwayListItemSpacingPx,
                itemsPerPage: 4,
                class: 'gtc-list-dialog-wide'
              };
            }}
            class='told-data-page-origindest-right-button told-data-page-origindest-runway-button'
          />
          {
            this.props.supportPerformance
              ? (
                <>
                  <div class='told-data-page-origindest-tow-label'>{this.props.isTakeoff ? 'Takeoff Weight' : 'Landing Weight'}</div>
                  <NumberUnitDisplay
                    value={this.weight}
                    displayUnit={this.props.unitsSettingManager.weightUnits}
                    formatter={GtcToldDataPageOriginDestTab.WEIGHT_FORMATTER}
                    class='told-data-page-origindest-tow-value'
                  />
                </>
              )
              : (
                <GtcValueTouchButton
                  state={this.distanceRequired}
                  label={this.props.isTakeoff ? 'Required Takeoff DIS' : 'Required Landing DIS'}
                  renderValue={
                    <NumberUnitDisplay
                      value={this.distanceRequired}
                      displayUnit={this.props.unitsSettingManager.distanceUnitsSmall}
                      formatter={GtcToldDataPageOriginDestTab.LENGTH_FORMATTER}
                    />
                  }
                  onPressed={this.selectDistanceRequired.bind(this)}
                  class='told-data-page-origindest-right-button told-data-page-origindest-required-dis-button'
                />
              )
          }
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.runways.destroy();

    this.distanceRequiredPipe?.destroy();
    this.weightPipe?.destroy();

    super.destroy();
  }
}