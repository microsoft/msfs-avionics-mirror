import { Facility, FacilityType, FSComponent, ICAO, SetSubject, Subject, VNode } from '@microsoft/msfs-sdk';

import { Epic2Fms, FlightPlanStore, Modal, ModalProps, Tab, TabbedContentContainer, Tabs, TouchButton } from '@microsoft/msfs-epic2-shared';

import { DatabaseTab } from './DatabaseTab';
import { FlightPlanLogTab } from './FlightPlanLog';
import { WeatherTab } from './WeatherTab';

import './ShowInfoModal.css';

/** Properties for the {@link ShowInfoOverlay} class */
interface ShowInfoModalProps extends ModalProps {
  /** fms */
  readonly fms: Epic2Fms
  /** The flight plan store.  */
  readonly store: FlightPlanStore;
}

/** Modal used for the join airway menu */
export class ShowInfoModal extends Modal<ShowInfoModalProps> {
  protected readonly cssClassSet = SetSubject.create(['show-info-modal', 'modal-bottom-left']);

  private facility = Subject.create<Facility | undefined>(undefined);

  /** @inheritdoc */
  public onAfterRender(): void {
  }

  /**
   * Sets the info to display
   * @param facilityIcao The FS ICAO of the facility being displayed
   */
  public async setInfo(facilityIcao?: string): Promise<void> {
    if (facilityIcao && facilityIcao !== ICAO.emptyIcao) {
      this.facility.set(await this.props.fms.facLoader.getFacility(ICAO.getFacilityType(facilityIcao), facilityIcao));
      this.activeTab.set(this.tabs.database);
    }
  }

  private readonly tabs: Readonly<Record<string, Tab>> = {
    database: {
      renderLabel: () => 'Data<br>Base',
      renderContent: () => <DatabaseTab fms={this.props.fms} facility={this.facility} bus={this.props.bus} />,
    },
    fplnLog: {
      renderLabel: () => 'FPLN<br>Log',
      renderContent: () => <FlightPlanLogTab fms={this.props.fms} facility={this.facility} bus={this.props.bus} store={this.props.store} />,
      isDisabled: this.facility.map((fac) => {
        let legInPlan = false;
        for (const [legDef] of this.props.store.legMap) {
          if (legDef.leg.fixIcao === fac?.icao) {
            legInPlan = true;
          }
        }
        return !legInPlan;
      })
    },
    wx: {
      renderLabel: () => 'WX',
      renderContent: () => <WeatherTab fms={this.props.fms} facility={this.facility} bus={this.props.bus} />,
      isDisabled: this.facility.map((fac) => !fac || (ICAO.getFacilityType(fac.icao) !== FacilityType.Airport && ICAO.getFacilityType(fac.icao) !== FacilityType.RWY))
    },
  };

  private readonly activeTab = Subject.create(this.tabs.database);

  /**
   * Sets the currently active tab
   * @param tab Tab to display
   */
  public setTab(tab: 'database' | 'flpnLog' | 'wx'): void {
    this.activeTab.set(this.tabs[tab]);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.cssClassSet}>
        <div class="header">
          <p class="title">Show Info {this.facility.map((fac) => fac ? ICAO.getIdent(fac.icao) : 'NULL')}</p>
          <TouchButton variant="bar" label="X" class="show-info-close-button" onPressed={() => this.close()} />
        </div>
        <div class="tabs">
          <Tabs
            class="show-info-tabs"
            tabs={Object.values(this.tabs)}
            activeTab={this.activeTab}
            style='style-a'
          />
          <TabbedContentContainer
            bus={this.props.bus}
            tabs={Object.values(this.tabs)}
            activeTab={this.activeTab}
            className="show-info-tabbed-content-container"
          />
        </div>
      </div>
    );
  }
}
