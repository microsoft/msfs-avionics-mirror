/* eslint-disable max-len */
import {
  AltitudeRestrictionType, ComponentProps, DisplayComponent, FacilityType, FSComponent,
  ICAO, SetSubject, Subscription, UnitType, VNode,
} from '@microsoft/msfs-sdk';
import { Fms, FmsUtils } from '@microsoft/msfs-garminsdk';
import { AltitudeConstraintDisplay, FlightPlanLegData } from '@microsoft/msfs-wtg3000-common';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcVnavAltitudeDialog } from '../../Dialog/GtcVnavAltitudeDialog';
import { FlightPlanVnavConstraintSlideoutMenu } from './FlightPlanVnavConstraintSlideoutMenu';
import { GtcFlightPlanPageViewKeys } from './FlightPlanPageTypes';
import './FlightPlanAltitudeConstraintBox.css';
import { GtcDialogs } from '../../Dialog/GtcDialogs';

/** The props for FlightPlanAltitudeConstraintBox. */
interface FlightPlanAltitudeConstraintBoxProps extends ComponentProps {
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
export class FlightPlanAltitudeConstraintBox extends DisplayComponent<FlightPlanAltitudeConstraintBoxProps> {
  private readonly touchButtonRef = FSComponent.createRef<GtcTouchButton>();
  private readonly altitudeDisplayRef = FSComponent.createRef<AltitudeConstraintDisplay>();

  private readonly subs = [] as Subscription[];

  private readonly classList = SetSubject.create(['flight-plan-altitude-box']);

  private readonly publishedAltitudeFeet1 = this.props.gtcService.isAdvancedVnav || this.props.legData.leg.leg.altDesc !== AltitudeRestrictionType.Between
    ? UnitType.METER.convertTo(this.props.legData.leg.leg.altitude1, UnitType.FOOT)
    : UnitType.METER.convertTo(this.props.legData.leg.leg.altitude2, UnitType.FOOT);

  /** @inheritdoc */
  public override onAfterRender(): void {
    this.classList.toggle('simple-vnav', !this.props.gtcService.isAdvancedVnav);
    this.classList.toggle('advanced-vnav', this.props.gtcService.isAdvancedVnav);

    this.subs.push(this.props.legData.isAltitudeVisible.sub(isVisible => {
      this.classList.toggle('hidden', !isVisible);
    }, true));
  }

  /** Handles the button being pressed in simple mode. */
  private async handlePressedSimpleVnav(): Promise<void> {
    const listItem = this.props.legData;
    const altitude1Feet = this.props.legData.altitude1.get().asUnit(UnitType.FOOT);
    const fixIcao = listItem.leg.leg.fixIcao;
    const facType = ICAO.getFacilityType(fixIcao);
    let fixElevationMeters: number | undefined;
    if (facType === FacilityType.Airport) {
      const fac = await this.props.fms.facLoader.getFacility(FacilityType.Airport, fixIcao);
      fixElevationMeters = fac.runways[0]?.elevation;
    } else if (facType === FacilityType.RWY) {
      const fac = await this.props.fms.facLoader.getFacility(FacilityType.RWY, fixIcao);
      fixElevationMeters = fac.runway.elevation;
    }

    const result = await this.props.gtcService.openPopup<GtcVnavAltitudeDialog>(GtcViewKeys.VnavAltitudeDialog).ref.request({
      initialAltitudeFeet: isNaN(altitude1Feet) ? 0 : altitude1Feet,
      isAdvancedMode: this.props.gtcService.isAdvancedVnav,
      legName: listItem.leg.name ?? '',
      isDifferentFromPublished: listItem.isAltitudeEdited.get(),
      isDesignatedConstraint: listItem.isAltitudeDesignated.get(),
      publishedAltitudeFeet: listItem.leg.leg.altDesc === AltitudeRestrictionType.Unused ? undefined : this.publishedAltitudeFeet1,
      isFlightLevel: listItem.displayAltitude1AsFlightLevel.get(),
      fixElevationMeters,
    });

    if (!result.wasCancelled) {
      const lateralPlan = this.props.fms.getFlightPlan(this.props.planIndex);
      const indexes = FmsUtils.getLegIndexes(lateralPlan, listItem.leg);
      if (indexes) {
        if (result.payload.result === 'set') {
          this.props.fms.setUserConstraint(indexes.segmentIndex, indexes.segmentLegIndex, result.payload.altitudeFeet, result.payload.isFlightLevel);
        } else if (result.payload.result === 'remove') {
          this.props.fms.setUserConstraint(indexes.segmentIndex, indexes.segmentLegIndex);
        } else if (result.payload.result === 'direct') {
          const targetAltitude = UnitType.FOOT.convertTo(result.payload.altitudeFeet, UnitType.METER);

          const fpa = await this.props.fms.getVerticalDirectRequiredFpa(indexes.globalLegIndex, targetAltitude);

          // If the required FPA is > 6 degrees, then show a dialog prompting the user to accept clamping the FPA
          // to 6 degrees.
          if (fpa !== undefined && fpa > 6) {
            const accept = await GtcDialogs.openMessageDialog(this.props.gtcService, 'Vertical Ð FPA steeper than \n−6.00° limit.\nSet to −6.00°?', true);

            if (!accept) {
              return;
            }
          }

          // If the leg indexes have changed, abort.
          if (lateralPlan.tryGetLeg(indexes.globalLegIndex) !== listItem.leg) {
            return;
          }

          this.props.fms.activateVerticalDirect(indexes.globalLegIndex, targetAltitude, result.payload.isFlightLevel, fpa);
        } else {
          this.props.fms.revertAltitudeConstraint(indexes.segmentIndex, indexes.segmentLegIndex);
        }
      }
    }
  }

  /** Handles the button being pressed in advanced mode. */
  private async handlePressedAdvancedVnav(): Promise<void> {
    this.props.gtcService.openPopup<FlightPlanVnavConstraintSlideoutMenu>(GtcFlightPlanPageViewKeys.VnavConstraint, 'slideout-right')
      .ref.request(this.props.legData);
  }

  /** @inheritdoc */
  public override render(): VNode {
    return (
      <div class={this.classList}>
        <GtcTouchButton
          ref={this.touchButtonRef}
          isInList
          isVisible={this.props.legData.isEditableDisplay}
          onPressed={() => {
            if (this.props.gtcService.isAdvancedVnav) {
              this.handlePressedAdvancedVnav();
            } else {
              this.handlePressedSimpleVnav();
            }
          }}
        />
        <AltitudeConstraintDisplay
          ref={this.altitudeDisplayRef}
          altDesc={this.props.legData.altDescDisplay}
          isEdited={this.props.legData.isAltitudeEditedDisplay}
          isInvalid={this.props.legData.isAltitudeInvalidDisplay}
          altitude1={this.props.legData.altitude1Display}
          altitude2={this.props.legData.altitude2Display}
          displayAltitude1AsFlightLevel={this.props.legData.displayAltitude1AsFlightLevelDisplay}
          displayAltitude2AsFlightLevel={this.props.legData.displayAltitude2AsFlightLevelDisplay}
          isCyan={this.props.legData.isAltitudeCyan}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    super.destroy();

    this.touchButtonRef.getOrDefault()?.destroy();
    this.altitudeDisplayRef.getOrDefault()?.destroy();

    this.subs.forEach(x => x.destroy());
  }
}