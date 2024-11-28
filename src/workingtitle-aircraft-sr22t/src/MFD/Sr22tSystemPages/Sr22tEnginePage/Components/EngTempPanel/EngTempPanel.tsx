import {
  ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, MappedSubject, MathUtils, NumberFormatter, Subject, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { Sr22tSimvarEvents } from '../../../../Sr22tSimvarPublisher/Sr22tSimvarPublisher';
import { LeanAssistPhase, Sr22tLeanAssistCalculator } from './Sr22tLeanAssistCalculator';

import './EngTempPanel.css';

/** Props for an Engine Temp Panel */
export interface EngTempPanelProps extends ComponentProps {
  /** The event bus */
  bus: EventBus,
}

/** Engine Temp Panel component */
export class EngTempPanel extends DisplayComponent<EngTempPanelProps> {

  private subs: Subscription[] = [];

  // Bar properties
  private readonly barColor = '#00f600';
  private readonly maxBarHeight = 176;           // px
  private readonly barWidth = 13;                // px
  private readonly horizontalBarSpacing = 26.2;  // px
  private readonly chtBarsXOrigin = 91;          // px
  private readonly egtBarsXOrigin = 443;         // px
  private readonly egtBarHeightResolution = 800 / this.maxBarHeight; // 800 = maxVal - minVal;

  // Cylinder SimVars
  private CHT_1_Subject = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tSimvarEvents>().on('c1_head_temp').withPrecision(0), 0);  // Fahrenheit
  private CHT_2_Subject = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tSimvarEvents>().on('c2_head_temp').withPrecision(0), 0);  // Fahrenheit
  private CHT_3_Subject = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tSimvarEvents>().on('c3_head_temp').withPrecision(0), 0);  // Fahrenheit
  private CHT_4_Subject = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tSimvarEvents>().on('c4_head_temp').withPrecision(0), 0);  // Fahrenheit
  private CHT_5_Subject = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tSimvarEvents>().on('c5_head_temp').withPrecision(0), 0);  // Fahrenheit
  private CHT_6_Subject = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tSimvarEvents>().on('c6_head_temp').withPrecision(0), 0);  // Fahrenheit

  // Leaning Assist Mode Calculator
  private leanAssistCalculator = new Sr22tLeanAssistCalculator(this.props.bus);

  private readonly deltaPeakRef = FSComponent.createRef<HTMLDivElement>();

  private readonly egtBarLabel1Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly egtBarLabel2Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly egtBarLabel3Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly egtBarLabel4Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly egtBarLabel5Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly egtBarLabel6Ref = FSComponent.createRef<HTMLDivElement>();

  private readonly egtBarLabelRefArray = [
    this.egtBarLabel1Ref,
    this.egtBarLabel2Ref,
    this.egtBarLabel3Ref,
    this.egtBarLabel4Ref,
    this.egtBarLabel5Ref,
    this.egtBarLabel6Ref,
  ];

  private readonly egtPeakBox1Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly egtPeakBox2Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly egtPeakBox3Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly egtPeakBox4Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly egtPeakBox5Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly egtPeakBox6Ref = FSComponent.createRef<HTMLDivElement>();

  private readonly egtPeakBoxRefArray = [
    this.egtPeakBox1Ref,
    this.egtPeakBox2Ref,
    this.egtPeakBox3Ref,
    this.egtPeakBox4Ref,
    this.egtPeakBox5Ref,
    this.egtPeakBox6Ref,
  ];

  private readonly egtPeakMarker1Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly egtPeakMarker2Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly egtPeakMarker3Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly egtPeakMarker4Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly egtPeakMarker5Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly egtPeakMarker6Ref = FSComponent.createRef<HTMLDivElement>();

  private readonly egtPeakMarkerRefArray = [
    this.egtPeakMarker1Ref,
    this.egtPeakMarker2Ref,
    this.egtPeakMarker3Ref,
    this.egtPeakMarker4Ref,
    this.egtPeakMarker5Ref,
    this.egtPeakMarker6Ref,
  ];

  // Turbine Sim Vars
  private TIT_1_Subject = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tSimvarEvents>().on('t1_inlet_temp').withPrecision(0), 0);  // Fahrenheit
  private TIT_2_Subject = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tSimvarEvents>().on('t2_inlet_temp').withPrecision(0), 0);  // Fahrenheit

  private readonly egtTempFormatter = NumberFormatter.create({ precision: 5 });

  private barInfoArray = [
    // CHT Bars
    {
      barOrigin: {
        x: this.chtBarsXOrigin + (0 * this.horizontalBarSpacing),
        y: 469,
      },
      numberPosition: {
        x: this.chtBarsXOrigin + (0 * this.horizontalBarSpacing) + (this.barWidth / 2),
        y: 285,
      },
      minVal: 100,
      maxVal: 500,
      mappedSubject: MappedSubject.create(
        ([temp]): number => {
          return temp;
        },
        this.CHT_1_Subject
      ),
      outputSubject: Subject.create(''),
      barRef: FSComponent.createRef<SVGRectElement>(),
    },
    {
      barOrigin: {
        x: this.chtBarsXOrigin + (1 * this.horizontalBarSpacing),
        y: 469,
      },
      numberPosition: {
        x: this.chtBarsXOrigin + (1 * this.horizontalBarSpacing) + (this.barWidth / 2),
        y: 259,
      },
      minVal: 100,
      maxVal: 500,
      mappedSubject: MappedSubject.create(
        ([temp]): number => {
          return temp;
        },
        this.CHT_2_Subject
      ),
      outputSubject: Subject.create(''),
      barRef: FSComponent.createRef<SVGRectElement>(),
    },
    {
      barOrigin: {
        x: this.chtBarsXOrigin + (2 * this.horizontalBarSpacing),
        y: 469,
      },
      numberPosition: {
        x: this.chtBarsXOrigin + (2 * this.horizontalBarSpacing) + (this.barWidth / 2),
        y: 285,
      },
      minVal: 100,
      maxVal: 500,
      mappedSubject: MappedSubject.create(
        ([temp]): number => {
          return temp;
        },
        this.CHT_3_Subject
      ),
      outputSubject: Subject.create(''),
      barRef: FSComponent.createRef<SVGRectElement>(),
    },
    {
      barOrigin: {
        x: this.chtBarsXOrigin + (3 * this.horizontalBarSpacing),
        y: 469,
      },
      numberPosition: {
        x: this.chtBarsXOrigin + (3 * this.horizontalBarSpacing) + (this.barWidth / 2),
        y: 259,
      },
      minVal: 100,
      maxVal: 500,
      mappedSubject: MappedSubject.create(
        ([temp]): number => {
          return temp;
        },
        this.CHT_4_Subject
      ),
      outputSubject: Subject.create(''),
      barRef: FSComponent.createRef<SVGRectElement>(),
    },
    {
      barOrigin: {
        x: this.chtBarsXOrigin + (4 * this.horizontalBarSpacing),
        y: 469,
      },
      numberPosition: {
        x: this.chtBarsXOrigin + (4 * this.horizontalBarSpacing) + (this.barWidth / 2),
        y: 285,
      },
      minVal: 100,
      maxVal: 500,
      mappedSubject: MappedSubject.create(
        ([temp]): number => {
          return temp;
        },
        this.CHT_5_Subject
      ),
      outputSubject: Subject.create(''),
      barRef: FSComponent.createRef<SVGRectElement>(),
    },
    {
      barOrigin: {
        x: this.chtBarsXOrigin + (5 * this.horizontalBarSpacing),
        y: 469,
      },
      numberPosition: {
        x: this.chtBarsXOrigin + (5 * this.horizontalBarSpacing) + (this.barWidth / 2),
        y: 259,
      },
      minVal: 100,
      maxVal: 500,
      mappedSubject: MappedSubject.create(
        ([temp]): number => {
          return temp;
        },
        this.CHT_6_Subject
      ),
      outputSubject: Subject.create(''),
      barRef: FSComponent.createRef<SVGRectElement>(),
    },

    // TIT Bars
    {
      barOrigin: {
        x: 265.5,
        y: 469,
      },
      numberPosition: {
        x: 289,
        y: 274,
      },
      labelClass: 'bar-label-large',
      minVal: 1000,
      maxVal: 1800,
      mappedSubject: MappedSubject.create(
        ([temp]): number => {
          return temp;
        },
        this.TIT_1_Subject
      ),
      outputSubject: Subject.create(''),
      barRef: FSComponent.createRef<SVGRectElement>(),
    },
    {
      barOrigin: {
        x: 349,
        y: 469,
      },
      numberPosition: {
        x: 341,
        y: 274,
      },
      labelClass: 'bar-label-large',
      minVal: 1000,
      maxVal: 1800,
      mappedSubject: MappedSubject.create(
        ([temp]): number => {
          return temp;
        },
        this.TIT_2_Subject
      ),
      outputSubject: Subject.create(''),
      barRef: FSComponent.createRef<SVGRectElement>(),
    },
  ];

  /** EGT Bars */
  private readonly egtBarInfoArray = [
    {
      barOrigin: {
        x: this.egtBarsXOrigin + (0 * this.horizontalBarSpacing),
        y: 469,
      },
      numberPosition: {
        x: 1 + this.egtBarsXOrigin + (0 * this.horizontalBarSpacing) + (this.barWidth / 2),
        y: 285,
      },
      minVal: 1000,
      maxVal: 1800,
      value: this.leanAssistCalculator.EGT_1,
      outputSubject: Subject.create(''),
      barRef: FSComponent.createRef<SVGRectElement>(),
      peakMarkerRef: this.egtPeakMarker1Ref,
      peakBoxRef: this.egtPeakBox1Ref,
      barLabelRef: this.egtBarLabel1Ref,
    },
    {
      barOrigin: {
        x: this.egtBarsXOrigin + (1 * this.horizontalBarSpacing),
        y: 469,
      },
      numberPosition: {
        x: 1 + this.egtBarsXOrigin + (1 * this.horizontalBarSpacing) + (this.barWidth / 2),
        y: 259,
      },
      minVal: 1000,
      maxVal: 1800,
      value: this.leanAssistCalculator.EGT_2,
      outputSubject: Subject.create(''),
      barRef: FSComponent.createRef<SVGRectElement>(),
      peakMarkerRef: this.egtPeakMarker2Ref,
      peakBoxRef: this.egtPeakBox2Ref,
      barLabelRef: this.egtBarLabel2Ref,
    },
    {
      barOrigin: {
        x: this.egtBarsXOrigin + (2 * this.horizontalBarSpacing),
        y: 469,
      },
      numberPosition: {
        x: 1 + this.egtBarsXOrigin + (2 * this.horizontalBarSpacing) + (this.barWidth / 2),
        y: 285,
      },
      minVal: 1000,
      maxVal: 1800,
      value: this.leanAssistCalculator.EGT_3,
      outputSubject: Subject.create(''),
      barRef: FSComponent.createRef<SVGRectElement>(),
      peakMarkerRef: this.egtPeakMarker3Ref,
      peakBoxRef: this.egtPeakBox3Ref,
      barLabelRef: this.egtBarLabel3Ref,
    },
    {
      barOrigin: {
        x: this.egtBarsXOrigin + (3 * this.horizontalBarSpacing),
        y: 469,
      },
      numberPosition: {
        x: 1 + this.egtBarsXOrigin + (3 * this.horizontalBarSpacing) + (this.barWidth / 2),
        y: 259,
      },
      minVal: 1000,
      maxVal: 1800,
      value: this.leanAssistCalculator.EGT_4,
      outputSubject: Subject.create(''),
      barRef: FSComponent.createRef<SVGRectElement>(),
      peakMarkerRef: this.egtPeakMarker4Ref,
      peakBoxRef: this.egtPeakBox4Ref,
      barLabelRef: this.egtBarLabel4Ref,
    },
    {
      barOrigin: {
        x: this.egtBarsXOrigin + (4 * this.horizontalBarSpacing),
        y: 469,
      },
      numberPosition: {
        x: 1 + this.egtBarsXOrigin + (4 * this.horizontalBarSpacing) + (this.barWidth / 2),
        y: 285,
      },
      minVal: 1000,
      maxVal: 1800,
      value: this.leanAssistCalculator.EGT_5,
      outputSubject: Subject.create(''),
      barRef: FSComponent.createRef<SVGRectElement>(),
      peakMarkerRef: this.egtPeakMarker5Ref,
      peakBoxRef: this.egtPeakBox5Ref,
      barLabelRef: this.egtBarLabel5Ref,
    },
    {
      barOrigin: {
        x: this.egtBarsXOrigin + (5 * this.horizontalBarSpacing),
        y: 469,
      },
      numberPosition: {
        x: 1 + this.egtBarsXOrigin + (5 * this.horizontalBarSpacing) + (this.barWidth / 2),
        y: 259,
      },
      minVal: 1000,
      maxVal: 1800,
      value: this.leanAssistCalculator.EGT_6,
      outputSubject: Subject.create(''),
      barRef: FSComponent.createRef<SVGRectElement>(),
      peakMarkerRef: this.egtPeakMarker6Ref,
      peakBoxRef: this.egtPeakBox6Ref,
      barLabelRef: this.egtBarLabel6Ref,
    },
  ];

  /** @inheritdoc */
  public onAfterRender(): void {
    // Add subscriptions to subs array
    this.subs.push(
      this.CHT_1_Subject,
      this.CHT_2_Subject,
      this.CHT_3_Subject,
      this.CHT_4_Subject,
      this.CHT_5_Subject,
      this.CHT_6_Subject,
      this.TIT_1_Subject,
      this.TIT_2_Subject,
      this.leanAssistCalculator.leanAssistActivated.sub((leanAssistActivated: boolean) => {
        this.deltaPeakRef.instance.style.display = leanAssistActivated ? '' : 'none';

        if (!leanAssistActivated) {
          this.resetEgtBarLabels();
          this.resetEgtPeakMarkers();
          this.egtPeakBoxRefArray.forEach((ref) => ref.instance.classList.remove('focus'));
        }
      }, true),
    );

    for (let barIndex = 0; barIndex < this.barInfoArray.length; barIndex++) {
      this.subs.push(
        this.barInfoArray[barIndex].mappedSubject.sub((v) => {
          this.updateBar(barIndex, v);
        }, true),
      );
    }

    for (let barIndex = 0; barIndex < this.egtBarInfoArray.length; barIndex++) {
      this.subs.push(
        this.egtBarInfoArray[barIndex].value.sub((barValue) => {
          this.updateEgtBar(barIndex, barValue);
        }, true),
      );
    }
  }

  /** Maps a number from one range to another
   * @param numberIn self-explanatory
   * @param inMin self-explanatory
   * @param inMax self-explanatory
   * @param outMin self-explanatory
   * @param outMax self-explanatory
   * @returns self-explanatory
   */
  private map(numberIn: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return (((numberIn - inMin) / (inMax - inMin)) * (outMax - outMin)) + outMin;
  }

  /**
   * Renders the chart axes, their unit readouts, the vertical dotted lines,
   * and the numeric labels of the bar gauges (at the bottom of the chart).
   * @returns A VNode.
   **/
  private renderStaticSVG(): VNode {
    return (
      <svg class="eng-temp-panel-static" width="1024" height="687" viewBox="0 0 1024 687">
        <g>
          <defs id="defs1">
            <linearGradient id="linearGradient155" x1="82.473" x2="82.473" y1="132.74" y2="94.76" gradientUnits="userSpaceOnUse">
              <stop id="stop154-6" offset=".92293" />
              <stop id="stop155-8" stop-color="#454545" offset="1" />
            </linearGradient>
          </defs>
          <path id="rect5" transform="matrix(7.155 0 0 7.155 -242.25 -451.32)" d="m37.833 94.76h89.281a1.3229 1.3229 45 011.3229 1.3229v35.333a1.3229 1.3229 135 01-1.3229 1.3229h-89.281a1.3229 1.3229 45 01-1.3229-1.3229v-35.333a1.3229 1.3229 135 011.3229-1.3229z" fill="url(#linearGradient155)" stroke="#9f9f9f" stroke-linecap="square" stroke-width=".26458" />
          <rect id="rect2" x="40.958" y="220.84" width="161.38" height="16.512" />
          <g fill="none" stroke="#fff" stroke-width="1.8931">
            <path id="path26" d="m97.428 468.82v-178.29" stroke-dasharray="3.40757, 2.83964" />
            <g stroke-dasharray="3.40756, 2.83963">
              <path id="path27" d="m150.02 468.82v-178.29" />
              <path id="path28" d="m202.61 468.82v-178.29" />
              <path id="path29" d="m123.72 468.82v-204.82" />
              <path id="path30" d="m176.31 468.82v-204.82" />
              <path id="path31" d="m228.91 468.82v-204.82" />
            </g>
          </g>
          <rect id="rect39" x="64.549" y="310.3" width="8.4006" height="17.343" fill="#ff0" />
          <rect id="rect38" x="64.549" y="292.96" width="8.4006" height="17.343" fill="#f00" />
          <g fill="none" stroke="#fff" stroke-width="1.8931">
            <g>
              <path id="path32" d="m78.629 292.96h-14.08v175.86h14.08" />
              <path id="path33" d="m78.629 337.09h-14.08" />
              <path id="path34" d="m78.629 380.89h-14.08" />
              <path id="path35" d="m78.629 424.68h-14.08" />
              <path id="path36" d="m73.778 358.99h-9.2288" />
              <path id="path37" d="m73.778 402.79h-9.2288" />
              <path id="path38" d="m73.778 446.58h-9.2288" />
            </g>
            <g stroke-dasharray="3.40756, 2.83963">
              <path id="path60" d="m449.96 468.82v-178.29" />
              <path id="path61" d="m502.55 468.82v-178.29" />
              <path id="path62" d="m555.14 468.82v-178.29" />
              <path id="path63" d="m476.25 468.82v-204.82" />
              <path id="path64" d="m528.84 468.82v-204.82" />
              <path id="path65" d="m581.43 468.82v-204.82" />
            </g>
            <g>
              <path id="path66" d="m431.16 292.96h-14.08v175.86h14.08" />
              <path id="path67" d="m431.16 337.09h-14.08" />
              <path id="path68" d="m431.16 380.89h-14.08" />
              <path id="path69" d="m431.16 424.68h-14.08" />
            </g>
          </g>
          <rect id="rect148" x="335.5" y="292.96" width="5.6793" height="11.841" fill="#f00" />
          <g fill="none" stroke="#fff" stroke-width="1.8931">
            <path id="path131" d="m345.64 292.96h-10.148v175.86h10.148" />
            <path id="path132" d="m345.64 337.09h-10.148" />
            <path id="path133" d="m345.64 380.89h-10.148" />
            <path id="path134" d="m345.64 424.68h-10.148" />
          </g>
          <rect id="rect150" transform="scale(-1,1)" x="-291.75" y="292.96" width="5.6793" height="11.841" fill="#f00" />
          <g fill="none" stroke="#fff" stroke-width="1.8931">
            <path id="path150" d="m281.6 292.96h10.148v175.86h-10.148" />
            <path id="path151" d="m281.6 337.09h10.148" />
            <path id="path152" d="m281.6 380.89h10.148" />
            <path id="path153" d="m281.6 424.68h10.148" />
          </g>
          <g fill="#fff" stroke-linecap="square">
            <path id="text1" transform="matrix(1.2953 0 0 1.2953 66.307 -318.71)" d="m-13.665 422.15h-4.1081v3.3594h4.7721v1.0221h-6.0221v-9.4791h5.957v1.0286h-4.707v3.0469h4.1081zm3.1706-2.6628.03906.88542q.80729-1.0156 2.1094-1.0156 2.2331 0 2.2526 2.5195v4.6549h-1.2044v-4.6614q-.00651-.76172-.35156-1.1263-.33854-.36458-1.0612-.36458-.58594 0-1.0286.3125-.44271.3125-.6901.82031v5.0195h-1.2044v-7.0443zm5.931 3.4635q0-1.6471.76172-2.6172.76172-.97656 2.0182-.97656 1.2891 0 2.0117.91145l.058594-.78125h1.1003v6.875q0 1.3672-.8138 2.1549-.80729.78776-2.1745.78776-.76172 0-1.4909-.32552t-1.1133-.89193l.625-.72265q.77474.95703 1.8945.95703.8789 0 1.3672-.49479.49479-.49479.49479-1.3932v-.60547q-.72265.83334-1.9727.83334-1.237 0-2.0052-.9961-.76172-.99609-.76172-2.7148zm1.2109.13672q0 1.1914.48828 1.875.48828.67708 1.3672.67708 1.1393 0 1.6732-1.0352v-3.2161q-.55338-1.0091-1.6602-1.0091-.8789 0-1.3737.68359t-.49479 2.0247zm7.8646 3.444h-1.2044v-7.0443h1.2044zm-1.3021-8.9127q0-.29297.17578-.49479.18229-.20182.53385-.20182.35156 0 .53385.20182t.18229.49479-.18229.48828-.53385.19531q-.35156 0-.53385-.19531-.17578-.19531-.17578-.48828zm4.3685 1.8685.039062.88542q.80729-1.0156 2.1094-1.0156 2.2331 0 2.2526 2.5195v4.6549h-1.2044v-4.6614q-.0065-.76172-.35156-1.1263-.33854-.36458-1.0612-.36458-.58594 0-1.0286.3125t-.6901.82031v5.0195h-1.2044v-7.0443zm9.1406 7.1745q-1.4323 0-2.3307-.9375-.89844-.94401-.89844-2.5195v-.22135q0-1.0482.39714-1.8685.40364-.82682 1.1198-1.289.72266-.46875 1.5625-.46875 1.3737 0 2.1354.90494.76172.90495.76172 2.5911v.5013h-4.7721q.02604 1.0417.60547 1.6862.58594.63802 1.4844.63802.63802 0 1.0807-.26042t.77474-.6901l.73568.57291q-.88541 1.3607-2.6562 1.3607zm-.14974-6.3151q-.72916 0-1.224.53385-.49479.52734-.61198 1.4844h3.5286v-.0911q-.05208-.91797-.49479-1.4193-.44271-.50781-1.1979-.50781zm14.069-2.2656h-3.0469v8.4505h-1.2435v-8.4505h-3.0404v-1.0286h7.3307zm3.4961 8.5807q-1.4323 0-2.3307-.9375-.89844-.94401-.89844-2.5195v-.22135q0-1.0482.39713-1.8685.40364-.82682 1.1198-1.289.72265-.46875 1.5625-.46875 1.3737 0 2.1354.90494.76172.90495.76172 2.5911v.5013h-4.7721q.02604 1.0417.60547 1.6862.58594.63802 1.4844.63802.63802 0 1.0807-.26042.44271-.26042.77474-.6901l.73568.57291q-.88541 1.3607-2.6562 1.3607zm-.14974-6.3151q-.72916 0-1.224.53385-.49479.52734-.61198 1.4844h3.5286v-.0911q-.05208-.91797-.49479-1.4193-.44271-.50781-1.1979-.50781zm5.4232-.85938.03255.78125q.77474-.91145 2.0898-.91145 1.4779 0 2.0117 1.1328.35156-.50781.91146-.82031.5664-.3125 1.3346-.3125 2.3177 0 2.3568 2.4544v4.72h-1.2044v-4.6484q0-.7552-.34505-1.1263-.34505-.3776-1.1589-.3776-.67057 0-1.1133.40364-.44271.39714-.51432 1.0742v4.6745h-1.2109v-4.6159q0-1.5364-1.5039-1.5364-1.1849 0-1.6211 1.0091v5.1432h-1.2044v-7.0443zm16.504 3.6003q0 1.6081-.73568 2.5911-.73568.98307-1.9922.98307-1.2825 0-2.0182-.8138v3.3919h-1.2044v-9.7526h1.1003l.05859.78125q.73568-.91145 2.0443-.91145 1.2695 0 2.0052.95703.74218.95702.74218 2.6628zm-1.2044-.13672q0-1.1914-.50781-1.8815t-1.3932-.6901q-1.0937 0-1.6406.97005v3.3659q.54036.96354 1.6536.96354.86588 0 1.3737-.6836.51432-.6901.51432-2.0443zm5.6575 3.7109q-1.4323 0-2.3307-.9375-.89844-.94401-.89844-2.5195v-.22135q0-1.0482.39713-1.8685.40364-.82682 1.1198-1.289.72265-.46875 1.5625-.46875 1.3737 0 2.1354.90494.76172.90495.76172 2.5911v.5013h-4.7721q.02604 1.0417.60547 1.6862.58594.63802 1.4844.63802.63802 0 1.0807-.26042.44271-.26042.77474-.6901l.73568.57291q-.88541 1.3607-2.6562 1.3607zm-.14974-6.3151q-.72916 0-1.224.53385-.49479.52734-.61198 1.4844h3.5286v-.0911q-.05208-.91797-.49479-1.4193-.44271-.50781-1.1979-.50781zm7.6953.22135q-.27344-.0456-.59245-.0456-1.1849 0-1.6081 1.0091v5h-1.2044v-7.0443h1.1719l.01953.8138q.59245-.944 1.6797-.944.35156 0 .53385.0911zm5.1953 5.9635q-.10417-.20833-.16927-.74219-.83984.8724-2.0052.8724-1.0417 0-1.7122-.58594-.66406-.59245-.66406-1.4974 0-1.1003.83333-1.7057.83984-.61197 2.3568-.61197h1.1719v-.55339q0-.63151-.3776-1.0026-.3776-.3776-1.1133-.3776-.64453 0-1.0807.32552t-.4362.78775h-1.2109q0-.52734.37109-1.0156.3776-.49479 1.0156-.78125.64453-.28645 1.4128-.28645 1.2174 0 1.9075.61197.6901.60547.71614 1.6732v3.2422q0 .97005.2474 1.543v.10417zm-1.9987-.91797q.5664 0 1.0742-.29297.50781-.29296.73568-.76171v-1.4453h-.94401q-2.2135 0-2.2135 1.2956 0 .5664.3776.88541t.97005.31901zm6.5364-7.832v1.7057h1.3151v.93099h-1.3151v4.3685q0 .42318.17578.63802.17578.20833.59896.20833.20833 0 .57292-.0781v.97656q-.47526.13021-.92448.13021-.80729 0-1.2174-.48828t-.41016-1.3867v-4.3685h-1.2825v-.93099h1.2825v-1.7057zm7.0703 8.0534q-.70312.82682-2.0638.82682-1.1263 0-1.7187-.65104-.58594-.65755-.59245-1.9401v-4.5833h1.2044v4.5508q0 1.6016 1.3021 1.6016 1.3802 0 1.8359-1.0286v-5.1237h1.2044v7.0443h-1.1458zm6.4062-5.2669q-.27344-.0456-.59245-.0456-1.1849 0-1.6081 1.0091v5h-1.2044v-7.0443h1.1719l.01953.8138q.59245-.944 1.6797-.944.35156 0 .53385.0911zm3.9062 6.0937q-1.4323 0-2.3307-.9375-.89844-.94401-.89844-2.5195v-.22135q0-1.0482.39713-1.8685.40364-.82682 1.1198-1.289.72266-.46875 1.5625-.46875 1.3737 0 2.1354.90494.76172.90495.76172 2.5911v.5013h-4.7721q.02604 1.0417.60547 1.6862.58594.63802 1.4844.63802.63802 0 1.0807-.26042t.77474-.6901l.73568.57291q-.88542 1.3607-2.6562 1.3607zm-.14974-6.3151q-.72916 0-1.224.53385-.49479.52734-.61198 1.4844h3.5286v-.0911q-.05208-.91797-.49479-1.4193-.44271-.50781-1.1979-.50781zm8.3919 4.3164q0-.48828-.37109-.7552-.36459-.27344-1.2826-.46875-.91146-.19531-1.4518-.46875-.53386-.27344-.79427-.65104-.25391-.3776-.25391-.89844 0-.86588.72916-1.4648.73567-.59895 1.875-.59895 1.1979 0 1.9401.61848.7487.61849.7487 1.582h-1.2109q0-.49479-.42317-.85286-.41667-.35807-1.0547-.35807-.65755 0-1.0286.28646-.37109.28645-.37109.74869 0 .4362.34505.65755.34505.22136 1.2435.42318.90495.20182 1.4648.48177.5599.27994.82683.67708.27343.39062.27343.95703 0 .94401-.7552 1.5169-.75521.56641-1.9596.56641-.84636 0-1.4974-.29948-.65104-.29948-1.0221-.83333-.36458-.54037-.36458-1.1654h1.2044q.0326.60547.48177.96354.45573.35157 1.1979.35157.68359 0 1.0937-.27344.41667-.27995.41667-.74219z" style="white-space:pre" aria-label="Engine Temperatures" />
            <path id="text2" transform="matrix(1.2953 0 0 1.2953 .3803 -289.59)" d="m29.906 423.52q-.17578 1.5039-1.1133 2.3242-.93099.8138-2.4805.8138-1.6797 0-2.6953-1.2044-1.0091-1.2044-1.0091-3.2226v-.91145q0-1.3216.46875-2.3242.47526-1.0026 1.3411-1.5364.86588-.54036 2.0052-.54036 1.5104 0 2.4219.84635.91146.83984 1.0612 2.3307h-1.2565q-.16276-1.1328-.70963-1.6406-.54036-.50781-1.5169-.50781-1.1979 0-1.8815.88541-.67708.88542-.67708 2.5195v.91797q0 1.543.64453 2.4544.64453.91145 1.8034.91145 1.0417 0 1.595-.46875.55989-.47526.74219-1.6471zm8.9909 3.0078h-1.2565v-4.3815h-4.7786v4.3815h-1.25v-9.4791h1.25v4.0755h4.7786v-4.0755h1.2565zm8.5807-8.4505h-3.0469v8.4505h-1.2435v-8.4505h-3.0404v-1.0286h7.3307zm4.1927.53385q0-.67708.48177-1.1849.48828-.50781 1.1784-.50781.67708 0 1.1523.50781.48177.5013.48177 1.1849 0 .6901-.48177 1.1784-.47526.48828-1.1523.48828-.68359 0-1.1719-.48828t-.48828-1.1784zm1.6602.83333q.35156 0 .59245-.22786.24088-.23438.24088-.60547 0-.3776-.24088-.61849-.24088-.24739-.59245-.24739-.35807 0-.60547.26041-.24088.25391-.24088.60547t.24088.59245q.2474.24088.60547.24088zm8.8021 2.8971h-3.9779v4.1862h-1.25v-9.4791h5.8724v1.0286h-4.6224v3.2422h3.9779z" style="white-space:pre" aria-label="CHT °F" />
            <path id="text40" transform="matrix(1.0683 0 0 1.0683 52.893 26.31)" d="m43.507 426.53h-1.2109v-8.0273l-2.4284.89193v-1.0938l3.4505-1.2956h.1888z" style="white-space:pre" aria-label="1" />
            <path id="text42" transform="matrix(1.0683 0 0 1.0683 78.253 26.31)" d="m45.759 426.53h-6.2109v-.86589l3.2812-3.6458q.72916-.82682 1.0026-1.3411.27995-.52083.27995-1.0742 0-.74218-.44922-1.2174-.44922-.47526-1.1979-.47526-.89844 0-1.3997.51432-.49479.50781-.49479 1.4193h-1.2044q0-1.3086.83984-2.1159.84635-.80729 2.2591-.80729 1.3216 0 2.0898.69661.76823.6901.76823 1.8424 0 1.3997-1.7838 3.3333l-2.5391 2.7539h4.7591z" style="white-space:pre" aria-label="2" />
            <path id="text43" transform="matrix(1.0683 0 0 1.0683 104.75 26.31)" d="m41.299 421.2h.90495q.85286-.013 1.3411-.44922.48828-.43619.48828-1.1784 0-1.6667-1.6602-1.6667-.78125 0-1.25.44922-.46224.4427-.46224 1.1784h-1.2044q0-1.1263.82031-1.8685.82682-.74869 2.0963-.74869 1.3411 0 2.1029.70963.76172.70963.76172 1.9726 0 .61849-.40364 1.1979-.39714.57942-1.0872.86588.78125.24739 1.2044.82031.42969.57291.42969 1.3997 0 1.276-.83333 2.0247t-2.168.7487-2.1745-.72266q-.83333-.72265-.83333-1.9076h1.2109q0 .7487.48828 1.1979t1.3086.44922q.87239 0 1.3346-.45573.46224-.45573.46224-1.3086 0-.82682-.50781-1.2695t-1.4648-.45573h-.90495z" style="white-space:pre" aria-label="3" />
            <path id="text44" transform="matrix(1.0683 0 0 1.0683 130.88 26.31)" d="m44.633 423.35h1.3151v.98307h-1.3151v2.2005h-1.2109v-2.2005h-4.3164v-.70963l4.2448-6.569h1.2825zm-4.1601 0h2.9492v-4.6484l-.14323.26041z" style="white-space:pre" aria-label="4" />
            <path id="text45" transform="matrix(1.0683 0 0 1.0683 156.95 26.31)" d="m40.102 421.78.48177-4.7266h4.8568v1.1133h-3.8346l-.28646 2.5846q.69661-.41015 1.582-.41015 1.2956 0 2.0573.85937.76172.85286.76172 2.3112 0 1.4648-.79427 2.3112-.78776.83985-2.207.83985-1.2565 0-2.0508-.69662-.79427-.69661-.90494-1.9271h1.1393q.11068.8138.57942 1.2305.46875.41016 1.237.41016.83984 0 1.3151-.57292.48177-.57292.48177-1.582 0-.95052-.52083-1.5234-.51432-.57943-1.3737-.57943-.78776 0-1.237.34505l-.31901.26042z" style="white-space:pre" aria-label="5" />
            <path id="text46" transform="matrix(1.0683 0 0 1.0683 183.38 26.31)" d="m44.275 417.04v1.0221h-.22135q-1.4062.026-2.2396.83333-.83333.80729-.96354 2.2721.7487-.85937 2.0443-.85937 1.237 0 1.9727.87239.74218.87239.74218 2.2526 0 1.4648-.80078 2.3437-.79427.87891-2.1354.87891-1.3607 0-2.207-1.0417-.84635-1.0482-.84635-2.6953v-.46224q0-2.6172 1.1133-3.9974 1.1198-1.3867 3.3268-1.4193zm-1.582 4.2708q-.61849 0-1.1393.37109t-.72266.93099v.4427q0 1.1719.52734 1.888.52734.71614 1.3151.71614.8138 0 1.276-.59895.46875-.59896.46875-1.569 0-.97656-.47526-1.5755-.46875-.60546-1.25-.60546z" style="white-space:pre" aria-label="6" />
            <path id="text52" transform="matrix(1.2953 0 0 1.2953 -9.2946 -209.24)" d="m37.146 423.35h1.3151v.98307h-1.3151v2.2005h-1.2109v-2.2005h-4.3164v-.70963l4.2448-6.569h1.2825zm-4.1601 0h2.9492v-4.6484l-.14323.26041zm12.506-.85937q0 2.1159-.72265 3.1445-.72266 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72266-3.1055.72265-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72266.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745zm8.6914 1.6471q0 2.1159-.72266 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055.72266-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72265.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745z" style="white-space:pre" aria-label="400" />
            <path id="text53" transform="matrix(1.2953 0 0 1.2953 -9.2946 -165.44)" d="m33.813 421.2h.90495q.85286-.013 1.3411-.44922.48828-.43619.48828-1.1784 0-1.6667-1.6602-1.6667-.78125 0-1.25.44922-.46224.4427-.46224 1.1784h-1.2044q0-1.1263.82031-1.8685.82682-.74869 2.0963-.74869 1.3411 0 2.1029.70963t.76172 1.9726q0 .61849-.40364 1.1979-.39713.57942-1.0872.86588.78125.24739 1.2044.82031.42969.57291.42969 1.3997 0 1.276-.83333 2.0247-.83333.7487-2.168.7487t-2.1745-.72266q-.83333-.72265-.83333-1.9076h1.2109q0 .7487.48828 1.1979t1.3086.44922q.87239 0 1.3346-.45573.46224-.45573.46224-1.3086 0-.82682-.50781-1.2695-.50781-.44271-1.4648-.45573h-.90495zm11.68 1.2826q0 2.1159-.72265 3.1445-.72266 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72266-3.1055.72265-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72266.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745zm8.6914 1.6471q0 2.1159-.72266 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055.72266-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72265.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745z" style="white-space:pre" aria-label="300" />
            <path id="text54" transform="matrix(1.2953 0 0 1.2953 -9.2946 -121.64)" d="m38.272 426.53h-6.2109v-.86589l3.2812-3.6458q.72916-.82682 1.0026-1.3411.27995-.52083.27995-1.0742 0-.74218-.44922-1.2174-.44922-.47526-1.1979-.47526-.89844 0-1.3997.51432-.49479.50781-.49479 1.4193h-1.2044q0-1.3086.83984-2.1159.84635-.80729 2.2591-.80729 1.3216 0 2.0898.69661.76823.6901.76823 1.8424 0 1.3997-1.7838 3.3333l-2.5391 2.7539h4.7591zm7.22-4.043q0 2.1159-.72265 3.1445-.72266 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72266-3.1055.72265-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72266.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745zm8.6914 1.6471q0 2.1159-.72266 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055.72266-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72265.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745z" style="white-space:pre" aria-label="200" />
            <path id="text55" transform="matrix(1.2953 0 0 1.2953 -9.2946 -77.508)" d="m36.02 426.53h-1.2109v-8.0273l-2.4284.89193v-1.0938l3.4505-1.2956h.1888zm9.4726-4.043q0 2.1159-.72265 3.1445-.72266 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72266-3.1055.72265-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72266.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745zm8.6914 1.6471q0 2.1159-.72266 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055.72266-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72265.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745z" style="white-space:pre" aria-label="100" />
            <path id="text57" transform="matrix(1.2953 0 0 1.2953 342.37 -291.93)" d="m28.959 422.15h-4.1081v3.3594h4.7721v1.0221h-6.0221v-9.4791h5.957v1.0286h-4.707v3.0469h4.1081zm9.2187 3.138q-.48177.6901-1.3477 1.0352-.85937.33854-2.0052.33854-1.1589 0-2.0573-.54037-.89844-.54687-1.3932-1.5495-.48828-1.0026-.5013-2.3242v-.82682q0-2.1419.99609-3.3203 1.0026-1.1784 2.8125-1.1784 1.4844 0 2.3893.76171.90495.75521 1.1068 2.1484h-1.25q-.35156-1.8815-2.2396-1.8815-1.2565 0-1.9075.88541-.64453.87891-.65104 2.5521v.77474q0 1.595.72916 2.5391.72916.93749 1.9727.93749.70312 0 1.2305-.15625.52734-.15625.87239-.52734v-2.1289h-2.194v-1.0156h3.4375zm8.6328-7.207h-3.0469v8.4505h-1.2435v-8.4505h-3.0404v-1.0286h7.3307zm4.1927.53385q0-.67708.48177-1.1849.48828-.50781 1.1784-.50781.67708 0 1.1523.50781.48177.5013.48177 1.1849 0 .6901-.48177 1.1784-.47526.48828-1.1523.48828-.68359 0-1.1719-.48828t-.48828-1.1784zm1.6602.83333q.35156 0 .59245-.22786.24088-.23438.24088-.60547 0-.3776-.24088-.61849-.24088-.24739-.59245-.24739-.35807 0-.60547.26041-.24088.25391-.24088.60547t.24088.59245q.2474.24088.60547.24088zm8.8021 2.8971h-3.9779v4.1862h-1.25v-9.4791h5.8724v1.0286h-4.6224v3.2422h3.9779z" style="white-space:pre" aria-label="EGT °F" />

            <path id="text81" transform="matrix(1.2953 0 0 1.2953 337.88 -253.37)" d="m32.276 426.53h-1.2109v-8.0273l-2.4284.89193v-1.0938l3.4505-1.2956h.1888zm9.2773-7.0052q0 .70963-.3776 1.263-.37109.55339-1.0091.86589.74218.31901 1.1719.93099.4362.61197.4362 1.3867 0 1.2305-.83333 1.9596-.82682.72917-2.181.72917-1.3672 0-2.194-.72917-.82031-.73567-.82031-1.9596 0-.76823.41667-1.3867.42318-.61849 1.1654-.9375-.63151-.3125-.99609-.86589-.36458-.55338-.36458-1.2565 0-1.1979.76823-1.901t2.0247-.70312q1.25 0 2.0182.70312.77474.70312.77474 1.901zm-.98307 4.4206q0-.79427-.50781-1.2956-.5013-.5013-1.3151-.5013-.8138 0-1.3086.49479-.48828.49479-.48828 1.3021t.47526 1.2695q.48177.46224 1.3346.46224.84635 0 1.3281-.46224.48177-.46875.48177-1.2695zm-1.8099-6.0351q-.70963 0-1.1523.44271-.4362.43619-.4362 1.1914 0 .72265.42969 1.1719.4362.44271 1.1589.44271.72266 0 1.1523-.44271.4362-.44922.4362-1.1719 0-.72266-.44922-1.1784-.44922-.45573-1.1393-.45573zm10.475 4.5768q0 2.1159-.72265 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055t2.2656-1.0156q1.5299 0 2.2526.98307.72265.97656.74218 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745zm8.6914 1.6471q0 2.1159-.72266 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055.72266-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72266.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745z" style="white-space:pre" aria-label="1800" />
            <path id="text82" transform="matrix(1.2953 0 0 1.2953 337.88 -209.24)" d="m32.276 426.53h-1.2109v-8.0273l-2.4284.89193v-1.0938l3.4505-1.2956h.1888zm8.2552-9.4857v1.0221h-.22135q-1.4062.026-2.2396.83333-.83333.80729-.96354 2.2721.7487-.85937 2.0443-.85937 1.237 0 1.9727.87239.74218.87239.74218 2.2526 0 1.4648-.80078 2.3437-.79427.87891-2.1354.87891-1.3607 0-2.207-1.0417-.84635-1.0482-.84635-2.6953v-.46224q0-2.6172 1.1133-3.9974 1.1198-1.3867 3.3268-1.4193zm-1.582 4.2708q-.61849 0-1.1393.37109t-.72266.93099v.4427q0 1.1719.52734 1.888.52734.71614 1.3151.71614.8138 0 1.276-.59895.46875-.59896.46875-1.569 0-.97656-.47526-1.5755-.46875-.60546-1.25-.60546zm10.286 1.1719q0 2.1159-.72265 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055t2.2656-1.0156q1.5299 0 2.2526.98307.72265.97656.74218 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745zm8.6914 1.6471q0 2.1159-.72266 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055.72266-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72266.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745z" style="white-space:pre" aria-label="1600" />
            <path id="text83" transform="matrix(1.2953 0 0 1.2953 337.88 -165.44)" d="m32.276 426.53h-1.2109v-8.0273l-2.4284.89193v-1.0938l3.4505-1.2956h.1888zm8.6133-3.1836h1.3151v.98307h-1.3151v2.2005h-1.2109v-2.2005h-4.3164v-.70963l4.2448-6.569h1.2825zm-4.1601 0h2.9492v-4.6484l-.14323.26041zm12.506-.85937q0 2.1159-.72265 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055t2.2656-1.0156q1.5299 0 2.2526.98307.72265.97656.74218 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745zm8.6914 1.6471q0 2.1159-.72266 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055.72266-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72266.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745z" style="white-space:pre" aria-label="1400" />
            <path id="text84" transform="matrix(1.2953 0 0 1.2953 337.88 -121.64)" d="m32.276 426.53h-1.2109v-8.0273l-2.4284.89193v-1.0938l3.4505-1.2956h.1888zm9.7396 0h-6.2109v-.86589l3.2812-3.6458q.72916-.82682 1.0026-1.3411.27995-.52083.27995-1.0742 0-.74218-.44922-1.2174-.44922-.47526-1.1979-.47526-.89844 0-1.3997.51432-.49479.50781-.49479 1.4193h-1.2044q0-1.3086.83984-2.1159.84635-.80729 2.2591-.80729 1.3216 0 2.0898.69661.76823.6901.76823 1.8424 0 1.3997-1.7838 3.3333l-2.5391 2.7539h4.7591zm7.22-4.043q0 2.1159-.72265 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055t2.2656-1.0156q1.5299 0 2.2526.98307.72265.97656.74218 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745zm8.6914 1.6471q0 2.1159-.72266 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055.72266-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72266.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745z" style="white-space:pre" aria-label="1200" />
            <path id="text85" transform="matrix(1.2953 0 0 1.2953 337.88 -77.508)" d="m32.276 426.53h-1.2109v-8.0273l-2.4284.89193v-1.0938l3.4505-1.2956h.1888zm9.4726-4.043q0 2.1159-.72265 3.1445-.72266 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72266-3.1055.72265-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72266.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745zm8.6914 1.6471q0 2.1159-.72265 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055t2.2656-1.0156q1.5299 0 2.2526.98307.72265.97656.74218 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745zm8.6914 1.6471q0 2.1159-.72266 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055.72266-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72266.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745z" style="white-space:pre" aria-label="1000" />
            <path id="text130" transform="matrix(1.2953 0 0 1.2953 258.06 -291.58)" d="m32.784 418.08h-3.0469v8.4505h-1.2435v-8.4505h-3.0404v-1.0286h7.3307zm2.7474 8.4505h-1.25v-9.4791h1.25zm8.6458-8.4505h-3.0469v8.4505h-1.2435v-8.4505h-3.0404v-1.0286h7.3307zm4.1927.53385q0-.67708.48177-1.1849.48828-.50781 1.1784-.50781.67708 0 1.1523.50781.48177.5013.48177 1.1849 0 .6901-.48177 1.1784-.47526.48828-1.1523.48828-.68359 0-1.1719-.48828-.48828-.48828-.48828-1.1784zm1.6602.83333q.35156 0 .59245-.22786.24088-.23438.24088-.60547 0-.3776-.24088-.61849-.24088-.24739-.59245-.24739-.35807 0-.60547.26041-.24088.25391-.24088.60547t.24088.59245q.2474.24088.60547.24088zm8.8021 2.8971h-3.9779v4.1862h-1.25v-9.4791h5.8724v1.0286h-4.6224v3.2422h3.9779z" style="white-space:pre" aria-label="TIT °F" />
            <path id="text134" transform="matrix(.813 0 0 .813 320.45 135.21)" d="m42.976 422.69h-2.2266v3.8346h-1.2565v-9.4791h3.138q1.6016 0 2.4609.72916.86588.72916.86588 2.1224 0 .88541-.48177 1.543-.47526.65755-1.3281.98307l2.2266 4.0234v.0781h-1.3411zm-2.2266-1.0221h1.9206q.93099 0 1.4779-.48177.55338-.48177.55338-1.2891 0-.8789-.52734-1.3476-.52083-.46875-1.5104-.47526h-1.9141z" style="white-space:pre" aria-label="R" />
            <path id="text136" transform="matrix(1.2953 0 0 1.2953 259.14 -253.37)" d="m32.276 426.53h-1.2109v-8.0273l-2.4284.89193v-1.0938l3.4505-1.2956h.1888zm9.2773-7.0052q0 .70963-.3776 1.263-.37109.55339-1.0091.86589.74218.31901 1.1719.93099.4362.61197.4362 1.3867 0 1.2305-.83333 1.9596-.82682.72917-2.181.72917-1.3672 0-2.194-.72917-.82031-.73567-.82031-1.9596 0-.76823.41667-1.3867.42318-.61849 1.1654-.9375-.63151-.3125-.99609-.86589-.36458-.55338-.36458-1.2565 0-1.1979.76823-1.901t2.0247-.70312q1.25 0 2.0182.70312.77474.70312.77474 1.901zm-.98307 4.4206q0-.79427-.50781-1.2956-.5013-.5013-1.3151-.5013-.8138 0-1.3086.49479-.48828.49479-.48828 1.3021t.47526 1.2695q.48177.46224 1.3346.46224.84635 0 1.3281-.46224.48177-.46875.48177-1.2695zm-1.8099-6.0351q-.70963 0-1.1523.44271-.4362.43619-.4362 1.1914 0 .72265.42969 1.1719.4362.44271 1.1589.44271.72266 0 1.1523-.44271.4362-.44922.4362-1.1719 0-.72266-.44922-1.1784-.44922-.45573-1.1393-.45573zm10.475 4.5768q0 2.1159-.72265 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055t2.2656-1.0156q1.5299 0 2.2526.98307.72265.97656.74218 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745zm8.6914 1.6471q0 2.1159-.72266 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055.72266-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72266.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745z" style="white-space:pre" aria-label="1800" />
            <path id="text137" transform="matrix(1.2953 0 0 1.2953 259.14 -209.24)" d="m32.276 426.53h-1.2109v-8.0273l-2.4284.89193v-1.0938l3.4505-1.2956h.1888zm8.2552-9.4857v1.0221h-.22135q-1.4062.026-2.2396.83333-.83333.80729-.96354 2.2721.7487-.85937 2.0443-.85937 1.237 0 1.9727.87239.74218.87239.74218 2.2526 0 1.4648-.80078 2.3437-.79427.87891-2.1354.87891-1.3607 0-2.207-1.0417-.84635-1.0482-.84635-2.6953v-.46224q0-2.6172 1.1133-3.9974 1.1198-1.3867 3.3268-1.4193zm-1.582 4.2708q-.61849 0-1.1393.37109t-.72266.93099v.4427q0 1.1719.52734 1.888.52734.71614 1.3151.71614.8138 0 1.276-.59895.46875-.59896.46875-1.569 0-.97656-.47526-1.5755-.46875-.60546-1.25-.60546zm10.286 1.1719q0 2.1159-.72265 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055t2.2656-1.0156q1.5299 0 2.2526.98307.72265.97656.74218 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745zm8.6914 1.6471q0 2.1159-.72266 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055.72266-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72266.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745z" style="white-space:pre" aria-label="1600" />
            <path id="text138" transform="matrix(1.2953 0 0 1.2953 259.14 -165.44)" d="m32.276 426.53h-1.2109v-8.0273l-2.4284.89193v-1.0938l3.4505-1.2956h.1888zm8.6133-3.1836h1.3151v.98307h-1.3151v2.2005h-1.2109v-2.2005h-4.3164v-.70963l4.2448-6.569h1.2825zm-4.1601 0h2.9492v-4.6484l-.14323.26041zm12.506-.85937q0 2.1159-.72265 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055t2.2656-1.0156q1.5299 0 2.2526.98307.72265.97656.74218 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745zm8.6914 1.6471q0 2.1159-.72266 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055.72266-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72266.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745z" style="white-space:pre" aria-label="1400" />
            <path id="text139" transform="matrix(1.2953 0 0 1.2953 259.14 -121.64)" d="m32.276 426.53h-1.2109v-8.0273l-2.4284.89193v-1.0938l3.4505-1.2956h.1888zm9.7396 0h-6.2109v-.86589l3.2812-3.6458q.72916-.82682 1.0026-1.3411.27995-.52083.27995-1.0742 0-.74218-.44922-1.2174-.44922-.47526-1.1979-.47526-.89844 0-1.3997.51432-.49479.50781-.49479 1.4193h-1.2044q0-1.3086.83984-2.1159.84635-.80729 2.2591-.80729 1.3216 0 2.0898.69661.76823.6901.76823 1.8424 0 1.3997-1.7838 3.3333l-2.5391 2.7539h4.7591zm7.22-4.043q0 2.1159-.72265 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055t2.2656-1.0156q1.5299 0 2.2526.98307.72265.97656.74218 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745zm8.6914 1.6471q0 2.1159-.72266 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055.72266-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72266.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745z" style="white-space:pre" aria-label="1200" />
            <path id="text140" transform="matrix(1.2953 0 0 1.2953 259.14 -77.508)" d="m32.276 426.53h-1.2109v-8.0273l-2.4284.89193v-1.0938l3.4505-1.2956h.1888zm9.4726-4.043q0 2.1159-.72265 3.1445-.72266 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72266-3.1055.72265-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72266.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745zm8.6914 1.6471q0 2.1159-.72265 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055t2.2656-1.0156q1.5299 0 2.2526.98307.72265.97656.74218 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745zm8.6914 1.6471q0 2.1159-.72266 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055.72266-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72266.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745z" style="white-space:pre" aria-label="1000" />
            <path id="text153" transform="matrix(.813 0 0 .813 236.98 135.21)" d="m41.273 425.51h4.4922v1.0221h-5.7487v-9.4791h1.2565z" style="white-space:pre" aria-label="L" />
            <path id="text51" transform="matrix(1.2953 0 0 1.2953 -9.2946 -253.37)" d="m32.615 421.78.48177-4.7266h4.8568v1.1133h-3.8346l-.28646 2.5846q.69661-.41015 1.582-.41015 1.2956 0 2.0573.85937.76172.85286.76172 2.3112 0 1.4648-.79427 2.3112-.78776.83985-2.207.83985-1.2565 0-2.0508-.69662-.79427-.69661-.90494-1.9271h1.1393q.11068.8138.57942 1.2305.46875.41016 1.237.41016.83984 0 1.3151-.57292.48177-.57292.48177-1.582 0-.95052-.52083-1.5234-.51432-.57943-1.3737-.57943-.78776 0-1.237.34505l-.31901.26042zm12.878.70963q0 2.1159-.72265 3.1445-.72266 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72266-3.1055.72265-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72266.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745zm8.6914 1.6471q0 2.1159-.72266 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055.72266-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72265.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745z" style="white-space:pre" aria-label="500" />
          </g>
        </g>
      </svg>
    );
  }

  /**
   * Renders the temperature bars, except the EGT bars.
   * @returns The temperature bar VNodes.
   **/
  private renderBars(): VNode[] {

    const barArray: VNode[] = [];

    for (let barIndex = 0; barIndex < this.barInfoArray.length; barIndex++) {
      const theBar = this.barInfoArray[barIndex];
      const barHeight = 1;
      const barStyle = 'fill:' + this.barColor;

      let labelClass = 'bar-label';
      if (theBar.labelClass !== undefined) {
        labelClass = theBar.labelClass;
      }

      barArray.push(
        <svg class="eng-temp-panel-bar-gauges" width="1024" height="687" viewBox="0 0 1024 687">
          <g>
            <text
              x={theBar.numberPosition.x}
              y={theBar.numberPosition.y}
              dominant-baseline="middle"
              text-anchor="middle"
              class={labelClass}
            >
              {theBar.outputSubject}
            </text>

            <rect
              ref={theBar.barRef}
              x={theBar.barOrigin.x}
              y={theBar.barOrigin.y - barHeight}
              width={this.barWidth}
              height={barHeight}
              style={barStyle}
            />
          </g>
        </svg>
      );
    }

    return barArray;
  }

  /**
   * Renders the EGT bar gauges
   * @returns A VNode.
   **/
  private renderEgtBars(): VNode[] {

    const barArray: VNode[] = [];

    for (let barIndex = 0; barIndex < this.egtBarInfoArray.length; barIndex++) {
      const theBar = this.egtBarInfoArray[barIndex];
      const barHeight = 1;
      const barStyle = 'fill:' + this.barColor;

      barArray.push(
        <svg class="eng-temp-panel-bar-gauges" width="1024" height="687" viewBox="0 0 1024 687">
          <g>
            <rect
              ref={theBar.barRef}
              x={theBar.barOrigin.x}
              y={theBar.barOrigin.y - barHeight}
              width={this.barWidth}
              height={barHeight}
              style={barStyle}
            />
          </g>
        </svg>
      );
    }

    return barArray;
  }

  /**
   * Renders the EGT bar peak markers.
   * @returns A VNode.
   */
  private renderEgtPeakMarkers(): VNode {
    const markerArray: VNode[] = [];

    for (let barIndex = 0; barIndex < this.egtBarInfoArray.length; barIndex++) {
      const theBar = this.egtBarInfoArray[barIndex];
      const peak = this.leanAssistCalculator.egtPeaks[barIndex].get().value;

      markerArray.push(
        <div ref={theBar.peakMarkerRef} class="egt-peak-marker" style={{ display: 'none' }}>
          <svg width="1024" height="687" viewBox="0 0 1024 687">
            <rect
              x={theBar.barOrigin.x + 1}
              y={theBar.barOrigin.y - (peak < 0 ? 0 : peak)}
              width={11}
              height={1}
              style="stroke:cyan;stroke-width:2;"
            />
          </svg>
        </div>
      );
    }

    return (<div class="eng-temp-panel-egt-peak-markers">{...markerArray}</div>);
  }

  /**
   * Renders the EGT bar value readouts (at the top of the chart)
   * @returns A VNode.
   */
  private renderEgtBarValues(): VNode[] {

    const barArray: VNode[] = [];

    for (let barIndex = 0; barIndex < this.egtBarInfoArray.length; barIndex++) {
      const theBar = this.egtBarInfoArray[barIndex];
      const positionClassName = `bar-value-${barIndex + 1}`;

      barArray.push(
        <div
          class={{
            'bar-value': true,
            [positionClassName]: true,
            'focus': this.leanAssistCalculator.peakInFocusIndex.map((v) => v === barIndex)
          }}
          ref={this.egtPeakBoxRefArray[barIndex]}
        >
          {theBar.outputSubject}
        </div >
      );
    }

    return (
      <div class="egt-bar-value-container">
        {...barArray}
      </div>
    );
  }

  /**
   * Renders the EGT bar bottom labels, overlaying the existing labels, which are generated SVG paths,
   * for easier highlighting and other manipulations.
   * @returns A VNode.
   */
  private renderEgtBarLabels(): VNode {

    return (
      <div class="egt-bar-label-container">
        {this.egtBarLabelRefArray.map((ref, index) => (
          <div ref={ref} class={{
            [`number-label-${index + 1}`]: true,
            'number-label': true,
            'focus': this.leanAssistCalculator.peakInFocusIndex.map((v) => v === index),
            'transit': this.leanAssistCalculator.egtPeaks[index].map((peak) => ![-1, 1, 6].includes(peak.order)),
            'first': this.leanAssistCalculator.egtPeaks[index].map((peak) => peak.order === 1),
            'last': this.leanAssistCalculator.egtPeaks[index].map((peak) => peak.order === 6),
          }}>
            {Subject.create<number>(index + 1)}
          </div>
        ))}
      </div>
    );
  }

  /**
   * Renders the Δ Peak data readout of the currently focused EGT cylinder.
   * @returns A VNode.
   */
  private renderEgtDeltaPeak(): VNode {
    return (
      <div class="egt-delta-peak-container" ref={this.deltaPeakRef} style={{ display: 'none' }}>
        <div class="delta-peak-label">Δ PEAK</div>
        <div class="delta-peak-value">{this.leanAssistCalculator.deltaPeak}</div>
      </div>
    );
  }

  /** Resets the EGT bar labels to original numeric labels (1 to 6) with no styling. */
  private resetEgtBarLabels(): void {
    this.egtBarLabelRefArray.map((ref, index) => {
      ref.instance.textContent = (index + 1).toString();
      ref.instance.style.display = '';
      ref.instance.classList.remove('first', 'last', 'focus');
    });
  }

  /** Resets the EGT peak markets to their original position and visibility status. */
  private resetEgtPeakMarkers(): void {
    this.egtPeakMarkerRefArray.map((ref) => {
      ref.instance.style.transform = 'translate3d(0,0,0)';
      ref.instance.style.display = 'none';
    });
  }

  /**
   * Update the height of a bar gauge when its value changes.
   * @param theBar The info data object representing the bar gauge,
   * @param value The current value of the bar.
   */
  private updateBarHeight(theBar: any, value: number): void {

    theBar.outputSubject.set(this.egtTempFormatter(value));

    const barHeight = MathUtils.lerp(value, theBar.minVal, theBar.maxVal, 0, this.maxBarHeight, true, true);
    const barY = theBar.barOrigin.y - barHeight;

    theBar.barRef.instance.setAttribute('height', barHeight.toString());
    theBar.barRef.instance.setAttribute('y', barY.toString());
  }


  /**
   * Updates a temperature bar.
   * @param barIndex The index of the bar to update.
   * @param value The value to update the bar to.
   */
  private updateBar(barIndex: number, value: number): void {
    const theBar = this.barInfoArray[barIndex];
    this.updateBarHeight(theBar, value);
  }

  /**
   * Update an EGT bar gauge's value readout, the peak marker, bar label, peak box,
   * and the height of the bar when its value changes.
   * @param barIndex The index of the data object representing this bar in `egtBarInfoArray`.
   * @param value The current value of the bar.
   */
  private updateEgtBar(barIndex: number, value: number): void {

    const theBar = this.egtBarInfoArray[barIndex];

    if (this.leanAssistCalculator.leanAssistActivated.get()) {
      const peak = this.leanAssistCalculator.egtPeaks[barIndex].get();

      if (peak.value > theBar.minVal) {
        const yTransition = -(peak.value - theBar.minVal) / this.egtBarHeightResolution;
        theBar.peakMarkerRef.instance.style.display = '';
        theBar.peakMarkerRef.instance.style.transform = `translate3d(0,${yTransition.toString()}px,0)`;
      }

      if ((this.leanAssistCalculator.leanAssistPhase.get() === LeanAssistPhase.CURRENT_PEAK)) {
        const isInFocus = this.leanAssistCalculator.peakInFocusIndex.get() === barIndex;
        if (isInFocus) {
          theBar.barLabelRef.instance.textContent = this.leanAssistCalculator.peakInFocusLabel.get();
          theBar.barLabelRef.instance.style.display = '';
        } else {
          theBar.barLabelRef.instance.style.display = 'none';
        }
      }
    }

    this.updateBarHeight(theBar, value);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='eng-temp-panel'>
        {this.renderStaticSVG()}
        {this.renderBars()}
        {this.renderEgtBars()}
        {this.renderEgtPeakMarkers()}
        {this.renderEgtBarValues()}
        {this.renderEgtBarLabels()}
        {this.renderEgtDeltaPeak()}
      </div>
    );
  }

  /** @inheritdoc */
  public pause(): void {
    this.subs.forEach(sub => sub.pause());
    this.leanAssistCalculator.pause();
  }

  /** @inheritdoc */
  public resume(): void {
    this.leanAssistCalculator.resume();
    this.subs.forEach(sub => sub.resume(true));
  }

  /** @inheritdoc */
  public destroy(): void {
    this.subs.forEach(sub => sub.destroy());
    this.leanAssistCalculator.destroy();
  }
}
