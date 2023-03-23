import { ArrayUtils, DisplayComponent, FSComponent, NumberFormatter, NumberUnitSubject, SetSubject, Subscription, UnitType, VNode } from '@microsoft/msfs-sdk';

import { ControllableDisplayPaneIndex, FmsSpeedsConfig, FmsSpeedsGeneralLimits, FmsSpeedUserSettingManager, NumberUnitDisplay } from '@microsoft/msfs-wtg3000-common';

import { GtcList, GtcListItem } from '../../Components/List';
import { GtcTouchButton, GtcTouchButtonProps } from '../../Components/TouchButton/GtcTouchButton';
import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcFlapSpeedDialog } from './GtcFlapSpeedDialog';

import './GtcFlapSpeedsPage.css';

/**
 * Component props for GtcFlapSpeedsPage.
 */
export interface GtcFlapSpeedsProps extends GtcViewProps {
  /** A configuration object defining options for FMS speeds. */
  fmsSpeedsConfig: FmsSpeedsConfig;

  /** A manager for FMS speeds user settings. */
  fmsSpeedsSettingManager: FmsSpeedUserSettingManager;
}

/**
 * GTC view keys for popups owned by flap speeds pages.
 */
enum GtcFlapSpeedsPagePopupKeys {
  FlapSpeedDialog = 'FlapSpeedDialog'
}

/**
 * A GTC flap speeds page.
 */
export class GtcFlapSpeedsPage extends GtcView<GtcFlapSpeedsProps> {
  private thisNode?: VNode;

  private readonly allSettings = this.props.fmsSpeedsSettingManager.configurationSpeedDefinitions.map((def, index) => {
    return this.props.fmsSpeedsSettingManager.getSetting(`fmsSpeedConfigurationLimit_${index}`);
  });

  private readonly listItemHeight = this.props.gtcService.isHorizontal ? 125 : 65;
  private readonly listItemSpacing = this.props.gtcService.isHorizontal ? 2 : 1;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcFlapSpeedsPagePopupKeys.FlapSpeedDialog,
      this.props.controlMode,
      this.renderDialog.bind(this),
      this.props.displayPaneIndex
    );

    this._title.set('FMS Flap Speeds');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='flap-speeds-page'>
        {this.renderSpeedButtons()}
        <GtcTouchButton
          label={'Restore<br>Defaults'}
          onPressed={() => {
            this.allSettings.forEach((setting, index) => {
              setting.value = this.props.fmsSpeedsSettingManager.configurationSpeedDefinitions[index].defaultValue;
            });
          }}
          class='flap-speeds-page-restore-button'
        />
      </div>
    );
  }

  /**
   * Renders this page's buttons that control the aircraft configuration speed limit settings.
   * @returns This page's buttons that control the aircraft configuration speed limit settings, as a VNode.
   */
  private renderSpeedButtons(): VNode {
    const defs = this.props.fmsSpeedsSettingManager.configurationSpeedDefinitions;

    // We can fit 5 buttons without needing to resort to a scrolling list.
    if (defs.length > 5) {
      return (
        <div class='flap-speeds-page-speed-buttons-container flap-speeds-page-speed-buttons-container-list'>
          <GtcList
            bus={this.bus}
            listItemHeightPx={this.listItemHeight}
            listItemSpacingPx={this.listItemSpacing}
            itemsPerPage={5}
            class='flap-speeds-page-speed-buttons-list'
          >
            {...defs.map((def, index) => {
              return (
                <GtcListItem hideBorder class='flap-speeds-page-speed-buttons-list-row'>
                  <FlapsSpeedValueButton
                    gtcService={this.props.gtcService}
                    index={index}
                    fmsSpeedsSettingManager={this.props.fmsSpeedsSettingManager}
                    generalSpeedLimits={this.props.fmsSpeedsConfig.generalLimits}
                    isInList
                  />
                </GtcListItem>
              );
            })}
          </GtcList>
        </div>
      );
    } else {
      return (
        <div class='flap-speeds-page-speed-buttons-container flap-speeds-page-speed-buttons-container-nolist'>
          {defs.map((def, index) => {
            return (
              <FlapsSpeedValueButton
                gtcService={this.props.gtcService}
                index={index}
                fmsSpeedsSettingManager={this.props.fmsSpeedsSettingManager}
                generalSpeedLimits={this.props.fmsSpeedsConfig.generalLimits}
              />
            );
          })}
        </div>
      );
    }
  }

  /**
   * Renders this page's flap speed dialog.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the dialog belongs.
   * @param displayPaneIndex The index of the display pane associated with the dialog.
   * @returns This page's flap speed dialog, as a VNode.
   */
  private renderDialog(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    return (
      <GtcFlapSpeedDialog
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}

/**
 * Component props for FlapsSpeedValueButton.
 */
interface FlapsSpeedValueButtonProps extends Pick<GtcTouchButtonProps, 'isHighlighted' | 'isInList'> {
  /** The GTC service. */
  gtcService: GtcService;

  /** The index of the aircraft configuration speed limit setting controlled by the button. */
  index: number;

  /** A manager for FMS speed user settings. */
  fmsSpeedsSettingManager: FmsSpeedUserSettingManager;

  /** General FMS speed limits. */
  generalSpeedLimits: FmsSpeedsGeneralLimits;
}

/**
 * A touchscreen button which displays the value of an aircraft configuration speed limit setting ("flap speed"), and
 * when pressed opens a dialog which allows the user to select a custom value for the setting.
 */
class FlapsSpeedValueButton extends DisplayComponent<FlapsSpeedValueButtonProps> {
  private static readonly FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });

  private readonly buttonRef = FSComponent.createRef<GtcTouchButton>();

  private readonly pencilCssClass = SetSubject.create(['flap-speed-value-button-pencil']);

  private readonly speedDefs = this.props.fmsSpeedsSettingManager.configurationSpeedDefinitions;
  private readonly speedDef = this.speedDefs[this.props.index];
  private readonly defaultValue = this.speedDef.defaultValue;
  private readonly staticMinValue = Math.max(this.speedDef.minimumValue, this.props.generalSpeedLimits.minimumIas);
  private readonly staticMaxValue = Math.min(this.speedDef.maximumValue, this.props.generalSpeedLimits.maximumIas);

  private readonly setting = this.props.fmsSpeedsSettingManager.getSetting(`fmsSpeedConfigurationLimit_${this.props.index}`);

  private readonly aboveSpeedSettings = ArrayUtils.create(this.props.index, index => {
    return this.props.fmsSpeedsSettingManager.getSetting(`fmsSpeedConfigurationLimit_${index}`);
  });
  private readonly belowSpeedSettings = ArrayUtils.create(this.props.fmsSpeedsSettingManager.configurationSpeedDefinitions.length - this.props.index - 1, index => {
    return this.props.fmsSpeedsSettingManager.getSetting(`fmsSpeedConfigurationLimit_${this.props.index + index + 1}`);
  });

  private readonly isValueEdited = this.setting.map(value => value !== this.defaultValue);

  private readonly value = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));

  private valuePipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.valuePipe = this.setting.pipe(this.value);

    this.isValueEdited.sub(isEdited => {
      this.pencilCssClass.toggle('hidden', !isEdited);
    }, true);
  }

  /**
   * Gets the current minimum valid value for the setting controlled by this button.
   * @returns The current minimum valid value for the setting controlled by this button.
   */
  private readonly getMinimumValue = (): number => {
    return this.staticMinValue;
  };

  /**
   * Gets the current maximum valid value for the setting controlled by this button.
   * @returns The current maximum valid value for the setting controlled by this button.
   */
  private readonly getMaximumValue = (): number => {
    return this.staticMaxValue;
  };

  /**
   * Responds to when this button is pressed.
   */
  private async onPressed(): Promise<void> {
    const result = await this.props.gtcService.openPopup<GtcFlapSpeedDialog>(GtcFlapSpeedsPagePopupKeys.FlapSpeedDialog, 'normal', 'hide')
      .ref.request({
        flapSpeedName: this.speedDef.name,
        initialValue: this.setting.value,
        minimumValue: this.getMinimumValue,
        maximumValue: this.getMaximumValue
      });

    if (!result.wasCancelled) {
      this.setting.value = result.payload;

      // Ensure that all configuration speeds that must be greater than or equal to this button's speed are still
      // greater than or equal to this button's speed after the change.
      for (const aboveSpeedSetting of this.aboveSpeedSettings) {
        if (aboveSpeedSetting.value < result.payload) {
          aboveSpeedSetting.value = result.payload;
        }
      }

      // Ensure that all configuration speeds that must be less than or equal to this button's speed are still
      // less than or equal to this button's speed after the change.
      for (const belowSpeedSetting of this.belowSpeedSettings) {
        if (belowSpeedSetting.value > result.payload) {
          belowSpeedSetting.value = result.payload;
        }
      }
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GtcTouchButton
        ref={this.buttonRef}
        onPressed={this.onPressed.bind(this)}
        isHighlighted={this.props.isHighlighted}
        isInList={this.props.isInList}
        gtcOrientation={this.props.gtcService.orientation}
        class='flap-speed-value-button'
      >
        <div class='flap-speed-value-button-label'>{this.speedDef.name}</div>
        <NumberUnitDisplay
          value={this.value}
          displayUnit={null}
          formatter={FlapsSpeedValueButton.FORMATTER}
          class='flap-speed-value-button-value'
        />
        <img src='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_pencil.png' class={this.pencilCssClass} />
      </GtcTouchButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.buttonRef.getOrDefault()?.destroy();

    this.isValueEdited.destroy();

    this.valuePipe?.destroy();

    super.destroy();
  }
}