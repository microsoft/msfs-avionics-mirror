import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { ElapsedTime } from '../../../PFD/DCP/ElapsedTime';
import { PfdOrMfd } from '../../Map/MapUserSettings';
import { GuiDialog, GuiDialogProps } from '../../UI/GuiDialog';
import { WaypointAlerter } from '../WaypointAlerter';
import { BearingPointerDataFields } from './BearingPointerDataFields';
import { ElapsedTimeDisplay } from './ElapsedTimeDisplay';
import { NavSourceDataField } from './NavSourceDataField';
import { NavSourcePreset } from './NavSourcePreset';

/** @inheritdoc */
interface LeftInfoPanelProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  // eslint-disable-next-line jsdoc/require-jsdoc
  elapsedTime?: ElapsedTime;
  // eslint-disable-next-line jsdoc/require-jsdoc
  pfdOrMfd: PfdOrMfd;
  // eslint-disable-next-line jsdoc/require-jsdoc
  activeMenu?: Subscribable<GuiDialog<GuiDialogProps> | null>;

  /** A waypoint alerter instance that controls display of waypoint alert flashing. */
  waypointAlerter: WaypointAlerter;
}

/** The LeftInfoPanel component. */
export class LeftInfoPanel extends DisplayComponent<LeftInfoPanelProps> {
  private readonly navSourcePresetRef = FSComponent.createRef<NavSourcePreset>();
  private readonly bearingPointerDataFieldsRef = FSComponent.createRef<BearingPointerDataFields>();
  private readonly versionSubject = Subject.create<number>(-1);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.activeMenu?.sub(x => {
      const isPfdMenuVisible = !!x;
      this.navSourcePresetRef.instance.setVisibility(!isPfdMenuVisible);
      this.bearingPointerDataFieldsRef.instance.setVisibility(!isPfdMenuVisible);
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <NavSourceDataField bus={this.props.bus} waypointAlerter={this.props.waypointAlerter} />

        {this.props.pfdOrMfd === 'PFD' ? <NavSourcePreset bus={this.props.bus} ref={this.navSourcePresetRef} /> : null}

        <BearingPointerDataFields bus={this.props.bus} ref={this.bearingPointerDataFieldsRef} />
        {this.props.elapsedTime &&
          <ElapsedTimeDisplay
            elapsedTimeText={this.props.elapsedTime.elapsedTimeText}
            isVisible={this.props.elapsedTime.elapsedTimeIsVisibile}
          />


        }
      </>
    );
  }
}