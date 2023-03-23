import { ExtractSubjectType, MutableSubscribable, Subject, Subscribable, Subscription } from '@microsoft/msfs-sdk';

import { GtcOrientation } from '@microsoft/msfs-wtg3000-common';

/** The state used by the SidebarState to determine which buttons to show, and how to show them. */
export type SidebarState = ReturnType<typeof GtcSidebar.createSidebarState>;

/** Readonly version of SidebarStateState. */
export type SidebarStateReadonly = {
  [Item in keyof SidebarState]: Subscribable<ExtractSubjectType<SidebarState[Item]>>;
};

/** An Object of subscribables. */
type ObjectOfSubs = {
  readonly [key: string]: Subscribable<any>;
}

/** An Object of mutable subscribables. */
type MutableObjectOfSubs = {
  readonly [key: string]: MutableSubscribable<any>;
}

/** Possible states that a GTC View may request for slot 1. */
export type Slot1Buttons = 'cancel';

/** Possible states that a GTC View may request for slot 5. */
export type Slot5Buttons = 'arrowsDisabled' | 'arrowsUp' | 'arrowsDown' | 'arrowsBoth' | 'enterEnabled' | 'enterDisabled';

/** Possible states that a GTC View may request for dualConcentricKnobLabel. */
const dualConcentricKnobLabelKeys = ['dataEntryPushEnter', 'dataEntryPushEnterHold', 'panPointPushPanOff'] as const;

/** Possible states that a GTC View may request for dualConcentricKnobLabel. */
export type DualConcentricKnobLabelKey = typeof dualConcentricKnobLabelKeys[number];

/** A GTC sidebar state. */
export type GtcSidebarState = {
  /** The button state of slot 1. */
  slot1: Subject<Slot1Buttons | null>;
  /** The button state of slot 5. */
  slot5: Subject<Slot5Buttons | null>;
  /** The label to display for the enter button. */
  enterButtonLabel: Subject<string>;
  /** The label to display for the arrow buttons. */
  useWaypointArrowButtons: Subject<boolean>
  /** The label to display for the dual concentric knob. */
  dualConcentricKnobLabel: Subject<DualConcentricKnobLabelKey | string | null>;
  /** The label to display for the center knob. */
  centerKnobLabel: Subject<string | null>;
  /** The label to display for the map knob. */
  mapKnobLabel: Subject<string | null>;
};

/** Colletion of functions for working with the GtcSidebar. */
export class GtcSidebar {
  public static readonly hidePanesString = '$hide-panes$';

  /**
   * Creates an instance of the sidebar state to be used by GtcViews.
   * @returns new sidebar state.
   */
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public static createSidebarState(): GtcSidebarState {
    return {
      /** Button bar slot 1, top/leftmost slot. */
      slot1: Subject.create<Slot1Buttons | null>(null),
      /** Button bar slot 5, bottom/right most slot. */
      slot5: Subject.create<Slot5Buttons | null>(null),
      /** When true, the arrow buttons will be waypoint Next and Prev buttons. */
      useWaypointArrowButtons: Subject.create<boolean>(false),
      /** The label to show on the Enter button. Defaults to 'Enter'. */
      enterButtonLabel: Subject.create('Enter'),
      /** The label for the dual concentric knob, the inner/outer knob, or a {@link DualConcentricKnobLabelKey}.
       * If the label begins with `GtcSidebar.hidePanesString`, then the pane selector will be hidden. */
      dualConcentricKnobLabel: Subject.create<DualConcentricKnobLabelKey | string | null>(null),
      /** The label for the center knob, vertical GTC only. */
      centerKnobLabel: Subject.create<string | null>(null),
      /** The label for the map knob, the bottom/leftmost knob. */
      mapKnobLabel: Subject.create<string | null>(null),
    } as const;
  }

  /**
   * Pipes all the subscribables from one ObjectOfSubjects to another.
   * @param from Object to pipe from.
   * @param to Object to pipe to.
   * @returns All the subscriptions made from the pipes.
   */
  public static pipeObjectOfSubs(from: ObjectOfSubs, to: MutableObjectOfSubs): Subscription[] {
    return Object.keys(from).map(x => {
      return from[x].pipe(to[x]);
    });
  }

  /**
   * Renders the DualConcentricKnobLabel.
   * @param labelOrKey The label to render, or a {@link DualConcentricKnobLabelKey}.
   * @param orientation The gtc orientation.
   * @returns the final string.
   */
  public static renderDualConcentricKnobLabel(labelOrKey: DualConcentricKnobLabelKey | string, orientation: GtcOrientation): string {
    if (!this.isDualConcentricKnobLabelKey(labelOrKey)) {
      return labelOrKey;
    }
    if (orientation === 'horizontal') {
      return GtcSidebar.hidePanesString + this.renderDualConcentricKnobLabelHorizontal(labelOrKey);
    } else {
      return GtcSidebar.hidePanesString + this.renderDualConcentricKnobLabelVertical(labelOrKey);
    }
  }

  /**
   * Renders the DualConcentricKnobLabel for the horizontal orientation.
   * @param labelKey The label key.
   * @returns The rendered string.
   */
  public static renderDualConcentricKnobLabelHorizontal(labelKey: DualConcentricKnobLabelKey): string {
    switch (labelKey) {
      case 'dataEntryPushEnter': return 'Data\nEntry\nPush:\nEnter';
      case 'dataEntryPushEnterHold': return 'Data\nEntry\nPush:\nEnter\nHold:↕';
      case 'panPointPushPanOff': return 'Pan/\nPoint\nPush:\nPan Off';
      default: return 'FIX';
    }
  }

  /**
   * Renders the DualConcentricKnobLabel for the vertical orientation.
   * @param labelKey The label key.
   * @returns The rendered string.
   */
  public static renderDualConcentricKnobLabelVertical(labelKey: DualConcentricKnobLabelKey): string {
    switch (labelKey) {
      case 'dataEntryPushEnter': return 'Data Entry\nPush:Enter';
      case 'dataEntryPushEnterHold': return 'Data Entry\nPush:Enter Hold:↕';
      case 'panPointPushPanOff': return 'Pan/Point\nPush:Pan Off';
      default: return 'FIX';
    }
  }

  /**
   * Checks if string is a {@link DualConcentricKnobLabelKey}.
   * @param key The string.
   * @returns whether the key is a {@link DualConcentricKnobLabelKey} or not.
   */
  public static isDualConcentricKnobLabelKey(key: string): key is DualConcentricKnobLabelKey {
    return dualConcentricKnobLabelKeys.includes(key as DualConcentricKnobLabelKey);
  }
}