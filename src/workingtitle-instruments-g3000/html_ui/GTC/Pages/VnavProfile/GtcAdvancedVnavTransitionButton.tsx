import {
  DisplayComponent, FSComponent, NumberFormatter, NumberUnitSubject, SetSubject, Subject, Subscription, UnitFamily, UnitType,
  UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { NumberUnitDisplay, UnitsAltitudeSettingMode, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';

import { G3000BaroTransitionAlertUserSettingTypes, G3000FilePaths, GtcViewKeys } from '@microsoft/msfs-wtg3000-common';

import { GtcTouchButton, GtcTouchButtonProps } from '../../Components/TouchButton/GtcTouchButton';
import { GtcBaroTransitionAlertAltitudeDialog, GtcBaroTransitionAlertAltitudeDialogOutput } from '../../Dialog/GtcBaroTransitionAlertAltitudeDialog';
import { GtcDialogResult } from '../../Dialog/GtcDialogView';
import { GtcService } from '../../GtcService/GtcService';

import './GtcAdvancedVnavSpeedButton.css';
import './GtcAdvancedVnavTransitionButton.css';

/**
 * Component props for GtcAdvancedVnavTransitionButton.
 */
export interface GtcAdvancedVnavTransitionButtonProps extends Omit<GtcTouchButtonProps, 'label' | 'onPressed' | 'gtcOrientation'> {
  /** The GTC service. */
  gtcService: GtcService;

  /** A manager for barometric transition alert user settings. */
  baroTransitionAlertSettingManager: UserSettingManager<G3000BaroTransitionAlertUserSettingTypes>;

  /** A manager for display unit user settings. */
  unitSettingManager: UnitsUserSettingManager;

  /** Whether the button controls the transition level setting instead of the transition altitude setting. */
  isTransitionLevel: boolean;
}

/**
 * A GTC touchscreen button which displays a VNAV transition altitude and when pressed, opens a dialog to allow the
 * user to change the transition altitude.
 */
export class GtcAdvancedVnavTransitionButton extends DisplayComponent<GtcAdvancedVnavTransitionButtonProps> {
  private static readonly ROOT_CSS_CLASSES = ['advanced-vnav-speed-button', 'advanced-vnav-transition-button'];
  private static readonly RESERVED_CSS_CLASSES: string[] = [];

  private static readonly ALTITUDE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '–––––' });

  private readonly transitionAltitudeDisplayRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Speed>>();

  private readonly thresholdSetting = this.props.baroTransitionAlertSettingManager
    .getSetting(this.props.isTransitionLevel ? 'baroTransitionAlertLevelThreshold' : 'baroTransitionAlertAltitudeThreshold');
  private readonly manualThresholdSetting = this.props.baroTransitionAlertSettingManager
    .getSetting(this.props.isTransitionLevel ? 'baroTransitionAlertLevelManualThreshold' : 'baroTransitionAlertAltitudeManualThreshold');
  private readonly autoThresholdSetting = this.props.baroTransitionAlertSettingManager
    .getSetting(this.props.isTransitionLevel ? 'baroTransitionAlertLevelAutoThreshold' : 'baroTransitionAlertAltitudeAutoThreshold');

  private readonly altitudeValue = !this.props.isTransitionLevel ? NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN)) : undefined;
  private readonly levelText = this.props.isTransitionLevel ? Subject.create('') : undefined;

  private readonly editIconHidden = this.manualThresholdSetting
    .map(threshold => threshold < 0);

  private readonly subscriptions: Subscription[] = [
    this.editIconHidden
  ];

  /** @inheritDoc */
  public onAfterRender(): void {
    if (this.altitudeValue) {
      this.subscriptions.push(
        this.thresholdSetting.pipe(this.altitudeValue, threshold => threshold >= 0 ? threshold : NaN)
      );
    } else if (this.levelText) {
      this.subscriptions.push(
        this.thresholdSetting.pipe(this.levelText, threshold => `FL${threshold >= 0 ? (threshold / 100).toFixed(0).padStart(3, '0') : '–––'}`)
      );
    }
  }

  /**
   * Opens a dialog to request a transition altitude value.
   * @returns A Promise which is fulfilled with the result of the request from the dialog.
   */
  private requestTransitionAltitude(): Promise<GtcDialogResult<GtcBaroTransitionAlertAltitudeDialogOutput>> {
    const unitsMode = this.props.unitSettingManager.getSetting('unitsAltitude').get() === UnitsAltitudeSettingMode.Meters ? 'meters' : 'feet';

    return this.props.gtcService
      .openPopup<GtcBaroTransitionAlertAltitudeDialog>(GtcViewKeys.BaroTransitionAlertAltitudeDialog)
      .ref.request({
        title: 'BARO Transition ALT Climb',
        unitsMode,
        initialValue: Math.max(this.thresholdSetting.get(), 0),
        initialUnit: UnitType.FOOT,
        enableRevert: this.manualThresholdSetting.get() >= 0,
        revertDialogMessage: () => {
          const autoThreshold = this.autoThresholdSetting.get();
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
  }

  /**
   * Opens a dialog to request a transition level value.
   * @returns A Promise which is fulfilled with the result of the request from the dialog.
   */
  private requestTransitionLevel(): Promise<GtcDialogResult<GtcBaroTransitionAlertAltitudeDialogOutput>> {
    return this.props.gtcService
      .openPopup<GtcBaroTransitionAlertAltitudeDialog>(GtcViewKeys.BaroTransitionAlertAltitudeDialog)
      .ref.request({
        title: 'BARO Transition LVL Descent',
        unitsMode: 'flightlevel',
        initialValue: Math.max(this.thresholdSetting.get(), 0),
        initialUnit: UnitType.FOOT,
        enableRevert: this.manualThresholdSetting.get() >= 0,
        revertDialogMessage: () => {
          const autoThreshold = this.autoThresholdSetting.get();
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
  }

  /**
   * Responds to when this button is pressed.
   */
  private async onPressed(): Promise<void> {
    const result = await (this.props.isTransitionLevel ? this.requestTransitionLevel() : this.requestTransitionAltitude());

    if (result.wasCancelled) {
      return;
    }

    if (result.payload.type === 'revert') {
      this.manualThresholdSetting.set(-1);
    } else {
      this.manualThresholdSetting.set(UnitType.FOOT.convertFrom(result.payload.value, result.payload.unit));
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    let rootCssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      rootCssClass = SetSubject.create(GtcAdvancedVnavTransitionButton.ROOT_CSS_CLASSES);
      const sub = FSComponent.bindCssClassSet(rootCssClass, this.props.class, GtcAdvancedVnavTransitionButton.RESERVED_CSS_CLASSES);
      this.subscriptions.push(sub);
    } else {
      rootCssClass = GtcAdvancedVnavTransitionButton.ROOT_CSS_CLASSES.join(' ');

      if (this.props.class !== undefined && this.props.class.length > 0) {
        rootCssClass += ' '
          + FSComponent.parseCssClassesFromString(this.props.class, cssClass => !GtcAdvancedVnavTransitionButton.RESERVED_CSS_CLASSES.includes(cssClass))
            .join(' ');
      }
    }

    return (
      <GtcTouchButton
        onPressed={this.onPressed.bind(this)}
        isEnabled={this.props.isEnabled}
        isVisible={this.props.isVisible}
        isHighlighted={this.props.isHighlighted}
        focusOnDrag={this.props.focusOnDrag}
        inhibitOnDrag={this.props.inhibitOnDrag}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis}
        dragThresholdPx={this.props.dragThresholdPx}
        isInList={this.props.isInList}
        listScrollAxis={this.props.listScrollAxis}
        gtcOrientation={this.props.gtcService.orientation}
        class={rootCssClass}
      >
        {
          this.props.isTransitionLevel
            ? this.renderTransitionLevelContents()
            : this.renderTransitionAltitudeContents()
        }
        <img
          src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_pencil.png`}
          class={{
            'advanced-vnav-transition-button-edit-icon': true,
            'hidden': this.editIconHidden
          }}
        />
      </GtcTouchButton>
    );
  }

  /**
   * Renders this button's contents when it controls the transition altitude setting.
   * @returns This button's contents when it controls the transition altitude setting, as a VNode.
   */
  private renderTransitionAltitudeContents(): VNode {
    return (
      <>
        <div class='advanced-vnav-speed-button-label'>Transition Altitude</div>
        <NumberUnitDisplay
          ref={this.transitionAltitudeDisplayRef}
          value={this.altitudeValue!}
          displayUnit={this.props.unitSettingManager.altitudeUnits}
          formatter={GtcAdvancedVnavTransitionButton.ALTITUDE_FORMATTER}
          class='advanced-vnav-speed-button-value'
        />
      </>
    );
  }

  /**
   * Renders this button's contents when it controls the transition level setting.
   * @returns This button's contents when it controls the transition level setting, as a VNode.
   */
  private renderTransitionLevelContents(): VNode {
    return (
      <>
        <div class='advanced-vnav-speed-button-label'>Transition Level</div>
        <div class='advanced-vnav-speed-button-value'>{this.levelText!}</div>
      </>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.transitionAltitudeDisplayRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
