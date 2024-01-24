import { EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

import { FmsHEvent, MFDUiPage, MFDUiPageProps, ScrollableControl, UiView } from '@microsoft/msfs-wtg1000';

import { Sr22tMfdSoftkeyMenuTypes } from '../Sr22tMfdSoftkeyMenu';
import { TripPlanningStore } from '../Stores';
import { FuelStatsPanel } from './Components/FuelStatsPanel/FuelStatsPanel';
import { InputDataPanel } from './Components/InputDataPanel/InputDataPanel';
import { OtherStatsPanel } from './Components/OtherStatsPanel/OtherStatsPanel';
import { TripStatsPanel } from './Components/TripStatsPanel/TripStatsPanel';
import { FixModes, InputModes } from './Sr22tTripPlanningModes';

import './Sr22tTripPlanningPage.css';

/**
 * Component props for {@link Sr22tTripPlanningPage}.
 */
export interface Sr22tTripPlanningPageProps extends MFDUiPageProps {
  /** The event bus. */
  bus: EventBus;
  /** The flight management system. */
  fms: Fms;
  /** The weight and balance store. */
  tripPlanningStore: TripPlanningStore;
}

/**
 * A page which displays the SR22T trip planning data.
 */
export class Sr22tTripPlanningPage extends MFDUiPage<Sr22tTripPlanningPageProps> {

  private readonly tripStatsPanelRef = FSComponent.createRef<TripStatsPanel>();
  private readonly fuelStatsPanelRef = FSComponent.createRef<FuelStatsPanel>();
  private readonly otherStatsPanelRef = FSComponent.createRef<OtherStatsPanel>();

  protected readonly inputPanel = FSComponent.createRef<UiView>();

  /** @inheritdoc
   */
  constructor(props: Sr22tTripPlanningPageProps) {

    super(props);

    this._title.set('Aux - Trip Planning');
  }

  public inputMode: InputModes = InputModes.Auto;
  public fixMode: FixModes = FixModes.FPL;

  /** @inheritdoc
   */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.UPPER_PUSH:
        this.toggleScroll();
        this.scrollController.gotoFirst();
        return true;
    }

    if (this.inputPanel.instance.onInteractionEvent(evt)) {
      return true;
    } else {
      return super.onInteractionEvent(evt);
    }
  }

  /** Register/Unregisters a UiControl with the scroll controller.
   * @param ctrl The UiControl to register.
   * @param unregister Indicates if the UiControl should be unregistered.
   */
  protected register = (ctrl: ScrollableControl, unregister = false): void => {
    if (unregister) {
      this.scrollController.unregisterCtrl(ctrl);
    } else {
      this.scrollController.registerCtrl(ctrl);
    }
  };

  /** @inheritdoc */
  public onViewResumed(): void {
    super.onViewResumed();
    this.tripStatsPanelRef.instance.resume();
    this.fuelStatsPanelRef.instance.resume();
    this.otherStatsPanelRef.instance.resume();

    this.props.menuSystem.replaceMenu(Sr22tMfdSoftkeyMenuTypes.TripPlanning);
  }

  /** @inheritdoc */
  public onViewPaused(): void {
    super.onViewPaused();
    this.tripStatsPanelRef.instance.pause();
    this.fuelStatsPanelRef.instance.pause();
    this.otherStatsPanelRef.instance.pause();
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.setScrollEnabled(false);
    return;
  }

  /** @inheritDoc
   */
  public render(): VNode {

    return (
      <div class='mfd-page sr22t-trip-planning-page' ref={this.viewContainerRef}>
        <div class='sr22t-trip-planning-page-container'>
          <InputDataPanel ref={this.inputPanel}
            bus={this.props.bus}
            store={this.props.tripPlanningStore}
            viewService={this.props.viewService}
            title=""
            showTitle={false}
            registerFunc={this.register.bind(this)}
            fms={this.props.fms}
          />
          <TripStatsPanel
            ref={this.tripStatsPanelRef}
            store={this.props.tripPlanningStore}
            bus={this.props.bus}
            fms={this.props.fms}
          />
          <FuelStatsPanel
            ref={this.fuelStatsPanelRef}
            store={this.props.tripPlanningStore}
            bus={this.props.bus}
            fms={this.props.fms}
          />
          <OtherStatsPanel
            ref={this.otherStatsPanelRef}
            store={this.props.tripPlanningStore}
            bus={this.props.bus}
          />
        </div>
      </div>
    );
  }
}
