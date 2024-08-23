import {
  ComputedSubject, DataInterface, DisplayField, FmcRenderTemplate, MappedSubject, MutableSubscribable, OneWayRunway, PerformancePlanProxy,
  RawFormatter, Subject, SwitchLabel, TextInputField, UnitType, Wait, WindEntry
} from '@microsoft/msfs-sdk';

import { VSpeedType, VSpeedUserSettings, WT21UnitsUtils } from '@microsoft/msfs-wt21-shared';

import {
  FieldLengthData, FieldLengthFormatter, NumberAndUnitFormat, PerfQnhFormat, RwySlopeFormat, TemperatureFormat,
  VSpeedFormat, WindFormat, WT21FmcPage, WT21Fms,
} from '@microsoft/msfs-wt21-fmc';

import { CJ4PerformancePlan } from '../../Shared/Performance/CJ4PerformancePlan';
import { TakeoffPerformanceManager } from '../../Shared/Performance/PerformanceCalculators';

/**
 * Props for {@link CJ4TakeoffRefPage}
 */
export interface CJ4TakeoffRefPageProps {
  /** The FMS */
  fms: WT21Fms,

  /** the CJ4 performance plan proxy */
  cj4PerformancePlanProxy: PerformancePlanProxy<CJ4PerformancePlan>,

  /** The takeoff performance manager */
  takeoffPerformanceManager: TakeoffPerformanceManager,
}

/**
 * Takeoff Ref page 1
 */
export class CJ4TakeoffRefPage extends WT21FmcPage<CJ4TakeoffRefPageProps> {

  private readonly vspeedSettings = new VSpeedUserSettings(this.bus);
  private readonly OriginIcao = Subject.create<string | null>(null);

  private readonly TowData = new DataInterface(
    this.props.takeoffPerformanceManager.tow,
    (value) => this.props.cj4PerformancePlanProxy.manualTow.set(value),
  );

  // FIXME this is boilerplate!
  private readonly TowGwtMtowData = new DataInterface<readonly [number, number] | null, number>(MappedSubject.create(([tow, gw]) => {
    if (tow && gw) {
      return [tow, gw];
    } else {
      return null;
    }
  }, this.props.takeoffPerformanceManager.tow, this.fms.basePerformanceManager.gw),
    (value) => this.props.cj4PerformancePlanProxy.manualTow.set(value)
  );

  // Data

  private readonly OriginIcaoLabel = new DisplayField<string | null>(this, {
    formatter: RawFormatter,
  });

  private readonly OriginIcaoTakeoffLengthLabel = new DisplayField<string | null>(this, {
    formatter: {
      nullValueString: ' TOFL/      [blue]',

      /** @inheritDoc */
      format(value: string | null): string {
        return ` TOFL/ ${value?.substring(0, 6)}[blue]`;
      },
    },
  });

  // 1/3

  private readonly RwyIdent = this.props.cj4PerformancePlanProxy.takeoffRunway.map((it) => it ? `RW${it.designation}` : null);

  private readonly RwyWind = MappedSubject.create(([runway, wind]) => {
    if (runway && wind) {
      const magVar = Facilities.getMagVar(runway.latitude, runway.longitude);

      const headwind = Math.trunc(wind.speed * (Math.cos(((runway.course - magVar) * Math.PI / 180) - (wind.direction * Math.PI / 180))));
      const crosswind = Math.trunc(wind.speed * (Math.sin(((runway.course - magVar) * Math.PI / 180) - (wind.direction * Math.PI / 180))));

      return `${(headwind > 0 ? 'H' : 'T')}${Math.abs(Math.round(headwind))} ${(crosswind > 0 ? 'L' : 'R')}${Math.abs(Math.round(crosswind))}`;
    }

    return '--- ---';
  }, this.props.cj4PerformancePlanProxy.takeoffRunway, this.props.cj4PerformancePlanProxy.takeoffWind);

  private readonly ModifiableQnhData = new DataInterface(
    MappedSubject.create(this.props.cj4PerformancePlanProxy.takeoffAutoQnh, this.props.cj4PerformancePlanProxy.takeoffManualQnh).map(([auto, manual]) => {
      if (manual !== null) {
        return manual;
      }

      return auto;
    }),
    (value) => this.props.cj4PerformancePlanProxy.takeoffManualQnh.set(value),
  );

  // 2/3

  private readonly TakeoffLength = MappedSubject.create(
    ([takeoffLength, runway]) => {
      const runwayLengthFeet = runway ? UnitType.FOOT.convertFrom(runway.length, UnitType.METER) : null;

      return { fieldLength: takeoffLength, runwayLength: runwayLengthFeet };
    },
    this.props.takeoffPerformanceManager.takeoffLength,
    this.props.cj4PerformancePlanProxy.takeoffRunway,
  );

  // Fields
  // 1/3

  private readonly RwyWindField = new DisplayField(this, {
    formatter: RawFormatter,
  }).bind(this.RwyWind);

  private readonly OatField = new TextInputField<number | null>(this, {
    formatter: new TemperatureFormat(),
  }).bind(this.props.cj4PerformancePlanProxy.takeoffOat);

  private readonly RwyIdentField = new DisplayField<OneWayRunway | null>(this, {
    formatter: {
      nullValueString: '',

      /** @inheritDoc */
      format(value: OneWayRunway): string {
        return `RW${value.designation}`;
      },
    },
  }).bind(this.props.cj4PerformancePlanProxy.takeoffRunway);

  private readonly WindField = new TextInputField<WindEntry | null>(this, {
    formatter: new WindFormat(),
  }).bind(this.props.cj4PerformancePlanProxy.takeoffWind);

  private readonly RwyLengthField = new DisplayField<OneWayRunway | null>(this, {
    formatter: {
      nullValueString: `---- ${WT21UnitsUtils.getUnitString(WT21UnitsUtils.getIsMetric() ? UnitType.METER : UnitType.FOOT)}`,

      /** @inheritDoc */
      format(value: OneWayRunway): string {
        const isMetric = WT21UnitsUtils.getIsMetric();
        const length = isMetric ? value.length : UnitType.FOOT.convertFrom(value.length, UnitType.METER);
        const unitStr = WT21UnitsUtils.getUnitString(isMetric ? UnitType.METER : UnitType.FOOT);

        return `${length.toFixed(0)} ${unitStr}`;
      },
    },
  }).bind(this.props.cj4PerformancePlanProxy.takeoffRunway);

  private readonly RwySlopeField = new TextInputField<number | null>(this, {
    formatter: new RwySlopeFormat(),
  }).bind(this.props.cj4PerformancePlanProxy.takeoffRunwaySlope);

  // TODO maybe extract this somewhere
  private readonly QnhField = new TextInputField<number | null>(this, {
    formatter: new PerfQnhFormat(this.props.cj4PerformancePlanProxy.takeoffManualQnh),
  }).bindSource(this.ModifiableQnhData);

  private readonly PAltField = new DisplayField<number | null>(this, {
    formatter: new NumberAndUnitFormat('FT', { padStart: 4 }),
  }).bind(this.props.takeoffPerformanceManager.pressureAltitude);

  private readonly RwyCondField = new SwitchLabel(this, {
    optionStrings: ['DRY', 'WET'],
  }).bind(this.props.cj4PerformancePlanProxy.takeoffRunwayCondition as MutableSubscribable<number>); // FIXME wt21 remove this cast (rework perf plan)

  // 2/3

  private readonly AntiIceField = new SwitchLabel(this, {
    optionStrings: ['OFF', 'ON'],
  }).bind(this.props.cj4PerformancePlanProxy.takeoffAntiIceOn as MutableSubscribable<number>); // FIXME wt21 remove this cast (rework perf plan)

  private readonly TakeoffFlapsField = new SwitchLabel(this, {
    optionStrings: ['0', '15'],
  }).bind(this.props.cj4PerformancePlanProxy.takeoffFlaps as MutableSubscribable<number>); // FIXME wt21 remove this cast (rework perf plan)

  private readonly TowGwtMtowField = new TextInputField<readonly [tow: number, gw: number] | null, number>(this, {
    formatter: {
      nullValueString: '-----/-----/-----',

      /** @inheritDoc */
      parse: (input: string): number | null => {
        const int = parseInt(input);

        if (Number.isNaN(int)) {
          return null;
        }

        if (int < (this.fms.basePerformanceManager.basicOperatingWeight.get() ?? 100)) {
          return null;
        }

        return int;
      },

      /** @inheritDoc */
      format: ([tow, gw]: readonly [number, number]): string => {
        let mtow = 17_110;
        if (WT21UnitsUtils.getIsMetric() === true) {
          tow = UnitType.POUND.convertTo(tow, UnitType.KILOGRAM);
          gw = UnitType.POUND.convertTo(gw, UnitType.KILOGRAM);
          mtow = UnitType.POUND.convertTo(mtow, UnitType.KILOGRAM);
        }

        const towString = Math.round(tow).toString().padStart(5, ' ');
        const gwtString = Math.round(gw).toString().padStart(5, ' ');
        const mtowString = Math.round(mtow).toString().padStart(5, ' ');

        const manuallyEnteredTow = this.props.cj4PerformancePlanProxy.manualTow.get() !== null;

        return `${towString}[${tow > mtow ? 'yellow' : 'white'} ${manuallyEnteredTow ? 'd-text' : 's-text'}]/${gwtString}/${mtowString}[s-text]`;
      },
    },
  });

  private readonly V1Field = new DisplayField<number | null>(this, {
    formatter: new VSpeedFormat('1'),
  });

  private readonly VRField = new DisplayField<number | null>(this, {
    formatter: new VSpeedFormat('R'),
  });

  private readonly V2Field = new DisplayField<number | null>(this, {
    formatter: new VSpeedFormat('2'),
  });

  private readonly VTField = new DisplayField<number | null>(this, {
    formatter: new VSpeedFormat('T'),
  });

  private readonly TakeoffLengthField = new DisplayField<FieldLengthData | null>(this, {
    formatter: new FieldLengthFormatter(),
  });

  private readonly sendSpeedsField = new DisplayField<string>(this, {
    formatter: () => 'SEND>',
    onSelected: (): Promise<boolean> => this.sendVSpeeds(),
  });

  private readonly sendSpeedsStatusField = new DisplayField<string>(this, {
    formatter: RawFormatter,
  });

  private readonly isSendSpeedsInProgress = ComputedSubject.create<boolean | null, string>(null, (v: boolean | null) => {
    return v === null ? '' : (v ? 'IN PROGRESS' : 'COMPLETE');
  });

  // 3/3

  private readonly TowMtowField = new TextInputField<number | null>(this, {
    formatter: {
      nullValueString: '-----/-----',

      /** @inheritDoc */
      parse: (input: string): number | null => {
        const int = parseInt(input);

        if (Number.isNaN(int)) {
          return null;
        }

        if (int < (this.fms.basePerformanceManager.basicOperatingWeight.get() ?? 100)) {
          return null;
        }

        return int;
      },

      /** @inheritDoc */
      format: (value: number): string => {
        let mtow = 17_110;
        if (WT21UnitsUtils.getIsMetric() === true) {
          value = UnitType.POUND.convertTo(value, UnitType.KILOGRAM);
          mtow = UnitType.POUND.convertTo(mtow, UnitType.KILOGRAM);
        }

        const towString = Math.round(value).toString().padStart(5, ' ');
        const mtowString = Math.round(mtow).toString().padStart(5, ' ');

        const manuallyEnteredTow = this.props.cj4PerformancePlanProxy.manualTow.get() !== null;

        return `${towString}[${value > mtow ? 'yellow' : 'white'} ${manuallyEnteredTow ? 'd-text' : 's-text'}]/${mtowString}[s-text]`;
      },
    },
  });

  /** @inheritDoc */
  protected onInit(): void {
    this.OriginIcaoLabel.bind(this.OriginIcao);
    this.OriginIcaoTakeoffLengthLabel.bind(this.RwyIdent);

    // 2/3

    this.V1Field.bind(this.props.takeoffPerformanceManager.v1Speed);
    this.VRField.bind(this.props.takeoffPerformanceManager.vrSpeed);
    this.V2Field.bind(this.props.takeoffPerformanceManager.v2Speed);
    this.VTField.bind(this.props.takeoffPerformanceManager.v2Speed.map((it) => it ? 140 : null));

    this.bindVSpeedManualSetting(VSpeedType.V1, this.V1Field);
    this.bindVSpeedManualSetting(VSpeedType.Vr, this.VRField);
    this.bindVSpeedManualSetting(VSpeedType.V2, this.V2Field);
    this.bindVSpeedManualSetting(VSpeedType.Venr, this.VTField);
    this.TowGwtMtowField.bindSource(this.TowGwtMtowData);
    this.TakeoffLengthField.bind(this.TakeoffLength);
    this.sendSpeedsStatusField.bind(this.isSendSpeedsInProgress);

    // 3/3
    this.TowMtowField.bindSource(this.TowData);
  }

  /**
   * Binds the vspeed fields to the 'manual' setting to adjust the style when changed.
   * @param type The VSpeed type to check.
   * @param field The DisplayField to adjust.
   */
  private bindVSpeedManualSetting(type: VSpeedType, field: DisplayField<number | null>): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.addBinding(this.vspeedSettings.getSettings(type).manual.sub((v) => {
      if (v) {
        field.getOptions().style = '[white]';
        this.invalidate();
      }
    }));
  }

  /**
   * Sends the calculated VSpeeds to the PFD.
   * @returns true if event was handled, false otherwise
   */
  private async sendVSpeeds(): Promise<boolean> {
    if (!this.isSendSpeedsInProgress.getRaw() && this.props.takeoffPerformanceManager.isAllSpeedsValid()) {
      this.isSendSpeedsInProgress.set(true);
      await Wait.awaitDelay(500);
      const v1 = this.props.takeoffPerformanceManager.v1Speed.get() as number;
      this.setVSpeedSetting(VSpeedType.V1, v1);
      await Wait.awaitDelay(500);
      this.V1Field.getOptions().style = '[blue]';
      this.invalidate();
      const vr = this.props.takeoffPerformanceManager.vrSpeed.get() as number;
      this.setVSpeedSetting(VSpeedType.Vr, vr);
      await Wait.awaitDelay(500);
      this.VRField.getOptions().style = '[blue]';
      this.invalidate();
      const v2 = this.props.takeoffPerformanceManager.v2Speed.get() as number;
      this.setVSpeedSetting(VSpeedType.V2, v2);
      await Wait.awaitDelay(500);
      this.V2Field.getOptions().style = '[blue]';
      this.invalidate();
      this.setVSpeedSetting(VSpeedType.Venr, 140);
      await Wait.awaitDelay(500);
      this.VTField.getOptions().style = '[blue]';
      this.invalidate();
      this.isSendSpeedsInProgress.set(false);
      return true;
    }
    return false;
  }

  /**
   * Sets the VSpeed settings for the given type.
   * @param type The type of VSpeed to set.
   * @param value The value to set.
   */
  private setVSpeedSetting(type: VSpeedType, value: number): void {
    const setting = this.vspeedSettings.getSettings(type);
    setting.value.set(Math.trunc(value));
    setting.manual.set(false);
    setting.show.set(true);
  }

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        [this.OriginIcaoLabel, '1/3[blue]', 'TAKEOFF REF[blue]'],
        [' RWY ID[blue]', 'WIND [blue]'],
        [this.RwyIdentField, this.WindField],
        [' RWY WIND[blue]', 'OAT [blue]'],
        [this.RwyWindField, this.OatField],
        [' RWY LENGTH[blue]', 'QNH [blue]'],
        [this.RwyLengthField, this.QnhField],
        [' RWY SLOPE[blue]', 'P ALT [blue]'],
        [this.RwySlopeField, this.PAltField],
        [' RWY COND[blue]', ''],
        [this.RwyCondField, ''],
      ],
      [
        [this.OriginIcaoLabel, '2/3[blue]', 'TAKEOFF REF[blue]'],
        [' A/I[blue]', this.V1Field],
        [this.AntiIceField, ''],
        [' T/O FLAPS[blue]', this.VRField],
        [this.TakeoffFlapsField, ''],
        [' TOW/ GWT/MTOW[blue]', this.V2Field],
        [this.TowGwtMtowField, ''],
        [this.OriginIcaoTakeoffLengthLabel, this.VTField],
        [this.TakeoffLengthField, ''],
        ['', ''],
        ['', ''],
        ['', this.sendSpeedsStatusField],
        ['', this.sendSpeedsField],
      ],
      [
        [this.OriginIcaoLabel, '3/3[blue]', 'TAKEOFF REF[blue]'],
        [' TOW/MTOW[blue]', ''],
        [this.TowMtowField, ''],
        ['', 'STRUCTURAL LIMIT [blue]'],
        ['', `${WT21UnitsUtils.getIsMetric() ? UnitType.POUND.convertTo(17110, UnitType.KILOGRAM).toFixed(0).padStart(5, ' ') : '17110'}`],
        ['', 'PERFORMANCE LIMIT [blue]'],
        ['', `${WT21UnitsUtils.getIsMetric() ? UnitType.POUND.convertTo(17110, UnitType.KILOGRAM).toFixed(0).padStart(5, ' ') : '17110'}`],
        ['', 'RUNWAY LENGTH LIMIT [blue]'],
        ['', `${WT21UnitsUtils.getIsMetric() ? UnitType.POUND.convertTo(17110, UnitType.KILOGRAM).toFixed(0).padStart(5, ' ') : '17110'}`],
      ],
    ];
  }

}
