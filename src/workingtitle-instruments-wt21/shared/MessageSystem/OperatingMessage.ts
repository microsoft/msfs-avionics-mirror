import { MESSAGE_LEVEL, MessageDefinition } from './MessageDefinition';

/** OperatingMessage */
export class OperatingMessage {

  // eslint-disable-next-line jsdoc/require-jsdoc
  public get msgDefs(): MessageDefinition[] {
    return this._msgDefs;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public get level(): MESSAGE_LEVEL {
    return this._level;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public get weight(): number {
    return this._weight;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(private _msgDefs: MessageDefinition[], private _level: MESSAGE_LEVEL, private _weight: number) {
  }
}