/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EventBus, EventSubscriber, NavMath, NavSourceId, NavSourceType, Publisher, SimVarValueType, Subject, Subscription } from '@microsoft/msfs-sdk';

import { DisplayUnitIndices } from '../InstrumentIndices';
import { Epic2PfdControlPfdEvents } from '../Misc';
import { NavBaseEvents, NavBaseFields } from './NavBase';
import { NavIndicator, NavIndicatorEvents, NavIndicators } from './NavIndicators';
import { NavSourceBase, NavSources } from './NavSources';
import { Epic2NavigationSourceEvents } from '../Autopilot/Epic2NavSourceEvents';

/** The names of the available nav sources in the Epic2. */
const navSourceNames = [
  'NAV1',
  'NAV2',
  'ADF',
  'FMS',
] as const;

/** The names of the available nav sources in the Epic2 for the course needle. */
const courseNeedleNavSourceNames = [
  'FMS',
  'NAV1',
  'NAV2',
] as const;

/** The names of the available nav sources in the Epic2 for the ghost needle. */
const ghostNeedleNavSourceNames = [
  'NAV1',
  'NAV2',
] as const;

/** The names of the nav indicators in the Epic2. */
const navIndicatorNames = [
  'bearingPointer1',
  'bearingPointer2',
  'courseNeedle',
  'ghostNeedle'
] as const;

/** The names of the available nav sources in the Epic2. */
export type Epic2NavSourceNames = typeof navSourceNames;
/** */
export type Epic2NavSourceName = Epic2NavSourceNames[number];
/** The names of the available nav sources in the Epic2 for the course needle. */
export type Epic2CourseNeedleNavSourceNames = typeof courseNeedleNavSourceNames;
/** */
export type Epic2CourseNeedleNavSourceName = Epic2CourseNeedleNavSourceNames[number];

/** The names of the available nav sources in the Epic2 for the course needle. */
export type Epic2GhostNeedleNavSourceNames = typeof ghostNeedleNavSourceNames;
/** */
export type Epic2GhostNeedleNavSourceName = Epic2GhostNeedleNavSourceNames[number];

/** */
export type Epic2NavSource = NavSourceBase<Epic2NavSourceNames>;
/** */
export type Epic2NavSources = NavSources<Epic2NavSourceNames>;
/** */
export type Epic2CourseNeedleNavSources = NavSources<Epic2CourseNeedleNavSourceNames>;
/** */
export type Epic2CourseNeedleNavSource = NavSourceBase<Epic2CourseNeedleNavSourceNames>;
/** */
export type Epic2GhostNeedleNavSources = NavSources<Epic2GhostNeedleNavSourceNames>;
/** */
export type Epic2GhostNeedleNavSource = NavSourceBase<Epic2GhostNeedleNavSourceNames>;

/** The names of the nav indicators in the Epic2. */
export type Epic2NavIndicatorNames = typeof navIndicatorNames;
/** */
export type Epic2NavIndicatorName = Epic2NavIndicatorNames[number];
/** */
export type Epic2NavIndicator = NavIndicator<Epic2NavSourceNames>;
/** */
export type Epic2NavIndicators = NavIndicators<Epic2NavSourceNames, Epic2NavIndicatorNames>;

/** Field changed events for Epic2 Nav Source fields. */
export type Epic2NavSourceEvents<Source extends Epic2NavSourceNames[number], Index extends number> =
  NavBaseEvents<`nav_src_${Source}_${Index}`, NavBaseFields>

/** Field changed events for Epic2 Nav Indicator fields. */
export type Epic2NavIndicatorEvents<Indicator extends Epic2NavIndicatorNames[number]> =
  NavIndicatorEvents<Epic2NavSourceNames, Indicator>

/** Events for controlling the ghost needle. */
export type Epic2CourseNeedleControlEvents = {
  /** Course needle increment event, the data is the direction to increment. */
  nav_ind_courseNeedle_increment: number;
}

/** A base class for Epic2 Nav indicators. */
class Epic2NavIndicatorBase<T extends readonly string[]> extends NavIndicator<T> {
  public readonly sourceLabel = Subject.create<string | null>(null);

  private updateLabelSub?: Subscription;

  /** NavIndicator constructor.
   * @param navSources The possible nav sources that could be pointed to.
   * @param sourceName The initial source to use, if any.
   */
  public constructor(navSources: NavSources<T>, sourceName: T[number] | null = null) {
    super(navSources, sourceName);

    this.source.sub((newSource) => {
      if (this.updateLabelSub) {
        this.updateLabelSub.destroy();
        this.updateLabelSub = undefined;
      }

      if (newSource !== null) {
        this.updateLabelSub = newSource.isLocalizer.sub(this.updateSourceLabel);
      }
      this.updateSourceLabel();
    }, true);
  }

  private readonly updateSourceLabel = (): void => {
    this.sourceLabel.set(this.createSourceLabel());
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private createSourceLabel(): string | null {
    const source = this.source.get();
    if (source === null) {
      return null;
    }
    if (source.getType() === NavSourceType.Nav) {
      if (source.isLocalizer.get()) {
        return 'LOC' + source.index;
      } else {
        return 'VOR' + source.index;
      }
    } else if (source.getType() === NavSourceType.Adf) {
      return 'ADF';
    } else {
      return 'FMS';
    }
  }
}

/** @inheritdoc */
export class Epic2CourseNeedleNavIndicator extends Epic2NavIndicatorBase<Epic2NavSourceNames> {
  private readonly navEventsPublisher: Publisher<Epic2NavigationSourceEvents>;
  private readonly navEventsSubscriber: EventSubscriber<Epic2NavigationSourceEvents>;

  private readonly courseLvarName = `XMLVAR_PFD_COURSE_${this.displayUnitIndex === DisplayUnitIndices.PfdRight ? 2 : 1}`;

  /** NavIndicator constructor.
   * @param navSources The possible nav sources that could be pointed to.
   * @param displayUnitIndex The DU index we're running on.
   * @param bus The bus.
   * @param availableSourceNames The available source names in the order they are cycled through.
   */
  public constructor(
    navSources: Epic2NavSources,
    private readonly displayUnitIndex: DisplayUnitIndices,
    readonly bus: EventBus,
    private readonly availableSourceNames: Epic2CourseNeedleNavSourceNames[number][],
  ) {
    super(navSources, 'FMS');

    this.navEventsPublisher = this.bus.getPublisher<Epic2NavigationSourceEvents>();
    this.navEventsSubscriber = this.bus.getSubscriber<Epic2NavigationSourceEvents>();

    if (this.displayUnitIndex === DisplayUnitIndices.PfdLeft || this.displayUnitIndex === DisplayUnitIndices.PfdRight) {
      const setTopic = this.displayUnitIndex === DisplayUnitIndices.PfdLeft ? 'epic2_navsource_course_needle_left_source_set' : 'epic2_navsource_course_needle_right_source_set';

      this.navEventsSubscriber.on(setTopic).handle((src) => {
        if (src.type === NavSourceType.Gps) {
          this.setSource('FMS');
        } else if (src.type === NavSourceType.Nav) {
          this.setSource(`NAV${src.index}` as 'NAV1' | 'NAV2');
        }
      });

      const pfdControlSub = bus.getSubscriber<Epic2PfdControlPfdEvents>();
      pfdControlSub.on('pfd_control_nav_select_push').handle(this.onPfdNavSelect.bind(this));
      pfdControlSub.on('pfd_control_course_push').handle(this.onPfdCourseSync.bind(this));
      const courseIndicatorSub = bus.getSubscriber<Epic2CourseNeedleControlEvents>();
      courseIndicatorSub.on('nav_ind_courseNeedle_increment').handle(this.onCourseIncrement.bind(this));

      this.course.sub((v) => SimVar.SetSimVarValue(this.courseLvarName, SimVarValueType.Degree, v ?? -1), true);

      this.source.sub(v => {
        if (v === null) { return; }
        const sourceTopic = this.displayUnitIndex === DisplayUnitIndices.PfdLeft ? 'epic2_navsource_course_needle_left_source' : 'epic2_navsource_course_needle_right_source';
        const navSource: NavSourceId = { index: v.index, type: v.getType() ?? NavSourceType.Gps };
        this.navEventsPublisher.pub(sourceTopic, navSource, true, true);
      });
    }
  }

  /**
   * Handles PFD controller NAV SELECT events.
   */
  private onPfdNavSelect(): void {
    const source = this.source.get();
    // cycle to the next available pointer source
    const newSourceIndex = ((this.availableSourceNames as string[]).indexOf(source?.name ?? '') + 1) % this.availableSourceNames.length;
    const newSourceName = this.availableSourceNames[newSourceIndex];
    this.setSource(newSourceName);
  }

  /**
   * Handles course increment/decrement events.
   * @param increment The direction to increment.
   */
  private onCourseIncrement(increment: number): void {
    // if vor or loc in course pointer, adjust course pointer.
    this.setCourse(NavMath.normalizeHeading((this.course.get() ?? 0) + Math.sign(increment)));
  }

  /**
   * Handles PFD controller course knob press (course sync).
   */
  private onPfdCourseSync(): void {
    // If VOR is selected for course needle and received, set source needle to current radial,
    // else do nothing
    if (this.source.get()?.getType() === NavSourceType.Nav && !this.isLocalizer.get() && this.hasNav.get() && (this.signalStrength.get() ?? 0) > 0) {
      this.setCourse(this.bearing.get());
    }
  }

  /**
   * Sets the course if the current source is a VOR/LOC.
   * @param course the course to set.
   */
  private setCourse(course: number | null): void {
    if (this.source.get()?.getType() === NavSourceType.Nav) {
      SimVar.SetSimVarValue(`K:VOR${this.source.get()?.index}_SET`, 'number', Math.round(course ?? -1));
    }
  }
}

/** Events for controlling the ghost needle. */
export interface Epic2GhostNeedleControlEvents {
  /** Sets the nav preview source, or null to turn off the needle. */
  [epic2_ghost_needle_set_source: `epic2_ghost_needle_set_source_${number}`]: Epic2NavSourceNames[number] | null,
}

/** @inheritdoc */
export class Epic2GhostNeedleNavIndicator extends Epic2NavIndicatorBase<Epic2NavSourceNames> {
  /** NavIndicator constructor.
   * @param navSources The possible nav sources that could be pointed to.
   * @param bus The bus.
   * @param availableSourceNames The available source names in the order they are cycled through.
   * @param displayUnitIndex The display unit this nav indicator is visible on.
   */
  public constructor(navSources: Epic2NavSources,
    private readonly bus: EventBus,
    private readonly availableSourceNames: Epic2GhostNeedleNavSourceNames[number][],
    displayUnitIndex: DisplayUnitIndices,
  ) {
    super(navSources, null);

    const ghostControl = this.bus.getSubscriber<Epic2GhostNeedleControlEvents>();
    ghostControl.on(`epic2_ghost_needle_set_source_${displayUnitIndex}`).handle(this.setSource.bind(this));

    const pfdControlSub = bus.getSubscriber<Epic2PfdControlPfdEvents>();
    pfdControlSub.on('pfd_control_nav_preview_push').handle(this.onPfdNavPreviewToggle.bind(this));
    pfdControlSub.on('pfd_control_course_decrement').handle(this.onPfdCourseIncrement.bind(this, -1));
    pfdControlSub.on('pfd_control_course_increment').handle(this.onPfdCourseIncrement.bind(this, +1));
  }

  /** Handles PFD nav preview button presses. */
  private onPfdNavPreviewToggle(): void {
    const source = this.source.get();
    // cycle to the next available pointer source
    const newSourceIndex = (this.availableSourceNames as string[]).indexOf(source?.name ?? '') + 1;
    if (newSourceIndex >= this.availableSourceNames.length) {
      // turn the pointer off
      this.setSource(null);
    } else {
      const newSourceName = this.availableSourceNames[newSourceIndex];
      this.setSource(newSourceName);
    }
  }

  /**
   * Handles PFD course knob increment events.
   * @param increment the sign of the increment (or decrement).
   */
  private onPfdCourseIncrement(increment: number): void {
    // if nav preview on with vor/loc, adjust nav preview,
    if (this.source.get()?.getType() === NavSourceType.Nav) {
      this.setCourse(NavMath.normalizeHeading((this.course.get() ?? 0) + Math.sign(increment)));
    } else {
      // else if vor or loc in course pointer, adjust course pointer, so we send the event on to it.
      this.bus.getPublisher<Epic2CourseNeedleControlEvents>().pub('nav_ind_courseNeedle_increment', increment);
    }
  }

  /**
   * Sets the course.
   * @param course the course to set.
   */
  private setCourse(course: number | null): void {
    if (this.source.get()?.getType() === NavSourceType.Nav) {
      SimVar.SetSimVarValue(`K:VOR${this.source.get()?.index}_SET`, 'number', Math.round(course ?? -1));
    }
  }
}

/** @inheritdoc */
export class Epic2BearingPointerNavIndicator extends Epic2NavIndicatorBase<Epic2NavSourceNames> {
  /** @inheritdoc */
  public constructor(
    navSources: NavSources<Epic2NavSourceNames>,
    bus: EventBus,
    index: 1 | 2,
    private readonly availableSourceNames: Epic2NavSourceNames[number][],
  ) {
    super(navSources, null);

    const pfdControlSub = bus.getSubscriber<Epic2PfdControlPfdEvents>();
    if (index === 1) {
      pfdControlSub.on('pfd_control_pointer_1_push').handle(this.onPointerButton.bind(this));
    } else if (index === 2) {
      pfdControlSub.on('pfd_control_pointer_2_push').handle(this.onPointerButton.bind(this));
    }
  }

  /**
   * Handles bearing pointer button presses.
   */
  protected onPointerButton(): void {
    const source = this.source.get();
    // cycle to the next available pointer source
    const newSourceIndex = (this.availableSourceNames as string[]).indexOf(source?.name ?? '') + 1;
    if (newSourceIndex >= this.availableSourceNames.length) {
      // turn the pointer off
      this.setSource(null);
    } else {
      const newSourceName = this.availableSourceNames[newSourceIndex];
      this.setSource(newSourceName);
    }
  }
}
