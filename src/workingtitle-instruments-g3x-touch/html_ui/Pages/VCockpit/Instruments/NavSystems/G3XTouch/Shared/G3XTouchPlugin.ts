import {
  AvionicsPlugin, CasSystem, EventBus, FacilityLoader, FlightPathCalculator, InstrumentBackplane, Subscribable,
  UserSetting, VNode
} from '@microsoft/msfs-sdk';

import { PfdInsetRegistrar } from '../GduDisplay/Gdu460/PfdInstruments/Inset/PfdInsetRegistrar';
import { MfdMainPageRegistrar } from '../MFD/MainView/MfdMainPageRegistrar';
import { PfdPageRegistrar } from '../PFD/PfdPage/PfdPageRegistrar';
import { AvionicsConfig } from './AvionicsConfig/AvionicsConfig';
import { G3XFms } from './FlightPlan/G3XFms';
import { G3XFplSourceDataProvider } from './FlightPlan/G3XFplSourceDataProvider';
import { G3XTouchUiComponentContext } from './G3XTouchUiComponentContext';
import { InstrumentConfig } from './InstrumentConfig/InstrumentConfig';
import { G3XTouchNavIndicators } from './NavReference/G3XTouchNavReference';
import { DisplayUserSettingManager } from './Settings/DisplayUserSettings';
import { GduUserSettingManager } from './Settings/GduUserSettings';
import { PfdUserSettingManager } from './Settings/PfdUserSettings';
import { UiService } from './UiSystem/UiService';

/**
 * A plugin binder for G3X Touch plugins.
 */
export interface G3XTouchPluginBinder {
  /** The event bus. */
  bus: EventBus;

  /** The backplane instance. */
  backplane: InstrumentBackplane;

  /** The global avionics configuration object. */
  config: AvionicsConfig;

  /** The instrument configuration object. */
  instrumentConfig: InstrumentConfig;

  /** The facility loader. */
  facLoader: FacilityLoader;

  /** The lateral flight plan path calculator. */
  flightPathCalculator: FlightPathCalculator;

  /** The FMS instance. */
  fms: G3XFms;

  /** The UI service. */
  uiService: UiService;

  /** A collection of all navigation indicators. */
  navIndicators: G3XTouchNavIndicators;

  /** The CAS system. */
  casSystem: CasSystem;

  /** A provider of flight plan source data. */
  fplSourceDataProvider: G3XFplSourceDataProvider;

  /** A manager for GDU user settings. */
  gduSettingManager: GduUserSettingManager;

  /** A manager for display user settings. */
  displaySettingManager: DisplayUserSettingManager;

  /** A manager for PFD user settings. */
  pfdSettingManager: PfdUserSettingManager;
}

/**
 * A G3X Touch plugin.
 */
export interface G3XTouchPlugin extends AvionicsPlugin<G3XTouchPluginBinder> {
  /**
   * Lifecycle method called during instrument initialization, after all plugins have been loaded.
   */
  onInit(): void;

  /**
   * Registers UI views.
   * @param uiService The UI service with which to register views.
   * @param context A context containing references to items used to create the base G3X Touch's UI views.
   */
  registerUiViews?(uiService: UiService, context: Readonly<G3XTouchUiComponentContext>): void;

  /**
   * Registers MFD main pages.
   * @param registrar The registrar with which to register pages.
   * @param context References to items used to create the base G3X Touch's MFD main pages.
   */
  registerMfdMainPages?(registrar: MfdMainPageRegistrar, context: Readonly<G3XTouchUiComponentContext>): void;

  /**
   * Registers PFD pages.
   * @param registrar The registrar with which to register pages.
   * @param context References to items used to create the base G3X Touch's PFD pages.
   */
  registerPfdPages?(registrar: PfdPageRegistrar, context: Readonly<G3XTouchUiComponentContext>): void;

  /**
   * Registers PFD insets.
   * @param registrar The registrar with which to register insets.
   * @param context References to items used to create the base G3X Touch's PFD insets.
   */
  registerPfdInsets?(registrar: PfdInsetRegistrar, context: Readonly<G3XTouchUiComponentContext>): void;

  /**
   * Renders the contents of the EIS.
   * @returns The contents of the EIS, as a VNode, or `null` if nothing is to be rendered.
   */
  renderEis?(): VNode | null;

  /**
   * Renders components to the PFD instruments view. Any top-level component (not a child of another
   * `DisplayComponent`) that implements the `PfdInstrumentsPluginComponent` interface will have its callback methods
   * called in response to the corresponding triggers.
   * @param declutter Whether the PFD is decluttered.
   * @returns Components to render to the PFD instruments view, as a VNode, or `null` if nothing is to be rendered.
   */
  renderToPfdInstruments?(declutter: Subscribable<boolean>): VNode | null;

  /**
   * Gets global user settings whose values should be saved across flight sessions. Global settings are those with
   * (un-aliased) names that are unique across the entire airplane.
   * @returns An iterable of global user settings whose values should be saved across flight sessions.
   */
  getPersistentGlobalSettings?(): Iterable<UserSetting<any>>;

  /**
   * Gets instrument-local user settings whose values should be saved across flight sessions. Instrument-local user
   * settings are those with (un-aliased) names that are only unique to their local JS instrument.
   * @returns An iterable of instrument-local user settings whose values should be saved across flight sessions.
   */
  getPersistentLocalSettings?(): Iterable<UserSetting<any>>;
}

/**
 * An abstract implementation of {@link G3XTouchPlugin} that by default does nothing. Subclasses should override the
 * appropriate methods to provide desired functionality.
 */
export abstract class AbstractG3XTouchPlugin extends AvionicsPlugin<G3XTouchPluginBinder> implements G3XTouchPlugin {
  /** @inheritDoc */
  public onInstalled(): void {
    // noop
  }

  /** @inheritDoc */
  public onInit(): void {
    // noop
  }
}