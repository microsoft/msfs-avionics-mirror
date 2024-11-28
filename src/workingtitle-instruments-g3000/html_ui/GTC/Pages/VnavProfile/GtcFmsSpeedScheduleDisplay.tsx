import { ComponentProps, DisplayComponent, FSComponent, SetSubject, Subject, Subscribable, SubscribableSet, SubscribableUtils, Subscription, VNode } from '@microsoft/msfs-sdk';
import { FmsSpeedClimbSchedule, FmsSpeedCruiseSchedule, FmsSpeedDescentSchedule } from '@microsoft/msfs-wtg3000-common';

import './GtcFmsSpeedScheduleDisplay.css';

/**
 * Component props for GtcFmsSpeedScheduleDisplay.
 */
export interface GtcFmsSpeedScheduleDisplayProps extends ComponentProps {
  /** The performance schedule to display. */
  schedule: FmsSpeedClimbSchedule | FmsSpeedCruiseSchedule | FmsSpeedDescentSchedule | Subscribable<FmsSpeedClimbSchedule | FmsSpeedCruiseSchedule | FmsSpeedDescentSchedule>;

  /** CSS class(es) to apply to the display's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A component which displays the name of an FMS performance schedule. If the displayed schedule does not have an
 * explicit name, an auto-generated name consisting of the schedule's parameters (IAS, mach, FPA) will be displayed
 * instead.
 */
export class GtcFmsSpeedScheduleDisplay extends DisplayComponent<GtcFmsSpeedScheduleDisplayProps> {
  private static readonly ROOT_CSS_CLASSES = ['fms-speed-schedule'];
  private static readonly RESERVED_CSS_CLASSES: string[] = [];

  private static readonly NAME_CSS_CLASSES = ['fms-speed-schedule-name'];
  private static readonly GEN_NAME_CSS_CLASSES = ['fms-speed-schedule-gen-name'];

  private readonly nameCssClass = SetSubject.create(GtcFmsSpeedScheduleDisplay.NAME_CSS_CLASSES);
  private readonly generatedNameCssClass = SetSubject.create(GtcFmsSpeedScheduleDisplay.GEN_NAME_CSS_CLASSES);
  private readonly fpaCssClass = SetSubject.create<string>();

  private readonly schedule = SubscribableUtils.toSubscribable(this.props.schedule, true) as Subscribable<FmsSpeedClimbSchedule | FmsSpeedCruiseSchedule | FmsSpeedDescentSchedule>;

  private readonly nameText = Subject.create('');
  private readonly iasText = Subject.create('');
  private readonly machText = Subject.create('');
  private readonly fpaText = Subject.create('');

  private cssClassSub?: Subscription;
  private scheduleSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.scheduleSub = this.schedule.sub(schedule => {
      if (schedule.name.length === 0) {
        // Schedule does not have an explicit name.

        this.nameCssClass.add('hidden');

        // Auto-generate a name if the schedule has defined speed parameters. (Cruise schedules can have undefined
        // speed parameters in favor of targeting e.g. engine power.)
        if (schedule.ias >= 0 && schedule.mach >= 0) {
          this.generatedNameCssClass.delete('hidden');

          this.iasText.set(schedule.ias.toFixed(0));
          this.machText.set(schedule.mach.toFixed(3));

          // Include FPA in the auto-generated name for descent schedules.
          if ('fpa' in schedule) {
            this.fpaCssClass.delete('hidden');
            this.fpaText.set(`−${(-schedule.fpa).toFixed(2)}°`);
          } else {
            this.fpaCssClass.add('hidden');
          }
        } else {
          this.generatedNameCssClass.add('hidden');
        }
      } else {
        // Schedule has an explicit name -> display the explicit name.

        this.generatedNameCssClass.add('hidden');
        this.nameCssClass.delete('hidden');
        this.nameText.set(schedule.name);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    let rootCssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      rootCssClass = SetSubject.create(GtcFmsSpeedScheduleDisplay.ROOT_CSS_CLASSES);
      this.cssClassSub = FSComponent.bindCssClassSet(rootCssClass, this.props.class, GtcFmsSpeedScheduleDisplay.RESERVED_CSS_CLASSES);
    } else {
      rootCssClass = GtcFmsSpeedScheduleDisplay.ROOT_CSS_CLASSES.join(' ');

      if (this.props.class !== undefined && this.props.class.length > 0) {
        rootCssClass += ' '
          + FSComponent.parseCssClassesFromString(this.props.class, cssClass => !GtcFmsSpeedScheduleDisplay.RESERVED_CSS_CLASSES.includes(cssClass))
            .join(' ');
      }
    }

    return (
      <div class={rootCssClass}>
        <div class={this.nameCssClass}>{this.nameText}</div>
        <div class={this.generatedNameCssClass}>
          {this.iasText}<span class='numberunit-unit-small'>KT</span> / M{this.machText}<span class={this.fpaCssClass}> / {this.fpaText}</span>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.cssClassSub?.destroy();
    this.scheduleSub?.destroy();

    super.destroy();
  }
}