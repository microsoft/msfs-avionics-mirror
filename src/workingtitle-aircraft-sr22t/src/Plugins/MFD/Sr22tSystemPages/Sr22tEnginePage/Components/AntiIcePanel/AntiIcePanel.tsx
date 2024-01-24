import {
  FSComponent, VNode, DisplayComponent, ComponentProps, EventBus,
  Subject, ConsumerSubject, MappedSubject, GNSSEvents, Subscription,
} from '@microsoft/msfs-sdk';
import { Sr22tSimvarEvents } from '../../../../Sr22tSimvarPublisher/Sr22tSimvarPublisher';

import './AntiIcePanel.css';
import { Sr22tAntiIceTankMode } from '../../../../../Shared';

/** Props for an Anti Ice Panel */
export interface AntiIcePanelProps extends ComponentProps {
  /** The event bus */
  bus: EventBus,
}

/** Anti Ice Panel component */
export class AntiIcePanel extends DisplayComponent<AntiIcePanelProps> {
  private subs: Subscription[] = [];

  // Bar properties
  private readonly barColor = '#00f600';
  private readonly maxBarHeight = 83; // px
  private readonly barWidth = 13;     // px

  // Flow rates [GPH]
  private readonly maxFlow = 12.8;
  private readonly highFlow = 6.4;
  private readonly normFlow = 3.2;

  private readonly flowBoxRef = FSComponent.createRef<SVGRectElement>();
  private readonly leftLabelBoxRef = FSComponent.createRef<SVGRectElement>();
  private readonly rightLabelBoxRef = FSComponent.createRef<SVGRectElement>();
  private readonly leftValueBoxRef = FSComponent.createRef<SVGRectElement>();
  private readonly rightValueBoxRef = FSComponent.createRef<SVGRectElement>();

  // Source subjects
  private readonly leftFluidSubject = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tSimvarEvents>().on('anti_ice_fluid_qty_left').withPrecision(1), 0);  // gallons
  private readonly rightFluidSubject = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tSimvarEvents>().on('anti_ice_fluid_qty_right').withPrecision(1), 0); // gallons
  private readonly groundSpeedSubject = ConsumerSubject.create(this.props.bus.getSubscriber<GNSSEvents>().on('ground_speed').withPrecision(0), 0);       // Knots (NM/hour)
  private readonly tksFlowRateSubject = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tSimvarEvents>().on('anti_ice_fluid_flow_rate').withPrecision(1), 0); // gallons per hour
  private readonly currentTksTank = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tSimvarEvents>().on('anti_ice_tank_mode'), Sr22tAntiIceTankMode.Left);

  private barInfoArray = [
    {
      barOrigin: {
        x: 31.5,
        y: 642,
      },
      numberPosition: {
        x: 31 + (this.barWidth / 2) + 9,
        y: 659,
      },
      minVal: 0,
      maxVal: 4,
      mappedSubject: MappedSubject.create(
        ([leftFluid]): number => {
          return leftFluid;
        },
        this.leftFluidSubject
      ),
      outputSubject: Subject.create(''),
      barRef: FSComponent.createRef<SVGRectElement>(),
    },
    {
      barOrigin: {
        x: 31.5 + 84,
        y: 642,
      },
      numberPosition: {
        x: 31 + 84 + (this.barWidth / 2) - 9,
        y: 659,
      },
      minVal: 0,
      maxVal: 4,
      mappedSubject: MappedSubject.create(
        ([rightFluid]): number => {
          return rightFluid;
        },
        this.rightFluidSubject
      ),
      outputSubject: Subject.create(''),
      barRef: FSComponent.createRef<SVGRectElement>(),
    },
  ];

  private numberArray = [
    {
      position: {
        x: 228,
        y: 571,
      },
      mappedSubject: MappedSubject.create(
        ([leftFluid, rightFluid]): number => {
          const hours = (leftFluid + rightFluid) / this.maxFlow;
          return Math.floor(hours) % 1000;
        },
        this.leftFluidSubject, this.rightFluidSubject
      ),
      outputSubject: Subject.create(''),
      decimals: 0,
      minDigits: 1,
      styleClass: 'label',
      align: 'end',
    },
    {
      position: {
        x: 228 + 33,
        y: 571,
      },
      mappedSubject: MappedSubject.create(
        ([leftFluid, rightFluid]): number => {
          const hours = (leftFluid + rightFluid) / this.maxFlow;
          return (hours * 60) % 60;
        },
        this.leftFluidSubject, this.rightFluidSubject
      ),
      outputSubject: Subject.create(''),
      decimals: 0,
      minDigits: 2,
      styleClass: 'label',
      align: 'end',
    },
    {
      position: {
        x: 228,
        y: 571 + 29,
      },
      mappedSubject: MappedSubject.create(
        ([leftFluid, rightFluid]): number => {
          const hours = (leftFluid + rightFluid) / this.highFlow;
          return Math.floor(hours) % 1000;
        },
        this.leftFluidSubject, this.rightFluidSubject
      ),
      outputSubject: Subject.create(''),
      decimals: 0,
      minDigits: 1,
      styleClass: 'label',
      align: 'end',
    },
    {
      position: {
        x: 228 + 33,
        y: 571 + 29,
      },
      mappedSubject: MappedSubject.create(
        ([leftFluid, rightFluid]): number => {
          const hours = (leftFluid + rightFluid) / this.highFlow;
          return (hours * 60) % 60;
        },
        this.leftFluidSubject, this.rightFluidSubject
      ),
      outputSubject: Subject.create(''),
      decimals: 0,
      minDigits: 2,
      styleClass: 'label',
      align: 'end',
    },
    {
      position: {
        x: 228,
        y: 571 + 29 + 28,
      },
      mappedSubject: MappedSubject.create(
        ([leftFluid, rightFluid]): number => {
          const hours = (leftFluid + rightFluid) / this.normFlow;
          return Math.floor(hours) % 1000;
        },
        this.leftFluidSubject, this.rightFluidSubject
      ),
      outputSubject: Subject.create(''),
      decimals: 0,
      minDigits: 1,
      styleClass: 'label',
      align: 'end',
    },
    {
      position: {
        x: 228 + 33,
        y: 571 + 29 + 28,
      },
      mappedSubject: MappedSubject.create(
        ([leftFluid, rightFluid]): number => {
          const hours = (leftFluid + rightFluid) / this.normFlow;
          return (hours * 60) % 60;
        },
        this.leftFluidSubject, this.rightFluidSubject
      ),
      outputSubject: Subject.create(''),
      decimals: 0,
      minDigits: 2,
      styleClass: 'label',
      align: 'end',
    },
    {
      position: {
        x: 228 + 8,
        y: 571 + 29 + 28 + 28,
      },
      mappedSubject: MappedSubject.create(
        ([leftFluid, rightFluid, tksFlowRate, groundSpeed]): number => {
          return ((leftFluid + rightFluid) / tksFlowRate) * groundSpeed;
        },
        this.leftFluidSubject, this.rightFluidSubject, this.tksFlowRateSubject, this.groundSpeedSubject
      ),
      outputSubject: Subject.create(''),
      decimals: 0,
      minDigits: 1,
      minVal: 0,
      maxVal: 1000,
      dashOut: '___',
      styleClass: 'label',
      align: 'end',
    },
  ];

  /** @inheritdoc */
  public onAfterRender(): void {

    // Add subscriptions to subs array
    this.subs.push(
      this.leftFluidSubject,
      this.rightFluidSubject,
      this.groundSpeedSubject,
      this.tksFlowRateSubject,
      this.currentTksTank.sub((v: Sr22tAntiIceTankMode) => {
        this.leftLabelBoxRef.instance.style.stroke = v === Sr22tAntiIceTankMode.Left ? 'cyan' : '#fff';
        this.leftValueBoxRef.instance.style.stroke = v === Sr22tAntiIceTankMode.Left ? 'cyan' : 'none';
        this.rightLabelBoxRef.instance.style.stroke = v === Sr22tAntiIceTankMode.Right ? 'cyan' : '#fff';
        this.rightValueBoxRef.instance.style.stroke = v === Sr22tAntiIceTankMode.Right ? 'cyan' : 'none';
      }, true),
    );

    for (let barIndex = 0; barIndex < this.barInfoArray.length; barIndex++) {
      this.barInfoArray[barIndex].mappedSubject.sub((v) => {
        this.updateBar(barIndex, v);
      }, true);
    }

    for (let numberIndex = 0; numberIndex < this.numberArray.length; numberIndex++) {
      this.numberArray[numberIndex].mappedSubject.sub((v) => {
        this.updateNumber(numberIndex, v);
      }, true);
    }

    this.tksFlowRateSubject.sub((v) => {
      this.updateFlowBox(v);
    }, true);
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
   * Renders the static SVGs drawing the background, texts, and fuel scales of this panel.
   * @returns a VNode.
   */
  private renderStaticSVG(): VNode {
    return (
      <svg width="1024" height="687" version="1.1" viewBox="0 0 1024 687">
        <g>
          <defs id="defs1">
            <linearGradient id="linearGradient486" x1="54.575" x2="54.575" y1="131.62" y2="94.76" gradientUnits="userSpaceOnUse">
              <stop id="stop154-6" offset=".92293" />
              <stop id="stop155-8" stop-color="#454545" offset="1" />
            </linearGradient>
          </defs>
          <path id="path41" transform="matrix(7.155 0 0 7.155 -242.25 -161.28)" d="m37.833 94.76h33.485a1.3229 1.3229 45 011.3229 1.3229v19.107a1.3229 1.3229 135 01-1.3229 1.3229h-33.485a1.3229 1.3229 45 01-1.3229-1.3229v-19.107a1.3229 1.3229 135 011.3229-1.3229z" fill="url(#linearGradient486)" stroke="#9f9f9f" stroke-linecap="square" stroke-width=".26458" />
          <rect id="L-label-box" ref={this.leftLabelBoxRef} x="37.057" y="532.67" width="19.976" height="19.976" fill="none" stroke="#fff" stroke-width="2" />
          <rect id="rect391" x="48.852" y="638.93" width="6.626" height="2.8042" fill="#f00" />
          <rect id="rect57" x="51.594" y="630.69" width="3.8838" height="8.2426" fill="#ff0" />
          <g fill="none" stroke="#fff">
            <g stroke-width="1.8931">
              <path id="path48" d="m48.852 560.24h6.626v81.494" />
              <path id="path70" d="m48.852 600.84h6.626" />
              <path id="path71" d="m48.852 620.34h6.626" />
              <path id="path73" d="m48.852 580.21h6.626" />
            </g>
            <rect id="R-label-box" ref={this.rightLabelBoxRef} x="103.7" y="532.67" width="19.976" height="19.976" stroke-width="2" />
            <rect id="R-value-box" ref={this.rightValueBoxRef} x="100" y="647.6" width="28.2" height="19.976" stroke-width="2" />
            <rect id="L-value-box" ref={this.leftValueBoxRef} x="30.7" y="647.6" width="28.2" height="19.976" stroke-width="2" />
          </g>
          <rect id="rect397" transform="scale(-1,1)" x="-110.84" y="638.93" width="6.626" height="2.8042" fill="#f00" />
          <rect id="rect398" transform="scale(-1,1)" x="-108.1" y="630.69" width="3.8838" height="8.2426" fill="#ff0" />
          <g fill="none" stroke="#fff" stroke-width="1.8931">
            <path id="path398" d="m110.84 560.24h-6.626v81.494" />
            <path id="path399" d="m110.84 600.84h-6.626" />
            <path id="path400" d="m110.84 620.34h-6.626" />
            <path id="path401" d="m110.84 580.21h-6.626" />
          </g>
          <g fill="#f60" stroke-linecap="square">
            <g id="text20" transform="matrix(1.4523 0 0 1.4523 290.03 13.163)" style="white-space:pre" aria-label="0+00">
              <path id="path14" d="m-38.391 421.44h2.6432v1.1393h-2.6432v2.9948h-1.2109v-2.9948h-2.6432v-1.1393h2.6432v-2.7669h1.2109z" fill="#fff" />
            </g>
            <g id="text21" transform="matrix(1.4523 0 0 1.4523 290.03 -14.837)" style="white-space:pre" aria-label="0+00">
              <path id="path21" d="m-38.391 421.44h2.6432v1.1393h-2.6432v2.9948h-1.2109v-2.9948h-2.6432v-1.1393h2.6432v-2.7669h1.2109z" fill="#fff" />
            </g>
            <g id="text22" transform="matrix(1.4523 0 0 1.4523 290.03 -43.087)" style="white-space:pre" aria-label="0+00">
              <path id="path42" d="m-38.391 421.44h2.6432v1.1393h-2.6432v2.9948h-1.2109v-2.9948h-2.6432v-1.1393h2.6432v-2.7669h1.2109z" fill="#fff" />
            </g>
          </g>
          <rect id="rect48" x="40.231" y="511.34" width="108.82" height="12.96" />
          <g fill="#fff" stroke-linecap="square">
            <path id="text291" transform="matrix(.88587 0 0 .88587 116.97 186.37)" d="m-40.989 423.35h1.3151v.98307h-1.3151v2.2005h-1.2109v-2.2005h-4.3164v-.70963l4.2448-6.569h1.2825zm-4.1601 0h2.9492v-4.6484l-.14323.26041z" style="white-space:pre" aria-label="4" />
            <path id="text293" transform="matrix(1.303 0 0 1.303 102.21 -6.9306)" d="m-44.349 425.51h4.4922v1.0221h-5.7487v-9.4791h1.2565z" style="white-space:pre" aria-label="L" />
            <path id="text390" transform="matrix(1.303 0 0 1.303 169.03 -6.7538)" d="m-42.646 422.69h-2.2266v3.8346h-1.2565v-9.4791h3.138q1.6016 0 2.4609.72916.86588.72916.86588 2.1224 0 .88541-.48177 1.543-.47526.65755-1.3281.98307l2.2266 4.0234v.0781h-1.3411zm-2.2266-1.0221h1.9206q.93099 0 1.4779-.48177.55338-.48177.55338-1.2891 0-.8789-.52734-1.3476-.52083-.46875-1.5104-.47526h-1.9141z" style="white-space:pre" aria-label="R" />
            <path id="text392" transform="matrix(.88587 0 0 .88587 117.1 206.79)" d="m-44.323 421.2h.90495q.85286-.013 1.3411-.44922.48828-.43619.48828-1.1784 0-1.6667-1.6602-1.6667-.78125 0-1.25.44922-.46224.4427-.46224 1.1784h-1.2044q0-1.1263.82031-1.8685.82682-.74869 2.0963-.74869 1.3411 0 2.1029.70963t.76172 1.9726q0 .61849-.40364 1.1979-.39713.57942-1.0872.86588.78125.24739 1.2044.82031.42969.57291.42969 1.3997 0 1.276-.83333 2.0247-.83333.7487-2.168.7487t-2.1745-.72266q-.83333-.72265-.83333-1.9076h1.2109q0 .7487.48828 1.1979t1.3086.44922q.87239 0 1.3346-.45573.46224-.45573.46224-1.3086 0-.82682-.50781-1.2695-.50781-.44271-1.4648-.45573h-.90495z" style="white-space:pre" aria-label="3" />
            <path id="text393" transform="matrix(.88587 0 0 .88587 116.94 226.95)" d="m-39.863 426.53h-6.2109v-.86589l3.2812-3.6458q.72916-.82682 1.0026-1.3411.27995-.52083.27995-1.0742 0-.74218-.44922-1.2174-.44922-.47526-1.1979-.47526-.89844 0-1.3997.51432-.49479.50781-.49479 1.4193h-1.2044q0-1.3086.83984-2.1159.84635-.80729 2.2591-.80729 1.3216 0 2.0898.69661.76823.6901.76823 1.8424 0 1.3997-1.7838 3.3333l-2.5391 2.7539h4.7591z" style="white-space:pre" aria-label="2" />
            <path id="text394" transform="matrix(.88587 0 0 .88587 117.71 246.71)" d="m-42.116 426.53h-1.2109v-8.0273l-2.4284.89193v-1.0938l3.4505-1.2956h.1888z" style="white-space:pre" aria-label="1" />
            <path id="text395" transform="matrix(.88587 0 0 .88587 116.99 266.54)" d="m-40.13 422.49q0 2.1159-.72266 3.1445-.72265 1.0286-2.2591 1.0286-1.5169 0-2.2461-1.0026-.72916-1.0091-.75521-3.0078v-1.6081q0-2.0898.72265-3.1055.72266-1.0156 2.2656-1.0156 1.5299 0 2.2526.98307.72265.97656.74219 3.0208zm-1.2044-1.6471q0-1.53-.42969-2.2266-.42969-.70312-1.3607-.70312-.92448 0-1.3477.69661t-.4362 2.1419v1.9271q0 1.5365.44271 2.2721.44922.72917 1.3542.72917.89192 0 1.3216-.69011.4362-.6901.45573-2.1745z" style="white-space:pre" aria-label="0" />
            <path id="text404" transform="matrix(1.3471 0 0 1.3471 138.52 90.636)" d="m-47.496 425.29q-.48177.6901-1.3477 1.0352-.85937.33854-2.0052.33854-1.1589 0-2.0573-.54037-.89844-.54687-1.3932-1.5495-.48828-1.0026-.5013-2.3242v-.82682q0-2.1419.99609-3.3203 1.0026-1.1784 2.8125-1.1784 1.4844 0 2.3893.76171.90494.75521 1.1068 2.1484h-1.25q-.35156-1.8815-2.2396-1.8815-1.2565 0-1.9075.88541-.64453.87891-.65104 2.5521v.77474q0 1.595.72916 2.5391.72916.93749 1.9727.93749.70312 0 1.2305-.15625.52734-.15625.87239-.52734v-2.1289h-2.194v-1.0156h3.4375zm7.3177-1.2305h-3.9713l-.89192 2.474h-1.2891l3.6198-9.4791h1.0937l3.6263 9.4791h-1.2825zm-3.5937-1.0286h3.2226l-1.6146-4.4336zm8.3138 2.4805h4.4922v1.0221h-5.7487v-9.4791h1.2565z" style="white-space:pre" aria-label="GAL" />
            <path id="text405" transform="matrix(1.3471 0 0 1.3471 214.57 87.636)" d="m-49.335 422.69h-2.2266v3.8346h-1.2565v-9.4791h3.138q1.6016 0 2.4609.72916.86588.72916.86588 2.1224 0 .88541-.48177 1.543-.47526.65755-1.3281.98307l2.2266 4.0234v.0781h-1.3411zm-2.2266-1.0221h1.9206q.93099 0 1.4779-.48177.55338-.48177.55338-1.2891 0-.8789-.52734-1.3476-.52083-.46875-1.5104-.47526h-1.9141zm11.12 4.8568q-.10417-.20833-.16927-.74219-.83984.8724-2.0052.8724-1.0417 0-1.7122-.58594-.66406-.59245-.66406-1.4974 0-1.1003.83333-1.7057.83984-.61197 2.3568-.61197h1.1719v-.55339q0-.63151-.3776-1.0026-.3776-.3776-1.1133-.3776-.64453 0-1.0807.32552t-.4362.78775h-1.2109q0-.52734.37109-1.0156.3776-.49479 1.0156-.78125.64453-.28645 1.4128-.28645 1.2174 0 1.9075.61197.6901.60547.71614 1.6732v3.2422q0 .97005.2474 1.543v.10417zm-1.9987-.91797q.5664 0 1.0742-.29297.50781-.29296.73568-.76171v-1.4453h-.94401q-2.2135 0-2.2135 1.2956 0 .5664.3776.88541.3776.31901.97005.31901zm6.0417-6.1263.03906.88542q.80729-1.0156 2.1094-1.0156 2.2331 0 2.2526 2.5195v4.6549h-1.2044v-4.6614q-.0065-.76172-.35156-1.1263-.33854-.36458-1.0612-.36458-.58594 0-1.0286.3125-.44271.3125-.6901.82031v5.0195h-1.2044v-7.0443zm5.931 3.4635q0-1.6471.76172-2.6172.76172-.97656 2.0182-.97656 1.2891 0 2.0117.91145l.05859-.78125h1.1003v6.875q0 1.3672-.8138 2.1549-.80729.78776-2.1745.78776-.76172 0-1.4909-.32552t-1.1133-.89193l.625-.72265q.77474.95703 1.8945.95703.8789 0 1.3672-.49479.49479-.49479.49479-1.3932v-.60547q-.72265.83334-1.9727.83334-1.237 0-2.0052-.9961-.76172-.99609-.76172-2.7148zm1.2109.13672q0 1.1914.48828 1.875.48828.67708 1.3672.67708 1.1393 0 1.6732-1.0352v-3.2161q-.55338-1.0091-1.6602-1.0091-.8789 0-1.3737.68359-.49479.68359-.49479 2.0247zm9.4791 3.5742q-1.4323 0-2.3307-.9375-.89844-.94401-.89844-2.5195v-.22135q0-1.0482.39714-1.8685.40364-.82682 1.1198-1.289.72265-.46875 1.5625-.46875 1.3737 0 2.1354.90494.76172.90495.76172 2.5911v.5013h-4.7721q.02604 1.0417.60547 1.6862.58594.63802 1.4844.63802.63802 0 1.0807-.26042t.77474-.6901l.73568.57291q-.88541 1.3607-2.6562 1.3607zm-.14974-6.3151q-.72916 0-1.224.53385-.49479.52734-.61198 1.4844h3.5286v-.0911q-.05208-.91797-.49479-1.4193-.44271-.50781-1.1979-.50781z" style="white-space:pre" aria-label="Range" />
            <path id="text407" transform="matrix(1.3471 0 0 1.3471 300.36 87.636)" d="m-37.418 426.53h-1.2565l-4.7721-7.3047v7.3047h-1.2565v-9.4791h1.2565l4.7851 7.3372v-7.3372h1.2435zm3.8346-9.4791 3.099 7.7344 3.099-7.7344h1.6211v9.4791h-1.25v-3.6914l.11719-3.9844-3.112 7.6758h-.95703l-3.1055-7.6562.1237 3.9648v3.6914h-1.25v-9.4791z" style="white-space:pre" aria-label="NM" />
            <path id="text408" transform="matrix(1.3471 0 0 1.3471 211.82 59.175)" d="m-43.499 426.53h-1.2565l-4.7721-7.3047v7.3047h-1.2565v-9.4791h1.2565l4.7851 7.3372v-7.3372h1.2435zm1.7122-3.5872q0-1.0352.40364-1.862.41016-.82682 1.1328-1.276.72916-.44921 1.6602-.44921 1.4388 0 2.3242.99609.89192.99609.89192 2.6497v.0846q0 1.0286-.39713 1.849-.39062.8138-1.1263 1.2695-.72916.45573-1.6797.45573-1.4323 0-2.3242-.9961-.88542-.99609-.88542-2.6367zm1.2109.14323q0 1.1719.54036 1.8815.54687.70964 1.4583.70964.91797 0 1.4583-.71615.54036-.72265.54036-2.0182 0-1.1588-.55338-1.875-.54687-.72265-1.4583-.72265-.89192 0-1.4388.70963-.54687.70963-.54687 2.0312zm10.117-2.5195q-.27344-.0456-.59245-.0456-1.1849 0-1.6081 1.0091v5h-1.2044v-7.0443h1.1719l.01953.8138q.59245-.944 1.6797-.944.35156 0 .53385.0911zm2.2396-1.0807.03255.78125q.77474-.91145 2.0898-.91145 1.4779 0 2.0117 1.1328.35156-.50781.91146-.82031.5664-.3125 1.3346-.3125 2.3177 0 2.3568 2.4544v4.72h-1.2044v-4.6484q0-.7552-.34505-1.1263-.34505-.3776-1.1589-.3776-.67057 0-1.1133.40364-.44271.39714-.51432 1.0742v4.6745h-1.2109v-4.6159q0-1.5364-1.5039-1.5364-1.1849 0-1.6211 1.0091v5.1432h-1.2044v-7.0443z" style="white-space:pre" aria-label="Norm" />
            <path id="text410" transform="matrix(1.3471 0 0 1.3471 207.96 30.891)" d="m-40.628 426.53h-1.2565v-4.3815h-4.7786v4.3815h-1.25v-9.4791h1.25v4.0755h4.7786v-4.0755h1.2565zm3.3398 0h-1.2044v-7.0443h1.2044zm-1.3021-8.9127q0-.29297.17578-.49479.18229-.20182.53385-.20182.35156 0 .53385.20182t.18229.49479-.18229.48828-.53385.19531q-.35156 0-.53385-.19531-.17578-.19531-.17578-.48828zm2.9427 5.332q0-1.6471.76172-2.6172.76172-.97656 2.0182-.97656 1.2891 0 2.0117.91145l.05859-.78125h1.1003v6.875q0 1.3672-.8138 2.1549-.80729.78776-2.1745.78776-.76172 0-1.4909-.32552t-1.1133-.89193l.625-.72265q.77474.95703 1.8945.95703.8789 0 1.3672-.49479.49479-.49479.49479-1.3932v-.60547q-.72265.83334-1.9727.83334-1.237 0-2.0052-.9961-.76172-.99609-.76172-2.7148zm1.2109.13672q0 1.1914.48828 1.875.48828.67708 1.3672.67708 1.1393 0 1.6732-1.0352v-3.2161q-.55338-1.0091-1.6602-1.0091-.8789 0-1.3737.68359-.49479.68359-.49479 2.0247zm7.7604-2.7474q.80078-.98307 2.0833-.98307 2.2331 0 2.2526 2.5195v4.6549h-1.2044v-4.6614q-.0065-.76172-.35156-1.1263-.33854-.36458-1.0612-.36458-.58594 0-1.0286.3125-.44271.3125-.6901.82031v5.0195h-1.2044v-10h1.2044z" style="white-space:pre" aria-label="High" />
            <path id="text411" transform="matrix(1.3471 0 0 1.3471 206.57 2.7834)" d="m-45.266 417.05 3.099 7.7344 3.099-7.7344h1.6211v9.4791h-1.25v-3.6914l.11719-3.9844-3.112 7.6758h-.95703l-3.1055-7.6562.1237 3.9648v3.6914h-1.25v-9.4791zm14.186 9.4791q-.10417-.20833-.16927-.74219-.83984.8724-2.0052.8724-1.0417 0-1.7122-.58594-.66406-.59245-.66406-1.4974 0-1.1003.83333-1.7057.83984-.61197 2.3568-.61197h1.1719v-.55339q0-.63151-.3776-1.0026-.3776-.3776-1.1133-.3776-.64453 0-1.0807.32552-.4362.32552-.4362.78775h-1.2109q0-.52734.37109-1.0156.3776-.49479 1.0156-.78125.64453-.28645 1.4128-.28645 1.2174 0 1.9075.61197.6901.60547.71614 1.6732v3.2422q0 .97005.2474 1.543v.10417zm-1.9987-.91797q.5664 0 1.0742-.29297.50781-.29296.73568-.76171v-1.4453h-.94401q-2.2135 0-2.2135 1.2956 0 .5664.3776.88541t.97005.31901zm7.2656-3.5547 1.5625-2.5716h1.4062l-2.3047 3.4831 2.3763 3.5612h-1.3932l-1.6276-2.6367-1.6276 2.6367h-1.3997l2.3763-3.5612-2.3047-3.4831h1.3932z" style="white-space:pre" aria-label="Max" />
            <path id="text412" transform="matrix(1.1674 0 0 1.1674 196.75 48.887)" d="m-42.627 418.08h-3.0469v8.4505h-1.2435v-8.4505h-3.0404v-1.0286h7.3307zm2.526 8.4505h-1.2044v-7.0443h1.2044zm-1.3021-8.9127q0-.29297.17578-.49479.18229-.20182.53385-.20182.35156 0 .53385.20182.18229.20182.18229.49479t-.18229.48828q-.18229.19531-.53385.19531-.35156 0-.53385-.19531-.17578-.19531-.17578-.48828zm4.362 1.8685.03255.78125q.77474-.91145 2.0898-.91145 1.4779 0 2.0117 1.1328.35156-.50781.91146-.82031.5664-.3125 1.3346-.3125 2.3177 0 2.3568 2.4544v4.72h-1.2044v-4.6484q0-.7552-.34505-1.1263-.34505-.3776-1.1589-.3776-.67057 0-1.1133.40364-.44271.39714-.51432 1.0742v4.6745h-1.2109v-4.6159q0-1.5364-1.5039-1.5364-1.1849 0-1.6211 1.0091v5.1432h-1.2044v-7.0443zm13.477 7.1745q-1.4323 0-2.3307-.9375-.89844-.94401-.89844-2.5195v-.22135q0-1.0482.39714-1.8685.40364-.82682 1.1198-1.289.72266-.46875 1.5625-.46875 1.3737 0 2.1354.90494.76172.90495.76172 2.5911v.5013h-4.7721q.02604 1.0417.60547 1.6862.58594.63802 1.4844.63802.63802 0 1.0807-.26042t.77474-.6901l.73568.57291q-.88541 1.3607-2.6562 1.3607zm-.14974-6.3151q-.72916 0-1.224.53385-.49479.52734-.61198 1.4844h3.5286v-.0911q-.05208-.91797-.49479-1.4193-.44271-.50781-1.1979-.50781zm11.256 2.3502h-2.2266v3.8346h-1.2565v-9.4791h3.138q1.6016 0 2.4609.72916.86588.72916.86588 2.1224 0 .88541-.48177 1.543-.47526.65755-1.3281.98307l2.2266 4.0234v.0781h-1.3411zm-2.2266-1.0221h1.9206q.93099 0 1.4779-.48177.55338-.48177.55338-1.2891 0-.8789-.52734-1.3476-.52083-.46875-1.5104-.47526h-1.9141zm9.694 4.987q-1.4323 0-2.3307-.9375-.89844-.94401-.89844-2.5195v-.22135q0-1.0482.39713-1.8685.40364-.82682 1.1198-1.289.72265-.46875 1.5625-.46875 1.3737 0 2.1354.90494.76172.90495.76172 2.5911v.5013h-4.7721q.026042 1.0417.60547 1.6862.58594.63802 1.4844.63802.63802 0 1.0807-.26042.44271-.26042.77474-.6901l.73568.57291q-.88541 1.3607-2.6562 1.3607zm-.14974-6.3151q-.72916 0-1.224.53385-.49479.52734-.61198 1.4844h3.5286v-.0911q-.052083-.91797-.49479-1.4193-.44271-.50781-1.1979-.50781zm5.4232-.85938.032552.78125q.77474-.91145 2.0898-.91145 1.4779 0 2.0117 1.1328.35156-.50781.91146-.82031.5664-.3125 1.3346-.3125 2.3177 0 2.3568 2.4544v4.72h-1.2044v-4.6484q0-.7552-.34505-1.1263-.34505-.3776-1.1589-.3776-.67057 0-1.1133.40364-.44271.39714-.51432 1.0742v4.6745h-1.2109v-4.6159q0-1.5364-1.5039-1.5364-1.1849 0-1.6211 1.0091v5.1432h-1.2044v-7.0443zm13.809 3.1966q0-1.4714.39062-2.8255.39713-1.3542 1.1784-2.4609.78125-1.1068 1.6211-1.5625l.2474.79427q-.95052.72916-1.5625 2.2266-.60547 1.4974-.66406 3.3528l-.0065.55339q0 2.513.91797 4.362.55338 1.1068 1.3151 1.7318l-.2474.73568q-.86588-.48177-1.6536-1.6146-1.5365-2.2135-1.5365-5.293zm12.077 3.8476h-1.2565v-4.3815h-4.7786v4.3815h-1.25v-9.4791h1.25v4.0755h4.7786v-4.0755h1.2565zm5.4818-5.0846h2.6432v1.1393h-2.6432v2.9948h-1.2109v-2.9948h-2.6432v-1.1393h2.6432v-2.7669h1.2109zm5.9114-4.3945 3.099 7.7344 3.099-7.7344h1.6211v9.4791h-1.25v-3.6914l.11719-3.9844-3.112 7.6758h-.95703l-3.1055-7.6562.1237 3.9648v3.6914h-1.25v-9.4791zm11.641 0 3.099 7.7344 3.099-7.7344h1.6211v9.4791h-1.25v-3.6914l.11719-3.9844-3.112 7.6758h-.95703l-3.1055-7.6562.1237 3.9648v3.6914h-1.25v-9.4791zm12.617 5.6966q0 1.4518-.38411 2.7864-.3776 1.3281-1.1654 2.4544-.78125 1.1263-1.6406 1.6016l-.2539-.73568q1.0026-.76823 1.6081-2.3828.61198-1.6211.625-3.5937v-.20833q0-1.3672-.28646-2.5391-.28646-1.1784-.80078-2.1094-.50781-.93098-1.1458-1.4518l.2539-.73568q.85937.47526 1.6341 1.5885.78125 1.1133 1.1654 2.4544.39062 1.3411.39062 2.8711z" style="white-space:pre" aria-label="Time Rem (H+MM)" />
            <path id="text120" transform="matrix(1.1799 0 0 1.1799 73.048 20.105)" d="m-20.55 424.06h-3.9713l-.89192 2.474h-1.2891l3.6198-9.4791h1.0937l3.6263 9.4791h-1.2825zm-3.5937-1.0286h3.2226l-1.6146-4.4336zm8.0078-3.5417.03906.88542q.80729-1.0156 2.1094-1.0156 2.2331 0 2.2526 2.5195v4.6549h-1.2044v-4.6614q-.0065-.76172-.35156-1.1263-.33854-.36458-1.0612-.36458-.58594 0-1.0286.3125t-.6901.82031v5.0195h-1.2044v-7.0443zm7.8515-1.7057v1.7057h1.3151v.93099h-1.3151v4.3685q0 .42318.17578.63802.17578.20833.59896.20833.20833 0 .57292-.0781v.97656q-.47526.13021-.92448.13021-.80729 0-1.2174-.48828t-.41016-1.3867v-4.3685h-1.2825v-.93099h1.2825v-1.7057zm4.0299 8.75h-1.2044v-7.0443h1.2044zm-1.3021-8.9127q0-.29297.17578-.49479.18229-.20182.53385-.20182t.53385.20182q.18229.20182.18229.49479t-.18229.48828q-.18229.19531-.53385.19531t-.53385-.19531q-.17578-.19531-.17578-.48828zm8.0599 8.9127h-1.25v-9.4791h1.25zm4.9219-.85286q.64453 0 1.1263-.39063.48177-.39062.53385-.97656h1.1393q-.03255.60547-.41667 1.1523-.38411.54688-1.0286.8724-.63802.32552-1.3542.32552-1.4388 0-2.2917-.95703-.84635-.96354-.84635-2.6302v-.20183q0-1.0286.3776-1.8294t1.0807-1.2435q.70963-.4427 1.6732-.4427 1.1849 0 1.9661.70963.78776.70963.83984 1.8424h-1.1393q-.052083-.68359-.52083-1.1198-.46224-.4427-1.1458-.4427-.91797 0-1.4258.66406-.5013.65755-.5013 1.9076v.22786q0 1.2174.5013 1.875.5013.65755 1.4323.65755zm7.0768.98307q-1.4323 0-2.3307-.9375-.89844-.94401-.89844-2.5195v-.22135q0-1.0482.39713-1.8685.40364-.82682 1.1198-1.289.72266-.46875 1.5625-.46875 1.3737 0 2.1354.90494.76172.90495.76172 2.5911v.5013h-4.7721q.02604 1.0417.60547 1.6862.58594.63802 1.4844.63802.63802 0 1.0807-.26042t.77474-.6901l.73568.57291q-.88542 1.3607-2.6562 1.3607zm-.14974-6.3151q-.72916 0-1.224.53385-.49479.52734-.61198 1.4844h3.5286v-.0911q-.05208-.91797-.49479-1.4193-.44271-.50781-1.1979-.50781z" style="white-space:pre" aria-label="Anti Ice" />
            <path id="text17" transform="matrix(1.1799 0 0 1.1799 140.18 20.105)" d="m-9.04 418.08h-3.0469v8.4505h-1.2435v-8.4505h-3.0404v-1.0286h7.3307zm3.8151 4.043-1.1589 1.2044v3.2031h-1.25v-9.4791h1.25v4.6875l4.2122-4.6875h1.5104l-3.7305 4.1862 4.0234 5.293h-1.4974zm8.7435.18229q-1.6081-.46224-2.3437-1.1328-.72916-.67708-.72916-1.6667 0-1.1198.89192-1.849.89844-.73567 2.3307-.73567.97656 0 1.7383.3776.76823.3776 1.1849 1.0417.42318.66407.42318 1.4518h-1.2565q0-.85937-.54687-1.3476-.54687-.49479-1.543-.49479-.92448 0-1.4453.41016-.51432.40364-.51432 1.1263 0 .57943.48828.98308.49479.39713 1.6732.72916 1.1849.33203 1.849.73568.67057.39713.98958.93098.32552.53386.32552 1.2565 0 1.1523-.89844 1.849-.89844.69011-2.4023.69011-.97656 0-1.8229-.3711-.84635-.3776-1.3086-1.0286-.45573-.65104-.45573-1.4779h1.2565q0 .85937.63151 1.3607.63802.49479 1.6992.49479.98958 0 1.5169-.40364.52734-.40365.52734-1.1003t-.48828-1.0742q-.48828-.38411-1.7708-.7552z" style="white-space:pre" aria-label="TKS" />
          </g>
          <rect id="rect29" x="102.77" y="517.89" width="8.375" height="2.0625" fill="#f9f9f9" stroke-linejoin="round" stroke-width="3" />
        </g>
      </svg>
    );
  }

  /**
   * Renders the L and R fuel bars of this panel.
   * @returns a VNode.
   */
  private renderBars(): VNode[] {

    const barArray: VNode[] = [];

    for (let barIndex = 0; barIndex < this.barInfoArray.length; barIndex++) {

      const theBar = this.barInfoArray[barIndex];
      const barHeight = 1;
      const barStyle = 'fill:' + this.barColor;

      const labelClass = 'label';

      barArray.push(
        <svg width="1024" height="687" version="1.1" viewBox="0 0 1024 687">
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

  /** @inheritdoc
   */
  private updateBar(barIndex: number, value: number): void {

    const theBar = this.barInfoArray[barIndex];

    theBar.outputSubject.set((value % 10).toFixed(1));  // one whole number and one decimal place: X.X

    let barHeight = this.map(value, theBar.minVal, theBar.maxVal, 0, this.maxBarHeight);

    // limit bar height
    if (barHeight > this.maxBarHeight) { barHeight = this.maxBarHeight; }
    if (barHeight <= 0) { barHeight = 1; }

    const barY = theBar.barOrigin.y - barHeight;

    theBar.barRef.instance.setAttribute('height', barHeight.toString());
    theBar.barRef.instance.setAttribute('y', barY.toString());
  }

  /** @inheritdoc
   */
  private renderNumbers(): VNode[] {

    const numbers: VNode[] = [];

    for (let numberIndex = 0; numberIndex < this.numberArray.length; numberIndex++) {

      const theNumber = this.numberArray[numberIndex];

      numbers.push(
        <svg width="1024" height="687" version="1.1" viewBox="0 0 1024 687">
          <g>
            <text
              x={theNumber.position.x}
              y={theNumber.position.y}
              dominant-baseline="middle"
              text-anchor={theNumber.align}
              class={theNumber.styleClass}
            >
              {theNumber.outputSubject}
            </text>
          </g>
        </svg>
      );
    }

    return numbers;
  }

  /** @inheritdoc
   */
  private updateNumber(numberIndex: number, value: number): void {

    const theNumber = this.numberArray[numberIndex];

    // Check for out of range
    let outOfRange = false;
    if (theNumber.minVal !== undefined && value <= theNumber.minVal) { outOfRange = true; }
    if (theNumber.maxVal !== undefined && value >= theNumber.maxVal) { outOfRange = true; }
    if (isNaN(value) || value === Infinity) { outOfRange = true; }

    let valueString = '';

    if (!outOfRange) {

      valueString = value.toFixed(theNumber.decimals);

      // Pad with zeros if necessary
      if (theNumber.minDigits !== undefined) {

        const wholeNumberString = value.toFixed(0).toString();

        if (wholeNumberString.length < theNumber.minDigits) {

          let zeroPadding = '';
          for (let i = 0; i < (theNumber.minDigits - wholeNumberString.length); i++) {
            zeroPadding += '0';
          }
          valueString = zeroPadding + valueString;
        }
      }
    } else {

      // Dash it out
      let dashOutString = '_';
      if (theNumber.dashOut !== undefined) {
        dashOutString = theNumber.dashOut;
      }
      valueString = dashOutString;
    }

    theNumber.outputSubject.set(valueString);
  }

  /** @inheritdoc
   */
  private updateFlowBox(value: number): void {
    if (value === this.maxFlow) {
      this.flowBoxRef.instance.setAttribute('visibility', 'visible');
      this.flowBoxRef.instance.setAttribute('y', (612.09 - 28 - 29).toString());
    } else if (value === this.highFlow) {
      this.flowBoxRef.instance.setAttribute('visibility', 'visible');
      this.flowBoxRef.instance.setAttribute('y', (612.09 - 28).toString());
    } else if (value === this.normFlow) {
      this.flowBoxRef.instance.setAttribute('visibility', 'visible');
      this.flowBoxRef.instance.setAttribute('y', '612.09');
    } else {
      this.flowBoxRef.instance.setAttribute('visibility', 'hidden');
    }
  }

  /** @inheritdoc
   */
  public render(): VNode {

    return (
      <div class='anti-ice-panel'>
        {this.renderStaticSVG()}
        {this.renderBars()}
        {this.renderNumbers()}
        <svg width="1024" height="687" version="1.1" viewBox="0 0 1024 687">
          <rect ref={this.flowBoxRef} x="139.83" y="612.09" width="124.41" height="27.538" fill="none" stroke="#00e0e0" stroke-width="2" />
        </svg>
      </div>
    );
  }

  /** @inheritdoc */
  public pause(): void {
    this.subs.forEach(sub => sub.pause());
  }

  /** @inheritdoc */
  public resume(): void {
    this.subs.forEach(sub => sub.resume(true));
  }

  /** @inheritdoc */
  public destroy(): void {
    this.subs.forEach(sub => sub.destroy());
  }
}
