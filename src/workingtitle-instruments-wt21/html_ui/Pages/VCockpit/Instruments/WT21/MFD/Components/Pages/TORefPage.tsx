import { FSComponent, ICAO, MappedSubject, Subject, UnitType, VNode } from '@microsoft/msfs-sdk';
import { PerformancePlanData } from '../../../Shared/Performance/PerformancePlanData';
import { WT21MfdApprPerfOutputs, WT21MfdTextPageEvents, WT21MfdToPerfOutputs } from '../../../Shared/WT21MfdTextPageEvents';
import { WT21UnitsUtils } from '../../../Shared/WT21UnitsUtils';
import { MfdTextPageComponent, MfdTextPageProps } from './MfdTextPageComponent';

import './PerfRefPage.css';

/**
 * Props for {@link TORefPage}
 */
export interface TORefPageProps extends MfdTextPageProps {
  /**
   * A performance plan
   */
  performancePlan: PerformancePlanData,
}

/**
 * The Takeoff Ref Page component.
 */
export class TORefPage extends MfdTextPageComponent<TORefPageProps> {
  private approachRefHiddenElementRefs = [
    FSComponent.createRef<HTMLElement>(),
    FSComponent.createRef<HTMLElement>(),
  ];

  private readonly plan = this.props.performancePlan;

  private readonly isShowingApproachDataSub = Subject.create(false);

  private takeoffPerfOutputsSub = Subject.create<WT21MfdToPerfOutputs | null>(null);

  private approachPerfOutputsSub = Subject.create<WT21MfdApprPerfOutputs | null>(null);

  private readonly dataOriginAirportIcaoSub = MappedSubject.create(([showingApproachData, takeoffAirportIcao, approachAirportIcao]) => {
    return showingApproachData ? approachAirportIcao : takeoffAirportIcao;
  }, this.isShowingApproachDataSub, this.plan.takeoffAirportIcao, this.plan.approachAirportIcao);

  private readonly dataRunwaySub = MappedSubject.create(([showingApproachData, takeoffRunway, approachRunway]) => {
    return showingApproachData ? approachRunway : takeoffRunway;
  }, this.isShowingApproachDataSub, this.plan.takeoffRunway, this.plan.approachRunway);

  private readonly dataWindSub = MappedSubject.create(([showingApproachData, takeoffWind, approachWind]) => {
    return showingApproachData ? approachWind : takeoffWind;
  }, this.isShowingApproachDataSub, this.plan.takeoffWind, this.plan.approachWind);

  private readonly dataRunwaySlopeSub = MappedSubject.create(([showingApproachData, approachRunwaySlope, takeoffRunwaySlope]) => {
    return showingApproachData ? takeoffRunwaySlope : approachRunwaySlope;
  }, this.isShowingApproachDataSub, this.plan.takeoffRunwaySlope, this.plan.approachRunwaySlope);

  private readonly dataRunwayConditionSub = MappedSubject.create(([showingApproachData, approachRunwayCondition, takeoffRunwayCondition]) => {
    return showingApproachData ? takeoffRunwayCondition : approachRunwayCondition;
  }, this.isShowingApproachDataSub, this.plan.takeoffRunwayCondition, this.plan.approachRunwayCondition);

  private readonly dataOatSub = MappedSubject.create(([showingApproachData, takeoffOat, approachOat]) => {
    return showingApproachData ? approachOat : takeoffOat;
  }, this.isShowingApproachDataSub, this.plan.takeoffOat, this.plan.approachOat);

  private readonly dataQnhSub = MappedSubject.create(([showingApproachData, takeoffAutoQnh, takeoffManualQnh, approachAutoQnh, approachManualQnh]) => {
    return showingApproachData ? (approachManualQnh ?? approachAutoQnh) : (takeoffManualQnh ?? takeoffAutoQnh);
  }, this.isShowingApproachDataSub, this.plan.takeoffAutoQnh, this.plan.takeoffManualQnh, this.plan.approachAutoQnh, this.plan.approachManualQnh);

  private readonly dataAntiIceSub = MappedSubject.create(([showingApproachData, takeoffAntiIceOn, approachAntiIceOn]) => {
    return showingApproachData ? approachAntiIceOn : takeoffAntiIceOn;
  }, this.isShowingApproachDataSub, this.plan.takeoffAntiIceOn, this.plan.approachAntiIceOn);

  private readonly dataToflSub = MappedSubject.create(([showingApproachData, takeoffOutputs, apprOutputs]) => {
    return (showingApproachData ? apprOutputs?.calculations?.landingFieldLength : takeoffOutputs?.calculations?.takeoffLength) ?? null;
  }, this.isShowingApproachDataSub, this.takeoffPerfOutputsSub, this.approachPerfOutputsSub);

  private readonly titleTextSub = this.isShowingApproachDataSub.map((it) => `${it ? 'APPROACH' : 'TAKEOFF'} REFERENCE`);

  private readonly pageTextSub = this.isShowingApproachDataSub.map((it) => `${it ? '2' : '1'}/2`);

  private readonly airportIdentTextSub = MappedSubject.create(([icao]) => {
    if (icao && icao !== ICAO.emptyIcao) {
      return ICAO.getIdent(icao);
    }

    return '----';
  }, this.dataOriginAirportIcaoSub);

  private readonly rwyIDTextSub = MappedSubject.create(([rwy]) => {
    if (rwy) {
      return `RW${rwy.designation}`;
    }

    return '-----';
  }, this.dataRunwaySub);

  private readonly rwyWindTextSub = MappedSubject.create(([runway, wind]) => {
    if (runway && wind) {
      const magVar = Facilities.getMagVar(runway.latitude, runway.longitude);

      const headwind = Math.trunc(wind.speed * (Math.cos(((runway.course - magVar) * Math.PI / 180) - (wind.direction * Math.PI / 180))));
      const crosswind = Math.trunc(wind.speed * (Math.sin(((runway.course - magVar) * Math.PI / 180) - (wind.direction * Math.PI / 180))));

      return `${(headwind > 0 ? 'H' : 'T')}${Math.abs(Math.round(headwind))} ${(headwind > 0 ? 'L' : 'R')}${Math.abs(Math.round(crosswind))}`;
    }

    return '--- ---';
  }, this.dataRunwaySub, this.dataWindSub);

  private readonly rwyLengthTextSub = MappedSubject.create(([rwy]) => {
    const isMetric = WT21UnitsUtils.getIsMetric();
    const distanceUnit = isMetric ? WT21UnitsUtils.getUnitString(UnitType.METER) : WT21UnitsUtils.getUnitString(UnitType.FOOT);
    if (rwy) {
      const lengthFeet = UnitType.FOOT.convertFrom(rwy.length, UnitType.METER);

      return (isMetric) ? `${rwy.length.toFixed(0)} M` : `${lengthFeet.toFixed(0)} FT`;
    }

    return `---- ${distanceUnit}`;
  }, this.dataRunwaySub);

  private readonly rwySlopeTextSub = MappedSubject.create(([slope]) => {
    if (slope) {
      const dirStr = slope > 0 ? 'U' : 'D';
      const pctStr = Math.abs(slope).toFixed(1);

      return `${dirStr}${pctStr}%`;
    }

    return '--.-%';
  }, this.dataRunwaySlopeSub);

  private readonly rwyConditionClassNameSub = MappedSubject.create(([runway, condition]) => {
    if (runway !== null && condition !== null) {
      return 'green-text';
    }

    return 'white-test';
  }, this.dataRunwaySub, this.dataRunwayConditionSub);

  private readonly rwyConditionTextSub = MappedSubject.create(([runway, condition]) => {
    if (runway !== null && condition !== null) {
      return condition === 1 ? 'WET' : 'DRY';
    }

    return '---';
  }, this.dataRunwaySub, this.dataRunwayConditionSub);

  private readonly windTextSub = MappedSubject.create(([wind]) => {
    if (wind) {
      const directionStr = wind.direction.toFixed(0).padStart(3, '0');
      const refStr = wind.trueDegrees ? 'T' : '°';
      const speedStr = wind.speed.toFixed(0);

      return `${directionStr}${refStr} / ${speedStr} KT`;
    }

    return '---° / -- KT';
  }, this.dataWindSub);

  private readonly oatTextSub = MappedSubject.create(([oat]) => {
    if (oat !== null) {
      const signStr = oat >= 0 ? '+' : '-';
      const valStr = Math.abs(oat).toFixed(0);

      return `${signStr}${valStr}°C`;
    }

    return '---°C';
  }, this.dataOatSub);

  private readonly qnhTextSub = MappedSubject.create(([qnh]) => {
    const isMetric = WT21UnitsUtils.getIsMetric();
    const baroUnit = isMetric ? WT21UnitsUtils.getUnitString(UnitType.HPA) : WT21UnitsUtils.getUnitString(UnitType.IN_HG);
    if (qnh !== null) {
      let valStr = qnh.toFixed(2);
      if (isMetric === true) {
        const qnhMetric = UnitType.IN_HG.convertTo(qnh, UnitType.HPA);
        valStr = qnhMetric.toFixed(0);
      }
      return `${valStr} ${baroUnit}`;
    }

    return `--.-- ${baroUnit}`;
  }, this.dataQnhSub);

  private readonly paltATextSub = MappedSubject.create(([runway, qnh]) => {
    if (runway && qnh !== null) {
      const pAlt = Math.trunc((((29.92 - qnh) * 1000) + UnitType.FOOT.convertFrom(runway.elevation, UnitType.METER)));

      const valStr = pAlt.toFixed(0).padStart(4, ' ');

      return `${valStr} FT`;
    }

    return '---- FT';
  }, this.dataRunwaySub, this.dataQnhSub);

  private weightLabelTextSub = this.isShowingApproachDataSub.map((it) => it ? 'LW' : 'TOW');

  private readonly weightTextSub = MappedSubject.create(
    this.isShowingApproachDataSub,
    this.takeoffPerfOutputsSub,
    this.approachPerfOutputsSub,
  ).map(([showingApproachData, takeoffOutputs, approachOutputs]) => {
    let weight = showingApproachData ? approachOutputs?.lw : takeoffOutputs?.tow;
    const isMetric = WT21UnitsUtils.getIsMetric();
    const weightUnit = isMetric ? WT21UnitsUtils.getUnitString(UnitType.KILOGRAM) : WT21UnitsUtils.getUnitString(UnitType.POUND);

    if (weight) {
      if (isMetric) {
        weight = UnitType.POUND.convertTo(weight, UnitType.KILOGRAM);
      }
      const valStr = weight.toFixed(0).padStart(5, ' ');

      return `${valStr} ${weightUnit}S`;
    }

    return `----- ${weightUnit}S`;
  });

  private readonly gwTextSub = MappedSubject.create(
    this.isShowingApproachDataSub,
    this.takeoffPerfOutputsSub,
    this.approachPerfOutputsSub,
  ).map(([showingApproachData, takeoffOutputs, approachOutputs]) => {
    let gw = showingApproachData ? approachOutputs?.gw : takeoffOutputs?.gw;
    const isMetric = WT21UnitsUtils.getIsMetric();
    const weightUnit = isMetric ? WT21UnitsUtils.getUnitString(UnitType.KILOGRAM) : WT21UnitsUtils.getUnitString(UnitType.POUND);

    if (gw) {
      if (isMetric) {
        gw = UnitType.POUND.convertTo(gw, UnitType.KILOGRAM);
      }
      const valStr = gw.toFixed(0).padStart(5, ' ');
      return `${valStr} ${weightUnit}S`;
    }
    return `----- ${weightUnit}S`;
  });

  private maxWeightLabelSub = this.isShowingApproachDataSub.map((it) => it ? 'MLW' : 'MTOW');

  private maxWeightTextSub = this.isShowingApproachDataSub.map((it) => it ? `${this.convertMtow(15660)}S` : `${this.convertMtow(17110)}S`);

  /**
   * Converts a takeoff or landing weight to the right unit system for display purposes.
   * @param mtow The maximum weight value.
   * @returns A string of the maximum weight for display.
   */
  private convertMtow(mtow: number): string {
    const isMetric = WT21UnitsUtils.getIsMetric();
    const unit = isMetric ? WT21UnitsUtils.getUnitString(UnitType.KILOGRAM) : WT21UnitsUtils.getUnitString(UnitType.POUND);
    if (isMetric === true) {
      mtow = UnitType.POUND.convertTo(mtow, UnitType.KILOGRAM);
    }
    return `${mtow.toFixed(0)} ${unit}`;
  }

  private readonly antiIcesClassNameSub = MappedSubject.create(([antiIce]) => {
    if (antiIce !== null) {
      return 'green-text';
    }

    return 'white-text';
  }, this.dataAntiIceSub);

  private readonly antiIceTextSub = MappedSubject.create(([antiIce]) => {
    if (antiIce !== null) {
      return antiIce === 1 ? 'ON' : 'OFF';
    }

    return '---';
  }, this.dataAntiIceSub);

  private readonly flapsOrLandingFactorClassNameSub = MappedSubject.create(([flaps]) => {
    if (flaps !== null) {
      return 'green-text';
    }

    return 'white-text';
  }, this.plan.takeoffFlaps);

  private readonly flapsOrLandingFactorTitleSub = this.isShowingApproachDataSub.map((it) => it ? 'LDG FACTOR' : 'T/O FLAPS');

  private readonly flapsOrLandingFactorTextSub = MappedSubject.create(([showingApproachData, flaps, landingFactor]) => {
    if (showingApproachData) {

      let value;
      if (landingFactor !== null) {
        switch (landingFactor) {
          case 0:
            value = 1;
            break;
          case 1:
            value = 1.25;
            break;
          case 2:
            value = 1.67;
            break;
          case 3:
            value = 1.92;
            break;
        }

        return value?.toFixed(2) ?? '-.--';
      }

      return '-.--';
    } else {
      if (flaps !== null) {
        return flaps === 0 ? '0' : '15';
      }

      return '--';
    }
  }, this.isShowingApproachDataSub, this.plan.takeoffFlaps, this.plan.approachLandingFactor);

  private readonly v1OrVRefTitleSub = this.isShowingApproachDataSub.map((it) => it ? 'VREF/VRF:' : 'V1:');

  private readonly v1OrVRefTextSub = MappedSubject.create(
    this.isShowingApproachDataSub,
    this.takeoffPerfOutputsSub,
    this.approachPerfOutputsSub,
  ).map(([showingApproachData, takeoffOutputs, apprOutputs]) => {
    const speed = showingApproachData ? apprOutputs?.calculations?.vRef : takeoffOutputs?.calculations?.v1;

    return speed ? Math.trunc(speed) : '---';
  });

  private readonly vrTextSub = this.takeoffPerfOutputsSub.map((outputs) => {
    const speed = outputs?.calculations?.vr;

    return speed ? Math.trunc(speed) : '---';
  });

  private readonly v2OrVAppTitleSub = this.isShowingApproachDataSub.map((it) => it ? 'VAPP/VAP:' : 'V2:');

  private readonly v2OrVAppTextSub = MappedSubject.create(
    this.isShowingApproachDataSub,
    this.takeoffPerfOutputsSub,
    this.approachPerfOutputsSub,
  ).map(([showingApproachData, takeoffOutputs, apprOutputs]) => {
    const speed = showingApproachData ? apprOutputs?.calculations?.vApp : takeoffOutputs?.calculations?.v2;

    return speed ? Math.trunc(speed) : '---';
  });

  private readonly vtTextSub = this.takeoffPerfOutputsSub.map((takeoffOutputs) => {
    if (takeoffOutputs?.calculations) {
      return '140';
    }

    return '---';
  });

  private readonly fieldLengthLabelTextSub = this.isShowingApproachDataSub.map((it) => it ? 'LFL:' : 'TOFL:');

  private readonly fieldLengthClassNameSub = MappedSubject.create(([tofl, runway]) => {
    if (tofl !== null && runway !== null) {
      const runwayLengthFeet = UnitType.FOOT.convertFrom(runway.length, UnitType.METER);

      if (runwayLengthFeet > tofl) {
        return 'white-text';
      } else {
        return 'yellow-text';
      }
    }

    return 'white-text';
  }, this.dataToflSub, this.dataRunwaySub);

  private readonly fieldLengthTextSub = MappedSubject.create(
    this.isShowingApproachDataSub,
    this.takeoffPerfOutputsSub,
    this.approachPerfOutputsSub,
  ).map(([showingApproachData, takeoffOutputs, apprOutputs]) => {
    let fieldLength = showingApproachData ? apprOutputs?.calculations?.landingFieldLength : takeoffOutputs?.calculations?.takeoffLength;
    const isMetric = WT21UnitsUtils.getIsMetric();
    const distanceUnit = isMetric ? WT21UnitsUtils.getUnitString(UnitType.METER) : WT21UnitsUtils.getUnitString(UnitType.FOOT);
    if (fieldLength && isMetric) {
      fieldLength = UnitType.FOOT.convertTo(fieldLength, UnitType.METER);
    }

    return `${fieldLength?.toFixed(0) ?? '----'} ${distanceUnit}`;
  });

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    // Shoe/hide some elements depending on TAKEOFF or APPROACH data
    this.isShowingApproachDataSub.sub((showingApproachData) => {
      for (const elementRef of this.approachRefHiddenElementRefs) {
        elementRef.instance.style.visibility = showingApproachData ? 'hidden' : 'inherit';
      }
    }, true);

    const controlEventsSubs = this.props.bus.getSubscriber<WT21MfdTextPageEvents>();

    controlEventsSubs.on('wt21mfd_text_page_prev').handle((targetMfdIndex) => {
      if (targetMfdIndex !== this.props.mfdIndex) {
        return;
      }

      const showingApproachRef = this.isShowingApproachDataSub.get();

      this.isShowingApproachDataSub.set(!showingApproachRef);
    });

    controlEventsSubs.on('wt21mfd_text_page_next').handle((targetMfdIndex) => {
      if (targetMfdIndex !== this.props.mfdIndex) {
        return;
      }

      const showingApproachRef = this.isShowingApproachDataSub.get();

      this.isShowingApproachDataSub.set(!showingApproachRef);
    });

    controlEventsSubs.on('wt21mfd_to_perf_outputs').handle((results) => this.takeoffPerfOutputsSub.set(results));
    controlEventsSubs.on('wt21mfd_appr_perf_outputs').handle((results) => this.approachPerfOutputsSub.set(results));
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div ref={this.pageContainerDivRef} class="mfd-page-perf-ref-container">
        <div class="perf-ref-header">
          <div>{this.airportIdentTextSub}</div>
          <div class="cyan-text">{this.titleTextSub}</div>
          <div class="cyan-text">{this.pageTextSub}</div>
        </div>

        <div class="perf-ref-data-container">
          <div class="perf-ref-data-row">
            <div class="cyan-text data1-size">RWY ID</div>
            <div>{this.rwyIDTextSub}</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data1-size">RWY WIND</div>
            <div>{this.rwyWindTextSub}</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data1-size">RWY LENGTH</div>
            <div>{this.rwyLengthTextSub}</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data1-size">RWY SLOPE</div>
            <div>{this.rwySlopeTextSub}</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data1-size">RWY COND</div>
            <div class={this.rwyConditionClassNameSub}>{this.rwyConditionTextSub}</div>
          </div>
        </div>

        <div class="perf-ref-data-container">
          <div class="perf-ref-data-row">
            <div class="cyan-text data2-size">WIND</div>
            <div>{this.windTextSub}</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data2-size">OAT</div>
            <div>{this.oatTextSub}</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data2-size">QNH</div>
            <div>{this.qnhTextSub}</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data2-size">P ALT</div>
            <div>{this.paltATextSub}</div>
          </div>
        </div>

        <div class="perf-ref-data-container">
          <div class="perf-ref-data-row">
            <div class="cyan-text data3-size">{this.weightLabelTextSub}</div>
            <div>{this.weightTextSub}</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data3-size">GWT</div>
            <div>{this.gwTextSub}</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data3-size">{this.maxWeightLabelSub}</div>
            <div>{this.maxWeightTextSub}</div>
          </div>
        </div>

        <div class="perf-ref-data-container">
          <div class="perf-ref-data-row">
            <div class="cyan-text data4-size">A/I</div>
            <div class={this.antiIcesClassNameSub}>{this.antiIceTextSub}</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data4-size">{this.flapsOrLandingFactorTitleSub}</div>
            <div class={this.flapsOrLandingFactorClassNameSub}>{this.flapsOrLandingFactorTextSub}</div>
          </div>
        </div>

        <div class="perf-ref-vspeed-container">
          <div class="perf-ref-data-row">
            <div class="cyan-text perf-ref-vspeed data5-size">{this.v1OrVRefTitleSub}</div>
            <div class="magenta-text">{this.v1OrVRefTextSub}</div>
          </div>
          <div ref={this.approachRefHiddenElementRefs[0]} class="perf-ref-data-row">
            <div class="cyan-text perf-ref-vspeed data5-size">VR:</div>
            <div class="magenta-text">{this.vrTextSub}</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text perf-ref-vspeed data5-size">{this.v2OrVAppTitleSub}</div>
            <div class="magenta-text">{this.v2OrVAppTextSub}</div>
          </div>
          <div ref={this.approachRefHiddenElementRefs[1]} class="perf-ref-data-row">
            <div class="cyan-text perf-ref-vspeed data5-size">VT:</div>
            <div class="magenta-text">{this.vtTextSub}</div>
          </div>
        </div>

        <div class="perf-ref-field-length-container">
          <div class="cyan-text">{this.fieldLengthLabelTextSub}</div>
          <div class="perf-ref-field-length-value">
            <span class={this.fieldLengthClassNameSub}>{this.fieldLengthTextSub}</span>
          </div>
        </div>

      </div>
    );
  }
}