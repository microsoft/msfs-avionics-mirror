import {
  AirportFacility, ComputedSubject, DataInterface, DisplayField, FmcRenderTemplate, ICAO, MappedSubject, MutableSubscribable, OneWayRunway,
  PerformancePlanProxy, Subject, SwitchLabel, TextInputField, UnitType, Wait, WindEntry
} from '@microsoft/msfs-sdk';

import { VSpeedType, VSpeedUserSettings, WT21UnitsUtils } from '@microsoft/msfs-wt21-shared';

import {
  FieldLengthData, FieldLengthFormatter, NumberAndUnitFormat, PerfQnhFormat, RawFormatter, RunwayIdentFormat,
  RwySlopeFormat, SimpleStringFormat, TemperatureFormat, VSpeedFormat, WindFormat, WT21FmcPage, WT21Fms,
} from '@microsoft/msfs-wt21-fmc';

import { ApproachPerformanceManager } from '../../Shared/Performance/PerformanceCalculators';
import { CJ4PerformancePlan } from '../../Shared/Performance/CJ4PerformancePlan';

/**
 * Props for {@link CJ4ApproachRefPage}
 */
export interface CJ4ApproachRefPageProps {
  /** The FMS */
  fms: WT21Fms,

  /** the CJ4 performance plan proxy */
  performancePlanProxy: PerformancePlanProxy<CJ4PerformancePlan>,

  /** the approach performance manager */
  approachPerformanceManager: ApproachPerformanceManager,
}

/**
 * Approach Ref page 1
 */
export class CJ4ApproachRefPage extends WT21FmcPage<CJ4ApproachRefPageProps> {

  private readonly vspeedSettings = new VSpeedUserSettings(this.bus);
  private readonly DestinationAirportSubject = Subject.create<AirportFacility | null>(null);
  private readonly OriginAirportSubject = Subject.create<AirportFacility | null>(null);

  private readonly Airport = MappedSubject.create(
    ([origin, destination]) => [origin, destination] as const,
    this.props.performancePlanProxy.takeoffAirportIcao,
    this.props.performancePlanProxy.approachAirportIcao,
  );

  private readonly DestinationIcaoSubject = Subject.create<string | null>(null);

  private readonly DestinationIcaoLabel = new DisplayField<string | null>(this, {
    formatter: RawFormatter,
  }).bind(this.DestinationIcaoSubject);

  private readonly ModifiableQnhData = new DataInterface(
    MappedSubject.create(this.props.performancePlanProxy.approachAutoQnh, this.props.performancePlanProxy.approachManualQnh).map(([auto, manual]) => {
      if (manual !== null) {
        return manual;
      }

      return auto;
    }),
    (value) => this.props.performancePlanProxy.approachManualQnh.set(value),
  );

  private readonly FieldLength = MappedSubject.create(
    ([landingLength, runway]) => {
      const runwayLengthFeet = runway ? UnitType.FOOT.convertFrom(runway.length, UnitType.METER) : null;


      return ({ fieldLength: landingLength, runwayLength: runwayLengthFeet });
    },
    this.props.approachPerformanceManager.landingDistance,
    this.props.performancePlanProxy.approachRunway,
  );

  private readonly RwyWind = MappedSubject.create(([runway, wind]) => {
    if (runway && wind) {
      const magVar = Facilities.getMagVar(runway.latitude, runway.longitude);

      const headwind = Math.trunc(wind.speed * (Math.cos(((runway.course - magVar) * Math.PI / 180) - (wind.direction * Math.PI / 180))));
      const crosswind = Math.trunc(wind.speed * (Math.sin(((runway.course - magVar) * Math.PI / 180) - (wind.direction * Math.PI / 180))));

      return `${(headwind > 0 ? 'H' : 'T')}${Math.abs(Math.round(headwind))} ${(headwind > 0 ? 'L' : 'R')}${Math.abs(Math.round(crosswind))}`;
    }

    return '--- ---';
  }, this.props.performancePlanProxy.approachRunway, this.props.performancePlanProxy.approachWind);

  private readonly isSendSpeedsInProgress = ComputedSubject.create<boolean | null, string>(null, (v: boolean | null) => {
    return v === null ? '' : (v ? 'IN PROGRESS' : 'COMPLETE');
  });

  // 1/3

  private readonly SelectedAirportField = new DisplayField<readonly [string | null, string | null]>(this, {
    formatter: {
      nullValueString: '----/----',

      /** @inheritDoc */
      format([origin, destination]): string {
        const originString = origin === null ? '----[s-text]' : (`${ICAO.getIdent(origin)}[s-text]`);
        const destString = destination === null ? '----[s-text]' : (`${ICAO.getIdent(destination)}[green]`);
        return `${originString}/[d-text]${destString}`;
      },
    },
  }).bind(this.Airport);

  private readonly RwyWindField = new DisplayField(this, {
    formatter: RawFormatter,
  }).bind(this.RwyWind);

  private readonly WindField = new TextInputField<WindEntry | null>(this, {
    formatter: new WindFormat(),
  }).bind(this.props.performancePlanProxy.approachWind);

  private readonly RwyIdentField = new DisplayField<OneWayRunway | null>(this, {
    formatter: new RunwayIdentFormat(),
  }).bind(this.props.performancePlanProxy.approachRunway);

  private readonly OatField = new TextInputField<number | null>(this, {
    formatter: new TemperatureFormat(),
  }).bind(this.props.performancePlanProxy.approachOat);

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
  }).bind(this.props.performancePlanProxy.approachRunway);

  private readonly QnhField = new TextInputField<number | null>(this, {
    formatter: new PerfQnhFormat(this.props.performancePlanProxy.approachManualQnh),
  }).bindSource(this.ModifiableQnhData);

  private readonly RwySlopeField = new TextInputField<number | null>(this, {
    formatter: new RwySlopeFormat(),
  }).bind(this.props.performancePlanProxy.approachRunwaySlope);

  private readonly PAltField = new DisplayField<number | null>(this, {
    formatter: new NumberAndUnitFormat('FT', { precision: 0 }),
  }).bind(this.props.approachPerformanceManager.pressureAltitude);

  private readonly RwyCondField = new SwitchLabel(this, {
    optionStrings: ['DRY', 'WET'],
  }).bind(this.props.performancePlanProxy.approachRunwayCondition as MutableSubscribable<number>); // FIXME wt21 remove this cast (rework perf plan)

  // 2/3

  private readonly AntiIceField = new SwitchLabel(this, {
    optionStrings: ['OFF', 'ON'],
  }).bind(this.props.performancePlanProxy.approachAntiIceOn as MutableSubscribable<number>); // FIXME wt21 remove this cast (rework perf plan)

  private readonly LdgFactorField = new SwitchLabel(this, {
    optionStrings: ['1.00', '1.25', '1.67', '1.92'],
  }).bind(this.props.performancePlanProxy.approachLandingFactor as MutableSubscribable<number>); // FIXME wt21 remove this cast (rework perf plan)

  private readonly VRefField = new DisplayField<number | null>(this, {
    formatter: new VSpeedFormat('REF'),
  }).bind(this.props.approachPerformanceManager.vRef);

  private readonly VAppField = new DisplayField<number | null>(this, {
    formatter: new VSpeedFormat('APP'),
  }).bind(this.props.approachPerformanceManager.vApp);

  // TODO gw !== lw, actual mlw
  private readonly LwGwtMlwField = new TextInputField<readonly [number | null, number | null], number>(this, {
    formatter: {
      nullValueString: '-----/-----/-----',

      /** @inheritDoc */
      format: ([lw, gw]: readonly [number | null, number | null]): string => {
        let mlow = 15_660;
        if (WT21UnitsUtils.getIsMetric()) {
          if (lw) {
            lw = UnitType.POUND.convertTo(lw, UnitType.KILOGRAM);
          }
          if (gw) {
            gw = UnitType.POUND.convertTo(gw, UnitType.KILOGRAM);
          }
          mlow = UnitType.POUND.convertTo(mlow, UnitType.KILOGRAM);
        }

        const isManuallyEntered = !!this.props.performancePlanProxy.manualLw.get();

        const lwStr = lw ? Math.round(lw) : '-----';
        const gwStr = gw ? Math.round(gw) : '-----';
        const mlowStr = Math.round(mlow).toString().padStart(5, ' ');

        return `${lwStr}${isManuallyEntered ? '[d-text]' : '[s-text]'}/${gwStr}/${mlowStr}`;
      },

      /** @inheritDoc */
      parse(input: string): number | null {
        const lw = parseInt(input);

        return Number.isFinite(lw) ? lw : null;
      },
    },
    style: '[s-text]',
  }).bindSource(new DataInterface<readonly [(number | null), (number | null)], any>(
    MappedSubject.create(this.props.approachPerformanceManager.landingWeight, this.fms.basePerformanceManager.gw),
    (value) => this.props.performancePlanProxy.manualLw.set(value),
  ));

  private readonly FieldLengthLabel = new DisplayField<OneWayRunway | null>(this, {
    formatter: {
      nullValueString: 'LFL/      [blue]',

      /** @inheritDoc */
      format(value: OneWayRunway): string {
        return `LFL/ RW${value.designation.substring(0, 5)}[blue]`;
      },
    },
  }).bind(this.props.performancePlanProxy.approachRunway);

  private readonly FieldLengthField = new DisplayField<FieldLengthData | null>(this, {
    formatter: new FieldLengthFormatter(),
  }).bind(this.FieldLength);

  private readonly sendSpeedsField = new DisplayField<string>(this, {
    formatter: new SimpleStringFormat('SEND>'),
    onSelected: (): Promise<string | boolean> => this.sendVSpeeds(),
  });
  private readonly sendSpeedsStatusField = new DisplayField<string>(this, {
    formatter: RawFormatter,
  }).bind(this.isSendSpeedsInProgress);

  // 3/3

  // TODO actual mlw
  private readonly LwMlwField = new DisplayField<number | null>(this, {
    formatter: {
      nullValueString: '-----/-----',

      /** @inheritDoc */
      format(value: number): string {
        let mlw = 15_660;
        if (WT21UnitsUtils.getIsMetric()) {
          value = UnitType.POUND.convertTo(value, UnitType.KILOGRAM);
          mlw = UnitType.POUND.convertTo(mlw, UnitType.KILOGRAM);
        }

        const lwStr = Math.round(value).toString().padStart(5, ' ');
        const mlwStr = Math.round(mlw).toString().padStart(5, ' ');

        return `${lwStr}/${mlwStr}`;
      },
    },
  }).bind(this.fms.basePerformanceManager.gw);

  /** @inheritDoc */
  protected onInit(): void {
    this.bindVSpeedManualSetting(VSpeedType.Vapp, this.VAppField);
    this.bindVSpeedManualSetting(VSpeedType.Vref, this.VRefField);
  }

  /** @inheritDoc */
  protected onResume(): void {
    this.props.approachPerformanceManager.updatePredictedLandingWeight();

    // We load the currently selected destination runway
    // TODO allow selecting custom runway
    if (this.fms.hasPrimaryFlightPlan()) {
      const originFacility = this.fms.facilityInfo.originFacility;
      const destFacility = this.fms.facilityInfo.destinationFacility;
      const plan = this.fms.getPlanForFmcRender();

      if (plan.originAirport) {
        if (originFacility) {
          this.OriginAirportSubject.set(originFacility);
        } else {
          this.OriginAirportSubject.set(null);
        }
      }

      if (plan.destinationAirport) {
        if (destFacility) {
          this.DestinationAirportSubject.set(destFacility);
        } else {
          this.DestinationAirportSubject.set(null);
        }
        this.DestinationIcaoSubject.set(ICAO.getIdent(plan.destinationAirport));
      }
    }
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
    if (!this.isSendSpeedsInProgress.getRaw() && this.props.approachPerformanceManager.isAllSpeedsValid()) {
      this.isSendSpeedsInProgress.set(true);
      await Wait.awaitDelay(500);
      const vapp = this.props.approachPerformanceManager.vApp.get() as number;
      this.setVSpeedSetting(VSpeedType.Vapp, vapp);
      await Wait.awaitDelay(500);
      this.VAppField.getOptions().style = '[blue]';
      this.invalidate();
      const vref = this.props.approachPerformanceManager.vRef.get() as number;
      this.setVSpeedSetting(VSpeedType.Vref, vref);
      await Wait.awaitDelay(500);
      this.VRefField.getOptions().style = '[blue]';
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
        [this.DestinationIcaoLabel, '1/3[blue]', 'APPROACH REF[blue]'],
        [' SEL APT[blue]', 'WIND [blue]'],
        [this.SelectedAirportField, this.WindField],
        [' RWY ID[blue]', 'OAT [blue]'],
        [this.RwyIdentField, this.OatField],
        [' RWY WIND[blue]', 'QNH [blue]'],
        [this.RwyWindField, this.QnhField],
        [' RWY LENGTH[blue]', 'P ALT [blue]'],
        [this.RwyLengthField, this.PAltField],
        [' RWY SLOPE[blue]', ''],
        [this.RwySlopeField, ''],
        [' RWY COND[blue]', ''],
        [this.RwyCondField, ''],
      ],
      [
        [this.DestinationIcaoLabel, '2/3[blue]', 'APPROACH REF[blue]'],
        [' A/I[blue]', ''],
        [this.AntiIceField, ''],
        ['', this.VRefField],
        ['', ''],
        [' LW / GWT/MLW[blue]', this.VAppField],
        [this.LwGwtMlwField, ''],
        [this.FieldLengthLabel, ''],
        [this.FieldLengthField, ''],
        [' LDG FACTOR[blue]', ''],
        [this.LdgFactorField, ''],
        ['', this.sendSpeedsStatusField],
        ['', this.sendSpeedsField],
      ],
      [
        [this.DestinationIcaoLabel, '3/3[blue]', 'APPROACH REF[blue]'],
        [' LW /MLW[blue]', ''],
        [this.LwMlwField, ''],
        ['', 'STRUCTURAL LIMIT [blue]'],
        ['', `${WT21UnitsUtils.getIsMetric() ? UnitType.POUND.convertTo(15660, UnitType.KILOGRAM).toFixed(0).padStart(5, ' ') : '15660'}`],
        ['', 'PERFORMANCE LIMIT [blue]'],
        ['', `${WT21UnitsUtils.getIsMetric() ? UnitType.POUND.convertTo(15660, UnitType.KILOGRAM).toFixed(0).padStart(5, ' ') : '15660'}`],
        ['', 'RUNWAY LENGTH LIMIT [blue]'], // TODO figure out where this is from
        ['', `${WT21UnitsUtils.getIsMetric() ? UnitType.POUND.convertTo(17110, UnitType.KILOGRAM).toFixed(0).padStart(5, ' ') : '17110'}`],
      ],
    ];
  }

}
