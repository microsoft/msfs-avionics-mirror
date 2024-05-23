import { FSComponent, Wait, XPDRSimVarPublisher } from '@microsoft/msfs-sdk';

import { FmsUtils } from '@microsoft/msfs-garminsdk';

import { G3XTouchFsInstrument } from './G3XTouchFsInstrument';
import { InstrumentBackplaneNames } from './Instruments/InstrumentBackplaneNames';

/**
 * A secondary instrument for the G3X Touch.
 */
export class G3XTouchSecondaryFsInstrument extends G3XTouchFsInstrument {

  private readonly xpdrSimVarPublisher = new XPDRSimVarPublisher(this.bus);

  /**
   * Creates a new instance of G3XTouchFsInstrument.
   * @param instrument This instrument's parent BaseInstrument.
   */
  constructor(instrument: BaseInstrument) {
    super(instrument, false);

    this.backplane.addPublisher(InstrumentBackplaneNames.Xpdr, this.xpdrSimVarPublisher);

    this.doInit().catch(e => {
      console.error(e);
    });
  }

  /**
   * Performs initialization tasks.
   */
  private async doInit(): Promise<void> {
    await this.initPlugins();

    this.initPersistentSettings();

    this.backplane.init();

    this.initFlightPlans();

    this.fplSourceDataProvider.init();
    this.gpsIntegrityDataProvider.init();
    this.minimumsDataProvider.init();
    this.windDataProvider.init();
    this.vnavDataProvider.init();
    this.posHeadingDataProvider.init();
    this.comRadioSpacingDataProvider.init();
    this.navComSavedFrequenciesProvider.init();
    this.mapTerrainWxSettingCompatManager.init();

    this.trafficSystem?.init();

    this.casPowerStateManager.init();

    this.registerUiComponents();

    this.initNearestContext();

    FSComponent.render(
      this.renderComponents(),
      this.instrument.getChildById('Electricity')
    );

    this.initAvionicsStatusListener();
  }

  /** @inheritDoc */
  protected async initInternalFlightPlans(): Promise<void> {
    // Wait 2 seconds to allow the primary instrument time to initialize, then request a flight plan sync if we did not
    // receive any sync events to initialize the primary flight plan (which can happen if this instrument was
    // initialized after the primary instrument).
    await Wait.awaitDelay(2000);
    if (!this.fms.flightPlanner.hasFlightPlan(FmsUtils.PRIMARY_PLAN_INDEX)) {
      this.fms.flightPlanner.requestSync();
    }
  }
}
