import { FSComponent, SetSubject, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';
import { DmeTuneSettingMode, DmeUserSettings } from '@microsoft/msfs-garminsdk';
import { DmeRadio } from '@microsoft/msfs-wtg3000-common';
import { GtcSetValueTouchButton } from '../../Components/TouchButton/GtcSetValueTouchButton';
import { GtcView } from '../../GtcService/GtcView';

import './GtcDmeModePopup.css';

/**
 * A GTC popup which allows the user to select a DME radio mode.
 */
export class GtcDmeModePopup extends GtcView {
  private thisNode?: VNode;

  private readonly nav1CssClass = SetSubject.create<string>(['dme-mode-popup-nav-button']);
  private readonly nav2CssClass = SetSubject.create<string>(['dme-mode-popup-nav-button']);

  private readonly dme1ModeSetting = DmeUserSettings.getManager(this.bus).getSetting('dme1TuneMode');
  private readonly dme2ModeSetting = DmeUserSettings.getManager(this.bus).getSetting('dme2TuneMode');

  private readonly mode = Subject.create(DmeTuneSettingMode.Nav1);

  private mode1PipeIn?: Subscription;
  private mode1PipeOut?: Subscription;

  private mode2PipeIn?: Subscription;
  private mode2PipeOut?: Subscription;

  private activeModePipeIn?: Subscription;
  private activeModePipeOut?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.mode1PipeIn = this.dme1ModeSetting.pipe(this.mode, true);
    this.mode1PipeOut = this.mode.pipe(this.dme1ModeSetting, true);

    this.mode2PipeIn = this.dme2ModeSetting.pipe(this.mode, true);
    this.mode2PipeOut = this.mode.pipe(this.dme2ModeSetting, true);
  }

  /**
   * Sets the DME radio controlled by this popup.
   * @param radio A DME radio.
   * @param allowBothNavSources Whether to allow the user to select both NAV radios as tuning sources. If `false`,
   * only NAV1 will be selectable for DME1, and only NAV2 for DME2. Hold mode is always selectable.
   */
  public setDmeRadio(radio: DmeRadio, allowBothNavSources: boolean): void {
    this.activeModePipeIn?.pause();
    this.activeModePipeOut?.pause();

    if (radio === 'DME1') {
      this._title.set('DME1 Mode');

      this.activeModePipeIn = this.mode1PipeIn;
      this.activeModePipeOut = this.mode1PipeOut;

      this.nav1CssClass.delete('hidden');
      this.nav2CssClass.toggle('hidden', !allowBothNavSources);
    } else {
      this._title.set('DME2 Mode');

      this.activeModePipeIn = this.mode2PipeIn;
      this.activeModePipeOut = this.mode2PipeOut;

      this.nav2CssClass.delete('hidden');
      this.nav1CssClass.toggle('hidden', !allowBothNavSources);
    }

    this.activeModePipeIn?.resume(true);
    this.activeModePipeOut?.resume();
  }

  /** @inheritdoc */
  public onResume(): void {
    this.activeModePipeIn?.resume(true);
    this.activeModePipeOut?.resume();
  }

  /** @inheritdoc */
  public onPause(): void {
    this.activeModePipeIn?.pause();
    this.activeModePipeOut?.pause();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='dme-mode-popup'>
        <div class='dme-mode-popup-button-container'>
          <GtcSetValueTouchButton
            state={this.mode}
            label='NAV1'
            setValue={DmeTuneSettingMode.Nav1}
            class={this.nav1CssClass}
          />
          <GtcSetValueTouchButton
            state={this.mode}
            label='NAV2'
            setValue={DmeTuneSettingMode.Nav2}
            class={this.nav2CssClass}
          />
          <GtcSetValueTouchButton
            state={this.mode}
            label='HOLD'
            setValue={DmeTuneSettingMode.Hold}
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.mode1PipeIn?.destroy();
    this.mode1PipeOut?.destroy();
    this.mode2PipeIn?.destroy();
    this.mode2PipeOut?.destroy();

    super.destroy();
  }
}