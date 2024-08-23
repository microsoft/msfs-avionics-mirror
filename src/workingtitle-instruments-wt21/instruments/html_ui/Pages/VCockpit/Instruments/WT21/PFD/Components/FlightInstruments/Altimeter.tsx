import {
  AdcEvents, Animator, APEvents, AvionicsSystemState, AvionicsSystemStateEvent, ComponentProps, DefaultUserSettingManager, DisplayComponent, Easing, EventBus, FSComponent,
  MathUtils, MinimumsEvents, MinimumsMode, NodeReference, Subject, VNode,
} from '@microsoft/msfs-sdk';

import { ADCSystemEvents, PerformancePlan, PFDSettings, PFDUserSettings, RASystemEvents, WT21ControlEvents } from '@microsoft/msfs-wt21-shared';

import { AltAlertState, AltitudeAlertController } from './AltitudeAlertController';
import { AltPreselectBox } from './AltPreselectBox';
import { BaroPreset } from './BaroPreset';
import { WT21PfdConfigInterface } from '../../WT21PfdConfigBuilder';

import './Altimeter.css';

/**
 * The properties for the Altimeter component.
 */
interface AltimeterProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The active performance plan */
  performancePlan: PerformancePlan

  /** PFD config object */
  pfdConfig: WT21PfdConfigInterface;
}

/**
 * The Altimeter component.
 */
export class Altimeter extends DisplayComponent<AltimeterProps> {
  protected readonly controller = new AltitudeAlertController(this.props.bus);
  private altimeterContainerRef = FSComponent.createRef<HTMLDivElement>();
  private metricAltitudeBoxElement = FSComponent.createRef<HTMLDivElement>();
  private metricAltitudeValue = Subject.create(0);
  private altitudeBoxElement = FSComponent.createRef<HTMLDivElement>();
  private altitudeTenThousandsDataElement = FSComponent.createRef<SVGElement>();
  private altitudeThousandsDataElement = FSComponent.createRef<SVGElement>();
  private altitudeHundredsDataElement = FSComponent.createRef<SVGElement>();
  private altitudeTensDataElement = FSComponent.createRef<SVGElement>();
  private readonly tenThousandsSvg = FSComponent.createRef<SVGGElement>();
  private readonly thousandsSvg = FSComponent.createRef<SVGGElement>();
  private readonly hundredsSvg = FSComponent.createRef<SVGGElement>();
  private readonly tensSvg = FSComponent.createRef<SVGGElement>();
  private altitudeTapeTickElement = FSComponent.createRef<HTMLDivElement>();
  private altitudeTapeGroundElement = FSComponent.createRef<SVGElement>();
  private surroundingTicks: NodeReference<SVGLineElement>[] = [];
  private altitudeScrollerValues: NodeReference<SVGTextElement>[] = [];
  private altitudeScrollerZeroes: NodeReference<SVGTextElement>[] = [];
  private altitudeBugRef = FSComponent.createRef<HTMLDivElement>();
  private altitudeFineBugRef = FSComponent.createRef<HTMLDivElement>();
  private altitudeFineBugDeviationRef = FSComponent.createRef<SVGElement>();
  private baroMinsBugRef = FSComponent.createRef<HTMLDivElement>();
  private baroMinsBugFlashRef = FSComponent.createRef<SVGGElement>();
  private radioMinsBarRef = FSComponent.createRef<HTMLDivElement>();
  private pfdSettingsManager!: DefaultUserSettingManager<PFDSettings>;

  private altitude = Simplane.getAltitude();
  private altOffset = -this.altitude;
  private initAltOffset = -this.altitude;
  private radioAltitude = 0;
  private selectedAltitude = -10000;
  private currentDrawnAlt = 0;
  private radioMinimums = 50;
  private baroMinimums = 200;
  private isBelowMSL = Subject.create(false);
  private isTransitingMSL = Subject.create(false);
  private baroMinsVisible = Subject.create(false);
  private baroMinsEnabled = false;
  private radioMinsVisible = Subject.create(false);
  private radioMinsEnabled = false;
  private preselectVisible = Subject.create(false);
  private preselectFineVisible = Subject.create(false);
  private initTime = 2000;
  private initAnimator = new Animator();
  private initEaseOut = Easing.withEndpointParams(Easing.bezier(0, 1, 0, 1));

  private pixelPerTick = 0.75625;

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    const adc = this.props.bus.getSubscriber<AdcEvents>();
    const ap = this.props.bus.getSubscriber<APEvents>();
    const minimums = this.props.bus.getSubscriber<MinimumsEvents>();
    const cp = this.props.bus.getSubscriber<WT21ControlEvents>();
    this.pfdSettingsManager = PFDUserSettings.getManager(this.props.bus);

    adc.on('indicated_alt')
      .withPrecision(1)
      .handle(this.updateAltitude.bind(this));
    adc.on('radio_alt')
      .withPrecision(1)
      .handle(this.updateGroundRibbon.bind(this));
    ap.on('ap_altitude_selected')
      .withPrecision(0)
      .handle(this.updateSelectedAltitude.bind(this));

    minimums.on('decision_altitude_feet')
      .handle(v => this.updateBaroMinimumsBug(v));
    minimums.on('decision_height_feet')
      .handle(v => this.updateRadioMinimumsBar(v));

    minimums.on('minimums_mode').handle(v => {
      this.baroMinsEnabled = v === MinimumsMode.BARO;
      this.updateBaroMinimumsBug();
      this.radioMinsEnabled = v === MinimumsMode.RA;
      this.updateRadioMinimumsBar();
    });

    this.isBelowMSL.sub(x => {
      this.altitudeBoxElement.instance?.classList.toggle('below-msl', x);
    });

    this.isTransitingMSL.sub(x => {
      this.altitudeBoxElement.instance?.classList.toggle('trans-msl', x);
    });

    this.preselectVisible.sub(x => {
      this.altitudeBugRef.instance?.classList.toggle('hidden', !x);
    });

    this.preselectFineVisible.sub(x => {
      this.altitudeFineBugRef.instance?.classList.toggle('hidden', !x);
    });

    this.baroMinsVisible.sub(x => {
      this.baroMinsBugRef.instance?.classList.toggle('hidden', !x);
    });

    this.radioMinsVisible.sub(x => {
      this.radioMinsBarRef.instance?.classList.toggle('hidden', !x);
    });

    this.pfdSettingsManager.whenSettingChanged('altMetric').handle(v => {
      this.metricAltitudeBoxElement.instance?.classList.toggle('hidden', !v);
    });

    this.controller.alerterState.sub(this.onAlerterStateChanged.bind(this));

    cp.on('minimums_alert').whenChanged().handle(isAlerting => {
      this.baroMinsBugRef.instance.classList.toggle('mininimums-flash', isAlerting);
      this.radioMinsBarRef.instance.classList.toggle('mininimums-flash', isAlerting);
      this.baroMinsBugFlashRef.instance.classList.toggle('baro-mins-flash', isAlerting);
      this.radioMinsBarRef.instance.classList.toggle('ra-mins-flash', isAlerting);
    });

    this.props.bus.getSubscriber<ADCSystemEvents>()
      .on('adc_state').whenChanged()
      .handle(this.onAdcStateChanged.bind(this));

    this.props.bus.getSubscriber<RASystemEvents>()
      .on('ra_state').whenChanged()
      .handle(this.onRaStateChanged.bind(this));
  }

  /**
   * A callback called when the ADC system state changes.
   * @param state The state change event to handle.
   */
  private onAdcStateChanged(state: AvionicsSystemStateEvent): void {
    this.altimeterContainerRef.instance.classList.toggle('fail', (state.current == AvionicsSystemState.Failed || state.current == AvionicsSystemState.Initializing));
    if (state.current === AvionicsSystemState.On && state.previous !== AvionicsSystemState.On) {
      // Original starts at absolute 0, but that seems to extreme in the sim, so we start 1000ft below indicated;
      // this.initAltOffset = -this.altitude;
      this.initAltOffset = -1000;
      this.initAnimator = new Animator();
      this.initAnimator.start(1, this.initTime, this.initEaseOut);
      this.initAnimator.value.sub(prog => {
        this.altOffset = this.initAltOffset * (1 - prog);
        this.updateAltitude(this.altitude);
      });
    }
  }

  /**
   * A callback called when the RA system state changes.
   * @param state The state change event to handle.
   */
  private onRaStateChanged(state: AvionicsSystemStateEvent): void {
    this.altitudeTapeGroundElement.instance.classList.toggle('hidden', (state.current == AvionicsSystemState.Failed || state.current == AvionicsSystemState.Initializing));
  }

  /**
   * Builds a numerical scroller with dual numbers for the altimeter window.
   * @param startYValue The starting Y value in the svg to start number at.
   * @returns A collection of text elements for the numerical scroller.
   */
  private buildDoubleScroller(startYValue = 78): SVGTextElement[] {
    const scroller: SVGTextElement[] = [];

    let yValue = startYValue;

    for (let i = 0; i < 15; i++) {
      const number = i < 7 ? (220 - i * 20) : i * 20 - 20;
      const numberText = i == 13 ? ' ' : i == 14 ? '- -' : number.toString().slice(-2);

      let className = numberText == '00' ? 'zero-digit' : 'normal-digit';
      const fillVal = `var(--wt21-colors-${this.props.pfdConfig.artificialHorizonStyle === 'Full' ? 'green' : 'white'})`;

      if (i == 5 || i == 7) {
        const altClassName = i == 5 ? className + ' top show-below-msl' : className + ' bottom show-above-msl';
        const altNumberText = (100 - number % 100).toString().slice(-2);
        scroller.push(<text x='15' y={yValue} class={altClassName} fill={fillVal} text-anchor="middle" font-size='22'>{altNumberText}</text>);
        className += i == 5 ? ' top show-above-msl' : ' bottom show-below-msl';
      }
      scroller.push(<text x='15' y={yValue} class={className} fill={fillVal} text-anchor="middle" font-size='22'>{numberText}</text>);

      yValue += 22;
    }

    return scroller;
  }

  /**
   * Builds a numerical scroller for the altimeter window.
   * @param startYValue The starting Y value in the svg to start number at.
   * @param includeNeg Whether the NEG flag should be included.
   * @returns A collection of text elements for the numerical scroller.
   */
  private buildSingleScroller(startYValue = 0, includeNeg = false): SVGTextElement[] {
    const scroller: SVGTextElement[] = [];
    let yValue = startYValue;
    const fillVal = `var(--wt21-colors-${this.props.pfdConfig.artificialHorizonStyle === 'Full' ? 'green' : 'white'})`;

    for (let i = 0; i < 24; i++) {
      const number = i < 12 ? (11 - i) : i - 11;
      const numberText = i == 23 ? '-' : number.toString().slice(-1);

      let className = number === 0 ? 'zero-digit' : 'normal-digit';
      if (i == 10 || i == 12) {
        const altClassName = i == 10 ? className + ' top show-below-msl' : className + ' bottom show-above-msl';
        const altNumber = 10 - number;
        const altNumberText = altNumber.toString();
        scroller.push(<text x='8' y={yValue} class={altClassName} fill={fillVal} text-anchor="middle" font-size='34'>{altNumberText}</text>);
        className += i == 10 ? ' top show-above-msl' : ' bottom show-below-msl';
      } else if (className == 'zero-digit') {
        const altClassName = 'alt-' + className;
        scroller.push(<text x='8' y={yValue - 0.5} class={altClassName} text-anchor="middle" font-size='34'>$</text>);
      }
      scroller.push(<text x='8' y={yValue} class={className} fill={fillVal} text-anchor="middle" font-size='34'>{numberText}</text>);

      yValue += 47;
    }

    if (includeNeg) {
      scroller.push(<text x='8' y={yValue + 48.5} fill={fillVal} text-anchor="middle" font-size='34'>$</text>);
      scroller.push(<text x='5' y={yValue + 60 + 47 - 20} fill={fillVal} text-anchor="middle" font-size='22'>N</text>);
      scroller.push(<text x='5' y={yValue + 60 + 47} fill={fillVal} text-anchor="middle" font-size='22'>E</text>);
      scroller.push(<text x='5' y={yValue + 60 + 47 + 20} fill={fillVal} text-anchor="middle" font-size='22'>G</text>);
    }

    return scroller;
  }

  /**
   * Builds the tick marks on the altitude tape.
   * @returns A collection of tick mark line elements.
   */
  private buildAltitudeTapeTicks(): SVGLineElement[] {
    const ticks: SVGLineElement[] = [];
    for (let i = 0; i < 9; i++) {
      const length = 19.5;
      const startX = 176.5;
      const startY = 400 - (i * 100);

      const endX = startX - length;
      const endY = startY;

      ticks.push(<line x1={startX} y1={startY} x2={endX} y2={endY} stroke="var(--wt21-colors-dark-gray)" stroke-width="2.5" />);
    }

    for (let i = 0; i < 17; i++) {
      const length = 16;
      const startX = 153;
      const startY = i % 2 == 0 ? 427 - (i * 50) : 373 - ((i - 1) * 50);

      const endX = startX - length;
      const endY = startY;

      const surroundingTick = FSComponent.createRef<SVGLineElement>();
      ticks.push(<line ref={surroundingTick} x1={startX} y1={startY} x2={endX} y2={endY} stroke="var(--wt21-colors-dark-gray)" stroke-width="2.5" style="visibility:hidden" />);
      this.surroundingTicks.push(surroundingTick);
    }

    return ticks;
  }

  /**
   * Builds the lines on the ground ribbon.
   * @returns A collection of tick mark rect elements.
   */
  private buildGroundRibbonLines(): SVGRectElement[] {
    const lines: SVGRectElement[] = [];
    for (let i = 0; i < 18; i++) {
      const width = 140;
      const height = 4;
      const skew = 54;
      const startY = -225 + (i * 34.5);

      lines.push(<rect x="0" y={startY} width={width} height={height} transform={'skewY(' + skew + ')'} fill="var(--wt21-colors-yellow)" />);
    }

    return lines;
  }

  /**
   * Builds the altitude numbers for the altimeter tape.
   * @returns A collection of airspeed number text elements.
   */
  private buildAltitudeTapeNumbers(): SVGTextElement[] {
    const text: SVGTextElement[] = [];
    let altStart = -4;

    for (let i = 0; i < 9; i++) {
      const startX = 116.5;
      const startY = 417 - (i * 100);

      const numberText = altStart.toString();
      const textElement = FSComponent.createRef<SVGTextElement>();
      text.push(<text x={startX} y={startY} fill="var(--wt21-colors-white)" text-anchor="end" font-size='46' ref={textElement}>{numberText}</text>);
      this.altitudeScrollerValues.push(textElement);
      altStart++;
    }

    return text;
  }

  /**
   * Builds the zeroes for the altitude tape.
   * @returns A collection of zeroes text elements.
   */
  private buildAltitudeTapeZeros(): SVGTextElement[] {
    const zeros: SVGTextElement[] = [];

    for (let i = 0; i < 9; i++) {
      const startX = 149.5;
      const startY = 410 - (i * 100);

      const zeroElement = FSComponent.createRef<SVGTextElement>();
      zeros.push(<text x={startX} y={startY} fill="var(--wt21-colors-white)" text-anchor="end" font-size='30' ref={zeroElement}>00</text>);
      this.altitudeScrollerZeroes.push(zeroElement);
    }

    return zeros;
  }

  /**
   * A method called when a selected altitude value changes from the event bus.
   * @param alt The selected altitude value.
   */
  private updateSelectedAltitude = (alt: number): void => {
    this.selectedAltitude = Math.round(alt);
    // this.controller.updateAltitudeAlerter();
    this.updateSelectedAltitudeBug();
    this.updateSelectedFineAltitudeBug();
  };

  /**
   * A method called to update the location of the Selected Altitude Bug on the altitude tape.
   */
  private updateSelectedAltitudeBug(): void {
    const deltaBug = this.selectedAltitude - this.altitude;
    if (this.altitude >= -2000 && this.altitude <= 99900 && Math.abs(deltaBug) < 400) {
      this.altitudeBugRef.instance.style.transform = `translate3d(0,${-this.pixelPerTick * MathUtils.clamp(deltaBug, -300, 300)}px,0)`;
      this.preselectVisible.set(true);
    } else {
      this.preselectVisible.set(false);
    }
  }

  /**
   * A method called to update the location of the Selected Altitude Fine Bug on the altitude tape.
   */
  private updateSelectedFineAltitudeBug(): void {
    const deltaBug = this.selectedAltitude - this.altitude;
    if (this.altitude >= -2000 && this.altitude <= 99900 && Math.abs(deltaBug) < 1300) {
      this.altitudeFineBugRef.instance.style.transform = `translate3d(0,${-.1525 * MathUtils.clamp(deltaBug, -1300, 1300)}px,0)`;
      this.preselectFineVisible.set(true);
    } else {
      this.preselectFineVisible.set(false);
    }
  }

  /**
   * A method called to update the location of the Baro Minimums Bug on the altitude tape.
   * @param baroMins The new baro minimums value.
   */
  private updateBaroMinimumsBug(baroMins?: number): void {
    if (baroMins !== undefined) { this.baroMinimums = baroMins; }
    const deltaBug = this.baroMinimums - this.altitude;
    if (this.baroMinsEnabled === true && Math.abs(deltaBug) < 400 && this.altitude >= -2000 && this.altitude <= 99900) {
      this.baroMinsBugRef.instance.style.transform = `translate3d(0,${-this.pixelPerTick * MathUtils.clamp(deltaBug, -300, 300)}px,0)`;
      this.baroMinsVisible.set(true);
    } else {
      this.baroMinsVisible.set(false);
    }
  }

  /**
   * A method called to update the location of the Radio Minimums Bug on the altitude tape.
   * @param radioMins The new radio minimums value.
   */
  private updateRadioMinimumsBar(radioMins?: number): void {
    if (radioMins !== undefined) { this.radioMinimums = radioMins; }
    if (this.radioMinsEnabled === true && (this.radioAltitude - this.radioMinimums) < 300) {
      const translation = -this.radioMinimums * this.pixelPerTick;
      this.radioMinsBarRef.instance.style.transform = `translate3d(0,${translation}px, 0)`;
      this.radioMinsVisible.set(true);
    } else {
      this.radioMinsVisible.set(false);
    }
  }

  /**
   * A method called to update the location of the Ground Ribbon on the altitude tape.
   * @param radioAlt The new radio altitude value.
   */
  private updateGroundRibbon(radioAlt: number): void {
    this.radioAltitude = radioAlt;
    if (this.altitude >= -2000 && this.altitude <= 99900 && radioAlt < this.radioMinimums + 300) {
      this.altitudeTapeGroundElement.instance.style.transform = `translate3d(0,${this.pixelPerTick * radioAlt}px, 0)`;
    }
    this.updateRadioMinimumsBar();
  }

  /**
   * Updates the altitude indicator when the altitude changes.
   * @param relativeAlt The new altitude value.
   */
  private updateAltitude(relativeAlt: number): void {
    this.altitude = relativeAlt;
    relativeAlt = relativeAlt + this.altOffset;
    const alt = Math.abs(relativeAlt);
    const altPrefix = relativeAlt < 0 ? -1 : 1;

    this.metricAltitudeValue.set(Math.round(relativeAlt * 0.3048 / 5) * 5);
    this.isBelowMSL.set(relativeAlt < 0);
    this.isTransitingMSL.set(relativeAlt < 20 && relativeAlt > -20);

    const tens = alt % 100;
    const hundreds = (alt % 1000 - tens) / 100;
    const thousands = ((alt - (alt % 1000)) / 1000) % 10;
    const tenThousands = (alt - (alt % 10000)) / 10000;

    if (this.altitudeTenThousandsDataElement.instance !== null) {
      let newTranslation: number;
      if (relativeAlt < 0 || (relativeAlt < -2000 || relativeAlt > 99900)) {
        if (relativeAlt >= -20) {
          newTranslation = -1130 - 3.15 * tens;
        } else {
          newTranslation = -1193;
        }
      } else {
        newTranslation = -470 + (tenThousands * 47) * altPrefix;
        if (thousands === 9 && hundreds == 9 && tens > 80) {
          newTranslation += 2.35 * (tens - 80) * altPrefix;
        }
      }
      this.tenThousandsSvg.instance.style.transform = `translate3d(0px, ${newTranslation}px, 0px)`;
    }
    if (this.altitudeThousandsDataElement.instance !== null) {
      (relativeAlt < 1000 && relativeAlt > -1000) ? this.altitudeThousandsDataElement.instance.classList.add('no-zero') : this.altitudeThousandsDataElement.instance.classList.remove('no-zero');
      let newTranslation: number;
      if (relativeAlt < -2000 || relativeAlt > 99900) {
        newTranslation = -1034;
      } else {
        newTranslation = -470 + (thousands * 47) * altPrefix;
        if (hundreds == 9 && tens > 80) {
          newTranslation += 2.35 * (tens - 80) * altPrefix;
        }
      }
      this.thousandsSvg.instance.style.transform = `translate3d(0px, ${newTranslation}px, 0px)`;
    }
    if (this.altitudeHundredsDataElement.instance !== null) {
      let newTranslation: number;
      if (relativeAlt < -2000 || relativeAlt > 99900) {
        newTranslation = -1034;
      } else {
        newTranslation = -470 + (hundreds * 47) * altPrefix;
        if (tens > 80) {
          newTranslation += 2.35 * (tens - 80) * altPrefix;
        }
      }
      this.hundredsSvg.instance.style.transform = `translate3d(0px, ${newTranslation}px, 0px)`;
    }
    if (this.altitudeTensDataElement.instance !== null) {
      const newTranslation = (relativeAlt < -2000 || relativeAlt > 99900) ? -399 : -168 + (tens * 1.1) * altPrefix;
      this.tensSvg.instance.style.transform = `translate3d(0px, ${newTranslation}px, 0px)`;
    }

    if (this.altitudeTapeTickElement.instance !== null) {
      const offset = relativeAlt >= 0 ? -104 : -4;
      const newTranslation = (relativeAlt < -2000 || relativeAlt > 99900) ? -104 : offset + relativeAlt % 100;
      this.altitudeTapeTickElement.instance.style.transform = `translate(0, ${newTranslation * this.pixelPerTick}px)`;
    }

    if ((relativeAlt / 100 >= this.currentDrawnAlt + 1 || relativeAlt / 100 < this.currentDrawnAlt) && (relativeAlt > -2000 || relativeAlt > 99900)) {
      this.currentDrawnAlt = Math.floor(relativeAlt / 100);
      for (const tick of this.surroundingTicks) {
        tick.instance.style.visibility = 'hidden';
      }
      for (let i = 0; i < this.altitudeScrollerValues.length; i++) {
        const scrollerValue = this.altitudeScrollerValues[i].instance;
        const zeroValue = this.altitudeScrollerZeroes[i].instance;
        if (scrollerValue !== null) {
          if ((i - 4) + this.currentDrawnAlt === 0) {
            scrollerValue.textContent = '00';
            zeroValue.textContent = '00';
            this.surroundingTicks[i * 2].instance.style.visibility = 'visible';
            if (this.surroundingTicks[i * 2 + 1]) {
              this.surroundingTicks[i * 2 + 1].instance.style.visibility = 'visible';
            }
          } else {
            const drawnHundreds = Math.abs(i - 4 + this.currentDrawnAlt);
            scrollerValue.textContent = drawnHundreds % 10 == 0 ? drawnHundreds.toString() : (drawnHundreds % 10).toString();
            if (drawnHundreds % 5 == 0 && i != 8) {
              this.surroundingTicks[i * 2].instance.style.visibility = 'visible';
              this.surroundingTicks[i * 2 + 1].instance.style.visibility = 'visible';
            }
            zeroValue.textContent = '00';
          }
        }
      }
    }
    this.controller.altitude = relativeAlt;
    // this.controller.updateAltitudeAlerter();
    this.updateSelectedAltitudeBug();
    this.updateSelectedFineAltitudeBug();
    this.updateBaroMinimumsBug();
  }

  /**
   * A method called when the alt alerter state is changed.
   * @param state is the altitude alerter state
   */
  private onAlerterStateChanged(state: AltAlertState): void {
    switch (state) {
      case AltAlertState.DISABLED:
      case AltAlertState.ARMED:
        this.altitudeFineBugRef.instance.classList.remove('thousand-flash', 'deviation-flash');
        break;
      case AltAlertState.WITHIN_1000:
        this.altitudeFineBugRef.instance.classList.add('thousand-flash');
        this.altitudeFineBugRef.instance.classList.remove('deviation-flash');
        this.altitudeFineBugDeviationRef.instance.classList.remove('fine-bug-deviation');
        this.altitudeBugRef.instance.classList.remove('deviation-flash');
        this.altitudeBugRef.instance.classList.remove('fine-bug-deviation');
        break;
      case AltAlertState.WITHIN_200:
        this.altitudeFineBugRef.instance.classList.remove('thousand-flash', 'deviation-flash');
        this.altitudeFineBugDeviationRef.instance.classList.remove('fine-bug-deviation');
        this.altitudeBugRef.instance.classList.remove('deviation-flash');
        this.altitudeBugRef.instance.classList.remove('fine-bug-deviation');

        break;
      case AltAlertState.CAPTURED:
        break;
      case AltAlertState.DEVIATION_200:
      case AltAlertState.DEVIATION_1000:
        this.altitudeFineBugRef.instance.classList.add('deviation-flash');
        this.altitudeFineBugDeviationRef.instance.classList.add('fine-bug-deviation');
        this.altitudeBugRef.instance.classList.add('deviation-flash');
        this.altitudeBugRef.instance.classList.add('fine-bug-deviation');
        break;
    }
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div ref={this.altimeterContainerRef}>
        <AltPreselectBox bus={this.props.bus} pfdConfig={this.props.pfdConfig}/>
        <div class="translucent-box altimeter-box">
          <div class="altimeter">
            <div class="altitude-ground-group" ref={this.altitudeTapeGroundElement} style="transform:translate(0,300px)">
              <div class="altitude-radio-mins-bar-container">
                <div class="altitude-radio-mins-bar hidden" ref={this.radioMinsBarRef}></div>
              </div>
              <div class="altitude-ground-ribbon">
                <svg width="140" height="415" viewBox="0 0 140 415">
                  {this.props.pfdConfig.artificialHorizonStyle === 'Full' && this.buildGroundRibbonLines()}
                  <rect
                    fill={`var(--wt21-colors-${this.props.pfdConfig.artificialHorizonStyle === 'Full' ? 'amber' : 'white'})`}
                    stroke={`var(--wt21-colors-${this.props.pfdConfig.artificialHorizonStyle === 'Full' ? 'yellow' : 'white'})`}
                    stroke-width="2"
                    width="140"
                    x="0"
                    height="2" />
                </svg>
              </div>
            </div>

            <div class="altitude-tick-marks">
              <svg viewBox="0 -400 179 800" ref={this.altitudeTapeTickElement}>
                <g class="AltitudeTape" transform="translate(0,0)">
                  {this.buildAltitudeTapeTicks()}
                  {this.buildAltitudeTapeZeros()}
                  {this.buildAltitudeTapeNumbers()}
                </g>
              </svg>
            </div>

            <div class="altitude-preselect-bug hidden" ref={this.altitudeBugRef}>
              <svg viewBox="0 0 31 74">
                <path d="m 2 2 l 25 0 l 0 20 l -13 15 l 13 15 l 0 20 l -25 0" fill="none" stroke="var(--wt21-colors-cyan)" stroke-width="3" />
              </svg>
            </div>

            <div class="altitude-preselect-bug fine-bug hidden" ref={this.altitudeFineBugRef}>
              <svg viewBox="0 0 31 74" >
                <path ref={this.altitudeFineBugDeviationRef} d="m 8 19.5 l 12.5 0 l 0 10 l -6.5 7.5 l 6.5 7.5 l 0 10 l -12.5 0" fill="none" stroke="var(--wt21-colors-cyan)" stroke-width="3" />
              </svg>
            </div>

            <div class="altitude-baro-mins-bug hidden" ref={this.baroMinsBugRef}>
              <svg viewBox="-30 0 67 44">
                <path ref={this.baroMinsBugFlashRef} d="M -34 22 L 21 22 L 36 2 L 36 42 L 21 22 Z" fill="var(--wt21-colors-cyan)" stroke="var(--wt21-colors-cyan)" stroke-width="2" />
              </svg>
            </div>

            <div class="metric-altitude-box hidden" ref={this.metricAltitudeBoxElement}>
              <span class="value">{this.metricAltitudeValue}</span><span class="unit">M</span>
            </div>
            <div class="altitude-box" ref={this.altitudeBoxElement}>
              <svg>
                <path fill="var(--wt21-colors-black)" d="m 1 1 l 85 0 l 0 24 l 8 10 l -8 10 l 0 25 l -85 0 z" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5"></path>
              </svg>

              <div class="scroller alt-ten-thousands-scroller no-zero">
                <svg ref={this.tenThousandsSvg}>
                  <g ref={this.altitudeTenThousandsDataElement}>{this.buildSingleScroller(0, true)}</g>
                </svg>
              </div>

              <div class="scroller alt-thousands-scroller">
                <svg ref={this.thousandsSvg}>
                  <g ref={this.altitudeThousandsDataElement}>{this.buildSingleScroller()}</g>
                </svg>
              </div>

              <div class="scroller alt-hundreds-scroller">
                <svg ref={this.hundredsSvg}>
                  <g ref={this.altitudeHundredsDataElement}>{this.buildSingleScroller()}</g>
                </svg>
              </div>

              <div class="scroller alt-tens-scroller">
                <svg ref={this.tensSvg}>
                  <g ref={this.altitudeTensDataElement}>{this.buildDoubleScroller()}</g>
                </svg>
              </div>
            </div>
          </div>
          <div class="fail-box">
            ALT
          </div>
        </div>
        <div class="altimeter-baro-preset-box">
          <BaroPreset bus={this.props.bus} performancePlan={this.props.performancePlan} />
        </div>
      </div>
    );
  }
}
