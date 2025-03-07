import {
  ChartMetadata, ComponentProps, DisplayComponent, EventBus, FSComponent, IcaoValue, MappedSubject, PluginSystem, Subject, Subscription, UserSettingManager,
  VNode
} from '@microsoft/msfs-sdk';

import {
  ButtonBoxArrow, ButtonMenu, Epic2Fms, FlightPlanStore, MfdAliasedUserSettingTypes, ModalKey, ModalService, SectionOutline, TabMenuItem, Tabs, TouchButton,
  UpperMfdDisplayPage
} from '@microsoft/msfs-epic2-shared';

import { Epic2UpperMfdAvionicsPlugin, Epic2UpperMfdPluginBinder } from '../Epic2UpperMfdAvionicsPlugin';
import { ChartsAirportDropdownLabel } from './Components/ChartAirportDropdownLabel';
import { ChartSelectionDropdown } from './Components/ChartSelectionDropdown';
import { ChartViewer } from './Components/ChartViewer';
import { ChartAreaViewPages, Epic2ChartDisplayCategories } from './Epic2ChartTypes';
import { ChartsAirportSearch } from './Modal/ChartAirportSearchDialog';
import { Epic2ChartsProvider } from './Providers/Epic2ChartsProvider';
import { FaaChartProvider } from './Providers/FaaChartProvider';
import { LidoChartProvider } from './Providers/LidoChartProvider';

import './ChartsDisplay.css';

/** The properties for the {@link ChartsDisplay} component. */
interface ChartsDisplayProps extends ComponentProps {
  /** The event bus */
  readonly bus: EventBus;
  /** The settings manager to use. */
  readonly settings: UserSettingManager<MfdAliasedUserSettingTypes>;
  /** The aircraft fms */
  readonly fms: Epic2Fms;
  /** The active flight plan store */
  readonly store: FlightPlanStore;
  /** The modal service */
  readonly modalService: ModalService;
  /** The plugin system */
  readonly pluginSystem: PluginSystem<Epic2UpperMfdAvionicsPlugin, Epic2UpperMfdPluginBinder>
}

/** An epic2 chart display pane */
export class ChartsDisplay extends DisplayComponent<ChartsDisplayProps> {
  private readonly chartContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly viewerContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly dropdownRef = FSComponent.createRef<ChartSelectionDropdown>();

  private readonly chartTabs: Readonly<Record<Epic2ChartDisplayCategories, TabMenuItem>> = {
    [Epic2ChartDisplayCategories.Airport]: {
      name: Epic2ChartDisplayCategories.Airport,
      renderLabel: () => 'Aprt',
    },
    [Epic2ChartDisplayCategories.SID]: {
      name: Epic2ChartDisplayCategories.SID,
      renderLabel: () => 'SID',
    },
    [Epic2ChartDisplayCategories.STAR]: {
      name: Epic2ChartDisplayCategories.STAR,
      renderLabel: () => 'STAR',
    },
    [Epic2ChartDisplayCategories.Approach]: {
      name: Epic2ChartDisplayCategories.Approach,
      renderLabel: () => 'App',
    },
    [Epic2ChartDisplayCategories.Noise]: {
      renderLabel: () => 'Noise',
      isDisabled: true
    },
    [Epic2ChartDisplayCategories.NOTAM]: {
      renderLabel: () => 'NOTAM',
      isDisabled: true
    },
    [Epic2ChartDisplayCategories.Airspace]: {
      renderLabel: () => 'Airsp',
      isDisabled: true
    },
  };
  private readonly activeTab = Subject.create(this.chartTabs[Epic2ChartDisplayCategories.Airport]);

  private readonly originIcao = this.props.store.originFacility.map((fac) => fac ? fac.icaoStruct : null);
  private readonly destIcao = this.props.store.destinationFacility.map((fac) => fac ? fac.icaoStruct : null);
  public readonly selectedAirport = Subject.create<IcaoValue | null>(null);
  private readonly selectedAirportType = MappedSubject.create(([airport, originAirport, destAirport]) => {
    if (airport) {
      if (airport === originAirport) {
        return 'Orig';
      } else if (airport === destAirport) {
        return 'Dest';
      } else {
        return 'Search';
      }
    } else {
      return '';
    }
  }, this.selectedAirport, this.originIcao, this.destIcao);

  private readonly chartProviders: Record<string, Epic2ChartsProvider> = {
    'LIDO': new LidoChartProvider(),
    'FAA': new FaaChartProvider()
  };
  private readonly selectedProviderKey = Subject.create<string>('LIDO');
  private readonly chartsProvider = this.selectedProviderKey.map((v) => this.chartProviders[v] ?? this.chartProviders.LIDO);
  private readonly selectedChart = Subject.create<ChartMetadata | null>(null);
  private readonly selectedChartViewAreaPage = Subject.create(ChartAreaViewPages.ChartViewer);

  private searchSelectedAirportSub?: Subscription;

  /**
   * Opens the airport search modal
   */
  private openAirportSearch(): void {
    if (this.searchSelectedAirportSub) {
      this.searchSelectedAirportSub.destroy();
    }
    this.searchSelectedAirportSub = this.props.modalService.open<ChartsAirportSearch>(ModalKey.ChartAirportSearch).modal.selectedAirport.sub((fac) => {
      if (fac) {
        this.selectedAirport.set(fac.icaoStruct);
      }
    }, true);
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.settings.whenSettingChanged('upperMfdDisplayPage').handle(
      (page) => this.chartContainerRef.instance.style.display = page === UpperMfdDisplayPage.Charts ? 'block' : 'none'
    );
    this.chartContainerRef.instance.style.display = this.props.settings.getSetting('upperMfdDisplayPage').get() === UpperMfdDisplayPage.Charts ? 'block' : 'none';

    this.originIcao.sub((v) => this.selectedAirport.get() === null && this.selectedAirport.set(v));

    this.renderProviderOptions();
  }

  /**
   * Renders the chart provider selection radio boxes
   */
  private renderProviderOptions(): void {
    this.props.pluginSystem.callPlugins((plugin) => {
      if (plugin.getChartProviders) {
        Object.entries(plugin.getChartProviders()).forEach(([key, provider]) => {
          this.chartProviders[key] = provider;
        });
      }

      if (plugin.getChartViewers && this.viewerContainerRef.getOrDefault()) {
        for (const viewer of plugin.getChartViewers(this.props.bus, this.selectedChart, this.selectedProviderKey, this.props.modalService, this.props.settings)) {
          FSComponent.render(viewer, this.viewerContainerRef.instance);
        }
      }
    });

    if (this.dropdownRef.getOrDefault()) {
      this.dropdownRef.instance.renderChartProviderOptions(Object.keys(this.chartProviders), this.selectedProviderKey);
    }
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div class={'charts-container'} ref={this.chartContainerRef}>
        <SectionOutline bus={this.props.bus}>
          <div class={'top-bar'}>
            <div class={'airport-menu'}>
              <ButtonMenu
                buttons={[
                  <TouchButton variant="bar" label={<ChartsAirportDropdownLabel airport={this.originIcao} typeLabel={'Orig'} />} isEnabled={this.originIcao.map((v) => v !== null)} onPressed={() => this.selectedAirport.set(this.originIcao.get())} />,
                  <TouchButton variant="bar" label={<ChartsAirportDropdownLabel airport={this.destIcao} typeLabel={'Dest'} />} isEnabled={this.destIcao.map((v) => v !== null)} onPressed={() => this.selectedAirport.set(this.destIcao.get())} />,
                  <TouchButton variant="bar" label={<ChartsAirportDropdownLabel airport={Subject.create(null)} typeLabel={'Altn'} />} isEnabled={false} />,
                  <TouchButton variant="bar" label={'Search Aprt...'} onPressed={() => this.openAirportSearch()} />,
                  <TouchButton variant="bar" label={'Revision Info...'} isEnabled={false} />,
                ]}
                position="bottom"
              >
                <ButtonBoxArrow label={<ChartsAirportDropdownLabel airport={this.selectedAirport} typeLabel={this.selectedAirportType} />} isEnabled={false} arrowPolygons={'0,0 0,16 16,8'} arrowHeight={18} arrowWidth={22} />
              </ButtonMenu>
            </div>
            <Tabs
              class="chart-tabs"
              tabs={Object.values(this.chartTabs)}
              activeTab={this.activeTab}
              style='style-a'
            />
          </div>
          <div class={'chart-selection-bar'}>
            <ButtonBoxArrow
              onPressed={() => this.selectedChartViewAreaPage.set(
                this.selectedChartViewAreaPage.get() === ChartAreaViewPages.ChartSelection ? ChartAreaViewPages.ChartViewer : ChartAreaViewPages.ChartSelection
              )}
              label={this.selectedChart.map((chart) => chart ? chart.name.toUpperCase() : 'NO CHART SELECTED')}
              arrowPolygons={'0,0 0,16 16,8'} arrowHeight={18} arrowWidth={22}
            />
          </div>
          <div class={'chart-view-area'}>
            <ChartSelectionDropdown
              ref={this.dropdownRef}
              bus={this.props.bus}
              store={this.props.store}

              selectedAirport={this.selectedAirport}
              selectedCategory={this.activeTab.map((v) => (v.name ?? Epic2ChartDisplayCategories.Airport) as Epic2ChartDisplayCategories)}
              selectedChart={this.selectedChart}
              isHidden={this.selectedChartViewAreaPage.map((v) => v !== ChartAreaViewPages.ChartSelection)}
              chartsProvider={this.chartsProvider}
            />
            <div class={{ 'chart-viewer-container': true, 'hidden': this.selectedChartViewAreaPage.map((v) => v !== ChartAreaViewPages.ChartViewer) }} ref={this.viewerContainerRef}>
              <ChartViewer
                bus={this.props.bus}
                chart={this.selectedChart}
                isHidden={this.selectedProviderKey.map((v) => v !== 'LIDO' && v !== 'FAA')}
                modalService={this.props.modalService}
                settings={this.props.settings}
              />
            </div>
          </div>
        </SectionOutline>
      </div>
    );
  }
}
