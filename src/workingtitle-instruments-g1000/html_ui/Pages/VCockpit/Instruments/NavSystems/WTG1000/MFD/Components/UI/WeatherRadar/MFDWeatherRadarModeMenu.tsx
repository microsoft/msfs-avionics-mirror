import { WeatherRadarOperatingMode } from '@microsoft/msfs-garminsdk';
import { AdcEvents, CombinedSubject, ConsumerSubject, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { MessageDialogDefinition } from '../../../../Shared/UI/Dialogs/MessageDialog';
import { SoftKeyMenuSystem } from '../../../../Shared/UI/Menus/SoftKeyMenuSystem';
import { SoftKeyMenu } from '../../../../Shared/UI/Menus/SoftKeyMenu';
import { ViewService } from '../../../../Shared/UI/ViewService';
import { WeatherRadarUserSettings } from '../../../../Shared/WeatherRadar/WeatherRadarUserSettings';

/**
 * The MFD weather radar operating mode softkey menu.
 */
export class MFDWeatherRadarModeMenu extends SoftKeyMenu {

  private readonly weatherRadarSettingManager = WeatherRadarUserSettings.getManager(this.menuSystem.bus);

  private readonly activeSetting = this.weatherRadarSettingManager.getSetting('wxrActive');
  private readonly operatingModeSetting = this.weatherRadarSettingManager.getSetting('wxrOperatingMode');

  private readonly modeState = CombinedSubject.create(
    this.activeSetting,
    this.operatingModeSetting
  );

  private readonly isOnGround = ConsumerSubject.create(this.menuSystem.bus.getSubscriber<AdcEvents>().on('on_ground'), false);

  /** @inheritdoc */
  constructor(menuSystem: SoftKeyMenuSystem, private readonly viewService: ViewService) {
    super(menuSystem);

    this.addItem(2, 'Standby', () => {
      if (this.operatingModeSetting.value === WeatherRadarOperatingMode.Standby) {
        this.activeSetting.value = !this.activeSetting.value;
      } else {
        this.operatingModeSetting.value = WeatherRadarOperatingMode.Standby;
      }
    }, false);

    this.addItem(4, 'Weather', this.onWeatherModePressed.bind(this), false);

    this.addItem(5, 'Ground', undefined, false);

    this.addItem(10, 'Back', () => { this.menuSystem.back(); });

    this.modeState.sub(([isActive, mode]) => {
      this.getItem(4).disabled.set(!isActive);

      this.getItem(2).value.set(false);
      this.getItem(4).value.set(false);
      this.getItem(5).value.set(false);

      if (isActive) {
        switch (mode) {
          case WeatherRadarOperatingMode.Standby:
            this.getItem(2).value.set(true);
            break;
          case WeatherRadarOperatingMode.Weather:
            this.getItem(4).value.set(true);
            break;
        }
      }
    }, true);
  }

  /**
   * Responds to when the weather mode softkey is pressed.
   */
  private onWeatherModePressed(): void {
    if (this.operatingModeSetting.value === WeatherRadarOperatingMode.Standby && this.isOnGround.get()) {
      const input: MessageDialogDefinition = {
        renderContent: (): VNode => {
          return (
            <div>
              CAUTION:<br />Activating radar on ground. Read and follow all safety precautions. Continue activating radar?
            </div>
          );
        },
        confirmButtonText: 'YES',
        hasRejectButton: true,
        rejectButtonText: 'NO'
      };
      this.viewService.open('MessageDialog', true).setInput(input).onAccept.on((sender, accept) => {
        if (accept) {
          this.operatingModeSetting.value = WeatherRadarOperatingMode.Weather;
        }
      });
    } else {
      this.operatingModeSetting.value = WeatherRadarOperatingMode.Weather;
    }
  }
}
