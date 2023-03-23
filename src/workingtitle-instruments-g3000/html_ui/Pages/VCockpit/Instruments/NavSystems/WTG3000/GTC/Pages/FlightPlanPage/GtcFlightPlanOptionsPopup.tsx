import { FSComponent, MutableSubscribable, StringUtils, VNode } from '@microsoft/msfs-sdk';
import { Fms, ToggleTouchButton, TouchButton } from '@microsoft/msfs-garminsdk';
import { GtcMessageDialog } from '../../Dialog/GtcMessageDialog';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcKeyboardDialog } from '../../Dialog/GtcKeyboardDialog';

import './GtcFlightPlanOptionsPopup.css';
import { GtcFlightPlanPageViewKeys } from './FlightPlanPageTypes';

/**
 * Component props for GtcFlightPlanOptionsPopup.
 */
export interface GtcFlightPlanOptionsPopupProps extends GtcViewProps {
  /** The index of the flight plan controlled by the popup. */
  planIndex: number;

  /** The FMS instance. */
  fms: Fms;

  /** A mutable subscribable which controls whether to show the flight plan preview. */
  showOnMap: MutableSubscribable<boolean>
}

/**
 * A GTC flight plan options popup.
 */
export class GtcFlightPlanOptionsPopup extends GtcView<GtcFlightPlanOptionsPopupProps> {
  private thisNode?: VNode;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Flight Plan Options');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='flight-plan-options gtc-popup-panel'>
        <div class='flight-plan-options-row'>
          <ToggleTouchButton
            state={this.props.showOnMap}
            label={'Show On Map'}
          />
          <TouchButton
            label={'Map Settings'}
            onPressed={() => this.gtcService.changePageTo(GtcViewKeys.MapSettings)}
          />
          <TouchButton
            label={'Copy to\nStandby'}
            isEnabled={false}
          />
        </div>
        <div class='flight-plan-options-row'>
          <TouchButton
            label={'Flight Plan\nCatalog'}
            isEnabled={false}
          />
          <TouchButton
            label={'Store'}
            isEnabled={false}
          />
          <TouchButton
            label={'Rename'}
            onPressed={async (): Promise<void> => {
              const result = await this.props.gtcService.openPopup<GtcKeyboardDialog<string>>(
                GtcViewKeys.KeyboardDialog, 'normal', 'hide').ref.request({
                  label: 'Route Comment',
                  allowSpaces: true,
                  maxLength: 20,
                });
              if (result.wasCancelled) { return; }

              const trimmed = StringUtils.trimEnd(result.payload);
              if (trimmed.length > 0) {
                this.props.fms.setFlightPlanName(this.props.planIndex, trimmed);
              } else {
                this.props.fms.deleteFlightPlanName(this.props.planIndex);
              }
            }}
          />
        </div>
        <div class='flight-plan-options-row'>
          <TouchButton
            label={'Delete Flight\nPlan'}
            onPressed={async () => {
              const result = await this.props.gtcService
                .openPopup<GtcMessageDialog>(GtcViewKeys.MessageDialog1)
                .ref.request({
                  message: 'Delete all waypoints in flight\nplan?',
                  showRejectButton: true,
                  acceptButtonLabel: 'OK',
                  rejectButtonLabel: 'Cancel',
                });
              if (!result.wasCancelled && result.payload === true) {
                // TODO Need a function to empty any plan index
                await this.props.fms.deletePrimaryFlightPlan();
                this.props.gtcService.goBack();
              }
            }}
          />
          <TouchButton
            label={'Invert'}
            isEnabled={false}
          />
          <TouchButton
            label={'Closest Point\nof Flight Plan'}
            isEnabled={false}
          />
        </div>
        <div class='flight-plan-options-row'>
          <TouchButton
            label={'APPR WPT\nTEMP COMP'}
            isEnabled={false}
          />
          {this.gtcService.isAdvancedVnav !== true &&
            <TouchButton
              label={'Edit Data\nFields'}
              onPressed={() => this.gtcService.changePageTo(GtcFlightPlanPageViewKeys.DataFields)}
            />
          }
          <TouchButton
            label={'Parallel Track'}
            isEnabled={false}
          />
        </div>
        <div class='flight-plan-options-row'>
          <TouchButton
            label={'Hold at P.POS'}
            isEnabled={false}
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}