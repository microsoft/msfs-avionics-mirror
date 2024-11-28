import {
  AdcEvents, ConsumerSubject, ConsumerValue, DisplayComponent, EventBus, ExpSmoother, FSComponent, MathUtils, NodeReference, SimVarValueType, Subject,
  Subscription, VNode
} from '@microsoft/msfs-sdk';

import {
  AdcSystemEvents, AdcSystemSelectorEvents, AOASystemEvents, RefSpeedType, RefsUserSettings, VSpeedType, VSpeedUserSettings
} from '@microsoft/msfs-wt21-shared';

import { PfdInstrumentConfig } from '../../Config/PfdInstrumentConfig';
import { AirspeedSelectBox } from './AirspeedSelectBox';
import { AirspeedTrendVector } from './AirspeedTrendVector';
import { DonutSpeedBug } from './DonutSpeedBug';
import { FlapSpeedBug } from './FlapSpeedBug';
import { FlcSpeedBug } from './FlcSpeedBug';
import { MachDisplay } from './MachDisplay';
import { SpeedBug } from './SpeedBug';
import { SpeedRange } from './SpeedRange';
import { VSpeedBug } from './VSpeedBug';
import { VSpeedValue } from './VSpeedValue';

import './AirspeedIndicator.css';

/**
 * A speed range type.
 */
export enum SpeedRangeType {
  over,
  low,
  stall
}


enum SpeedWarning {
  None,
  ImpendingOverspeed,
  Overspeed,
  ImpendingStall,
  Stall,
}

/**
 * The properties on the airspeed component.
 */
interface AirspeedIndicatorProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** PFD config object */
  pfdConfig: PfdInstrumentConfig;
}

/**
 * The PFD airspeed indicator with speed tape.
 */
export class AirspeedIndicator extends DisplayComponent<AirspeedIndicatorProps> {
  private airspeedContainerRef = FSComponent.createRef<HTMLDivElement>();
  private airspeedHundredsDataElement = FSComponent.createRef<SVGElement>();
  private airspeedTensDataElement = FSComponent.createRef<SVGElement>();
  private airspeedOnesDataElement = FSComponent.createRef<SVGElement>();
  private readonly hundredsSvg = FSComponent.createRef<SVGGElement>();
  private readonly tensSvg = FSComponent.createRef<SVGGElement>();
  private readonly onesSvg = FSComponent.createRef<SVGGElement>();
  private readonly airspeedTapeTickElement = FSComponent.createRef<HTMLDivElement>();
  private readonly airspeedTapeNumberRangeElement = FSComponent.createRef<SVGElement>();
  private readonly airspeedBoxElement = FSComponent.createRef<HTMLDivElement>();
  private readonly machBoxElement = FSComponent.createRef<HTMLDivElement>();
  private readonly airspeedTrendVector = FSComponent.createRef<AirspeedTrendVector>();
  private readonly speedWarningSubject = Subject.create(SpeedWarning.None);
  private readonly barberSpeed = Subject.create(Simplane.getDesignSpeeds().VNe);
  private readonly machBarberSpeed = Subject.create(Simplane.getDesignSpeeds().VNe);
  private currentDrawnIas = 0;
  private currentTrend = 0;
  private readonly iasScrollerValues: NodeReference<SVGTextElement>[] = [];
  private pixelPerTick = 0.405;
  private airborneTime = 0;
  private readonly rs = RefsUserSettings.getManager(this.props.bus);
  private readonly vspeedSettings = new VSpeedUserSettings(this.props.bus);
  private aoaPct = ConsumerValue.create(this.props.bus.getSubscriber<AOASystemEvents>().on('aoasys_aoa_pct'), 0);
  private readonly aoaCoefSmoother = new ExpSmoother(2000 / Math.LN2);
  private lastAoaCoefTime?: number;

  /**
   ** To be true from the time the airplane has first been airborne
   */
  private readonly firstFlightCondition = Subject.create(false);

  /**
   ** To be true from the time the airplane has first been 3s airborne until touchdown
   */
  private readonly extendedfirstFlightCondition = Subject.create(false);

  /**
   ** To be true from the time airplane first passed 80kts until touchdown
   */
  private readonly secondFlightCondition = Subject.create(false);

  /**
   ** To be true from the time the airplane first passed 140kts until touchdown
   */
  private readonly thirdFlightCondition = Subject.create(false);

  /**
   ** To be true from the time the airplane first passed 200kts until touchdown
   */
  private readonly fourthFlightCondition = Subject.create(false);

  /**
   ** To be true from the time the previously airborne airplane has first been under 50kts for more than 5s until it is airborne again
   */
  private readonly fifthFlightCondition = Subject.create(false);

  private readonly SpeedBugsMap = new Map<RefSpeedType | VSpeedType, NodeReference<SpeedBug>>([
    [VSpeedType.V1, FSComponent.createRef<SpeedBug>()],
    [VSpeedType.Vr, FSComponent.createRef<SpeedBug>()],
    [VSpeedType.V2, FSComponent.createRef<SpeedBug>()],
    [VSpeedType.Venr, FSComponent.createRef<SpeedBug>()],
    [VSpeedType.Vapp, FSComponent.createRef<SpeedBug>()],
    [VSpeedType.Vref, FSComponent.createRef<SpeedBug>()],
    [RefSpeedType.F15, FSComponent.createRef<SpeedBug>()],
    [RefSpeedType.F35, FSComponent.createRef<SpeedBug>()],
    [RefSpeedType.Donut, FSComponent.createRef<SpeedBug>()],
    [RefSpeedType.Flc, FSComponent.createRef<SpeedBug>()]
  ]);

  private readonly SpeedValuesMap = new Map<VSpeedType, NodeReference<VSpeedValue>>([
    [VSpeedType.V1, FSComponent.createRef<VSpeedValue>()],
    [VSpeedType.Vr, FSComponent.createRef<VSpeedValue>()],
    [VSpeedType.V2, FSComponent.createRef<VSpeedValue>()],
    [VSpeedType.Venr, FSComponent.createRef<VSpeedValue>()]
  ]);

  private readonly SpeedRangesMap = new Map<SpeedRangeType, NodeReference<SpeedRange>>([
    [SpeedRangeType.over, FSComponent.createRef<SpeedRange>()],
    [SpeedRangeType.low, FSComponent.createRef<SpeedRange>()],
    [SpeedRangeType.stall, FSComponent.createRef<SpeedRange>()]
  ]);

  private readonly selectedAdc = ConsumerSubject.create(this.props.bus.getSubscriber<AdcSystemSelectorEvents>().on('adc_selected_source_index'), 1);
  private adcSubs = [] as Subscription[];

  /**
   * Builds a numerical scroller for the airspeed window.
   * @param startYValue The starting Y value in the svg to start number at.
   * @param blankZeroValue Whether or not the 0 digit should be replaced by an empty space.
   * @returns A collection of text elements for the numerical scroller.
   */
  private buildScroller(startYValue = -2, blankZeroValue = false): SVGTextElement[] {
    const scroller: SVGTextElement[] = [];
    let yValue = startYValue;
    const fillVal = `var(--wt21-colors-${this.props.pfdConfig.artificialHorizonStyle === 'Full' ? 'green' : 'white'})`;

    for (let i = 11; i > -3; i--) {
      const number = i > 9 ? i - 10 : i < 0 ? i + 10 : i;
      let numberText = number.toString();

      if (blankZeroValue && number === 0) {
        numberText = ' ';
      }

      scroller.push(<text
        x="8"
        y={yValue}
        fill={fillVal}
        text-anchor="middle"
        font-size="32"
      >{numberText}</text>);
      yValue += 30;
    }

    scroller.push(<text
      x="8"
      y={yValue + 30}
      fill={fillVal}
      text-anchor="middle"
      font-size="32"
    >-</text>);
    return scroller;
  }

  /**
   * Builds the tick marks on the airspeed tape.
   * @returns A collection of tick mark line elements.
   */
  private buildSpeedTapeTicks(): SVGLineElement[] {
    const ticks: SVGLineElement[] = [];

    for (let i = 1; i < 22; i++) {
      const length = i % 2 == 0 ? 17 : 35;

      const startX = 86 + (length == 35 ? 0 : 18);
      const startY = 450 - (i * 50);

      const endX = startX + length;
      const endY = startY;

      ticks.push(<line x1={startX} y1={startY} x2={endX} y2={endY} stroke="var(--wt21-colors-dark-gray)" stroke-width="3" />);
    }
    ticks.push(<line x1={124} y1={402} x2={124} y2={-500} stroke="var(--wt21-colors-dark-gray)" stroke-width="3" />);

    return ticks;
  }

  /**
   * Builds the airspeed numbers for the airspeed tape.
   * @returns A collection of airspeed number text elements.
   */
  private buildSpeedTapeNumbers(): SVGTextElement[] {
    const text: SVGTextElement[] = [];

    for (let i = 1; i < 12; i++) {
      const startX = 82;
      const startY = 515 - (i * 100);

      const numberText = (40 + (i * 10)).toString();
      const textElement = FSComponent.createRef<SVGTextElement>();

      text.push(<text x={startX} y={startY} fill="var(--wt21-colors-white)" text-anchor="end" font-size="55" ref={textElement}>{numberText}</text>);
      this.iasScrollerValues.push(textElement);
    }

    return text;
  }

  /**
   * A callback called after the component renders.
   * @param node This VNode.
   */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    const adc = this.props.bus.getSubscriber<AdcSystemEvents>();
    this.selectedAdc.sub((adcIndex) => {
      for (const sub of this.adcSubs) {
        sub.destroy();
      }
      this.adcSubs = [];

      this.adcSubs.push(
        adc.on(`adc_ias_${adcIndex}`).withPrecision(2).handle(this.onUpdateIAS.bind(this)),
        adc.on(`adc_ambient_pressure_inhg_${adcIndex}`).withPrecision(2).handle((v) => this.machBarberSpeed.set(this.calculateMachBarberSpeed(v))),
        adc.on(`adc_indicated_alt_${adcIndex}`).withPrecision(0).handle(this.onUpdateAlt),
        adc.on(`adc_airspeed_data_valid_${adcIndex}`).whenChanged().handle(this.onAirspeedValidityChange.bind(this)),
      );
    }, true);

    this.props.bus.getSubscriber<AdcEvents>().on('on_ground').handle(this.onUpdateGround);

    this.speedWarningSubject.sub(this.speedWarningChanged.bind(this));

    this.extendedfirstFlightCondition.sub((v: boolean) => {
      this.SpeedBugsMap.get(RefSpeedType.Donut)?.instance.setIsVisible(v);
    });

    this.secondFlightCondition.sub((v: boolean) => {
      if (v) {
        for (const value of this.SpeedValuesMap.values()) {
          value.instance.setIsVisible(!v);
        }
      }
    });

    this.thirdFlightCondition.sub((v: boolean) => {
      this.airspeedTrendVector.instance.setIsVisible(v);
      for (const value of this.SpeedRangesMap.values()) {
        value.instance.setIsVisible(v);
      }
    });

    this.fourthFlightCondition.sub((v: boolean) => {
      if (v) {
        this.setVSpeedState(VSpeedType.V1, false);
        this.setVSpeedState(VSpeedType.Vr, false);
        this.setVSpeedState(VSpeedType.V2, false);
        this.setVSpeedState(VSpeedType.Venr, false);
      }
    });

    this.fifthFlightCondition.sub((v: boolean) => {
      if (v) {
        this.setVSpeedState(VSpeedType.Vapp, false);
        this.setVSpeedState(VSpeedType.Vref, false);
      }
    });

    this.barberSpeed.sub((v: number) => {
      this.SpeedRangesMap.get(SpeedRangeType.over)?.instance.setRangeSpeed(v);
      SimVar.SetGameVarValue('AIRCRAFT_MAXSPEED_OVERRIDE', SimVarValueType.Knots, (v - 3)); // offset by 3kts to even out WT21 buffer (2kts) and MSFS buffer (5kts)
    }, true);

    this.onUpdateIAS(0);

    for (const vspeed in VSpeedType) {
      const type = (vspeed as VSpeedType);
      const setting = this.vspeedSettings.getSettings(type);

      setting.value.sub((v) => {
        this.SpeedBugsMap.get(type)?.instance.setBugSpeed(v as number);
        this.SpeedValuesMap.get(type)?.instance.setVSpeed(v as number);
        this.updateAllBugsAndRanges(Simplane.getIndicatedSpeed());
      }, true);

      setting.manual.sub((v) => {
        this.SpeedBugsMap.get(type)?.instance.setIsModified(v as boolean);
        this.SpeedValuesMap.get(type)?.instance.setIsModified(v as boolean);
        this.updateAllBugsAndRanges(Simplane.getIndicatedSpeed());
      }, true);

      setting.show.sub((v) => {
        this.SpeedBugsMap.get(type)?.instance.setIsVisible(v as boolean);
        this.SpeedValuesMap.get(type)?.instance.setIsVisible(v as boolean);
        this.updateAllBugsAndRanges(Simplane.getIndicatedSpeed());
      }, true);
    }
    this.updateAllBugsAndRanges(Simplane.getIndicatedSpeed());
  }

  /**
   * A callback called when the ADC airspeed validity changes
   * @param valid Whether the data is valid
   */
  private onAirspeedValidityChange(valid: boolean): void {
    this.airspeedContainerRef.instance.classList.toggle('fail', !valid);
  }

  /**
   * Sets the state on given VSpeed type.
   * @param type The VSpeed type.
   * @param enabled The VSpeed state.
   */
  private setVSpeedState = (type: VSpeedType, enabled: boolean): void => {
    const setting = this.vspeedSettings.getSettings(type);
    setting.show.set(enabled);
    setting.manual.set(true);

  };

  /**
   * A callback called when the ambient pressure changes.
   * @param pressure the ambient pressure
   * @returns the new barber speed in knots
   */
  private calculateMachBarberSpeed(pressure: number): number {
    const machScalar2 = Math.pow(0.77, 2);
    const machScalar4 = Math.pow(0.77, 4);
    return Math.sqrt(pressure / 29.92) * Math.sqrt(1 + machScalar2 / 4 + machScalar4 / 40) * 0.77 * 661.5;
  }

  /**
   * A callback called when the speedwarning state changes.
   * @param state the speed warning state
   */
  private speedWarningChanged(state: SpeedWarning): void {
    switch (state) {
      case SpeedWarning.ImpendingOverspeed:
        this.airspeedBoxElement.instance.classList.add('yellow', 'blinking');
        this.machBoxElement.instance.classList.add('yellow', 'blinking');
        this.SpeedRangesMap.get(SpeedRangeType.over)?.instance.setisEmphasized(true);
        break;
      case SpeedWarning.Overspeed:
        this.airspeedBoxElement.instance.classList.remove('red', 'blinking');
        this.machBoxElement.instance.classList.remove('red', 'blinking');
        setTimeout(() => {
          this.airspeedBoxElement.instance.classList.add('red', 'blinking');
          this.machBoxElement.instance.classList.add('red', 'blinking');
        }, 1);
        this.SpeedRangesMap.get(SpeedRangeType.over)?.instance.setisEmphasized(true);
        break;
      case SpeedWarning.ImpendingStall:
      case SpeedWarning.Stall:
        this.airspeedBoxElement.instance.classList.remove('red', 'blinking');
        this.machBoxElement.instance.classList.remove('red', 'blinking');
        setTimeout(() => {
          this.airspeedBoxElement.instance.classList.add('red', 'blinking');
          this.machBoxElement.instance.classList.add('red', 'blinking');
        }, 1);
        this.SpeedRangesMap.get(SpeedRangeType.stall)?.instance.setisEmphasized(true);
        break;
      case SpeedWarning.None:
        this.machBoxElement.instance.classList.remove('blinking', 'red', 'yellow');
        this.airspeedBoxElement.instance.classList.remove('blinking', 'red', 'yellow');
        this.SpeedRangesMap.get(SpeedRangeType.over)?.instance.setisEmphasized(false);
        this.SpeedRangesMap.get(SpeedRangeType.stall)?.instance.setisEmphasized(false);
        break;
    }
  }

  private _lastIAS = 0;
  private _lastTime = 0;
  private _computedIASAcceleration = 0;
  /**
   * A computation of the current IAS Acceleration used for the Airspeed Trend Vector.
   * @param ias The current IAS value.
   * @returns The current IAS Acceleration.
   */
  private computeIASAcceleration = (ias: number): number => {
    const newIASTime = {
      ias: ias,
      t: performance.now() / 1000
    };
    if (this._lastTime == 0) {
      this._lastIAS = ias;
      this._lastTime = performance.now() / 1000;
      return 0;
    }
    let frameIASAcceleration = (newIASTime.ias - this._lastIAS) / (newIASTime.t - this._lastTime);
    frameIASAcceleration = MathUtils.clamp(frameIASAcceleration, -10, 10);
    if (isFinite(frameIASAcceleration)) {
      this._computedIASAcceleration += (frameIASAcceleration - this._computedIASAcceleration) / (50 / ((newIASTime.t - this._lastTime) / .016));
    }
    this._lastIAS = ias;
    this._lastTime = performance.now() / 1000;
    const accel = this._computedIASAcceleration * 10; //10 second trend vector
    return accel;
  };

  /**
   * Estimates an IAS given a normalized AoA and coefficient.
   * @param normAoa The normalized AoA.
   * @param normAoaIasCoef The normalized AoA to IAS coefficient.
   * @returns The estimated IAS.
   */
  private estimateIasFromNormAoa(normAoa: number, normAoaIasCoef: number): number {
    return Math.sqrt(normAoaIasCoef / normAoa);
  }

  /**
   * A method called to update all bugs and ranges on the tape.
   * @param ias the current ias
   */
  private updateAllBugsAndRanges(ias: number): void {
    const normAoa = this.aoaPct.get();

    let normAoaIasCoef = 0;
    if (isFinite(normAoa)) {
      const iasSquared = ias * ias;
      const coef = normAoa * iasSquared;
      const time = Date.now();

      if (this.lastAoaCoefTime === undefined) {
        normAoaIasCoef = this.aoaCoefSmoother.reset(coef);
      } else {
        normAoaIasCoef = this.aoaCoefSmoother.next(coef, time - this.lastAoaCoefTime);
      }

      this.lastAoaCoefTime = time;
    }

    // iterate over speed bugs map
    for (const [key, value] of this.SpeedBugsMap.entries()) {
      value.instance.updateBug(ias);
      if (key == RefSpeedType.Donut) {
        value.instance.setBugSpeed(this.estimateIasFromNormAoa(0.6, normAoaIasCoef));
      }
    }

    // iterate over speed ranges map
    for (const [key, value] of this.SpeedRangesMap.entries()) {
      value.instance.updateRange(ias);
      if (key == SpeedRangeType.stall) {
        value.instance.setRangeSpeed(this.estimateIasFromNormAoa(1.0, normAoaIasCoef));
      }

      if (key == SpeedRangeType.low) {
        value.instance.setRangeSpeed(this.estimateIasFromNormAoa(0.8, normAoaIasCoef));
      }
    }

    this.airspeedTrendVector.instance.updateVector(ias, this.currentTrend);
  }

  private under50Time = 0;
  private trendOverspeedTime = 0;
  private trendStallTime = 0;
  /**
   * A callback called when the IAS updates from the event bus.
   * @param ias The current IAS value.
   */
  private onUpdateIAS = (ias: number): void => {
    this.currentTrend = this.computeIASAcceleration(ias);

    // Update Scrollers
    const ones = ias % 10;
    const tens = (ias % 100 - ones) / 10;
    const hundreds = (ias - tens * 10 - ones) / 100;

    if (this.airspeedHundredsDataElement.instance !== null) {
      let newTranslation = -300 + (hundreds * 30);
      if (tens === 9 && ones > 9) {
        newTranslation -= ((10 - ones) * 30) - 30;
      }
      if (ias < 40) {
        newTranslation = -390;
      }
      this.hundredsSvg.instance.style.transform = `translate3d(0px, ${newTranslation}px, 0px)`;
    }

    if (this.airspeedTensDataElement.instance !== null) {
      let newTranslation = -300 + (tens * 30);
      if (ones > 9) {
        newTranslation -= ((10 - ones) * 30) - 30;
      }
      if (ias < 40) {
        newTranslation = -420.2;
      }
      this.tensSvg.instance.style.transform = `translate3d(0px, ${newTranslation}px, 0px)`;
    }

    if (this.airspeedOnesDataElement.instance !== null) {
      let newTranslation = -301.2 + (ones * 30);
      if (ias < 40) {
        newTranslation = -421.2;
      }
      this.onesSvg.instance.style.transform = `translate3d(0px, ${newTranslation}px, 0px)`;
    }

    // Update Tape
    if (this.airspeedTapeTickElement.instance !== null && this.airspeedTapeNumberRangeElement.instance != null) {
      const offset = ias >= 80 ? -100.5 : -500.5;
      let newTranslation = offset;
      if (ias >= 80) {
        newTranslation = offset + 10 * (ias % 10);
      } else if (ias >= 40) {
        newTranslation = offset + 10 * (ias - 40);
      }
      this.airspeedTapeNumberRangeElement.instance.style.transform = `translate3d(0px, ${(newTranslation * this.pixelPerTick)}px, 0px)`;
      this.airspeedTapeTickElement.instance.style.transform = `translate3d(0px, ${(newTranslation * this.pixelPerTick)}px, 0px)`;
    }

    if (ias >= 80 && (ias / 10 >= this.currentDrawnIas + 1 || ias / 10 < this.currentDrawnIas)) {
      this.secondFlightCondition.set(true);
      this.currentDrawnIas = Math.floor(ias / 10);
      for (let i = 0; i < this.iasScrollerValues.length; i++) {
        const scrollerValue = this.iasScrollerValues[i].instance;
        if (scrollerValue !== null) {
          scrollerValue.textContent = (i + this.currentDrawnIas) % 2 == 0 ? (10 * ((i - 4) + this.currentDrawnIas)).toString() : '';
        }
      }
    } else if (ias < 80 && this.currentDrawnIas != 4) {
      this.currentDrawnIas = 4;
      for (let i = 0; i < this.iasScrollerValues.length; i++) {
        const scrollerValue = this.iasScrollerValues[i].instance;
        if (scrollerValue !== null) {
          scrollerValue.textContent = (i + this.currentDrawnIas) % 2 == 0 ? (10 * ((i) + this.currentDrawnIas)).toString() : '';
        }
      }
    }

    // Condition checking
    if (ias < 50) {
      if (this.under50Time == 0) {
        this.under50Time = Date.now();
      } else if (Date.now() - this.under50Time >= 5000) {
        if (this.firstFlightCondition.get()) {
          this.fifthFlightCondition.set(true);
        }
      }
    } else {
      this.under50Time = 0;
    }

    if (ias >= 140) {
      this.thirdFlightCondition.set(true);
      if (ias >= 200) {
        this.fourthFlightCondition.set(true);
      }
    } else if (this.airborneTime == 0) {
      this.thirdFlightCondition.set(false);
    }

    if (ias >= this.barberSpeed.get() + 2) {
      this.speedWarningSubject.set(SpeedWarning.Overspeed);
      this.trendOverspeedTime = 0;
      this.trendStallTime = 0;
    } else if (ias <= Simplane.getStallSpeed() - 2 && this.extendedfirstFlightCondition.get()) {
      this.speedWarningSubject.set(SpeedWarning.Stall);
      this.trendOverspeedTime = 0;
      this.trendStallTime = 0;
    } else if (ias + this.currentTrend >= this.barberSpeed.get() + 2) {
      if (this.trendOverspeedTime == 0) {
        this.trendOverspeedTime = Date.now();
      } else if (Date.now() - this.trendOverspeedTime >= 5000) {
        this.speedWarningSubject.set(SpeedWarning.ImpendingOverspeed);
      }
      this.trendStallTime = 0;
    } else if (ias + this.currentTrend <= Simplane.getStallSpeed() - 2 && this.extendedfirstFlightCondition.get()) {
      if (this.trendStallTime == 0) {
        this.trendStallTime = Date.now();
      } else if (Date.now() - this.trendStallTime >= 5000) {
        this.speedWarningSubject.set(SpeedWarning.ImpendingStall);
      }
      this.trendOverspeedTime = 0;
    } else {
      this.speedWarningSubject.set(SpeedWarning.None);
      this.trendOverspeedTime = 0;
      this.trendStallTime = 0;
    }

    // Update Bugs, Ranges and Vector
    this.updateAllBugsAndRanges(ias);
  };

  /**
   * A callback called when the Indicated altitude updates from the event bus.
   * @param alt The current Alt value.
   */
  private onUpdateAlt = (alt: number): void => {
    if (alt < 8000) {
      this.barberSpeed.set(260);
    } else if (alt < 27884) {
      this.barberSpeed.set(305);
    } else {
      this.barberSpeed.set(this.machBarberSpeed.get());
    }

    this.SpeedBugsMap.get(RefSpeedType.F15)?.instance.setIsVisible(alt <= 18000);
    this.SpeedBugsMap.get(RefSpeedType.F35)?.instance.setIsVisible(alt <= 18000);
  };

  private onUpdateGround = (onGround: boolean): void => {
    if (onGround) {
      if (this.airborneTime > 0 && Simplane.getAngleOfAttack() < 0.5) {
        this.airborneTime = 0;
        this.extendedfirstFlightCondition.set(false);
        this.thirdFlightCondition.set(false);
        this.fourthFlightCondition.set(false);
        if (this.firstFlightCondition.get()) {
          this.secondFlightCondition.set(false);
        }
      }
    } else {
      this.firstFlightCondition.set(true);
      this.fifthFlightCondition.set(false);

      if (this.airborneTime == 0) {
        this.airborneTime = Date.now();
      } else if (Date.now() - this.airborneTime >= 3000) {
        this.extendedfirstFlightCondition.set(true);
      }
    }
  };

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div>
        <div class="spd-select-box">
          <AirspeedSelectBox bus={this.props.bus} />
        </div>
        <div
          ref={this.airspeedContainerRef}
          class={{
            'airspeed-box': true,
            'translucent-box': this.props.pfdConfig.artificialHorizonStyle === 'Full',
          }}
        >
          {this.props.pfdConfig.artificialHorizonStyle === 'Cropped' && <div class="airspeed-mask"></div>}
          <div class="airspeed">
            <AirspeedTrendVector ref={this.airspeedTrendVector} />

            <div class="airspeed-tick-marks">
              <svg viewBox="0 -500 125 1000" ref={this.airspeedTapeNumberRangeElement}>
                {this.buildSpeedTapeNumbers()}
              </svg>
            </div>

            <SpeedRange ref={this.SpeedRangesMap.get(SpeedRangeType.over)} cssClass="red" fromTop={true} defaultSpeed={260} />
            <SpeedRange ref={this.SpeedRangesMap.get(SpeedRangeType.low)} cssClass="yellow" fromTop={false} defaultSpeed={Simplane.getDesignSpeeds().VS1} />
            <SpeedRange ref={this.SpeedRangesMap.get(SpeedRangeType.stall)} cssClass="red" fromTop={false} defaultSpeed={Simplane.getDesignSpeeds().VS0} />

            <FlcSpeedBug ref={this.SpeedBugsMap.get(RefSpeedType.Flc)} bus={this.props.bus} />

            <VSpeedBug ref={this.SpeedBugsMap.get(VSpeedType.V1)} label="1" lineLength={8} defaultSpeed={108} />
            <VSpeedBug ref={this.SpeedBugsMap.get(VSpeedType.Vr)} label="R" lineLength={18} defaultSpeed={111} />
            <VSpeedBug ref={this.SpeedBugsMap.get(VSpeedType.V2)} label="2" lineLength={30} defaultSpeed={116} />
            <VSpeedBug ref={this.SpeedBugsMap.get(VSpeedType.Venr)} label="T" lineLength={30} defaultSpeed={140} />
            <VSpeedBug ref={this.SpeedBugsMap.get(VSpeedType.Vapp)} label="AP" lineLength={18} />
            <VSpeedBug ref={this.SpeedBugsMap.get(VSpeedType.Vref)} label="RF" lineLength={8} />

            <FlapSpeedBug ref={this.SpeedBugsMap.get(RefSpeedType.F15)} label="F15" defaultSpeed={200} />
            <FlapSpeedBug ref={this.SpeedBugsMap.get(RefSpeedType.F35)} label="F35" defaultSpeed={160} />

            <div class="ias-box" ref={this.airspeedBoxElement}>
              <svg>
                <path d="M 11 17 l 36 0 l 0 -10 l 24 0 l 0 16 l 15 12 l -15 12 l 0 17 l -24 0 l 0 -11 l -36 0 z" fill="var(--wt21-colors-black)" stroke="var(--wt21-colors-dark-gray)" stroke-width="2" />
                <rect x="114" y="33.5" width="14" height="3" fill="var(--wt21-colors-dark-gray)" />
              </svg>

              <div class="hundreds-scroller scroller-background">
                <svg ref={this.hundredsSvg}>
                  <g ref={this.airspeedHundredsDataElement}>{this.buildScroller(-2, true)}</g>
                </svg>
              </div>

              <div class="tens-scroller scroller-background">
                <svg ref={this.tensSvg}>
                  <g ref={this.airspeedTensDataElement}>{this.buildScroller()}</g>
                </svg>
              </div>

              <div class="ones-scroller scroller-background">
                <svg ref={this.onesSvg}>
                  <g ref={this.airspeedOnesDataElement}>{this.buildScroller(9)}</g>
                </svg>
              </div>
            </div>

            <div class="airspeed-tick-marks" ref={this.airspeedTapeTickElement}>
              <svg viewBox="0 -500 125 1000">
                {this.buildSpeedTapeTicks()}
              </svg>
              <div class="vspeed-values-container">
                <VSpeedValue ref={this.SpeedValuesMap.get(VSpeedType.Venr)} name="T" />
                <VSpeedValue ref={this.SpeedValuesMap.get(VSpeedType.V2)} name="2" />
                <VSpeedValue ref={this.SpeedValuesMap.get(VSpeedType.Vr)} name="R" />
                <VSpeedValue ref={this.SpeedValuesMap.get(VSpeedType.V1)} name="1" />
              </div>
            </div>

            <DonutSpeedBug ref={this.SpeedBugsMap.get(RefSpeedType.Donut)} />
          </div >
          <div class="fail-box">
            IAS
          </div>
        </div>
        <div class="mach-box" ref={this.machBoxElement}>
          <MachDisplay bus={this.props.bus} />
        </div>
      </div>
    );
  }
}
