import { FSComponent, Subscribable, SubscribableUtils, Subscription, VNode } from '@microsoft/msfs-sdk';

import { GtcInteractionEvent } from './GtcInteractionEvent';
import { GtcView, GtcViewProps } from './GtcView';
import { GtcSidebar, SidebarState } from './Sidebar';

/**
 * Component props for GtcGenericView.
 */
export interface GtcGenericViewProps extends GtcViewProps {
  /** The title of the view. */
  title: string | Subscribable<string>;

  /** The sidebar state (labels and buttons) requested by the view. */
  sidebarState?: SidebarState;

  /**
   * A callback function to execute when the view comes in use.
   * @param view The in-use view.
   */
  onInUse?: (view: GtcGenericView) => void;

  /**
   * A callback function to execute when the view goes out of use.
   * @param view The out-of-use view.
   */
  onOutOfUse?: (view: GtcGenericView) => void;

  /**
   * A callback function to execute when the view is opened.
   * @param view The opened view.
   */
  onOpen?: (view: GtcGenericView) => void;

  /**
   * A callback function to execute when the view is closed.
   * @param view The closed view.
   */
  onClose?: (view: GtcGenericView) => void;

  /**
   * A callback function to execute when the view is paused.
   * @param view The paused view.
   */
  onPause?: (view: GtcGenericView) => void;

  /**
   * A callback function to execute when the view is resumed.
   * @param view The resumed view.
   */
  onResume?: (view: GtcGenericView) => void;

  /**
   * A callback function which handles interaction events.
   * @param view The view to which the event was sent.
   * @param event An interaction event.
   * @returns Whether the event was handled.
   */
  onInteractionEvent?: (view: GtcGenericView, event: GtcInteractionEvent) => boolean;

  /**
   * A callback function to execute when the view is destroyed.
   * @param view The destroyed view.
   */
  onDestroy?: (view: GtcGenericView) => void;
}

/**
 * A generic GTC view which renders all of its children and derives its functionality from its props.
 */
export class GtcGenericView<P extends GtcGenericViewProps = GtcGenericViewProps> extends GtcView<P> {
  private titlePipe?: Subscription;
  private sidebarPipes?: Subscription[];

  /** @inheritDoc */
  public onAfterRender(): void {
    if (SubscribableUtils.isSubscribable(this.props.title)) {
      this.titlePipe = this.props.title.pipe(this._title);
    } else {
      this._title.set(this.props.title);
    }

    if (this.props.sidebarState !== undefined) {
      this.sidebarPipes = GtcSidebar.pipeObjectOfSubs(this.props.sidebarState, this._sidebarState);
    }
  }

  /** @inheritDoc */
  public onInUse(): void {
    this.props.onInUse && this.props.onInUse(this);
  }

  /** @inheritDoc */
  public onOutOfUse(): void {
    this.props.onInUse && this.props.onInUse(this);
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.props.onOpen && this.props.onOpen(this);
  }

  /** @inheritDoc */
  public onClose(): void {
    this.props.onClose && this.props.onClose(this);
  }

  /** @inheritDoc */
  public onPause(): void {
    this.props.onPause && this.props.onPause(this);
  }

  /** @inheritDoc */
  public onResume(): void {
    this.props.onResume && this.props.onResume(this);
  }

  /** @inheritDoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    return this.props.onInteractionEvent !== undefined && this.props.onInteractionEvent(this, event);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <>{this.props.children}</>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy(this);

    this.titlePipe?.destroy();
    this.sidebarPipes?.forEach(pipe => { pipe.destroy(); });

    super.destroy();
  }
}