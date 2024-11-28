/* eslint-disable max-len */
import {
  DisplayComponent, VNode, FSComponent, MutableSubscribable,
} from '@microsoft/msfs-sdk';
import { AltitudeConstraintDisplay, FlightPlanLegListData, SelectableFlightPlanListData } from '@microsoft/msfs-wtg3000-common';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcDirectToPage } from '../DirectToPage';
import { FlightPlanLegDisplay, FlightPlanLegDisplayProps } from './FlightPlanLegDisplay';
import './FlightPlanLegButton.css';

/** The props for {@link FlightPlanLegButton}. */
export interface FlightPlanLegButtonProps extends FlightPlanLegDisplayProps {
  /** The leg list item data. */
  legListData: FlightPlanLegListData;

  /** The GtcService. */
  gtcService: GtcService;

  /** Whether this is the direct to random leg. */
  isDirectToRandom?: boolean;

  /**
   * A mutable subscribable which controls the selected list data. If not defined, pressing the button will not cause
   * its list data to become selected or unselected.
   */
  selectedListData?: MutableSubscribable<SelectableFlightPlanListData | null>;
}

/** A component that wraps list item content for use with GtcList. */
export class FlightPlanLegButton extends DisplayComponent<FlightPlanLegButtonProps> {
  private readonly touchButtonRef = FSComponent.createRef<GtcTouchButton>();
  private readonly legDisplayRef = FSComponent.createRef<DisplayComponent<any>>();
  private readonly altitudeDisplayRef = FSComponent.createRef<DisplayComponent<any>>();

  private readonly isSelected = this.props.selectedListData?.map(selected => selected === this.props.legListData);

  /** @inheritdoc */
  public override render(): VNode {
    const { legListData } = this.props;
    const { legData } = legListData;

    return (
      <GtcTouchButton
        ref={this.touchButtonRef}
        isHighlighted={this.isSelected}
        class="flight-plan-leg-button"
        onPressed={() => {
          if (this.props.isDirectToRandom === true) {
            this.props.gtcService.changePageTo<GtcDirectToPage>(GtcViewKeys.DirectTo).ref.setWaypoint({});
          } else if (this.props.selectedListData !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.props.selectedListData.set(this.isSelected!.get() ? null : this.props.legListData);
          }
        }}
        isInList
        gtcOrientation={this.props.gtcService.orientation}
      >
        <FlightPlanLegDisplay
          ref={this.legDisplayRef}
          fms={this.props.fms}
          legListData={legListData}
          waypointCache={this.props.waypointCache}
          gtcService={this.props.gtcService}
        />
        {this.props.isDirectToRandom === true &&
          <AltitudeConstraintDisplay
            ref={this.altitudeDisplayRef}
            altDesc={legData.altDesc}
            altitude1={legData.altitude1}
            altitude2={legData.altitude2}
            displayAltitude1AsFlightLevel={legData.displayAltitude1AsFlightLevel}
            displayAltitude2AsFlightLevel={legData.displayAltitude2AsFlightLevel}
            isEdited={legData.isAltitudeEdited}
            isInvalid={legData.isAltitudeInvalid}
            isCyan={true}
          />
        }
        {this.props.children}
      </GtcTouchButton>
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    this.touchButtonRef.getOrDefault()?.destroy();
    this.legDisplayRef.getOrDefault()?.destroy();
    this.altitudeDisplayRef.getOrDefault()?.destroy();

    this.isSelected?.destroy();

    super.destroy();
  }
}