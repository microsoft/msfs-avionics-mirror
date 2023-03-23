import { DisplayComponent, FSComponent, SetSubject, Subscribable, Subscription, UserSetting, VNode } from '@microsoft/msfs-sdk';
import { FmsSpeedClimbSchedule, FmsSpeedCruiseSchedule, FmsSpeedDescentSchedule } from '@microsoft/msfs-wtg3000-common';
import { GtcTouchButton, GtcTouchButtonProps } from '../../Components/TouchButton/GtcTouchButton';
import { GtcService } from '../../GtcService/GtcService';
import { GtcFmsSpeedScheduleDisplay } from './GtcFmsSpeedScheduleDisplay';

import './GtcAdvancedVnavSpeedButton.css';
import './GtcAdvancedVnavScheduleButton.css';

/**
 * Component props for GtcAdvancedVnavScheduleButton.
 */
export interface GtcAdvancedVnavScheduleButtonProps extends Omit<GtcTouchButtonProps, 'label' | 'isHighlighted' | 'gtcOrientation'> {
  /** The GTC service. */
  gtcService: GtcService;

  /** The label for the button. */
  label: string;

  /** The user setting for the name of the selected performance schedule controlled by the button. */
  schedule: Subscribable<FmsSpeedClimbSchedule | FmsSpeedCruiseSchedule | FmsSpeedDescentSchedule>;

  /** The user setting for the IAS value of the selected performance schedule controlled by the button. */
  iasSetting: UserSetting<number>;

  /** The user setting for the mach value of the selected performance schedule controlled by the button. */
  machSetting: UserSetting<number>;

  /**
   * The user setting for the flight path angle of the selected performance schedule controlled by the button. If not
   * defined, a flight path angle will not be displayed.
   */
  fpaSetting?: UserSetting<number>;
}

/**
 * A GTC touchscreen button which displays a VNAV performance schedule.
 */
export class GtcAdvancedVnavScheduleButton extends DisplayComponent<GtcAdvancedVnavScheduleButtonProps> {
  private static readonly ROOT_CSS_CLASSES = ['advanced-vnav-speed-button', 'advanced-vnav-schedule-button'];
  private static readonly RESERVED_CSS_CLASSES: string[] = [];

  private static readonly PARAMS_CSS_CLASSES = ['advanced-vnav-schedule-button-params-row'];

  private readonly paramsCssClass = SetSubject.create(GtcAdvancedVnavScheduleButton.PARAMS_CSS_CLASSES);

  private readonly iasText = this.props.iasSetting.map(ias => ias.toFixed(0));
  private readonly machText = this.props.machSetting.map(mach => mach.toFixed(3));
  private readonly fpaText = this.props.fpaSetting?.map(fpa => `−${(-fpa).toFixed(2)}°`);

  private cssClassSub?: Subscription;
  private scheduleSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    // If the schedule's name is empty, the auto-generated name will contain the schedule's IAS/mach/FPA values, so
    // we need to hide the parameter display.
    this.scheduleSub = this.props.schedule.sub(schedule => {
      this.paramsCssClass.toggle('hidden', schedule.name.length === 0);
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    let rootCssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      rootCssClass = SetSubject.create(GtcAdvancedVnavScheduleButton.ROOT_CSS_CLASSES);
      this.cssClassSub = FSComponent.bindCssClassSet(rootCssClass, this.props.class, GtcAdvancedVnavScheduleButton.RESERVED_CSS_CLASSES);
    } else {
      rootCssClass = GtcAdvancedVnavScheduleButton.ROOT_CSS_CLASSES.join(' ');

      if (this.props.class !== undefined && this.props.class.length > 0) {
        rootCssClass += ' '
          + FSComponent.parseCssClassesFromString(this.props.class, cssClass => !GtcAdvancedVnavScheduleButton.RESERVED_CSS_CLASSES.includes(cssClass))
            .join(' ');
      }
    }

    return (
      <GtcTouchButton
        onPressed={this.props.onPressed}
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
        <div class='advanced-vnav-speed-button-label'>{this.props.label}</div>
        <GtcFmsSpeedScheduleDisplay schedule={this.props.schedule} class='advanced-vnav-speed-button-value' />
        <div class={this.paramsCssClass}>
          <div class='advanced-vnav-speed-button-value'>{this.iasText}<span class='numberunit-unit-small'>KT</span></div>
          <div class='advanced-vnav-schedule-button-params-slash'>/</div>
          <div class='advanced-vnav-speed-button-value'>M{this.machText}</div>
          {this.fpaText && (
            <>
              <div class='advanced-vnav-schedule-button-params-slash'>/</div>
              <div class='advanced-vnav-speed-button-value'>{this.fpaText}</div>
            </>
          )}
        </div>
      </GtcTouchButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.iasText.destroy();
    this.machText.destroy();

    this.cssClassSub?.destroy();
    this.scheduleSub?.destroy();

    super.destroy();
  }
}