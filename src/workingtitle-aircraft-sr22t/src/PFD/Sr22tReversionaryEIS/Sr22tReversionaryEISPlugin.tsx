import { EISPublisher, FSComponent, InstrumentEvents, MappedSubject, Subject, VNode, registerPlugin } from '@microsoft/msfs-sdk';
import { EISPageTypes, FuelComputer, G1000AvionicsPlugin, G1000ControlEvents, G1000PfdAvionicsPlugin, G1000PfdPluginBinder } from '@microsoft/msfs-wtg1000';

import { Sr22tReversionaryEngineMenu } from './Sr22tReversionaryEngineMenu';
import { Sr22tReversionarySecondaryEngineData } from './Sr22tReversionarySecondaryEngineData';
import { EnginePowerDisplay } from '../../MFD/Sr22tEIS/EnginePowerDisplay/EnginePowerDisplay';
import { ElectricalGauge, EngineTempGauge, FuelGauge, OilGauge } from '../../MFD/Sr22tEIS/Gauges';
import { Sr22tSimvarPublisher } from '../../MFD/Sr22tSimvarPublisher/Sr22tSimvarPublisher';

import './Sr22tReversionaryEISPlugin.css';

/** A plugin which configures the SR22T's EIS plugin. */
export class Sr22tReversionaryEISPlugin extends G1000AvionicsPlugin<G1000PfdPluginBinder> implements G1000PfdAvionicsPlugin {

  private readonly eisPublisher = new EISPublisher(this.binder.bus);
  private readonly simvarPublisher = new Sr22tSimvarPublisher(this.binder.bus);
  private readonly fuelComputer = new FuelComputer(this.binder.bus);

  private readonly subscriber = this.binder.bus.getSubscriber<G1000ControlEvents & InstrumentEvents>();

  private readonly eisContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly eisEngineTabRef = FSComponent.createRef<HTMLDivElement>();
  private readonly eisSystemTabRef = FSComponent.createRef<HTMLDivElement>();

  private readonly focusFirstTab = Subject.create<boolean>(true);
  private isMfdPoweredOn = Subject.create<boolean>(true);
  private reversionaryMode = Subject.create<boolean>(false);
  private screenState = Subject.create<ScreenState>(ScreenState.OFF);

  /** @inheritDoc */
  public renderToPfdInstruments(): VNode {
    return (
      <div class="sr22t-pfd-reversionary-eis" ref={this.eisContainerRef}>
        <div class={{ 'eis-engine-tab': true, 'hidden': this.focusFirstTab.map((v) => !v) }} ref={this.eisEngineTabRef}>
          <EnginePowerDisplay bus={this.binder.bus} />
          <FuelGauge bus={this.binder.bus} />
          <OilGauge bus={this.binder.bus} />
          <ElectricalGauge bus={this.binder.bus} />
          <EngineTempGauge bus={this.binder.bus} />
        </div>
        <div class={{ 'eis-system-tab': true, 'hidden': this.focusFirstTab }} ref={this.eisSystemTabRef}>
          <Sr22tReversionarySecondaryEngineData bus={this.binder.bus} />
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public onInstalled(): void {
    this.binder.backplane.addInstrument('fuelComputer', this.fuelComputer);
    this.binder.backplane.addPublisher('Sr22tEIS', this.eisPublisher);
    this.binder.backplane.addPublisher('Sr22tSimvar', this.simvarPublisher);
  }

  /** @inheritDoc */
  public onMenuSystemInitialized(): void {
    this.binder.menuSystem.addMenu('engine-menu', new Sr22tReversionaryEngineMenu(
      this.binder.menuSystem,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.binder.backplane.getPublisher('g1000Control')!
    ));
  }

  /** @inheritDoc */
  public onViewServiceInitialized(): void {
    this.reversionaryMode.sub((isReversionary: boolean) => {
      this.eisContainerRef.instance.classList.toggle('hidden', !isReversionary);
      this.focusFirstTab.set(isReversionary);
    }, true);

    this.subscriber.on('eis_reversionary_tab_select').handle((page: EISPageTypes) => {
      this.focusFirstTab.set(page === 0);
    });

    this.subscriber.on('vc_screen_state').handle((event) => this.screenState.set(event.current));

    this.binder.bus.on('mfd_power_on', (isMfdPoweredOn) => this.isMfdPoweredOn.set(isMfdPoweredOn));

    MappedSubject.create(this.screenState, this.isMfdPoweredOn)
      .sub(([screenState, isMfdPoweredOn]) => this.checkIsReversionary(screenState, isMfdPoweredOn), true);
  }

  /**
   * Sets whether or not the instrument is in reversionary mode.
   * @param screenState The PFD screen state.
   * @param isMfdPoweredOn Whether MFD is powered on.
   */
  private checkIsReversionary(screenState: ScreenState, isMfdPoweredOn: boolean): void {
    if (document.body.hasAttribute('reversionary')) {
      const attr = document.body.getAttribute('reversionary');
      if (attr == 'true') {
        this.reversionaryMode.set(true);
      }
    } else if (screenState === ScreenState.REVERSIONARY || (screenState === ScreenState.ON && !isMfdPoweredOn)) {
      this.reversionaryMode.set(true);
    } else {
      this.reversionaryMode.set(false);
    }
  }
}

registerPlugin(Sr22tReversionaryEISPlugin);
