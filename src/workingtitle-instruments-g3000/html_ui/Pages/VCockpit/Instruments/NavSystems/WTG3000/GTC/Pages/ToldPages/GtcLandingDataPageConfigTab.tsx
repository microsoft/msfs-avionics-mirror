/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ArrayUtils, ComponentProps, DisplayComponent, FSComponent, MathUtils, Subscribable, UnitType, UserSettingManager, VNode } from '@microsoft/msfs-sdk';
import { UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { ControllableDisplayPaneIndex, LandingPerfConfigurationOptions, ToldThrustReverserSelectable, ToldUserSettingTypes } from '@microsoft/msfs-wtg3000-common';
import { GtcList } from '../../Components/List/GtcList';
import { GtcListItem } from '../../Components/List/GtcListItem';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcValueTouchButton } from '../../Components/TouchButton/GtcValueTouchButton';
import { GtcInteractionEvent } from '../../GtcService/GtcInteractionEvent';
import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcToldConfigDefaultsPopup, GtcToldConfigDefaultsPopupOption } from './GtcToldConfigDefaultsPopup';
import { GtcToldDataPageTabContent } from './GtcToldDataPageTabContent';
import { GtcToldFactorDialog } from './GtcToldFactorDialog';

import './GtcToldDataPageConfigTab.css';

/**
 * Component props for GtcLandingDataPageConfigTab.
 */
export interface GtcLandingDataPageConfigTabProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** The GTC control mode to which the tab's parent view belongs. */
  controlMode: GtcControlMode;

  /** The index of the display pane that the tab's parent view is tied to. */
  displayPaneIndex?: ControllableDisplayPaneIndex;

  /** Landing performance calculation configuration option definitions. */
  options: Readonly<LandingPerfConfigurationOptions>;

  /** A manager for TOLD performance calculation user settings. */
  toldSettingManager: UserSettingManager<ToldUserSettingTypes>;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** The SidebarState to use. */
  sidebarState: SidebarState | Subscribable<SidebarState | null>;
}

/**
 * GTC view keys for popups owned by landing data page config tabs.
 */
enum GtcLandingDataPageConfigTabPopupKeys {
  LandingConfigDefaults = 'LandingConfigDefaults'
}

/**
 * A GTC landing data page config tab.
 */
export class GtcLandingDataPageConfigTab extends DisplayComponent<GtcLandingDataPageConfigTabProps> implements GtcToldDataPageTabContent {
  private static readonly FACTOR_FORMATTER = (value: number): string => (value / 100).toFixed(2);

  private thisNode?: VNode;

  private readonly listRef = FSComponent.createRef<GtcList<any>>();

  private readonly flapsOptions = this.props.options.flaps;
  private readonly antiIceOptions = this.props.options.antiIce;
  private readonly thrustReverserOptions = this.props.options.thrustReverser;
  private readonly autothrottleOptions = this.props.options.autothrottle;

  private readonly runwaySurfaceSetting = this.props.toldSettingManager.getSetting('toldLandingRunwaySurface');
  private readonly flapsIndexSetting = this.props.toldSettingManager.getSetting('toldLandingFlapsIndex');
  private readonly antiIceOnSetting = this.props.toldSettingManager.getSetting('toldLandingAntiIceOn');
  private readonly factorSetting = this.props.toldSettingManager.getSetting('toldLandingFactor');

  private readonly isAntiIceAllowed = this.antiIceOptions === undefined
    ? undefined
    : this.props.toldSettingManager.getSetting('toldLandingTemperature').map(temp => temp > Number.MIN_SAFE_INTEGER && temp <= this.antiIceOptions!.maxTemp.asUnit(UnitType.CELSIUS));

  private readonly thrustReverserChecker = this.thrustReverserOptions?.selectable.resolve();

  private readonly listItemHeight = this.props.gtcService.orientation === 'horizontal' ? 133 : 69;
  private readonly listItemSpacing = this.props.gtcService.orientation === 'horizontal' ? 2 : 1;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcLandingDataPageConfigTabPopupKeys.LandingConfigDefaults,
      this.props.controlMode,
      this.renderOptionDefaultsPopup.bind(this),
      this.props.displayPaneIndex
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
   * Resets this tab's configuration options to their defaults.
   */
  private resetToDefaults(): void {
    const factorDefault = this.props.toldSettingManager.getSetting('toldLandingFactorDefault').value;
    this.factorSetting.value = factorDefault < 0 ? 100 : factorDefault;

    if (this.flapsOptions !== undefined) {
      const defaultVal = Math.max(this.props.toldSettingManager.getSetting('toldLandingFlapsIndexDefault').value, 0);
      this.flapsIndexSetting.value = defaultVal;
    }
    if (this.antiIceOptions !== undefined) {
      this.antiIceOnSetting.value = false;
    }
    if (this.thrustReverserOptions !== undefined) {
      this.props.toldSettingManager.getSetting('toldLandingThrustReversers').value = false;
    }
    if (this.autothrottleOptions !== undefined) {
      this.props.toldSettingManager.getSetting('toldLandingAutothrottleOn').value = false;
    }
  }

  /**
   * Opens a popup to allow the user to change the default configuration options.
   */
  private changeDefaults(): void {
    this.props.gtcService.openPopup(GtcLandingDataPageConfigTabPopupKeys.LandingConfigDefaults);
  }

  /**
   * Opens a dialog chain to select this tab's takeoff factor parameter.
   */
  private async selectFactor(): Promise<void> {
    const initialValue = MathUtils.clamp(this.factorSetting.value, 1, 999);

    const result = await this.props.gtcService.openPopup<GtcToldFactorDialog>(GtcViewKeys.ToldFactorDialog, 'normal', 'hide')
      .ref.request({
        title: 'Landing Factor',
        initialValue
      });

    if (!result.wasCancelled) {
      this.factorSetting.value = result.payload;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='told-data-page-config landing-data-page-config'>
        <div class='told-data-page-config-left'>
          <GtcTouchButton
            label='Use<br>Defaults'
            onPressed={this.resetToDefaults.bind(this)}
            class='told-data-page-config-left-button'
          />
          <GtcTouchButton
            label='Change<br>Defaults'
            onPressed={this.changeDefaults.bind(this)}
            class='told-data-page-config-left-button'
          />
        </div>
        <div class='told-data-page-config-right gtc-panel'>
          <GtcList
            ref={this.listRef}
            bus={this.props.gtcService.bus}
            listItemHeightPx={this.listItemHeight}
            listItemSpacingPx={this.listItemSpacing}
            itemsPerPage={5}
            sidebarState={this.props.sidebarState}
            class='told-data-page-config-right-list'
          >
            {this.flapsOptions !== undefined && (
              <GtcListItem hideBorder>
                <GtcListSelectTouchButton
                  gtcService={this.props.gtcService}
                  listDialogKey={GtcViewKeys.ListDialog1}
                  label='Landing Flaps'
                  state={this.flapsIndexSetting}
                  renderValue={index => this.flapsOptions!.options[index]?.name ?? ''}
                  listParams={state => {
                    return {
                      title: 'Landing Flaps',
                      inputData: this.flapsOptions!.options.map((option, index) => {
                        return {
                          value: index,
                          labelRenderer: () => option.name
                        };
                      }),
                      selectedValue: state
                    };
                  }}
                  class='told-data-page-config-right-button landing-data-page-config-flaps-button'
                />
              </GtcListItem>
            )}
            {this.antiIceOptions !== undefined && (
              <GtcListItem hideBorder>
                <GtcListSelectTouchButton
                  gtcService={this.props.gtcService}
                  listDialogKey={GtcViewKeys.ListDialog1}
                  label='Anti-Ice'
                  state={this.antiIceOnSetting}
                  renderValue={on => on ? 'On' : 'Off'}
                  listParams={state => {
                    return {
                      title: 'Anti-Ice',
                      inputData: [
                        {
                          value: false,
                          labelRenderer: () => 'Off'
                        },
                        {
                          value: true,
                          labelRenderer: () => 'On',
                          isEnabled: this.isAntiIceAllowed!.get()
                        }
                      ],
                      selectedValue: state
                    };
                  }}
                  class='told-data-page-config-right-button landing-data-page-config-antiice-button'
                />
              </GtcListItem>
            )}
            {this.thrustReverserOptions !== undefined && (
              <GtcListItem hideBorder>
                <GtcListSelectTouchButton
                  gtcService={this.props.gtcService}
                  listDialogKey={GtcViewKeys.ListDialog1}
                  label='Thrust Reversers'
                  state={this.props.toldSettingManager.getSetting('toldLandingThrustReversers')}
                  renderValue={value => value ? 'Max Reverse' : 'Stowed'}
                  listParams={state => {
                    const flaps = this.flapsOptions?.options[this.flapsIndexSetting.value]?.name;
                    const antiIceOn = this.antiIceOptions === undefined ? undefined : this.antiIceOnSetting.value;

                    return {
                      title: 'Thrust Reversers',
                      inputData: [
                        {
                          value: false,
                          labelRenderer: () => 'Stowed',
                          isEnabled: this.thrustReverserChecker!(this.runwaySurfaceSetting.value, flaps, antiIceOn) !== ToldThrustReverserSelectable.OnlyTrue
                        },
                        {
                          value: true,
                          labelRenderer: () => 'Max Reverse',
                          isEnabled: this.thrustReverserChecker!(this.runwaySurfaceSetting.value, flaps, antiIceOn) !== ToldThrustReverserSelectable.OnlyFalse
                        }
                      ],
                      selectedValue: state
                    };
                  }}
                  class='told-data-page-config-right-button landing-data-page-config-tr-button'
                />
              </GtcListItem>
            )}
            <GtcListItem hideBorder>
              <GtcValueTouchButton
                state={this.factorSetting}
                label='Landing Factor'
                renderValue={GtcLandingDataPageConfigTab.FACTOR_FORMATTER}
                onPressed={this.selectFactor.bind(this)}
                class='told-data-page-config-right-button landing-data-page-config-factor-button'
              />
            </GtcListItem>
            {this.autothrottleOptions !== undefined && (
              <GtcListItem hideBorder>
                <GtcListSelectTouchButton
                  gtcService={this.props.gtcService}
                  listDialogKey={GtcViewKeys.ListDialog1}
                  label='Autothrottle'
                  state={this.props.toldSettingManager.getSetting('toldLandingAutothrottleOn')}
                  renderValue={value => value ? 'On' : 'Off'}
                  listParams={state => {
                    return {
                      title: 'Autothrottle',
                      inputData: [
                        {
                          value: false,
                          labelRenderer: () => 'Off'
                        },
                        {
                          value: true,
                          labelRenderer: () => 'On'
                        }
                      ],
                      selectedValue: state
                    };
                  }}
                  class='told-data-page-config-right-button landing-data-page-config-autothrottle-button'
                />
              </GtcListItem>
            )}
          </GtcList>
        </div>
      </div>
    );
  }

  /**
   * Renders this page's defaults popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns This page's defaults popup, as a VNode.
   */
  private renderOptionDefaultsPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    const options: GtcToldConfigDefaultsPopupOption[] = [];

    if (this.flapsOptions !== undefined && this.flapsOptions.options.length > 1) {
      options.push({
        name: 'Landing Flaps',
        setting: this.props.toldSettingManager.getSetting('toldLandingFlapsIndexDefault'),
        values: ArrayUtils.create(this.flapsOptions.options.length, index => index),
        renderValue: index => this.flapsOptions!.options[index]?.name ?? ''
      });
    }

    options.push({
      name: 'Landing Factor',
      setting: this.props.toldSettingManager.getSetting('toldLandingFactorDefault')
    });

    return (
      <GtcToldConfigDefaultsPopup
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        options={options}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.isAntiIceAllowed?.destroy();

    super.destroy();
  }
}