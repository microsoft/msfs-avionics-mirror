import { MenuDefinition, MenuEntry, Page, PageProps, ViewService } from '../Pages';
import { FocusPosition, FSComponent, GeoPointSubject, Subject } from '@microsoft/msfs-sdk';
import { Fms } from '@microsoft/msfs-garminsdk';
import { GNSUiControl } from '../../GNSUiControl';
import { WaypointPageIdentInput } from './WaypointPageIdentInput';
import { InteractionEvent } from '../../InteractionEvent';

/**
 * Base props for {@link WaypointPage}
 */
export interface WaypointPageProps extends PageProps {
  /**
   * Whether this page was shown from an external interaction, e.g. selecting an airport on the NEAREST AIRPORT page
   */
  isPopup: Subject<boolean>,

  /**
   * Callback for when the "Done" button associated with a popup page is pressed
   */
  onPopupDonePressed: () => void,

  /** An instance of the flight plan management system. */
  fms: Fms;

  /** The current GPS position. */
  ppos: GeoPointSubject;

  /** The instrument index. */
  instrumentIndex: number;
}

/**
 * Page in the WPT group
 */
export class WaypointPage<T extends WaypointPageProps = WaypointPageProps> extends Page<T> {
  protected readonly root = FSComponent.createRef<GNSUiControl>();
  protected readonly waypointSelection = FSComponent.createRef<WaypointPageIdentInput>();

  protected readonly menu: MenuEntry[] | MenuDefinition | undefined = undefined;

  /** @inheritDoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    let handled = false;
    if (this.root.instance.isFocused) {
      handled = this.root.instance.onInteractionEvent(evt);
    }

    if (handled) {
      return true;
    } else if (evt === InteractionEvent.RightKnobPush) {
      if (this.root.instance.isFocused) {
        this.root.instance.blur();
      } else {
        this.root.instance.focus(FocusPosition.First);
        this.waypointSelection.instance.focusSelf();
      }

      return true;
    } else if (evt === InteractionEvent.MENU) {
      if (this.menu) {
        ViewService.menu(this.menu);
        return true;
      }
      return false;
    } else if (evt === InteractionEvent.DirectTo) {

      return this.onDirectPressed();

    } else {
      return super.onInteractionEvent(evt);
    }
  }

  /** @inheritDoc */
  onResume(): void {
    super.onResume();
    if (this.props.isPopup.get()) {
      this.waypointSelection.instance.focusSelf();
    }
  }

  /** @inheritDoc */
  onSuspend(): void {
    this.waypointSelection.instance.focusSelf();
    this.root.instance.blur();
    this.waypointSelection.instance.displayKeyboardIcon(false);
    super.onSuspend();
  }

  /**
   * Method to overide in each waypoint page when the direct to button is pressed.
   * @returns Whether this interaction event was handled.
   */
  protected onDirectPressed(): boolean {
    return false;
  }
}