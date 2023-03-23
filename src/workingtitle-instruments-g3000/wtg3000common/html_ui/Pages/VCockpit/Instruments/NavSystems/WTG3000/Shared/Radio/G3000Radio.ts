/**
 * Types of G3000 radios.
 */
export enum G3000RadioType {
  Nav = 'Nav',
  Com = 'Com',
  Adf = 'Adf',
  Dme = 'Dme'
}

/** NAV radios */
export type NavRadio = 'NAV1' | 'NAV2';

/** COM radios. */
export type ComRadio = 'COM1' | 'COM2' | 'COM3';

/** ADF radios. */
export type AdfRadio = 'ADF1' | 'ADF2';

/** DME radios. */
export type DmeRadio = 'DME1' | 'DME2';

/**
 * A map from G3000 radio types to their associated radios.
 */
export type G3000RadioTypeMap = {
  /** NAV radios. */
  [G3000RadioType.Nav]: NavRadio;
  /** COM radios. */
  [G3000RadioType.Com]: ComRadio;
  /** ADF radios. */
  [G3000RadioType.Adf]: AdfRadio;
  /** DME radios. */
  [G3000RadioType.Dme]: DmeRadio;
};

/**
 * A map from G3000 radios to their radio types.
 */
export type G3000RadioTypeMapReverse = {
  /** NAV1 radio. */
  ['NAV1']: G3000RadioType.Nav;
  /** NAV2  radio. */
  ['NAV2']: G3000RadioType.Nav;
  /** COM1 radio. */
  ['COM1']: G3000RadioType.Com;
  /** COM2 radio. */
  ['COM2']: G3000RadioType.Com;
  /** COM3 radio. */
  ['COM3']: G3000RadioType.Com;
  /** ADF1 radio. */
  ['ADF1']: G3000RadioType.Adf;
  /** ADF2 radio. */
  ['ADF2']: G3000RadioType.Adf;
  /** DME1 radio. */
  ['DME1']: G3000RadioType.Dme;
  /** DME2 radio. */
  ['DME2']: G3000RadioType.Dme;
};

/**
 * All G3000 radios (NAV, COM, ADF, and DME).
 */
export type Radio = NavRadio | ComRadio | AdfRadio | DmeRadio;

/**
 * G3000 radios that can be freely tuned.
 */
export type TunableRadio = NavRadio | ComRadio | AdfRadio;

/**
 * COM radio receive/monitor modes.
 */
export enum ComRadioReceiveMode {
  /** Only the transmitting radio is set to receive/monitor. */
  TransmitOnly = 'TransmitOnly',

  /** Both COM1 and COM2 are set to receive/monitor. */
  Both = 'Both'
}