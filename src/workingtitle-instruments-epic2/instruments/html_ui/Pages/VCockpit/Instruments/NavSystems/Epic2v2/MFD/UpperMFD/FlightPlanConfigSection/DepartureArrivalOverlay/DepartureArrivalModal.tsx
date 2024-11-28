import { FSComponent, MappedSubject, SetSubject, Subject, VNode } from '@microsoft/msfs-sdk';

import {
  Epic2Fms, FlightPlanStore, Modal, ModalProps, Tab, TabbedContentContainer, Tabs, TouchButton, TouchButtonCheckbox
} from '@microsoft/msfs-epic2-shared';

import { DepartureArrivalTabs } from '../FlightPlanTabTypes';
import { ArrivalTab } from './ArrivalTab/ArrivalTab';
import { DepartureTab } from './DepartureTab/DepartureTab';

import './DepartureArrivalModal.css';

/** The properties for the {@link DepartureArrivalModal} component. */
interface DepartureArrivalModalProps extends ModalProps {
  /** The FMS. */
  readonly fms: Epic2Fms;
  /** The active flight plan store.  */
  readonly activeStore: FlightPlanStore;
  /** The pending flight plan store.  */
  readonly pendingStore: FlightPlanStore;
}

/** The DepartureArrivalModal component.
 * The component expects to be used within a container that has position:relative
 */
export class DepartureArrivalModal extends Modal<DepartureArrivalModalProps> {
  private readonly tabbedContentContainer = FSComponent.createRef<TabbedContentContainer>();

  private readonly togglePreview = Subject.create(false);
  protected readonly cssClassSet = SetSubject.create(['departure-arrival-modal', 'modal-bottom-left']);

  private readonly tabs: Readonly<Record<DepartureArrivalTabs, Tab>> = {
    departure: {
      renderLabel: () => 'Departure',
      renderContent: () => <DepartureTab
        bus={this.props.bus}
        fms={this.props.fms}
        togglePreview={this.togglePreview}
        activeStore={this.props.activeStore}
        pendingStore={this.props.pendingStore}
        onInserted={() => this.close()}
      />,
    },
    arrival: {
      renderLabel: () => 'Arrival',
      renderContent: () => <ArrivalTab
        bus={this.props.bus}
        fms={this.props.fms}
        togglePreview={this.togglePreview}
        activeStore={this.props.activeStore}
        pendingStore={this.props.pendingStore}
        onInserted={() => this.close()}
        allowRnpAr={true}
      />,
    },
  };

  private readonly activeTab = Subject.create(this.tabs.departure);

  private readonly title = MappedSubject.create(
    ([tab, usePendingStore, activeOrigin, activeDest, pendingOrigin, pendingDest]) => {
      if (tab.renderLabel() === 'Departure') {
        return usePendingStore ? pendingOrigin : activeOrigin;
      } else {
        return usePendingStore ? pendingDest : activeDest;
      }
    },
    this.activeTab,
    this.props.fms.planInMod,
    this.props.activeStore.originIdent,
    this.props.activeStore.destinationIdent,
    this.props.pendingStore.originIdent,
    this.props.pendingStore.destinationIdent,
  );

  /** @inheritdoc */
  public override onResume(): void {
    this.tabbedContentContainer.instance.onResume();
  }

  /** @inheritdoc */
  public override onPause(): void {
    this.tabbedContentContainer.instance.onPause();
  }

  /**
   * Sets the active tab.
   * @param tab The tab to activate.
   */
  public setActiveTab(tab: DepartureArrivalTabs): void {
    this.activeTab.set(this.tabs[tab]);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.cssClassSet}>
        <div class="departure-arrival-header">
          <p class="departure-arrival-origin">{this.title}</p>
          <TouchButton variant="bar" label="X" class="departure-arrival-close-button" onPressed={() => {
            this.close();
            this.tabbedContentContainer.instance.onResume();
          }} />
        </div>
        <div class="departure-arrival-modal-tabs">
          <Tabs
            class="departure-arrival-tabs"
            tabs={Object.values(this.tabs)}
            activeTab={this.activeTab}
            style='style-a'
          />
          <TabbedContentContainer
            ref={this.tabbedContentContainer}
            bus={this.props.bus}
            tabs={Object.values(this.tabs)}
            activeTab={this.activeTab}
            className="departure-arrival-tabbed-content-container"
          />
        </div>
        <TouchButtonCheckbox label={'View'} class="departure-arrival-view-toggle-button" isChecked={this.togglePreview} variant="bar" isEnabled={false} />
      </div>
    );
  }
}
