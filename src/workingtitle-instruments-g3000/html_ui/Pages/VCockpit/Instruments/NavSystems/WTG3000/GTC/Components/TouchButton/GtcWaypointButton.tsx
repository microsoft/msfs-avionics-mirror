import {
  DisplayComponent, FacilityWaypoint, FSComponent,
  SetSubject, Subscribable, SubscribableSet, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';
import { GtcWaypointDisplay, GtcWaypointDisplayProps } from '../Waypoint/GtcWaypointDisplay';
import { GtcTouchButton, GtcTouchButtonProps } from './GtcTouchButton';
import './GtcWaypointButton.css';

/**
 * Component props for GtcWaypointButton.
 */
export interface GtcWaypointButtonProps extends Omit<GtcTouchButtonProps, 'label'>, GtcWaypointDisplayProps {
  /** The CSS class(es) to apply to the button's root element. */
  class?: string | SubscribableSet<string>;
  /** Label to display on the button when waypoint is null. */
  nullLabel?: string | Subscribable<string>;
}

/**
 * A GTC button which displays the ident, name, and icon for a waypoint.
 */
export class GtcWaypointButton extends DisplayComponent<GtcWaypointButtonProps> {
  private static readonly RESERVED_CSS_CLASSES = ['gtc-wpt-button', 'show-null-label'];

  private readonly buttonRef = FSComponent.createRef<GtcTouchButton>();
  private readonly displayRef = FSComponent.createRef<GtcWaypointDisplay>();

  private readonly waypoint = SubscribableUtils.toSubscribable(this.props.waypoint, true) as Subscribable<FacilityWaypoint | null>;
  private readonly nullLabel = SubscribableUtils.toSubscribable(this.props.nullLabel, true);

  private readonly classList = SetSubject.create(['gtc-wpt-button']);

  private readonly subs = [] as Subscription[];

  /** @inheritdoc */
  public onAfterRender(): void {
    this.subs.push(this.waypoint.sub(waypoint => {
      if (this.props.nullLabel !== undefined) {
        this.classList.toggle('show-null-label', waypoint === null);
      }
    }, true));

    if (typeof this.props.class === 'object') {
      this.subs.push(FSComponent.bindCssClassSet(this.classList, this.props.class, GtcWaypointButton.RESERVED_CSS_CLASSES));
    } else {
      if (this.props.class !== undefined && this.props.class.length > 0) {
        FSComponent.parseCssClassesFromString(this.props.class, classToAdd => !GtcWaypointButton.RESERVED_CSS_CLASSES.includes(classToAdd)).forEach(classToAdd => {
          this.classList.add(classToAdd);
        });
      }
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GtcTouchButton
        ref={this.buttonRef}
        isEnabled={this.props.isEnabled}
        isHighlighted={this.props.isHighlighted}
        isVisible={this.props.isVisible}
        onPressed={this.props.onPressed}
        isInList={this.props.isInList}
        listScrollAxis={this.props.listScrollAxis}
        gtcOrientation={this.props.gtcOrientation}
        focusOnDrag={this.props.focusOnDrag}
        inhibitOnDrag={this.props.inhibitOnDrag}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis}
        dragThresholdPx={this.props.dragThresholdPx}
        class={this.classList}
      >
        {this.props.nullLabel !== undefined && <div class="null-label">{this.props.nullLabel}</div>}
        <GtcWaypointDisplay
          ref={this.displayRef}
          waypoint={this.props.waypoint}
          nullIdent={this.props.nullIdent}
          nullName={this.props.nullName}
        >
          {this.props.children}
        </GtcWaypointDisplay>
      </GtcTouchButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.displayRef.getOrDefault()?.destroy();
    this.buttonRef.getOrDefault()?.destroy();

    this.subs.forEach(sub => sub.destroy());

    super.destroy();
  }
}