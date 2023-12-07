import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { ElapsedTime } from '../../../PFD/DCP/ElapsedTime';
import { DisplayUnitLayout } from '../../Config/DisplayUnitConfig';
import { GuiDialog, GuiDialogProps } from '../../UI/GuiDialog';
import { WT21DisplayUnitFsInstrument, WT21DisplayUnitType } from '../../WT21DisplayUnitFsInstrument';
import { FormatSwitch } from '../RightInfoPanel/FormatSwitch';
import { WaypointAlerter } from '../WaypointAlerter';
import { BearingPointerDataFields } from './BearingPointerDataFields';
import { ElapsedTimeDisplay } from './ElapsedTimeDisplay';
import { NavSourceDataField } from './NavSourceDataField';
import { NavSourcePreset } from './NavSourcePreset';

/** @inheritdoc */
interface LeftInfoPanelProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The display unit */
  displayUnit: WT21DisplayUnitFsInstrument;

  /** The elapsed time state */
  elapsedTime?: ElapsedTime;

  /** A subscribable to the active menu */
  activeMenu?: Subscribable<GuiDialog<GuiDialogProps> | null>;

  /** A waypoint alerter instance that controls display of waypoint alert flashing. */
  waypointAlerter: WaypointAlerter;
}

/** The LeftInfoPanel component. */
export class LeftInfoPanel extends DisplayComponent<LeftInfoPanelProps> {
  private readonly navSourcePresetRef = FSComponent.createRef<NavSourcePreset>();
  private readonly bearingPointerDataFieldsRef = FSComponent.createRef<BearingPointerDataFields>();

  private readonly isUsingSoftkeys = this.props.displayUnit.displayUnitConfig.displayUnitLayout === DisplayUnitLayout.Softkeys;

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

        {this.props.displayUnit.displayUnitType === WT21DisplayUnitType.Mfd && this.isUsingSoftkeys && (
          <FormatSwitch bus={this.props.bus} displayUnit={this.props.displayUnit} format="upper" orientation="left" />
        )}

        {this.props.displayUnit.displayUnitType === WT21DisplayUnitType.Pfd && (
          <NavSourcePreset
            bus={this.props.bus}
            ref={this.navSourcePresetRef}
            displayUnitLayout={this.props.displayUnit.displayUnitConfig.displayUnitLayout}
          />
        )}

        <BearingPointerDataFields bus={this.props.bus} ref={this.bearingPointerDataFieldsRef} />
        {this.props.elapsedTime &&
          <ElapsedTimeDisplay
            elapsedTimeText={this.props.elapsedTime.elapsedTimeText}
            isVisible={this.props.elapsedTime.elapsedTimeIsVisibile}
            displayUnitLayout={this.props.displayUnit.displayUnitConfig.displayUnitLayout}
          />
        }
      </>
    );
  }
}