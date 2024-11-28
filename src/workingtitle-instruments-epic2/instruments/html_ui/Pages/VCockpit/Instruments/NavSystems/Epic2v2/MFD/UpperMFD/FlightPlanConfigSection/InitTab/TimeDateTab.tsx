import { ClockEvents, ComponentProps, ConsumerSubject, DateTimeFormatter, DmsFormatter, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { FmsPositionSystemEvents, TabContent, TouchButton } from '@microsoft/msfs-epic2-shared';

import './TimeDateTab.css';

/** The properties for the {@link TimeDateTab} component. */
interface TimeDateTabProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
}

/** The TimeDateTab component. */
export class TimeDateTab extends TabContent<TimeDateTabProps> {
  private readonly sub = this.props.bus.getSubscriber<ClockEvents & FmsPositionSystemEvents>();

  private readonly dmsFormatter = new DmsFormatter();

  private readonly gpsPositionSub = ConsumerSubject.create(this.sub.on('fms_pos_gps-position_1').whenChanged(), null);
  private readonly simTime = ConsumerSubject.create(this.sub.on('simTime').withPrecision(-3), 0);

  private readonly utcTimeDisplay = this.simTime.map(DateTimeFormatter.create('{HH}:{mm}'));
  private readonly dateDisplay = this.simTime.map(DateTimeFormatter.create('{dd} {MON} {YY}'));

  private readonly gpsPositionDisplay = this.gpsPositionSub.map(v => {
    if (v !== null) {
      const latDmsStr = this.dmsFormatter.getLatDmsStr(v.lat, false, false);
      const lonDmsStr = this.dmsFormatter.getLonDmsStr(v.long, false);
      return `${latDmsStr} ${lonDmsStr}`;
    } else {
      return 'Not Initialized';
    }
  });

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="fpln-time-date-tab">
        <div class="time-date-row">Time:<span class="box">{this.utcTimeDisplay}</span><span class="time-date-suffix"> UTC</span></div>
        <div class="time-date-row">Date:<span class="box">{this.dateDisplay}</span></div>
        <div class="current-position">Current Position:<span class="position-text">{this.gpsPositionDisplay}</span></div>
        <TouchButton
          label="Update FMS Position"
          class="fms-position-button"
          variant={'small'}
          isEnabled={false}
        />
      </div>
    );
  }
}
