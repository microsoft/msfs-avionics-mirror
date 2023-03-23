/** MessageDefinition */
export class MessageDefinition {
  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(
    public readonly text: string,
    public readonly target: MESSAGE_TARGET,
  ) { }
}

/** An enumeration for CJ4 message target displays */
export enum MESSAGE_TARGET {
  FMC,
  PFD_TOP,
  PFD_BOT,
  MAP_MID,
  MFD_TOP
}

/**
 * Enumeration of message levels
 * Higher numbers are higher priority
 */
export enum MESSAGE_LEVEL {
  White = 0, // white
  Yellow = 1 // yellow
}