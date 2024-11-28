
import { MinimumsDataProvider, NavDataBarFieldModelFactory, NavDataFieldGpsValidity, NavDataFieldRenderer, TrafficSystem, VNavDataProvider, WindDataProvider } from '@microsoft/msfs-garminsdk';

import { GPSSatComputer, Subscribable } from '@microsoft/msfs-sdk';
import { PfdInsetRegistrar } from '../GduDisplay/Gdu460/PfdInstruments/Inset/PfdInsetRegistrar';
import { MfdMainPageRegistrar } from '../MFD/MainView/MfdMainPageRegistrar';
import { PfdPageRegistrar } from '../PFD/PfdPage/PfdPageRegistrar';
import { G3XNavDataBarEditController } from './Components/CnsDataBar/CnsDataBarFields/G3XNavDataBarEditController';
import { PositionHeadingDataProvider } from './Navigation/PositionHeadingDataProvider';
import { ComRadioSpacingDataProvider } from './Radio/ComRadioSpacingDataProvider';

/**
 * References to items used to create the base G3X Touch's UI views, MFD main pages, PFD pages, and PFD insets.
 */
export type G3XTouchUiComponentContext = {
  /** A provider of airplane position and heading data that updates at the instrument refresh rate. */
  posHeadingDataProvider: PositionHeadingDataProvider;

  /** A provider of minimums data. */
  minimumsDataProvider: MinimumsDataProvider;

  /** A provider of wind data. */
  windDataProvider: WindDataProvider;

  /** A provider of VNAV data. */
  vnavDataProvider: VNavDataProvider;

  /** A provider of COM radio channel spacing data. */
  comRadioSpacingDataProvider: ComRadioSpacingDataProvider;

  /**
   * An array of the GPS computers used by the GPS receiver systems connected to the G3X Touch, indexed by GPS receiver
   * system index.
   */
  gpsSatComputers: readonly GPSSatComputer[];

  /** The traffic system. */
  trafficSystem: TrafficSystem | null;

  /** The GPS validity state used by nav data fields. */
  navDataFieldGpsValidity: Subscribable<NavDataFieldGpsValidity>;

  /** A factory for CNS data bar nav data field models. */
  navDataBarFieldModelFactory: NavDataBarFieldModelFactory;

  /** A renderer for CNS data bar nav data fields. */
  navDataBarFieldRenderer: NavDataFieldRenderer;

  /** A controller for editing CNS data bar nav data fields. */
  navDataBarEditController: G3XNavDataBarEditController;

  /** The MFD main page registrar. */
  mfdMainPageRegistrar: MfdMainPageRegistrar;

  /** The PFD page registrar. */
  pfdPageRegistrar: PfdPageRegistrar;

  /** The PFD inset registrar. */
  pfdInsetRegistrar?: PfdInsetRegistrar;
};