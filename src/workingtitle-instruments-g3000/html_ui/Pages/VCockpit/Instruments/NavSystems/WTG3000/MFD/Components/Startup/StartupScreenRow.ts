import { Subscribable } from '@microsoft/msfs-sdk';

/**
 * A description of an MFD startup screen row.
 */
export type StartupScreenRowDefinition = {
  /** The absolute path to the row icon's image asset. */
  iconFilePath: string;

  /** The row's title text. */
  title: string;

  /** The row's value text. */
  value: string | Subscribable<string>;

  /** Whether the row should display as caution (amber). Defaults to `false`. */
  caution?: boolean | Subscribable<boolean>;

  /** A function to execute when the startup screen is destroyed. */
  onDestroy?: () => void;
};

/**
 * A function which returns an object describing an MFD startup screen row.
 */
export type StartupScreenRowFactory = (simTime: Subscribable<number>) => Readonly<StartupScreenRowDefinition>;

/**
 * Keys defining pre-built MFD startup screen rows.
 */
export enum StartupScreenPrebuiltRow {
  /**
   * The system row. Displays the name of the airplane as the title and the avionics system version as the value.
   */
  System = 'System',

  /**
   * The navigation row. Displays the expiration date of the current navigation database. The row will be rendered in
   * amber if the simulation time is past the expiration date.
   */
  Navigation = 'Navigation'
}