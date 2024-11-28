import { MappedSubject, Subject, Subscription, UserSettingManager } from '@microsoft/msfs-sdk';
import { MapUserSettingTypes, SoftKeyMenu, SoftKeyMenuItem } from '@microsoft/msfs-garminsdk';

/**
 * Inset/HSI map weather overlay mode.
 */
export enum WeatherOverlayMode {
  Off = 'Off',
  Radar = 'Radar',
  Datalink = 'Datalink'
}

/**
 * A controller which binds a softkey to a state which can take one of several enumerated values. Once bound, the
 * softkey will display the bound state and each press of the softkey will cycle the state through possible values.
 */
export class SoftKeyWeatherOverlayController {
  private item?: SoftKeyMenuItem;

  private readonly weatherOverlayMode = Subject.create<WeatherOverlayMode>(WeatherOverlayMode.Off);

  private statePipe?: Subscription;

  private isAlive = true;
  private isInit = false;

  /**
   * Constructor.
   * @param softkeyMenu The softkey menu to which this controller's softkey belongs.
   * @param softkeyIndex The index in the softkey menu at which this controller's softkey is located.
   * @param softkeyLabel The text label of this controller's softkey.
   * @param mapSettingManager A manager for map user settings.
   */
  constructor(
    private readonly softkeyMenu: SoftKeyMenu,
    private readonly softkeyIndex: number,
    private readonly softkeyLabel: string,
    private readonly mapSettingManager: UserSettingManager<MapUserSettingTypes>
  ) {
  }

  /**
   * Initializes this controller. This will create a softkey menu item and bind it to this controller's state.
   * @returns The softkey menu item bound to this controller's state.
   * @throws Error if this controller has been destroyed.
   */
  public init(): SoftKeyMenuItem {
    if (!this.isAlive) {
      throw new Error('WeatherOverlaySoftkeyController: cannot initialize a dead controller');
    }

    if (this.isInit) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.item!;
    }

    const nexradShowSetting = this.mapSettingManager.getSetting('mapNexradShow');

    // TODO: weather radar overlay (maybe?)
    MappedSubject.create(
      ([showNexrad]): WeatherOverlayMode => {
        return showNexrad ? WeatherOverlayMode.Datalink : WeatherOverlayMode.Off;
      },
      nexradShowSetting
    ).pipe(this.weatherOverlayMode);

    this.weatherOverlayMode.sub(mode => {
      if (mode === WeatherOverlayMode.Datalink) {
        nexradShowSetting.value = true;
      } else {
        nexradShowSetting.value = false;
      }
    }, true);

    this.item = this.softkeyMenu.addItem(this.softkeyIndex, this.softkeyLabel, () => {
      const currentMode = this.weatherOverlayMode.get();
      let nextMode;

      switch (currentMode) {
        case WeatherOverlayMode.Datalink:
          nextMode = WeatherOverlayMode.Off;
          break;
        default:
          nextMode = WeatherOverlayMode.Datalink;
          break;
      }

      this.weatherOverlayMode.set(nextMode);
    });

    this.statePipe = this.weatherOverlayMode.pipe(this.item.value, mode => {
      switch (mode) {
        case WeatherOverlayMode.Off:
          return 'Off';
        case WeatherOverlayMode.Radar:
          return 'WX Radar';
        case WeatherOverlayMode.Datalink:
          return 'Connext';
        default:
          return '';
      }
    });

    this.isInit = true;

    return this.item;
  }

  /**
   * Destroys this controller. This will remove the softkey menu item bound to this controller's state.
   */
  public destroy(): void {
    if (!this.isAlive) {
      return;
    }

    this.isAlive = false;

    if (!this.isInit) {
      return;
    }

    this.softkeyMenu.removeItem(this.softkeyIndex);
    this.statePipe?.destroy();

    this.isInit = false;
  }
}