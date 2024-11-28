import { ConsumerSubject, DmsFormatter2, EventBus, FSComponent, LNavDataEvents, NumberFormatter, NumberUnit, NumberUnitSubject, Subject, Subscription, UnitType, VNode } from '@microsoft/msfs-sdk';

import { ButtonBoxArrow, ButtonMenu, FmsPositionMode, FmsPositionSystemEvents, GpsReceiverSystemEvents, NumberUnitDisplay, SectionOutline, TabContent, TabContentProps, TouchButton } from '@microsoft/msfs-epic2-shared';

import './SensorsWindow.css';

/** The properties for the {@link SensorsWindow} component. */
interface SensorsWindowProps extends TabContentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/** The SensorsWindow component. */
export class SensorsWindow extends TabContent<SensorsWindowProps> {
  private sub = this.props.bus.getSubscriber<FmsPositionSystemEvents & GpsReceiverSystemEvents & LNavDataEvents>();

  private readonly fmsPosMode = ConsumerSubject.create(this.sub.on('fms_pos_mode_1'), FmsPositionMode.None).pause();
  private readonly position = ConsumerSubject.create(this.sub.on('fms_pos_gps-position_1').atFrequency(1), null).pause();
  private readonly epu = NumberUnitSubject.create(new NumberUnit(NaN, UnitType.NMILE));
  private readonly rnp = NumberUnitSubject.create(new NumberUnit(NaN, UnitType.NMILE));

  /** Lateral mode.
   * Possiblities (depending on installed equipment i.e. IRS) are:
   * - IRS HYB
   * - IRS HYB D
   * - GPS SBAS
   * - GPS
   * - IRS
   * - DR (amber)
   * - No NAV
   */
  private readonly latMode = this.fmsPosMode.map(
    (fmsPosMode) => {
      switch (fmsPosMode) {
        case FmsPositionMode.GpsSbas:
          return 'GPS SBAS';
        case FmsPositionMode.Gps:
          return 'GPS';
        case FmsPositionMode.DeadReckoning:
          return 'DR';
        default:
          return 'No NAV';
      }
    }
  );

  private readonly epuRnpFormatter = NumberFormatter.create({ precision: 0.01, forceDecimalZeroes: true, maxDigits: 3, cache: true, nanString: '-.--' });

  private readonly latFormatter = DmsFormatter2.create('{+[N]-[S]}{dd}°{mm.mm}', UnitType.DEGREE, 0, 'N--°--.--');
  private readonly lonFormatter = DmsFormatter2.create('{+[E]-[W]}{ddd}°{mm.mm}', UnitType.DEGREE, 0, 'E---°--.--');
  private readonly formattedPosition = Subject.create(`${this.latFormatter(NaN)}\n${this.lonFormatter(NaN)}`);

  private readonly subs: Subscription[];

  /**
   * Construct a new SensorsWindow.
   * @param props Properties for the window.
   */
  constructor(props: SensorsWindowProps) {
    super(props);

    this.subs = [
      this.fmsPosMode,
      this.position,
      this.sub.on('fms_pos_epu_1').atFrequency(1).handle((v) => this.epu.set(v >= 0 ? v : NaN)),
      this.sub.on('lnavdata_cdi_scale').handle((v) => this.rnp.set(v >= 0 ? v : NaN)),
      this.position.sub((v) => this.formattedPosition.set(`${this.latFormatter(v === null ? NaN : v.lat)}\n${this.lonFormatter(v === null ? NaN : v.long)}`), true),
    ];
  }

  /** @inheritdoc */
  public onResume(): void {
    for (const sub of this.subs) {
      sub.resume(true);
    }
  }

  /** @inheritdoc */
  public onPause(): void {
    for (const sub of this.subs) {
      sub.pause();
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="avionics-window-section">
        <SectionOutline bus={this.props.bus}>
          <div class="performance-window-menu">
            <ButtonMenu
              buttons={[
                <TouchButton variant="bar" label="Performance" />
              ]}
              position="bottom"
              isEnabled={false}
            >
              <ButtonBoxArrow label="Performance" isEnabled={false} />
            </ButtonMenu>
          </div>
          <div class="performance-window-content">
            <div class="performance-window-data">
              <div>RNP:</div>
              {/*
                FIXME this should be an input box allowing manually setting the RNP.
                Needs systems implementation in Epic2NavDataComputer.
              */}
              <div><NumberUnitDisplay formatter={this.epuRnpFormatter} displayUnit={UnitType.NMILE} value={this.rnp} class="green" /></div>
            </div>
            <div class="title">FMS</div>
            <div class="performance-window-data">
              <div>Lat Mode:</div>
              <div class={{ 'green': true, 'amber': this.latMode.map((v) => v === 'DR') }}>{this.latMode}</div>
              <div>Position:</div>
              <div class="white">{this.formattedPosition}</div>
              <div>EPU:</div>
              <div><NumberUnitDisplay formatter={this.epuRnpFormatter} displayUnit={UnitType.NMILE} value={this.epu} class="white" /></div>
            </div>
          </div>
        </SectionOutline>
      </div>
    );
  }
}
