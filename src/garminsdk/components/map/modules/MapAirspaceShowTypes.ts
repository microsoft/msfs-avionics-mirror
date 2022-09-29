import { BitFlags, BoundaryType } from 'msfssdk';

/**
 * Airspace show types for Garmin maps.
 */
export enum AirspaceShowType {
  ClassB = 'ClassB',
  ClassC = 'ClassC',
  ClassD = 'ClassD',
  Restricted = 'Restricted',
  MOA = 'MOA',
  Other = 'Other'
}

/**
 * A map of Garmin map airspace show types to their associated boundary filters.
 */
export type GarminAirspaceShowTypes = Record<AirspaceShowType, number>;

/**
 * A utility class containing a map of Garmin map airspace show types to their associated boundary filters.
 */
export class GarminAirspaceShowTypeMap {
  /** A map of Garmin map airspace show types to their associated boundary filters. */
  public static readonly MAP: GarminAirspaceShowTypes = {
    [AirspaceShowType.ClassB]: 1 << BoundaryType.ClassB,
    [AirspaceShowType.ClassC]: 1 << BoundaryType.ClassC,
    [AirspaceShowType.ClassD]: 1 << BoundaryType.ClassD,
    [AirspaceShowType.Restricted]: BitFlags.union(1 << BoundaryType.Restricted, 1 << BoundaryType.Prohibited),
    [AirspaceShowType.MOA]: 1 << BoundaryType.MOA,
    [AirspaceShowType.Other]: BitFlags.union(
      1 << BoundaryType.ClassE,
      1 << BoundaryType.Warning,
      1 << BoundaryType.Alert,
      1 << BoundaryType.Danger,
      1 << BoundaryType.Training
    )
  };
}