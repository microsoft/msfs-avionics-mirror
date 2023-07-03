import { WeatherRadarOperatingMode, WeatherRadarScanMode } from '@microsoft/msfs-garminsdk';
import { Subscription } from '@microsoft/msfs-sdk';
import { SoftKeyMenuSystem } from '../../../../Shared/UI/Menus/SoftKeyMenuSystem';
import { MFDRootMenu } from '../../../../Shared/UI/Menus/MFD/MFDRootMenu';
import { MultipleSoftKeyUserSettingController } from '../../../../Shared/UI/Menus/SoftKeyUserSettingControllers';
import { WeatherRadarUserSettings } from '../../../../Shared/WeatherRadar/WeatherRadarUserSettings';

/**
 * The MFD weather radar page root softkey menu.
 */
export class MFDWeatherRadarRootMenu extends MFDRootMenu {

  private readonly weatherRadarSettingManager = WeatherRadarUserSettings.getManager(this.menuSystem.bus);

  private readonly scanModeController = new MultipleSoftKeyUserSettingController(
    this, this.weatherRadarSettingManager, 'wxrScanMode',
    [
      { index: 5, label: 'Horizon', value: WeatherRadarScanMode.Horizontal },
      { index: 6, label: 'Vertical', value: WeatherRadarScanMode.Vertical }
    ]
  );

  private readonly showBearingLinePipe: Subscription;
  private readonly showTiltLinePipe: Subscription;

  /** @inheritdoc */
  constructor(menuSystem: SoftKeyMenuSystem) {
    super(menuSystem);

    this.addItem(3, 'Mode', () => { this.menuSystem.pushMenu('wxr-mode'); });

    this.addItem(8, 'Gain', undefined, false);

    this.addItem(10, '', this.onReferenceLinePressed.bind(this), false);

    this.scanModeController.init();

    this.showBearingLinePipe = this.weatherRadarSettingManager.getSetting('wxrShowBearingLine').pipe(this.getItem(10).value, true);
    this.showTiltLinePipe = this.weatherRadarSettingManager.getSetting('wxrShowTiltLine').pipe(this.getItem(10).value, true);

    this.weatherRadarSettingManager.getSetting('wxrScanMode').sub(this.onScanModeChanged.bind(this), true);

    this.weatherRadarSettingManager.getSetting('wxrOperatingMode').sub(this.onOperatingModeChanged.bind(this), true);
  }

  /**
   * Responds to changes in the weather radar operating mode setting.
   * @param mode The current weather radar operating mode.
   */
  private onOperatingModeChanged(mode: WeatherRadarOperatingMode): void {
    const isDisabled = mode !== WeatherRadarOperatingMode.Weather;

    this.getItem(5).disabled.set(isDisabled);
    this.getItem(6).disabled.set(isDisabled);
    this.getItem(10).disabled.set(isDisabled);
  }

  /**
   * Responds to changes in the weather radar scan mode setting.
   * @param mode The current weather radar scan mode.
   */
  private onScanModeChanged(mode: WeatherRadarScanMode): void {
    if (mode === WeatherRadarScanMode.Horizontal) {
      this.getItem(10).label.set('BRG');
      this.showTiltLinePipe.pause();
      this.showBearingLinePipe.resume(true);
    } else {
      this.getItem(10).label.set('Tilt');
      this.showBearingLinePipe.pause();
      this.showTiltLinePipe.resume(true);
    }
  }

  /**
   * Responds to when the reference line softkey is pressed.
   */
  private onReferenceLinePressed(): void {
    const setting = this.weatherRadarSettingManager.getSetting('wxrScanMode').value === WeatherRadarScanMode.Horizontal
      ? this.weatherRadarSettingManager.getSetting('wxrShowBearingLine')
      : this.weatherRadarSettingManager.getSetting('wxrShowTiltLine');

    setting.value = !setting.value;
  }
}
