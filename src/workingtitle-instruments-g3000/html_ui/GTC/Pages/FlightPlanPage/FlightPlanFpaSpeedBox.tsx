import { ComponentProps, DisplayComponent, FSComponent, MappedSubject, SubscribableUtils, VNode } from '@microsoft/msfs-sdk';
import { Fms, UnitsUserSettings } from '@microsoft/msfs-garminsdk';
import { FlightPlanLegData, FpaDisplay, SpeedConstraintDisplay } from '@microsoft/msfs-wtg3000-common';
import { GtcService } from '../../GtcService/GtcService';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { FlightPlanFpaSpeedSlideoutMenu } from './FlightPlanFpaSpeedSlideoutMenu';
import { GtcFlightPlanPageViewKeys } from './FlightPlanPageTypes';
import './FlightPlanFpaSpeedBox.css';

/** The props for FlightPlanFpaSpeedBox. */
interface FlightPlanFpaSpeedBoxProps extends ComponentProps {
  /** The leg list item data. */
  legData: FlightPlanLegData;
  /** The GtcService. */
  gtcService: GtcService;
  /** The FMS. */
  fms: Fms;
  /** The flight plan index. */
  planIndex: number;
}

/** A component that wraps list item content for use with GtcList. */
export class FlightPlanFpaSpeedBox extends DisplayComponent<FlightPlanFpaSpeedBoxProps> {
  private readonly touchButtonRef = FSComponent.createRef<GtcTouchButton>();
  private readonly fpaRef = FSComponent.createRef<FpaDisplay>();
  private readonly speedRef = FSComponent.createRef<SpeedConstraintDisplay>();

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.props.gtcService.bus);

  private readonly fpa = MappedSubject.create(
    ([fpa, isAltitudeEditable]): number => isAltitudeEditable ? fpa : NaN,
    SubscribableUtils.NUMERIC_NAN_EQUALITY,
    this.props.legData.fpa,
    this.props.legData.isAltitudeEditable
  );

  /** @inheritdoc */
  public override render(): VNode {
    return (
      <GtcTouchButton
        ref={this.touchButtonRef}
        class="flight-plan-fpa-speed-box"
        isInList
        isVisible={this.props.legData.isFpaSpeedEditable}
        onPressed={() => {
          this.props.gtcService.openPopup<FlightPlanFpaSpeedSlideoutMenu>(GtcFlightPlanPageViewKeys.FpaSpeedMenu, 'slideout-right')
            .ref.request(this.props.legData);
        }}
      >
        <div class="main-box">
          <FpaDisplay
            ref={this.fpaRef}
            fpa={this.fpa}
            isEdited={this.props.legData.isFpaEdited}
            showClimb={this.props.legData.showClimbFpa}
          />
          <SpeedConstraintDisplay
            ref={this.speedRef}
            userSpeedUnitsSetting={this.unitsSettingManager.speedUnits}
            speed={this.props.legData.speed}
            speedDesc={this.props.legData.speedDesc}
            speedUnit={this.props.legData.speedUnit}
            isEdited={this.props.legData.isSpeedEdited}
            isInvalid={this.props.legData.isSpeedInvalid}
          />
        </div>
      </GtcTouchButton>
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    super.destroy();

    this.touchButtonRef.getOrDefault()?.destroy();
    this.fpaRef.getOrDefault()?.destroy();
    this.speedRef.getOrDefault()?.destroy();

    this.fpa.destroy();
  }
}
