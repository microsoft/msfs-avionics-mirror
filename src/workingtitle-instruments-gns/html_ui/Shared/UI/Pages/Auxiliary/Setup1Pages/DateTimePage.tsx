import { FSComponent, Subject, Unit, UnitFamily, UnitType, ComputedSubject, VNode, ClockEvents, ConsumerSubject } from '@microsoft/msfs-sdk';
import { WaypointPageSelector } from '../../Waypoint/WaypointPageSelector';
import { AuxPageProps, AuxPage } from '../AuxPages';
import { DateTimePageMenu } from './DateTimePageMenu';
import { PropsWithBus } from '../../../../UITypes';
import { GNSDigitInput } from '../../../Controls/GNSDigitInput';
import { GNSSignInput } from '../../../Controls/GNSSignInput';
import { DateTimeFormatSettingMode, DateTimeUserSettings, TimeDisplay, TimeDisplayFormat } from '@microsoft/msfs-garminsdk';
import { GNSGenericNumberInput } from '../../../Controls/GNSGenericNumberInput';
import { GNSTimeDisplay } from '../../../Controls/GNSTimeDisplay';
import './DateTimePage.css';

/**
 * Props for {@link DateTimePage}
 */
export type DateTimePageProps = PropsWithBus & AuxPageProps


/**
 * The WaypointNonDirectionalBeacon page
 */
export class DateTimePage extends AuxPage<DateTimePageProps> {
  protected readonly menu = new DateTimePageMenu((): void => {
    return this.restoreDefaultValues();
  });

  private static readonly FORMAT_SETTING_MAP = {
    [DateTimeFormatSettingMode.Local12]: TimeDisplayFormat.Local12,
    [DateTimeFormatSettingMode.Local24]: TimeDisplayFormat.Local24,
    [DateTimeFormatSettingMode.UTC]: TimeDisplayFormat.UTC
  };
  private dateTimeSettingManager = DateTimeUserSettings.getManager(this.props.bus);
  private dateTimeFormatSub = ConsumerSubject.create(this.dateTimeSettingManager.whenSettingChanged('dateTimeFormat'), this.dateTimeSettingManager.getSetting('dateTimeFormat').value);

  private readonly timeFormat = FSComponent.createRef<WaypointPageSelector>();
  private readonly timeUnit = Subject.create<Unit<UnitFamily.Duration>>(UnitType.SECOND);
  private readonly offsetInput = FSComponent.createRef<GNSGenericNumberInput>();
  public readonly offset = Subject.create<number>(0);

  private readonly time = FSComponent.createRef<TimeDisplay>();

  private readonly date = ComputedSubject.create<string | undefined, string>(undefined, v => {
    if (v === undefined) {
      return '';
    }
    const month = v.substring(4, 7).toUpperCase();
    const day = v.substring(7, 10);
    const year = v.substring(13, 15);
    return day + '-' + month + '-' + year;
  });

  private timerStr = Subject.create('0:00:00');


  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    this.timeFormat.instance.setItems(['Local 12 Hour', 'Local 24 Hour', 'UTC']);
    this.date.set(Date());
    super.onAfterRender(node);
  }


  /**
   * When the Time formate changes this will auto change the Date and Time Fields.
   * @param index index of the option selected
   */
  private timeFormatChanged(index: number): void {
    if (index === 0) {
      this.dateTimeSettingManager.getSetting('dateTimeFormat').set(DateTimeFormatSettingMode.Local12);
      this.time.instance.props.format = TimeDisplayFormat.Local12;
    }
    if (index == 1) {
      this.dateTimeSettingManager.getSetting('dateTimeFormat').set(DateTimeFormatSettingMode.Local24);
      this.time.instance.props.format = TimeDisplayFormat.Local24;
    }
    if (index == 2) {
      this.dateTimeSettingManager.getSetting('dateTimeFormat').set(DateTimeFormatSettingMode.UTC);
      this.time.instance.props.format = TimeDisplayFormat.UTC;
    }
  }

  /**
   * Sets the offset
   * @param v The offset being set
   */
  private onOffsetAccepted(v: number): void {
    let hours = '0';
    let mins = '0';
    let milliTime = 0;
    let posOffset = true;

    if (v < 0) {
      posOffset = false;
    }

    const numberString = String(v);

    if (numberString.length === 4) {
      hours = numberString.slice(0, 2);
      mins = numberString.slice(2, 4);
    } else if (numberString.length === 3) {
      hours = numberString.slice(0, 1);
      mins = numberString.slice(1, 3);
    } else if (numberString.length === 2) {
      mins = numberString.slice(0, 2);
    } else if (numberString.length === 1) {
      mins = numberString.slice(0, 1);
    }

    // The hours portion is negative already if we have a negative offset due to the string parsing,
    // but minutes will need to be inverted manually.
    if (hours != '0' || mins != '0') {
      milliTime = ((Number(hours) * 3600000) + (Number(mins) * 60000 * (posOffset ? 1 : -1)));
    }
    this.offset.set(milliTime);
    this.dateTimeSettingManager.getSetting('dateTimeLocalOffset').set(milliTime);
  }

  /**
   * Sets the time format to 24 hours and the offset back to 0 (defaults).
   */
  private restoreDefaultValues(): void {
    this.dateTimeSettingManager.getSetting('dateTimeFormat').set(DateTimeFormatSettingMode.Local24);
    this.time.instance.props.format = TimeDisplayFormat.Local24;
    this.offset.set(0);
    this.dateTimeSettingManager.getSetting('dateTimeLocalOffset').set(0);
    this.onOffsetAccepted(0);
    this.timeFormatChanged(1);
    this.timeFormat.instance.setSelectedItem(1);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='page date-time-page hide-element' ref={this.el}>
        <div class='date-time-page-header'>
          <h2>DATE / TIME</h2>
        </div>
        <div class='date-time-page-date'>DATE
          <div class='date-time-page-date-div'>
            {this.date}
          </div>
        </div>
        <div class='date-time-page-time'>TIME
          <div class='date-time-page-time-div'>
            <GNSTimeDisplay
              ref={this.time}
              time={ConsumerSubject.create(this.props.bus.getSubscriber<ClockEvents>().on('simTime'), 0)}
              format={
                this.dateTimeFormatSub.map(setting => {
                  return DateTimePage.FORMAT_SETTING_MAP[setting];
                })
              }
              localOffset={ConsumerSubject.create(this.dateTimeSettingManager.whenSettingChanged('dateTimeLocalOffset'), this.dateTimeSettingManager.getSetting('dateTimeLocalOffset').value)}
              class='utc-time-display size20'
            />
          </div>
        </div>
        <div class='date-time-page-time-format'>
          <WaypointPageSelector class='time-format' label='TIME FORMAT' onSelected={this.timeFormatChanged.bind(this)} ref={this.timeFormat} />
        </div>
        <div class='date-time-page-time-offset'>TIME OFFSET
          <div class='date-time-page-time-offset-div'>
            <GNSGenericNumberInput
              value={this.offset}
              ref={this.offsetInput}
              onInputAccepted={(v): void => { this.onOffsetAccepted(v); }}
              activateOnClr={true}
            >
              <GNSSignInput sign={Subject.create<1 | -1>(1)} /> {/* FIXME this is not how it works IRL, but I will adapt the digit component later to support a negative sign */}
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={24} increment={1} scale={100} wrap={true} />
              <span>:</span>
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={6} increment={1} scale={10} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} />
            </GNSGenericNumberInput>
          </div>
        </div>
      </div>
    );
  }
}
