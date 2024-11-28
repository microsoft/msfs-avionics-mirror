import { BitFlags, FixTypeFlags, FlightPlanUtils, FSComponent, LegDefinition, LegDefinitionFlags, LegType, VNode } from '@microsoft/msfs-sdk';

import { Fms, FmsUtils } from '@microsoft/msfs-garminsdk';

import { ViewService } from '../ViewService';

import './FPLUtils.css';

import type { MessageDialog } from '../Dialogs/MessageDialog';
/**
 * Utility methods for working with the flight plan display.
 */
export class FPLUtils {
  /**
   * Opens the activate leg dialog.
   * @param fms The flight management system.
   * @param segmentIndex The index of the segment containing the leg to activate.
   * @param segmentLegIndex The index of the leg to activate in its segment.
   * @param viewService The view service to use to open the dialog.
   */
  public static openActivateLegDialog(fms: Fms, segmentIndex: number, segmentLegIndex: number, viewService: ViewService): void {
    if (!fms.canActivateLeg(segmentIndex, segmentLegIndex)) {
      return;
    }

    const plan = fms.hasPrimaryFlightPlan() && fms.getPrimaryFlightPlan();

    if (!plan) {
      return;
    }

    const leg = plan.tryGetLeg(segmentIndex, segmentLegIndex);

    if (!leg) {
      return;
    }

    const selectedLeg = leg;
    const prevLeg = plan.getPrevLeg(segmentIndex, segmentLegIndex);

    const arrow = (
      <svg class='activate-leg-dialog-arrow' viewBox='0 0 28 16'>
        <path d='M 28 8 l -8 -8 l 0 5 l -20 0 l 0 6 l 20 0 l 0 5 l 8 -8 z' fill="magenta" />
      </svg>
    );

    let renderContent;
    if (BitFlags.isAll(leg.flags, LegDefinitionFlags.VectorsToFinalFaf)) {
      const course = Math.round(selectedLeg.leg.course);
      renderContent = (): VNode => {
        return (
          <div class='activate-leg-dialog-msg'>vtf {(course === 0 ? 360 : course).toString().padStart(3, '0')}°{arrow}{FPLUtils.getActivateLegDialogLegText(selectedLeg)}</div>
        );
      };
    } else if (
      leg.leg.type === LegType.CF
      && (!prevLeg || FlightPlanUtils.isDiscontinuityLeg(leg.leg.type) || FlightPlanUtils.isManualDiscontinuityLeg(leg.leg.type))
    ) {
      const course = Math.round(selectedLeg.leg.course);
      renderContent = (): VNode => {
        return (
          <div class='activate-leg-dialog-msg'>crs {(course === 0 ? 360 : course).toString().padStart(3, '0')}°{arrow}{FPLUtils.getActivateLegDialogLegText(selectedLeg)}</div>
        );
      };
    } else {
      const fromLeg = FmsUtils.getNominalFromLeg(plan, segmentIndex, segmentLegIndex);
      renderContent = (): VNode => {
        return (
          <div class='activate-leg-dialog-msg'>{fromLeg ? FPLUtils.getActivateLegDialogLegText(fromLeg) : ''}{arrow}{FPLUtils.getActivateLegDialogLegText(selectedLeg)}</div>
        );
      };
    }

    (viewService.open('MessageDialog', true) as MessageDialog).setInput({
      renderContent,
      hasRejectButton: true,
      confirmButtonText: 'Activate',
      rejectButtonText: 'Cancel'
    }).onAccept.on((sender, accept) => {
      // Get the leg again in case something changed the flight plan while we were waiting on the dialog.

      const legToActivate = plan.tryGetLeg(segmentIndex, segmentLegIndex);

      if (accept && legToActivate !== null && fms.canActivateLeg(segmentIndex, segmentLegIndex)) {
        if (BitFlags.isAll(legToActivate.flags, LegDefinitionFlags.VectorsToFinalFaf)) {
          fms.activateVtf();
        } else {
          fms.activateLeg(segmentIndex, segmentLegIndex, Fms.PRIMARY_PLAN_INDEX, true);
        }
      }
    });
  }

  /**
   * Gets the display text for a flight plan leg as it should appear in the activate leg dialog.
   * @param leg A flight plan leg.
   * @returns The display text for the flight plan leg as it should appear in the activate leg dialog.
   */
  private static getActivateLegDialogLegText(leg: LegDefinition): string {
    const name = leg.name ?? 'NONAME';
    if (BitFlags.isAll(leg.leg.fixTypeFlags, FixTypeFlags.IAF)) {
      return `${name} iaf`;
    } else if (BitFlags.isAll(leg.leg.fixTypeFlags, FixTypeFlags.FAF)) {
      return `${name} faf`;
    } else if (BitFlags.isAll(leg.leg.fixTypeFlags, FixTypeFlags.MAP)) {
      return `${name} map`;
    } else if (BitFlags.isAll(leg.leg.fixTypeFlags, FixTypeFlags.MAHP)) {
      return `${name} mahp`;
    }

    return name;
  }
}