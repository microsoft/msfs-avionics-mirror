import {
  AdcEvents, AhrsEvents, APEvents, ClockEvents, ConsumerSubject, DateTimeFormatter, DisplayField, DmsFormatter2, EventBus, FmcRenderTemplate, GNSSEvents,
  LatLongInterface, MappedSubject, PageLinkField, StringUtils, Subject, Subscription, UnitType
} from '@microsoft/msfs-sdk';

import { UnsPositionMode, UnsPositionSystemEvents } from '../../Fms/Navigation/UnsPositionSystems';
import { UnsTextInputField, WritableUnsFieldState } from '../Components/UnsTextInputField';
import { UnsChars } from '../UnsCduDisplay';
import { UnsCduFormatters } from '../UnsCduIOUtils';
import { UnsFmcPage } from '../UnsFmcPage';

/**
 * Store for {@link UnsDeparturePage}
 */
class UnsDataPageStore {
   /** @inheritdoc */
  constructor(private readonly bus: EventBus) {}

  /** Data Page 2 */
  public readonly onGround = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('on_ground').atFrequency(1), false);
  public readonly positionMode = ConsumerSubject.create(this.bus.getSubscriber<UnsPositionSystemEvents>().on('uns_position_mode').atFrequency(1), UnsPositionMode.NoSensor);
  public readonly overallAnp = ConsumerSubject.create(this.bus.getSubscriber<UnsPositionSystemEvents>().on('uns_anp').atFrequency(5), 0);
  public readonly dmeAnp = ConsumerSubject.create(this.bus.getSubscriber<UnsPositionSystemEvents>().on('uns_dme_anp').atFrequency(5), 0);
  public readonly vorAnp = ConsumerSubject.create(this.bus.getSubscriber<UnsPositionSystemEvents>().on('uns_vor_anp').atFrequency(5), 0);
  public readonly activeGps = ConsumerSubject.create(this.bus.getSubscriber<UnsPositionSystemEvents>().on('uns_active_gps').atFrequency(5), 0);

  /** Data Page 3 */
  public readonly fmsPosition = ConsumerSubject.create(this.bus.getSubscriber<UnsPositionSystemEvents>().on('uns_position'), new LatLong());
  public readonly selectedSensorPos = Subject.create<LatLongInterface | null>(null);
  public readonly selectedSensor = Subject.create<string>('');
  public selectedSensorPipe: Subscription | undefined;
  public irsPositions: ConsumerSubject<LatLongInterface>[] = [];
  public gpsPositions: ConsumerSubject<LatLongInterface>[] = [];

  /** Data Page 4 */
  public readonly headingData = ConsumerSubject.create(this.bus.getSubscriber<AhrsEvents>().on('hdg_deg').withPrecision(0), 0);
  public readonly pitchData =  ConsumerSubject.create(this.bus.getSubscriber<AhrsEvents>().on('pitch_deg').withPrecision(1), 0);
  public readonly rollData =  ConsumerSubject.create(this.bus.getSubscriber<AhrsEvents>().on('roll_deg').withPrecision(1), 0);
  public readonly rollCmdData =  ConsumerSubject.create(this.bus.getSubscriber<APEvents>().on('flight_director_bank').withPrecision(1), 0);
  public readonly magVarData = ConsumerSubject.create(this.bus.getSubscriber<GNSSEvents>().on('magvar').withPrecision(0), 0);
  public readonly timestamp = ConsumerSubject.create(this.bus.getSubscriber<ClockEvents>().on('simTime').atFrequency(1), 0);
}

/** A UNS Data page */
export class UnsDataPage extends UnsFmcPage {
  protected pageTitle = '   DATA';
  private readonly store = new UnsDataPageStore(this.bus);
  private static readonly LAT_FORMATTER = DmsFormatter2.create('{+[N]-[S]}  {dd} {mm.mm}', UnitType.ARC_SEC, 0.6, 'N  -- --.--');
  private static readonly LON_FORMATTER = DmsFormatter2.create('{+[E]-[W]} {ddd} {mm.mm}', UnitType.ARC_SEC, 0.6, 'E --- --.--');
  private static readonly DateFormatter = DateTimeFormatter.create('{dd}-{MON}-{YY}', { nanString: '--------' });
  private static readonly TimeFormatter = DateTimeFormatter.create('{HH}:{mm}:{ss}', { nanString: '--:--:--' });
  private static readonly MAX_SENSORS_PER_COLUMN = 3;

  /** @inheritDoc */
  protected override onInit(): void {
    this.addBinding(this.store.fmsPosition);
    this.addBinding(this.store.headingData);
    this.addBinding(this.store.pitchData);
    this.addBinding(this.store.rollData);
    this.addBinding(this.store.rollCmdData);
    this.addBinding(this.store.magVarData);
    this.addBinding(this.store.timestamp);
    this.addBinding(this.store.onGround);
    this.addBinding(this.store.activeGps);
    this.addBinding(this.store.overallAnp);
    this.addBinding(this.store.dmeAnp);
    this.addBinding(this.store.vorAnp);
    this.addBinding(this.store.positionMode);

    this.createSensorQualityFields();
    this.createSensorOptions();
    this.handleSensorPosition();
  }

  /**
   * Data Page 1 [DATA LINKS]
   */

  private readonly MaintenanceLink = PageLinkField.createLink(this, 'MAINT→', '/data/maint');
  private readonly NavDataLink = PageLinkField.createLink(this, '←NAV DATA', '/data/nav');

  /**
   * Data Page 2 [SENSOR QUALITY DATA]
   */

  private SensorQualityFields = [] as UnsTextInputField<readonly [number, number, UnsPositionMode], number>[];

  /**
   * Creates the sensor quality fields
   */
  private createSensorQualityFields(): void {
    const navSensors = this.fmsConfig.sensors.navSensors;

    for (let i = 0; i < navSensors.waasSensorCount; i++) {
      this.createSensorQualityField('waas', i + 1);
    }

    for (let i = 0; i < navSensors.irsSensorCount; i++) {
      this.createSensorQualityField('irs', i + 1);
    }
  }

  /**
   * Create a sensor quality field
   * @param sensorType Type of sensor
   * @param sensorIndex Index of the sensor
   */
  private createSensorQualityField(sensorType: 'waas' | 'irs', sensorIndex: number): void {
    const sensorField = new UnsTextInputField<readonly [number, number, UnsPositionMode], number>(this, {
      formatter: {
        parse: () => null,
        format: ([[activeGps, overallAnp, positionMode]]: WritableUnsFieldState<readonly [number, number, UnsPositionMode]>): string => {
          const anp = (overallAnp * 10);
          const stringAnp = anp < 1 ?  anp.toFixed(1) : Math.round(anp).toString();
          const navQuality = (sensorIndex == activeGps || sensorType == 'irs') ? 'NAV' : stringAnp;

          let isDisabled;
          if (sensorType == 'waas') {
            switch (positionMode) {
              case UnsPositionMode.Gps:
              case UnsPositionMode.GpsDme:
                isDisabled = false;
                break;
              default:
                isDisabled = true;
            }
          } else if (sensorType == 'irs') {
            switch (positionMode) {
              case UnsPositionMode.NoSensor:
              case UnsPositionMode.DeadReckoning:
                isDisabled = true;
                break;
              default:
                isDisabled = false;
            }
          }

          if (!isDisabled) {
            return UnsCduFormatters.StringSpaceJoinSeperated(`←${sensorType.toUpperCase()}${sensorIndex}[s-text]`, navQuality, 10);
          } else {
            return UnsCduFormatters.StringSpaceJoinSeperated(`←${sensorType.toUpperCase()}${sensorIndex}[s-text][disabled]`, '(D)[disabled]', 10);
          }
        },
      },
      onSelected: async () => {
        this.screen.navigateTo(`/data/${sensorType}`, {index: sensorIndex});
        return true;
      },
      maxInputCharacterCount: 0,
    }).bindWrappedData(MappedSubject.create(this.store.activeGps, this.store.overallAnp, this.store.positionMode));

    this.SensorQualityFields.push(sensorField);
  }

  private readonly AnpData = new DisplayField<number>(this, {
    formatter: anp => {
      let anpDecimals = 0;
      if (anp < 1) {
        anpDecimals = 2;
      } else if (anp < 10) {
        anpDecimals = 1;
      }
      return `ANP=[cyan] ${anp.toFixed(anpDecimals)}`;
    },
  }).bind(this.store.overallAnp);

  private readonly PositionModeField = new DisplayField<string>(this, {
    formatter: positionMode => { return positionMode; }
  }).bind(this.store.positionMode);

  private readonly DmeAnpData = new UnsTextInputField<readonly [number, boolean], number>(this, {
    formatter: {
      parse: () => null,
      format: ([[anp, onGround]]: WritableUnsFieldState<readonly [number, boolean]>): string => {
        if (isNaN(anp) || onGround == true) {
          return UnsCduFormatters.StringSpaceJoinSeperated('DME[s-text][disabled]', '(D)[disabled]→', 10);
        } else {
          const newAnp = anp * 10;
          const anpDecimals = newAnp < 0.95 ? 1 : 0;
          return UnsCduFormatters.StringSpaceJoinSeperated('DME[s-text]', `${newAnp.toFixed(anpDecimals)}→`, 10);
        }
      },
    },
    onSelected: async () => {
      this.screen.navigateTo('/data/dme');
      return true;
    },
    maxInputCharacterCount: 0,
  }).bindWrappedData(MappedSubject.create(this.store.dmeAnp, this.store.onGround));

  private readonly VorAnpData = new UnsTextInputField<readonly [number, boolean], number>(this, {
    formatter: {
      parse: () => null,
      format: ([[anp, onGround]]: WritableUnsFieldState<readonly [number, boolean]>): string => {
        if (isNaN(anp) || onGround == true) {
          return UnsCduFormatters.StringSpaceJoinSeperated('VOR[s-text][disabled]', '(D)[disabled]→', 10);
        } else {
          const newAnp = anp * 10;
          const anpDecimals = newAnp < 0.95 ? 1 : 0;
          return UnsCduFormatters.StringSpaceJoinSeperated('VOR[s-text]', `${newAnp.toFixed(anpDecimals)}→`, 10);
        }
      },
    },
    onSelected: async () => {
      this.screen.navigateTo('/data/vor');
      return true;
    },
    maxInputCharacterCount: 0,
  }).bindWrappedData(MappedSubject.create(this.store.vorAnp, this.store.onGround));

  private readonly AdcSensorField = new UnsTextInputField<boolean, number>(this, {
    formatter: {
      parse: () => null,
      format: ([onGround]: WritableUnsFieldState<boolean>): string => {
        if (onGround == true) {
          return UnsCduFormatters.StringSpaceJoinSeperated('ADC[s-text][disabled]', '(D)[disabled]→', 10);
        } else {
          return UnsCduFormatters.StringSpaceJoinSeperated('ADC[s-text]', '→', 10);
        }
      },
    },
    onSelected: async () => {
      this.screen.navigateTo('/data/adc');
      return true;
    },
    maxInputCharacterCount: 0,
  }).bindWrappedData(this.store.onGround);

  /**
   * Data Page 3 [SENSOR POSITION DATA]
   */

  private readonly PositionFields = new DisplayField<readonly [LatLongInterface, LatLongInterface | null]>(this, {
    formatter: {
      /** @inheritDoc */
      format([fmsPos, sensorPos]): FmcRenderTemplate {
        const fmsLatString = UnsDataPage.LAT_FORMATTER(fmsPos.lat * 3_600);
        const fmsLongString = UnsDataPage.LON_FORMATTER(fmsPos.long * 3_600);
        const sensorLatString = UnsDataPage.LAT_FORMATTER(sensorPos ? sensorPos.lat * 3_600 : NaN);
        const sensorLongString = UnsDataPage.LON_FORMATTER(sensorPos ? sensorPos.long * 3_600 : NaN);

        return [
          [`${fmsLatString}[d-text]`, `${sensorLatString}[d-text]`],
          [`${fmsLongString}[d-text]`, `${sensorLongString}[d-text]`],
        ];
      },
    },
  }).bind(MappedSubject.create(this.store.fmsPosition, this.store.selectedSensorPos));

  private readonly SelectedSensorField = new DisplayField<string | null>(this, {
    formatter: {
      /** @inheritDoc */
      format(selectedSensor): string {
        return `${selectedSensor.toUpperCase()} POS[cyan]`;
      },
    },
  }).bind(this.store.selectedSensor);

  private SensorOptionFields: FmcRenderTemplate = [];

  /**
   * Creates the fields for the nav sensors
   */
  private createSensorOptions(): void {
    const navSensors = this.fmsConfig.sensors.navSensors;
    let currentSensorCount = 0;

    for (let i = 0; i < navSensors.waasSensorCount; i++) {
      currentSensorCount++;
      this.createSensorOption('waas', i + 1, currentSensorCount);
    }

    for (let i = 0; i < navSensors.irsSensorCount; i++) {
      currentSensorCount++;
      this.createSensorOption('irs', i + 1, currentSensorCount);
    }

    // If last row is empty, then remove it to avoid going over row limit
    if (this.SensorOptionFields[this.SensorOptionFields.length - 1].length == 1) {
      this.SensorOptionFields.pop();
    }
  }

  /**
   * Creates a single sensor option
   * @param sensorType Type of sensor
   * @param sensorIndex Sensor index
   * @param overallIndex The total index of this sensor
   */
  private createSensorOption(sensorType: 'waas' | 'irs', sensorIndex: number, overallIndex: number): void {
    let sensorSubject: ConsumerSubject<LatLongInterface>;

    switch (sensorType) {
      case 'waas': {
        const storeIndex = this.store.gpsPositions.push(ConsumerSubject.create(this.bus.getSubscriber<UnsPositionSystemEvents>().on(`uns_gps_position_${sensorIndex}`), new LatLong(0, 0)));
        sensorSubject = this.store.gpsPositions[storeIndex - 1];
        break;
      }
      case 'irs': {
        const storeIndex  = this.store.irsPositions.push(ConsumerSubject.create(this.bus.getSubscriber<UnsPositionSystemEvents>().on(`uns_irs_position_${sensorIndex}`), new LatLong(0, 0)));
        sensorSubject = this.store.irsPositions[storeIndex - 1];
        break;
      }
    }

    this.addBinding(sensorSubject);

    const sensorField = new UnsTextInputField<readonly [LatLongInterface, LatLongInterface, string | null], number>(this, {
      formatter: {
        parse: () => null,
        format: ([[fmsPos, sensorPos, selectedSensor]]: WritableUnsFieldState<readonly [LatLongInterface, LatLongInterface, string | null]>): string => {
          const isHighlighted = selectedSensor == `${sensorType}${sensorIndex}`;
          const latDiff = UnitType.DEGREE.convertTo(Math.abs(fmsPos.lat - sensorPos.lat), UnitType.ARC_MIN);
          const longDiff = UnitType.DEGREE.convertTo(Math.abs(fmsPos.long - sensorPos.long), UnitType.ARC_MIN);

          const sensorDifference = latDiff > longDiff ? latDiff : longDiff;
          const sensorDiffDecimals = sensorDifference < 10 ? 1 : 0;
          const mainSensorString = UnsCduFormatters.StringSpaceJoinSeperated(`${sensorType}${sensorIndex}${isHighlighted ? '[s-text]' : ''}`, sensorDifference.toFixed(sensorDiffDecimals), 9);
          if (overallIndex <= UnsDataPage.MAX_SENSORS_PER_COLUMN) {
            return `${isHighlighted ? ' ' : '←'}${mainSensorString}`;
          } else {
            return `${mainSensorString}${isHighlighted ? ' ' : '→'}`;
          }
        },
      },
      onSelected: async () => {
        if (this.store.selectedSensor.get() == `${sensorType}${sensorIndex}`) {
          this.store.selectedSensor.set('');
        } else {
          this.store.selectedSensor.set(`${sensorType}${sensorIndex}`);
        }
        return true;
      },
      maxInputCharacterCount: 0,
    }).bindWrappedData(MappedSubject.create(this.store.fmsPosition, sensorSubject, this.store.selectedSensor));

    if (overallIndex <= UnsDataPage.MAX_SENSORS_PER_COLUMN) {
      this.SensorOptionFields.push([sensorField, '']);
      this.SensorOptionFields.push(['']);
    } else {
      const rightSensorRowIndex = (overallIndex - UnsDataPage.MAX_SENSORS_PER_COLUMN - 1) * 2;
      this.SensorOptionFields[rightSensorRowIndex][1] = sensorField;
    }
  }

  private readonly SensorDifferenceField = new DisplayField<readonly [LatLongInterface, LatLongInterface | null]>(this, {
    formatter: {
      /** @inheritDoc */
      format([fmsPos, sensorPos]): FmcRenderTemplate {
        const latDiff = UnsDataPage.LAT_FORMATTER(sensorPos ? Math.abs(fmsPos.lat - sensorPos.lat) * 3_600 : NaN);
        const longDiff = UnsDataPage.LON_FORMATTER(sensorPos ? Math.abs(fmsPos.long - sensorPos.long) * 3_600 : NaN);

        return [
          [`  DIFF[cyan] ${latDiff}[s-text]`],
          [`       ${longDiff}[s-text]`],
        ];
      },
    },
  }).bind(MappedSubject.create(this.store.fmsPosition, this.store.selectedSensorPos));

  /**
   * Pipes the selected sensor position into the field
   */
  private handleSensorPosition(): void {
    this.store.selectedSensor.sub((selectedSensor) => {
      if (this.store.selectedSensorPipe) {
        this.store.selectedSensorPipe.destroy();
      }

      if (selectedSensor != '') {
        const sensorIndex = Number(selectedSensor.slice(-1)) - 1;
        if (selectedSensor.includes('irs')) {
          this.store.selectedSensorPipe = this.store.irsPositions[sensorIndex].pipe(this.store.selectedSensorPos);
        } else if (selectedSensor.includes('waas')) {
          this.store.selectedSensorPipe = this.store.gpsPositions[sensorIndex].pipe(this.store.selectedSensorPos);
        }

        if (this.store.selectedSensorPipe) {
          this.addBinding(this.store.selectedSensorPipe);
          this.store.selectedSensorPipe.resume();
        }
      } else {
        this.store.selectedSensorPos.set(null);
      }
    });
  }

  /**
   * Data Page 4 [RAW ATTITUDE, TIME DATA]
   */

  private readonly attitudeSource = `${this.fmsConfig.sensors.navSensors.attitudeSensor}${this.fmsConfig.index}`;

  private readonly HeadingData = new DisplayField<number | null>(this, {
    formatter: heading => `${heading?.toString().padStart(3, '0') || 'NUL'}${StringUtils.DEGREE}`,
  }).bind(this.store.headingData);

  private readonly PitchData = new DisplayField<number | null>(this, {
    formatter: pitch => `${pitch && pitch < 0 ? '+' : '-'}  ${Math.abs(pitch || 0)}`,
  }).bind(this.store.pitchData);

  private readonly RollData = new DisplayField<number>(this, {
    formatter: roll => `${Math.sign(roll) == -1 ? 'R' : 'L'}  ${Math.abs(roll)}`,
  }).bind(this.store.rollData);

  private readonly RollCmdData = new DisplayField<number>(this, {
    formatter: rollCmd => `${Math.sign(rollCmd) == -1 ? 'R' : 'L'}  ${Math.abs(rollCmd)}`,
  }).bind(this.store.rollCmdData);

  private readonly MagneticVariationData = new DisplayField<number>(this, {
    formatter: magVar => `${Math.sign(magVar) == -1 ? 'W' : 'E'}${Math.abs(magVar).toString().padStart(3, '0')}`,
  }).bind(this.store.magVarData);

  private readonly Date = new DisplayField<number>(this, {
    formatter: timestamp => UnsDataPage.DateFormatter(timestamp),
  }).bind(this.store.timestamp);

  private readonly Time = new DisplayField<number>(this, {
    formatter: timestamp => UnsDataPage.TimeFormatter(timestamp),
  }).bind(this.store.timestamp);

  /**
   * Data Page 5 [AP DEBUG]
   */

  private readonly ApDebugLink = PageLinkField.createLink(this, `${UnsChars.ArrowLeft}AUTOPILOT`, '/debug/ap');
  private readonly LnavDebugLink = PageLinkField.createLink(this, `LNAV${UnsChars.ArrowRight}`, '/debug/lnav');

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    return [
      [
        [this.TitleField],
        [''],
        [this.NavDataLink, '[disabled]CABIN DISP→'],
        [''],
        ['←PILOT DATA[disabled]', '[disabled]MFD DISP→'],
        [''],
        ['←PERF[disabled]', '[disabled]UNILINK→'],
        [''],
        ['←DISK[disabled]', 'MSTR XFILL [disabled s-text]'],
        [''],
        ['', this.MaintenanceLink],
      ],
      [
        [this.TitleField],
        ['', 'NAV MODE[s-text][cyan]'],
        [this.SensorQualityFields[0] || '', this.PositionModeField],
        ['', this.AnpData],
        [this.SensorQualityFields[1] || '', this.AdcSensorField],
        [''],
        [this.SensorQualityFields[2] || '', this.DmeAnpData],
        [''],
        [this.SensorQualityFields[3] || '', this.VorAnpData],
        [''],
        [this.SensorQualityFields[4] || '', ''],
      ],
      [
        [this.TitleField],
        ['FMS1 POS[cyan]', this.SelectedSensorField],
        [this.PositionFields],
        [''],
        [this.SensorDifferenceField],
        [''],
        ...this.SensorOptionFields
      ],
      [
        [this.TitleField],
        [`HDG([cyan] ${this.attitudeSource}[white] )[cyan]`, 'DATE[cyan]'],
        [this.HeadingData, this.Date],
        [`PIT([cyan] ${this.attitudeSource}}[white] )[cyan]`, 'UTC[cyan]'],
        [this.PitchData, this.Time],
        [`ROLL([cyan] ${this.attitudeSource}}[white] )[cyan]`, 'ROLL CMD[cyan]'],
        [this.RollData, this.RollCmdData],
        ['VARIATION[cyan]'],
        [this.MagneticVariationData],
        [''],
        [''],
      ],
      [
        ['', '', 'DEBUG DATA'],
        [''],
        [this.ApDebugLink, this.LnavDebugLink],
      ],
    ];
  }
}
