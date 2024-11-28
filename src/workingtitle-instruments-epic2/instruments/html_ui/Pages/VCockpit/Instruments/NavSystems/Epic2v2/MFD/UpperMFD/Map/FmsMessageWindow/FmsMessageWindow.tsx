import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import {
  FmsMessage, FmsMessageCategories, FmsMessageControlEvents, FmsMessageEvents, FmsMessageKey, FmsMessageKeyCategories, FmsMessageWidnowPostMessagePacket
} from '@microsoft/msfs-epic2-shared';

import './FmsMessageWindow.css';

/** A help window message entry, with a key added */
interface FmsMessageEntry extends FmsMessage {
  /** The key used to send the message */
  key: FmsMessageKey,
}

/**
 * Props for {@link FmsMessageWindow}
 */
export interface FmsMessageWindowProps extends ComponentProps {
  /** The event bus */
  readonly bus: EventBus,
}

/** FmsMessageWindow */
export class FmsMessageWindow extends DisplayComponent<FmsMessageWindowProps> {
  private readonly fmsMessageWindowRef = FSComponent.createRef<HTMLDivElement>();

  // private readonly body = FSComponent.createRef<HTMLDivElement>();

  private readonly helpWindowVisible = Subject.create(false);

  private readonly alertMessageExists = Subject.create(false);

  private readonly helpWindowTitleString = Subject.create('');

  private readonly messageCount = Subject.create(0);

  private readonly advisoryMessages: FmsMessageEntry[] = [];

  private readonly communicationsMessages: FmsMessageEntry[] = [];

  private readonly alertMessages: FmsMessageEntry[] = [];

  private readonly entryErrorAdvisoryMessages: FmsMessageEntry[] = [];

  // /** @inheritDoc */
  // constructor(props: FmsMessageWindowProps) {
  //   super(props);

  //   // TODO?
  //   // // FMC MESSAGE
  //   // CasAlertTransporter.create(this.props.bus, FmcCrewAlertIDs.FmcMessage, AnnunciationType.Advisory)
  //   //   .bind(this.alertMessageExists, (v) => v);
  // }

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    const sub = this.props.bus.getSubscriber<FmsMessageControlEvents>();

    sub.on('post_message').handle(this.addScratchpadErrorMessage.bind(this));
    sub.on('clear_message').handle(this.clearScratchpadErrorMessage.bind(this));

    this.helpWindowVisible.sub((visible) => this.fmsMessageWindowRef.instance.style.visibility = visible ? 'inherit' : 'hidden', true);

    this.messageCount.sub(count => {
      this.props.bus.getPublisher<FmsMessageEvents>().pub('fms_message_count', count, true);
    }, true);
  }

  /**
   * Adds a help window error message to the stack
   * @param packet The message package to add
   */
  private addScratchpadErrorMessage(packet: FmsMessageWidnowPostMessagePacket): void {
    const category = FmsMessageKeyCategories[packet.key];

    (packet.message as FmsMessageEntry).key = packet.key;

    const entry = packet.message as FmsMessageEntry;

    let array: FmsMessageEntry[];
    switch (category) {
      case FmsMessageCategories.Advisory: array = this.advisoryMessages; break;
      case FmsMessageCategories.Communications: array = this.communicationsMessages; break;
      case FmsMessageCategories.Alert: array = this.alertMessages; break;
      case FmsMessageCategories.EntryErrorAdvisory: array = this.entryErrorAdvisoryMessages; break;
    }

    this.addAndDeduplicateMessageToArray(entry, array);

    this.refreshScratchpadMessageDisplay();
  }

  /**
   * Clears a help window message
   * @param key Key of the message to clear
   */
  private clearScratchpadErrorMessage(key?: FmsMessageKey): void {
    if (!key) {
      this.clearTopMessage();
      return;
    }

    const category = FmsMessageKeyCategories[key];

    let array: FmsMessageEntry[];
    switch (category) {
      case FmsMessageCategories.Advisory: array = this.advisoryMessages; break;
      case FmsMessageCategories.Communications: array = this.communicationsMessages; break;
      case FmsMessageCategories.Alert: array = this.alertMessages; break;
      case FmsMessageCategories.EntryErrorAdvisory: array = this.entryErrorAdvisoryMessages; break;
    }

    const existingIndex = array.findIndex((it) => it.key === key);

    if (existingIndex !== -1) {
      array.splice(existingIndex, 1);
    }

    this.refreshScratchpadMessageDisplay();
  }

  /**
   * Adds a help window message entry to the stack, de-duplicating any existing messages with the same key (unless the key is Generic)
   *
   * @param message the help window message entry
   * @param array the array
   */
  private addAndDeduplicateMessageToArray(message: FmsMessageEntry, array: FmsMessageEntry[]): void {
    const existingIndex = message.key !== FmsMessageKey.Generic ? array.findIndex((it) => it.key === message.key) : -1;

    if (existingIndex !== -1) {
      array.splice(existingIndex, 1);
    }

    array.push(message);
  }

  /**
   * Refreshes the scratchpad message display
   */
  private refreshScratchpadMessageDisplay(): void {
    let topMessageArray: FmsMessageEntry[];
    if (this.entryErrorAdvisoryMessages.length > 0) {
      topMessageArray = this.entryErrorAdvisoryMessages;
    } else if (this.alertMessages.length > 0) {
      topMessageArray = this.alertMessages;
    } else if (this.communicationsMessages.length > 0) {
      topMessageArray = this.communicationsMessages;
    } else {
      topMessageArray = this.advisoryMessages;
    }

    if (topMessageArray.length > 0) {
      this.helpWindowVisible.set(true);

      const message = topMessageArray[topMessageArray.length - 1];

      this.helpWindowTitleString.set(message.title);

      // this.body.instance.innerText = '';

      // for (const [i, fragment] of message.body.entries()) {
      //   if (!fragment.inline && i > 0) {
      //     this.body.instance.appendChild(document.createElement('br'));
      //   }

      //   const span = document.createElement('span');

      //   span.classList.add(`fms-message-text-${fragment.style}`);

      //   span.textContent = fragment.text;

      //   this.body.instance.appendChild(span);
      // }
    } else {
      this.helpWindowVisible.set(false);
    }

    this.messageCount.set(
      this.advisoryMessages.length +
      this.communicationsMessages.length +
      this.alertMessages.length +
      this.entryErrorAdvisoryMessages.length
    );
    this.alertMessageExists.set(this.alertMessages.length > 0);
  }

  /**
   * Handles the CLR MSG button being pressed
   */
  private clearTopMessage(): void {
    let topMessageArray: FmsMessageEntry[];

    if (this.entryErrorAdvisoryMessages.length > 0) {
      topMessageArray = this.entryErrorAdvisoryMessages;
    } else if (this.alertMessages.length > 0) {
      topMessageArray = this.alertMessages;
    } else if (this.communicationsMessages.length > 0) {
      topMessageArray = this.communicationsMessages;
    } else {
      topMessageArray = this.advisoryMessages;
    }

    if (topMessageArray.length > 0) {
      topMessageArray.pop();
    }

    this.refreshScratchpadMessageDisplay();
  }

  /** @inheritDoc */
  render(): VNode | null {
    return (
      <div ref={this.fmsMessageWindowRef} class="fms-message-window touch-button-bar-image-border">
        <span class="fms-message-prefix">FMS:</span>
        <span class="fms-message-title">{this.helpWindowTitleString}</span>
      </div>
    );
  }
}
