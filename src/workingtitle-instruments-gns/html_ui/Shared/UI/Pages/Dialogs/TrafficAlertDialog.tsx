import { FSComponent, Vec2Math, Vec2Subject, VNode } from '@microsoft/msfs-sdk';

import { TrafficSystem } from '@microsoft/msfs-garminsdk';

import { TrafficDisplay } from '../Map/TrafficDisplay';
import { PageProps, ViewService } from '../Pages';
import { Dialog } from './Dialog';
import { InteractionEvent } from '../../InteractionEvent';

import './TrafficAlertDialog.css';

/**
 * Props on the TrafficAlertDialog dialog.
 */
interface TrafficAlertDialogProps extends PageProps {
  /** The traffic system to source traffic data from. */
  trafficSystem: TrafficSystem;
}

/**
 * A dialog that pops up when a traffic alert is issued and
 * the user is not on the traffic map page.
 */
export class TrafficAlertDialog extends Dialog<TrafficAlertDialogProps> {
  private readonly trafficDisplay = FSComponent.createRef<TrafficDisplay>();

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    if (evt === InteractionEvent.ENT) {
      ViewService.back();
      ViewService.open('NAV', true, 3);
    }

    if (evt === InteractionEvent.CLR) {
      ViewService.back();
    }

    return true;
  }

  /** @inheritdoc */
  public onSuspend(): void {
    super.onSuspend();
    this.trafficDisplay.instance.sleep();
  }

  /** @inheritdoc */
  public onResume(): void {
    super.onResume();
    this.trafficDisplay.instance.wake();
  }

  /** @inheritdoc */
  protected renderDialog(): VNode {
    return (
      <div class='tfc-alert-dialog'>
        <div class='tfc-alert-dialog-map'>
          <TrafficDisplay bus={this.props.bus} trafficSystem={this.props.trafficSystem} gnsType={this.props.gnsType} ref={this.trafficDisplay}
            size={Vec2Subject.create(this.props.gnsType === 'wt430' ? Vec2Math.create(130, 114) : Vec2Math.create(120, 120))} />
        </div>
        <hr />
        <div><span class='tfc-alert-dialog-button'>ENT</span> - TRFC PAGE</div>
        <div><span class='tfc-alert-dialog-button'>CLR</span> - PREV PAGE</div>
      </div>
    );
  }
}