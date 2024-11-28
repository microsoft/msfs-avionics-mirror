import { FSComponent, Subject, UnitType, UserSettingManager, VNode } from '@microsoft/msfs-sdk';
import { NumberUnitDisplay, WeatherMapOrientationSettingMode } from '@microsoft/msfs-garminsdk';
import { ConnextMapCombinedUserSettingTypes, ConnextMapUserSettings, ControllableDisplayPaneIndex } from '@microsoft/msfs-wtg3000-common';
import { GtcList } from '../../Components/List/GtcList';
import { GtcListItem } from '../../Components/List/GtcListItem';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcValueTouchButton } from '../../Components/TouchButton/GtcValueTouchButton';
import { GtcWaypointButton } from '../../Components/TouchButton/GtcWaypointButton';
import { GtcGenericView } from '../../GtcService/GtcGenericView';
import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';

import './GtcConnextWeatherSettingsPage.css';

/**
 * GTC view keys for popups owned by the Connext weather settings page.
 */
enum GtcConnextWeatherSettingsPagePopupKeys {
  ConnextDataCoverage = 'ConnextDataCoverage'
}

/**
 * A GTC Connext weather settings page.
 */
export class GtcConnextWeatherSettingsPage extends GtcView {
  private thisNode?: VNode;

  private readonly listRef = FSComponent.createRef<GtcList<any>>();

  private readonly displayPaneIndex: ControllableDisplayPaneIndex;

  private readonly mapSettingManager: UserSettingManager<ConnextMapCombinedUserSettingTypes>;

  private readonly listItemHeight = this.props.gtcService.isHorizontal ? 129 : 68;
  private readonly listItemSpacing = 1;

  /**
   * Constructor.
   * @param props This component's props.
   * @throws Error if a display pane index is not defined for this view.
   */
  public constructor(props: GtcViewProps) {
    super(props);

    if (this.props.displayPaneIndex === undefined) {
      throw new Error('GtcConnextWeatherSettingsPage: display pane index was not defined');
    }

    this.displayPaneIndex = this.props.displayPaneIndex;
    this.mapSettingManager = ConnextMapUserSettings.getDisplayPaneCombinedManager(this.bus, this.displayPaneIndex);
  }

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcConnextWeatherSettingsPagePopupKeys.ConnextDataCoverage,
      this.props.controlMode,
      this.renderDataCoveragePopup.bind(this),
      this.props.displayPaneIndex
    );

    this._title.set('Connext Weather Settings');

    this._activeComponent.set(this.listRef.instance);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='connext-weather-settings'>
        <div class='connext-weather-settings-data gtc-panel'>
          <div class='connext-weather-settings-data-status'>
            <div class='connext-weather-settings-data-status-title'>Data Request</div>
            <div class='connext-weather-settings-data-status-value'>
              Completed
            </div>
          </div>
          <GtcTouchButton
            label='Define Coverage'
            onPressed={() => { this.props.gtcService.openPopup(GtcConnextWeatherSettingsPagePopupKeys.ConnextDataCoverage); }}
            class='connext-weather-settings-coverage-button'
          />
          <GtcValueTouchButton
            state={Subject.create('On')}
            label='Auto<br>Request'
            isEnabled={false}
            class='connext-weather-settings-auto-request-button'
          />
          <GtcTouchButton
            label='Send<br>Immediate<br>Request'
            isEnabled={false}
            class='connext-weather-settings-request-button'
          />
        </div>
        <div class='connext-weather-settings-bottom'>
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.mapSettingManager.getSetting('weatherMapOrientation')}
            label='Orientation'
            renderValue={(value): string => {
              switch (value) {
                case WeatherMapOrientationSettingMode.HeadingUp:
                  return 'Heading Up';
                case WeatherMapOrientationSettingMode.TrackUp:
                  return 'Track Up';
                case WeatherMapOrientationSettingMode.NorthUp:
                  return 'North Up';
                case WeatherMapOrientationSettingMode.SyncToNavMap:
                  return 'Sync to Nav Map';
                default:
                  return '';
              }
            }}
            listParams={{
              title: 'Map Orientation',
              inputData: [
                {
                  value: WeatherMapOrientationSettingMode.HeadingUp,
                  labelRenderer: () => 'Heading Up'
                },
                {
                  value: WeatherMapOrientationSettingMode.TrackUp,
                  labelRenderer: () => 'Track Up'
                },
                {
                  value: WeatherMapOrientationSettingMode.NorthUp,
                  labelRenderer: () => 'North Up'
                },
                {
                  value: WeatherMapOrientationSettingMode.SyncToNavMap,
                  labelRenderer: () => 'Sync to Nav Map'
                }
              ],
              selectedValue: this.mapSettingManager.getSetting('weatherMapOrientation')
            }}
            class='connext-weather-settings-orientation-button'
          />
          <GtcTouchButton
            label='Legend'
            isEnabled={false}
            class='connext-weather-settings-legend-button'
          />
        </div>
        <div class='connext-weather-settings-overlays gtc-panel'>
          <div class='connext-weather-settings-overlays-title'>Overlays</div>
          <GtcList
            ref={this.listRef}
            bus={this.bus}
            listItemHeightPx={this.listItemHeight}
            listItemSpacingPx={this.listItemSpacing}
            itemsPerPage={5}
            sidebarState={this._sidebarState}
            class='connext-weather-settings-overlays-list'
          >
            <GtcListItem class='connext-weather-settings-overlays-list-row'>
              <GtcToggleTouchButton
                state={this.mapSettingManager.getSetting('connextMapRadarOverlayShow')}
                label='Radar'
                isInList
                gtcOrientation={this.props.gtcService.orientation}
                class='connext-weather-settings-overlays-list-row-left'
              />
            </GtcListItem>
            <GtcListItem class='connext-weather-settings-overlays-list-row'>
              <GtcToggleTouchButton
                state={Subject.create(false)}
                label='Cloud Tops'
                isEnabled={false}
                isInList
                gtcOrientation={this.props.gtcService.orientation}
                class='connext-weather-settings-overlays-list-row-left'
              />
            </GtcListItem>
            <GtcListItem class='connext-weather-settings-overlays-list-row'>
              <GtcToggleTouchButton
                state={Subject.create(false)}
                label='METARs'
                isEnabled={false}
                isInList
                gtcOrientation={this.props.gtcService.orientation}
                class='connext-weather-settings-overlays-list-row-left'
              />
            </GtcListItem>
            <GtcListItem class='connext-weather-settings-overlays-list-row'>
              <GtcToggleTouchButton
                state={Subject.create(false)}
                label='Lightning'
                isEnabled={false}
                isInList
                gtcOrientation={this.props.gtcService.orientation}
                class='connext-weather-settings-overlays-list-row-left'
              />
            </GtcListItem>
            <GtcListItem class='connext-weather-settings-overlays-list-row'>
              <GtcToggleTouchButton
                state={Subject.create(false)}
                label='Winds Aloft'
                isEnabled={false}
                isInList
                gtcOrientation={this.props.gtcService.orientation}
                class='connext-weather-settings-overlays-list-row-left'
              />
              <GtcTouchButton
                label='Surface'
                isEnabled={false}
                isInList
                gtcOrientation={this.props.gtcService.orientation}
                class='connext-weather-settings-overlays-list-row-right'
              />
            </GtcListItem>
            <GtcListItem class='connext-weather-settings-overlays-list-row'>
              <GtcToggleTouchButton
                state={Subject.create(false)}
                label='SIGMETs'
                isEnabled={false}
                isInList
                gtcOrientation={this.props.gtcService.orientation}
                class='connext-weather-settings-overlays-list-row-left'
              />
            </GtcListItem>
            <GtcListItem class='connext-weather-settings-overlays-list-row'>
              <GtcToggleTouchButton
                state={Subject.create(false)}
                label='AIRMETs'
                isEnabled={false}
                isInList
                gtcOrientation={this.props.gtcService.orientation}
                class='connext-weather-settings-overlays-list-row-left'
              />
            </GtcListItem>
            <GtcListItem class='connext-weather-settings-overlays-list-row'>
              <GtcToggleTouchButton
                state={Subject.create(false)}
                label='IR Satellite'
                isEnabled={false}
                isInList
                gtcOrientation={this.props.gtcService.orientation}
                class='connext-weather-settings-overlays-list-row-left'
              />
            </GtcListItem>
            <GtcListItem class='connext-weather-settings-overlays-list-row'>
              <GtcToggleTouchButton
                state={Subject.create(false)}
                label='AIREPs'
                isEnabled={false}
                isInList
                gtcOrientation={this.props.gtcService.orientation}
                class='connext-weather-settings-overlays-list-row-left'
              />
            </GtcListItem>
            <GtcListItem class='connext-weather-settings-overlays-list-row'>
              <GtcToggleTouchButton
                state={Subject.create(false)}
                label='PIREPs'
                isEnabled={false}
                isInList
                gtcOrientation={this.props.gtcService.orientation}
                class='connext-weather-settings-overlays-list-row-left'
              />
            </GtcListItem>
            <GtcListItem class='connext-weather-settings-overlays-list-row'>
              <GtcToggleTouchButton
                state={Subject.create(false)}
                label='TFRs'
                isEnabled={false}
                isInList
                gtcOrientation={this.props.gtcService.orientation}
                class='connext-weather-settings-overlays-list-row-left'
              />
            </GtcListItem>
            <GtcListItem class='connext-weather-settings-overlays-list-row'>
              <GtcToggleTouchButton
                state={Subject.create(false)}
                label='TAFs'
                isEnabled={false}
                isInList
                gtcOrientation={this.props.gtcService.orientation}
                class='connext-weather-settings-overlays-list-row-left'
              />
            </GtcListItem>
          </GtcList>
        </div>
      </div>
    );
  }

  /**
   * Renders this page's data coverage popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns This page's data coverage popup, as a VNode.
   */
  private renderDataCoveragePopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    let node: VNode | undefined;

    const diameter = Subject.create(UnitType.NMILE.createNumber(200));

    return (
      <GtcGenericView
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        title='Connext Weather Coverage'
        onDestroy={(): void => {
          node && FSComponent.shallowDestroy(node);
        }}
      >
        {node = (
          <div class='connext-coverage-popup'>
            <GtcValueTouchButton
              state={diameter}
              label='Diameter/Width'
              renderValue={
                <NumberUnitDisplay
                  value={diameter}
                  displayUnit={null}
                  formatter={value => value.toFixed(0)}
                />
              }
              isEnabled={false}
              class='connext-coverage-popup-diameter-button'
            />
            <div class='connext-coverage-popup-options'>
              <div class='connext-coverage-popup-options-row'>
                <GtcToggleTouchButton
                  state={Subject.create(true)}
                  label='P.POS'
                  isEnabled={false}
                  class='connext-coverage-popup-options-button-left'
                />
              </div>
              <div class='connext-coverage-popup-options-row'>
                <GtcToggleTouchButton
                  state={Subject.create(false)}
                  label='Destination'
                  isEnabled={false}
                  class='connext-coverage-popup-options-button-left'
                />
              </div>
              <div class='connext-coverage-popup-options-row connext-coverage-popup-options-row-panel'>
                <GtcToggleTouchButton
                  state={Subject.create(false)}
                  label='Flight Plan'
                  isEnabled={false}
                  class='connext-coverage-popup-options-button-left'
                />
                <GtcTouchButton
                  label='Remaining FPL'
                  isEnabled={false}
                  class='connext-coverage-popup-options-button-right connext-coverage-popup-options-fpl-button-right'
                />
              </div>
              <div class='connext-coverage-popup-options-row connext-coverage-popup-options-row-panel'>
                <GtcToggleTouchButton
                  state={Subject.create(false)}
                  label='Waypoint'
                  isEnabled={false}
                  class='connext-coverage-popup-options-button-left'
                />
                <GtcWaypointButton
                  waypoint={Subject.create(null)}
                  nullIdent={'______'}
                  isEnabled={false}
                  class='connext-coverage-popup-options-button-right'
                />
              </div>
            </div>
          </div>
        )}
      </GtcGenericView>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}