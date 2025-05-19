import {
  VNode, FSComponent, Subject, Subscription, SpeedUnit, SpeedRestrictionType,
  VerticalFlightPhase, MappedSubject, AltitudeRestrictionType, SubscribableUtils,
} from '@microsoft/msfs-sdk';
import { Fms, FmsUtils, UnitsUserSettings } from '@microsoft/msfs-garminsdk';
import { FlightPlanStore, FlightPlanLegData, FpaDisplay, SpeedConstraintDisplay } from '@microsoft/msfs-wtg3000-common';
import { GtcViewProps, GtcView } from '../../GtcService/GtcView';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcVnavFlightPathAngleDialog } from '../../Dialog/GtcVnavFlightPathAngleDialog';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcSpeedConstraintDialog } from '../../Dialog/GtcSpeedConstraintDialog';
import './FlightPlanFpaSpeedSlideoutMenu.css';

/** The properties for the {@link FlightPlanFpaSpeedSlideoutMenu} component. */
export interface FlightPlanFpaSpeedSlideoutMenuProps extends GtcViewProps {
  /** An instance of the Fms. */
  fms: Fms;
  /** The flight plan store. */
  store: FlightPlanStore;
}

/** Displays the loaded procedures and links to the procedure pages. */
export class FlightPlanFpaSpeedSlideoutMenu extends GtcView<FlightPlanFpaSpeedSlideoutMenuProps> {
  private thisNode?: VNode;

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.bus);

  private readonly legListData = Subject.create<FlightPlanLegData | undefined>(undefined);

  private readonly legFpa = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);
  private readonly isFpaEdited = Subject.create(false);

  private readonly speed = Subject.create(0);
  private readonly speedUnit = Subject.create(SpeedUnit.IAS);
  private readonly speedDesc = Subject.create(SpeedRestrictionType.Unused);
  private readonly isAltitudeDesignated = Subject.create(false);
  private readonly isAltitudeEditable = Subject.create(false);
  private readonly altDesc = Subject.create(AltitudeRestrictionType.Unused);
  private readonly vnavPhase = Subject.create(VerticalFlightPhase.Climb);

  private readonly displayFpa = MappedSubject.create(
    ([fpa, isAltitudeEditable]): number => isAltitudeEditable ? fpa : NaN,
    SubscribableUtils.NUMERIC_NAN_EQUALITY,
    this.legFpa,
    this.isAltitudeEditable
  );

  private readonly pipes = [] as Subscription[];

  private readonly showClimb = MappedSubject.create(([vnavPhase, isAltitudeDesignated, isAltitudeEditable]) => {
    return isAltitudeDesignated && vnavPhase === VerticalFlightPhase.Climb && isAltitudeEditable;
  }, this.vnavPhase, this.isAltitudeDesignated, this.isAltitudeEditable);


  private readonly isFpaButtonEnabled = MappedSubject.create(([showClimb, isAltitudeDesignated, altDesc, isAltitudeEditable]) => {
    return showClimb === false && isAltitudeDesignated === true && altDesc !== AltitudeRestrictionType.Between && isAltitudeEditable;
  }, this.showClimb, this.isAltitudeDesignated, this.altDesc, this.isAltitudeEditable);

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Active Flight Plan');
  }

  /**
   * Pass initial leg list data to use.
   * @param legListData The leg list data.
   */
  public request(legListData: FlightPlanLegData): void {
    this.legListData.set(legListData);

    this.pipes.forEach(x => x.destroy());

    this.pipes.push(legListData.fpa.pipe(this.legFpa));
    this.pipes.push(legListData.isFpaEdited.pipe(this.isFpaEdited));
    this.pipes.push(legListData.speed.pipe(this.speed));
    this.pipes.push(legListData.speedUnit.pipe(this.speedUnit));
    this.pipes.push(legListData.speedDesc.pipe(this.speedDesc));
    this.pipes.push(legListData.isAltitudeDesignated.pipe(this.isAltitudeDesignated));
    this.pipes.push(legListData.isAltitudeEditable.pipe(this.isAltitudeEditable));
    this.pipes.push(legListData.altDesc.pipe(this.altDesc));

    this.vnavPhase.set(legListData.vnavPhase.get());
  }

  /** @inheritdoc */
  public onClose(): void {
    this.pipes.forEach(x => x.destroy());
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='gtc-popup-panel gtc-slideout fpa-speed-slideout-menu'>
        <GtcTouchButton
          class="touch-button-value"
          isEnabled={this.isFpaButtonEnabled}
          onPressed={async () => {
            const legListData = this.legListData.get();
            if (!legListData) { return; }

            let fpa = this.displayFpa.get();
            if (isNaN(fpa)) {
              fpa = 0;
            }

            const result = await this.props.gtcService.openPopup<GtcVnavFlightPathAngleDialog>(GtcViewKeys.VnavFlightPathAngleDialog).ref.request({
              initialValue: fpa * 100,
              showRemoveButton: legListData.isFpaEdited.get(),
            });

            if (!result.wasCancelled) {
              const indexes = FmsUtils.getLegIndexes(this.props.fms.getFlightPlan(legListData.planIndex), legListData.leg);
              if (indexes) {
                if (Number.isNaN(result.payload)) {
                  // Remove
                  this.props.fms.setUserFpa(legListData.planIndex, indexes.segmentIndex, indexes.segmentLegIndex, undefined);
                } else {
                  // Set
                  this.props.fms.setUserFpa(legListData.planIndex, indexes.segmentIndex, indexes.segmentLegIndex, result.payload / 100);
                }
                this.gtcService.goBack();
              }
            }
          }}
        >
          <div class='touch-button-label'>Flight Path Angle</div>
          <div class='touch-button-value-value'>
            <FpaDisplay
              fpa={this.displayFpa}
              isEdited={this.isFpaEdited}
              showClimb={this.showClimb}
            />
          </div>
        </GtcTouchButton>
        <GtcTouchButton
          class="touch-button-value"
          onPressed={async () => {
            const legListData = this.legListData.get();
            if (!legListData) { return; }

            const leg = legListData.leg;

            const speed = this.speed.get();
            const speedDesc = this.speedDesc.get();

            const result = await this.props.gtcService.openPopup<GtcSpeedConstraintDialog>(GtcViewKeys.SpeedConstraintDialog).ref.request({
              initialSpeed: speed,
              initialSpeedUnit: legListData.speedUnit.get(),
              initialSpeedDesc: speedDesc,
              publishedSpeedIas: leg.leg.speedRestrictionDesc === SpeedRestrictionType.Unused ? undefined : leg.leg.speedRestriction,
              publishedSpeedDesc: leg.leg.speedRestrictionDesc,
              allowRemove: legListData.speedDesc.get() !== SpeedRestrictionType.Unused,
              isDifferentFromPublished: legListData.isSpeedEdited.get(),
            });

            if (result.wasCancelled) { return; }

            const indexes = FmsUtils.getLegIndexes(this.props.fms.getFlightPlan(legListData.planIndex), leg);

            if (!indexes) { return; }

            const payload = result.payload;

            if (payload.result === 'remove') {
              this.props.fms.setUserSpeedConstraint(legListData.planIndex, indexes.segmentIndex, indexes.segmentLegIndex);
            } else if (payload.result === 'revert') {
              this.props.fms.revertSpeedConstraint(legListData.planIndex, indexes.segmentIndex, indexes.segmentLegIndex);
            } else {
              this.props.fms.setUserSpeedConstraint(legListData.planIndex, indexes.segmentIndex, indexes.segmentLegIndex, payload.speed, payload.speedUnit, payload.speedDesc);
            }

            this.gtcService.goBack();
          }}
        >
          <div class='touch-button-label'>Speed Constraint</div>
          <div class='touch-button-value-value'>
            <SpeedConstraintDisplay
              speed={this.speed}
              speedUnit={this.speedUnit}
              speedDesc={this.speedDesc}
              userSpeedUnitsSetting={this.unitsSettingManager.speedUnits}
            />
          </div>
        </GtcTouchButton>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}
