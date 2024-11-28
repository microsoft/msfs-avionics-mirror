import { MapSystemContext, MapSystemController, MapSystemKeys, Subscribable, Subscription, UnitType } from '@microsoft/msfs-sdk';
import { TcasVerticalRange, TrafficUserSettings } from '../Settings';
import { Epic2MapTrafficModule } from './Modules/Epic2MapTrafficModule';

/**
 * Modules required by MapTrafficController.
 */
export interface MapTrafficControllerModules {
  /** Traffic module. */
  [MapSystemKeys.Traffic]: Epic2MapTrafficModule;
}

/**
 * A controller which handles map traffic settings.
 */
export class MapTrafficController extends MapSystemController<MapTrafficControllerModules> {
  private static readonly ALTITUDE_RESTRICTION_NORMAL = UnitType.FOOT.createNumber(2700);
  private static readonly ALTITUDE_RESTRICTION_FULL = UnitType.FOOT.createNumber(9900);
  private readonly trafficSettings = TrafficUserSettings.getManager(this.context.bus);
  private readonly trafficModule = this.context.model.getModule(MapSystemKeys.Traffic);
  private subs: Subscription[] = [];

  /**
   * Constructor.
   * @param context The map system context to use with this controller.
   * @param trafficEnabled Whether the TCAS data is displayed on the INAV map when in TA or TA/RA mode.
   * @param [tcasTrendVectorEnabled] Whether to display trend vectors for intruders on the INAV map.
   */
  constructor(
    context: MapSystemContext<MapTrafficControllerModules>,
    private readonly trafficEnabled: Subscribable<boolean>,
    private readonly tcasTrendVectorEnabled: Subscribable<boolean> | null = null,
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.wireSettings();
  }

  /**
   * Wires the controller to the settings manager.
   */
  private wireSettings(): void {
    this.subs.push(this.trafficEnabled.sub(showTraffic => this.trafficModule.show.set(showTraffic)));
    this.tcasTrendVectorEnabled && this.subs.push(this.tcasTrendVectorEnabled.sub(showVectors => this.trafficModule.motionVectorVisible.set(showVectors)));

    this.subs.push(this.trafficSettings.whenSettingChanged('trafficAltitudeRelative').handle(isRelative => {
      this.trafficModule.isAltitudeRelative.set(isRelative);
    }));

    this.subs.push(this.trafficSettings.whenSettingChanged('tcasVerticalRange').handle(tcasVerticalRange => {
      let exhaustiveSwitch: never;
      switch (tcasVerticalRange) {
        case TcasVerticalRange.AboveBelow:
          this.trafficModule.altitudeRestrictionAbove.set(MapTrafficController.ALTITUDE_RESTRICTION_FULL);
          this.trafficModule.altitudeRestrictionBelow.set(MapTrafficController.ALTITUDE_RESTRICTION_FULL);
          break;
        case TcasVerticalRange.Norm:
          this.trafficModule.altitudeRestrictionAbove.set(MapTrafficController.ALTITUDE_RESTRICTION_NORMAL);
          this.trafficModule.altitudeRestrictionBelow.set(MapTrafficController.ALTITUDE_RESTRICTION_NORMAL);
          break;
        default:
          exhaustiveSwitch = tcasVerticalRange;
          throw new Error(`${exhaustiveSwitch} was not handled not handled`);
      }
    }));
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();
    this.subs.forEach(sub => sub.destroy());
  }
}
