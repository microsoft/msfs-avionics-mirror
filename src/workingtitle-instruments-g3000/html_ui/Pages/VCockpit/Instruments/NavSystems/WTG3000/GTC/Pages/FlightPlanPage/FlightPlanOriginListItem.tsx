/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ComponentProps, DisplayComponent, VNode, FSComponent,
  Subject, MappedSubject, SetSubject, Subscription, MutableSubscribable,
} from '@microsoft/msfs-sdk';
import { Fms, TouchButton } from '@microsoft/msfs-garminsdk';
import { FlightPlanSegmentListData, FlightPlanStore, SelectableFlightPlanListData } from '@microsoft/msfs-wtg3000-common';
import { GtcListButton } from '../../Components/List/GtcListButton';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService';
import { GtcFlightPlanDialogs } from './GtcFlightPlanDialogs';

import './FlightPlanSegmentListItem.css';
import './FlightPlanOriginListItem.css';

/** The state of the origin button. */
type OriginButtonState = 'noOrigin' | 'noRunway' | 'noDeparture' | 'departureLoaded';

/** The props for FlightPlanOriginListItem. */
interface FlightPlanOriginListItemProps extends ComponentProps {
  /** Data describing the list item's associated flight plan segment. */
  segmentListData: FlightPlanSegmentListData;

  /** The GtcService. */
  gtcService: GtcService;

  /** The FMS. */
  fms: Fms;

  /** The flight plan store. */
  store: FlightPlanStore;

  /** A mutable subscribable which controls the selected list data. */
  selectedListData: MutableSubscribable<SelectableFlightPlanListData | null>;
}

/** The flight plan list item for the origin. */
export class FlightPlanOriginListItem extends DisplayComponent<FlightPlanOriginListItemProps> {
  private readonly gtcListButtonRef = FSComponent.createRef<TouchButton>();

  private readonly row1CssClass = SetSubject.create<string>();
  private readonly row2CssClass = SetSubject.create<string>();

  private readonly subs = [] as Subscription[];
  private readonly row1Text = Subject.create<string>('');
  private readonly row2Text = Subject.create<string | undefined>('');
  private readonly originButtonState = MappedSubject.create(([origin, runway, departure]): OriginButtonState => {
    if (origin === undefined) {
      return 'noOrigin';
    } else if (runway === undefined) {
      return 'noRunway';
    } else if (departure === undefined) {
      return 'noDeparture';
    } else {
      return 'departureLoaded';
    }
  }, this.props.store.originFacility, this.props.store.originRunway, this.props.store.departureProcedure);

  private readonly isSelected = this.props.selectedListData.map(selected => selected === this.props.segmentListData);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.subs.push(this.originButtonState.sub(this.updateRowStyles, true));

    this.subs.push(this.originButtonState.sub(this.updateRowTexts));
    this.subs.push(this.props.store.departureString.sub(this.updateRowTexts));
    this.subs.push(this.props.store.departureText1.sub(this.updateRowTexts));
    this.updateRowTexts();
  }

  /** Updates the stlyes for the rows. */
  private readonly updateRowStyles = (): void => {
    const state = this.originButtonState.get();
    this.row2CssClass.toggle('hidden', state === 'noOrigin' || state === 'noDeparture');
    this.row1CssClass.toggle('origin-segment-list-item-row-cyan', state !== 'noOrigin');
    this.row2CssClass.toggle('origin-segment-list-item-row-cyan', state === 'departureLoaded');
  };

  /** Updates the text for each row. */
  private readonly updateRowTexts = (): void => {
    const state = this.originButtonState.get();
    const departureString = this.props.store.departureString.get();
    const departureText1 = this.props.store.departureText1.get();
    switch (state) {
      case 'noOrigin':
        this.row1Text.set('Add Origin');
        break;
      case 'noRunway':
        this.row1Text.set(departureText1);
        this.row2Text.set('Select Runway');
        break;
      case 'noDeparture':
        this.row1Text.set(departureText1);
        break;
      case 'departureLoaded':
        this.row1Text.set(departureText1);
        this.row2Text.set(departureString);
        break;
    }
  };

  private readonly handlePressed = async (): Promise<void> => {
    switch (this.originButtonState.get()) {
      case 'noOrigin': {
        // Don't do anything if a slideout menu is open
        if (this.props.gtcService.activeView.get().key !== GtcViewKeys.FlightPlan) { return; }

        const result = await GtcFlightPlanDialogs.openAirportDialog(this.props.gtcService);
        if (!result.wasCancelled) {
          this.props.fms.setOrigin(result.payload);
        }
        break;
      }
      case 'noRunway': {
        // Don't do anything if a slideout menu is open
        if (this.props.gtcService.activeView.get().key !== GtcViewKeys.FlightPlan) { return; }

        let origin = this.props.store.originFacility.get();
        if (!origin) { return; }
        const result = await GtcFlightPlanDialogs.openRunwayDialog(this.props.gtcService, origin);
        if (!result.wasCancelled) {
          origin = this.props.store.originFacility.get();
          if (!origin) { return; }
          this.props.fms.setOrigin(origin, result.payload);
        }
        break;
      }
      case 'noDeparture':
      case 'departureLoaded':
        this.props.selectedListData.set(this.isSelected.get() ? null : this.props.segmentListData);
        break;
    }
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GtcListButton
        ref={this.gtcListButtonRef}
        fullSizeButton={true}
        listItemClasses='medium-font segment-list-item'
        onPressed={this.handlePressed}
        label={(
          <>
            <div class={this.row1CssClass}>{this.row1Text}</div>
            <div class={this.row2CssClass}>{this.row2Text}</div>
          </>
        )}
        isHighlighted={this.isSelected}
        gtcOrientation={this.props.gtcService.orientation}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.gtcListButtonRef.getOrDefault()?.destroy();

    this.isSelected.destroy();
    this.subs.forEach(x => x.destroy());

    super.destroy();
  }
}