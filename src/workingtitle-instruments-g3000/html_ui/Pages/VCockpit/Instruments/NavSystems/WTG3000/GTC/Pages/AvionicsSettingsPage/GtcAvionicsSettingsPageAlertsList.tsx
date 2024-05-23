import {
  ComponentProps, DisplayComponent, FSComponent, NumberFormatter, Subject, Subscribable, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import {
  ControllableDisplayPaneIndex, NumberUnitDisplay, TouchdownCalloutOptions, TouchdownCalloutsConfig,
  TouchdownCalloutUserSettings
} from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List/GtcList';
import { GtcListItem } from '../../Components/List/GtcListItem';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
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
  private static readonly ALTITUDE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '____' });

  private readonly listRef = FSComponent.createRef<GtcList<any>>();

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.props.gtcService.bus);
  private readonly touchdownCalloutsManager = TouchdownCalloutUserSettings.getManager(this.props.gtcService.bus);

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
        class='avionics-settings-page-tab-list'
      >
        <GtcListItem class='avionics-settings-page-row'>
          <GtcToggleTouchButton
            state={Subject.create(false)}
            label={'BARO Transition\nALT Climb'}
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='avionics-settings-page-row-left'
          />
          <GtcTouchButton
            label={
              <NumberUnitDisplay
                value={UnitType.FOOT.createNumber(18000)}
                displayUnit={this.unitsSettingManager.altitudeUnits}
                formatter={GtcAvionicsSettingsPageAlertsList.ALTITUDE_FORMATTER}
              />
            }
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='avionics-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='avionics-settings-page-row'>
          <GtcToggleTouchButton
            state={Subject.create(false)}
            label={'BARO Transition\nLVL Descent'}
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='avionics-settings-page-row-left'
          />
          <GtcTouchButton
            label='FL180'
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
            class='avionics-settings-page-row-right'
          />
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
                    formatter={GtcAvionicsSettingsPageAlertsList.ALTITUDE_FORMATTER}
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

    super.destroy();
  }
}