import { IMessageReceiver } from './IMessageReceiver';
import { MESSAGE_TARGET } from './MessageDefinition';
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FMS_MESSAGE_ID, MessageDefinitions } from './MessageDefinitions';

/** MessageService, copied from CJ4 mod, with modifications. */
export class MessageService {
  private activeMsgs: Map<FMS_MESSAGE_ID, MessageConditionChecks> = new Map<FMS_MESSAGE_ID, MessageConditionChecks>();
  private receivers: Map<MESSAGE_TARGET, IMessageReceiver> = new Map<MESSAGE_TARGET, IMessageReceiver>();

  /**
   * Posts messages to the targets defined in the message definition
   * @param msgkey The message identifier
   * @param exitHandler An optional function that returns true when the msg should not be shown anymore.
   * If it is not passed in, you must clear the message manually by calling the clear function.
   * @param blinkHandler A function that returns a boolean indicating if the message should blink
   */
  public post(msgkey: FMS_MESSAGE_ID, exitHandler?: () => boolean, blinkHandler: () => boolean = (): boolean => false): void {
    if (MessageDefinitions.definitions.has(msgkey)) {
      const opmsg = MessageDefinitions.definitions.get(msgkey)!;
      opmsg.msgDefs.forEach(def => {
        if (this.receivers.has(def.target)) {
          this.receivers.get(def.target)!.process(msgkey, def.text, opmsg.level, opmsg.weight, def.target, blinkHandler);
        }
      });
      this.activeMsgs.set(msgkey, new MessageConditionChecks(exitHandler));
    }
  }

  /**
   * Clears a message from all targets
   * @param msgkey The message identifier
   */
  public clear(msgkey: FMS_MESSAGE_ID): void {
    if (this.activeMsgs.has(msgkey)) {
      this._clear(msgkey);
    }
  }

  /** Update function which calls the exitHandler function and clears messages that have to go */
  public update(): void {
    this.activeMsgs.forEach((v, k) => {
      if (v.exitHandler && v.exitHandler() === true) {
        this._clear(k);
      }
    });
  }

  /** Tells receivers that a message has been cleared. 
   * @param messageId The message id to clear. */
  private _clear(messageId: FMS_MESSAGE_ID): void {
    const opmsg = MessageDefinitions.definitions.get(messageId)!;
    opmsg.msgDefs.forEach(def => {
      if (this.receivers.has(def.target)) {
        this.receivers.get(def.target)!.clear(messageId);
      }
    });
    this.activeMsgs.delete(messageId);
  }

  /**
   * Registers a receiver implementation to the target display
   * @param target The target display
   * @param receiver The receiver
   */
  public registerReceiver(target: MESSAGE_TARGET, receiver: IMessageReceiver): void {
    this.receivers.set(target, receiver);
  }
}

/** Just a wrapper */
export class MessageConditionChecks {
  // eslint-disable-next-line jsdoc/require-jsdoc
  public get exitHandler(): (() => boolean) | undefined {
    return this._exitHandler;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public set exitHandler(v: (() => boolean) | undefined) {
    this._exitHandler = v;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(private _exitHandler?: () => boolean) {
  }
}