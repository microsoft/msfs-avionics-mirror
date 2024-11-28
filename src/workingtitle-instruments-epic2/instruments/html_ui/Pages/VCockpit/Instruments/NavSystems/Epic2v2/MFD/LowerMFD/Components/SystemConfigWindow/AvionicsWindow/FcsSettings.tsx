import { FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { FlightDirectorMode, GpwsEvents, PfdUserSettingManager, TabContent, TabContentProps } from '@microsoft/msfs-epic2-shared';

import { FcsSettingsRow } from './FcsSettingsRow';

import './FcsSettings.css';

/** Props for the FCS settings tab. */
export interface FcsSettingsProps extends TabContentProps {
  /** The aliased PFD settings manager. */
  pfdSettingsManager: PfdUserSettingManager;
}

/** The FCS settings tab. */
export class FcsSettings extends TabContent<FcsSettingsProps> {
  private readonly isFpsDisabled = this.props.pfdSettingsManager.getSetting('flightDirectorMode').map((v) => v === FlightDirectorMode.FltPath);

  private readonly fpsSettingUiValue = Subject.create(false);
  private readonly fpsSettingToUiPipe = this.props.pfdSettingsManager.getSetting('fpsEnabled').pipe(this.fpsSettingUiValue, true);
  private readonly fpsSettingFromUiPipe = this.fpsSettingUiValue.pipe(this.props.pfdSettingsManager.getSetting('fpsEnabled'), true);
  private readonly steepApproachMode = Subject.create<boolean>(false);

  /** @inheritdoc */
  public onAfterRender(): void {
    // FPS is shown on and disabled when the Flt-Path FD option is selected.
    this.isFpsDisabled.sub((v) => {
      if (v) {
        this.fpsSettingToUiPipe.pause();
        this.fpsSettingFromUiPipe.pause();
        this.fpsSettingUiValue.set(true);
      } else {
        this.fpsSettingToUiPipe.resume(true);
        this.fpsSettingFromUiPipe.resume();
      }
    }, true);

    this.props.bus.getSubscriber<GpwsEvents>().on('gpws_steep_approach_mode').whenChanged().handle((steepAppr) => this.steepApproachMode.set(steepAppr));
    this.steepApproachMode.sub((v) => this.props.bus.getPublisher<GpwsEvents>().pub('gpws_steep_approach_mode', v, true));
  }

  /** @inheritdoc */
  public onLineSelectKey(index: number): void {
    switch (index) {
      case 0: {
        const setting = this.props.pfdSettingsManager.getSetting('flightDirectorMode');
        switch (setting.get()) {
          case FlightDirectorMode.SCue:
            setting.set(FlightDirectorMode.XPtr);
            break;
          case FlightDirectorMode.XPtr:
            setting.set(FlightDirectorMode.FltPath);
            break;
          default:
            setting.set(FlightDirectorMode.SCue);
            break;
        }
      }
        break;
      case 1: {
        if (this.props.pfdSettingsManager.getSetting('flightDirectorMode').get() !== FlightDirectorMode.FltPath) {
          const setting = this.props.pfdSettingsManager.getSetting('fpsEnabled');
          setting.set(!setting.get());
        }
      }
        break;
      case 4: {
        const setting = this.props.pfdSettingsManager.getSetting('thrustDirectorEnabled');
        setting.set(!setting.get());
      }
        break;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return <div class="fcs-settings-window">
      <FcsSettingsRow
        label={'FD'}
        selectedValue={this.props.pfdSettingsManager.getSetting('flightDirectorMode')}
        valueLabels={[['S-Cue', FlightDirectorMode.SCue], ['X-Ptr', FlightDirectorMode.XPtr], ['Flt-Path', FlightDirectorMode.FltPath]]}
      />
      <div class="divider-line" />
      <FcsSettingsRow
        label={'FPS'}
        selectedValue={this.fpsSettingUiValue}
        valueLabels={[['On', true], ['Off', false]]}
        isDisabled={this.isFpsDisabled}
      />
      <div class="divider-line" />
      <FcsSettingsRow
        label={'Steep\nAppr'}
        selectedValue={this.steepApproachMode}
        valueLabels={[['Enable', true], ['Disable', false]]}
      />
      <div class="divider-line" />
      <div class='avionics-settings-row' />
      <div class="divider-line" />
      <FcsSettingsRow
        label={'Thrust\nDir'}
        selectedValue={this.props.pfdSettingsManager.getSetting('thrustDirectorEnabled')}
        valueLabels={[['On', true], ['Off', false]]}
      />
      <div class="divider-line" />
    </div>;
  }
}
