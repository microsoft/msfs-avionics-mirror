import {
  ComponentProps, DisplayComponent, FSComponent, NumberFormatter, NumberUnitSubject, Subject, Subscribable,
  Subscription, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { UnitsAltitudeSettingMode, UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import {
  BaroTransitionAlertUserSettings, ControllableDisplayPaneIndex, G3000FilePaths, GtcViewKeys, NumberUnitDisplay,
  TouchdownCalloutOptions, TouchdownCalloutsConfig, TouchdownCalloutUserSettings
} from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List/GtcList';
import { GtcListItem } from '../../Components/List/GtcListItem';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcBaroTransitionAlertAltitudeDialog } from '../../Dialog/GtcBaroTransitionAlertAltitudeDialog';
import { GtcGenericView } from '../../GtcService/GtcGenericView';
import { GtcInteractionEvent } from '../../GtcService/GtcInteractionEvent';
import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcAvionicsSettingsPageTabContent } from './GtcAvionicsSettingsPageTabContent';

import './GtcAvionicsSettingsPageAlertsList.css';

/**
 * Component props for GtcAvionicsSettingsPageAlertsList.
 */
export interface GtcAvionicsSettingsPageAlertsListProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** The GTC control mode to which this list's parent view belongs. */
  controlMode: GtcControlMode;

  /** The index of the display pane that this list's parent view is tied to. */
  displayPaneIndex?: ControllableDisplayPaneIndex;

  /** The height of each list item, in pixels. */
  listItemHeight: number;

  /** The spacing between each list item, in pixels. */
  listItemSpacing: number;

  /** The SidebarState to use. */
  sidebarState?: SidebarState | Subscribable<SidebarState | null>;

  /**
   * A touchdown callouts configuration object. If not defined, then the list will not support user configuration of
   * touchdown callout alerts.
   */
  touchdownCalloutsConfig?: TouchdownCalloutsConfig;
}

/**
 * GTC view keys for popups owned by the avionics settings page alerts tab.
 */
enum GtcAvionicsSettingsPageAlertsPopupKeys {
  TouchdownCallouts = 'TouchdownCallouts'
}

/**
 * A GTC avionics settings page alerts settings list.
 */
export class GtcAvionicsSettingsPageAlertsList extends DisplayComponent<GtcAvionicsSettingsPageAlertsListProps> implements GtcAvionicsSettingsPageTabContent {
  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, nanString: '__._' });
  private static readonly BARO_ALERT_ALTITUDE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '–––––' });
  private static readonly TOUCHDOWN_ALTITUDE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '____' });

  private readonly listRef = FSComponent.createRef<GtcList<any>>();

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.props.gtcService.bus);
  private readonly baroTransitionAlertSettingManager = BaroTransitionAlertUserSettings.getManager(this.props.gtcService.bus);
  private readonly touchdownCalloutsManager = TouchdownCalloutUserSettings.getManager(this.props.gtcService.bus);

  private readonly baroTransitionAlertAltitudeValue = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));
  private readonly baroTransitionAlertAltitudeEditIconHidden = this.baroTransitionAlertSettingManager.getSetting('baroTransitionAlertAltitudeManualThreshold')
    .map(threshold => threshold < 0);

  private readonly baroTransitionAlertLevelValueText = this.baroTransitionAlertSettingManager.getSetting('baroTransitionAlertLevelThreshold')
    .map(threshold => `FL${threshold >= 0 ? (threshold / 100).toFixed(0).padStart(3, '0') : '–––'}`);
  private readonly baroTransitionAlertLevelEditIconHidden = this.baroTransitionAlertSettingManager.getSetting('baroTransitionAlertLevelManualThreshold')
    .map(threshold => threshold < 0);

  private readonly subscriptions: Subscription[] = [
    this.baroTransitionAlertAltitudeEditIconHidden,
    this.baroTransitionAlertLevelValueText,
    this.baroTransitionAlertLevelEditIconHidden,
  ];

  /** @inheritdoc */
  public onAfterRender(): void {
    if (this.props.touchdownCalloutsConfig?.isUserConfigurable === true) {
      this.props.gtcService.registerView(
        GtcViewLifecyclePolicy.Transient,
        GtcAvionicsSettingsPageAlertsPopupKeys.TouchdownCallouts,
        this.props.controlMode,
        this.renderTouchdownCalloutsPopup.bind(this, Object.values(this.props.touchdownCalloutsConfig.options)),
        this.props.displayPaneIndex
      );
    }

    this.subscriptions.push(
      this.baroTransitionAlertSettingManager.getSetting('baroTransitionAlertAltitudeThreshold')
        .pipe(this.baroTransitionAlertAltitudeValue, threshold => threshold >= 0 ? threshold : NaN)
    );
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    return this.listRef.instance.onGtcInteractionEvent(event);
  }

  /** @inheritdoc */
  public onPause(): void {
    // noop
  }

  /** @inheritdoc */
  public onResume(): void {
    // noop
  }

  /**
   * Responds to when this list's Baro Transition ALT Climb value button is pressed.
   */
  private async onBaroTransitionAlertAltitudePressed(): Promise<void> {
    const manualThresholdSetting = this.baroTransitionAlertSettingManager.getSetting('baroTransitionAlertAltitudeManualThreshold');
    const autoThresholdSetting = this.baroTransitionAlertSettingManager.getSetting('baroTransitionAlertAltitudeAutoThreshold');

    const unitsMode = this.unitsSettingManager.getSetting('unitsAltitude').get() === UnitsAltitudeSettingMode.Meters ? 'meters' : 'feet';

    const result = await this.props.gtcService
      .openPopup<GtcBaroTransitionAlertAltitudeDialog>(GtcViewKeys.BaroTransitionAlertAltitudeDialog)
      .ref.request({
        title: 'BARO Transition ALT Climb',
        unitsMode,
        initialValue: Math.max(this.baroTransitionAlertSettingManager.getSetting('baroTransitionAlertAltitudeThreshold').get(), 0),
        initialUnit: UnitType.FOOT,
        enableRevert: manualThresholdSetting.get() >= 0,
        revertDialogMessage: () => {
          const autoThreshold = autoThresholdSetting.get();
          return (
            <div>
              <span>Revert to auto selection of published altitude</span>
              {
                autoThreshold >= 0
                  ? (
                    <span>
                      <br />(currently {autoThreshold.toFixed(0)}<span class='numberunit-unit-small'>{unitsMode === 'meters' ? 'M' : 'FT'}</span>)
                    </span>
                  )
                  : null
              }
              <span>?</span>
            </div>
          );
        }
      });

    if (result.wasCancelled) {
      return;
    }

    if (result.payload.type === 'revert') {
      manualThresholdSetting.set(-1);
    } else {
      manualThresholdSetting.set(UnitType.FOOT.convertFrom(result.payload.value, result.payload.unit));
    }
  }

  /**
   * Responds to when this list's Baro Transition LVL Descent value button is pressed.
   */
  private async onBaroTransitionAlertLevelPressed(): Promise<void> {
    const manualThresholdSetting = this.baroTransitionAlertSettingManager.getSetting('baroTransitionAlertLevelManualThreshold');
    const autoThresholdSetting = this.baroTransitionAlertSettingManager.getSetting('baroTransitionAlertLevelAutoThreshold');

    const result = await this.props.gtcService
      .openPopup<GtcBaroTransitionAlertAltitudeDialog>(GtcViewKeys.BaroTransitionAlertAltitudeDialog)
      .ref.request({
        title: 'BARO Transition LVL Descent',
        unitsMode: 'flightlevel',
        initialValue: Math.max(this.baroTransitionAlertSettingManager.getSetting('baroTransitionAlertLevelThreshold').get(), 0),
        initialUnit: UnitType.FOOT,
        enableRevert: manualThresholdSetting.get() >= 0,
        revertDialogMessage: () => {
          const autoThreshold = autoThresholdSetting.get();
          return (
            <div>
              <span>Revert to auto selection of published level</span>
              {
                autoThreshold >= 0
                  ? (
                    <span>
                      <br />(currently FL{(autoThreshold / 100).toFixed(0).padStart(3, '0')})
                    </span>
                  )
                  : null
              }
              <span>?</span>
            </div>
          );
        }
      });

    if (result.wasCancelled) {
      return;
    }

    if (result.payload.type === 'revert') {
      manualThresholdSetting.set(-1);
    } else {
      manualThresholdSetting.set(UnitType.FOOT.convertFrom(result.payload.value, result.payload.unit));
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GtcList
        ref={this.listRef}
        bus={this.props.gtcService.bus}
        itemsPerPage={4}
        listItemHeightPx={this.props.listItemHeight}
        listItemSpacingPx={this.props.listItemSpacing}
        sidebarState={this.props.sidebarState}
        class='avionics-settings-page-tab-list avionics-settings-page-alerts-list'
      >
        <GtcListItem class='avionics-settings-page-row'>
          <GtcToggleTouchButton
            state={this.baroTransitionAlertSettingManager.getSetting('baroTransitionAlertAltitudeEnabled')}
            label={'BARO Transition\nALT Climb'}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='avionics-settings-page-row-left'
          />
          <GtcTouchButton
            label={
              <NumberUnitDisplay
                value={this.baroTransitionAlertAltitudeValue}
                displayUnit={this.unitsSettingManager.altitudeUnits}
                formatter={GtcAvionicsSettingsPageAlertsList.BARO_ALERT_ALTITUDE_FORMATTER}
              />
            }
            onPressed={this.onBaroTransitionAlertAltitudePressed.bind(this)}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='avionics-settings-page-row-right'
          >
            <img
              src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_pencil.png`}
              class={{
                'avionics-settings-page-baro-trans-alert-edit-icon': true,
                'hidden': this.baroTransitionAlertAltitudeEditIconHidden
              }}
            />
          </GtcTouchButton>
        </GtcListItem>
        <GtcListItem class='avionics-settings-page-row'>
          <GtcToggleTouchButton
            state={this.baroTransitionAlertSettingManager.getSetting('baroTransitionAlertLevelEnabled')}
            label={'BARO Transition\nLVL Descent'}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='avionics-settings-page-row-left'
          />
          <GtcTouchButton
            label={this.baroTransitionAlertLevelValueText}
            onPressed={this.onBaroTransitionAlertLevelPressed.bind(this)}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='avionics-settings-page-row-right'
          >
            <img
              src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_pencil.png`}
              class={{
                'avionics-settings-page-baro-trans-alert-edit-icon': true,
                'hidden': this.baroTransitionAlertLevelEditIconHidden
              }}
            />
          </GtcTouchButton>
        </GtcListItem>
        <GtcListItem class='avionics-settings-page-row'>
          <GtcToggleTouchButton
            state={Subject.create(false)}
            label='Arrival Alert'
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='avionics-settings-page-row-left'
          />
          <GtcTouchButton
            label={
              <NumberUnitDisplay
                value={UnitType.NMILE.createNumber(1)}
                displayUnit={this.unitsSettingManager.distanceUnitsLarge}
                formatter={GtcAvionicsSettingsPageAlertsList.DISTANCE_FORMATTER}
              />
            }
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='avionics-settings-page-row-right'
          />
        </GtcListItem>
        {this.props.touchdownCalloutsConfig?.isUserConfigurable === true && (
          <GtcListItem class='avionics-settings-page-row'>
            <GtcToggleTouchButton
              state={this.touchdownCalloutsManager.getSetting('touchdownCalloutMasterEnabled')}
              label={'Touchdown\nCallouts'}
              isInList
              gtcOrientation={this.props.gtcService.orientation}
              class='avionics-settings-page-row-left'
            />
            <GtcTouchButton
              label='Settings'
              isEnabled={this.touchdownCalloutsManager.getSetting('touchdownCalloutMasterEnabled')}
              onPressed={() => { this.props.gtcService.openPopup(GtcAvionicsSettingsPageAlertsPopupKeys.TouchdownCallouts); }}
              isInList
              gtcOrientation={this.props.gtcService.orientation}
              class='avionics-settings-page-row-right avionics-settings-page-touchdown-settings-button'
            />
          </GtcListItem>
        )}
      </GtcList>
    );
  }

  /**
   * Renders the touchdown callouts popup.
   * @param calloutOptions Options for each callout altitude.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns The touchdown callouts popup, as a VNode.
   */
  private renderTouchdownCalloutsPopup(
    calloutOptions: Iterable<Readonly<TouchdownCalloutOptions>>,
    gtcService: GtcService,
    controlMode: GtcControlMode,
    displayPaneIndex?: ControllableDisplayPaneIndex
  ): VNode {
    const sortedCalloutOptions = Array.from(calloutOptions).sort((a, b) => b.altitude - a.altitude);

    const buttonRefs = sortedCalloutOptions.map(() => FSComponent.createRef<DisplayComponent<any>>());

    return (
      <GtcGenericView
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        title='Touchdown Callouts'
        onDestroy={(): void => {
          buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });
        }}
      >
        <div class='touchdown-callouts-popup gtc-popup-panel'>
          {sortedCalloutOptions.map((options, index) => {
            return (
              <GtcToggleTouchButton
                ref={buttonRefs[index]}
                state={this.touchdownCalloutsManager.getEnabledSetting(options.altitude)}
                label={
                  <NumberUnitDisplay
                    value={UnitType.FOOT.createNumber(options.altitude)}
                    displayUnit={null}
                    formatter={GtcAvionicsSettingsPageAlertsList.TOUCHDOWN_ALTITUDE_FORMATTER}
                  />
                }
                isEnabled={options.userConfigurable}
              />
            );
          })}
        </div>
      </GtcGenericView>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
