import {
  FSComponent, VNode, DisplayComponent, ComponentProps,
  EventBus, ConsumerSubject, MappedSubject, Subscription,
} from '@microsoft/msfs-sdk';

import { DialGauge } from '../DialGauge/DialGauge';

import './OxygenPanel.css';

/** Props for an Oxygen Panel */
export interface OxygenPanelProps extends ComponentProps {
  /** The event bus */
  bus: EventBus,
}

/** Oxygen Panel component */
export class OxygenPanel extends DisplayComponent<OxygenPanelProps> {

  private subs: Subscription[] = [];

  // Colors
  private readonly greenColor = '#00bf00';
  private readonly amberColor = '#ffe937';
  private readonly redColor = '#f43d21';

  private oxygenSubject = ConsumerSubject.create(null, 1750);
  private oxygenMappedSubject = MappedSubject.create(
    ([oxygenPressure]): number => {
      return oxygenPressure;
    },
    this.oxygenSubject
  );

  /** @inheritdoc
   */
  public onAfterRender(): void {

    // Add subscriptions to subs array
    this.subs.push(this.oxygenSubject);
  }

  /** @inheritdoc
   */
  private renderStaticSVG(): VNode {
    return (
      <g>
        <defs id="defs1">
          <linearGradient id="linearGradient7" x1="54.575" x2="54.575" y1="131.62" y2="94.76" gradientUnits="userSpaceOnUse">
            <stop id="stop154" offset=".92293" />
            <stop id="stop155" stop-color="#454545" offset="1" />
          </linearGradient>
        </defs>
        <path id="path434" transform="matrix(7.155 0 0 7.155 30.388 -161.28)" d="m37.833 94.76 21.48 2e-6a1.3229 1.3229 45 011.3229 1.3229v19.107a1.3229 1.3229 135 01-1.3229 1.3229h-21.48a1.3229 1.3229 45 01-1.3229-1.3229v-19.107a1.3229 1.3229 135 011.3229-1.3229z" fill="url(#linearGradient7)" stroke="#9f9f9f" stroke-linecap="square" stroke-width=".26458" />
        <rect id="rect451" x="312.87" y="511.24" width="51.193" height="16.142" />
        <path id="text465" transform="matrix(1.1799 0 0 1.1799 343.92 20.105)" d="m-18.135 422.1q0 1.3932-.46875 2.4349-.46875 1.0352-1.3281 1.582-.85937.54688-2.0052.54688-1.1198 0-1.9857-.54688-.86588-.55338-1.3477-1.569-.47526-1.0221-.48828-2.3633v-.68359q0-1.3672.47526-2.4154.47526-1.0482 1.3411-1.6016.87239-.55989 1.9922-.55989 1.1393 0 2.0052.55338.87239.54687 1.3411 1.595.46875 1.0417.46875 2.4284zm-1.2435-.61198q0-1.6862-.67708-2.5846-.67708-.90495-1.8945-.90495-1.1849 0-1.8685.90495-.67708.89843-.69661 2.5v.69662q0 1.6341.68359 2.5716.6901.93099 1.8945.93099 1.2109 0 1.875-.8789.66406-.88542.68359-2.5326zm5.293.57291 1.5625-2.5716h1.4062l-2.3047 3.4831 2.3763 3.5612h-1.3932l-1.6276-2.6367-1.6276 2.6367h-1.3997l2.3763-3.5612-2.3047-3.4831h1.3932zm6.5495 2.7083 1.6406-5.2799h1.2891l-2.832 8.1315q-.65755 1.7578-2.0898 1.7578l-.22786-.0195-.44922-.0846v-.97656l.32552.026q.61198 0 .95052-.2474.34505-.24739.5664-.90494l.26693-.71615-2.513-6.9661h1.3151zm3.6328-1.8164q0-1.6471.76172-2.6172.76172-.97656 2.0182-.97656 1.2891 0 2.0117.91145l.058594-.78125h1.1003v6.875q0 1.3672-.8138 2.1549-.80729.78776-2.1745.78776-.76172 0-1.4909-.32552t-1.1133-.89193l.625-.72265q.77474.95703 1.8945.95703.8789 0 1.3672-.49479.49479-.49479.49479-1.3932v-.60547q-.72265.83334-1.9727.83334-1.237 0-2.0052-.9961-.76172-.99609-.76172-2.7148zm1.2109.13672q0 1.1914.48828 1.875.48828.67708 1.3672.67708 1.1393 0 1.6732-1.0352v-3.2161q-.55338-1.0091-1.6602-1.0091-.8789 0-1.3737.68359t-.49479 2.0247zm9.4791 3.5742q-1.4323 0-2.3307-.9375-.89844-.94401-.89844-2.5195v-.22135q0-1.0482.39713-1.8685.40364-.82682 1.1198-1.289.72265-.46875 1.5625-.46875 1.3737 0 2.1354.90494.76172.90495.76172 2.5911v.5013h-4.7721q.026042 1.0417.60547 1.6862.58594.63802 1.4844.63802.63802 0 1.0807-.26042.44271-.26042.77474-.6901l.73568.57291q-.88541 1.3607-2.6562 1.3607zm-.14974-6.3151q-.72916 0-1.224.53385-.49479.52734-.61198 1.4844h3.5286v-.0911q-.052083-.91797-.49479-1.4193-.44271-.50781-1.1979-.50781zm5.4297-.85938.03906.88542q.80729-1.0156 2.1094-1.0156 2.2331 0 2.2526 2.5195v4.6549h-1.2044v-4.6614q-.0065-.76172-.35156-1.1263-.33854-.36458-1.0612-.36458-.58594 0-1.0286.3125t-.6901.82031v5.0195h-1.2044v-7.0443z" fill="#fff" stroke-linecap="square" style="white-space:pre" aria-label="Oxygen" />
      </g>
    );
  }

  /** @inheritdoc
   */
  public render(): VNode {

    return (
      <div class='oxygen-panel'>
        <svg width="1024" height="687" version="1.1" viewBox="0 0 1024 687">
          {this.renderStaticSVG()}
        </svg>
        <div class='gauge-container'>
          <DialGauge bus={this.props.bus}
            scale={1.395}
            gaugeLabel={'Oxy PSI x100'}
            gaugeLabelYPos={0.72}
            gaugeLabelSize={11}
            displayNumberYPos={0.86}
            displayNumberSize={'11px'}
            decimals={0}
            roundTo={10}
            gaugeValueSubject={this.oxygenMappedSubject}
            majorTickNum={6}
            minorTickNum={3}
            minVal={0}
            maxVal={20}
            scaleFactor={100}
            colorArcs={
              [
                {
                  color: this.redColor,
                  start: 0,
                  stop: 4,
                },
                {
                  color: this.amberColor,
                  start: 4,
                  stop: 8,
                },
                {
                  color: this.greenColor,
                  start: 8,
                  stop: 20,
                },
              ]
            }
          />
        </div>
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
