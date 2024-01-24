import { EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { FmsHEvent, MFDUiPage, MFDUiPageProps } from '@microsoft/msfs-wtg1000';
import { Sr22tMfdSoftkeyMenuTypes } from '../Sr22tMfdSoftkeyMenu';
import { WeightBalanceStore } from '../Stores';
import { Sr22tWBAircraftWeightBalance, Sr22tWBAircraftLoad, Sr22tWBEstimatedWeight, Sr22tWBStationVsWeight } from './Components';

import './Sr22tWeightBalancePage.css';

/** Component props for {@link Sr22tWeightBalancePage}. */
export interface Sr22tWeightBalancePageProps extends MFDUiPageProps {
  /** The event bus. */
  bus: EventBus;
  /** The weight and balance store. */
  weightBalanceStore: WeightBalanceStore;
}

/**
 * A page which displays the SR22T weight and balance data.
 */
export class Sr22tWeightBalancePage extends MFDUiPage<Sr22tWeightBalancePageProps> {
  private readonly stationVsWeightRef = FSComponent.createRef<Sr22tWBStationVsWeight>();
  private readonly aircraftLoadRef = FSComponent.createRef<Sr22tWBAircraftLoad>();
  private readonly aircraftWeightBalanceRef = FSComponent.createRef<Sr22tWBAircraftWeightBalance>();
  private readonly estimatedWeightRef = FSComponent.createRef<Sr22tWBEstimatedWeight>();

  private readonly isDiagramZoomed = Subject.create(false);

  /** @inheritdoc */
  constructor(props: Sr22tWeightBalancePageProps) {
    super(props);

    this._title.set('Aux - Weight and Balance');
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.UPPER_PUSH:
        this.toggleScroll();
        return true;
    }

    return super.onInteractionEvent(evt);
  }

  /** @inheritdoc */
  public onViewResumed(): void {
    super.onViewResumed();
    this.props.weightBalanceStore.resetTemporaryWeights();
    this.aircraftLoadRef.getOrDefault()?.resetValues();
    this.aircraftWeightBalanceRef.getOrDefault()?.resetValues();
    this.estimatedWeightRef.getOrDefault()?.resetValues();
    this.props.menuSystem.replaceMenu(Sr22tMfdSoftkeyMenuTypes.WeightBalance);

    this.stationVsWeightRef.instance.resume();
    this.aircraftWeightBalanceRef.instance.resume();
    this.estimatedWeightRef.instance.resume();
  }

  /** @inheritDoc */
  protected onViewPaused(): void {
    super.onViewPaused();

    this.stationVsWeightRef.instance.pause();
    this.aircraftWeightBalanceRef.instance.pause();
    this.estimatedWeightRef.instance.pause();
  }

  /** Saves the temporary values to the store. */
  public onConfirm(): void {
    this.props.weightBalanceStore.storeTemporaryWeights();
  }

  /** Toggles the zoom state of the diagram. */
  public toggleGraphZoom(): void {
    this.isDiagramZoomed.set(!this.isDiagramZoomed.get());
  }

  /**
   * Gets whether the diagram is zoomed.
   * @returns boolean Whether the diagram is zoomed.
   */
  public get isGraphZoomed(): boolean {
    return this.isDiagramZoomed.get();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='mfd-page sr22t-weightbalance-page' ref={this.viewContainerRef}>
        <div class='sr22t-weightbalance-page-container'>
          <Sr22tWBStationVsWeight
            ref={this.stationVsWeightRef}
            bus={this.props.bus}
            store={this.props.weightBalanceStore}
            isZoomed={this.isDiagramZoomed}
          />
          <Sr22tWBAircraftWeightBalance
            ref={this.aircraftWeightBalanceRef}
            bus={this.props.bus}
            store={this.props.weightBalanceStore}
            registerScroll={this.register.bind(this)}
          />
          <Sr22tWBEstimatedWeight
            ref={this.estimatedWeightRef}
            bus={this.props.bus}
            weightBalanceStore={this.props.weightBalanceStore}
            registerScroll={this.register.bind(this)}
          />
          <Sr22tWBAircraftLoad
            ref={this.aircraftLoadRef}
            bus={this.props.bus}
            store={this.props.weightBalanceStore}
            registerScroll={this.register.bind(this)}
          />
        </div>
      </div>
    );
  }
}
