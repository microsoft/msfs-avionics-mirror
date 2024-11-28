import { DisplayField, EventBus, FmcPagingEvents, FmcRenderTemplate, Subject } from '@microsoft/msfs-sdk';

import { Message } from '../../Fms/Message/Message';
import { UnsMessageID } from '../../Fms/Message/MessageDefinitions';
import { MessageEvents } from '../../Fms/Message/MessageService';
import { PickListData, UnsPickList } from '../Components/UnsPickList';
import { UnsChars } from '../UnsCduDisplay';
import { UnsFmcPage } from '../UnsFmcPage';

/**
 * A UNS Message store
 */
class UnsMessageStore {
  public readonly activeMsgs = Subject.create<Message[]>([]);
  public readonly pickListData = Subject.create<PickListData>({ data: [], itemsPerPage: UnsMessagePage.MAX_MESSAGES_PER_PAGE});

  /** @inheritdoc */
  constructor (private readonly bus: EventBus, private readonly page: UnsMessagePage) {
    const messageSub = this.bus.getSubscriber<MessageEvents>();

    messageSub.on('new_message').handle((message) => this.newMessage(message));
    messageSub.on('clear_message').handle((messageId) => this.removeMessage(messageId));
  }

  /**
   * Handles the creation of new messages
   * @param message message
   */
  private newMessage(message: Message): void {
    const msgArray = this.activeMsgs.get();
    if (!msgArray.find((msg) => msg.content == message.content)) {
      msgArray.push(message);
      this.activeMsgs.set(msgArray);
    }

    this.setPickListData(msgArray);
  }

  /**
   * Sets the pick list data
   * @param messages messages to potentially show
   */
  private setPickListData(messages: Message[]): void {
    const sortedMessages = messages
    .sort((a, b) => {
      const enumNames = Object.values(UnsMessageID) as string[];
      return enumNames[a.id].localeCompare(enumNames[b.id]);
    }) // Sort by timestamp
    .sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1)) // Move any new messages to the front
    .map((message) => `${message.content}[s-text ${message.color}]`);

    this.pickListData.set({ data: sortedMessages, itemsPerPage: UnsMessagePage.MAX_MESSAGES_PER_PAGE });
  }

  /**
   * Sets message data on it's view
   */
  public onMessageView(): void {
    const currentPageItemIndex = (this.page.MessageList.subPageIndex.get() - 1) * UnsMessagePage.MAX_MESSAGES_PER_PAGE;
    const nextPageItemIndex = this.page.MessageList.subPageIndex.get() * UnsMessagePage.MAX_MESSAGES_PER_PAGE;
    const msgs = this.activeMsgs.get()
      .map((message, index) => {
        return {...message, isNew: index >= currentPageItemIndex && index < nextPageItemIndex ? false : message.isNew };
      });

    this.activeMsgs.set(msgs);
    this.page.fms.messages.messageAlert.set(msgs.find((msg) => msg.isNew == true) ? true : false);
  }

  /**
   * Removes a message
   * @param messageId message id to remove
   */
  private removeMessage(messageId: UnsMessageID): void {
    const msgArray = this.activeMsgs.get();
    const msgsToKeep = msgArray.filter((msg) => msg.id !== messageId);

    this.activeMsgs.set(msgsToKeep);
    this.setPickListData(msgsToKeep);
  }
}

/** A UNS Message page */
export class UnsMessagePage extends UnsFmcPage {
  static readonly MAX_MESSAGES_PER_PAGE = 8;

  private readonly store = new UnsMessageStore(this.bus, this);

  public readonly MessageList = new UnsPickList(this, this.store.pickListData, {format: (item) => item});

  private readonly ReturnLink = new DisplayField(this, {
    formatter: () => `RETURN${UnsChars.ArrowRight}`,
    onSelected: async () => {
      this.screen.navigateBackShallow();
      return true;
    }
  });

  protected pageTitle = '  MESSAGE';
  protected displayedSubPagePadding = 1;

  /** @inheritdoc */
  protected onInit(): void {
    this.displayedSubPageIndexPipe?.destroy();
    this.displayedSubPageCountPipe?.destroy();
    this.addBinding(this.displayedSubPageIndexPipe = this.MessageList.subPageIndex.pipe(this.displayedSubPageIndex));
    this.addBinding(this.displayedSubPageCountPipe = this.MessageList.subPageCount.pipe(this.displayedSubPageCount));
  }

  /** @inheritdoc */
  protected onPause(): void {
    this.store.onMessageView();
    const msgs = this.store.activeMsgs.get().filter((message) => !message.closeOnView);

    this.store.activeMsgs.set(msgs);
    this.fms.messages.messageAlert.set(msgs.find((msg) => msg.isNew == true) ? true : false);
  }

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    return [
      [
        [this.TitleField],
        [''],
        [this.MessageList],
        [''],
        [''],
        [''],
        [''],
        [''],
        [''],
        [''],
        ['', this.ReturnLink],
      ],
    ];
  }

  /** @inheritdoc */
  protected override async onHandleScrolling(event: keyof FmcPagingEvents<this> & string): Promise<boolean | string> {
    switch (event) {
      case 'pageLeft':
        this.MessageList.prevSubpage();
        this.store.onMessageView();
        return true;
      case 'pageRight':
        this.MessageList.nextSubpage();
        this.store.onMessageView();
        return true;
    }

    return super.onHandleScrolling(event);
  }
}
