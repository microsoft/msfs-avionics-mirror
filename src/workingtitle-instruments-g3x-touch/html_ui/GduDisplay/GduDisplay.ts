import { ComponentProps, CompositeLogicXMLHost, DisplayComponent, EventBus, NodeReference, PluginSystem, Subscribable, UserSettingManager } from '@microsoft/msfs-sdk';

import { GpsIntegrityDataProvider, NavDataBarFieldModelFactory, NavDataFieldGpsValidity, NavDataFieldRenderer } from '@microsoft/msfs-garminsdk';

import { AvionicsConfig } from '../Shared/AvionicsConfig/AvionicsConfig';
import { AvionicsStatusChangeEvent } from '../Shared/AvionicsStatus/AvionicsStatusEvents';
import { G3XNavDataBarEditController } from '../Shared/Components/CnsDataBar/CnsDataBarFields/G3XNavDataBarEditController';
import { G3XFms } from '../Shared/FlightPlan/G3XFms';
import { G3XTouchPlugin, G3XTouchPluginBinder } from '../Shared/G3XTouchPlugin';
import { InstrumentConfig } from '../Shared/InstrumentConfig/InstrumentConfig';
import { G3XRadiosDataProvider } from '../Shared/Radio/G3XRadiosDataProvider';
import { DisplayUserSettingTypes } from '../Shared/Settings/DisplayUserSettings';
import { PfdUserSettingTypes } from '../Shared/Settings/PfdUserSettings';
import { UiService } from '../Shared/UiSystem/UiService';

/**
 * Component props for a G3X Touch GDU display.
 */
export interface GduDisplayProps extends ComponentProps {
  /** The general avionics configuration object. */
  config: AvionicsConfig;

  /** The configuration object of the display's parent instrument. */
  instrumentConfig: InstrumentConfig;

  /** The plugin system of the display's parent instrument. */
  pluginSystem: PluginSystem<G3XTouchPlugin, G3XTouchPluginBinder>;

  /** The logic host for the GDU's gauges.*/
  xmlLogicHost: CompositeLogicXMLHost;

  /** The event bus. */
  bus: EventBus;

  /** The FMS instance. */
  fms: G3XFms;

  /** The UI service. */
  uiService: UiService;

  /** A provider of GPS position integrity data. */
  gpsIntegrityDataProvider: GpsIntegrityDataProvider;

  /** A provider of radio data. */
  radiosDataProvider: G3XRadiosDataProvider;

  /** The factory to use to create data models for nav data bar fields. */
  navDataBarFieldModelFactory: NavDataBarFieldModelFactory;

  /** The renderer to use to render nav data bar fields. */
  navDataBarFieldRenderer: NavDataFieldRenderer;

  /** The GPS validity state for nav data fields. */
  navDataFieldGpsValidity: Subscribable<NavDataFieldGpsValidity>;

  /** A controller for editing nav data bar fields. */
  navDataBarEditController: G3XNavDataBarEditController;

  /** A manager for display user settings. */
  displaySettingManager: UserSettingManager<DisplayUserSettingTypes>;

  /** A manager for PFD user settings. */
  pfdSettingManager: UserSettingManager<PfdUserSettingTypes>;

  /** Whether the display's UI pane 1 is visible. */
  isPane1Visible: Subscribable<boolean>;

  /** Whether the display's UI pane 2 is visible. */
  isPane2Visible: Subscribable<boolean>;

  /**
   * A function to call when the display's sim assisted checklist highlight layer element has been rendered.
   * @param ref A reference to the display's rendered sim assisted checklist highlight layer element.
   */
  onChecklistHighlightRendered?: (ref: NodeReference<HTMLElement>) => void;
}

/**
 * A G3X Touch GDU display.
 */
export interface GduDisplay<P extends GduDisplayProps = GduDisplayProps> extends DisplayComponent<P> {
  /**
   * Responds to when the avionics status of this display's parent instrument changes.
   * @param event The event describing the avionics status change.
   */
  onAvionicsStatusChanged(event: Readonly<AvionicsStatusChangeEvent>): void;
}
