import {
  AbstractMapTextLabel, ArraySubject, BasicConsumer, ClockEvents, ComputedSubject, EventBus, FSComponent, GeoPoint, GeoPointSubject, GNSSEvents, GPSSatComputer,
  GPSSatComputerEvents, GPSSatellite, GPSSatelliteState, GPSSystemState, LatLonDisplay, MapProjection, NumberFormatter, NumberUnitSubject, Subject,
  Subscription, UnitType, Vec2Math, Vec2Subject, VNode
} from '@microsoft/msfs-sdk';

import { PowerEvents, PowerState } from '../../../Instruments/Power';
import { GNSSettingsProvider } from '../../../Settings/GNSSettingsProvider';
import { GNSNumberUnitDisplay } from '../../Controls/GNSNumberUnitDisplay';
import { GNSTimeDisplay } from '../../Controls/GNSTimeDisplay';
import { GNSFieldTimeRenderer } from '../../DataFields/GNSDataFieldRenderer';
import { GNSUiControl, GNSUiControlList, GNSUiControlProps } from '../../GNSUiControl';
import { Page, PageProps, ViewService } from '../Pages';

import './GPSStatus.css';

/**
 * Props on the GPSStatus page.
 */
interface GPSStatusProps extends PageProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** An instance of the GPS satellite tracker. */
  sats: GPSSatComputer;

  /** The GNS settings provider. */
  settingsProvider: GNSSettingsProvider;
}

/**
 * The GNS GPS status page.
 */
export class GPSStatus extends Page<GPSStatusProps> {
  private readonly canvasEl = FSComponent.createRef<HTMLCanvasElement>();
  private readonly nullProjection = new MapProjection(8, 8);
  private readonly label = new GPSSatelliteTextLabel();

  private readonly statusText = Subject.create('SEARCHING');
  private readonly hfom = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));
  private readonly vfom = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));
  private readonly epu = NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN));

  private clockSub?: Subscription;

  private readonly activeSatellites = ArraySubject.create<GPSSatellite>();
  private readonly satelliteBars = FSComponent.createRef<GNSUiControlList<GPSSatellite>>();

  private readonly ppos = GeoPointSubject.create(new GeoPoint(NaN, NaN));
  private readonly altitude = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));
  private readonly simTime = Subject.create<number>(NaN);

  private shouldGoToMapOn3DNav = false;

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.clockSub = this.props.bus.getSubscriber<ClockEvents>().on('realTime').atFrequency(1).handle(this.drawSatellites.bind(this));

    this.props.bus.getSubscriber<ClockEvents>().on('simTime').atFrequency(1).handle(this.onSimTimeChanged.bind(this));
    this.props.bus.getSubscriber<GPSSatComputerEvents>().on('gps_sat_state_changed_1').handle(this.onGpsSatStateChanged.bind(this));
    this.props.bus.getSubscriber<GPSSatComputerEvents>().on('gps_system_state_changed_1').handle(this.onGpsSystemStateChanged.bind(this));
    this.props.bus.getSubscriber<GNSSEvents>().on('gps-position').handle(this.onGpsPositionChanged.bind(this));

    this.props.bus.getSubscriber<PowerEvents>().on('instrument_powered').handle(this.onPowerStateChanged.bind(this));
  }

  /**
   * Handles when the GNS power state changes.
   * @param state The new power state.
   */
  private onPowerStateChanged(state: PowerState): void {
    if (state === PowerState.On) {
      this.shouldGoToMapOn3DNav = true;
    }
  }

  /**
   * Handles when the GPS position has changed.
   * @param pos The new GPS position.
   */
  private onGpsPositionChanged(pos: LatLongAlt): void {
    if (this.props.sats.state !== GPSSystemState.SolutionAcquired && this.props.sats.state !== GPSSystemState.DiffSolutionAcquired) {
      this.ppos.set(NaN, NaN);
      this.altitude.set(NaN);
    } else {
      this.ppos.set(pos.lat, pos.long);
      this.altitude.set(pos.alt);
    }
  }

  /**
   * Handles when the GPS system state has changed.
   * @param state The new GPS system state.
   */
  private onGpsSystemStateChanged(state: GPSSystemState): void {
    switch (state) {
      case GPSSystemState.Searching:
        this.statusText.set('SEARCHING');
        break;
      case GPSSystemState.Acquiring:
        this.statusText.set('ACQUIRING');
        break;
      case GPSSystemState.SolutionAcquired:
        this.statusText.set('3D NAV');
        if (this.shouldGoToMapOn3DNav) {
          ViewService.open('NAV', true, 1);
          this.shouldGoToMapOn3DNav = false;
        }
        break;
      case GPSSystemState.DiffSolutionAcquired:
        this.statusText.set('3D DIFF NAV');
        if (this.shouldGoToMapOn3DNav) {
          ViewService.open('NAV', true, 1);
          this.shouldGoToMapOn3DNav = false;
        }
        break;
    }
  }

  /**
   * Handles when a GPS satellite state changes.
   * @param sat The satellite whose state has changed.
   */
  private onGpsSatStateChanged(sat: GPSSatellite): void {
    const satState = sat.state.get();
    if (satState === GPSSatelliteState.None || satState === GPSSatelliteState.Unreachable) {
      this.activeSatellites.removeItem(sat);
    } else {
      const index = this.activeSatellites.getArray().indexOf(sat);
      if (index === -1) {
        this.activeSatellites.insert(sat);
      }

      let inUseSatellites = 0;
      this.activeSatellites.getArray().forEach(s => (s.state.get() === GPSSatelliteState.InUse || s.state.get() === GPSSatelliteState.InUseDiffApplied) && inUseSatellites++);
      this.updateStatusValues(inUseSatellites);
    }
  }

  /**
   * Handles when the sim time changes.
   * @param t The new sim time.
   */
  private onSimTimeChanged(t: number): void {
    if (this.props.sats.state !== GPSSystemState.SolutionAcquired && this.props.sats.state !== GPSSystemState.DiffSolutionAcquired) {
      this.simTime.set(NaN);
    } else {
      this.simTime.set(t);
    }
  }

  /** @inheritdoc */
  public onSuspend(): void {
    super.onSuspend();
    this.clockSub?.pause();
  }

  /** @inheritdoc */
  public onResume(): void {
    super.onResume();
    this.clockSub?.resume();
  }

  /**
   * Updates the GPS status computed values based on the number of available
   * satellites in use.
   * @param inUse The number of satellites in use.
   */
  private updateStatusValues(inUse: number): void {
    if (inUse >= 6) {
      this.hfom.set(16);
      this.vfom.set(24);
      this.epu.set(0.03);
    } else if (inUse === 5) {
      this.hfom.set(22);
      this.vfom.set(28);
      this.epu.set(0.05);
    } else if (inUse === 4) {
      this.hfom.set(30);
      this.vfom.set(36);
      this.epu.set(0.08);
    } else {
      this.hfom.set(NaN);
      this.vfom.set(NaN);
      this.epu.set(NaN);
    }
  }

  /**
   * Draws the satellite sky display.
   */
  private drawSatellites(): void {
    const context = this.canvasEl.instance.getContext('2d');
    this.label.displaySize.set(this.canvasEl.instance.width, this.canvasEl.instance.height);

    if (context !== null) {
      context.clearRect(0, 0, this.canvasEl.instance.width, this.canvasEl.instance.height);

      const cx = this.canvasEl.instance.width / 2;
      const cy = this.canvasEl.instance.height / 2;
      const radius = cy - 3;

      context.strokeStyle = '#0f0';
      context.lineWidth = 1;

      context.beginPath();
      context.ellipse(cx, cy, radius, radius, 0, 0, 2 * Math.PI);
      context.ellipse(cx, cy, radius / 2, radius / 2, 0, 0, 2 * Math.PI);
      context.ellipse(cx, cy, 2, 2, 0, 0, 2 * Math.PI);
      context.stroke();

      const maxZenithAngle = (Math.PI / 2) + this.props.sats.calcHorizonAngle();
      this.label.maxZenithAngle.set(maxZenithAngle);

      let numVisible = 0;
      for (const sat of this.props.sats.sats) {
        const satState = sat.state.get();
        const pos = sat.position.get();

        if (satState !== GPSSatelliteState.None && satState !== GPSSatelliteState.Unreachable && numVisible < 15) {
          numVisible++;

          const displayPrn = sat.prn < 100 ? sat.prn : (sat.prn - 100) + 20;
          this.label.text.set(displayPrn.toFixed(0).padStart(2, '0'));
          this.label.state.set(sat.state.get());
          this.label.location.set(pos);
          this.label.draw(context, this.nullProjection);
        }
      }
    }
  }

  /**
   * Renders the bottom position status.
   * @returns The 530 status or nothing on the 430
   */
  private renderBottomPositionStatus(): VNode {
    if (this.props.gnsType === 'wt430') {
      return (<div></div>);

    } else {
      return (<div class='gps-status-postimealt'>
        <div>
          <h3>POSITION</h3>
          <LatLonDisplay class='gps-status-positionbox' location={this.ppos} />
        </div>
        <div>
          <h3>TIME</h3>
          <GNSTimeDisplay class='gps-status-timebox'
            time={this.simTime}
            format={this.props.settingsProvider.time.getSetting('dateTimeFormat').map(s => GNSFieldTimeRenderer.FORMAT_SETTING_MAP[s])}
            localOffset={this.props.settingsProvider.time.getSetting('dateTimeLocalOffset')} />
        </div>
        <div>
          <h3>ALT</h3>
          <GNSNumberUnitDisplay class='gps-status-altbox' formatter={NumberFormatter.create({ precision: 1, nanString: '_____' })} value={this.altitude}
            displayUnit={this.props.settingsProvider.units.altitudeUnits} />
        </div>
      </div>);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='page gps-status hide-element' ref={this.el}>
        <canvas class='gps-status-map' ref={this.canvasEl} width='112px' height='92px' />
        <div class='gps-status-statuscontainer'>
          <div>
            <h3>STATUS</h3>
            <div class='gps-status-status'>{this.statusText}</div>
          </div>
          <div class='gps-status-values'>
            <div>
              <label>HFOM</label>
              <label>VFOM</label>
              <label>EPU</label>
            </div>
            <div>
              <GNSNumberUnitDisplay formatter={NumberFormatter.create({ precision: 1, nanString: '_____' })} value={this.hfom}
                displayUnit={this.props.settingsProvider.units.distanceUnitsSmall} />
              <GNSNumberUnitDisplay formatter={NumberFormatter.create({ precision: 1, nanString: '_____' })} value={this.vfom}
                displayUnit={this.props.settingsProvider.units.distanceUnitsSmall} />
              <GNSNumberUnitDisplay formatter={NumberFormatter.create({ precision: 0.01, maxDigits: 3, nanString: '__.__' })} value={this.epu}
                displayUnit={this.props.settingsProvider.units.distanceUnitsLarge} />
            </div>
          </div>
        </div>
        <div class='gps-status-bargraph'>
          <hr /><hr /><hr />
          <div class='gps-status-bargraph-items'>
            <GNSUiControlList<GPSSatellite> data={this.activeSatellites} renderItem={(v: GPSSatellite) => <SatelliteBar data={v} />} orderBy={(a, b) => a.prn - b.prn} />
          </div>
        </div>
        {this.renderBottomPositionStatus()}
      </div>
    );
  }
}

/**
 * Props on the SatelliteBar component.
 */
interface SatelliteBarProps extends GNSUiControlProps {
  /** The satellite data to display. */
  data: GPSSatellite;
}

/**
 * A component that displays a signal bar for a satellite.
 */
class SatelliteBar extends GNSUiControl<SatelliteBarProps> {
  private readonly barEl = FSComponent.createRef<HTMLDivElement>();
  private readonly diffEl = FSComponent.createRef<HTMLSpanElement>();
  private readonly diffInverseEl = FSComponent.createRef<HTMLSpanElement>();
  private stateSub?: Subscription;
  private signalSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.stateSub = this.props.data.state.sub(v => {
      if (v === GPSSatelliteState.InUse) {
        this.barEl.instance.classList.add('in-use');
        this.barEl.instance.classList.remove('acquired');
        this.barEl.instance.classList.remove('data-collected');

        this.diffEl.instance.classList.add('hide-element');
        this.diffInverseEl.instance.classList.add('hide-element');
      } else if (v === GPSSatelliteState.DataCollected) {
        this.barEl.instance.classList.remove('in-use');
        this.barEl.instance.classList.remove('acquired');
        this.barEl.instance.classList.add('data-collected');

        this.diffEl.instance.classList.add('hide-element');
        this.diffInverseEl.instance.classList.add('hide-element');
      } else if (v === GPSSatelliteState.Acquired) {
        this.barEl.instance.classList.remove('in-use');
        this.barEl.instance.classList.add('acquired');
        this.barEl.instance.classList.remove('data-collected');

        this.diffEl.instance.classList.add('hide-element');
        this.diffInverseEl.instance.classList.add('hide-element');
      } else if (v === GPSSatelliteState.InUseDiffApplied) {
        this.barEl.instance.classList.add('in-use');
        this.barEl.instance.classList.remove('acquired');
        this.barEl.instance.classList.remove('data-collected');

        this.diffEl.instance.classList.remove('hide-element');
        this.diffInverseEl.instance.classList.remove('hide-element');
      } else {
        this.barEl.instance.classList.remove('in-use');
        this.barEl.instance.classList.remove('acquired');
        this.barEl.instance.classList.remove('data-collected');

        this.diffEl.instance.classList.add('hide-element');
        this.diffInverseEl.instance.classList.add('hide-element');
      }
    }, true);

    const signalConsumer = new BasicConsumer<number>((h, p) => this.props.data.signalStrength.sub(h, true, p));
    this.signalSub = signalConsumer.withPrecision(2).handle(s => this.barEl.instance.style.height = `${s * 44}px`);
  }

  /**
   * A callback called to pause the item when the page is paused.
   */
  public onPause(): void {
    this.stateSub?.pause();
    this.signalSub?.pause();
  }

  /**
   * A callback called to resume the item when the page is resumed.
   */
  public onResume(): void {
    this.stateSub?.resume();
    this.signalSub?.resume();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.stateSub?.destroy();
    this.signalSub?.destroy();
  }

  /**
   * Formats the satellite PRN, converting +100 PRNs into unused higher than 32 numbers.
   * @returns The formatted PRN as a string to display.
   */
  private formatPrn(): string {
    const displayPrn = this.props.data.prn < 100 ? this.props.data.prn : (this.props.data.prn - 100) + 20;
    return displayPrn.toFixed(0).padStart(2, '0');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='gps-status-bargraph-item'>
        <div class='gps-status-bargraph-bar inverse'><span ref={this.diffInverseEl}>D</span></div>
        <div class='gps-status-bargraph-bar' ref={this.barEl}><span ref={this.diffEl}>D</span></div>
        <div class='gps-status-bargraph-prn'>{this.formatPrn()}</div>
      </div>
    );
  }
}

/**
 * A text label for a GPS satellite.
 */
class GPSSatelliteTextLabel extends AbstractMapTextLabel {
  public readonly location: Vec2Subject;
  public readonly displaySize: Vec2Subject;
  public readonly maxZenithAngle: Subject<number>;
  public readonly text: Subject<string>;
  public readonly state: Subject<GPSSatelliteState>;

  /**
   * Constructor.
   */
  constructor(
  ) {
    const text = Subject.create('');
    const state = Subject.create<GPSSatelliteState>(GPSSatelliteState.Unreachable);
    const fontColor = ComputedSubject.create(GPSSatelliteState.None, s => {
      switch (s) {
        case GPSSatelliteState.Acquired:
          return '#0ff';
        default:
          return 'black';
      }
    });

    const bgColor = ComputedSubject.create(GPSSatelliteState.None, s => {
      switch (s) {
        case GPSSatelliteState.DataCollected:
          return 'cyan';
        case GPSSatelliteState.InUseDiffApplied:
        case GPSSatelliteState.InUse:
          return '#0f0';
        default:
          return 'black';
      }
    });

    state.sub(s => {
      fontColor.set(s);
      bgColor.set(s);
    });

    super(text, 0, {
      font: 'GreatNiftySymbol-Regular',
      fontSize: 10,
      fontColor: fontColor,
      bgColor: bgColor,
      bgBorderRadius: 2,
      bgPadding: new Float64Array([1, 1, 0, 1]),
      anchor: new Float64Array([0.5, 0.5]),
      showBg: true
    });

    this.text = text;
    this.state = state;

    this.location = Vec2Subject.create(new Float64Array(2));
    this.displaySize = Vec2Subject.create(new Float64Array(2));
    this.maxZenithAngle = Subject.create(90);
  }

  /** @inheritdoc */
  protected getPosition(mapProjection: MapProjection, out: Float64Array): Float64Array {
    const pos = this.location.get();

    const cx = this.displaySize.get()[0] / 2;
    const cy = this.displaySize.get()[1] / 2;

    const radius = (pos[0] / this.maxZenithAngle.get()) * Math.min(cx, cy) - 3;
    const theta = pos[1] - (Math.PI / 2);

    const x = (radius * Math.cos(theta)) + (cx);
    const y = (radius * Math.sin(theta)) + (cy);

    Vec2Math.set(x, y, out);
    return out;
  }
}