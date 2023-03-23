import { ComponentProps, DisplayComponent, Subject, Subscribable } from '@microsoft/msfs-sdk';

import { ControllableDisplayPaneIndex } from '@microsoft/msfs-wtg3000-common';

import { GtcInteractionEvent, GtcInteractionHandler } from './GtcInteractionEvent';
import { GtcControlMode, GtcService } from './GtcService';
import { GtcSidebar, SidebarStateReadonly } from './Sidebar';

/** Properties of GtcView */
export interface GtcViewProps extends ComponentProps {
  /** The GtcService instance */
  gtcService: GtcService;

  /** The GTC control mode to which the view belongs. */
  controlMode: GtcControlMode;

  /** The index of the display pane that this view is tied to. */
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
   * The Open lifecycle method
   * @param wasPreviouslyOpened True when this view was open in a previous view stack
   * (like if the go back button was used to reach this page).
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onOpen(wasPreviouslyOpened: boolean): void {
    //
  }

  /** The Close lifecycle method */
  public onClose(): void {
    //
  }

  /** The Pause lifecycle method */
  public onPause(): void {
    //
  }

  /** The Resume lifecycle method */
  public onResume(): void {
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