import {
  ArraySubject, ChartMetadata, ComponentProps, DisplayComponent, EventBus, FSComponent, IcaoValue, MappedSubject, MutableSubscribable, Subject, Subscribable,
  VNode
} from '@microsoft/msfs-sdk';

import { Epic2List, FlightPlanStore, ListItem, RadioButton, TouchButton } from '@microsoft/msfs-epic2-shared';

import { Epic2ChartDisplayCategories, Epic2ChartListType } from '../Epic2ChartTypes';
import { Epic2ChartUtils } from '../Epic2ChartUtils';
import { Epic2ChartsProvider } from '../Providers/Epic2ChartsProvider';

import './ChartSelectionDropdown.css';

/** The properties for the {@link ChartSelectionDropdown} component. */
export interface ChartSelectionDropdownProps extends ComponentProps {
  /** The event bus */
  bus: EventBus
  /** The selected airport */
  selectedAirport: Subscribable<IcaoValue | null>;
  /** The selected category */
  selectedCategory: Subscribable<Epic2ChartDisplayCategories>;
  /** The flight plan store */
  store: FlightPlanStore;
  /** The current charts provder */
  chartsProvider: Subscribable<Epic2ChartsProvider>;
  /** The currently selected chart */
  selectedChart: MutableSubscribable<ChartMetadata | null>;
  /** Is this dropdown visible? */
  isHidden: Subscribable<boolean>;
}

/** A dropdown menu used for selecting the currently displayed chart */
export class ChartSelectionDropdown extends DisplayComponent<ChartSelectionDropdownProps> {
  private readonly providerContainerRef = FSComponent.createRef<HTMLDivElement>();

  private readonly autoSelectedChart = Subject.create<ChartMetadata | null>(null);

  private readonly displayCharts = ArraySubject.create<Epic2ChartListType>([]);

  /**
   * Selects the automatic chart from the flight plan
   * @returns The chart metadata for the selected chart, or null
   */
  private async selectChartFromFlightPlan(): Promise<ChartMetadata | null> {
    const selectedAirport = this.props.selectedAirport.get();
    if (!selectedAirport) {
      return null;
    }

    const selectedCategory = this.props.selectedCategory.get();
    const charts = this.displayCharts.getArray();
    switch (selectedCategory) {
      case Epic2ChartDisplayCategories.Airport:
        return await this.props.chartsProvider.get().getDefaultAirportChart(selectedAirport);
      case Epic2ChartDisplayCategories.SID: {
        const sid = this.props.store.departureProcedure.get();
        if (!sid) {
          return null;
        }

        return Epic2ChartUtils.selectAutoChartForProcedure(charts, sid);
      }
      case Epic2ChartDisplayCategories.STAR: {
        const star = this.props.store.arrivalProcedure.get();
        if (!star) {
          return null;
        }

        return Epic2ChartUtils.selectAutoChartForProcedure(charts, star);
      }
      case Epic2ChartDisplayCategories.Approach: {
        const approach = this.props.store.approachProcedure.get();
        if (!approach) {
          return null;
        }

        return Epic2ChartUtils.selectAutoChartForProcedure(charts, approach);
      }
      default:
        return null;
    }

  }

  /**
   * Updates the lists of charts to be displayed
   * @param airport The airport IcaoValue
   * @param category The selected category
   */
  private async updateChartsToDisplay(airport: IcaoValue | null, category: Epic2ChartDisplayCategories): Promise<void> {
    const chartsProvider = this.props.chartsProvider.get();

    this.displayCharts.set([]);
    if (airport && category) {
      let charts;
      switch (this.props.selectedCategory.get()) {
        case Epic2ChartDisplayCategories.Airport:
          charts = await chartsProvider.getAirportCharts(airport);
          break;
        case Epic2ChartDisplayCategories.SID:
          charts = await chartsProvider.getSidCharts(airport);
          break;
        case Epic2ChartDisplayCategories.STAR:
          charts = await chartsProvider.getStarCharts(airport);
          break;
        case Epic2ChartDisplayCategories.Approach:
          charts = await chartsProvider.getApproachCharts(airport);
          break;
        default:
          return;
      }

      this.displayCharts.set(charts.map((chartMetadata) => {
        return {
          chart: chartMetadata
        };
      }));

      const autoChart = await this.selectChartFromFlightPlan();
      this.props.selectedChart.set(autoChart);
      this.autoSelectedChart.set(autoChart);
    }
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    MappedSubject.create(this.props.selectedAirport, this.props.selectedCategory, this.props.chartsProvider)
      .sub(async ([airport, category]) => await this.updateChartsToDisplay(airport, category));
  }

  /**
   * Renders the chart provider selection options
   * @param options An array of chart provider keys
   * @param selectedProvider A subject for the selected provider
   */
  public renderChartProviderOptions(options: string[], selectedProvider: MutableSubscribable<string>): void {
    options.forEach((key) => {
      FSComponent.render(<RadioButton selectedValue={selectedProvider} value={key} label={key} />, this.providerContainerRef.instance);
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={{ 'chart-selection-dropdown': true, 'hidden': this.props.isHidden }}>
        <div class='chart-selection-top-bar'>
          <p>Chart Name</p>
          <p>Index</p>
        </div>
        <div class='chart-selection-area'>
          <div class='flight-plan-selection'>
            <TouchButton
              variant='list-button'
              isHighlighted={false}
              onPressed={() => this.autoSelectedChart.get() && this.props.selectedChart.set(this.autoSelectedChart.get())}
            >
              <p class='chart-item-divider-label'>{this.props.selectedCategory.map((cat) => `${cat} From Flight Plan`)}</p>
              <p class='fms-label'>FMS1</p>
              <p class='chart-name'>{this.autoSelectedChart.map((chart) => chart ? chart.name.toUpperCase() : 'NO CHART SELECTED')}</p>
            </TouchButton>
          </div>
          <div class='chart-selection'>
            <p class='chart-item-divider-label'>Available Charts</p>
            <Epic2List
              class={'chart-selection-list'}
              bus={this.props.bus}
              scrollbarStyle='outside'
              listItemHeightPx={28}
              data={this.displayCharts}
              heightPx={500}
              itemsPerPage={18}
              renderItem={(data) => <ListItem>
                <TouchButton
                  variant='list-button'
                  isHighlighted={this.props.selectedChart.map((selected) => data.chart.guid === selected?.guid)}
                  onPressed={() => this.props.selectedChart.set(data.chart)}
                  label={data.chart.name.toUpperCase()}
                />
              </ListItem>
              }
            />
          </div>
          <div class='chart-provider-selection' ref={this.providerContainerRef}>
          </div>
        </div>
      </div>
    );
  }
}
