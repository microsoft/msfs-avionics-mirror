import {
  BitFlags, MappedSubject, MappedSubscribable, MapSystemContext, MapSystemController, MapSystemKeys, MapTrafficAlertLevelVisibility, MapTrafficModule,
  Subscription, UnitType, UserSettingManager
} from '@microsoft/msfs-sdk';

import { TrafficUserSettings } from '../Traffic/TrafficUserSettings';
import { MapSettingsMfdAliased, MapSettingsPfdAliased, MapUserSettings, PfdOrMfd } from './MapUserSettings';

/**
 * Modules required by PlanFormatController.
 */
export interface MapTrafficControllerModules {
  /** Traffic module. */
  [MapSystemKeys.Traffic]: MapTrafficModule;
}

/**
 * A controller which handles map traffic settings.
 */
export class MapTrafficController extends MapSystemController<MapTrafficControllerModules> {
  private static readonly ALTITUDE_RESTRICTION_NORMAL = UnitType.FOOT.createNumber(2700);
  private static readonly ALTITUDE_RESTRICTION_FULL = UnitType.FOOT.createNumber(9900);

  private readonly mapSettings: UserSettingManager<MapSettingsMfdAliased | MapSettingsPfdAliased>;
  private readonly trafficSettings = TrafficUserSettings.getManager(this.context.bus);

  private readonly trafficModule = this.context.model.getModule(MapSystemKeys.Traffic);

  private show?: MappedSubscribable<boolean>;
  private rangeSub?: Subscription;
  private hsiFormatSub?: Subscription;
  private showOtherSub?: Subscription;
  private altitudeRelativeSub?: Subscription;
  private showAboveSub?: Subscription;
  private showBelowSub?: Subscription;

  /**
   * Constructor.
   * @param context The map system context to use with this controller.
   * @param pfdOrMfd Whether the map is on the PFD or MFD.
   */
  constructor(
    context: MapSystemContext<MapTrafficControllerModules>,
    pfdOrMfd: PfdOrMfd
  ) {
    super(context);

    this.mapSettings = MapUserSettings.getAliasedManager(context.bus, pfdOrMfd);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.wireSettings();
  }

  /**
   * Wires the controller to the settings manager.
   */
  private wireSettings(): void {
    this.show = MappedSubject.create(
      ([format, isTfcEnabled]): boolean => {
        return format === 'TCAS' || (isTfcEnabled && format !== 'PLAN');
      },
      this.mapSettings.getSetting('hsiFormat'),
      this.mapSettings.getSetting('tfcEnabled')
    );

    this.show.sub(show => {
      this.trafficModule.show.set(show);
    }, true);

    this.rangeSub = this.mapSettings.whenSettingChanged('mapRange').handle((range: number): void => {
      this.trafficModule.offScaleRange.set(range, UnitType.NMILE);
    });

    this.hsiFormatSub = this.mapSettings.whenSettingChanged('hsiFormat').handle(format => {
      if (format === 'TCAS') {
        this.rangeSub?.resume(true);
      } else {
        this.rangeSub?.pause();
        this.trafficModule.offScaleRange.set(NaN);
      }
    });

    this.showOtherSub = this.trafficSettings.whenSettingChanged('trafficShowOther').handle(show => {
      this.trafficModule.alertLevelVisibility.set(BitFlags.not(MapTrafficAlertLevelVisibility.All, show ? 0 : MapTrafficAlertLevelVisibility.Other));
    });

    this.altitudeRelativeSub = this.trafficSettings.whenSettingChanged('trafficAltitudeRelative').handle(isRelative => {
      this.trafficModule.isAltitudeRelative.set(isRelative);
    });

    this.showAboveSub = this.trafficSettings.whenSettingChanged('trafficShowAbove').handle(show => {
      this.trafficModule.altitudeRestrictionAbove.set(show ? MapTrafficController.ALTITUDE_RESTRICTION_FULL : MapTrafficController.ALTITUDE_RESTRICTION_NORMAL);
    });
    this.showBelowSub = this.trafficSettings.whenSettingChanged('trafficShowBelow').handle(show => {
      this.trafficModule.altitudeRestrictionBelow.set(show ? MapTrafficController.ALTITUDE_RESTRICTION_FULL : MapTrafficController.ALTITUDE_RESTRICTION_NORMAL);
    });
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.show?.destroy();
    this.rangeSub?.destroy();
    this.hsiFormatSub?.destroy();
    this.showOtherSub?.destroy();
    this.altitudeRelativeSub?.destroy();
    this.showAboveSub?.destroy();
    this.showBelowSub?.destroy();
  }
}