/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  CdiControlEventsForId, CdiEvents, CdiUtils, ConsumerSubject, EventBus, KeyEventData, KeyEventManager, KeyEvents, MappedSubject,
  NavSourceId,
  NavSourceType, SimVarValueType, Subscribable, Subscription
} from '@microsoft/msfs-sdk';

import { G3XCdiId, G3XExternalNavigatorIndex } from '../CommonTypes';
import { G3XFplSourceEvents } from '../FlightPlan/G3XFplSourceEvents';
import { G3XFplSource } from '../FlightPlan/G3XFplSourceTypes';
import { FplSourceUserSettings, G3XFplSourceSettingMode } from '../Settings/FplSourceUserSettings';
import { G3XActiveNavSource, G3XNavEvents, G3XNavVars } from './G3XNavEvents';

/**
 * An external navigator definition for {@link ActiveNavSourceManager}.
 */
export type ActiveNavSourceManagerExternalNavigatorDefinition = {
  /** Whether NAV radio data can be received from the external navigator. */
  supportNav: boolean;

  /** Whether GPS navigation data can be received from the external navigator. */
  supportGps: boolean;

  /** The ID of the CDI used by the external navigator. */
  cdiId?: string;
};

/**
 * Configuration options for {@link ActiveNavSourceManager}.
 */
export type ActiveNavSourceManagerOptions = {
  /**
   * Whether to keep the active navigation source synchronized with the sim's `GPS DRIVES NAV1` and
   * `AUTOPILOT NAV SELECTED` SimVars.
   */
  syncWithSim: boolean;

  /** Whether to allow the active navigation source to be set using key events. */
  setFromKeyEvents: boolean;
};

/**
 * An entry describing an external navigator.
 */
type ExternalNavigatorEntry = {
  /** The index of the external navigator. */
  index: G3XExternalNavigatorIndex;

  /** The NAV radio active navigation source associated with the external navigator. */
  navNavSource: G3XActiveNavSource.Nav1 | G3XActiveNavSource.Nav2;

  /** The GPS active navigation source associated with the external navigator. */
  gpsNavSource: G3XActiveNavSource.Gps1 | G3XActiveNavSource.Gps2;

  /** The flight plan source associated with the external navigator. */
  fplSource: G3XFplSource.External1 | G3XFplSource.External2;

  /** Whether NAV radio data can be received from the external navigator. */
  supportNav: boolean;

  /** Whether GPS navigation data can be received from the external navigator. */
  supportGps: boolean;

  /** Whether GPS navigation data is available from the external navigator. */
  isGpsAvailable?: ConsumerSubject<boolean>;

  /** Whether the external navigator has selected GPS as its CDI source. */
  cdiSource?: ConsumerSubject<Readonly<NavSourceId> | undefined>;

  /** Whether the external navigator has selected GPS as its CDI source. */
  isGpsSelected?: Subscribable<boolean>;

  /** A subscription to the GPS availability and CDI source state of the external navigator. */
  gpsStateSub?: Subscription;
};

/**
 * A manager for the active navigation source. Changes the active navigation source in response to control events and
 * keeps various data in sync with the active nav source.
 */
export class ActiveNavSourceManager {
  private readonly publisher = this.bus.getPublisher<CdiEvents & G3XFplSourceEvents>();

  private readonly syncWithSim: boolean;
  private readonly setFromKeyEvents: boolean;

  private readonly externalNavigatorEntries: (ExternalNavigatorEntry | undefined)[];

  private readonly fplSourceSetting = FplSourceUserSettings.getManager(this.bus).getSetting('fplSource');

  private keyEventManager?: KeyEventManager;

  private keyEventManagerReadyPromiseResolve!: () => void;
  private keyEventManagerReadyPromiseReject!: (reason?: any) => void;
  private readonly keyEventManagerReadyPromise = new Promise<void>((resolve, reject) => {
    this.keyEventManagerReadyPromiseResolve = resolve;
    this.keyEventManagerReadyPromiseReject = reject;
  });

  private activeNavigatorIndex: 0 | G3XExternalNavigatorIndex = 0;
  private activeNavigatorIsGps = true;

  private fplSourceSettingSub?: Subscription;

  private srcSetSub?: Subscription;
  private srcSwitchSub?: Subscription;

  private isAlive = true;
  private isInit = false;

  private keyEventSub?: Subscription;

  /**
   * Creates a new instance of ActiveNavSourceManager.
   * @param bus The event bus.
   * @param externalNavigatorDefs Definitions describing external navigators, indexed by external navigator index.
   * @param options Options with which to configure the manager.
   */
  public constructor(
    private readonly bus: EventBus,
    externalNavigatorDefs: readonly (Readonly<ActiveNavSourceManagerExternalNavigatorDefinition> | undefined)[],
    options: Readonly<ActiveNavSourceManagerOptions>
  ) {
    this.externalNavigatorEntries = externalNavigatorDefs.slice(0, 3).map(this.createExternalNavigatorEntry.bind(this));

    this.syncWithSim = options.syncWithSim;
    this.setFromKeyEvents = options.setFromKeyEvents;

    // Initialize flight plan source topic.
    this.publisher.pub('g3x_fpl_source_current', G3XFplSource.Internal, true, true);

    KeyEventManager.getManager(this.bus).then(manager => {
      this.keyEventManager = manager;
      if (this.isAlive) {
        this.keyEventManagerReadyPromiseResolve();
      }
    });
  }

  /**
   * Creates an entry for an external navigator from a definition.
   * @param def The external navigator definition from which to create an entry.
   * @param index The index of the external navigator.
   * @returns An entry for the external navigator described by the specified definition, or `undefined` if an entry
   * could not be created.
   */
  private createExternalNavigatorEntry(
    def: Readonly<ActiveNavSourceManagerExternalNavigatorDefinition> | undefined,
    index: number
  ): ExternalNavigatorEntry | undefined {
    if ((index !== 1 && index !== 2) || !def || !(def.supportNav || def.supportGps)) {
      return undefined;
    }

    const sub = this.bus.getSubscriber<CdiEvents & G3XNavEvents & G3XFplSourceEvents>();

    let isGpsAvailable: ConsumerSubject<boolean> | undefined = undefined;
    let cdiSource: ConsumerSubject<Readonly<NavSourceId> | undefined> | undefined = undefined;
    let isGpsSelected: Subscribable<boolean> | undefined = undefined;
    let gpsStateSub: Subscription | undefined = undefined;
    if (def.supportGps) {
      isGpsAvailable = ConsumerSubject.create(
        sub.on(`g3x_fpl_source_external_available_${index}`),
        SimVar.GetSimVarValue(`L:WT_G3X_Fpl_Source_External_Available:${index}`, SimVarValueType.Bool) !== 0
      ).pause();

      cdiSource = ConsumerSubject.create(
        def.cdiId === undefined
          ? null
          : sub.on(`cdi_select${CdiUtils.getEventBusTopicSuffix(def.cdiId)}`),
        undefined
      ).pause();

      isGpsSelected = cdiSource.map(source => source !== undefined && source.type === NavSourceType.Gps);

      gpsStateSub = MappedSubject.create(
        isGpsAvailable,
        isGpsSelected
      ).sub(this.onExternalGpsStateChanged.bind(this, index), false, true);
    }

    return {
      index,
      navNavSource: index === 1 ? G3XActiveNavSource.Nav1 : G3XActiveNavSource.Nav2,
      gpsNavSource: index === 1 ? G3XActiveNavSource.Gps1 : G3XActiveNavSource.Gps2,
      fplSource: index === 1 ? G3XFplSource.External1 : G3XFplSource.External2,
      supportNav: def.supportNav,
      supportGps: def.supportGps,
      isGpsAvailable,
      cdiSource,
      isGpsSelected,
      gpsStateSub
    };
  }

  /**
   * Waits for this manager's key event manager to be ready.
   * @returns A Promise which will be fulfilled when this manager's key event manager is ready, or rejected if this
   * manager is destroyed before then.
   */
  private awaitKeyEventManagerReady(): Promise<void> {
    return this.keyEventManagerReadyPromise;
  }

  /**
   * Initializes this manager. Once this manager is initialized, it will manage the active navigation source in
   * response to control events and keep various data in sync with the active nav source.
   * @throws Error if this manager has been destroyed.
   */
  public async init(): Promise<void> {
    if (!this.isAlive) {
      throw new Error('ActiveNavSourceManager: cannot initialize a dead manager');
    }

    if (this.setFromKeyEvents) {
      try {
        await this.awaitKeyEventManagerReady();
      } catch {
        return;
      }
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    for (const entry of this.externalNavigatorEntries) {
      if (entry) {
        entry.isGpsAvailable?.resume();
        entry.cdiSource?.resume();
      }
    }

    this.initSource();

    this.fplSourceSettingSub = this.fplSourceSetting.sub(this.onFplSourceSettingChanged.bind(this));

    const sub = this.bus.getSubscriber<CdiControlEventsForId<G3XCdiId> & KeyEvents>();

    this.srcSwitchSub = sub.on('cdi_src_switch_g3x').handle(this.switchActiveNavigator.bind(this));

    if (this.setFromKeyEvents) {
      this.keyEventManager!.interceptKey('AP_NAV_SELECT_SET', false);
      this.keyEventManager!.interceptKey('TOGGLE_GPS_DRIVES_NAV1', false);

      this.keyEventSub = sub.on('key_intercept').handle(this.onKeyIntercepted.bind(this));
    }
  }

  /**
   * Initializes the active navigation source.
   */
  private initSource(): void {
    if (this.fplSourceSetting.value === G3XFplSourceSettingMode.External) {
      if (this.externalNavigatorEntries[1]?.supportGps) {
        this.setNavigationSourceToExternal(this.externalNavigatorEntries[1], false);
      } else if (this.externalNavigatorEntries[2]?.supportGps) {
        this.setNavigationSourceToExternal(this.externalNavigatorEntries[2], false);
      } else {
        this.setNavigationSourceToInternal();
      }
    } else {
      this.setNavigationSourceToInternal();
    }
  }

  /**
   * Responds to when the flight plan source setting value changes.
   * @param setting The new setting value.
   */
  private onFplSourceSettingChanged(setting: G3XFplSourceSettingMode): void {
    if (setting === G3XFplSourceSettingMode.External) {
      // Switching from internal -> external:
      // If the current active navigator is the internal navigator, then try to switch to the first supported external
      // navigator. Otherwise, try to preserve the current active navigator. In either case, if the first choice is
      // for some reason not supported, try to switch to the other external navigator. If no external navigators are
      // supported, then default to the internal navigator.

      const start = Math.max(this.activeNavigatorIndex, 1);
      for (let steps = 0; steps < 2; steps++) {
        const index = (start + steps - 1) % 2 + 1;
        const entry = this.externalNavigatorEntries[index];
        if (entry) {
          this.setNavigationSourceToExternal(entry, false);
          return;
        }
      }

      if (this.activeNavigatorIndex !== 0) {
        this.setNavigationSourceToInternal();
      }
    } else {
      // Switching from external -> internal:
      // If the current active navigator is the internal navigator, then do nothing. If the current active navigator is
      // external and NAV is selected, then preserve the current navigator. If the current active navigator is external
      // and GPS is selected, then switch to the internal navigator.

      if (this.activeNavigatorIndex !== 0) {
        const entry = this.externalNavigatorEntries[this.activeNavigatorIndex];
        if (!entry || !entry.supportNav || this.activeNavigatorIsGps) {
          this.setNavigationSourceToInternal();
        } else {
          this.setNavigationSourceToExternal(entry, true);
        }
      }
    }
  }

  /**
   * Responds to when a key event is intercepted.
   * @param data The data for the intercepted key event.
   */
  private onKeyIntercepted(data: KeyEventData): void {
    switch (data.key) {
      case 'AP_NAV_SELECT_SET':
        if (data.value0 !== undefined && (data.value0 === 1 || data.value0 === 2)) {
          const entry = this.externalNavigatorEntries[data.value0];
          if (this.fplSourceSetting.value === G3XFplSourceSettingMode.External) {
            if (entry) {
              this.setNavigationSourceToExternal(entry, false);
            }
          } else {
            if (entry?.supportNav) {
              this.setNavigationSourceToExternal(entry, true);
            }
          }
        }
        break;
      case 'TOGGLE_GPS_DRIVES_NAV1': {
        if (this.fplSourceSetting.value !== G3XFplSourceSettingMode.External) {
          if (this.activeNavigatorIndex === 0) {
            this.switchActiveNavigator();
          } else {
            this.setNavigationSourceToInternal();
          }
        }
        break;
      }
    }
  }

  /**
   * Sets the active navigation source to the internal GPS navigator.
   */
  private setNavigationSourceToInternal(): void {
    this.externalNavigatorEntries[1]?.gpsStateSub?.pause();
    this.externalNavigatorEntries[2]?.gpsStateSub?.pause();

    this.activeNavigatorIndex = 0;
    this.activeNavigatorIsGps = true;
    this.publishActiveNavigatorIndex(0);
    this.publishFplSource(G3XFplSource.Internal);
    this.publishActiveNavSource(G3XActiveNavSource.GpsInternal);
  }

  /**
   * Sets the active navigation source to an external navigator.
   * @param entry The entry describing the external navigator to which to set the active navigation source.
   * @param forceFplSourceToInternal Whether to force the flight plan source to the internal flight plan. If `true`,
   * then the active navigation source will be set the external navigator's NAV radio navigation source. If `false`,
   * then the active navigation source will be set according to the external navigator's CDI source selection.
   */
  private setNavigationSourceToExternal(entry: ExternalNavigatorEntry, forceFplSourceToInternal: boolean): void {
    this.externalNavigatorEntries[entry.index === 1 ? 2 : 1]?.gpsStateSub?.pause();

    this.activeNavigatorIndex = entry.index;
    this.publishActiveNavigatorIndex(entry.index);

    if (forceFplSourceToInternal) {
      entry.gpsStateSub?.pause();

      this.activeNavigatorIsGps = false;
      this.publishFplSource(G3XFplSource.Internal);
      this.publishActiveNavSource(entry.navNavSource);
    } else {
      if (entry.gpsStateSub) {
        entry.gpsStateSub.resume(true);
      } else {
        this.onExternalGpsStateChanged(entry.index);
      }
    }
  }

  /**
   * Responds to when the GPS state of an external navigator changes.
   * @param index The index of the external navigator whose GPS state changed.
   */
  private onExternalGpsStateChanged(index: G3XExternalNavigatorIndex): void {
    const entry = this.externalNavigatorEntries[index];

    if (!entry) {
      return;
    }

    const isGpsAvailable = entry.isGpsAvailable?.get() === true;

    this.publishFplSource(isGpsAvailable ? entry.fplSource : G3XFplSource.InternalRev);

    if (entry.isGpsSelected?.get() === true) {
      this.activeNavigatorIsGps = true;
      this.publishActiveNavSource(isGpsAvailable ? entry.gpsNavSource : G3XActiveNavSource.GpsInternal);
    } else {
      this.activeNavigatorIsGps = false;
      this.publishActiveNavSource(entry.navNavSource);
    }
  }

  /**
   * Publishes an active navigator index.
   * @param index The index to publish.
   */
  private publishActiveNavigatorIndex(index: G3XExternalNavigatorIndex | 0): void {
    SimVar.SetSimVarValue(G3XNavVars.ActiveNavigatorIndex, SimVarValueType.Number, index);
  }

  /**
   * Publishes an active flight plan source.
   * @param source The source to publish.
   */
  private publishFplSource(source: G3XFplSource): void {
    this.publisher.pub('g3x_fpl_source_current', source, true, true);
  }

  /**
   * Publishes an active navigation source.
   * @param source The source to publish.
   */
  private publishActiveNavSource(source: G3XActiveNavSource): void {
    SimVar.SetSimVarValue(G3XNavVars.ActiveNavSource, SimVarValueType.Number, source);

    let isGps = false;
    let index = 1;

    switch (source) {
      case G3XActiveNavSource.GpsInternal:
        isGps = true;
        index = 3;
        this.publisher.pub('cdi_select_g3x', { index: 3, type: NavSourceType.Gps }, true, true);
        break;
      case G3XActiveNavSource.Gps1:
        isGps = true;
        index = 1;
        this.publisher.pub('cdi_select_g3x', { index: 1, type: NavSourceType.Gps }, true, true);
        break;
      case G3XActiveNavSource.Gps2:
        isGps = true;
        index = 2;
        this.publisher.pub('cdi_select_g3x', { index: 2, type: NavSourceType.Gps }, true, true);
        break;
      case G3XActiveNavSource.Nav1:
        index = 1;
        this.publisher.pub('cdi_select_g3x', { index: 1, type: NavSourceType.Nav }, true, true);
        break;
      case G3XActiveNavSource.Nav2:
        index = 2;
        this.publisher.pub('cdi_select_g3x', { index: 2, type: NavSourceType.Nav }, true, true);
        break;
    }

    if (this.syncWithSim) {
      SimVar.SetSimVarValue('GPS DRIVES NAV1', SimVarValueType.Bool, isGps);
      SimVar.SetSimVarValue('AUTOPILOT NAV SELECTED', SimVarValueType.Number, index === 3 ? 1 : index);
    }
  }

  /**
   * Switches the active navigator.
   */
  private switchActiveNavigator(): void {
    if (this.fplSourceSetting.value === G3XFplSourceSettingMode.External) {
      // If the external flight plan source is selected, then we will cycle between external navigators, falling back
      // to the internal GPS navigator if there are no supported external navigators.

      for (let steps = 0; steps < 2; steps++) {
        const index = (this.activeNavigatorIndex + steps) % 2 + 1;
        const entry = this.externalNavigatorEntries[index];
        if (entry) {
          this.setNavigationSourceToExternal(entry, false);
          return;
        }
      }

      if (this.activeNavigatorIndex !== 0) {
        this.setNavigationSourceToInternal();
      }
    } else {
      // If the internal flight plan source is selected, then we will cycle between the internal GPS navigator and any
      // external navigators that provide a NAV radio navigation source.

      for (let i = this.activeNavigatorIndex + 1; i < 3; i++) {
        const entry = this.externalNavigatorEntries[i];
        if (entry && entry.supportNav) {
          this.setNavigationSourceToExternal(entry, true);
          return;
        }
      }

      if (this.activeNavigatorIndex !== 0) {
        this.setNavigationSourceToInternal();
      }
    }
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.keyEventManagerReadyPromiseReject('ActiveNavSourceManager: manager was destroyed');

    for (const entry of this.externalNavigatorEntries) {
      if (entry) {
        entry.isGpsAvailable?.destroy();
        entry.cdiSource?.destroy();
      }
    }

    this.fplSourceSettingSub?.destroy();
    this.srcSetSub?.destroy();
    this.srcSwitchSub?.destroy();
    this.keyEventSub?.destroy();
  }
}
