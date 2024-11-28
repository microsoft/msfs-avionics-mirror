/**
 * An ICAO value, which uniquely identifies a facility.
 */
export interface IcaoValue {
  /** Coherent C++ object binding type. */
  readonly __Type: 'JS_ICAO';

  /** The facility's type. */
  readonly type: string;

  /** The facility's region code. */
  readonly region: string;

  /** The ident of the facility's associated airport. */
  readonly airport: string;

  /** The facility's ident. */
  readonly ident: string;
}

/**
 * ICAO type strings.
 */
export enum IcaoType {
  None = '',
  Airport = 'A',
  Vor = 'V',
  Ndb = 'N',
  Waypoint = 'W',
  Runway = 'R',
  User = 'U',
  VisualApproach = 'S',
}
