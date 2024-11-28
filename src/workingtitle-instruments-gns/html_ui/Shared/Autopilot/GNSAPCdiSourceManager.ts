import {
  APLateralModes, APVerticalModes, CdiControlEvents, CdiEvents, CdiEventsForId, ConsumerSubject, ConsumerValue,
  ControlEvents, EventBus, NavRadioIndex, NavSourceId, NavSourceType, SimVarValueType, Subscription, Value
} from '@microsoft/msfs-sdk';

import { GarminNavToNavManager2Guidance } from '@microsoft/msfs-garminsdk';
import { GNSAPEvents } from './GNSAPEvents';
import { GNSAPCdiId } from './GNSAPTypes';

/**
 * A manager for the internal GNS autopilot's CDI source state.
 */
export class GNSAPCdiSourceManager {
  private readonly publisher = this.bus.getPublisher<
    CdiEventsForId<GNSAPCdiId> & CdiControlEvents & Pick<ControlEvents, 'approach_available'>
  >();

  private readonly gns1CdiSource = ConsumerSubject.create<Readonly<NavSourceId>>(null, { type: NavSourceType.Nav, index: 1 });
  private readonly gns2CdiSource = ConsumerSubject.create<Readonly<NavSourceId>>(null, { type: NavSourceType.Nav, index: 2 });

  private readonly gns1ApproachActive = ConsumerSubject.create(null, false);
  private readonly gns2ApproachActive = ConsumerSubject.create(null, false);

  private readonly gns1NavToNavGuidance = this.createNavToNavGuidance(1);
  private readonly gns2NavToNavGuidance = this.createNavToNavGuidance(2);

  private navigatorIndex: 1 | 2 | undefined = undefined;
  private activeNavToNavGuidance: Omit<GarminNavToNavManager2Guidance, 'canSwitchCdi'> = this.gns1NavToNavGuidance;

  private readonly gns1CdiSourceSub: Subscription;
  private readonly gns2CdiSourceSub: Subscription;

  private readonly gns1ApproachActiveSub: Subscription;
  private readonly gns2ApproachActiveSub: Subscription;

  /** The nav-to-nav guidance to use for the autopilot. */
  public readonly navToNavGuidance: GarminNavToNavManager2Guidance = {
    cdiId: { get: () => this.activeNavToNavGuidance.cdiId.get() },
    armableNavRadioIndex: { get: () => this.activeNavToNavGuidance.armableNavRadioIndex.get() },
    armableLateralMode: { get: () => this.activeNavToNavGuidance.armableLateralMode.get() },
    armableVerticalMode: { get: () => this.activeNavToNavGuidance.armableVerticalMode.get() },
    canSwitchCdi: Value.create(false),
    isExternalCdiSwitchInProgress: { get: () => this.activeNavToNavGuidance.isExternalCdiSwitchInProgress.get() }
  };

  /**
   * Creates a new instance of GNSAPCdiSourceManager.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {
    const sub = bus.getSubscriber<CdiEvents & GNSAPEvents>();
    this.gns1CdiSource.setConsumer(sub.on('cdi_select_gns1'));
    this.gns2CdiSource.setConsumer(sub.on('cdi_select_gns2'));

    this.gns1ApproachActive.setConsumer(sub.on('gns_ap_approach_active_1'));
    this.gns2ApproachActive.setConsumer(sub.on('gns_ap_approach_active_2'));

    this.gns1CdiSourceSub = this.gns1CdiSource.sub(this.onGnsCdiSourceChanged.bind(this), false, true);
    this.gns2CdiSourceSub = this.gns2CdiSource.sub(this.onGnsCdiSourceChanged.bind(this), false, true);

    this.gns1ApproachActiveSub = this.gns1ApproachActive.sub(this.onGnsApproachActiveChanged.bind(this), false, true);
    this.gns2ApproachActiveSub = this.gns2ApproachActive.sub(this.onGnsApproachActiveChanged.bind(this), false, true);

    const navigatorIndex = SimVar.GetSimVarValue('AUTOPILOT NAV SELECTED', SimVarValueType.Number);
    this.setNavigatorIndex(navigatorIndex);
    if (navigatorIndex !== 1 && navigatorIndex !== 2) {
      SimVar.SetSimVarValue('K:AP_NAV_SELECT_SET', SimVarValueType.Number, 1);
    }
  }

  /**
   * Creates a set of nav-to-nav manager guidance data for an indexed GNS navigator.
   * @param index The NAV radio index of the GNS navigator for which to create guidance data.
   * @returns A set of nav-to-nav manager guidance data for the specified indexed GNS navigator.
   */
  private createNavToNavGuidance(index: 1 | 2): Omit<GarminNavToNavManager2Guidance, 'canSwitchCdi'> {
    const sub = this.bus.getSubscriber<GNSAPEvents>();

    return {
      cdiId: Value.create(`gns${index}`),
      armableNavRadioIndex: ConsumerValue.create<NavRadioIndex | -1>(sub.on(`gns_ap_nav_to_nav_armable_nav_radio_index_${index}`), -1),
      armableLateralMode: ConsumerValue.create(sub.on(`gns_ap_nav_to_nav_armable_lateral_mode_${index}`), APLateralModes.NONE),
      armableVerticalMode: ConsumerValue.create(sub.on(`gns_ap_nav_to_nav_armable_vertical_mode_${index}`), APVerticalModes.NONE),
      isExternalCdiSwitchInProgress: ConsumerValue.create(sub.on(`gns_ap_nav_to_nav_external_switch_in_progress_${index}`), false)
    };
  }

  /**
   * Sets the index of the GNS navigator used by the autopilot.
   * @param index The index to set.
   */
  public setNavigatorIndex(index: 1 | 2): void {
    if (this.navigatorIndex === index) {
      return;
    }

    this.navigatorIndex = index;
    this.activeNavToNavGuidance = index === 1 ? this.gns1NavToNavGuidance : this.gns2NavToNavGuidance;

    this.gns1CdiSourceSub.pause();
    this.gns2CdiSourceSub.pause();
    this.gns1ApproachActiveSub.pause();
    this.gns2ApproachActiveSub.pause();

    if (index === 1) {
      this.gns1CdiSourceSub.resume(true);
      this.gns1ApproachActiveSub.resume(true);
    } else {
      this.gns2CdiSourceSub.resume(true);
      this.gns2ApproachActiveSub.resume(true);
    }
  }

  /**
   * Toggles the CDI mode of the GNS navigator currently being used by the autopilot between GPS/NAV.
   */
  public toggleGpsNav(): void {
    if (this.navigatorIndex === 1) {
      this.publisher.pub('cdi_src_gps_toggle_gns1', undefined, true, false);
    } else if (this.navigatorIndex === 2) {
      this.publisher.pub('cdi_src_gps_toggle_gns2', undefined, true, false);
    }
  }

  /**
   * Responds to when the CDI source of the GNS navigator currently being used by the autopilot changes.
   * @param source The new CDI source.
   */
  private onGnsCdiSourceChanged(source: Readonly<NavSourceId>): void {
    this.publisher.pub('cdi_select_gnsAP', { ...source }, true, true);
    SimVar.SetSimVarValue('GPS DRIVES NAV1', SimVarValueType.Bool, source.type === NavSourceType.Gps);
  }

  /**
   * Responds to when the FMS flight phase approach is active flag of the GNS navigator currently being used by the
   * autopilot changes.
   * @param active Whether the approach is active.
   */
  private onGnsApproachActiveChanged(active: boolean): void {
    this.publisher.pub('approach_available', active, true, true);
  }
}
