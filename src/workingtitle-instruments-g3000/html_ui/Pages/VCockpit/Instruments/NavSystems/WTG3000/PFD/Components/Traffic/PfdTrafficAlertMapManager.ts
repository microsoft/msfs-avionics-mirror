import { EventBus, SubscribableSetEventType, Subscription, TcasAdvisoryDataProvider, TcasAlertLevel } from '@microsoft/msfs-sdk';
import { MapUserSettings, PfdIndex, PfdMapLayoutSettingMode, PfdUserSettings } from '@microsoft/msfs-wtg3000-common';

/**
 * A manager for traffic alert PFD map display settings. Automatically displays the PFD traffic inset map, or enables
 * the display of traffic on the inset or HSI map if either is already displayed, when a traffic or resolution advisory
 * is issued.
 */
export class PfdTrafficAlertMapManager {
  private readonly pfdMapLayoutSetting = PfdUserSettings.getAliasedManager(this.bus, this.pfdIndex).getSetting('pfdMapLayout');
  private readonly pfdMapTrafficShowSetting = MapUserSettings.getPfdManager(this.bus, this.pfdIndex).getSetting('mapTrafficShow');

  private isAlive = true;
  private isInit = false;

  private taSub?: Subscription;
  private raSub?: Subscription;

  /**
   * Constructor.
   * @param pfdIndex The index of this manager's PFD.
   * @param bus The event bus.
   * @param advisoryDataProvider A provider of TCAS advisory data.
   */
  public constructor(
    private readonly pfdIndex: PfdIndex,
    private readonly bus: EventBus,
    private readonly advisoryDataProvider: TcasAdvisoryDataProvider
  ) {
  }

  /**
   * Initializes this manager. Once this manager is initialized, it will automatically display the PFD traffic inset
   * map, or enable the display of traffic on the inset or HSI map if either is already displayed, when a traffic or
   * resolution advisory is issued.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('PfdTrafficAlertMapManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    this.taSub = this.advisoryDataProvider.taIntruders.sub((set, type) => {
      this.onAdvisoryChanged(TcasAlertLevel.TrafficAdvisory, type);
    });
    this.raSub = this.advisoryDataProvider.raIntruders.sub((set, type) => {
      this.onAdvisoryChanged(TcasAlertLevel.ResolutionAdvisory, type);
    });
  }

  /**
   * Responds to when an advisory is issued or cancelled.
   * @param alertLevel The level of the changed advisory.
   * @param type The type of change: whether the advisory was added or removed.
   */
  private onAdvisoryChanged(
    alertLevel: TcasAlertLevel.TrafficAdvisory | TcasAlertLevel.ResolutionAdvisory,
    type: SubscribableSetEventType
  ): void {
    const raCount = this.advisoryDataProvider.raIntruders.size;
    const taCount = this.advisoryDataProvider.taIntruders.size;

    let shouldShowMap = false;

    if (raCount > 0) {
      shouldShowMap = alertLevel === TcasAlertLevel.ResolutionAdvisory && type === SubscribableSetEventType.Added;
    } else if (taCount > 0) {
      shouldShowMap = alertLevel === TcasAlertLevel.TrafficAdvisory && type === SubscribableSetEventType.Added;
    }

    const mapLayoutMode = this.pfdMapLayoutSetting.value;
    if (shouldShowMap && mapLayoutMode !== PfdMapLayoutSettingMode.Traffic) {
      if (mapLayoutMode === PfdMapLayoutSettingMode.Off) {
        this.pfdMapLayoutSetting.value = PfdMapLayoutSettingMode.Traffic;
      } else {
        this.pfdMapTrafficShowSetting.value = true;
      }
    }
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.taSub?.destroy();
    this.raSub?.destroy();
  }
}