import { ComponentProps, DebounceTimer, DisplayComponent, FSComponent, SetSubject, Subject, Subscribable, SubscribableSet, SubscribableUtils, Subscription, ToggleableClassNameRecord, VNode } from '@microsoft/msfs-sdk';

import { TerrainSystemOperatingMode } from '../../terrain/TerrainSystemTypes';

/**
 * Terrain alerting system annunciation levels.
 */
export enum TerrainSystemAnnunciationLevel {
  Advisory,
  Caution,
  Warning
}

/**
 * A definition describing a terrain alerting system annunciation.
 */
export type TerrainSystemAnnunciationDef = {
  /** The level of the annunciation. */
  level: TerrainSystemAnnunciationLevel;

  /** The text to display for the annunciation. */
  text: string;
};

/**
 * A definition describing a terrain alerting system annunciation with an assigned priority.
 */
export type TerrainSystemAnnunciationPriorityDef = TerrainSystemAnnunciationDef & {
  /**
   * The priority of the annunciation. Annunciations with higher priorities will be displayed in place of those with
   * lower priorities.
   */
  priority: number;
};

/**
 * Component props for {@link TerrainSystemAnnunciation}.
 */
export interface TerrainSystemAnnunciationProps extends ComponentProps {
  /** Whether to show the display. */
  show: boolean | Subscribable<boolean>;

  /** The terrain system's operating mode. */
  operatingMode: Subscribable<TerrainSystemOperatingMode>;

  /** The terrain system's active status flags. */
  statusFlags: SubscribableSet<string>;

  /** The terrain system's active inhibit flags. */
  inhibitFlags: SubscribableSet<string>;

  /** The terrain system's prioritized active alert. */
  prioritizedAlert: Subscribable<string | null>;

  /**
   * A definition for displaying a test mode annunciation. If not defined, then an annunciation will not be displayed
   * when the terrain system is in test mode.
   */
  testModeDef?: Readonly<TerrainSystemAnnunciationDef>;

  /**
   * Definitions for displaying status flag annunciations. If a definition is not provided for a status flag, then no
   * annunciation will be displayed for that flag.
   */
  statusDefs?: Readonly<Partial<Record<string, Readonly<TerrainSystemAnnunciationPriorityDef>>>>;

  /**
   * Definitions for displaying inhibit flag annunciations. If a definition is not provided for a inhibit flag, then no
   * annunciation will be displayed for that flag.
   */
  inhibitDefs?: Readonly<Partial<Record<string, Readonly<TerrainSystemAnnunciationPriorityDef>>>>;

  /**
   * Definitions for displaying alert annunciations. If a definition is not provided for an alert, then no annunciation
   * will be displayed for that alert.
   */
  alertDefs?: Readonly<Partial<Record<string, Readonly<TerrainSystemAnnunciationDef>>>>;

  /**
   * The duration, in milliseconds, for which the flashing state is applied after a new annunciation is displayed.
   * Defaults to 5000.
   */
  flashDuration?: number;

  /** CSS class(es) to apply to the display's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A Garmin terrain alerting system annunciation display.
 */
export class TerrainSystemAnnunciation extends DisplayComponent<TerrainSystemAnnunciationProps> {
  private static readonly RESERVED_CLASSES = [
    'terrain-annunc',
    'terrain-annunc-advisory',
    'terrain-annunc-caution',
    'terrain-annunc-warning',
    'terrain-annunc-flash'
  ];

  private readonly rootCssClass = SetSubject.create<string>();

  private readonly show = SubscribableUtils.toSubscribable(this.props.show, true) as Subscribable<boolean>;

  private readonly display = Subject.create('none');
  private readonly text = Subject.create('');

  private readonly flashDuration = this.props.flashDuration ?? 5000;
  private readonly flashDebounceTimer = new DebounceTimer();
  private readonly cancelFlashFunc = this.rootCssClass.delete.bind(this.rootCssClass, 'terrain-annunc-flash');

  private readonly statusDefs = this.props.statusDefs ?? {};
  private readonly inhibitDefs = this.props.inhibitDefs ?? {};
  private readonly alertDefs = this.props.alertDefs ?? {};

  private activeDef?: TerrainSystemAnnunciationDef;

  private readonly subscriptions: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    const updateDisplay = this.updateDisplay.bind(this);

    const displaySubs = [
      this.props.operatingMode.sub(updateDisplay, false, true),
      this.props.statusFlags.sub(updateDisplay, false, true),
      this.props.inhibitFlags.sub(updateDisplay, false, true),
      this.props.prioritizedAlert.sub(updateDisplay, false, true)
    ];

    this.subscriptions.push(...displaySubs);

    this.subscriptions.push(
      this.show.sub(show => {
        if (show) {
          updateDisplay();

          for (const sub of displaySubs) {
            sub.resume();
          }
        } else {
          for (const sub of displaySubs) {
            sub.pause();
          }

          this.display.set('none');
        }
      }, true)
    );
  }

  /**
   * Updates the annunciation shown by this display.
   */
  private updateDisplay(): void {
    let activeDef: TerrainSystemAnnunciationDef | undefined = undefined;

    const operatingMode = this.props.operatingMode.get();

    if (operatingMode !== TerrainSystemOperatingMode.Off) {
      // Test is a special case: if an annunciation is defined, then it takes priority over everything else (even
      // annunciations of higher levels).
      const testDef = operatingMode === TerrainSystemOperatingMode.Test ? this.props.testModeDef : undefined;
      if (testDef) {
        activeDef = testDef;
      } else {
        // Alerts have priority over everything else.
        const alert = this.props.prioritizedAlert.get();
        const alertDef = alert ? this.alertDefs[alert] : undefined;
        if (alertDef) {
          activeDef = alertDef;
        } else {
          // Get definitions for all active status and inhibit flags and pick the highest level and priority.

          let bestDef: Readonly<TerrainSystemAnnunciationPriorityDef> | undefined = undefined;

          for (const status of this.props.statusFlags.get()) {
            const def = this.statusDefs[status];
            if (def && (bestDef === undefined || def.level > bestDef.level || (def.level === bestDef.level && def.priority > bestDef.priority))) {
              bestDef = def;
            }
          }
          for (const inhibit of this.props.inhibitFlags.get()) {
            const def = this.inhibitDefs[inhibit];
            if (def && (bestDef === undefined || def.level > bestDef.level || (def.level === bestDef.level && def.priority > bestDef.priority))) {
              bestDef = def;
            }
          }

          activeDef = bestDef;
        }
      }
    }

    if (activeDef !== this.activeDef) {
      this.activeDef = activeDef;

      if (activeDef) {
        this.display.set('');
        this.setAnnunciationLevel(activeDef.level);
        this.text.set(activeDef.text);
        this.startFlash();
      } else {
        this.display.set('none');
        this.setAnnunciationLevel(TerrainSystemAnnunciationLevel.Advisory);
        this.text.set('');
        this.stopFlash();
        return;
      }
    }
  }

  /**
   * Sets this display's current annunciation level.
   * @param level The annunciation level to set.
   */
  private setAnnunciationLevel(level: TerrainSystemAnnunciationLevel): void {
    this.rootCssClass.toggle('terrain-annunc-advisory', level === TerrainSystemAnnunciationLevel.Advisory);
    this.rootCssClass.toggle('terrain-annunc-caution', level === TerrainSystemAnnunciationLevel.Caution);
    this.rootCssClass.toggle('terrain-annunc-warning', level === TerrainSystemAnnunciationLevel.Warning);
  }

  /**
   * Starts a flashing cycle on this display. The display immediately enters the flashing state and will automatically
   * exit the flashing state after an amount of time equal to this display's flashing duration.
   */
  private startFlash(): void {
    this.rootCssClass.add('terrain-annunc-flash');
    this.flashDebounceTimer.schedule(this.cancelFlashFunc, this.flashDuration);
  }

  /**
   * Stops any currently active flashing cycle on this display. The display immediately exits the flashing state.
   */
  private stopFlash(): void {
    this.flashDebounceTimer.clear();
    this.cancelFlashFunc();
  }

  /** @inheritDoc */
  public render(): VNode {
    this.rootCssClass.add('terrain-annunc');

    if (typeof this.props.class === 'object') {
      const sub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, TerrainSystemAnnunciation.RESERVED_CLASSES);
      if (Array.isArray(sub)) {
        this.subscriptions.push(...sub);
      } else {
        this.subscriptions.push(sub);
      }
    } else if (this.props.class) {
      for (const classToAdd of FSComponent.parseCssClassesFromString(this.props.class, classToFilter => !TerrainSystemAnnunciation.RESERVED_CLASSES.includes(classToFilter))) {
        this.rootCssClass.add(classToAdd);
      }
    }

    return (
      <div class={this.rootCssClass} style={{ 'display': this.display }}>
        {this.text}
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.flashDebounceTimer.clear();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}