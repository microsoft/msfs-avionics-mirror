import { Subscribable } from '@microsoft/msfs-sdk';

/**
 * A description of a startup view database row.
 */
export type StartupViewRowDefinition = {
  /** The absolute path to the row icon's image asset. */
  iconFilePath: string;

  /** The row's title text. */
  title: string;

  /** The row's value text. */
  value?: string | Subscribable<string>;

  /** Whether the row should display as caution (amber). Defaults to `false`. */
  caution?: boolean | Subscribable<boolean>;

  /** A function to execute when the startup view is destroyed. */
  onDestroy?: () => void;
};

/**
 * A function which returns an object describing a startup view database row.
 */
export type StartupViewRowFactory = (simTime: Subscribable<number>) => Readonly<StartupViewRowDefinition>;

/**
 * Keys defining pre-built startup view rows.
 */
export enum StartupViewPrebuiltRow {
  /**
   * The navigation row. Displays the expiration date of the current navigation database. The row will be rendered in
   * amber if the simulation time is past the expiration date.
   */
  Navigation = 'Navigation',

  /** The terrain row. */
  Terrain = 'Terrain'
}