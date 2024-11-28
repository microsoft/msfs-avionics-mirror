import { FSComponent, LegType, Subject, VNode } from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

import { SelectableText } from '../../Controls/SelectableText';
import { LegIcon } from '../Map/LegIcon';
import { WaypointLeg } from '../Map/WaypointLeg';
import { PageProps, ViewService } from '../Pages';
import { Dialog } from './Dialog';

import './ActivateLeg.css';

/**
 * The props for an Activate Leg dialog.
 */
export interface ActiveLegDialogProps extends PageProps {
  /** The FMS */
  fms: Fms
}

/**
 * A confirmation dialog for activating a future leg in the flight plan.
 */
export class ActivateLegDialog extends Dialog<ActiveLegDialogProps> {
  private readonly activatePromptContainer = FSComponent.createRef<HTMLDivElement>();
  private readonly activatePrompt = FSComponent.createRef<SelectableText>();
  private readonly fromWaypoint = FSComponent.createRef<WaypointLeg>();
  private readonly toWaypoint = FSComponent.createRef<WaypointLeg>();
  private readonly legIcon = FSComponent.createRef<LegIcon>();
  private readonly headerText = Subject.create('');
  private targetLegIndex = -1;

  /**
   * Set the index for the target leg.
   * @param idx The global index of the leg to activate.
   */
  public set legIndex(idx: number) {
    this.targetLegIndex = idx;
    if (idx >= 0) {
      const plan = this.props.fms.getPrimaryFlightPlan();
      const toLeg = plan.tryGetLeg(idx);
      const fromLeg = plan.tryGetLeg(idx - 1);
      this.toWaypoint.instance.setLeg(toLeg);
      this.fromWaypoint.instance.setLeg(fromLeg);
      if (toLeg !== null) {
        if (fromLeg === null) {
          // We can't rely on direct to state, because everything is a direct to when this runs.
          this.headerText.set('Direct To');
          this.legIcon.instance.updateLegIcon(true, true, toLeg.leg.type, toLeg.leg.turnDirection);
        } else {
          this.headerText.set('Fly Leg');
          this.legIcon.instance.updateLegIcon(true, false, toLeg.leg.type, toLeg.leg.turnDirection);
        }
      } else {
        this.legIcon.instance.updateLegIcon(true, false, LegType.TF);
      }
    }
  }

  /**
   * Get the target leg index.
   * @returns The global index of the set target leg.
   */
  public get legIndex(): number {
    return this.targetLegIndex;
  }

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.toWaypoint.instance.setDisabled(true);
    this.fromWaypoint.instance.setDisabled(true);
  }

  /** @inheritdoc */
  protected renderDialog(): VNode {
    return (
      <div class="activate-leg-dialog">
        <h2 class="cyan">ACTIVATE LEG</h2>
        <div class='activate-leg-dialog-middle'>
          <p class='activate-leg-header'>{this.headerText}</p>
          <p>
            <WaypointLeg ref={this.fromWaypoint} class='activate-leg-waypoints-from' isArcMap={true} nullIsBlank={true} />
            <LegIcon ref={this.legIcon} />
            <WaypointLeg ref={this.toWaypoint} class='activate-leg-waypoints-to' isArcMap={true} nullIsBlank={true} />
          </p>
        </div>
        <div class="activate-leg-row">
          <div ref={this.activatePromptContainer} class="activate-leg-confirm">
            <div class="activate-leg-spacer" />
            <SelectableText
              ref={this.activatePrompt}
              class="activate-leg-prompt"
              selectedClass='selected-white'
              data={Subject.create('Activate?')}
              onEnt={() => {
                const plan = this.props.fms.getPrimaryFlightPlan();
                this.props.fms.activateLeg(
                  plan.getSegmentIndex(this.legIndex),
                  plan.getSegmentLegIndex(this.legIndex),
                  Fms.PRIMARY_PLAN_INDEX,
                  true
                );
                ViewService.back();
                ViewService.back();
                ViewService.back();  // for dtodto
                return true;
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}