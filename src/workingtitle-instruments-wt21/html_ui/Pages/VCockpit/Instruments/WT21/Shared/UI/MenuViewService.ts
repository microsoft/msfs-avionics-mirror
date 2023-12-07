import { FSComponent, NodeReference, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { GuiDialog } from './GuiDialog';
import { GuiHEvent } from './GuiHEvent';

/** A view entry. */
type ViewEntry<T extends GuiDialog = GuiDialog> = {
  /** The key of the view. */
  key: string;

  /** A reference to the view. */
  ref: NodeReference<T>;
}

/**
 * A service to manage menu views.
 */
export abstract class MenuViewService<K = Record<string, unknown>> {
  private readonly registeredViews: Map<string & keyof K, () => VNode> = new Map();
  private readonly refsMap: Map<string, ViewEntry> = new Map();

  private openViews: ViewEntry[] = [];

  private readonly activeViewEntrySub = Subject.create<ViewEntry | null>(null);
  /** The key of the currently active view. */
  public readonly activeViewKey = this.activeViewEntrySub.map(entry => entry?.key ?? '') as Subscribable<string & keyof K | ''>;
  /** The currently active view. */
  public readonly activeView = this.activeViewEntrySub.map(entry => entry?.ref.instance) as Subscribable<GuiDialog | null>;

  /** override in child class */
  protected readonly guiEventMap: Map<string, GuiHEvent> = new Map([]);

  /** Tracks the current timeout timer, used for closing the menu after 10 seconds of inactivity. */
  protected interactionTimeoutId: number | null = null;

  private viewClosedHandler: (closedView: GuiDialog) => void;

  /**
   * Ctor
   */
  constructor() {
    this.viewClosedHandler = this.handleViewClosed.bind(this);
  }

  /**
   * Routes the HEvents to the views.
   * @param hEvent The event identifier.
   * @param instrumentIndex The index of the instrument.
   * @returns Whether the event was handled.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onInteractionEvent(hEvent: string, instrumentIndex: number): boolean {
    const evt = this.guiEventMap.get(hEvent);
    if (evt !== undefined) {
      return this.routeInteractionEventToViews(evt);
    }

    return false;
  }

  /**
   * Routes an interaction to the active view, and if it is not handled, re-routes the interaction to the currently
   * open page if it exists and is not the active view.
   * @param evt An interaction event.
   * @returns Whether the event was handled.
   */
  protected routeInteractionEventToViews(evt: GuiHEvent): boolean {
    const activeView = this.activeView.get();
    if (activeView) {
      return activeView.onInteractionEvent(evt);
    }

    return false;
  }

  /**
   * Opens a view. Opening a page will close all other views,
   * @param type The type of the view to open.
   * @returns The view that was opened.
   * @throws Error if the view type is not registered with this service.
   */
  public open<T extends GuiDialog>(type: string & keyof K): T {
    let viewEntry = this.refsMap.get(type);
    if (viewEntry === undefined) {
      // when we hve no ref, create the view
      viewEntry = {
        key: type,
        ref: this.createView(type)
      };
      this.refsMap.set(type, viewEntry);
    }

    const view = viewEntry.ref.instance;

    this.clearStack(true);

    view.open();
    view.onClose.clear();
    view.onClose.on(this.viewClosedHandler);

    const index = this.openViews.indexOf(viewEntry);
    if (index >= 0) {
      this.openViews.splice(index, 1);
    }
    this.openViews.push(viewEntry);
    this.activeViewEntrySub.set(viewEntry);

    return view as T;
  }

  /**
   * Handles views that got closed, removing them from the stack.
   * @param closedView The view that was closed.
   */
  private handleViewClosed(closedView: GuiDialog): void {
    const viewIndex = this.openViews.findIndex(entry => entry.ref.instance === closedView);
    closedView.onClose.off(this.viewClosedHandler);

    if (viewIndex > -1) {
      this.openViews.splice(viewIndex, 1);
      this.activeViewEntrySub.set(this.openViews[0] ?? null);
    }
  }

  /**
   * Creates a view.
   * @param type The type string of the view to create.
   * @returns A NodeReference to the created view.
   * @throws When type of view is not registered.
   */
  private createView(type: string & keyof K): NodeReference<GuiDialog> {
    const vnodeFn = this.registeredViews.get(type);
    if (vnodeFn === undefined) {
      console.error(`Could not find a registered view of type ${type.toString()}!`);
      throw new Error(`Could not find a registered view of type ${type.toString()}!`);
    }

    const node = vnodeFn();
    FSComponent.render(node, document.getElementById('MenuContainer'));
    const viewRef = FSComponent.createRef<GuiDialog>();
    viewRef.instance = node.instance as GuiDialog;
    return viewRef;
  }

  /**
   * Closes all open views and clears the stack.
   * @param closePage Whether to close the currently open page, if one exists.
   */
  protected clearStack(closePage: boolean): void {
    if (this.openViews.length === 0) {
      return;
    }

    const viewEntries = [...this.openViews];
    const len = viewEntries.length;
    for (let i = len - 1; i > 0; i--) {
      viewEntries[i].ref.instance.close();
    }
    this.openViews.length = 1;

    if (closePage || !(viewEntries[0].ref.instance instanceof GuiDialog)) {
      viewEntries[0].ref.instance.close();
      this.openViews.length = 0;
    }
  }

  /**
   * Registers a view with the service.
   * @param [type] The type of the view.
   * @param vnodeFn A function creating the VNode.
   */
  public registerView(type: string & keyof K, vnodeFn: () => VNode): void {
    this.registeredViews.set(type, vnodeFn);
  }

  /** Starts/resets a 10 second timer, which will close the menu when finished.
   * Call this function whenever there is an interaction with the menu. */
  protected startInteractionTimeout(): void {
    if (this.interactionTimeoutId) {
      window.clearTimeout(this.interactionTimeoutId);
    }
    this.interactionTimeoutId = window.setTimeout(() => {
      this.activeView.get()?.close();
      this.interactionTimeoutId = null;
    }, 10000);
  }
}