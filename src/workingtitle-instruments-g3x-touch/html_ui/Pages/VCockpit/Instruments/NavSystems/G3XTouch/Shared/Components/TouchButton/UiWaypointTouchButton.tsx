import {
  DisplayComponent, FacilityWaypoint, FSComponent,
  SetSubject, Subscribable, SubscribableMapFunctions, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { UiWaypointDisplay, UiWaypointDisplayProps } from '../Waypoint/UiWaypointDisplay';
import { UiTouchButton, UiTouchButtonProps } from './UiTouchButton';

import './UiWaypointTouchButton.css';

/**
 * Component props for {@link UiWaypointTouchButton}.
 */
export interface UiWaypointTouchButtonProps extends Omit<UiTouchButtonProps, 'label'>, UiWaypointDisplayProps {
  /** The label to display when the button's bound waypoint is `null`. */
  nullLabel?: string | Subscribable<string>;
}

/**
 * A touchscreen button which displays information about a waypoint, including its identifier, name, type, and city.
 */
export class UiWaypointTouchButton extends DisplayComponent<UiWaypointTouchButtonProps> {
  private static readonly RESERVED_CSS_CLASSES = ['ui-wpt-button', 'ui-wpt-button-null'];

  private readonly buttonRef = FSComponent.createRef<UiTouchButton>();
  private readonly displayRef = FSComponent.createRef<UiWaypointDisplay>();

  private readonly waypoint = SubscribableUtils.toSubscribable(this.props.waypoint, true) as Subscribable<FacilityWaypoint | null>;
  private readonly nullLabel = this.props.nullLabel === undefined
    ? undefined
    : SubscribableUtils.isSubscribable(this.props.nullLabel)
      ? this.props.nullLabel.map(SubscribableMapFunctions.identity())
      : SubscribableUtils.toSubscribable(this.props.nullLabel, true);

  private readonly cssClass = SetSubject.create(['ui-wpt-button']);

  private readonly subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public onAfterRender(): void {
    if (this.nullLabel !== undefined) {
      this.subscriptions.push(this.waypoint.sub(waypoint => {
        this.cssClass.toggle('ui-wpt-button-null', waypoint === null);
      }, true));
    }
  }

  /**
   * Gets this button's root HTML element.
   * @returns This button's root HTML element.
   * @throws Error if this button has not yet been rendered.
   */
  public getRootElement(): HTMLElement {
    return this.buttonRef.instance.getRootElement();
  }

  /**
   * Simulates this button being pressed. This will execute the `onPressed()` callback if one is defined.
   * @param ignoreDisabled Whether to simulate the button being pressed regardless of whether the button is disabled.
   * Defaults to `false`.
   */
  public simulatePressed(ignoreDisabled = false): void {
    this.buttonRef.getOrDefault()?.simulatePressed(ignoreDisabled);
  }

  /** @inheritdoc */
  public render(): VNode {
    if (typeof this.props.class === 'object') {
      const sub = FSComponent.bindCssClassSet(this.cssClass, this.props.class, UiWaypointTouchButton.RESERVED_CSS_CLASSES);
      if (Array.isArray(sub)) {
        this.subscriptions.push(...sub);
      } else {
        this.subscriptions.push(sub);
      }
    } else {
      if (this.props.class !== undefined && this.props.class.length > 0) {
        for (const classToAdd of FSComponent.parseCssClassesFromString(this.props.class, classToFilter => !UiWaypointTouchButton.RESERVED_CSS_CLASSES.includes(classToFilter))) {
          this.cssClass.add(classToAdd);
        }
      }
    }

    return (
      <UiTouchButton
        ref={this.buttonRef}
        isEnabled={this.props.isEnabled}
        isHighlighted={this.props.isHighlighted}
        isVisible={this.props.isVisible}
        onTouched={this.props.onTouched}
        onPressed={this.props.onPressed}
        onHoldStarted={this.props.onHoldStarted}
        onHoldTick={this.props.onHoldTick}
        onHoldEnded={this.props.onHoldEnded}
        focusOnDrag={this.props.focusOnDrag}
        inhibitOnDrag={this.props.inhibitOnDrag}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis}
        dragThresholdPx={this.props.dragThresholdPx}
        isInList={this.props.isInList}
        listScrollAxis={this.props.listScrollAxis}
        gduFormat={this.props.gduFormat}
        focusController={this.props.focusController}
        canBeFocused={this.props.canBeFocused}
        focusOptions={this.props.focusOptions}
        class={this.cssClass}
      >
        {this.props.nullLabel !== undefined && (
          <div class='ui-wpt-button-null-label'>{this.nullLabel}</div>
        )}
        <UiWaypointDisplay
          ref={this.displayRef}
          waypoint={this.props.waypoint}
          nullIdent={this.props.nullIdent}
          nullName={this.props.nullName}
          hideRightInfo={this.props.hideRightInfo}
        />
        {this.props.children}
      </UiTouchButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.displayRef.getOrDefault()?.destroy();
    this.buttonRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}