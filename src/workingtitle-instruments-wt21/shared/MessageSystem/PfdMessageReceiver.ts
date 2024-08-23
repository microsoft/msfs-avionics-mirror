/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EventBus, Publisher } from '@microsoft/msfs-sdk';

import { IMessageReceiver } from './IMessageReceiver';
import { MESSAGE_LEVEL, MESSAGE_TARGET } from './MessageDefinition';
import { FMS_MESSAGE_ID } from './MessageDefinitions';
import { PfdMessage, PfdMessagePresentationInfo } from './PfdMessage';
import { PfdMessagePacket } from './PfdMessagePacket';

// eslint-disable-next-line jsdoc/require-jsdoc
export interface PfdMessageEvents {
  // eslint-disable-next-line jsdoc/require-jsdoc
  pfd_messages: PfdMessagePacket;
}

/** WT21_PFD_MessageReceiver */
export class PfdMessageReceiver implements IMessageReceiver {
  private readonly publisher: Publisher<PfdMessageEvents>;
  private activeMsgs: Map<FMS_MESSAGE_ID, PfdMessage> = new Map<FMS_MESSAGE_ID, PfdMessage>();

  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(bus: EventBus) {
    this.publisher = bus.getPublisher<PfdMessageEvents>();
  }

  /** @inheritdoc */
  public process(
    id: FMS_MESSAGE_ID,
    text: string,
    level: MESSAGE_LEVEL,
    weight: number,
    target: MESSAGE_TARGET,
    blinkHandler = (): boolean => false,
  ): void {
    const pfdMsg = new PfdMessage(text, level, weight, target, id);
    pfdMsg.blinkCheckHandler = blinkHandler;
    pfdMsg.presentationInfo = {
      content: pfdMsg.content,
      isBlinking: false,
      level: pfdMsg.level,
    };
    if (!this.activeMsgs.has(id)) {
      this.activeMsgs.set(id, pfdMsg);
      this.update();
    }
  }

  /** @inheritdoc */
  public clear(id: FMS_MESSAGE_ID): void {
    if (this.activeMsgs.has(id)) {
      this.activeMsgs.delete(id);
      this.update();
    }
  }

  // TODO Find a way to not have to do this at a regular interval
  // It's mainly the blinking check that forces us to check at an interval
  /** Update function called by the FMS to update and send messages to the pfd */
  public update(): void {
    if (this.hasMsg()) {
      this.activeMsgs.forEach((v) => {
        v.presentationInfo.isBlinking = v.blinkCheckHandler();
      });

      const msgArray = Array.from(this.activeMsgs.values());
      const msgPacket: PfdMessagePacket = {
        top: this.pickHighPriorityMsg(msgArray, MESSAGE_TARGET.PFD_TOP),
        bot: this.pickHighPriorityMsg(msgArray, MESSAGE_TARGET.PFD_BOT),
        map: this.pickHighPriorityMsg(msgArray, MESSAGE_TARGET.MAP_MID),
        mfd: this.pickHighPriorityMsg(msgArray, MESSAGE_TARGET.MFD_TOP),
      };
      this.publisher.pub('pfd_messages', msgPacket, true);
    } else {
      this.publisher.pub('pfd_messages', {}, true);
    }
  }

  /**
   * Filters messages by target and returns the one with the highest priority
   * @param msgs Array of messages
   * @param target The display target
   * @returns the one with the highest priority
   */
  private pickHighPriorityMsg(msgs: PfdMessage[], target: MESSAGE_TARGET): PfdMessagePresentationInfo | undefined {
    const filteredArr = msgs.filter((v) => {
      return v.target === target;
    });

    // find highest priority message
    let returnMsg = undefined as PfdMessage | undefined;
    filteredArr.forEach(v => {
      if (returnMsg === undefined) {
        returnMsg = v;
      } else {
        if ((v.level > returnMsg.level) || (v.level === returnMsg.level && v.weight > returnMsg.weight)) {
          returnMsg = v;
        }
      }
    });

    return returnMsg?.presentationInfo;
  }

  /**
   * Checks if there are any messages
   * @returns true if there are any messages
   */
  private hasMsg(): boolean {
    return this.activeMsgs.size > 0;
  }
}
