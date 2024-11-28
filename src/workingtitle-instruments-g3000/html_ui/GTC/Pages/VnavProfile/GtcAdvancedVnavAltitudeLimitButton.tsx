import { DisplayComponent, FSComponent, NumberFormatter, NumberUnitSubject, SetSubject, Subscription, UnitFamily, UnitType, UserSetting, VNode } from '@microsoft/msfs-sdk';
import { NumberUnitDisplay, UnitsAltitudeSettingMode, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { GtcTouchButton, GtcTouchButtonProps } from '../../Components/TouchButton/GtcTouchButton';
import { GtcAltitudeDialog, GtcAltitudeDialogOutput } from '../../Dialog/GtcAltitudeDialog';
import { GtcDialogChainStep, GtcDialogs } from '../../Dialog/GtcDialogs';
import { GtcDialogResult } from '../../Dialog/GtcDialogView';
import { GtcFmsSpeedDialog, GtcFmsSpeedDialogOutput } from '../../Dialog/GtcFmsSpeedDialog';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';

import './GtcAdvancedVnavSpeedButton.css';
import './GtcAdvancedVnavAltitudeLimitButton.css';

/**
 * Component props for GtcAdvancedVnavAltitudeLimitButton.
 */
export interface GtcAdvancedVnavAltitudeLimitButtonProps extends Omit<GtcTouchButtonProps, 'label' | 'onPressed' | 'isHighlighted' | 'gtcOrientation'> {
  /** The GTC service. */
  gtcService: GtcService;

  /** The user setting for the altitude speed limit controlled by the button. */
  speedLimitSetting: UserSetting<number>;

  /** The user setting for the altitude speed limit ceiling controlled by the button. */
  ceilingSetting: UserSetting<number>;

  /** A manager for display unit user settings. */
  unitSettingManager: UnitsUserSettingManager;
}

/**
 * A GTC touchscreen button which displays a VNAV altitude speed limit and when pressed, opens a chain of dialogs to
 * allow the user to change the settings for the speed limit.
 */
export class GtcAdvancedVnavAltitudeLimitButton extends DisplayComponent<GtcAdvancedVnavAltitudeLimitButtonProps> {
  private static readonly ROOT_CSS_CLASSES = ['advanced-vnav-speed-button', 'advanced-vnav-altitude-limit-button'];
  private static readonly RESERVED_CSS_CLASSES: string[] = [];

  private static readonly SPEED_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
  private static readonly ALTITUDE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '_____' });

  private static readonly MAXIMUM_FEET = 99999;
  private static readonly MAXIMUM_METERS = 30479;

  private readonly speedLimitRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Speed>>();
  private readonly ceilingRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Distance>>();

  private readonly dialogChainSteps: [GtcDialogChainStep<GtcFmsSpeedDialog>, GtcDialogChainStep<GtcAltitudeDialog>] = [
    {
      key: GtcViewKeys.FmsSpeedDialog,
      popupType: 'normal',
      popupOcclusionType: 'hide',
      input: () => {
        return {
          title: 'Speed Limit',
          initialValue: this.props.speedLimitSetting.value,
          unitsAllowed: 'ias'
        };
      },
      onResult: (result: GtcDialogResult<GtcFmsSpeedDialogOutput>) => {
        if (result.wasCancelled) {
          return false;
        } else {
          this.props.speedLimitSetting.value = result.payload.value;
          return true;
        }
      },
      delay: 150
    },
    {
      key: GtcViewKeys.AltitudeDialog1,
      popupType: 'normal',
      popupOcclusionType: 'hide',
      input: () => {
        const unitsMode = this.props.unitSettingManager.getSetting('unitsAltitude').value === UnitsAltitudeSettingMode.Feet ? 'feet' : 'meters';
        const maximumValue = unitsMode === 'feet' ? GtcAdvancedVnavAltitudeLimitButton.MAXIMUM_FEET : GtcAdvancedVnavAltitudeLimitButton.MAXIMUM_METERS;

        return {
          title: 'Altitude',
          initialValue: this.props.ceilingSetting.value,
          initialUnit: UnitType.FOOT,
          unitsMode,
          minimumValue: 0,
          maximumValue
        };
      },
      onResult: (result: GtcDialogResult<GtcAltitudeDialogOutput>) => {
        if (result.wasCancelled) {
          return false;
        } else {
          this.props.ceilingSetting.value = result.payload.unit.convertTo(result.payload.value, UnitType.FOOT);
          return true;
        }
      }
    }
  ];

  private readonly speedLimitValue = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));
  private readonly ceilingValue = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));

  private cssClassSub?: Subscription;
  private speedLimitPipe?: Subscription;
  private ceilingPipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.speedLimitPipe = this.props.speedLimitSetting.pipe(this.speedLimitValue);
    this.ceilingPipe = this.props.ceilingSetting.pipe(this.ceilingValue);
  }

  /**
   * Responds to when this button is pressed.
   */
  private onPressed(): void {
    GtcDialogs.openDialogChain(this.props.gtcService, this.dialogChainSteps).then(results => {
      if (!results.wasCancelled) {
        const asdf = results.payload[0];
        if (!asdf.wasCancelled) {
          asdf.payload.unit;
        }
      }
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    let rootCssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      rootCssClass = SetSubject.create(GtcAdvancedVnavAltitudeLimitButton.ROOT_CSS_CLASSES);
      this.cssClassSub = FSComponent.bindCssClassSet(rootCssClass, this.props.class, GtcAdvancedVnavAltitudeLimitButton.RESERVED_CSS_CLASSES);
    } else {
      rootCssClass = GtcAdvancedVnavAltitudeLimitButton.ROOT_CSS_CLASSES.join(' ');

      if (this.props.class !== undefined && this.props.class.length > 0) {
        rootCssClass += ' '
          + FSComponent.parseCssClassesFromString(this.props.class, cssClass => !GtcAdvancedVnavAltitudeLimitButton.RESERVED_CSS_CLASSES.includes(cssClass))
            .join(' ');
      }
    }

    return (
      <GtcTouchButton
        onPressed={this.onPressed.bind(this)}
        isEnabled={this.props.isEnabled}
        isVisible={this.props.isVisible}
        focusOnDrag={this.props.focusOnDrag}
        inhibitOnDrag={this.props.inhibitOnDrag}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis}
        dragThresholdPx={this.props.dragThresholdPx}
        isInList={this.props.isInList}
        listScrollAxis={this.props.listScrollAxis}
        gtcOrientation={this.props.gtcService.orientation}
        class={rootCssClass}
      >
        <div class='advanced-vnav-speed-button-label'>Altitude Speed Limit</div>
        <NumberUnitDisplay
          ref={this.speedLimitRef}
          value={this.speedLimitValue}
          displayUnit={null}
          formatter={GtcAdvancedVnavAltitudeLimitButton.SPEED_FORMATTER}
          class='advanced-vnav-speed-button-value'
        />
        <div class='advanced-vnav-altitude-limit-button-ceiling-row'>
          <div class='advanced-vnav-altitude-limit-button-ceiling-below'>below</div>
          <NumberUnitDisplay
            ref={this.ceilingRef}
            value={this.ceilingValue}
            displayUnit={this.props.unitSettingManager.altitudeUnits}
            formatter={GtcAdvancedVnavAltitudeLimitButton.ALTITUDE_FORMATTER}
            class='advanced-vnav-speed-button-value advanced-vnav-altitude-limit-button-ceiling-value'
          />
        </div>
      </GtcTouchButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.speedLimitRef.getOrDefault()?.destroy();
    this.ceilingRef.getOrDefault()?.destroy();

    this.cssClassSub?.destroy();
    this.speedLimitPipe?.destroy();
    this.ceilingPipe?.destroy();

    super.destroy();
  }
}