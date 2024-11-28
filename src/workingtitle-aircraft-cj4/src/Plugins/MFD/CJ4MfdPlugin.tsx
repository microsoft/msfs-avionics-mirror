import { DisplayComponent, FSComponent, FuelSystemSimVarPublisher, PerformancePlanRepository, registerPlugin, VNode } from '@microsoft/msfs-sdk';

import { MfdTextPagesContext, SystemsPageComponent, WT21MfdAvionicsPlugin, WT21MfdPluginSystemsPageDefinition } from '@microsoft/msfs-wt21-mfd';
import { WT21MfdTextPage } from '@microsoft/msfs-wt21-shared';

import { CJ4FilePaths } from '../Shared/CJ4FilePaths';
import { CJ4VarPublisher } from '../Shared/CJ4VarPublisher';
import { Cj4FuelSystem } from '../Shared/Fuel/CJ4FuelSystem';
import { CJ4_PERFORMANCE_PLAN_DEFINITIONS, CJ4PerformancePlan } from '../Shared/Performance/CJ4PerformancePlan';
import { EisInstrument, EngineIndicationDisplayContainer } from './Components/EngineIndication';
import { Systems1 } from './Components/SystemsOverlay/Systems1';
import { Systems2 } from './Components/SystemsOverlay/Systems2';
import { TORefPage } from './Pages/TORefPage';
import { CJ4ElectricalSystem } from './Systems/Electrical/CJ4ElectricalSystem';

import './CJ4MfdPlugin.css';

enum CJ4MfdPluginBackplaneKeys {
  Eis = 'cj4.mfd.eis',
  Vars = 'cj4.mfd.vars',
  Fuel = 'cj4.mfd.fuel',
  ElectricSystem = 'cj4.mfd-sys.elec'
}

/**
 * CJ4 PFD plugin
 */
export class CJ4MfdPlugin extends WT21MfdAvionicsPlugin {
  public readonly cj4PerformancePlanRepository = new PerformancePlanRepository<CJ4PerformancePlan>(
    'wt.cj4.wt21perf',
    this.binder.bus,
    this.binder.flightPlanner,
    CJ4_PERFORMANCE_PLAN_DEFINITIONS,
  );

  private readonly eis = new EisInstrument(this.binder.bus);
  private readonly varPublisher = new CJ4VarPublisher(this.binder.bus);
  private readonly fuelPublisher = new FuelSystemSimVarPublisher(this.binder.bus);

  private fuelSystem = new Cj4FuelSystem(this.binder.bus);
  private electricalSystem = new CJ4ElectricalSystem(this.binder.bus);

  /** @inheritdoc */
  public onInstalled(): void {
    this.binder.backplane.addPublisher(CJ4MfdPluginBackplaneKeys.Eis, this.eis);
    this.binder.backplane.addPublisher(CJ4MfdPluginBackplaneKeys.Vars, this.varPublisher);
    this.binder.backplane.addPublisher(CJ4MfdPluginBackplaneKeys.Fuel, this.fuelPublisher);
    if (this.binder.isPrimaryInstrument) {
      this.binder.backplane.addInstrument(CJ4MfdPluginBackplaneKeys.ElectricSystem, this.electricalSystem);
    }

    this.loadCss(`${CJ4FilePaths.PLUGINS_PATH}/CJ4MfdPlugins.css`);
  }

  /** @inheritDoc */
  public renderEis(): VNode {
    return (
      <EngineIndicationDisplayContainer bus={this.binder.bus} eis={this.eis} />
    );
  }

  /** @inheritDoc */
  public renderSystemPages(): WT21MfdPluginSystemsPageDefinition[] {
    const refs = [
      FSComponent.createRef<DisplayComponent<any> & SystemsPageComponent>(),
      FSComponent.createRef<DisplayComponent<any> & SystemsPageComponent>(),
    ];

    return [
      { ref: refs[0], vnode: <Systems1 ref={refs[0]} eis={this.eis} /> },
      { ref: refs[1], vnode: <Systems2 bus={this.binder.bus} ref={refs[1]} eis={this.eis} /> },
    ];
  }

  /** @inheritDoc */
  registerExtraMfdTextPages(context: MfdTextPagesContext): void {
    // This page handles both TO and APPR
    context.addTextPage(WT21MfdTextPage.TakeoffRef, (ref) => {
      return <TORefPage
        ref={ref}
        bus={this.binder.bus}
        mfdIndex={this.binder.displayUnitIndex}
        performancePlan={this.cj4PerformancePlanRepository.getActivePlan()}
      />;
    });
  }
}

registerPlugin(CJ4MfdPlugin);
