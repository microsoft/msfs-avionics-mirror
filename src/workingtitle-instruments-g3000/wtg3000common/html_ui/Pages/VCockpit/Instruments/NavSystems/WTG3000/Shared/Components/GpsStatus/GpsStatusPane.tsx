import {
  AbstractMapTextLabel, BasicNavAngleSubject, BasicNavAngleUnit, ComponentProps, ComputedSubject, ConsumerValue, DisplayComponent, EventBus,
  FSComponent, GeoPoint, GeoPointSubject, GNSSEvents, GPSSatellite, GPSSatelliteState, GPSSystemSBASState, GPSSystemState, MappedSubject,
  MapProjection, NumberFormatter, NumberUnitInterface, NumberUnitSubject, Subject, SubscribableMapFunctions, Subscription,
  Unit, UnitFamily, UnitType, Vec2Math, Vec2Subject, VNode
} from '@microsoft/msfs-sdk';

import {
  DateTimeFormatSettingMode, DateTimeUserSettings, LatLonDisplayFormat, TimeDisplayFormat, UnitsDistanceSettingMode, UnitsUserSettings
} from '@microsoft/msfs-garminsdk';

import { BearingDisplay } from '../Common/BearingDisplay';
import { GarminLatLonDisplay } from '../Common/GarminLatLonDisplay';
import { NumberUnitDisplay } from '../Common/NumberUnitDisplay';
import { TimeDisplay } from '../Common/TimeDisplay';
import { DisplayPaneSizeMode, DisplayPaneView, DisplayPaneViewProps } from '../DisplayPanes';
import { DynamicList } from '../List/DynamicList';
import { GpsSatelliteData, GpsStatusDataProvider } from './GpsStatusDataProvider';

import './GpsStatusPane.css';

/**
 * Props on the GpsStatusPane display pane.
 */
export interface GpsStatusPaneProps extends DisplayPaneViewProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The GPS data provider to use with this pane. */
  dataProvider: GpsStatusDataProvider;
}

/**
 * The G3000/5000 GPS Status display pane.
 */
export class GpsStatusPane extends DisplayPaneView<GpsStatusPaneProps> {

  private static readonly TIME_FORMAT_MAP = (setting: DateTimeFormatSettingMode): TimeDisplayFormat => {
    switch (setting) {
      case DateTimeFormatSettingMode.Local12:
        return TimeDisplayFormat.Local12;
      case DateTimeFormatSettingMode.Local24:
        return TimeDisplayFormat.Local24;
      default:
        return TimeDisplayFormat.UTC;
    }
  };

  private static readonly FOM_DISPLAY_UNIT_MAP = ([fom, setting]: readonly [NumberUnitInterface<UnitFamily.Distance>, UnitsDistanceSettingMode]): Unit<UnitFamily.Distance> => {
    let largeUnit: Unit<UnitFamily.Distance>;
    let smallUnit: Unit<UnitFamily.Distance>;
    let smallUnitThreshold: number;

    if (setting === UnitsDistanceSettingMode.Metric) {
      largeUnit = UnitType.KILOMETER;
      smallUnit = UnitType.METER;
      smallUnitThreshold = 999;
    } else {
      largeUnit = UnitType.NMILE;
      smallUnit = UnitType.FOOT;
      smallUnitThreshold = 2500;
    }

    if (!fom.isNaN() && fom.asUnit(smallUnit) <= smallUnitThreshold) {
      return smallUnit;
    } else {
      return largeUnit;
    }
  };

  private readonly unitsSettings = UnitsUserSettings.getManager(this.props.bus);
  private readonly timeSettings = DateTimeUserSettings.getManager(this.props.bus);
  private readonly timeFormat = this.timeSettings.getSetting('dateTimeFormat').map(GpsStatusPane.TIME_FORMAT_MAP);

  private readonly satellites = FSComponent.createRef<HTMLDivElement>();
  private readonly canvasEl = FSComponent.createRef<HTMLCanvasElement>();
  private readonly label = new GPSSatelliteTextLabel();
  private readonly nullProjection = new MapProjection(8, 8);
  private satList?: DynamicList<GpsSatelliteData>;

  private readonly realGpsPos = ConsumerValue.create(null, new LatLongAlt(0, 0, 0)).pause();

  private readonly gpsPosition = GeoPointSubject.create(new GeoPoint(NaN, NaN));
  private readonly gpsAlt = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));

  private readonly time = Subject.create(0);

  private readonly groundSpeed = NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN));
  private readonly track = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(NaN));

  private readonly epu = NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN));
  private readonly hdop = Subject.create('_._');
  private readonly hfom = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));
  private readonly vfom = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));

  private readonly hfomDisplayUnit = MappedSubject.create(
    GpsStatusPane.FOM_DISPLAY_UNIT_MAP,
    this.hfom,
    this.unitsSettings.getSetting('unitsDistance')
  ).pause();
  private readonly vfomDisplayUnit = MappedSubject.create(
    GpsStatusPane.FOM_DISPLAY_UNIT_MAP,
    this.vfom,
    this.unitsSettings.getSetting('unitsDistance')
  ).pause();

  private readonly hfomLargeUnitFormatter = NumberFormatter.create({ precision: 0.1, nanString: '____', cache: true });
  private readonly hfomSmallUnitFormatter = NumberFormatter.create({ precision: 1, nanString: '____', cache: true });

  private readonly vfomLargeUnitFormatter = NumberFormatter.create({ precision: 0.1, nanString: '____', cache: true });
  private readonly vfomSmallUnitFormatter = NumberFormatter.create({ precision: 1, nanString: '____', cache: true });

  private readonly dataSubs: Subscription[] = [];

  private readonly systemState = this.props.dataProvider.systemState.map(s => {
    switch (s) {
      case GPSSystemState.Acquiring:
        return 'ACQUIRING';
      case GPSSystemState.SolutionAcquired:
        return '3D NAV';
      case GPSSystemState.DiffSolutionAcquired:
        return '3D DIFF NAV';
      default:
        return 'SEARCHING';
    }
  }).pause();

  private readonly sbasState = this.props.dataProvider.sbasState.map(s => {
    switch (s) {
      case GPSSystemSBASState.Active:
        return 'ACTIVE';
      case GPSSystemSBASState.Disabled:
        return 'DISABLED';
      case GPSSystemSBASState.Inactive:
        return 'INACTIVE';
      default:
        return 'INACTIVE';
    }
  }).pause();

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this._title.set(`GPS${this.props.dataProvider.index} Status`);

    this.realGpsPos.setConsumer(this.props.bus.getSubscriber<GNSSEvents>().on('gps-position'));

    this.satList = new DynamicList(this.props.dataProvider.activeSatellites, this.satellites.instance, d => <SatelliteBar data={d.sat} />, (a, b) => a.sat.prn - b.sat.prn);

    const hdopFormatter = NumberFormatter.create({ precision: 0.1, nanString: '_._', cache: true });

    this.dataSubs.push(
      this.props.dataProvider.position.pipe(this.gpsPosition, true),
      this.props.dataProvider.altitude.pipe(this.gpsAlt, true),
      this.props.dataProvider.time.pipe(this.time, SubscribableMapFunctions.withPrecision(1000), true),
      this.props.dataProvider.groundSpeed.pipe(this.groundSpeed, true),
      this.props.dataProvider.groundTrack.pipe(this.track, true),

      this.props.dataProvider.pdop.pipe(this.epu, p => p * 0.4, true),
      this.props.dataProvider.hdop.sub(h => {
        this.hdop.set(hdopFormatter(h));
        this.hfom.set(h * 35);
      }, true),
      this.props.dataProvider.vdop.pipe(this.vfom, v => v * 35, true),

      this.props.dataProvider.activeSatellites.sub(this.satList.updateOrder.bind(this.satList))
    );
  }

  /** @inheritdoc */
  public onPause(): void {
    super.onPause();

    this.realGpsPos.pause();

    this.satList?.forEachComponent<SatelliteBar>(s => s?.onPause());
    this.systemState.pause();
    this.sbasState.pause();

    this.hfomDisplayUnit.pause();
    this.vfomDisplayUnit.pause();

    this.dataSubs.forEach(sub => { sub.pause(); });
  }

  /** @inheritdoc */
  public onResume(size: DisplayPaneSizeMode, width: number, height: number): void {
    super.onResume(size, width, height);

    this.realGpsPos.resume();

    this.satList?.forEachComponent<SatelliteBar>(s => s?.onResume());
    this.systemState.resume();
    this.sbasState.resume();

    this.hfomDisplayUnit.resume();
    this.vfomDisplayUnit.resume();

    this.dataSubs.forEach(sub => { sub.resume(true); });
  }

  /** @inheritdoc */
  public onUpdate(): void {
    this.drawSatellites();
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

      context.strokeStyle = 'white';
      context.lineWidth = 1;

      context.beginPath();
      context.ellipse(cx, cy, radius, radius, 0, 0, 2 * Math.PI);
      context.ellipse(cx, cy, radius / 2, radius / 2, 0, 0, 2 * Math.PI);
      context.ellipse(cx, cy, radius / 10, radius / 10, 0, 0, 2 * Math.PI);
      context.stroke();

      const maxZenithAngle = (Math.PI / 2) + this.calcHorizonAngle();
      this.label.maxZenithAngle.set(maxZenithAngle);

      let numVisible = 0;
      for (const data of this.props.dataProvider.activeSatellites.getArray()) {
        const sat = data.sat;
        const satState = sat.state.get();
        const pos = sat.position.get();

        if (satState !== GPSSatelliteState.None && satState !== GPSSatelliteState.Unreachable && numVisible < 15) {
          numVisible++;

          this.label.text.set(sat.prn.toFixed(0).padStart(3, '0'));
          this.label.state.set(sat.state.get());
          this.label.location.set(pos);
          this.label.draw(context, this.nullProjection);
        }
      }
    }
  }

  /**
   * Calculates the horizon zenith angle.
   * @returns The calculated horizon zenith angle based on the current altitude.
   */
  private calcHorizonAngle(): number {
    return Math.acos(6378100 / (6378100 + Math.max(this.realGpsPos.get().alt, 0)));
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div class='gps-status-pane'>
        <div class='gps-status-leftcol'>
          <div class='gps-status-sigstrength gps-status-box'>
            <h2>GPS SIGNAL STRENGTH</h2>
            <div class='gps-status-sigstrength-bg'>
              <div /><div /><div /><div />
            </div>
            <div class='gps-status-satellites' ref={this.satellites} />
          </div>
        </div>
        <div class='gps-status-rightcol'>
          <div class='gps-status-constellation gps-status-box'>
            <h2>CONSTELLATION</h2>
            <canvas class='gps-status-map' ref={this.canvasEl} width='213px' height='193px' />
          </div>
          <div class='gps-status-satstatus gps-status-box'>
            <h2>SATELLITE STATUS</h2>
            <table>
              <tr>
                <td>EPU</td>
                <td>
                  <NumberUnitDisplay value={this.epu} displayUnit={this.unitsSettings.distanceUnitsLarge} formatter={NumberFormatter.create({ precision: 0.1, nanString: '_._' })} />
                </td>
              </tr>
              <tr>
                <td>HDOP</td>
                <td>
                  {this.hdop}
                </td>
              </tr>
              <tr>
                <td>HFOM</td>
                <td>
                  <NumberUnitDisplay
                    value={this.hfom}
                    displayUnit={this.hfomDisplayUnit}
                    formatter={value => {
                      const displayUnit = this.hfomDisplayUnit.get();
                      if (displayUnit === UnitType.FOOT || displayUnit === UnitType.METER) {
                        return this.hfomSmallUnitFormatter(value);
                      } else {
                        return this.hfomLargeUnitFormatter(value);
                      }
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td>VFOM</td>
                <td>
                  <NumberUnitDisplay
                    value={this.vfom}
                    displayUnit={this.vfomDisplayUnit}
                    formatter={value => {
                      const displayUnit = this.vfomDisplayUnit.get();
                      if (displayUnit === UnitType.FOOT || displayUnit === UnitType.METER) {
                        return this.vfomSmallUnitFormatter(value);
                      } else {
                        return this.vfomLargeUnitFormatter(value);
                      }
                    }}
                  />
                </td>
              </tr>
            </table>
            <table>
              <tr>
                <td>Position</td>
                <td>
                  <GarminLatLonDisplay class='gps-status-cyanvalue' value={this.gpsPosition} format={LatLonDisplayFormat.HDDD_MMmm} />
                </td>
              </tr>
              <tr>
                <td>Time</td>
                <td>
                  <TimeDisplay class='gps-status-cyanvalue' time={this.time} format={this.timeFormat} localOffset={this.timeSettings.getSetting('dateTimeLocalOffset')} />
                </td>
              </tr>
              <tr>
                <td>GPS ALT</td>
                <td>
                  <NumberUnitDisplay
                    class='gps-status-alt'
                    value={this.gpsAlt}
                    displayUnit={this.unitsSettings.altitudeUnits}
                    formatter={NumberFormatter.create({ precision: 1, nanString: '_____', cache: true })}
                  /> GSL
                </td>
              </tr>
              <tr>
                <td>GS</td>
                <td>
                  <NumberUnitDisplay
                    class='gps-status-cyanvalue'
                    value={this.groundSpeed}
                    displayUnit={this.unitsSettings.speedUnits}
                    formatter={NumberFormatter.create({ precision: 0.1, nanString: '___._', cache: true })}
                  />
                </td>
              </tr>
              <tr>
                <td>Track</td>
                <td>
                  <BearingDisplay
                    class='gps-status-cyanvalue'
                    value={this.track}
                    displayUnit={this.unitsSettings.navAngleUnits}
                    formatter={NumberFormatter.create({ precision: 1, pad: 3, nanString: '___', cache: true })}
                  />
                </td>
              </tr>
            </table>
          </div>
          <div class='gps-status-gpsstatus gps-status-box'>
            <h2>GPS STATUS</h2>
            <table>
              <tr>
                <td>PILOT</td><td>GPS1</td>
              </tr>
              <tr>
                <td>COPILOT</td><td>GPS1</td>
              </tr>
              <tr>
                <td>GPS SOLN</td><td>{this.systemState}</td>
              </tr>
              <tr>
                <td>SBAS</td><td>{this.sbasState}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.realGpsPos.destroy();

    this.satList?.destroy();
    this.systemState.destroy();
    this.sbasState.destroy();
    this.timeFormat.destroy();

    this.hfomDisplayUnit.destroy();
    this.vfomDisplayUnit.destroy();

    this.dataSubs.forEach(sub => { sub.destroy(); });
  }
}

/**
 * Props for the SatelliteBar component.
 */
interface SatelliteBarProps extends ComponentProps {
  /** The satellite data to display. */
  data: GPSSatellite;
}

/**
 * A component that displays a signal bar for a satellite.
 */
class SatelliteBar extends DisplayComponent<SatelliteBarProps> {
  private readonly barEl = FSComponent.createRef<HTMLDivElement>();
  private readonly diffEl = FSComponent.createRef<HTMLSpanElement>();
  private readonly diffInverseEl = FSComponent.createRef<HTMLSpanElement>();

  private readonly signalStrength = this.props.data.signalStrength.map(s => Math.round(s * 100) / 100);
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

        this.diffEl.instance.classList.add('hidden');
        this.diffInverseEl.instance.classList.add('hidden');
      } else if (v === GPSSatelliteState.DataCollected) {
        this.barEl.instance.classList.remove('in-use');
        this.barEl.instance.classList.remove('acquired');
        this.barEl.instance.classList.add('data-collected');

        this.diffEl.instance.classList.add('hidden');
        this.diffInverseEl.instance.classList.add('hidden');
      } else if (v === GPSSatelliteState.Acquired) {
        this.barEl.instance.classList.remove('in-use');
        this.barEl.instance.classList.add('acquired');
        this.barEl.instance.classList.remove('data-collected');

        this.diffEl.instance.classList.add('hidden');
        this.diffInverseEl.instance.classList.add('hidden');
      } else if (v === GPSSatelliteState.InUseDiffApplied) {
        this.barEl.instance.classList.add('in-use');
        this.barEl.instance.classList.remove('acquired');
        this.barEl.instance.classList.remove('data-collected');

        this.diffEl.instance.classList.remove('hidden');
        this.diffInverseEl.instance.classList.remove('hidden');
      } else {
        this.barEl.instance.classList.remove('in-use');
        this.barEl.instance.classList.remove('acquired');
        this.barEl.instance.classList.remove('data-collected');

        this.diffEl.instance.classList.add('hidden');
        this.diffInverseEl.instance.classList.add('hidden');
      }
    }, true);

    this.signalSub = this.signalStrength.sub(s => this.barEl.instance.style.width = `${s * 180}px`, true);
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
    this.signalStrength.destroy();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='gps-status-bargraph-item'>
        <div class='gps-status-bargraph-prn'>{this.props.data.prn.toFixed(0).padStart(3, '0')}</div>
        <div class='gps-status-bargraph-bar inverse'><span ref={this.diffInverseEl}>D</span></div>
        <div class='gps-status-bargraph-bar' style='width: 0px;' ref={this.barEl}><span ref={this.diffEl}>D</span></div>
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

    const bgStroke = ComputedSubject.create(GPSSatelliteState.None, s => {
      return s === GPSSatelliteState.Acquired ? 'cyan' : '';
    });

    state.sub(s => {
      fontColor.set(s);
      bgColor.set(s);
      bgStroke.set(s);
    });

    super(text, 0, {
      font: 'DejaVuSans-SemiBold',
      fontSize: 12,
      fontColor: fontColor,
      bgColor: bgColor,
      bgOutlineWidth: 1,
      bgOutlineColor: bgStroke,
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

  /** @inheritdoc */
  public drawBackground(context: CanvasRenderingContext2D, centerX: number, centerY: number, width: number, height: number): void {
    const bgWidth = width * 1.425;
    const bgHeight = height * 1.5;

    context.beginPath();
    context.moveTo(centerX - (bgWidth / 2) - 6, centerY);
    context.lineTo(centerX + (bgWidth / 2) + 6, centerY);
    context.lineWidth = 1.5;
    context.strokeStyle = this.bgOutlineColor.get() !== '' ? this.bgOutlineColor.get() : this.bgColor.get();
    context.stroke();

    context.beginPath();
    context.ellipse(centerX, centerY, bgWidth / 2, bgHeight / 2, 0, 0, 2 * Math.PI);
    if (this.bgOutlineColor.get() !== '') {
      context.lineWidth = 1.5;
      context.strokeStyle = this.bgOutlineColor.get();
      context.stroke();
    }

    context.fillStyle = this.bgColor.get();
    context.fill();
  }
}