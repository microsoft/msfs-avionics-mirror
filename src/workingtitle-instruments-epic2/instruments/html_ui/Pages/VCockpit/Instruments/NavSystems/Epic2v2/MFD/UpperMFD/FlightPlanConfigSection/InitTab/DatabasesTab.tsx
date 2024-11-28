import { AiracCycleFormatter, FSComponent, FacilityLoader, Subject, VNode } from '@microsoft/msfs-sdk';

import { RadioButton, TabContent, TabContentProps } from '@microsoft/msfs-epic2-shared';

import './DatabasesTab.css';

/** The DatabasesTab component. */
export class DatabasesTab extends TabContent<TabContentProps> {
  private readonly databaseDatesFormatter = AiracCycleFormatter.create('{eff({dd}{MON})} {expMinus({dd}{MON})}/{eff({YY})}');
  private readonly databaseNameFormatter = AiracCycleFormatter.create('WORLD - {YYCC} 2.02');

  /** @inheritdoc */
  public render(): VNode {
    const databaseCycles = FacilityLoader.getDatabaseCycles();

    return (
      <div class="fpln-databases-tab">
        <div class="column">
          <div class="title">Navigation DB:</div>
          <div class="database-button-box">
            <div class="sub-title">{this.databaseNameFormatter(databaseCycles.current)}</div>
            <RadioButton
              label={this.databaseDatesFormatter(databaseCycles.previous)}
              value={true}
              selectedValue={Subject.create<boolean>(false)}
              isDisabled
            />
            <RadioButton
              label={this.databaseDatesFormatter(databaseCycles.current)}
              value={true}
              selectedValue={Subject.create<boolean>(true)}
              isDisabled
            />
          </div>
        </div>
        <div class="column">
          <div class="title">Aircraft DB:</div>
          <div class="database-text">PC47E-WT0453</div>
        </div>
        <div class="column">
          <div class="title">Charts:</div>
          <div class="database-text">-----------------</div>
        </div>
      </div>
    );
  }
}
