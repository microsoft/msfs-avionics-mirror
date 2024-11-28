import { AntiIcePublisher, FSComponent, registerPlugin } from '@microsoft/msfs-sdk';

import { G1000AvionicsPlugin } from '@microsoft/msfs-wtg1000';

import { Sr22tAntiIceCalculator, Sr22tEngineTemperatureDataInstrument, Sr22tFilePaths } from '../../Shared';
import { Sr22tChecklistRepository } from '../../Shared/ChecklistSystem';
import { Sr22tSimvarPublisher } from '../Sr22tSimvarPublisher/Sr22tSimvarPublisher';
import { Sr22tChecklistPage } from './Sr22tChecklistPage/Sr22tChecklistPage';
import { Sr22tEnginePage } from './Sr22tEnginePage/Sr22tEnginePage';
import { Sr22tFuelPage } from './Sr22tFuelPage/Sr22tFuelPage';
import {
  replaceChecklistMenuItems, replaceEngineSoftkeys, Sr22tMfdAntiIceMenu, Sr22tMfdChecklistMenu, Sr22tMfdEngineMenu, Sr22tMfdFuelMenu,
  Sr22tMfdRootMenu, Sr22tMfdSoftkeyMenuTypes, Sr22tMfdTripPlanningMenu,
  Sr22tMfdWeightBalanceGraphMenu, Sr22tMfdWeightBalanceMenu
} from './Sr22tMfdSoftkeyMenu';
import { Sr22tTripPlanningPage } from './Sr22tTripPlanningPage/Sr22tTripPlanningPage';
import { Sr22tWeightBalancePage } from './Sr22tWeightBalancePage/Sr22tWeightBalancePage';
import { TripPlanningStore, WeightBalanceStore } from './Stores';
import { Sr22tChecklistCategorySelectionPopup, Sr22tChecklistPageMenuDialog, Sr22tChecklistSelectionPopup } from './Sr22tChecklistPage/Components';

import './Sr22tSystemPagesPlugin.css';
import '../../Shared/Common/Sr22t_Common.css';

/**
 * A plugin which configures the SR22T's System Pages plugin.
 */
export class Sr22tSystemPagesPlugin extends G1000AvionicsPlugin {
  private readonly antiIceCalculator = new Sr22tAntiIceCalculator(this.binder.bus);
  private readonly weightBalanceStore = new WeightBalanceStore(this.binder.bus);
  private readonly tripPlanningStore = new TripPlanningStore();
  private readonly engineTempInstrument = new Sr22tEngineTemperatureDataInstrument(this.binder.bus);
  private readonly checklistRepository = new Sr22tChecklistRepository(this.binder.bus);

  private readonly sr22tSimvarPublisher = new Sr22tSimvarPublisher(this.binder.bus);
  private readonly antiIcePublisher = new AntiIcePublisher(this.binder.bus);

  /** @inheritDoc */
  public onInstalled(): void {
    this.loadCss(`${Sr22tFilePaths.PLUGINS_PATH}/SR22TMfdPlugins.css`);

    this.binder.backplane.addPublisher('SR22T', this.sr22tSimvarPublisher);
    this.binder.backplane.addPublisher('AntiIce', this.antiIcePublisher);

    this.engineTempInstrument.init();
  }

  /** @inheritDoc */
  public onMenuSystemInitialized(): void {
    this.binder.menuSystem.addMenu(Sr22tMfdSoftkeyMenuTypes.Root, new Sr22tMfdRootMenu(this.binder.menuSystem, this.binder.viewService));
    this.binder.menuSystem.addMenu(Sr22tMfdSoftkeyMenuTypes.Engine, new Sr22tMfdEngineMenu(this.binder.menuSystem, this.binder.viewService, this.binder.bus));
    this.binder.menuSystem.addMenu(Sr22tMfdSoftkeyMenuTypes.Fuel, new Sr22tMfdFuelMenu(this.binder.menuSystem, this.binder.viewService));
    this.binder.menuSystem.addMenu(Sr22tMfdSoftkeyMenuTypes.WeightBalance, new Sr22tMfdWeightBalanceMenu(this.binder.menuSystem, this.binder.viewService));
    this.binder.menuSystem.addMenu(Sr22tMfdSoftkeyMenuTypes.WBGraph, new Sr22tMfdWeightBalanceGraphMenu(this.binder.menuSystem, this.binder.viewService));
    this.binder.menuSystem.addMenu(Sr22tMfdSoftkeyMenuTypes.TripPlanning, new Sr22tMfdTripPlanningMenu(this.binder.menuSystem, this.binder.viewService, this.tripPlanningStore));
    this.binder.menuSystem.addMenu(
      Sr22tMfdSoftkeyMenuTypes.Checklist,
      new Sr22tMfdChecklistMenu(this.binder.menuSystem, this.binder.viewService, this.checklistRepository)
    );
    this.binder.menuSystem.addMenu(Sr22tMfdSoftkeyMenuTypes.AntiIce, new Sr22tMfdAntiIceMenu(this.binder.menuSystem));

    replaceChecklistMenuItems(this.binder.menuSystem, this.binder.viewService);
    replaceEngineSoftkeys(this.binder.menuSystem, this.binder.viewService);
  }

  /** @inheritDoc */
  public onViewServiceInitialized(): void {
    this.binder.viewService.registerView('Sr22tEnginePage', () => {
      return (
        <Sr22tEnginePage
          bus={this.binder.bus}
          viewService={this.binder.viewService}
          menuSystem={this.binder.menuSystem}
        />
      );
    });
    this.binder.viewService.registerView('Sr22tFuelPage', () => {
      return (
        <Sr22tFuelPage
          bus={this.binder.bus}
          viewService={this.binder.viewService}
          menuSystem={this.binder.menuSystem}
        />
      );
    });
    this.binder.viewService.registerView('Sr22tWeightBalancePage', () => {
      return (
        <Sr22tWeightBalancePage
          bus={this.binder.bus}
          weightBalanceStore={this.weightBalanceStore}
          viewService={this.binder.viewService}
          menuSystem={this.binder.menuSystem}
        />
      );
    });
    this.binder.viewService.registerView('Sr22tTripPlanningPage', () => {
      return (
        <Sr22tTripPlanningPage
          bus={this.binder.bus}
          tripPlanningStore={this.tripPlanningStore}
          viewService={this.binder.viewService}
          menuSystem={this.binder.menuSystem}
          fms={this.binder.fms}
        />
      );
    });
    this.binder.viewService.registerView('Sr22tChecklistPage', () => {
      return (
        <Sr22tChecklistPage
          bus={this.binder.bus}
          repo={this.checklistRepository}
          viewService={this.binder.viewService}
          menuSystem={this.binder.menuSystem}
        />
      );
    });
    this.binder.viewService.registerView('Sr22tChecklistCategorySelectionPopup', () => {
      return (
        <Sr22tChecklistCategorySelectionPopup
          viewService={this.binder.viewService}
          menuSystem={this.binder.menuSystem}
          repo={this.checklistRepository}
          title={''}
          showTitle={false}
        />
      );
    });
    this.binder.viewService.registerView('Sr22tChecklistSelectionPopup', () => {
      return (
        <Sr22tChecklistSelectionPopup
          viewService={this.binder.viewService}
          menuSystem={this.binder.menuSystem}
          repo={this.checklistRepository}
          title={''}
          showTitle={false}
        />
      );
    });
    this.binder.viewService.registerView('ChecklistPageMenuDialog', () => {
      return <Sr22tChecklistPageMenuDialog viewService={this.binder.viewService} title="Page Menu" showTitle={true} />;
    });
  }

  /** @inheritDoc */
  public onPageSelectMenuSystemInitialized(): void {
    const pageList = this.binder.pageSelectMenuSystem?.getPageList(2);
    if (pageList) {
      pageList.items.unshift({ name: 'Weight and Balance', key: 'Sr22tWeightBalancePage' });
      const tripIndex = pageList.items.findIndex(item => item?.name === 'Trip Planning');
      pageList.items[tripIndex >= 0 ? tripIndex : 1] = { name: 'Trip Planning', key: 'Sr22tTripPlanningPage' };
      this.binder.pageSelectMenuSystem?.setPageList(2, pageList);
      this.binder.pageSelectMenuSystem?.compute();
    }
  }
}

registerPlugin(Sr22tSystemPagesPlugin);
