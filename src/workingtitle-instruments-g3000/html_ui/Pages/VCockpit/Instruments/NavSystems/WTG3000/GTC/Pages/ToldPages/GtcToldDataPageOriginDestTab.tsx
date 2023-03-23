import {
  ComponentProps, DisplayComponent, FacilitySearchType, FSComponent, MutableSubscribable, NumberFormatter, NumberUnitSubject,
  OneWayRunway, RunwayUtils, Subscription, UnitType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';
import { AirportWaypoint, GarminFacilityWaypointCache, NumberUnitDisplay, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { G3000FmsUtils, ToldControlEvents, ToldUserSettingTypes } from '@microsoft/msfs-wtg3000-common';
import { GtcImgTouchButton } from '../../Components/TouchButton/GtcImgTouchButton';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcWaypointSelectButton } from '../../Components/TouchButton/GtcWaypointSelectButton';
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
}

/**
 * A GTC TOLD (takeoff/landing) data page origin/destination tab.
 */
export class GtcToldDataPageOriginDestTab extends DisplayComponent<GtcToldDataPageOriginDestTabProps> implements GtcToldDataPageTabContent {
  private static readonly WEIGHT_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '_____' });

  private thisNode?: VNode;

  private readonly runways = this.props.selectedAirport.map(origin => {
    if (origin === null) {
      return [];
    }

    return RunwayUtils.getOneWayRunwaysFromAirport(origin.facility.get()).sort(G3000FmsUtils.sortOneWayRunway);
  }).pause();

  private readonly runwayListItemHeightPx = this.props.gtcService.isHorizontal ? 162 : 86;
  private readonly runwayListItemSpacingPx = this.props.gtcService.isHorizontal ? 2 : 1;

  private readonly weight = NumberUnitSubject.create(UnitType.POUND.createNumber(NaN));

  private weightPipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    if (this.props.isTakeoff) {
      this.weightPipe = this.props.toldSettingManager.getSetting('toldTakeoffWeight').pipe(this.weight, tow => {
        return tow < 0 ? NaN : tow;
      }, true);
    } else {
      this.weightPipe = this.props.toldSettingManager.getSetting('toldLandingWeight').pipe(this.weight, tow => {
        return tow < 0 ? NaN : tow;
      }, true);
    }
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(): boolean {
    return false;
  }

  /** @inheritdoc */
  public onPause(): void {
    this.runways.pause();
    this.weightPipe?.pause();
  }

  /** @inheritdoc */
  public onResume(): void {
    this.runways.resume();
    this.weightPipe?.resume(true);
  }

  /**
   * Sends a command to the TOLD computer to load takeoff data into landing data for an emergency return.
   */
  private loadEmergencyReturn(): void {
    this.props.gtcService.bus.getPublisher<ToldControlEvents>().pub('told_load_emergency_return', undefined, true, false);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='told-data-page-origindest'>
        <div class='told-data-page-origindest-left'>
          <GtcImgTouchButton
            label='Flight Plan'
            imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_fplan.png'
            onPressed={() => this.props.gtcService.changePageTo(GtcViewKeys.FlightPlan)}
            class='gtc-directory-button told-data-page-origindest-fpl-button'
          />
          {!this.props.isTakeoff && (
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
          <div class='told-data-page-origindest-tow-label'>{this.props.isTakeoff ? 'Takeoff Weight' : 'Landing Weight'}</div>
          <NumberUnitDisplay
            value={this.weight}
            displayUnit={this.props.unitsSettingManager.weightUnits}
            formatter={GtcToldDataPageOriginDestTab.WEIGHT_FORMATTER}
            class='told-data-page-origindest-tow-value'
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.runways.destroy();

    this.weightPipe?.destroy();

    super.destroy();
  }
}