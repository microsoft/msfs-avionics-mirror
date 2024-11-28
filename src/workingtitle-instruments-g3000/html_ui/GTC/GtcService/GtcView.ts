import { ComponentProps, DisplayComponent, Subject, Subscribable } from '@microsoft/msfs-sdk';

import { ControllableDisplayPaneIndex } from '@microsoft/msfs-wtg3000-common';

import { GtcInteractionEvent, GtcInteractionHandler } from './GtcInteractionEvent';
import { GtcControlMode, GtcService } from './GtcService';
import { GtcSidebar, SidebarStateReadonly } from './Sidebar';

/**
 * Component props for {@link GtcView}.
 */
export interface GtcViewProps extends ComponentProps {
  /** The GtcService instance. */
  gtcService: GtcService;

  /** The GTC control mode to which the view belongs. */
  controlMode: GtcControlMode;

  /** Whether the view belongs to its GTC control mode's overlay view stack. */
  isInOverlayStack?: boolean;

  /**
   * The index of the display pane associated with the view, or `undefined` if the view is not associated with any
   * display pane.
   */
  displayPaneIndex?: ControllableDisplayPaneIndex;
}

/** A GtcView component */
export abstract class GtcView<P extends GtcViewProps = GtcViewProps> extends DisplayComponent<P> implements GtcInteractionHandler {
  protected readonly bus = this.props.gtcService.bus;
  protected readonly gtcService = this.props.gtcService;

  protected readonly _activeComponent = Subject.create<GtcInteractionHandler | null>(null);

  protected readonly _sidebarState = GtcSidebar.createSidebarState();
  /** The GTC sidebar state (labels and buttons) requested by this view. */
  public readonly sidebarState = this._sidebarState as SidebarStateReadonly;

  protected readonly _title = Subject.create<string | undefined>(undefined);
  /** This view's title. */
  public readonly title = this._title as Subscribable<string | undefined>;

  /**
   * A method that is called when this view comes into use. A view is in-use when it appears in at least one history
   * state of its parent view stack.
   */
  public onInUse(): void {
    //
  }

  /**
   * A method that is called when this view goes out of use. A view is out-of-use when it does not appear in any
   * history states of its parent view stack.
   */
  public onOutOfUse(): void {
    //
  }

  /**
   * A method that is called when this view is opened. A view is open when it appears in the most recent history state
   * of its parent view stack.
   * @param wasPreviouslyOpened True when this view was open in a previous view stack
   * (like if the go back button was used to reach this page).
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onOpen(wasPreviouslyOpened: boolean): void {
    //
  }

  /**
   * A method that is called when this view is closed. A view is closed when it does not appear in the most recent
   * history state of its parent view stack.
   */
  public onClose(): void {
    //
  }

  /**
   * A method that is called when this view is resumed. A view is resumed when it is the active view.
   */
  public onResume(): void {
    //
  }

  /**
   * A method that is called when this view is paused. A view is paused when it is not the active view.
   */
  public onPause(): void {
    //
  }

  /** Called when there is an interaction event when this is the active view.
   * @param event The event.
   * @returns Whether the event was handled or not.
   */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    return !!this._activeComponent.get()?.onGtcInteractionEvent(event);
  }
}