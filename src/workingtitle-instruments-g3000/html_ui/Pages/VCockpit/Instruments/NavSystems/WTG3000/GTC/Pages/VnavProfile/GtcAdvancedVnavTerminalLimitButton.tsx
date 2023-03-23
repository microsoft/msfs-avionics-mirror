import { DisplayComponent, FSComponent, NumberFormatter, NumberUnitSubject, SetSubject, Subscribable, Subscription, UnitFamily, UnitType, UserSetting, VNode } from '@microsoft/msfs-sdk';
import { NumberUnitDisplay, UnitsAltitudeSettingMode, UnitsDistanceSettingMode, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { GtcTouchButton, GtcTouchButtonProps } from '../../Components/TouchButton/GtcTouchButton';
import { GtcAltitudeDialog, GtcAltitudeDialogOutput } from '../../Dialog/GtcAltitudeDialog';
import { GtcDistanceDialog } from '../../Dialog/GtcDistanceDialog';
import { GtcDialogChainStep, GtcDialogs } from '../../Dialog/GtcDialogs';
import { GtcDialogResult } from '../../Dialog/GtcDialogView';
import { GtcFmsSpeedDialog, GtcFmsSpeedDialogOutput } from '../../Dialog/GtcFmsSpeedDialog';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';

import './GtcAdvancedVnavSpeedButton.css';
import './GtcAdvancedVnavTerminalLimitButton.css';

/**
 * Component props for GtcAdvancedVnavTerminalLimitButton.
 */
export interface GtcAdvancedVnavTerminalLimitButtonProps extends Omit<GtcTouchButtonProps, 'label' | 'onPressed' | 'isHighlighted' | 'gtcOrientation'> {
  /** The GTC service. */
  gtcService: GtcService;

  /** The user setting for the terminal area speed limit controlled by the button. */
  speedLimitSetting: UserSetting<number>;

  /** The user setting for the terminal area speed limit ceiling controlled by the button. */
  ceilingSetting: UserSetting<number>;

  /** The user setting for the terminal area speed limit radius controlled by the button. */
  radiusSetting: UserSetting<number>;

  /** The  */
  ident: Subscribable<string | undefined>;

  /** A manager for display unit user settings. */
  unitSettingManager: UnitsUserSettingManager;
}

/**
 * A GTC touchscreen button which displays a VNAV terminal area speed limit and when pressed, opens a chain of dialogs
 * to allow the user to change the settings for the speed limit.
 */
export class GtcAdvancedVnavTerminalLimitButton extends DisplayComponent<GtcAdvancedVnavTerminalLimitButtonProps> {
  private static readonly ROOT_CSS_CLASSES = ['advanced-vnav-speed-button', 'advanced-vnav-terminal-limit-button'];
  private static readonly RESERVED_CSS_CLASSES: string[] = [];

  private static readonly SPEED_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
  private static readonly ALTITUDE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '_____' });
  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, nanString: '__._' });

  private static readonly MAXIMUM_FEET = 99999;
  private static readonly MAXIMUM_METERS = 30479;

  // TODO: These values were copied directly from the hold distance dialog. The maximum values are proably accurate,
  // but the minimum values may not be.
  private static readonly MINIMUM_NM = 1;
  private static readonly MAXIMUM_NM = 99.9;
  private static readonly MINIMUM_KM = 1.9;
  private static readonly MAXIMUM_KM = 185;

  private readonly speedLimitRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Speed>>();
  private readonly ceilingRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Distance>>();
  private readonly radiusRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Distance>>();

  private readonly dialogChainSteps: [GtcDialogChainStep<GtcFmsSpeedDialog>, GtcDialogChainStep<GtcAltitudeDialog>, GtcDialogChainStep<GtcDistanceDialog>] = [
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
        const maximumValue = unitsMode === 'feet' ? GtcAdvancedVnavTerminalLimitButton.MAXIMUM_FEET : GtcAdvancedVnavTerminalLimitButton.MAXIMUM_METERS;

        return {
          title: 'Height (AGL)',
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
      },
      delay: 150
    },
    {
      key: GtcViewKeys.DistanceDialog1,
      popupType: 'normal',
      popupOcclusionType: 'hide',
      input: () => {
        const unitType = this.props.unitSettingManager.getSetting('unitsDistance').value === UnitsDistanceSettingMode.Metric
          ? UnitType.KILOMETER : UnitType.NMILE;
        const minimumValue = unitType === UnitType.NMILE ? GtcAdvancedVnavTerminalLimitButton.MINIMUM_NM : GtcAdvancedVnavTerminalLimitButton.MINIMUM_KM;
        const maximumValue = unitType === UnitType.NMILE ? GtcAdvancedVnavTerminalLimitButton.MAXIMUM_NM : GtcAdvancedVnavTerminalLimitButton.MAXIMUM_KM;

        return {
          title: 'Distance',
          initialValue: this.props.radiusSetting.value,
          initialUnit: UnitType.NMILE,
          unitType,
          minimumValue,
          maximumValue
        };
      },
      onResult: (result: GtcDialogResult<GtcAltitudeDialogOutput>) => {
        if (result.wasCancelled) {
          return false;
        } else {
          this.props.radiusSetting.value = result.payload.unit.convertTo(result.payload.value, UnitType.NMILE);
          return true;
        }
      }
    }
  ];

  private readonly speedLimitValue = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));
  private readonly ceilingValue = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));
  private readonly radiusValue = NumberUnitSubject.create(UnitType.NMILE.createNumber(0));

  private readonly identText = this.props.ident.map(ident => ident ?? '____');

  private cssClassSub?: Subscription;
  private speedLimitPipe?: Subscription;
  private ceilingPipe?: Subscription;
  private radiusPipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.speedLimitPipe = this.props.speedLimitSetting.pipe(this.speedLimitValue);
    this.ceilingPipe = this.props.ceilingSetting.pipe(this.ceilingValue);
    this.radiusPipe = this.props.radiusSetting.pipe(this.radiusValue);
  }

  /**
   * Responds to when this button is pressed.
   */
  private onPressed(): void {
    GtcDialogs.openDialogChain(this.props.gtcService, this.dialogChainSteps);
  }

  /** @inheritdoc */
  public render(): VNode {
    let rootCssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      rootCssClass = SetSubject.create(GtcAdvancedVnavTerminalLimitButton.ROOT_CSS_CLASSES);
      this.cssClassSub = FSComponent.bindCssClassSet(rootCssClass, this.props.class, GtcAdvancedVnavTerminalLimitButton.RESERVED_CSS_CLASSES);
    } else {
      rootCssClass = GtcAdvancedVnavTerminalLimitButton.ROOT_CSS_CLASSES.join(' ');

      if (this.props.class !== undefined && this.props.class.length > 0) {
        rootCssClass += ' '
          + FSComponent.parseCssClassesFromString(this.props.class, cssClass => !GtcAdvancedVnavTerminalLimitButton.RESERVED_CSS_CLASSES.includes(cssClass))
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
        <div class='advanced-vnav-speed-button-label'>Terminal Area Speed Limit</div>
        <NumberUnitDisplay
          ref={this.speedLimitRef}
          value={this.speedLimitValue}
          displayUnit={null}
          formatter={GtcAdvancedVnavTerminalLimitButton.SPEED_FORMATTER}
          class='advanced-vnav-speed-button-value'
        />
        <div class='advanced-vnav-terminal-limit-button-ceiling-row'>
          <div class='advanced-vnav-terminal-limit-button-ceiling-below'>below</div>
          <NumberUnitDisplay
            ref={this.ceilingRef}
            value={this.ceilingValue}
            displayUnit={this.props.unitSettingManager.altitudeUnits}
            formatter={GtcAdvancedVnavTerminalLimitButton.ALTITUDE_FORMATTER}
            class='advanced-vnav-speed-button-value advanced-vnav-terminal-limit-button-ceiling-value'
          />
          <div class='advanced-vnav-terminal-limit-button-ceiling-agl'>(AGL)</div>
        </div>
        <div class='advanced-vnav-terminal-limit-button-radius-row'>
          <div class='advanced-vnav-terminal-limit-button-radius-left'>
            <div class='advanced-vnav-terminal-limit-button-radius-within'>within</div>
            <NumberUnitDisplay
              ref={this.radiusRef}
              value={this.radiusValue}
              displayUnit={this.props.unitSettingManager.distanceUnitsLarge}
              formatter={GtcAdvancedVnavTerminalLimitButton.DISTANCE_FORMATTER}
              class='advanced-vnav-speed-button-value advanced-vnav-terminal-limit-button-radius-value'
            />
          </div>
          <div class='advanced-vnav-terminal-limit-button-radius-ident'>of {this.identText}</div>
        </div>
      </GtcTouchButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.speedLimitRef.getOrDefault()?.destroy();
    this.ceilingRef.getOrDefault()?.destroy();
    this.radiusRef.getOrDefault()?.destroy();

    this.identText.destroy();

    this.cssClassSub?.destroy();
    this.speedLimitPipe?.destroy();
    this.ceilingPipe?.destroy();
    this.radiusPipe?.destroy();

    super.destroy();
  }
}