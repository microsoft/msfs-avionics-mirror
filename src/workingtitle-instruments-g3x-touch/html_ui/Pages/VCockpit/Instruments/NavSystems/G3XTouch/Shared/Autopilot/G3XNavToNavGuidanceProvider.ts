import { APLateralModes, APVerticalModes, Accessible, EventBus, NavRadioIndex, Subscription, Value } from '@microsoft/msfs-sdk';

import { GarminNavToNavManager2Guidance } from '@microsoft/msfs-garminsdk';

import { G3XExternalNavigatorIndex } from '../CommonTypes';
import { G3XFplSourceDataProvider, G3XFplSourceDataProviderSourceDef } from '../FlightPlan/G3XFplSourceDataProvider';
import { G3XAPEvents } from './G3XAPEvents';

/**
 * A provider of autopilot nav-to-nav guidance data for the G3X autopilot. The provider sources guidance data from
 * the internal GPS navigator (which does not support the nav-to-nav function) and any supported external navigators
 * and selects the data for the navigator currently in use.
 */
export class G3XNavToNavGuidanceProvider implements GarminNavToNavManager2Guidance {
  private readonly _cdiId = Value.create(this.fplSourceDataProvider.internalSourceDef.cdiId);
  /** @inheritDoc */
  public readonly cdiId = this._cdiId as Accessible<string>;

  private readonly _armableNavRadioIndex = Value.create<NavRadioIndex | -1>(-1);
  /** @inheritDoc */
  public readonly armableNavRadioIndex = this._armableNavRadioIndex as Accessible<NavRadioIndex | -1>;

  private readonly _armableLateralMode = Value.create(APLateralModes.NONE);
  /** @inheritDoc */
  public readonly armableLateralMode = this._armableLateralMode as Accessible<APLateralModes>;

  private readonly _armableVerticalMode = Value.create(APVerticalModes.NONE);
  /** @inheritDoc */
  public readonly armableVerticalMode = this._armableVerticalMode as Accessible<APVerticalModes>;

  private readonly _canSwitchCdi = Value.create(false);
  /** @inheritDoc */
  public readonly canSwitchCdi = this._canSwitchCdi as Accessible<boolean>;

  private readonly _isExternalCdiSwitchInProgress = Value.create(false);
  /** @inheritDoc */
  public readonly isExternalCdiSwitchInProgress = this._isExternalCdiSwitchInProgress as Accessible<boolean>;

  private readonly setArmableNavRadioIndex = this._armableNavRadioIndex.set.bind(this._armableNavRadioIndex);
  private readonly setArmableLateralMode = this._armableLateralMode.set.bind(this._armableLateralMode);
  private readonly setArmableVerticalMode = this._armableVerticalMode.set.bind(this._armableVerticalMode);
  private readonly setCanSwitchCdi = this._canSwitchCdi.set.bind(this._canSwitchCdi);
  private readonly setIsExternalCdiSwitchInProgress = this._isExternalCdiSwitchInProgress.set.bind(this._isExternalCdiSwitchInProgress);

  private isAlive = true;
  private isInit = false;

  private readonly sourceSubs: Subscription[] = [];

  private navigatorIndexSub?: Subscription;

  /**
   * Creates a new instance of G3XNavToNavGuidanceProvider.
   * @param bus The event bus.
   * @param fplSourceDataProvider A provider of flight plan source data.
   */
  public constructor(private readonly bus: EventBus, private readonly fplSourceDataProvider: G3XFplSourceDataProvider) {
  }

  /**
   * Initializes this provider. Once initialized, the provider will automatically update its guidance data.
   * @throws Error if this provider has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('G3XNavToNavGuidanceProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    this.navigatorIndexSub = this.fplSourceDataProvider.navigatorIndex.sub(this.onNavigatorIndexChanged.bind(this), true);
  }

  /**
   * Responds to when the index of the current flight plan source's parent navigator changes.
   * @param index The index of the current flight plan source's parent navigator.
   */
  private onNavigatorIndexChanged(index: 0 | G3XExternalNavigatorIndex): void {
    for (const sub of this.sourceSubs) {
      sub.destroy();
    }
    this.sourceSubs.length = 0;

    // Always reset all values to the defaults in case an external navigator has not initialized their event bus topics.
    this._armableNavRadioIndex.set(-1);
    this._armableLateralMode.set(APLateralModes.NONE);
    this._armableVerticalMode.set(APVerticalModes.NONE);
    this._canSwitchCdi.set(false);
    this._isExternalCdiSwitchInProgress.set(false);

    if (index === 0 || !this.fplSourceDataProvider.externalSourceDefs[index]) {
      this._cdiId.set(this.fplSourceDataProvider.internalSourceDef.cdiId);
    } else {
      const def = this.fplSourceDataProvider.externalSourceDefs[index] as Readonly<G3XFplSourceDataProviderSourceDef>;
      this._cdiId.set(def.cdiId);

      const sub = this.bus.getSubscriber<G3XAPEvents>();

      this.sourceSubs.push(
        sub.on(`g3x_external_nav_to_nav_armable_nav_radio_index_${index}`).handle(this.setArmableNavRadioIndex),
        sub.on(`g3x_external_nav_to_nav_armable_lateral_mode_${index}`).handle(this.setArmableLateralMode),
        sub.on(`g3x_external_nav_to_nav_armable_vertical_mode_${index}`).handle(this.setArmableVerticalMode),
        sub.on(`g3x_external_nav_to_nav_can_switch_${index}`).handle(this.setCanSwitchCdi),
        sub.on(`g3x_external_nav_to_nav_external_switch_in_progress_${index}`).handle(this.setIsExternalCdiSwitchInProgress),
      );
    }
  }

  /**
   * Destroys this provider. Once destroyed, the provider will no longer automatically update its guidance data.
   */
  public destroy(): void {
    this.isAlive = false;

    this.navigatorIndexSub?.destroy();

    for (const sub of this.sourceSubs) {
      sub.destroy();
    }
  }
}
