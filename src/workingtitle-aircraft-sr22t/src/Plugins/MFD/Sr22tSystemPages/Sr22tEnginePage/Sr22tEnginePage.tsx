import { ConsumerSubject, EngineEvents, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { MFDUiPage, MFDUiPageProps } from '@microsoft/msfs-wtg1000';

import { Sr22tEngineComputerEvents } from '../../Sr22tEcu/Sr22tEngineComputer';
import { AirDataPanel } from './Components/AirDataPanel/AirDataPanel';
import { AntiIcePanel } from './Components/AntiIcePanel/AntiIcePanel';
import { DialGauge } from './Components/DialGauge/DialGauge';
import { DualDialGauge } from './Components/DualDialGauge/DualDialGauge';
import { ElectricalPanel } from './Components/ElectricalPanel/ElectricalPanel';
import { EngTempPanel } from './Components/EngTempPanel/EngTempPanel';
import { FuelPanel } from './Components/FuelPanel/FuelPanel';
import { OxygenPanel } from './Components/OxygenPanel/OxygenPanel';

import './Sr22tEnginePage.css';

/** Component props for {@link Sr22tEnginePage}. */
export interface Sr22tEnginePageProps extends MFDUiPageProps {
  /** The event bus. */
  bus: EventBus;
}

/** A page which displays the SR22T engine data. */
export class Sr22tEnginePage extends MFDUiPage<Sr22tEnginePageProps> {

  private readonly engTempPanelRef = FSComponent.createRef<EngTempPanel>();
  private readonly electricalPanelRef = FSComponent.createRef<ElectricalPanel>();
  private readonly fuelPanelRef = FSComponent.createRef<FuelPanel>();
  private readonly antiIcePanelRef = FSComponent.createRef<AntiIcePanel>();
  private readonly oxygenPanelRef = FSComponent.createRef<OxygenPanel>();
  private readonly airDataPanelRef = FSComponent.createRef<AirDataPanel>();

  private readonly pctPower = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tEngineComputerEvents>().on('ecu-percent-power'), 0);

  /** Power gauge value */
  private readonly rpmSubject = ConsumerSubject.create(this.props.bus.getSubscriber<EngineEvents>().on('rpm_1').withPrecision(0), 0);  // RPM

  /** Manifold Pressure gauge value */
  private readonly manPressSubject = ConsumerSubject.create(this.props.bus.getSubscriber<EngineEvents>().on('eng_manifold_pressure_1').withPrecision(1), 0)
    .map((manPress) => manPress * 2.03602);

  /** Fuel Flow gauge value, GPH */
  private readonly fuelFlowSubject = ConsumerSubject.create(this.props.bus.getSubscriber<EngineEvents>().on('fuel_flow_1').withPrecision(1), 0);
  private readonly fuelFlowArcStart = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tEngineComputerEvents>().on('ecu-fuelflow-min'), 0);
  private readonly fuelFlowArcStop = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tEngineComputerEvents>().on('ecu-fuelflow-max'), 0);
  private readonly fuelFlowTarget = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tEngineComputerEvents>().on('ecu-fuelflow-target'), 0);

  /** Oil Temperature gauge value */
  private readonly oilTempSubject = ConsumerSubject.create(this.props.bus.getSubscriber<EngineEvents>().on('oil_temp_1').withPrecision(1), 0);

  /** Oil Temperature gauge value */
  private readonly oilPressSubject = ConsumerSubject.create(this.props.bus.getSubscriber<EngineEvents>().on('oil_press_1').withPrecision(1), 0);

  // Colors
  private readonly greenColor = '#00bf00';
  private readonly amberColor = '#ffe937';
  private readonly redColor = '#f43d21';

  /** @inheritdoc */
  constructor(props: Sr22tEnginePageProps) {
    super(props);
    this._title.set('EIS - Engine');
  }

  /** @inheritdoc */
  public onViewResumed(): void {
    super.onViewResumed();

    this.engTempPanelRef.instance.resume();
    this.electricalPanelRef.instance.resume();
    this.fuelPanelRef.instance.resume();
    this.antiIcePanelRef.instance.resume();
    this.oxygenPanelRef.instance.resume();
    this.airDataPanelRef.instance.resume();
  }

  /** @inheritdoc */
  public onViewPaused(): void {
    super.onViewPaused();

    this.engTempPanelRef.instance.pause();
    this.electricalPanelRef.instance.pause();
    this.fuelPanelRef.instance.pause();
    this.antiIcePanelRef.instance.pause();
    this.oxygenPanelRef.instance.pause();
    this.airDataPanelRef.instance.pause();
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    return;
  }

  /** @inheritDoc */
  public render(): VNode {

    return (
      <div class='mfd-page sr22t-engine-page' ref={this.viewContainerRef}>
        <div class='sr22t-engine-page-container'>
          <div class='gauge-container'>
            <DialGauge bus={this.props.bus}
              scale={1.9}
              gaugeLabel={'% Power'}
              gaugeLabelYPos={0.65}
              gaugeLabelSize={8}
              displayNumberYPos={0.8}
              displayNumberSize={'16px'}
              decimals={0}
              roundTo={1}
              gaugeValueSubject={this.pctPower}
              majorTickNum={6}
              minorTickNum={3}
              minVal={0}
              maxVal={100}
              scaleFactor={1}
              colorArcs={
                [
                  {
                    color: this.greenColor,
                    start: 0,
                    stop: 100,
                  },
                ]
              }
            />
            <DialGauge bus={this.props.bus}
              scale={1.9}
              gaugeLabel={'RPM x 100'}
              gaugeLabelYPos={0.65}
              gaugeLabelSize={8}
              displayNumberYPos={0.8}
              displayNumberSize={'16px'}
              decimals={0}
              roundTo={10}
              gaugeValueSubject={this.rpmSubject}
              majorTickNum={7}
              minorTickNum={4}
              minVal={0}
              maxVal={30}
              scaleFactor={100}
              colorArcs={
                [
                  {
                    color: this.greenColor,
                    start: 5,
                    stop: 25.5,
                  },
                  {
                    color: this.redColor,
                    start: 25.5,
                    stop: 30,
                  },
                ]
              }
            />
            <DialGauge bus={this.props.bus}
              scale={1.9}
              gaugeLabel={'Man "Hg'}
              gaugeLabelYPos={0.65}
              gaugeLabelSize={8}
              displayNumberYPos={0.8}
              displayNumberSize={'16px'}
              decimals={1}
              roundTo={0.1}
              gaugeValueSubject={this.manPressSubject}
              majorTickNum={7}
              minorTickNum={4}
              minVal={10}
              maxVal={40}
              scaleFactor={1}
              colorArcs={
                [
                  {
                    color: this.greenColor,
                    start: 15,
                    stop: 36.5,
                  },
                  {
                    color: this.amberColor,
                    start: 36.5,
                    stop: 37.5,
                  },
                  {
                    color: this.redColor,
                    start: 37.5,
                    stop: 40,
                  },
                ]
              }
            />
            <DialGauge bus={this.props.bus}
              scale={1.9}
              gaugeLabel={'FFlow GPH'}
              gaugeLabelYPos={0.65}
              gaugeLabelSize={8}
              displayNumberYPos={0.8}
              displayNumberSize={'16px'}
              decimals={1}
              roundTo={0.1}
              gaugeValueSubject={this.fuelFlowSubject}
              majorTickNum={10}
              minorTickNum={1}
              minVal={0}
              maxVal={45}
              scaleFactor={1}
              colorArcs={
                [
                  {
                    color: this.greenColor,
                    start: 0,
                    stop: 0,
                    dynamicStart: this.fuelFlowArcStart,
                    dynamicStop: this.fuelFlowArcStop,
                  },
                ]
              }
              target={this.fuelFlowTarget}
            />
            <DualDialGauge bus={this.props.bus}
              gaugeLabel={'Oil'}
              gauges={{
                leftGauge: {
                  decimals: 0,
                  roundTo: 1,
                  gaugeValueSubject: this.oilTempSubject,
                  gaugeOrientation: -80,
                  direction: 1,
                  minVal: 75,
                  maxVal: 250,
                  scaleFactor: 1,
                  majorTicks: [
                    {
                      value: 75,
                      color: 'white',
                      label: true,
                    },
                    {
                      value: 100,
                      color: 'white',
                      label: true,
                    },
                    {
                      value: 150,
                      color: 'white',
                      label: true,
                    },
                    {
                      value: 200,
                      color: 'white',
                      label: true,
                    },
                    {
                      value: 250,
                      color: 'white',
                      label: true,
                    },
                  ],
                  minorTicks: [
                    {
                      value: 125,
                      color: 'white',
                    },
                    {
                      value: 175,
                      color: 'white',
                    },
                    {
                      value: 225,
                      color: 'white',
                    },
                  ],
                  colorArcs: [
                    {
                      color: this.greenColor,
                      start: 100,
                      stop: 240,
                    },
                    {
                      color: this.redColor,
                      start: 240,
                      stop: 250,
                    },
                  ],
                },
                rightGauge: {
                  decimals: 0,
                  roundTo: 1,
                  gaugeValueSubject: this.oilPressSubject,
                  gaugeOrientation: 180,
                  direction: -1,
                  minVal: 0,
                  maxVal: 100,
                  scaleFactor: 1,
                  majorTicks: [
                    {
                      value: 0,
                      color: 'white',
                      label: true,
                    },
                    {
                      value: 30,
                      color: 'white',
                      label: true,
                    },
                    {
                      value: 60,
                      color: 'white',
                      label: true,
                    },
                    {
                      value: 90,
                      color: 'white',
                      label: true,
                    },
                    {
                      value: 100,
                      color: this.redColor,
                      label: false,
                    },
                  ],
                  minorTicks: [
                    {
                      value: 10,
                      color: 'white',
                    },
                    {
                      value: 20,
                      color: 'white',
                    },
                    {
                      value: 40,
                      color: 'white',
                    },
                    {
                      value: 50,
                      color: 'white',
                    },
                    {
                      value: 70,
                      color: 'white',
                    },
                    {
                      value: 80,
                      color: 'white',
                    },
                  ],
                  colorArcs: [
                    {
                      color: this.redColor,
                      start: 0,
                      stop: 10,
                    },
                    {
                      color: this.amberColor,
                      start: 10,
                      stop: 30,
                    },
                    {
                      color: this.greenColor,
                      start: 30,
                      stop: 60,
                    },
                    {
                      color: this.amberColor,
                      start: 60,
                      stop: 100,
                    },
                  ],
                },
              }}
            />
          </div>

          <EngTempPanel ref={this.engTempPanelRef} bus={this.props.bus} />
          <ElectricalPanel ref={this.electricalPanelRef} bus={this.props.bus} />
          <FuelPanel ref={this.fuelPanelRef} bus={this.props.bus} />
          <AntiIcePanel ref={this.antiIcePanelRef} bus={this.props.bus} />
          <OxygenPanel ref={this.oxygenPanelRef} bus={this.props.bus} />
          <AirDataPanel ref={this.airDataPanelRef} bus={this.props.bus} />

        </div>
      </div>
    );
  }
}
