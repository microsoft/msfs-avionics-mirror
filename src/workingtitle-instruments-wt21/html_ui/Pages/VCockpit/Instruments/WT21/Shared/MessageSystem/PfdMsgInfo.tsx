import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { PfdOrMfd } from '../Map/MapUserSettings';
import { MESSAGE_LEVEL } from './MessageDefinition';
import { PfdMessagePacket } from './PfdMessagePacket';
import { PfdMessageEvents } from './PfdMessageReceiver';

import './PfdMsgInfo.css';

// eslint-disable-next-line jsdoc/require-jsdoc
interface LowerSectionContainerProps extends ComponentProps {
  // eslint-disable-next-line jsdoc/require-jsdoc
  bus: EventBus;
  // eslint-disable-next-line jsdoc/require-jsdoc
  pfdOrMfd: PfdOrMfd;
}

const rightAlignedMessages = ['TERM'] as readonly string[];

/** Handles displaying messages from the FMC that have a PFD or MAP message. */
export class CJ4_PFD_MsgInfo extends DisplayComponent<LowerSectionContainerProps> {
  private readonly messageTopLeftRef = FSComponent.createRef<HTMLDivElement>();
  private readonly messageTopRightRef = FSComponent.createRef<HTMLDivElement>();
  private readonly messageBotLeftRef = FSComponent.createRef<HTMLDivElement>();
  private readonly messageBotRightRef = FSComponent.createRef<HTMLDivElement>();
  private readonly messageMfdTopRightRef = FSComponent.createRef<HTMLDivElement>();
  private readonly messageMapRef = FSComponent.createRef<HTMLDivElement>();
  private readonly messageTopLeft = Subject.create('');
  private readonly messageTopRight = Subject.create('');
  private readonly messageBotLeft = Subject.create('');
  private readonly messageBotRight = Subject.create('');
  private readonly messageMfdTopRight = Subject.create('');
  private readonly messageMap = Subject.create('');
  private fmcMsgTimestamp = -1;
  private lastFmcMsgLevel = -1;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.bus.getSubscriber<PfdMessageEvents>().on('pfd_messages').handle(this.handleMessages);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public readonly handleMessages = (messagePacket: PfdMessagePacket): void => {
    const { bot, top, map, mfd } = messagePacket;

    if (this.props.pfdOrMfd === 'PFD') {
      this.messageBotRight.set(bot ? bot.content : '');
      this.messageBotRightRef.instance.classList.toggle('yellow-text', bot && bot.level === MESSAGE_LEVEL.Yellow);
      this.messageBotRightRef.instance.classList.toggle('msg-info-blink', bot?.isBlinking);

      // If it's a message that should be right aligned, put it in the topRight element instead
      if (top?.content && rightAlignedMessages.includes(top.content)) {
        this.messageTopRight.set(top ? top.content : '');
        this.messageTopRightRef.instance.classList.toggle('yellow-text', top && top.level === MESSAGE_LEVEL.Yellow);
        this.messageTopRightRef.instance.classList.toggle('msg-info-blink', top?.isBlinking);
        this.messageTopLeft.set('');
      } else {
        this.messageTopLeft.set(top ? top.content : '');
        this.messageTopLeftRef.instance.classList.toggle('yellow-text', top && top.level === MESSAGE_LEVEL.Yellow);
        this.messageTopLeftRef.instance.classList.toggle('msg-info-blink', top?.isBlinking);
        this.messageTopRight.set('');
      }

      // Doing the MSG manually here as it is pretty "static"
      const fmcMsgLevel = SimVar.GetSimVarValue('L:WT_CJ4_DISPLAY_MSG', 'number') as MESSAGE_LEVEL | -1;
      if (fmcMsgLevel !== this.lastFmcMsgLevel) {
        this.fmcMsgTimestamp = Date.now();
        this.lastFmcMsgLevel = fmcMsgLevel;
      }

      const isBlinking = fmcMsgLevel === MESSAGE_LEVEL.Yellow && Date.now() - this.fmcMsgTimestamp < 5000;
      this.messageBotLeft.set(fmcMsgLevel > -1 ? 'MSG' : '');
      this.messageBotLeftRef.instance.classList.toggle('yellow-text', fmcMsgLevel === MESSAGE_LEVEL.Yellow);
      this.messageBotLeftRef.instance.classList.toggle('msg-info-blink', isBlinking);
    }

    if (this.props.pfdOrMfd === 'MFD') {
      this.messageMfdTopRight.set(mfd ? mfd.content : '');
      this.messageMfdTopRightRef.instance.classList.toggle('yellow-text', mfd && mfd.level === MESSAGE_LEVEL.Yellow);
      this.messageMfdTopRightRef.instance.classList.toggle('msg-info-blink', mfd?.isBlinking);
    }

    this.messageMap.set(map ? map.content : '');
    this.messageMapRef.instance.classList.toggle('yellow-text', map && map.level === MESSAGE_LEVEL.Yellow);
    this.messageMapRef.instance.classList.toggle('msg-info-blink', map?.isBlinking);
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div id="MsgInfo">
        {this.props.pfdOrMfd === 'PFD' &&
          <>
            <div ref={this.messageTopLeftRef} id="PFDMessageTopLeft">{this.messageTopLeft}</div>
            <div ref={this.messageTopRightRef} id="PFDMessageTopRight">{this.messageTopRight}</div>
            <div ref={this.messageBotLeftRef} id="PFDMessageBotLeft">{this.messageBotLeft}</div>
            <div ref={this.messageBotRightRef} id="PFDMessageBotRight">{this.messageBotRight}</div>
          </>
        }
        {this.props.pfdOrMfd === 'MFD' &&
          <div ref={this.messageMfdTopRightRef} id="MFDMessageTopRight">{this.messageMfdTopRight}</div>
        }
        <div ref={this.messageMapRef} id="PFDMessageMap">{this.messageMap}</div>
      </div>
    );
  }
}